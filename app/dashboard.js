// ==========================
// 📊 DASHBOARD COM CHART.JS
// ==========================
console.log("✅ dashboard.js carregado");

// ==========================
// 🧠 ESTADO GLOBAL DO DASHBOARD
// ==========================
const DASHBOARD_STATE = {
  semana:
    localStorage.getItem("semana") ||
    getSemanaAtual().toString().padStart(2, "0"),

  visao: "regional",
  classe: "TODAS",
  indicador: "TODOS",
  regional: "TODAS",
  loja: "TODAS"
};

// ==========================
// 📈 INSTÂNCIAS DOS GRÁFICOS
// ==========================
window.dashboardCharts = window.dashboardCharts || {
  evolucao: null,
  ranking: null,
  classes: null
};

// ==========================
// 🔠 HELPERS
// ==========================
function normalizarTextoDashboard(valor) {
  return (valor || "").toString().trim();
}

function normalizarTextoDashboardUpper(valor) {
  return normalizarTextoDashboard(valor).toUpperCase();
}

function normalizarTextoDashboardLower(valor) {
  return normalizarTextoDashboard(valor).toLowerCase();
}

function formatarNumeroDashboard(valor, casas = 2) {
  const numero = Number(valor);
  if (isNaN(numero)) return "-";

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  });
}

function calcularMediaDashboard(lista = []) {
  const numeros = lista
    .map((v) => Number(v))
    .filter((v) => !isNaN(v));

  if (!numeros.length) return 0;

  return numeros.reduce((a, b) => a + b, 0) / numeros.length;
}

function getChaveLojaDashboard(loja) {
  return `${loja.codigo} - ${loja.nome}`;
}

function gerarJanelaSemanasDashboard(semanaBase) {
  const atual = parseInt(semanaBase || getSemanaAtual(), 10);

  const lista = [atual - 3, atual - 2, atual - 1, atual].map((s) =>
    s <= 0 ? 52 + s : s
  );

  return lista.map((s) => s.toString().padStart(2, "0"));
}

// ==========================
// 🏷️ HELPERS DE INDICADOR
// ==========================
function getNomeDashboard(indicador, classeSelecionada = null) {
  if (typeof getNomeIndicador === "function") {
    return getNomeIndicador(indicador, classeSelecionada);
  }

  return indicador;
}

function getIndicadorBancoDashboard(indicador, classeSelecionada = null) {
  if (typeof getIndicadorBanco === "function") {
    return getIndicadorBanco(indicador, classeSelecionada);
  }

  return normalizarTextoDashboardUpper(indicador);
}

function getClasseDashboard(indicador, classeSelecionada = null) {
  if (typeof getClasseIndicador === "function") {
    return getClasseIndicador(indicador, classeSelecionada);
  }

  return classeSelecionada || "Outros";
}

function getCampoDashboard(indicador, campoKey = "valor", classeSelecionada = null) {
  if (typeof getCampoConfig === "function") {
    return getCampoConfig(indicador, campoKey, classeSelecionada);
  }

  return {
    key: campoKey,
    label: campoKey === "valor2" ? "Valor 2" : "Resultado",
    tipo: "numero"
  };
}

function getTipoCampoDashboard(indicador, campoKey = "valor", classeSelecionada = null) {
  const campo = getCampoDashboard(indicador, campoKey, classeSelecionada);
  return campo?.tipo || "numero";
}

function formatarValorDashboard(valor, tipo = "numero") {
  if (valor === null || valor === undefined || valor === "") return "-";

  const numero = Number(valor);
  if (isNaN(numero)) return "-";

  if (typeof formatarValorExibicao === "function") {
    return formatarValorExibicao(numero, tipo);
  }

  return formatarNumeroDashboard(numero, 2);
}

function getOrdemRankingDashboard(indicador, classeSelecionada = null) {
  try {
    if (typeof getIndicadorConfig === "function") {
      const cfg = getIndicadorConfig(indicador, classeSelecionada);
      if (cfg?.ordemRanking === "asc") return "asc";
      if (cfg?.ordemRanking === "desc") return "desc";
    }
  } catch (erro) {
    console.warn("⚠️ Não foi possível avaliar ordem do ranking:", erro);
  }

  return "desc";
}

// ==========================
// 📂 LISTA DE CLASSES
// ==========================
function getClassesDashboardDisponiveis() {
  if (typeof classesIndicadores === "object") {
    return Object.keys(classesIndicadores);
  }

  return ["Auditoria", "Frente de Caixa", "Operações", "Prevenção", "RH / Operacional"];
}

