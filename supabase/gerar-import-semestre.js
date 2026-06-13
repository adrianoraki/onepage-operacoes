#!/usr/bin/env node
/* ============================================================
   📥 GERADOR DE IMPORTAÇÃO EM MASSA — Painel de Ouro
   ------------------------------------------------------------
   Gera SQL de importação da pontuação CONSOLIDADA (total por
   loja/mês) para painel_ouro_resultados, no 2º semestre de 2025.

   À PROVA DE FORMATO DE CÓDIGO: o SQL casa o código informado
   tanto com '44' quanto com '044' (normaliza removendo zeros à
   esquerda dos dois lados), então funciona não importa como o
   banco guarda.

   Uso:
       node gerar-import-semestre.js > import_jul_dez_2025.sql

   ⚠️ AJUSTE a constante MAXIMO_MES com o valor que você informar.
   ============================================================ */

const ANO = 2025;
const AREA = "consolidado";

// 🔧 PONTUAÇÃO MÁXIMA POR MÊS (mesma p/ todos os meses).
// >>> AJUSTAR com o valor real que o Luis vai informar <<<
const MAXIMO_MES = 100; // nota mensal de 0 a 100 (semestre=600, ano=1200)

// Dados: [codigo, nome, jul, ago, set, out, nov, dez]
const DADOS = [
  ["44","JABOATAO",        36.5,40.0,26.5,26.5,55.5,65.5],
  ["46","CARUARU I",       43,  43.5,36.5,69.5,55.0,48.5],
  ["76","MENINO MARCELO",  34.5,49.0,40,  26.5,67.0,54.0],
  ["77","JOAO PESSOA",     26.0,37.5,33,  58.5,43.5,64.0],
  ["83","CAMPINA GDE",     18,  40.5,41,  62.0,51.5,44.0],
  ["91","GARANHUNS",       26.0,46.0,41,  61.0,64.0,56.0],
  ["107","IMBIRIBEIRA",    36.5,43.0,27,  68.0,44.0,62.0],
  ["109","PAULISTA",       32,  46.5,43,  39.5,65.0,48.0],
  ["114","NATAL",          22.5,42.0,36.5,35.0,69.0,52.5],
  ["119","CAMARAGIBE",     47,  34.0,23.5,59.5,44.0,66.5],
  ["120","NATAL COTEMINAS",26,  44.0,41.5,65.0,56.0,67.5],
  ["138","SERRA TALHADA",  40.0,67.0,60.5,57.5,43.5,35.5],
  ["152","ARAPIRACA",      45,  47.0,55,  55.5,40.0,45.0],
  ["163","CARUARU II",     31,  47.5,50,  41.0,46.5,48.0],
  ["179","MACEIO",         38,  43.5,38,  26.0,42.5,43.0],
  ["198","CABO STO AGOSTINHO",26.0,42.0,31,31.5,41.0,39.0],
  ["204","AV RECIFE",      26.5,31.5,39,  34.0,43.0,48.0],
  ["207","CABEDELO",       35,  42.5,21,  56.0,33.5,38.0],
  ["238","OLINDA",         18.5,29.5,32,  57.5,70.0,65.0],
  ["262","BOA VIAGEM",     42,  30.0,54,  52.0,50.5,59.0],
  ["268","MARIA LACERDA",  25.5,48.0,39.5,39.0,63.5,53.5],
  ["284","BENFICA",        57.5,42.0,49,  55.0,61.5,57.0],
  ["289","FAROL",          39.5,50.0,66.5,62.0,41.5,44.5],
  ["290","MANGABEIRAS",    34.0,32.5,33,  54.0,38.0,72.0],
  ["298","PONTA NEGRA",    36.5,47.0,37.5,48.5,46.0,41.5],
  ["300","EPITACIO PESSOA",38.5,54.0,48.5,55.5,72.5,49.5],
  ["305","CG MIRANTE",     64,  46.0,62,  57.5,36.5,69.0],
  ["333","MOSSORO",        39.5,45.0,39,  59.5,60.5,65.0],
];

const MESES = [7, 8, 9, 10, 11, 12];

// monta as linhas da CTE de dados
const valores = [];
DADOS.forEach((row) => {
  const cod = row[0];
  MESES.forEach((mes, idx) => {
    const obtido = row[2 + idx];
    if (obtido == null || obtido === "") return;
    valores.push(`    ('${cod}', ${mes}, ${obtido})`);
  });
});

