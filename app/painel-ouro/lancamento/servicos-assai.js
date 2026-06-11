// app/painel-ouro/servicos-assai.js

(function () {
  // ============================================================
  // 🎨 INJEÇÃO DE ESTILOS PREMIUM (Adaptado para tabela complexa)
  // ============================================================
  (function garantirEstilosServicos() {
    if (document.getElementById("servicos-styles")) return;
    const s = document.createElement("style");
    s.id = "servicos-styles";
    s.textContent = `
      .painel-servicos {
        background: linear-gradient(180deg, #0f1418 0%, #12161a 100%);
        color: #f4e7b2;
        border: 1px solid rgba(212,175,55,0.12);
        padding: 18px;
        border-radius: 10px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6);
        margin: 18px 0;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .painel-servicos h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #ffd966;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .po-servicos-filtros {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        background: rgba(255,255,255,0.02);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.05);
      }

      .po-servicos-control {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .po-servicos-control label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(201,162,39,0.6);
        font-weight: 700;
      }

      .po-servicos-select {
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

      .po-servicos-select:focus { border-color: #ffd966; }

      .table-servicos-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.1);
      }

      .table-servicos {
        width: 100%;
        border-collapse: collapse;
        min-width: 1400px; /* Garante que a tabela gigante não esmague os inputs */
      }

      /* Estilização da Hierarquia do Cabeçalho (Fiel à imagem) */
      .table-servicos thead th {
        font-family: "Poppins", sans-serif;
        font-size: 11px;
        font-weight: 700;
        padding: 6px 4px;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.08);
      }

      .th-dep { background: #1a2432; color: #ffd966; font-size: 13px !important; letter-spacing: 1px; }
      .th-meta { background: #232a35; color: #cfc6a0; font-weight: 600; }
      .th-sub { background: #2c3545; color: #fff; font-size: 10px !important; }
      
      /* Cores de Fundo das Colunas de Categoria */
      .th-res-vendas { background: #2e5432; color: #fff; }
      .th-peso-vendas { background: #1c3d5a; color: #fff; }
      .th-res-quebras { background: #7a2020; color: #fff; }
      .th-peso-quebras { background: #7c4215; color: #fff; }
      .th-total-pontos { background: #b25e10; color: #fff; font-size: 12px !important; }

      .table-servicos tbody td {
        padding: 6px 8px;
        font-size: 13px;
        color: #e9e1b8;
        border: 1px solid rgba(255,255,255,0.04);
        background: rgba(0,0,0,0.1);
      }

      .table-servicos tbody tr:hover td {
        background: rgba(212,175,55,0.03);
        color: #fff;
      }

      .po-servicos-input {
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

      .po-servicos-input:focus {
        background: #161c22;
        border-color: #ffd966;
        box-shadow: 0 0 6px rgba(255,217,102,0.3);
        outline: none;
      }

      .badge-pts {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 11px;
        min-width: 20px;
        text-align: center;
      }
      .badge-pts.ganhou { background: #2e7d32; color: #fff; }
      .badge-pts.perdeu { background: rgba(255,255,255,0.05); color: #888; }

      .res-good { color: #9be67a; font-weight:700; }
      .res-bad  { color: #ff8a8a; font-weight:700; }
      .td-total-final { font-weight: 800; color: #ffd966; text-align: center; background: rgba(212,175,55,0.05) !important; }
    `;
    document.head.appendChild(s);
  })();

  // ============================================================
  // 🗄️ ESTRUTURA DE DADOS E CONFIGURAÇÕES
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

  const DEPARTAMENTOS = ["acougue", "cembaladas", "emporio", "cafeteria", "padaria"];

  // Limites e Metas configurados com base na linha superior da sua imagem
  const METAS_REFERENCIA = {
    acougue:    { vendas: 100.0, quebras: -2.00 },
    cembaladas: { vendas: 100.0, quebras: -1.50 },
    emporio:    { vendas: 100.0, quebras: -1.00 },
    cafeteria:  { vendas: 100.0, quebras: -1.60 },
    padaria:    { vendas: 100.0, quebras: -3.00 }
  };

  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  let anoAtivo = "2025";
  let mesAtivo = "0";
  let dbServicos = {};

  function inicializarDados() {
    const salvos = localStorage.getItem("po_db_servicos_assai");
    if (salvos) {
      dbServicos = JSON.parse(salvos);
    } else {
      ["2025", "2026", "2027"].forEach(ano => {
        dbServicos[ano] = {};
        MESES.forEach((_, index) => {
          dbServicos[ano][index] = {};
          LISTA_LOJAS.forEach(loja => {
            dbServicos[ano][index][loja.codigo] = {};
            DEPARTAMENTOS.forEach(d => {
              dbServicos[ano][index][loja.codigo][d] = { vendas: "", quebras: "" };
            });
          });
        });
      });
      salvarNoStorage();
    }
  }

  function salvarNoStorage() {
    localStorage.setItem("po_db_servicos_assai", JSON.stringify(dbServicos));
  }

  // Helper para converter string de input formatada para float matemático pura
  function converterInputParaNumero(valorStr) {
    if (!valorStr || valorStr.trim() === "") return null;
    let limpo = valorStr.replace("%", "").replace(/\s/g, "").replace(",", ".");
    let num = parseFloat(limpo);
    return isNaN(num) ? null : num;
  }

  // ============================================================
  // ⚡ INTERFACE E RENDERIZAÇÃO ESTRUTURAL
  // ============================================================
  function criarFiltrosEstrutura() {
    const containerFiltros = document.createElement("div");
    containerFiltros.className = "po-servicos-filtros";

    // Seletor de Ano
    const divAno = document.createElement("div");
    divAno.className = "po-servicos-control";
    divAno.innerHTML = `<label>Ano base</label>`;
    const selectAno = document.createElement("select");
    selectAno.className = "po-servicos-select";
    
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
    divMes.className = "po-servicos-control";
    divMes.innerHTML = `<label>Mês de Referência</label>`;
    const selectMes = document.createElement("select");
    selectMes.className = "po-servicos-select";
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
    const tbody = document.getElementById("po-servicos-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    LISTA_LOJAS.forEach(loja => {
      if (!dbServicos[anoAtivo]) dbServicos[anoAtivo] = {};
      if (!dbServicos[anoAtivo][mesAtivo]) dbServicos[anoAtivo][mesAtivo] = {};
      if (!dbServicos[anoAtivo][mesAtivo][loja.codigo]) {
        dbServicos[anoAtivo][mesAtivo][loja.codigo] = {};
        DEPARTAMENTOS.forEach(d => {
          dbServicos[anoAtivo][mesAtivo][loja.codigo][d] = { vendas: "", quebras: "" };
        });
      }

      const registroLoja = dbServicos[anoAtivo][mesAtivo][loja.codigo];
      const tr = document.createElement("tr");

      let htmlInputs = `
        <td style="text-align:center; font-weight:700;">${loja.codigo}</td>
        <td style="min-width:160px; font-weight:600;">${loja.nome}</td>
      `;

      // Monta as colunas iterando dinamicamente pelos departamentos da imagem
      DEPARTAMENTOS.forEach(d => {
        const valVendas = registroLoja[d]?.vendas || "";
        const valQuebras = registroLoja[d]?.quebras || "";

        htmlInputs += `
          <td style="text-align:right;">
            <input type="text" class="po-servicos-input in-${d}-vendas" value="${valVendas}" placeholder="0,00%">
          </td>
          <td style="text-align:center;"><span class="badge-pts pts-${d}-vendas">-</span></td>
          
          <td style="text-align:right;">
            <input type="text" class="po-servicos-input in-${d}-quebras" value="${valQuebras}" placeholder="0,00%">
          </td>
          <td style="text-align:center;"><span class="badge-pts pts-${d}-quebras">-</span></td>
        `;
      });

      // Coluna final consolidada
      htmlInputs += `<td class="td-total-final total-${loja.codigo}">0</td>`;
      tr.innerHTML = htmlInputs;
      tbody.appendChild(tr);

      // Função interna de cálculo em tempo real mapeada por input inserido
      const processarCalculoLinha = () => {
        let totalPontosLoja = 0;

        DEPARTAMENTOS.forEach(d => {
          const inputVendas = tr.querySelector(`.in-${d}-vendas`);
          const inputQuebras = tr.querySelector(`.in-${d}-quebras`);
          const badgeVendas = tr.querySelector(`.pts-${d}-vendas`);
          const badgeQuebras = tr.querySelector(`.pts-${d}-quebras`);

          // Salva os estados atuais digitados no objeto em memória
          registroLoja[d].vendas = inputVendas.value;
          registroLoja[d].quebras = inputQuebras.value;

          const nVendas = converterInputParaNumero(inputVendas.value);
          const nQuebras = converterInputParaNumero(inputQuebras.value);

          // 1. Processamento de Vendas (Meta >= 100%)
          if (nVendas !== null) {
            if (nVendas >= METAS_REFERENCIA[d].vendas) {
              inputVendas.className = "po-servicos-input res-good";
              badgeVendas.className = "badge-pts ganhou";
              badgeVendas.textContent = "1";
              totalPontosLoja += 1;
            } else {
              inputVendas.className = "po-servicos-input res-bad";
              badgeVendas.className = "badge-pts perdeu";
              badgeVendas.textContent = "0";
            }
          } else {
            inputVendas.className = "po-servicos-input";
            badgeVendas.className = "badge-pts perdeu";
            badgeVendas.textContent = "-";
          }

          // 2. Processamento de Quebras (Invertido: Precisa ficar acima algebricamente do limite negativo)
          // Exemplo: Se a meta é -2.00%, um resultado de -1.50% é superior (respeitou o teto). -2.50% estourou.
          if (nQuebras !== null) {
            if (nQuebras >= METAS_REFERENCIA[d].quebras) {
              inputQuebras.className = "po-servicos-input res-good";
              badgeQuebras.className = "badge-pts ganhou";
              badgeQuebras.textContent = "1";
              totalPontosLoja += 1;
            } else {
              inputQuebras.className = "po-servicos-input res-bad";
              badgeQuebras.className = "badge-pts perdeu";
              badgeQuebras.textContent = "0";
            }
          } else {
            inputQuebras.className = "po-servicos-input";
            badgeQuebras.className = "badge-pts perdeu";
            badgeQuebras.textContent = "-";
          }
        });

        // Atualiza a célula de pontuação total acumulada da loja
        tr.querySelector(`.total-${loja.codigo}`).textContent = totalPontosLoja;
        salvarNoStorage();
      };

      // Adiciona ouvintes reativos de input para cada célula digitável da linha
      DEPARTAMENTOS.forEach(d => {
        tr.querySelector(`.in-${d}-vendas`).addEventListener("input", processarCalculoLinha);
        tr.querySelector(`.in-${d}-quebras`).addEventListener("input", processarCalculoLinha);
      });

      // Executa uma primeira passada para colorir/pontuar dados já pré-existentes
      processarCalculoLinha();
    });
  }

  function criarPainelEstrutura() {
    const wrapper = document.createElement('section');
    wrapper.className = 'painel-servicos';
    wrapper.id = 'servicos-assai';

    const title = document.createElement('h2');
    title.innerHTML = '<i class="fas fa-store" style="color:#d4af37"></i> LANÇAMENTOS - SERVIÇOS ASSAÍ';
    wrapper.appendChild(title);

    wrapper.appendChild(criarFiltrosEstrutura());

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-servicos-container';

    const table = document.createElement('table');
    table.className = 'table-servicos';

    // Montagem exata da árvore complexa de cabeçalhos (4 níveis baseados na imagem)
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th rowspan="4" style="background:#11161d; color:#ffd966; font-size:12px;">CÓDIGO</th>
        <th rowspan="4" style="background:#11161d; color:#ffd966; font-size:12px; text-align:left; padding-left:10px;">LOJA</th>
        <th colspan="4" class="th-dep">AÇOUGUE</th>
        <th colspan="4" class="th-dep">C. EMBALADAS</th>
        <th colspan="4" class="th-dep">EMPÓRIO</th>
        <th colspan="4" class="th-dep">CAFETERIA</th>
        <th colspan="4" class="th-dep">PADARIA</th>
        <th rowspan="4" class="th-total-pontos">TOTAL PONTOS</th>
      </tr>
      <tr>
        <th colspan="2" class="th-meta">100%</th><th colspan="2" class="th-meta">-2,00%</th>
        <th colspan="2" class="th-meta">100%</th><th colspan="2" class="th-meta">-1,50%</th>
        <th colspan="2" class="th-meta">100,00%</th><th colspan="2" class="th-meta">-1,00%</th>
        <th colspan="2" class="th-meta">100,00%</th><th colspan="2" class="th-meta">-1,60%</th>
        <th colspan="2" class="th-meta">100,00%</th><th colspan="2" class="th-meta">-3,00%</th>
      </tr>
      <tr>
        <th colspan="2" class="th-sub">VENDAS</th><th colspan="2" class="th-sub">QUEBRAS</th>
        <th colspan="2" class="th-sub">VENDAS</th><th colspan="2" class="th-sub">QUEBRAS</th>
        <th colspan="2" class="th-sub">VENDAS</th><th colspan="2" class="th-sub">QUEBRAS</th>
        <th colspan="2" class="th-sub">VENDAS</th><th colspan="2" class="th-sub">QUEBRAS</th>
        <th colspan="2" class="th-sub">VENDAS</th><th colspan="2" class="th-sub">QUEBRAS</th>
      </tr>
      <tr>
        <th class="th-res-vendas">RESULTADO</th><th class="th-peso-vendas">PESO</th>
        <th class="th-res-quebras">RESULTADO</th><th class="th-peso-quebras">PESO</th>
        
        <th class="th-res-vendas">RESULTADO</th><th class="th-peso-vendas">PESO</th>
        <th class="th-res-quebras">RESULTADO</th><th class="th-peso-quebras">PESO</th>
        
        <th class="th-res-vendas">RESULTADO</th><th class="th-peso-vendas">PESO</th>
        <th class="th-res-quebras">RESULTADO</th><th class="th-peso-quebras">PESO</th>
        
        <th class="th-res-vendas">RESULTADO</th><th class="th-peso-vendas">PESO</th>
        <th class="th-res-quebras">RESULTADO</th><th class="th-peso-quebras">PESO</th>
        
        <th class="th-res-vendas">RESULTADO</th><th class="th-peso-vendas">PESO</th>
        <th class="th-res-quebras">RESULTADO</th><th class="th-peso-quebras">PESO</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.id = "po-servicos-tbody";
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    wrapper.appendChild(tableContainer);
    return wrapper;
  }

  // ============================================================
  // 🚪 CONTROLE DE ACESSO GLOBAL E ROTAS
  // ============================================================
  window.renderServicosAssaiTable = function (target) {
    inicializarDados();

    let container = null;
    if (typeof target === 'string') container = document.querySelector(target);
    else if (target instanceof HTMLElement) container = target;
    else container = document.getElementById('conteudo') || document.body;

    if (!container) return;
    
    const existing = document.getElementById('servicos-assai');
    if (existing) existing.remove();

    const section = criarPainelEstrutura();
    container.appendChild(section);

    atualizarTabelaCorpo();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('conteudo');
    if (main && (main.innerHTML.trim() === '' || main.innerHTML.includes('Carregando'))) {
      main.innerHTML = '';
      window.renderServicosAssaiTable(main);
    }
  });
})();

// Conector acionado pela rota "servicos_assai" do Sidebar Ouro
window.poLancServicosAssai = function() {
  const container = document.getElementById('conteudo');
  if (container) container.innerHTML = ''; 
  window.renderServicosAssaiTable(container);
};