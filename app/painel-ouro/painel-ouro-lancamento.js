// ============================================================
// 👑 PAINEL DE OURO — painel-ouro-lancamento.js
// Módulo de lançamento de resultados mensais por loja/área
// Expõe: window.poAbrirLancamento(areaSlug)
//        window.poFecharLancamento()
// Chamado pelo sidebar-painel-ouro.js ao clicar em uma área
// Requer: window.db (Supabase), perfil master ou admin
// ============================================================
console.log("✅ painel-ouro-lancamento.js carregado");

// ============================================================
// 🎨 ESTILOS
// ============================================================
(function poLancGarantirEstilos() {
  if (document.getElementById("po-lanc-styles")) return;
  const s = document.createElement("style");
  s.id = "po-lanc-styles";
  s.textContent = `

/* ---- MODAL OVERLAY ---- */
#po-lanc-overlay {
  position: fixed;
  inset: 0;
  z-index: 8000;
  background: rgba(5, 8, 14, 0.80);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease;
}
#po-lanc-overlay.visivel {
  opacity: 1;
  pointer-events: all;
}

/* ---- MODAL BOX ---- */
.po-lanc-modal {
  background: #0e0c08;
  border: 1px solid rgba(201,162,39,0.18);
  border-radius: 16px;
  width: 100%;
  max-width: 780px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,162,39,0.08);
  transform: translateY(12px);
  transition: transform 0.22s ease;
  overflow: hidden;
}
#po-lanc-overlay.visivel .po-lanc-modal {
  transform: translateY(0);
}

/* ---- HEADER ---- */
.po-lanc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 14px;
  border-bottom: 1px solid rgba(201,162,39,0.1);
  flex-shrink: 0;
}
.po-lanc-header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.po-lanc-titulo {
  font-family: "Poppins", sans-serif;
  font-size: 15px;
  font-weight: 800;
  background: linear-gradient(135deg, #e8c84a 0%, #c9a227 60%, #a07a15 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.po-lanc-subtitulo {
  font-family: "Poppins", sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.3);
}
.po-lanc-fechar {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,0.4);
  font-size: 16px;
  line-height: 1;
  transition: all 0.15s;
  font-family: "Poppins", sans-serif;
}
.po-lanc-fechar:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
}

/* ---- CONTROLES (loja + período) ---- */
.po-lanc-controles {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-wrap: wrap;
  flex-shrink: 0;
}
.po-lanc-select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(201,162,39,0.2);
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.8);
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: border 0.15s;
  min-width: 140px;
}
.po-lanc-select:focus { border-color: rgba(201,162,39,0.5); }
.po-lanc-select option { background: #1a1500; color: #fff; }

.po-lanc-badge-area {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(201,162,39,0.2), rgba(201,162,39,0.08));
  border: 1px solid rgba(201,162,39,0.25);
  font-family: "Poppins", sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #e8c84a;
  letter-spacing: 0.3px;
}

.po-lanc-btn-carregar {
  height: 34px;
  padding: 0 16px;
  background: rgba(201,162,39,0.12);
  border: 1px solid rgba(201,162,39,0.25);
  border-radius: 8px;
  color: #e8c84a;
  font-family: "Poppins", sans-serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.po-lanc-btn-carregar:hover {
  background: rgba(201,162,39,0.2);
  border-color: rgba(201,162,39,0.4);
}

/* ---- CORPO SCROLLÁVEL ---- */
.po-lanc-corpo {
  flex: 1;
  overflow-y: auto;
  padding: 16px 22px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201,162,39,0.2) transparent;
}
.po-lanc-corpo::-webkit-scrollbar { width: 4px; }
.po-lanc-corpo::-webkit-scrollbar-thumb {
  background: rgba(201,162,39,0.2);
  border-radius: 10px;
}

/* ---- INDICADOR ROW ---- */
.po-lanc-indicador {
  display: grid;
  grid-template-columns: 1fr 180px 80px;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.po-lanc-indicador:last-child { border-bottom: none; }

.po-lanc-ind-info { display: flex; flex-direction: column; gap: 2px; }
.po-lanc-ind-nome {
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
}
.po-lanc-ind-meta {
  font-family: "Poppins", sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: rgba(201,162,39,0.5);
}
.po-lanc-ind-peso {
  font-family: "Poppins", sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.2);
}

/* Input de valor */
.po-lanc-input {
  height: 36px;
  width: 100%;
  padding: 0 10px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.9);
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 600;
  outline: none;
  transition: all 0.15s;
  box-sizing: border-box;
}
.po-lanc-input:focus {
  border-color: rgba(201,162,39,0.4);
  background: rgba(201,162,39,0.04);
}
.po-lanc-input::placeholder { color: rgba(255,255,255,0.18); font-weight: 400; }
.po-lanc-input.po-lanc-ok    { border-color: rgba(46,204,113,0.4); }
.po-lanc-input.po-lanc-no    { border-color: rgba(231,76,60,0.4); }

/* Badge de pontos (calculado ao vivo) */
.po-lanc-pts-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  min-width: 52px;
  border-radius: 8px;
  font-family: "Poppins", sans-serif;
  font-size: 11px;
  font-weight: 800;
  transition: all 0.2s;
}
.po-lanc-pts-ok   { background: rgba(46,204,113,0.15); color: #2ecc71; border: 1px solid rgba(46,204,113,0.2); }
.po-lanc-pts-no   { background: rgba(231,76,60,0.12);  color: #e74c3c; border: 1px solid rgba(231,76,60,0.15); }
.po-lanc-pts-vazio{ background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.06); }

/* ---- SEÇÃO VENDAS / QUEBRAS (binário) ---- */
.po-lanc-secao-binaria {
  padding: 16px 0 8px;
}
.po-lanc-binaria-label {
  font-family: "Poppins", sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}
.po-lanc-radio-group {
  display: flex;
  gap: 10px;
}
.po-lanc-radio-btn {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 10px;
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.35);
  user-select: none;
}
.po-lanc-radio-btn:hover { background: rgba(255,255,255,0.06); }
.po-lanc-radio-btn.ativo-sim {
  background: rgba(46,204,113,0.15);
  border-color: rgba(46,204,113,0.3);
  color: #2ecc71;
}
.po-lanc-radio-btn.ativo-nao {
  background: rgba(231,76,60,0.12);
  border-color: rgba(231,76,60,0.25);
  color: #e74c3c;
}

/* ---- TOTALIZADOR ---- */
.po-lanc-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 0;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(201,162,39,0.07);
  border: 1px solid rgba(201,162,39,0.14);
}
.po-lanc-total-label {
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
}
.po-lanc-total-valor {
  font-family: "Poppins", sans-serif;
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #e8c84a, #c9a227);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.po-lanc-total-max {
  font-family: "Poppins", sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.2);
}

/* ---- FOOTER ---- */
.po-lanc-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 22px;
  border-top: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}
.po-lanc-btn {
  height: 38px;
  padding: 0 20px;
  border-radius: 10px;
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 7px;
}
.po-lanc-btn-cancelar {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.4);
}
.po-lanc-btn-cancelar:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.7);
}
.po-lanc-btn-salvar {
  background: linear-gradient(135deg, #c9a227, #a07a15);
  border: none;
  color: #fff;
  box-shadow: 0 4px 14px rgba(201,162,39,0.3);
}
.po-lanc-btn-salvar:hover {
  background: linear-gradient(135deg, #e8c84a, #c9a227);
  box-shadow: 0 4px 18px rgba(201,162,39,0.45);
}
.po-lanc-btn-salvar:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

/* ---- STATUS / TOAST ---- */
.po-lanc-toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9100;
  padding: 12px 20px;
  border-radius: 10px;
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.2s ease;
  pointer-events: none;
}
.po-lanc-toast.visivel {
  opacity: 1;
  transform: translateY(0);
}
.po-lanc-toast.ok  { background: rgba(46,204,113,0.9);  color: #fff; }
.po-lanc-toast.err { background: rgba(231,76,60,0.9);   color: #fff; }

/* ---- LOADING INTERNO ---- */
.po-lanc-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
  color: rgba(255,255,255,0.3);
  font-family: "Poppins", sans-serif;
  font-size: 12px;
}
.po-lanc-spinner {
  width: 20px; height: 20px;
  border: 2px solid rgba(201,162,39,0.15);
  border-top-color: #c9a227;
  border-radius: 50%;
  animation: poLancSpin 0.7s linear infinite;
}
@keyframes poLancSpin { to { transform: rotate(360deg); } }

/* ---- RESPONSIVO ---- */
@media (max-width: 600px) {
  .po-lanc-indicador {
    grid-template-columns: 1fr 130px 60px;
    gap: 8px;
  }
  .po-lanc-controles { padding: 10px 14px; }
  .po-lanc-header    { padding: 14px 14px 12px; }
  .po-lanc-corpo     { padding: 12px 14px; }
  .po-lanc-footer    { padding: 12px 14px; }
}

  `;
  document.head.appendChild(s);
})();


