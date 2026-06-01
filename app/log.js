// ==========================
// 📋 LOGS DO SISTEMA / AUDITORIA
// ==========================

console.log("✅ log.js carregado");

// ==========================
// ⚙️ CONFIG LOGS
// ==========================
let paginaLogsAtual = 1;
const LOGS_POR_PAGINA = 20;

const filtrosLogs = {
  texto: "",
  tipo: "TODOS",
  dataInicio: "",
  dataFim: "",
};

// ==========================
// 👤 GET USUÁRIO LOGADO (fallback)
// ==========================
function getUsuarioLogadoLogs() {
  try {
    if (typeof getUsuarioLogado === "function") {
      return getUsuarioLogado();
    }

    const user = JSON.parse(localStorage.getItem("usuario"));
    if (!user) return null;

    return {
      ...user,
      perfil: (user.perfil || "").toString().trim().toLowerCase(),
    };
  } catch (erro) {
    console.error("❌ Erro ao obter usuário logado nos logs:", erro);
    return null;
  }
}

// ==========================
// 🔐 ACESSO AOS LOGS
// somente master
// ==========================
function podeVerLogsSistema() {
  const user = getUsuarioLogadoLogs();
  return !!user && user.perfil === "master";
}

// ==========================
// 🛑 ERRO PADRÃO
// ==========================
function mostrarErroLogs(msg) {
  if (typeof mostrarErro === "function") {
    mostrarErro(msg);
    return;
  }

  const container = document.getElementById("conteudo");
  if (!container) return;

  container.innerHTML = `
    <div class="card-conteudo">
      <h2 style="color:red;">❌ Erro</h2>
      <p>${msg}</p>
    </div>
  `;
}

// ==========================
// 🕒 FORMATAR DATA / HORA
// ==========================
function formatarDataHoraLog(valor) {
  if (!valor) return "-";

  try {
    return new Date(valor).toLocaleString("pt-BR");
  } catch {
    return valor;
  }
}

// ==========================
// 🧾 FORMATAR CONTEXTO
// ==========================
function formatarContextoLog(contexto) {
  if (!contexto) return "-";

  try {
    if (typeof contexto === "string") return contexto;

    const partes = [];

    if (contexto.indicador) partes.push(`Indicador: ${contexto.indicador}`);
    if (contexto.loja) partes.push(`Loja: ${contexto.loja}`);
    if (contexto.semana) partes.push(`Semana: ${contexto.semana}`);
    if (contexto.campo) partes.push(`Campo: ${contexto.campo}`);

    if (Array.isArray(contexto.indicadores) && contexto.indicadores.length) {
      partes.push(`Indicadores: ${contexto.indicadores.join(", ")}`);
    }

    if (contexto.email) partes.push(`Email: ${contexto.email}`);
    if (contexto.matricula) partes.push(`Matrícula: ${contexto.matricula}`);
    if (contexto.funcao) partes.push(`Função: ${contexto.funcao}`);

    if (!partes.length) {
      return JSON.stringify(contexto);
    }

    return partes.join(" | ");
  } catch (erro) {
    console.error("❌ Erro ao formatar contexto do log:", erro);
    return "-";
  }
}

// ==========================
// 📋 REGISTRAR ALTERAÇÃO DE DADO
// Compatível com as tabelas atuais
// ==========================
async function registrarLog(dados) {
  try {
    if (!window.db) {
      console.warn("⚠️ window.db não disponível para registrarLog");
      return;
    }

    const user = getUsuarioLogadoLogs();
    if (!user) {
      console.warn("⚠️ Usuário não encontrado para registrarLog");
      return;
    }

    const payload = {
      usuario: user.nome,
      perfil: user.perfil,

      loja: dados.loja || null,
      indicador: dados.indicador || null,
      semana: dados.semana || null,
      valor_antigo: dados.antigo ?? null,
      valor_novo: dados.novo ?? null,

      tipo_evento: "alteracao_dado",
      modulo: "Indicadores",
      acao: "alterou valor",
      usuario_alvo: null,
      perfil_alvo: null,
      autenticacao: "sessao_propria",
      status: "sucesso",
      observacao: dados.observacao || "",
      contexto: {
        loja: dados.loja || null,
        indicador: dados.indicador || null,
        semana: dados.semana || null,
        campo: dados.campo || "valor",
      },
    };

    const { error } = await window.db.from("auditoria").insert([payload]);

    if (error) throw error;

    console.log("📊 Log de alteração registrado:", payload);
  } catch (e) {
    console.error("❌ erro registrarLog:", e);
  }
}

