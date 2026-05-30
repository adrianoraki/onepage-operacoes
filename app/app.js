// ==========================
// 🔐 CONFIG SUPABASE
// ==========================
const SUPABASE_URL = "https://fnsplftfxvmyiqbigobh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc3BsZnRmeHZteWlxYmlnb2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTYyNTcsImV4cCI6MjA5NTQzMjI1N30.tLhsb0sI1uNgPAc7Yhvxk85cWitrp-ahOoBEpJCqzPY"; // mantenha sua anon key atual aqui

let supabaseClient = null;

// ==========================
// 🗂️ HELPERS STORAGE
// ==========================
const STORAGE_KEYS = {
  usuario: "usuario",
  indicador: "indicador",
  classeSelecionada: "classeSelecionada",
  semana: "semana",
};

function getUsuarioLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.usuario));
  } catch (e) {
    console.error("❌ Erro ao ler usuário local:", e);
    return null;
  }
}

function setUsuarioLocal(usuario) {
  try {
    localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(usuario));
  } catch (e) {
    console.error("❌ Erro ao salvar usuário local:", e);
  }
}

function limparSessaoLocal() {
  localStorage.removeItem(STORAGE_KEYS.usuario);
  localStorage.removeItem(STORAGE_KEYS.indicador);
  localStorage.removeItem(STORAGE_KEYS.classeSelecionada);
}

// ==========================
// 🔠 HELPERS DE NORMALIZAÇÃO
// ==========================
function normalizarTextoApp(valor) {
  return (valor || "").toString().trim();
}

function normalizarTextoAppLower(valor) {
  return normalizarTextoApp(valor).toLowerCase();
}

function normalizarListaRegionais(valor) {
  if (!valor) return [];

  if (Array.isArray(valor)) {
    return valor
      .map((v) => normalizarTextoApp(v))
      .filter(Boolean);
  }

  if (typeof valor === "string") {
    return valor
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

// ==========================
// 👤 MONTAR USUÁRIO LOCAL
// ==========================
function montarUsuarioLocalAPartirDoPerfil(data) {
  return {
    id: data.id,
    auth_user_id: data.auth_user_id || null,
    nome: data.nome || "",
    sobrenome: data.sobrenome || "",
    email: data.email || "",
    matricula: data.matricula || "",
    perfil: (data.perfil || "").toString().trim().toLowerCase(),
    funcao: data.funcao || "",
    permissoes: data.permissoes || {},

    tipo_visao: normalizarTextoAppLower(data.tipo_visao) || null,
    loja_codigo: data.loja_codigo || null,
    loja_vinculada: data.loja_vinculada || null,
    regional_vinculada: data.regional_vinculada || null,
    subregional_vinculada: data.subregional_vinculada || null,

    // ✅ já prepara para cenário de múltiplas regionais
    regionais_vinculadas: normalizarListaRegionais(data.regionais_vinculadas),
  };
}

// ==========================
// 🚀 INIT SUPABASE
// ==========================
function initSupabase() {
  try {
    if (!window.supabase || !window.supabase.createClient) {
      console.error("❌ Biblioteca do Supabase não carregada");
      return false;
    }

    if (supabaseClient) {
      console.log("✅ Supabase já inicializado");
      return true;
    }

    const { createClient } = window.supabase;

    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    // ✅ client global do app
    window.db = supabaseClient;

    console.log("✅ Supabase inicializado");
    return true;
  } catch (erro) {
    console.error("❌ Erro ao iniciar Supabase:", erro);
    return false;
  }
}

// ==========================
// 🔐 PROTEÇÃO LOGIN
// ==========================
async function verificarSessao() {
  try {
    if (!supabaseClient) {
      const ok = initSupabase();
      if (!ok) {
        window.location.replace("login.html");
        return false;
      }
    }

    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error) {
      console.error("❌ Erro ao verificar sessão:", error);
      window.location.replace("login.html");
      return false;
    }

    if (!session?.user) {
      console.warn("⚠️ Sessão não encontrada");
      window.location.replace("login.html");
      return false;
    }

    console.log("✅ Sessão válida:", {
      auth_user_id: session.user.id,
      email: session.user.email,
    });

    return session.user;
  } catch (erro) {
    console.error("❌ Erro ao verificar sessão:", erro);
    window.location.replace("login.html");
    return false;
  }
}

// ==========================
// 🔎 BUSCAR PERFIL POR AUTH ID
// ==========================
async function buscarPerfilPorAuthIdApp(authUserId) {
  try {
    console.log("🔎 [APP] Buscando perfil por auth_user_id:", authUserId);

    const { data, error } = await window.db
      .from("usuarios")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) {
      console.warn("⚠️ [APP] Erro ao buscar perfil por auth_user_id:", error);
      return null;
    }

    if (!data) {
      console.warn("⚠️ [APP] Nenhum perfil encontrado por auth_user_id");
      return null;
    }

    return data;
  } catch (erro) {
    console.error("❌ [APP] Falha inesperada em buscarPerfilPorAuthIdApp:", erro);
    return null;
  }
}

