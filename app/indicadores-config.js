console.log("✅ indicadores-config.js carregado");

// ==========================
// 🧠 CONFIGURAÇÃO CENTRAL DOS INDICADORES
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
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["RUPTURA FINAL"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  ETIQUETA: {
    nomeExibicao: "ETIQUETA",
    indicadorBanco: "ETIQUETA",
    classe: "Auditoria",
    subclasse: "GERAL",
    tipo: "percentual",
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
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["SELF-CHECKOUT"],
    campos: [
      { key: "valor", label: "Participação de vendas", tipo: "moeda" },
      { key: "valor2", label: "Qtd passantes", tipo: "numero" },
    ],
    metas: {},
  },

  DESCONTO: {
    nomeExibicao: "DESCONTO",
    indicadorBanco: "DESCONTO",
    classe: "Frente de Caixa",
    subclasse: "GERAL",
    tipo: "moeda",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["DESCONTO"],
    campos: [{ key: "valor", label: "Valor (R$)", tipo: "moeda" }],
    metas: {},
  },

  CANCELAMENTO: {
    nomeExibicao: "CANCELAMENTO",
    indicadorBanco: "CANCELAMENTO",
    classe: "Frente de Caixa",
    subclasse: "GERAL",
    tipo: "moeda",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["CANCELAMENTO"],
    campos: [{ key: "valor", label: "Valor (R$)", tipo: "moeda" }],
    metas: {},
  },

  "DEVOLUÇÃO": {
    nomeExibicao: "DEVOLUÇÃO",
    indicadorBanco: "DEVOLUÇÃO",
    classe: "Frente de Caixa",
    subclasse: "GERAL",
    tipo: "moeda",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["DEVOLUÇÃO", "DEVOLUCAO"],
    campos: [{ key: "valor", label: "Valor (R$)", tipo: "moeda" }],
    metas: {},
  },

  // ======================
  // OPERAÇÕES
  // ======================
  // ✅ usamos chave interna única para evitar conflito com PSV da Prevenção
  PSV_OPERACOES: {
    nomeExibicao: "PSV",
    nomeMenu: "Visita Prospecção",
    valorMenu: "PSV",
    indicadorBanco: "PSV",
    classe: "Operações",
    subclasse: "GERAL",
    tipo: "percentual",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["VISITA PROSPECÇÃO", "VISITA PROSPECCAO", "PSV"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  NPS: {
    nomeExibicao: "NPS",
    indicadorBanco: "NPS",
    classe: "Operações",
    subclasse: "GERAL",
    tipo: "numero",
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
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["PART.TELEVENDAS"],
    campos: [
      { key: "valor", label: "Part %", tipo: "percentual" },
      { key: "valor2", label: "Margem", tipo: "percentual" },
    ],
    metas: {},
  },

  // ======================
  // PREVENÇÃO
  // ======================
  // ✅ Mantido no sistema para uso contextual, mas fora da tela de permissões
  PSV_PREVENCAO: {
    nomeExibicao: "PSV",
    indicadorBanco: "PSV",
    classe: "Prevenção",
    subclasse: "GERAL",
    tipo: "percentual",
    incluirEmPermissoes: false, // alinhado ao print desejado
    incluirNoMenu: true,
    aliases: ["PSV"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  QUEBRA: {
    nomeExibicao: "QUEBRA",
    indicadorBanco: "QUEBRA",
    classe: "Prevenção",
    subclasse: "GERAL",
    tipo: "percentual",
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
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["QUEBRA AÇOUGUE", "QUEBRA ACOUGUE"],
    campos: [{ key: "valor", label: "Resultado", tipo: "percentual" }],
    metas: {},
  },

  TROCA: {
    nomeExibicao: "TROCA",
    indicadorBanco: "TROCA",
    classe: "Prevenção",
    subclasse: "GERAL",
    tipo: "moeda",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["TROCA"],
    campos: [{ key: "valor", label: "Valor (R$)", tipo: "moeda" }],
    metas: {},
  },

  // ======================
  // RH / OPERACIONAL
  // ======================
  "BANCOS DE HORAS": {
    nomeExibicao: "BANCOS DE HORAS",
    indicadorBanco: "BANCOS DE HORAS",
    classe: "RH / Operacional",
    subclasse: "GERAL",
    tipo: "especial-rh",
    incluirEmPermissoes: true,
    incluirNoMenu: true,
    aliases: ["BANCOS DE HORAS"],
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

    // se nome == valor, pode entrar como string simples
    if (nomeMenu === valorMenu) {
      if (!agrupado[classe].includes(valorMenu)) {
        agrupado[classe].push(valorMenu);
      }
    } else {
      const jaExiste = agrupado[classe].some(
        (item) =>
          typeof item === "object" &&
          item?.nome === nomeMenu &&
          item?.valor === valorMenu
      );

      if (!jaExiste) {
        agrupado[classe].push({
          nome: nomeMenu,
          valor: valorMenu,
        });
      }
    }
  });

  return agrupado;
}

// ==========================
// 🎯 RESOLVER CONTEXTO DO INDICADOR
// (importante para PSV / Visita Prospecção)
// ==========================
function resolverIndicadorContexto(indicador, classeSelecionada = null) {
  const indicadorNormalizado = normalizarTextoIndicador(indicador);
  const classeNormalizada = (classeSelecionada || "").toString().trim();

  // ✅ caso especial: PSV em Operações = Visita Prospecção
  if (indicadorNormalizado === "PSV" && classeNormalizada === "Operações") {
    return indicadoresConfig.PSV_OPERACOES;
  }

  // ✅ caso especial: PSV em Prevenção = PSV da Prevenção
  if (indicadorNormalizado === "PSV" && classeNormalizada === "Prevenção") {
    return indicadoresConfig.PSV_PREVENCAO;
  }

  // ✅ busca direta pela chave interna
  if (indicadoresConfig[indicadorNormalizado]) {
    return indicadoresConfig[indicadorNormalizado];
  }

  // ✅ busca por aliases
  const encontradoPorAlias = Object.values(indicadoresConfig).find((cfg) => {
    const aliases = Array.isArray(cfg.aliases) ? cfg.aliases : [];
    const aliasOk = aliases.some(
      (alias) => normalizarTextoIndicador(alias) === indicadorNormalizado
    );

    if (!aliasOk) return false;

    // se veio classe, tenta respeitar contexto
    if (classeNormalizada) {
      return (cfg.classe || "").trim() === classeNormalizada;
    }

    return true;
  });

  if (encontradoPorAlias) {
    return encontradoPorAlias;
  }

  // ✅ fallback seguro
  return {
    nomeExibicao: indicador || "Indicador",
    indicadorBanco: indicadorNormalizado,
    classe: classeSelecionada || "Outros",
    subclasse: "GERAL",
    tipo: "numero",
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

// ==========================
// 🎨 FORMATAR EXIBIÇÃO
// ==========================
function formatarValorExibicao(valor, tipo) {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(valor);

  if (Number.isNaN(numero)) return "";

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
function limparValorParaSalvar(valor, tipo) {
  if (valor === null || valor === undefined) return null;

  let texto = String(valor).trim();

  if (!texto) return null;

  texto = texto
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");

  if (tipo === "percentual") {
    texto = texto.replace("%", "");
  }

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
function formatarValorParaInput(valor, tipo) {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(valor);
  if (Number.isNaN(numero)) return "";

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
  const tipo = input.dataset.tipo || "numero";
  const valorLimpo = limparValorParaSalvar(input.value, tipo);

  input.value = valorLimpo === null ? "" : String(valorLimpo).replace(".", ",");
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
window.resolverIndicadorContexto = resolverIndicadorContexto;
window.getIndicadorConfig = getIndicadorConfig;
window.getNomeIndicador = getNomeIndicador;
window.getIndicadorBanco = getIndicadorBanco;
window.getClasseIndicador = getClasseIndicador;
window.getSubclasseIndicador = getSubclasseIndicador;
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
  classesPermissoes: [...new Set(Object.values(window.mapaClasse || {}).map((v) => v.classe))],
  classesMenu: Object.keys(window.classesIndicadores || {}),
  indicadoresPermissoes: Object.keys(window.mapaClasse || {}),
});