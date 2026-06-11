// app/painel-ouro/prevencao.js

(function () {
  // ============================================================
  // 🎨 INJEÇÃO DE ESTILOS PREMIUM (Adaptado ao layout de Prevenção)
  // ============================================================
  (function poPrevGarantirEstilos() {
    if (document.getElementById("po-prev-styles")) return;
    const s = document.createElement("style");
    s.id = "po-prev-styles";
    s.textContent = `
      .painel-prev {
        background: linear-gradient(180deg, #0f1418 0%, #12161a 100%);
        color: #f4e7b2;
        border: 1px solid rgba(212,175,55,0.12);
        padding: 18px;
        border-radius: 10px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6);
        margin: 18px 0;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .painel-prev h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #ffd966;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .po-prev-filtros {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        background: rgba(255,255,255,0.02);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.05);
      }

      .po-prev-control {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .po-prev-control label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(201,162,39,0.6);
        font-weight: 700;
      }

      .po-prev-select {
        background: #161c22;
        border: 1px solid rgba(212,175,55,0.2);
        color: #f4e7b2;
        padding: 6px 12px;
        border-radius: 6px;
        font-family: inherit;
        font-size: 13px;
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s;
      }

      .po-prev-select:focus { border-color: #ffd966; }

      .table-prev-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.1);
      }

      .table-prev {
        width: 100%;
        border-collapse: collapse;
        min-width: 1200px;
      }

      /* Cabeçalho Multi-nível fiel à imagem de colunas */
      .table-prev thead th {
        font-family: "Poppins", sans-serif;
        font-size: 11px;
        font-weight: 700;
        padding: 6px 4px;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.08);
      }

      .row-metas th { background: #e5cbb7; color: #1e293b; font-size: 12px !important; }
      .row-indicadores th { background: #2c3545; color: #fff; letter-spacing: 0.5px; }
      .row-subheaders th { background: #1a2432; color: #ffd966; font-size: 10px !important; }
      
      .th-fixa { background: #11161d !important; color: #ffd966 !important; }
      .th-total-pontos { background: #b25e10 !important; color: #fff !important; font-size: 12px !important; }

      .table-prev tbody td {
        padding: 6px 8px;
        font-size: 13px;
        color: #e9e1b8;
        border: 1px solid rgba(255,255,255,0.04);
        background: rgba(0,0,0,0.1);
      }

      .table-prev tbody tr:hover td {
        background: rgba(212,175,55,0.03);
        color: #fff;
      }

      .po-prev-input {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(212,175,55,0.15);
        color: #fff;
        padding: 4px 6px;
        border-radius: 4px;
        width: 80px;
        font-family: inherit;
        font-size: 12px;
        text-align: right;
        transition: all 0.15s;
      }

      .po-prev-input:focus {
        background: #161c22;
        border-color: #ffd966;
        box-shadow: 0 0 6px rgba(255,217,102,0.3);
        outline: none;
      }

      .badge-prev-pts {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 11px;
        min-width: 20px;
        text-align: center;
      }
      .badge-prev-pts.ganhou { background: #2e7d32; color: #fff; }
      .badge-prev-pts.perdeu { background: rgba(255,255,255,0.05); color: #888; }

      .res-good { color: #9be67a; font-weight:700; }
      .res-bad  { color: #ff8a8a; font-weight:700; }
      .td-total-final { font-weight: 800; color: #ffd966; text-align: center; background: rgba(212,175,55,0.05) !important; }
    `;
    document.head.appendChild(s);
  })();

  // ============================================================
  // 🗄️ MAPA DE LOJAS E REGRAS DE NEGÓCIO (PREVENÇÃO DE PERDAS)
  // ============================================================
  const LISTA_LOJAS = [
    { codigo: "044", nome: "Jaboatão" }, { codigo: "046", nome: "Caruaru Centro" },
    { codigo: "076", nome: "Menino Marcelo" }, { codigo: "091", nome: "Garanhuns" },
    { codigo: "107", nome: "Imbiribeira" }, { codigo: "138", nome: "Serra Talhada" },
    { codigo: "152", nome: "Arapiraca" }, { codigo: "163", nome: "Caruaru Petrópolis" },
    { codigo: "179", nome: "Maceió Durval Góes" }, { codigo: "198", nome: "Cabo Sto Agostinho" },
    { codigo: "250", nome: "Petrolina" }, { codigo: "262", nome: "Boa Viagem" },
    { codigo: "284", nome: "Benfica" }, { codigo: "289", nome: "Maceió Farol" },
    { codigo: "290", nome: "Mangabeiras" }, { codigo: "077", nome: "João Pessoa" },
    { codigo: "083", nome: "Campina Grande" }, { codigo: "109", nome: "Paulista" },
    { codigo: "114", nome: "Natal" }, { codigo: "119", nome: "Camaragibe" },
    { codigo: "120", nome: "São Gonçalo do Amarante" }, { codigo: "204", nome: "Recife" },
    { codigo: "207", nome: "João Pessoa - Cabedelo" }, { codigo: "238", nome: "Olinda Yara Brasil" },
    { codigo: "268", nome: "Maria Lacerda" }, { codigo: "298", nome: "Natal Ponta Negra" },
    { codigo: "300", nome: "Epitácio Pessoa" }, { codigo: "305", nome: "Campina Grande Mirante" },
    { codigo: "333", nome: "Mossoró" }
  ];

  const INDICADORES = ["quebra", "auditoria", "validade", "inventario"];

  // Metas e pesos estruturados conforme padrão operacional da área de Prevenção
  const METAS_PREV = {
    quebra:     { operacao: "menor_igual", target: 0.45, peso: 3 }, // Até 0,45% | Peso 3
    auditoria:  { operacao: "maior_igual", target: 92.0, peso: 2 }, // Mínimo 92%  | Peso 2
    validade:   { operacao: "menor_igual", target: 0.10, peso: 2 }, // Até 0,10% | Peso 2
    inventario: { operacao: "maior_igual", target: 98.0, peso: 3 }  // Mínimo 98%  | Peso 3
  };

  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  let mesAtivo = "0";
  let dbPrev = {};

  function inicializarDados() {
    const salvos = localStorage.getItem("po_db_prevencao_ne");
    if (salvos) {
      dbPrev = JSON.parse(salvos);
    } else {
      dbPrev = {};
      MESES.forEach((_, index) => {
        dbPrev[index] = {};
        LISTA_LOJAS.forEach(loja => {
          dbPrev[index][loja.codigo] = {};
          INDICADORES.forEach(ind => {
            dbPrev[index][loja.codigo][ind] = "";
          });
        });
      });
      salvarNoStorage();
    }
  }

  function salvarNoStorage() {
    localStorage.setItem("po_db_prevencao_ne", JSON.stringify(dbPrev));
  }

  function converterInputParaNumero(valorStr) {
    if (!valorStr || valorStr.trim() === "") return null;
    let limpo = valorStr.replace("%", "").replace(/\s/g, "").replace(",", ".");
    let num = parseFloat(limpo);
    return isNaN(num) ? null : num;
  }

  // ============================================================
  // ⚡ COMPONENTES DE INTERFACE E ENGENHARIA REATIVA
  // ============================================================
  function criarFiltrosEstrutura() {
    const containerFiltros = document.createElement("div");
    containerFiltros.className = "po-prev-filtros";

    // Seletor de Mês Único (Sem o seletor de ano conforme solicitado)
    const divMes = document.createElement("div");
    divMes.className = "po-prev-control";
    divMes.innerHTML = `<label>Mês de Referência</label>`;
    const selectMes = document.createElement("select");
    selectMes.className = "po-prev-select";
    MESES.forEach((mes, idx) => {
      const opt = document.createElement("option");
      opt.value = idx; opt.textContent = mes;
      if (idx.toString() === mesAtivo) opt.selected = true;
      selectMes.appendChild(opt);
    });
    selectMes.addEventListener("change", (e) => {
      mesAtivo = e.target.value;
      atualizarTabelaCorpo();
    });
    divMes.appendChild(selectMes);

    containerFiltros.appendChild(divMes);
    return containerFiltros;
  }

  function atualizarTabelaCorpo() {
    const tbody = document.getElementById("po-prev-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    LISTA_LOJAS.forEach(loja => {
      if (!dbPrev[mesAtivo]) dbPrev[mesAtivo] = {};
      if (!dbPrev[mesAtivo][loja.codigo]) {
        dbPrev[mesAtivo][loja.codigo] = {};
        INDICADORES.forEach(ind => { dbPrev[mesAtivo][loja.codigo][ind] = ""; });
      }

      const registroLoja = dbPrev[mesAtivo][loja.codigo];
      const tr = document.createElement("tr");

      let htmlInputs = `
        <td style="text-align:center; font-weight:700;">${loja.codigo}</td>
        <td style="min-width:160px; font-weight:600; text-align:left; padding-left:10px;">${loja.nome}</td>
      `;

      INDICADORES.forEach(ind => {
        const valAtual = registroLoja[ind] || "";
        htmlInputs += `
          <td style="text-align:right;">
            <input type="text" class="po-prev-input in-prev-${ind}" value="${valAtual}" placeholder="0,00%">
          </td>
          <td style="text-align:center;"><span class="badge-prev-pts pts-prev-${ind}">-</span></td>
        `;
      });

      htmlInputs += `<td class="td-total-final total-prev-${loja.codigo}">0</td>`;
      tr.innerHTML = htmlInputs;
      tbody.appendChild(tr);

      // Listener matemático e comportamental em tempo real
      const processarCalculoLinha = () => {
        let totalPontosLoja = 0;

        INDICADORES.forEach(ind => {
          const inputEl = tr.querySelector(`.in-prev-${ind}`);
          const badgeEl = tr.querySelector(`.pts-prev-${ind}`);

          // Sincroniza em runtime a digitação com a memória local
          registroLoja[ind] = inputEl.value;

          const nValor = converterInputParaNumero(inputEl.value);
          const metaConfig = METAS_PREV[ind];

          if (nValor !== null) {
            let alcancou = false;
            if (metaConfig.operacao === "maior_igual") {
              alcancou = (nValor >= metaConfig.target);
            } else if (metaConfig.operacao === "menor_igual") {
              alcancou = (nValor <= metaConfig.target);
            }

            if (alcancou) {
              inputEl.className = "po-prev-input res-good";
              badgeEl.className = "badge-prev-pts ganhou";
              badgeEl.textContent = metaConfig.peso;
              totalPontosLoja += metaConfig.peso;
            } else {
              inputEl.className = "po-prev-input res-bad";
              badgeEl.className = "badge-prev-pts perdeu";
              badgeEl.textContent = "0";
            }
          } else {
            inputEl.className = "po-prev-input";
            badgeEl.className = "badge-prev-pts perdeu";
            badgeEl.textContent = "-";
          }
        });

        tr.querySelector(`.total-prev-${loja.codigo}`).textContent = totalPontosLoja;
        salvarNoStorage();
      };

      INDICADORES.forEach(ind => {
        tr.querySelector(`.in-prev-${ind}`).addEventListener("input", processarCalculoLinha);
      });

      processarCalculoLinha();
    });
  }

  function criarPainelEstrutura() {
    const wrapper = document.createElement('section');
    wrapper.className = 'painel-prev';
    wrapper.id = 'prevencao_painel';

    const title = document.createElement('h2');
    title.innerHTML = '<i class="fas fa-shield-alt" style="color:#d4af37"></i> LANÇAMENTOS - PREVENÇÃO DE PERDAS';
    wrapper.appendChild(title);

    wrapper.appendChild(criarFiltrosEstrutura());

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-prev-container';

    const table = document.createElement('table');
    table.className = 'table-prev';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr class="row-metas">
        <th rowspan="3" class="th-fixa" style="font-size:12px;">CÓDIGO</th>
        <th rowspan="3" class="th-fixa" style="font-size:12px; text-align:left; padding-left:10px;">LOJA</th>
        <th colspan="2">0,45%</th><th colspan="2">92%</th>
        <th colspan="2">0,10%</th><th colspan="2">98%</th>
        <th rowspan="3" class="th-total-pontos">TOTAL PONTOS</th>
      </tr>
      <tr class="row-indicadores">
        <th colspan="2">QUEBRA LÍQUIDA</th>
        <th colspan="2">AUDITORIA DE PROCESSOS</th>
        <th colspan="2">CONTROLE VALIDADE</th>
        <th colspan="2">INVENTÁRIO GLOBAL</th>
      </tr>
      <tr class="row-subheaders">
        <th>RESULTADO</th><th>PESO</th>
        <th>RESULTADO</th><th>PESO</th>
        <th>RESULTADO</th><th>PESO</th>
        <th>RESULTADO</th><th>PESO</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.id = "po-prev-tbody";
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    wrapper.appendChild(tableContainer);
    return wrapper;
  }

  // ============================================================
  // 🚪 EXPOSIÇÃO PÚBLICA E ENGRENAGEM DE ROTEAMENTO
  // ============================================================
  window.renderPrevTable = function (target) {
    inicializarDados();

    let container = null;
    if (typeof target === 'string') container = document.querySelector(target);
    else if (target instanceof HTMLElement) container = target;
    else container = document.getElementById('conteudo') || document.body;

    if (!container) return;
    
    const existing = document.getElementById('prevencao_painel');
    if (existing) existing.remove();

    const section = criarPainelEstrutura();
    container.appendChild(section);

    atualizarTabelaCorpo();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('conteudo');
    if (main && (main.innerHTML.trim() === '' || main.innerHTML.includes('Carregando'))) {
      main.innerHTML = '';
      window.renderPrevTable(main);
    }
  });
})();

// Acionador oficial chamado via clique no seu sidebar-painel-ouro.js
window.poLancPrevencao = function() {
  const container = document.getElementById('conteudo');
  if (container) container.innerHTML = ''; 
  window.renderPrevTable(container);
};