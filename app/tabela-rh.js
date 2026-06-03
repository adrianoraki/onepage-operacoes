// ==========================
// 🧩 TABELA ESPECIAL RH
// (BANCOS DE HORAS / RH ESPECIAL)
// ==========================

const TABELA_RH_STATE = {
  salvando: new Set(),
  botaoAtivo: null,
  clicandoBotao: false,
  timeoutClique: null,
};

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
  return texto.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

function normalizarTextoRH(valor) {
  if (typeof normalizarTextoTabela === "function") {
    return normalizarTextoTabela(valor);
  }
  return (valor || "").toString().trim();
}

function valorCampoEstaVazioRH(valor) {
  return normalizarTextoRH(valor) === "";
}

function getListaJustificativasRH() {
  if (
    typeof JUSTIFICATIVAS_SEM_RESPOSTA !== "undefined" &&
    Array.isArray(JUSTIFICATIVAS_SEM_RESPOSTA) &&
    JUSTIFICATIVAS_SEM_RESPOSTA.length
  ) {
    return JUSTIFICATIVAS_SEM_RESPOSTA;
  }

  return [
    "Mudança Layout / Reforma",
    "Inventário Geral",
    "Falha Wifi",
    "Falta Energia",
    "Greve Ônibus",
    "Feriado Municipal",
    "Problema Zebra",
    "Interdição",
    "Fenômeno da Natureza",
    "Troca Servidor",
    "Falta Equipe",
    "Alteração de Cluster",
    "Alinhado com Gerente Operações",
  ];
}

function getIndicadorRHAtualNormalizado() {
  return (indicadorSelecionado || "").toString().trim().toUpperCase();
}

function getColunaJustificativaRH(campo) {
  const indicadorNorm = getIndicadorRHAtualNormalizado();

  if (
    indicadorNorm === "BANCOS DE HORAS" ||
    indicadorNorm === "BANCO DE HORAS" ||
    indicadorNorm === "RH / OPERACIONAL"
  ) {
    if (campo === "valor") return "justificativa_horas_mais";
    if (campo === "valor2") return "justificativa_horas_menos";
  }

  if (campo === "valor") return "justificativa_valor";
  if (campo === "valor2") return "justificativa_valor2";

  return `justificativa_${campo}`;
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
    `#tbody-rh input[data-loja="${lojaEsc}"][data-semana="${semanaEsc}"][data-campo="${campoEsc}"]`
  );

  if (!el) {
    console.warn("⚠️ Input RH não encontrado:", { loja, semana, campo });
  }

  return el;
}

function getBotaoJustificativaRH(loja, semana, campo) {
  const lojaEsc = escapeCssSelectorRH(loja);
  const semanaEsc = escapeCssSelectorRH(semana);
  const campoEsc = escapeCssSelectorRH(campo);

  const el = document.querySelector(
    `#tbody-rh button[data-loja="${lojaEsc}"][data-semana="${semanaEsc}"][data-campo="${campoEsc}"][data-role="justificativa-rh"]`
  );

  if (!el) {
    console.warn("⚠️ Botão de justificativa RH não encontrado:", {
      loja,
      semana,
      campo,
    });
  }

  return el;
}

function getBotaoRHDoInput(input) {
  if (!input) return null;
  return getBotaoJustificativaRH(
    input.dataset.loja,
    input.dataset.semana,
    input.dataset.campo
  );
}

function getInputDoBotaoRH(botao) {
  if (!botao) return null;
  return getInputRH(
    botao.dataset.loja,
    botao.dataset.semana,
    botao.dataset.campo
  );
}

