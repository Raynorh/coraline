# CORALINE — Auditoría técnica v0.6.1

**Estado:** AUDITORÍA COMPLETADA — refactorización todavía no iniciada  
**Fuente:** `coraline-source.zip` recibido el 18-11-2026  
**Versión declarada dentro del juego:** `v0.6.0`

## 1. Inventario verificado

| Archivo | Tamaño aproximado |
|---|---:|
| `index.html` | 10,84 MB |
| `soundscoraline.zip` | 478 KB |
| `supabase_setup.sql` | 2,7 KB |
| `README.md` | 22 bytes |

El ZIP contiene un HTML principal, un ZIP de audio con cinco MP3 y el SQL de Supabase. El HTML contiene un único bloque JavaScript inline de aproximadamente 10,83 MB y CSS inline. El tamaño elevado se debe en gran parte a audio codificado como `data:audio/mpeg;base64` dentro del JavaScript.

## 2. Sistemas identificados

- Renderizado Canvas de 480 × 760, escalado al tamaño de pantalla.
- Bucle principal `update()` / `frame()` con `requestAnimationFrame`.
- Estados visuales: `splash`, `menu`, `select`, `play`, `pause`, `win`, `lose`.
- Modos implementados: `bubble`, `tetris`, `blocks`.
- Audio: voces embebidas, audio de saludo separado, pistas locales, sintetizador de respaldo, efectos, volumen/silencio y sonidos personalizados.
- Sonidos personalizados persistidos mediante IndexedDB (`coraline_snd`, almacén `s`).
- Preferencias actuales `cor_mode` y `cor_diff` en localStorage.
- Puntajes actuales `coraline_scores` en localStorage.
- Configuración de Apple Music mediante iframe.
- No se encontró integración JavaScript activa con Supabase en el HTML.

## 3. Hallazgos funcionales que condicionan la refactorización

### Burbujas
- `pickColor()` calcula probabilidades a partir de los colores presentes y ratoncitos, pero cuando no encuentra colores presentes devuelve un color aleatorio. Hay que verificar el estado del tablero y el flujo de `cur` / `nxt` para corregir el caso de colores agotados sin alterar el balance.
- `activateMagic()` activa el modo armado; actualmente no implementa todavía la colocación directa en una casilla vacía seleccionada.
- El botón de intercambio del Gato debe integrarse en el flujo de selección de `cur` y `nxt`, respetando el estado de disparo y el tablero.

### Bloques
- La lógica de validación está separada de la apariencia: `bCan()` comprueba límites y ocupación; `bPlace()` aplica la pieza y limpia filas/columnas.
- El dibujo usa `bDrawButtonCell()` y varias llamadas a `rr()`/`arc()`, por lo que la opción cuadrada debe afectar exclusivamente al renderizado y no a `bCan()` ni a `bPlace()`.
- Existe un sistema de arrastre y previsualización de posición válida.

### Perfiles y puntajes
- `recordScore()` solicita un nombre mediante `prompt()` al terminar una partida.
- Los registros actuales se guardan como `{name, score, mode, date}` y se recortan a los 20 mejores.
- `showScores()` presenta los 10 primeros.
- `cor_mode` y `cor_diff` se guardan por navegador, no por perfil.
- La migración debe conservar todos los registros antiguos disponibles, asignándolos a un perfil heredado estable, sin borrar ni reescribir destructivamente el dato original.

### Audio y saludos
- El código contiene `VOICE_DATA`, `DOOR_GREETING_DATA`, `MUSIC_FILES`, `voices`, `music` y `custom`.
- `playDoorGreeting()` tiene una bandera temporal `doorGreetingPlayed`, que no se persiste por perfil. Se invoca al ejecutar la acción `open` (abrir la puerta).
- `enterGame()` se activa desde el primer toque/clic de la pantalla inicial y llama a `unlock()`. Esto refleja la restricción habitual del navegador para iniciar audio sin interacción.
- La bandera del saludo de puerta se activa antes de confirmar que el audio comenzó correctamente; hay que corregirlo para que un fallo de autoplay no consuma el saludo.
- El ZIP de audio incluye cinco MP3. Los nombres sugieren diálogos de bienvenida, peligro, poder y victoria, pero el papel exacto de cada archivo debe confirmarse antes de asignarlos. No se debe inferir la identidad de Carolina por nickname.

### Snake
- No se encontraron funciones, estado, identificadores ni selección de modo relacionados con Snake. Se considera un modo nuevo, no una función existente pendiente de conectar.

## 4. Mapa de funciones principales observado