// ============================================================
// 🧠 ESTADO DO LANÇAMENTO
// ============================================================
const PO_LANC = {
  areaSlug:    null,
  areaNome:    null,
  lojaCodigo:  null,
  ano:         new Date().getFullYear(),
  mes:         new Date().getMonth() + 1,
  indicadores: [],  // config carregada do banco
  lojas:       [],  // lista de lojas
  dadosAtuais: null,// resultado existente (para edição)
  salvando:    false,
};

const PO_LANC_MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

// ============================================================
// 🔧 HELPERS
// ============================================================
function poLancLog(msg, d)  { d != null ? console.log(`👑 LANC | ${msg}`, d) : console.log(`👑 LANC | ${msg}`); }
function poLancErr(msg, d)  { d != null ? console.error(`👑 LANC | ${msg}`, d) : console.error(`👑 LANC | ${msg}`); }

function poLancToast(msg, tipo = "ok", duracao = 3200) {
  let el = document.getElementById("po-lanc-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "po-lanc-toast";
    el.className = "po-lanc-toast";
    document.body.appendChild(el);
  }
  el.className = `po-lanc-toast ${tipo}`;
  el.innerHTML = `<span>${tipo === "ok" ? "✓" : "✕"}</span> ${msg}`;
  el.classList.add("visivel");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("visivel"), duracao);
}

