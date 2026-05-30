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
    tipo: "percentual",
    campos: [
      { key: "valor", label: "Resultado", tipo: "percentual" }
    ],
    metas: {}
  },

  "ETIQUETA": {
    nomeExibicao: "ETIQUETA",
    indicadorBanco: "ETIQUETA",
    classe: "Auditoria",
    tipo: "percentual",
    campos: [
      { key: "valor", label: "Resultado", tipo: "percentual" }
    ],
    metas: {}
  },

  // ======================
  // FRENTE DE CAIXA
  // ======================
  "SELF-CHECKOUT": {
    nomeExibicao: "SELF-CHECKOUT",
    indicadorBanco: "SELF-CHECKOUT",
    classe: "Frente de Caixa",
    tipo: "especial",
    campos: [
      { key: "valor", label: "Participação de vendas", tipo: "moeda" },
      { key: "valor2", label: "Qtd passantes", tipo: "numero" }
    ],
    metas: {}
  },

  "DESCONTO": {
    nomeExibicao: "DESCONTO",
    indicadorBanco: "DESCONTO",
    classe: "Frente de Caixa",
    tipo: "moeda",
    campos: [
      { key: "valor", label: "Valor (R$)", tipo: "moeda" }
    ],
    metas: {}
  },

  "CANCELAMENTO": {
    nomeExibicao: "CANCELAMENTO",
    indicadorBanco: "CANCELAMENTO",
    classe: "Frente de Caixa",
    tipo: "moeda",
    campos: [
      { key: "valor", label: "Valor (R$)", tipo: "moeda" }
    ],
    metas: {}
  },

  "DEVOLUÇÃO": {
    nomeExibicao: "DEVOLUÇÃO",
    indicadorBanco: "DEVOLUÇÃO",
    classe: "Frente de Caixa",
    tipo: "moeda",
    campos: [
      { key: "valor", label: "Valor (R$)", tipo: "moeda" }
    ],
    metas: {}
  },

  // ======================
  // OPERAÇÕES
  // ======================
  "VISITA PROSPECÇÃO": {
    nomeExibicao: "Visita Prospecção",
    indicadorBanco: "PSV",
    classe: "Operações",
    tipo: "percentual",
    campos: [
      { key: "valor", label: "Resultado", tipo: "percentual" }
    ],
    metas: {}
  },

  "NPS": {
    nomeExibicao: "NPS",
    indicadorBanco: "NPS",
    classe: "Operações",
    tipo: "percentual",
    campos: [
      { key: "valor", label: "Resultado", tipo: "percentual" }
    ],
    metas: {}
  },

  "PART.TELEVENDAS": {
    nomeExibicao: "PART.TELEVENDAS",
    indicadorBanco: "PART.TELEVENDAS",
    classe: "Operações",
    tipo: "especial",
    campos: [
      { key: "valor", label: "Part %", tipo: "percentual" },
      { key: "valor2", label: "Margem", tipo: "percentual" }
    ],
    metas: {}
  },

  // ======================
  // PREVENÇÃO
  // ======================
  "PSV": {
    nomeExibicao: "PSV",
    indicadorBanco: "PSV",
    classe: "Prevenção",
    tipo: "percentual",
    campos: [
      { key: "valor", label: "Resultado", tipo: "percentual" }
    ],
    metas: {}
  },

  "QUEBRA": {
    nomeExibicao: "QUEBRA",
    indicadorBanco: "QUEBRA",
    classe: "Prevenção",
    tipo: "percentual",
    campos: [
      { key: "valor", label: "Resultado", tipo: "percentual" }
    ],
    metas: {}
  },

  "QUEBRA FLV": {
    nomeExibicao: "QUEBRA FLV",
    indicadorBanco: "QUEBRA FLV",
    classe: "Prevenção",
    tipo: "percentual",
    campos: [
      { key: "valor", label: "Resultado", tipo: "percentual" }
    ],
    metas: {}
  },

  "QUEBRA AÇOUGUE": {
    nomeExibicao: "QUEBRA AÇOUGUE",
    indicadorBanco: "QUEBRA AÇOUGUE",
    classe: "Prevenção",
    tipo: "percentual",
    campos: [
      { key: "valor", label: "Resultado", tipo: "percentual" }
    ],
    metas: {}
  },

  "TROCA": {
    nomeExibicao: "TROCA",
    indicadorBanco: "TROCA",
    classe: "Prevenção",
    tipo: "moeda",
    campos: [
      { key: "valor", label: "Valor (R$)", tipo: "moeda" }
    ],
    metas: {}
  },

  // ======================
  // RH / OPERACIONAL
  // ======================
  "BANCOS DE HORAS": {
    nomeExibicao: "BANCOS DE HORAS",
    indicadorBanco: "BANCOS DE HORAS",
    classe: "RH / Operacional",
    tipo: "especial-rh",
    campos: [
      { key: "valor", label: "Horas +", tipo: "numero" },
      { key: "valor2", label: "Horas -", tipo: "numero" }
    ],
    metas: {}
  },

  "TURNOVER": {
    nomeExibicao: "TURNOVER",
    indicadorBanco: "TURNOVER",
    classe: "RH / Operacional",
    tipo: "percentual",
    campos: [
      { key: "valor", label: "Resultado", tipo: "percentual" }
    ],
    metas: {
      regional: 38,
      loja: 2.4
    }
  }
};