| Área | Funciones / variables principales |
|---|---|
| Inicio y escala | `fit`, `enterGame`, `state`, `stage`, `cv` |
| Audio | `ensureCtx`, `playVoice`, `playDoorGreeting`, `startSynth`, `setMusic`, `setMuted`, `unlock`, `makeVoice`, `makeMusic` |
| Audio personalizado | `renderSettings`, `applySound`, `idb`, `idbPut`, `idbClear`, `idbLoad`, `readZip` |
| Burbujas | `newGame`, `pickColor`, `shoot`, `stepProj`, `snap`, `flood`, `popCell`, `rescue`, `dropOrphans`, `activateMagic` |
| Bloques | `bNew`, `bPiece`, `bDeal`, `bCan`, `bPlace`, `bHasMove`, `bUpdatePreview`, `bPointer`, `bEndDrag`, `drawBlocks` |
| Tetris | `tNew`, `tSpawn`, `tMove`, `tRot`, `tHard`, `tLock`, `tUpdate`, `drawTetris` |
| Puntajes | `recordScore`, `showScores`, `scoreRecorded` |
| UI / navegación | `drawMenu`, `drawSelect`, `actNew`, `act`, `toMenu`, `startPlay`, `overlay` |
| Renderizado | `drawSky`, `drawFog`, `drawFireflies`, `drawHUD`, `drawPlay`, `frame`, `update` |

El archivo tiene 108 declaraciones `function` identificadas. El inventario anterior es una guía de áreas, no una lista exhaustiva de cada helper gráfico.

## 5. Arquitectura objetivo propuesta

Se mantendrá `index.html` como punto de entrada. La migración se hará por capas, evitando una conversión masiva:

```text
index.html
styles/
  base.css
src/
  app.js
  core/
    state.js
    loop.js
    canvas.js
    input.js
    navigation.js
  audio/
    audio-manager.js
    music.js
    voices.js
    custom-audio.js
  profile/
    profile-store.js
    identity.js
    greetings.js
  scores/
    score-store.js
    score-migration.js
  storage/
    local-storage.js
    indexed-db.js
  games/
    bubbles/
      bubbles.js
      bubbles-renderer.js
    tetris/
      tetris.js
      tetris-renderer.js
    blocks/
      blocks.js
      blocks-renderer.js
      blocks-settings.js
    snake/
      snake.js
      snake-renderer.js
  ui/
    menu.js
    settings.js
    scores.js
  utils/
    math.js
    geometry.js
assets/
  audio/
docs/
```

Los nombres definitivos se ajustarán al extraer las dependencias reales. No se crearán módulos vacíos para aparentar progreso. Cada archivo nuevo debe contener lógica real y tener una prueba asociada.

## 6. Orden seguro de migración

1. Establecer una copia de referencia y comprobar que el original abre y se puede jugar.
2. Extraer los datos de audio embebidos a recursos locales sin cambiar su contenido ni sus asignaciones.
3. Separar utilidades y estado compartido.
4. Separar el gestor de audio y comprobar música, voces, sonidos personalizados e IndexedDB.
5. Separar Burbujas y probar disparos, colisiones, ratoncitos, victoria/derrota y piedra mágica.
6. Separar Bloques y probar arrastre, límites, ocupación, líneas y puntuación.
7. Separar Tetris y probar movimiento, rotación, caída, filas y fin de partida.
8. Implementar perfiles y migración compatible de puntajes.
9. Corregir saludos generales y saludo personalizado de Carolina mediante identidad interna estable.
10. Implementar Snake como cuarto modo.
11. Pruebas integrales en PC y móvil.

## 7. Reglas de seguridad de datos

- No modificar ni eliminar `main`.
- No alterar `supabase_setup.sql` ni conectar Supabase durante esta fase.
- Mantener `cor_mode`, `cor_diff` y `coraline_scores` legibles para una migración compatible.
- No reemplazar el nickname por una identidad interna; el perfil debe tener UUID propio.
- No identificar a Carolina por el texto visible del nickname.
- No marcar un saludo como reproducido hasta confirmar el inicio real de reproducción.
- Mantener intacto el ZIP original como referencia.

## 8. Estado de requisitos

| Requisito | Estado |
|---|---|
| Auditoría inicial del HTML y ZIP | **FUNCIONAL Y PROBADO** |
| Arquitectura modular | **PLANIFICADO** |
| Corrección de colores disponibles en Burbujas | **PENDIENTE** |
| Intercambio de botones con el Gato | **PENDIENTE** |
| Colocación directa con piedra mágica | **PENDIENTE** |
| Apariencia cuadrada/redondeada en Bloques | **PENDIENTE** |
| Perfil persistente con UUID | **PENDIENTE** |
| Migración de puntajes existentes | **PENDIENTE** |
| Saludo general una vez por perfil | **PENDIENTE** |
| Saludo exclusivo de Carolina al abrir la puerta | **PENDIENTE** |
| Snake | **PENDIENTE** |
| Integración futura Supabase segura | **PLANIFICADO** |

## 9. Limitaciones de esta auditoría

Esta fase inspeccionó estructura, funciones, persistencia, navegación y fragmentos relevantes del código. No constituye todavía una prueba de juego ejecutado en navegador. Tampoco confirma por escucha humana el contenido exacto de cada MP3. Esas validaciones se harán antes de reasignar audios o modificar la jugabilidad.
