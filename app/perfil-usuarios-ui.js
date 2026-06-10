console.log("✅ perfil-usuarios-ui.js carregado");

// ==========================
// 🔐 SUPABASE ADMIN (service_role)
// ⚠️ Substitua pelo valor em: Supabase → Settings → API → service_role (secret)
// ==========================
const SUPABASE_ADMIN_URL = "https://fnsplftfxvmyiqbigobh.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc3BsZnRmeHZteWlxYmlnb2JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTg1NjI1NywiZXhwIjoyMDk1NDMyMjU3fQ.IZWbY4WPJ6DAsEhseatEeFj9UrYIWcv2Lc4BT_VWJqE";

function getSupabaseAdmin() {
  if (!window.supabase?.createClient) throw new Error("supabase.js não carregado");
  return window.supabase.createClient(SUPABASE_ADMIN_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function gerarSenhaAleatoria(tamanho = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
  const arr = new Uint8Array(tamanho);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => chars[b % chars.length]).join("");
}

async function criarAuthUser(email, senha) {
  const { data, error } = await getSupabaseAdmin().auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

async function deletarAuthUser(authUserId) {
  try {
    await getSupabaseAdmin().auth.admin.deleteUser(authUserId);
    console.log("🗑️ Auth user removido no rollback:", authUserId);
  } catch (e) {
    console.warn("⚠️ Rollback do Auth falhou:", e);
  }
}

function copiarSenhaGerada() {
  const senha = window._senhaGeradaAtual || "";
  if (!senha) return;
  navigator.clipboard.writeText(senha).then(() => {
    const btn = document.querySelector(".btn-copiar-senha");
    if (btn) {
      btn.textContent = "✅ Copiado!";
      setTimeout(() => { btn.textContent = "📋 Copiar senha"; }, 2000);
    }
  }).catch(() => {
    const el = document.getElementById("senhaGeradaValor");
    if (el) {
      const range = document.createRange();
      range.selectNode(el);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
  });
}

// ==========================
// 🧪 VALIDAÇÃO DE DEPENDÊNCIAS
// ==========================
(function validarDependenciasPerfilUsuariosUI() {
  const obrigatorias = [
    "normalizarTexto",
    "normalizarTextoLower",
    "normalizarListaRegionais",
    "listaRegionaisParaTexto",
    "getUsuarioLogado",
    "getPermissoesBasePorPerfil",
    "getPermissoesSistemaUsuario",
    "normalizarPermissaoVisualizacao",
  ];

  const faltando = obrigatorias.filter(
    (nome) => typeof window[nome] !== "function"
  );

  if (faltando.length) {
    console.error(
      "❌ perfil-usuarios-ui.js sem dependências obrigatórias:",
      faltando
    );
  } else {
    console.log("✅ Dependências de perfil-usuarios-ui.js OK");
  }
})();

// ==========================
// 🛡️ HELPERS GERAIS UI
// ==========================
function escapeHtml(valor) {
  return (valor ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getConfigConteudoEl() {
  return document.getElementById("config-conteudo");
}

function getConteudoEl() {
  return document.getElementById("conteudo");
}

function getWindowDb() {
  if (!window.db) {
    console.error("❌ window.db não encontrado");
    throw new Error("Conexão com banco não inicializada.");
  }
  return window.db;
}

function setUsuarioLocalSeguro(usuario) {
  try {
    if (typeof window.setUsuarioLocal === "function") {
      window.setUsuarioLocal(usuario);
    } else {
      localStorage.setItem("usuario", JSON.stringify(usuario));
    }
  } catch (erro) {
    console.warn("⚠️ Falha ao atualizar storage do usuário:", erro);
  }
}

function getAcaoLogsConfiguracoes() {
  if (typeof window.abrirLogsSistema === "function") return "abrirLogsSistema";
  if (typeof window.abrirAuditoria === "function") return "abrirAuditoria";
  return "";
}

// ==========================
// 💾 AUTOSAVE - STATUS VISUAL
// ==========================
function mostrarStatusAutosaveUsuario(msg, tipo = "info") {
  const el = document.getElementById("status-autosave-usuario");
  if (!el) {
    console.warn("⚠️ status-autosave-usuario não encontrado");
    return;
  }

  el.textContent = msg;
  el.className = `status-autosave ${tipo}`;
}

// ==========================
// 🔢 EXTRAIR CÓDIGO DA LOJA
// mantido por compatibilidade
// ==========================
function extrairCodigoDaLojaVinculada(texto) {
  const valor = (texto || "").toString().trim();
  if (!valor) return "";

  const match = valor.match(/^(\d+)/);
  return match ? match[1] : "";
}

// ==========================
// 🏬 BUSCAR LOJAS PARA VÍNCULO
// mantido por compatibilidade / uso futuro
// ==========================
async function buscarLojasParaVinculo() {
  try {
    const db = getWindowDb();

    const { data, error } = await db
      .from("lojas")
      .select("*")
      .order("codigo");

    if (error) throw error;

    console.log("🏬 Lojas carregadas para vínculo:", data?.length || 0);
    return data || [];
  } catch (erro) {
    console.error("❌ Erro ao buscar lojas para vínculo:", erro);
    return [];
  }
}

// ==========================
// 🌍 REGIONAIS DISPONÍVEIS
// mantido por compatibilidade / uso futuro
// ==========================
async function buscarRegionaisDisponiveis() {
  const lojas = await buscarLojasParaVinculo();

  const set = new Set();
  lojas.forEach((l) => {
    if (l.regional) set.add(normalizarTexto(l.regional));
  });

  const resultado = [...set].sort();
  console.log("🌍 Regionais disponíveis:", resultado);

  return resultado;
}

// ==========================
// 🌍 NORMALIZAR REGIONAIS NO CADASTRO
// mantido por compatibilidade
// ==========================
function normalizarRegionaisCadastro(valor) {
  if (!valor) return [];

  return valor
    .split(",")
    .map((v) => normalizarTexto(v))
    .filter(Boolean);
}

// ==========================
// 🏬 BUSCAR LOJA POR CÓDIGO
// mantido por compatibilidade
// ==========================
async function buscarLojaPorCodigoCadastro(lojaCodigo) {
  try {
    const db = getWindowDb();

    const codigo = (lojaCodigo || "").toString().trim();
    if (!codigo) return null;

    const { data, error } = await db
      .from("lojas")
      .select("*")
      .eq("codigo", codigo)
      .single();

    if (error || !data) {
      console.warn("⚠️ Loja não encontrada no cadastro:", error);
      return null;
    }

    console.log("🏬 Loja encontrada por código:", data);
    return data;
  } catch (erro) {
    console.error("❌ Erro ao buscar loja no cadastro:", erro);
    return null;
  }
}

// ==========================
// 🏬 RESOLVER VÍNCULO AUTOMÁTICO
// ✅ NOVO MODELO: vínculo neutralizado
// ==========================
async function resolverVinculoAutomaticoUsuario({
  loja_codigo,
  regional_vinculada,
  regionais_vinculadas,
  perfil,
}) {
  const perfilNorm = normalizarTextoLower(perfil || "usuario");

  const resultado = {
    tipo_visao: "regional",
    loja_codigo: null,
    loja_vinculada: null,
    regional_vinculada: null,
    regionais_vinculadas: [],
  };

  console.log("🧩 Vínculo automático neutralizado para novo modelo:", {
    perfilNorm,
    entrada: {
      loja_codigo,
      regional_vinculada,
      regionais_vinculadas,
    },
    resultado,
  });

  return resultado;
}

// ==========================
// ⚙️ ABRIR CONFIGURAÇÕES
// ==========================
function abrirConfiguracoes() {
  console.log("⚙️ Abrindo Configurações");

  const user = getUsuarioLogado();
  if (!user) {
    console.warn("⚠️ abrirConfiguracoes sem usuário logado");
    return;
  }

  const isMaster = user.perfil === "master";
  const isAdmin = user.perfil === "admin";
  const podeGerenciarUsuarios = user.pode_gerenciar_usuarios === true;
  const acaoLogs = getAcaoLogsConfiguracoes();

  const conteudo = getConteudoEl();
  if (!conteudo) {
    console.error("❌ #conteudo não encontrado");
    return;
  }

  conteudo.innerHTML = `
    <div class="pagina-container">
      <div class="card-conteudo">

        <div class="header-tabela">
          <h2>⚙️ Configurações</h2>
        </div>

        <div class="config-grid">
          <button onclick="abrirAlterarSenha()">🔑 Alterar senha</button>

          ${
            podeGerenciarUsuarios
              ? `
                <button onclick="novoUsuario()">➕ Novo usuário</button>
                <button onclick="abrirTelaPermissoes()">🎯 Permissões</button>
              `
              : ""
          }

          ${
            isMaster || isAdmin
              ? acaoLogs
                ? `<button onclick="${acaoLogs}()">📋 Logs do Sistema</button>`
                : `<button type="button" disabled title="Tela de logs não disponível">📋 Logs do Sistema</button>`
              : ""
          }
        </div>

        <div id="config-conteudo" style="margin-top:20px;"></div>

      </div>
    </div>
  `;

  console.log("✅ Tela de configurações renderizada");
}

// ==========================
// ✏️ EDITAR DADOS DO USUÁRIO
// ==========================
function editarDadosUsuario() {
  const user = getUsuarioLogado();
  const container = getConfigConteudoEl();

  if (!user || !container) {
    console.warn("⚠️ editarDadosUsuario sem usuário ou container");
    return;
  }

  container.innerHTML = `
    <div class="config-box">

      <h3>✏️ Editar Dados</h3>

      <input id="edit_nome" value="${escapeHtml(user.nome || "")}"><br><br>
      <input id="edit_matricula" value="${escapeHtml(user.matricula || "")}"><br><br>
      <input id="edit_email" value="${escapeHtml(user.email || "")}"><br><br>
      <input id="edit_funcao" value="${escapeHtml(user.funcao || "")}"><br><br>

      <button class="btn-salvar" onclick="salvarDadosUsuario()">
        ✅ Salvar Alterações
      </button>

    </div>
  `;

  console.log("✏️ Tela de edição de dados do usuário renderizada");
}

// ==========================
// 💾 SALVAR DADOS DO USUÁRIO
// ==========================
async function salvarDadosUsuario() {
  const nome = document.getElementById("edit_nome")?.value.trim();
  const matricula = document.getElementById("edit_matricula")?.value.trim();
  const email = document.getElementById("edit_email")?.value.trim();
  const funcao = document.getElementById("edit_funcao")?.value.trim();

  const user = getUsuarioLogado();
  if (!user) {
    alert("❌ Usuário não encontrado.");
    return;
  }

  if (!nome || !matricula || !email || !funcao) {
    alert("⚠️ Preencha nome, matrícula, e-mail e função.");
    return;
  }

  try {
    const db = getWindowDb();

    const { error } = await db
      .from("usuarios")
      .update({
        nome,
        matricula,
        email,
        funcao,
      })
      .eq("id", user.id);

    if (error) throw error;

    alert("✅ Dados atualizados!");

    const atualizado = {
      ...user,
      nome,
      matricula,
      email,
      funcao,
    };

    setUsuarioLocalSeguro(atualizado);

    if (typeof window.registrarEventoSistema === "function") {
      await window.registrarEventoSistema({
        tipo_evento: "usuario",
        modulo: "Configurações",
        acao: "atualizou dados cadastrais",
        usuario_alvo: nome,
        perfil_alvo: user.perfil,
        autenticacao: "sessao_propria",
        status: "sucesso",
        contexto: {
          matricula,
          email,
          funcao,
        },
      });
    }

    abrirAlterarSenha();
  } catch (erro) {
    console.error("❌ erro ao salvar dados do usuário:", erro);
    alert("Erro ao salvar");
  }
}

// ==========================
// 🔑 ALTERAR SENHA
// ==========================
function abrirAlterarSenha() {
  const user = getUsuarioLogado();
  const container = getConfigConteudoEl();

  if (!user || !container) {
    console.warn("⚠️ abrirAlterarSenha sem usuário ou container");
    return;
  }

  container.innerHTML = `
    <div class="config-flex">

      <div class="config-box">
        <h3>👤 Dados do Usuário</h3>

        <p><b>Nome:</b> <span id="info_nome">${escapeHtml(user.nome || "-")}</span></p>
        <p><b>Matrícula:</b> <span id="info_matricula">${escapeHtml(user.matricula || "-")}</span></p>
        <p><b>E-mail:</b> <span id="info_email">${escapeHtml(user.email || "-")}</span></p>
        <p><b>Função:</b> <span id="info_funcao">${escapeHtml(
          user.funcao || user.perfil || "-"
        )}</span></p>

        <br>

        <button onclick="editarDadosUsuario()" class="btn-salvar">
          ✏️ Editar dados
        </button>
      </div>

      <div class="config-box">
        <h3>🔑 Alterar Senha</h3>

        <div id="status-senha" class="status-autosave neutro">
          ℹ️ Informe a senha atual e a nova senha.
        </div>

        <input id="senhaAtual" type="password" placeholder="Senha atual" autocomplete="current-password"><br><br>
        <input id="novaSenha" type="password" placeholder="Nova senha (mín. 6 caracteres)" autocomplete="new-password"><br><br>
        <input id="confirmarSenha" type="password" placeholder="Confirmar nova senha" autocomplete="new-password"><br><br>

        <button class="btn-salvar" onclick="salvarSenha()">
          ✅ Salvar Senha
        </button>
      </div>

    </div>
  `;

  // dispara o salvamento automaticamente quando os 3 campos estão preenchidos
  const dispararSeCompleto = () => {
    const a = document.getElementById("senhaAtual")?.value || "";
    const n = document.getElementById("novaSenha")?.value || "";
    const c = document.getElementById("confirmarSenha")?.value || "";
    if (a && n.length >= 6 && c && n === c) {
      salvarSenha();
    }
  };
  const elConfirmar = document.getElementById("confirmarSenha");
  if (elConfirmar) {
    elConfirmar.addEventListener("change", dispararSeCompleto);
    elConfirmar.addEventListener("keyup", (e) => {
      if (e.key === "Enter") dispararSeCompleto();
    });
  }

  console.log("🔑 Tela de alteração de senha renderizada");
}

// ==========================
// 💾 SALVAR SENHA (real, via Supabase Auth)
// ==========================
let _salvandoSenha = false;

function setStatusSenha(msg, tipo = "info") {
  const el = document.getElementById("status-senha");
  if (el) {
    el.textContent = msg;
    el.className = "status-autosave " + tipo;
  }
}

async function salvarSenha() {
  if (_salvandoSenha) return;

  const atual = document.getElementById("senhaAtual")?.value || "";
  const nova = document.getElementById("novaSenha")?.value || "";
  const confirmar = document.getElementById("confirmarSenha")?.value || "";

  // validações
  if (!atual || !nova || !confirmar) {
    setStatusSenha("⚠️ Preencha a senha atual, a nova e a confirmação.", "erro");
    return;
  }
  if (nova.length < 6) {
    setStatusSenha("⚠️ A nova senha precisa ter ao menos 6 caracteres.", "erro");
    return;
  }
  if (nova !== confirmar) {
    setStatusSenha("⚠️ A nova senha e a confirmação não conferem.", "erro");
    return;
  }
  if (nova === atual) {
    setStatusSenha("⚠️ A nova senha deve ser diferente da atual.", "erro");
    return;
  }

  const user = getUsuarioLogado();
  const email = user?.email;
  if (!email) {
    setStatusSenha("❌ Não foi possível identificar seu e-mail.", "erro");
    return;
  }

  const db = getWindowDb();
  if (!db?.auth) {
    setStatusSenha("❌ Conexão de autenticação indisponível.", "erro");
    return;
  }

  _salvandoSenha = true;
  setStatusSenha("⏳ Verificando senha atual...", "info");

  try {
    // 1) confirma que a senha atual está correta (re-autentica)
    const { error: errLogin } = await db.auth.signInWithPassword({
      email,
      password: atual,
    });
    if (errLogin) {
      setStatusSenha("❌ Senha atual incorreta.", "erro");
      _salvandoSenha = false;
      return;
    }

    // 2) atualiza para a nova senha
    setStatusSenha("⏳ Atualizando senha...", "info");
    const { error: errUpd } = await db.auth.updateUser({ password: nova });
    if (errUpd) {
      setStatusSenha("❌ Erro ao atualizar: " + (errUpd.message || "tente novamente"), "erro");
      _salvandoSenha = false;
      return;
    }

    // limpa os campos e confirma
    ["senhaAtual", "novaSenha", "confirmarSenha"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    setStatusSenha("✅ Senha alterada com sucesso!", "sucesso");
  } catch (e) {
    console.error("❌ Erro ao salvar senha:", e);
    setStatusSenha("❌ Erro inesperado ao alterar a senha.", "erro");
  } finally {
    _salvandoSenha = false;
  }
}

// ==========================
// ➕ NOVO USUÁRIO (MANUAL)
// ✅ NOVO MODELO: sem campos de bloqueio por loja/regional
// ==========================
function novoUsuario() {
  console.log("➕ Novo Usuário (novo modelo sem vínculo de loja/regional)");

  const user = getUsuarioLogado();
  const container = getConfigConteudoEl();

  if (!user || !container) {
    console.warn("⚠️ novoUsuario sem usuário ou container");
    return;
  }

  const isMaster = user.perfil === "master";

  container.innerHTML = `
    <div class="card-conteudo">

      <h3>➕ Novo Usuário</h3>

      <div class="form-grid">

        <div class="campo">
          <label>Nome *</label>
          <input id="novo_nome" placeholder="Digite o nome">
        </div>

        <div class="campo">
          <label>Matrícula *</label>
          <input id="novo_matricula" placeholder="Digite a matrícula">
        </div>

        <div class="campo">
          <label>E-mail *</label>
          <input id="novo_email" placeholder="Digite o e-mail usado no Auth">
        </div>

        <div class="campo">
          <label>Função *</label>
          <input id="novo_funcao" placeholder="Ex.: Gerente, Subgerente, Consultor Regional">
        </div>

        ${
          isMaster
            ? `
              <div class="campo">
                <label>Perfil *</label>
                <select id="novo_perfil">
                  <option value="usuario">usuario</option>
                  <option value="admin">admin</option>
                  <option value="master">master</option>
                </select>
              </div>
            `
            : `
              <input type="hidden" id="novo_perfil" value="usuario">
            `
        }

      </div>

      <div class="acoes">
        <button class="btn-salvar" onclick="salvarNovoUsuario()">
          ✅ Criar Usuário
        </button>
      </div>

      <div id="resultado-novo-usuario" style="margin-top:15px;"></div>

    </div>
  `;

  console.log("➕ Tela de novo usuário renderizada (sem vínculo)");
}

// ==========================
// 💾 SALVAR NOVO USUÁRIO
// Cria automaticamente no Supabase Auth e na tabela usuarios
// ==========================
async function salvarNovoUsuario() {
  const nome = document.getElementById("novo_nome")?.value.trim();
  const matricula = document.getElementById("novo_matricula")?.value.trim();
  const email = document.getElementById("novo_email")?.value.trim().toLowerCase();
  const funcao = document.getElementById("novo_funcao")?.value.trim();
  const perfil = document.getElementById("novo_perfil")?.value?.trim() || "usuario";
  const resultadoEl = document.getElementById("resultado-novo-usuario");

  console.log("💾 Criando usuário...", { nome, matricula, email, funcao, perfil });

  if (!nome || !matricula || !email || !funcao) {
    if (resultadoEl) resultadoEl.innerHTML = `<div class="msg-erro">⚠️ Nome, matrícula, e-mail e função são obrigatórios.</div>`;
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    if (resultadoEl) resultadoEl.innerHTML = `<div class="msg-erro">⚠️ Informe um e-mail válido. Ex.: usuario@empresa.com</div>`;
    return;
  }

  try {
    const db = getWindowDb();

    if (resultadoEl) resultadoEl.innerHTML = `<div class="msg-sucesso">🔄 Verificando dados...</div>`;

    const { data: existenteEmail, error: erroEmail } = await db
      .from("usuarios").select("id, email").ilike("email", email).maybeSingle();
    if (erroEmail) throw erroEmail;
    if (existenteEmail) {
      if (resultadoEl) resultadoEl.innerHTML = `<div class="msg-erro">❌ Já existe um usuário cadastrado com este e-mail.</div>`;
      return;
    }

    const { data: existenteMatricula, error: erroMatricula } = await db
      .from("usuarios").select("id, matricula").eq("matricula", matricula).maybeSingle();
    if (erroMatricula) throw erroMatricula;
    if (existenteMatricula) {
      if (resultadoEl) resultadoEl.innerHTML = `<div class="msg-erro">❌ Já existe um usuário cadastrado com esta matrícula.</div>`;
      return;
    }

    if (resultadoEl) resultadoEl.innerHTML = `<div class="msg-sucesso">🔄 Criando acesso no sistema de autenticação...</div>`;

    // Gerar senha aleatória e criar usuário no Auth
    const senhaGerada = gerarSenhaAleatoria();
    const authUser = await criarAuthUser(email, senhaGerada);

    if (resultadoEl) resultadoEl.innerHTML = `<div class="msg-sucesso">🔄 Registrando usuário no sistema...</div>`;

    const permissoesBase = getPermissoesBasePorPerfil(perfil);

    const payload = {
      auth_user_id: authUser.id,
      nome,
      sobrenome: "",
      matricula,
      email,
      funcao,
      perfil,
      tipo_visao: "regional",
      loja_codigo: null,
      loja_vinculada: null,
      regional_vinculada: null,
      regionais_vinculadas: [],
      primeiro_acesso: true,
      permissoes: {
        indicadores: [],
        classes: [],
        subclasses: [],
        acesso_total: perfil === "master",
        ignorar_loja_vinculada: true,
        permissao_visualizacao: perfil === "usuario" ? "NENHUMA" : permissoesBase.permissao_visualizacao || "TODOS",
        ...permissoesBase,
      },
    };

    console.log("📦 Payload do novo usuário:", payload);

    const { data, error } = await db.from("usuarios").insert([payload]).select("*").single();

    if (error) {
      // Rollback: remove o Auth user se a inserção na tabela falhou
      await deletarAuthUser(authUser.id);
      throw error;
    }

    console.log("✅ Usuário criado com sucesso:", data);

    if (typeof window.registrarEventoSistema === "function") {
      try {
        await window.registrarEventoSistema({
          tipo_evento: "usuario",
          modulo: "Configurações",
          acao: "criou usuário com auth automático",
          usuario_alvo: nome,
          perfil_alvo: perfil,
          autenticacao: "sessao_propria",
          status: "sucesso",
          contexto: { email, matricula, funcao },
        });
      } catch (erroLog) {
        console.warn("⚠️ Log do novo usuário falhou:", erroLog);
      }
    }

    // Guardar senha no window para o botão copiar
    window._senhaGeradaAtual = senhaGerada;

    if (resultadoEl) {
      resultadoEl.innerHTML = `
        <div class="msg-sucesso">
          <strong>✅ Usuário criado com sucesso!</strong><br><br>
          <div><b>Nome:</b> ${escapeHtml(data.nome)}</div>
          <div><b>E-mail:</b> ${escapeHtml(data.email)}</div>
          <div><b>Matrícula:</b> ${escapeHtml(data.matricula)}</div>
          <div><b>Função:</b> ${escapeHtml(data.funcao)}</div>
          <div><b>Perfil:</b> ${escapeHtml(data.perfil)}</div>
        </div>

        <div class="senha-gerada-box">
          <div class="senha-gerada-titulo">🔑 Senha gerada automaticamente</div>
          <div class="senha-gerada-valor" id="senhaGeradaValor">${escapeHtml(senhaGerada)}</div>
          <button class="btn-copiar-senha" onclick="copiarSenhaGerada()">📋 Copiar senha</button>
          <div class="senha-gerada-aviso">⚠️ Salve esta senha agora — ela não será exibida novamente.</div>
        </div>
      `;
    }

    document.getElementById("novo_nome").value = "";
    document.getElementById("novo_matricula").value = "";
    document.getElementById("novo_email").value = "";
    document.getElementById("novo_funcao").value = "";

  } catch (erro) {
    console.error("❌ Erro ao criar usuário:", erro);
    const mensagem = erro?.message || "Erro ao criar usuário no sistema.";
    if (resultadoEl) resultadoEl.innerHTML = `<div class="msg-erro">❌ ${escapeHtml(mensagem)}</div>`;
  }
}

// ==========================
// 🎯 ABRIR TELA DE PERMISSÕES
// ==========================
function abrirTelaPermissoes() {
  console.log("🎯 Abrindo Permissões");

  const container = getConfigConteudoEl();

  if (!container) {
    console.error("❌ config-conteudo não encontrado");
    return;
  }

  container.innerHTML = `
    <div class="card-conteudo">
      <div class="header-tabela">
        <h3>🎯 Permissões de Usuários</h3>
      </div>

      <div id="lista-permissoes">
        <p>Carregando usuários...</p>
      </div>
    </div>
  `;

  carregarUsuariosPermissoes();
}

// ==========================
// 🧩 HELPERS DE CLASSE / SUBCLASSE
// ==========================
const SEPARADOR_SUBCLASSE = "___SUB___";

function getTokenSubclasse(classe, subclasse) {
  return `${normalizarTexto(classe)}${SEPARADOR_SUBCLASSE}${normalizarTexto(
    subclasse || "GERAL"
  )}`;
}

function quebrarTokenSubclasse(token) {
  const valor = (token || "").toString();
  const partes = valor.split(SEPARADOR_SUBCLASSE);

  return {
    classe: partes[0] || "",
    subclasse: partes[1] || "GERAL",
  };
}

function getMetaIndicadorPermissao(indicador) {
  const mapa = window.mapaClasse || {};
  const bruto = mapa[indicador] || mapa[normalizarTexto(indicador)] || null;

  if (!bruto) {
    return {
      classe: "SEM CLASSE",
      subclasse: "GERAL",
    };
  }

  if (typeof bruto === "string") {
    return {
      classe: bruto,
      subclasse: "GERAL",
    };
  }

  return {
    classe: bruto.classe || "SEM CLASSE",
    subclasse: bruto.subclasse || "GERAL",
  };
}

function agruparIndicadoresPermissao() {
  const mapa = window.mapaClasse || {};
  const estrutura = {};

  Object.keys(mapa).forEach((indicador) => {
    const meta = getMetaIndicadorPermissao(indicador);
    const classe = meta.classe || "SEM CLASSE";
    const subclasse = meta.subclasse || "GERAL";

    if (!estrutura[classe]) {
      estrutura[classe] = {};
    }

    if (!estrutura[classe][subclasse]) {
      estrutura[classe][subclasse] = [];
    }

    if (!estrutura[classe][subclasse].includes(indicador)) {
      estrutura[classe][subclasse].push(indicador);
    }
  });

  console.log("🧩 Indicadores agrupados para permissões:", estrutura);
  return estrutura;
}

function classeTemSubclassesReais(submapa = {}) {
  const chaves = Object.keys(submapa || {});
  if (!chaves.length) return false;

  return chaves.some((nome) => normalizarTexto(nome) !== "GERAL");
}

// ==========================
// 🧾 RESUMO DE PERMISSÕES
// ==========================
function resumoPermissoesUsuario(usuario) {
  if (!usuario) return `<span class="perm-vazia">Sem dados</span>`;

  const perfil = normalizarTextoLower(usuario.perfil);
  const permissoesSistema = getPermissoesSistemaUsuario(usuario);

  const tags = [];

  if (perfil === "master") {
    tags.push(`<span class="perm-tag perm-master">Master total</span>`);
  }

  if (permissoesSistema.pode_editar_qualquer_semana) {
    tags.push(`<span class="perm-tag perm-edicao">Qualquer semana</span>`);
  } else if (permissoesSistema.pode_editar_semana_anterior) {
    tags.push(`<span class="perm-tag perm-edicao">Semana atual + anteriores</span>`);
  } else if (permissoesSistema.pode_editar_semana_atual) {
    tags.push(`<span class="perm-tag perm-edicao">Semana atual</span>`);
  }

  if (permissoesSistema.pode_gerenciar_usuarios) {
    tags.push(`<span class="perm-tag perm-admin">Gerencia usuários</span>`);
  }

  if (usuario?.permissoes?.ignorar_loja_vinculada === true) {
    tags.push(`<span class="perm-tag perm-escopo">Ignora loja vinculada</span>`);
  }

  if (permissoesSistema.permissao_visualizacao === "NENHUMA") {
    tags.push(`<span class="perm-tag perm-escopo">Visualização: Nenhuma</span>`);
  } else if (permissoesSistema.permissao_visualizacao === "NE1_NE2") {
    tags.push(`<span class="perm-tag perm-escopo">Visualização: NE1 e NE2</span>`);
  } else if (permissoesSistema.permissao_visualizacao === "NE1") {
    tags.push(`<span class="perm-tag perm-escopo">Visualização: NE1</span>`);
  } else if (permissoesSistema.permissao_visualizacao === "NE2") {
    tags.push(`<span class="perm-tag perm-escopo">Visualização: NE2</span>`);
  } else if (
    permissoesSistema.permissao_visualizacao === "REGIONAL_CONFIGURADA"
  ) {
    tags.push(
      `<span class="perm-tag perm-escopo">Visualização: Regional configurada</span>`
    );
  } else {
    tags.push(`<span class="perm-tag perm-escopo">Visualização: Todos</span>`);
  }

  const permissoes = usuario.permissoes || {};
  const indicadores = (permissoes.indicadores || []).map(normalizarTexto);
  const classes = (permissoes.classes || []).map(normalizarTexto);
  const subclasses = (permissoes.subclasses || []).map(normalizarTexto);

  if (
    permissoes.acesso_total === true ||
    indicadores.includes("TODAS") ||
    indicadores.includes("TODAS AS TABELAS") ||
    indicadores.includes("TODOS OS INDICADORES")
  ) {
    tags.push(`<span class="perm-tag perm-acesso">Todos os indicadores</span>`);
  } else {
    classes.slice(0, 2).forEach((item) => {
      tags.push(
        `<span class="perm-tag perm-acesso">${escapeHtml(item)} completo</span>`
      );
    });

    subclasses.slice(0, 2).forEach((token) => {
      const meta = quebrarTokenSubclasse(token);
      tags.push(
        `<span class="perm-tag perm-acesso">${escapeHtml(meta.classe)} / ${escapeHtml(
          meta.subclasse
        )}</span>`
      );
    });

    indicadores.slice(0, 3).forEach((item) => {
      tags.push(`<span class="perm-tag perm-acesso">${escapeHtml(item)}</span>`);
    });

    const totalItens = classes.length + subclasses.length + indicadores.length;
    if (totalItens > 7) {
      tags.push(`<span class="perm-tag">+ mais</span>`);
    }
  }

  if (!tags.length) {
    return `<span class="perm-vazia">Sem permissões definidas</span>`;
  }

  return tags.join("");
}

// ==========================
// 🔐 REGRA DE EDIÇÃO DE USUÁRIOS
// ==========================
function podeGerenciarUsuarioAlvo(alvo) {
  const user = getUsuarioLogado();
  if (!user || !alvo) return false;

  if (user.perfil === "master") return true;

  if (user.perfil === "admin") {
    if (alvo.perfil === "master") return false;
    if (alvo.perfil === "usuario") return true;
    if (alvo.perfil === "admin" && String(alvo.id) === String(user.id)) {
      return true;
    }
    return false;
  }

  return false;
}

// ==========================
// 📋 CARREGAR LISTA DE PERMISSÕES
// ==========================
async function carregarUsuariosPermissoes() {
  console.log("🔄 Buscando usuários para permissões...");

  const container = document.getElementById("lista-permissoes");

  if (!container) {
    console.error("❌ lista-permissoes não encontrado");
    return;
  }

  try {
    const db = getWindowDb();

    const { data, error } = await db
      .from("usuarios")
      .select("*")
      .order("nome");

    if (error) throw error;

    let html = `
      <div class="tabela-container">
        <table class="tabela tabela-permissoes">
          <thead>
            <tr>
              <th class="col-nome">Nome</th>
              <th class="col-perfil">Perfil</th>
              <th class="col-permissoes">Permissões atuais</th>
              <th class="col-acao">Ação</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((u) => {
      const podeEditarUsuario = podeGerenciarUsuarioAlvo(u);

      let badgePerfil = `<span class="badge-perfil badge-user">${escapeHtml(
        u.perfil
      )}</span>`;

      if (u.perfil === "master") {
        badgePerfil = `<span class="badge-perfil badge-master">master</span>`;
      }

      if (u.perfil === "admin") {
        badgePerfil = `<span class="badge-perfil badge-admin">admin</span>`;
      }

      if (u.perfil === "usuario") {
        badgePerfil = `<span class="badge-perfil badge-user">usuario</span>`;
      }

      html += `
        <tr>
          <td class="nome-usuario">${escapeHtml(u.nome || "-")}</td>

          <td class="perfil-cell">
            ${badgePerfil}
          </td>

          <td class="permissoes-cell">
            ${resumoPermissoesUsuario(u)}
          </td>

          <td class="acao-cell">
            ${
              podeEditarUsuario
                ? `<button class="btn-acao" onclick="editarPermissoes('${escapeHtml(
                    u.id
                  )}')">⚙️</button>`
                : `<span class="acao-bloqueada">🔒</span>`
            }
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;

    console.log("✅ Lista de permissões carregada:", data.length);
  } catch (erro) {
    console.error("❌ erro ao carregar permissões:", erro);

    container.innerHTML = `
      <div class="card-conteudo">
        <h3>❌ Erro</h3>
        <p>Falha ao carregar usuários</p>
      </div>
    `;
  }
}

// ==========================
// 📦 COLETAR CAMPOS DA AÇÃO
// ✅ novo modelo: sem loja / regional
// ==========================
function coletarCamposEdicaoUsuario() {
  return {
    nome: document.getElementById("edit_perm_nome")?.value.trim() || "",
    matricula:
      document.getElementById("edit_perm_matricula")?.value.trim() || "",
    email:
      document.getElementById("edit_perm_email")?.value.trim().toLowerCase() ||
      "",
    funcao: document.getElementById("edit_perm_funcao")?.value.trim() || "",
    perfil: document.getElementById("edit_perm_perfil")?.value || undefined,
  };
}

// ==========================
// 🔐 COLETAR PERMISSÕES DE SISTEMA DA TELA
// ==========================
function coletarPermissoesSistemaTela(base = {}) {
  const ids = [
    "perm_semana_atual",
    "perm_semana_anterior",
    "perm_qualquer_semana",
    "perm_gerenciar_usuarios",
    "perm_ver_analises",
    "perm_ver_comparativos",
    "perm_ver_painel_ouro",
    "perm_ignorar_loja_vinculada",
  ];

  const out = { ...base };

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const mapa = {
      perm_semana_atual: "pode_editar_semana_atual",
      perm_semana_anterior: "pode_editar_semana_anterior",
      perm_qualquer_semana: "pode_editar_qualquer_semana",
      perm_gerenciar_usuarios: "pode_gerenciar_usuarios",
      perm_ver_analises: "pode_ver_analises",
      perm_ver_comparativos: "pode_ver_comparativos",
      perm_ver_painel_ouro: "pode_ver_painel_ouro",
      perm_ignorar_loja_vinculada: "ignorar_loja_vinculada",
    };

    out[mapa[id]] = el.checked;
  });

  // checkboxes "Ver [tabela]" (um por classe) — lidos dinamicamente
  document.querySelectorAll("[data-classe-perm]").forEach((el) => {
    const chave = el.getAttribute("data-classe-perm");
    if (chave) out[chave] = el.checked;
  });

  const selectVisualizacao = document.getElementById("perm_visualizacao");
  out.permissao_visualizacao = normalizarPermissaoVisualizacao(
    selectVisualizacao?.value || out.permissao_visualizacao || "TODOS"
  );

  console.log("🧭 Permissões de sistema coletadas:", out);
  return out;
}

// ==========================
// 🎯 COLETAR PERMISSÕES DE INDICADORES DA TELA
// ==========================
function coletarPermissoesIndicadoresTela() {
  const acessoTotal =
    document.getElementById("perm_indicadores_total")?.checked === true;

  const checksClasses = document.querySelectorAll(
    "#config-conteudo .check-classe-completa:checked"
  );

  const checksSubclasses = document.querySelectorAll(
    "#config-conteudo .check-subclasse-completa:checked"
  );

  const checksIndicadores = document.querySelectorAll(
    "#config-conteudo .check-indicador:checked"
  );

  const classes = [...checksClasses]
    .map((c) => normalizarTexto(c.value))
    .filter(Boolean);

  const subclasses = [...checksSubclasses]
    .map((c) => normalizarTexto(c.value))
    .filter(Boolean);

  const indicadores = [...checksIndicadores]
    .map((c) => normalizarTexto(c.value))
    .filter(Boolean);

  const resultado = {
    acesso_total: acessoTotal,
    classes: [...new Set(classes)],
    subclasses: [...new Set(subclasses)],
    indicadores: [...new Set(indicadores)],
  };

  console.log("🎯 Permissões coletadas da tela:", resultado);
  return resultado;
}

// ==========================
// 💾 AUTOSAVE USUÁRIO (AÇÃO)
// ✅ novo modelo: sem resolver vínculo
// ==========================
async function autoSalvarUsuarioAcao(id, campoOrigem = "manual") {
  try {
    clearTimeout(window.autosaveUsuarioTimer);

    window.autosaveUsuarioTimer = setTimeout(async () => {
      try {
        mostrarStatusAutosaveUsuario("🔄 Salvando...", "info");

        const db = getWindowDb();
        const userAtual = getUsuarioLogado();
        const isMaster = userAtual?.perfil === "master";

        const dados = coletarCamposEdicaoUsuario();

        console.log("💾 Autosave usuário / ação:", {
          id,
          campoOrigem,
          dados,
        });

        if (!dados.nome || !dados.matricula || !dados.email || !dados.funcao) {
          mostrarStatusAutosaveUsuario(
            "⚠️ Nome, matrícula, e-mail e função são obrigatórios.",
            "erro"
          );
          return;
        }

        const payload = {
          nome: dados.nome,
          matricula: dados.matricula,
          email: dados.email,
          funcao: dados.funcao,

          tipo_visao: "regional",
          loja_codigo: null,
          loja_vinculada: null,
          regional_vinculada: null,
          regionais_vinculadas: [],
        };

        if (isMaster && dados.perfil) {
          payload.perfil = dados.perfil;
        }

        const { error } = await db
          .from("usuarios")
          .update(payload)
          .eq("id", id);

        if (error) throw error;

        mostrarStatusAutosaveUsuario("✅ Salvo automaticamente", "sucesso");

        if (typeof window.registrarEventoSistema === "function") {
          await window.registrarEventoSistema({
            tipo_evento: "usuario",
            modulo: "Permissões",
            acao: "atualizou dados de ação",
            usuario_alvo: dados.nome,
            perfil_alvo: payload.perfil,
            autenticacao: "sessao_propria",
            status: "sucesso",
            contexto: {
              campoOrigem,
              matricula: dados.matricula,
              email: dados.email,
              funcao: dados.funcao,
              tipo_visao: "regional",
              loja_codigo: null,
              loja_vinculada: null,
              regional_vinculada: null,
              regionais_vinculadas: [],
            },
          });
        }

        console.log("✅ Autosave concluído com sucesso");
      } catch (erroInterno) {
        console.error("❌ Erro no autosave do usuário:", erroInterno);
        mostrarStatusAutosaveUsuario(
          `❌ ${erroInterno.message || "Erro ao salvar automaticamente."}`,
          "erro"
        );
      }
    }, 250);
  } catch (erro) {
    console.error("❌ Falha geral no autosave:", erro);
    mostrarStatusAutosaveUsuario("❌ Erro ao salvar automaticamente.", "erro");
  }
}

// ==========================
// 🎛 ATIVAR AUTOSAVE NA TELA
// ==========================
function ativarAutosaveEdicaoUsuario(id) {
  const camposBlur = [
    "edit_perm_nome",
    "edit_perm_matricula",
    "edit_perm_email",
    "edit_perm_funcao",
  ];

  const camposChange = ["edit_perm_perfil"];

  camposBlur.forEach((campoId) => {
    const el = document.getElementById(campoId);
    if (!el) return;

    el.addEventListener("blur", () => {
      autoSalvarUsuarioAcao(id, campoId);
    });
  });

  camposChange.forEach((campoId) => {
    const el = document.getElementById(campoId);
    if (!el) return;

    el.addEventListener("change", () => {
      autoSalvarUsuarioAcao(id, campoId);
    });
  });

  // ✅ checkboxes de PERMISSÃO de sistema + visualização:
  //    ao marcar/desmarcar, salva na hora (autosave de permissões)
  const idsPermissao = [
    "perm_semana_atual",
    "perm_semana_anterior",
    "perm_qualquer_semana",
    "perm_gerenciar_usuarios",
    "perm_ver_analises",
    "perm_ver_comparativos",
    "perm_ver_painel_ouro",
    "perm_ignorar_loja_vinculada",
    "perm_visualizacao",
    "perm_indicadores_total",
  ];

  idsPermissao.forEach((cid) => {
    const el = document.getElementById(cid);
    if (!el) return;
    el.addEventListener("change", () => autoSalvarPermissoesAcao(id));
  });

  // checkboxes "Ver [tabela]" (um por classe)
  document.querySelectorAll("[data-classe-perm]").forEach((el) => {
    el.addEventListener("change", () => autoSalvarPermissoesAcao(id));
  });

  // 🏬 select de loja vinculada
  const selLojaVinc = document.getElementById("perm_loja_vinculada");
  if (selLojaVinc) {
    selLojaVinc.addEventListener("change", () => autoSalvarPermissoesAcao(id));
  }

  // checkboxes de indicadores (classes / subclasses / indicadores individuais)
  document
    .querySelectorAll(
      "#config-conteudo .check-classe-completa, #config-conteudo .check-subclasse-completa, #config-conteudo .check-indicador"
    )
    .forEach((el) => {
      el.addEventListener("change", () => autoSalvarPermissoesAcao(id));
    });
}

// ==========================
// 🧩 INICIALIZAR CONTROLES DE PERMISSÃO POR INDICADOR
// ==========================
function inicializarControlesPermissaoIndicador() {
  const checkTotal = document.getElementById("perm_indicadores_total");
  const checksClasse = document.querySelectorAll(".check-classe-completa");
  const checksSubclasse = document.querySelectorAll(".check-subclasse-completa");

  if (checkTotal) {
    checkTotal.addEventListener("change", () => {
      const estado = checkTotal.checked;

      document
        .querySelectorAll(
          "#config-conteudo .check-classe-completa, #config-conteudo .check-subclasse-completa, #config-conteudo .check-indicador"
        )
        .forEach((el) => {
          el.checked = estado;
        });

      console.log("✅ Acesso total alterado:", estado ? "marcado" : "desmarcado");
    });
  }

  checksClasse.forEach((checkClasse) => {
    checkClasse.addEventListener("change", () => {
      const estado = checkClasse.checked;
      const classe = checkClasse.dataset.classe || "";

      document
        .querySelectorAll(
          `#config-conteudo .check-subclasse-completa[data-classe="${classe}"],
           #config-conteudo .check-indicador[data-classe="${classe}"]`
        )
        .forEach((el) => {
          el.checked = estado;
        });

      // se desmarcou a classe, desmarca também o "acesso total"
      if (!estado) {
        const checkTotalEl = document.getElementById("perm_indicadores_total");
        if (checkTotalEl) checkTotalEl.checked = false;
      }

      console.log(`✅ Classe "${classe}" alterada:`, estado ? "marcada" : "desmarcada");
    });
  });

  checksSubclasse.forEach((checkSubclasse) => {
    checkSubclasse.addEventListener("change", () => {
      const estado = checkSubclasse.checked;
      const classe = checkSubclasse.dataset.classe || "";
      const subclasse = checkSubclasse.dataset.subclasse || "";

      document
        .querySelectorAll(
          `#config-conteudo .check-indicador[data-classe="${classe}"][data-subclasse="${subclasse}"]`
        )
        .forEach((el) => {
          el.checked = estado;
        });

      // se desmarcou a subclasse, desmarca classe pai e acesso total
      if (!estado) {
        const checkClasseEl = document.querySelector(
          `#config-conteudo .check-classe-completa[data-classe="${classe}"]`
        );
        if (checkClasseEl) checkClasseEl.checked = false;
        const checkTotalEl = document.getElementById("perm_indicadores_total");
        if (checkTotalEl) checkTotalEl.checked = false;
      }

      console.log(`✅ Subclasse "${subclasse}" de "${classe}" alterada:`, estado ? "marcada" : "desmarcada");
    });
  });
}

// ==========================
// 🧩 RENDERIZAR BLOCO DE PERMISSÕES POR INDICADOR
// ==========================
function renderPermissoesIndicadorHtml({
  agrupado,
  classesAtuais,
  subclassesAtuais,
  indicadoresAtuais,
  acessoTotalIndicadores,
}) {
  let html = `
    <div class="grupo-permissao grp-acesso">
      <h4><span class="grp-dot"></span> Permissões por indicador</h4>
      <div class="permissoes-grid">
        <label class="check-item check-classe-completa">
          <input
            type="checkbox"
            id="perm_indicadores_total"
            ${acessoTotalIndicadores ? "checked" : ""}
          >
          Acesso total a todos os indicadores
        </label>
      </div>
    </div>
  `;

  if (!Object.keys(agrupado).length) {
    html += `
      <div class="grupo-permissao">
        <p style="margin:10px 0; color:#b94a48;">
          Nenhum indicador encontrado em <code>window.mapaClasse</code>.
        </p>
        <p style="margin:0; color:#666;">
          Verifique se o arquivo <b>app/indicadores-config.js</b> está carregando antes do
          <b>perfil-usuarios-ui.js</b>.
        </p>
      </div>
    `;
    return html;
  }

  Object.keys(agrupado).forEach((classe) => {
    const classeNorm = normalizarTexto(classe);
    const submapa = agrupado[classe] || {};
    const temSubclasses = classeTemSubclassesReais(submapa);

    html += `
      <div class="grupo-permissao">
        <h4>${escapeHtml(classe)}</h4>

        <div class="permissoes-grid" style="margin-bottom:10px;">
          <label class="check-item">
            <input
              type="checkbox"
              class="check-classe-completa"
              data-classe="${escapeHtml(classe)}"
              value="${escapeHtml(classe)}"
              ${classesAtuais.includes(classeNorm) ? "checked" : ""}
            >
            ${escapeHtml(classe)} completo
          </label>
        </div>
    `;

    if (!temSubclasses) {
      const indicadoresDaClasse = Object.values(submapa).flat();

      html += `<div class="permissoes-grid">`;

      indicadoresDaClasse.forEach((indicador) => {
        const indicadorNorm = normalizarTexto(indicador);

        html += `
          <label class="check-item">
            <input
              type="checkbox"
              class="check-indicador"
              data-classe="${escapeHtml(classe)}"
              data-subclasse="GERAL"
              value="${escapeHtml(indicador)}"
              ${indicadoresAtuais.includes(indicadorNorm) ? "checked" : ""}
            >
            ${escapeHtml(indicador)}
          </label>
        `;
      });

      html += `</div>`;
    }

    if (temSubclasses) {
      Object.keys(submapa).forEach((subclasse) => {
        const tokenSubclasse = getTokenSubclasse(classe, subclasse);
        const tokenSubclasseNorm = normalizarTexto(tokenSubclasse);

        html += `
          <div class="grupo-subclasse" style="margin:8px 0 12px 18px;">
            <div class="permissoes-grid" style="margin-bottom:8px;">
              <label class="check-item">
                <input
                  type="checkbox"
                  class="check-subclasse-completa"
                  data-classe="${escapeHtml(classe)}"
                  data-subclasse="${escapeHtml(subclasse)}"
                  value="${escapeHtml(tokenSubclasse)}"
                  ${subclassesAtuais.includes(tokenSubclasseNorm) ? "checked" : ""}
                >
                ${escapeHtml(subclasse)} completo
              </label>
            </div>

            <div class="permissoes-grid">
        `;

        submapa[subclasse].forEach((indicador) => {
          const indicadorNorm = normalizarTexto(indicador);

          html += `
            <label class="check-item">
              <input
                type="checkbox"
                class="check-indicador"
                data-classe="${escapeHtml(classe)}"
                data-subclasse="${escapeHtml(subclasse)}"
                value="${escapeHtml(indicador)}"
                ${indicadoresAtuais.includes(indicadorNorm) ? "checked" : ""}
              >
              ${escapeHtml(indicador)}
            </label>
          `;
        });

        html += `
            </div>
          </div>
        `;
      });
    }

    html += `
      </div>
    `;
  });

  return html;
}

// ==========================
// ⚙️ EDITAR PERMISSÕES + AÇÃO
// ✅ novo modelo: sem vínculo de loja/regional
// ==========================
async function editarPermissoes(id) {
  console.log("⚙️ Editando permissões (novo modelo sem vínculo):", id);

  const container = getConfigConteudoEl();
  if (!container) {
    console.error("❌ config-conteudo não encontrado");
    return;
  }

  container.innerHTML = `
    <div class="card-conteudo">
      <h3>⚙️ Carregando permissões...</h3>
    </div>
  `;

  try {
    const db = getWindowDb();

    const { data, error } = await db
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw error || new Error("Usuário não encontrado");
    }

    window.usuarioPermissoesEditando = data;

    const userAtual = getUsuarioLogado();
    const isMaster = userAtual?.perfil === "master";

    const agrupado = agruparIndicadoresPermissao();
    console.log("🧩 agrupado para tela de permissões:", agrupado);

    const permissoesUsuario = data.permissoes || {};
    const indicadoresAtuais = (permissoesUsuario.indicadores || []).map(
      normalizarTexto
    );
    const classesAtuais = (permissoesUsuario.classes || []).map(normalizarTexto);
    const subclassesAtuais = (permissoesUsuario.subclasses || []).map(
      normalizarTexto
    );

    const acessoTotalIndicadores =
      permissoesUsuario.acesso_total === true || data.perfil === "master";

    const ignorarLojaVinculada =
      data?.permissoes?.ignorar_loja_vinculada === true;

    const permsSistema = getPermissoesSistemaUsuario(data);
    const visualizacaoAtual = normalizarPermissaoVisualizacao(
      permsSistema.permissao_visualizacao
    );

    // lista de lojas para o campo "Loja vinculada"
    const lojasVinculo = await buscarLojasParaVinculo();
    const lojaVinculadaAtual =
      data.loja_codigo != null && data.loja_codigo !== ""
        ? String(data.loja_codigo)
        : "";
    const optionsLojasVinculo = (lojasVinculo || [])
      .map((l) => {
        const cod = String(l.codigo);
        const sel = cod === lojaVinculadaAtual ? "selected" : "";
        const reg = l.regional ? ` · ${escapeHtml(l.regional)}` : "";
        return `<option value="${cod}" ${sel}>${cod} — ${escapeHtml(l.nome || "")}${reg}</option>`;
      })
      .join("");

    let html = `
      <div class="card-conteudo">
        <h3>⚙️ Permissões / Ação - ${escapeHtml(data.nome)}</h3>

        <div id="status-autosave-usuario" class="status-autosave neutro">
          ℹ️ Altere um campo para salvar automaticamente.
        </div>

        <div class="form-grid">

          <div class="campo">
            <label>Nome *</label>
            <input id="edit_perm_nome" value="${escapeHtml(data.nome || "")}">
          </div>

          <div class="campo">
            <label>Matrícula *</label>
            <input id="edit_perm_matricula" value="${escapeHtml(
              data.matricula || ""
            )}">
          </div>

          <div class="campo">
            <label>E-mail *</label>
            <input id="edit_perm_email" value="${escapeHtml(data.email || "")}">
          </div>

          <div class="campo">
            <label>Função *</label>
            <input id="edit_perm_funcao" value="${escapeHtml(data.funcao || "")}">
          </div>

          ${
            isMaster
              ? `
                <div class="campo">
                  <label>Perfil</label>
                  <select id="edit_perm_perfil">
                    <option value="usuario" ${
                      data.perfil === "usuario" ? "selected" : ""
                    }>usuario</option>
                    <option value="admin" ${
                      data.perfil === "admin" ? "selected" : ""
                    }>admin</option>
                    <option value="master" ${
                      data.perfil === "master" ? "selected" : ""
                    }>master</option>
                  </select>
                </div>
              `
              : ""
          }

        </div>
    `;

    if (isMaster) {
      // checkboxes "Ver [tabela]" — um por classe de indicadores
      const classesSistema =
        typeof window.listarClassesSistema === "function"
          ? window.listarClassesSistema()
          : [];

      const checkboxesClassesHtml = classesSistema
        .map((classe) => {
          const chave = window.chavePermissaoClasse(classe);
          const marcado = permsSistema[chave] ? "checked" : "";
          return `
          <label class="check-item">
            <input type="checkbox" id="perm_classe_${chave}" data-classe-perm="${chave}" ${marcado}>
            Ver ${classe}
          </label>`;
        })
        .join("");

      html += `
        <div class="grupo-permissao grp-edicao">
          <h4><span class="grp-dot"></span> Edição — o que pode lançar/alterar</h4>
          <div class="permissoes-grid">
            <label class="check-item">
              <input type="checkbox" id="perm_semana_atual" ${
                permsSistema.pode_editar_semana_atual ? "checked" : ""
              }>
              Editar semana atual
            </label>
            <label class="check-item">
              <input type="checkbox" id="perm_semana_anterior" ${
                permsSistema.pode_editar_semana_anterior ? "checked" : ""
              }>
              Editar semanas anteriores
            </label>
            <label class="check-item">
              <input type="checkbox" id="perm_qualquer_semana" ${
                permsSistema.pode_editar_qualquer_semana ? "checked" : ""
              }>
              Editar qualquer semana
            </label>
          </div>
        </div>

        <div class="grupo-permissao grp-admin">
          <h4><span class="grp-dot"></span> Administração</h4>
          <div class="permissoes-grid">
            <label class="check-item">
              <input type="checkbox" id="perm_gerenciar_usuarios" ${
                permsSistema.pode_gerenciar_usuarios ? "checked" : ""
              }>
              Gerenciar usuários
            </label>
          </div>
        </div>

        <div class="grupo-permissao grp-acesso">
          <h4><span class="grp-dot"></span> Acesso — o que o usuário vê</h4>
          <div class="permissoes-grid">
            <label class="check-item">
              <input type="checkbox" id="perm_ver_analises" ${
                permsSistema.pode_ver_analises ? "checked" : ""
              }>
              Ver análises
            </label>
            <label class="check-item">
              <input type="checkbox" id="perm_ver_comparativos" ${
                permsSistema.pode_ver_comparativos ? "checked" : ""
              }>
              Ver comparativos
            </label>
            <label class="check-item">
              <input type="checkbox" id="perm_ver_painel_ouro" ${
                permsSistema.pode_ver_painel_ouro ? "checked" : ""
              }>
              Ver Painel de Ouro
            </label>
          </div>
          <p class="grp-sub">🗂️ Acesso às tabelas (libera a tabela inteira no menu — para indicadores específicos, use a seção abaixo):</p>
          <div class="permissoes-grid">
            ${checkboxesClassesHtml}
          </div>
        </div>

        <div class="grupo-permissao grp-escopo">
          <h4><span class="grp-dot"></span> Escopo de dados — onde enxerga</h4>
          <div class="permissoes-grid">
            <div class="campo">
              <label>Permissão de visualização</label>
              <select id="perm_visualizacao">
                <option value="NENHUMA" ${
                  visualizacaoAtual === "NENHUMA" ? "selected" : ""
                }>Nenhuma</option>
                <option value="TODOS" ${
                  visualizacaoAtual === "TODOS" ? "selected" : ""
                }>Todos</option>
                <option value="REGIONAL_CONFIGURADA" ${
                  visualizacaoAtual === "REGIONAL_CONFIGURADA" ? "selected" : ""
                }>Regional configurada</option>
                <option value="NE1" ${
                  visualizacaoAtual === "NE1" ? "selected" : ""
                }>NE1</option>
                <option value="NE2" ${
                  visualizacaoAtual === "NE2" ? "selected" : ""
                }>NE2</option>
                <option value="NE1_NE2" ${
                  visualizacaoAtual === "NE1_NE2" ? "selected" : ""
                }>NE1 e NE2</option>
              </select>
            </div>

            <div class="campo">
              <label>🏬 Loja vinculada (visualização restrita)</label>
              <select id="perm_loja_vinculada">
                <option value="">Nenhuma (sem restrição de loja)</option>
                ${optionsLojasVinculo}
              </select>
              <p class="grp-hint">
                Se escolher uma loja, este usuário verá apenas os dados dela no Análises e no Comparativos.
              </p>
            </div>

            <label class="check-item check-item-bi">
              <input
                type="checkbox"
                id="perm_ignorar_loja_vinculada"
                ${ignorarLojaVinculada ? "checked" : ""}
              >
              Ignorar loja vinculada (modo BI)
            </label>
          </div>
        </div>
      `;
    }

    html += renderPermissoesIndicadorHtml({
      agrupado,
      classesAtuais,
      subclassesAtuais,
      indicadoresAtuais,
      acessoTotalIndicadores,
    });

    html += `
        <br>

        <button class="btn-salvar" onclick="salvarPermissoes('${escapeHtml(
          data.id
        )}')">
          ✅ Salvar Permissões
        </button>
      </div>
    `;

    container.innerHTML = html;

    ativarAutosaveEdicaoUsuario(data.id);
    inicializarControlesPermissaoIndicador();

    console.log("✅ Tela de edição de permissões renderizada:", {
      usuario: data.nome,
      id: data.id,
      ignorarLojaVinculada,
    });
  } catch (erro) {
    console.error("❌ erro permissões:", erro);

    container.innerHTML = `
      <div class="card-conteudo">
        <h3>❌ Erro</h3>
        <p>Falha ao carregar permissões</p>
      </div>
    `;
  }
}

// ==========================
// 💾 AUTOSAVE DE PERMISSÕES (ao marcar/desmarcar checkbox)
// Salva imediatamente sem fechar a tela nem dar alert.
// ==========================
async function autoSalvarPermissoesAcao(id) {
  clearTimeout(window.autosavePermsTimer);

  window.autosavePermsTimer = setTimeout(async () => {
    try {
      mostrarStatusAutosaveUsuario("🔄 Salvando permissões...", "info");

      const db = getWindowDb();
      const user = getUsuarioLogado();
      const isMaster = user?.perfil === "master";

      const dados = coletarCamposEdicaoUsuario();

      if (!dados.nome || !dados.matricula || !dados.email || !dados.funcao) {
        mostrarStatusAutosaveUsuario(
          "⚠️ Complete nome, matrícula, e-mail e função antes.",
          "erro"
        );
        return;
      }

      const perfilFinal =
        isMaster && dados.perfil
          ? dados.perfil
          : window.usuarioPermissoesEditando?.perfil || "usuario";

      let permissoesSistema = {
        ...getPermissoesBasePorPerfil(perfilFinal),
        ...(window.usuarioPermissoesEditando?.permissoes || {}),
      };

      if (isMaster) {
        permissoesSistema = coletarPermissoesSistemaTela(permissoesSistema);
      } else {
        permissoesSistema.permissao_visualizacao =
          normalizarPermissaoVisualizacao(
            permissoesSistema.permissao_visualizacao || "TODOS"
          );
      }

      const permissoesIndicadoresTela = coletarPermissoesIndicadoresTela();

      const payload = {
        permissoes: {
          ...(window.usuarioPermissoesEditando?.permissoes || {}),
          ...permissoesSistema,
          indicadores: permissoesIndicadoresTela.indicadores,
          classes: permissoesIndicadoresTela.classes,
          subclasses: permissoesIndicadoresTela.subclasses,
          acesso_total:
            perfilFinal === "master"
              ? true
              : permissoesIndicadoresTela.acesso_total,
        },
      };

      if (isMaster && dados.perfil) {
        payload.perfil = dados.perfil;
      }

      // 🏬 Loja vinculada (visualização restrita) — só o master define
      if (isMaster) {
        const selLoja = document.getElementById("perm_loja_vinculada");
        if (selLoja) {
          const cod = (selLoja.value || "").trim();
          if (cod === "") {
            // sem restrição de loja
            payload.loja_codigo = null;
            payload.loja_vinculada = null;
          } else {
            const txt = selLoja.options[selLoja.selectedIndex]?.text || cod;
            payload.loja_codigo = cod;
            payload.loja_vinculada = txt;
          }
        }
      }

      const { data, error } = await db
        .from("usuarios")
        .update(payload)
        .eq("id", id)
        .select("id, nome, permissoes, perfil, loja_codigo, loja_vinculada")
        .single();

      if (error) throw error;
      if (!data) {
        throw new Error(
          "Nenhuma linha atualizada (verifique a policy de RLS da tabela usuarios)."
        );
      }

      // mantém o cache em memória sincronizado p/ próximos autosaves
      if (window.usuarioPermissoesEditando) {
        window.usuarioPermissoesEditando.permissoes = data.permissoes;
        window.usuarioPermissoesEditando.perfil = data.perfil;
      }

      // se o master estiver editando a si mesmo, atualiza o localStorage
      if (
        String(id) === String(user?.id) &&
        typeof window.sincronizarUsuarioLocalDoBanco === "function"
      ) {
        await window.sincronizarUsuarioLocalDoBanco();
      }

      mostrarStatusAutosaveUsuario("✅ Permissões salvas", "sucesso");
      console.log("✅ Autosave de permissões concluído:", data.permissoes);
    } catch (erro) {
      console.error("❌ Erro no autosave de permissões:", erro);
      mostrarStatusAutosaveUsuario(
        `❌ ${erro.message || "Erro ao salvar permissões."}`,
        "erro"
      );
    }
  }, 350);
}

// ==========================
// 💾 SALVAR PERMISSÕES
// ✅ novo modelo: sem vínculo
// ==========================
async function salvarPermissoes(id) {
  const dados = coletarCamposEdicaoUsuario();
  const user = getUsuarioLogado();
  const isMaster = user?.perfil === "master";

  const permissoesIndicadoresTela = coletarPermissoesIndicadoresTela();

  console.log("💾 Salvando permissões (novo modelo sem vínculo):", {
    id,
    dados,
    permissoesIndicadoresTela,
  });

  if (!dados.nome || !dados.matricula || !dados.email || !dados.funcao) {
    alert("⚠️ Nome, matrícula, e-mail e função são obrigatórios.");
    return;
  }

  try {
    const db = getWindowDb();

    const perfilFinal =
      isMaster && dados.perfil
        ? dados.perfil
        : window.usuarioPermissoesEditando?.perfil || "usuario";

    let permissoesSistema = {
      ...getPermissoesBasePorPerfil(perfilFinal),
      ...(window.usuarioPermissoesEditando?.permissoes || {}),
    };

    if (isMaster) {
      permissoesSistema = coletarPermissoesSistemaTela(permissoesSistema);
    } else {
      permissoesSistema.permissao_visualizacao = normalizarPermissaoVisualizacao(
        permissoesSistema.permissao_visualizacao || "TODOS"
      );
    }

    console.log("🧭 Permissões de sistema coletadas para salvar:", permissoesSistema);

    const payload = {
      nome: dados.nome,
      matricula: dados.matricula,
      email: dados.email,
      funcao: dados.funcao,

      tipo_visao: "regional",
      loja_codigo: null,
      loja_vinculada: null,
      regional_vinculada: null,
      regionais_vinculadas: [],

      permissoes: {
        ...(window.usuarioPermissoesEditando?.permissoes || {}),
        ...permissoesSistema,
        indicadores: permissoesIndicadoresTela.indicadores,
        classes: permissoesIndicadoresTela.classes,
        subclasses: permissoesIndicadoresTela.subclasses,
        acesso_total:
          perfilFinal === "master"
            ? true
            : permissoesIndicadoresTela.acesso_total,
      },
    };

    if (isMaster && dados.perfil) {
      payload.perfil = dados.perfil;
    }

    const { data, error } = await db
      .from("usuarios")
      .update(payload)
      .eq("id", id)
      .select("id, nome, permissoes, perfil")
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error(
        "Nenhuma linha foi atualizada. Verifique a policy de RLS da tabela usuarios."
      );
    }

    console.log("✅ Permissões salvas no banco:", data);

    if (String(id) === String(user?.id)) {
      console.log(
        "🔄 Usuário editado é o próprio logado. Sincronizando localStorage..."
      );
      if (typeof window.sincronizarUsuarioLocalDoBanco === "function") {
        await window.sincronizarUsuarioLocalDoBanco();
      }
    }

    if (typeof window.registrarEventoSistema === "function") {
      await window.registrarEventoSistema({
        tipo_evento: "permissao",
        modulo: "Permissões",
        acao: "atualizou permissões",
        usuario_alvo: dados.nome,
        perfil_alvo: perfilFinal,
        autenticacao: "sessao_propria",
        status: "sucesso",
        contexto: {
          indicadores: permissoesIndicadoresTela.indicadores,
          classes: permissoesIndicadoresTela.classes,
          subclasses: permissoesIndicadoresTela.subclasses,
          acesso_total:
            perfilFinal === "master"
              ? true
              : permissoesIndicadoresTela.acesso_total,
          ignorar_loja_vinculada:
            permissoesSistema.ignorar_loja_vinculada === true,
          permissao_visualizacao: permissoesSistema.permissao_visualizacao,
          tipo_visao: "regional",
          loja_codigo: null,
          loja_vinculada: null,
          regional_vinculada: null,
          regionais_vinculadas: [],
          funcao: dados.funcao,
          matricula: dados.matricula,
          permissoesSistema,
        },
      });
    }

    alert("✅ Permissões atualizadas!");
    abrirTelaPermissoes();
  } catch (erro) {
    console.error("❌ Erro ao salvar permissões:", erro);
    alert(`❌ ${erro.message || "Erro ao salvar permissões."}`);
  }
}

// ==========================
// 🌐 EXPOR FUNÇÕES NO WINDOW
// ==========================
window.mostrarStatusAutosaveUsuario = mostrarStatusAutosaveUsuario;
window.extrairCodigoDaLojaVinculada = extrairCodigoDaLojaVinculada;
window.buscarLojasParaVinculo = buscarLojasParaVinculo;
window.buscarRegionaisDisponiveis = buscarRegionaisDisponiveis;
window.normalizarRegionaisCadastro = normalizarRegionaisCadastro;
window.buscarLojaPorCodigoCadastro = buscarLojaPorCodigoCadastro;
window.resolverVinculoAutomaticoUsuario = resolverVinculoAutomaticoUsuario;

window.abrirConfiguracoes = abrirConfiguracoes;
window.editarDadosUsuario = editarDadosUsuario;
window.salvarDadosUsuario = salvarDadosUsuario;
window.abrirAlterarSenha = abrirAlterarSenha;
window.salvarSenha = salvarSenha;

window.novoUsuario = novoUsuario;
window.salvarNovoUsuario = salvarNovoUsuario;
window.copiarSenhaGerada = copiarSenhaGerada;

window.abrirTelaPermissoes = abrirTelaPermissoes;
window.resumoPermissoesUsuario = resumoPermissoesUsuario;
window.podeGerenciarUsuarioAlvo = podeGerenciarUsuarioAlvo;
window.carregarUsuariosPermissoes = carregarUsuariosPermissoes;

window.coletarCamposEdicaoUsuario = coletarCamposEdicaoUsuario;
window.coletarPermissoesSistemaTela = coletarPermissoesSistemaTela;
window.coletarPermissoesIndicadoresTela = coletarPermissoesIndicadoresTela;

window.autoSalvarUsuarioAcao = autoSalvarUsuarioAcao;
window.autoSalvarPermissoesAcao = autoSalvarPermissoesAcao;
window.ativarAutosaveEdicaoUsuario = ativarAutosaveEdicaoUsuario;
window.inicializarControlesPermissaoIndicador =
  inicializarControlesPermissaoIndicador;
window.renderPermissoesIndicadorHtml = renderPermissoesIndicadorHtml;
window.editarPermissoes = editarPermissoes;
window.salvarPermissoes = salvarPermissoes;

window.getMetaIndicadorPermissao = getMetaIndicadorPermissao;
window.getTokenSubclasse = getTokenSubclasse;
window.quebrarTokenSubclasse = quebrarTokenSubclasse;
window.agruparIndicadoresPermissao = agruparIndicadoresPermissao;
window.classeTemSubclassesReais = classeTemSubclassesReais;

// ==========================
// ✅ LOG FINAL DE BOOTSTRAP
// ==========================
console.log("✅ perfil-usuarios-ui.js pronto", {
  abrirConfiguracoes: typeof window.abrirConfiguracoes,
  abrirTelaPermissoes: typeof window.abrirTelaPermissoes,
  editarPermissoes: typeof window.editarPermissoes,
  salvarPermissoes: typeof window.salvarPermissoes,
  novoUsuario: typeof window.novoUsuario,
  salvarNovoUsuario: typeof window.salvarNovoUsuario,
  resolverVinculoAutomaticoUsuario:
    typeof window.resolverVinculoAutomaticoUsuario,
  getMetaIndicadorPermissao: typeof window.getMetaIndicadorPermissao,
  getTokenSubclasse: typeof window.getTokenSubclasse,
  quebrarTokenSubclasse: typeof window.quebrarTokenSubclasse,
  agruparIndicadoresPermissao: typeof window.agruparIndicadoresPermissao,
  classeTemSubclassesReais: typeof window.classeTemSubclassesReais,
  renderPermissoesIndicadorHtml: typeof window.renderPermissoesIndicadorHtml,
});