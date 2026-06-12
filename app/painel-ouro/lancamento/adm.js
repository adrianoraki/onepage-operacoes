// app/painel-ouro/adm.js

(function () {
  // ============================================================
  // 🎨 INJEÇÃO DE ESTILOS PREMIUM (Adaptado ao layout Administrativo)
  // ============================================================
  (function poAdmGarantirEstilos() {
    if (document.getElementById("po-adm-styles")) return;
    const s = document.createElement("style");
    s.id = "po-adm-styles";
    s.textContent = `
      .painel-adm {
        background: #ffffff;
        color: #2c3a47;
        border: 1px solid #e6e1d3;
        padding: 18px;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(15,23,42,0.08);
        margin: 18px 0;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .painel-adm h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #9a7b1c;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .po-adm-filtros {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        background: #faf8f2;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #efe9d8;
      }

      .po-adm-control {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .po-adm-control label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #a08a3c;
        font-weight: 700;
      }

      .po-adm-select {
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

      .po-adm-select:focus { border-color: #9a7b1c; }

      .table-adm-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid #e6e1d3;
      }

      .table-adm {
        width: 100%;
        border-collapse: collapse;
        min-width: 1100px;
      }

      /* Cabeçalho Multi-nível fiel à planilha de Metas */
      .table-adm thead th {
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

      .table-adm tbody td {
        padding: 6px 8px;
        font-size: 13px;
        color: #3a4a5a;
        border: 1px solid #f0ece0;
        background: #ffffff;
      }

      .table-adm tbody tr:hover td {
        background: #faf6ea;
        color: #1f2d3a;
      }

      .po-adm-input {
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

      .po-adm-input:focus {
        background: #ffffff;
        border-color: #9a7b1c;
        box-shadow: 0 0 0 3px rgba(201,162,39,0.15);
        outline: none;
      }

      .po-adm-meta {
        width: 80px; background: rgba(255,255,255,0.9);
        border: 1px dashed #c9a227; color: #8a6d1f; font-weight: 700;
        font-size: 11px; text-align: center; padding: 3px 4px;
        border-radius: 5px; font-family: inherit;
      }
      .po-adm-meta:focus {
        outline: none; background: #fff; border-style: solid;
        box-shadow: 0 0 0 3px rgba(201,162,39,0.2);
      }

      .badge-adm-pts {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 11px;
        min-width: 20px;
        text-align: center;
      }
      .badge-adm-pts.ganhou { background: #dff3e6; color: #1e7d45; }
      .badge-adm-pts.perdeu { background: #f1f1ee; color: #9aa3ad; }

      .res-good { color: #1e7d45; font-weight:700; }
      .res-bad  { color: #c0392b; font-weight:700; }
      .td-total-final { font-weight: 800; color: #9a7b1c; text-align: center; background: rgba(201,162,39,0.10) !important; }
    `;
    document.head.appendChild(s);
  })();

  // ============================================================
  // 🗄️ MAPA DE LOJAS E REGRAS DE NEGÓCIO (ADMINISTRATIVO / RH)
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

  const INDICADORES = ["contas_ger", "hora_extra", "energia", "agua"];

  const ROTULOS = {
    contas_ger: "CONTAS GERENCIÁVEIS",
    hora_extra: "HORA EXTRA",
    energia:    "ENERGIA",
    agua:       "ÁGUA",
  };

  const OPERACAO = {
    contas_ger: "maior_igual", // >= 70%
    hora_extra: "menor_igual", // <= R$ 2.150
    energia:    "menor_igual", // <= 100%
    agua:       "menor_igual", // <= 100%
  };

  const PESOS = { contas_ger: 2.5, hora_extra: 2.5, energia: 2.5, agua: 2.5 };

  // Metas PADRÃO (editáveis na tela, salvas no banco, valem p/ todas as lojas)
  const METAS_PADRAO = {
    contas_ger: 70,    // 70%
    hora_extra: 2150,  // R$ 2.150,00
    energia: 100,      // 100%
    agua: 100,         // 100%
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
    localStorage.setItem("po_metas_adm_ne", JSON.stringify(METAS_ATIVAS));
  }

  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  let anoAtivo = String(new Date().getFullYear()); // abre no ano atual
  let mesAtivo = String(new Date().getMonth()); // abre no mês atual
  let dbAdm = {};

  function inicializarDados() {
    // 🔄 Versionamento de schema: se a versão salva for diferente, descarta
    // dados antigos (indicadores mudaram) para evitar estrutura incompatível.
    const SCHEMA_VERSAO = "3";
    const chaveVersao = "po_db_adm_ne__schema";
    if (localStorage.getItem(chaveVersao) !== SCHEMA_VERSAO) {
      localStorage.removeItem("po_db_adm_ne");
      localStorage.removeItem("po_metas_adm_ne");
      localStorage.setItem(chaveVersao, SCHEMA_VERSAO);
    }
    const salvos = localStorage.getItem("po_db_adm_ne");
    if (salvos) {
      dbAdm = JSON.parse(salvos);
    } else {
      ["2025", "2026", "2027"].forEach(ano => {
        dbAdm[ano] = {};
        MESES.forEach((_, index) => {
          dbAdm[ano][index] = {};
          LISTA_LOJAS.forEach(loja => {
            dbAdm[ano][index][loja.codigo] = {};
            INDICADORES.forEach(ind => {
              dbAdm[ano][index][loja.codigo][ind] = "";
            });
          });
        });
      });
      salvarNoStorage();
    }
    const metasSalvas = localStorage.getItem("po_metas_adm_ne");
    if (metasSalvas) {
      try { METAS_ATIVAS = { ...METAS_PADRAO, ...JSON.parse(metasSalvas) }; } catch (_) {}
    }
  }

  function salvarNoStorage() {
    localStorage.setItem("po_db_adm_ne", JSON.stringify(dbAdm));
  }

  // ============================================================
  // ☁️ INTEGRAÇÃO SUPABASE — grava/recupera em painel_ouro_resultados
  // ============================================================
  const PO_SYNC_SLUG = "adm";
  const PO_SYNC_MAX = 10;

  function poMontarPayloadsSupabase() {
    const payloads = [];
    LISTA_LOJAS.forEach(loja => {
      const reg = dbAdm[anoAtivo]?.[mesAtivo]?.[loja.codigo];
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
        return {
          indicador: ind,
          resultado: valor === "" ? null : valor,
          meta: Number(METAS_ATIVAS[ind]),
          Ponto: peso,
          pontos: pts,
        };
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
    const tb = document.getElementById("po-adm-tbody");
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
      if (!dbAdm[anoAtivo]) dbAdm[anoAtivo] = {};
      if (!dbAdm[anoAtivo][mesAtivo]) dbAdm[anoAtivo][mesAtivo] = {};
      if (!dbAdm[anoAtivo][mesAtivo][cod]) dbAdm[anoAtivo][mesAtivo][cod] = {};
      const reg = dbAdm[anoAtivo][mesAtivo][cod];
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
        if (!dbAdm[anoAtivo]) dbAdm[anoAtivo] = {};
        dbAdm[anoAtivo][mesAtivo] = {};
        LISTA_LOJAS.forEach(loja => {
          dbAdm[anoAtivo][mesAtivo][loja.codigo] = {};
          INDICADORES.forEach(ind => { dbAdm[anoAtivo][mesAtivo][loja.codigo][ind] = ""; });
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
    containerFiltros.className = "po-adm-filtros";

    // Seletor de Ano
    const divAno = document.createElement("div");
    divAno.className = "po-adm-control";
    divAno.innerHTML = `<label>Ano base</label>`;
    const selectAno = document.createElement("select");
    selectAno.className = "po-adm-select";
    ["2025", "2026", "2027"].forEach(ano => {
      const opt = document.createElement("option");
      opt.value = year = ano; opt.textContent = ano;
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
    divMes.className = "po-adm-control";
    divMes.innerHTML = `<label>Mês de Referência</label>`;
    const selectMes = document.createElement("select");
    selectMes.className = "po-adm-select";
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
    const tbody = document.getElementById("po-adm-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    LISTA_LOJAS.forEach(loja => {
      if (!dbAdm[anoAtivo]) dbAdm[anoAtivo] = {};
      if (!dbAdm[anoAtivo][mesAtivo]) dbAdm[anoAtivo][mesAtivo] = {};
      if (!dbAdm[anoAtivo][mesAtivo][loja.codigo]) {
        dbAdm[anoAtivo][mesAtivo][loja.codigo] = {};
        INDICADORES.forEach(ind => { dbAdm[anoAtivo][mesAtivo][loja.codigo][ind] = ""; });
      }

      const registroLoja = dbAdm[anoAtivo][mesAtivo][loja.codigo];
      const tr = document.createElement("tr");

      let htmlInputs = `
        <td style="text-align:center; font-weight:700;">${loja.codigo}</td>
        <td style="min-width:160px; font-weight:600; text-align:left; padding-left:10px;">${loja.nome}</td>
      `;

      INDICADORES.forEach(ind => {
        const valAtual = registroLoja[ind] || "";
        htmlInputs += `
          <td style="text-align:right;">
            <input type="text" class="po-adm-input in-adm-${ind}" value="${valAtual}" placeholder="0,00%">
          </td>
          <td style="text-align:center;"><span class="badge-adm-pts pts-adm-${ind}">-</span></td>
        `;
      });

      htmlInputs += `<td class="td-total-final total-adm-${loja.codigo}">0</td>`;
      tr.innerHTML = htmlInputs;
      tbody.appendChild(tr);

      // Algoritmo de cálculo reativo por linha
      const processarCalculoLinha = () => {
        let totalPontosLoja = 0;

        INDICADORES.forEach(ind => {
          const inputEl = tr.querySelector(`.in-adm-${ind}`);
          const badgeEl = tr.querySelector(`.pts-adm-${ind}`);

          // Grava a digitação em runtime na persistência virtual
          registroLoja[ind] = inputEl.value;

          const nValor = converterInputParaNumero(inputEl.value);

          if (nValor !== null) {
            const alcancou = indicadorAtingiu(ind, nValor);

            if (alcancou) {
              inputEl.className = "po-adm-input res-good";
              badgeEl.className = "badge-adm-pts ganhou";
              badgeEl.textContent = String(PESOS[ind]).replace(".", ",");
              totalPontosLoja += PESOS[ind];
            } else {
              inputEl.className = "po-adm-input res-bad";
              badgeEl.className = "badge-adm-pts perdeu";
              badgeEl.textContent = "0";
            }
          } else {
            inputEl.className = "po-adm-input";
            badgeEl.className = "badge-adm-pts perdeu";
            badgeEl.textContent = "-";
          }
        });

        tr.querySelector(`.total-adm-${loja.codigo}`).textContent = Number.isInteger(totalPontosLoja) ? totalPontosLoja : String(totalPontosLoja).replace(".", ",");
        salvarNoStorage();
      };

      INDICADORES.forEach(ind => {
        const _inp = tr.querySelector(`.in-adm-${ind}`); if (_inp) _inp.addEventListener("input", processarCalculoLinha);
      });

      try { processarCalculoLinha(); } catch (e) { console.error("⚠️ Erro cálculo adm.js:", e); }
    });
  }

  function criarPainelEstrutura() {
    const wrapper = document.createElement('section');
    wrapper.className = 'painel-adm';
    wrapper.id = 'adm_painel';

    const title = document.createElement('h2');
    title.innerHTML = '<i class="fas fa-folder-open" style="color:#d4af37"></i> LANÇAMENTOS - ADMINISTRATIVO';
    wrapper.appendChild(title);

    wrapper.appendChild(criarFiltrosEstrutura());

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-adm-container';

    const table = document.createElement('table');
    table.className = 'table-adm';

    const thead = document.createElement('thead');
    const metaCels = INDICADORES.map(ind =>
      `<th colspan="2"><input type="text" class="po-adm-meta in-meta-${ind}" value="${METAS_ATIVAS[ind]}" title="Meta editável — vale para todas as lojas"></th>`
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
    table.appendChild(thead);

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

    const tbody = document.createElement('tbody');
    tbody.id = "po-adm-tbody";
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
  // 🚪 EXPOSIÇÃO PÚBLICA E ACOPLAMENTO COM O SIDEBAR
  // ============================================================
  window.renderAdmTable = function (target) {
    inicializarDados();

    let container = null;
    if (typeof target === 'string') container = document.querySelector(target);
    else if (target instanceof HTMLElement) container = target;
    else container = document.getElementById('conteudo') || document.body;

    if (!container) return;
    
    const existing = document.getElementById('adm_painel');
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

// Ativador oficial disparado por clique no seu sidebar-painel-ouro.js
window.poLancAdm = function() {
  const container = document.getElementById('conteudo');
  if (container) container.innerHTML = ''; 
  window.renderAdmTable(container);
};