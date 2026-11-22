/* ================= MODO SNAKE ("El hilo") =================
   Con paredes: chocar con el borde pierde. Sin paredes: el hilo reaparece por el lado opuesto.
   Móvil: se juega tocando/deslizando sobre la pantalla (sin botones). PC: flechas o WASD. */
const SN=16,SC=22,SOX=64,SOY=108;
const SN_OBS=[0,0,5,10];// piedras fijas por dificultad
const snIv=()=>{const d=dIdx(),sv=DIFF[diff].sv;return Math.max(sv*.55,sv*(1-Math.min(.4,Math.max(0,snake.length-3)*.012*(d+1))));};
let snObs=[],sTouchZone='',snake=[],sdir={x:1,y:0},snext={x:1,y:0},sfood={x:8,y:8},sacc=0,sSwipe=null;
function sSpawnFood(){const occ=new Set(snake.map(p=>p.x+','+p.y).concat(snObs.map(p=>p.x+','+p.y)));const free=[];for(let y=0;y<SN;y++)for(let x=0;x<SN;x++)if(!occ.has(x+','+y))free.push({x,y});return free.length?free[ri(free.length)]:{x:0,y:0};}
function sNew(){score=0;rescued=0;stone=0;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];const mid=8;snake=[{x:mid,y:mid},{x:mid-1,y:mid},{x:mid-2,y:mid}];sdir={x:1,y:0};snext={x:1,y:0};snObs=[];for(let k=0;k<SN_OBS[dIdx()]*1;k++){let t=0,p;do{p={x:ri(SN),y:ri(SN)};t++;}while(t<80&&(Math.abs(p.y-mid)<=1&&p.x<mid+7||snObs.some(o=>o.x===p.x&&o.y===p.y)));if(t<80)snObs.push(p);}sfood=sSpawnFood();sacc=0;sSwipe=null;clearTimeout(endTimer);endTimer=null;
 say('Coraline',(snakeWrap?'Sin paredes: si cruzas un borde apareces al otro lado. ':'Con paredes: no choques con el borde. ')+'Usa los botones de abajo: ARRIBA, IZQ., DER. o ABAJO (o flechas/WASD).',4200);}
function sTurn(dx,dy){if(!dx&&!dy)return;if(sdir.x+dx===0&&sdir.y+dy===0)return;snext={x:dx,y:dy};}
function sPress(id){if(state!=='play'||mode!=='snake')return;if(id==='sU')sTurn(0,-1);else if(id==='sD')sTurn(0,1);else if(id==='sL')sTurn(-1,0);else if(id==='sR')sTurn(1,0);}
// Toque simple: gira hacia el lado tocado respecto de la cabeza (eje contrario al movimiento actual).
// Control en X: la pantalla se divide con dos diagonales (centro en XC,YC) en 4 zonas: Arriba / Izquierda / Derecha / Abajo.
// Tocar una zona manda a la culebra en esa dirección absoluta (no puede darse la vuelta sobre sí misma).
const PADL=96,PADR=384,PADT=504,PADB=708,XC=240,XY=(PADT+PADB)/2;
// Solo cuenta lo que se toca DENTRO del pad (debajo del tablero). Devuelve 'U','D','L','R' o '' si está fuera.
function sXZone(x,y){if(x<PADL||x>PADR||y<PADT||y>PADB)return'';const dx=x-XC,dy=y-XY,hw=(PADR-PADL)/2,hh=(PADB-PADT)/2;return Math.abs(dy)*hw>Math.abs(dx)*hh?(dy<0?'U':'D'):(dx<0?'L':'R');}
function sXTurn(x,y){const z=sXZone(x,y);if(z==='U')sTurn(0,-1);else if(z==='D')sTurn(0,1);else if(z==='L')sTurn(-1,0);else if(z==='R')sTurn(1,0);return z;}
function sSwipeMove(x,y){if(!sSwipe)return;const dx=x-sSwipe.x,dy=y-sSwipe.y;if(Math.hypot(dx,dy)<18)return;sSwipe.moved=true;
 if(Math.abs(dx)>Math.abs(dy))sTurn(dx>0?1:-1,0);else sTurn(0,dy>0?1:-1);sSwipe.x=x;sSwipe.y=y;}
function sSwipeEnd(x,y){sSwipe=null;}
function sUpdate(){if(state!=='play'||mode!=='snake'||endTimer)return;sacc+=16.7;const iv=snIv();if(sacc<iv)return;sacc=0;sdir=snext;
 let hx=snake[0].x+sdir.x,hy=snake[0].y+sdir.y;
 if(snakeWrap){hx=(hx+SN)%SN;hy=(hy+SN)%SN;}
 const head={x:hx,y:hy};const eating=head.x===sfood.x&&head.y===sfood.y;const body=eating?snake:snake.slice(0,-1);
 if(head.x<0||head.y<0||head.x>=SN||head.y>=SN||body.some(p=>p.x===head.x&&p.y===head.y)||snObs.some(p=>p.x===head.x&&p.y===head.y)){lose();return;}
 snake.unshift(head);if(eating){score+=40+snake.length*2;SFX.pop(2);sfood=sSpawnFood();}else snake.pop();}
