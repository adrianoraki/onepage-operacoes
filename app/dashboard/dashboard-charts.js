console.log("✅ dashboard-charts.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.charts = DashboardBI.charts || {};

(function inicializarDashboardCharts() {
  const LOG_PREFIX = "📉 DashboardCharts";

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

  function numeroSeguro(valor, fallback = 0) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : fallback;
  }

  function textoSeguro(valor, fallback = "") {
    const texto = (valor || "").toString().trim();
    return texto || fallback;
  }

  function destruirGraficoSeguro(chave) {
    try {
      if (window.dashboardCharts?.[chave]) {
        window.dashboardCharts[chave].destroy();
        window.dashboardCharts[chave] = null;
      }
    } catch (erro) {
      logWarn(`Falha ao destruir gráfico "${chave}"`, erro);
    }
  }

  function normalizarTipo(tipo) {
    return DashboardBI.helpers.normalizarTextoLower(tipo || "numero");
  }

  function tiposSaoDiferentes(tipoA, tipoB) {
    return normalizarTipo(tipoA) !== normalizarTipo(tipoB);
  }

  function formatarValorTooltip(valor, tipo) {
    return DashboardBI.helpers.formatarValor(valor, tipo);
  }

  function formatarTickPorTipo(valor, tipo, casas = 1) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return "-";

    if (DashboardBI.helpers.tipoMoeda(tipo)) {
      return DashboardBI.helpers.formatarMoeda(numero);
    }

    if (DashboardBI.helpers.tipoPercentual(tipo)) {
      return DashboardBI.helpers.formatarPercentual(numero, casas);
    }

    if (DashboardBI.helpers.tipoInteiro(tipo)) {
      return DashboardBI.helpers.formatarInteiro(numero);
    }

    return DashboardBI.helpers.formatarNumero(numero, casas);
  }

  function callbackTicksPorTipo(tipo, { neutro = false, casas = 1 } = {}) {
    return function (value) {
      const numero = Number(value);
      if (!isFinite(numero)) return "-";

      if (neutro) {
        return DashboardBI.helpers.formatarNumero(numero, casas);
      }

      return formatarTickPorTipo(numero, tipo, casas);
    };
  }

  function gerarDatasetBarra({
    label,
    data,
    backgroundColor,
    borderColor,
    xAxisID = "x",
    tipo = "numero",
  }) {
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
      xAxisID,
      _tipoValor: tipo,
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
    yAxisID = "y",
    tipo = "numero",
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
      yAxisID,
      _tipoValor: tipo,
    };
  }

  function criarEscalasLinha({
    tipoValorPrincipal = "numero",
    tipoValorSecundario = "numero",
    usarSegundoEixo = false,
  }) {
    const tiposDiferentes = tiposSaoDiferentes(
      tipoValorPrincipal,
      tipoValorSecundario
    );

    const scales = {
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
          callback: callbackTicksPorTipo(tipoValorPrincipal, {
            neutro: usarSegundoEixo && tiposDiferentes,
            casas: 1,
          }),
        },
        grid: {
          color: "rgba(10, 61, 98, 0.06)",
        },
      },
    };

    if (usarSegundoEixo && tiposDiferentes) {
      scales.y1 = {
        beginAtZero: true,
        position: "right",
        ticks: {
          color: "#4CAF50",
          font: {
            size: 12,
          },
          callback: callbackTicksPorTipo(tipoValorSecundario, { casas: 1 }),
        },
        grid: {
          drawOnChartArea: false,
        },
      };
    }

    return scales;
  }

  function criarEscalasBarraHorizontal({
    tipoValorPrincipal = "numero",
    tipoValorSecundario = "numero",
    usarSegundoEixo = false,
  }) {
    const tiposDiferentes = tiposSaoDiferentes(
      tipoValorPrincipal,
      tipoValorSecundario
    );

    const scales = {
      x: {
        beginAtZero: true,
        ticks: {
          color: "#5a6872",
          font: {
            size: 12,
          },
          callback: callbackTicksPorTipo(tipoValorPrincipal, {
            neutro: usarSegundoEixo && tiposDiferentes,
            casas: 1,
          }),
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
    };

    if (usarSegundoEixo && tiposDiferentes) {
      scales.x1 = {
        beginAtZero: true,
        position: "top",
        ticks: {
          color: "#4CAF50",
          font: {
            size: 12,
          },
          callback: callbackTicksPorTipo(tipoValorSecundario, { casas: 1 }),
        },
        grid: {
          drawOnChartArea: false,
        },
      };
    }

    return scales;
  }

  function callbackTooltipPorDataset() {
    return function (ctx) {
      const datasetLabel = ctx.dataset?.label || "Valor";
      const valor = ctx.raw;
      const tipo = ctx.dataset?._tipoValor || "numero";

      return `${datasetLabel}: ${formatarValorTooltip(valor, tipo)}`;
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
    logInfo("Renderizando gráficos do dashboard...", {
      tipoRanking,
      modoEvolucao,
      evolucaoQtd: listaSegura(evolucao).length,
      rankingQtd: listaSegura(ranking).length,
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
          modoEvolucao
        );

        DashboardBI.charts.renderGraficoRankingDashboard(
          ranking,
          tipoRanking,
          tipoValorPrincipal,
          tipoValorSecundario
        );
      } catch (erro) {
        logError("Erro ao renderizar gráficos do dashboard", erro);
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
      logWarn("Canvas graficoEvolucao não encontrado");
      return;
    }

    destruirGraficoSeguro("evolucao");

    const lista = listaSegura(evolucao);
    const labels = lista.map((item) => `Sem ${item.semana}`);

    let datasets = [];
    let scales = {};

    if (modoEvolucao === "regional-comparativo") {
      const dadosNE1 = lista.map((item) => numeroSeguro(item.mediaNE1));
      const dadosNE2 = lista.map((item) => numeroSeguro(item.mediaNE2));

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
          yAxisID: "y",
          tipo: tipoValorPrincipal,
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
          yAxisID: "y",
          tipo: tipoValorPrincipal,
        }),
      ];

      scales = criarEscalasLinha({
        tipoValorPrincipal,
        tipoValorSecundario: tipoValorPrincipal,
        usarSegundoEixo: false,
      });
    } else {
      const dadosValor = lista.map((item) => numeroSeguro(item.mediaValor));
      const dadosValor2 = lista.map((item) => numeroSeguro(item.mediaValor2));
      const temValor2 = dadosValor2.some((v) => v !== 0);

      const usarSegundoEixo = temValor2 && tiposSaoDiferentes(tipoValorPrincipal, tipoValorSecundario);

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
          yAxisID: "y",
          tipo: tipoValorPrincipal,
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
            yAxisID: usarSegundoEixo ? "y1" : "y",
            tipo: tipoValorSecundario,
          })
        );
      }

      scales = criarEscalasLinha({
        tipoValorPrincipal,
        tipoValorSecundario,
        usarSegundoEixo,
      });
    }

    window.dashboardCharts = window.dashboardCharts || {};

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
              label: callbackTooltipPorDataset(),
            },
          },
        },
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        scales,
      },
    });

    logInfo("Gráfico de evolução renderizado", {
      modoEvolucao,
      totalPontos: lista.length,
      totalDatasets: datasets.length,
      tipoValorPrincipal,
      tipoValorSecundario,
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
      logWarn("Canvas graficoRanking não encontrado");
      return;
    }

    destruirGraficoSeguro("ranking");

    const lista = listaSegura(ranking);

    DashboardBI.helpers.ajustarAlturaChartBox(
      "graficoRanking",
      lista.length || 0,
      {
        minimo: 220,
        maximo: 360,
        pxPorItem: 20,
      }
    );

    let labels = [];
    let datasets = [];
    let scales = {};

    if (tipoRanking === "lojas") {
      labels = lista.map((item) => item.loja);

      const dadosValor = lista.map((item) => numeroSeguro(item.mediaValor));
      const dadosValor2 = lista.map((item) => numeroSeguro(item.mediaValor2));
      const temValor2 = dadosValor2.some((v) => v !== 0);
      const usarSegundoEixo = temValor2 && tiposSaoDiferentes(tipoValorPrincipal, tipoValorSecundario);

      datasets = [
        gerarDatasetBarra({
          label: `Média valor (${tipoValorPrincipal})`,
          data: dadosValor,
          backgroundColor: "rgba(30, 96, 145, 0.78)",
          borderColor: "#1e6091",
          xAxisID: "x",
          tipo: tipoValorPrincipal,
        }),
      ];

      if (temValor2) {
        datasets.push(
          gerarDatasetBarra({
            label: `Média valor 2 (${tipoValorSecundario})`,
            data: dadosValor2,
            backgroundColor: "rgba(76, 175, 80, 0.78)",
            borderColor: "#4CAF50",
            xAxisID: usarSegundoEixo ? "x1" : "x",
            tipo: tipoValorSecundario,
          })
        );
      }

      scales = criarEscalasBarraHorizontal({
        tipoValorPrincipal,
        tipoValorSecundario,
        usarSegundoEixo,
      });
    } else {
      labels = lista.map((item) => item.indicador);

      const dadosValor = lista.map((item) => numeroSeguro(item.mediaValor));
      const dadosValor2 = lista.map((item) => numeroSeguro(item.mediaValor2));
      const temValor2 = dadosValor2.some((v) => v !== 0);
      const usarSegundoEixo = temValor2 && tiposSaoDiferentes(tipoValorPrincipal, tipoValorSecundario);

      datasets = [
        gerarDatasetBarra({
          label: `Média valor (${tipoValorPrincipal})`,
          data: dadosValor,
          backgroundColor: "rgba(156, 39, 176, 0.78)",
          borderColor: "#9C27B0",
          xAxisID: "x",
          tipo: tipoValorPrincipal,
        }),
      ];

      if (temValor2) {
        datasets.push(
          gerarDatasetBarra({
            label: `Média valor 2 (${tipoValorSecundario})`,
            data: dadosValor2,
            backgroundColor: "rgba(76, 175, 80, 0.78)",
            borderColor: "#4CAF50",
            xAxisID: usarSegundoEixo ? "x1" : "x",
            tipo: tipoValorSecundario,
          })
        );
      }

      scales = criarEscalasBarraHorizontal({
        tipoValorPrincipal,
        tipoValorSecundario,
        usarSegundoEixo,
      });
    }

    window.dashboardCharts = window.dashboardCharts || {};

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
              label: callbackTooltipPorDataset(),
            },
          },
        },
        scales,
      },
    });

    logInfo("Gráfico de ranking renderizado", {
      tipoRanking,
      total: lista.length,
      totalDatasets: datasets.length,
      tipoValorPrincipal,
      tipoValorSecundario,
    });
  };

  logInfo("dashboard-charts.js pronto", {
    renderGraficosDashboard: typeof DashboardBI.charts.renderGraficosDashboard,
    renderGraficoEvolucaoDashboard:
      typeof DashboardBI.charts.renderGraficoEvolucaoDashboard,
    renderGraficoRankingDashboard:
      typeof DashboardBI.charts.renderGraficoRankingDashboard,
  });
})();