// ==========================
// 📊 CONFIG GLOBAL
// ==========================
let indicadorSelecionado = null;

// ✅ garante semana correta SEMPRE
let semanaSelecionada =
  localStorage.getItem("semana") ||
  getSemanaAtual().toString().padStart(2, "0");

console.log("✅ tabela.js carregado");
console.log("📅 Semana inicial:", semanaSelecionada);

// ==========================
// 📂 MAPA DE CLASSES
// ==========================
const mapaClasse = {
  // ✅ Auditoria
  "RUPTURA FINAL": "Auditoria",
  ETIQUETA: "Auditoria",

  // ✅ Frente de Caixa
  "SELF-CHECKOUT": "Frente de Caixa",
  DESCONTO: "Frente de Caixa",
  CANCELAMENTO: "Frente de Caixa",
  DEVOLUÇÃO: "Frente de Caixa",

  // ✅ NOVO NOME (antes Comercial)
  PSV: "Operações",
  NPS: "Operações",
  "PART.TELEVENDAS": "Operações",

  // ✅ NOVO NOME (antes Quebras)
  QUEBRA: "Prevenção",
  "QUEBRA FLV": "Prevenção",
  "QUEBRA AÇOUGUE": "Prevenção",

  // ✅ PSV também na Prevenção ✅
  PSV_PREVENCAO: "Prevenção",

  // ✅ RH
  "BANCOS DE HORAS": "RH / Operacional",
  TURNOVER: "RH / Operacional",
};

// ==========================
// 📅 SEMANA ATUAL
// ==========================

function getSemanaAtual() {
  const hoje = new Date();

  const inicioAno = new Date(hoje.getFullYear(), 0, 1);

  const dias = Math.floor((hoje - inicioAno) / (24 * 60 * 60 * 1000));

  const semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);

  return semana;
}

// ==========================
// 🗓️ GERAR SEMANAS
// ==========================
function gerarSemanas() {
  const atual = parseInt(semanaSelecionada || getSemanaAtual());

  const lista = [atual - 3, atual - 2, atual - 1, atual].map((s) =>
    s <= 0 ? 52 + s : s,
  );

  const semanas = lista.map((s) => s.toString().padStart(2, "0"));

  console.log("🗓️ Semanas exibidas:", semanas);

  return semanas;
}

// ==========================
// 📊 CARREGAR TABELA
// ==========================

function obterClasse(indicador) {
  // ✅ novo padrão
  if (mapaClasse[indicador]) {
    return mapaClasse[indicador];
  }

  // ✅ compatibilidade com palavras antigas
  if (indicador === "PSV") return "Operações";
  if (indicador === "NPS") return "Operações";

  // ✅ fallback antigo
  if (indicador === "QUEBRA") return "Prevenção";

  return "Outros";
}

