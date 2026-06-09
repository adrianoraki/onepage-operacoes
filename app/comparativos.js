// ==========================
// 📊 COMPARATIVOS — HEATMAP VIBRANTE
// ==========================
console.log("✅ comparativos.js carregado");

// ==========================
// 🧠 ESTADO GLOBAL
// ==========================
const COMPARATIVO_STATE = {
  semana:
    (typeof getSemanaAtual === "function"
      ? getSemanaAtual()
      : parseInt(localStorage.getItem("semana") || "1", 10)
    )
      .toString()
      .padStart(2, "0"),

  modoPeriodo: "semanal", // "semanal" | "mensal"
  indicador: "TODOS",
  abaRegional: localStorage.getItem("comparativoAba") || "AMBAS", // "AMBAS" | "NE1" | "NE2"
  loja: localStorage.getItem("comparativoLoja") || "TODAS",       // "TODAS" | "codigo - nome"
};

// ==========================
// 🔠 HELPERS DE TEXTO/NÚMERO
// ==========================
function normalizarTextoComparativo(valor) {
  return (valor || "").toString().trim();
}

function normalizarTextoComparativoUpper(valor) {
  return normalizarTextoComparativo(valor).toUpperCase();
}

function normalizarSemanaComparativo(semana) {
  return String(semana == null ? "" : semana)
    .trim()
    .padStart(2, "0");
}

function calcularMediaComparativo(lista = []) {
  const numeros = (lista || [])
    .map((v) => Number(v))
    .filter((v) => !isNaN(v) && isFinite(v));
  if (!numeros.length) return 0;
  return numeros.reduce((a, b) => a + b, 0) / numeros.length;
}

function somarComparativo(lista = []) {
  return (lista || [])
    .map((v) => Number(v))
    .filter((v) => !isNaN(v) && isFinite(v))
    .reduce((a, b) => a + b, 0);
}

// ==========================
// 💲 FORMATAÇÃO POR TIPO
// ==========================
function tipoPercentualComparativo(tipo) {
  const t = normalizarTextoComparativoUpper(tipo);
  return t.includes("PERCENT") || t.includes("PORCENT") || t === "%";
}

function tipoMoedaComparativo(tipo) {
  const t = normalizarTextoComparativoUpper(tipo);
  return t.includes("MOEDA") || t.includes("R$") || t.includes("REAL");
}

/**
 * Indicadores que devem SOMAR (total do mês) em vez de tirar média:
 *  - moeda (R$): desconto, cancelamento, devolução, troca
 *  - banco de horas (especial-rh)
 * Os demais (percentual, número, especial) tiram MÉDIA.
 */
function tipoSomaComparativo(tipo) {
  const t = normalizarTextoComparativoUpper(tipo);
  return (
    tipoMoedaComparativo(tipo) ||
    t.includes("ESPECIAL-RH") ||
    t.includes("ESPECIAL_RH") ||
    t.replace(/[^A-Z]/g, "") === "ESPECIALRH"
  );
}

/**
 * Agrega uma lista de valores conforme o tipo:
 *  - soma   → R$ e banco de horas (total)
 *  - média  → percentual, número, especial
 * No modo semanal (1 registro) soma e média coincidem.
 */
function agregarValoresComparativo(arr, tipo) {
  if (!arr || !arr.length) return null;
  return tipoSomaComparativo(tipo) ? somarComparativo(arr) : calcularMediaComparativo(arr);
}

