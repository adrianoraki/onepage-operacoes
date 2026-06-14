-- ============================================================
-- ⏰ AGENDAMENTO MENSAL DA AUDITORIA LGPD (pg_cron)
-- ------------------------------------------------------------
-- Faz a Edge Function "auditoria-lgpd" rodar 1x por mês.
-- Alternativa ao agendamento pela interface do Supabase.
--
-- Pré-requisitos:
--   1) Extensões pg_cron e pg_net habilitadas no projeto
--      (Supabase → Database → Extensions → habilitar pg_cron e pg_net)
--   2) A Edge Function "auditoria-lgpd" já publicada (deploy)
--   3) Troque <PROJECT_REF> e <ANON_OR_SERVICE_KEY> abaixo
-- ============================================================

-- habilita as extensões (se ainda não estiverem)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- remove agendamento anterior com o mesmo nome (idempotente)
select cron.unschedule('auditoria-lgpd-mensal')
where exists (select 1 from cron.job where jobname = 'auditoria-lgpd-mensal');

-- agenda: todo dia 1 de cada mês às 03:00 UTC
select cron.schedule(
  'auditoria-lgpd-mensal',
  '0 3 1 * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/auditoria-lgpd',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON_OR_SERVICE_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- conferência: lista os agendamentos ativos
select jobname, schedule, active from cron.job where jobname = 'auditoria-lgpd-mensal';
