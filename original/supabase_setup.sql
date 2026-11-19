-- CORALINE v0.5.0 — ranking global
-- Ejecuta TODO este archivo en Supabase > SQL Editor > New query.

create table if not exists public.coraline_scores (
  id bigint generated always as identity primary key,
  nickname text not null check (char_length(nickname) between 1 and 18),
  game text not null check (game in ('bubble', 'tetris', 'blocks')),
  score integer not null check (score >= 0 and score <= 10000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists coraline_scores_player_game_uq
  on public.coraline_scores (lower(nickname), game);

alter table public.coraline_scores enable row level security;
grant usage on schema public to anon, authenticated;
grant select on public.coraline_scores to anon, authenticated;
drop policy if exists "Public can read Coraline leaderboard" on public.coraline_scores;
create policy "Public can read Coraline leaderboard"
  on public.coraline_scores for select
  to anon, authenticated
  using (true);

create or replace function public.record_coraline_score(
  p_nickname text,
  p_game text,
  p_score integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nickname text := left(btrim(coalesce(p_nickname, '')), 18);
begin
  if char_length(v_nickname) < 1 then
    raise exception 'El apodo no puede estar vacío';
  end if;
  if p_game not in ('bubble', 'tetris', 'blocks') then
    raise exception 'Juego no válido';
  end if;
  if p_score is null or p_score < 0 or p_score > 10000000 then
    raise exception 'Puntuación no válida';
  end if;

  insert into public.coraline_scores (nickname, game, score)
  values (v_nickname, p_game, p_score)
  on conflict (lower(nickname), game)
  do update set
    score = excluded.score,
    updated_at = now()
  where excluded.score > public.coraline_scores.score;
end;
$$;

revoke all on function public.record_coraline_score(text, text, integer) from public;
grant execute on function public.record_coraline_score(text, text, integer) to anon, authenticated;

create or replace function public.get_coraline_leaderboard(p_game text)
returns table (nickname text, score integer, updated_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select s.nickname, s.score, s.updated_at
  from public.coraline_scores as s
  where s.game = p_game
  order by s.score desc, s.updated_at asc, s.nickname asc
  limit 10;
$$;

revoke all on function public.get_coraline_leaderboard(text) from public;
grant execute on function public.get_coraline_leaderboard(text) to anon, authenticated;
