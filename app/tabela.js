// ==========================
// 📊 CONFIG GLOBAL
// ==========================
let indicadorSelecionado = null;

// ✅ garante semana correta SEMPRE
let semanaSelecionada =
  localStorage.getItem("semana") ||
  getSemanaAtual().toString().padStart(2, "0");

const TABELA_STATE = {
  salvando: new Set(),
};

console.log("✅ tabela.js carregado");
console.log("📅 Semana inicial:", semanaSelecionada);

// ==========================
// 📂 MAPA DE CLASSES (compatibilidade)
// ==========================
const mapaClasse = {
  "RUPTURA FINAL": "Auditoria",
  ETIQUETA: "Auditoria",

  "SELF-CHECKOUT": "Frente de Caixa",
  DESCONTO: "Frente de Caixa",
  CANCELAMENTO: "Frente de Caixa",
  DEVOLUÇÃO: "Frente de Caixa",

  PSV: "Operações",
  NPS: "Operações",
  "PART.TELEVENDAS": "Operações",

  QUEBRA: "Prevenção",
  "QUEBRA FLV": "Prevenção",
  "QUEBRA AÇOUGUE": "Prevenção",
  TROCA: "Prevenção",

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
// 🔠 NORMALIZAR
// ==========================
function normalizarTextoTabela(valor) {
  return (valor || "").toString().trim();
}

function normalizarTextoTabelaUpper(valor) {
  return normalizarTextoTabela(valor).toUpperCase();
}

// ==========================
// 🗝️ CHAVE DE REGISTRO
// ==========================
function getChaveRegistroTabela(loja, semana, indicadorBanco, classe) {
  return `${loja}__${semana}__${indicadorBanco}__${classe}`;
}

// ==========================
// 🖍️ STATUS VISUAL DO INPUT
// ==========================
function aplicarStatusInput(input, status) {
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
      input.style.border = "1px solid #ccc";
      input.style.background = "#fff";
    }, 900);

    return;
  }

  if (status === "erro") {
    input.style.border = "1px solid #e53935";
    input.style.background = "#fff2f2";
    return;
  }

  input.style.border = "1px solid #ccc";
  input.style.background = "#fff";
}

// ==========================
// 🗓️ GERAR SEMANAS
// ==========================
function gerarSemanas() {
  const atual = parseInt(semanaSelecionada || getSemanaAtual(), 10);

  const lista = [atual - 3, atual - 2, atual - 1, atual].map((s) =>
    s <= 0 ? 52 + s : s
  );

  const semanas = lista.map((s) => s.toString().padStart(2, "0"));

  console.log("🗓️ Semanas exibidas:", semanas);

  return semanas;
}

// ==========================
// 📂 CLASSE PELO CONTEXTO
// ==========================
function obterClasse(indicador, classeSelecionada = null) {
  const indicadorNorm = normalizarTextoTabelaUpper(indicador);
  const classeMenu = normalizarTextoTabela(classeSelecionada);

  // usa config central se existir
  if (typeof getClasseIndicador === "function") {
    return getClasseIndicador(indicadorNorm, classeMenu);
  }

  // compatibilidade
  if (indicadorNorm === "PSV" && classeMenu === "Prevenção") return "Prevenção";
  if (indicadorNorm === "PSV" && classeMenu === "Operações") return "Operações";

  if (mapaClasse[indicadorNorm]) return mapaClasse[indicadorNorm];

  return "Outros";
}

// ==========================
// 🗃️ INDICADOR DO BANCO
// ==========================
function obterIndicadorBanco(indicador, classeSelecionada = null) {
  const indicadorNorm = normalizarTextoTabelaUpper(indicador);
  const classeMenu = normalizarTextoTabela(classeSelecionada);

  if (typeof getIndicadorBanco === "function") {
    return getIndicadorBanco(indicadorNorm, classeMenu);
  }

  return indicadorNorm;
}

// ==========================
// 🏷️ TÍTULO DE EXIBIÇÃO
// ==========================
function getTituloIndicador(indicador, classeSelecionada = null) {
  const indicadorNorm = normalizarTextoTabelaUpper(indicador);
  const classeMenu = normalizarTextoTabela(classeSelecionada);

  if (typeof getNomeIndicador === "function") {
    return getNomeIndicador(indicadorNorm, classeMenu);
  }

  if (indicadorNorm === "PSV" && classeMenu === "Operações") {
    return "Visita Prospecção";
  }

  return indicadorNorm;
}

