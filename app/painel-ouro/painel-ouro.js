// ============================================================
// 👑 PAINEL DE OURO — app/painel-ouro/painel-ouro.js
// Módulo autônomo. Expõe window.telaPainelOuro()
// chamada por app.js → abrirTelaInterna("painel-ouro")
// ============================================================
console.log("✅ painel-ouro.js carregado");

// ============================================================
// 🧠 ESTADO
// ============================================================
const PO_STATE = {
  ano:           new Date().getFullYear(),
  mes:           new Date().getMonth() + 1, // 1-12
  lojaFoco:      null,   // código da loja no drill-down
  visao:         "ranking", // "ranking" | "evolucao" | "areas" | "detalhe"
  chartEvolucao: null,
  chartAreas:    null,
};

const PO_MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const PO_LOG = "👑 PAINEL OURO";

function poLog(msg, payload)  { payload != null ? console.log(`${PO_LOG} | ${msg}`, payload)  : console.log(`${PO_LOG} | ${msg}`); }
function poWarn(msg, payload) { payload != null ? console.warn(`${PO_LOG} | ${msg}`, payload) : console.warn(`${PO_LOG} | ${msg}`); }
function poErr(msg, payload)  { payload != null ? console.error(`${PO_LOG} | ${msg}`, payload): console.error(`${PO_LOG} | ${msg}`); }

