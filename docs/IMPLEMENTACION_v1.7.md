# Coraline v1.7.0 — Pulido de interfaz y claridad de economía

## Cambios
- Selector de minijuegos: panel de recompensas más legible y con recompensas de recursos identificadas; tela asociada a Bloques/Tetris y componentes/esencia sujetos a dificultad/puntaje.
- Récords en inicio: tarjetas compactas con nombre de juego, puntaje destacado y nombre del jugador para aumentar legibilidad.
- Refugio de ratoncitos: historial persistente de movimientos de recursos, ganancias y gastos (hasta 80 entradas), con una entrada que identifica el inventario inicial.
- Movimientos registrados: recursos obtenidos por minijuegos, producción pasiva de granja, siembra, crafting (gasto), y recompensas de campaña de defensa.
- Defensa: botones de selección de unidad con nombres y cantidades, botones de acción con etiquetas explícitas.
- Versión marcada v1.7.0.

## Pruebas
- `npm test`: aprobado.
- `node --check` de script de build: incluido en test.
- Smoke tests de navegador: no ejecutados; Playwright no está instalado en este entorno.
- Prueba visual manual: pendiente.

## Limitaciones
- La defensa sigue siendo una vertical slice/prototipo: carriles, unidades, oleadas y recompensas están implementados, pero no es un tower-defense completo con animaciones, IA y balance finales.
- El historial muestra registros recientes y no reconstruye retroactivamente la procedencia de recursos antiguos de partidas previas a v1.7. Los recursos existentes se conservan; si no había historial, se etiqueta como inventario inicial (no se puede inferir la procedencia histórica real).
