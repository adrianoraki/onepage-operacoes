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
  telaAtiva: "analises",
  indicadorAtivo: null,
  classeAtiva: null,

  silentRefreshMs: 15000,
  silentRefreshTimer: null,
  silentRefreshRunning: false,
  ultimoSilentRefresh: null,
};

// ==========================
// 🪵 HELPERS DE LOG
// ==========================
const APP_LOG_PREFIX = "🧩 APP";

function appLogInfo(mensagem, payload = null) {
  if (payload !== null && payload !== undefined) {
    console.log(`${APP_LOG_PREFIX} | ${mensagem}`, payload);
  } else {
    console.log(`${APP_LOG_PREFIX} | ${mensagem}`);
  }
}

function appLogWarn(mensagem, payload = null) {
  if (payload !== null && payload !== undefined) {
    console.warn(`${APP_LOG_PREFIX} | ${mensagem}`, payload);
  } else {
    console.warn(`${APP_LOG_PREFIX} | ${mensagem}`);
  }
}

function appLogError(mensagem, payload = null) {
  if (payload !== null && payload !== undefined) {
    console.error(`${APP_LOG_PREFIX} | ${mensagem}`, payload);
  } else {
    console.error(`${APP_LOG_PREFIX} | ${mensagem}`);
  }
}

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
    const valor = localStorage.getItem(STORAGE_KEYS.usuario);

    if (!valor) {
      appLogInfo("Nenhum usuário local salvo");
      return null;
    }

    const usuario = JSON.parse(valor);

    appLogInfo("Usuário local lido com sucesso", {
      existe: !!usuario,
      auth_user_id: usuario?.auth_user_id || null,
      email: usuario?.email || null,
    });

    return usuario;
  } catch (e) {
    appLogError("Erro ao ler usuário local", e);
    return null;
  }
}

function setUsuarioLocal(usuario) {
  try {
    localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(usuario));

    appLogInfo("Usuário local salvo", {
      auth_user_id: usuario?.auth_user_id || null,
      email: usuario?.email || null,
      perfil: usuario?.perfil || null,
    });
  } catch (e) {
    appLogError("Erro ao salvar usuário local", e);
  }
}

function limparSessaoLocal() {
  localStorage.removeItem(STORAGE_KEYS.usuario);
  localStorage.removeItem(STORAGE_KEYS.indicador);
  localStorage.removeItem(STORAGE_KEYS.classeSelecionada);

  appLogInfo("Sessão local limpa");
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
    appLogError(`Função global não encontrada: ${nome}`);
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
    (nome) => typeof window[nome] !== "function",
  );

  if (faltando.length) {
    appLogError("Funções de perfil ausentes", faltando);
    return false;
  }

  appLogInfo("Bootstrap de perfil carregado com sucesso");
  return true;
}

// ==========================
// 📅 FALLBACK SEMANA ATUAL
// ==========================
function getSemanaAtualFallback() {
  const hoje = new Date();

  const dataUTC = new Date(
    Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
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
      appLogWarn("Falha ao usar getSemanaAtual global, usando fallback", erro);
    }
  }

  return getSemanaAtualFallback();
}

// ==========================
// 👤 HELPERS DE USUÁRIO / SIDEBAR
// ==========================
function montarNomeCompletoUsuario(usuario = {}) {
  const nomeCompleto = [usuario.nome, usuario.sobrenome]
    .map((parte) => normalizarTextoApp(parte))
    .filter(Boolean)
    .join(" ")
    .trim();

  return nomeCompleto || normalizarTextoApp(usuario.nome) || "-";
}

function gerarIniciaisUsuario(usuario = {}) {
  const nome = normalizarTextoApp(usuario.nome);
  const sobrenome = normalizarTextoApp(usuario.sobrenome);

  let iniciais = ((nome?.[0] || "") + (sobrenome?.[0] || "")).toUpperCase();

  if (!iniciais) {
    const nomeCompleto = montarNomeCompletoUsuario(usuario);
    iniciais = nomeCompleto
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() || "")
      .join("");
  }

  return iniciais || "U";
}

function getElementoSeguro(id) {
  const el = document.getElementById(id);

  if (!el) {
    appLogWarn(`Elemento não encontrado: #${id}`);
    return null;
  }

  return el;
}