// ============================================================
// 🎨 ESTILOS — injetados uma única vez
// ============================================================
function poGarantirEstilos() {
  if (document.getElementById("po-styles")) return;

  const style = document.createElement("style");
  style.id = "po-styles";
  style.textContent = `

/* ---- RESET / CONTAINER ---- */
.po-wrap {
  width: 100%;
  padding: 0 0 40px;
  font-family: "Poppins", sans-serif;
  color: #23313f;
}

/* ---- CABEÇALHO ---- */
.po-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 0;
  flex-wrap: wrap;
}
.po-header-left h2 {
  font-size: 20px;
  font-weight: 700;
  color: #0a3d62;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.po-header-left h2 .po-crown {
  font-size: 18px;
}
.po-header-left p {
  font-size: 12px;
  color: #7a8c9a;
  margin: 2px 0 0;
  font-weight: 400;
}
.po-badge-periodo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #c9a227 0%, #e8c84a 50%, #b8911f 100%);
  color: #3d2b00;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.4px;
  box-shadow: 0 2px 8px rgba(184,145,31,0.30);
}

/* ---- FILTROS ---- */
.po-filtros {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 28px 0;
  flex-wrap: wrap;
}
.po-filtros select {
  height: 36px;
  padding: 0 12px;
  border: 1px solid #d4dce5;
  border-radius: 8px;
  background: #fff;
  color: #23313f;
  font-size: 12px;
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: border 0.15s;
}
.po-filtros select:focus { border-color: #c9a227; }

/* ---- ABAS ---- */
.po-abas {
  display: flex;
  gap: 4px;
  padding: 16px 28px 0;
  border-bottom: 1px solid #e8edf2;
  margin: 0 0 20px;
}
.po-aba {
  height: 36px;
  padding: 0 18px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #7a8c9a;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  margin-bottom: -1px;
}
.po-aba:hover { color: #0a3d62; }
.po-aba.ativa {
  color: #b8911f;
  border-bottom-color: #c9a227;
}

/* ---- GRID PRINCIPAL ---- */
.po-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
  padding: 0 28px;
}
.po-col-12 { grid-column: span 12; }
.po-col-8  { grid-column: span 8;  }
.po-col-7  { grid-column: span 7;  }
.po-col-5  { grid-column: span 5;  }
.po-col-4  { grid-column: span 4;  }
.po-col-3  { grid-column: span 3;  }
.po-col-6  { grid-column: span 6;  }

/* ---- CARD BASE ---- */
.po-card {
  background: rgba(255,255,255,0.97);
  border: 1px solid #e8edf2;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(15,23,42,0.07);
  overflow: hidden;
}
.po-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 10px;
  border-bottom: 1px solid #f0f3f6;
}
.po-card-titulo {
  font-size: 12px;
  font-weight: 700;
  color: #0a3d62;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.po-card-badge {
  font-size: 10px;
  font-weight: 600;
  color: #7a8c9a;
  background: #f0f4f8;
  padding: 2px 8px;
  border-radius: 10px;
}
.po-card-body {
  padding: 16px 18px;
}

/* ---- PÓDIO TOP 3 ---- */
.po-podio {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  padding: 10px 18px 20px;
}
.po-podio-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 180px;
  cursor: pointer;
  transition: transform 0.15s;
}
.po-podio-item:hover { transform: translateY(-2px); }
.po-podio-degrau {
  width: 100%;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  padding: 16px 8px;
}
.po-podio-item:nth-child(1) .po-podio-degrau {
  height: 110px;
  background: linear-gradient(160deg, #e8c84a 0%, #c9a227 60%, #a07a15 100%);
  box-shadow: 0 6px 20px rgba(184,145,31,0.35);
}
.po-podio-item:nth-child(2) .po-podio-degrau {
  height: 80px;
  background: linear-gradient(160deg, #e0e6ed 0%, #c8d3dc 60%, #adb8c2 100%);
  box-shadow: 0 4px 14px rgba(100,120,140,0.2);
}
.po-podio-item:nth-child(3) .po-podio-degrau {
  height: 60px;
  background: linear-gradient(160deg, #e8c49a 0%, #c9924a 60%, #a06a28 100%);
  box-shadow: 0 4px 14px rgba(140,90,30,0.2);
}
.po-podio-pos {
  font-size: 22px;
  font-weight: 800;
  color: rgba(0,0,0,0.25);
}
.po-podio-pts {
  font-size: 16px;
  font-weight: 800;
  color: rgba(0,0,0,0.55);
}
.po-podio-nome {
  font-size: 11px;
  font-weight: 700;
  color: #0a3d62;
  text-align: center;
  line-height: 1.3;
}
.po-podio-sub {
  font-size: 10px;
  color: #7a8c9a;
  font-weight: 500;
}

/* ---- RANKING TABELA ---- */
.po-ranking-table {
  width: 100%;
  border-collapse: collapse;
}
.po-ranking-table th {
  font-size: 10px;
  font-weight: 700;
  color: #7a8c9a;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 6px 10px;
  text-align: left;
  border-bottom: 1px solid #e8edf2;
}
.po-ranking-table th.txt-right,
.po-ranking-table td.txt-right { text-align: right; }
.po-ranking-table th.txt-center,
.po-ranking-table td.txt-center { text-align: center; }
.po-ranking-table td {
  font-size: 12px;
  color: #23313f;
  padding: 8px 10px;
  border-bottom: 1px solid #f0f3f6;
  vertical-align: middle;
}
.po-ranking-table tr:last-child td { border-bottom: none; }
.po-ranking-table tr:hover td { background: rgba(30,96,145,0.04); }
.po-ranking-table tr { cursor: pointer; transition: background 0.1s; }

.po-pos-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 800;
}
.po-pos-1 { background: linear-gradient(135deg,#e8c84a,#c9a227); color: #3d2b00; }
.po-pos-2 { background: linear-gradient(135deg,#e0e6ed,#c8d3dc); color: #3d4a55; }
.po-pos-3 { background: linear-gradient(135deg,#e8c49a,#c9924a); color: #3d2200; }
.po-pos-n { background: #f0f4f8; color: #5d6b78; }

.po-loja-nome { font-weight: 600; font-size: 12px; color: #0a3d62; }
.po-loja-cod  { font-size: 10px; color: #9aabb7; font-weight: 500; }

.po-pts-total {
  font-size: 14px;
  font-weight: 800;
  color: #0a3d62;
}
.po-pts-max {
  font-size: 10px;
  color: #9aabb7;
  font-weight: 500;
}

/* Barra de progresso inline */
.po-barra-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}
.po-barra-bg {
  flex: 1;
  height: 5px;
  background: #eef1f5;
  border-radius: 10px;
  overflow: hidden;
}
.po-barra-fill {
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, #c9a227, #e8c84a);
  transition: width 0.4s ease;
}
.po-barra-pct {
  font-size: 10px;
  font-weight: 700;
  color: #7a8c9a;
  min-width: 32px;
  text-align: right;
}

/* Chips de área (mini pontos) */
.po-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.po-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  white-space: nowrap;
}
.po-chip-ok  { background: #eafaf3; color: #0e7a4d; }
.po-chip-no  { background: #fdf2f2; color: #c0392b; }
.po-chip-na  { background: #f4f6f8; color: #9aabb7; }

/* ---- KPI CARDS ---- */
.po-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0 28px;
  margin-bottom: 16px;
}
.po-kpi {
  background: rgba(255,255,255,0.97);
  border: 1px solid #e8edf2;
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 2px 10px rgba(15,23,42,0.05);
}
.po-kpi-label {
  font-size: 10px;
  font-weight: 700;
  color: #7a8c9a;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 6px;
}
.po-kpi-valor {
  font-size: 22px;
  font-weight: 800;
  color: #0a3d62;
  line-height: 1;
}
.po-kpi-sub {
  font-size: 10px;
  color: #9aabb7;
  margin-top: 4px;
  font-weight: 500;
}
.po-kpi-ouro .po-kpi-valor {
  background: linear-gradient(135deg, #b8911f, #e8c84a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ---- GRÁFICO ÁREA ---- */
.po-chart-wrap {
  position: relative;
  width: 100%;
  height: 300px;
}
.po-chart-wrap canvas { width: 100% !important; height: 100% !important; }

/* ---- DETALHE LOJA ---- */
.po-detalhe-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px 12px;
  cursor: pointer;
}
.po-detalhe-voltar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #7a8c9a;
  background: #f0f4f8;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Poppins", sans-serif;
  transition: background 0.15s;
}
.po-detalhe-voltar:hover { background: #e0e8f0; }
.po-detalhe-loja-nome {
  font-size: 16px;
  font-weight: 700;
  color: #0a3d62;
}
.po-detalhe-loja-pts {
  font-size: 13px;
  color: #7a8c9a;
  font-weight: 500;
}

/* Grade de áreas no detalhe */
.po-areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  padding: 0 28px 28px;
}
.po-area-card {
  background: #fff;
  border: 1px solid #e8edf2;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(15,23,42,0.05);
}
.po-area-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.po-area-nome {
  font-size: 11px;
  font-weight: 700;
  color: #0a3d62;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.po-area-pts-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 9px;
  border-radius: 10px;
}
.po-area-pts-badge.completo  { background: #eafaf3; color: #0e7a4d; }
.po-area-pts-badge.parcial   { background: #fef9e7; color: #a07a15; }
.po-area-pts-badge.zero      { background: #fdf2f2; color: #c0392b; }
.po-area-barra-wrap {
  margin-bottom: 10px;
}
.po-area-barra-bg {
  height: 6px;
  background: #eef1f5;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 4px;
}
.po-area-barra-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}
.po-area-barra-fill.completo { background: linear-gradient(90deg,#0e7a4d,#2ecc71); }
.po-area-barra-fill.parcial  { background: linear-gradient(90deg,#c9a227,#e8c84a); }
.po-area-barra-fill.zero     { background: #e8d5d5; }
.po-area-sub-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.po-area-sub-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  padding: 3px 0;
  border-bottom: 1px solid #f4f6f8;
}
.po-area-sub-item:last-child { border-bottom: none; }
.po-area-sub-nome { color: #5d6b78; font-weight: 500; flex: 1; }
.po-area-sub-res  { color: #23313f; font-weight: 600; margin: 0 8px; }
.po-area-sub-pts  {
  font-weight: 800;
  font-size: 10px;
  width: 28px;
  text-align: right;
}
.po-area-sub-pts.ok  { color: #0e7a4d; }
.po-area-sub-pts.no  { color: #c0392b; }

/* ---- LOADING ---- */
.po-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}
.po-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e8edf2;
  border-top-color: #c9a227;
  border-radius: 50%;
  animation: po-spin 0.7s linear infinite;
}
@keyframes po-spin { to { transform: rotate(360deg); } }
.po-loading p { font-size: 13px; color: #7a8c9a; font-weight: 500; }

/* ---- ERRO / VAZIO ---- */
.po-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 8px;
}
.po-empty-ico { font-size: 36px; opacity: 0.3; }
.po-empty p { font-size: 13px; color: #7a8c9a; font-weight: 500; text-align: center; }

/* ---- RESPONSIVO ---- */
@media (max-width: 900px) {
  .po-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .po-col-8, .po-col-7, .po-col-5, .po-col-4, .po-col-3, .po-col-6 { grid-column: span 12; }
  .po-header { padding: 16px 16px 0; }
  .po-filtros { padding: 12px 16px 0; }
  .po-abas   { padding: 12px 16px 0; }
  .po-grid   { padding: 0 16px; }
  .po-kpi-grid { padding: 0 16px; }
  .po-areas-grid { padding: 0 16px 20px; }
  .po-detalhe-header { padding: 12px 16px; }
}
@media (max-width: 600px) {
  .po-kpi-grid { grid-template-columns: 1fr 1fr; }
  .po-podio { gap: 6px; padding: 8px 12px 16px; }
  .po-chips { display: none; } /* esconde chips em mobile */
}
  `;
  document.head.appendChild(style);
}

