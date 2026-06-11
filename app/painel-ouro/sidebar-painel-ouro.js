// ============================================================
// 👑 PAINEL DE OURO — sidebar-painel-ouro.js
// Gerencia a transição do sidebar padrão → sidebar ouro
// e o loading screen premium ao entrar no modo ouro.
//
// API pública exposta em window:
//   entrarModoOuro()   — chamado pelo botão no sidebar padrão
//   sairModoOuro()     — chamado pelo botão "Voltar" do sidebar ouro
// ============================================================
console.log("✅ sidebar-painel-ouro.js carregado");

// ============================================================
// 🎨 ESTILOS — injetados uma única vez
// ============================================================
(function poSbGarantirEstilos() {
  if (document.getElementById("po-sb-styles")) return;
  const s = document.createElement("style");
  s.id = "po-sb-styles";
  s.textContent = `

/* ============================================================
   LOADING SCREEN — tela de entrada premium
   ============================================================ */
#po-loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: #080d14;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
#po-loading-screen.visivel {
  opacity: 1;
  pointer-events: all;
}

/* Partículas de fundo */
.po-ls-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.po-ls-particle {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #c9a227;
  opacity: 0;
  animation: poParticle var(--dur, 3s) var(--delay, 0s) ease-in-out infinite;
}
@keyframes poParticle {
  0%   { opacity: 0; transform: translateY(0) scale(1); }
  20%  { opacity: 0.6; }
  80%  { opacity: 0.3; }
  100% { opacity: 0; transform: translateY(-80px) scale(0.4); }
}

/* Coroa central */
.po-ls-crown-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  margin-bottom: 32px;
}
.po-ls-crown-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(201,162,39,0.25);
  animation: poRingPulse 2s ease-in-out infinite;
}
.po-ls-crown-ring:nth-child(2) {
  inset: -12px;
  border-color: rgba(201,162,39,0.12);
  animation-delay: 0.4s;
}
.po-ls-crown-ring:nth-child(3) {
  inset: -26px;
  border-color: rgba(201,162,39,0.06);
  animation-delay: 0.8s;
}
@keyframes poRingPulse {
  0%, 100% { transform: scale(1);    opacity: 1; }
  50%       { transform: scale(1.06); opacity: 0.6; }
}
.po-ls-crown-ico {
  font-size: 44px;
  line-height: 1;
  filter: drop-shadow(0 0 18px rgba(201,162,39,0.55));
  animation: poCrownFloat 3s ease-in-out infinite;
}
@keyframes poCrownFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

/* Texto */
.po-ls-titulo {
  font-family: "Poppins", sans-serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #e8c84a 0%, #f5e27a 40%, #c9a227 70%, #a07a15 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
  opacity: 0;
  transform: translateY(10px);
  animation: poTextIn 0.5s 0.3s ease forwards;
}
.po-ls-subtitulo {
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.35);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(8px);
  animation: poTextIn 0.5s 0.5s ease forwards;
}
@keyframes poTextIn {
  to { opacity: 1; transform: translateY(0); }
}

/* Barra de progresso */
.po-ls-progress-wrap {
  width: 220px;
  opacity: 0;
  animation: poTextIn 0.4s 0.7s ease forwards;
}
.po-ls-progress-track {
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 10px;
  overflow: hidden;
}
.po-ls-progress-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #b8911f, #e8c84a, #b8911f);
  background-size: 200% 100%;
  border-radius: 10px;
  transition: width 0.1s linear;
  animation: poProgressShimmer 1.5s linear infinite;
}
@keyframes poProgressShimmer {
  0%   { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
.po-ls-progress-label {
  margin-top: 10px;
  font-family: "Poppins", sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.25);
  text-align: center;
  letter-spacing: 1px;
  min-height: 16px;
  transition: opacity 0.2s;
}

/* Linha separadora decorativa */
.po-ls-divider {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,162,39,0.5), transparent);
  margin: 28px auto 0;
  opacity: 0;
  animation: poTextIn 0.4s 0.9s ease forwards;
}


/* ============================================================
   SIDEBAR MODO OURO
   ============================================================ */
.po-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  /* fundo translúcido — deixa a imagem painelouro.jpg aparecer atrás,
     com leve blur e tom quente para manter o texto dourado legível */
  background: linear-gradient(180deg,
    rgba(14,12,8,0.42) 0%,
    rgba(20,15,6,0.50) 40%,
    rgba(14,11,6,0.42) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  border-right: 1px solid rgba(201,162,39,0.18);
  box-shadow: 8px 0 32px rgba(0,0,0,0.25);
}

/* Brilho de fundo sutil */
.po-sidebar::before {
  content: "";
  position: absolute;
  top: -60px;
  left: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(201,162,39,0.07) 0%, transparent 70%);
  pointer-events: none;
}
.po-sidebar::after {
  content: "";
  position: absolute;
  bottom: 80px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(201,162,39,0.04) 0%, transparent 70%);
  pointer-events: none;
}

/* Cabeçalho do sidebar ouro */
.po-sb-header {
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(201,162,39,0.12);
}

/* Botão voltar */
.po-sb-voltar {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 7px 10px;
  margin-bottom: 14px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 9px;
  color: rgba(255,255,255,0.72);
  font-family: "Poppins", sans-serif;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.3px;
}
.po-sb-voltar:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.7);
  border-color: rgba(255,255,255,0.14);
}
.po-sb-voltar i { font-size: 11px; }

/* Logo / título do modo */
.po-sb-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 4px;
}
.po-sb-logo-ico {
  font-size: 20px;
  filter: drop-shadow(0 0 8px rgba(201,162,39,0.5));
  animation: poCrownFloat 3s ease-in-out infinite;
}
.po-sb-logo-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.po-sb-logo-title {
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-weight: 800;
  background: linear-gradient(135deg, #e8c84a 0%, #c9a227 60%, #a07a15 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.3px;
  line-height: 1.2;
}
.po-sb-logo-sub {
  font-family: "Poppins", sans-serif;
  font-size: 9px;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

/* Menu de navegação do ouro */
.po-sb-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;
}
.po-sb-nav::-webkit-scrollbar { width: 4px; }
.po-sb-nav::-webkit-scrollbar-thumb {
  background: rgba(201,162,39,0.2);
  border-radius: 10px;
}

.po-sb-secao-label {
  font-family: "Poppins", sans-serif;
  font-size: 9px;
  font-weight: 700;
  color: rgba(230,190,90,0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 12px 10px 6px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.po-sb-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 38px;
  padding: 8px 11px;
  margin: 2px 0;
  border-radius: 10px;
  background: none;
  border: 1px solid transparent;
  color: rgba(255,255,255,0.72);
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  position: relative;
  text-shadow: 0 1px 3px rgba(0,0,0,0.35);
}
.po-sb-item i {
  width: 16px;
  min-width: 16px;
  text-align: center;
  font-size: 13px;
  color: rgba(230,190,90,0.75);
  transition: color 0.15s;
}
.po-sb-item:hover {
  background: rgba(201,162,39,0.06);
  border-color: rgba(201,162,39,0.1);
  color: rgba(255,255,255,0.8);
  transform: translateX(2px);
}
.po-sb-item:hover i {
  color: rgba(201,162,39,0.8);
}
.po-sb-item.ativo {
  background: linear-gradient(90deg,
    rgba(201,162,39,0.14),
    rgba(201,162,39,0.06)
  );
  border-color: rgba(201,162,39,0.2);
  color: #f4e7b2;
}
.po-sb-item.ativo i {
  color: #c9a227;
  filter: drop-shadow(0 0 4px rgba(201,162,39,0.4));
}
.po-sb-item.ativo::before {
  content: "";
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 2px;
  background: linear-gradient(180deg, #e8c84a, #b8911f);
  border-radius: 0 2px 2px 0;
}

/* Divisor entre seções */
.po-sb-divider {
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(201,162,39,0.1),
    transparent
  );
  margin: 8px 4px;
}

/* Rodapé do sidebar ouro */
.po-sb-footer {
  padding-top: 12px;
  border-top: 1px solid rgba(201,162,39,0.1);
}

/* Card do usuário (mantém visual do sidebar original) */
.po-sb-user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(201,162,39,0.1);
  margin-bottom: 10px;
}
.po-sb-user-nome {
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.po-sb-user-funcao {
  font-family: "Poppins", sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: rgba(201,162,39,0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Botão sair */
.po-sb-btn-sair {
  width: 100%;
  min-height: 40px;
  border: none;
  border-radius: 10px;
  background: rgba(185,28,28,0.18);
  border: 1px solid rgba(220,38,38,0.2);
  color: rgba(251,113,133,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.po-sb-btn-sair:hover {
  background: rgba(185,28,28,0.28);
  border-color: rgba(220,38,38,0.35);
  color: #fb7185;
}

/* ============================================================
   TRANSIÇÃO DO SIDEBAR PRINCIPAL
   ============================================================ */
#sidebar {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
#sidebar.po-transitioning {
  opacity: 0;
  pointer-events: none;
}

/* ============================================================
   RESPONSIVO
   ============================================================ */
@media (max-width: 768px) {
  .po-sb-logo-title { font-size: 13px; }
  .po-sb-item { min-height: 40px; padding: 9px 10px; }
}

  `;
  document.head.appendChild(s);
})();


