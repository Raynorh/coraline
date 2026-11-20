/* ================= AVENTURA DE CORALINE (plataformas 2D, estilo Donkey Kong Country) =================
   Niveles infinitos generados con semilla (siempre iguales para el mismo número). Salta sobre los muñecos de botones,
   esquiva agujas y carretes de hilo, junta botones y las letras C-O-R-A y cruza la puerta pequeña. */
const KT=40,KR=14,KOY=100,KGRAV=.55,KJUMP=11.8;
let kCols=[],kPlat=[],kEn=[],kItems=[],kSp=[],kDoor=0,kCheck=null,kLen=0,kP={},kCam=0,kLevelNo=1,kHearts=3,kHeartMax=3,kButtons=0,kLetters=[0,0,0,0],kTime=0,kInv=0,kKeys={},kTouch={l:0,r:0,j:0},kJumpHeld=false,kJBuf=0,kCoy=0,kRespawn={x:60,y:200},kDone=false,kAcc=0,kPar=0,kBonus=0,kLog=null;
const LETTERS='CORA';
function fixedSteps(fn){const now=performance.now();kAcc+=Math.min(100,now-(fixedSteps.last||now));fixedSteps.last=now;while(kAcc>=16.667){kAcc-=16.667;fn();}}
function kHeartsFor(){return[5,4,3,2][dIdx()];}
function kNew(){score=0;rescued=0;stone=0;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];kLevelNo=1;kButtons=0;kHeartMax=kHeartsFor();kHearts=kHeartMax;kBuild(kLevelNo);fixedSteps.last=performance.now();
 say('Coraline','¡Aventura! Salta con el botón ⤒. Pisa a los muñecos de botones y llega a la puerta pequeña.',5000);}
function kBuild(n){const rnd=seeded(n*104729+dIdx()*17+3),len=Math.min(230,66+n*9);kLen=len;kCols=Array(len).fill(null);kPlat=[];kEn=[];kItems=[];kSp=[];kLetters=[0,0,0,0];kDone=false;kTime=0;kInv=0;kLog=null;
 let h=11,c=0,lastGap=-9;const en=[.6,.8,1,1.25][dIdx()];
 for(;c<8;c++)kCols[c]=h;
 const flat=(w)=>{for(let i=0;i<w&&c<len-8;i++){kCols[c]=h;c++;}};
 while(c<len-8){const r=rnd();
  if(r<.17&&c-lastGap>4){const w=2+(rnd()<.35+n*.02?1:0);for(let i=0;i<w;i++)kCols[c+i]=null;
   for(let i=0;i<w+1;i++)kItems.push({t:'b',x:(c+i-.2)*KT+10,y:(h-2.2-Math.sin(i/w*Math.PI)*1.4)*KT});
   c+=w;lastGap=c;flat(2);}
  else if(r<.34){const up=rnd()<.5,k=1+(rnd()<.25&&n>2?1:0);if(c-lastGap<3)h=Math.max(7,h-1);else h=Math.max(7,Math.min(12,h+(up?-k:k)));flat(3+Math.floor(rnd()*3));}
  else if(r<.5&&c>10){const s=c+2;flat(5);kSp.push({x:s*KT+6,y:(h-.55)*KT,w:28,h:22});kItems.push({t:'b',x:s*KT+12,y:(h-2.6)*KT},{t:'b',x:(s+1)*KT+12,y:(h-2.9)*KT});}
  else if(r<.66){const s=c+1;flat(6);kPlat.push({x:s*KT,y:(h-3.2)*KT,w:3*KT});for(let i=0;i<3;i++)kItems.push({t:'b',x:(s+i)*KT+12,y:(h-4.1)*KT});}
  else{const s=c;flat(4+Math.floor(rnd()*4));const mid=(s+c)/2;const roll=rnd();
   if(roll<.55*en)kEn.push({t:'w',x:mid*KT,y:(h-1.1)*KT,w:28,h:34,vx:-.9*(1+dIdx()*.18),dir:-1,dead:0,vy:0,x0:s*KT,x1:c*KT});
   else if(roll<.8*en&&n>=2)kEn.push({t:'r',x:(c-1)*KT,y:(h-.9)*KT,w:30,h:30,vx:0,vy:0,act:0,dead:0});
   else if(roll<1.05*en&&n>=3)kEn.push({t:'a',x:mid*KT,y:(h-4)*KT,w:30,h:24,bx:mid*KT,by:(h-4)*KT,ph:rnd()*6,dead:0});
   if(rnd()<.5)kItems.push({t:'b',x:mid*KT,y:(h-2)*KT});}
 }
 for(;c<len;c++)kCols[c]=h;
 const near=cc=>{cc=Math.max(1,Math.min(len-9,Math.round(cc)));while(kCols[cc]==null)cc++;return cc;};
 for(let i=0;i<4;i++){const cc=near(len*(i+1)/5),top=kCols[cc];kPlat.push({x:(cc-1)*KT,y:(top-3.4)*KT,w:3*KT});kItems.push({t:'L',i,x:cc*KT+8,y:(top-4.6)*KT});}
 const mc=near(len/2);kCheck={x:mc*KT,y:(kCols[mc]-1.7)*KT,got:false,ry:(kCols[mc]-1.5)*KT};
 kDoor=(len-4)*KT;kRespawn={x:2*KT,y:(kCols[2]-1)*KT-34};kPar=len*5.2;
 kP={x:kRespawn.x,y:kRespawn.y,w:24,h:34,vx:0,vy:0,on:false,face:1,anim:0};kCam=0;}
