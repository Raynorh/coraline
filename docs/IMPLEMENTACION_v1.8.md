# Implementación v1.8.0

## Selección de minijuegos
Las tarjetas muestran ahora el recurso principal que entrega cada juego, con badge/icono visible. La leyenda inferior explica el mapeo completo en líneas separadas. La pantalla ajusta la distribución vertical de dificultad, modos y recompensas para prevenir solapamientos.

## Recompensas conectadas a la economía
Cada minijuego garantiza su recurso principal: Burbujas semillas; Tetris y Bloques tela; Snake madera; Aventura componentes; Corredor 2D y Frutillas comida; Corredor 3D esencia. La cantidad se calcula por puntuación y dificultad. Se conservan bonus especiales de componentes en dificultad alta y esencia por puntuación alta cuando no es el recurso principal.

## Validación
Build creada desde `src` y suite `npm test` ejecutada. La validación visual de navegador aún requiere revisión manual.
