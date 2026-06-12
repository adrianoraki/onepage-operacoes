-- ============================================================
-- 🗓️ RETENÇÃO E ELIMINAÇÃO DE DADOS (LGPD Art. 16)
-- ------------------------------------------------------------
-- Define prazo de guarda para logs de auditoria e remove registros
-- expirados automaticamente. Ajuste os PRAZOS conforme a política
-- interna / orientação jurídica da empresa.
--
-- ⚠️ DEFINIÇÃO DE NEGÓCIO: o prazo abaixo (12 meses para auditoria)
-- é um EXEMPLO. Confirme com o jurídico/DPO o prazo adequado.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Função que apaga logs de auditoria mais antigos que o prazo
-- ------------------------------------------------------------
create or replace function public.expurgar_auditoria_antiga(meses int default 12)
returns integer
language plpgsql security definer
as $$
declare
  removidos integer;
begin
  delete from public.auditoria
  where criado_em < (now() - make_interval(months => meses));
  get diagnostics removidos = row_count;
  return removidos;
end;
$$;

-- Execução manual (rode quando quiser, ou agende — ver passo 2):
-- select public.expurgar_auditoria_antiga(12);

-- ------------------------------------------------------------
-- 2) Agendamento automático (requer extensão pg_cron)
--    No Supabase: Database -> Extensions -> habilite "pg_cron"
-- ------------------------------------------------------------
-- create extension if not exists pg_cron;
--
-- -- roda todo dia 03:00 e apaga auditoria com mais de 12 meses
-- select cron.schedule(
--   'expurgo-auditoria-diario',
--   '0 3 * * *',
--   $$ select public.expurgar_auditoria_antiga(12); $$
-- );

-- ------------------------------------------------------------
-- 3) (Opcional) Anonimizar usuários inativos há muito tempo
--    Em vez de apagar (que pode quebrar integridade de logs),
--    substitui PII por valores neutros após X meses sem acesso.
--    Requer uma coluna ultimo_acesso na tabela usuarios.
-- ------------------------------------------------------------
-- create or replace function public.anonimizar_inativos(meses int default 24)
-- returns integer
-- language plpgsql security definer
-- as $$
-- declare afetados integer;
-- begin
--   update public.usuarios
--      set nome = 'Usuário',
--          sobrenome = 'Anonimizado',
--          email = 'anon+' || id || '@exemplo.invalido',
--          matricula = null,
--          ativo = false
--    where ultimo_acesso < (now() - make_interval(months => meses))
--      and email not like 'anon+%';
--   get diagnostics afetados = row_count;
--   return afetados;
-- end;
-- $$;

-- ------------------------------------------------------------
-- 4) (Opcional) Limpar resultados de períodos muito antigos
--    Ex.: manter só os últimos 3 anos de lançamentos.
-- ------------------------------------------------------------
-- delete from public.painel_ouro_resultados
-- where ano < (extract(year from now())::int - 3);
