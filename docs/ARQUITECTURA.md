# Coraline — Arquitectura y plan de migración

## Objetivo
Descomponer gradualmente el HTML monolítico actual sin rehacer el juego ni perder su identidad visual, sus datos, animaciones, audio o controles.

## Principios
- Una única fuente de verdad para el estado compartido.
- Los juegos no deben depender directamente de la implementación de otros juegos.
- El renderizado y las reglas de juego deben separarse cuando sea posible.
- El almacenamiento debe tener una API común y migraciones explícitas.
- Los módulos se extraen de a uno y se prueban antes de seguir.
- Sin frameworks ni dependencias externas innecesarias.
- Mantener la entrada `index.html`; si se usan módulos ES, ejecutar con servidor local HTTP y documentar el comando.

## Contratos de módulos previstos

### Core
- `state.js`: estado global y transición entre estados.
- `loop.js`: `update` y `frame`, un único requestAnimationFrame.
- `canvas.js`: contexto, escala y helpers de dibujo compartidos.
- `input.js`: normalización de pointer/touch/keyboard.
- `navigation.js`: acciones de menú y cambios de pantalla.

### Games
Cada juego expondrá una interfaz común:
- `init(context)`
- `update(deltaTime)`
- `render(context)`
- `handleInput(input)`
- `dispose()`
La interfaz final se confirmará durante la extracción. No se debe forzar una interfaz que introduzca cambios de comportamiento.

### Audio
- `audio-manager.js`: desbloqueo, estado mute y ciclo de vida.
- `music.js`: pistas, sintetizador y transiciones.
- `voices.js`: diálogos y efectos vocales.
- `custom-audio.js`: importación ZIP/MP3, IndexedDB y ajustes.

### Profiles / scores
- `profile-store.js`: perfiles con UUID.
- `greetings.js`: banderas separadas por perfil y tipo de saludo.
- `score-store.js`: puntajes asociados al UUID.
- `score-migration.js`: migración no destructiva desde `coraline_scores`.

## Datos de perfil propuestos
```js
{
  id: "uuid",
  nickname: "Nombre visible",
  createdAt: "ISO-8601",
  preferences: {
    blocksStyle: "rounded"
  },
  greetings: {
    generalPlayed: false,
    carolinaDoorPlayed: false
  }
}
```
La identidad de Carolina se establecerá mediante un UUID interno verificado, no por nickname. No se asigna ningún UUID hasta confirmar cuál es el perfil auténtico.

## Migración de puntajes
1. Leer `coraline_scores` sin modificarlo.
2. Validar cada registro y normalizar modo, score, fecha y nickname.
3. Crear una identidad heredada estable para registros históricos sin perfil.
4. Copiar los registros al nuevo esquema.
5. Verificar conteo y contenido.
6. Mantener la clave original hasta confirmar integridad; nunca borrarla durante la primera migración.

## Política de saludos
- Saludo general: al inicio real de una nueva sesión/perfil, una vez por perfil.
- Saludo de Carolina: al abrir la puerta, únicamente para el UUID interno autenticado/verificado de Carolina, una vez por perfil.
- No usar nickname para decidir identidad.
- Si autoplay se bloquea, dejar el saludo pendiente y reintentar tras una interacción permitida.
- Marcar como reproducido solo cuando el elemento de audio confirme que empezó a reproducirse.
- Los dos saludos usan estados persistentes independientes.

## Pruebas mínimas por extracción
- Inicio, menú, selector, volver y pausar.
- Escala en escritorio y móvil.
- Música, voces, mute, pistas personalizadas e IndexedDB.
- Cada juego: iniciar, entrada, actualización, render, victoria/derrota.
- Puntajes antes/después de migrar.
- Recarga y cambio de perfil.
- Saludos en perfiles diferentes y en el perfil Carolina.