async function carregarTabela() {
  console.log("🚀 carregarTabela");

  try {
    semanaSelecionada =
      localStorage.getItem("semana") ||
      getSemanaAtual().toString().padStart(2, "0");

    console.log("📅 Semana ativa:", semanaSelecionada);

    indicadorSelecionado = localStorage.getItem("indicador");

    if (!indicadorSelecionado) {
      console.warn("⚠️ Nenhum indicador selecionado");

      document.getElementById("conteudo").innerHTML = `
        <h2>📥 Preenchimento</h2>
        <p>Selecione um indicador.</p>
      `;
      return;
    }

    const indicadorNormalizado = indicadorSelecionado.toUpperCase().trim();

    const classeAtual = obterClasse(indicadorNormalizado);

    // ✅ especiais tabela2.js
    const isEspecial = isIndicadorEspecial(indicadorNormalizado);
    const isEspecialRH = isIndicadorEspecialRH(indicadorNormalizado);

    console.log("🧩 É especial?", isEspecial);
    console.log("🧩 É RH especial?", isEspecialRH);


    console.log("📂 Classe:", classeAtual);
    console.log("🧩 É especial?", isEspecial);
    console.log("🧩 É RH especial?", isEspecialRH);
    console.log("📊 Indicador normalizado:", indicadorNormalizado);

    const semanas = gerarSemanas();

    const [lojasResp, resultadosResp] = await Promise.all([
      supabase.from("lojas").select("*").order("codigo"),
      supabase
        .from("resultados")
        .select("*")
        .eq("indicador", indicadorNormalizado)
        .in(
          "classe",
          [
            classeAtual,
            classeAtual === "Operações" ? "Comercial" : null,
            classeAtual === "Prevenção" ? "Quebras" : null,
          ].filter(Boolean),
        ),
    ]);

    if (lojasResp.error) throw lojasResp.error;
    if (resultadosResp.error) throw resultadosResp.error;

    const lojas = lojasResp.data || [];
    const resultados = resultadosResp.data || [];

    console.log("🏬 Lojas:", lojas.length);
    console.log("📊 Registros:", resultados.length);

    const mapa = {};
    resultados.forEach((r) => {
      mapa[`${r.loja}-${r.semana}`] = r;
    });

    const container = document.getElementById("conteudo");

    if (isEspecialRH) {
      console.log("🧩 Usando tabela RH");

      if (typeof montarTabelaRH === "function") {
        container.innerHTML = montarTabelaRH(lojas, mapa, semanas);
      } else {
        console.error("❌ montarTabelaRH não encontrada");
        mostrarErro("Tabela RH não carregada");
        return;
      }
    } else if (isEspecial) {
      console.log("🧩 Usando tabela especial");

      if (typeof montarTabelaEspecial === "function") {
        container.innerHTML = montarTabelaEspecial(lojas, mapa, semanas);
      } else {
        console.error("❌ montarTabelaEspecial não encontrada");
        mostrarErro("Tabela especial não carregada");
        return;
      }
    } else {
      container.innerHTML = montarHTMLTabela(lojas, mapa, semanas);
    }

    ativarFiltros();
  } catch (erro) {
    console.error("❌ Erro carregarTabela:", erro);
    mostrarErro("Erro ao carregar tabela");
  }
}
// ==========================
// 🧱 HTML TABELA
// ==========================
function montarHTMLTabela(lojas, mapa, semanas) {
  let html = `
  <div class="card-conteudo">

    <div class="header-tabela">
      <h2>📊 ${indicadorSelecionado}</h2>

      <!-- 🔥 SELETOR DE SEMANA -->
      <select class="filtro-semana" onchange="alterarSemana(this.value)">
        ${gerarOptionsSemanas()}
      </select>
    </div>

    <div class="filtros-tabela">
      <input type="text" id="filtroCodigo" placeholder="Código">
      <input type="text" id="filtroLoja" placeholder="Loja">
      <input type="text" id="filtroRegional" placeholder="Regional">
    </div>

    <div class="tabela-container">
      <table class="tabela">
        <thead>
          <tr>
            <th>Código</th>
            <th>Loja</th>
            <th>Regional</th>
  `;

  semanas.forEach((sem) => {
    html += `<th>SEM ${sem}</th>`;
  });

  html += `</tr></thead><tbody id="tbody-tabela">`;

  lojas.forEach((loja) => {
    html += montarLinha(loja, mapa, semanas);
  });

  html += `</tbody></table></div></div>`;

  return html;
}

// ==========================
// 🔄 ALTERAR SEMANA
// ==========================
function alterarSemana(sem) {
  if (sem === semanaSelecionada) {
    console.log("⚠️ Semana já ativa, ignorando");
    return;
  }

  semanaSelecionada = sem;

  localStorage.setItem("semana", sem);

  console.log("📅 Semana alterada:", sem);

  carregarTabela();
}

