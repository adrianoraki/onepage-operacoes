console.log("✅ dashboard-charts.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.charts = DashboardBI.charts || {};

(function inicializarDashboardCharts() {
  function destruirGraficoSeguro(chave) {
    try {
      if (window.dashboardCharts?.[chave]) {
        window.dashboardCharts[chave].destroy();
        window.dashboardCharts[chave] = null;
      }
    } catch (erro) {
      console.warn(`⚠️ Falha ao destruir gráfico "${chave}"`, erro);
    }
  }

  function formatarValorTooltip(valor, tipo) {
    const isPercentual = DashboardBI.helpers.tipoPercentual(tipo);

    return DashboardBI.helpers.formatarKpi(valor, {
      percentual: isPercentual,
      casas: 2,
    });
  }

  function callbackTicksPorTipo(tipo) {
    const isPercentual = DashboardBI.helpers.tipoPercentual(tipo);

    return function (value) {
      const numero = Number(value);
      if (!isFinite(numero)) return "-";

      const texto = DashboardBI.helpers.formatarNumero(numero, 1);
      return isPercentual ? `${texto}%` : texto;
    };
  }

  function gerarDatasetBarra({ label, data, backgroundColor, borderColor }) {
    return {
      label,
      data,
      backgroundColor,
      borderColor,
      borderWidth: 1,
      borderRadius: 6,
      maxBarThickness: 14,
      categoryPercentage: 0.82,
      barPercentage: 0.76,
    };
  }

  function gerarDatasetLinha({
    label,
    data,
    borderColor,
    backgroundColor,
    borderWidth = 2,
    fill = false,
    pointRadius = 3,
    pointHoverRadius = 4,
  }) {
    return {
      label,
      data,
      borderColor,
      backgroundColor,
      borderWidth,
      tension: 0.35,
      fill,
      pointRadius,
      pointHoverRadius,
    };
  }

  // ==========================
  // 📈 RENDERIZAR GRÁFICOS
  // ==========================
  DashboardBI.charts.renderGraficosDashboard = function ({
    evolucao,
    ranking,
    tipoRanking,
    tipoValorPrincipal,
    tipoValorSecundario,
    modoEvolucao = "padrao",
  }) {
    console.log("📈 Renderizando gráficos do dashboard...", {
      tipoRanking,
      modoEvolucao,
      evolucaoQtd: evolucao?.length || 0,
      rankingQtd: ranking?.length || 0,
      tipoValorPrincipal,
      tipoValorSecundario,
    });

    if (!DashboardBI.helpers.chartJsDisponivel()) return;

    requestAnimationFrame(() => {
      try {
        DashboardBI.charts.renderGraficoEvolucaoDashboard(
          evolucao,
          tipoValorPrincipal,
          tipoValorSecundario,
          modoEvolucao,
        );

        DashboardBI.charts.renderGraficoRankingDashboard(
          ranking,
          tipoRanking,
          tipoValorPrincipal,
          tipoValorSecundario,
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
  tipoValorSecundario,
  modoEvolucao = "padrao"
) {
  const canvas = document.getElementById("graficoEvolucao");
  if (!canvas) {
    console.warn("⚠️ Canvas graficoEvolucao não encontrado");
    return;
  }

  destruirGraficoSeguro("evolucao");

  const lista = evolucao || [];
  const labels = lista.map((item) => `Sem ${item.semana}`);

  let datasets = [];

  if (modoEvolucao === "regional-comparativo") {
    const dadosNE1 = lista.map((item) => Number(item.mediaNE1 || 0));
    const dadosNE2 = lista.map((item) => Number(item.mediaNE2 || 0));

    datasets = [
      gerarDatasetLinha({
        label: "Valor Regional NE1",
        data: dadosNE1,
        borderColor: "#1e6091",
        backgroundColor: "rgba(30, 96, 145, 0.15)",
        borderWidth: 3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 5,
      }),
      gerarDatasetLinha({
        label: "Valor Regional NE2",
        data: dadosNE2,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.15)",
        borderWidth: 3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 5,
      }),
    ];
  } else {
    const dadosValor = lista.map((item) => Number(item.mediaValor || 0));
    const dadosValor2 = lista.map((item) => Number(item.mediaValor2 || 0));
    const temValor2 = dadosValor2.some((v) => v !== 0);

    datasets = [
      gerarDatasetLinha({
        label: `Valor principal (${tipoValorPrincipal})`,
        data: dadosValor,
        borderColor: "#1e6091",
        backgroundColor: "rgba(30, 96, 145, 0.15)",
        borderWidth: 3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 5,
      }),
    ];

    if (temValor2) {
      datasets.push(
        gerarDatasetLinha({
          label: `Valor 2 (${tipoValorSecundario})`,
          data: dadosValor2,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.15)",
          borderWidth: 2,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 4,
        })
      );
    }
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
          callbacks: {
            label: function (ctx) {
              const datasetLabel = ctx.dataset?.label || "Valor";
              const valor = ctx.raw;
              return `${datasetLabel}: ${DashboardBI.helpers.formatarKpi(valor, {
                percentual: DashboardBI.helpers.tipoPercentual(tipoValorPrincipal),
                casas: 2,
              })}`;
            },
          },
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
            callback: callbackTicksPorTipo(tipoValorPrincipal),
          },
          grid: {
            color: "rgba(10, 61, 98, 0.06)",
          },
        },
      },
    },
  });

  console.log("✅ Gráfico de evolução renderizado", {
    modoEvolucao,
    totalPontos: lista.length,
  });
};

  // ==========================
  // 🏆 GRÁFICO DE RANKING
  // ==========================
  DashboardBI.charts.renderGraficoRankingDashboard = function (
    ranking,
    tipoRanking,
    tipoValorPrincipal,
    tipoValorSecundario,
  ) {
    const canvas = document.getElementById("graficoRanking");
    if (!canvas) {
      console.warn("⚠️ Canvas graficoRanking não encontrado");
      return;
    }

    destruirGraficoSeguro("ranking");

    const lista = ranking || [];

    DashboardBI.helpers.ajustarAlturaChartBox(
      "graficoRanking",
      lista.length || 0,
      {
        minimo: 220,
        maximo: 360,
        pxPorItem: 20,
      },
    );

    let labels = [];
    let datasets = [];

    if (tipoRanking === "lojas") {
      labels = lista.map((item) => item.loja);

      const dadosValor = lista.map((item) => Number(item.mediaValor || 0));
      const dadosValor2 = lista.map((item) => Number(item.mediaValor2 || 0));
      const temValor2 = dadosValor2.some((v) => v !== 0);

      datasets = [
        gerarDatasetBarra({
          label: `Média valor (${tipoValorPrincipal})`,
          data: dadosValor,
          backgroundColor: "rgba(30, 96, 145, 0.78)",
          borderColor: "#1e6091",
        }),
      ];

      if (temValor2) {
        datasets.push(
          gerarDatasetBarra({
            label: `Média valor 2 (${tipoValorSecundario})`,
            data: dadosValor2,
            backgroundColor: "rgba(76, 175, 80, 0.78)",
            borderColor: "#4CAF50",
          }),
        );
      }
    } else {
      labels = lista.map((item) => item.indicador);

      const dadosValor = lista.map((item) => Number(item.mediaValor || 0));
      const dadosValor2 = lista.map((item) => Number(item.mediaValor2 || 0));
      const temValor2 = dadosValor2.some((v) => v !== 0);

      datasets = [
        gerarDatasetBarra({
          label: `Média valor (${tipoValorPrincipal})`,
          data: dadosValor,
          backgroundColor: "rgba(156, 39, 176, 0.78)",
          borderColor: "#9C27B0",
        }),
      ];

      if (temValor2) {
        datasets.push(
          gerarDatasetBarra({
            label: `Média valor 2 (${tipoValorSecundario})`,
            data: dadosValor2,
            backgroundColor: "rgba(76, 175, 80, 0.78)",
            borderColor: "#4CAF50",
          }),
        );
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
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const datasetLabel = ctx.dataset?.label || "Valor";
                const valor = ctx.raw;
                const usaTipo =
                  ctx.datasetIndex === 0
                    ? tipoValorPrincipal
                    : tipoValorSecundario;

                return `${datasetLabel}: ${formatarValorTooltip(
                  valor,
                  usaTipo,
                )}`;
              },
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
              callback: callbackTicksPorTipo(tipoValorPrincipal),
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

    console.log("✅ Gráfico de ranking renderizado", {
      tipoRanking,
      total: lista.length,
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
