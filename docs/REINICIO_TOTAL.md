# Reinicio total — 28 de noviembre de 2026

El juego actualizado ejecuta un reinicio local único (`coraline-reset-2026-11-28`): elimina perfiles locales, scores v1/v2/v3, progreso de niveles, economía/inventario de ratones y colas/cachés locales de sincronización. Conserva preferencias de audio y conexión Supabase.

Al iniciar, el juego obliga a crear un perfil escribiendo un nombre (1–18 caracteres); no hay perfil preseleccionado ni se puede cerrar el diálogo sin crear uno. Los puntajes locales quedan vacíos.

## Reinicio del ranking compartido (Supabase)
Para borrar también los perfiles y scores remotos, abre Supabase > SQL Editor y ejecuta `reset_total_2026-11-28.sql`. **Es una acción irreversible**: elimina los registros de `public.scores` y `public.profiles` y, si existe, la tabla antigua `public.coraline_scores`.

## Distribución
Publica el nuevo HTML/build para que cada jugador descargue/abra la versión actualizada. El reinicio local se ejecuta al cargar la versión nueva; copias antiguas no recibirán este reinicio hasta actualizarse.
