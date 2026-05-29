// ==========================
// 🔐 PROTEÇÃO LOGIN
// ==========================
const usuario = localStorage.getItem("usuario");

if (!usuario) {
  window.location.replace("login.html");
}

// ==========================
// 🔐 LOGOUT
// ==========================
function logout() {
  try {
    console.log("🔒 Logout iniciado");
    localStorage.removeItem("usuario");
    window.location.replace("login.html");
  } catch (erro) {
    console.error("❌ Erro no logout:", erro);
  }
}

// ==========================
// 🔐 CONFIG SUPABASE
// ==========================
const SUPABASE_URL = "https://fnsplftfxvmyiqbigobh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc3BsZnRmeHZteWlxYmlnb2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTYyNTcsImV4cCI6MjA5NTQzMjI1N30.tLhsb0sI1uNgPAc7Yhvxk85cWitrp-ahOoBEpJCqzPY";

let supabaseClient = null;

function initSupabase() {
  try {
    if (!window.supabase) {
      console.error("❌ Biblioteca do Supabase não carregada");
      return false;
    }

    const { createClient } = window.supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    window.supabase = supabaseClient;

    console.log("✅ Supabase inicializado");
    return true;
  } catch (erro) {
    console.error("❌ Erro ao iniciar Supabase:", erro);
    return false;
  }
}

// ==========================
// 📊 CLASSES DE INDICADORES (NOVO 🔥)
// ==========================
const classesIndicadores = {
  Auditoria: ["RUPTURA FINAL", "ETIQUETA"],

  "Frente de Caixa": ["SELF-CHECKOUT", "DESCONTO", "CANCELAMENTO", "DEVOLUÇÃO"],

  // ✅ NOVO NOME
  Operações: [
    { nome: "Visita Prospecção", valor: "PSV" },
    { nome: "NPS", valor: "NPS" },
    { nome: "PART.TELEVENDAS", valor: "PART.TELEVENDAS" },
  ],

  // ✅ NOVO NOME
  Prevenção: [
    "QUEBRA",
    "QUEBRA FLV",
    "QUEBRA AÇOUGUE",

    // ✅ PSV TAMBÉM AQUI
    "PSV",
    "TROCA",
  ],

  "RH / Operacional": ["BANCOS DE HORAS", "TURNOVER"],
};

// ==========================
// 📦 CARREGAR SIDEBAR
// ==========================
async function carregarSidebar() {
  try {
    const el = document.getElementById("sidebar");

    if (!el) {
      console.warn("⚠️ Sidebar não encontrado");
      return;
    }

    // ✅ BLOQUEIO DE DUPLICAÇÃO (ESSA LINHA RESOLVE SEU BUG)
    if (el.dataset.loaded === "true") {
      console.warn("⚠️ Sidebar já carregado - NÃO recarregar");
      return;
    }

    console.log("📦 Carregando sidebar...");

    const res = await fetch("components/sidebar.html");
    const html = await res.text();

    el.innerHTML = html;

    // ✅ marca como carregado
    el.dataset.loaded = "true";

    console.log("✅ Sidebar carregado");

    preencherUsuario();
    montarMenuIndicadores();

    const btnLogout = document.querySelector(".btn-logout");
    if (btnLogout) btnLogout.addEventListener("click", logout);
  } catch (erro) {
    console.error("❌ Erro sidebar:", erro);
    mostrarErro("Erro ao carregar menu");
  }
}

// ==========================
// 👤 USUÁRIO
// ==========================
function preencherUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return;

  const nomeEl = document.getElementById("nomeUsuario");
  const emailEl = document.getElementById("emailUsuario");
  const matriculaEl = document.getElementById("matriculaUsuario");
  const avatarEl = document.getElementById("avatar");

  if (nomeEl) nomeEl.textContent = `${usuario.nome} ${usuario.sobrenome}`;
  if (emailEl) emailEl.textContent = usuario.email;
  if (matriculaEl) matriculaEl.textContent = usuario.matricula;

  if (avatarEl) {
    const iniciais = (
      (usuario.nome?.[0] || "") + (usuario.sobrenome?.[0] || "")
    ).toUpperCase();

    avatarEl.textContent = iniciais;
  }
}

