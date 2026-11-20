/* ================= CORREDOR DEL OTRO MUNDO (carrera sin fin 3 carriles, estilo Pepsiman) =================
   Coraline corre sola por el camino del Palacio Rosa. Cambia de carril, salta los carretes bajos y desliza bajo
   las tijeras colgantes; los armarios bloquean todo el carril. Junta botones y corazones; cada 600 m cambia la zona. */
const HZ=250,PY=640,FOC=300,LW=118,ZFAR=1900;
let rLane=0,rX=0,rH=0,rVH=0,rSlide=0,rObs=[],rIt=[],rHearts=3,rHMax=3,rButtons=0,rDist=0,rInv=0,rSpeed=7,rSlow=1,rNextZ=700,rStage=1,rShake=0,rAnim=0,rSw=null,rTilt=0;
const rProj=z=>FOC/(FOC+z),rSX=(lane,z)=>240+lane*LW*rProj(z),rSY=(z,h)=>HZ+(PY-HZ)*rProj(z)-(h||0)*rProj(z);
function rNew(){score=0;rescued=0;stone=0;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];rLane=0;rX=0;rH=0;rVH=0;rSlide=0;rObs=[];rIt=[];rHMax=[5,4,3,2][dIdx()];rHearts=rHMax;rButtons=0;rDist=0;rInv=0;rSlow=1;rNextZ=800;rStage=1;rShake=0;rAnim=0;rSpeed=[7,8.2,9.4,11][dIdx()];fixedSteps.last=performance.now();
 say('Coraline','¡A correr! Desliza el dedo (o usa los botones): ◀ ▶ cambian de carril, ⤒ salta, ⤓ desliza.',5200);}
function rAct(id){if(state!=='play'||mode!=='runner')return;
 if(id==='xL')rLane=Math.max(-1,rLane-1);else if(id==='xR')rLane=Math.min(1,rLane+1);
 else if(id==='xJ'){if(rH<=0&&rSlide<=0){rVH=14.6;SFX.bounce();}}
 else if(id==='xS'){if(rH>0)rVH=-16;else if(rSlide<=0){rSlide=34;SFX.stick();}}}
function rPattern(z){const rnd=Math.random,L=[-1,0,1],pick=()=>L[Math.floor(rnd()*3)],d=dIdx(),r=rnd(),ty=['low','high','block'];
 if(r<.3){const l=pick();rObs.push({t:ty[Math.floor(rnd()*3)],lane:l,z});if(rnd()<.6)rIt.push({t:'b',lane:L[(L.indexOf(l)+1)%3],z:z+60,h:0});}
 else if(r<.5){const free=pick();L.forEach(l=>{if(l!==free)rObs.push({t:'block',lane:l,z});});for(let i=0;i<5;i++)rIt.push({t:'b',lane:free,z:z-120+i*60,h:0});}
 else if(r<.62+d*.03){const t=rnd()<.5?'low':'high';L.forEach(l=>rObs.push({t,lane:l,z}));for(let i=0;i<3;i++)rIt.push({t:'b',lane:pick(),z:z+i*45,h:t==='low'?70:0});}
 else if(r<.8){const free=pick();L.forEach(l=>{if(l!==free)rObs.push({t:'block',lane:l,z});else rObs.push({t:'low',lane:l,z:z+150});});}
 else{const l=pick();for(let i=0;i<6;i++)rIt.push({t:'b',lane:l,z:z+i*55,h:i===2||i===3?60:0});if(rnd()<.18+d*.04)rObs.push({t:'low',lane:l,z:z+3*55});}
 if(rnd()<.07&&rHearts<rHMax)rIt.push({t:'h',lane:pick(),z:z+240,h:20});}
