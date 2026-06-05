console.log("✅ dashboard-aggregations.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.aggregations = DashboardBI.aggregations || {};

(function inicializarDashboardAggregations() {
  const LOG_PREFIX = "📦 DashboardAggregations";

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

  function getState() {
    return DashboardBI.STATE || {};
  }

  function listaSegura(lista) {
    return Array.isArray(lista) ? lista : [];
  }

  function numeroSeguro(valor, fallback = 0) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : fallback;
  }

  function stringSegura(valor) {
    return (valor || "").toString().trim();
  }

  function normalizarPeriodo(valor, fallback = "MENSAL") {
    if (DashboardBI.stateUtils?.normalizarPeriodo) {
      return DashboardBI.stateUtils.normalizarPeriodo(valor, fallback);
    }

    const texto = stringSegura(valor).toUpperCase();
    if (["SEMANAL", "MENSAL", "ANUAL"].includes(texto)) return texto;
    return fallback;
  }

  function normalizarSemana(valor) {
    return String(valor || "").padStart(2, "0");
  }

  function getLimiteRanking(limite = undefined) {
    if (limite === null || limite === false) return null;

    const valor =
      limite !== undefined ? limite : DashboardBI.CONSTS?.LIMITE_RANKING || 12;

    const numero = Number(valor);
    return Number.isFinite(numero) && numero > 0 ? numero : null;
  }

  function aplicarLimiteRanking(lista = [], limite = undefined) {
    const limiteFinal = getLimiteRanking(limite);

    if (limiteFinal === null) {
      return [...listaSegura(lista)];
    }

    return [...listaSegura(lista)].slice(0, limiteFinal);
  }

  function getCampoKeyPorCampoMedia(campo = "mediaValor") {
    return campo === "mediaValor2" ? "valor2" : "valor";
  }

  function getTipoCampoAtual(campo = "mediaValor") {
    const state = getState();

    if (state.indicador && state.indicador !== "TODOS") {
      return DashboardBI.helpers.getTipoCampo(
        state.indicador,
        getCampoKeyPorCampoMedia(campo),
        state.classe === "TODAS" ? null : state.classe
      );
    }

    return "numero";
  }

  function getRegraOrdenacaoAtual(campo = "mediaValor") {
    const state = getState();
    const tipoCampo = getTipoCampoAtual(campo);

    const ordemFinal = DashboardBI.helpers.getOrdemEspecialDashboard({
      indicador: state.indicador,
      classe: state.classe,
      campo,
      tipo: tipoCampo,
    });

    const regra = {
      campo,
      tipoCampo,
      ordemFinal,
      menorMelhor: ordemFinal === "asc",
    };

    logInfo("Regra de ordenação resolvida", regra);

    return regra;
  }

  function ordenarListaPorRegra(lista = [], campo = "mediaValor") {
    const regra = getRegraOrdenacaoAtual(campo);

    const ordenada = [...listaSegura(lista)].sort((a, b) => {
      const valorA = numeroSeguro(a?.[campo], 0);
      const valorB = numeroSeguro(b?.[campo], 0);

      if (regra.ordemFinal === "asc") return valorA - valorB;
      return valorB - valorA;
    });

    logInfo("Lista ordenada por regra", {
      campo,
      ordemFinal: regra.ordemFinal,
      total: ordenada.length,
    });

    return ordenada;
  }

  function filtrarListaComCampoValido(lista = [], campo = "mediaValor") {
    const filtrada = listaSegura(lista).filter((item) =>
      Number.isFinite(Number(item?.[campo]))
    );

    logInfo("Lista filtrada por campo válido", {
      campo,
      totalOriginal: listaSegura(lista).length,
      totalFiltrada: filtrada.length,
    });

    return filtrada;
  }

  function montarMediaPorChave(resultados = [], chave = "loja") {
    const mapa = {};

    listaSegura(resultados).forEach((r) => {
      const chaveValor = r?.[chave];
      if (!chaveValor) return;

      if (!mapa[chaveValor]) {
        mapa[chaveValor] = {
          chave: chaveValor,
          valores: [],
          valores2: [],
          qtd: 0,
        };
      }

      mapa[chaveValor].valores.push(numeroSeguro(r.valor));
      mapa[chaveValor].valores2.push(numeroSeguro(r.valor2));
      mapa[chaveValor].qtd += 1;
    });

    const lista = Object.values(mapa).map((item) => ({
      chave: item.chave,
      mediaValor: item.qtd
        ? DashboardBI.helpers.calcularMedia(item.valores)
        : 0,
      mediaValor2: item.qtd
        ? DashboardBI.helpers.calcularMedia(item.valores2)
        : 0,
      qtd: item.qtd,
    }));

    logInfo("Médias por chave calculadas", {
      chave,
      total: lista.length,
    });

    return lista;
  }

  function extrairPrimeiraEUltimaSemana(resultados = []) {
    const semanas = [
      ...new Set(listaSegura(resultados).map((r) => normalizarSemana(r.semana))),
    ]
      .filter(Boolean)
      .sort((a, b) => Number(a) - Number(b));

    const payload = {
      primeira: semanas[0] || null,
      ultima: semanas[semanas.length - 1] || null,
      lista: semanas,
    };

    logInfo("Primeira e última semana extraídas", payload);

    return payload;
  }

  function getInfoSemanasNormalizada(infoPeriodo = {}, resultados = []) {
    const primeira = infoPeriodo?.primeira
      ? normalizarSemana(infoPeriodo.primeira)
      : null;

    const ultima = infoPeriodo?.ultima
      ? normalizarSemana(infoPeriodo.ultima)
      : null;

    if (primeira && ultima) {
      const payload = {
        primeira,
        ultima,
        lista: listaSegura(infoPeriodo?.lista).map(normalizarSemana),
        descricao: infoPeriodo?.descricao || "período informado",
      };

      logInfo("Info de semanas normalizada a partir do período informado", payload);
      return payload;
    }

    const extraida = extrairPrimeiraEUltimaSemana(resultados);

    const payload = {
      primeira: extraida.primeira,
      ultima: extraida.ultima,
      lista: extraida.lista,
      descricao: infoPeriodo?.descricao || "período calculado",
    };

    logInfo("Info de semanas normalizada a partir dos resultados", payload);
    return payload;
  }

  function montarMediaPrimeiraEUltimaSemana(resultados = [], chave = "loja") {
    const semanasInfo = extrairPrimeiraEUltimaSemana(resultados);
    const mapa = {};

    listaSegura(resultados).forEach((r) => {
      const chaveValor = r?.[chave];
      if (!chaveValor) return;

      if (!mapa[chaveValor]) {
        mapa[chaveValor] = {
          chave: chaveValor,
          primeiraSemanaValores: [],
          ultimaSemanaValores: [],
          primeiraSemanaValores2: [],
          ultimaSemanaValores2: [],
          qtd: 0,
        };
      }

      const semanaAtual = normalizarSemana(r.semana);

      if (semanaAtual === semanasInfo.primeira) {
        mapa[chaveValor].primeiraSemanaValores.push(numeroSeguro(r.valor));
        mapa[chaveValor].primeiraSemanaValores2.push(numeroSeguro(r.valor2));
      }

      if (semanaAtual === semanasInfo.ultima) {
        mapa[chaveValor].ultimaSemanaValores.push(numeroSeguro(r.valor));
        mapa[chaveValor].ultimaSemanaValores2.push(numeroSeguro(r.valor2));
      }

      mapa[chaveValor].qtd += 1;
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
        chave: item.chave,
        mediaValor,
        mediaValor2,
        qtd: item.qtd,
      };
    });

    logInfo("Média primeira/última semana calculada", {
      chave,
      total: lista.length,
      semanasInfo,
    });

    return lista;
  }

  // ==========================
  // 📦 AGRUPAR INDICADORES POR MÉDIA (COMPAT)
  // ==========================
  DashboardBI.aggregations.agruparIndicadoresPorMediaDashboard = function (
    resultadosMes,
    options = {}
  ) {
    const campoOrdenacao = options?.campo || "mediaValor";
    const limite = options?.limite;

    const listaBase = montarMediaPorChave(resultadosMes, "indicador").map(
      (item) => ({
        indicador: item.chave,
        mediaValor: item.mediaValor,
        mediaValor2: item.mediaValor2,
        qtd: item.qtd,
      })
    );

    const lista = aplicarLimiteRanking(
      ordenarListaPorRegra(
        filtrarListaComCampoValido(listaBase, campoOrdenacao),
        campoOrdenacao
      ),
      limite
    );

    logInfo("Ranking por indicador agregado (compat)", {
      campoOrdenacao,
      limite,
      total: lista.length,
      lista,
    });

    return lista;
  };

  // ==========================
  // 🏆 AGRUPAR RANKING DE LOJAS (COMPAT)
  // média = (primeira semana + última semana) / 2
  // ==========================
  DashboardBI.aggregations.agruparLojasRankingDashboard = function (
    resultadosMes,
    semanasMesInfo,
    options = {}
  ) {
    let listaBase = [];

    if (semanasMesInfo?.primeira && semanasMesInfo?.ultima) {
      const primeira = normalizarSemana(semanasMesInfo.primeira);
      const ultima = normalizarSemana(semanasMesInfo.ultima);
      const mapa = {};

      listaSegura(resultadosMes).forEach((r) => {
        if (!mapa[r.loja]) {
          mapa[r.loja] = {
            loja: r.loja,
            primeiraSemanaValores: [],
            ultimaSemanaValores: [],
            primeiraSemanaValores2: [],
            ultimaSemanaValores2: [],
          };
        }

        const semanaAtual = normalizarSemana(r.semana);

        if (semanaAtual === primeira) {
          mapa[r.loja].primeiraSemanaValores.push(numeroSeguro(r.valor));
          mapa[r.loja].primeiraSemanaValores2.push(numeroSeguro(r.valor2));
        }

        if (semanaAtual === ultima) {
          mapa[r.loja].ultimaSemanaValores.push(numeroSeguro(r.valor));
          mapa[r.loja].ultimaSemanaValores2.push(numeroSeguro(r.valor2));
        }
      });

      listaBase = Object.values(mapa).map((item) => {
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
    } else {
      listaBase = montarMediaPorChave(resultadosMes, "loja").map((item) => ({
        loja: item.chave,
        mediaValor: item.mediaValor,
        mediaValor2: item.mediaValor2,
        qtd: item.qtd,
      }));
    }

    const campoOrdenacao = options?.campo || "mediaValor";
    const limite = options?.limite;

    const final = aplicarLimiteRanking(
      ordenarListaPorRegra(
        filtrarListaComCampoValido(listaBase, campoOrdenacao),
        campoOrdenacao
      ),
      limite
    );

    logInfo("Ranking de lojas agregado (compat)", {
      campoOrdenacao,
      limite,
      total: final.length,
      final,
    });

    return final;
  };

  // ==========================
  // 🏆 NOVO RANKING DE LOJAS POR PERÍODO
  // semanal / mensal / anual
  // ==========================
  DashboardBI.aggregations.agruparRankingLojasPorPeriodoDashboard = function (
    resultadosPeriodo,
    infoPeriodo = {},
    options = {}
  ) {
    const state = getState();
    const periodo = normalizarPeriodo(
      state.periodoRanking || state.periodoDashboard,
      "MENSAL"
    );

    let listaBase = [];

    // Mantemos tratamento explícito por período
    if (periodo === "SEMANAL") {
      listaBase = montarMediaPorChave(resultadosPeriodo, "loja").map(
        (item) => ({
          loja: item.chave,
          mediaValor: item.mediaValor,
          mediaValor2: item.mediaValor2,
          qtd: item.qtd,
        })
      );
    } else if (periodo === "MENSAL") {
      listaBase = montarMediaPorChave(resultadosPeriodo, "loja").map(
        (item) => ({
          loja: item.chave,
          mediaValor: item.mediaValor,
          mediaValor2: item.mediaValor2,
          qtd: item.qtd,
        })
      );
    } else if (periodo === "ANUAL") {
      listaBase = montarMediaPorChave(resultadosPeriodo, "loja").map(
        (item) => ({
          loja: item.chave,
          mediaValor: item.mediaValor,
          mediaValor2: item.mediaValor2,
          qtd: item.qtd,
        })
      );
    } else {
      listaBase = montarMediaPorChave(resultadosPeriodo, "loja").map(
        (item) => ({
          loja: item.chave,
          mediaValor: item.mediaValor,
          mediaValor2: item.mediaValor2,
          qtd: item.qtd,
        })
      );
    }

    const campoOrdenacao = options?.campo || "mediaValor";
    const limite = options?.limite;

    const final = aplicarLimiteRanking(
      ordenarListaPorRegra(
        filtrarListaComCampoValido(listaBase, campoOrdenacao),
        campoOrdenacao
      ),
      limite
    );

    logInfo("Ranking de lojas por período agregado", {
      periodo,
      infoPeriodo,
      campoOrdenacao,
      limite,
      total: final.length,
      final,
    });

    return final;
  };

  // ==========================
  // 📦 NOVO RANKING DE INDICADORES POR PERÍODO
  // semanal / mensal / anual
  // ==========================
  DashboardBI.aggregations.agruparRankingIndicadoresPorPeriodoDashboard =
    function (resultadosPeriodo, infoPeriodo = {}, options = {}) {
      const state = getState();
      const periodo = normalizarPeriodo(
        state.periodoRanking || state.periodoDashboard,
        "MENSAL"
      );

      const campoOrdenacao = options?.campo || "mediaValor";
      const limite = options?.limite;

      const listaBase = montarMediaPorChave(resultadosPeriodo, "indicador").map(
        (item) => ({
          indicador: item.chave,
          mediaValor: item.mediaValor,
          mediaValor2: item.mediaValor2,
          qtd: item.qtd,
        })
      );

      const final = aplicarLimiteRanking(
        ordenarListaPorRegra(
          filtrarListaComCampoValido(listaBase, campoOrdenacao),
          campoOrdenacao
        ),
        limite
      );

      logInfo("Ranking de indicadores por período agregado", {
        periodo,
        infoPeriodo,
        campoOrdenacao,
        limite,
        total: final.length,
        final,
      });

      return final;
    };

  // ==========================
  // 🌍 EVOLUÇÃO REGIONAL (NE1 x NE2)
  // ==========================
  DashboardBI.aggregations.agruparEvolucaoRegionalDashboard = function (
    resultados,
    semanasJanela,
    mapaLojaRegional = {}
  ) {
    const lista = listaSegura(semanasJanela).map((semana) => {
      const semanaNorm = normalizarSemana(semana);

      const dadosSemana = listaSegura(resultados).filter(
        (r) => normalizarSemana(r.semana) === semanaNorm
      );

      const dadosNE1 = dadosSemana.filter((r) => {
        const regional = DashboardBI.helpers.normalizarTextoUpper(
          mapaLojaRegional[r.loja] || ""
        );
        return regional === "NE1";
      });

      const dadosNE2 = dadosSemana.filter((r) => {
        const regional = DashboardBI.helpers.normalizarTextoUpper(
          mapaLojaRegional[r.loja] || ""
        );
        return regional === "NE2";
      });

      return {
        semana: semanaNorm,
        registros: dadosSemana.length,
        mediaNE1: DashboardBI.helpers.calcularMedia(dadosNE1.map((r) => r.valor)),
        mediaNE2: DashboardBI.helpers.calcularMedia(dadosNE2.map((r) => r.valor)),
      };
    });

    logInfo("Evolução regional NE1 x NE2 agregada", {
      total: lista.length,
      lista,
    });

    return lista;
  };

  // ==========================
  // 🧩 RANKING POR SUBCLASSE
  // mantido apenas por compatibilidade
  // ==========================
  DashboardBI.aggregations.agruparRankingSubclassesDashboard = function (
    resultadosMes,
    options = {}
  ) {
    const mapa = {};

    listaSegura(resultadosMes).forEach((r) => {
      const subclasse = r.subclasse || r.classe || "Sem subclasse";

      if (!mapa[subclasse]) {
        mapa[subclasse] = {
          subclasse,
          valores: [],
          valores2: [],
          qtd: 0,
        };
      }

      mapa[subclasse].valores.push(numeroSeguro(r.valor));
      mapa[subclasse].valores2.push(numeroSeguro(r.valor2));
      mapa[subclasse].qtd += 1;
    });

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

    const campoOrdenacao = options?.campo || "mediaValor";
    const limite = options?.limite;

    const ordenada = aplicarLimiteRanking(
      ordenarListaPorRegra(
        filtrarListaComCampoValido(lista, campoOrdenacao),
        campoOrdenacao
      ),
      limite
    );

    logInfo("Ranking por subclasse agregado (compat)", {
      campoOrdenacao,
      limite,
      total: ordenada.length,
      ordenada,
    });

    return ordenada;
  };

  // ==========================
  // 🏆 MELHOR E PIOR LOJA DO ESCOPO
  // ==========================
  DashboardBI.aggregations.calcularMelhorEPiorLojaDashboard = function (
    resultadosMes,
    tipoValorPrincipal
  ) {
    const mapa = {};

    listaSegura(resultadosMes).forEach((r) => {
      if (!mapa[r.loja]) {
        mapa[r.loja] = [];
      }
      mapa[r.loja].push(numeroSeguro(r.valor));
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

    const menorMelhor = DashboardBI.helpers.menorEhMelhor(
      tipoValorPrincipal,
      "mediaValor"
    );

    const ordenado = [...lista].sort((a, b) => {
      if (menorMelhor) return a.media - b.media;
      return b.media - a.media;
    });

    const resultado = {
      melhor: ordenado[0] || null,
      pior: ordenado[ordenado.length - 1] || null,
    };

    logInfo("Melhor e pior loja calculadas", resultado);

    return resultado;
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
      listaSegura(lojasEscopoBase)
        .filter(
          (l) =>
            DashboardBI.helpers.normalizarTextoUpper(l.regional) ===
            DashboardBI.helpers.normalizarTextoUpper(regional)
        )
        .map((l) => DashboardBI.helpers.getChaveLoja(l))
    );

    const dadosRegional = listaSegura(resultadosMes).filter((r) =>
      lojasRegional.has(r.loja)
    );

    const media = DashboardBI.helpers.calcularMedia(
      dadosRegional.map((r) => r.valor)
    );

    logInfo("Média por regional calculada", {
      regional,
      totalLojasRegional: lojasRegional.size,
      totalRegistros: dadosRegional.length,
      media,
    });

    return media;
  };

  // ==========================
  // 🌍 MÉDIA PRIMEIRA / ÚLTIMA / MENSAL
  // ==========================
  DashboardBI.aggregations.calcularMediasMensaisDashboard = function (
    resultadosMes,
    semanasMesInfo
  ) {
    const primeira = normalizarSemana(semanasMesInfo?.primeira);
    const ultima = normalizarSemana(semanasMesInfo?.ultima);

    const primeiraSemana = listaSegura(resultadosMes).filter(
      (r) => normalizarSemana(r.semana) === primeira
    );

    const ultimaSemana = listaSegura(resultadosMes).filter(
      (r) => normalizarSemana(r.semana) === ultima
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

    const resultado = {
      mediaPrimeira,
      mediaUltima,
      mediaMensal,
    };

    logInfo("Médias mensais calculadas", resultado);

    return resultado;
  };

  // ==========================
  // 📈 EVOLUÇÃO SEMANAL
  // ==========================
  DashboardBI.aggregations.agruparEvolucaoDashboard = function (
    resultados,
    semanasJanela
  ) {
    const lista = listaSegura(semanasJanela).map((semana) => {
      const semanaNorm = normalizarSemana(semana);

      const dadosSemana = listaSegura(resultados).filter(
        (r) => normalizarSemana(r.semana) === semanaNorm
      );

      return {
        semana: semanaNorm,
        registros: dadosSemana.length,
        mediaValor: DashboardBI.helpers.calcularMedia(
          dadosSemana.map((r) => r.valor)
        ),
        mediaValor2: DashboardBI.helpers.calcularMedia(
          dadosSemana.map((r) => r.valor2)
        ),
      };
    });

    logInfo("Evolução semanal agregada", {
      total: lista.length,
      lista,
    });

    return lista;
  };

  // ==========================
  // 🔧 HELPERS EXPOSTOS
  // ==========================
  DashboardBI.aggregations._private = DashboardBI.aggregations._private || {};
  DashboardBI.aggregations._private.getInfoSemanasNormalizada = getInfoSemanasNormalizada;
  DashboardBI.aggregations._private.extrairPrimeiraEUltimaSemana = extrairPrimeiraEUltimaSemana;
  DashboardBI.aggregations._private.montarMediaPrimeiraEUltimaSemana = montarMediaPrimeiraEUltimaSemana;
  DashboardBI.aggregations._private.ordenarListaPorRegra = ordenarListaPorRegra;
  DashboardBI.aggregations._private.aplicarLimiteRanking = aplicarLimiteRanking;

  logInfo("dashboard-aggregations.js pronto", {
    agruparIndicadoresPorMediaDashboard:
      typeof DashboardBI.aggregations.agruparIndicadoresPorMediaDashboard,
    agruparLojasRankingDashboard:
      typeof DashboardBI.aggregations.agruparLojasRankingDashboard,
    agruparRankingLojasPorPeriodoDashboard:
      typeof DashboardBI.aggregations.agruparRankingLojasPorPeriodoDashboard,
    agruparRankingIndicadoresPorPeriodoDashboard:
      typeof DashboardBI.aggregations.agruparRankingIndicadoresPorPeriodoDashboard,
    agruparEvolucaoRegionalDashboard:
      typeof DashboardBI.aggregations.agruparEvolucaoRegionalDashboard,
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