// ============================================================
// 👑 PAINEL DE OURO — app/painel-ouro/painel-ouro.js  (NÚCLEO)
// Define a tela principal do painel (container #po-conteudo),
// o estado compartilhado PO_STATE, os helpers (poFmt, poNomeMes,
// poMostrarLoading, poErr, poLog), o sistema de abas (poTrocarAba)
// e as visões de Ranking e Evolução.
//
// Lê das mesmas tabelas usadas pelo restante do módulo:
//   painel_ouro_lojas / painel_ouro_indicadores_config / painel_ouro_resultados
// ============================================================
console.log("✅ painel-ouro.js (núcleo) carregado");

// ---------- ESTADO COMPARTILHADO ----------
window.PO_STATE = window.PO_STATE || {
  ano: new Date().getFullYear(),
  mes: new Date().getMonth() + 1,
  abaAtiva: "evolucao",
  semestre: (new Date().getMonth() + 1) <= 6 ? 1 : 2,
  regional: null, // null = todas; "NE1" | "NE2"
  dashMes: new Date().getMonth() + 1, // mês selecionado no dashboard
  areaAtiva: "vendas",
};
const PO_STATE = window.PO_STATE;

const PO_MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

// ---------- HELPERS GLOBAIS ----------
window.poLog = function (m, d) { d != null ? console.log(`👑 PO | ${m}`, d) : console.log(`👑 PO | ${m}`); };
window.poErr = function (m, d) { d != null ? console.error(`👑 PO | ${m}`, d) : console.error(`👑 PO | ${m}`); };
const poLog = window.poLog, poErr = window.poErr;

window.poNomeMes = function (mes) { return PO_MESES[Number(mes) - 1] || "—"; };
const poNomeMes = window.poNomeMes;

window.poFmt = function (n, casas = 0) {
  const num = Number(n);
  if (!isFinite(num)) return "–";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
};
const poFmt = window.poFmt;

window.poMostrarLoading = function (container) {
  if (!container) return;
  container.innerHTML = `<div class="po-loading-box"><div class="po-spin"></div> Carregando…</div>`;
};
const poMostrarLoading = window.poMostrarLoading;

