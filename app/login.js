// ==========================
// 🔐 CONFIG SUPABASE LOGIN
// ==========================
const SUPABASE_URL = "https://fnsplftfxvmyiqbigobh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc3BsZnRmeHZteWlxYmlnb2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTYyNTcsImV4cCI6MjA5NTQzMjI1N30.tLhsb0sI1uNgPAc7Yhvxk85cWitrp-ahOoBEpJCqzPY";

const { createClient } = window.supabase;
const supabaseLogin = createClient(SUPABASE_URL, SUPABASE_KEY);

let loginEmAndamento = false;

// ==========================
// 🧱 HELPERS UI
// ==========================
function getElemento(id) {
  return document.getElementById(id);
}

function setErro(msg = "") {
  const erroEl = getElemento("erro");
  if (erroEl) erroEl.textContent = msg;
}

function resetBotao(btn) {
  if (!btn) return;

  btn.disabled = false;
  btn.textContent = "Entrar";
  loginEmAndamento = false;
}

function bloquearBotao(btn, texto = "🔄 Acessando...") {
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = texto;
  loginEmAndamento = true;
}

// ==========================
// 🗂️ HELPERS STORAGE
// ==========================
function limparStorageLogin() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("indicador");
  localStorage.removeItem("classeSelecionada");
}

