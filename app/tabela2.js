// ==========================
// 🧩 TABELA ESPECIAL
// (SELF-CHECKOUT / PART.TELEVENDAS)
// ==========================

const TABELA_ESPECIAL_STATE = {
  salvando: new Set(),
};

// ==========================
// 🗝️ CHAVE DE REGISTRO ESPECIAL
// ==========================
function getChaveRegistroEspecial(loja, semana, indicadorBanco, classe, campo) {
  return `${loja}__${semana}__${indicadorBanco}__${classe}__${campo}`;
}

// ==========================
// 🖍️ STATUS VISUAL DO INPUT ESPECIAL
// ==========================
function aplicarStatusInputEspecial(input, status) {
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
      input.style.border = "";
      input.style.background = "";
    }, 900);

    return;
  }

  if (status === "erro") {
    input.style.border = "1px solid #e53935";
    input.style.background = "#fff2f2";
    return;
  }

  input.style.border = "";
  input.style.background = "";
}

// ==========================
// ⚙️ CONFIG DA TABELA ESPECIAL
// ==========================
function getConfigTabelaEspecial(indicador, classeSelecionada = null) {
  // ✅ usa config central se existir
  if (typeof getIndicadorConfig === "function") {
    const cfg = getIndicadorConfig(indicador, classeSelecionada);

    const campo1 =
      typeof getCampoConfig === "function"
        ? getCampoConfig(indicador, "valor", classeSelecionada)
        : { key: "valor", label: "Coluna 1", tipo: "numero" };

    const campo2 =
      typeof getCampoConfig === "function"
        ? getCampoConfig(indicador, "valor2", classeSelecionada)
        : { key: "valor2", label: "Coluna 2", tipo: "numero" };

    return {
      titulo: cfg?.nomeExibicao || indicador,
      col1: campo1.label || "Coluna 1",
      col2: campo2.label || "Coluna 2",
      tipo1: campo1.tipo || "numero",
      tipo2: campo2.tipo || "numero",
    };
  }

  // ✅ fallback seguro
  const indicadorNorm = (indicador || "").toString().trim().toUpperCase();

  if (indicadorNorm === "PART.TELEVENDAS") {
    return {
      titulo: "PART.TELEVENDAS",
      col1: "Part %",
      col2: "Margem",
      tipo1: "percentual",
      tipo2: "percentual",
    };
  }

  if (indicadorNorm === "SELF-CHECKOUT") {
    return {
      titulo: "SELF-CHECKOUT",
      col1: "Participação",
      col2: "Qtd Passantes",
      tipo1: "moeda",
      tipo2: "numero",
    };
  }

  return {
    titulo: indicadorNorm,
    col1: "Coluna 1",
    col2: "Coluna 2",
    tipo1: "numero",
    tipo2: "numero",
  };
}