// ==========================
// 🔗 CLASSES COMPATÍVEIS (banco legado)
// ==========================
function getClassesConsulta(classeAtual) {
  return [
    classeAtual,
    classeAtual === "Operações" ? "Comercial" : null,
    classeAtual === "Prevenção" ? "Quebras" : null,
  ].filter(Boolean);
}

// ==========================
// 📊 CARREGAR TABELA
// ==========================
async function carregarTabela() {
  console.log("🚀 carregarTabela");

  try {
    if (!window.db) {
      console.error("❌ window.db não inicializado");
      mostrarErro("Conexão com banco não iniciada");
      return;
    }

    semanaSelecionada =
      localStorage.getItem("semana") ||
      getSemanaAtual().toString().padStart(2, "0");

    console.log("📅 Semana ativa:", semanaSelecionada);

    indicadorSelecionado = localStorage.getItem("indicador");

    if (!indicadorSelecionado) {
      console.warn("⚠️ Nenhum indicador selecionado");

      const conteudo = document.getElementById("conteudo");
      if (conteudo) {
        conteudo.innerHTML = `
          <h2>📥 Preenchimento</h2>
          <p>Selecione um indicador.</p>
        `;
      }
      return;
    }

    const classeSelecionada = localStorage.getItem("classeSelecionada") || "";

    const indicadorNormalizado = normalizarTextoTabelaUpper(indicadorSelecionado);
    const indicadorBanco = obterIndicadorBanco(indicadorNormalizado, classeSelecionada);
    const classeAtual = obterClasse(indicadorNormalizado, classeSelecionada);

    const isEspecial =
      typeof isIndicadorEspecial === "function"
        ? isIndicadorEspecial(indicadorNormalizado, classeSelecionada)
        : false;

    const isEspecialRH =
      typeof isIndicadorEspecialRH === "function"
        ? isIndicadorEspecialRH(indicadorNormalizado, classeSelecionada)
        : false;

    console.log("📂 Classe:", classeAtual);
    console.log("📊 Indicador normalizado:", indicadorNormalizado);
    console.log("🗃️ Indicador banco:", indicadorBanco);
    console.log("🧩 É especial?", isEspecial);
    console.log("🧩 É RH especial?", isEspecialRH);

    const semanas = gerarSemanas();

    const [lojasResp, resultadosResp] = await Promise.all([
      window.db.from("lojas").select("*").order("codigo"),
      window.db
        .from("resultados")
        .select("*")
        .eq("indicador", indicadorBanco)
        .in("classe", getClassesConsulta(classeAtual))
        .in("semana", semanas),
    ]);

    if (lojasResp.error) throw lojasResp.error;
    if (resultadosResp.error) throw resultadosResp.error;

    const lojas = lojasResp.data || [];
    const resultados = resultadosResp.data || [];

    console.log("🏬 Lojas carregadas:", lojas.length);
    console.log("📊 Registros carregados:", resultados.length);

    const mapa = {};
    resultados.forEach((r) => {
      mapa[`${r.loja}-${r.semana}`] = r;
    });

    const container = document.getElementById("conteudo");
    if (!container) {
      console.error("❌ #conteudo não encontrado");
      return;
    }

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
      container.innerHTML = montarHTMLTabela(
        lojas,
        mapa,
        semanas,
        classeSelecionada
      );
    }

    // ✅ aplica bloqueio/liberação nos inputs
    if (typeof aplicarPermissoesTabela === "function") {
      aplicarPermissoesTabela(indicadorNormalizado, classeAtual);
    }

    ativarFiltros();
  } catch (erro) {
    console.error("❌ Erro carregarTabela:", erro);
    mostrarErro("Erro ao carregar tabela");
  }
}

