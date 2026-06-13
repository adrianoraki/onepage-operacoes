// ============================================================
// 👑 PAINEL DE OURO — lancamento/lancamento-base.js
// Motor compartilhado de lançamento em TELA CHEIA.
// Cada área (vendas.js, quebras.js, ...) chama:
//   poLancAbrirArea({ slug, nome, modo })
// Renderiza dentro de #po-conteudo (não é modal).
//
// Expõe:
//   window.poLancBase = { abrir, calcularPontos, salvar, ... }
//   window.poLancAbrirArea(config)   ← atalho usado pelos módulos
// ============================================================
console.log("✅ lancamento-base.js carregado");

const PO_LB = {
  slug:        null,
  nome:        null,
  ano:         new Date().getFullYear(),
  mes:         new Date().getMonth() + 1,
  indicadores: [],
  lojas:       [],
  valores:     {},   // valores[loja][indicador] = "texto"
  binario:     {},   // binario[loja] = true|false|null
  pesoMaximo:  0,
  salvando:    false,
};

const PO_LB_MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function poLbLog(m, d) { d != null ? console.log(`👑 LANC | ${m}`, d) : console.log(`👑 LANC | ${m}`); }
function poLbErr(m, d) { d != null ? console.error(`👑 LANC | ${m}`, d) : console.error(`👑 LANC | ${m}`); }

