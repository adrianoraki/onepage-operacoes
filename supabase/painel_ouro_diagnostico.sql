-- ============================================================
-- 👑 PAINEL DE OURO — DIAGNÓSTICO (somente leitura)
-- ------------------------------------------------------------
-- Cole TUDO no SQL Editor do Supabase e rode.
-- NÃO altera nada — só mostra o estado atual do banco.
-- Compare os resultados com o "ESPERADO" descrito em cada bloco.
-- ============================================================

-- 1) As 3 tabelas existem?  (esperado: 3 linhas)
select '1. TABELAS' as bloco, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('painel_ouro_lojas','painel_ouro_indicadores_config','painel_ouro_resultados')
order by table_name;

-- 2) Colunas da tabela de resultados
--    ESPERADO: loja_codigo, area_slug, ano, mes, pontuacao_obtida,
--              pontuacao_maxima, sub_resultados (jsonb), lancado_por,
--              lancado_em, ativo
select '2. COLUNAS resultados' as bloco, column_name, data_type
from information_schema.columns
where table_name = 'painel_ouro_resultados'
order by ordinal_position;

-- 3) A CONSTRAINT ÚNICA existe?  (CRÍTICA p/ salvar funcionar)
--    ESPERADO: 1 linha com as 4 colunas (loja_codigo, area_slug, ano, mes)
select '3. CONSTRAINT UNICA' as bloco,
       conname as nome_constraint,
       pg_get_constraintdef(oid) as definicao
from pg_constraint
where conrelid = 'painel_ouro_resultados'::regclass
  and contype = 'u';

-- 4) A coluna de indicadores está como "peso" ou "Ponto"?
--    (mostra qual nome existe hoje)
select '4. COLUNA peso/Ponto' as bloco, column_name
from information_schema.columns
where table_name = 'painel_ouro_indicadores_config'
  and column_name in ('peso','Ponto');

-- 5) RLS está ligado? Tem políticas?  (se RLS on e SEM política, o app não grava)
select '5. RLS' as bloco, c.relname as tabela, c.relrowsecurity as rls_ligado
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('painel_ouro_lojas','painel_ouro_indicadores_config','painel_ouro_resultados');

select '5b. POLITICAS' as bloco, tablename, policyname, cmd
from pg_policies
where tablename like 'painel_ouro%'
order by tablename, policyname;

-- 6) Quantos lançamentos já existem (por área/período)
select '6. DADOS SALVOS' as bloco, area_slug, ano, mes, count(*) as qtd_lojas
from painel_ouro_resultados
where ativo = true
group by area_slug, ano, mes
order by ano, mes, area_slug;

-- 7) Quantas lojas estão cadastradas
select '7. LOJAS' as bloco, count(*) as total_lojas from painel_ouro_lojas;
