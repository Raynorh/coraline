// Pruebas estáticas: build reproducible, sintaxis JS, referencias a assets, secciones y funciones esperadas.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.join(__dirname, '..');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

cp.execFileSync('node', [path.join(root, 'tools/build.js')], { stdio: 'ignore' });
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

const tmp = path.join(root, 'dist/_syntax.js'); fs.writeFileSync(tmp, js);
try { cp.execFileSync('node', ['--check', tmp], { stdio: 'pipe' }); ok(true, 'sintaxis JS válida'); }
catch (e) { ok(false, 'sintaxis JS: ' + e.stderr); }
fs.unlinkSync(tmp);

ok(!/@asset:/.test(html), 'no quedan marcadores @asset sin resolver');
const srcJs = fs.readdirSync(path.join(root, 'src/js')).filter(f => f.endsWith('.js'));
const assets = [...srcJs.map(f => fs.readFileSync(path.join(root, 'src/js', f), 'utf8')).join('').matchAll(/@asset:([\w\/.\-]+)/g)].map(m => m[1]);
ok(assets.length >= 8 && assets.every(a => fs.existsSync(path.join(root, 'assets', a))), 'todos los assets referenciados existen (' + assets.length + ')');
for (const a of assets) ok(fs.readFileSync(path.join(root, 'assets', a)).slice(0, 3).toString() === 'ID3' || fs.readFileSync(path.join(root, 'assets', a))[0] === 0xff, 'MP3 válido: ' + a);
const fns = (js.match(/\bfunction\s+\w+/g) || []).length;
ok(fns >= 100, 'funciones declaradas: ' + fns);
ok(/const VERSION='v\d+\.\d+\.\d+'/.test(js), 'VERSION presente: ' + (js.match(/VERSION='([^']+)'/) || [])[1]);
const base = path.join(root, 'original/index.html');
if (process.env.EXPECT_ORIGINAL === '1') ok(html === fs.readFileSync(base, 'utf8'), 'build idéntico al original byte a byte');
console.log(fails ? '\n' + fails + ' fallo(s)' : '\nTodo OK');
process.exit(fails ? 1 : 0);