// ==========================
// 👤 MONTAR USUÁRIO LOCAL
// ==========================
function montarUsuarioLocalAPartirDoPerfil(data) {
  const usuario = {
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

    regionais_vinculadas: normalizarListaRegionaisApp(
      data.regionais_vinculadas,
    ),
  };

  appLogInfo("Usuário local montado a partir do perfil", {
    id: usuario.id,
    auth_user_id: usuario.auth_user_id,
    email: usuario.email,
    perfil: usuario.perfil,
    funcao: usuario.funcao,
  });

  return usuario;
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

  appLogWarn(
    "Perfil não encontrado em usuarios. Usando fallback local",
    perfilFallback,
  );

  return perfilFallback;
}

// ==========================
// 🚀 INIT SUPABASE
// ==========================
function initSupabase() {
  try {
    if (!window.supabase || !window.supabase.createClient) {
      appLogError("Biblioteca do Supabase não carregada");
      return false;
    }

    if (supabaseClient) {
      appLogInfo("Supabase já inicializado");
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

    appLogInfo("Supabase inicializado");
    return true;
  } catch (erro) {
    appLogError("Erro ao iniciar Supabase", erro);
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
      appLogError("Erro ao verificar sessão", error);
      window.location.replace("login.html");
      return false;
    }

    if (!session?.user) {
      appLogWarn("Sessão não encontrada");
      window.location.replace("login.html");
      return false;
    }

    appLogInfo("Sessão válida", {
      auth_user_id: session.user.id,
      email: session.user.email,
    });

    return session.user;
  } catch (erro) {
    appLogError("Erro ao verificar sessão", erro);
    window.location.replace("login.html");
    return false;
  }
}

// ==========================
// 🔎 BUSCAR PERFIL POR AUTH ID
// ==========================
async function buscarPerfilPorAuthIdApp(authUserId) {
  try {
    appLogInfo("Buscando perfil por auth_user_id", { authUserId });

    const { data, error } = await window.db
      .from("usuarios")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) {
      appLogWarn("Erro ao buscar perfil por auth_user_id", error);
      return null;
    }

    if (!data) {
      appLogWarn("Nenhum perfil encontrado por auth_user_id");
      return null;
    }

    appLogInfo("Perfil encontrado por auth_user_id", {
      id: data.id,
      email: data.email,
      perfil: data.perfil,
    });

    return data;
  } catch (erro) {
    appLogError("Falha inesperada em buscarPerfilPorAuthIdApp", erro);
    return null;
  }
}

// ==========================
// 🔎 BUSCAR PERFIL POR EMAIL
// ==========================
async function buscarPerfilPorEmailApp(email) {
  try {
    appLogInfo("Buscando perfil por e-mail", { email });

    const { data, error } = await window.db
      .from("usuarios")
      .select("*")
      .ilike("email", email)
      .maybeSingle();

    if (error) {
      appLogWarn("Erro ao buscar perfil por e-mail", error);
      return null;
    }

    if (!data) {
      appLogWarn("Nenhum perfil encontrado por e-mail");
      return null;
    }

    appLogInfo("Perfil encontrado por e-mail", {
      id: data.id,
      email: data.email,
      perfil: data.perfil,
    });

    return data;
  } catch (erro) {
    appLogError("Falha inesperada em buscarPerfilPorEmailApp", erro);
    return null;
  }
}

