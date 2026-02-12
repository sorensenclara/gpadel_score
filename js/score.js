(function () {
  "use strict";

  const LIST_KEY = "gpadel_configs";
  const ACTIVE_KEY = "gpadel_config_activa";

  const ASSET_BASE = new URL("../img/", document.currentScript ? document.currentScript.src : window.location.href).href;

  function readConfigs() {
    const raw = localStorage.getItem(LIST_KEY);
    return raw ? JSON.parse(raw) : [];
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

  function getCodeFromUrl() {
    const p = new URLSearchParams(window.location.search);
    return (p.get("code") || "").trim();
  }

  function setCssVar(name, value) {
    document.documentElement.style.setProperty(name, value);
  }

  function normalizeHex(input) {
    let s = (input || "").trim();
    if (!s) return "";
    if (s[0] !== "#") s = "#" + s;
    return /^#[0-9A-Fa-f]{6}$/.test(s) ? s.toUpperCase() : "";
  }

  function applyBrand(cfg) {
    const defaultNo = {
      bg: new URL("bggpadel.png", ASSET_BASE).href,
      logo: new URL("gpadel-logo-white.svg", ASSET_BASE).href,
      btnColor: "#cbdc00",
    };

    const defaultPers = {
      bg: new URL("bggpadel-white.png", ASSET_BASE).href,
      logo: new URL("gpadel-logo.svg", ASSET_BASE).href,
      fontSans: '"Titillium Web", Arial, sans-serif',
      fontSerif: '"Times New Roman", Times, serif',
    };

    const body = document.body;
    const logoImg = document.getElementById("logo");

    if (cfg.personalizado) {
      setCssVar("--marker-bg-image", `url("${defaultPers.bg}")`);
      setCssVar("--marker-text-color", "#111");
      body.classList.add("bg-white");
    } else {
      setCssVar("--marker-bg-image", `url("${defaultNo.bg}")`);
      setCssVar("--marker-text-color", "#fff");
      body.classList.remove("bg-white");
    }

     if (cfg.personalizado) {
      setCssVar("--pb2-panel", "rgba(255,255,255,.82)");
      setCssVar("--pb2-panel-2", "rgba(255,255,255,.70)");
      setCssVar("--pb2-border", "rgba(15,23,42,.18)");
      setCssVar("--pb2-muted", "rgba(15,23,42,.72)");
      setCssVar("--pb2-code-bg", "rgba(15,23,42,.06)");
      setCssVar("--pb2-code-text", "#111");
      setCssVar("--pb2-status-bg", "rgba(15,23,42,.06)");
    } else {
      setCssVar("--pb2-panel", "rgba(0,0,0,.38)");
      setCssVar("--pb2-panel-2", "rgba(0,0,0,.22)");
      setCssVar("--pb2-border", "rgba(255,255,255,.22)");
      setCssVar("--pb2-muted", "rgba(255,255,255,.78)");
      setCssVar("--pb2-code-bg", "rgba(0,0,0,.35)");
      setCssVar("--pb2-code-text", "#fff");
      setCssVar("--pb2-status-bg", "rgba(255,255,255,.08)");
    }


    body.classList.remove("is-personalizado", "is-no-personalizado");
    body.classList.add(cfg.personalizado ? "is-personalizado" : "is-no-personalizado");


    if (logoImg) {
      logoImg.src = cfg.personalizado
        ? (cfg.logoDataUrl || defaultPers.logo)
        : defaultNo.logo;
    }

    const usaSerif = (cfg.tipografia || "").toLowerCase().includes("con serif");
    const fontFamily = usaSerif ? defaultPers.fontSerif : defaultPers.fontSans;
    setCssVar("--marker-font-family", fontFamily);

    let btnColor = defaultNo.btnColor;
    if (cfg.personalizado) {
      const c = normalizeHex(cfg.colorPrincipal);
      if (c) btnColor = c;
    }
    setCssVar("--marker-btn-color", btnColor);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  const matchKey = (code) => "gpadel_match_" + code;
  const teamsKey = (code) => "gpadel_teams_" + code;


  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeJSON(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  function defaultMatch(modalidad) {
    return {
      modalidad: modalidad || "3_sets",
      setsA: 0,
      setsB: 0,
      currentSet: 1,
      gamesA: [0, 0, 0],
      gamesB: [0, 0, 0],
      pointIndexA: 0,
      pointIndexB: 0,
      superTbA: 0,
      superTbB: 0,
    };
  }

  const POINTS = ["0", "15", "30", "40", "AD"];

  function isSuperTbSet(match) {
    return match.modalidad === "2_sets_super_tb" && match.currentSet === 3;
  }

  function isMatchFinished(match) {
    return match.setsA === 2 || match.setsB === 2;
  }

  function checkSetWinner(match) {
    if (isSuperTbSet(match)) return;

    const idx = match.currentSet - 1;
    const ga = match.gamesA[idx];
    const gb = match.gamesB[idx];
    const diff = Math.abs(ga - gb);

    const aWins = (ga >= 6 && diff >= 2) || ga === 7;
    const bWins = (gb >= 6 && diff >= 2) || gb === 7;

    if (!aWins && !bWins) return;

    if (aWins) match.setsA++;
    else match.setsB++;

    if (!isMatchFinished(match)) {
      match.currentSet++;
      match.pointIndexA = 0;
      match.pointIndexB = 0;
    }
  }

  function winGame(match, team) {
    const idx = match.currentSet - 1;
    if (team === "A") match.gamesA[idx]++;
    else match.gamesB[idx]++;

    match.pointIndexA = 0;
    match.pointIndexB = 0;

    checkSetWinner(match);
  }

  function handleAdvantage(match, team) {
    const a = match.pointIndexA;
    const b = match.pointIndexB;

    if (a === 3 && b === 3) {
      if (team === "A") match.pointIndexA = 4;
      else match.pointIndexB = 4;
      return;
    }

    if (a === 4) {
      if (team === "A") return winGame(match, "A");
      match.pointIndexA = 3;
      match.pointIndexB = 3;
      return;
    }

    if (b === 4) {
      if (team === "B") return winGame(match, "B");
      match.pointIndexA = 3;
      match.pointIndexB = 3;
      return;
    }
  }

  function addSuperTbPoint(match, team) {
    if (team === "A") match.superTbA++;
    else match.superTbB++;

    const a = match.superTbA;
    const b = match.superTbB;
    const diff = Math.abs(a - b);

    if ((a >= 10 || b >= 10) && diff >= 2) {
      if (a > b) match.setsA++;
      else match.setsB++;
    }
  }

  function addPoint(match, team) {
    if (isMatchFinished(match)) return;

    if (isSuperTbSet(match)) {
      addSuperTbPoint(match, team);
      return;
    }

    if (match.pointIndexA === 4 || match.pointIndexB === 4) {
      handleAdvantage(match, team);
      return;
    }

    if (team === "A") match.pointIndexA++;
    else match.pointIndexB++;

    if (match.pointIndexA === 4 && match.pointIndexB <= 2) winGame(match, "A");
    if (match.pointIndexB === 4 && match.pointIndexA <= 2) winGame(match, "B");
  }

  function renderAll(cfg, codigo, match, teams) {
    setText("codePill", codigo || "—");
    setText("codeLabel", codigo ? "Código: " + codigo : "");

    const modeTitle = document.getElementById("modeTitle");
    if (modeTitle) {
      modeTitle.textContent =
        cfg.modalidad === "2_sets_super_tb"
          ? "PARTIDO 2 SETS + SUPER TIE-BREAK"
          : "PARTIDO A 3 SETS";
    }

    const aName = teams && teams.teamA ? teams.teamA : "A / A";
    const bName = teams && teams.teamB ? teams.teamB : "V / V";
    setText("teamAName", aName);
    setText("teamBName", bName);

    const idx = match.currentSet - 1;

    setText("setsA", match.setsA);
    setText("setsB", match.setsB);

    setText("gamesA", match.gamesA[idx] || 0);
    setText("gamesB", match.gamesB[idx] || 0);

    // tabla de sets
    setText("s1a", match.gamesA[0] || 0);
    setText("s1b", match.gamesB[0] || 0);
    setText("s2a", match.gamesA[1] || 0);
    setText("s2b", match.gamesB[1] || 0);
    setText("s3a", match.gamesA[2] || 0);
    setText("s3b", match.gamesB[2] || 0);

    const superWrap = document.getElementById("superTbWrap");
    if (isSuperTbSet(match)) {
      if (superWrap) superWrap.classList.remove("gp-hidden");
      setText("pointsA", "-");
      setText("pointsB", "-");
      setText("superTbA", match.superTbA);
      setText("superTbB", match.superTbB);
    } else {
      if (superWrap) superWrap.classList.add("gp-hidden");
      setText("pointsA", POINTS[match.pointIndexA] || "0");
      setText("pointsB", POINTS[match.pointIndexB] || "0");
    }

    const status = document.getElementById("matchStatus");
    if (status) {
      status.textContent = isMatchFinished(match)
        ? "Finalizado: " + (match.setsA > match.setsB ? "Gana A" : "Gana B")
        : "Set actual: " + match.currentSet;
    }
  }

  function initScoreLanding(cfg, codigo) {
    const btn = document.getElementById("btnCrearPartido");
    if (!btn) return;

    btn.addEventListener("click", () => {
      if (!codigo) return;
      window.location.href = "teams.html?code=" + encodeURIComponent(codigo);
    });

    const club = document.getElementById("clubLiga");
    if (!club) return;

    const nombre = (cfg.nombreMarcador || "").trim();
    const ok = nombre && nombre !== "SIN NOMBRE";
    club.hidden = !ok;
    if (ok) club.textContent = nombre;
  }

  function initTeams(cfg, codigo) {
    const form = document.getElementById("teamsForm");
    if (!form) return;

    const linkViewer = document.getElementById("linkViewer");
    if (linkViewer) linkViewer.href = "viewer.html?code=" + encodeURIComponent(codigo);

    const v = (id) => {
      const el = document.getElementById(id);
      return el ? (el.value || "").trim() : "";
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const teamA = (v("a1a") || v("a2a"))
        ? (v("a1a") + " / " + v("a2a")).trim()
        : "A / A";

      const teamB = (v("b1a") || v("b2a"))
        ? (v("b1a") + " / " + v("b2a")).trim()
        : "V / V";

      writeJSON(teamsKey(codigo), {
        a1n: v("a1n"), a1a: v("a1a"), a2n: v("a2n"), a2a: v("a2a"),
        b1n: v("b1n"), b1a: v("b1a"), b2n: v("b2n"), b2a: v("b2a"),
        teamA,
        teamB,
      });

      const mk = matchKey(codigo);
      const current = readJSON(mk, null);
      if (!current) writeJSON(mk, defaultMatch(cfg.modalidad));

      window.location.href = "control.html?code=" + encodeURIComponent(codigo);
    });
  }

  function initControlOrViewer(cfg, codigo) {
    const isControl = !!document.getElementById("btnAddA") || !!document.getElementById("btnAddB");
    const isViewer = !isControl && (!!document.getElementById("gamesA") || !!document.getElementById("teamAName"));
    if (!isControl && !isViewer) return;

    const linkViewer = document.getElementById("linkViewer");
    if (linkViewer) linkViewer.href = "viewer.html?code=" + encodeURIComponent(codigo);

    const mk = matchKey(codigo);


    let match = readJSON(mk, null) || defaultMatch(cfg.modalidad);
    match.modalidad = cfg.modalidad || match.modalidad;


    const teams = readJSON(teamsKey(codigo), { teamA: "A / A", teamB: "V / V" });

    const persistAndRender = () => {
      writeJSON(mk, match);
      renderAll(cfg, codigo, match, teams);
    };

    if (isControl) {
      const addA = document.getElementById("btnAddA");
      const addB = document.getElementById("btnAddB");

      if (addA) addA.addEventListener("click", () => (addPoint(match, "A"), persistAndRender()));
      if (addB) addB.addEventListener("click", () => (addPoint(match, "B"), persistAndRender()));
    }


    window.addEventListener("storage", (ev) => {
      if (ev.key !== mk) return;
      const updated = readJSON(mk, null);
      if (!updated) return;
      match = updated;
      renderAll(cfg, codigo, match, teams);
    });

    persistAndRender();
  }


  document.addEventListener("DOMContentLoaded", () => {
    let codigo = getCodeFromUrl();

    let cfg = codigo ? getByCode(codigo) : null;
    if (cfg) setActive(cfg);
    if (!cfg) cfg = getActive();

    if (!cfg) {
      cfg = {
        code: codigo || "",
        personalizado: false,
        nombreMarcador: "SIN NOMBRE",
        modalidad: "3_sets",
        logoDataUrl: "",
        colorPrincipal: "",
        tipografia: "sin serif",
      };
    }

    if (!codigo) codigo = (cfg.code || "").trim();

    applyBrand(cfg);

    initScoreLanding(cfg, codigo);
    initTeams(cfg, codigo);
    initControlOrViewer(cfg, codigo);
  });
})();
