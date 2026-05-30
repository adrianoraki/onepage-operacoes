// ==========================
// 🧩 TABELA ESPECIAL RH
// (BANCOS DE HORAS)
// ==========================

// ==========================
// ⚙️ CONFIG RH
// ==========================
function getConfigTabelaRH(indicador, classeSelecionada = null) {
  // tenta usar o arquivo central de configuração
  if (typeof getIndicadorConfig === "function") {
    const cfg = getIndicadorConfig(indicador, classeSelecionada);
    const campo1 =
      typeof getCampoConfig === "function"
        ? getCampoConfig(indicador, "valor", classeSelecionada)
        : { key: "valor", label: "Horas +", tipo: "numero" };

    const campo2 =
      typeof getCampoConfig === "function"
        ? getCampoConfig(indicador, "valor2", classeSelecionada)
        : { key: "valor2", label: "Horas -", tipo: "numero" };

    return {
      titulo: cfg?.nomeExibicao || indicador,
      col1: campo1.label || "Horas +",
      col2: campo2.label || "Horas -",
      tipo1: campo1.tipo || "numero",
      tipo2: campo2.tipo || "numero",
    };
  }

  // fallback seguro
  return {
    titulo: indicador || "BANCOS DE HORAS",
    col1: "Horas +",
    col2: "Horas -",
    tipo1: "numero",
    tipo2: "numero",
  };
}

