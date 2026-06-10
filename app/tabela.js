// ==========================
// 📊 CONFIG GLOBAL
// ==========================
const TABELA_LOG_PREFIX = "📋 Tabela";

function tabelaLogInfo(mensagem, payload = null) {
  if (payload !== null && payload !== undefined) {
    console.log(`${TABELA_LOG_PREFIX} | ${mensagem}`, payload);
  } else {
    console.log(`${TABELA_LOG_PREFIX} | ${mensagem}`);
  }
}

function tabelaLogWarn(mensagem, payload = null) {
  if (payload !== null && payload !== undefined) {
    console.warn(`${TABELA_LOG_PREFIX} | ${mensagem}`, payload);
  } else {
    console.warn(`${TABELA_LOG_PREFIX} | ${mensagem}`);
  }
}

function tabelaLogError(mensagem, payload = null) {
  if (payload !== null && payload !== undefined) {
    console.error(`${TABELA_LOG_PREFIX} | ${mensagem}`, payload);
  } else {
    console.error(`${TABELA_LOG_PREFIX} | ${mensagem}`);
  }
}

let indicadorSelecionado = null;

// ✅ garante a SEMANA ATUAL sempre que ela vira:
//   - mantém a semana salva só se ela for a semana atual
//   - se a semana mudou (virou), descarta a antiga e usa a atual
let semanaSelecionada = (function () {
  const atual = getSemanaAtual().toString().padStart(2, "0");
  const salva = localStorage.getItem("semana");
  if (salva === atual) return salva;
  localStorage.setItem("semana", atual);
  return atual;
})();

// estado dos filtros (persiste entre recargas silenciosas)
let _filtroRegionalTabela = "TODAS";
let _filtroTextoBuscaTabela = "";

const TABELA_STATE = {
  salvando: new Set(),
};

const TABELA_UI = {
  ocultarColunaRegional: true,
  estilosInjetados: false,
};

tabelaLogInfo("tabela.js carregado");
tabelaLogInfo("Semana inicial", { semanaSelecionada });

// ==========================
// 📂 MAPA DE CLASSES (compatibilidade)
// ==========================
const mapaClasse = {
  "RUPTURA FINAL": "Auditoria",
  ETIQUETA: "Auditoria",

  "SELF-CHECKOUT": "Frente de Caixa",
  DESCONTO: "Frente de Caixa",
  CANCELAMENTO: "Frente de Caixa",
  DEVOLUÇÃO: "Frente de Caixa",
  "FAIXA HORAS": "Frente de Caixa",

  PSV: "Operações",
  NPS: "Operações",
  "PART.TELEVENDAS": "Operações",

  QUEBRA: "Prevenção",
  "QUEBRA FLV": "Prevenção",
  "QUEBRA AÇOUGUE": "Prevenção",
  TROCA: "Prevenção",

  "BANCOS DE HORAS": "RH / Operacional",
  TURNOVER: "RH / Operacional",
};

// ==========================
// 📅 SEMANA ATUAL
// ==========================
function getSemanaAtual() {
  const hoje = new Date();
  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
  const dias = Math.floor((hoje - inicioAno) / (24 * 60 * 60 * 1000));
  const semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);

  return semana;
}

// ==========================
// 🔠 NORMALIZAR
// ==========================
function normalizarTextoTabela(valor) {
  return (valor || "").toString().trim();
}

function normalizarTextoTabelaUpper(valor) {
  return normalizarTextoTabela(valor).toUpperCase();
}

