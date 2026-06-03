// ==========================
// 🧩 TABELA ESPECIAL
// (SELF-CHECKOUT / PART.TELEVENDAS)
// ==========================

const TABELA_ESPECIAL_STATE = {
  salvando: new Set(),
  botaoAtivo: null,
  clicandoBotao: false,
  timeoutClique: null,
};

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
  return texto.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

function normalizarTextoEspecial(valor) {
  if (typeof normalizarTextoTabela === "function") {
    return normalizarTextoTabela(valor);
  }
  return (valor || "").toString().trim();
}

function valorCampoEstaVazioEspecial(valor) {
  return normalizarTextoEspecial(valor) === "";
}

function getListaJustificativasEspecial() {
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
  const config = getConfigTabelaEspecial(indicadorSelecionado, classeSelecionada);

  if (campo === "valor") return config.col1 || "Campo 1";
  if (campo === "valor2") return config.col2 || "Campo 2";

  return campo;
}

function getInputEspecial(loja, semana, campo) {
  const lojaEsc = escapeCssSelectorEspecial(loja);
  const semanaEsc = escapeCssSelectorEspecial(semana);
  const campoEsc = escapeCssSelectorEspecial(campo);

  const el = document.querySelector(
    `#tbody-especial input[data-loja="${lojaEsc}"][data-semana="${semanaEsc}"][data-campo="${campoEsc}"]`
  );

  if (!el) {
    console.warn("⚠️ Input especial não encontrado:", { loja, semana, campo });
  }

  return el;
}

function getBotaoJustificativaEspecial(loja, semana, campo) {
  const lojaEsc = escapeCssSelectorEspecial(loja);
  const semanaEsc = escapeCssSelectorEspecial(semana);
  const campoEsc = escapeCssSelectorEspecial(campo);

  const el = document.querySelector(
    `#tbody-especial button[data-loja="${lojaEsc}"][data-semana="${semanaEsc}"][data-campo="${campoEsc}"][data-role="justificativa-especial"]`
  );

  if (!el) {
    console.warn("⚠️ Botão de justificativa especial não encontrado:", {
      loja,
      semana,
      campo,
    });
  }

  return el;
}

function getBotaoEspecialDoInput(input) {
  if (!input) return null;
  return getBotaoJustificativaEspecial(
    input.dataset.loja,
    input.dataset.semana,
    input.dataset.campo
  );
}

function getInputDoBotaoEspecial(botao) {
  if (!botao) return null;
  return getInputEspecial(botao.dataset.loja, botao.dataset.semana, botao.dataset.campo);
}

