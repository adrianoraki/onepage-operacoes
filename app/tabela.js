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

// ==========================
// 📅 OBTER SEMANA ATUAL
// ==========================
function getSemanaAtual() {
  const hoje = new Date()
  const inicioAno = new Date(hoje.getFullYear(), 0, 1)
  const dias = Math.floor((hoje - inicioAno) / 86400000)

  return Math.ceil((dias + inicioAno.getDay() + 1) / 7)
}

// ==========================
// 🔄 GERAR SEMANAS
// ==========================
function gerarSemanas() {

  const semanaAtual = getSemanaAtual()

  return [
    (semanaAtual - 3).toString(),
    (semanaAtual - 2).toString(),
    (semanaAtual - 1).toString(),
    semanaAtual.toString()
  ]
}

// ==========================
// 🔄 SELECIONAR INDICADOR
// ==========================
function carregarIndicador(indicador) {

  localStorage.setItem("indicador", indicador)

  mostrar("preencher")
}

// ==========================
// 📊 CARREGAR TABELA
// ==========================
async function carregarTabela() {

  try {

    indicadorSelecionado = localStorage.getItem("indicador")

    if (!indicadorSelecionado) {
      document.getElementById("conteudo").innerHTML = `
        <h2>📥 Preenchimento</h2>
        <p>Escolha um indicador no menu lateral.</p>
      `
      return
    }

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

    // 🔥 mapa de performance
    const mapa = {}

    resultados.forEach(r => {
      mapa[`${r.loja}-${r.semana}`] = r
    })

    document.getElementById("conteudo").innerHTML =
      montarHTMLTabela(lojas, mapa, semanas)

  } catch (erro) {
    console.error("Erro:", erro)
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
            <th>Loja</th>
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
// 🧱 LINHA
// ==========================
function montarLinha(loja, mapa, semanas) {

  const nomeLoja = `${loja.codigo} - ${loja.nome}`

  let html = `<tr><td class="col-loja">${nomeLoja}</td>`

  semanas.forEach(semana => {

    const reg = mapa[`${nomeLoja}-${semana}`]
    const valor = reg?.valor ?? ""

    html += `
      <td>
        <input
          type="number"
          step="0.01"
          value="${valor}"
          onblur="salvarValor('${nomeLoja}', '${semana}', this.value)"
        >
      </td>
    `
  })

  html += `</tr>`

  return html
}

// ==========================
// 💾 SALVAR
// ==========================
async function salvarValor(loja, semana, valor) {

  if (!valor) return

  const numero = Number(valor)
  if (isNaN(numero)) return

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
  } else {
    await supabase
      .from("resultados")
      .insert([{
        loja,
        semana,
        indicador: indicadorSelecionado,
        valor: numero
      }])
  }
}