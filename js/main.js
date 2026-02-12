/* =========================================================
   main.js — Entrega final (JS)
   ========================================================= */

/* 1) Menú hamburguesa
   ========================================================= */
function initBurgerMenu() {
  const btnMenu = document.getElementById("gpMenuToggle");
  const navMobile = document.getElementById("gpMobileNav");
  if (!btnMenu || !navMobile) return;

  btnMenu.addEventListener("click", () => {
    const abierto = navMobile.classList.toggle("gp-nav-mobile--open");
    btnMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
    btnMenu.classList.toggle("is-open", abierto);
  });
}

/* 2) Wizard (createscore.html)
   ========================================================= */
function initWizard() {
  const wizard = document.getElementById("wizard");
  if (!wizard) return;

  // lo uso para acordarme lo que elige el usuario entre pasos
  const state = {
    personalizado: null,
    incluyeNombre: "no",
    nombreMarcador: "SIN NOMBRE",
    logoDataUrl: "",
    colorPrincipal: "",
    tipografia: "sin serif",
    modalidad: "3_sets",
  };

  const txtTipo = $("#selPersonalizado");
  const boxNombre = $("#wrapNombre");
  const inputNombre = $("#nombreMarcador");
  const inputLogo = $("#logoFile");
  const txtLogo = $("#logoName");
  const inputColor = $("#colorPrincipal");
  const selTipografia = $("#tipografia");
  const resumen = $("#resumenFinal");

  const btnPers = $("#btnElegirPersonalizado");
  const btnNoPers = $("#btnElegirNoPersonalizado");
  const btnPrev = $("#btnPrev");
  const btnNext = $("#btnNext");
  const btnPrev3 = $("#btnPrev3");
  const btnNext3 = $("#btnNext3");
  const btnPrev4 = $("#btnPrev4");
  const btnNext4 = $("#btnNext4");
  const btnPrev5 = $("#btnPrev5");
  const btnGuardar = $("#btnGuardar");
  const btnIrMarcador = $("#btnIrMarcador");
  const btnLimpiar = $("#btnLimpiar");

  function syncNombre() {
    const radio = document.querySelector('input[name="incluyeNombre"]:checked');
    state.incluyeNombre = radio ? radio.value : "no";

    const quiere = state.incluyeNombre === "si";
    if (boxNombre) boxNombre.classList.toggle("gp-hidden", !quiere);

    if (!quiere) {
      state.nombreMarcador = "SIN NOMBRE";
      if (inputNombre) inputNombre.value = "";
      return;
    }

    const t = ((inputNombre && inputNombre.value) || "").trim();
    state.nombreMarcador = t || "SIN NOMBRE";
  }

  function syncModalidad() {
    const radio = document.querySelector('input[name="modalidad"]:checked');
    state.modalidad = radio ? radio.value : "3_sets";
  }

  // cargo modalidades desde JSON - solicitado para esta ULTIMA ENTREGA
  fetch("../data/modalidades.json")
    .then((r) => r.json())
    .then((modalidades) => {
      const cont = document.getElementById("modalidadesWrap");
      if (!cont) return;

      cont.innerHTML = "";
      modalidades.forEach((m, idx) => {
        cont.innerHTML +=
          "<label>" +
          "<input type='radio' name='modalidad' value='" +
          m.id +
          "'" +
          (idx === 0 ? " checked" : "") +
          ">" +
          " " +
          m.label +
          "</label>";
      });

      document.querySelectorAll('input[name="modalidad"]').forEach((r) => {
        r.addEventListener("change", syncModalidad);
      });

      syncModalidad();
    })
      // Antes tenia console.log pero lo borré porque en el TP ifnal dice que no lo use
    .catch(() => {
      state.modalidad = "3_sets";
    });


    // SweerAlert2 para cuando supera el tamaño de la imagen
      function readLogoAsDataUrl(file) {
        return new Promise((resolve) => {
          if (!file) return resolve("");
          const max = 200 * 1024;

          if (file.size > max) {
            Swal.fire({
              icon: "warning",
              title: "Archivo demasiado pesado",
              text: `El archivo pesa ${(file.size / 1024).toFixed(0)}KB y supera el límite de 200KB.`,
              confirmButtonText: "Entendido",
              customClass: { confirmButton: "gp-btn gp-btn--primary" },
            });

            return resolve("");
          }

          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        });
      }


  function buildResumen() {
    if (!resumen) return;

    const nombre = ((state.nombreMarcador || "SIN NOMBRE") + "").trim() || "SIN NOMBRE";
    const tipo = state.personalizado ? "PERSONALIZADO" : "NO PERSONALIZADO";
    const modalidadTxt =
      state.modalidad === "2_sets_super_tb" ? "2 sets + super tie-break" : "Partido a 3 sets";

    let colorTxt = "(azul GPADEL por defecto)";
    if (state.personalizado) {
      const c = normalizeHex(state.colorPrincipal);
      if (c) colorTxt = c;
    }

    const tipTxt =
      (state.tipografia || "").toLowerCase().includes("con serif")
        ? "Con serif (Times New Roman)"
        : "Sin serif (Titillium Web)";

    const logoTxt = state.personalizado ? (state.logoDataUrl ? "Cargado" : "Sin logo") : "(No aplica)";

    resumen.innerHTML =
      `<div><strong>Club / Liga:</strong> ${nombre}</div>` +
      `<div style="margin-top:6px;"><strong>Tipo de marcador:</strong> ${tipo}</div>` +
      `<div style="margin-top:6px;"><strong>Modalidad:</strong> ${modalidadTxt}</div>` +
      `<div style="margin-top:6px;"><strong>Color:</strong> ${colorTxt}</div>` +
      `<div style="margin-top:6px;"><strong>Tipografía:</strong> ${tipTxt}</div>` +
      `<div style="margin-top:6px;"><strong>Logo:</strong> ${logoTxt}</div>`;
  }

  function goStep(n) {
    showStep(n);
    if (n === 5) buildResumen();
  }

  function stepAfter2() {
    return state.personalizado ? 3 : 4;
  }

  function createCfgFromState() {
    const nombre = ((state.nombreMarcador || "SIN NOMBRE") + "").trim() || "SIN NOMBRE";

    return {
      code: genCode6(),
      createdAt: new Date().toISOString(),
      personalizado: !!state.personalizado,
      nombreMarcador: nombre,
      modalidad: state.modalidad || "3_sets",
      logoDataUrl: state.logoDataUrl || "",
      colorPrincipal: state.personalizado ? normalizeHex(state.colorPrincipal || "") : "",
      tipografia: state.tipografia || "sin serif",
    };
  }

  // eventos
  if (btnPers) {
    btnPers.addEventListener("click", () => {
      state.personalizado = true;
      if (txtTipo) txtTipo.textContent = "PERSONALIZADO";
      goStep(2);
    });
  }

  if (btnNoPers) {
    btnNoPers.addEventListener("click", () => {
      state.personalizado = false;
      if (txtTipo) txtTipo.textContent = "NO PERSONALIZADO";
      goStep(2);
    });
  }

  document.querySelectorAll('input[name="incluyeNombre"]').forEach((r) => {
    r.addEventListener("change", syncNombre);
  });
  if (inputNombre) inputNombre.addEventListener("input", syncNombre);

  if (btnPrev) btnPrev.addEventListener("click", () => goStep(1));
  if (btnNext) {
    btnNext.addEventListener("click", () => {

/* Sustitui el Alert por sweetalert2   ========================================================= */
      if (state.personalizado === null) {
          Swal.fire({
            icon: "warning",
            title: "Falta una elección",
            text: "Elegí si querés Personalizado o No personalizado.",
            confirmButtonText: "Entendido",
            customClass: { confirmButton: "gp-btn gp-btn--primary" },
          });
          return;
        }
      syncNombre();
      goStep(stepAfter2());
    });
  }

  if (btnPrev3) btnPrev3.addEventListener("click", () => goStep(2));
  if (btnNext3) btnNext3.addEventListener("click", () => goStep(4));

  if (inputLogo) {
    inputLogo.addEventListener("change", () => {
      const file = inputLogo.files && inputLogo.files[0] ? inputLogo.files[0] : null;
      if (txtLogo) txtLogo.textContent = file ? file.name : "Sin archivos seleccionados";
      readLogoAsDataUrl(file).then((dataUrl) => {
        state.logoDataUrl = dataUrl || "";
      });
    });
  }

  if (inputColor) {
    inputColor.addEventListener("input", () => {
      state.colorPrincipal = (inputColor.value || "").trim();
    });
  }

  if (selTipografia) {
    selTipografia.addEventListener("change", () => {
      state.tipografia = (selTipografia.value || "sin serif").trim();
    });
  }

  if (btnPrev4) btnPrev4.addEventListener("click", () => goStep(state.personalizado ? 3 : 2));
  if (btnNext4) btnNext4.addEventListener("click", () => (syncModalidad(), goStep(5)));
  if (btnPrev5) btnPrev5.addEventListener("click", () => goStep(4));

  if (btnGuardar) {
    btnGuardar.addEventListener("click", (e) => {
      e.preventDefault();
      syncModalidad();
      let cfg = createCfgFromState();
      cfg = saveConfig(cfg);

      Swal.fire({
        title: "¡Configuración guardada!",
        text: "Código: " + cfg.code,
        icon: "success",
        confirmButtonText: "OK",
        customClass: { confirmButton: "gp-btn gp-btn--primary" },
        buttonsStyling: false,
      });
    });
  }

  if (btnIrMarcador) {
    btnIrMarcador.addEventListener("click", () => {
      syncModalidad();
      let cfg = createCfgFromState();
      cfg = saveConfig(cfg);
      window.open("score.html?code=" + encodeURIComponent(cfg.code), "_blank", "noopener");
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", (e) => {
      e.preventDefault();

      Swal.fire({
        title: "¿Querés limpiar el formulario?",
        text: "Se perderá toda la configuración actual.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, limpiar",
        cancelButtonText: "Cancelar",
        customClass: { confirmButton: "gp-btn gp-btn--danger", cancelButton: "gp-btn gp-btn--cancel" },
        buttonsStyling: false,
      }).then((result) => {
        if (!result.isConfirmed) return;

        state.personalizado = null;
        state.incluyeNombre = "no";
        state.nombreMarcador = "SIN NOMBRE";
        state.logoDataUrl = "";
        state.colorPrincipal = "";
        state.tipografia = "sin serif";
        state.modalidad = "3_sets";

        if (inputNombre) inputNombre.value = "";
        if (inputLogo) inputLogo.value = "";
        if (txtLogo) txtLogo.textContent = "Sin archivos seleccionados";
        if (inputColor) inputColor.value = "";
        if (selTipografia) selTipografia.value = "";

        document.querySelectorAll('input[name="incluyeNombre"]').forEach((r) => (r.checked = r.value === "no"));
        document.querySelectorAll('input[name="modalidad"]').forEach((r) => (r.checked = r.value === "3_sets"));

        if (txtTipo) txtTipo.textContent = "—";

        syncNombre();
        syncModalidad();
        goStep(1);
      });
    });
  }

  syncNombre();
  syncModalidad();
  goStep(1);
}

