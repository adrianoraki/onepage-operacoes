console.log("✅ dashboard-fullscreen.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.fullscreen = DashboardBI.fullscreen || {};

(function inicializarDashboardFullscreen() {
  DashboardBI.fullscreen.abrirDashboardTelaCheia = async function () {
    const container = document.getElementById("dashboardContainer");

    if (!container) {
      console.error("❌ dashboardContainer não encontrado");
      return;
    }

    try {
      console.log("🖥️ Entrando em modo apresentação...");

      window.dashboardModoApresentacao = true;
      container.classList.add("modo-apresentacao");

      if (typeof window.pausarTimerInatividade === "function") {
        window.pausarTimerInatividade();
      }

      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        await container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        await container.msRequestFullscreen();
      } else {
        console.warn("⚠️ Fullscreen não suportado neste navegador");
      }

      console.log("✅ Dashboard em tela cheia");
    } catch (erro) {
      console.error("❌ Erro ao abrir dashboard em tela cheia:", erro);

      window.dashboardModoApresentacao = false;
      container.classList.remove("modo-apresentacao");

      if (typeof window.retomarTimerInatividade === "function") {
        window.retomarTimerInatividade();
      }
    }
  };

  DashboardBI.fullscreen.sairDashboardTelaCheia = async function () {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      const container = document.getElementById("dashboardContainer");
      if (container) {
        container.classList.remove("modo-apresentacao");
      }

      window.dashboardModoApresentacao = false;

      if (typeof window.retomarTimerInatividade === "function") {
        window.retomarTimerInatividade();
      }

      console.log("↩ Dashboard saiu do modo apresentação");
    } catch (erro) {
      console.error("❌ Erro ao sair da tela cheia:", erro);
    }
  };

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      const container = document.getElementById("dashboardContainer");
      if (container) {
        container.classList.remove("modo-apresentacao");
      }

      if (window.dashboardModoApresentacao) {
        console.log("ℹ️ Fullscreen encerrado - retomando timer");
      }

      window.dashboardModoApresentacao = false;

      if (typeof window.retomarTimerInatividade === "function") {
        window.retomarTimerInatividade();
      }
    }
  });

  console.log("✅ dashboard-fullscreen.js pronto", {
    abrirDashboardTelaCheia:
      typeof DashboardBI.fullscreen.abrirDashboardTelaCheia,
    sairDashboardTelaCheia:
      typeof DashboardBI.fullscreen.sairDashboardTelaCheia,
  });
})();