// ==========================
// 🧠 ACESSO / CONTEXTO DO DASHBOARD
// ==========================
console.log("✅ dashboard-acesso.js carregado");

// ==========================
// 🎛️ ESTADO DE VISÃO MANUAL
// (usado principalmente pelo Master)
// ==========================
if (typeof window.dashboardVisaoManual === "undefined") {
  window.dashboardVisaoManual = null;
}

// ==========================
// 🔠 NORMALIZAR TEXTO
// ==========================
function normalizarTextoDashboardAcesso(valor) {
  return (valor || "").toString().trim();
}

function normalizarTextoDashboardAcessoUpper(valor) {
  return normalizarTextoDashboardAcesso(valor).toUpperCase();
}

function normalizarTextoDashboardAcessoLower(valor) {
  return normalizarTextoDashboardAcesso(valor).toLowerCase();
}

// ==========================
// 👤 OBTER USUÁRIO COM SEGURANÇA
// ==========================
function getUsuarioDashboardSeguro() {
  try {
    // 1) tenta função global mais completa
    if (typeof getUsuarioLogado === "function") {
      const user = getUsuarioLogado();
      if (user) return user;
    }

    // 2) tenta helper do app.js
    if (typeof getUsuarioLocal === "function") {
      const user = getUsuarioLocal();
      if (user) return user;
    }

    // 3) fallback direto
    const raw = localStorage.getItem("usuario");
    if (!raw) return null;

    return JSON.parse(raw);
  } catch (erro) {
    console.error("❌ Erro ao obter usuário para dashboard:", erro);
    return null;
  }
}

// ==========================
// 👑 VERIFICA MASTER
// ==========================
function isMasterDashboard(user = null) {
  const usuario = user || getUsuarioDashboardSeguro();
  if (!usuario) return false;

  return normalizarTextoDashboardAcessoLower(usuario.perfil) === "master";
}

// ==========================
// 🧭 VALIDAR TIPO DE VISÃO
// ==========================
function validarTipoVisaoDashboard(valor) {
  const visao = normalizarTextoDashboardAcessoLower(valor);

  if (visao === "gerencial") return "gerencial";
  if (visao === "regional") return "regional";

  return null;
}

// ==========================
// 🏷️ INFERIR VISÃO PELA FUNÇÃO
// fallback inteligente quando tipo_visao ainda não existir
// ==========================
function inferirVisaoPorFuncaoDashboard(funcao) {
  const texto = normalizarTextoDashboardAcessoLower(funcao);

  if (!texto) return "gerencial";

  // regional / diretoria
  if (
    texto.includes("regional") ||
    texto.includes("diretor") ||
    texto.includes("diretoria")
  ) {
    return "regional";
  }

  // loja / operação
  if (
    texto.includes("gerente") ||
    texto.includes("sub") ||
    texto.includes("consultor")
  ) {
    return "gerencial";
  }

  // fallback padrão
  return "gerencial";
}

// ==========================
// 🧭 VISÃO PADRÃO DO USUÁRIO
// ==========================
function getVisaoPadraoDashboard(user) {
  if (!user) return "gerencial";

  // 👑 master sempre começa em regional,
  // mas pode trocar manualmente
  if (isMasterDashboard(user)) {
    return "regional";
  }

  const visaoValida = validarTipoVisaoDashboard(user.tipo_visao);
  if (visaoValida) return visaoValida;

  return inferirVisaoPorFuncaoDashboard(user.funcao);
}

