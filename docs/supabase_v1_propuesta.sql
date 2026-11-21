-- PROPUESTA para v1.x — NO se ejecuta ni se conecta todavía. No reemplaza a supabase_setup.sql.
-- Modelo equivalente al que hoy se guarda en localStorage (coraline_profiles, coraline_scores_v3, cor_bprog_*).
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),        -- UUID del perfil (el mismo que usa el juego)
  auth_user uuid references auth.users(id) on delete set null,
  nickname text not null check (char_length(nickname) between 1 and 18),
  is_special boolean not null default false,             -- perfil especial (Carolina); lo marca el dueño, no el apodo
  preferences jsonb not null default '{}'::jsonb,
  greetings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  game text not null check (game in ('bubble','tetris','blocks','snake','kong','runner','runner3d')),
  mode text not null,                                    -- levels|endless|rescue|classic|walls|wrap|story
  diff text not null check (diff in ('facil','normal','dificil','experto')),
  score integer not null check (score >= 0),
  level integer,
  created_at timestamptz not null default now()
);
create index if not exists scores_rank_idx on public.scores (game, mode, diff, score desc);

create table if not exists public.bubble_progress (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  level integer not null check (level between 1 and 30),
  stars smallint not null check (stars between 0 and 3),
  primary key (profile_id, level)
);

-- Ranking: mejor puntaje por perfil, juego, modo y dificultad, con su posición global.
create or replace view public.leaderboard as
select s.game, s.mode, s.diff, s.profile_id, p.nickname, max(s.score) as best,
       rank() over (partition by s.game, s.mode, s.diff order by max(s.score) desc) as position
from public.scores s join public.profiles p on p.id = s.profile_id
group by s.game, s.mode, s.diff, s.profile_id, p.nickname;

alter table public.profiles enable row level security;
alter table public.scores enable row level security;
alter table public.bubble_progress enable row level security;
create policy "perfiles visibles" on public.profiles for select using (true);
create policy "crear perfil propio" on public.profiles for insert with check (auth.uid() = auth_user);
create policy "editar perfil propio" on public.profiles for update using (auth.uid() = auth_user) with check (auth.uid() = auth_user and is_special = (select is_special from public.profiles where id = profiles.id));
create policy "puntajes visibles" on public.scores for select using (true);
create policy "guardar puntaje propio" on public.scores for insert with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user = auth.uid()));
create policy "progreso propio" on public.bubble_progress for all using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user = auth.uid()));
-- is_special solo lo cambia el administrador (service role) desde el panel de Supabase.
