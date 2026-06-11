// ============================================================
// 👑 PAINEL DE OURO — app/painel-ouro/painel-ouro-areas.js
// Aba "Resultados por Área": uma tabela por área (Vendas, Quebras,
// Frente de Caixa, Passaí, Serviços Assaí, RH, Prevenção, TI/RUB/RM, ADM)
// com Resultado + Pontos por indicador e Total por loja.
// Dados vindos de painel_ouro_resultados (sub_resultados) +
// painel_ouro_indicadores_config, filtrados por area_slug/ano/mes.
// ============================================================
console.log("✅ painel-ouro-areas.js carregado");

const PO_AREAS_LISTA = [
  { slug: "vendas",         nome: "Vendas" },
  { slug: "quebras",        nome: "Quebras" },
  { slug: "passai",         nome: "Passaí" },
  { slug: "frente_caixa",   nome: "Frente de Caixa" },
  { slug: "servicos_assai", nome: "Serviços Assaí" },
  { slug: "rh",             nome: "RH" },
  { slug: "prevencao",      nome: "Prevenção" },
  { slug: "ti_rub_rm",      nome: "TI / RUB / RM" },
  { slug: "adm",            nome: "ADM" },
];

// ============================================================
// 🎨 ESTILOS — injetados uma única vez
// ============================================================
function poAreasGarantirEstilos() {
  if (document.getElementById("po-areas-styles")) return;

  const style = document.createElement("style");
  style.id = "po-areas-styles";
  style.textContent = `

.po-subabas {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 28px 16px;
}
.po-subaba {
  height: 30px;
  padding: 0 14px;
  background: #f0f4f8;
  border: 1px solid #e8edf2;
  border-radius: 8px;
  font-family: "Poppins", sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #7a8c9a;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.po-subaba:hover { background: #e6ecf2; color: #0a3d62; }
.po-subaba.ativa {
  background: linear-gradient(135deg, #c9a227 0%, #e8c84a 100%);
  border-color: transparent;
  color: #3d2b00;
}

.po-area-table th, .po-area-table td { white-space: nowrap; }
.po-area-table thead th {
  background: #f7f9fb;
  vertical-align: middle;
}
.po-area-table thead tr:first-child th {
  border-bottom: 1px solid #e8edf2;
}
.po-area-table .po-ind-peso {
  display: block;
  font-weight: 500;
  font-size: 9px;
  color: #9aabb7;
  text-transform: none;
  letter-spacing: 0;
}

@media (max-width: 900px) {
  .po-subabas { padding: 0 16px 12px; }
}
  `;
  document.head.appendChild(style);
}

// ============================================================
// 🔢 HELPERS
// ============================================================
function poAreasFmtNum(n) {
  const num = Number(n);
  if (!isFinite(num)) return "–";
  return num % 1 === 0 ? String(num) : poFmt(num, 1);
}

function poAreasCorPontos(pontos, peso) {
  if (pontos == null) return "#9aabb7";
  const p = Number(pontos);
  const m = Number(peso);
  if (p >= m) return "#0e7a4d";
  if (p > 0)  return "#a07a15";
  return "#c0392b";
}

// ============================================================
// 📡 DADOS — queries Supabase
// ============================================================
async function poCarregarIndicadoresArea(areaSlug) {
  const { data, error } = await window.db
    .from("painel_ouro_indicadores_config")
    .select("nome, peso, ordem")
    .eq("area_slug", areaSlug)
    .order("ordem", { ascending: true });

  if (error) { poErr("Erro ao carregar indicadores da área", error); return []; }
  return data || [];
}

async function poCarregarResultadosArea(areaSlug, ano, mes) {
  const { data, error } = await window.db
    .from("painel_ouro_resultados")
    .select("loja_codigo, pontuacao_obtida, pontuacao_maxima, sub_resultados, painel_ouro_lojas(nome)")
    .eq("area_slug", areaSlug)
    .eq("ano", ano)
    .eq("mes", mes)
    .eq("ativo", true)
    .order("loja_codigo", { ascending: true });

  if (error) { poErr("Erro ao carregar resultados da área", error); return []; }
  return data || [];
}

