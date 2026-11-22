-- CORALINE v1.3.0 — ranking compartido (Carolina + tú)
-- Pasos: Supabase > SQL Editor > New query > pega TODO este archivo > Run.
-- Es idempotente: puedes ejecutarlo más de una vez. No toca la tabla antigua coraline_scores.
-- Seguridad (juego familiar): el navegador usa SOLO la clave pública "anon" (publishable). Con RLS activado
-- cualquiera puede LEER los rankings y AGREGAR puntajes, pero nadie puede borrar/editar puntajes ni marcarse
-- como perfil especial (is_special solo lo cambias tú desde el panel/SQL).

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key,                                   -- UUID del perfil (el mismo que usa el juego)
  nickname text not null check (char_length(nickname) between 1 and 18),
  is_special boolean not null default false,             -- perfil de Carolina: lo marcas tú (ver abajo)
  created_at timestamptz not null default now()
);

create table if not exists public.scores (
  id uuid primary key,                                   -- lo genera el juego: evita duplicados al reintentar
  profile_id uuid not null references public.profiles(id) on delete cascade,
  game text not null check (game in ('bubble','tetris','blocks','snake','kong','runner','runner3d')),
  mode text not null check (char_length(mode) between 1 and 20),
  diff text not null check (diff in ('facil','normal','dificil','experto')),
  score integer not null check (score >= 0 and score <= 10000000),
  level integer,
  played_at timestamptz not null default now()
);
create index if not exists scores_rank_idx on public.scores (game, mode, diff, score desc);
create index if not exists scores_profile_idx on public.scores (profile_id);

-- Rankings: mejor puntaje por jugador (por dificultad y en total).
create or replace view public.leaderboard as
select s.game, s.mode, s.diff, s.profile_id, p.nickname, p.is_special, max(s.score) as best,
       rank() over (partition by s.game, s.mode, s.diff order by max(s.score) desc) as position
from public.scores s join public.profiles p on p.id = s.profile_id
group by s.game, s.mode, s.diff, s.profile_id, p.nickname, p.is_special;

create or replace view public.leaderboard_all as
select s.game, s.mode, s.profile_id, p.nickname, p.is_special, max(s.score) as best,
       rank() over (partition by s.game, s.mode order by max(s.score) desc) as position
from public.scores s join public.profiles p on p.id = s.profile_id
group by s.game, s.mode, s.profile_id, p.nickname, p.is_special;

alter table public.profiles enable row level security;
alter table public.scores enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.scores, public.leaderboard, public.leaderboard_all to anon, authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;
revoke insert, update, delete on public.scores from anon, authenticated;
grant insert (id, nickname) on public.profiles to anon, authenticated;   -- is_special queda siempre en false
grant update (nickname) on public.profiles to anon, authenticated;       -- solo se puede cambiar el apodo
grant insert (id, profile_id, game, mode, diff, score, level, played_at) on public.scores to anon, authenticated;

drop policy if exists "perfiles visibles" on public.profiles;
create policy "perfiles visibles" on public.profiles for select to anon, authenticated using (true);
drop policy if exists "crear perfil" on public.profiles;
create policy "crear perfil" on public.profiles for insert to anon, authenticated with check (is_special = false);
drop policy if exists "cambiar apodo" on public.profiles;
create policy "cambiar apodo" on public.profiles for update to anon, authenticated using (true) with check (is_special = (select p.is_special from public.profiles p where p.id = profiles.id));
drop policy if exists "puntajes visibles" on public.scores;
create policy "puntajes visibles" on public.scores for select to anon, authenticated using (true);
drop policy if exists "guardar puntaje" on public.scores;
create policy "guardar puntaje" on public.scores for insert to anon, authenticated with check (score between 0 and 10000000);

-- ===== Después de que Carolina haya jugado una vez con la conexión activa =====
-- Marca su perfil como especial (verás 💛 junto a su nombre en el ranking). Busca su id así:
--   select id, nickname, created_at from public.profiles order by created_at;
-- y luego:
--   update public.profiles set is_special = true where id = 'PEGA-AQUI-EL-UUID-DE-CAROLINA';
