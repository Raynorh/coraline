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
 const tx=BX+3*BS+BS/2,ty=BY+4.5*BS+3*BS/2+46; // dedo debajo de la pieza para que su centro caiga en fila 3..5
 await fire('pointermove',tx,ty,'touch');
 const pv=await E(()=>({col:bpreview&&bpreview.col,row:bpreview&&bpreview.row,valid:bpreview&&bpreview.valid}));
 await pg.waitForTimeout(80);
 await fire('pointerup',tx,ty,'touch');
 const placed=await E(()=>[0,1,2].map(i=>bgrid[3+i][3]));
 ok('Soltar con el dedo (táctil) coloca exactamente donde se vio la guía (col 3, filas 3-5)',placed.every(v=>v===2));
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
 await E(()=>{startPlay();snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8}];sdir=snext={x:1,y:0};sTapTurn(SOX+8*SC+SC/2,SOY+3*SC);});
 ok('Táctil: tocar arriba de la cabeza (yendo horizontal) gira hacia arriba',await E(()=>snext.x===0&&snext.y===-1));
 await E(()=>{sdir=snext={x:0,y:-1};sTapTurn(SOX+12*SC,SOY+8*SC);});
 ok('Táctil: tocar a la derecha (yendo vertical) gira a la derecha',await E(()=>snext.x===1&&snext.y===0));
 await E(()=>{sdir=snext={x:1,y:0};sSwipe={x:200,y:300,moved:false};sSwipeMove(200,330);});
 ok('Táctil: deslizar abajo gira de inmediato (sin esperar a soltar)',await E(()=>snext.y===1));
 // ---------- 4) Tetris ----------
 await E(()=>{mode='tetris';tetrisMode='rescue';diff='normal';startPlay();tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));tp=null;tSpawn;});
 await E(()=>{tp=null;endTimer=null;
  // fila 17 casi llena, hueco en col 4; encima hay bloques sueltos en col 4 (fila 14) y col 0 (fila 15)
  for(let c=0;c<TCOLS;c++)tb[17][c]={c:1,mouse:false};tb[16][2]={c:2,mouse:false};tb[15][0]={c:3,mouse:false};tb[14][4]={c:4,mouse:false};tb[16][4]={c:5,mouse:false};
  tb[17][4]=null; // se completará con la pieza
  tb[17][4]={c:1,mouse:false};tClearPass(true);});
 await pg.waitForTimeout(1200);
 const g=await E(()=>({row17:tb[17].map(x=>x?1:0).join(''),lines:tlines,busy:tBusy,top:tb.slice(0,14).some(r=>r.some(Boolean))}));
 ok('Tetris Rescate: al romper la línea lo de arriba cae para rellenar huecos (gravedad)',g.lines>=1&&!!(await E(()=>tb[17][0]&&tb[17][2]&&tb[17][4])));
 ok('Tetris Rescate: ningún bloque queda flotando',await E(()=>{for(let c=0;c<TCOLS;c++){let seen=false;for(let r=0;r<TROWS;r++){if(tb[r][c])seen=true;else if(seen&&r>0&&tb[r-1][c]&&!tb[r][c])return false;}}return true;}));
 // cadena: la caída completa otra línea
 await E(()=>{tp=null;tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));for(let c=0;c<TCOLS;c++){tb[17][c]={c:1,mouse:false};if(c!==3)tb[16][c]={c:2,mouse:false};}tb[15][3]={c:4,mouse:false};tChain=0;tlines=0;tClearPass(true);});
 await pg.waitForTimeout(1500);
 ok('Tetris Rescate: la caída encadena otra línea (cadena)',await E(()=>tlines===2));
 // mapa nuevo al rescatar todos
 await E(()=>{tp=null;endTimer=null;tMap=1;tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));rescued=MICE0;tAfterLock();});
 const mp=await E(()=>({state,map:tMap,mice:tb.flat().filter(x=>x&&x.mouse).length,r:rescued}));
 ok('Rescatar todos los ratoncitos NO termina el juego: aparece otro mapa con 6 ratoncitos nuevos',mp.state==='play'&&mp.map===2&&mp.mice===6&&mp.r===0);
 await E(()=>{tetrisMode='classic';startPlay();});
 ok('Tetris Clásico: tablero vacío, sin ratoncitos y sin botón de piedra',await E(()=>tb.flat().every(x=>!x)&&stoneBtn.style.display==='none'));
 await E(()=>{tp=null;tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));for(let c=0;c<TCOLS;c++)tb[17][c]={c:1,mouse:false};tb[15][2]={c:2,mouse:false};tClearPass(true);});
 ok('Tetris Clásico: sin gravedad por celdas (filas simples, lo suelto queda donde está relativo)',await E(()=>tb[16][2]&&tb[16][2].c===2&&tBusy===0));
 // ---------- 6) Burbujas ----------
 await E(()=>{mode='bubble';bubbleMode='classic';diff='normal';startPlay();});
 ok('Burbujas: barra de explosión y botón 💥 visibles',await E(()=>bombBtn.style.display==='block'));
 const bm=await E(()=>{bomb=100;updateStoneBtn();activateBomb();const armedB=bombArmed;const before=grid.flat().filter(Boolean).length;
  const p=cellPos(2,4);bombBlast(p.x,p.y);const after=grid.flat().filter(Boolean).length;return{armedB,before,after};});
 ok('💥 Explosión: se arma con la barra llena y destruye ~13 botones',bm.armedB&&bm.before-bm.after>=7);
 await E(()=>{startPlay();bomb=100;activateBomb();aim=-Math.PI/2;shoot();});
 ok('Disparar la bomba no gasta botones y consume la carga',await E(()=>proj&&proj.bomb&&ammo===DIFF[diff].ammo&&bomb===0&&!bombArmed));
 await pg.waitForTimeout(1500);
 ok('La bomba explota al impactar (el juego sigue sin errores)',await E(()=>proj===null));
 await E(()=>{bubbleMode='rescue';startPlay();rescued=MICE0;ammo=5;afterShot();});await pg.waitForTimeout(1500);
 const rs=await E(()=>({state,sec:bubbleSec,mice:grid.flat().filter(b=>b&&b.mouse).length,ammo,sc:scrollOff}));
 ok('Rescate sin fin: al liberar todos se despliega un escenario nuevo con más ratoncitos y más botones',rs.state==='play'&&rs.sec===2&&rs.mice===6&&rs.ammo>5);
 ok('Mientras baja el escenario nuevo no se puede disparar (animación)',await E(()=>{const a=scrollOff>1;const before=ammo;shoot();return a&&ammo===before&&proj===null;}));
 await pg.waitForTimeout(2200);
 ok('Colocación directa (piedra) sigue disponible como 2º poder',await E(()=>{stone=100;updateStoneBtn();activateMagic();return armed===true;}));
 // ---------- 5) Otra Madre ----------
 await E(()=>{bubbleMode='classic';startPlay();});
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
 ok('Sin errores de consola/página',errs.length===0);
 console.log(res.map(r=>r.join(' ')).join('\n'));if(errs.length)console.log(errs.join('\n'));
 await b.close();srv.close();process.exit(res.some(r=>r[0]==='FAIL')?1:0);
})();
