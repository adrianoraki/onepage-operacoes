// ==========================
// 📈 ANALISES COM CHART.JS
// ==========================
console.log("✅ analise.js carregado");

// ==========================
// 🧠 ESTADO GLOBAL DAS ANALISES
// ==========================
const ANALISE_STATE = {
  ano: new Date().getFullYear(),

  semana:
    localStorage.getItem("semana") ||
    getSemanaAtual().toString().padStart(2, "0"),

  mes: new Date().getMonth(), // índice 0-11 do mês selecionado
  aba: "evolucao",
  modoComparativo: "mes", // "mes" (mês a mês) | "semana" (semana a semana)
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
  const numeros = (lista || []).map((v) => Number(v)).filter((v) => !isNaN(v));

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

function tipoMoedaAnalise(tipo) {
  const t = normalizarTextoAnaliseLower(tipo);
  return (
    t === "moeda" ||
    t === "r$" ||
    t === "currency" ||
    t === "monetario" ||
    t === "monetário" ||
    t === "valor"
  );
}

// ✅ AJUSTE NECESSÁRIO
function tipoInteiroAnalise(tipo) {
  const t = normalizarTextoAnaliseLower(tipo);
  return (
    t === "inteiro" ||
    t === "numero-inteiro" ||
    t === "int" ||
    t === "integer"
  );
}


function extrairSinalAnalise(texto) {
  const bruto = (texto || "").toString().trim();
  return bruto.startsWith("-") ? -1 : 1;
}

function extrairDigitosAnalise(texto) {
  return (texto || "").toString().replace(/\D/g, "");
}

function converterDigitosParaDecimalAnalise(texto, casas = 2) {
  const digitos = extrairDigitosAnalise(texto);
  if (!digitos) return null;

  const sinal = extrairSinalAnalise(texto);
  const numero = Number(digitos) / Math.pow(10, casas);

  if (Number.isNaN(numero)) return null;
  return numero * sinal;
}

function parseNumeroLivreAnalise(valor) {
  const bruto = (valor || "").toString().trim();
  if (!bruto) return null;

  const normalizado = bruto
    .replace(/\s/g, "")
    .replace(/\.(?=.*\.)/g, "")
    .replace(",", ".");

  const numero = Number(normalizado);
  return Number.isNaN(numero) ? null : numero;
}

function limparValorParaSalvarAnalise(valorDigitado, tipo = "numero") {
  const tipoNorm = normalizarTextoAnaliseLower(tipo);
  const bruto = (valorDigitado || "").toString().trim();

  if (!bruto) return null;

  if (tipoMoedaAnalise(tipoNorm)) {
    const numero = converterDigitosParaDecimalAnalise(bruto, 2);
    console.log("💰 limparValorParaSalvarAnalise -> moeda", {
      bruto,
      numero,
      tipo,
    });
    return numero;
  }

  if (tipoPercentualAnalise(tipoNorm)) {
    const numero = converterDigitosParaDecimalAnalise(bruto, 2);
    console.log("📉 limparValorParaSalvarAnalise -> percentual", {
      bruto,
      numero,
      tipo,
    });
    return numero;
  }

  // ✅ inteiro: nunca dividir casas decimais
  if (tipoInteiroAnalise(tipoNorm)) {
    const sinal = extrairSinalAnalise(bruto);
    const digitos = extrairDigitosAnalise(bruto);

    if (!digitos) return null;

    const numero = Number(digitos) * sinal;

    console.log("🔢 limparValorParaSalvarAnalise -> inteiro", {
      bruto,
      numero,
      tipo,
    });

    return Number.isNaN(numero) ? null : numero;
  }

  const numero = parseNumeroLivreAnalise(bruto);
  console.log("🔢 limparValorParaSalvarAnalise -> numero", {
    bruto,
    numero,
    tipo,
  });
  return numero;
}

function formatarMoedaBRAnalise(valor) {
  const numero = Number(valor);
  if (!isFinite(numero)) return "-";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarPercentualBRAnalise(valor, casas = 2) {
  const numero = Number(valor);
  if (!isFinite(numero)) return "-";

  return (
    numero.toLocaleString("pt-BR", {
      minimumFractionDigits: casas,
      maximumFractionDigits: casas,
    }) + "%"
  );
}

function formatarValorExibicaoAnalise(valor, tipo = "numero", casas = 2) {
  if (valor === null || valor === undefined || valor === "") return "-";

  const numero = Number(valor);
  if (!isFinite(numero)) return "-";

  if (tipoMoedaAnalise(tipo)) {
    return formatarMoedaBRAnalise(numero);
  }

  // ✅ AJUSTE NECESSÁRIO
  if (tipoInteiroAnalise(tipo)) {
    return String(Math.trunc(numero));
  }

  if (tipoPercentualAnalise(tipo)) {
    return formatarPercentualBRAnalise(numero, casas);
  }

  return formatarNumeroAnalise(numero, casas);
}

function formatarValorParaInputAnalise(valor, tipo = "numero") {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(valor);
  if (!isFinite(numero)) return "";

  if (tipoMoedaAnalise(tipo)) {
    return formatarMoedaBRAnalise(numero);
  }

  if (tipoPercentualAnalise(tipo)) {
    return formatarPercentualBRAnalise(numero, 2);
  }

  // ✅ AJUSTE NECESSÁRIO
  if (tipoInteiroAnalise(tipo)) {
    return String(Math.trunc(numero));
  }

  return formatarNumeroAnalise(numero, 2);
}

function prepararInputFormatadoAnalise(input) {
  if (!input) return;

  const tipo = input.dataset?.tipo || "numero";
  const brutoAtual = (input.value || "").toString().trim();

  if (!brutoAtual) return;

  // ✅ AJUSTE NECESSÁRIO
  if (tipoInteiroAnalise(tipo)) {
    const sinal = brutoAtual.startsWith("-") ? "-" : "";
    const digitos = extrairDigitosAnalise(brutoAtual);
    input.value = digitos ? `${sinal}${digitos}` : "";
  } else if (tipoMoedaAnalise(tipo) || tipoPercentualAnalise(tipo)) {
    const sinal = brutoAtual.startsWith("-") ? "-" : "";
    const digitos = extrairDigitosAnalise(brutoAtual);
    input.value = digitos ? `${sinal}${digitos}` : "";
  } else {
    input.value = brutoAtual
      .replace(/\s/g, "")
      .replace(/\.(?=.*\.)/g, "")
      .replace(",", ".");
  }

  console.log("✍️ prepararInputFormatadoAnalise:", {
    tipo,
    valorOriginal: brutoAtual,
    valorInput: input.value,
  });
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
  { minimo = 220, maximo = 360, pxPorItem = 20 } = {},
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

function getCasasDecimaisAnalise(indicador, classeSelecionada = null) {
  const indicadorNorm = normalizarTextoAnaliseUpper(indicador);

  if (indicadorNorm === "NPS") return 2;

  return 2;
}

function formatarKpiAnalise(
  valor,
  { percentual = false, casas = 2, tipo = "numero" } = {},
) {
  const numero = Number(valor);
  if (!isFinite(numero)) return "-";

  if (percentual || tipoPercentualAnalise(tipo)) {
    return formatarPercentualBRAnalise(numero, casas);
  }

  if (tipoMoedaAnalise(tipo)) {
    return formatarMoedaBRAnalise(numero);
  }

  if (tipoInteiroAnalise(tipo)) {
    return String(Math.trunc(numero));
  }

  return formatarNumeroAnalise(numero, casas);
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

function indicadorEhMoedaAnalise(
  indicador,
  campoKey = "valor",
  classeSelecionada = null,
) {
  const indicadorNorm = normalizarTextoAnaliseUpper(indicador);
  const campoNorm = normalizarTextoAnaliseLower(campoKey);

  // SELF-CHECKOUT:
  // apenas Participação de Vendas é moeda
  if (indicadorNorm === "SELF-CHECKOUT" && campoNorm === "valor") {
    return true;
  }

  // Qtd Passantes nunca é moeda
  if (indicadorNorm === "SELF-CHECKOUT" && campoNorm === "valor2") {
    return false;
  }

  return false;
}

function formatarValorAnalise(valor, tipo = "numero") {
  if (valor === null || valor === undefined || valor === "") return "-";
  const numero = Number(valor);
  if (isNaN(numero)) return "-";

  return formatarValorExibicaoAnalise(numero, tipo, 2);
}

// ==========================
// 🌐 EXPOR HELPERS GLOBAIS
// para o restante do sistema aproveitar a mesma regra
// ==========================
window.limparValorParaSalvar = function (valorDigitado, tipo = "numero") {
  return limparValorParaSalvarAnalise(valorDigitado, tipo);
};

window.formatarValorParaInput = function (valor, tipo = "numero") {
  return formatarValorParaInputAnalise(valor, tipo);
};

window.formatarValorExibicao = function (valor, tipo = "numero") {
  return formatarValorExibicaoAnalise(valor, tipo, 2);
};

window.prepararInputFormatado = function (input) {
  prepararInputFormatadoAnalise(input);
};

console.log("🌐 Helpers globais de formato registrados em analise.js", {
  limparValorParaSalvar: typeof window.limparValorParaSalvar,
  formatarValorParaInput: typeof window.formatarValorParaInput,
  formatarValorExibicao: typeof window.formatarValorExibicao,
  prepararInputFormatado: typeof window.prepararInputFormatado,
});

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
      ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe,
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
      getNumeroSemanaPorDataAnalise(d).toString().padStart(2, "0"),
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
    s <= 0 ? 52 + s : s,
  );
  return lista.map((s) => s.toString().padStart(2, "0"));
}

// ==========================
// 🎯 ESCOPO BASE / VISUAL
// ==========================
function aplicarEscopoBaseLojasAnalise(lojas, contexto) {
  let lista = [...(lojas || [])];

  if (!contexto) return lista;

  // 🏬 loja vinculada = restrição mais forte: usuário vê SÓ a própria loja
  if (!contexto.podeTrocarVisao && contexto.escopo?.loja_codigo) {
    return lista.filter(
      (l) => String(l.codigo) === String(contexto.escopo.loja_codigo),
    );
  }

  // senão, restringe pela regional vinculada (se houver)
  if (!contexto.podeTrocarVisao && contexto.escopo?.regional) {
    return lista.filter(
      (l) =>
        normalizarTextoAnaliseUpper(l.regional) ===
        normalizarTextoAnaliseUpper(contexto.escopo.regional),
    );
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
          normalizarTextoAnaliseUpper(ANALISE_STATE.regional),
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

function agruparTopLojasAnalise(
  resultadosMes,
  semanasInfo,
  tipoValorPrincipal,
) {
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

// ✅ RESUMO POR SUBCLASSE
function agruparSubclassesAnalise(resultadosMes) {
  const mapa = {};

  resultadosMes.forEach((r) => {
    const chave = r.subclasse || r.classe || "Sem subclasse";

    if (!mapa[chave]) {
      mapa[chave] = {
        subclasse: chave,
        valores: [],
        qtd: 0,
      };
    }

    mapa[chave].valores.push(Number(r.valor));
    mapa[chave].qtd += 1;
  });

  return Object.values(mapa)
    .map((item) => ({
      subclasse: item.subclasse,
      media: item.qtd ? calcularMediaAnalise(item.valores) : 0,
      qtd: item.qtd,
    }))
    .sort((a, b) => b.media - a.media);
}

function calcularAmplitudeAnalise(melhor, pior) {
  const melhorValor = Number(melhor?.media || 0);
  const piorValor = Number(pior?.media || 0);
  return Math.abs(melhorValor - piorValor);
}

// ==========================
// 👤 CONTEXTO DO USUÁRIO (autônomo — não depende do dashboard)
// ==========================
function getContextoDashboardUsuario() {
  let usuario = null;
  try {
    if (typeof window.getUsuarioLogado === "function") {
      usuario = window.getUsuarioLogado();
    }
  } catch (e) {}

  if (!usuario) {
    try {
      const raw = localStorage.getItem("usuario");
      if (raw) usuario = JSON.parse(raw);
    } catch (e) {}
  }

  // sem usuário identificável: libera a visão (o RLS do banco protege os dados)
  if (!usuario) {
    return { podeTrocarVisao: true, visao: "regional", escopo: {} };
  }

  const perfil = (usuario.perfil || "").toString().toLowerCase();
  const ehAdminMaster = perfil === "master" || perfil === "admin";

  const escopo = {};
  if (usuario.regional_vinculada) {
    escopo.regional = usuario.regional_vinculada;
  }
  // loja vinculada (loja_codigo) restringe — exceto se "ignorar loja vinculada" (modo BI) estiver ligado
  const ignoraLoja =
    usuario.ignorar_loja_vinculada === true ||
    usuario.permissoes?.ignorar_loja_vinculada === true;
  if (!ignoraLoja && usuario.loja_codigo != null && usuario.loja_codigo !== "") {
    escopo.loja_codigo = String(usuario.loja_codigo).trim();
  }

  return {
    podeTrocarVisao: ehAdminMaster,
    visao: "regional",
    escopo,
  };
}

// ==========================
// 🧱 TELA BASE
// ==========================
async function telaAnalises() {
  console.log("📈 Iniciando telaAnalises...");
  garantirEstilosAbasAnalise();

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

  if (!contexto.podeTrocarVisao) {
    ANALISE_STATE.visao = contexto.visao || "regional";
  } else if (!ANALISE_STATE.visao) {
    ANALISE_STATE.visao = contexto.visao || "regional";
  }

  if (!contexto.podeTrocarVisao && contexto.escopo?.regional) {
    ANALISE_STATE.regional = contexto.escopo.regional;
  }

  if (!contexto.podeTrocarVisao && contexto.escopo?.loja_codigo) {
    ANALISE_STATE.loja = contexto.escopo.loja_codigo;
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

        <div class="dashboard-filtros analise-filtros">
          <span id="analiseAnoWrap" style="display:none;">
            <select id="analiseAno" onchange="analiseAlterarAno(this.value)">
              ${gerarOptionsAnoAnalise([ANALISE_STATE.ano])}
            </select>
          </span>

          <select id="analiseMes" onchange="analiseAlterarMes(this.value)">
            ${gerarOptionsMesesAnalise()}
          </select>

          <select id="analiseSemana" onchange="analiseAlterarSemana(this.value)">
            ${gerarOptionsSemanasAnalise()}
          </select>

          <select id="analiseIndicador" onchange="analiseAlterarIndicador(this.value)">
            ${gerarOptionsIndicadoresAnalise()}
          </select>
        </div>

        <div id="analisePodio" class="analise-podio-fixo"></div>

        <div class="analise-abas">
          <button class="analise-aba ${ANALISE_STATE.aba === "evolucao" ? "ativa" : ""}" onclick="analiseTrocarAba('evolucao')">
            <span class="analise-aba-ico">📈</span> Evolução
          </button>
          <button class="analise-aba ${ANALISE_STATE.aba === "periodo" ? "ativa" : ""}" onclick="analiseTrocarAba('periodo')">
            <span class="analise-aba-ico">🔄</span> Período vs Período
          </button>
          <button class="analise-aba ${ANALISE_STATE.aba === "justificativas" ? "ativa" : ""}" onclick="analiseTrocarAba('justificativas')">
            <span class="analise-aba-ico">📝</span> Justificativas
          </button>
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

  // mostra o filtro de ano só se houver dados de mais de um ano
  analiseAtualizarVisibilidadeAno();
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
// 📅 FILTROS DE MÊS E SEMANA
// ==========================
const MESES_ANALISE = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function gerarOptionsMesesAnalise() {
  return MESES_ANALISE.map(
    (nome, i) =>
      `<option value="${i}" ${ANALISE_STATE.mes === i ? "selected" : ""}>${nome}</option>`,
  ).join("");
}

// semanas de um mês (índice 0-11) do ano vigente
function analiseSemanasDoMes(indiceMes, ano = ANALISE_STATE.ano) {
  // usa o MESMO cálculo das tabelas: a semana pertence ao mês cuja
  // segunda-feira cai dentro dele (sem sobreposição entre meses)
  if (
    window.FiltroPeriodo &&
    typeof window.FiltroPeriodo.getSemanasDoMes === "function"
  ) {
    return window.FiltroPeriodo.getSemanasDoMes(indiceMes + 1, ano);
  }

  // fallback: segunda-feira no mês
  const primeiroDia = new Date(ano, indiceMes, 1);
  const ultimoDia = new Date(ano, indiceMes + 1, 0);
  const set = new Set();
  for (let d = new Date(primeiroDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 1) {
      set.add(getNumeroSemanaPorDataAnalise(d).toString().padStart(2, "0"));
    }
  }
  return [...set].sort((a, b) => Number(a) - Number(b));
}

// ===== ANO (filtro oculto até existir dado de mais de um ano) =====
// usa created_at como referência de ano (os registros não gravam ano)
function analiseAplicarFiltroAno(query) {
  const ano = Number(ANALISE_STATE.ano) || new Date().getFullYear();
  const inicio = `${ano}-01-01T00:00:00`;
  const fim = `${ano + 1}-01-01T00:00:00`;
  return query.gte("created_at", inicio).lt("created_at", fim);
}

async function analiseDetectarAnos() {
  const anoAtual = new Date().getFullYear();
  try {
    const [minR, maxR] = await Promise.all([
      window.db.from("resultados").select("created_at").order("created_at", { ascending: true }).limit(1),
      window.db.from("resultados").select("created_at").order("created_at", { ascending: false }).limit(1),
    ]);
    const anoMin = minR?.data?.[0]?.created_at
      ? new Date(minR.data[0].created_at).getFullYear()
      : anoAtual;
    const anoMax = maxR?.data?.[0]?.created_at
      ? new Date(maxR.data[0].created_at).getFullYear()
      : anoAtual;
    const anos = [];
    for (let a = Math.max(anoMax, anoAtual); a >= Math.min(anoMin, anoAtual); a--) {
      anos.push(a);
    }
    return anos.length ? anos : [anoAtual];
  } catch (e) {
    return [anoAtual];
  }
}

function gerarOptionsAnoAnalise(anos) {
  return (anos || [ANALISE_STATE.ano])
    .map(
      (a) =>
        `<option value="${a}" ${Number(ANALISE_STATE.ano) === Number(a) ? "selected" : ""}>${a}</option>`,
    )
    .join("");
}

async function analiseAlterarAno(ano) {
  ANALISE_STATE.ano = Number(ano) || new Date().getFullYear();
  // repopula as semanas do mês para o novo ano e reseta para "Mês inteiro"
  ANALISE_STATE.semana = "TODAS";
  const selSemana = document.getElementById("analiseSemana");
  if (selSemana) {
    selSemana.innerHTML = gerarOptionsSemanasAnalise();
    selSemana.value = "TODAS";
  }
  await carregarDadosAnalise();
}

// mostra o seletor de ano só quando há dados de mais de um ano
async function analiseAtualizarVisibilidadeAno() {
  const wrap = document.getElementById("analiseAnoWrap");
  const sel = document.getElementById("analiseAno");
  if (!wrap || !sel) return;
  const anos = await analiseDetectarAnos();
  if (anos.length > 1) {
    sel.innerHTML = gerarOptionsAnoAnalise(anos);
    wrap.style.display = "";
  } else {
    wrap.style.display = "none";
  }
}

function gerarOptionsSemanasAnalise() {
  const semanas = analiseSemanasDoMes(ANALISE_STATE.mes);
  let html = `<option value="TODAS" ${ANALISE_STATE.semana === "TODAS" ? "selected" : ""}>Mês inteiro</option>`;
  html += semanas
    .map(
      (s) =>
        `<option value="${s}" ${ANALISE_STATE.semana === s ? "selected" : ""}>Semana ${s}</option>`,
    )
    .join("");
  return html;
}

async function analiseAlterarMes(indice) {
  ANALISE_STATE.mes = parseInt(indice, 10);
  ANALISE_STATE.semana = "TODAS"; // ao trocar de mês, volta para mês inteiro

  const selSemana = document.getElementById("analiseSemana");
  if (selSemana) {
    selSemana.innerHTML = gerarOptionsSemanasAnalise();
    selSemana.value = "TODAS";
  }

  destruirGraficosAnalise();
  await carregarDadosAnalise(getContextoDashboardUsuario());
}

// ==========================
// 🗂️ ABAS DE ANÁLISE (Evolução / Período / Justificativas)
// ==========================
async function analiseTrocarAba(aba) {
  ANALISE_STATE.aba = aba;
  destruirGraficosAnalise();

  document.querySelectorAll(".analise-aba").forEach((b) => {
    b.classList.remove("ativa");
  });
  const btn = document.querySelector(`.analise-aba[onclick*="${aba}"]`);
  if (btn) btn.classList.add("ativa");

  await carregarDadosAnalise(getContextoDashboardUsuario());
}

// injeta estilos das abas uma única vez
function garantirEstilosAbasAnalise() {
  if (document.getElementById("analise-abas-estilos")) return;
  const style = document.createElement("style");
  style.id = "analise-abas-estilos";
  style.textContent = `
    /* paleta profissional — deep navy + electric blue (dashboards SaaS/analytics) */
    :root {
      --an-page: #0a1020;
      --an-card: #121d33;
      --an-card-2: #0e1830;
      --an-line: rgba(148,163,184,0.12);
      --an-txt: #f1f5f9;
      --an-txt-soft: #8e9cb3;
      --an-accent: #3a82ff;
      --an-accent-soft: rgba(58,130,255,0.16);
      --an-green: #34d399;
      --an-red: #fb7185;
    }

    /* o wrapper branco do layout NÃO pode aparecer atrás da análise */
    .pagina-container:has(#analiseContainer) {
      max-width: none !important; width: 100% !important;
      padding: 0 !important; margin: 0 !important; background: var(--an-page) !important;
    }

    /* container ocupa toda a área útil com fundo escuro (mata o branco) */
    #analiseContainer.dashboard-container {
      background: var(--an-page) !important;
      margin: calc(-1 * clamp(15px, 2vw, 25px)) !important;
      padding: clamp(18px, 2.4vw, 30px) !important;
      border: none !important; border-radius: 0 !important;
      min-height: calc(100dvh - 34px) !important;
      color: var(--an-txt);
    }

    /* cabeçalho */
    #analiseContainer .dashboard-titulo {
      color: var(--an-txt) !important; font-weight: 800; letter-spacing: 0.2px;
    }
    #analiseContainer .dashboard-subtitulo { color: var(--an-txt-soft) !important; }

    /* filtros */
    .analise-filtros {
      display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 6px;
    }
    .analise-filtros select {
      background: var(--an-card); color: var(--an-txt);
      border: 1px solid var(--an-line); border-radius: 10px;
      padding: 9px 14px; font-size: 13px; font-weight: 600;
      cursor: pointer; outline: none; transition: border-color 0.15s; min-width: 140px;
    }
    .analise-filtros select:hover { border-color: rgba(58,130,255,0.55); }
    .analise-filtros select:focus { border-color: var(--an-accent); }

    /* abas */
    .analise-abas {
      display: flex; gap: 6px; flex-wrap: wrap;
      margin: 18px 0 20px 0; border-bottom: 1px solid var(--an-line); padding-bottom: 0;
    }
    .analise-aba {
      display: inline-flex; align-items: center; gap: 7px;
      background: transparent; color: var(--an-txt-soft);
      border: none; border-bottom: 2px solid transparent;
      padding: 10px 18px; font-size: 13.5px; font-weight: 700; cursor: pointer;
      transition: color 0.15s, border-color 0.15s; margin-bottom: -1px;
    }
    .analise-aba:hover { color: var(--an-txt); }
    .analise-aba.ativa { color: #fff; border-bottom-color: var(--an-accent); }
    .analise-aba-ico { font-size: 14px; opacity: 0.9; }

    /* layout base (antes vinha do dashboard.css, agora autônomo) */
    #analiseContainer .dashboard-topo { margin: 0 0 6px 0; }
    #analiseContainer .dashboard-titulos { display: flex; flex-direction: column; gap: 2px; }
    #analiseContainer .dashboard-filtros {
      display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 8px 0;
    }
    #analiseContainer .dashboard-grid { display: block; }
    #analiseConteudo .span-12 { width: 100%; }
    #analiseConteudo .dashboard-card + .dashboard-card { margin-top: 16px; }

    /* cards */
    #analiseConteudo .dashboard-card {
      background: var(--an-card); border: 1px solid var(--an-line);
      border-radius: 16px; padding: 22px 24px;
    }
    #analiseConteudo h3 { font-size: 16px; color: var(--an-txt); letter-spacing: 0.2px; }

    /* área do gráfico — fundo escuro (sem branco) */
    #analiseConteudo .dashboard-grafico-area,
    #analiseConteudo .dashboard-grafico-area canvas {
      background: transparent !important; border-radius: 12px;
    }
    #analiseConteudo canvas { background: transparent !important; }

    /* tabelas */
    .analise-tabela-var { width: 100%; border-collapse: collapse; font-size: 13px; }
    .analise-tabela-var thead th {
      color: var(--an-txt-soft); font-weight: 700; font-size: 11px;
      text-transform: uppercase; letter-spacing: 0.5px;
      padding: 11px 14px; text-align: left; border-bottom: 1px solid var(--an-line);
    }
    .analise-tabela-var tbody td {
      padding: 12px 14px; color: var(--an-txt);
      border-bottom: 1px solid rgba(148,163,184,0.06);
    }
    .analise-tabela-var tbody tr:hover { background: rgba(58,130,255,0.06); }
    .analise-var-sobe { color: var(--an-green); font-weight: 800; }
    .analise-var-desce { color: var(--an-red); font-weight: 800; }
    .analise-var-igual { color: var(--an-txt-soft); font-weight: 700; }

    .analise-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 32px; padding: 3px 9px; border-radius: 8px;
      background: var(--an-accent-soft); color: #bcd4ff; font-weight: 800; font-size: 12px;
    }

    .analise-aviso {
      padding: 60px 30px; text-align: center; color: var(--an-txt-soft);
      font-size: 14px; line-height: 1.6;
    }
    .analise-aviso strong { color: var(--an-txt); }

    /* ===== PÓDIO DE CAMPEÃS (fixo no topo, horizontal) ===== */
    .analise-podio-fixo { margin: 6px 0 2px 0; }
    .analise-podio-wrap {
      background: linear-gradient(180deg, #14213d 0%, #0e1830 100%);
      border: 1px solid var(--an-line); border-radius: 14px;
      padding: 12px 16px 14px;
    }
    .analise-podio-titulo {
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px;
      color: var(--an-txt-soft); font-weight: 700; margin-bottom: 10px;
      display: flex; align-items: center; gap: 7px;
    }
    .analise-podio {
      display: flex; justify-content: flex-start; align-items: stretch;
      gap: 10px; flex-wrap: nowrap; overflow-x: auto;
    }
    .podio-pos {
      flex: 1 1 0; min-width: 0;
      border-radius: 12px; padding: 10px 12px;
      border: 1px solid var(--an-line); background: var(--an-card);
      display: flex; align-items: center; gap: 10px;
    }
    .podio-pos .podio-medalha { font-size: 24px; line-height: 1; flex-shrink: 0; }
    .podio-pos .podio-info { min-width: 0; flex: 1; }
    .podio-pos .podio-loja {
      font-weight: 800; color: var(--an-txt); font-size: 13px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .podio-pos .podio-cod { color: var(--an-txt-soft); font-size: 10.5px; font-weight: 700; }
    .podio-pos .podio-valor { font-size: 14px; font-weight: 900; margin-top: 2px; }
    /* 1º — ouro */
    .podio-pos.pos-1 {
      background: linear-gradient(180deg, rgba(240,180,41,0.16), rgba(240,180,41,0.04));
      border-color: rgba(240,180,41,0.5);
    }
    .podio-pos.pos-1 .podio-valor { color: #f5c451; }
    .podio-pos.pos-1 .podio-medalha { font-size: 28px; }
    /* 2º — prata */
    .podio-pos.pos-2 { border-color: rgba(203,213,225,0.35); }
    .podio-pos.pos-2 .podio-valor { color: #cbd5e1; }
    /* 3º — bronze */
    .podio-pos.pos-3 { border-color: rgba(180,120,70,0.4); }
    .podio-pos.pos-3 .podio-valor { color: #d8995e; }
    @media (max-width: 640px) {
      .podio-pos .podio-valor { font-size: 13px; }
      .podio-pos .podio-loja { font-size: 12px; }
    }
  `;
  document.head.appendChild(style);
}

// tipo do indicador selecionado (percentual → média; senão → soma)
function analiseTipoIndicadorAtual() {
  if (ANALISE_STATE.indicador === "TODOS") return "numero";
  try {
    const classe = ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe;
    if (typeof window.getCampoConfig === "function") {
      const cfg = window.getCampoConfig(ANALISE_STATE.indicador, "valor", classe);
      return cfg?.tipo || "numero";
    }
  } catch (e) {}
  return "numero";
}

function analiseEhPercentual(tipo) {
  return /percent|porcent|%/i.test(tipo || "");
}

// menor é melhor? (ordemRanking asc → ex: ruptura, quebra)
function analiseMenorMelhor() {
  if (ANALISE_STATE.indicador === "TODOS") return false;
  try {
    if (typeof getIndicadorConfig === "function") {
      const classe = ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe;
      const cfg = getIndicadorConfig(ANALISE_STATE.indicador, classe);
      return (cfg?.ordemRanking || "").toString().toLowerCase() === "asc";
    }
  } catch (e) {}
  return false;
}

// menor é melhor para um indicador do banco (por nome)
function menorMelhorPorIndicadorBanco(indBanco) {
  try {
    if (typeof getIndicadorConfig === "function") {
      const cfg = getIndicadorConfig(indBanco, null);
      return (cfg?.ordemRanking || "").toString().toLowerCase() === "asc";
    }
  } catch (e) {}
  return false;
}

// score de evolução por loja (1ª vs última semana), média entre TODOS os indicadores
function calcularEvolucaoPorLoja(registros, semanas) {
  const porLoja = {};
  registros.forEach((r) => {
    const temValor = r.valor !== null && r.valor !== undefined && r.valor !== "";
    if (!temValor) return;
    const v = Number(r.valor);
    if (!isFinite(v)) return;
    porLoja[r.loja] = porLoja[r.loja] || {};
    porLoja[r.loja][r.indicador] = porLoja[r.loja][r.indicador] || {};
    porLoja[r.loja][r.indicador][r.semana] = v;
  });

  const resultado = [];
  Object.entries(porLoja).forEach(([loja, indicadores]) => {
    const melhoras = [];
    Object.entries(indicadores).forEach(([indBanco, mapaSem]) => {
      const semComDado = semanas.filter((s) => mapaSem[s] !== undefined);
      if (semComDado.length < 2) return;
      const primeiro = mapaSem[semComDado[0]];
      const ultimo = mapaSem[semComDado[semComDado.length - 1]];
      if (primeiro === 0) return;
      const varRel = ((ultimo - primeiro) / Math.abs(primeiro)) * 100;
      melhoras.push(menorMelhorPorIndicadorBanco(indBanco) ? -varRel : varRel);
    });
    if (!melhoras.length) return;
    const score = melhoras.reduce((a, b) => a + b, 0) / melhoras.length;
    const [cod, ...resto] = loja.split(" - ");
    resultado.push({ codigo: cod, nome: resto.join(" - ") || loja, score });
  });
  return resultado.sort((a, b) => b.score - a.score);
}

// score de variação por loja (mês atual vs anterior), média entre TODOS os indicadores
function calcularVariacaoPorLoja(registros, semanasAtual, semanasAnterior) {
  const porLoja = {};
  registros.forEach((r) => {
    // valor null/"" NÃO vira 0 (registro só de justificativa é ignorado aqui)
    const temValor = r.valor !== null && r.valor !== undefined && r.valor !== "";
    if (!temValor) return;
    const v = Number(r.valor);
    if (!isFinite(v)) return;
    porLoja[r.loja] = porLoja[r.loja] || {};
    porLoja[r.loja][r.indicador] = porLoja[r.loja][r.indicador] || { at: [], an: [] };
    if (semanasAtual.includes(r.semana)) porLoja[r.loja][r.indicador].at.push(v);
    else if (semanasAnterior.includes(r.semana)) porLoja[r.loja][r.indicador].an.push(v);
  });

  const media = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  const resultado = [];
  Object.entries(porLoja).forEach(([loja, indicadores]) => {
    const melhoras = [];
    Object.entries(indicadores).forEach(([indBanco, dados]) => {
      const at = media(dados.at);
      const an = media(dados.an);
      if (at === null || an === null || an === 0) return;
      const varRel = ((at - an) / Math.abs(an)) * 100;
      melhoras.push(menorMelhorPorIndicadorBanco(indBanco) ? -varRel : varRel);
    });
    if (!melhoras.length) return;
    const score = melhoras.reduce((a, b) => a + b, 0) / melhoras.length;
    const [cod, ...resto] = loja.split(" - ");
    resultado.push({ codigo: cod, nome: resto.join(" - ") || loja, score });
  });
  return resultado.sort((a, b) => b.score - a.score);
}

function scoreParaTextoPodio(score) {
  return score >= 0
    ? `<span class="analise-var-sobe">▲ ${score.toFixed(1).replace(".", ",")}%</span>`
    : `<span class="analise-var-desce">▼ ${Math.abs(score).toFixed(1).replace(".", ",")}%</span>`;
}

// monta o HTML do pódio (top 3). itens = [{nome, codigo, valorTexto}] já ordenados 1º→3º
function renderPodioAnalise(itens, titulo) {
  const podio = document.getElementById("analisePodio");

  if (!itens || !itens.length) {
    if (podio) podio.innerHTML = "";
    return;
  }

  const card = (item, pos, medalha) => {
    if (!item) return "";
    return `
      <div class="podio-pos pos-${pos}">
        <div class="podio-medalha">${medalha}</div>
        <div class="podio-info">
          <div class="podio-cod">Loja ${escapeHtmlAnalise(item.codigo)}</div>
          <div class="podio-loja">${escapeHtmlAnalise(item.nome)}</div>
          <div class="podio-valor">${item.valorTexto}</div>
        </div>
      </div>
    `;
  };

  const html = `
    <div class="analise-podio-wrap">
      <div class="analise-podio-titulo">🏆 ${escapeHtmlAnalise(titulo)}</div>
      <div class="analise-podio">
        ${card(itens[0], 1, "🥇")}
        ${card(itens[1], 2, "🥈")}
        ${card(itens[2], 3, "🥉")}
      </div>
    </div>
  `;

  if (podio) podio.innerHTML = html;
}

function analiseAgregar(valores, tipo) {
  if (!valores.length) return null;
  const soma = valores.reduce((a, b) => a + b, 0);
  return analiseEhPercentual(tipo) ? soma / valores.length : soma;
}

function analiseFormatar(valor, tipo) {
  if (valor === null || valor === undefined || !isFinite(valor)) return "—";
  if (analiseEhPercentual(tipo)) return formatarPercentualBRAnalise(valor, 2);
  if (tipoMoedaAnalise(tipo)) return formatarMoedaBRAnalise(valor);
  return formatarNumeroAnalise(valor, 0);
}

// gera as últimas N semanas (numeração ISO simples), terminando na semana atual
function analiseUltimasSemanas(qtd) {
  const atual = parseInt(
    ANALISE_STATE.semana || getSemanaAtual().toString().padStart(2, "0"),
    10,
  );
  const lista = [];
  for (let i = qtd - 1; i >= 0; i--) {
    let s = atual - i;
    if (s <= 0) s = 52 + s;
    lista.push(s.toString().padStart(2, "0"));
  }
  return lista;
}

// semanas do mês vigente e do mês anterior
function analiseSemanasMes(offsetMeses) {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + offsetMeses;
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const set = new Set();
  for (let d = new Date(primeiroDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
    set.add(getNumeroSemanaPorDataAnalise(d).toString().padStart(2, "0"));
  }
  return {
    semanas: [...set],
    rotulo: primeiroDia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
  };
}

function analiseFiltrarPorIndicadorClasse(query) {
  if (ANALISE_STATE.classe !== "TODAS") query = query.eq("classe", ANALISE_STATE.classe);
  if (ANALISE_STATE.indicador !== "TODOS") {
    const ind = getIndicadorBancoAnalise(
      ANALISE_STATE.indicador,
      ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe,
    );
    query = query.eq("indicador", ind);
  }
  return query;
}

function analiseAvisoSelecioneIndicador(alvo, msg) {
  alvo.innerHTML = `
    <div class="dashboard-card span-12">
      <div class="analise-aviso">${msg}</div>
    </div>
  `;
}

// ===== ABA 1: EVOLUÇÃO (tendência ao longo das semanas) =====
async function renderAbaEvolucao({ lojasVisuaisSet, lojasVisuais }) {
  garantirEstilosAbasAnalise();
  const alvo = document.getElementById("analiseConteudo");
  if (!alvo) return;

  const todosIndicadores = ANALISE_STATE.indicador === "TODOS";
  const semanaEspecifica =
    ANALISE_STATE.semana && ANALISE_STATE.semana !== "TODAS";

  // 📌 semana específica → mostra o VALOR daquela semana
  if (semanaEspecifica) {
    await renderEvolucaoSemanaEspecifica({
      lojasVisuaisSet,
      lojasVisuais,
      alvo,
      todosIndicadores,
    });
    return;
  }

  const semanas = analiseSemanasDoMes(ANALISE_STATE.mes);
  const semanasBusca = [
    ...new Set(semanas.flatMap((s) => [s, String(parseInt(s, 10))])),
  ];

  let query = window.db.from("resultados").select("*").in("semana", semanasBusca);
  query = analiseAplicarFiltroAno(query);
  query = analiseFiltrarPorIndicadorClasse(query);
  const { data, error } = await query;
  if (error) throw error;
  (data || []).forEach((r) => {
    r.semana = String(r.semana).padStart(2, "0");
  });

  const registros = (data || []).filter((r) => lojasVisuaisSet.has(r.loja));

  // ===== PÓDIO: lojas que mais evoluíram (todos os indicadores) =====
  const ranking = calcularEvolucaoPorLoja(registros, semanas);
  const podioItens = ranking.slice(0, 3).map((x) => ({
    codigo: x.codigo,
    nome: x.nome,
    valorTexto: scoreParaTextoPodio(x.score),
  }));
  renderPodioAnalise(podioItens, "Lojas que mais evoluíram no mês");

  // ===== CONTEÚDO =====
  // com TODOS os indicadores → tabela de ranking de evolução (não dá linha única)
  if (todosIndicadores) {
    if (!ranking.length) {
      analiseAvisoSelecioneIndicador(alvo, "Sem dados suficientes para calcular a evolução neste mês.");
      return;
    }
    const linhas = ranking
      .map(
        (l, i) => `
        <tr>
          <td><span class="analise-badge">${i + 1}</span></td>
          <td><strong>${l.codigo}</strong> ${escapeHtmlAnalise(l.nome)}</td>
          <td>${scoreParaTextoPodio(l.score)}</td>
        </tr>`,
      )
      .join("");
    alvo.innerHTML = `
      <div class="dashboard-card span-12">
        <h3 style="margin:0 0 4px 0;">Ranking de evolução — todos os indicadores</h3>
        <p style="margin:0 0 12px 0;color:var(--an-txt-soft);font-size:12px;">
          Evolução média (1ª vs última semana do mês), considerando o sentido de cada indicador — ${MESES_ANALISE[ANALISE_STATE.mes]}
        </p>
        <table class="analise-tabela-var">
          <thead><tr><th>#</th><th>Loja</th><th>Evolução média</th></tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;
    return;
  }

  // com 1 indicador → gráfico de linha
  const tipo = analiseTipoIndicadorAtual();
  const porSemana = {};
  semanas.forEach((s) => (porSemana[s] = []));
  registros.forEach((r) => {
    const temValor = r.valor !== null && r.valor !== undefined && r.valor !== "";
    const v = Number(r.valor);
    if (porSemana[r.semana] && temValor && isFinite(v)) porSemana[r.semana].push(v);
  });

  const labels = semanas.map((s) => `Sem ${s}`);
  const dados = semanas.map((s) => {
    const agg = analiseAgregar(porSemana[s], tipo);
    return agg === null ? null : Number(agg.toFixed(2));
  });

  alvo.innerHTML = `
    <div class="dashboard-card span-12">
      <h3 style="margin:0 0 4px 0;">Evolução — ${escapeHtmlAnalise(ANALISE_STATE.indicador)}</h3>
      <p style="margin:0 0 12px 0;color:var(--an-txt-soft);font-size:12px;">
        ${analiseEhPercentual(tipo) ? "Média" : "Total"} de todas as lojas, por semana — ${MESES_ANALISE[ANALISE_STATE.mes]}
      </p>
      <div class="dashboard-grafico-area" style="height:360px;">
        <canvas id="analiseChartEvolucao"></canvas>
      </div>
    </div>
  `;

  const canvas = document.getElementById("analiseChartEvolucao");
  if (!canvas || typeof Chart === "undefined") return;

  window.analiseCharts.principal = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: ANALISE_STATE.indicador,
          data: dados,
          borderColor: "#3a82ff",
          backgroundColor: "rgba(58,130,255,0.15)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#3a82ff",
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => analiseFormatar(ctx.parsed.y, tipo) } },
      },
      scales: {
        x: { ticks: { color: "#8e9cb3" }, grid: { color: "rgba(255,255,255,0.05)" } },
        y: {
          ticks: { color: "#8e9cb3", callback: (v) => analiseFormatar(v, tipo) },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
      },
    },
  });
}

// ===== SEMANA ESPECÍFICA: mostra o valor da semana selecionada =====
async function renderEvolucaoSemanaEspecifica({ lojasVisuaisSet, lojasVisuais, alvo, todosIndicadores }) {
  const semana = ANALISE_STATE.semana;
  const semVariantes = [semana, String(parseInt(semana, 10))].filter(
    (v, i, a) => v && a.indexOf(v) === i,
  );

  let query = window.db.from("resultados").select("*").in("semana", semVariantes);
  query = analiseAplicarFiltroAno(query);
  query = analiseFiltrarPorIndicadorClasse(query);
  const { data, error } = await query;
  if (error) throw error;

  const registros = (data || []).filter((r) => lojasVisuaisSet.has(r.loja));

  // lista completa de lojas visíveis (todas sempre aparecem)
  const todasLojas = (lojasVisuais || []).map((l) => {
    const chave = getChaveLojaAnalise(l);
    return { chave, codigo: String(l.codigo), nome: l.nome || chave };
  });

  // ----- 1 indicador: tabela com o VALOR de cada loja na semana -----
  if (!todosIndicadores) {
    const tipo = analiseTipoIndicadorAtual();
    const menorMelhor = analiseMenorMelhor();

    // pré-popula TODAS as lojas visíveis (garante que as 29 apareçam)
    const porLoja = {};
    todasLojas.forEach((l) => {
      porLoja[l.chave] = {
        codigo: l.codigo,
        nome: l.nome,
        valores: [],
        justificativa: "",
      };
    });

    registros.forEach((r) => {
      if (!porLoja[r.loja]) {
        const partes = String(r.loja).split(" - ");
        porLoja[r.loja] = {
          codigo: partes.shift() || r.loja,
          nome: partes.join(" - ") || r.loja,
          valores: [],
          justificativa: "",
        };
      }
      const v = Number(r.valor);
      if (r.valor !== null && r.valor !== undefined && r.valor !== "" && isFinite(v)) {
        porLoja[r.loja].valores.push(v);
      }
      if (r.justificativa) porLoja[r.loja].justificativa = String(r.justificativa);
    });

    const comValor = [];
    const semResposta = []; // sem valor, COM justificativa → vão por último
    const semDados = []; // sem valor e sem justificativa
    Object.values(porLoja).forEach((info) => {
      if (info.valores.length) {
        const val = analiseAgregar(info.valores, tipo);
        if (val !== null && isFinite(val)) {
          comValor.push({
            codigo: info.codigo,
            nome: info.nome,
            valor: val,
            justificativa: info.justificativa,
          });
          return;
        }
      }
      if (info.justificativa) {
        semResposta.push({ codigo: info.codigo, nome: info.nome, justificativa: info.justificativa });
      } else {
        semDados.push({ codigo: info.codigo, nome: info.nome });
      }
    });

    comValor.sort((a, b) => (menorMelhor ? a.valor - b.valor : b.valor - a.valor));
    semDados.sort((a, b) => String(a.nome).localeCompare(String(b.nome), "pt-BR"));
    semResposta.sort((a, b) =>
      String(a.nome).localeCompare(String(b.nome), "pt-BR"),
    );

    const temJustificativa =
      semResposta.length > 0 || comValor.some((l) => l.justificativa);

    renderPodioAnalise(
      comValor.slice(0, 3).map((l) => ({
        codigo: l.codigo,
        nome: l.nome,
        valorTexto: analiseFormatar(l.valor, tipo),
      })),
      `Melhores da semana ${semana}`,
    );

    const colJustHead = temJustificativa ? "<th>Justificativa</th>" : "";
    const celJust = (txt) =>
      temJustificativa
        ? `<td>${txt ? `<span style="color:#fbbf24;font-size:11px;font-weight:600;">${escapeHtmlAnalise(txt)}</span>` : ""}</td>`
        : "";

    const linhasComValor = comValor
      .map(
        (l, i) => `
        <tr>
          <td><span class="analise-badge">${i + 1}</span></td>
          <td><strong>${l.codigo}</strong> ${escapeHtmlAnalise(l.nome)}</td>
          <td><strong>${analiseFormatar(l.valor, tipo)}</strong></td>
          ${celJust(l.justificativa)}
        </tr>`,
      )
      .join("");

    const linhasSemDados = semDados
      .map(
        (l) => `
        <tr style="opacity:0.7;">
          <td><span class="analise-badge" style="background:rgba(148,163,184,0.18);color:#8e9cb3;">—</span></td>
          <td><strong>${l.codigo}</strong> ${escapeHtmlAnalise(l.nome)}</td>
          <td><span style="color:var(--an-txt-soft);">Sem dados</span></td>
          ${celJust("")}
        </tr>`,
      )
      .join("");

    const linhasSemResposta = semResposta
      .map(
        (l) => `
        <tr style="opacity:0.9;">
          <td><span class="analise-badge" style="background:rgba(251,191,36,0.2);color:#fbbf24;">—</span></td>
          <td><strong>${l.codigo}</strong> ${escapeHtmlAnalise(l.nome)}</td>
          <td><span style="color:var(--an-txt-soft);">Sem resposta</span></td>
          ${celJust(l.justificativa)}
        </tr>`,
      )
      .join("");

    const total = comValor.length + semDados.length + semResposta.length;

    alvo.innerHTML = `
      <div class="dashboard-card span-12">
        <h3 style="margin:0 0 4px 0;">Valores da semana ${semana} — ${escapeHtmlAnalise(ANALISE_STATE.indicador)}</h3>
        <p style="margin:0 0 12px 0;color:var(--an-txt-soft);font-size:12px;">
          ${menorMelhor ? "Menor valor é melhor" : "Maior valor é melhor"} • ${total} loja(s) • ${comValor.length} com valor${semResposta.length ? ` • ${semResposta.length} com justificativa (ao final)` : ""}
        </p>
        <table class="analise-tabela-var">
          <thead><tr><th>#</th><th>Loja</th><th>Valor</th>${colJustHead}</tr></thead>
          <tbody>${linhasComValor}${linhasSemDados}${linhasSemResposta}</tbody>
        </table>
      </div>
    `;
    return;
  }

  // ----- TODOS os indicadores: ranking por desempenho relativo da semana -----
  const ranking = calcularDestaqueSemana(registros);

  renderPodioAnalise(
    ranking.slice(0, 3).map((x) => ({
      codigo: x.codigo,
      nome: x.nome,
      valorTexto: `${x.score.toFixed(0)} pts`,
    })),
    `Destaques da semana ${semana}`,
  );

  if (!ranking.length) {
    analiseAvisoSelecioneIndicador(
      alvo,
      `Sem dados suficientes na semana ${semana}.`,
    );
    return;
  }

  const corpo = ranking
    .map(
      (l, i) => `
      <tr>
        <td><span class="analise-badge">${i + 1}</span></td>
        <td><strong>${l.codigo}</strong> ${escapeHtmlAnalise(l.nome)}</td>
        <td>${l.score.toFixed(0)} pts <span style="color:var(--an-txt-soft);font-size:11px;">(${l.indicadores} ind.)</span></td>
      </tr>`,
    )
    .join("");

  alvo.innerHTML = `
    <div class="dashboard-card span-12">
      <h3 style="margin:0 0 4px 0;">Desempenho da semana ${semana} — todos os indicadores</h3>
      <p style="margin:0 0 12px 0;color:var(--an-txt-soft);font-size:12px;">
        Pontuação relativa (0–100) de cada loja frente às demais nessa semana, considerando o sentido de cada indicador.
        Selecione um indicador específico para ver os valores absolutos.
      </p>
      <table class="analise-tabela-var">
        <thead><tr><th>#</th><th>Loja</th><th>Pontuação</th></tr></thead>
        <tbody>${corpo}</tbody>
      </table>
    </div>
  `;
}

// pontuação relativa (0–100) de cada loja numa semana, média entre indicadores
function calcularDestaqueSemana(registros) {
  const porInd = {};
  registros.forEach((r) => {
    const temValor = r.valor !== null && r.valor !== undefined && r.valor !== "";
    if (!temValor) return;
    const v = Number(r.valor);
    if (!isFinite(v)) return;
    (porInd[r.indicador] = porInd[r.indicador] || []).push({ loja: r.loja, valor: v });
  });

  const scoreLoja = {}; // loja -> { soma, n }
  Object.entries(porInd).forEach(([ind, arr]) => {
    const menorMelhor = menorMelhorPorIndicadorBanco(ind);
    const ordenado = [...arr].sort((a, b) =>
      menorMelhor ? a.valor - b.valor : b.valor - a.valor,
    );
    const n = ordenado.length;
    ordenado.forEach((item, i) => {
      const pct = n > 1 ? (100 * (n - 1 - i)) / (n - 1) : 100;
      const s = (scoreLoja[item.loja] = scoreLoja[item.loja] || { soma: 0, n: 0 });
      s.soma += pct;
      s.n += 1;
    });
  });

  return Object.entries(scoreLoja)
    .map(([loja, s]) => {
      const partes = String(loja).split(" - ");
      const codigo = partes.shift() || loja;
      const nome = partes.join(" - ") || loja;
      return {
        codigo,
        nome,
        score: s.n ? s.soma / s.n : 0,
        indicadores: s.n,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// define os dois períodos comparados conforme o modo (mês a mês / semana a semana)
function analisePeriodosComparacao() {
  const modo = ANALISE_STATE.modoComparativo === "semana" ? "semana" : "mes";

  if (modo === "semana") {
    let semAtual = ANALISE_STATE.semana;
    if (!semAtual || semAtual === "TODAS") {
      const sems = analiseSemanasDoMes(ANALISE_STATE.mes);
      semAtual = sems[sems.length - 1];
    }
    const nAtual = parseInt(semAtual, 10);
    const nAnt = nAtual - 1 <= 0 ? 52 + (nAtual - 1) : nAtual - 1;
    const semAnt = String(nAnt).padStart(2, "0");
    return {
      modo,
      atual: { semanas: [semAtual], rotulo: `Semana ${semAtual}` },
      anterior: { semanas: [semAnt], rotulo: `Semana ${semAnt}` },
    };
  }

  const idxAtual = ANALISE_STATE.mes;
  const idxAnterior = idxAtual - 1 < 0 ? 11 : idxAtual - 1;
  return {
    modo,
    atual: { semanas: analiseSemanasDoMes(idxAtual), rotulo: MESES_ANALISE[idxAtual] },
    anterior: { semanas: analiseSemanasDoMes(idxAnterior), rotulo: MESES_ANALISE[idxAnterior] },
  };
}

// botões segmentados Mês a mês / Semana a semana
function analiseToggleComparativoHtml() {
  const modo = ANALISE_STATE.modoComparativo === "semana" ? "semana" : "mes";
  const btn = (val, label) => `
    <button type="button" onclick="analiseTrocarModoComparativo('${val}')"
      style="flex:1;padding:9px 12px;border:1px solid var(--an-line);
        background:${modo === val ? "rgba(58,130,255,0.22)" : "transparent"};
        color:${modo === val ? "#ffffff" : "var(--an-txt-soft)"};
        border-radius:9px;font-weight:700;font-size:12px;cursor:pointer;">
      ${label}
    </button>`;
  return `
    <div class="dashboard-card span-12" style="display:flex;gap:8px;padding:10px;margin-bottom:12px;">
      ${btn("mes", "Mês a mês")}
      ${btn("semana", "Semana a semana")}
    </div>`;
}

async function analiseTrocarModoComparativo(modo) {
  ANALISE_STATE.modoComparativo = modo === "semana" ? "semana" : "mes";
  await carregarDadosAnalise(getContextoDashboardUsuario());
}

// ===== ABA 2: PERÍODO vs PERÍODO (mês atual vs mês anterior) =====
async function renderAbaPeriodo({ lojasEscopoBase, lojasVisuaisSet }) {
  garantirEstilosAbasAnalise();
  const alvo = document.getElementById("analiseConteudo");
  if (!alvo) return;

  const todosIndicadores = ANALISE_STATE.indicador === "TODOS";
  const tipo = analiseTipoIndicadorAtual();

  const periodos = analisePeriodosComparacao();
  const mesAtual = periodos.atual; // mantém os nomes para reuso abaixo
  const mesAnterior = periodos.anterior;
  const toggleHtml = analiseToggleComparativoHtml();
  const todas = [...new Set([...mesAtual.semanas, ...mesAnterior.semanas])];
  // busca padded ("05") e sem zero ("5") para não perder lançamentos por formato
  const todasBusca = [
    ...new Set(todas.flatMap((s) => [s, String(parseInt(s, 10))])),
  ];

  let query = window.db.from("resultados").select("*").in("semana", todasBusca);
  query = analiseAplicarFiltroAno(query);
  query = analiseFiltrarPorIndicadorClasse(query);
  const { data, error } = await query;
  if (error) throw error;

  // normaliza a semana de cada registro para "NN" (casa com mesAtual/mesAnterior)
  (data || []).forEach((r) => {
    r.semana = String(r.semana).padStart(2, "0");
  });

  const registros = (data || []).filter((r) => lojasVisuaisSet.has(r.loja));

  // ===== PÓDIO: maior evolução vs mês anterior (todos os indicadores) =====
  const ranking = calcularVariacaoPorLoja(registros, mesAtual.semanas, mesAnterior.semanas);
  const podioItens = ranking.slice(0, 3).map((x) => ({
    codigo: x.codigo,
    nome: x.nome,
    valorTexto: scoreParaTextoPodio(x.score),
  }));
  renderPodioAnalise(
    podioItens,
    periodos.modo === "semana"
      ? "Maior evolução vs semana anterior"
      : "Maior evolução vs mês anterior",
  );

  // ===== CONTEÚDO =====
  // TODOS os indicadores → tabela de ranking por evolução média
  if (todosIndicadores) {
    if (!ranking.length) {
      analiseAvisoSelecioneIndicador(alvo, "Sem dados suficientes para comparar os dois meses.");
      return;
    }
    const linhas = ranking
      .map(
        (l, i) => `
        <tr>
          <td><span class="analise-badge">${i + 1}</span></td>
          <td><strong>${l.codigo}</strong> ${escapeHtmlAnalise(l.nome)}</td>
          <td>${scoreParaTextoPodio(l.score)}</td>
        </tr>`,
      )
      .join("");
    alvo.innerHTML = `
      ${toggleHtml}
      <div class="dashboard-card span-12">
        <h3 style="margin:0 0 4px 0;">Evolução ${capitalizarAnalise(mesAnterior.rotulo)} → ${capitalizarAnalise(mesAtual.rotulo)} — todos os indicadores</h3>
        <p style="margin:0 0 12px 0;color:var(--an-txt-soft);font-size:12px;">
          Evolução média entre os dois períodos, considerando o sentido de cada indicador
        </p>
        <table class="analise-tabela-var">
          <thead><tr><th>#</th><th>Loja</th><th>Evolução média</th></tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;
    return;
  }

  // 1 indicador → tabela detalhada (anterior, atual, variação)
  const mapaLoja = {};
  lojasEscopoBase.forEach((l) => {
    const chave = getChaveLojaAnalise(l);
    if (lojasVisuaisSet.has(chave)) {
      mapaLoja[chave] = {
        nome: l.nome,
        codigo: l.codigo,
        atual: [],
        anterior: [],
        justAtual: "",
        justAnterior: "",
      };
    }
  });
  registros.forEach((r) => {
    if (!mapaLoja[r.loja]) return;

    const ehAtual = mesAtual.semanas.includes(r.semana);
    const ehAnterior = mesAnterior.semanas.includes(r.semana);
    if (!ehAtual && !ehAnterior) return;

    // captura a justificativa (sem resposta) de cada período
    if (r.justificativa) {
      if (ehAtual) mapaLoja[r.loja].justAtual = String(r.justificativa);
      else mapaLoja[r.loja].justAnterior = String(r.justificativa);
    }

    // só empurra valor REAL (null/"" NÃO viram 0)
    const temValor = r.valor !== null && r.valor !== undefined && r.valor !== "";
    if (!temValor) return;
    const v = Number(r.valor);
    if (!isFinite(v)) return;

    if (ehAtual) mapaLoja[r.loja].atual.push(v);
    else mapaLoja[r.loja].anterior.push(v);
  });

  const menorMelhor = analiseMenorMelhor();
  const todasLinhas = Object.values(mapaLoja).map((l) => {
    const at = analiseAgregar(l.atual, tipo);
    const an = analiseAgregar(l.anterior, tipo);
    let variacao = null;
    let variacaoEhPP = false; // true = pontos percentuais, false = % relativa
    if (at !== null && an !== null) {
      if (analiseEhPercentual(tipo)) {
        // Indicadores percentuais (ruptura, cancelamento, CNS...)
        // Usa diferença absoluta em pontos percentuais (p.p.) — mais legível
        // Ex: 1,00% → 2,58%: variação = 1,00 - 2,58 = -1,58 p.p.
        variacao = at - an;
        variacaoEhPP = true;
      } else if (an !== 0) {
        // Indicadores absolutos (moeda, inteiro) → variação relativa %
        variacao = ((at - an) / Math.abs(an)) * 100;
      }
    }
    const melhora = variacao === null ? null : menorMelhor ? -variacao : variacao;
    return { ...l, at, an, variacao, melhora, variacaoEhPP };
  });

  // lojas com valor no período em foco (atual) → rankeadas
  const comValor = todasLinhas
    .filter((l) => l.at !== null)
    .sort((a, b) => (b.melhora ?? -Infinity) - (a.melhora ?? -Infinity));

  // sem valor no período em foco (justificativa ou só período anterior) → por último
  const semResposta = todasLinhas
    .filter((l) => l.at === null && (l.justAtual || l.an !== null || l.justAnterior))
    .sort((a, b) => String(a.nome).localeCompare(String(b.nome), "pt-BR"));

  const ordenadas = [...comValor, ...semResposta];

  if (!ordenadas.length) {
    analiseAvisoSelecioneIndicador(alvo, "Sem dados suficientes para comparar os dois períodos.");
    return;
  }

  // célula de valor: valor real, ou justificativa destacada, ou "sem resposta"
  const celValor = (valor, just) => {
    if (valor !== null) return analiseFormatar(valor, tipo);
    if (just) return `<span style="color:#fbbf24;font-size:11px;font-weight:700;">${escapeHtmlAnalise(just)}</span>`;
    return `<span style="color:var(--an-txt-soft);">—</span>`;
  };

  const linhasHtml = ordenadas
    .map((l, i) => {
      const ehSemResposta = l.at === null;

      let varCell = '<span class="analise-var-igual">—</span>';
      if (!ehSemResposta && l.melhora !== null) {
        const cls = l.melhora > 0.05 ? "analise-var-sobe" : l.melhora < -0.05 ? "analise-var-desce" : "analise-var-igual";
        const seta = l.melhora > 0.05 ? "▲" : l.melhora < -0.05 ? "▼" : "—";
        // sufixo: p.p. para percentuais, % para absolutos
        const sufixo = l.variacaoEhPP ? " p.p." : "%";
        varCell = `<span class="${cls}">${seta} ${Math.abs(l.melhora).toFixed(2).replace(".", ",")}${sufixo}</span>`;
      }

      const badge = ehSemResposta
        ? `<span class="analise-badge" style="background:rgba(251,191,36,0.2);color:#fbbf24;">—</span>`
        : `<span class="analise-badge">${i + 1}</span>`;

      const celAtual = celValor(l.at, l.justAtual);
      const celAnterior = celValor(l.an, l.justAnterior);

      return `
        <tr ${ehSemResposta ? 'style="opacity:0.92;"' : ""}>
          <td>${badge}</td>
          <td><strong>${l.codigo}</strong> ${escapeHtmlAnalise(l.nome)}</td>
          <td>${periodos.modo === "semana" ? celAtual : celAnterior}</td>
          <td>${periodos.modo === "semana" ? celAnterior : celAtual}</td>
          <td>${varCell}</td>
        </tr>
      `;
    })
    .join("");

  alvo.innerHTML = `
    ${toggleHtml}
    <div class="dashboard-card span-12">
      <h3 style="margin:0 0 4px 0;">${escapeHtmlAnalise(ANALISE_STATE.indicador)} — ${periodos.modo === "semana" ? "evolução entre semanas" : "evolução entre meses"}</h3>
      <p style="margin:0 0 12px 0;color:var(--an-txt-soft);font-size:12px;">
        Ordenado de quem mais evoluiu para quem mais regrediu
      </p>
      <table class="analise-tabela-var">
        <thead>
          <tr>
            <th>#</th>
            <th>Loja</th>
            <th>${capitalizarAnalise((periodos.modo === "semana" ? mesAtual : mesAnterior).rotulo)}</th>
            <th>${capitalizarAnalise((periodos.modo === "semana" ? mesAnterior : mesAtual).rotulo)}</th>
            <th>Evolução${analiseEhPercentual(tipo) ? ' <span style="font-size:10px;font-weight:500;color:var(--an-txt-soft);">(p.p.)</span>' : ''}</th>
          </tr>
        </thead>
        <tbody>${linhasHtml}</tbody>
      </table>
    </div>
  `;
}

// ===== ABA 3: JUSTIFICATIVAS =====
async function renderAbaJustificativas({ resultados, lojasEscopoBase, lojasVisuaisSet }) {
  garantirEstilosAbasAnalise();
  const alvo = document.getElementById("analiseConteudo");
  if (!alvo) return;

  const comJust = (resultados || []).filter(
    (r) => r.justificativa && r.justificativa.toString().trim() !== "",
  );

  // conta por motivo e por loja (só quem tem 1+)
  const porMotivo = {};
  const porLoja = {};
  comJust.forEach((r) => {
    const motivo = r.justificativa.toString().trim();
    porMotivo[motivo] = (porMotivo[motivo] || 0) + 1;
    porLoja[r.loja] = (porLoja[r.loja] || 0) + 1;
  });

  const motivos = Object.entries(porMotivo).sort((a, b) => b[1] - a[1]);
  const total = comJust.length;

  // ===== PÓDIO: lojas que MAIS justificaram =====
  const lojasMais = Object.entries(porLoja).sort((a, b) => b[1] - a[1]);
  const podioItens = lojasMais.slice(0, 3).map(([loja, q]) => {
    const [cod, ...resto] = loja.split(" - ");
    return {
      codigo: cod,
      nome: resto.join(" - ") || loja,
      valorTexto: `${q} <span style="font-size:12px;font-weight:700;color:var(--an-txt-soft);">justif.</span>`,
    };
  });
  renderPodioAnalise(podioItens, "Lojas que mais justificaram");

  if (!comJust.length) {
    alvo.innerHTML = `
      <div class="dashboard-card span-12">
        <div class="analise-aviso">Nenhuma justificativa registrada no período/escopo selecionado.</div>
      </div>
    `;
    return;
  }

  const linhasMotivos = motivos
    .map(
      ([m, q]) => `
      <tr>
        <td>${escapeHtmlAnalise(m)}</td>
        <td><span class="analise-badge">${q}</span></td>
        <td>${((q / total) * 100).toFixed(1).replace(".", ",")}%</td>
      </tr>`,
    )
    .join("");

  const linhasLojas = lojasMais
    .map(
      ([loja, q]) => `
      <tr>
        <td>${escapeHtmlAnalise(loja)}</td>
        <td><span class="analise-badge">${q}</span></td>
      </tr>`,
    )
    .join("");

  alvo.innerHTML = `
    <div class="dashboard-card span-12" style="margin-bottom:16px;">
      <h3 style="margin:0 0 4px 0;">Motivos mais frequentes</h3>
      <p style="margin:0 0 12px 0;color:var(--an-txt-soft);font-size:12px;">
        ${total} justificativa(s) no período
      </p>
      <table class="analise-tabela-var">
        <thead><tr><th>Justificativa</th><th>Qtd</th><th>%</th></tr></thead>
        <tbody>${linhasMotivos}</tbody>
      </table>
    </div>
    <div class="dashboard-card span-12">
      <h3 style="margin:0 0 12px 0;">Lojas que mais justificam</h3>
      <table class="analise-tabela-var">
        <thead><tr><th>Loja</th><th>Qtd</th></tr></thead>
        <tbody>${linhasLojas}</tbody>
      </table>
    </div>
  `;
}

// helpers locais simples
function escapeHtmlAnalise(texto) {
  return (texto ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function capitalizarAnalise(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// ==========================
// 📦 BUSCAR DADOS
// ==========================
async function carregarDadosAnalise(contexto) {
  if (!contexto) contexto = getContextoDashboardUsuario();
  const alvo = document.getElementById("analiseConteudo");
  if (!alvo) return;

  alvo.innerHTML = `
    <div class="dashboard-card span-12">
      <div class="dashboard-grafico-area">Processando análises...</div>
    </div>
  `;

  try {
    const semanasMes = analiseSemanasDoMes(ANALISE_STATE.mes);
    const semanasUsar =
      ANALISE_STATE.semana !== "TODAS" && semanasMes.includes(ANALISE_STATE.semana)
        ? [ANALISE_STATE.semana]
        : semanasMes;
    const semanasInfo = {
      lista: semanasUsar,
      primeira: semanasUsar[0] || null,
      ultima: semanasUsar[semanasUsar.length - 1] || null,
      descricao: MESES_ANALISE[ANALISE_STATE.mes],
    };

    const { data: lojasData, error: lojasError } = await window.db
      .from("lojas")
      .select("*")
      .order("codigo");

    if (lojasError) throw lojasError;

    const lojasEscopoBase = aplicarEscopoBaseLojasAnalise(
      lojasData || [],
      contexto,
    );
    const lojasVisuais = aplicarFiltrosVisuaisLojasAnalise(lojasEscopoBase);

    if (contexto?.podeTrocarVisao && ANALISE_STATE.visao === "gerencial") {
      popularSelectLojasAnalise(lojasEscopoBase);
    }

    const lojasBaseSet = new Set(
      lojasEscopoBase.map((l) => getChaveLojaAnalise(l)),
    );
    const lojasVisuaisSet = new Set(
      lojasVisuais.map((l) => getChaveLojaAnalise(l)),
    );

    let query = window.db
      .from("resultados")
      .select("*")
      .in("semana", semanasInfo.lista);
    query = analiseAplicarFiltroAno(query);

    if (ANALISE_STATE.classe !== "TODAS") {
      query = query.eq("classe", ANALISE_STATE.classe);
    }

    if (ANALISE_STATE.indicador !== "TODOS") {
      const indicadorBanco = getIndicadorBancoAnalise(
        ANALISE_STATE.indicador,
        ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe,
      );

      query = query.eq("indicador", indicadorBanco);
    }

    const { data: resultadosData, error: resultadosError } = await query;
    if (resultadosError) throw resultadosError;

    const resultadosEscopoBase = (resultadosData || []).filter((r) =>
      lojasBaseSet.has(r.loja),
    );

    const resultadosVisuais = resultadosEscopoBase.filter((r) =>
      lojasVisuaisSet.has(r.loja),
    );

    // roteamento por ABA
    if (ANALISE_STATE.aba === "evolucao") {
      await renderAbaEvolucao({ lojasBaseSet, lojasVisuaisSet, lojasVisuais });
      return;
    }
    if (ANALISE_STATE.aba === "periodo") {
      await renderAbaPeriodo({ lojasEscopoBase, lojasVisuaisSet, lojasVisuais });
      return;
    }
    if (ANALISE_STATE.aba === "justificativas") {
      await renderAbaJustificativas({
        resultados: resultadosVisuais,
        lojasEscopoBase,
        lojasVisuaisSet,
      });
      return;
    }

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
          ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe,
        )
      : "numero";

  const ranking = agruparTopLojasAnalise(
    resultados,
    semanasInfo,
    tipoValorPrincipal,
  );
  const melhorPior = calcularMelhorEPiorLojaAnalise(
    resultados,
    tipoValorPrincipal,
  );
  const subclasses = agruparSubclassesAnalise(resultados);

  const amplitude = calcularAmplitudeAnalise(
    melhorPior.melhor,
    melhorPior.pior,
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
        <span class="dashboard-card-titulo">Resumo por subclasse</span>
        <span class="dashboard-card-subtitulo dashboard-card-subtitulo-info">
          Média do valor principal por subclasse
          <span
            class="dashboard-info-tip"
            title="Este gráfico mostra a média consolidada do valor principal em cada subclasse, considerando o filtro e o período selecionados."
          >ⓘ</span>
        </span>
      </div>
      <div class="dashboard-chart-box dashboard-chart-box-pequeno dashboard-chart-box-resumo">
        <canvas id="graficoAnaliseClasses"></canvas>
      </div>
    </div>

    ${renderTabelaRankingLojasAnalise(ranking.completo, tipoValorPrincipal)}
  `;

  renderGraficosAnaliseRegional(ranking, subclasses, tipoValorPrincipal);
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
          ANALISE_STATE.classe === "TODAS" ? null : ANALISE_STATE.classe,
        )
      : "numero";

  const rankingIndicadores = agruparIndicadoresAnalise(
    resultados,
    tipoValorPrincipal,
  );
  const subclasses = agruparSubclassesAnalise(resultados);

  const melhor = rankingIndicadores[0] || null;
  const pior = rankingIndicadores[rankingIndicadores.length - 1] || null;

  const amplitude = calcularAmplitudeAnalise(
    { media: melhor?.media || 0 },
    { media: pior?.media || 0 },
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
        <span class="dashboard-card-titulo">Resumo por subclasse</span>
        <span class="dashboard-card-subtitulo dashboard-card-subtitulo-info">
          Média do valor principal por subclasse
          <span
            class="dashboard-info-tip"
            title="Este gráfico mostra a média consolidada do valor principal em cada subclasse, considerando o filtro e o período selecionados."
          >ⓘ</span>
        </span>
      </div>
      <div class="dashboard-chart-box dashboard-chart-box-pequeno dashboard-chart-box-resumo">
        <canvas id="graficoAnaliseClasses"></canvas>
      </div>
    </div>

    ${renderTabelaRankingIndicadoresAnalise(
      rankingIndicadores,
      tipoValorPrincipal,
    )}
  `;

  renderGraficosAnaliseGerencial(
    rankingIndicadores,
    subclasses,
    tipoValorPrincipal,
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
                tipo: tipoValorPrincipal,
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
                tipo: tipoValorPrincipal,
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
          tipo: tipoValorPrincipal,
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
          tipo: tipoValorPrincipal,
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
                tipo: tipoValorPrincipal,
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
                tipo: tipoValorPrincipal,
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
          tipo: tipoValorPrincipal,
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
          tipo: tipoValorPrincipal,
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
                  tipo: tipoValorPrincipal,
                })}</td>
              </tr>
            `,
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
                  tipo: tipoValorPrincipal,
                })}</td>
              </tr>
            `,
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
function renderGraficosAnaliseRegional(
  ranking,
  subclasses,
  tipoValorPrincipal,
) {
  if (!chartAnaliseDisponivel()) return;

  requestAnimationFrame(() => {
    try {
      const top = ranking.top || [];
      const bottom = ranking.bottom || [];

      renderGraficoPrincipalAnalise(
        top.map((i) => i.loja),
        top.map((i) => i.media),
        "Top 10 lojas",
        "#1e6091",
      );

      renderGraficoSecundarioAnalise(
        bottom.map((i) => i.loja),
        bottom.map((i) => i.media),
        "Bottom 10 lojas",
        "#F44336",
      );

      renderGraficoSubclassesAnalise(subclasses, tipoValorPrincipal);
    } catch (erro) {
      console.error(
        "❌ Erro ao renderizar gráficos de análise regional:",
        erro,
      );
    }
  });
}

function renderGraficosAnaliseGerencial(
  rankingIndicadores,
  subclasses,
  tipoValorPrincipal,
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
        "#9C27B0",
      );

      renderGraficoSecundarioAnalise(
        bottom.map((i) => i.indicador),
        bottom.map((i) => i.media),
        "Bottom indicadores",
        "#FF9800",
      );

      renderGraficoSubclassesAnalise(subclasses, tipoValorPrincipal);
    } catch (erro) {
      console.error(
        "❌ Erro ao renderizar gráficos de análise gerencial:",
        erro,
      );
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
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${formatarKpiAnalise(ctx.raw, {
                percentual: tipoPercentualAnalise(ANALISE_STATE.indicador),
                casas: 2,
                tipo:
                  ANALISE_STATE.indicador !== "TODOS"
                    ? getTipoCampoAnalise(
                        ANALISE_STATE.indicador,
                        "valor",
                        ANALISE_STATE.classe === "TODAS"
                          ? null
                          : ANALISE_STATE.classe,
                      )
                    : "numero",
              })}`,
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

function renderGraficoSubclassesAnalise(subclasses, tipoValorPrincipal) {
  const canvas = document.getElementById("graficoAnaliseClasses");
  if (!canvas) return;

  if (window.analiseCharts.classes) {
    window.analiseCharts.classes.destroy();
  }

  ajustarAlturaChartAnalise("graficoAnaliseClasses", subclasses?.length || 0, {
    minimo: 145,
    maximo: 230,
    pxPorItem: 22,
  });

  const isPercentual = tipoPercentualAnalise(tipoValorPrincipal);

  window.analiseCharts.classes = new Chart(canvas, {
    type: "bar",
    data: {
      labels: (subclasses || []).map((i) => i.subclasse),
      datasets: [
        {
          label: `Média (${tipoValorPrincipal})`,
          data: (subclasses || []).map((i) => i.media),
          backgroundColor: [
            "#1e6091",
            "#4CAF50",
            "#FF9800",
            "#9C27B0",
            "#F44336",
            "#00BCD4",
            "#3F51B5",
            "#009688",
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
              ` Média: ${formatarKpiAnalise(ctx.raw, {
                percentual: isPercentual,
                casas: 2,
                tipo: tipoValorPrincipal,
              })}`,
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
            callback: (value) =>
              isPercentual
                ? `${formatarNumeroAnalise(value, 1)}%`
                : formatarNumeroAnalise(value, 1),
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