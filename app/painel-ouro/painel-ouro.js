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
  abaAtiva: "ranking",
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
}
/* dentro da tela cheia, cards ganham respiro e o conteúdo centraliza */
.po-fs:fullscreen .po-card,
.po-fs:-webkit-full-screen .po-card { max-width: 1100px; margin: 0 auto 18px; }
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
  for (let a = 2025; a <= anoAtual + 1; a++)
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
          <select id="po-sel-mes" onchange="poAlterarPeriodo()">${optMes}</select>
        </div>
      </div>

      <div class="po-tabs">
        <button type="button" class="po-tab ${PO_STATE.abaAtiva === "ranking" ? "ativa" : ""}" data-aba="ranking" onclick="poTrocarAba('ranking')">Ranking mensal</button>
        <button type="button" class="po-tab ${PO_STATE.abaAtiva === "evolucao" ? "ativa" : ""}" data-aba="evolucao" onclick="poTrocarAba('evolucao')">Ranking Anual</button>
        <button type="button" class="po-tab ${PO_STATE.abaAtiva === "areas" ? "ativa" : ""}" data-aba="areas" onclick="poTrocarAba('areas')">Resultados por área</button>
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

  if (aba === "ranking")  return window.poRenderRanking(conteudo, PO_STATE.ano, PO_STATE.mes);
  if (aba === "evolucao") return window.poRenderRankingAnual(conteudo, PO_STATE.ano);
  if (aba === "areas") {
    if (typeof window.poRenderAreas === "function")
      return window.poRenderAreas(conteudo, PO_STATE.ano, PO_STATE.mes, PO_STATE.areaAtiva);
    conteudo.innerHTML = `<div class="po-empty"><div class="po-empty-ico">📊</div><p>Módulo de áreas não carregado.</p></div>`;
  }
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
window.poDestruirChartsPub = function () {
  try { if (poChartEvolucao) { poChartEvolucao.destroy(); poChartEvolucao = null; } } catch (_) {}
};
const poDestruirChartsPub = window.poDestruirChartsPub;

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
