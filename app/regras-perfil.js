// ==========================
// 🔐 CONFIG GLOBAL PERFIL
// ==========================
let usuarioLogado = null;
let usuarioPermissoesEditando = null;
let autosaveUsuarioTimer = null;

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
    return valor.map((v) => normalizarTexto(v)).filter(Boolean);
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
  return lista
    .map((v) => normalizarTexto(v))
    .filter(Boolean)
    .join(", ");
}

// ==========================
// 👁️ PERMISSÃO DE VISUALIZAÇÃO
// ==========================
function normalizarPermissaoVisualizacao(valor) {
  const texto = normalizarTextoSemAcento(valor || "").toUpperCase();

  if (!texto) return "TODOS";

  if (
    texto === "TODOS" ||
    texto === "TOTAL" ||
    texto === "GLOBAL" ||
    texto === "TUDO"
  ) {
    return "TODOS";
  }

  if (
    texto === "NE1 E NE2" ||
    texto === "NE1/NE2" ||
    texto === "NE1_NE2" ||
    texto === "NE1, NE2" ||
    texto === "NE1 E  NE2"
  ) {
    return "NE1_NE2";
  }

  return "TODOS";
}

function getRegionaisDaPermissaoVisualizacao(valor) {
  const modo = normalizarPermissaoVisualizacao(valor);

  if (modo === "NE1_NE2") {
    return ["NE1", "NE2"];
  }

  return [];
}

function getRestricaoVisualizacaoUsuario(user = null) {
  const usuario = user || getUsuarioLogado();
  const permissoesSistema = getPermissoesSistemaUsuario(usuario);

  const modo = normalizarPermissaoVisualizacao(
    permissoesSistema.permissao_visualizacao,
  );

  return {
    modo,
    regionais: getRegionaisDaPermissaoVisualizacao(modo),
  };
}

function regionalPermitidaPorVisualizacao(regionalLinha, user = null) {
  const restricao = getRestricaoVisualizacaoUsuario(user);
  const regionalNorm = normalizarTexto(regionalLinha);

  if (restricao.modo === "TODOS") return true;
  if (!restricao.regionais.length) return true;

  return restricao.regionais.includes(regionalNorm);
}

// ==========================
// 🧠 PERMISSÕES BASE POR PERFIL
// master > admin > usuario
// ==========================
// ==========================
// 🧠 PERMISSÕES BASE POR PERFIL
// master > admin > usuario
// ==========================
function getPermissoesBasePorPerfil(perfil) {
  const perfilNorm = normalizarTextoLower(perfil);

  if (perfilNorm === "master") {
    return {
      pode_editar_semana_atual: true,
      pode_editar_semana_anterior: true,
      pode_editar_qualquer_semana: true,

      pode_gerenciar_usuarios: true,
      pode_gerenciar_funcoes: true,
      pode_ver_dashboard: true,
      pode_ver_analises: true,
      pode_ver_comparativos: true,
      pode_ver_justificativas: true,
      pode_aprovar_ajustes: true,
      pode_atribuir_escopo: true,

      permissao_visualizacao: "TODOS",
    };
  }

  if (perfilNorm === "admin") {
    return {
      pode_editar_semana_atual: true,
      pode_editar_semana_anterior: true,
      pode_editar_qualquer_semana: false,

      pode_gerenciar_usuarios: true,
      pode_gerenciar_funcoes: false,
      pode_ver_dashboard: true,
      pode_ver_analises: true,
      pode_ver_comparativos: true,
      pode_ver_justificativas: true,
      pode_aprovar_ajustes: true,
      pode_atribuir_escopo: false,

      permissao_visualizacao: "TODOS",
    };
  }

  return {
    pode_editar_semana_atual: true,
    pode_editar_semana_anterior: false,
    pode_editar_qualquer_semana: false,

    pode_gerenciar_usuarios: false,
    pode_gerenciar_funcoes: false,
    pode_ver_dashboard: true,
    pode_ver_analises: true,
    pode_ver_comparativos: true,
    pode_ver_justificativas: false,
    pode_aprovar_ajustes: false,
    pode_atribuir_escopo: false,

    permissao_visualizacao: "TODOS",
  };
}

// ==========================
// 🔐 PERMISSÕES EFETIVAS DO USUÁRIO
// mistura base do perfil + overrides salvos
// ==========================
// ==========================
// 🔐 PERMISSÕES EFETIVAS DO USUÁRIO
// mistura base do perfil + overrides salvos
// ==========================
function getPermissoesSistemaUsuario(user = null) {
  const usuario = user || getUsuarioLogado();
  if (!usuario) {
    return getPermissoesBasePorPerfil("usuario");
  }

  const base = getPermissoesBasePorPerfil(usuario.perfil);
  const perms = usuario.permissoes || {};

  return {
    ...base,

    pode_editar_semana_atual:
      perms.pode_editar_semana_atual ?? base.pode_editar_semana_atual,

    pode_editar_semana_anterior:
      perms.pode_editar_semana_anterior ?? base.pode_editar_semana_anterior,

    pode_editar_qualquer_semana:
      perms.pode_editar_qualquer_semana ?? base.pode_editar_qualquer_semana,

    pode_gerenciar_usuarios:
      perms.pode_gerenciar_usuarios ?? base.pode_gerenciar_usuarios,

    pode_gerenciar_funcoes:
      perms.pode_gerenciar_funcoes ?? base.pode_gerenciar_funcoes,

    pode_ver_dashboard: perms.pode_ver_dashboard ?? base.pode_ver_dashboard,

    pode_ver_analises: perms.pode_ver_analises ?? base.pode_ver_analises,

    pode_ver_comparativos:
      perms.pode_ver_comparativos ?? base.pode_ver_comparativos,

    pode_ver_justificativas:
      perms.pode_ver_justificativas ?? base.pode_ver_justificativas,

    pode_aprovar_ajustes:
      perms.pode_aprovar_ajustes ?? base.pode_aprovar_ajustes,

    pode_atribuir_escopo:
      perms.pode_atribuir_escopo ?? base.pode_atribuir_escopo,

    permissao_visualizacao: normalizarPermissaoVisualizacao(
      perms.permissao_visualizacao ?? base.permissao_visualizacao,
    ),
  };
}

