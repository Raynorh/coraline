const fs = require('fs');
const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');
let n = 0;
function rep(old, neu, label) {
  const c = html.split(old).length - 1;
  if (c !== 1) {
    console.error('FAIL', label || old.slice(0, 80), 'count=' + c);
    process.exit(1);
  }
  html = html.replace(old, neu);
  n++;
}

rep("const VERSION='v0.6.0';", "const VERSION='v0.7.0';");

rep(
  "<p><b>Dos modos:</b> Burbujas de Botones (dispara y rebota) y Botones Tetris (apila piezas, limpia filas y libera a los ratoncitos atrapados abajo). Elige la dificultad antes de entrar.</p>",
  "<p><b>Cuatro modos:</b> Burbujas, Tetris, Bloques y Snake. Elige la dificultad antes de entrar. En Bloques puedes usar botones redondos o cuadrados.</p>"
);

rep(
  "<h3>🔺 Piedra Mágica</h3>Se carga con cada botón destruido. Al 100% pulsa el botón verde o <b>Espacio</b>: una mirilla láser con rebote guía tu próximo tiro.",
  "<h3>🔺 Piedra Mágica</h3>Se carga con cada botón destruido. Al 100% pulsa el botón verde o <b>Espacio</b> y toca una casilla vacía: el botón se coloca ahí. El Gato también puede intercambiar el botón actual con el siguiente."
);

rep(
`    <button id="modal-close">Volver</button>
  </div>
</div>`,
`    <button id="modal-close">Volver</button>
  </div>
  <div id="profiles">
    <h2>Jugadores</h2>
    <p id="profile-hint">Cada perfil tiene su propia identidad. El apodo solo se muestra: dos jugadores pueden llamarse igual y seguir siendo distintos. El saludo se escucha una vez por perfil.</p>
    <div id="profile-list"></div>
    <input id="profile-name" maxlength="18" placeholder="Apodo" autocomplete="off">
    <button id="profile-create" type="button">Crear perfil</button>
    <button id="profile-close" type="button">Volver</button>
  </div>
  <div id="scores-panel">
    <h2>Mejores puntajes</h2>
    <div id="scores-body"></div>
    <button id="scores-close" type="button">Volver</button>
  </div>
</div>`
);

rep(
  "#settings .ok{color:#06d6a0}#settings .def{color:#b79cd6}",
  "#settings .ok{color:#06d6a0}#settings .def{color:#b79cd6}\n  #profiles,#scores-panel{position:absolute;inset:0;background:#0a0612f2;display:none;padding:22px 18px;box-sizing:border-box;overflow-y:auto;color:#e9ddf7;z-index:7;font-size:14px;line-height:1.4}\n  #profiles h2,#scores-panel h2{font-family:'Cinzel Decorative',Georgia,serif;color:#ffd166;margin:0 0 8px;font-size:22px;text-align:center}\n  #profiles input{display:block;width:100%;box-sizing:border-box;margin:10px 0;padding:10px 12px;border-radius:12px;border:2px solid #9b5de5;background:#1c0d30;color:#fff;font:700 15px Quicksand,sans-serif}\n  #profiles button,#scores-panel button,#profile-list button{display:block;width:100%;margin:8px 0;padding:10px 12px;border-radius:16px;border:2px solid #9b5de5;background:#2a1346;color:#fff;font:700 14px Quicksand,sans-serif;cursor:pointer}\n  #profile-list button.on{border-color:#06d6a0}"
);

rep(
  "function setMuted(m){muted=m;if(master)master.gain.value=m?0:1;Object.values(music).forEach(a=>a.muted=m);Object.values(voices).forEach(a=>{if(m)a.pause();});}",
  "function setMuted(m){muted=m;if(master)master.gain.value=m?0:1;Object.values(music).forEach(a=>a.muted=m);Object.values(voices).forEach(a=>{if(m)a.pause();});if(m){try{doorGreeting.pause();}catch(e){}}else if(typeof playGeneralGreeting==='function')playGeneralGreeting();}"
);

rep(
`let doorGreetingPlayed=false;
function playDoorGreeting(){
 if(doorGreetingPlayed)return;
 doorGreetingPlayed=true;
 try{doorGreeting.pause();doorGreeting.currentTime=0;const p=doorGreeting.play();if(p&&p.catch)p.catch(()=>{});}catch(e){}
}`,
`function playConfirmed(audio,onStart){
 if(muted||!audio)return;
 try{
  audio.pause();audio.currentTime=0;
  const p=audio.play();
  if(p&&p.then)p.then(()=>onStart()).catch(()=>{});
  else onStart();
 }catch(e){}
}
function playGeneralGreeting(){
 if(!profile||muted||profile.greetings.generalPlayed)return;
 const a=voices.bienvenida;if(!a||a._bad)return;
 playConfirmed(a,()=>{profile.greetings.generalPlayed=true;persistProfile();});
}
function playDoorGreeting(){
 if(!profile||muted||!isCarolinaProfile()||profile.greetings.carolinaDoorPlayed)return;
 playConfirmed(doorGreeting,()=>{profile.greetings.carolinaDoorPlayed=true;persistProfile();});
}`
);