// ==========================
// 📋 REGISTRAR EVENTO DO SISTEMA
// ==========================
// ==========================
// 📋 LOGGER CENTRAL DO SISTEMA
// registra em auditoria / rastreabilidade
// ==========================
async function registrarEventoSistema({
  tipo_evento = "sistema",
  modulo = "",
  acao = "",
  usuario_alvo = null,
  perfil_alvo = null,
  autenticacao = "sessao_propria",
  status = "sucesso",
  observacao = "",
  contexto = {},
  loja = null,
  indicador = null,
  semana = null,
  valor_antigo = null,
  valor_novo = null,
} = {}) {
  try {
    if (!window.db) {
      console.warn("⚠️ window.db não disponível para registrar evento");
      return null;
    }

    const user =
      typeof getUsuarioLogado === "function"
        ? getUsuarioLogado()
        : JSON.parse(localStorage.getItem("usuario") || "null");

    const payload = {
      usuario: user?.nome || user?.email || "sistema",
      perfil: user?.perfil || "desconhecido",

      tipo_evento,
      modulo,
      acao,
      usuario_alvo,
      perfil_alvo,
      autenticacao,
      status,
      observacao,
      contexto: contexto || {},

      loja,
      indicador,
      semana,
      valor_antigo,
      valor_novo,
    };

    console.log("📤 Registrando evento do sistema:", payload);

    const { data, error } = await window.db
      .from("auditoria")
      .insert([payload])
      .select("*")
      .single();

    if (error) throw error;

    console.log("✅ Evento registrado em auditoria:", data);
    return data;
  } catch (erro) {
    console.error("❌ Falha ao registrar evento do sistema:", erro);
    return null;
  }
}

// ==========================
// 📋 ABRIR LOGS DO SISTEMA
// ==========================
async function abrirLogsSistema() {
  console.log("📋 Abrindo Logs do Sistema...");

  if (!podeVerLogsSistema()) {
    console.warn("🚫 Acesso negado aos logs");
    mostrarErroLogs("Acesso restrito ao Master");
    return;
  }

  paginaLogsAtual = 1;

  filtrosLogs.texto = "";
  filtrosLogs.tipo = "TODOS";
  filtrosLogs.dataInicio = "";
  filtrosLogs.dataFim = "";

  await renderTelaLogsSistema();
}

// alias para compatibilidade com chamadas antigas
async function abrirAuditoria() {
  await abrirLogsSistema();
}

// ==========================
// 🧱 RENDER TELA LOGS
// tela cheia, padrão tabela
// ==========================
async function renderTelaLogsSistema() {
  const container = document.getElementById("conteudo");
  if (!container) return;

  container.innerHTML = `
    <div class="pagina-container">
      <div class="card-conteudo config-full">

        <div class="header-tabela">
          <h2>📋 Auditoria e Rastreabilidade</h2>
        </div>

        <div class="filtros-tabela filtros-novos">
          <input
            type="text"
            id="filtroLogTexto"
            placeholder="Buscar executor, ação, módulo, alvo ou observação"
            value="${filtrosLogs.texto}"
          >

          <div class="grupo-filtro-regional grupo-filtro-logs">
            <button type="button" class="btn-filtro-regional ${filtrosLogs.tipo === "TODOS" ? "ativo" : ""}" data-tipo="TODOS">
              Todos
            </button>
            <button type="button" class="btn-filtro-regional ${filtrosLogs.tipo === "alteracao_dado" ? "ativo" : ""}" data-tipo="alteracao_dado">
              Alterações
            </button>
            <button type="button" class="btn-filtro-regional ${filtrosLogs.tipo === "permissao" ? "ativo" : ""}" data-tipo="permissao">
              Permissões
            </button>
            <button type="button" class="btn-filtro-regional ${filtrosLogs.tipo === "usuario" ? "ativo" : ""}" data-tipo="usuario">
              Usuários
            </button>
            <button type="button" class="btn-filtro-regional ${filtrosLogs.tipo === "desbloqueio" ? "ativo" : ""}" data-tipo="desbloqueio">
              Desbloqueios
            </button>
            <button type="button" class="btn-filtro-regional ${filtrosLogs.tipo === "seguranca" ? "ativo" : ""}" data-tipo="seguranca">
              Segurança
            </button>
          </div>
        </div>

        <div class="filtros-tabela filtros-novos" style="margin-top: 6px;">
          <input type="date" id="filtroLogDataInicio" value="${filtrosLogs.dataInicio}">
          <input type="date" id="filtroLogDataFim" value="${filtrosLogs.dataFim}">
        </div>

        <div id="conteudo-logs">
          <p>Carregando registros...</p>
        </div>

      </div>
    </div>
  `;

  await buscarRenderizarLogs();
  ativarFiltrosLogsSistema();
}