// ============================================================
// 🔢 HELPERS
// ============================================================
function poFmt(n, casas = 1) {
  const num = Number(n);
  if (!isFinite(num)) return "–";
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function poNomeMes(mes) { return PO_MESES[(mes - 1)] || ""; }

function poClassePodio(pos) {
  if (pos === 1) return "po-pos-1";
  if (pos === 2) return "po-pos-2";
  if (pos === 3) return "po-pos-3";
  return "po-pos-n";
}

function poDestruirCharts() {
  if (PO_STATE.chartEvolucao) {
    PO_STATE.chartEvolucao.destroy();
    PO_STATE.chartEvolucao = null;
  }
  if (PO_STATE.chartAreas) {
    PO_STATE.chartAreas.destroy();
    PO_STATE.chartAreas = null;
  }
}


// Expõe para o sidebar-painel-ouro.js poder destruir ao sair
window.poDestruirChartsPub = poDestruirCharts;

function poMostrarLoading(container) {
  container.innerHTML = `
    <div class="po-loading">
      <div class="po-spinner"></div>
      <p>Carregando dados do Painel de Ouro…</p>
    </div>`;
}

function poMostrarVazio(container, msg = "Nenhum dado encontrado para este período.") {
  container.innerHTML = `
    <div class="po-empty">
      <div class="po-empty-ico">📊</div>
      <p>${msg}</p>
    </div>`;
}

// ============================================================
// 📡 DADOS — queries Supabase
// ============================================================
async function poCarregarRanking(ano, mes) {
  poLog("Carregando ranking", { ano, mes });
  const { data, error } = await window.db
    .from("painel_ouro_ranking_mensal")
    .select("*")
    .eq("ano", ano)
    .eq("mes", mes)
    .order("total_pontos", { ascending: false });

  if (error) { poErr("Erro ao carregar ranking", error); return []; }
  return data || [];
}

async function poCarregarEvolucao(ano, lojaCodigo = null) {
  poLog("Carregando evolução", { ano, lojaCodigo });
  let query = window.db
    .from("painel_ouro_ranking_mensal")
    .select("loja_codigo, loja_nome, ano, mes, total_pontos, percentual_atingido")
    .eq("ano", ano)
    .order("mes", { ascending: true });

  if (lojaCodigo) query = query.eq("loja_codigo", lojaCodigo);

  const { data, error } = await query;
  if (error) { poErr("Erro ao carregar evolução", error); return []; }
  return data || [];
}

async function poCarregarDetalhe(lojaCodigo, ano, mes) {
  poLog("Carregando detalhe", { lojaCodigo, ano, mes });
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select(`
      area_slug,
      pontuacao_obtida,
      pontuacao_maxima,
      sub_resultados,
      painel_ouro_areas ( nome, ordem )
    `)
    .eq("loja_codigo", lojaCodigo)
    .eq("ano", ano)
    .eq("mes", mes)
    .eq("ativo", true)
    .order("painel_ouro_areas(ordem)", { ascending: true });

  if (error) { poErr("Erro ao carregar detalhe", error); return []; }
  return data || [];
}

async function poCarregarKpis(ano, mes) {
  const ranking = await poCarregarRanking(ano, mes);
  if (!ranking.length) return null;

  const totalLojas = ranking.length;
  const media = ranking.reduce((s, r) => s + Number(r.total_pontos), 0) / totalLojas;
  const lider = ranking[0];
  const lojaMax = ranking.reduce((a, b) =>
    Number(a.total_pontos) > Number(b.total_pontos) ? a : b);

  const lojaMin = ranking.reduce((a, b) =>
    Number(a.total_pontos) < Number(b.total_pontos) ? a : b);

  return { totalLojas, media, lider, lojaMax, lojaMin, ranking };
}

// ============================================================
// 🏆 RENDER — visão RANKING
// ============================================================
async function poRenderRanking(container, ano, mes) {
  poMostrarLoading(container);

  const kpis = await poCarregarKpis(ano, mes);
  if (!kpis || !kpis.ranking.length) {
    poMostrarVazio(container, `Sem dados lançados para ${poNomeMes(mes)}/${ano}.`);
    return;
  }

  const { ranking, media, lider } = kpis;
  const top3 = ranking.slice(0, 3);

  // ---- KPIs summary ----
  const kpiHtml = `
    <div class="po-kpi-grid">
      <div class="po-kpi po-kpi-ouro">
        <div class="po-kpi-label">Líder do mês</div>
        <div class="po-kpi-valor">${poFmt(lider.total_pontos, 1)}<span style="font-size:12px;font-weight:500;color:#9aabb7"> pts</span></div>
        <div class="po-kpi-sub">${lider.loja_nome}</div>
      </div>
      <div class="po-kpi">
        <div class="po-kpi-label">Média regional</div>
        <div class="po-kpi-valor">${poFmt(media, 1)}<span style="font-size:12px;font-weight:500;color:#9aabb7"> pts</span></div>
        <div class="po-kpi-sub">${ranking.length} lojas avaliadas</div>
      </div>
      <div class="po-kpi">
        <div class="po-kpi-label">Acima da média</div>
        <div class="po-kpi-valor">${ranking.filter(r => Number(r.total_pontos) >= media).length}</div>
        <div class="po-kpi-sub">de ${ranking.length} lojas</div>
      </div>
      <div class="po-kpi">
        <div class="po-kpi-label">Pontos máximos</div>
        <div class="po-kpi-valor">100</div>
        <div class="po-kpi-sub">Vendas · Quebra · 7 áreas</div>
      </div>
    </div>`;

  // ---- Pódio ----
  const podioHtml = `
    <div class="po-podio">
      ${top3.map((l, i) => {
        const pos = i + 1;
        const emoji = pos === 1 ? "🥇" : pos === 2 ? "🥈" : "🥉";
        return `
          <div class="po-podio-item" onclick="poAbrirDetalhe('${l.loja_codigo}')">
            <div class="po-podio-nome">${l.loja_nome}</div>
            <div class="po-podio-sub">#${l.loja_codigo}</div>
            <div class="po-podio-degrau">
              <div class="po-podio-pos">${emoji}</div>
              <div class="po-podio-pts">${poFmt(l.total_pontos, 1)}</div>
            </div>
          </div>`;
      }).join("")}
    </div>`;

  // ---- Tabela completa ----
  const linhasHtml = ranking.map((l, i) => {
    const pos = i + 1;
    const pct = Number(l.percentual_atingido) || 0;
    const badgeCls = poClassePodio(pos);
    const largura = Math.min(100, pct);

    return `
      <tr onclick="poAbrirDetalhe('${l.loja_codigo}')">
        <td class="txt-center"><span class="po-pos-badge ${badgeCls}">${pos}</span></td>
        <td>
          <div class="po-loja-nome">${l.loja_nome}</div>
          <div class="po-loja-cod">#${l.loja_codigo}</div>
        </td>
        <td class="txt-right">
          <span class="po-pts-total">${poFmt(l.total_pontos, 1)}</span>
          <span class="po-pts-max"> / 100</span>
        </td>
        <td>
          <div class="po-barra-wrap">
            <div class="po-barra-bg">
              <div class="po-barra-fill" style="width:${largura}%"></div>
            </div>
            <span class="po-barra-pct">${pct}%</span>
          </div>
        </td>
        <td class="txt-center">
          <span style="font-size:10px;color:#9aabb7">${l.areas_lancadas}/9</span>
        </td>
      </tr>`;
  }).join("");

  container.innerHTML = `
    ${kpiHtml}
    <div class="po-grid">
      <div class="po-col-4 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">Pódio</span>
          <span class="po-card-badge">${poNomeMes(mes)} ${ano}</span>
        </div>
        ${podioHtml}
      </div>
      <div class="po-col-8 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">Ranking completo</span>
          <span class="po-card-badge">${ranking.length} lojas</span>
        </div>
        <div class="po-card-body" style="padding:0;max-height:420px;overflow-y:auto;">
          <table class="po-ranking-table">
            <thead>
              <tr>
                <th class="txt-center" style="width:40px">#</th>
                <th>Loja</th>
                <th class="txt-right">Pontos</th>
                <th style="min-width:140px">Atingimento</th>
                <th class="txt-center">Áreas</th>
              </tr>
            </thead>
            <tbody>${linhasHtml}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ============================================================
// 📈 RENDER — visão EVOLUÇÃO
// ============================================================
async function poRenderEvolucao(container, ano) {
  poMostrarLoading(container);
  poDestruirCharts();

  const dados = await poCarregarEvolucao(ano);
  if (!dados.length) {
    poMostrarVazio(container, `Sem dados de evolução para ${ano}.`);
    return;
  }

  // Agrupa por loja → array de pontos por mês
  const lojas = {};
  dados.forEach(d => {
    if (!lojas[d.loja_codigo]) {
      lojas[d.loja_codigo] = { nome: d.loja_nome, meses: {} };
    }
    lojas[d.loja_codigo].meses[d.mes] = Number(d.total_pontos);
  });

  // Meses presentes
  const mesesPresentes = [...new Set(dados.map(d => d.mes))].sort((a,b)=>a-b);
  const labels = mesesPresentes.map(m => poNomeMes(m).slice(0,3));

  // Top 8 lojas pelo total do período
  const lojasOrdenadas = Object.entries(lojas)
    .map(([cod, info]) => ({
      cod,
      nome: info.nome,
      total: Object.values(info.meses).reduce((s,v) => s+v, 0),
      pontos: mesesPresentes.map(m => info.meses[m] ?? null),
    }))
    .sort((a,b) => b.total - a.total)
    .slice(0, 8);

  const coresOuro = [
    "rgba(184,145,31,1)",
    "rgba(30,96,145,1)",
    "rgba(46,204,113,1)",
    "rgba(192,57,43,1)",
    "rgba(142,68,173,1)",
    "rgba(52,152,219,1)",
    "rgba(230,126,34,1)",
    "rgba(26,188,156,1)",
  ];

  const datasets = lojasOrdenadas.map((l, i) => ({
    label: l.nome,
    data: l.pontos,
    borderColor: coresOuro[i % coresOuro.length],
    backgroundColor: coresOuro[i % coresOuro.length].replace("1)", "0.08)"),
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    tension: 0.35,
    spanGaps: true,
  }));

  container.innerHTML = `
    <div class="po-grid" style="margin-bottom:16px;">
      <div class="po-col-12 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">Evolução por loja — ${ano}</span>
          <span class="po-card-badge">Top 8 lojas · pontuação mensal</span>
        </div>
        <div class="po-card-body">
          <div class="po-chart-wrap" style="height:360px;">
            <canvas id="poChartEvolucao"></canvas>
          </div>
        </div>
      </div>
    </div>
    <div class="po-grid">
      <div class="po-col-12 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">Acumulado no período</span>
          <span class="po-card-badge">${mesesPresentes.length} meses</span>
        </div>
        <div class="po-card-body" style="padding:0;max-height:320px;overflow-y:auto;">
          <table class="po-ranking-table">
            <thead>
              <tr>
                <th class="txt-center">#</th>
                <th>Loja</th>
                ${mesesPresentes.map(m => `<th class="txt-center">${poNomeMes(m).slice(0,3)}</th>`).join("")}
                <th class="txt-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lojasOrdenadas.map((l, i) => `
                <tr onclick="poAbrirDetalhe('${l.cod}')">
                  <td class="txt-center"><span class="po-pos-badge ${poClassePodio(i+1)}">${i+1}</span></td>
                  <td><div class="po-loja-nome">${l.nome}</div></td>
                  ${mesesPresentes.map(m => {
                    const pts = lojas[l.cod]?.meses[m];
                    return `<td class="txt-center" style="font-size:11px;font-weight:600;color:${pts != null ? '#0a3d62' : '#ccc'}">${pts != null ? poFmt(pts,1) : '–'}</td>`;
                  }).join("")}
                  <td class="txt-right"><span class="po-pts-total">${poFmt(l.total,1)}</span></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

  // Renderiza o gráfico depois do DOM estar pronto
  requestAnimationFrame(() => {
    const canvas = document.getElementById("poChartEvolucao");
    if (!canvas || !window.Chart) return;

    PO_STATE.chartEvolucao = new window.Chart(canvas, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { family: "Poppins", size: 10, weight: "600" },
              color: "#5d6b78",
              boxWidth: 12,
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: "rgba(10,61,98,0.92)",
            titleFont: { family: "Poppins", size: 11, weight: "700" },
            bodyFont:  { family: "Poppins", size: 11 },
            padding: 10,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y != null ? poFmt(ctx.parsed.y,1) + " pts" : "–"}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: { font: { family: "Poppins", size: 11 }, color: "#7a8c9a" },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: {
              font: { family: "Poppins", size: 11 },
              color: "#7a8c9a",
              callback: v => v + " pts",
            },
          },
        },
      },
    });
  });
}

