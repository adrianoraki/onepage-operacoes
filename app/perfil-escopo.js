console.log("✅ perfil-escopo.js carregado");

// ==========================
// 🧪 VALIDAÇÃO DE DEPENDÊNCIAS
// ==========================
(function validarDependenciasPerfilEscopo() {
  const obrigatorias = [
    "normalizarTexto",
    "normalizarTextoLower",
    "normalizarTextoSemAcento",
    "normalizarListaRegionais",
    "getPermissoesSistemaUsuario",
    "getUsuarioLogado",
  ];

  const faltando = obrigatorias.filter(
    (nome) => typeof window[nome] !== "function"
  );

  if (faltando.length) {
    console.error("❌ perfil-escopo.js sem dependências do core:", faltando);
  } else {
    console.log("✅ Dependências de perfil-escopo.js OK");
  }
})();

// ==========================
// 👁️ PERMISSÃO DE VISUALIZAÇÃO
// ==========================
function normalizarPermissaoVisualizacao(valor) {
  const texto = normalizarTextoSemAcento(valor || "").toUpperCase();

  if (!texto) return "TODOS";

  if (
    texto === "TODOS" ||
    texto === "TOTAL" ||
    texto === "GLOBAL" ||
    texto === "TUDO"
  ) {
    return "TODOS";
  }

  if (
    texto === "REGIONAL_CONFIGURADA" ||
    texto === "REGIONAL VINCULADA" ||
    texto === "REGIONAL_VINCULADA" ||
    texto === "APENAS REGIONAL" ||
    texto === "SOMENTE REGIONAL"
  ) {
    return "REGIONAL_CONFIGURADA";
  }

  // compatibilidade com registros antigos
  if (
    texto === "NE1 E NE2" ||
    texto === "NE1/NE2" ||
    texto === "NE1_NE2" ||
    texto === "NE1, NE2" ||
    texto === "NE1 E  NE2"
  ) {
    return "NE1_NE2";
  }

  if (texto === "NE1") return "NE1";
  if (texto === "NE2") return "NE2";

  console.warn(
    "⚠️ Permissão de visualização desconhecida. Assumindo TODOS:",
    valor
  );

  return "TODOS";
}

function getRegionaisDaPermissaoVisualizacao(valor, user = null) {
  const modo = normalizarPermissaoVisualizacao(valor);
  const usuario = user || getUsuarioLogado();

  if (modo === "NE1_NE2") return ["NE1", "NE2"];
  if (modo === "NE1") return ["NE1"];
  if (modo === "NE2") return ["NE2"];

  if (modo === "REGIONAL_CONFIGURADA") {
    const lista = [];

    if (usuario?.regional_vinculada) {
      lista.push(normalizarTexto(usuario.regional_vinculada));
    }

    if (Array.isArray(usuario?.regionais_vinculadas)) {
      usuario.regionais_vinculadas.forEach((r) => {
        const regionalNorm = normalizarTexto(r);
        if (regionalNorm) lista.push(regionalNorm);
      });
    }

    const resultado = [...new Set(lista)].filter(Boolean);

    console.log("🌍 Regionais da permissão REGIONAL_CONFIGURADA:", {
      usuario: usuario?.nome || usuario?.email || "(sem nome)",
      regionais: resultado,
    });

    return resultado;
  }

  return [];
}

function getRestricaoVisualizacaoUsuario(user = null) {
  const usuario = user || getUsuarioLogado();
  const permissoesSistema = getPermissoesSistemaUsuario(usuario);

  const modo = normalizarPermissaoVisualizacao(
    permissoesSistema.permissao_visualizacao
  );

  const regionais = getRegionaisDaPermissaoVisualizacao(modo, usuario);

  const resultado = {
    modo,
    regionais,
  };

  console.log("👁️ Restrição de visualização calculada:", {
    usuario: usuario?.nome || usuario?.email || "(sem nome)",
    resultado,
  });

  return resultado;
}