rep(
  "try{const m=localStorage.getItem('cor_mode'),d=localStorage.getItem('cor_diff');if(m==='tetris'||m==='bubble'||m==='blocks')mode=m;if(DIFF[d])diff=d;}catch(e){}",
  "try{const m=localStorage.getItem('cor_mode'),d=localStorage.getItem('cor_diff');if(m==='tetris'||m==='bubble'||m==='blocks'||m==='snake')mode=m;if(DIFF[d])diff=d;}catch(e){}"
);

rep(
`function saveSel(){try{localStorage.setItem('cor_mode',mode);localStorage.setItem('cor_diff',diff);}catch(e){}}`,
`function saveSel(){try{localStorage.setItem('cor_mode',mode);localStorage.setItem('cor_diff',diff);}catch(e){}}
let blocksStyle='rounded',profile=null;
const LEGACY_PROFILE_ID='00000000-0000-4000-8000-000000000001';
// Identidad interna de Carolina. No se infiere por apodo.
// Permanece vacía hasta confirmar el perfil auténtico; también se lee coraline_carolina_id.
const CAROLINA_ID='';
function newId(){if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,ch=>{const r=Math.random()*16|0;return (ch==='x'?r:(r&3|8)).toString(16);});}
function loadProfiles(){try{const l=JSON.parse(localStorage.getItem('coraline_profiles')||'[]');return Array.isArray(l)?l:[];}catch(e){return [];}}
function makeProfile(nickname){return {id:newId(),nickname:nickname,createdAt:new Date().toISOString(),preferences:{blocksStyle:'rounded'},greetings:{generalPlayed:false,carolinaDoorPlayed:false}};}
function persistProfile(){if(!profile)return;if(!profile.preferences)profile.preferences={blocksStyle:blocksStyle};profile.preferences.blocksStyle=blocksStyle;if(!profile.greetings)profile.greetings={generalPlayed:false,carolinaDoorPlayed:false};const list=loadProfiles();const i=list.findIndex(p=>p.id===profile.id);if(i>=0)list[i]=profile;else list.push(profile);try{localStorage.setItem('coraline_profiles',JSON.stringify(list));localStorage.setItem('coraline_profile',profile.id);localStorage.setItem('cor_blocks_style',blocksStyle);}catch(e){}}
function carolinaId(){if(CAROLINA_ID)return CAROLINA_ID;try{return localStorage.getItem('coraline_carolina_id')||'';}catch(e){return '';}}
function isCarolinaProfile(){const id=carolinaId();return !!(profile&&id&&profile.id===id);}
function applyProfile(p){profile=p;if(!profile.preferences)profile.preferences={blocksStyle:'rounded'};if(!profile.greetings)profile.greetings={generalPlayed:false,carolinaDoorPlayed:false};blocksStyle=profile.preferences.blocksStyle==='square'?'square':'rounded';}
function migrateScores(){const flag='coraline_scores_migrated_v1';try{if(localStorage.getItem(flag)==='1')return;let list=[];try{list=JSON.parse(localStorage.getItem('coraline_scores')||'[]');}catch(e){list=[];}if(!Array.isArray(list))list=[];let v2=[];try{v2=JSON.parse(localStorage.getItem('coraline_scores_v2')||'[]');}catch(e){v2=[];}if(!Array.isArray(v2))v2=[];const key=s=>[s.profileId,s.name,s.score,s.mode,s.date].join('|');const seen=new Set(v2.map(key));list.forEach(v=>{if(!v||typeof v!=='object')return;const row={profileId:LEGACY_PROFILE_ID,name:String(v.name||'Jugador').slice(0,18),score:Number(v.score)||0,mode:String(v.mode||'Burbujas'),date:String(v.date||'')};const k=key(row);if(!seen.has(k)){v2.push(row);seen.add(k);}});localStorage.setItem('coraline_scores_v2',JSON.stringify(v2));localStorage.setItem(flag,'1');}catch(e){}}
function bootProfile(){migrateScores();try{const saved=localStorage.getItem('cor_blocks_style');if(saved==='square'||saved==='rounded')blocksStyle=saved;const id=localStorage.getItem('coraline_profile');const found=loadProfiles().find(p=>p.id===id);if(found)applyProfile(found);}catch(e){}}
function renderProfiles(){const box=document.getElementById('profile-list');const list=loadProfiles();box.innerHTML=list.map(p=>'<button type="button" class="'+(profile&&profile.id===p.id?'on':'')+'" data-id="'+p.id+'">'+(p.nickname||'Jugador')+(profile&&profile.id===p.id?' · actual':'')+'</button>').join('')||'<p>Crea tu primer perfil.</p>';box.querySelectorAll('button').forEach(b=>b.onclick=()=>{const next=loadProfiles().find(p=>p.id===b.dataset.id);if(!next)return;applyProfile(next);persistProfile();document.getElementById('profiles').style.display='none';playGeneralGreeting();});}
function openProfiles(){renderProfiles();document.getElementById('profiles').style.display='block';}
function createNamedProfile(){const nick=(document.getElementById('profile-name').value||'').trim().slice(0,18)||'Jugador';if(profile)persistProfile();applyProfile(makeProfile(nick));persistProfile();document.getElementById('profile-name').value='';document.getElementById('profiles').style.display='none';playGeneralGreeting();}
bootProfile();
document.getElementById('profile-create').onclick=createNamedProfile;
document.getElementById('profile-close').onclick=()=>{if(!profile)return;document.getElementById('profiles').style.display='none';};
document.getElementById('scores-close').onclick=()=>{document.getElementById('scores-panel').style.display='none';};`
);