function rUpdate(){if(state!=='play'||mode!=='runner')return;fixedSteps(rStep);}
function rStep(){const d=dIdx(),v0=[7,8.2,9.4,11][d],sp=(v0+Math.min(9,rDist/380))*rSlow;rSlow=Math.min(1,rSlow+.012);rSpeed=sp;
 rDist+=sp*.045;if(rInv>0)rInv--;if(rShake>0)rShake--;rAnim+=sp*.03;
 rX+=(rLane-rX)*.24;if(rH>0||rVH>0){rH+=rVH;rVH-=.8;if(rH<=0){rH=0;rVH=0;}}if(rSlide>0)rSlide--;
 rObs.forEach(o=>o.z-=sp);rIt.forEach(o=>o.z-=sp);rNextZ-=sp;
 if(rNextZ<=0){rPattern(ZFAR-100);rNextZ=Math.max(260,620-Math.min(300,rDist*.12)-d*40)+Math.random()*120;}
 rObs.forEach(o=>{if(o.hit||o.z>40||o.z<-40)return;if(Math.abs(rX-o.lane)>.55)return;
  const hitIt=o.t==='block'||(o.t==='low'&&rH<55)||(o.t==='high'&&(rSlide<=0||rH>0));
  if(hitIt){o.hit=true;if(rInv<=0){rHearts--;rInv=100;rSlow=.55;rShake=18;SFX.stick();floats.push({x:240,y:480,txt:'¡Ay!',life:45,c:'#ff8eae'});if(rHearts<=0){rOver();}}}});
 rIt=rIt.filter(o=>{if(o.z<-60)return false;if(o.z<35&&o.z>-35&&Math.abs(rX-o.lane)<.6&&Math.abs(rH-(o.h||0))<62){if(o.t==='b'){rButtons++;SFX.pop(1);}else{rHearts=Math.min(rHMax,rHearts+1);SFX.rescue();floats.push({x:240,y:480,txt:'+❤',life:50,c:'#ff8eae'});}return false;}return true;});
 rObs=rObs.filter(o=>o.z>-60);
 const st=1+Math.floor(rDist/600);if(st>rStage){rStage=st;rSlow=Math.min(rSlow,.8);say('Coraline','¡Zona '+rStage+'! Cada vez más rápido…',2600);SFX.ready();}
 score=Math.floor(rDist)+rButtons*15;}
function rOver(){state='lose';loseT=0;recordScore();setPowerBtns(false);SFX.lose();say('Otra Madre','Perdiste… ahora eres mía.',6000);}
function drawRCora(x,y,s,anim,slide,inv){ctx.save();ctx.translate(x,y);if(inv&&Math.floor(tick/4)%2)ctx.globalAlpha=.45;ctx.scale(s,s*(slide>0?.55:1));const sw=Math.sin(anim*3)*9;
 ctx.fillStyle='#1d3f8a';ctx.fillRect(-9,-24,7,24+sw*.3);ctx.fillRect(2,-24,7,24-sw*.3);ctx.fillStyle='#111';ctx.fillRect(-10,-4+sw*.3,9,5);ctx.fillRect(1,-4-sw*.3,9,5);
 ctx.fillStyle='#ffcf33';rr(-15,-62,30,42,9);ctx.fill();ctx.fillStyle='#e0aa00';ctx.fillRect(-1,-60,2,38);
 ctx.fillStyle='#ffcf33';ctx.fillRect(-21,-58+sw*.4,7,22);ctx.fillRect(14,-58-sw*.4,7,22);
 ctx.fillStyle='#2f6fe0';ctx.beginPath();ctx.arc(0,-72,15,0,TAU);ctx.fill();ctx.fillRect(-15,-72,30,18);ctx.fillStyle='#ffd9b8';ctx.beginPath();ctx.arc(0,-48,5,0,TAU);ctx.fill();ctx.restore();}
function rDrawObs(o){const p=rProj(o.z),x=rSX(o.lane,o.z),y=rSY(o.z,0),s=p*1.0;if(p<.14||o.hit&&o.z<0)return;ctx.save();ctx.translate(x,y);ctx.scale(s,s);if(o.hit)ctx.globalAlpha=.3;
 if(o.t==='low'){ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,2,46,10,0,0,TAU);ctx.fill();ctx.fillStyle='#b8873a';rr(-36,-48,72,48,10);ctx.fill();ctx.fillStyle='#ff5d8f';for(let i=-30;i<=30;i+=12)ctx.fillRect(-36,-44+((i+30)/12|0)*8,72,4);ctx.strokeStyle='#5a3a12';ctx.lineWidth=4;rr(-36,-48,72,48,10);ctx.stroke();txt('🧵',0,-14,'26px sans-serif','#fff');}
 else if(o.t==='high'){ctx.strokeStyle='#cdb6ea';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-50,-175);ctx.lineTo(50,-175);ctx.stroke();for(const sx of[-34,0,34]){ctx.fillStyle='#d7dbe8';ctx.beginPath();ctx.moveTo(sx-7,-175);ctx.lineTo(sx,-95);ctx.lineTo(sx+7,-175);ctx.fill();ctx.strokeStyle='#ff5d8f';ctx.lineWidth=4;ctx.beginPath();ctx.arc(sx,-176,6,0,TAU);ctx.stroke();}ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,2,40,7,0,0,TAU);ctx.fill();}
 else{ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(0,2,52,11,0,0,TAU);ctx.fill();ctx.fillStyle='#3a1630';rr(-44,-150,88,150,8);ctx.fill();ctx.strokeStyle='#ff5d8f';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#4a1d78';rr(-36,-142,34,134,4);ctx.fill();rr(2,-142,34,134,4);ctx.fill();ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(-8,-74,4,0,TAU);ctx.arc(8,-74,4,0,TAU);ctx.fill();txt('✕',-19,-120,'900 22px sans-serif','#cfc6a0');txt('✕',19,-120,'900 22px sans-serif','#cfc6a0');}
 ctx.restore();}
