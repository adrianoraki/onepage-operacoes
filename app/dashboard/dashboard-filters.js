console.log("✅ dashboard-filters.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.filters = DashboardBI.filters || {};

(function inicializarDashboardFilters() {
  function getState() {
    return DashboardBI.STATE || {};
  }

  function getPeriodoNormalizado(valor, fallback = "MENSAL") {
    if (DashboardBI.stateUtils?.normalizarPeriodo) {
      return DashboardBI.stateUtils.normalizarPeriodo(valor, fallback);
    }

    const texto = (valor || "").toString().trim().toUpperCase();
    if (["SEMANAL", "MENSAL", "ANUAL"].includes(texto)) return texto;
    return fallback;
  }

  function getContextoAtualDashboard() {
    try {
      if (typeof window.getContextoDashboardUsuario === "function") {
        return window.getContextoDashboardUsuario();
      }
    } catch (erro) {
      console.error("❌ Erro ao obter contexto atual do dashboard:", erro);
    }

    return null;
  }

  function recarregarDashboardViaDados() {
    try {
      const contexto = getContextoAtualDashboard();

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

  function usuarioEhGlobal(contexto) {
    const escopo = contexto?.escopo || {};
    const perfil = (contexto?.usuario?.perfil || "").toString().toLowerCase();

    return escopo.tipo === "global" || perfil === "master";
  }

  function getAnosDisponiveisDashboard() {
    const anoAtual = Number(
      DashboardBI.stateUtils?.getAnoAtual?.() || new Date().getFullYear()
    );

    const anos = [];
    for (let ano = anoAtual - 3; ano <= anoAtual + 1; ano++) {
      anos.push(String(ano));
    }

    return anos;
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
  // ⏱️ OPTIONS PERÍODO DASHBOARD
  // ==========================
  DashboardBI.filters.gerarOptionsPeriodoDashboard = function () {
    const state = getState();
    const periodo = getPeriodoNormalizado(state.periodoDashboard, "MENSAL");

    return `
      <option value="SEMANAL" ${
        periodo === "SEMANAL" ? "selected" : ""
      }>Dashboard semanal</option>
      <option value="MENSAL" ${
        periodo === "MENSAL" ? "selected" : ""
      }>Dashboard mensal</option>
      <option value="ANUAL" ${
        periodo === "ANUAL" ? "selected" : ""
      }>Dashboard anual</option>
    `;
  };

  // ==========================
  // 🏆 OPTIONS PERÍODO RANKING
  // ==========================
  DashboardBI.filters.gerarOptionsPeriodoRanking = function () {
    const state = getState();
    const periodo = getPeriodoNormalizado(state.periodoRanking, "MENSAL");

    return `
      <option value="SEMANAL" ${
        periodo === "SEMANAL" ? "selected" : ""
      }>Ranking semanal</option>
      <option value="MENSAL" ${
        periodo === "MENSAL" ? "selected" : ""
      }>Ranking mensal</option>
      <option value="ANUAL" ${
        periodo === "ANUAL" ? "selected" : ""
      }>Ranking anual</option>
    `;
  };

  // ==========================
  // 🗓️ OPTIONS MESES
  // ==========================
  DashboardBI.filters.gerarOptionsMesesDashboard = function () {
    const state = getState();
    const mesAtual = String(state.mes || "01").padStart(2, "0");

    const meses = [
      { valor: "01", nome: "Janeiro" },
      { valor: "02", nome: "Fevereiro" },
      { valor: "03", nome: "Março" },
      { valor: "04", nome: "Abril" },
      { valor: "05", nome: "Maio" },
      { valor: "06", nome: "Junho" },
      { valor: "07", nome: "Julho" },
      { valor: "08", nome: "Agosto" },
      { valor: "09", nome: "Setembro" },
      { valor: "10", nome: "Outubro" },
      { valor: "11", nome: "Novembro" },
      { valor: "12", nome: "Dezembro" },
    ];

    return meses
      .map(
        (m) =>
          `<option value="${m.valor}" ${
            mesAtual === m.valor ? "selected" : ""
          }>${m.nome}</option>`
      )
      .join("");
  };

  // ==========================
  // 🗓️ OPTIONS ANOS
  // ==========================
  DashboardBI.filters.gerarOptionsAnosDashboard = function () {
    const state = getState();
    const anoAtual = String(state.ano || new Date().getFullYear());
    const anos = getAnosDisponiveisDashboard();

    return anos
      .map(
        (ano) =>
          `<option value="${ano}" ${
            anoAtual === ano ? "selected" : ""
          }>${ano}</option>`
      )
      .join("");
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

    if (usuarioEhGlobal(contexto)) {
      console.log("🌐 Usuário global/master no dashboard: sem filtro base de escopo");
      return lista;
    }

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

    console.log("📅 Dashboard semana alterada:", semana);
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarMes = async function (mes) {
    DashboardBI.setState({ mes: String(mes).padStart(2, "0") });

    console.log("🗓️ Dashboard mês alterado:", mes);
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarAno = async function (ano) {
    DashboardBI.setState({ ano: String(ano) });

    console.log("🗓️ Dashboard ano alterado:", ano);
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarPeriodoDashboard = async function (
    periodoDashboard
  ) {
    const periodo = getPeriodoNormalizado(periodoDashboard, "MENSAL");

    DashboardBI.setState({ periodoDashboard: periodo });

    console.log("⏱️ Período principal do dashboard alterado:", periodo);
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarPeriodoRanking = async function (
    periodoRanking
  ) {
    const periodo = getPeriodoNormalizado(periodoRanking, "MENSAL");

    DashboardBI.setState({ periodoRanking: periodo });

    console.log("🏆 Período do ranking alterado:", periodo);
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

    const contexto = getContextoAtualDashboard();
    const ehGlobal = usuarioEhGlobal(contexto);

    const novoState = {
      visao: visao || getState().visao || "regional",
    };

    // quando muda a visão, zera os filtros dependentes
    if (novoState.visao === "regional") {
      novoState.loja = "TODAS";
      if (ehGlobal) novoState.regional = "TODAS";
    }

    if (novoState.visao === "gerencial") {
      novoState.regional = "TODAS";
      if (ehGlobal) novoState.loja = "TODAS";
    }

    DashboardBI.setState(novoState);

    await reconstruirTelaDashboard();
  };

  // ==========================
  // 🌐 COMPATIBILIDADE GLOBAL
  // ==========================
  window.gerarOptionsClassesDashboard =
    DashboardBI.filters.gerarOptionsClassesDashboard;
  window.gerarOptionsIndicadoresDashboard =
    DashboardBI.filters.gerarOptionsIndicadoresDashboard;
  window.gerarOptionsPeriodoDashboard =
    DashboardBI.filters.gerarOptionsPeriodoDashboard;
  window.gerarOptionsPeriodoRanking =
    DashboardBI.filters.gerarOptionsPeriodoRanking;
  window.gerarOptionsMesesDashboard =
    DashboardBI.filters.gerarOptionsMesesDashboard;
  window.gerarOptionsAnosDashboard =
    DashboardBI.filters.gerarOptionsAnosDashboard;

  window.popularSelectLojasDashboard =
    DashboardBI.filters.popularSelectLojasDashboard;

  window.aplicarEscopoBaseLojasDashboard =
    DashboardBI.filters.aplicarEscopoBaseLojasDashboard;
  window.aplicarFiltrosVisuaisLojasDashboard =
    DashboardBI.filters.aplicarFiltrosVisuaisLojasDashboard;

  window.dashboardAlterarSemana = DashboardBI.filters.dashboardAlterarSemana;
  window.dashboardAlterarMes = DashboardBI.filters.dashboardAlterarMes;
  window.dashboardAlterarAno = DashboardBI.filters.dashboardAlterarAno;
  window.dashboardAlterarPeriodoDashboard =
    DashboardBI.filters.dashboardAlterarPeriodoDashboard;
  window.dashboardAlterarPeriodoRanking =
    DashboardBI.filters.dashboardAlterarPeriodoRanking;
  window.dashboardAlterarClasse = DashboardBI.filters.dashboardAlterarClasse;
  window.dashboardAlterarIndicador =
    DashboardBI.filters.dashboardAlterarIndicador;
  window.dashboardAlterarRegional =
    DashboardBI.filters.dashboardAlterarRegional;
  window.dashboardAlterarLoja = DashboardBI.filters.dashboardAlterarLoja;
  window.dashboardAlterarVisao = DashboardBI.filters.dashboardAlterarVisao;

  console.log("✅ dashboard-filters.js pronto", {
    gerarOptionsClassesDashboard:
      typeof DashboardBI.filters.gerarOptionsClassesDashboard,
    gerarOptionsIndicadoresDashboard:
      typeof DashboardBI.filters.gerarOptionsIndicadoresDashboard,
    gerarOptionsPeriodoDashboard:
      typeof DashboardBI.filters.gerarOptionsPeriodoDashboard,
    gerarOptionsPeriodoRanking:
      typeof DashboardBI.filters.gerarOptionsPeriodoRanking,
    gerarOptionsMesesDashboard:
      typeof DashboardBI.filters.gerarOptionsMesesDashboard,
    gerarOptionsAnosDashboard:
      typeof DashboardBI.filters.gerarOptionsAnosDashboard,
    aplicarEscopoBaseLojasDashboard:
      typeof DashboardBI.filters.aplicarEscopoBaseLojasDashboard,
    aplicarFiltrosVisuaisLojasDashboard:
      typeof DashboardBI.filters.aplicarFiltrosVisuaisLojasDashboard,
    dashboardAlterarSemana: typeof DashboardBI.filters.dashboardAlterarSemana,
    dashboardAlterarMes: typeof DashboardBI.filters.dashboardAlterarMes,
    dashboardAlterarAno: typeof DashboardBI.filters.dashboardAlterarAno,
    dashboardAlterarPeriodoDashboard:
      typeof DashboardBI.filters.dashboardAlterarPeriodoDashboard,
    dashboardAlterarPeriodoRanking:
      typeof DashboardBI.filters.dashboardAlterarPeriodoRanking,
    dashboardAlterarClasse: typeof DashboardBI.filters.dashboardAlterarClasse,
    dashboardAlterarIndicador:
      typeof DashboardBI.filters.dashboardAlterarIndicador,
    dashboardAlterarRegional:
      typeof DashboardBI.filters.dashboardAlterarRegional,
    dashboardAlterarLoja: typeof DashboardBI.filters.dashboardAlterarLoja,
    dashboardAlterarVisao: typeof DashboardBI.filters.dashboardAlterarVisao,
  });
})();