// ==========================
// 🔎 FILTROS
// ==========================
function ativarFiltros() {
  console.log("🔎 Ativando filtros");

  const cod = document.getElementById("filtroCodigo");
  const loja = document.getElementById("filtroLoja");
  const reg = document.getElementById("filtroRegional");

  // ✅ SE NÃO EXISTIR → NÃO FAZ NADA
  if (!cod || !loja || !reg) {
    console.warn("⚠️ Filtros não disponíveis nessa tabela");
    return;
  }

  const aplicar = () => {
    document.querySelectorAll("#tbody-tabela tr").forEach((row) => {
      const tds = row.querySelectorAll("td");

      const ok =
        tds[0].textContent.toLowerCase().includes(cod.value.toLowerCase()) &&
        tds[1].textContent.toLowerCase().includes(loja.value.toLowerCase()) &&
        tds[2].textContent.toLowerCase().includes(reg.value.toLowerCase());

      row.style.display = ok ? "" : "none";
    });
  };

  [cod, loja, reg].forEach((i) => i.addEventListener("input", aplicar));
}
// ==========================
// 🧱 LINHAS
// ==========================
function montarLinha(loja, mapa, semanas) {
  const chaveLoja = `${loja.codigo} - ${loja.nome}`;

  const semanaAtualReal = getSemanaAtual().toString().padStart(2, "0");

  let html = `<tr>
    <td>${loja.codigo}</td>
    <td>${loja.nome}</td>
    <td>${loja.regional || "-"}</td>`;

  semanas.forEach((semana) => {
    const reg = mapa[`${chaveLoja}-${semana}`];
    const valor = reg?.valor ?? "";
    const destaque = semana === semanaAtualReal ? "coluna-atual" : "";

    html += `
      <td class="${destaque}">
  <input
    type="number"
    step="0.01"
    value="${valor}"
    data-loja="${chaveLoja}"
    data-semana="${semana}"
    onblur="autoSalvar(this)"
    style="height:30px; border-radius:6px; padding-left:5px;"
  >
</td>
    `;
  });

  html += `</tr>`;

  return html;
}

// ==========================
// ⚡ AUTO SAVE
// ==========================
async function autoSalvar(input) {
  const valor = input.value;
  const loja = input.dataset.loja;
  const semana = input.dataset.semana;

  if (!valor) return;

  console.log("⚡ AutoSave", { loja, semana, valor });

  await salvarValor(loja, semana, valor);
}

// ==========================
// 💾 SALVAR
// ==========================
async function salvarValor(loja, semana, valor) {
  const numero = Number(valor);
  if (isNaN(numero)) return;

  const indicadorNormalizado = indicadorSelecionado.toUpperCase().trim();
  const classe = mapaClasse[indicadorNormalizado] || "Outros";

  console.log("💾 SALVAR:", {
    indicadorSelecionado,
    classe,
    loja,
    semana,
    numero,
  });

  try {
    const { data: existente } = await supabase
      .from("resultados")
      .select("id")
      .eq("loja", loja)
      .eq("semana", semana)
      .eq("indicador", indicadorSelecionado)
      .eq("classe", classe)
      .maybeSingle();

    if (existente) {
      await supabase
        .from("resultados")
        .update({ valor: numero })
        .eq("id", existente.id);

      console.log("✅ Atualizado");
    } else {
      await supabase.from("resultados").insert([
        {
          loja,
          semana,
          indicador: indicadorSelecionado,
          classe,
          valor: numero,
        },
      ]);

      console.log("✅ Inserido");
    }
  } catch (erro) {
    console.error("❌ Erro salvarValor:", erro);
  }
}

// ==========================
// 🔢 GERAR OPTIONS SEMANA (VERSÃO FINAL)
// ==========================
function gerarOptionsSemanas() {
  let html = "";

  // ✅ garante sempre string formatada correta
  const atual =
    semanaSelecionada || getSemanaAtual().toString().padStart(2, "0");

  console.log("📅 Gerando options - semana ativa:", atual);

  for (let i = 1; i <= 53; i++) {
    const s = i.toString().padStart(2, "0");

    // ✅ seleciona corretamente
    const selected = s === atual ? "selected" : "";

    // ✅ adiciona classe visual (opcional para CSS)
    const classe = s === atual ? "semana-ativa" : "";

    html += `
      <option value="${s}" class="${classe}" ${selected}>
        Semana ${s}
      </option>
    `;
  }

  return html;
}