rep(
`function pickColor(){
 // Asistencia estratégica: el cargador prioriza colores presentes y, sobre todo,
 // los que protegen ratoncitos. La ayuda baja gradualmente en Normal/Difícil.
 const counts=Array(7).fill(0),mice=Array(7).fill(0);
 if(grid)grid.forEach(row=>row.forEach(b=>{if(b){counts[b.color]++;if(b.mouse)mice[b.color]++;}}));
 const choices=counts.map((n,c)=>({c,w:n?Math.pow(n, diff==='facil'?1.18:diff==='normal'?1.02:.88)+mice[c]*(diff==='facil'?4:diff==='normal'?2.6:1.6):0}));
 const total=choices.reduce((s,o)=>s+o.w,0);if(!total)return ri(5);
 let roll=Math.random()*total;for(const o of choices){roll-=o.w;if(roll<=0)return o.c;}return choices.find(o=>o.w>0).c;
}`,
`function colorsPresent(){const seen=new Set();if(grid)grid.forEach(row=>row.forEach(b=>{if(b)seen.add(b.color);}));return seen;}
function pickColor(){
 // Solo colores que siguen en el tablero. Si el tablero quedó vacío, usa la paleta de la dificultad.
 const counts=Array(7).fill(0),mice=Array(7).fill(0);
 if(grid)grid.forEach(row=>row.forEach(b=>{if(b){counts[b.color]++;if(b.mouse)mice[b.color]++;}}));
 const present=[];counts.forEach((n,c)=>{if(n)present.push(c);});
 const pool=present.length?present:Array.from({length:DIFF[diff].colors},(_,i)=>i);
 const choices=pool.map(c=>{const n=counts[c];const w=n?Math.pow(n, diff==='facil'?1.18:diff==='normal'?1.02:.88)+mice[c]*(diff==='facil'?4:diff==='normal'?2.6:1.6):1;return {c,w};});
 const total=choices.reduce((s,o)=>s+o.w,0)||1;let roll=Math.random()*total;
 for(const o of choices){roll-=o.w;if(roll<=0)return o.c;}return choices[0].c;
}
function syncLauncher(){const present=colorsPresent();if(!present.size)return;if(!present.has(cur))cur=pickColor();if(!present.has(nxt))nxt=pickColor();}`
);

rep(
  "function startPlay(){scoreRecorded=false;unlock();(mode==='tetris'?tNew():mode==='blocks'?bNew():newGame());state='play';fade=1;setMusic('partida');stoneBtn.style.display=mode==='blocks'?'none':'block';updateStoneBtn();}",
  "function startPlay(){scoreRecorded=false;unlock();if(mode==='tetris')tNew();else if(mode==='blocks')bNew();else if(mode==='snake')sNew();else newGame();state='play';fade=1;setMusic('partida');stoneBtn.style.display=(mode==='blocks'||mode==='snake')?'none':'block';updateStoneBtn();}"
);

rep(
`function afterShot(){
 if(stone>=100&&!ready100){ready100=true;SFX.ready();say('Gato Negro','La Piedra Mágica está lista… pulsa 🔺 o Espacio.',3000);}`,
`function afterShot(){
 syncLauncher();
 if(stone>=100&&!ready100){ready100=true;SFX.ready();say('Gato Negro','La Piedra Mágica está lista… pulsa 🔺 o Espacio y toca una casilla vacía.',3000);}`
);

