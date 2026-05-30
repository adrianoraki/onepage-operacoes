// ==========================
// ⏳ CONTROLE DE INATIVIDADE
// ==========================
console.log("✅ idle.js carregado");

const TEMPO_INATIVIDADE_MS = 15 * 60 * 1000; // 15 minutos

let idleTimeout = null;
let monitoramentoInatividadeIniciado = false;

// flag global para modo apresentação
window.dashboardModoApresentacao = false;

// ==========================
// 🔁 RESETAR TIMER
// ==========================
function resetarTimerInatividade() {
  // se estiver em modo apresentação, não conta
  if (window.dashboardModoApresentacao) {
    console.log("📺 Modo apresentação ativo - timer ignorado");
    return;
  }

  if (idleTimeout) {
    clearTimeout(idleTimeout);
  }

  idleTimeout = setTimeout(() => {
    tratarInatividade();
  }, TEMPO_INATIVIDADE_MS);

  console.log("⏳ Timer de inatividade reiniciado");
}

// ==========================
// 🚪 TRATAR INATIVIDADE
// ==========================
function tratarInatividade() {
  if (window.dashboardModoApresentacao) {
    console.log("📺 Modo apresentação ativo - logout automático ignorado");
    resetarTimerInatividade();
    return;
  }

  console.warn("⏳ Sessão encerrada por inatividade");

  alert("Sua sessão foi encerrada por inatividade.");

  if (typeof logout === "function") {
    logout();
  } else {
    console.error("❌ Função logout não encontrada");
    window.location.replace("login.html");
  }
}

// ==========================
// 👂 EVENTOS DE ATIVIDADE
// ==========================
function iniciarMonitoramentoInatividade() {
  if (monitoramentoInatividadeIniciado) {
    console.warn("⚠️ Monitoramento de inatividade já iniciado");
    return;
  }

  monitoramentoInatividadeIniciado = true;

  console.log("✅ Monitoramento de inatividade iniciado");

  const eventos = [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click"
  ];

  eventos.forEach((evento) => {
    document.addEventListener(evento, resetarTimerInatividade, {
      passive: true
    });
  });

  // quando volta para a aba, reinicia
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !window.dashboardModoApresentacao) {
      console.log("👀 Aba voltou a ficar visível - reiniciando timer");
      resetarTimerInatividade();
    }
  });

  resetarTimerInatividade();
}

// ==========================
// ⏸️ PAUSAR TIMER
// ==========================
function pausarTimerInatividade() {
  if (idleTimeout) {
    clearTimeout(idleTimeout);
    idleTimeout = null;
  }

  console.log("⏸️ Timer de inatividade pausado");
}

// ==========================
// ▶️ RETOMAR TIMER
// ==========================
function retomarTimerInatividade() {
  console.log("▶️ Timer de inatividade retomado");
  resetarTimerInatividade();
}