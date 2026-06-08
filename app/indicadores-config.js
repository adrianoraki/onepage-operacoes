console.log("✅ indicadores-config.js carregado");

// ==========================
// 🧠 CONFIGURAÇÃO CENTRAL DOS INDICADORES
// Alinhado ao catálogo oficial do Supabase:
// 17 indicadores oficiais.
// ==========================
const indicadoresConfig = {
  // ======================
  // AUDITORIA
  // ======================
  "RUPTURA FINAL": {
    nomeExibicao: "RUPTURA FINAL",
    indicadorBanco: "RUPTURA FINAL",
    classe: "Auditoria",
    subclasse: "GERAL",
    tipo: "percentual",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["RUPTURA FINAL", "RUPTURA", "Ruptura Final"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  ETIQUETA: {
    nomeExibicao: "ETIQUETA",
    indicadorBanco: "ETIQUETA",
    classe: "Auditoria",
    subclasse: "GERAL",
    tipo: "percentual",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["ETIQUETA"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  // ======================
  // FRENTE DE CAIXA
  // ======================
  "SELF-CHECKOUT": {
    nomeExibicao: "SELF-CHECKOUT",
    indicadorBanco: "SELF-CHECKOUT",
    classe: "Frente de Caixa",
    subclasse: "GERAL",
    tipo: "especial",
    ordemRanking: "desc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["SELF-CHECKOUT", "SELF CHECKOUT", "SELFCHECKOUT"],
    campos: [
      { key: "valor", label: "Participação de Vendas", tipo: "moeda" },
      { key: "valor2", label: "Qtd Passantes", tipo: "inteiro" },
    ],
    metas: {},
  },

  DESCONTO: {
    nomeExibicao: "DESCONTO",
    indicadorBanco: "DESCONTO",
    classe: "Frente de Caixa",
    subclasse: "GERAL",
    tipo: "moeda",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["DESCONTO", "DESCONTOS"],
    campos: [{ key: "valor", label: "Valor (R$)", tipo: "moeda" }],
    metas: {},
  },

  CANCELAMENTO: {
    nomeExibicao: "CANCELAMENTO",
    indicadorBanco: "CANCELAMENTO",
    classe: "Frente de Caixa",
    subclasse: "GERAL",
    tipo: "moeda",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["CANCELAMENTO", "CANCELAMENTOS"],
    campos: [{ key: "valor", label: "Valor (R$)", tipo: "moeda" }],
    metas: {},
  },

  DEVOLUÇÃO: {
    nomeExibicao: "DEVOLUÇÃO",
    indicadorBanco: "DEVOLUÇÃO",
    classe: "Frente de Caixa",
    subclasse: "GERAL",
    tipo: "moeda",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["DEVOLUÇÃO", "DEVOLUCAO", "DEVOLUÇÕES", "DEVOLUCOES"],
    campos: [{ key: "valor", label: "Valor (R$)", tipo: "moeda" }],
    metas: {},
  },

  "FAIXA HORAS": {
    nomeExibicao: "FAIXA HORAS",
    indicadorBanco: "FAIXA HORAS",
    classe: "Frente de Caixa",
    subclasse: "GERAL",
    tipo: "numero",
    ordemRanking: "desc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["FAIXA HORAS", "FAIXA DE HORAS", "FAIXA HORA"],
    campos: [{ key: "valor", label: "Resultado", tipo: "numero" }],
    metas: {},
  },

  // ======================
  // OPERAÇÕES
  // ======================
  "VISITA PROSPECÇÃO": {
    nomeExibicao: "VISITA PROSPECÇÃO",
    nomeMenu: "Visita Prospecção",
    valorMenu: "VISITA PROSPECÇÃO",
    indicadorBanco: "VISITA PROSPECÇÃO",
    classe: "Operações",
    subclasse: "GERAL",
    tipo: "percentual",
    ordemRanking: "desc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: [
      "VISITA PROSPECÇÃO",
      "VISITA PROSPECCAO",
      "VISITA PROSPEC",
      "PROSPECÇÃO",
      "PROSPECCAO",
    ],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  NPS: {
    nomeExibicao: "NPS",
    indicadorBanco: "NPS",
    classe: "Operações",
    subclasse: "GERAL",
    tipo: "numero",
    ordemRanking: "desc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["NPS"],
    campos: [{ key: "valor", label: "Resultado", tipo: "numero" }],
    metas: {},
  },

  "PART.TELEVENDAS": {
    nomeExibicao: "PART.TELEVENDAS",
    indicadorBanco: "PART.TELEVENDAS",
    classe: "Operações",
    subclasse: "GERAL",
    tipo: "especial",
    ordemRanking: "desc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["PART.TELEVENDAS", "PART TELEVENDAS", "PARTICIPAÇÃO TELEVENDAS"],
    campos: [
      { key: "valor", label: "Part %", tipo: "percentual" },
      { key: "valor2", label: "Margem", tipo: "percentual" },
    ],
    metas: {},
  },

  // ======================
  // PREVENÇÃO
  // ======================
  QUEBRA: {
    nomeExibicao: "QUEBRA",
    indicadorBanco: "QUEBRA",
    classe: "Prevenção",
    subclasse: "GERAL",
    tipo: "percentual",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["QUEBRA"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  "QUEBRA FLV": {
    nomeExibicao: "QUEBRA FLV",
    indicadorBanco: "QUEBRA FLV",
    classe: "Prevenção",
    subclasse: "GERAL",
    tipo: "percentual",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["QUEBRA FLV"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  "QUEBRA AÇOUGUE": {
    nomeExibicao: "QUEBRA AÇOUGUE",
    indicadorBanco: "QUEBRA AÇOUGUE",
    classe: "Prevenção",
    subclasse: "GERAL",
    tipo: "percentual",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["QUEBRA AÇOUGUE", "QUEBRA ACOUGUE"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  PSV: {
    nomeExibicao: "PSV",
    indicadorBanco: "PSV",
    classe: "Prevenção",
    subclasse: "GERAL",
    tipo: "percentual",
    ordemRanking: "desc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["PSV"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  TROCA: {
    nomeExibicao: "TROCA",
    indicadorBanco: "TROCA",
    classe: "Prevenção",
    subclasse: "GERAL",
    tipo: "moeda",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["TROCA", "TROCAS"],
    campos: [{ key: "valor", label: "Valor (R$)", tipo: "moeda" }],
    metas: {},
  },

  // ======================
  // RH / OPERACIONAL
  // ======================
  "BANCO DE HORAS": {
    nomeExibicao: "BANCO DE HORAS",
    indicadorBanco: "BANCO DE HORAS",
    classe: "RH / Operacional",
    subclasse: "GERAL",
    tipo: "especial-rh",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["BANCO DE HORAS", "BANCOS DE HORAS", "BANCO HORAS"],
    campos: [
      { key: "valor", label: "Horas +", tipo: "numero" },
      { key: "valor2", label: "Horas -", tipo: "numero" },
    ],
    metas: {},
  },

  TURNOVER: {
    nomeExibicao: "TURNOVER",
    indicadorBanco: "TURNOVER",
    classe: "RH / Operacional",
    subclasse: "GERAL",
    tipo: "percentual",
    ordemRanking: "asc",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["TURNOVER"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {
      regional: 38,
      loja: 2.4,
    },
  },
};

// ==========================
// 🔠 NORMALIZA TEXTO
// ==========================
function normalizarTextoIndicador(valor) {
  return (valor || "").toString().trim().toUpperCase();
}

function removerAcentosIndicador(valor) {
  return normalizarTextoIndicador(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarChaveIndicador(valor) {
  return removerAcentosIndicador(valor);
}

// ==========================
// 🧩 CONSTRUIR ESTRUTURAS DERIVADAS
// ==========================
function construirMapaClassePermissoes() {
  const mapa = {};

  Object.entries(indicadoresConfig).forEach(([chaveInterna, cfg]) => {
    if (cfg.incluirEmPermissoes !== true) return;

    const nomePermissao = cfg.nomeExibicao || chaveInterna;

    mapa[nomePermissao] = {
      classe: cfg.classe || "SEM CLASSE",
      subclasse: cfg.subclasse || "GERAL",
      indicadorBanco: cfg.indicadorBanco || nomePermissao,
      chaveInterna,
    };
  });

  return mapa;
}

function construirClassesIndicadoresMenu() {
  const agrupado = {};

  Object.values(indicadoresConfig).forEach((cfg) => {
    if (cfg.incluirNoMenu !== true) return;

    const classe = cfg.classe || "SEM CLASSE";
    if (!agrupado[classe]) agrupado[classe] = [];

    const nomeMenu = cfg.nomeMenu || cfg.nomeExibicao || cfg.indicadorBanco;
    const valorMenu = cfg.valorMenu || cfg.indicadorBanco || cfg.nomeExibicao;

    const jaExiste = agrupado[classe].some((item) => {
      if (typeof item === "string") {
        return item === valorMenu;
      }

      return item?.nome === nomeMenu && item?.valor === valorMenu;
    });

    if (jaExiste) return;

    if (nomeMenu === valorMenu) {
      agrupado[classe].push(valorMenu);
    } else {
      agrupado[classe].push({
        nome: nomeMenu,
        valor: valorMenu,
      });
    }
  });

  return agrupado;
}

// ==========================
// 🎯 RESOLVER CONTEXTO DO INDICADOR
// ==========================
function resolverIndicadorContexto(indicador, classeSelecionada = null) {
  const indicadorNormalizado = normalizarTextoIndicador(indicador);
  const indicadorSemAcento = normalizarChaveIndicador(indicador);
  const classeNormalizada = (classeSelecionada || "").toString().trim();

  // Busca direta pela chave interna
  if (indicadoresConfig[indicadorNormalizado]) {
    const cfgDireto = indicadoresConfig[indicadorNormalizado];

    if (!classeNormalizada || cfgDireto.classe === classeNormalizada) {
      return cfgDireto;
    }
  }

  // Busca por indicadorBanco, nomeExibicao e aliases
  const encontrado = Object.values(indicadoresConfig).find((cfg) => {
    const candidatos = [
      cfg.indicadorBanco,
      cfg.nomeExibicao,
      cfg.nomeMenu,
      cfg.valorMenu,
      ...(Array.isArray(cfg.aliases) ? cfg.aliases : []),
    ]
      .filter(Boolean)
      .map((v) => normalizarChaveIndicador(v));

    const bateIndicador = candidatos.includes(indicadorSemAcento);

    if (!bateIndicador) return false;

    if (classeNormalizada) {
      return (cfg.classe || "").trim() === classeNormalizada;
    }

    return true;
  });

  if (encontrado) {
    return encontrado;
  }

  // Fallback seguro
  return {
    nomeExibicao: indicador || "Indicador",
    indicadorBanco: indicadorNormalizado,
    classe: classeSelecionada || "Outros",
    subclasse: "GERAL",
    tipo: "numero",
    ordemRanking: "desc",
    incluirEmPermissoes: false,
    incluirNoMenu: false,
    aliases: [],
    campos: [{ key: "valor", label: "Resultado", tipo: "numero" }],
    metas: {},
  };
}

// ==========================
// 📦 GET CONFIG COMPLETA
// ==========================
function getIndicadorConfig(indicador, classeSelecionada = null) {
  return resolverIndicadorContexto(indicador, classeSelecionada);
}

// ==========================
// 🏷️ GET NOME EXIBIÇÃO
// ==========================
function getNomeIndicador(indicador, classeSelecionada = null) {
  return getIndicadorConfig(indicador, classeSelecionada).nomeExibicao;
}

// ==========================
// 🗃️ GET NOME BANCO
// ==========================
function getIndicadorBanco(indicador, classeSelecionada = null) {
  return getIndicadorConfig(indicador, classeSelecionada).indicadorBanco;
}

// ==========================
// 🧭 GET CLASSE
// ==========================
function getClasseIndicador(indicador, classeSelecionada = null) {
  return getIndicadorConfig(indicador, classeSelecionada).classe;
}

// ==========================
// 🧭 GET SUBCLASSE
// ==========================
function getSubclasseIndicador(indicador, classeSelecionada = null) {
  return getIndicadorConfig(indicador, classeSelecionada).subclasse || "GERAL";
}

// ==========================
// 🏆 GET ORDEM RANKING
// ==========================
function getOrdemRankingIndicador(indicador, classeSelecionada = null) {
  return getIndicadorConfig(indicador, classeSelecionada).ordemRanking || "desc";
}

// ==========================
// 🔍 TIPO TABELA ESPECIAL
// ==========================
function isIndicadorEspecial(indicador, classeSelecionada = null) {
  const cfg = getIndicadorConfig(indicador, classeSelecionada);
  return cfg.tipo === "especial";
}

function isIndicadorEspecialRH(indicador, classeSelecionada = null) {
  const cfg = getIndicadorConfig(indicador, classeSelecionada);
  return cfg.tipo === "especial-rh";
}

function tipoEhInteiroIndicador(tipo) {
  const t = (tipo || "").toString().trim().toLowerCase();
  return (
    t === "inteiro" ||
    t === "int" ||
    t === "integer" ||
    t === "numero-inteiro"
  );
}

// ==========================
// 🎨 FORMATAR EXIBIÇÃO
// ==========================
function formatarValorExibicao(valor, tipo = "numero") {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(valor);
  if (Number.isNaN(numero)) return "";

  if (tipoEhInteiroIndicador(tipo)) {
    return String(Math.trunc(numero));
  }

  if (tipo === "percentual") {
    return `${numero.toFixed(2).replace(".", ",")}%`;
  }

  if (tipo === "moeda") {
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return numero.toString().replace(".", ",");
}

// ==========================
// 🧹 LIMPAR VALOR P/ SALVAR
// ==========================
function limparValorParaSalvar(valor, tipo = "numero") {
  if (valor === null || valor === undefined) return null;

  let texto = String(valor).trim();
  if (!texto) return null;

  texto = texto.replace(/\s/g, "").replace("R$", "");

  if (tipo === "percentual") {
    texto = texto.replace("%", "");
  }

  if (tipoEhInteiroIndicador(tipo)) {
    const sinal = texto.startsWith("-") ? -1 : 1;
    const digitos = texto.replace(/\D/g, "");
    if (!digitos) return null;

    const numero = Number(digitos) * sinal;
    return Number.isNaN(numero) ? null : numero;
  }

  if (tipo === "moeda" || tipo === "percentual") {
    const sinal = texto.startsWith("-") ? -1 : 1;
    const digitos = texto.replace(/\D/g, "");

    if (!digitos) return null;

    const numero = Number(digitos) / 100;
    return Number.isNaN(numero) ? null : numero * sinal;
  }

  texto = texto.replace(/\.(?=.*\.)/g, "").replace(",", ".");

  const numero = Number(texto);
  return Number.isNaN(numero) ? null : numero;
}

// ==========================
// 🔍 PEGAR CONFIG DE UM CAMPO
// ==========================
function getCampoConfig(indicador, campoKey = "valor", classeSelecionada = null) {
  const cfg = getIndicadorConfig(indicador, classeSelecionada);
  const campo = (cfg.campos || []).find((c) => c.key === campoKey);

  if (campo) return campo;

  return {
    key: campoKey,
    label: "Resultado",
    tipo: cfg.tipo === "percentual" ? "percentual" : "numero",
  };
}

// ==========================
// ✍️ FORMATAR VALOR PARA INPUT
// ==========================
function formatarValorParaInput(valor, tipo = "numero") {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(valor);
  if (Number.isNaN(numero)) return "";

  if (tipoEhInteiroIndicador(tipo)) {
    return String(Math.trunc(numero));
  }

  if (tipo === "percentual") {
    return `${numero.toFixed(2).replace(".", ",")}%`;
  }

  if (tipo === "moeda") {
    return `R$ ${numero.toFixed(2).replace(".", ",")}`;
  }

  return numero.toString().replace(".", ",");
}

// ==========================
// 🎯 PREPARAR INPUT PARA EDIÇÃO
// ==========================
function prepararInputFormatado(input) {
  if (!input) return;

  const tipo = input.dataset?.tipo || "numero";
  const valorAtual = (input.value || "").toString().trim();

  if (!valorAtual) {
    input.value = "";
    return;
  }

  if (tipoEhInteiroIndicador(tipo)) {
    const sinal = valorAtual.startsWith("-") ? "-" : "";
    const digitos = valorAtual.replace(/\D/g, "");
    input.value = digitos ? `${sinal}${digitos}` : "";
    return;
  }

  if (tipo === "moeda" || tipo === "percentual") {
    const sinal = valorAtual.startsWith("-") ? "-" : "";
    const digitos = valorAtual.replace(/\D/g, "");
    input.value = digitos ? `${sinal}${digitos}` : "";
    return;
  }

  input.value = valorAtual
    .replace(/\s/g, "")
    .replace(/\.(?=.*\.)/g, "")
    .replace(",", ".");
}

// ==========================
// 🌐 EXPOR ESTRUTURAS GLOBAIS
// ==========================
window.indicadoresConfig = indicadoresConfig;
window.mapaClasse = construirMapaClassePermissoes();
window.classesIndicadores = construirClassesIndicadoresMenu();

// ==========================
// 🌐 EXPOR HELPERS NO WINDOW
// ==========================
window.normalizarTextoIndicador = normalizarTextoIndicador;
window.removerAcentosIndicador = removerAcentosIndicador;
window.normalizarChaveIndicador = normalizarChaveIndicador;

window.resolverIndicadorContexto = resolverIndicadorContexto;
window.getIndicadorConfig = getIndicadorConfig;
window.getNomeIndicador = getNomeIndicador;
window.getIndicadorBanco = getIndicadorBanco;
window.getClasseIndicador = getClasseIndicador;
window.getSubclasseIndicador = getSubclasseIndicador;
window.getOrdemRankingIndicador = getOrdemRankingIndicador;

window.isIndicadorEspecial = isIndicadorEspecial;
window.isIndicadorEspecialRH = isIndicadorEspecialRH;

window.formatarValorExibicao = formatarValorExibicao;
window.limparValorParaSalvar = limparValorParaSalvar;
window.getCampoConfig = getCampoConfig;
window.formatarValorParaInput = formatarValorParaInput;
window.prepararInputFormatado = prepararInputFormatado;

// ==========================
// ✅ LOG FINAL DE BOOTSTRAP
// ==========================
console.log("✅ indicadores-config.js pronto", {
  totalConfig: Object.keys(window.indicadoresConfig || {}).length,
  totalMapaClasse: Object.keys(window.mapaClasse || {}).length,
  classesPermissoes: [
    ...new Set(Object.values(window.mapaClasse || {}).map((v) => v.classe)),
  ],
  classesMenu: Object.keys(window.classesIndicadores || {}),
  indicadoresPermissoes: Object.keys(window.mapaClasse || {}),
});