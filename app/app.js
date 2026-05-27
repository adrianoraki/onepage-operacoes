const usuario = localStorage.getItem("usuario")

if (!usuario) {
  window.location.replace("login.html") // 🔥 melhor que href
}

// ==========================
// 🔐 LOGOUT PROFISSIONAL
// ==========================
function logout() {

  try {

    console.log("🔒 Logout iniciado")

    // ✅ limpa sessão
    localStorage.removeItem("usuario")

    // ✅ evita voltar com botão do navegador
    window.location.replace("login.html")

  } catch (erro) {
    console.error("❌ Erro no logout:", erro)
  }
}


// ==========================
// 🔐 CONFIG SUPABASE (ROBUSTO)
// ==========================
const SUPABASE_URL = "https://fnsplftfxvmyiqbigobh.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc3BsZnRmeHZteWlxYmlnb2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTYyNTcsImV4cCI6MjA5NTQzMjI1N30.tLhsb0sI1uNgPAc7Yhvxk85cWitrp-ahOoBEpJCqzPY"

let supabaseClient = null

function initSupabase() {
  try {

    if (!window.supabase) {
      console.error("❌ Biblioteca do Supabase não carregada")
      return false
    }

    const { createClient } = window.supabase

    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)
    window.supabase = supabaseClient

    console.log("✅ Supabase inicializado com sucesso")

    return true

  } catch (erro) {
    console.error("❌ Erro ao iniciar Supabase:", erro)
    return false
  }
}


// ==========================
// 📦 CARREGAR SIDEBAR
// ==========================
async function carregarSidebar() {
  try {

    const el = document.getElementById("sidebar")

    if (!el) {
      console.error("❌ Elemento #sidebar não existe no HTML")
      return
    }

    const res = await fetch("components/sidebar.html")

    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`)

    const html = await res.text()

    el.innerHTML = html

    console.log("✅ Sidebar carregado com sucesso")

    // ==========================
// 👤 USUÁRIO LOGADO
// ==========================

const usuario = JSON.parse(localStorage.getItem("usuario"))

if (usuario) {

  const nomeCompleto = `${usuario.nome} ${usuario.sobrenome}`

  const nomeEl = document.getElementById("nomeUsuario")
  const emailEl = document.getElementById("emailUsuario")
  const matriculaEl = document.getElementById("matriculaUsuario")
  const avatarEl = document.getElementById("avatar")

  if (nomeEl) nomeEl.textContent = nomeCompleto
  if (emailEl) emailEl.textContent = usuario.email
  if (matriculaEl) matriculaEl.textContent = usuario.matricula

  if (avatarEl) {
    const iniciais = (
      (usuario.nome?.charAt(0) || "") +
      (usuario.sobrenome?.charAt(0) || "")
    ).toUpperCase()

    avatarEl.textContent = iniciais
  }
}

// ==========================
// 🔥 BOTÃO LOGOUT (SEMPRE)
// ==========================
const btnLogout = document.querySelector(".btn-logout")

if (btnLogout) {
  btnLogout.addEventListener("click", logout)
}


  } catch (erro) {
    console.error("❌ Erro ao carregar sidebar:", erro)
    mostrarErro("Erro ao carregar menu")
  }
}


// ==========================
// 🧭 NAVEGAÇÃO PRINCIPAL
// ==========================
function mostrar(tela) {

  console.log("➡️ Navegando para:", tela)

  limparConteudo()
  setActiveMenu(tela)

  try {

    switch (tela) {

      case "dashboard":
        console.log("📊 Dashboard")
        telaEmConstrucao("Dashboard")
        break

      case "preencher":
        console.log("📥 Tela preenchimento acionada (sem render direto)")
        return;

      case "indicadores":
        telaEmConstrucao("Indicadores")
        break

      case "comparativos":
        telaEmConstrucao("Comparativos")
        break

      case "configuracoes":
        telaEmConstrucao("Configurações")
        break

      default:
        telaInicial()
    }

  } catch (erro) {
    console.error("❌ Erro na navegação:", erro)
    mostrarErro("Erro ao abrir tela")
  }
}


// ==========================
// 📂 MENU PREENCIMENTO
// ==========================
let menuPreenchimentoAberto = false

function togglePreenchimento() {

  const submenu = document.getElementById("submenu-preenchimento")

  if (!submenu) return

  const aberto = submenu.style.display === "block"

  submenu.style.display = aberto ? "none" : "block"

  console.log(`📂 ${aberto ? "Fechado ❌" : "Aberto ✅"}`)
}


// ==========================
// ✅ SELECIONAR INDICADOR
// ==========================
function selecionarIndicador(indicador) {

  console.log("✅ Indicador selecionado:", indicador)

  localStorage.setItem("indicador", indicador)

  if (typeof carregarTabela === "function") {
    carregarTabela()
  } else {
    console.error("❌ função carregarTabela não encontrada")
  }

  const submenu = document.getElementById("submenu-preenchimento")
  if (submenu) submenu.style.display = "none"

  menuPreenchimentoAberto = false
}


// ==========================
// 🧱 UTILITÁRIOS UI
// ==========================
function limparConteudo() {
  const el = document.getElementById("conteudo")
  if (el) el.innerHTML = ""
}

function telaInicial() {
  document.getElementById("conteudo").innerHTML = `
    <h2>👋 Bem-vindo</h2>
    <p>Selecione uma opção no menu.</p>
  `
}

function telaEmConstrucao(nome) {
  document.getElementById("conteudo").innerHTML = `
    <h2>🚧 ${nome}</h2>
    <p>Em desenvolvimento</p>
  `
}

function mostrarErro(msg) {
  document.getElementById("conteudo").innerHTML = `
    <h2 style="color:red;">❌ Erro</h2>
    <p>${msg}</p>
  `
}


// ==========================
// 🎯 MENU ATIVO
// ==========================
function setActiveMenu(tela) {

  const itens = document.querySelectorAll(".sidebar_menu .menu ul li")

  itens.forEach(li => {

    li.classList.remove("ativo")

    const onclick = li.getAttribute("onclick")

    if (onclick && onclick.includes(tela)) {
      li.classList.add("ativo")
    }
  })
}


// ==========================
// 🔄 TESTAR CONEXÃO
// ==========================
async function testarConexao() {

  try {

    if (!supabaseClient) {
      console.warn("⚠️ Supabase não inicializado")
      return false
    }

    const { error } = await supabaseClient
      .from("lojas")
      .select("*")
      .limit(1)

    if (error) {
      console.error("❌ Erro Supabase:", error)
      return false
    }

    console.log("✅ Conexão com banco OK")
    return true

  } catch (erro) {
    console.error("❌ Falha crítica:", erro)
    return false
  }
}


// ==========================
// 🚀 INICIALIZAÇÃO
// ==========================
document.addEventListener("DOMContentLoaded", async () => {

  console.log("🚀 Sistema iniciado")

  await carregarSidebar()

  localStorage.removeItem("indicador")

  const submenu = document.getElementById("submenu-preenchimento")
  if (submenu) submenu.style.display = "none"

  const okSupabase = initSupabase()

  if (!okSupabase) {
    console.warn("⚠️ Sistema sem banco")
    mostrar("dashboard")
    return
  }

  const conectado = await testarConexao()

  if (conectado) {
    console.log("✅ Sistema pronto")
    mostrar("dashboard")
  } else {
    console.warn("⚠️ Banco não respondeu")
    mostrar("dashboard")
  }

})