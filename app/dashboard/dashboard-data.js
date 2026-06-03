console.log("✅ dashboard-data.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.data = DashboardBI.data || {};

(function inicializarDashboardData() {
  function getState() {
    return DashboardBI.STATE || {};
  }

  function normalizarPeriodo(valor, fallback = "MENSAL") {
    if (DashboardBI.stateUtils?.normalizarPeriodo) {
      return DashboardBI.stateUtils.normalizarPeriodo(valor, fallback);
    }

    const texto = (valor || "").toString().trim().toUpperCase();
    if (["SEMANAL", "MENSAL", "ANUAL"].includes(texto)) return texto;
    return fallback;
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

  function obterListaSemanasDosResultados(resultados) {
    return [...new Set((resultados || []).map((r) => String(r.semana).padStart(2, "0")))]
      .filter(Boolean)
      .sort((a, b) => Number(a) - Number(b));
  }

  function filtrarResultadosPorSemanas(resultados, semanas = []) {
    const semanasSet = new Set(
      (semanas || []).map((s) => String(s).padStart(2, "0"))
    );

    return (resultados || []).filter((r) =>
      semanasSet.has(String(r.semana).padStart(2, "0"))
    );
  }

  function filtrarResultadosPorMesEAno(resultados, mes, ano) {
    const mesNorm = String(mes || "").padStart(2, "0");
    const anoNorm = String(ano || "");

    return (resultados || []).filter((r) => {
      const ref = extrairAnoMesLinha(r);
      return ref.mes === mesNorm && ref.ano === anoNorm;
    });
  }

  function filtrarResultadosPorAno(resultados, ano) {
    const anoNorm = String(ano || "");

    return (resultados || []).filter((r) => {
      const ref = extrairAnoMesLinha(r);
      return ref.ano === anoNorm;
    });
  }

  function montarInfoPeriodoPorSemanas(listaSemanas, descricao = "período") {
    const lista = [...(listaSemanas || [])].map((s) =>
      String(s).padStart(2, "0")
    );

    return {
      primeira: lista[0] || null,
      ultima: lista[lista.length - 1] || null,
      lista,
      descricao,
    };
  }

  function montarMapaLojaRegional(lojas = []) {
    const mapa = {};

    (lojas || []).forEach((l) => {
      const chave = DashboardBI.helpers.getChaveLoja(l);
      mapa[chave] = l.regional || "";
    });

    return mapa;
  }

  function agruparEvolucaoRegionalFallback(resultados, semanasJanela, mapaLojaRegional = {}) {
    const lista = (semanasJanela || []).map((semana) => {
      const dadosSemana = (resultados || []).filter(
        (r) => String(r.semana).padStart(2, "0") === String(semana).padStart(2, "0")
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
        semana: String(semana).padStart(2, "0"),
        registros: dadosSemana.length,
        mediaNE1: DashboardBI.helpers.calcularMedia(dadosNE1.map((r) => r.valor)),
        mediaNE2: DashboardBI.helpers.calcularMedia(dadosNE2.map((r) => r.valor)),
      };
    });

    console.log("🌍 Evolução regional NE1 x NE2 (fallback):", lista);
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
        console.warn(
          "⚠️ Sem dados no mês/ano selecionado. Aplicando fallback mensal -> últimas 4 semanas."
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
        console.warn(
          "⚠️ Sem dados no ano selecionado. Aplicando fallback anual -> últimas 4 semanas."
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
      const semanaSelecionada = [String(state.semana).padStart(2, "0")];
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

    const semanaPadrao = [String(state.semana).padStart(2, "0")];
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

  function gerarRankingLojasPorPeriodo(resultados, infoPeriodo) {
    if (
      typeof DashboardBI.aggregations?.agruparRankingLojasPorPeriodoDashboard ===
      "function"
    ) {
      return DashboardBI.aggregations.agruparRankingLojasPorPeriodoDashboard(
        resultados,
        infoPeriodo
      );
    }

    if (
      typeof DashboardBI.aggregations?.agruparLojasRankingDashboard ===
      "function"
    ) {
      return DashboardBI.aggregations.agruparLojasRankingDashboard(
        resultados,
        infoPeriodo
      );
    }

    console.warn(
      "⚠️ Nenhuma função de agregação de ranking de lojas encontrada"
    );
    return [];
  }

  function gerarRankingIndicadoresPorPeriodo(resultados, infoPeriodo) {
    if (
      typeof DashboardBI.aggregations?.agruparRankingIndicadoresPorPeriodoDashboard ===
      "function"
    ) {
      return DashboardBI.aggregations.agruparRankingIndicadoresPorPeriodoDashboard(
        resultados,
        infoPeriodo
      );
    }

    if (
      typeof DashboardBI.aggregations?.agruparIndicadoresPorMediaDashboard ===
      "function"
    ) {
      return DashboardBI.aggregations.agruparIndicadoresPorMediaDashboard(
        resultados
      );
    }

    console.warn(
      "⚠️ Nenhuma função de agregação de ranking de indicadores encontrada"
    );
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
    console.log("🚀 Carregando dados do dashboard...", {
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

      console.log("🧭 Dashboard - filtros aplicados nas lojas:", {
        visao: DashboardBI.STATE?.visao,
        regionalState: DashboardBI.STATE?.regional,
        lojaState: DashboardBI.STATE?.loja,
        escopoContexto: contexto?.escopo || null,
        totalLojasBase: (lojasData || []).length,
        totalLojasEscopoBase: (lojasEscopoBase || []).length,
        totalLojasVisuais: (lojasVisuais || []).length,
      });

      const mapaLojaRegional = montarMapaLojaRegional(lojasEscopoBase);

      const lojasBaseSet = new Set(
        lojasEscopoBase.map((l) => DashboardBI.helpers.getChaveLoja(l))
      );

      const lojasVisuaisSet = new Set(
        lojasVisuais.map((l) => DashboardBI.helpers.getChaveLoja(l))
      );

      const lojasNE1Set = new Set(
        lojasEscopoBase
          .filter(
            (l) =>
              DashboardBI.helpers.normalizarTextoUpper(l.regional) === "NE1"
          )
          .map((l) => DashboardBI.helpers.getChaveLoja(l))
      );

      const lojasNE2Set = new Set(
        lojasEscopoBase
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

      const resultadosEscopoBase = (resultadosBrutos || []).filter((r) =>
        lojasBaseSet.has(r.loja)
      );

      const periodoDashboardInfo = getResultadosDashboardPorPeriodo(
        resultadosEscopoBase
      );

      const periodoRankingInfo = getResultadosRankingPorPeriodo(
        resultadosEscopoBase
      );

      const resultadosDashboardVisuais = (
        periodoDashboardInfo.resultados || []
      ).filter((r) => lojasVisuaisSet.has(r.loja));

      const resultadosRankingVisuais = (
        periodoRankingInfo.resultados || []
      ).filter((r) => lojasVisuaisSet.has(r.loja));

      const resultadosRankingNE1 = (
        periodoRankingInfo.resultados || []
      ).filter((r) => lojasNE1Set.has(r.loja));

      const resultadosRankingNE2 = (
        periodoRankingInfo.resultados || []
      ).filter((r) => lojasNE2Set.has(r.loja));

      const rankingNE1 = gerarRankingLojasPorPeriodo(
        resultadosRankingNE1,
        periodoRankingInfo.info
      );

      const rankingNE2 = gerarRankingLojasPorPeriodo(
        resultadosRankingNE2,
        periodoRankingInfo.info
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

      console.log("🏬 Lojas escopo base:", lojasEscopoBase.length);
      console.log("🏬 Lojas visuais:", lojasVisuais.length);
      console.log("📊 Resultados brutos:", (resultadosBrutos || []).length);
      console.log("📊 Resultados escopo base:", resultadosEscopoBase.length);
      console.log(
        "📊 Resultados dashboard (visuais):",
        resultadosDashboardVisuais.length
      );
      console.log(
        "📊 Resultados ranking (visuais):",
        resultadosRankingVisuais.length
      );
      console.log("📊 Resultados ranking NE1:", resultadosRankingNE1.length);
      console.log("📊 Resultados ranking NE2:", resultadosRankingNE2.length);
      console.log("📆 Período principal:", periodoDashboardInfo.info);
      console.log("🏆 Período ranking:", periodoRankingInfo.info);
      console.log(
        "🌍 Evolução comparativa regional:",
        evolucaoComparativaRegional.length
      );

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
        });
      }
    } catch (erro) {
      console.error("❌ Erro ao carregar dados do dashboard:", erro);

      alvo.innerHTML = `
        <div class="dashboard-card span-12">
          <div class="dashboard-grafico-area">
            Erro ao carregar os dados do dashboard.
          </div>
        </div>
      `;
    }
  };

  console.log("✅ dashboard-data.js pronto", {
    carregarDadosDashboard: typeof DashboardBI.data.carregarDadosDashboard,
  });
})();