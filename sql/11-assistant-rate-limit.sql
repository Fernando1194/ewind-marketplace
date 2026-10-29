-- Limite de uso do assistente do site (/api/assistant).
-- Migração aditiva: cria uma tabela e uma função. Não altera nada existente.
--
-- A chave guardada é um hash (IP + data + sal), nunca o IP em claro, e as linhas
-- com mais de 2 dias são apagadas a cada chamada.
--
-- A função é chamada pelo endpoint com a chave anon. Isso significa que quem tem a
-- chave pública pode chamá-la direto e gastar a cota do dia (o assistente fica
-- indisponível), mas NÃO gera custo: o custo é limitado pelo teto global.

create table if not exists public.assistant_usage (
  day   date    not null,
  key   text    not null,
  hits  integer not null default 0,
  primary key (day, key)
);

alter table public.assistant_usage enable row level security;
-- sem policies: ninguém lê nem escreve direto; só a função (security definer).

create or replace function public.assistant_hit(p_key text, p_ip_limit integer, p_global_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day  date := (now() at time zone 'America/Sao_Paulo')::date;
  v_ip   integer;
  v_glob integer;
begin
  if p_key is null or length(p_key) < 16 or length(p_key) > 128 then
    return false;
  end if;
  if p_ip_limit < 1 or p_global_limit < 1 then
    return false;
  end if;

  delete from public.assistant_usage where day < v_day - 2;

  insert into public.assistant_usage (day, key, hits) values (v_day, p_key, 1)
  on conflict (day, key) do update set hits = public.assistant_usage.hits + 1
  returning hits into v_ip;
  if v_ip > p_ip_limit then
    return false;
  end if;

  insert into public.assistant_usage (day, key, hits) values (v_day, '__global__', 1)
  on conflict (day, key) do update set hits = public.assistant_usage.hits + 1
  returning hits into v_glob;
  if v_glob > p_global_limit then
    return false;
  end if;

  return true;
end;
$$;

revoke all on function public.assistant_hit(text, integer, integer) from public;
grant execute on function public.assistant_hit(text, integer, integer) to anon, authenticated;
