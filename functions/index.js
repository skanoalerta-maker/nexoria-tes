import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import fetch from "node-fetch";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const mpAccessToken = defineSecret("MP_ACCESS_TOKEN");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "https://skanoalerta-maker.github.io/nexoria-tes"
).replace(/\/$/, "");

const WEBHOOK_URL =
  process.env.WEBHOOK_URL ||
  "https://api-mvtstimkcq-uc.a.run.app/webhook";

/**
 * Limpia títulos para evitar problemas de encoding en Mercado Pago.
 * En tu web puedes mostrar "Código Nébula", pero a MP conviene enviar texto plano.
 */
function sanitizeTitle(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[—–]/g, "-")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Nebula functions working",
  });
});

app.get("/create-preference", (req, res) => {
  res.status(405).json({
    ok: false,
    error: "Metodo no permitido. Usa POST para crear la preferencia.",
  });
});

app.post("/create-preference", async (req, res) => {
  try {
    const MP_ACCESS_TOKEN = mpAccessToken.value();

    if (!MP_ACCESS_TOKEN) {
      return res.status(500).json({
        ok: false,
        error: "Mercado Pago no esta configurado en el backend.",
      });
    }

    const {
      title,
      price,
      quantity = 1,
      type = "single_purchase", // single_purchase | premium
      novelId = null,           // obligatorio solo para compra individual
      userId = null,
      email = null,
    } = req.body || {};

    if (!title || price === undefined || price === null) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos obligatorios: title y price.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Debes iniciar sesion para comprar.",
      });
    }

    // Compra individual requiere novelId. Premium no.
    if (type !== "premium" && !novelId) {
      return res.status(400).json({
        ok: false,
        error: "Falta novelId para la compra individual.",
      });
    }

    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        ok: false,
        error: "price debe ser un numero mayor a 0.",
      });
    }

    if (!Number.isInteger(numericQuantity) || numericQuantity <= 0) {
      return res.status(400).json({
        ok: false,
        error: "quantity debe ser un entero mayor a 0.",
      });
    }

    const safeTitle = sanitizeTitle(title);

    const externalReference = [
      type || "purchase",
      novelId || "premium",
      userId,
      Date.now(),
    ].join("_");

    const mpBody = {
      items: [
        {
          title: safeTitle,
          quantity: numericQuantity,
          unit_price: numericPrice,
          currency_id: "CLP",
        },
      ],
      external_reference: externalReference,
      back_urls: {
        success: `${FRONTEND_URL}/?mp_status=success`,
        failure: `${FRONTEND_URL}/?mp_status=failure`,
        pending: `${FRONTEND_URL}/?mp_status=pending`,
      },
      auto_return: "approved",
      notification_url: WEBHOOK_URL,
      metadata: {
        type,
        novelId,
        userId,
        email,
      },
    };

    // Solo manda payer si hay email
    if (email) {
      mpBody.payer = {
        email: String(email),
      };
    }

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(mpBody),
    });

    const result = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", result);
      return res.status(500).json({
        ok: false,
        error: "No se pudo crear la preferencia de pago.",
        detail: result,
      });
    }

    await db.collection("mp_preferences").add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      originalTitle: title,
      safeTitle,
      price: numericPrice,
      quantity: numericQuantity,
      type,
      novelId,
      userId,
      email,
      externalReference,
      preferenceId: result.id || null,
      initPoint: result.init_point || null,
      sandboxInitPoint: result.sandbox_init_point || null,
      status: "created",
      mpRawResponse: result || null,
    });

    return res.status(200).json({
      ok: true,
      preferenceId: result.id,
      initPoint: result.init_point,
      init_point: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      sandbox_init_point: result.sandbox_init_point,
      externalReference,
    });
  } catch (error) {
    console.error("Error creando preferencia:", error);

    return res.status(500).json({
      ok: false,
      error: "No se pudo crear la preferencia de pago.",
      detail: error?.message || "Error desconocido",
    });
  }
});

