// app/painel-ouro/frente-caixa.js

(function () {
  // ============================================================
  // 🎨 INJEÇÃO DE ESTILOS PREMIUM (Adaptado ao layout de Frente de Caixa)
  // ============================================================
  (function poFcGarantirEstilos() {
    if (document.getElementById("po-fc-styles")) return;
    const s = document.createElement("style");
    s.id = "po-fc-styles";
    s.textContent = `
      .painel-fc {
        background: linear-gradient(180deg, #0f1418 0%, #12161a 100%);
        color: #f4e7b2;
        border: 1px solid rgba(212,175,55,0.12);
        padding: 18px;
        border-radius: 10px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6);
        margin: 18px 0;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .painel-fc h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #ffd966;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .po-fc-filtros {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        background: rgba(255,255,255,0.02);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.05);
      }

      .po-fc-control {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .po-fc-control label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(201,162,39,0.6);
        font-weight: 700;
      }

      .po-fc-select {
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

      .po-fc-select:focus { border-color: #ffd966; }

      .table-fc-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.1);
      }

      .table-fc {
        width: 100%;
        border-collapse: collapse;
        min-width: 1100px;
      }

      /* Cabeçalho de alta fidelidade multi-nível */
      .table-fc thead th {
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

      .table-fc tbody td {
        padding: 6px 8px;
        font-size: 13px;
        color: #e9e1b8;
        border: 1px solid rgba(255,255,255,0.04);
        background: rgba(0,0,0,0.1);
      }

      .table-fc tbody tr:hover td {
        background: rgba(212,175,55,0.03);
        color: #fff;
      }

      .po-fc-input {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(212,175,55,0.15);
        color: #fff;
        padding: 4px 6px;
        border-radius: 4px;
        width: 85px;
        font-family: inherit;
        font-size: 12px;
        text-align: right;
        transition: all 0.15s;
      }

      .po-fc-input:focus {
        background: #161c22;
        border-color: #ffd966;
        box-shadow: 0 0 6px rgba(255,217,102,0.3);
        outline: none;
      }

      .badge-fc-pts {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 11px;
        min-width: 20px;
        text-align: center;
      }
      .badge-fc-pts.ganhou { background: #2e7d32; color: #fff; }
      .badge-fc-pts.perdeu { background: rgba(255,255,255,0.05); color: #888; }

      .res-good { color: #9be67a; font-weight:700; }
      .res-bad  { color: #ff8a8a; font-weight:700; }
      .td-total-final { font-weight: 800; color: #ffd966; text-align: center; background: rgba(212,175,55,0.05) !important; }
    `;
    document.head.appendChild(s);
  })();

  // ============================================================
  // 🗄️ MAPA DE LOJAS E REGRAS DE NEGÓCIO (FRENTE DE CAIXA)
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

  const INDICADORES = ["cancelamento", "faixa_hora", "descontos"];

  // Configuração extraída diretamente da imagem image_db2898.png
  const METAS_FC = {
    cancelamento: { operacao: "menor_igual", target: 200000.0, peso: 3 }, // Limite tolerado: R$ 200.000,00
    faixa_hora:   { operacao: "maior_igual", target: 70.0, peso: 4 },     // Eficiência mínima: 70%
    descontos:    { operacao: "menor_igual", target: 1500.0, peso: 3 }     // Teto aceitável: R$ 1.500,00
  };

  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  let anoAtivo = "2025";
  let mesAtivo = "0";
  let dbFc = {};

  function inicializarDados() {
    const salvos = localStorage.getItem("po_db_frente_caixa_ne");
    if (salvos) {
      dbFc = JSON.parse(salvos);
    } else {
      ["2025", "2026", "2027"].forEach(ano => {
        dbFc[ano] = {};
        MESES.forEach((_, index) => {
          dbFc[ano][index] = {};
          LISTA_LOJAS.forEach(loja => {
            dbFc[ano][index][loja.codigo] = {};
            INDICADORES.forEach(ind => {
              dbFc[ano][index][loja.codigo][ind] = "";
            });
          });
        });
      });
      salvarNoStorage();
    }
  }

  function salvarNoStorage() {
    localStorage.setItem("po_db_frente_caixa_ne", JSON.stringify(dbFc));
  }

  function converterInputParaNumero(valorStr) {
    if (!valorStr || valorStr.trim() === "") return null;
    // Sanitização completa eliminando R$, pontos de milhar e símbolos percentuais
    let limpo = valorStr.replace("R$", "").replace("%", "").replace(/\s/g, "");
    if (limpo.includes(",") && limpo.includes(".")) {
      limpo = limpo.replace(/\./g, "").replace(",", ".");
    } else {
      limpo = limpo.replace(",", ".");
    }
    let num = parseFloat(limpo);
    return isNaN(num) ? null : num;
  }

  // ============================================================
  // ⚡ COMPONENTES DE INTERFACE E ENGENHARIA REATIVA
  // ============================================================
  function criarFiltrosEstrutura() {
    const containerFiltros = document.createElement("div");
    containerFiltros.className = "po-fc-filtros";

    // Seletor de Ano
    const divAno = document.createElement("div");
    divAno.className = "po-fc-control";
    divAno.innerHTML = `<label>Ano base</label>`;
    const selectAno = document.createElement("select");
    selectAno.className = "po-fc-select";
    ["2025", "2026", "2027"].forEach(ano => {
      const opt = document.createElement("option");
      opt.value = ano; opt.textContent = ano;
      if (ano === anoAtivo) opt.selected = true;
      selectAno.appendChild(opt);
    });
    selectAno.addEventListener("change", (e) => {
      anoAtivo = e.target.value;
      atualizarTabelaCorpo();
    });
    divAno.appendChild(selectAno);

    // Seletor de Mês
    const divMes = document.createElement("div");
    divMes.className = "po-fc-control";
    divMes.innerHTML = `<label>Mês de Referência</label>`;
    const selectMes = document.createElement("select");
    selectMes.className = "po-fc-select";
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

    containerFiltros.appendChild(divAno);
    containerFiltros.appendChild(divMes);
    return containerFiltros;
  }

  function atualizarTabelaCorpo() {
    const tbody = document.getElementById("po-fc-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    LISTA_LOJAS.forEach(loja => {
      if (!dbFc[anoAtivo]) dbFc[anoAtivo] = {};
      if (!dbFc[anoAtivo][mesAtivo]) dbFc[anoAtivo][mesAtivo] = {};
      if (!dbFc[anoAtivo][mesAtivo][loja.codigo]) {
        dbFc[anoAtivo][mesAtivo][loja.codigo] = {};
        INDICADORES.forEach(ind => { dbFc[anoAtivo][mesAtivo][loja.codigo][ind] = ""; });
      }

      const registroLoja = dbFc[anoAtivo][mesAtivo][loja.codigo];
      const tr = document.createElement("tr");

      let htmlInputs = `
        <td style="text-align:center; font-weight:700;">${loja.codigo}</td>
        <td style="min-width:160px; font-weight:600; text-align:left; padding-left:10px;">${loja.nome}</td>
      `;

      INDICADORES.forEach(ind => {
        const valAtual = registroLoja[ind] || "";
        const placeholderText = ind === "faixa_hora" ? "0,00%" : "R$ 0,00";
        htmlInputs += `
          <td style="text-align:right;">
            <input type="text" class="po-fc-input in-fc-${ind}" value="${valAtual}" placeholder="${placeholderText}">
          </td>
          <td style="text-align:center;"><span class="badge-fc-pts pts-fc-${ind}">-</span></td>
        `;
      });

      htmlInputs += `<td class="td-total-final total-fc-${loja.codigo}">0</td>`;
      tr.innerHTML = htmlInputs;
      tbody.appendChild(tr);

      // Algoritmo matemático reativo por linha
      const processarCalculoLinha = () => {
        let totalPontosLoja = 0;

        INDICADORES.forEach(ind => {
          const inputEl = tr.querySelector(`.in-fc-${ind}`);
          const badgeEl = tr.querySelector(`.pts-fc-${ind}`);

          // Salva string digitada em tempo de execução
          registroLoja[ind] = inputEl.value;

          const nValor = converterInputParaNumero(inputEl.value);
          const metaConfig = METAS_FC[ind];

          if (nValor !== null) {
            let alcancou = false;
            if (metaConfig.operacao === "maior_igual") {
              alcancou = (nValor >= metaConfig.target);
            } else if (metaConfig.operacao === "menor_igual") {
              alcancou = (nValor <= metaConfig.target);
            }

            if (alcancou) {
              inputEl.className = "po-fc-input res-good";
              badgeEl.className = "badge-fc-pts ganhou";
              badgeEl.textContent = metaConfig.peso;
              totalPontosLoja += metaConfig.peso;
            } else {
              inputEl.className = "po-fc-input res-bad";
              badgeEl.className = "badge-fc-pts perdeu";
              badgeEl.textContent = "0";
            }
          } else {
            inputEl.className = "po-fc-input";
            badgeEl.className = "badge-fc-pts perdeu";
            badgeEl.textContent = "-";
          }
        });

        tr.querySelector(`.total-fc-${loja.codigo}`).textContent = totalPontosLoja;
        salvarNoStorage();
      };

      INDICADORES.forEach(ind => {
        tr.querySelector(`.in-fc-${ind}`).addEventListener("input", processarCalculoLinha);
      });

      // Executa batimento de carga inicial
      processarCalculoLinha();
    });
  }

  function criarPainelEstrutura() {
    const wrapper = document.createElement('section');
    wrapper.className = 'painel-fc';
    wrapper.id = 'frente_caixa_painel';

    const title = document.createElement('h2');
    title.innerHTML = '<i class="fas fa-calculator" style="color:#d4af37"></i> LANÇAMENTOS - FRENTE DE CAIXA';
    wrapper.appendChild(title);

    wrapper.appendChild(criarFiltrosEstrutura());

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-fc-container';

    const table = document.createElement('table');
    table.className = 'table-fc';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <!-- NÍVEL 1: GOALS / METAS (Conforme imagem image_db2898.png) -->
      <tr class="row-metas">
        <th rowspan="3" class="th-fixa" style="font-size:12px;">CÓDIGO</th>
        <th rowspan="3" class="th-fixa" style="font-size:12px; text-align:left; padding-left:10px;">LOJA</th>
        <th colspan="2">R$ 200.000,00</th>
        <th colspan="2">70%</th>
        <th colspan="2">R$ 1.500,00</th>
        <th rowspan="3" class="th-total-pontos">TOTAL PONTOS</th>
      </tr>
      <!-- NÍVEL 2: NOMES DOS INDICADORES -->
      <tr class="row-indicadores">
        <th colspan="2">CANCELAMENTO_ITEM</th>
        <th colspan="2">FAIXA HORA - 07:00 às 22:00</th>
        <th colspan="2">DESCONTOS FUNÇÃO_222</th>
      </tr>
      <!-- NÍVEL 3: SUB-HEADERS RESULTADO / PESO -->
      <tr class="row-subheaders">
        <th>RESULTADO</th><th>PESO</th>
        <th>RESULTADO</th><th>PESO</th>
        <th>RESULTADO</th><th>PESO</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.id = "po-fc-tbody";
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    wrapper.appendChild(tableContainer);
    return wrapper;
  }

  // ============================================================
  // 🚪 EXPOSIÇÃO PÚBLICA E ACOPLAMENTO COM SISTEMA DE ROTAS
  // ============================================================
  window.renderFrenteCaixaTable = function (target) {
    inicializarDados();

    let container = null;
    if (typeof target === 'string') container = document.querySelector(target);
    else if (target instanceof HTMLElement) container = target;
    else container = document.getElementById('conteudo') || document.body;

    if (!container) return;
    
    const existing = document.getElementById('frente_caixa_painel');
    if (existing) existing.remove();

    const section = criarPainelEstrutura();
    container.appendChild(section);

    atualizarTabelaCorpo();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('conteudo');
    if (main && (main.innerHTML.trim() === '' || main.innerHTML.includes('Carregando'))) {
      main.innerHTML = '';
      window.renderFrenteCaixaTable(main);
    }
  });
})();

// Ativador oficial disparado pelo arquivo sidebar-painel-ouro.js
window.poLancFrenteCaixa = function() {
  const container = document.getElementById('conteudo');
  if (container) container.innerHTML = ''; 
  window.renderFrenteCaixaTable(container);
};