// ==========================
// 🎯 ESCOPO DO DASHBOARD
// define como o dashboard deve filtrar
// ==========================
function getEscopoDashboardUsuario(user, visao) {
  const usuario = user || getUsuarioDashboardSeguro();
  if (!usuario) {
    return {
      tipo: "nenhum",
      loja: null,
      regional: null,
      subregional: null
    };
  }

  if (isMasterDashboard(usuario)) {
    return {
      tipo: "global",
      loja: null,
      regional: null,
      subregional: null
    };
  }

  const loja = normalizarTextoDashboardAcesso(usuario.loja_vinculada) || null;
  const regional = normalizarTextoDashboardAcesso(usuario.regional_vinculada) || null;
  const subregional =
    normalizarTextoDashboardAcesso(usuario.subregional_vinculada) || null;

  if (visao === "regional") {
    return {
      tipo: "regional",
      loja: null,
      regional,
      subregional
    };
  }

  return {
    tipo: "loja",
    loja,
    regional,
    subregional
  };
}

// ==========================
// 🧠 CONTEXTO DO DASHBOARD
// regra principal do sistema
// ==========================
function getContextoDashboardUsuario() {
  const user = getUsuarioDashboardSeguro();

  if (!user) {
    console.warn("⚠️ Usuário não encontrado para contexto do dashboard");
    return null;
  }

  const perfil = normalizarTextoDashboardAcessoLower(user.perfil);
  const funcao = normalizarTextoDashboardAcesso(user.funcao);

  const podeTrocarVisao = perfil === "master";

  // se for master e existir escolha manual, usa ela
  let visao = getVisaoPadraoDashboard(user);

  if (podeTrocarVisao && window.dashboardVisaoManual) {
    const manual = validarTipoVisaoDashboard(window.dashboardVisaoManual);
    if (manual) {
      visao = manual;
    }
  }

  const loja_vinculada =
    normalizarTextoDashboardAcesso(user.loja_vinculada) || null;

  const regional_vinculada =
    normalizarTextoDashboardAcesso(user.regional_vinculada) || null;

  const subregional_vinculada =
    normalizarTextoDashboardAcesso(user.subregional_vinculada) || null;

  const escopo = getEscopoDashboardUsuario(user, visao);

  const contexto = {
    usuario_id: user.id || null,
    nome: user.nome || "",
    perfil,
    funcao,

    visao,
    podeTrocarVisao,

    loja_vinculada,
    regional_vinculada,
    subregional_vinculada,

    escopo,

    // útil para debug e futuras regras
    tipo_visao_origem: validarTipoVisaoDashboard(user.tipo_visao)
      ? "cadastro"
      : "funcao_fallback"
  };

  console.log("🧠 Contexto do dashboard:", contexto);

  return contexto;
}

// ==========================
// 🔄 TROCAR VISÃO DO DASHBOARD
// somente master
// ==========================
function trocarVisaoDashboard(visao) {
  const user = getUsuarioDashboardSeguro();

  if (!isMasterDashboard(user)) {
    console.warn("🚫 Apenas Master pode trocar a visão do dashboard");
    return;
  }

  const visaoValida = validarTipoVisaoDashboard(visao);
  if (!visaoValida) {
    console.warn("⚠️ Visão inválida para dashboard:", visao);
    return;
  }

  window.dashboardVisaoManual = visaoValida;

  console.log("🔄 Visão do dashboard alterada manualmente:", visaoValida);

  if (typeof telaDashboard === "function") {
    telaDashboard();
  }
}

// ==========================
// ♻️ RESETAR VISÃO MANUAL
// ==========================
function resetarVisaoDashboardManual() {
  window.dashboardVisaoManual = null;
  console.log("♻️ Visão manual do dashboard resetada");
}

// ==========================
// 🏷️ LABEL BONITA DA VISÃO
// ==========================
function getLabelVisaoDashboard(visao) {
  const v = validarTipoVisaoDashboard(visao);

  if (v === "gerencial") return "Visão Gerencial";
  if (v === "regional") return "Visão Regional";

  return "Visão do Dashboard";
}

// ==========================
// 👀 VERIFICA SE MOSTRA TROCA DE VISÃO
// ==========================
function podeMostrarSeletorVisaoDashboard() {
  const user = getUsuarioDashboardSeguro();
  return isMasterDashboard(user);
}