// ==========================
// 🔗 VINCULAR AUTH_USER_ID AO PERFIL
// ==========================
async function vincularAuthUserIdAoPerfilApp(perfil, authUser) {
  try {
    if (!perfil || !authUser?.id) {
      appLogWarn("Dados insuficientes para vincular auth_user_id");
      return null;
    }

    if (perfil.auth_user_id) {
      appLogInfo("Perfil já possui auth_user_id", {
        auth_user_id: perfil.auth_user_id,
      });
      return perfil;
    }

    appLogInfo("Vinculando auth_user_id ao perfil encontrado por e-mail", {
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
      appLogError("Erro ao vincular auth_user_id", error);
      return null;
    }

    appLogInfo("auth_user_id vinculado com sucesso", {
      usuario: data.nome,
      auth_user_id: data.auth_user_id,
    });

    return data;
  } catch (erro) {
    appLogError("Falha inesperada ao vincular auth_user_id", erro);
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
      appLogInfo("Perfil local já sincronizado");
      return usuarioLocal;
    }

    appLogInfo("Resolvendo perfil do usuário no banco");

    let perfil = await buscarPerfilPorAuthIdApp(authUser.id);

    if (!perfil) {
      const emailAuth = normalizarTextoAppLower(authUser.email);

      if (!emailAuth) {
        appLogError("Usuário auth sem e-mail para fallback");
        limparSessaoLocal();
        window.location.replace("login.html");
        return null;
      }

      const perfilPorEmail = await buscarPerfilPorEmailApp(emailAuth);

      if (!perfilPorEmail) {
        appLogWarn(
          "Perfil não encontrado por auth_user_id nem por e-mail. Entrando com fallback local.",
        );

        const usuarioFallback = montarPerfilFallbackApp(authUser);
        setUsuarioLocal(usuarioFallback);

        return usuarioFallback;
      }

      if (!perfilPorEmail.auth_user_id) {
        perfil = await vincularAuthUserIdAoPerfilApp(perfilPorEmail, authUser);

        if (!perfil) {
          appLogError("Falha ao vincular auth_user_id automaticamente");
          limparSessaoLocal();
          window.location.replace("login.html");
          return null;
        }
      } else {
        if (String(perfilPorEmail.auth_user_id) !== String(authUser.id)) {
          appLogError(
            "Perfil por e-mail já está vinculado a outro auth_user_id",
            {
              email: perfilPorEmail.email,
              auth_user_id_tabela: perfilPorEmail.auth_user_id,
              auth_user_id_auth: authUser.id,
            },
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

    appLogInfo("Perfil local sincronizado", {
      auth_user_id: usuario.auth_user_id,
      email: usuario.email,
      perfil: usuario.perfil,
      funcao: usuario.funcao,
    });

    return usuario;
  } catch (erro) {
    appLogError("Erro ao sincronizar perfil local", erro);
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
    appLogInfo("Logout iniciado");

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
    appLogError("Erro no logout", erro);
  }
}

// ==========================
// 📊 CLASSES DE INDICADORES
// ==========================
const classesIndicadores = {
  Auditoria: [
    {
      nome: "Ruptura Final",
      valor: "RUPTURA FINAL",
    },
    {
      nome: "Etiqueta",
      valor: "ETIQUETA",
    },
  ],

  "Frente de Caixa": [
    {
      nome: "Self Checkout",
      valor: "SELF-CHECKOUT",
    },
    {
      nome: "Desconto",
      valor: "DESCONTO",
    },
    {
      nome: "Cancelamento",
      valor: "CANCELAMENTO",
    },
    {
      nome: "Devolução",
      valor: "DEVOLUÇÃO",
    },
    {
      nome: "Faixa Horas",
      valor: "FAIXA HORAS",
    },
  ],

  Operações: [
    {
      nome: "Visita Prospecção",
      valor: "VISITA PROSPECÇÃO",
    },
    {
      nome: "NPS",
      valor: "NPS",
    },
    {
      nome: "PART.TELEVENDAS",
      valor: "PART.TELEVENDAS",
    },
  ],

  Prevenção: [
    {
      nome: "Quebra",
      valor: "QUEBRA",
    },
    {
      nome: "Quebra FLV",
      valor: "QUEBRA FLV",
    },
    {
      nome: "Quebra Açougue",
      valor: "QUEBRA AÇOUGUE",
    },
    {
      nome: "PSV",
      valor: "PSV",
    },
    {
      nome: "Troca",
      valor: "TROCA",
    },
  ],

  "RH / Operacional": [
    {
      nome: "Banco de Horas",
      valor: "BANCO DE HORAS",
    },
    {
      nome: "Turnover",
      valor: "TURNOVER",
    },
  ],
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
    appLogWarn("Falha ao usar getUsuarioLogado no app", erro);
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
    appLogWarn("Falha ao usar getPermissoesSistemaUsuario no app", erro);
  }

  return {
    pode_ver_dashboard: false,
    pode_ver_analises: false,
    pode_ver_comparativos: false,
    pode_ver_painel_ouro: false,
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

  appLogInfo("Permissões de indicadores do app", resultado);
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
      appLogWarn("Falha ao usar getMetaIndicadorPermissao", erro);
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
        window.getTokenSubclasse(classe, subclasse),
      );
    } catch (erro) {
      appLogWarn("Falha ao usar getTokenSubclasse", erro);
    }
  }

  return `${normalizarTextoAppUpper(classe)}___SUB___${normalizarTextoAppUpper(
    subclasse || "GERAL",
  )}`;
}

function usuarioTemAcessoIndicadorApp(indicador, classe = "", user = null) {
  const permissoes = getPermissoesIndicadoresApp(user);
  const indicadorNorm = normalizarTextoAppUpper(indicador);
  const classeNorm = normalizarTextoAppUpper(classe);
  const meta = getMetaIndicadorApp(indicadorNorm, classeNorm);
  const tokenSubclasse = getTokenSubclasseApp(meta.classe, meta.subclasse);

  // permissão dedicada "Ver [tabela]" — libera a classe inteira
  let liberadoPorClasse = false;
  try {
    if (typeof window.chavePermissaoClasse === "function") {
      const permsSistema = getPermissoesSistemaEfetivasApp(user);
      const chaveClasse = window.chavePermissaoClasse(meta.classe || classe);
      liberadoPorClasse = permsSistema[chaveClasse] === true;
    }
  } catch (e) {
    liberadoPorClasse = false;
  }

  const acesso =
    liberadoPorClasse ||
    permissoes.acesso_total === true ||
    permissoes.classes.includes(meta.classe) ||
    permissoes.subclasses.includes(tokenSubclasse) ||
    permissoes.indicadores.includes(indicadorNorm) ||
    permissoes.indicadores.includes("TODAS") ||
    permissoes.indicadores.includes("TODAS AS TABELAS") ||
    permissoes.indicadores.includes("TODOS OS INDICADORES");

  appLogInfo("Checagem de acesso ao indicador", {
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
  } else if (telaNorm === "painel-ouro" || telaNorm === "painelouro") {
    permitido = permissoes.pode_ver_painel_ouro === true;
  }

  appLogInfo("Checagem de acesso à tela", {
    tela: telaNorm,
    permitido,
    permissoes,
  });

  return permitido;
}

function resolverPrimeiraTelaPermitidaApp(user = null) {
  const usuario = user || getUsuarioEfetivoApp();

  if (usuarioPodeAbrirTelaApp("analises", usuario)) return "analises";
  if (usuarioPodeAbrirTelaApp("comparativos", usuario)) return "comparativos";

  for (const classe in classesIndicadores) {
    const itens = classesIndicadores[classe] || [];
    for (const item of itens) {
      const valor = item?.valor || item;
      if (usuarioTemAcessoIndicadorApp(valor, classe, usuario)) {
        localStorage.setItem(STORAGE_KEYS.classeSelecionada, classe);
        localStorage.setItem(STORAGE_KEYS.indicador, valor);

        appLogInfo("Primeira tela permitida resolvida por indicador", {
          classe,
          indicador: valor,
        });

        return "indicadores";
      }
    }
  }

  appLogWarn("Nenhuma tela permitida encontrada. Usando configurações.");
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
      "#sidebar button, #sidebar a, #sidebar li",
    );

    candidatos.forEach((el) => {
      const texto = (el.textContent || "").toString().trim().toLowerCase();
      const onclickAttr = (el.getAttribute("onclick") || "")
        .toString()
        .trim()
        .toLowerCase();
      const dataMenu = (el.dataset?.menu || "").toLowerCase();

      // determina se este elemento tem uma regra de permissão aplicável
      let permissaoAplicavel = false;
      let esconder = false;

      if (
        dataMenu === "dashboard" ||
        texto.includes("dashboard") ||
        onclickAttr.includes("dashboard")
      ) {
        permissaoAplicavel = true;
        esconder = permsFalse(permissoes.pode_ver_dashboard);
      } else if (
        dataMenu === "analises" ||
        texto.includes("anális") ||
        texto.includes("analise") ||
        onclickAttr.includes("analises")
      ) {
        permissaoAplicavel = true;
        esconder = permsFalse(permissoes.pode_ver_analises);
      } else if (
        dataMenu === "comparativos" ||
        texto.includes("comparativo") ||
        onclickAttr.includes("comparativos")
      ) {
        permissaoAplicavel = true;
        esconder = permsFalse(permissoes.pode_ver_comparativos);
      } else if (
        dataMenu === "painel-ouro" ||
        texto.includes("painel de ouro") ||
        onclickAttr.includes("painel-ouro")
      ) {
        permissaoAplicavel = true;
        esconder = permsFalse(permissoes.pode_ver_painel_ouro);
      }

      if (permissaoAplicavel) {
        el.style.display = esconder ? "none" : "";
      }
    });

    appLogInfo("Permissões aplicadas ao menu principal", permissoes);
  } catch (erro) {
    appLogWarn("Falha ao aplicar permissões ao menu principal", erro);
  }
}

