console.log("✅ dashboard-filters.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.filters = DashboardBI.filters || {};

(function inicializarDashboardFilters() {
  function getState() {
    return DashboardBI.STATE || {};
  }

  function recarregarDashboardViaDados() {
    try {
      const contexto =
        typeof window.getContextoDashboardUsuario === "function"
          ? window.getContextoDashboardUsuario()
          : null;

      if (!contexto) {
        console.warn(
          "⚠️ Contexto do dashboard não encontrado ao recarregar filtros"
        );
        return;
      }

      if (DashboardBI.helpers?.destruirGraficos) {
        DashboardBI.helpers.destruirGraficos();
      }

      if (DashboardBI.data?.carregarDadosDashboard) {
        return DashboardBI.data.carregarDadosDashboard(contexto);
      }

      console.warn(
        "⚠️ DashboardBI.data.carregarDadosDashboard ainda não disponível"
      );
    } catch (erro) {
      console.error("❌ Erro ao recarregar dashboard via filtros:", erro);
    }
  }

  function reconstruirTelaDashboard() {
    try {
      if (DashboardBI.helpers?.destruirGraficos) {
        DashboardBI.helpers.destruirGraficos();
      }

      if (DashboardBI.views?.telaDashboard) {
        return DashboardBI.views.telaDashboard();
      }

      console.warn("⚠️ DashboardBI.views.telaDashboard ainda não disponível");
    } catch (erro) {
      console.error("❌ Erro ao reconstruir tela do dashboard:", erro);
    }
  }

  // ==========================
  // 📅 OPTIONS CLASSES
  // ==========================
  DashboardBI.filters.gerarOptionsClassesDashboard = function () {
    const classes = DashboardBI.helpers?.getClassesDisponiveis
      ? DashboardBI.helpers.getClassesDisponiveis()
      : [];

    const state = getState();

    let html = `<option value="TODAS">Todas as classes</option>`;

    classes.forEach((classe) => {
      html += `<option value="${classe}" ${
        state.classe === classe ? "selected" : ""
      }>${classe}</option>`;
    });

    return html;
  };

  // ==========================
  // 📊 OPTIONS INDICADORES
  // ==========================
  DashboardBI.filters.gerarOptionsIndicadoresDashboard = function () {
    const state = getState();

    const lista = DashboardBI.helpers?.getIndicadoresPorClasse
      ? DashboardBI.helpers.getIndicadoresPorClasse(state.classe)
      : [];

    let html = `<option value="TODOS">Todos os indicadores</option>`;

    lista.forEach((item) => {
      html += `<option value="${item.valor}" ${
        state.indicador === item.valor ? "selected" : ""
      }>${item.nome}</option>`;
    });

    return html;
  };

  // ==========================
  // 🏬 POPULAR SELECT DE LOJAS
  // ==========================
  DashboardBI.filters.popularSelectLojasDashboard = function (lojas) {
    const select = document.getElementById("dashLoja");
    if (!select) {
      console.log("ℹ️ Select dashLoja não encontrado");
      return;
    }

    const state = getState();
    let html = `<option value="TODAS">Todas as lojas</option>`;

    (lojas || []).forEach((loja) => {
      const chave = DashboardBI.helpers.getChaveLoja(loja);
      html += `<option value="${chave}" ${
        state.loja === chave ? "selected" : ""
      }>${chave}</option>`;
    });

    select.innerHTML = html;

    console.log("🏬 Select de lojas populado:", {
      totalLojas: (lojas || []).length,
      lojaSelecionada: state.loja,
    });
  };

  // ==========================
  // 🎯 ESCOPO BASE
  // ==========================
  DashboardBI.filters.aplicarEscopoBaseLojasDashboard = function (
    lojas,
    contexto
  ) {
    let lista = [...(lojas || [])];
    const state = getState();

    if (!contexto) return lista;

    if (state.visao === "regional") {
      if (contexto.escopo?.regional) {
        lista = lista.filter(
          (l) =>
            DashboardBI.helpers.normalizarTextoUpper(l.regional) ===
            DashboardBI.helpers.normalizarTextoUpper(contexto.escopo.regional)
        );
      }

      return lista;
    }

    if (contexto.escopo?.loja) {
      return lista.filter(
        (l) => DashboardBI.helpers.getChaveLoja(l) === contexto.escopo.loja
      );
    }

    return lista;
  };

  // ==========================
  // 🎛 APLICAR FILTROS VISUAIS
  // ==========================
  DashboardBI.filters.aplicarFiltrosVisuaisLojasDashboard = function (lojas) {
    let lista = [...(lojas || [])];
    const state = getState();

    if (state.visao === "regional") {
      if (state.regional !== "TODAS") {
        lista = lista.filter(
          (l) =>
            DashboardBI.helpers.normalizarTextoUpper(l.regional) ===
            DashboardBI.helpers.normalizarTextoUpper(state.regional)
        );
      }

      return lista;
    }

    if (state.loja && state.loja !== "TODAS") {
      return lista.filter(
        (l) => DashboardBI.helpers.getChaveLoja(l) === state.loja
      );
    }

    return lista;
  };

  // ==========================
  // 🔄 FILTROS DASHBOARD
  // ==========================
  DashboardBI.filters.dashboardAlterarSemana = async function (semana) {
    DashboardBI.setState({ semana });
    localStorage.setItem("semana", semana);

    console.log("📅 Dashboard semana alterada:", semana);
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarClasse = async function (classe) {
    DashboardBI.setState({
      classe,
      indicador: "TODOS",
    });

    console.log("📂 Dashboard classe alterada:", classe);

    const selIndicador = document.getElementById("dashIndicador");
    if (selIndicador) {
      selIndicador.innerHTML =
        DashboardBI.filters.gerarOptionsIndicadoresDashboard();
      selIndicador.value = "TODOS";
    }

    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarIndicador = async function (indicador) {
    DashboardBI.setState({ indicador });

    console.log("📊 Dashboard indicador alterado:", indicador);
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarRegional = async function (regional) {
    DashboardBI.setState({ regional });

    console.log("🌍 Dashboard regional alterada:", regional);
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarLoja = async function (loja) {
    DashboardBI.setState({ loja });

    console.log("🏬 Dashboard loja alterada:", loja);
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarVisao = async function (visao) {
    console.log("ℹ️ dashboardAlterarVisao chamado:", visao);

    DashboardBI.setState({
      visao: visao || getState().visao || "regional",
    });

    await reconstruirTelaDashboard();
  };

  // ==========================
  // 🌐 COMPATIBILIDADE GLOBAL
  // ==========================
  window.gerarOptionsClassesDashboard =
    DashboardBI.filters.gerarOptionsClassesDashboard;
  window.gerarOptionsIndicadoresDashboard =
    DashboardBI.filters.gerarOptionsIndicadoresDashboard;
  window.popularSelectLojasDashboard =
    DashboardBI.filters.popularSelectLojasDashboard;

  window.aplicarEscopoBaseLojasDashboard =
    DashboardBI.filters.aplicarEscopoBaseLojasDashboard;
  window.aplicarFiltrosVisuaisLojasDashboard =
    DashboardBI.filters.aplicarFiltrosVisuaisLojasDashboard;

  window.dashboardAlterarSemana = DashboardBI.filters.dashboardAlterarSemana;
  window.dashboardAlterarClasse = DashboardBI.filters.dashboardAlterarClasse;
  window.dashboardAlterarIndicador = DashboardBI.filters.dashboardAlterarIndicador;
  window.dashboardAlterarRegional = DashboardBI.filters.dashboardAlterarRegional;
  window.dashboardAlterarLoja = DashboardBI.filters.dashboardAlterarLoja;
  window.dashboardAlterarVisao = DashboardBI.filters.dashboardAlterarVisao;

  console.log("✅ dashboard-filters.js pronto", {
    gerarOptionsClassesDashboard:
      typeof DashboardBI.filters.gerarOptionsClassesDashboard,
    gerarOptionsIndicadoresDashboard:
      typeof DashboardBI.filters.gerarOptionsIndicadoresDashboard,
    aplicarEscopoBaseLojasDashboard:
      typeof DashboardBI.filters.aplicarEscopoBaseLojasDashboard,
    aplicarFiltrosVisuaisLojasDashboard:
      typeof DashboardBI.filters.aplicarFiltrosVisuaisLojasDashboard,
    dashboardAlterarSemana: typeof DashboardBI.filters.dashboardAlterarSemana,
    dashboardAlterarClasse: typeof DashboardBI.filters.dashboardAlterarClasse,
    dashboardAlterarIndicador:
      typeof DashboardBI.filters.dashboardAlterarIndicador,
    dashboardAlterarRegional: typeof DashboardBI.filters.dashboardAlterarRegional,
    dashboardAlterarLoja: typeof DashboardBI.filters.dashboardAlterarLoja,
    dashboardAlterarVisao: typeof DashboardBI.filters.dashboardAlterarVisao,
  });
})();