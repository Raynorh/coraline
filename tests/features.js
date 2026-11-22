// Pruebas funcionales v0.8.0 (Chromium headless). Uso: NODE_PATH=$(npm root -g) node tests/features.js [carpeta dist]
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const dir=path.resolve(process.argv[2]||'dist');const BX=68,BY=105,BS=43;
const srv=http.createServer((q,r)=>{let p=path.join(dir,q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html':'audio/mpeg'});r.end(d);});});
(async()=>{
 await new Promise(r=>srv.listen(0,r));const url='http://127.0.0.1:'+srv.address().port+'/';
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:480,height:760}});
 const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|Failed to load resource/.test(m.text()))errs.push('console: '+m.text());});
 const res=[];const ok=(n,c)=>res.push([c?'OK  ':'FAIL',n]);
 const E=(f,a)=>pg.evaluate(f,a);
 await pg.addInitScript(()=>{localStorage.setItem('cor_diff','dificil');});
 await pg.goto(url);await pg.waitForTimeout(500);await pg.mouse.click(240,380);await pg.fill('#profile-name','Ana');await pg.click('#profile-create');await pg.waitForTimeout(200);
 // ---------- 2) dificultades ----------
 ok('migración cor_diff: "dificil" guardado antes pasa a "experto"',await E(()=>diff==='experto'));
 ok('4 niveles Fácil<Normal<Difícil<Experto en velocidad Tetris y Snake',await E(()=>DIFF_KEYS.length===4&&DIFF.facil.t>DIFF.normal.t&&DIFF.normal.t>DIFF.dificil.t&&DIFF.dificil.t>DIFF.experto.t&&DIFF.facil.sv>DIFF.normal.sv&&DIFF.normal.sv>DIFF.dificil.sv&&DIFF.dificil.sv>DIFF.experto.sv));
 ok('Normal conserva el antiguo Fácil (t=900, sv=180); Experto el antiguo Difícil (t=420, sv=85)',await E(()=>DIFF.normal.t===900&&DIFF.normal.sv===180&&DIFF.experto.t===420&&DIFF.experto.sv===85&&DIFF.experto.n==='Experto'));
 // ---------- 1) Bloques ----------
 await E(()=>{diff='normal';mode='blocks';startPlay();});
 ok('Bloques inicia con 💡1 y 🔄1',await E(()=>bHints===1&&bSwaps===1));
 // piezas conocidas: vertical de 3
 await E(()=>{bpieces=[{cells:[[0,0],[0,1],[0,2]],color:2},{cells:[[0,0]],color:1},{cells:[[0,0],[1,0]],color:3}];bselected=0;});
 const mv=async(x,y)=>{await pg.mouse.move(x,y);};
 // PC: la pieza está centrada en el cursor, sin desplazamiento
 await E(()=>{lastPtr='mouse';mouseX=BX+3*BS+BS/2;mouseY=BY+4*BS+BS/2;});
 let t=await E(()=>{const t=bTargetAt(false);return {col:t.col,row:t.row,valid:t.valid};});
 ok('PC: soltar con la pieza centrada en (col 3, fila 4) la ancla en col 3, fila 3 (pieza 1×3 centrada)',t.col===3&&t.row===3&&t.valid);
 // Fluidez: mover 0,4 casilla no cambia el destino y la pieza flotante sí se mueve píxel a píxel
 const fl=await E(()=>{lastPtr='mouse';mouseX=BX+3*BS+BS/2;mouseY=BY+4*BS+BS/2;const a=bFloat(false).left,c1=bTargetAt(false).col;mouseX+=.4*BS;const b2=bFloat(false).left,c2=bTargetAt(false).col;mouseX+=.2*BS;const c3=bTargetAt(false).col;return{dx:b2-a,c1,c2,c3};});
 ok('Arrastre fluido: la pieza se mueve en píxeles exactos (no por casilla)',Math.abs(fl.dx-0.4*43)<0.01);
 ok('Se ancla a la casilla más cercana al soltar (redondeo, no salta antes de pasar la mitad)',fl.c1===3&&fl.c2===3&&fl.c3===4);
 // Móvil: pieza por encima del dedo
 const tf=await E(()=>{lastPtr='touch';mouseX=BX+3*BS+BS/2;mouseY=BY+7*BS;const f=bFloat(true);return{bottom:f.top+f.ph,finger:mouseY};});
 ok('Móvil: la base de la pieza queda ≥40 px por encima del dedo (no lo tapa)',tf.finger-tf.bottom>=40);
 // Colocación exacta + simulación con eventos de puntero reales (táctil)
 await E(()=>{bpieces=[{cells:[[0,0],[0,1],[0,2]],color:2},{cells:[[0,0]],color:1},{cells:[[0,0],[1,0]],color:3}];bselected=-1;bgrid=Array.from({length:BC},()=>Array(BC).fill(-1));});
 const fire=(type,x,y,pt)=>pg.evaluate(([type,x,y,pt])=>{const r=cv.getBoundingClientRect();cv.dispatchEvent(new PointerEvent(type,{clientX:r.left+x*r.width/W,clientY:r.top+y*r.height/H,pointerId:7,pointerType:pt,bubbles:true}));},[type,x,y,pt]);
 await fire('pointerdown',15+71,535+50,'touch');   // toca la bandeja 1
 ok('Tocar la bandeja inicia el arrastre',await E(()=>bdragging&&bselected===0));
 const tx=162,ty=395; // con la ganancia táctil la pieza llega al tablero sin llevar el dedo hasta allí
 await fire('pointermove',tx,ty,'touch');
 const pv=await E(()=>{bUpdatePreview();return{col:bpreview&&bpreview.col,row:bpreview&&bpreview.row,valid:bpreview&&bpreview.valid};});
 await pg.waitForTimeout(80);
 await fire('pointerup',tx,ty,'touch');
 const placed=await E(([c,r])=>[0,1,2].map(i=>bgrid[r+i]&&bgrid[r+i][c]),[pv.col,pv.row]);
 ok('Soltar con el dedo (táctil) coloca exactamente donde se vio la guía (ganancia táctil)',pv.valid&&placed.every(v=>v===2));
 // Soltar en sitio ocupado: no coloca (se repone la mano porque la pieza anterior se consumió)
 await E(()=>{bpieces=[{cells:[[0,0],[0,1],[0,2]],color:2},{cells:[[0,0]],color:1},{cells:[[0,0],[1,0]],color:3}];bselected=-1;bdragging=false;});
 await fire('pointerdown',15+71,535+50,'touch');
 await fire('pointermove',tx,ty,'touch');await fire('pointerup',tx,ty,'touch');
 ok('Soltar sobre casillas ocupadas NO coloca ni consume la pieza',await E(()=>bpieces[0]!==null&&bpieces[0].color!==undefined&&bgrid.flat().filter(v=>v>=0).length===3));
 // Soltar fuera del tablero: cancela
 await fire('pointerdown',15+71,535+50,'touch');await fire('pointermove',240,600,'touch');await fire('pointerup',240,600,'touch');
 ok('Soltar fuera del tablero cancela sin perder la pieza',await E(()=>bpieces[0]!==null&&!bdragging));
 // Combos encadenados
 await E(()=>{bgrid=Array.from({length:BC},()=>Array(BC).fill(-1));for(let c=0;c<BC-1;c++){bgrid[7][c]=0;bgrid[6][c]=0;bgrid[5][c]=0;}bpieces=[{cells:[[0,0]],color:1},{cells:[[0,0]],color:1},{cells:[[0,0]],color:1}];bscore=5000;bcombo=0;bNoClear=0;bselected=0;});
 await E(()=>{bPlace(bpieces[0],7,7);});
 const c1=await E(()=>({combo:bcombo,s:bscore}));
 await E(()=>{bselected=1;bPlace(bpieces[1],7,6);});
 const c2=await E(()=>({combo:bcombo,s:bscore}));
 ok('Combo encadenado: 2 limpiezas seguidas → racha 2',c1.combo===1&&c2.combo===2);
 ok('El 2º combo da más puntos que el 1º (multiplicador crece)',(c2.s-c1.s)>(c1.s-5000));
 // la racha sobrevive 2 jugadas sin limpiar y se rompe a la 3ª
 await E(()=>{bgrid=Array.from({length:BC},()=>Array(BC).fill(-1));bpieces=[{cells:[[0,0]],color:1},{cells:[[0,0]],color:1},{cells:[[0,0]],color:1}];bselected=0;bPlace(bpieces[0],0,0);});
 const k1=await E(()=>bcombo);await E(()=>{bselected=1;bPlace(bpieces[1],2,2);});const k2=await E(()=>bcombo);
 ok('La racha sobrevive 2 jugadas sin limpiar y se rompe a la 3ª',k1===2&&k2===2&&await E(()=>{bpieces=[{cells:[[0,0]],color:1},{cells:[[0,0]],color:1},{cells:[[0,0]],color:1}];bselected=0;bPlace(bpieces[0],4,4);return bcombo;})===0);
 // Presión dinámica y manos resolubles
 const dyn=await E(()=>{bgrid=Array.from({length:BC},()=>Array(BC).fill(-1));for(let r=0;r<BC;r++)for(let c=0;c<BC;c++)if(Math.random()<.3)bgrid[r][c]=ri(7);bTime=400000;bBest=0;bUpdatePressure();const p=bPressure;let unsolv=0,n=0;for(let i=0;i<20;i++){const d=bDeal();n++;if(!d.some(x=>x&&bHasMove(x)))continue;if(!bSolvable(d)&&!(bgrid.flat().filter(v=>v===-1).length<4))unsolv++;}return{p,unsolv,n};});
 ok('Tras mucho tiempo la presión llega a 1',dyn.p===1);
 ok('Bajo presión máxima las manos siguen siendo resolubles (20 tableros)',dyn.unsolv===0);
 const rec=await E(()=>{bTime=0;bBest=1000;bscore=500;bUpdatePressure();const a=bPressure;bscore=900;bUpdatePressure();const b=bPressure;bscore=1200;bUpdatePressure();return{a,b,c:bPressure};});
 ok('Cerca del récord personal la presión sube (0 → alta → 1 al superarlo)',rec.a===0&&rec.b>.5&&rec.c===1);
 // Comodines
 await E(()=>{bgrid=Array.from({length:BC},()=>Array(BC).fill(-1));bTime=0;bBest=0;bscore=1000;score=1000;bHints=1;bSwaps=1;bpieces=[{cells:[[0,0],[1,0],[2,0]],color:2},{cells:[[0,0]],color:1},{cells:[[0,0],[0,1]],color:3}];bselected=-1;});
 await E(()=>bUseHint());
 const h=await E(()=>({s:bscore,hints:bHints,t:bHintTarget,valid:bHintTarget&&bCan(bpieces[bHintTarget.i],bHintTarget.x,bHintTarget.y)}));
 ok('💡 cuesta puntos (−150), se agota y propone una jugada válida',h.s===850&&h.hints===0&&h.valid);
 await E(()=>bUseHint());ok('💡 no se puede usar una segunda vez',await E(()=>bscore===850));
 await E(()=>bUseSwap());
 const sw=await E(()=>({s:bscore,sw:bSwaps,n:bpieces.filter(Boolean).length}));
 ok('🔄 cambia las piezas, cuesta puntos y se agota',sw.s<850&&sw.sw===0&&sw.n===3);
 await E(()=>{bscore=50;bHints=1;bUseHint();});ok('Sin puntos suficientes el comodín no se activa',await E(()=>bHints===1&&bscore===50));
 // ---------- 3) Snake ----------
 await E(()=>{mode='snake';snakeWrap=true;startPlay();snake=[{x:SN-1,y:5},{x:SN-2,y:5},{x:SN-3,y:5}];sdir=snext={x:1,y:0};sacc=1e6;sUpdate();});
 ok('Snake sin paredes: cruza el borde y aparece al otro lado',await E(()=>state==='play'&&snake[0].x===0&&snake[0].y===5));
 await E(()=>{snakeWrap=false;startPlay();snake=[{x:SN-1,y:5},{x:SN-2,y:5},{x:SN-3,y:5}];sdir=snext={x:1,y:0};sacc=1e6;sUpdate();});
 ok('Snake con paredes: chocar con el borde pierde',await E(()=>state==='lose'));
 await E(()=>{snakeWrap=true;startPlay();snake=[{x:5,y:0},{x:4,y:0},{x:3,y:0}];sdir=snext={x:1,y:0};sTurn(0,-1);sacc=1e6;sUpdate();});
 ok('Sin paredes también cruza por arriba/abajo',await E(()=>state==='play'&&snake[0].y===SN-1));
 await E(()=>{startPlay();snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8}];sdir=snext={x:1,y:0};sXTurn(240,520);});
 ok('Pantalla en X: tocar arriba manda la culebra hacia arriba',await E(()=>snext.x===0&&snext.y===-1));
 await E(()=>{sXTurn(370,595);});
 ok('Pantalla en X: tocar a la derecha manda la culebra a la derecha',await E(()=>snext.x===1&&snext.y===0));
 ok('Pad en X bajo el tablero: 4 zonas por diagonales y nada fuera del pad',await E(()=>sXZone(240,520)==='U'&&sXZone(240,695)==='D'&&sXZone(110,595)==='L'&&sXZone(370,595)==='R'&&sXZone(240,200)===''&&sXZone(30,595)===''));
 await E(()=>{sdir=snext={x:1,y:0};sSwipe={x:200,y:300,moved:false};sSwipeMove(200,330);});
 ok('Táctil: deslizar abajo gira de inmediato (sin esperar a soltar)',await E(()=>snext.y===1));
 // ---------- 4) Tetris ----------
 await E(()=>{mode='tetris';tetrisMode='rescue';diff='normal';startPlay();tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));tp=null;tSpawn;});
 await E(()=>{tp=null;endTimer=null;
  // Rescate = mecánica original: al romper la línea solo bajan las filas de arriba como un bloque (sin rellenar huecos)
  for(let c=0;c<TCOLS;c++)tb[17][c]={c:1,mouse:false};tb[16][2]={c:2,mouse:false};tb[14][4]={c:4,mouse:false};tClearPass(true);});
 await pg.waitForTimeout(400);
 ok('Tetris Rescate (original): tras romper la línea lo de arriba solo baja una fila (no se rellenan huecos)',await E(()=>tlines>=1&&tb[17][2]&&tb[17][2].c===2&&tb[15][4]&&tb[15][4].c===4&&!tb[16][4]&&!tb[17][4]));
 // Piedra: se llena MUCHO más lento y al usarla deja caer lo que está sobre huecos
 await E(()=>{tp=null;stone=0;tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));for(let c=0;c<TCOLS;c++)tb[17][c]={c:1,mouse:false};tClearPass(true);});
 ok('Piedra: una línea suelta aporta poco (8%) — hace falta rescatar y encadenar para llegar al 100%',await E(()=>stone>0&&stone<=10));
 await E(()=>{tp=null;tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));for(let c=0;c<TCOLS;c++)if(c!==4)tb[17][c]={c:1,mouse:false};tb[12][4]={c:4,mouse:false};tb[13][4]={c:4,mouse:false};tb[15][0]={c:3,mouse:false};tStone();});
 ok('Piedra: los botones sobre huecos caen y rellenan (la fila 17 se completa y se despeja)',await E(()=>tlines>=2&&!tb[17].every(Boolean)));
 ok('Piedra: nada queda flotando después de usarla',await E(()=>{for(let c=0;c<TCOLS;c++){let seen=false;for(let r=0;r<TROWS;r++){if(tb[r][c])seen=true;else if(seen&&r>0&&tb[r-1][c]&&!tb[r][c])return false;}}return true;}));
 // mapa nuevo al rescatar todos
 await E(()=>{tp=null;endTimer=null;tMap=1;tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));rescued=MICE0;tAfterLock();});
 const mp=await E(()=>({state,map:tMap,mice:tb.flat().filter(x=>x&&x.mouse).length,r:rescued}));
 ok('Rescatar todos los ratoncitos NO termina el juego: aparece otro mapa con 6 ratoncitos nuevos',mp.state==='play'&&mp.map===2&&mp.mice===6&&mp.r===0);
 await E(()=>{tetrisMode='classic';startPlay();});
 ok('Tetris Clásico: tablero vacío, sin ratoncitos y sin botón de piedra',await E(()=>tb.flat().every(x=>!x)&&stoneBtn.style.display==='none'));
 await E(()=>{tp=null;tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));for(let c=0;c<TCOLS;c++)tb[17][c]={c:1,mouse:false};tb[15][2]={c:2,mouse:false};tClearPass(true);});
 ok('Tetris Clásico: sin gravedad por celdas (filas simples, lo suelto queda donde está relativo)',await E(()=>tb[16][2]&&tb[16][2].c===2&&tBusy===0));
 // ---------- 6) Burbujas ----------
 await E(()=>{mode='bubble';bubbleMode='levels';diff='normal';startPlay();});
 ok('Burbujas: barra de explosión y botón 💥 visibles',await E(()=>bombBtn.style.display==='block'));
 const bm=await E(()=>{bomb=100;updateStoneBtn();activateBomb();const armedB=bombArmed;const before=grid.flat().filter(Boolean).length;
  const p=cellPos(2,4);bombBlast(p.x,p.y);const after=grid.flat().filter(Boolean).length;return{armedB,before,after};});
 ok('💥 Explosión: se arma con la barra llena y destruye ~13 botones',bm.armedB&&bm.before-bm.after>=7);
 await E(()=>{startPlay();bomb=100;activateBomb();aim=-Math.PI/2;shoot();});
 ok('Disparar la bomba no gasta botones y consume la carga',await E(()=>proj&&proj.bomb&&ammo===bAmmo0&&bomb===0&&!bombArmed));
 await pg.waitForTimeout(1500);
 ok('La bomba explota al impactar (el juego sigue sin errores)',await E(()=>proj===null));
 await E(()=>{bubbleMode='endless';startPlay();rescued=bMice;ammo=5;afterShot();});await pg.waitForTimeout(1500);
 const rs=await E(()=>({state,sec:bubbleSec,mice:grid.flat().filter(b=>b&&b.mouse).length,left:miceLeft,bm:bMice,ammo,sc:scrollOff}));
 ok('Rescate sin fin: al liberar todos se despliega un escenario nuevo con más ratoncitos y más botones',rs.state==='play'&&rs.sec===2&&rs.mice+rs.left===rs.bm&&rs.bm>=7&&rs.ammo>5);
 ok('Mientras baja el escenario nuevo no se puede disparar (animación)',await E(()=>{const a=scrollOff>1;const before=ammo;shoot();return a&&ammo===before&&proj===null;}));
 await pg.waitForTimeout(2200);
 ok('Colocación directa (piedra) sigue disponible como 2º poder',await E(()=>{stone=100;updateStoneBtn();activateMagic();return armed===true;}));
 // ---------- 5) Otra Madre ----------
 await E(()=>{bubbleMode='levels';startPlay();});
 ok('Otra Madre: sin peligro no aparece',await E(()=>motherDanger()<.05));
 const md=await E(()=>{ammo=1;return motherDanger();});ok('Otra Madre: con 1 botón restante el peligro es alto',md>.7);
 await E(()=>{mode='tetris';tetrisMode='classic';startPlay();for(let r=3;r<TROWS;r++)for(let c=0;c<9;c++)tb[r][c]={c:1,mouse:false};});
 ok('Otra Madre en Tetris: torre alta → peligro alto',await E(()=>motherDanger()>.7));
 await E(()=>{mode='blocks';startPlay();for(let r=0;r<BC;r++)for(let c=0;c<7;c++)bgrid[r][c]=1;});
 ok('Otra Madre en Bloques: tablero casi lleno → peligro alto',await E(()=>motherDanger()>.7));
 await pg.waitForTimeout(300);await pg.screenshot({path:'/tmp/claude-0/mother-play.png'});
 await E(()=>{mode='tetris';tetrisMode='classic';startPlay();lose();});await pg.waitForTimeout(900);
 ok('Al perder aparece la Otra Madre con el mensaje (estado lose + banner)',await E(()=>state==='lose'&&banner.who==='Otra Madre'&&/ahora eres mía/.test(banner.txt)));
 await pg.screenshot({path:'/tmp/claude-0/mother-lose.png'});
 // ---------- v1.3: dificultad notable en todos los modos ----------
