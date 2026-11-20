// Genera el juego y copia dist/index.html a la raíz (lo que sirve GitHub Pages desde main).
const {execSync}=require('child_process'),fs=require('fs'),path=require('path');
execSync('node tools/build.js',{stdio:'inherit'});
fs.copyFileSync(path.join('dist','index.html'),'index.html');
console.log('Listo: index.html actualizado en la raíz. Ahora: git add -A, git commit, git push.');
