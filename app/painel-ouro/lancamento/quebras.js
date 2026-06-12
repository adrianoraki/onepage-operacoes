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
        background: #ffffff;
        color: #2c3a47;
        border: 1px solid #e6e1d3;
        padding: 18px;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(15,23,42,0.08);
        margin: 18px 0;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .painel-quebras h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #9a7b1c;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .po-quebras-filtros {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        background: #faf8f2;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #efe9d8;
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
        color: #a08a3c;
        font-weight: 700;
      }

      .po-quebras-select {
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

      .po-quebras-select:focus {
        border-color: #9a7b1c;
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
        background: #f6f1e3;
        color: #2c3a47;
        font-weight: 700;
        font-size: 13px;
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e8e2d0;
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
        color: #3a4a5a;
        border-bottom: 1px solid #f0ece0;
      }

      .table-quebras tbody tr:hover td {
        background: #faf6ea;
        color: #1f2d3a;
      }

      .po-quebras-input {
        background: #fdfcf8;
        border: 1px solid #d9cfae;
        color: #2c3a47;
        padding: 5px 8px;
        border-radius: 4px;
        width: 130px;
        font-family: inherit;
        font-size: 13px;
        text-align: right;
        transition: all 0.15s;
      }

      .po-quebras-input:focus {
        background: #ffffff;
        border-color: #9a7b1c;
        box-shadow: 0 0 0 3px rgba(201,162,39,0.15);
        outline: none;
      }

      .badge-yes {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 999px;
        background: linear-gradient(90deg,#d4af37,#f4d35e);
        color: #3a2c00;
        font-weight: 700;
        font-size: 12px;
      }

      .badge-no {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 999px;
        background: #f1eee4;
        color: #8a8366;
        font-weight: 600;
        font-size: 12px;
      }

      .result-good { color: #1e7d45; font-weight:700; }
      .result-bad  { color: #c0392b; font-weight:700; }

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

  let anoAtivo = String(new Date().getFullYear()); // abre no ano atual
  let mesAtivo = String(new Date().getMonth()); // abre no mês atual
  let dbQuebras = {}; // Banco de dados isolado para quebras

  function inicializarDados() {
    // 🔄 Versionamento de schema: limpa dados de teste antigos incompatíveis.
    const SCHEMA_VERSAO = "3";
    const chaveVersao = "po_db_quebras__schema";
    if (localStorage.getItem(chaveVersao) !== SCHEMA_VERSAO) {
      localStorage.removeItem("po_db_quebras");
      localStorage.setItem(chaveVersao, SCHEMA_VERSAO);
    }
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
  // ☁️ INTEGRAÇÃO SUPABASE — grava/recupera em painel_ouro_resultados
  // ============================================================
  const PO_SYNC_SLUG = "quebras";

  function poMontarPayloadsSupabase() {
    const payloads = [];
    LISTA_LOJAS.forEach(loja => {
      const reg = dbQuebras[anoAtivo]?.[mesAtivo]?.[loja.codigo];
      if (!reg) return;
      const meta = Number(reg.meta) || 0;
      const realizado = Number(reg.realizado) || 0;
      if (meta <= 0 && realizado <= 0) return;
      const pts = (meta > 0 && realizado <= meta) ? 20 : 0;
      payloads.push({
        loja_codigo: loja.codigo,
        pontuacao_obtida: pts,
        pontuacao_maxima: 20,
        sub_resultados: [
          { indicador: "meta", resultado: meta, Ponto: 0, pontos: 0 },
          { indicador: "realizado", resultado: realizado, Ponto: 20, pontos: pts },
        ],
      });
    });
    return payloads;
  }


  // ☁️ AUTO-SAVE por blur (padrão OnePage): ao sair de qualquer campo,
  // grava no banco a(s) loja(s) preenchida(s). Debounce por loja no poSync.
  function poLigarAutoSave() {
    const tb = document.getElementById("po-quebras-tbody");
    if (!tb || tb.dataset.autosave === "1" || !window.poSync || !window.poSync.salvarUmaLoja) return;
    tb.dataset.autosave = "1";
    tb.addEventListener("blur", (e) => {
      const t = e.target;
      if (!t || t.tagName !== "INPUT") return;
      try {
        const ano = Number(anoAtivo);
        const mes = Number(mesAtivo) + 1;
        const payloads = poMontarPayloadsSupabase();
        const comDados = new Set(payloads.map(p => p.loja_codigo));
        payloads.forEach(p => window.poSync.salvarUmaLoja(PO_SYNC_SLUG, ano, mes, p));
        LISTA_LOJAS.forEach(loja => {
          const reg = dbQuebras[anoAtivo]?.[mesAtivo]?.[loja.codigo];
          const meta = Number(reg?.meta) || 0;
          const realizado = Number(reg?.realizado) || 0;
          if (meta <= 0 && realizado <= 0 && !comDados.has(loja.codigo) && window.poSync.excluirUmaLoja) {
            window.poSync.excluirUmaLoja(PO_SYNC_SLUG, ano, mes, loja.codigo);
          }
        });
      } catch (err) { console.error("auto-save blur falhou", err); }
    }, true); // captura: pega o blur de inputs filhos
  }

  function poAplicarDadosRemotos(mapa) {
    if (!mapa || !Object.keys(mapa).length) return false;
    let aplicou = false;
    Object.entries(mapa).forEach(([cod, subs]) => {
      if (!dbQuebras[anoAtivo]) dbQuebras[anoAtivo] = {};
      if (!dbQuebras[anoAtivo][mesAtivo]) dbQuebras[anoAtivo][mesAtivo] = {};
      if (!dbQuebras[anoAtivo][mesAtivo][cod]) dbQuebras[anoAtivo][mesAtivo][cod] = { meta: 0, realizado: 0 };
      const reg = dbQuebras[anoAtivo][mesAtivo][cod];
      (subs || []).forEach(s => {
        if (s.indicador === "meta")    { reg.meta = Number(s.resultado) || 0; aplicou = true; }
        if (s.indicador === "realizado") { reg.realizado = Number(s.resultado) || 0; aplicou = true; }
      });
    });
    if (aplicou) salvarNoStorage();
    return aplicou;
  }

  async function poSincronizarRemoto() {
    if (!window.poSync) return;
    try {
      const mapa = await window.poSync.carregar(PO_SYNC_SLUG, Number(anoAtivo), Number(mesAtivo) + 1);
      // 🏦 Banco é a fonte da verdade: zera o período local e preenche só com o banco.
      if (mapa) {
        if (!dbQuebras[anoAtivo]) dbQuebras[anoAtivo] = {};
        dbQuebras[anoAtivo][mesAtivo] = {};
        LISTA_LOJAS.forEach(loja => { dbQuebras[anoAtivo][mesAtivo][loja.codigo] = { meta: 0, realizado: 0 }; });
        poAplicarDadosRemotos(mapa);
        salvarNoStorage();
        atualizarTabelaCorpo();
      }
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
      poSincronizarRemoto();
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
      poSincronizarRemoto();
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
        <td class="right"><input type="text" class="po-quebras-input input-meta" value="${valorMetaExibir}" placeholder="R$ 0,00"></td>
        <td class="right"><input type="text" class="po-quebras-input input-realizado" value="${valorRealizadoExibir}" placeholder="R$ 0,00"></td>
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
        if (vMeta > 0 && resultadoPorcentagem <= 100) {
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

    // Barra de salvamento no Supabase
    if (window.poSync) {
      wrapper.appendChild(window.poSync.criarBarraSalvar(poSalvarRemoto));
    }

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
    poSincronizarRemoto();
    poLigarAutoSave();
  };

  // Auto-render no DOMContentLoaded removido: a tela é aberta apenas pelo Sidebar Ouro,
  // evitando que a tabela sobrescreva o dashboard principal no carregamento da página.
})();

// Gatilho para o Sidebar Ouro chamar a tela de Quebras
window.poLancQuebras = function() {
  const container = document.getElementById('conteudo');
  if (container) container.innerHTML = ''; 
  window.renderQuebrasTable(container);
};