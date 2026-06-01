// ==========================
// 📈 ANALISES COM CHART.JS
// ==========================
console.log("✅ analise.js carregado");

// ==========================
// 🧠 ESTADO GLOBAL DAS ANALISES
// ==========================
const ANALISE_STATE = {
  semana:
    localStorage.getItem("semana") ||
    getSemanaAtual().toString().padStart(2, "0"),

  visao: "regional",
  classe: "TODAS",
  indicador: "TODOS",
  regional: "TODAS",
  loja: "TODAS",
};

const LIMITE_ANALISE_RANKING = 10;

window.analiseCharts = window.analiseCharts || {
  principal: null,
  secundario: null,
  classes: null,
};

// ==========================
// 🔠 HELPERS
// ==========================
function normalizarTextoAnalise(valor) {
  return (valor || "").toString().trim();
}

function normalizarTextoAnaliseUpper(valor) {
  return normalizarTextoAnalise(valor).toUpperCase();
}

function normalizarTextoAnaliseLower(valor) {
  return normalizarTextoAnalise(valor).toLowerCase();
}

function formatarNumeroAnalise(valor, casas = 2) {
  const numero = Number(valor);
  if (!isFinite(numero)) return "-";

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function calcularMediaAnalise(lista = []) {
  const numeros = (lista || [])
    .map((v) => Number(v))
    .filter((v) => !isNaN(v));

  if (!numeros.length) return 0;
  return numeros.reduce((a, b) => a + b, 0) / numeros.length;
}

function getChaveLojaAnalise(loja) {
  return `${loja.codigo} - ${loja.nome}`;
}

function tipoPercentualAnalise(tipo) {
  const t = normalizarTextoAnaliseLower(tipo);
  return t.includes("percent") || t.includes("porcent") || t === "%";
}

function formatarKpiAnalise(valor, { percentual = false, casas = 2 } = {}) {
  const numero = Number(valor);
  if (!isFinite(numero)) return "-";

  const texto = formatarNumeroAnalise(numero, casas);
  return percentual ? `${texto}%` : texto;
}

function quebrarNomeLojaAnalise(loja) {
  const texto = normalizarTextoAnalise(loja);

  if (!texto.includes("-")) {
    return {
      codigo: "",
      nome: texto || "-",
    };
  }

  const partes = texto.split("-");
  const codigo = normalizarTextoAnalise(partes.shift());
  const nome = normalizarTextoAnalise(partes.join("-"));

  return {
    codigo,
    nome: nome || texto,
  };
}

function getTipoCampoAnalise(
  indicador,
  campoKey = "valor",
  classeSelecionada = null
) {
  if (typeof getCampoConfig === "function") {
    return (
      getCampoConfig(indicador, campoKey, classeSelecionada)?.tipo || "numero"
    );
  }
  return "numero";
}

function formatarValorAnalise(valor, tipo = "numero") {
  if (valor === null || valor === undefined || valor === "") return "-";
  const numero = Number(valor);
  if (isNaN(numero)) return "-";

  if (typeof formatarValorExibicao === "function") {
    return formatarValorExibicao(numero, tipo);
  }

  return formatarNumeroAnalise(numero, 2);
}

function chartAnaliseDisponivel() {
  const ok = typeof Chart !== "undefined";
  if (!ok) {
    console.error("❌ Chart.js não encontrado em analise.js");
  }
  return ok;
}

function destruirGraficosAnalise() {
  try {
    if (window.analiseCharts.principal) {
      window.analiseCharts.principal.destroy();
      window.analiseCharts.principal = null;
    }

    if (window.analiseCharts.secundario) {
      window.analiseCharts.secundario.destroy();
      window.analiseCharts.secundario = null;
    }

    if (window.analiseCharts.classes) {
      window.analiseCharts.classes.destroy();
      window.analiseCharts.classes = null;
    }
  } catch (erro) {
    console.error("❌ Erro ao destruir gráficos de análise:", erro);
  }
}

function ajustarAlturaChartAnalise(
  canvasId,
  quantidade,
  { minimo = 220, maximo = 360, pxPorItem = 20 } = {}
) {
  try {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.parentElement) return;

    const altura = Math.max(minimo, Math.min(maximo, quantidade * pxPorItem));
    canvas.parentElement.style.height = `${altura}px`;
  } catch (erro) {
    console.warn("⚠️ Falha ao ajustar altura do chart de análise:", erro);
  }
}

// ==========================
// 🏷️ HELPERS DE INDICADOR
// ==========================
function getIndicadorBancoAnalise(indicador, classeSelecionada = null) {
  if (typeof getIndicadorBanco === "function") {
    return getIndicadorBanco(indicador, classeSelecionada);
  }

  return normalizarTextoAnaliseUpper(indicador);
}

