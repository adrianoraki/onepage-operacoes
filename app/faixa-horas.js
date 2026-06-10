console.log("✅ faixa-horas.js carregado");

window.FaixaHoras = window.FaixaHoras || {};

(function inicializarFaixaHoras() {
  const LOG_PREFIX = "⏱️ FaixaHoras";

  let indicadorSelecionadoFaixaHoras = "FAIXA HORAS";
  // ✅ usa a SEMANA ATUAL sempre que ela vira (descarta semana antiga salva)
  let semanaSelecionadaFaixaHoras = (function () {
    const atual = getSemanaAtualFaixaHoras().toString().padStart(2, "0");
    const salva = localStorage.getItem("semana");
    if (salva === atual) return salva;
    localStorage.setItem("semana", atual);
    return atual;
  })();

  // estado dos filtros (persiste entre recargas silenciosas)
  let _filtroRegionalFH = "TODAS";
  let _filtroTextoBuscaFH = "";

  const TABELA_STATE_FAIXA_HORAS = {
    salvando: new Set(),
  };

  const TABELA_UI_FAIXA_HORAS = {
    ocultarColunaRegional: true,
    estilosInjetados: false,
  };

  function logInfo(mensagem, payload = null) {
    if (payload !== null && payload !== undefined) {
      console.log(`${LOG_PREFIX} | ${mensagem}`, payload);
    } else {
      console.log(`${LOG_PREFIX} | ${mensagem}`);
    }
  }

  function logWarn(mensagem, payload = null) {
    if (payload !== null && payload !== undefined) {
      console.warn(`${LOG_PREFIX} | ${mensagem}`, payload);
    } else {
      console.warn(`${LOG_PREFIX} | ${mensagem}`);
    }
  }

  function logError(mensagem, payload = null) {
    if (payload !== null && payload !== undefined) {
      console.error(`${LOG_PREFIX} | ${mensagem}`, payload);
    } else {
      console.error(`${LOG_PREFIX} | ${mensagem}`);
    }
  }

  // ==========================
  // 📅 SEMANA ATUAL
  // ==========================
  function getSemanaAtualFaixaHoras() {
    const hoje = new Date();
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    const dias = Math.floor((hoje - inicioAno) / (24 * 60 * 60 * 1000));
    const semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);

    return semana;
  }

  // ==========================
  // 🔠 NORMALIZAR
  // ==========================
  function normalizarTextoFaixaHoras(valor) {
    return (valor || "").toString().trim();
  }

  function normalizarTextoFaixaHorasUpper(valor) {
    return normalizarTextoFaixaHoras(valor).toUpperCase();
  }

  // ==========================
  // 🧰 HELPERS SEGUROS
  // ==========================
  function escapeHtmlFaixaHoras(valor) {
    return (valor || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeCssSelectorFaixaHoras(valor) {
    const texto = (valor || "").toString();

    try {
      if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(texto);
      }
    } catch (erro) {
      logWarn("CSS.escape indisponível, usando fallback", erro);
    }

    return texto.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
  }

  function tipoEhMonetarioFaixaHoras(tipo) {
    const t = normalizarTextoFaixaHorasUpper(tipo);
    return (
      t === "MOEDA" ||
      t === "R$" ||
      t === "CURRENCY" ||
      t === "MONETARIO" ||
      t === "MONETÁRIO" ||
      t === "VALOR"
    );
  }

  function tipoEhPercentualFaixaHoras(tipo) {
    const t = normalizarTextoFaixaHorasUpper(tipo);
    return t === "PERCENTUAL" || t === "%" || t === "PORCENTAGEM";
  }

  function garantirEstilosTabelaFaixaHoras() {
    if (TABELA_UI_FAIXA_HORAS.estilosInjetados) return;

    const styleId = "estilos-tabela-faixa-horas";
    if (document.getElementById(styleId)) {
      TABELA_UI_FAIXA_HORAS.estilosInjetados = true;
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .tabela .col-regional-oculta,
      .tabela th[data-coluna="regional"],
      .tabela td[data-coluna="regional"] {
        display: none !important;
      }

      .tabela td {
        vertical-align: middle;
      }

      .campo-tabela-faixa-horas {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        box-sizing: border-box;
      }

      .campo-tabela-faixa-horas.tipo-moeda {
        min-width: 235px;
      }

      .campo-tabela-faixa-horas.tipo-percentual {
        min-width: 180px;
      }

      .campo-tabela-faixa-horas.tipo-padrao {
        min-width: 165px;
      }

      .input-valor-faixa-horas {
        width: 100%;
        min-width: 145px;
        max-width: none;
        box-sizing: border-box;
      }

      .campo-tabela-faixa-horas.tipo-moeda .input-valor-faixa-horas {
        min-width: 200px;
      }

      .campo-tabela-faixa-horas.tipo-percentual .input-valor-faixa-horas {
        min-width: 150px;
      }

      .tabela-container {
        overflow-x: auto;
      }
    `;

    document.head.appendChild(style);
    TABELA_UI_FAIXA_HORAS.estilosInjetados = true;

    logInfo("Estilos dinâmicos da tabela Faixa Horas injetados");
  }

  function ocultarColunaRegionalFaixaHoras(container = null) {
    if (!TABELA_UI_FAIXA_HORAS.ocultarColunaRegional) {
      logInfo("Ocultação da coluna regional desativada");
      return;
    }

    const alvo = container || document;
    const tabelas = alvo.querySelectorAll(".tabela");

    let totalTabelas = 0;
    let totalColunasOcultadas = 0;

    tabelas.forEach((table) => {
      totalTabelas++;

      const headers = [...table.querySelectorAll("thead th")];
      let indiceRegional = -1;

      headers.forEach((th, idx) => {
        const dataColuna = normalizarTextoFaixaHorasUpper(th.dataset.coluna || "");
        const texto = normalizarTextoFaixaHorasUpper(th.textContent || "");

        if (dataColuna === "REGIONAL" || texto === "REGIONAL") {
          indiceRegional = idx;
          th.classList.add("col-regional-oculta");
          th.dataset.coluna = "regional";
        }
      });

      if (indiceRegional === -1) {
        logInfo("Nenhuma coluna Regional detectada nesta tabela");
        return;
      }

      table.querySelectorAll("tbody tr").forEach((tr) => {
        const tds = tr.querySelectorAll("td");
        const td = tds[indiceRegional];
        if (td) {
          td.classList.add("col-regional-oculta");
          td.dataset.coluna = "regional";
        }
      });

      totalColunasOcultadas++;
    });

    logInfo("Coluna Regional ocultada nas tabelas renderizadas", {
      totalTabelas,
      totalColunasOcultadas,
    });
  }

  function aplicarLayoutTabelaFaixaHoras(container = null) {
    garantirEstilosTabelaFaixaHoras();
    ocultarColunaRegionalFaixaHoras(container);

    logInfo("Layout da tabela Faixa Horas aplicado");
  }

  function getChaveRegistroFaixaHoras(loja, semana, indicadorBanco, classe) {
    return `${loja}__${semana}__${indicadorBanco}__${classe}`;
  }

  function aplicarStatusInputFaixaHoras(input, status) {
    if (!input) return;

    if (status === "salvando") {
      input.style.border = "1px solid #1e88e5";
      input.style.background = "#eef6ff";
      return;
    }

    if (status === "sucesso") {
      input.style.border = "1px solid #43a047";
      input.style.background = "#eefaf0";

      setTimeout(() => {
        input.style.border = "1px solid #ccc";
        input.style.background = "#fff";
      }, 900);

      return;
    }

    if (status === "erro") {
      input.style.border = "1px solid #e53935";
      input.style.background = "#fff2f2";
      return;
    }

    input.style.border = "1px solid #ccc";
    input.style.background = "#fff";
  }

  function gerarSemanasFaixaHoras() {
    const atual = parseInt(
      semanaSelecionadaFaixaHoras || getSemanaAtualFaixaHoras(),
      10
    );

    const lista = [atual - 3, atual - 2, atual - 1, atual].map((s) =>
      s <= 0 ? 52 + s : s
    );

    const semanas = lista.map((s) => s.toString().padStart(2, "0"));

    logInfo("Semanas exibidas", { semanas });

    return semanas;
  }

  function obterClasseFaixaHoras() {
    return "Frente de Caixa";
  }

  function obterIndicadorBancoFaixaHoras() {
    return "FAIXA HORAS";
  }

  function getTituloFaixaHoras() {
    return "FAIXA HORAS";
  }

  function getClassesConsultaFaixaHoras() {
    return ["Frente de Caixa"];
  }

  // ==========================
  // 🔢 VALOR (funções LOCAIS — autônomas, não dependem de outros módulos)
  // banco de horas = número decimal (aceita 5 / 10,5 / 10.5 / -3 / 10:30)
  // ==========================
  function fhLimparValor(texto) {
    if (texto === null || texto === undefined) return null;
    let bruto = texto.toString().trim();
    if (!bruto) return null;

    bruto = bruto.replace(/\s/g, "").replace(/h/gi, "");

    // formato hora "10:30" → 10,5
    if (bruto.includes(":")) {
      const partes = bruto.split(":");
      const sinal = partes[0].startsWith("-") ? -1 : 1;
      const horas = Math.abs(parseInt(partes[0], 10)) || 0;
      const minutos = parseInt(partes[1], 10) || 0;
      const num = sinal * (horas + minutos / 60);
      return Number.isNaN(num) ? null : num;
    }

    // decimal normal: troca vírgula por ponto, remove pontos de milhar
    const normalizado = bruto.replace(/\.(?=.*\.)/g, "").replace(",", ".");
    const num = Number(normalizado);
    return Number.isNaN(num) ? null : num;
  }

  function fhFormatarValor(valor) {
    if (valor === null || valor === undefined || valor === "") return "";
    const num = Number(valor);
    if (!isFinite(num)) return "";
    // sem casas forçadas: 5 → "5", 10.5 → "10,5"
    return num.toString().replace(".", ",");
  }

  // ao focar, mostra o número cru editável (ponto vira vírgula visível)
  function fhPrepararEdicao(input) {
    if (!input) return;
    const bruto = (input.value || "").toString().trim();
    if (!bruto) return;
    const num = fhLimparValor(bruto);
    input.value = num === null ? "" : fhFormatarValor(num);
  }

  // ==========================
  // 💾 SALVAR
  // ==========================
  async function salvarValorFaixaHoras(loja, semana, valor) {
    const numero =
      valor === null || valor === undefined || valor === ""
        ? null
        : Number(valor);

    if (
      valor !== null &&
      valor !== undefined &&
      valor !== "" &&
      isNaN(numero)
    ) {
      logWarn("salvarValorFaixaHoras ignorado por número inválido", { valor });
      return false;
    }

    const indicadorBanco = obterIndicadorBancoFaixaHoras();
    const classe = obterClasseFaixaHoras();
    const chaveSalvar = getChaveRegistroFaixaHoras(
      loja,
      semana,
      indicadorBanco,
      classe
    );

    if (TABELA_STATE_FAIXA_HORAS.salvando.has(chaveSalvar)) {
      logWarn("Já existe um salvamento em andamento para este registro", {
        chaveSalvar,
      });
      return false;
    }

    TABELA_STATE_FAIXA_HORAS.salvando.add(chaveSalvar);

    logInfo("SALVAR Faixa Horas", {
      indicadorBanco,
      classe,
      loja,
      semana,
      numero,
    });

    try {
      const { data: existentes, error: erroBusca } = await window.db
        .from("resultados")
        .select("id, valor")
        .eq("loja", loja)
        .eq("semana", semana)
        .eq("indicador", indicadorBanco)
        .eq("classe", classe)
        .order("id", { ascending: true });

      if (erroBusca) throw erroBusca;

      const registros = existentes || [];

      if (registros.length > 1) {
        logWarn("Registros duplicados encontrados para a mesma chave", {
          loja,
          semana,
          indicadorBanco,
          classe,
          qtd: registros.length,
          ids: registros.map((r) => r.id),
        });
      }

      const payload = {
        valor: numero,
        justificativa: null, // ✅ Faixa Horas não trabalha com justificativa
      };

      if (registros.length >= 1) {
        const idAlvo = registros[0].id;

        const { error: erroUpdate } = await window.db
          .from("resultados")
          .update(payload)
          .eq("id", idAlvo);

        if (erroUpdate) throw erroUpdate;

        logInfo("Registro de Faixa Horas atualizado com sucesso", {
          id: idAlvo,
          loja,
          semana,
          indicadorBanco,
          classe,
          valor: numero,
        });

        return true;
      }

      const { data: inserido, error: erroInsert } = await window.db
        .from("resultados")
        .insert([
          {
            loja,
            semana,
            indicador: indicadorBanco,
            classe,
            valor: numero,
            justificativa: null,
          },
        ])
        .select("id")
        .single();

      if (erroInsert) throw erroInsert;

      logInfo("Registro de Faixa Horas inserido com sucesso", {
        id: inserido?.id,
        loja,
        semana,
        indicadorBanco,
        classe,
        valor: numero,
      });

      return true;
    } catch (erro) {
      logError("Erro salvarValorFaixaHoras", erro);
      // mostra o erro REAL (RLS, permissão, coluna) — senão fica invisível em produção
      if (typeof window.mostrarErro === "function") {
        const msg = erro?.message || erro?.hint || erro?.details || "erro desconhecido";
        window.mostrarErro("Não foi possível salvar Faixa Horas: " + msg);
      }
      return false;
    } finally {
      TABELA_STATE_FAIXA_HORAS.salvando.delete(chaveSalvar);
    }
  }

  // ==========================
  // ⚡ AUTO SAVE
  // ==========================
  async function autoSalvarFaixaHoras(input) {
    if (!input) return;

    const loja = input.dataset.loja;
    const semana = input.dataset.semana;
    const tipo = input.dataset.tipo || "numero";

    const valorDigitado = (input.value || "").toString().trim();
    const valorOriginalTxt = input.dataset.original ?? "";

    let valorLimpo = null;

    if (valorDigitado !== "") {
      valorLimpo = fhLimparValor(valorDigitado);

      if (valorLimpo === null || Number.isNaN(valorLimpo)) {
        logWarn("Valor inválido, salvamento ignorado", {
          loja,
          semana,
          valorDigitado,
        });

        aplicarStatusInputFaixaHoras(input, "erro");
        return false;
      }
    }

    // comparação NUMÉRICA (não string) — evita falso "sem alteração"
    const originalNum = valorOriginalTxt === "" ? null : fhLimparValor(valorOriginalTxt);
    const semAlteracao =
      (valorLimpo === null && originalNum === null) ||
      (valorLimpo !== null && originalNum !== null && valorLimpo === originalNum);

    if (semAlteracao) {
      logInfo("Nenhuma alteração detectada, salvamento ignorado", {
        loja,
        semana,
        valor: valorLimpo,
      });
      if (valorLimpo !== null) input.value = fhFormatarValor(valorLimpo);
      return true;
    }

    if (valorLimpo !== null) input.value = fhFormatarValor(valorLimpo);

    aplicarStatusInputFaixaHoras(input, "salvando");

    const salvou = await salvarValorFaixaHoras(loja, semana, valorLimpo);

    if (salvou) {
      input.dataset.original = valorLimpo === null ? "" : String(valorLimpo);
      aplicarStatusInputFaixaHoras(input, "sucesso");
      return true;
    }

    aplicarStatusInputFaixaHoras(input, "erro");
    return false;
  }

  // ==========================
  // 🧱 HTML TABELA
  // ==========================
  function montarLinhaFaixaHoras(loja, mapa, semanas) {
    const chaveLoja = `${loja.codigo} - ${loja.nome}`;
    const semanaAtualReal = getSemanaAtualFaixaHoras().toString().padStart(2, "0");

    const campoCfg =
      typeof getCampoConfig === "function"
        ? getCampoConfig("FAIXA HORAS", "valor", "Frente de Caixa")
        : { key: "valor", label: "Resultado", tipo: "numero" };

    let classeCampo = "tipo-padrao";
    if (tipoEhMonetarioFaixaHoras(campoCfg.tipo)) classeCampo = "tipo-moeda";
    else if (tipoEhPercentualFaixaHoras(campoCfg.tipo)) classeCampo = "tipo-percentual";

    let html = `
      <tr
        data-loja-codigo="${escapeHtmlFaixaHoras(loja.codigo)}"
        data-loja-nome="${escapeHtmlFaixaHoras(loja.nome)}"
        data-regional="${escapeHtmlFaixaHoras(loja.regional || "-")}"
      >
        <td data-coluna="codigo">${loja.codigo}</td>
        <td data-coluna="loja">${loja.nome}</td>
        <td
          data-coluna="regional"
          class="${TABELA_UI_FAIXA_HORAS.ocultarColunaRegional ? "col-regional-oculta" : ""}"
        >
          ${loja.regional || "-"}
        </td>
    `;

    semanas.forEach((semana) => {
      const reg = mapa[`${chaveLoja}-${semana}`];
      const valor = reg?.valor ?? "";
      const destaque = semana === semanaAtualReal ? "coluna-atual" : "";

      const valorFormatado = fhFormatarValor(valor);

      const valorOriginal =
        valor === null || valor === undefined || valor === ""
          ? ""
          : String(Number(valor));

      html += `
        <td class="${destaque}">
          <div class="campo-tabela-faixa-horas ${classeCampo}">
            <input
              type="text"
              inputmode="decimal"
              value="${escapeHtmlFaixaHoras(valorFormatado)}"
              data-loja="${escapeHtmlFaixaHoras(chaveLoja)}"
              data-semana="${escapeHtmlFaixaHoras(semana)}"
              data-campo="valor"
              data-tipo="${escapeHtmlFaixaHoras(campoCfg.tipo)}"
              data-original="${escapeHtmlFaixaHoras(valorOriginal)}"
              onfocus="window.fhPrepararEdicaoFaixaHoras(this)"
              onblur="window.autoSalvarFaixaHoras(this)"
              class="input-valor-faixa-horas"
            >
          </div>
        </td>
      `;
    });

    html += `</tr>`;

    return html;
  }

  function montarHTMLTbodyFaixaHoras(lojas, mapa, semanas) {
    return lojas.map((loja) => montarLinhaFaixaHoras(loja, mapa, semanas)).join("");
  }

  function montarHTMLTabelaFaixaHoras(lojas, mapa, semanas) {
    const titulo = getTituloFaixaHoras();
    const semanaAtualReal = getSemanaAtualFaixaHoras().toString().padStart(2, "0");
    const getInfo = typeof window.getInfoSemana === "function"
      ? window.getInfoSemana
      : (s) => `Semana ${s}`;

    let html = `
      <div class="card-conteudo">

        <div class="header-tabela">
          <h2>📊 ${titulo}</h2>

          <select class="filtro-semana${semanaSelecionadaFaixaHoras === semanaAtualReal ? " semana-atual-ativa" : ""}" onchange="window.alterarSemanaFaixaHoras(this.value)">
            ${gerarOptionsSemanasFaixaHoras()}
          </select>
        </div>

        <div class="info-semana">
          ${getInfo(semanaSelecionadaFaixaHoras || semanaAtualReal)}
        </div>

        <div class="filtros-tabela filtros-novos">
          <input
            type="text"
            id="filtroBuscaLoja"
            placeholder="Buscar código ou nome da loja"
          >

          <div class="grupo-filtro-regional">
            <button type="button" class="btn-filtro-regional ativo" data-regional="TODAS">
              Todas
            </button>
            <button type="button" class="btn-filtro-regional" data-regional="NE1">
              NE1
            </button>
            <button type="button" class="btn-filtro-regional" data-regional="NE2">
              NE2
            </button>
          </div>
        </div>

        <div class="tabela-container">
          <table class="tabela">
            <thead>
              <tr>
                <th data-coluna="codigo">Código</th>
                <th data-coluna="loja">Loja</th>
                <th data-coluna="regional" class="${
                  TABELA_UI_FAIXA_HORAS.ocultarColunaRegional ? "col-regional-oculta" : ""
                }">Regional</th>
    `;

    semanas.forEach((sem) => {
      const destaque = sem === semanaAtualReal ? ' class="coluna-atual"' : "";
      html += `<th${destaque}>SEM ${sem}</th>`;
    });

    html += `
              </tr>
            </thead>
            <tbody id="tbody-tabela">
    `;

    lojas.forEach((loja) => {
      html += montarLinhaFaixaHoras(loja, mapa, semanas);
    });

    html += `
            </tbody>
          </table>
        </div>

      </div>
    `;

    logInfo("HTML da tabela Faixa Horas montado", {
      titulo,
      totalLojas: lojas.length,
      totalSemanas: semanas.length,
      ocultarColunaRegional: TABELA_UI_FAIXA_HORAS.ocultarColunaRegional,
    });

    return html;
  }

  // ==========================
  // 🔢 GERAR OPTIONS SEMANA
  // ==========================
  function gerarOptionsSemanasFaixaHoras() {
    let html = "";

    const selecionada =
      semanaSelecionadaFaixaHoras ||
      getSemanaAtualFaixaHoras().toString().padStart(2, "0");
    const real = getSemanaAtualFaixaHoras().toString().padStart(2, "0");

    logInfo("Gerando options - semana ativa", { selecionada, real });

    for (let i = 1; i <= 53; i++) {
      const s = i.toString().padStart(2, "0");
      const selected = s === selecionada ? "selected" : "";
      const label = s === real ? `Semana ${s} ★` : `Semana ${s}`;
      html += `<option value="${s}" ${selected}>${label}</option>`;
    }

    return html;
  }

  // ==========================
  // 🔄 ALTERAR SEMANA
  // ==========================
  function alterarSemanaFaixaHoras(sem) {
    if (sem === semanaSelecionadaFaixaHoras) {
      logWarn("Semana já ativa, ignorando");
      return;
    }

    semanaSelecionadaFaixaHoras = sem;
    localStorage.setItem("semana", sem);
    _filtroTextoBuscaFH = "";
    _filtroRegionalFH = "TODAS";

    logInfo("Semana alterada", { sem });

    carregarFaixaHoras();
  }

  // ==========================
  // 🔎 FILTROS
  // ==========================
  function ativarFiltrosFaixaHoras() {
    logInfo("Ativando filtros Faixa Horas");

    const busca = document.getElementById("filtroBuscaLoja");
    const botoesRegional = document.querySelectorAll(".btn-filtro-regional");

    if (!busca || !botoesRegional.length) {
      logWarn("Filtros padrão não disponíveis nessa tabela");
      return;
    }

    // restaura estado salvo
    busca.value = _filtroTextoBuscaFH;
    botoesRegional.forEach((b) => {
      b.classList.toggle("ativo", b.dataset.regional === _filtroRegionalFH);
    });

    const aplicar = () => {
      const termo = busca.value.toLowerCase().trim();
      _filtroTextoBuscaFH = busca.value;

      document.querySelectorAll("#tbody-tabela tr").forEach((row) => {
        const tds = row.querySelectorAll("td");
        if (tds.length < 2) return;

        const codigo = (row.dataset.lojaCodigo || tds[0]?.textContent || "")
          .toString()
          .toLowerCase();
        const loja = (row.dataset.lojaNome || tds[1]?.textContent || "")
          .toString()
          .toLowerCase();
        const regional = (row.dataset.regional || tds[2]?.textContent || "")
          .toString()
          .toLowerCase();

        const matchBusca =
          !termo || codigo.includes(termo) || loja.includes(termo);

        const matchRegional =
          _filtroRegionalFH === "TODAS" ||
          regional === _filtroRegionalFH.toLowerCase();

        row.style.display = matchBusca && matchRegional ? "" : "none";
      });
    };

    busca.addEventListener("input", aplicar);

    botoesRegional.forEach((btn) => {
      btn.addEventListener("click", () => {
        botoesRegional.forEach((b) => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        _filtroRegionalFH = btn.dataset.regional || "TODAS";
        logInfo("Filtro regional alterado", { _filtroRegionalFH });
        aplicar();
      });
    });

    aplicar();

    logInfo("Filtros Faixa Horas ativados com sucesso");
  }

  function reaplicarFiltrosFaixaHoras() {
    document.querySelectorAll("#tbody-tabela tr").forEach((row) => {
      const tds = row.querySelectorAll("td");
      if (tds.length < 2) return;

      const codigo = (row.dataset.lojaCodigo || tds[0]?.textContent || "").toLowerCase();
      const loja = (row.dataset.lojaNome || tds[1]?.textContent || "").toLowerCase();
      const regional = (row.dataset.regional || tds[2]?.textContent || "").toLowerCase();
      const termo = _filtroTextoBuscaFH.toLowerCase().trim();

      const matchBusca = !termo || codigo.includes(termo) || loja.includes(termo);
      const matchRegional =
        _filtroRegionalFH === "TODAS" ||
        regional === _filtroRegionalFH.toLowerCase();

      row.style.display = matchBusca && matchRegional ? "" : "none";
    });
  }

  // ==========================
  // 📊 CARREGAR TABELA FAIXA HORAS
  // ==========================
  async function carregarFaixaHoras({ silencioso = false } = {}) {
    logInfo("carregarFaixaHoras iniciado", { silencioso });

    try {
      if (!window.db) {
        logError("window.db não inicializado");
        if (typeof window.mostrarErro === "function") {
          window.mostrarErro("Conexão com banco não iniciada");
        }
        return;
      }

      logInfo("Semana ativa Faixa Horas", {
        semanaSelecionadaFaixaHoras,
      });

      const indicadorBanco = obterIndicadorBancoFaixaHoras();
      const classeAtual = obterClasseFaixaHoras();
      const semanas = gerarSemanasFaixaHoras();

      const [lojasResp, resultadosResp] = await Promise.all([
        window.db.from("lojas").select("*").order("codigo"),
        window.db
          .from("resultados")
          .select("*")
          .eq("indicador", indicadorBanco)
          .in("classe", getClassesConsultaFaixaHoras())
          .in("semana", semanas),
      ]);

      if (lojasResp.error) throw lojasResp.error;
      if (resultadosResp.error) throw resultadosResp.error;

      const lojas = lojasResp.data || [];
      const resultados = resultadosResp.data || [];

      logInfo("Lojas carregadas", { total: lojas.length });
      logInfo("Registros de Faixa Horas carregados", {
        total: resultados.length,
      });

      const mapa = {};
      resultados.forEach((r) => {
        mapa[`${r.loja}-${r.semana}`] = r;
      });

      const container = document.getElementById("conteudo");
      if (!container) {
        logError("#conteudo não encontrado");
        return;
      }

      // modo silencioso: atualiza só o tbody, preserva filtros intactos
      const tbody = container.querySelector("#tbody-tabela");
      if (silencioso && tbody) {
        tbody.innerHTML = montarHTMLTbodyFaixaHoras(lojas, mapa, semanas);

        if (typeof aplicarPermissoesTabela === "function") {
          aplicarPermissoesTabela(indicadorBanco, classeAtual);
        }
        reaplicarFiltrosFaixaHoras();
        logInfo("Atualização silenciosa Faixa Horas concluída (tbody-only)");
        return;
      }

      container.innerHTML = montarHTMLTabelaFaixaHoras(lojas, mapa, semanas);

      aplicarLayoutTabelaFaixaHoras(container);

      if (typeof aplicarPermissoesTabela === "function") {
        aplicarPermissoesTabela(indicadorBanco, classeAtual);
      }

      ativarFiltrosFaixaHoras();

      logInfo("Tabela Faixa Horas carregada com sucesso", {
        indicadorBanco,
        classeAtual,
        totalLojas: lojas.length,
        totalResultados: resultados.length,
      });
    } catch (erro) {
      logError("Erro carregarFaixaHoras", erro);

      if (typeof window.mostrarErro === "function") {
        window.mostrarErro("Erro ao carregar tabela de Faixa Horas");
      }
    }
  }

  // ==========================
  // 🖥️ TELA
  // ==========================
  async function telaFaixaHoras() {
    logInfo("Abrindo tela Faixa Horas");

    const conteudo = document.getElementById("conteudo");
    if (!conteudo) {
      logError("#conteudo não encontrado");
      return;
    }

    conteudo.innerHTML = `
      <div class="card-conteudo">
        <h2>📊 FAIXA HORAS</h2>
        <p>Carregando...</p>
      </div>
    `;

    await carregarFaixaHoras();
  }

  // ==========================
  // 🌐 EXPOR
  // ==========================
  window.telaFaixaHoras = telaFaixaHoras;
  window.carregarFaixaHoras = carregarFaixaHoras;
  window.alterarSemanaFaixaHoras = alterarSemanaFaixaHoras;
  window.autoSalvarFaixaHoras = autoSalvarFaixaHoras;
  window.fhPrepararEdicaoFaixaHoras = fhPrepararEdicao;

  window.FaixaHoras.telaFaixaHoras = telaFaixaHoras;
  window.FaixaHoras.carregarFaixaHoras = carregarFaixaHoras;
  window.FaixaHoras.alterarSemanaFaixaHoras = alterarSemanaFaixaHoras;
  window.FaixaHoras.autoSalvarFaixaHoras = autoSalvarFaixaHoras;

  logInfo("faixa-horas.js pronto", {
    telaFaixaHoras: typeof window.telaFaixaHoras,
    carregarFaixaHoras: typeof window.carregarFaixaHoras,
    alterarSemanaFaixaHoras: typeof window.alterarSemanaFaixaHoras,
    autoSalvarFaixaHoras: typeof window.autoSalvarFaixaHoras,
  });
})();