// ==========================
// 🔎 BUSCAR PERFIL POR EMAIL
// fallback para usuários criados manualmente no Auth
// ==========================
async function buscarPerfilPorEmailApp(email) {
  try {
    console.log("🔎 [APP] Buscando perfil por e-mail:", email);

    const { data, error } = await window.db
      .from("usuarios")
      .select("*")
      .ilike("email", email)
      .maybeSingle();

    if (error) {
      console.warn("⚠️ [APP] Erro ao buscar perfil por e-mail:", error);
      return null;
    }

    if (!data) {
      console.warn("⚠️ [APP] Nenhum perfil encontrado por e-mail");
      return null;
    }

    return data;
  } catch (erro) {
    console.error("❌ [APP] Falha inesperada em buscarPerfilPorEmailApp:", erro);
    return null;
  }
}

// ==========================
// 🔗 VINCULAR AUTH_USER_ID AO PERFIL
// ==========================
async function vincularAuthUserIdAoPerfilApp(perfil, authUser) {
  try {
    if (!perfil || !authUser?.id) {
      console.warn("⚠️ [APP] Dados insuficientes para vincular auth_user_id");
      return null;
    }

    if (perfil.auth_user_id) {
      console.log("ℹ️ [APP] Perfil já possui auth_user_id:", perfil.auth_user_id);
      return perfil;
    }

    console.log("🔗 [APP] Vinculando auth_user_id ao perfil encontrado por e-mail...", {
      usuario: perfil.nome,
      email: perfil.email,
      novoAuthId: authUser.id,
    });

    const { data, error } = await window.db
      .from("usuarios")
      .update({
        auth_user_id: authUser.id,
      })
      .eq("id", perfil.id)
      .select("*")
      .single();

    if (error || !data) {
      console.error("❌ [APP] Erro ao vincular auth_user_id:", error);
      return null;
    }

    console.log("✅ [APP] auth_user_id vinculado com sucesso:", {
      usuario: data.nome,
      auth_user_id: data.auth_user_id,
    });

    return data;
  } catch (erro) {
    console.error("❌ [APP] Falha inesperada ao vincular auth_user_id:", erro);
    return null;
  }
}

// ==========================
// 👤 GARANTIR PERFIL LOCAL
// agora com fallback por e-mail + vínculo automático
// ==========================
async function garantirPerfilLocal(authUser) {
  try {
    const usuarioLocal = getUsuarioLocal();

    // ✅ se já existe e bate com a sessão atual, mantém como fallback
    if (
      usuarioLocal &&
      usuarioLocal.auth_user_id &&
      String(usuarioLocal.auth_user_id) === String(authUser.id)
    ) {
      console.log("✅ Perfil local já sincronizado");
      return usuarioLocal;
    }

    console.log("🔄 [APP] Resolvendo perfil do usuário no banco...");

    // 1) tenta por auth_user_id
    let perfil = await buscarPerfilPorAuthIdApp(authUser.id);

    // 2) se não achou, tenta por email
    if (!perfil) {
      const emailAuth = normalizarTextoAppLower(authUser.email);

      if (!emailAuth) {
        console.error("❌ [APP] Usuário auth sem e-mail para fallback");
        limparSessaoLocal();
        window.location.replace("login.html");
        return null;
      }

      const perfilPorEmail = await buscarPerfilPorEmailApp(emailAuth);

      if (!perfilPorEmail) {
        console.error("❌ [APP] Perfil não encontrado por auth_user_id nem por e-mail");
        limparSessaoLocal();
        window.location.replace("login.html");
        return null;
      }

      // se achou por email e auth_user_id está vazio, vincula agora
      if (!perfilPorEmail.auth_user_id) {
        perfil = await vincularAuthUserIdAoPerfilApp(perfilPorEmail, authUser);

        if (!perfil) {
          console.error("❌ [APP] Falha ao vincular auth_user_id automaticamente");
          limparSessaoLocal();
          window.location.replace("login.html");
          return null;
        }
      } else {
        // se já existe auth_user_id diferente, bloqueia
        if (
          String(perfilPorEmail.auth_user_id) !== String(authUser.id)
        ) {
          console.error("❌ [APP] Perfil por e-mail já está vinculado a outro auth_user_id", {
            email: perfilPorEmail.email,
            auth_user_id_tabela: perfilPorEmail.auth_user_id,
            auth_user_id_auth: authUser.id,
          });

          limparSessaoLocal();
          window.location.replace("login.html");
          return null;
        }

        perfil = perfilPorEmail;
      }
    }

    const usuario = montarUsuarioLocalAPartirDoPerfil(perfil);

    setUsuarioLocal(usuario);

    console.log("✅ Perfil local sincronizado:", usuario);
    return usuario;
  } catch (erro) {
    console.error("❌ Erro ao sincronizar perfil local:", erro);
    limparSessaoLocal();
    window.location.replace("login.html");
    return null;
  }
}