function getOrdemRankingAnalise(indicador, classeSelecionada = null) {
  try {
    if (typeof getIndicadorConfig === "function") {
      const cfg = getIndicadorConfig(indicador, classeSelecionada);
      if (cfg?.ordemRanking === "asc") return "asc";
      if (cfg?.ordemRanking === "desc") return "desc";
    }
  } catch (erro) {
    console.warn("⚠️ Falha ao obter ordem de ranking na análise:", erro);
  }

  return "desc";
}

function menorEhMelhorAnalise(tipoValorPrincipal) {
  if (tipoPercentualAnalise(tipoValorPrincipal)) return true;

  if (ANALISE_STATE.indicador && ANALISE_STATE.indicador !== "TODOS") {
    const ordem = getOrdemRankingAnalise(
      ANALISE_STATE.indicador,
      ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe
    );

    return ordem === "asc";
  }

  return false;
}

function getClassesAnaliseDisponiveis() {
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

function getIndicadoresAnalisePorClasse(classe) {
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
// 📆 SEMANAS DO MÊS / FALLBACK
// ==========================
function getNumeroSemanaPorDataAnalise(data) {
  const hoje = new Date(data);
  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
  const dias = Math.floor((hoje - inicioAno) / (24 * 60 * 60 * 1000));
  return Math.ceil((dias + inicioAno.getDay() + 1) / 7);
}

function getSemanasMesVigenteAnalise() {
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
      getNumeroSemanaPorDataAnalise(d).toString().padStart(2, "0")
    );
  }

  return [...semanasSet];
}

function getPrimeiraEUltimaSemanaMesVigenteAnalise() {
  const semanas = getSemanasMesVigenteAnalise();
  return {
    primeira: semanas[0] || null,
    ultima: semanas[semanas.length - 1] || null,
    lista: semanas,
    descricao: "mês vigente",
  };
}

function gerarJanelaSemanasAnalise(semanaBase) {
  const atual = parseInt(semanaBase || getSemanaAtual(), 10);
  const lista = [atual - 3, atual - 2, atual - 1, atual].map((s) =>
    s <= 0 ? 52 + s : s
  );
  return lista.map((s) => s.toString().padStart(2, "0"));
}

// ==========================
// 🎯 ESCOPO BASE / VISUAL
// ==========================
function aplicarEscopoBaseLojasAnalise(lojas, contexto) {
  let lista = [...(lojas || [])];

  if (!contexto) return lista;

  if (ANALISE_STATE.visao === "regional") {
    if (!contexto.podeTrocarVisao && contexto.escopo?.regional) {
      lista = lista.filter(
        (l) =>
          normalizarTextoAnaliseUpper(l.regional) ===
          normalizarTextoAnaliseUpper(contexto.escopo.regional)
      );
    }

    return lista;
  }

  if (!contexto.podeTrocarVisao && contexto.escopo?.loja) {
    return lista.filter((l) => getChaveLojaAnalise(l) === contexto.escopo.loja);
  }

  return lista;
}

function aplicarFiltrosVisuaisLojasAnalise(lojas) {
  let lista = [...(lojas || [])];

  if (ANALISE_STATE.visao === "regional") {
    if (ANALISE_STATE.regional !== "TODAS") {
      lista = lista.filter(
        (l) =>
          normalizarTextoAnaliseUpper(l.regional) ===
          normalizarTextoAnaliseUpper(ANALISE_STATE.regional)
      );
    }
    return lista;
  }

  if (ANALISE_STATE.loja && ANALISE_STATE.loja !== "TODAS") {
    return lista.filter((l) => getChaveLojaAnalise(l) === ANALISE_STATE.loja);
  }

  return lista;
}

// ==========================
// 📦 AGRUPADORES DE ANALISE
// ==========================
function calcularMelhorEPiorLojaAnalise(resultadosMes, tipoValorPrincipal) {
  const mapa = {};

  resultadosMes.forEach((r) => {
    if (!mapa[r.loja]) {
      mapa[r.loja] = [];
    }
    mapa[r.loja].push(Number(r.valor));
  });

  const lista = Object.entries(mapa).map(([loja, valores]) => ({
    loja,
    media: calcularMediaAnalise(valores),
  }));

  if (!lista.length) {
    return { melhor: null, pior: null };
  }

  const menorMelhor = menorEhMelhorAnalise(tipoValorPrincipal);

  const ordenado = [...lista].sort((a, b) => {
    if (menorMelhor) return a.media - b.media;
    return b.media - a.media;
  });

  return {
    melhor: ordenado[0] || null,
    pior: ordenado[ordenado.length - 1] || null,
  };
}

