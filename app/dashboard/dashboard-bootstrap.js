console.log("✅ dashboard-bootstrap.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.bootstrap = DashboardBI.bootstrap || {};

(function inicializarDashboardBootstrap() {
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
      console.error("❌ Módulos essenciais do dashboard ausentes:", faltando);
      return {
        ok: false,
        faltando,
      };
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

    const invalidas = funcoesCriticas.filter((f) => !f.ok).map((f) => f.nome);

    if (invalidas.length) {
      console.error("❌ Funções críticas do dashboard ausentes:", invalidas);
      return {
        ok: false,
        faltando: invalidas,
      };
    }

    console.log("✅ Todos os módulos essenciais do dashboard foram validados");
    return {
      ok: true,
      faltando: [],
    };
  }

  // ==========================
  // 🌐 EXPOR FUNÇÕES GLOBAIS
  // ==========================
  function exporFuncoesGlobaisDashboard() {
    window.telaDashboard = async function () {
      try {
        const validacao = verificarModulosEssenciais();
        if (!validacao.ok) {
          throw new Error(
            `Módulos do dashboard incompletos: ${validacao.faltando.join(", ")}`
          );
        }

        console.log("📊 Abrindo dashboard pela função global...");
        return DashboardBI.views.telaDashboard();
      } catch (erro) {
        console.error("❌ Falha ao abrir dashboard:", erro);

        if (typeof window.mostrarErro === "function") {
          window.mostrarErro(
            erro.message || "Falha ao carregar módulos do dashboard."
          );
        } else {
          const alvo = document.getElementById("conteudo");
          if (alvo) {
            alvo.innerHTML = `
              <div class="pagina-container">
                <div class="card-conteudo">
                  <h3>❌ Erro ao abrir Dashboard</h3>
                  <p>${erro.message || "Falha ao carregar módulos do dashboard."}</p>
                </div>
              </div>
            `;
          }
        }
      }
    };

    window.abrirDashboardTelaCheia = async function () {
      try {
        const validacao = verificarModulosEssenciais();
        if (!validacao.ok) {
          throw new Error(
            `Módulos do dashboard incompletos: ${validacao.faltando.join(", ")}`
          );
        }

        console.log("🖥️ Abrindo dashboard em tela cheia...");
        return DashboardBI.fullscreen.abrirDashboardTelaCheia();
      } catch (erro) {
        console.error("❌ Falha ao abrir dashboard em tela cheia:", erro);
      }
    };

    window.sairDashboardTelaCheia = async function () {
      try {
        const validacao = verificarModulosEssenciais();
        if (!validacao.ok) {
          throw new Error(
            `Módulos do dashboard incompletos: ${validacao.faltando.join(", ")}`
          );
        }

        console.log("↩ Saindo do modo tela cheia do dashboard...");
        return DashboardBI.fullscreen.sairDashboardTelaCheia();
      } catch (erro) {
        console.error("❌ Falha ao sair do dashboard em tela cheia:", erro);
      }
    };

    console.log("✅ Funções globais do dashboard expostas:", {
      telaDashboard: typeof window.telaDashboard,
      abrirDashboardTelaCheia: typeof window.abrirDashboardTelaCheia,
      sairDashboardTelaCheia: typeof window.sairDashboardTelaCheia,
    });
  }

  // ==========================
  // 🔁 RELOAD CONTROLADO
  // ==========================
  function recarregarDashboardAtual() {
    try {
      const validacao = verificarModulosEssenciais();
      if (!validacao.ok) {
        throw new Error(
          `Módulos do dashboard incompletos: ${validacao.faltando.join(", ")}`
        );
      }

      console.log("🔄 Recarregando dashboard atual...");
      return DashboardBI.views.telaDashboard();
    } catch (erro) {
      console.error("❌ Erro ao recarregar dashboard:", erro);
    }
  }

  // ==========================
  // 🧠 STATUS DE PRONTIDÃO
  // ==========================
  function marcarDashboardPronto() {
    DashboardBI.pronto = true;
    DashboardBI.inicializadoEm = new Date().toISOString();

    console.log("✅ DashboardBI marcado como pronto", {
      pronto: DashboardBI.pronto,
      inicializadoEm: DashboardBI.inicializadoEm,
    });
  }

  // ==========================
  // 🚀 INIT
  // ==========================
  DashboardBI.bootstrap.init = function () {
    console.log("🚀 Inicializando bootstrap do dashboard...");

    const validacao = verificarModulosEssenciais();

    if (!validacao.ok) {
      console.error("❌ Bootstrap do dashboard falhou na validação:", validacao);
      DashboardBI.pronto = false;
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

  // ==========================
  // ▶️ AUTO INIT
  // ==========================
  const sucessoInit = DashboardBI.bootstrap.init();

  console.log("✅ dashboard-bootstrap.js pronto", {
    init: typeof DashboardBI.bootstrap.init,
    verificarModulosEssenciais:
      typeof DashboardBI.bootstrap.verificarModulosEssenciais,
    exporFuncoesGlobaisDashboard:
      typeof DashboardBI.bootstrap.exporFuncoesGlobaisDashboard,
    recarregarDashboardAtual:
      typeof DashboardBI.bootstrap.recarregarDashboardAtual,
    pronto: DashboardBI.pronto === true,
    sucessoInit,
  });
})();