// ==========================
// 🖱️ CONTROLE DE CLIQUE RH
// ==========================
function prepararCliqueJustificativaRH(event = null) {
  console.log("🖱️ prepararCliqueJustificativaRH");

  TABELA_RH_STATE.clicandoBotao = true;

  if (TABELA_RH_STATE.timeoutClique) {
    clearTimeout(TABELA_RH_STATE.timeoutClique);
    TABELA_RH_STATE.timeoutClique = null;
  }

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function finalizarCliqueJustificativaRH(delay = 180) {
  if (TABELA_RH_STATE.timeoutClique) {
    clearTimeout(TABELA_RH_STATE.timeoutClique);
    TABELA_RH_STATE.timeoutClique = null;
  }

  TABELA_RH_STATE.timeoutClique = setTimeout(() => {
    TABELA_RH_STATE.clicandoBotao = false;
    TABELA_RH_STATE.timeoutClique = null;
    console.log("🖱️ Estado de clique RH finalizado");
  }, delay);
}

// ==========================
// 🎨 ESTADO VISUAL RH
// ==========================
function atualizarEstadoVisualBotaoRH(botao) {
  if (!botao) return;

  const justificativaAtual = normalizarTextoRH(
    botao.dataset.justificativaAtual || ""
  );

  botao.classList.toggle("ativo", !!justificativaAtual);
  botao.title =
    justificativaAtual ||
    `Selecionar justificativa - ${getLabelCampoRH(botao.dataset.campo)}`;

  console.log("🎯 Estado visual do botão RH atualizado:", {
    campo: botao.dataset.campo,
    justificativaAtual,
    ativo: !!justificativaAtual,
  });
}

function atualizarEstadoVisualInputRHComJustificativa(input, botao = null) {
  if (!input) return;

  const botaoRef = botao || getBotaoRHDoInput(input);

  if (!botaoRef) {
    input.classList.remove("input-com-justificativa");
    console.warn("⚠️ Botão RH não encontrado para atualizar input:", {
      loja: input.dataset?.loja,
      semana: input.dataset?.semana,
      campo: input.dataset?.campo,
    });
    return;
  }

  const temValor = !valorCampoEstaVazioRH(input.value);

  if (temValor) {
    input.classList.remove("input-com-justificativa");
    return;
  }

  const justificativaAtual = normalizarTextoRH(
    botaoRef.dataset.justificativaAtual ||
      botaoRef.dataset.original ||
      ""
  );

  const deveDestacar = !!justificativaAtual;

  input.classList.toggle("input-com-justificativa", deveDestacar);

  console.log("🎨 Estado visual do input RH atualizado:", {
    loja: input.dataset?.loja,
    semana: input.dataset?.semana,
    campo: input.dataset?.campo,
    temValor,
    justificativaAtual,
    destacado: deveDestacar,
  });
}

function atualizarVisibilidadeJustificativaRH(input, limparSeTiverValor = true) {
  if (!input) return;

  const botao = getBotaoRHDoInput(input);
  if (!botao) return;

  const temValor = !valorCampoEstaVazioRH(input.value);
  const bloqueado =
    input.disabled || input.readOnly || input.dataset.bloqueado === "true";

  if (temValor) {
    if (limparSeTiverValor) {
      botao.dataset.justificativaAtual = "";
      botao.dataset.original = "";
      atualizarEstadoVisualBotaoRH(botao);
    }

    botao.classList.add("oculto");
    botao.disabled = true;
    botao.classList.remove("pendente");

    input.classList.remove("input-com-justificativa");
    aplicarStatusInputRH(input, "normal");

    console.log("👁️ Botão RH ocultado porque existe valor", {
      loja: input.dataset.loja,
      semana: input.dataset.semana,
      campo: input.dataset.campo,
    });

    return;
  }

  botao.classList.remove("oculto");
  botao.disabled = bloqueado;
  botao.classList.toggle("bloqueado", bloqueado);

  atualizarEstadoVisualBotaoRH(botao);
  atualizarEstadoVisualInputRHComJustificativa(input, botao);

  console.log("👁️ Botão RH exibido", {
    loja: input.dataset.loja,
    semana: input.dataset.semana,
    campo: input.dataset.campo,
    bloqueado,
  });
}

function sincronizarJustificativasComPermissoesTabelaRH() {
  console.log("🔐 Sincronizando justificativas RH com permissões...");

  const inputs = document.querySelectorAll(
    '#tbody-rh input[data-loja][data-semana][data-campo]'
  );

  inputs.forEach((input) => {
    const botao = getBotaoRHDoInput(input);
    if (!botao) return;

    const bloqueado =
      input.disabled || input.readOnly || input.dataset.bloqueado === "true";

    if (bloqueado) {
      botao.disabled = true;
      botao.classList.add("bloqueado");
      botao.title = input.dataset.motivo || input.title || "Campo bloqueado";
    } else {
      botao.disabled = false;
      botao.classList.remove("bloqueado");
      atualizarVisibilidadeJustificativaRH(input, false);
    }
  });

  console.log("✅ Sincronização RH concluída");
}

// ==========================
// 🪟 PAINEL DE JUSTIFICATIVA RH
// ==========================
function garantirPainelJustificativaRH() {
  let painel = document.getElementById("painel-justificativa-rh-flutuante");

  if (painel) {
    console.log("🪟 Painel RH já existente");
    return painel;
  }

  console.log("🪟 Criando painel de justificativa RH...");

  painel = document.createElement("div");
  painel.id = "painel-justificativa-rh-flutuante";
  painel.className = "painel-justificativa-flutuante";

  painel.innerHTML = `
    <div class="painel-justificativa-box">
      <div class="painel-justificativa-header">
        <strong id="titulo-painel-justificativa-rh">Selecionar justificativa</strong>
        <button
          type="button"
          class="btn-fechar-painel-justificativa"
          id="btn-fechar-painel-justificativa-rh"
        >
          ✕
        </button>
      </div>

      <div class="painel-justificativa-lista" id="painel-justificativa-rh-lista"></div>
    </div>
  `;

  document.body.appendChild(painel);

  const lista = painel.querySelector("#painel-justificativa-rh-lista");
  const justificativas = getListaJustificativasRH();

  justificativas.forEach((motivo) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "item-justificativa-painel";
    btn.dataset.motivo = motivo;
    btn.textContent = motivo;

    btn.addEventListener("click", async () => {
      console.log("📝 Justificativa RH clicada:", motivo);
      await selecionarJustificativaPainelRH(motivo);
    });

    lista.appendChild(btn);
  });

  const btnFechar = painel.querySelector("#btn-fechar-painel-justificativa-rh");
  if (btnFechar) {
    btnFechar.addEventListener("click", fecharPainelJustificativaRH);
  }

  document.addEventListener("click", (event) => {
    const painelAberto = document.getElementById(
      "painel-justificativa-rh-flutuante"
    );

    if (!painelAberto || !painelAberto.classList.contains("ativo")) return;

    const clicouNoPainel = painelAberto.contains(event.target);
    const clicouNoBotao = event.target.closest(
      ".btn-justificativa-rh, .btn-justificativa-celula"
    );

    if (!clicouNoPainel && !clicouNoBotao) {
      console.log("🪟 Clique fora do painel RH detectado. Fechando...");
      fecharPainelJustificativaRH();
    }
  });

  window.addEventListener("resize", () => {
    if (TABELA_RH_STATE.botaoAtivo) {
      posicionarPainelJustificativaRH(TABELA_RH_STATE.botaoAtivo);
    }
  });

  window.addEventListener("scroll", () => {
    if (TABELA_RH_STATE.botaoAtivo) {
      posicionarPainelJustificativaRH(TABELA_RH_STATE.botaoAtivo);
    }
  });

  console.log("✅ Painel RH criado com sucesso");
  return painel;
}