// ============================================================
// 🎨 ESTILOS (injetados uma vez)
// ============================================================
(function poLbEstilos() {
  if (document.getElementById("po-lb-styles")) return;
  const s = document.createElement("style");
  s.id = "po-lb-styles";
  s.textContent = `

/* ---- HEADER DA ÁREA ---- */
.po-lb-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 4px 28px 16px; flex-wrap: wrap;
}
.po-lb-head-left { display: flex; align-items: center; gap: 12px; }
.po-lb-voltar {
  display: inline-flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 14px;
  background: #f0f4f8; border: 1px solid #e6ecf2; border-radius: 8px;
  font-family: "Poppins", sans-serif; font-size: 12px; font-weight: 600;
  color: #5d6b78; cursor: pointer; transition: all 0.15s;
}
.po-lb-voltar:hover { background: #e6ecf2; color: #0a3d62; }
.po-lb-titulo { font-family:"Poppins",sans-serif; font-size: 16px; font-weight: 800; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,0.4); }
.po-lb-sub { font-family:"Poppins",sans-serif; font-size: 11px; color: rgba(255,255,255,0.8); margin-top: 1px; text-shadow: 0 1px 4px rgba(0,0,0,0.4); }

.po-lb-controles { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.po-lb-select {
  height: 34px; padding: 0 12px; border: 1px solid #d4dce5; border-radius: 8px;
  background: #fff; color: #23313f; font-family:"Poppins",sans-serif;
  font-size: 12px; font-weight: 600; cursor: pointer; outline: none;
}
.po-lb-select:focus { border-color: #c9a227; }
.po-lb-busca {
  height: 34px; padding: 0 12px; border: 1px solid #d4dce5; border-radius: 8px;
  background: #fff; font-family:"Poppins",sans-serif; font-size: 12px; outline: none; min-width: 160px;
}
.po-lb-busca:focus { border-color: #c9a227; }

/* ---- WRAPPER TABELA ---- */
.po-lb-wrap { padding: 0 28px 28px; }
.po-lb-card {
  background: #fff; border: 1px solid #e8edf2; border-radius: 14px;
  box-shadow: 0 4px 16px rgba(15,23,42,0.07); overflow: hidden;
}
.po-lb-card-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid #f0f3f6;
}
.po-lb-card-titulo {
  font-family:"Poppins",sans-serif; font-size: 12px; font-weight: 700;
  color: #0a3d62; text-transform: uppercase; letter-spacing: 0.5px;
}
.po-lb-card-badge {
  font-family:"Poppins",sans-serif; font-size: 10px; font-weight: 600;
  color: #7a8c9a; background: #f0f4f8; padding: 3px 10px; border-radius: 10px;
}
.po-lb-scroll { overflow: auto; max-height: calc(100vh - 320px); }
.po-lb-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.po-lb-scroll::-webkit-scrollbar-thumb { background: #d4dce5; border-radius: 10px; }

/* ---- TABELA PADRÃO PDF ---- */
.po-lb-tabela { width: 100%; border-collapse: separate; border-spacing: 0; font-family:"Poppins",sans-serif; }
.po-lb-tabela thead th {
  position: sticky; top: 0; z-index: 5; background: #f7f9fb; color: #5d6b78;
  font-size: 10px; font-weight: 700; padding: 8px 6px; text-align: center;
  border-bottom: 1px solid #e8edf2; white-space: nowrap;
}
.po-lb-tabela thead .po-lb-meta {
  display: block; font-size: 8px; font-weight: 500; color: #c9a227;
  text-transform: none; margin-top: 1px;
}
.po-lb-tabela .po-lb-col-loja {
  position: sticky; left: 0; z-index: 4; background: #fbfcfd;
  text-align: left; min-width: 168px; padding-left: 14px;
}
.po-lb-tabela thead .po-lb-col-loja { z-index: 6; background: #f7f9fb; }
.po-lb-tabela tbody td {
  padding: 4px 6px; border-bottom: 1px solid #f0f3f6;
  text-align: center; font-size: 11px; color: #23313f;
}
.po-lb-tabela tbody tr:hover td { background: #fafbf5; }
.po-lb-tabela tbody tr:hover .po-lb-col-loja { background: #f5f7e8; }
.po-lb-loja-nome { font-size: 11px; font-weight: 600; color: #0a3d62; }
.po-lb-loja-cod  { font-size: 9px; color: #9aabb7; font-weight: 500; }

.po-lb-inp {
  width: 74px; height: 28px; padding: 0 6px;
  border: 1px solid #d4dce5; border-radius: 6px; background: #fff; color: #23313f;
  font-family:"Poppins",sans-serif; font-size: 11px; font-weight: 600;
  text-align: center; outline: none; transition: all 0.12s;
}
.po-lb-inp:focus { border-color: #c9a227; background: #fffdf5; }
.po-lb-inp.ok { border-color: #2ecc71; background: #f3fdf8; }
.po-lb-inp.no { border-color: #e74c3c; background: #fef5f4; }

.po-lb-pts {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 24px; border-radius: 6px; font-size: 10px; font-weight: 800;
}
.po-lb-pts.ok    { background: #eafaf3; color: #0e7a4d; }
.po-lb-pts.no    { background: #fdf2f2; color: #c0392b; }
.po-lb-pts.vazio { background: #f4f6f8; color: #9aabb7; }

.po-lb-total {
  position: sticky; right: 0; z-index: 4; background: #fbfcfd;
  font-weight: 800; font-size: 12px; color: #0a3d62; min-width: 76px;
}
.po-lb-tabela thead .po-lb-total-head { position: sticky; right: 0; z-index: 6; background: #f7f9fb; }
.po-lb-tabela td.po-lb-sep, .po-lb-tabela th.po-lb-sep { border-right: 1px solid #eef1f5; }

/* binário sim/não */
.po-lb-bin { display: inline-flex; gap: 4px; }
.po-lb-bin-btn {
  width: 44px; height: 28px; border-radius: 6px; border: 1px solid #d4dce5;
  background: #fff; color: #9aabb7; font-family:"Poppins",sans-serif;
  font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.12s;
}
.po-lb-bin-btn:hover { background: #f4f6f8; }
.po-lb-bin-btn.sim-on { background: #eafaf3; border-color: #2ecc71; color: #0e7a4d; }
.po-lb-bin-btn.nao-on { background: #fdf2f2; border-color: #e74c3c; color: #c0392b; }

/* ---- BARRA INFERIOR (salvar) ---- */
.po-lb-actionbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-top: 1px solid #f0f3f6; background: #fafbfc;
}
.po-lb-actionbar-info { font-family:"Poppins",sans-serif; font-size: 11px; color: #7a8c9a; }
.po-lb-actionbar-info b { color: #b8911f; }
.po-lb-btn {
  height: 40px; padding: 0 22px; border-radius: 10px;
  font-family:"Poppins",sans-serif; font-size: 12px; font-weight: 700;
  cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
  border: none; transition: all 0.15s;
}
.po-lb-btn-salvar {
  background: linear-gradient(135deg,#c9a227,#a07a15); color: #fff;
  box-shadow: 0 4px 14px rgba(201,162,39,0.3);
}
.po-lb-btn-salvar:hover { background: linear-gradient(135deg,#e8c84a,#c9a227); }
.po-lb-btn-salvar:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

.po-lb-loading {
  display: flex; align-items: center; justify-content: center; padding: 60px; gap: 12px;
  color: #7a8c9a; font-family:"Poppins",sans-serif; font-size: 13px;
}
.po-lb-spin {
  width: 22px; height: 22px; border: 2px solid #e8edf2; border-top-color: #c9a227;
  border-radius: 50%; animation: poLbSpin 0.7s linear infinite;
}
@keyframes poLbSpin { to { transform: rotate(360deg); } }

.po-lb-toast {
  position: fixed; bottom: 28px; right: 28px; z-index: 9100;
  padding: 13px 22px; border-radius: 10px; font-family:"Poppins",sans-serif;
  font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px;
  opacity: 0; transform: translateY(8px); transition: all 0.2s; pointer-events: none;
}
.po-lb-toast.visivel { opacity: 1; transform: translateY(0); }
.po-lb-toast.ok  { background: rgba(46,204,113,0.95); color: #fff; }
.po-lb-toast.err { background: rgba(231,76,60,0.95); color: #fff; }

@media (max-width: 900px) {
  .po-lb-head { padding: 4px 16px 12px; }
  .po-lb-wrap { padding: 0 16px 20px; }
  .po-lb-busca { min-width: 120px; }
}
  `;
  document.head.appendChild(s);
})();

