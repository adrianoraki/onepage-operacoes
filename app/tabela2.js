// ==========================
// 🧩 TABELA ESPECIAL
// (SELF-CHECKOUT / PART.TELEVENDAS)
// ==========================

const TABELA_ESPECIAL_STATE = {
  salvando: new Set(),
};

const TABELA_ESPECIAL_UI = {
  ocultarColunaRegional: true,
  usarJustificativa: false,
  estilosInjetados: false,
  compactarSemanaSelecionada: true,
};

console.log("✅ tabela-especial.js carregado", {
  ocultarColunaRegional: TABELA_ESPECIAL_UI.ocultarColunaRegional,
  usarJustificativa: TABELA_ESPECIAL_UI.usarJustificativa,
  compactarSemanaSelecionada: TABELA_ESPECIAL_UI.compactarSemanaSelecionada,
});

// ==========================
// 🗝️ CHAVE DE REGISTRO ESPECIAL
// ==========================
function getChaveRegistroEspecial(loja, semana, indicadorBanco, classe, campo) {
  return `${loja}__${semana}__${indicadorBanco}__${classe}__${campo}`;
}

// ==========================
// 🖍️ STATUS VISUAL DO INPUT ESPECIAL
// ==========================
function aplicarStatusInputEspecial(input, status) {
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
// 🧰 HELPERS DA TABELA ESPECIAL
// ==========================
function escapeHtmlEspecial(valor) {
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

function escapeCssSelectorEspecial(valor) {
  if (typeof escapeCssSelectorTabela === "function") {
    return escapeCssSelectorTabela(valor);
  }

  const texto = (valor || "").toString();

  try {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(texto);
    }
  } catch (erro) {
    console.warn(
      "⚠️ CSS.escape indisponível em especial, usando fallback:",
      erro,
    );
  }

  return texto.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

function normalizarTextoEspecial(valor) {
  if (typeof normalizarTextoTabela === "function") {
    return normalizarTextoTabela(valor);
  }
  return (valor || "").toString().trim();
}

function normalizarTextoEspecialUpper(valor) {
  return normalizarTextoEspecial(valor).toUpperCase();
}

function valorCampoEstaVazioEspecial(valor) {
  return normalizarTextoEspecial(valor) === "";
}

function tipoEhMonetarioEspecial(tipo) {
  const t = normalizarTextoEspecialUpper(tipo);
  return (
    t === "MOEDA" ||
    t === "R$" ||
    t === "CURRENCY" ||
    t === "MONETARIO" ||
    t === "MONETÁRIO" ||
    t === "VALOR"
  );
}

function tipoEhPercentualEspecial(tipo) {
  const t = normalizarTextoEspecialUpper(tipo);
  return t === "PERCENTUAL" || t === "%" || t === "PORCENTAGEM";
}

function tipoEhInteiroEspecial(tipo) {
  const t = normalizarTextoEspecialUpper(tipo);

  return (
    t === "INTEIRO" ||
    t === "INT" ||
    t === "INTEGER" ||
    t === "NUMERO-INTEIRO" ||
    t === "NÚMERO-INTEIRO"
  );
}

function getClasseLarguraCampoEspecial(tipo) {
  if (tipoEhMonetarioEspecial(tipo)) return "tipo-moeda";
  if (tipoEhPercentualEspecial(tipo)) return "tipo-percentual";
  return "tipo-padrao";
}

function getSemanaCompactaEspecialAtual() {
  let semana = null;

  try {
    if (typeof semanaSelecionada !== "undefined" && semanaSelecionada) {
      semana = semanaSelecionada;
    }
  } catch (erro) {
    semana = null;
  }

  // ✅ sem seleção ativa → usa a SEMANA ATUAL real (não o localStorage antigo)
  if (!semana && typeof getSemanaAtual === "function") {
    semana = getSemanaAtual();
  }

  if (!semana) {
    const hoje = new Date();
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    const dias = Math.floor((hoje - inicioAno) / 86400000);
    semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);
  }

  return semana.toString().padStart(2, "0");
}

function semanaEhCompactaEspecial(semana) {
  if (!TABELA_ESPECIAL_UI.compactarSemanaSelecionada) return false;

  const semanaNorm = (semana || "").toString().padStart(2, "0");
  const semanaCompacta = getSemanaCompactaEspecialAtual();

  return semanaNorm === semanaCompacta;
}

// ==========================
// 📅 REFERÊNCIA TEMPORAL ESPECIAL
// Compatível com histórico por ano/mês/dia/semana
// ==========================
function getAnoReferenciaEspecialAtual() {
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

function getMesReferenciaEspecialAtual() {
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

function getDataReferenciaEspecialAtual() {
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

function getGranularidadeEspecialAtual() {
  return (
    localStorage.getItem("granularidade") ||
    localStorage.getItem("granularidade_referencia") ||
    "semanal"
  );
}

function getOrigemModuloEspecial(classe) {
  return classe || localStorage.getItem("classeSelecionada") || "Outros";
}

function getOrigemTabelaEspecial(indicadorBanco) {
  return indicadorBanco || indicadorSelecionado || "Indicador";
}

// ==========================
// ✅ Fallback mínimo e seguro
// analise.js é a fonte oficial do formato
// ==========================
function limparValorEspecialParaSalvar(valorDigitado, tipo = "numero") {
  const bruto = (valorDigitado || "").toString().trim();

  if (!bruto) return null;

  if (typeof limparValorParaSalvar === "function") {
    const retorno = limparValorParaSalvar(bruto, tipo);

    if (
      retorno !== null &&
      retorno !== undefined &&
      !Number.isNaN(Number(retorno))
    ) {
      const numero = Number(retorno);

      if (tipoEhInteiroEspecial(tipo)) {
        return Math.trunc(numero);
      }

      return numero;
    }
  }

  let texto = bruto.replace(/R\$/gi, "").replace(/%/g, "").replace(/\s/g, "");

  texto = texto.replace(/\./g, "").replace(",", ".");

  let numero = Number(texto);

  if (!Number.isFinite(numero)) {
    return null;
  }

  if (tipoEhInteiroEspecial(tipo)) {
    numero = Math.trunc(numero);
  }

  return numero;
}

function formatarValorEspecialParaInput(valor, tipo = "numero") {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "";

  if (tipoEhInteiroEspecial(tipo)) {
    return String(Math.trunc(numero));
  }

  if (typeof formatarValorParaInput === "function") {
    return formatarValorParaInput(numero, tipo);
  }

  return String(numero);
}

function getLarguraCampoEspecialPx(indicador, campo, tipo, semana = null) {
  const indicadorNorm = normalizarTextoEspecialUpper(indicador || "");
  const campoNorm = normalizarTextoEspecialUpper(campo || "");
  const tipoNorm = normalizarTextoEspecialUpper(tipo || "");
  const compacta = semanaEhCompactaEspecial(semana);

  let base = 150;

  if (indicadorNorm === "SELF-CHECKOUT") {
    if (campoNorm === "VALOR") {
      base = compacta ? 165 : 185;
    } else if (campoNorm === "VALOR2") {
      base = compacta ? 92 : 105;
    } else {
      base = compacta ? 135 : 150;
    }
  } else if (indicadorNorm === "PART.TELEVENDAS") {
    if (campoNorm === "VALOR") {
      base = compacta ? 155 : 175;
    } else if (campoNorm === "VALOR2") {
      base = compacta ? 155 : 175;
    } else {
      base = compacta ? 145 : 165;
    }
  } else {
    if (
      tipoNorm === "MOEDA" ||
      tipoNorm === "R$" ||
      tipoNorm === "MONETARIO" ||
      tipoNorm === "MONETÁRIO"
    ) {
      base = compacta ? 190 : 220;
    } else if (
      tipoNorm === "PERCENTUAL" ||
      tipoNorm === "%" ||
      tipoNorm === "PORCENTAGEM"
    ) {
      base = compacta ? 150 : 170;
    } else {
      base = compacta ? 135 : 150;
    }
  }

  const final = Math.max(base, 88);

  console.log("📏 Largura calculada do campo especial:", {
    indicador: indicadorNorm,
    campo: campoNorm,
    tipo: tipoNorm,
    semana,
    compacta,
    final,
  });

  return final;
}

function getAlturaCampoEspecialPx(indicador, campo, tipo, semana = null) {
  const indicadorNorm = normalizarTextoEspecialUpper(indicador || "");
  const campoNorm = normalizarTextoEspecialUpper(campo || "");
  const compacta = semanaEhCompactaEspecial(semana);

  let altura = compacta ? 30 : 32;

  if (indicadorNorm === "SELF-CHECKOUT") {
    if (campoNorm === "VALOR") {
      altura = compacta ? 30 : 34;
    } else if (campoNorm === "VALOR2") {
      altura = compacta ? 30 : 32;
    }
  }

  console.log("📐 Altura calculada do campo especial:", {
    indicador: indicadorNorm,
    campo: campoNorm,
    semana,
    compacta,
    altura,
  });

  return altura;
}

function getClassAttrEspecial(classes = []) {
  const lista = (classes || []).filter(Boolean).join(" ").trim();
  return lista ? ` class="${lista}"` : "";
}

function garantirEstilosTabelaEspecial() {
  if (TABELA_ESPECIAL_UI.estilosInjetados) return;

  const styleId = "estilos-tabela-especial-ajustes";
  if (document.getElementById(styleId)) {
    TABELA_ESPECIAL_UI.estilosInjetados = true;
    return;
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .tabela-especial-compacta {
      width: max-content !important;
      min-width: 100% !important;
      table-layout: auto !important;
      border-collapse: collapse;
    }

    .tabela-especial-compacta .col-regional-oculta,
    .tabela-especial-compacta th[data-coluna="regional"],
    .tabela-especial-compacta td[data-coluna="regional"] {
      display: none !important;
    }

    .tabela-especial-compacta th,
    .tabela-especial-compacta td {
      vertical-align: middle;
      box-sizing: border-box;
      white-space: nowrap;
    }

    .tabela-especial-compacta .col-codigo {
      width: 58px !important;
      min-width: 58px !important;
      max-width: 58px !important;
    }

    .tabela-especial-compacta .col-loja {
      min-width: 170px !important;
      max-width: 220px !important;
      width: 170px !important;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tabela-especial-compacta .celula-especial-valor {
      box-sizing: border-box;
      padding: 5px 6px !important;
    }

    .tabela-especial-compacta .campo-tabela-especial {
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
    }

    .tabela-especial-compacta .input-tabela-compacto {
      box-sizing: border-box;
      width: 100% !important;
      max-width: none !important;
      padding: 5px 8px !important;
      line-height: 1.2 !important;
      font-size: 11px !important;
      border-radius: 6px;
    }

    .tabela-especial-compacta .coluna-semana-compacta {
      opacity: 0.98;
    }

    .tabela-especial-compacta .coluna-semana-compacta th,
    .tabela-especial-compacta th.coluna-semana-compacta {
      font-size: 10px !important;
    }

    .tabela-compacta-container {
      overflow-x: auto !important;
      overflow-y: visible !important;
      width: 100%;
    }
  `;

  document.head.appendChild(style);
  TABELA_ESPECIAL_UI.estilosInjetados = true;

  console.log(
    "🎨 Estilos da tabela especial injetados com largura/altura reforçadas",
  );
}

function aplicarLayoutTabelaEspecial(container = null) {
  garantirEstilosTabelaEspecial();

  const alvo = container || document;
  const tabelas = alvo.querySelectorAll(".tabela-especial-compacta");

  let totalTabelas = 0;
  let totalColunasOcultadas = 0;

  tabelas.forEach((table) => {
    totalTabelas++;

    const headers = [...table.querySelectorAll("thead th")];
    let indicesRegional = [];

    headers.forEach((th, idx) => {
      const texto = normalizarTextoEspecialUpper(th.textContent || "");
      const dataColuna = normalizarTextoEspecialUpper(th.dataset.coluna || "");

      if (
        texto === "REGIONAL" ||
        dataColuna === "REGIONAL" ||
        th.classList.contains("col-regional")
      ) {
        indicesRegional.push(idx);
        th.classList.add("col-regional-oculta");
        th.dataset.coluna = "regional";
      }
    });

    if (!indicesRegional.length) {
      console.log("ℹ️ Nenhuma coluna Regional encontrada na tabela especial");
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

  console.log("👁️ Layout/ocultação aplicado na tabela especial:", {
    totalTabelas,
    totalColunasOcultadas,
    semanaCompacta: getSemanaCompactaEspecialAtual(),
  });
}

// ==========================
// 🧹 JUSTIFICATIVAS DESATIVADAS
// ==========================
function getListaJustificativasEspecial() {
  return [];
}

function getIndicadorEspecialAtualNormalizado() {
  return (indicadorSelecionado || "").toString().trim().toUpperCase();
}

function getColunaJustificativaEspecial(campo) {
  const indicadorNorm = getIndicadorEspecialAtualNormalizado();

  if (indicadorNorm === "PART.TELEVENDAS") {
    if (campo === "valor") return "justificativa_participacao";
    if (campo === "valor2") return "justificativa_margem";
  }

  if (campo === "valor") return "justificativa_valor";
  if (campo === "valor2") return "justificativa_valor2";

  return `justificativa_${campo}`;
}

function getLabelCampoEspecial(campo) {
  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const config = getConfigTabelaEspecial(
    indicadorSelecionado,
    classeSelecionada,
  );

  if (campo === "valor") return config.col1 || "Campo 1";
  if (campo === "valor2") return config.col2 || "Campo 2";

  return campo;
}

function getInputEspecial(loja, semana, campo) {
  const lojaEsc = escapeCssSelectorEspecial(loja);
  const semanaEsc = escapeCssSelectorEspecial(semana);
  const campoEsc = escapeCssSelectorEspecial(campo);

  const el = document.querySelector(
    `#tbody-especial input[data-loja="${lojaEsc}"][data-semana="${semanaEsc}"][data-campo="${campoEsc}"]`,
  );

  if (!el) {
    console.warn("⚠️ Input especial não encontrado:", { loja, semana, campo });
  }

  return el;
}

function getBotaoJustificativaEspecial() {
  return null;
}

function getBotaoEspecialDoInput() {
  return null;
}

function getInputDoBotaoEspecial() {
  return null;
}

function prepararCliqueJustificativaEspecial(event = null) {
  console.log(
    "ℹ️ prepararCliqueJustificativaEspecial ignorado: justificativas removidas",
  );
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function finalizarCliqueJustificativaEspecial() {
  console.log(
    "ℹ️ finalizarCliqueJustificativaEspecial ignorado: justificativas removidas",
  );
}

function atualizarEstadoVisualBotaoEspecial() {
  return;
}

function atualizarEstadoVisualInputEspecialComJustificativa(input) {
  if (!input) return;
  input.classList.remove("input-com-justificativa");
}

function atualizarVisibilidadeJustificativaEspecial(input) {
  if (!input) return;
  input.classList.remove("input-com-justificativa");
}

function sincronizarJustificativasComPermissoesTabelaEspecial() {
  console.log(
    "ℹ️ Justificativas da tabela especial desativadas definitivamente",
  );
}

function garantirPainelJustificativaEspecial() {
  console.log("ℹ️ Painel de justificativa especial desativado");
  return null;
}

function posicionarPainelJustificativaEspecial() {
  return;
}

function marcarJustificativaSelecionadaNoPainelEspecial() {
  return;
}

function abrirPainelJustificativaEspecial(botao, event = null) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  console.log("ℹ️ Painel especial não abre: justificativas removidas");
}

function fecharPainelJustificativaEspecial() {
  const painel = document.getElementById(
    "painel-justificativa-especial-flutuante",
  );
  if (painel) {
    painel.classList.remove("ativo");
  }

  console.log("ℹ️ Painel especial fechado/ignorado");
}

async function selecionarJustificativaPainelEspecial(motivo) {
  console.log("ℹ️ selecionarJustificativaPainelEspecial ignorado:", motivo);
  return false;
}

// ==========================
// ⚙️ CONFIG DA TABELA ESPECIAL
// ==========================
function getConfigTabelaEspecial(indicador, classeSelecionada = null) {
  const indicadorNorm = (indicador || "").toString().trim().toUpperCase();

  if (typeof getIndicadorConfig === "function") {
    const cfg = getIndicadorConfig(indicador, classeSelecionada);

    const campo1 =
      typeof getCampoConfig === "function"
        ? getCampoConfig(indicador, "valor", classeSelecionada)
        : { key: "valor", label: "Coluna 1", tipo: "numero" };

    const campo2 =
      typeof getCampoConfig === "function"
        ? getCampoConfig(indicador, "valor2", classeSelecionada)
        : { key: "valor2", label: "Coluna 2", tipo: "numero" };

    let tipo1Final = campo1?.tipo || "numero";
    let tipo2Final = campo2?.tipo || "numero";
    let col1Final = campo1?.label || "Coluna 1";
    let col2Final = campo2?.label || "Coluna 2";

    // ✅ FORÇA QTD PASSANTES COMO INTEIRO
    if (indicadorNorm === "SELF-CHECKOUT") {
      col1Final = campo1?.label || "Valor R$";
      col2Final = campo2?.label || "Quant. de passantes";

      if (!tipo1Final || tipo1Final === "numero") {
        tipo1Final = "moeda";
      }

      // aqui está a correção principal
      tipo2Final = "inteiro";
    }

    if (indicadorNorm === "PART.TELEVENDAS") {
      col1Final = campo1?.label || "Part %";
      col2Final = campo2?.label || "Margem";

      if (!tipo1Final || tipo1Final === "numero") {
        tipo1Final = "percentual";
      }

      if (!tipo2Final || tipo2Final === "numero") {
        tipo2Final = "percentual";
      }
    }

    console.log("⚙️ Config tabela especial resolvida via config global:", {
      indicadorNorm,
      classeSelecionada,
      campo1,
      campo2,
      tipo1Final,
      tipo2Final,
      col1Final,
      col2Final,
    });

    return {
      titulo: cfg?.nomeExibicao || indicador,
      col1: col1Final,
      col2: col2Final,
      tipo1: tipo1Final,
      tipo2: tipo2Final,
    };
  }

  if (indicadorNorm === "PART.TELEVENDAS") {
    return {
      titulo: "PART.TELEVENDAS",
      col1: "Part %",
      col2: "Margem",
      tipo1: "percentual",
      tipo2: "percentual",
    };
  }

  if (indicadorNorm === "SELF-CHECKOUT") {
    return {
      titulo: "SELF-CHECKOUT",
      col1: "Valor R$",
      col2: "Quant. de passantes",
      tipo1: "moeda",
      tipo2: "inteiro",
    };
  }

  return {
    titulo: indicadorNorm,
    col1: "Coluna 1",
    col2: "Coluna 2",
    tipo1: "numero",
    tipo2: "numero",
  };
}

// ==========================
// 🧱 MONTAR TABELA ESPECIAL
// ==========================
function montarTabelaEspecial(lojas, mapa, semanas) {
  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const config = getConfigTabelaEspecial(
    indicadorSelecionado,
    classeSelecionada,
  );
  const semanaAtualReal = getSemanaAtual().toString().padStart(2, "0");
  const semanaCompacta = getSemanaCompactaEspecialAtual();

  console.log("🧩 Montando tabela especial:", {
    indicadorSelecionado,
    classeSelecionada,
    config,
    totalLojas: lojas?.length || 0,
    totalSemanas: semanas?.length || 0,
    ocultarColunaRegional: TABELA_ESPECIAL_UI.ocultarColunaRegional,
    usarJustificativa: TABELA_ESPECIAL_UI.usarJustificativa,
    semanaCompacta,
  });

  let html = `
    <div class="card-conteudo">

      <div class="header-tabela">
        <h2>📊 ${config.titulo}</h2>

        <select class="filtro-semana" onchange="alterarSemana(this.value)">
          ${gerarOptionsSemanas()}
        </select>
      </div>

      <div class="filtros-tabela filtros-novos">
        <input
          type="text"
          id="filtroEspecial"
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

      <div class="tabela-container tabela-compacta-container">
        <table class="tabela tabela-especial-compacta">
          <thead>
            <tr>
              <th rowspan="2" class="col-codigo" data-coluna="codigo">Código</th>
              <th rowspan="2" class="col-loja" data-coluna="loja">Loja</th>
              <th
                rowspan="2"
                class="col-regional ${TABELA_ESPECIAL_UI.ocultarColunaRegional ? "col-regional-oculta" : ""}"
                data-coluna="regional"
              >
                Regional
              </th>
  `;

  semanas.forEach((semana) => {
    const semanaNorm = (semana || "").toString().padStart(2, "0");
    const classesSemana = [];
    if (semanaNorm === semanaAtualReal) classesSemana.push("coluna-atual");
    if (semanaNorm === semanaCompacta)
      classesSemana.push("coluna-semana-compacta");

    html += `<th colspan="2"${getClassAttrEspecial(classesSemana)}>Semana ${semanaNorm}</th>`;
  });

  html += `</tr><tr>`;

  semanas.forEach((semana) => {
    const semanaNorm = (semana || "").toString().padStart(2, "0");

    const classesSemana1 = [];
    if (semanaNorm === semanaAtualReal) classesSemana1.push("coluna-atual");
    if (semanaNorm === semanaCompacta)
      classesSemana1.push("coluna-semana-compacta");

    const classesSemana2 = [...classesSemana1];

    html += `
      <th${getClassAttrEspecial(classesSemana1)}>${config.col1}</th>
      <th${getClassAttrEspecial(classesSemana2)}>${config.col2}</th>
    `;
  });

  html += `
            </tr>
          </thead>
          <tbody id="tbody-especial">
  `;

  lojas.forEach((loja) => {
    const chaveLoja = `${loja.codigo} - ${loja.nome}`;

    html += `
      <tr
        data-loja-codigo="${escapeHtmlEspecial(loja.codigo)}"
        data-loja-nome="${escapeHtmlEspecial(loja.nome)}"
        data-regional="${escapeHtmlEspecial(loja.regional || "-")}"
      >
    `;

    html += `<td class="col-codigo" data-coluna="codigo">${loja.codigo}</td>`;
    html += `<td class="col-loja" data-coluna="loja">${loja.nome}</td>`;
    html += `
      <td
        class="col-regional ${TABELA_ESPECIAL_UI.ocultarColunaRegional ? "col-regional-oculta" : ""}"
        data-coluna="regional"
      >
        ${loja.regional || "-"}
      </td>
    `;

    semanas.forEach((semana) => {
      const semanaNorm = (semana || "").toString().padStart(2, "0");
      const key = `${chaveLoja}-${semanaNorm}`;
      const item = mapa[key] || {};

      const classesCelula = ["celula-especial-valor"];
      if (semanaNorm === semanaAtualReal) classesCelula.push("coluna-atual");
      if (semanaNorm === semanaCompacta)
        classesCelula.push("coluna-semana-compacta");

      const valor = item.valor ?? "";
      const valor2 = item.valor2 ?? "";

      const valorFormatado =
        typeof formatarValorParaInput === "function"
          ? formatarValorParaInput(valor, config.tipo1)
          : valor;

      const valor2Formatado = formatarValorEspecialParaInput(
        valor2,
        config.tipo2,
      );

      const original1 =
        valor === null || valor === undefined || valor === ""
          ? ""
          : String(valor);

      const original2 =
        valor2 === null || valor2 === undefined || valor2 === ""
          ? ""
          : String(valor2);

      const classeCampo1 = getClasseLarguraCampoEspecial(config.tipo1);
      const classeCampo2 = getClasseLarguraCampoEspecial(config.tipo2);

      const largura1 = getLarguraCampoEspecialPx(
        indicadorSelecionado,
        "valor",
        config.tipo1,
        semanaNorm,
      );
      const largura2 = getLarguraCampoEspecialPx(
        indicadorSelecionado,
        "valor2",
        config.tipo2,
        semanaNorm,
      );

      const altura1 = getAlturaCampoEspecialPx(
        indicadorSelecionado,
        "valor",
        config.tipo1,
        semanaNorm,
      );
      const altura2 = getAlturaCampoEspecialPx(
        indicadorSelecionado,
        "valor2",
        config.tipo2,
        semanaNorm,
      );

      const larguraInput1 = Math.max(largura1 - 18, 88);
      const larguraInput2 = Math.max(largura2 - 18, 80);

      html += `
        <td
          ${getClassAttrEspecial([...classesCelula, classeCampo1])}
          style="min-width:${largura1}px; width:${largura1}px;"
        >
          <div
            class="campo-tabela-especial ${classeCampo1}"
            style="min-width:${largura1}px; width:${largura1}px;"
          >
            <input
              type="text"
              inputmode="decimal"
              value="${escapeHtmlEspecial(valorFormatado)}"
              class="input-tabela input-tabela-compacto"
              style="
                min-width:${larguraInput1}px;
                width:${larguraInput1}px;
                max-width:${larguraInput1}px;
                min-height:${altura1}px;
                height:${altura1}px;
              "
              data-loja="${escapeHtmlEspecial(chaveLoja)}"
              data-semana="${escapeHtmlEspecial(semanaNorm)}"
              data-campo="valor"
              data-tipo="${escapeHtmlEspecial(config.tipo1)}"
              data-original="${escapeHtmlEspecial(original1)}"
              data-original-justificativa=""
              onfocus="prepararInputEspecial(this)"
              onblur="autoSalvarEspecial(this)"
            >
          </div>
        </td>

        <td
          ${getClassAttrEspecial([...classesCelula, classeCampo2])}
          style="min-width:${largura2}px; width:${largura2}px;"
        >
          <div
            class="campo-tabela-especial ${classeCampo2}"
            style="min-width:${largura2}px; width:${largura2}px;"
          >
            <input
              type="text"
              inputmode="${tipoEhInteiroEspecial(config.tipo2) ? "numeric" : "decimal"}"
              value="${escapeHtmlEspecial(valor2Formatado)}"
              class="input-tabela input-tabela-compacto"
              style="
                min-width:${larguraInput2}px;
                width:${larguraInput2}px;
                max-width:${larguraInput2}px;
                min-height:${altura2}px;
                height:${altura2}px;
              "
              data-loja="${escapeHtmlEspecial(chaveLoja)}"
              data-semana="${escapeHtmlEspecial(semanaNorm)}"
              data-campo="valor2"
              data-tipo="${escapeHtmlEspecial(config.tipo2)}"
              data-original="${escapeHtmlEspecial(original2)}"
              data-original-justificativa=""
              onfocus="prepararInputEspecial(this)"
              onblur="autoSalvarEspecial(this)"
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
    aplicarLayoutTabelaEspecial(document.getElementById("conteudo"));
    ativarFiltroEspecial();
    sincronizarJustificativasComPermissoesTabelaEspecial();
  });

  return html;
}

// ==========================
// ✍️ PREPARAR INPUT ESPECIAL
// ==========================
function prepararInputEspecial(input) {
  const tipo = input.dataset.tipo || "numero";

  if (typeof prepararInputFormatado === "function") {
    prepararInputFormatado(input);

    if (tipoEhInteiroEspecial(tipo)) {
      const bruto = (input.value || "").toString();
      const sinal = bruto.trim().startsWith("-") ? "-" : "";
      const digitos = bruto.replace(/\D/g, "");
      input.value = digitos ? `${sinal}${digitos}` : "";
    }

    return;
  }

  let valor = (input.value || "").toString().trim();
  valor = valor.replace("R$", "").replace("%", "").replace(/\s/g, "").trim();

  if (tipoEhInteiroEspecial(tipo)) {
    const sinal = valor.startsWith("-") ? "-" : "";
    valor = valor.replace(/\D/g, "");
    valor = valor ? `${sinal}${valor}` : "";
  }

  input.value = valor;

  console.log("✍️ Input especial preparado para edição:", {
    loja: input.dataset.loja,
    semana: input.dataset.semana,
    campo: input.dataset.campo,
    tipo,
    valorEditavel: input.value,
  });
}

// ==========================
// 🔎 FILTRO TABELA ESPECIAL
// ==========================
function ativarFiltroEspecial() {
  const input = document.getElementById("filtroEspecial");
  const botoesRegional = document.querySelectorAll(".btn-filtro-regional");

  if (!input || !botoesRegional.length) {
    console.warn("⚠️ Filtro especial não encontrado");
    return;
  }

  let regionalSelecionada = "TODAS";

  const aplicar = () => {
    const termo = input.value.toLowerCase().trim();

    document.querySelectorAll("#tbody-especial tr").forEach((row) => {
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

      console.log("🌍 Filtro especial regional alterado:", regionalSelecionada);
      aplicar();
    });
  });

  aplicar();

  console.log("✅ Filtro especial ativado com sucesso");
}

// ==========================
// 💾 PROCESSAR AUTOSAVE ESPECIAL
// ==========================
async function processarAutoSalvarEspecialCampo(input) {
  if (!input) return false;

  const loja = input.dataset.loja;
  const semana = input.dataset.semana;
  const campo = input.dataset.campo;
  const tipo = input.dataset.tipo || "numero";

  const valorDigitado = (input.value || "").toString().trim();
  const valorOriginal = input.dataset.original ?? "";

  let valorLimpo = null;

  if (!valorCampoEstaVazioEspecial(valorDigitado)) {
    valorLimpo = limparValorEspecialParaSalvar(valorDigitado, tipo);

    if (valorLimpo === null || Number.isNaN(valorLimpo)) {
      console.warn("⚠️ Valor especial inválido, salvamento ignorado", {
        loja,
        semana,
        campo,
        valorDigitado,
        tipo,
      });

      aplicarStatusInputEspecial(input, "erro");
      return false;
    }
  }

  const valorComparacao =
    valorLimpo === null || valorLimpo === undefined ? "" : String(valorLimpo);

  if (valorComparacao === valorOriginal) {
    console.log(
      "ℹ️ Nenhuma alteração especial detectada, salvamento ignorado",
      {
        loja,
        semana,
        campo,
        valor: valorComparacao,
      },
    );

    if (valorLimpo !== null) {
      input.value = formatarValorEspecialParaInput(valorLimpo, tipo);
    }

    return true;
  }

  if (valorLimpo !== null) {
    input.value = formatarValorEspecialParaInput(valorLimpo, tipo);
  }

  console.log("⚡ AutoSave Especial completo", {
    loja,
    semana,
    campo,
    valor: valorLimpo,
    tipo,
  });

  aplicarStatusInputEspecial(input, "salvando");

  const salvou = await salvarValorEspecial(loja, semana, campo, valorLimpo);

  if (salvou) {
    input.dataset.original = valorComparacao;
    input.dataset.originalJustificativa = "";

    aplicarStatusInputEspecial(input, "sucesso");
    return true;
  }

  aplicarStatusInputEspecial(input, "erro");
  return false;
}

// ==========================
// ⚡ AUTOSAVE ESPECIAL
// ==========================
async function autoSalvarEspecial(input) {
  if (!input) return;
  await processarAutoSalvarEspecialCampo(input);
}

// ==========================
// 💾 SALVAR VALOR ESPECIAL
// Compatível com ano_referencia / mes_referencia / data_referencia
// ==========================
async function salvarValorEspecial(loja, semana, campo, valor) {
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
    console.warn("⚠️ salvarValorEspecial ignorado por número inválido:", valor);
    return false;
  }

  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";

  const indicadorNormalizado = (indicadorSelecionado || "")
    .toString()
    .trim()
    .toUpperCase();

  const indicadorBanco =
    typeof getIndicadorBanco === "function"
      ? getIndicadorBanco(indicadorNormalizado, classeSelecionada)
      : indicadorNormalizado;

  const classe =
    typeof getClasseIndicador === "function"
      ? getClasseIndicador(indicadorNormalizado, classeSelecionada)
      : typeof obterClasse === "function"
        ? obterClasse(indicadorNormalizado, classeSelecionada)
        : classeSelecionada || "Outros";

  const semanaNorm = (semana || "").toString().padStart(2, "0");

  const anoReferencia = getAnoReferenciaEspecialAtual();
  const mesReferencia = getMesReferenciaEspecialAtual();
  const dataReferencia = getDataReferenciaEspecialAtual();
  const granularidade = getGranularidadeEspecialAtual();

  const origemModulo = getOrigemModuloEspecial(classe);
  const origemTabela = getOrigemTabelaEspecial(indicadorBanco);

  const colunaJustificativa = getColunaJustificativaEspecial(campo);

  const chaveSalvar = getChaveRegistroEspecial(
    loja,
    semanaNorm,
    indicadorBanco,
    classe,
    campo
  );

  if (TABELA_ESPECIAL_STATE.salvando.has(chaveSalvar)) {
    console.warn("⚠️ Já existe salvamento especial em andamento:", chaveSalvar);
    return false;
  }

  TABELA_ESPECIAL_STATE.salvando.add(chaveSalvar);

  console.log("💾 SALVAR ESPECIAL:", {
    indicador: indicadorNormalizado,
    indicadorBanco,
    classe,
    loja,
    semana: semanaNorm,
    anoReferencia,
    mesReferencia,
    dataReferencia,
    granularidade,
    campo,
    numero,
    justificativaDesativada: true,
  });

  try {
    let query = window.db
      .from("resultados")
      .select("*")
      .eq("loja", loja)
      .eq("semana", semanaNorm)
      .eq("indicador", indicadorBanco)
      .eq("classe", classe)
      .eq("ano_referencia", anoReferencia)
      .eq("granularidade", granularidade)
      .order("id", { ascending: true });

    const { data: existentes, error: erroBusca } = await query;

    if (erroBusca) throw erroBusca;

    const registros = existentes || [];

    if (registros.length > 1) {
      console.warn("⚠️ Registros especiais duplicados encontrados:", {
        loja,
        semana: semanaNorm,
        anoReferencia,
        granularidade,
        indicadorBanco,
        classe,
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

      const { error: erroUpdate } = await window.db
        .from("resultados")
        .update(updateData)
        .eq("id", idAlvo);

      if (erroUpdate) throw erroUpdate;

      console.log("✅ Especial atualizado com sucesso:", {
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

    const payload = {
      loja,
      semana: semanaNorm,
      indicador: indicadorBanco,
      classe,

      valor: campo === "valor" ? numero : null,
      valor2: campo === "valor2" ? numero : null,

      ano_referencia: anoReferencia,
      mes_referencia: mesReferencia,
      data_referencia: dataReferencia,
      granularidade,

      origem_modulo: origemModulo,
      origem_tabela: origemTabela,
    };

    payload[colunaJustificativa] = null;

    const { data: inserido, error: erroInsert } = await window.db
      .from("resultados")
      .insert([payload])
      .select("id")
      .single();

    if (erroInsert) throw erroInsert;

    console.log("✅ Especial inserido com sucesso:", {
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
    console.error("❌ Erro salvarValorEspecial:", erro);
    return false;
  } finally {
    TABELA_ESPECIAL_STATE.salvando.delete(chaveSalvar);
  }
}