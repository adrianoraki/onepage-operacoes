console.log("✅ perfil-edicao.js carregado");

// ==========================
// 🧪 VALIDAÇÃO DE DEPENDÊNCIAS
// ==========================
(function validarDependenciasPerfilEdicao() {
  const obrigatorias = [
    "getUsuarioLogado",
    "getPermissoesSistemaUsuario",
    "normalizarTexto",
    "normalizarTextoLower",
    "aplicarEscopoVisualTabela",
  ];

  const faltando = obrigatorias.filter(
    (nome) => typeof window[nome] !== "function"
  );

  if (faltando.length) {
    console.error("❌ perfil-edicao.js sem dependências obrigatórias:", faltando);
  } else {
    console.log("✅ Dependências de perfil-edicao.js OK");
  }
})();

// ==========================
// 📅 SEMANA ANTERIOR
// ==========================
function getSemanaAnterior(semanaAtual) {
  const atual = Number(semanaAtual);

  if (Number.isNaN(atual)) {
    console.warn("⚠️ getSemanaAnterior recebeu valor inválido:", semanaAtual);
    return 53;
  }

  if (atual <= 1) return 53;
  return atual - 1;
}

// ==========================
// 📅 JANELA DE EDIÇÃO
// ==========================
function podeEditarNaJanela(user, semanaInformada, semanaAtual) {
  const usuario = user || getUsuarioLogado();

  if (!usuario) {
    console.warn("⚠️ podeEditarNaJanela sem usuário");
    return false;
  }

  const permissoes = getPermissoesSistemaUsuario(usuario);

  const s = Number(semanaInformada);
  const atual = Number(semanaAtual);

  if (Number.isNaN(s) || Number.isNaN(atual)) {
    console.warn("⚠️ podeEditarNaJanela com semana inválida:", {
      semanaInformada,
      semanaAtual,
    });
    return false;
  }

  if (permissoes.pode_editar_qualquer_semana) {
    console.log("🟢 Edição liberada: pode_editar_qualquer_semana = true");
    return true;
  }

  if (permissoes.pode_editar_semana_anterior) {
    const permitido = s <= atual;
    console.log("🟡 Regra semana anterior:", {
      semanaInformada: s,
      semanaAtual: atual,
      permitido,
    });
    return permitido;
  }

  if (permissoes.pode_editar_semana_atual) {
    const permitido = s === atual;
    console.log("🟡 Regra semana atual:", {
      semanaInformada: s,
      semanaAtual: atual,
      permitido,
    });
    return permitido;
  }

  console.log("🔴 Nenhuma regra de edição de janela habilitada");
  return false;
}

// ==========================
// 🔍 SEMANA ATUAL COM FALLBACK
// ==========================
function obterSemanaAtualEdicao() {
  if (typeof window.getSemanaAtual === "function") {
    try {
      return Number(window.getSemanaAtual());
    } catch (erro) {
      console.warn("⚠️ Falha ao usar getSemanaAtual global:", erro);
    }
  }

  if (typeof window.obterSemanaAtualApp === "function") {
    try {
      return Number(window.obterSemanaAtualApp());
    } catch (erro) {
      console.warn("⚠️ Falha ao usar obterSemanaAtualApp:", erro);
    }
  }

  console.warn("⚠️ Nenhuma função de semana atual encontrada. Usando fallback 1.");
  return 1;
}

// ==========================
// 🧩 HELPERS DE CLASSE / SUBCLASSE
// ==========================
function getClasseEfetivaDoIndicador(indicador, classeInformada = "") {
  const classeDireta = normalizarTexto(classeInformada || "");
  if (classeDireta) return classeDireta;

  if (typeof window.getMetaIndicadorPermissao === "function") {
    try {
      const meta = window.getMetaIndicadorPermissao(indicador);
      return normalizarTexto(meta?.classe || "");
    } catch (erro) {
      console.warn(
        "⚠️ Falha ao resolver classe por getMetaIndicadorPermissao:",
        erro
      );
    }
  }

  return "";
}

function getSubclasseEfetivaDoIndicador(indicador) {
  if (typeof window.getMetaIndicadorPermissao === "function") {
    try {
      const meta = window.getMetaIndicadorPermissao(indicador);
      return normalizarTexto(meta?.subclasse || "GERAL");
    } catch (erro) {
      console.warn(
        "⚠️ Falha ao resolver subclasse por getMetaIndicadorPermissao:",
        erro
      );
    }
  }

  return "GERAL";
}