function posicionarPainelJustificativaRH(botao) {
  const painel = garantirPainelJustificativaRH();
  const caixa = painel.querySelector(".painel-justificativa-box");
  if (!caixa || !botao) return;

  const rect = botao.getBoundingClientRect();
  const larguraPainel = 280;
  const margem = 12;

  let left = rect.left;
  let top = rect.bottom + 8;

  if (left + larguraPainel > window.innerWidth - margem) {
    left = window.innerWidth - larguraPainel - margem;
  }

  if (left < margem) {
    left = margem;
  }

  const alturaAproximada = 320;
  if (top + alturaAproximada > window.innerHeight - margem) {
    top = rect.top - alturaAproximada - 8;
  }

  if (top < margem) {
    top = margem;
  }

  caixa.style.left = `${left}px`;
  caixa.style.top = `${top}px`;

  console.log("📍 Painel RH posicionado:", { left, top });
}

function marcarJustificativaSelecionadaNoPainelRH(botao) {
  const painel = garantirPainelJustificativaRH();
  const atual = normalizarTextoRH(botao?.dataset.justificativaAtual || "");

  painel.querySelectorAll(".item-justificativa-painel").forEach((item) => {
    const motivo = normalizarTextoRH(item.dataset.motivo || "");
    item.classList.toggle("ativo", motivo === atual);
  });

  const titulo = painel.querySelector("#titulo-painel-justificativa-rh");
  if (titulo && botao) {
    titulo.textContent = `Justificativa - ${getLabelCampoRH(botao.dataset.campo)}`;
  }

  console.log("✅ Justificativa RH marcada no painel:", atual || "(nenhuma)");
}

