# Implementación v1.5.0 — estado y límites

## Aplicado en el código

- **Dificultad:** tres claves `facil`, `normal` (etiqueta Medio) y `dificil`. Preferencia anterior `experto` se migra a `dificil`; otros valores inválidos se normalizan a `normal`. Los datos históricos de puntuación con dificultad `experto` se muestran como `dificil` sin borrar el registro original.
- **Bloques:** 25 figuras; coordenadas normalizadas; distribución de figuras ajustada; el generador intenta 60 manos y solo acepta una cuando todas las piezas tienen jugada y DFS demuestra colocación de las tres. El DFS tiene corte y, al agotarse, retorna no-solvable (no usa falso positivo). El fallback de piezas unitarias también se somete al DFS; si el tablero está demasiado apretado, la última salida es una mano asistida de una pieza y dos espacios vacíos, para asegurar al menos una colocación legal.
- **Comodín de forma:** una carga por partida; selecciona pieza de mano, elige catálogo, cambia la pieza y descuenta puntos.
- **Tablero limpio:** bonus y cambio de color/skin visual.
- **Inicio:** desafío con récords reales; consulta ranking compartido cuando Supabase está conectado, y usa datos locales como respaldo.
- **Economía local:** recursos persistentes por perfil; recompensa por puntuación; granja que acumula producción offline hasta 8 h; crafting; prototipo de defensa con pérdidas de ratones; publicación de ofertas locales.

## Limitaciones conocidas / no afirmar como terminado

- Las figuras son un catálogo de formas comunes inspiradas en Block Blast, no una reproducción exhaustiva certificada de su catálogo oficial.
- La economía, granja, fabricación, defensa y mercado son una primera versión local. Defensa usa una simulación simplificada, no todavía tablero Plants-vs-Zombies con counters por enemigo y placement completo.
- El mercado no realiza compra, escrow ni transferencia entre cuentas; ofertas locales son prototipo y no se sincronizan. Requiere backend seguro/transacciones.
- El ranking de inicio intenta consultar Supabase, pero se conserva fallback local.
- No se completó prueba visual/manual en móvil o navegador debido a Playwright ausente en el entorno. La ejecución de Chromium headless también excedió el tiempo límite.

## Verificación realizada

- `npm run build` — PASS.
- `npm test` — PASS, incluyendo pruebas estáticas y ejecución aislada de DFS/manos generadas y lógica de crafting/defensa/market local.
- `node --check tests/features.js` y `node --check tests/supabase.js` — PASS.
- `npm run test:all` — build y tests estáticos pasan; el proceso se detiene en `tests/smoke.js` por `Cannot find module 'playwright'`. Features y Supabase browser tests no pudieron ejecutarse.
- Prueba aislada del generador en 8 tableros aleatorios — 8/8 manos demostradas solvables.
- Prueba aislada del ecosistema — crafting, pérdida en defensa y oferta local PASS.

## Ejecutar

```bash
npm run build
npm test
npm run serve
```

Para las pruebas de navegador, instalar Playwright y Chromium según el README y ejecutar `npm run test:all`.
