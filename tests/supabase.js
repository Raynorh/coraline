// Pruebas del ranking compartido con un Supabase simulado (sin red real). Uso: NODE_PATH=$(npm root -g) node tests/supabase.js [carpeta dist]
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const dir=path.resolve(process.argv[2]||'dist');
const srv=http.createServer((q,r)=>{let p=path.join(dir,q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return;}if(p.endsWith('.html'))d=Buffer.from(d.toString('utf8').replace(/const SB_CONF=\{url:'[^']*',key:'[^']*'\}/,"const SB_CONF={url:'',key:''}"));r.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html':'audio/mpeg'});r.end(d);});});
(async()=>{await new Promise(r=>srv.listen(0,r));const url='http://127.0.0.1:'+srv.address().port+'/';
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:480,height:760}});
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const res=[];const ok=(n,c)=>res.push([c?'OK  ':'FAIL',n]);const E=(f,a)=>pg.evaluate(f,a);
 // --- Supabase simulado ---
 const db={profiles:{},scores:{}};let down=false,badKey=false;const log=[];
 await pg.route('https://demo.supabase.co/**',async route=>{const rq=route.request(),u=new URL(rq.url()),p=u.pathname.replace('/rest/v1/',''),h=rq.headers();log.push(rq.method()+' '+p);
  const json=(s,o)=>route.fulfill({status:s,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'},body:o==null?'':JSON.stringify(o)});
  if(rq.method()==='OPTIONS')return json(204);
  if(down)return route.abort();if(badKey||h.apikey!=='k'.repeat(30))return json(401,{message:'bad key'});
  const body=rq.postData()?JSON.parse(rq.postData()):null;
  if(rq.method()==='POST'&&p==='profiles'){body.forEach(x=>{if(!db.profiles[x.id])db.profiles[x.id]={id:x.id,nickname:x.nickname,is_special:false};});return json(201);}
  if(rq.method()==='PATCH'&&p==='profiles'){const id=u.searchParams.get('id').replace('eq.','');if(db.profiles[id])db.profiles[id].nickname=body.nickname;return json(204);}
  if(rq.method()==='POST'&&p==='scores'){body.forEach(x=>{if(!db.profiles[x.profile_id])return;db.scores[x.id]=x;});return json(201);}
  if(rq.method()==='GET'&&p==='profiles')return json(200,[]);
  if(rq.method()==='GET'&&p==='leaderboard_all'&&!u.searchParams.get('game')?.startsWith('eq.'))return json(200,[]);
  if(rq.method()==='GET'&&(p==='leaderboard_all'||p==='leaderboard')){const g=u.searchParams.get('game').slice(3),m=u.searchParams.get('mode').slice(3),d=u.searchParams.get('diff');const best={};
   Object.values(db.scores).filter(s=>s.game===g&&s.mode===m&&(!d||s.diff===d.slice(3))).forEach(s=>{best[s.profile_id]=Math.max(best[s.profile_id]||0,s.score);});
   return json(200,Object.keys(best).map(id=>({profile_id:id,nickname:db.profiles[id].nickname,is_special:db.profiles[id].is_special,best:best[id]})).sort((a,c)=>c.best-a.best));}
  return json(404,{});});
 await pg.goto(url+'#nube');await pg.waitForTimeout(500);await pg.mouse.click(240,380);await pg.fill('#profile-name','Raynor');await pg.click('#profile-create');await pg.waitForTimeout(200);
 ok('Sin configurar: el juego funciona solo en local y no llama a la red',await E(()=>!SB.on())&&log.length===0);
 await E(()=>{mode='snake';startPlay();score=250;scoreRecorded=false;recordScore();});
 ok('Sin Supabase el puntaje se guarda local y no queda cola',await E(()=>ScoreStore.top('snake','walls','all').length===1&&SB.queue().length===0));
 // --- configurar desde el panel ---
 await E(()=>{openConfig();});await pg.fill('#sb-url','https://demo.supabase.co');await pg.fill('#sb-key','k'.repeat(30));await pg.click('#sb-save');await pg.waitForTimeout(900);
 ok('Configuración: "Guardar y probar" conecta y lo informa',await E(()=>/Conexión correcta/.test($('sb-status').textContent)&&SB.on()));
 ok('Al conectar se suben los puntajes que ya existían en el dispositivo (perfil + puntaje)',Object.keys(db.profiles).length===1&&Object.keys(db.scores).length===1);
 // --- nuevo puntaje ---
 await E(()=>{mode='kong';startPlay();score=4200;scoreRecorded=false;recordScore({level:3});});await pg.waitForTimeout(700);
 ok('Un puntaje nuevo viaja a Supabase con su juego, modo, dificultad y nivel',Object.values(db.scores).some(s=>s.game==='kong'&&s.score===4200&&s.level===3&&s.mode==='story'&&!!s.diff));
 // --- sin conexión: cola y reintento ---
 down=true;await E(()=>{mode='blocks';startPlay();score=900;scoreRecorded=false;recordScore();});await pg.waitForTimeout(700);
 ok('Sin conexión el puntaje queda en cola (no se pierde)',await E(()=>SB.queue().length===1)&&!Object.values(db.scores).some(s=>s.score===900));
 down=false;await E(()=>SB.flush());await pg.waitForTimeout(500);
 ok('Al volver la conexión la cola se envía',await E(()=>SB.queue().length===0)&&Object.values(db.scores).some(s=>s.score===900));
 await E(()=>{SB.flush();});await pg.waitForTimeout(300);
 ok('Reenviar no duplica puntajes (id único)',Object.keys(db.scores).length===3);
 // --- ranking compartido con dos jugadores (Carolina marcada como especial) ---
 db.profiles['11111111-1111-4111-8111-111111111111']={id:'11111111-1111-4111-8111-111111111111',nickname:'Carolina',is_special:true};
 db.scores.c1={id:'c1',profile_id:'11111111-1111-4111-8111-111111111111',game:'kong',mode:'story',diff:'normal',score:9000};
 await E(()=>{scGame='kong';scMode='story';scDiff='all';renderScores();showPanel('scores-panel',true);});await pg.waitForTimeout(900);
 const html=await E(()=>$('scores-body').innerHTML);
 ok('Puntajes: muestra el ranking compartido con 💛 en el perfil especial y ambos jugadores',/Ranking compartido/.test(html)&&/💛 Carolina/.test(html)&&/Raynor/.test(html)&&html.indexOf('Carolina')<html.indexOf('Raynor'));
 // --- apodo cambiado se actualiza ---
 await E(()=>{profile.nickname='Raynor2';mode='snake';startPlay();score=300;scoreRecorded=false;recordScore();});await pg.waitForTimeout(700);
 ok('Si cambias el apodo se actualiza en la nube (PATCH)',Object.values(db.profiles).some(p=>p.nickname==='Raynor2'));
 // --- clave incorrecta ---
 badKey=true;await E(()=>{openConfig();});await pg.click('#sb-save');await pg.waitForTimeout(700);
 ok('Clave incorrecta: avisa el error sin romper el juego',await E(()=>/No funcionó/.test($('sb-status').textContent)));
 ok('Sin errores de página',errs.length===0);
 console.log(res.map(r=>r.join(' ')).join('\n'));if(errs.length)console.log(errs.join('\n'));
 await b.close();srv.close();process.exit(res.some(r=>r[0]==='FAIL')?1:0);})();
