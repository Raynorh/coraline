# Coraline — Plan de pruebas

## Leyenda de estado
- FUNCIONAL Y PROBADO
- IMPLEMENTADO, PERO NO PROBADO
- PENDIENTE
- PLANIFICADO

## Pruebas de referencia (antes de refactorizar)
- [ ] Abrir `index.html` y entrar desde la pantalla inicial.
- [ ] Navegar al menú y volver al selector.
- [ ] Iniciar Burbujas y disparar a objetivos.
- [ ] Completar una partida de Burbujas o llegar a derrota.
- [ ] Iniciar Bloques, arrastrar una pieza y probar una posición inválida.
- [ ] Iniciar Tetris, mover, rotar y soltar pieza.
- [ ] Pausar, reanudar y volver al menú.
- [ ] Activar/desactivar sonido.
- [ ] Abrir configuración y probar lista de sonidos.
- [ ] Confirmar que puntajes se conservan al recargar.
- [ ] Probar en móvil y escritorio.

## Regresión por sistema
### Burbujas
- [ ] cur y nxt siempre corresponden a colores aún presentes.
- [ ] un color agotado nunca se ofrece.
- [ ] intercambio cur/nxt con el Gato.
- [ ] piedra mágica coloca en casilla válida vacía.
- [ ] no permite ocupar una casilla existente.
- [ ] consume una carga y aplica eliminación/reglas correctas.

### Bloques
- [ ] estilo redondeado.
- [ ] estilo cuadrado.
- [ ] preferencia persiste por perfil.
- [ ] no solapa ni sobrescribe celdas ocupadas.
- [ ] no permite piezas fuera del tablero.
- [ ] líneas, combos y puntajes se mantienen.

### Perfiles / puntajes
- [ ] primer ingreso solicita nickname una sola vez.
- [ ] recarga reconoce perfil y va al menú.
- [ ] cambio de jugador conserva puntajes.
- [ ] UUID distinto aunque dos jugadores compartan nickname.
- [ ] puntajes históricos migrados y comparados con origen.

### Audio
- [ ] saludo general una vez por perfil.
- [ ] volver al menú no repite saludo.
- [ ] Carolina recibe saludo personalizado al abrir puerta.
- [ ] otros perfiles no lo reciben aunque escriban “Carolina”.
- [ ] autoplay bloqueado no consume bandera.
- [ ] música, voces y sonidos personalizados siguen funcionando.

### Snake
- [ ] nuevo juego, movimiento, comida, crecimiento y colisión.
- [ ] pausa/reanudar.
- [ ] puntajes asociados al perfil.
- [ ] controles táctiles y teclado.

## Estado automático (v0.7.0, Chromium headless, `tests/smoke.js`)
- FUNCIONAL Y PROBADO (automático): arranque, entrada, los 4 modos inician sin errores, Snake crece y pierde, `pickColor` solo ofrece colores presentes, piedra mágica coloca y consume carga, creación de perfil con UUID, migración de puntajes con original intacto, Carolina solo por UUID configurado.
- IMPLEMENTADO, PERO NO PROBADO (requiere persona): arrastre en Bloques, intercambio con el Gato, aspecto cuadrado/redondo, táctil/móvil, escucha de saludos con autoplay real, victoria/derrota completas, música/IndexedDB.

## v0.8.0 — lo que debe probar una persona (en el teléfono sobre todo)
- [ ] Bloques: arrastrar con el dedo una pieza vertical de 4: se ve completa por encima del dedo y se coloca donde indica la guía.
- [ ] Bloques: pasar la pieza sobre botones ya colocados: sigue opaca.
- [ ] Bloques: movimiento fluido (no a saltos) y soltar en sitio ocupado/fuera del tablero no consume la pieza.
- [ ] Bloques: encadenar combos (racha) y ver el multiplicador; 💡 y 🔄 con su coste; el reto sube tras ~1 min o cerca del récord.
- [ ] Snake: con/sin paredes; en móvil, deslizar y tocar sin botones.
- [ ] Tetris Rescate: caída en cascada tras romper línea; al salvar los 6, mapa nuevo. Tetris Clásico por puntos.
- [ ] Otra Madre: ojos y manos al estar por perder; mensaje al perder.
- [ ] Burbujas: 💥 explosión y 🔺 colocación; modo Rescate sin fin con escenario nuevo.
- [ ] Fácil es claramente más lento en Tetris y Snake.
