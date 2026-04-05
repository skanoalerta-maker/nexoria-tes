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
    const monthly = "$4.990";
    const single = "$1.500";

    const perNovel = {
      "codigo-nebula-t1": "$1.500",
      "codigo-nebula-t2": "$1.500",
      "no-debi-enamorarme-t1": "$1.500",
      "no-debi-enamorarme-t2": "$1.500",
      "despues-de-tu-adios-t1": "$1.500",
      "la-ultima-conexion-t1": "$1.500",
      "ya-habias-estado-ahi-t1": "$1.500",
      "allende-t1": "$1.500",
      "pinochet-t1": "$1.500",
      "el-precio-del-silencio-t1": "$1.500"
    };

    return {
      premiumMonthly: monthly,
      individual: perNovel[novelId] || single
    };
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
              <img src="${src}" alt="" onerror="this.style.display='none'; this.parentElement.style.background='rgba(255,255,255,.06)';" />
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

  function showPaywall(novelId, chapterNumber) {
    const basePath = getAppBasePath();
    const loginPath = `${basePath}/login.html`;
    const plansPath = `${basePath}/novelas/index.html?id=${encodeURIComponent(novelId || "")}`;
    const covers = getCoverPaths(basePath);
    const pricing = getPricing(novelId);

    document.body.innerHTML = `
      <style>
        .nebula-paywall-shell{
          min-height:100vh;
          margin:0;
          background:
            linear-gradient(rgba(0,0,0,.70), rgba(0,0,0,.80)),
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
          max-width:1000px;
          min-height:560px;
          display:grid;
          grid-template-columns:1.08fr .92fr;
          background:linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          border:1px solid rgba(255,255,255,.08);
          border-radius:26px;
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
            linear-gradient(180deg, rgba(6,12,26,.20), rgba(6,12,26,.52));
        }

        .nebula-collage-bg{
          position:absolute;
          inset:0;
          z-index:-3;
          transform:scale(1.03);
        }

        .nebula-collage-grid{
          position:absolute;
          inset:-6%;
          display:grid;
          grid-template-columns:repeat(3, 1fr);
          gap:12px;
          padding:14px;
        }

        .nebula-collage-column{
          display:flex;
          flex-direction:column;
          gap:12px;
          will-change:transform;
        }

        .nebula-collage-column.speed-a{
          animation:nebulaScrollA 38s linear infinite;
        }

        .nebula-collage-column.speed-b{
          animation:nebulaScrollB 46s linear infinite;
        }

        .nebula-collage-column.speed-c{
          animation:nebulaScrollA 42s linear infinite;
        }

        .nebula-collage-card{
          border-radius:16px;
          overflow:hidden;
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.10);
          box-shadow:0 14px 30px rgba(0,0,0,.28);
        }

        .nebula-collage-card img{
          display:block;
          width:100%;
          aspect-ratio:3/4.4;
          object-fit:cover;
          filter:brightness(.92) saturate(1.08) contrast(1.06) sharpen(1);
        }

        .nebula-collage-overlay{
          position:absolute;
          inset:0;
          z-index:-2;
          background:
            linear-gradient(90deg, rgba(4,8,22,.18) 0%, rgba(4,8,22,.30) 28%, rgba(4,8,22,.42) 55%, rgba(4,8,22,.70) 100%),
            radial-gradient(circle at center, rgba(7,16,31,.06) 0%, rgba(7,16,31,.32) 56%, rgba(4,8,22,.72) 100%);
          backdrop-filter:blur(2px) brightness(.88);
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
          background:rgba(255,255,255,.12);
          border:1px solid rgba(255,255,255,.14);
          font-size:.84rem;
          font-weight:700;
          letter-spacing:.03em;
          margin-bottom:20px;
          backdrop-filter:blur(4px);
        }

        .nebula-hero-title{
          margin:0 0 14px;
          font-size:2.85rem;
          line-height:1.02;
          font-weight:900;
          letter-spacing:-0.04em;
          text-shadow:0 8px 20px rgba(0,0,0,.22);
        }

        .nebula-hero-copy{
          margin:0 0 14px;
          font-size:1.04rem;
          line-height:1.7;
          color:rgba(255,255,255,.94);
          max-width:500px;
          text-shadow:0 4px 10px rgba(0,0,0,.18);
        }

        .nebula-hero-subcopy{
          margin:0;
          font-size:.96rem;
          line-height:1.6;
          color:#e0e6f2;
          text-shadow:0 4px 10px rgba(0,0,0,.18);
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
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.12);
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
          padding:16px 18px;
          border-radius:16px;
          background:linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
          border:1px solid rgba(255,255,255,.10);
        }

        .nebula-price-main{
          font-size:1.8rem;
          font-weight:900;
          letter-spacing:-0.03em;
          margin-bottom:4px;
        }

        .nebula-price-sub{
          color:#aebad0;
          font-size:.92rem;
          line-height:1.45;
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
        .nebula-secondary-btn{
          display:flex;
          align-items:center;
          justify-content:center;
          text-decoration:none;
          border-radius:14px;
          transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease;
        }

        .nebula-primary-btn:hover,
        .nebula-secondary-btn:hover{
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

        .nebula-footer-copy{
          margin:16px 0 0;
          color:#8f9bb3;
          font-size:.84rem;
          line-height:1.6;
          text-align:center;
        }

        @keyframes nebulaScrollA{
          0%{ transform:translateY(0); }
          100%{ transform:translateY(-38%); }
        }

        @keyframes nebulaScrollB{
          0%{ transform:translateY(-8%); }
          100%{ transform:translateY(-46%); }
        }

        @media (max-width: 860px){
          .nebula-paywall-card{
            grid-template-columns:1fr;
            max-width:660px;
            min-height:auto;
          }

          .nebula-paywall-hero{
            min-height:400px;
            padding:32px 24px;
          }

          .nebula-paywall-side{
            padding:30px 24px;
          }

          .nebula-hero-title{
            font-size:2.2rem;
          }

          .nebula-collage-grid{
            gap:10px;
            padding:12px;
          }

          .nebula-collage-card{
            border-radius:14px;
          }

          .nebula-price-main{
            font-size:1.55rem;
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

            <div class="nebula-urgency">
              🔥 Acceso inmediato al continuar
            </div>

            <div class="nebula-price-box">
              <div class="nebula-price-main">
                ${pricing.individual} CLP
              </div>
              <div class="nebula-price-sub">
                Compra esta novela o accede a todo con Premium desde ${pricing.premiumMonthly} CLP al mes.
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
              <a href="${loginPath}" class="nebula-primary-btn">
                Iniciar sesión y continuar
              </a>

              <a href="${plansPath}" class="nebula-secondary-btn">
                Ver planes y opciones
              </a>
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
