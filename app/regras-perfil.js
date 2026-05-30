// ==========================
// 🔐 CONFIG GLOBAL PERFIL
// ==========================
let usuarioLogado = null;

console.log("✅ regras-perfil.js carregado");

// ==========================
// 🔠 NORMALIZAR TEXTO
// ==========================
function normalizarTexto(valor) {
  return (valor || "").toString().trim().toUpperCase();
}

function normalizarTextoLower(valor) {
  return (valor || "").toString().trim().toLowerCase();
}

function normalizarTextoSemAcento(valor) {
  return (valor || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizarListaRegionais(valor) {
  if (!valor) return [];

  if (Array.isArray(valor)) {
    return valor
      .map((v) => normalizarTexto(v))
      .filter(Boolean);
  }

  if (typeof valor === "string") {
    return valor
      .split(",")
      .map((v) => normalizarTexto(v))
      .filter(Boolean);
  }

  return [];
}

function listaRegionaisParaTexto(lista) {
  if (!Array.isArray(lista) || !lista.length) return "";
  return lista.map((v) => normalizarTexto(v)).filter(Boolean).join(", ");
}

// ==========================
// 🔄 USUÁRIO LOGADO
// ==========================
function getUsuarioLogado() {
  try {
    const user =
      typeof getUsuarioLocal === "function"
        ? getUsuarioLocal()
        : JSON.parse(localStorage.getItem("usuario"));

    if (!user) {
      console.warn("⚠️ Usuário não encontrado");
      return null;
    }

    usuarioLogado = {
      ...user,
      perfil: normalizarTextoLower(user.perfil),
      tipo_visao: normalizarTextoLower(user.tipo_visao),
      loja_codigo: user.loja_codigo || null,
      loja_vinculada: user.loja_vinculada || null,
      regional_vinculada: user.regional_vinculada || null,
      subregional_vinculada: user.subregional_vinculada || null,
      regionais_vinculadas: normalizarListaRegionais(user.regionais_vinculadas),
    };

    // fallback: se só tem regional principal, garante na lista
    if (
      usuarioLogado.regional_vinculada &&
      !usuarioLogado.regionais_vinculadas.includes(
        normalizarTexto(usuarioLogado.regional_vinculada),
      )
    ) {
      usuarioLogado.regionais_vinculadas.unshift(
        normalizarTexto(usuarioLogado.regional_vinculada),
      );
    }

    // remove duplicados
    usuarioLogado.regionais_vinculadas = [
      ...new Set(usuarioLogado.regionais_vinculadas),
    ];

    console.log("👤 Usuário:", {
      nome: usuarioLogado.nome,
      perfil: usuarioLogado.perfil,
      tipo_visao: usuarioLogado.tipo_visao,
      loja_codigo: usuarioLogado.loja_codigo,
      loja_vinculada: usuarioLogado.loja_vinculada,
      regional_vinculada: usuarioLogado.regional_vinculada,
      regionais_vinculadas: usuarioLogado.regionais_vinculadas,
    });

    return usuarioLogado;
  } catch (e) {
    console.error("❌ erro usuário:", e);
    return null;
  }
}

// ==========================
// 🧠 CONTEXTO DE ESCOPO DO USUÁRIO
// ==========================
function getEscopoUsuarioSistema(user = null) {
  const usuario = user || getUsuarioLogado();
  if (!usuario) {
    return {
      tipo: "global",
      loja_vinculada: null,
      regional_vinculada: null,
      subregional_vinculada: null,
      regionais_vinculadas: [],
    };
  }

  // master vê tudo
  if (usuario.perfil === "master") {
    return {
      tipo: "global",
      loja_vinculada: null,
      regional_vinculada: null,
      subregional_vinculada: null,
      regionais_vinculadas: [],
    };
  }

  // regional / diretoria
  if (usuario.tipo_visao === "regional") {
    return {
      tipo: "regional",
      loja_vinculada: null,
      regional_vinculada: usuario.regional_vinculada || null,
      subregional_vinculada: usuario.subregional_vinculada || null,
      regionais_vinculadas: normalizarListaRegionais(
        usuario.regionais_vinculadas,
      ),
    };
  }

  // padrão: gerencial / loja
  return {
    tipo: "loja",
    loja_vinculada: usuario.loja_vinculada || null,
    regional_vinculada: usuario.regional_vinculada || null,
    subregional_vinculada: usuario.subregional_vinculada || null,
    regionais_vinculadas: normalizarListaRegionais(usuario.regionais_vinculadas),
  };
}

// ==========================
// 🏬 MATCH DE LOJA NO ESCOPO
// suporta:
// - só código: "305"
// - chave completa: "305 - Loja X"
// ==========================
function lojaDentroDoEscopoUsuario(codigo, nomeLoja, lojaVinculada) {
  if (!lojaVinculada) return true;

  const codigoNorm = normalizarTexto(codigo);
  const nomeNorm = normalizarTexto(nomeLoja);
  const chaveLoja = normalizarTexto(`${codigo} - ${nomeLoja}`);
  const vinculo = normalizarTexto(lojaVinculada);

  // se salvou só o código
  if (vinculo === codigoNorm) return true;

  // se salvou chave completa
  if (vinculo === chaveLoja) return true;

  // fallback mais tolerante
  if (vinculo.includes(codigoNorm) && vinculo.includes(nomeNorm)) return true;

  return false;
}

// ==========================
// 🌍 MATCH DE REGIONAL NO ESCOPO
// ==========================
function regionalDentroDoEscopoUsuario(
  regionalLinha,
  regionalVinculada,
  regionaisVinculadas = [],
) {
  const regionalNorm = normalizarTexto(regionalLinha);

  const lista = normalizarListaRegionais(regionaisVinculadas);

  if (lista.length) {
    return lista.includes(regionalNorm);
  }

  if (!regionalVinculada) return true;

  return regionalNorm === normalizarTexto(regionalVinculada);
}

// ==========================
// 📅 SEMANA ANTERIOR
// ==========================
function getSemanaAnterior(semanaAtual) {
  const atual = Number(semanaAtual);

  if (atual <= 1) return 53; // ajuste virada de ano
  return atual - 1;
}

// ==========================
// 📅 JANELA DE EDIÇÃO
// semana atual + semana anterior
// ==========================
function podeEditarNaJanela(perfil, semanaInformada, semanaAtual) {
  const s = Number(semanaInformada);
  const atual = Number(semanaAtual);
  const anterior = getSemanaAnterior(atual);

  // 👑 master sempre pode
  if (perfil === "master") return true;

  // admin e usuário: semana atual + anterior
  return s === atual || s === anterior;
}

// ==========================
// 🔍 MOTIVO DO BLOQUEIO
// ==========================
function getMotivoBloqueio(indicador, classe, semana) {
  const user = getUsuarioLogado();
  if (!user) return "Usuário não autenticado";

  const perfil = normalizarTextoLower(user.perfil);

  const semanaAtual = getSemanaAtual().toString().padStart(2, "0");
  const semanaInformada = String(semana).padStart(2, "0");

  const permissoes = user.permissoes || {};
  const indicadores = (permissoes.indicadores || []).map(normalizarTexto);
  const classes = (permissoes.classes || []).map(normalizarTexto);

  const indicadorNorm = normalizarTexto(indicador);
  const classeNorm = normalizarTexto(classe);

  const permitido =
    indicadores.includes(indicadorNorm) ||
    classes.includes(classeNorm) ||
    indicadores.includes("TODAS");

  console.log("🔍 Permissão check:", {
    user: user.nome,
    perfil,
    indicador: indicadorNorm,
    classe: classeNorm,
    semana: semanaInformada,
    semanaAtual,
    permitido,
    indicadores,
    classes,
  });

  // 👑 master
  if (perfil === "master") return null;

  // admin / usuario só podem o que foi concedido
  if (!permitido) {
    return "Sem permissão para este indicador/tabela";
  }

  // valida janela de edição
  const dentroDaJanela = podeEditarNaJanela(
    perfil,
    Number(semanaInformada),
    Number(semanaAtual),
  );

  if (!dentroDaJanela) {
    return "Prazo encerrado. Somente com desbloqueio administrativo.";
  }

  return null;
}

// ==========================
// 🔐 REGRA FINAL DE EDIÇÃO
// ==========================
function podeEditar(indicador, classe, semana) {
  return getMotivoBloqueio(indicador, classe, semana) === null;
}

// ==========================
// 🔒 APLICAR BLOQUEIO NO INPUT
// ==========================
function aplicarPermissaoInput(input, indicador, classe, semana) {
  const motivo = getMotivoBloqueio(indicador, classe, semana);
  const allowed = motivo === null;

  if (!allowed) {
    input.disabled = true;
    input.readOnly = true;
    input.removeAttribute("onblur");
    input.onblur = null;

    input.style.background = "#f1f1f1";
    input.style.color = "#777";
    input.style.cursor = "not-allowed";
    input.style.border = "1px solid #ddd";

    input.title = motivo;
    input.dataset.bloqueado = "true";
    input.dataset.motivo = motivo;
    return;
  }

  input.disabled = false;
  input.readOnly = false;
  input.style.background = "#fff";
  input.style.color = "#000";
  input.style.cursor = "text";
  input.style.border = "1px solid #ccc";

  input.removeAttribute("title");
  input.dataset.bloqueado = "false";
  input.dataset.motivo = "";
}

// ==========================
// 👁️ APLICAR ESCOPO VISUAL DA TABELA
// gerente da loja vê só sua loja
// regional vê só sua(s) regional(is)
// ==========================
function aplicarEscopoVisualTabela() {
  const user = getUsuarioLogado();
  if (!user) return;

  const escopo = getEscopoUsuarioSistema(user);

  if (escopo.tipo === "global") {
    console.log("🌐 Escopo global - nenhuma linha será ocultada");
    return;
  }

  const tabelasPossiveis = [
    "#tbody-tabela tr",
    "#tbody-especial tr",
    "#tbody-rh tr",
  ];

  let totalLinhas = 0;
  let totalOcultadas = 0;

  tabelasPossiveis.forEach((selector) => {
    document.querySelectorAll(selector).forEach((row) => {
      const tds = row.querySelectorAll("td");
      if (tds.length < 3) return;

      const codigo = tds[0]?.textContent?.trim() || "";
      const loja = tds[1]?.textContent?.trim() || "";
      const regional = tds[2]?.textContent?.trim() || "";

      let visivel = true;

      if (escopo.tipo === "loja") {
        visivel = lojaDentroDoEscopoUsuario(
          codigo,
          loja,
          escopo.loja_vinculada,
        );
      }

      if (escopo.tipo === "regional") {
        visivel = regionalDentroDoEscopoUsuario(
          regional,
          escopo.regional_vinculada,
          escopo.regionais_vinculadas,
        );
      }

      row.style.display = visivel ? "" : "none";

      totalLinhas++;
      if (!visivel) totalOcultadas++;
    });
  });

  console.log("👁️ Escopo visual aplicado:", {
    escopo,
    totalLinhas,
    totalOcultadas,
  });
}

// ==========================
// 🧩 APLICAR PERMISSÕES NA TABELA
// ==========================
function aplicarPermissoesTabela(indicador, classe) {
  console.log("🛡️ Aplicando permissões na tabela...", { indicador, classe });

  const inputs = document.querySelectorAll(
    "#conteudo input[data-loja][data-semana]",
  );

  if (!inputs.length) {
    console.warn("⚠️ Nenhum input encontrado para aplicar permissão");
  } else {
    inputs.forEach((input) => {
      const semana = input.dataset.semana;
      aplicarPermissaoInput(input, indicador, classe, semana);
    });

    console.log("✅ Permissões aplicadas:", inputs.length);
  }

  // ✅ aplica escopo visual
  aplicarEscopoVisualTabela();
}

// ==========================
// 🔐 GERAR SENHA ALEATÓRIA
// (mantido por compatibilidade)
// ==========================
function gerarSenhaAleatoria(tamanho = 10) {
  const letrasMaiusculas = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const letrasMinusculas = "abcdefghijkmnopqrstuvwxyz";
  const numeros = "23456789";
  const simbolos = "@#!$%&*";

  const todos = letrasMaiusculas + letrasMinusculas + numeros + simbolos;

  let senha = "";

  senha +=
    letrasMaiusculas[Math.floor(Math.random() * letrasMaiusculas.length)];
  senha +=
    letrasMinusculas[Math.floor(Math.random() * letrasMinusculas.length)];
  senha += numeros[Math.floor(Math.random() * numeros.length)];
  senha += simbolos[Math.floor(Math.random() * simbolos.length)];

  for (let i = 4; i < tamanho; i++) {
    senha += todos[Math.floor(Math.random() * todos.length)];
  }

  senha = senha
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return senha;
}

// ==========================
// 📋 COPIAR SENHA GERADA
// ==========================
function copiarSenhaGerada() {
  const texto = document.getElementById("senhaGeradaTexto")?.textContent;

  if (!texto) return;

  navigator.clipboard
    .writeText(texto)
    .then(() => {
      alert("✅ Senha copiada!");
    })
    .catch((erro) => {
      console.error("❌ Erro ao copiar senha:", erro);
    });
}

// ==========================
// 🏬 BUSCAR LOJAS PARA VÍNCULO
// ==========================
async function buscarLojasParaVinculo() {
  try {
    const { data, error } = await window.db
      .from("lojas")
      .select("*")
      .order("codigo");

    if (error) throw error;

    return data || [];
  } catch (erro) {
    console.error("❌ Erro ao buscar lojas para vínculo:", erro);
    return [];
  }
}

// ==========================
// 🌍 REGIONALS DISPONÍVEIS
// ==========================
async function buscarRegionaisDisponiveis() {
  const lojas = await buscarLojasParaVinculo();

  const set = new Set();
  lojas.forEach((l) => {
    if (l.regional) set.add(normalizarTexto(l.regional));
  });

  return [...set].sort();
}

// ==========================
// 🌍 NORMALIZAR REGIONAIS NO CADASTRO
// aceita "NE1, NE2"
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
// ==========================
async function buscarLojaPorCodigoCadastro(lojaCodigo) {
  try {
    const codigo = (lojaCodigo || "").toString().trim();
    if (!codigo) return null;

    const { data, error } = await window.db
      .from("lojas")
      .select("*")
      .eq("codigo", codigo)
      .single();

    if (error || !data) {
      console.warn("⚠️ Loja não encontrada no cadastro:", error);
      return null;
    }

    return data;
  } catch (erro) {
    console.error("❌ Erro ao buscar loja no cadastro:", erro);
    return null;
  }
}

// ==========================
// ⚙️ ABRIR CONFIGURAÇÕES
// ==========================
function abrirConfiguracoes() {
  console.log("⚙️ Abrindo Configurações");

  const user = getUsuarioLogado();
  if (!user) return;

  const isAdmin = user.perfil === "admin" || user.perfil === "master";
  const isMaster = user.perfil === "master";

  document.getElementById("conteudo").innerHTML = `
    <div class="pagina-container">
      <div class="card-conteudo">

        <div class="header-tabela">
          <h2>⚙️ Configurações</h2>
        </div>

        <div class="config-grid">
          <button onclick="abrirAlterarSenha()">🔑 Alterar senha</button>

          ${
            isAdmin
              ? `
                <button onclick="novoUsuario()">➕ Novo usuário</button>
                <button onclick="abrirTelaPermissoes()">🎯 Permissões</button>
              `
              : ""
          }

          ${
            isMaster
              ? `<button onclick="abrirLogsSistema()">📋 Logs do Sistema</button>`
              : ""
          }
        </div>

        <div id="config-conteudo" style="margin-top:20px;"></div>

      </div>
    </div>
  `;
}

// ==========================
// ✏️ EDITAR DADOS DO USUÁRIO
// ==========================
function editarDadosUsuario() {
  const user = getUsuarioLogado();

  document.getElementById("config-conteudo").innerHTML = `
    <div class="config-box">

      <h3>✏️ Editar Dados</h3>

      <input id="edit_nome" value="${user.nome || ""}"><br><br>
      <input id="edit_matricula" value="${user.matricula || ""}"><br><br>
      <input id="edit_email" value="${user.email || ""}"><br><br>
      <input id="edit_funcao" value="${user.funcao || ""}"><br><br>

      <button class="btn-salvar" onclick="salvarDadosUsuario()">
        ✅ Salvar Alterações
      </button>

    </div>
  `;
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

  if (!nome || !matricula || !email || !funcao) {
    alert("⚠️ Preencha nome, matrícula, e-mail e função.");
    return;
  }

  try {
    const { error } = await window.db
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

    localStorage.setItem("usuario", JSON.stringify(atualizado));

    if (typeof registrarEventoSistema === "function") {
      await registrarEventoSistema({
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
    console.error("❌ erro:", erro);
    alert("Erro ao salvar");
  }
}

// ==========================
// 🔑 ALTERAR SENHA
// ==========================
function abrirAlterarSenha() {
  const user = getUsuarioLogado();

  document.getElementById("config-conteudo").innerHTML = `
    <div class="config-flex">

      <div class="config-box">
        <h3>👤 Dados do Usuário</h3>

        <p><b>Nome:</b> <span id="info_nome">${user.nome || "-"}</span></p>
        <p><b>Matrícula:</b> <span id="info_matricula">${user.matricula || "-"}</span></p>
        <p><b>E-mail:</b> <span id="info_email">${user.email || "-"}</span></p>
        <p><b>Função:</b> <span id="info_funcao">${user.funcao || user.perfil}</span></p>

        <br>

        <button onclick="editarDadosUsuario()" class="btn-salvar">
          ✏️ Editar dados
        </button>
      </div>

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

// ==========================
// 💾 SALVAR SENHA
// ==========================
async function salvarSenha() {
  const nova = document.getElementById("novaSenha")?.value;
  const confirmar = document.getElementById("confirmarSenha")?.value;

  if (nova !== confirmar) {
    alert("❌ Senhas não conferem");
    return;
  }

  console.log("🔑 Senha alterada");
  alert("✅ Senha atualizada (ligar no Auth depois)");
}

// ==========================
// ➕ NOVO USUÁRIO (MANUAL)
// - login criado manualmente no Auth
// - perfil salvo no sistema
// ==========================
function novoUsuario() {
  console.log("➕ Novo Usuário (modo manual)");

  const user = getUsuarioLogado();
  if (!user) return;

  document.getElementById("config-conteudo").innerHTML = `
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

        <div class="campo">
          <label>Número da loja</label>
          <input id="novo_loja_codigo" placeholder="Ex.: 305">
          <small>Se preencher a loja, a visão será gerencial automaticamente.</small>
        </div>

        <div class="campo">
          <label>Regional principal</label>
          <input id="novo_regional_vinculada" placeholder="Ex.: NE1">
          <small>Use quando o usuário for regional e não estiver vinculado a uma loja específica.</small>
        </div>

        <div class="campo">
          <label>Regionais adicionais</label>
          <input id="novo_regionais_vinculadas" placeholder="Ex.: NE1, NE2">
          <small>Opcional. Separe por vírgula.</small>
        </div>

        <div class="campo">
          <label>Subregional vinculada</label>
          <input id="novo_subregional_vinculada" placeholder="Opcional">
        </div>

      </div>

      <div class="acoes">
        <button class="btn-salvar" onclick="salvarNovoUsuario()">
          ✅ Criar Usuário
        </button>
      </div>

      <div id="resultado-novo-usuario" style="margin-top:15px;"></div>

    </div>
  `;
}

// ==========================
// 💾 SALVAR NOVO USUÁRIO (MANUAL)
// - NÃO usa Edge Function
// - salva direto em usuarios
// - login deve existir manualmente no Auth
// ==========================
async function salvarNovoUsuario() {
  const nome = document.getElementById("novo_nome")?.value.trim();
  const matricula = document.getElementById("novo_matricula")?.value.trim();
  const email = document
    .getElementById("novo_email")
    ?.value.trim()
    .toLowerCase();
  const funcao = document.getElementById("novo_funcao")?.value.trim();

  const loja_codigo =
    document.getElementById("novo_loja_codigo")?.value.trim() || null;

  const regional_vinculada =
    document.getElementById("novo_regional_vinculada")?.value.trim() || null;

  const regionais_vinculadas_raw =
    document.getElementById("novo_regionais_vinculadas")?.value.trim() || "";

  const subregional_vinculada =
    document.getElementById("novo_subregional_vinculada")?.value.trim() || null;

  const resultadoEl = document.getElementById("resultado-novo-usuario");

  console.log("💾 Criando usuário no modo manual...", {
    nome,
    matricula,
    email,
    funcao,
    loja_codigo,
    regional_vinculada,
    regionais_vinculadas_raw,
    subregional_vinculada,
  });

  if (!nome || !matricula || !email || !funcao) {
    if (resultadoEl) {
      resultadoEl.innerHTML = `
        <div class="msg-erro">
          ⚠️ Nome, matrícula, e-mail e função são obrigatórios.
        </div>
      `;
    }
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    if (resultadoEl) {
      resultadoEl.innerHTML = `
        <div class="msg-erro">
          ⚠️ Informe um e-mail válido. Ex.: usuario@empresa.com
        </div>
      `;
    }
    return;
  }

  if (!loja_codigo && !regional_vinculada) {
    if (resultadoEl) {
      resultadoEl.innerHTML = `
        <div class="msg-erro">
          ⚠️ Informe o número da loja ou a regional principal.
        </div>
      `;
    }
    return;
  }

  try {
    if (resultadoEl) {
      resultadoEl.innerHTML = `
        <div class="msg-sucesso">
          🔄 Salvando usuário no sistema...
        </div>
      `;
    }

    // duplicidade por e-mail
    const { data: existenteEmail, error: erroEmail } = await window.db
      .from("usuarios")
      .select("id, email")
      .ilike("email", email)
      .maybeSingle();

    if (erroEmail) throw erroEmail;

    if (existenteEmail) {
      if (resultadoEl) {
        resultadoEl.innerHTML = `
          <div class="msg-erro">
            ❌ Já existe um usuário cadastrado com este e-mail.
          </div>
        `;
      }
      return;
    }

    // duplicidade por matrícula
    const { data: existenteMatricula, error: erroMatricula } = await window.db
      .from("usuarios")
      .select("id, matricula")
      .eq("matricula", matricula)
      .maybeSingle();

    if (erroMatricula) throw erroMatricula;

    if (existenteMatricula) {
      if (resultadoEl) {
        resultadoEl.innerHTML = `
          <div class="msg-erro">
            ❌ Já existe um usuário cadastrado com esta matrícula.
          </div>
        `;
      }
      return;
    }

    let tipo_visao = "regional";
    let loja_vinculada = null;
    let loja_codigo_final = null;
    let regional_principal_final = normalizarTexto(regional_vinculada) || null;
    let regionais_vinculadas = normalizarRegionaisCadastro(
      regionais_vinculadas_raw,
    );

    if (loja_codigo) {
      const loja = await buscarLojaPorCodigoCadastro(loja_codigo);

      if (!loja) {
        if (resultadoEl) {
          resultadoEl.innerHTML = `
            <div class="msg-erro">
              ❌ Número da loja não encontrado na base.
            </div>
          `;
        }
        return;
      }

      tipo_visao = "gerencial";
      loja_codigo_final = String(loja.codigo);
      loja_vinculada = `${loja.codigo} - ${loja.nome}`;
      regional_principal_final =
        normalizarTexto(loja.regional) || regional_principal_final || null;

      if (
        regional_principal_final &&
        !regionais_vinculadas.includes(regional_principal_final)
      ) {
        regionais_vinculadas.push(regional_principal_final);
      }
    } else {
      tipo_visao = "regional";

      if (
        regional_principal_final &&
        !regionais_vinculadas.includes(regional_principal_final)
      ) {
        regionais_vinculadas.unshift(regional_principal_final);
      }
    }

    regionais_vinculadas = [...new Set(regionais_vinculadas)];

    const payload = {
      auth_user_id: null,
      nome,
      sobrenome: "",
      matricula,
      email,
      funcao,
      perfil: "usuario",

      tipo_visao,
      loja_codigo: loja_codigo_final,
      loja_vinculada,
      regional_vinculada: regional_principal_final,
      regionais_vinculadas,
      subregional_vinculada,

      primeiro_acesso: true,
      permissoes: {},
    };

    console.log("📦 Payload final do novo usuário:", payload);

    const { data, error } = await window.db
      .from("usuarios")
      .insert([payload])
      .select("*")
      .single();

    if (error) throw error;

    console.log("✅ Usuário salvo com sucesso na tabela usuarios:", data);

    if (typeof registrarEventoSistema === "function") {
      try {
        await registrarEventoSistema({
          tipo_evento: "usuario",
          modulo: "Configurações",
          acao: "criou usuário manual",
          usuario_alvo: nome,
          perfil_alvo: "usuario",
          autenticacao: "sessao_propria",
          status: "sucesso",
          contexto: {
            email,
            matricula,
            funcao,
            tipo_visao,
            loja_codigo: loja_codigo_final,
            loja_vinculada,
            regional_vinculada: regional_principal_final,
            regionais_vinculadas,
            subregional_vinculada,
          },
        });
      } catch (erroLog) {
        console.warn(
          "⚠️ Não foi possível registrar log do novo usuário:",
          erroLog,
        );
      }
    }

    if (resultadoEl) {
      resultadoEl.innerHTML = `
        <div class="msg-sucesso">
          <strong>✅ Usuário criado com sucesso no sistema!</strong><br><br>

          <div><b>Nome:</b> ${data.nome}</div>
          <div><b>E-mail:</b> ${data.email}</div>
          <div><b>Matrícula:</b> ${data.matricula}</div>
          <div><b>Função:</b> ${data.funcao}</div>
          <div><b>Perfil:</b> ${data.perfil}</div>
          <div><b>Visão:</b> ${data.tipo_visao}</div>
          <div><b>Loja:</b> ${data.loja_vinculada || "-"}</div>
          <div><b>Regional principal:</b> ${data.regional_vinculada || "-"}</div>
          <div><b>Regionais adicionais:</b> ${
            Array.isArray(data.regionais_vinculadas)
              ? data.regionais_vinculadas.join(", ")
              : "-"
          }</div>
          <div><b>Subregional:</b> ${data.subregional_vinculada || "-"}</div>

          <br>
          <small>
            ⚠️ Lembrete: o login deste usuário deve ser criado manualmente no Supabase Auth.
            No primeiro login, o sistema fará o vínculo automático pelo e-mail.
          </small>
        </div>
      `;
    }

    // limpa campos
    document.getElementById("novo_nome").value = "";
    document.getElementById("novo_matricula").value = "";
    document.getElementById("novo_email").value = "";
    document.getElementById("novo_funcao").value = "";
    document.getElementById("novo_loja_codigo").value = "";
    document.getElementById("novo_regional_vinculada").value = "";
    document.getElementById("novo_regionais_vinculadas").value = "";
    document.getElementById("novo_subregional_vinculada").value = "";
  } catch (erro) {
    console.error("❌ Erro ao criar usuário manualmente:", erro);

    const mensagem = erro?.message || "Erro ao criar usuário no sistema.";

    if (resultadoEl) {
      resultadoEl.innerHTML = `
        <div class="msg-erro">
          ❌ ${mensagem}
        </div>
      `;
    }
  }
}

// ==========================
// 🎯 ABRIR TELA DE PERMISSÕES
// ==========================
function abrirTelaPermissoes() {
  console.log("🎯 Abrindo Permissões");

  const container = document.getElementById("config-conteudo");

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
// 🧾 RESUMO DE PERMISSÕES
// ==========================
function resumoPermissoesUsuario(usuario) {
  if (!usuario) return `<span class="perm-vazia">Sem dados</span>`;

  if (usuario.perfil === "master") {
    return `<span class="perm-tag perm-master">Permissões master</span>`;
  }

  const permissoes = usuario.permissoes || {};
  const indicadores = permissoes.indicadores || [];
  const classes = permissoes.classes || [];

  if (permissoes.acesso_total === true || indicadores.includes("todas")) {
    return `<span class="perm-tag perm-total">Todas as tabelas</span>`;
  }

  const lista = [...indicadores, ...classes].filter(Boolean);

  if (!lista.length) {
    return `<span class="perm-vazia">Sem permissões definidas</span>`;
  }

  return lista.map((item) => `<span class="perm-tag">${item}</span>`).join("");
}

// ==========================
// 🔐 REGRA DE EDIÇÃO DE USUÁRIOS
// ==========================
function podeGerenciarUsuarioAlvo(alvo) {
  const user = getUsuarioLogado();
  if (!user || !alvo) return false;

  // 👑 master pode editar qualquer um
  if (user.perfil === "master") return true;

  // admin:
  // - pode editar usuários
  // - pode editar o próprio admin
  // - não edita master
  // - não edita outros admins
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
    const { data, error } = await window.db
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

      let badgePerfil = `<span class="badge-perfil badge-user">${u.perfil}</span>`;

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
          <td class="nome-usuario">${u.nome || "-"}</td>

          <td class="perfil-cell">
            ${badgePerfil}
          </td>

          <td class="permissoes-cell">
            ${resumoPermissoesUsuario(u)}
          </td>

          <td class="acao-cell">
            ${
              podeEditarUsuario
                ? `<button class="btn-acao" onclick="editarPermissoes('${u.id}')">⚙️</button>`
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

    console.log("✅ Lista de permissões carregada");
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
// 💾 AUTOSAVE - STATUS VISUAL
// ==========================
function mostrarStatusAutosaveUsuario(msg, tipo = "info") {
  const el = document.getElementById("status-autosave-usuario");
  if (!el) return;

  el.textContent = msg;
  el.className = `status-autosave ${tipo}`;
}

// ==========================
// 🔢 EXTRAIR CÓDIGO DA LOJA
// fallback para usuários antigos
// ==========================
function extrairCodigoDaLojaVinculada(texto) {
  const valor = (texto || "").toString().trim();
  if (!valor) return "";

  const match = valor.match(/^(\d+)/);
  return match ? match[1] : "";
}

// ==========================
// 🏬 RESOLVER VÍNCULO AUTOMÁTICO
// infere tipo_visao + loja/regional + múltiplas regionais
// ==========================
async function resolverVinculoAutomaticoUsuario({
  loja_codigo,
  regional_vinculada,
  subregional_vinculada,
  regionais_vinculadas,
}) {
  const lojaCodigo = (loja_codigo || "").toString().trim();
  const regional = normalizarTexto(regional_vinculada || "");
  const subregional = (subregional_vinculada || "").toString().trim();
  let regionais = normalizarListaRegionais(regionais_vinculadas || []);

  if (lojaCodigo) {
    const { data: loja, error } = await window.db
      .from("lojas")
      .select("*")
      .eq("codigo", lojaCodigo)
      .single();

    if (error || !loja) {
      throw new Error("Número da loja não encontrado na base.");
    }

    const regionalFinal = normalizarTexto(loja.regional || regional || "");

    if (regionalFinal && !regionais.includes(regionalFinal)) {
      regionais.push(regionalFinal);
    }

    regionais = [...new Set(regionais)];

    return {
      tipo_visao: "gerencial",
      loja_codigo: String(loja.codigo),
      loja_vinculada: `${loja.codigo} - ${loja.nome}`,
      regional_vinculada: regionalFinal || null,
      regionais_vinculadas: regionais,
      subregional_vinculada: subregional || null,
    };
  }

  if (!regional) {
    throw new Error("Informe o número da loja ou a regional vinculada.");
  }

  if (!regionais.includes(regional)) {
    regionais.unshift(regional);
  }

  regionais = [...new Set(regionais)];

  return {
    tipo_visao: "regional",
    loja_codigo: null,
    loja_vinculada: null,
    regional_vinculada: regional,
    regionais_vinculadas: regionais,
    subregional_vinculada: subregional || null,
  };
}

// ==========================
// 📦 COLETAR CAMPOS DA AÇÃO
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
    loja_codigo:
      document.getElementById("edit_perm_loja_codigo")?.value.trim() || "",
    regional_vinculada:
      document.getElementById("edit_perm_regional_vinculada")?.value.trim() ||
      "",
    regionais_vinculadas:
      document
        .getElementById("edit_perm_regionais_vinculadas")
        ?.value.trim() || "",
    subregional_vinculada:
      document
        .getElementById("edit_perm_subregional_vinculada")
        ?.value.trim() || "",
    perfil: document.getElementById("edit_perm_perfil")?.value || undefined,
  };
}

// ==========================
// 💾 AUTOSAVE USUÁRIO (AÇÃO)
// ==========================
let autosaveUsuarioTimer = null;

async function autoSalvarUsuarioAcao(id, campoOrigem = "manual") {
  try {
    clearTimeout(autosaveUsuarioTimer);

    autosaveUsuarioTimer = setTimeout(async () => {
      try {
        mostrarStatusAutosaveUsuario("🔄 Salvando...", "info");

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
            "erro",
          );
          return;
        }

        const vinculoResolvido = await resolverVinculoAutomaticoUsuario({
          loja_codigo: dados.loja_codigo,
          regional_vinculada: dados.regional_vinculada,
          subregional_vinculada: dados.subregional_vinculada,
          regionais_vinculadas: dados.regionais_vinculadas,
        });

        const payload = {
          nome: dados.nome,
          matricula: dados.matricula,
          email: dados.email,
          funcao: dados.funcao,

          tipo_visao: vinculoResolvido.tipo_visao,
          loja_codigo: vinculoResolvido.loja_codigo,
          loja_vinculada: vinculoResolvido.loja_vinculada,
          regional_vinculada: vinculoResolvido.regional_vinculada,
          regionais_vinculadas: vinculoResolvido.regionais_vinculadas,
          subregional_vinculada: vinculoResolvido.subregional_vinculada,
        };

        if (isMaster && dados.perfil) {
          payload.perfil = dados.perfil;
        }

        const { error } = await window.db
          .from("usuarios")
          .update(payload)
          .eq("id", id);

        if (error) throw error;

        // feedback visual
        const infoVisao = document.getElementById("info_tipo_visao_inferida");
        if (infoVisao) {
          infoVisao.value = vinculoResolvido.tipo_visao;
        }

        const infoLoja = document.getElementById("info_loja_inferida");
        if (infoLoja) {
          infoLoja.value = vinculoResolvido.loja_vinculada || "-";
        }

        const infoRegional = document.getElementById("info_regional_inferida");
        if (infoRegional) {
          infoRegional.value = vinculoResolvido.regional_vinculada || "-";
        }

        const infoRegionaisLista = document.getElementById(
          "info_regionais_inferidas",
        );
        if (infoRegionaisLista) {
          infoRegionaisLista.value =
            vinculoResolvido.regionais_vinculadas?.join(", ") || "-";
        }

        mostrarStatusAutosaveUsuario("✅ Salvo automaticamente", "sucesso");

        if (typeof registrarEventoSistema === "function") {
          await registrarEventoSistema({
            tipo_evento: "usuario",
            modulo: "Permissões",
            acao: "atualizou dados de ação/vínculo",
            usuario_alvo: dados.nome,
            perfil_alvo: payload.perfil,
            autenticacao: "sessao_propria",
            status: "sucesso",
            contexto: {
              campoOrigem,
              matricula: dados.matricula,
              email: dados.email,
              funcao: dados.funcao,
              tipo_visao: vinculoResolvido.tipo_visao,
              loja_codigo: vinculoResolvido.loja_codigo,
              loja_vinculada: vinculoResolvido.loja_vinculada,
              regional_vinculada: vinculoResolvido.regional_vinculada,
              regionais_vinculadas: vinculoResolvido.regionais_vinculadas,
              subregional_vinculada: vinculoResolvido.subregional_vinculada,
            },
          });
        }

        console.log("✅ Autosave concluído com sucesso");
      } catch (erroInterno) {
        console.error("❌ Erro no autosave do usuário:", erroInterno);
        mostrarStatusAutosaveUsuario(
          `❌ ${erroInterno.message || "Erro ao salvar automaticamente."}`,
          "erro",
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
    "edit_perm_loja_codigo",
    "edit_perm_subregional_vinculada",
    "edit_perm_regionais_vinculadas",
  ];

  const camposChange = ["edit_perm_regional_vinculada", "edit_perm_perfil"];

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
}

// ==========================
// ⚙️ EDITAR PERMISSÕES + AÇÃO + VÍNCULO
// autosave nos campos principais
// ==========================
async function editarPermissoes(id) {
  console.log("⚙️ Editando permissões / vínculo:", id);

  const container = document.getElementById("config-conteudo");
  if (!container) return;

  container.innerHTML = `
    <div class="card-conteudo">
      <h3>⚙️ Carregando permissões...</h3>
    </div>
  `;

  try {
    const { data, error } = await window.db
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw error || new Error("Usuário não encontrado");
    }

    const userAtual = getUsuarioLogado();
    const isMaster = userAtual?.perfil === "master";

    const regionais = await buscarRegionaisDisponiveis();

    const optionsRegionais = regionais
      .map((r) => {
        return `<option value="${r}" ${
          normalizarTexto(data.regional_vinculada) === normalizarTexto(r)
            ? "selected"
            : ""
        }>${r}</option>`;
      })
      .join("");

    const lojaCodigoAtual =
      data.loja_codigo || extrairCodigoDaLojaVinculada(data.loja_vinculada);

    const regionaisTexto = listaRegionaisParaTexto(data.regionais_vinculadas);

    const agrupado = {};

    if (typeof mapaClasse === "object") {
      Object.entries(mapaClasse).forEach(([indicador, classe]) => {
        if (!agrupado[classe]) agrupado[classe] = [];
        if (!agrupado[classe].includes(indicador)) {
          agrupado[classe].push(indicador);
        }
      });
    }

    const atuais = data.permissoes?.indicadores || [];

    let html = `
      <div class="card-conteudo">
        <h3>⚙️ Permissões / Ação / Vínculo - ${data.nome}</h3>

        <div id="status-autosave-usuario" class="status-autosave neutro">
          ℹ️ Altere um campo para salvar automaticamente.
        </div>

        <div class="form-grid">

          <div class="campo">
            <label>Nome *</label>
            <input id="edit_perm_nome" value="${data.nome || ""}">
          </div>

          <div class="campo">
            <label>Matrícula *</label>
            <input id="edit_perm_matricula" value="${data.matricula || ""}">
          </div>

          <div class="campo">
            <label>E-mail *</label>
            <input id="edit_perm_email" value="${data.email || ""}">
          </div>

          <div class="campo">
            <label>Função *</label>
            <input id="edit_perm_funcao" value="${data.funcao || ""}">
          </div>

          ${
            isMaster
              ? `
                <div class="campo">
                  <label>Perfil</label>
                  <select id="edit_perm_perfil">
                    <option value="usuario" ${data.perfil === "usuario" ? "selected" : ""}>usuario</option>
                    <option value="admin" ${data.perfil === "admin" ? "selected" : ""}>admin</option>
                    <option value="master" ${data.perfil === "master" ? "selected" : ""}>master</option>
                  </select>
                </div>
              `
              : ""
          }

          <div class="campo">
            <label>Número da loja</label>
            <input id="edit_perm_loja_codigo" value="${lojaCodigoAtual || ""}" placeholder="Ex.: 305">
          </div>

          <div class="campo">
            <label>Regional principal</label>
            <select id="edit_perm_regional_vinculada">
              <option value="">Selecione</option>
              ${optionsRegionais}
            </select>
          </div>

          <div class="campo">
            <label>Regionais adicionais</label>
            <input id="edit_perm_regionais_vinculadas" value="${regionaisTexto || ""}" placeholder="Ex.: NE1, NE2">
          </div>

          <div class="campo">
            <label>Subregional vinculada</label>
            <input id="edit_perm_subregional_vinculada" value="${data.subregional_vinculada || ""}">
          </div>

          <div class="campo">
            <label>Tipo de visão inferida</label>
            <input id="info_tipo_visao_inferida" value="${data.tipo_visao || "-"}" disabled>
          </div>

          <div class="campo">
            <label>Loja inferida</label>
            <input id="info_loja_inferida" value="${data.loja_vinculada || "-"}" disabled>
          </div>

          <div class="campo">
            <label>Regional inferida</label>
            <input id="info_regional_inferida" value="${data.regional_vinculada || "-"}" disabled>
          </div>

          <div class="campo">
            <label>Regionais inferidas</label>
            <input id="info_regionais_inferidas" value="${regionaisTexto || "-"}" disabled>
          </div>

        </div>

        <hr style="margin:18px 0; border:none; border-top:1px solid #eee;">

        <h4>Permissões por indicador</h4>
    `;

    Object.keys(agrupado).forEach((classe) => {
      html += `
        <div class="grupo-permissao">
          <h4>${classe}</h4>
          <div class="permissoes-grid">
      `;

      agrupado[classe].forEach((indicador) => {
        html += `
          <label class="check-item">
            <input
              type="checkbox"
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

    container.innerHTML = html;

    ativarAutosaveEdicaoUsuario(data.id);
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
// mantém compatibilidade com botão manual
// ==========================
async function salvarPermissoes(id) {
  const checks = document.querySelectorAll(
    "#config-conteudo input[type=checkbox]:checked",
  );

  const selecionados = [...checks].map((c) => c.value);

  const dados = coletarCamposEdicaoUsuario();
  const user = getUsuarioLogado();
  const isMaster = user?.perfil === "master";

  console.log("💾 Salvando permissões + vínculo manual:", {
    id,
    dados,
    selecionados,
  });

  if (!dados.nome || !dados.matricula || !dados.email || !dados.funcao) {
    alert("⚠️ Nome, matrícula, e-mail e função são obrigatórios.");
    return;
  }

  try {
    const vinculoResolvido = await resolverVinculoAutomaticoUsuario({
      loja_codigo: dados.loja_codigo,
      regional_vinculada: dados.regional_vinculada,
      subregional_vinculada: dados.subregional_vinculada,
      regionais_vinculadas: dados.regionais_vinculadas,
    });

    const payload = {
      nome: dados.nome,
      matricula: dados.matricula,
      email: dados.email,
      funcao: dados.funcao,
      tipo_visao: vinculoResolvido.tipo_visao,
      loja_codigo: vinculoResolvido.loja_codigo,
      loja_vinculada: vinculoResolvido.loja_vinculada,
      regional_vinculada: vinculoResolvido.regional_vinculada,
      regionais_vinculadas: vinculoResolvido.regionais_vinculadas,
      subregional_vinculada: vinculoResolvido.subregional_vinculada,
      permissoes: {
        indicadores: selecionados,
        classes: [],
        acesso_total: false,
      },
    };

    if (isMaster && dados.perfil) {
      payload.perfil = dados.perfil;
    }

    const { error } = await window.db
      .from("usuarios")
      .update(payload)
      .eq("id", id);

    if (error) throw error;

    alert("✅ Permissões / vínculo atualizados!");

    if (typeof registrarEventoSistema === "function") {
      await registrarEventoSistema({
        tipo_evento: "permissao",
        modulo: "Permissões",
        acao: "atualizou permissões e vínculo",
        usuario_alvo: dados.nome,
        perfil_alvo: isMaster ? dados.perfil : undefined,
        autenticacao: "sessao_propria",
        status: "sucesso",
        contexto: {
          indicadores: selecionados,
          tipo_visao: vinculoResolvido.tipo_visao,
          loja_codigo: vinculoResolvido.loja_codigo,
          loja_vinculada: vinculoResolvido.loja_vinculada,
          regional_vinculada: vinculoResolvido.regional_vinculada,
          regionais_vinculadas: vinculoResolvido.regionais_vinculadas,
          subregional_vinculada: vinculoResolvido.subregional_vinculada,
          funcao: dados.funcao,
          matricula: dados.matricula,
        },
      });
    }

    abrirTelaPermissoes();
  } catch (erro) {
    console.error("❌ Erro ao salvar permissões:", erro);
    alert("❌ Erro ao salvar permissões / vínculo.");
  }
}

// ==========================
// 🧾 LOG DE ALTERAÇÃO
// ==========================
async function registrarLog(dados) {
  try {
    const user = getUsuarioLogado();

    await window.db.from("auditoria").insert([
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

// ==========================
// 📊 AUDITORIA LEGADA
// (mantida por compatibilidade)
// ==========================
async function abrirAuditoria() {
  console.log("📊 abrirAuditoria legado chamado");

  if (typeof abrirLogsSistema === "function") {
    abrirLogsSistema();
    return;
  }

  const container = document.getElementById("config-conteudo");

  container.innerHTML = `
    <div class="card-conteudo">
      <h2>📊 Histórico de Alterações</h2>
      <p>Carregando registros...</p>
    </div>
  `;

  try {
    const { data, error } = await window.db
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