function abrirPainelJustificativaRH(botao, event = null) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!botao || botao.disabled) {
    console.warn("⚠️ Botão RH inválido ou desabilitado");
    finalizarCliqueJustificativaRH();
    return;
  }

  TABELA_RH_STATE.botaoAtivo = botao;

  const painel = garantirPainelJustificativaRH();
  painel.classList.add("ativo");

  posicionarPainelJustificativaRH(botao);
  marcarJustificativaSelecionadaNoPainelRH(botao);

  console.log("🪟 Painel RH aberto", {
    loja: botao.dataset.loja,
    semana: botao.dataset.semana,
    campo: botao.dataset.campo,
    justificativaAtual: botao.dataset.justificativaAtual || "",
  });

  finalizarCliqueJustificativaRH(220);
}

function fecharPainelJustificativaRH() {
  const painel = document.getElementById("painel-justificativa-rh-flutuante");
  if (painel) {
    painel.classList.remove("ativo");
  }

  console.log("🪟 Painel RH fechado");

  TABELA_RH_STATE.botaoAtivo = null;
  TABELA_RH_STATE.clicandoBotao = false;

  if (TABELA_RH_STATE.timeoutClique) {
    clearTimeout(TABELA_RH_STATE.timeoutClique);
    TABELA_RH_STATE.timeoutClique = null;
  }
}

