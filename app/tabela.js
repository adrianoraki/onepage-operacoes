// ==========================
// 📊 CONFIG GLOBAL
// ==========================
const INDICADORES = [
  "Ruptura Final",
  "Etiqueta",
  "Self-Checkout",
  "Desconto",
  "Cancelamento",
  "Devolução",
  "PSV",
  "Quebra Identificada",
  "Quebra Identificada FLV"
]

let indicadorSelecionado = null

console.log("✅ tabela.js carregado")

// ==========================
// 📅 SEMANA ATUAL (ROBUSTO)
// ==========================
function getSemanaAtual() {

  const hoje = new Date()
  const inicioAno = new Date(hoje.getFullYear(), 0, 1)

  const dias = Math.floor((hoje - inicioAno) / 86400000)

  let semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7)

  if (semana > 52) semana = 1

  console.log("📅 Semana atual:", semana)

  return semana
}


// ==========================
// 🗓️ GERAR SEMANAS (RESOLVE NEGATIVO)
// ==========================
function gerarSemanas() {

  const atual = getSemanaAtual()

  const lista = [
    atual - 3,
    atual - 2,
    atual - 1,
    atual
  ].map(s => (s <= 0 ? 52 + s : s))

  const semanas = lista.map(s => s.toString().padStart(2, "0"))

  console.log("🗓️ Semanas:", semanas)

  return semanas
}


// ==========================
// 📊 CARREGAR TABELA
// ==========================
async function carregarTabela() {

  console.log("🚀 carregarTabela iniciado")

  try {

    indicadorSelecionado = localStorage.getItem("indicador")

    if (!indicadorSelecionado) {
      console.warn("⚠️ Nenhum indicador selecionado")

      document.getElementById("conteudo").innerHTML = `
        <h2>📥 Preenchimento</h2>
        <p>Escolha um indicador no menu lateral.</p>
      `
      return
    }

    console.log("📊 Indicador:", indicadorSelecionado)

    const semanas = gerarSemanas()

    const [lojasResp, resultadosResp] = await Promise.all([
      supabase.from("lojas").select("*").order("codigo"),
      supabase
        .from("resultados")
        .select("*")
        .eq("indicador", indicadorSelecionado)
    ])

    if (lojasResp.error) throw lojasResp.error
    if (resultadosResp.error) throw resultadosResp.error

    const lojas = lojasResp.data || []
    const resultados = resultadosResp.data || []

    console.log("🏬 Lojas carregadas:", lojas.length)
    console.log("📊 Resultados carregados:", resultados.length)

    // mapa rápido
    const mapa = {}

    resultados.forEach(r => {
      mapa[`${r.loja}-${r.semana}`] = r
    })

    document.getElementById("conteudo").innerHTML =
      montarHTMLTabela(lojas, mapa, semanas)

  } catch (erro) {
    console.error("❌ Erro ao carregar tabela:", erro)
    mostrarErro("Erro ao carregar tabela")
  }
}


// ==========================
// 🧱 TABELA HTML
// ==========================
function montarHTMLTabela(lojas, mapa, semanas) {

  let html = `
    <h2>📊 ${indicadorSelecionado}</h2>

    <div class="tabela-container">
      <table class="tabela">
        <thead>
          <tr>
            <th>Código</th>
            <th>Loja</th>
            <th>Regional</th>
  `

  semanas.forEach(sem => {
    html += `<th>SEM ${sem}</th>`
  })

  html += `
          </tr>
        </thead>
        <tbody>
  `

  lojas.forEach(loja => {
    html += montarLinha(loja, mapa, semanas)
  })

  html += `
        </tbody>
      </table>
    </div>
  `

  return html
}


// ==========================
// 🧱 LINHA DA TABELA
// ==========================
function montarLinha(loja, mapa, semanas) {

  const codigo = loja.codigo
  const nome = loja.nome
  const regional = loja.regional || "-"

  const chaveLoja = `${codigo} - ${nome}`

  let html = `
    <tr>
      <td>${codigo}</td>
      <td>${nome}</td>
      <td>${regional}</td>
  `

  semanas.forEach(semana => {

    const reg = mapa[`${chaveLoja}-${semana}`]
    const valor = reg?.valor ?? ""

    html += `
      <td>
        <input
          type="number"
          step="0.01"
          value="${valor}"
          onblur="salvarValor('${chaveLoja}','${semana}',this.value)"
        >
      </td>
    `
  })

  html += `</tr>`

  return html
}


// ==========================
// 💾 SALVAR NO SUPABASE
// ==========================
async function salvarValor(loja, semana, valor) {

  if (valor === "" || valor === null) return

  const numero = Number(valor)

  if (isNaN(numero)) return

  console.log("💾 Salvando:", { loja, semana, numero })

  try {

    const { data: existente } = await supabase
      .from("resultados")
      .select("id")
      .eq("loja", loja)
      .eq("semana", semana)
      .eq("indicador", indicadorSelecionado)
      .maybeSingle()

    if (existente) {

      await supabase
        .from("resultados")
        .update({ valor: numero })
        .eq("id", existente.id)

      console.log("✅ Atualizado")

    } else {

      await supabase
        .from("resultados")
        .insert([{
          loja,
          semana,
          indicador: indicadorSelecionado,
          valor: numero
        }])

      console.log("✅ Inserido")
    }

  } catch (erro) {
    console.error("❌ Erro ao salvar:", erro)
  }
}