// ---------- ESTILOS DO NÚCLEO (paleta suave clara) ----------
(function poNucleoEstilos() {
  if (document.getElementById("po-nucleo-styles")) return;
  const s = document.createElement("style");
  s.id = "po-nucleo-styles";
  s.textContent = `
.po-wrap {
  font-family: "Poppins", Inter, "Segoe UI", sans-serif;
  color: #2c3a47;
  background: transparent;
  min-height: 100%;
}
.po-topbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap; padding: 18px 28px 6px;
}
.po-topbar-titulo { display: flex; align-items: center; gap: 10px; }
.po-topbar-titulo .po-coroa { font-size: 22px; }
.po-topbar-titulo h1 {
  margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.2px;
  background: linear-gradient(135deg, #f3d98a, #c9a227);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  text-shadow: 0 1px 8px rgba(0,0,0,0.25);
}
.po-topbar-titulo .po-coroa { font-size: 22px; filter: drop-shadow(0 1px 4px rgba(0,0,0,0.4)); }
.po-topbar-titulo .po-sub { font-size: 11px; color: rgba(255,255,255,0.8); margin-top: 1px; text-shadow: 0 1px 4px rgba(0,0,0,0.4); }
.po-periodo { display: flex; align-items: center; gap: 8px; }
.po-periodo select {
  height: 34px; padding: 0 12px; border: 1px solid rgba(201,162,39,0.5); border-radius: 8px;
  background: rgba(255,255,255,0.92); color: #2c3a47; font-family: inherit; font-size: 12px;
  font-weight: 600; cursor: pointer; outline: none; backdrop-filter: blur(4px);
}
.po-periodo select:focus { border-color: #c9a227; }

.po-tabs { display: flex; gap: 6px; padding: 12px 28px 0; flex-wrap: wrap; }
.po-tab {
  height: 34px; padding: 0 16px; border: 1px solid rgba(255,255,255,0.18); border-radius: 8px 8px 0 0;
  background: rgba(20,16,8,0.42); color: rgba(255,255,255,0.7); font-family: inherit; font-size: 12px;
  font-weight: 600; cursor: pointer; transition: all 0.15s; backdrop-filter: blur(6px);
}
.po-tab:hover { background: rgba(40,32,14,0.5); color: #fff; }
.po-tab.ativa { background: rgba(255,255,255,0.96); color: #9a7b1c; border-color: rgba(255,255,255,0.96); }

#po-conteudo { padding: 16px 0 32px; background: transparent; min-height: 60vh; }

.po-loading-box {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 60px; color: rgba(255,255,255,0.85); font-size: 13px;
}
.po-spin {
  width: 22px; height: 22px; border: 2px solid #eee9da; border-top-color: #c9a227;
  border-radius: 50%; animation: poSpin 0.7s linear infinite;
}
@keyframes poSpin { to { transform: rotate(360deg); } }

.po-empty {
  text-align: center; padding: 50px 20px; color: rgba(255,255,255,0.85);
  margin: 0 28px; background: rgba(20,16,8,0.4); border-radius: 14px;
  backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.1);
}
.po-empty-ico { font-size: 34px; margin-bottom: 10px; }

/* ----- LAYOUT DE CARTÕES (usado pela aba Áreas e Ranking) ----- */
.po-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; padding: 0 28px; }
.po-col-12 { grid-column: span 12; }
.po-col-6  { grid-column: span 6; }
.po-card {
  background: #fff; border: 1px solid #e8edf2; border-radius: 14px;
  box-shadow: 0 4px 16px rgba(15,23,42,0.06); overflow: hidden;
}
.po-card-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; padding: 14px 18px; border-bottom: 1px solid #f0f3f6; flex-wrap: wrap;
}
.po-card-titulo {
  font-size: 12px; font-weight: 700; color: #9a7b1c;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.po-card-badge {
  font-size: 10px; font-weight: 600; color: #7a8c9a;
  background: #f6f1e3; padding: 3px 10px; border-radius: 10px;
}
.po-card-body { padding: 16px 18px; }

/* ----- TABELAS ----- */
.po-ranking-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.po-ranking-table thead th {
  background: #f7f9fb; color: #5d6b78; font-size: 10px; font-weight: 700;
  padding: 8px 10px; text-align: left; border-bottom: 1px solid #e8edf2; white-space: nowrap;
}
.po-ranking-table .txt-center { text-align: center; }
.po-ranking-table tbody td {
  padding: 8px 10px; border-bottom: 1px solid #f0f3f6; font-size: 12px; color: #23313f;
}
.po-ranking-table tbody tr { cursor: pointer; transition: background 0.12s; }
.po-ranking-table tbody tr:hover td { background: #faf6ea; }
.po-loja-nome { font-size: 12px; font-weight: 600; color: #0a3d62; }
.po-loja-cod  { font-size: 9px; color: #9aabb7; font-weight: 500; }

.po-pos {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 8px; font-weight: 800; font-size: 12px;
  background: #f1eee4; color: #8a8366;
}
.po-pos.ouro   { background: linear-gradient(135deg,#f3d98a,#c9a227); color: #4a3700; }
.po-pos.prata  { background: linear-gradient(135deg,#e8edf2,#c4cdd6); color: #3a4a5a; }
.po-pos.bronze { background: linear-gradient(135deg,#e8c8a6,#b6804f); color: #4a2c10; }

.po-barra-bg { background: #eef1f5; border-radius: 6px; height: 8px; overflow: hidden; min-width: 90px; }
.po-barra-fill { height: 100%; border-radius: 6px; background: linear-gradient(90deg,#e8c84a,#c9a227); }

/* tag de desempate na lista */
.po-tie {
  display: inline-block; font-size: 9.5px; font-weight: 700;
  color: #8a6a10; background: rgba(201,162,39,0.14);
  border: 1px solid rgba(201,162,39,0.3); border-radius: 999px;
  padding: 1px 7px; margin-left: 6px; vertical-align: middle; white-space: nowrap;
}

/* seletores de semestre / regional (segmented control) */
.po-filtros-sem { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
.po-seg-group {
  display: inline-flex; background: rgba(40,30,8,0.45);
  border: 1px solid rgba(201,162,39,0.35); border-radius: 10px; padding: 3px; gap: 2px;
}
.po-seg {
  border: none; background: transparent; cursor: pointer;
  font-size: 12.5px; font-weight: 700; color: #f0e2b0;
  padding: 6px 14px; border-radius: 8px; transition: all 0.15s;
}
.po-seg:hover { color: #fff; background: rgba(201,162,39,0.15); }
.po-seg.ativa { background: linear-gradient(135deg, #e8c84a, #c9a227); color: #3a2c08; box-shadow: 0 2px 6px rgba(201,162,39,0.3); }

/* badge de regional na lista */
.po-reg-badge {
  display: inline-block; font-size: 9.5px; font-weight: 800;
  color: #2d6a9a; background: rgba(45,123,181,0.12);
  border: 1px solid rgba(45,123,181,0.25); border-radius: 999px;
  padding: 1px 7px; margin-left: 4px; vertical-align: middle;
}

/* destaques (maior venda / menor vencimento) no ranking semestre */
.po-destaques { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 18px; justify-content: center; }
.po-destaque-item {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: rgba(255,255,255,0.5); border: 1px solid rgba(201,162,39,0.2);
  border-radius: 12px; padding: 10px 18px; min-width: 150px;
}
.po-destaque-lbl { font-size: 11px; font-weight: 700; color: #8a6a10; }
.po-destaque-item b { font-size: 13px; color: #4a3a12; }
.po-destaque-item span:last-child { font-size: 12px; color: #9a7b1c; font-weight: 700; }

/* 🔒 MODAL DE TRAVA / DESBLOQUEIO */
.po-trava-overlay {
  position: fixed; inset: 0; background: rgba(15,18,24,0.55);
  z-index: 99999; display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.2s; backdrop-filter: blur(3px);
}
.po-trava-overlay.aberto { opacity: 1; pointer-events: all; }
.po-trava-modal {
  width: min(400px, 92vw); background: #fff; border-radius: 18px; padding: 28px;
  text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  transform: translateY(14px) scale(0.98); transition: transform 0.2s;
}
.po-trava-overlay.aberto .po-trava-modal { transform: translateY(0) scale(1); }
.po-trava-ico { font-size: 38px; margin-bottom: 8px; }
.po-trava-modal h3 { font-size: 19px; font-weight: 800; color: #1f2a37; margin-bottom: 8px; }
.po-trava-modal p { font-size: 13.5px; color: #5b6b7d; line-height: 1.5; margin-bottom: 18px; }
.po-trava-campo { text-align: left; margin-bottom: 12px; }
.po-trava-campo label { display: block; font-size: 12px; font-weight: 600; color: #5b6b7d; margin-bottom: 4px; }
.po-trava-campo input {
  width: 100%; box-sizing: border-box; padding: 11px 13px; border-radius: 10px;
  border: 1px solid #dbe2ea; font-size: 14px; font-family: inherit;
}
.po-trava-campo input:focus { outline: none; border-color: #c9a227; box-shadow: 0 0 0 3px rgba(201,162,39,0.15); }
.po-trava-erro { color: #c0392b; font-size: 12.5px; font-weight: 600; min-height: 18px; margin-bottom: 8px; }
.po-trava-acoes { display: flex; gap: 10px; }
.po-trava-cancelar, .po-trava-confirmar {
  flex: 1; padding: 12px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; border: none;
}
.po-trava-cancelar { background: #eef1f5; color: #5b6b7d; }
.po-trava-cancelar:hover { background: #e2e7ed; }
.po-trava-confirmar { background: linear-gradient(135deg, #e8c84a, #c9a227); color: #4a3700; }
.po-trava-confirmar:hover { filter: brightness(1.05); }
.po-trava-confirmar:disabled { opacity: 0.6; cursor: wait; }

/* selo de período travado (mostrado nas telas de lançamento) */
.po-lock-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; color: #9a4a15;
  background: rgba(201,100,39,0.12); border: 1px solid rgba(201,100,39,0.3);
  border-radius: 999px; padding: 3px 11px;
}

/* 📊 DASHBOARD — barras horizontais por loja */
.po-dash-barras { display: flex; flex-direction: column; gap: 7px; }
.po-dash-row {
  display: grid; grid-template-columns: 160px 1fr 110px; align-items: center; gap: 12px;
  cursor: pointer; padding: 4px 6px; border-radius: 8px; transition: background 0.12s;
}
.po-dash-row:hover { background: rgba(201,162,39,0.08); }
.po-dash-loja {
  font-size: 12.5px; font-weight: 700; color: #4a3a12;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
body.po-modo-ouro .po-dash-loja { color: #f0e2b0; }
.po-dash-barra-wrap { background: rgba(150,150,150,0.15); border-radius: 6px; height: 18px; overflow: hidden; }
.po-dash-barra { height: 100%; border-radius: 6px; transition: width 0.4s ease; min-width: 2px; }
.po-dash-val { font-size: 12.5px; font-weight: 800; color: #9a7b1c; text-align: right; white-space: nowrap; }
.po-dash-pct { font-size: 11px; color: #9aabb7; font-weight: 600; }

@media (max-width: 560px) {
  .po-dash-row { grid-template-columns: 100px 1fr 80px; gap: 6px; }
  .po-dash-loja { font-size: 11px; }
}


/* ----- PÓDIO DO RANKING ANUAL (3 coroas) ----- */
.po-card-podio .po-card-body { padding: 10px 8px 22px; }
.po-podio {
  display: flex; align-items: flex-end; justify-content: center;
  gap: clamp(8px, 2.5vw, 28px); flex-wrap: nowrap;
}
.po-podio-item {
  flex: 1 1 0; max-width: 220px; min-width: 96px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  cursor: pointer; padding: 14px 10px 16px; border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,250,235,0.55));
  border: 1px solid rgba(201,162,39,0.22);
  transition: transform 0.15s, box-shadow 0.15s;
}
.po-podio-item:hover { transform: translateY(-3px); box-shadow: 0 10px 26px rgba(201,162,39,0.22); }
.po-podio-vazio { background: transparent; border: 1px dashed rgba(160,160,160,0.25); cursor: default; min-height: 150px; }
.po-podio-vazio:hover { transform: none; box-shadow: none; }

/* 1º lugar — maior e elevado ao centro */
.po-podio-item.p1 { transform: translateY(-14px) scale(1.06); border-color: rgba(201,162,39,0.5); background: linear-gradient(180deg, #fff7e0, #fdeec2); box-shadow: 0 12px 30px rgba(201,162,39,0.28); }
.po-podio-item.p1:hover { transform: translateY(-18px) scale(1.06); }
.po-podio-item.p2 { border-color: rgba(141,152,167,0.4); }
.po-podio-item.p3 { border-color: rgba(179,116,46,0.4); }

.po-coroa-wrap { position: relative; display: flex; flex-direction: column; align-items: center; }
.po-coroa-svg { width: clamp(48px, 8vw, 76px); height: auto; filter: drop-shadow(0 3px 4px rgba(120,90,15,0.3)); }
.po-podio-item.p1 .po-coroa-svg { width: clamp(60px, 10vw, 96px); }
.po-podio-num {
  margin-top: 4px; font-weight: 800; font-size: 13px; color: #7a5e12;
  background: rgba(255,255,255,0.7); border-radius: 999px; padding: 1px 10px;
}
.po-podio-item.p1 .po-podio-num { font-size: 15px; color: #8a6a10; }
.po-podio-loja { margin-top: 8px; font-weight: 800; font-size: clamp(12px, 1.5vw, 14px); color: #4a3a12; line-height: 1.2; }
.po-podio-cod { font-size: 10.5px; color: #9aabb7; margin-top: 1px; }
.po-podio-pts { margin-top: 6px; font-weight: 800; font-size: clamp(13px, 1.6vw, 16px); color: #9a7b1c; }
.po-podio-pct { font-size: 11px; font-weight: 700; margin-top: 1px; }

@media (max-width: 480px) {
  .po-podio { gap: 4px; }
  .po-podio-item { padding: 10px 4px 12px; min-width: 0; }
  .po-podio-cod { display: none; }
}

/* ----- BOTÃO TELA CHEIA ----- */
.po-fs-btn {
  width: 34px; height: 34px; border-radius: 9px;
  border: 1px solid rgba(201,162,39,0.3);
  background: rgba(201,162,39,0.10);
  color: #a07a15; font-size: 14px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.po-fs-btn:hover { background: rgba(201,162,39,0.20); color: #7a5e12; transform: translateY(-1px); }

/* botão flutuante de SAIR, visível só em tela cheia */
.po-fs-sair {
  display: none;
  position: fixed; top: 18px; right: 18px; z-index: 99999;
  width: 44px; height: 44px; border-radius: 12px;
  border: 1px solid rgba(201,162,39,0.4);
  background: rgba(40,30,8,0.85); color: #f5e6b8;
  font-size: 18px; cursor: pointer; align-items: center; justify-content: center;
  backdrop-filter: blur(6px);
}
.po-fs:fullscreen .po-fs-sair,
.po-fs:-webkit-full-screen .po-fs-sair { display: inline-flex; }
.po-fs-sair:hover { background: rgba(60,46,12,0.95); }

/* ----- MODO TELA CHEIA ----- */
.po-fs:fullscreen,
.po-fs:-webkit-full-screen {
  background: linear-gradient(160deg, #1c1608 0%, #2a2210 100%);
  padding: clamp(20px, 3vw, 44px);
  overflow-y: auto;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  display: block;
}
/* o grid em fullscreen ocupa toda a largura */
.po-fs:fullscreen.po-grid,
.po-fs:-webkit-full-screen.po-grid { width: 100%; max-width: 100%; margin: 0; }
/* dentro da tela cheia, cards ganham respiro e o conteúdo centraliza */
.po-fs:fullscreen .po-card,
.po-fs:-webkit-full-screen .po-card {
  max-width: 1200px; margin: 0 auto 18px; width: 100%; box-sizing: border-box;
  background: linear-gradient(180deg, rgba(48,40,16,0.92), rgba(34,27,10,0.92));
  border: 1px solid rgba(201,162,39,0.3);
}
.po-fs:fullscreen .po-card-titulo,
.po-fs:-webkit-full-screen .po-card-titulo { color: #f5e6b8; }
.po-fs:fullscreen .po-loja-nome,
.po-fs:-webkit-full-screen .po-loja-nome { color: #f0e2b0; }
.po-fs:fullscreen .po-ranking-table tbody td,
.po-fs:-webkit-full-screen .po-ranking-table tbody td { border-color: rgba(201,162,39,0.12); }
.po-fs:fullscreen .po-ranking-table tbody tr:hover td,
.po-fs:-webkit-full-screen .po-ranking-table tbody tr:hover td { background: rgba(201,162,39,0.1); }
.po-fs:fullscreen .po-podio,
.po-fs:-webkit-full-screen .po-podio { gap: clamp(16px, 4vw, 48px); }
.po-fs:fullscreen .po-coroa-svg,
.po-fs:-webkit-full-screen .po-coroa-svg { width: clamp(70px, 9vw, 120px); }
.po-fs:fullscreen .po-podio-item.p1 .po-coroa-svg,
.po-fs:-webkit-full-screen .po-podio-item.p1 .po-coroa-svg { width: clamp(90px, 12vw, 150px); }


/* ----- DETALHE (modal lateral) ----- */
.po-detalhe-overlay {
  position: fixed; inset: 0; background: rgba(20,24,30,0.35);
  z-index: 9200; display: flex; justify-content: flex-end;
  opacity: 0; pointer-events: none; transition: opacity 0.2s;
}
.po-detalhe-overlay.aberto { opacity: 1; pointer-events: all; }
.po-detalhe-painel {
  width: min(460px, 92vw); background: #fff; height: 100%; overflow-y: auto;
  box-shadow: -8px 0 30px rgba(15,23,42,0.12); transform: translateX(20px);
  transition: transform 0.2s; padding: 22px;
}
.po-detalhe-overlay.aberto .po-detalhe-painel { transform: translateX(0); }
.po-detalhe-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
.po-detalhe-fechar {
  border: none; background: #f1eee4; width: 30px; height: 30px; border-radius: 8px;
  cursor: pointer; color: #5d6b78; font-size: 14px;
}
.po-detalhe-area { margin-bottom: 14px; border: 1px solid #eee9da; border-radius: 10px; overflow: hidden; }
.po-detalhe-area-top {
  background: #f6f1e3; padding: 8px 12px; font-size: 11px; font-weight: 700; color: #9a7b1c;
  display: flex; justify-content: space-between;
}
.po-detalhe-area table { width: 100%; border-collapse: collapse; }
.po-detalhe-area td { padding: 6px 12px; font-size: 11px; border-bottom: 1px solid #f4f1e7; }

@media (max-width: 900px) {
  .po-grid { padding: 0 16px; }
  .po-topbar, .po-tabs { padding-left: 16px; padding-right: 16px; }
  .po-col-6 { grid-column: span 12; }
}
  `;
  document.head.appendChild(s);
})();

