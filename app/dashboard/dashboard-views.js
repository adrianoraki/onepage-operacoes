console.log("✅ dashboard-views.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.views = DashboardBI.views || {};

(function inicializarDashboardViews() {
  function getState() {
    return DashboardBI.STATE || {};
  }

  function getAlvoDashboard() {
    return document.getElementById("dashboardConteudo");
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

  function getTipoValorSecundarioAtual() {
    const state = getState();

    if (state.indicador && state.indicador !== "TODOS") {
      return DashboardBI.helpers.getTipoCampo(
        state.indicador,
        "valor2",
        state.classe === "TODAS" ? null : state.classe
      );
    }

    return "numero";
  }

  // ==========================
  // 🧱 TELA BASE DO DASHBOARD
  // ==========================
  DashboardBI.views.telaDashboard = async function () {
    console.log("📊 Iniciando DashboardBI.views.telaDashboard...");

    const container = document.getElementById("conteudo");
    if (!container) {
      console.error("❌ #conteudo não encontrado para dashboard");
      return;
    }

    if (!window.db) {
      console.error("❌ window.db não disponível no dashboard");
      if (typeof window.mostrarErro === "function") {
        window.mostrarErro("Conexão com banco não iniciada");
      }
      return;
    }

    const contexto =
      typeof window.getContextoDashboardUsuario === "function"
        ? window.getContextoDashboardUsuario()
        : null;

    if (!contexto) {
      console.error("❌ Contexto do dashboard não encontrado");
      if (typeof window.mostrarErro === "function") {
        window.mostrarErro("Usuário sem contexto de dashboard");
      }
      return;
    }

    console.log("🧠 Contexto recebido no dashboard:", contexto);

    DashboardBI.setState({
      visao: contexto.visao || "regional",
      regional: contexto.escopo?.regional || getState().regional || "TODAS",
      loja: contexto.escopo?.loja || getState().loja || "TODAS",
    });

    const state = getState();

    container.innerHTML = `
      <div class="pagina-container">
        <div class="card-conteudo dashboard-container" id="dashboardContainer">

          <div class="dashboard-topo">
            <div class="dashboard-titulos">
              <h2 class="dashboard-titulo">Dashboard Executivo</h2>
              <p class="dashboard-subtitulo">
                Visão consolidada com base no preenchimento das tabelas do sistema
              </p>
            </div>

            <div class="acoes-dashboard">
              <button class="btn-dashboard" onclick="abrirDashboardTelaCheia()">
                🖥️ Tela cheia
              </button>

              <button class="btn-dashboard-secundario" onclick="sairDashboardTelaCheia()">
                ↩ Sair da apresentação
              </button>
            </div>
          </div>

          <div class="dashboard-filtros">
            <select id="dashSemana" onchange="dashboardAlterarSemana(this.value)">
              ${typeof window.gerarOptionsSemanas === "function" ? window.gerarOptionsSemanas() : ""}
            </select>

            <select id="dashClasse" onchange="dashboardAlterarClasse(this.value)">
              ${DashboardBI.filters.gerarOptionsClassesDashboard()}
            </select>

            <select id="dashIndicador" onchange="dashboardAlterarIndicador(this.value)">
              ${DashboardBI.filters.gerarOptionsIndicadoresDashboard()}
            </select>

            ${
              state.visao === "regional"
                ? `
                  <select id="dashRegional" onchange="dashboardAlterarRegional(this.value)">
                    <option value="TODAS">Todas regionais</option>
                    <option value="NE1" ${
                      state.regional === "NE1" ? "selected" : ""
                    }>NE1</option>
                    <option value="NE2" ${
                      state.regional === "NE2" ? "selected" : ""
                    }>NE2</option>
                  </select>
                `
                : ""
            }

            ${
              state.visao === "gerencial"
                ? `
                  <select id="dashLoja" onchange="dashboardAlterarLoja(this.value)">
                    <option value="TODAS">Todas as lojas</option>
                  </select>
                `
                : ""
            }
          </div>

          <div id="dashboardConteudo" class="dashboard-grid">
            <div class="dashboard-card span-12">
              <div class="dashboard-grafico-area">Carregando dados do dashboard...</div>
            </div>
          </div>

        </div>
      </div>
    `;

    const selSemana = document.getElementById("dashSemana");
    if (selSemana) selSemana.value = state.semana;

    const selClasse = document.getElementById("dashClasse");
    if (selClasse) selClasse.value = state.classe;

    const selIndicador = document.getElementById("dashIndicador");
    if (selIndicador) selIndicador.value = state.indicador;

    const selRegional = document.getElementById("dashRegional");
    if (selRegional) selRegional.value = state.regional;

    DashboardBI.helpers.destruirGraficos();

    await DashboardBI.data.carregarDadosDashboard(contexto);
  };

  // ==========================
  // 📋 TABELA RANKING LOJAS
  // ==========================
  DashboardBI.views.renderTabelaRankingLojas = function (
    lista,
    tipoValorPrincipal
  ) {
    const isPercentual = DashboardBI.helpers.tipoPercentual(tipoValorPrincipal);

    return `
      <div class="dashboard-card span-6">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Ranking por loja</span>
          <span class="dashboard-card-subtitulo">Posição e média consolidada</span>
        </div>

        <div class="tabela-container">
          <table class="tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>Loja</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              ${(lista || [])
                .map(
                  (item, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${item.loja}</td>
                      <td>${DashboardBI.helpers.formatarKpi(item.mediaValor, {
                        percentual: isPercentual,
                        casas: 2,
                      })}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  // ==========================
  // 📋 TABELA RANKING INDICADORES
  // ==========================
  DashboardBI.views.renderTabelaRankingIndicadores = function (
    lista,
    tipoValorPrincipal
  ) {
    const isPercentual = DashboardBI.helpers.tipoPercentual(tipoValorPrincipal);

    return `
      <div class="dashboard-card span-6">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Ranking por indicador</span>
          <span class="dashboard-card-subtitulo">Posição e média consolidada</span>
        </div>

        <div class="tabela-container">
          <table class="tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>Indicador</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              ${(lista || [])
                .map(
                  (item, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${item.indicador}</td>
                      <td>${DashboardBI.helpers.formatarKpi(item.mediaValor, {
                        percentual: isPercentual,
                        casas: 2,
                      })}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  // ==========================
  // 📋 TABELA RANKING SUBCLASSES
  // mostrando resultado ao lado
  // ==========================
  DashboardBI.views.renderTabelaRankingSubclasses = function (
    lista,
    tipoValorPrincipal
  ) {
    const isPercentual = DashboardBI.helpers.tipoPercentual(tipoValorPrincipal);

    return `
      <div class="dashboard-card span-6">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Ranking por subclasse</span>
          <span class="dashboard-card-subtitulo">Subclasse e resultado lado a lado</span>
        </div>

        <div class="tabela-container">
          <table class="tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>Subclasse</th>
                <th>Resultado</th>
                <th>Qtd</th>
              </tr>
            </thead>
            <tbody>
              ${(lista || [])
                .map(
                  (item, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${item.subclasse}</td>
                      <td>${DashboardBI.helpers.formatarKpi(item.mediaValor, {
                        percentual: isPercentual,
                        casas: 2,
                      })}</td>
                      <td>${item.qtd || 0}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  // ==========================
  // 🏪 VISÃO GERENCIAL
  // ==========================
  DashboardBI.views.renderDashboardGerencial = async function ({
    contexto,
    lojas,
    lojasEscopoBase,
    resultados,
    semanasJanela,
    semanasMesInfo,
    usandoFallback,
  }) {
    console.log("🏪 Renderizando visão gerencial...");

    const alvo = getAlvoDashboard();
    if (!alvo) return;

    DashboardBI.filters.popularSelectLojasDashboard(lojasEscopoBase);

    const resultadosMes = resultados || [];

    const evolucao = DashboardBI.aggregations.agruparEvolucaoDashboard(
      resultadosMes,
      semanasJanela
    );

    const rankingIndicadores =
      DashboardBI.aggregations.agruparIndicadoresPorMediaDashboard(resultadosMes);

    const rankingSubclasses =
      DashboardBI.aggregations.agruparRankingSubclassesDashboard(resultadosMes);

    const mediasMensais =
      DashboardBI.aggregations.calcularMediasMensaisDashboard(
        resultadosMes,
        semanasMesInfo
      );

    const tituloLoja =
      lojas.length === 1
        ? DashboardBI.helpers.getChaveLoja(lojas[0])
        : contexto?.escopo?.loja || "Visão Gerencial";

    const tipoValorPrincipal = getTipoValorPrincipalAtual();
    const tipoValorSecundario = getTipoValorSecundarioAtual();

    alvo.innerHTML = `
      ${DashboardBI.kpis.renderKPIsGerenciais({
        tituloLoja,
        totalLojas: lojas.length,
        mediaPrimeira: mediasMensais.mediaPrimeira,
        mediaUltima: mediasMensais.mediaUltima,
        mediaMensal: mediasMensais.mediaMensal,
        tipoValorPrincipal,
        descricaoPeriodo: semanasMesInfo.descricao,
      })}

      <div class="dashboard-card dashboard-grafico span-8">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Evolução semanal</span>
          <span class="dashboard-card-subtitulo">${
            usandoFallback
              ? "Últimas 4 semanas com dados"
              : "Evolução do período selecionado"
          }</span>
        </div>
        <div class="dashboard-chart-box">
          <canvas id="graficoEvolucao"></canvas>
        </div>
      </div>

      <div class="dashboard-card dashboard-grafico span-4">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Ranking por indicador</span>
          <span class="dashboard-card-subtitulo">Top indicadores pela média</span>
        </div>
        <div class="dashboard-chart-box">
          <canvas id="graficoRanking"></canvas>
        </div>
      </div>

      ${DashboardBI.views.renderTabelaRankingIndicadores(
        rankingIndicadores,
        tipoValorPrincipal
      )}

      ${DashboardBI.views.renderTabelaRankingSubclasses(
        rankingSubclasses,
        tipoValorPrincipal
      )}
    `;

    DashboardBI.charts.renderGraficosDashboard({
      evolucao,
      ranking: rankingIndicadores,
      tipoRanking: "indicadores",
      tipoValorPrincipal,
      tipoValorSecundario,
    });
  };

  // ==========================
  // 🌍 VISÃO REGIONAL
  // ==========================
  DashboardBI.views.renderDashboardRegional = async function ({
    lojasEscopoBase,
    resultados,
    resultadosEscopoBase,
    semanasJanela,
    semanasMesInfo,
    usandoFallback,
  }) {
    console.log("🌍 Renderizando visão regional...");

    const alvo = getAlvoDashboard();
    if (!alvo) return;

    const resultadosMes = resultados || [];
    const resultadosEscopoCompleto = resultadosEscopoBase || [];

    const evolucao = DashboardBI.aggregations.agruparEvolucaoDashboard(
      resultadosMes,
      semanasJanela
    );

    const rankingLojas =
      DashboardBI.aggregations.agruparLojasRankingDashboard(
        resultadosMes,
        semanasMesInfo
      );

    const rankingSubclasses =
      DashboardBI.aggregations.agruparRankingSubclassesDashboard(
        resultadosMes
      );

    const tipoValorPrincipal = getTipoValorPrincipalAtual();
    const tipoValorSecundario = getTipoValorSecundarioAtual();

    console.log("📊 Dados regionais preparados:", {
      resultadosMes: resultadosMes.length,
      resultadosEscopoCompleto: resultadosEscopoCompleto.length,
      rankingLojas: rankingLojas.length,
      rankingSubclasses: rankingSubclasses.length,
      semanasJanela,
      semanasMesInfo,
    });

    // ✅ conforme solicitado:
    // - remove KPIs regionais
    // - mantém evolução semanal
    // - mantém ranking por loja
    // - remove gráfico de resumo por subclasse
    // - mostra ranking por subclasse com resultado ao lado
    alvo.innerHTML = `
      ${DashboardBI.kpis.renderKPIsRegionais()}

      <div class="dashboard-card dashboard-grafico span-8">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Evolução semanal</span>
          <span class="dashboard-card-subtitulo">${
            usandoFallback
              ? "Últimas 4 semanas com dados"
              : "Evolução do período selecionado"
          }</span>
        </div>
        <div class="dashboard-chart-box">
          <canvas id="graficoEvolucao"></canvas>
        </div>
      </div>

      <div class="dashboard-card dashboard-grafico span-4">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Ranking por loja</span>
          <span class="dashboard-card-subtitulo">Média consolidada do período</span>
        </div>
        <div class="dashboard-chart-box">
          <canvas id="graficoRanking"></canvas>
        </div>
      </div>

      ${DashboardBI.views.renderTabelaRankingLojas(
        rankingLojas,
        tipoValorPrincipal
      )}

      ${DashboardBI.views.renderTabelaRankingSubclasses(
        rankingSubclasses,
        tipoValorPrincipal
      )}
    `;

    DashboardBI.charts.renderGraficosDashboard({
      evolucao,
      ranking: rankingLojas,
      tipoRanking: "lojas",
      tipoValorPrincipal,
      tipoValorSecundario,
    });
  };

  console.log("✅ dashboard-views.js pronto", {
    telaDashboard: typeof DashboardBI.views.telaDashboard,
    renderDashboardGerencial: typeof DashboardBI.views.renderDashboardGerencial,
    renderDashboardRegional: typeof DashboardBI.views.renderDashboardRegional,
    renderTabelaRankingLojas:
      typeof DashboardBI.views.renderTabelaRankingLojas,
    renderTabelaRankingIndicadores:
      typeof DashboardBI.views.renderTabelaRankingIndicadores,
    renderTabelaRankingSubclasses:
      typeof DashboardBI.views.renderTabelaRankingSubclasses,
  });
})();