rep(
  "function activateMagic(){if(state==='play'&&mode==='tetris'){if(stone<100)return;playVoice('poder');say('Gato Negro','Usa la piedra mágica. Mira a través del agujero.',3600);tStone();return;}if(state!=='play'||stone<100||armed||proj)return;armed=true;playVoice('poder');say('Gato Negro','Usa la piedra mágica. Mira a través del agujero.',3600);updateStoneBtn();}",
  `function swapShot(){if(state!=='play'||mode!=='bubble'||proj||endTimer)return;const t=cur;cur=nxt;nxt=t;SFX.bounce();}
function tryMagicPlace(x,y){
 if(!armed||proj||endTimer||state!=='play')return false;
 let best=null,bd=R*R*1.35;
 for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++){const p=cellPos(r,c),d=(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;best={r,c};}}
 if(!best){say('Gato Negro','Toca una casilla vacía, pegada a otros botones.',1800);return true;}
 const r=best.r,c=best.c;
 if(grid[r][c]){say('Gato Negro','Esa casilla ya tiene un botón.',1600);return true;}
 if(r>0&&!neigh(r,c).some(([a,b])=>grid[a][b])){say('Gato Negro','Solo puedes colocar junto a otros botones.',1800);return true;}
 const col=cur;grid[r][c]={color:col,mouse:false};cur=nxt;nxt=pickColor();
 armed=false;stone=0;ready100=false;
 const grp=flood(r,c);
 if(grp.length>=3){combo++;grp.forEach(([a,b],i)=>popCell(a,b,i));SFX.pop(Math.min(grp.length,8));stone=Math.min(100,stone+grp.length*10);dropOrphans();}
 else{SFX.stick();combo=0;}
 afterShot();return true;
}
function activateMagic(){if(state==='play'&&mode==='tetris'){if(stone<100)return;playVoice('poder');say('Gato Negro','Usa la piedra mágica. Mira a través del agujero.',3600);tStone();return;}if(state!=='play'||mode!=='bubble'||stone<100||armed||proj)return;armed=true;playVoice('poder');say('Gato Negro','Toca una casilla vacía para colocar el botón. La piedra se consume al colocarlo.',3600);updateStoneBtn();}`
);

rep(
  " txt('SIGUIENTE',x+34,y+30,'700 9px Quicksand,sans-serif','#cdb6ea');}",
  " txt('SIGUIENTE',x+34,y+30,'700 9px Quicksand,sans-serif','#cdb6ea');txt('⇄',x+34,y+44,'700 13px Quicksand,sans-serif','#7fdcff');hits.push({x:x+8,y:y-28,w:52,h:78,id:'swap'});}"
);

rep(
  "menuBtn('🏆 Mejores puntajes',570,'scores','#ffd166');",
  "menuBtn('🏆 Mejores puntajes',570,'scores','#ffd166');menuBtn('👤 '+(profile?profile.nickname:'Elegir jugador'),624,'profile','#7fdcff');"
);