// ============================================================
// 📡 DADOS
// ============================================================
async function poCarregarRanking(ano, mes) {
  // soma a pontuação de todas as áreas por loja no período
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("loja_codigo, area_slug, pontuacao_obtida, pontuacao_maxima, painel_ouro_lojas(nome)")
    .eq("ano", ano).eq("mes", mes).eq("ativo", true);
  if (error) { poErr("Erro ao carregar ranking", error); return []; }

  const mapa = {};
  (data || []).forEach(r => {
    const cod = r.loja_codigo;
    if (!mapa[cod]) mapa[cod] = { codigo: cod, nome: r.painel_ouro_lojas?.nome || cod, obtido: 0, maximo: 0, areas: 0 };
    mapa[cod].obtido += Number(r.pontuacao_obtida) || 0;
    mapa[cod].maximo += Number(r.pontuacao_maxima) || 0;
    mapa[cod].areas += 1;
  });
  return Object.values(mapa).sort((a, b) => b.obtido - a.obtido);
}

async function poCarregarEvolucao(ano) {
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("mes, pontuacao_obtida")
    .eq("ano", ano).eq("ativo", true);
  if (error) { poErr("Erro ao carregar evolução", error); return []; }
  const porMes = new Array(12).fill(0);
  (data || []).forEach(r => { porMes[Number(r.mes) - 1] += Number(r.pontuacao_obtida) || 0; });
  return porMes;
}

// Total por mês de um ano, separando por ÁREA → { area_slug: [12 meses] }
async function poCarregarPorAreaMes(ano) {
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("mes, area_slug, pontuacao_obtida")
    .eq("ano", ano).eq("ativo", true);
  if (error) { poErr("Erro ao carregar por área", error); return {}; }
  const mapa = {};
  (data || []).forEach(r => {
    const a = r.area_slug || "outros";
    if (!mapa[a]) mapa[a] = new Array(12).fill(0);
    mapa[a][Number(r.mes) - 1] += Number(r.pontuacao_obtida) || 0;
  });
  return mapa;
}

// === DASHBOARD POR LOJA ===

// Ranking de lojas num MÊS específico de um ano (para barras horizontais)
async function poCarregarLojasNoMes(ano, mes) {
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("loja_codigo, pontuacao_obtida, pontuacao_maxima, painel_ouro_lojas(nome)")
    .eq("ano", ano).eq("mes", mes).eq("ativo", true);
  if (error) { poErr("Erro ao carregar lojas do mês", error); return []; }
  const mapa = {};
  (data || []).forEach(r => {
    const c = r.loja_codigo;
    if (!mapa[c]) mapa[c] = { codigo: c, nome: r.painel_ouro_lojas?.nome || c, obtido: 0, maximo: 0 };
    mapa[c].obtido += Number(r.pontuacao_obtida) || 0;
    mapa[c].maximo += Number(r.pontuacao_maxima) || 0;
  });
  return Object.values(mapa).sort((a, b) => b.obtido - a.obtido);
}

// Total acumulado por loja no ANO inteiro (para comparar 2025 vs 2026 por loja)
async function poCarregarLojasNoAno(ano) {
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("loja_codigo, pontuacao_obtida, painel_ouro_lojas(nome)")
    .eq("ano", ano).eq("ativo", true);
  if (error) { poErr("Erro ao carregar lojas do ano", error); return {}; }
  const mapa = {};
  (data || []).forEach(r => {
    const c = r.loja_codigo;
    if (!mapa[c]) mapa[c] = { codigo: c, nome: r.painel_ouro_lojas?.nome || c, obtido: 0 };
    mapa[c].obtido += Number(r.pontuacao_obtida) || 0;
  });
  return mapa; // { codigo: {nome, obtido} }
}

// ============================================================
// 🌎 REGIONAIS NE1 / NE2 — mesma lógica do módulo Comparativos
// ============================================================
const PO_ORDEM_LOJAS = [
  // NE1 (índices 0..13)
  "77","83","109","114","119","120","204","207","238","268","298","300","305","333",
  // NE2 (índices 14+)
  "44","46","76","91","107","138","152","163","179","250","198","262","284","289","290",
];
function poRegionalDaLoja(codigo, regionalCadastro) {
  const reg = String(regionalCadastro || "").trim().toUpperCase();
  if (reg === "NE1" || reg === "NE2") return reg;
  const idx = PO_ORDEM_LOJAS.indexOf(String(codigo || ""));
  if (idx !== -1) return idx < 14 ? "NE1" : "NE2";
  return reg || "—";
}
// meses de cada semestre
function poMesesSemestre(sem) { return sem === 2 ? [7,8,9,10,11,12] : [1,2,3,4,5,6]; }