// ============================================================
// 🏪 RENDER — DETALHE de uma loja
// ============================================================
async function poRenderDetalhe(container, lojaCodigo, ano, mes) {
  poMostrarLoading(container);
  poDestruirCharts();

  const [resultados, evolucao] = await Promise.all([
    poCarregarDetalhe(lojaCodigo, ano, mes),
    poCarregarEvolucao(ano, lojaCodigo),
  ]);

  if (!resultados.length) {
    poMostrarVazio(container, `Sem dados lançados para esta loja em ${poNomeMes(mes)}/${ano}.`);
    return;
  }

  const totalPontos = resultados.reduce((s, r) => s + Number(r.pontuacao_obtida), 0);
  const totalMax    = resultados.reduce((s, r) => s + Number(r.pontuacao_maxima),  0);
  const lojaInfo    = resultados[0];
  const lojaNome    = lojaInfo?.painel_ouro_areas ? lojaCodigo : lojaCodigo; // fallback

  // Busca nome da loja no ranking
  const rankingMes = await poCarregarRanking(ano, mes);
  const lojaRank   = rankingMes.find(r => r.loja_codigo === lojaCodigo);
  const lojaPos    = rankingMes.findIndex(r => r.loja_codigo === lojaCodigo) + 1;
  const nomeExibir = lojaRank?.loja_nome || lojaCodigo;

  // Evolução mensal para o gráfico
  const mesesEvo = evolucao.map(e => poNomeMes(e.mes).slice(0,3));
  const ptsMes   = evolucao.map(e => Number(e.total_pontos));

  // Cards de área
  const areasHtml = resultados.map(r => {
    const obtido = Number(r.pontuacao_obtida);
    const maximo = Number(r.pontuacao_maxima);
    const pct    = maximo > 0 ? (obtido / maximo) * 100 : 0;
    const classe = pct >= 100 ? "completo" : pct > 0 ? "parcial" : "zero";
    const nomArea = r.painel_ouro_areas?.nome || r.area_slug;

    const subLista = (r.sub_resultados || []).map(s => `
      <li class="po-area-sub-item">
        <span class="po-area-sub-nome">${s.indicador}</span>
        <span class="po-area-sub-res">${s.resultado}</span>
        <span class="po-area-sub-pts ${s.pontos > 0 ? 'ok' : 'no'}">${poFmt(s.pontos,1)}p</span>
      </li>`).join("");

    return `
      <div class="po-area-card">
        <div class="po-area-card-top">
          <span class="po-area-nome">${nomArea}</span>
          <span class="po-area-pts-badge ${classe}">${poFmt(obtido,1)} / ${poFmt(maximo,0)} pts</span>
        </div>
        <div class="po-area-barra-wrap">
          <div class="po-area-barra-bg">
            <div class="po-area-barra-fill ${classe}" style="width:${Math.min(100,pct)}%"></div>
          </div>
        </div>
        <ul class="po-area-sub-lista">${subLista}</ul>
      </div>`;
  }).join("");

  container.innerHTML = `
    <div class="po-detalhe-header">
      <button class="po-detalhe-voltar" onclick="poVoltarRanking()">← Voltar</button>
      <div>
        <div class="po-detalhe-loja-nome">${nomeExibir} <span style="font-size:12px;color:#9aabb7">#${lojaCodigo}</span></div>
        <div class="po-detalhe-loja-pts">
          <span class="po-pos-badge ${poClassePodio(lojaPos)}" style="margin-right:6px;">${lojaPos}º</span>
          ${poFmt(totalPontos,1)} pts de ${poFmt(totalMax,0)} — ${poNomeMes(mes)} ${ano}
        </div>
      </div>
    </div>

    <div class="po-kpi-grid" style="margin-bottom:16px;">
      <div class="po-kpi po-kpi-ouro">
        <div class="po-kpi-label">Total de pontos</div>
        <div class="po-kpi-valor">${poFmt(totalPontos,1)}</div>
        <div class="po-kpi-sub">de ${poFmt(totalMax,0)} pts possíveis</div>
      </div>
      <div class="po-kpi">
        <div class="po-kpi-label">Atingimento</div>
        <div class="po-kpi-valor">${poFmt(totalMax > 0 ? (totalPontos/totalMax)*100 : 0, 1)}%</div>
        <div class="po-kpi-sub">do painel completo</div>
      </div>
      <div class="po-kpi">
        <div class="po-kpi-label">Posição no ranking</div>
        <div class="po-kpi-valor">${lojaPos}º</div>
        <div class="po-kpi-sub">de ${rankingMes.length} lojas</div>
      </div>
      <div class="po-kpi">
        <div class="po-kpi-label">Áreas com pontos</div>
        <div class="po-kpi-valor">${resultados.filter(r => Number(r.pontuacao_obtida) > 0).length}</div>
        <div class="po-kpi-sub">de ${resultados.length} lançadas</div>
      </div>
    </div>

    ${evolucao.length > 1 ? `
    <div class="po-grid" style="margin-bottom:16px;">
      <div class="po-col-12 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">Evolução em ${ano}</span>
          <span class="po-card-badge">${evolucao.length} meses registrados</span>
        </div>
        <div class="po-card-body">
          <div class="po-chart-wrap" style="height:220px;">
            <canvas id="poChartDetalhe"></canvas>
          </div>
        </div>
      </div>
    </div>` : ""}

    <div class="po-areas-grid">${areasHtml}</div>`;

  // Gráfico de evolução da loja
  if (evolucao.length > 1) {
    requestAnimationFrame(() => {
      const canvas = document.getElementById("poChartDetalhe");
      if (!canvas || !window.Chart) return;

      PO_STATE.chartAreas = new window.Chart(canvas, {
        type: "bar",
        data: {
          labels: mesesEvo,
          datasets: [{
            label: nomeExibir,
            data: ptsMes,
            backgroundColor: ptsMes.map(v =>
              v >= 70 ? "rgba(184,145,31,0.75)" :
              v >= 50 ? "rgba(30,96,145,0.65)" :
                        "rgba(192,57,43,0.55)"
            ),
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(10,61,98,0.92)",
              titleFont: { family: "Poppins", size: 11 },
              bodyFont:  { family: "Poppins", size: 11 },
              callbacks: {
                label: ctx => ` ${poFmt(ctx.parsed.y,1)} pts`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family:"Poppins", size:11 }, color:"#7a8c9a" },
            },
            y: {
              min: 0,
              max: 100,
              grid: { color: "rgba(0,0,0,0.04)" },
              ticks: {
                font: { family:"Poppins", size:11 },
                color: "#7a8c9a",
                callback: v => v + "pts",
              },
            },
          },
        },
      });
    });
  }
}