async function selecionarJustificativaPainelRH(motivo) {
  const botao = TABELA_RH_STATE.botaoAtivo;
  if (!botao) {
    console.warn("⚠️ Nenhum botão RH ativo para aplicar justificativa");
    return;
  }

  const input = getInputDoBotaoRH(botao);
  if (!input) {
    console.warn("⚠️ Input RH relacionado ao botão não encontrado");
    return;
  }

  console.log("📝 Selecionando justificativa RH:", {
    motivo,
    loja: botao.dataset.loja,
    semana: botao.dataset.semana,
    campo: botao.dataset.campo,
  });

  botao.dataset.justificativaAtual = normalizarTextoRH(motivo || "");
  botao.classList.remove("pendente", "oculto");

  atualizarEstadoVisualBotaoRH(botao);
  atualizarEstadoVisualInputRHComJustificativa(input, botao);

  const salvou = await processarAutoSalvarRHCampo(input, botao);

  if (salvou) {
    console.log("✅ Justificativa RH salva com sucesso");
    fecharPainelJustificativaRH();
  } else {
    console.warn("⚠️ Falha ao salvar justificativa RH selecionada");
  }
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
    titulo: indicador || "BANCOS DE HORAS",
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
              <th rowspan="2" class="col-codigo-rh">Código</th>
              <th rowspan="2" class="col-loja-rh">Loja</th>
              <th rowspan="2" class="col-regional-rh">Regional</th>
  `;

  semanas.forEach((semana) => {
    const destaque = semana === semanaAtualReal ? ' class="coluna-atual"' : "";
    html += `<th colspan="2"${destaque}>Semana ${semana}</th>`;
  });

  html += `
            </tr>
            <tr>
  `;

  semanas.forEach((semana) => {
    const destaque = semana === semanaAtualReal ? ' class="coluna-atual"' : "";
    html += `
      <th${destaque}>${config.col1}</th>
      <th${destaque}>${config.col2}</th>
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
      <tr>
        <td class="col-codigo-rh">${loja.codigo}</td>
        <td class="col-loja-rh">${loja.nome}</td>
        <td class="col-regional-rh">${loja.regional || "-"}</td>
    `;

    semanas.forEach((semana) => {
      const key = `${chaveLoja}-${semana}`;
      const item = mapa[key] || {};

      const horasMais = item.valor ?? "";
      const horasMenos = item.valor2 ?? "";
      const destaque = semana === semanaAtualReal ? "coluna-atual" : "";

      const justificativa1 = item[getColunaJustificativaRH("valor")] ?? "";
      const justificativa2 = item[getColunaJustificativaRH("valor2")] ?? "";

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

      const mostrarBotao1 =
        horasMais === null || horasMais === undefined || horasMais === "";

      const mostrarBotao2 =
        horasMenos === null || horasMenos === undefined || horasMenos === "";

      html += `
        <td class="${destaque}">
          <div class="campo-tabela-com-justificativa">
            <input
              type="text"
              inputmode="decimal"
              value="${escapeHtmlRH(valorFormatado)}"
              data-loja="${escapeHtmlRH(chaveLoja)}"
              data-semana="${escapeHtmlRH(semana)}"
              data-campo="valor"
              data-tipo="${escapeHtmlRH(config.tipo1)}"
              data-original="${escapeHtmlRH(original1)}"
              data-original-justificativa="${escapeHtmlRH(justificativa1)}"
              class="input-tabela input-tabela-rh ${justificativa1 && mostrarBotao1 ? "input-com-justificativa" : ""}"
              onfocus="prepararInputRH(this)"
              oninput="atualizarVisibilidadeJustificativaRH(this)"
              onblur="autoSalvarRH(this)"
            >

            <button
              type="button"
              class="btn-justificativa-celula btn-justificativa-rh ${justificativa1 ? "ativo" : ""} ${
                mostrarBotao1 ? "" : "oculto"
              }"
              data-role="justificativa-rh"
              data-loja="${escapeHtmlRH(chaveLoja)}"
              data-semana="${escapeHtmlRH(semana)}"
              data-campo="valor"
              data-original="${escapeHtmlRH(justificativa1)}"
              data-justificativa-atual="${escapeHtmlRH(justificativa1)}"
              onmousedown="prepararCliqueJustificativaRH(event)"
              onclick="abrirPainelJustificativaRH(this, event)"
              title="${escapeHtmlRH(
                justificativa1 || `Selecionar justificativa - ${config.col1}`
              )}"
            >
              !
            </button>
          </div>
        </td>

        <td class="${destaque}">
          <div class="campo-tabela-com-justificativa">
            <input
              type="text"
              inputmode="decimal"
              value="${escapeHtmlRH(valor2Formatado)}"
              data-loja="${escapeHtmlRH(chaveLoja)}"
              data-semana="${escapeHtmlRH(semana)}"
              data-campo="valor2"
              data-tipo="${escapeHtmlRH(config.tipo2)}"
              data-original="${escapeHtmlRH(original2)}"
              data-original-justificativa="${escapeHtmlRH(justificativa2)}"
              class="input-tabela input-tabela-rh ${justificativa2 && mostrarBotao2 ? "input-com-justificativa" : ""}"
              onfocus="prepararInputRH(this)"
              oninput="atualizarVisibilidadeJustificativaRH(this)"
              onblur="autoSalvarRH(this)"
            >

            <button
              type="button"
              class="btn-justificativa-celula btn-justificativa-rh ${justificativa2 ? "ativo" : ""} ${
                mostrarBotao2 ? "" : "oculto"
              }"
              data-role="justificativa-rh"
              data-loja="${escapeHtmlRH(chaveLoja)}"
              data-semana="${escapeHtmlRH(semana)}"
              data-campo="valor2"
              data-original="${escapeHtmlRH(justificativa2)}"
              data-justificativa-atual="${escapeHtmlRH(justificativa2)}"
              onmousedown="prepararCliqueJustificativaRH(event)"
              onclick="abrirPainelJustificativaRH(this, event)"
              title="${escapeHtmlRH(
                justificativa2 || `Selecionar justificativa - ${config.col2}`
              )}"
            >
              !
            </button>
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
    ativarFiltroRH();
    garantirPainelJustificativaRH();
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

      const codigo = row.children[0]?.textContent.toLowerCase() || "";
      const loja = row.children[1]?.textContent.toLowerCase() || "";
      const regional = row.children[2]?.textContent.toLowerCase() || "";

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
      aplicar();
    });
  });
}

