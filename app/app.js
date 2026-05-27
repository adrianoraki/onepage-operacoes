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

        const indicador = localStorage.getItem("indicador")

        console.log("📥 Indicador selecionado:", indicador)

        if (indicador && typeof carregarTabela === "function") {
          carregarTabela()
        } else {
          document.getElementById("conteudo").innerHTML = `
            <h2>📥 Preenchimento</h2>
            <p>Selecione um indicador no menu lateral.</p>
          `
        }

        break

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

  if (!submenu) {
    console.warn("⚠️ Submenu não encontrado no DOM")
    return
  }

  menuPreenchimentoAberto = !menuPreenchimentoAberto

  submenu.style.display = menuPreenchimentoAberto ? "block" : "none"

  console.log(
    `📂 Submenu ${menuPreenchimentoAberto ? "ABERTO ✅" : "FECHADO ❌"}`
  )

  if (menuPreenchimentoAberto) {
    mostrar("preencher")
  }
}


// ==========================
// ✅ SELECIONAR INDICADOR
// ==========================
function selecionarIndicador(indicador) {

  console.log("✅ Indicador selecionado:", indicador)

  localStorage.setItem("indicador", indicador)

  mostrar("preencher")

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

  const botoes = document.querySelectorAll(".sidebar button")

  botoes.forEach(btn => {
    btn.classList.remove("ativo")

    if (btn.getAttribute("onclick")?.includes(tela)) {
      btn.classList.add("ativo")
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

    const { data, error } = await supabaseClient
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

  // ✅ 1. CARREGA SIDEBAR ANTES DE TUDO
  await carregarSidebar()

  // ✅ 2. INICIA SUPABASE
  const okSupabase = initSupabase()

  if (!okSupabase) {
    console.warn("⚠️ Sistema sem banco (modo parcial)")
    mostrar("dashboard")
    return
  }

  // ✅ 3. TESTA CONEXÃO
  const conectado = await testarConexao()

  if (conectado) {
    console.log("✅ Sistema pronto")
    mostrar("dashboard")
  } else {
    console.warn("⚠️ Banco não respondeu, mas sistema carregado")
    mostrar("dashboard")
  }

})