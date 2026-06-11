-- ============================================================
-- 👑 PAINEL DE OURO — Renomear coluna "peso" → "Ponto"
-- ------------------------------------------------------------
-- Rode no SQL Editor do Supabase.
-- ⚠️ A coluna fica com P MAIÚSCULO, então no banco ela SEMPRE
--    precisa ser referenciada entre aspas duplas: "Ponto".
--    (O código do app já foi ajustado para isso.)
--
-- Seguro de rodar: só renomeia se a coluna "peso" existir e
-- a "Ponto" ainda não existir.
-- ============================================================

-- Tabela principal usada pelo app (config de indicadores):
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'painel_ouro_indicadores_config' and column_name = 'peso'
  ) and not exists (
    select 1 from information_schema.columns
    where table_name = 'painel_ouro_indicadores_config' and column_name = 'Ponto'
  ) then
    alter table painel_ouro_indicadores_config rename column peso to "Ponto";
    raise notice 'painel_ouro_indicadores_config: peso -> "Ponto" OK';
  else
    raise notice 'painel_ouro_indicadores_config: nada a fazer (ja renomeada ou inexistente)';
  end if;
end $$;

-- ------------------------------------------------------------
-- Caso EXISTAM outras tabelas do painel com coluna "peso"
-- (ex.: alguma tabela auxiliar que você criou), descomente e
-- ajuste o nome abaixo conforme necessário:
-- ------------------------------------------------------------
-- do $$
-- begin
--   if exists (select 1 from information_schema.columns
--              where table_name = 'NOME_DA_TABELA' and column_name = 'peso')
--   and not exists (select 1 from information_schema.columns
--              where table_name = 'NOME_DA_TABELA' and column_name = 'Ponto') then
--     alter table NOME_DA_TABELA rename column peso to "Ponto";
--   end if;
-- end $$;

-- ------------------------------------------------------------
-- CHECAGEM: lista todas as tabelas do painel que ainda têm "peso"
-- (se retornar vazio, todas já estão como "Ponto")
-- ------------------------------------------------------------
select table_name, column_name
from information_schema.columns
where table_name like 'painel_ouro%'
  and column_name in ('peso', 'Ponto')
order by table_name, column_name;
