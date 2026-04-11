(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyDccMk1KLoCwXWG2g4r1sOI6qEt_7d5gTw",
    authDomain: "dyh-nebula.firebaseapp.com",
    projectId: "dyh-nebula",
    storageBucket: "dyh-nebula.firebasestorage.app",
    messagingSenderId: "230506596749",
    appId: "1:230506596749:web:d7ffcf38de039c9629d5c4"
  };

  const API_BASE = "https://api-mvtstimkcq-uc.a.run.app";

  let firebaseReady = null;

  async function getFirebase() {
    if (firebaseReady) return firebaseReady;

    firebaseReady = (async () => {
      const [
        appMod,
        authMod,
        firestoreMod
      ] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js")
      ]);

      const { initializeApp, getApps, getApp } = appMod;
      const { getAuth } = authMod;
      const { getFirestore, doc, getDoc } = firestoreMod;

      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);

      return { auth, db, doc, getDoc };
    })();

    return firebaseReady;
  }

  function normalizeNovelId(novelId) {
    return novelId ? String(novelId).replace(/-t\d+$/i, "") : null;
  }

  function getChapterNumberFromPath() {
    const match = window.location.pathname.match(/capitulo(\d+)\.html/i);
    return match ? Number(match[1]) : 1;
  }

  function getNovelIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function getNovelIdFromPath() {
    const path = window.location.pathname.toLowerCase();

    if (path.includes("/futurista/codigo-nebula/")) {
      if (path.includes("/temporada2/")) return "codigo-nebula-t2";
      return "codigo-nebula-t1";
    }

    if (path.includes("/romance/no-debi-enamorarme/")) {
      if (path.includes("/temporada2/")) return "no-debi-enamorarme-t2";
      return "no-debi-enamorarme-t1";
    }

    if (path.includes("/romance/despues-de-tu-adios/")) {
      return "despues-de-tu-adios-t1";
    }

    if (path.includes("/terror/la-ultima-conexion/")) {
      return "la-ultima-conexion-t1";
    }

    if (path.includes("/terror/ya-habias-estado-ahi/")) {
      return "ya-habias-estado-ahi-t1";
    }

    if (path.includes("/allende/")) {
      return "allende-t1";
    }

    if (path.includes("/pinochet/")) {
      return "pinochet-t1";
    }

    if (
      path.includes("/thriller de corrupción/el precio del silencio/") ||
      path.includes("/thriller de corrupci#u00f3n/el precio del silencio/")
    ) {
      return "el-precio-del-silencio-t1";
    }

    if (
      path.includes("/thriller de corrupción/codigos-de-calle/") ||
      path.includes("/thriller de corrupci#u00f3n/codigos-de-calle/")
    ) {
      return "codigos-de-calle-t1";
    }

    if (path.includes("/accion/mision-peligrosa/")) {
      return "mision-peligrosa-t1";
    }

    if (path.includes("/comedia/suegro-a-la-deriva/")) {
      return "suegro-a-la-deriva-t1";
    }

    if (path.includes("/futurista/area51_protocolo_oculto/")) {
      return "area51-protocolo-oculto-t1";
    }

    return null;
  }

  function getNovelId() {
    return getNovelIdFromQuery() || getNovelIdFromPath();
  }

  function getAppBasePath() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("/nexoria-tes/")) return "/nexoria-tes";
    if (path.includes("/nexoria/")) return "/nexoria";
    if (path.includes("/nebula/")) return "/nebula";
    return "";
  }

  function getCoverPaths(basePath) {
    return [
      `${basePath}/assets/covers/allende_portada_nebula.png`,
      `${basePath}/assets/covers/pinochet_nebula_portada.png`,
      `${basePath}/assets/covers/codigo-nebula-t2.jpg`,
      `${basePath}/assets/covers/nebula.jpg`,
      `${basePath}/assets/covers/la-ultima-conexion.jpg`,
      `${basePath}/assets/covers/ya-habias-estado-ahi.jpg`,
      `${basePath}/assets/covers/despues-de-tu-adios.jpg`,
      `${basePath}/assets/covers/no-debi-enamorarme.jpg`,
      `${basePath}/assets/covers/no-debi-enamorarme-t2.jpg`,
      `${basePath}/assets/covers/bajo-la-misma-lluvia.jpg`
    ];
  }

  function getPricing(novelId) {
    const premium = {
      before: "$6.990",
      now: "$4.990"
    };

    const defaultNovel = {
      before: "$1.500",
      now: "$990"
    };

    const perNovel = {
      "codigo-nebula-t1": { before: "$1.500", now: "$990" },
      "codigo-nebula-t2": { before: "$1.500", now: "$990" },
      "no-debi-enamorarme-t1": { before: "$1.500", now: "$990" },
      "no-debi-enamorarme-t2": { before: "$1.500", now: "$990" },
      "despues-de-tu-adios-t1": { before: "$1.500", now: "$990" },
      "la-ultima-conexion-t1": { before: "$1.500", now: "$990" },
      "ya-habias-estado-ahi-t1": { before: "$1.500", now: "$990" },
      "allende-t1": { before: "$1.500", now: "$990" },
      "pinochet-t1": { before: "$1.500", now: "$990" },
      "el-precio-del-silencio-t1": { before: "$1.500", now: "$990" },
      "codigos-de-calle-t1": { before: "$1.500", now: "$990" },
      "mision-peligrosa-t1": { before: "$1.500", now: "$990" },
      "suegro-a-la-deriva-t1": { before: "$1.500", now: "$990" },
      "area51-protocolo-oculto-t1": { before: "$1.500", now: "$990" }
    };

    return {
      premium,
      individual: perNovel[novelId] || defaultNovel
    };
  }

  function getNovelTitle(novelId) {
    const titles = {
      "codigo-nebula-t1": "Código Nébula — Temporada 1",
      "codigo-nebula-t2": "Código Nébula — Temporada 2",
      "no-debi-enamorarme-t1": "No debí enamorarme — Temporada 1",
      "no-debi-enamorarme-t2": "No debí enamorarme — Temporada 2",
      "despues-de-tu-adios-t1": "Después de tu adiós — Temporada 1",
      "la-ultima-conexion-t1": "La última conexión — Temporada 1",
      "ya-habias-estado-ahi-t1": "Ya habías estado ahí — Temporada 1",
      "allende-t1": "Allende — Temporada 1",
      "pinochet-t1": "Pinochet — Temporada 1",
      "el-precio-del-silencio-t1": "El precio del silencio — Temporada 1",
      "codigos-de-calle-t1": "Códigos de calle — Temporada 1",
      "mision-peligrosa-t1": "Misión Peligrosa — Temporada 1",
      "suegro-a-la-deriva-t1": "Suegro a la deriva — Temporada 1",
      "area51-protocolo-oculto-t1": "Area 51 — El Protocolo Oculto — Temporada 1"
    };

    return titles[novelId] || "Novela Nébula";
  }

  function buildCollageColumns(covers) {
    const col1 = [covers[0], covers[3], covers[6], covers[9]];
    const col2 = [covers[1], covers[4], covers[7], covers[2]];
    const col3 = [covers[5], covers[8], covers[0], covers[4]];

    function buildColumn(items, extraClass) {
      return `
        <div class="nebula-collage-column ${extraClass}">
          ${items.concat(items).map(src => `
            <div class="nebula-collage-card">
              <img
                src="${src}"
                alt=""
                loading="eager"
                decoding="async"
                onerror="this.style.display='none'; this.parentElement.style.background='rgba(255,255,255,.06)';"
              />
            </div>
          `).join("")}
        </div>
      `;
    }

    return `
      <div class="nebula-collage-grid">
        ${buildColumn(col1, "speed-a")}
        ${buildColumn(col2, "speed-b")}
        ${buildColumn(col3, "speed-c")}
      </div>
    `;
  }

  function getFallbackUserState() {
    try {
      const raw = localStorage.getItem("nebula-user-profile");
      const parsed = raw ? JSON.parse(raw) : null;

      const plan = String(parsed?.plan || "free").toLowerCase();
      const subscription = String(parsed?.subscription || plan || "free").toLowerCase();

      return {
        isLogged: !!parsed,
        isPremium:
          parsed?.premiumActive === true ||
          plan === "premium" ||
          subscription === "premium",
        plan,
        subscription,
        premiumActive: parsed?.premiumActive === true,
        unlockedNovels: Array.isArray(parsed?.unlockedNovels)
          ? parsed.unlockedNovels.map(normalizeNovelId).filter(Boolean)
          : [],
        coins: Number(parsed?.coins || 0),
        uid: parsed?.uid || null,
        email: parsed?.email || null,
        name: parsed?.name || "Mi espacio",
        icon: parsed?.icon || "🌌"
      };
    } catch {
      return {
        isLogged: false,
        isPremium: false,
        plan: "free",
        subscription: "free",
        premiumActive: false,
        unlockedNovels: [],
        coins: 0,
        uid: null,
        email: null,
        name: "Mi espacio",
        icon: "🌌"
      };
    }
  }

  function syncLocalProfile(user, data) {
    try {
      const existing = getFallbackUserState();

      const payload = {
        uid: user?.uid || existing.uid || "",
        email: user?.email || data?.email || existing.email || "",
        name: data?.name || user?.displayName || existing.name || "Mi espacio",
        icon: data?.avatar || existing.icon || "🌌",
        plan: String(data?.plan || existing.plan || "free").toLowerCase(),
        subscription: String(data?.subscription || data?.plan || existing.subscription || "free").toLowerCase(),
        premiumActive: data?.premiumActive === true,
        coins: Number(data?.coins || 0),
        unlockedNovels: Array.isArray(data?.unlockedNovels)
          ? data.unlockedNovels.map(normalizeNovelId).filter(Boolean)
          : existing.unlockedNovels || []
      };

      localStorage.setItem("nebula-user-profile", JSON.stringify(payload));
      localStorage.setItem("nebula_user_uid", payload.uid || "");
      localStorage.setItem("nebula_user_email", payload.email || "");
    } catch (error) {
      console.error("No se pudo sincronizar nebula-user-profile:", error);
    }
  }

  async function waitForAuthUser(auth, timeoutMs = 1200) {
    if (auth.currentUser) return auth.currentUser;

    return await new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        unsubscribe();
        resolve(auth.currentUser || null);
      }, timeoutMs);

      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        unsubscribe();
        resolve(user || null);
      });
    });
  }

  async function getUserState() {
    const fallback = getFallbackUserState();

    try {
      const { auth, db, doc, getDoc } = await getFirebase();
      const user = await waitForAuthUser(auth);

      if (!user) {
        return fallback;
      }

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        const state = {
          isLogged: true,
          isPremium: false,
          plan: "free",
          subscription: "free",
          premiumActive: false,
          unlockedNovels: [],
          coins: 0,
          uid: user.uid,
          email: user.email || "",
          name: user.displayName || fallback.name || "Mi espacio",
          icon: fallback.icon || "🌌"
        };

        syncLocalProfile(user, state);
        return state;
      }

      const data = snap.data() || {};
      const plan = String(data.plan || "free").toLowerCase();
      const subscription = String(data.subscription || plan || "free").toLowerCase();
      const premiumActive = data.premiumActive === true;
      const unlockedNovels = Array.isArray(data.unlockedNovels)
        ? data.unlockedNovels.map(normalizeNovelId).filter(Boolean)
        : [];

      const state = {
        isLogged: true,
        isPremium: premiumActive || plan === "premium" || subscription === "premium",
        plan,
        subscription,
        premiumActive,
        unlockedNovels,
        coins: Number(data.coins || 0),
        uid: user.uid,
        email: user.email || data.email || "",
        name: data.name || user.displayName || fallback.name || "Mi espacio",
        icon: data.avatar || fallback.icon || "🌌"
      };

      syncLocalProfile(user, data);
      return state;
    } catch (error) {
      console.error("Error leyendo estado real del usuario:", error);
      return fallback;
    }
  }

  function hasAccessToNovel(userState, novelId) {
    if (!novelId) return false;
    if (userState.isPremium) return true;

    const baseId = normalizeNovelId(novelId);
    if (!baseId) return false;

    if (
      Array.isArray(userState.unlockedNovels) &&
      userState.unlockedNovels.includes(baseId)
    ) {
      return true;
    }

    return false;
  }

  async function postJson(url, payload) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const rawText = await res.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      console.error("Respuesta no válida del servidor:", rawText);
      throw new Error("El servidor no devolvió una respuesta válida.");
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || "Error del servidor.");
    }

    return data;
  }

  function goToLogin() {
    const basePath = getAppBasePath();
    const loginPath = basePath ? `${basePath}/login.html` : "/login.html";
    window.location.href = loginPath;
  }

  async function getAuthenticatedUserOrRedirect() {
    const { auth } = await getFirebase();
    const user = await waitForAuthUser(auth);

    if (!user) {
      goToLogin();
      return null;
    }

    return user;
  }

  async function startPremiumPayment() {
    try {
      const user = await getAuthenticatedUserOrRedirect();
      if (!user) return;

      const payload = {
        title: "Nébula Premium Mensual",
        price: 4990,
        quantity: 1,
        type: "premium",
        userId: user.uid,
        email: user.email || ""
      };

      const data = await postJson(`${API_BASE}/create-preference`, payload);
      const redirectUrl = data.init_point || data.initPoint;

      if (!data.ok || !redirectUrl) {
        throw new Error(data.error || "No se pudo iniciar el pago premium.");
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al iniciar pago premium.");
    }
  }

  async function startIndividualPayment(novelId) {
    try {
      const user = await getAuthenticatedUserOrRedirect();
      if (!user) return;

      if (!novelId) {
        alert("No se detectó la novela.");
        return;
      }

      const payload = {
        title: getNovelTitle(novelId),
        price: 990,
        quantity: 1,
        type: "single_purchase",
        novelId,
        userId: user.uid,
        email: user.email || ""
      };

      const data = await postJson(`${API_BASE}/create-preference`, payload);
      const redirectUrl = data.init_point || data.initPoint;

      if (!data.ok || !redirectUrl) {
        throw new Error(data.error || "No se pudo iniciar la compra individual.");
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al iniciar compra individual.");
    }
  }

  window.nebulaStartPremiumPayment = startPremiumPayment;
  window.nebulaStartIndividualPayment = () => startIndividualPayment(getNovelId());

  function showPaywall(novelId, chapterNumber, userState) {
    const basePath = getAppBasePath();
    const covers = getCoverPaths(basePath);
    const pricing = getPricing(novelId);

    document.body.innerHTML = `
      <style>
        .nebula-paywall-shell{
          min-height:100vh;
          margin:0;
          background:
            linear-gradient(rgba(0,0,0,.68), rgba(0,0,0,.78)),
            radial-gradient(circle at top left, rgba(38, 68, 140, .30), transparent 30%),
            radial-gradient(circle at top right, rgba(120, 60, 180, .22), transparent 28%),
            linear-gradient(180deg, #060b17 0%, #090f1d 45%, #05070d 100%);
          color:#ffffff;
          font-family:Inter, Arial, sans-serif;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          box-sizing:border-box;
        }

        .nebula-paywall-card{
          width:100%;
          max-width:1020px;
          min-height:570px;
          display:grid;
          grid-template-columns:1.08fr .92fr;
          background:linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          border:1px solid rgba(255,255,255,.08);
          border-radius:28px;
          overflow:hidden;
          box-shadow:0 30px 90px rgba(0,0,0,.48);
          backdrop-filter:blur(8px);
        }

        .nebula-paywall-hero{
          position:relative;
          padding:42px 36px;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          overflow:hidden;
          isolation:isolate;
          background:
            linear-gradient(180deg, rgba(6,12,26,.12), rgba(6,12,26,.42));
        }

        .nebula-collage-bg{
          position:absolute;
          inset:0;
          z-index:-3;
          transform:scale(1.015);
        }

        .nebula-collage-grid{
          position:absolute;
          inset:-3%;
          display:grid;
          grid-template-columns:repeat(3, 1fr);
          gap:10px;
          padding:12px;
        }

        .nebula-collage-column{
          display:flex;
          flex-direction:column;
          gap:10px;
          will-change:transform;
        }

        .nebula-collage-column.speed-a{
          animation:nebulaScrollA 52s linear infinite;
        }

        .nebula-collage-column.speed-b{
          animation:nebulaScrollB 60s linear infinite;
        }

        .nebula-collage-column.speed-c{
          animation:nebulaScrollA 56s linear infinite;
        }

        .nebula-collage-card{
          border-radius:14px;
          overflow:hidden;
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.08);
          box-shadow:0 10px 24px rgba(0,0,0,.22);
        }

        .nebula-collage-card img{
          display:block;
          width:100%;
          aspect-ratio:3/4.35;
          object-fit:cover;
          image-rendering:auto;
          transform:translateZ(0) scale(1.001);
          filter:brightness(.98) saturate(1.12) contrast(1.09);
          backface-visibility:hidden;
        }

        .nebula-collage-overlay{
          position:absolute;
          inset:0;
          z-index:-2;
          background:
            linear-gradient(90deg, rgba(4,8,22,.08) 0%, rgba(4,8,22,.16) 26%, rgba(4,8,22,.28) 54%, rgba(4,8,22,.58) 100%),
            radial-gradient(circle at center, rgba(7,16,31,.02) 0%, rgba(7,16,31,.16) 55%, rgba(4,8,22,.48) 100%);
          backdrop-filter:blur(.8px) brightness(.96);
        }

        .nebula-hero-content{
          position:relative;
          z-index:2;
          max-width:520px;
        }

        .nebula-badge{
          display:inline-flex;
          align-items:center;
          gap:10px;
          padding:8px 14px;
          border-radius:999px;
          background:rgba(255,255,255,.14);
          border:1px solid rgba(255,255,255,.16);
          font-size:.84rem;
          font-weight:700;
          letter-spacing:.03em;
          margin-bottom:20px;
          backdrop-filter:blur(4px);
        }

        .nebula-hero-title{
          margin:0 0 14px;
          font-size:2.9rem;
          line-height:1.02;
          font-weight:900;
          letter-spacing:-0.04em;
          text-shadow:0 8px 20px rgba(0,0,0,.18);
        }

        .nebula-hero-copy{
          margin:0 0 14px;
          font-size:1.05rem;
          line-height:1.72;
          color:rgba(255,255,255,.95);
          max-width:510px;
          text-shadow:0 3px 8px rgba(0,0,0,.14);
        }

        .nebula-hero-subcopy{
          margin:0;
          font-size:.97rem;
          line-height:1.6;
          color:#ebf0f8;
          text-shadow:0 3px 8px rgba(0,0,0,.14);
        }

        .nebula-chip-row{
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          margin-top:24px;
          position:relative;
          z-index:2;
        }

        .nebula-chip{
          padding:11px 13px;
          border-radius:14px;
          background:rgba(255,255,255,.11);
          border:1px solid rgba(255,255,255,.14);
          font-size:.9rem;
          font-weight:700;
          backdrop-filter:blur(4px);
        }

        .nebula-paywall-side{
          padding:38px 32px;
          display:flex;
          flex-direction:column;
          justify-content:center;
          background:
            linear-gradient(180deg, rgba(8,12,22,.96), rgba(8,12,22,.90));
        }

        .nebula-side-kicker{
          margin-bottom:12px;
          font-size:.88rem;
          font-weight:800;
          color:#b8c6dc;
          letter-spacing:.05em;
          text-transform:uppercase;
        }

        .nebula-side-title{
          margin-bottom:14px;
          font-size:1.8rem;
          line-height:1.12;
          font-weight:900;
          letter-spacing:-0.02em;
        }

        .nebula-side-copy{
          margin:0 0 14px;
          color:#b9c3d7;
          line-height:1.65;
          font-size:.96rem;
        }

        .nebula-urgency{
          margin:0 0 18px;
          color:#ffd15c;
          font-size:.92rem;
          font-weight:800;
          line-height:1.4;
        }

        .nebula-price-box{
          margin-bottom:18px;
          padding:18px 18px 16px;
          border-radius:18px;
          background:linear-gradient(135deg, rgba(255,255,255,.09), rgba(255,255,255,.03));
          border:1px solid rgba(255,255,255,.10);
        }

        .nebula-offer-label{
          display:inline-flex;
          align-items:center;
          padding:6px 10px;
          border-radius:999px;
          background:rgba(255, 17, 32, .14);
          border:1px solid rgba(255, 17, 32, .28);
          color:#ffb7bd;
          font-size:.78rem;
          font-weight:800;
          letter-spacing:.03em;
          margin-bottom:12px;
          text-transform:uppercase;
        }

        .nebula-price-row{
          display:flex;
          align-items:flex-end;
          gap:10px;
          flex-wrap:wrap;
          margin-bottom:6px;
        }

        .nebula-price-before{
          color:#8f9bb3;
          font-size:1rem;
          text-decoration:line-through;
          text-decoration-thickness:2px;
          opacity:.95;
        }

        .nebula-price-now{
          font-size:2rem;
          font-weight:900;
          letter-spacing:-0.03em;
          line-height:1;
        }

        .nebula-price-caption{
          color:#aebad0;
          font-size:.92rem;
          line-height:1.48;
        }

        .nebula-option-list{
          display:grid;
          gap:12px;
          margin-bottom:18px;
        }

        .nebula-option-card{
          border:1px solid rgba(255,255,255,.09);
          background:rgba(255,255,255,.04);
          border-radius:16px;
          padding:14px 16px;
        }

        .nebula-option-title{
          font-size:.98rem;
          font-weight:800;
          margin-bottom:5px;
        }

        .nebula-option-copy{
          color:#b8c4da;
          font-size:.92rem;
          line-height:1.5;
        }

        .nebula-payment-note{
          margin-bottom:16px;
          padding:13px 15px;
          border-radius:14px;
          background:linear-gradient(135deg, rgba(20,34,62,.92), rgba(16,24,41,.88));
          border:1px solid rgba(255,255,255,.08);
          color:#e6edf8;
          font-size:.92rem;
          font-weight:700;
        }

        .nebula-action-group{
          display:flex;
          flex-direction:column;
          gap:10px;
        }

        .nebula-primary-btn,
        .nebula-secondary-btn,
        .nebula-login-btn{
          display:flex;
          align-items:center;
          justify-content:center;
          text-decoration:none;
          border-radius:14px;
          transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease;
          border:none;
          cursor:pointer;
        }

        .nebula-primary-btn:hover,
        .nebula-secondary-btn:hover,
        .nebula-login-btn:hover{
          transform:translateY(-1px);
        }

        .nebula-primary-btn{
          min-height:54px;
          background:linear-gradient(180deg, #ff0f1c 0%, #c10610 100%);
          color:#ffffff;
          font-size:1rem;
          font-weight:900;
          letter-spacing:.01em;
          box-shadow:0 12px 28px rgba(229, 9, 20, .30);
        }

        .nebula-secondary-btn{
          min-height:50px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.10);
          color:#ffffff;
          font-size:.96rem;
          font-weight:800;
        }

        .nebula-login-btn{
          min-height:50px;
          background:linear-gradient(135deg, #2a82ff 0%, #4aa7ff 100%);
          color:#fff;
          font-size:.96rem;
          font-weight:900;
          box-shadow:0 12px 26px rgba(38,121,255,.22);
        }

        .nebula-user-line{
          margin:0 0 16px;
          color:#dce7f8;
          font-size:.92rem;
          line-height:1.5;
        }

        .nebula-footer-copy{
          margin:16px 0 0;
          color:#8f9bb3;
          font-size:.84rem;
          line-height:1.6;
          text-align:center;
        }

        @keyframes nebulaScrollA{
          0%{ transform:translateY(0); }
          100%{ transform:translateY(-28%); }
        }

        @keyframes nebulaScrollB{
          0%{ transform:translateY(-5%); }
          100%{ transform:translateY(-33%); }
        }

        @media (max-width: 860px){
          .nebula-paywall-card{
            grid-template-columns:1fr;
            max-width:680px;
            min-height:auto;
          }

          .nebula-paywall-hero{
            min-height:410px;
            padding:32px 24px;
          }

          .nebula-paywall-side{
            padding:30px 24px;
          }

          .nebula-hero-title{
            font-size:2.24rem;
          }

          .nebula-collage-grid{
            gap:8px;
            padding:10px;
            inset:-2%;
          }

          .nebula-collage-card{
            border-radius:12px;
          }

          .nebula-price-now{
            font-size:1.7rem;
          }
        }
      </style>

      <div class="nebula-paywall-shell">
        <div class="nebula-paywall-card">

          <div class="nebula-paywall-hero">
            <div class="nebula-collage-bg">
              ${buildCollageColumns(covers)}
            </div>
            <div class="nebula-collage-overlay"></div>

            <div class="nebula-hero-content">
              <div class="nebula-badge">NÉBULA PREMIUM</div>

              <h1 class="nebula-hero-title">
                Historias ilimitadas<br>y mucho más
              </h1>

              <p class="nebula-hero-copy">
                El capítulo ${chapterNumber} requiere acceso premium o compra individual de la novela.
                Sigue leyendo sin interrupciones y desbloquea toda la experiencia de Nébula.
              </p>

              <p class="nebula-hero-subcopy">
                Acceso desde <strong>celular</strong>, <strong>tablet</strong> y <strong>PC</strong>.
              </p>
            </div>

            <div class="nebula-chip-row">
              <div class="nebula-chip">Nuevas historias</div>
              <div class="nebula-chip">Progreso guardado</div>
              <div class="nebula-chip">Pago seguro</div>
            </div>
          </div>

          <div class="nebula-paywall-side">
            <div class="nebula-side-kicker">
              DESBLOQUEA ESTE CONTENIDO
            </div>

            <div class="nebula-side-title">
              Continúa leyendo en Nébula
            </div>

            <p class="nebula-side-copy">
              Elige una de las opciones para seguir con esta novela.
            </p>

            <p class="nebula-user-line">
              Usuario: <strong>${userState.isLogged ? (userState.name || "Mi espacio") : "Invitado"}</strong>
            </p>

            <div class="nebula-urgency">
              🔥 Acceso inmediato al continuar
            </div>

            <div class="nebula-price-box">
              <div class="nebula-offer-label">Precio lanzamiento</div>

              <div class="nebula-price-row">
                <div class="nebula-price-before">${pricing.individual.before}</div>
                <div class="nebula-price-now">${pricing.individual.now}</div>
              </div>

              <div class="nebula-price-caption">
                Antes ${pricing.individual.before}. Ahora solo ${pricing.individual.now} por esta novela.
                Premium antes ${pricing.premium.before}, ahora ${pricing.premium.now}.
              </div>
            </div>

            <div class="nebula-option-list">
              <div class="nebula-option-card">
                <div class="nebula-option-title">
                  Membresía Premium
                </div>
                <div class="nebula-option-copy">
                  Acceso completo al catálogo, lectura sin bloqueos y nuevas novelas todas las semanas.
                </div>
              </div>

              <div class="nebula-option-card">
                <div class="nebula-option-title">
                  Compra individual
                </div>
                <div class="nebula-option-copy">
                  Compra solo esta novela y desbloquea sus capítulos.
                </div>
              </div>
            </div>

            <div class="nebula-payment-note">
              💳 Pago seguro con Mercado Pago
            </div>

            <div class="nebula-action-group">
              ${
                userState.isLogged
                  ? `
                    <button class="nebula-primary-btn" onclick="window.nebulaStartPremiumPayment()">
                      Hazte premium por ${pricing.premium.now}
                    </button>

                    <button class="nebula-secondary-btn" onclick="window.nebulaStartIndividualPayment()">
                      Comprar esta novela por ${pricing.individual.now}
                    </button>
                  `
                  : `
                    <button class="nebula-login-btn" onclick="window.nebulaGoToLogin()">
                      Inicia sesión para desbloquear
                    </button>
                  `
              }
            </div>

            <p class="nebula-footer-copy">
              Accede al catálogo, compra novelas y sigue leyendo donde quedaste.
            </p>
          </div>

        </div>
      </div>
    `;
  }

  function showLastFreeChapterNotice(chapterNumber) {
    if (chapterNumber !== 3) return;

    const notice = document.createElement("div");
    notice.innerHTML = `
      <div style="
        max-width:1100px;
        margin:20px auto;
        padding:14px 18px;
        border-radius:18px;
        background:rgba(255,213,74,.12);
        border:1px solid rgba(255,213,74,.25);
        color:#ffe9a2;
        text-align:center;
        font-family:Inter,Arial,sans-serif;
      ">
        ⚠️ Último capítulo gratuito. El siguiente requiere acceso premium o compra individual.
      </div>
    `;

    document.body.prepend(notice);
  }

  async function initAccessControl() {
    const chapterNumber = getChapterNumberFromPath();
    const novelId = getNovelId();

    showLastFreeChapterNotice(chapterNumber);

    if (chapterNumber <= 3) return;

    const userState = await getUserState();

    if (!hasAccessToNovel(userState, novelId)) {
      showPaywall(novelId, chapterNumber, userState);
    }
  }

  window.nebulaGoToLogin = goToLogin;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initAccessControl().catch((error) => {
        console.error("Error iniciando access-control:", error);
      });
    });
  } else {
    initAccessControl().catch((error) => {
      console.error("Error iniciando access-control:", error);
    });
  }
})();
