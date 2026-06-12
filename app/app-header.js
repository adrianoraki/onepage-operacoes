// ============================================================
// 🧭 APP HEADER — faixa horizontal no topo da área de conteúdo
// Mostra saudação + título à esquerda; configurações + perfil à direita.
// Funciona tanto no OnePage quanto no Painel de Ouro (tema via body.po-modo-ouro).
// ============================================================
(function () {
  "use strict";

  const TITULOS_TELA = {
    analises: "Análises",
    comparativos: "Comparativos",
    "painel-ouro": "Painel de Ouro",
    auditoria: "Auditoria",
    tabela: "Indicadores",
    configuracoes: "Configurações",
    dashboard: "Visão Geral",
  };

  function saudacaoPorHora() {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }

  function dadosUsuario() {
    try {
      const u = (typeof window.getUsuarioLogado === "function") ? window.getUsuarioLogado() : null;
      if (!u) return null;
      const nome = [u.nome, u.sobrenome].filter(Boolean).join(" ").trim() || u.nome || "Usuário";
      const primeiro = (u.nome || nome || "").split(" ")[0] || "Usuário";
      const funcao = u.funcao || u.perfil || "";
      const iniciais = (
        ((u.nome || " ")[0] || "") + ((u.sobrenome || " ")[0] || "")
      ).toUpperCase() || "U";
      return { nome, primeiro, funcao, iniciais, foto: u.fotoPerfil || null };
    } catch (_) { return null; }
  }

  function tituloAtual() {
    const tela = (window.APP_STATE && window.APP_STATE.telaAtiva) || "";
    return TITULOS_TELA[tela] || "OnePage";
  }

  // Cria (uma vez) o elemento do header e injeta dentro do #conteudo, no topo.
  function montar() {
    const conteudo = document.getElementById("conteudo");
    if (!conteudo) return;

    let header = document.getElementById("app-header");
    if (!header) {
      header = document.createElement("div");
      header.id = "app-header";
      header.className = "app-header";
      // insere como primeiro filho do conteúdo
      conteudo.insertBefore(header, conteudo.firstChild);
    }

    const u = dadosUsuario();
    const titulo = tituloAtual();
    const saud = saudacaoPorHora();

    const avatarHtml = (u && u.foto)
      ? `<span class="ah-avatar" style="background-image:url('${u.foto}')"></span>`
      : `<span class="ah-avatar">${u ? u.iniciais : "U"}</span>`;

    header.innerHTML = `
      <div class="ah-esq">
        <div class="ah-titulo">${titulo}</div>
        <div class="ah-saud">${saud}${u ? ", " + u.primeiro : ""} 👋</div>
      </div>
      <div class="ah-dir">
        <button type="button" class="ah-perfil" title="Meu perfil"
          onclick="if(window.abrirPerfilPopover) abrirPerfilPopover(event);">
          ${avatarHtml}
          <span class="ah-perfil-txt">
            <span class="ah-nome">${u ? u.nome : "Usuário"}</span>
            <span class="ah-funcao">${u ? u.funcao : ""}</span>
          </span>
        </button>
      </div>
    `;
  }

  // Atualiza o header quando troca de tela / usuário
  window.atualizarAppHeader = montar;

  // Observa mudanças no #conteudo: se o conteúdo for re-renderizado e o header
  // sumir, recria-o no topo.
  function garantirHeaderPresente() {
    const conteudo = document.getElementById("conteudo");
    if (!conteudo) return;
    if (!document.getElementById("app-header")) montar();
    else if (conteudo.firstChild && conteudo.firstChild.id !== "app-header") {
      // garante que continua no topo
      const h = document.getElementById("app-header");
      conteudo.insertBefore(h, conteudo.firstChild);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // primeira montagem + re-checagem periódica leve
    setTimeout(montar, 600);
    setInterval(garantirHeaderPresente, 1200);
  });
})();
