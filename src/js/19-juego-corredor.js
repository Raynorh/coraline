/* ================= CORREDOR DEL OTRO MUNDO (carrera sin fin 2D, como el dinosaurio de Chrome) =================
   Coraline corre sola. SALTA carretes, agujas y armarios (mantén para saltar más alto) y AGÁCHATE bajo los
   murciélagos y las tijeras bajas. Junta botones; cada 500 m cambia la zona y la velocidad sube. */
const RGY=560,RPX=96;
let rY=0,rVy=0,rDuck=false,rObs=[],rIt=[],rHearts=3,rHMax=3,rButtons=0,rDist=0,rInv=0,rSpeed=7,rSlow=1,rNextX=600,rStage=1,rShake=0,rAnim=0,rKeys={j:0,d:0},rTouch={j:0,d:0},rHold=new Map(),rCloud=[],rJumpHeld=false,rGround=0,rFlash=0;
const rHP=()=>[4,3,2,1][dIdx()];
function rNew(){score=0;rescued=0;stone=0;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];rY=0;rVy=0;rDuck=false;rObs=[];rIt=[];rHMax=rHP();rHearts=rHMax;rButtons=0;rDist=0;rInv=0;rSlow=1;rNextX=700;rStage=1;rShake=0;rAnim=0;rGround=0;rKeys={j:0,d:0};rTouch={j:0,d:0};rHold.clear();rSpeed=[6.2,7.2,8.2,9.5][dIdx()];rCloud=Array.from({length:5},(_,i)=>({x:i*110+rnd(0,60),y:rnd(90,230),s:rnd(.7,1.3)}));fixedSteps.last=performance.now();
 say('Coraline','¡A correr! Toca la pantalla para SALTAR (mantén = más alto) y mantén ⤓ para AGACHARTE.',5200);}
function rSpawn(x){const d=dIdx(),r=Math.random(),n=1+Math.floor(rDist/500);
 const pick=r<.26?'spool':r<.44?'needles':r<.56?'tall':r<.58+n*.06?'stack':(r<.8?'bat':'bat2');
 if(pick==='spool')rObs.push({t:'spool',x,w:34,h:34,y:0});
 else if(pick==='needles'){const k=1+Math.floor(Math.random()*(2+Math.min(2,n)));rObs.push({t:'needles',x,w:26*k,h:28,y:0});}
 else if(pick==='tall')rObs.push({t:'tall',x,w:40,h:74,y:0});
 else if(pick==='stack')rObs.push({t:'spool',x,w:34,h:34,y:0},{t:'spool',x:x+44,w:34,h:34,y:0},{t:'needles',x:x+110,w:52,h:28,y:0});
 else if(pick==='bat')rObs.push({t:'bat',x,w:34,h:24,y:36,ph:Math.random()*6});
 else rObs.push({t:'bat',x,w:34,h:24,y:6,ph:Math.random()*6});
 if(Math.random()<.55){const ar=Math.random()<.5;for(let i=0;i<4;i++)rIt.push({t:'b',x:x+160+i*34,y:ar?Math.sin(i/3*Math.PI)*70+16:16});}
 if(Math.random()<.06&&rHearts<rHMax)rIt.push({t:'h',x:x+90,y:50});}