// ==========================
// 🧰 HELPERS SEGUROS
// ==========================
function escapeHtmlTabela(valor) {
  return (valor || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeCssSelectorTabela(valor) {
  const texto = (valor || "").toString();

  try {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(texto);
    }
  } catch (erro) {
    tabelaLogWarn("CSS.escape indisponível, usando fallback", erro);
  }

  return texto.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

// ==========================
// 🎨 HELPERS VISUAIS TABELA
// ==========================
function tipoEhMonetarioTabela(tipo) {
  const t = normalizarTextoTabelaUpper(tipo);
  return (
    t === "MOEDA" ||
    t === "R$" ||
    t === "CURRENCY" ||
    t === "MONETARIO" ||
    t === "MONETÁRIO" ||
    t === "VALOR"
  );
}

function tipoEhPercentualTabela(tipo) {
  const t = normalizarTextoTabelaUpper(tipo);
  return t === "PERCENTUAL" || t === "%" || t === "PORCENTAGEM";
}

function getClasseLarguraCampoTabela(tipo, usaJustificativa = false) {
  if (!usaJustificativa) {
    if (tipoEhMonetarioTabela(tipo)) return "tipo-moeda sem-justificativa";
    if (tipoEhPercentualTabela(tipo))
      return "tipo-percentual sem-justificativa";
    return "tipo-padrao sem-justificativa";
  }

  if (tipoEhMonetarioTabela(tipo)) return "tipo-moeda com-justificativa";
  if (tipoEhPercentualTabela(tipo)) return "tipo-percentual com-justificativa";
  return "tipo-padrao com-justificativa";
}

function garantirEstilosTabelaUI() {
  if (TABELA_UI.estilosInjetados) return;

  const styleId = "estilos-tabela-ajustes-dinamicos";
  if (document.getElementById(styleId)) {
    TABELA_UI.estilosInjetados = true;
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

    .campo-tabela-com-justificativa {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      box-sizing: border-box;
    }

    .campo-tabela-com-justificativa.com-justificativa.tipo-moeda {
      min-width: 190px;
    }

    .campo-tabela-com-justificativa.com-justificativa.tipo-percentual {
      min-width: 155px;
    }

    .campo-tabela-com-justificativa.com-justificativa.tipo-padrao {
      min-width: 138px;
    }

    .campo-tabela-com-justificativa.sem-justificativa.tipo-moeda {
      min-width: 235px;
    }

    .campo-tabela-com-justificativa.sem-justificativa.tipo-percentual {
      min-width: 180px;
    }

    .campo-tabela-com-justificativa.sem-justificativa.tipo-padrao {
      min-width: 165px;
    }

    .input-valor-tabela {
      width: 100%;
      min-width: 110px;
      max-width: none;
      box-sizing: border-box;
    }

    .campo-tabela-com-justificativa.com-justificativa.tipo-moeda .input-valor-tabela {
      min-width: 150px;
    }

    .campo-tabela-com-justificativa.sem-justificativa.tipo-moeda .input-valor-tabela {
      min-width: 200px;
    }

    .campo-tabela-com-justificativa.com-justificativa.tipo-percentual .input-valor-tabela {
      min-width: 125px;
    }

    .campo-tabela-com-justificativa.sem-justificativa.tipo-percentual .input-valor-tabela {
      min-width: 150px;
    }

    .campo-tabela-com-justificativa.sem-justificativa .input-valor-tabela {
      min-width: 145px;
    }

    .btn-justificativa-celula {
      flex: 0 0 auto;
    }

    .tabela-container {
      overflow-x: auto;
    }
  `;

  document.head.appendChild(style);
  TABELA_UI.estilosInjetados = true;

  tabelaLogInfo("Estilos dinâmicos da tabela injetados");
}

function ocultarColunaRegionalDasTabelasRenderizadas(container = null) {
  if (!TABELA_UI.ocultarColunaRegional) {
    tabelaLogInfo("Ocultação da coluna regional desativada");
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
      const dataColuna = normalizarTextoTabelaUpper(th.dataset.coluna || "");
      const texto = normalizarTextoTabelaUpper(th.textContent || "");

      if (dataColuna === "REGIONAL" || texto === "REGIONAL") {
        indiceRegional = idx;
        th.classList.add("col-regional-oculta");
        th.dataset.coluna = "regional";
      }
    });

    if (indiceRegional === -1) {
      tabelaLogInfo("Nenhuma coluna Regional detectada nesta tabela");
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

  tabelaLogInfo("Coluna Regional ocultada nas tabelas renderizadas", {
    totalTabelas,
    totalColunasOcultadas,
  });
}

function aplicarLayoutTabelaRenderizada(container = null) {
  garantirEstilosTabelaUI();
  ocultarColunaRegionalDasTabelasRenderizadas(container);

  tabelaLogInfo("Layout da tabela renderizada aplicado");
}

// ==========================
// 📝 JUSTIFICATIVAS SEM RESPOSTA
// ==========================
const JUSTIFICATIVAS_SEM_RESPOSTA = [
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

const JUSTIFICATIVA_UI_STATE = {
  botaoAtivo: null,
  clicandoBotao: false,
  timeoutClique: null,
};

// ==========================
// 🧠 REGRA DE JUSTIFICATIVA
// somente Auditoria / Ruptura Final / Etiqueta
// ==========================
function indicadorUsaJustificativaTabela(
  indicador = null,
  classeSelecionada = null
) {
  const indicadorNorm = normalizarTextoTabelaUpper(
    indicador || indicadorSelecionado || ""
  );

  const classeFinal = obterClasse(indicadorNorm, classeSelecionada);
  const classeNorm = normalizarTextoTabelaUpper(classeFinal);

  const permitido =
    classeNorm === "AUDITORIA" &&
    (indicadorNorm === "RUPTURA FINAL" || indicadorNorm === "ETIQUETA");

  tabelaLogInfo("Regra de justificativa avaliada", {
    indicadorNorm,
    classeSelecionada,
    classeFinal,
    permitido,
  });

  return permitido;
}

function prepararCliqueJustificativa(event = null) {
  tabelaLogInfo("prepararCliqueJustificativa");

  JUSTIFICATIVA_UI_STATE.clicandoBotao = true;

  if (JUSTIFICATIVA_UI_STATE.timeoutClique) {
    clearTimeout(JUSTIFICATIVA_UI_STATE.timeoutClique);
    JUSTIFICATIVA_UI_STATE.timeoutClique = null;
  }

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function finalizarCliqueJustificativa() {
  if (JUSTIFICATIVA_UI_STATE.timeoutClique) {
    clearTimeout(JUSTIFICATIVA_UI_STATE.timeoutClique);
    JUSTIFICATIVA_UI_STATE.timeoutClique = null;
  }

  JUSTIFICATIVA_UI_STATE.timeoutClique = setTimeout(() => {
    JUSTIFICATIVA_UI_STATE.clicandoBotao = false;
    JUSTIFICATIVA_UI_STATE.timeoutClique = null;
    tabelaLogInfo("Estado de clique na justificativa finalizado");
  }, 180);
}

function valorCampoEstaVazioTabela(valor) {
  return (valor || "").toString().trim() === "";
}

function getBotaoJustificativa(loja, semana) {
  const lojaEsc = escapeCssSelectorTabela(loja);
  const semanaEsc = escapeCssSelectorTabela(semana);

  const el = document.querySelector(
    `button[data-loja="${lojaEsc}"][data-semana="${semanaEsc}"][data-campo="justificativa"]`
  );

  return el || null;
}

function getInputValorTabela(loja, semana) {
  const lojaEsc = escapeCssSelectorTabela(loja);
  const semanaEsc = escapeCssSelectorTabela(semana);

  const el = document.querySelector(
    `input[data-loja="${lojaEsc}"][data-semana="${semanaEsc}"][data-campo="valor"]`
  );

  return el || null;
}

function getBotaoJustificativaDoInput(input) {
  if (!input) return null;
  return getBotaoJustificativa(input.dataset.loja, input.dataset.semana);
}

function getInputDoBotaoJustificativa(botao) {
  if (!botao) return null;
  return getInputValorTabela(botao.dataset.loja, botao.dataset.semana);
}

function atualizarEstadoVisualBotaoJustificativa(botao) {
  if (!botao) return;

  const justificativaAtual = normalizarTextoTabela(
    botao.dataset.justificativaAtual || ""
  );

  botao.classList.toggle("ativo", !!justificativaAtual);
  botao.title = justificativaAtual || "Selecionar justificativa";

  tabelaLogInfo("Estado visual do botão atualizado", {
    justificativaAtual,
    ativo: !!justificativaAtual,
  });
}

function atualizarEstadoVisualInputComJustificativa(input, botao = null) {
  if (!input) return;

  const botaoRef = botao || getBotaoJustificativaDoInput(input);

  if (!botaoRef) {
    input.classList.remove("input-com-justificativa");
    return;
  }

  const temValor = !valorCampoEstaVazioTabela(input.value);
  const justificativaAtual = normalizarTextoTabela(
    botaoRef.dataset.justificativaAtual || botaoRef.dataset.original || ""
  );

  const deveDestacar = !temValor && !!justificativaAtual;

  input.classList.toggle("input-com-justificativa", deveDestacar);

  tabelaLogInfo("Estado visual do input atualizado", {
    loja: input.dataset?.loja,
    semana: input.dataset?.semana,
    temValor,
    justificativaAtual,
    destacado: deveDestacar,
  });
}

function atualizarVisibilidadeJustificativa(input, limparSeTiverValor = true) {
  if (!input) return;

  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const usaJustificativa = indicadorUsaJustificativaTabela(
    indicadorSelecionado,
    classeSelecionada
  );

  const botao = getBotaoJustificativaDoInput(input);

  if (!usaJustificativa) {
    if (botao) {
      botao.classList.add("oculto");
      botao.disabled = true;
    }
    input.classList.remove("input-com-justificativa");

    tabelaLogInfo("Indicador sem justificativa. Botão não utilizado.");
    return;
  }

  if (!botao) return;

  const temValor = !valorCampoEstaVazioTabela(input.value);
  const bloqueado =
    input.disabled || input.readOnly || input.dataset.bloqueado === "true";

  if (temValor) {
    if (limparSeTiverValor) {
      botao.dataset.justificativaAtual = "";
      botao.dataset.original = "";
      atualizarEstadoVisualBotaoJustificativa(botao);
    }

    botao.classList.add("oculto");
    botao.disabled = true;
    botao.classList.remove("pendente");
    input.classList.remove("input-com-justificativa");

    tabelaLogInfo("Botão de justificativa ocultado porque existe valor", {
      loja: input.dataset.loja,
      semana: input.dataset.semana,
    });

    return;
  }

  botao.classList.remove("oculto");
  botao.disabled = bloqueado;
  botao.classList.toggle("bloqueado", bloqueado);
  atualizarEstadoVisualBotaoJustificativa(botao);
  atualizarEstadoVisualInputComJustificativa(input, botao);

  tabelaLogInfo("Botão de justificativa exibido", {
    loja: input.dataset.loja,
    semana: input.dataset.semana,
    bloqueado,
  });
}

function sincronizarJustificativasComPermissoesTabela() {
  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const usaJustificativa = indicadorUsaJustificativaTabela(
    indicadorSelecionado,
    classeSelecionada
  );

  tabelaLogInfo("Sincronizando justificativas com permissões da tabela...", {
    usaJustificativa,
  });

  const inputs = document.querySelectorAll(
    '#conteudo input[data-loja][data-semana][data-campo="valor"]'
  );

  inputs.forEach((input) => {
    const botao = getBotaoJustificativaDoInput(input);

    if (!usaJustificativa) {
      if (botao) {
        botao.disabled = true;
        botao.classList.add("oculto");
        botao.classList.remove("bloqueado", "pendente", "ativo");
      }
      input.classList.remove("input-com-justificativa");
      return;
    }

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
      atualizarVisibilidadeJustificativa(input, false);
    }
  });

  tabelaLogInfo("Sincronização de justificativas concluída");
}

function garantirPainelJustificativa() {
  let painel = document.getElementById("painel-justificativa-flutuante");

  if (painel) {
    tabelaLogInfo("Painel de justificativa já existente");
    return painel;
  }

  tabelaLogInfo("Criando painel de justificativa...");

  painel = document.createElement("div");
  painel.id = "painel-justificativa-flutuante";
  painel.className = "painel-justificativa-flutuante";

  painel.innerHTML = `
    <div class="painel-justificativa-box">
      <div class="painel-justificativa-header">
        <strong>Selecionar justificativa</strong>
        <button
          type="button"
          class="btn-fechar-painel-justificativa"
          id="btn-fechar-painel-justificativa"
        >
          ✕
        </button>
      </div>

      <div class="painel-justificativa-lista" id="painel-justificativa-lista"></div>
    </div>
  `;

  document.body.appendChild(painel);

  const lista = painel.querySelector("#painel-justificativa-lista");

  JUSTIFICATIVAS_SEM_RESPOSTA.forEach((motivo) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "item-justificativa-painel";
    btn.dataset.motivo = motivo;
    btn.textContent = motivo;

    btn.addEventListener("click", async () => {
      tabelaLogInfo("Justificativa clicada no painel", { motivo });
      await selecionarJustificativaPainel(motivo);
    });

    lista.appendChild(btn);
  });

  const btnFechar = painel.querySelector("#btn-fechar-painel-justificativa");
  if (btnFechar) {
    btnFechar.addEventListener("click", fecharPainelJustificativa);
  }

  document.addEventListener("click", (event) => {
    const painelAberto = document.getElementById(
      "painel-justificativa-flutuante"
    );

    if (!painelAberto || !painelAberto.classList.contains("ativo")) return;

    const clicouNoPainel = painelAberto.contains(event.target);
    const clicouNoBotaoJustificativa = event.target.closest(
      ".btn-justificativa-celula"
    );

    if (!clicouNoPainel && !clicouNoBotaoJustificativa) {
      tabelaLogInfo("Clique fora do painel detectado. Fechando...");
      fecharPainelJustificativa();
    }
  });

  window.addEventListener("resize", () => {
    if (JUSTIFICATIVA_UI_STATE.botaoAtivo) {
      posicionarPainelJustificativa(JUSTIFICATIVA_UI_STATE.botaoAtivo);
    }
  });

  window.addEventListener("scroll", () => {
    if (JUSTIFICATIVA_UI_STATE.botaoAtivo) {
      posicionarPainelJustificativa(JUSTIFICATIVA_UI_STATE.botaoAtivo);
    }
  });

  tabelaLogInfo("Painel de justificativa criado com sucesso");
  return painel;
}

function posicionarPainelJustificativa(botao) {
  const painel = garantirPainelJustificativa();
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

  tabelaLogInfo("Painel posicionado", { left, top });
}

function marcarJustificativaSelecionadaNoPainel(botao) {
  const painel = garantirPainelJustificativa();
  const atual = normalizarTextoTabela(botao?.dataset.justificativaAtual || "");

  painel.querySelectorAll(".item-justificativa-painel").forEach((item) => {
    const motivo = normalizarTextoTabela(item.dataset.motivo || "");
    item.classList.toggle("ativo", motivo === atual);
  });

  tabelaLogInfo("Justificativa marcada no painel", {
    atual: atual || "(nenhuma)",
  });
}

function abrirPainelJustificativa(botao, event = null) {
  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const usaJustificativa = indicadorUsaJustificativaTabela(
    indicadorSelecionado,
    classeSelecionada
  );

  if (!usaJustificativa) {
    tabelaLogInfo("Painel de justificativa ignorado para este indicador");
    return;
  }

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!botao || botao.disabled) {
    tabelaLogWarn("Botão de justificativa inválido ou desabilitado");
    finalizarCliqueJustificativa();
    return;
  }

  JUSTIFICATIVA_UI_STATE.botaoAtivo = botao;

  const painel = garantirPainelJustificativa();
  painel.classList.add("ativo");

  posicionarPainelJustificativa(botao);
  marcarJustificativaSelecionadaNoPainel(botao);

  tabelaLogInfo("Painel de justificativa aberto", {
    loja: botao.dataset.loja,
    semana: botao.dataset.semana,
    justificativaAtual: botao.dataset.justificativaAtual || "",
  });

  finalizarCliqueJustificativa();
}

function fecharPainelJustificativa() {
  const painel = document.getElementById("painel-justificativa-flutuante");
  if (painel) {
    painel.classList.remove("ativo");
  }

  tabelaLogInfo("Painel de justificativa fechado");

  JUSTIFICATIVA_UI_STATE.botaoAtivo = null;
  JUSTIFICATIVA_UI_STATE.clicandoBotao = false;

  if (JUSTIFICATIVA_UI_STATE.timeoutClique) {
    clearTimeout(JUSTIFICATIVA_UI_STATE.timeoutClique);
    JUSTIFICATIVA_UI_STATE.timeoutClique = null;
  }
}

async function selecionarJustificativaPainel(motivo) {
  const botao = JUSTIFICATIVA_UI_STATE.botaoAtivo;
  if (!botao) {
    tabelaLogWarn("Nenhum botão ativo para aplicar justificativa");
    return;
  }

  const input = getInputDoBotaoJustificativa(botao);
  if (!input) {
    tabelaLogWarn("Input relacionado ao botão não encontrado");
    return;
  }

  tabelaLogInfo("Selecionando justificativa do painel", {
    motivo,
    loja: botao.dataset.loja,
    semana: botao.dataset.semana,
  });

  botao.dataset.justificativaAtual = normalizarTextoTabela(motivo || "");
  botao.classList.remove("pendente", "oculto");

  atualizarEstadoVisualBotaoJustificativa(botao);
  atualizarEstadoVisualInputComJustificativa(input, botao);

  const salvou = await processarAutoSalvarCampoTabela(input, botao);

  if (salvou) {
    tabelaLogInfo("Justificativa salva com sucesso");
    fecharPainelJustificativa();
  } else {
    tabelaLogWarn("Falha ao salvar justificativa selecionada");
  }
}

// ==========================
// 🗝️ CHAVE DE REGISTRO
// ==========================
function getChaveRegistroTabela(loja, semana, indicadorBanco, classe) {
  return `${loja}__${semana}__${indicadorBanco}__${classe}`;
}

// ==========================
// 🖍️ STATUS VISUAL DO INPUT
// ==========================
function aplicarStatusInput(input, status) {
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

// ==========================
// 🗓️ GERAR SEMANAS
// ==========================
function gerarSemanas() {
  const atual = parseInt(semanaSelecionada || getSemanaAtual(), 10);

  const lista = [atual - 3, atual - 2, atual - 1, atual].map((s) =>
    s <= 0 ? 52 + s : s
  );

  const semanas = lista.map((s) => s.toString().padStart(2, "0"));

  tabelaLogInfo("Semanas exibidas", { semanas });

  return semanas;
}

// ==========================
// 📂 CLASSE PELO CONTEXTO
// ==========================
function obterClasse(indicador, classeSelecionada = null) {
  const indicadorNorm = normalizarTextoTabelaUpper(indicador);
  const classeMenu = normalizarTextoTabela(classeSelecionada);

  if (typeof getClasseIndicador === "function") {
    return getClasseIndicador(indicadorNorm, classeMenu);
  }

  if (indicadorNorm === "PSV" && classeMenu === "Prevenção") return "Prevenção";
  if (indicadorNorm === "PSV" && classeMenu === "Operações") return "Operações";

  if (mapaClasse[indicadorNorm]) return mapaClasse[indicadorNorm];

  return "Outros";
}

// ==========================
// 🗃️ INDICADOR DO BANCO
// ==========================
function obterIndicadorBanco(indicador, classeSelecionada = null) {
  const indicadorNorm = normalizarTextoTabelaUpper(indicador);
  const classeMenu = normalizarTextoTabela(classeSelecionada);

  if (typeof getIndicadorBanco === "function") {
    return getIndicadorBanco(indicadorNorm, classeMenu);
  }

  return indicadorNorm;
}

// ==========================
// 🏷️ TÍTULO DE EXIBIÇÃO
// ==========================
function getTituloIndicador(indicador, classeSelecionada = null) {
  const indicadorNorm = normalizarTextoTabelaUpper(indicador);
  const classeMenu = normalizarTextoTabela(classeSelecionada);

  if (typeof getNomeIndicador === "function") {
    return getNomeIndicador(indicadorNorm, classeMenu);
  }

  if (indicadorNorm === "PSV" && classeMenu === "Operações") {
    return "Visita Prospecção";
  }

  return indicadorNorm;
}

// ==========================
// 🔗 CLASSES COMPATÍVEIS (banco legado)
// ==========================
function getClassesConsulta(classeAtual) {
  return [
    classeAtual,
    classeAtual === "Operações" ? "Comercial" : null,
    classeAtual === "Prevenção" ? "Quebras" : null,
  ].filter(Boolean);
}

// ==========================
// 📊 CARREGAR TABELA
// ==========================
async function carregarTabela({ silencioso = false } = {}) {
  tabelaLogInfo("carregarTabela iniciado", { silencioso });

  try {
    if (!window.db) {
      tabelaLogError("window.db não inicializado");
      mostrarErro("Conexão com banco não iniciada");
      return;
    }

    semanaSelecionada =
      localStorage.getItem("semana") ||
      getSemanaAtual().toString().padStart(2, "0");

    tabelaLogInfo("Semana ativa", { semanaSelecionada });

    indicadorSelecionado = localStorage.getItem("indicador");

    if (!indicadorSelecionado) {
      tabelaLogWarn("Nenhum indicador selecionado");

      const conteudo = document.getElementById("conteudo");
      if (conteudo) {
        conteudo.innerHTML = `
          <h2>📥 Preenchimento</h2>
          <p>Selecione um indicador.</p>
        `;
      }
      return;
    }

    const indicadorNormalizado =
      normalizarTextoTabelaUpper(indicadorSelecionado);

    // ✅ NOVO INDICADOR SEPARADO: FAIXA HORAS
    // usa arquivo próprio, mantendo estrutura separada da auditoria
    if (indicadorNormalizado === "FAIXA HORAS") {
      tabelaLogInfo("Redirecionando para faixa-horas", {
        indicadorNormalizado,
        silencioso,
      });

      if (silencioso && typeof window.carregarFaixaHoras === "function") {
        return window.carregarFaixaHoras({ silencioso: true });
      }

      if (typeof window.telaFaixaHoras === "function") {
        return window.telaFaixaHoras();
      }

      tabelaLogError("telaFaixaHoras não encontrada");
      mostrarErro("Função telaFaixaHoras não encontrada.");
      return;
    }

    const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
    const usaJustificativa = indicadorUsaJustificativaTabela(
      indicadorSelecionado,
      classeSelecionada
    );

    const indicadorBanco = obterIndicadorBanco(
      indicadorNormalizado,
      classeSelecionada
    );
    const classeAtual = obterClasse(indicadorNormalizado, classeSelecionada);

    const isEspecial =
      typeof isIndicadorEspecial === "function"
        ? isIndicadorEspecial(indicadorNormalizado, classeSelecionada)
        : false;

    const isEspecialRH =
      typeof isIndicadorEspecialRH === "function"
        ? isIndicadorEspecialRH(indicadorNormalizado, classeSelecionada)
        : false;

    tabelaLogInfo("Contexto da tabela resolvido", {
      classeSelecionada,
      classeAtual,
      indicadorSelecionado,
      indicadorNormalizado,
      indicadorBanco,
      isEspecial,
      isEspecialRH,
      usaJustificativa,
    });

    const semanas = gerarSemanas();

    const [lojasResp, resultadosResp] = await Promise.all([
      window.db.from("lojas").select("*").order("codigo"),
      window.db
        .from("resultados")
        .select("*")
        .eq("indicador", indicadorBanco)
        .in("classe", getClassesConsulta(classeAtual))
        .in("semana", semanas),
    ]);

    if (lojasResp.error) throw lojasResp.error;
    if (resultadosResp.error) throw resultadosResp.error;

    const lojas = lojasResp.data || [];
    const resultados = resultadosResp.data || [];

    tabelaLogInfo("Dados carregados do banco", {
      totalLojas: lojas.length,
      totalResultados: resultados.length,
    });

    const mapa = {};
    resultados.forEach((r) => {
      mapa[`${r.loja}-${r.semana}`] = r;
    });

    const container = document.getElementById("conteudo");
    if (!container) {
      tabelaLogError("#conteudo não encontrado");
      return;
    }

    // modo silencioso: atualiza só o tbody, preserva filtros intactos
    const tbody = container.querySelector("#tbody-tabela");
    if (silencioso && tbody && !isEspecialRH && !isEspecial) {
      tbody.innerHTML = lojas.map(
        (loja) => montarLinha(loja, mapa, semanas, classeSelecionada)
      ).join("");

      if (typeof aplicarPermissoesTabela === "function") {
        aplicarPermissoesTabela(indicadorNormalizado, classeAtual);
      }
      if (typeof window.aplicarEscopoVisualTabela === "function") {
        window.aplicarEscopoVisualTabela();
      }
      reaplicarFiltrosTabela();
      tabelaLogInfo("Atualização silenciosa concluída (tbody-only)");
      return;
    }

    if (isEspecialRH) {
      tabelaLogInfo("Usando tabela RH");

      if (typeof montarTabelaRH === "function") {
        container.innerHTML = montarTabelaRH(lojas, mapa, semanas);
      } else {
        tabelaLogError("montarTabelaRH não encontrada");
        mostrarErro("Tabela RH não carregada");
        return;
      }
    } else if (isEspecial) {
      tabelaLogInfo("Usando tabela especial");

      if (typeof montarTabelaEspecial === "function") {
        container.innerHTML = montarTabelaEspecial(lojas, mapa, semanas);
      } else {
        tabelaLogError("montarTabelaEspecial não encontrada");
        mostrarErro("Tabela especial não carregada");
        return;
      }
    } else {
      container.innerHTML = montarHTMLTabela(
        lojas,
        mapa,
        semanas,
        classeSelecionada
      );
    }

    aplicarLayoutTabelaRenderizada(container);

    if (typeof aplicarPermissoesTabela === "function") {
      aplicarPermissoesTabela(indicadorNormalizado, classeAtual);
    }

    if (typeof window.aplicarEscopoVisualTabela === "function") {
      window.aplicarEscopoVisualTabela();
    }

    if (usaJustificativa) {
      garantirPainelJustificativa();
    } else {
      fecharPainelJustificativa();
    }

    sincronizarJustificativasComPermissoesTabela();
    ativarFiltros();

    tabelaLogInfo("Tabela renderizada com sucesso", {
      indicadorNormalizado,
      classeAtual,
      totalLojas: lojas.length,
      totalResultados: resultados.length,
      semanas,
    });
  } catch (erro) {
    tabelaLogError("Erro carregarTabela", erro);
    mostrarErro("Erro ao carregar tabela");
  }
}

// ==========================
// 🧱 HTML TABELA NORMAL
// ==========================
function montarHTMLTabela(lojas, mapa, semanas, classeSelecionada = null) {
  const titulo = getTituloIndicador(indicadorSelecionado, classeSelecionada);
  const semanaAtualReal = getSemanaAtual().toString().padStart(2, "0");

  let html = `
    <div class="card-conteudo">

      <div class="header-tabela">
        <h2>📊 ${titulo}</h2>

        <div class="filtro-periodo">
          <select class="filtro-mes" onchange="alterarMes(this.value)">
            ${gerarOptionsMesesTabela()}
          </select>
          <select class="filtro-semana${semanaSelecionada === semanaAtualReal ? " semana-atual-ativa" : ""}" onchange="alterarSemana(this.value)">
            ${gerarOptionsSemanas()}
          </select>
        </div>
      </div>

      <div class="info-semana">
        ${getInfoSemana(semanaSelecionada || semanaAtualReal)}
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
                TABELA_UI.ocultarColunaRegional ? "col-regional-oculta" : ""
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
    html += montarLinha(loja, mapa, semanas, classeSelecionada);
  });

  html += `
          </tbody>
        </table>
      </div>

    </div>
  `;

  tabelaLogInfo("HTML da tabela normal montado", {
    titulo,
    totalLojas: lojas.length,
    totalSemanas: semanas.length,
    ocultarColunaRegional: TABELA_UI.ocultarColunaRegional,
  });

  return html;
}

// ==========================
// 🧱 LINHAS DA TABELA NORMAL
// ==========================
function montarLinha(loja, mapa, semanas, classeSelecionada = null) {
  const chaveLoja = `${loja.codigo} - ${loja.nome}`;
  const semanaAtualReal = getSemanaAtual().toString().padStart(2, "0");

  const campoCfg =
    typeof getCampoConfig === "function"
      ? getCampoConfig(indicadorSelecionado, "valor", classeSelecionada)
      : { key: "valor", label: "Resultado", tipo: "numero" };

  const usaJustificativa = indicadorUsaJustificativaTabela(
    indicadorSelecionado,
    classeSelecionada
  );

  const classeLarguraCampo = getClasseLarguraCampoTabela(
    campoCfg.tipo,
    usaJustificativa
  );

  let html = `
    <tr
      data-loja-codigo="${escapeHtmlTabela(loja.codigo)}"
      data-loja-nome="${escapeHtmlTabela(loja.nome)}"
      data-regional="${escapeHtmlTabela(loja.regional || "-")}"
    >
      <td data-coluna="codigo">${loja.codigo}</td>
      <td data-coluna="loja">${loja.nome}</td>
      <td
        data-coluna="regional"
        class="${TABELA_UI.ocultarColunaRegional ? "col-regional-oculta" : ""}"
      >
        ${loja.regional || "-"}
      </td>
  `;

  semanas.forEach((semana) => {
    const reg = mapa[`${chaveLoja}-${semana}`];
    const valor = reg?.valor ?? "";
    const justificativa = reg?.justificativa ?? "";
    const destaque = semana === semanaAtualReal ? "coluna-atual" : "";

    const valorFormatado =
      typeof formatarValorParaInput === "function"
        ? formatarValorParaInput(valor, campoCfg.tipo)
        : valor;

    const valorOriginal =
      valor === null || valor === undefined || valor === ""
        ? ""
        : String(valor);

    const mostrarBotaoJustificativa =
      usaJustificativa &&
      (valor === null || valor === undefined || valor === "");

    html += `
      <td class="${destaque}">
        <div class="campo-tabela-com-justificativa ${classeLarguraCampo}">
          <input
            type="text"
            inputmode="decimal"
            value="${escapeHtmlTabela(valorFormatado)}"
            data-loja="${escapeHtmlTabela(chaveLoja)}"
            data-semana="${escapeHtmlTabela(semana)}"
            data-campo="valor"
            data-tipo="${escapeHtmlTabela(campoCfg.tipo)}"
            data-original="${escapeHtmlTabela(valorOriginal)}"
            data-original-justificativa="${escapeHtmlTabela(
              usaJustificativa ? justificativa : ""
            )}"
            onfocus="prepararInputFormatado(this)"
            oninput="atualizarVisibilidadeJustificativa(this)"
            onblur="autoSalvar(this)"
            class="input-valor-tabela"
            ${typeof window.attrsBloqueioEdicaoApp === "function" ? window.attrsBloqueioEdicaoApp(semana) : ""}
          >
          ${
            usaJustificativa
              ? `
                <button
                  type="button"
                  class="btn-justificativa-celula ${justificativa ? "ativo" : ""} ${
                    mostrarBotaoJustificativa ? "" : "oculto"
                  }"
                  data-loja="${escapeHtmlTabela(chaveLoja)}"
                  data-semana="${escapeHtmlTabela(semana)}"
                  data-campo="justificativa"
                  data-original="${escapeHtmlTabela(justificativa)}"
                  data-justificativa-atual="${escapeHtmlTabela(justificativa)}"
                  onmousedown="prepararCliqueJustificativa(event)"
                  onclick="abrirPainelJustificativa(this, event)"
                  title="${escapeHtmlTabela(
                    justificativa || "Selecionar justificativa"
                  )}"
                >
                  !
                </button>
              `
              : ""
          }
        </div>
      </td>
    `;
  });

  html += `</tr>`;

  return html;
}