// ============================================================
// 🌟 LOADING SCREEN
// ============================================================
const PO_SB_MENSAGENS = [
  "Carregando indicadores…",
  "Buscando dados de performance…",
  "Calculando pontuações…",
  "Preparando ranking…",
  "Quase lá…",
];

function poSbCriarLoadingScreen() {
  if (document.getElementById("po-loading-screen")) return;

  // Gera partículas aleatórias
  const particulas = Array.from({ length: 28 }, (_, i) => {
    const x    = Math.random() * 100;
    const y    = Math.random() * 100;
    const dur  = (2.5 + Math.random() * 3).toFixed(1);
    const del  = (Math.random() * 4).toFixed(1);
    const size = (1 + Math.random() * 2.5).toFixed(1);
    return `<div class="po-ls-particle" style="
      left:${x}%; top:${y}%;
      width:${size}px; height:${size}px;
      --dur:${dur}s; --delay:${del}s;
    "></div>`;
  }).join("");

  const el = document.createElement("div");
  el.id = "po-loading-screen";
  el.innerHTML = `
    <div class="po-ls-particles">${particulas}</div>

    <div class="po-ls-crown-wrap">
      <div class="po-ls-crown-ring"></div>
      <div class="po-ls-crown-ring"></div>
      <div class="po-ls-crown-ring"></div>
      <div class="po-ls-crown-ico">👑</div>
    </div>

    <div class="po-ls-titulo">Painel de Ouro</div>
    <div class="po-ls-subtitulo">Regional NE · ${new Date().getFullYear()}</div>

    <div class="po-ls-progress-wrap">
      <div class="po-ls-progress-track">
        <div class="po-ls-progress-fill" id="po-ls-fill"></div>
      </div>
      <div class="po-ls-progress-label" id="po-ls-label">Iniciando…</div>
    </div>

    <div class="po-ls-divider"></div>
  `;
  document.body.appendChild(el);
}

