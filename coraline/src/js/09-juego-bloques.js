/* ================= MODO BLOQUES (inspirado en Block Blast) ================= */
const BC=8,BS=43,BX=68,BY=105;
const BSHAPES=[
 [[0,0],[1,0],[2,0]], [[0,0],[0,1],[0,2]], [[0,0],[1,0],[0,1],[1,1]],
 [[0,0],[1,0],[2,0],[1,1]], [[0,0],[0,1],[1,1],[1,2]],
 [[1,0],[0,1],[1,1],[2,1]], [[0,0],[1,0],[2,0],[3,0]],
 [[0,0],[1,0],[0,1],[1,1],[0,2]], [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],
 [[0,0],[0,1],[1,1]], [[0,0],[1,0],[2,0],[2,1],[2,2]]
];
let bgrid=[],bpieces=[],bselected=-1,bscore=0,bturn=0,bRescueUsed=false,bcombo=0,bBestCombo=0,bNoClear=0,bdragging=false,bdragMoved=false,bdragStart=null,bpreview=null;
const bPops=[];
let bTime=0,bBest=0,bHints=1,bSwaps=1,bHintTarget=null,bPressure=0,bPressureMsg=false;
// Mejor puntaje previo de este perfil en Bloques (para el reto "a punto de superar el récord").
function bBestScore(){try{const list=JSON.parse(localStorage.getItem('coraline_scores_v2')||'[]');return list.filter(v=>v&&v.mode==='Bloques'&&(!profile||v.profileId===profile.id)).reduce((m,v)=>Math.max(m,Number(v.score)||0),0);}catch(e){return 0;}}
function bNew(){bgrid=Array.from({length:BC},()=>Array(BC).fill(-1));bselected=-1;bscore=0;bturn=0;bRescueUsed=false;bcombo=0;bBestCombo=0;bNoClear=0;bdragging=false;bdragMoved=false;bdragStart=null;bpreview=null;bPops.length=0;
 bTime=0;bBest=bBestScore();bHints=1;bSwaps=1;bHintTarget=null;bPressure=0;bPressureMsg=false;
 score=0;rescued=0;stone=0;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];clearTimeout(endTimer);endTimer=null;bpieces=bDeal();
 say('Coraline',bBest>0?'Tu récord es '+bBest.toLocaleString('es-CL')+'. ¡Vamos a superarlo!':'Arrastra los botones al tablero. Completa líneas y encadena combos.',3600);}
// ---------- Dificultad dinámica ----------
// La presión sube con el tiempo de juego (desde 1 min) y al acercarse al récord personal.
function bUpdatePressure(){const timeP=clamp01((bTime/1000-60)/240),recP=bBest>0?clamp01((bscore-.6*bBest)/(.4*bBest)):0;bPressure=Math.max(timeP,recP);
 if(bPressure>.5&&!bPressureMsg){bPressureMsg=true;say('Gato Negro','El tablero se pone difícil… piensa bien dónde va cada botón.',3200);}}
const B_EASY=[[6,6,5,2,2,2,1,1,1,5,1],[5,5,5,2,2,2,2,1,1,4,1],[3,3,3,3,3,3,2,2,2,2,2],[2,2,2,3,3,3,4,4,4,2,4]];
const B_HARD=[1,1,1,2,2,2,5,5,6,1,5];
function bPiece(){const base=B_EASY[dIdx()],w=base.map((v,i)=>v*(1-bPressure)+B_HARD[i]*bPressure);
 let roll=Math.random()*w.reduce((a,b)=>a+b,0),idx=0;for(;idx<w.length-1;idx++){roll-=w[idx];if(roll<=0)break;}
 return{cells:BSHAPES[idx].map(p=>p.slice()),color:ri(7)};}
