-- ============================================================
-- 🔍 ESTRUTURA DA TABELA painel_ouro_areas
-- ------------------------------------------------------------
-- Rode no SQL Editor para ver as colunas e as áreas já cadastradas.
-- Precisamos disso para cadastrar a área 'consolidado' corretamente
-- antes de importar (a FK fk_resultado_area exige que ela exista).
-- ============================================================

-- 1) Colunas da tabela (nomes e tipos)
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'painel_ouro_areas'
order by ordinal_position;

-- 2) Áreas já cadastradas (para seguir o mesmo padrão)
select * from public.painel_ouro_areas order by 1;
