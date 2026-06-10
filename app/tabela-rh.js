// ==========================
// 🧩 TABELA ESPECIAL RH
// (BANCOS DE HORAS / RH ESPECIAL)
// ==========================

const TABELA_RH_STATE = {
  salvando: new Set(),
};

const TABELA_RH_UI = {
  ocultarColunaRegional: true,
  usarJustificativa: false,
  estilosInjetados: false,
};

console.log("✅ tabela-rh.js carregado", {
  ocultarColunaRegional: TABELA_RH_UI.ocultarColunaRegional,
  usarJustificativa: TABELA_RH_UI.usarJustificativa,
});

// ==========================
// 🗝️ CHAVE DE REGISTRO RH
// ==========================
function getChaveRegistroRH(loja, semana, indicadorBanco, classe, campo) {
  return `${loja}__${semana}__${indicadorBanco}__${classe}__${campo}`;
}

// ==========================
// 🖍️ STATUS VISUAL DO INPUT RH
// ==========================
function aplicarStatusInputRH(input, status) {
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
      input.style.border = "";
      input.style.background = "";
    }, 900);

    return;
  }

  if (status === "erro") {
    input.style.border = "1px solid #e53935";
    input.style.background = "#fff2f2";
    return;
  }

  input.style.border = "";
  input.style.background = "";
}

