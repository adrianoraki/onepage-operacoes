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
    }
  };
  console.log("📐 Módulo calculos.js carregado com sucesso!");
})();