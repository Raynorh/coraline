-- REINICIO TOTAL DE CORALINE (28-11-2026)
-- Ejecutar manualmente en Supabase > SQL Editor > Run.
-- Borra perfiles y puntajes ONLINE actuales. Es irreversible.
-- No modifica tablas de configuración, ni secretos, ni preferencias del juego.
truncate table public.scores, public.profiles cascade;
-- Si existe una tabla legacy de puntajes, también vaciarla:
do $$ begin
  if to_regclass('public.coraline_scores') is not null then
    execute 'truncate table public.coraline_scores';
  end if;
end $$;
