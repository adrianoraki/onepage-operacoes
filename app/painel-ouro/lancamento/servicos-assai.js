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
        background: #ffffff;
        color: #2c3a47;
        border: 1px solid #e6e1d3;
        padding: 18px;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(15,23,42,0.08);
        margin: 18px 0;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .painel-servicos h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #9a7b1c;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .po-servicos-filtros {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        background: #faf8f2;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #efe9d8;
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
        color: #a08a3c;
        font-weight: 700;
      }

      .po-servicos-select {
        background: #ffffff;
        border: 1px solid #d9cfae;
        color: #2c3a47;
        padding: 6px 12px;
        border-radius: 6px;
        font-family: inherit;
        font-size: 13px;
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s;
      }

      .po-servicos-select:focus { border-color: #9a7b1c; }

      .table-servicos-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid #e6e1d3;
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
        border: 1px solid #eee9da;
      }

      .th-dep { background: #eef2f7; color: #8a6d1f; font-size: 13px !important; letter-spacing: 1px; }
      .th-meta { background: #eef2f7; color: #5d6b78; font-weight: 600; }
      .th-sub { background: #44546a; color: #fff; font-size: 10px !important; }
      
      /* Cores de Fundo das Colunas de Categoria */
      .th-res-vendas { background: #e3f2e8; color: #1e7d45; }
      .th-peso-vendas { background: #e3ecf6; color: #2f5d8a; }
      .th-res-quebras { background: #fbe9e7; color: #a13a2e; }
      .th-peso-quebras { background: #f7eddc; color: #9a6a1f; }
      .th-total-pontos { background: #b25e10; color: #fff; font-size: 12px !important; }

      .table-servicos tbody td {
        padding: 6px 8px;
        font-size: 13px;
        color: #3a4a5a;
        border: 1px solid #f0ece0;
        background: #ffffff;
      }

      .table-servicos tbody tr:hover td {
        background: #faf6ea;
        color: #1f2d3a;
      }

      .po-servicos-input {
        background: #fdfcf8;
        border: 1px solid #d9cfae;
        color: #2c3a47;
        padding: 4px 6px;
        border-radius: 4px;
        width: 75px;
        font-family: inherit;
        font-size: 12px;
        text-align: right;
        transition: all 0.15s;
      }

      .po-servicos-input:focus {
        background: #ffffff;
        border-color: #9a7b1c;
        box-shadow: 0 0 0 3px rgba(201,162,39,0.15);
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
      .badge-pts.ganhou { background: #dff3e6; color: #1e7d45; }
      .badge-pts.perdeu { background: #f1f1ee; color: #9aa3ad; }

      .res-good { color: #1e7d45; font-weight:700; }
      .res-bad  { color: #c0392b; font-weight:700; }
      .td-total-final { font-weight: 800; color: #9a7b1c; text-align: center; background: rgba(201,162,39,0.10) !important; }
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

  // ============================================================
  // ☁️ INTEGRAÇÃO SUPABASE — grava/recupera em painel_ouro_resultados
  // ============================================================
  const PO_SYNC_SLUG = "servicos_assai";

  function poMontarPayloadsSupabase() {
    const payloads = [];
    LISTA_LOJAS.forEach(loja => {
      const reg = dbServicos[anoAtivo]?.[mesAtivo]?.[loja.codigo];
      if (!reg) return;
      const preenchido = DEPARTAMENTOS.some(d =>
        String(reg[d]?.vendas ?? "").trim() !== "" || String(reg[d]?.quebras ?? "").trim() !== "");
      if (!preenchido) return;

      let pontuacao = 0;
      const subs = [];
      DEPARTAMENTOS.forEach(d => {
        const vV = String(reg[d]?.vendas ?? "").trim();
        const vQ = String(reg[d]?.quebras ?? "").trim();
        const nV = converterInputParaNumero(vV);
        const nQ = converterInputParaNumero(vQ);
        const ptsV = (nV !== null && nV >= METAS_REFERENCIA[d].vendas) ? 1 : 0;
        const ptsQ = (nQ !== null && nQ >= METAS_REFERENCIA[d].quebras) ? 1 : 0;
        pontuacao += ptsV + ptsQ;
        subs.push({ indicador: `${d}_vendas`,  resultado: vV === "" ? null : vV, peso: 1, pontos: ptsV });
        subs.push({ indicador: `${d}_quebras`, resultado: vQ === "" ? null : vQ, peso: 1, pontos: ptsQ });
      });

      payloads.push({
        loja_codigo: loja.codigo,
        pontuacao_obtida: pontuacao,
        pontuacao_maxima: 10,
        sub_resultados: subs,
      });
    });
    return payloads;
  }

  function poAplicarDadosRemotos(mapa) {
    if (!mapa || !Object.keys(mapa).length) return false;
    let aplicou = false;
    Object.entries(mapa).forEach(([cod, subs]) => {
      if (!dbServicos[anoAtivo]) dbServicos[anoAtivo] = {};
      if (!dbServicos[anoAtivo][mesAtivo]) dbServicos[anoAtivo][mesAtivo] = {};
      if (!dbServicos[anoAtivo][mesAtivo][cod]) {
        dbServicos[anoAtivo][mesAtivo][cod] = {};
        DEPARTAMENTOS.forEach(d => { dbServicos[anoAtivo][mesAtivo][cod][d] = { vendas: "", quebras: "" }; });
      }
      const reg = dbServicos[anoAtivo][mesAtivo][cod];
      (subs || []).forEach(s => {
        DEPARTAMENTOS.forEach(d => {
          if (!reg[d]) reg[d] = { vendas: "", quebras: "" };
          if (s.indicador === `${d}_vendas`)  { reg[d].vendas  = s.resultado == null ? "" : String(s.resultado); aplicou = true; }
          if (s.indicador === `${d}_quebras`) { reg[d].quebras = s.resultado == null ? "" : String(s.resultado); aplicou = true; }
        });
      });
    });
    if (aplicou) salvarNoStorage();
    return aplicou;
  }

  async function poSincronizarRemoto() {
    if (!window.poSync) return;
    try {
      const mapa = await window.poSync.carregar(PO_SYNC_SLUG, Number(anoAtivo), Number(mesAtivo) + 1);
      if (poAplicarDadosRemotos(mapa)) atualizarTabelaCorpo();
    } catch (e) {
      console.error("☁️ Falha ao sincronizar com o banco:", e);
    }
  }

  async function poSalvarRemoto(btn) {
    if (!window.poSync) { alert("Módulo de sincronização indisponível."); return; }
    const payloads = poMontarPayloadsSupabase();
    if (!payloads.length) { window.poSync.toast("Nenhuma loja preenchida para salvar.", false); return; }
    const txtOriginal = btn ? btn.innerHTML : "";
    try {
      if (btn) { btn.disabled = true; btn.innerHTML = "Salvando…"; }
      const qtd = await window.poSync.salvar(PO_SYNC_SLUG, Number(anoAtivo), Number(mesAtivo) + 1, payloads);
      window.poSync.toast(`✓ ${qtd} lojas salvas no banco!`, true);
    } catch (err) {
      console.error("☁️ Erro ao salvar no banco:", err);
      window.poSync.toast(`Erro ao salvar: ${err.message || "tente novamente"}`, false);
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = txtOriginal; }
    }
  }


  // Helper para converter string de input formatada para float matemático pura
  function converterInputParaNumero(valorStr) {
    if (!valorStr || valorStr.trim() === "") return null;
    let limpo = valorStr.replace("R$", "").replace("%", "").replace(/\s/g, "");
    if (limpo.includes(",")) {
      limpo = limpo.replace(/\./g, "").replace(",", ".");
    }
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
      poSincronizarRemoto();
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
      poSincronizarRemoto();
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
        <th rowspan="4" style="background:#f6f1e3; color:#8a6d1f; font-size:12px;">CÓDIGO</th>
        <th rowspan="4" style="background:#f6f1e3; color:#8a6d1f; font-size:12px; text-align:left; padding-left:10px;">LOJA</th>
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

    // Barra de salvamento no Supabase
    if (window.poSync) {
      wrapper.appendChild(window.poSync.criarBarraSalvar(poSalvarRemoto));
    }

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
    poSincronizarRemoto();
  };

  // Auto-render no DOMContentLoaded removido: a tela é aberta apenas pelo Sidebar Ouro,
  // evitando que a tabela sobrescreva o dashboard principal no carregamento da página.
})();

// Conector acionado pela rota "servicos_assai" do Sidebar Ouro
window.poLancServicosAssai = function() {
  const container = document.getElementById('conteudo');
  if (container) container.innerHTML = ''; 
  window.renderServicosAssaiTable(container);
};