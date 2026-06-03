console.log("✅ dashboard-aggregations.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.aggregations = DashboardBI.aggregations || {};

(function inicializarDashboardAggregations() {
  function getState() {
    return DashboardBI.STATE || {};
  }

  function getLimiteRanking() {
    return DashboardBI.CONSTS?.LIMITE_RANKING || 12;
  }

  function getTipoValorPrincipalAtual() {
    const state = getState();

    if (state.indicador && state.indicador !== "TODOS") {
      return DashboardBI.helpers.getTipoCampo(
        state.indicador,
        "valor",
        state.classe === "TODAS" ? null : state.classe
      );
    }

    return "numero";
  }

  // ==========================
  // 📦 AGRUPAR INDICADORES POR MÉDIA
  // ==========================
  DashboardBI.aggregations.agruparIndicadoresPorMediaDashboard = function (
    resultadosMes
  ) {
    const mapa = {};

    (resultadosMes || []).forEach((r) => {
      if (!mapa[r.indicador]) {
        mapa[r.indicador] = {
          indicador: r.indicador,
          valores: [],
          valores2: [],
        };
      }

      mapa[r.indicador].valores.push(Number(r.valor));
      mapa[r.indicador].valores2.push(Number(r.valor2));
    });

    const lista = Object.values(mapa)
      .map((item) => ({
        indicador: item.indicador,
        mediaValor: DashboardBI.helpers.calcularMedia(item.valores),
        mediaValor2: DashboardBI.helpers.calcularMedia(item.valores2),
      }))
      .sort((a, b) => b.mediaValor - a.mediaValor)
      .slice(0, getLimiteRanking());

    console.log("📦 Ranking por indicador agregado:", {
      total: lista.length,
      lista,
    });

    return lista;
  };

  // ==========================
  // 🏆 AGRUPAR RANKING DE LOJAS
  // média = (primeira semana + última semana) / 2
  // ==========================
  DashboardBI.aggregations.agruparLojasRankingDashboard = function (
    resultadosMes,
    semanasMesInfo
  ) {
    const mapa = {};

    (resultadosMes || []).forEach((r) => {
      if (!mapa[r.loja]) {
        mapa[r.loja] = {
          loja: r.loja,
          primeiraSemanaValores: [],
          ultimaSemanaValores: [],
          primeiraSemanaValores2: [],
          ultimaSemanaValores2: [],
        };
      }

      if (String(r.semana) === String(semanasMesInfo.primeira)) {
        mapa[r.loja].primeiraSemanaValores.push(Number(r.valor));
        mapa[r.loja].primeiraSemanaValores2.push(Number(r.valor2));
      }

      if (String(r.semana) === String(semanasMesInfo.ultima)) {
        mapa[r.loja].ultimaSemanaValores.push(Number(r.valor));
        mapa[r.loja].ultimaSemanaValores2.push(Number(r.valor2));
      }
    });

    const lista = Object.values(mapa).map((item) => {
      const mediaPrimeira = DashboardBI.helpers.calcularMedia(
        item.primeiraSemanaValores
      );
      const mediaUltima = DashboardBI.helpers.calcularMedia(
        item.ultimaSemanaValores
      );

      const mediaPrimeira2 = DashboardBI.helpers.calcularMedia(
        item.primeiraSemanaValores2
      );
      const mediaUltima2 = DashboardBI.helpers.calcularMedia(
        item.ultimaSemanaValores2
      );

      let mediaValor = 0;
      let mediaValor2 = 0;

      const temPrimeira = item.primeiraSemanaValores.length > 0;
      const temUltima = item.ultimaSemanaValores.length > 0;

      const temPrimeira2 = item.primeiraSemanaValores2.length > 0;
      const temUltima2 = item.ultimaSemanaValores2.length > 0;

      if (temPrimeira && temUltima) {
        mediaValor = (mediaPrimeira + mediaUltima) / 2;
      } else if (temPrimeira) {
        mediaValor = mediaPrimeira;
      } else if (temUltima) {
        mediaValor = mediaUltima;
      }

      if (temPrimeira2 && temUltima2) {
        mediaValor2 = (mediaPrimeira2 + mediaUltima2) / 2;
      } else if (temPrimeira2) {
        mediaValor2 = mediaPrimeira2;
      } else if (temUltima2) {
        mediaValor2 = mediaUltima2;
      }

      return {
        loja: item.loja,
        mediaValor,
        mediaValor2,
      };
    });

    const state = getState();

    const ordem =
      state.indicador && state.indicador !== "TODOS"
        ? DashboardBI.helpers.getOrdemRanking(
            state.indicador,
            state.classe === "TODAS" ? null : state.classe
          )
        : "desc";

    lista.sort((a, b) => {
      if (ordem === "asc") return a.mediaValor - b.mediaValor;
      return b.mediaValor - a.mediaValor;
    });

    const final = lista
      .filter((item) => !isNaN(item.mediaValor))
      .slice(0, getLimiteRanking());

    console.log("🏆 Ranking de lojas agregado:", {
      ordem,
      total: final.length,
      final,
    });

    return final;
  };

  // ==========================
  // 🧩 RANKING POR SUBCLASSE
  // (novo: mais útil para a nova visão BI)
  // ==========================
  DashboardBI.aggregations.agruparRankingSubclassesDashboard = function (
    resultadosMes
  ) {
    const mapa = {};

    (resultadosMes || []).forEach((r) => {
      const subclasse =
        r.subclasse || r.classe || "Sem subclasse";

      if (!mapa[subclasse]) {
        mapa[subclasse] = {
          subclasse,
          valores: [],
          valores2: [],
          qtd: 0,
        };
      }

      mapa[subclasse].valores.push(Number(r.valor));
      mapa[subclasse].valores2.push(Number(r.valor2));
      mapa[subclasse].qtd += 1;
    });

    const tipoValorPrincipal = getTipoValorPrincipalAtual();
    const menorMelhor = DashboardBI.helpers.menorEhMelhor(tipoValorPrincipal);

    const lista = Object.values(mapa).map((item) => ({
      subclasse: item.subclasse,
      qtd: item.qtd,
      mediaValor: item.qtd
        ? DashboardBI.helpers.calcularMedia(item.valores)
        : 0,
      mediaValor2: item.qtd
        ? DashboardBI.helpers.calcularMedia(item.valores2)
        : 0,
    }));

    lista.sort((a, b) => {
      if (menorMelhor) return a.mediaValor - b.mediaValor;
      return b.mediaValor - a.mediaValor;
    });

    console.log("🧩 Ranking por subclasse agregado:", {
      menorMelhor,
      total: lista.length,
      lista,
    });

    return lista;
  };

  // ==========================
  // 🏆 MELHOR E PIOR LOJA DO ESCOPO
  // ==========================
  DashboardBI.aggregations.calcularMelhorEPiorLojaDashboard = function (
    resultadosMes,
    tipoValorPrincipal
  ) {
    const mapa = {};

    (resultadosMes || []).forEach((r) => {
      if (!mapa[r.loja]) {
        mapa[r.loja] = [];
      }
      mapa[r.loja].push(Number(r.valor));
    });

    const lista = Object.entries(mapa).map(([loja, valores]) => ({
      loja,
      media: DashboardBI.helpers.calcularMedia(valores),
    }));

    if (!lista.length) {
      return {
        melhor: null,
        pior: null,
      };
    }

    const menorMelhor = DashboardBI.helpers.menorEhMelhor(tipoValorPrincipal);

    const ordenado = [...lista].sort((a, b) => {
      if (menorMelhor) return a.media - b.media;
      return b.media - a.media;
    });

    return {
      melhor: ordenado[0] || null,
      pior: ordenado[ordenado.length - 1] || null,
    };
  };

  // ==========================
  // 🌍 MÉDIA POR REGIONAL
  // ==========================
  DashboardBI.aggregations.calcularMediaPorRegionalDashboard = function (
    resultadosMes,
    lojasEscopoBase,
    regional
  ) {
    const lojasRegional = new Set(
      (lojasEscopoBase || [])
        .filter(
          (l) =>
            DashboardBI.helpers.normalizarTextoUpper(l.regional) ===
            DashboardBI.helpers.normalizarTextoUpper(regional)
        )
        .map((l) => DashboardBI.helpers.getChaveLoja(l))
    );

    const dadosRegional = (resultadosMes || []).filter((r) =>
      lojasRegional.has(r.loja)
    );

    return DashboardBI.helpers.calcularMedia(
      dadosRegional.map((r) => r.valor)
    );
  };

  // ==========================
  // 🌍 MÉDIA PRIMEIRA / ÚLTIMA / MENSAL
  // ==========================
  DashboardBI.aggregations.calcularMediasMensaisDashboard = function (
    resultadosMes,
    semanasMesInfo
  ) {
    const primeiraSemana = (resultadosMes || []).filter(
      (r) => String(r.semana) === String(semanasMesInfo.primeira)
    );

    const ultimaSemana = (resultadosMes || []).filter(
      (r) => String(r.semana) === String(semanasMesInfo.ultima)
    );

    const mediaPrimeira = DashboardBI.helpers.calcularMedia(
      primeiraSemana.map((r) => r.valor)
    );
    const mediaUltima = DashboardBI.helpers.calcularMedia(
      ultimaSemana.map((r) => r.valor)
    );

    let mediaMensal = 0;

    if (primeiraSemana.length && ultimaSemana.length) {
      mediaMensal = (mediaPrimeira + mediaUltima) / 2;
    } else if (primeiraSemana.length) {
      mediaMensal = mediaPrimeira;
    } else if (ultimaSemana.length) {
      mediaMensal = mediaUltima;
    }

    return {
      mediaPrimeira,
      mediaUltima,
      mediaMensal,
    };
  };

  // ==========================
  // 📈 EVOLUÇÃO SEMANAL
  // ==========================
  DashboardBI.aggregations.agruparEvolucaoDashboard = function (
    resultados,
    semanasJanela
  ) {
    const lista = (semanasJanela || []).map((semana) => {
      const dadosSemana = (resultados || []).filter(
        (r) => String(r.semana) === String(semana)
      );

      return {
        semana,
        registros: dadosSemana.length,
        mediaValor: DashboardBI.helpers.calcularMedia(
          dadosSemana.map((r) => r.valor)
        ),
        mediaValor2: DashboardBI.helpers.calcularMedia(
          dadosSemana.map((r) => r.valor2)
        ),
      };
    });

    console.log("📈 Evolução semanal agregada:", lista);
    return lista;
  };

  console.log("✅ dashboard-aggregations.js pronto", {
    agruparIndicadoresPorMediaDashboard:
      typeof DashboardBI.aggregations.agruparIndicadoresPorMediaDashboard,
    agruparLojasRankingDashboard:
      typeof DashboardBI.aggregations.agruparLojasRankingDashboard,
    agruparRankingSubclassesDashboard:
      typeof DashboardBI.aggregations.agruparRankingSubclassesDashboard,
    calcularMelhorEPiorLojaDashboard:
      typeof DashboardBI.aggregations.calcularMelhorEPiorLojaDashboard,
    calcularMediaPorRegionalDashboard:
      typeof DashboardBI.aggregations.calcularMediaPorRegionalDashboard,
    calcularMediasMensaisDashboard:
      typeof DashboardBI.aggregations.calcularMediasMensaisDashboard,
    agruparEvolucaoDashboard:
      typeof DashboardBI.aggregations.agruparEvolucaoDashboard,
  });
})();