function poSbMostrarLoading() {
  return new Promise(resolve => {
    poSbCriarLoadingScreen();
    const screen = document.getElementById("po-loading-screen");
    const fill   = document.getElementById("po-ls-fill");
    const label  = document.getElementById("po-ls-label");

    // Mostra a tela
    requestAnimationFrame(() => {
      screen.classList.add("visivel");
    });

    // Anima a barra em ~1.2s
    let progresso = 0;
    let msgIdx    = 0;

    const tick = setInterval(() => {
      progresso += Math.random() * 18 + 8;
      if (progresso > 95) progresso = 95;

      fill.style.width = progresso + "%";

      if (msgIdx < PO_SB_MENSAGENS.length && progresso > msgIdx * 20) {
        label.textContent = PO_SB_MENSAGENS[msgIdx];
        msgIdx++;
      }
    }, 180);

    // Finaliza após 1.4s (tempo suficiente para o DOM do sidebar ouro carregar)
    setTimeout(() => {
      clearInterval(tick);
      fill.style.width = "100%";
      if (label) label.textContent = "Pronto!";
      setTimeout(resolve, 200);
    }, 1400);
  });
}

function poSbEsconderLoading() {
  return new Promise(resolve => {
    const screen = document.getElementById("po-loading-screen");
    if (!screen) { resolve(); return; }
    screen.classList.remove("visivel");
    setTimeout(resolve, 320);
  });
}


