console.log("✅ dashboard-bootstrap.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.bootstrap = DashboardBI.bootstrap || {};

(function inicializarDashboardBootstrap() {
  const LOG_PREFIX = "🚀 DashboardBootstrap";

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

  function listaSegura(lista) {
    return Array.isArray(lista) ? lista : [];
  }

  function textoSeguro(valor, fallback = "") {
    const texto = (valor || "").toString().trim();
    return texto || fallback;
  }

  function getAlvoConteudo() {
    return document.getElementById("conteudo");
  }

  function renderErroPainel(mensagem) {
    const alvo = getAlvoConteudo();
    if (!alvo) return;

    alvo.innerHTML = `
      <div class="pagina-container">
        <div class="card-conteudo">
          <h3>❌ Erro ao abrir Dashboard</h3>
          <p>${textoSeguro(mensagem, "Falha ao carregar módulos do dashboard.")}</p>
        </div>
      </div>
    `;
  }

  // ==========================
  // 🧪 VALIDAÇÃO DE MÓDULOS
  // ==========================
  function verificarModulosEssenciais() {
    const faltando = [];

    if (!DashboardBI.STATE) faltando.push("DashboardBI.STATE");
    if (!DashboardBI.CONSTS) faltando.push("DashboardBI.CONSTS");
    if (!DashboardBI.helpers) faltando.push("DashboardBI.helpers");
    if (!DashboardBI.filters) faltando.push("DashboardBI.filters");
    if (!DashboardBI.aggregations) faltando.push("DashboardBI.aggregations");
    if (!DashboardBI.kpis) faltando.push("DashboardBI.kpis");
    if (!DashboardBI.charts) faltando.push("DashboardBI.charts");
    if (!DashboardBI.data) faltando.push("DashboardBI.data");
    if (!DashboardBI.views) faltando.push("DashboardBI.views");
    if (!DashboardBI.fullscreen) faltando.push("DashboardBI.fullscreen");

    if (faltando.length) {
      const resultado = {
        ok: false,
        faltando,
        invalidas: [],
      };

      DashboardBI.ultimaValidacao = resultado;
      logError("Módulos essenciais do dashboard ausentes", resultado);
      return resultado;
    }

    const funcoesCriticas = [
      {
        nome: "DashboardBI.views.telaDashboard",
        ok: typeof DashboardBI.views.telaDashboard === "function",
      },
      {
        nome: "DashboardBI.data.carregarDadosDashboard",
        ok: typeof DashboardBI.data.carregarDadosDashboard === "function",
      },
      {
        nome: "DashboardBI.fullscreen.abrirDashboardTelaCheia",
        ok: typeof DashboardBI.fullscreen.abrirDashboardTelaCheia === "function",
      },
      {
        nome: "DashboardBI.fullscreen.sairDashboardTelaCheia",
        ok: typeof DashboardBI.fullscreen.sairDashboardTelaCheia === "function",
      },
    ];

    const invalidas = funcoesCriticas
      .filter((f) => !f.ok)
      .map((f) => f.nome);

    if (invalidas.length) {
      const resultado = {
        ok: false,
        faltando: [],
        invalidas,
      };

      DashboardBI.ultimaValidacao = resultado;
      logError("Funções críticas do dashboard ausentes", resultado);
      return resultado;
    }

    const resultado = {
      ok: true,
      faltando: [],
      invalidas: [],
    };

    DashboardBI.ultimaValidacao = resultado;
    logInfo("Todos os módulos essenciais do dashboard foram validados", resultado);
    return resultado;
  }

  function garantirDashboardValido() {
    const validacao = verificarModulosEssenciais();

    if (!validacao.ok) {
      const listaProblemas = [
        ...listaSegura(validacao.faltando),
        ...listaSegura(validacao.invalidas),
      ];

      throw new Error(
        `Módulos do dashboard incompletos: ${listaProblemas.join(", ")}`
      );
    }

    return true;
  }

  async function executarAcaoDashboard(nomeAcao, acao, { mostrarFalhaVisual = false } = {}) {
    try {
      garantirDashboardValido();

      logInfo(`Executando ação do dashboard: ${nomeAcao}`);
      return await acao();
    } catch (erro) {
      logError(`Falha na ação do dashboard: ${nomeAcao}`, erro);

      const mensagem =
        erro?.message || "Falha ao carregar módulos do dashboard.";

      if (typeof window.mostrarErro === "function") {
        window.mostrarErro(mensagem);
      } else if (mostrarFalhaVisual) {
        renderErroPainel(mensagem);
      }

      return null;
    }
  }

  // ==========================
  // 🌐 EXPOR FUNÇÕES GLOBAIS
  // ==========================
  function exporFuncoesGlobaisDashboard() {
    window.telaDashboard = async function () {
      return executarAcaoDashboard(
        "telaDashboard",
        async () => DashboardBI.views.telaDashboard(),
        { mostrarFalhaVisual: true }
      );
    };

    window.abrirDashboardTelaCheia = async function () {
      return executarAcaoDashboard(
        "abrirDashboardTelaCheia",
        async () => DashboardBI.fullscreen.abrirDashboardTelaCheia(),
        { mostrarFalhaVisual: false }
      );
    };

    window.sairDashboardTelaCheia = async function () {
      return executarAcaoDashboard(
        "sairDashboardTelaCheia",
        async () => DashboardBI.fullscreen.sairDashboardTelaCheia(),
        { mostrarFalhaVisual: false }
      );
    };

    logInfo("Funções globais do dashboard expostas", {
      telaDashboard: typeof window.telaDashboard,
      abrirDashboardTelaCheia: typeof window.abrirDashboardTelaCheia,
      sairDashboardTelaCheia: typeof window.sairDashboardTelaCheia,
    });
  }

  // ==========================
  // 🔁 RELOAD CONTROLADO
  // ==========================
  function recarregarDashboardAtual() {
    return executarAcaoDashboard(
      "recarregarDashboardAtual",
      async () => DashboardBI.views.telaDashboard(),
      { mostrarFalhaVisual: false }
    );
  }

  // ==========================
  // 🧠 STATUS DE PRONTIDÃO
  // ==========================
  function marcarDashboardPronto() {
    DashboardBI.pronto = true;
    DashboardBI.inicializadoEm = new Date().toISOString();

    logInfo("DashboardBI marcado como pronto", {
      pronto: DashboardBI.pronto,
      inicializadoEm: DashboardBI.inicializadoEm,
      ultimaValidacao: DashboardBI.ultimaValidacao || null,
    });
  }

  function marcarDashboardComFalha(validacao = null) {
    DashboardBI.pronto = false;
    DashboardBI.inicializadoEm = DashboardBI.inicializadoEm || null;
    DashboardBI.ultimaValidacao = validacao || DashboardBI.ultimaValidacao || null;

    logWarn("DashboardBI marcado como não pronto", {
      pronto: DashboardBI.pronto,
      ultimaValidacao: DashboardBI.ultimaValidacao,
    });
  }

  // ==========================
  // 🚀 INIT
  // ==========================
  DashboardBI.bootstrap.init = function () {
    logInfo("Inicializando bootstrap do dashboard...");

    const validacao = verificarModulosEssenciais();

    if (!validacao.ok) {
      marcarDashboardComFalha(validacao);
      logError("Bootstrap do dashboard falhou na validação", validacao);
      return false;
    }

    exporFuncoesGlobaisDashboard();
    marcarDashboardPronto();

    return true;
  };

  DashboardBI.bootstrap.verificarModulosEssenciais = verificarModulosEssenciais;
  DashboardBI.bootstrap.exporFuncoesGlobaisDashboard =
    exporFuncoesGlobaisDashboard;
  DashboardBI.bootstrap.recarregarDashboardAtual = recarregarDashboardAtual;
  DashboardBI.bootstrap.garantirDashboardValido = garantirDashboardValido;

  // ==========================
  // ▶️ AUTO INIT
  // ==========================
  const sucessoInit = DashboardBI.bootstrap.init();

  logInfo("dashboard-bootstrap.js pronto", {
    init: typeof DashboardBI.bootstrap.init,
    verificarModulosEssenciais:
      typeof DashboardBI.bootstrap.verificarModulosEssenciais,
    exporFuncoesGlobaisDashboard:
      typeof DashboardBI.bootstrap.exporFuncoesGlobaisDashboard,
    recarregarDashboardAtual:
      typeof DashboardBI.bootstrap.recarregarDashboardAtual,
    garantirDashboardValido:
      typeof DashboardBI.bootstrap.garantirDashboardValido,
    pronto: DashboardBI.pronto === true,
    sucessoInit,
    ultimaValidacao: DashboardBI.ultimaValidacao || null,
  });
})();