function prepararCliqueJustificativaEspecial(event = null) {
  console.log("🖱️ prepararCliqueJustificativaEspecial");

  TABELA_ESPECIAL_STATE.clicandoBotao = true;

  if (TABELA_ESPECIAL_STATE.timeoutClique) {
    clearTimeout(TABELA_ESPECIAL_STATE.timeoutClique);
    TABELA_ESPECIAL_STATE.timeoutClique = null;
  }

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function finalizarCliqueJustificativaEspecial(delay = 180) {
  if (TABELA_ESPECIAL_STATE.timeoutClique) {
    clearTimeout(TABELA_ESPECIAL_STATE.timeoutClique);
    TABELA_ESPECIAL_STATE.timeoutClique = null;
  }

  TABELA_ESPECIAL_STATE.timeoutClique = setTimeout(() => {
    TABELA_ESPECIAL_STATE.clicandoBotao = false;
    TABELA_ESPECIAL_STATE.timeoutClique = null;
    console.log("🖱️ Estado de clique especial finalizado");
  }, delay);
}

function atualizarEstadoVisualBotaoEspecial(botao) {
  if (!botao) return;

  const justificativaAtual = normalizarTextoEspecial(
    botao.dataset.justificativaAtual || ""
  );

  botao.classList.toggle("ativo", !!justificativaAtual);
  botao.title = justificativaAtual || `Selecionar justificativa - ${getLabelCampoEspecial(botao.dataset.campo)}`;

  console.log("🎯 Estado visual do botão especial atualizado:", {
    campo: botao.dataset.campo,
    justificativaAtual,
    ativo: !!justificativaAtual,
  });
}

function atualizarEstadoVisualInputEspecialComJustificativa(input, botao = null) {
  if (!input) return;

  const botaoRef = botao || getBotaoEspecialDoInput(input);

  if (!botaoRef) {
    input.classList.remove("input-com-justificativa");
    console.warn("⚠️ Botão especial não encontrado para atualizar input:", {
      loja: input.dataset?.loja,
      semana: input.dataset?.semana,
      campo: input.dataset?.campo,
    });
    return;
  }

  const temValor = !valorCampoEstaVazioEspecial(input.value);
  const justificativaAtual = normalizarTextoEspecial(
    botaoRef.dataset.justificativaAtual ||
      botaoRef.dataset.original ||
      ""
  );

  const deveDestacar = !temValor && !!justificativaAtual;

  input.classList.toggle("input-com-justificativa", deveDestacar);

  console.log("🎨 Estado visual do input especial atualizado:", {
    loja: input.dataset?.loja,
    semana: input.dataset?.semana,
    campo: input.dataset?.campo,
    temValor,
    justificativaAtual,
    destacado: deveDestacar,
  });
}

function atualizarVisibilidadeJustificativaEspecial(input, limparSeTiverValor = true) {
  if (!input) return;

  const botao = getBotaoEspecialDoInput(input);
  if (!botao) return;

  const temValor = !valorCampoEstaVazioEspecial(input.value);
  const bloqueado =
    input.disabled || input.readOnly || input.dataset.bloqueado === "true";

  if (temValor) {
    if (limparSeTiverValor) {
      botao.dataset.justificativaAtual = "";
      botao.dataset.original = "";
      atualizarEstadoVisualBotaoEspecial(botao);
    }

    botao.classList.add("oculto");
    botao.disabled = true;
    botao.classList.remove("pendente");
    input.classList.remove("input-com-justificativa");

    console.log("👁️ Botão especial ocultado porque existe valor", {
      loja: input.dataset.loja,
      semana: input.dataset.semana,
      campo: input.dataset.campo,
    });

    return;
  }

  botao.classList.remove("oculto");
  botao.disabled = bloqueado;
  botao.classList.toggle("bloqueado", bloqueado);
  atualizarEstadoVisualBotaoEspecial(botao);
  atualizarEstadoVisualInputEspecialComJustificativa(input, botao);

  console.log("👁️ Botão especial exibido", {
    loja: input.dataset.loja,
    semana: input.dataset.semana,
    campo: input.dataset.campo,
    bloqueado,
  });
}

function sincronizarJustificativasComPermissoesTabelaEspecial() {
  console.log("🔐 Sincronizando justificativas da tabela especial com permissões...");

  const inputs = document.querySelectorAll(
    '#tbody-especial input[data-loja][data-semana][data-campo]'
  );

  inputs.forEach((input) => {
    const botao = getBotaoEspecialDoInput(input);
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
      atualizarVisibilidadeJustificativaEspecial(input, false);
    }
  });

  console.log("✅ Sincronização especial concluída");
}