// Avalia se o valor atinge a meta e retorna os pontos
function poLancCalcularPontos(indicador, valorStr) {
  const raw = String(valorStr ?? "").trim().replace(",", ".");
  if (raw === "") return null;

  const valor = parseFloat(raw);
  if (!isFinite(valor)) return null;

  const metaStr = String(indicador.meta_referencia ?? "")
    .replace("R$", "").replace("%", "").replace(/\./g, "").replace(",", ".").trim();
  const meta = parseFloat(metaStr);
  if (!isFinite(meta)) return null;

  const tipo = indicador.tipo_meta;

  let atingiu = false;
  if (tipo === "atingir" || tipo === "superar") {
    atingiu = valor >= meta;
  } else if (tipo === "abaixo") {
    atingiu = valor <= meta;
  } else if (tipo === "abaixo_negativo") {
    // ex: Quebra FLV meta = -2,80 → resultado -1,5 é MELHOR (mais próximo de 0)
    // o valor deve ser >= meta (menos negativo ou positivo)
    atingiu = valor >= meta;
  }

  return atingiu ? Number(indicador.peso) : 0;
}

// ============================================================
// 📡 DADOS
// ============================================================
async function poLancCarregarLojas() {
  if (PO_LANC.lojas.length) return PO_LANC.lojas;
  const { data, error } = await window.db
    .from("painel_ouro_lojas")
    .select("codigo, nome")
    .eq("ativo", true)
    .order("nome");
  if (error) { poLancErr("Erro ao carregar lojas", error); return []; }
  PO_LANC.lojas = data || [];
  return PO_LANC.lojas;
}

async function poLancCarregarIndicadores(areaSlug) {
  const { data, error } = await window.db
    .from("painel_ouro_indicadores_config")
    .select("*")
    .eq("area_slug", areaSlug)
    .eq("ativo", true)
    .order("ordem");
  if (error) { poLancErr("Erro ao carregar indicadores", error); return []; }
  return data || [];
}

async function poLancCarregarExistente(lojaCodigo, areaSlug, ano, mes) {
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("*")
    .eq("loja_codigo", lojaCodigo)
    .eq("area_slug", areaSlug)
    .eq("ano", ano)
    .eq("mes", mes)
    .single();
  if (error && error.code !== "PGRST116") poLancErr("Erro ao buscar existente", error);
  return data || null;
}

