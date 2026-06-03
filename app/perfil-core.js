// ==========================
// 🔐 CONFIG GLOBAL PERFIL
// ==========================
let usuarioLogado = null;
let usuarioPermissoesEditando = null;
let autosaveUsuarioTimer = null;

console.log("✅ perfil-core.js carregado");

// ==========================
// 🔠 NORMALIZAR TEXTO
// ==========================
function normalizarTexto(valor) {
  return (valor || "").toString().trim().toUpperCase();
}

function normalizarTextoLower(valor) {
  return (valor || "").toString().trim().toLowerCase();
}

function normalizarTextoSemAcento(valor) {
  return (valor || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizarListaRegionais(valor) {
  if (!valor) return [];

  if (Array.isArray(valor)) {
    return valor.map((v) => normalizarTexto(v)).filter(Boolean);
  }

  if (typeof valor === "string") {
    return valor
      .split(",")
      .map((v) => normalizarTexto(v))
      .filter(Boolean);
  }

  return [];
}

function listaRegionaisParaTexto(lista) {
  if (!Array.isArray(lista) || !lista.length) return "";

  return lista
    .map((v) => normalizarTexto(v))
    .filter(Boolean)
    .join(", ");
}

// ==========================
// 🧠 PERMISSÕES BASE POR PERFIL
// master > admin > usuario
// ==========================
function getPermissoesBasePorPerfil(perfil) {
  const perfilNorm = normalizarTextoLower(perfil);

  if (perfilNorm === "master") {
    return {
      pode_editar_semana_atual: true,
      pode_editar_semana_anterior: true,
      pode_editar_qualquer_semana: true,

      pode_gerenciar_usuarios: true,
      pode_gerenciar_funcoes: true,
      pode_ver_dashboard: true,
      pode_ver_analises: true,
      pode_ver_comparativos: true,
      pode_ver_justificativas: true,
      pode_aprovar_ajustes: true,
      pode_atribuir_escopo: true,

      permissao_visualizacao: "TODOS",
    };
  }

  if (perfilNorm === "admin") {
    return {
      pode_editar_semana_atual: true,
      pode_editar_semana_anterior: true,
      pode_editar_qualquer_semana: false,

      pode_gerenciar_usuarios: true,
      pode_gerenciar_funcoes: false,
      pode_ver_dashboard: true,
      pode_ver_analises: true,
      pode_ver_comparativos: true,
      pode_ver_justificativas: true,
      pode_aprovar_ajustes: true,
      pode_atribuir_escopo: false,

      permissao_visualizacao: "TODOS",
    };
  }

  return {
    pode_editar_semana_atual: true,
    pode_editar_semana_anterior: false,
    pode_editar_qualquer_semana: false,

    pode_gerenciar_usuarios: false,
    pode_gerenciar_funcoes: false,
    pode_ver_dashboard: true,
    pode_ver_analises: true,
    pode_ver_comparativos: true,
    pode_ver_justificativas: false,
    pode_aprovar_ajustes: false,
    pode_atribuir_escopo: false,

    permissao_visualizacao: "TODOS",
  };
}

// ==========================
// 🔐 PERMISSÕES EFETIVAS DO USUÁRIO
// mistura base + overrides salvos
// ==========================
function getPermissoesSistemaUsuario(user = null) {
  const usuario = user || getUsuarioLogado();

  if (!usuario) {
    console.warn(
      "⚠️ getPermissoesSistemaUsuario sem usuário. Usando base de 'usuario'."
    );
    return getPermissoesBasePorPerfil("usuario");
  }

  const base = getPermissoesBasePorPerfil(usuario.perfil);
  const perms = usuario.permissoes || {};

  let permissaoVisualizacaoFinal =
    perms.permissao_visualizacao ?? base.permissao_visualizacao;

  if (typeof window.normalizarPermissaoVisualizacao === "function") {
    permissaoVisualizacaoFinal =
      window.normalizarPermissaoVisualizacao(permissaoVisualizacaoFinal);
  } else {
    console.warn(
      "⚠️ normalizarPermissaoVisualizacao ainda não carregada. Mantendo valor bruto:",
      permissaoVisualizacaoFinal
    );
  }

  const permissoesFinal = {
    ...base,

    pode_editar_semana_atual:
      perms.pode_editar_semana_atual ?? base.pode_editar_semana_atual,

    pode_editar_semana_anterior:
      perms.pode_editar_semana_anterior ?? base.pode_editar_semana_anterior,

    pode_editar_qualquer_semana:
      perms.pode_editar_qualquer_semana ?? base.pode_editar_qualquer_semana,

    pode_gerenciar_usuarios:
      perms.pode_gerenciar_usuarios ?? base.pode_gerenciar_usuarios,

    pode_gerenciar_funcoes:
      perms.pode_gerenciar_funcoes ?? base.pode_gerenciar_funcoes,

    pode_ver_dashboard: perms.pode_ver_dashboard ?? base.pode_ver_dashboard,
    pode_ver_analises: perms.pode_ver_analises ?? base.pode_ver_analises,
    pode_ver_comparativos:
      perms.pode_ver_comparativos ?? base.pode_ver_comparativos,
    pode_ver_justificativas:
      perms.pode_ver_justificativas ?? base.pode_ver_justificativas,
    pode_aprovar_ajustes:
      perms.pode_aprovar_ajustes ?? base.pode_aprovar_ajustes,
    pode_atribuir_escopo:
      perms.pode_atribuir_escopo ?? base.pode_atribuir_escopo,

    permissao_visualizacao: permissaoVisualizacaoFinal,
  };

  console.log("🔐 Permissões efetivas calculadas:", {
    usuario: usuario.nome || usuario.email || "(sem nome)",
    perfil: usuario.perfil,
    permissao_visualizacao: permissoesFinal.permissao_visualizacao,
  });

  return permissoesFinal;
}

// ==========================
// 🔄 USUÁRIO LOGADO
// ==========================
function getUsuarioLogado() {
  try {
    const user =
      typeof window.getUsuarioLocal === "function"
        ? window.getUsuarioLocal()
        : JSON.parse(localStorage.getItem("usuario"));

    if (!user) {
      console.warn("⚠️ Usuário não encontrado no storage/local");
      return null;
    }

    const permissoesSistema = getPermissoesSistemaUsuario(user);

    usuarioLogado = {
      ...user,
      perfil: normalizarTextoLower(user.perfil),
      tipo_visao: normalizarTextoLower(user.tipo_visao),

      loja_codigo: user.loja_codigo || null,
      loja_vinculada: user.loja_vinculada || null,
      regional_vinculada: user.regional_vinculada || null,
      regionais_vinculadas: normalizarListaRegionais(user.regionais_vinculadas),

      pode_editar_semana_atual: permissoesSistema.pode_editar_semana_atual,
      pode_editar_semana_anterior:
        permissoesSistema.pode_editar_semana_anterior,
      pode_editar_qualquer_semana:
        permissoesSistema.pode_editar_qualquer_semana,

      pode_gerenciar_usuarios: permissoesSistema.pode_gerenciar_usuarios,
      pode_gerenciar_funcoes: permissoesSistema.pode_gerenciar_funcoes,
      pode_ver_dashboard: permissoesSistema.pode_ver_dashboard,
      pode_ver_analises: permissoesSistema.pode_ver_analises,
      pode_ver_comparativos: permissoesSistema.pode_ver_comparativos,
      pode_ver_justificativas: permissoesSistema.pode_ver_justificativas,
      pode_aprovar_ajustes: permissoesSistema.pode_aprovar_ajustes,
      pode_atribuir_escopo: permissoesSistema.pode_atribuir_escopo,

      permissao_visualizacao: permissoesSistema.permissao_visualizacao,
    };

    // mantém regional principal dentro da lista por compatibilidade
    if (
      usuarioLogado.regional_vinculada &&
      !usuarioLogado.regionais_vinculadas.includes(
        normalizarTexto(usuarioLogado.regional_vinculada)
      )
    ) {
      usuarioLogado.regionais_vinculadas.unshift(
        normalizarTexto(usuarioLogado.regional_vinculada)
      );
    }

    usuarioLogado.regionais_vinculadas = [
      ...new Set(usuarioLogado.regionais_vinculadas),
    ];

    console.log("👤 Usuário logado normalizado:", {
      nome: usuarioLogado.nome,
      email: usuarioLogado.email,
      perfil: usuarioLogado.perfil,
      tipo_visao: usuarioLogado.tipo_visao,
      loja_codigo: usuarioLogado.loja_codigo,
      loja_vinculada: usuarioLogado.loja_vinculada,
      regional_vinculada: usuarioLogado.regional_vinculada,
      regionais_vinculadas: usuarioLogado.regionais_vinculadas,
      permissao_visualizacao: usuarioLogado.permissao_visualizacao,
      pode_editar_semana_atual: usuarioLogado.pode_editar_semana_atual,
      pode_editar_semana_anterior: usuarioLogado.pode_editar_semana_anterior,
      pode_editar_qualquer_semana:
        usuarioLogado.pode_editar_qualquer_semana,
    });

    return usuarioLogado;
  } catch (e) {
    console.error("❌ Erro ao montar usuário logado:", e);
    return null;
  }
}

// ==========================
// 🌐 EXPOR ESTADO GLOBAL COM GET/SET
// evita inconsistência entre arquivos
// ==========================
try {
  Object.defineProperty(window, "usuarioLogado", {
    get() {
      return usuarioLogado;
    },
    set(valor) {
      usuarioLogado = valor;
    },
    configurable: true,
  });

  Object.defineProperty(window, "usuarioPermissoesEditando", {
    get() {
      return usuarioPermissoesEditando;
    },
    set(valor) {
      usuarioPermissoesEditando = valor;
    },
    configurable: true,
  });

  Object.defineProperty(window, "autosaveUsuarioTimer", {
    get() {
      return autosaveUsuarioTimer;
    },
    set(valor) {
      autosaveUsuarioTimer = valor;
    },
    configurable: true,
  });
} catch (erro) {
  console.warn("⚠️ Não foi possível definir propriedades globais de estado:", erro);
}

// ==========================
// 🌐 EXPOR FUNÇÕES DO CORE NO WINDOW
// ==========================
window.normalizarTexto = normalizarTexto;
window.normalizarTextoLower = normalizarTextoLower;
window.normalizarTextoSemAcento = normalizarTextoSemAcento;
window.normalizarListaRegionais = normalizarListaRegionais;
window.listaRegionaisParaTexto = listaRegionaisParaTexto;

window.getPermissoesBasePorPerfil = getPermissoesBasePorPerfil;
window.getPermissoesSistemaUsuario = getPermissoesSistemaUsuario;
window.getUsuarioLogado = getUsuarioLogado;

// ==========================
// ✅ LOG FINAL DE BOOTSTRAP
// ==========================
console.log("✅ perfil-core.js pronto", {
  normalizarTexto: typeof window.normalizarTexto,
  normalizarTextoLower: typeof window.normalizarTextoLower,
  normalizarTextoSemAcento: typeof window.normalizarTextoSemAcento,
  normalizarListaRegionais: typeof window.normalizarListaRegionais,
  listaRegionaisParaTexto: typeof window.listaRegionaisParaTexto,
  getPermissoesBasePorPerfil: typeof window.getPermissoesBasePorPerfil,
  getPermissoesSistemaUsuario: typeof window.getPermissoesSistemaUsuario,
  getUsuarioLogado: typeof window.getUsuarioLogado,
});
``