const kSolid=(px,py)=>{const c=Math.floor(px/KT);if(c<0||c>=kLen)return true;const t=kCols[c];return t!=null&&py>=t*KT;};
function kHurt(pit){if(kInv>0&&!pit)return;kHearts--;kInv=110;SFX.stick();floats.push({x:kP.x-kCam+12,y:kP.y+KOY-10,txt:'¡Ay!',life:45,c:'#ff8eae'});
 if(kHearts<=0){kOver();return;}
 if(pit){kP.x=kRespawn.x;kP.y=kRespawn.y;kP.vx=kP.vy=0;kInv=80;}else{kP.vy=-7;kP.vx=-kP.face*5;}}
function kOver(){state='lose';loseT=0;scoreRecorded=false;recordScore({level:kLevelNo});setPowerBtns(false);SFX.lose();say('Otra Madre','Perdiste… ahora eres mía.',6000);}
function kClear(){if(kDone)return;kDone=true;kBonus=Math.max(0,Math.round((kPar-kTime/60*5)*2));score+=1000+kBonus+(kLetters.every(Boolean)?2000:0);if(kLetters.every(Boolean)&&kHearts<kHeartMax+1)kHearts++;
 scoreRecorded=false;recordScore({level:kLevelNo});state='win';playVoice('victoria');SFX.rescue();say('Coraline','¡La puerta pequeña! Nivel '+kLevelNo+' superado.',5000);
 for(let i=0;i<80;i++)parts.push({x:rnd(0,W),y:rnd(-100,0),vx:rnd(-1,1),vy:rnd(1,4),life:200,c:COLORS[ri(5)].f,s:rnd(3,6)});}