function bCanOn(g,piece,x,y){return piece.cells.every(([dx,dy])=>x+dx>=0&&x+dx<BC&&y+dy>=0&&y+dy<BC&&g[y+dy][x+dx]===-1);}
function bHasMoveOn(g,p){if(!p)return false;for(let y=0;y<BC;y++)for(let x=0;x<BC;x++)if(bCanOn(g,p,x,y))return true;return false;}
function bFullLines(g){const rows=[],cols=[];for(let r=0;r<BC;r++)if(g[r].every(v=>v!==-1))rows.push(r);for(let c=0;c<BC;c++)if(g.every(row=>row[c]!==-1))cols.push(c);return{rows,cols};}
function bApply(g,p,x,y){const h=g.map(r=>r.slice());p.cells.forEach(([dx,dy])=>h[y+dy][x+dx]=p.color);const {rows,cols}=bFullLines(h);rows.forEach(r=>{for(let c=0;c<BC;c++)h[r][c]=-1;});cols.forEach(c=>{for(let r=0;r<BC;r++)h[r][c]=-1;});return h;}
// ¿Se pueden colocar las tres piezas (en algún orden)? Garantiza que una mano difícil nunca sea imposible.
function bSolvable(deal){let nodes=0;
 function dfs(g,rem){if(!rem.length)return true;if(++nodes>5000)return true;
  for(let i=0;i<rem.length;i++){const p=rem[i],rest=rem.filter((_,j)=>j!==i);
   for(let y=0;y<BC;y++)for(let x=0;x<BC;x++){if(!bCanOn(g,p,x,y))continue;if(dfs(bApply(g,p,x,y),rest))return true;}}
  return false;}
 return dfs(bgrid,deal);}
function bTightness(deal){let n=0;deal.forEach(p=>{for(let y=0;y<BC;y++)for(let x=0;x<BC;x++)if(bCanOn(bgrid,p,x,y))n++;});return n;}
function bDeal(){bUpdatePressure();let deal=[];
 if(bPressure>.25){let best=null,bt=1e9,first=null;
  for(let t=0;t<12;t++){const d=[bPiece(),bPiece(),bPiece()];if(!d.some(p=>bHasMoveOn(bgrid,p))||!bSolvable(d))continue;if(!first)first=d;const k=bTightness(d);if(k<bt){bt=k;best=d;}}
  if(first)return Math.random()<.3+bPressure*.7?best:first;}
 for(let tries=0;tries<24;tries++){deal=[bPiece(),bPiece(),bPiece()];if(deal.some(p=>bHasMoveOn(bgrid,p)))return deal;}
 // Respaldo justo: si el tablero está casi bloqueado, al menos una pieza cabe siempre que exista una casilla vacía.
 if(bgrid.some(row=>row.some(v=>v===-1)))deal[0]={cells:[[0,0]],color:ri(7)};
 return deal;}
function bCan(piece,x,y){return bCanOn(bgrid,piece,x,y);}
function bHasMove(p){return bHasMoveOn(bgrid,p);}
function bPlace(piece,x,y){
 if(!piece||bselected<0||!bCan(piece,x,y))return false;
 piece.cells.forEach(([dx,dy])=>bgrid[y+dy][x+dx]=piece.color);
 const placed=piece.cells.length*10;bscore+=placed;floats.push({x:240,y:430,txt:'+'+placed,c:'#b8f7e2',life:48});
 const {rows,cols}=bFullLines(bgrid),lines=rows.length+cols.length;
 const clear=new Set();rows.forEach(r=>{for(let c=0;c<BC;c++)clear.add(r*BC+c);});cols.forEach(c=>{for(let r=0;r<BC;r++)clear.add(r*BC+c);});
 if(clear.size){
  // Combo encadenado: la racha sobrevive hasta 2 jugadas sin limpiar; el multiplicador llega a x8.
  bcombo++;bNoClear=0;bBestCombo=Math.max(bBestCombo,bcombo);
  const multiplier=Math.min(8,1+bcombo),base=clear.size*20,multiBonus=lines>1?150*(lines-1):0,comboBonus=100*bcombo;
  const gained=(base+multiBonus)*multiplier+comboBonus;bscore+=gained;
  clear.forEach(k=>bgrid[Math.floor(k/BC)][k%BC]=-1);
  bPops.push({big:multiplier>1?'COMBO x'+multiplier:(lines>1?lines+' LÍNEAS':'¡LÍNEA!'),sub:(multiplier>1&&lines>1?lines+' líneas · ':'')+'+'+gained.toLocaleString('es-CL'),life:70,max:70,hot:multiplier>=4});
  say('Coraline',bcombo>=3?'¡Eso fue increíble! ¡Sigue el combo!':'¡Línea despejada! ¡Buen trabajo!',1800);
  SFX.pop(Math.min(4,lines));
  if(bgrid.every(r=>r.every(v=>v===-1))){bscore+=800;floats.push({x:240,y:380,txt:'¡TABLERO LIMPIO! +800',c:'#8fe9c9',life:90});}
  if(bcombo%4===0){bHints++;say('Gato Negro','¡Racha x'+bcombo+'! Ganaste otra 💡 pista.',2600);}
 }else{bNoClear++;if(bNoClear>=3&&bcombo>0){bcombo=0;bNoClear=0;say('Gato Negro','Se acabó la racha… ¡empieza otra!',1600);}}
 bpieces[bselected]=null;bselected=-1;bdragging=false;bpreview=null;bHintTarget=null;bturn++;score=bscore;bUpdatePressure();
 if(bpieces.every(p=>!p))bpieces=bDeal();
 if(bpieces.filter(Boolean).every(p=>!bHasMove(p))){
  const empty=bgrid.some(row=>row.some(v=>v===-1));
  if(empty&&!bRescueUsed&&diff!=='experto'){
   const slot=bpieces.findIndex(p=>!p||!bHasMove(p));bpieces[slot]={cells:[[0,0]],color:ri(7)};bRescueUsed=true;
   say('Gato Negro','¡Todavía hay una salida! Te guardé una pieza pequeña.',3000);
  }else{lose();}
 }
 return true;}