/* 3) LocalStorage
   ========================================================= */
const LIST_KEY = "gpadel_configs";
const ACTIVE_KEY = "gpadel_config_activa";

// (menos robusto: sin try/catch, pero con fallback)
function readConfigs() {
  const raw = localStorage.getItem(LIST_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeConfigs(list) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list));
}

function genCode6() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function normalizeHex(input) {
  let s = (input || "").trim();
  if (!s) return "";
  if (s[0] !== "#") s = "#" + s;
  return /^#[0-9A-Fa-f]{6}$/.test(s) ? s.toUpperCase() : "";
}

function saveConfig(cfg) {
  const list = readConfigs();

  if (!cfg.code) cfg.code = genCode6();
  if (!cfg.createdAt) cfg.createdAt = new Date().toISOString();

  const idx = list.findIndex((c) => c && c.code === cfg.code);
  if (idx >= 0) list[idx] = cfg;
  else list.unshift(cfg);

  writeConfigs(list);
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(cfg));
  return cfg;
}

function getByCode(code) {
  const list = readConfigs();
  return list.find((c) => c && c.code === code) || null;
}

function getActive() {
  const raw = localStorage.getItem(ACTIVE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setActive(cfg) {
  if (!cfg) localStorage.removeItem(ACTIVE_KEY);
  else localStorage.setItem(ACTIVE_KEY, JSON.stringify(cfg));
}

function deleteByCode(code) {
  const list = readConfigs().filter((c) => c && c.code !== code);
  writeConfigs(list);

  const active = getActive();
  if (active && active.code === code) localStorage.removeItem(ACTIVE_KEY);
}

/* 4) created-scores.html
   ========================================================= */
function initCreatedScores() {
  const listaWrap = document.getElementById("listaConfigs");
  if (!listaWrap) return;

  const inputBuscar = document.getElementById("buscador");
  const txtContador = document.getElementById("contador");
  const txtPers = document.getElementById("contadorPersonalizados");

  function pintarLista() {
    const list = readConfigs();
    const q = ((inputBuscar && inputBuscar.value) || "").trim().toLowerCase();

    const filtered = q
      ? list.filter((c) => {
          const name = (c.nombreMarcador || "").toLowerCase();
          const code = (c.code || "").toLowerCase();
          return name.includes(q) || code.includes(q);
        })
      : list;

    listaWrap.innerHTML = "";

    filtered.forEach((c) => {
      const name =
        c.nombreMarcador && c.nombreMarcador !== "SIN NOMBRE" ? c.nombreMarcador : "SIN NOMBRE";
      const modalidad = c.modalidad === "2_sets_super_tb" ? "2 sets + super tie-break" : "Partido a 3 sets";
      const tipo = c.personalizado ? "PERSONALIZADO" : "NO PERSONALIZADO";

      const div = document.createElement("div");
      div.className = "gp-lista-item";
      div.innerHTML =
        "<div class='gp-between' style='gap:12px; align-items:flex-start;'>" +
          "<div>" +
            "<div style='font-weight:700'>" + name + "</div>" +
            "<div style='font-size:.9rem; opacity:.85; margin-top:2px;'>" +
              "<span style='font-weight:700;'>" + c.code + "</span>" +
              "<span style='margin:0 8px;'>•</span>" + tipo +
              "<span style='margin:0 8px;'>•</span>" + modalidad +
            "</div>" +
          "</div>" +
          "<div class='gp-inline' style='gap:8px; justify-content:flex-end;'>" +
            "<button class='gp-btn gp-btn--primary' data-action='open' data-code='" + c.code + "'>IR AL MARCADOR</button>" +
            "<button class='gp-btn gp-btn--danger' data-action='del' data-code='" + c.code + "'>Eliminar</button>" +
          "</div>" +
        "</div>";
      listaWrap.appendChild(div);
    });

    if (txtContador) txtContador.textContent = list.length + " marcador" + (list.length === 1 ? "" : "es");
    const pers = list.filter((c) => c && c.personalizado).length;
    if (txtPers) txtPers.textContent = pers + " personalizado" + (pers === 1 ? "" : "s");

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "gp-resumen";
      empty.style.marginTop = "12px";
      empty.textContent = q ? "No hay resultados para tu búsqueda." : "Todavía no creaste ningún marcador.";
      listaWrap.appendChild(empty);
    }
  }

  listaWrap.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const code = btn.getAttribute("data-code");

    if (action === "open") {
      const cfg = getByCode(code);
      if (cfg) setActive(cfg);
      window.open("score.html?code=" + encodeURIComponent(code), "_blank", "noopener");
      return;
    }

    if (action === "del") {
      if (typeof Swal === "undefined") {
        if (window.confirm("¿Eliminar este marcador?")) {
          deleteByCode(code);
          pintarLista();
        }
        return;
      }

      Swal.fire({
        title: "¿Eliminar este marcador?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        customClass: { confirmButton: "gp-btn gp-btn--danger", cancelButton: "gp-btn gp-btn--cancel" },
        buttonsStyling: false,
      }).then((r) => {
        if (!r.isConfirmed) return;
        deleteByCode(code);
        pintarLista();
      });
    }
  });

  if (inputBuscar) inputBuscar.addEventListener("input", pintarLista);
  pintarLista();
}