function kNext(){kLevelNo++;state='play';scoreRecorded=false;kBuild(kLevelNo);fixedSteps.last=performance.now();setMusic('partida');setPowerBtns(false);}
function kUpdate(){if(state!=='play'||mode!=='kong')return;fixedSteps(kStep);}
function kStep(){const p=kP,L=kKeys.l||kTouch.l,Rr=kKeys.r||kTouch.r,J=kKeys.j||kTouch.j;kTime++;if(kInv>0)kInv--;
 const sp=4.1+dIdx()*.15;
 if(L&&!Rr){p.vx=Math.max(p.vx-.75,-sp);p.face=-1;}else if(Rr&&!L){p.vx=Math.min(p.vx+.75,sp);p.face=1;}else p.vx*=p.on?.72:.93;
 if(J&&!kJumpHeld)kJBuf=8;kJumpHeld=!!J;if(kJBuf>0)kJBuf--;if(kCoy>0)kCoy--;if(p.on)kCoy=6;
 if(kJBuf>0&&kCoy>0){p.vy=-KJUMP;p.on=false;kCoy=0;kJBuf=0;SFX.bounce();}
 if(!J&&p.vy<-4.5)p.vy=-4.5;
 p.vy=Math.min(13,p.vy+KGRAV);
 // X
 p.x+=p.vx;const ys=[p.y+3,p.y+p.h/2,p.y+p.h-3];
 if(p.vx>0&&ys.some(y=>kSolid(p.x+p.w,y))){p.x=Math.floor((p.x+p.w)/KT)*KT-p.w-.01;p.vx=0;}
 if(p.vx<0&&ys.some(y=>kSolid(p.x,y))){p.x=(Math.floor(p.x/KT)+1)*KT+.01;p.vx=0;}
 if(p.x<0)p.x=0;
 // Y
 const pb=p.y+p.h;p.y+=p.vy;p.on=false;
 if(p.vy>=0){const b=p.y+p.h;let land=null;
  [p.x+3,p.x+p.w-3].forEach(x=>{const c=Math.floor(x/KT);if(c>=0&&c<kLen&&kCols[c]!=null){const top=kCols[c]*KT;if(b>=top&&pb<=top+Math.max(6,p.vy+2))land=Math.min(land==null?1e9:land,top);}});
  kPlat.forEach(q=>{if(p.x+p.w>q.x&&p.x<q.x+q.w&&pb<=q.y+4&&b>=q.y)land=Math.min(land==null?1e9:land,q.y);});
  if(land!=null){p.y=land-p.h;p.vy=0;p.on=true;}}
 if(p.y>KR*KT+70){kHurt(true);return;}
 p.anim+=Math.abs(p.vx)*.08;
 // objetos
 kItems=kItems.filter(it=>{const ok=Math.abs(p.x+12-(it.x+8))<20&&Math.abs(p.y+17-(it.y+8))<26;if(!ok)return true;
  if(it.t==='b'){kButtons++;score+=50;SFX.pop(1);}else{kLetters[it.i]=1;score+=500;SFX.rescue();floats.push({x:it.x-kCam,y:it.y+KOY-10,txt:'¡'+LETTERS[it.i]+'!',life:60,c:'#ffd166'});}return false;});
 if(kCheck&&!kCheck.got&&p.x>kCheck.x-20){kCheck.got=true;kRespawn={x:kCheck.x,y:p.y};SFX.ready();floats.push({x:kCheck.x-kCam,y:kCheck.y+KOY-20,txt:'¡Lámpara! Punto guardado',life:70,c:'#8fe9c9'});}
 kSp.forEach(s=>{if(p.x+p.w>s.x&&p.x<s.x+s.w&&p.y+p.h>s.y&&p.y<s.y+s.h)kHurt();});
 kEn.forEach(e=>{if(e.dead)return;const sp2=1+dIdx()*.15;
  if(e.t==='w'){e.x+=e.vx*sp2;if(e.x<e.x0+6||e.x+e.w>e.x1-6){e.vx=-e.vx;e.x=Math.max(e.x0+6,Math.min(e.x1-6-e.w,e.x));}}
  else if(e.t==='r'){if(!e.act&&p.x>e.x-440)e.act=1;if(e.act){e.vx=-2.6*sp2;e.x+=e.vx;e.vy=Math.min(12,e.vy+KGRAV);e.y+=e.vy;const c=Math.floor((e.x+15)/KT),t=kCols[c];if(t!=null&&e.y+e.h>=t*KT&&e.y+e.h<t*KT+18){e.y=t*KT-e.h;e.vy=0;}if(e.y>KR*KT+80||e.x<-40)e.dead=2;}}
  else{e.x=e.bx+Math.sin(kTime*.03+e.ph)*70;e.y=e.by+Math.sin(kTime*.06+e.ph)*34;}
  if(p.x+p.w>e.x+3&&p.x<e.x+e.w-3&&p.y+p.h>e.y+3&&p.y<e.y+e.h){
   if(p.vy>1&&p.y+p.h<e.y+e.h*.65){if(e.t==='r'){p.vy=-9;e.vx=0;}else{e.dead=1;p.vy=-9.2;score+=100;SFX.pop(3);floats.push({x:e.x-kCam,y:e.y+KOY,txt:'+100',life:40,c:'#fff'});for(let k=0;k<10;k++)parts.push({x:e.x-kCam+14,y:e.y+KOY+14,vx:rnd(-3,3),vy:rnd(-4,1),life:30,c:'#9b5de5',s:3});}}
   else kHurt();}});
 kEn=kEn.filter(e=>e.dead!==1&&e.dead!==2);
 if(p.x>kDoor-10&&p.y>0)kClear();
 kCam=Math.max(0,Math.min(kLen*KT-W,p.x-190));}