rep(
`function drawSelect(){drawSky();moonButton(410,70,34);drawFog(.15);drawFireflies();const D=DIFF[diff];
 txt('Elige tu aventura',240,72,'900 25px "Cinzel Decorative",Georgia,serif','#ffd166');
 const cards=[{x:12,id:'mb',sel:mode==='bubble',title:'Burbujas',desc:'Dispara y rescata',c:'#9b5de5'},
 {x:168,id:'mt',sel:mode==='tetris',title:'Tetris',desc:'Limpia filas',c:'#06d6a0'},
 {x:324,id:'mbl',sel:mode==='blocks',title:'Bloques',desc:'Block Blast',c:'#ff9f43'}];
 cards.forEach(o=>{card(o.x,105,144,205,o.sel,o.id);});
 // miniaturas de cada modo
 drawBtnS(52,158,1,false,16);drawBtnS(88,158,0,true,16);drawBtnS(124,158,2,false,16);drawBtnS(70,194,3,false,16);drawBtnS(106,194,4,false,16);
 [[0,0,2],[1,0,2],[2,0,2],[1,1,2]].forEach(([a,b,c])=>drawBtnS(220+a*25,155+b*25,c,false,12));
 const mini=[[1,1],[1,1],[1,1],[1,1],[1,1],[1,1]];
 mini.forEach((p,i)=>{ctx.fillStyle=['#ff5d8f','#3a86ff','#ffd166','#9b5de5','#06d6a0','#ff9f43'][i];rr(350+(i%3)*27,146+Math.floor(i/3)*27,23,23,5);ctx.fill();});
 txt('Burbujas',84,250,'700 14px Quicksand,sans-serif','#fff');txt('Dispara y rescata',84,273,'500 11px Quicksand,sans-serif','#cdb6ea');
 txt('Tetris',240,250,'700 14px Quicksand,sans-serif','#fff');txt('Limpia filas',240,273,'500 11px Quicksand,sans-serif','#cdb6ea');
 txt('Bloques',396,250,'700 14px Quicksand,sans-serif','#fff');txt('Estilo Block Blast',396,273,'500 11px Quicksand,sans-serif','#cdb6ea');
 txt('Dificultad',240,344,'700 16px Quicksand,sans-serif','#8fe9c9');
 [['df','Fácil','facil'],['dn','Normal','normal'],['dd','Difícil','dificil']].forEach(([id,l,k],i)=>{const x=24+i*146,y=356,sel=diff===k;ctx.fillStyle=sel?'#06705a':'#2a1346';rr(x,y,140,42,21);ctx.fill();ctx.strokeStyle=sel?'#06d6a0':'#9b5de5';ctx.lineWidth=sel?3:2;ctx.stroke();txt(l,x+70,y+27,'700 16px Quicksand,sans-serif','#fff');hits.push({x,y,w:140,h:42,id});});
 const d=mode==='bubble'?D.ammo+' botones · '+D.colors+' colores':mode==='tetris'?'Caída '+(D.t>=800?'lenta':D.t>=500?'media':'rápida')+' · '+D.garb+' filas-trampa':'Tablero 8×8 · combina filas y columnas';
 txt(d,240,428,'500 13px Quicksand,sans-serif','#cdb6ea');
 menuBtn('¡Entrar al Otro Mundo!',460,'go','#06d6a0');menuBtn('Volver',516,'back');}`,
`function drawSelect(){drawSky();moonButton(438,28,18);drawFog(.15);drawFireflies();const D=DIFF[diff];
 txt('Elige tu aventura',240,40,'900 22px "Cinzel Decorative",Georgia,serif','#ffd166');
 const cards=[{x:10,id:'mb',sel:mode==='bubble'},{x:128,id:'mt',sel:mode==='tetris'},{x:246,id:'mbl',sel:mode==='blocks'},{x:364,id:'ms',sel:mode==='snake'}];
 cards.forEach(o=>card(o.x,58,110,150,o.sel,o.id));
 drawBtnS(38,100,1,false,10);drawBtnS(66,100,0,true,10);drawBtnS(94,100,2,false,10);drawBtnS(52,126,3,false,10);drawBtnS(80,126,4,false,10);
 [[0,0,2],[1,0,2],[2,0,2],[1,1,2]].forEach(([a,b,c])=>drawBtnS(156+a*16,96+b*16,c,false,7));
 [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]].forEach(([a,b],i)=>{ctx.fillStyle=['#ff5d8f','#3a86ff','#ffd166','#9b5de5','#06d6a0','#ff9f43'][i];rr(268+a*20,92+b*20,16,16,blocksStyle==='square'?2:4);ctx.fill();});
 ctx.strokeStyle='#06d6a0';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(392,150);ctx.lineTo(446,150);ctx.lineTo(446,112);ctx.lineTo(404,112);ctx.stroke();
 ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(404,112,4,0,TAU);ctx.fill();
 txt('Burbujas',65,168,'700 12px Quicksand,sans-serif','#fff');txt('Dispara',65,186,'500 10px Quicksand,sans-serif','#cdb6ea');
 txt('Tetris',183,168,'700 12px Quicksand,sans-serif','#fff');txt('Filas',183,186,'500 10px Quicksand,sans-serif','#cdb6ea');
 txt('Bloques',301,168,'700 12px Quicksand,sans-serif','#fff');txt('Encaja',301,186,'500 10px Quicksand,sans-serif','#cdb6ea');
 txt('Snake',419,168,'700 12px Quicksand,sans-serif','#fff');txt('El hilo',419,186,'500 10px Quicksand,sans-serif','#cdb6ea');
 txt('Dificultad',240,236,'700 15px Quicksand,sans-serif','#8fe9c9');
 [['df','Fácil','facil'],['dn','Normal','normal'],['dd','Difícil','dificil']].forEach(([id,l,k],i)=>{const x=16+i*156,y=250,sel=diff===k;ctx.fillStyle=sel?'#06705a':'#2a1346';rr(x,y,148,40,20);ctx.fill();ctx.strokeStyle=sel?'#06d6a0':'#9b5de5';ctx.lineWidth=sel?3:2;ctx.stroke();txt(l,x+74,y+26,'700 15px Quicksand,sans-serif','#fff');hits.push({x,y,w:148,h:40,id});});
 const d=mode==='bubble'?D.ammo+' botones · '+D.colors+' colores':mode==='tetris'?'Caída '+(D.t>=800?'lenta':D.t>=500?'media':'rápida')+' · '+D.garb+' filas-trampa':mode==='snake'?(diff==='facil'?'Paso lento':diff==='normal'?'Paso medio':'Paso rápido')+' · crece al comer':'Tablero 8×8 · '+(blocksStyle==='square'?'botones cuadrados':'botones redondos');
 txt(d,240,314,'500 13px Quicksand,sans-serif','#cdb6ea');
 if(mode==='blocks'){[['bst-r','Redondo','rounded'],['bst-s','Cuadrado','square']].forEach(([id,l,k],i)=>{const x=40+i*210,y=334,sel=blocksStyle===k;ctx.fillStyle=sel?'#06705a':'#2a1346';rr(x,y,190,40,20);ctx.fill();ctx.strokeStyle=sel?'#06d6a0':'#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(l,x+95,y+26,'700 15px Quicksand,sans-serif','#fff');hits.push({x,y,w:190,h:40,id});});
  menuBtn('¡Entrar al Otro Mundo!',392,'go','#06d6a0');menuBtn('Volver',448,'back');}
 else{menuBtn('¡Entrar al Otro Mundo!',348,'go','#06d6a0');menuBtn('Volver',404,'back');}}`
);

