// ==========================
// 🔐 CONFIG GLOBAL PERFIL
// ==========================
let usuarioLogado = null;

console.log("✅ regras-perfil.js carregado");

// ==========================
// 🔄 USUÁRIO LOGADO
// ==========================
function getUsuarioLogado() {
  try {
    const user = JSON.parse(localStorage.getItem("usuario"));

    if (!user) {
      console.warn("⚠️ Usuário não encontrado");
      return null;
    }

    usuarioLogado = user;

    console.log("👤 Usuário:", {
      nome: user.nome,
      perfil: user.perfil,
    });

    return user;
  } catch (e) {
    console.error("❌ erro usuário:", e);
    return null;
  }
}
function podeEditar(indicador, classe, semana) {
  const user = getUsuarioLogado();
  if (!user) return false;

  const semanaAtual = getSemanaAtual();

  const permissoes = user.permissoes || {};
  const indicadores = permissoes.indicadores || [];
  const classes = permissoes.classes || [];

  console.log("🔍 Permissão check:", {
    user: user.nome,
    perfil: user.perfil,
    indicador,
    semana,
  });

  if (user.perfil === "master") return true;

  if (user.perfil === "usuario") {
    if (semana !== semanaAtual) return false;

    return indicadores.includes(indicador) || classes.includes(classe);
  }

  if (user.perfil === "admin") {
    const permitido =
      indicadores.includes(indicador) ||
      classes.includes(classe) ||
      indicadores.includes("todas");

    return permitido;
  }

  return false;
}
function aplicarPermissaoInput(input, indicador, classe, semana) {
  const allowed = podeEditar(indicador, classe, semana);

  if (!allowed) {
    input.disabled = true;
    input.style.background = "#eee";
    return;
  }

  input.disabled = false;

  input.onblur = async () => {
    const valorNovo = input.value;

    // 🔥 BUSCA VALOR ANTIGO
    const { data } = await supabase
      .from("resultados")
      .select("valor")
      .eq("indicador", indicador)
      .eq("semana", semana)
      .eq("loja", input.dataset.loja)
      .maybeSingle();

    const valorAntigo = data?.valor || null;

    await autoSalvar(input);

    // 🔥 LOG
    await registrarLog({
      loja: input.dataset.loja,
      indicador,
      semana,
      antigo: valorAntigo,
      novo: valorNovo,
    });
  };
}
function abrirConfiguracoes() {

  console.log("⚙️ Abrindo Configurações");

  const user = getUsuarioLogado();

  if (!user) {
    console.warn("⚠️ Usuário não encontrado");
    return;
  }

  // ✅ verifica perfil
  const isAdmin = user.perfil === "admin" || user.perfil === "master";

  document.getElementById("conteudo").innerHTML = `

    <div class="pagina-container">

      <div class="card-conteudo config-full">

        <div class="header-tabela">
          <h2>⚙️ Configurações</h2>
        </div>

        <div class="config-grid">

          <!-- ✅ TODOS PODEM -->
          <button onclick="abrirAlterarSenha()">🔑 Alterar senha</button>

          <!-- ✅ SÓ ADMIN / MASTER -->
          ${isAdmin ? `
            <button onclick="novoUsuario()">➕ Novo usuário</button>
            <button onclick="abrirTelaPermissoes()">🎯 Permissões</button>
            <button onclick="abrirAuditoria()">📊 Logs do Sistema</button>
          ` : ""}

        </div>

        <!-- ✅ ÁREA DINÂMICA -->
        <div id="config-conteudo"></div>

      </div>

    </div>
  `;
}

