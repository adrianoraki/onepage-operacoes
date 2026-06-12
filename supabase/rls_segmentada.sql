-- ============================================================
-- 🔒 RLS — OnePage Expert (LGPD Art. 46)
-- ------------------------------------------------------------
-- Modelo: qualquer usuário AUTENTICADO lê/grava os dados operacionais
-- (o controle fino de edição fica nas permissões do app). A proteção
-- foca em: bloquear anônimos, auditoria imutável, cadastro só do próprio.
--
-- Resiliente: cada bloco roda dentro de um DO que ignora tabelas que
-- não existam, então o script não quebra no meio.
-- Rode o arquivo inteiro no SQL Editor do Supabase.
-- ============================================================

-- ---------- Funções auxiliares ----------
create or replace function public.perfil_do_usuario()
returns text language sql stable security definer as $$
  select u.perfil from public.usuarios u
  where u.auth_user_id = auth.uid() limit 1
$$;

create or replace function public.eh_admin()
returns boolean language sql stable security definer as $$
  select coalesce(public.perfil_do_usuario() in ('master','admin'), false)
$$;

-- Resolve e-mail por matrícula (login por matrícula, antes de autenticar)
create or replace function public.email_por_matricula(p_matricula text)
returns text language sql stable security definer as $$
  select u.email from public.usuarios u
  where lower(u.matricula) = lower(p_matricula) limit 1
$$;
grant execute on function public.email_por_matricula(text) to anon, authenticated;

-- ---------- Aplicação resiliente das policies ----------
do $rls$
declare
  t text;
begin
  -- Tabelas de DADOS (leitura+escrita p/ autenticado): RW total
  foreach t in array array['painel_ouro_resultados','lojas','resultados'] loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists %I on public.%I', t||'_rw', t);
      execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)', t||'_rw', t);
    end if;
  end loop;

  -- Tabelas de CONFIG (todos leem, só admin escreve)
  foreach t in array array['painel_ouro_lojas','painel_ouro_indicadores_config'] loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists %I on public.%I', t||'_select', t);
      execute format('drop policy if exists %I on public.%I', t||'_write', t);
      execute format('create policy %I on public.%I for select to authenticated using (true)', t||'_select', t);
      execute format('create policy %I on public.%I for all to authenticated using (public.eh_admin()) with check (public.eh_admin())', t||'_write', t);
    end if;
  end loop;

  -- AUDITORIA (grava autenticado, lê admin, ninguém edita/apaga)
  if to_regclass('public.auditoria') is not null then
    alter table public.auditoria enable row level security;
    drop policy if exists aud_insert on public.auditoria;
    drop policy if exists aud_select on public.auditoria;
    create policy aud_insert on public.auditoria for insert to authenticated with check (true);
    create policy aud_select on public.auditoria for select to authenticated using (public.eh_admin());
  end if;

  -- USUARIOS (cada um vê o próprio; admin gerencia; auto-vínculo no 1º login)
  if to_regclass('public.usuarios') is not null then
    alter table public.usuarios enable row level security;
    drop policy if exists usuarios_self_select on public.usuarios;
    drop policy if exists usuarios_admin_write on public.usuarios;
    drop policy if exists usuarios_self_link on public.usuarios;
    create policy usuarios_self_select on public.usuarios
      for select to authenticated
      using (auth_user_id = auth.uid() or public.eh_admin());
    create policy usuarios_admin_write on public.usuarios
      for all to authenticated
      using (public.eh_admin()) with check (public.eh_admin());
    create policy usuarios_self_link on public.usuarios
      for update to authenticated
      using (auth_user_id is null and lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
      with check (auth_user_id = auth.uid());
  end if;
end
$rls$;

-- ---------- Verificação ----------
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('painel_ouro_resultados','painel_ouro_lojas',
    'painel_ouro_indicadores_config','auditoria','usuarios','lojas','resultados')
order by tablename, policyname;