// ==========================
// 🔄 USUÁRIO LOGADO
// ==========================
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

    const permissoesSistema = getPermissoesSistemaUsuario(user);

    usuarioLogado = {
      ...user,
      perfil: normalizarTextoLower(user.perfil),
      tipo_visao: normalizarTextoLower(user.tipo_visao),

      loja_codigo: user.loja_codigo || null,
      loja_vinculada: user.loja_vinculada || null,
      regional_vinculada: user.regional_vinculada || null,
      regionais_vinculadas: normalizarListaRegionais(user.regionais_vinculadas),

      pode_editar_semana_atual: permissoesSistema.pode_editar_semana_atual,
      pode_editar_semana_anterior:
        permissoesSistema.pode_editar_semana_anterior,
      pode_editar_qualquer_semana:
        permissoesSistema.pode_editar_qualquer_semana,

      pode_gerenciar_usuarios: permissoesSistema.pode_gerenciar_usuarios,
      pode_gerenciar_funcoes: permissoesSistema.pode_gerenciar_funcoes,
      pode_ver_dashboard: permissoesSistema.pode_ver_dashboard,
      pode_ver_analises: permissoesSistema.pode_ver_analises,
      pode_ver_comparativos: permissoesSistema.pode_ver_comparativos,
      pode_ver_justificativas: permissoesSistema.pode_ver_justificativas,
      pode_aprovar_ajustes: permissoesSistema.pode_aprovar_ajustes,
      pode_atribuir_escopo: permissoesSistema.pode_atribuir_escopo,

      permissao_visualizacao: permissoesSistema.permissao_visualizacao,
    };

    // mantém regional principal apenas como referência cadastral
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

    usuarioLogado.regionais_vinculadas = [
      ...new Set(usuarioLogado.regionais_vinculadas),
    ];

    console.log("👤 Usuário:", {
      nome: usuarioLogado.nome,
      perfil: usuarioLogado.perfil,
      loja_codigo: usuarioLogado.loja_codigo,
      loja_vinculada: usuarioLogado.loja_vinculada,
      regional_vinculada: usuarioLogado.regional_vinculada,
      regionais_vinculadas: usuarioLogado.regionais_vinculadas,
      permissao_visualizacao: usuarioLogado.permissao_visualizacao,
      pode_editar_semana_atual: usuarioLogado.pode_editar_semana_atual,
      pode_editar_semana_anterior: usuarioLogado.pode_editar_semana_anterior,
      pode_editar_qualquer_semana: usuarioLogado.pode_editar_qualquer_semana,
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
// ==========================
// 🧠 CONTEXTO DE ESCOPO DO USUÁRIO
// ==========================
function getEscopoUsuarioSistema(user = null) {
  const usuario = user || getUsuarioLogado();
  const restricaoVisualizacao = getRestricaoVisualizacaoUsuario(usuario);

  if (!usuario) {
    return {
      tipo: "global",
      loja_vinculada: null,
      regional_vinculada: null,
      regionais_vinculadas: [],
      permissao_visualizacao: restricaoVisualizacao.modo,
      regionais_visuais: restricaoVisualizacao.regionais,
    };
  }

  // master vê tudo
  if (usuario.perfil === "master") {
    return {
      tipo: "global",
      loja_vinculada: null,
      regional_vinculada: null,
      regionais_vinculadas: [],
      permissao_visualizacao: restricaoVisualizacao.modo,
      regionais_visuais: restricaoVisualizacao.regionais,
    };
  }

  // admin corporativo sem vínculos = global
  const semLoja = !usuario.loja_vinculada && !usuario.loja_codigo;
  const semRegionais =
    !usuario.regionais_vinculadas || !usuario.regionais_vinculadas.length;

  if (usuario.perfil === "admin" && semLoja && semRegionais) {
    return {
      tipo: "global",
      loja_vinculada: null,
      regional_vinculada: null,
      regionais_vinculadas: [],
      permissao_visualizacao: restricaoVisualizacao.modo,
      regionais_visuais: restricaoVisualizacao.regionais,
    };
  }

  // loja vinculada continua sendo escopo forte
  if (usuario.loja_vinculada || usuario.loja_codigo) {
    return {
      tipo: "loja",
      loja_vinculada: usuario.loja_vinculada || usuario.loja_codigo || null,
      regional_vinculada: usuario.regional_vinculada || null,
      regionais_vinculadas: normalizarListaRegionais(
        usuario.regionais_vinculadas,
      ),
      permissao_visualizacao: restricaoVisualizacao.modo,
      regionais_visuais: restricaoVisualizacao.regionais,
    };
  }

  // escopo regional respeita principalmente a lista de regionais adicionais
  if (usuario.regionais_vinculadas && usuario.regionais_vinculadas.length) {
    return {
      tipo: "regional",
      loja_vinculada: null,
      regional_vinculada: usuario.regional_vinculada || null,
      regionais_vinculadas: normalizarListaRegionais(
        usuario.regionais_vinculadas,
      ),
      permissao_visualizacao: restricaoVisualizacao.modo,
      regionais_visuais: restricaoVisualizacao.regionais,
    };
  }

  return {
    tipo: "global",
    loja_vinculada: null,
    regional_vinculada: usuario.regional_vinculada || null,
    regionais_vinculadas: [],
    permissao_visualizacao: restricaoVisualizacao.modo,
    regionais_visuais: restricaoVisualizacao.regionais,
  };
}

// ==========================
// 🏬 MATCH DE LOJA NO ESCOPO
// ==========================
function lojaDentroDoEscopoUsuario(codigo, nomeLoja, lojaVinculada) {
  if (!lojaVinculada) return true;

  const codigoNorm = normalizarTexto(codigo);
  const nomeNorm = normalizarTexto(nomeLoja);
  const chaveLoja = normalizarTexto(`${codigo} - ${nomeLoja}`);
  const vinculo = normalizarTexto(lojaVinculada);

  if (vinculo === codigoNorm) return true;
  if (vinculo === chaveLoja) return true;
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

  // regional principal isolada agora é mais informativa,
  // mas mantemos compatibilidade com usuários antigos
  if (!regionalVinculada) return true;

  return regionalNorm === normalizarTexto(regionalVinculada);
}

// ==========================
// 📅 SEMANA ANTERIOR
// ==========================
function getSemanaAnterior(semanaAtual) {
  const atual = Number(semanaAtual);

  if (atual <= 1) return 53;
  return atual - 1;
}

// ==========================
// 📅 JANELA DE EDIÇÃO
// ==========================
function podeEditarNaJanela(user, semanaInformada, semanaAtual) {
  const usuario = user || getUsuarioLogado();
  if (!usuario) return false;

  const permissoes = getPermissoesSistemaUsuario(usuario);

  const s = Number(semanaInformada);
  const atual = Number(semanaAtual);

  if (permissoes.pode_editar_qualquer_semana) {
    return true;
  }

  if (permissoes.pode_editar_semana_anterior) {
    return s <= atual;
  }

  if (permissoes.pode_editar_semana_atual) {
    return s === atual;
  }

  return false;
}

// ==========================
// 🔍 MOTIVO DO BLOQUEIO
// ==========================
// ==========================
// 🔍 MOTIVO DO BLOQUEIO
// ==========================
function getMotivoBloqueio(indicador, classe, semana) {
  const user = getUsuarioLogado();
  if (!user) return "Usuário não autenticado";

  const semanaAtual = getSemanaAtual().toString().padStart(2, "0");
  const semanaInformada = String(semana).padStart(2, "0");

  const permissoesSistema = getPermissoesSistemaUsuario(user);

  const permissoesIndicadores = user.permissoes || {};
  const indicadores = (permissoesIndicadores.indicadores || []).map(
    normalizarTexto,
  );
  const classes = (permissoesIndicadores.classes || []).map(normalizarTexto);

  const indicadorNorm = normalizarTexto(indicador);
  const classeNorm = normalizarTexto(classe);

  const acessoTotalIndicadores =
    permissoesIndicadores.acesso_total === true ||
    indicadores.includes("TODAS") ||
    indicadores.includes("TODAS AS TABELAS") ||
    indicadores.includes("TODOS OS INDICADORES");

  const permitidoIndicador =
    acessoTotalIndicadores ||
    indicadores.includes(indicadorNorm) ||
    classes.includes(classeNorm) ||
    user.perfil === "master";

  console.log("🔍 Permissão check:", {
    user: user.nome,
    perfil: user.perfil,
    indicador: indicadorNorm,
    classe: classeNorm,
    semana: semanaInformada,
    semanaAtual,
    permitidoIndicador,
    permissoesSistema,
    indicadores,
    classes,
    acessoTotalIndicadores,
  });

  if (user.perfil === "master") return null;

  if (!permitidoIndicador) {
    return "Sem permissão para este indicador/tabela";
  }

  const dentroDaJanela = podeEditarNaJanela(
    user,
    Number(semanaInformada),
    Number(semanaAtual),
  );

  if (!dentroDaJanela) {
    if (permissoesSistema.pode_editar_qualquer_semana) {
      return null;
    }

    if (permissoesSistema.pode_editar_semana_anterior) {
      return "Você não pode editar esta semana.";
    }

    if (permissoesSistema.pode_editar_semana_atual) {
      return "Você só pode editar a semana atual.";
    }

    return "Prazo encerrado. Somente com desbloqueio do Master.";
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
// ==========================
function aplicarEscopoVisualTabela() {
  const user = getUsuarioLogado();
  if (!user) return;

  const escopo = getEscopoUsuarioSistema(user);

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

      // regra adicional de visualização do sistema
      if (visivel && escopo.regionais_visuais?.length) {
        visivel = regionalDentroDoEscopoUsuario(
          regional,
          null,
          escopo.regionais_visuais,
        );
      }

      row.dataset.escopoPermitido = visivel ? "true" : "false";
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

  aplicarEscopoVisualTabela();
}

// ==========================
// 🔐 GERAR SENHA ALEATÓRIA
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
// 🌍 REGIONAIS DISPONÍVEIS
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

  const isMaster = user.perfil === "master";
  const isAdmin = user.perfil === "admin";
  const podeGerenciarUsuarios = user.pode_gerenciar_usuarios === true;

  document.getElementById("conteudo").innerHTML = `
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
              ? `
                <button onclick="abrirLogsSistema()">📋 Logs do Sistema</button>
              `
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
// ==========================
function novoUsuario() {
  console.log("➕ Novo Usuário (modo manual)");

  const user = getUsuarioLogado();
  if (!user) return;

  const isMaster = user.perfil === "master";

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

        <div class="campo">
          <label>Número da loja</label>
          <input id="novo_loja_codigo" placeholder="Ex.: 305">
          <small>Opcional. Se preencher a loja, a visão gerencial será aplicada automaticamente.</small>
        </div>

        <div class="campo">
          <label>Regional principal</label>
          <input id="novo_regional_vinculada" placeholder="Ex.: NE1">
          <small>Informativo. Não limita visualização.</small>
        </div>

        <div class="campo">
          <label>Regionais adicionais</label>
          <input id="novo_regionais_vinculadas" placeholder="Ex.: NE1, NE2">
          <small>Opcional. Separe por vírgula.</small>
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
// ==========================
// ==========================
// 💾 SALVAR NOVO USUÁRIO (MANUAL)
// ==========================
async function salvarNovoUsuario() {
  const nome = document.getElementById("novo_nome")?.value.trim();
  const matricula = document.getElementById("novo_matricula")?.value.trim();
  const email = document
    .getElementById("novo_email")
    ?.value.trim()
    .toLowerCase();
  const funcao = document.getElementById("novo_funcao")?.value.trim();

  const perfil =
    document.getElementById("novo_perfil")?.value?.trim() || "usuario";

  const loja_codigo =
    document.getElementById("novo_loja_codigo")?.value.trim() || null;

  const regional_vinculada =
    document.getElementById("novo_regional_vinculada")?.value.trim() || null;

  const regionais_vinculadas_raw =
    document.getElementById("novo_regionais_vinculadas")?.value.trim() || "";

  const resultadoEl = document.getElementById("resultado-novo-usuario");

  console.log("💾 Criando usuário no modo manual...", {
    nome,
    matricula,
    email,
    funcao,
    perfil,
    loja_codigo,
    regional_vinculada,
    regionais_vinculadas_raw,
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

  try {
    if (resultadoEl) {
      resultadoEl.innerHTML = `
        <div class="msg-sucesso">
          🔄 Salvando usuário no sistema...
        </div>
      `;
    }

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

    const vinculoResolvido = await resolverVinculoAutomaticoUsuario({
      loja_codigo,
      regional_vinculada,
      regionais_vinculadas: regionais_vinculadas_raw,
      perfil,
    });

    const permissoesBase = getPermissoesBasePorPerfil(perfil);

    const payload = {
      auth_user_id: null,
      nome,
      sobrenome: "",
      matricula,
      email,
      funcao,
      perfil,

      tipo_visao: vinculoResolvido.tipo_visao,
      loja_codigo: vinculoResolvido.loja_codigo,
      loja_vinculada: vinculoResolvido.loja_vinculada,
      regional_vinculada: regional_vinculada
        ? normalizarTexto(regional_vinculada)
        : null,
      regionais_vinculadas: vinculoResolvido.regionais_vinculadas,

      primeiro_acesso: true,
      permissoes: {
        indicadores: [],
        classes: [],
        acesso_total: perfil === "master",
        permissao_visualizacao: permissoesBase.permissao_visualizacao || "TODOS",
        ...permissoesBase,
      },
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
          perfil_alvo: perfil,
          autenticacao: "sessao_propria",
          status: "sucesso",
          contexto: {
            email,
            matricula,
            funcao,
            tipo_visao: vinculoResolvido.tipo_visao,
            loja_codigo: vinculoResolvido.loja_codigo,
            loja_vinculada: vinculoResolvido.loja_vinculada,
            regional_vinculada: regional_vinculada
              ? normalizarTexto(regional_vinculada)
              : null,
            regionais_vinculadas: vinculoResolvido.regionais_vinculadas,
            permissao_visualizacao:
              permissoesBase.permissao_visualizacao || "TODOS",
          },
        });
      } catch (erroLog) {
        console.warn(
          "⚠️ Não foi possível registrar log do novo usuário:",
          erroLog
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
          <div><b>Loja:</b> ${data.loja_vinculada || "-"}</div>
          <div><b>Regional principal:</b> ${data.regional_vinculada || "-"}</div>
          <div><b>Regionais adicionais:</b> ${
            Array.isArray(data.regionais_vinculadas)
              ? data.regionais_vinculadas.join(", ")
              : "-"
          }</div>

          <br>
          <small>
            ⚠️ Lembrete: o login deste usuário deve ser criado manualmente no Supabase Auth.
            No primeiro login, o sistema fará o vínculo automático pelo e-mail.
          </small>
        </div>
      `;
    }

    document.getElementById("novo_nome").value = "";
    document.getElementById("novo_matricula").value = "";
    document.getElementById("novo_email").value = "";
    document.getElementById("novo_funcao").value = "";
    document.getElementById("novo_loja_codigo").value = "";
    document.getElementById("novo_regional_vinculada").value = "";
    document.getElementById("novo_regionais_vinculadas").value = "";
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

  const perfil = normalizarTextoLower(usuario.perfil);
  const permissoesSistema = getPermissoesSistemaUsuario(usuario);

  const tags = [];

  if (perfil === "master") {
    tags.push(`<span class="perm-tag perm-master">Master total</span>`);
  }

  if (permissoesSistema.pode_editar_qualquer_semana) {
    tags.push(`<span class="perm-tag perm-total">Qualquer semana</span>`);
  } else if (permissoesSistema.pode_editar_semana_anterior) {
    tags.push(`<span class="perm-tag">Semana atual + anteriores</span>`);
  } else if (permissoesSistema.pode_editar_semana_atual) {
    tags.push(`<span class="perm-tag">Semana atual</span>`);
  }

  if (permissoesSistema.pode_gerenciar_usuarios) {
    tags.push(`<span class="perm-tag">Gerencia usuários</span>`);
  }

  if (permissoesSistema.permissao_visualizacao === "NE1_NE2") {
    tags.push(`<span class="perm-tag">Visualização: NE1 e NE2</span>`);
  } else {
    tags.push(`<span class="perm-tag">Visualização: Todos</span>`);
  }

  const permissoes = usuario.permissoes || {};
  const indicadores = (permissoes.indicadores || []).map(normalizarTexto);
  const classes = (permissoes.classes || []).map(normalizarTexto);

  if (
    permissoes.acesso_total === true ||
    indicadores.includes("TODAS") ||
    indicadores.includes("TODAS AS TABELAS") ||
    indicadores.includes("TODOS OS INDICADORES")
  ) {
    tags.push(`<span class="perm-tag perm-total">Todos os indicadores</span>`);
  } else {
    classes.slice(0, 2).forEach((item) => {
      tags.push(`<span class="perm-tag perm-total">${item} completo</span>`);
    });

    indicadores.slice(0, 4).forEach((item) => {
      tags.push(`<span class="perm-tag">${item}</span>`);
    });

    const totalItens = classes.length + indicadores.length;
    if (totalItens > 6) {
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
// ==========================
function extrairCodigoDaLojaVinculada(texto) {
  const valor = (texto || "").toString().trim();
  if (!valor) return "";

  const match = valor.match(/^(\d+)/);
  return match ? match[1] : "";
}

// ==========================
// 🏬 RESOLVER VÍNCULO AUTOMÁTICO
// ==========================
async function resolverVinculoAutomaticoUsuario({
  loja_codigo,
  regional_vinculada,
  regionais_vinculadas,
  perfil,
}) {
  const perfilNorm = normalizarTextoLower(perfil || "usuario");
  const lojaCodigo = (loja_codigo || "").toString().trim();
  const regionalInfo = normalizarTexto(regional_vinculada || "");
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

    const regionalDaLoja = normalizarTexto(loja.regional || "");

    if (regionalDaLoja && !regionais.includes(regionalDaLoja)) {
      regionais.push(regionalDaLoja);
    }

    regionais = [...new Set(regionais)];

    return {
      tipo_visao: "gerencial",
      loja_codigo: String(loja.codigo),
      loja_vinculada: `${loja.codigo} - ${loja.nome}`,
      regional_vinculada: regionalInfo || null,
      regionais_vinculadas: regionais,
    };
  }

  if (regionais.length) {
    return {
      tipo_visao: "regional",
      loja_codigo: null,
      loja_vinculada: null,
      regional_vinculada: regionalInfo || null,
      regionais_vinculadas: [...new Set(regionais)],
    };
  }

  if (regionalInfo) {
    return {
      tipo_visao: "regional",
      loja_codigo: null,
      loja_vinculada: null,
      regional_vinculada: regionalInfo,
      regionais_vinculadas: [],
    };
  }

  if (perfilNorm === "master" || perfilNorm === "admin") {
    return {
      tipo_visao: "regional",
      loja_codigo: null,
      loja_vinculada: null,
      regional_vinculada: null,
      regionais_vinculadas: [],
    };
  }

  throw new Error(
    "Informe o número da loja ou pelo menos uma regional adicional para este usuário.",
  );
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
      document.getElementById("edit_perm_regionais_vinculadas")?.value.trim() ||
      "",
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
    "perm_gerenciar_funcoes",
    "perm_ver_dashboard",
    "perm_ver_analises",
    "perm_ver_comparativos",
    "perm_ver_justificativas",
    "perm_aprovar_ajustes",
    "perm_atribuir_escopo",
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
      perm_gerenciar_funcoes: "pode_gerenciar_funcoes",
      perm_ver_dashboard: "pode_ver_dashboard",
      perm_ver_analises: "pode_ver_analises",
      perm_ver_comparativos: "pode_ver_comparativos",
      perm_ver_justificativas: "pode_ver_justificativas",
      perm_aprovar_ajustes: "pode_aprovar_ajustes",
      perm_atribuir_escopo: "pode_atribuir_escopo",
    };

    out[mapa[id]] = el.checked;
  });

  const selectVisualizacao = document.getElementById("perm_visualizacao");
  out.permissao_visualizacao = normalizarPermissaoVisualizacao(
    selectVisualizacao?.value || out.permissao_visualizacao || "TODOS",
  );

  return out;
}

// ==========================
// 💾 AUTOSAVE USUÁRIO (AÇÃO)
// ==========================
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
          regionais_vinculadas: dados.regionais_vinculadas,
          perfil: dados.perfil || userAtual?.perfil || "usuario",
        });

        const payload = {
          nome: dados.nome,
          matricula: dados.matricula,
          email: dados.email,
          funcao: dados.funcao,

          tipo_visao: vinculoResolvido.tipo_visao,
          loja_codigo: vinculoResolvido.loja_codigo,
          loja_vinculada: vinculoResolvido.loja_vinculada,
          regional_vinculada: dados.regional_vinculada
            ? normalizarTexto(dados.regional_vinculada)
            : null,
          regionais_vinculadas: vinculoResolvido.regionais_vinculadas,
        };

        if (isMaster && dados.perfil) {
          payload.perfil = dados.perfil;
        }

        const { error } = await window.db
          .from("usuarios")
          .update(payload)
          .eq("id", id);

        if (error) throw error;

        const infoLoja = document.getElementById("info_loja_inferida");
        if (infoLoja) {
          infoLoja.value = vinculoResolvido.loja_vinculada || "-";
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
              regional_vinculada: dados.regional_vinculada
                ? normalizarTexto(dados.regional_vinculada)
                : null,
              regionais_vinculadas: vinculoResolvido.regionais_vinculadas,
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
// 🧩 INICIALIZAR CONTROLES DE PERMISSÃO POR INDICADOR
// ==========================
function inicializarControlesPermissaoIndicador() {
  const checkTotal = document.getElementById("perm_indicadores_total");
  const checksClasse = document.querySelectorAll(".check-classe-completa");

  if (checkTotal) {
    checkTotal.addEventListener("change", () => {
      if (!checkTotal.checked) return;

      document
        .querySelectorAll(
          "#config-conteudo .check-classe-completa, #config-conteudo .check-indicador"
        )
        .forEach((el) => {
          el.checked = true;
        });
    });
  }

  checksClasse.forEach((checkClasse) => {
    checkClasse.addEventListener("change", () => {
      if (!checkClasse.checked) return;

      const classe = checkClasse.dataset.classe || "";
      const filhos = document.querySelectorAll(
        `#config-conteudo .check-indicador[data-classe="${classe}"]`
      );

      filhos.forEach((f) => {
        f.checked = true;
      });
    });
  });
}


// ==========================
// ⚙️ EDITAR PERMISSÕES + AÇÃO + VÍNCULO
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

    usuarioPermissoesEditando = data;

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

    const permissoesUsuario = data.permissoes || {};
    const indicadoresAtuais = (permissoesUsuario.indicadores || []).map(
      normalizarTexto
    );
    const classesAtuais = (permissoesUsuario.classes || []).map(normalizarTexto);
    const acessoTotalIndicadores =
      permissoesUsuario.acesso_total === true || data.perfil === "master";

    const permsSistema = getPermissoesSistemaUsuario(data);
    const visualizacaoAtual = normalizarPermissaoVisualizacao(
      permsSistema.permissao_visualizacao
    );

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
            <small>Campo informativo.</small>
          </div>

          <div class="campo">
            <label>Regionais adicionais</label>
            <input id="edit_perm_regionais_vinculadas" value="${regionaisTexto || ""}" placeholder="Ex.: NE1, NE2">
          </div>

          <div class="campo">
            <label>Loja inferida</label>
            <input id="info_loja_inferida" value="${data.loja_vinculada || "-"}" disabled>
          </div>

        </div>
    `;

    if (isMaster) {
      html += `
        <hr style="margin:18px 0; border:none; border-top:1px solid #eee;">

        <h4>🔐 Permissões de sistema</h4>

        <div class="permissoes-grid">
          <label class="check-item"><input type="checkbox" id="perm_semana_atual" ${permsSistema.pode_editar_semana_atual ? "checked" : ""}> Editar semana atual</label>
          <label class="check-item"><input type="checkbox" id="perm_semana_anterior" ${permsSistema.pode_editar_semana_anterior ? "checked" : ""}> Editar semanas anteriores</label>
          <label class="check-item"><input type="checkbox" id="perm_qualquer_semana" ${permsSistema.pode_editar_qualquer_semana ? "checked" : ""}> Editar qualquer semana</label>

          <label class="check-item"><input type="checkbox" id="perm_gerenciar_usuarios" ${permsSistema.pode_gerenciar_usuarios ? "checked" : ""}> Gerenciar usuários</label>
          <label class="check-item"><input type="checkbox" id="perm_gerenciar_funcoes" ${permsSistema.pode_gerenciar_funcoes ? "checked" : ""}> Gerenciar funções</label>
          <label class="check-item"><input type="checkbox" id="perm_ver_dashboard" ${permsSistema.pode_ver_dashboard ? "checked" : ""}> Ver dashboard</label>
          <label class="check-item"><input type="checkbox" id="perm_ver_analises" ${permsSistema.pode_ver_analises ? "checked" : ""}> Ver análises</label>
          <label class="check-item"><input type="checkbox" id="perm_ver_comparativos" ${permsSistema.pode_ver_comparativos ? "checked" : ""}> Ver comparativos</label>
          <label class="check-item"><input type="checkbox" id="perm_ver_justificativas" ${permsSistema.pode_ver_justificativas ? "checked" : ""}> Ver justificativas</label>
          <label class="check-item"><input type="checkbox" id="perm_aprovar_ajustes" ${permsSistema.pode_aprovar_ajustes ? "checked" : ""}> Aprovar/revisar</label>
          <label class="check-item"><input type="checkbox" id="perm_atribuir_escopo" ${permsSistema.pode_atribuir_escopo ? "checked" : ""}> Atribuir loja/regional</label>

          <div class="campo" style="margin-top:6px;">
            <label>Permissão de visualização</label>
            <select id="perm_visualizacao">
              <option value="TODOS" ${visualizacaoAtual === "TODOS" ? "selected" : ""}>Todos</option>
              <option value="NE1_NE2" ${visualizacaoAtual === "NE1_NE2" ? "selected" : ""}>NE1 e NE2</option>
            </select>
          </div>
        </div>
      `;
    }

    html += `
        <hr style="margin:18px 0; border:none; border-top:1px solid #eee;">

        <h4>Permissões por indicador</h4>

        <div class="grupo-permissao">
          <div class="permissoes-grid">
            <label class="check-item">
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

    Object.keys(agrupado).forEach((classe) => {
      const classeNorm = normalizarTexto(classe);

      html += `
        <div class="grupo-permissao">
          <h4>${classe}</h4>

          <div class="permissoes-grid" style="margin-bottom:10px;">
            <label class="check-item">
              <input
                type="checkbox"
                class="check-classe-completa"
                data-classe="${classe}"
                value="${classe}"
                ${classesAtuais.includes(classeNorm) ? "checked" : ""}
              >
              ${classe} completo
            </label>
          </div>

          <div class="permissoes-grid">
      `;

      agrupado[classe].forEach((indicador) => {
        const indicadorNorm = normalizarTexto(indicador);

        html += `
          <label class="check-item">
            <input
              type="checkbox"
              class="check-indicador"
              data-classe="${classe}"
              value="${indicador}"
              ${indicadoresAtuais.includes(indicadorNorm) ? "checked" : ""}
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
    inicializarControlesPermissaoIndicador();
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
// 🎯 COLETAR PERMISSÕES DE INDICADORES DA TELA
// ==========================
function coletarPermissoesIndicadoresTela() {
  const acessoTotal =
    document.getElementById("perm_indicadores_total")?.checked === true;

  const checksClasses = document.querySelectorAll(
    "#config-conteudo .check-classe-completa:checked",
  );

  const checksIndicadores = document.querySelectorAll(
    "#config-conteudo .check-indicador:checked",
  );

  const classes = [...checksClasses]
    .map((c) => normalizarTexto(c.value))
    .filter(Boolean);

  const indicadores = [...checksIndicadores]
    .map((c) => normalizarTexto(c.value))
    .filter(Boolean);

  return {
    acesso_total: acessoTotal,
    classes: [...new Set(classes)],
    indicadores: [...new Set(indicadores)],
  };
}

// ==========================
// 💾 SALVAR PERMISSÕES
// ==========================
// ==========================
// 💾 SALVAR PERMISSÕES
// ==========================
async function salvarPermissoes(id) {
  const dados = coletarCamposEdicaoUsuario();
  const user = getUsuarioLogado();
  const isMaster = user?.perfil === "master";

  const permissoesIndicadoresTela = coletarPermissoesIndicadoresTela();

  console.log("💾 Salvando permissões + vínculo manual:", {
    id,
    dados,
    permissoesIndicadoresTela,
  });

  if (!dados.nome || !dados.matricula || !dados.email || !dados.funcao) {
    alert("⚠️ Nome, matrícula, e-mail e função são obrigatórios.");
    return;
  }

  try {
    const vinculoResolvido = await resolverVinculoAutomaticoUsuario({
      loja_codigo: dados.loja_codigo,
      regional_vinculada: dados.regional_vinculada,
      regionais_vinculadas: dados.regionais_vinculadas,
      perfil: dados.perfil || usuarioPermissoesEditando?.perfil || "usuario",
    });

    const perfilFinal =
      isMaster && dados.perfil
        ? dados.perfil
        : usuarioPermissoesEditando?.perfil || "usuario";

    let permissoesSistema = {
      ...getPermissoesBasePorPerfil(perfilFinal),
      ...(usuarioPermissoesEditando?.permissoes || {}),
    };

    if (isMaster) {
      permissoesSistema = coletarPermissoesSistemaTela(permissoesSistema);
    } else {
      permissoesSistema.permissao_visualizacao = normalizarPermissaoVisualizacao(
        permissoesSistema.permissao_visualizacao || "TODOS"
      );
    }

    const payload = {
      nome: dados.nome,
      matricula: dados.matricula,
      email: dados.email,
      funcao: dados.funcao,
      tipo_visao: vinculoResolvido.tipo_visao,
      loja_codigo: vinculoResolvido.loja_codigo,
      loja_vinculada: vinculoResolvido.loja_vinculada,
      regional_vinculada: dados.regional_vinculada
        ? normalizarTexto(dados.regional_vinculada)
        : null,
      regionais_vinculadas: vinculoResolvido.regionais_vinculadas,

      permissoes: {
        ...(usuarioPermissoesEditando?.permissoes || {}),
        ...permissoesSistema,

        indicadores: permissoesIndicadoresTela.indicadores,
        classes: permissoesIndicadoresTela.classes,
        acesso_total:
          perfilFinal === "master"
            ? true
            : permissoesIndicadoresTela.acesso_total,
      },
    };

    if (isMaster && dados.perfil) {
      payload.perfil = dados.perfil;
    }

    const { data, error } = await window.db
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

    console.log("✅ Permissões/vínculo salvos no banco:", data);

    if (String(id) === String(user?.id)) {
      console.log(
        "🔄 Usuário editado é o próprio logado. Sincronizando localStorage..."
      );
      if (typeof sincronizarUsuarioLocalDoBanco === "function") {
        await sincronizarUsuarioLocalDoBanco();
      }
    }

    if (typeof registrarEventoSistema === "function") {
      await registrarEventoSistema({
        tipo_evento: "permissao",
        modulo: "Permissões",
        acao: "atualizou permissões e vínculo",
        usuario_alvo: dados.nome,
        perfil_alvo: perfilFinal,
        autenticacao: "sessao_propria",
        status: "sucesso",
        contexto: {
          indicadores: permissoesIndicadoresTela.indicadores,
          classes: permissoesIndicadoresTela.classes,
          acesso_total:
            perfilFinal === "master"
              ? true
              : permissoesIndicadoresTela.acesso_total,
          permissao_visualizacao: permissoesSistema.permissao_visualizacao,
          tipo_visao: vinculoResolvido.tipo_visao,
          loja_codigo: vinculoResolvido.loja_codigo,
          loja_vinculada: vinculoResolvido.loja_vinculada,
          regional_vinculada: dados.regional_vinculada
            ? normalizarTexto(dados.regional_vinculada)
            : null,
          regionais_vinculadas: vinculoResolvido.regionais_vinculadas,
          funcao: dados.funcao,
          matricula: dados.matricula,
          permissoesSistema,
        },
      });
    }

    alert("✅ Permissões / vínculo atualizados!");

    abrirTelaPermissoes();
  } catch (erro) {
    console.error("❌ Erro ao salvar permissões:", erro);
    alert(`❌ ${erro.message || "Erro ao salvar permissões / vínculo."}`);
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
// 📊 AUDITORIA / RASTREABILIDADE
// ==========================
async function abrirAuditoria() {
  console.log("📊 abrirAuditoria");

  if (typeof abrirLogsSistema === "function") {
    abrirLogsSistema();
    return;
  }

  const container = document.getElementById("config-conteudo");

  if (!container) return;

  container.innerHTML = `
    <div class="card-conteudo">
      <h2>📊 Auditoria e Rastreabilidade</h2>
      <p>Carregando registros...</p>
    </div>
  `;

  try {
    const { data, error } = await window.db
      .from("auditoria")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    let html = `
      <div class="card-conteudo">
        <h2>📊 Auditoria e Rastreabilidade</h2>

        <div class="tabela-container">
          <table class="tabela">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Usuário</th>
                <th>Módulo</th>
                <th>Ação</th>
                <th>Alvo</th>
                <th>Status</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
    `;

    (data || []).forEach((d) => {
      const dataHora = d.created_at
        ? new Date(d.created_at).toLocaleString("pt-BR")
        : "-";

      const alvo = d.usuario_alvo || d.loja || "-";

      const detalhes = {
        tipo_evento: d.tipo_evento || null,
        perfil: d.perfil || null,
        perfil_alvo: d.perfil_alvo || null,
        autenticacao: d.autenticacao || null,
        observacao: d.observacao || null,
        indicador: d.indicador || null,
        loja: d.loja || null,
        semana: d.semana || null,
        valor_antigo: d.valor_antigo ?? null,
        valor_novo: d.valor_novo ?? null,
        contexto: d.contexto || {},
      };

      html += `
        <tr>
          <td>${dataHora}</td>
          <td>${d.usuario || "-"}</td>
          <td>${d.modulo || "-"}</td>
          <td>${d.acao || "-"}</td>
          <td>${alvo}</td>
          <td>${d.status || "-"}</td>
          <td>
            <details>
              <summary>Ver</summary>
              <pre style="white-space: pre-wrap; font-size:12px;">${JSON.stringify(
                detalhes,
                null,
                2,
              )}</pre>
            </details>
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
  } catch (erro) {
    console.error("❌ erro auditoria:", erro);

    container.innerHTML = `
      <div class="card-conteudo">
        <h2>❌ Erro</h2>
        <p>Falha ao carregar auditoria / rastreabilidade</p>
      </div>
    `;
  }
}
