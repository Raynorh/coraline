# CHANGELOG — Coraline

## v1.1.0 — 2026-11-20 (correcciones tras la prueba de Carolina; 95 pruebas automáticas OK)
**Burbujas** — ARREGLADO el congelamiento: la mira usaba el color del botón cargado y el disparo 🌈 arcoíris no tiene color, lo que hacía fallar el dibujado en cada cuadro. Además el bucle principal ahora captura errores para que ningún fallo pueda congelar el juego. Nuevo botón ❓ con la **leyenda de poderes** y botones especiales (se abre sola la primera vez que llegas a un nivel con especiales). La **Piedra verde** en Niveles ahora es 🌈 *Lluvia de color* (elimina todos los botones del color que tienes cargado; en Sin fin sigue colocando un botón). Se puede **cancelar el apuntado**: arrastra a la franja roja inferior y suelta.
**Snake** — control en X como el dibujo: la pantalla se divide con dos diagonales en ARRIBA / IZQUIERDA / DERECHA / ABAJO (direcciones absolutas, se ven en pantalla). Sigue disponible «Deslizar».
**Aventura** — letras C-O-R-A ahora alcanzables (antes algunas quedaban fuera del salto). Nuevo: 🏃 **correr**, **doble salto**, 🔘 **lanzar botones** (munición con cajas y cada 8 botones), cajas **?** (🍄 hongo = escudo, ⭐ estrella = invencible, munición, botones), 🐱 **jaulas de gatitos**, 🔦 **Wybie** (compañero: imán de botones, absorbe un golpe y su linterna aturde enemigos), combos de pisotones, y un **jefe cada 3 niveles** (Muñeca Costurera, Gran Rata Encantada, La Otra Madre) que debes vencer para **rescatar al ratoncito** del mundo.
**Corredor** — rehecho en 2D lateral estilo dinosaurio de Chrome: salta (mantén = más alto) y agáchate; carretes, agujas, armarios y murciélagos; zonas cada 500 m. Corazones: 4/3/2/1 según dificultad.
**Otros** — los avisos de Coraline ya no tapan los botones en Aventura y Corredor.

## v1.0.0 — 2026-11-20 (versión estable candidata; pruebas automáticas OK; falta jugarla a mano en móvil)
**Burbujas** — nueva campaña de 30 niveles con mapa y estrellas (progreso por perfil), dificultad creciente (más filas, colores y ratoncitos; menos disparos) y botones especiales estilo Panda Pop: 🔩 hierro (no explota; cae si pierde apoyo), ❄️ hielo (se rompe al explotar algo al lado), 💣 bomba, ⚡ rayo (limpia la fila) y disparo 🌈 arcoíris cada 9 tiros. Se mantienen 💥 Explosión y 🔺 Piedra. El modo anterior pasa a *Sin fin*.
**Tetris Rescate** — vuelve la mecánica original (las filas de arriba bajan como bloque). La Piedra Mágica es mucho más difícil de cargar (8 % por línea + 12 % por ratoncito) y al usarla hace caer y rellenar los botones sobre huecos, despejando las líneas que se completen.
**Bloques** — la pieza crece 18 %, sube sobre el dedo y se mueve con ganancia táctil (1.5×/1.85×) desde su hueco de la bandeja; combos en cartel gigante, líneas por completar y pista 💡 mucho más visibles; botones 💡 🔄 más grandes.
**Snake** — control por mitades de pantalla (izquierda = gira a su izquierda, derecha = a su derecha, relativo al rumbo) o deslizar (botón «Control» en pantalla); flechas/WASD y cruceta en PC.
**Puntajes** — separados por juego, modo y dificultad (`coraline_scores_v3`, listo para Supabase); migración automática desde v2 sin tocar los datos anteriores.
**Menú** — «Abrir la Puerta» y «Mejores puntajes» destacados; Perfil (nombre, mejores puntajes por juego/modo y posición); Configuración (silencio, volumen de música/voces/efectos, Apple Music, sonidos personalizados); Historia como botón «!»; Apple Music solo si está sonando.
**Juegos nuevos** — 🌲 *Aventura* (plataformas 2D estilo Donkey Kong Country: niveles infinitos generados, muñecos de botones, carretes rodantes, murciélagos, agujas, letras C-O-R-A, lámpara de guardado, puerta final) y 🏃 *Corredor* (carrera sin fin de 3 carriles estilo Pepsiman: cambiar de carril, saltar carretes, deslizar bajo tijeras, armarios, zonas cada 600 m). Ambos con 4 dificultades (corazones y velocidad), controles táctiles y de teclado y puntajes propios.
**Técnico** — `npm run release` (build + copia a `index.html` raíz para GitHub Pages); `docs/supabase_v1_propuesta.sql` (propuesta, NO conectada); pasos fijos a 60 Hz en los juegos nuevos; `tests/features.js` ampliado.

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