async function getMercadoPagoPayment(paymentId, accessToken) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    result,
  };
}

async function processApprovedPayment(paymentData) {
  const paymentId = String(paymentData.id || "");
  const status = paymentData.status || null;
  const statusDetail = paymentData.status_detail || null;
  const externalReference = paymentData.external_reference || null;
  const metadata = paymentData.metadata || {};

  const type = metadata.type || "single_purchase";
  const novelId = metadata.novelId || null;
  const userId = metadata.userId || null;
  const email = metadata.email || paymentData.payer?.email || null;
  const amount = Number(paymentData.transaction_amount || 0);

  if (!paymentId) {
    throw new Error("paymentId no encontrado en el pago.");
  }

  const paymentRef = db.collection("payments").doc(paymentId);
  const existingPayment = await paymentRef.get();

  // Evita reprocesar el mismo pago
  if (existingPayment.exists && existingPayment.data()?.processed === true) {
    return { alreadyProcessed: true };
  }

  await paymentRef.set(
    {
      paymentId,
      provider: "mercado_pago",
      status,
      statusDetail,
      type,
      novelId,
      userId,
      email,
      amount,
      externalReference,
      preferenceId: paymentData.order?.id || null,
      payerId: paymentData.payer?.id || null,
      raw: paymentData,
      processed: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Si no esta aprobado, solo registramos estado
  if (status !== "approved") {
    await paymentRef.set(
      {
        processed: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { approved: false };
  }

  if (!userId) {
    throw new Error("userId no encontrado en metadata.");
  }

  // Compra individual: desbloquea solo esa novela
  if (type === "single_purchase" || type === "novel") {
    if (!novelId) {
      throw new Error("novelId no encontrado en metadata.");
    }

    await db.collection("users").doc(userId).set(
      {
        purchasedNovels: admin.firestore.FieldValue.arrayUnion(novelId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  // Premium: activa acceso total
  if (type === "premium") {
    await db.collection("users").doc(userId).set(
      {
        plan: "premium",
        subscription: "premium",
        premiumActive: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await paymentRef.set(
    {
      processed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db.collection("mp_payment_events").add({
    paymentId,
    userId,
    novelId,
    type,
    status,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { approved: true, userId, novelId, type };
}

app.post("/webhook", async (req, res) => {
  try {
    const MP_ACCESS_TOKEN = mpAccessToken.value();

    await db.collection("mp_webhooks").add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      body: req.body || null,
      query: req.query || null,
      headers: {
        "x-signature": req.headers["x-signature"] || null,
        "x-request-id": req.headers["x-request-id"] || null,
      },
    });

    if (!MP_ACCESS_TOKEN) {
      console.error("MP_ACCESS_TOKEN no configurado.");
      return res.status(200).send("ok");
    }

    const topic =
      req.body?.type ||
      req.query?.type ||
      req.body?.topic ||
      req.query?.topic ||
      null;

    const paymentId =
      req.body?.data?.id ||
      req.query?.["data.id"] ||
      req.body?.id ||
      req.query?.id ||
      null;

    if (!paymentId) {
      return res.status(200).send("ok");
    }

    // Ignora otros eventos que no sean paymentconst WEBHOOK_URL =
    if (topic && topic !== "payment") {
      return res.status(200).send("ok");
    }

    const mpPayment = await getMercadoPagoPayment(paymentId, MP_ACCESS_TOKEN);

    if (!mpPayment.ok) {
      console.error("No se pudo consultar el pago en MP:", mpPayment.result);
      return res.status(200).send("ok");
    }

    await processApprovedPayment(mpPayment.result);

    return res.status(200).send("ok");
  } catch (error) {
    console.error("Error en webhook:", error);
    return res.status(200).send("ok");
  }
});

export const api = onRequest(
  {
    cors: true,
    secrets: [mpAccessToken],
  },
  app
);