function normalizarListaRegionais(valor) {
  if (!valor) return [];

  // já veio como array/jsonb
  if (Array.isArray(valor)) {
    return valor.map((v) => (v || "").toString().trim()).filter(Boolean);
  }

  // veio como string "NE1,NE2"
  if (typeof valor === "string") {
    return valor
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

function salvarUsuarioLocal(perfil) {
  const usuario = {
    id: perfil.id,
    auth_user_id: perfil.auth_user_id,
    nome: perfil.nome || "",
    sobrenome: perfil.sobrenome || "",
    email: perfil.email || "",
    matricula: perfil.matricula || "",
    perfil: (perfil.perfil || "").toString().trim().toLowerCase(),
    funcao: perfil.funcao || "",
    permissoes: perfil.permissoes || {},

    tipo_visao:
      (perfil.tipo_visao || "").toString().trim().toLowerCase() || null,
    loja_codigo: perfil.loja_codigo || null,
    loja_vinculada: perfil.loja_vinculada || null,
    regional_vinculada: perfil.regional_vinculada || null,
    subregional_vinculada: perfil.subregional_vinculada || null,

    // ✅ preparado para múltiplas regionais
    regionais_vinculadas: normalizarListaRegionais(perfil.regionais_vinculadas),
  };

  localStorage.setItem("usuario", JSON.stringify(usuario));

  console.log("✅ Perfil salvo localmente:", usuario);
  return usuario;
}

// ==========================
// 🔎 BUSCAR PERFIL POR AUTH ID
// ==========================
async function buscarPerfilPorAuthId(authUserId) {
  console.log("🔎 Buscando perfil por auth_user_id:", authUserId);

  const { data: perfil, error } = await supabaseLogin
    .from("usuarios")
    .select("*")
    .eq("auth_user_id", authUserId)
    .single();

  if (error || !perfil) {
    console.warn("⚠️ Perfil não encontrado por auth_user_id:", error);
    return null;
  }

  return perfil;
}

// ==========================
// 🔎 BUSCAR PERFIL POR EMAIL
// fallback para usuários criados manualmente
// ==========================
async function buscarPerfilPorEmail(email) {
  console.log("🔎 Buscando perfil por e-mail:", email);

  const { data: perfil, error } = await supabaseLogin
    .from("usuarios")
    .select("*")
    .ilike("email", email)
    .single();

  if (error || !perfil) {
    console.warn("⚠️ Perfil não encontrado por e-mail:", error);
    return null;
  }

  return perfil;
}

// ==========================
// 🔗 VINCULAR AUTH_USER_ID AUTOMATICAMENTE
// se o usuário existir na tabela mas ainda sem vínculo
// ==========================
async function vincularAuthUserIdAoPerfil(perfil, authUser) {
  try {
    if (!perfil || !authUser?.id) {
      console.warn("⚠️ Dados insuficientes para vincular auth_user_id");
      return null;
    }

    if (perfil.auth_user_id) {
      console.log("ℹ️ Perfil já possui auth_user_id:", perfil.auth_user_id);
      return perfil;
    }

    console.log(
      "🔗 Vinculando auth_user_id ao perfil encontrado por e-mail...",
      {
        usuario: perfil.nome,
        email: perfil.email,
        novoAuthId: authUser.id,
      },
    );

    const { data, error } = await supabaseLogin
      .from("usuarios")
      .update({
        auth_user_id: authUser.id,
      })
      .eq("id", perfil.id)
      .select("*")
      .single();

    if (error || !data) {
      console.error("❌ Erro ao vincular auth_user_id:", error);
      return null;
    }

    console.log("✅ auth_user_id vinculado com sucesso:", {
      usuario: data.nome,
      auth_user_id: data.auth_user_id,
    });

    return data;
  } catch (erro) {
    console.error("❌ Falha inesperada ao vincular auth_user_id:", erro);
    return null;
  }
}

// ==========================
// 🧠 RESOLVER PERFIL DO USUÁRIO AUTENTICADO
// tenta:
// 1. auth_user_id
// 2. e-mail + vínculo automático
// ==========================
async function resolverPerfilUsuarioAutenticado(authUser) {
  if (!authUser) return null;

  // 1) tenta por auth_user_id
  let perfil = await buscarPerfilPorAuthId(authUser.id);
  if (perfil) return perfil;

  // 2) tenta por e-mail
  const emailAuth = (authUser.email || "").trim().toLowerCase();
  if (!emailAuth) {
    console.warn("⚠️ Usuário auth sem e-mail, não foi possível fazer fallback");
    return null;
  }

  const perfilPorEmail = await buscarPerfilPorEmail(emailAuth);
  if (!perfilPorEmail) return null;

  // se encontrou por e-mail e ainda não tem vínculo, amarra agora
  if (!perfilPorEmail.auth_user_id) {
    const perfilVinculado = await vincularAuthUserIdAoPerfil(
      perfilPorEmail,
      authUser,
    );
    if (perfilVinculado) return perfilVinculado;
  }

  // se encontrou por e-mail mas já está vinculado a outro auth_user_id, bloqueia
  if (
    perfilPorEmail.auth_user_id &&
    String(perfilPorEmail.auth_user_id) !== String(authUser.id)
  ) {
    console.error(
      "❌ Perfil encontrado por e-mail já está vinculado a outro auth_user_id",
      {
        email: perfilPorEmail.email,
        auth_user_id_tabela: perfilPorEmail.auth_user_id,
        auth_user_id_auth: authUser.id,
      },
    );
    return null;
  }

  return perfilPorEmail;
}

// ==========================
// 📧 VALIDAÇÃO BÁSICA DE EMAIL
// ==========================
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==========================
// 🚀 INIT LOGIN
// ==========================
window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Tela de login pronta");

  try {
    const {
      data: { session },
      error,
    } = await supabaseLogin.auth.getSession();

    if (error) {
      console.error("❌ Erro ao obter sessão:", error);
      return;
    }

    if (session?.user) {
      console.log("✅ Sessão já existe, resolvendo perfil automaticamente...");

      const perfil = await resolverPerfilUsuarioAutenticado(session.user);

      if (perfil) {
        limparStorageLogin();
        salvarUsuarioLocal(perfil);
        window.location.replace("index.html");
        return;
      }

      console.warn(
        "⚠️ Sessão existe, mas não foi possível resolver o perfil do app",
      );
      await supabaseLogin.auth.signOut();
      limparStorageLogin();
    }
  } catch (erro) {
    console.error("❌ Erro ao iniciar login:", erro);
  }
});