function drawCora(x,y,face,anim,on,inv){ctx.save();ctx.translate(x,y);if(inv&&Math.floor(tick/4)%2)ctx.globalAlpha=.45;ctx.scale(face,1);const sw=on?Math.sin(anim*2)*5:0;
 ctx.fillStyle='#1d3f8a';ctx.fillRect(-7+sw*.6,22,6,10);ctx.fillRect(1-sw*.6,22,6,10);ctx.fillStyle='#ffcf33';rr(-10,6,20,18,5);ctx.fill();ctx.fillStyle='#e0aa00';ctx.fillRect(-1,8,2,14);
 ctx.fillStyle='#ffd9b8';ctx.beginPath();ctx.arc(0,0,10,0,TAU);ctx.fill();ctx.fillStyle='#2f6fe0';ctx.beginPath();ctx.arc(0,-2,11,Math.PI,TAU);ctx.fill();ctx.fillRect(-11,-3,5,12);ctx.fillRect(6,-3,5,12);
 ctx.strokeStyle='#111';ctx.lineWidth=1.6;[[2,0],[7,0]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(a-2,b-2);ctx.lineTo(a+2,b+2);ctx.moveTo(a+2,b-2);ctx.lineTo(a-2,b+2);ctx.stroke();});ctx.restore();}
function drawKBack(){const g=ctx.createLinearGradient(0,KOY,0,KOY+KR*KT);const th=kLevelNo%3;const cs=[['#120a24','#3a1248'],['#0b1a2b','#1d3a4a'],['#1d0b24','#4a1d3a']][th];g.addColorStop(0,cs[0]);g.addColorStop(1,cs[1]);ctx.fillStyle=g;ctx.fillRect(0,KOY,W,KR*KT);
 stars.forEach(s=>{ctx.globalAlpha=.4;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,KOY+s.y*.5,s.r,0,TAU);ctx.fill();});ctx.globalAlpha=1;
 ctx.fillStyle='#e9e1ff';ctx.beginPath();ctx.arc(380,KOY+70,26,0,TAU);ctx.fill();ctx.fillStyle=cs[0];ctx.beginPath();ctx.arc(390,KOY+64,24,0,TAU);ctx.fill();
 [[.25,'#1a0d2c',140],[.5,'#22103a',90]].forEach(([k,col,hh])=>{ctx.fillStyle=col;const off=-(kCam*k)%160;for(let i=-1;i<5;i++){const x=off+i*160;ctx.beginPath();ctx.moveTo(x,KOY+KR*KT-3*KT);ctx.lineTo(x+40,KOY+KR*KT-3*KT-hh);ctx.lineTo(x+80,KOY+KR*KT-3*KT-hh*.4);ctx.lineTo(x+120,KOY+KR*KT-3*KT-hh*.9);ctx.lineTo(x+160,KOY+KR*KT-3*KT);ctx.fill();}});}