// ==========================
// 📦 CARREGAR SIDEBAR
// ==========================
async function carregarSidebar() {
  try {
    const el = document.getElementById("sidebar");

    if (!el) {
      appLogWarn("Sidebar não encontrado");
      return;
    }

    if (el.dataset.loaded === "true") {
      appLogWarn("Sidebar já carregado - não recarregar");
      preencherUsuario();
      montarMenuIndicadores();
      aplicarPermissoesMenuPrincipal();
      return;
    }

    appLogInfo("Carregando sidebar...");

    const res = await fetch("components/sidebar.html");
    const html = await res.text();

    el.innerHTML = html;
    el.dataset.loaded = "true";

    appLogInfo("Sidebar carregado com sucesso");

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

      appLogInfo("Botão de logout vinculado via addEventListener");
    }
  } catch (erro) {
    appLogError("Erro ao carregar sidebar", erro);
    mostrarErro("Erro ao carregar menu");
  }
}

// ==========================
// 👤 PREENCHER USUÁRIO
// ✅ ajustado para suportar função no novo card
// ==========================
function preencherUsuario() {
  try {
    const usuario = getUsuarioLocal();

    if (!usuario) {
      appLogWarn("Nenhum usuário local encontrado para preencher sidebar");
      return;
    }

    const nomeEl = document.getElementById("nomeUsuario");
    const emailEl = document.getElementById("emailUsuario");
    const matriculaEl = document.getElementById("matriculaUsuario");
    const funcaoEl = document.getElementById("funcaoUsuario");
    const avatarEl = document.getElementById("avatar");

    const nomeCompleto = montarNomeCompletoUsuario(usuario);
    const funcao = normalizarTextoApp(usuario.funcao) || "-";
    const email = normalizarTextoApp(usuario.email) || "-";
    const matricula = normalizarTextoApp(usuario.matricula) || "-";
    const iniciais = gerarIniciaisUsuario(usuario);

    if (nomeEl) nomeEl.textContent = nomeCompleto;
    if (emailEl) emailEl.textContent = email;
    if (matriculaEl) matriculaEl.textContent = matricula;
    if (funcaoEl) funcaoEl.textContent = funcao;

    if (avatarEl) {
      avatarEl.textContent = iniciais;
      avatarEl.setAttribute("title", nomeCompleto);
      avatarEl.setAttribute("aria-label", `Avatar de ${nomeCompleto}`);
    }

    appLogInfo("Usuário preenchido na sidebar", {
      nomeCompleto,
      matricula,
      funcao,
      email,
      iniciais,
      temCampoFuncao: !!funcaoEl,
    });
  } catch (erro) {
    appLogError("Erro ao preencher usuário na sidebar", erro);
  }
}

