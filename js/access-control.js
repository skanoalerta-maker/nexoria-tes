(function () {

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

    if (path.includes("/thriller de corrupción/el precio del silencio/")) {
      return "el-precio-del-silencio-t1";
    }

    return null;
  }

  function getNovelId() {
    return getNovelIdFromQuery() || getNovelIdFromPath();
  }

  function getUserState() {
    try {
      const raw = localStorage.getItem("nebula-user-profile");
      const parsed = raw ? JSON.parse(raw) : null;

      return {
        isLogged: !!parsed,
        isPremium: parsed?.plan === "premium" || parsed?.subscription === "premium",
        purchasedNovels: Array.isArray(parsed?.purchasedNovels) ? parsed.purchasedNovels : []
      };
    } catch {
      return {
        isLogged: false,
        isPremium: false,
        purchasedNovels: []
      };
    }
  }

  function hasAccessToNovel(novelId) {
    const user = getUserState();

    if (!novelId) return false;
    if (user.isPremium) return true;
    if (user.purchasedNovels.includes(novelId)) return true;

    return false;
  }

  function showPaywall(novelId, chapterNumber) {
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        background:
          radial-gradient(circle at 15% 20%, rgba(74,130,255,.18), transparent 24%),
          radial-gradient(circle at 85% 18%, rgba(154,102,255,.16), transparent 26%),
          radial-gradient(circle at 50% 80%, rgba(80,219,255,.10), transparent 26%),
          linear-gradient(180deg, #040816 0%, #07101f 48%, #09162e 100%);
        color:#fff;
        font-family:Inter, Arial, sans-serif;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
      ">
        <div style="
          width:100%;
          max-width:700px;
          border-radius:28px;
          background:rgba(8,18,40,.9);
          border:1px solid rgba(255,255,255,.08);
          padding:32px;
          text-align:center;
          box-shadow:0 20px 60px rgba(0,0,0,.4);
        ">

          <h1 style="font-size:2.4rem;margin-bottom:10px;">
            🔒 Capítulo ${chapterNumber} bloqueado
          </h1>

          <p style="color:#b8c4da;margin-bottom:25px;line-height:1.6;">
            Este contenido requiere acceso premium o compra de la novela.
          </p>

          <div style="
            margin-bottom:25px;
            padding:18px;
            border-radius:18px;
            background:rgba(255,255,255,.05);
          ">
            💳 Pago seguro con Mercado Pago
          </div>

          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">

            <a href="/nebula/login.html" style="
              padding:14px 22px;
              border-radius:14px;
              background:#2a82ff;
              color:#fff;
              text-decoration:none;
              font-weight:800;
            ">
              Iniciar sesión
            </a>

            <a href="/nebula/novelas/index.html?id=${encodeURIComponent(novelId)}" style="
              padding:14px 22px;
              border-radius:14px;
              background:rgba(255,255,255,.08);
              color:#fff;
              text-decoration:none;
              font-weight:800;
              border:1px solid rgba(255,255,255,.08);
            ">
              Ver opciones
            </a>

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
        ⚠️ Último capítulo gratuito. El siguiente requiere acceso premium.
      </div>
    `;

    document.body.prepend(notice);
  }

  function initAccessControl() {
    const chapterNumber = getChapterNumberFromPath();
    const novelId = getNovelId();

    showLastFreeChapterNotice(chapterNumber);

    if (chapterNumber <= 3) return;

    if (!hasAccessToNovel(novelId)) {
      showPaywall(novelId, chapterNumber);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAccessControl);
  } else {
    initAccessControl();
  }

})();