// ==========================
// 🧱 HTML TABELA NORMAL
// ==========================
function montarHTMLTabela(lojas, mapa, semanas, classeSelecionada = null) {
  const titulo = getTituloIndicador(indicadorSelecionado, classeSelecionada);
  const semanaAtualReal = getSemanaAtual().toString().padStart(2, "0");

  let html = `
    <div class="card-conteudo">

      <div class="header-tabela">
        <h2>📊 ${titulo}</h2>

        <select class="filtro-semana" onchange="alterarSemana(this.value)">
          ${gerarOptionsSemanas()}
        </select>
      </div>

      <div class="filtros-tabela filtros-novos">
        <input
          type="text"
          id="filtroBuscaLoja"
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

      <div class="tabela-container">
        <table class="tabela">
          <thead>
            <tr>
              <th>Código</th>
              <th>Loja</th>
              <th>Regional</th>
  `;

  semanas.forEach((sem) => {
    const destaque = sem === semanaAtualReal ? ' class="coluna-atual"' : "";
    html += `<th${destaque}>SEM ${sem}</th>`;
  });

  html += `
            </tr>
          </thead>
          <tbody id="tbody-tabela">
  `;

  lojas.forEach((loja) => {
    html += montarLinha(loja, mapa, semanas, classeSelecionada);
  });

  html += `
          </tbody>
        </table>
      </div>

    </div>
  `;

  return html;
}