// ==========================
// 🔐 LOGOUT
// ==========================
async function logout() {
  try {
    console.log("🔒 Logout iniciado");

    window.dashboardModoApresentacao = false;

    if (typeof pausarTimerInatividade === "function") {
      pausarTimerInatividade();
    }

    limparSessaoLocal();

    if (supabaseClient?.auth) {
      await supabaseClient.auth.signOut();
    }

    window.location.replace("login.html");
  } catch (erro) {
    console.error("❌ Erro no logout:", erro);
  }
}

// ==========================
// 📊 CLASSES DE INDICADORES
// ==========================
const classesIndicadores = {
  Auditoria: ["RUPTURA FINAL", "ETIQUETA"],

  "Frente de Caixa": [
    "SELF-CHECKOUT",
    "DESCONTO",
    "CANCELAMENTO",
    "DEVOLUÇÃO",
  ],

  Operações: [
    { nome: "Visita Prospecção", valor: "PSV" },
    { nome: "NPS", valor: "NPS" },
    { nome: "PART.TELEVENDAS", valor: "PART.TELEVENDAS" },
  ],

  Prevenção: [
    "QUEBRA",
    "QUEBRA FLV",
    "QUEBRA AÇOUGUE",
    "PSV",
    "TROCA",
  ],

  "RH / Operacional": ["BANCOS DE HORAS", "TURNOVER"],
};

// ==========================
// 🎨 ÍCONES / CORES
// ==========================
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
  Operações: "fa-cogs",
  Prevenção: "fa-shield-alt",
  "RH / Operacional": "fa-users",
};

const coresClasse = {
  Auditoria: "#00BCD4",
  "Frente de Caixa": "#FF9800",
  Operações: "#4CAF50",
  Prevenção: "#F44336",
  "RH / Operacional": "#3F51B5",
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

    if (el.dataset.loaded === "true") {
      console.warn("⚠️ Sidebar já carregado - não recarregar");
      preencherUsuario();
      montarMenuIndicadores();
      return;
    }

    console.log("📦 Carregando sidebar...");

    const res = await fetch("components/sidebar.html");
    const html = await res.text();

    el.innerHTML = html;
    el.dataset.loaded = "true";

    console.log("✅ Sidebar carregado");

    preencherUsuario();
    montarMenuIndicadores();

    // ✅ garante logout funcionando sem duplicar bind
    const btnLogout = el.querySelector(".btn-logout");
    if (btnLogout && !btnLogout.dataset.bound) {
      btnLogout.addEventListener("click", logout);
      btnLogout.dataset.bound = "true";
    }
  } catch (erro) {
    console.error("❌ Erro sidebar:", erro);
    mostrarErro("Erro ao carregar menu");
  }
}