/* 5) score.html
   ========================================================= */
function initScoreScreen() {
  const btnCrear = document.getElementById("btnCrear");
  const screen = document.querySelector(".marker-screen");
  if (!btnCrear && !screen) return;

  const getCodeFromUrl = () => (new URLSearchParams(window.location.search).get("code") || "").trim();

  const defaultNo = {
    bg: "../img/bggpadel.png",
    logo: "../img/gpadel-logo-white.svg",
    btnColor: "#cbdc00",
  };

  const defaultPers = {
    bg: "../img/bggpadel-white.png",
    logo: "../img/gpadel-logo.svg",
    fontSans: '"Titillium Web", Arial, sans-serif',
    fontSerif: '"Times New Roman", Times, serif',
  };

  const code = getCodeFromUrl();
  let cfg = code ? getByCode(code) : null;
  if (cfg) setActive(cfg);
  if (!cfg) cfg = getActive();

  if (!cfg) {
    cfg = {
      personalizado: false,
      nombreMarcador: "SIN NOMBRE",
      modalidad: "3_sets",
      logoDataUrl: "",
      colorPrincipal: "",
      tipografia: "sin serif",
    };
  }

  const logoImg = document.getElementById("logo");
  const club = document.getElementById("clubLiga");
  const body = document.body;

  if (cfg.personalizado) {
    setCssVar("--marker-bg-image", `url("${defaultPers.bg}")`);
    setCssVar("--marker-text-color", "#111");
    body.classList.add("bg-white");
  } else {
    setCssVar("--marker-bg-image", `url("${defaultNo.bg}")`);
    setCssVar("--marker-text-color", "#ffffff");
    body.classList.remove("bg-white");
  }

  document.body.classList.remove("is-personalizado", "is-no-personalizado");

  if (cfg.personalizado) {
    document.body.classList.add("is-personalizado");
  } else {
    document.body.classList.add("is-no-personalizado");
  }

  if (logoImg) {
    logoImg.src = cfg.personalizado ? (cfg.logoDataUrl || defaultPers.logo) : defaultNo.logo;
  }

  const nombre = (cfg.nombreMarcador || "").trim();
  if (club) {
    club.hidden = !(nombre && nombre !== "SIN NOMBRE");
    if (!club.hidden) club.textContent = nombre;
  }

  const fontFamily =
    (cfg.tipografia || "").toLowerCase().includes("con serif") ? defaultPers.fontSerif : defaultPers.fontSans;
  setCssVar("--marker-font-family", fontFamily);

  let btnColor = defaultNo.btnColor;
  if (cfg.personalizado) {
    const c = normalizeHex(cfg.colorPrincipal);
    if (c) btnColor = c;
  }
  setCssVar("--marker-btn-color", btnColor);
}

