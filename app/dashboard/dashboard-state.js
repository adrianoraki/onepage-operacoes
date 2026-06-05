console.log("✅ dashboard-state.js carregado");

window.DashboardBI = window.DashboardBI || {};

(function inicializarDashboardState() {
  const LOG_PREFIX = "🧠 DashboardState";
  const hoje = new Date();

  const semanaAtual =
    typeof window.getSemanaAtual === "function"
      ? String(window.getSemanaAtual()).padStart(2, "0")
      : "01";

  const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
  const anoAtual = String(hoje.getFullYear());

  function logInfo(mensagem, payload = null) {
    if (payload !== null && payload !== undefined) {
      console.log(`${LOG_PREFIX} | ${mensagem}`, payload);
    } else {
      console.log(`${LOG_PREFIX} | ${mensagem}`);
    }
  }

  function logWarn(mensagem, payload = null) {
    if (payload !== null && payload !== undefined) {
      console.warn(`${LOG_PREFIX} | ${mensagem}`, payload);
    } else {
      console.warn(`${LOG_PREFIX} | ${mensagem}`);
    }
  }

  function textoSeguro(valor, fallback = "") {
    const texto = (valor || "").toString().trim();
    return texto || fallback;
  }

  function getStorage(key, fallback) {
    try {
      const valor = localStorage.getItem(key);
      return valor ?? fallback;
    } catch (erro) {
      logWarn(`Falha ao ler localStorage[${key}]`, erro);
      return fallback;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (erro) {
      logWarn(`Falha ao gravar localStorage[${key}]`, erro);
    }
  }

  function removerStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (erro) {
      logWarn(`Falha ao remover localStorage[${key}]`, erro);
    }
  }

  function normalizarPeriodo(valor, fallback = "MENSAL") {
    const texto = textoSeguro(valor).toUpperCase();

    if (["SEMANAL", "MENSAL", "ANUAL"].includes(texto)) {
      return texto;
    }

    return fallback;
  }

  function normalizarVisao(valor, fallback = "regional") {
    const texto = textoSeguro(valor).toLowerCase();

    if (texto === "regional" || texto === "gerencial") {
      return texto;
    }

    return fallback;
  }

  function normalizarSemana(valor, fallback = semanaAtual) {
    const texto = String(valor || fallback).replace(/\D/g, "").padStart(2, "0");
    return texto || fallback;
  }

  function normalizarMes(valor, fallback = mesAtual) {
    const texto = String(valor || fallback).replace(/\D/g, "").padStart(2, "0");
    return texto || fallback;
  }

  function normalizarAno(valor, fallback = anoAtual) {
    const texto = String(valor || fallback).replace(/\D/g, "");
    return texto || fallback;
  }

  function normalizarCampoRankingRegional(valor, fallback = "valor") {
    const texto = textoSeguro(valor, fallback).toLowerCase();

    if (["valor", "valor2", "mediavalor", "mediavalor2"].includes(texto)) {
      return texto;
    }

    return fallback;
  }

  function construirStateInicial() {
    const state = {
      // filtros-base
      semana: normalizarSemana(getStorage("semana", semanaAtual), semanaAtual),
      mes: normalizarMes(getStorage("dashboard_mes", mesAtual), mesAtual),
      ano: normalizarAno(getStorage("dashboard_ano", anoAtual), anoAtual),

      // visão e escopo visual
      visao: normalizarVisao(getStorage("dashboard_visao", "regional")),
      classe: getStorage("dashboard_classe", "TODAS") || "TODAS",
      indicador: getStorage("dashboard_indicador", "TODOS") || "TODOS",
      regional: getStorage("dashboard_regional", "TODAS") || "TODAS",
      loja: getStorage("dashboard_loja", "TODAS") || "TODAS",

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

      // suporte a ranking configurável por campo
      campoRankingRegional: normalizarCampoRankingRegional(
        getStorage("dashboard_campo_ranking_regional", "valor"),
        "valor"
      ),
    };

    logInfo("State inicial construído", state);
    return state;
  }

  DashboardBI.STATE = DashboardBI.STATE || construirStateInicial();

  DashboardBI.CONSTS = DashboardBI.CONSTS || {
    LIMITE_RANKING: 12,
    LIMITE_RANKING_REGIONAL: null,
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

    setStorage("semana", normalizarSemana(s.semana, semanaAtual));
    setStorage("dashboard_mes", normalizarMes(s.mes, mesAtual));
    setStorage("dashboard_ano", normalizarAno(s.ano, anoAtual));

    setStorage("dashboard_visao", normalizarVisao(s.visao, "regional"));
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

    setStorage(
      "dashboard_campo_ranking_regional",
      normalizarCampoRankingRegional(s.campoRankingRegional, "valor")
    );

    logInfo("DashboardBI.STATE persistido no localStorage", s);
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

    proximoState.semana = normalizarSemana(proximoState.semana, semanaAtual);
    proximoState.mes = normalizarMes(proximoState.mes, mesAtual);
    proximoState.ano = normalizarAno(proximoState.ano, anoAtual);

    proximoState.visao = normalizarVisao(proximoState.visao, "regional");
    proximoState.classe = proximoState.classe || "TODAS";
    proximoState.indicador = proximoState.indicador || "TODOS";
    proximoState.regional = proximoState.regional || "TODAS";
    proximoState.loja = proximoState.loja || "TODAS";
    proximoState.campoRankingRegional = normalizarCampoRankingRegional(
      proximoState.campoRankingRegional,
      "valor"
    );

    DashboardBI.STATE = proximoState;

    DashboardBI.persistState(proximoState);

    logInfo("DashboardBI.STATE atualizado", DashboardBI.STATE);
    return DashboardBI.STATE;
  };

  // ==========================
  // 🔄 RESET TOTAL
  // ==========================
  DashboardBI.resetState = function () {
    DashboardBI.STATE = construirStateInicial();

    DashboardBI.persistState(DashboardBI.STATE);

    logInfo("DashboardBI.STATE resetado", DashboardBI.STATE);
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
      campoRankingRegional: "valor",
    };

    DashboardBI.persistState(DashboardBI.STATE);

    logInfo("Filtros visuais do dashboard resetados", DashboardBI.STATE);
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

    logInfo("Períodos do dashboard resetados", DashboardBI.STATE);
    return DashboardBI.STATE;
  };

  // ==========================
  // 🧹 LIMPAR STORAGE DO DASHBOARD
  // ==========================
  DashboardBI.clearStorage = function () {
    [
      "semana",
      "dashboard_mes",
      "dashboard_ano",
      "dashboard_visao",
      "dashboard_classe",
      "dashboard_indicador",
      "dashboard_regional",
      "dashboard_loja",
      "dashboard_periodo",
      "dashboard_periodo_ranking",
      "dashboard_campo_ranking_regional",
    ].forEach(removerStorage);

    logInfo("Storage do dashboard limpo");
  };

  // ==========================
  // 🧪 HELPERS DE ESTADO
  // ==========================
  DashboardBI.stateUtils = DashboardBI.stateUtils || {};

  DashboardBI.stateUtils.normalizarPeriodo = normalizarPeriodo;
  DashboardBI.stateUtils.normalizarVisao = normalizarVisao;
  DashboardBI.stateUtils.normalizarSemana = normalizarSemana;
  DashboardBI.stateUtils.normalizarMes = normalizarMes;
  DashboardBI.stateUtils.normalizarAno = normalizarAno;
  DashboardBI.stateUtils.normalizarCampoRankingRegional =
    normalizarCampoRankingRegional;

  DashboardBI.stateUtils.getSemanaAtual = function () {
    return semanaAtual;
  };

  DashboardBI.stateUtils.getMesAtual = function () {
    return mesAtual;
  };

  DashboardBI.stateUtils.getAnoAtual = function () {
    return anoAtual;
  };

  DashboardBI.stateUtils.getDefaults = function () {
    return {
      semanaAtual,
      mesAtual,
      anoAtual,
    };
  };

  logInfo("dashboard-state.js pronto", {
    state: DashboardBI.STATE,
    limiteRanking: DashboardBI.CONSTS.LIMITE_RANKING,
    limiteRankingRegional: DashboardBI.CONSTS.LIMITE_RANKING_REGIONAL,
    periodosValidos: DashboardBI.CONSTS.PERIODOS_VALIDOS,
    charts: Object.keys(window.dashboardCharts || {}),
  });
})();