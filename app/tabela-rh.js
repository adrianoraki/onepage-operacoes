// ==========================
// 🧩 TABELA ESPECIAL RH
// (BANCOS DE HORAS / RH ESPECIAL)
// ==========================

const TABELA_RH_STATE = {
  salvando: new Set(),
};

// ==========================
// 🗝️ CHAVE DE REGISTRO RH
// ==========================
function getChaveRegistroRH(loja, semana, indicadorBanco, classe, campo) {
  return `${loja}__${semana}__${indicadorBanco}__${classe}__${campo}`;
}

// ==========================
// 🖍️ STATUS VISUAL DO INPUT RH
// ==========================
function aplicarStatusInputRH(input, status) {
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

      const original1 =
        horasMais === null || horasMais === undefined || horasMais === ""
          ? ""
          : String(horasMais);

      const original2 =
        horasMenos === null || horasMenos === undefined || horasMenos === ""
          ? ""
          : String(horasMenos);

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
            data-original="${original1}"
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
            data-original="${original2}"
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
    console.warn("⚠️ Valor RH inválido ou vazio, salvamento ignorado", {
      loja,
      semana,
      campo,
      valorDigitado: input.value,
      tipo
    });
    return;
  }

  // reaplica máscara
  if (typeof formatarValorParaInput === "function") {
    input.value = formatarValorParaInput(valorLimpo, tipo);
  }

  const comparacao = String(valorLimpo);

  // ✅ evita salvar se não alterou
  if (comparacao === original) {
    console.log("ℹ️ Valor RH não alterado, salvamento ignorado", {
      loja,
      semana,
      campo,
      valor: comparacao
    });
    return;
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

  console.log("⚡ AUTOSAVE RH:", {
    loja,
    semana,
    campo,
    valor: valorLimpo,
    tipo,
    indicador: indicadorNormalizado,
    classe,
  });

  aplicarStatusInputRH(input, "salvando");

  const salvou = await salvarValorRH(
    loja,
    semana,
    campo,
    valorLimpo,
    indicadorNormalizado,
    classe
  );

  if (salvou) {
    input.dataset.original = String(valorLimpo);
    aplicarStatusInputRH(input, "sucesso");
  } else {
    aplicarStatusInputRH(input, "erro");
  }
}

// ==========================
// 💾 SALVAR VALOR RH
// ==========================
async function salvarValorRH(
  loja,
  semana,
  campo,
  valor,
  indicadorNormalizado,
  classe
) {
  const numero = Number(valor);
  if (isNaN(numero)) {
    console.warn("⚠️ salvarValorRH ignorado por número inválido:", valor);
    return false;
  }

  const indicadorBanco =
    typeof getIndicadorBanco === "function"
      ? getIndicadorBanco(indicadorNormalizado, localStorage.getItem("classeSelecionada") || "")
      : indicadorNormalizado;

  const chaveSalvar = getChaveRegistroRH(
    loja,
    semana,
    indicadorBanco,
    classe,
    campo
  );

  if (TABELA_RH_STATE.salvando.has(chaveSalvar)) {
    console.warn("⚠️ Já existe salvamento RH em andamento:", chaveSalvar);
    return false;
  }

  TABELA_RH_STATE.salvando.add(chaveSalvar);

  console.log("💾 SALVAR RH:", {
    loja,
    semana,
    campo,
    valor: numero,
    indicador: indicadorNormalizado,
    indicadorBanco,
    classe,
  });

  try {
    const { data: existentes, error } = await window.db
      .from("resultados")
      .select("id, valor, valor2")
      .eq("loja", loja)
      .eq("semana", semana)
      .eq("indicador", indicadorBanco)
      .eq("classe", classe)
      .order("id", { ascending: true });

    if (error) throw error;

    const registros = existentes || [];

    if (registros.length > 1) {
      console.warn("⚠️ Registros RH duplicados encontrados:", {
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

      const { error: updateError } = await window.db
        .from("resultados")
        .update(updateData)
        .eq("id", idAlvo);

      if (updateError) throw updateError;

      console.log("✅ RH atualizado com sucesso:", {
        id: idAlvo,
        loja,
        semana,
        campo,
        valor: numero,
      });

      return true;
    }

    const novoRegistro = {
      loja,
      semana,
      indicador: indicadorBanco,
      classe,
      valor: campo === "valor" ? numero : null,
      valor2: campo === "valor2" ? numero : null,
    };

    const { data: inserido, error: insertError } = await window.db
      .from("resultados")
      .insert([novoRegistro])
      .select("id")
      .single();

    if (insertError) throw insertError;

    console.log("✅ RH inserido com sucesso:", {
      id: inserido?.id,
      loja,
      semana,
      campo,
      valor: numero,
    });

    return true;
  } catch (erro) {
    console.error("❌ Erro ao salvar RH:", erro);
    return false;
  } finally {
    TABELA_RH_STATE.salvando.delete(chaveSalvar);
  }
}