// ============================================================
// 🔢 CÁLCULO DE PONTOS
// ============================================================
function poLbParseNum(str) {
  let s = String(str ?? "").replace("R$", "").replace("%", "").replace(/\s/g, "").trim();
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return isFinite(n) ? n : null;
}

function poLbCalcularPontos(ind, valorStr) {
  const raw = String(valorStr ?? "").trim();
  if (raw === "") return null;
  const valor = poLbParseNum(raw);
  if (valor === null) return null;
  const meta = poLbParseNum(ind.meta_referencia);
  if (meta === null) return null;

  const tipo = ind.tipo_meta;
  let atingiu = false;
  if (tipo === "atingir" || tipo === "superar") atingiu = valor >= meta;
  else if (tipo === "abaixo")                   atingiu = valor <= meta;
  else if (tipo === "abaixo_negativo")          atingiu = valor >= meta;

  return atingiu ? Number(ind.peso) : 0;
}

function poLbFmt(n) {
  if (n == null) return "–";
  return Number(n) % 1 === 0 ? String(n) : String(n).replace(".", ",");
}

function poLbEhBinario() {
  return PO_LB.slug === "vendas" || PO_LB.slug === "quebras";
}

function poLbTotalLoja(cod) {
  if (poLbEhBinario()) {
    const b = PO_LB.binario[cod];
    if (b === true)  return Number(PO_LB.indicadores[0]?.peso || 0);
    if (b === false) return 0;
    return null;
  }
  let total = 0, algum = false;
  PO_LB.indicadores.forEach(ind => {
    const pts = poLbCalcularPontos(ind, PO_LB.valores[cod]?.[ind.nome]);
    if (pts !== null) { total += pts; algum = true; }
  });
  return algum ? total : null;
}

function poLbToast(msg, tipo = "ok", dur = 3200) {
  let el = document.getElementById("po-lb-toast");
  if (!el) { el = document.createElement("div"); el.id = "po-lb-toast"; el.className = "po-lb-toast"; document.body.appendChild(el); }
  el.className = `po-lb-toast ${tipo}`;
  el.innerHTML = `<span>${tipo === "ok" ? "✓" : "✕"}</span> ${msg}`;
  el.classList.add("visivel");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("visivel"), dur);
}

// ============================================================
// 📡 DADOS
// ============================================================
async function poLbCarregarLojas() {
  if (PO_LB.lojas.length) return PO_LB.lojas;
  const { data, error } = await window.db
    .from("painel_ouro_lojas")
    .select("codigo, nome")
    .eq("ativo", true)
    .order("codigo");
  if (error) { poLbErr("Erro lojas", error); return []; }
  PO_LB.lojas = data || [];
  return PO_LB.lojas;
}

async function poLbCarregarIndicadores(slug) {
  const { data, error } = await window.db
    .from("painel_ouro_indicadores_config")
    .select("*")
    .eq("area_slug", slug)
    .eq("ativo", true)
    .order("ordem");
  if (error) { poLbErr("Erro indicadores", error); return []; }
  // Normaliza a coluna "Ponto" (banco) para a chave .peso usada no código.
  (data || []).forEach(d => { if (d.peso == null && d["Ponto"] != null) d.peso = d["Ponto"]; });
  return data || [];
}

