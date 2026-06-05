// ==========================
// 🔐 CONFIG SUPABASE
// ==========================
const SUPABASE_URL = "https://fnsplftfxvmyiqbigobh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc3BsZnRmeHZteWlxYmlnb2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTYyNTcsImV4cCI6MjA5NTQzMjI1N30.tLhsb0sI1uNgPAc7Yhvxk85cWitrp-ahOoBEpJCqzPY";

let supabaseClient = null;

// ==========================
// 🧠 ESTADO GLOBAL DO APP
// ==========================
const APP_STATE = {
  telaAtiva: "dashboard",
  indicadorAtivo: null,
  classeAtiva: null,

  silentRefreshMs: 15000,
  silentRefreshTimer: null,
  silentRefreshRunning: false,
  ultimoSilentRefresh: null,
};

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
// 🔠 HELPERS DE NORMALIZAÇÃO (APP)
// ==========================
function normalizarTextoApp(valor) {
  return (valor || "").toString().trim();
}

function normalizarTextoAppUpper(valor) {
  return normalizarTextoApp(valor).toUpperCase();
}

function normalizarTextoAppLower(valor) {
  return normalizarTextoApp(valor).toLowerCase();
}

function normalizarListaRegionaisApp(valor) {
  if (!valor) return [];

  if (Array.isArray(valor)) {
    return valor.map((v) => normalizarTextoApp(v)).filter(Boolean);
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
// 🧩 HELPERS GLOBAIS DE FUNÇÃO
// ==========================
function getFuncaoGlobal(nome) {
  const fn = window[nome];

  if (typeof fn !== "function") {
    return null;
  }

  return fn;
}

function chamarFuncaoGlobal(nome, ...args) {
  const fn = getFuncaoGlobal(nome);

  if (!fn) {
    console.error(`❌ Função global não encontrada: ${nome}`);
    return null;
  }

  return fn(...args);
}

function validarBootstrapPerfil() {
  const obrigatorias = [
    "getUsuarioLogado",
    "getPermissoesSistemaUsuario",
    "getEscopoUsuarioSistema",
    "abrirConfiguracoes",
  ];

  const faltando = obrigatorias.filter(
    (nome) => typeof window[nome] !== "function"
  );

  if (faltando.length) {
    console.error("❌ Funções de perfil ausentes:", faltando);
    return false;
  }

  console.log("✅ Bootstrap de perfil carregado com sucesso");
  return true;
}

// ==========================
// 📅 FALLBACK SEMANA ATUAL
// ==========================
function getSemanaAtualFallback() {
  const hoje = new Date();

  const dataUTC = new Date(
    Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  );

  const diaSemana = dataUTC.getUTCDay() || 7;
  dataUTC.setUTCDate(dataUTC.getUTCDate() + 4 - diaSemana);

  const anoInicio = new Date(Date.UTC(dataUTC.getUTCFullYear(), 0, 1));
  const semana = Math.ceil(((dataUTC - anoInicio) / 86400000 + 1) / 7);

  return semana;
}

function obterSemanaAtualApp() {
  if (typeof window.getSemanaAtual === "function") {
    try {
      return window.getSemanaAtual();
    } catch (erro) {
      console.warn(
        "⚠️ Falha ao usar getSemanaAtual global, usando fallback:",
        erro
      );
    }
  }

  return getSemanaAtualFallback();
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

    regionais_vinculadas: normalizarListaRegionaisApp(data.regionais_vinculadas),
  };
}

// ==========================
// 🆘 PERFIL FALLBACK PELO AUTH (APP)
// ==========================
function montarPerfilFallbackApp(authUser) {
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
      subclasses: [],
      acesso_total: false,
      permissao_visualizacao: "NENHUMA",
    },

    tipo_visao: "regional",
    loja_codigo: null,
    loja_vinculada: null,
    regional_vinculada: null,
    subregional_vinculada: null,
    regionais_vinculadas: [],
  };

  console.warn(
    "⚠️ [APP] Perfil não encontrado em usuarios. Usando fallback local:",
    perfilFallback
  );

  return perfilFallback;
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
    console.error(
      "❌ [APP] Falha inesperada em buscarPerfilPorAuthIdApp:",
      erro
    );
    return null;
  }
}