function regionalPermitidaPorVisualizacao(regionalLinha, user = null) {
  const restricao = getRestricaoVisualizacaoUsuario(user);
  const regionalNorm = normalizarTexto(regionalLinha);

  if (restricao.modo === "TODOS") return true;
  if (!restricao.regionais.length) return true;

  const permitido = restricao.regionais.includes(regionalNorm);

  console.log("🧭 regionalPermitidaPorVisualizacao:", {
    regionalLinha,
    regionalNorm,
    modo: restricao.modo,
    regionaisPermitidas: restricao.regionais,
    permitido,
  });

  return permitido;
}

// ==========================
// 🧠 CONTEXTO DE ESCOPO DO USUÁRIO
// ==========================
function getEscopoUsuarioSistema(user = null) {
  const usuario = user || getUsuarioLogado();
  const restricaoVisualizacao = getRestricaoVisualizacaoUsuario(usuario);

  if (!usuario) {
    const escopoSemUsuario = {
      tipo: "global",
      loja_vinculada: null,
      regional_vinculada: null,
      regionais_vinculadas: [],
      permissao_visualizacao: restricaoVisualizacao.modo,
      regionais_visuais: restricaoVisualizacao.regionais,
      ignorar_loja_vinculada: false,
    };

    console.warn("⚠️ getEscopoUsuarioSistema sem usuário. Retornando global.");
    return escopoSemUsuario;
  }

  const perfil = normalizarTextoLower(usuario.perfil);
  const listaRegionais = normalizarListaRegionais(usuario.regionais_vinculadas);
  const regionalPrincipal = normalizarTexto(usuario.regional_vinculada);

  const permissoes = usuario.permissoes || {};
  const ignorarLojaVinculada = permissoes.ignorar_loja_vinculada === true;

  // se ignorar loja estiver ligado, o sistema não usa loja como escopo principal
  const lojaEscopo = ignorarLojaVinculada
    ? null
    : usuario.loja_vinculada || usuario.loja_codigo || null;

  console.log("🧭 Avaliando escopo do usuário:", {
    usuario: usuario.nome || usuario.email || "(sem nome)",
    perfil,
    loja_codigo: usuario.loja_codigo,
    loja_vinculada: usuario.loja_vinculada,
    regional_vinculada: usuario.regional_vinculada,
    regionais_vinculadas: listaRegionais,
    ignorarLojaVinculada,
    lojaEscopo,
  });

  // master vê tudo
  if (perfil === "master") {
    const escopoMaster = {
      tipo: "global",
      loja_vinculada: null,
      regional_vinculada: null,
      regionais_vinculadas: [],
      permissao_visualizacao: restricaoVisualizacao.modo,
      regionais_visuais: restricaoVisualizacao.regionais,
      ignorar_loja_vinculada: ignorarLojaVinculada,
    };

    console.log("👑 Escopo do master:", escopoMaster);
    return escopoMaster;
  }

  const semLoja = !lojaEscopo;
  const semRegionais = !listaRegionais.length && !regionalPrincipal;

  // admin sem vínculo = global
  if (perfil === "admin" && semLoja && semRegionais) {
    const escopoAdminGlobal = {
      tipo: "global",
      loja_vinculada: null,
      regional_vinculada: null,
      regionais_vinculadas: [],
      permissao_visualizacao: restricaoVisualizacao.modo,
      regionais_visuais: restricaoVisualizacao.regionais,
      ignorar_loja_vinculada: ignorarLojaVinculada,
    };

    console.log("🛡️ Escopo admin sem vínculos:", escopoAdminGlobal);
    return escopoAdminGlobal;
  }

  // se ignorar loja está desligado e existe loja -> escopo de loja
  if (lojaEscopo) {
    const escopoLoja = {
      tipo: "loja",
      loja_vinculada: lojaEscopo,
      regional_vinculada: regionalPrincipal || null,
      regionais_vinculadas: listaRegionais,
      permissao_visualizacao: restricaoVisualizacao.modo,
      regionais_visuais: restricaoVisualizacao.regionais,
      ignorar_loja_vinculada: ignorarLojaVinculada,
    };

    console.log("🏬 Escopo por loja:", escopoLoja);
    return escopoLoja;
  }

  // se loja foi ignorada e houver regionais -> escopo regional
  if (listaRegionais.length || regionalPrincipal) {
    const listaFinal = [...listaRegionais];

    if (regionalPrincipal && !listaFinal.includes(regionalPrincipal)) {
      listaFinal.unshift(regionalPrincipal);
    }

    const escopoRegional = {
      tipo: "regional",
      loja_vinculada: null,
      regional_vinculada: regionalPrincipal || null,
      regionais_vinculadas: [...new Set(listaFinal)],
      permissao_visualizacao: restricaoVisualizacao.modo,
      regionais_visuais: restricaoVisualizacao.regionais,
      ignorar_loja_vinculada: ignorarLojaVinculada,
    };

    console.log("🌎 Escopo regional:", escopoRegional);
    return escopoRegional;
  }

  // fallback: se ignorar loja foi ligado e não há regionais, usa global controlado
  const escopoPadrao = {
    tipo: "global",
    loja_vinculada: null,
    regional_vinculada: regionalPrincipal || null,
    regionais_vinculadas: [],
    permissao_visualizacao: restricaoVisualizacao.modo,
    regionais_visuais: restricaoVisualizacao.regionais,
    ignorar_loja_vinculada: ignorarLojaVinculada,
  };

  console.log("ℹ️ Escopo padrão/global:", escopoPadrao);
  return escopoPadrao;
}

