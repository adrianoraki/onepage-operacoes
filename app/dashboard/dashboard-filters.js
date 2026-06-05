console.log("✅ dashboard-filters.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.filters = DashboardBI.filters || {};

(function inicializarDashboardFilters() {
  const LOG_PREFIX = "🎛️ DashboardFilters";
  const STORAGE_ANOS_VISIVEIS = "dashboard_anos_visiveis";

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

  function logError(mensagem, payload = null) {
    if (payload !== null && payload !== undefined) {
      console.error(`${LOG_PREFIX} | ${mensagem}`, payload);
    } else {
      console.error(`${LOG_PREFIX} | ${mensagem}`);
    }
  }

  function getState() {
    return DashboardBI.STATE || {};
  }

  function listaSegura(lista) {
    return Array.isArray(lista) ? lista : [];
  }

  function textoSeguro(valor, fallback = "") {
    const texto = (valor || "").toString().trim();
    return texto || fallback;
  }

  function anoValido(valor) {
    const texto = textoSeguro(valor);
    return /^\d{4}$/.test(texto);
  }

  function getAnoAtualDashboard() {
    try {
      if (DashboardBI.stateUtils?.getAnoAtual) {
        return String(DashboardBI.stateUtils.getAnoAtual());
      }
    } catch (erro) {
      logWarn("Falha ao obter ano atual via stateUtils", erro);
    }

    return String(new Date().getFullYear());
  }

  function getPeriodoNormalizado(valor, fallback = "MENSAL") {
    if (DashboardBI.stateUtils?.normalizarPeriodo) {
      return DashboardBI.stateUtils.normalizarPeriodo(valor, fallback);
    }

    const texto = textoSeguro(valor).toUpperCase();
    if (["SEMANAL", "MENSAL", "ANUAL"].includes(texto)) return texto;
    return fallback;
  }

  function getContextoAtualDashboard() {
    try {
      if (typeof window.getContextoDashboardUsuario === "function") {
        return window.getContextoDashboardUsuario();
      }
    } catch (erro) {
      logError("Erro ao obter contexto atual do dashboard", erro);
    }

    return null;
  }

  function carregarAnosVisiveisSalvos() {
    try {
      const bruto = localStorage.getItem(STORAGE_ANOS_VISIVEIS);
      if (!bruto) return [];

      const lista = JSON.parse(bruto);
      if (!Array.isArray(lista)) return [];

      return lista
        .map((ano) => String(ano))
        .filter((ano, idx, arr) => anoValido(ano) && arr.indexOf(ano) === idx);
    } catch (erro) {
      logWarn("Falha ao carregar anos visíveis salvos", erro);
      return [];
    }
  }

  function salvarAnosVisiveis(lista = []) {
    try {
      const anos = listaSegura(lista)
        .map((ano) => String(ano))
        .filter((ano, idx, arr) => anoValido(ano) && arr.indexOf(ano) === idx)
        .sort((a, b) => Number(b) - Number(a));

      localStorage.setItem(STORAGE_ANOS_VISIVEIS, JSON.stringify(anos));

      logInfo("Anos visíveis salvos", anos);
      return anos;
    } catch (erro) {
      logWarn("Falha ao salvar anos visíveis", erro);
      return lista;
    }
  }

  function getAnosDisponiveisDashboard() {
    const anoAtual = getAnoAtualDashboard();
    const state = getState();
    const anoSelecionado = textoSeguro(state.ano, anoAtual);

    const salvos = carregarAnosVisiveisSalvos();

    const anos = [anoAtual];

    if (anoValido(anoSelecionado) && !anos.includes(anoSelecionado)) {
      anos.push(anoSelecionado);
    }

    salvos.forEach((ano) => {
      if (!anos.includes(ano)) anos.push(ano);
    });

    const final = anos
      .filter((ano, idx, arr) => anoValido(ano) && arr.indexOf(ano) === idx)
      .sort((a, b) => Number(b) - Number(a));

    logInfo("Anos disponíveis no filtro resolvidos", {
      anoAtual,
      anoSelecionado,
      final,
    });

    return final;
  }

  function garantirAnoVisivel(ano) {
    const anoNorm = String(ano || "").trim();
    if (!anoValido(anoNorm)) return;

    const salvos = carregarAnosVisiveisSalvos();
    if (!salvos.includes(anoNorm)) {
      salvos.push(anoNorm);
      salvarAnosVisiveis(salvos);
    }
  }

  function atualizarSelectAnosSeExistir() {
    const select = document.getElementById("dashAno");
    if (!select) return;

    const state = getState();
    select.innerHTML = DashboardBI.filters.gerarOptionsAnosDashboard();
    select.value = String(state.ano || getAnoAtualDashboard());

    logInfo("Select de anos atualizado na tela", {
      selecionado: select.value,
      options: getAnosDisponiveisDashboard(),
    });
  }

  function recarregarDashboardViaDados() {
    try {
      const contexto = getContextoAtualDashboard();

      if (!contexto) {
        logWarn("Contexto do dashboard não encontrado ao recarregar filtros");
        return;
      }

      if (DashboardBI.helpers?.destruirGraficos) {
        DashboardBI.helpers.destruirGraficos();
      }

      if (DashboardBI.data?.carregarDadosDashboard) {
        return DashboardBI.data.carregarDadosDashboard(contexto);
      }

      logWarn("DashboardBI.data.carregarDadosDashboard ainda não disponível");
    } catch (erro) {
      logError("Erro ao recarregar dashboard via filtros", erro);
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

      logWarn("DashboardBI.views.telaDashboard ainda não disponível");
    } catch (erro) {
      logError("Erro ao reconstruir tela do dashboard", erro);
    }
  }

  function usuarioEhGlobal(contexto) {
    const escopo = contexto?.escopo || {};
    const perfil = (contexto?.usuario?.perfil || "").toString().toLowerCase();

    return escopo.tipo === "global" || perfil === "master";
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
  // ✅ agora permite "Escolher mês"
  // ==========================
  DashboardBI.filters.gerarOptionsMesesDashboard = function () {
    const state = getState();
    const mesAtual = String(state.mes || "");

    const meses = [
      { valor: "", nome: "Escolher mês" },
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
    const anoAtual = String(state.ano || getAnoAtualDashboard());
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
      logInfo("Select dashLoja não encontrado");
      return;
    }

    const state = getState();
    let html = `<option value="TODAS">Todas as lojas</option>`;

    listaSegura(lojas).forEach((loja) => {
      const chave = DashboardBI.helpers.getChaveLoja(loja);
      html += `<option value="${chave}" ${
        state.loja === chave ? "selected" : ""
      }>${chave}</option>`;
    });

    select.innerHTML = html;

    logInfo("Select de lojas populado", {
      totalLojas: listaSegura(lojas).length,
      lojaSelecionada: state.loja,
    });
  };

  // ==========================
  // 🎯 ESCOPO BASE
  // sem bloqueio por perfil/contexto
  // ==========================
  DashboardBI.filters.aplicarEscopoBaseLojasDashboard = function (
    lojas,
    contexto
  ) {
    const lista = [...listaSegura(lojas)];

    logInfo("Escopo base de lojas liberado sem restrição por perfil", {
      total: lista.length,
      visao: getState().visao,
      contexto,
    });

    return lista;
  };

  // ==========================
  // 🎛 APLICAR FILTROS VISUAIS
  // ==========================
  DashboardBI.filters.aplicarFiltrosVisuaisLojasDashboard = function (lojas) {
    let lista = [...listaSegura(lojas)];
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

    logInfo("Dashboard semana alterada", { semana });
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarMes = async function (mes) {
    const valorFinal = mes ? String(mes).padStart(2, "0") : "";

    DashboardBI.setState({ mes: valorFinal });

    logInfo("Dashboard mês alterado", {
      mes: valorFinal || "(sem mês selecionado)",
    });

    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarAno = async function (ano) {
    const anoNorm = String(ano || "").trim();

    if (!anoValido(anoNorm)) {
      logWarn("Ano inválido ignorado", { ano });
      return;
    }

    garantirAnoVisivel(anoNorm);
    DashboardBI.setState({ ano: anoNorm });

    logInfo("Dashboard ano alterado", {
      ano: anoNorm,
      anosVisiveis: getAnosDisponiveisDashboard(),
    });

    atualizarSelectAnosSeExistir();
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarPeriodoDashboard = async function (
    periodoDashboard
  ) {
    const periodo = getPeriodoNormalizado(periodoDashboard, "MENSAL");

    DashboardBI.setState({ periodoDashboard: periodo });

    logInfo("Período principal do dashboard alterado", { periodo });
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarPeriodoRanking = async function (
    periodoRanking
  ) {
    const periodo = getPeriodoNormalizado(periodoRanking, "MENSAL");

    DashboardBI.setState({ periodoRanking: periodo });

    logInfo("Período do ranking alterado", { periodo });
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarClasse = async function (classe) {
    DashboardBI.setState({
      classe,
      indicador: "TODOS",
    });

    logInfo("Dashboard classe alterada", { classe });

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

    logInfo("Dashboard indicador alterado", { indicador });
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarRegional = async function (regional) {
    DashboardBI.setState({ regional });

    logInfo("Dashboard regional alterada", { regional });
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarLoja = async function (loja) {
    DashboardBI.setState({ loja });

    logInfo("Dashboard loja alterada", { loja });
    await recarregarDashboardViaDados();
  };

  DashboardBI.filters.dashboardAlterarVisao = async function (visao) {
    logInfo("dashboardAlterarVisao chamado", { visao });

    const novoState = {
      visao: visao || getState().visao || "regional",
    };

    if (novoState.visao === "regional") {
      novoState.loja = "TODAS";
      novoState.regional = "TODAS";
    }

    if (novoState.visao === "gerencial") {
      novoState.regional = "TODAS";
      novoState.loja = "TODAS";
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

  garantirAnoVisivel(getAnoAtualDashboard());

  logInfo("dashboard-filters.js pronto", {
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
    anosVisiveis: getAnosDisponiveisDashboard(),
  });
})();