// ==========================
// 🔠 NORMALIZA TEXTO
// ==========================
function normalizarTextoIndicador(valor) {
  return (valor || "")
    .toString()
    .trim()
    .toUpperCase();
}

// ==========================
// 🎯 RESOLVER CONTEXTO DO INDICADOR
// (importante para o caso PSV / Visita Prospecção)
// ==========================
function resolverIndicadorContexto(indicador, classeSelecionada = null) {
  const indicadorNormalizado = normalizarTextoIndicador(indicador);
  const classeNormalizada = (classeSelecionada || "").trim();

  // ✅ caso especial: PSV em Operações = Visita Prospecção
  if (indicadorNormalizado === "PSV" && classeNormalizada === "Operações") {
    return indicadoresConfig["VISITA PROSPECÇÃO"];
  }

  // ✅ caso especial: PSV em Prevenção = PSV
  if (indicadorNormalizado === "PSV" && classeNormalizada === "Prevenção") {
    return indicadoresConfig["PSV"];
  }

  // ✅ se vier pelo nome exibido
  if (indicadoresConfig[indicadorNormalizado]) {
    return indicadoresConfig[indicadorNormalizado];
  }

  // ✅ fallback seguro
  return {
    nomeExibicao: indicador || "Indicador",
    indicadorBanco: indicadorNormalizado,
    classe: classeSelecionada || "Outros",
    tipo: "numero",
    campos: [
      { key: "valor", label: "Resultado", tipo: "numero" }
    ],
    metas: {}
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

  if (isNaN(numero)) return "";

  if (tipo === "percentual") {
    return `${numero.toFixed(2).replace(".", ",")}%`;
  }

  if (tipo === "moeda") {
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
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
  return isNaN(numero) ? null : numero;
}
// ==========================
// 🔍 PEGAR CONFIG DE UM CAMPO
// ==========================
function getCampoConfig(indicador, campoKey = "valor", classeSelecionada = null) {
  const cfg = getIndicadorConfig(indicador, classeSelecionada);
  const campo = (cfg.campos || []).find(c => c.key === campoKey);

  if (campo) return campo;

  return {
    key: campoKey,
    label: "Resultado",
    tipo: cfg.tipo === "percentual" ? "percentual" : "numero"
  };
}

// ==========================
// ✍️ FORMATAR VALOR PARA INPUT
// (melhor para campos editáveis)
// ==========================
function formatarValorParaInput(valor, tipo) {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(valor);
  if (isNaN(numero)) return "";

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
// remove máscara ao focar
// ==========================
function prepararInputFormatado(input) {
  const tipo = input.dataset.tipo || "numero";
  const valorLimpo = limparValorParaSalvar(input.value, tipo);

  input.value = valorLimpo === null ? "" : String(valorLimpo).replace(".", ",");
}