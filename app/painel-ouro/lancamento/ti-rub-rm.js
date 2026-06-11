// app/painel-ouro/ti-rub-rm.js

(function () {
  // ============================================================
  // 🎨 INJEÇÃO DE ESTILOS PREMIUM (Adaptado ao layout de TI / RUB / RM)
  // ============================================================
  (function poTiGarantirEstilos() {
    if (document.getElementById("po-ti-styles")) return;
    const s = document.createElement("style");
    s.id = "po-ti-styles";
    s.textContent = `
      .painel-ti {
        background: linear-gradient(180deg, #0f1418 0%, #12161a 100%);
        color: #f4e7b2;
        border: 1px solid rgba(212,175,55,0.12);
        padding: 18px;
        border-radius: 10px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6);
        margin: 18px 0;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .painel-ti h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #ffd966;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .po-ti-filtros {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        background: rgba(255,255,255,0.02);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.05);
      }

      .po-ti-control {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .po-ti-control label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(201,162,39,0.6);
        font-weight: 700;
      }

      .po-ti-select {
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

      .po-ti-select:focus { border-color: #ffd966; }

      .table-ti-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.1);
      }

      .table-ti {
        width: 100%;
        border-collapse: collapse;
        min-width: 1300px;
      }

      /* Cabeçalho Multi-nível fiel à planilha */
      .table-ti thead th {
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

      .table-ti tbody td {
        padding: 6px 8px;
        font-size: 13px;
        color: #e9e1b8;
        border: 1px solid rgba(255,255,255,0.04);
        background: rgba(0,0,0,0.1);
      }

      .table-ti tbody tr:hover td {
        background: rgba(212,175,55,0.03);
        color: #fff;
      }

      .po-ti-input {
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

      .po-ti-input:focus {
        background: #161c22;
        border-color: #ffd966;
        box-shadow: 0 0 6px rgba(255,217,102,0.3);
        outline: none;
      }

      .badge-ti-pts {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 11px;
        min-width: 20px;
        text-align: center;
      }
      .badge-ti-pts.ganhou { background: #2e7d32; color: #fff; }
      .badge-ti-pts.perdeu { background: rgba(255,255,255,0.05); color: #888; }

      .res-good { color: #9be67a; font-weight:700; }
      .res-bad  { color: #ff8a8a; font-weight:700; }
      .td-total-final { font-weight: 800; color: #ffd966; text-align: center; background: rgba(212,175,55,0.05) !important; }
    `;
    document.head.appendChild(s);
  })();

  // ============================================================
  // 🗄️ MAPA DE LOJAS E REGRAS DE NEGÓCIO (TI / RUB / RM)
  // ============================================================
  const LISTA_LOJAS = [
    { codigo: "044", nome: "Jaboatão" }, { codigo: "046", nome: "Caruaru Centro" },
    { codigo: "076", nome: "Menino Marcelo" }, { codigo: "091", nome: "Garanhuns" },
    { codigo: "107", nome: "Imbiribeira" }, { codigo: "138", nome: "Serra Talhada" },
    { codigo: "152", nome: "Arapiraca" }, { codigo: "163", nome: "Caruaru Petrópolis" },
    { codigo: "179", nome: "Maceió Durval Góes" }, { codigo: "198", nome: "Cabo Sto Agostinho" },
    { codigo: "250", nome: "Petrolina" }, { codigo: "262", nome: "Boa Viagem" },
    { codigo: "284", nome: "Benfica" }, { codigo: "289", nome: "Maceió Farol" },
    { omnibus: "290", codigo: "290", nome: "Mangabeiras" }, { codigo: "077", nome: "João Pessoa" },
    { codigo: "083", nome: "Campina Grande" }, { codigo: "109", nome: "Paulista" },
    { codigo: "114", nome: "Natal" }, { codigo: "119", nome: "Camaragibe" },
    { codigo: "120", nome: "São Gonçalo do Amarante" }, { codigo: "204", nome: "Recife" },
    { codigo: "207", nome: "João Pessoa - Cabedelo" }, { codigo: "238", nome: "Olinda Yara Brasil" },
    { codigo: "268", nome: "Maria Lacerda" }, { codigo: "298", nome: "Natal Ponta Negra" },
    { codigo: "300", nome: "Epitácio Pessoa" }, { codigo: "305", nome: "Campina Grande Mirante" },
    { codigo: "333", nome: "Mossoró" }
  ];

  const INDICADORES = ["etiqueta", "ruptura", "psv", "descarga", "mau_uso"];

  // Configuração das metas extraídas diretamente da imagem enviada
  const METAS_TI = {
    etiqueta: { operacao: "menor_igual", target: 3.0, peso: 2 },  // Até 3% pontua
    ruptura:  { operacao: "menor_igual", target: 3.0, peso: 2 },  // Até 3% pontua
    psv:      { operacao: "menor_igual", target: 5.0, peso: 3 },  // Até 5% pontua
    descarga: { operacao: "maior_igual", target: 100.0, peso: 2 }, // Mínimo de 100%
    mau_uso:  { operacao: "menor_igual", target: 500.0, peso: 1 }  // Até R$ 500,00 tolerado
  };

  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  let anoAtivo = "2025";
  let mesAtivo = "0";
  let dbTi = {};

  function inicializarDados() {
    const salvos = localStorage.getItem("po_db_ti_rub_rm_ne");
    if (salvos) {
      dbTi = JSON.parse(salvos);
    } else {
      ["2025", "2026", "2027"].forEach(ano => {
        dbTi[ano] = {};
        MESES.forEach((_, index) => {
          dbTi[ano][index] = {};
          LISTA_LOJAS.forEach(loja => {
            dbTi[ano][index][loja.codigo] = {};
            INDICADORES.forEach(ind => {
              dbTi[ano][index][loja.codigo][ind] = "";
            });
          });
        });
      });
      salvarNoStorage();
    }
  }

  function salvarNoStorage() {
    localStorage.setItem("po_db_ti_rub_rm_ne", JSON.stringify(dbTi));
  }

  function converterInputParaNumero(valorStr) {
    if (!valorStr || valorStr.trim() === "") return null;
    let limpo = valorStr.replace("R$", "").replace("%", "").replace(/\s/g, "").replace(",", ".");
    let num = parseFloat(limpo);
    return isNaN(num) ? null : num;
  }

  // ============================================================
  // ⚡ COMPONENTES DE INTERFACE E ENGENHARIA REATIVA
  // ============================================================
  function criarFiltrosEstrutura() {
    const containerFiltros = document.createElement("div");
    containerFiltros.className = "po-ti-filtros";

    // Seletor de Ano
    const divAno = document.createElement("div");
    divAno.className = "po-ti-control";
    divAno.innerHTML = `<label>Ano base</label>`;
    const selectAno = document.createElement("select");
    selectAno.className = "po-ti-select";
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
    divMes.className = "po-ti-control";
    divMes.innerHTML = `<label>Mês de Referência</label>`;
    const selectMes = document.createElement("select");
    selectMes.className = "po-ti-select";
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
    const tbody = document.getElementById("po-ti-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    LISTA_LOJAS.forEach(loja => {
      if (!dbTi[anoAtivo]) dbTi[anoAtivo] = {};
      if (!dbTi[anoAtivo][mesAtivo]) dbTi[anoAtivo][mesAtivo] = {};
      if (!dbTi[anoAtivo][mesAtivo][loja.codigo]) {
        dbTi[anoAtivo][mesAtivo][loja.codigo] = {};
        INDICADORES.forEach(ind => { dbTi[anoAtivo][mesAtivo][loja.codigo][ind] = ""; });
      }

      const registroLoja = dbTi[anoAtivo][mesAtivo][loja.codigo];
      const tr = document.createElement("tr");

      let htmlInputs = `
        <td style="text-align:center; font-weight:700;">${loja.codigo}</td>
        <td style="min-width:160px; font-weight:600; text-align:left; padding-left:10px;">${loja.nome}</td>
      `;

      INDICADORES.forEach(ind => {
        const valAtual = registroLoja[ind] || "";
        htmlInputs += `
          <td style="text-align:right;">
            <input type="text" class="po-ti-input in-ti-${ind}" value="${valAtual}" placeholder="-">
          </td>
          <td style="text-align:center;"><span class="badge-ti-pts pts-ti-${ind}">-</span></td>
        `;
      });

      htmlInputs += `<td class="td-total-final total-ti-${loja.codigo}">0</td>`;
      tr.innerHTML = htmlInputs;
      tbody.appendChild(tr);

      // Algoritmo matemático de cálculo em tempo real
      const processarCalculoLinha = () => {
        let totalPontosLoja = 0;

        INDICADORES.forEach(ind => {
          const inputEl = tr.querySelector(`.in-ti-${ind}`);
          const badgeEl = tr.querySelector(`.pts-ti-${ind}`);

          // Salva digitação bruta em tempo de execução
          registroLoja[ind] = inputEl.value;

          const nValor = converterInputParaNumero(inputEl.value);
          const metaConfig = METAS_TI[ind];

          if (nValor !== null) {
            let alcancou = false;
            if (metaConfig.operacao === "maior_igual") {
              alcancou = (nValor >= metaConfig.target);
            } else if (metaConfig.operacao === "menor_igual") {
              alcancou = (nValor <= metaConfig.target);
            }

            if (alcancou) {
              inputEl.className = "po-ti-input res-good";
              badgeEl.className = "badge-ti-pts ganhou";
              badgeEl.textContent = metaConfig.peso;
              totalPontosLoja += metaConfig.peso;
            } else {
              inputEl.className = "po-ti-input res-bad";
              badgeEl.className = "badge-ti-pts perdeu";
              badgeEl.textContent = "0";
            }
          } else {
            inputEl.className = "po-ti-input";
            badgeEl.className = "badge-ti-pts perdeu";
            badgeEl.textContent = "-";
          }
        });

        tr.querySelector(`.total-ti-${loja.codigo}`).textContent = totalPontosLoja;
        salvarNoStorage();
      };

      INDICADORES.forEach(ind => {
        tr.querySelector(`.in-ti-${ind}`).addEventListener("input", processarCalculoLinha);
      });

      // Roda cálculo de carregamento inicial
      processarCalculoLinha();
    });
  }

  function criarPainelEstrutura() {
    const wrapper = document.createElement('section');
    wrapper.className = 'painel-ti';
    wrapper.id = 'ti_rub_rm';

    const title = document.createElement('h2');
    title.innerHTML = '<i class="fas fa-barcode" style="color:#d4af37"></i> LANÇAMENTOS - TI / RUB / RM';
    wrapper.appendChild(title);

    wrapper.appendChild(criarFiltrosEstrutura());

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-ti-container';

    const table = document.createElement('table');
    table.className = 'table-ti';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr class="row-metas">
        <th rowspan="3" class="th-fixa" style="font-size:12px;">CÓDIGO</th>
        <th rowspan="3" class="th-fixa" style="font-size:12px; text-align:left; padding-left:10px;">LOJA</th>
        <th colspan="2">3%</th><th colspan="2">3%</th>
        <th colspan="2">5%</th><th colspan="2">100%</th>
        <th colspan="2">R$ 500,00</th>
        <th rowspan="3" class="th-total-pontos">TOTAL PONTOS</th>
      </tr>
      <tr class="row-indicadores">
        <th colspan="2">ETIQUETA</th>
        <th colspan="2">RUPTURA FINAL</th>
        <th colspan="2">PSV</th>
        <th colspan="2">DESCARGA (R$ META)</th>
        <th colspan="2">MAU USO (EQ, TI)</th>
      </tr>
      <tr class="row-subheaders">
        <th>RESULTADO</th><th>PESO</th>
        <th>RESULTADO</th><th>PESO</th>
        <th>RESULTADO</th><th>PESO</th>
        <th>RESULTADO</th><th>PESO</th>
        <th>RESULTADO</th><th>PESO</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.id = "po-ti-tbody";
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    wrapper.appendChild(tableContainer);
    return wrapper;
  }

  // ============================================================
  // 🚪 EXPOSIÇÃO PÚBLICA E ACOPLAMENTO COM SIDEBAR
  // ============================================================
  window.renderTITable = function (target) {
    inicializarDados();

    let container = null;
    if (typeof target === 'string') container = document.querySelector(target);
    else if (target instanceof HTMLElement) container = target;
    else container = document.getElementById('conteudo') || document.body;

    if (!container) return;
    
    const existing = document.getElementById('ti_rub_rm');
    if (existing) existing.remove();

    const section = criarPainelEstrutura();
    container.appendChild(section);

    atualizarTabelaCorpo();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('conteudo');
    if (main && (main.innerHTML.trim() === '' || main.innerHTML.includes('Carregando'))) {
      main.innerHTML = '';
      window.renderTITable(main);
    }
  });
})();

// Ativador oficial disparado por poSbClicarArea('ti_rub_rm') no sidebar-painel-ouro.js
window.poLancTiRubRm = function() {
  const container = document.getElementById('conteudo');
  if (container) container.innerHTML = ''; 
  window.renderTITable(container);
};