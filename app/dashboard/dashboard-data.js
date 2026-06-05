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

  function numeroSeguro(valor, fallback = 0) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : fallback;
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

  function extrairAnoMesLinha(resultado) {
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
    const semanasSet = new Set(listaSegura(semanas).map((s) => normalizarSemana(s)));

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
      let resultadosMes = filtrarResultadosPorMesEAno(
        resultadosBase,
        state.mes,
        state.ano
      );

      if (!resultadosMes.length) {
        logWarn(
          "Sem dados no mês/ano selecionado. Aplicando fallback mensal -> últimas 4 semanas."
        );

        const semanasJanela = DashboardBI.helpers.gerarJanelaSemanas(state.semana);
        resultadosMes = filtrarResultadosPorSemanas(resultadosBase, semanasJanela);

        return {
          periodo,
          resultados: resultadosMes,
          info: montarInfoPeriodoPorSemanas(
            semanasJanela,
            "últimas 4 semanas (fallback do mensal)"
          ),
          usandoFallback: true,
        };
      }

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

    if (periodo === "ANUAL") {
      let resultadosAno = filtrarResultadosPorAno(resultadosBase, state.ano);

      if (!resultadosAno.length) {
        logWarn(
          "Sem dados no ano selecionado. Aplicando fallback anual -> últimas 4 semanas."
        );

        const semanasJanela = DashboardBI.helpers.gerarJanelaSemanas(state.semana);
        resultadosAno = filtrarResultadosPorSemanas(resultadosBase, semanasJanela);

        return {
          periodo,
          resultados: resultadosAno,
          info: montarInfoPeriodoPorSemanas(
            semanasJanela,
            "últimas 4 semanas (fallback do anual)"
          ),
          usandoFallback: true,
        };
      }

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

    // ✅ preparado para futura seleção do campo do ranking
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
      limite: null, // ✅ ranking regional deve mostrar todas as lojas
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

  function gerarRankingIndicadoresPorPeriodo(resultados, infoPeriodo, options = {}) {
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
        listaSegura(lojasEscopoBase).map((l) => DashboardBI.helpers.getChaveLoja(l))
      );

      const lojasVisuaisSet = new Set(
        listaSegura(lojasVisuais).map((l) => DashboardBI.helpers.getChaveLoja(l))
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

      // ✅ Rankings regionais usam o escopo base da regional, não o filtro visual da regional
      // porque a própria tela já mostra NE1 x NE2 lado a lado
      const resultadosRankingNE1 = listaSegura(periodoRankingInfo.resultados).filter(
        (r) => lojasNE1Set.has(r.loja)
      );

      const resultadosRankingNE2 = listaSegura(periodoRankingInfo.resultados).filter(
        (r) => lojasNE2Set.has(r.loja)
      );

      const configRankingRegional = getConfigRankingRegionalAtual();

      const rankingNE1 = gerarRankingLojasPorPeriodo(
        resultadosRankingNE1,
        periodoRankingInfo.info,
        {
          limite: configRankingRegional.limite,
          campo: configRankingRegional.campoResultado,
        }
      );

      const rankingNE2 = gerarRankingLojasPorPeriodo(
        resultadosRankingNE2,
        periodoRankingInfo.info,
        {
          limite: configRankingRegional.limite,
          campo: configRankingRegional.campoResultado,
        }
      );

      const rankingIndicadores = gerarRankingIndicadoresPorPeriodo(
        resultadosRankingVisuais,
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
        resultadosRankingNE1: resultadosRankingNE1.length,
        resultadosRankingNE2: resultadosRankingNE2.length,
        rankingNE1: rankingNE1.length,
        rankingNE2: rankingNE2.length,
        rankingIndicadores: rankingIndicadores.length,
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
          resultadosRanking: resultadosRankingVisuais,
          rankingIndicadores,
          periodoDashboardInfo: periodoDashboardInfo.info,
          periodoRankingInfo: periodoRankingInfo.info,
          semanasJanela: periodoDashboardInfo.info.lista,
          semanasMesInfo: periodoDashboardInfo.info,
          usandoFallback: periodoDashboardInfo.usandoFallback,
        });
      } else {
        await DashboardBI.views.renderDashboardRegional({
          contexto,
          lojas: lojasVisuais,
          lojasEscopoBase,
          resultados: resultadosDashboardVisuais,
          resultadosEscopoBase,
          resultadosRanking: resultadosRankingVisuais,
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
        });
      }
    } catch (erro) {
      logError("Erro ao carregar dados do dashboard", erro);

      alvo.innerHTML = `
        <div class="dashboard-card span-12">
          <div class="dashboard-grafico-area">
            Erro ao carregar os dados do dashboard.
          </div>
        </div>
      `;
    }
  };

  logInfo("dashboard-data.js pronto", {
    carregarDadosDashboard: typeof DashboardBI.data.carregarDadosDashboard,
  });
})();