function formatarValorComparativo(valor, tipo) {
  const numero = Number(valor);
  if (!isFinite(numero)) return "-";

  if (tipoMoedaComparativo(tipo)) {
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  if (tipoPercentualComparativo(tipo)) {
    return (
      numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + "%"
    );
  }

  // número genérico
  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// ==========================
// 🏷️ CONFIG DE INDICADOR
// ==========================
function getIndicadorBancoComparativo(indicador) {
  if (typeof getIndicadorBanco === "function") {
    return getIndicadorBanco(indicador, null);
  }
  return normalizarTextoComparativoUpper(indicador);
}

function getTipoCampoComparativo(indicador) {
  if (typeof getCampoConfig === "function") {
    try {
      return getCampoConfig(indicador, "valor", null)?.tipo || "numero";
    } catch (e) {
      /* noop */
    }
  }
  return "numero";
}

/**
 * Lê a direção do ranking do indicador (do indicadores-config.js):
 *  - "asc"  → MENOR é melhor (ex: desconto, ruptura, quebra, turnover)
 *  - "desc" → MAIOR é melhor (ex: NPS, PSV, visita prospecção)
 * Retorna true quando MENOR é melhor.
 */
function menorEhMelhorComparativo(indicador) {
  if (indicador === "TODOS") return false; // misto: trata maior como melhor por padrão
  if (typeof getIndicadorConfig === "function") {
    try {
      const cfg = getIndicadorConfig(indicador, null);
      return normalizarTextoComparativoUpper(cfg?.ordemRanking) === "ASC";
    } catch (e) {
      /* noop */
    }
  }
  return false;
}

function getIndicadoresComparativoLista() {
  // usa o catálogo central (window.classesIndicadores) construído em indicadores-config.js
  const lista = [];
  const catalogo = window.classesIndicadores || {};

  Object.entries(catalogo).forEach(([nomeClasse, itens]) => {
    (itens || []).forEach((i) => {
      lista.push({
        valor: i.valor,
        nome: i.nome,
        classe: nomeClasse,
      });
    });
  });

  return lista;
}

// ==========================
// 🗓️ SEMANA / MÊS
// ==========================
function getSemanaAtualComparativo() {
  if (typeof getSemanaAtual === "function") {
    try {
      return getSemanaAtual();
    } catch (e) {
      /* noop */
    }
  }
  // fallback simples (semana ISO aproximada)
  const hoje = new Date();
  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
  const dias = Math.floor((hoje - inicioAno) / 86400000);
  return Math.ceil((dias + inicioAno.getDay() + 1) / 7);
}

function getNumeroSemanaPorDataComparativo(data) {
  const hoje = new Date(data);
  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
  const dias = Math.floor((hoje - inicioAno) / 86400000);
  return Math.ceil((dias + inicioAno.getDay() + 1) / 7);
}

/**
 * Dada uma semana (número), descobre a qual mês ela pertence e retorna
 * TODAS as semanas daquele mês (no formato "NN").
 * Baseia-se em datas reais do ano corrente.
 */
function getSemanasDoMesPorSemanaComparativo(semana) {
  const ano = new Date().getFullYear();
  const semanaAlvo = parseInt(semana, 10);

  // Estima uma data dentro da semana alvo: dia ~ (semana * 7)
  const dataAprox = new Date(ano, 0, 1);
  dataAprox.setDate(dataAprox.getDate() + (semanaAlvo - 1) * 7);

  const mes = dataAprox.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const semanasSet = new Set();
  for (
    let d = new Date(primeiroDia);
    d <= ultimoDia;
    d.setDate(d.getDate() + 1)
  ) {
    semanasSet.add(normalizarSemanaComparativo(getNumeroSemanaPorDataComparativo(d)));
  }

  // Garante que a própria semana selecionada esteja inclusa
  semanasSet.add(normalizarSemanaComparativo(semanaAlvo));

  return [...semanasSet];
}

// ==========================
// 🏬 MAPA LOJA → REGIONAL
// ==========================
function getChaveLojaComparativo(loja) {
  return `${loja.codigo} - ${loja.nome}`;
}

/**
 * Constrói: { "codigo - nome": "NE1", ... }
 * A coluna `loja` da tabela resultados é exatamente essa chave.
 */
function montarMapaLojaRegionalComparativo(lojas = []) {
  const mapa = {};
  (lojas || []).forEach((l) => {
    mapa[getChaveLojaComparativo(l)] = normalizarTextoComparativoUpper(l.regional || "");
  });
  return mapa;
}

// ==========================
// 🌡️ HEATMAP VIBRANTE
// ==========================

/**
 * Normaliza um valor em 0..1.
 * Por padrão (menorMelhor=false): maior valor → 1 (verde).
 * Se menorMelhor=true: menor valor → 1 (verde).
 */
function calcularIntensidadeHeatmap(valor, min, max, menorMelhor = false) {
  const range = max - min;
  if (range === 0) return 0.5;
  let i = (valor - min) / range; // 0..1 (1 = maior)
  if (menorMelhor) i = 1 - i;
  return Math.max(0, Math.min(1, i));
}

/**
 * Cores vibrantes: vermelho vivo (#FF3333) → verde limão (#33DD44)
 */
function heatmapCorVibrante(intensidade) {
  const i = Math.max(0, Math.min(1, intensidade));
  const r = Math.round(255 * (1 - i) + 51 * i); // 255 → 51
  const g = Math.round(51 * (1 - i) + 221 * i); // 51 → 221
  const b = Math.round(51 * (1 - i) + 68 * i); // 51 → 68
  return `rgb(${r},${g},${b})`;
}

/**
 * Texto branco em cores escuras (extremos), escuro no meio (claro).
 */
function heatmapCorTexto(intensidade) {
  return intensidade > 0.3 && intensidade < 0.72 ? "#1a2733" : "#ffffff";
}

/**
 * Cor de PERCENTUAL por FAIXA FIXA (não relativa):
 *  - |valor| até 2,49%  → verde
 *  - |valor| 2,50–2,99% → amarelo
 *  - |valor| 3,00%+     → vermelho
 * Usa o valor absoluto (quebras costumam ser negativas).
 */
function corPercentualFaixa(valorPct) {
  const v = Math.abs(Number(valorPct) || 0);
  if (v <= 2.49) return { fundo: "rgb(51,221,68)", texto: "#0d3d16" };   // verde
  if (v <= 2.99) return { fundo: "rgb(245,205,50)", texto: "#4a3c05" };  // amarelo
  return { fundo: "rgb(255,51,51)", texto: "#ffffff" };                   // vermelho
}

// ==========================
// 📋 TELA PRINCIPAL
// ==========================
async function telaComparativos() {
  console.log("📊 Iniciando telaComparativos...");

  const container = document.getElementById("conteudo");
  if (!container) {
    console.error("❌ #conteudo não encontrado");
    return;
  }

  if (!window.db) {
    if (typeof mostrarErro === "function") mostrarErro("Conexão com banco não iniciada");
    return;
  }

  container.innerHTML = `
    <div class="pagina-container">
      <div class="card-conteudo comparativo-container" id="comparativoContainer">

        <div class="comparativo-topo">
          <div class="comparativo-titulos">
            <h2 class="comparativo-titulo">Comparativos Regionais</h2>
            <p class="comparativo-subtitulo">Ranking de lojas por indicador — NE1 e NE2</p>
          </div>
          <button id="comparativoBtnTela" class="comparativo-btn-tela" onclick="comparativoToggleTelaCheia()" title="Tela cheia">
            <i class="fas fa-expand"></i>
            <span>Tela cheia</span>
          </button>
        </div>

        <div class="comparativo-filtros">
          <select id="comparativoSemana" onchange="comparativoAlterarSemana(this.value)">
            ${gerarOptionsSemanasComparativo()}
          </select>

          <select id="comparativoModoPeriodo" onchange="comparativoAlterarModoPeriodo(this.value)">
            <option value="semanal" ${COMPARATIVO_STATE.modoPeriodo === "semanal" ? "selected" : ""}>Por semana</option>
            <option value="mensal" ${COMPARATIVO_STATE.modoPeriodo === "mensal" ? "selected" : ""}>Total do mês</option>
          </select>

          <select id="comparativoIndicador" onchange="comparativoAlterarIndicador(this.value)">
            ${gerarOptionsIndicadoresComparativo()}
          </select>

          <select id="comparativoLoja" onchange="comparativoAlterarLoja(this.value)">
            <option value="TODAS">Todas as lojas</option>
          </select>
        </div>

        <div class="comparativo-abas" role="tablist" aria-label="Regional">
          <button class="comparativo-aba" data-aba="AMBAS" role="tab" onclick="comparativoAlterarAba('AMBAS')">
            <i class="fas fa-layer-group"></i><span>Ambas</span>
          </button>
          <button class="comparativo-aba" data-aba="NE1" role="tab" onclick="comparativoAlterarAba('NE1')">NE1</button>
          <button class="comparativo-aba" data-aba="NE2" role="tab" onclick="comparativoAlterarAba('NE2')">NE2</button>
        </div>

        <div id="comparativoConteudo" class="comparativo-conteudo">
          <div class="loading-box">Carregando...</div>
        </div>

      </div>
    </div>
  `;

  const selSemana = document.getElementById("comparativoSemana");
  if (selSemana) selSemana.value = COMPARATIVO_STATE.semana;

  comparativoMarcarAbaAtiva();

  await carregarDadosComparativos();
}

// ==========================
// 🔧 OPTIONS DOS FILTROS
// ==========================
function gerarOptionsSemanasComparativo() {
  // reusa o gerador global se existir (mantém consistência com o resto do app)
  if (typeof gerarOptionsSemanas === "function") {
    try {
      return gerarOptionsSemanas();
    } catch (e) {
      /* fallback abaixo */
    }
  }

  const atual = getSemanaAtualComparativo();
  let html = "";
  for (let i = atual; i >= Math.max(1, atual - 15); i--) {
    const s = normalizarSemanaComparativo(i);
    html += `<option value="${s}" ${COMPARATIVO_STATE.semana === s ? "selected" : ""}>Semana ${s}</option>`;
  }
  return html;
}

function gerarOptionsIndicadoresComparativo() {
  const lista = getIndicadoresComparativoLista();
  let html = `<option value="TODOS" ${COMPARATIVO_STATE.indicador === "TODOS" ? "selected" : ""}>Todos os indicadores</option>`;
  lista.forEach((item) => {
    html += `<option value="${item.valor}" ${COMPARATIVO_STATE.indicador === item.valor ? "selected" : ""}>${item.nome}</option>`;
  });
  return html;
}

// ==========================
// 🔄 HANDLERS DOS FILTROS
// ==========================
async function comparativoAlterarSemana(semana) {
  COMPARATIVO_STATE.semana = normalizarSemanaComparativo(semana);
  localStorage.setItem("semana", COMPARATIVO_STATE.semana);
  await carregarDadosComparativos();
}

async function comparativoAlterarModoPeriodo(modo) {
  COMPARATIVO_STATE.modoPeriodo = modo || "semanal";
  await carregarDadosComparativos();
}

async function comparativoAlterarIndicador(indicador) {
  COMPARATIVO_STATE.indicador = indicador;
  await carregarDadosComparativos();
}

async function comparativoAlterarLoja(loja) {
  COMPARATIVO_STATE.loja = loja || "TODAS";
  localStorage.setItem("comparativoLoja", COMPARATIVO_STATE.loja);
  await carregarDadosComparativos();
}

/**
 * Preenche o select de lojas com optgroups por regional (NE1 / NE2).
 * Preserva a seleção atual se a loja ainda existir na lista.
 */
function preencherSelectLojas(lojas = []) {
  const sel = document.getElementById("comparativoLoja");
  if (!sel) return;

  const selecionada = COMPARATIVO_STATE.loja;

  // agrupa por regional
  const grupos = {};
  (lojas || []).forEach((l) => {
    const reg = normalizarTextoComparativoUpper(l.regional || "Outros");
    if (!grupos[reg]) grupos[reg] = [];
    grupos[reg].push(l);
  });

  // reconstrói as opções
  let html = `<option value="TODAS" ${selecionada === "TODAS" ? "selected" : ""}>Todas as lojas</option>`;

  Object.keys(grupos)
    .sort()
    .forEach((reg) => {
      html += `<optgroup label="${reg}">`;
      grupos[reg]
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        .forEach((l) => {
          const chave = getChaveLojaComparativo(l);
          html += `<option value="${chave}" ${selecionada === chave ? "selected" : ""}>${l.codigo} — ${l.nome}</option>`;
        });
      html += `</optgroup>`;
    });

  sel.innerHTML = html;
}

async function comparativoAlterarAba(aba) {
  COMPARATIVO_STATE.abaRegional = aba || "AMBAS";
  localStorage.setItem("comparativoAba", COMPARATIVO_STATE.abaRegional);
  comparativoMarcarAbaAtiva();
  await carregarDadosComparativos();
}

function comparativoMarcarAbaAtiva() {
  document.querySelectorAll(".comparativo-aba").forEach((btn) => {
    const ativa = btn.getAttribute("data-aba") === COMPARATIVO_STATE.abaRegional;
    btn.classList.toggle("ativa", ativa);
    btn.setAttribute("aria-selected", ativa ? "true" : "false");
  });
}

/**
 * Decide quais regionais renderizar conforme a aba selecionada.
 */
function comparativoRegionaisVisiveis() {
  if (COMPARATIVO_STATE.abaRegional === "NE1") return ["NE1"];
  if (COMPARATIVO_STATE.abaRegional === "NE2") return ["NE2"];
  return ["NE1", "NE2"];
}

// ==========================
// 📦 BUSCAR E RENDERIZAR
// ==========================
async function carregarDadosComparativos() {
  const alvo = document.getElementById("comparativoConteudo");
  if (!alvo) return;

  alvo.innerHTML = `<div class="loading-box">Processando comparativos...</div>`;

  try {
    // 1) Lojas (para mapear regional)
    const { data: lojasData, error: lojasError } = await window.db
      .from("lojas")
      .select("*")
      .order("codigo");
    if (lojasError) throw lojasError;

    const mapaLojaRegional = montarMapaLojaRegionalComparativo(lojasData || []);

    // popula o select de lojas com optgroups NE1/NE2
    preencherSelectLojas(lojasData || []);

    // 2) Semanas a buscar (semanal x mensal)
    const semanaSel = normalizarSemanaComparativo(COMPARATIVO_STATE.semana);
    const semanasABuscar =
      COMPARATIVO_STATE.modoPeriodo === "mensal"
        ? getSemanasDoMesPorSemanaComparativo(semanaSel)
        : [semanaSel];

    // 3) Query de resultados
    let query = window.db
      .from("resultados")
      .select("*")
      .in("semana", semanasABuscar);

    if (COMPARATIVO_STATE.indicador !== "TODOS") {
      const indicadorBanco = getIndicadorBancoComparativo(COMPARATIVO_STATE.indicador);
      query = query.eq("indicador", indicadorBanco);
    }

    // filtra por loja específica direto na query (mais eficiente)
    if (COMPARATIVO_STATE.loja !== "TODAS") {
      query = query.eq("loja", COMPARATIVO_STATE.loja);
    }

    const { data: resultados, error: resultadosError } = await query;
    if (resultadosError) throw resultadosError;

    // normaliza e anota regional em cada resultado
    const resultadosNorm = (resultados || []).map((r) => ({
      ...r,
      _semana: normalizarSemanaComparativo(r.semana),
      _regional: mapaLojaRegional[r.loja] || "",
    }));

    // diagnóstico
    const semRegional = [...new Set(resultadosNorm.filter((r) => !r._regional).map((r) => r.loja))];
    if (semRegional.length) {
      console.warn("⚠️ Comparativos: lojas sem regional:", semRegional);
    }
    console.log(
      `📊 Comparativos: ${resultadosNorm.length} registros | semanas: ${semanasABuscar.join(", ")} | ` +
        `NE1: ${resultadosNorm.filter((r) => r._regional === "NE1").length} | ` +
        `NE2: ${resultadosNorm.filter((r) => r._regional === "NE2").length}` +
        (COMPARATIVO_STATE.loja !== "TODAS" ? ` | loja: ${COMPARATIVO_STATE.loja}` : "")
    );

    // 4) Tipo e direção
    const tipoIndicador =
      COMPARATIVO_STATE.indicador !== "TODOS"
        ? getTipoCampoComparativo(COMPARATIVO_STATE.indicador)
        : "numero";

    // 5) Regionais visíveis
    //    Se uma loja específica está selecionada, mostra só a regional dela
    let regionais;
    if (COMPARATIVO_STATE.loja !== "TODAS") {
      const regDaLoja = mapaLojaRegional[COMPARATIVO_STATE.loja];
      regionais = regDaLoja ? [regDaLoja] : comparativoRegionaisVisiveis();
    } else {
      regionais = comparativoRegionaisVisiveis();
    }
    const umaRegional = regionais.length === 1;

    if (COMPARATIVO_STATE.indicador === "TODOS") {
      // MATRIZ loja × indicador (cada coluna com sua escala e direção de cor)
      const indicadoresMeta = getIndicadoresMatrizComparativo();
      alvo.innerHTML = `
        <div class="comparativo-matrizes ${umaRegional ? "uma-regional" : ""}">
          ${regionais
            .map((reg) => renderMatrizRegional(reg, resultadosNorm, indicadoresMeta))
            .join("")}
        </div>
      `;
    } else {
      // RANKING de um indicador (cor segue ordemRanking)
      const menorMelhor = menorEhMelhorComparativo(COMPARATIVO_STATE.indicador);
      alvo.innerHTML = `
        <div class="comparativo-regionais ${umaRegional ? "uma-regional" : ""}">
          ${regionais
            .map((reg) => renderComparativoRegional(reg, resultadosNorm, tipoIndicador, menorMelhor))
            .join("")}
        </div>
      `;
    }
  } catch (erro) {
    console.error("❌ Erro ao carregar comparativos:", erro);
    alvo.innerHTML = `<div class="loading-box loading-erro">Erro ao carregar: ${erro.message || erro}</div>`;
  }
}

// ==========================
// 🗺️ RENDER DE UMA REGIONAL
// ==========================
function renderComparativoRegional(nomeRegional, resultadosNorm, tipoIndicador, menorMelhor) {
  const regionalUpper = normalizarTextoComparativoUpper(nomeRegional);
  const isMoeda = tipoMoedaComparativo(tipoIndicador);
  const isPercentual = tipoPercentualComparativo(tipoIndicador);

  // filtra resultados desta regional
  const resultadosRegional = resultadosNorm.filter(
    (r) => r._regional === regionalUpper
  );

  if (resultadosRegional.length === 0) {
    return `
      <div class="regional-card">
        <h3 class="regional-titulo">${nomeRegional}</h3>
        <div class="regional-vazio">Sem dados para esta regional nesse período.</div>
      </div>
    `;
  }

  // agrupa por loja (r.loja é "codigo - nome")
  const mapaLojas = {};
  resultadosRegional.forEach((r) => {
    const chave = r.loja || "—";
    if (!mapaLojas[chave]) {
      mapaLojas[chave] = { loja: chave, valores: [] };
    }
    mapaLojas[chave].valores.push(Number(r.valor) || 0);
  });

  // calcula valor agregado por loja
  //  - R$ e banco de horas → SOMA (total)
  //  - percentual/número    → MÉDIA
  const listaLojas = Object.values(mapaLojas).map((item) => {
    const valorAgregado = agregarValoresComparativo(item.valores, tipoIndicador);

    const partes = quebrarLojaComparativo(item.loja);
    return {
      loja: item.loja,
      codigo: partes.codigo,
      nome: partes.nome,
      valor: valorAgregado,
      qtdSemanas: item.valores.length,
    };
  });

  // ordena do MAIOR para o MENOR valor (visualmente, sempre)
  listaLojas.sort((a, b) => b.valor - a.valor);

  // heatmap conforme a semântica do indicador:
  //  menorMelhor=true  → menor valor = verde, maior = vermelho
  //  menorMelhor=false → maior valor = verde, menor = vermelho
  const valores = listaLojas.map((l) => l.valor);
  const minVal = Math.min(...valores);
  const maxVal = Math.max(...valores);

  const linhas = listaLojas
    .map((loja, idx) => {
      let corFundo, corTexto;
      if (isPercentual) {
        // % → faixa fixa (verde ≤2,49 · amarelo 2,5–2,99 · vermelho ≥3)
        const c = corPercentualFaixa(loja.valor);
        corFundo = c.fundo;
        corTexto = c.texto;
      } else {
        // R$ / número → heatmap relativo
        const intens = calcularIntensidadeHeatmap(loja.valor, minVal, maxVal, menorMelhor);
        corFundo = heatmapCorVibrante(intens);
        corTexto = heatmapCorTexto(intens);
      }

      return `
        <tr class="comparativo-row" style="background-color:${corFundo}; color:${corTexto};">
          <td class="col-rank">${idx + 1}º</td>
          <td class="col-nome" title="${loja.loja}">${loja.nome || loja.loja}</td>
          <td class="col-valor">${formatarValorComparativo(loja.valor, tipoIndicador)}</td>
        </tr>
      `;
    })
    .join("");

  // rótulo da coluna conforme tipo de agregação
  const ehSoma = tipoSomaComparativo(tipoIndicador);
  const ehMensal = COMPARATIVO_STATE.modoPeriodo === "mensal";
  const unidade = isMoeda ? " (R$)" : "";
  const labelValor = ehSoma
    ? (ehMensal ? `Total do mês${unidade}` : `Total${unidade}`)
    : (ehMensal ? "Média do mês" : "Valor");

  // legenda dinâmica: explica o que verde/vermelho representam para este indicador
  const legenda =
    COMPARATIVO_STATE.indicador === "TODOS"
      ? ""
      : `<div class="regional-legenda">
           <span class="legenda-item"><span class="legenda-bola verde"></span>${menorMelhor ? "Menor (melhor)" : "Maior (melhor)"}</span>
           <span class="legenda-item"><span class="legenda-bola vermelho"></span>${menorMelhor ? "Maior (pior)" : "Menor (pior)"}</span>
         </div>`;

  return `
    <div class="regional-card">
      <h3 class="regional-titulo">
        ${nomeRegional}
        <span class="regional-contagem">${listaLojas.length} lojas</span>
      </h3>
      ${legenda}
      <table class="comparativo-tabela">
        <thead>
          <tr>
            <th class="col-rank">#</th>
            <th class="col-nome">Loja</th>
            <th class="col-valor">${labelValor}</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>
  `;
}

// ==========================
// ✂️ QUEBRAR "codigo - nome"
// ==========================
function quebrarLojaComparativo(loja) {
  const texto = normalizarTextoComparativo(loja);
  if (!texto.includes("-")) {
    return { codigo: "", nome: texto || "-" };
  }
  const partes = texto.split("-");
  const codigo = normalizarTextoComparativo(partes.shift());
  const nome = normalizarTextoComparativo(partes.join("-"));
  return { codigo, nome: nome || texto };
}

// ==========================
// 🖥️ TELA CHEIA (modo apresentação / data show)
// ==========================
function comparativoToggleTelaCheia() {
  const emTela = !!document.fullscreenElement;
  if (emTela) {
    comparativoSairTelaCheia();
  } else {
    comparativoEntrarTelaCheia();
  }
}

async function comparativoEntrarTelaCheia() {
  const container = document.getElementById("comparativoContainer");
  if (!container) return;

  try {
    container.classList.add("modo-apresentacao");
    if (typeof window.pausarTimerInatividade === "function") {
      window.pausarTimerInatividade();
    }

    if (container.requestFullscreen) await container.requestFullscreen();
    else if (container.webkitRequestFullscreen) await container.webkitRequestFullscreen();
    else if (container.msRequestFullscreen) await container.msRequestFullscreen();

    comparativoAtualizarBotaoTela(true);
  } catch (erro) {
    console.error("❌ Erro ao entrar em tela cheia:", erro);
    container.classList.remove("modo-apresentacao");
  }
}

async function comparativoSairTelaCheia() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch (e) {
    /* noop */
  }
  const container = document.getElementById("comparativoContainer");
  if (container) container.classList.remove("modo-apresentacao");
  if (typeof window.retomarTimerInatividade === "function") {
    window.retomarTimerInatividade();
  }
  comparativoAtualizarBotaoTela(false);
}

function comparativoAtualizarBotaoTela(emTela) {
  const btn = document.getElementById("comparativoBtnTela");
  if (!btn) return;
  btn.innerHTML = emTela
    ? `<i class="fas fa-compress"></i><span>Sair da tela cheia</span>`
    : `<i class="fas fa-expand"></i><span>Tela cheia</span>`;
  btn.title = emTela ? "Sair da tela cheia" : "Tela cheia";
}

// reseta a UI quando o usuário sai do fullscreen pelo ESC
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    const container = document.getElementById("comparativoContainer");
    if (container) container.classList.remove("modo-apresentacao");
    if (typeof window.retomarTimerInatividade === "function") {
      window.retomarTimerInatividade();
    }
    comparativoAtualizarBotaoTela(false);
  }
});

