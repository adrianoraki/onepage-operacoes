// ==========================
// 🔐 CONFIG SUPABASE (ISOLADO LOGIN)
// ==========================
const SUPABASE_URL = "https://fnsplftfxvmyiqbigobh.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc3BsZnRmeHZteWlxYmlnb2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTYyNTcsImV4cCI6MjA5NTQzMjI1N30.tLhsb0sI1uNgPAc7Yhvxk85cWitrp-ahOoBEpJCqzPY"

const { createClient } = window.supabase
const supabaseLogin = createClient(SUPABASE_URL, SUPABASE_KEY)


// ==========================
// 🔐 LOGIN
// ==========================
async function fazerLogin() {

  console.log("🔥 Clique no botão detectado")

  const loginInput = document.getElementById("email")
  const senhaInput = document.getElementById("senha")
  const erroEl = document.getElementById("erro")
  const btn = document.getElementById("btnLogin")

  const login = loginInput.value.trim()
  const senha = senhaInput.value.trim()

  erroEl.textContent = ""

  if (!login || !senha) {
    erroEl.textContent = "⚠️ Preencha todos os campos"
    return
  }

  try {

    btn.disabled = true
    btn.textContent = "🔄 Acessando..."

    const { data, error } = await supabaseLogin
      .from("usuarios")
      .select("*")
      .or(`email.ilike.${login},matricula.eq.${login}`)
      .eq("senha", senha)
      .maybeSingle()

    console.log("🔍 Resultado:", data, error)

    if (error || !data) {
      erroEl.textContent = "❌ Usuário ou senha inválidos"
      resetBotao(btn)
      return
    }

    btn.textContent = "✅ Entrando..."

    // ✅ SALVA SESSÃO COMPLETA
    const usuario = {
      id: data.id,
      nome: data.nome,
      sobrenome: data.sobrenome || "",
      email: data.email || "",
      matricula: data.matricula || "",
      perfil: (data.perfil || data.tipo || "").toString().trim().toLowerCase(),
      funcao: data.funcao || "",
      permissoes: data.permissoes || {}
    }

    localStorage.setItem("usuario", JSON.stringify(usuario))

    console.log("✅ Login realizado:", usuario)

    setTimeout(() => {
      window.location.href = "index.html"
    }, 800)

  } catch (err) {

    console.error("❌ Erro inesperado:", err)
    erroEl.textContent = "Erro ao conectar com o servidor"
    resetBotao(btn)
  }
}


// ==========================
// 🔁 RESET BOTÃO
// ==========================
function resetBotao(btn) {
  if (!btn) return

  btn.disabled = false
  btn.textContent = "Entrar"
}


// ==========================
// ⌨️ ENTER PARA LOGIN
// ==========================
document.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    fazerLogin()
  }
})


// ==========================
// 🚀 INIT
// ==========================
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Tela de login pronta")
})