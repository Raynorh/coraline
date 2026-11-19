/* ================= MODO TETRIS ================= */
const TC=30,TCOLS=10,TROWS=18,TX=15,TY=64;
const SHAPES=[[[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],1],[[[1,1],[1,1]],0],[[[0,1,0],[1,1,1],[0,0,0]],2],[[[0,1,1],[1,1,0],[0,0,0]],3],[[[1,1,0],[0,1,1],[0,0,0]],4],[[[1,0,0],[1,1,1],[0,0,0]],5],[[[0,0,1],[1,1,1],[0,0,0]],6]];
let tb=[],tp=null,tnext=0,tlines=0,tlevel=1,tacc=0,tpieces=0,tHold=null,tbag=[];
function tNextShape(){if(!tbag.length){tbag=[0,1,2,3,4,5,6];for(let i=6;i>0;i--){const j=ri(i+1);[tbag[i],tbag[j]]=[tbag[j],tbag[i]];}}return tbag.pop();}
function tMake(i){const m=SHAPES[i][0].map(r=>r.slice());return{m,c:SHAPES[i][1],x:Math.floor((TCOLS-m[0].length)/2),y:i===0?-1:0};}
function tCollide(m,x,y){for(let i=0;i<m.length;i++)for(let j=0;j<m[i].length;j++){if(!m[i][j])continue;const nx=x+j,ny=y+i;if(nx<0||nx>=TCOLS||ny>=TROWS)return true;if(ny>=0&&tb[ny][nx])return true;}return false;}
let tBusy=0,tStage=null,tChain=0,tMap=1;
function tBuildMap(){const D=DIFF[diff];tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));const cells=[];
 const garb=Math.min(9,D.garb+Math.min(3,tMap-1));
 for(let k=0;k<garb;k++){const r=TROWS-1-k,holes=new Set([ri(TCOLS),ri(TCOLS)]);for(let c=0;c<TCOLS;c++){if(holes.has(c))continue;tb[r][c]={c:ri(7),mouse:false};cells.push([r,c]);}}
 for(let i=0;i<MICE0&&cells.length;i++){const [r,c]=cells.splice(ri(cells.length),1)[0];tb[r][c].mouse=true;}}
function tNew(){tb=Array.from({length:TROWS},()=>Array(TCOLS).fill(null));tMap=1;savedTotal=0;tBusy=0;tStage=null;tChain=0;
 if(tetrisMode==='rescue')tBuildMap();
 score=0;rescued=0;stone=0;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];warned=false;ready100=false;combo=0;
 tlines=0;tlevel=1;tacc=0;tpieces=0;tHold=null;tbag=[];tnext=tNextShape();tp=null;clearTimeout(endTimer);endTimer=null;tSpawn();
 if(tetrisMode==='rescue')say('Coraline','Hola, soy Coraline Jones. Rescata todos los ratoncitos que puedas: cuando termines un mapa aparecerán más.',5200);
 else say('Coraline','Modo clásico: limpia filas, sube de nivel y consigue el mejor puntaje.',4200);}
function tSpawn(){tp=tMake(tnext);tnext=tNextShape();tacc=0;if(tCollide(tp.m,tp.x,tp.y)){tp=null;lose();}}
function tMove(dx,dy){if(!tp||tCollide(tp.m,tp.x+dx,tp.y+dy))return false;tp.x+=dx;tp.y+=dy;return true;}
function tRot(){if(!tp)return;const n=tp.m.length,m=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>tp.m[n-1-j][i]));
 for(const k of [0,-1,1,-2,2])if(!tCollide(m,tp.x+k,tp.y)){tp.m=m;tp.x+=k;SFX.bounce();return;}}
function tGhostY(){let y=tp.y;while(!tCollide(tp.m,tp.x,y+1))y++;return y;}
function tHard(){if(!tp||endTimer)return;let n=0;while(tMove(0,1))n++;score+=n*2;tLock();}
function tRescueRow(r){for(let c=0;c<TCOLS;c++){const b=tb[r][c];if(!b)continue;const px=TX+c*TC+TC/2,py=TY+r*TC+TC/2;
 for(let k=0;k<5;k++)parts.push({x:px,y:py,vx:rnd(-3,3),vy:rnd(-4,1),life:rnd(25,45),c:COLORS[b.c].f,s:rnd(2,4)});if(b.mouse)rescue(px,py);}}
