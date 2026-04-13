export function formatViews(n) {
  const value = Number(n || 0);

  if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
  if (value >= 1000) return (value / 1000).toFixed(1) + "k";
  return String(value);
}

export function updateViews(novelId, baseViews = 120) {
  const storageKey = "nebula_views_" + novelId;
  const sessionKey = "nebula_viewed_" + novelId;

  let extraViews = Number(localStorage.getItem(storageKey) || 0);

  if (!sessionStorage.getItem(sessionKey)) {
    extraViews += 1;
    localStorage.setItem(storageKey, String(extraViews));
    sessionStorage.setItem(sessionKey, "true");
  }

  return Number(baseViews || 120) + extraViews;
}

export function getViews(novelId, baseViews = 120) {
  const storageKey = "nebula_views_" + novelId;
  const extraViews = Number(localStorage.getItem(storageKey) || 0);

  return Number(baseViews || 120) + extraViews;
}
