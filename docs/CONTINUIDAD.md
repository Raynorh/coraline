# CONTINUIDAD — CORALINE (actualizado 2026-11-18, noche)

## Estado real
- Rama `feature/architecture-refactor`, último commit `c961b93`. Los cambios v0.7.0 y v0.8.0 en `src/` están SIN commitear.
- `src/` está dividido en secciones concatenadas por `tools/build.js` (no son módulos ES aún). Todo comparte un ámbito global.
- Nadie ha jugado v0.7.0: solo hay pruebas automáticas (`tests/run.js` estáticas, `tests/smoke.js` funcionales, 17/17 OK).

## Cómo fijar a Carolina (sin nickname)
1. Crear su perfil real en el juego.
2. Consola: `localStorage.setItem('coraline_carolina_id', profile.id)` (o pegar el UUID en `CAROLINA_ID`).
Hasta entonces nadie recibe el saludo de puerta.

## Decisiones pendientes del usuario
Ver `docs/HALLAZGOS_AUDIO.md` (qué audio es el saludo general y cuál el de puerta).

## Siguiente paso
1. Jugar v0.7.0 en PC y móvil con `docs/PLAN_DE_PRUEBAS.md`.
2. Si pasa: commit en la rama, luego convertir secciones a módulos ES uno a uno (utils/estado → audio → Burbujas → Bloques → Tetris → Snake), probando tras cada uno.
