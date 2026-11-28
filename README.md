# Coraline y el Rescate de los Ratones

Juego HTML5 Canvas (480×760) con ocho juegos: Burbujas, Tetris, Bloques, Snake, Aventura, Corredor 2D y Corredor 3D. Sin dependencias.

## Comandos
```bash
npm run build    # src/ + assets/  ->  dist/index.html (autocontenido)
npm test         # pruebas estáticas (build, sintaxis, assets)
NODE_PATH=$(npm root -g) node tests/smoke.js dist --patched   # prueba funcional en Chromium headless (requiere playwright)
npm run serve    # servidor local
```

## Estructura
- `original/` entrega original (no se toca; hash en `SHA256SUMS`).
- `src/` código fuente por secciones (`src/js/00…23`, `styles/base.css`, `template.html`).
- `assets/audio/` MP3 (voces, saludo de puerta, música). El build los incrusta como `data:` URI.
- `tools/` build, serve, split-original, patch-v0.7.0.
- `tests/run.js` estáticas · `tests/smoke.js` funcionales en navegador.
- `docs/` arquitectura, auditoría, plan de pruebas, hallazgos de audio, continuidad.

## Reglas
`main` es lo publicado (GitHub Pages sirve el `index.html` de la raíz; se genera con `npm run release`).

## Pruebas
```bash
npm test                 # estáticas (build, sintaxis, assets)
npm i -D playwright && npx playwright install chromium     # una sola vez
npm run smoke            # arranque y modos
npm run features         # comprobaciones funcionales (≈115)
npm run supabase-test    # ranking compartido contra un Supabase simulado
npm run test:all         # todo junto
```


## v1.0.0 — seis juegos
Burbujas (campaña de 30 niveles + sin fin), Tetris, Bloques, Snake, Aventura (plataformas) y Corredor. Para publicar: `npm run release`, luego `git add -A`, `git commit`, `git push` (un comando por línea en PowerShell).



## v1.5.0 — ajustes y ecosistema de ratones
- Selector global: Fácil, Medio, Difícil; Expertos antiguos migran a Difícil.
- Bloques: 25 figuras, generador con búsqueda DFS estricta y comodín de forma.
- El menú muestra récords reales; si Supabase está conectado intenta cargar el ranking compartido, si no usa récords locales.
- Prototipo local de economía: recursos de minijuegos, granja (producción offline limitada), fabricación, defensa con pérdidas y ofertas locales.
- El mercado todavía no tiene compra/transferencia entre cuentas; requiere backend transaccional antes de comerciar online.

## v1.3.0 — ranking compartido (Supabase)
1. En Supabase: **SQL Editor → New query**, pega `docs/supabase_setup_v1.3.sql` y pulsa **Run**.
2. En **Project Settings → API** copia la *Project URL* y la clave pública (*anon* / *publishable*). **Nunca** uses la clave `service_role`.
3. Pégalas en `src/js/21-supabase.js` (`SB_CONF`) para que todos los dispositivos las usen, o en el juego: ⚙️ Configuración → Ranking en línea (solo ese dispositivo).
4. `npm run release`, `git add -A`, `git commit`, `git push`.
5. Cuando Carolina haya jugado una vez, marca su perfil: `update public.profiles set is_special = true where id = '<uuid>';` (verás 💛 junto a su nombre).
Sin conexión los puntajes quedan en cola y se envían después; sin configurar, el juego funciona igual en local.