function tRise(){if(tb[0].some(Boolean)){tp=null;lose();return;}tb.shift();
 // La Mamá de Botones busca una columna relativamente despejada para dejar
 // una salida posible. En Difícil considera menos columnas y aumenta la presión.
 const heights=Array(TCOLS).fill(0);for(let c=0;c<TCOLS;c++){for(let r=0;r<TROWS;r++)if(tb[r][c]){heights[c]=TROWS-r;break;}}
 const ranked=heights.map((h,c)=>({c,h})).sort((a,b)=>a.h-b.h);
 const pool=ranked.slice(0,diff==='facil'?4:diff==='normal'?3:2);const h=pool[ri(pool.length)].c;
 const row=Array(TCOLS).fill(null);for(let c=0;c<TCOLS;c++)if(c!==h)row[c]={c:ri(7),mouse:false};tb.push(row);
 say('Mamá de Botones','¡Mis hilos suben! Los botones se acumulan…',2600);SFX.fall();}
function tGravity(){let moved=false;for(let c=0;c<TCOLS;c++){let w=TROWS-1;for(let r=TROWS-1;r>=0;r--){if(tb[r][c]){if(r!==w){tb[w][c]=tb[r][c];tb[r][c]=null;moved=true;}w--;}}}return moved;}
function tLock(){tp.m.forEach((row,i)=>row.forEach((v,j)=>{if(v){const y=tp.y+i,x=tp.x+j;if(y>=0)tb[y][x]={c:tp.c,mouse:false};}}));
 SFX.stick();tpieces++;tp=null;tChain=0;tClearPass(true);}
// Limpia filas completas. En modo Rescate, lo de arriba cae para rellenar los huecos (y puede encadenar nuevas líneas).
function tClearPass(first){const full=[];for(let r=0;r<TROWS;r++)if(tb[r].every(Boolean))full.push(r);
 if(full.length){full.forEach(tRescueRow);
  if(tetrisMode==='rescue'){full.forEach(r=>{tb[r]=Array(TCOLS).fill(null);});}
  else{tb=tb.filter((_,r)=>!full.includes(r));while(tb.length<TROWS)tb.unshift(Array(TCOLS).fill(null));}
  tlines+=full.length;const pts=[0,100,300,500,800][Math.min(4,full.length)]*tlevel;score+=pts+(tChain>0?150*tChain*tlevel:0);
  if(tChain>0){floats.push({x:TX+TCOLS*TC/2,y:TY+TROWS*TC/2,txt:'¡CADENA x'+(tChain+1)+'!',c:'#ffd166',life:70});say('Coraline',tChain>=2?'¡Increíble cadena!':'¡Cadena! Los botones siguen cayendo…',1800);}
  tlevel=1+Math.floor(tlines/8);if(tetrisMode==='rescue')stone=Math.min(100,stone+full.length*25);SFX.pop(Math.min(6,full.length*2+tChain));
  tChain++;
  if(tetrisMode==='rescue'){tStage='settle';tBusy=300;return;}}
 tAfterLock();}
function tStep(){if(tStage==='settle'){if(tGravity()){SFX.fall();tStage='check';tBusy=260;return;}}tStage=null;tClearPass(false);}
function tMapDone(){const bonus=1000*tMap;score+=bonus;floats.push({x:TX+TCOLS*TC/2,y:TY+TROWS*TC/2,txt:'¡MAPA '+tMap+' LIBRE! +'+bonus,c:'#ffd166',life:100});
 playVoice('victoria');say('Coraline','¡Lo logramos! Pero hay más ratoncitos atrapados… ¡sigamos!',4200);
 for(let i=0;i<60;i++)parts.push({x:rnd(TX,TX+TCOLS*TC),y:rnd(TY,TY+TROWS*TC),vx:rnd(-2,2),vy:rnd(-3,1),life:rnd(30,60),c:COLORS[ri(7)].f,s:rnd(2,4)});
 tMap++;rescued=0;tBuildMap();tHold=null;tBusy=0;tStage=null;tSpawn();}
