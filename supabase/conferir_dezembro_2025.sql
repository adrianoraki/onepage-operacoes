-- ============================================================
-- 🔍 O QUE EXISTE EM DEZEMBRO/2025 NO BANCO?
-- ------------------------------------------------------------
-- Rode no SQL Editor ANTES de importar, para entender se dez/2025
-- já tem dados (por área) e evitar duplicar com o "consolidado".
-- ============================================================

-- 1) Quais áreas estão lançadas em cada mês do 2º semestre de 2025?
select mes, area_slug, count(*) as lojas, round(sum(pontuacao_obtida)::numeric,1) as total
from public.painel_ouro_resultados
where ano = 2025 and mes between 7 and 12
group by mes, area_slug
order by mes, area_slug;

-- 2) Total por mês (somando todas as áreas) — é com isso que o ranking trabalha
select mes, count(distinct loja_codigo) as lojas, round(sum(pontuacao_obtida)::numeric,1) as total_geral
from public.painel_ouro_resultados
where ano = 2025 and mes between 7 and 12
group by mes order by mes;

-- 3) Existe alguma área 'consolidado' já? (se sim, importação anterior)
select mes, count(*) from public.painel_ouro_resultados
where ano = 2025 and area_slug = 'consolidado'
group by mes order by mes;
