console.log("✅ dashboard-helpers.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.helpers = DashboardBI.helpers || {};

(function inicializarDashboardHelpers() {
  const LOG_PREFIX = "📊 DashboardHelpers";

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

  function numeroSeguroInterno(valor, fallback = 0) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : fallback;
  }

  function stringVazia(valor) {
    return (valor || "").toString().trim() === "";
  }

  function getStateSeguro() {
    return DashboardBI.STATE || {};
  }

  function getIndicadorAtualSeguro() {
    return getStateSeguro()?.indicador || "";
  }

  function getClasseAtualSeguro() {
    return getStateSeguro()?.classe || "";
  }

  function getClasseSelecionadaReal(overrideClasse = null) {
    const state = getStateSeguro();
    const classeBruta =
      overrideClasse !== null && overrideClasse !== undefined
        ? overrideClasse
        : state?.classe || "";

    if (classeBruta === "TODAS") return null;
    return classeBruta || null;
  }

  // ==========================
  // 🔠 TEXTO
  // ==========================
  DashboardBI.helpers.normalizarTexto = function (valor) {
    return (valor || "").toString().trim();
  };

  DashboardBI.helpers.normalizarTextoUpper = function (valor) {
    return DashboardBI.helpers.normalizarTexto(valor).toUpperCase();
  };

  DashboardBI.helpers.normalizarTextoLower = function (valor) {
    return DashboardBI.helpers.normalizarTexto(valor).toLowerCase();
  };

  // ==========================
  // 🔢 NÚMEROS / MÉDIA
  // ==========================
  DashboardBI.helpers.formatarNumero = function (valor, casas = 2) {
    const numero = Number(valor);
    if (!isFinite(numero)) return "-";

    if (Number.isInteger(numero)) {
      return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }

    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: casas,
      maximumFractionDigits: casas,
    });
  };

  DashboardBI.helpers.formatarInteiro = function (valor) {
    const numero = Number(valor);
    if (!isFinite(numero)) return "-";

    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  DashboardBI.helpers.formatarMoeda = function (valor) {
    const numero = Number(valor);
    if (!isFinite(numero)) return "-";

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  DashboardBI.helpers.formatarPercentual = function (valor, casas = 2) {
    const numero = Number(valor);
    if (!isFinite(numero)) return "-";

    return (
      numero.toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
      }) + "%"
    );
  };

  DashboardBI.helpers.calcularMedia = function (lista = []) {
    const numeros = (lista || [])
      .map((v) => Number(v))
      .filter((v) => !isNaN(v));

    if (!numeros.length) return 0;

    return numeros.reduce((a, b) => a + b, 0) / numeros.length;
  };

  DashboardBI.helpers.getChaveLoja = function (loja) {
    return `${loja.codigo} - ${loja.nome}`;
  };

  DashboardBI.helpers.quebrarNomeLoja = function (loja) {
    const texto = DashboardBI.helpers.normalizarTexto(loja);

    if (!texto.includes("-")) {
      return {
        codigo: "",
        nome: texto || "-",
      };
    }

    const partes = texto.split("-");
    const codigo = DashboardBI.helpers.normalizarTexto(partes.shift());
    const nome = DashboardBI.helpers.normalizarTexto(partes.join("-"));

    return {
      codigo,
      nome: nome || texto,
    };
  };

  // ==========================
  // 📆 SEMANAS
  // ==========================
  DashboardBI.helpers.gerarJanelaSemanas = function (semanaBase) {
    const atual = parseInt(
      semanaBase ||
        (typeof getSemanaAtual === "function"
          ? getSemanaAtual()
          : DashboardBI.STATE?.semana || "01"),
      10
    );

    const lista = [atual - 3, atual - 2, atual - 1, atual].map((s) =>
      s <= 0 ? 52 + s : s
    );

    return lista.map((s) => String(s).padStart(2, "0"));
  };

  DashboardBI.helpers.getNumeroSemanaPorData = function (data) {
    const hoje = new Date(data);
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    const dias = Math.floor((hoje - inicioAno) / (24 * 60 * 60 * 1000));
    return Math.ceil((dias + inicioAno.getDay() + 1) / 7);
  };

  DashboardBI.helpers.getSemanasMesVigente = function () {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    const semanasSet = new Set();

    for (
      let d = new Date(primeiroDia);
      d <= ultimoDia;
      d.setDate(d.getDate() + 1)
    ) {
      semanasSet.add(
        DashboardBI.helpers
          .getNumeroSemanaPorData(d)
          .toString()
          .padStart(2, "0")
      );
    }

    return [...semanasSet];
  };

  DashboardBI.helpers.getPrimeiraEUltimaSemanaMesVigente = function () {
    const semanas = DashboardBI.helpers.getSemanasMesVigente();

    return {
      primeira: semanas[0] || null,
      ultima: semanas[semanas.length - 1] || null,
      lista: semanas,
      descricao: "mês vigente",
    };
  };

  // ==========================
  // 🎯 TIPOS / CLASSE / REGRA
  // ==========================
  DashboardBI.helpers.tipoPercentual = function (tipo) {
    const tipoNorm = DashboardBI.helpers.normalizarTextoLower(tipo);
    return (
      tipoNorm.includes("percent") ||
      tipoNorm.includes("porcent") ||
      tipoNorm === "%"
    );
  };

  DashboardBI.helpers.tipoMoeda = function (tipo) {
    const tipoNorm = DashboardBI.helpers.normalizarTextoLower(tipo);
    return (
      tipoNorm === "moeda" ||
      tipoNorm === "r$" ||
      tipoNorm === "currency" ||
      tipoNorm === "monetario" ||
      tipoNorm === "monetário" ||
      tipoNorm === "valor"
    );
  };

  DashboardBI.helpers.tipoInteiro = function (tipo) {
    const tipoNorm = DashboardBI.helpers.normalizarTextoLower(tipo);
    return (
      tipoNorm === "inteiro" ||
      tipoNorm === "numero-inteiro" ||
      tipoNorm === "int"
    );
  };

  DashboardBI.helpers.indicadorAtualNormalizado = function () {
    return DashboardBI.helpers.normalizarTextoUpper(getIndicadorAtualSeguro());
  };

  DashboardBI.helpers.classeAtualNormalizada = function () {
    return DashboardBI.helpers.normalizarTextoUpper(getClasseAtualSeguro());
  };

  DashboardBI.helpers.getClasseRealDoIndicador = function (
    indicador,
    classeSelecionada = null
  ) {
    try {
      if (typeof getClasseIndicador === "function") {
        return getClasseIndicador(indicador, classeSelecionada);
      }
    } catch (erro) {
      logWarn("Falha ao obter classe real do indicador", {
        indicador,
        classeSelecionada,
        erro,
      });
    }

    return classeSelecionada || "Outros";
  };

  // ==========================
  // 📊 REGRAS PERCENTUAIS / FAIXA / MÉDIA
  // ==========================
  DashboardBI.helpers.rankingEhAuditoria = function (
    indicador = null,
    classe = null,
    tipo = null
  ) {
    const indicadorFinal = DashboardBI.helpers.normalizarTextoUpper(
      indicador || getIndicadorAtualSeguro()
    );

    const classeSelecionadaBruta =
      classe !== null && classe !== undefined
        ? classe
        : DashboardBI.STATE?.classe || "";

    const classeSelecionadaNorm = DashboardBI.helpers.normalizarTextoUpper(
      classeSelecionadaBruta
    );

    const tipoNorm = DashboardBI.helpers.normalizarTextoLower(tipo || "");

    // ✅ classe Auditoria
    if (classeSelecionadaNorm === "AUDITORIA") {
      logInfo("Regra percentual/faixa ativada pela classe selecionada", {
        indicadorFinal,
        classeSelecionadaBruta,
        tipoNorm,
        ativo: true,
      });
      return true;
    }

    // ✅ indicadores com faixa percentual obrigatória
    if (indicadorFinal === "RUPTURA FINAL" || indicadorFinal === "ETIQUETA") {
      logInfo("Regra percentual/faixa ativada pelo indicador", {
        indicadorFinal,
        classeSelecionadaBruta,
        tipoNorm,
        ativo: true,
      });
      return true;
    }

    // ✅ fallback por tipo percentual
    if (DashboardBI.helpers.tipoPercentual(tipoNorm)) {
      logInfo("Regra percentual/faixa ativada pelo tipo percentual", {
        indicadorFinal,
        classeSelecionadaBruta,
        tipoNorm,
        ativo: true,
      });
      return true;
    }

    logInfo("Regra percentual/faixa não ativada", {
      indicadorFinal,
      classeSelecionadaBruta,
      tipoNorm,
      ativo: false,
    });

    return false;
  };

  DashboardBI.helpers.rankingUsaMediaPercentual = function (
    indicador = null,
    classe = null,
    tipo = null
  ) {
    const usa = DashboardBI.helpers.rankingEhAuditoria(indicador, classe, tipo);

    logInfo("Ranking usa média percentual", {
      indicador: indicador || getIndicadorAtualSeguro(),
      classe: classe || getClasseAtualSeguro(),
      tipo,
      usa,
    });

    return usa;
  };

  DashboardBI.helpers.rankingUsaSoma = function (tipo) {
    const usa =
      DashboardBI.helpers.tipoMoeda(tipo) ||
      DashboardBI.helpers.tipoInteiro(tipo);

    logInfo("Ranking usa soma", {
      tipo,
      usa,
    });

    return usa;
  };

  DashboardBI.helpers.rankingEhBancoHoras = function (indicador = null) {
    const indicadorNorm = DashboardBI.helpers.normalizarTextoUpper(
      indicador || getIndicadorAtualSeguro()
    );

    const ehBancoHoras =
      indicadorNorm === "BANCOS DE HORAS" ||
      indicadorNorm === "BANCO DE HORAS" ||
      indicadorNorm === "RH / OPERACIONAL";

    return ehBancoHoras;
  };

  DashboardBI.helpers.getCampoMediaPorChave = function (campo = "valor") {
    return campo === "valor2" ? "mediaValor2" : "mediaValor";
  };

  // ==========================
  // 🏷️ CAMPO / TIPO
  // ==========================
  DashboardBI.helpers.getCampo = function (
    indicador,
    campoKey = "valor",
    classeSelecionada = null
  ) {
    const indicadorNorm = DashboardBI.helpers.normalizarTextoUpper(indicador);
    const campoNorm = DashboardBI.helpers.normalizarTextoLower(campoKey);

    // ✅ Regras fixas de SELF-CHECKOUT
    if (indicadorNorm === "SELF-CHECKOUT") {
      if (campoNorm === "valor") {
        const cfg = {
          key: "valor",
          label: "Participação de Vendas",
          tipo: "moeda",
        };

        logInfo("Campo forçado para SELF-CHECKOUT valor", cfg);
        return cfg;
      }

      if (campoNorm === "valor2") {
        const cfg = {
          key: "valor2",
          label: "Qtd Passantes",
          tipo: "inteiro",
        };

        logInfo("Campo forçado para SELF-CHECKOUT valor2", cfg);
        return cfg;
      }
    }

    try {
      if (typeof getCampoConfig === "function") {
        const cfg = getCampoConfig(indicador, campoKey, classeSelecionada);

        if (cfg && typeof cfg === "object") {
          const normalizado = {
            key: cfg.key || campoKey,
            label:
              cfg.label ||
              (campoKey === "valor2" ? "Valor 2" : "Resultado"),
            tipo: cfg.tipo || "numero",
          };

          logInfo("Campo obtido via getCampoConfig", {
            indicador,
            campoKey,
            classeSelecionada,
            normalizado,
          });

          return normalizado;
        }
      }
    } catch (erro) {
      logWarn("Falha ao obter campo via getCampoConfig", {
        indicador,
        campoKey,
        classeSelecionada,
        erro,
      });
    }

    const fallback = {
      key: campoKey,
      label: campoKey === "valor2" ? "Valor 2" : "Resultado",
      tipo: "numero",
    };

    logInfo("Campo fallback utilizado", {
      indicador,
      campoKey,
      classeSelecionada,
      fallback,
    });

    return fallback;
  };

  DashboardBI.helpers.getTipoCampo = function (
    indicador,
    campoKey = "valor",
    classeSelecionada = null
  ) {
    const campo = DashboardBI.helpers.getCampo(
      indicador,
      campoKey,
      classeSelecionada
    );

    const tipoFinal = campo?.tipo || "numero";

    logInfo("Tipo de campo resolvido", {
      indicador,
      campoKey,
      classeSelecionada,
      tipoFinal,
    });

    return tipoFinal;
  };

  DashboardBI.helpers.getNomeIndicador = function (
    indicador,
    classeSelecionada = null
  ) {
    if (typeof getNomeIndicador === "function") {
      return getNomeIndicador(indicador, classeSelecionada);
    }

    return indicador;
  };

  DashboardBI.helpers.getIndicadorBanco = function (
    indicador,
    classeSelecionada = null
  ) {
    if (typeof getIndicadorBanco === "function") {
      return getIndicadorBanco(indicador, classeSelecionada);
    }

    return DashboardBI.helpers.normalizarTextoUpper(indicador);
  };

  DashboardBI.helpers.getClasseIndicador = function (
    indicador,
    classeSelecionada = null
  ) {
    if (typeof getClasseIndicador === "function") {
      return getClasseIndicador(indicador, classeSelecionada);
    }

    return classeSelecionada || "Outros";
  };

  DashboardBI.helpers.getOrdemRanking = function (
    indicador,
    classeSelecionada = null
  ) {
    try {
      if (typeof getIndicadorConfig === "function") {
        const cfg = getIndicadorConfig(indicador, classeSelecionada);
        if (cfg?.ordemRanking === "asc") return "asc";
        if (cfg?.ordemRanking === "desc") return "desc";
      }
    } catch (erro) {
      logWarn("Não foi possível avaliar ordem do ranking", {
        indicador,
        classeSelecionada,
        erro,
      });
    }

    return "desc";
  };

  DashboardBI.helpers.getOrdemEspecialDashboard = function ({
    indicador = "",
    classe = "",
    campo = "mediaValor",
    tipo = "numero",
  } = {}) {
    const indicadorNorm = DashboardBI.helpers.normalizarTextoUpper(indicador);
    const classeSelecionada = getClasseSelecionadaReal(classe);
    const ehAuditoriaOuPercentual = DashboardBI.helpers.rankingEhAuditoria(
      indicadorNorm,
      classeSelecionada,
      tipo
    );

    // ✅ percentual / auditoria / ruptura final / etiqueta => menor para maior
    if (ehAuditoriaOuPercentual) {
      logInfo("Regra de ordem especial aplicada: percentual ascendente", {
        indicadorNorm,
        classeSelecionada,
        campo,
        tipo,
      });
      return "asc";
    }

    // ✅ BANCO DE HORAS -
    if (
      DashboardBI.helpers.rankingEhBancoHoras(indicadorNorm) &&
      campo === "mediaValor2"
    ) {
      logInfo("Regra de ordem especial aplicada: Banco de Horas - ascendente", {
        indicadorNorm,
        campo,
        tipo,
      });
      return "asc";
    }

    // ✅ BANCO DE HORAS +
    if (
      DashboardBI.helpers.rankingEhBancoHoras(indicadorNorm) &&
      campo === "mediaValor"
    ) {
      logInfo("Regra de ordem especial aplicada: Banco de Horas + descendente", {
        indicadorNorm,
        campo,
        tipo,
      });
      return "desc";
    }

    // ✅ valores monetários / inteiros / números => maior para menor
    logInfo("Regra padrão descendente aplicada", {
      indicadorNorm,
      classeSelecionada,
      campo,
      tipo,
    });
    return "desc";
  };

  DashboardBI.helpers.getEstiloFaixaAuditoria = function (valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return "";
    }

    if (numero <= 2.49) {
      return "background:#e8f5e9;color:#1b5e20;font-weight:700;";
    }

    if (numero >= 2.5 && numero <= 2.99) {
      return "background:#fff8e1;color:#8d6e00;font-weight:700;";
    }

    return "background:#ffebee;color:#b71c1c;font-weight:700;";
  };

  // ==========================
  // 📝 JUSTIFICATIVAS
  // ==========================
  DashboardBI.helpers.linhaTemJustificativa = function (linha = {}) {
    const tem = Object.keys(linha || {}).some((chave) => {
      if (!String(chave || "").startsWith("justificativa_")) return false;

      const valor = DashboardBI.helpers.normalizarTexto(linha[chave]);
      return valor !== "";
    });

    return tem;
  };

  DashboardBI.helpers.extrairJustificativasLinha = function (linha = {}) {
    return Object.entries(linha || {})
      .filter(([chave, valor]) => {
        if (!String(chave || "").startsWith("justificativa_")) return false;

        const motivo = DashboardBI.helpers.normalizarTexto(valor);
        return motivo !== "";
      })
      .map(([chave, valor]) => ({
        campo: chave,
        motivo: DashboardBI.helpers.normalizarTexto(valor),
      }));
  };

  // ==========================
  // 🎨 FORMATAÇÃO FINAL
  // ==========================
  DashboardBI.helpers.formatarKpi = function (
    valor,
    { percentual = false, casas = 2, tipo = "numero" } = {}
  ) {
    const numero = Number(valor);
    if (!isFinite(numero)) return "-";

    if (DashboardBI.helpers.tipoMoeda(tipo)) {
      return DashboardBI.helpers.formatarMoeda(numero);
    }

    if (percentual || DashboardBI.helpers.tipoPercentual(tipo)) {
      return DashboardBI.helpers.formatarPercentual(numero, casas);
    }

    if (DashboardBI.helpers.tipoInteiro(tipo)) {
      return DashboardBI.helpers.formatarInteiro(numero);
    }

    return DashboardBI.helpers.formatarNumero(numero, casas);
  };

  DashboardBI.helpers.menorEhMelhor = function (
    tipoValorPrincipal,
    campo = "mediaValor"
  ) {
    const state = DashboardBI.STATE || {};

    const ordem = DashboardBI.helpers.getOrdemEspecialDashboard({
      indicador: state.indicador,
      classe: state.classe,
      campo,
      tipo: tipoValorPrincipal,
    });

    return ordem === "asc";
  };

  DashboardBI.helpers.formatarValor = function (valor, tipo = "numero") {
    if (valor === null || valor === undefined || valor === "") return "-";

    const numero = Number(valor);
    if (isNaN(numero)) return "-";

    if (DashboardBI.helpers.tipoMoeda(tipo)) {
      return DashboardBI.helpers.formatarMoeda(numero);
    }

    if (DashboardBI.helpers.tipoPercentual(tipo)) {
      return DashboardBI.helpers.formatarPercentual(numero, 2);
    }

    if (DashboardBI.helpers.tipoInteiro(tipo)) {
      return DashboardBI.helpers.formatarInteiro(numero);
    }

    return DashboardBI.helpers.formatarNumero(numero, 2);
  };

  // ==========================
  // 📂 CLASSES / INDICADORES
  // ==========================
  DashboardBI.helpers.getClassesDisponiveis = function () {
    if (
      typeof window.classesIndicadores === "object" &&
      window.classesIndicadores
    ) {
      return Object.keys(window.classesIndicadores);
    }

    return [
      "Auditoria",
      "Frente de Caixa",
      "Operações",
      "Prevenção",
      "RH / Operacional",
    ];
  };

  DashboardBI.helpers.getIndicadoresPorClasse = function (classe) {
    const classesIndicadores = window.classesIndicadores || {};

    if (!classe || classe === "TODAS") {
      const lista = [];

      Object.entries(classesIndicadores).forEach(([nomeClasse, itens]) => {
        (itens || []).forEach((item) => {
          lista.push({
            nome: item?.nome || item,
            valor: item?.valor || item,
            classe: nomeClasse,
          });
        });
      });

      logInfo("Indicadores por classe (TODAS) carregados", {
        total: lista.length,
      });

      return lista;
    }

    const itens = classesIndicadores?.[classe] || [];

    const lista = itens.map((item) => ({
      nome: item?.nome || item,
      valor: item?.valor || item,
      classe,
    }));

    logInfo("Indicadores por classe carregados", {
      classe,
      total: lista.length,
    });

    return lista;
  };

  // ==========================
  // 📈 CHARTS
  // ==========================
  DashboardBI.helpers.destruirGraficos = function () {
    logInfo("Destruindo gráficos antigos do dashboard...");

    try {
      if (window.dashboardCharts?.evolucao) {
        window.dashboardCharts.evolucao.destroy();
        window.dashboardCharts.evolucao = null;
      }

      if (window.dashboardCharts?.ranking) {
        window.dashboardCharts.ranking.destroy();
        window.dashboardCharts.ranking = null;
      }

      if (window.dashboardCharts?.classes) {
        window.dashboardCharts.classes.destroy();
        window.dashboardCharts.classes = null;
      }
    } catch (erro) {
      logError("Erro ao destruir gráficos do dashboard", erro);
    }
  };

  DashboardBI.helpers.chartJsDisponivel = function () {
    const ok = typeof Chart !== "undefined";
    if (!ok) {
      logError("Chart.js não encontrado no dashboard");
    }
    return ok;
  };

  DashboardBI.helpers.ajustarAlturaChartBox = function (
    canvasId,
    quantidade,
    { minimo = 220, maximo = 420, pxPorItem = 28 } = {}
  ) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas || !canvas.parentElement) return;

      const alturaCalculada = Math.max(
        minimo,
        Math.min(maximo, quantidade * pxPorItem)
      );

      canvas.parentElement.style.height = `${alturaCalculada}px`;

      logInfo("Altura do chart ajustada", {
        canvasId,
        quantidade,
        alturaCalculada,
      });
    } catch (erro) {
      logWarn("Não foi possível ajustar altura do gráfico", {
        canvasId,
        erro,
      });
    }
  };

  logInfo("dashboard-helpers.js pronto", {
    helpers: Object.keys(DashboardBI.helpers || {}),
  });
})();

DashboardBI.helpers.usuarioDashboardEhGlobal = function (contexto) {
  const escopo = contexto?.escopo || {};
  return (escopo.tipo || "") === "global";
};