// ============================================================
// 🏷️ RENDER — visão RESULTADOS POR ÁREA
// ============================================================
async function poRenderAreas(container, ano, mes, areaSlug) {
  poAreasGarantirEstilos();
  poMostrarLoading(container);

  const area = PO_AREAS_LISTA.find(a => a.slug === areaSlug) || PO_AREAS_LISTA[0];
  PO_STATE.areaAtiva = area.slug;

  const subAbasHtml = `
    <div class="po-subabas">
      ${PO_AREAS_LISTA.map(a => `
        <button class="po-subaba ${a.slug === area.slug ? "ativa" : ""}" onclick="poSelecionarAreaResultado('${a.slug}')">${a.nome}</button>
      `).join("")}
    </div>`;

  const [indicadores, resultados] = await Promise.all([
    poCarregarIndicadoresArea(area.slug),
    poCarregarResultadosArea(area.slug, ano, mes),
  ]);

  if (!resultados.length || !indicadores.length) {
    container.innerHTML = `
      ${subAbasHtml}
      <div class="po-empty">
        <div class="po-empty-ico">📊</div>
        <p>Sem dados lançados para ${area.nome} em ${poNomeMes(mes)}/${ano}.</p>
      </div>`;
    return;
  }

  const totalMaximoArea = indicadores.reduce((s, i) => s + Number(i.peso), 0);

  const headerIndicadores = indicadores.map(ind => `
    <th class="txt-center" colspan="2">
      ${ind.nome}
      <span class="po-ind-peso">máx ${poAreasFmtNum(ind.peso)}</span>
    </th>`).join("");

  const subHeaderIndicadores = indicadores.map(() => `
    <th class="txt-center" style="font-size:9px">Resultado</th>
    <th class="txt-center" style="font-size:9px">Pontos</th>
  `).join("");

  const linhasHtml = resultados.map(r => {
    const nome = r.painel_ouro_lojas?.nome || r.loja_codigo;
    const subPorIndicador = {};
    (r.sub_resultados || []).forEach(s => { subPorIndicador[s.indicador] = s; });

    const colunas = indicadores.map(ind => {
      const sr = subPorIndicador[ind.nome];
      const resultado = sr ? sr.resultado : "–";
      const pontos = sr ? Number(sr.pontos) : null;
      const cor = poAreasCorPontos(pontos, ind.peso);
      return `
        <td class="txt-center">${resultado}</td>
        <td class="txt-center" style="font-weight:700;color:${cor}">${pontos != null ? poAreasFmtNum(pontos) : "–"}</td>`;
    }).join("");

    const total = Number(r.pontuacao_obtida);
    const max   = Number(r.pontuacao_maxima);

    return `
      <tr onclick="poAbrirDetalhe('${r.loja_codigo}')">
        <td>
          <div class="po-loja-nome">${nome}</div>
          <div class="po-loja-cod">#${r.loja_codigo}</div>
        </td>
        ${colunas}
        <td class="txt-center" style="font-weight:800;color:#0a3d62">${poAreasFmtNum(total)} / ${poAreasFmtNum(max)}</td>
      </tr>`;
  }).join("");

  container.innerHTML = `
    ${subAbasHtml}
    <div class="po-grid">
      <div class="po-col-12 po-card">
        <div class="po-card-header">
          <span class="po-card-titulo">${area.nome} — Resultados por loja</span>
          <span class="po-card-badge">${poNomeMes(mes)} ${ano} · máx ${poAreasFmtNum(totalMaximoArea)} pts · ${resultados.length} lojas</span>
        </div>
        <div class="po-card-body" style="padding:0;overflow-x:auto;max-height:560px;overflow-y:auto;">
          <table class="po-ranking-table po-area-table">
            <thead>
              <tr>
                <th rowspan="2" style="min-width:160px">Loja</th>
                ${headerIndicadores}
                <th rowspan="2" class="txt-center">Total</th>
              </tr>
              <tr>${subHeaderIndicadores}</tr>
            </thead>
            <tbody>${linhasHtml}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

window.poRenderAreas = poRenderAreas;

// ============================================================
// 🔁 NAVEGAÇÃO
// ============================================================
window.poSelecionarAreaResultado = function(areaSlug) {
  const conteudo = document.getElementById("po-conteudo");
  if (!conteudo) return;
  poRenderAreas(conteudo, PO_STATE.ano, PO_STATE.mes, areaSlug);
};

// Chamado pelo sidebar ao clicar numa área (usuários sem permissão de lançamento)
window.poFiltrarPorArea = function(areaSlug) {
  PO_STATE.areaAtiva = areaSlug;
  if (typeof window.poTrocarAba === "function") {
    window.poTrocarAba("areas");
  }
};