const totalLinhas = valores.length;

console.log(`-- ============================================================`);
console.log(`-- 📥 IMPORTAÇÃO CONSOLIDADA — ${AREA} — ${ANO} (jul-dez)`);
console.log(`-- ${totalLinhas} registros (${DADOS.length} lojas × 6 meses)`);
console.log(`-- Máxima por mês: ${MAXIMO_MES}  ← confira antes de rodar!`);
console.log(`-- ⚠️ Este script APAGA as áreas detalhadas de jul-dez/${ANO} e as`);
console.log(`--    substitui pelo total consolidado. Tudo numa transação.`);
console.log(`-- ============================================================`);
console.log(``);
console.log(`begin;`);
console.log(``);
console.log(`-- 0) garante que a área "${AREA}" existe em painel_ouro_areas (FK)`);
console.log(`--    peso_maximo = ${MAXIMO_MES} (nota mensal de 0 a 100); ordem 99 = por último`);
console.log(`insert into public.painel_ouro_areas (slug, nome, peso_maximo, ordem, ativo)`);
console.log(`values ('${AREA}', 'Consolidado', ${MAXIMO_MES}, 99, true)`);
console.log(`on conflict (slug) do nothing;`);
console.log(``);
console.log(`-- 1) remove os lançamentos por área de jul-dez/${ANO}`);
console.log(`--    (todas as áreas, exceto um consolidado que já exista)`);
console.log(`delete from public.painel_ouro_resultados`);
console.log(`where ano = ${ANO} and mes between 7 and 12 and area_slug <> '${AREA}';`);
console.log(``);
console.log(`-- 2) importa o consolidado (total por loja/mês)`);
console.log(`with dados(cod, mes, obtido) as (`);
console.log(`  values`);
console.log(valores.join(",\n"));
console.log(`),`);
console.log(`-- resolve o código real da loja no banco (com ou sem zero à esquerda)`);
console.log(`resolvido as (`);
console.log(`  select l.codigo as loja_codigo, d.mes, d.obtido`);
console.log(`  from dados d`);
console.log(`  join public.painel_ouro_lojas l`);
console.log(`    on ltrim(l.codigo, '0') = ltrim(d.cod, '0')`);
console.log(`)`);
console.log(`insert into public.painel_ouro_resultados`);
console.log(`  (loja_codigo, area_slug, ano, mes, pontuacao_obtida, pontuacao_maxima, sub_resultados, ativo)`);
console.log(`select`);
console.log(`  r.loja_codigo, '${AREA}', ${ANO}, r.mes, r.obtido, ${MAXIMO_MES},`);
console.log(`  jsonb_build_array(jsonb_build_object(`);
console.log(`    'indicador','total','resultado',r.obtido,'Ponto',${MAXIMO_MES},'pontos',r.obtido)),`);
console.log(`  true`);
console.log(`from resolvido r`);
console.log(`on conflict (loja_codigo, area_slug, ano, mes)`);
console.log(`do update set`);
console.log(`  pontuacao_obtida = excluded.pontuacao_obtida,`);
console.log(`  pontuacao_maxima = excluded.pontuacao_maxima,`);
console.log(`  sub_resultados   = excluded.sub_resultados,`);
console.log(`  ativo = true;`);
console.log(``);
console.log(`-- 3) confira o resultado ANTES de confirmar:`);
console.log(`select mes, count(*) as lojas, round(sum(pontuacao_obtida)::numeric,1) as total_obtido`);
console.log(`from public.painel_ouro_resultados`);
console.log(`where ano = ${ANO} and area_slug = '${AREA}'`);
console.log(`group by mes order by mes;`);
console.log(``);
console.log(`-- Se os números acima baterem com o esperado, confirme:`);
console.log(`commit;`);
console.log(`-- Se algo estiver errado, rode em vez disso:  rollback;`);
console.log(``);
console.log(`-- conferência extra: total por loja (deve bater com a coluna TOTAL PONTOS)`);
console.log(`-- select loja_codigo, round(sum(pontuacao_obtida)::numeric,1) total`);
console.log(`-- from public.painel_ouro_resultados`);
console.log(`-- where ano = ${ANO} and area_slug = '${AREA}' group by loja_codigo order by total desc;`);
