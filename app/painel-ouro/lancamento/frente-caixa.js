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
        background: #ffffff;
        color: #2c3a47;
        border: 1px solid #e6e1d3;
        padding: 18px;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(15,23,42,0.08);
        margin: 18px 0;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .painel-fc h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #9a7b1c;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .po-fc-filtros {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        background: #faf8f2;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #efe9d8;
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
        color: #a08a3c;
        font-weight: 700;
      }

      .po-fc-select {
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

      .po-fc-select:focus { border-color: #9a7b1c; }

      .table-fc-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid #e6e1d3;
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
        border: 1px solid #eee9da;
      }

      .row-metas th { background: #f3e8d8; color: #1e293b; font-size: 12px !important; }
      .row-indicadores th { background: #44546a; color: #fff; letter-spacing: 0.5px; }
      .row-subheaders th { background: #eef2f7; color: #8a6d1f; font-size: 10px !important; }
      
      .th-fixa { background: #f6f1e3 !important; color: #8a6d1f !important; }
      .th-total-pontos { background: #c9a227 !important; color: #fff !important; font-size: 12px !important; }

      .table-fc tbody td {
        padding: 6px 8px;
        font-size: 13px;
        color: #3a4a5a;
        border: 1px solid #f0ece0;
        background: #ffffff;
      }

      .table-fc tbody tr:hover td {
        background: #faf6ea;
        color: #1f2d3a;
      }

      .po-fc-input {
        background: #fdfcf8;
        border: 1px solid #d9cfae;
        color: #2c3a47;
        padding: 4px 6px;
        border-radius: 4px;
        width: 85px;
        font-family: inherit;
        font-size: 12px;
        text-align: right;
        transition: all 0.15s;
      }

      .po-fc-input:focus {
        background: #ffffff;
        border-color: #9a7b1c;
        box-shadow: 0 0 0 3px rgba(201,162,39,0.15);
        outline: none;
      }

      .po-fc-meta {
        width: 80px; background: rgba(255,255,255,0.9);
        border: 1px dashed #c9a227; color: #8a6d1f; font-weight: 700;
        font-size: 11px; text-align: center; padding: 3px 4px;
        border-radius: 5px; font-family: inherit;
      }
      .po-fc-meta:focus {
        outline: none; background: #fff; border-style: solid;
        box-shadow: 0 0 0 3px rgba(201,162,39,0.2);
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
      .badge-fc-pts.ganhou { background: #dff3e6; color: #1e7d45; }
      .badge-fc-pts.perdeu { background: #f1f1ee; color: #9aa3ad; }

      .res-good { color: #1e7d45; font-weight:700; }
      .res-bad  { color: #c0392b; font-weight:700; }
      .td-total-final { font-weight: 800; color: #9a7b1c; text-align: center; background: rgba(201,162,39,0.10) !important; }
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
  // Configuração de metas EDITÁVEIS (salvas em storage + banco)
  const OPERACAO = {
    cancelamento: "menor_igual",
    faixa_hora: "maior_igual",
    descontos: "menor_igual",
  };
  const PESOS = {
    cancelamento: 3,
    faixa_hora: 4,
    descontos: 3,
  };
  const ROTULOS = {
    cancelamento: "CANCELAMENTO_ITEM",
    faixa_hora: "FAIXA HORA - 07:00 às 22:00",
    descontos: "DESCONTOS FUNÇÃO_222",
  };
  const METAS_PADRAO = {
    cancelamento: 200000.0,
    faixa_hora: 70.0,
    descontos: 1500.0,
  };
  let METAS_ATIVAS = { ...METAS_PADRAO };

  function indicadorAtingiu(ind, n) {
    const meta = Number(METAS_ATIVAS[ind]);
    if (window.poCalculos && typeof window.poCalculos.atingiuMeta === "function") {
      return window.poCalculos.atingiuMeta(OPERACAO[ind], n, meta);
    }
    if (n === null) return false;
    return OPERACAO[ind] === "maior_igual" ? (n >= meta) : (n <= meta);
  }
  function salvarMetasNoStorage() {
    localStorage.setItem("po_metas_fc_ne", JSON.stringify(METAS_ATIVAS));
  }

  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  let anoAtivo = String(new Date().getFullYear()); // abre no ano atual
  let mesAtivo = String(new Date().getMonth()); // abre no mês atual
  let dbFc = {};

  function inicializarDados() {
    // 🔄 Versionamento de schema: se a versão salva for diferente, descarta
    // dados antigos (indicadores mudaram) para evitar estrutura incompatível.
    const SCHEMA_VERSAO = "3";
    const chaveVersao = "po_db_frente_caixa_ne__schema";
    if (localStorage.getItem(chaveVersao) !== SCHEMA_VERSAO) {
      localStorage.removeItem("po_db_frente_caixa_ne");
      localStorage.removeItem("po_metas_fc_ne");
      localStorage.setItem(chaveVersao, SCHEMA_VERSAO);
    }
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

  // ============================================================
  // ☁️ INTEGRAÇÃO SUPABASE — grava/recupera em painel_ouro_resultados
  // ============================================================
  const PO_SYNC_SLUG = "frente_caixa";
  const PO_SYNC_MAX = 10;

  function poMontarPayloadsSupabase() {
    const payloads = [];
    LISTA_LOJAS.forEach(loja => {
      const reg = dbFc[anoAtivo]?.[mesAtivo]?.[loja.codigo];
      if (!reg) return;
      const preenchido = INDICADORES.some(ind => String(reg[ind] ?? "").trim() !== "");
      if (!preenchido) return;

      let pontuacao = 0;
      const subs = INDICADORES.map(ind => {
        const peso = PESOS[ind];
        const n = converterInputParaNumero(reg[ind]);
        const pts = indicadorAtingiu(ind, n) ? peso : 0;
        pontuacao += pts;
        const valor = String(reg[ind] ?? "").trim();
        return { indicador: ind, resultado: valor === "" ? null : valor, meta: Number(METAS_ATIVAS[ind]), Ponto: peso, pontos: pts };
      });

      payloads.push({
        loja_codigo: loja.codigo,
        pontuacao_obtida: pontuacao,
        pontuacao_maxima: PO_SYNC_MAX,
        sub_resultados: subs,
      });
    });
    return payloads;
  }


  // ☁️ AUTO-SAVE por blur (padrão OnePage): ao sair de qualquer campo,
  // grava no banco a(s) loja(s) preenchida(s). Debounce por loja no poSync.
  function poLigarAutoSave() {
    const tb = document.getElementById("po-fc-tbody");
    if (!tb || tb.dataset.autosave === "1" || !window.poSync || !window.poSync.salvarUmaLoja) return;
    tb.dataset.autosave = "1";
    tb.addEventListener("blur", (e) => {
      const t = e.target;
      if (!t || t.tagName !== "INPUT") return;
      try {
        const ano = Number(anoAtivo);
        const mes = Number(mesAtivo) + 1;
        const payloads = poMontarPayloadsSupabase();
        payloads.forEach(p => window.poSync.salvarUmaLoja(PO_SYNC_SLUG, ano, mes, p));
      } catch (err) { console.error("auto-save blur falhou", err); }
    }, true); // captura: pega o blur de inputs filhos
  }

  function poAplicarDadosRemotos(mapa) {
    if (!mapa || !Object.keys(mapa).length) return false;
    let aplicou = false;
    let metasRemotas = null;
    Object.entries(mapa).forEach(([cod, subs]) => {
      if (!dbFc[anoAtivo]) dbFc[anoAtivo] = {};
      if (!dbFc[anoAtivo][mesAtivo]) dbFc[anoAtivo][mesAtivo] = {};
      if (!dbFc[anoAtivo][mesAtivo][cod]) dbFc[anoAtivo][mesAtivo][cod] = {};
      const reg = dbFc[anoAtivo][mesAtivo][cod];
      (subs || []).forEach(s => {
        if (INDICADORES.includes(s.indicador)) {
          reg[s.indicador] = s.resultado == null ? "" : String(s.resultado);
          aplicou = true;
          if (s.meta != null) { if (!metasRemotas) metasRemotas = {}; metasRemotas[s.indicador] = Number(s.meta); }
        }
      });
    });
    if (metasRemotas) {
      METAS_ATIVAS = { ...METAS_ATIVAS, ...metasRemotas };
      salvarMetasNoStorage();
      INDICADORES.forEach(ind => {
        const el = document.querySelector(`.in-meta-${ind}`);
        if (el && metasRemotas[ind] != null) el.value = metasRemotas[ind];
      });
    }
    if (aplicou) salvarNoStorage();
    return aplicou;
  }

  async function poSincronizarRemoto() {
    if (!window.poSync) return;
    try {
      const mapa = await window.poSync.carregar(PO_SYNC_SLUG, Number(anoAtivo), Number(mesAtivo) + 1);
      // 🏦 Banco é a fonte da verdade: zera o período local e preenche só com o que veio do banco.
      if (mapa) {
        if (!dbFc[anoAtivo]) dbFc[anoAtivo] = {};
        dbFc[anoAtivo][mesAtivo] = {};
        LISTA_LOJAS.forEach(loja => {
          dbFc[anoAtivo][mesAtivo][loja.codigo] = {};
          INDICADORES.forEach(ind => { dbFc[anoAtivo][mesAtivo][loja.codigo][ind] = ""; });
        });
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


  function converterInputParaNumero(valorStr) {
    if (window.poCalculos && typeof window.poCalculos.parseValorBR === "function") {
      return window.poCalculos.parseValorBR(valorStr);
    }
    if (!valorStr || String(valorStr).trim() === "") return null;
    let limpo = String(valorStr).replace("R$", "").replace("%", "").replace(/\s/g, "");
    const neg = /^-/.test(limpo);
    limpo = limpo.replace(/^-/, "");
    if (limpo.includes(",")) limpo = limpo.replace(/\./g, "").replace(",", ".");
    let num = parseFloat(limpo);
    if (isNaN(num)) return null;
    return neg ? -num : num;
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
      poSincronizarRemoto();
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
      poSincronizarRemoto();
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
          if (nValor !== null) {
            const alcancou = indicadorAtingiu(ind, nValor);

            if (alcancou) {
              inputEl.className = "po-fc-input res-good";
              badgeEl.className = "badge-fc-pts ganhou";
              badgeEl.textContent = String(PESOS[ind]).replace(".", ",");
              totalPontosLoja += PESOS[ind];
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

        tr.querySelector(`.total-fc-${loja.codigo}`).textContent = Number.isInteger(totalPontosLoja) ? totalPontosLoja : String(totalPontosLoja).replace(".", ",");
        salvarNoStorage();
      };

      INDICADORES.forEach(ind => {
        const inp = tr.querySelector(`.in-fc-${ind}`);
        if (inp) inp.addEventListener("input", processarCalculoLinha);
      });

      // Executa batimento de carga inicial
      try {
        processarCalculoLinha();
      } catch (e) {
        console.error("⚠️ Erro no cálculo da linha (frente-caixa):", e, { loja: loja.codigo });
      }
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
    const metaCels = INDICADORES.map(ind =>
      `<th colspan="2"><input type="text" class="po-fc-meta in-meta-${ind}" value="${METAS_ATIVAS[ind]}" title="Meta editável — vale para todas as lojas"></th>`
    ).join("");
    const nomeCels = INDICADORES.map(ind => `<th colspan="2">${ROTULOS[ind]}</th>`).join("");
    const subCels  = INDICADORES.map(() => `<th>RESULTADO</th><th>Ponto</th>`).join("");
    thead.innerHTML = `
      <tr class="row-metas">
        <th rowspan="3" class="th-fixa" style="font-size:12px;">CÓDIGO</th>
        <th rowspan="3" class="th-fixa" style="font-size:12px; text-align:left; padding-left:10px;">LOJA</th>
        ${metaCels}
        <th rowspan="3" class="th-total-pontos">TOTAL PONTOS</th>
      </tr>
      <tr class="row-indicadores">${nomeCels}</tr>
      <tr class="row-subheaders">${subCels}</tr>
    `;
    setTimeout(() => {
      INDICADORES.forEach(ind => {
        const el = thead.querySelector(`.in-meta-${ind}`);
        if (!el) return;
        const aplicar = () => {
          const n = converterInputParaNumero(el.value);
          if (n !== null) { METAS_ATIVAS[ind] = n; salvarMetasNoStorage(); atualizarTabelaCorpo(); }
        };
        el.addEventListener("change", aplicar);
        el.addEventListener("blur", aplicar);
      });
    }, 0);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.id = "po-fc-tbody";
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
  // 🚪 EXPOSIÇÃO PÚBLICA E ACOPLAMENTO COM SISTEMA DE ROTAS
  // ============================================================
  window.renderFrenteCaixaTable = function (target) {
    inicializarDados();
    (function(){ const m = localStorage.getItem("po_metas_fc_ne"); if (m) { try { METAS_ATIVAS = { ...METAS_PADRAO, ...JSON.parse(m) }; } catch(_){} } })();

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
    poSincronizarRemoto();
    poLigarAutoSave();
  };

  // Auto-render no DOMContentLoaded removido: a tela é aberta apenas pelo Sidebar Ouro,
  // evitando que a tabela sobrescreva o dashboard principal no carregamento da página.
})();

// Ativador oficial disparado pelo arquivo sidebar-painel-ouro.js
window.poLancFrenteCaixa = function() {
  const container = document.getElementById('conteudo');
  if (container) container.innerHTML = ''; 
  window.renderFrenteCaixaTable(container);
};