// Carrega ranking de um SEMESTRE (soma 6 meses), com desempate e regional.
// filtroRegional: "NE1" | "NE2" | null (todas)
async function poCarregarRankingSemestre(ano, semestre, filtroRegional) {
  const meses = poMesesSemestre(semestre);
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("loja_codigo, area_slug, mes, pontuacao_obtida, pontuacao_maxima, sub_resultados, painel_ouro_lojas(nome, regional)")
    .eq("ano", ano).eq("ativo", true).in("mes", meses);
  if (error) { poErr("Erro ao carregar ranking semestral", error); return []; }

  const num = (v) => {
    if (v == null || v === "") return 0;
    if (typeof v === "number") return v;
    if (window.poCalculos && window.poCalculos.parseValorBR)
      return window.poCalculos.parseValorBR(String(v)) || 0;
    return Number(String(v).replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
  };

  const mapa = {};
  (data || []).forEach(r => {
    const cod = r.loja_codigo;
    const regional = poRegionalDaLoja(cod, r.painel_ouro_lojas?.regional);
    if (filtroRegional && regional !== filtroRegional) return;
    if (!mapa[cod]) mapa[cod] = {
      codigo: cod, nome: r.painel_ouro_lojas?.nome || cod, regional,
      obtido: 0, maximo: 0, meses: new Set(),
      totalVenda: 0, totalVencimento: 0,
    };
    mapa[cod].obtido += Number(r.pontuacao_obtida) || 0;
    mapa[cod].maximo += Number(r.pontuacao_maxima) || 0;
    if (r.mes != null) mapa[cod].meses.add(Number(r.mes));
    const subs = Array.isArray(r.sub_resultados) ? r.sub_resultados : [];
    if (r.area_slug === "vendas") {
      const sv = subs.find(s => s.indicador === "venda");
      if (sv) mapa[cod].totalVenda += num(sv.resultado);
    }
    if (r.area_slug === "prevencao") {
      const sc = subs.find(s => s.indicador === "vencimento");
      if (sc) mapa[cod].totalVencimento += num(sc.resultado);
    }
  });

  return Object.values(mapa)
    .map(m => ({ ...m, qtdMeses: m.meses.size }))
    .sort((a, b) => {
      if (b.obtido !== a.obtido) return b.obtido - a.obtido;
      if (b.totalVenda !== a.totalVenda) return b.totalVenda - a.totalVenda;
      return a.totalVencimento - b.totalVencimento;
    });
}

// Soma a pontuação do ANO INTEIRO (todos os meses) por loja → ranking anual
// Inclui critério de desempate: pontuação → maior venda → menor vencimento
async function poCarregarRankingAnual(ano) {
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("loja_codigo, area_slug, mes, pontuacao_obtida, pontuacao_maxima, sub_resultados, painel_ouro_lojas(nome)")
    .eq("ano", ano).eq("ativo", true);
  if (error) { poErr("Erro ao carregar ranking anual", error); return []; }

  // helper: converte valor BR (com R$, pontos, vírgula) em número
  const num = (v) => {
    if (v == null || v === "") return 0;
    if (typeof v === "number") return v;
    if (window.poCalculos && window.poCalculos.parseValorBR)
      return window.poCalculos.parseValorBR(String(v)) || 0;
    return Number(String(v).replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
  };

  const mapa = {};
  (data || []).forEach(r => {
    const cod = r.loja_codigo;
    if (!mapa[cod]) mapa[cod] = {
      codigo: cod, nome: r.painel_ouro_lojas?.nome || cod,
      obtido: 0, maximo: 0, meses: new Set(),
      totalVenda: 0, totalVencimento: 0,
    };
    mapa[cod].obtido += Number(r.pontuacao_obtida) || 0;
    mapa[cod].maximo += Number(r.pontuacao_maxima) || 0;
    if (r.mes != null) mapa[cod].meses.add(Number(r.mes));

    // desempate: acumula venda bruta (área vendas) e vencimento bruto (área prevenção)
    const subs = Array.isArray(r.sub_resultados) ? r.sub_resultados : [];
    if (r.area_slug === "vendas") {
      const sv = subs.find(s => s.indicador === "venda");
      if (sv) mapa[cod].totalVenda += num(sv.resultado);
    }
    if (r.area_slug === "prevencao") {
      const sc = subs.find(s => s.indicador === "vencimento");
      if (sc) mapa[cod].totalVencimento += num(sc.resultado);
    }
  });

  return Object.values(mapa)
    .map(m => ({ ...m, qtdMeses: m.meses.size }))
    .sort((a, b) => {
      // 1º critério: maior pontuação
      if (b.obtido !== a.obtido) return b.obtido - a.obtido;
      // 2º critério (desempate): maior venda bruta
      if (b.totalVenda !== a.totalVenda) return b.totalVenda - a.totalVenda;
      // 3º critério (desempate): menor vencimento bruto
      return a.totalVencimento - b.totalVencimento;
    });
}

async function poCarregarDetalheLoja(codigo, ano, mes) {
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("area_slug, pontuacao_obtida, pontuacao_maxima, sub_resultados, painel_ouro_lojas(nome)")
    .eq("loja_codigo", codigo).eq("ano", ano).eq("mes", mes).eq("ativo", true);
  if (error) { poErr("Erro ao carregar detalhe", error); return null; }
  return data || [];
}

// Detalhe ANUAL: soma por área ao longo de todos os meses do ano
async function poCarregarDetalheLojaAnual(codigo, ano) {
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("area_slug, pontuacao_obtida, pontuacao_maxima, painel_ouro_lojas(nome)")
    .eq("loja_codigo", codigo).eq("ano", ano).eq("ativo", true);
  if (error) { poErr("Erro ao carregar detalhe anual", error); return null; }
  // agrega por área
  const porArea = {};
  let nome = codigo;
  (data || []).forEach(d => {
    nome = d.painel_ouro_lojas?.nome || nome;
    const a = d.area_slug;
    if (!porArea[a]) porArea[a] = { area_slug: a, obtido: 0, maximo: 0 };
    porArea[a].obtido += Number(d.pontuacao_obtida) || 0;
    porArea[a].maximo += Number(d.pontuacao_maxima) || 0;
  });
  return { nome, areas: Object.values(porArea) };
}

// ============================================================
// 🖼️ TELA PRINCIPAL — monta #po-conteudo dentro de #conteudo
// ============================================================
window.telaPainelOuro = async function () {
  const host = document.getElementById("conteudo");
  if (!host) { poErr("#conteudo não encontrado"); return; }

  const anoAtual = new Date().getFullYear();
  const optAno = [];
  // mostra de 2025 até o ano atual (anos futuros ficam ocultos até virarem o ano)
  for (let a = 2025; a <= anoAtual; a++)
    optAno.push(`<option value="${a}" ${a === PO_STATE.ano ? "selected" : ""}>${a}</option>`);
  const optMes = PO_MESES.map((m, i) =>
    `<option value="${i + 1}" ${i + 1 === PO_STATE.mes ? "selected" : ""}>${m}</option>`).join("");

  host.innerHTML = `
    <div class="po-wrap">
      <div class="po-topbar">
        <div class="po-topbar-titulo">
          <span class="po-coroa">👑</span>
          <div>
            <h1>Painel de Ouro</h1>
            <div class="po-sub">Ranking de desempenho por loja</div>
          </div>
        </div>
        <div class="po-periodo">
          <select id="po-sel-ano" onchange="poAlterarPeriodo()">${optAno.join("")}</select>
          <select id="po-sel-mes" onchange="poAlterarPeriodo()" style="display:none">${optMes}</select>
        </div>
      </div>

      <div class="po-tabs">
        <button type="button" class="po-tab ${PO_STATE.abaAtiva === "evolucao" ? "ativa" : ""}" data-aba="evolucao" onclick="poTrocarAba('evolucao')">Ranking Anual</button>
        <button type="button" class="po-tab ${PO_STATE.abaAtiva === "ranking" ? "ativa" : ""}" data-aba="ranking" onclick="poTrocarAba('ranking')">Resultados Semestre</button>
        <button type="button" class="po-tab ${PO_STATE.abaAtiva === "areas" ? "ativa" : ""}" data-aba="areas" onclick="poTrocarAba('areas')">Ranking Semestre</button>
        <button type="button" class="po-tab ${PO_STATE.abaAtiva === "superacao" ? "ativa" : ""}" data-aba="superacao" onclick="poTrocarAba('superacao')">🚀 Superação</button>
        <button type="button" class="po-tab ${PO_STATE.abaAtiva === "dashboard" ? "ativa" : ""}" data-aba="dashboard" onclick="poTrocarAba('dashboard')">📊 Dashboard</button>
      </div>

      <div id="po-conteudo"></div>
    </div>`;

  await window.poTrocarAba(PO_STATE.abaAtiva || "ranking");
};

window.poAlterarPeriodo = async function () {
  const a = document.getElementById("po-sel-ano");
  const m = document.getElementById("po-sel-mes");
  if (a) PO_STATE.ano = Number(a.value);
  if (m) PO_STATE.mes = Number(m.value);
  await window.poTrocarAba(PO_STATE.abaAtiva || "ranking");
};

// ============================================================
// 🗂️ SISTEMA DE ABAS
// ============================================================
window.poTrocarAba = async function (aba) {
  PO_STATE.abaAtiva = aba;
  document.querySelectorAll(".po-tab").forEach(t =>
    t.classList.toggle("ativa", t.dataset.aba === aba));

  const conteudo = document.getElementById("po-conteudo");
  if (!conteudo) { // tela ainda não montada
    if (typeof window.telaPainelOuro === "function") await window.telaPainelOuro();
    return;
  }

  window.poDestruirChartsPub();

  if (aba === "evolucao") return window.poRenderRankingAnual(conteudo, PO_STATE.ano);
  if (aba === "dashboard") return window.poRenderDashboard(conteudo);
  if (aba === "superacao") return window.poRenderSuperacao(conteudo);
  if (aba === "ranking")  return window.poRenderResultadosSemestre(conteudo, PO_STATE.ano, PO_STATE.semestre, PO_STATE.regional);
  if (aba === "areas")    return window.poRenderRankingSemestre(conteudo, PO_STATE.ano, PO_STATE.semestre, PO_STATE.regional);
};

// ============================================================
// 🏆 ABA RANKING
// ============================================================
async function poRenderRanking(container, ano, mes) {
  poMostrarLoading(container);
  const ranking = await poCarregarRanking(ano, mes);

  if (!ranking.length) {
    container.innerHTML = `<div class="po-empty"><div class="po-empty-ico">🏆</div>
      <p>Sem lançamentos para ${poNomeMes(mes)}/${ano}.</p></div>`;
    return;
  }

  const maxObtido = Math.max(...ranking.map(r => r.obtido), 1);

  const linhas = ranking.map((r, i) => {
    const pos = i + 1;
    const cls = pos === 1 ? "ouro" : pos === 2 ? "prata" : pos === 3 ? "bronze" : "";
    const pct = r.maximo > 0 ? Math.round((r.obtido / r.maximo) * 100) : 0;
    const larg = Math.round((r.obtido / maxObtido) * 100);
    return `
      <tr onclick="poAbrirDetalhe('${r.codigo}')">
        <td class="txt-center"><span class="po-pos ${cls}">${pos}</span></td>
        <td>
          <div class="po-loja-nome">${r.nome}</div>
          <div class="po-loja-cod">#${r.codigo} · ${r.areas} áreas</div>
        </td>
        <td class="txt-center" style="font-weight:800;color:#9a7b1c">${poFmt(r.obtido)} / ${poFmt(r.maximo)}</td>
        <td class="txt-center" style="font-weight:700;color:${pct >= 70 ? "#1e7d45" : pct >= 40 ? "#a07a15" : "#c0392b"}">${pct}%</td>
        <td><div class="po-barra-bg"><div class="po-barra-fill" style="width:${larg}%"></div></div></td>
      </tr>`;
  }).join("");

  container.innerHTML = `
    <div class="po-grid">
      <div class="po-col-12 po-card" id="po-card-ranking-mensal">
        <div class="po-card-header">
          <span class="po-card-titulo">Ranking — ${poNomeMes(mes)} ${ano}</span>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="po-card-badge">${ranking.length} lojas</span>
            <button type="button" class="po-fs-btn" title="Tela cheia" onclick="poTelaCheia('po-card-ranking-mensal')">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>
        <div class="po-card-body" style="padding:0;overflow-x:auto;">
          <table class="po-ranking-table">
            <thead><tr>
              <th class="txt-center" style="width:50px">#</th>
              <th>Loja</th>
              <th class="txt-center">Pontos</th>
              <th class="txt-center">Aproveit.</th>
              <th>Desempenho</th>
            </tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}
window.poRenderRanking = poRenderRanking;

// ============================================================
// 🏆 ABA RANKING ANUAL — pódio de coroas + lista (ano vigente)
// ============================================================
async function poRenderRankingAnual(container, ano) {
  poMostrarLoading(container);
  const ranking = await poCarregarRankingAnual(ano);

  if (!ranking.length) {
    container.innerHTML = `<div class="po-empty"><div class="po-empty-ico">🏆</div>
      <p>Sem lançamentos em ${ano} ainda. O ranking aparece automaticamente conforme os pontos são preenchidos.</p></div>`;
    return;
  }

  const maxObtido = Math.max(...ranking.map(r => r.obtido), 1);

  // ---------- PÓDIO (top 3): 2º esquerda, 1º centro, 3º direita ----------
  const p1 = ranking[0] || null;
  const p2 = ranking[1] || null;
  const p3 = ranking[2] || null;

  const coroaCard = (r, pos) => {
    if (!r) return `<div class="po-podio-item po-podio-vazio"></div>`;
    const pct = r.maximo > 0 ? Math.round((r.obtido / r.maximo) * 100) : 0;
    const classe = pos === 1 ? "p1" : pos === 2 ? "p2" : "p3";
    const corPos = pos === 1 ? "#c9a227" : pos === 2 ? "#8d98a7" : "#b3742e";
    return `
      <div class="po-podio-item ${classe}" onclick="poAbrirDetalheAnual('${r.codigo}')">
        <div class="po-coroa-wrap">
          <svg viewBox="0 0 64 52" class="po-coroa-svg" aria-hidden="true">
            <defs>
              <linearGradient id="grad-${classe}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#ffe98a"/>
                <stop offset="0.5" stop-color="${corPos}"/>
                <stop offset="1" stop-color="#7a5e12"/>
              </linearGradient>
            </defs>
            <path d="M6 16 L16 34 L24 14 L32 32 L40 14 L48 34 L58 16 L54 44 L10 44 Z"
                  fill="url(#grad-${classe})" stroke="#6e560f" stroke-width="1.2" stroke-linejoin="round"/>
            <circle cx="6" cy="16" r="4" fill="url(#grad-${classe})" stroke="#6e560f" stroke-width="1"/>
            <circle cx="32" cy="10" r="4.5" fill="url(#grad-${classe})" stroke="#6e560f" stroke-width="1"/>
            <circle cx="58" cy="16" r="4" fill="url(#grad-${classe})" stroke="#6e560f" stroke-width="1"/>
            <rect x="10" y="44" width="44" height="5" rx="2" fill="url(#grad-${classe})" stroke="#6e560f" stroke-width="1"/>
          </svg>
          <span class="po-podio-num">${pos}º</span>
        </div>
        <div class="po-podio-loja">${r.nome}</div>
        <div class="po-podio-cod">#${r.codigo}</div>
        <div class="po-podio-pts">${poFmt(r.obtido)} pts</div>
        <div class="po-podio-pct" style="color:${pct >= 70 ? "#1e7d45" : pct >= 40 ? "#a07a15" : "#c0392b"}">${pct}% aproveit.</div>
      </div>`;
  };

  const podioHtml = `
    <div class="po-podio">
      ${coroaCard(p2, 2)}
      ${coroaCard(p1, 1)}
      ${coroaCard(p3, 3)}
    </div>`;

  // ---------- LISTA COMPLETA (mesma temática do ranking mensal) ----------
  const linhas = ranking.map((r, i) => {
    const pos = i + 1;
    const cls = pos === 1 ? "ouro" : pos === 2 ? "prata" : pos === 3 ? "bronze" : "";
    const pct = r.maximo > 0 ? Math.round((r.obtido / r.maximo) * 100) : 0;
    const larg = Math.round((r.obtido / maxObtido) * 100);
    // marca se houve empate de pontuação com o vizinho (desempatado por venda/vencimento)
    const empatouAntes = i > 0 && ranking[i - 1].obtido === r.obtido;
    const empatouDepois = i < ranking.length - 1 && ranking[i + 1].obtido === r.obtido;
    const tag = (empatouAntes || empatouDepois)
      ? `<span class="po-tie" title="Posição definida por desempate: maior venda, depois menor vencimento">⚖ desempate</span>` : "";
    return `
      <tr onclick="poAbrirDetalheAnual('${r.codigo}')">
        <td class="txt-center"><span class="po-pos ${cls}">${pos}</span></td>
        <td>
          <div class="po-loja-nome">${r.nome} ${tag}</div>
          <div class="po-loja-cod">#${r.codigo} · ${r.qtdMeses} ${r.qtdMeses === 1 ? "mês" : "meses"}</div>
        </td>
        <td class="txt-center" style="font-weight:800;color:#9a7b1c">${poFmt(r.obtido)} / ${poFmt(r.maximo)}</td>
        <td class="txt-center" style="font-weight:700;color:${pct >= 70 ? "#1e7d45" : pct >= 40 ? "#a07a15" : "#c0392b"}">${pct}%</td>
        <td><div class="po-barra-bg"><div class="po-barra-fill" style="width:${larg}%"></div></div></td>
      </tr>`;
  }).join("");

  container.innerHTML = `
    <div class="po-grid" id="po-card-ranking-anual">
      <div class="po-col-12 po-card po-card-podio">
        <div class="po-card-header">
          <span class="po-card-titulo">🏆 Ranking Anual — ${ano}</span>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="po-card-badge">${ranking.length} lojas · atualizado automaticamente</span>
            <button type="button" class="po-fs-btn" title="Tela cheia" onclick="poTelaCheia('po-card-ranking-anual')">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>
        <div class="po-card-body">
          ${podioHtml}
        </div>
      </div>

      <div class="po-col-12 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">Classificação completa</span>
          <span class="po-card-badge">acumulado do ano</span>
        </div>
        <div class="po-card-body" style="padding:0;overflow-x:auto;">
          <table class="po-ranking-table">
            <thead><tr>
              <th class="txt-center" style="width:50px">#</th>
              <th>Loja</th>
              <th class="txt-center">Pontos</th>
              <th class="txt-center">Aproveit.</th>
              <th>Desempenho</th>
            </tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}
window.poRenderRankingAnual = poRenderRankingAnual;

// ============================================================
// 🗓️ BARRA DE SELETORES (semestre 1/2 + regional NE1/NE2/Todas)
// ============================================================
function poBarraSemestre(semestre, regional) {
  const seg = (val, txt, ativo, fn) =>
    `<button type="button" class="po-seg ${ativo ? "ativa" : ""}" onclick="${fn}">${txt}</button>`;
  return `
    <div class="po-filtros-sem">
      <div class="po-seg-group">
        ${seg(1, "1º Semestre", semestre === 1, "poSetSemestre(1)")}
        ${seg(2, "2º Semestre", semestre === 2, "poSetSemestre(2)")}
      </div>
      <div class="po-seg-group">
        ${seg("", "Todas", !regional, "poSetRegional(null)")}
        ${seg("NE1", "NE1", regional === "NE1", "poSetRegional('NE1')")}
        ${seg("NE2", "NE2", regional === "NE2", "poSetRegional('NE2')")}
      </div>
    </div>`;
}
window.poSetSemestre = function (s) { PO_STATE.semestre = s; window.poTrocarAba(PO_STATE.abaAtiva); };
window.poSetRegional = function (r) { PO_STATE.regional = r; window.poTrocarAba(PO_STATE.abaAtiva); };

// ============================================================
// 📊 ABA "RESULTADOS SEMESTRE" — pontuação somada de 6 meses
//    (dividida por regional NE1/NE2, ou todas)
// ============================================================
async function poRenderResultadosSemestre(container, ano, semestre, regional) {
  poMostrarLoading(container);
  const ranking = await poCarregarRankingSemestre(ano, semestre, regional);
  const rotuloReg = regional ? regional : "Todas as regionais";
  const rotuloSem = semestre === 2 ? "2º Semestre (Jul–Dez)" : "1º Semestre (Jan–Jun)";

  if (!ranking.length) {
    container.innerHTML = poBarraSemestre(semestre, regional) +
      `<div class="po-empty"><div class="po-empty-ico">📊</div>
        <p>Sem lançamentos no ${rotuloSem} de ${ano}${regional ? " · " + regional : ""}.</p></div>`;
    return;
  }

  // totais do semestre
  const totObtido = ranking.reduce((s, r) => s + r.obtido, 0);
  const totMaximo = ranking.reduce((s, r) => s + r.maximo, 0);
  const pctGeral = totMaximo > 0 ? Math.round((totObtido / totMaximo) * 100) : 0;
  const maxObtido = Math.max(...ranking.map(r => r.obtido), 1);

  const linhas = ranking.map((r, i) => {
    const pct = r.maximo > 0 ? Math.round((r.obtido / r.maximo) * 100) : 0;
    const larg = Math.round((r.obtido / maxObtido) * 100);
    return `
      <tr onclick="poAbrirDetalheSemestre('${r.codigo}')">
        <td class="txt-center" style="color:#9aabb7;font-weight:700">${i + 1}</td>
        <td>
          <div class="po-loja-nome">${r.nome} <span class="po-reg-badge">${r.regional}</span></div>
          <div class="po-loja-cod">#${r.codigo} · ${r.qtdMeses} ${r.qtdMeses === 1 ? "mês" : "meses"}</div>
        </td>
        <td class="txt-center" style="font-weight:800;color:#9a7b1c">${poFmt(r.obtido)} / ${poFmt(r.maximo)}</td>
        <td class="txt-center" style="font-weight:700;color:${pct >= 70 ? "#1e7d45" : pct >= 40 ? "#a07a15" : "#c0392b"}">${pct}%</td>
        <td><div class="po-barra-bg"><div class="po-barra-fill" style="width:${larg}%"></div></div></td>
      </tr>`;
  }).join("");

  container.innerHTML = poBarraSemestre(semestre, regional) + `
    <div class="po-grid" id="po-card-result-sem">
      <div class="po-col-12 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">📊 Resultados — ${rotuloSem} ${ano}</span>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="po-card-badge">${rotuloReg} · ${ranking.length} lojas · ${pctGeral}% geral</span>
            <button type="button" class="po-fs-btn" title="Tela cheia" onclick="poTelaCheia('po-card-result-sem')"><i class="fas fa-expand"></i></button>
          </div>
        </div>
        <div class="po-card-body" style="padding:0;overflow-x:auto;">
          <table class="po-ranking-table">
            <thead><tr>
              <th class="txt-center" style="width:40px">#</th>
              <th>Loja</th>
              <th class="txt-center">Pontos</th>
              <th class="txt-center">Aproveit.</th>
              <th>Desempenho</th>
            </tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}
window.poRenderResultadosSemestre = poRenderResultadosSemestre;

// ============================================================
// 🏆 ABA "RANKING SEMESTRE" — pódio + indicadores-chave do semestre
// ============================================================
async function poRenderRankingSemestre(container, ano, semestre, regional) {
  poMostrarLoading(container);
  const ranking = await poCarregarRankingSemestre(ano, semestre, regional);
  const rotuloSem = semestre === 2 ? "2º Semestre" : "1º Semestre";
  const rotuloReg = regional ? regional : "Todas";

  if (!ranking.length) {
    container.innerHTML = poBarraSemestre(semestre, regional) +
      `<div class="po-empty"><div class="po-empty-ico">🏆</div>
        <p>Sem dados no ${rotuloSem} de ${ano}${regional ? " · " + regional : ""}.</p></div>`;
    return;
  }

  const maxObtido = Math.max(...ranking.map(r => r.obtido), 1);
  const p1 = ranking[0], p2 = ranking[1], p3 = ranking[2];

  const coroaCard = (r, pos) => {
    if (!r) return `<div class="po-podio-item po-podio-vazio"></div>`;
    const pct = r.maximo > 0 ? Math.round((r.obtido / r.maximo) * 100) : 0;
    const classe = pos === 1 ? "p1" : pos === 2 ? "p2" : "p3";
    const corPos = pos === 1 ? "#c9a227" : pos === 2 ? "#8d98a7" : "#b3742e";
    return `
      <div class="po-podio-item ${classe}" onclick="poAbrirDetalheSemestre('${r.codigo}')">
        <div class="po-coroa-wrap">
          <svg viewBox="0 0 64 52" class="po-coroa-svg" aria-hidden="true">
            <defs><linearGradient id="grads-${classe}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ffe98a"/><stop offset="0.5" stop-color="${corPos}"/><stop offset="1" stop-color="#7a5e12"/>
            </linearGradient></defs>
            <path d="M6 16 L16 34 L24 14 L32 32 L40 14 L48 34 L58 16 L54 44 L10 44 Z" fill="url(#grads-${classe})" stroke="#6e560f" stroke-width="1.2" stroke-linejoin="round"/>
            <circle cx="6" cy="16" r="4" fill="url(#grads-${classe})" stroke="#6e560f" stroke-width="1"/>
            <circle cx="32" cy="10" r="4.5" fill="url(#grads-${classe})" stroke="#6e560f" stroke-width="1"/>
            <circle cx="58" cy="16" r="4" fill="url(#grads-${classe})" stroke="#6e560f" stroke-width="1"/>
            <rect x="10" y="44" width="44" height="5" rx="2" fill="url(#grads-${classe})" stroke="#6e560f" stroke-width="1"/>
          </svg>
          <span class="po-podio-num">${pos}º</span>
        </div>
        <div class="po-podio-loja">${r.nome}</div>
        <div class="po-podio-cod">#${r.codigo} · ${r.regional}</div>
        <div class="po-podio-pts">${poFmt(r.obtido)} pts</div>
        <div class="po-podio-pct" style="color:${pct >= 70 ? "#1e7d45" : pct >= 40 ? "#a07a15" : "#c0392b"}">${pct}% aproveit.</div>
      </div>`;
  };

  // indicadores-chave: maior venda e menor vencimento do semestre (destaques)
  const liderVenda = [...ranking].sort((a, b) => b.totalVenda - a.totalVenda)[0];
  const liderVenc = [...ranking].filter(r => r.totalVencimento > 0).sort((a, b) => a.totalVencimento - b.totalVencimento)[0];

  const linhas = ranking.map((r, i) => {
    const pos = i + 1;
    const cls = pos === 1 ? "ouro" : pos === 2 ? "prata" : pos === 3 ? "bronze" : "";
    const pct = r.maximo > 0 ? Math.round((r.obtido / r.maximo) * 100) : 0;
    const larg = Math.round((r.obtido / maxObtido) * 100);
    return `
      <tr onclick="poAbrirDetalheSemestre('${r.codigo}')">
        <td class="txt-center"><span class="po-pos ${cls}">${pos}</span></td>
        <td>
          <div class="po-loja-nome">${r.nome} <span class="po-reg-badge">${r.regional}</span></div>
          <div class="po-loja-cod">#${r.codigo}</div>
        </td>
        <td class="txt-center" style="font-weight:800;color:#9a7b1c">${poFmt(r.obtido)}</td>
        <td class="txt-center" style="font-weight:700;color:${pct >= 70 ? "#1e7d45" : pct >= 40 ? "#a07a15" : "#c0392b"}">${pct}%</td>
        <td class="txt-center" style="font-size:12px;color:#5d6b78">R$ ${poFmt(r.totalVenda)}</td>
        <td><div class="po-barra-bg"><div class="po-barra-fill" style="width:${larg}%"></div></div></td>
      </tr>`;
  }).join("");

  container.innerHTML = poBarraSemestre(semestre, regional) + `
    <div class="po-grid" id="po-card-rank-sem">
      <div class="po-col-12 po-card po-card-podio">
        <div class="po-card-header">
          <span class="po-card-titulo">🏆 Ranking ${rotuloSem} — ${ano}</span>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="po-card-badge">${rotuloReg} · ${ranking.length} lojas</span>
            <button type="button" class="po-fs-btn" title="Tela cheia" onclick="poTelaCheia('po-card-rank-sem')"><i class="fas fa-expand"></i></button>
          </div>
        </div>
        <div class="po-card-body">
          <div class="po-podio">
            ${coroaCard(p2, 2)}${coroaCard(p1, 1)}${coroaCard(p3, 3)}
          </div>
          <div class="po-destaques">
            ${liderVenda ? `<div class="po-destaque-item"><span class="po-destaque-lbl">🥇 Maior venda</span><b>${liderVenda.nome}</b><span>R$ ${poFmt(liderVenda.totalVenda)}</span></div>` : ""}
            ${liderVenc ? `<div class="po-destaque-item"><span class="po-destaque-lbl">🛡️ Menor vencimento</span><b>${liderVenc.nome}</b><span>R$ ${poFmt(liderVenc.totalVencimento)}</span></div>` : ""}
          </div>
        </div>
      </div>

      <div class="po-col-12 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">Classificação — indicadores-chave</span>
          <span class="po-card-badge">pontos + venda do semestre</span>
        </div>
        <div class="po-card-body" style="padding:0;overflow-x:auto;">
          <table class="po-ranking-table">
            <thead><tr>
              <th class="txt-center" style="width:50px">#</th>
              <th>Loja</th>
              <th class="txt-center">Pontos</th>
              <th class="txt-center">Aproveit.</th>
              <th class="txt-center">Venda</th>
              <th>Desempenho</th>
            </tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}
window.poRenderRankingSemestre = poRenderRankingSemestre;

// Detalhe de loja no semestre (soma os 6 meses por área)
window.poAbrirDetalheSemestre = async function (codigo) {
  let ov = document.getElementById("po-detalhe-overlay");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "po-detalhe-overlay"; ov.className = "po-detalhe-overlay";
    ov.addEventListener("click", e => { if (e.target === ov) poFecharDetalhe(); });
    document.body.appendChild(ov);
  }
  ov.innerHTML = `<div class="po-detalhe-painel"><div class="po-loading-box"><div class="po-spin"></div> Carregando…</div></div>`;
  ov.classList.add("aberto");

  const meses = poMesesSemestre(PO_STATE.semestre);
  const { data } = await window.db
    .from("painel_ouro_resultados")
    .select("area_slug, pontuacao_obtida, pontuacao_maxima, painel_ouro_lojas(nome)")
    .eq("loja_codigo", codigo).eq("ano", PO_STATE.ano).eq("ativo", true).in("mes", meses);

  const NOMES_AREA = {
    vendas:"Vendas", quebras:"Quebras", frente_caixa:"Frente de Caixa", passai:"Passaí",
    servicos_assai:"Serviços Assaí", rh:"RH", prevencao:"Prevenção", ti_rub_rm:"TI / RUB / RM", adm:"ADM",
  };
  const porArea = {}; let nome = codigo;
  (data || []).forEach(d => {
    nome = d.painel_ouro_lojas?.nome || nome;
    if (!porArea[d.area_slug]) porArea[d.area_slug] = { obtido: 0, maximo: 0 };
    porArea[d.area_slug].obtido += Number(d.pontuacao_obtida) || 0;
    porArea[d.area_slug].maximo += Number(d.pontuacao_maxima) || 0;
  });

  let tot = 0, max = 0;
  const blocos = Object.entries(porArea).sort((a,b)=>b[1].obtido-a[1].obtido).map(([slug, v]) => {
    tot += v.obtido; max += v.maximo;
    const pct = v.maximo > 0 ? Math.round((v.obtido/v.maximo)*100) : 0;
    return `<div class="po-detalhe-area"><div class="po-detalhe-area-top">
      <span>${NOMES_AREA[slug] || slug}</span><span>${poFmt(v.obtido)} / ${poFmt(v.maximo)} pts · ${pct}%</span></div></div>`;
  }).join("");

  const rotuloSem = PO_STATE.semestre === 2 ? "2º Semestre" : "1º Semestre";
  ov.innerHTML = `
    <div class="po-detalhe-painel">
      <div class="po-detalhe-head">
        <div>
          <div style="font-size:15px;font-weight:800;color:#0a3d62">${nome}</div>
          <div style="font-size:11px;color:#9aabb7">#${codigo} · ${rotuloSem}/${PO_STATE.ano}</div>
          <div style="font-size:12px;font-weight:700;color:#9a7b1c;margin-top:6px">Total: ${poFmt(tot)} / ${poFmt(max)} pts</div>
        </div>
        <button type="button" class="po-detalhe-fechar" onclick="poFecharDetalhe()">✕</button>
      </div>
      <div class="po-detalhe-body">${blocos || `<div style="color:#9aabb7;padding:20px;text-align:center">Sem dados.</div>`}</div>
    </div>`;
};

// Detalhe anual da loja (reusa overlay, soma o ano todo)
window.poAbrirDetalheAnual = async function (codigo) {
  let ov = document.getElementById("po-detalhe-overlay");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "po-detalhe-overlay";
    ov.className = "po-detalhe-overlay";
    ov.addEventListener("click", e => { if (e.target === ov) poFecharDetalhe(); });
    document.body.appendChild(ov);
  }
  ov.innerHTML = `<div class="po-detalhe-painel"><div class="po-loading-box"><div class="po-spin"></div> Carregando…</div></div>`;
  ov.classList.add("aberto");

  const res = await poCarregarDetalheLojaAnual(codigo, PO_STATE.ano);
  const nome = res?.nome || codigo;

  const NOMES_AREA = {
    vendas:"Vendas", quebras:"Quebras", frente_caixa:"Frente de Caixa", passai:"Passaí",
    servicos_assai:"Serviços Assaí", rh:"RH", prevencao:"Prevenção", ti_rub_rm:"TI / RUB / RM", adm:"ADM",
  };

  let totGeral = 0, maxGeral = 0;
  const blocos = (res?.areas || []).sort((a,b)=>b.obtido-a.obtido).map(d => {
    const obt = Number(d.obtido) || 0, mx = Number(d.maximo) || 0;
    totGeral += obt; maxGeral += mx;
    const pct = mx > 0 ? Math.round((obt/mx)*100) : 0;
    return `<div class="po-detalhe-area">
      <div class="po-detalhe-area-top">
        <span>${NOMES_AREA[d.area_slug] || d.area_slug}</span>
        <span>${poFmt(obt)} / ${poFmt(mx)} pts · ${pct}%</span>
      </div>
    </div>`;
  }).join("");

  ov.innerHTML = `
    <div class="po-detalhe-painel">
      <div class="po-detalhe-head">
        <div>
          <div style="font-size:15px;font-weight:800;color:#0a3d62">${nome}</div>
          <div style="font-size:11px;color:#9aabb7">#${codigo} · Ano ${PO_STATE.ano}</div>
          <div style="font-size:12px;font-weight:700;color:#9a7b1c;margin-top:6px">Total anual: ${poFmt(totGeral)} / ${poFmt(maxGeral)} pts</div>
        </div>
        <button type="button" class="po-detalhe-fechar" onclick="poFecharDetalhe()">✕</button>
      </div>
      <div class="po-detalhe-body">
        ${blocos || `<div style="color:#9aabb7;padding:20px;text-align:center">Sem dados no ano.</div>`}
      </div>
    </div>`;
};