function rUpdate(){if(state!=='play'||mode!=='runner')return;fixedSteps(rStep);}
function rStep(){const d=dIdx(),v0=[6.2,7.2,8.2,9.5][d],sp=(v0+Math.min(6.5,rDist/260))*rSlow;rSlow=Math.min(1,rSlow+.01);rSpeed=sp;
 rDist+=sp*.05;if(rInv>0)rInv--;if(rShake>0)rShake--;if(rFlash>0)rFlash--;rAnim+=sp*.045;rGround=(rGround+sp)%48;
 const J=rKeys.j||rTouch.j,D=rKeys.d||rTouch.d;
 if(J&&!rJumpHeld&&rY<=0){rVy=14.6;SFX.bounce();}rJumpHeld=!!J;
 rDuck=!!D&&rY<=0;
 if(rY>0||rVy>0){rY+=rVy;rVy-=(D?1.7:.82);if(!J&&rVy>6)rVy=6;if(rY<=0){rY=0;rVy=0;}}
 rObs.forEach(o=>o.x-=sp);rIt.forEach(o=>o.x-=sp);rNextX-=sp;rCloud.forEach(c=>{c.x-=sp*.15;if(c.x<-80)c.x=W+60;});
 if(rNextX<=0){rSpawn(W+60);rNextX=Math.max(300,(sp*44)+Math.random()*sp*30)+(Math.random()<.15?150:0);}
 const ph=rDuck?26:52,pl=RPX-14,pr=RPX+14;
 rObs.forEach(o=>{if(o.hit||o.x>pr+4||o.x+o.w<pl-4)return;const oy0=o.y,oy1=o.y+o.h,py0=rY,py1=rY+ph;
  const m=o.t==='bat'?5:3; // margen de perdón
  if(py0<oy1-m&&py1>oy0+m&&o.x<pr-3&&o.x+o.w>pl+3){o.hit=true;if(rInv<=0){rHearts--;rInv=100;rSlow=.6;rShake=16;rFlash=10;SFX.stick();floats.push({x:RPX,y:RGY-90,txt:'¡Ay!',life:45,c:'#ff8eae'});if(rHearts<=0)rOver();}}});
 rIt=rIt.filter(o=>{if(o.x<-40)return false;if(Math.abs(o.x-RPX)<26&&o.y+16>rY-8&&o.y<rY+ph+10){if(o.t==='b'){rButtons++;SFX.pop(1);}else{rHearts=Math.min(rHMax,rHearts+1);SFX.rescue();floats.push({x:RPX,y:RGY-90,txt:'+❤',life:50,c:'#ff8eae'});}return false;}return true;});
 rObs=rObs.filter(o=>o.x>-200);
 const st=1+Math.floor(rDist/500);if(st>rStage){rStage=st;rSlow=Math.min(rSlow,.85);say('Coraline','¡Zona '+rStage+'! Cada vez más rápido…',2600);SFX.ready();}
 score=Math.floor(rDist)+rButtons*15;}