/* 6) Helpers
   ========================================================= */
function $(sel) {
  return document.querySelector(sel);
}
function $all(sel) {
  return Array.from(document.querySelectorAll(sel));
}
function show(el) {
  if (el) el.classList.remove("gp-hidden");
}
function hide(el) {
  if (el) el.classList.add("gp-hidden");
}
function showStep(stepNum) {
  $all(".gp-step-panel").forEach((p) => {
    const n = Number(p.getAttribute("data-step"));
    if (n === stepNum) show(p);
    else hide(p);
  });
}
function setCssVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}

/* setup-match.html
   ========================================================= */
function initSetupMatch() {
  const a1Nombre = document.getElementById("a1Nombre");
  if (!a1Nombre) return;

  const getCodeFromUrl = () => (new URLSearchParams(window.location.search).get("code") || "").trim();
  const code = getCodeFromUrl();

  let cfg = code ? getByCode(code) : null;
  if (cfg) setActive(cfg);
  if (!cfg) cfg = getActive();
  if (!cfg) return;

  const codeTxt = document.getElementById("codeTxt");
  if (codeTxt) codeTxt.textContent = cfg.code || "—";

  const linkViewer = document.getElementById("linkViewer");
  if (linkViewer) linkViewer.href = "viewer.html?code=" + encodeURIComponent(cfg.code);

  cfg.teams = cfg.teams || {
    a: { j1: { nombre: "", apellido: "" }, j2: { nombre: "", apellido: "" } },
    b: { j1: { nombre: "", apellido: "" }, j2: { nombre: "", apellido: "" } },
  };

  const campos = [
    ["a1Nombre", "a", "j1", "nombre"],
    ["a1Apellido", "a", "j1", "apellido"],
    ["a2Nombre", "a", "j2", "nombre"],
    ["a2Apellido", "a", "j2", "apellido"],
    ["b1Nombre", "b", "j1", "nombre"],
    ["b1Apellido", "b", "j1", "apellido"],
    ["b2Nombre", "b", "j2", "nombre"],
    ["b2Apellido", "b", "j2", "apellido"],
  ];

  campos.forEach(([id, team, j, field]) => {
    const el = document.getElementById(id);
    if (el) el.value = cfg.teams[team][j][field] || "";
  });

  function leerInputs() {
    campos.forEach(([id, team, j, field]) => {
      const el = document.getElementById(id);
      cfg.teams[team][j][field] = ((el && el.value) || "").trim();
    });
  }

  const btnGoAdmin = document.getElementById("btnGoAdmin");
  if (btnGoAdmin) {
    btnGoAdmin.addEventListener("click", () => {
      leerInputs();
      saveConfig(cfg);
      window.location.href = "control.html?code=" + encodeURIComponent(cfg.code);
    });
  }
}

/* INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initBurgerMenu();
  initWizard();
  initCreatedScores();
  initScoreScreen();
  initSetupMatch();
});
