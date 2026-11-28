# Coraline v1.9.1 — Reinicio total

## Reinicio para todos los jugadores
- Nueva época global de reinicio local: borra perfiles, scores locales, progreso, recursos/inventario y colas de scores anteriores en el navegador actualizado.
- Obliga a crear perfil con nombre (1–18 caracteres) antes de jugar; no permite cerrar el selector sin perfil.
- Incluye SQL separado para vaciar scores y perfiles remotos de Supabase (requiere ejecutarlo manualmente).
- Conserva ajustes de audio y conexión de Supabase.

# Coraline v1.9.0

## Restauración de Experto y balance
- Restablecida la cuarta dificultad (Experto) en selección y scores.
- Récords Expertos se conservan y no se reclasifican como Difícil.
- Experto añade presión gradual, pero no fuerza piezas imposibles.
- Block Blast: distribución de piezas específica de Experto, apertura menos congestionada y DFS sigue verificando la jugabilidad de cada mano.
- Los scores se muestran filtrados por dificultad; Supabase ya admite `experto` en el esquema SQL existente.
- Dificultad de minijuegos de tiempo, estrategia y supervivencia usa sus perfiles de cuarto nivel ya definidos, con ajustes de balance.