async function poLbCarregarExistentes(slug, ano, mes) {
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("loja_codigo, sub_resultados")
    .eq("area_slug", slug).eq("ano", ano).eq("mes", mes).eq("ativo", true);
  if (error) { poLbErr("Erro existentes", error); return {}; }
  const mapa = {};
  (data || []).forEach(r => {
    mapa[r.loja_codigo] = {};
    (r.sub_resultados || []).forEach(s => { mapa[r.loja_codigo][s.indicador] = s.resultado; });
  });
  return mapa;
}

// ============================================================
// 🏗️ RENDER DA TELA (dentro de #po-conteudo)
// ============================================================
async function poLbRenderTela() {
  let conteudo = document.getElementById("po-conteudo");

  // Auto-recuperação: se o container não existe, monta o painel primeiro
  if (!conteudo) {
    if (typeof window.telaPainelOuro === "function") {
      await window.telaPainelOuro();
      conteudo = document.getElementById("po-conteudo");
    }
  }
  if (!conteudo) { poLbErr("#po-conteudo não encontrado mesmo após montar o painel"); return; }

  const anoAtual = new Date().getFullYear();
  const optAno = [];
  for (let a = 2025; a <= anoAtual; a++)
    optAno.push(`<option value="${a}" ${a === PO_LB.ano ? "selected" : ""}>${a}</option>`);
  const optMes = PO_LB_MESES.map((m, i) =>
    `<option value="${i+1}" ${i+1 === PO_LB.mes ? "selected" : ""}>${m}</option>`).join("");

  conteudo.innerHTML = `
    <div class="po-lb-head">
      <div class="po-lb-head-left">
        <button type="button" class="po-lb-voltar" onclick="poLbVoltar()">← Voltar</button>
        <div>
          <div class="po-lb-titulo">Lançar — ${PO_LB.nome}</div>
          <div class="po-lb-sub" id="po-lb-sub">Carregando…</div>
        </div>
      </div>
      <div class="po-lb-controles">
        <select class="po-lb-select" id="po-lb-ano" onchange="poLbAlterarPeriodo()">${optAno.join("")}</select>
        <select class="po-lb-select" id="po-lb-mes" onchange="poLbAlterarPeriodo()">${optMes}</select>
        <input class="po-lb-busca" placeholder="🔍 Buscar loja…" oninput="poLbBuscar(this.value)" />
      </div>
    </div>
    <div class="po-lb-wrap">
      <div class="po-lb-card">
        <div class="po-lb-card-top">
          <span class="po-lb-card-titulo">${PO_LB.nome} — Resultados por loja</span>
          <span class="po-lb-card-badge" id="po-lb-badge">Máx ${poLbFmt(PO_LB.pesoMaximo)} pts</span>
        </div>
        <div class="po-lb-scroll" id="po-lb-scroll">
          <div class="po-lb-loading"><div class="po-lb-spin"></div> Carregando lojas…</div>
        </div>
        <div class="po-lb-actionbar">
          <div class="po-lb-actionbar-info" id="po-lb-contador"><b>0</b> de ${PO_LB.lojas.length} lojas preenchidas</div>
          <button type="button" class="po-lb-btn po-lb-btn-salvar" id="po-lb-salvar" onclick="poLbSalvarTudo()">
            <i class="fas fa-save"></i> Salvar todas
          </button>
        </div>
      </div>
    </div>`;
}

