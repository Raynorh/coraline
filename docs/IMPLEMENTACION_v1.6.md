# Coraline v1.6.0 — progresión y experiencia

## Implementado
- Refugio con tarjetas de entrada para Granja, Taller, Defensa, Mercado y Recursos.
- Pantallas más separadas; recursos compactos en la parte inferior y vista completa en Inventario/Recursos.
- Tutoriales breves contextuales de primera visita y Ayuda rápida. Se pueden cerrar sin forzar una secuencia.
- Granja: recolectar, sembrar (2 semillas) y mejorar; mantiene producción offline.
- Taller: recetas en tarjetas con rol, cantidades y coste.
- Defensa: campaña de 999 niveles generados, requisitos de ratoncitos fabricados, acceso bloqueado, desbloqueo al ganar.
- Defensa táctica: tablero de 4 carriles y 6 columnas, colocación inicial, selección de unidad, oleadas, enemigos normales/rápidos/pesados, ataque automático y recompensas.
- Los niveles tienen variación de composición/ritmo y escalan la cantidad de enemigos.
- Selector de minijuegos muestra una vista previa de recursos que puede entregar; la cantidad depende de puntuación y dificultad.

## Validación
- `npm test`: OK (pruebas estáticas y comportamiento de bloqueo/desbloqueo de defensa).
- `npm run build`: OK.
- Smoke, Features y Supabase browser tests no se pudieron ejecutar porque el entorno no contiene Playwright.
- La validación visual/manual de la interfaz en navegador sigue pendiente.

## Nota de alcance
La defensa es una primera versión jugable táctica en Canvas, no una reproducción completa de Plants vs. Zombies. Las unidades consumidas al desplegar son permanentes por batalla; si se pierde, el jugador debe fabricar nuevas unidades para reintentar.