// ==========================
// 🧭 MENU POR CLASSE (NOVO 🔥)
// ==========================
function montarMenuIndicadores() {
  const menu = document.querySelector("#menu-list");
  if (!menu) return;

  let index = 0;

  for (const classe in classesIndicadores) {
    const id = "classe_" + index;

    const icon = iconesClasse[classe] || "fa-folder";
    const cor = coresClasse[classe] || "#ccc";

    // 🔷 CLASSE
    const liClasse = document.createElement("li");

    liClasse.innerHTML = `
      <i class="fas ${icon}" style="color:${cor}"></i>
      <span>${classe}</span>
    `;

    liClasse.onclick = () => {
      console.log("📂 Classe:", classe);
      toggleClasse(id);
    };

    menu.appendChild(liClasse);

    // 🔽 SUBMENU
    const submenu = document.createElement("ul");
    submenu.classList.add("submenu");
    submenu.id = id;

    classesIndicadores[classe].forEach((item) => {
      const li = document.createElement("li");

      // ✅ trata nome/valor
      const nome = item.nome || item;
      const valor = item.valor || item;

      li.textContent = nome;

      li.onclick = () => {
        console.log("📊 Indicador:", valor);
        localStorage.setItem("classeSelecionada", classe); // ✅ importante
        selecionarIndicador(valor);
      };

      submenu.appendChild(li);
    });

    menu.appendChild(submenu);

    index++;
  }
}

// ==========================
// 🔽 ABRIR/FECHAR CLASSES
// ==========================
function toggleClasse(id) {
  const submenu = document.getElementById(id);

  if (!submenu) return;

  const aberto = submenu.style.display === "block";

  document.querySelectorAll(".submenu").forEach((el) => {
    el.style.display = "none";
  });

  submenu.style.display = aberto ? "none" : "block";
}

// ==========================
// ✅ SELECIONAR INDICADOR
// ==========================
function selecionarIndicador(indicador) {
  console.log("✅ Indicador:", indicador);

  localStorage.setItem("indicador", indicador);

  if (typeof carregarTabela === "function") {
    carregarTabela();
  }

  document.querySelectorAll(".submenu").forEach((el) => {
    el.style.display = "none";
  });
}

// ==========================
// 🧱 UI
// ==========================
function limparConteudo() {
  const el = document.getElementById("conteudo");
  if (el) el.innerHTML = "";
}

function telaInicial() {
  document.getElementById("conteudo").innerHTML = `
    <h2>👋 Bem-vindo</h2>
    <p>Selecione uma opção no menu.</p>
  `;
}

function telaEmConstrucao(nome) {
  document.getElementById("conteudo").innerHTML = `
    <h2>🚧 ${nome}</h2>
    <p>Em desenvolvimento</p>
  `;
}

function mostrarErro(msg) {
  document.getElementById("conteudo").innerHTML = `
    <h2 style="color:red;">❌ Erro</h2>
    <p>${msg}</p>
  `;
}

// ==========================
// 🔄 CONEXÃO
// ==========================
async function testarConexao() {
  try {
    const { error } = await supabaseClient.from("lojas").select("*").limit(1);

    if (error) return false;

    return true;
  } catch {
    return false;
  }
}

// ==========================
// 🚀 INIT
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Sistema iniciado");

  await carregarSidebar();

  localStorage.removeItem("indicador");

  if (!initSupabase()) {
    mostrar("dashboard");
    return;
  }

  await testarConexao();

  mostrar("dashboard");
});

const iconesMenu = {
  dashboard: "fa-gauge-high",
  ranking: "fa-trophy",
  indicadores: "fa-chart-line",
  comparativos: "fa-chart-pie",
  configuracoes: "fa-gear",
};

const coresMenu = {
  dashboard: "#4CAF50",
  ranking: "#FFC107",
  indicadores: "#03A9F4",
  comparativos: "#9C27B0",
  configuracoes: "#9E9E9E",
};

const iconesClasse = {
  Auditoria: "fa-clipboard-check",
  "Frente de Caixa": "fa-cash-register",
  Operações: "fa-cogs", // novo
  Prevenção: "fa-shield-alt", // novo
  "RH / Operacional": "fa-users",
};

const coresClasse = {
  Auditoria: "#00BCD4", // azul claro
  "Frente de Caixa": "#FF9800", // laranja

  Operações: "#4CAF50", // ✅ VERDE
  Prevenção: "#F44336", // ✅ VERMELHO

  "RH / Operacional": "#3F51B5",
};

// ==========================
// 📌 MENU LOG
// ==========================
function logMenu(acao) {
  console.log("📌 Menu clicado:", acao);
}