// ==========================
// 👤 PREENCHER USUÁRIO
// ==========================
function preencherUsuario() {
  const usuario = getUsuarioLocal();
  if (!usuario) return;

  const nomeEl = document.getElementById("nomeUsuario");
  const emailEl = document.getElementById("emailUsuario");
  const matriculaEl = document.getElementById("matriculaUsuario");
  const avatarEl = document.getElementById("avatar");

  const nomeCompleto = [usuario.nome, usuario.sobrenome]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (nomeEl) nomeEl.textContent = nomeCompleto || usuario.nome || "-";
  if (emailEl) emailEl.textContent = usuario.email || "-";
  if (matriculaEl) matriculaEl.textContent = usuario.matricula || "-";

  if (avatarEl) {
    const iniciais = (
      (usuario.nome?.[0] || "") + (usuario.sobrenome?.[0] || "")
    ).toUpperCase();

    avatarEl.textContent = iniciais || "U";
  }
}

// ==========================
// 🧹 LIMPAR ITENS DINÂMICOS DO MENU
// sem apagar Dashboard / Ranking / Indicadores / Comparativos
// ==========================
function limparItensDinamicosMenu(menu) {
  if (!menu) return;

  const dinamicos = menu.querySelectorAll("[data-menu-dinamico='true']");
  dinamicos.forEach((el) => el.remove());
}