// ==========================
// 🔍 MOTIVO DO BLOQUEIO
// ==========================
function getMotivoBloqueio(indicador, classe, semana) {
  const user = getUsuarioLogado();

  if (!user) {
    return "Usuário não autenticado";
  }

  const semanaAtual = String(obterSemanaAtualEdicao()).padStart(2, "0");
  const semanaInformada = String(semana).padStart(2, "0");

  const permissoesSistema = getPermissoesSistemaUsuario(user);

  const permissoesIndicadores = user.permissoes || {};
  const indicadores = (permissoesIndicadores.indicadores || []).map(
    normalizarTexto
  );
  const classes = (permissoesIndicadores.classes || []).map(normalizarTexto);
  const subclasses = (permissoesIndicadores.subclasses || []).map(
    normalizarTexto
  );

  const indicadorNorm = normalizarTexto(indicador);
  const classeNorm = getClasseEfetivaDoIndicador(indicadorNorm, classe);
  const subclasseNorm = getSubclasseEfetivaDoIndicador(indicadorNorm);

  let tokenSubclasse = "";
  if (typeof window.getTokenSubclasse === "function" && classeNorm) {
    try {
      tokenSubclasse = normalizarTexto(
        window.getTokenSubclasse(classeNorm, subclasseNorm)
      );
    } catch (erro) {
      console.warn("⚠️ Falha ao montar token de subclasse:", erro);
    }
  }

  const acessoTotalIndicadores =
    permissoesIndicadores.acesso_total === true ||
    indicadores.includes("TODAS") ||
    indicadores.includes("TODAS AS TABELAS") ||
    indicadores.includes("TODOS OS INDICADORES");

  const permitidoIndicador =
    acessoTotalIndicadores ||
    indicadores.includes(indicadorNorm) ||
    (classeNorm && classes.includes(classeNorm)) ||
    (tokenSubclasse && subclasses.includes(tokenSubclasse)) ||
    normalizarTextoLower(user.perfil) === "master";

  console.log("🔍 Permissão check:", {
    user: user.nome || user.email || "(sem nome)",
    perfil: user.perfil,
    indicador: indicadorNorm,
    classeInformada: classe,
    classeEfetiva: classeNorm,
    subclasse: subclasseNorm,
    tokenSubclasse,
    subclasses,
    semana: semanaInformada,
    semanaAtual,
    permitidoIndicador,
    permissoesSistema,
    indicadores,
    classes,
    acessoTotalIndicadores,
  });

  // master sempre pode editar
  if (normalizarTextoLower(user.perfil) === "master") return null;

  if (!permitidoIndicador) {
    return "Sem permissão para este indicador/tabela";
  }

  const dentroDaJanela = podeEditarNaJanela(
    user,
    Number(semanaInformada),
    Number(semanaAtual)
  );

  if (!dentroDaJanela) {
    if (permissoesSistema.pode_editar_qualquer_semana) {
      return null;
    }

    if (permissoesSistema.pode_editar_semana_anterior) {
      return "Você não pode editar esta semana.";
    }

    if (permissoesSistema.pode_editar_semana_atual) {
      return "Você só pode editar a semana atual.";
    }

    return "Prazo encerrado. Somente com desbloqueio do Master.";
  }

  return null;
}

// ==========================
// 🔐 REGRA FINAL DE EDIÇÃO
// ==========================
function podeEditar(indicador, classe, semana) {
  const motivo = getMotivoBloqueio(indicador, classe, semana);
  const permitido = motivo === null;

  console.log("✏️ podeEditar:", {
    indicador,
    classe,
    semana,
    permitido,
    motivo,
  });

  return permitido;
}

