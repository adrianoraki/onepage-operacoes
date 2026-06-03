console.log("✅ dashboard-helpers.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.helpers = DashboardBI.helpers || {};

(function inicializarDashboardHelpers() {
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

    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: casas,
      maximumFractionDigits: casas,
    });
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
  // 🎯 EXIBIÇÃO KPI / TIPO
  // ==========================
  DashboardBI.helpers.tipoPercentual = function (tipo) {
    const tipoNorm = DashboardBI.helpers.normalizarTextoLower(tipo);
    return (
      tipoNorm.includes("percent") ||
      tipoNorm.includes("porcent") ||
      tipoNorm === "%"
    );
  };

  DashboardBI.helpers.formatarKpi = function (
    valor,
    { percentual = false, casas = 2 } = {}
  ) {
    const numero = Number(valor);
    if (!isFinite(numero)) return "-";

    const texto = DashboardBI.helpers.formatarNumero(numero, casas);
    return percentual ? `${texto}%` : texto;
  };

  DashboardBI.helpers.menorEhMelhor = function (tipoValorPrincipal) {
    if (DashboardBI.helpers.tipoPercentual(tipoValorPrincipal)) return true;

    try {
      const state = DashboardBI.STATE || {};
      if (state.indicador && state.indicador !== "TODOS") {
        if (typeof getIndicadorConfig === "function") {
          const cfg = getIndicadorConfig(
            state.indicador,
            state.classe === "TODAS" ? null : state.classe
          );

          if (cfg?.ordemRanking === "asc") return true;
          if (cfg?.ordemRanking === "desc") return false;
        }
      }
    } catch (erro) {
      console.warn("⚠️ Falha ao avaliar menorEhMelhor no helper:", erro);
    }

    return false;
  };

  // ==========================
  // 🏷️ INDICADOR / CAMPO
  // ==========================
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

  DashboardBI.helpers.getCampo = function (
    indicador,
    campoKey = "valor",
    classeSelecionada = null
  ) {
    if (typeof getCampoConfig === "function") {
      return getCampoConfig(indicador, campoKey, classeSelecionada);
    }

    return {
      key: campoKey,
      label: campoKey === "valor2" ? "Valor 2" : "Resultado",
      tipo: "numero",
    };
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

    return campo?.tipo || "numero";
  };

  DashboardBI.helpers.formatarValor = function (valor, tipo = "numero") {
    if (valor === null || valor === undefined || valor === "") return "-";

    const numero = Number(valor);
    if (isNaN(numero)) return "-";

    if (typeof formatarValorExibicao === "function") {
      return formatarValorExibicao(numero, tipo);
    }

    return DashboardBI.helpers.formatarNumero(numero, 2);
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
      console.warn("⚠️ Não foi possível avaliar ordem do ranking:", erro);
    }

    return "desc";
  };

  // ==========================
  // 📂 CLASSES / INDICADORES
  // ==========================
  DashboardBI.helpers.getClassesDisponiveis = function () {
    if (typeof window.classesIndicadores === "object" && window.classesIndicadores) {
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

      return lista;
    }

    const itens = classesIndicadores?.[classe] || [];

    return itens.map((item) => ({
      nome: item?.nome || item,
      valor: item?.valor || item,
      classe,
    }));
  };

  // ==========================
  // 📈 CHARTS
  // ==========================
  DashboardBI.helpers.destruirGraficos = function () {
    console.log("🧹 Destruindo gráficos antigos do dashboard...");

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
      console.error("❌ Erro ao destruir gráficos do dashboard:", erro);
    }
  };

  DashboardBI.helpers.chartJsDisponivel = function () {
    const ok = typeof Chart !== "undefined";
    if (!ok) {
      console.error("❌ Chart.js não encontrado no dashboard");
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
    } catch (erro) {
      console.warn("⚠️ Não foi possível ajustar altura do gráfico:", {
        canvasId,
        erro,
      });
    }
  };

  console.log("✅ dashboard-helpers.js pronto", {
    helpers: Object.keys(DashboardBI.helpers || {}),
  });
})();

DashboardBI.helpers.usuarioDashboardEhGlobal = function (contexto) {
  const escopo = contexto?.escopo || {};
  return (escopo.tipo || "") === "global";
};