// ==========================
// 🔐 LOGIN AUTH
// ==========================
async function fazerLogin() {
  if (loginEmAndamento) {
    console.warn("⚠️ Login já em andamento");
    return;
  }

  console.log("🔥 Iniciando tentativa de login");

  const emailInput = getElemento("email");
  const senhaInput = getElemento("senha");
  const btn = getElemento("btnLogin");

  if (!emailInput || !senhaInput || !btn) {
    console.error("❌ Elementos do login não encontrados");
    return;
  }

  const email = emailInput.value.trim().toLowerCase();
  const senha = senhaInput.value.trim();

  setErro("");

  if (!email || !senha) {
    setErro("⚠️ Preencha e-mail e senha");
    return;
  }

  if (!emailValido(email)) {
    setErro("⚠️ Digite um e-mail válido");
    return;
  }

  try {
    bloquearBotao(btn, "🔄 Acessando...");
    limparStorageLogin();

    // 1) Login no Auth
    const { data, error } = await supabaseLogin.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error || !data?.user) {
      console.error("❌ Erro login auth:", error);

      const mensagem = (error?.message || "").toLowerCase();

      if (mensagem.includes("invalid login credentials")) {
        setErro("❌ Usuário ou senha inválidos");
      } else if (mensagem.includes("email not confirmed")) {
        setErro("⚠️ E-mail ainda não confirmado");
      } else {
        setErro("❌ Não foi possível entrar no sistema");
      }

      resetBotao(btn);
      return;
    }

    console.log("✅ Auth login realizado:", {
      auth_user_id: data.user.id,
      email: data.user.email,
    });

    // 2) Resolver perfil do app

    let perfil = await resolverPerfilUsuarioAutenticado(data.user);

    if (!perfil) {
      console.warn(
        "⚠️ Usuário autenticado, mas sem cadastro em usuarios. Entrando com fallback local.",
      );
      perfil = montarPerfilFallbackAuth(data.user);

      setErro(
        "❌ Perfil do usuário não encontrado no sistema. Verifique se o cadastro foi criado corretamente.",
      );

      await supabaseLogin.auth.signOut();
      limparStorageLogin();
      resetBotao(btn);
      return;
    }

    // 3) Salvar localmente
    salvarUsuarioLocal(perfil);

    // 4) Log opcional
    if (typeof registrarEventoSistema === "function") {
      try {
        await registrarEventoSistema({
          tipo_evento: "seguranca",
          modulo: "Autenticação",
          acao: "login realizado",
          usuario_alvo: perfil.nome || perfil.email,
          perfil_alvo: (perfil.perfil || "").toString().trim().toLowerCase(),
          autenticacao: "sessao_propria",
          status: "sucesso",
          contexto: {
            email: perfil.email || email,
            matricula: perfil.matricula || null,
          },
        });
      } catch (erroLog) {
        console.warn("⚠️ Não foi possível registrar log de login:", erroLog);
      }
    }

    // 5) Redirecionar
    btn.textContent = "✅ Entrando...";

    setTimeout(() => {
      window.location.replace("index.html");
    }, 400);
  } catch (err) {
    console.error("❌ Erro inesperado no login:", err);
    setErro("Erro ao conectar com o servidor");
    resetBotao(btn);
  }
}

// ==========================
// ⌨️ ENTER PARA LOGIN
// ==========================
document.addEventListener("keyup", function (e) {
  if (e.key === "Enter" && !loginEmAndamento) {
    const emailEl = getElemento("email");
    const senhaEl = getElemento("senha");

    if (
      document.activeElement === emailEl ||
      document.activeElement === senhaEl
    ) {
      fazerLogin();
    }
  }
});
// ==========================
// 🆘 PERFIL FALLBACK PELO AUTH
// usado quando o usuário existe no Auth
// mas não existe na tabela usuarios
// ==========================
function montarPerfilFallbackAuth(authUser) {
  const email = (authUser?.email || "").toString().trim().toLowerCase();

  const nomeBase = email.split("@")[0] || "usuario";

  const perfilFallback = {
    id: null,
    auth_user_id: authUser?.id || null,
    nome: nomeBase,
    sobrenome: "",
    email,
    matricula: "",
    perfil: "usuario",
    funcao: "Usuário",
    permissoes: {
      indicadores: [],
      classes: [],
      acesso_total: false,
    },

    tipo_visao: "regional",
    loja_codigo: null,
    loja_vinculada: null,
    regional_vinculada: null,
    subregional_vinculada: null,
    regionais_vinculadas: [],
  };

  console.warn(
    "⚠️ Perfil não encontrado em usuarios. Usando fallback local:",
    perfilFallback,
  );

  return perfilFallback;
}