function rOver(){state='lose';loseT=0;recordScore();setPowerBtns(false);SFX.lose();say('Otra Madre','Perdiste… ahora eres mía.',6000);}
function rDrawObs(o){ctx.save();ctx.translate(o.x,RGY-o.y);if(o.hit)ctx.globalAlpha=.25;
 if(o.t==='spool'){ctx.fillStyle='#b8873a';rr(0,-34,34,34,7);ctx.fill();ctx.fillStyle='#ff5d8f';for(let i=0;i<4;i++)ctx.fillRect(0,-30+i*8,34,4);ctx.strokeStyle='#5a3a12';ctx.lineWidth=3;rr(0,-34,34,34,7);ctx.stroke();}
 else if(o.t==='needles'){const k=Math.round(o.w/26);for(let i=0;i<k;i++){ctx.fillStyle='#d7dbe8';ctx.beginPath();ctx.moveTo(i*26,0);ctx.lineTo(i*26+13,-28);ctx.lineTo(i*26+26,0);ctx.fill();ctx.fillStyle='#ff5d8f';ctx.fillRect(i*26+2,-5,22,5);}}
 else if(o.t==='tall'){ctx.fillStyle='#3a1630';rr(0,-74,40,74,6);ctx.fill();ctx.strokeStyle='#ff5d8f';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#4a1d78';rr(4,-70,14,66,3);ctx.fill();rr(22,-70,14,66,3);ctx.fill();ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(16,-36,2.6,0,TAU);ctx.arc(24,-36,2.6,0,TAU);ctx.fill();ctx.strokeStyle='#cfc6a0';ctx.lineWidth=2;[[11,-58],[29,-58]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(a-3,b-3);ctx.lineTo(a+3,b+3);ctx.moveTo(a+3,b-3);ctx.lineTo(a-3,b+3);ctx.stroke();});}
 else{const f=Math.sin(tick*.5+o.ph)*6;ctx.translate(17,-12);ctx.fillStyle='#1b1020';ctx.beginPath();ctx.ellipse(0,0,11,8,0,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(-6,-2);ctx.lineTo(-22,-10-f);ctx.lineTo(-10,5);ctx.moveTo(6,-2);ctx.lineTo(22,-10-f);ctx.lineTo(10,5);ctx.fill();ctx.fillStyle='#ff5d8f';ctx.beginPath();ctx.arc(-3,-1,2,0,TAU);ctx.arc(3,-1,2,0,TAU);ctx.fill();}
 ctx.restore();}
function drawRunner(){const sh=rShake>0?(Math.random()-.5)*7:0;ctx.save();ctx.translate(sh,0);
 const pal=[['#07050e','#3a1248','#1d0b2e'],['#0b1a2b','#2a6070','#0e2433'],['#240b1f','#a33a5a','#2c0f26'],['#0b0b24','#4a4ac0','#14143a']][(rStage-1)%4];
 const g=ctx.createLinearGradient(0,0,0,RGY);g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);ctx.fillStyle=g;ctx.fillRect(-10,0,W+20,RGY);
 stars.forEach(s=>{ctx.globalAlpha=.5;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y*.55,s.r,0,TAU);ctx.fill();});ctx.globalAlpha=1;
 ctx.fillStyle='#f0e8ff';ctx.beginPath();ctx.arc(380,130,34,0,TAU);ctx.fill();ctx.fillStyle=pal[0];ctx.beginPath();ctx.arc(394,120,31,0,TAU);ctx.fill();
 rCloud.forEach(c=>{ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.ellipse(c.x,c.y,40*c.s,12*c.s,0,0,TAU);ctx.ellipse(c.x+22*c.s,c.y-6*c.s,26*c.s,10*c.s,0,0,TAU);ctx.fill();});
 // siluetas (palacio y árboles) con paralaje
 ctx.fillStyle=pal[2];const o1=-(rDist*9)%520;for(let i=-1;i<3;i++){const x=o1+i*520;ctx.fillRect(x+60,RGY-90,150,90);[75,125,175].forEach(a=>{ctx.beginPath();ctx.moveTo(x+a-14,RGY-90);ctx.lineTo(x+a,RGY-150);ctx.lineTo(x+a+14,RGY-90);ctx.fill();});ctx.fillStyle='#ffd166';for(let k=0;k<4;k++)ctx.fillRect(x+80+k*32,RGY-60,6,10);ctx.fillStyle=pal[2];}
 const o2=-(rDist*17)%240;for(let i=-1;i<4;i++){const x=o2+i*240+150;ctx.fillStyle=pal[2];ctx.fillRect(x-4,RGY-70,8,70);ctx.beginPath();ctx.arc(x,RGY-84,28,0,TAU);ctx.fill();}
 // suelo
 ctx.fillStyle='#2a1a3d';ctx.fillRect(-10,RGY,W+20,H-RGY);ctx.fillStyle='#18a37a';ctx.fillRect(-10,RGY,W+20,6);ctx.fillStyle='#3d2757';for(let x=-rGround;x<W+48;x+=48)ctx.fillRect(x,RGY+20,26,4);for(let x=-rGround*1.2;x<W+60;x+=60)ctx.fillRect(x+10,RGY+46,18,3);
 ctx.fillStyle='#ff5d8f';for(let x=-rGround*.8;x<W+96;x+=96){ctx.beginPath();ctx.arc(x+30,RGY+3,3,0,TAU);ctx.fill();}
 rIt.forEach(o=>{if(o.x<-30||o.x>W+30)return;const y=RGY-o.y-14+Math.sin(tick*.1+o.x*.05)*2;if(o.t==='b')drawBtnS(o.x,y,Math.floor(o.x/34+7)%5,false,10);else txt('❤',o.x,y+8,'26px sans-serif','#ff5d8f');});
 rObs.forEach(rDrawObs);
 // Coraline
 const py=RGY-rY;ctx.save();if(rDuck){ctx.translate(RPX,py);ctx.scale(1.5,1.0);ctx.translate(-RPX,-py);drawCora(RPX,py-26,1,rAnim,true,rInv>0,0,false);}else drawCora(RPX,py-44,1,rAnim,rY<=0,rInv>0,0,false);ctx.restore();
 ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(RPX,RGY+4,22-rY*.08,5,0,0,TAU);ctx.fill();
 ctx.restore();
 if(rFlash>0){ctx.fillStyle='rgba(255,93,143,'+rFlash*.02+')';ctx.fillRect(0,0,W,H);}
 // HUD
 ctx.fillStyle='rgba(10,5,20,.9)';ctx.fillRect(0,0,W,TOP+12);ctx.fillStyle='#9b5de566';ctx.fillRect(0,TOP+10,W,2);
 txt('❤'.repeat(Math.max(0,rHearts))+'🖤'.repeat(Math.max(0,rHMax-rHearts)),14,34,'700 18px sans-serif','#ff5d8f','left');
 txt('📏 '+Math.floor(rDist)+' m',14,62,'800 15px Quicksand,sans-serif','#fff','left');txt('⭐ '+score,130,62,'800 15px Quicksand,sans-serif','#ffd166','left');txt('🔘 '+rButtons,250,62,'800 15px Quicksand,sans-serif','#fff','left');txt('ZONA '+rStage,330,62,'800 13px Quicksand,sans-serif','#8fe9c9','left');
 [[404,'⏸','pause'],[448,muted?'🔇':'🔊','mute']].forEach(([x,t,id])=>{ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(x,30,17,0,TAU);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(t,x,36,'16px sans-serif','#fff');hits.push({x:x-17,y:13,w:34,h:34,id});});
 ctx.fillStyle='rgba(10,5,20,.9)';ctx.fillRect(0,640,W,H-640);
 [['j','⤒ SALTAR',10,300,rTouch.j,'#06d6a0'],['d','⤓ AGACHARSE',320,150,rTouch.d,'#ff9f43']].forEach(([k,l,x,w,on,col])=>{ctx.fillStyle=on?'#4a1d78':'#2a1346';rr(x,656,w,88,22);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=3.5;ctx.stroke();txt(l,x+w/2,708,'900 '+(w>200?24:16)+'px Quicksand,sans-serif','#fff');});
 txt('Toca la pantalla = saltar · mantén = más alto',240,634,'600 11px Quicksand,sans-serif','#cdb6ea');
 floats.forEach(f=>{ctx.globalAlpha=Math.min(1,f.life/20);txt(f.txt,f.x,f.y,'800 20px Quicksand,sans-serif',f.c);});ctx.globalAlpha=1;drawBanner(TOP+22);}