// ============================================================
// 🏗️ RENDER DO CORPO — indicadores por área
// ============================================================
function poLancRenderCorpo(indicadores, dadosExistentes) {
  const corpo = document.getElementById("po-lanc-corpo");
  if (!corpo) return;

  // Extrai valores existentes do JSONB sub_resultados
  const valoresExistentes = {};
  if (dadosExistentes?.sub_resultados) {
    (dadosExistentes.sub_resultados).forEach(s => {
      valoresExistentes[s.indicador] = s.resultado;
    });
  }

  // Vendas e Quebras: binário (atingiu ou não)
  if (PO_LANC.areaSlug === "vendas" || PO_LANC.areaSlug === "quebras") {
    const ind = indicadores[0];
    const valorAtual = valoresExistentes[ind.nome];
    const atingiu = valorAtual === "sim" ? true : valorAtual === "nao" ? false : null;

    corpo.innerHTML = `
      <div class="po-lanc-secao-binaria">
        <div class="po-lanc-binaria-label">
          ${PO_LANC.areaSlug === "vendas"
            ? "A loja atingiu a meta de venda mensal?"
            : "A loja ficou abaixo da meta de quebra mensal?"}
        </div>
        <div class="po-lanc-radio-group">
          <div class="po-lanc-radio-btn ${atingiu === true ? 'ativo-sim' : ''}"
            id="po-lanc-bin-sim" onclick="poLancToggleBinario(true)">
            ✓ Sim — ${Number(ind.peso)} pontos
          </div>
          <div class="po-lanc-radio-btn ${atingiu === false ? 'ativo-nao' : ''}"
            id="po-lanc-bin-nao" onclick="poLancToggleBinario(false)">
            ✕ Não — 0 pontos
          </div>
        </div>
      </div>
      ${poLancRenderTotal()}
    `;
    poLancAtualizarTotal();
    return;
  }

  // Demais áreas: campos por indicador
  const linhas = indicadores.map(ind => {
    const valorExistente = valoresExistentes[ind.nome] || "";
    const pts = poLancCalcularPontos(ind, valorExistente);
    const ptsCls = pts === null ? "po-lanc-pts-vazio"
                 : pts > 0     ? "po-lanc-pts-ok"
                 :               "po-lanc-pts-no";
    const ptsLabel = pts === null ? "—" : pts > 0 ? `+${pts}p` : "0p";

    // placeholder e sufixo por tipo_valor
    const placeholder = ind.tipo_valor === "moeda"    ? "Ex: 1500.00"
                      : ind.tipo_valor === "inteiro"   ? "Ex: 150"
                      :                                  "Ex: 3.5";
    const sufixo = ind.tipo_valor === "percentual" ? "%" : "";

    return `
      <div class="po-lanc-indicador" data-ind="${encodeURIComponent(ind.nome)}">
        <div class="po-lanc-ind-info">
          <span class="po-lanc-ind-nome">${ind.nome}</span>
          <span class="po-lanc-ind-meta">
            Meta: ${ind.meta_referencia}
            ${ind.tipo_meta === "atingir"          ? "↑ atingir"
            : ind.tipo_meta === "abaixo"           ? "↓ ficar abaixo"
            : ind.tipo_meta === "abaixo_negativo"  ? "↓ menor prejuízo"
            : ""}
            ${sufixo}
          </span>
        </div>
        <input
          class="po-lanc-input ${pts === null ? '' : pts > 0 ? 'po-lanc-ok' : 'po-lanc-no'}"
          id="po-lanc-inp-${CSS.escape(ind.nome)}"
          type="number"
          step="any"
          placeholder="${placeholder}"
          value="${valorExistente}"
          data-ind="${encodeURIComponent(ind.nome)}"
          data-peso="${ind.peso}"
          data-tipo-meta="${ind.tipo_meta}"
          data-meta="${ind.meta_referencia}"
          data-tipo-valor="${ind.tipo_valor}"
          oninput="poLancOnInput(this)"
        />
        <span class="po-lanc-pts-badge ${ptsCls}" id="po-lanc-pts-${CSS.escape(ind.nome)}">${ptsLabel}</span>
      </div>`;
  }).join("");

  corpo.innerHTML = `
    ${linhas}
    ${poLancRenderTotal()}
  `;

  poLancAtualizarTotal();
}