// ==========================
// 🔄 ALTERAR SEMANA
// ==========================
function alterarSemana(sem) {
  if (sem === semanaSelecionada) {
    tabelaLogWarn("Semana já ativa, ignorando");
    return;
  }

  semanaSelecionada = sem;
  localStorage.setItem("semana", sem);
  _filtroTextoBuscaTabela = "";
  _filtroRegionalTabela = "TODAS";

  tabelaLogInfo("Semana alterada", { sem });

  carregarTabela();
}

// ==========================
// 🔎 FILTROS
// Busca por código ou loja + botão NE1/NE2
// ✅ independentes da coluna visual de Regional
// ==========================
function ativarFiltros() {
  tabelaLogInfo("Ativando filtros");

  const busca = document.getElementById("filtroBuscaLoja");
  const botoesRegional = document.querySelectorAll(".btn-filtro-regional");

  if (!busca || !botoesRegional.length) {
    tabelaLogWarn("Filtros padrão não disponíveis nessa tabela");
    return;
  }

  // restaura estado salvo
  busca.value = _filtroTextoBuscaTabela;
  botoesRegional.forEach((b) => {
    b.classList.toggle("ativo", b.dataset.regional === _filtroRegionalTabela);
  });

  const aplicar = () => {
    const termo = busca.value.toLowerCase().trim();
    _filtroTextoBuscaTabela = busca.value;

    document.querySelectorAll("#tbody-tabela tr").forEach((row) => {
      const tds = row.querySelectorAll("td");
      if (tds.length < 2) return;

      const dentroDoEscopo = row.dataset.escopoPermitido !== "false";

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
        _filtroRegionalTabela === "TODAS" ||
        regional === _filtroRegionalTabela.toLowerCase();

      row.style.display =
        dentroDoEscopo && matchBusca && matchRegional ? "" : "none";
    });
  };

  busca.addEventListener("input", aplicar);

  botoesRegional.forEach((btn) => {
    btn.addEventListener("click", () => {
      botoesRegional.forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      _filtroRegionalTabela = btn.dataset.regional || "TODAS";
      tabelaLogInfo("Filtro regional alterado", { _filtroRegionalTabela });
      aplicar();
    });
  });

  aplicar();

  tabelaLogInfo("Filtros ativados com sucesso");
}