rep(
  " if(id==='mb'||id==='mt'||id==='mbl'){mode={mb:'bubble',mt:'tetris',mbl:'blocks'}[id];saveSel();return true;}",
  " if(id==='mb'||id==='mt'||id==='mbl'||id==='ms'){mode={mb:'bubble',mt:'tetris',mbl:'blocks',ms:'snake'}[id];saveSel();return true;}\n if(id==='swap'){swapShot();return true;}\n if(id==='bstyle'||id==='bst-r'||id==='bst-s'){blocksStyle=(id==='bst-s'||(id==='bstyle'&&blocksStyle!=='square'))?'square':'rounded';if(profile)persistProfile();else{try{localStorage.setItem('cor_blocks_style',blocksStyle);}catch(e){}}return true;}\n if(id==='sU'||id==='sD'||id==='sL'||id==='sR'){sPress(id);return true;}"
);

rep(
  "function bDrawButtonCell(x,y,color,alpha=1,scale=0.82){ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale((BS*scale/2)/R,(BS*scale/2)/R);drawButton(0,0,color,false,alpha);ctx.restore();}",
  "function bDrawButtonCell(x,y,color,alpha=1,scale=0.82){ctx.save();ctx.globalAlpha=alpha==null?1:alpha;const col=COLORS[color]||COLORS[0];if(blocksStyle==='square'){const s=BS*scale;ctx.fillStyle='rgba(0,0,0,.35)';rr(x-s/2+1.5,y-s/2+2,s,s,2);ctx.fill();ctx.fillStyle=col.b;rr(x-s/2,y-s/2,s,s,2);ctx.fill();ctx.fillStyle=col.f;rr(x-s/2+4,y-s/2+4,s-8,s-8,1);ctx.fill();ctx.fillStyle='#1b1020';[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(x+a*s*.18,y+b*s*.18,Math.max(1.2,s*.06),0,TAU);ctx.fill();});ctx.strokeStyle='#f3e9d2';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-s*.16,y-s*.16);ctx.lineTo(x+s*.16,y+s*.16);ctx.moveTo(x+s*.16,y-s*.16);ctx.lineTo(x-s*.16,y+s*.16);ctx.stroke();}else{ctx.translate(x,y);ctx.scale((BS*scale/2)/R,(BS*scale/2)/R);drawButton(0,0,color,false,alpha);}ctx.restore();}"
);

rep(
  " ctx.fillStyle=v>=0?'rgba(40,24,58,.96)':'rgba(174,145,205,.24)';rr(x+2,y+2,BS-4,BS-4,7);ctx.fill();",
  " ctx.fillStyle=v>=0?'rgba(40,24,58,.96)':'rgba(174,145,205,.24)';rr(x+2,y+2,BS-4,BS-4,blocksStyle==='square'?2:7);ctx.fill();"
);

rep(
  " rr(BX+gx*BS+1,BY+gy*BS+1,BS-2,BS-2,7);ctx.fill();",
  " rr(BX+gx*BS+1,BY+gy*BS+1,BS-2,BS-2,blocksStyle==='square'?2:7);ctx.fill();"
);

rep(
  " txt('✧ '+bscore.toLocaleString('es-CL')+' PUNTOS ✧',240,83,'900 19px Quicksand,sans-serif','#fff');",
  " txt('✧ '+bscore.toLocaleString('es-CL')+' PUNTOS ✧',240,83,'900 19px Quicksand,sans-serif','#fff');\n ctx.fillStyle='#2a1346';rr(8,62,108,30,14);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=1.5;ctx.stroke();txt(blocksStyle==='square'?'Cuadrado':'Redondo',62,82,'700 11px Quicksand,sans-serif','#fff');hits.push({x:8,y:62,w:108,h:30,id:'bstyle'});"
);