function poLancRenderTotal() {
  return `
    <div class="po-lanc-total" id="po-lanc-total-wrap">
      <div>
        <div class="po-lanc-total-label">Total da área</div>
        <div class="po-lanc-total-max" id="po-lanc-total-max">de ${PO_LANC.indicadores.reduce((s, i) => s + Number(i.peso), 0).toFixed(1)} pts possíveis</div>
      </div>
      <div class="po-lanc-total-valor" id="po-lanc-total-valor">—</div>
    </div>`;
}

// ============================================================
// 🔄 INTERAÇÕES EM TEMPO REAL
// ============================================================
window.poLancOnInput = function(input) {
  const ind = {
    nome:            decodeURIComponent(input.dataset.ind),
    peso:            input.dataset.peso,
    tipo_meta:       input.dataset.tipoMeta,
    meta_referencia: input.dataset.meta,
    tipo_valor:      input.dataset.tipoValor,
  };
  const pts = poLancCalcularPontos(ind, input.value);
  const nome = ind.nome;

  // Atualiza cor do input
  input.className = "po-lanc-input " + (
    pts === null ? "" : pts > 0 ? "po-lanc-ok" : "po-lanc-no"
  );

  // Atualiza badge de pontos
  const badge = document.getElementById(`po-lanc-pts-${CSS.escape(nome)}`);
  if (badge) {
    badge.className = "po-lanc-pts-badge " + (
      pts === null ? "po-lanc-pts-vazio"
    : pts > 0     ? "po-lanc-pts-ok"
    :               "po-lanc-pts-no"
    );
    badge.textContent = pts === null ? "—" : pts > 0 ? `+${pts}p` : "0p";
  }

  poLancAtualizarTotal();
};

window.poLancToggleBinario = function(atingiu) {
  const btnSim = document.getElementById("po-lanc-bin-sim");
  const btnNao = document.getElementById("po-lanc-bin-nao");
  if (!btnSim || !btnNao) return;

  btnSim.className = `po-lanc-radio-btn ${atingiu ? "ativo-sim" : ""}`;
  btnNao.className = `po-lanc-radio-btn ${!atingiu ? "ativo-nao" : ""}`;

  poLancAtualizarTotal();
};

function poLancAtualizarTotal() {
  const el = document.getElementById("po-lanc-total-valor");
  if (!el) return;

  let total = 0;
  let temDado = false;

  if (PO_LANC.areaSlug === "vendas" || PO_LANC.areaSlug === "quebras") {
    const btnSim = document.getElementById("po-lanc-bin-sim");
    if (btnSim?.classList.contains("ativo-sim")) { total = Number(PO_LANC.indicadores[0]?.peso || 0); temDado = true; }
    else if (document.getElementById("po-lanc-bin-nao")?.classList.contains("ativo-nao")) { total = 0; temDado = true; }
  } else {
    document.querySelectorAll(".po-lanc-input").forEach(inp => {
      if (inp.value.trim() !== "") {
        const pts = poLancCalcularPontos({
          peso:            inp.dataset.peso,
          tipo_meta:       inp.dataset.tipoMeta,
          meta_referencia: inp.dataset.meta,
          tipo_valor:      inp.dataset.tipoValor,
        }, inp.value);
        if (pts !== null) { total += pts; temDado = true; }
      }
    });
  }

  el.textContent = temDado ? `${total.toFixed(1)} pts` : "—";
}