function agruparTopLojasAnalise(resultadosMes, semanasInfo, tipoValorPrincipal) {
  const mapa = {};

  resultadosMes.forEach((r) => {
    if (!mapa[r.loja]) {
      mapa[r.loja] = {
        loja: r.loja,
        primeira: [],
        ultima: [],
      };
    }

    if (String(r.semana) === String(semanasInfo.primeira)) {
      mapa[r.loja].primeira.push(Number(r.valor));
    }

    if (String(r.semana) === String(semanasInfo.ultima)) {
      mapa[r.loja].ultima.push(Number(r.valor));
    }
  });

  const lista = Object.values(mapa).map((item) => {
    const mediaPrimeira = calcularMediaAnalise(item.primeira);
    const mediaUltima = calcularMediaAnalise(item.ultima);

    let mediaFinal = 0;
    const temPrimeira = item.primeira.length > 0;
    const temUltima = item.ultima.length > 0;

    if (temPrimeira && temUltima) {
      mediaFinal = (mediaPrimeira + mediaUltima) / 2;
    } else if (temPrimeira) {
      mediaFinal = mediaPrimeira;
    } else if (temUltima) {
      mediaFinal = mediaUltima;
    }

    return {
      loja: item.loja,
      media: mediaFinal,
    };
  });

  const menorMelhor = menorEhMelhorAnalise(tipoValorPrincipal);

  const ordenado = [...lista].sort((a, b) => {
    if (menorMelhor) return a.media - b.media;
    return b.media - a.media;
  });

  return {
    top: ordenado.slice(0, LIMITE_ANALISE_RANKING),
    bottom: [...ordenado].reverse().slice(0, LIMITE_ANALISE_RANKING),
    completo: ordenado,
  };
}

function agruparIndicadoresAnalise(resultadosMes, tipoValorPrincipal) {
  const mapa = {};

  resultadosMes.forEach((r) => {
    if (!mapa[r.indicador]) {
      mapa[r.indicador] = [];
    }
    mapa[r.indicador].push(Number(r.valor));
  });

  const lista = Object.entries(mapa).map(([indicador, valores]) => ({
    indicador,
    media: calcularMediaAnalise(valores),
  }));

  const menorMelhor = menorEhMelhorAnalise(tipoValorPrincipal);

  return lista.sort((a, b) => {
    if (menorMelhor) return a.media - b.media;
    return b.media - a.media;
  });
}

// ✅ força todas as classes, mesmo sem dado
function agruparClassesAnalise(resultadosMes) {
  const classesBase = getClassesAnaliseDisponiveis();
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
    media: item.qtd ? calcularMediaAnalise(item.valores) : 0,
    qtd: item.qtd,
  }));
}

function calcularAmplitudeAnalise(melhor, pior) {
  const melhorValor = Number(melhor?.media || 0);
  const piorValor = Number(pior?.media || 0);
  return Math.abs(melhorValor - piorValor);
}