// ==========================
// 💾 PROCESSAR AUTOSAVE RH
// ==========================
async function processarAutoSalvarRHCampo(input, botao = null) {
  if (!input) return false;

  const loja = input.dataset.loja;
  const semana = input.dataset.semana;
  const campo = input.dataset.campo;
  const tipo = input.dataset.tipo || "numero";

  const botaoJustificativa = botao || getBotaoRHDoInput(input);

  const valorDigitado = (input.value || "").toString().trim();
  let justificativaSelecionada = normalizarTextoRH(
    botaoJustificativa?.dataset.justificativaAtual || ""
  );

  const valorOriginal = input.dataset.original ?? "";
  const justificativaOriginal = input.dataset.originalJustificativa ?? "";

  if (!valorCampoEstaVazioRH(valorDigitado)) {
    justificativaSelecionada = "";

    if (botaoJustificativa) {
      botaoJustificativa.dataset.justificativaAtual = "";
      botaoJustificativa.dataset.original = "";
      botaoJustificativa.classList.add("oculto");
      botaoJustificativa.disabled = true;
      botaoJustificativa.classList.remove("ativo", "pendente");
      botaoJustificativa.title = `Selecionar justificativa - ${getLabelCampoRH(campo)}`;
    }

    input.classList.remove("input-com-justificativa");
    aplicarStatusInputRH(input, "normal");
  } else {
    if (botaoJustificativa) {
      botaoJustificativa.classList.remove("oculto");
      botaoJustificativa.disabled =
        input.disabled || input.readOnly || input.dataset.bloqueado === "true";

      atualizarEstadoVisualBotaoRH(botaoJustificativa);
      atualizarEstadoVisualInputRHComJustificativa(input, botaoJustificativa);
    }
  }

  let valorLimpo = null;

  if (!valorCampoEstaVazioRH(valorDigitado)) {
    if (typeof limparValorParaSalvar === "function") {
      valorLimpo = limparValorParaSalvar(valorDigitado, tipo);
    } else {
      const numero = Number((input.value || "").toString().replace(",", "."));
      valorLimpo = isNaN(numero) ? null : numero;
    }

    if (valorLimpo === null || Number.isNaN(valorLimpo)) {
      console.warn("⚠️ Valor RH inválido ou vazio, salvamento ignorado", {
        loja,
        semana,
        campo,
        valorDigitado: input.value,
        tipo,
      });

      aplicarStatusInputRH(input, "erro");
      return false;
    }
  }

  const comparacao = valorLimpo === null ? "" : String(valorLimpo);

  if (
    comparacao === valorOriginal &&
    justificativaSelecionada === justificativaOriginal
  ) {
    console.log("ℹ️ Valor RH não alterado, salvamento ignorado", {
      loja,
      semana,
      campo,
      valor: comparacao,
      justificativa: justificativaSelecionada,
    });

    if (valorLimpo !== null && typeof formatarValorParaInput === "function") {
      input.value = formatarValorParaInput(valorLimpo, tipo);
    }

    atualizarEstadoVisualInputRHComJustificativa(input, botaoJustificativa);

    if (valorLimpo !== null) {
      aplicarStatusInputRH(input, "normal");
    }

    return true;
  }

  if (valorLimpo === null && !justificativaSelecionada) {
    console.warn(
      "⚠️ Campo RH sem valor e sem justificativa. Salvamento bloqueado.",
      {
        loja,
        semana,
        campo,
      }
    );

    if (botaoJustificativa) {
      botaoJustificativa.classList.add("pendente");
      abrirPainelJustificativaRH(botaoJustificativa, null);
    }

    aplicarStatusInputRH(input, "erro");
    return false;
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
    justificativa: justificativaSelecionada,
    tipo,
    indicador: indicadorNormalizado,
    classe,
  });

  aplicarStatusInputRH(input, "salvando");

  const salvou = await salvarValorRH(
    loja,
    semana,
    campo,
    valorLimpo,
    indicadorNormalizado,
    classe,
    justificativaSelecionada
  );

  if (salvou) {
    input.dataset.original = comparacao;
    input.dataset.originalJustificativa = justificativaSelecionada;

    if (botaoJustificativa) {
      botaoJustificativa.dataset.original = justificativaSelecionada;
      botaoJustificativa.dataset.justificativaAtual = justificativaSelecionada;
      botaoJustificativa.classList.remove("pendente");
      atualizarEstadoVisualBotaoRH(botaoJustificativa);
    }

    atualizarEstadoVisualInputRHComJustificativa(input, botaoJustificativa);
    atualizarVisibilidadeJustificativaRH(input, false);
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

  if (TABELA_RH_STATE.clicandoBotao === true) {
    console.log("ℹ️ AutoSave RH ignorado temporariamente por clique no botão");
    return;
  }

  await processarAutoSalvarRHCampo(input);
}