function drawRunner(){const sh=rShake>0?(Math.random()-.5)*8:0;ctx.save();ctx.translate(sh,0);
 const hue=[['#07050e','#3a1248'],['#0b1a2b','#2a5060'],['#240b1f','#7a2a4a'],['#0b0b24','#2b2b7a']][(rStage-1)%4],g=ctx.createLinearGradient(0,0,0,HZ+30);g.addColorStop(0,hue[0]);g.addColorStop(1,hue[1]);ctx.fillStyle=g;ctx.fillRect(-10,0,W+20,HZ+30);
 stars.forEach(s=>{ctx.globalAlpha=.5;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y*.3,s.r,0,TAU);ctx.fill();});ctx.globalAlpha=1;
 ctx.fillStyle='#f0e8ff';ctx.beginPath();ctx.arc(110,110,30,0,TAU);ctx.fill();ctx.fillStyle=hue[0];ctx.beginPath();ctx.arc(122,102,28,0,TAU);ctx.fill();
 // palacio rosa lejano
 ctx.fillStyle='#2a1230';ctx.fillRect(150,HZ-58,180,58);[165,215,260,305].forEach(x=>{ctx.beginPath();ctx.moveTo(x-14,HZ-58);ctx.lineTo(x,HZ-110);ctx.lineTo(x+14,HZ-58);ctx.fill();});ctx.fillStyle='#ffd166';for(let i=0;i<5;i++)ctx.fillRect(170+i*30,HZ-38,6,10);
 // suelo
 const gg=ctx.createLinearGradient(0,HZ,0,H);gg.addColorStop(0,'#1d0b2e');gg.addColorStop(1,'#331048');ctx.fillStyle=gg;ctx.fillRect(-10,HZ,W+20,H-HZ);
 const pf=rProj(ZFAR),pn=rProj(-170),yf=HZ+(PY-HZ)*pf,yn=HZ+(PY-HZ)*pn;
 ctx.fillStyle='#3d2757';ctx.beginPath();ctx.moveTo(240-1.5*LW*pf,yf);ctx.lineTo(240+1.5*LW*pf,yf);ctx.lineTo(240+1.5*LW*pn,yn);ctx.lineTo(240-1.5*LW*pn,yn);ctx.fill();
 ctx.fillStyle='#ff5d8f';[-1.5,1.5].forEach(e=>{ctx.beginPath();ctx.moveTo(240+e*LW*pf-3*pf,yf);ctx.lineTo(240+e*LW*pf+3*pf,yf);ctx.lineTo(240+e*LW*pn+3*pn,yn);ctx.lineTo(240+e*LW*pn-3*pn,yn);ctx.fill();});
 const off=(rDist*22)%140;ctx.fillStyle='rgba(255,255,255,.28)';for(let z=ZFAR-off;z>-150;z-=140){const p1=rProj(z),p2=rProj(z-60);[-.5,.5].forEach(e=>{ctx.beginPath();ctx.moveTo(240+e*LW*p1-2*p1,HZ+(PY-HZ)*p1);ctx.lineTo(240+e*LW*p1+2*p1,HZ+(PY-HZ)*p1);ctx.lineTo(240+e*LW*p2+2*p2,HZ+(PY-HZ)*p2);ctx.lineTo(240+e*LW*p2-2*p2,HZ+(PY-HZ)*p2);ctx.fill();});}
 // árboles-botón a los lados
 const toff=(rDist*22)%300;for(let z=ZFAR-toff;z>-100;z-=300){[-2.5,2.5].forEach((e,i)=>{const p=rProj(z),x=240+e*LW*p,y=HZ+(PY-HZ)*p;ctx.save();ctx.translate(x,y);ctx.scale(p,p);ctx.fillStyle='#1a0b24';ctx.fillRect(-7,-120,14,120);ctx.fillStyle=['#18a37a','#7a3fd0','#d04a8a'][((Math.floor((z+toff)/300))+i)%3];ctx.beginPath();ctx.arc(0,-135,44,0,TAU);ctx.fill();ctx.fillStyle='#1b1020';[[-14,-142],[14,-142],[-14,-122],[14,-122]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a,b,3,0,TAU);ctx.fill();});ctx.restore();});}
 // objetos lejanos → cercanos
 const all=[...rObs.map(o=>({o,k:'o'})),...rIt.map(o=>({o,k:'i'}))].sort((a,b)=>b.o.z-a.o.z);
 all.forEach(({o,k})=>{if(o.z>ZFAR||o.z<-120)return;if(k==='o')rDrawObs(o);else{const p=rProj(o.z),x=rSX(o.lane,o.z),y=rSY(o.z,(o.h||0)+26);if(o.t==='b'){ctx.save();ctx.translate(x,y);ctx.scale(p*1.2,p*1.2);drawButton(0,0,Math.floor(o.z/70+7)%5,false);ctx.restore();}else{txt('❤',x,y,Math.round(40*p)+'px sans-serif','#ff5d8f');}}});
 // Coraline
 drawRCora(240+rX*LW,PY-rH,1.55,rAnim,rSlide,rInv>0);
 ctx.restore();
 // HUD
 ctx.fillStyle='rgba(10,5,20,.9)';ctx.fillRect(0,0,W,TOP+12);ctx.fillStyle='#9b5de566';ctx.fillRect(0,TOP+10,W,2);
 txt('❤'.repeat(Math.max(0,rHearts))+'🖤'.repeat(Math.max(0,rHMax-rHearts)),14,34,'700 18px sans-serif','#ff5d8f','left');
 txt('📏 '+Math.floor(rDist)+' m',14,62,'800 15px Quicksand,sans-serif','#fff','left');txt('⭐ '+score,130,62,'800 15px Quicksand,sans-serif','#ffd166','left');txt('🔘 '+rButtons,250,62,'800 15px Quicksand,sans-serif','#fff','left');txt('ZONA '+rStage,330,62,'800 13px Quicksand,sans-serif','#8fe9c9','left');
 [[404,'⏸','pause'],[448,muted?'🔇':'🔊','mute']].forEach(([x,t,id])=>{ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(x,30,17,0,TAU);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(t,x,36,'16px sans-serif','#fff');hits.push({x:x-17,y:13,w:34,h:34,id});});
 ctx.fillStyle='rgba(10,5,20,.88)';ctx.fillRect(0,676,W,H-676);
 [[10,'◀','xL',70],[86,'▶','xR',70],[170,'','x',0],[250,'⤒ SALTAR','xJ',116],[372,'⤓ DESLIZAR','xS',98]].forEach(([x,l,id,w])=>{if(!w)return;ctx.fillStyle='#2a1346';rr(x,688,w,62,18);ctx.fill();ctx.strokeStyle=id==='xJ'?'#06d6a0':id==='xS'?'#ff9f43':'#9b5de5';ctx.lineWidth=3;ctx.stroke();txt(l,x+w/2,727,'900 '+(w>80?13:26)+'px Quicksand,sans-serif','#fff');hits.push({x,y:688,w,h:62,id});});
 floats.forEach(f=>{ctx.globalAlpha=Math.min(1,f.life/20);txt(f.txt,f.x,f.y,'800 20px Quicksand,sans-serif',f.c);});ctx.globalAlpha=1;drawBanner();}