// ==========================
// 🧭 MENU POR CLASSE
// ==========================
function montarMenuIndicadores() {
  const menu = document.querySelector("#menu-list");
  if (!menu) return;

  limparItensDinamicosMenu(menu);

  let index = 0;

  for (const classe in classesIndicadores) {
    const id = "classe_" + index;

    const icon = iconesClasse[classe] || "fa-folder";
    const cor = coresClasse[classe] || "#ccc";

    const liClasse = document.createElement("li");
    liClasse.classList.add("menu-classe");
    liClasse.dataset.menuDinamico = "true";

    liClasse.innerHTML = `
      <i class="fas ${icon}" style="color:${cor}"></i>
      <span>${classe}</span>
    `;

    liClasse.onclick = () => {
      console.log("📂 Classe:", classe);
      toggleClasse(id);
    };

    menu.appendChild(liClasse);

    const submenu = document.createElement("ul");
    submenu.classList.add("submenu");
    submenu.id = id;
    submenu.dataset.menuDinamico = "true";

    classesIndicadores[classe].forEach((item) => {
      const li = document.createElement("li");
      li.classList.add("submenu-item");

      const nome = item.nome || item;
      const valor = item.valor || item;

      li.textContent = nome;

      li.onclick = () => {
        console.log("📊 Indicador:", valor, "| Classe:", classe);
        localStorage.setItem(STORAGE_KEYS.classeSelecionada, classe);
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

  localStorage.setItem(STORAGE_KEYS.indicador, indicador);

  if (typeof carregarTabela === "function") {
    carregarTabela();
  } else {
    console.error("❌ carregarTabela não encontrada");
  }

  document.querySelectorAll(".submenu").forEach((el) => {
    el.style.display = "none";
  });
}

// ==========================
// 🧱 UI HELPERS
// ==========================
function limparConteudo() {
  const el = document.getElementById("conteudo");
  if (el) el.innerHTML = "";
}

function telaInicial() {
  const conteudo = document.getElementById("conteudo");
  if (!conteudo) return;

  conteudo.innerHTML = `
    <h2>👋 Bem-vindo</h2>
    <p>Selecione uma opção no menu.</p>
  `;
}

function telaEmConstrucao(nome) {
  const conteudo = document.getElementById("conteudo");
  if (!conteudo) return;

  conteudo.innerHTML = `
    <h2>🚧 ${nome}</h2>
    <p>Em desenvolvimento</p>
  `;
}

function mostrarErro(msg) {
  const conteudo = document.getElementById("conteudo");
  if (!conteudo) return;

  conteudo.innerHTML = `
    <div class="card-conteudo">
      <h2 style="color:red;">❌ Erro</h2>
      <p>${msg}</p>
    </div>
  `;
}

// ==========================
// 🔄 TESTAR CONEXÃO
// ==========================
async function testarConexao() {
  try {
    if (!supabaseClient) {
      console.warn("⚠️ Supabase não inicializado ao testar conexão");
      return false;
    }

    const { error } = await supabaseClient
      .from("lojas")
      .select("*")
      .limit(1);

    if (error) {
      console.warn("⚠️ Erro ao testar conexão:", error);
      return false;
    }

    console.log("✅ Conexão com banco testada");
    return true;
  } catch (erro) {
    console.error("❌ Falha ao testar conexão:", erro);
    return false;
  }
}

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

    const nomeTela = tela.toString().trim().toLowerCase();
    console.log("🎯 Tela normalizada:", nomeTela);

    const container = document.getElementById("conteudo");

    if (!container) {
      console.error("❌ #conteudo não encontrado");
      return;
    }

    // ======================
    // ⚙️ CONFIGURAÇÕES
    // ======================
    if (nomeTela === "configuracoes") {
      console.log("⚙️ Abrindo Configurações");

      container.innerHTML = `
        <div class="card-conteudo" style="text-align:center; padding:40px;">
          <h2>⚙️ Configurações</h2>
          <p>Carregando...</p>
        </div>
      `;

      setTimeout(() => {
        if (typeof abrirConfiguracoes === "function") {
          abrirConfiguracoes();
        } else {
          console.error("❌ abrirConfiguracoes não encontrada");
          mostrarErro("Função abrirConfiguracoes não encontrada");
        }
      }, 120);

      return;
    }

    // ======================
    // 📊 DASHBOARD
    // ======================
    if (nomeTela === "dashboard") {
      console.log("📊 Abrindo Dashboard");

      if (typeof telaDashboard === "function") {
        telaDashboard();
      } else {
        telaInicial();
      }

      return;
    }

    // ======================
    // 🏆 RANKING
    // ======================
    if (nomeTela === "ranking") {
      console.log("🏆 Abrindo Ranking");

      if (typeof telaRanking === "function") {
        telaRanking();
      } else {
        container.innerHTML = `
          <div class="card-conteudo">
            <h2>🏆 Ranking</h2>
            <p>Em desenvolvimento</p>
          </div>
        `;
      }

      return;
    }

    // ======================
    // 📊 INDICADORES
    // ======================
    if (nomeTela === "indicadores") {
      console.log("📊 Indicadores");

      if (typeof carregarTabela === "function") {
        carregarTabela();
      } else {
        console.error("❌ carregarTabela não encontrada");
        mostrarErro("Função carregarTabela não encontrada");
      }

      return;
    }

    // ======================
    // 📊 COMPARATIVOS
    // ======================
    if (nomeTela === "comparativos") {
      console.log("📊 Comparativos");

      container.innerHTML = `
        <div class="card-conteudo">
          <h2>📊 Comparativos</h2>
          <p>Em desenvolvimento</p>
        </div>
      `;

      return;
    }

    // ======================
    // 🧱 FALLBACK
    // ======================
    console.warn("⚠️ Tela não mapeada:", nomeTela);

    container.innerHTML = `
      <div class="card-conteudo">
        <h2>🚧 ${nomeTela}</h2>
        <p>Em desenvolvimento</p>
      </div>
    `;
  } catch (erro) {
    console.error("❌ Erro ao abrir tela:", erro);

    const conteudo = document.getElementById("conteudo");
    if (!conteudo) return;

    conteudo.innerHTML = `
      <div class="card-conteudo">
        <h2 style="color:red;">❌ Erro</h2>
        <p>Falha ao abrir a tela.</p>
      </div>
    `;
  }
}

// ==========================
// ⚙️ ABRIR MENU CONFIG
// ==========================
function abrirConfiguracoesMenu() {
  const user = getUsuarioLocal();

  if (!user) {
    console.warn("⚠️ usuário não encontrado");
    return;
  }

  console.log("⚙️ Acesso ao menu de configurações");
  mostrar("configuracoes");
}

// ==========================
// 🚀 INIT APP
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Sistema iniciado");

  // 1) inicia Supabase
  if (!initSupabase()) {
    mostrarErro("Erro ao iniciar conexão");
    return;
  }

  // 2) valida sessão
  const authUser = await verificarSessao();
  if (!authUser) return;

  // 3) garante perfil local
  const perfilLocal = await garantirPerfilLocal(authUser);
  if (!perfilLocal) return;

  // 4) limpa contexto de indicador, mas mantém semana
  localStorage.removeItem(STORAGE_KEYS.indicador);
  localStorage.removeItem(STORAGE_KEYS.classeSelecionada);

  // 5) carrega sidebar
  await carregarSidebar();

  // 6) testa conexão
  await testarConexao();

  // 7) inicia monitoramento de inatividade
  if (typeof iniciarMonitoramentoInatividade === "function") {
    iniciarMonitoramentoInatividade();
  }

  // 8) abre dashboard
  mostrar("dashboard");
});