// ==========================
// 🧱 LINHAS DA TABELA NORMAL
// ==========================
function montarLinha(loja, mapa, semanas, classeSelecionada = null) {
  const chaveLoja = `${loja.codigo} - ${loja.nome}`;
  const semanaAtualReal = getSemanaAtual().toString().padStart(2, "0");

  const campoCfg =
    typeof getCampoConfig === "function"
      ? getCampoConfig(indicadorSelecionado, "valor", classeSelecionada)
      : { key: "valor", label: "Resultado", tipo: "numero" };

  let html = `
    <tr>
      <td>${loja.codigo}</td>
      <td>${loja.nome}</td>
      <td>${loja.regional || "-"}</td>
  `;

  semanas.forEach((semana) => {
    const reg = mapa[`${chaveLoja}-${semana}`];
    const valor = reg?.valor ?? "";
    const destaque = semana === semanaAtualReal ? "coluna-atual" : "";

    const valorFormatado =
      typeof formatarValorParaInput === "function"
        ? formatarValorParaInput(valor, campoCfg.tipo)
        : valor;

    const valorOriginal =
      valor === null || valor === undefined || valor === ""
        ? ""
        : String(valor);

    html += `
      <td class="${destaque}">
        <input
          type="text"
          inputmode="decimal"
          value="${valorFormatado}"
          data-loja="${chaveLoja}"
          data-semana="${semana}"
          data-campo="valor"
          data-tipo="${campoCfg.tipo}"
          data-original="${valorOriginal}"
          onfocus="prepararInputFormatado(this)"
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
// Busca por código ou loja + botão NE1/NE2
// ==========================
function ativarFiltros() {
  console.log("🔎 Ativando filtros");

  const busca = document.getElementById("filtroBuscaLoja");
  const botoesRegional = document.querySelectorAll(".btn-filtro-regional");

  // ✅ se a tabela atual não tiver esse filtro, não faz nada
  if (!busca || !botoesRegional.length) {
    console.warn("⚠️ Filtros padrão não disponíveis nessa tabela");
    return;
  }

  let regionalSelecionada = "TODAS";

  const aplicar = () => {
    const termo = busca.value.toLowerCase().trim();

    document.querySelectorAll("#tbody-tabela tr").forEach((row) => {
      const tds = row.querySelectorAll("td");
      if (tds.length < 3) return;

      const codigo = tds[0].textContent.toLowerCase();
      const loja = tds[1].textContent.toLowerCase();
      const regional = tds[2].textContent.toLowerCase();

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

  busca.addEventListener("input", aplicar);

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
// ⚡ AUTO SAVE
// ==========================
async function autoSalvar(input) {
  if (!input) return;

  const loja = input.dataset.loja;
  const semana = input.dataset.semana;
  const tipo = input.dataset.tipo || "numero";
  const valorOriginal = input.dataset.original ?? "";

  const valorLimpo =
    typeof limparValorParaSalvar === "function"
      ? limparValorParaSalvar(input.value, tipo)
      : Number((input.value || "").toString().replace(",", "."));

  if (valorLimpo === null || Number.isNaN(valorLimpo)) {
    console.warn("⚠️ Valor inválido ou vazio, salvamento ignorado", {
      loja,
      semana,
      valorDigitado: input.value,
      tipo
    });

    return;
  }

  const valorComparacao = String(valorLimpo);

  // ✅ evita salvar se nada mudou
  if (valorComparacao === valorOriginal) {
    console.log("ℹ️ Valor não alterado, salvamento ignorado", {
      loja,
      semana,
      valor: valorComparacao
    });

    // reaplica formatação se necessário
    if (typeof formatarValorParaInput === "function") {
      input.value = formatarValorParaInput(valorLimpo, tipo);
    }

    return;
  }

  // reaplica máscara no campo
  if (typeof formatarValorParaInput === "function") {
    input.value = formatarValorParaInput(valorLimpo, tipo);
  }

  console.log("⚡ AutoSave", {
    loja,
    semana,
    valor: valorLimpo,
    tipo
  });

  aplicarStatusInput(input, "salvando");

  const salvou = await salvarValor(loja, semana, valorLimpo);

  if (salvou) {
    input.dataset.original = String(valorLimpo);
    aplicarStatusInput(input, "sucesso");
  } else {
    aplicarStatusInput(input, "erro");
  }
}

// ==========================
// 💾 SALVAR
// ==========================
async function salvarValor(loja, semana, valor) {
  const numero = Number(valor);
  if (isNaN(numero)) {
    console.warn("⚠️ salvarValor ignorado por número inválido:", valor);
    return false;
  }

  const classeSelecionada = localStorage.getItem("classeSelecionada") || "";
  const indicadorNormalizado = normalizarTextoTabelaUpper(indicadorSelecionado);
  const indicadorBanco = obterIndicadorBanco(indicadorNormalizado, classeSelecionada);
  const classe = obterClasse(indicadorNormalizado, classeSelecionada);

  const chaveSalvar = getChaveRegistroTabela(loja, semana, indicadorBanco, classe);

  if (TABELA_STATE.salvando.has(chaveSalvar)) {
    console.warn("⚠️ Já existe um salvamento em andamento para este registro:", chaveSalvar);
    return false;
  }

  TABELA_STATE.salvando.add(chaveSalvar);

  console.log("💾 SALVAR:", {
    indicadorSelecionado,
    indicadorNormalizado,
    indicadorBanco,
    classe,
    loja,
    semana,
    numero,
  });

  try {
    const { data: existentes, error: erroBusca } = await window.db
      .from("resultados")
      .select("id, valor")
      .eq("loja", loja)
      .eq("semana", semana)
      .eq("indicador", indicadorBanco)
      .eq("classe", classe)
      .order("id", { ascending: true });

    if (erroBusca) throw erroBusca;

    const registros = existentes || [];

    if (registros.length > 1) {
      console.warn("⚠️ Registros duplicados encontrados para a mesma chave:", {
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

      const { error: erroUpdate } = await window.db
        .from("resultados")
        .update({ valor: numero })
        .eq("id", idAlvo);

      if (erroUpdate) throw erroUpdate;

      console.log("✅ Registro atualizado com sucesso:", {
        id: idAlvo,
        loja,
        semana,
        indicadorBanco,
        classe,
        valor: numero,
      });

      return true;
    }

    const { data: inserido, error: erroInsert } = await window.db
      .from("resultados")
      .insert([
        {
          loja,
          semana,
          indicador: indicadorBanco,
          classe,
          valor: numero,
        },
      ])
      .select("id")
      .single();

    if (erroInsert) throw erroInsert;

    console.log("✅ Registro inserido com sucesso:", {
      id: inserido?.id,
      loja,
      semana,
      indicadorBanco,
      classe,
      valor: numero,
    });

    return true;
  } catch (erro) {
    console.error("❌ Erro salvarValor:", erro);
    return false;
  } finally {
    TABELA_STATE.salvando.delete(chaveSalvar);
  }
}

// ==========================
// 🔢 GERAR OPTIONS SEMANA
// ==========================
function gerarOptionsSemanas() {
  let html = "";

  const atual =
    semanaSelecionada || getSemanaAtual().toString().padStart(2, "0");

  console.log("📅 Gerando options - semana ativa:", atual);

  for (let i = 1; i <= 53; i++) {
    const s = i.toString().padStart(2, "0");
    const selected = s === atual ? "selected" : "";
    const classe = s === atual ? "semana-ativa" : "";

    html += `
      <option value="${s}" class="${classe}" ${selected}>
        Semana ${s}
      </option>
    `;
  }

  return html;
}