// ==========================
// 🧱 TELA BASE
// ==========================
async function telaAnalises() {
  console.log("📈 Iniciando telaAnalises...");

  const container = document.getElementById("conteudo");
  if (!container) {
    console.error("❌ #conteudo não encontrado em telaAnalises");
    return;
  }

  if (!window.db) {
    mostrarErro("Conexão com banco não iniciada");
    return;
  }

  const contexto =
    typeof getContextoDashboardUsuario === "function"
      ? getContextoDashboardUsuario()
      : null;

  if (!contexto) {
    mostrarErro("Usuário sem contexto de análises");
    return;
  }

  // respeita a troca quando o usuário pode trocar
  if (!contexto.podeTrocarVisao) {
    ANALISE_STATE.visao = contexto.visao || "regional";
  } else if (!ANALISE_STATE.visao) {
    ANALISE_STATE.visao = contexto.visao || "regional";
  }

  if (!contexto.podeTrocarVisao && contexto.escopo?.regional) {
    ANALISE_STATE.regional = contexto.escopo.regional;
  }

  if (!contexto.podeTrocarVisao && contexto.escopo?.loja) {
    ANALISE_STATE.loja = contexto.escopo.loja;
  }

  container.innerHTML = `
    <div class="pagina-container">
      <div class="card-conteudo dashboard-container" id="analiseContainer">

        <div class="dashboard-topo">
          <div class="dashboard-titulos">
            <h2 class="dashboard-titulo">Análises</h2>
            <p class="dashboard-subtitulo">
              Visão analítica de performance, ranking e amplitude dos resultados
            </p>
          </div>
        </div>

        <div class="dashboard-filtros">
          <select id="analiseSemana" onchange="analiseAlterarSemana(this.value)">
            ${gerarOptionsSemanas()}
          </select>

          ${
            contexto.podeTrocarVisao
              ? `
                <select id="analiseVisao" onchange="analiseAlterarVisao(this.value)">
                  <option value="gerencial" ${
                    ANALISE_STATE.visao === "gerencial" ? "selected" : ""
                  }>Visão Gerencial</option>
                  <option value="regional" ${
                    ANALISE_STATE.visao === "regional" ? "selected" : ""
                  }>Visão Regional</option>
                </select>
              `
              : ""
          }

          <select id="analiseClasse" onchange="analiseAlterarClasse(this.value)">
            ${gerarOptionsClassesAnalise()}
          </select>

          <select id="analiseIndicador" onchange="analiseAlterarIndicador(this.value)">
            ${gerarOptionsIndicadoresAnalise()}
          </select>

          ${
            ANALISE_STATE.visao === "regional" || contexto.podeTrocarVisao
              ? `
                <select id="analiseRegional" onchange="analiseAlterarRegional(this.value)">
                  <option value="TODAS">Todas regionais</option>
                  <option value="NE1" ${
                    ANALISE_STATE.regional === "NE1" ? "selected" : ""
                  }>NE1</option>
                  <option value="NE2" ${
                    ANALISE_STATE.regional === "NE2" ? "selected" : ""
                  }>NE2</option>
                </select>
              `
              : ""
          }

          ${
            ANALISE_STATE.visao === "gerencial" && contexto.podeTrocarVisao
              ? `
                <select id="analiseLoja" onchange="analiseAlterarLoja(this.value)">
                  <option value="TODAS">Todas as lojas</option>
                </select>
              `
              : ""
          }
        </div>

        <div id="analiseConteudo" class="dashboard-grid">
          <div class="dashboard-card span-12">
            <div class="dashboard-grafico-area">Carregando análises...</div>
          </div>
        </div>

      </div>
    </div>
  `;

  const selSemana = document.getElementById("analiseSemana");
  if (selSemana) selSemana.value = ANALISE_STATE.semana;

  const selClasse = document.getElementById("analiseClasse");
  if (selClasse) selClasse.value = ANALISE_STATE.classe;

  const selIndicador = document.getElementById("analiseIndicador");
  if (selIndicador) selIndicador.value = ANALISE_STATE.indicador;

  const selRegional = document.getElementById("analiseRegional");
  if (selRegional) selRegional.value = ANALISE_STATE.regional;

  destruirGraficosAnalise();
  await carregarDadosAnalise(contexto);
}

// ==========================
// 🔧 OPTIONS
// ==========================
function gerarOptionsClassesAnalise() {
  const classes = getClassesAnaliseDisponiveis();
  let html = `<option value="TODAS">Todas as classes</option>`;

  classes.forEach((classe) => {
    html += `<option value="${classe}" ${
      ANALISE_STATE.classe === classe ? "selected" : ""
    }>${classe}</option>`;
  });

  return html;
}

function gerarOptionsIndicadoresAnalise() {
  const lista = getIndicadoresAnalisePorClasse(ANALISE_STATE.classe);
  let html = `<option value="TODOS">Todos os indicadores</option>`;

  lista.forEach((item) => {
    html += `<option value="${item.valor}" ${
      ANALISE_STATE.indicador === item.valor ? "selected" : ""
    }>${item.nome}</option>`;
  });

  return html;
}

// ==========================
// 🔄 FILTROS
// ==========================
async function analiseAlterarSemana(semana) {
  ANALISE_STATE.semana = semana;
  localStorage.setItem("semana", semana);
  destruirGraficosAnalise();
  await carregarDadosAnalise(getContextoDashboardUsuario());
}

async function analiseAlterarClasse(classe) {
  ANALISE_STATE.classe = classe;
  ANALISE_STATE.indicador = "TODOS";

  const selIndicador = document.getElementById("analiseIndicador");
  if (selIndicador) {
    selIndicador.innerHTML = gerarOptionsIndicadoresAnalise();
    selIndicador.value = "TODOS";
  }

  destruirGraficosAnalise();
  await carregarDadosAnalise(getContextoDashboardUsuario());
}

async function analiseAlterarIndicador(indicador) {
  ANALISE_STATE.indicador = indicador;
  destruirGraficosAnalise();
  await carregarDadosAnalise(getContextoDashboardUsuario());
}