// ---- entrada (varios dedos): pantalla/botón izquierdo = salto, botón derecho = agacharse ----
function rZone(x,y){if(y<TOP+14)return null;if(y>=650&&x>=316)return'd';return'j';}
cv.addEventListener('pointerdown',e=>{if(state!=='play'||mode!=='runner')return;const [x,y]=kPtr(e),z=rZone(x,y);if(!z)return;rHold.set(e.pointerId,z);rTouch[z]=1;try{cv.setPointerCapture(e.pointerId);}catch(_){}});
const rRel=e=>{const z=rHold.get(e.pointerId);if(z){rHold.delete(e.pointerId);if(![...rHold.values()].includes(z))rTouch[z]=0;}};
cv.addEventListener('pointerup',rRel);cv.addEventListener('pointercancel',rRel);
addEventListener('keydown',e=>{if(state!=='play'||mode!=='runner')return;const k=e.code;if(k==='ArrowUp'||k==='KeyW'||k==='Space')rKeys.j=1;else if(k==='ArrowDown'||k==='KeyS')rKeys.d=1;else return;e.preventDefault();});
addEventListener('keyup',e=>{const k=e.code;if(k==='ArrowUp'||k==='KeyW'||k==='Space')rKeys.j=0;else if(k==='ArrowDown'||k==='KeyS')rKeys.d=0;});
addEventListener('blur',()=>{rKeys={j:0,d:0};rTouch={j:0,d:0};rHold.clear();});
