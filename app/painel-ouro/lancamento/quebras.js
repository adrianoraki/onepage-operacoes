// app/painel-ouro/quebras.js

(function () {
  // ============================================================
  // 🎨 INJEÇÃO DE ESTILOS ADICIONAIS (Mantendo o mesmo padrão)
  // ============================================================
  (function garantirEstilosQuebras() {
    if (document.getElementById("quebras-styles")) return;
    const s = document.createElement("style");
    s.id = "quebras-styles";
    s.textContent = `
      .painel-quebras {
        background: linear-gradient(180deg,#0f1418 0%, #12161a 100%);
        color: #f4e7b2;
        border: 1px solid rgba(212,175,55,0.12);
        padding: 18px;
        border-radius: 10px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6);
        margin: 18px 0;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .painel-quebras h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #ffd966;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .po-quebras-filtros {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        background: rgba(255,255,255,0.02);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.05);
      }

      .po-quebras-control {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .po-quebras-control label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(201,162,39,0.6);
        font-weight: 700;
      }

      .po-quebras-select {
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

      .po-quebras-select:focus {
        border-color: #ffd966;
      }

      .table-quebras-container {
        overflow-x: auto;
      }

      .table-quebras {
        width: 100%;
        border-collapse: collapse;
        border-radius: 8px;
        overflow: hidden;
      }

      .table-quebras thead th {
        background: linear-gradient(90deg, rgba(212,175,55,0.06), rgba(255,215,0,0.02));
        color: #f4e7b2;
        font-weight: 700;
        font-size: 13px;
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }

      .table-quebras thead th.center, .table-quebras tbody td.center {
        text-align: center;
      }

      .table-quebras thead th.right, .table-quebras tbody td.right {
        text-align: right;
      }

      .table-quebras tbody td {
        padding: 8px 12px;
        font-size: 13px;
        color: #e9e1b8;
        border-bottom: 1px solid rgba(255,255,255,0.03);
      }

      .table-quebras tbody tr:hover td {
        background: rgba(212,175,55,0.03);
        color: #fff;
      }

      .po-quebras-input {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(212,175,55,0.15);
        color: #fff;
        padding: 5px 8px;
        border-radius: 4px;
        width: 130px;
        font-family: inherit;
        font-size: 13px;
        text-align: right;
        transition: all 0.15s;
      }

      .po-quebras-input:focus {
        background: #161c22;
        border-color: #ffd966;
        box-shadow: 0 0 8px rgba(255,217,102,0.2);
        outline: none;
      }

      .badge-yes {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 999px;
        background: linear-gradient(90deg,#d4af37,#f4d35e);
        color: #2b1f00;
        font-weight: 700;
        font-size: 12px;
      }

      .badge-no {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(255,255,255,0.04);
        color: #cfc6a0;
        font-weight: 600;
        font-size: 12px;
      }

      .result-good { color: #9be67a; font-weight:700; }
      .result-bad  { color: #ff8a8a; font-weight:700; }

      @media (max-width: 768px) {
        .po-quebras-filtros { flex-direction: column; align-items: stretch; }
      }
    `;
    document.head.appendChild(s);
  })();

  // ============================================================
  // 🗄️ CONFIGURAÇÕES E ESTADO DE DADOS
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

  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  let anoAtivo = "2025";
  let mesAtivo = "0";
  let dbQuebras = {}; // Banco de dados isolado para quebras

  function inicializarDados() {
    const salvos = localStorage.getItem("po_db_quebras");
    if (salvos) {
      dbQuebras = JSON.parse(salvos);
    } else {
      ["2025", "2026", "2027"].forEach(ano => {
        dbQuebras[ano] = {};
        MESES.forEach((_, index) => {
          dbQuebras[ano][index] = {};
          LISTA_LOJAS.forEach(loja => {
            dbQuebras[ano][index][loja.codigo] = { meta: 0, realizado: 0 };
          });
        });
      });
      salvarNoStorage();
    }
  }

  function salvarNoStorage() {
    localStorage.setItem("po_db_quebras", JSON.stringify(dbQuebras));
  }

  // ============================================================
  // ⚡ COMPONENTES INTERNOS DE RENDERIZAÇÃO
  // ============================================================
  function criarFiltrosEstrutura() {
    const containerFiltros = document.createElement("div");
    containerFiltros.className = "po-quebras-filtros";

    // Seletor de Ano
    const divAno = document.createElement("div");
    divAno.className = "po-quebras-control";
    divAno.innerHTML = `<label>Ano base</label>`;
    const selectAno = document.createElement("select");
    selectAno.className = "po-quebras-select";
    
    const anoAtual = new Date().getFullYear();
    const anosDisponiveis = ["2025", "2026", "2027"];
    if (!anosDisponiveis.includes(anoAtual.toString())) {
      anosDisponiveis.push(anoAtual.toString());
    }

    anosDisponiveis.forEach(ano => {
      const opt = document.createElement("option");
      opt.value = ano;
      opt.textContent = ano;
      if (ano === anoAtivo) opt.selected = true;
      selectAno.appendChild(opt);
    });

    selectAno.addEventListener("change", (e) => {
      anoAtivo = e.target.value;
      if (!dbQuebras[anoAtivo]) {
        dbQuebras[anoAtivo] = {};
        MESES.forEach((_, index) => {
          dbQuebras[anoAtivo][index] = {};
          LISTA_LOJAS.forEach(loja => {
            dbQuebras[anoAtivo][index][loja.codigo] = { meta: 0, realizado: 0 };
          });
        });
        salvarNoStorage();
      }
      atualizarTabelaCorpo();
    });
    divAno.appendChild(selectAno);

    // Seletor de Mês
    const divMes = document.createElement("div");
    divMes.className = "po-quebras-control";
    divMes.innerHTML = `<label>Mês de Referência</label>`;
    const selectMes = document.createElement("select");
    selectMes.className = "po-quebras-select";

    MESES.forEach((mes, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = mes;
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
    const tbody = document.getElementById("po-quebras-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const calculosDisponiveis = !!window.poCalculos;

    LISTA_LOJAS.forEach(loja => {
      if (!dbQuebras[anoAtivo]) dbQuebras[anoAtivo] = {};
      if (!dbQuebras[anoAtivo][mesAtivo]) dbQuebras[anoAtivo][mesAtivo] = {};
      if (!dbQuebras[anoAtivo][mesAtivo][loja.codigo]) {
        dbQuebras[anoAtivo][mesAtivo][loja.codigo] = { meta: 0, realizado: 0 };
      }

      const registro = dbQuebras[anoAtivo][mesAtivo][loja.codigo];

      const valorMetaExibir = calculosDisponiveis && registro.meta > 0 ? window.poCalculos.formatarMoeda(registro.meta) : "";
      const valorRealizadoExibir = calculosDisponiveis && registro.realizado > 0 ? window.poCalculos.formatarMoeda(registro.realizado) : "";

      const tr = document.createElement("tr");
      tr.dataset.codigo = loja.codigo;

      tr.innerHTML = `
        <td>${loja.codigo}</td>
        <td>${loja.nome}</td>
        <td class="right"><input type="text" class="po-quebras-input input-meta" value="${valorMetaExibir}" placeholder="0,00"></td>
        <td class="right"><input type="text" class="po-quebras-input input-realizado" value="${valorRealizadoExibir}" placeholder="0,00"></td>
        <td class="right td-resultado">---</td>
        <td class="center td-pontos">---</td>
      `;

      tbody.appendChild(tr);

      const inMeta = tr.querySelector(".input-meta");
      const inRealizado = tr.querySelector(".input-realizado");
      const tdResultado = tr.querySelector(".td-resultado");
      const tdPontos = tr.querySelector(".td-pontos");

      const gerenciarFluxoInput = (evento) => {
        if (!window.poCalculos) return;

        if (evento && evento.target) {
          window.poCalculos.mascaraMoeda(evento.target);
        }

        const vMeta = window.poCalculos.converterParaNumero(inMeta.value);
        const vRealizado = window.poCalculos.converterParaNumero(inRealizado.value);

        dbQuebras[anoAtivo][mesAtivo][loja.codigo].meta = vMeta;
        dbQuebras[anoAtivo][mesAtivo][loja.codigo].realizado = vRealizado;
        salvarNoStorage();

        if (vMeta === 0 && vRealizado === 0) {
          tdResultado.textContent = "---";
          tdResultado.className = "right";
          tdPontos.innerHTML = `<span class="badge-no">0</span>`;
          return;
        }

        // Cálculo da quebra em percentual provisório
        let resultadoPorcentagem = 0;
        if (vMeta > 0) {
          resultadoPorcentagem = (vRealizado / vMeta) * 100;
        }

        tdResultado.textContent = resultadoPorcentagem.toFixed(2).replace('.', ',') + "%";

        // REGRA DE QUEBRA INVERTIDA: Ficar ABAIXO ou IGUAL à meta (<= 100%) ganha os 20 pontos
        if (resultadoPorcentagem <= 100) {
          tdResultado.className = "right result-good"; // Verde (Meta respeitada)
          tdPontos.innerHTML = `<span class="badge-yes">20</span>`;
        } else {
          tdResultado.className = "right result-bad";  // Vermelho (Estourou a quebra)
          tdPontos.innerHTML = `<span class="badge-no">0</span>`;
        }
      };

      inMeta.addEventListener("input", gerenciarFluxoInput);
      inRealizado.addEventListener("input", gerenciarFluxoInput);

      gerenciarFluxoInput(null);
    });
  }

  function criarPainelEstrutura() {
    const wrapper = document.createElement('section');
    wrapper.className = 'painel-quebras';
    wrapper.id = 'quebras';

    const title = document.createElement('h2');
    title.innerHTML = '<i class="fas fa-chart-bar" style="color:#d4af37"></i> PAINEL DE INDICADORES LANÇAMENTOS - QUEBRAS';
    wrapper.appendChild(title);

    wrapper.appendChild(criarFiltrosEstrutura());

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-quebras-container';

    const table = document.createElement('table');
    table.className = 'table-quebras';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Código</th>
        <th>Loja</th>
        <th class="right">Meta de Quebra (R$)</th>
        <th class="right">Quebra Realizada (R$)</th>
        <th class="right">Resultado (%)</th>
        <th class="center">Pontos</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.id = "po-quebras-tbody";
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    wrapper.appendChild(tableContainer);
    return wrapper;
  }

  // ============================================================
  // 🚪 API PÚBLICA DE EXPOSIÇÃO GLOBAL
  // ============================================================
  window.renderQuebrasTable = function (target) {
    inicializarDados();

    let container = null;
    if (typeof target === 'string') container = document.querySelector(target);
    else if (target instanceof HTMLElement) container = target;
    else container = document.getElementById('conteudo') || document.body;

    if (!container) return;
    
    const existing = document.getElementById('quebras');
    if (existing) existing.remove();

    const section = criarPainelEstrutura();
    container.appendChild(section);

    atualizarTabelaCorpo();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('conteudo');
    if (main && (main.innerHTML.trim() === '' || main.innerHTML.includes('Carregando'))) {
      main.innerHTML = '';
      window.renderQuebrasTable(main);
    }
  });
})();

// Gatilho para o Sidebar Ouro chamar a tela de Quebras
window.poLancQuebras = function() {
  const container = document.getElementById('conteudo');
  if (container) container.innerHTML = ''; 
  window.renderQuebrasTable(container);
};