// ============================================================
// 🏗️ SIDEBAR OURO — montagem do HTML
// ============================================================
function poSbGetUsuario() {
  try {
    if (typeof window.getUsuarioLogado === "function") return window.getUsuarioLogado();
    if (typeof window.getUsuarioLocal  === "function") return window.getUsuarioLocal();
  } catch (_) {}
  return null;
}

function poSbGetIniciais(usuario) {
  if (!usuario) return "U";
  const nome = usuario.nome || "";
  const sob  = usuario.sobrenome || "";
  if (nome && sob) return (nome[0] + sob[0]).toUpperCase();
  if (nome)        return nome.slice(0, 2).toUpperCase();
  return "U";
}

function poSbMontarSidebar() {
  const usuario  = poSbGetUsuario();
  const iniciais = poSbGetIniciais(usuario);
  const nome     = usuario?.nome     || "Usuário";
  const funcao   = usuario?.funcao   || usuario?.perfil || "";

  // Detecta avatar salvo (mesmo sistema do sidebar padrão)
  let avatarEstilo = "";
  try {
    const chaveFoto = typeof window.getChaveFotoPerfil === "function"
      ? window.getChaveFotoPerfil()
      : null;
    if (chaveFoto) {
      const foto = localStorage.getItem(chaveFoto);
      if (foto) avatarEstilo = `background-image:url('${foto}');background-size:cover;background-position:center;color:transparent;`;
    }
  } catch (_) {}

  return `
    <div class="po-sidebar" id="po-sidebar-inner">

      <!-- CABEÇALHO -->
      <div class="po-sb-header">
        <button type="button" class="po-sb-voltar" onclick="sairModoOuro()">
          <i class="fas fa-arrow-left"></i>
          Voltar ao menu
        </button>
        <div class="po-sb-logo">
          <span class="po-sb-logo-ico">👑</span>
          <div class="po-sb-logo-text">
            <span class="po-sb-logo-title">Painel de Ouro</span>
            <span class="po-sb-logo-sub">Desempenho · NE</span>
          </div>
        </div>
      </div>

      <!-- NAVEGAÇÃO -->
      <nav class="po-sb-nav" id="po-sb-nav">

        <div class="po-sb-secao-label">Visualizações</div>

        <button type="button" class="po-sb-item ativo" id="po-sb-btn-ranking"
          onclick="poSbNavegar('ranking')">
          <i class="fas fa-list-ol"></i>
          <span>Ranking mensal</span>
        </button>

        <button type="button" class="po-sb-item" id="po-sb-btn-evolucao"
          onclick="poSbNavegar('evolucao')">
          <i class="fas fa-chart-line"></i>
          <span>Evolução anual</span>
        </button>

        <div class="po-sb-divider"></div>
        <div class="po-sb-secao-label">Áreas avaliadas</div>

        <button type="button" class="po-sb-item" onclick="poSbClicarArea('vendas', 'Vendas')">
          <i class="fas fa-dollar-sign"></i>
          <span>Vendas</span>
        </button>
        <button type="button" class="po-sb-item" onclick="poSbClicarArea('quebras', 'Quebras')">
          <i class="fas fa-box-open"></i>
          <span>Quebras</span>
        </button>
        <button type="button" class="po-sb-item" onclick="poSbClicarArea('frente_caixa', 'Frente de Caixa')">
          <i class="fas fa-cash-register"></i>
          <span>Frente de Caixa</span>
        </button>
        <button type="button" class="po-sb-item" onclick="poSbClicarArea('passai', 'Passaí')">
          <i class="fas fa-id-card"></i>
          <span>Passaí</span>
        </button>
        <button type="button" class="po-sb-item" onclick="poSbClicarArea('servicos_assai', 'Serviços Assaí')">
          <i class="fas fa-store"></i>
          <span>Serviços Assaí</span>
        </button>
        <button type="button" class="po-sb-item" onclick="poSbClicarArea('rh', 'RH')">
          <i class="fas fa-users"></i>
          <span>RH</span>
        </button>
        <button type="button" class="po-sb-item" onclick="poSbClicarArea('prevencao', 'Prevenção')">
          <i class="fas fa-shield-alt"></i>
          <span>Prevenção</span>
        </button>
        <button type="button" class="po-sb-item" onclick="poSbClicarArea('ti_rub_rm', 'TI / RUB / RM')">
          <i class="fas fa-barcode"></i>
          <span>TI / RUB / RM</span>
        </button>
        <button type="button" class="po-sb-item" onclick="poSbClicarArea('adm', 'ADM')">
          <i class="fas fa-chart-pie"></i>
          <span>ADM</span>
        </button>

      </nav>

      <!-- RODAPÉ -->
      <div class="po-sb-footer">
        <div class="po-sb-user-card">
          <div class="avatar" style="width:38px;height:38px;min-width:38px;font-size:13px;border-radius:10px;${avatarEstilo}">
            ${avatarEstilo ? "" : iniciais}
          </div>
          <div style="flex:1;min-width:0;">
            <div class="po-sb-user-nome">${nome}</div>
            <div class="po-sb-user-funcao">${funcao}</div>
          </div>
        </div>
        <button type="button" class="po-sb-btn-sair" onclick="logMenu('logout'); logout();">
          <i class="fas fa-right-from-bracket"></i>
          Sair
        </button>
      </div>

    </div>`;
}