// ==========================
// 🪟 PAINEL DE JUSTIFICATIVA ESPECIAL
// ==========================
function garantirPainelJustificativaEspecial() {
  let painel = document.getElementById("painel-justificativa-especial-flutuante");

  if (painel) {
    console.log("🪟 Painel especial já existente");
    return painel;
  }

  console.log("🪟 Criando painel de justificativa especial...");

  painel = document.createElement("div");
  painel.id = "painel-justificativa-especial-flutuante";
  painel.className = "painel-justificativa-flutuante";

  painel.innerHTML = `
    <div class="painel-justificativa-box">
      <div class="painel-justificativa-header">
        <strong id="titulo-painel-justificativa-especial">Selecionar justificativa</strong>
        <button
          type="button"
          class="btn-fechar-painel-justificativa"
          id="btn-fechar-painel-justificativa-especial"
        >
          ✕
        </button>
      </div>

      <div class="painel-justificativa-lista" id="painel-justificativa-especial-lista"></div>
    </div>
  `;

  document.body.appendChild(painel);

  const lista = painel.querySelector("#painel-justificativa-especial-lista");
  const justificativas = getListaJustificativasEspecial();

  justificativas.forEach((motivo) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "item-justificativa-painel";
    btn.dataset.motivo = motivo;
    btn.textContent = motivo;

    btn.addEventListener("click", async () => {
      console.log("📝 Justificativa especial clicada:", motivo);
      await selecionarJustificativaPainelEspecial(motivo);
    });

    lista.appendChild(btn);
  });

  const btnFechar = painel.querySelector("#btn-fechar-painel-justificativa-especial");
  if (btnFechar) {
    btnFechar.addEventListener("click", fecharPainelJustificativaEspecial);
  }

  document.addEventListener("click", (event) => {
    const painelAberto = document.getElementById(
      "painel-justificativa-especial-flutuante"
    );

    if (!painelAberto || !painelAberto.classList.contains("ativo")) return;

    const clicouNoPainel = painelAberto.contains(event.target);
    const clicouNoBotao = event.target.closest(
      ".btn-justificativa-especial, .btn-justificativa-celula"
    );

    if (!clicouNoPainel && !clicouNoBotao) {
      console.log("🪟 Clique fora do painel especial detectado. Fechando...");
      fecharPainelJustificativaEspecial();
    }
  });

  window.addEventListener("resize", () => {
    if (TABELA_ESPECIAL_STATE.botaoAtivo) {
      posicionarPainelJustificativaEspecial(TABELA_ESPECIAL_STATE.botaoAtivo);
    }
  });

  window.addEventListener("scroll", () => {
    if (TABELA_ESPECIAL_STATE.botaoAtivo) {
      posicionarPainelJustificativaEspecial(TABELA_ESPECIAL_STATE.botaoAtivo);
    }
  });

  console.log("✅ Painel especial criado com sucesso");
  return painel;
}

function posicionarPainelJustificativaEspecial(botao) {
  const painel = garantirPainelJustificativaEspecial();
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

  console.log("📍 Painel especial posicionado:", { left, top });
}

function marcarJustificativaSelecionadaNoPainelEspecial(botao) {
  const painel = garantirPainelJustificativaEspecial();
  const atual = normalizarTextoEspecial(botao?.dataset.justificativaAtual || "");

  painel.querySelectorAll(".item-justificativa-painel").forEach((item) => {
    const motivo = normalizarTextoEspecial(item.dataset.motivo || "");
    item.classList.toggle("ativo", motivo === atual);
  });

  const titulo = painel.querySelector("#titulo-painel-justificativa-especial");
  if (titulo && botao) {
    titulo.textContent = `Justificativa - ${getLabelCampoEspecial(botao.dataset.campo)}`;
  }

  console.log("✅ Justificativa especial marcada no painel:", atual || "(nenhuma)");
}

function abrirPainelJustificativaEspecial(botao, event = null) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!botao || botao.disabled) {
    console.warn("⚠️ Botão especial inválido ou desabilitado");
    finalizarCliqueJustificativaEspecial();
    return;
  }

  TABELA_ESPECIAL_STATE.botaoAtivo = botao;

  const painel = garantirPainelJustificativaEspecial();
  painel.classList.add("ativo");

  posicionarPainelJustificativaEspecial(botao);
  marcarJustificativaSelecionadaNoPainelEspecial(botao);

  console.log("🪟 Painel especial aberto", {
    loja: botao.dataset.loja,
    semana: botao.dataset.semana,
    campo: botao.dataset.campo,
    justificativaAtual: botao.dataset.justificativaAtual || "",
  });

  finalizarCliqueJustificativaEspecial(220);
}

