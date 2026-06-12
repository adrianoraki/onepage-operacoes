// ==========================
// 📊 COMPARATIVOS — HEATMAP VIBRANTE
// ==========================
console.log("✅ comparativos.js carregado");

// ==========================
// 🧠 ESTADO GLOBAL
// ==========================

const ORDEM_LOJAS_COMPARATIVO = [
  // NE1
  "77", "83", "109", "114", "119", "120", "204",
  "207", "238", "268", "298", "300", "305", "333",

  // NE2
  "44", "46", "76", "91", "107", "138", "152", "163",
  "179", "250", "198", "262", "284", "289", "290",
];

const ORDEM_INDICADORES_COMPARATIVO = [
  "RUPTURA FINAL",
  "ETIQUETA",

  "SELF-CHECKOUT",
  "DESCONTO",
  "CANCELAMENTO",
  "DEVOLUÇÃO",
  "FAIXA HORAS",

  "VISITA PROSPECÇÃO",
  "NPS",
  "PART.TELEVENDAS",

  "QUEBRA",
  "QUEBRA FLV",
  "QUEBRA AÇOUGUE",
  "PSV",
  "TROCA",

  "BANCO DE HORAS",
  "TURNOVER",
];

const COMPARATIVO_STATE = {
  ano:
    Number(localStorage.getItem("comparativoAno")) || new Date().getFullYear(),

  semana: "TODAS",

  mes: localStorage.getItem("comparativoMes") || String(new Date().getMonth() + 1),

  modoPeriodo: "mensal",
  indicador: "TODOS",
  abaRegional: localStorage.getItem("comparativoAba") || "AMBAS",
  loja: "TODAS",
};