async function listarUsuarios() {
  const { data } = await supabase.from("usuarios").select("*");

  let html = `<h2>Usuários</h2><table>`;

  data.forEach((u) => {
    html += `
      <tr>
        <td>${u.nome}</td>
        <td>${u.perfil}</td>
        <td>
          ${
            u.perfil !== "master"
              ? `<button onclick="editarPermissoes('${u.id}')">⚙️</button>`
              : "👑"
          }
        </td>
      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("lista-usuarios").innerHTML = html;
}

async function editarPermissoes(id) {
  console.log("⚙️ Editando permissões:", id);

  const container = document.getElementById("config-conteudo");

  // ✅ LOADING
  container.innerHTML = `
    <div class="card-conteudo">
      <h3>⚙️ Carregando permissões...</h3>
    </div>
  `;

  try {
    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    // ✅ AGRUPA INDICADORES POR CLASSE
    const agrupado = {};

    Object.entries(mapaClasse).forEach(([indicador, classe]) => {
      if (!agrupado[classe]) {
        agrupado[classe] = [];
      }

      agrupado[classe].push(indicador);
    });

    const atuais = data.permissoes?.indicadores || [];

    
let html = `
  <div class="card-conteudo">

    <h3>⚙️ Permissões - ${data.nome}</h3>
`;

Object.keys(agrupado).forEach(classe => {

  html += `
    <div class="grupo-permissao">

      <h4>${classe}</h4>

      <div class="permissoes-grid">
  `;

  agrupado[classe].forEach(indicador => {

    html += `
      <label class="check-item">
        <input type="checkbox"
          value="${indicador}"
          ${atuais.includes(indicador) ? "checked" : ""}
        >
        ${indicador}
      </label>
    `;
  });

  html += `
      </div>
    </div>
  `;
});

html += `
    <br>

    <button class="btn-salvar" onclick="salvarPermissoes('${data.id}')">
      ✅ Salvar Permissões
    </button>

  </div>
`;


    // ✅ AQUI É A CORREÇÃO
    container.innerHTML = html;
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
// 💾 SALVAR PERMISSÕES
// ==========================

async function salvarPermissoes(id) {
  const checks = document.querySelectorAll(
    "#config-conteudo input[type=checkbox]:checked",
  );

  const selecionados = [...checks].map((c) => c.value);

  console.log("💾 Salvando permissões:", selecionados);

  await supabase
    .from("usuarios")
    .update({
      permissoes: {
        indicadores: selecionados,
        classes: [],
        acesso_total: false,
      },
    })
    .eq("id", id);

  alert("✅ Permissões atualizadas!");

  abrirTelaPermissoes(); // volta pra lista
}
``;
// ==========================
// 🧾 LOG DE ALTERAÇÃO
// ==========================
async function registrarLog(dados) {
  try {
    const user = getUsuarioLogado();

    await supabase.from("auditoria").insert([
      {
        usuario: user.nome,
        perfil: user.perfil,
        loja: dados.loja,
        indicador: dados.indicador,
        semana: dados.semana,
        valor_antigo: dados.antigo,
        valor_novo: dados.novo,
      },
    ]);

    console.log("📊 LOG:", dados);
  } catch (e) {
    console.error("❌ erro log:", e);
  }
}
function abrirConfiguracoes() {
  console.log("⚙️ Abrindo Configurações (layout fixo)");

  const user = getUsuarioLogado();

  document.getElementById("conteudo").innerHTML = `

    <div class="pagina-container">

      <div class="card-conteudo">

        <!-- ✅ HEADER FIXO -->
        <div class="header-tabela">
          <h2>⚙️ Configurações</h2>
        </div>

        <!-- ✅ BOTÕES FIXOS -->
        <div class="config-grid">

          <button onclick="abrirAlterarSenha()">🔑 Alterar senha</button>

          ${
            user.perfil !== "usuario"
              ? `
            <button onclick="novoUsuario()">➕ Novo usuário</button>
          `
              : ""
          }

          ${
            user.perfil === "master"
              ? `
            <button onclick="listarUsuariosUI()">👥 Gerenciar usuários</button>
          `
              : ""
          }

          <button onclick="abrirTelaPermissoes()">🎯 Permissões</button>


          <button onclick="abrirAuditoria()">📊 Auditoria</button>

        </div>

        <!-- ✅ ÁREA DINÂMICA (AQUI MUDA!) -->
        <div id="config-conteudo" style="margin-top:20px;"></div>

      </div>

    </div>
  `;
}

function editarDadosUsuario() {
  const user = getUsuarioLogado();

  document.getElementById("config-conteudo").innerHTML = `

    <div class="config-box">

      <h3>✏️ Editar Dados</h3>

      <input id="edit_nome" value="${user.nome}"><br><br>
      <input id="edit_matricula" value="${user.matricula || ""}"><br><br>
      <input id="edit_email" value="${user.email || ""}"><br><br>
      <input id="edit_funcao" value="${user.funcao || ""}"><br><br>

      <button class="btn-salvar" onclick="salvarDadosUsuario()">
        ✅ Salvar Alterações
      </button>

    </div>
  `;
}

async function salvarDadosUsuario() {
  const nome = document.getElementById("edit_nome").value;
  const matricula = document.getElementById("edit_matricula").value;
  const email = document.getElementById("edit_email").value;
  const funcao = document.getElementById("edit_funcao").value;

  const user = getUsuarioLogado();

  try {
    await supabase
      .from("usuarios")
      .update({
        nome,
        matricula,
        email,
        funcao,
      })
      .eq("id", user.id);

    alert("✅ Dados atualizados!");

    // Atualiza localStorage
    localStorage.setItem(
      "usuario",
      JSON.stringify({
        ...user,
        nome,
        matricula,
        email,
        funcao,
      }),
    );

    abrirAlterarSenha();
  } catch (erro) {
    console.error("❌ erro:", erro);
    alert("Erro ao salvar");
  }
}

// ========================== Alterar senha ================//
function abrirAlterarSenha() {
  const user = getUsuarioLogado();

  document.getElementById("config-conteudo").innerHTML = `

    <div class="config-flex">

      <!-- ✅ ESQUERDA: DADOS -->
      <div class="config-box">

        <h3>👤 Dados do Usuário</h3>

        <p><b>Nome:</b> <span id="info_nome">${user.nome}</span></p>
        <p><b>Matrícula:</b> <span id="info_matricula">${user.matricula || "-"}</span></p>
        <p><b>E-mail:</b> <span id="info_email">${user.email || "-"}</span></p>
        <p><b>Função:</b> <span id="info_funcao">${user.funcao || user.perfil}</span></p>

        <br>

        <button onclick="editarDadosUsuario()" class="btn-salvar">
          ✏️ Editar dados
        </button>

      </div>

      <!-- ✅ DIREITA: SENHA -->
      <div class="config-box">

        <h3>🔑 Alterar Senha</h3>

        <input id="novaSenha" type="password" placeholder="Nova senha"><br><br>
        <input id="confirmarSenha" type="password" placeholder="Confirmar senha"><br><br>

        <button class="btn-salvar" onclick="salvarSenha()">
          ✅ Salvar Senha
        </button>

      </div>

    </div>
  `;
}

async function salvarSenha() {
  const nova = document.getElementById("novaSenha").value;
  const confirmar = document.getElementById("confirmarSenha").value;

  if (nova !== confirmar) {
    alert("❌ Senhas não conferem");
    return;
  }

  console.log("🔑 Senha alterada");

  alert("✅ Senha atualizada (implementar backend depois)");
}

// ========================== Novo Usuário ================//

function novoUsuario() {

  console.log("➕ Novo Usuário");

  const user = getUsuarioLogado();
  if (!user) return;

  document.getElementById("config-conteudo").innerHTML = `

    <div class="card-conteudo">

      <h3>➕ Novo Usuário</h3>

      <div class="form-grid">

        <div class="campo">
          <label>Nome</label>
          <input id="novo_nome" placeholder="Digite o nome">
        </div>

        <div class="campo">
          <label>Matrícula</label>
          <input id="novo_matricula" placeholder="Digite a matrícula">
        </div>

        <div class="campo">
          <label>E-mail</label>
          <input id="novo_email" placeholder="Digite o e-mail">
        </div>

        <div class="campo">
          <label>Função</label>
          <input id="novo_funcao" placeholder="Digite a função">
        </div>

      </div>

      <div class="acoes">
        <button class="btn-salvar" onclick="salvarNovoUsuario()">
          ✅ Criar Usuário
        </button>
      </div>

    </div>
  `;
}
async function salvarNovoUsuario() {
  const nome = document.getElementById("novo_nome").value;
  const matricula = document.getElementById("novo_matricula").value;
  const email = document.getElementById("novo_email").value;
  const funcao = document.getElementById("novo_funcao").value;
  const perfil = document.getElementById("novo_perfil").value;

  console.log("💾 Criando usuário:", {
    nome,
    matricula,
    email,
    funcao,
    perfil,
  });

  try {
    await supabase.from("usuarios").insert([
      {
        nome,
        matricula,
        email,
        funcao,
        perfil,
        permissoes: {},
      },
    ]);

    alert("✅ Usuário criado!");
  } catch (erro) {
    console.error("❌ erro:", erro);
    alert("Erro ao criar usuário");
  }
}

function listarUsuariosUI() {
  document.getElementById("config-conteudo").innerHTML = `
    <div class="card-conteudo">

      <h3>👥 Gerenciar Usuários</h3>

      <div id="lista-usuarios">
        Carregando...
      </div>

    </div>
  `;

  listarUsuarios(); // já existente
}

// ========================== PERMISSÕES ================//

// ==========================
// 🎯 PERMISSÕES - UI PROFISSIONAL
// ==========================
function abrirTelaPermissoes() {
  console.log("🎯 Abrindo Permissões");

  const container = document.getElementById("config-conteudo");

  if (!container) {
    console.error("❌ container config não encontrado");
    return;
  }

  // ✅ LOADING
  container.innerHTML = `
    <div class="card-conteudo">
      <h3>🎯 Permissões de Usuários</h3>
      <p>Carregando usuários...</p>
    </div>
  `;

  // ✅ pequeno delay pra UX
  setTimeout(() => {
    carregarUsuariosPermissoes();
  }, 150);
}

async function carregarUsuariosPermissoes() {
  console.log("🔄 Buscando usuários...");

  const container = document.getElementById("config-conteudo");

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("nome");

    if (error) throw error;

    let html = `
      <div class="card-conteudo">

        <h3>🎯 Permissões de Usuários</h3>

        <div class="tabela-container">
          <table class="tabela">

            <thead>
              <tr>
                <th>Nome</th>
                <th>Perfil</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>
    `;

    data.forEach((u) => {
      html += `
        <tr>
          <td>${u.nome}</td>
          <td>${u.perfil}</td>

          <td>
            ${
              u.perfil !== "master"
                ? `<button onclick="editarPermissoes('${u.id}')">⚙️</button>`
                : "👑"
            }
          </td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>

      </div>
    `;

    container.innerHTML = html;

    console.log("✅ Usuários carregados");
  } catch (erro) {
    console.error("❌ erro ao carregar usuários:", erro);

    container.innerHTML = `
      <div class="card-conteudo">
        <h3>❌ Erro</h3>
        <p>Falha ao carregar usuários</p>
      </div>
    `;
  }
}

// ==========================
// 📊 AUDITORIA
// ==========================
async function abrirAuditoria() {
  console.log("📊 Abrindo auditoria");

  const container = document.getElementById("config-conteudo");

  // ✅ loading
  container.innerHTML = `
    <div class="card-conteudo">
      <h2>📊 Auditoria</h2>
      <p>Carregando registros...</p>
    </div>
  `;

  try {
    const { data, error } = await supabase
      .from("auditoria")
      .select("*")
      .order("id", { ascending: false })
      .limit(50);

    if (error) throw error;

    let html = `
      <div class="card-conteudo">
        <h2>📊 Histórico de Alterações</h2>

        <div class="tabela-container">
          <table class="tabela">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Indicador</th>
                <th>Loja</th>
                <th>Semana</th>
                <th>Antes</th>
                <th>Depois</th>
              </tr>
            </thead>
            <tbody>
    `;

    data.forEach((d) => {
      html += `
        <tr>
          <td>${d.usuario}</td>
          <td>${d.indicador}</td>
          <td>${d.loja}</td>
          <td>${d.semana}</td>
          <td>${d.valor_antigo ?? "-"}</td>
          <td>${d.valor_novo ?? "-"}</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  } catch (erro) {
    console.error("❌ erro auditoria:", erro);

    container.innerHTML = `
      <div class="card-conteudo">
        <h2>❌ Erro</h2>
        <p>Falha ao carregar auditoria</p>
      </div>
    `;
  }
}