// ==========================
// 🧭 CONTROLE DE TELAS
// ==========================
function mostrar(tela) {
  try {
    console.log("🧭 Abrindo tela:", tela);

    if (!tela) {
      console.warn("⚠️ Tela não informada");
      return;
    }

    // ✅ normaliza entrada
    const nomeTela = tela.toString().trim().toLowerCase();

    console.log("🎯 Tela normalizada:", nomeTela);

    // ======================
    // ⚙️ CONFIGURAÇÕES
    // ======================
    if (nomeTela === "configuracoes") {
      console.log("⚙️ Iniciando abertura da tela de Configurações");

      const container = document.getElementById("conteudo");

      // ✅ LOADING (APARECE IMEDIATAMENTE)
      container.innerHTML = `
    <div class="card-conteudo" style="text-align:center; padding:40px;">
      <h2>⚙️ Configurações</h2>
      <p>Carregando...</p>
    </div>
  `;

      try {
        // ✅ pequeno delay pra UX (simula carregamento e evita travar tela)
        setTimeout(() => {
          console.log("⏳ Executando render da configuração...");

          if (typeof abrirConfiguracoes === "function") {
            console.log("✅ abrirConfiguracoes encontrada");

            abrirConfiguracoes(); // 🔥 chama regras-perfil.js
          } else {
            console.error("❌ abrirConfiguracoes NÃO encontrada");

            container.innerHTML = `
          <div class="card-conteudo">
            <h2>⚙️ Configurações</h2>
            <p style="color:red;">
              Função abrirConfiguracoes não encontrada
            </p>
          </div>
        `;
          }
        }, 150); // ✅ delay leve pra UX
      } catch (erro) {
        console.error("❌ Erro ao abrir configurações:", erro);

        container.innerHTML = `
      <div class="card-conteudo">
        <h2 style="color:red;">❌ Erro</h2>
        <p>Falha ao carregar configurações</p>
      </div>
    `;
      }

      return;
    }

    // ======================
    // 📊 DASHBOARD (EXEMPLO)
    // ======================
    if (nomeTela === "dashboard") {
      console.log("📊 Abrindo Dashboard");

      if (typeof telaInicial === "function") {
        telaInicial();
      } else {
        console.warn("⚠️ telaInicial não encontrada");
      }

      return;
    }

    // ======================
    // 🏆 RANKING (EXEMPLO)
    // ======================
    if (nomeTela === "ranking") {
      console.log("🏆 Abrindo Ranking");

      if (typeof telaRanking === "function") {
        telaRanking();
      } else {
        document.getElementById("conteudo").innerHTML = `
          <h2>🏆 Ranking</h2>
          <p>Em desenvolvimento</p>
        `;
      }

      return;
    }

    // ======================
    // 📊 INDICADORES (EXEMPLO)
    // ======================
    if (nomeTela === "indicadores") {
      console.log("📊 Indicadores");

      if (typeof carregarTabela === "function") {
        carregarTabela();
      } else {
        console.error("❌ carregarTabela não encontrada");
      }

      return;
    }

    // ======================
    // 📊 COMPARATIVOS (EXEMPLO)
    // ======================
    if (nomeTela === "comparativos") {
      console.log("📊 Comparativos");

      document.getElementById("conteudo").innerHTML = `
        <div class="card-conteudo">
          <h2>📊 Comparativos</h2>
          <p>Em desenvolvimento</p>
        </div>
      `;

      return;
    }

    // ======================
    // 🧱 FALLBACK (SEGURANÇA)
    // ======================
    console.warn("⚠️ Tela não mapeada:", nomeTela);

    document.getElementById("conteudo").innerHTML = `
      <div class="card-conteudo">
        <h2>🚧 ${nomeTela}</h2>
        <p>Em desenvolvimento</p>
      </div>
    `;
  } catch (erro) {
    console.error("❌ Erro ao abrir tela:", erro);

    document.getElementById("conteudo").innerHTML = `
      <div class="card-conteudo">
        <h2 style="color:red;">❌ Erro</h2>
        <p>Falha ao abrir a tela.</p>
      </div>
    `;
  }
}

function abrirConfiguracoesMenu() {
  const user = JSON.parse(localStorage.getItem("usuario"));

  if (!user) {
    console.warn("⚠️ usuário não encontrado");
    return;
  }

  console.log("⚙️ Acesso ao menu de configurações");

  // ✅ todos podem entrar
  mostrar("configuracoes");
}