async function analiseAlterarRegional(regional) {
  ANALISE_STATE.regional = regional;
  destruirGraficosAnalise();
  await carregarDadosAnalise(getContextoDashboardUsuario());
}

async function analiseAlterarLoja(loja) {
  ANALISE_STATE.loja = loja;
  destruirGraficosAnalise();
  await carregarDadosAnalise(getContextoDashboardUsuario());
}

async function analiseAlterarVisao(visao) {
  ANALISE_STATE.visao = visao;
  destruirGraficosAnalise();
  await telaAnalises();
}

// ==========================
// 📦 BUSCAR DADOS
// ==========================
async function carregarDadosAnalise(contexto) {
  const alvo = document.getElementById("analiseConteudo");
  if (!alvo) return;

  alvo.innerHTML = `
    <div class="dashboard-card span-12">
      <div class="dashboard-grafico-area">Processando análises...</div>
    </div>
  `;

  try {
    const semanasInfo = getPrimeiraEUltimaSemanaMesVigenteAnalise();

    const { data: lojasData, error: lojasError } = await window.db
      .from("lojas")
      .select("*")
      .order("codigo");

    if (lojasError) throw lojasError;

    const lojasEscopoBase = aplicarEscopoBaseLojasAnalise(
      lojasData || [],
      contexto
    );
    const lojasVisuais = aplicarFiltrosVisuaisLojasAnalise(lojasEscopoBase);

    if (contexto?.podeTrocarVisao && ANALISE_STATE.visao === "gerencial") {
      popularSelectLojasAnalise(lojasEscopoBase);
    }

    const lojasBaseSet = new Set(
      lojasEscopoBase.map((l) => getChaveLojaAnalise(l))
    );
    const lojasVisuaisSet = new Set(
      lojasVisuais.map((l) => getChaveLojaAnalise(l))
    );

    let query = window.db
      .from("resultados")
      .select("*")
      .in("semana", semanasInfo.lista);

    if (ANALISE_STATE.classe !== "TODAS") {
      query = query.eq("classe", ANALISE_STATE.classe);
    }

    if (ANALISE_STATE.indicador !== "TODOS") {
      const indicadorBanco = getIndicadorBancoAnalise(
        ANALISE_STATE.indicador,
        ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe
      );

      query = query.eq("indicador", indicadorBanco);
    }

    const { data: resultadosData, error: resultadosError } = await query;
    if (resultadosError) throw resultadosError;

    const resultadosEscopoBase = (resultadosData || []).filter((r) =>
      lojasBaseSet.has(r.loja)
    );

    const resultadosVisuais = resultadosEscopoBase.filter((r) =>
      lojasVisuaisSet.has(r.loja)
    );

    if (ANALISE_STATE.visao === "regional") {
      renderAnaliseRegional({
        lojasEscopoBase,
        resultados: resultadosVisuais,
        semanasInfo,
      });
    } else {
      renderAnaliseGerencial({
        lojasEscopoBase,
        resultados: resultadosVisuais,
        semanasInfo,
      });
    }
  } catch (erro) {
    console.error("❌ Erro ao carregar análises:", erro);

    alvo.innerHTML = `
      <div class="dashboard-card span-12">
        <div class="dashboard-grafico-area">Erro ao carregar análises.</div>
      </div>
    `;
  }
}

// ==========================
// 🌍 ANALISE REGIONAL
// ==========================
function renderAnaliseRegional({ resultados, semanasInfo }) {
  const alvo = document.getElementById("analiseConteudo");
  if (!alvo) return;

  const tipoValorPrincipal =
    ANALISE_STATE.indicador !== "TODOS"
      ? getTipoCampoAnalise(
          ANALISE_STATE.indicador,
          "valor",
          ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe
        )
      : "numero";

  const ranking = agruparTopLojasAnalise(
    resultados,
    semanasInfo,
    tipoValorPrincipal
  );
  const melhorPior = calcularMelhorEPiorLojaAnalise(
    resultados,
    tipoValorPrincipal
  );
  const classes = agruparClassesAnalise(resultados);

  const amplitude = calcularAmplitudeAnalise(
    melhorPior.melhor,
    melhorPior.pior
  );

  const mediaGeral = calcularMediaAnalise(resultados.map((r) => r.valor));

  alvo.innerHTML = `
    ${renderKpisAnaliseRegional({
      melhor: melhorPior.melhor,
      pior: melhorPior.pior,
      mediaGeral,
      amplitude,
      tipoValorPrincipal,
    })}

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Top ${LIMITE_ANALISE_RANKING} lojas</span>
        <span class="dashboard-card-subtitulo">Melhores médias do período</span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoAnalisePrincipal"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Bottom ${LIMITE_ANALISE_RANKING} lojas</span>
        <span class="dashboard-card-subtitulo">Piores médias do período</span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoAnaliseSecundario"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico-resumo span-12">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Resumo por classe</span>
        <span class="dashboard-card-subtitulo dashboard-card-subtitulo-info">
          Média do valor principal por classe
          <span
            class="dashboard-info-tip"
            title="Este gráfico mostra a média consolidada do valor principal em cada classe, considerando o filtro e o período selecionados."
          >ⓘ</span>
        </span>
      </div>
      <div class="dashboard-chart-box dashboard-chart-box-pequeno dashboard-chart-box-resumo">
        <canvas id="graficoAnaliseClasses"></canvas>
      </div>
    </div>

    ${renderTabelaRankingLojasAnalise(ranking.completo, tipoValorPrincipal)}
  `;

  renderGraficosAnaliseRegional(ranking, classes, tipoValorPrincipal);
}

