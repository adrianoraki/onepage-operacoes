// ==========================
// 🔐 CONFIG SUPABASE
// ==========================
const SUPABASE_URL = "https://dnlrnveqhdudkzlcazbw.supabase.co"

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
window.supabase = supabaseClient


// ==========================
// 📦 CARREGAR SIDEBAR
// ==========================
async function carregarSidebar() {
  try {
    const res = await fetch("components/sidebar.html")
    const html = await res.text()

    document.getElementById("sidebar").innerHTML = html

  } catch (erro) {
    console.error("Erro ao carregar sidebar:", erro)
    mostrarErro("Erro ao carregar menu")
  }
}


// ==========================
// 🧭 NAVEGAÇÃO
// ==========================
function mostrar(tela) {

  console.log("➡️ Navegando:", tela)

  limparConteudo()
  setActiveMenu(tela)

  try {

    switch (tela) {

      case "dashboard":
        carregarDashboard?.() || telaEmConstrucao("Dashboard")
        break

      case "preencher":

        const indicador = localStorage.getItem("indicador")

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
    console.error("Erro ao navegar:", erro)
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

  menuPreenchimentoAberto = !menuPreenchimentoAberto

  submenu.style.display = menuPreenchimentoAberto ? "block" : "none"

  if (menuPreenchimentoAberto) {
    mostrar("preencher")
  }
}


// ==========================
// ✅ ESCOLHER INDICADOR
// ==========================
function selecionarIndicador(indicador) {

  localStorage.setItem("indicador", indicador)

  mostrar("preencher")

  // fecha submenu
  const submenu = document.getElementById("submenu-preenchimento")
  if (submenu) submenu.style.display = "none"

  menuPreenchimentoAberto = false
}


// ==========================
// 🧱 UTIL
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
// 🔄 CONEXÃO
// ==========================
async function testarConexao() {
  try {

    const { error } = await supabaseClient
      .from("lojas")
      .select("*")
      .limit(1)

    if (error) return false

    return true

  } catch {
    return false
  }
}


// ==========================
// 🚀 INIT
// ==========================
document.addEventListener("DOMContentLoaded", async () => {

  console.log("🚀 Sistema iniciado")

  await carregarSidebar()

  const ok = await testarConexao()

  if (ok) {
    mostrar("dashboard")
  } else {
    mostrarErro("Erro ao conectar ao banco")
  }

})