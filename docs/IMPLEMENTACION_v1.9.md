# Implementación v1.9.0 — Experto restaurado

## Cambios
- Cuatro dificultades disponibles: Fácil, Medio, Difícil y Experto.
- Experto se representa con `diff='experto'` y se guarda/consulta separado.
- Eliminado el mapeo de scores Expertos a Difícil que ocurría al leer el almacenamiento local.
- UI de selección añade Experto; filtros de récords incluyen Experto.
- Supabase schema v1.3 ya acepta `experto`; no se requiere migración SQL para esta restauración.
- Preferencia de dificultad migrada con flag `cor_diff_v4`, manteniendo valor Experto cuando sea válido.
- Block Blast tiene perfil de piezas Expertas y mantiene verificación DFS de solvencia de las manos.
- Otros minijuegos usan sus perfiles de cuarto nivel ya disponibles y se ajustaron etiquetas/descriciones.

## Balance de Experto
Experto es exigente: menos recursos/ayudas, velocidad y presión superiores, menos corazones y obstáculos más exigentes. Se evita hacer Tetris injusto reduciendo las opciones de hueco de subida por debajo del perfil Difícil; Block Blast mantiene las manos legales y comprobadas.

## Supabase
La tabla `scores` y su check constraint del esquema `supabase_setup_v1.3.sql` ya aceptan `experto`. Los registros antiguos se mantienen intactos. No se borran ni se cambian datos remotos.

## Validación
Ejecutar `npm test` y `npm run build`. Las pruebas de navegador no se han ejecutado en este entorno.
