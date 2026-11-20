// Ensambla src/ + assets/ en un único index.html autocontenido (sin dependencias).
// Uso: node tools/build.js [salida=dist/index.html]
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, process.argv[2] || 'dist/index.html');

const css = fs.readFileSync(path.join(root, 'src/styles/base.css'), 'utf8');
const jsDir = path.join(root, 'src/js');
const js = fs.readdirSync(jsDir).filter(f => /^\d+-.*\.js$/.test(f)).sort()
  .map(f => fs.readFileSync(path.join(jsDir, f), 'utf8')).join('');
const embedded = js.replace(/@asset:([\w\/.\-]+)/g, (_, rel) => {
  const buf = fs.readFileSync(path.join(root, 'assets', rel));
  return 'data:audio/mpeg;base64,' + buf.toString('base64');
});
const html = fs.readFileSync(path.join(root, 'src/template.html'), 'utf8')
  .replace('{{STYLE}}', () => css).replace('{{SCRIPT}}', () => embedded);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('build OK ->', path.relative(root, out), (html.length / 1048576).toFixed(2) + ' MB');