// ==========================
// 🧱 MONTAR TABELA ESPECIAL
// ==========================
function montarTabelaEspecial(lojas, mapa, semanas) {
  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const config = getConfigTabelaEspecial(
    indicadorSelecionado,
    classeSelecionada,
  );
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
          id="filtroEspecial"
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

      <div class="tabela-container tabela-compacta-container">
        <table class="tabela tabela-especial-compacta">
          <thead>
            <tr>
              <th rowspan="2" class="col-codigo">Código</th>
              <th rowspan="2" class="col-loja">Loja</th>
              <th rowspan="2" class="col-regional">Regional</th>
  `;

  // cabeçalhos de semana
  semanas.forEach((semana) => {
    const destaque = semana === semanaAtualReal ? ' class="coluna-atual"' : "";
    html += `<th colspan="2"${destaque}>Semana ${semana}</th>`;
  });

  html += `</tr><tr>`;

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
          <tbody id="tbody-especial">
  `;

  lojas.forEach((loja) => {
    const chaveLoja = `${loja.codigo} - ${loja.nome}`;

    html += `<tr>`;
    html += `<td class="col-codigo">${loja.codigo}</td>`;
    html += `<td class="col-loja">${loja.nome}</td>`;
    html += `<td class="col-regional">${loja.regional || "-"}</td>`;

    semanas.forEach((semana) => {
      const key = `${chaveLoja}-${semana}`;
      const item = mapa[key] || {};
      const destaque = semana === semanaAtualReal ? "coluna-atual" : "";

      const valor = item.valor ?? "";
      const valor2 = item.valor2 ?? "";

      const valorFormatado =
        typeof formatarValorParaInput === "function"
          ? formatarValorParaInput(valor, config.tipo1)
          : valor;

      const valor2Formatado =
        typeof formatarValorParaInput === "function"
          ? formatarValorParaInput(valor2, config.tipo2)
          : valor2;

      const original1 =
        valor === null || valor === undefined || valor === ""
          ? ""
          : String(valor);

      const original2 =
        valor2 === null || valor2 === undefined || valor2 === ""
          ? ""
          : String(valor2);

      html += `
        <td class="${destaque}">
          <input
            type="text"
            inputmode="decimal"
            value="${valorFormatado}"
            class="input-tabela input-tabela-compacto"
            data-loja="${chaveLoja}"
            data-semana="${semana}"
            data-campo="valor"
            data-tipo="${config.tipo1}"
            data-original="${original1}"
            onfocus="prepararInputEspecial(this)"
            onblur="autoSalvarEspecial(this)"
          >
        </td>

        <td class="${destaque}">
          <input
            type="text"
            inputmode="decimal"
            value="${valor2Formatado}"
            class="input-tabela input-tabela-compacto"
            data-loja="${chaveLoja}"
            data-semana="${semana}"
            data-campo="valor2"
            data-tipo="${config.tipo2}"
            data-original="${original2}"
            onfocus="prepararInputEspecial(this)"
            onblur="autoSalvarEspecial(this)"
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
    ativarFiltroEspecial();
  });

  return html;
}

// ==========================
// ✍️ PREPARAR INPUT ESPECIAL
// remove máscara ao focar
// ==========================
function prepararInputEspecial(input) {
  const tipo = input.dataset.tipo || "numero";

  if (typeof prepararInputFormatado === "function") {
    prepararInputFormatado(input);
    return;
  }

  // fallback simples
  let valor = (input.value || "").toString().trim();
  valor = valor.replace("R$", "").replace("%", "").replace(/\s/g, "").trim();

  input.value = valor;
}

// ==========================
// 🔎 FILTRO TABELA ESPECIAL
// ==========================
function ativarFiltroEspecial() {
  const input = document.getElementById("filtroEspecial");
  const botoesRegional = document.querySelectorAll(".btn-filtro-regional");

  if (!input || !botoesRegional.length) {
    console.warn("⚠️ Filtro especial não encontrado");
    return;
  }

  let regionalSelecionada = "TODAS";

  const aplicar = () => {
    const termo = input.value.toLowerCase().trim();

    document.querySelectorAll("#tbody-especial tr").forEach((row) => {
      const dentroDoEscopo = row.dataset.escopoPermitido !== "false";

      const codigo = row.children[0]?.textContent.toLowerCase() || "";
      const loja = row.children[1]?.textContent.toLowerCase() || "";
      const regional = row.children[2]?.textContent.toLowerCase() || "";

      const matchBusca =
        !termo || codigo.includes(termo) || loja.includes(termo);

      const matchRegional =
        regionalSelecionada === "TODAS" ||
        regional === regionalSelecionada.toLowerCase();

      row.style.display =
        dentroDoEscopo && matchBusca && matchRegional ? "" : "none";
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
// ⚡ AUTOSAVE ESPECIAL
// ==========================
async function autoSalvarEspecial(input) {
  if (!input) return;

  const loja = input.dataset.loja;
  const semana = input.dataset.semana;
  const campo = input.dataset.campo;
  const tipo = input.dataset.tipo || "numero";
  const original = input.dataset.original ?? "";

  let valorLimpo = null;

  if (typeof limparValorParaSalvar === "function") {
    valorLimpo = limparValorParaSalvar(input.value, tipo);
  } else {
    const numero = Number((input.value || "").toString().replace(",", "."));
    valorLimpo = isNaN(numero) ? null : numero;
  }

  if (valorLimpo === null) {
    console.warn("⚠️ Valor especial inválido ou vazio, salvamento ignorado", {
      loja,
      semana,
      campo,
      valorDigitado: input.value,
      tipo,
    });
    return;
  }

  const comparacao = String(valorLimpo);

  // ✅ evita salvar se não alterou
  if (comparacao === original) {
    console.log("ℹ️ Valor especial não alterado, salvamento ignorado", {
      loja,
      semana,
      campo,
      valor: comparacao,
    });

    if (typeof formatarValorParaInput === "function") {
      input.value = formatarValorParaInput(valorLimpo, tipo);
    }

    return;
  }

  if (typeof formatarValorParaInput === "function") {
    input.value = formatarValorParaInput(valorLimpo, tipo);
  }

  console.log("⚡ AutoSave Especial", {
    loja,
    semana,
    campo,
    valor: valorLimpo,
    tipo,
  });

  aplicarStatusInputEspecial(input, "salvando");

  const salvou = await salvarValorEspecial(loja, semana, campo, valorLimpo);

  if (salvou) {
    input.dataset.original = String(valorLimpo);
    aplicarStatusInputEspecial(input, "sucesso");
  } else {
    aplicarStatusInputEspecial(input, "erro");
  }
}

// ==========================
// 💾 SALVAR VALOR ESPECIAL
// ==========================
async function salvarValorEspecial(loja, semana, campo, valor) {
  const numero = Number(valor);
  if (isNaN(numero)) {
    console.warn("⚠️ salvarValorEspecial ignorado por número inválido:", valor);
    return false;
  }

  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const indicadorNormalizado = (indicadorSelecionado || "")
    .toString()
    .trim()
    .toUpperCase();

  const indicadorBanco =
    typeof getIndicadorBanco === "function"
      ? getIndicadorBanco(indicadorNormalizado, classeSelecionada)
      : indicadorNormalizado;

  const classe =
    typeof getClasseIndicador === "function"
      ? getClasseIndicador(indicadorNormalizado, classeSelecionada)
      : typeof obterClasse === "function"
        ? obterClasse(indicadorNormalizado, classeSelecionada)
        : classeSelecionada || "Outros";

  const chaveSalvar = getChaveRegistroEspecial(
    loja,
    semana,
    indicadorBanco,
    classe,
    campo,
  );

  if (TABELA_ESPECIAL_STATE.salvando.has(chaveSalvar)) {
    console.warn("⚠️ Já existe salvamento especial em andamento:", chaveSalvar);
    return false;
  }

  TABELA_ESPECIAL_STATE.salvando.add(chaveSalvar);

  console.log("💾 SALVAR ESPECIAL:", {
    indicador: indicadorNormalizado,
    indicadorBanco,
    classe,
    loja,
    semana,
    campo,
    numero,
  });

  try {
    const { data: existentes, error: erroBusca } = await window.db
      .from("resultados")
      .select("id, valor, valor2")
      .eq("loja", loja)
      .eq("semana", semana)
      .eq("indicador", indicadorBanco)
      .eq("classe", classe)
      .order("id", { ascending: true });

    if (erroBusca) throw erroBusca;

    const registros = existentes || [];

    if (registros.length > 1) {
      console.warn("⚠️ Registros especiais duplicados encontrados:", {
        loja,
        semana,
        indicadorBanco,
        classe,
        qtd: registros.length,
        ids: registros.map((r) => r.id),
      });
    }

    if (registros.length >= 1) {
      const idAlvo = registros[0].id;
      const updateData = {};
      updateData[campo] = numero;

      const { error: erroUpdate } = await window.db
        .from("resultados")
        .update(updateData)
        .eq("id", idAlvo);

      if (erroUpdate) throw erroUpdate;

      console.log("✅ Especial atualizado com sucesso:", {
        id: idAlvo,
        loja,
        semana,
        campo,
        valor: numero,
      });

      return true;
    }

    const payload = {
      loja,
      semana,
      indicador: indicadorBanco,
      classe,
      valor: campo === "valor" ? numero : null,
      valor2: campo === "valor2" ? numero : null,
    };

    const { data: inserido, error: erroInsert } = await window.db
      .from("resultados")
      .insert([payload])
      .select("id")
      .single();

    if (erroInsert) throw erroInsert;

    console.log("✅ Especial inserido com sucesso:", {
      id: inserido?.id,
      loja,
      semana,
      campo,
      valor: numero,
    });

    return true;
  } catch (erro) {
    console.error("❌ Erro salvarValorEspecial:", erro);
    return false;
  } finally {
    TABELA_ESPECIAL_STATE.salvando.delete(chaveSalvar);
  }
}
