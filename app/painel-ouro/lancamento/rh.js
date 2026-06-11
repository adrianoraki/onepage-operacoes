// app/painel-ouro/rh.js

(function () {
  // ============================================================
  // 🎨 INJEÇÃO DE ESTILOS PREMIUM (Adaptado ao layout de RH)
  // ============================================================
  (function poRhGarantirEstilos() {
    if (document.getElementById("po-rh-styles")) return;
    const s = document.createElement("style");
    s.id = "po-rh-styles";
    s.textContent = `
      .painel-rh {
        background: linear-gradient(180deg, #0f1418 0%, #12161a 100%);
        color: #f4e7b2;
        border: 1px solid rgba(212,175,55,0.12);
        padding: 18px;
        border-radius: 10px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6);
        margin: 18px 0;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .painel-rh h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #ffd966;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .po-rh-filtros {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        background: rgba(255,255,255,0.02);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.05);
      }

      .po-rh-control {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .po-rh-control label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(201,162,39,0.6);
        font-weight: 700;
      }

      .po-rh-select {
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

      .po-rh-select:focus { border-color: #ffd966; }

      .table-rh-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.1);
      }

      .table-rh {
        width: 100%;
        border-collapse: collapse;
        min-width: 1300px;
      }

      /* Cabeçalho Multi-nível fiel à planilha da imagem */
      .table-rh thead th {
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

      .table-rh tbody td {
        padding: 6px 8px;
        font-size: 13px;
        color: #e9e1b8;
        border: 1px solid rgba(255,255,255,0.04);
        background: rgba(0,0,0,0.1);
      }

      .table-rh tbody tr:hover td {
        background: rgba(212,175,55,0.03);
        color: #fff;
      }

      .po-rh-input {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(212,175,55,0.15);
        color: #fff;
        padding: 4px 6px;
        border-radius: 4px;
        width: 75px;
        font-family: inherit;
        font-size: 12px;
        text-align: right;
        transition: all 0.15s;
      }

      .po-rh-input:focus {
        background: #161c22;
        border-color: #ffd966;
        box-shadow: 0 0 6px rgba(255,217,102,0.3);
        outline: none;
      }

      .badge-rh-pts {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 11px;
        min-width: 20px;
        text-align: center;
      }
      .badge-rh-pts.ganhou { background: #2e7d32; color: #fff; }
      .badge-rh-pts.perdeu { background: rgba(255,255,255,0.05); color: #888; }

      .res-good { color: #9be67a; font-weight:700; }
      .res-bad  { color: #ff8a8a; font-weight:700; }
      .td-total-final { font-weight: 800; color: #ffd966; text-align: center; background: rgba(212,175,55,0.05) !important; }
    `;
    document.head.appendChild(s);
  })();

  // ============================================================
  // 🗄️ MAPA DE LOJAS E REGRAS DE NEGÓCIO DO RH
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

  const INDICADORES = ["turnover", "exames", "pcd", "bh", "integracao"];

  // Configuração das metas conforme a linha superior da imagem
  const METAS_RH = {
    turnover:   { operacao: "menor_igual", target: 4.0 },   // Até 4,00% ganha pontos
    exames:     { operacao: "maior_igual", target: 90.0 },  // Mínimo de 90%
    pcd:        { operacao: "maior_igual", target: 5.0 },   // Mínimo de 5%
    bh:         { operacao: "menor_igual", target: 150.0 }, // Até 150 horas acumuladas
    integracao: { operacao: "maior_igual", target: 100.0 }  // Mínimo de 100%
  };

  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  let anoAtivo = "2025";
  let mesAtivo = "0";
  let dbRh = {};

  function inicializarDados() {
    const salvos = localStorage.getItem("po_db_rh_ne");
    if (salvos) {
      dbRh = JSON.parse(salvos);
    } else {
      ["2025", "2026", "2027"].forEach(ano => {
        dbRh[ano] = {};
        MESES.forEach((_, index) => {
          dbRh[ano][index] = {};
          LISTA_LOJAS.forEach(loja => {
            dbRh[ano][index][loja.codigo] = {};
            INDICADORES.forEach(ind => {
              dbRh[ano][index][loja.codigo][ind] = "";
            });
          });
        });
      });
      salvarNoStorage();
    }
  }

  function salvarNoStorage() {
    localStorage.setItem("po_db_rh_ne", JSON.stringify(dbRh));
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
    containerFiltros.className = "po-rh-filtros";

    // Seletor de Ano
    const divAno = document.createElement("div");
    divAno.className = "po-rh-control";
    divAno.innerHTML = `<label>Ano base</label>`;
    const selectAno = document.createElement("select");
    selectAno.className = "po-rh-select";
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
    divMes.className = "po-rh-control";
    divMes.innerHTML = `<label>Mês de Referência</label>`;
    const selectMes = document.createElement("select");
    selectMes.className = "po-rh-select";
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
    const tbody = document.getElementById("po-rh-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    LISTA_LOJAS.forEach(loja => {
      if (!dbRh[anoAtivo]) dbRh[anoAtivo] = {};
      if (!dbRh[anoAtivo][mesAtivo]) dbRh[anoAtivo][mesAtivo] = {};
      if (!dbRh[anoAtivo][mesAtivo][loja.codigo]) {
        dbRh[anoAtivo][mesAtivo][loja.codigo] = {};
        INDICADORES.forEach(ind => { dbRh[anoAtivo][mesAtivo][loja.codigo][ind] = ""; });
      }

      const registroLoja = dbRh[anoAtivo][mesAtivo][loja.codigo];
      const tr = document.createElement("tr");

      let htmlInputs = `
        <td style="text-align:center; font-weight:700;">${loja.codigo}</td>
        <td style="min-width:160px; font-weight:600; text-align:left; padding-left:10px;">${loja.nome}</td>
      `;

      INDICADORES.forEach(ind => {
        const valAtual = registroLoja[ind] || "";
        htmlInputs += `
          <td style="text-align:right;">
            <input type="text" class="po-rh-input in-rh-${ind}" value="${valAtual}" placeholder="-">
          </td>
          <td style="text-align:center;"><span class="badge-rh-pts pts-rh-${ind}">-</span></td>
        `;
      });

      htmlInputs += `<td class="td-total-final total-rh-${loja.codigo}">0</td>`;
      tr.innerHTML = htmlInputs;
      tbody.appendChild(tr);

      // Função de processamento matemático em tempo real da linha
      const processarCalculoLinha = () => {
        let totalPontosLoja = 0;

        INDICADORES.forEach(ind => {
          const inputEl = tr.querySelector(`.in-rh-${ind}`);
          const badgeEl = tr.querySelector(`.pts-rh-${ind}`);

          // Persiste o caractere atual digitado na memória RAM do app
          registroLoja[ind] = inputEl.value;

          const nValor = converterInputParaNumero(inputEl.value);
          const metaConfig = METAS_RH[ind];

          if (nValor !== null) {
            let alcancou = false;
            if (metaConfig.operacao === "maior_igual") {
              alcancou = (nValor >= metaConfig.target);
            } else if (metaConfig.operacao === "menor_igual") {
              alcancou = (nValor <= metaConfig.target);
            }

            if (alcancou) {
              inputEl.className = "po-rh-input res-good";
              badgeEl.className = "badge-rh-pts ganhou";
              badgeEl.textContent = "2"; // Peso fixo 2 pontos conforme imagem
              totalPontosLoja += 2;
            } else {
              inputEl.className = "po-rh-input res-bad";
              badgeEl.className = "badge-rh-pts perdeu";
              badgeEl.textContent = "0";
            }
          } else {
            inputEl.className = "po-rh-input";
            badgeEl.className = "badge-rh-pts perdeu";
            badgeEl.textContent = "-";
          }
        });

        tr.querySelector(`.total-rh-${loja.codigo}`).textContent = totalPontosLoja;
        salvarNoStorage();
      };

      // Vincular listeners de teclado para o monitoramento
      INDICADORES.forEach(ind => {
        tr.querySelector(`.in-rh-${ind}`).addEventListener("input", processarCalculoLinha);
      });

      // Executa cálculo inicial (para resgatar dados prévios salvos)
      processarCalculoLinha();
    });
  }

  function criarPainelEstrutura() {
    const wrapper = document.createElement('section');
    wrapper.className = 'painel-rh';
    wrapper.id = 'rh';

    const title = document.createElement('h2');
    title.innerHTML = '<i class="fas fa-users" style="color:#d4af37"></i> LANÇAMENTOS - RECURSOS HUMANOS (RH)';
    wrapper.appendChild(title);

    wrapper.appendChild(criarFiltrosEstrutura());

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-rh-container';

    const table = document.createElement('table');
    table.className = 'table-rh';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr class="row-metas">
        <th rowspan="3" class="th-fixa" style="font-size:12px;">CÓDIGO</th>
        <th rowspan="3" class="th-fixa" style="font-size:12px; text-align:left; padding-left:10px;">LOJA</th>
        <th colspan="2">4,00%</th><th colspan="2">90%</th>
        <th colspan="2">5%</th><th colspan="2">150</th>
        <th colspan="2">100%</th>
        <th rowspan="3" class="th-total-pontos">TOTAL PONTOS</th>
      </tr>
      <tr class="row-indicadores">
        <th colspan="2">TURNOVER</th>
        <th colspan="2">EXAMES PERIÓDICOS</th>
        <th colspan="2">PCD</th>
        <th colspan="2">BH (BANCO DE HORAS)</th>
        <th colspan="2">INTEGRAÇÃO PRESENCIAL</th>
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
    tbody.id = "po-rh-tbody";
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    wrapper.appendChild(tableContainer);
    return wrapper;
  }

  // ============================================================
  // 🚪 EXPOSIÇÃO PÚBLICA E ROTEAMENTO GLOBAL
  // ============================================================
  window.renderRHTable = function (target) {
    inicializarDados();

    let container = null;
    if (typeof target === 'string') container = document.querySelector(target);
    else if (target instanceof HTMLElement) container = target;
    else container = document.getElementById('conteudo') || document.body;

    if (!container) return;
    
    const existing = document.getElementById('rh');
    if (existing) existing.remove();

    const section = criarPainelEstrutura();
    container.appendChild(section);

    atualizarTabelaCorpo();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('conteudo');
    if (main && (main.innerHTML.trim() === '' || main.innerHTML.includes('Carregando'))) {
      main.innerHTML = '';
      window.renderRHTable(main);
    }
  });
})();

// Conector oficial acionado pela rota "rh" do seu Sidebar Ouro
window.poLancRH = function() {
  const container = document.getElementById('conteudo');
  if (container) container.innerHTML = ''; 
  window.renderRHTable(container);
};