// ==========================
// 📊 LISTA DE INDICADORES
// ==========================
function getIndicadoresDashboardPorClasse(classe) {
  if (!classe || classe === "TODAS") {
    const lista = [];

    Object.entries(classesIndicadores || {}).forEach(([nomeClasse, itens]) => {
      itens.forEach((item) => {
        lista.push({
          nome: item.nome || item,
          valor: item.valor || item,
          classe: nomeClasse
        });
      });
    });

    return lista;
  }

  const itens = classesIndicadores?.[classe] || [];

  return itens.map((item) => ({
    nome: item.nome || item,
    valor: item.valor || item,
    classe
  }));
}

// ==========================
// 🧹 DESTRUIR GRÁFICOS ANTIGOS
// ==========================
function destruirGraficosDashboard() {
  console.log("🧹 Destruindo gráficos antigos do dashboard...");

  try {
    if (window.dashboardCharts.evolucao) {
      window.dashboardCharts.evolucao.destroy();
      window.dashboardCharts.evolucao = null;
    }

    if (window.dashboardCharts.ranking) {
      window.dashboardCharts.ranking.destroy();
      window.dashboardCharts.ranking = null;
    }

    if (window.dashboardCharts.classes) {
      window.dashboardCharts.classes.destroy();
      window.dashboardCharts.classes = null;
    }
  } catch (erro) {
    console.error("❌ Erro ao destruir gráficos do dashboard:", erro);
  }
}

// ==========================
// ✅ GARANTIR CHART.JS
// ==========================
function chartJsDisponivel() {
  const ok = typeof Chart !== "undefined";
  if (!ok) {
    console.error("❌ Chart.js não encontrado. Adicione o script no index.html");
  }
  return ok;
}