function fecharPainelJustificativaEspecial() {
  const painel = document.getElementById("painel-justificativa-especial-flutuante");
  if (painel) {
    painel.classList.remove("ativo");
  }

  console.log("🪟 Painel especial fechado");

  TABELA_ESPECIAL_STATE.botaoAtivo = null;
  TABELA_ESPECIAL_STATE.clicandoBotao = false;

  if (TABELA_ESPECIAL_STATE.timeoutClique) {
    clearTimeout(TABELA_ESPECIAL_STATE.timeoutClique);
    TABELA_ESPECIAL_STATE.timeoutClique = null;
  }
}

async function selecionarJustificativaPainelEspecial(motivo) {
  const botao = TABELA_ESPECIAL_STATE.botaoAtivo;
  if (!botao) {
    console.warn("⚠️ Nenhum botão especial ativo para aplicar justificativa");
    return;
  }

  const input = getInputDoBotaoEspecial(botao);
  if (!input) {
    console.warn("⚠️ Input especial relacionado ao botão não encontrado");
    return;
  }

  console.log("📝 Selecionando justificativa especial:", {
    motivo,
    loja: botao.dataset.loja,
    semana: botao.dataset.semana,
    campo: botao.dataset.campo,
  });

  botao.dataset.justificativaAtual = normalizarTextoEspecial(motivo || "");
  botao.classList.remove("pendente", "oculto");

  atualizarEstadoVisualBotaoEspecial(botao);
  atualizarEstadoVisualInputEspecialComJustificativa(input, botao);

  const salvou = await processarAutoSalvarEspecialCampo(input, botao);

  if (salvou) {
    console.log("✅ Justificativa especial salva com sucesso");
    fecharPainelJustificativaEspecial();
  } else {
    console.warn("⚠️ Falha ao salvar justificativa especial selecionada");
  }
}

