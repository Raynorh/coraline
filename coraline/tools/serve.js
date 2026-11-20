// Servidor local mínimo para probar dist/index.html: npm run build && npm run serve
const http = require('http'), fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'dist'), port = +process.env.PORT || 8080;
http.createServer((q, s) => {
  const f = path.join(dir, q.url === '/' ? 'index.html' : q.url.split('?')[0]);
  if (!f.startsWith(dir) || !fs.existsSync(f)) { s.writeHead(404); return s.end('404'); }
  s.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
  fs.createReadStream(f).pipe(s);
}).listen(port, () => console.log('http://localhost:' + port));