// ==========================
// 🧹 LIMPAR ITENS DINÂMICOS DO MENU
// ==========================
function limparItensDinamicosMenu(menu) {
  if (!menu) return;

  const dinamicos = menu.querySelectorAll("[data-menu-dinamico='true']");
  dinamicos.forEach((el) => el.remove());

  appLogInfo("Itens dinâmicos do menu removidos", {
    totalRemovido: dinamicos.length,
  });
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

  
const classesMenuApp = window.classesIndicadores || classesIndicadores || {};

for (const classe in classesMenuApp) {

    const itensOriginais = classesMenuApp[classe] || [];

    const itensPermitidos = itensOriginais.filter((item) => {
      const valor = item?.valor || item;
      return usuarioTemAcessoIndicadorApp(valor, classe, usuario);
    });

    if (!itensPermitidos.length) {
      appLogInfo("Classe sem acesso, não exibida no menu", { classe });
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
      appLogInfo("Classe clicada", { classe });
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
        appLogInfo("Indicador permitido clicado", {
          indicador: valor,
          classe,
        });
        if (isMobile()) fecharSidebarMobile();
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

  appLogInfo("Menu de indicadores montado com permissões", {
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

  appLogInfo("Toggle submenu executado", {
    submenuId: id,
    abertoFinal: !aberto,
  });
}

// ==========================
// ✅ SELECIONAR INDICADOR
// ✅ valida permissão antes de abrir
// ==========================
function selecionarIndicador(indicador) {
  const usuario = getUsuarioEfetivoApp();
  const classe = localStorage.getItem(STORAGE_KEYS.classeSelecionada) || "";

  if (!usuarioTemAcessoIndicadorApp(indicador, classe, usuario)) {
    appLogWarn("Usuário sem acesso ao indicador selecionado", {
      indicador,
      classe,
    });

    mostrarErro("Você não possui permissão para acessar este indicador.");
    return;
  }

  appLogInfo("Indicador autorizado", { indicador, classe });

  localStorage.setItem(STORAGE_KEYS.indicador, indicador);
  APP_STATE.indicadorAtivo = indicador;
  APP_STATE.classeAtiva = classe;
  APP_STATE.telaAtiva = "tabela";

  if (typeof window.carregarTabela === "function") {
    window.carregarTabela();
  } else {
    appLogError("carregarTabela não encontrada");
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
      appLogWarn("Supabase não inicializado ao testar conexão");
      return false;
    }

    const { error } = await supabaseClient.from("lojas").select("*").limit(1);

    if (error) {
      appLogWarn("Erro ao testar conexão", error);
      return false;
    }

    appLogInfo("Conexão com banco testada com sucesso");
    return true;
  } catch (erro) {
    appLogError("Falha ao testar conexão", erro);
    return false;
  }
}

// ==========================
// 📌 MENU LOG
// ==========================
function logMenu(acao) {
  appLogInfo("Menu clicado", { acao });
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

  appLogInfo("Tela ativa atualizada", {
    telaAtiva: APP_STATE.telaAtiva,
    indicadorAtivo: APP_STATE.indicadorAtivo,
    classeAtiva: APP_STATE.classeAtiva,
  });
}

// ==========================
// 🔄 ABRIR TELA INTERNA
// ✅ valida permissão de módulo
// ==========================
// ==========================
// 📊 ABRIR DASHBOARD COM SEGURANÇA
// ==========================
async function abrirDashboardComSeguranca() {
  try {
    if (window.DashboardBI?.garantirPronto) {
      await window.DashboardBI.garantirPronto();
    }

    if (typeof window.telaDashboard === "function") {
      await window.telaDashboard();
      return true;
    }

    appLogError("window.telaDashboard não encontrada");
    mostrarErro("Dashboard não carregado corretamente.");
    return false;
  } catch (erro) {
    appLogError("Falha ao abrir dashboard com segurança", erro);
    mostrarErro("Falha ao carregar o Dashboard.");
    return false;
  }
}
async function abrirTelaInterna(nomeTela, { silent = false } = {}) {
  try {
    if (!nomeTela) {
      appLogWarn("Tela não informada");
      return;
    }

    let telaNormalizada = nomeTela.toString().trim().toLowerCase();

    if (telaNormalizada === "ranking") telaNormalizada = "analises";
    if (telaNormalizada === "analise") telaNormalizada = "analises";

    const container = document.getElementById("conteudo");

    if (!container) {
      appLogError("#conteudo não encontrado");
      return;
    }

    appLogInfo("Abrindo tela", {
      tela: telaNormalizada,
      silent,
    });

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
        appLogError("abrirConfiguracoes não encontrada");
      }

      return;
    }

    // ======================
    // 📊 DASHBOARD
    // ======================
    if (telaNormalizada === "dashboard") {
      if (!usuarioPodeAbrirTelaApp("dashboard", usuario)) {
        appLogWarn("Acesso negado ao dashboard");
        definirTelaAtiva("dashboard");
        renderAcessoNegadoTela("Dashboard");
        return;
      }

      definirTelaAtiva("dashboard");

      await abrirDashboardComSeguranca();

      return;
    }

    // ======================
    // 📈 ANÁLISES
    // ======================
    if (telaNormalizada === "analises") {
      if (!usuarioPodeAbrirTelaApp("analises", usuario)) {
        appLogWarn("Acesso negado às análises");
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
        appLogWarn("Acesso negado aos comparativos");
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
    // 👑 PAINEL DE OURO
    // ======================
    if (telaNormalizada === "painel-ouro") {
      if (!usuarioPodeAbrirTelaApp("painel-ouro", usuario)) {
        appLogWarn("Acesso negado ao Painel de Ouro");
        definirTelaAtiva("painel-ouro");
        renderAcessoNegadoTela("Painel de Ouro");
        return;
      }

      definirTelaAtiva("painel-ouro");

      if (typeof window.telaPainelOuro === "function") {
        await window.telaPainelOuro();
      } else {
        container.innerHTML = `
          <div class="card-conteudo">
            <h2>👑 Painel de Ouro</h2>
            <p>Módulo do Painel de Ouro não carregado.</p>
          </div>
        `;
      }

      return;
    }

    // ======================
    // 📊 INDICADORES
    // ======================
    if (telaNormalizada === "indicadores") {
      appLogInfo("Indicadores (compatibilidade)");

      const indicadorAtual = localStorage.getItem(STORAGE_KEYS.indicador);
      const classeAtual = localStorage.getItem(STORAGE_KEYS.classeSelecionada);

      if (!indicadorAtual) {
        appLogWarn("Nenhum indicador selecionado");
        mostrarErro("Nenhum indicador foi selecionado.");
        return;
      }

      if (!usuarioTemAcessoIndicadorApp(indicadorAtual, classeAtual, usuario)) {
        appLogWarn("Acesso negado ao indicador pelo app", {
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
        appLogError("carregarTabela não encontrada");
        mostrarErro("Função carregarTabela não encontrada");
      }

      return;
    }

    appLogWarn("Tela não mapeada", { telaNormalizada });

    container.innerHTML = `
      <div class="card-conteudo">
        <h2>🚧 ${telaNormalizada}</h2>
        <p>Em desenvolvimento</p>
      </div>
    `;
  } catch (erro) {
    appLogError("Erro ao abrir tela", erro);

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
// 📱 SIDEBAR MOBILE
// ==========================
function isMobile() {
  return window.innerWidth <= 768;
}

function abrirSidebarMobile() {
  document.getElementById('sidebar')?.classList.add('sidebar-aberta');
  document.getElementById('sidebar-overlay')?.classList.add('ativa');
}

function fecharSidebarMobile() {
  document.getElementById('sidebar')?.classList.remove('sidebar-aberta');
  document.getElementById('sidebar-overlay')?.classList.remove('ativa');
}

// ==========================
// 🧭 CONTROLE DE TELAS
// ==========================
function mostrar(tela) {
  if (isMobile()) fecharSidebarMobile();
  abrirTelaInterna(tela, { silent: false });
}

// ==========================
// ⚙️ ABRIR MENU CONFIG
// ==========================
function abrirConfiguracoesMenu() {
  const user = getUsuarioLocal();

  if (!user) {
    appLogWarn("Usuário não encontrado");
    return;
  }

  appLogInfo("Acesso ao menu de configurações");
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
    appLogWarn("Falha ao avaliar edição ativa", erro);
    return false;
  }
}

async function sincronizarPerfilSilenciosamente() {
  try {
    if (typeof window.sincronizarUsuarioLocalDoBanco === "function") {
      appLogInfo("Sincronizando perfil local silenciosamente...");
      await window.sincronizarUsuarioLocalDoBanco();
      preencherUsuario();
      montarMenuIndicadores();
      aplicarPermissoesMenuPrincipal();
    }
  } catch (erro) {
    appLogWarn("Falha ao sincronizar perfil local silenciosamente", erro);
  }
}

async function atualizarTelaSilenciosamente() {
  if (APP_STATE.silentRefreshRunning) {
    appLogInfo("Atualização silenciosa já em andamento - ignorando ciclo");
    return;
  }

  if (window.dashboardModoApresentacao) {
    appLogInfo("Modo apresentação ativo - refresh silencioso bloqueado");
    return;
  }

  if (existeEdicaoAtivaNoConteudo()) {
    appLogInfo(
      "Usuário está interagindo com um campo - refresh silencioso adiado",
    );
    return;
  }

  APP_STATE.silentRefreshRunning = true;

  try {
    appLogInfo("Iniciando atualização silenciosa", {
      telaAtiva: APP_STATE.telaAtiva,
      horario: new Date().toLocaleTimeString("pt-BR"),
    });

    await sincronizarPerfilSilenciosamente();

    switch (APP_STATE.telaAtiva) {
      case "dashboard":
        appLogInfo(
          "Dashboard ativo - atualização silenciosa desabilitada para não atrapalhar apresentação",
        );
        break;

      case "analises":
        appLogInfo(
          "Análises ativa - atualização silenciosa desabilitada para não atrapalhar uso e apresentação",
        );
        break;

      case "comparativos":
        appLogInfo(
          "Comparativos ativo - atualização silenciosa desabilitada para não atrapalhar uso e apresentação",
        );
        break;

      case "tabela":
        if (typeof window.carregarTabela === "function") {
          await window.carregarTabela();
        }
        break;

      case "configuracoes":
        appLogInfo("Configurações ativa - refresh silencioso ignorado");
        break;

      default:
        appLogInfo("Nenhuma tela compatível com refresh silencioso", {
          telaAtiva: APP_STATE.telaAtiva,
        });
        break;
    }

    APP_STATE.ultimoSilentRefresh = new Date().toISOString();

    appLogInfo("Atualização silenciosa concluída");
  } catch (erro) {
    appLogError("Erro na atualização silenciosa", erro);
  } finally {
    APP_STATE.silentRefreshRunning = false;
  }
}

function iniciarAtualizacaoSilenciosa() {
  try {
    pararAtualizacaoSilenciosa();

    appLogInfo(
      `Iniciando atualização silenciosa automática a cada ${
        APP_STATE.silentRefreshMs / 1000
      }s`,
    );

    APP_STATE.silentRefreshTimer = setInterval(async () => {
      await atualizarTelaSilenciosamente();
    }, APP_STATE.silentRefreshMs);
  } catch (erro) {
    appLogError("Falha ao iniciar atualização silenciosa", erro);
  }
}

function pararAtualizacaoSilenciosa() {
  if (APP_STATE.silentRefreshTimer) {
    clearInterval(APP_STATE.silentRefreshTimer);
    APP_STATE.silentRefreshTimer = null;
    appLogInfo("Atualização silenciosa parada");
  }
}

// ==========================
// 👀 VISIBILIDADE DA ABA
// ==========================
document.addEventListener("visibilitychange", async () => {
  try {
    if (document.hidden) {
      appLogInfo("Aba oculta - mantendo timer, mas sem refresh imediato");
      return;
    }

    appLogInfo("Aba voltou ao foco - disparando refresh silencioso");
    await atualizarTelaSilenciosamente();
  } catch (erro) {
    appLogError("Erro no visibilitychange do app", erro);
  }
});

// ==========================
// 🚀 INIT APP
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  appLogInfo("Sistema iniciado");

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

  appLogInfo("Semana inicial forçada para a semana atual", { semanaAtual });

  // 6) carrega sidebar
  await carregarSidebar();

  // hambúrguer mobile
  document.getElementById('btn-hamburger')?.addEventListener('click', abrirSidebarMobile);
  document.getElementById('sidebar-overlay')?.addEventListener('click', fecharSidebarMobile);

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

  appLogInfo("Tela inicial permitida resolvida", { telaInicialPermitida });

  if (telaInicialPermitida === "indicadores") {
    await abrirTelaInterna("indicadores", { silent: false });
  } else {
    await abrirTelaInterna(telaInicialPermitida, { silent: false });
  }
});

// ==========================
// 🔄 SINCRONIZAR PERFIL LOCAL DO BANCO
// chamada pelo salvarPermissoes e pelo silent refresh
// ==========================
async function sincronizarUsuarioLocalDoBanco() {
  try {
    const usuarioAtual = getUsuarioLocal();

    if (!usuarioAtual?.auth_user_id) {
      appLogWarn("sincronizarUsuarioLocalDoBanco: sem auth_user_id no local");
      return;
    }

    const { data, error } = await window.db
      .from("usuarios")
      .select("*")
      .eq("auth_user_id", usuarioAtual.auth_user_id)
      .single();

    if (error || !data) {
      appLogWarn("sincronizarUsuarioLocalDoBanco: perfil não encontrado", error);
      return;
    }

    const usuarioAtualizado = montarUsuarioLocalAPartirDoPerfil(data);
    setUsuarioLocal(usuarioAtualizado);

    appLogInfo("Perfil sincronizado do banco com sucesso", {
      email: usuarioAtualizado.email,
      perfil: usuarioAtualizado.perfil,
    });
  } catch (erro) {
    appLogError("Erro ao sincronizar usuário local do banco", erro);
  }
}

// ==========================
// 🌐 EXPOR FUNÇÕES
// ==========================
window.getUsuarioLocal = getUsuarioLocal;
window.setUsuarioLocal = setUsuarioLocal;
window.sincronizarUsuarioLocalDoBanco = sincronizarUsuarioLocalDoBanco;
window.limparSessaoLocal = limparSessaoLocal;

window.initSupabase = initSupabase;
window.verificarSessao = verificarSessao;
window.garantirPerfilLocal = garantirPerfilLocal;
window.logout = logout;

window.mostrar = mostrar;
window.abrirSidebarMobile = abrirSidebarMobile;
window.fecharSidebarMobile = fecharSidebarMobile;
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

window.normalizarTextoApp = normalizarTextoApp;
window.normalizarTextoAppUpper = normalizarTextoAppUpper;
window.normalizarTextoAppLower = normalizarTextoAppLower;
window.normalizarListaRegionaisApp = normalizarListaRegionaisApp;

// ==========================
// ✅ LOG FINAL DE BOOTSTRAP
// ==========================
appLogInfo("app.js pronto", {
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