// ==========================
// ⚙️ CONFIG DA TABELA ESPECIAL
// ==========================
function getConfigTabelaEspecial(indicador, classeSelecionada = null) {
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

    return {
      titulo: cfg?.nomeExibicao || indicador,
      col1: campo1.label || "Coluna 1",
      col2: campo2.label || "Coluna 2",
      tipo1: campo1.tipo || "numero",
      tipo2: campo2.tipo || "numero",
    };
  }

  const indicadorNorm = (indicador || "").toString().trim().toUpperCase();

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
      col1: "Participação",
      col2: "Qtd Passantes",
      tipo1: "moeda",
      tipo2: "numero",
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
    classeSelecionada
  );
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
              <th rowspan="2" class="col-codigo">Código</th>
              <th rowspan="2" class="col-loja">Loja</th>
              <th rowspan="2" class="col-regional">Regional</th>
  `;

  semanas.forEach((semana) => {
    const destaque = semana === semanaAtualReal ? ' class="coluna-atual"' : "";
    html += `<th colspan="2"${destaque}>Semana ${semana}</th>`;
  });

  html += `</tr><tr>`;

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
          <tbody id="tbody-especial">
  `;

  lojas.forEach((loja) => {
    const chaveLoja = `${loja.codigo} - ${loja.nome}`;

    html += `<tr>`;
    html += `<td class="col-codigo">${loja.codigo}</td>`;
    html += `<td class="col-loja">${loja.nome}</td>`;
    html += `<td class="col-regional">${loja.regional || "-"}</td>`;

    semanas.forEach((semana) => {
      const key = `${chaveLoja}-${semana}`;
      const item = mapa[key] || {};
      const destaque = semana === semanaAtualReal ? "coluna-atual" : "";

      const valor = item.valor ?? "";
      const valor2 = item.valor2 ?? "";

      const justificativa1 = item[getColunaJustificativaEspecial("valor")] ?? "";
      const justificativa2 = item[getColunaJustificativaEspecial("valor2")] ?? "";

      const valorFormatado =
        typeof formatarValorParaInput === "function"
          ? formatarValorParaInput(valor, config.tipo1)
          : valor;

      const valor2Formatado =
        typeof formatarValorParaInput === "function"
          ? formatarValorParaInput(valor2, config.tipo2)
          : valor2;

      const original1 =
        valor === null || valor === undefined || valor === ""
          ? ""
          : String(valor);

      const original2 =
        valor2 === null || valor2 === undefined || valor2 === ""
          ? ""
          : String(valor2);

      const mostrarBotao1 =
        valor === null || valor === undefined || valor === "";

      const mostrarBotao2 =
        valor2 === null || valor2 === undefined || valor2 === "";

      html += `
        <td class="${destaque}">
          <div class="campo-tabela-com-justificativa">
            <input
              type="text"
              inputmode="decimal"
              value="${escapeHtmlEspecial(valorFormatado)}"
              class="input-tabela input-tabela-compacto ${justificativa1 && !mostrarBotao1 ? "" : ""} ${justificativa1 && mostrarBotao1 ? "input-com-justificativa" : ""}"
              data-loja="${escapeHtmlEspecial(chaveLoja)}"
              data-semana="${escapeHtmlEspecial(semana)}"
              data-campo="valor"
              data-tipo="${escapeHtmlEspecial(config.tipo1)}"
              data-original="${escapeHtmlEspecial(original1)}"
              data-original-justificativa="${escapeHtmlEspecial(justificativa1)}"
              onfocus="prepararInputEspecial(this)"
              oninput="atualizarVisibilidadeJustificativaEspecial(this)"
              onblur="autoSalvarEspecial(this)"
            >

            <button
              type="button"
              class="btn-justificativa-celula btn-justificativa-especial ${justificativa1 ? "ativo" : ""} ${
                mostrarBotao1 ? "" : "oculto"
              }"
              data-role="justificativa-especial"
              data-loja="${escapeHtmlEspecial(chaveLoja)}"
              data-semana="${escapeHtmlEspecial(semana)}"
              data-campo="valor"
              data-original="${escapeHtmlEspecial(justificativa1)}"
              data-justificativa-atual="${escapeHtmlEspecial(justificativa1)}"
              onmousedown="prepararCliqueJustificativaEspecial(event)"
              onclick="abrirPainelJustificativaEspecial(this, event)"
              title="${escapeHtmlEspecial(
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
              value="${escapeHtmlEspecial(valor2Formatado)}"
              class="input-tabela input-tabela-compacto ${justificativa2 && mostrarBotao2 ? "input-com-justificativa" : ""}"
              data-loja="${escapeHtmlEspecial(chaveLoja)}"
              data-semana="${escapeHtmlEspecial(semana)}"
              data-campo="valor2"
              data-tipo="${escapeHtmlEspecial(config.tipo2)}"
              data-original="${escapeHtmlEspecial(original2)}"
              data-original-justificativa="${escapeHtmlEspecial(justificativa2)}"
              onfocus="prepararInputEspecial(this)"
              oninput="atualizarVisibilidadeJustificativaEspecial(this)"
              onblur="autoSalvarEspecial(this)"
            >

            <button
              type="button"
              class="btn-justificativa-celula btn-justificativa-especial ${justificativa2 ? "ativo" : ""} ${
                mostrarBotao2 ? "" : "oculto"
              }"
              data-role="justificativa-especial"
              data-loja="${escapeHtmlEspecial(chaveLoja)}"
              data-semana="${escapeHtmlEspecial(semana)}"
              data-campo="valor2"
              data-original="${escapeHtmlEspecial(justificativa2)}"
              data-justificativa-atual="${escapeHtmlEspecial(justificativa2)}"
              onmousedown="prepararCliqueJustificativaEspecial(event)"
              onclick="abrirPainelJustificativaEspecial(this, event)"
              title="${escapeHtmlEspecial(
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
    ativarFiltroEspecial();
    garantirPainelJustificativaEspecial();
    sincronizarJustificativasComPermissoesTabelaEspecial();
  });

  return html;
}

// ==========================
// ✍️ PREPARAR INPUT ESPECIAL
// remove máscara ao focar
// ==========================
function prepararInputEspecial(input) {
  const tipo = input.dataset.tipo || "numero";

  if (typeof prepararInputFormatado === "function") {
    prepararInputFormatado(input);
    return;
  }

  let valor = (input.value || "").toString().trim();
  valor = valor.replace("R$", "").replace("%", "").replace(/\s/g, "").trim();

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
// 💾 PROCESSAR AUTOSAVE ESPECIAL
// valor + justificativa por campo
// ==========================
async function processarAutoSalvarEspecialCampo(input, botao = null) {
  if (!input) return false;

  const loja = input.dataset.loja;
  const semana = input.dataset.semana;
  const campo = input.dataset.campo;
  const tipo = input.dataset.tipo || "numero";

  const botaoJustificativa = botao || getBotaoEspecialDoInput(input);

  const valorDigitado = (input.value || "").toString().trim();
  let justificativaSelecionada = normalizarTextoEspecial(
    botaoJustificativa?.dataset.justificativaAtual || ""
  );

  const valorOriginal = input.dataset.original ?? "";
  const justificativaOriginal = input.dataset.originalJustificativa ?? "";

  if (!valorCampoEstaVazioEspecial(valorDigitado)) {
    justificativaSelecionada = "";

    if (botaoJustificativa) {
      botaoJustificativa.dataset.justificativaAtual = "";
      botaoJustificativa.dataset.original = "";
      botaoJustificativa.classList.add("oculto");
      botaoJustificativa.disabled = true;
      botaoJustificativa.classList.remove("ativo", "pendente");
      botaoJustificativa.title = `Selecionar justificativa - ${getLabelCampoEspecial(campo)}`;
    }

    input.classList.remove("input-com-justificativa");
  } else {
    if (botaoJustificativa) {
      botaoJustificativa.classList.remove("oculto");
      botaoJustificativa.disabled =
        input.disabled || input.readOnly || input.dataset.bloqueado === "true";

      atualizarEstadoVisualBotaoEspecial(botaoJustificativa);
      atualizarEstadoVisualInputEspecialComJustificativa(input, botaoJustificativa);
    }
  }

  let valorLimpo = null;

  if (!valorCampoEstaVazioEspecial(valorDigitado)) {
    if (typeof limparValorParaSalvar === "function") {
      valorLimpo = limparValorParaSalvar(valorDigitado, tipo);
    } else {
      const numero = Number(valorDigitado.replace(",", "."));
      valorLimpo = isNaN(numero) ? null : numero;
    }

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

  if (
    valorComparacao === valorOriginal &&
    justificativaSelecionada === justificativaOriginal
  ) {
    console.log("ℹ️ Nenhuma alteração especial detectada, salvamento ignorado", {
      loja,
      semana,
      campo,
      valor: valorComparacao,
      justificativa: justificativaSelecionada,
    });

    if (valorLimpo !== null && typeof formatarValorParaInput === "function") {
      input.value = formatarValorParaInput(valorLimpo, tipo);
    }

    atualizarEstadoVisualInputEspecialComJustificativa(input, botaoJustificativa);
    return true;
  }

  if (valorLimpo === null && !justificativaSelecionada) {
    console.warn("⚠️ Campo especial sem valor e sem justificativa. Salvamento bloqueado.", {
      loja,
      semana,
      campo,
    });

    if (botaoJustificativa) {
      botaoJustificativa.classList.add("pendente");
      abrirPainelJustificativaEspecial(botaoJustificativa, null);
    }

    aplicarStatusInputEspecial(input, "erro");
    return false;
  }

  if (valorLimpo !== null && typeof formatarValorParaInput === "function") {
    input.value = formatarValorParaInput(valorLimpo, tipo);
  }

  console.log("⚡ AutoSave Especial completo", {
    loja,
    semana,
    campo,
    valor: valorLimpo,
    justificativa: justificativaSelecionada,
    tipo,
  });

  aplicarStatusInputEspecial(input, "salvando");

  const salvou = await salvarValorEspecial(
    loja,
    semana,
    campo,
    valorLimpo,
    justificativaSelecionada
  );

  if (salvou) {
    input.dataset.original = valorComparacao;
    input.dataset.originalJustificativa = justificativaSelecionada;

    if (botaoJustificativa) {
      botaoJustificativa.dataset.original = justificativaSelecionada;
      botaoJustificativa.dataset.justificativaAtual = justificativaSelecionada;
      botaoJustificativa.classList.remove("pendente");
      atualizarEstadoVisualBotaoEspecial(botaoJustificativa);
    }

    atualizarEstadoVisualInputEspecialComJustificativa(input, botaoJustificativa);
    atualizarVisibilidadeJustificativaEspecial(input, false);

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

  if (TABELA_ESPECIAL_STATE.clicandoBotao === true) {
    console.log("ℹ️ AutoSave especial ignorado temporariamente por clique no botão");
    return;
  }

  await processarAutoSalvarEspecialCampo(input);
}

// ==========================
// 💾 SALVAR VALOR ESPECIAL
// com justificativa por campo
// ==========================
async function salvarValorEspecial(loja, semana, campo, valor, justificativa = "") {
  const numero =
    valor === null || valor === undefined || valor === ""
      ? null
      : Number(valor);

  if (valor !== null && valor !== undefined && valor !== "" && isNaN(numero)) {
    console.warn("⚠️ salvarValorEspecial ignorado por número inválido:", valor);
    return false;
  }

  const justificativaFinal = normalizarTextoEspecial(justificativa || "") || null;

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

  const colunaJustificativa = getColunaJustificativaEspecial(campo);

  const chaveSalvar = getChaveRegistroEspecial(
    loja,
    semana,
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
    semana,
    campo,
    numero,
    colunaJustificativa,
    justificativa: justificativaFinal,
  });

  try {
    const { data: existentes, error: erroBusca } = await window.db
      .from("resultados")
      .select("*")
      .eq("loja", loja)
      .eq("semana", semana)
      .eq("indicador", indicadorBanco)
      .eq("classe", classe)
      .order("id", { ascending: true });

    if (erroBusca) throw erroBusca;

    const registros = existentes || [];

    if (registros.length > 1) {
      console.warn("⚠️ Registros especiais duplicados encontrados:", {
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
    updateData[colunaJustificativa] = numero !== null ? null : justificativaFinal;

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
        semana,
        campo,
        valor: numero,
        colunaJustificativa,
        justificativa: updateData[colunaJustificativa],
      });

      return true;
    }

    const payload = {
      loja,
      semana,
      indicador: indicadorBanco,
      classe,
      valor: campo === "valor" ? numero : null,
      valor2: campo === "valor2" ? numero : null,
    };

    payload[colunaJustificativa] = numero !== null ? null : justificativaFinal;

    const { data: inserido, error: erroInsert } = await window.db
      .from("resultados")
      .insert([payload])
      .select("id")
      .single();

    if (erroInsert) throw erroInsert;

    console.log("✅ Especial inserido com sucesso:", {
      id: inserido?.id,
      loja,
      semana,
      campo,
      valor: numero,
      colunaJustificativa,
      justificativa: payload[colunaJustificativa],
    });

    return true;
  } catch (erro) {
    console.error("❌ Erro salvarValorEspecial:", erro);
    return false;
  } finally {
    TABELA_ESPECIAL_STATE.salvando.delete(chaveSalvar);
  }
}