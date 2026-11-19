# Coraline y el Rescate de los Ratones

Juego HTML5 Canvas (480×760) con cuatro modos: Burbujas, Tetris, Bloques y Snake. Sin dependencias.

## Comandos
```bash
npm run build    # src/ + assets/  ->  dist/index.html (autocontenido)
npm test         # pruebas estáticas (build, sintaxis, assets)
NODE_PATH=$(npm root -g) node tests/smoke.js dist --patched   # prueba funcional en Chromium headless (requiere playwright)
npm run serve    # servidor local
```

## Estructura
- `original/` entrega original (no se toca; hash en `SHA256SUMS`).
- `src/` código fuente por secciones (`src/js/00…12`, `styles/base.css`, `template.html`).
- `assets/audio/` MP3 (voces, saludo de puerta, música). El build los incrusta como `data:` URI.
- `tools/` build, serve, split-original, patch-v0.7.0.
- `tests/run.js` estáticas · `tests/smoke.js` funcionales en navegador.
- `docs/` arquitectura, auditoría, plan de pruebas, hallazgos de audio, continuidad.

## Reglas
`main` no se toca · trabajo en `feature/architecture-refactor` · Supabase fuera de esta fase.

## Pruebas
```bash
npm test                 # estáticas (build, sintaxis, assets)
npm i -D playwright && npx playwright install chromium     # una sola vez
npm run smoke            # arranque y modos
npm run features         # 47 comprobaciones de v0.8.0
npm run test:all         # todo junto
```
