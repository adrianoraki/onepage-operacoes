console.log("✅ dashboard-data.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.data = DashboardBI.data || {};

(function inicializarDashboardData() {
  function getState() {
    return DashboardBI.STATE || {};
  }

  // ==========================
  // 🧠 BUSCAR RESULTADOS COM FALLBACK
  // ==========================
  DashboardBI.data.buscarResultadosDashboard = async function (
    queryBaseBuilder,
    lojasBaseSet
  ) {
    let semanasInfo = DashboardBI.helpers.getPrimeiraEUltimaSemanaMesVigente();
    let semanasConsulta = semanasInfo.lista;

    const queryMes = queryBaseBuilder().in("semana", semanasConsulta);
    const { data: resultadosMes, error: erroMes } = await queryMes;
    if (erroMes) throw erroMes;

    let resultadosEscopoBase = (resultadosMes || []).filter((r) =>
      lojasBaseSet.has(r.loja)
    );

    if (resultadosEscopoBase.length) {
      return {
        semanasInfo,
        semanasConsulta,
        resultadosEscopoBase,
        usandoFallback: false,
      };
    }

    semanasConsulta = DashboardBI.helpers.gerarJanelaSemanas(getState().semana);
    semanasInfo = {
      primeira: semanasConsulta[0] || null,
      ultima: semanasConsulta[semanasConsulta.length - 1] || null,
      lista: semanasConsulta,
      descricao: "últimas 4 semanas",
    };

    const queryFallback = queryBaseBuilder().in("semana", semanasConsulta);
    const { data: resultadosFallback, error: erroFallback } =
      await queryFallback;
    if (erroFallback) throw erroFallback;

    resultadosEscopoBase = (resultadosFallback || []).filter((r) =>
      lojasBaseSet.has(r.loja)
    );

    return {
      semanasInfo,
      semanasConsulta,
      resultadosEscopoBase,
      usandoFallback: true,
    };
  };

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
        DashboardBI.filters.aplicarFiltrosVisuaisLojasDashboard(lojasEscopoBase);

      const lojasBaseSet = new Set(
        lojasEscopoBase.map((l) => DashboardBI.helpers.getChaveLoja(l))
      );

      const lojasVisuaisSet = new Set(
        lojasVisuais.map((l) => DashboardBI.helpers.getChaveLoja(l))
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

      const {
        semanasInfo,
        semanasConsulta,
        resultadosEscopoBase,
        usandoFallback,
      } = await DashboardBI.data.buscarResultadosDashboard(
        montarQueryBase,
        lojasBaseSet
      );

      const resultadosVisuais = resultadosEscopoBase.filter((r) =>
        lojasVisuaisSet.has(r.loja)
      );

      console.log("🏬 Lojas escopo base:", lojasEscopoBase.length);
      console.log("🏬 Lojas visuais:", lojasVisuais.length);
      console.log("📊 Resultados escopo base:", resultadosEscopoBase.length);
      console.log("📊 Resultados visuais:", resultadosVisuais.length);
      console.log("📆 Período usado:", semanasInfo);

      if (getState().visao === "gerencial") {
        await DashboardBI.views.renderDashboardGerencial({
          contexto,
          lojas: lojasVisuais,
          lojasEscopoBase,
          resultados: resultadosVisuais,
          resultadosEscopoBase,
          semanasJanela: semanasConsulta,
          semanasMesInfo: semanasInfo,
          usandoFallback,
        });
      } else {
        await DashboardBI.views.renderDashboardRegional({
          contexto,
          lojas: lojasVisuais,
          lojasEscopoBase,
          resultados: resultadosVisuais,
          resultadosEscopoBase,
          semanasJanela: semanasConsulta,
          semanasMesInfo: semanasInfo,
          usandoFallback,
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
    buscarResultadosDashboard:
      typeof DashboardBI.data.buscarResultadosDashboard,
    carregarDadosDashboard: typeof DashboardBI.data.carregarDadosDashboard,
  });
})();
