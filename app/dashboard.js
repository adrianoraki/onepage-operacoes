console.log("✅ dashboard.js bootstrap carregado");

window.DashboardBI = window.DashboardBI || {};

(function iniciarLoaderDashboard() {
  const DASHBOARD_BASE_PATH = "app/dashboard/";

  const arquivosDashboard = [
    "dashboard-state.js",
    "dashboard-helpers.js",
    "dashboard-data.js",
    "dashboard-aggregations.js",
    "dashboard-filters.js",
    "dashboard-kpis.js",
    "dashboard-charts.js",
    "dashboard-views.js",
    "dashboard-fullscreen.js",
    "dashboard-bootstrap.js",
  ];

  let promiseCarregamento = null;

  function getSrcCompleto(arquivo) {
    return `${DASHBOARD_BASE_PATH}${arquivo}`;
  }

  function normalizarSrc(src) {
    return (src || "").toString().replace(/^\/+/, "");
  }

  function scriptJaExiste(src) {
    const srcNormalizado = normalizarSrc(src);

    return [...document.querySelectorAll("script")].some((script) => {
      const atual = normalizarSrc(script.getAttribute("src") || script.src || "");
      return atual.includes(srcNormalizado);
    });
  }

  function marcarDashboardStatus(status, detalhes = {}) {
    window.DashboardBI.statusCarregamento = {
      status,
      atualizadoEm: new Date().toISOString(),
      ...detalhes,
    };

    console.log("📊 Status dashboard:", window.DashboardBI.statusCarregamento);
  }

  function carregarScript(src) {
    return new Promise((resolve, reject) => {
      if (scriptJaExiste(src)) {
        console.log("ℹ️ Script do dashboard já existe no DOM:", src);
        resolve({
          src,
          ignorado: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.defer = false;
      script.dataset.dashboardModulo = "true";

      script.onload = () => {
        console.log("✅ Script do dashboard carregado:", src);
        resolve({
          src,
          carregado: true,
        });
      };

      script.onerror = () => {
        console.error("❌ Erro ao carregar script do dashboard:", src);
        reject(new Error(`Falha ao carregar módulo do dashboard: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  async function carregarTodosArquivosDashboard() {
    if (promiseCarregamento) {
      console.log("ℹ️ Reutilizando promessa de carregamento do dashboard");
      return promiseCarregamento;
    }

    promiseCarregamento = (async () => {
      marcarDashboardStatus("carregando", {
        totalModulos: arquivosDashboard.length,
      });

      console.log("🚀 Iniciando carregamento dos módulos do dashboard...");

      const carregados = [];

      for (const arquivo of arquivosDashboard) {
        const src = getSrcCompleto(arquivo);

        try {
          const resultado = await carregarScript(src);
          carregados.push(resultado);
        } catch (erro) {
          marcarDashboardStatus("erro", {
            arquivo,
            erro: erro.message,
          });

          throw erro;
        }
      }

      marcarDashboardStatus("carregado", {
        totalModulos: arquivosDashboard.length,
        carregados,
      });

      console.log("✅ Todos os módulos do dashboard foram carregados");

      return true;
    })();

    return promiseCarregamento;
  }

  function validarDashboardBI() {
    const validacoes = {
      dashboardBI: !!window.DashboardBI,
      views: !!window.DashboardBI?.views,
      telaDashboard:
        typeof window.DashboardBI?.views?.telaDashboard === "function",
      fullscreen: !!window.DashboardBI?.fullscreen,
    };

    const ok = validacoes.dashboardBI && validacoes.views && validacoes.telaDashboard;

    if (!ok) {
      console.error("❌ Validação do DashboardBI falhou:", validacoes);
    } else {
      console.log("✅ DashboardBI validado:", validacoes);
    }

    return ok;
  }

  async function garantirDashboardPronto() {
    await carregarTodosArquivosDashboard();

    const ok = validarDashboardBI();

    if (!ok) {
      throw new Error("Módulos do dashboard não inicializados corretamente.");
    }

    return true;
  }

  function renderErroDashboard(erro) {
    const mensagem = erro?.message || "Falha ao carregar módulos do dashboard.";

    if (typeof window.mostrarErro === "function") {
      window.mostrarErro(mensagem);
      return;
    }

    const alvo = document.getElementById("conteudo");

    if (alvo) {
      alvo.innerHTML = `
        <div class="pagina-container">
          <div class="card-conteudo">
            <h3>❌ Erro ao abrir Dashboard</h3>
            <p>${mensagem}</p>
          </div>
        </div>
      `;
    }
  }

  // ==========================
  // API INTERNA
  // ==========================
  window.DashboardBI.carregarModulos = carregarTodosArquivosDashboard;
  window.DashboardBI.garantirPronto = garantirDashboardPronto;
  window.DashboardBI.validar = validarDashboardBI;

  // ==========================
  // API GLOBAL COMPATÍVEL COM O SISTEMA
  // ==========================
  window.telaDashboard = async function () {
    try {
      await garantirDashboardPronto();
      return window.DashboardBI.views.telaDashboard();
    } catch (erro) {
      console.error("❌ Falha ao abrir dashboard:", erro);
      renderErroDashboard(erro);
      return false;
    }
  };

  window.abrirDashboardTelaCheia = async function () {
    try {
      await garantirDashboardPronto();

      if (window.DashboardBI.fullscreen?.abrirDashboardTelaCheia) {
        return window.DashboardBI.fullscreen.abrirDashboardTelaCheia();
      }

      console.warn("⚠️ Função de tela cheia do dashboard não encontrada");
      return false;
    } catch (erro) {
      console.error("❌ Falha ao abrir dashboard em tela cheia:", erro);
      return false;
    }
  };

  window.sairDashboardTelaCheia = async function () {
    try {
      await garantirDashboardPronto();

      if (window.DashboardBI.fullscreen?.sairDashboardTelaCheia) {
        return window.DashboardBI.fullscreen.sairDashboardTelaCheia();
      }

      console.warn("⚠️ Função de saída da tela cheia não encontrada");
      return false;
    } catch (erro) {
      console.error("❌ Falha ao sair do dashboard em tela cheia:", erro);
      return false;
    }
  };

  console.log("✅ dashboard.js bootstrap pronto", {
    telaDashboard: typeof window.telaDashboard,
    abrirDashboardTelaCheia: typeof window.abrirDashboardTelaCheia,
    sairDashboardTelaCheia: typeof window.sairDashboardTelaCheia,
    carregarModulos: typeof window.DashboardBI.carregarModulos,
    garantirPronto: typeof window.DashboardBI.garantirPronto,
  });
})();