function bPieceBounds(p){return{w:Math.max(...p.cells.map(a=>a[0]))+1,h:Math.max(...p.cells.map(a=>a[1]))+1};}
function bDrawButtonCell(x,y,color,alpha=1,scale=0.82){ctx.save();ctx.globalAlpha=alpha==null?1:alpha;const col=COLORS[color]||COLORS[0];if(blocksStyle==='square'){const s=BS*scale;ctx.fillStyle='rgba(0,0,0,.35)';rr(x-s/2+1.5,y-s/2+2,s,s,2);ctx.fill();ctx.fillStyle=col.b;rr(x-s/2,y-s/2,s,s,2);ctx.fill();ctx.fillStyle=col.f;rr(x-s/2+4,y-s/2+4,s-8,s-8,1);ctx.fill();ctx.fillStyle='#1b1020';[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(x+a*s*.18,y+b*s*.18,Math.max(1.2,s*.06),0,TAU);ctx.fill();});ctx.strokeStyle='#f3e9d2';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-s*.16,y-s*.16);ctx.lineTo(x+s*.16,y+s*.16);ctx.moveTo(x+s*.16,y-s*.16);ctx.lineTo(x-s*.16,y+s*.16);ctx.stroke();}else{ctx.translate(x,y);ctx.scale((BS*scale/2)/R,(BS*scale/2)/R);drawButton(0,0,color,false,alpha);}ctx.restore();}

// ---------- Pieza flotante ----------
// La pieza sigue al puntero píxel a píxel (sin saltar de casilla en casilla). En pantalla táctil se dibuja
// por encima del dedo para que nunca lo tape; al soltar se ancla a la casilla más cercana de su posición real.
const B_FINGER_GAP=46,B_SCALE=1.18,B_GAIN_X=1.5,B_GAIN_Y=1.85;
// Táctil: la pieza parte del hueco de la bandeja y se mueve más rápido que el dedo (ganancia), con un poco de
// elevación para que el dedo no la tape. Ratón: la pieza sigue al puntero exacto.
function bFloat(lift){const p=bpieces[bselected],bb=bPieceBounds(p),pw=bb.w*BS,ph=bb.h*BS;let cx=mouseX,cy=mouseY;
 if(lift&&bdragStart){const sx=15+bselected*153+71,sy=597,dx=mouseX-bdragStart.x,dy=mouseY-bdragStart.y;
  cx=sx+dx*B_GAIN_X;cy=sy+dy*B_GAIN_Y-Math.min(B_FINGER_GAP,Math.max(0,-dy)*.5);}
 else if(lift)cy-=ph/2+B_FINGER_GAP;
 cx=Math.max(20,Math.min(W-20,cx));cy=Math.max(TOP+10,Math.min(H-20,cy));
 return{left:cx-pw/2,top:cy-ph/2,pw,ph,cx,cy,bb};}
