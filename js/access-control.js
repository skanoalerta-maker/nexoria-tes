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
        margin:0;
        background:
          linear-gradient(rgba(0,0,0,.72), rgba(0,0,0,.82)),
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
      ">
        <div style="
          width:100%;
          max-width:900px;
          min-height:500px;
          display:grid;
          grid-template-columns:1.08fr .92fr;
          background:
            linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          border:1px solid rgba(255,255,255,.08);
          border-radius:26px;
          overflow:hidden;
          box-shadow:0 30px 90px rgba(0,0,0,.48);
          backdrop-filter:blur(8px);
        ">

          <div style="
            position:relative;
            padding:42px 36px;
            background:
              linear-gradient(180deg, rgba(6,12,26,.55), rgba(6,12,26,.88)),
              url('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat;
            display:flex;
            flex-direction:column;
            justify-content:space-between;
          ">
            <div>
              <div style="
                display:inline-flex;
                align-items:center;
                gap:10px;
                padding:8px 14px;
                border-radius:999px;
                background:rgba(255,255,255,.08);
                border:1px solid rgba(255,255,255,.10);
                font-size:.84rem;
                font-weight:700;
                letter-spacing:.03em;
                margin-bottom:20px;
              ">
                NÉBULA PREMIUM
              </div>

              <h1 style="
                margin:0 0 14px;
                font-size:2.6rem;
                line-height:1.05;
                font-weight:900;
                letter-spacing:-0.03em;
              ">
                Historias ilimitadas<br>y mucho más
              </h1>

              <p style="
                margin:0 0 14px;
                font-size:1.04rem;
                line-height:1.65;
                color:rgba(255,255,255,.86);
                max-width:500px;
              ">
                El capítulo ${chapterNumber} requiere acceso premium o compra individual de la novela.
                Sigue leyendo sin interrupciones y desbloquea toda la experiencia de Nébula.
              </p>

              <p style="
                margin:0;
                font-size:.96rem;
                line-height:1.6;
                color:#d8deea;
              ">
                Acceso desde <strong>celular</strong>, <strong>tablet</strong> y <strong>PC</strong>.
              </p>
            </div>

            <div style="
              display:flex;
              flex-wrap:wrap;
              gap:10px;
              margin-top:24px;
            ">
              <div style="
                padding:11px 13px;
                border-radius:14px;
                background:rgba(255,255,255,.08);
                border:1px solid rgba(255,255,255,.10);
                font-size:.9rem;
                font-weight:700;
              ">Nuevas historias</div>

              <div style="
                padding:11px 13px;
                border-radius:14px;
                background:rgba(255,255,255,.08);
                border:1px solid rgba(255,255,255,.10);
                font-size:.9rem;
                font-weight:700;
              ">Progreso guardado</div>

              <div style="
                padding:11px 13px;
                border-radius:14px;
                background:rgba(255,255,255,.08);
                border:1px solid rgba(255,255,255,.10);
                font-size:.9rem;
                font-weight:700;
              ">Pago seguro</div>
            </div>
          </div>

          <div style="
            padding:38px 32px;
            display:flex;
            flex-direction:column;
            justify-content:center;
            background:
              linear-gradient(180deg, rgba(8,12,22,.96), rgba(8,12,22,.90));
          ">
            <div style="
              margin-bottom:16px;
              font-size:.88rem;
              font-weight:800;
              color:#b8c6dc;
              letter-spacing:.05em;
            ">
              DESBLOQUEA ESTE CONTENIDO
            </div>

            <div style="
              margin-bottom:16px;
              font-size:1.8rem;
              line-height:1.15;
              font-weight:900;
              letter-spacing:-0.02em;
            ">
              Continúa leyendo en Nébula
            </div>

            <p style="
              margin:0 0 22px;
              color:#b9c3d7;
              line-height:1.65;
              font-size:.96rem;
            ">
              Elige una de las opciones para seguir con esta novela.
            </p>

            <div style="
              display:grid;
              gap:12px;
              margin-bottom:18px;
            ">
              <div style="
                border:1px solid rgba(255,255,255,.09);
                background:rgba(255,255,255,.04);
                border-radius:16px;
                padding:14px 16px;
              ">
                <div style="
                  font-size:.98rem;
                  font-weight:800;
                  margin-bottom:5px;
                ">
                  Membresía Premium
                </div>
                <div style="
                  color:#b8c4da;
                  font-size:.92rem;
                  line-height:1.5;
                ">
                  Acceso completo al catálogo, lectura sin bloqueos y nuevas novelas todas las semanas.
                </div>
              </div>

              <div style="
                border:1px solid rgba(255,255,255,.09);
                background:rgba(255,255,255,.04);
                border-radius:16px;
                padding:14px 16px;
              ">
                <div style="
                  font-size:.98rem;
                  font-weight:800;
                  margin-bottom:5px;
                ">
                  Compra individual
                </div>
                <div style="
                  color:#b8c4da;
                  font-size:.92rem;
                  line-height:1.5;
                ">
                  Compra solo esta novela y desbloquea sus capítulos.
                </div>
              </div>
            </div>

            <div style="
              margin-bottom:16px;
              padding:13px 15px;
              border-radius:14px;
              background:linear-gradient(135deg, rgba(20,34,62,.92), rgba(16,24,41,.88));
              border:1px solid rgba(255,255,255,.08);
              color:#e6edf8;
              font-size:.92rem;
              font-weight:700;
            ">
              💳 Pago seguro con Mercado Pago
            </div>

            <div style="
              display:flex;
              flex-direction:column;
              gap:10px;
            ">
              <a href="/nebula/login.html" style="
                display:flex;
                align-items:center;
                justify-content:center;
                min-height:52px;
                border-radius:14px;
                background:linear-gradient(180deg, #e50914 0%, #b20710 100%);
                color:#ffffff;
                text-decoration:none;
                font-size:.98rem;
                font-weight:900;
                letter-spacing:.01em;
                box-shadow:0 12px 28px rgba(229, 9, 20, .28);
              ">
                Iniciar sesión y continuar
              </a>

              <a href="/nebula/novelas/index.html?id=${encodeURIComponent(novelId)}" style="
                display:flex;
                align-items:center;
                justify-content:center;
                min-height:50px;
                border-radius:14px;
                background:rgba(255,255,255,.08);
                border:1px solid rgba(255,255,255,.10);
                color:#ffffff;
                text-decoration:none;
                font-size:.96rem;
                font-weight:800;
              ">
                Ver planes y opciones
              </a>
            </div>

            <p style="
              margin:16px 0 0;
              color:#8f9bb3;
              font-size:.84rem;
              line-height:1.6;
              text-align:center;
            ">
              Accede al catálogo, compra novelas y sigue leyendo donde quedaste.
            </p>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.body.firstElementChild;
    if (!wrapper) return;

    const mq = window.matchMedia("(max-width: 860px)");

    function applyResponsiveLayout() {
      const card = wrapper.querySelector("div > div");
      if (!card) return;

      if (mq.matches) {
        card.style.gridTemplateColumns = "1fr";
        card.style.maxWidth = "640px";
        card.style.minHeight = "auto";
      } else {
        card.style.gridTemplateColumns = "1.08fr .92fr";
        card.style.maxWidth = "900px";
        card.style.minHeight = "500px";
      }
    }

    applyResponsiveLayout();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", applyResponsiveLayout);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(applyResponsiveLayout);
    }
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