// ============================================================
// 📈 (legado) gráfico de evolução — mantido caso seja reutilizado
// ============================================================
let poChartEvolucao = null;
let poDashCharts = [];
window.poDestruirChartsPub = function () {
  try { if (poChartEvolucao) { poChartEvolucao.destroy(); poChartEvolucao = null; } } catch (_) {}
  try { poDashCharts.forEach(c => { try { c.destroy(); } catch (_) {} }); poDashCharts = []; } catch (_) {}
};
const poDestruirChartsPub = window.poDestruirChartsPub;

// ============================================================
// 📊 ABA DASHBOARD — gráficos comparativos
// ============================================================
async function poRenderDashboard(container) {
  poMostrarLoading(container);

  const anoVigente = PO_STATE.ano;          // respeita o ano selecionado no topo
  const anoAnterior = anoVigente - 1;
  const mesSel = PO_STATE.dashMes || (new Date().getMonth() + 1);

  // carrega tudo em paralelo
  const [lojasMes, lojasAnoVig, lojasAnoAnt] = await Promise.all([
    poCarregarLojasNoMes(anoVigente, mesSel),
    poCarregarLojasNoAno(anoVigente),
    poCarregarLojasNoAno(anoAnterior),
  ]);

  // seletor de mês (1..12) para o gráfico de barras horizontais
  const optMes = PO_MESES.map((m, i) =>
    `<option value="${i+1}" ${i+1 === mesSel ? "selected" : ""}>${m}</option>`).join("");

  // ---------- GRÁFICO 1: barras horizontais por loja (mês vigente) ----------
  let barrasHtml = "";
  if (!lojasMes.length) {
    barrasHtml = `<div class="po-empty" style="padding:20px"><p>Sem lançamentos em ${poNomeMes(mesSel)}/${anoVigente}.</p></div>`;
  } else {
    const maxObt = Math.max(...lojasMes.map(l => l.obtido), 1);
    barrasHtml = lojasMes.map((l, i) => {
      const pct = l.maximo > 0 ? Math.round((l.obtido / l.maximo) * 100) : 0;
      const larg = Math.round((l.obtido / maxObt) * 100);
      const cor = i === 0 ? "#c9a227" : i === 1 ? "#b8902a" : i === 2 ? "#a8842e" : "#5a94e0";
      return `
        <div class="po-dash-row" onclick="poAbrirDetalheLojaMes('${l.codigo}', ${mesSel})">
          <div class="po-dash-loja">${l.nome}</div>
          <div class="po-dash-barra-wrap">
            <div class="po-dash-barra" style="width:${larg}%;background:${cor}"></div>
          </div>
          <div class="po-dash-val">${poFmt(l.obtido)} <span class="po-dash-pct">(${pct}%)</span></div>
        </div>`;
    }).join("");
  }

  // ---------- GRÁFICOS 2 e 3: comparativo por loja (2025 vs 2026) ----------
  // monta lista unificada de lojas (presentes em qualquer dos dois anos)
  const codigos = new Set([...Object.keys(lojasAnoVig), ...Object.keys(lojasAnoAnt)]);
  const comparativo = [...codigos].map(cod => {
    const v = lojasAnoVig[cod]?.obtido || 0;
    const a = lojasAnoAnt[cod]?.obtido || 0;
    const nome = lojasAnoVig[cod]?.nome || lojasAnoAnt[cod]?.nome || cod;
    return { codigo: cod, nome, atual: v, anterior: a, dif: v - a };
  }).sort((x, y) => y.atual - x.atual);

  // ---------- monta a tela ----------
  container.innerHTML = `
    <div class="po-grid">

      <div class="po-col-12 po-card" id="po-card-dash-mes">
        <div class="po-card-header">
          <span class="po-card-titulo">📊 Ranking de lojas — ${anoVigente}</span>
          <div style="display:flex;align-items:center;gap:10px;">
            <select id="po-dash-sel-mes" onchange="poDashTrocarMes(this.value)"
              style="background:rgba(40,30,8,0.5);border:1px solid rgba(201,162,39,0.35);color:#f0e2b0;border-radius:8px;padding:5px 10px;font-weight:700;">
              ${optMes}
            </select>
            <button type="button" class="po-fs-btn" title="Tela cheia" onclick="poTelaCheia('po-card-dash-mes')"><i class="fas fa-expand"></i></button>
          </div>
        </div>
        <div class="po-card-body">
          <div class="po-dash-barras">${barrasHtml}</div>
        </div>
      </div>

      <div class="po-col-12 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">📈 Evolução por loja — ${anoAnterior} vs ${anoVigente}</span>
          <span class="po-card-badge">total acumulado do ano</span>
        </div>
        <div class="po-card-body" style="padding:0;overflow-x:auto;">
          ${comparativo.length ? `
          <table class="po-ranking-table">
            <thead><tr>
              <th>Loja</th>
              <th class="txt-center">${anoAnterior}</th>
              <th class="txt-center">${anoVigente}</th>
              <th class="txt-center">Diferença</th>
            </tr></thead>
            <tbody>
              ${comparativo.map(c => {
                const sinal = c.dif > 0 ? "▲" : c.dif < 0 ? "▼" : "—";
                const cor = c.dif > 0 ? "#1e7d45" : c.dif < 0 ? "#c0392b" : "#9aabb7";
                return `<tr>
                  <td><div class="po-loja-nome">${c.nome}</div><div class="po-loja-cod">#${c.codigo}</div></td>
                  <td class="txt-center" style="color:#9aabb7;font-weight:700">${c.anterior ? poFmt(c.anterior) : "–"}</td>
                  <td class="txt-center" style="color:#9a7b1c;font-weight:800">${c.atual ? poFmt(c.atual) : "–"}</td>
                  <td class="txt-center" style="color:${cor};font-weight:800">${sinal} ${poFmt(Math.abs(c.dif))}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>` : `<div class="po-empty" style="padding:20px"><p>Sem dados para comparar.</p></div>`}
        </div>
      </div>

      <div class="po-col-12 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">📉 Comparativo visual — ${anoAnterior} vs ${anoVigente}</span>
          <span class="po-card-badge">barras por loja</span>
        </div>
        <div class="po-card-body"><canvas id="po-dash-comp-lojas" height="${Math.max(180, comparativo.length * 22)}"></canvas></div>
      </div>

    </div>`;

  // gráfico de barras comparativo (Chart.js) — 2025 vs 2026 por loja
  if (window.Chart && comparativo.length) {
    const ctx = document.getElementById("po-dash-comp-lojas").getContext("2d");
    poDashCharts.push(new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: comparativo.map(c => c.nome),
        datasets: [
          { label: `${anoAnterior}`, data: comparativo.map(c => c.anterior),
            backgroundColor: "rgba(229,115,115,0.55)", borderColor: "#e57373", borderWidth: 1 },
          { label: `${anoVigente}`, data: comparativo.map(c => c.atual),
            backgroundColor: "rgba(201,162,39,0.85)", borderColor: "#c9a227", borderWidth: 1 },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#cbb87e", font: { size: 11 } } } },
        scales: {
          x: { beginAtZero: true, grid: { color: "rgba(201,162,39,0.12)" }, ticks: { color: "#9aabb7" } },
          y: { grid: { display: false }, ticks: { color: "#cbb87e", font: { size: 10 } } },
        },
      },
    }));
  }
}
window.poRenderDashboard = poRenderDashboard;

// ============================================================
// 🚀 ABA SUPERAÇÃO — lojas que mais cresceram (ano vigente vs anterior)
//    Pódio + lista, ordenado pela maior diferença de pontos.
// ============================================================
async function poRenderSuperacao(container) {
  poMostrarLoading(container);

  const anoVigente = PO_STATE.ano;
  const anoAnterior = anoVigente - 1;

  const [lojasVig, lojasAnt] = await Promise.all([
    poCarregarLojasNoAno(anoVigente),
    poCarregarLojasNoAno(anoAnterior),
  ]);

  // une as lojas dos dois anos e calcula a diferença
  const codigos = new Set([...Object.keys(lojasVig), ...Object.keys(lojasAnt)]);
  const lista = [...codigos].map(cod => {
    const atual = lojasVig[cod]?.obtido || 0;
    const anterior = lojasAnt[cod]?.obtido || 0;
    const nome = lojasVig[cod]?.nome || lojasAnt[cod]?.nome || cod;
    const dif = atual - anterior;
    const pctCresc = anterior > 0 ? Math.round((dif / anterior) * 100) : (atual > 0 ? 100 : 0);
    return { codigo: cod, nome, atual, anterior, dif, pctCresc };
  })
  // só faz sentido comparar quem tem dados nos dois anos
  .filter(l => l.anterior > 0 || l.atual > 0)
  .sort((a, b) => b.dif - a.dif); // maior crescimento no topo

  if (!lista.length) {
    container.innerHTML = `<div class="po-empty"><div class="po-empty-ico">🚀</div>
      <p>Sem dados suficientes para comparar ${anoAnterior} e ${anoVigente}.</p></div>`;
    return;
  }

  const maxDif = Math.max(...lista.map(l => Math.abs(l.dif)), 1);
  const p1 = lista[0], p2 = lista[1], p3 = lista[2];

  // pódio (coroas) — top 3 que mais superaram
  const coroaCard = (r, pos) => {
    if (!r) return `<div class="po-podio-item po-podio-vazio"></div>`;
    const classe = pos === 1 ? "p1" : pos === 2 ? "p2" : "p3";
    const corPos = pos === 1 ? "#c9a227" : pos === 2 ? "#8d98a7" : "#b3742e";
    const sinal = r.dif > 0 ? "+" : "";
    const corDif = r.dif > 0 ? "#1e7d45" : r.dif < 0 ? "#c0392b" : "#9aabb7";
    return `
      <div class="po-podio-item ${classe}" onclick="poAbrirDetalheAnual('${r.codigo}')">
        <div class="po-coroa-wrap">
          <svg viewBox="0 0 64 52" class="po-coroa-svg" aria-hidden="true">
            <defs><linearGradient id="gradsup-${classe}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ffe98a"/><stop offset="0.5" stop-color="${corPos}"/><stop offset="1" stop-color="#7a5e12"/>
            </linearGradient></defs>
            <path d="M6 16 L16 34 L24 14 L32 32 L40 14 L48 34 L58 16 L54 44 L10 44 Z" fill="url(#gradsup-${classe})" stroke="#6e560f" stroke-width="1.2" stroke-linejoin="round"/>
            <circle cx="6" cy="16" r="4" fill="url(#gradsup-${classe})" stroke="#6e560f" stroke-width="1"/>
            <circle cx="32" cy="10" r="4.5" fill="url(#gradsup-${classe})" stroke="#6e560f" stroke-width="1"/>
            <circle cx="58" cy="16" r="4" fill="url(#gradsup-${classe})" stroke="#6e560f" stroke-width="1"/>
            <rect x="10" y="44" width="44" height="5" rx="2" fill="url(#gradsup-${classe})" stroke="#6e560f" stroke-width="1"/>
          </svg>
          <span class="po-podio-num">${pos}º</span>
        </div>
        <div class="po-podio-loja">${r.nome}</div>
        <div class="po-podio-cod">#${r.codigo}</div>
        <div class="po-podio-pts" style="color:${corDif}">${sinal}${poFmt(r.dif)} pts</div>
        <div class="po-podio-pct" style="color:${corDif}">${sinal}${r.pctCresc}%</div>
      </div>`;
  };

  const linhas = lista.map((r, i) => {
    const pos = i + 1;
    const cls = pos === 1 ? "ouro" : pos === 2 ? "prata" : pos === 3 ? "bronze" : "";
    const sinal = r.dif > 0 ? "+" : "";
    const corDif = r.dif > 0 ? "#1e7d45" : r.dif < 0 ? "#c0392b" : "#9aabb7";
    const seta = r.dif > 0 ? "▲" : r.dif < 0 ? "▼" : "—";
    // barra: verde p/ crescimento, vermelho suave p/ queda
    const larg = Math.round((Math.abs(r.dif) / maxDif) * 100);
    const corBarra = r.dif >= 0 ? "linear-gradient(90deg,#5cd49a,#1e7d45)" : "linear-gradient(90deg,#f3a9a9,#c0392b)";
    return `
      <tr onclick="poAbrirDetalheAnual('${r.codigo}')">
        <td class="txt-center"><span class="po-pos ${cls}">${pos}</span></td>
        <td>
          <div class="po-loja-nome">${r.nome}</div>
          <div class="po-loja-cod">#${r.codigo}</div>
        </td>
        <td class="txt-center" style="color:#9aabb7;font-weight:700">${r.anterior ? poFmt(r.anterior) : "–"}</td>
        <td class="txt-center" style="color:#9a7b1c;font-weight:800">${r.atual ? poFmt(r.atual) : "–"}</td>
        <td class="txt-center" style="color:${corDif};font-weight:800">${seta} ${sinal}${poFmt(r.dif)}</td>
        <td><div class="po-barra-bg"><div class="po-barra-fill" style="width:${larg}%;background:${corBarra}"></div></div></td>
      </tr>`;
  }).join("");

  container.innerHTML = `
    <div class="po-grid" id="po-card-superacao">
      <div class="po-col-12 po-card po-card-podio">
        <div class="po-card-header">
          <span class="po-card-titulo">🚀 Ranking de Superação — ${anoAnterior} → ${anoVigente}</span>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="po-card-badge">quem mais cresceu</span>
            <button type="button" class="po-fs-btn" title="Tela cheia" onclick="poTelaCheia('po-card-superacao')"><i class="fas fa-expand"></i></button>
          </div>
        </div>
        <div class="po-card-body">
          <div class="po-podio">${coroaCard(p2, 2)}${coroaCard(p1, 1)}${coroaCard(p3, 3)}</div>
        </div>
      </div>

      <div class="po-col-12 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">Evolução completa</span>
          <span class="po-card-badge">${anoAnterior} vs ${anoVigente} · acumulado</span>
        </div>
        <div class="po-card-body" style="padding:0;overflow-x:auto;">
          <table class="po-ranking-table">
            <thead><tr>
              <th class="txt-center" style="width:50px">#</th>
              <th>Loja</th>
              <th class="txt-center">${anoAnterior}</th>
              <th class="txt-center">${anoVigente}</th>
              <th class="txt-center">Evolução</th>
              <th>Crescimento</th>
            </tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}
window.poRenderSuperacao = poRenderSuperacao;

// troca o mês do gráfico de barras do dashboard
window.poDashTrocarMes = function (mes) {
  PO_STATE.dashMes = Number(mes);
  const conteudo = document.getElementById("po-conteudo");
  if (conteudo) { window.poDestruirChartsPub(); poRenderDashboard(conteudo); }
};

// detalhe da loja num mês (reusa o overlay existente)
window.poAbrirDetalheLojaMes = function (codigo, mes) {
  const mesAnterior = PO_STATE.mes;
  PO_STATE.mes = mes;
  if (typeof window.poAbrirDetalhe === "function") window.poAbrirDetalhe(codigo);
  PO_STATE.mes = mesAnterior;
};

// ============================================================
// 🔍 DETALHE DA LOJA (modal lateral)
// ============================================================
window.poAbrirDetalhe = async function (codigo) {
  let ov = document.getElementById("po-detalhe-overlay");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "po-detalhe-overlay";
    ov.className = "po-detalhe-overlay";
    ov.addEventListener("click", e => { if (e.target === ov) poFecharDetalhe(); });
    document.body.appendChild(ov);
  }
  ov.innerHTML = `<div class="po-detalhe-painel"><div class="po-loading-box"><div class="po-spin"></div> Carregando…</div></div>`;
  ov.classList.add("aberto");

  const dados = await poCarregarDetalheLoja(codigo, PO_STATE.ano, PO_STATE.mes);
  const nome = dados?.[0]?.painel_ouro_lojas?.nome || codigo;

  const NOMES_AREA = {
    vendas:"Vendas", quebras:"Quebras", frente_caixa:"Frente de Caixa", passai:"Passaí",
    servicos_assai:"Serviços Assaí", rh:"RH", prevencao:"Prevenção", ti_rub_rm:"TI / RUB / RM", adm:"ADM",
  };

  let totGeral = 0, maxGeral = 0;
  const blocos = (dados || []).map(d => {
    const obt = Number(d.pontuacao_obtida) || 0, mx = Number(d.pontuacao_maxima) || 0;
    totGeral += obt; maxGeral += mx;
    const linhas = (d.sub_resultados || []).map(s => `
      <tr>
        <td style="color:#5d6b78">${s.indicador}</td>
        <td style="text-align:right">${s.resultado == null ? "–" : s.resultado}</td>
        <td style="text-align:right;font-weight:700;color:${Number(s.pontos) > 0 ? "#1e7d45" : "#c0392b"}">${poFmt(s.pontos)} / ${poFmt(s.Ponto != null ? s.Ponto : s.peso)}</td>
      </tr>`).join("");
    return `<div class="po-detalhe-area">
      <div class="po-detalhe-area-top"><span>${NOMES_AREA[d.area_slug] || d.area_slug}</span><span>${poFmt(obt)} / ${poFmt(mx)} pts</span></div>
      <table>${linhas || `<tr><td colspan="3" style="color:#9aabb7">Sem indicadores</td></tr>`}</table>
    </div>`;
  }).join("");

  ov.innerHTML = `
    <div class="po-detalhe-painel">
      <div class="po-detalhe-head">
        <div>
          <div style="font-size:15px;font-weight:800;color:#0a3d62">${nome}</div>
          <div style="font-size:11px;color:#9aabb7">#${codigo} · ${poNomeMes(PO_STATE.mes)}/${PO_STATE.ano}</div>
          <div style="font-size:12px;font-weight:700;color:#9a7b1c;margin-top:6px">Total: ${poFmt(totGeral)} / ${poFmt(maxGeral)} pts</div>
        </div>
        <button type="button" class="po-detalhe-fechar" onclick="poFecharDetalhe()">✕</button>
      </div>
      ${blocos || `<div class="po-empty"><p>Sem lançamentos para esta loja no período.</p></div>`}
    </div>`;
};

window.poFecharDetalhe = function () {
  const ov = document.getElementById("po-detalhe-overlay");
  if (ov) ov.classList.remove("aberto");
};

// ============================================================
// ⛶ TELA CHEIA — aplicada ao card do ranking (mensal ou anual)
// ============================================================
window.poTelaCheia = async function (idCard) {
  const alvo = document.getElementById(idCard);
  if (!alvo) return;
  try {
    if (typeof window.pausarTimerInatividade === "function") window.pausarTimerInatividade();
    // injeta botão de sair (uma vez)
    if (!alvo.querySelector(".po-fs-sair")) {
      const btnSair = document.createElement("button");
      btnSair.type = "button";
      btnSair.className = "po-fs-sair";
      btnSair.title = "Sair da tela cheia (ESC)";
      btnSair.innerHTML = '<i class="fas fa-compress"></i>';
      btnSair.onclick = () => window.poSairTelaCheia();
      alvo.appendChild(btnSair);
    }
    alvo.classList.add("po-fs");
    if (alvo.requestFullscreen) await alvo.requestFullscreen();
    else if (alvo.webkitRequestFullscreen) await alvo.webkitRequestFullscreen();
    else if (alvo.msRequestFullscreen) await alvo.msRequestFullscreen();
  } catch (e) {
    alvo.classList.remove("po-fs");
    poErr("Erro ao entrar em tela cheia", e);
  }
};

window.poSairTelaCheia = async function () {
  try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (_) {}
};

// Mantém o estado do botão e remove a classe ao sair da tela cheia (ESC inclusive)
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    document.querySelectorAll(".po-fs").forEach(el => el.classList.remove("po-fs"));
    if (typeof window.retomarTimerInatividade === "function") window.retomarTimerInatividade();
  }
});