// ==========================
// 🧱 TELA BASE DO DASHBOARD
// ==========================
async function telaDashboard() {
  console.log("📊 Iniciando telaDashboard...");

  const container = document.getElementById("conteudo");
  if (!container) {
    console.error("❌ #conteudo não encontrado para dashboard");
    return;
  }

  if (!window.db) {
    console.error("❌ window.db não disponível no dashboard");
    mostrarErro("Conexão com banco não iniciada");
    return;
  }

  const contexto =
    typeof getContextoDashboardUsuario === "function"
      ? getContextoDashboardUsuario()
      : null;

  if (!contexto) {
    console.error("❌ Contexto do dashboard não encontrado");
    mostrarErro("Usuário sem contexto de dashboard");
    return;
  }

  console.log("🧠 Contexto recebido no dashboard:", contexto);

  DASHBOARD_STATE.visao = contexto.visao || "regional";

  if (contexto.escopo?.regional && DASHBOARD_STATE.regional === "TODAS") {
    DASHBOARD_STATE.regional = contexto.escopo.regional;
  }

  if (contexto.escopo?.loja && DASHBOARD_STATE.loja === "TODAS") {
    DASHBOARD_STATE.loja = contexto.escopo.loja;
  }

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
            ${gerarOptionsSemanas()}
          </select>

          ${
            contexto.podeTrocarVisao
              ? `
                <select id="dashVisao" onchange="dashboardAlterarVisao(this.value)">
                  <option value="gerencial" ${DASHBOARD_STATE.visao === "gerencial" ? "selected" : ""}>
                    Visão Gerencial
                  </option>
                  <option value="regional" ${DASHBOARD_STATE.visao === "regional" ? "selected" : ""}>
                    Visão Regional
                  </option>
                </select>
              `
              : ""
          }

          <select id="dashClasse" onchange="dashboardAlterarClasse(this.value)">
            ${gerarOptionsClassesDashboard()}
          </select>

          <select id="dashIndicador" onchange="dashboardAlterarIndicador(this.value)">
            ${gerarOptionsIndicadoresDashboard()}
          </select>

          ${
            DASHBOARD_STATE.visao === "regional" || contexto.podeTrocarVisao
              ? `
                <select id="dashRegional" onchange="dashboardAlterarRegional(this.value)">
                  <option value="TODAS">Todas regionais</option>
                  <option value="NE1" ${DASHBOARD_STATE.regional === "NE1" ? "selected" : ""}>NE1</option>
                  <option value="NE2" ${DASHBOARD_STATE.regional === "NE2" ? "selected" : ""}>NE2</option>
                </select>
              `
              : ""
          }

          ${
            DASHBOARD_STATE.visao === "gerencial" && contexto.podeTrocarVisao
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
  if (selSemana) selSemana.value = DASHBOARD_STATE.semana;

  const selClasse = document.getElementById("dashClasse");
  if (selClasse) selClasse.value = DASHBOARD_STATE.classe;

  const selIndicador = document.getElementById("dashIndicador");
  if (selIndicador) selIndicador.value = DASHBOARD_STATE.indicador;

  const selRegional = document.getElementById("dashRegional");
  if (selRegional) selRegional.value = DASHBOARD_STATE.regional;

  destruirGraficosDashboard();
  await carregarDadosDashboard(contexto);
}

// ==========================
// 📅 OPTIONS CLASSES
// ==========================
function gerarOptionsClassesDashboard() {
  const classes = getClassesDashboardDisponiveis();

  let html = `<option value="TODAS">Todas as classes</option>`;

  classes.forEach((classe) => {
    html += `<option value="${classe}" ${DASHBOARD_STATE.classe === classe ? "selected" : ""}>${classe}</option>`;
  });

  return html;
}

// ==========================
// 📊 OPTIONS INDICADORES
// ==========================
function gerarOptionsIndicadoresDashboard() {
  const lista = getIndicadoresDashboardPorClasse(DASHBOARD_STATE.classe);

  let html = `<option value="TODOS">Todos os indicadores</option>`;

  lista.forEach((item) => {
    html += `<option value="${item.valor}" ${DASHBOARD_STATE.indicador === item.valor ? "selected" : ""}>${item.nome}</option>`;
  });

  return html;
}

// ==========================
// 🔄 FILTROS DASHBOARD
// ==========================
async function dashboardAlterarSemana(semana) {
  DASHBOARD_STATE.semana = semana;
  localStorage.setItem("semana", semana);

  console.log("📅 Dashboard semana alterada:", semana);

  destruirGraficosDashboard();
  const contexto = getContextoDashboardUsuario();
  await carregarDadosDashboard(contexto);
}

async function dashboardAlterarClasse(classe) {
  DASHBOARD_STATE.classe = classe;
  DASHBOARD_STATE.indicador = "TODOS";

  console.log("📂 Dashboard classe alterada:", classe);

  const selIndicador = document.getElementById("dashIndicador");
  if (selIndicador) {
    selIndicador.innerHTML = gerarOptionsIndicadoresDashboard();
    selIndicador.value = "TODOS";
  }

  destruirGraficosDashboard();
  const contexto = getContextoDashboardUsuario();
  await carregarDadosDashboard(contexto);
}

async function dashboardAlterarIndicador(indicador) {
  DASHBOARD_STATE.indicador = indicador;

  console.log("📊 Dashboard indicador alterado:", indicador);

  destruirGraficosDashboard();
  const contexto = getContextoDashboardUsuario();
  await carregarDadosDashboard(contexto);
}

async function dashboardAlterarRegional(regional) {
  DASHBOARD_STATE.regional = regional;

  console.log("🌍 Dashboard regional alterada:", regional);

  destruirGraficosDashboard();
  const contexto = getContextoDashboardUsuario();
  await carregarDadosDashboard(contexto);
}

async function dashboardAlterarLoja(loja) {
  DASHBOARD_STATE.loja = loja;

  console.log("🏬 Dashboard loja alterada:", loja);

  destruirGraficosDashboard();
  const contexto = getContextoDashboardUsuario();
  await carregarDadosDashboard(contexto);
}

async function dashboardAlterarVisao(visao) {
  console.log("🔄 Dashboard visão alterada:", visao);

  destruirGraficosDashboard();

  if (typeof trocarVisaoDashboard === "function") {
    trocarVisaoDashboard(visao);
    return;
  }

  DASHBOARD_STATE.visao = visao;
  await telaDashboard();
}

// ==========================
// 🧠 CARREGAR DADOS DO DASHBOARD
// ==========================
async function carregarDadosDashboard(contexto) {
  console.log("🚀 Carregando dados do dashboard...", {
    estado: DASHBOARD_STATE,
    contexto
  });

  const alvo = document.getElementById("dashboardConteudo");
  if (!alvo) return;

  alvo.innerHTML = `
    <div class="dashboard-card span-12">
      <div class="dashboard-grafico-area">Processando dados do dashboard...</div>
    </div>
  `;

  try {
    const semanasJanela = gerarJanelaSemanasDashboard(DASHBOARD_STATE.semana);

    const { data: lojasData, error: lojasError } = await window.db
      .from("lojas")
      .select("*")
      .order("codigo");

    if (lojasError) throw lojasError;

    let lojas = lojasData || [];
    lojas = aplicarEscopoLojasDashboard(lojas, contexto);

    const lojasSet = new Set(lojas.map((l) => getChaveLojaDashboard(l)));

    let query = window.db
      .from("resultados")
      .select("*")
      .in("semana", semanasJanela);

    if (DASHBOARD_STATE.classe !== "TODAS") {
      query = query.eq("classe", DASHBOARD_STATE.classe);
    }

    if (DASHBOARD_STATE.indicador !== "TODOS") {
      const indicadorBanco = getIndicadorBancoDashboard(
        DASHBOARD_STATE.indicador,
        DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe
      );

      query = query.eq("indicador", indicadorBanco);
    }

    const { data: resultadosData, error: resultadosError } = await query;
    if (resultadosError) throw resultadosError;

    let resultados = (resultadosData || []).filter((r) => lojasSet.has(r.loja));

    console.log("🏬 Lojas finais:", lojas.length);
    console.log("📊 Resultados finais:", resultados.length);

    if (DASHBOARD_STATE.visao === "gerencial") {
      await renderDashboardGerencial({
        contexto,
        lojas,
        resultados,
        semanasJanela
      });
    } else {
      await renderDashboardRegional({
        contexto,
        lojas,
        resultados,
        semanasJanela
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
}

// ==========================
// 🎯 APLICAR ESCOPO DAS LOJAS
// ==========================
function aplicarEscopoLojasDashboard(lojas, contexto) {
  let lista = [...(lojas || [])];

  if (!contexto) return lista;

  if (DASHBOARD_STATE.visao === "regional") {
    if (!contexto.podeTrocarVisao && contexto.escopo?.regional) {
      lista = lista.filter(
        (l) =>
          normalizarTextoDashboardUpper(l.regional) ===
          normalizarTextoDashboardUpper(contexto.escopo.regional)
      );
    }

    if (DASHBOARD_STATE.regional !== "TODAS") {
      lista = lista.filter(
        (l) =>
          normalizarTextoDashboardUpper(l.regional) ===
          normalizarTextoDashboardUpper(DASHBOARD_STATE.regional)
      );
    }

    return lista;
  }

  if (!contexto.podeTrocarVisao && contexto.escopo?.loja) {
    return lista.filter(
      (l) => getChaveLojaDashboard(l) === contexto.escopo.loja
    );
  }

  if (DASHBOARD_STATE.loja && DASHBOARD_STATE.loja !== "TODAS") {
    return lista.filter(
      (l) => getChaveLojaDashboard(l) === DASHBOARD_STATE.loja
    );
  }

  return lista;
}

// ==========================
// 📦 AGRUPADORES
// ==========================
function agruparIndicadoresPorQtdDashboard(resultadosSemana) {
  const mapa = {};

  resultadosSemana.forEach((r) => {
    if (!mapa[r.indicador]) {
      mapa[r.indicador] = 0;
    }
    mapa[r.indicador] += 1;
  });

  return Object.entries(mapa)
    .map(([indicador, qtd]) => ({ indicador, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 10);
}

function agruparLojasRankingDashboard(resultadosSemana) {
  const mapa = {};

  resultadosSemana.forEach((r) => {
    if (!mapa[r.loja]) {
      mapa[r.loja] = {
        loja: r.loja,
        valores: [],
        valores2: []
      };
    }

    mapa[r.loja].valores.push(Number(r.valor));
    mapa[r.loja].valores2.push(Number(r.valor2));
  });

  const lista = Object.values(mapa).map((item) => ({
    loja: item.loja,
    mediaValor: calcularMediaDashboard(item.valores),
    mediaValor2: calcularMediaDashboard(item.valores2)
  }));

  const ordem =
    DASHBOARD_STATE.indicador !== "TODOS"
      ? getOrdemRankingDashboard(
          DASHBOARD_STATE.indicador,
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe
        )
      : "desc";

  lista.sort((a, b) => {
    if (ordem === "asc") return a.mediaValor - b.mediaValor;
    return b.mediaValor - a.mediaValor;
  });

  return lista.slice(0, 10);
}

function agruparClassesDashboard(resultadosSemana) {
  const mapa = {};

  resultadosSemana.forEach((r) => {
    if (!mapa[r.classe]) {
      mapa[r.classe] = 0;
    }
    mapa[r.classe] += 1;
  });

  return Object.entries(mapa)
    .map(([classe, qtd]) => ({ classe, qtd }))
    .sort((a, b) => b.qtd - a.qtd);
}

// ==========================
// 📊 VISÃO GERENCIAL
// ==========================
async function renderDashboardGerencial({ contexto, lojas, resultados, semanasJanela }) {
  console.log("🏪 Renderizando visão gerencial...");

  const alvo = document.getElementById("dashboardConteudo");
  if (!alvo) return;

  if (contexto?.podeTrocarVisao) {
    popularSelectLojasDashboard(lojas);
  }

  const semanaAtual = DASHBOARD_STATE.semana;
  const resultadosSemana = resultados.filter((r) => String(r.semana) === String(semanaAtual));

  const totalLojas = lojas.length;
  const lojasComDados = new Set(resultadosSemana.map((r) => r.loja)).size;
  const cobertura = totalLojas > 0 ? (lojasComDados / totalLojas) * 100 : 0;

  const mediaValorSemana = calcularMediaDashboard(resultadosSemana.map((r) => r.valor));
  const mediaValor2Semana = calcularMediaDashboard(resultadosSemana.map((r) => r.valor2));

  const evolucao = semanasJanela.map((semana) => {
    const dadosSemana = resultados.filter((r) => String(r.semana) === String(semana));

    return {
      semana,
      registros: dadosSemana.length,
      mediaValor: calcularMediaDashboard(dadosSemana.map((r) => r.valor)),
      mediaValor2: calcularMediaDashboard(dadosSemana.map((r) => r.valor2))
    };
  });

  const rankingIndicadores = agruparIndicadoresPorQtdDashboard(resultadosSemana);
  const resumoClasses = agruparClassesDashboard(resultadosSemana);

  const tituloLoja =
    lojas.length === 1
      ? getChaveLojaDashboard(lojas[0])
      : contexto?.escopo?.loja || "Visão Gerencial";

  const tipoValorPrincipal =
    DASHBOARD_STATE.indicador !== "TODOS"
      ? getTipoCampoDashboard(
          DASHBOARD_STATE.indicador,
          "valor",
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe
        )
      : "numero";

  const tipoValorSecundario =
    DASHBOARD_STATE.indicador !== "TODOS"
      ? getTipoCampoDashboard(
          DASHBOARD_STATE.indicador,
          "valor2",
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe
        )
      : "numero";

  alvo.innerHTML = `
    ${renderKPIsGerenciais({
      tituloLoja,
      totalLojas,
      lojasComDados,
      cobertura,
      mediaValorSemana,
      mediaValor2Semana,
      tipoValorPrincipal,
      tipoValorSecundario
    })}

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Evolução semanal</span>
        <span class="dashboard-card-subtitulo">Últimas 4 semanas</span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoEvolucao"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Ranking por indicador</span>
        <span class="dashboard-card-subtitulo">Top 10 por quantidade de registros</span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoRanking"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico span-12">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Resumo por classe</span>
        <span class="dashboard-card-subtitulo">Distribuição dos registros na semana</span>
      </div>
      <div class="dashboard-chart-box dashboard-chart-box-pequeno">
        <canvas id="graficoClasses"></canvas>
      </div>
    </div>
  `;

  renderGraficosDashboard({
    evolucao,
    ranking: rankingIndicadores,
    resumoClasses,
    tipoRanking: "indicadores",
    tipoValorPrincipal,
    tipoValorSecundario
  });
}

// ==========================
// 🌍 VISÃO REGIONAL
// ==========================
async function renderDashboardRegional({ contexto, lojas, resultados, semanasJanela }) {
  console.log("🌍 Renderizando visão regional...");

  const alvo = document.getElementById("dashboardConteudo");
  if (!alvo) return;

  const semanaAtual = DASHBOARD_STATE.semana;
  const resultadosSemana = resultados.filter((r) => String(r.semana) === String(semanaAtual));

  const totalLojas = lojas.length;
  const lojasComDados = new Set(resultadosSemana.map((r) => r.loja)).size;
  const cobertura = totalLojas > 0 ? (lojasComDados / totalLojas) * 100 : 0;

  const mediaValorSemana = calcularMediaDashboard(resultadosSemana.map((r) => r.valor));
  const mediaValor2Semana = calcularMediaDashboard(resultadosSemana.map((r) => r.valor2));

  const evolucao = semanasJanela.map((semana) => {
    const dadosSemana = resultados.filter((r) => String(r.semana) === String(semana));

    return {
      semana,
      registros: dadosSemana.length,
      mediaValor: calcularMediaDashboard(dadosSemana.map((r) => r.valor)),
      mediaValor2: calcularMediaDashboard(dadosSemana.map((r) => r.valor2))
    };
  });

  const rankingLojas = agruparLojasRankingDashboard(resultadosSemana);
  const resumoClasses = agruparClassesDashboard(resultadosSemana);

  const tipoValorPrincipal =
    DASHBOARD_STATE.indicador !== "TODOS"
      ? getTipoCampoDashboard(
          DASHBOARD_STATE.indicador,
          "valor",
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe
        )
      : "numero";

  const tipoValorSecundario =
    DASHBOARD_STATE.indicador !== "TODOS"
      ? getTipoCampoDashboard(
          DASHBOARD_STATE.indicador,
          "valor2",
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe
        )
      : "numero";

  alvo.innerHTML = `
    ${renderKPIsRegionais({
      totalLojas,
      lojasComDados,
      cobertura,
      mediaValorSemana,
      mediaValor2Semana,
      regional: DASHBOARD_STATE.regional,
      tipoValorPrincipal,
      tipoValorSecundario
    })}

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Evolução semanal</span>
        <span class="dashboard-card-subtitulo">Consolidado regional</span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoEvolucao"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Ranking de lojas</span>
        <span class="dashboard-card-subtitulo">Top 10 pela média do indicador</span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoRanking"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico span-12">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Resumo por classe</span>
        <span class="dashboard-card-subtitulo">Distribuição dos registros na semana</span>
      </div>
      <div class="dashboard-chart-box dashboard-chart-box-pequeno">
        <canvas id="graficoClasses"></canvas>
      </div>
    </div>
  `;

  renderGraficosDashboard({
    evolucao,
    ranking: rankingLojas,
    resumoClasses,
    tipoRanking: "lojas",
    tipoValorPrincipal,
    tipoValorSecundario
  });
}

// ==========================
// 🏬 POPULAR SELECT DE LOJAS
// ==========================
function popularSelectLojasDashboard(lojas) {
  const select = document.getElementById("dashLoja");
  if (!select) return;

  let html = `<option value="TODAS">Todas as lojas</option>`;

  lojas.forEach((loja) => {
    const chave = getChaveLojaDashboard(loja);
    html += `<option value="${chave}" ${DASHBOARD_STATE.loja === chave ? "selected" : ""}>${chave}</option>`;
  });

  select.innerHTML = html;
}

// ==========================
// 🔢 RENDER KPIs GERENCIAIS
// ==========================
function renderKPIsGerenciais({
  tituloLoja,
  totalLojas,
  lojasComDados,
  cobertura,
  mediaValorSemana,
  mediaValor2Semana,
  tipoValorPrincipal,
  tipoValorSecundario
}) {
  return `
    <div class="dashboard-card dashboard-kpi azul span-3">
      <span class="dashboard-kpi-label">Loja / escopo</span>
      <div class="dashboard-kpi-valor">${totalLojas}</div>
      <div class="dashboard-kpi-rodape">${tituloLoja}</div>
    </div>

    <div class="dashboard-card dashboard-kpi verde span-3">
      <span class="dashboard-kpi-label">Registros na semana</span>
      <div class="dashboard-kpi-valor">${lojasComDados}</div>
      <div class="dashboard-kpi-rodape">Lojas com dados na semana ativa</div>
    </div>

    <div class="dashboard-card dashboard-kpi laranja span-3">
      <span class="dashboard-kpi-label">Cobertura</span>
      <div class="dashboard-kpi-valor">${formatarNumeroDashboard(cobertura, 1)}%</div>
      <div class="dashboard-kpi-rodape">Percentual de preenchimento</div>
    </div>

    <div class="dashboard-card dashboard-kpi roxo span-3">
      <span class="dashboard-kpi-label">Média da semana</span>
      <div class="dashboard-kpi-valor">${formatarValorDashboard(mediaValorSemana, tipoValorPrincipal)}</div>
      <div class="dashboard-kpi-rodape">
        ${
          mediaValor2Semana
            ? `2º valor: ${formatarValorDashboard(mediaValor2Semana, tipoValorSecundario)}`
            : "Valor principal consolidado"
        }
      </div>
    </div>
  `;
}

// ==========================
// 🔢 RENDER KPIs REGIONAIS
// ==========================
function renderKPIsRegionais({
  totalLojas,
  lojasComDados,
  cobertura,
  mediaValorSemana,
  mediaValor2Semana,
  regional,
  tipoValorPrincipal,
  tipoValorSecundario
}) {
  return `
    <div class="dashboard-card dashboard-kpi azul span-3">
      <span class="dashboard-kpi-label">Regional</span>
      <div class="dashboard-kpi-valor">${regional === "TODAS" ? "GERAL" : regional}</div>
      <div class="dashboard-kpi-rodape">Escopo regional ativo</div>
    </div>

    <div class="dashboard-card dashboard-kpi verde span-3">
      <span class="dashboard-kpi-label">Lojas no escopo</span>
      <div class="dashboard-kpi-valor">${totalLojas}</div>
      <div class="dashboard-kpi-rodape">Quantidade de lojas filtradas</div>
    </div>

    <div class="dashboard-card dashboard-kpi laranja span-3">
      <span class="dashboard-kpi-label">Cobertura</span>
      <div class="dashboard-kpi-valor">${formatarNumeroDashboard(cobertura, 1)}%</div>
      <div class="dashboard-kpi-rodape">Lojas com preenchimento na semana</div>
    </div>

    <div class="dashboard-card dashboard-kpi roxo span-3">
      <span class="dashboard-kpi-label">Média regional</span>
      <div class="dashboard-kpi-valor">${formatarValorDashboard(mediaValorSemana, tipoValorPrincipal)}</div>
      <div class="dashboard-kpi-rodape">
        ${
          mediaValor2Semana
            ? `2º valor: ${formatarValorDashboard(mediaValor2Semana, tipoValorSecundario)}`
            : "Valor principal consolidado"
        }
      </div>
    </div>
  `;
}

// ==========================
// 📈 RENDERIZAR GRÁFICOS
// ==========================
function renderGraficosDashboard({
  evolucao,
  ranking,
  resumoClasses,
  tipoRanking,
  tipoValorPrincipal,
  tipoValorSecundario
}) {
  console.log("📈 Renderizando gráficos do dashboard...", {
    tipoRanking,
    evolucaoQtd: evolucao?.length,
    rankingQtd: ranking?.length,
    classesQtd: resumoClasses?.length
  });

  if (!chartJsDisponivel()) return;

  requestAnimationFrame(() => {
    try {
      renderGraficoEvolucaoDashboard(evolucao, tipoValorPrincipal, tipoValorSecundario);
      renderGraficoRankingDashboard(ranking, tipoRanking, tipoValorPrincipal, tipoValorSecundario);
      renderGraficoClassesDashboard(resumoClasses);
    } catch (erro) {
      console.error("❌ Erro ao renderizar gráficos do dashboard:", erro);
    }
  });
}

// ==========================
// 📈 GRÁFICO DE EVOLUÇÃO
// ==========================
function renderGraficoEvolucaoDashboard(evolucao, tipoValorPrincipal, tipoValorSecundario) {
  const canvas = document.getElementById("graficoEvolucao");
  if (!canvas) {
    console.warn("⚠️ Canvas graficoEvolucao não encontrado");
    return;
  }

  const labels = evolucao.map((item) => `Sem ${item.semana}`);
  const dadosValor = evolucao.map((item) => Number(item.mediaValor || 0));
  const dadosValor2 = evolucao.map((item) => Number(item.mediaValor2 || 0));

  const temValor2 = dadosValor2.some((v) => v !== 0);

  console.log("📈 Dados gráfico evolução:", {
    labels,
    dadosValor,
    dadosValor2,
    temValor2
  });

  if (window.dashboardCharts.evolucao) {
    window.dashboardCharts.evolucao.destroy();
  }

  const datasets = [
    {
      label: `Valor principal (${tipoValorPrincipal})`,
      data: dadosValor,
      borderColor: "#1e6091",
      backgroundColor: "rgba(30, 96, 145, 0.15)",
      borderWidth: 3,
      tension: 0.35,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 5
    }
  ];

  if (temValor2) {
    datasets.push({
      label: `Valor 2 (${tipoValorSecundario})`,
      data: dadosValor2,
      borderColor: "#4CAF50",
      backgroundColor: "rgba(76, 175, 80, 0.15)",
      borderWidth: 2,
      tension: 0.35,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 4
    });
  }

  window.dashboardCharts.evolucao = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          mode: "index",
          intersect: false
        }
      },
      interaction: {
        mode: "nearest",
        intersect: false
      },
      scales: {
        x: {
          ticks: {
            color: "#5a6872"
          },
          grid: {
            color: "rgba(10, 61, 98, 0.06)"
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#5a6872"
          },
          grid: {
            color: "rgba(10, 61, 98, 0.06)"
          }
        }
      }
    }
  });
}

// ==========================
// 🏆 GRÁFICO DE RANKING
// ==========================
function renderGraficoRankingDashboard(ranking, tipoRanking, tipoValorPrincipal, tipoValorSecundario) {
  const canvas = document.getElementById("graficoRanking");
  if (!canvas) {
    console.warn("⚠️ Canvas graficoRanking não encontrado");
    return;
  }

  if (window.dashboardCharts.ranking) {
    window.dashboardCharts.ranking.destroy();
  }

  let labels = [];
  let datasets = [];

  if (tipoRanking === "lojas") {
    labels = ranking.map((item) => item.loja);

    const dadosValor = ranking.map((item) => Number(item.mediaValor || 0));
    const dadosValor2 = ranking.map((item) => Number(item.mediaValor2 || 0));
    const temValor2 = dadosValor2.some((v) => v !== 0);

    console.log("🏆 Dados gráfico ranking lojas:", {
      labels,
      dadosValor,
      dadosValor2,
      temValor2
    });

    datasets = [
      {
        label: `Média valor (${tipoValorPrincipal})`,
        data: dadosValor,
        backgroundColor: "rgba(30, 96, 145, 0.75)",
        borderColor: "#1e6091",
        borderWidth: 1,
        borderRadius: 8
      }
    ];

    if (temValor2) {
      datasets.push({
        label: `Média valor 2 (${tipoValorSecundario})`,
        data: dadosValor2,
        backgroundColor: "rgba(76, 175, 80, 0.75)",
        borderColor: "#4CAF50",
        borderWidth: 1,
        borderRadius: 8
      });
    }
  } else {
    labels = ranking.map((item) => item.indicador);
    const dados = ranking.map((item) => Number(item.qtd || 0));

    console.log("🏆 Dados gráfico ranking indicadores:", {
      labels,
      dados
    });

    datasets = [
      {
        label: "Quantidade de registros",
        data: dados,
        backgroundColor: "rgba(156, 39, 176, 0.75)",
        borderColor: "#9C27B0",
        borderWidth: 1,
        borderRadius: 8
      }
    ];
  }

  window.dashboardCharts.ranking = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: "#5a6872"
          },
          grid: {
            color: "rgba(10, 61, 98, 0.06)"
          }
        },
        y: {
          ticks: {
            color: "#5a6872"
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// ==========================
// 🧩 GRÁFICO RESUMO POR CLASSE
// ==========================
function renderGraficoClassesDashboard(resumoClasses) {
  const canvas = document.getElementById("graficoClasses");
  if (!canvas) {
    console.warn("⚠️ Canvas graficoClasses não encontrado");
    return;
  }

  if (window.dashboardCharts.classes) {
    window.dashboardCharts.classes.destroy();
  }

  const labels = resumoClasses.map((item) => item.classe);
  const dados = resumoClasses.map((item) => Number(item.qtd || 0));

  console.log("🧩 Dados gráfico classes:", {
    labels,
    dados
  });

  window.dashboardCharts.classes = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: dados,
          backgroundColor: [
            "#1e6091",
            "#4CAF50",
            "#FF9800",
            "#9C27B0",
            "#F44336",
            "#00BCD4"
          ],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// ==========================
// 🖥️ ABRIR DASHBOARD TELA CHEIA
// ==========================
async function abrirDashboardTelaCheia() {
  const container = document.getElementById("dashboardContainer");

  if (!container) {
    console.error("❌ dashboardContainer não encontrado");
    return;
  }

  try {
    console.log("🖥️ Entrando em modo apresentação...");

    window.dashboardModoApresentacao = true;
    container.classList.add("modo-apresentacao");

    if (typeof pausarTimerInatividade === "function") {
      pausarTimerInatividade();
    }

    if (container.requestFullscreen) {
      await container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      await container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      await container.msRequestFullscreen();
    } else {
      console.warn("⚠️ Fullscreen não suportado neste navegador");
    }

    console.log("✅ Dashboard em tela cheia");
  } catch (erro) {
    console.error("❌ Erro ao abrir dashboard em tela cheia:", erro);

    window.dashboardModoApresentacao = false;
    container.classList.remove("modo-apresentacao");

    if (typeof retomarTimerInatividade === "function") {
      retomarTimerInatividade();
    }
  }
}

// ==========================
// 🚪 SAIR DA TELA CHEIA
// ==========================
async function sairDashboardTelaCheia() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }

    const container = document.getElementById("dashboardContainer");
    if (container) container.classList.remove("modo-apresentacao");

    window.dashboardModoApresentacao = false;

    if (typeof retomarTimerInatividade === "function") {
      retomarTimerInatividade();
    }

    console.log("↩ Dashboard saiu do modo apresentação");
  } catch (erro) {
    console.error("❌ Erro ao sair da tela cheia:", erro);
  }
}

// ==========================
// 👀 OUVIR SAÍDA DO FULLSCREEN
// ==========================
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    const container = document.getElementById("dashboardContainer");
    if (container) container.classList.remove("modo-apresentacao");

    if (window.dashboardModoApresentacao) {
      console.log("ℹ️ Fullscreen encerrado - retomando timer");
    }

    window.dashboardModoApresentacao = false;

    if (typeof retomarTimerInatividade === "function") {
      retomarTimerInatividade();
    }
  }
});