// ============================================================
// 🔁 NAVEGAÇÃO INTERNA
// ============================================================
function poTrocarAba(aba) {
  PO_STATE.visao = aba;
  PO_STATE.lojaFoco = null;

  // atualiza classes das abas
  document.querySelectorAll(".po-aba").forEach(el => {
    el.classList.toggle("ativa", el.dataset.aba === aba);
  });

  const conteudo = document.getElementById("po-conteudo");
  if (!conteudo) return;

  poDestruirCharts();

  if (aba === "ranking") {
    poRenderRanking(conteudo, PO_STATE.ano, PO_STATE.mes);
  } else if (aba === "evolucao") {
    poRenderEvolucao(conteudo, PO_STATE.ano);
  }
}

window.poAbrirDetalhe = function(lojaCodigo) {
  PO_STATE.lojaFoco = lojaCodigo;
  PO_STATE.visao    = "detalhe";

  document.querySelectorAll(".po-aba").forEach(el => el.classList.remove("ativa"));

  const conteudo = document.getElementById("po-conteudo");
  if (!conteudo) return;

  poDestruirCharts();
  poRenderDetalhe(conteudo, lojaCodigo, PO_STATE.ano, PO_STATE.mes);
};

window.poVoltarRanking = function() {
  PO_STATE.lojaFoco = null;
  const aba = PO_STATE.visao === "detalhe" ? "ranking" : PO_STATE.visao;
  poTrocarAba(aba);
};

