import { doc, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

function normalizeNovelUnlockId(novelId) {
  return String(novelId || "").trim().toLowerCase();
}

export async function unlockNovelWithCoin(db, uid, novelId) {
  if (!db) {
    throw new Error("Firestore no está inicializado.");
  }

  if (!uid) {
    throw new Error("Usuario no autenticado.");
  }

  if (!novelId) {
    throw new Error("No se recibió el ID de la novela.");
  }

  const unlockId = normalizeNovelUnlockId(novelId);
  const userRef = doc(db, "users", uid);

  const result = await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("No se encontró el usuario en Firestore.");
    }

    const userData = userSnap.data() || {};
    const isPremium =
      userData.premiumActive === true ||
      String(userData.plan || "").toLowerCase() === "premium" ||
      String(userData.subscription || "").toLowerCase() === "premium";

    const currentCoins = Number(userData.coins || 0);
    const unlockedNovels = Array.isArray(userData.unlockedNovels)
      ? [...userData.unlockedNovels]
      : [];

    const alreadyUnlocked = unlockedNovels.includes(unlockId);

    if (isPremium) {
      return {
        ok: true,
        alreadyUnlocked: true,
        reason: "premium_user",
        coins: currentCoins,
        unlockedNovels
      };
    }

    if (alreadyUnlocked) {
      return {
        ok: true,
        alreadyUnlocked: true,
        reason: "already_unlocked",
        coins: currentCoins,
        unlockedNovels
      };
    }

    if (currentCoins < 1) {
      throw new Error("No tienes coins suficientes para desbloquear esta novela.");
    }

    const updatedCoins = currentCoins - 1;
    const updatedUnlockedNovels = [...unlockedNovels, unlockId];

    transaction.update(userRef, {
      coins: updatedCoins,
      unlockedNovels: updatedUnlockedNovels,
      updatedAt: serverTimestamp(),
      lastNovelUnlockedAt: serverTimestamp(),
      lastNovelUnlockedId: unlockId
    });

    return {
      ok: true,
      alreadyUnlocked: false,
      reason: "coin_spent",
      coins: updatedCoins,
      unlockedNovels: updatedUnlockedNovels
    };
  });

  return result;
}

export function hasNovelUnlocked(accessState, novelId) {
  const unlockId = normalizeNovelUnlockId(novelId);

  if (!accessState || !Array.isArray(accessState.unlockedNovels)) {
    return false;
  }

  return accessState.unlockedNovels
    .map((id) => normalizeNovelUnlockId(id))
    .includes(unlockId);
}

export function canUserUnlockWithCoin(accessState) {
  if (!accessState) return false;
  return Number(accessState.coins || 0) >= 1;
}