rep(
`function recordScore(){if(scoreRecorded)return;scoreRecorded=true;let name='Jugador';try{name=(prompt('¡Nueva puntuación! Escribe tu nombre:','Jugador')||'Jugador').trim().slice(0,18)||'Jugador';}catch(e){}
 let list=[];try{list=JSON.parse(localStorage.getItem('coraline_scores')||'[]');}catch(e){}list.push({name,score:Number(score)||0,mode:mode==='blocks'?'Bloques':mode==='tetris'?'Tetris':'Burbujas',date:new Date().toLocaleDateString('es-CL')});list.sort((a,b)=>b.score-a.score);localStorage.setItem('coraline_scores',JSON.stringify(list.slice(0,20)));}
function showScores(){let list=[];try{list=JSON.parse(localStorage.getItem('coraline_scores')||'[]');}catch(e){}alert(list.length?('🏆 MEJORES PUNTAJES\\\\n\\\\n'+list.slice(0,10).map((v,i)=>(i+1)+'. '+v.name+' — '+v.score+' pts ('+v.mode+')').join('\\\\n')):'Todavía no hay puntajes guardados. ¡Juega una partida!');}`,
`const SN=16,SC=22,SOX=64,SOY=108;
let snake=[],sdir={x:1,y:0},snext={x:1,y:0},sfood={x:8,y:8},sacc=0,sSwipe=null;
function sSpawnFood(){const occ=new Set(snake.map(p=>p.x+','+p.y));const free=[];for(let y=0;y<SN;y++)for(let x=0;x<SN;x++)if(!occ.has(x+','+y))free.push({x,y});return free.length?free[ri(free.length)]:{x:0,y:0};}
function sNew(){score=0;rescued=0;stone=0;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];const mid=8;snake=[{x:mid,y:mid},{x:mid-1,y:mid},{x:mid-2,y:mid}];sdir={x:1,y:0};snext={x:1,y:0};sfood=sSpawnFood();sacc=0;sSwipe=null;clearTimeout(endTimer);endTimer=null;say('Coraline','Sigue el hilo del Otro Mundo. Come botones y no choques contigo.',3600);}
function sTurn(dx,dy){if(!dx&&!dy)return;if(sdir.x+dx===0&&sdir.y+dy===0)return;snext={x:dx,y:dy};}
function sPress(id){if(state!=='play'||mode!=='snake')return;if(id==='sU')sTurn(0,-1);else if(id==='sD')sTurn(0,1);else if(id==='sL')sTurn(-1,0);else if(id==='sR')sTurn(1,0);}
function sUpdate(){if(state!=='play'||mode!=='snake'||endTimer)return;sacc+=16.7;const iv=diff==='facil'?180:diff==='normal'?125:85;if(sacc<iv)return;sacc=0;sdir=snext;const head={x:snake[0].x+sdir.x,y:snake[0].y+sdir.y};const eating=head.x===sfood.x&&head.y===sfood.y;const body=eating?snake:snake.slice(0,-1);if(head.x<0||head.y<0||head.x>=SN||head.y>=SN||body.some(p=>p.x===head.x&&p.y===head.y)){lose();return;}snake.unshift(head);if(eating){score+=40+snake.length*2;SFX.pop(2);sfood=sSpawnFood();}else snake.pop();}
function sBtn(x,y,label,id){ctx.fillStyle='#2a1346';rr(x,y,70,54,16);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(label,x+35,y+35,'700 22px Quicksand,sans-serif','#fff');hits.push({x,y,w:70,h:54,id});}
function drawSnake(){drawSky();drawFog(.12);txt('EL HILO',240,36,'900 22px "Cinzel Decorative",Georgia,serif','#ffd166');txt('⭐ '+score,78,68,'700 16px Quicksand,sans-serif','#ffd166');txt('Largo '+snake.length,240,68,'700 16px Quicksand,sans-serif','#fff');txt(DIFF[diff].n,400,68,'700 16px Quicksand,sans-serif','#8fe9c9');ctx.fillStyle='rgba(18,10,32,.94)';rr(SOX-8,SOY-8,SN*SC+16,SN*SC+16,12);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();for(let i=0;i<SN;i++)for(let j=0;j<SN;j++){ctx.fillStyle=((i+j)%2)?'rgba(255,255,255,.03)':'rgba(0,0,0,.12)';ctx.fillRect(SOX+j*SC,SOY+i*SC,SC,SC);}const foodCol=tick%40<20?4:0;drawBtnS(SOX+sfood.x*SC+SC/2,SOY+sfood.y*SC+SC/2,foodCol,false,SC/2-1);snake.forEach((p,i)=>{const x=SOX+p.x*SC+SC/2,y=SOY+p.y*SC+SC/2;ctx.fillStyle=i===0?'#06d6a0':'#0b6b52';ctx.beginPath();ctx.arc(x,y,SC*.42,0,TAU);ctx.fill();if(i===0){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+4,y-2,2,0,TAU);ctx.fill();}});sBtn(205,560,'▲','sU');sBtn(125,620,'◀','sL');sBtn(205,620,'▼','sD');sBtn(285,620,'▶','sR');[[404,'⏸','pause'],[448,muted?'🔇':'🔊','mute']].forEach(([x,t,id])=>{ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(x,28,17,0,TAU);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.stroke();txt(t,x,34,'16px sans-serif','#fff');hits.push({x:x-17,y:11,w:34,h:34,id});});drawBanner();}
function modeLabel(){return mode==='blocks'?'Bloques':mode==='tetris'?'Tetris':mode==='snake'?'Snake':'Burbujas';}
function recordScore(){if(scoreRecorded)return;scoreRecorded=true;const name=profile?profile.nickname:'Jugador';const entry={profileId:profile?profile.id:LEGACY_PROFILE_ID,name,score:Number(score)||0,mode:modeLabel(),date:new Date().toLocaleDateString('es-CL')};let v2=[];try{v2=JSON.parse(localStorage.getItem('coraline_scores_v2')||'[]');}catch(e){}if(!Array.isArray(v2))v2=[];v2.push(entry);v2.sort((a,b)=>b.score-a.score);try{localStorage.setItem('coraline_scores_v2',JSON.stringify(v2.slice(0,50)));}catch(e){}}
function showScores(){let list=[];try{list=JSON.parse(localStorage.getItem('coraline_scores_v2')||'[]');}catch(e){}if(!Array.isArray(list)||!list.length){try{list=JSON.parse(localStorage.getItem('coraline_scores')||'[]');}catch(e){list=[];}}const body=document.getElementById('scores-body');body.innerHTML=list.length?list.slice(0,10).map((v,i)=>'<div class="row" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #9b5de533"><span>'+(i+1)+'. '+(v.name||'Jugador')+'</span><span>'+v.score+' · '+v.mode+'</span></div>').join(''):'<p>Todavía no hay puntajes guardados. Juega una partida.</p>';document.getElementById('scores-panel').style.display='block';}`
);