window.poAlterarMes = function(mes) {
  PO_STATE.mes = Number(mes);
  poTrocarAba("ranking");
};

window.poAlterarAno = function(ano) {
  PO_STATE.ano = Number(ano);
  poTrocarAba("ranking");
};

// ============================================================
// 🏗️ TELA PRINCIPAL — chamada por app.js
// ============================================================
window.telaPainelOuro = async function() {
  poLog("Iniciando telaPainelOuro");
  poGarantirEstilos();

  const container = document.getElementById("conteudo");
  if (!container) { poErr("#conteudo não encontrado"); return; }

  if (!window.db) { container.innerHTML = `<div class="po-empty"><div class="po-empty-ico">⚠️</div><p>Conexão com banco não iniciada.</p></div>`; return; }

  // Gera options de anos (2025 até atual)
  const anoAtual = new Date().getFullYear();
  const anos = [];
  for (let a = 2025; a <= anoAtual; a++) anos.push(a);

  const optAno  = anos.map(a => `<option value="${a}" ${a === PO_STATE.ano ? "selected" : ""}>${a}</option>`).join("");
  const optMes  = PO_MESES.map((m, i) => {
    const num = i + 1;
    return `<option value="${num}" ${num === PO_STATE.mes ? "selected" : ""}>${m}</option>`;
  }).join("");

  container.innerHTML = `
    <div class="po-wrap">

      <!-- CABEÇALHO -->
      <div class="po-header">
        <div class="po-header-left">
          <h2><span class="po-crown">👑</span> Painel de Ouro</h2>
          <p>Desempenho operacional e estratégico das lojas — Regional NE</p>
        </div>
        <div class="po-badge-periodo">
          ✦ ${poNomeMes(PO_STATE.mes)} ${PO_STATE.ano}
        </div>
      </div>

      <!-- FILTROS -->
      <div class="po-filtros">
        <select onchange="poAlterarAno(this.value)">${optAno}</select>
        <select onchange="poAlterarMes(this.value)">${optMes}</select>
      </div>

      <!-- ABAS -->
      <div class="po-abas">
        <button class="po-aba ativa" data-aba="ranking"  onclick="poTrocarAba('ranking')">Ranking</button>
        <button class="po-aba"       data-aba="evolucao" onclick="poTrocarAba('evolucao')">Evolução anual</button>
      </div>

      <!-- CONTEÚDO DINÂMICO -->
      <div id="po-conteudo"></div>

    </div>`;

  // Expõe troca de aba globalmente (usada pelos botões inline)
  window.poTrocarAba = poTrocarAba;

  // Carrega visão inicial
  const poConteudo = document.getElementById("po-conteudo");
  await poRenderRanking(poConteudo, PO_STATE.ano, PO_STATE.mes);

  poLog("telaPainelOuro montada");
};