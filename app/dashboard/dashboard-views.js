console.log("✅ dashboard-views.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.views = DashboardBI.views || {};

(function inicializarDashboardViews() {
  const LOG_PREFIX = "🖼️ DashboardViews";

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

  function getAlvoDashboard() {
    return document.getElementById("dashboardConteudo");
  }

  function listaSegura(lista) {
    return Array.isArray(lista) ? lista : [];
  }

  function textoSeguro(valor, fallback = "") {
    const texto = (valor || "").toString().trim();
    return texto || fallback;
  }

  function numeroSeguro(valor, fallback = 0) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : fallback;
  }

  function escapeHtml(valor) {
    return (valor || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

  function getCampoResultadoRegionalAtual() {
    const state = getState();
    const indicadorNorm = DashboardBI.helpers.normalizarTextoUpper(
      state.indicador || ""
    );

    // ✅ Mantém o principal como padrão.
    // Se futuramente houver seletor explícito para Horas -, o data.js pode passar mediaValor2.
    if (
      indicadorNorm === "BANCOS DE HORAS" ||
      indicadorNorm === "BANCO DE HORAS" ||
      indicadorNorm === "RH / OPERACIONAL"
    ) {
      return "mediaValor";
    }

    return "mediaValor";
  }

  function getDescricaoPeriodoCurta(
    info = null,
    fallback = "período selecionado"
  ) {
    const descricao = (info?.descricao || "").toString().trim();
    return descricao || fallback;
  }

  function usuarioEhGlobal(contexto) {
    const escopo = contexto?.escopo || {};
    const perfil = (contexto?.usuario?.perfil || "").toString().toLowerCase();

    return escopo.tipo === "global" || perfil === "master";
  }

  function normalizarEstadoInicialDashboard(contexto) {
    const stateAtual = getState();
    const contextoEscopo = contexto?.escopo || {};
    const visaoContexto = contexto?.visao || stateAtual.visao || "regional";

    const escopoTemRegional = !!contextoEscopo.regional;
    const escopoTemLoja = !!contextoEscopo.loja;
    const escopoTipo = contextoEscopo.tipo || "";
    const ehGlobal = usuarioEhGlobal(contexto);

    const regionalFinal = ehGlobal
      ? "TODAS"
      : escopoTemRegional
      ? contextoEscopo.regional
      : stateAtual.regional || "TODAS";

    const lojaFinal = ehGlobal
      ? "TODAS"
      : escopoTemLoja
      ? contextoEscopo.loja
      : stateAtual.loja || "TODAS";

    const visaoFinal =
      visaoContexto === "gerencial" || visaoContexto === "regional"
        ? visaoContexto
        : "regional";

    DashboardBI.setState({
      visao: visaoFinal,
      regional: regionalFinal,
      loja: lojaFinal,
    });

    logInfo("Estado inicial do dashboard normalizado pelo contexto", {
      visaoFinal,
      escopoTipo,
      ehGlobal,
      regionalFinal,
      lojaFinal,
      contextoEscopo,
    });
  }

  function renderMensagemSemDados(
    titulo = "Sem dados",
    descricao = "Não há dados disponíveis para os filtros selecionados.",
    spanClass = "span-12"
  ) {
    return `
      <div class="dashboard-card ${spanClass}">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">${escapeHtml(titulo)}</span>
          <span class="dashboard-card-subtitulo">${escapeHtml(descricao)}</span>
        </div>
        <div
          class="dashboard-grafico-area"
          style="min-height:140px; display:flex; align-items:center; justify-content:center;"
        >
          <span style="color:#6b7280; font-weight:600;">Nenhum dado encontrado.</span>
        </div>
      </div>
    `;
  }

  function montarLinhaRanking({
    idx,
    item,
    colunaNome,
    tipoValor,
    getNomeItem,
    getResultado,
    getQtd,
    colorirFaixaAuditoria = false,
    getLinhaStyle = null,
    getLinhaClass = null,
  }) {
    const nomeItem = textoSeguro(getNomeItem(item), "-");
    const resultado = numeroSeguro(getResultado(item), 0);
    const qtd =
      typeof getQtd === "function" ? numeroSeguro(getQtd(item), 0) : null;

    const estiloAuditoria = colorirFaixaAuditoria
      ? DashboardBI.helpers.getEstiloFaixaAuditoria(resultado)
      : "";

    const estiloExtra =
      typeof getLinhaStyle === "function" ? getLinhaStyle(item, idx) : "";

    const classeExtra =
      typeof getLinhaClass === "function" ? getLinhaClass(item, idx) : "";

    const estiloFinal = [estiloAuditoria, estiloExtra]
      .filter(Boolean)
      .join(" ")
      .trim();

    return `
      <tr ${classeExtra ? `class="${escapeHtml(classeExtra)}"` : ""} ${
        estiloFinal ? `style="${escapeHtml(estiloFinal)}"` : ""
      }>
        <td>${idx + 1}</td>
        <td>${escapeHtml(nomeItem)}</td>
        <td>${escapeHtml(DashboardBI.helpers.formatarValor(resultado, tipoValor))}</td>
        ${
          typeof getQtd === "function"
            ? `<td>${escapeHtml(String(qtd ?? 0))}</td>`
            : ""
        }
      </tr>
    `;
  }

  // ==========================
  // 📋 TABELA RANKING PADRÃO
  // ==========================
  DashboardBI.views.renderTabelaRankingPadrao = function ({
    titulo = "Ranking",
    subtitulo = "Posição e média consolidada",
    colunaNome = "Item",
    colunaResultado = "Resultado",
    lista = [],
    tipoValorPrincipal = "numero",
    getNomeItem = (item) =>
      item?.nome || item?.loja || item?.indicador || "-",
    getResultado = (item) => item?.mediaValor ?? item?.media ?? 0,
    getQtd = null,
    spanClass = "span-6",
    colorirFaixaAuditoria = false,
    getLinhaStyle = null,
    getLinhaClass = null,
  }) {
    const dados = listaSegura(lista);
    const colspan = typeof getQtd === "function" ? 4 : 3;

    logInfo("Renderizando tabela de ranking padrão", {
      titulo,
      total: dados.length,
      tipoValorPrincipal,
      colorirFaixaAuditoria,
      spanClass,
    });

    return `
      <div class="dashboard-card ${spanClass}">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">${escapeHtml(titulo)}</span>
          <span class="dashboard-card-subtitulo">${escapeHtml(subtitulo)}</span>
        </div>

        <div class="tabela-container">
          <table class="tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>${escapeHtml(colunaNome)}</th>
                <th>${escapeHtml(colunaResultado)}</th>
                ${typeof getQtd === "function" ? "<th>Qtd</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${
                dados.length
                  ? dados
                      .map((item, idx) =>
                        montarLinhaRanking({
                          idx,
                          item,
                          colunaNome,
                          tipoValor: tipoValorPrincipal,
                          getNomeItem,
                          getResultado,
                          getQtd,
                          colorirFaixaAuditoria,
                          getLinhaStyle,
                          getLinhaClass,
                        })
                      )
                      .join("")
                  : `
                    <tr>
                      <td colspan="${colspan}">
                        Sem dados para exibir.
                      </td>
                    </tr>
                  `
              }
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
    tipoValorPrincipal,
    subtitulo = "Posição e média consolidada"
  ) {
    return DashboardBI.views.renderTabelaRankingPadrao({
      titulo: "Ranking por indicador",
      subtitulo,
      colunaNome: "Indicador",
      colunaResultado: "Resultado",
      lista,
      tipoValorPrincipal,
      getNomeItem: (item) => item?.indicador || "-",
      getResultado: (item) => item?.mediaValor ?? 0,
      spanClass: "span-12",
    });
  };

  // ==========================
  // 📋 DUAS COLUNAS DE RANKING REGIONAL
  // ==========================
  DashboardBI.views.renderColunasRankingRegionais = function ({
    rankingNE1 = [],
    rankingNE2 = [],
    tipoValorPrincipal = "numero",
    subtituloNE1 = "Lojas da regional NE1",
    subtituloNE2 = "Lojas da regional NE2",
    campoResultado = "mediaValor",
    getNomeItem = (item) => item?.loja || "-",
    getQtd = null,
  }) {
    const colorirFaixaAuditoria = DashboardBI.helpers.rankingEhAuditoria();

    logInfo("Renderizando colunas de ranking regionais", {
      totalNE1: listaSegura(rankingNE1).length,
      totalNE2: listaSegura(rankingNE2).length,
      tipoValorPrincipal,
      campoResultado,
      colorirFaixaAuditoria,
    });

    return `
      ${DashboardBI.views.renderTabelaRankingPadrao({
        titulo: "Ranking NE1",
        subtitulo: subtituloNE1,
        colunaNome: "Loja",
        colunaResultado: "Resultado",
        lista: rankingNE1,
        tipoValorPrincipal,
        getNomeItem,
        getResultado: (item) => item?.[campoResultado] ?? 0,
        getQtd,
        spanClass: "span-6",
        colorirFaixaAuditoria,
      })}

      ${DashboardBI.views.renderTabelaRankingPadrao({
        titulo: "Ranking NE2",
        subtitulo: subtituloNE2,
        colunaNome: "Loja",
        colunaResultado: "Resultado",
        lista: rankingNE2,
        tipoValorPrincipal,
        getNomeItem,
        getResultado: (item) => item?.[campoResultado] ?? 0,
        getQtd,
        spanClass: "span-6",
        colorirFaixaAuditoria,
      })}
    `;
  };

  // ==========================
  // 🧱 TELA BASE DO DASHBOARD
  // ==========================
  DashboardBI.views.telaDashboard = async function () {
    logInfo("Iniciando DashboardBI.views.telaDashboard...");

    const container = document.getElementById("conteudo");
    if (!container) {
      logError("#conteudo não encontrado para dashboard");
      return;
    }

    if (!window.db) {
      logError("window.db não disponível no dashboard");
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
      logError("Contexto do dashboard não encontrado");
      if (typeof window.mostrarErro === "function") {
        window.mostrarErro("Usuário sem contexto de dashboard");
      }
      return;
    }

    logInfo("Contexto recebido no dashboard", contexto);

    normalizarEstadoInicialDashboard(contexto);
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
            <select id="dashPeriodoDashboard" onchange="dashboardAlterarPeriodoDashboard(this.value)">
              ${DashboardBI.filters.gerarOptionsPeriodoDashboard()}
            </select>

            <select id="dashPeriodoRanking" onchange="dashboardAlterarPeriodoRanking(this.value)">
              ${DashboardBI.filters.gerarOptionsPeriodoRanking()}
            </select>

            <select id="dashSemana" onchange="dashboardAlterarSemana(this.value)">
              ${
                typeof window.gerarOptionsSemanas === "function"
                  ? window.gerarOptionsSemanas()
                  : ""
              }
            </select>

            <select id="dashMes" onchange="dashboardAlterarMes(this.value)">
              ${DashboardBI.filters.gerarOptionsMesesDashboard()}
            </select>

            <select id="dashAno" onchange="dashboardAlterarAno(this.value)">
              ${DashboardBI.filters.gerarOptionsAnosDashboard()}
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

    const selPeriodoDashboard = document.getElementById("dashPeriodoDashboard");
    if (selPeriodoDashboard) selPeriodoDashboard.value = state.periodoDashboard;

    const selPeriodoRanking = document.getElementById("dashPeriodoRanking");
    if (selPeriodoRanking) selPeriodoRanking.value = state.periodoRanking;

    const selSemana = document.getElementById("dashSemana");
    if (selSemana) selSemana.value = state.semana;

    const selMes = document.getElementById("dashMes");
    if (selMes) selMes.value = state.mes;

    const selAno = document.getElementById("dashAno");
    if (selAno) selAno.value = state.ano;

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
  // 🏪 VISÃO GERENCIAL
  // ==========================
  DashboardBI.views.renderDashboardGerencial = async function ({
    contexto,
    lojas,
    lojasEscopoBase,
    resultados,
    resultadosRanking,
    rankingIndicadores,
    periodoDashboardInfo,
    periodoRankingInfo,
    semanasJanela,
    semanasMesInfo,
    usandoFallback,
  }) {
    logInfo("Renderizando visão gerencial...");

    const alvo = getAlvoDashboard();
    if (!alvo) return;

    DashboardBI.filters.popularSelectLojasDashboard(lojasEscopoBase);

    const resultadosMes = listaSegura(resultados);
    const resultadosRankingBase = resultadosRanking || resultadosMes || [];

    const evolucao = DashboardBI.aggregations.agruparEvolucaoDashboard(
      resultadosMes,
      semanasJanela
    );

    const listaRankingIndicadores = listaSegura(rankingIndicadores).length
      ? rankingIndicadores
      : DashboardBI.aggregations.agruparRankingIndicadoresPorPeriodoDashboard(
          resultadosRankingBase,
          periodoRankingInfo || {}
        );

    const mediasMensais =
      DashboardBI.aggregations.calcularMediasMensaisDashboard(
        resultadosMes,
        semanasMesInfo || {}
      );

    const tituloLoja =
      listaSegura(lojas).length === 1
        ? DashboardBI.helpers.getChaveLoja(lojas[0])
        : contexto?.escopo?.loja || "Visão Gerencial";

    const tipoValorPrincipal = getTipoValorPrincipalAtual();
    const tipoValorSecundario = getTipoValorSecundarioAtual();

    const descricaoPeriodoDashboard = getDescricaoPeriodoCurta(
      periodoDashboardInfo,
      usandoFallback ? "últimas 4 semanas com dados" : "período selecionado"
    );

    const descricaoPeriodoRanking = getDescricaoPeriodoCurta(
      periodoRankingInfo,
      "período do ranking"
    );

    if (!resultadosMes.length && !listaRankingIndicadores.length) {
      alvo.innerHTML = renderMensagemSemDados(
        "Sem dados no dashboard",
        "Nenhum resultado encontrado para os filtros aplicados."
      );
      return;
    }

    alvo.innerHTML = `
      ${DashboardBI.kpis.renderKPIsGerenciais({
        tituloLoja,
        totalLojas: listaSegura(lojas).length || 0,
        mediaPrimeira: mediasMensais.mediaPrimeira,
        mediaUltima: mediasMensais.mediaUltima,
        mediaMensal: mediasMensais.mediaMensal,
        tipoValorPrincipal,
        descricaoPeriodo: descricaoPeriodoDashboard,
      })}

      <div class="dashboard-card dashboard-grafico span-8">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Evolução semanal</span>
          <span class="dashboard-card-subtitulo">${escapeHtml(descricaoPeriodoDashboard)}</span>
        </div>
        <div class="dashboard-chart-box">
          <canvas id="graficoEvolucao"></canvas>
        </div>
      </div>

      <div class="dashboard-card dashboard-grafico span-4">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Ranking por indicador</span>
          <span class="dashboard-card-subtitulo">${escapeHtml(descricaoPeriodoRanking)}</span>
        </div>
        <div class="dashboard-chart-box">
          <canvas id="graficoRanking"></canvas>
        </div>
      </div>

      ${DashboardBI.views.renderTabelaRankingIndicadores(
        listaRankingIndicadores,
        tipoValorPrincipal,
        descricaoPeriodoRanking
      )}
    `;

    DashboardBI.charts.renderGraficosDashboard({
      evolucao,
      ranking: listaRankingIndicadores,
      tipoRanking: "indicadores",
      tipoValorPrincipal,
      tipoValorSecundario,
      modoEvolucao: "padrao",
    });

    logInfo("Visão gerencial renderizada", {
      totalResultados: resultadosMes.length,
      totalRankingIndicadores: listaRankingIndicadores.length,
      tipoValorPrincipal,
      tipoValorSecundario,
    });
  };

  // ==========================
  // 🌍 VISÃO REGIONAL
  // ==========================
  DashboardBI.views.renderDashboardRegional = async function ({
    contexto,
    lojas,
    lojasEscopoBase,
    resultados,
    resultadosEscopoBase,
    resultadosRanking,
    periodoDashboardInfo,
    periodoRankingInfo,
    semanasJanela,
    semanasMesInfo,
    usandoFallback,
    rankingNE1 = [],
    rankingNE2 = [],
    evolucaoComparativaRegional = [],
    campoResultadoRankingRegional = null,
    tipoValorRankingRegional = null,
  }) {
    logInfo("Renderizando visão regional...");

    const alvo = getAlvoDashboard();
    if (!alvo) return;

    const resultadosMes = listaSegura(resultados);
    const resultadosEscopoCompleto = listaSegura(resultadosEscopoBase);
    const resultadosRankingBase = resultadosRanking || resultadosMes || [];

    const evolucao = listaSegura(evolucaoComparativaRegional).length
      ? evolucaoComparativaRegional
      : DashboardBI.aggregations.agruparEvolucaoDashboard(
          resultadosMes,
          semanasJanela
        );

    const rankingConsolidado =
      DashboardBI.aggregations.agruparRankingLojasPorPeriodoDashboard(
        resultadosRankingBase,
        periodoRankingInfo || {}
      );

    const tipoValorPrincipal = getTipoValorPrincipalAtual();
    const tipoValorSecundario = getTipoValorSecundarioAtual();

    const campoResultadoRegional =
      campoResultadoRankingRegional || getCampoResultadoRegionalAtual();

    const tipoValorRegional =
      tipoValorRankingRegional ||
      (campoResultadoRegional === "mediaValor2"
        ? tipoValorSecundario
        : tipoValorPrincipal);

    const descricaoPeriodoDashboard = getDescricaoPeriodoCurta(
      periodoDashboardInfo,
      usandoFallback ? "últimas 4 semanas com dados" : "período selecionado"
    );

    const descricaoPeriodoRanking = getDescricaoPeriodoCurta(
      periodoRankingInfo,
      "período do ranking"
    );

    logInfo("Dados regionais preparados", {
      resultadosMes: resultadosMes.length,
      resultadosEscopoCompleto: resultadosEscopoCompleto.length,
      rankingConsolidado: rankingConsolidado.length,
      rankingNE1: listaSegura(rankingNE1).length,
      rankingNE2: listaSegura(rankingNE2).length,
      semanasJanela,
      semanasMesInfo,
      descricaoPeriodoDashboard,
      descricaoPeriodoRanking,
      campoResultadoRegional,
      tipoValorRegional,
    });

    if (!resultadosMes.length && !listaSegura(rankingNE1).length && !listaSegura(rankingNE2).length) {
      alvo.innerHTML = renderMensagemSemDados(
        "Sem dados regionais",
        "Nenhum resultado regional encontrado para os filtros aplicados."
      );
      return;
    }

    alvo.innerHTML = `
      ${DashboardBI.kpis.renderKPIsRegionais()}

      <div class="dashboard-card dashboard-grafico span-8">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Evolução semanal</span>
          <span class="dashboard-card-subtitulo">
            Comparativo NE1 x NE2 • ${escapeHtml(descricaoPeriodoDashboard)}
          </span>
        </div>
        <div class="dashboard-chart-box">
          <canvas id="graficoEvolucao"></canvas>
        </div>
      </div>

      <div class="dashboard-card dashboard-grafico span-4">
        <div class="dashboard-card-header">
          <span class="dashboard-card-titulo">Ranking consolidado</span>
          <span class="dashboard-card-subtitulo">${escapeHtml(descricaoPeriodoRanking)}</span>
        </div>
        <div class="dashboard-chart-box">
          <canvas id="graficoRanking"></canvas>
        </div>
      </div>

      ${DashboardBI.views.renderColunasRankingRegionais({
        rankingNE1,
        rankingNE2,
        tipoValorPrincipal: tipoValorRegional,
        subtituloNE1: `${descricaoPeriodoRanking} • lojas NE1`,
        subtituloNE2: `${descricaoPeriodoRanking} • lojas NE2`,
        campoResultado: campoResultadoRegional,
      })}
    `;

    DashboardBI.charts.renderGraficosDashboard({
      evolucao,
      ranking: rankingConsolidado,
      tipoRanking: "lojas",
      tipoValorPrincipal,
      tipoValorSecundario,
      modoEvolucao: "regional-comparativo",
    });

    logInfo("Visão regional renderizada", {
      totalResultados: resultadosMes.length,
      rankingNE1: listaSegura(rankingNE1).length,
      rankingNE2: listaSegura(rankingNE2).length,
      campoResultadoRegional,
      tipoValorRegional,
    });
  };

  logInfo("dashboard-views.js pronto", {
    telaDashboard: typeof DashboardBI.views.telaDashboard,
    renderDashboardGerencial: typeof DashboardBI.views.renderDashboardGerencial,
    renderDashboardRegional: typeof DashboardBI.views.renderDashboardRegional,
    renderTabelaRankingPadrao:
      typeof DashboardBI.views.renderTabelaRankingPadrao,
    renderTabelaRankingIndicadores:
      typeof DashboardBI.views.renderTabelaRankingIndicadores,
    renderColunasRankingRegionais:
      typeof DashboardBI.views.renderColunasRankingRegionais,
  });
})();