// ==========================
// 🧱 MONTAR TABELA RH
// ==========================
function montarTabelaRH(lojas, mapa, semanas) {
  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const config = getConfigTabelaRH(indicadorSelecionado, classeSelecionada);
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
          id="filtroRH"
          placeholder="Buscar código ou nome da loja"
        >

        <div class="grupo-filtro-regional">
          <button type="button" class="btn-filtro-regional-rh ativo" data-regional="TODAS">
            Todas
          </button>
          <button type="button" class="btn-filtro-regional-rh" data-regional="NE1">
            NE1
          </button>
          <button type="button" class="btn-filtro-regional-rh" data-regional="NE2">
            NE2
          </button>
        </div>
      </div>

      <div class="tabela-container tabela-rh-ajustada">
        <table class="tabela tabela-rh-compacta">
          <thead>
            <tr>
              <th rowspan="2" class="col-codigo-rh">Código</th>
              <th rowspan="2" class="col-loja-rh">Loja</th>
              <th rowspan="2" class="col-regional-rh">Regional</th>
  `;

  // cabeçalho de semanas
  semanas.forEach((semana) => {
    const destaque = semana === semanaAtualReal ? ' class="coluna-atual"' : "";
    html += `<th colspan="2"${destaque}>Semana ${semana}</th>`;
  });

  html += `
            </tr>
            <tr>
  `;

  // subcolunas
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
          <tbody id="tbody-rh">
  `;

  lojas.forEach((loja) => {
    const chaveLoja = `${loja.codigo} - ${loja.nome}`;

    html += `
      <tr>
        <td class="col-codigo-rh">${loja.codigo}</td>
        <td class="col-loja-rh">${loja.nome}</td>
        <td class="col-regional-rh">${loja.regional || "-"}</td>
    `;

    semanas.forEach((semana) => {
      const key = `${chaveLoja}-${semana}`;
      const item = mapa[key] || {};

      const horasMais = item.valor ?? "";
      const horasMenos = item.valor2 ?? "";
      const destaque = semana === semanaAtualReal ? "coluna-atual" : "";

      const valorFormatado =
        typeof formatarValorParaInput === "function"
          ? formatarValorParaInput(horasMais, config.tipo1)
          : horasMais;

      const valor2Formatado =
        typeof formatarValorParaInput === "function"
          ? formatarValorParaInput(horasMenos, config.tipo2)
          : horasMenos;

      html += `
        <td class="${destaque}">
          <input
            type="text"
            inputmode="decimal"
            value="${valorFormatado}"
            data-loja="${chaveLoja}"
            data-semana="${semana}"
            data-campo="valor"
            data-tipo="${config.tipo1}"
            class="input-tabela input-tabela-rh"
            onfocus="prepararInputRH(this)"
            onblur="autoSalvarRH(this)"
          >
        </td>

        <td class="${destaque}">
          <input
            type="text"
            inputmode="decimal"
            value="${valor2Formatado}"
            data-loja="${chaveLoja}"
            data-semana="${semana}"
            data-campo="valor2"
            data-tipo="${config.tipo2}"
            class="input-tabela input-tabela-rh"
            onfocus="prepararInputRH(this)"
            onblur="autoSalvarRH(this)"
          >
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
    ativarFiltroRH();
  });

  return html;
}

// ==========================
// ✍️ PREPARAR INPUT RH
// remove máscara ao focar
// ==========================
function prepararInputRH(input) {
  const tipo = input.dataset.tipo || "numero";

  if (typeof prepararInputFormatado === "function") {
    prepararInputFormatado(input);
    return;
  }

  // fallback simples
  let valor = (input.value || "").toString().trim();
  valor = valor
    .replace("R$", "")
    .replace("%", "")
    .replace(/\s/g, "")
    .trim();

  input.value = valor;
}

// ==========================
// 🔎 FILTRO RH
// ==========================
function ativarFiltroRH() {
  const input = document.getElementById("filtroRH");
  const botoesRegional = document.querySelectorAll(".btn-filtro-regional-rh");

  if (!input || !botoesRegional.length) {
    console.warn("⚠️ Filtro RH não encontrado");
    return;
  }

  let regionalSelecionada = "TODAS";

  const aplicar = () => {
    const termo = input.value.toLowerCase().trim();

    document.querySelectorAll("#tbody-rh tr").forEach((row) => {
      const codigo = row.children[0]?.textContent.toLowerCase() || "";
      const loja = row.children[1]?.textContent.toLowerCase() || "";
      const regional = row.children[2]?.textContent.toLowerCase() || "";

      const matchBusca =
        !termo ||
        codigo.includes(termo) ||
        loja.includes(termo);

      const matchRegional =
        regionalSelecionada === "TODAS" ||
        regional === regionalSelecionada.toLowerCase();

      row.style.display = matchBusca && matchRegional ? "" : "none";
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
// 💾 AUTOSAVE RH
// ==========================
async function autoSalvarRH(input) {
  const loja = input.dataset.loja;
  const semana = input.dataset.semana;
  const campo = input.dataset.campo;
  const tipo = input.dataset.tipo || "numero";

  let valorLimpo = null;

  if (typeof limparValorParaSalvar === "function") {
    valorLimpo = limparValorParaSalvar(input.value, tipo);
  } else {
    const numero = Number((input.value || "").toString().replace(",", "."));
    valorLimpo = isNaN(numero) ? null : numero;
  }

  if (valorLimpo === null) return;

  // reaplica máscara
  if (typeof formatarValorParaInput === "function") {
    input.value = formatarValorParaInput(valorLimpo, tipo);
  }

  const indicadorNormalizado = (indicadorSelecionado || "")
    .toString()
    .trim()
    .toUpperCase();

  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const classe =
    typeof getClasseIndicador === "function"
      ? getClasseIndicador(indicadorNormalizado, classeSelecionada)
      : typeof obterClasse === "function"
        ? obterClasse(indicadorNormalizado, classeSelecionada)
        : classeSelecionada || "RH / Operacional";

  console.log("💾 SALVAR RH:", {
    loja,
    semana,
    campo,
    valor: valorLimpo,
    tipo,
    indicador: indicadorNormalizado,
    classe,
  });

  try {
    const { data: existente, error } = await window.db
      .from("resultados")
      .select("id, valor, valor2")
      .eq("loja", loja)
      .eq("semana", semana)
      .eq("indicador", indicadorNormalizado)
      .eq("classe", classe)
      .maybeSingle();

    if (error) throw error;

    if (existente) {
      const updateData = {};
      updateData[campo] = valorLimpo;

      const { error: updateError } = await window.db
        .from("resultados")
        .update(updateData)
        .eq("id", existente.id);

      if (updateError) throw updateError;

      console.log("✅ RH atualizado");
    } else {
      const novoRegistro = {
        loja,
        semana,
        indicador: indicadorNormalizado,
        classe,
        valor: campo === "valor" ? valorLimpo : null,
        valor2: campo === "valor2" ? valorLimpo : null,
      };

      const { error: insertError } = await window.db
        .from("resultados")
        .insert([novoRegistro]);

      if (insertError) throw insertError;

      console.log("✅ RH inserido");
    }
  } catch (erro) {
    console.error("❌ Erro ao salvar RH:", erro);
  }
}