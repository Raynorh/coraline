/* ================= MODO SNAKE ("El hilo") =================
   Con paredes: chocar con el borde pierde. Sin paredes: el hilo reaparece por el lado opuesto.
   Móvil: se juega tocando/deslizando sobre la pantalla (sin botones). PC: flechas o WASD. */
const SN=16,SC=22,SOX=64,SOY=108;
let snake=[],sdir={x:1,y:0},snext={x:1,y:0},sfood={x:8,y:8},sacc=0,sSwipe=null;
function sSpawnFood(){const occ=new Set(snake.map(p=>p.x+','+p.y));const free=[];for(let y=0;y<SN;y++)for(let x=0;x<SN;x++)if(!occ.has(x+','+y))free.push({x,y});return free.length?free[ri(free.length)]:{x:0,y:0};}
function sNew(){score=0;rescued=0;stone=0;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];const mid=8;snake=[{x:mid,y:mid},{x:mid-1,y:mid},{x:mid-2,y:mid}];sdir={x:1,y:0};snext={x:1,y:0};sfood=sSpawnFood();sacc=0;sSwipe=null;clearTimeout(endTimer);endTimer=null;
 say('Coraline',(snakeWrap?'Sin paredes: si cruzas un borde apareces al otro lado. ':'Con paredes: no choques con el borde. ')+(IS_TOUCH?'Desliza o toca la pantalla.':'Usa flechas o WASD.'),4200);}
function sTurn(dx,dy){if(!dx&&!dy)return;if(sdir.x+dx===0&&sdir.y+dy===0)return;snext={x:dx,y:dy};}
function sPress(id){if(state!=='play'||mode!=='snake')return;if(id==='sU')sTurn(0,-1);else if(id==='sD')sTurn(0,1);else if(id==='sL')sTurn(-1,0);else if(id==='sR')sTurn(1,0);}
// Toque simple: gira hacia el lado tocado respecto de la cabeza (eje contrario al movimiento actual).
function sTapTurn(x,y){if(!snake.length)return;const hx=SOX+snake[0].x*SC+SC/2,hy=SOY+snake[0].y*SC+SC/2,dx=x-hx,dy=y-hy;
 if(sdir.x!==0){if(Math.abs(dy)>4)sTurn(0,dy>0?1:-1);}else{if(Math.abs(dx)>4)sTurn(dx>0?1:-1,0);}}
// Deslizar: gira en cuanto el dedo recorre ~18 px, sin esperar a soltar (respuesta inmediata).
function sSwipeMove(x,y){if(!sSwipe)return;const dx=x-sSwipe.x,dy=y-sSwipe.y;if(Math.hypot(dx,dy)<18)return;sSwipe.moved=true;
 if(Math.abs(dx)>Math.abs(dy))sTurn(dx>0?1:-1,0);else sTurn(0,dy>0?1:-1);sSwipe.x=x;sSwipe.y=y;}
function sSwipeEnd(x,y){if(!sSwipe)return;if(!sSwipe.moved&&state==='play'&&mode==='snake')sTapTurn(x,y);sSwipe=null;}
function sUpdate(){if(state!=='play'||mode!=='snake'||endTimer)return;sacc+=16.7;const iv=DIFF[diff].sv;if(sacc<iv)return;sacc=0;sdir=snext;
 let hx=snake[0].x+sdir.x,hy=snake[0].y+sdir.y;
 if(snakeWrap){hx=(hx+SN)%SN;hy=(hy+SN)%SN;}
 const head={x:hx,y:hy};const eating=head.x===sfood.x&&head.y===sfood.y;const body=eating?snake:snake.slice(0,-1);
 if(head.x<0||head.y<0||head.x>=SN||head.y>=SN||body.some(p=>p.x===head.x&&p.y===head.y)){lose();return;}
 snake.unshift(head);if(eating){score+=40+snake.length*2;SFX.pop(2);sfood=sSpawnFood();}else snake.pop();}
function sBtn(x,y,label,id){ctx.fillStyle='#2a1346';rr(x,y,70,54,16);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(label,x+35,y+35,'700 22px Quicksand,sans-serif','#fff');hits.push({x,y,w:70,h:54,id});}
function drawSnake(){drawSky();drawFog(.12);txt('EL HILO',240,36,'900 22px "Cinzel Decorative",Georgia,serif','#ffd166');txt('⭐ '+score,78,68,'700 16px Quicksand,sans-serif','#ffd166');txt('Largo '+snake.length,240,68,'700 16px Quicksand,sans-serif','#fff');txt(DIFF[diff].n,400,68,'700 16px Quicksand,sans-serif','#8fe9c9');
 ctx.fillStyle='rgba(18,10,32,.94)';rr(SOX-8,SOY-8,SN*SC+16,SN*SC+16,12);ctx.fill();
 ctx.save();if(snakeWrap){ctx.setLineDash([10,8]);ctx.strokeStyle='#4dd0e1';ctx.shadowColor='#4dd0e1';ctx.shadowBlur=10;ctx.lineWidth=2.5;}else{ctx.strokeStyle='#ff5d8f';ctx.lineWidth=4;}ctx.stroke();ctx.restore();
 for(let i=0;i<SN;i++)for(let j=0;j<SN;j++){ctx.fillStyle=((i+j)%2)?'rgba(255,255,255,.03)':'rgba(0,0,0,.12)';ctx.fillRect(SOX+j*SC,SOY+i*SC,SC,SC);}
 const foodCol=tick%40<20?4:0;drawBtnS(SOX+sfood.x*SC+SC/2,SOY+sfood.y*SC+SC/2,foodCol,false,SC/2-1);
 snake.forEach((p,i)=>{const x=SOX+p.x*SC+SC/2,y=SOY+p.y*SC+SC/2;ctx.fillStyle=i===0?'#06d6a0':'#0b6b52';ctx.beginPath();ctx.arc(x,y,SC*.42,0,TAU);ctx.fill();if(i===0){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+4,y-2,2,0,TAU);ctx.fill();}});
 txt(snakeWrap?'SIN PAREDES · cruza los bordes':'CON PAREDES · cuidado con el borde',240,SOY+SN*SC+30,'700 12px Quicksand,sans-serif',snakeWrap?'#4dd0e1':'#ff8eae');
 if(IS_TOUCH||lastPtr==='touch'){txt('Desliza o toca la pantalla para girar',240,590,'600 14px Quicksand,sans-serif','#cdb6ea');}
 else{sBtn(205,560,'▲','sU');sBtn(125,620,'◀','sL');sBtn(205,620,'▼','sD');sBtn(285,620,'▶','sR');}
 [[404,'⏸','pause'],[448,muted?'🔇':'🔊','mute']].forEach(([x,t,id])=>{ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(x,28,17,0,TAU);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.stroke();txt(t,x,34,'16px sans-serif','#fff');hits.push({x:x-17,y:11,w:34,h:34,id});});drawBanner();}