function tAfterLock(){const D=DIFF[diff];tChain=0;
 if(tetrisMode==='rescue'&&rescued>=MICE0){updateStoneBtn();tMapDone();return;}
 if(tetrisMode==='rescue'&&D.rise&&tpieces%D.rise===0){tRise();if(state==='lose')return;}
 if(tb.slice(0,4).some(r=>r.some(Boolean))&&!warned){warned=true;playVoice('peligro');say('Gato Negro','Cuidado, Coraline. Te quedan pocos botones y la Mamá de Botones está mirando.',4600);}
 if(tetrisMode==='rescue'&&stone>=100&&!ready100){ready100=true;SFX.ready();say('Gato Negro','La Piedra Mágica está lista… pulsa 🔺 o Espacio.',3000);}
 updateStoneBtn();tSpawn();}
function tStone(){let n=0;for(let r=TROWS-1;r>=0&&n<2;r--){if(tb[r].some(Boolean)){tRescueRow(r);tb.splice(r,1);tb.unshift(Array(TCOLS).fill(null));n++;r++;}}
 stone=0;ready100=false;SFX.rescue();updateStoneBtn();if(tetrisMode==='rescue'&&rescued>=MICE0&&!endTimer){tp=null;tMapDone();}}
function tPress(id){if(state!=='play'||!tp||endTimer)return;if(id==='tRot')tRot();else if(id==='tHard')tHard();else{tHold={id,t:200};if(id==='tL')tMove(-1,0);if(id==='tR')tMove(1,0);}}
function tRelease(){tHold=null;}
function tUpdate(){if(endTimer||drawer.classList.contains('open'))return;
 if(tBusy>0){tBusy-=16.7;if(tBusy<=0){tBusy=0;tStep();}return;}
 if(!tp)return;const D=DIFF[diff],down=tHold&&tHold.id==='tD';
 if(tHold&&(tHold.id==='tL'||tHold.id==='tR')){tHold.t-=16.7;if(tHold.t<=0){tHold.t=80;tMove(tHold.id==='tL'?-1:1,0);}}
 tacc+=16.7;const iv=down?45:Math.max(110,D.t-(tlevel-1)*D.ramp);
 if(tacc>=iv){tacc=0;if(!tMove(0,1))tLock();else if(down)score+=1;}}
