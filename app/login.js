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
// 👤 SALVAR PERFIL LOCAL
// ==========================
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
    permissoes: perfil.permissoes || {}
  };

  localStorage.setItem("usuario", JSON.stringify(usuario));

  console.log("✅ Perfil carregado:", usuario);
  return usuario;
}

// ==========================
// 🔎 BUSCAR PERFIL APP
// ==========================
async function buscarPerfilPorAuthId(authUserId) {
  const { data: perfil, error } = await supabaseLogin
    .from("usuarios")
    .select("*")
    .eq("auth_user_id", authUserId)
    .single();

  if (error || !perfil) {
    console.error("❌ Perfil app não encontrado:", error);
    return null;
  }

  return perfil;
}

// ==========================
// 🚀 INIT LOGIN
// ==========================
window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Tela de login pronta");

  try {
    const {
      data: { session },
      error
    } = await supabaseLogin.auth.getSession();

    if (error) {
      console.error("❌ Erro ao obter sessão:", error);
      return;
    }

    if (session?.user) {
      console.log("✅ Sessão já existe, validando perfil local...");

      const perfil = await buscarPerfilPorAuthId(session.user.id);

      if (perfil) {
        salvarUsuarioLocal(perfil);
        window.location.replace("index.html");
        return;
      }

      // sessão existe, mas não achou perfil => encerra sessão para evitar loop
      await supabaseLogin.auth.signOut();
      localStorage.removeItem("usuario");
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

  console.log("🔥 Clique no botão detectado");

  const emailInput = getElemento("email");
  const senhaInput = getElemento("senha");
  const btn = getElemento("btnLogin");

  if (!emailInput || !senhaInput || !btn) {
    console.error("❌ Elementos do login não encontrados");
    return;
  }

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  setErro("");

  if (!email || !senha) {
    setErro("⚠️ Preencha e-mail e senha");
    return;
  }

  try {
    bloquearBotao(btn, "🔄 Acessando...");

    // 1) Login real no Auth
    const { data, error } = await supabaseLogin.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error || !data?.user) {
      console.error("❌ Erro login auth:", error);
      setErro("❌ Usuário ou senha inválidos");
      resetBotao(btn);
      return;
    }

    console.log("✅ Auth login realizado:", data.user.id);

    // 2) Buscar perfil do app
    const perfil = await buscarPerfilPorAuthId(data.user.id);

    if (!perfil) {
      setErro("❌ Perfil do usuário não encontrado");
      await supabaseLogin.auth.signOut();
      localStorage.removeItem("usuario");
      resetBotao(btn);
      return;
    }

    // 3) Salvar local
    salvarUsuarioLocal(perfil);

    // 4) Redirecionar
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
    fazerLogin();
  }
});