// ============================================================
// 🔁 NAVEGAÇÃO INTERNA DO SIDEBAR OURO
// ============================================================

window.poSbClicarArea = function(areaSlug, areaNome) {
  // Feedback visual no item do sidebar
  document.querySelectorAll(".po-sb-nav .po-sb-item:not([id])").forEach(el => el.classList.remove("ativo"));
  const alvo = [...document.querySelectorAll(".po-sb-nav .po-sb-item:not([id])")].find(el =>
    el.getAttribute("onclick")?.includes(`'${areaSlug}'`)
  );
  if (alvo) alvo.classList.add("ativo");

  // Mapa de áreas → função de tela de lançamento (cada área tem seu arquivo)
  const FUNCOES_AREA = {
    vendas:         "poLancVendas",
    quebras:        "poLancQuebras",
    frente_caixa:   "poLancFrenteCaixa",
    passai:         "poLancPassai",
    servicos_assai: "poLancServicosAssai",
    rh:             "poLancRH",
    prevencao:      "poLancPrevencao",
    ti_rub_rm:      "poLancTiRubRm",
    adm:            "poLancAdm",
  };

  const usuario = typeof window.getUsuarioLogado === "function" ? window.getUsuarioLogado() : null;
  const podeEditar = usuario && ["master", "admin"].includes(usuario.perfil);

  if (podeEditar) {
    // Abre a tela de lançamento da área (tela cheia dentro do painel)
    const fn = FUNCOES_AREA[areaSlug];
    if (fn && typeof window[fn] === "function") {
      window[fn]();
    } else {
      console.error("❌ Função de lançamento não encontrada para:", areaSlug);
    }
  } else {
    // Usuário sem permissão de edição → só visualiza
    if (typeof window.poFiltrarPorArea === "function") window.poFiltrarPorArea(areaSlug);
    else if (typeof window.poTrocarAba === "function") window.poTrocarAba("ranking");
  }
};