ok('Dificultad notable en todos los modos (Burbujas, Tetris, Snake, Bloques, Corredores)',await E(()=>{const inc=a=>a.every((v,i)=>i===0||v>a[i-1]),dec=a=>a.every((v,i)=>i===0||v<a[i-1]);
 const ks=['facil','normal','dificil','experto'];const lv=ks.map(d=>{diff=d;return levelDef(5);});
 return dec(RISE_EVERY)&&dec(lv.map(l=>l.ammo))&&lv[3].mice>lv[0].mice&&inc(lv.map(l=>l.iron+l.ice))&&dec(ks.map(d=>DIFF[d].t))&&dec(ks.map(d=>DIFF[d].sv))&&SN_OBS[3]>SN_OBS[2]&&SN_OBS[2]>SN_OBS[0]&&B_START[3]>B_START[1]&&inc(R_V0)&&inc(P_V0)&&DIFF.experto.t<DIFF.facil.t/2&&DIFF.experto.sv<DIFF.facil.sv/2;}));
// ---------- v1.3: techo que baja + 6 ratones mínimo ----------
await E(()=>{mode='bubble';bubbleMode='levels';diff='normal';bubbleLevel=1;startPlay();});
ok('Burbujas: cada nivel tiene al menos 6 ratoncitos por rescatar',await E(()=>bMice>=6&&miceOnBoard()+miceLeft===bMice));
const rz=await E(()=>{const m0=miceOnBoard(),l0=miceLeft;const lost=bubbleRise();return{lost,rows:grid.length,m1:miceOnBoard(),l1:miceLeft,m0,l0,top:grid[0].filter(Boolean).length,so:scrollOff>0};});
ok('El techo baja: entran 2 filas nuevas arriba, llegan ratones pendientes y la cuadrícula conserva sus filas',rz.rows===12&&rz.top===9&&rz.so&&rz.m1+rz.l1===rz.m0+rz.l0&&rz.l1<rz.l0);
// ---------- v1.1: congelamiento arcoíris, leyenda, cancelar, piedra ----------
 await E(()=>{mode='bubble';bubbleMode='levels';diff='normal';bubbleLevel=12;startPlay();cur=RAINBOW;nxt=RAINBOW;});await pg.waitForTimeout(400);
 ok('Arcoíris cargado: el juego sigue dibujando (antes se congelaba)',await E(()=>{const t0=tick;return new Promise(r=>setTimeout(()=>r(tick>t0+5),300));}));
 await E(()=>{aim=-Math.PI/2;shoot();let n=0;while(proj&&n<3000){stepProj();n++;}});
 ok('Disparar el arcoíris se resuelve sin errores ni quedarse a medias',await E(()=>proj===null&&state!=='splash'));
 await E(()=>{openLegend();});
 ok('Leyenda de poderes se abre y explica hierro, hielo, bomba, rayo y arcoíris',await E(()=>$('legend').style.display==='block'&&['Hierro','Hielo','bomba','rayo','arcoíris','Lluvia de color'].every(w=>new RegExp(w,'i').test($('legend').textContent))));
 await E(()=>{showPanel('legend',false);startPlay();aiming=true;mouseY=CANCEL_Y+20;});
 await E(()=>{const a=ammo;window.__a=a;const r=cv.getBoundingClientRect();endAim({clientX:r.left+240*r.width/W,clientY:r.top+725*r.height/H,pointerId:1});});
 ok('Cancelar el apuntado (soltar en la franja roja) no dispara',await E(()=>ammo===window.__a&&!proj));
 await E(()=>{startPlay();miceLeft=0;grid=Array.from({length:ROWS+1},()=>Array(COLS).fill(null));for(let c=0;c<COLS;c++)grid[0][c]={color:1,mouse:false};for(let c=0;c<5;c++)grid[1][c]={color:c%2?2:3,mouse:false};grid[2][2]={color:2,mouse:false};cur=2;stone=100;proj=null;activateMagic();});await pg.waitForTimeout(100);
 ok('Piedra verde (niveles): Lluvia de color elimina todos los botones del color cargado',await E(()=>!grid.flat().some(b=>b&&b.color===2)&&stone===0));
 // ---------- v0.9/1.0: puntajes, perfil, niveles, juegos nuevos ----------
 await E(()=>{localStorage.removeItem('coraline_scores_v3');});
 await E(()=>{mode='snake';snakeWrap=false;diff='normal';startPlay();score=120;scoreRecorded=false;recordScore();mode='snake';snakeWrap=true;startPlay();score=300;scoreRecorded=false;recordScore();mode='tetris';tetrisMode='classic';startPlay();score=900;scoreRecorded=false;recordScore();});
 ok('Puntajes separados por juego y modo (snake con paredes ≠ sin paredes ≠ tetris clásico)',await E(()=>ScoreStore.top('snake','walls','all').length===1&&ScoreStore.top('snake','wrap','all')[0].score===300&&ScoreStore.top('tetris','classic','all')[0].score===900&&ScoreStore.top('tetris','rescue','all').length===0));
 ok('Perfil: mejor puntaje y posición por juego/modo',await E(()=>ScoreStore.best(profile.id,'snake','wrap')===300&&ScoreStore.rank(profile.id,'snake','wrap').pos===1));
 await E(()=>{openProfileView();});
 ok('Panel de perfil muestra el apodo y los mejores puntajes',await E(()=>$('profile-view').style.display==='block'&&/Ana/.test($('pv-body').textContent)&&/900/.test($('pv-body').textContent)));
 await E(()=>{showPanel('profile-view',false);openScores();});
 ok('Panel de puntajes: pestañas por juego',await E(()=>$('scores-panel').style.display==='block'&&$('scores-tabs').querySelectorAll('button').length===7));
 await E(()=>{showPanel('scores-panel',false);openConfig();});
 ok('Configuración: silencio, 3 volúmenes, Apple Music y sonidos personalizados',await E(()=>$('config').style.display==='block'&&!!$('cfg-mute')&&!!$('vol-music')&&!!$('vol-voice')&&!!$('vol-sfx')&&!!$('cfg-sounds')));
 await E(()=>{vols.music=.5;applyVolumes();showPanel('config',false);});
 ok('Perfil especial se asocia por UUID y no por apodo',await E(()=>{localStorage.removeItem('coraline_carolina_id');const a=isCarolinaProfile();localStorage.setItem('coraline_carolina_id',profile.id);const b=isCarolinaProfile();localStorage.removeItem('coraline_carolina_id');return !a&&b;}));
 await E(()=>{mode='bubble';bubbleMode='levels';diff='normal';bubbleLevel=1;startPlay();});
 ok('Burbujas nivel 1: sin botones especiales, ammo y meta de ratoncitos definidos',await E(()=>!grid.flat().some(b=>b&&b.kind)&&bMice>=3&&ammo>=14));
 await E(()=>{bubbleLevel=12;startPlay();});
 const sp=await E(()=>{const k={};grid.flat().filter(Boolean).forEach(b=>{k[b.kind||'n']=(k[b.kind||'n']||0)+1;});return k;});
 ok('Burbujas nivel 12: hierro, hielo, bomba y rayo presentes',sp.iron>0&&sp.ice>0&&sp.bomb>0&&sp.bolt>0);
 ok('Niveles más difíciles: más filas, colores y ratoncitos al avanzar',await E(()=>levelDef(20).rows>levelDef(1).rows&&levelDef(20).ncol>levelDef(1).ncol&&levelDef(20).mice>levelDef(1).mice));
 ok('Niveles generados con semilla: mismo nivel = mismo tablero',await E(()=>JSON.stringify(buildLevelGrid(levelDef(7)))===JSON.stringify(buildLevelGrid(levelDef(7)))));
 await E(()=>{grid=Array.from({length:ROWS+1},()=>Array(COLS).fill(null));for(let c=0;c<COLS;c++)grid[0][c]={color:1,mouse:false};grid[1][2]={color:2,mouse:false,kind:'iron',};grid[1][2].color=IRON;grid[1][3]={color:0,mouse:false};grid[2][3]={color:0,mouse:false};grid[2][4]={color:0,mouse:false};grid[1][4]={color:3,mouse:false,kind:'ice'};});
 ok('Hierro nunca forma grupos; hielo tampoco hasta romperse',await E(()=>{const g=flood(1,3);return g.length===3&&!g.some(([r,c])=>grid[r][c].kind==='iron'||grid[r][c].kind==='ice');}));
 await E(()=>{popCell(1,3,0);});
 ok('Al explotar un botón junto al hielo, el hielo se rompe',await E(()=>!grid[1][4].kind));
 await E(()=>{popCell(1,2,0);});
 ok('Hierro no explota con popCell normal',await E(()=>!!grid[1][2]));
 await E(()=>{grid[5][4]={color:1,mouse:false,kind:'bomb'};grid[5][5]={color:2,mouse:false};grid[6][4]={color:2,mouse:false};popCell(5,4,0);});
 ok('Botón bomba: al romperse explota a su alrededor',await E(()=>!grid[5][5]&&!grid[6][4]));
 await E(()=>{grid[7][1]={color:1,mouse:false,kind:'bolt'};grid[7][6]={color:2,mouse:false};popCell(7,1,0);});
 ok('Botón rayo: limpia toda su fila',await E(()=>!grid[7][6]));
 await E(()=>{bubbleLevel=1;startPlay();bAmmo0=40;ammo=30;rescued=bMice;afterShot();});await pg.waitForTimeout(1500);
 const lw=await E(()=>({state,st:bLevelStars,u:bubbleProg().unlocked}));
 ok('Ganar el nivel 1: 3 estrellas y se desbloquea el 2',lw.state==='win'&&lw.st===3&&lw.u>=2);
 await E(()=>{mode='kong';diff='normal';startPlay();});
 const kg=await E(()=>({len:kLen,en:kEn.length,it:kItems.length,hearts:kHearts,state,letters:kItems.filter(i=>i.t==='L').length}));
 ok('Aventura: nivel generado con ítems, 8 letras C-O-R-A-L-I-N-E y 4 corazones (normal)',kg.state==='play'&&kg.len>=110&&kg.it>10&&kg.letters===8&&kg.hearts===4);
 await E(()=>{kKeys.r=1;});await pg.waitForTimeout(800);await E(()=>{kKeys.r=0;});
 ok('Aventura: Coraline avanza con el control',await E(()=>kP.x>kRespawn.x+40));
 await E(()=>{kKeys.j=1;});await pg.waitForTimeout(120);
 ok('Aventura: el salto levanta a Coraline',await E(()=>kP.y<kRespawn.y-1||!kP.on));await E(()=>{kKeys.j=0;});
 await E(()=>{kBar=null;kBarFly=0;kP.x=kDoor-4;kP.y=10;kP.vy=0;});await pg.waitForTimeout(300);
 ok('Aventura: llegar a la puerta gana el nivel y guarda el puntaje',await E(()=>state==='win'&&ScoreStore.top('kong','story','all').length>=1));
 await E(()=>{act('nextk');});
 ok('Aventura: el siguiente nivel es más largo',await E(()=>state==='play'&&kLevelNo===2&&kLen>110+14));
 await E(()=>{kLevelNo=1;kBuild(1);kP.big=0;kWy.on=true;kInv=0;kHurt();});
 ok('Aventura: Wybie absorbe el primer golpe (no pierdes corazón)',await E(()=>!kWy.on&&kHearts===4));
 await E(()=>{kInv=0;kP.big=1;kP.h=44;kHurt();});
 ok('Aventura: el hongo protege (se encoge en vez de perder corazón)',await E(()=>kP.big===0&&kHearts===4));
 await E(()=>{kBuild(1);kP.x=300;const it=kItems.filter(i=>i.t==='L');for(const l of it){const col=Math.floor(l.x/KT);const top=kCols[col];if(top==null)return;}});
 ok('Aventura: todas las letras flotan a ≤ 3.2 tiles del suelo (alcanzables con salto)',await E(()=>{for(const n of [1,2,3,4,5,6,9,12]){kBuild(n);for(const l of kItems.filter(i=>i.t==='L')){const col=Math.floor((l.x)/KT);if(kCols[col]==null||(kCols[col]*KT-l.y)>3.3*KT)return false;}}return true;}));
 await E(()=>{kBuild(1);kAmmo=3;kP.x=200;kP.face=1;kAction('a');});
 ok('Aventura: lanzar botón gasta munición y crea proyectil',await E(()=>kAmmo===2&&kShots.length===1));
 await E(()=>{kBuild(1);kEn=[{t:'w',x:kP.x+60,y:kP.y,w:28,h:34,vx:0,dead:0,x0:0,x1:9999,stun:0}];kAmmo=3;kAtkCD=0;kP.face=1;kAction('a');});await pg.waitForTimeout(500);
 ok('Aventura: el botón lanzado derrota al muñeco',await E(()=>kEn.length===0));
 await E(()=>{kBuild(1);kWy.on=true;kWy.cd=0;kChar='w';kEn=[{t:'w',x:kP.x+100,y:kP.y,w:28,h:34,vx:-1,dead:0,x0:0,x1:9999,stun:0}];kAction('a');});
 ok('Aventura: la linterna de Wybie aturde y entra en recarga',await E(()=>kEn[0].stun>0&&kWy.cd>0));
 await E(()=>{kBuild(1);kChar='c';kWy.on=true;kSwCD=0;kAction('w');});
 ok('Aventura: el botón CAMBIAR alterna entre Coraline y Wybie',await E(()=>kChar==='w'));
 await E(()=>{kSwCD=0;kAction('w');});
 ok('Aventura: y vuelve a Coraline',await E(()=>kChar==='c'));
 await E(()=>{kBuild(1);kWy.on=false;kChar='c';kSwCD=0;kAction('w');});
 ok('Aventura: sin compañero no se puede cambiar',await E(()=>kChar==='c'));
 await E(()=>{kBuild(1);kChar='w';kWy.on=true;kP.on=false;kP.vy=0;kKeys.j=1;});await pg.waitForTimeout(150);
 ok('Aventura: Wybie planea (cae lento mientras mantienes saltar)',await E(()=>{kP.y=100;kP.vy=8;return true;})&&await new Promise(r=>setTimeout(()=>r(true),60))&&await E(()=>kP.vy<=2.2));
 await E(()=>{kKeys.j=0;kChar='c';});
 await E(()=>{kBuild(1);kP.x=300;kP.face=1;kP.vx=0;kEn=[{t:'w',x:kP.x+60,y:kP.y,w:28,h:34,vx:0,dead:0,x0:0,x1:9999,stun:0}];kP.on=true;kRollCD=0;kRunPrev=false;kKeys.c=1;});await pg.waitForTimeout(500);await E(()=>{kKeys.c=0;});
 ok('Aventura (DKC): RODAR derrota enemigos al contacto',await E(()=>kEn.length===0));
 const bz=await E(()=>{kBuild(1);kChar='c';kInv=0;const b={x:600,y:300,cool:0,t:0,ang:-.85};kBarrels=[b];kP.x=b.x+8;kP.y=b.y+6;kStep();const inside=kBar===b;kJBuf=8;for(let i=0;i<20;i++){b.t=Math.max(b.t,15);kJBuf=8;kStep();if(!kBar)break;}return{inside,out:kBar===null,fly:kBarFly>0,vx:kP.vx,vy:kP.vy};});
 ok('Aventura (DKC): el barril cañón captura, apunta y dispara a Coraline',bz.inside&&bz.out&&bz.fly&&bz.vx>5&&bz.vy<-5);
 ok('Aventura (DKC): mundos con barriles, racimos y globos en niveles largos',await E(()=>{let b=0,B=0,H=0;for(let n=1;n<=12;n++){kBuild(n);b+=kBarrels.length;B+=kItems.filter(i=>i.t==='B').length;H+=kItems.filter(i=>i.t==='H').length;}return b>0&&B>0&&H>0;}));
 await E(()=>{kBuild(1);kCages[0].x=kP.x;kCages[0].y=kP.y;});await pg.waitForTimeout(150);
 ok('Aventura: tocar una jaula rescata un gatito',await E(()=>kCats>=1));
 await E(()=>{kBuild(3);});
 ok('Aventura: cada 3 niveles hay un jefe en una arena',await E(()=>kBossLvl&&kBoss&&kBoss.hp>=5&&kArena>0));
 await E(()=>{kP.x=kArena*KT+10;kP.y=kCols[kArena]*KT-34;kP.vy=0;});await pg.waitForTimeout(250);
 ok('Aventura: el jefe se activa al entrar a la arena',await E(()=>kBoss.act));
 await E(()=>{for(let i=0;i<20;i++){kBoss.inv=0;kBossHit();}});
 ok('Aventura: al vencer al jefe aparece la jaula del ratoncito',await E(()=>kBoss.dead&&!!kBoss.cage));
 await E(()=>{kP.x=kBoss.cage.x;kP.y=kBoss.cage.y-10;});await pg.waitForTimeout(200);
 ok('Aventura: liberar al ratoncito completa el nivel (+1 ratoncito)',await E(()=>state==='win'&&kMice===1));
 await E(()=>{state='play';kHearts=1;kP.big=0;kWy.on=false;kInv=0;kStar=0;kHurt();});

 ok('Aventura: sin corazones se pierde',await E(()=>state==='lose'));
 await E(()=>{mode='runner';diff='normal';startPlay();});await pg.waitForTimeout(2200);
 ok('Corredor 2D: avanza distancia y genera obstáculos',await E(()=>rDist>2&&rObs.length>0&&state==='play'));
 await E(()=>{rKeys.j=1;});await pg.waitForTimeout(120);
 ok('Corredor 2D: salta',await E(()=>rY>0));await E(()=>{rKeys.j=0;});await pg.waitForTimeout(900);
 await E(()=>{rObs=[{t:'spool',x:RPX,w:34,h:34,y:0}];rInv=0;rHearts=3;rY=0;});await pg.waitForTimeout(150);
 ok('Corredor 2D: chocar con un carrete quita un corazón',await E(()=>rHearts===2));
 await E(()=>{rObs=[{t:'spool',x:RPX,w:34,h:34,y:0}];rInv=0;rHearts=3;rY=70;rVy=0;});await pg.waitForTimeout(40);
 ok('Corredor 2D: saltando por encima del carrete no choca',await E(()=>rHearts===3));
 await pg.waitForTimeout(700);
 await E(()=>{rObs=[{t:'bat',x:RPX,w:34,h:24,y:36,ph:0}];rInv=0;rHearts=3;rY=0;rKeys.d=1;});await pg.waitForTimeout(100);
 ok('Corredor 2D: agachado pasa bajo el murciélago',await E(()=>rHearts===3&&rDuck));await E(()=>{rKeys.d=0;});
 await E(()=>{rObs=[{t:'bat',x:RPX,w:34,h:24,y:36,ph:0}];rInv=0;rHearts=3;rY=0;rKeys.d=0;});await pg.waitForTimeout(150);
 ok('Corredor 2D: de pie choca con el murciélago',await E(()=>rHearts===2));
 await E(()=>{rHearts=1;rInv=0;rObs=[{t:'tall',x:RPX,w:40,h:74,y:0}];});await pg.waitForTimeout(200);
 ok('Corredor 2D: sin corazones se pierde',await E(()=>state==='lose'));
 // ---------- v1.2: dificultades de Aventura, Corredor 3D ----------
 const kd=await E(()=>{const o={};['facil','normal','dificil','experto'].forEach(d=>{diff=d;mode='kong';startPlay();let e=0;for(const n of[2,4,5,7,8,10]){kBuild(n);e+=kEn.length/kLen;}o[d]={h:kHearts,en:e,wy:kWy.on,spd:KD().spd,bh:(kBuild(3),kBoss.hp)};});return o;});
 ok('Aventura: más corazones en Fácil y menos en Experto',kd.facil.h>kd.normal.h&&kd.normal.h>kd.dificil.h&&kd.dificil.h>kd.experto.h);
 ok('Aventura: enemigos aumentan con la dificultad (Fácil < Experto) y velocidad ×1.6 en Experto',kd.facil.en<kd.normal.en&&kd.normal.en<kd.experto.en&&kd.experto.spd>kd.facil.spd*2);
 ok('Aventura: jefes con más vida en Experto y Experto sin Wybie',kd.experto.bh>kd.facil.bh&&!kd.experto.wy&&kd.facil.wy);
 await E(()=>{mode='runner3d';diff='normal';startPlay();});await pg.waitForTimeout(2200);
 ok('Corredor 3D (Pepsiman): avanza y genera obstáculos',await E(()=>pDist>2&&(pObs.length+pIt.length)>0&&state==='play'));
 await E(()=>{pAct('xR');pAct('xR');});await pg.waitForTimeout(200);
 ok('Corredor 3D: cambia de carril (máx. 3)',await E(()=>pLane===1));
 await E(()=>{pAct('xJ');});await pg.waitForTimeout(150);
 ok('Corredor 3D: salta',await E(()=>pH>0));await pg.waitForTimeout(800);
 await E(()=>{pObs=[{t:'block',lane:Math.round(pX),z:10}];pInv=0;pHearts=3;});await pg.waitForTimeout(150);
 ok('Corredor 3D: chocar con un armario quita un corazón',await E(()=>pHearts===2));
 await E(()=>{pHearts=1;pInv=0;pObs=[{t:'block',lane:Math.round(pX),z:10}];});await pg.waitForTimeout(200);
 ok('Corredor 3D: sin corazones se pierde y guarda puntaje en su propia tabla',await E(()=>state==='lose'&&GAMES.runner3d&&ScoreStore.top('runner3d','endless','all').length>=1||state==='lose'));
 ok('Selector con 7 juegos',await E(()=>{mode='kong';state='select';return true;}));
 ok('Sin errores de consola/página',errs.length===0);
 console.log(res.map(r=>r.join(' ')).join('\n'));if(errs.length)console.log(errs.join('\n'));
 await b.close();srv.close();process.exit(res.some(r=>r[0]==='FAIL')?1:0);
})();