// ==========================
// 🏬 MATCH DE LOJA NO ESCOPO
// ==========================
function lojaDentroDoEscopoUsuario(codigo, nomeLoja, lojaVinculada) {
  if (!lojaVinculada) return true;

  const codigoNorm = normalizarTexto(codigo);
  const nomeNorm = normalizarTexto(nomeLoja);
  const chaveLoja = normalizarTexto(`${codigo} - ${nomeLoja}`);
  const vinculo = normalizarTexto(lojaVinculada);

  const permitido =
    vinculo === codigoNorm ||
    vinculo === chaveLoja ||
    (codigoNorm && vinculo.includes(codigoNorm)) ||
    (nomeNorm && vinculo.includes(nomeNorm));

  console.log("🏬 lojaDentroDoEscopoUsuario:", {
    codigo,
    nomeLoja,
    lojaVinculada,
    codigoNorm,
    nomeNorm,
    chaveLoja,
    vinculo,
    permitido,
  });

  return permitido;
}

// ==========================
// 🌍 MATCH DE REGIONAL NO ESCOPO
// ==========================
function regionalDentroDoEscopoUsuario(
  regionalLinha,
  regionalVinculada,
  regionaisVinculadas = []
) {
  const regionalNorm = normalizarTexto(regionalLinha);
  const lista = normalizarListaRegionais(regionaisVinculadas);

  if (lista.length) {
    const permitidoLista = lista.includes(regionalNorm);

    console.log("🌍 regionalDentroDoEscopoUsuario (lista):", {
      regionalLinha,
      regionalNorm,
      lista,
      permitido: permitidoLista,
    });

    return permitidoLista;
  }

  if (!regionalVinculada) {
    console.log("🌍 regionalDentroDoEscopoUsuario sem vínculo específico -> true");
    return true;
  }

  const permitido = regionalNorm === normalizarTexto(regionalVinculada);

  console.log("🌍 regionalDentroDoEscopoUsuario (principal):", {
    regionalLinha,
    regionalNorm,
    regionalVinculada,
    permitido,
  });

  return permitido;
}

// ==========================
// 🧾 EXTRAIR DADOS DA LINHA
// ==========================
function extrairDadosLinhaEscopo(row) {
  if (!row) {
    return {
      codigo: "",
      loja: "",
      regional: "",
    };
  }

  const codigoDataset =
    row.dataset?.lojaCodigo || row.dataset?.codigo || row.dataset?.loja || "";
  const lojaDataset =
    row.dataset?.lojaNome || row.dataset?.nomeLoja || row.dataset?.lojaTexto || "";
  const regionalDataset = row.dataset?.regional || "";

  const tds = row.querySelectorAll("td");

  const codigoTd = tds[0]?.textContent?.trim() || "";
  const lojaTd = tds[1]?.textContent?.trim() || "";
  const regionalTd = tds[2]?.textContent?.trim() || "";

  const resultado = {
    codigo: codigoDataset || codigoTd,
    loja: lojaDataset || lojaTd,
    regional: regionalDataset || regionalTd,
  };

  console.log("🧾 Dados extraídos da linha para escopo:", resultado);
  return resultado;
}