function poLbRenderTabela() {
  const scroll = document.getElementById("po-lb-scroll");
  if (!scroll) return;
  const inds = PO_LB.indicadores;
  const bin = poLbEhBinario();

  // cabeçalho
  let head;
  if (bin) {
    const ind = inds[0];
    head = `
      <tr>
        <th class="po-lb-col-loja" rowspan="2">Loja</th>
        <th colspan="2">${ind.nome}<span class="po-lb-meta">meta ${ind.meta_referencia} · ${poLbFmt(ind.peso)}p</span></th>
        <th class="po-lb-total-head" rowspan="2">Total</th>
      </tr>
      <tr><th>Atingiu?</th><th>Pontos</th></tr>`;
  } else {
    const top = inds.map((ind, i) => {
      const sep = i < inds.length - 1 ? "po-lb-sep" : "";
      return `<th colspan="2" class="${sep}">${ind.nome}<span class="po-lb-meta">meta ${ind.meta_referencia} · ${poLbFmt(ind.peso)}p</span></th>`;
    }).join("");
    const bottom = inds.map((ind, i) => {
      const sep = i < inds.length - 1 ? "po-lb-sep" : "";
      return `<th>Result.</th><th class="${sep}">Pts</th>`;
    }).join("");
    head = `
      <tr><th class="po-lb-col-loja" rowspan="2">Loja</th>${top}<th class="po-lb-total-head" rowspan="2">Total</th></tr>
      <tr>${bottom}</tr>`;
  }

  // linhas
  const linhas = PO_LB.lojas.map(loja => {
    const cod = loja.codigo;
    let cels;
    if (bin) {
      const b = PO_LB.binario[cod];
      const total = poLbTotalLoja(cod);
      cels = `
        <td>
          <div class="po-lb-bin">
            <button type="button" class="po-lb-bin-btn ${b === true ? "sim-on" : ""}" onclick="poLbBin('${cod}', true)">Sim</button>
            <button type="button" class="po-lb-bin-btn ${b === false ? "nao-on" : ""}" onclick="poLbBin('${cod}', false)">Não</button>
          </div>
        </td>
        <td><span class="po-lb-pts ${total > 0 ? "ok" : total === 0 ? "no" : "vazio"}" id="po-lb-pts-${cod}-b">${total != null ? poLbFmt(total) + "p" : "–"}</span></td>`;
    } else {
      cels = inds.map((ind, i) => {
        const val = PO_LB.valores[cod]?.[ind.nome] || "";
        const pts = poLbCalcularPontos(ind, val);
        const inpCls = pts === null ? "" : pts > 0 ? "ok" : "no";
        const ptsCls = pts === null ? "vazio" : pts > 0 ? "ok" : "no";
        const sep = i < inds.length - 1 ? "po-lb-sep" : "";
        return `
          <td><input class="po-lb-inp ${inpCls}" id="po-lb-inp-${cod}-${i}" value="${val}"
            data-loja="${cod}" data-idx="${i}" oninput="poLbInput(this)" placeholder="–" /></td>
          <td class="${sep}"><span class="po-lb-pts ${ptsCls}" id="po-lb-pts-${cod}-${i}">${pts === null ? "–" : poLbFmt(pts) + "p"}</span></td>`;
      }).join("");
    }
    const total = poLbTotalLoja(cod);
    return `
      <tr data-row="${cod}" data-nome="${(loja.nome || "").toLowerCase()}">
        <td class="po-lb-col-loja">
          <div class="po-lb-loja-nome">${loja.nome}</div>
          <div class="po-lb-loja-cod">#${cod}</div>
        </td>
        ${cels}
        <td class="po-lb-total" id="po-lb-total-${cod}">${total != null ? poLbFmt(total) : "0"}<span style="font-size:9px;color:#bbb">/${poLbFmt(PO_LB.pesoMaximo)}</span></td>
      </tr>`;
  }).join("");

  scroll.innerHTML = `<table class="po-lb-tabela"><thead>${head}</thead><tbody>${linhas}</tbody></table>`;
  poLbContador();
}

// ============================================================
// 🔄 INTERAÇÕES
// ============================================================
window.poLbInput = function(input) {
  const cod = input.dataset.loja;
  const idx = Number(input.dataset.idx);
  const ind = PO_LB.indicadores[idx];
  if (!PO_LB.valores[cod]) PO_LB.valores[cod] = {};
  PO_LB.valores[cod][ind.nome] = input.value;

  const pts = poLbCalcularPontos(ind, input.value);
  input.className = "po-lb-inp " + (pts === null ? "" : pts > 0 ? "ok" : "no");
  const badge = document.getElementById(`po-lb-pts-${cod}-${idx}`);
  if (badge) {
    badge.className = "po-lb-pts " + (pts === null ? "vazio" : pts > 0 ? "ok" : "no");
    badge.textContent = pts === null ? "–" : poLbFmt(pts) + "p";
  }
  poLbAtualizarTotal(cod);
};