function sBtn(x,y,label,id){ctx.fillStyle='#2a1346';rr(x,y,70,54,16);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(label,x+35,y+35,'700 22px Quicksand,sans-serif','#fff');hits.push({x,y,w:70,h:54,id});}
function drawSnake(){drawSky();drawFog(.12);txt('EL HILO',240,36,'900 22px "Cinzel Decorative",Georgia,serif','#ffd166');txt('⭐ '+score,78,68,'700 16px Quicksand,sans-serif','#ffd166');txt('Largo '+snake.length,240,68,'700 16px Quicksand,sans-serif','#fff');txt(DIFF[diff].n,400,68,'700 16px Quicksand,sans-serif','#8fe9c9');
 ctx.fillStyle='rgba(18,10,32,.94)';rr(SOX-8,SOY-8,SN*SC+16,SN*SC+16,12);ctx.fill();
 ctx.save();if(snakeWrap){ctx.setLineDash([10,8]);ctx.strokeStyle='#4dd0e1';ctx.shadowColor='#4dd0e1';ctx.shadowBlur=10;ctx.lineWidth=2.5;}else{ctx.strokeStyle='#ff5d8f';ctx.lineWidth=4;}ctx.stroke();ctx.restore();
 for(let i=0;i<SN;i++)for(let j=0;j<SN;j++){ctx.fillStyle=((i+j)%2)?'rgba(255,255,255,.03)':'rgba(0,0,0,.12)';ctx.fillRect(SOX+j*SC,SOY+i*SC,SC,SC);}
 snObs.forEach(o=>{const x=SOX+o.x*SC,y=SOY+o.y*SC;ctx.fillStyle='#6b5a85';rr(x+2,y+2,SC-4,SC-4,5);ctx.fill();ctx.strokeStyle='#e6dcff';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#e6dcff';ctx.fillRect(x+7,y+9,SC-14,2);ctx.fillRect(x+7,y+13,SC-14,2);});
 const foodCol=tick%40<20?4:0;drawBtnS(SOX+sfood.x*SC+SC/2,SOY+sfood.y*SC+SC/2,foodCol,false,SC/2-1);
 snake.forEach((p,i)=>{const x=SOX+p.x*SC+SC/2,y=SOY+p.y*SC+SC/2;ctx.fillStyle=i===0?'#06d6a0':'#0b6b52';ctx.beginPath();ctx.arc(x,y,SC*.42,0,TAU);ctx.fill();if(i===0){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+4,y-2,2,0,TAU);ctx.fill();}});
 txt(snakeWrap?'SIN PAREDES · cruza los bordes':'CON PAREDES · cuidado con el borde',240,SOY+SN*SC+30,'700 12px Quicksand,sans-serif',snakeWrap?'#4dd0e1':'#ff8eae');
 if(snakeCtl!=='swipe'){ctx.save();const hv=sTouchZone,zs=[['U','ARRIBA',XC,PADT+34,'#4cc9ff'],['L','IZQ.',PADL+34,XY+5,'#ff9f43'],['R','DER.',PADR-34,XY+5,'#06d6a0'],['D','ABAJO',XC,PADB-22,'#ff5d8f']];
  zs.forEach(([k,l,x,y,c])=>{ctx.fillStyle=c;ctx.globalAlpha=hv===k?.55:.2;ctx.beginPath();ctx.moveTo(XC,XY);if(k==='U'){ctx.lineTo(PADL,PADT);ctx.lineTo(PADR,PADT);}else if(k==='D'){ctx.lineTo(PADL,PADB);ctx.lineTo(PADR,PADB);}else if(k==='L'){ctx.lineTo(PADL,PADT);ctx.lineTo(PADL,PADB);}else{ctx.lineTo(PADR,PADT);ctx.lineTo(PADR,PADB);}ctx.closePath();ctx.fill();});
  ctx.globalAlpha=1;ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2.5;rr(PADL,PADT,PADR-PADL,PADB-PADT,14);ctx.stroke();ctx.beginPath();ctx.moveTo(PADL,PADT);ctx.lineTo(PADR,PADB);ctx.moveTo(PADR,PADT);ctx.lineTo(PADL,PADB);ctx.stroke();
  zs.forEach(([k,l,x,y,c])=>txt(l,x,y,'900 15px Quicksand,sans-serif',c));ctx.restore();}
 else txt('Desliza el dedo en la dirección que quieras',240,590,'600 14px Quicksand,sans-serif','#cdb6ea');
 ctx.fillStyle='#2a1346';rr(150,724,180,28,14);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=1.5;ctx.stroke();txt('Control: '+(snakeCtl==='swipe'?'Deslizar ⇄':'Botones ⇄'),240,743,'700 12px Quicksand,sans-serif','#fff');hits.push({x:150,y:724,w:180,h:28,id:'sctl'});
 [[404,'⏸','pause'],[448,muted?'🔇':'🔊','mute']].forEach(([x,t,id])=>{ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(x,28,17,0,TAU);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.stroke();txt(t,x,34,'16px sans-serif','#fff');hits.push({x:x-17,y:11,w:34,h:34,id});});drawBanner();}