window.poSbNavegar = function(aba) {
  // Atualiza estado visual dos botões
  document.querySelectorAll(".po-sb-item[id^='po-sb-btn-']").forEach(btn => {
    btn.classList.remove("ativo");
  });
  const btn = document.getElementById(`po-sb-btn-${aba}`);
  if (btn) btn.classList.add("ativo");

  // Chama a troca de aba no módulo principal
  if (typeof window.poTrocarAba === "function") {
    window.poTrocarAba(aba);
  }
};

window.poSbFiltrarArea = function(areaSlug) {
  // Remove ativo de itens de navegação
  document.querySelectorAll(".po-sb-item[id^='po-sb-btn-']").forEach(btn => {
    btn.classList.remove("ativo");
  });

  // Vai para o ranking e deixa o módulo principal filtrar por área
  // (a ser implementado no painel-ouro.js conforme necessidade)
  if (typeof window.poFiltrarPorArea === "function") {
    window.poFiltrarPorArea(areaSlug);
  } else if (typeof window.poTrocarAba === "function") {
    window.poTrocarAba("ranking");
  }

  // Feedback visual no item clicado
  const todos = document.querySelectorAll(".po-sb-nav .po-sb-item:not([id])");
  todos.forEach(el => el.classList.remove("ativo"));
  // encontra pelo onclick
  const alvo = [...todos].find(el =>
    el.getAttribute("onclick")?.includes(`'${areaSlug}'`)
  );
  if (alvo) alvo.classList.add("ativo");
};


// ============================================================
// 🚪 ENTRAR / SAIR DO MODO OURO
// ============================================================
// Espera window.telaPainelOuro ficar disponível (scripts defer podem
// não ter executado ainda). Tenta por até ~2 segundos.
function poSbEsperarModulo(tentativas = 40) {
  return new Promise(resolve => {
    let n = 0;
    const checar = () => {
      if (typeof window.telaPainelOuro === "function") return resolve(true);
      if (++n >= tentativas) {
        console.warn("👑 telaPainelOuro não ficou disponível a tempo");
        return resolve(false);
      }
      setTimeout(checar, 50);
    };
    checar();
  });
}

window.entrarModoOuro = async function() {
  console.log("👑 Entrando no modo Painel de Ouro");

  const sidebarEl = document.getElementById("sidebar");
  if (!sidebarEl) return;

  // Marca o modo ouro como ativo (persiste no refresh)
  try { sessionStorage.setItem("po_modo_ouro", "1"); } catch (_) {}

  // 🖼️ Troca a imagem de fundo (teclado → painelouro.jpg) e ativa o tema ouro
  document.body.classList.add("po-modo-ouro");

  // Substitui o sidebar pelo ouro (sem loading screen — silencioso)
  sidebarEl.innerHTML = poSbMontarSidebar();

  // Garante que o módulo do painel está carregado antes de abrir
  await poSbEsperarModulo();

  if (typeof window.abrirTelaInterna === "function") {
    await window.abrirTelaInterna("painel-ouro");
  }

  console.log("👑 Modo Painel de Ouro ativo");
};

