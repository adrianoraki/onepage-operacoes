// app/painel-ouro/calculos.js

(function () {
  window.poCalculos = {
    /**
     * Formata um número float puro para string de moeda brasileira (Ex: 1500.5 -> "1.500,50")
     */
    formatarMoeda: function (valor) {
      if (isNaN(valor) || valor === null || valor === undefined) return "0,00";
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(valor);
    },

    /**
     * Aplica a máscara financeira de digitação em tempo real (Estilo Caixa Eletrônico)
     */
    mascaraMoeda: function (input) {
      let valor = input.value.replace(/\D/g, ""); // Remove tudo que não é número
      if (!valor) {
        input.value = "";
        return;
      }
      // Transforma os dígitos em um float com 2 casas decimais
      let numero = parseFloat(valor) / 100;
      // Atualiza o valor visível do input já formatado com pontos e vírgulas
      input.value = this.formatarMoeda(numero);
    },

    /**
     * Converte a string formatada ("1.250,50") de volta para float numérico puro (1250.50)
     */
    converterParaNumero: function (stringMoeda) {
      if (!stringMoeda) return 0;
      // Remove todos os pontos de milhar e substitui a vírgula por ponto decimal
      let limpo = stringMoeda.replace(/\./g, "").replace(",", ".");
      return parseFloat(limpo) || 0;
    },

    /**
     * Calcula o percentual de atingimento da meta frente à venda realizada
     */
    calcularPercentual: function (meta, venda) {
      if (meta <= 0) return 0;
      return (venda / meta) * 100;
    },

    /**
     * Define a pontuação com base no percentual atingido (Meta batida >= 100% ganha 20 pontos)
     */
    calcularPontos: function (percentual) {
      return percentual >= 100 ? 20 : 0;
    },

    // ============================================================
    // 🎯 MOTOR DE PONTUAÇÃO POR META (Painel de Ouro — áreas)
    // Centraliza parse pt-BR (R$, %, milhar, vírgula, negativos) e
    // a decisão de ponto por operação. NÃO afeta vendas/quebras.
    // ============================================================

    /**
     * Converte texto digitado em número, reconhecendo R$, %, separador de
     * milhar (.), decimal (,) e sinal negativo. Ex: "-R$ 5.000,01" -> -5000.01
     * "-2,80%" -> -2.8 | "1.500,50" -> 1500.5
     * Retorna null se vazio/ inválido.
     */
    parseValorBR: function (texto) {
      if (texto === null || texto === undefined) return null;
      let s = String(texto).trim();
      if (s === "") return null;
      const negativo = /^-/.test(s) || /^\(.*\)$/.test(s); // -x ou (x)
      s = s.replace(/r\$/i, "").replace(/%/g, "").replace(/[()]/g, "").replace(/\s/g, "");
      s = s.replace(/^-/, "");
      if (s.includes(",")) {
        // tem vírgula: vírgula é decimal, pontos são milhar
        s = s.replace(/\./g, "").replace(",", ".");
      } else if (s.includes(".")) {
        // só pontos, sem vírgula: decidir se é milhar ou decimal
        const partes = s.split(".");
        const ultima = partes[partes.length - 1];
        // vários pontos OU último grupo com 3 dígitos => separador de milhar
        if (partes.length > 2 || ultima.length === 3) {
          s = s.replace(/\./g, "");
        }
        // senão (ex.: "2.5", "100.50") trata como decimal — mantém o ponto
      }
      let n = parseFloat(s);
      if (isNaN(n)) return null;
      return negativo ? -n : n;
    },

    /**
     * Decide se o valor atinge a meta segundo a operação.
     *  "maior_igual" -> n >= meta
     *  "menor_igual" -> n <= meta
     */
    atingiuMeta: function (operacao, n, meta) {
      if (n === null || n === undefined || isNaN(n)) return false;
      const m = Number(meta);
      if (isNaN(m)) return false;
      return operacao === "maior_igual" ? (n >= m) : (n <= m);
    },

    /**
     * Retorna os pontos do indicador: peso cheio se atingiu, senão 0.
     */
    pontosIndicador: function (operacao, n, meta, peso) {
      return this.atingiuMeta(operacao, n, meta) ? Number(peso) : 0;
    }
  };
  console.log("📐 Módulo calculos.js carregado com sucesso! [v2 — parseValorBR + atingiuMeta ativos]");
})();