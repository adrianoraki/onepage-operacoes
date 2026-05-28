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
      perfil: user.perfil
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
    semana
  });

  if (user.perfil === "master") return true;

  if (user.perfil === "usuario") {

    if (semana !== semanaAtual) return false;

    return indicadores.includes(indicador) ||
           classes.includes(classe);
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
      novo: valorNovo
    });

  };
}
function abrirConfiguracoes() {

  const user = getUsuarioLogado();

  document.getElementById("conteudo").innerHTML = `
    <div class="card-conteudo">

      <h2>⚙️ Configurações</h2>

      <button onclick="abrirAlterarSenha()">🔑 Alterar senha</button>

      ${user.perfil !== "usuario" ? `
        <button onclick="novoUsuario()">➕ Novo usuário</button>
      ` : ""}

      ${user.perfil === "master" ? `
        <button onclick="listarUsuarios()">👥 Usuários</button>
      ` : ""}

    </div>
  `;
}
async function listarUsuarios() {

  const { data } = await supabase.from("usuarios").select("*");

  let html = `<h2>Usuários</h2><table>`;

  data.forEach(u => {

    html += `
      <tr>
        <td>${u.nome}</td>
        <td>${u.perfil}</td>
        <td>
          ${u.perfil !== "master"
            ? `<button onclick="editarPermissoes('${u.id}')">⚙️</button>`
            : "👑"}
        </td>
      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("conteudo").innerHTML = html;
}


async function editarPermissoes(id) {

  const { data } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .single();

  const lista = ["PSV","QUEBRA","NPS","RUPTURA FINAL","TURNOVER"];

  const atuais = data.permissoes?.indicadores || [];

  let html = `<h2>Permissões - ${data.nome}</h2>`;

  lista.forEach(i => {
    html += `
      <label>
        <input type="checkbox" value="${i}"
        ${atuais.includes(i) ? "checked" : ""}>
        ${i}
      </label><br>
    `;
  });

  html += `<button onclick="salvarPermissoes('${id}')">Salvar</button>`;

  document.getElementById("conteudo").innerHTML = html;
}


async function salvarPermissoes(id) {

  const checks = document.querySelectorAll("input[type=checkbox]:checked");

  const selecionados = [...checks].map(c => c.value);

  console.log("💾 Permissões:", selecionados);

  await supabase.from("usuarios")
    .update({
      permissoes: {
        indicadores: selecionados,
        classes: [],
        acesso_total: false
      }
    })
    .eq("id", id);

  alert("✅ Atualizado");
}
// ==========================
// 🧾 LOG DE ALTERAÇÃO
// ==========================
async function registrarLog(dados) {

  try {

    const user = getUsuarioLogado();

    await supabase.from("auditoria").insert([{
      usuario: user.nome,
      perfil: user.perfil,
      loja: dados.loja,
      indicador: dados.indicador,
      semana: dados.semana,
      valor_antigo: dados.antigo,
      valor_novo: dados.novo,
    }]);

    console.log("📊 LOG:", dados);

  } catch (e) {
    console.error("❌ erro log:", e);
  }
}
function abrirConfiguracoes() {

  console.log("⚙️ Abrindo Configurações (regras-perfil.js)");

  const user = getUsuarioLogado();

  if (!user) {
    console.warn("⚠️ Usuário não encontrado");
    return;
  }

  document.getElementById("conteudo").innerHTML = `

    <div class="pagina-container">

      <div class="card-conteudo">

        <div class="header-tabela">
          <h2>⚙️ Configurações</h2>
        </div>

        <div class="config-grid">

          <button onclick="abrirAlterarSenha()">🔑 Alterar senha</button>

          ${user.perfil !== "usuario" ? `
            <button onclick="novoUsuario()">➕ Novo usuário</button>
          ` : ""}

          ${user.perfil === "master" ? `
            <button onclick="listarUsuarios()">👥 Gerenciar usuários</button>
          ` : ""}

          <button onclick="abrirTelaPermissoes()">🎯 Permissões</button>

          <button onclick="trocarTema()">🌙 Tema</button>

          <button onclick="configurarMetas()">📊 Metas</button>

        </div>

      </div>

    </div>
  `;
}
// ========================== Alterar senha ================//
function abrirAlterarSenha() {

  console.log("🔑 Tela Alterar Senha");

  document.getElementById("conteudo").innerHTML = `
    <div class="pagina-container">
      <div class="card-conteudo">
        <h2>🔑 Alterar Senha</h2>

        <input type="password" placeholder="Senha atual"><br><br>
        <input type="password" placeholder="Nova senha"><br><br>

        <button>Salvar</button>
      </div>
    </div>
  `;
}

// ========================== Novo Usuário ================//

function novoUsuario() {

  console.log("➕ Novo Usuário");

  document.getElementById("conteudo").innerHTML = `
    <div class="pagina-container">
      <div class="card-conteudo">
        <h2>➕ Novo Usuário</h2>

        <input placeholder="Nome"><br><br>
        <select>
          <option>usuario</option>
          <option>admin</option>
          <option>master</option>
        </select><br><br>

        <button>Criar</button>
      </div>
    </div>
  `;
}

// ========================== PERMISSÕES ================//

function abrirTelaPermissoes() {
  console.log("🎯 Permissões");
  listarUsuarios();
}

// ========================== Tema ================//

function trocarTema() {

  console.log("🌙 Tema");

  document.body.classList.toggle("dark");
}
// ========================== Metas ================//
function configurarMetas() {

  console.log("📊 Metas");

  document.getElementById("conteudo").innerHTML = `
    <div class="pagina-container">
      <div class="card-conteudo">
        <h2>📊 Metas</h2>
        <p>Configurações de metas futuras</p>
      </div>
    </div>
  `;
}