// ==========================
// 🔒 APLICAR BLOQUEIO NO INPUT
// ==========================
function aplicarPermissaoInput(input, indicador, classe, semana) {
  if (!input) {
    console.warn("⚠️ aplicarPermissaoInput recebeu input nulo");
    return;
  }

  const row = input.closest("tr");
  const dentroEscopo = !row || row.dataset.escopoPermitido !== "false";

  if (!dentroEscopo) {
    input.disabled = true;
    input.readOnly = true;
    input.removeAttribute("onblur");
    input.onblur = null;

    input.style.background = "#f1f1f1";
    input.style.color = "#777";
    input.style.cursor = "not-allowed";
    input.style.border = "1px solid #ddd";

    input.title = "Fora do escopo configurado para este usuário";
    input.dataset.bloqueado = "true";
    input.dataset.motivo = "Fora do escopo configurado para este usuário";

    console.log("🚫 Input bloqueado por escopo:", {
      indicador,
      classe,
      semana,
      motivo: "Fora do escopo configurado para este usuário",
    });

    return;
  }

  const motivo = getMotivoBloqueio(indicador, classe, semana);
  const allowed = motivo === null;

  if (!allowed) {
    input.disabled = true;
    input.readOnly = true;
    input.removeAttribute("onblur");
    input.onblur = null;

    input.style.background = "#f1f1f1";
    input.style.color = "#777";
    input.style.cursor = "not-allowed";
    input.style.border = "1px solid #ddd";

    input.title = motivo;
    input.dataset.bloqueado = "true";
    input.dataset.motivo = motivo;

    console.log("🚫 Input bloqueado por permissão:", {
      indicador,
      classe,
      semana,
      motivo,
    });

    return;
  }

  input.disabled = false;
  input.readOnly = false;
  input.style.background = "#fff";
  input.style.color = "#000";
  input.style.cursor = "text";
  input.style.border = "1px solid #ccc";

  input.removeAttribute("title");
  input.dataset.bloqueado = "false";
  input.dataset.motivo = "";

  console.log("✅ Input liberado:", {
    indicador,
    classe,
    semana,
  });
}

// ==========================
// 🧩 APLICAR PERMISSÕES NA TABELA
// ==========================
function aplicarPermissoesTabela(indicador, classe) {
  console.log("🛡️ Aplicando permissões na tabela...", { indicador, classe });

  // 1) aplica escopo visual primeiro
  if (typeof window.aplicarEscopoVisualTabela === "function") {
    window.aplicarEscopoVisualTabela();
  } else {
    console.error("❌ aplicarEscopoVisualTabela não encontrada");
  }

  // 2) aplica permissão nos inputs
  const inputs = document.querySelectorAll(
    "#conteudo input[data-loja][data-semana]"
  );

  if (!inputs.length) {
    console.warn("⚠️ Nenhum input encontrado para aplicar permissão");
  } else {
    inputs.forEach((input) => {
      const semana = input.dataset.semana;
      aplicarPermissaoInput(input, indicador, classe, semana);
    });

    console.log("✅ Permissões aplicadas na tabela:", {
      totalInputs: inputs.length,
      indicador,
      classe,
    });
  }
}

// ==========================
// 🌐 EXPOR FUNÇÕES DE EDIÇÃO NO WINDOW
// ==========================
window.getSemanaAnterior = getSemanaAnterior;
window.podeEditarNaJanela = podeEditarNaJanela;
window.getMotivoBloqueio = getMotivoBloqueio;
window.podeEditar = podeEditar;
window.aplicarPermissaoInput = aplicarPermissaoInput;
window.aplicarPermissoesTabela = aplicarPermissoesTabela;
window.obterSemanaAtualEdicao = obterSemanaAtualEdicao;
window.getClasseEfetivaDoIndicador = getClasseEfetivaDoIndicador;
window.getSubclasseEfetivaDoIndicador = getSubclasseEfetivaDoIndicador;

// ==========================
// ✅ LOG FINAL DE BOOTSTRAP
// ==========================
console.log("✅ perfil-edicao.js pronto", {
  getSemanaAnterior: typeof window.getSemanaAnterior,
  podeEditarNaJanela: typeof window.podeEditarNaJanela,
  getMotivoBloqueio: typeof window.getMotivoBloqueio,
  podeEditar: typeof window.podeEditar,
  aplicarPermissaoInput: typeof window.aplicarPermissaoInput,
  aplicarPermissoesTabela: typeof window.aplicarPermissoesTabela,
  obterSemanaAtualEdicao: typeof window.obterSemanaAtualEdicao,
  getClasseEfetivaDoIndicador: typeof window.getClasseEfetivaDoIndicador,
  getSubclasseEfetivaDoIndicador: typeof window.getSubclasseEfetivaDoIndicador,
});
``