function tBtn(x,y,w,h,label,id){const on=tHold&&tHold.id===id;ctx.fillStyle=on?'#4a1d78':'#2a1346';rr(x,y,w,h,16);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2.5;ctx.stroke();txt(label,x+w/2,y+h/2+9,'700 26px sans-serif','#fff');hits.push({x,y,w,h,id});}
function drawTetris(){drawSky();drawFog(.1);
 ctx.fillStyle='#0b0614dd';rr(TX-5,TY-5,TCOLS*TC+10,TROWS*TC+10,8);ctx.fill();ctx.strokeStyle='#9b5de5aa';ctx.lineWidth=2;ctx.stroke();
 ctx.strokeStyle='#ffffff12';ctx.lineWidth=1;ctx.beginPath();for(let c=1;c<TCOLS;c++){ctx.moveTo(TX+c*TC,TY);ctx.lineTo(TX+c*TC,TY+TROWS*TC);}for(let r=1;r<TROWS;r++){ctx.moveTo(TX,TY+r*TC);ctx.lineTo(TX+TCOLS*TC,TY+r*TC);}ctx.stroke();
 ctx.setLineDash([8,8]);ctx.strokeStyle='#ff5d8f77';ctx.beginPath();ctx.moveTo(TX,TY+4*TC);ctx.lineTo(TX+TCOLS*TC,TY+4*TC);ctx.stroke();ctx.setLineDash([]);
 for(let r=0;r<TROWS;r++)for(let c=0;c<TCOLS;c++){const b=tb[r]&&tb[r][c];if(b)drawBtnS(TX+c*TC+TC/2,TY+r*TC+TC/2,b.c,b.mouse,TC/2-.5);}
 if(tp&&state==='play'){const gy=tGhostY();tp.m.forEach((row,i)=>row.forEach((v,j)=>{if(v){const x=TX+(tp.x+j)*TC+TC/2;ctx.strokeStyle=COLORS[tp.c].f+'99';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,TY+(gy+i)*TC+TC/2,TC/2-3,0,TAU);ctx.stroke();}}));
  tp.m.forEach((row,i)=>row.forEach((v,j)=>{if(v&&tp.y+i>=0)drawBtnS(TX+(tp.x+j)*TC+TC/2,TY+(tp.y+i)*TC+TC/2,tp.c,false,TC/2-.5);}));}
 // panel lateral
 txt('SIGUIENTE',401,84,'700 12px Quicksand,sans-serif','#b79cd6');ctx.fillStyle='#0b0614dd';rr(336,92,130,88,12);ctx.fill();ctx.strokeStyle='#9b5de566';ctx.lineWidth=2;ctx.stroke();
 const nm=SHAPES[tnext][0],cells=[];nm.forEach((r,i)=>r.forEach((v,j)=>{if(v)cells.push([i,j]);}));const mi=Math.min(...cells.map(c=>c[0])),mj=Math.min(...cells.map(c=>c[1])),Mi=Math.max(...cells.map(c=>c[0])),Mj=Math.max(...cells.map(c=>c[1]));
 cells.forEach(([i,j])=>drawBtnS(401-(Mj-mj+1)*11+(j-mj)*22+11,136-(Mi-mi+1)*11+(i-mi)*22+11,SHAPES[tnext][1],false,10));
 txt('NIVEL',401,215,'700 12px Quicksand,sans-serif','#b79cd6');txt(String(tlevel),401,240,'700 24px Quicksand,sans-serif','#ffd166');
 txt('LÍNEAS',401,272,'700 12px Quicksand,sans-serif','#b79cd6');txt(String(tlines),401,297,'700 24px Quicksand,sans-serif','#fff');
 txt(DIFF[diff].n.toUpperCase(),401,328,'700 13px Quicksand,sans-serif','#06d6a0');
 if(tetrisMode==='rescue'){txt('MAPA '+tMap,401,370,'700 12px Quicksand,sans-serif','#b79cd6');
  for(let i=0;i<MICE0;i++){const x=358+(i%3)*43,y=402+Math.floor(i/3)*40;ctx.globalAlpha=i<rescued?1:.25;mouseFace(x,y,13);}ctx.globalAlpha=1;
  txt('SALVADOS 🐭 '+savedTotal,401,478,'700 13px Quicksand,sans-serif','#ffd166');
  txt('Espacio = caída',401,508,'500 11px Quicksand,sans-serif','#8d78a8');txt('🔺 limpia 2 filas',401,526,'500 11px Quicksand,sans-serif','#8d78a8');}
 else{txt('CLÁSICO',401,380,'700 14px Quicksand,sans-serif','#ffd166');txt('PUNTOS',401,414,'700 12px Quicksand,sans-serif','#b79cd6');txt(score.toLocaleString('es-CL'),401,440,'700 20px Quicksand,sans-serif','#fff');txt('Espacio = caída',401,508,'500 11px Quicksand,sans-serif','#8d78a8');}
 // Controles: flechas en los extremos; acciones centrales en el orden original.
 tBtn(15,624,58,66,'◀','tL');
 tBtn(112,624,58,66,'⟳','tRot');
 tBtn(181,624,58,66,'▼','tD');
 tBtn(250,624,58,66,'⏬','tHard');
 tBtn(407,624,58,66,'▶','tR');
 parts.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life/20);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,TAU);ctx.fill();});ctx.globalAlpha=1;
 jumpers.forEach(j=>mouseFace(j.x,j.y,12));
 floats.forEach(f=>{ctx.globalAlpha=Math.min(1,f.life/20);txt(f.txt,f.x,f.y,'700 16px Quicksand,sans-serif',f.c);});ctx.globalAlpha=1;
 drawHUD();drawBanner();}