// ==========================
// 🏪 ANALISE GERENCIAL
// ==========================
function renderAnaliseGerencial({ resultados }) {
  const alvo = document.getElementById("analiseConteudo");
  if (!alvo) return;

  const tipoValorPrincipal =
    ANALISE_STATE.indicador !== "TODOS"
      ? getTipoCampoAnalise(
          ANALISE_STATE.indicador,
          "valor",
          ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe
        )
      : "numero";

  const rankingIndicadores = agruparIndicadoresAnalise(
    resultados,
    tipoValorPrincipal
  );
  const classes = agruparClassesAnalise(resultados);

  const melhor = rankingIndicadores[0] || null;
  const pior = rankingIndicadores[rankingIndicadores.length - 1] || null;

  const amplitude = calcularAmplitudeAnalise(
    { media: melhor?.media || 0 },
    { media: pior?.media || 0 }
  );

  const mediaGeral = calcularMediaAnalise(resultados.map((r) => r.valor));

  alvo.innerHTML = `
    ${renderKpisAnaliseGerencial({
      melhor,
      pior,
      mediaGeral,
      amplitude,
      tipoValorPrincipal,
    })}

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Top indicadores</span>
        <span class="dashboard-card-subtitulo">Melhores médias do período</span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoAnalisePrincipal"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Bottom indicadores</span>
        <span class="dashboard-card-subtitulo">Piores médias do período</span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoAnaliseSecundario"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico-resumo span-12">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Resumo por classe</span>
        <span class="dashboard-card-subtitulo dashboard-card-subtitulo-info">
          Média do valor principal por classe
          <span
            class="dashboard-info-tip"
            title="Este gráfico mostra a média consolidada do valor principal em cada classe, considerando o filtro e o período selecionados."
          >ⓘ</span>
        </span>
      </div>
      <div class="dashboard-chart-box dashboard-chart-box-pequeno dashboard-chart-box-resumo">
        <canvas id="graficoAnaliseClasses"></canvas>
      </div>
    </div>

    ${renderTabelaRankingIndicadoresAnalise(
      rankingIndicadores,
      tipoValorPrincipal
    )}
  `;

  renderGraficosAnaliseGerencial(
    rankingIndicadores,
    classes,
    tipoValorPrincipal
  );
}

// ==========================
// 🔢 KPIS
// ==========================
function renderKpisAnaliseRegional({
  melhor,
  pior,
  mediaGeral,
  amplitude,
  tipoValorPrincipal,
}) {
  const isPercentual = tipoPercentualAnalise(tipoValorPrincipal);

  const melhorLoja = quebrarNomeLojaAnalise(melhor?.loja || "");
  const piorLoja = quebrarNomeLojaAnalise(pior?.loja || "");

  return `
    <div class="dashboard-card dashboard-kpi azul span-3">
      <span class="dashboard-kpi-label">Melhor loja</span>

      <div class="dashboard-kpi-loja">
        <span class="dashboard-kpi-loja-codigo">${melhorLoja.codigo || "--"}</span>
        <span class="dashboard-kpi-loja-separador">—</span>
        <span class="dashboard-kpi-loja-nome">${melhorLoja.nome || "-"}</span>
      </div>

      <div class="dashboard-kpi-rodape dashboard-kpi-rodape-destaque positivo">
        ${
          melhor
            ? formatarKpiAnalise(melhor.media, {
                percentual: isPercentual,
                casas: 2,
              })
            : "-"
        }
      </div>
    </div>

    <div class="dashboard-card dashboard-kpi verde span-3">
      <span class="dashboard-kpi-label">Pior loja</span>

      <div class="dashboard-kpi-loja">
        <span class="dashboard-kpi-loja-codigo">${piorLoja.codigo || "--"}</span>
        <span class="dashboard-kpi-loja-separador">—</span>
        <span class="dashboard-kpi-loja-nome">${piorLoja.nome || "-"}</span>
      </div>

      <div class="dashboard-kpi-rodape dashboard-kpi-rodape-destaque negativo">
        ${
          pior
            ? formatarKpiAnalise(pior.media, {
                percentual: isPercentual,
                casas: 2,
              })
            : "-"
        }
      </div>
    </div>

    <div class="dashboard-card dashboard-kpi laranja span-3">
      <span class="dashboard-kpi-label">Média geral</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiAnalise(mediaGeral, {
          percentual: isPercentual,
          casas: 2,
        })}
      </div>
      <div class="dashboard-kpi-rodape">Consolidado do período</div>
    </div>

    <div class="dashboard-card dashboard-kpi roxo span-3">
      <span class="dashboard-kpi-label">Amplitude</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiAnalise(amplitude, {
          percentual: isPercentual,
          casas: 2,
        })}
      </div>
      <div class="dashboard-kpi-rodape">Diferença entre melhor e pior</div>
    </div>
  `;
}

