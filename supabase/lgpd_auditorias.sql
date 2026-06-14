-- ============================================================
-- 🛡️ AUDITORIA LGPD AUTOMÁTICA — tabela de resultados e alertas
-- ------------------------------------------------------------
-- Guarda o resultado de cada auditoria mensal (rodada pela Edge
-- Function agendada) e os alertas que devem aparecer no sino do
-- Master. Rode este script uma vez no SQL Editor do Supabase.
-- ============================================================

create table if not exists public.lgpd_auditorias (
  id           uuid primary key default gen_random_uuid(),
  criado_em    timestamptz not null default now(),
  -- resumo
  pontuacao    int,                 -- 0..100 (% de conformidade)
  total_itens  int,
  ok_itens     int,
  alertas      int,                 -- nº de avisos
  criticos     int,                 -- nº de riscos críticos
  -- detalhe completo da auditoria (lista de verificações)
  detalhe      jsonb,
  -- controle do alerta no sino
  lido         boolean not null default false,  -- Master já viu?
  origem       text default 'edge-cron'         -- quem rodou
);

-- índice para buscar a auditoria mais recente rapidamente
create index if not exists idx_lgpd_auditorias_data
  on public.lgpd_auditorias (criado_em desc);

-- ------------------------------------------------------------
-- RLS: só MASTER lê; ninguém edita pelo cliente (só a Edge Function
-- escreve, usando a service_role que ignora RLS).
-- ------------------------------------------------------------
alter table public.lgpd_auditorias enable row level security;

-- função auxiliar: o usuário logado é master?
-- (reutiliza eh_admin/perfil se já existirem; aqui uma versão específica)
create or replace function public.eh_master()
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from public.usuarios u
    where u.auth_user_id = auth.uid()
      and lower(u.perfil) = 'master'
  );
$$;

-- política de leitura: apenas master
drop policy if exists lgpd_aud_select_master on public.lgpd_auditorias;
create policy lgpd_aud_select_master
  on public.lgpd_auditorias
  for select
  using ( public.eh_master() );

-- política de update: master pode marcar como lido
drop policy if exists lgpd_aud_update_master on public.lgpd_auditorias;
create policy lgpd_aud_update_master
  on public.lgpd_auditorias
  for update
  using ( public.eh_master() )
  with check ( public.eh_master() );

-- (insert fica a cargo da Edge Function via service_role, que ignora RLS)

-- ------------------------------------------------------------
-- conferência
-- ------------------------------------------------------------
select 'tabela lgpd_auditorias criada' as status;
