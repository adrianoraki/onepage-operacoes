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
  loja: "TODAS",
};

const LIMITE_RANKING_DASHBOARD = 12;

// ==========================
// 📈 INSTÂNCIAS DOS GRÁFICOS
// ==========================
window.dashboardCharts = window.dashboardCharts || {
  evolucao: null,
  ranking: null,
  classes: null,
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
  if (!isFinite(numero)) return "-";

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function calcularMediaDashboard(lista = []) {
  const numeros = (lista || []).map((v) => Number(v)).filter((v) => !isNaN(v));

  if (!numeros.length) return 0;

  return numeros.reduce((a, b) => a + b, 0) / numeros.length;
}

function getChaveLojaDashboard(loja) {
  return `${loja.codigo} - ${loja.nome}`;
}

function gerarJanelaSemanasDashboard(semanaBase) {
  const atual = parseInt(semanaBase || getSemanaAtual(), 10);

  const lista = [atual - 3, atual - 2, atual - 1, atual].map((s) =>
    s <= 0 ? 52 + s : s,
  );

  return lista.map((s) => s.toString().padStart(2, "0"));
}

// ==========================
// 🎯 HELPERS DE EXIBIÇÃO KPI
// ==========================
function tipoPercentualDashboard(tipo) {
  const tipoNorm = normalizarTextoDashboardLower(tipo);
  return (
    tipoNorm.includes("percent") ||
    tipoNorm.includes("porcent") ||
    tipoNorm === "%"
  );
}

function formatarKpiDashboard(valor, { percentual = false, casas = 2 } = {}) {
  const numero = Number(valor);
  if (!isFinite(numero)) return "-";

  const texto = formatarNumeroDashboard(numero, casas);
  return percentual ? `${texto}%` : texto;
}

// ==========================
// 🏬 QUEBRAR NOME DA LOJA
// ex.: "119 - Camaragibe" => código + nome
// ==========================
function quebrarNomeLojaDashboard(loja) {
  const texto = normalizarTextoDashboard(loja);

  if (!texto.includes("-")) {
    return {
      codigo: "",
      nome: texto || "-",
    };
  }

  const partes = texto.split("-");
  const codigo = normalizarTextoDashboard(partes.shift());
  const nome = normalizarTextoDashboard(partes.join("-"));

  return {
    codigo,
    nome: nome || texto,
  };
}

// ==========================
// 📉 REGRA DE MELHOR RESULTADO
// para % => menor é melhor
// para demais => usa ordem do ranking/config
// ==========================
function menorEhMelhorDashboard(tipoValorPrincipal) {
  if (tipoPercentualDashboard(tipoValorPrincipal)) return true;

  if (DASHBOARD_STATE.indicador && DASHBOARD_STATE.indicador !== "TODOS") {
    const ordem = getOrdemRankingDashboard(
      DASHBOARD_STATE.indicador,
      DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe,
    );

    return ordem === "asc";
  }

  return false;
}

// ==========================
// 📅 SEMANA POR DATA
// ==========================
function getNumeroSemanaPorDataDashboard(data) {
  const hoje = new Date(data);
  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
  const dias = Math.floor((hoje - inicioAno) / (24 * 60 * 60 * 1000));
  const semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);

  return semana;
}

// ==========================
// 📆 SEMANAS DO MÊS VIGENTE
// ==========================
function getSemanasMesVigenteDashboard() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const semanasSet = new Set();

  for (
    let d = new Date(primeiroDia);
    d <= ultimoDia;
    d.setDate(d.getDate() + 1)
  ) {
    semanasSet.add(
      getNumeroSemanaPorDataDashboard(d).toString().padStart(2, "0"),
    );
  }

  return [...semanasSet];
}