// ==========================
// 🔎 BUSCAR PERFIL POR EMAIL
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
    console.error(
      "❌ [APP] Falha inesperada em buscarPerfilPorEmailApp:",
      erro
    );
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
      console.log(
        "ℹ️ [APP] Perfil já possui auth_user_id:",
        perfil.auth_user_id
      );
      return perfil;
    }

    console.log(
      "🔗 [APP] Vinculando auth_user_id ao perfil encontrado por e-mail...",
      {
        usuario: perfil.nome,
        email: perfil.email,
        novoAuthId: authUser.id,
      }
    );

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
// ==========================
async function garantirPerfilLocal(authUser) {
  try {
    const usuarioLocal = getUsuarioLocal();

    if (
      usuarioLocal &&
      usuarioLocal.auth_user_id &&
      String(usuarioLocal.auth_user_id) === String(authUser.id)
    ) {
      console.log("✅ Perfil local já sincronizado");
      return usuarioLocal;
    }

    console.log("🔄 [APP] Resolvendo perfil do usuário no banco...");

    let perfil = await buscarPerfilPorAuthIdApp(authUser.id);

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
        console.warn(
          "⚠️ [APP] Perfil não encontrado por auth_user_id nem por e-mail. Entrando com fallback local."
        );

        const usuarioFallback = montarPerfilFallbackApp(authUser);
        setUsuarioLocal(usuarioFallback);

        return usuarioFallback;
      }

      if (!perfilPorEmail.auth_user_id) {
        perfil = await vincularAuthUserIdAoPerfilApp(perfilPorEmail, authUser);

        if (!perfil) {
          console.error(
            "❌ [APP] Falha ao vincular auth_user_id automaticamente"
          );
          limparSessaoLocal();
          window.location.replace("login.html");
          return null;
        }
      } else {
        if (String(perfilPorEmail.auth_user_id) !== String(authUser.id)) {
          console.error(
            "❌ [APP] Perfil por e-mail já está vinculado a outro auth_user_id",
            {
              email: perfilPorEmail.email,
              auth_user_id_tabela: perfilPorEmail.auth_user_id,
              auth_user_id_auth: authUser.id,
            }
          );

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

    pararAtualizacaoSilenciosa();

    window.dashboardModoApresentacao = false;

    if (typeof window.pausarTimerInatividade === "function") {
      window.pausarTimerInatividade();
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

  "Frente de Caixa": ["SELF-CHECKOUT", "DESCONTO", "CANCELAMENTO", "DEVOLUÇÃO"],

  Operações: [
    { nome: "Visita Prospecção", valor: "PSV" },
    { nome: "NPS", valor: "NPS" },
    { nome: "PART.TELEVENDAS", valor: "PART.TELEVENDAS" },
  ],

  Prevenção: ["QUEBRA", "QUEBRA FLV", "QUEBRA AÇOUGUE", "PSV", "TROCA"],

  "RH / Operacional": ["BANCOS DE HORAS", "TURNOVER"],
};

// ==========================
// 🎨 ÍCONES / CORES
// ==========================
const iconesMenu = {
  dashboard: "fa-gauge-high",
  analises: "fa-trophy",
  comparativos: "fa-chart-pie",
  configuracoes: "fa-gear",
};

const coresMenu = {
  dashboard: "#4CAF50",
  analises: "#FFC107",
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
// 🔐 HELPERS DE PERMISSÃO DO APP
// ==========================
function getUsuarioEfetivoApp() {
  try {
    if (typeof window.getUsuarioLogado === "function") {
      return window.getUsuarioLogado();
    }
  } catch (erro) {
    console.warn("⚠️ Falha ao usar getUsuarioLogado no app:", erro);
  }

  return getUsuarioLocal();
}

function getPermissoesSistemaEfetivasApp(user = null) {
  const usuario = user || getUsuarioEfetivoApp();

  try {
    if (typeof window.getPermissoesSistemaUsuario === "function") {
      return window.getPermissoesSistemaUsuario(usuario);
    }
  } catch (erro) {
    console.warn("⚠️ Falha ao usar getPermissoesSistemaUsuario no app:", erro);
  }

  return {
    pode_ver_dashboard: false,
    pode_ver_analises: false,
    pode_ver_comparativos: false,
    permissao_visualizacao: "NENHUMA",
  };
}

function getPermissoesIndicadoresApp(user = null) {
  const usuario = user || getUsuarioEfetivoApp();
  const permissoes = usuario?.permissoes || {};

  const resultado = {
    acesso_total: permissoes.acesso_total === true,
    indicadores: Array.isArray(permissoes.indicadores)
      ? permissoes.indicadores.map((i) => normalizarTextoAppUpper(i))
      : [],
    classes: Array.isArray(permissoes.classes)
      ? permissoes.classes.map((c) => normalizarTextoAppUpper(c))
      : [],
    subclasses: Array.isArray(permissoes.subclasses)
      ? permissoes.subclasses.map((s) => normalizarTextoAppUpper(s))
      : [],
  };

  console.log("🎯 Permissões de indicadores do app:", resultado);
  return resultado;
}

function getMetaIndicadorApp(indicador, classeFallback = "") {
  if (typeof window.getMetaIndicadorPermissao === "function") {
    try {
      const meta = window.getMetaIndicadorPermissao(indicador);
      return {
        classe: normalizarTextoAppUpper(meta?.classe || classeFallback || ""),
        subclasse: normalizarTextoAppUpper(meta?.subclasse || "GERAL"),
      };
    } catch (erro) {
      console.warn("⚠️ Falha ao usar getMetaIndicadorPermissao:", erro);
    }
  }

  return {
    classe: normalizarTextoAppUpper(classeFallback || ""),
    subclasse: "GERAL",
  };
}

function getTokenSubclasseApp(classe, subclasse) {
  if (typeof window.getTokenSubclasse === "function") {
    try {
      return normalizarTextoAppUpper(
        window.getTokenSubclasse(classe, subclasse)
      );
    } catch (erro) {
      console.warn("⚠️ Falha ao usar getTokenSubclasse:", erro);
    }
  }

  return `${normalizarTextoAppUpper(classe)}___SUB___${normalizarTextoAppUpper(
    subclasse || "GERAL"
  )}`;
}

function usuarioTemAcessoIndicadorApp(indicador, classe = "", user = null) {
  const permissoes = getPermissoesIndicadoresApp(user);
  const indicadorNorm = normalizarTextoAppUpper(indicador);
  const classeNorm = normalizarTextoAppUpper(classe);
  const meta = getMetaIndicadorApp(indicadorNorm, classeNorm);
  const tokenSubclasse = getTokenSubclasseApp(meta.classe, meta.subclasse);

  const acesso =
    permissoes.acesso_total === true ||
    permissoes.classes.includes(meta.classe) ||
    permissoes.subclasses.includes(tokenSubclasse) ||
    permissoes.indicadores.includes(indicadorNorm) ||
    permissoes.indicadores.includes("TODAS") ||
    permissoes.indicadores.includes("TODAS AS TABELAS") ||
    permissoes.indicadores.includes("TODOS OS INDICADORES");

  console.log("🎯 Checagem de acesso ao indicador:", {
    indicador,
    indicadorNorm,
    classe,
    classeNorm,
    meta,
    tokenSubclasse,
    acesso,
    permissoes,
  });

  return acesso;
}

function usuarioPodeAbrirTelaApp(tela, user = null) {
  const permissoes = getPermissoesSistemaEfetivasApp(user);
  const telaNorm = normalizarTextoAppLower(tela);

  let permitido = true;

  if (telaNorm === "dashboard") {
    permitido = permissoes.pode_ver_dashboard === true;
  } else if (telaNorm === "analises") {
    permitido = permissoes.pode_ver_analises === true;
  } else if (telaNorm === "comparativos") {
    permitido = permissoes.pode_ver_comparativos === true;
  }

  console.log("🧭 Checagem de acesso à tela:", {
    tela: telaNorm,
    permitido,
    permissoes,
  });

  return permitido;
}

function resolverPrimeiraTelaPermitidaApp(user = null) {
  const usuario = user || getUsuarioEfetivoApp();

  if (usuarioPodeAbrirTelaApp("dashboard", usuario)) return "dashboard";
  if (usuarioPodeAbrirTelaApp("analises", usuario)) return "analises";
  if (usuarioPodeAbrirTelaApp("comparativos", usuario)) return "comparativos";

  for (const classe in classesIndicadores) {
    const itens = classesIndicadores[classe] || [];
    for (const item of itens) {
      const valor = item?.valor || item;
      if (usuarioTemAcessoIndicadorApp(valor, classe, usuario)) {
        localStorage.setItem(STORAGE_KEYS.classeSelecionada, classe);
        localStorage.setItem(STORAGE_KEYS.indicador, valor);

        console.log("📌 Primeira tela permitida resolvida por indicador:", {
          classe,
          indicador: valor,
        });

        return "indicadores";
      }
    }
  }

  console.warn("⚠️ Nenhuma tela permitida encontrada. Usando configurações.");
  return "configuracoes";
}

function renderAcessoNegadoTela(nomeTela) {
  const conteudo = document.getElementById("conteudo");
  if (!conteudo) return;

  conteudo.innerHTML = `
    <div class="card-conteudo">
      <h2 style="color:#b91c1c;">🚫 Acesso negado</h2>
      <p>Você não possui permissão para acessar o módulo <b>${nomeTela}</b>.</p>
    </div>
  `;
}

function permsFalse(valor) {
  return valor !== true;
}

function aplicarPermissoesMenuPrincipal() {
  try {
    const usuario = getUsuarioEfetivoApp();
    const permissoes = getPermissoesSistemaEfetivasApp(usuario);

    const candidatos = document.querySelectorAll(
      "#sidebar button, #sidebar a, #sidebar li"
    );

    candidatos.forEach((el) => {
      const texto = (el.textContent || "").toString().trim().toLowerCase();
      const onclickAttr = (el.getAttribute("onclick") || "")
        .toString()
        .trim()
        .toLowerCase();

      let esconder = false;

      if (texto.includes("dashboard") || onclickAttr.includes("dashboard")) {
        esconder = permsFalse(permissoes.pode_ver_dashboard);
      }

      if (
        texto.includes("anális") ||
        texto.includes("analise") ||
        onclickAttr.includes("analises")
      ) {
        esconder = permsFalse(permissoes.pode_ver_analises);
      }

      if (
        texto.includes("comparativo") ||
        onclickAttr.includes("comparativos")
      ) {
        esconder = permsFalse(permissoes.pode_ver_comparativos);
      }

      if (esconder) {
        el.style.display = "none";
      }
    });

    console.log("🧭 Permissões aplicadas ao menu principal:", permissoes);
  } catch (erro) {
    console.warn("⚠️ Falha ao aplicar permissões ao menu principal:", erro);
  }
}

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
      aplicarPermissoesMenuPrincipal();
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
    aplicarPermissoesMenuPrincipal();

    const btnLogout = el.querySelector(".btn-logout");
    if (
      btnLogout &&
      !btnLogout.dataset.bound &&
      !btnLogout.getAttribute("onclick")
    ) {
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
// ==========================
function limparItensDinamicosMenu(menu) {
  if (!menu) return;

  const dinamicos = menu.querySelectorAll("[data-menu-dinamico='true']");
  dinamicos.forEach((el) => el.remove());
}

// ==========================
// 🧭 MENU POR CLASSE
// ✅ respeita permissões por classe / indicador
// ==========================
function montarMenuIndicadores() {
  const menu = document.querySelector("#menu-list");
  if (!menu) return;

  limparItensDinamicosMenu(menu);

  const usuario = getUsuarioEfetivoApp();

  let index = 0;
  let totalClassesMontadas = 0;
  let totalIndicadoresMontados = 0;

  for (const classe in classesIndicadores) {
    const itensOriginais = classesIndicadores[classe] || [];

    const itensPermitidos = itensOriginais.filter((item) => {
      const valor = item?.valor || item;
      return usuarioTemAcessoIndicadorApp(valor, classe, usuario);
    });

    if (!itensPermitidos.length) {
      console.log("🚫 Classe sem acesso, não exibida no menu:", classe);
      continue;
    }

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

    itensPermitidos.forEach((item) => {
      const li = document.createElement("li");
      li.classList.add("submenu-item");

      const nome = item.nome || item;
      const valor = item.valor || item;

      li.textContent = nome;

      li.onclick = () => {
        console.log("📊 Indicador permitido clicado:", valor, "| Classe:", classe);
        localStorage.setItem(STORAGE_KEYS.classeSelecionada, classe);
        selecionarIndicador(valor);
      };

      submenu.appendChild(li);
      totalIndicadoresMontados++;
    });

    menu.appendChild(submenu);
    totalClassesMontadas++;
    index++;
  }

  console.log("✅ Menu de indicadores montado com permissões:", {
    totalClassesMontadas,
    totalIndicadoresMontados,
  });
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
// ✅ valida permissão antes de abrir
// ==========================
function selecionarIndicador(indicador) {
  const usuario = getUsuarioEfetivoApp();
  const classe = localStorage.getItem(STORAGE_KEYS.classeSelecionada) || "";

  if (!usuarioTemAcessoIndicadorApp(indicador, classe, usuario)) {
    console.warn("🚫 Usuário sem acesso ao indicador selecionado:", {
      indicador,
      classe,
    });

    mostrarErro("Você não possui permissão para acessar este indicador.");
    return;
  }

  console.log("✅ Indicador autorizado:", indicador);

  localStorage.setItem(STORAGE_KEYS.indicador, indicador);
  APP_STATE.indicadorAtivo = indicador;
  APP_STATE.classeAtiva = classe;
  APP_STATE.telaAtiva = "tabela";

  if (typeof window.carregarTabela === "function") {
    window.carregarTabela();
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

    const { error } = await supabaseClient.from("lojas").select("*").limit(1);

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
// 🧠 CONTROLE DE TELA ATIVA
// ==========================
function definirTelaAtiva(tela, extras = {}) {
  APP_STATE.telaAtiva = tela || "dashboard";

  if (extras.indicador !== undefined) {
    APP_STATE.indicadorAtivo = extras.indicador;
  }

  if (extras.classe !== undefined) {
    APP_STATE.classeAtiva = extras.classe;
  }

  console.log("🧠 Tela ativa atualizada:", {
    telaAtiva: APP_STATE.telaAtiva,
    indicadorAtivo: APP_STATE.indicadorAtivo,
    classeAtiva: APP_STATE.classeAtiva,
  });
}

// ==========================
// 🔄 ABRIR TELA INTERNA
// ✅ valida permissão de módulo
// ==========================
async function abrirTelaInterna(nomeTela, { silent = false } = {}) {
  try {
    if (!nomeTela) {
      console.warn("⚠️ Tela não informada");
      return;
    }

    let telaNormalizada = nomeTela.toString().trim().toLowerCase();

    if (telaNormalizada === "ranking") telaNormalizada = "analises";
    if (telaNormalizada === "analise") telaNormalizada = "analises";

    const container = document.getElementById("conteudo");

    if (!container) {
      console.error("❌ #conteudo não encontrado");
      return;
    }

    console.log("🧭 Abrindo tela:", telaNormalizada, "| silent:", silent);

    const usuario = getUsuarioEfetivoApp();

    // ======================
    // ⚙️ CONFIGURAÇÕES
    // ======================
    if (telaNormalizada === "configuracoes") {
      definirTelaAtiva("configuracoes");

      if (!silent) {
        container.innerHTML = `
          <div class="card-conteudo" style="text-align:center; padding:40px;">
            <h2>⚙️ Configurações</h2>
            <p>Carregando...</p>
          </div>
        `;
      }

      if (typeof window.abrirConfiguracoes === "function") {
        window.abrirConfiguracoes();
      } else {
        console.error("❌ abrirConfiguracoes não encontrada");
      }

      return;
    }

    // ======================
    // 📊 DASHBOARD
    // ======================
    if (telaNormalizada === "dashboard") {
      if (!usuarioPodeAbrirTelaApp("dashboard", usuario)) {
        console.warn("🚫 Acesso negado ao dashboard");
        definirTelaAtiva("dashboard");
        renderAcessoNegadoTela("Dashboard");
        return;
      }

      definirTelaAtiva("dashboard");

      if (typeof window.telaDashboard === "function") {
        await window.telaDashboard();
      } else {
        telaInicial();
      }

      return;
    }

    // ======================
    // 📈 ANÁLISES
    // ======================
    if (telaNormalizada === "analises") {
      if (!usuarioPodeAbrirTelaApp("analises", usuario)) {
        console.warn("🚫 Acesso negado às análises");
        definirTelaAtiva("analises");
        renderAcessoNegadoTela("Análises");
        return;
      }

      definirTelaAtiva("analises");

      if (typeof window.telaAnalises === "function") {
        await window.telaAnalises();
      } else {
        container.innerHTML = `
          <div class="card-conteudo">
            <h2>📈 Análises</h2>
            <p>Módulo de análises não carregado.</p>
          </div>
        `;
      }

      return;
    }

    // ======================
    // 🔀 COMPARATIVOS
    // ======================
    if (telaNormalizada === "comparativos") {
      if (!usuarioPodeAbrirTelaApp("comparativos", usuario)) {
        console.warn("🚫 Acesso negado aos comparativos");
        definirTelaAtiva("comparativos");
        renderAcessoNegadoTela("Comparativos");
        return;
      }

      definirTelaAtiva("comparativos");

      if (typeof window.telaComparativos === "function") {
        await window.telaComparativos();
      } else {
        container.innerHTML = `
          <div class="card-conteudo">
            <h2>🔀 Comparativos</h2>
            <p>Módulo de comparativos não carregado.</p>
          </div>
        `;
      }

      return;
    }

    // ======================
    // 📊 INDICADORES
    // ======================
    if (telaNormalizada === "indicadores") {
      console.log("📊 Indicadores (compatibilidade)");

      const indicadorAtual = localStorage.getItem(STORAGE_KEYS.indicador);
      const classeAtual = localStorage.getItem(STORAGE_KEYS.classeSelecionada);

      if (!indicadorAtual) {
        console.warn("⚠️ Nenhum indicador selecionado");
        mostrarErro("Nenhum indicador foi selecionado.");
        return;
      }

      if (!usuarioTemAcessoIndicadorApp(indicadorAtual, classeAtual, usuario)) {
        console.warn("🚫 Acesso negado ao indicador pelo app:", {
          classeAtual,
          indicadorAtual,
        });

        mostrarErro("Você não possui permissão para acessar este indicador.");
        return;
      }

      definirTelaAtiva("tabela", {
        indicador: indicadorAtual,
        classe: classeAtual,
      });

      if (typeof window.carregarTabela === "function") {
        await window.carregarTabela();
      } else {
        console.error("❌ carregarTabela não encontrada");
        mostrarErro("Função carregarTabela não encontrada");
      }

      return;
    }

    console.warn("⚠️ Tela não mapeada:", telaNormalizada);

    container.innerHTML = `
      <div class="card-conteudo">
        <h2>🚧 ${telaNormalizada}</h2>
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
// 🧭 CONTROLE DE TELAS
// ==========================
function mostrar(tela) {
  abrirTelaInterna(tela, { silent: false });
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
// 🔄 ATUALIZAÇÃO SILENCIOSA
// ==========================
function existeEdicaoAtivaNoConteudo() {
  try {
    const active = document.activeElement;
    if (!active) return false;

    const tag = (active.tagName || "").toLowerCase();
    const ehCampo =
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      active.isContentEditable === true;

    if (!ehCampo) return false;

    const dentroDoConteudo =
      !!active.closest("#conteudo") || !!active.closest("#config-conteudo");

    if (!dentroDoConteudo) return false;

    return true;
  } catch (erro) {
    console.warn("⚠️ Falha ao avaliar edição ativa:", erro);
    return false;
  }
}

async function sincronizarPerfilSilenciosamente() {
  try {
    if (typeof window.sincronizarUsuarioLocalDoBanco === "function") {
      console.log("🔄 Sincronizando perfil local silenciosamente...");
      await window.sincronizarUsuarioLocalDoBanco();
      preencherUsuario();
      montarMenuIndicadores();
      aplicarPermissoesMenuPrincipal();
    }
  } catch (erro) {
    console.warn("⚠️ Falha ao sincronizar perfil local silenciosamente:", erro);
  }
}

async function atualizarTelaSilenciosamente() {
  if (APP_STATE.silentRefreshRunning) {
    console.log("⏳ Atualização silenciosa já em andamento - ignorando ciclo");
    return;
  }

  if (window.dashboardModoApresentacao) {
    console.log("🖥️ Modo apresentação ativo - refresh silencioso bloqueado");
    return;
  }

  if (existeEdicaoAtivaNoConteudo()) {
    console.log(
      "⌨️ Usuário está interagindo com um campo - refresh silencioso adiado"
    );
    return;
  }

  APP_STATE.silentRefreshRunning = true;

  try {
    console.log("🔄 Iniciando atualização silenciosa:", {
      telaAtiva: APP_STATE.telaAtiva,
      horario: new Date().toLocaleTimeString("pt-BR"),
    });

    await sincronizarPerfilSilenciosamente();

    switch (APP_STATE.telaAtiva) {
      case "dashboard":
        console.log(
          "📊 Dashboard ativo - atualização silenciosa desabilitada para não atrapalhar apresentação"
        );
        break;

      case "analises":
        console.log(
          "📈 Análises ativa - atualização silenciosa desabilitada para não atrapalhar uso e apresentação"
        );
        break;

      case "comparativos":
        console.log(
          "📊 Comparativos ativo - atualização silenciosa desabilitada para não atrapalhar uso e apresentação"
        );
        break;

      case "tabela":
        if (typeof window.carregarTabela === "function") {
          await window.carregarTabela();
        }
        break;

      case "configuracoes":
        console.log("⚙️ Configurações ativa - refresh silencioso ignorado");
        break;

      default:
        console.log(
          "ℹ️ Nenhuma tela compatível com refresh silencioso:",
          APP_STATE.telaAtiva
        );
        break;
    }

    APP_STATE.ultimoSilentRefresh = new Date().toISOString();

    console.log("✅ Atualização silenciosa concluída");
  } catch (erro) {
    console.error("❌ Erro na atualização silenciosa:", erro);
  } finally {
    APP_STATE.silentRefreshRunning = false;
  }
}

function iniciarAtualizacaoSilenciosa() {
  try {
    pararAtualizacaoSilenciosa();

    console.log(
      `🔄 Iniciando atualização silenciosa automática a cada ${
        APP_STATE.silentRefreshMs / 1000
      }s`
    );

    APP_STATE.silentRefreshTimer = setInterval(async () => {
      await atualizarTelaSilenciosamente();
    }, APP_STATE.silentRefreshMs);
  } catch (erro) {
    console.error("❌ Falha ao iniciar atualização silenciosa:", erro);
  }
}

function pararAtualizacaoSilenciosa() {
  if (APP_STATE.silentRefreshTimer) {
    clearInterval(APP_STATE.silentRefreshTimer);
    APP_STATE.silentRefreshTimer = null;
    console.log("⏹️ Atualização silenciosa parada");
  }
}

// ==========================
// 👀 VISIBILIDADE DA ABA
// ==========================
document.addEventListener("visibilitychange", async () => {
  try {
    if (document.hidden) {
      console.log("🙈 Aba oculta - mantendo timer, mas sem refresh imediato");
      return;
    }

    console.log("👀 Aba voltou ao foco - disparando refresh silencioso");
    await atualizarTelaSilenciosamente();
  } catch (erro) {
    console.error("❌ Erro no visibilitychange do app:", erro);
  }
});

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

  // 4) valida bootstrap dos arquivos de perfil
  validarBootstrapPerfil();

  // 5) sempre iniciar na semana atual
  const semanaAtual = obterSemanaAtualApp().toString().padStart(2, "0");
  localStorage.setItem(STORAGE_KEYS.semana, semanaAtual);

  // limpa contexto do indicador/classe
  localStorage.removeItem(STORAGE_KEYS.indicador);
  localStorage.removeItem(STORAGE_KEYS.classeSelecionada);

  APP_STATE.indicadorAtivo = null;
  APP_STATE.classeAtiva = null;

  console.log("📅 Semana inicial forçada para a semana atual:", semanaAtual);

  // 6) carrega sidebar
  await carregarSidebar();

  // 7) testa conexão
  await testarConexao();

  // 8) inicia monitoramento de inatividade
  if (typeof window.iniciarMonitoramentoInatividade === "function") {
    window.iniciarMonitoramentoInatividade();
  }

  // 9) inicia atualização silenciosa
  iniciarAtualizacaoSilenciosa();

  // 10) abre primeira tela permitida
  const telaInicialPermitida = resolverPrimeiraTelaPermitidaApp(perfilLocal);

  console.log("🧭 Tela inicial permitida resolvida:", telaInicialPermitida);

  if (telaInicialPermitida === "indicadores") {
    await abrirTelaInterna("indicadores", { silent: false });
  } else {
    await abrirTelaInterna(telaInicialPermitida, { silent: false });
  }
});

// ==========================
// 🌐 EXPOR FUNÇÕES
// ==========================
window.getUsuarioLocal = getUsuarioLocal;
window.setUsuarioLocal = setUsuarioLocal;
window.limparSessaoLocal = limparSessaoLocal;

window.initSupabase = initSupabase;
window.verificarSessao = verificarSessao;
window.garantirPerfilLocal = garantirPerfilLocal;
window.logout = logout;

window.mostrar = mostrar;
window.abrirTelaInterna = abrirTelaInterna;
window.abrirConfiguracoesMenu = abrirConfiguracoesMenu;
window.selecionarIndicador = selecionarIndicador;
window.toggleClasse = toggleClasse;

window.definirTelaAtiva = definirTelaAtiva;
window.iniciarAtualizacaoSilenciosa = iniciarAtualizacaoSilenciosa;
window.pararAtualizacaoSilenciosa = pararAtualizacaoSilenciosa;
window.atualizarTelaSilenciosamente = atualizarTelaSilenciosamente;

window.usuarioTemAcessoIndicadorApp = usuarioTemAcessoIndicadorApp;
window.usuarioPodeAbrirTelaApp = usuarioPodeAbrirTelaApp;
window.montarMenuIndicadores = montarMenuIndicadores;
window.aplicarPermissoesMenuPrincipal = aplicarPermissoesMenuPrincipal;

window.classesIndicadores = classesIndicadores;
window.APP_STATE = APP_STATE;

// ==========================
// ✅ LOG FINAL DE BOOTSTRAP
// ==========================
console.log("✅ app.js pronto", {
  getUsuarioLocal: typeof window.getUsuarioLocal,
  setUsuarioLocal: typeof window.setUsuarioLocal,
  mostrar: typeof window.mostrar,
  abrirTelaInterna: typeof window.abrirTelaInterna,
  selecionarIndicador: typeof window.selecionarIndicador,
  usuarioTemAcessoIndicadorApp: typeof window.usuarioTemAcessoIndicadorApp,
  usuarioPodeAbrirTelaApp: typeof window.usuarioPodeAbrirTelaApp,
  montarMenuIndicadores: typeof window.montarMenuIndicadores,
  aplicarPermissoesMenuPrincipal: typeof window.aplicarPermissoesMenuPrincipal,
});