// ==========================
// 🧰 HELPERS RH
// ==========================
function escapeHtmlRH(valor) {
  if (typeof escapeHtmlTabela === "function") {
    return escapeHtmlTabela(valor);
  }

  return (valor || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeCssSelectorRH(valor) {
  if (typeof escapeCssSelectorTabela === "function") {
    return escapeCssSelectorTabela(valor);
  }

  const texto = (valor || "").toString();

  try {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(texto);
    }
  } catch (erro) {
    console.warn("⚠️ CSS.escape indisponível em RH, usando fallback:", erro);
  }

  return texto.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

function normalizarTextoRH(valor) {
  if (typeof normalizarTextoTabela === "function") {
    return normalizarTextoTabela(valor);
  }
  return (valor || "").toString().trim();
}

function normalizarTextoRHUpper(valor) {
  return normalizarTextoRH(valor).toUpperCase();
}

function valorCampoEstaVazioRH(valor) {
  return normalizarTextoRH(valor) === "";
}

function tipoEhMonetarioRH(tipo) {
  const t = normalizarTextoRHUpper(tipo);
  return (
    t === "MOEDA" ||
    t === "R$" ||
    t === "CURRENCY" ||
    t === "MONETARIO" ||
    t === "MONETÁRIO" ||
    t === "VALOR"
  );
}

function tipoEhPercentualRH(tipo) {
  const t = normalizarTextoRHUpper(tipo);
  return t === "PERCENTUAL" || t === "%" || t === "PORCENTAGEM";
}

function getClasseLarguraCampoRH(tipo) {
  if (tipoEhMonetarioRH(tipo)) return "tipo-moeda";
  if (tipoEhPercentualRH(tipo)) return "tipo-percentual";
  return "tipo-padrao";
}

function getLarguraCampoRHPx(indicador, campo, tipo, semana = null) {
  const indicadorNorm = normalizarTextoRHUpper(indicador || "");
  const campoNorm = normalizarTextoRHUpper(campo || "");
  const tipoNorm = normalizarTextoRHUpper(tipo || "");

  let base = 135;

  // Banco de horas / RH operacional
  if (
    indicadorNorm === "BANCOS DE HORAS" ||
    indicadorNorm === "BANCO DE HORAS" ||
    indicadorNorm === "RH / OPERACIONAL"
  ) {
    if (campoNorm === "VALOR") {
      base = 145; // Horas +
    } else if (campoNorm === "VALOR2") {
      base = 145; // Horas -
    } else {
      base = 135;
    }
  } else if (
    tipoNorm === "MOEDA" ||
    tipoNorm === "R$" ||
    tipoNorm === "MONETARIO" ||
    tipoNorm === "MONETÁRIO"
  ) {
    base = 170;
  } else if (
    tipoNorm === "PERCENTUAL" ||
    tipoNorm === "%" ||
    tipoNorm === "PORCENTAGEM"
  ) {
    base = 145;
  } else {
    base = 135;
  }

  const final = Math.max(base, 110);

  console.log("📏 Largura calculada do campo RH:", {
    indicador: indicadorNorm,
    campo: campoNorm,
    tipo: tipoNorm,
    semana,
    final,
  });

  return final;
}

function getAlturaCampoRHPx(indicador, campo, tipo, semana = null) {
  const indicadorNorm = normalizarTextoRHUpper(indicador || "");
  const campoNorm = normalizarTextoRHUpper(campo || "");
  const tipoNorm = normalizarTextoRHUpper(tipo || "");

  let altura = 32;

  if (
    indicadorNorm === "BANCOS DE HORAS" ||
    indicadorNorm === "BANCO DE HORAS" ||
    indicadorNorm === "RH / OPERACIONAL"
  ) {
    if (campoNorm === "VALOR" || campoNorm === "VALOR2") {
      altura = 34;
    }
  } else if (
    tipoNorm === "MOEDA" ||
    tipoNorm === "R$" ||
    tipoNorm === "MONETARIO" ||
    tipoNorm === "MONETÁRIO"
  ) {
    altura = 34;
  }

  console.log("📐 Altura calculada do campo RH:", {
    indicador: indicadorNorm,
    campo: campoNorm,
    tipo: tipoNorm,
    semana,
    altura,
  });

  return altura;
}

function getClassAttrRH(classes = []) {
  const lista = (classes || []).filter(Boolean).join(" ").trim();
  return lista ? ` class="${lista}"` : "";
}

function garantirEstilosTabelaRH() {
  if (TABELA_RH_UI.estilosInjetados) return;

  const styleId = "estilos-tabela-rh-ajustes";
  if (document.getElementById(styleId)) {
    TABELA_RH_UI.estilosInjetados = true;
    return;
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .tabela-rh-compacta {
      width: max-content !important;
      min-width: 100% !important;
      table-layout: auto !important;
      border-collapse: collapse;
    }

    .tabela-rh-compacta .col-regional-oculta,
    .tabela-rh-compacta th[data-coluna="regional"],
    .tabela-rh-compacta td[data-coluna="regional"] {
      display: none !important;
    }

    .tabela-rh-compacta th,
    .tabela-rh-compacta td {
      vertical-align: middle;
      box-sizing: border-box;
      white-space: nowrap;
    }

    .tabela-rh-compacta .col-codigo-rh {
      width: 58px !important;
      min-width: 58px !important;
      max-width: 58px !important;
    }

    .tabela-rh-compacta .col-loja-rh {
      min-width: 170px !important;
      max-width: 220px !important;
      width: 170px !important;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tabela-rh-compacta .celula-rh-valor {
      box-sizing: border-box;
      padding: 5px 6px !important;
    }

    .tabela-rh-compacta .campo-tabela-rh {
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
    }

    .tabela-rh-compacta .input-tabela-rh {
      box-sizing: border-box;
      width: 100% !important;
      max-width: none !important;
      padding: 5px 8px !important;
      line-height: 1.2 !important;
      font-size: 11px !important;
      border-radius: 6px;
    }

    .tabela-rh-ajustada {
      overflow-x: auto !important;
      overflow-y: auto !important;
      max-height: calc(100dvh - 220px) !important;
      width: 100%;
    }
  `;

  document.head.appendChild(style);
  TABELA_RH_UI.estilosInjetados = true;

  console.log("🎨 Estilos da tabela RH injetados com campo ajustado");
}

function aplicarLayoutTabelaRH(container = null) {
  garantirEstilosTabelaRH();

  const alvo = container || document;
  const tabelas = alvo.querySelectorAll(".tabela-rh-compacta");

  let totalTabelas = 0;
  let totalColunasOcultadas = 0;

  tabelas.forEach((table) => {
    totalTabelas++;

    const headers = [...table.querySelectorAll("thead th")];
    let indicesRegional = [];

    headers.forEach((th, idx) => {
      const texto = normalizarTextoRHUpper(th.textContent || "");
      const dataColuna = normalizarTextoRHUpper(th.dataset.coluna || "");

      if (
        texto === "REGIONAL" ||
        dataColuna === "REGIONAL" ||
        th.classList.contains("col-regional-rh")
      ) {
        indicesRegional.push(idx);
        th.classList.add("col-regional-oculta");
        th.dataset.coluna = "regional";
      }
    });

    if (!indicesRegional.length) {
      console.log("ℹ️ Nenhuma coluna Regional encontrada na tabela RH");
      return;
    }

    table.querySelectorAll("tbody tr").forEach((tr) => {
      const tds = tr.querySelectorAll("td");

      indicesRegional.forEach((idx) => {
        const td = tds[idx];
        if (td) {
          td.classList.add("col-regional-oculta");
          td.dataset.coluna = "regional";
        }
      });
    });

    totalColunasOcultadas += indicesRegional.length;
  });

  console.log("👁️ Layout/ocultação aplicado na tabela RH:", {
    totalTabelas,
    totalColunasOcultadas,
  });
}

// ==========================
// 📅 REFERÊNCIA TEMPORAL RH
// Compatível com histórico por ano/mês/dia/semana
// ==========================
function getIndicadorRHSeguro() {
  try {
    if (typeof indicadorSelecionado !== "undefined" && indicadorSelecionado) {
      return indicadorSelecionado;
    }
  } catch (erro) {
    return "";
  }

  return localStorage.getItem("indicador") || "";
}

function getAnoReferenciaRHAtual() {
  const anoStorage =
    localStorage.getItem("anoReferencia") ||
    localStorage.getItem("ano_referencia") ||
    localStorage.getItem("ano");

  const ano = Number(anoStorage);

  if (Number.isFinite(ano) && ano >= 2020 && ano <= 2100) {
    return ano;
  }

  return new Date().getFullYear();
}

function getMesReferenciaRHAtual() {
  const mesStorage =
    localStorage.getItem("mesReferencia") ||
    localStorage.getItem("mes_referencia") ||
    localStorage.getItem("mes");

  const mes = Number(mesStorage);

  if (Number.isFinite(mes) && mes >= 1 && mes <= 12) {
    return mes;
  }

  return new Date().getMonth() + 1;
}

function getDataReferenciaRHAtual() {
  const dataStorage =
    localStorage.getItem("dataReferencia") ||
    localStorage.getItem("data_referencia");

  if (dataStorage && /^\d{4}-\d{2}-\d{2}$/.test(dataStorage)) {
    return dataStorage;
  }

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function getGranularidadeRHAtual() {
  return (
    localStorage.getItem("granularidade") ||
    localStorage.getItem("granularidade_referencia") ||
    "semanal"
  );
}

function getOrigemModuloRH(classe) {
  return (
    classe || localStorage.getItem("classeSelecionada") || "RH / Operacional"
  );
}

function getOrigemTabelaRH(indicadorBanco) {
  return indicadorBanco || getIndicadorRHSeguro() || "BANCO DE HORAS";
}

// ==========================
// 🧹 JUSTIFICATIVAS DESATIVADAS
// mantidas como compatibilidade / no-op
// ==========================
function getListaJustificativasRH() {
  return [];
}

function getIndicadorRHAtualNormalizado() {
  return getIndicadorRHSeguro().toString().trim().toUpperCase();
}

function getColunaJustificativaRH(campo) {
  if (campo === "valor") return "justificativa_valor";
  if (campo === "valor2") return "justificativa_valor2";

  return "justificativa";
}

function getLabelCampoRH(campo) {
  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const config = getConfigTabelaRH(indicadorSelecionado, classeSelecionada);

  if (campo === "valor") return config.col1 || "Horas +";
  if (campo === "valor2") return config.col2 || "Horas -";

  return campo;
}

function getInputRH(loja, semana, campo) {
  const lojaEsc = escapeCssSelectorRH(loja);
  const semanaEsc = escapeCssSelectorRH(semana);
  const campoEsc = escapeCssSelectorRH(campo);

  const el = document.querySelector(
    `#tbody-rh input[data-loja="${lojaEsc}"][data-semana="${semanaEsc}"][data-campo="${campoEsc}"]`,
  );

  if (!el) {
    console.warn("⚠️ Input RH não encontrado:", { loja, semana, campo });
  }

  return el;
}

function getBotaoJustificativaRH() {
  return null;
}

function getBotaoRHDoInput() {
  return null;
}

function getInputDoBotaoRH() {
  return null;
}

// ==========================
// 🖱️ CONTROLE DE CLIQUE RH
// ==========================
function prepararCliqueJustificativaRH(event = null) {
  console.log(
    "ℹ️ prepararCliqueJustificativaRH ignorado: justificativas removidas",
  );
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function finalizarCliqueJustificativaRH() {
  console.log(
    "ℹ️ finalizarCliqueJustificativaRH ignorado: justificativas removidas",
  );
}

// ==========================
// 🎨 ESTADO VISUAL RH
// ==========================
function atualizarEstadoVisualBotaoRH() {
  return;
}

function atualizarEstadoVisualInputRHComJustificativa(input) {
  if (!input) return;
  input.classList.remove("input-com-justificativa");
}

function atualizarVisibilidadeJustificativaRH(input) {
  if (!input) return;
  input.classList.remove("input-com-justificativa");
}

function sincronizarJustificativasComPermissoesTabelaRH() {
  console.log("ℹ️ Justificativas da tabela RH desativadas definitivamente");
}

// ==========================
// 🪟 PAINEL DE JUSTIFICATIVA RH DESATIVADO
// ==========================
function garantirPainelJustificativaRH() {
  console.log("ℹ️ Painel RH desativado");
  return null;
}

function posicionarPainelJustificativaRH() {
  return;
}

function marcarJustificativaSelecionadaNoPainelRH() {
  return;
}

function abrirPainelJustificativaRH(botao, event = null) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  console.log("ℹ️ Painel RH não abre: justificativas removidas");
}

function fecharPainelJustificativaRH() {
  const painel = document.getElementById("painel-justificativa-rh-flutuante");
  if (painel) {
    painel.classList.remove("ativo");
  }

  console.log("ℹ️ Painel RH fechado/ignorado");
}

async function selecionarJustificativaPainelRH(motivo) {
  console.log("ℹ️ selecionarJustificativaPainelRH ignorado:", motivo);
  return false;
}

// ==========================
// ⚙️ CONFIG RH
// ==========================
function getConfigTabelaRH(indicador, classeSelecionada = null) {
  if (typeof getIndicadorConfig === "function") {
    const cfg = getIndicadorConfig(indicador, classeSelecionada);

    const campo1 =
      typeof getCampoConfig === "function"
        ? getCampoConfig(indicador, "valor", classeSelecionada)
        : { key: "valor", label: "Horas +", tipo: "numero" };

    const campo2 =
      typeof getCampoConfig === "function"
        ? getCampoConfig(indicador, "valor2", classeSelecionada)
        : { key: "valor2", label: "Horas -", tipo: "numero" };

    return {
      titulo: cfg?.nomeExibicao || indicador,
      col1: campo1.label || "Horas +",
      col2: campo2.label || "Horas -",
      tipo1: campo1.tipo || "numero",
      tipo2: campo2.tipo || "numero",
    };
  }

  return {
    titulo: indicador || "BANCO DE HORAS",
    col1: "Horas +",
    col2: "Horas -",
    tipo1: "numero",
    tipo2: "numero",
  };
}

// ==========================
// 🧱 MONTAR TABELA RH
// ==========================
function montarTabelaRH(lojas, mapa, semanas) {
  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const config = getConfigTabelaRH(indicadorSelecionado, classeSelecionada);
  const semanaAtualReal = getSemanaAtual().toString().padStart(2, "0");

  console.log("🧩 Montando tabela RH:", {
    indicadorSelecionado,
    classeSelecionada,
    config,
    totalLojas: lojas?.length || 0,
    totalSemanas: semanas?.length || 0,
    ocultarColunaRegional: TABELA_RH_UI.ocultarColunaRegional,
    usarJustificativa: TABELA_RH_UI.usarJustificativa,
  });

  let html = `
    <div class="card-conteudo">

      <div class="header-tabela">
        <h2>📊 ${config.titulo}</h2>

        <div class="filtro-periodo">
          <select class="filtro-mes" onchange="alterarMes(this.value)">
            ${typeof gerarOptionsMesesTabela === "function" ? gerarOptionsMesesTabela() : ""}
          </select>
          <select class="filtro-semana" onchange="alterarSemana(this.value)">
            ${gerarOptionsSemanas()}
          </select>
        </div>
      </div>

      <div class="filtros-tabela filtros-novos">
        <input
          type="text"
          id="filtroRH"
          placeholder="Buscar código ou nome da loja"
        >

        <div class="grupo-filtro-regional">
          <button type="button" class="btn-filtro-regional-rh ativo" data-regional="TODAS">
            Todas
          </button>
          <button type="button" class="btn-filtro-regional-rh" data-regional="NE1">
            NE1
          </button>
          <button type="button" class="btn-filtro-regional-rh" data-regional="NE2">
            NE2
          </button>
        </div>
      </div>

      <div class="tabela-container tabela-rh-ajustada">
        <table class="tabela tabela-rh-compacta">
          <thead>
            <tr>
              <th rowspan="2" class="col-codigo-rh" data-coluna="codigo">Código</th>
              <th rowspan="2" class="col-loja-rh" data-coluna="loja">Loja</th>
              <th
                rowspan="2"
                class="col-regional-rh ${TABELA_RH_UI.ocultarColunaRegional ? "col-regional-oculta" : ""}"
                data-coluna="regional"
              >
                Regional
              </th>
  `;

  semanas.forEach((semana) => {
    const semanaNorm = (semana || "").toString().padStart(2, "0");
    const classesSemana = [];
    if (semanaNorm === semanaAtualReal) classesSemana.push("coluna-atual");

    html += `<th colspan="2"${getClassAttrRH(classesSemana)}>Semana ${semanaNorm}</th>`;
  });

  html += `
            </tr>
            <tr>
  `;

  semanas.forEach((semana) => {
    const semanaNorm = (semana || "").toString().padStart(2, "0");
    const classesSemana1 = [];
    if (semanaNorm === semanaAtualReal) classesSemana1.push("coluna-atual");
    const classesSemana2 = [...classesSemana1];

    html += `
      <th${getClassAttrRH(classesSemana1)}>${config.col1}</th>
      <th${getClassAttrRH(classesSemana2)}>${config.col2}</th>
    `;
  });

  html += `
            </tr>
          </thead>
          <tbody id="tbody-rh">
  `;

  lojas.forEach((loja) => {
    const chaveLoja = `${loja.codigo} - ${loja.nome}`;

    html += `
      <tr
        data-loja-codigo="${escapeHtmlRH(loja.codigo)}"
        data-loja-nome="${escapeHtmlRH(loja.nome)}"
        data-regional="${escapeHtmlRH(loja.regional || "-")}"
      >
        <td class="col-codigo-rh" data-coluna="codigo">${loja.codigo}</td>
        <td class="col-loja-rh" data-coluna="loja">${loja.nome}</td>
        <td
          class="col-regional-rh ${TABELA_RH_UI.ocultarColunaRegional ? "col-regional-oculta" : ""}"
          data-coluna="regional"
        >
          ${loja.regional || "-"}
        </td>
    `;

    semanas.forEach((semana) => {
      const semanaNorm = (semana || "").toString().padStart(2, "0");
      const key = `${chaveLoja}-${semanaNorm}`;
      const item = mapa[key] || {};

      const horasMais = item.valor ?? "";
      const horasMenos = item.valor2 ?? "";
      const classesCelula = ["celula-rh-valor"];
      if (semanaNorm === semanaAtualReal) classesCelula.push("coluna-atual");

      const valorFormatado =
        typeof formatarValorParaInput === "function"
          ? formatarValorParaInput(horasMais, config.tipo1)
          : horasMais;

      const valor2Formatado =
        typeof formatarValorParaInput === "function"
          ? formatarValorParaInput(horasMenos, config.tipo2)
          : horasMenos;

      const original1 =
        horasMais === null || horasMais === undefined || horasMais === ""
          ? ""
          : String(horasMais);

      const original2 =
        horasMenos === null || horasMenos === undefined || horasMenos === ""
          ? ""
          : String(horasMenos);

      const classeCampo1 = getClasseLarguraCampoRH(config.tipo1);
      const classeCampo2 = getClasseLarguraCampoRH(config.tipo2);

      const largura1 = getLarguraCampoRHPx(
        indicadorSelecionado,
        "valor",
        config.tipo1,
        semanaNorm,
      );

      const largura2 = getLarguraCampoRHPx(
        indicadorSelecionado,
        "valor2",
        config.tipo2,
        semanaNorm,
      );

      const altura1 = getAlturaCampoRHPx(
        indicadorSelecionado,
        "valor",
        config.tipo1,
        semanaNorm,
      );

      const altura2 = getAlturaCampoRHPx(
        indicadorSelecionado,
        "valor2",
        config.tipo2,
        semanaNorm,
      );

      const larguraInput1 = Math.max(largura1 - 18, 100);
      const larguraInput2 = Math.max(largura2 - 18, 100);

      html += `
        <td
          ${getClassAttrRH([...classesCelula, classeCampo1])}
          style="min-width:${largura1}px; width:${largura1}px;"
        >
          <div
            class="campo-tabela-rh ${classeCampo1}"
            style="min-width:${largura1}px; width:${largura1}px;"
          >
            <input
              type="text"
              inputmode="decimal"
              value="${escapeHtmlRH(valorFormatado)}"
              data-loja="${escapeHtmlRH(chaveLoja)}"
              data-semana="${escapeHtmlRH(semanaNorm)}"
              data-campo="valor"
              data-tipo="${escapeHtmlRH(config.tipo1)}"
              data-original="${escapeHtmlRH(original1)}"
              data-original-justificativa=""
              class="input-tabela input-tabela-rh"
              style="
                min-width:${larguraInput1}px;
                width:${larguraInput1}px;
                max-width:${larguraInput1}px;
                min-height:${altura1}px;
                height:${altura1}px;
              "
              onfocus="prepararInputRH(this)"
              onblur="autoSalvarRH(this)"
            >
          </div>
        </td>

        <td
          ${getClassAttrRH([...classesCelula, classeCampo2])}
          style="min-width:${largura2}px; width:${largura2}px;"
        >
          <div
            class="campo-tabela-rh ${classeCampo2}"
            style="min-width:${largura2}px; width:${largura2}px;"
          >
            <input
              type="text"
              inputmode="decimal"
              value="${escapeHtmlRH(valor2Formatado)}"
              data-loja="${escapeHtmlRH(chaveLoja)}"
              data-semana="${escapeHtmlRH(semanaNorm)}"
              data-campo="valor2"
              data-tipo="${escapeHtmlRH(config.tipo2)}"
              data-original="${escapeHtmlRH(original2)}"
              data-original-justificativa=""
              class="input-tabela input-tabela-rh"
              style="
                min-width:${larguraInput2}px;
                width:${larguraInput2}px;
                max-width:${larguraInput2}px;
                min-height:${altura2}px;
                height:${altura2}px;
              "
              onfocus="prepararInputRH(this)"
              onblur="autoSalvarRH(this)"
            >
          </div>
        </td>
      `;
    });

    html += `</tr>`;
  });

  html += `
          </tbody>
        </table>
      </div>

    </div>
  `;

  requestAnimationFrame(() => {
    aplicarLayoutTabelaRH(document.getElementById("conteudo"));
    ativarFiltroRH();
    sincronizarJustificativasComPermissoesTabelaRH();
  });

  return html;
}

// ==========================
// ✍️ PREPARAR INPUT RH
// ==========================
function prepararInputRH(input) {
  const tipo = input.dataset.tipo || "numero";

  if (typeof prepararInputFormatado === "function") {
    prepararInputFormatado(input);
    return;
  }

  let valor = (input.value || "").toString().trim();
  valor = valor.replace("R$", "").replace("%", "").replace(/\s/g, "").trim();

  input.value = valor;

  console.log("✍️ Input RH preparado para edição:", {
    loja: input.dataset.loja,
    semana: input.dataset.semana,
    campo: input.dataset.campo,
    tipo,
    valorEditavel: input.value,
  });
}

// ==========================
// 🔎 FILTRO RH
// ==========================
function ativarFiltroRH() {
  const input = document.getElementById("filtroRH");
  const botoesRegional = document.querySelectorAll(".btn-filtro-regional-rh");

  if (!input || !botoesRegional.length) {
    console.warn("⚠️ Filtro RH não encontrado");
    return;
  }

  let regionalSelecionada = "TODAS";

  const aplicar = () => {
    const termo = input.value.toLowerCase().trim();

    document.querySelectorAll("#tbody-rh tr").forEach((row) => {
      const dentroDoEscopo = row.dataset.escopoPermitido !== "false";

      const codigo = (
        row.dataset.lojaCodigo ||
        row.children[0]?.textContent ||
        ""
      )
        .toString()
        .toLowerCase();

      const loja = (row.dataset.lojaNome || row.children[1]?.textContent || "")
        .toString()
        .toLowerCase();

      const regional = (row.dataset.regional || "").toString().toLowerCase();

      const matchBusca =
        !termo || codigo.includes(termo) || loja.includes(termo);

      const matchRegional =
        regionalSelecionada === "TODAS" ||
        regional === regionalSelecionada.toLowerCase();

      row.style.display =
        dentroDoEscopo && matchBusca && matchRegional ? "" : "none";
    });
  };

  input.addEventListener("input", aplicar);

  botoesRegional.forEach((btn) => {
    btn.addEventListener("click", () => {
      botoesRegional.forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");

      regionalSelecionada = btn.dataset.regional || "TODAS";
      console.log("🌍 Filtro RH regional alterado:", regionalSelecionada);
      aplicar();
    });
  });

  aplicar();

  console.log("✅ Filtro RH ativado com sucesso");
}

// ==========================
// 💾 PROCESSAR AUTOSAVE RH
// ✅ sem justificativa
// ==========================
async function processarAutoSalvarRHCampo(input) {
  if (!input) return false;

  const loja = input.dataset.loja;
  const semana = input.dataset.semana;
  const campo = input.dataset.campo;
  const tipo = input.dataset.tipo || "numero";

  const valorDigitado = (input.value || "").toString().trim();
  const valorOriginal = input.dataset.original ?? "";

  let valorLimpo = null;

  if (!valorCampoEstaVazioRH(valorDigitado)) {
    if (typeof limparValorParaSalvar === "function") {
      valorLimpo = limparValorParaSalvar(valorDigitado, tipo);
    } else {
      const numero = Number((input.value || "").toString().replace(",", "."));
      valorLimpo = isNaN(numero) ? null : numero;
    }

    if (valorLimpo === null || Number.isNaN(valorLimpo)) {
      console.warn("⚠️ Valor RH inválido, salvamento ignorado", {
        loja,
        semana,
        campo,
        valorDigitado,
        tipo,
      });

      aplicarStatusInputRH(input, "erro");
      return false;
    }
  }

  const comparacao = valorLimpo === null ? "" : String(valorLimpo);

  if (comparacao === valorOriginal) {
    console.log("ℹ️ Valor RH não alterado, salvamento ignorado", {
      loja,
      semana,
      campo,
      valor: comparacao,
    });

    if (valorLimpo !== null && typeof formatarValorParaInput === "function") {
      input.value = formatarValorParaInput(valorLimpo, tipo);
    }

    aplicarStatusInputRH(input, "normal");
    return true;
  }

  if (valorLimpo !== null && typeof formatarValorParaInput === "function") {
    input.value = formatarValorParaInput(valorLimpo, tipo);
  }

  const indicadorNormalizado = (indicadorSelecionado || "")
    .toString()
    .trim()
    .toUpperCase();

  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const classe =
    typeof getClasseIndicador === "function"
      ? getClasseIndicador(indicadorNormalizado, classeSelecionada)
      : typeof obterClasse === "function"
        ? obterClasse(indicadorNormalizado, classeSelecionada)
        : classeSelecionada || "RH / Operacional";

  console.log("⚡ AUTOSAVE RH:", {
    loja,
    semana,
    campo,
    valor: valorLimpo,
    tipo,
    indicador: indicadorNormalizado,
    classe,
    justificativaDesativada: true,
  });

  aplicarStatusInputRH(input, "salvando");

  const salvou = await salvarValorRH(
    loja,
    semana,
    campo,
    valorLimpo,
    indicadorNormalizado,
    classe,
  );

  if (salvou) {
    input.dataset.original = comparacao;
    input.dataset.originalJustificativa = "";

    aplicarStatusInputRH(input, "sucesso");
    return true;
  }

  aplicarStatusInputRH(input, "erro");
  return false;
}

// ==========================
// 💾 AUTOSAVE RH
// ==========================
async function autoSalvarRH(input) {
  if (!input) return;
  await processarAutoSalvarRHCampo(input);
}

// ==========================
// 💾 SALVAR VALOR RH
// ✅ sem justificativa
// ==========================
// ==========================
// 💾 SALVAR VALOR RH
// Compatível com ano_referencia / mes_referencia / data_referencia
// ==========================
async function salvarValorRH(
  loja,
  semana,
  campo,
  valor,
  indicadorNormalizado,
  classe,
) {
  const numero =
    valor === null || valor === undefined || valor === ""
      ? null
      : Number(valor);

  if (
    valor !== null &&
    valor !== undefined &&
    valor !== "" &&
    Number.isNaN(numero)
  ) {
    console.warn("⚠️ salvarValorRH ignorado por número inválido:", valor);
    return false;
  }

  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";

  const indicadorBase = (indicadorNormalizado || getIndicadorRHSeguro() || "")
    .toString()
    .trim()
    .toUpperCase();

  const indicadorBanco =
    typeof getIndicadorBanco === "function"
      ? getIndicadorBanco(indicadorBase, classeSelecionada)
      : indicadorBase;

  const classeFinal =
    classe ||
    (typeof getClasseIndicador === "function"
      ? getClasseIndicador(indicadorBase, classeSelecionada)
      : typeof obterClasse === "function"
        ? obterClasse(indicadorBase, classeSelecionada)
        : classeSelecionada || "RH / Operacional");

  const semanaNorm = (semana || "").toString().padStart(2, "0");

  const anoReferencia = getAnoReferenciaRHAtual();
  const mesReferencia = getMesReferenciaRHAtual();
  const dataReferencia = getDataReferenciaRHAtual();
  const granularidade = getGranularidadeRHAtual();

  const origemModulo = getOrigemModuloRH(classeFinal);
  const origemTabela = getOrigemTabelaRH(indicadorBanco);

  const colunaJustificativa = getColunaJustificativaRH(campo);

  const chaveSalvar = getChaveRegistroRH(
    loja,
    semanaNorm,
    indicadorBanco,
    classeFinal,
    campo,
  );

  if (TABELA_RH_STATE.salvando.has(chaveSalvar)) {
    console.warn("⚠️ Já existe salvamento RH em andamento:", chaveSalvar);
    return false;
  }

  TABELA_RH_STATE.salvando.add(chaveSalvar);

  console.log("💾 SALVAR RH:", {
    loja,
    semana: semanaNorm,
    campo,
    valor: numero,
    indicador: indicadorBase,
    indicadorBanco,
    classe: classeFinal,
    anoReferencia,
    mesReferencia,
    dataReferencia,
    granularidade,
    justificativaDesativada: true,
  });

  try {
    const { data: existentes, error } = await window.db
      .from("resultados")
      .select("*")
      .eq("loja", loja)
      .eq("semana", semanaNorm)
      .eq("indicador", indicadorBanco)
      .eq("classe", classeFinal)
      .eq("ano_referencia", anoReferencia)
      .eq("granularidade", granularidade)
      .order("id", { ascending: true });

    if (error) throw error;

    const registros = existentes || [];

    // Evita criar registro vazio quando não existe linha no banco
    // e o usuário saiu do campo sem digitar valor
    if (registros.length === 0 && numero === null) {
      console.log("ℹ️ RH vazio sem registro existente - insert ignorado", {
        loja,
        semana: semanaNorm,
        indicadorBanco,
        classe: classeFinal,
        campo,
      });

      return true;
    }

    if (registros.length > 1) {
      console.warn("⚠️ Registros RH duplicados encontrados:", {
        loja,
        semana: semanaNorm,
        anoReferencia,
        granularidade,
        indicadorBanco,
        classe: classeFinal,
        qtd: registros.length,
        ids: registros.map((r) => r.id),
      });
    }

    const updateData = {
      updated_at: new Date().toISOString(),
      ano_referencia: anoReferencia,
      mes_referencia: mesReferencia,
      data_referencia: dataReferencia,
      granularidade,
      origem_modulo: origemModulo,
      origem_tabela: origemTabela,
    };

    updateData[campo] = numero;
    updateData[colunaJustificativa] = null;

    if (registros.length >= 1) {
      const idAlvo = registros[0].id;

      const { error: updateError } = await window.db
        .from("resultados")
        .update(updateData)
        .eq("id", idAlvo);

      if (updateError) throw updateError;

      console.log("✅ RH atualizado com sucesso:", {
        id: idAlvo,
        loja,
        semana: semanaNorm,
        anoReferencia,
        campo,
        valor: numero,
        colunaJustificativa,
        justificativaLimpa: true,
      });

      return true;
    }

    const novoRegistro = {
      loja,
      semana: semanaNorm,
      indicador: indicadorBanco,
      classe: classeFinal,

      valor: campo === "valor" ? numero : null,
      valor2: campo === "valor2" ? numero : null,

      ano_referencia: anoReferencia,
      mes_referencia: mesReferencia,
      data_referencia: dataReferencia,
      granularidade,

      origem_modulo: origemModulo,
      origem_tabela: origemTabela,
    };

    novoRegistro[colunaJustificativa] = null;

    const { data: inserido, error: insertError } = await window.db
      .from("resultados")
      .insert([novoRegistro])
      .select("id")
      .single();

    if (insertError) throw insertError;

    console.log("✅ RH inserido com sucesso:", {
      id: inserido?.id,
      loja,
      semana: semanaNorm,
      anoReferencia,
      campo,
      valor: numero,
      colunaJustificativa,
      justificativaLimpa: true,
    });

    return true;
  } catch (erro) {
    console.error("❌ Erro ao salvar RH:", erro);
    return false;
  } finally {
    TABELA_RH_STATE.salvando.delete(chaveSalvar);
  }
}
