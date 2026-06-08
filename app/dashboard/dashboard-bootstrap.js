console.log("✅ dashboard-bootstrap.js carregado");

window.DashboardBI = window.DashboardBI || {};
window.DashboardBI.bootstrap = window.DashboardBI.bootstrap || {};

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

    if (!window.DashboardBI) faltando.push("DashboardBI");
    if (!window.DashboardBI?.STATE) faltando.push("DashboardBI.STATE");
    if (!window.DashboardBI?.CONSTS) faltando.push("DashboardBI.CONSTS");
    if (!window.DashboardBI?.helpers) faltando.push("DashboardBI.helpers");
    if (!window.DashboardBI?.filters) faltando.push("DashboardBI.filters");
    if (!window.DashboardBI?.aggregations) faltando.push("DashboardBI.aggregations");
    if (!window.DashboardBI?.kpis) faltando.push("DashboardBI.kpis");
    if (!window.DashboardBI?.charts) faltando.push("DashboardBI.charts");
    if (!window.DashboardBI?.data) faltando.push("DashboardBI.data");
    if (!window.DashboardBI?.views) faltando.push("DashboardBI.views");
    if (!window.DashboardBI?.fullscreen) faltando.push("DashboardBI.fullscreen");

    if (faltando.length) {
      const resultado = {
        ok: false,
        faltando,
        invalidas: [],
        atualizadoEm: new Date().toISOString(),
      };

      window.DashboardBI.ultimaValidacao = resultado;
      logError("Módulos essenciais do dashboard ausentes", resultado);
      return resultado;
    }

    const funcoesCriticas = [
      {
        nome: "DashboardBI.views.telaDashboard",
        ok: typeof window.DashboardBI.views.telaDashboard === "function",
      },
      {
        nome: "DashboardBI.data.carregarDadosDashboard",
        ok: typeof window.DashboardBI.data.carregarDadosDashboard === "function",
      },
      {
        nome: "DashboardBI.fullscreen.abrirDashboardTelaCheia",
        ok:
          typeof window.DashboardBI.fullscreen.abrirDashboardTelaCheia ===
          "function",
      },
      {
        nome: "DashboardBI.fullscreen.sairDashboardTelaCheia",
        ok:
          typeof window.DashboardBI.fullscreen.sairDashboardTelaCheia ===
          "function",
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
        atualizadoEm: new Date().toISOString(),
      };

      window.DashboardBI.ultimaValidacao = resultado;
      logError("Funções críticas do dashboard ausentes", resultado);
      return resultado;
    }

    const resultado = {
      ok: true,
      faltando: [],
      invalidas: [],
      atualizadoEm: new Date().toISOString(),
    };

    window.DashboardBI.ultimaValidacao = resultado;
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

  async function executarAcaoDashboard(
    nomeAcao,
    acao,
    { mostrarFalhaVisual = false } = {}
  ) {
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
  // Compatível com dashboard.js loader
  // Só cria se ainda não existirem.
  // ==========================
  function exporFuncoesGlobaisDashboard() {
    if (typeof window.telaDashboard !== "function") {
      window.telaDashboard = async function () {
        return executarAcaoDashboard(
          "telaDashboard",
          async () => window.DashboardBI.views.telaDashboard(),
          { mostrarFalhaVisual: true }
        );
      };
    } else {
      logInfo("window.telaDashboard já existe; mantendo função atual");
    }

    if (typeof window.abrirDashboardTelaCheia !== "function") {
      window.abrirDashboardTelaCheia = async function () {
        return executarAcaoDashboard(
          "abrirDashboardTelaCheia",
          async () => window.DashboardBI.fullscreen.abrirDashboardTelaCheia(),
          { mostrarFalhaVisual: false }
        );
      };
    } else {
      logInfo("window.abrirDashboardTelaCheia já existe; mantendo função atual");
    }

    if (typeof window.sairDashboardTelaCheia !== "function") {
      window.sairDashboardTelaCheia = async function () {
        return executarAcaoDashboard(
          "sairDashboardTelaCheia",
          async () => window.DashboardBI.fullscreen.sairDashboardTelaCheia(),
          { mostrarFalhaVisual: false }
        );
      };
    } else {
      logInfo("window.sairDashboardTelaCheia já existe; mantendo função atual");
    }

    logInfo("Funções globais do dashboard verificadas", {
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
      async () => window.DashboardBI.views.telaDashboard(),
      { mostrarFalhaVisual: false }
    );
  }

  // ==========================
  // 🧠 STATUS DE PRONTIDÃO
  // ==========================
  function marcarDashboardPronto() {
    window.DashboardBI.pronto = true;
    window.DashboardBI.inicializadoEm = new Date().toISOString();

    logInfo("DashboardBI marcado como pronto", {
      pronto: window.DashboardBI.pronto,
      inicializadoEm: window.DashboardBI.inicializadoEm,
      ultimaValidacao: window.DashboardBI.ultimaValidacao || null,
    });
  }

  function marcarDashboardComFalha(validacao = null) {
    window.DashboardBI.pronto = false;
    window.DashboardBI.inicializadoEm =
      window.DashboardBI.inicializadoEm || null;
    window.DashboardBI.ultimaValidacao =
      validacao || window.DashboardBI.ultimaValidacao || null;

    logWarn("DashboardBI marcado como não pronto", {
      pronto: window.DashboardBI.pronto,
      ultimaValidacao: window.DashboardBI.ultimaValidacao,
    });
  }

  // ==========================
  // 🚀 INIT
  // ==========================
  window.DashboardBI.bootstrap.init = function () {
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

  window.DashboardBI.bootstrap.verificarModulosEssenciais =
    verificarModulosEssenciais;

  window.DashboardBI.bootstrap.exporFuncoesGlobaisDashboard =
    exporFuncoesGlobaisDashboard;

  window.DashboardBI.bootstrap.recarregarDashboardAtual =
    recarregarDashboardAtual;

  window.DashboardBI.bootstrap.garantirDashboardValido =
    garantirDashboardValido;

  window.DashboardBI.bootstrap.executarAcaoDashboard =
    executarAcaoDashboard;

  // ==========================
  // ▶️ AUTO INIT
  // ==========================
  const sucessoInit = window.DashboardBI.bootstrap.init();

  logInfo("dashboard-bootstrap.js pronto", {
    init: typeof window.DashboardBI.bootstrap.init,
    verificarModulosEssenciais:
      typeof window.DashboardBI.bootstrap.verificarModulosEssenciais,
    exporFuncoesGlobaisDashboard:
      typeof window.DashboardBI.bootstrap.exporFuncoesGlobaisDashboard,
    recarregarDashboardAtual:
      typeof window.DashboardBI.bootstrap.recarregarDashboardAtual,
    garantirDashboardValido:
      typeof window.DashboardBI.bootstrap.garantirDashboardValido,
    executarAcaoDashboard:
      typeof window.DashboardBI.bootstrap.executarAcaoDashboard,
    pronto: window.DashboardBI.pronto === true,
    sucessoInit,
    ultimaValidacao: window.DashboardBI.ultimaValidacao || null,
  });
})();