// ==========================
// 📊 COMPARATIVOS COM CHART.JS
// ==========================
console.log("✅ comparativos.js carregado");

// ==========================
// 🧠 ESTADO GLOBAL DOS COMPARATIVOS
// ==========================
const COMPARATIVO_STATE = {
  semana:
    localStorage.getItem("semana") ||
    getSemanaAtual().toString().padStart(2, "0"),

  visao: "regional",
  classe: "TODAS",
  indicador: "TODOS",
  regional: "TODAS",
  loja: "TODAS",

  // ✅ semanal | mensal
  modoPeriodo: "semanal",
};

const LIMITE_COMPARATIVO_RANKING = 10;

// ==========================
// 📈 INSTÂNCIAS DOS GRÁFICOS
// ==========================
window.comparativoCharts = window.comparativoCharts || {
  principal: null,
  classes: null,
};

// ==========================
// 🔠 HELPERS
// ==========================
function normalizarTextoComparativo(valor) {
  return (valor || "").toString().trim();
}

function normalizarTextoComparativoUpper(valor) {
  return normalizarTextoComparativo(valor).toUpperCase();
}

function normalizarTextoComparativoLower(valor) {
  return normalizarTextoComparativo(valor).toLowerCase();
}

function formatarNumeroComparativo(valor, casas = 2) {
  const numero = Number(valor);
  if (!isFinite(numero)) return "-";

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function calcularMediaComparativo(lista = []) {
  const numeros = (lista || [])
    .map((v) => Number(v))
    .filter((v) => !isNaN(v));

  if (!numeros.length) return 0;
  return numeros.reduce((a, b) => a + b, 0) / numeros.length;
}

function getChaveLojaComparativo(loja) {
  return `${loja.codigo} - ${loja.nome}`;
}

function tipoPercentualComparativo(tipo) {
  const t = normalizarTextoComparativoLower(tipo);
  return t.includes("percent") || t.includes("porcent") || t === "%";
}

function formatarKpiComparativo(valor, { percentual = false, casas = 2 } = {}) {
  const numero = Number(valor);
  if (!isFinite(numero)) return "-";

  const texto = formatarNumeroComparativo(numero, casas);
  return percentual ? `${texto}%` : texto;
}

function formatarDeltaPctComparativo(valor) {
  const numero = Number(valor);
  if (!isFinite(numero)) return "-";
  return `${formatarNumeroComparativo(numero, 1)}%`;
}

function calcularDeltaPctComparativo(atual, anterior) {
  const a = Number(atual || 0);
  const b = Number(anterior || 0);

  if (!isFinite(a) || !isFinite(b)) return 0;

  if (b === 0 && a === 0) return 0;
  if (b === 0 && a !== 0) return 100;

  return ((a - b) / Math.abs(b)) * 100;
}

function quebrarNomeLojaComparativo(loja) {
  const texto = normalizarTextoComparativo(loja);

  if (!texto.includes("-")) {
    return {
      codigo: "",
      nome: texto || "-",
    };
  }

  const partes = texto.split("-");
  const codigo = normalizarTextoComparativo(partes.shift());
  const nome = normalizarTextoComparativo(partes.join("-"));

  return {
    codigo,
    nome: nome || texto,
  };
}

// ==========================
// 🏷️ HELPERS DE INDICADOR
// ==========================
function getIndicadorBancoComparativo(indicador, classeSelecionada = null) {
  if (typeof getIndicadorBanco === "function") {
    return getIndicadorBanco(indicador, classeSelecionada);
  }

  return normalizarTextoComparativoUpper(indicador);
}

function getTipoCampoComparativo(
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

function getOrdemRankingComparativo(indicador, classeSelecionada = null) {
  try {
    if (typeof getIndicadorConfig === "function") {
      const cfg = getIndicadorConfig(indicador, classeSelecionada);
      if (cfg?.ordemRanking === "asc") return "asc";
      if (cfg?.ordemRanking === "desc") return "desc";
    }
  } catch (erro) {
    console.warn("⚠️ Falha ao obter ordem do ranking em comparativos:", erro);
  }

  return "desc";
}

function menorEhMelhorComparativo(tipoValorPrincipal) {
  if (tipoPercentualComparativo(tipoValorPrincipal)) return true;

  if (
    COMPARATIVO_STATE.indicador &&
    COMPARATIVO_STATE.indicador !== "TODOS"
  ) {
    const ordem = getOrdemRankingComparativo(
      COMPARATIVO_STATE.indicador,
      COMPARATIVO_STATE.classe === "TODAS" ? null : COMPARATIVO_STATE.classe
    );

    return ordem === "asc";
  }

  return false;
}

function getClassesComparativoDisponiveis() {
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

function getIndicadoresComparativoPorClasse(classe) {
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
// 📆 SEMANAS / MESES
// ==========================
function getSemanaAnteriorComparativo(semanaAtual) {
  const semana = parseInt(semanaAtual || getSemanaAtual(), 10);
  const anterior = semana - 1 <= 0 ? 52 : semana - 1;
  return anterior.toString().padStart(2, "0");
}

function getNumeroSemanaPorDataComparativo(data) {
  const hoje = new Date(data);
  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
  const dias = Math.floor((hoje - inicioAno) / (24 * 60 * 60 * 1000));
  return Math.ceil((dias + inicioAno.getDay() + 1) / 7);
}

function getSemanasMesRelativoComparativo(offsetMes = 0) {
  const base = new Date();
  base.setMonth(base.getMonth() + offsetMes);

  const ano = base.getFullYear();
  const mes = base.getMonth();

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const semanasSet = new Set();

  for (
    let d = new Date(primeiroDia);
    d <= ultimoDia;
    d.setDate(d.getDate() + 1)
  ) {
    semanasSet.add(
      getNumeroSemanaPorDataComparativo(d).toString().padStart(2, "0")
    );
  }

  return [...semanasSet];
}

// ==========================
// 📈 CHART.JS
// ==========================
function chartComparativoDisponivel() {
  const ok = typeof Chart !== "undefined";
  if (!ok) {
    console.error("❌ Chart.js não encontrado em comparativos.js");
  }
  return ok;
}

function destruirGraficosComparativos() {
  try {
    if (window.comparativoCharts.principal) {
      window.comparativoCharts.principal.destroy();
      window.comparativoCharts.principal = null;
    }

    if (window.comparativoCharts.classes) {
      window.comparativoCharts.classes.destroy();
      window.comparativoCharts.classes = null;
    }
  } catch (erro) {
    console.error("❌ Erro ao destruir gráficos de comparativos:", erro);
  }
}

function ajustarAlturaChartComparativo(
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
    console.warn("⚠️ Falha ao ajustar altura do chart comparativo:", erro);
  }
}

// ==========================
// 🎯 ESCOPO BASE / VISUAL
// ==========================
function aplicarEscopoBaseLojasComparativo(lojas, contexto) {
  let lista = [...(lojas || [])];

  if (!contexto) return lista;

  if (COMPARATIVO_STATE.visao === "regional") {
    if (!contexto.podeTrocarVisao && contexto.escopo?.regional) {
      lista = lista.filter(
        (l) =>
          normalizarTextoComparativoUpper(l.regional) ===
          normalizarTextoComparativoUpper(contexto.escopo.regional)
      );
    }

    return lista;
  }

  if (!contexto.podeTrocarVisao && contexto.escopo?.loja) {
    return lista.filter(
      (l) => getChaveLojaComparativo(l) === contexto.escopo.loja
    );
  }

  return lista;
}

function aplicarFiltrosVisuaisLojasComparativo(lojas) {
  let lista = [...(lojas || [])];

  if (COMPARATIVO_STATE.visao === "regional") {
    if (COMPARATIVO_STATE.regional !== "TODAS") {
      lista = lista.filter(
        (l) =>
          normalizarTextoComparativoUpper(l.regional) ===
          normalizarTextoComparativoUpper(COMPARATIVO_STATE.regional)
      );
    }

    return lista;
  }

  if (COMPARATIVO_STATE.loja && COMPARATIVO_STATE.loja !== "TODAS") {
    return lista.filter(
      (l) => getChaveLojaComparativo(l) === COMPARATIVO_STATE.loja
    );
  }

  return lista;
}

// ==========================
// 🧩 AGRUPADORES
// ==========================
function agruparComparativoPorLoja(
  resultadosAtual,
  resultadosAnterior,
  tipoValorPrincipal
) {
  const mapa = {};

  resultadosAtual.forEach((r) => {
    if (!mapa[r.loja]) {
      mapa[r.loja] = {
        nome: r.loja,
        atual: [],
        anterior: [],
      };
    }
    mapa[r.loja].atual.push(Number(r.valor));
  });

  resultadosAnterior.forEach((r) => {
    if (!mapa[r.loja]) {
      mapa[r.loja] = {
        nome: r.loja,
        atual: [],
        anterior: [],
      };
    }
    mapa[r.loja].anterior.push(Number(r.valor));
  });

  const lista = Object.values(mapa).map((item) => {
    const atual = calcularMediaComparativo(item.atual);
    const anterior = calcularMediaComparativo(item.anterior);
    const delta = atual - anterior;
    const deltaPct = calcularDeltaPctComparativo(atual, anterior);

    return {
      nome: item.nome,
      atual,
      anterior,
      delta,
      deltaPct,
    };
  });

  const menorMelhor = menorEhMelhorComparativo(tipoValorPrincipal);

  const ordenado = [...lista].sort((a, b) => {
    if (menorMelhor) return a.atual - b.atual;
    return b.atual - a.atual;
  });

  return ordenado;
}

function agruparComparativoPorIndicador(
  resultadosAtual,
  resultadosAnterior,
  tipoValorPrincipal
) {
  const mapa = {};

  resultadosAtual.forEach((r) => {
    if (!mapa[r.indicador]) {
      mapa[r.indicador] = {
        nome: r.indicador,
        atual: [],
        anterior: [],
      };
    }
    mapa[r.indicador].atual.push(Number(r.valor));
  });

  resultadosAnterior.forEach((r) => {
    if (!mapa[r.indicador]) {
      mapa[r.indicador] = {
        nome: r.indicador,
        atual: [],
        anterior: [],
      };
    }
    mapa[r.indicador].anterior.push(Number(r.valor));
  });

  const lista = Object.values(mapa).map((item) => {
    const atual = calcularMediaComparativo(item.atual);
    const anterior = calcularMediaComparativo(item.anterior);
    const delta = atual - anterior;
    const deltaPct = calcularDeltaPctComparativo(atual, anterior);

    return {
      nome: item.nome,
      atual,
      anterior,
      delta,
      deltaPct,
    };
  });

  const menorMelhor = menorEhMelhorComparativo(tipoValorPrincipal);

  const ordenado = [...lista].sort((a, b) => {
    if (menorMelhor) return a.atual - b.atual;
    return b.atual - a.atual;
  });

  return ordenado;
}

// ✅ mostra todas as classes sempre
function agruparComparativoPorClasse(
  resultadosAtual,
  resultadosAnterior
) {
  const classesBase = getClassesComparativoDisponiveis();
  const mapa = {};

  classesBase.forEach((classe) => {
    mapa[classe] = {
      nome: classe,
      atual: [],
      anterior: [],
    };
  });

  resultadosAtual.forEach((r) => {
    if (!mapa[r.classe]) {
      mapa[r.classe] = {
        nome: r.classe,
        atual: [],
        anterior: [],
      };
    }
    mapa[r.classe].atual.push(Number(r.valor));
  });

  resultadosAnterior.forEach((r) => {
    if (!mapa[r.classe]) {
      mapa[r.classe] = {
        nome: r.classe,
        atual: [],
        anterior: [],
      };
    }
    mapa[r.classe].anterior.push(Number(r.valor));
  });

  return Object.values(mapa).map((item) => {
    const atual = item.atual.length ? calcularMediaComparativo(item.atual) : 0;
    const anterior = item.anterior.length
      ? calcularMediaComparativo(item.anterior)
      : 0;
    const delta = atual - anterior;
    const deltaPct = calcularDeltaPctComparativo(atual, anterior);

    return {
      nome: item.nome,
      atual,
      anterior,
      delta,
      deltaPct,
    };
  });
}

function calcularKpisComparativos(lista) {
  const mediaAtual = calcularMediaComparativo((lista || []).map((i) => i.atual));
  const mediaAnterior = calcularMediaComparativo(
    (lista || []).map((i) => i.anterior)
  );
  const delta = mediaAtual - mediaAnterior;
  const deltaPct = calcularDeltaPctComparativo(mediaAtual, mediaAnterior);

  return {
    mediaAtual,
    mediaAnterior,
    delta,
    deltaPct,
  };
}

function calcularMaiorGanhoPerdaComparativo(lista, tipoValorPrincipal) {
  if (!lista?.length) {
    return {
      maiorGanho: null,
      maiorPerda: null,
    };
  }

  const menorMelhor = menorEhMelhorComparativo(tipoValorPrincipal);

  const porDelta = [...lista].sort((a, b) => {
    // se menor é melhor, delta menor (mais negativo) é ganho
    if (menorMelhor) return a.delta - b.delta;

    // se maior é melhor, delta maior é ganho
    return b.delta - a.delta;
  });

  return {
    maiorGanho: porDelta[0] || null,
    maiorPerda: porDelta[porDelta.length - 1] || null,
  };
}

// ==========================
// 🧱 TELA BASE
// ==========================
async function telaComparativos() {
  console.log("📊 Iniciando telaComparativos...");

  const container = document.getElementById("conteudo");
  if (!container) {
    console.error("❌ #conteudo não encontrado em telaComparativos");
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
    mostrarErro("Usuário sem contexto de comparativos");
    return;
  }

  // respeita contexto
  if (!contexto.podeTrocarVisao) {
    COMPARATIVO_STATE.visao = contexto.visao || "regional";
  } else if (!COMPARATIVO_STATE.visao) {
    COMPARATIVO_STATE.visao = contexto.visao || "regional";
  }

  if (!contexto.podeTrocarVisao && contexto.escopo?.regional) {
    COMPARATIVO_STATE.regional = contexto.escopo.regional;
  }

  if (!contexto.podeTrocarVisao && contexto.escopo?.loja) {
    COMPARATIVO_STATE.loja = contexto.escopo.loja;
  }

  container.innerHTML = `
    <div class="pagina-container">
      <div class="card-conteudo dashboard-container" id="comparativoContainer">

        <div class="dashboard-topo">
          <div class="dashboard-titulos">
            <h2 class="dashboard-titulo">Comparativos</h2>
            <p class="dashboard-subtitulo">
              Comparação do período atual versus o período anterior
            </p>
          </div>
        </div>

        <div class="dashboard-filtros">
          <select id="comparativoSemana" onchange="comparativoAlterarSemana(this.value)">
            ${gerarOptionsSemanas()}
          </select>

          <select id="comparativoModoPeriodo" onchange="comparativoAlterarModoPeriodo(this.value)">
            <option value="semanal" ${
              COMPARATIVO_STATE.modoPeriodo === "semanal" ? "selected" : ""
            }>Comparação semanal</option>
            <option value="mensal" ${
              COMPARATIVO_STATE.modoPeriodo === "mensal" ? "selected" : ""
            }>Comparação mensal</option>
          </select>

          ${
            contexto.podeTrocarVisao
              ? `
                <select id="comparativoVisao" onchange="comparativoAlterarVisao(this.value)">
                  <option value="regional" ${
                    COMPARATIVO_STATE.visao === "regional" ? "selected" : ""
                  }>Visão Regional</option>
                  <option value="gerencial" ${
                    COMPARATIVO_STATE.visao === "gerencial" ? "selected" : ""
                  }>Visão Gerencial</option>
                </select>
              `
              : ""
          }

          <select id="comparativoClasse" onchange="comparativoAlterarClasse(this.value)">
            ${gerarOptionsClassesComparativo()}
          </select>

          <select id="comparativoIndicador" onchange="comparativoAlterarIndicador(this.value)">
            ${gerarOptionsIndicadoresComparativo()}
          </select>

          ${
            COMPARATIVO_STATE.visao === "regional" || contexto.podeTrocarVisao
              ? `
                <select id="comparativoRegional" onchange="comparativoAlterarRegional(this.value)">
                  <option value="TODAS">Todas regionais</option>
                  <option value="NE1" ${
                    COMPARATIVO_STATE.regional === "NE1" ? "selected" : ""
                  }>NE1</option>
                  <option value="NE2" ${
                    COMPARATIVO_STATE.regional === "NE2" ? "selected" : ""
                  }>NE2</option>
                </select>
              `
              : ""
          }

          ${
            COMPARATIVO_STATE.visao === "gerencial" && contexto.podeTrocarVisao
              ? `
                <select id="comparativoLoja" onchange="comparativoAlterarLoja(this.value)">
                  <option value="TODAS">Todas as lojas</option>
                </select>
              `
              : ""
          }
        </div>

        <div id="comparativoConteudo" class="dashboard-grid">
          <div class="dashboard-card span-12">
            <div class="dashboard-grafico-area">Carregando comparativos...</div>
          </div>
        </div>

      </div>
    </div>
  `;

  const selSemana = document.getElementById("comparativoSemana");
  if (selSemana) selSemana.value = COMPARATIVO_STATE.semana;

  const selClasse = document.getElementById("comparativoClasse");
  if (selClasse) selClasse.value = COMPARATIVO_STATE.classe;

  const selIndicador = document.getElementById("comparativoIndicador");
  if (selIndicador) selIndicador.value = COMPARATIVO_STATE.indicador;

  const selRegional = document.getElementById("comparativoRegional");
  if (selRegional) selRegional.value = COMPARATIVO_STATE.regional;

  destruirGraficosComparativos();
  await carregarDadosComparativos(contexto);
}

// ==========================
// 🔧 OPTIONS
// ==========================
function gerarOptionsClassesComparativo() {
  const classes = getClassesComparativoDisponiveis();
  let html = `<option value="TODAS">Todas as classes</option>`;

  classes.forEach((classe) => {
    html += `<option value="${classe}" ${
      COMPARATIVO_STATE.classe === classe ? "selected" : ""
    }>${classe}</option>`;
  });

  return html;
}

function gerarOptionsIndicadoresComparativo() {
  const lista = getIndicadoresComparativoPorClasse(COMPARATIVO_STATE.classe);
  let html = `<option value="TODOS">Todos os indicadores</option>`;

  lista.forEach((item) => {
    html += `<option value="${item.valor}" ${
      COMPARATIVO_STATE.indicador === item.valor ? "selected" : ""
    }>${item.nome}</option>`;
  });

  return html;
}

// ==========================
// 🔄 FILTROS
// ==========================
async function comparativoAlterarSemana(semana) {
  COMPARATIVO_STATE.semana = semana;
  localStorage.setItem("semana", semana);
  destruirGraficosComparativos();
  await carregarDadosComparativos(getContextoDashboardUsuario());
}

async function comparativoAlterarModoPeriodo(modo) {
  COMPARATIVO_STATE.modoPeriodo = modo || "semanal";
  destruirGraficosComparativos();
  await carregarDadosComparativos(getContextoDashboardUsuario());
}

async function comparativoAlterarClasse(classe) {
  COMPARATIVO_STATE.classe = classe;
  COMPARATIVO_STATE.indicador = "TODOS";

  const selIndicador = document.getElementById("comparativoIndicador");
  if (selIndicador) {
    selIndicador.innerHTML = gerarOptionsIndicadoresComparativo();
    selIndicador.value = "TODOS";
  }

  destruirGraficosComparativos();
  await carregarDadosComparativos(getContextoDashboardUsuario());
}

async function comparativoAlterarIndicador(indicador) {
  COMPARATIVO_STATE.indicador = indicador;
  destruirGraficosComparativos();
  await carregarDadosComparativos(getContextoDashboardUsuario());
}

async function comparativoAlterarRegional(regional) {
  COMPARATIVO_STATE.regional = regional;
  destruirGraficosComparativos();
  await carregarDadosComparativos(getContextoDashboardUsuario());
}

async function comparativoAlterarLoja(loja) {
  COMPARATIVO_STATE.loja = loja;
  destruirGraficosComparativos();
  await carregarDadosComparativos(getContextoDashboardUsuario());
}

async function comparativoAlterarVisao(visao) {
  COMPARATIVO_STATE.visao = visao;
  destruirGraficosComparativos();
  await telaComparativos();
}

// ==========================
// 📦 BUSCAR DADOS
// ==========================
async function carregarDadosComparativos(contexto) {
  const alvo = document.getElementById("comparativoConteudo");
  if (!alvo) return;

  alvo.innerHTML = `
    <div class="dashboard-card span-12">
      <div class="dashboard-grafico-area">Processando comparativos...</div>
    </div>
  `;

  try {
    const semanaAtual = String(COMPARATIVO_STATE.semana).padStart(2, "0");
    const semanaAnterior = getSemanaAnteriorComparativo(semanaAtual);

    const semanasAtuais =
      COMPARATIVO_STATE.modoPeriodo === "mensal"
        ? getSemanasMesRelativoComparativo(0)
        : [semanaAtual];

    const semanasAnteriores =
      COMPARATIVO_STATE.modoPeriodo === "mensal"
        ? getSemanasMesRelativoComparativo(-1)
        : [semanaAnterior];

    const { data: lojasData, error: lojasError } = await window.db
      .from("lojas")
      .select("*")
      .order("codigo");

    if (lojasError) throw lojasError;

    const lojasEscopoBase = aplicarEscopoBaseLojasComparativo(
      lojasData || [],
      contexto
    );
    const lojasVisuais = aplicarFiltrosVisuaisLojasComparativo(lojasEscopoBase);

    if (contexto?.podeTrocarVisao && COMPARATIVO_STATE.visao === "gerencial") {
      popularSelectLojasComparativo(lojasEscopoBase);
    }

    const lojasBaseSet = new Set(
      lojasEscopoBase.map((l) => getChaveLojaComparativo(l))
    );
    const lojasVisuaisSet = new Set(
      lojasVisuais.map((l) => getChaveLojaComparativo(l))
    );

    let query = window.db
      .from("resultados")
      .select("*")
      .in("semana", [...new Set([...semanasAtuais, ...semanasAnteriores])]);

    if (COMPARATIVO_STATE.classe !== "TODAS") {
      query = query.eq("classe", COMPARATIVO_STATE.classe);
    }

    if (COMPARATIVO_STATE.indicador !== "TODOS") {
      const indicadorBanco = getIndicadorBancoComparativo(
        COMPARATIVO_STATE.indicador,
        COMPARATIVO_STATE.classe === "TODAS" ? null : COMPARATIVO_STATE.classe
      );
      query = query.eq("indicador", indicadorBanco);
    }

    const { data: resultadosData, error: resultadosError } = await query;
    if (resultadosError) throw resultadosError;

    const resultadosBase = (resultadosData || []).filter((r) =>
      lojasBaseSet.has(r.loja)
    );

    const resultadosVisuais = resultadosBase.filter((r) =>
      lojasVisuaisSet.has(r.loja)
    );

    const resultadosAtual = resultadosVisuais.filter((r) =>
      semanasAtuais.includes(String(r.semana).padStart(2, "0"))
    );

    const resultadosAnterior = resultadosVisuais.filter((r) =>
      semanasAnteriores.includes(String(r.semana).padStart(2, "0"))
    );

    const tipoValorPrincipal =
      COMPARATIVO_STATE.indicador !== "TODOS"
        ? getTipoCampoComparativo(
            COMPARATIVO_STATE.indicador,
            "valor",
            COMPARATIVO_STATE.classe === "TODAS"
              ? null
              : COMPARATIVO_STATE.classe
          )
        : "numero";

    if (COMPARATIVO_STATE.visao === "regional") {
      renderComparativosRegional({
        resultadosAtual,
        resultadosAnterior,
        semanaAtual,
        semanaAnterior,
        semanasAtuais,
        semanasAnteriores,
        tipoValorPrincipal,
      });
    } else {
      renderComparativosGerencial({
        resultadosAtual,
        resultadosAnterior,
        semanaAtual,
        semanaAnterior,
        semanasAtuais,
        semanasAnteriores,
        tipoValorPrincipal,
      });
    }
  } catch (erro) {
    console.error("❌ Erro ao carregar comparativos:", erro);

    alvo.innerHTML = `
      <div class="dashboard-card span-12">
        <div class="dashboard-grafico-area">Erro ao carregar comparativos.</div>
      </div>
    `;
  }
}

// ==========================
// 🌍 RENDER REGIONAL
// ==========================
function renderComparativosRegional({
  resultadosAtual,
  resultadosAnterior,
  semanaAtual,
  semanaAnterior,
  semanasAtuais,
  semanasAnteriores,
  tipoValorPrincipal,
}) {
  const alvo = document.getElementById("comparativoConteudo");
  if (!alvo) return;

  const listaLojas = agruparComparativoPorLoja(
    resultadosAtual,
    resultadosAnterior,
    tipoValorPrincipal
  );
  const listaClasses = agruparComparativoPorClasse(
    resultadosAtual,
    resultadosAnterior
  );
  const kpis = calcularKpisComparativos(listaLojas);
  const { maiorGanho, maiorPerda } = calcularMaiorGanhoPerdaComparativo(
    listaLojas,
    tipoValorPrincipal
  );

  alvo.innerHTML = `
    ${renderKpisComparativos({
      semanaAtual,
      semanaAnterior,
      semanasAtuais,
      semanasAnteriores,
      kpis,
      maiorGanho,
      maiorPerda,
      tipoValorPrincipal,
      rotuloMaior: "loja",
    })}

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Comparativo por loja</span>
        <span class="dashboard-card-subtitulo">
          ${
            COMPARATIVO_STATE.modoPeriodo === "mensal"
              ? "Mês atual x mês anterior"
              : "Semana atual x semana anterior"
          }
        </span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoComparativoPrincipal"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Comparativo por classe</span>
        <span class="dashboard-card-subtitulo">
          Média atual x anterior
        </span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoComparativoClasses"></canvas>
      </div>
    </div>

    ${renderTabelaComparativa(listaLojas, tipoValorPrincipal, "Loja")}
  `;

  renderGraficosComparativos({
    listaPrincipal: listaLojas,
    listaClasses,
    tipoValorPrincipal,
    tituloPrincipalAtual: "Atual",
    tituloPrincipalAnterior: "Anterior",
    principalCorAtual: "#1e6091",
    principalCorAnterior: "#4CAF50",
  });
}

// ==========================
// 🏪 RENDER GERENCIAL
// ==========================
function renderComparativosGerencial({
  resultadosAtual,
  resultadosAnterior,
  semanaAtual,
  semanaAnterior,
  semanasAtuais,
  semanasAnteriores,
  tipoValorPrincipal,
}) {
  const alvo = document.getElementById("comparativoConteudo");
  if (!alvo) return;

  const listaIndicadores = agruparComparativoPorIndicador(
    resultadosAtual,
    resultadosAnterior,
    tipoValorPrincipal
  );
  const listaClasses = agruparComparativoPorClasse(
    resultadosAtual,
    resultadosAnterior
  );
  const kpis = calcularKpisComparativos(listaIndicadores);
  const { maiorGanho, maiorPerda } = calcularMaiorGanhoPerdaComparativo(
    listaIndicadores,
    tipoValorPrincipal
  );

  alvo.innerHTML = `
    ${renderKpisComparativos({
      semanaAtual,
      semanaAnterior,
      semanasAtuais,
      semanasAnteriores,
      kpis,
      maiorGanho,
      maiorPerda,
      tipoValorPrincipal,
      rotuloMaior: "indicador",
    })}

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Comparativo por indicador</span>
        <span class="dashboard-card-subtitulo">
          ${
            COMPARATIVO_STATE.modoPeriodo === "mensal"
              ? "Mês atual x mês anterior"
              : "Semana atual x semana anterior"
          }
        </span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoComparativoPrincipal"></canvas>
      </div>
    </div>

    <div class="dashboard-card dashboard-grafico span-6">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">Comparativo por classe</span>
        <span class="dashboard-card-subtitulo">
          Média atual x anterior
        </span>
      </div>
      <div class="dashboard-chart-box">
        <canvas id="graficoComparativoClasses"></canvas>
      </div>
    </div>

    ${renderTabelaComparativa(listaIndicadores, tipoValorPrincipal, "Indicador")}
  `;

  renderGraficosComparativos({
    listaPrincipal: listaIndicadores,
    listaClasses,
    tipoValorPrincipal,
    tituloPrincipalAtual: "Atual",
    tituloPrincipalAnterior: "Anterior",
    principalCorAtual: "#9C27B0",
    principalCorAnterior: "#FF9800",
  });
}

// ==========================
// 🔢 KPIS
// ==========================
function renderKpisComparativos({
  semanaAtual,
  semanaAnterior,
  semanasAtuais,
  semanasAnteriores,
  kpis,
  maiorGanho,
  maiorPerda,
  tipoValorPrincipal,
}) {
  const isPercentual = tipoPercentualComparativo(tipoValorPrincipal);

  const tituloAtual =
    COMPARATIVO_STATE.modoPeriodo === "mensal"
      ? "Média mês atual"
      : `Média semana ${semanaAtual}`;

  const tituloAnterior =
    COMPARATIVO_STATE.modoPeriodo === "mensal"
      ? "Média mês anterior"
      : `Média semana ${semanaAnterior}`;

  const nomeMaior = maiorGanho?.nome || "-";
  const lojaQuebrada = quebrarNomeLojaComparativo(nomeMaior);

  return `
    <div class="dashboard-card dashboard-kpi azul span-3">
      <span class="dashboard-kpi-label">${tituloAtual}</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiComparativo(kpis.mediaAtual, {
          percentual: isPercentual,
          casas: 2,
        })}
      </div>
      <div class="dashboard-kpi-rodape">
        ${
          COMPARATIVO_STATE.modoPeriodo === "mensal"
            ? "Período atual"
            : "Semana atual"
        }
      </div>
    </div>

    <div class="dashboard-card dashboard-kpi verde span-3">
      <span class="dashboard-kpi-label">${tituloAnterior}</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiComparativo(kpis.mediaAnterior, {
          percentual: isPercentual,
          casas: 2,
        })}
      </div>
      <div class="dashboard-kpi-rodape">
        ${
          COMPARATIVO_STATE.modoPeriodo === "mensal"
            ? "Período anterior"
            : "Semana anterior"
        }
      </div>
    </div>

    <div class="dashboard-card dashboard-kpi laranja span-3">
      <span class="dashboard-kpi-label">Variação</span>
      <div class="dashboard-kpi-valor">
        ${formatarKpiComparativo(kpis.delta, {
          percentual: isPercentual,
          casas: 2,
        })}
      </div>
      <div class="dashboard-kpi-rodape">
        ${formatarDeltaPctComparativo(kpis.deltaPct)}
      </div>
    </div>

    <div class="dashboard-card dashboard-kpi roxo span-3">
      <span class="dashboard-kpi-label">Maior ganho / perda</span>

      <div class="dashboard-kpi-loja">
        <span class="dashboard-kpi-loja-codigo">${lojaQuebrada.codigo || ""}</span>
        ${
          lojaQuebrada.codigo
            ? `<span class="dashboard-kpi-loja-separador">—</span>`
            : ""
        }
        <span class="dashboard-kpi-loja-nome">${lojaQuebrada.nome || "-"}</span>
      </div>

      <div class="dashboard-kpi-rodape">
        ↑ ${
          maiorGanho
            ? formatarKpiComparativo(maiorGanho.delta, {
                percentual: isPercentual,
                casas: 2,
              })
            : "-"
        }
        &nbsp; | &nbsp;
        ↓ ${
          maiorPerda
            ? formatarKpiComparativo(maiorPerda.delta, {
                percentual: isPercentual,
                casas: 2,
              })
            : "-"
        }
      </div>
    </div>
  `;
}

// ==========================
// 📋 TABELA DETALHADA
// ==========================
function renderTabelaComparativa(lista, tipoValorPrincipal, rotulo) {
  const isPercentual = tipoPercentualComparativo(tipoValorPrincipal);

  return `
    <div class="dashboard-card span-12">
      <div class="dashboard-card-header">
        <span class="dashboard-card-titulo">
          Detalhamento comparativo corporativo
        </span>
        <span class="dashboard-card-subtitulo">
          ${
            COMPARATIVO_STATE.modoPeriodo === "mensal"
              ? "Mês atual x mês anterior + variação"
              : "Semana atual x semana anterior + variação"
          }
        </span>
      </div>

      <div class="tabela-container">
        <table class="tabela">
          <thead>
            <tr>
              <th>${rotulo}</th>
              <th>Atual</th>
              <th>Anterior</th>
              <th>Δ</th>
              <th>Δ%</th>
            </tr>
          </thead>
          <tbody>
            ${(lista || [])
              .map(
                (item) => `
              <tr>
                <td>${item.nome}</td>
                <td>${formatarKpiComparativo(item.atual, {
                  percentual: isPercentual,
                  casas: 2,
                })}</td>
                <td>${formatarKpiComparativo(item.anterior, {
                  percentual: isPercentual,
                  casas: 2,
                })}</td>
                <td>${formatarKpiComparativo(item.delta, {
                  percentual: isPercentual,
                  casas: 2,
                })}</td>
                <td>${formatarDeltaPctComparativo(item.deltaPct)}</td>
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
// 📈 RENDER GRÁFICOS
// ==========================
function renderGraficosComparativos({
  listaPrincipal,
  listaClasses,
  tipoValorPrincipal,
  tituloPrincipalAtual,
  tituloPrincipalAnterior,
  principalCorAtual,
  principalCorAnterior,
}) {
  if (!chartComparativoDisponivel()) return;

  requestAnimationFrame(() => {
    try {
      renderGraficoPrincipalComparativo(
        listaPrincipal,
        tipoValorPrincipal,
        tituloPrincipalAtual,
        tituloPrincipalAnterior,
        principalCorAtual,
        principalCorAnterior
      );

      renderGraficoClassesComparativo(
        listaClasses,
        tipoValorPrincipal
      );
    } catch (erro) {
      console.error("❌ Erro ao renderizar gráficos comparativos:", erro);
    }
  });
}

function renderGraficoPrincipalComparativo(
  lista,
  tipoValorPrincipal,
  tituloAtual,
  tituloAnterior,
  corAtual,
  corAnterior
) {
  const canvas = document.getElementById("graficoComparativoPrincipal");
  if (!canvas) return;

  if (window.comparativoCharts.principal) {
    window.comparativoCharts.principal.destroy();
  }

  const dados = (lista || []).slice(0, LIMITE_COMPARATIVO_RANKING);

  ajustarAlturaChartComparativo("graficoComparativoPrincipal", dados.length, {
    minimo: 220,
    maximo: 340,
    pxPorItem: 20,
  });

  const isPercentual = tipoPercentualComparativo(tipoValorPrincipal);

  window.comparativoCharts.principal = new Chart(canvas, {
    type: "bar",
    data: {
      labels: dados.map((i) => i.nome),
      datasets: [
        {
          label: `${tituloAtual} (${tipoValorPrincipal})`,
          data: dados.map((i) => i.atual),
          backgroundColor: corAtual,
          borderRadius: 6,
          maxBarThickness: 16,
          categoryPercentage: 0.76,
          barPercentage: 0.72,
        },
        {
          label: `${tituloAnterior} (${tipoValorPrincipal})`,
          data: dados.map((i) => i.anterior),
          backgroundColor: corAnterior,
          borderRadius: 6,
          maxBarThickness: 16,
          categoryPercentage: 0.76,
          barPercentage: 0.72,
        },
      ],
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
            boxWidth: 14,
            boxHeight: 8,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.dataset.label}: ${formatarKpiComparativo(ctx.raw, {
                percentual: isPercentual,
                casas: 2,
              })}`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#5a6872",
            font: {
              size: 11,
            },
            maxRotation: 25,
            minRotation: 0,
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#5a6872",
            font: {
              size: 11,
            },
            callback: (value) =>
              isPercentual
                ? `${formatarNumeroComparativo(value, 1)}%`
                : formatarNumeroComparativo(value, 1),
          },
          grid: {
            color: "rgba(10, 61, 98, 0.06)",
          },
        },
      },
    },
  });
}

function renderGraficoClassesComparativo(listaClasses, tipoValorPrincipal) {
  const canvas = document.getElementById("graficoComparativoClasses");
  if (!canvas) return;

  if (window.comparativoCharts.classes) {
    window.comparativoCharts.classes.destroy();
  }

  const dados = listaClasses || [];
  const isPercentual = tipoPercentualComparativo(tipoValorPrincipal);

  ajustarAlturaChartComparativo("graficoComparativoClasses", dados.length, {
    minimo: 220,
    maximo: 320,
    pxPorItem: 22,
  });

  window.comparativoCharts.classes = new Chart(canvas, {
    type: "bar",
    data: {
      labels: dados.map((i) => i.nome),
      datasets: [
        {
          label: `Atual (${tipoValorPrincipal})`,
          data: dados.map((i) => i.atual),
          backgroundColor: "#9C27B0",
          borderRadius: 6,
          maxBarThickness: 16,
          categoryPercentage: 0.76,
          barPercentage: 0.72,
        },
        {
          label: `Anterior (${tipoValorPrincipal})`,
          data: dados.map((i) => i.anterior),
          backgroundColor: "#FFB74D",
          borderRadius: 6,
          maxBarThickness: 16,
          categoryPercentage: 0.76,
          barPercentage: 0.72,
        },
      ],
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
            boxWidth: 14,
            boxHeight: 8,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.dataset.label}: ${formatarKpiComparativo(ctx.raw, {
                percentual: isPercentual,
                casas: 2,
              })}`,
          },
        },
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
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#5a6872",
            font: {
              size: 11,
            },
            callback: (value) =>
              isPercentual
                ? `${formatarNumeroComparativo(value, 1)}%`
                : formatarNumeroComparativo(value, 1),
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
// 🏬 POPULAR SELECT LOJAS
// ==========================
function popularSelectLojasComparativo(lojas) {
  const select = document.getElementById("comparativoLoja");
  if (!select) return;

  let html = `<option value="TODAS">Todas as lojas</option>`;

  (lojas || []).forEach((loja) => {
    const chave = getChaveLojaComparativo(loja);
    html += `<option value="${chave}" ${
      COMPARATIVO_STATE.loja === chave ? "selected" : ""
    }>${chave}</option>`;
  });

  select.innerHTML = html;
}