window.poLbBin = function(cod, valor) {
  PO_LB.binario[cod] = (PO_LB.binario[cod] === valor) ? null : valor;
  const b = PO_LB.binario[cod];
  const row = document.querySelector(`tr[data-row="${cod}"]`);
  if (row) {
    const btns = row.querySelectorAll(".po-lb-bin-btn");
    if (btns[0]) btns[0].className = "po-lb-bin-btn " + (b === true ? "sim-on" : "");
    if (btns[1]) btns[1].className = "po-lb-bin-btn " + (b === false ? "nao-on" : "");
  }
  const total = poLbTotalLoja(cod);
  const badge = document.getElementById(`po-lb-pts-${cod}-b`);
  if (badge) {
    badge.className = "po-lb-pts " + (total > 0 ? "ok" : total === 0 ? "no" : "vazio");
    badge.textContent = total != null ? poLbFmt(total) + "p" : "–";
  }
  poLbAtualizarTotal(cod);
};

function poLbAtualizarTotal(cod) {
  const total = poLbTotalLoja(cod);
  const el = document.getElementById(`po-lb-total-${cod}`);
  if (el) el.innerHTML = `${total != null ? poLbFmt(total) : "0"}<span style="font-size:9px;color:#bbb">/${poLbFmt(PO_LB.pesoMaximo)}</span>`;
  poLbContador();
}

function poLbContador() {
  const n = PO_LB.lojas.filter(l => poLbTotalLoja(l.codigo) != null).length;
  const el = document.getElementById("po-lb-contador");
  if (el) el.innerHTML = `<b>${n}</b> de ${PO_LB.lojas.length} lojas preenchidas`;
}

window.poLbBuscar = function(termo) {
  const t = (termo || "").toLowerCase().trim();
  document.querySelectorAll("tr[data-row]").forEach(row => {
    const cod = row.dataset.row.toLowerCase();
    const nome = row.dataset.nome || "";
    row.style.display = (cod.includes(t) || nome.includes(t)) ? "" : "none";
  });
};

window.poLbAlterarPeriodo = async function() {
  const a = document.getElementById("po-lb-ano");
  const m = document.getElementById("po-lb-mes");
  if (a) PO_LB.ano = Number(a.value);
  if (m) PO_LB.mes = Number(m.value);
  await poLbRecarregar();
};

window.poLbVoltar = function() {
  // volta para a aba ranking do painel
  if (typeof window.poTrocarAba === "function") window.poTrocarAba("ranking");
};

async function poLbRecarregar() {
  const scroll = document.getElementById("po-lb-scroll");
  if (scroll) scroll.innerHTML = `<div class="po-lb-loading"><div class="po-lb-spin"></div> Carregando lançamentos…</div>`;
  PO_LB.valores = {};
  PO_LB.binario = {};

  const existentes = await poLbCarregarExistentes(PO_LB.slug, PO_LB.ano, PO_LB.mes);
  Object.entries(existentes).forEach(([cod, indMap]) => {
    if (poLbEhBinario()) {
      const ind = PO_LB.indicadores[0];
      const r = indMap[ind?.nome];
      PO_LB.binario[cod] = r === "sim" ? true : r === "nao" ? false : null;
    } else {
      PO_LB.valores[cod] = {};
      Object.entries(indMap).forEach(([k, v]) => { PO_LB.valores[cod][k] = v ?? ""; });
    }
  });

  poLbRenderTabela();
  const sub = document.getElementById("po-lb-sub");
  if (sub) {
    const qtd = Object.keys(existentes).length;
    sub.textContent = qtd > 0
      ? `${qtd} lojas já lançadas em ${PO_LB_MESES[PO_LB.mes-1]}/${PO_LB.ano} — edite e salve`
      : `Novo lançamento de ${PO_LB_MESES[PO_LB.mes-1]}/${PO_LB.ano}`;
  }
}