function bShowFloat(){return bselected>=0&&!!bpieces[bselected]&&(bdragging||(lastPtr==='mouse'&&mouseY<525));}
function bTargetAt(lift){const p=bpieces[bselected],f=bFloat(lift);
 const inside=p.cells.some(([dx,dy])=>{const cx=f.left+(dx+.5)*BS,cy=f.top+(dy+.5)*BS;return cx>=BX&&cx<BX+BC*BS&&cy>=BY&&cy<BY+BC*BS;});
 if(!inside)return null;const col=Math.round((f.left-BX)/BS),row=Math.round((f.top-BY)/BS);return{col,row,valid:bCan(p,col,row),f};}
function bUpdatePreview(){if(!bShowFloat()){bpreview=null;return;}bpreview=bTargetAt(lastPtr==='touch');}
// ---------- Comodines (cuestan puntos) ----------
function bCost(){return Math.max(150,Math.round(bscore*.1/10)*10);}
function bBestMove(){let best=null,bs=-1e9;
 bpieces.forEach((p,i)=>{if(!p)return;for(let y=0;y<BC;y++)for(let x=0;x<BC;x++){if(!bCan(p,x,y))continue;
  const g=bgrid.map(r=>r.slice());p.cells.forEach(([dx,dy])=>g[y+dy][x+dx]=p.color);const f=bFullLines(g),lines=f.rows.length+f.cols.length;
  let contact=0;p.cells.forEach(([dx,dy])=>{[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const X=x+dx+a,Y=y+dy+b;if(X<0||X>=BC||Y<0||Y>=BC||bgrid[Y][X]!==-1)contact++;});});
  let iso=0;for(let yy=0;yy<BC;yy++)for(let xx=0;xx<BC;xx++){if(g[yy][xx]!==-1)continue;if(![[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const X=xx+a,Y=yy+b;return X>=0&&X<BC&&Y>=0&&Y<BC&&g[Y][X]===-1;}))iso++;}
  const others=bpieces.filter((q,j)=>q&&j!==i),fit=others.filter(q=>bHasMoveOn(bApply(bgrid,p,x,y),q)).length;
  const s=lines*120+contact*3-iso*18+(others.length?(fit===others.length?40:-200+fit*60):0);
  if(s>bs){bs=s;best={i,x,y};}}});
 return best;}
function bUseHint(){if(state!=='play'||mode!=='blocks')return;
 if(bHints<=0){say('Gato Negro','Ya usaste tu 💡. Gana otra con una racha de 4.',2400);return;}
 const cost=bCost();if(bscore<cost){say('Gato Negro','Necesitas '+cost+' puntos para usar la 💡.',2200);return;}
 const h=bBestMove();if(!h){say('Gato Negro','No veo ninguna jugada posible…',1800);return;}
 bHints--;bscore-=cost;score=bscore;bHintTarget=h;bselected=h.i;floats.push({x:392,y:120,txt:'−'+cost,c:'#ff8eae',life:60});SFX.ready();
 say('Gato Negro','Mira el brillo dorado: ahí encaja mejor ese botón.',3200);}
function bUseSwap(){if(state!=='play'||mode!=='blocks')return;
 if(bSwaps<=0){say('Gato Negro','Ya cambiaste tus botones en esta partida.',2200);return;}
 const cost=bCost();if(bscore<cost){say('Gato Negro','Necesitas '+cost+' puntos para cambiar los botones.',2400);return;}
 const nd=bDeal();bpieces=bpieces.map((p,i)=>p?nd[i]:null);bSwaps--;bscore-=cost;score=bscore;bselected=-1;bdragging=false;bpreview=null;bHintTarget=null;
 floats.push({x:438,y:120,txt:'−'+cost,c:'#ff8eae',life:60});SFX.bounce();say('Gato Negro','¡Botones nuevos! Úsalos con cabeza.',2600);}