// ============================================================
// 💾 SALVAR
// ============================================================
window.poLancSalvar = async function() {
  if (PO_LANC.salvando) return;
  if (!PO_LANC.lojaCodigo) { poLancToast("Selecione uma loja.", "err"); return; }

  PO_LANC.salvando = true;
  const btn = document.getElementById("po-lanc-btn-salvar");
  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="po-lanc-spinner" style="width:14px;height:14px;border-width:2px;"></span> Salvando…`; }

  try {
    let subResultados = [];
    let pontuacaoObtida = 0;
    const pesoMaximo = PO_LANC.indicadores.reduce((s, i) => s + Number(i.peso), 0);

    if (PO_LANC.areaSlug === "vendas" || PO_LANC.areaSlug === "quebras") {
      const atingiu = document.getElementById("po-lanc-bin-sim")?.classList.contains("ativo-sim");
      const naoAtingiu = document.getElementById("po-lanc-bin-nao")?.classList.contains("ativo-nao");
      if (!atingiu && !naoAtingiu) { poLancToast("Selecione Sim ou Não.", "err"); return; }

      const ind = PO_LANC.indicadores[0];
      const pts = atingiu ? Number(ind.peso) : 0;
      pontuacaoObtida = pts;
      subResultados = [{ indicador: ind.nome, resultado: atingiu ? "sim" : "nao", peso: Number(ind.peso), pontos: pts }];

    } else {
      PO_LANC.indicadores.forEach(ind => {
        const inp = document.getElementById(`po-lanc-inp-${CSS.escape(ind.nome)}`);
        const valor = inp?.value?.trim() || "";
        const pts = poLancCalcularPontos(ind, valor);
        const pontosReais = pts ?? 0;
        pontuacaoObtida += pontosReais;
        subResultados.push({
          indicador: ind.nome,
          resultado: valor === "" ? null : valor,
          peso: Number(ind.peso),
          pontos: pontosReais,
        });
      });
    }

    // Busca auth_user_id do usuário logado
    const { data: { user } } = await window.db.auth.getUser();

    const payload = {
      loja_codigo:      PO_LANC.lojaCodigo,
      area_slug:        PO_LANC.areaSlug,
      ano:              PO_LANC.ano,
      mes:              PO_LANC.mes,
      pontuacao_obtida: pontuacaoObtida,
      pontuacao_maxima: pesoMaximo,
      sub_resultados:   subResultados,
      lancado_por:      user?.id || null,
      lancado_em:       new Date().toISOString(),
      ativo:            true,
    };

    const { error } = await window.db
      .from("painel_ouro_resultados")
      .upsert(payload, {
        onConflict: "loja_codigo,area_slug,ano,mes",
        ignoreDuplicates: false,
      });

    if (error) throw error;

    poLancToast(`✓ ${PO_LANC.areaNome} — ${pontuacaoObtida.toFixed(1)} pts salvos!`, "ok");
    poLancLog("Salvo com sucesso", payload);

    // Recarrega o ranking se estiver visível
    if (typeof window.poTrocarAba === "function") {
      setTimeout(() => window.poTrocarAba("ranking"), 600);
    }

    window.poFecharLancamento();

  } catch (err) {
    poLancErr("Erro ao salvar", err);
    poLancToast(`Erro ao salvar: ${err.message || "tente novamente"}`, "err", 5000);
  } finally {
    PO_LANC.salvando = false;
    if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-save"></i> Salvar`; }
  }
};

// ============================================================
// 🔃 CARREGAR LOJA (ao trocar o select)
// ============================================================
window.poLancCarregarLoja = async function() {
  const sel = document.getElementById("po-lanc-sel-loja");
  if (!sel) return;
  PO_LANC.lojaCodigo = sel.value || null;
  if (!PO_LANC.lojaCodigo) return;

  const corpo = document.getElementById("po-lanc-corpo");
  if (corpo) corpo.innerHTML = `<div class="po-lanc-loading"><div class="po-lanc-spinner"></div> Carregando dados…</div>`;

  const existente = await poLancCarregarExistente(
    PO_LANC.lojaCodigo, PO_LANC.areaSlug, PO_LANC.ano, PO_LANC.mes
  );
  PO_LANC.dadosAtuais = existente;
  poLancRenderCorpo(PO_LANC.indicadores, existente);

  // Atualiza subtítulo com status
  const sub = document.getElementById("po-lanc-subtitulo");
  if (sub) {
    sub.textContent = existente
      ? `Editando lançamento existente — ${existente.pontuacao_obtida} pts de ${existente.pontuacao_maxima}`
      : `Novo lançamento`;
  }
};

window.poLancAlterarPeriodo = async function() {
  const selAno = document.getElementById("po-lanc-sel-ano");
  const selMes = document.getElementById("po-lanc-sel-mes");
  if (selAno) PO_LANC.ano = Number(selAno.value);
  if (selMes) PO_LANC.mes = Number(selMes.value);
  if (PO_LANC.lojaCodigo) await window.poLancCarregarLoja();
};

