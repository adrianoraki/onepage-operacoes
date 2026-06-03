console.log("✅ dashboard.js bootstrap carregado");

window.DashboardBI = window.DashboardBI || {};

(function iniciarLoaderDashboard() {
  const arquivosDashboard = [
    "app/dashboard/dashboard-state.js",
    "app/dashboard/dashboard-helpers.js",
    "app/dashboard/dashboard-filters.js",
    "app/dashboard/dashboard-aggregations.js",
    "app/dashboard/dashboard-kpis.js",
    "app/dashboard/dashboard-charts.js",
    "app/dashboard/dashboard-data.js",
    "app/dashboard/dashboard-views.js",
    "app/dashboard/dashboard-fullscreen.js",
  ];

  let promiseCarregamento = null;

  function scriptJaExiste(src) {
    return [...document.querySelectorAll("script")].some(
      (s) => s.src && s.src.includes(src)
    );
  }

  function carregarScript(src) {
    return new Promise((resolve, reject) => {
      if (scriptJaExiste(src)) {
        console.log("ℹ️ Script do dashboard já carregado:", src);
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.defer = false;

      script.onload = () => {
        console.log("✅ Script carregado:", src);
        resolve();
      };

      script.onerror = () => {
        console.error("❌ Erro ao carregar script:", src);
        reject(new Error(`Falha ao carregar ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  async function carregarTodosArquivosDashboard() {
    if (promiseCarregamento) {
      return promiseCarregamento;
    }

    promiseCarregamento = (async () => {
      console.log("🚀 Iniciando carregamento dos módulos do dashboard...");

      for (const arquivo of arquivosDashboard) {
        await carregarScript(arquivo);
      }

      console.log("✅ Todos os módulos do dashboard foram carregados");

      return true;
    })();

    return promiseCarregamento;
  }

  async function garantirDashboardPronto() {
    await carregarTodosArquivosDashboard();

    const okTela =
      window.DashboardBI &&
      DashboardBI.views &&
      typeof DashboardBI.views.telaDashboard === "function";

    if (!okTela) {
      console.error(
        "❌ DashboardBI.views.telaDashboard não encontrado após carregamento"
      );
      throw new Error("Módulos do dashboard não inicializados corretamente.");
    }

    return true;
  }

  window.DashboardBI.carregarModulos = carregarTodosArquivosDashboard;
  window.DashboardBI.garantirPronto = garantirDashboardPronto;

  // ==========================
  // 🌐 API GLOBAL COMPATÍVEL COM O SISTEMA
  // ==========================
  window.telaDashboard = async function () {
    try {
      await garantirDashboardPronto();
      return DashboardBI.views.telaDashboard();
    } catch (erro) {
      console.error("❌ Falha ao abrir dashboard:", erro);

      if (typeof window.mostrarErro === "function") {
        window.mostrarErro("Falha ao carregar módulos do dashboard.");
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
      await garantirDashboardPronto();

      if (DashboardBI.fullscreen?.abrirDashboardTelaCheia) {
        return DashboardBI.fullscreen.abrirDashboardTelaCheia();
      }

      console.warn("⚠️ Função de tela cheia do dashboard não encontrada");
    } catch (erro) {
      console.error("❌ Falha ao abrir dashboard em tela cheia:", erro);
    }
  };

  window.sairDashboardTelaCheia = async function () {
    try {
      await garantirDashboardPronto();

      if (DashboardBI.fullscreen?.sairDashboardTelaCheia) {
        return DashboardBI.fullscreen.sairDashboardTelaCheia();
      }

      console.warn("⚠️ Função de saída da tela cheia não encontrada");
    } catch (erro) {
      console.error("❌ Falha ao sair do dashboard em tela cheia:", erro);
    }
  };

  console.log("✅ dashboard.js bootstrap pronto", {
    telaDashboard: typeof window.telaDashboard,
    abrirDashboardTelaCheia: typeof window.abrirDashboardTelaCheia,
    sairDashboardTelaCheia: typeof window.sairDashboardTelaCheia,
  });
})();