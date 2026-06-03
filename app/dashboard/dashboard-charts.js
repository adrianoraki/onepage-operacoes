console.log("✅ dashboard-charts.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.charts = DashboardBI.charts || {};

(function inicializarDashboardCharts() {
  // ==========================
  // 📈 RENDERIZAR GRÁFICOS
  // ==========================
  DashboardBI.charts.renderGraficosDashboard = function ({
    evolucao,
    ranking,
    tipoRanking,
    tipoValorPrincipal,
    tipoValorSecundario,
  }) {
    console.log("📈 Renderizando gráficos do dashboard...", {
      tipoRanking,
      evolucaoQtd: evolucao?.length,
      rankingQtd: ranking?.length,
    });

    if (!DashboardBI.helpers.chartJsDisponivel()) return;

    requestAnimationFrame(() => {
      try {
        DashboardBI.charts.renderGraficoEvolucaoDashboard(
          evolucao,
          tipoValorPrincipal,
          tipoValorSecundario
        );

        DashboardBI.charts.renderGraficoRankingDashboard(
          ranking,
          tipoRanking,
          tipoValorPrincipal,
          tipoValorSecundario
        );
      } catch (erro) {
        console.error("❌ Erro ao renderizar gráficos do dashboard:", erro);
      }
    });
  };

  // ==========================
  // 📈 GRÁFICO DE EVOLUÇÃO
  // ==========================
  DashboardBI.charts.renderGraficoEvolucaoDashboard = function (
    evolucao,
    tipoValorPrincipal,
    tipoValorSecundario
  ) {
    const canvas = document.getElementById("graficoEvolucao");
    if (!canvas) {
      console.warn("⚠️ Canvas graficoEvolucao não encontrado");
      return;
    }

    const labels = (evolucao || []).map((item) => `Sem ${item.semana}`);
    const dadosValor = (evolucao || []).map((item) =>
      Number(item.mediaValor || 0)
    );
    const dadosValor2 = (evolucao || []).map((item) =>
      Number(item.mediaValor2 || 0)
    );

    const temValor2 = dadosValor2.some((v) => v !== 0);

    if (window.dashboardCharts.evolucao) {
      window.dashboardCharts.evolucao.destroy();
    }

    const datasets = [
      {
        label: `Valor principal (${tipoValorPrincipal})`,
        data: dadosValor,
        borderColor: "#1e6091",
        backgroundColor: "rgba(30, 96, 145, 0.15)",
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 5,
      },
    ];

    if (temValor2) {
      datasets.push({
        label: `Valor 2 (${tipoValorSecundario})`,
        data: dadosValor2,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.15)",
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 4,
      });
    }

    window.dashboardCharts.evolucao = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        scales: {
          x: {
            ticks: {
              color: "#5a6872",
              font: {
                size: 12,
              },
            },
            grid: {
              color: "rgba(10, 61, 98, 0.06)",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#5a6872",
              font: {
                size: 12,
              },
            },
            grid: {
              color: "rgba(10, 61, 98, 0.06)",
            },
          },
        },
      },
    });
  };

  // ==========================
  // 🏆 GRÁFICO DE RANKING
  // ==========================
  DashboardBI.charts.renderGraficoRankingDashboard = function (
    ranking,
    tipoRanking,
    tipoValorPrincipal,
    tipoValorSecundario
  ) {
    const canvas = document.getElementById("graficoRanking");
    if (!canvas) {
      console.warn("⚠️ Canvas graficoRanking não encontrado");
      return;
    }

    if (window.dashboardCharts.ranking) {
      window.dashboardCharts.ranking.destroy();
    }

    DashboardBI.helpers.ajustarAlturaChartBox(
      "graficoRanking",
      ranking?.length || 0,
      {
        minimo: 220,
        maximo: 360,
        pxPorItem: 20,
      }
    );

    let labels = [];
    let datasets = [];

    if (tipoRanking === "lojas") {
      labels = (ranking || []).map((item) => item.loja);

      const dadosValor = (ranking || []).map((item) =>
        Number(item.mediaValor || 0)
      );
      const dadosValor2 = (ranking || []).map((item) =>
        Number(item.mediaValor2 || 0)
      );
      const temValor2 = dadosValor2.some((v) => v !== 0);

      datasets = [
        {
          label: `Média valor (${tipoValorPrincipal})`,
          data: dadosValor,
          backgroundColor: "rgba(30, 96, 145, 0.78)",
          borderColor: "#1e6091",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 14,
          categoryPercentage: 0.82,
          barPercentage: 0.76,
        },
      ];

      if (temValor2) {
        datasets.push({
          label: `Média valor 2 (${tipoValorSecundario})`,
          data: dadosValor2,
          backgroundColor: "rgba(76, 175, 80, 0.78)",
          borderColor: "#4CAF50",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 14,
          categoryPercentage: 0.82,
          barPercentage: 0.76,
        });
      }
    } else {
      labels = (ranking || []).map((item) => item.indicador);
      const dados = (ranking || []).map((item) =>
        Number(item.mediaValor || 0)
      );
      const dados2 = (ranking || []).map((item) =>
        Number(item.mediaValor2 || 0)
      );
      const temValor2 = dados2.some((v) => v !== 0);

      datasets = [
        {
          label: `Média valor (${tipoValorPrincipal})`,
          data: dados,
          backgroundColor: "rgba(156, 39, 176, 0.78)",
          borderColor: "#9C27B0",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 14,
          categoryPercentage: 0.82,
          barPercentage: 0.76,
        },
      ];

      if (temValor2) {
        datasets.push({
          label: `Média valor 2 (${tipoValorSecundario})`,
          data: dados2,
          backgroundColor: "rgba(76, 175, 80, 0.78)",
          borderColor: "#4CAF50",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 14,
          categoryPercentage: 0.82,
          barPercentage: 0.76,
        });
      }
    }

    window.dashboardCharts.ranking = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets,
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 12,
              },
              boxWidth: 16,
              boxHeight: 10,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: "#5a6872",
              font: {
                size: 12,
              },
            },
            grid: {
              color: "rgba(10, 61, 98, 0.06)",
            },
          },
          y: {
            ticks: {
              color: "#5a6872",
              font: {
                size: 12,
              },
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });
  };

  console.log("✅ dashboard-charts.js pronto", {
    renderGraficosDashboard: typeof DashboardBI.charts.renderGraficosDashboard,
    renderGraficoEvolucaoDashboard:
      typeof DashboardBI.charts.renderGraficoEvolucaoDashboard,
    renderGraficoRankingDashboard:
      typeof DashboardBI.charts.renderGraficoRankingDashboard,
  });
})();
