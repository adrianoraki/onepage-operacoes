console.log("✅ perfil-auditoria.js carregado");

// ==========================
// 🧪 VALIDAÇÃO DE DEPENDÊNCIAS
// ==========================
(function validarDependenciasPerfilAuditoria() {
  const obrigatorias = ["getUsuarioLogado"];

  const faltando = obrigatorias.filter(
    (nome) => typeof window[nome] !== "function"
  );

  if (faltando.length) {
    console.error(
      "❌ perfil-auditoria.js sem dependências obrigatórias:",
      faltando
    );
  } else {
    console.log("✅ Dependências de perfil-auditoria.js OK");
  }
})();

// ==========================
// 🛡️ HELPERS
// ==========================
function escapeHtmlAuditoria(valor) {
  return (valor ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getDbAuditoria() {
  if (!window.db) {
    console.error("❌ window.db não encontrado em perfil-auditoria.js");
    throw new Error("Conexão com banco não inicializada.");
  }
  return window.db;
}

function getConfigConteudoAuditoriaEl() {
  return document.getElementById("config-conteudo");
}

// ==========================
// 🧾 LOG DE ALTERAÇÃO
// ==========================
async function registrarLog(dados) {
  try {
    const db = getDbAuditoria();
    const user = getUsuarioLogado();

    if (!user) {
      console.warn("⚠️ registrarLog sem usuário logado");
      return;
    }

    const payload = {
      usuario: user.nome || user.email || "-",
      perfil: user.perfil || "-",
      loja: dados?.loja || null,
      indicador: dados?.indicador || null,
      semana: dados?.semana || null,
      valor_antigo: dados?.antigo ?? null,
      valor_novo: dados?.novo ?? null,
    };

    const { error } = await db.from("auditoria").insert([payload]);

    if (error) throw error;

    console.log("📊 LOG gravado com sucesso:", payload);
  } catch (e) {
    console.error("❌ erro ao registrar log:", e);
  }
}

// ==========================
// 📊 AUDITORIA / RASTREABILIDADE
// ==========================
async function abrirAuditoria() {
  console.log("📊 abrirAuditoria");

  try {
    // se existir tela de logs mais completa, usa ela
    if (typeof window.abrirLogsSistema === "function") {
      console.log("📋 abrirLogsSistema encontrada. Redirecionando...");
      window.abrirLogsSistema();
      return;
    }

    const container = getConfigConteudoAuditoriaEl();
    if (!container) {
      console.error("❌ #config-conteudo não encontrado");
      return;
    }

    container.innerHTML = `
      <div class="card-conteudo">
        <h2>📊 Auditoria e Rastreabilidade</h2>
        <p>Carregando registros...</p>
      </div>
    `;

    const db = getDbAuditoria();

    const { data, error } = await db
      .from("auditoria")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const registros = data || [];

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

    if (!registros.length) {
      html += `
        <tr>
          <td colspan="7" style="text-align:center;">Nenhum registro encontrado.</td>
        </tr>
      `;
    } else {
      registros.forEach((d) => {
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
            <td>${escapeHtmlAuditoria(dataHora)}</td>
            <td>${escapeHtmlAuditoria(d.usuario || "-")}</td>
            <td>${escapeHtmlAuditoria(d.modulo || "-")}</td>
            <td>${escapeHtmlAuditoria(d.acao || "-")}</td>
            <td>${escapeHtmlAuditoria(alvo)}</td>
            <td>${escapeHtmlAuditoria(d.status || "-")}</td>
            <td>
              <details>
                <summary>Ver</summary>
                <pre style="white-space: pre-wrap; font-size:12px;">${escapeHtmlAuditoria(
                  JSON.stringify(detalhes, null, 2)
                )}</pre>
              </details>
            </td>
          </tr>
        `;
      });
    }

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;

    console.log("✅ Auditoria carregada com sucesso:", {
      totalRegistros: registros.length,
    });
  } catch (erro) {
    console.error("❌ erro auditoria:", erro);

    const container = getConfigConteudoAuditoriaEl();
    if (!container) return;

    container.innerHTML = `
      <div class="card-conteudo">
        <h2>❌ Erro</h2>
        <p>Falha ao carregar auditoria / rastreabilidade</p>
      </div>
    `;
  }
}

// ==========================
// 🌐 EXPOR FUNÇÕES NO WINDOW
// ==========================
window.registrarLog = registrarLog;
window.abrirAuditoria = abrirAuditoria;

// ==========================
// ✅ LOG FINAL DE BOOTSTRAP
// ==========================
console.log("✅ perfil-auditoria.js pronto", {
  registrarLog: typeof window.registrarLog,
  abrirAuditoria: typeof window.abrirAuditoria,
});