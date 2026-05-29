// ==========================
// 🧩 TABELA ESPECIAL RH
// (BANCOS DE HORAS)
// ==========================
function montarTabelaRH(lojas, mapa, semanas) {

  console.log("🧩 montarTabelaRH iniciado");

  let html = `
    <div class="card-conteudo">

      <div class="header-tabela">
        <h2>📊 ${indicadorSelecionado}</h2>
      </div>

      <div class="filtros-tabela">
        <input type="text" id="filtroEspecialRH" placeholder="Pesquisar código da loja">
      </div>

      <div class="tabela-container">
        <table class="tabela">
          <thead>
            <tr>
              <th rowspan="2">Código</th>
              <th rowspan="2">Loja</th>
              <th rowspan="2">Regional</th>
  `;

  // ✅ cabeçalho por semana
  semanas.forEach((semana) => {
    html += `<th colspan="2">Semana ${semana}</th>`;
  });

  html += `
            </tr>
            <tr>
  `;

  // ✅ subcolunas fixas do RH
  semanas.forEach(() => {
    html += `
      <th>Horas +</th>
      <th>Horas -</th>
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
        <td>${loja.codigo}</td>
        <td>${loja.nome}</td>
        <td>${loja.regional || "-"}</td>
    `;

    semanas.forEach((semana) => {

      const key = `${chaveLoja}-${semana}`;
      const item = mapa[key] || {};

      // ✅ valor principal e secundário
      const horasMais = item.valor || "";
      const horasMenos = item.valor2 || "";

      html += `
        <td>
          <input
            type="number"
            step="0.01"
            value="${horasMais}"
            data-loja="${chaveLoja}"
            data-semana="${semana}"
            data-campo="valor"
            class="input-tabela"
            onblur="autoSalvarRH(this)"
          >
        </td>

        <td>
          <input
            type="number"
            step="0.01"
            value="${horasMenos}"
            data-loja="${chaveLoja}"
            data-semana="${semana}"
            data-campo="valor2"
            class="input-tabela"
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

  // ✅ ativa filtro depois do render
  setTimeout(() => ativarFiltroRH(), 100);

  return html;
}

// ==========================
// 🔎 FILTRO RH
// ==========================
function ativarFiltroRH() {

  console.log("🔎 Ativando filtro RH");

  const input = document.getElementById("filtroEspecialRH");

  if (!input) {
    console.warn("⚠️ Filtro RH não encontrado");
    return;
  }

  input.addEventListener("input", () => {

    const valor = input.value.toLowerCase();

    document.querySelectorAll("#tbody-rh tr").forEach((row) => {

      const codigo = row.children[0].textContent.toLowerCase();
      const loja = row.children[1].textContent.toLowerCase();

      row.style.display =
        codigo.includes(valor) || loja.includes(valor) ? "" : "none";
    });
  });
}

// ==========================
// 💾 SALVAR RH
// ==========================
async function autoSalvarRH(input) {

  const loja = input.dataset.loja;
  const semana = input.dataset.semana;
  const campo = input.dataset.campo;
  const valor = input.value;

  if (valor === "") return;

  const numero = Number(valor);

  if (isNaN(numero)) {
    console.warn("⚠️ Valor RH inválido:", valor);
    return;
  }

  const classe = mapaClasse[indicadorSelecionado.toUpperCase().trim()] || "RH / Operacional";

  console.log("💾 Salvando RH:", {
    loja,
    semana,
    campo,
    valor: numero,
    indicador: indicadorSelecionado,
    classe
  });

  try {

    const { data: existente, error } = await supabase
      .from("resultados")
      .select("id, valor, valor2")
      .eq("loja", loja)
      .eq("semana", semana)
      .eq("indicador", indicadorSelecionado)
      .eq("classe", classe)
      .maybeSingle();

    if (error) throw error;

    if (existente) {

      const updateData = {};
      updateData[campo] = numero;

      const { error: updateError } = await supabase
        .from("resultados")
        .update(updateData)
        .eq("id", existente.id);

      if (updateError) throw updateError;

      console.log("✅ RH atualizado");

    } else {

      const novoRegistro = {
        loja,
        semana,
        indicador: indicadorSelecionado,
        classe,
        valor: campo === "valor" ? numero : null,
        valor2: campo === "valor2" ? numero : null
      };

      const { error: insertError } = await supabase
        .from("resultados")
        .insert([novoRegistro]);

      if (insertError) throw insertError;

      console.log("✅ RH inserido");
    }

  } catch (erro) {
    console.error("❌ Erro ao salvar RH:", erro);
  }
}