// ==========================
// 🎨 ESTILOS
// ==========================
function garantirEstilosComparativo() {
  const styleId = "comparativos-ajustes-matriz-sem-ranking";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;

  style.textContent = `
    .matriz-tabela .matriz-th-loja,
    .matriz-tabela .matriz-loja {
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;
      white-space: nowrap !important;
    }

    .matriz-tabela .matriz-loja {
      line-height: 1.2 !important;
      padding-left: 16px !important;
      padding-right: 20px !important;
    }

    .matriz-tabela .matriz-loja-cod,
    .comparativo-tabela .matriz-loja-cod {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      min-width: 46px;
      height: 24px;
      margin-right: 9px;
      padding: 2px 11px;
      border-radius: 999px;
      font-size: 15px;
      font-weight: 900;
      background: rgba(59, 130, 246, 0.24);
      color: #dbeafe;
      vertical-align: middle;
    }

    .matriz-tabela .matriz-loja-nome,
    .comparativo-tabela .matriz-loja-nome {
      font-size: 17px;
      font-weight: 800;
      white-space: nowrap;
      vertical-align: middle;
    }

    .matriz-tabela .matriz-resumo-cel {
      font-size: 11px !important;
    }

    .comparativo-info-periodo {
      margin: 10px 0 14px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(15, 31, 46, 0.55); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.18);
      color: #dbeafe;
      font-size: 12px;
      line-height: 1.45;
    }

    .comparativo-info-periodo small {
      color: #9fb7d5;
    }

    .comparativo-filtros {
      display: flex;
      gap: 12px;
      align-items: end;
      flex-wrap: wrap;
    }

    .comparativo-filtro-grupo {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6px;
    }

    .comparativo-filtro-grupo label {
      font-size: 11px;
      font-weight: 800;
      color: #dbeafe;
    }

    .comparativo-filtro-grupo select {
      min-width: 130px;
    }

    /* ocupa toda a área útil, encostando na barra de rolagem */
    #comparativoContainer.comparativo-container {
      margin-left: calc(-1 * clamp(15px, 2vw, 25px)) !important;
      margin-right: calc(-1 * clamp(15px, 2vw, 25px)) !important;
      margin-top: 0 !important;
      padding: 12px 2px !important;
      border-radius: 0 !important;
      border-left: none !important;
      border-right: none !important;
      min-height: calc(100dvh - 34px) !important;
    }

    /* o wrapper .pagina-container NÃO pode limitar a largura do comparativo */
    .pagina-container:has(#comparativoContainer) {
      max-width: none !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* botões de exportação (à direita dos filtros) */
    .comparativo-export {
      display: flex;
      gap: 7px;
      margin-left: auto;
      align-items: center;
    }
    .cmp-exp {
      display: inline-flex; align-items: center; gap: 6px;
      border: none; cursor: pointer;
      padding: 7px 12px; border-radius: 8px;
      font-size: 12px; font-weight: 800; color: #fff;
      transition: filter 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .cmp-exp:hover { filter: brightness(1.12); transform: translateY(-1px); }
    .cmp-exp:active { transform: translateY(0); }
    .cmp-exp i { font-size: 13px; }
    .cmp-exp-print { background: #475569; }
    .cmp-exp-pdf   { background: #dc2626; }
    .cmp-exp-xlsx  { background: #15803d; }
    @media (max-width: 640px) {
      .cmp-exp span { display: none; }
      .cmp-exp { padding: 8px 10px; }
    }

    /* matrizes/tabela preenchem 100% e as colunas de indicador esticam */
    #comparativoContainer .comparativo-matrizes,
    #comparativoContainer .matriz-card,
    #comparativoContainer .matriz-scroll {
      width: 100% !important;
    }
    .matriz-tabela {
      width: 100% !important;
      table-layout: auto !important;
    }
    .matriz-tabela .matriz-th-ind,
    .matriz-tabela .matriz-celula,
    .matriz-tabela .matriz-resumo-cel {
      max-width: none !important;
    }

    /* rolagem funcionando no modo TELA CHEIA */
    #comparativoContainer.comparativo-container:fullscreen,
    #comparativoContainer.comparativo-container:-webkit-full-screen {
      width: 100vw !important;
      height: 100vh !important;
      max-height: 100vh !important;
      margin: 0 !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
    }

    /* destaque da linha MÉDIA / TOTAL */
    .matriz-linha-resumo .matriz-resumo-cel,
    .matriz-linha-resumo .matriz-th-loja {
      background: rgba(22, 70, 107, 0.6) !important;
      color: #ffffff !important;
      border-bottom: 3px solid #f0b429 !important;
      font-size: 14px !important;
      font-weight: 800 !important;
    }
    .matriz-linha-resumo .matriz-th-loja {
      color: #ffe2a8 !important;
    }

    /* melhora a legibilidade dos números sobre os fundos coloridos */
    .matriz-tabela .matriz-celula {
      font-weight: 800 !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      letter-spacing: 0 !important;
    }

    .matriz-vazia {
      opacity: 0.72;
    }

    /* ===== IMPRESSÃO / PDF (cada regional em uma folha, tabela INTEIRA) ===== */
    @media print {
      @page { size: A4 landscape; margin: 6mm; }

      /* esconde tudo que não é a matriz */
      .sidebar, .rodape-fixo, footer,
      .comparativo-topo, .comparativo-filtros, .comparativo-abas,
      .comparativo-export, .comparativo-btn-tela,
      .comparativo-info-periodo { display: none !important; }

      /* containers fluem e PAGINAM naturalmente (sem position absolute!) */
      html, body, .conteudo, .pagina-container,
      #comparativoContainer, .comparativo-container,
      #comparativoConteudo, .comparativo-matrizes, .comparativo-regionais {
        height: auto !important; max-height: none !important; min-height: 0 !important;
        overflow: visible !important; position: static !important;
        margin: 0 !important; padding: 0 !important;
        display: block !important; width: auto !important;
      }

      /* cada regional em uma folha, com a tabela COMPLETA */
      .matriz-card {
        break-inside: avoid; page-break-inside: avoid;
        page-break-after: always; margin: 0 0 6px 0 !important;
        box-shadow: none !important; border: none !important;
      }
      .matriz-card:last-child { page-break-after: auto; }
      .matriz-scroll { overflow: visible !important; width: auto !important; max-width: none !important; }

      /* table-layout fixed faz TODAS as colunas caberem na largura da página */
      .matriz-tabela {
        width: 100% !important; table-layout: fixed !important;
        font-size: 7px !important; border-spacing: 1px !important;
      }
      .matriz-th-loja, .matriz-loja {
        width: 92px !important; white-space: normal !important;
        position: static !important; box-shadow: none !important;
      }
      .matriz-loja-cod { font-size: 8px !important; padding: 1px 4px !important; }
      .matriz-loja-nome { font-size: 8px !important; }
      .matriz-th-ind, .matriz-celula, .matriz-resumo-cel {
        padding: 2px 1px !important; overflow: hidden;
        font-size: 7.5px !important; text-shadow: none !important;
      }
      .matriz-celula, .matriz-resumo-cel, .matriz-th-ind,
      .matriz-th-loja, .matriz-loja, .matriz-linha-resumo .matriz-resumo-cel {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;

  document.head.appendChild(style);
}

// ==========================
// 🔠 HELPERS
// ==========================
function normalizarTextoComparativo(valor) {
  return (valor || "").toString().trim();
}

function normalizarTextoComparativoUpper(valor) {
  return normalizarTextoComparativo(valor).toUpperCase();
}

function removerAcentosComparativo(valor) {
  return normalizarTextoComparativoUpper(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarSemanaComparativo(semana) {
  return String(semana == null ? "" : semana)
    .trim()
    .replace(/^0+(\d+)$/, "$1")
    .padStart(2, "0");
}

function normalizarIndicadorBancoComparativo(valor) {
  let v = normalizarTextoComparativoUpper(valor);

  if (v === "BANCOS DE HORAS") v = "BANCO DE HORAS";
  if (v === "DEVOLUCAO") v = "DEVOLUÇÃO";
  if (v === "DEVOLUCOES" || v === "DEVOLUÇÕES") v = "DEVOLUÇÃO";
  if (v === "QUEBRA ACOUGUE") v = "QUEBRA AÇOUGUE";
  if (v === "VISITA PROSPECCAO") v = "VISITA PROSPECÇÃO";

  // variantes no plural / com acento que impedem o "match" da loja
  if (v === "CANCELAMENTOS") v = "CANCELAMENTO";
  if (v === "DESCONTOS") v = "DESCONTO";
  if (v === "TROCAS") v = "TROCA";
  if (v === "QUEBRAS") v = "QUEBRA";

  return v;
}

// Converte valores que podem vir como número OU string formatada em padrão BR
// (ex: "R$ 1.234,56", "1.335.250,00", "2,43", "  -10 "). Retorna NaN se não der.
function parseNumeroComparativo(raw) {
  if (raw === null || raw === undefined) return NaN;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : NaN;

  let s = String(raw).trim();
  if (!s) return NaN;

  // remove R$, %, espaços e qualquer caractere que não seja dígito, ponto, vírgula ou sinal
  s = s.replace(/[^\d.,\-]/g, "");
  if (!s || s === "-" || s === "." || s === ",") return NaN;

  const temVirgula = s.includes(",");
  const temPonto = s.includes(".");

  if (temVirgula && temPonto) {
    // formato BR: 1.234.567,89 → ponto = milhar, vírgula = decimal
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (temVirgula) {
    // só vírgula → separador decimal BR
    s = s.replace(",", ".");
  } else if (temPonto) {
    // só ponto: pode ser milhar (1.234 = 1234) ou decimal (2.43 = 2,43).
    // heurística: se o último grupo tiver exatamente 3 dígitos, é separador de milhar.
    const partes = s.split(".");
    const ultima = partes[partes.length - 1];
    if (partes.length > 1 && ultima.length === 3) {
      s = partes.join(""); // 1.234 / 1.234.567 → milhar
    }
    // senão mantém como decimal (2.43, 12.5, etc.)
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function calcularMediaComparativo(lista = []) {
  const numeros = (lista || [])
    .map((v) => parseNumeroComparativo(v))
    .filter((v) => !Number.isNaN(v) && Number.isFinite(v));

  if (!numeros.length) return null;

  return numeros.reduce((a, b) => a + b, 0) / numeros.length;
}

function somarComparativo(lista = []) {
  const numeros = (lista || [])
    .map((v) => parseNumeroComparativo(v))
    .filter((v) => !Number.isNaN(v) && Number.isFinite(v));

  if (!numeros.length) return null;

  return numeros.reduce((a, b) => a + b, 0);
}

// ==========================
// 💲 FORMATAÇÃO
// ==========================
function tipoPercentualComparativo(tipo) {
  const t = normalizarTextoComparativoUpper(tipo);
  return t.includes("PERCENT") || t.includes("PORCENT") || t === "%";
}

function tipoMoedaComparativo(tipo) {
  const t = normalizarTextoComparativoUpper(tipo);
  return t.includes("MOEDA") || t.includes("R$") || t.includes("REAL");
}

function tipoInteiroComparativo(tipo) {
  const t = normalizarTextoComparativoUpper(tipo);

  return (
    t === "INTEIRO" ||
    t === "INT" ||
    t === "INTEGER" ||
    t === "NUMERO-INTEIRO" ||
    t === "NÚMERO-INTEIRO"
  );
}

function tipoSomaComparativo(tipo) {
  const t = normalizarTextoComparativoUpper(tipo);

  return (
    tipoMoedaComparativo(tipo) ||
    t.includes("ESPECIAL-RH") ||
    t.includes("ESPECIAL_RH") ||
    t.replace(/[^A-Z]/g, "") === "ESPECIALRH"
  );
}

function agregarValoresComparativo(arr, tipo) {
  if (!arr || !arr.length) return null;

  // % → MÉDIA das semanas do período (por loja)
  // R$, número inteiro e banco de horas → SOMA (valor total)
  return tipoPercentualComparativo(tipo)
    ? calcularMediaComparativo(arr)
    : somarComparativo(arr);
}

function formatarValorComparativo(valor, tipo) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "-";

  if (tipoInteiroComparativo(tipo)) {
    return Math.trunc(numero).toLocaleString("pt-BR");
  }

  if (tipoMoedaComparativo(tipo)) {
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (tipoPercentualComparativo(tipo)) {
    return (
      numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%"
    );
  }

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// ==========================
// 🏷️ INDICADORES
// ==========================
function getIndicadorBancoComparativo(indicador, classe = null) {
  if (typeof getIndicadorBanco === "function") {
    return normalizarIndicadorBancoComparativo(getIndicadorBanco(indicador, classe));
  }

  return normalizarIndicadorBancoComparativo(indicador);
}

function getTipoCampoComparativo(indicador, classe = null) {
  if (typeof getCampoConfig === "function") {
    try {
      return getCampoConfig(indicador, "valor", classe)?.tipo || "numero";
    } catch (e) {
      // fallback abaixo
    }
  }

  return "numero";
}

function menorEhMelhorComparativo(indicador, classe = null) {
  if (indicador === "TODOS") return false;

  if (typeof getIndicadorConfig === "function") {
    try {
      const cfg = getIndicadorConfig(indicador, classe);
      return normalizarTextoComparativoUpper(cfg?.ordemRanking) === "ASC";
    } catch (e) {
      // fallback abaixo
    }
  }

  return false;
}

function getNomeIndicadorComparativo(valor) {
  const valorNorm = normalizarIndicadorBancoComparativo(valor);

  if (valorNorm === "VISITA PROSPECÇÃO") return "Visita Prospecção";
  if (valorNorm === "BANCO DE HORAS") return "Banco de Horas";
  if (valorNorm === "QUEBRA AÇOUGUE") return "Quebra Açougue";
  if (valorNorm === "QUEBRA FLV") return "Quebra FLV";
  if (valorNorm === "RUPTURA FINAL") return "Ruptura Final";
  if (valorNorm === "SELF-CHECKOUT") return "Self Checkout";
  if (valorNorm === "FAIXA HORAS") return "Faixa Horas";

  return valorNorm;
}

function getClasseOficialIndicadorComparativo(indicador) {
  const ind = normalizarIndicadorBancoComparativo(indicador);

  if (["RUPTURA FINAL", "ETIQUETA"].includes(ind)) return "Auditoria";

  if (
    [
      "SELF-CHECKOUT",
      "DESCONTO",
      "CANCELAMENTO",
      "DEVOLUÇÃO",
      "FAIXA HORAS",
    ].includes(ind)
  ) {
    return "Frente de Caixa";
  }

  if (["VISITA PROSPECÇÃO", "NPS", "PART.TELEVENDAS"].includes(ind)) {
    return "Operações";
  }

  if (
    [
      "QUEBRA",
      "QUEBRA FLV",
      "QUEBRA AÇOUGUE",
      "PSV",
      "TROCA",
    ].includes(ind)
  ) {
    return "Prevenção";
  }

  if (["BANCO DE HORAS", "TURNOVER"].includes(ind)) {
    return "RH / Operacional";
  }

  return "SEM CLASSE";
}

function getIndicadoresComparativoLista() {
  return ORDEM_INDICADORES_COMPARATIVO.map((indicador) => ({
    valor: indicador,
    nome: getNomeIndicadorComparativo(indicador),
    classe: getClasseOficialIndicadorComparativo(indicador),
  }));
}

// ==========================
// 🗓️ SEMANA / MÊS — ISO
// ==========================
function getSemanaISOComparativo(data) {
  const d = new Date(
    Date.UTC(data.getFullYear(), data.getMonth(), data.getDate())
  );

  const diaSemana = d.getUTCDay() || 7;

  d.setUTCDate(d.getUTCDate() + 4 - diaSemana);

  const inicioAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil(((d - inicioAno) / 86400000 + 1) / 7);
}

function getSemanaAtualComparativo() {
  if (typeof getSemanaAtual === "function") {
    try {
      return getSemanaAtual();
    } catch (e) {
      // fallback abaixo
    }
  }

  return getSemanaISOComparativo(new Date());
}

function getNumeroSemanaPorDataComparativo(data) {
  return getSemanaISOComparativo(data);
}

/**
 * Semanas de um mês. IMPORTANTE: usa o MESMO cálculo das tabelas de preenchimento
 * (window.FiltroPeriodo), senão o número da semana pode divergir e os resultados
 * gravados não casam com o que o comparativo procura. Só usa o cálculo ISO local
 * como fallback caso o módulo compartilhado não esteja disponível.
 */
function getSemanasDoMesPorMesComparativo(mes, ano = new Date().getFullYear()) {
  const mesNumero = Number(mes);

  if (!Number.isFinite(mesNumero) || mesNumero < 1 || mesNumero > 12) {
    return [];
  }

  // fonte da verdade: o mesmo módulo usado pelas tabelas ao salvar os resultados
  if (
    window.FiltroPeriodo &&
    typeof window.FiltroPeriodo.getSemanasDoMes === "function"
  ) {
    try {
      const semanas = window.FiltroPeriodo.getSemanasDoMes(mesNumero, ano) || [];
      if (semanas.length) {
        return semanas
          .map((s) => normalizarSemanaComparativo(s))
          .sort((a, b) => Number(a) - Number(b));
      }
    } catch (e) {
      // cai para o cálculo local abaixo
    }
  }

  const primeiroDia = new Date(ano, mesNumero - 1, 1);
  const ultimoDia = new Date(ano, mesNumero, 0);

  const semanasSet = new Set();

  for (
    let d = new Date(primeiroDia);
    d <= ultimoDia;
    d.setDate(d.getDate() + 1)
  ) {
    const ehSegunda = d.getDay() === 1;

    if (ehSegunda) {
      semanasSet.add(
        normalizarSemanaComparativo(getNumeroSemanaPorDataComparativo(d))
      );
    }
  }

  return [...semanasSet].sort((a, b) => Number(a) - Number(b));
}

// Mantido por compatibilidade
function getSemanasDoMesPorSemanaComparativo(semana) {
  const ano = getAnoAtualComparativo();
  const semanaNorm = normalizarSemanaComparativo(semana);

  for (let mes = 1; mes <= 12; mes++) {
    const semanasMes = getSemanasDoMesPorMesComparativo(mes, ano);

    if (semanasMes.includes(semanaNorm)) {
      return semanasMes;
    }
  }

  return [];
}

// ==========================
// 📅 FILTRO DE MÊS
// ==========================
const MESES_COMPARATIVO = [
  { valor: "1", nome: "Janeiro" },
  { valor: "2", nome: "Fevereiro" },
  { valor: "3", nome: "Março" },
  { valor: "4", nome: "Abril" },
  { valor: "5", nome: "Maio" },
  { valor: "6", nome: "Junho" },
  { valor: "7", nome: "Julho" },
  { valor: "8", nome: "Agosto" },
  { valor: "9", nome: "Setembro" },
  { valor: "10", nome: "Outubro" },
  { valor: "11", nome: "Novembro" },
  { valor: "12", nome: "Dezembro" },
];

function getAnoAtualComparativo() {
  const ano = Number(COMPARATIVO_STATE.ano || new Date().getFullYear());

  if (Number.isFinite(ano) && ano >= 2020 && ano <= 2100) {
    return ano;
  }

  return new Date().getFullYear();
}

function getMesSelecionadoComparativo() {
  const mes = Number(COMPARATIVO_STATE.mes);

  if (Number.isFinite(mes) && mes >= 1 && mes <= 12) {
    return mes;
  }

  return null;
}

function getNomeMesComparativo(mes) {
  const encontrado = MESES_COMPARATIVO.find(
    (m) => Number(m.valor) === Number(mes)
  );

  return encontrado?.nome || "";
}

function gerarOptionsMesesComparativo() {
  let html = "";

  MESES_COMPARATIVO.forEach((mes) => {
    const selected =
      String(COMPARATIVO_STATE.mes || "") === String(mes.valor)
        ? "selected"
        : "";

    html += `
      <option value="${mes.valor}" ${selected}>
        ${mes.nome}
      </option>
    `;
  });

  return html;
}

function extrairSemanasDosResultadosComparativo(resultados = []) {
  return [
    ...new Set(
      (resultados || [])
        .map((r) => normalizarSemanaComparativo(r.semana))
        .filter(Boolean)
    ),
  ].sort((a, b) => Number(a) - Number(b));
}

// ==========================
// 🏬 LOJAS
// ==========================
function getChaveLojaComparativo(loja) {
  return `${loja.codigo} - ${loja.nome}`;
}

// Resolve a regional da loja de forma resiliente: usa o campo "regional" do cadastro;
// se vier vazio/diferente, cai para a ordem fixa NE1/NE2 pelo CÓDIGO da loja.
function getRegionalLojaComparativo(loja) {
  const reg = normalizarTextoComparativoUpper(loja?.regional || "");
  if (reg === "NE1" || reg === "NE2") return reg;

  const cod = String(loja?.codigo || "");
  const idx = ORDEM_LOJAS_COMPARATIVO.indexOf(cod);
  if (idx !== -1) return idx < 14 ? "NE1" : "NE2";

  // mantém o que veio (mesmo que não seja NE1/NE2) para não sumir com a loja
  return reg;
}

// restringe as lojas conforme o escopo do usuário (loja vinculada / regional)
// master e admin veem tudo; "ignorar loja vinculada" (modo BI) também libera
function aplicarEscopoLojasComparativo(lojas = []) {
  let usuario = null;
  try {
    if (typeof getUsuarioLogado === "function") usuario = getUsuarioLogado();
  } catch (e) {}
  if (!usuario) return lojas;

  const perfil = (usuario.perfil || "").toString().toLowerCase();
  if (perfil === "master" || perfil === "admin") return lojas;

  const ignoraLoja =
    usuario.ignorar_loja_vinculada === true ||
    usuario.permissoes?.ignorar_loja_vinculada === true;

  // loja vinculada → vê só a própria loja
  if (!ignoraLoja && usuario.loja_codigo != null && usuario.loja_codigo !== "") {
    return lojas.filter(
      (l) => String(l.codigo) === String(usuario.loja_codigo),
    );
  }

  // senão, regional vinculada (se houver)
  if (usuario.regional_vinculada) {
    const reg = String(usuario.regional_vinculada).toUpperCase().trim();
    return lojas.filter(
      (l) => String(l.regional || "").toUpperCase().trim() === reg,
    );
  }

  return lojas;
}

function montarMapaLojaRegionalComparativo(lojas = []) {
  const mapa = {};

  (lojas || []).forEach((l) => {
    mapa[getChaveLojaComparativo(l)] = normalizarTextoComparativoUpper(
      l.regional || ""
    );
  });

  return mapa;
}

function getCodigoLojaComparativo(lojaTexto = "") {
  return quebrarLojaComparativo(lojaTexto).codigo || "";
}

function localizarLojaCadastroComparativo(lojas = [], registro = {}) {
  const codigoRegistro =
    registro.loja_codigo ||
    registro._loja_codigo ||
    getCodigoLojaComparativo(registro.loja || "");

  if (codigoRegistro) {
    const encontrada = lojas.find(
      (loja) => String(loja.codigo) === String(codigoRegistro)
    );

    if (encontrada) return encontrada;
  }

  const lojaTexto = normalizarTextoComparativoUpper(registro.loja || "");

  if (lojaTexto) {
    return lojas.find(
      (loja) =>
        normalizarTextoComparativoUpper(getChaveLojaComparativo(loja)) ===
        lojaTexto
    );
  }

  return null;
}

// ==========================
// 🌡️ HEATMAP
// ==========================
function calcularIntensidadeHeatmap(valor, min, max, menorMelhor = false) {
  const range = max - min;

  if (range === 0) return 0.5;

  let i = (valor - min) / range;

  if (menorMelhor) i = 1 - i;

  return Math.max(0, Math.min(1, i));
}

function heatmapCorVibrante(intensidade) {
  const i = Math.max(0, Math.min(1, intensidade));

  const r = Math.round(255 * (1 - i) + 51 * i);
  const g = Math.round(51 * (1 - i) + 221 * i);
  const b = Math.round(51 * (1 - i) + 68 * i);

  return `rgb(${r},${g},${b})`;
}

function heatmapCorTexto(intensidade) {
  return intensidade > 0.3 && intensidade < 0.72 ? "#1a2733" : "#ffffff";
}

function corPercentualFaixa(valorPct) {
  const v = Math.abs(Number(valorPct) || 0);

  if (v <= 2.49) {
    return { fundo: "rgb(51,221,68)", texto: "#0d3d16" };
  }

  if (v <= 2.99) {
    return { fundo: "rgb(245,205,50)", texto: "#4a3c05" };
  }

  return { fundo: "rgb(255,51,51)", texto: "#ffffff" };
}

// ==========================
// 📋 TELA PRINCIPAL
// ==========================
async function telaComparativos() {
  console.log("📊 Iniciando telaComparativos...");

  garantirEstilosComparativo();

  const container = document.getElementById("conteudo");

  if (!container) {
    console.error("❌ #conteudo não encontrado");
    return;
  }

  if (!window.db) {
    if (typeof mostrarErro === "function") {
      mostrarErro("Conexão com banco não iniciada");
    }

    return;
  }

  container.innerHTML = `
    <div class="pagina-container">
      <div class="card-conteudo comparativo-container" id="comparativoContainer">

        <div class="comparativo-topo">
          <div class="comparativo-titulos">
            <p class="comparativo-subtitulo">Ranking de lojas por indicador — NE1 e NE2</p>
          </div>

          <button
            id="comparativoBtnTela"
            class="comparativo-btn-tela"
            onclick="comparativoToggleTelaCheia()"
            title="Tela cheia"
          >
            <i class="fas fa-expand"></i>
            <span>Tela cheia</span>
          </button>
        </div>

        <div class="comparativo-filtros">
          <div class="comparativo-filtro-grupo">
            <label for="comparativoMes">Mês</label>
            <select id="comparativoMes" onchange="comparativoAlterarMes(this.value)">
              ${gerarOptionsMesesComparativo()}
            </select>
          </div>

          <div class="comparativo-filtro-grupo">
            <label for="comparativoSemana">Semana</label>
            <select id="comparativoSemana" onchange="comparativoAlterarSemana(this.value)">
              ${gerarOptionsSemanasComparativo()}
            </select>
          </div>

          <div class="comparativo-export">
            <button class="cmp-exp cmp-exp-print" onclick="comparativoImprimir()" title="Imprimir / compartilhar">
              <i class="fas fa-print"></i><span>Print</span>
            </button>
            <button class="cmp-exp cmp-exp-pdf" onclick="comparativoExportarPDF()" title="Baixar PDF">
              <i class="fas fa-file-pdf"></i><span>PDF</span>
            </button>
            <button class="cmp-exp cmp-exp-xlsx" onclick="comparativoExportarXLSX()" title="Baixar Excel">
              <i class="fas fa-file-excel"></i><span>XLSX</span>
            </button>
          </div>
        </div>

        <div class="comparativo-abas" role="tablist" aria-label="Regional">
          <button
            class="comparativo-aba"
            data-aba="AMBAS"
            role="tab"
            onclick="comparativoAlterarAba('AMBAS')"
          >
            <i class="fas fa-layer-group"></i>
            <span>Ambas</span>
          </button>

          <button
            class="comparativo-aba"
            data-aba="NE1"
            role="tab"
            onclick="comparativoAlterarAba('NE1')"
          >
            NE1
          </button>

          <button
            class="comparativo-aba"
            data-aba="NE2"
            role="tab"
            onclick="comparativoAlterarAba('NE2')"
          >
            NE2
          </button>
        </div>

        <div id="comparativoConteudo" class="comparativo-conteudo">
          <div class="loading-box">Carregando...</div>
        </div>

      </div>
    </div>
  `;

  const selSemana = document.getElementById("comparativoSemana");
  if (selSemana) selSemana.value = COMPARATIVO_STATE.semana;

  const selMes = document.getElementById("comparativoMes");
  if (selMes) selMes.value = COMPARATIVO_STATE.mes || "";

  comparativoMarcarAbaAtiva();

  await carregarDadosComparativos();
}

// ==========================
// 🔧 OPTIONS
// ==========================
function gerarOptionsSemanasComparativo() {
  const mesSel = getMesSelecionadoComparativo();
  const ano = getAnoAtualComparativo();
  const semanas = mesSel ? getSemanasDoMesPorMesComparativo(mesSel, ano) : [];

  let html = `<option value="TODAS" ${
    COMPARATIVO_STATE.semana === "TODAS" ? "selected" : ""
  }>Mês inteiro</option>`;

  semanas.forEach((s) => {
    html += `
      <option value="${s}" ${COMPARATIVO_STATE.semana === s ? "selected" : ""}>
        Semana ${s}
      </option>
    `;
  });

  return html;
}

function gerarOptionsIndicadoresComparativo() {
  const lista = getIndicadoresComparativoLista();

  let html = `
    <option value="TODOS" ${
      COMPARATIVO_STATE.indicador === "TODOS" ? "selected" : ""
    }>
      Todos os indicadores
    </option>
  `;

  lista.forEach((item) => {
    html += `
      <option value="${item.valor}" ${
      COMPARATIVO_STATE.indicador === item.valor ? "selected" : ""
    }>
        ${item.nome}
      </option>
    `;
  });

  return html;
}

// ==========================
// 🔄 HANDLERS
// ==========================
async function comparativoAlterarSemana(semana) {
  COMPARATIVO_STATE.semana =
    semana === "TODAS" ? "TODAS" : normalizarSemanaComparativo(semana);

  localStorage.setItem("semana", COMPARATIVO_STATE.semana);

  await carregarDadosComparativos();
}

async function comparativoAlterarMes(mes) {
  COMPARATIVO_STATE.mes = mes || String(new Date().getMonth() + 1);
  COMPARATIVO_STATE.semana = "TODAS"; // ao trocar de mês, volta para "Mês inteiro"

  localStorage.setItem("comparativoMes", COMPARATIVO_STATE.mes);
  localStorage.setItem("semana", "TODAS");

  // repopula o dropdown de semanas com as semanas do novo mês
  const selSemana = document.getElementById("comparativoSemana");
  if (selSemana) {
    selSemana.innerHTML = gerarOptionsSemanasComparativo();
    selSemana.value = "TODAS";
  }

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

function preencherSelectLojas(lojas = []) {
  const sel = document.getElementById("comparativoLoja");
  if (!sel) return;

  const selecionada = COMPARATIVO_STATE.loja;
  const grupos = {};

  (lojas || []).forEach((l) => {
    const reg = normalizarTextoComparativoUpper(l.regional || "Outros");
    if (!grupos[reg]) grupos[reg] = [];
    grupos[reg].push(l);
  });

  let html = `
    <option value="TODAS" ${selecionada === "TODAS" ? "selected" : ""}>
      Todas as lojas
    </option>
  `;

  Object.keys(grupos)
    .sort()
    .forEach((reg) => {
      html += `<optgroup label="${reg}">`;

      grupos[reg]
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        .forEach((l) => {
          const chave = getChaveLojaComparativo(l);

          html += `
            <option value="${chave}" ${selecionada === chave ? "selected" : ""}>
              ${l.codigo} — ${l.nome}
            </option>
          `;
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
    const ativa =
      btn.getAttribute("data-aba") === COMPARATIVO_STATE.abaRegional;

    btn.classList.toggle("ativa", ativa);
    btn.setAttribute("aria-selected", ativa ? "true" : "false");
  });
}

function comparativoRegionaisVisiveis() {
  if (COMPARATIVO_STATE.abaRegional === "NE1") return ["NE1"];
  if (COMPARATIVO_STATE.abaRegional === "NE2") return ["NE2"];
  return ["NE1", "NE2"];
}

// ==========================
// 📦 BUSCAR RESULTADOS
// ==========================
function getVariantesSemanaComparativo(semana) {
  const normalizada = normalizarSemanaComparativo(semana);
  const numero = Number(normalizada);

  const variantes = new Set();

  variantes.add(normalizada);

  if (Number.isFinite(numero)) {
    variantes.add(String(numero));
    variantes.add(String(numero).padStart(2, "0"));
  }

  return [...variantes].filter(Boolean);
}

function getVariantesSemanasComparativo(semanas = []) {
  const variantes = new Set();

  (semanas || []).forEach((semana) => {
    getVariantesSemanaComparativo(semana).forEach((v) => variantes.add(v));
  });

  return [...variantes].filter(Boolean);
}

// Supabase devolve no máximo ~1000 linhas por requisição. No "Mês inteiro"
// (todos os indicadores × várias semanas) isso estoura facilmente e algumas
// lojas/indicadores somem. Este helper pagina via .range() até trazer tudo.
async function buscarTodasPaginasComparativo(montarQuery, tamanhoPagina = 1000) {
  let todos = [];
  let inicio = 0;

  // trava de segurança para não loopar infinito (até 50k linhas)
  for (let i = 0; i < 50; i++) {
    const fim = inicio + tamanhoPagina - 1;

    const { data, error } = await montarQuery().range(inicio, fim);

    if (error) throw error;

    const pagina = data || [];
    todos = todos.concat(pagina);

    // se voltou menos que uma página cheia, acabou
    if (pagina.length < tamanhoPagina) break;

    inicio += tamanhoPagina;
  }

  return todos;
}

async function buscarResultadosComparativoBase({
  anoReferencia,
  mesSelecionado,
  semanaSel,
}) {
  const semanaEspecifica = semanaSel && semanaSel !== "TODAS";
  const semanasFiltro = semanaEspecifica
    ? [semanaSel]
    : getSemanasDoMesPorMesComparativo(mesSelecionado, anoReferencia);

  const variantesSemana = getVariantesSemanasComparativo(semanasFiltro);

  // monta a query base (sem .range — a paginação cuida disso)
  const montarQueryBase = () => {
    let query = window.db.from("resultados").select("*");

    if (variantesSemana.length) {
      query = query.in("semana", variantesSemana);
    }

    if (COMPARATIVO_STATE.indicador !== "TODOS") {
      const indicadorBanco = getIndicadorBancoComparativo(
        COMPARATIVO_STATE.indicador
      );
      query = query.eq("indicador", indicadorBanco);
    }

    if (COMPARATIVO_STATE.loja !== "TODAS") {
      query = query.eq("loja", COMPARATIVO_STATE.loja);
    }

    // ordem estável para a paginação não pular/repetir linhas
    return query.order("id", { ascending: true });
  };

  const data = await buscarTodasPaginasComparativo(montarQueryBase);

  let resultados = (data || []).filter((r) => {
    const semanaRegistro = normalizarSemanaComparativo(r.semana);
    return semanasFiltro.includes(semanaRegistro);
  });

  if (!resultados.length) {
    const montarFallback = () => {
      let fallback = window.db.from("resultados").select("*");

      if (variantesSemana.length) {
        fallback = fallback.in("semana", variantesSemana);
      }

      if (COMPARATIVO_STATE.indicador !== "TODOS") {
        const indicadorBanco = getIndicadorBancoComparativo(
          COMPARATIVO_STATE.indicador
        );
        fallback = fallback.eq("indicador", indicadorBanco);
      }

      if (COMPARATIVO_STATE.loja !== "TODAS") {
        fallback = fallback.eq("loja", COMPARATIVO_STATE.loja);
      }

      return fallback.order("id", { ascending: true });
    };

    const fallbackData = await buscarTodasPaginasComparativo(montarFallback);

    resultados = (fallbackData || []).filter((r) => {
      const semanaRegistro = normalizarSemanaComparativo(r.semana);
      return semanasFiltro.includes(semanaRegistro);
    });

    console.warn("⚠️ Comparativos usou fallback sem ano_referencia", {
      anoReferencia,
      mesSelecionado,
      semanaSel,
      semanasFiltro,
      encontrados: resultados.length,
    });
  }

  console.log("🗓️ Filtro temporal comparativo aplicado:", {
    anoReferencia,
    mesSelecionado,
    nomeMes: mesSelecionado ? getNomeMesComparativo(mesSelecionado) : null,
    semanaSel,
    semanasFiltro,
    variantesSemana,
    registrosRetornados: resultados.length,
  });

  // se o total se aproxima de múltiplos de 1000, a paginação está funcionando
  console.log(
    `📦 Comparativos: ${resultados.length} linha(s) carregada(s) (paginado, sem teto de 1000)`
  );

  return resultados;
}

// ==========================
// 📦 BUSCAR E RENDERIZAR
// ==========================
async function carregarDadosComparativos() {
  const alvo = document.getElementById("comparativoConteudo");
  if (!alvo) return;

  alvo.innerHTML = `<div class="loading-box">Processando comparativos...</div>`;

  try {
    const { data: lojasData, error: lojasError } = await window.db
      .from("lojas")
      .select("*")
      .order("codigo");

    if (lojasError) throw lojasError;

    const lojas = aplicarEscopoLojasComparativo(lojasData || []);
    const mapaLojaRegional = montarMapaLojaRegionalComparativo(lojas);

    preencherSelectLojas(lojas);

    const anoReferencia = getAnoAtualComparativo();
    const mesSelecionado = getMesSelecionadoComparativo();
    const semanaSel = COMPARATIVO_STATE.semana === "TODAS"
      ? "TODAS"
      : normalizarSemanaComparativo(COMPARATIVO_STATE.semana);

    const semanaEspecifica = semanaSel && semanaSel !== "TODAS";
    const semanasConsideradas = semanaEspecifica
      ? [semanaSel]
      : getSemanasDoMesPorMesComparativo(mesSelecionado, anoReferencia);

    const resultadosBrutos = await buscarResultadosComparativoBase({
      anoReferencia,
      mesSelecionado,
      semanaSel,
    });

    // mapa código → regional, derivado do cadastro de lojas E da ordem fixa NE1/NE2.
    // Serve de rede de segurança quando o campo "regional" da loja vem vazio/errado.
    const mapaCodigoRegional = {};
    (lojas || []).forEach((l) => {
      const cod = String(l.codigo || "");
      const reg = normalizarTextoComparativoUpper(l.regional || "");
      if (cod && reg) mapaCodigoRegional[cod] = reg;
    });
    // completa com a ordem fixa (caso o cadastro não traga regional)
    ORDEM_LOJAS_COMPARATIVO.forEach((cod, i) => {
      if (mapaCodigoRegional[cod]) return;
      // os 14 primeiros códigos são NE1; o restante, NE2 (ver ORDEM_LOJAS_COMPARATIVO)
      mapaCodigoRegional[cod] = i < 14 ? "NE1" : "NE2";
    });

    const resultadosNorm = (resultadosBrutos || []).map((r) => {
      const lojaCadastro = localizarLojaCadastroComparativo(lojas, r);

      const codigoLoja =
        r.loja_codigo ||
        lojaCadastro?.codigo ||
        getCodigoLojaComparativo(r.loja || "");

      const lojaChaveCadastro = lojaCadastro
        ? getChaveLojaComparativo(lojaCadastro)
        : r.loja;

      // regional: 1º do cadastro; 2º do mapa por chave; 3º do mapa por CÓDIGO (rede de segurança)
      const regional =
        lojaCadastro?.regional ||
        mapaLojaRegional[r.loja] ||
        mapaLojaRegional[lojaChaveCadastro] ||
        mapaCodigoRegional[String(codigoLoja || "")] ||
        "";

      return {
        ...r,
        indicador: normalizarIndicadorBancoComparativo(r.indicador),
        loja: lojaChaveCadastro || r.loja,
        _loja_codigo: String(codigoLoja || ""),
        _semana: normalizarSemanaComparativo(r.semana),
        _regional: normalizarTextoComparativoUpper(regional),
      };
    });

    const semanasEncontradas =
      extrairSemanasDosResultadosComparativo(resultadosNorm);

    // diagnóstico: nomes de indicadores que vieram do banco (ajuda a achar variações
    // de nome que impedem o "match" — ex: "CANCELAMENTOS" vs "CANCELAMENTO")
    const indicadoresNoBanco = [
      ...new Set(resultadosNorm.map((r) => r.indicador).filter(Boolean)),
    ].sort();
    console.log("🏷️ Indicadores encontrados no banco:", indicadoresNoBanco);

    // diagnóstico: resultados que NÃO conseguiram resolver a regional
    // (causa clássica de "tem dado mas não aparece" no comparativo)
    const semRegionalResolvida = resultadosNorm.filter(
      (r) => r._regional !== "NE1" && r._regional !== "NE2"
    );
    if (semRegionalResolvida.length) {
      const amostra = [
        ...new Set(
          semRegionalResolvida.map(
            (r) => `${r._loja_codigo || "?"} | ${r.loja} | reg="${r._regional}"`
          )
        ),
      ].slice(0, 30);
      console.warn(
        `⚠️ ${semRegionalResolvida.length} resultado(s) sem regional NE1/NE2 resolvida — não entram na matriz:`,
        amostra
      );
    }

    // diagnóstico: códigos de loja presentes nos resultados que não estão no cadastro
    const codigosCadastro = new Set(lojas.map((l) => String(l.codigo || "")));
    const codigosOrfaos = [
      ...new Set(
        resultadosNorm
          .map((r) => String(r._loja_codigo || ""))
          .filter((c) => c && !codigosCadastro.has(c))
      ),
    ];
    if (codigosOrfaos.length) {
      console.warn(
        "⚠️ Códigos de loja nos resultados que NÃO existem no cadastro de lojas:",
        codigosOrfaos
      );
    }

    const infoPeriodoHtml = semanaEspecifica
      ? `
        <div class="comparativo-info-periodo">
          <strong>Período:</strong>
          ${getNomeMesComparativo(mesSelecionado)} / ${anoReferencia} — Semana ${semanaSel}
        </div>
      `
      : `
        <div class="comparativo-info-periodo">
          <strong>Mês selecionado:</strong>
          ${getNomeMesComparativo(mesSelecionado)} / ${anoReferencia}
          <br>
          <strong>Semanas consideradas:</strong>
          ${semanasConsideradas.length ? semanasConsideradas.join(", ") : "-"}
          <br>
          <strong>Semanas com resultados:</strong>
          ${
            semanasEncontradas.length
              ? semanasEncontradas.join(", ")
              : "Nenhuma semana encontrada"
          }
          <br>
          <small>"Mês inteiro" agrega todas as semanas do mês. Escolha uma semana no filtro para ver só ela.</small>
        </div>
      `;

    const semRegional = [
      ...new Set(resultadosNorm.filter((r) => !r._regional).map((r) => r.loja)),
    ];

    if (semRegional.length) {
      console.warn("⚠️ Comparativos: resultados sem regional:", semRegional);
    }

    console.log("📊 Comparativos diagnóstico:", {
      anoReferencia,
      mesSelecionado,
      semanaSel,
      semanasConsideradas,
      resultadosBrutos: resultadosBrutos.length,
      resultadosNorm: resultadosNorm.length,
      semanasEncontradas,
      lojasCadastradas: lojas.length,
      ne1Lojas: lojas.filter(
        (l) => normalizarTextoComparativoUpper(l.regional) === "NE1"
      ).length,
      ne2Lojas: lojas.filter(
        (l) => normalizarTextoComparativoUpper(l.regional) === "NE2"
      ).length,
    });

    const tipoIndicador =
      COMPARATIVO_STATE.indicador !== "TODOS"
        ? getTipoCampoComparativo(COMPARATIVO_STATE.indicador)
        : "numero";

    let regionais;

    if (COMPARATIVO_STATE.loja !== "TODAS") {
      const lojaSelecionada = lojas.find(
        (l) => getChaveLojaComparativo(l) === COMPARATIVO_STATE.loja
      );

      const regDaLoja = lojaSelecionada?.regional
        ? normalizarTextoComparativoUpper(lojaSelecionada.regional)
        : mapaLojaRegional[COMPARATIVO_STATE.loja];

      regionais = regDaLoja ? [regDaLoja] : comparativoRegionaisVisiveis();
    } else {
      regionais = comparativoRegionaisVisiveis();
    }

    const umaRegional = regionais.length === 1;

    if (COMPARATIVO_STATE.indicador === "TODOS") {
      const indicadoresMeta = getColunasMatrizComparativo();

      alvo.innerHTML = `
        ${infoPeriodoHtml}
        <div class="comparativo-matrizes ${
          umaRegional ? "uma-regional" : ""
        }">
          ${regionais
            .map((reg) =>
              renderMatrizRegional(reg, resultadosNorm, indicadoresMeta, lojas)
            )
            .join("")}
        </div>
      `;
    } else {
      const menorMelhor = menorEhMelhorComparativo(COMPARATIVO_STATE.indicador);

      alvo.innerHTML = `
        ${infoPeriodoHtml}
        <div class="comparativo-regionais ${
          umaRegional ? "uma-regional" : ""
        }">
          ${regionais
            .map((reg) =>
              renderComparativoRegional(
                reg,
                resultadosNorm,
                tipoIndicador,
                menorMelhor,
                lojas
              )
            )
            .join("")}
        </div>
      `;
    }
  } catch (erro) {
    console.error("❌ Erro ao carregar comparativos:", erro);

    alvo.innerHTML = `
      <div class="loading-box loading-erro">
        Erro ao carregar: ${erro.message || erro}
      </div>
    `;
  }
}

// ==========================
// 🗺️ RENDER INDIVIDUAL
// ==========================
function renderComparativoRegional(
  nomeRegional,
  resultadosNorm,
  tipoIndicador,
  menorMelhor,
  lojasData = []
) {
  const regionalUpper = normalizarTextoComparativoUpper(nomeRegional);
  const isMoeda = tipoMoedaComparativo(tipoIndicador);
  const isPercentual = tipoPercentualComparativo(tipoIndicador);

  const lojasRegional = (lojasData || [])
    .filter((loja) => getRegionalLojaComparativo(loja) === regionalUpper)
    .sort((a, b) => {
      const ca = String(a.codigo || "");
      const cb = String(b.codigo || "");

      let ia = ORDEM_LOJAS_COMPARATIVO.indexOf(ca);
      let ib = ORDEM_LOJAS_COMPARATIVO.indexOf(cb);

      if (ia === -1) ia = 9999;
      if (ib === -1) ib = 9999;

      if (ia !== ib) return ia - ib;

      return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
    });

  const mapaLojas = {};
  const codigosRegional = new Set();

  lojasRegional.forEach((loja) => {
    const chave = getChaveLojaComparativo(loja);
    codigosRegional.add(String(loja.codigo || ""));

    mapaLojas[chave] = {
      loja: chave,
      codigo: String(loja.codigo || ""),
      nome: loja.nome || "",
      valores: [],
    };
  });

  resultadosNorm
    .filter(
      (r) =>
        r._regional === regionalUpper ||
        codigosRegional.has(String(r._loja_codigo || ""))
    )
    .forEach((r) => {
      const lojaCadastro = localizarLojaCadastroComparativo(lojasData, r);
      const chave = lojaCadastro ? getChaveLojaComparativo(lojaCadastro) : r.loja;

      // ignora resultados de lojas que não pertencem a esta regional
      const codR = String(r._loja_codigo || (lojaCadastro?.codigo ?? ""));
      if (codigosRegional.size && codR && !codigosRegional.has(codR)) return;

      if (!mapaLojas[chave]) {
        const partes = quebrarLojaComparativo(chave);

        mapaLojas[chave] = {
          loja: chave,
          codigo: partes.codigo,
          nome: partes.nome,
          valores: [],
        };
      }

      const numero = parseNumeroComparativo(r.valor);
      // zero é valor válido (ex: semana sem desconto/cancelamento = R$ 0,00)
      if (Number.isFinite(numero)) {
        mapaLojas[chave].valores.push(numero);
      }
    });

  const listaLojas = Object.values(mapaLojas).map((item) => {
    const valorAgregado = agregarValoresComparativo(
      item.valores,
      tipoIndicador
    );

    return {
      loja: item.loja,
      codigo: item.codigo,
      nome: item.nome,
      valor: valorAgregado,
      qtdSemanas: item.valores.length,
    };
  });

  const valoresValidos = listaLojas
    .map((l) => l.valor)
    .filter((v) => v !== null && v !== undefined && Number.isFinite(v));

  const minVal = valoresValidos.length ? Math.min(...valoresValidos) : 0;
  const maxVal = valoresValidos.length ? Math.max(...valoresValidos) : 0;

  const linhas = listaLojas
    .map((loja) => {
      const temValor =
        loja.valor !== null &&
        loja.valor !== undefined &&
        Number.isFinite(loja.valor);

      let corFundo = "";
      let corTexto = "";

      if (temValor) {
        if (isPercentual) {
          const c = corPercentualFaixa(loja.valor);
          corFundo = c.fundo;
          corTexto = c.texto;
        } else {
          const intens = calcularIntensidadeHeatmap(
            loja.valor,
            minVal,
            maxVal,
            menorMelhor
          );

          corFundo = heatmapCorVibrante(intens);
          corTexto = heatmapCorTexto(intens);
        }
      }

      return `
        <tr
          class="comparativo-row"
          style="${temValor ? `background-color:${corFundo}; color:${corTexto};` : ""}"
        >
          <td class="col-nome" title="${loja.loja}">
            ${loja.codigo ? `<span class="matriz-loja-cod">${loja.codigo}</span>` : ""}
            <span class="matriz-loja-nome">${loja.nome || loja.loja}</span>
          </td>
          <td class="col-valor">
            ${temValor ? formatarValorComparativo(loja.valor, tipoIndicador) : "—"}
          </td>
        </tr>
      `;
    })
    .join("");

  const ehSoma = tipoSomaComparativo(tipoIndicador);
  const ehMensal = !!getMesSelecionadoComparativo();
  const unidade = isMoeda ? " (R$)" : "";

  const labelValor = ehSoma
    ? ehMensal
      ? `Total do mês${unidade}`
      : `Total${unidade}`
    : ehMensal
      ? "Média do mês"
      : "Valor";

  const legenda =
    COMPARATIVO_STATE.indicador === "TODOS"
      ? ""
      : `
        <div class="regional-legenda">
          <span class="legenda-item">
            <span class="legenda-bola verde"></span>
            ${menorMelhor ? "Menor (melhor)" : "Maior (melhor)"}
          </span>
          <span class="legenda-item">
            <span class="legenda-bola vermelho"></span>
            ${menorMelhor ? "Maior (pior)" : "Menor (pior)"}
          </span>
        </div>
      `;

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
// ✂️ QUEBRAR LOJA
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
// 🖥️ TELA CHEIA
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
    else if (container.webkitRequestFullscreen)
      await container.webkitRequestFullscreen();
    else if (container.msRequestFullscreen)
      await container.msRequestFullscreen();

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
    // noop
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
// 🧩 MATRIZ
// ==========================
function getIndicadoresMatrizComparativo() {
  return getIndicadoresComparativoLista().map((i) => {
    const classe = i.classe || getClasseOficialIndicadorComparativo(i.valor);
    const banco = normalizarIndicadorBancoComparativo(
      getIndicadorBancoComparativo(i.valor, classe)
    );

    return {
      valor: i.valor,
      nome: i.nome,
      classe,
      banco,
      tipo: getTipoCampoComparativo(i.valor, classe),
      menorMelhor: menorEhMelhorComparativo(i.valor, classe),
    };
  });
}

// colunas da matriz: expande indicadores de 2 campos (ex: Televendas → Part % + Margem)
function getColunasMatrizComparativo() {
  const colunas = [];

  getIndicadoresComparativoLista().forEach((i) => {
    const classe = i.classe || getClasseOficialIndicadorComparativo(i.valor);
    const banco = normalizarIndicadorBancoComparativo(
      getIndicadorBancoComparativo(i.valor, classe)
    );
    const menorMelhor = menorEhMelhorComparativo(i.valor, classe);

    let campos = null;
    if (typeof getIndicadorConfig === "function") {
      try {
        campos = getIndicadorConfig(i.valor, classe)?.campos || null;
      } catch (e) {}
    }
    if (!campos || !campos.length) {
      campos = [
        { key: "valor", label: i.nome, tipo: getTipoCampoComparativo(i.valor, classe) },
      ];
    }

    const dupla = campos.length > 1;
    campos.forEach((campo) => {
      colunas.push({
        valor: i.valor,
        classe,
        banco,
        campo: campo.key || "valor",
        nome: dupla ? `${i.nome} · ${campo.label}` : i.nome,
        tipo: campo.tipo || getTipoCampoComparativo(i.valor, classe),
        menorMelhor,
      });
    });
  });

  return colunas;
}

function formatarCelulaMatriz(valor, tipo) {
  const n = Number(valor);

  if (!Number.isFinite(n)) return "—";

  if (tipoInteiroComparativo(tipo)) {
    return Math.trunc(n).toLocaleString("pt-BR");
  }

  if (tipoPercentualComparativo(tipo)) {
    return (
      n.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%"
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

  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function unidadeIndicadorMatriz(tipo) {
  if (tipoPercentualComparativo(tipo)) return "%";
  if (tipoMoedaComparativo(tipo)) return "R$";
  return "";
}

function renderMatrizRegional(
  nomeRegional,
  resultadosNorm,
  indicadoresMeta,
  lojasData = []
) {
  const regionalUpper = normalizarTextoComparativoUpper(nomeRegional);

  const lojasRegional = (lojasData || [])
    .filter((loja) => getRegionalLojaComparativo(loja) === regionalUpper)
    .sort((a, b) => {
      const ca = String(a.codigo || "");
      const cb = String(b.codigo || "");

      let ia = ORDEM_LOJAS_COMPARATIVO.indexOf(ca);
      let ib = ORDEM_LOJAS_COMPARATIVO.indexOf(cb);

      if (ia === -1) ia = 9999;
      if (ib === -1) ib = 9999;

      if (ia !== ib) return ia - ib;

      return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
    });

  if (!lojasRegional.length) {
    return `
      <div class="matriz-card">
        <h3 class="regional-titulo">
          ${nomeRegional}
          <span class="regional-contagem">0 lojas</span>
        </h3>
        <div class="regional-vazio">Nenhuma loja cadastrada para esta regional.</div>
      </div>
    `;
  }

  const lojas = {};
  const codigosRegional = new Set();

  lojasRegional.forEach((loja) => {
    const chaveLoja = getChaveLojaComparativo(loja);
    codigosRegional.add(String(loja.codigo || ""));

    lojas[chaveLoja] = {
      codigo: String(loja.codigo || ""),
      nome: loja.nome || "",
      regional: regionalUpper,
      indicadores: {},
    };
  });

  resultadosNorm
    .filter(
      (r) =>
        r._regional === regionalUpper ||
        codigosRegional.has(String(r._loja_codigo || ""))
    )
    .forEach((r) => {
      const lojaCadastro = localizarLojaCadastroComparativo(lojasData, r);

      const chaveLoja = lojaCadastro
        ? getChaveLojaComparativo(lojaCadastro)
        : r.loja;

      // só inclui resultados de lojas desta regional (evita misturar NE1/NE2)
      const codR = String(r._loja_codigo || (lojaCadastro?.codigo ?? ""));
      if (codigosRegional.size && codR && !codigosRegional.has(codR)) return;

      if (!lojas[chaveLoja]) {
        const partes = quebrarLojaComparativo(chaveLoja);

        lojas[chaveLoja] = {
          codigo: partes.codigo,
          nome: partes.nome,
          regional: regionalUpper,
          indicadores: {},
        };
      }

      const indBanco = normalizarIndicadorBancoComparativo(r.indicador);

      if (!lojas[chaveLoja].indicadores[indBanco]) {
        lojas[chaveLoja].indicadores[indBanco] = {
          valor: [],
          valor2: [],
          justificativa: "",
        };
      }

      const slot = lojas[chaveLoja].indicadores[indBanco];
      ["valor", "valor2"].forEach((campo) => {
        const numero = parseNumeroComparativo(r[campo]);
        // inclui zero como valor válido (ex: DESCONTO/CANCELAMENTO = R$ 0,00)
        if (Number.isFinite(numero)) slot[campo].push(numero);
      });
      // guarda a justificativa (sem resposta) — exibida quando a célula não tiver valor
      if (r.justificativa) slot.justificativa = String(r.justificativa);
    });

  const colunas = indicadoresMeta;

  const valorCelula = (lojaObj, ind) => {
    const slot = lojaObj?.indicadores?.[ind.banco];
    const arr = slot ? slot[ind.campo || "valor"] : null;

    if (!arr || !arr.length) return null;

    return agregarValoresComparativo(arr, ind.tipo);
  };

  // justificativa (sem resposta) da loja para o indicador — exibida quando a célula
  // não tem valor numérico (vale tanto para "Mês inteiro" quanto para semana específica)
  const justificativaCelula = (lojaObj, ind) => {
    const slot = lojaObj?.indicadores?.[ind.banco];
    return slot && slot.justificativa ? String(slot.justificativa) : "";
  };

  const escMatriz = (t) =>
    String(t ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const nomesLojas = Object.keys(lojas).sort((a, b) => {
    const la = lojas[a];
    const lb = lojas[b];

    const ca = String(la.codigo || "");
    const cb = String(lb.codigo || "");

    let ia = ORDEM_LOJAS_COMPARATIVO.indexOf(ca);
    let ib = ORDEM_LOJAS_COMPARATIVO.indexOf(cb);

    if (ia === -1) ia = 9999;
    if (ib === -1) ib = 9999;

    if (ia !== ib) return ia - ib;

    return String(la.nome || "").localeCompare(String(lb.nome || ""), "pt-BR");
  });

  const faixaColuna = {};

  colunas.forEach((ind) => {
    const vals = nomesLojas
      .map((lojaKey) => valorCelula(lojas[lojaKey], ind))
      .filter((v) => v !== null && v !== undefined && Number.isFinite(v));

    faixaColuna[`${ind.banco}::${ind.campo}`] = {
      min: vals.length ? Math.min(...vals) : 0,
      max: vals.length ? Math.max(...vals) : 0,
    };
  });

  const thIndicadores = colunas
    .map((ind) => {
      const uni = unidadeIndicadorMatriz(ind.tipo);

      return `
        <th class="matriz-th-ind" title="${ind.nome}">
          <span class="matriz-th-nome">${ind.nome}</span>
          ${uni ? `<span class="matriz-th-uni">${uni}</span>` : ""}
        </th>
      `;
    })
    .join("");

  const linhas = nomesLojas
    .map((lojaKey) => {
      const lojaObj = lojas[lojaKey];

      const celulas = colunas
        .map((ind) => {
          const v = valorCelula(lojaObj, ind);

          if (v === null || v === undefined || !Number.isFinite(v)) {
            // sem valor: se a loja deixou justificativa no preenchimento, mostra o motivo
            const just = justificativaCelula(lojaObj, ind);
            if (just) {
              return `<td class="matriz-celula matriz-justificativa" title="${escMatriz(just)}">
                <span class="matriz-justif-txt">${escMatriz(just)}</span>
              </td>`;
            }
            return `<td class="matriz-celula matriz-vazia">—</td>`;
          }

          let fundo;
          let texto;

          if (tipoPercentualComparativo(ind.tipo)) {
            const c = corPercentualFaixa(v);
            fundo = c.fundo;
            texto = c.texto;
          } else {
            const { min, max } = faixaColuna[`${ind.banco}::${ind.campo}`];
            const intens = calcularIntensidadeHeatmap(
              v,
              min,
              max,
              ind.menorMelhor
            );

            fundo = heatmapCorVibrante(intens);
            texto = heatmapCorTexto(intens);
          }

          return `
            <td class="matriz-celula" style="background:${fundo}; color:${texto};">
              ${formatarCelulaMatriz(v, ind.tipo)}
            </td>
          `;
        })
        .join("");

      return `
        <tr>
          <td class="matriz-loja" title="${lojaKey}">
            <span class="matriz-loja-cod">${lojaObj.codigo}</span>
            <span class="matriz-loja-nome">${lojaObj.nome}</span>
          </td>
          ${celulas}
        </tr>
      `;
    })
    .join("");

  const tdsResumo = colunas
    .map((ind) => {
      const vals = nomesLojas
        .map((lojaKey) => valorCelula(lojas[lojaKey], ind))
        .filter((v) => v !== null && v !== undefined && Number.isFinite(v));

      if (!vals.length) {
        return `
          <th class="matriz-resumo-cel" style="background:rgba(13, 22, 34, 0.6);color:#7f8da3;font-weight:600;">
            —
          </th>
        `;
      }

      const soma = vals.reduce((a, b) => a + b, 0);
      // % → MÉDIA de todas as lojas; R$ e números → SOMA (total da regional)
      const ehPct = tipoPercentualComparativo(ind.tipo);
      const valor = ehPct ? soma / vals.length : soma;

      return `
        <th class="matriz-resumo-cel" style="background:rgba(13, 22, 34, 0.6);color:#eaf2ff;font-weight:700;white-space:nowrap;">
          ${formatarCelulaMatriz(valor, ind.tipo)}
        </th>
      `;
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
            <tr class="matriz-linha-resumo">
              <th class="matriz-th-loja" style="background:rgba(13, 22, 34, 0.6);color:#9db4d6;font-weight:700;">
                📊 Média / Total
              </th>
              ${tdsResumo}
            </tr>

            <tr>
              <th class="matriz-th-loja">Loja</th>
              ${thIndicadores}
            </tr>
          </thead>

          <tbody>${linhas}</tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================
// 🖨️ EXPORTAÇÃO (Print / PDF / XLSX)
// ==========================
function carregarScriptCDNComparativo(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-cdn="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.dataset.cdn = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar " + src));
    document.head.appendChild(s);
  });
}

function comparativoFeedbackExport(msg) {
  if (typeof mostrarErro === "function") {
    mostrarErro(msg);
  } else {
    alert(msg);
  }
}

// PRINT — gera uma IMAGEM (PNG) com a tabela INTEIRA (clona expandida fora da tela)
async function comparativoImprimir() {
  const alvo = document.getElementById("comparativoConteudo");
  if (!alvo) return;

  if (!alvo.querySelector(".matriz-card")) {
    comparativoFeedbackExport("Nada para capturar ainda.");
    return;
  }

  try {
    await carregarScriptCDNComparativo(
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
    );

    // clona o conteúdo, expandido e fora da tela (sem scroll, sem sticky)
    const clone = alvo.cloneNode(true);
    clone.style.width = "max-content";
    clone.style.maxWidth = "none";

    clone.querySelectorAll(".matriz-scroll").forEach((s) => {
      s.style.overflow = "visible";
      s.style.width = "max-content";
      s.style.maxWidth = "none";
    });
    // remove sticky (senão a coluna loja "vaza" na captura)
    clone.querySelectorAll(".matriz-loja, .matriz-th-loja").forEach((s) => {
      s.style.position = "static";
      s.style.boxShadow = "none";
    });

    // wrapper COM a classe .comparativo-container para resolver as variáveis CSS
    // (cores do tema), senão os textos saem pretos
    const wrapper = document.createElement("div");
    wrapper.className = "comparativo-container";
    wrapper.style.position = "absolute";
    wrapper.style.left = "-99999px";
    wrapper.style.top = "0";
    wrapper.style.width = "max-content";
    wrapper.style.maxWidth = "none";
    wrapper.style.minHeight = "0";
    wrapper.style.margin = "0";
    wrapper.style.padding = "16px";
    wrapper.style.background = "#0a1622";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const canvas = await window.html2canvas(wrapper, {
      backgroundColor: "#0a1622",
      scale: 2,
      useCORS: true,
      width: wrapper.scrollWidth,
      windowWidth: wrapper.scrollWidth,
    });

    wrapper.remove();

    const link = document.createElement("a");
    link.download = "comparativos-regionais.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (erro) {
    console.error(erro);
    comparativoFeedbackExport(
      "Não foi possível gerar a imagem. Verifique sua conexão e tente de novo."
    );
  }
}

// PDF — abre o diálogo de impressão (lá você escolhe imprimir ou salvar como PDF)
function comparativoExportarPDF() {
  window.print();
}

// XLSX — gera um Excel com uma aba por regional, a partir das tabelas renderizadas
async function comparativoExportarXLSX() {
  const cards = document.querySelectorAll("#comparativoConteudo .matriz-card");
  if (!cards.length) {
    comparativoFeedbackExport("Nada para exportar ainda.");
    return;
  }

  try {
    await carregarScriptCDNComparativo(
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
    );
    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();

    cards.forEach((card, i) => {
      const tabela = card.querySelector("table");
      if (!tabela) return;

      let nome =
        card.querySelector(".regional-titulo")?.textContent.trim().split(/\s{2,}/)[0] ||
        `Regional ${i + 1}`;
      nome = nome.replace(/[\\/?*[\]:]/g, "").substring(0, 28) || `Regional ${i + 1}`;

      const ws = XLSX.utils.table_to_sheet(tabela, { raw: false });
      XLSX.utils.book_append_sheet(wb, ws, nome);
    });

    XLSX.writeFile(wb, "comparativos-regionais.xlsx");
  } catch (erro) {
    console.error(erro);
    comparativoFeedbackExport(
      "Não foi possível gerar o Excel. Verifique sua conexão e tente de novo."
    );
  }
}

// ==========================
// 🌐 EXPOR
// ==========================
window.telaComparativos = telaComparativos;
window.comparativoImprimir = comparativoImprimir;
window.comparativoExportarPDF = comparativoExportarPDF;
window.comparativoExportarXLSX = comparativoExportarXLSX;
window.comparativoAlterarMes = comparativoAlterarMes;
window.comparativoAlterarSemana = comparativoAlterarSemana;
window.comparativoAlterarAba = comparativoAlterarAba;
window.comparativoToggleTelaCheia = comparativoToggleTelaCheia;