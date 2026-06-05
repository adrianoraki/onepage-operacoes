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

  function extrairAnoMesLinha(resultado = {}) {
    const linha = resultado || {};

    const possiveisCamposAno = [
      linha.ano,
      linha.ano_referencia,
      linha.ano_ref,
      linha.exercicio,
    ];

    const possiveisCamposMes = [
      linha.mes,
      linha.mes_referencia,
      linha.mes_ref,
    ];

    let ano = possiveisCamposAno.find(
      (v) => v !== null && v !== undefined && v !== ""
    );
    let mes = possiveisCamposMes.find(
      (v) => v !== null && v !== undefined && v !== ""
    );

    if (ano) ano = String(ano).padStart(4, "0");
    if (mes) mes = String(mes).padStart(2, "0");

    const dataBruta =
      linha.data_referencia ||
      linha.data ||
      linha.created_at ||
      linha.updated_at ||
      null;

    if ((!ano || !mes) && dataBruta) {
      const d = new Date(dataBruta);
      if (!isNaN(d.getTime())) {
        ano = ano || String(d.getFullYear());
        mes = mes || String(d.getMonth() + 1).padStart(2, "0");
      }
    }

    return {
      ano: ano || "",
      mes: mes || "",
    };
  }

  function agruparValoresPorMes(linhas = [], campoBase = "valor") {
    const mapa = {};

    listaSegura(linhas).forEach((r) => {
      const ref = extrairAnoMesLinha(r);
      const chaveMes = `${ref.ano}-${ref.mes}`;

      if (!ref.ano || !ref.mes) return;

      if (!mapa[chaveMes]) {
        mapa[chaveMes] = [];
      }

      mapa[chaveMes].push(numeroSeguro(r?.[campoBase]));
    });

    return mapa;
  }

  function calcularValorAgregadoPorPeriodo({
    linhas = [],
    campoBase = "valor",
    tipoCampo = "numero",
    periodo = "MENSAL",
    indicador = "",
    classe = "",
  }) {
    const lista = listaSegura(linhas);
    const usaMediaPercentual = DashboardBI.helpers.rankingUsaMediaPercentual(
      indicador,
      classe,
      tipoCampo
    );
    const usaSoma = DashboardBI.helpers.rankingUsaSoma(tipoCampo);

    let valorFinal = 0;

    // ==========================
    // PERCENTUAL / FAIXA
    // ==========================
    if (usaMediaPercentual) {
      if (periodo === "SEMANAL") {
        // resultados já chegam da semana escolhida
        valorFinal = DashboardBI.helpers.calcularMedia(
          lista.map((r) => numeroSeguro(r?.[campoBase]))
        );
      } else if (periodo === "MENSAL") {
        // média de todas as semanas do mês
        valorFinal = DashboardBI.helpers.calcularMedia(
          lista.map((r) => numeroSeguro(r?.[campoBase]))
        );
      } else if (periodo === "ANUAL") {
        // média das médias mensais
        const porMes = agruparValoresPorMes(lista, campoBase);
        const mediasMensais = Object.values(porMes).map((listaMes) =>
          DashboardBI.helpers.calcularMedia(listaMes)
        );

        valorFinal = DashboardBI.helpers.calcularMedia(mediasMensais);
      } else {
        valorFinal = DashboardBI.helpers.calcularMedia(
          lista.map((r) => numeroSeguro(r?.[campoBase]))
        );
      }

      logInfo("Valor agregado calculado por média percentual", {
        indicador,
        classe,
        campoBase,
        tipoCampo,
        periodo,
        valorFinal,
        totalLinhas: lista.length,
      });

      return valorFinal;
    }

    // ==========================
    // SOMA (R$ / INTEIRO)
    // ==========================
    if (usaSoma) {
      valorFinal = lista.reduce(
        (acc, r) => acc + numeroSeguro(r?.[campoBase]),
        0
      );

      logInfo("Valor agregado calculado por soma", {
        indicador,
        classe,
        campoBase,
        tipoCampo,
        periodo,
        valorFinal,
        totalLinhas: lista.length,
      });

      return valorFinal;
    }

    // ==========================
    // NÚMERO PADRÃO
    // ==========================
    valorFinal = DashboardBI.helpers.calcularMedia(
      lista.map((r) => numeroSeguro(r?.[campoBase]))
    );

    logInfo("Valor agregado calculado por média padrão", {
      indicador,
      classe,
      campoBase,
      tipoCampo,
      periodo,
      valorFinal,
      totalLinhas: lista.length,
    });

    return valorFinal;
  }

  function agregarPorChaveEPeriodo({
    resultados = [],
    chave = "loja",
    campoOrdenacao = "mediaValor",
  }) {
    const state = getState();
    const periodo = normalizarPeriodo(
      state.periodoRanking || state.periodoDashboard,
      "MENSAL"
    );

    const campoBase = campoOrdenacao === "mediaValor2" ? "valor2" : "valor";
    const tipoCampo = getTipoCampoAtual(campoOrdenacao);

    const mapa = {};

    listaSegura(resultados).forEach((r) => {
      const chaveValor = r?.[chave];
      if (!chaveValor) return;

      if (!mapa[chaveValor]) {
        mapa[chaveValor] = {
          chave: chaveValor,
          linhas: [],
        };
      }

      mapa[chaveValor].linhas.push(r);
    });

    const lista = Object.values(mapa).map((item) => {
      const linhas = listaSegura(item.linhas);

      const valorPrincipal = calcularValorAgregadoPorPeriodo({
        linhas,
        campoBase,
        tipoCampo,
        periodo,
        indicador: state.indicador,
        classe: state.classe,
      });

      const tipoValor1 = getTipoCampoAtual("mediaValor");
      const tipoValor2 = getTipoCampoAtual("mediaValor2");

      const mediaValor = calcularValorAgregadoPorPeriodo({
        linhas,
        campoBase: "valor",
        tipoCampo: tipoValor1,
        periodo,
        indicador: state.indicador,
        classe: state.classe,
      });

      const mediaValor2 = calcularValorAgregadoPorPeriodo({
        linhas,
        campoBase: "valor2",
        tipoCampo: tipoValor2,
        periodo,
        indicador: state.indicador,
        classe: state.classe,
      });

      return {
        chave: item.chave,
        mediaValor:
          campoOrdenacao === "mediaValor" ? valorPrincipal : mediaValor,
        mediaValor2:
          campoOrdenacao === "mediaValor2" ? valorPrincipal : mediaValor2,
        qtd: linhas.length,
      };
    });

    logInfo("Agregação por chave e período concluída", {
      chave,
      campoOrdenacao,
      periodo,
      tipoCampo,
      total: lista.length,
    });

    return lista;
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

    logInfo("Médias por chave calculadas (base simples)", {
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

    logInfo("Média primeira/última semana calculada (compat legado)", {
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

    const listaBase = agregarPorChaveEPeriodo({
      resultados: resultadosMes,
      chave: "indicador",
      campoOrdenacao,
    }).map((item) => ({
      indicador: item.chave,
      mediaValor: item.mediaValor,
      mediaValor2: item.mediaValor2,
      qtd: item.qtd,
    }));

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
  // ==========================
  DashboardBI.aggregations.agruparLojasRankingDashboard = function (
    resultadosMes,
    semanasMesInfo,
    options = {}
  ) {
    const campoOrdenacao = options?.campo || "mediaValor";
    const limite = options?.limite;

    const listaBase = agregarPorChaveEPeriodo({
      resultados: resultadosMes,
      chave: "loja",
      campoOrdenacao,
    }).map((item) => ({
      loja: item.chave,
      mediaValor: item.mediaValor,
      mediaValor2: item.mediaValor2,
      qtd: item.qtd,
    }));

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
  // 🏆 RANKING DE LOJAS POR PERÍODO
  // regra final:
  // percentual -> semanal média da semana / mensal média das semanas / anual média das médias mensais
  // moeda + inteiro -> soma do período
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

    const campoOrdenacao = options?.campo || "mediaValor";
    const limite = options?.limite;

    const listaBase = agregarPorChaveEPeriodo({
      resultados: resultadosPeriodo,
      chave: "loja",
      campoOrdenacao,
    }).map((item) => ({
      loja: item.chave,
      mediaValor: item.mediaValor,
      mediaValor2: item.mediaValor2,
      qtd: item.qtd,
    }));

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
  // 📦 RANKING DE INDICADORES POR PERÍODO
  // segue mesma regra do ranking por loja
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

      const listaBase = agregarPorChaveEPeriodo({
        resultados: resultadosPeriodo,
        chave: "indicador",
        campoOrdenacao,
      }).map((item) => ({
        indicador: item.chave,
        mediaValor: item.mediaValor,
        mediaValor2: item.mediaValor2,
        qtd: item.qtd,
      }));

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
  // ==========================
  DashboardBI.aggregations.agruparRankingSubclassesDashboard = function (
    resultadosMes,
    options = {}
  ) {
    const campoOrdenacao = options?.campo || "mediaValor";
    const limite = options?.limite;

    const mapa = {};

    listaSegura(resultadosMes).forEach((r) => {
      const subclasse = r.subclasse || r.classe || "Sem subclasse";

      if (!mapa[subclasse]) {
        mapa[subclasse] = [];
      }

      mapa[subclasse].push(r);
    });

    const lista = Object.entries(mapa).map(([subclasse, linhas]) => {
      const agregado = agregarPorChaveEPeriodo({
        resultados: linhas.map((r) => ({ ...r, __tmpSubclasse: subclasse })),
        chave: "__tmpSubclasse",
        campoOrdenacao,
      })[0];

      return {
        subclasse,
        qtd: listaSegura(linhas).length,
        mediaValor: agregado?.mediaValor || 0,
        mediaValor2: agregado?.mediaValor2 || 0,
      };
    });

    const ordenada = aplicarLimiteRanking(
      ordenarListaPorRegra(
        filtrarListaComCampoValido(lista, campoOrdenacao),
        campoOrdenacao
      ),
      limite
    );

    logInfo("Ranking por subclasse agregado", {
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
    const lista = DashboardBI.aggregations.agruparRankingLojasPorPeriodoDashboard(
      resultadosMes,
      {},
      {
        limite: null,
        campo: "mediaValor",
      }
    ).map((item) => ({
      loja: item.loja,
      media: item.mediaValor,
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
  // (mantido para KPI legado)
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

    logInfo("Médias mensais calculadas (KPI legado)", resultado);

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
  DashboardBI.aggregations._private.getInfoSemanasNormalizada =
    getInfoSemanasNormalizada;
  DashboardBI.aggregations._private.extrairPrimeiraEUltimaSemana =
    extrairPrimeiraEUltimaSemana;
  DashboardBI.aggregations._private.montarMediaPrimeiraEUltimaSemana =
    montarMediaPrimeiraEUltimaSemana;
  DashboardBI.aggregations._private.ordenarListaPorRegra =
    ordenarListaPorRegra;
  DashboardBI.aggregations._private.aplicarLimiteRanking =
    aplicarLimiteRanking;
  DashboardBI.aggregations._private.calcularValorAgregadoPorPeriodo =
    calcularValorAgregadoPorPeriodo;
  DashboardBI.aggregations._private.agregarPorChaveEPeriodo =
    agregarPorChaveEPeriodo;

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