// deslizar el dedo: izquierda/derecha = carril, arriba = salto, abajo = deslizar
cv.addEventListener('pointerdown',e=>{if(state!=='play'||mode!=='runner')return;const [x,y]=kPtr(e);if(y<676&&y>TOP+14)rSw={x,y,id:e.pointerId};});
cv.addEventListener('pointermove',e=>{if(!rSw||rSw.id!==e.pointerId||state!=='play'||mode!=='runner')return;const [x,y]=kPtr(e),dx=x-rSw.x,dy=y-rSw.y;if(Math.hypot(dx,dy)<30)return;
 if(Math.abs(dx)>Math.abs(dy))rAct(dx>0?'xR':'xL');else rAct(dy<0?'xJ':'xS');rSw.x=x;rSw.y=y;});
cv.addEventListener('pointerup',()=>{rSw=null;});cv.addEventListener('pointercancel',()=>{rSw=null;});
addEventListener('keydown',e=>{if(state!=='play'||mode!=='runner'||e.repeat)return;const k=e.code;
 if(k==='ArrowLeft'||k==='KeyA')rAct('xL');else if(k==='ArrowRight'||k==='KeyD')rAct('xR');else if(k==='ArrowUp'||k==='KeyW'||k==='Space')rAct('xJ');else if(k==='ArrowDown'||k==='KeyS')rAct('xS');else return;e.preventDefault();});