function renderKpisAnaliseGerencial({
  melhor,
  pior,
  mediaGeral,
  amplitude,
  tipoValorPrincipal,
}) {
  const isPercentual = tipoPercentualAnalise(tipoValorPrincipal);

  return `
    <div class="dashboard-card dashboard-kpi azul span-3">
      <span class="dashboard-kpi-label">Melhor indicador</span>
      <div class="dashboard-kpi-valor">${melhor?.indicador || "-"}</div>
      <div class="dashboard-kpi-rodape dashboard-kpi-rodape-destaque positivo">
        ${
          melhor
            ? formatarKpiAnalise(melhor.media, {
                percentual: isPercentual,
                casas: 2,
              })
            : "-"
        }
      </div>
    </div>

    <div class="dashboard-card dashboard-kpi verde span-3">
      <span class="dashboard-kpi-label">Pior indicador</span>
      <div class="dashboard-kpi-valor">${pior?.indicador || "-"}</div>
      <div class="dashboard-kpi-rodape dashboard-kpi-rodape-destaque negativo">
        ${
          pior
            ? formatarKpiAnalise(pior.media, {
                percentual: isPercentual,
                casas: 2,
              })
            : "-"
        }
      </div>
    </div>

    <div class="dashboard-card dashboard-kpi laranja span-3">
      <span class="dashboard-kpi-label">Média geral</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiAnalise(mediaGeral, {
          percentual: isPercentual,
          casas: 2,
        })}
      </div>
      <div class="dashboard-kpi-rodape">Consolidado do período</div>
    </div>

    <div class="dashboard-card dashboard-kpi roxo span-3">
      <span class="dashboard-kpi-label">Amplitude</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiAnalise(amplitude, {
          percentual: isPercentual,
          casas: 2,
        })}
      </div>
      <div class="dashboard-kpi-rodape">Diferença entre melhor e pior</div>
    </div>
  `;
}