function bCircleBtn(x,y,label,id,uses,cost,ok){ctx.save();const g=ok?.5+.5*Math.sin(tick*.08):0;ctx.shadowColor='#ffd166';ctx.shadowBlur=ok?10+8*g:0;ctx.fillStyle=ok?'#3a1d62':'#1a0f28';ctx.beginPath();ctx.arc(x,y,22,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=ok?'#ffd166':'#5a4a70';ctx.lineWidth=3;ctx.stroke();ctx.globalAlpha=ok?1:.45;txt(label,x,y+8,'22px sans-serif','#fff');ctx.globalAlpha=1;
 ctx.fillStyle=uses>0?'#06d6a0':'#ff5d8f';ctx.beginPath();ctx.arc(x+17,y-17,10,0,TAU);ctx.fill();txt(String(uses),x+17,y-13,'900 13px Quicksand,sans-serif','#07050e');
 txt('−'+cost,x,y+38,'800 12px Quicksand,sans-serif',ok?'#ffd166':'#8d78a8');ctx.restore();hits.push({x:x-26,y:y-26,w:52,h:52,id});}

function drawBlocks(){
 drawSky();bUpdatePressure();
 ctx.fillStyle='rgba(10,5,20,.94)';ctx.fillRect(0,0,W,TOP);
 txt('✦ EL TABLERO DE CORALINE ✦',240,27,'700 18px Quicksand,sans-serif','#ffd166');
 if(bcombo>0)txt('🔥 COMBO x'+Math.min(8,1+bcombo)+' · racha '+bcombo+' · quedan '+(3-bNoClear)+' jugadas',240,49,'900 14px Quicksand,sans-serif','#ffd166');else txt('BOTONES ENCANTADOS',240,49,'700 10px Quicksand,sans-serif','#cdb6ea');
 ctx.save();ctx.shadowColor='#06d6a0';ctx.shadowBlur=14;ctx.fillStyle='rgba(20,12,36,.96)';rr(120,60,240,35,17);ctx.fill();ctx.strokeStyle='#06d6a0';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
 txt('✧ '+bscore.toLocaleString('es-CL')+' PUNTOS ✧',240,83,'900 19px Quicksand,sans-serif','#fff');
 ctx.fillStyle='#2a1346';rr(8,62,108,30,14);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=1.5;ctx.stroke();txt(blocksStyle==='square'?'Cuadrado':'Redondo',62,82,'700 11px Quicksand,sans-serif','#fff');hits.push({x:8,y:62,w:108,h:30,id:'bstyle'});
 const cost=bCost();bCircleBtn(386,72,'💡','bLamp',bHints,cost,bHints>0&&bscore>=cost);bCircleBtn(436,72,'🔄','bSwap',bSwaps,cost,bSwaps>0&&bscore>=cost);
 if(bPressure>.05){ctx.fillStyle='#1a1228';rr(8,95,108,4,2);ctx.fill();ctx.fillStyle=bPressure>.66?'#ff5d8f':bPressure>.33?'#ff9f43':'#ffd166';rr(8,95,108*bPressure,4,2);ctx.fill();}
 ctx.save();ctx.shadowColor='#9b5de5';ctx.shadowBlur=18;ctx.fillStyle='rgba(24,12,42,.95)';rr(BX-7,BY-7,BC*BS+14,BC*BS+14,15);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();ctx.restore();
 const sq=blocksStyle==='square'?2:7;
 for(let r=0;r<BC;r++)for(let c=0;c<BC;c++){
  const x=BX+c*BS,y=BY+r*BS,v=bgrid[r][c];
  ctx.fillStyle=v>=0?'rgba(40,24,58,.96)':'rgba(174,145,205,.24)';rr(x+2,y+2,BS-4,BS-4,sq);ctx.fill();
  ctx.strokeStyle=v>=0?'rgba(255,255,255,.28)':'rgba(235,218,255,.68)';ctx.lineWidth=v>=0?1.2:1.5;ctx.stroke();
  if(v<0){ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(x+BS/2,y+BS/2,2,0,TAU);ctx.fill();}
  if(v>=0)bDrawButtonCell(x+BS/2,y+BS/2,v,1,.84);
 }
 // Pista 💡: brillo dorado donde encaja mejor.
 if(bHintTarget&&bpieces[bHintTarget.i]){const hp=bpieces[bHintTarget.i],pulse=.55+.45*Math.sin(tick*.12);
  hp.cells.forEach(([dx,dy])=>{const x=BX+(bHintTarget.x+dx)*BS,y=BY+(bHintTarget.y+dy)*BS;ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=28*pulse;ctx.fillStyle='rgba(255,209,102,'+(.35+.3*pulse)+')';rr(x,y,BS,BS,sq);ctx.fill();ctx.strokeStyle='#fff3c4';ctx.lineWidth=3.5;ctx.stroke();ctx.restore();});}
 // Guía de destino: casillas donde quedará la pieza (contorno), más las líneas que se completarían.
 bUpdatePreview();
 if(bpreview&&bShowFloat()){const p=bpieces[bselected],ok=bpreview.valid;
  if(ok){const g=bgrid.map(r=>r.slice());p.cells.forEach(([dx,dy])=>g[bpreview.row+dy][bpreview.col+dx]=p.color);const f=bFullLines(g);
   const gp=.5+.5*Math.sin(tick*.18);ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=18;f.rows.forEach(r=>{ctx.fillStyle='rgba(255,209,102,'+(.32+.2*gp)+')';ctx.fillRect(BX,BY+r*BS,BC*BS,BS);ctx.strokeStyle='#ffe38f';ctx.lineWidth=3;ctx.strokeRect(BX,BY+r*BS,BC*BS,BS);});f.cols.forEach(c=>{ctx.fillStyle='rgba(255,209,102,'+(.32+.2*gp)+')';ctx.fillRect(BX+c*BS,BY,BS,BC*BS);ctx.strokeStyle='#ffe38f';ctx.lineWidth=3;ctx.strokeRect(BX+c*BS,BY,BS,BC*BS);});ctx.restore();
   const n=f.rows.length+f.cols.length;if(n>0)txt('¡'+n+(n>1?' LÍNEAS':' LÍNEA')+'!',240,BY-14,'900 18px Quicksand,sans-serif','#ffe38f');}
  p.cells.forEach(([dx,dy])=>{const gx=bpreview.col+dx,gy=bpreview.row+dy;if(gx<0||gx>=BC||gy<0||gy>=BC)return;
   ctx.save();ctx.fillStyle=ok?'rgba(6,214,160,.30)':'rgba(255,93,143,.30)';rr(BX+gx*BS+1,BY+gy*BS+1,BS-2,BS-2,sq);ctx.fill();ctx.strokeStyle=ok?'#06d6a0':'#ff5d8f';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();});
  txt(ok?'✓ POSICIÓN VÁLIDA':'✕ NO CABE AHÍ',240,490,'900 15px Quicksand,sans-serif',ok?'#06d6a0':'#ff8eae');
 }
 if(!(bpreview&&bShowFloat()))txt(bdragging?'Suelta sobre el tablero para colocar':IS_TOUCH?'Arrastra un botón al tablero':'Arrastra un botón al tablero o elígelo y haz clic',240,470,'600 12px Quicksand,sans-serif',bdragging?'#06d6a0':'#e4d5f5');
 bpieces.forEach((p,i)=>{const x=15+i*153,y=535,w=143,h=125;ctx.save();ctx.fillStyle=bselected===i?'rgba(44,25,70,.98)':'rgba(22,12,38,.94)';rr(x,y,w,h,15);ctx.fill();ctx.strokeStyle=bselected===i?'#06d6a0':'#b79cd6';ctx.lineWidth=bselected===i?3.5:2;ctx.stroke();if(bselected===i){ctx.shadowColor='#06d6a0';ctx.shadowBlur=15;ctx.stroke();}ctx.restore();
  if(p){ctx.save();if(bdragging&&bselected===i)ctx.globalAlpha=.3;const bb=bPieceBounds(p),sz=Math.min(25,88/bb.w,66/bb.h),ox=x+(w-bb.w*sz)/2,oy=y+14+(74-bb.h*sz)/2;
   p.cells.forEach(([dx,dy])=>bDrawButtonCell(ox+(dx+.5)*sz,oy+(dy+.5)*sz,p.color,1,Math.min(.9,sz/BS*.95)));ctx.restore();
   txt(bselected===i?'✦ SELECCIONADO':'BOTÓN '+(i+1),x+w/2,y+111,'800 10px Quicksand,sans-serif',bselected===i?'#06d6a0':'#e4d5f5');
  }else txt('USADO',x+w/2,y+70,'700 12px Quicksand,sans-serif','#8d78a8');
  hits.push({x,y,w,h,id:'bp'+i});
 });
 txt('Completa filas o columnas · ¡encadena combos para multiplicar puntos!',240,682,'600 11px Quicksand,sans-serif','#ffd166');
 menuBtn('Pausa',690,'pause');
 // Pieza flotante: completamente opaca y siempre por encima de todo lo demás.
 if(bShowFloat()){const p=bpieces[bselected],f=bFloat(lastPtr==='touch');
  const S=BS*B_SCALE,pos2=([dx,dy])=>[f.cx+(dx+.5-f.bb.w/2)*S,f.cy+(dy+.5-f.bb.h/2)*S];
  p.cells.forEach(c=>{const [x,y]=pos2(c);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x+3,y+9,S*.4,S*.28,0,0,TAU);ctx.fill();});
  ctx.save();ctx.shadowColor='#ffffff';ctx.shadowBlur=10;p.cells.forEach(c=>{const [x,y]=pos2(c);bDrawButtonCell(x,y,p.color,1,.94*B_SCALE);});ctx.restore();
  if(bdragging&&lastPtr==='touch'){ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=2;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(mouseX,mouseY-14);ctx.lineTo(f.cx,f.cy+f.ph*B_SCALE/2+4);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(mouseX,mouseY,9,0,TAU);ctx.fill();}}
 // Carteles grandes de combo: aparecen con rebote en el centro del tablero.
 for(let i=bPops.length-1;i>=0;i--){const q=bPops[i];q.life--;if(q.life<=0){bPops.splice(i,1);continue;}
  const age=q.max-q.life,sc=age<10?.4+age*.085:1+.04*Math.sin(age*.5),al=Math.min(1,q.life/18);
  ctx.save();ctx.globalAlpha=al;ctx.translate(240,BY+BC*BS/2-20-(age*.4));ctx.scale(sc,sc);ctx.textAlign='center';
  ctx.font='900 '+(q.hot?54:46)+'px Quicksand,sans-serif';ctx.lineJoin='round';ctx.lineWidth=9;ctx.strokeStyle='#2a0a4d';ctx.strokeText(q.big,0,0);
  ctx.shadowColor=q.hot?'#ff5d8f':'#ffd166';ctx.shadowBlur=26;ctx.fillStyle=q.hot?'#ff9ec0':'#ffe38f';ctx.fillText(q.big,0,0);ctx.shadowBlur=0;
  ctx.font='900 26px Quicksand,sans-serif';ctx.lineWidth=6;ctx.strokeText(q.sub,0,38);ctx.fillStyle='#fff';ctx.fillText(q.sub,0,38);ctx.restore();}
 floats.forEach(f=>{ctx.globalAlpha=Math.min(1,f.life/20);txt(f.txt,f.x,f.y,'700 16px Quicksand,sans-serif',f.c);});ctx.globalAlpha=1;
 drawBanner();
}
// Toque sobre el tablero con una pieza elegida (sin arrastrar): la pieza queda centrada en el punto tocado.
function bPointer(){if(state!=='play'||mode!=='blocks')return false;
 if(bselected<0||!bpieces[bselected])return false;
 const t=bTargetAt(false);if(!t)return false;
 if(t.valid){if(bPlace(bpieces[bselected],t.col,t.row))SFX.stick();}
 else say('Gato Negro','Ahí no cabe: está ocupado o se sale del tablero. Prueba otra posición.',1900);
 return true;}
function bEndDrag(){
 if(!bdragging)return;
 bUpdatePreview();const pv=bpreview;bdragging=false;
 if(pv&&pv.valid&&bselected>=0&&bpieces[bselected]){if(bPlace(bpieces[bselected],pv.col,pv.row))SFX.stick();}
 else if(pv&&!pv.valid)say('Gato Negro','Ahí no cabe: está ocupado o se sale del tablero.',1500);
 bpreview=null;}