function reaplicarFiltrosTabela() {
  document.querySelectorAll("#tbody-tabela tr").forEach((row) => {
    const tds = row.querySelectorAll("td");
    if (tds.length < 2) return;

    const dentroDoEscopo = row.dataset.escopoPermitido !== "false";
    const codigo = (row.dataset.lojaCodigo || tds[0]?.textContent || "").toLowerCase();
    const loja = (row.dataset.lojaNome || tds[1]?.textContent || "").toLowerCase();
    const regional = (row.dataset.regional || tds[2]?.textContent || "").toLowerCase();
    const termo = _filtroTextoBuscaTabela.toLowerCase().trim();

    const matchBusca = !termo || codigo.includes(termo) || loja.includes(termo);
    const matchRegional =
      _filtroRegionalTabela === "TODAS" ||
      regional === _filtroRegionalTabela.toLowerCase();

    row.style.display = dentroDoEscopo && matchBusca && matchRegional ? "" : "none";
  });
}

// ==========================
// 💾 PROCESSAR AUTO SAVE COMPLETO DO CAMPO
// valor + justificativa
// ==========================
async function processarAutoSalvarCampoTabela(input, botao = null) {
  if (!input) return false;

  const loja = input.dataset.loja;
  const semana = input.dataset.semana;
  const tipo = input.dataset.tipo || "numero";
  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const usaJustificativa = indicadorUsaJustificativaTabela(
    indicadorSelecionado,
    classeSelecionada
  );

  const botaoJustificativa = botao || getBotaoJustificativaDoInput(input);

  const valorDigitado = (input.value || "").toString().trim();
  let justificativaSelecionada = usaJustificativa
    ? normalizarTextoTabela(
        botaoJustificativa?.dataset.justificativaAtual || ""
      )
    : "";

  const valorOriginal = input.dataset.original ?? "";
  const justificativaOriginal = usaJustificativa
    ? input.dataset.originalJustificativa ?? ""
    : "";

  if (!valorCampoEstaVazioTabela(valorDigitado)) {
    justificativaSelecionada = "";

    if (botaoJustificativa) {
      botaoJustificativa.dataset.justificativaAtual = "";
      botaoJustificativa.dataset.original = "";
      botaoJustificativa.classList.add("oculto");
      botaoJustificativa.disabled = true;
      botaoJustificativa.classList.remove("ativo", "pendente");
      botaoJustificativa.title = "Selecionar justificativa";
    }

    input.classList.remove("input-com-justificativa");
  } else if (usaJustificativa) {
    if (botaoJustificativa) {
      botaoJustificativa.classList.remove("oculto");
      botaoJustificativa.disabled =
        input.disabled || input.readOnly || input.dataset.bloqueado === "true";

      atualizarEstadoVisualBotaoJustificativa(botaoJustificativa);
      atualizarEstadoVisualInputComJustificativa(input, botaoJustificativa);
    }
  }

  let valorLimpo = null;

  if (!valorCampoEstaVazioTabela(valorDigitado)) {
    valorLimpo =
      typeof limparValorParaSalvar === "function"
        ? limparValorParaSalvar(valorDigitado, tipo)
        : Number(valorDigitado.replace(",", "."));

    if (valorLimpo === null || Number.isNaN(valorLimpo)) {
      tabelaLogWarn("Valor inválido, salvamento ignorado", {
        loja,
        semana,
        valorDigitado,
        tipo,
      });

      aplicarStatusInput(input, "erro");
      return false;
    }
  }

  const valorComparacao =
    valorLimpo === null || valorLimpo === undefined ? "" : String(valorLimpo);

  if (
    valorComparacao === valorOriginal &&
    justificativaSelecionada === justificativaOriginal
  ) {
    tabelaLogInfo("Nenhuma alteração detectada, salvamento ignorado", {
      loja,
      semana,
      valor: valorComparacao,
      justificativa: justificativaSelecionada,
    });

    if (valorLimpo !== null && typeof formatarValorParaInput === "function") {
      input.value = formatarValorParaInput(valorLimpo, tipo);
    }

    atualizarEstadoVisualInputComJustificativa(input, botaoJustificativa);
    return true;
  }

  // ✅ exigência de justificativa só para Auditoria
  if (usaJustificativa && valorLimpo === null && !justificativaSelecionada) {
    tabelaLogWarn(
      "Campo sem valor e sem justificativa. Salvamento bloqueado.",
      {
        loja,
        semana,
      }
    );

    if (botaoJustificativa) {
      botaoJustificativa.classList.add("pendente");
      abrirPainelJustificativa(botaoJustificativa, null);
    }

    aplicarStatusInput(input, "erro");
    return false;
  }

  if (valorLimpo !== null && typeof formatarValorParaInput === "function") {
    input.value = formatarValorParaInput(valorLimpo, tipo);
  }

  tabelaLogInfo("AutoSave completo", {
    loja,
    semana,
    valor: valorLimpo,
    justificativa: justificativaSelecionada,
    tipo,
    usaJustificativa,
  });

  aplicarStatusInput(input, "salvando");

  const salvou = await salvarValor(
    loja,
    semana,
    valorLimpo,
    usaJustificativa ? justificativaSelecionada : ""
  );

  if (salvou) {
    input.dataset.original = valorComparacao;
    input.dataset.originalJustificativa = usaJustificativa
      ? justificativaSelecionada
      : "";

    if (botaoJustificativa) {
      botaoJustificativa.dataset.original = justificativaSelecionada;
      botaoJustificativa.dataset.justificativaAtual = justificativaSelecionada;
      botaoJustificativa.classList.remove("pendente");
      atualizarEstadoVisualBotaoJustificativa(botaoJustificativa);
    }

    atualizarEstadoVisualInputComJustificativa(input, botaoJustificativa);

    aplicarStatusInput(input, "sucesso");
    atualizarVisibilidadeJustificativa(input, false);
    return true;
  }

  aplicarStatusInput(input, "erro");
  return false;
}

