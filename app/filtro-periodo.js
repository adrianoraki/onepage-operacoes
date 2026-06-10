// ==========================================================
// 🗓️ FILTRO DE PERÍODO COMPARTILHADO (Mês + Semana)
// Usado pelas tabelas (tabela, tabela2, tabela-rh, faixa-horas)
// O mês encurta a lista de semanas; cada ano recalcula sozinho
// (resistente à virada de ano).
// ==========================================================
(function () {
  "use strict";

  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  // mesma fórmula do getSemanaAtual() global, aplicada a uma data qualquer
  function numeroSemanaPorData(data) {
    const d = new Date(data);
    const inicioAno = new Date(d.getFullYear(), 0, 1);
    const dias = Math.floor((d - inicioAno) / (24 * 60 * 60 * 1000));
    return Math.ceil((dias + inicioAno.getDay() + 1) / 7);
  }

  // semanas de um mês (1-12): a semana pertence ao mês se a SEGUNDA-FEIRA
  // cai dentro do mês — assim cada semana tem um único mês (sem sobreposição)
  function getSemanasDoMes(mes, ano) {
    const m = Number(mes);
    if (!Number.isFinite(m) || m < 1 || m > 12) return [];

    const primeiro = new Date(ano, m - 1, 1);
    const ultimo = new Date(ano, m, 0);
    const set = new Set();

    for (let d = new Date(primeiro); d <= ultimo; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 1) {
        set.add(String(numeroSemanaPorData(d)).padStart(2, "0"));
      }
    }
    // fallback de segurança (mês sem segunda-feira não existe, mas garante)
    if (!set.size) {
      for (let d = new Date(primeiro); d <= ultimo; d.setDate(d.getDate() + 1)) {
        set.add(String(numeroSemanaPorData(d)).padStart(2, "0"));
      }
    }
    return [...set].sort((a, b) => Number(a) - Number(b));
  }

  // descobre a qual mês uma semana pertence (para inicializar o filtro)
  function mesDaSemana(semana, ano) {
    const s = String(semana).padStart(2, "0");
    for (let m = 1; m <= 12; m++) {
      if (getSemanasDoMes(m, ano).includes(s)) return m;
    }
    return new Date().getMonth() + 1;
  }

  const anoVigente = () => new Date().getFullYear();

  const mesInicial = (function () {
    const salvo = parseInt(localStorage.getItem("filtroMes"), 10);
    if (salvo >= 1 && salvo <= 12) return salvo;
    return new Date().getMonth() + 1;
  })();

  window.FiltroPeriodo = {
    mes: mesInicial,
    MESES,
    ano: anoVigente,
    nomeMes(m) {
      return MESES[Number(m) - 1] || "";
    },
    getSemanasDoMes,
    mesDaSemana,
    setMes(m) {
      this.mes = Number(m);
      localStorage.setItem("filtroMes", String(this.mes));
    },
    // garante que o mês selecionado contenha a semana informada
    sincronizarComSemana(semana) {
      this.mes = mesDaSemana(semana, anoVigente());
      localStorage.setItem("filtroMes", String(this.mes));
    },
    gerarOptionsMeses() {
      return MESES.map(
        (nome, i) =>
          `<option value="${i + 1}" ${this.mes === i + 1 ? "selected" : ""}>${nome}</option>`,
      ).join("");
    },
    // semanas do mês selecionado; marca a selecionada e a semana atual (★)
    gerarOptionsSemanas(semanaSelecionada, semanaReal) {
      const semanas = getSemanasDoMes(this.mes, anoVigente());
      if (!semanas.length) return "";
      return semanas
        .map((s) => {
          const sel = s === semanaSelecionada ? "selected" : "";
          const label = s === semanaReal ? `Semana ${s} ★` : `Semana ${s}`;
          return `<option value="${s}" ${sel}>${label}</option>`;
        })
        .join("");
    },
    // primeira semana do mês (usada ao trocar de mês)
    primeiraSemanaDoMes() {
      const semanas = getSemanasDoMes(this.mes, anoVigente());
      return semanas[0] || null;
    },
  };
})();
