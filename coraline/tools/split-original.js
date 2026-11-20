// Divide original/index.html en src/ (plantilla, CSS, módulos JS por sección) y assets/audio.
// Se ejecuta una sola vez; queda como trazabilidad de cómo nació src/.
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.resolve(root, process.argv[2] || 'original/index.html'), 'utf8');

const sOpen = html.indexOf('<style>') + 7, sClose = html.indexOf('</style>');
const jOpen = html.indexOf('<script>') + 8, jClose = html.lastIndexOf('</script>');
const css = html.slice(sOpen, sClose);
let js = html.slice(jOpen, jClose);

fs.writeFileSync(path.join(root, 'src/styles/base.css'), css);
fs.writeFileSync(path.join(root, 'src/template.html'),
  html.slice(0, sOpen) + '{{STYLE}}' + html.slice(sClose, jOpen) + '{{SCRIPT}}' + html.slice(jClose));

// --- audio embebido -> assets/audio ---
const slots = [
  [/const VOICE_DATA=\{([^\n]*)\};/, 'voices'],
  [/const MUSIC_FILES=\{([^\n]*)\};/, 'music'],
];
function extract(re, dir) {
  const m = js.match(re); if (!m) throw new Error('no encontrado ' + re);
  const out = m[0].replace(/(\w+):'data:audio\/mpeg;base64,([A-Za-z0-9+\/=]+)'/g, (_, name, b64) => {
    const buf = Buffer.from(b64, 'base64');
    if (buf.toString('base64') !== b64) throw new Error('base64 no canónico: ' + name);
    fs.writeFileSync(path.join(root, 'assets/audio', dir, name + '.mp3'), buf);
    return `${name}:'@asset:audio/${dir}/${name}.mp3'`;
  });
  js = js.replace(m[0], out);
}
slots.forEach(([re, d]) => extract(re, d));
js = js.replace(/const DOOR_GREETING_DATA='data:audio\/mpeg;base64,([A-Za-z0-9+\/=]+)';/, (_, b64) => {
  const buf = Buffer.from(b64, 'base64');
  if (buf.toString('base64') !== b64) throw new Error('base64 no canónico: puerta');
  fs.writeFileSync(path.join(root, 'assets/audio/greetings/puerta-carolina.mp3'), buf);
  return "const DOOR_GREETING_DATA='@asset:audio/greetings/puerta-carolina.mp3';";
});

// --- módulos por sección ---
const names = ['escalado','audio','sonidos-personalizados','apple-music','estado','juego-burbujas','dibujo','seleccion','juego-bloques','juego-tetris','bucle','entrada'];
const marker = /^\/\* =+ [^\n]* =+ \*\/(?=\r?\n)/gm;
const cuts = [0]; let m; while ((m = marker.exec(js))) cuts.push(m.index);
if (cuts.length !== names.length + 1) throw new Error('secciones: ' + (cuts.length - 1));
cuts.push(js.length);
const files = ['00-constantes.js'];
fs.writeFileSync(path.join(root, 'src/js/00-constantes.js'), js.slice(cuts[0], cuts[1]));
names.forEach((n, i) => {
  const f = String(i + 1).padStart(2, '0') + '-' + n + '.js';
  fs.writeFileSync(path.join(root, 'src/js', f), js.slice(cuts[i + 1], cuts[i + 2]));
});
console.log('OK: módulos', names.length + 1);
