console.log("✅ dashboard-kpis.js carregado");

window.DashboardBI = window.DashboardBI || {};
DashboardBI.kpis = DashboardBI.kpis || {};

(function inicializarDashboardKpis() {
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
    const isPercentual = DashboardBI.helpers.tipoPercentual(tipoValorPrincipal);

    return `
      <div class="dashboard-card dashboard-kpi azul span-3">
        <span class="dashboard-kpi-label">Loja / Escopo</span>
        <div class="dashboard-kpi-valor">${totalLojas}</div>
        <div class="dashboard-kpi-rodape">${tituloLoja}</div>
      </div>

      <div class="dashboard-card dashboard-kpi verde span-3">
        <span class="dashboard-kpi-label">Média 1ª semana</span>
        <div class="dashboard-kpi-valor">
          ${DashboardBI.helpers.formatarKpi(mediaPrimeira, {
            percentual: isPercentual,
            casas: 2,
          })}
        </div>
        <div class="dashboard-kpi-rodape">Primeira semana do ${descricaoPeriodo}</div>
      </div>

      <div class="dashboard-card dashboard-kpi laranja span-3">
        <span class="dashboard-kpi-label">Média última semana</span>
        <div class="dashboard-kpi-valor">
          ${DashboardBI.helpers.formatarKpi(mediaUltima, {
            percentual: isPercentual,
            casas: 2,
          })}
        </div>
        <div class="dashboard-kpi-rodape">Última semana do ${descricaoPeriodo}</div>
      </div>

      <div class="dashboard-card dashboard-kpi roxo span-3">
        <span class="dashboard-kpi-label">Média consolidada</span>
        <div class="dashboard-kpi-valor">
          ${DashboardBI.helpers.formatarKpi(mediaMensal, {
            percentual: isPercentual,
            casas: 2,
          })}
        </div>
        <div class="dashboard-kpi-rodape">(1ª semana + última semana) / 2</div>
      </div>
    `;
  };

  // ==========================
  // 🌍 REGIONAL SEM KPIs
  // conforme solicitado
  // ==========================
  DashboardBI.kpis.renderKPIsRegionais = function () {
    return "";
  };

  console.log("✅ dashboard-kpis.js pronto", {
    renderKPIsGerenciais: typeof DashboardBI.kpis.renderKPIsGerenciais,
    renderKPIsRegionais: typeof DashboardBI.kpis.renderKPIsRegionais,
  });
})();