// ==========================
// 🔎 BUSCAR E RENDERIZAR LOGS
// ==========================
async function buscarRenderizarLogs() {
  const conteudoLogs = document.getElementById("conteudo-logs");
  if (!conteudoLogs) return;

  try {
    if (!window.db) {
      conteudoLogs.innerHTML = `<p>Conexão com banco não iniciada.</p>`;
      return;
    }

    const inicio = (paginaLogsAtual - 1) * LOGS_POR_PAGINA;
    const fim = inicio + LOGS_POR_PAGINA - 1;

    let query = window.db
      .from("auditoria")
      .select("*", { count: "exact" })
      .order("criado_em", { ascending: false })
      .range(inicio, fim);

    if (filtrosLogs.tipo !== "TODOS") {
      query = query.eq("tipo_evento", filtrosLogs.tipo);
    }

    // filtro por data (usa criado_em)
    if (filtrosLogs.dataInicio) {
      query = query.gte("criado_em", `${filtrosLogs.dataInicio}T00:00:00`);
    }

    if (filtrosLogs.dataFim) {
      query = query.lte("criado_em", `${filtrosLogs.dataFim}T23:59:59`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    let logs = data || [];

    // filtro de texto no front
    if (filtrosLogs.texto) {
      const termo = filtrosLogs.texto.toLowerCase();

      logs = logs.filter((item) => {
        const textoComposto = [
          item.usuario,
          item.perfil,
          item.modulo,
          item.acao,
          item.usuario_alvo,
          item.perfil_alvo,
          item.autenticacao,
          item.status,
          item.observacao,
          item.indicador,
          item.loja,
          item.semana,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return textoComposto.includes(termo);
      });
    }

    const totalPaginas = Math.max(1, Math.ceil((count || 0) / LOGS_POR_PAGINA));

    let html = `
      <div class="tabela-container">
        <table class="tabela tabela-logs">
          <thead>
            <tr>
              <th>Data / Hora</th>
              <th>Módulo</th>
              <th>Ação</th>
              <th>Executor</th>
              <th>Perfil</th>
              <th>Usuário Alvo</th>
              <th>Autenticação</th>
              <th>Status</th>
              <th>Contexto</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (!logs.length) {
      html += `
        <tr>
          <td colspan="9">Nenhum registro encontrado.</td>
        </tr>
      `;
    } else {
      logs.forEach((log) => {
        html += `
          <tr>
            <td>${formatarDataHoraLog(log.criado_em)}</td>
            <td>${log.modulo || "-"}</td>
            <td>${log.acao || "-"}</td>
            <td>${log.usuario || "-"}</td>
            <td>${log.perfil || "-"}</td>
            <td>${log.usuario_alvo || "-"}</td>
            <td>${log.autenticacao || "-"}</td>
            <td>${log.status || "-"}</td>
            <td>${formatarContextoLog(log.contexto)}</td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
      </div>

      <div class="paginacao-logs">
        <button class="btn-secundario" ${paginaLogsAtual <= 1 ? "disabled" : ""} onclick="voltarPaginaLogs()">
          ⬅ Anterior
        </button>

        <span class="info-pagina-logs">
          Página ${paginaLogsAtual} de ${totalPaginas}
        </span>

        <button class="btn-secundario" ${paginaLogsAtual >= totalPaginas ? "disabled" : ""} onclick="avancarPaginaLogs(${totalPaginas})">
          Próxima ➡
        </button>
      </div>
    `;

    conteudoLogs.innerHTML = html;

    console.log("📋 Logs renderizados:", {
      pagina: paginaLogsAtual,
      totalPaginas,
      quantidadeNaTela: logs.length,
      totalRegistros: count || 0,
    });
  } catch (erro) {
    console.error("❌ Erro ao carregar logs:", erro);

    conteudoLogs.innerHTML = `
      <div class="card-conteudo">
        <h3>❌ Erro</h3>
        <p>Falha ao carregar logs do sistema.</p>
      </div>
    `;
  }
}

// ==========================
// 🎛 FILTROS DOS LOGS
// ==========================
function ativarFiltrosLogsSistema() {
  const inputTexto = document.getElementById("filtroLogTexto");
  const inputDataInicio = document.getElementById("filtroLogDataInicio");
  const inputDataFim = document.getElementById("filtroLogDataFim");
  const botoes = document.querySelectorAll(
    ".grupo-filtro-logs .btn-filtro-regional",
  );

  if (!inputTexto || !inputDataInicio || !inputDataFim || !botoes.length) {
    console.warn("⚠️ Filtros dos logs não encontrados");
    return;
  }

  let timer = null;

  const aplicarComDebounce = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      paginaLogsAtual = 1;
      await buscarRenderizarLogs();
    }, 250);
  };

  inputTexto.addEventListener("input", () => {
    filtrosLogs.texto = inputTexto.value.trim();
    aplicarComDebounce();
  });

  inputDataInicio.addEventListener("change", async () => {
    filtrosLogs.dataInicio = inputDataInicio.value || "";
    paginaLogsAtual = 1;
    await buscarRenderizarLogs();
  });

  inputDataFim.addEventListener("change", async () => {
    filtrosLogs.dataFim = inputDataFim.value || "";
    paginaLogsAtual = 1;
    await buscarRenderizarLogs();
  });

  botoes.forEach((btn) => {
    btn.addEventListener("click", async () => {
      botoes.forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");

      filtrosLogs.tipo = btn.dataset.tipo || "TODOS";
      paginaLogsAtual = 1;

      await buscarRenderizarLogs();
    });
  });
}

// ==========================
// ⬅ VOLTAR PÁGINA
// ==========================
async function voltarPaginaLogs() {
  if (paginaLogsAtual <= 1) return;
  paginaLogsAtual--;
  await buscarRenderizarLogs();
}

// ==========================
// ➡ AVANÇAR PÁGINA
// ==========================
async function avancarPaginaLogs(totalPaginas) {
  if (paginaLogsAtual >= totalPaginas) return;
  paginaLogsAtual++;
  await buscarRenderizarLogs();
}