function drawKong(){drawSky();ctx.save();ctx.beginPath();ctx.rect(0,KOY,W,KR*KT);ctx.clip();drawKBack();ctx.translate(-kCam,KOY);
 const c0=Math.max(0,Math.floor(kCam/KT)),c1=Math.min(kLen-1,c0+13);
 for(let c=c0;c<=c1;c++){const t=kCols[c];if(t==null)continue;const x=c*KT,y=t*KT;ctx.fillStyle='#2a1a3d';ctx.fillRect(x,y,KT+1,KR*KT-y);ctx.fillStyle='#3d2757';for(let yy=y+KT;yy<KR*KT;yy+=KT)ctx.fillRect(x+2,yy-2,KT-3,3);ctx.fillStyle='#18a37a';ctx.fillRect(x,y,KT+1,8);ctx.fillStyle='#ff5d8f';if((c*7)%5===0){ctx.beginPath();ctx.arc(x+14,y+3,3,0,TAU);ctx.fill();}}
 kPlat.forEach(q=>{if(q.x+q.w<kCam||q.x>kCam+W)return;ctx.fillStyle='#7a4a2a';rr(q.x,q.y,q.w,14,5);ctx.fill();ctx.fillStyle='#c98a4b';ctx.fillRect(q.x+4,q.y+2,q.w-8,3);ctx.fillStyle='#1b1020';for(let i=0;i<q.w/KT;i++){ctx.beginPath();ctx.arc(q.x+20+i*KT,q.y+9,2.2,0,TAU);ctx.fill();}});
 kSp.forEach(s=>{ctx.fillStyle='#d7dbe8';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(s.x+i*10,s.y+s.h);ctx.lineTo(s.x+5+i*10,s.y);ctx.lineTo(s.x+10+i*10,s.y+s.h);ctx.fill();}ctx.fillStyle='#ff5d8f';ctx.fillRect(s.x,s.y+s.h-4,s.w,4);});
 // puerta pequeña y lámpara
 const dy=(kCols[kLen-4]-1.9)*KT;ctx.fillStyle='#3a1630';rr(kDoor,dy,34,76,6);ctx.fill();ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(kDoor+27,dy+40,3,0,TAU);ctx.fill();txt('🚪',kDoor+17,dy+-6,'20px sans-serif','#fff');
 if(kCheck){ctx.fillStyle=kCheck.got?'#ffd166':'#6b5a85';ctx.fillRect(kCheck.x,kCheck.y,4,60);ctx.beginPath();ctx.arc(kCheck.x+2,kCheck.y,9,0,TAU);ctx.fill();if(kCheck.got){ctx.fillStyle='rgba(255,209,102,.25)';ctx.beginPath();ctx.arc(kCheck.x+2,kCheck.y,26,0,TAU);ctx.fill();}}
 kItems.forEach(it=>{if(it.x<kCam-20||it.x>kCam+W+20)return;const bob=Math.sin(tick*.08+it.x)*2;if(it.t==='b')drawBtnS(it.x+8,it.y+8+bob,(Math.floor(it.x/40))%5,false,9);else{ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=14;ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(it.x+8,it.y+8+bob,15,0,TAU);ctx.fill();ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.stroke();ctx.restore();txt(LETTERS[it.i],it.x+8,it.y+15+bob,'900 20px Quicksand,sans-serif','#ffd166');}});
 kEn.forEach(e=>{if(e.x<kCam-60||e.x>kCam+W+60)return;ctx.save();ctx.translate(e.x+e.w/2,e.y+e.h/2);
  if(e.t==='w'){const f=e.vx>0?1:-1;ctx.scale(f,1);ctx.fillStyle='#2b2438';rr(-14,-6,28,24,8);ctx.fill();ctx.fillStyle='#cfc6a0';ctx.beginPath();ctx.arc(0,-10,13,0,TAU);ctx.fill();ctx.strokeStyle='#111';ctx.lineWidth=2;[[-5,-12],[5,-12]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(a-3,b-3);ctx.lineTo(a+3,b+3);ctx.moveTo(a+3,b-3);ctx.lineTo(a-3,b+3);ctx.stroke();});ctx.beginPath();ctx.moveTo(-5,-4);ctx.lineTo(5,-4);ctx.stroke();const s=Math.sin(tick*.2)*4;ctx.fillStyle='#111';ctx.fillRect(-9+s,16,6,4);ctx.fillRect(3-s,16,6,4);}
  else if(e.t==='r'){ctx.rotate(-kTime*.15);ctx.fillStyle='#b8873a';ctx.beginPath();ctx.arc(0,0,15,0,TAU);ctx.fill();ctx.strokeStyle='#ff5d8f';ctx.lineWidth=3;for(let i=-8;i<=8;i+=5){ctx.beginPath();ctx.moveTo(-14,i);ctx.lineTo(14,i);ctx.stroke();}ctx.strokeStyle='#5a3a12';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,15,0,TAU);ctx.stroke();}
  else{const f=Math.sin(tick*.5)*5;ctx.fillStyle='#1b1020';ctx.beginPath();ctx.ellipse(0,0,10,7,0,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(-6,-2);ctx.lineTo(-22,-8-f);ctx.lineTo(-10,4);ctx.moveTo(6,-2);ctx.lineTo(22,-8-f);ctx.lineTo(10,4);ctx.fill();ctx.fillStyle='#ff5d8f';ctx.beginPath();ctx.arc(-3,-1,1.8,0,TAU);ctx.arc(3,-1,1.8,0,TAU);ctx.fill();}
  ctx.restore();});
 drawCora(kP.x+12,kP.y+11,kP.face,kP.anim,kP.on,kInv>0);
 ctx.restore();
 // HUD
 ctx.fillStyle='rgba(10,5,20,.94)';ctx.fillRect(0,0,W,KOY-6);ctx.fillStyle='#9b5de566';ctx.fillRect(0,KOY-7,W,2);
 txt('❤'.repeat(Math.max(0,kHearts))+'🖤'.repeat(Math.max(0,kHeartMax-kHearts)),14,36,'700 20px sans-serif','#ff5d8f','left');
 txt('⭐ '+score,14,66,'700 16px Quicksand,sans-serif','#ffd166','left');txt('🔘 '+kButtons,130,66,'700 16px Quicksand,sans-serif','#fff','left');
 txt('NIVEL '+kLevelNo,250,66,'800 14px Quicksand,sans-serif','#8fe9c9','left');
 for(let i=0;i<4;i++){txt(LETTERS[i],190+i*24,36,'900 20px Quicksand,sans-serif',kLetters[i]?'#ffd166':'#4a3a60');}
 const prog=Math.min(1,kP.x/(kDoor||1));ctx.fillStyle='#1a1228';rr(14,78,300,6,3);ctx.fill();ctx.fillStyle='#06d6a0';rr(14,78,300*prog,6,3);ctx.fill();
 [[404,'⏸','pause'],[448,muted?'🔇':'🔊','mute']].forEach(([x,t,id])=>{ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(x,34,17,0,TAU);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(t,x,40,'16px sans-serif','#fff');hits.push({x:x-17,y:17,w:34,h:34,id});});
 // controles táctiles
 ctx.fillStyle='rgba(10,5,20,.9)';ctx.fillRect(0,KOY+KR*KT+4,W,H);
 [[12,'◀',kTouch.l],[104,'▶',kTouch.r],[352,'⤒ SALTAR',kTouch.j]].forEach(([x,l,on],i)=>{const w=i===2?116:84;ctx.fillStyle=on?'#4a1d78':'#2a1346';rr(x,KOY+KR*KT+16,w,72,20);ctx.fill();ctx.strokeStyle=i===2?'#06d6a0':'#9b5de5';ctx.lineWidth=3;ctx.stroke();txt(l,x+w/2,KOY+KR*KT+60,'900 '+(i===2?18:30)+'px Quicksand,sans-serif','#fff');});
 floats.forEach(f=>{ctx.globalAlpha=Math.min(1,f.life/20);txt(f.txt,f.x,f.y,'800 16px Quicksand,sans-serif',f.c);});ctx.globalAlpha=1;drawBanner();}