// ============================================================
// 💾 SALVAR TODAS
// ============================================================
window.poLbSalvarTudo = async function() {
  if (PO_LB.salvando) return;

  // 🔒 trava por semestre: se o período está encerrado, exige desbloqueio do Master
  try {
    if (typeof window.poVerificarTravaAntesDeSalvar === "function") {
      const liberado = await window.poVerificarTravaAntesDeSalvar(PO_LB.ano, PO_LB.mes);
      if (!liberado) { return; } // travado e não desbloqueado → não salva
    }
  } catch (e) { /* em caso de erro na trava, segue (não bloqueia indevidamente) */ }

  PO_LB.salvando = true;
  const btn = document.getElementById("po-lb-salvar");
  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="po-lb-spin" style="width:14px;height:14px;border-width:2px;"></span> Salvando…`; }

  try {
    const bin = poLbEhBinario();
    // BUGFIX: window.supabaseClient não é exposto globalmente pelo app.js —
    // o cliente correto é window.db (mesmo objeto). Usar getUser de forma segura.
    let user = null;
    try {
      const { data } = await window.db.auth.getUser();
      user = data?.user || null;
    } catch (e) { /* segue sem usuário */ }
    const agora = new Date().toISOString();
    const payloads = [];

    PO_LB.lojas.forEach(loja => {
      const cod = loja.codigo;
      const total = poLbTotalLoja(cod);
      if (total == null) return;

      let sub = [], pontuacao = 0;
      if (bin) {
        const ind = PO_LB.indicadores[0];
        const atingiu = PO_LB.binario[cod] === true;
        const pts = atingiu ? Number(ind.peso) : 0;
        pontuacao = pts;
        sub = [{ indicador: ind.nome, resultado: atingiu ? "sim" : "nao", Ponto: Number(ind.peso), pontos: pts }];
      } else {
        PO_LB.indicadores.forEach(ind => {
          const val = PO_LB.valores[cod]?.[ind.nome] || "";
          const pts = poLbCalcularPontos(ind, val) ?? 0;
          pontuacao += pts;
          sub.push({ indicador: ind.nome, resultado: val === "" ? null : val, Ponto: Number(ind.peso), pontos: pts });
        });
      }

      payloads.push({
        loja_codigo: cod, area_slug: PO_LB.slug, ano: PO_LB.ano, mes: PO_LB.mes,
        pontuacao_obtida: pontuacao, pontuacao_maxima: PO_LB.pesoMaximo,
        sub_resultados: sub, lancado_por: user?.id || null, lancado_em: agora, ativo: true,
      });
    });

    if (!payloads.length) { poLbToast("Nenhuma loja preenchida.", "err"); return; }

    const { error } = await window.db
      .from("painel_ouro_resultados")
      .upsert(payloads, { onConflict: "loja_codigo,area_slug,ano,mes", ignoreDuplicates: false });
    if (error) throw error;

    poLbToast(`✓ ${payloads.length} lojas salvas em ${PO_LB.nome}!`, "ok");
  } catch (err) {
    poLbErr("Erro ao salvar", err);
    poLbToast(`Erro: ${err.message || "tente novamente"}`, "err", 5000);
  } finally {
    PO_LB.salvando = false;
    if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-save"></i> Salvar todas`; }
  }
};

// ============================================================
// 🚪 PONTO DE ENTRADA — chamado pelos módulos de área
// ============================================================
window.poLancAbrirArea = async function(config) {
  // config = { slug, nome }
  poLbLog("Abrindo área em tela cheia", config);

  // permissão
  const usuario = typeof window.getUsuarioLogado === "function" ? window.getUsuarioLogado() : null;
  if (usuario && !["master", "admin"].includes(usuario.perfil)) {
    poLbToast("Sem permissão para lançar dados.", "err");
    if (typeof window.poTrocarAba === "function") window.poTrocarAba("ranking");
    return;
  }

  PO_LB.slug = config.slug;
  PO_LB.nome = config.nome;
  if (window.PO_STATE) { PO_LB.ano = PO_STATE.ano; PO_LB.mes = PO_STATE.mes; }

  // Garante que o painel (e o #po-conteudo) estão montados.
  // Se a tela do painel ainda não foi aberta, abre primeiro.
  if (!document.getElementById("po-conteudo")) {
    if (typeof window.telaPainelOuro === "function") {
      await window.telaPainelOuro();
    } else {
      poLbErr("telaPainelOuro indisponível — não foi possível montar o painel");
      return;
    }
  }

  const [lojas, indicadores] = await Promise.all([
    poLbCarregarLojas(),
    poLbCarregarIndicadores(config.slug),
  ]);
  PO_LB.indicadores = indicadores;
  PO_LB.pesoMaximo = indicadores.reduce((s, i) => s + Number(i.peso), 0);

  await poLbRenderTela();
  await poLbRecarregar();
};

// Expõe utilidades para os módulos de área (se precisarem)
window.poLancBase = {
  abrir: window.poLancAbrirArea,
  calcularPontos: poLbCalcularPontos,
  estado: PO_LB,
};