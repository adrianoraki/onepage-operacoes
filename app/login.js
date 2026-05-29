// ==========================
// 🔐 CONFIG SUPABASE LOGIN
// ==========================
const SUPABASE_URL = "https://fnsplftfxvmyiqbigobh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc3BsZnRmeHZteWlxYmlnb2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTYyNTcsImV4cCI6MjA5NTQzMjI1N30.tLhsb0sI1uNgPAc7Yhvxk85cWitrp-ahOoBEpJCqzPY";

const { createClient } = window.supabase;
const supabaseLogin = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================
// 🚀 INIT LOGIN
// ==========================
window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Tela de login pronta");

  // Se já estiver autenticado, vai pro sistema
  const { data: { session } } = await supabaseLogin.auth.getSession();

  if (session?.user) {
    console.log("✅ Sessão já existe, redirecionando...");
    window.location.href = "index.html";
  }
});

// ==========================
// 🔐 LOGIN AUTH
// ==========================
async function fazerLogin() {
  console.log("🔥 Clique no botão detectado");

  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const erroEl = document.getElementById("erro");
  const btn = document.getElementById("btnLogin");

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  erroEl.textContent = "";

  if (!email || !senha) {
    erroEl.textContent = "⚠️ Preencha e-mail e senha";
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = "🔄 Acessando...";

    // 1) Login real no Auth
    const { data, error } = await supabaseLogin.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error || !data?.user) {
      console.error("❌ Erro login auth:", error);
      erroEl.textContent = "❌ Usuário ou senha inválidos";
      resetBotao(btn);
      return;
    }

    console.log("✅ Auth login realizado:", data.user.id);

    // 2) Buscar perfil do app na tabela usuarios
    const { data: perfil, error: errorPerfil } = await supabaseLogin
      .from("usuarios")
      .select("*")
      .eq("auth_user_id", data.user.id)
      .single();

    if (errorPerfil || !perfil) {
      console.error("❌ Perfil app não encontrado:", errorPerfil);
      erroEl.textContent = "❌ Perfil do usuário não encontrado";
      await supabaseLogin.auth.signOut();
      resetBotao(btn);
      return;
    }

    // 3) Salva só os dados do app no localStorage
    const usuario = {
      id: perfil.id,
      auth_user_id: perfil.auth_user_id,
      nome: perfil.nome,
      sobrenome: perfil.sobrenome || "",
      email: perfil.email || "",
      matricula: perfil.matricula || "",
      perfil: (perfil.perfil || "").toString().trim().toLowerCase(),
      funcao: perfil.funcao || "",
      permissoes: perfil.permissoes || {}
    };

    localStorage.setItem("usuario", JSON.stringify(usuario));

    console.log("✅ Perfil carregado:", usuario);

    btn.textContent = "✅ Entrando...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);

  } catch (err) {
    console.error("❌ Erro inesperado no login:", err);
    erroEl.textContent = "Erro ao conectar com o servidor";
    resetBotao(btn);
  }
}

// ==========================
// 🔁 RESET BOTÃO
// ==========================
function resetBotao(btn) {
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = "Entrar";
}

// ==========================
// ⌨️ ENTER PARA LOGIN
// ==========================
document.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    fazerLogin();
  }
});