// ==========================
// 📋 TABELAS
// ==========================
function renderTabelaRankingLojasAnalise(lista, tipoValorPrincipal) {
  const isPercentual = tipoPercentualAnalise(tipoValorPrincipal);

  return `
    <div class="dashboard-card span-12">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Ranking completo de lojas</span>
        <span class="dashboard-card-subtitulo">Ordenado pela média do período</span>
      </div>

      <div class="tabela-container">
        <table class="tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Loja</th>
              <th>Média</th>
            </tr>
          </thead>
          <tbody>
            ${(lista || [])
              .map(
                (item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.loja}</td>
                <td>${formatarKpiAnalise(item.media, {
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
}

function renderTabelaRankingIndicadoresAnalise(lista, tipoValorPrincipal) {
  const isPercentual = tipoPercentualAnalise(tipoValorPrincipal);

  return `
    <div class="dashboard-card span-12">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Ranking completo de indicadores</span>
        <span class="dashboard-card-subtitulo">Ordenado pela média do período</span>
      </div>

      <div class="tabela-container">
        <table class="tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Indicador</th>
              <th>Média</th>
            </tr>
          </thead>
          <tbody>
            ${(lista || [])
              .map(
                (item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.indicador}</td>
                <td>${formatarKpiAnalise(item.media, {
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
}

// ==========================
// 📈 GRÁFICOS
// ==========================
function renderGraficosAnaliseRegional(ranking, classes, tipoValorPrincipal) {
  if (!chartAnaliseDisponivel()) return;

  requestAnimationFrame(() => {
    try {
      const top = ranking.top || [];
      const bottom = ranking.bottom || [];

      renderGraficoPrincipalAnalise(
        top.map((i) => i.loja),
        top.map((i) => i.media),
        "Top 10 lojas",
        "#1e6091"
      );

      renderGraficoSecundarioAnalise(
        bottom.map((i) => i.loja),
        bottom.map((i) => i.media),
        "Bottom 10 lojas",
        "#F44336"
      );

      renderGraficoClassesAnalise(classes, tipoValorPrincipal);
    } catch (erro) {
      console.error("❌ Erro ao renderizar gráficos de análise regional:", erro);
    }
  });
}

function renderGraficosAnaliseGerencial(
  rankingIndicadores,
  classes,
  tipoValorPrincipal
) {
  if (!chartAnaliseDisponivel()) return;

  requestAnimationFrame(() => {
    try {
      const top = (rankingIndicadores || []).slice(0, LIMITE_ANALISE_RANKING);
      const bottom = [...(rankingIndicadores || [])]
        .reverse()
        .slice(0, LIMITE_ANALISE_RANKING);

      renderGraficoPrincipalAnalise(
        top.map((i) => i.indicador),
        top.map((i) => i.media),
        "Top indicadores",
        "#9C27B0"
      );

      renderGraficoSecundarioAnalise(
        bottom.map((i) => i.indicador),
        bottom.map((i) => i.media),
        "Bottom indicadores",
        "#FF9800"
      );

      renderGraficoClassesAnalise(classes, tipoValorPrincipal);
    } catch (erro) {
      console.error("❌ Erro ao renderizar gráficos de análise gerencial:", erro);
    }
  });
}

function renderGraficoPrincipalAnalise(labels, dados, label, cor) {
  const canvas = document.getElementById("graficoAnalisePrincipal");
  if (!canvas) return;

  if (window.analiseCharts.principal) {
    window.analiseCharts.principal.destroy();
  }

  ajustarAlturaChartAnalise("graficoAnalisePrincipal", labels?.length || 0, {
    minimo: 220,
    maximo: 340,
    pxPorItem: 20,
  });

  window.analiseCharts.principal = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label,
          data: dados,
          backgroundColor: cor,
          borderRadius: 6,
          maxBarThickness: 14,
          categoryPercentage: 0.82,
          barPercentage: 0.76,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: "#5a6872",
            font: {
              size: 12,
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
              size: 12,
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

function renderGraficoSecundarioAnalise(labels, dados, label, cor) {
  const canvas = document.getElementById("graficoAnaliseSecundario");
  if (!canvas) return;

  if (window.analiseCharts.secundario) {
    window.analiseCharts.secundario.destroy();
  }

  ajustarAlturaChartAnalise("graficoAnaliseSecundario", labels?.length || 0, {
    minimo: 220,
    maximo: 340,
    pxPorItem: 20,
  });

  window.analiseCharts.secundario = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label,
          data: dados,
          backgroundColor: cor,
          borderRadius: 6,
          maxBarThickness: 14,
          categoryPercentage: 0.82,
          barPercentage: 0.76,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: "#5a6872",
            font: {
              size: 12,
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
              size: 12,
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

function renderGraficoClassesAnalise(classes, tipoValorPrincipal) {
  const canvas = document.getElementById("graficoAnaliseClasses");
  if (!canvas) return;

  if (window.analiseCharts.classes) {
    window.analiseCharts.classes.destroy();
  }

  ajustarAlturaChartAnalise("graficoAnaliseClasses", classes?.length || 0, {
    minimo: 145,
    maximo: 210,
    pxPorItem: 22,
  });

  window.analiseCharts.classes = new Chart(canvas, {
    type: "bar",
    data: {
      labels: (classes || []).map((i) => i.classe),
      datasets: [
        {
          label: `Média (${tipoValorPrincipal})`,
          data: (classes || []).map((i) => i.media),
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
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` Média: ${formatarValorAnalise(ctx.raw, tipoValorPrincipal)}`,
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
// 🏬 POPULAR SELECT LOJAS
// ==========================
function popularSelectLojasAnalise(lojas) {
  const select = document.getElementById("analiseLoja");
  if (!select) return;

  let html = `<option value="TODAS">Todas as lojas</option>`;

  (lojas || []).forEach((loja) => {
    const chave = getChaveLojaAnalise(loja);
    html += `<option value="${chave}" ${
      ANALISE_STATE.loja === chave ? "selected" : ""
    }>${chave}</option>`;
  });

  select.innerHTML = html;
}