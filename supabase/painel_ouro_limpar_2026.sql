-- ============================================================
-- 👑 PAINEL DE OURO — Limpar lançamentos de 2026
-- ------------------------------------------------------------
-- Apaga TODOS os registros do ano 2026 da tabela de resultados
-- (estavam zerados pelo cálculo antigo). Os dados de 2025 ficam intactos.
-- Rode no SQL Editor do Supabase.
-- ============================================================

-- 1) Confere ANTES o que será apagado (quantos registros de 2026 existem):
select 'ANTES — registros 2026' as etapa, area_slug, mes, count(*) as qtd
from painel_ouro_resultados
where ano = 2026
group by area_slug, mes
order by mes, area_slug;

-- 2) APAGA tudo de 2026 (delete físico — some de vez):
delete from painel_ouro_resultados
where ano = 2026;

-- 3) Confere DEPOIS (deve retornar vazio para 2026):
select 'DEPOIS — registros 2026 restantes' as etapa, count(*) as qtd
from painel_ouro_resultados
where ano = 2026;

-- 4) Mostra o que sobrou no banco (deve ser só 2025):
select 'RESTANTE no banco' as etapa, area_slug, ano, mes, count(*) as lojas, sum(pontuacao_obtida) as pontos
from painel_ouro_resultados
where ativo = true
group by area_slug, ano, mes
order by ano, mes, area_slug;
