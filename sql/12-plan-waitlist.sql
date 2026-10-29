-- Lista de espera "Avisar quando abrir" da página de planos.
-- Migração aditiva: só cria uma tabela. Sem política de leitura: ninguém lê pela API
-- pública; o dono consulta pelo painel do Supabase. Dado pessoal (email) coletado com
-- finalidade única: avisar quando os planos pagos forem lançados.

create table if not exists public.plan_waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (length(email) between 5 and 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

create unique index if not exists plan_waitlist_email_key on public.plan_waitlist (lower(email));

alter table public.plan_waitlist enable row level security;

drop policy if exists "Qualquer pessoa pode entrar na lista" on public.plan_waitlist;
create policy "Qualquer pessoa pode entrar na lista"
  on public.plan_waitlist for insert to anon, authenticated
  with check (true);
