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
        <div class="ah-perfil-wrap">
          <button type="button" class="ah-perfil" id="ahPerfilBtn" title="Menu do usuário"
            aria-haspopup="true" aria-expanded="false"
            onclick="if(window.alternarMenuUsuarioHeader) alternarMenuUsuarioHeader(event);">
            ${avatarHtml}
            <span class="ah-perfil-txt">
              <span class="ah-nome">${u ? u.nome : "Usuário"}</span>
              <span class="ah-funcao">${u ? u.funcao : ""}</span>
            </span>
            <i class="fas fa-chevron-down ah-perfil-caret"></i>
          </button>

          <div class="ah-dropdown" id="ahPerfilDropdown" hidden>
            <button type="button" class="ah-dropdown-item" onclick="if(window.abrirPerfilPopover) abrirPerfilPopover(event);">
              <i class="fas fa-id-card"></i> Meu perfil
            </button>
            <button type="button" class="ah-dropdown-item" onclick="if(window.abrirConfiguracoesMenu) abrirConfiguracoesMenu();">
              <i class="fas fa-gear"></i> Configurações
            </button>
            <div class="ah-dropdown-divisor"></div>
            <button type="button" class="ah-dropdown-item ah-dropdown-sair" onclick="if(window.logout) logout();">
              <i class="fas fa-right-from-bracket"></i> Sair
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Abre/fecha o menu do usuário (Meu perfil / Configurações / Sair).
  function alternarMenuUsuarioHeader(event) {
    if (event) event.stopPropagation();
    const btn = document.getElementById("ahPerfilBtn");
    const dropdown = document.getElementById("ahPerfilDropdown");
    if (!btn || !dropdown) return;
    const abrindo = dropdown.hidden;
    dropdown.hidden = !abrindo;
    btn.setAttribute("aria-expanded", abrindo ? "true" : "false");
  }
  window.alternarMenuUsuarioHeader = alternarMenuUsuarioHeader;

  // Fecha o menu ao clicar fora ou apertar Escape — registrado uma única
  // vez (o header é recriado via innerHTML a cada troca de tela, mas
  // document.addEventListener aqui fica fora desse ciclo).
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("ahPerfilDropdown");
    const wrap = document.querySelector(".ah-perfil-wrap");
    if (!dropdown || dropdown.hidden) return;
    if (wrap && wrap.contains(e.target)) return;
    dropdown.hidden = true;
    document.getElementById("ahPerfilBtn")?.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const dropdown = document.getElementById("ahPerfilDropdown");
    if (dropdown && !dropdown.hidden) {
      dropdown.hidden = true;
      document.getElementById("ahPerfilBtn")?.setAttribute("aria-expanded", "false");
    }
  });

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