rep(
  "function update(){tick++;if(banner.t>0)banner.t-=16.7;if(state==='play'&&mode==='tetris')tUpdate();",
  "function update(){tick++;if(banner.t>0)banner.t-=16.7;if(state==='play'&&mode==='tetris')tUpdate();else if(state==='play'&&mode==='snake')sUpdate();"
);

rep(
  " else{(mode==='tetris'?drawTetris:mode==='blocks'?drawBlocks:drawPlay)();",
  " else{(mode==='tetris'?drawTetris:mode==='blocks'?drawBlocks:mode==='snake'?drawSnake:drawPlay)();"
);

rep(
  " if(state==='lose')overlay(mode==='tetris'?'Torre llena…':mode==='blocks'?'No quedan movimientos':'Sin botones…',['Rescataste '+rescued+' de '+MICE0+' ratoncitos'],'#ff5d8f',[['Intentar de nuevo','play'],['Menú principal','menu']]);}",
  " if(state==='lose')overlay(mode==='tetris'?'Torre llena…':mode==='blocks'?'No quedan movimientos':mode==='snake'?'El hilo se enredó…':'Sin botones…',mode==='snake'?['⭐ '+score+' puntos']:['Rescataste '+rescued+' de '+MICE0+' ratoncitos'],'#ff5d8f',[['Intentar de nuevo','play'],['Menú principal','menu']]);}"
);

rep(
  " if(id==='play')startPlay();else if(id==='story'){modal.style.display='block';}",
  " if(id==='play')startPlay();else if(id==='story'){modal.style.display='block';}else if(id==='profile'){openProfiles();}"
);

rep(
  " else if(id==='resume'){state='play';setMusic('partida');stoneBtn.style.display=mode==='blocks'?'none':'block';}",
  " else if(id==='resume'){state='play';setMusic('partida');stoneBtn.style.display=(mode==='blocks'||mode==='snake')?'none':'block';}"
);

rep(
  "function enterGame(){if(state!=='splash')return;state='menu';unlock();setMusic('intro');}",
  "function enterGame(){if(state!=='splash')return;unlock();state='menu';setMusic('intro');if(!profile){openProfiles();return;}playGeneralGreeting();}"
);

rep(
  " if(state==='play'&&mode==='blocks'){bPointer();return;}if(state==='play'&&mode==='bubble'&&mouseY>TOP){if(e.pointerType==='mouse')shoot();else{aiming=true;try{cv.setPointerCapture(e.pointerId);}catch(_){}}}});",
  " if(state==='play'&&mode==='blocks'){bPointer();return;}if(state==='play'&&mode==='snake'){sSwipe={x:mouseX,y:mouseY};return;}if(state==='play'&&mode==='bubble'&&mouseY>TOP){if(armed&&mouseY<CY-30){tryMagicPlace(mouseX,mouseY);return;}if(e.pointerType==='mouse')shoot();else{aiming=true;try{cv.setPointerCapture(e.pointerId);}catch(_){}}}});"
);

rep(
  "cv.addEventListener('pointerup',e=>{pos(e);bEndDrag();tRelease();endAim(e);});",
  "cv.addEventListener('pointerup',e=>{pos(e);bEndDrag();tRelease();if(sSwipe&&state==='play'&&mode==='snake'){const dx=mouseX-sSwipe.x,dy=mouseY-sSwipe.y;if(Math.hypot(dx,dy)>24){if(Math.abs(dx)>Math.abs(dy))sTurn(dx>0?1:-1,0);else sTurn(0,dy>0?1:-1);}}sSwipe=null;endAim(e);});"
);

rep(
` if(state==='play'&&mode==='tetris'&&tp){const k=e.code;`,
` if(state==='play'&&mode==='snake'){const k=e.code;if(k==='ArrowUp'||k==='KeyW'){sTurn(0,-1);e.preventDefault();return;}if(k==='ArrowDown'||k==='KeyS'){sTurn(0,1);e.preventDefault();return;}if(k==='ArrowLeft'||k==='KeyA'){sTurn(-1,0);e.preventDefault();return;}if(k==='ArrowRight'||k==='KeyD'){sTurn(1,0);e.preventDefault();return;}}
 if(state==='play'&&mode==='bubble'&&!e.repeat&&(e.code==='KeyC'||e.code==='ShiftLeft')){swapShot();e.preventDefault();return;}
 if(state==='play'&&mode==='tetris'&&tp){const k=e.code;`
);

fs.writeFileSync(path, html);
console.log('replacements', n, 'bytes', html.length);
const lines = html.split(/\n/);
const start = lines.findIndex(l => l.trim() === '<script>');
const end = lines.findIndex(l => l.trim() === '</script>');
fs.writeFileSync('_syntax.js', lines.slice(start + 1, end).join('\n'));
console.log('script lines', end - start - 1);
