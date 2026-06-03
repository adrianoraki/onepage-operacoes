console.log("✅ dashboard-state.js carregado");

window.DashboardBI = window.DashboardBI || {};

(function inicializarDashboardState() {
  const hoje = new Date();

  const semanaAtual =
    typeof window.getSemanaAtual === "function"
      ? String(window.getSemanaAtual()).padStart(2, "0")
      : "01";

  const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
  const anoAtual = String(hoje.getFullYear());

  function getStorage(key, fallback) {
    try {
      const valor = localStorage.getItem(key);
      return valor ?? fallback;
    } catch (erro) {
      console.warn(`⚠️ Falha ao ler localStorage[${key}]`, erro);
      return fallback;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (erro) {
      console.warn(`⚠️ Falha ao gravar localStorage[${key}]`, erro);
    }
  }

  function normalizarPeriodo(valor, fallback = "MENSAL") {
    const texto = (valor || "").toString().trim().toUpperCase();

    if (["SEMANAL", "MENSAL", "ANUAL"].includes(texto)) {
      return texto;
    }

    return fallback;
  }

  function construirStateInicial() {
    return {
      // filtros-base
      semana: getStorage("semana", semanaAtual),
      mes: getStorage("dashboard_mes", mesAtual),
      ano: getStorage("dashboard_ano", anoAtual),

      // visão e escopo visual
      visao: getStorage("dashboard_visao", "regional"),
      classe: getStorage("dashboard_classe", "TODAS"),
      indicador: getStorage("dashboard_indicador", "TODOS"),
      regional: getStorage("dashboard_regional", "TODAS"),
      loja: getStorage("dashboard_loja", "TODAS"),

      // período principal do dashboard
      periodoDashboard: normalizarPeriodo(
        getStorage("dashboard_periodo", "MENSAL"),
        "MENSAL"
      ),

      // período específico do ranking
      periodoRanking: normalizarPeriodo(
        getStorage("dashboard_periodo_ranking", "MENSAL"),
        "MENSAL"
      ),
    };
  }

  DashboardBI.STATE = DashboardBI.STATE || construirStateInicial();

  DashboardBI.CONSTS = DashboardBI.CONSTS || {
    LIMITE_RANKING: 12,
    PERIODOS_VALIDOS: ["SEMANAL", "MENSAL", "ANUAL"],
  };

  window.dashboardCharts = window.dashboardCharts || {
    evolucao: null,
    ranking: null,
    classes: null,
  };

  // ==========================
  // 📦 GET STATE
  // ==========================
  DashboardBI.getState = function () {
    return DashboardBI.STATE;
  };

  // ==========================
  // 💾 PERSISTIR STATE
  // ==========================
  DashboardBI.persistState = function (state = null) {
    const s = state || DashboardBI.STATE || {};

    setStorage("semana", s.semana || semanaAtual);
    setStorage("dashboard_mes", s.mes || mesAtual);
    setStorage("dashboard_ano", s.ano || anoAtual);

    setStorage("dashboard_visao", s.visao || "regional");
    setStorage("dashboard_classe", s.classe || "TODAS");
    setStorage("dashboard_indicador", s.indicador || "TODOS");
    setStorage("dashboard_regional", s.regional || "TODAS");
    setStorage("dashboard_loja", s.loja || "TODAS");

    setStorage(
      "dashboard_periodo",
      normalizarPeriodo(s.periodoDashboard, "MENSAL")
    );

    setStorage(
      "dashboard_periodo_ranking",
      normalizarPeriodo(s.periodoRanking, "MENSAL")
    );

    console.log("💾 DashboardBI.STATE persistido no localStorage:", s);
    return s;
  };

  // ==========================
  // 🧠 SET STATE
  // ==========================
  DashboardBI.setState = function (patch = {}) {
    const stateAtual = DashboardBI.STATE || {};

    const proximoState = {
      ...stateAtual,
      ...(patch || {}),
    };

    // normalizações obrigatórias
    proximoState.periodoDashboard = normalizarPeriodo(
      proximoState.periodoDashboard,
      "MENSAL"
    );

    proximoState.periodoRanking = normalizarPeriodo(
      proximoState.periodoRanking,
      "MENSAL"
    );

    proximoState.semana = String(proximoState.semana || semanaAtual).padStart(
      2,
      "0"
    );
    proximoState.mes = String(proximoState.mes || mesAtual).padStart(2, "0");
    proximoState.ano = String(proximoState.ano || anoAtual);

    proximoState.visao = proximoState.visao || "regional";
    proximoState.classe = proximoState.classe || "TODAS";
    proximoState.indicador = proximoState.indicador || "TODOS";
    proximoState.regional = proximoState.regional || "TODAS";
    proximoState.loja = proximoState.loja || "TODAS";

    DashboardBI.STATE = proximoState;

    DashboardBI.persistState(proximoState);

    console.log("🧠 DashboardBI.STATE atualizado:", DashboardBI.STATE);
    return DashboardBI.STATE;
  };

  // ==========================
  // 🔄 RESET TOTAL
  // ==========================
  DashboardBI.resetState = function () {
    DashboardBI.STATE = construirStateInicial();

    DashboardBI.persistState(DashboardBI.STATE);

    console.log("🔄 DashboardBI.STATE resetado:", DashboardBI.STATE);
    return DashboardBI.STATE;
  };

  // ==========================
  // 🔄 RESET SÓ FILTROS VISUAIS
  // ==========================
  DashboardBI.resetFiltrosVisuais = function () {
    const atual = DashboardBI.STATE || construirStateInicial();

    DashboardBI.STATE = {
      ...atual,
      classe: "TODAS",
      indicador: "TODOS",
      regional: "TODAS",
      loja: "TODAS",
    };

    DashboardBI.persistState(DashboardBI.STATE);

    console.log("🔄 Filtros visuais do dashboard resetados:", DashboardBI.STATE);
    return DashboardBI.STATE;
  };

  // ==========================
  // 🔄 RESET SÓ PERÍODOS
  // ==========================
  DashboardBI.resetPeriodos = function () {
    const atual = DashboardBI.STATE || construirStateInicial();

    DashboardBI.STATE = {
      ...atual,
      semana: semanaAtual,
      mes: mesAtual,
      ano: anoAtual,
      periodoDashboard: "MENSAL",
      periodoRanking: "MENSAL",
    };

    DashboardBI.persistState(DashboardBI.STATE);

    console.log("🔄 Períodos do dashboard resetados:", DashboardBI.STATE);
    return DashboardBI.STATE;
  };

  // ==========================
  // 🧪 HELPERS DE ESTADO
  // ==========================
  DashboardBI.stateUtils = DashboardBI.stateUtils || {};

  DashboardBI.stateUtils.normalizarPeriodo = normalizarPeriodo;
  DashboardBI.stateUtils.getSemanaAtual = function () {
    return semanaAtual;
  };
  DashboardBI.stateUtils.getMesAtual = function () {
    return mesAtual;
  };
  DashboardBI.stateUtils.getAnoAtual = function () {
    return anoAtual;
  };

  console.log("✅ dashboard-state.js pronto", {
    state: DashboardBI.STATE,
    limiteRanking: DashboardBI.CONSTS.LIMITE_RANKING,
    periodosValidos: DashboardBI.CONSTS.PERIODOS_VALIDOS,
    charts: Object.keys(window.dashboardCharts || {}),
  });
})();