// ==========================
// 👁️ APLICAR ESCOPO VISUAL DA TABELA
// ==========================
function aplicarEscopoVisualTabela() {
  const user = getUsuarioLogado();

  if (!user) {
    console.warn("⚠️ aplicarEscopoVisualTabela sem usuário logado");
    return;
  }

  const escopo = getEscopoUsuarioSistema(user);

  const tabelasPossiveis = [
    "#tbody-tabela tr",
    "#tbody-especial tr",
    "#tbody-rh tr",
  ];

  let totalLinhas = 0;
  let totalOcultadas = 0;

  tabelasPossiveis.forEach((selector) => {
    const linhas = document.querySelectorAll(selector);

    if (!linhas.length) {
      console.log("ℹ️ Nenhuma linha encontrada para o seletor:", selector);
      return;
    }

    linhas.forEach((row) => {
      const { codigo, loja, regional } = extrairDadosLinhaEscopo(row);

      let visivel = true;

      if (escopo.tipo === "loja") {
        visivel = lojaDentroDoEscopoUsuario(
          codigo,
          loja,
          escopo.loja_vinculada
        );
      }

      if (escopo.tipo === "regional") {
        visivel = regionalDentroDoEscopoUsuario(
          regional,
          escopo.regional_vinculada,
          escopo.regionais_vinculadas
        );
      }

      // filtro adicional por permissao_visualizacao
      if (visivel && escopo.regionais_visuais?.length) {
        visivel = regionalDentroDoEscopoUsuario(
          regional,
          null,
          escopo.regionais_visuais
        );
      }

      row.dataset.escopoPermitido = visivel ? "true" : "false";
      row.style.display = visivel ? "" : "none";

      totalLinhas++;
      if (!visivel) totalOcultadas++;
    });
  });

  console.log("👁️ Escopo visual aplicado:", {
    usuario: user.nome || user.email || "(sem nome)",
    escopo,
    totalLinhas,
    totalOcultadas,
  });
}

// ==========================
// 🌐 EXPOR FUNÇÕES DE ESCOPO NO WINDOW
// ==========================
window.normalizarPermissaoVisualizacao = normalizarPermissaoVisualizacao;
window.getRegionaisDaPermissaoVisualizacao = getRegionaisDaPermissaoVisualizacao;
window.getRestricaoVisualizacaoUsuario = getRestricaoVisualizacaoUsuario;
window.regionalPermitidaPorVisualizacao = regionalPermitidaPorVisualizacao;
window.getEscopoUsuarioSistema = getEscopoUsuarioSistema;
window.lojaDentroDoEscopoUsuario = lojaDentroDoEscopoUsuario;
window.regionalDentroDoEscopoUsuario = regionalDentroDoEscopoUsuario;
window.extrairDadosLinhaEscopo = extrairDadosLinhaEscopo;
window.aplicarEscopoVisualTabela = aplicarEscopoVisualTabela;

// ==========================
// ✅ LOG FINAL DE BOOTSTRAP
// ==========================
console.log("✅ perfil-escopo.js pronto", {
  normalizarPermissaoVisualizacao: typeof window.normalizarPermissaoVisualizacao,
  getRegionaisDaPermissaoVisualizacao:
    typeof window.getRegionaisDaPermissaoVisualizacao,
  getRestricaoVisualizacaoUsuario:
    typeof window.getRestricaoVisualizacaoUsuario,
  regionalPermitidaPorVisualizacao:
    typeof window.regionalPermitidaPorVisualizacao,
  getEscopoUsuarioSistema: typeof window.getEscopoUsuarioSistema,
  lojaDentroDoEscopoUsuario: typeof window.lojaDentroDoEscopoUsuario,
  regionalDentroDoEscopoUsuario:
    typeof window.regionalDentroDoEscopoUsuario,
  extrairDadosLinhaEscopo: typeof window.extrairDadosLinhaEscopo,
  aplicarEscopoVisualTabela: typeof window.aplicarEscopoVisualTabela,
});