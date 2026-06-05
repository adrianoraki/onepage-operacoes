console.log("✅ dashboard-data.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.data = DashboardBI.data || {};

(function inicializarDashboardData() {
  const LOG_PREFIX = "🗂️ DashboardData";

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

  function temMesSelecionado() {
    const state = getState();
    return !!String(state.mes || "").trim();
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

  function obterListaSemanasDosResultados(resultados = []) {
    return [...new Set(listaSegura(resultados).map((r) => normalizarSemana(r.semana)))]
      .filter(Boolean)
      .sort((a, b) => Number(a) - Number(b));
  }

  function filtrarResultadosPorSemanas(resultados = [], semanas = []) {
    const semanasSet = new Set(
      listaSegura(semanas).map((s) => normalizarSemana(s))
    );

    return listaSegura(resultados).filter((r) =>
      semanasSet.has(normalizarSemana(r.semana))
    );
  }

  function filtrarResultadosPorMesEAno(resultados = [], mes, ano) {
    const mesNorm = String(mes || "").padStart(2, "0");
    const anoNorm = String(ano || "");

    return listaSegura(resultados).filter((r) => {
      const ref = extrairAnoMesLinha(r);
      return ref.mes === mesNorm && ref.ano === anoNorm;
    });
  }

  function filtrarResultadosPorAno(resultados = [], ano) {
    const anoNorm = String(ano || "");

    return listaSegura(resultados).filter((r) => {
      const ref = extrairAnoMesLinha(r);
      return ref.ano === anoNorm;
    });
  }

  function montarInfoPeriodoPorSemanas(listaSemanas, descricao = "período") {
    const lista = listaSegura(listaSemanas).map((s) => normalizarSemana(s));

    return {
      primeira: lista[0] || null,
      ultima: lista[lista.length - 1] || null,
      lista,
      descricao,
    };
  }

  function montarMapaLojaRegional(lojas = []) {
    const mapa = {};

    listaSegura(lojas).forEach((l) => {
      const chave = DashboardBI.helpers.getChaveLoja(l);
      mapa[chave] = l.regional || "";
    });

    return mapa;
  }

  function agruparEvolucaoRegionalFallback(
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

    logInfo("Evolução regional NE1 x NE2 (fallback)", {
      total: lista.length,
      lista,
    });

    return lista;
  }

  function getResultadosDashboardPorPeriodo(resultadosBase) {
    const state = getState();
    const periodo = normalizarPeriodo(state.periodoDashboard, "MENSAL");
    const mesSelecionado = temMesSelecionado();

    if (periodo === "SEMANAL") {
      const semanasJanela = DashboardBI.helpers.gerarJanelaSemanas(state.semana);
      const resultados = filtrarResultadosPorSemanas(resultadosBase, semanasJanela);

      return {
        periodo,
        resultados,
        info: montarInfoPeriodoPorSemanas(
          semanasJanela,
          `últimas 4 semanas até a semana ${state.semana}`
        ),
        usandoFallback: false,
      };
    }

    if (periodo === "MENSAL") {
      if (mesSelecionado) {
        const resultadosMes = filtrarResultadosPorMesEAno(
          resultadosBase,
          state.mes,
          state.ano
        );

        const semanasDoPeriodo = obterListaSemanasDosResultados(resultadosMes);

        return {
          periodo,
          resultados: resultadosMes,
          info: montarInfoPeriodoPorSemanas(
            semanasDoPeriodo,
            `mês ${state.mes}/${state.ano}`
          ),
          usandoFallback: false,
        };
      }

      const semanasJanela = DashboardBI.helpers.gerarJanelaSemanas(state.semana);
      const resultadosSemanais = filtrarResultadosPorSemanas(
        resultadosBase,
        semanasJanela
      );

      return {
        periodo,
        resultados: resultadosSemanais,
        info: montarInfoPeriodoPorSemanas(
          semanasJanela,
          `últimas 4 semanas até a semana ${state.semana}`
        ),
        usandoFallback: false,
      };
    }

    if (periodo === "ANUAL") {
      const resultadosAno = filtrarResultadosPorAno(resultadosBase, state.ano);
      const semanasDoPeriodo = obterListaSemanasDosResultados(resultadosAno);

      return {
        periodo,
        resultados: resultadosAno,
        info: montarInfoPeriodoPorSemanas(
          semanasDoPeriodo,
          `ano ${state.ano}`
        ),
        usandoFallback: false,
      };
    }

    const semanasPadrao = DashboardBI.helpers.gerarJanelaSemanas(state.semana);
    const resultadosPadrao = filtrarResultadosPorSemanas(
      resultadosBase,
      semanasPadrao
    );

    return {
      periodo: "SEMANAL",
      resultados: resultadosPadrao,
      info: montarInfoPeriodoPorSemanas(semanasPadrao, "últimas 4 semanas"),
      usandoFallback: false,
    };
  }

  function getResultadosRankingPorPeriodo(resultadosBase) {
    const state = getState();
    const periodo = normalizarPeriodo(state.periodoRanking, "MENSAL");
    const mesSelecionado = temMesSelecionado();

    if (periodo === "SEMANAL") {
      const semanaSelecionada = [normalizarSemana(state.semana)];
      const resultados = filtrarResultadosPorSemanas(
        resultadosBase,
        semanaSelecionada
      );

      return {
        periodo,
        resultados,
        info: montarInfoPeriodoPorSemanas(
          semanaSelecionada,
          `semana ${state.semana}`
        ),
      };
    }

    if (periodo === "MENSAL") {
      if (mesSelecionado) {
        const resultados = filtrarResultadosPorMesEAno(
          resultadosBase,
          state.mes,
          state.ano
        );

        const semanasDoPeriodo = obterListaSemanasDosResultados(resultados);

        return {
          periodo,
          resultados,
          info: montarInfoPeriodoPorSemanas(
            semanasDoPeriodo,
            `mês ${state.mes}/${state.ano}`
          ),
        };
      }

      const semanaSelecionada = [normalizarSemana(state.semana)];
      const resultados = filtrarResultadosPorSemanas(
        resultadosBase,
        semanaSelecionada
      );

      return {
        periodo: "SEMANAL",
        resultados,
        info: montarInfoPeriodoPorSemanas(
          semanaSelecionada,
          `semana ${state.semana}`
        ),
      };
    }

    if (periodo === "ANUAL") {
      const resultados = filtrarResultadosPorAno(resultadosBase, state.ano);
      const semanasDoPeriodo = obterListaSemanasDosResultados(resultados);

      return {
        periodo,
        resultados,
        info: montarInfoPeriodoPorSemanas(
          semanasDoPeriodo,
          `ano ${state.ano}`
        ),
      };
    }

    const semanaPadrao = [normalizarSemana(state.semana)];
    const resultadosPadrao = filtrarResultadosPorSemanas(
      resultadosBase,
      semanaPadrao
    );

    return {
      periodo: "SEMANAL",
      resultados: resultadosPadrao,
      info: montarInfoPeriodoPorSemanas(
        semanaPadrao,
        `semana ${state.semana}`
      ),
    };
  }

  function getConfigRankingRegionalAtual() {
    const state = getState();

    const indicador = state.indicador || "";
    const classeSelecionada = state.classe === "TODAS" ? null : state.classe;

    const campoSelecionado = stringSegura(
      state.campoRankingRegional ||
        state.campoRanking ||
        state.campoResultadoRanking ||
        ""
    ).toLowerCase();

    const usarValor2 =
      campoSelecionado === "valor2" ||
      campoSelecionado === "mediavalor2" ||
      campoSelecionado === "resultado2";

    const campoResultado = usarValor2 ? "mediaValor2" : "mediaValor";
    const campoKey = usarValor2 ? "valor2" : "valor";

    const tipoValor = DashboardBI.helpers.getTipoCampo(
      indicador,
      campoKey,
      classeSelecionada
    );

    const config = {
      campoResultado,
      campoKey,
      tipoValor,
      limite: null,
    };

    logInfo("Configuração do ranking regional resolvida", {
      indicador,
      classeSelecionada,
      config,
    });

    return config;
  }

  function gerarRankingLojasPorPeriodo(resultados, infoPeriodo, options = {}) {
    if (
      typeof DashboardBI.aggregations?.agruparRankingLojasPorPeriodoDashboard ===
      "function"
    ) {
      return DashboardBI.aggregations.agruparRankingLojasPorPeriodoDashboard(
        resultados,
        infoPeriodo,
        options
      );
    }

    if (
      typeof DashboardBI.aggregations?.agruparLojasRankingDashboard ===
      "function"
    ) {
      return DashboardBI.aggregations.agruparLojasRankingDashboard(
        resultados,
        infoPeriodo,
        options
      );
    }

    logWarn("Nenhuma função de agregação de ranking de lojas encontrada");
    return [];
  }

  function gerarRankingIndicadoresPorPeriodo(
    resultados,
    infoPeriodo,
    options = {}
  ) {
    if (
      typeof DashboardBI.aggregations?.agruparRankingIndicadoresPorPeriodoDashboard ===
      "function"
    ) {
      return DashboardBI.aggregations.agruparRankingIndicadoresPorPeriodoDashboard(
        resultados,
        infoPeriodo,
        options
      );
    }

    if (
      typeof DashboardBI.aggregations?.agruparIndicadoresPorMediaDashboard ===
      "function"
    ) {
      return DashboardBI.aggregations.agruparIndicadoresPorMediaDashboard(
        resultados,
        options
      );
    }

    logWarn("Nenhuma função de agregação de ranking de indicadores encontrada");
    return [];
  }

  function gerarEvolucaoComparativaRegional(
    resultadosPeriodo,
    semanasJanela,
    mapaLojaRegional
  ) {
    if (
      typeof DashboardBI.aggregations?.agruparEvolucaoRegionalDashboard ===
      "function"
    ) {
      return DashboardBI.aggregations.agruparEvolucaoRegionalDashboard(
        resultadosPeriodo,
        semanasJanela,
        mapaLojaRegional
      );
    }

    return agruparEvolucaoRegionalFallback(
      resultadosPeriodo,
      semanasJanela,
      mapaLojaRegional
    );
  }

  // ==========================
  // 📝 JUSTIFICATIVAS
  // ==========================
  function montarResumoLojasComJustificativa(resultados = [], mapaLojaRegional = {}) {
    const mapa = {};

    listaSegura(resultados).forEach((r) => {
      const justificativas = DashboardBI.helpers.extrairJustificativasLinha
        ? DashboardBI.helpers.extrairJustificativasLinha(r)
        : [];

      if (!justificativas.length) return;

      const loja = r.loja || "";
      if (!loja) return;

      if (!mapa[loja]) {
        mapa[loja] = {
          loja,
          regional: mapaLojaRegional[loja] || "",
          qtdJustificativas: 0,
          semanas: new Set(),
          indicadores: new Set(),
          motivos: new Set(),
        };
      }

      mapa[loja].qtdJustificativas += justificativas.length;
      mapa[loja].semanas.add(normalizarSemana(r.semana));
      mapa[loja].indicadores.add(r.indicador || "");

      justificativas.forEach((j) => {
        if (j?.motivo) {
          mapa[loja].motivos.add(j.motivo);
        }
      });
    });

    const lista = Object.values(mapa).map((item) => ({
      loja: item.loja,
      regional: item.regional || "-",
      qtdJustificativas: item.qtdJustificativas,
      semanas: [...item.semanas].filter(Boolean).sort((a, b) => Number(a) - Number(b)),
      indicadores: [...item.indicadores].filter(Boolean).sort(),
      motivos: [...item.motivos].filter(Boolean).sort(),
    }));

    lista.sort((a, b) => {
      const regA = String(a.regional || "");
      const regB = String(b.regional || "");

      if (regA < regB) return -1;
      if (regA > regB) return 1;

      return String(a.loja || "").localeCompare(String(b.loja || ""), "pt-BR");
    });

    logInfo("Resumo de lojas com justificativa montado", {
      total: lista.length,
      lista,
    });

    return lista;
  }

  function indexarLojasComJustificativa(lojasComJustificativa = []) {
    const mapa = {};

    listaSegura(lojasComJustificativa).forEach((item) => {
      if (item?.loja) {
        mapa[item.loja] = item;
      }
    });

    return mapa;
  }

  function moverLojasComJustificativaParaFinal(
    listaRanking = [],
    lojasComJustificativa = []
  ) {
    const mapaJust = indexarLojasComJustificativa(lojasComJustificativa);

    const semJust = [];
    const comJust = [];

    listaSegura(listaRanking).forEach((item) => {
      const resumo = mapaJust[item?.loja];

      const itemAjustado = {
        ...item,
        temJustificativa: !!resumo,
        observacao: resumo ? "OBS: Teve justificativas" : "",
        qtdJustificativas: resumo?.qtdJustificativas || 0,
        semanasJustificadas: resumo?.semanas || [],
        indicadoresJustificativa: resumo?.indicadores || [],
        motivosJustificativa: resumo?.motivos || [],
      };

      if (resumo) {
        comJust.push(itemAjustado);
      } else {
        semJust.push(itemAjustado);
      }
    });

    const final = [...semJust, ...comJust];

    logInfo("Ranking com justificativas movidas para o final", {
      totalOriginal: listaSegura(listaRanking).length,
      totalSemJust: semJust.length,
      totalComJust: comJust.length,
      totalFinal: final.length,
    });

    return final;
  }

  // ==========================
  // 🧠 CARREGAR DADOS DO DASHBOARD
  // ==========================
  DashboardBI.data.carregarDadosDashboard = async function (contexto) {
    logInfo("Carregando dados do dashboard...", {
      estado: DashboardBI.STATE,
      contexto,
    });

    const alvo = document.getElementById("dashboardConteudo");
    if (!alvo) return;

    alvo.innerHTML = `
      <div class="dashboard-card span-12">
        <div class="dashboard-grafico-area">Processando dados do dashboard...</div>
      </div>
    `;

    try {
      const { data: lojasData, error: lojasError } = await window.db
        .from("lojas")
        .select("*")
        .order("codigo");

      if (lojasError) throw lojasError;

      const lojasEscopoBase =
        DashboardBI.filters.aplicarEscopoBaseLojasDashboard(
          lojasData || [],
          contexto
        );

      const lojasVisuais =
        DashboardBI.filters.aplicarFiltrosVisuaisLojasDashboard(
          lojasEscopoBase
        );

      logInfo("Filtros aplicados nas lojas", {
        visao: DashboardBI.STATE?.visao,
        regionalState: DashboardBI.STATE?.regional,
        lojaState: DashboardBI.STATE?.loja,
        escopoContexto: contexto?.escopo || null,
        totalLojasBase: listaSegura(lojasData).length,
        totalLojasEscopoBase: listaSegura(lojasEscopoBase).length,
        totalLojasVisuais: listaSegura(lojasVisuais).length,
      });

      const mapaLojaRegional = montarMapaLojaRegional(lojasEscopoBase);

      const lojasBaseSet = new Set(
        listaSegura(lojasEscopoBase).map((l) =>
          DashboardBI.helpers.getChaveLoja(l)
        )
      );

      const lojasVisuaisSet = new Set(
        listaSegura(lojasVisuais).map((l) =>
          DashboardBI.helpers.getChaveLoja(l)
        )
      );

      const lojasNE1Set = new Set(
        listaSegura(lojasEscopoBase)
          .filter(
            (l) =>
              DashboardBI.helpers.normalizarTextoUpper(l.regional) === "NE1"
          )
          .map((l) => DashboardBI.helpers.getChaveLoja(l))
      );

      const lojasNE2Set = new Set(
        listaSegura(lojasEscopoBase)
          .filter(
            (l) =>
              DashboardBI.helpers.normalizarTextoUpper(l.regional) === "NE2"
          )
          .map((l) => DashboardBI.helpers.getChaveLoja(l))
      );

      const montarQueryBase = () => {
        let query = window.db.from("resultados").select("*");
        const state = getState();

        if (state.classe !== "TODAS") {
          query = query.eq("classe", state.classe);
        }

        if (state.indicador !== "TODOS") {
          const indicadorBanco = DashboardBI.helpers.getIndicadorBanco(
            state.indicador,
            state.classe === "TODAS" ? null : state.classe
          );

          query = query.eq("indicador", indicadorBanco);
        }

        return query;
      };

      const { data: resultadosBrutos, error: resultadosError } =
        await montarQueryBase();

      if (resultadosError) throw resultadosError;

      const resultadosEscopoBase = listaSegura(resultadosBrutos).filter((r) =>
        lojasBaseSet.has(r.loja)
      );

      const periodoDashboardInfo = getResultadosDashboardPorPeriodo(
        resultadosEscopoBase
      );

      const periodoRankingInfo = getResultadosRankingPorPeriodo(
        resultadosEscopoBase
      );

      const resultadosDashboardVisuais = listaSegura(
        periodoDashboardInfo.resultados
      ).filter((r) => lojasVisuaisSet.has(r.loja));

      const resultadosRankingVisuais = listaSegura(
        periodoRankingInfo.resultados
      ).filter((r) => lojasVisuaisSet.has(r.loja));

      const resultadosRankingPeriodo = listaSegura(periodoRankingInfo.resultados);

      const lojasComJustificativa = montarResumoLojasComJustificativa(
        resultadosRankingPeriodo,
        mapaLojaRegional
      );

      const resultadosRankingVisuaisOrdenacao = resultadosRankingVisuais;

      const resultadosRankingNE1 = resultadosRankingPeriodo.filter((r) =>
        lojasNE1Set.has(r.loja)
      );

      const resultadosRankingNE2 = resultadosRankingPeriodo.filter((r) =>
        lojasNE2Set.has(r.loja)
      );

      const configRankingRegional = getConfigRankingRegionalAtual();

      const rankingNE1Base = gerarRankingLojasPorPeriodo(
        resultadosRankingNE1,
        periodoRankingInfo.info,
        {
          limite: configRankingRegional.limite,
          campo: configRankingRegional.campoResultado,
        }
      );

      const rankingNE2Base = gerarRankingLojasPorPeriodo(
        resultadosRankingNE2,
        periodoRankingInfo.info,
        {
          limite: configRankingRegional.limite,
          campo: configRankingRegional.campoResultado,
        }
      );

      const rankingNE1 = moverLojasComJustificativaParaFinal(
        rankingNE1Base,
        lojasComJustificativa
      );

      const rankingNE2 = moverLojasComJustificativaParaFinal(
        rankingNE2Base,
        lojasComJustificativa
      );

      const rankingIndicadores = gerarRankingIndicadoresPorPeriodo(
        resultadosRankingVisuaisOrdenacao,
        periodoRankingInfo.info
      );

      const evolucaoComparativaRegional = gerarEvolucaoComparativaRegional(
        periodoDashboardInfo.resultados || [],
        periodoDashboardInfo.info.lista,
        mapaLojaRegional
      );

      logInfo("Dados do dashboard preparados", {
        lojasEscopoBase: listaSegura(lojasEscopoBase).length,
        lojasVisuais: listaSegura(lojasVisuais).length,
        resultadosBrutos: listaSegura(resultadosBrutos).length,
        resultadosEscopoBase: resultadosEscopoBase.length,
        resultadosDashboardVisuais: resultadosDashboardVisuais.length,
        resultadosRankingVisuais: resultadosRankingVisuais.length,
        resultadosRankingPeriodo: resultadosRankingPeriodo.length,
        resultadosRankingNE1: resultadosRankingNE1.length,
        resultadosRankingNE2: resultadosRankingNE2.length,
        rankingNE1Base: rankingNE1Base.length,
        rankingNE2Base: rankingNE2Base.length,
        rankingNE1Final: rankingNE1.length,
        rankingNE2Final: rankingNE2.length,
        rankingIndicadores: rankingIndicadores.length,
        lojasComJustificativa: lojasComJustificativa.length,
        periodoDashboard: periodoDashboardInfo.info,
        periodoRanking: periodoRankingInfo.info,
        configRankingRegional,
        evolucaoComparativaRegional: evolucaoComparativaRegional.length,
      });

      if (getState().visao === "gerencial") {
        await DashboardBI.views.renderDashboardGerencial({
          contexto,
          lojas: lojasVisuais,
          lojasEscopoBase,
          resultados: resultadosDashboardVisuais,
          resultadosEscopoBase,
          resultadosRanking: resultadosRankingVisuaisOrdenacao,
          rankingIndicadores,
          periodoDashboardInfo: periodoDashboardInfo.info,
          periodoRankingInfo: periodoRankingInfo.info,
          semanasJanela: periodoDashboardInfo.info.lista,
          semanasMesInfo: periodoDashboardInfo.info,
          usandoFallback: periodoDashboardInfo.usandoFallback,
          lojasComJustificativa,
        });
      } else {
        await DashboardBI.views.renderDashboardRegional({
          contexto,
          lojas: lojasVisuais,
          lojasEscopoBase,
          resultados: resultadosDashboardVisuais,
          resultadosEscopoBase,
          resultadosRanking: resultadosRankingPeriodo,
          periodoDashboardInfo: periodoDashboardInfo.info,
          periodoRankingInfo: periodoRankingInfo.info,
          semanasJanela: periodoDashboardInfo.info.lista,
          semanasMesInfo: periodoDashboardInfo.info,
          usandoFallback: periodoDashboardInfo.usandoFallback,
          rankingNE1,
          rankingNE2,
          evolucaoComparativaRegional,
          campoResultadoRankingRegional: configRankingRegional.campoResultado,
          tipoValorRankingRegional: configRankingRegional.tipoValor,
          lojasComJustificativa,
        });
      }
    } catch (erro) {
      logError("Erro ao carregar dados do dashboard", erro);

      const alvoErro = document.getElementById("dashboardConteudo");
      if (alvoErro) {
        alvoErro.innerHTML = `
          <div class="dashboard-card span-12">
            <div class="dashboard-grafico-area">
              Erro ao carregar os dados do dashboard.
            </div>
          </div>
        `;
      }
    }
  };

  logInfo("dashboard-data.js pronto", {
    carregarDadosDashboard: typeof DashboardBI.data.carregarDadosDashboard,
  });
})();