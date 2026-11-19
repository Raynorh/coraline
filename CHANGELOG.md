# CHANGELOG — Coraline

## v0.8.0 — 2026-11-19 (47 pruebas automáticas OK; falta jugarla a mano, sobre todo en móvil)
**Bloques**
- La pieza que arrastras es 100 % opaca y siempre queda por encima del tablero (ya no se vuelve transparente sobre botones colocados).
- Arrastre fluido: sigue al puntero píxel a píxel; al soltar se ancla a la casilla más cercana de su posición real y solo se coloca si cabe (si no, vuelve a la bandeja).
- En móvil la pieza se dibuja ≥46 px por encima del dedo (no lo tapa); en PC va centrada en el cursor. Se resaltan las líneas que completarías.
- Combos encadenados: la racha sobrevive 2 jugadas sin limpiar y se rompe a la 3ª; multiplicador hasta x8; bonus por varias líneas y por tablero limpio (+800).
- Dificultad dinámica: la "presión" sube con el tiempo (desde 1 min) y al acercarte a tu récord personal. Con presión alta las manos de 3 piezas son más densas/largas, siempre resolubles, y la más ajustada tiene prioridad.
- Comodines (cuestan 10 % de tus puntos, mínimo 150): 💡 sugiere dónde colocar (1 por partida, +1 por cada racha x4) y 🔄 cambia las piezas disponibles (1 por partida).
**Dificultades (todos los modos)**: Fácil (nuevo, más lento) · Normal (antes Fácil) · Difícil (antes Normal) · Experto (antes Difícil). La preferencia guardada se migra una sola vez.
**Snake**: modo Con paredes / Sin paredes (cruza y reaparece por el otro lado). En móvil se juega tocando/deslizando la pantalla (sin botones); en PC, flechas/WASD.
**Tetris**: dos modos. *Rescate*: al romper líneas lo de arriba cae para rellenar huecos (con cadenas); al salvar a los 6 ratoncitos aparece un mapa nuevo con más filas-trampa, sin fin. *Clásico*: por puntos, sin ratoncitos ni piedra, hasta quedarse sin espacio.
**La Otra Madre**: al acercarte a perder aparecen ojos de botón y manos desde las sombras (más intensos mientras más cerca); al perder aparece y dice «Perdiste… ahora eres mía.»
**Burbujas**: 💥 Explosión (barra naranja; se carga con combos y ratoncitos; no gasta botones; tecla B) y 🔺 colocación directa (ya existía). Modo *Rescate sin fin*: al liberar a todos el escenario se despliega con un mapa nuevo (más filas y colores) y recargas botones.
**Técnico**: Snake, puntajes y la Otra Madre pasan a archivos propios (`13`, `14`, `15`); `tests/features.js` (47 comprobaciones).

## v0.7.0 — 2026-11-18 (sin commit todavía; probado en Chromium headless, NO por una persona)
Aplicado sobre `src/` (ver `git diff`).
- Burbujas: `pickColor()` solo ofrece colores presentes (+ `syncLauncher()`); intercambio cur/nxt con el Gato (⇄, C/Shift); piedra mágica coloca directamente en casilla vacía adyacente.
- Bloques: estilo Redondo/Cuadrado solo en render (`bCan`/`bPlace` intactos), preferencia por perfil.
- Perfiles con UUID, pantalla de jugadores, apodo solo visible.
- Migración no destructiva `coraline_scores` → `coraline_scores_v2` (perfil heredado). La clave original no se modifica.
- Saludo general una vez por perfil; saludo de puerta solo para el UUID de Carolina; las banderas se marcan cuando `play()` se resuelve.
- Snake: cuarto modo (teclado, swipe, botones).
- `tools/patch-v0.7.0.js` corregido para el original real (CRLF y ancla `\\n` de `showScores`).

## v0.6.1 — 2026-11-18
- Auditoría, `src/` modular que reproduce el original byte a byte, build, assets de audio.
