// Uso: node tests/smoke.js <carpeta con index.html> [--patched]
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const dir=path.resolve(process.argv[2]);const patched=process.argv.includes('--patched');
const types={'.html':'text/html','.mp3':'audio/mpeg','.js':'text/javascript'};
const srv=http.createServer((q,r)=>{let p=path.join(dir,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';
 fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});r.end(d);});});
(async()=>{
 await new Promise(r=>srv.listen(0,r));const url='http://127.0.0.1:'+srv.address().port+'/';
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:480,height:760}});
 const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|Failed to load resource/.test(m.text()))errs.push('console: '+m.text());});
 pg.on('dialog',d=>d.accept('Tester'));
 const res=[];const ok=(n,c)=>res.push([c?'OK  ':'FAIL',n]);
 await pg.goto(url);await pg.waitForTimeout(600);
 ok('estado inicial splash',await pg.evaluate(()=>state)==='splash');
 await pg.mouse.click(240,380);await pg.waitForTimeout(300);
 if(patched){
  ok('sin perfil: abre selector de perfiles',await pg.evaluate(()=>getComputedStyle(document.getElementById('profiles')).display)==='block');
  await pg.fill('#profile-name','Ana');await pg.click('#profile-create');await pg.waitForTimeout(200);
  ok('perfil creado con UUID',await pg.evaluate(()=>/^[0-9a-f-]{36}$/.test(profile.id)&&profile.nickname==='Ana'));
  ok('perfil persistido',await pg.evaluate(()=>JSON.parse(localStorage.getItem('coraline_profiles')).length===1));
 }
 ok('estado menu tras entrar',await pg.evaluate(()=>state)==='menu');
 const modes=patched?['bubble','tetris','blocks','snake']:['bubble','tetris','blocks'];
 for(const m of modes){
  await pg.evaluate(m=>{mode=m;diff='normal';startPlay();},m);
  for(let i=0;i<4;i++){await pg.mouse.move(240,300);await pg.mouse.down();await pg.mouse.up();await pg.keyboard.press('ArrowLeft');await pg.keyboard.press('Space');await pg.waitForTimeout(150);}
  ok('modo '+m+' en play sin errores',await pg.evaluate(()=>state)==='play');
  await pg.evaluate(()=>{state='menu';});
 }
 if(patched){
  await pg.evaluate(()=>{mode='snake';startPlay();});
  const l0=await pg.evaluate(()=>snake.length);
  await pg.evaluate(()=>{sfood={x:snake[0].x+1,y:snake[0].y};});await pg.waitForTimeout(400);
  ok('snake crece al comer',await pg.evaluate(()=>snake.length)>l0);
  await pg.evaluate(()=>{snake.length=1;snake[0]={x:SN-1,y:5};sdir=snext={x:1,y:0};});await pg.waitForTimeout(500);
  ok('snake pierde al chocar pared',await pg.evaluate(()=>state)==='lose');
  // colores presentes (Burbujas)
  await pg.evaluate(()=>{state='menu';mode='bubble';diff='normal';startPlay();});
  const bad=await pg.evaluate(()=>{const keep=3;grid.forEach(r=>r.forEach((b,i)=>{if(b)b.color=keep;}));let n=0;for(let i=0;i<300;i++){if(pickColor()!==keep)n++;}return n;});
  ok('pickColor solo ofrece colores presentes',bad===0);
  // saludos
  ok('Carolina sin UUID configurado: isCarolinaProfile false',await pg.evaluate(()=>isCarolinaProfile())===false);
  const r=await pg.evaluate(()=>{const id=profile.id;localStorage.setItem('coraline_carolina_id',id);return isCarolinaProfile();});
  ok('perfil con UUID verificado = Carolina',r===true);
  await pg.evaluate(()=>{localStorage.removeItem('coraline_carolina_id');});
  // piedra mágica coloca en casilla vacía
  await pg.evaluate(()=>{state='play';stone=100;armed=true;ready100=true;proj=null;endTimer=null;});
  const placed=await pg.evaluate(()=>{let t=null;for(let r=0;r<ROWS&&!t;r++)for(let c=0;c<COLS;c++){if(!grid[r][c]&&(r===0||neigh(r,c).some(([a,b])=>grid[a][b]))){t={r,c};break;}}const p=cellPos(t.r,t.c);const before=grid.flat().filter(Boolean).length;tryMagicPlace(p.x,p.y);return {t,before,after:grid.flat().filter(Boolean).length,armed,stone};});
  ok('piedra mágica coloca y consume carga',placed.armed===false&&placed.stone<100);
  // migración de puntajes
  const mig=await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('coraline_scores',JSON.stringify([{name:'Vieja',score:123,mode:'Tetris',date:'1/1/2026'},{name:'Otro',score:50,mode:'Burbujas',date:'2/1/2026'}]));const orig=localStorage.getItem('coraline_scores');migrateScores();const v2=JSON.parse(localStorage.getItem('coraline_scores_v2'));return {n:v2.length,same:localStorage.getItem('coraline_scores')===orig,legacy:v2.every(x=>x.profileId===LEGACY_PROFILE_ID)};});
  ok('migración: 2 registros copiados, original intacto, perfil heredado',mig.n===2&&mig.same&&mig.legacy);
 }
 ok('sin errores de consola/página',errs.length===0);
 console.log(res.map(r=>r.join(' ')).join('\n'));if(errs.length)console.log(errs.join('\n'));
 await b.close();srv.close();process.exit(res.some(r=>r[0]==='FAIL')?1:0);
})();