// ==========================
// 🧩 MATRIZ (TODOS OS INDICADORES)
// ==========================

/**
 * Lista de indicadores com metadados para as colunas da matriz,
 * na ordem do catálogo (agrupado por classe).
 */
function getIndicadoresMatrizComparativo() {
  return getIndicadoresComparativoLista().map((i) => ({
    valor: i.valor,
    nome: i.nome,
    classe: i.classe,
    banco: normalizarTextoComparativoUpper(getIndicadorBancoComparativo(i.valor)),
    tipo: getTipoCampoComparativo(i.valor),
    menorMelhor: menorEhMelhorComparativo(i.valor),
  }));
}

/**
 * Formata a célula da matriz com valores reais (sem abreviar):
 *  - moeda:   1200 → "R$ 1.200,00" · 344300 → "R$ 344.300,00"
 *  - %:       "5,2%"
 *  - número:  "1.234" / "82"
 */
function formatarCelulaMatriz(valor, tipo) {
  const n = Number(valor);
  if (!isFinite(n)) return "—";

  if (tipoPercentualComparativo(tipo)) {
    return (
      n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"
    );
  }

  if (tipoMoedaComparativo(tipo)) {
    return n.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // número genérico
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function unidadeIndicadorMatriz(tipo) {
  if (tipoPercentualComparativo(tipo)) return "%";
  if (tipoMoedaComparativo(tipo)) return "R$";
  return "";
}

/**
 * Renderiza a matriz loja × indicador de uma regional.
 * Cada coluna (indicador) tem escala e direção de cor próprias.
 */
function renderMatrizRegional(nomeRegional, resultadosNorm, indicadoresMeta) {
  const regionalUpper = normalizarTextoComparativoUpper(nomeRegional);
  const isMoeda = (tipo) => tipoMoedaComparativo(tipo);

  const resultadosRegional = resultadosNorm.filter((r) => r._regional === regionalUpper);

  if (resultadosRegional.length === 0) {
    return `
      <div class="matriz-card">
        <h3 class="regional-titulo">${nomeRegional}<span class="regional-contagem">0 lojas</span></h3>
        <div class="regional-vazio">Sem dados para esta regional nesse período.</div>
      </div>`;
  }

  // mapa: loja → { indicadorBanco → [valores] }
  const lojas = {};
  resultadosRegional.forEach((r) => {
    const loja = r.loja || "—";
    const indBanco = normalizarTextoComparativoUpper(r.indicador);
    if (!lojas[loja]) lojas[loja] = {};
    if (!lojas[loja][indBanco]) lojas[loja][indBanco] = [];
    lojas[loja][indBanco].push(Number(r.valor) || 0);
  });

  // só mantém indicadores que têm ao menos 1 valor nesta regional
  const colunas = indicadoresMeta.filter((ind) =>
    Object.values(lojas).some((m) => m[ind.banco] && m[ind.banco].length)
  );

  // agrega valor por loja/indicador (soma p/ R$ e banco de horas, média p/ resto)
  const valorCelula = (loja, ind) => {
    const arr = lojas[loja][ind.banco];
    if (!arr || !arr.length) return null;
    return agregarValoresComparativo(arr, ind.tipo);
  };

  // ===== RANKING GERAL DAS LOJAS =====
  // Critério: R$ é o MESTRE, % é o SERVO (desempate). Sempre do PIOR p/ o melhor.
  //  - "pior" de indicador asc (menor é melhor) = MAIOR valor
  //  - "pior" de indicador desc (maior é melhor) = MENOR valor
  const colunasMoeda = colunas.filter((c) => isMoeda(c.tipo));
  const colunasPct = colunas.filter((c) => tipoPercentualComparativo(c.tipo));

  // "peso de pior" de uma loja num conjunto de colunas (quanto maior, pior)
  const scorePior = (loja, listaCols) =>
    listaCols.reduce((acc, ind) => {
      const v = valorCelula(loja, ind);
      if (v == null || !isFinite(v)) return acc;
      // se "maior é melhor" (desc), invertemos para que o pior suba
      return acc + (ind.menorMelhor ? v : -v);
    }, 0);

  const nomesLojas = Object.keys(lojas).sort((a, b) => {
    // 1º) MESTRE: indicadores em R$
    const mA = scorePior(a, colunasMoeda);
    const mB = scorePior(b, colunasMoeda);
    if (mB !== mA) return mB - mA; // pior (maior R$) no topo
    // 2º) SERVO: indicadores em %
    const pA = scorePior(a, colunasPct);
    const pB = scorePior(b, colunasPct);
    if (pB !== pA) return pB - pA;
    // 3º) desempate final: nome
    return a.localeCompare(b, "pt-BR");
  });

  // min/max por coluna (para escala de cor independente)
  const faixaColuna = {};
  colunas.forEach((ind) => {
    const vals = nomesLojas
      .map((l) => valorCelula(l, ind))
      .filter((v) => v != null && isFinite(v));
    faixaColuna[ind.banco] = {
      min: vals.length ? Math.min(...vals) : 0,
      max: vals.length ? Math.max(...vals) : 0,
    };
  });

  // cabeçalho das colunas
  const thIndicadores = colunas
    .map((ind) => {
      const uni = unidadeIndicadorMatriz(ind.tipo);
      return `<th class="matriz-th-ind" title="${ind.nome}">
        <span class="matriz-th-nome">${ind.nome}</span>
        ${uni ? `<span class="matriz-th-uni">${uni}</span>` : ""}
      </th>`;
    })
    .join("");

  // linhas (lojas)
  const linhas = nomesLojas
    .map((loja, idx) => {
      const partes = quebrarLojaComparativo(loja);
      const celulas = colunas
        .map((ind) => {
          const v = valorCelula(loja, ind);
          if (v == null) {
            return `<td class="matriz-celula matriz-vazia">—</td>`;
          }
          let fundo, texto;
          if (tipoPercentualComparativo(ind.tipo)) {
            // % → faixa fixa (verde ≤2,49 · amarelo 2,5–2,99 · vermelho ≥3)
            const c = corPercentualFaixa(v);
            fundo = c.fundo;
            texto = c.texto;
          } else {
            // R$ / número → heatmap relativo por coluna
            const { min, max } = faixaColuna[ind.banco];
            const intens = calcularIntensidadeHeatmap(v, min, max, ind.menorMelhor);
            fundo = heatmapCorVibrante(intens);
            texto = heatmapCorTexto(intens);
          }
          return `<td class="matriz-celula" style="background:${fundo}; color:${texto};">
            ${formatarCelulaMatriz(v, ind.tipo)}
          </td>`;
        })
        .join("");

      return `
        <tr>
          <td class="matriz-rank">${idx + 1}º</td>
          <td class="matriz-loja" title="${loja}">
            <span class="matriz-loja-cod">${partes.codigo}</span>
            <span class="matriz-loja-nome">${partes.nome}</span>
          </td>
          ${celulas}
        </tr>`;
    })
    .join("");

  return `
    <div class="matriz-card">
      <h3 class="regional-titulo">
        ${nomeRegional}
        <span class="regional-contagem">${nomesLojas.length} lojas</span>
      </h3>
      <div class="matriz-scroll">
        <table class="matriz-tabela">
          <thead>
            <tr>
              <th class="matriz-th-rank">#</th>
              <th class="matriz-th-loja">Loja</th>
              ${thIndicadores}
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    </div>`;
}

// expõe a entrada pro router, caso necessário
window.telaComparativos = telaComparativos;