// ============================================================
// 🚪 ABRIR / FECHAR
// ============================================================
window.poAbrirLancamento = async function(areaSlug, areaNome) {
  poLancLog("Abrindo lançamento", { areaSlug, areaNome });

  // Verifica permissão
  const usuario = typeof window.getUsuarioLogado === "function" ? window.getUsuarioLogado() : null;
  if (usuario && !["master", "admin"].includes(usuario.perfil)) {
    poLancToast("Sem permissão para lançar dados.", "err"); return;
  }

  PO_LANC.areaSlug   = areaSlug;
  PO_LANC.areaNome   = areaNome;
  PO_LANC.lojaCodigo = null;
  PO_LANC.dadosAtuais = null;

  // Garante overlay no DOM
  let overlay = document.getElementById("po-lanc-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "po-lanc-overlay";
    overlay.innerHTML = `<div class="po-lanc-modal" id="po-lanc-modal"></div>`;
    overlay.addEventListener("click", e => { if (e.target === overlay) window.poFecharLancamento(); });
    document.body.appendChild(overlay);
  }

  const modal = document.getElementById("po-lanc-modal");
  modal.innerHTML = `<div class="po-lanc-loading"><div class="po-lanc-spinner"></div> Carregando configuração…</div>`;

  // Abre overlay imediatamente (feedback visual)
  requestAnimationFrame(() => overlay.classList.add("visivel"));

  // Carrega dados em paralelo
  const [lojas, indicadores] = await Promise.all([
    poLancCarregarLojas(),
    poLancCarregarIndicadores(areaSlug),
  ]);

  PO_LANC.indicadores = indicadores;

  // Gera options de ano e mês
  const anoAtual = new Date().getFullYear();
  const optAno = Array.from({ length: anoAtual - 2024 }, (_, i) => {
    const a = 2025 + i;
    return `<option value="${a}" ${a === PO_LANC.ano ? "selected" : ""}>${a}</option>`;
  }).join("");
  const optMes = PO_LANC_MESES.map((m, i) => {
    const n = i + 1;
    return `<option value="${n}" ${n === PO_LANC.mes ? "selected" : ""}>${m}</option>`;
  }).join("");

  const optLojas = `<option value="">— Selecione a loja —</option>` +
    lojas.map(l => `<option value="${l.codigo}">${l.codigo} — ${l.nome}</option>`).join("");

  modal.innerHTML = `
    <div class="po-lanc-header">
      <div class="po-lanc-header-left">
        <div class="po-lanc-titulo">👑 Lançar resultados</div>
        <div class="po-lanc-subtitulo" id="po-lanc-subtitulo">Selecione a loja para começar</div>
      </div>
      <button class="po-lanc-fechar" onclick="poFecharLancamento()">×</button>
    </div>

    <div class="po-lanc-controles">
      <span class="po-lanc-badge-area">✦ ${areaNome}</span>
      <select class="po-lanc-select" id="po-lanc-sel-ano"
        onchange="poLancAlterarPeriodo()">${optAno}</select>
      <select class="po-lanc-select" id="po-lanc-sel-mes"
        onchange="poLancAlterarPeriodo()">${optMes}</select>
      <select class="po-lanc-select" id="po-lanc-sel-loja"
        style="min-width:200px;"
        onchange="poLancCarregarLoja()">${optLojas}</select>
    </div>

    <div class="po-lanc-corpo" id="po-lanc-corpo">
      <div class="po-lanc-loading" style="opacity:0.4;">
        Selecione uma loja acima para carregar os campos.
      </div>
    </div>

    <div class="po-lanc-footer">
      <button class="po-lanc-btn po-lanc-btn-cancelar" onclick="poFecharLancamento()">
        Cancelar
      </button>
      <button class="po-lanc-btn po-lanc-btn-salvar" id="po-lanc-btn-salvar"
        onclick="poLancSalvar()">
        <i class="fas fa-save"></i> Salvar
      </button>
    </div>
  `;
};

window.poFecharLancamento = function() {
  const overlay = document.getElementById("po-lanc-overlay");
  if (!overlay) return;
  overlay.classList.remove("visivel");
  PO_LANC.salvando = false;
};