// ==========================
// ⚡ AUTO SAVE
// ==========================
async function autoSalvar(input) {
  if (!input) return;

  if (JUSTIFICATIVA_UI_STATE.clicandoBotao === true) {
    tabelaLogInfo("AutoSave ignorado temporariamente por clique no botão");
    return;
  }

  await processarAutoSalvarCampoTabela(input);
}

// ==========================
// 💾 SALVAR
// ==========================
async function salvarValor(loja, semana, valor, justificativa = "") {
  const numero =
    valor === null || valor === undefined || valor === ""
      ? null
      : Number(valor);

  if (valor !== null && valor !== undefined && valor !== "" && isNaN(numero)) {
    tabelaLogWarn("salvarValor ignorado por número inválido", { valor });
    return false;
  }

  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const usaJustificativa = indicadorUsaJustificativaTabela(
    indicadorSelecionado,
    classeSelecionada
  );

  const justificativaFinal = usaJustificativa
    ? normalizarTextoTabela(justificativa || "") || null
    : null;

  const indicadorNormalizado = normalizarTextoTabelaUpper(indicadorSelecionado);
  const indicadorBanco = obterIndicadorBanco(
    indicadorNormalizado,
    classeSelecionada
  );
  const classe = obterClasse(indicadorNormalizado, classeSelecionada);

  const chaveSalvar = getChaveRegistroTabela(
    loja,
    semana,
    indicadorBanco,
    classe
  );

  if (TABELA_STATE.salvando.has(chaveSalvar)) {
    tabelaLogWarn(
      "Já existe um salvamento em andamento para este registro",
      {
        chaveSalvar,
      }
    );
    return false;
  }

  TABELA_STATE.salvando.add(chaveSalvar);

  tabelaLogInfo("SALVAR", {
    indicadorSelecionado,
    indicadorNormalizado,
    indicadorBanco,
    classe,
    loja,
    semana,
    numero,
    justificativa: justificativaFinal,
    usaJustificativa,
  });

  try {
    const { data: existentes, error: erroBusca } = await window.db
      .from("resultados")
      .select("id, valor, justificativa")
      .eq("loja", loja)
      .eq("semana", semana)
      .eq("indicador", indicadorBanco)
      .eq("classe", classe)
      .order("id", { ascending: true });

    if (erroBusca) throw erroBusca;

    const registros = existentes || [];

    if (registros.length > 1) {
      tabelaLogWarn("Registros duplicados encontrados para a mesma chave", {
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
      justificativa: numero !== null ? null : justificativaFinal,
    };

    if (registros.length >= 1) {
      const idAlvo = registros[0].id;

      const { error: erroUpdate } = await window.db
        .from("resultados")
        .update(payload)
        .eq("id", idAlvo);

      if (erroUpdate) throw erroUpdate;

      tabelaLogInfo("Registro atualizado com sucesso", {
        id: idAlvo,
        loja,
        semana,
        indicadorBanco,
        classe,
        valor: numero,
        justificativa: payload.justificativa,
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
          justificativa: numero !== null ? null : justificativaFinal,
        },
      ])
      .select("id")
      .single();

    if (erroInsert) throw erroInsert;

    tabelaLogInfo("Registro inserido com sucesso", {
      id: inserido?.id,
      loja,
      semana,
      indicadorBanco,
      classe,
      valor: numero,
      justificativa: numero !== null ? null : justificativaFinal,
    });

    return true;
  } catch (erro) {
    tabelaLogError("Erro salvarValor", erro);
    return false;
  } finally {
    TABELA_STATE.salvando.delete(chaveSalvar);
  }
}

// ==========================
// 🔢 GERAR OPTIONS SEMANA
// ==========================
function gerarOptionsSemanas() {
  const selecionada =
    semanaSelecionada || getSemanaAtual().toString().padStart(2, "0");
  const real = getSemanaAtual().toString().padStart(2, "0");

  // novo filtro: só as semanas do mês selecionado
  if (window.FiltroPeriodo) {
    return window.FiltroPeriodo.gerarOptionsSemanas(selecionada, real);
  }

  // fallback antigo (1-53)
  let html = "";
  for (let i = 1; i <= 53; i++) {
    const s = i.toString().padStart(2, "0");
    const selected = s === selecionada ? "selected" : "";
    const label = s === real ? `Semana ${s} ★` : `Semana ${s}`;
    html += `<option value="${s}" ${selected}>${label}</option>`;
  }
  return html;
}

function gerarOptionsMesesTabela() {
  if (!window.FiltroPeriodo) return "";
  // garante que o mês mostrado contenha a semana selecionada
  const sel = semanaSelecionada || getSemanaAtual().toString().padStart(2, "0");
  const semanasMes = window.FiltroPeriodo.getSemanasDoMes(
    window.FiltroPeriodo.mes,
    window.FiltroPeriodo.ano(),
  );
  if (!semanasMes.includes(sel)) {
    window.FiltroPeriodo.sincronizarComSemana(sel);
  }
  return window.FiltroPeriodo.gerarOptionsMeses();
}

function alterarMes(mes) {
  if (!window.FiltroPeriodo) return;
  window.FiltroPeriodo.setMes(mes);

  // escolhe a semana do novo mês: a atual (se estiver no mês) ou a primeira
  const real = getSemanaAtual().toString().padStart(2, "0");
  const semanas = window.FiltroPeriodo.getSemanasDoMes(
    window.FiltroPeriodo.mes,
    window.FiltroPeriodo.ano(),
  );
  semanaSelecionada = semanas.includes(real)
    ? real
    : semanas[0] || semanaSelecionada;
  localStorage.setItem("semana", semanaSelecionada);

  carregarTabela();
}

// ==========================
// 📅 DATAS DA SEMANA (ISO 8601)
// ==========================
function getDatasSemanaPorNumero(semNumero, ano) {
  const semInt = parseInt(semNumero, 10);
  const anoInt = ano || new Date().getFullYear();
  const jan4 = new Date(Date.UTC(anoInt, 0, 4));
  const dow = jan4.getUTCDay() || 7;
  const monday1 = new Date(jan4);
  monday1.setUTCDate(jan4.getUTCDate() - (dow - 1));
  const monday = new Date(monday1);
  monday.setUTCDate(monday1.getUTCDate() + (semInt - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { monday, sunday };
}

function formatarDataPtBr(date) {
  const dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${dias[date.getUTCDay()]} ${date.getUTCDate()} de ${meses[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}

function getInfoSemana(semNumero) {
  const { monday, sunday } = getDatasSemanaPorNumero(semNumero);
  return `Semana ${semNumero} — de ${formatarDataPtBr(monday)} a ${formatarDataPtBr(sunday)}`;
}

// ==========================
// 🌐 EXPOR FUNÇÕES GLOBAIS
// ==========================
window.getSemanaAtual = getSemanaAtual;
window.getDatasSemanaPorNumero = getDatasSemanaPorNumero;
window.formatarDataPtBr = formatarDataPtBr;
window.getInfoSemana = getInfoSemana;
window.normalizarTextoTabela = normalizarTextoTabela;
window.normalizarTextoTabelaUpper = normalizarTextoTabelaUpper;
window.escapeHtmlTabela = escapeHtmlTabela;
window.escapeCssSelectorTabela = escapeCssSelectorTabela;

window.tipoEhMonetarioTabela = tipoEhMonetarioTabela;
window.tipoEhPercentualTabela = tipoEhPercentualTabela;
window.getClasseLarguraCampoTabela = getClasseLarguraCampoTabela;
window.garantirEstilosTabelaUI = garantirEstilosTabelaUI;
window.ocultarColunaRegionalDasTabelasRenderizadas =
  ocultarColunaRegionalDasTabelasRenderizadas;
window.aplicarLayoutTabelaRenderizada = aplicarLayoutTabelaRenderizada;

window.indicadorUsaJustificativaTabela = indicadorUsaJustificativaTabela;
window.prepararCliqueJustificativa = prepararCliqueJustificativa;
window.finalizarCliqueJustificativa = finalizarCliqueJustificativa;
window.valorCampoEstaVazioTabela = valorCampoEstaVazioTabela;
window.getBotaoJustificativa = getBotaoJustificativa;
window.getInputValorTabela = getInputValorTabela;
window.getBotaoJustificativaDoInput = getBotaoJustificativaDoInput;
window.getInputDoBotaoJustificativa = getInputDoBotaoJustificativa;
window.atualizarEstadoVisualBotaoJustificativa =
  atualizarEstadoVisualBotaoJustificativa;
window.atualizarEstadoVisualInputComJustificativa =
  atualizarEstadoVisualInputComJustificativa;
window.atualizarVisibilidadeJustificativa = atualizarVisibilidadeJustificativa;
window.sincronizarJustificativasComPermissoesTabela =
  sincronizarJustificativasComPermissoesTabela;
window.garantirPainelJustificativa = garantirPainelJustificativa;
window.posicionarPainelJustificativa = posicionarPainelJustificativa;
window.marcarJustificativaSelecionadaNoPainel =
  marcarJustificativaSelecionadaNoPainel;
window.abrirPainelJustificativa = abrirPainelJustificativa;
window.fecharPainelJustificativa = fecharPainelJustificativa;
window.selecionarJustificativaPainel = selecionarJustificativaPainel;

window.getChaveRegistroTabela = getChaveRegistroTabela;
window.aplicarStatusInput = aplicarStatusInput;
window.gerarSemanas = gerarSemanas;
window.obterClasse = obterClasse;
window.obterIndicadorBanco = obterIndicadorBanco;
window.getTituloIndicador = getTituloIndicador;
window.getClassesConsulta = getClassesConsulta;

window.carregarTabela = carregarTabela;
window.montarHTMLTabela = montarHTMLTabela;
window.montarLinha = montarLinha;
window.alterarSemana = alterarSemana;
window.alterarMes = alterarMes;
window.gerarOptionsMesesTabela = gerarOptionsMesesTabela;
window.ativarFiltros = ativarFiltros;
window.processarAutoSalvarCampoTabela = processarAutoSalvarCampoTabela;
window.autoSalvar = autoSalvar;
window.salvarValor = salvarValor;
window.gerarOptionsSemanas = gerarOptionsSemanas;

// ==========================
// ✅ LOG FINAL
// ==========================
tabelaLogInfo("tabela.js pronto", {
  getSemanaAtual: typeof window.getSemanaAtual,
  obterClasse: typeof window.obterClasse,
  obterIndicadorBanco: typeof window.obterIndicadorBanco,
  carregarTabela: typeof window.carregarTabela,
  autoSalvar: typeof window.autoSalvar,
  salvarValor: typeof window.salvarValor,
  indicadorUsaJustificativaTabela:
    typeof window.indicadorUsaJustificativaTabela,
  gerarOptionsSemanas: typeof window.gerarOptionsSemanas,
});