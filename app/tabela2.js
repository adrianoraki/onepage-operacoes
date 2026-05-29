
// ==========================
// 🧩 TABELA ESPECIAL
// (SELF-CHECKOUT / PART.TELEVENDAS)
// ==========================
function montarTabelaEspecial(lojas, mapa, semanas) {

  // ✅ Define colunas baseado no indicador
  let col1 = "Meta";
  let col2 = "Real";

  if (indicadorSelecionado === "PART.TELEVENDAS") {
    col1 = "Part %";
    col2 = "Margem";
  }

  if (indicadorSelecionado === "SELF-CHECKOUT") {
    col1 = "Participação";
    col2 = "Qtd Passantes";
  }

  let html = `
    <div class="card-conteudo">

      <div class="header-tabela">
        <h2>📊 ${indicadorSelecionado}</h2>
      </div>

      <!-- ✅ filtro -->
      <div class="filtros-tabela">
        <input type="text" id="filtroEspecial" placeholder="Pesquisar código, loja ou regional">
      </div>

      <div class="tabela-container">
        <table class="tabela">
          <thead>

            <tr>
              <th rowspan="2">Código</th>
              <th rowspan="2">Loja</th>
              <th rowspan="2">Regional</th>
  `;

  // semanas
  semanas.forEach(semana => {
    html += `<th colspan="2">Semana ${semana}</th>`;
  });

  html += `</tr><tr>`;

  // ✅ colunas dinâmicas
  semanas.forEach(() => {
    html += `
      <th>${col1}</th>
      <th>${col2}</th>
    `;
  });

  html += `
            </tr>
          </thead>
          <tbody id="tbody-especial">
  `;

  // ✅ linhas
  lojas.forEach(loja => {

    const chaveLoja = `${loja.codigo} - ${loja.nome}`;

    html += `<tr>`;

    html += `<td>${loja.codigo}</td>`;
    html += `<td>${loja.nome}</td>`;
    html += `<td>${loja.regional || "-"}</td>`;

    semanas.forEach(semana => {

      const key = `${chaveLoja}-${semana}`;
      const item = mapa[key] || {};

      html += `
        <td>
          <input
            type="number"
            step="0.01"
            value="${item.valor || ""}"
            class="input-tabela"
          >
        </td>

        <td>
          <input
            type="number"
            step="0.01"
            value="${item.valor2 || ""}"
            class="input-tabela"
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
  setTimeout(() => ativarFiltroEspecial(), 100);

  return html;
}

function ativarFiltroEspecial() {

  const input = document.getElementById("filtroEspecial");

  if (!input) return;

  input.addEventListener("input", () => {

    const valor = input.value.toLowerCase();

    document.querySelectorAll("#tbody-especial tr").forEach(row => {

      const codigo = row.children[0].textContent.toLowerCase();
      const loja = row.children[1].textContent.toLowerCase();
      const regional = row.children[2].textContent.toLowerCase();

      const ok =
        codigo.includes(valor) ||
        loja.includes(valor) ||
        regional.includes(valor);

      row.style.display = ok ? "" : "none";

    });

  });
}