// ==========================
// 📆 PRIMEIRA E ÚLTIMA SEMANA DO MÊS VIGENTE
// ==========================
function getPrimeiraEUltimaSemanaMesVigenteDashboard() {
  const semanas = getSemanasMesVigenteDashboard();

  return {
    primeira: semanas[0] || null,
    ultima: semanas[semanas.length - 1] || null,
    lista: semanas,
    descricao: "mês vigente",
  };
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

function getCampoDashboard(
  indicador,
  campoKey = "valor",
  classeSelecionada = null,
) {
  if (typeof getCampoConfig === "function") {
    return getCampoConfig(indicador, campoKey, classeSelecionada);
  }

  return {
    key: campoKey,
    label: campoKey === "valor2" ? "Valor 2" : "Resultado",
    tipo: "numero",
  };
}

function getTipoCampoDashboard(
  indicador,
  campoKey = "valor",
  classeSelecionada = null,
) {
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

  return [
    "Auditoria",
    "Frente de Caixa",
    "Operações",
    "Prevenção",
    "RH / Operacional",
  ];
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
          classe: nomeClasse,
        });
      });
    });

    return lista;
  }

  const itens = classesIndicadores?.[classe] || [];

  return itens.map((item) => ({
    nome: item.nome || item,
    valor: item.valor || item,
    classe,
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
    console.error(
      "❌ Chart.js não encontrado. Adicione o script no index.html",
    );
  }
  return ok;
}

// ==========================
// 📏 AJUSTAR ALTURA DO CHART BOX
// ==========================
function ajustarAlturaChartBox(
  canvasId,
  quantidade,
  { minimo = 220, maximo = 420, pxPorItem = 28 } = {},
) {
  try {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.parentElement) return;

    const alturaCalculada = Math.max(
      minimo,
      Math.min(maximo, quantidade * pxPorItem),
    );

    canvas.parentElement.style.height = `${alturaCalculada}px`;
  } catch (erro) {
    console.warn(
      "⚠️ Não foi possível ajustar altura do gráfico:",
      canvasId,
      erro,
    );
  }
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

  // ✅ sem botão de troca de visão: segue o contexto do usuário
  DASHBOARD_STATE.visao = contexto.visao || "regional";

  if (contexto.escopo?.regional) {
    DASHBOARD_STATE.regional = contexto.escopo.regional;
  }

  if (contexto.escopo?.loja) {
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

          <select id="dashClasse" onchange="dashboardAlterarClasse(this.value)">
            ${gerarOptionsClassesDashboard()}
          </select>

          <select id="dashIndicador" onchange="dashboardAlterarIndicador(this.value)">
            ${gerarOptionsIndicadoresDashboard()}
          </select>

          ${
            DASHBOARD_STATE.visao === "regional"
              ? `
                <select id="dashRegional" onchange="dashboardAlterarRegional(this.value)">
                  <option value="TODAS">Todas regionais</option>
                  <option value="NE1" ${
                    DASHBOARD_STATE.regional === "NE1" ? "selected" : ""
                  }>NE1</option>
                  <option value="NE2" ${
                    DASHBOARD_STATE.regional === "NE2" ? "selected" : ""
                  }>NE2</option>
                </select>
              `
              : ""
          }

          ${
            DASHBOARD_STATE.visao === "gerencial"
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
    html += `<option value="${classe}" ${
      DASHBOARD_STATE.classe === classe ? "selected" : ""
    }>${classe}</option>`;
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
    html += `<option value="${item.valor}" ${
      DASHBOARD_STATE.indicador === item.valor ? "selected" : ""
    }>${item.nome}</option>`;
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

// ==========================
// 🔁 Compatibilidade: botão removido da UI
// ==========================
async function dashboardAlterarVisao(visao) {
  console.log(
    "ℹ️ dashboardAlterarVisao chamado, mas seletor foi removido:",
    visao,
  );
  DASHBOARD_STATE.visao = visao || DASHBOARD_STATE.visao;
  await telaDashboard();
}

// ==========================
// 🎯 ESCOPO BASE
// ==========================
function aplicarEscopoBaseLojasDashboard(lojas, contexto) {
  let lista = [...(lojas || [])];

  if (!contexto) return lista;

  if (DASHBOARD_STATE.visao === "regional") {
    if (contexto.escopo?.regional) {
      lista = lista.filter(
        (l) =>
          normalizarTextoDashboardUpper(l.regional) ===
          normalizarTextoDashboardUpper(contexto.escopo.regional),
      );
    }

    return lista;
  }

  if (contexto.escopo?.loja) {
    return lista.filter(
      (l) => getChaveLojaDashboard(l) === contexto.escopo.loja,
    );
  }

  return lista;
}

// ==========================
// 🎛 APLICAR FILTROS VISUAIS
// ==========================
function aplicarFiltrosVisuaisLojasDashboard(lojas) {
  let lista = [...(lojas || [])];

  if (DASHBOARD_STATE.visao === "regional") {
    if (DASHBOARD_STATE.regional !== "TODAS") {
      lista = lista.filter(
        (l) =>
          normalizarTextoDashboardUpper(l.regional) ===
          normalizarTextoDashboardUpper(DASHBOARD_STATE.regional),
      );
    }

    return lista;
  }

  if (DASHBOARD_STATE.loja && DASHBOARD_STATE.loja !== "TODAS") {
    return lista.filter(
      (l) => getChaveLojaDashboard(l) === DASHBOARD_STATE.loja,
    );
  }

  return lista;
}

// ==========================
// 🧠 BUSCAR RESULTADOS COM FALLBACK
// ==========================
async function buscarResultadosDashboard(queryBaseBuilder, lojasBaseSet) {
  let semanasInfo = getPrimeiraEUltimaSemanaMesVigenteDashboard();
  let semanasConsulta = semanasInfo.lista;

  const queryMes = queryBaseBuilder().in("semana", semanasConsulta);
  const { data: resultadosMes, error: erroMes } = await queryMes;
  if (erroMes) throw erroMes;

  let resultadosEscopoBase = (resultadosMes || []).filter((r) =>
    lojasBaseSet.has(r.loja),
  );

  if (resultadosEscopoBase.length) {
    return {
      semanasInfo,
      semanasConsulta,
      resultadosEscopoBase,
      usandoFallback: false,
    };
  }

  semanasConsulta = gerarJanelaSemanasDashboard(DASHBOARD_STATE.semana);
  semanasInfo = {
    primeira: semanasConsulta[0] || null,
    ultima: semanasConsulta[semanasConsulta.length - 1] || null,
    lista: semanasConsulta,
    descricao: "últimas 4 semanas",
  };

  const queryFallback = queryBaseBuilder().in("semana", semanasConsulta);
  const { data: resultadosFallback, error: erroFallback } = await queryFallback;
  if (erroFallback) throw erroFallback;

  resultadosEscopoBase = (resultadosFallback || []).filter((r) =>
    lojasBaseSet.has(r.loja),
  );

  return {
    semanasInfo,
    semanasConsulta,
    resultadosEscopoBase,
    usandoFallback: true,
  };
}

// ==========================
// 🧠 CARREGAR DADOS DO DASHBOARD
// ==========================
async function carregarDadosDashboard(contexto) {
  console.log("🚀 Carregando dados do dashboard...", {
    estado: DASHBOARD_STATE,
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

    const lojasEscopoBase = aplicarEscopoBaseLojasDashboard(
      lojasData || [],
      contexto,
    );
    const lojasVisuais = aplicarFiltrosVisuaisLojasDashboard(lojasEscopoBase);

    const lojasBaseSet = new Set(
      lojasEscopoBase.map((l) => getChaveLojaDashboard(l)),
    );
    const lojasVisuaisSet = new Set(
      lojasVisuais.map((l) => getChaveLojaDashboard(l)),
    );

    const montarQueryBase = () => {
      let query = window.db.from("resultados").select("*");

      if (DASHBOARD_STATE.classe !== "TODAS") {
        query = query.eq("classe", DASHBOARD_STATE.classe);
      }

      if (DASHBOARD_STATE.indicador !== "TODOS") {
        const indicadorBanco = getIndicadorBancoDashboard(
          DASHBOARD_STATE.indicador,
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe,
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
    } = await buscarResultadosDashboard(montarQueryBase, lojasBaseSet);

    const resultadosVisuais = resultadosEscopoBase.filter((r) =>
      lojasVisuaisSet.has(r.loja),
    );

    console.log("🏬 Lojas escopo base:", lojasEscopoBase.length);
    console.log("🏬 Lojas visuais:", lojasVisuais.length);
    console.log("📊 Resultados escopo base:", resultadosEscopoBase.length);
    console.log("📊 Resultados visuais:", resultadosVisuais.length);
    console.log("📆 Período usado:", semanasInfo);

    if (DASHBOARD_STATE.visao === "gerencial") {
      await renderDashboardGerencial({
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
      await renderDashboardRegional({
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
}

// ==========================
// 📦 AGRUPADORES BI
// ==========================
function agruparIndicadoresPorMediaDashboard(resultadosMes) {
  const mapa = {};

  resultadosMes.forEach((r) => {
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

  return Object.values(mapa)
    .map((item) => ({
      indicador: item.indicador,
      mediaValor: calcularMediaDashboard(item.valores),
      mediaValor2: calcularMediaDashboard(item.valores2),
    }))
    .sort((a, b) => b.mediaValor - a.mediaValor)
    .slice(0, LIMITE_RANKING_DASHBOARD);
}

// ==========================
// 🧩 RESUMO POR CLASSE
// ==========================
// ==========================
// 🧩 RESUMO POR CLASSE
// força todas as classes mesmo sem dado
// ==========================
function agruparClassesDashboard(resultadosMes) {
  const classesBase = getClassesDashboardDisponiveis();

  const mapa = {};

  classesBase.forEach((classe) => {
    mapa[classe] = {
      classe,
      valores: [],
      qtd: 0,
    };
  });

  resultadosMes.forEach((r) => {
    if (!mapa[r.classe]) {
      mapa[r.classe] = {
        classe: r.classe,
        valores: [],
        qtd: 0,
      };
    }

    mapa[r.classe].valores.push(Number(r.valor));
    mapa[r.classe].qtd += 1;
  });

  return Object.values(mapa).map((item) => ({
    classe: item.classe,
    qtd: item.qtd,
    mediaValor: item.qtd ? calcularMediaDashboard(item.valores) : 0,
  }));
}

// ==========================
// 🏆 AGRUPAR RANKING DE LOJAS
// média = (primeira semana + última semana) / 2
// ==========================
function agruparLojasRankingDashboard(resultadosMes, semanasMesInfo) {
  const mapa = {};

  resultadosMes.forEach((r) => {
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
    const mediaPrimeira = calcularMediaDashboard(item.primeiraSemanaValores);
    const mediaUltima = calcularMediaDashboard(item.ultimaSemanaValores);

    const mediaPrimeira2 = calcularMediaDashboard(item.primeiraSemanaValores2);
    const mediaUltima2 = calcularMediaDashboard(item.ultimaSemanaValores2);

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

  const ordem =
    DASHBOARD_STATE.indicador !== "TODOS"
      ? getOrdemRankingDashboard(
          DASHBOARD_STATE.indicador,
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe,
        )
      : "desc";

  lista.sort((a, b) => {
    if (ordem === "asc") return a.mediaValor - b.mediaValor;
    return b.mediaValor - a.mediaValor;
  });

  return lista
    .filter((item) => !isNaN(item.mediaValor))
    .slice(0, LIMITE_RANKING_DASHBOARD);
}

// ==========================
// 🏆 MELHOR E PIOR LOJA DO ESCOPO
// respeita regra de % = menor melhor
// ==========================
function calcularMelhorEPiorLojaDashboard(resultadosMes, tipoValorPrincipal) {
  const mapa = {};

  resultadosMes.forEach((r) => {
    if (!mapa[r.loja]) {
      mapa[r.loja] = [];
    }
    mapa[r.loja].push(Number(r.valor));
  });

  const lista = Object.entries(mapa).map(([loja, valores]) => ({
    loja,
    media: calcularMediaDashboard(valores),
  }));

  if (!lista.length) {
    return {
      melhor: null,
      pior: null,
    };
  }

  const menorMelhor = menorEhMelhorDashboard(tipoValorPrincipal);

  const ordenado = [...lista].sort((a, b) => {
    if (menorMelhor) return a.media - b.media;
    return b.media - a.media;
  });

  return {
    melhor: ordenado[0] || null,
    pior: ordenado[ordenado.length - 1] || null,
  };
}

// ==========================
// 🌍 MÉDIA POR REGIONAL
// ==========================
function calcularMediaPorRegionalDashboard(
  resultadosMes,
  lojasEscopoBase,
  regional,
) {
  const lojasRegional = new Set(
    (lojasEscopoBase || [])
      .filter(
        (l) =>
          normalizarTextoDashboardUpper(l.regional) ===
          normalizarTextoDashboardUpper(regional),
      )
      .map((l) => getChaveLojaDashboard(l)),
  );

  const dadosRegional = (resultadosMes || []).filter((r) =>
    lojasRegional.has(r.loja),
  );

  return calcularMediaDashboard(dadosRegional.map((r) => r.valor));
}

// ==========================
// 🌍 MÉDIA PRIMEIRA/ÚLTIMA/MENSAL
// ==========================
function calcularMediasMensaisDashboard(resultadosMes, semanasMesInfo) {
  const primeiraSemana = resultadosMes.filter(
    (r) => String(r.semana) === String(semanasMesInfo.primeira),
  );

  const ultimaSemana = resultadosMes.filter(
    (r) => String(r.semana) === String(semanasMesInfo.ultima),
  );

  const mediaPrimeira = calcularMediaDashboard(
    primeiraSemana.map((r) => r.valor),
  );
  const mediaUltima = calcularMediaDashboard(ultimaSemana.map((r) => r.valor));

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
}

// ==========================
// 📊 VISÃO GERENCIAL
// ==========================
async function renderDashboardGerencial({
  contexto,
  lojas,
  lojasEscopoBase,
  resultados,
  semanasJanela,
  semanasMesInfo,
  usandoFallback,
}) {
  console.log("🏪 Renderizando visão gerencial...");

  const alvo = document.getElementById("dashboardConteudo");
  if (!alvo) return;

  popularSelectLojasDashboard(lojasEscopoBase);

  const resultadosMes = resultados;

  const evolucao = semanasJanela.map((semana) => {
    const dadosSemana = resultadosMes.filter(
      (r) => String(r.semana) === String(semana),
    );

    return {
      semana,
      registros: dadosSemana.length,
      mediaValor: calcularMediaDashboard(dadosSemana.map((r) => r.valor)),
      mediaValor2: calcularMediaDashboard(dadosSemana.map((r) => r.valor2)),
    };
  });

  const rankingIndicadores = agruparIndicadoresPorMediaDashboard(resultadosMes);
  const resumoClasses = agruparClassesDashboard(resultadosMes);

  const mediasMensais = calcularMediasMensaisDashboard(
    resultadosMes,
    semanasMesInfo,
  );

  const tipoValorPrincipal =
    DASHBOARD_STATE.indicador !== "TODOS"
      ? getTipoCampoDashboard(
          DASHBOARD_STATE.indicador,
          "valor",
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe,
        )
      : "numero";

  const tipoValorSecundario =
    DASHBOARD_STATE.indicador !== "TODOS"
      ? getTipoCampoDashboard(
          DASHBOARD_STATE.indicador,
          "valor2",
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe,
        )
      : "numero";

  const tituloLoja =
    lojas.length === 1
      ? getChaveLojaDashboard(lojas[0])
      : contexto?.escopo?.loja || "Visão Gerencial";

  alvo.innerHTML = `
    ${renderKPIsGerenciais({
      tituloLoja,
      totalLojas: lojas.length,
      mediaPrimeira: mediasMensais.mediaPrimeira,
      mediaUltima: mediasMensais.mediaUltima,
      mediaMensal: mediasMensais.mediaMensal,
      tipoValorPrincipal,
      descricaoPeriodo: semanasMesInfo.descricao,
    })}

    <div class="dashboard-card dashboard-grafico span-6">
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

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Ranking por indicador</span>
        <span class="dashboard-card-subtitulo">Top ${LIMITE_RANKING_DASHBOARD} indicadores pela média do valor principal</span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoRanking"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico dashboard-grafico-resumo span-12">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Resumo por classe</span>
        <span class="dashboard-card-subtitulo dashboard-card-subtitulo-info">
          Média do valor principal por classe
          <span
            class="dashboard-info-tip"
            title="Este gráfico mostra a média consolidada do valor principal em cada classe, considerando o filtro e o período selecionados. Ele ajuda a identificar quais áreas estão performando melhor ou pior no conjunto dos indicadores."
          >ⓘ</span>
        </span>
      </div>
      <div class="dashboard-chart-box dashboard-chart-box-pequeno dashboard-chart-box-resumo">
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
    tipoValorSecundario,
  });
}

// ==========================
// 🌍 VISÃO REGIONAL
// ==========================
async function renderDashboardRegional({
  lojasEscopoBase,
  resultados,
  resultadosEscopoBase,
  semanasJanela,
  semanasMesInfo,
  usandoFallback,
}) {
  console.log("🌍 Renderizando visão regional...");

  const alvo = document.getElementById("dashboardConteudo");
  if (!alvo) return;

  const resultadosMes = resultados;
  const resultadosEscopoCompleto = resultadosEscopoBase;

  const evolucao = semanasJanela.map((semana) => {
    const dadosSemana = resultadosMes.filter(
      (r) => String(r.semana) === String(semana),
    );

    return {
      semana,
      registros: dadosSemana.length,
      mediaValor: calcularMediaDashboard(dadosSemana.map((r) => r.valor)),
      mediaValor2: calcularMediaDashboard(dadosSemana.map((r) => r.valor2)),
    };
  });

  const rankingLojas = agruparLojasRankingDashboard(
    resultadosMes,
    semanasMesInfo,
  );
  const resumoClasses = agruparClassesDashboard(resultadosMes);

  const tipoValorPrincipal =
    DASHBOARD_STATE.indicador !== "TODOS"
      ? getTipoCampoDashboard(
          DASHBOARD_STATE.indicador,
          "valor",
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe,
        )
      : "numero";

  const tipoValorSecundario =
    DASHBOARD_STATE.indicador !== "TODOS"
      ? getTipoCampoDashboard(
          DASHBOARD_STATE.indicador,
          "valor2",
          DASHBOARD_STATE.classe === "TODAS" ? null : DASHBOARD_STATE.classe,
        )
      : "numero";

  const melhorPior = calcularMelhorEPiorLojaDashboard(
    resultadosEscopoCompleto,
    tipoValorPrincipal,
  );

  const mediaNE1 = calcularMediaPorRegionalDashboard(
    resultadosEscopoCompleto,
    lojasEscopoBase,
    "NE1",
  );
  const mediaNE2 = calcularMediaPorRegionalDashboard(
    resultadosEscopoCompleto,
    lojasEscopoBase,
    "NE2",
  );

  alvo.innerHTML = `
    ${renderKPIsRegionais({
      melhor: melhorPior.melhor,
      pior: melhorPior.pior,
      mediaNE1,
      mediaNE2,
      tipoValorPrincipal,
    })}

    <div class="dashboard-card dashboard-grafico span-6">
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

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Ranking de lojas</span>
        <span class="dashboard-card-subtitulo">Média = 1ª semana + última semana do período / 2</span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoRanking"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico dashboard-grafico-resumo span-12">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Resumo por classe</span>
        <span class="dashboard-card-subtitulo dashboard-card-subtitulo-info">
          Média do valor principal por classe
          <span
            class="dashboard-info-tip"
            title="Este gráfico mostra a média consolidada do valor principal em cada classe, considerando o filtro e o período selecionados. Ele ajuda a identificar quais áreas estão performando melhor ou pior no conjunto dos indicadores."
          >ⓘ</span>
        </span>
      </div>
      <div class="dashboard-chart-box dashboard-chart-box-pequeno dashboard-chart-box-resumo">
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
    tipoValorSecundario,
  });
}

// ==========================
// 🏬 POPULAR SELECT DE LOJAS
// ==========================
function popularSelectLojasDashboard(lojas) {
  const select = document.getElementById("dashLoja");
  if (!select) return;

  let html = `<option value="TODAS">Todas as lojas</option>`;

  (lojas || []).forEach((loja) => {
    const chave = getChaveLojaDashboard(loja);
    html += `<option value="${chave}" ${
      DASHBOARD_STATE.loja === chave ? "selected" : ""
    }>${chave}</option>`;
  });

  select.innerHTML = html;
}

// ==========================
// 🔢 RENDER KPIs GERENCIAIS
// ==========================
function renderKPIsGerenciais({
  tituloLoja,
  totalLojas,
  mediaPrimeira,
  mediaUltima,
  mediaMensal,
  tipoValorPrincipal,
  descricaoPeriodo,
}) {
  const isPercentual = tipoPercentualDashboard(tipoValorPrincipal);

  return `
    <div class="dashboard-card dashboard-kpi azul span-3">
      <span class="dashboard-kpi-label">Loja / Escopo</span>
      <div class="dashboard-kpi-valor">${totalLojas}</div>
      <div class="dashboard-kpi-rodape">${tituloLoja}</div>
    </div>

    <div class="dashboard-card dashboard-kpi verde span-3">
      <span class="dashboard-kpi-label">Média 1ª semana</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiDashboard(mediaPrimeira, { percentual: isPercentual, casas: 2 })}
      </div>
      <div class="dashboard-kpi-rodape">Primeira semana do ${descricaoPeriodo}</div>
    </div>

    <div class="dashboard-card dashboard-kpi laranja span-3">
      <span class="dashboard-kpi-label">Média última semana</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiDashboard(mediaUltima, { percentual: isPercentual, casas: 2 })}
      </div>
      <div class="dashboard-kpi-rodape">Última semana do ${descricaoPeriodo}</div>
    </div>

    <div class="dashboard-card dashboard-kpi roxo span-3">
      <span class="dashboard-kpi-label">Média mensal</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiDashboard(mediaMensal, { percentual: isPercentual, casas: 2 })}
      </div>
      <div class="dashboard-kpi-rodape">(1ª semana + última semana) / 2</div>
    </div>
  `;
}

// ==========================
// 🔢 RENDER KPIs REGIONAIS
// ==========================
function renderKPIsRegionais({
  melhor,
  pior,
  mediaNE1,
  mediaNE2,
  tipoValorPrincipal,
}) {
  const isPercentual = tipoPercentualDashboard(tipoValorPrincipal);

  const melhorLoja = quebrarNomeLojaDashboard(melhor?.loja || "");
  const piorLoja = quebrarNomeLojaDashboard(pior?.loja || "");

  return `
    <div class="dashboard-card dashboard-kpi azul span-3">
      <span class="dashboard-kpi-label">Top Melhor Loja Regional</span>

      <div class="dashboard-kpi-loja">
        <span class="dashboard-kpi-loja-codigo">${melhorLoja.codigo || "--"}</span>
        <span class="dashboard-kpi-loja-separador">—</span>
        <span class="dashboard-kpi-loja-nome">${melhorLoja.nome || "-"}</span>
      </div>

      <div class="dashboard-kpi-rodape dashboard-kpi-rodape-destaque positivo">
        ${
          melhor
            ? `Resultado: ${formatarKpiDashboard(melhor.media, {
                percentual: isPercentual,
                casas: 2,
              })}`
            : "Sem dados suficientes"
        }
      </div>
    </div>

    <div class="dashboard-card dashboard-kpi verde span-3">
      <span class="dashboard-kpi-label">Pior Loja</span>

      <div class="dashboard-kpi-loja">
        <span class="dashboard-kpi-loja-codigo">${piorLoja.codigo || "--"}</span>
        <span class="dashboard-kpi-loja-separador">—</span>
        <span class="dashboard-kpi-loja-nome">${piorLoja.nome || "-"}</span>
      </div>

      <div class="dashboard-kpi-rodape dashboard-kpi-rodape-destaque negativo">
        ${
          pior
            ? `Resultado: ${formatarKpiDashboard(pior.media, {
                percentual: isPercentual,
                casas: 2,
              })}`
            : "Sem dados suficientes"
        }
      </div>
    </div>

    <div class="dashboard-card dashboard-kpi laranja span-3">
      <span class="dashboard-kpi-label">Média NE1</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiDashboard(mediaNE1, { percentual: true, casas: 2 })}
      </div>
      <div class="dashboard-kpi-rodape">Consolidado da regional NE1</div>
    </div>

    <div class="dashboard-card dashboard-kpi roxo span-3">
      <span class="dashboard-kpi-label">Média NE2</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiDashboard(mediaNE2, { percentual: true, casas: 2 })}
      </div>
      <div class="dashboard-kpi-rodape">Consolidado da regional NE2</div>
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
  tipoValorSecundario,
}) {
  console.log("📈 Renderizando gráficos do dashboard...", {
    tipoRanking,
    evolucaoQtd: evolucao?.length,
    rankingQtd: ranking?.length,
    classesQtd: resumoClasses?.length,
  });

  if (!chartJsDisponivel()) return;

  requestAnimationFrame(() => {
    try {
      renderGraficoEvolucaoDashboard(
        evolucao,
        tipoValorPrincipal,
        tipoValorSecundario,
      );
      renderGraficoRankingDashboard(
        ranking,
        tipoRanking,
        tipoValorPrincipal,
        tipoValorSecundario,
      );
      renderGraficoClassesDashboard(resumoClasses);
    } catch (erro) {
      console.error("❌ Erro ao renderizar gráficos do dashboard:", erro);
    }
  });
}

// ==========================
// 📈 GRÁFICO DE EVOLUÇÃO
// ==========================
function renderGraficoEvolucaoDashboard(
  evolucao,
  tipoValorPrincipal,
  tipoValorSecundario,
) {
  const canvas = document.getElementById("graficoEvolucao");
  if (!canvas) {
    console.warn("⚠️ Canvas graficoEvolucao não encontrado");
    return;
  }

  const labels = evolucao.map((item) => `Sem ${item.semana}`);
  const dadosValor = evolucao.map((item) => Number(item.mediaValor || 0));
  const dadosValor2 = evolucao.map((item) => Number(item.mediaValor2 || 0));

  const temValor2 = dadosValor2.some((v) => v !== 0);

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
      pointHoverRadius: 5,
    },
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
      pointHoverRadius: 4,
    });
  }

  window.dashboardCharts.evolucao = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      scales: {
        x: {
          ticks: {
            color: "#5a6872",
            font: {
              size: 11,
            },
          },
          grid: {
            color: "rgba(10, 61, 98, 0.06)",
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#5a6872",
            font: {
              size: 11,
            },
          },
          grid: {
            color: "rgba(10, 61, 98, 0.06)",
          },
        },
      },
    },
  });
}

// ==========================
// 🏆 GRÁFICO DE RANKING
// ==========================
function renderGraficoRankingDashboard(
  ranking,
  tipoRanking,
  tipoValorPrincipal,
  tipoValorSecundario,
) {
  const canvas = document.getElementById("graficoRanking");
  if (!canvas) {
    console.warn("⚠️ Canvas graficoRanking não encontrado");
    return;
  }

  if (window.dashboardCharts.ranking) {
    window.dashboardCharts.ranking.destroy();
  }

  ajustarAlturaChartBox("graficoRanking", ranking?.length || 0, {
    minimo: 220,
    maximo: 360,
    pxPorItem: 20,
  });

  let labels = [];
  let datasets = [];

  if (tipoRanking === "lojas") {
    labels = ranking.map((item) => item.loja);

    const dadosValor = ranking.map((item) => Number(item.mediaValor || 0));
    const dadosValor2 = ranking.map((item) => Number(item.mediaValor2 || 0));
    const temValor2 = dadosValor2.some((v) => v !== 0);

    datasets = [
      {
        label: `Média valor (${tipoValorPrincipal})`,
        data: dadosValor,
        backgroundColor: "rgba(30, 96, 145, 0.78)",
        borderColor: "#1e6091",
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 14,
        categoryPercentage: 0.82,
        barPercentage: 0.76,
      },
    ];

    if (temValor2) {
      datasets.push({
        label: `Média valor 2 (${tipoValorSecundario})`,
        data: dadosValor2,
        backgroundColor: "rgba(76, 175, 80, 0.78)",
        borderColor: "#4CAF50",
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 14,
        categoryPercentage: 0.82,
        barPercentage: 0.76,
      });
    }
  } else {
    labels = ranking.map((item) => item.indicador);
    const dados = ranking.map((item) => Number(item.mediaValor || 0));
    const dados2 = ranking.map((item) => Number(item.mediaValor2 || 0));
    const temValor2 = dados2.some((v) => v !== 0);

    datasets = [
      {
        label: `Média valor (${tipoValorPrincipal})`,
        data: dados,
        backgroundColor: "rgba(156, 39, 176, 0.78)",
        borderColor: "#9C27B0",
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 14,
        categoryPercentage: 0.82,
        barPercentage: 0.76,
      },
    ];

    if (temValor2) {
      datasets.push({
        label: `Média valor 2 (${tipoValorSecundario})`,
        data: dados2,
        backgroundColor: "rgba(76, 175, 80, 0.78)",
        borderColor: "#4CAF50",
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 14,
        categoryPercentage: 0.82,
        barPercentage: 0.76,
      });
    }
  }

  window.dashboardCharts.ranking = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              size: 10,
            },
            boxWidth: 14,
            boxHeight: 8,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: "#5a6872",
            font: {
              size: 10,
            },
          },
          grid: {
            color: "rgba(10, 61, 98, 0.06)",
          },
        },
        y: {
          ticks: {
            color: "#5a6872",
            font: {
              size: 10,
            },
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });
}


// ==========================
// 🧩 GRÁFICO RESUMO POR CLASSE
// compacto, próximo e legível
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

  // altura um pouco maior para não ficar miúdo
  ajustarAlturaChartBox("graficoClasses", resumoClasses?.length || 0, {
    minimo: 145,
    maximo: 210,
    pxPorItem: 22,
  });

  const labels = resumoClasses.map((item) => item.classe);
  const dados = resumoClasses.map((item) => Number(item.mediaValor || 0));

  window.dashboardCharts.classes = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Média por classe",
          data: dados,
          backgroundColor: [
            "#1e6091",
            "#4CAF50",
            "#FF9800",
            "#9C27B0",
            "#F44336",
            "#00BCD4",
          ],
          borderRadius: 6,
          maxBarThickness: 14,
          categoryPercentage: 1.0,
          barPercentage: 0.96,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Média: ${formatarNumeroDashboard(ctx.raw, 2)}`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: "#5a6872",
            font: {
              size: 12,
              weight: "600",
            },
          },
          grid: {
            color: "rgba(10, 61, 98, 0.06)",
          },
        },
        y: {
          offset: false,
          ticks: {
            color: "#5a6872",
            font: {
              size: 12,
              weight: "600",
            },
            padding: 4,
          },
          grid: {
            display: false,
          },
        },
      },
    },
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
