console.log("✅ dashboard-kpis.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.kpis = DashboardBI.kpis || {};

(function inicializarDashboardKpis() {
  const LOG_PREFIX = "🧮 DashboardKPIs";

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

  function numeroSeguro(valor, fallback = 0) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : fallback;
  }

  function textoSeguro(valor, fallback = "-") {
    const texto = (valor || "").toString().trim();
    return texto || fallback;
  }

  function escapeHtml(valor) {
    return (valor || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatarValorKPI(valor, tipo = "numero") {
    try {
      if (DashboardBI.helpers?.formatarValor) {
        return DashboardBI.helpers.formatarValor(valor, tipo);
      }
    } catch (erro) {
      logWarn("Falha ao formatar valor via helper", {
        valor,
        tipo,
        erro,
      });
    }

    const numero = Number(valor);
    if (!Number.isFinite(numero)) return "-";

    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function montarCardKPI({
    cor = "azul",
    label = "",
    valor = "-",
    rodape = "",
    spanClass = "span-3",
    classeExtra = "",
  }) {
    const classes = ["dashboard-card", "dashboard-kpi", cor, spanClass, classeExtra]
      .filter(Boolean)
      .join(" ");

    return `
      <div class="${classes}">
        <span class="dashboard-kpi-label">${escapeHtml(label)}</span>
        <div class="dashboard-kpi-valor">${escapeHtml(valor)}</div>
        <div class="dashboard-kpi-rodape">${escapeHtml(rodape)}</div>
      </div>
    `;
  }

  // ==========================
  // 🔢 KPIs GERENCIAIS
  // ==========================
  DashboardBI.kpis.renderKPIsGerenciais = function ({
    tituloLoja,
    totalLojas,
    mediaPrimeira,
    mediaUltima,
    mediaMensal,
    tipoValorPrincipal,
    descricaoPeriodo,
  }) {
    const tituloLojaSeguro = textoSeguro(tituloLoja, "Visão Gerencial");
    const descricaoPeriodoSegura = textoSeguro(
      descricaoPeriodo,
      "período selecionado"
    );

    const totalLojasNumero = numeroSeguro(totalLojas, 0);
    const mediaPrimeiraNumero = numeroSeguro(mediaPrimeira, 0);
    const mediaUltimaNumero = numeroSeguro(mediaUltima, 0);
    const mediaMensalNumero = numeroSeguro(mediaMensal, 0);

    logInfo("Renderizando KPIs gerenciais", {
      tituloLojaSeguro,
      totalLojasNumero,
      mediaPrimeiraNumero,
      mediaUltimaNumero,
      mediaMensalNumero,
      tipoValorPrincipal,
      descricaoPeriodoSegura,
    });

    return `
      ${montarCardKPI({
        cor: "azul",
        label: "Loja / Escopo",
        valor: String(totalLojasNumero),
        rodape: tituloLojaSeguro,
        spanClass: "span-3",
      })}

      ${montarCardKPI({
        cor: "verde",
        label: "Média 1ª semana",
        valor: formatarValorKPI(mediaPrimeiraNumero, tipoValorPrincipal),
        rodape: `Primeira semana do ${descricaoPeriodoSegura}`,
        spanClass: "span-3",
      })}

      ${montarCardKPI({
        cor: "laranja",
        label: "Média última semana",
        valor: formatarValorKPI(mediaUltimaNumero, tipoValorPrincipal),
        rodape: `Última semana do ${descricaoPeriodoSegura}`,
        spanClass: "span-3",
      })}

      ${montarCardKPI({
        cor: "roxo",
        label: "Média consolidada",
        valor: formatarValorKPI(mediaMensalNumero, tipoValorPrincipal),
        rodape: "(1ª semana + última semana) / 2",
        spanClass: "span-3",
      })}
    `;
  };

  // ==========================
  // 🌍 REGIONAL SEM KPIs
  // mantido conforme solicitado
  // ==========================
  DashboardBI.kpis.renderKPIsRegionais = function () {
    logInfo("Render KPIs regionais ignorado (mantido sem KPIs)");
    return "";
  };

  logInfo("dashboard-kpis.js pronto", {
    renderKPIsGerenciais: typeof DashboardBI.kpis.renderKPIsGerenciais,
    renderKPIsRegionais: typeof DashboardBI.kpis.renderKPIsRegionais,
  });
})();