// ==========================
// 💾 SALVAR VALOR RH
// ==========================
async function salvarValorRH(
  loja,
  semana,
  campo,
  valor,
  indicadorNormalizado,
  classe,
  justificativa = ""
) {
  const numero =
    valor === null || valor === undefined || valor === ""
      ? null
      : Number(valor);

  if (valor !== null && valor !== undefined && valor !== "" && isNaN(numero)) {
    console.warn("⚠️ salvarValorRH ignorado por número inválido:", valor);
    return false;
  }

  const justificativaFinal = normalizarTextoRH(justificativa || "") || null;

  const indicadorBanco =
    typeof getIndicadorBanco === "function"
      ? getIndicadorBanco(
          indicadorNormalizado,
          localStorage.getItem("classeSelecionada") || ""
        )
      : indicadorNormalizado;

  const colunaJustificativa = getColunaJustificativaRH(campo);

  const chaveSalvar = getChaveRegistroRH(
    loja,
    semana,
    indicadorBanco,
    classe,
    campo
  );

  if (TABELA_RH_STATE.salvando.has(chaveSalvar)) {
    console.warn("⚠️ Já existe salvamento RH em andamento:", chaveSalvar);
    return false;
  }

  TABELA_RH_STATE.salvando.add(chaveSalvar);

  console.log("💾 SALVAR RH:", {
    loja,
    semana,
    campo,
    valor: numero,
    indicador: indicadorNormalizado,
    indicadorBanco,
    classe,
    colunaJustificativa,
    justificativa: justificativaFinal,
  });

  try {
    const { data: existentes, error } = await window.db
      .from("resultados")
      .select("*")
      .eq("loja", loja)
      .eq("semana", semana)
      .eq("indicador", indicadorBanco)
      .eq("classe", classe)
      .order("id", { ascending: true });

    if (error) throw error;

    const registros = existentes || [];

    if (registros.length > 1) {
      console.warn("⚠️ Registros RH duplicados encontrados:", {
        loja,
        semana,
        indicadorBanco,
        classe,
        qtd: registros.length,
        ids: registros.map((r) => r.id),
      });
    }

    const updateData = {};
    updateData[campo] = numero;
    updateData[colunaJustificativa] =
      numero !== null ? null : justificativaFinal;

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
        semana,
        campo,
        valor: numero,
        colunaJustificativa,
        justificativa: updateData[colunaJustificativa],
      });

      return true;
    }

    const novoRegistro = {
      loja,
      semana,
      indicador: indicadorBanco,
      classe,
      valor: campo === "valor" ? numero : null,
      valor2: campo === "valor2" ? numero : null,
    };

    novoRegistro[colunaJustificativa] =
      numero !== null ? null : justificativaFinal;

    const { data: inserido, error: insertError } = await window.db
      .from("resultados")
      .insert([novoRegistro])
      .select("id")
      .single();

    if (insertError) throw insertError;

    console.log("✅ RH inserido com sucesso:", {
      id: inserido?.id,
      loja,
      semana,
      campo,
      valor: numero,
      colunaJustificativa,
      justificativa: novoRegistro[colunaJustificativa],
    });

    return true;
  } catch (erro) {
    console.error("❌ Erro ao salvar RH:", erro);
    return false;
  } finally {
    TABELA_RH_STATE.salvando.delete(chaveSalvar);
  }
}