// ---- entrada: varios dedos a la vez (mover + saltar) ----
const kHold=new Map();
function kZone(x,y){if(y<KOY+KR*KT+10)return null;if(x<96)return'l';if(x<192)return'r';if(x>340)return'j';return null;}
function kPtr(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height];}
cv.addEventListener('pointerdown',e=>{if(state!=='play'||mode!=='kong')return;const [x,y]=kPtr(e),z=kZone(x,y);if(z){kHold.set(e.pointerId,z);kTouch[z]=1;try{cv.setPointerCapture(e.pointerId);}catch(_){}}});
const kRel=e=>{const z=kHold.get(e.pointerId);if(z){kHold.delete(e.pointerId);if(![...kHold.values()].includes(z))kTouch[z]=0;}};
cv.addEventListener('pointerup',kRel);cv.addEventListener('pointercancel',kRel);
cv.addEventListener('pointermove',e=>{if(state!=='play'||mode!=='kong'||!kHold.has(e.pointerId))return;const [x,y]=kPtr(e),z=kZone(x,y),o=kHold.get(e.pointerId);if(z&&z!==o&&(o==='l'||o==='r')&&(z==='l'||z==='r')){kHold.set(e.pointerId,z);kTouch.l=[...kHold.values()].includes('l')?1:0;kTouch.r=[...kHold.values()].includes('r')?1:0;}});
function kKey(e,v){const k=e.code;if(state!=='play'||mode!=='kong')return;
 if(k==='ArrowLeft'||k==='KeyA')kKeys.l=v;else if(k==='ArrowRight'||k==='KeyD')kKeys.r=v;else if(k==='ArrowUp'||k==='KeyW'||k==='Space'||k==='KeyZ')kKeys.j=v;else return;e.preventDefault();}
addEventListener('keydown',e=>kKey(e,1));addEventListener('keyup',e=>{kKey(e,0);});
addEventListener('blur',()=>{kKeys={};kTouch.l=kTouch.r=kTouch.j=0;kHold.clear();});
