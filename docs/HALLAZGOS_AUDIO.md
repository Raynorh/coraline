# Hallazgos de audio (verificados por hash, no por escucha)

| Uso en el código | Archivo extraído | Coincide con MP3 del ZIP |
|---|---|---|
| `voices.bienvenida` | assets/audio/voices/bienvenida.mp3 | "Hola, Soy Coraline Jones, Necesito tu ayuda…" (15-07) |
| `voices.victoria` | voices/victoria.mp3 | "¡Lo logramos! ¡Todos los ratoncitos…" |
| `voices.peligro` | voices/peligro.mp3 | Gato Negro "Cuidado, Coraline…" |
| `voices.poder` | voices/poder.mp3 | Gato Negro "¡Usa la piedra mágica!…" |
| `doorGreeting` | greetings/puerta-carolina.mp3 (95 362 B; el nombre lo puso la sesión anterior, no está confirmado) | **Ninguno** de los 5 MP3 |
| — | — | "Hola, soy Coraline Jones, bienvenido a mi mundo" (18-11, 66 523 B) **no está embebido en ningún sitio** |
| `music.intro` y `music.pausa` (music/intro.mp3, music/pausa.mp3) | idénticos byte a byte (2 808 101 B) | — |

## Pendiente de decisión del usuario
1. ¿Cuál es el saludo general? Hoy `playGeneralGreeting()` usa `voices.bienvenida` ("necesito tu ayuda"); el archivo "bienvenido a mi mundo" parece más adecuado pero no está conectado.
2. ¿Cuál es el saludo de puerta de Carolina? El embebido no coincide con ningún MP3 del ZIP.
3. ¿Cuál es el perfil auténtico de Carolina? Ver `CONTINUIDAD.md` para fijar su UUID.