window.sairModoOuro = async function() {
  console.log("👑 Saindo do modo Painel de Ouro");

  const sidebarEl = document.getElementById("sidebar");
  if (!sidebarEl) return;

  // Remove a marca do modo ouro (não restaura no próximo refresh)
  try { sessionStorage.removeItem("po_modo_ouro"); } catch (_) {}

  // 🖼️ Restaura a imagem de fundo padrão (volta o teclado)
  document.body.classList.remove("po-modo-ouro");

  // 1. Destroi gráficos antes de sair
  if (typeof window.poDestruirChartsPub === "function") {
    window.poDestruirChartsPub();
  }

  // 3. Busca o HTML do sidebar original diretamente via fetch
  //    SEM usar carregarSidebar() — ela tem guard data-loaded que bloqueia
  try {
    const res  = await fetch("components/sidebar.html");
    const html = await res.text();

    // Injeta o HTML (inclui <style> + <div class="main_box">)
    sidebarEl.innerHTML = html;

    // Reseta o guard para que future chamadas ao carregarSidebar funcionem
    sidebarEl.dataset.loaded = "true";

  } catch (err) {
    console.error("❌ Erro ao recarregar sidebar original", err);
    // Fallback mínimo: remove o conteúdo ouro e avisa
    sidebarEl.innerHTML = "<div style='padding:20px;color:#fff;font-size:12px'>Erro ao restaurar menu. Recarregue a página.</div>";
  }

  // 4. Restaura dados e permissões no sidebar recém-injetado
  await new Promise(r => setTimeout(r, 30));

  if (typeof window.preencherUsuario           === "function") window.preencherUsuario();
  if (typeof window.montarMenuIndicadores       === "function") window.montarMenuIndicadores();
  if (typeof window.aplicarPermissoesMenuPrincipal === "function") window.aplicarPermissoesMenuPrincipal();
  if (typeof window.lerFotoPerfil               === "function") window.lerFotoPerfil();

  // 5. Revincular botão logout (sidebar.html usa addEventListener no carregarSidebar original)
  try {
    const btnLogout = sidebarEl.querySelector(".btn-logout");
    if (btnLogout && !btnLogout.getAttribute("onclick") && !btnLogout.dataset.bound) {
      btnLogout.addEventListener("click", window.logout);
      btnLogout.dataset.bound = "true";
    }
  } catch (_) {}

  // 6. Remove fade
  sidebarEl.classList.remove("po-transitioning");

  // 7. Volta para a tela de análises
  if (typeof window.abrirTelaInterna === "function") {
    await window.abrirTelaInterna("analises");
  }

  console.log("👑 Modo Painel de Ouro encerrado");
};
// ============================================================
// 🔄 RESTAURAÇÃO AUTOMÁTICA APÓS REFRESH
// Se o usuário recarregou a página enquanto estava no modo ouro,
// reentra no painel automaticamente (silencioso, sem loading).
// ============================================================
(function poSbRestaurarModoOuro() {
  let restaurado = false;

  async function tentarRestaurar() {
    if (restaurado) return;

    let flag = null;
    try { flag = sessionStorage.getItem("po_modo_ouro"); } catch (_) {}
    if (flag !== "1") return;

    // espera o app estar pronto: sidebar + função de entrar + módulo
    const sidebarEl = document.getElementById("sidebar");
    const pronto = sidebarEl
      && typeof window.entrarModoOuro === "function"
      && typeof window.telaPainelOuro === "function"
      && typeof window.abrirTelaInterna === "function"
      && window.db;

    if (!pronto) return; // tenta de novo no próximo ciclo

    restaurado = true;
    console.log("👑 Restaurando modo Painel de Ouro após refresh");
    try {
      await window.entrarModoOuro();
    } catch (e) {
      console.error("👑 Falha ao restaurar modo ouro", e);
    }
  }

  // tenta a cada 150ms por até ~10s (cobre o defer + login + carga do db)
  let tentativas = 0;
  const intervalo = setInterval(() => {
    tentarRestaurar();
    if (restaurado || ++tentativas >= 66) clearInterval(intervalo);
  }, 150);
})();