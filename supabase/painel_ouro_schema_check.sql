-- ============================================================
-- 👑 PAINEL DE OURO — Verificação e correção do schema no Supabase
-- ------------------------------------------------------------
-- Rode este script no SQL Editor do Supabase.
-- Ele NÃO apaga dados: usa CREATE TABLE IF NOT EXISTS e
-- ADD COLUMN/CONSTRAINT IF NOT EXISTS. Pode rodar quantas vezes quiser.
--
-- Garante exatamente o que o código do app espera:
--   • tabela painel_ouro_lojas            (codigo, nome, ativo)
--   • tabela painel_ouro_indicadores_config (area_slug, nome, peso, ordem, ativo)
--   • tabela painel_ouro_resultados       (loja_codigo, area_slug, ano, mes,
--                                          pontuacao_obtida, pontuacao_maxima,
--                                          sub_resultados, lancado_por, lancado_em, ativo)
--   • UNIQUE (loja_codigo, area_slug, ano, mes)  ← essencial p/ o upsert funcionar
-- ============================================================

-- ----------- 1. LOJAS -----------
create table if not exists painel_ouro_lojas (
  codigo text primary key,
  nome   text not null,
  ativo  boolean not null default true
);

-- ----------- 2. CONFIG DE INDICADORES -----------
create table if not exists painel_ouro_indicadores_config (
  id         bigint generated always as identity primary key,
  area_slug  text not null,
  nome       text not null,
  "Ponto"    numeric not null default 0,
  ordem      int not null default 0,
  ativo      boolean not null default true
);
-- Se a tabela já existia com a coluna antiga "peso", renomeia para "Ponto":
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_name='painel_ouro_indicadores_config' and column_name='peso')
  and not exists (select 1 from information_schema.columns
             where table_name='painel_ouro_indicadores_config' and column_name='Ponto') then
    alter table painel_ouro_indicadores_config rename column peso to "Ponto";
  end if;
end $$;

-- ----------- 3. RESULTADOS (onde tudo é salvo) -----------
create table if not exists painel_ouro_resultados (
  id               bigint generated always as identity primary key,
  loja_codigo      text not null,
  area_slug        text not null,
  ano              int  not null,
  mes              int  not null,
  pontuacao_obtida  numeric not null default 0,
  pontuacao_maxima  numeric not null default 0,
  sub_resultados    jsonb   not null default '[]'::jsonb,
  lancado_por       uuid,
  lancado_em        timestamptz default now(),
  ativo             boolean not null default true
);

-- Garante colunas mesmo se a tabela já existia sem elas:
alter table painel_ouro_resultados add column if not exists pontuacao_obtida numeric not null default 0;
alter table painel_ouro_resultados add column if not exists pontuacao_maxima numeric not null default 0;
alter table painel_ouro_resultados add column if not exists sub_resultados   jsonb   not null default '[]'::jsonb;
alter table painel_ouro_resultados add column if not exists lancado_por      uuid;
alter table painel_ouro_resultados add column if not exists lancado_em       timestamptz default now();
alter table painel_ouro_resultados add column if not exists ativo            boolean not null default true;

-- ----------- 4. CONSTRAINT ÚNICA (o ponto crítico do upsert) -----------
-- Sem isso, "Salvar no banco" falha com erro de ON CONFLICT.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'painel_ouro_resultados_unico'
  ) then
    alter table painel_ouro_resultados
      add constraint painel_ouro_resultados_unico
      unique (loja_codigo, area_slug, ano, mes);
  end if;
end $$;

-- ----------- 5. (Opcional) RLS — habilita acesso pelo app -----------
-- Se o RLS estiver ligado e SEM políticas, o app não lê nem grava nada.
-- As políticas abaixo liberam para qualquer usuário AUTENTICADO.
-- Ajuste conforme sua regra de permissão real.
alter table painel_ouro_resultados      enable row level security;
alter table painel_ouro_lojas           enable row level security;
alter table painel_ouro_indicadores_config enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='painel_ouro_resultados' and policyname='po_res_rw') then
    create policy po_res_rw on painel_ouro_resultados
      for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='painel_ouro_lojas' and policyname='po_lojas_r') then
    create policy po_lojas_r on painel_ouro_lojas
      for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='painel_ouro_indicadores_config' and policyname='po_ind_r') then
    create policy po_ind_r on painel_ouro_indicadores_config
      for select to authenticated using (true);
  end if;
end $$;

-- ============================================================
-- 6. CHECAGEM — rode estas queries para CONFERIR o que existe hoje
-- ============================================================

-- 6a. Colunas da tabela de resultados (devem bater com a lista acima):
select column_name, data_type
from information_schema.columns
where table_name = 'painel_ouro_resultados'
order by ordinal_position;

-- 6b. A constraint única existe?  (precisa retornar 1 linha)
select conname
from pg_constraint
where conname = 'painel_ouro_resultados_unico';

-- 6c. Quantos lançamentos já estão salvos, por área:
select area_slug, ano, mes, count(*) as lojas, sum(pontuacao_obtida) as pontos
from painel_ouro_resultados
where ativo = true
group by area_slug, ano, mes
order by ano, mes, area_slug;
