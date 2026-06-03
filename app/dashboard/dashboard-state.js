console.log("✅ dashboard-state.js carregado");

window.DashboardBI = window.DashboardBI || {};

(function inicializarDashboardState() {
  const semanaAtual =
    typeof window.getSemanaAtual === "function"
      ? String(window.getSemanaAtual()).padStart(2, "0")
      : "01";

  DashboardBI.STATE = DashboardBI.STATE || {
    semana: localStorage.getItem("semana") || semanaAtual,
    visao: "regional",
    classe: "TODAS",
    indicador: "TODOS",
    regional: "TODAS",
    loja: "TODAS",
  };

  DashboardBI.CONSTS = DashboardBI.CONSTS || {
    LIMITE_RANKING: 12,
  };

  window.dashboardCharts = window.dashboardCharts || {
    evolucao: null,
    ranking: null,
    classes: null,
  };

  DashboardBI.getState = function () {
    return DashboardBI.STATE;
  };

  DashboardBI.setState = function (patch = {}) {
    DashboardBI.STATE = {
      ...DashboardBI.STATE,
      ...(patch || {}),
    };

    console.log("🧠 DashboardBI.STATE atualizado:", DashboardBI.STATE);
    return DashboardBI.STATE;
  };

  DashboardBI.resetState = function () {
    DashboardBI.STATE = {
      semana: localStorage.getItem("semana") || semanaAtual,
      visao: "regional",
      classe: "TODAS",
      indicador: "TODOS",
      regional: "TODAS",
      loja: "TODAS",
    };

    console.log("🔄 DashboardBI.STATE resetado:", DashboardBI.STATE);
    return DashboardBI.STATE;
  };

  console.log("✅ dashboard-state.js pronto", {
    state: DashboardBI.STATE,
    limiteRanking: DashboardBI.CONSTS.LIMITE_RANKING,
    charts: Object.keys(window.dashboardCharts || {}),
  });
})();