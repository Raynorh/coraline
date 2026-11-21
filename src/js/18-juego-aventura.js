/* ================= AVENTURA DE CORALINE (plataformas 2D, estilo Donkey Kong Country + Mario) =================
   Niveles infinitos con semilla. Cada 3 niveles hay un jefe que debes vencer para rescatar al ratoncito del mundo.
   Salta (doble salto), corre, lanza botones, pisa a los muñecos, abre las jaulas de gatitos, junta C-O-R-A,
   rompe cajas ? (hongo = escudo, estrella = invencible) y usa a Wybie (imán de botones + linterna que aturde). */
const KT=40,KR=14,KOY=100,KGRAV=.55,KJUMP=11.8;
let kCols=[],kPlat=[],kEn=[],kItems=[],kSp=[],kBlocks=[],kPick=[],kCages=[],kShots=[],kDoor=0,kCheck=null,kLen=0,kP={},kCam=0,kCamMin=0,kLevelNo=1,kHearts=3,kHeartMax=3,kButtons=0,kLetters=[0,0,0,0],kTime=0,kInv=0,kKeys={},kTouch={l:0,r:0,j:0,c:0},kJumpHeld=false,kJBuf=0,kCoy=0,kRespawn={x:60,y:200},kDone=false,kAcc=0,kPar=0,kBonus=0,kAmmo=6,kAtkCD=0,kStar=0,kCats=0,kCatsTot=0,kMice=0,kBoss=null,kBossLvl=false,kArena=0,kWy={on:true,x:40,y:200,cd:0,flash:0,face:1},kStun=0,kCombo=0,kMsgT=0;
const LETTERS='CORA';
// Dificultad de la Aventura: cambia corazones, cantidad/velocidad/tipo de enemigos, trampas, huecos, cajas, munición y jefes.
const KDIFF=[
 {hearts:5,en:.5,spd:.75,spool:4,bat:5,spike:.35,gap:.12,gapMax:2,blocks:1.6,ammo:10,bossHp:-1,bossSpd:.8,wybie:1,inv:140,nm:['muy pocos','lentos','sin carretes hasta el nivel 4','jefes fáciles']},
 {hearts:4,en:.9,spd:1,spool:2,bat:3,spike:1,gap:.17,gapMax:3,blocks:1,ammo:6,bossHp:0,bossSpd:1,wybie:1,inv:110},
 {hearts:3,en:1.6,spd:1.3,spool:1,bat:2,spike:1.35,gap:.19,gapMax:3,blocks:.7,ammo:4,bossHp:2,bossSpd:1.25,wybie:1,inv:90},
 {hearts:2,en:2.6,spd:1.6,spool:1,bat:1,spike:1.8,gap:.22,gapMax:4,blocks:.4,ammo:3,bossHp:4,bossSpd:1.5,wybie:0,inv:70}];
const KD=()=>KDIFF[dIdx()];
const KBOSS=[['Muñeca Costurera','#8a6f9e','#cfc6a0'],['Gran Rata Encantada','#6b5a4a','#b9a58a'],['La Otra Madre','#3a3a4a','#e9e1d8']];
function fixedSteps(fn){const now=performance.now();kAcc+=Math.min(100,now-(fixedSteps.last||now));fixedSteps.last=now;while(kAcc>=16.667){kAcc-=16.667;fn();}}
function kHeartsFor(){return KD().hearts;}
function kNew(){score=0;rescued=0;stone=0;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];kLevelNo=1;kButtons=0;kMice=0;kHeartMax=kHeartsFor();kHearts=kHeartMax;kAmmo=KD().ammo;kWy.on=!!KD().wybie;kBuild(kLevelNo);fixedSteps.last=performance.now();
 say('Coraline','¡Aventura! Salta (toca otra vez en el aire = doble salto), corre, lanza botones 🔘 y rescata gatitos 🐱.',5600);}
function kBuild(n){const rnd=seeded(n*104729+dIdx()*17+3),boss=n%3===0;kBossLvl=boss;
 const len0=boss?44+n*3:Math.min(230,66+n*9);kCols=[];kPlat=[];kEn=[];kItems=[];kSp=[];kBlocks=[];kPick=[];kCages=[];kShots=[];kLetters=[0,0,0,0];kDone=false;kTime=0;kInv=0;kBoss=null;kStun=0;kCombo=0;kCatsTot=0;kCats=0;kStar=0;kCamMin=0;
 let h=11,c=0,lastGap=-9;const D=KD(),pg=D.gap,psp=.14*D.spike,pb=.10*D.blocks;
 for(let i=0;i<len0+40;i++)kCols[i]=null;
 for(;c<8;c++)kCols[c]=h;
 const flat=(w)=>{for(let i=0;i<w&&c<len0-8;i++){kCols[c]=h;c++;}};
 while(c<len0-8){const r=rnd();
  if(r<pg&&c-lastGap>4){let w=2+(rnd()<.35+n*.02?1:0);if(D.gapMax>=4&&rnd()<.35)w++;w=Math.min(w,D.gapMax);for(let i=0;i<w;i++)kCols[c+i]=null;
   for(let i=0;i<w+1;i++)kItems.push({t:'b',x:(c+i-.2)*KT+10,y:(h-2.2-Math.sin(i/w*Math.PI)*1.2)*KT});
   c+=w;lastGap=c;flat(2);}
  else if(r<pg+.15){const up=rnd()<.5,k=1+(rnd()<.25&&n>2?1:0);if(c-lastGap<3)h=Math.max(7,h-1);else h=Math.max(7,Math.min(12,h+(up?-k:k)));flat(3+Math.floor(rnd()*3));}
  else if(r<pg+.15+psp&&c>10){const s=c+2;flat(5);kSp.push({x:s*KT+6,y:(h-.55)*KT,w:28,h:22});if(D.spike>1.2&&rnd()<.5)kSp.push({x:(s+1)*KT+6,y:(h-.55)*KT,w:28,h:22});kItems.push({t:'b',x:s*KT+12,y:(h-2.4)*KT},{t:'b',x:(s+1)*KT+12,y:(h-2.6)*KT});}
  else if(r<pg+.29+psp){const s=c+1;flat(6);kPlat.push({x:s*KT,y:(h-2.3)*KT,w:3*KT});for(let i=0;i<3;i++)kItems.push({t:'b',x:(s+i)*KT+12,y:(h-3.3)*KT});}
  else if(r<pg+.29+psp+pb&&c>9){const s=c+1;flat(6);kBlocks.push({x:(s+1)*KT,y:(h-3)*KT,used:false,it:rnd()<(.45*D.blocks)?'mush':rnd()<.3?'star':rnd()<.6?'ammo':'coins'});if(rnd()<.5)kBlocks.push({x:(s+3)*KT,y:(h-3)*KT,used:false,it:rnd()<.5?'ammo':'coins'});}
  else{const s=c;flat(4+Math.floor(rnd()*4));const x0=s*KT,x1=c*KT,len=Math.max(1,c-s);
   const types=['w','w'];if(n>=D.spool)types.push('r');if(n>=D.bat)types.push('a');
   let cnt=Math.floor(D.en)+(rnd()<D.en%1?1:0);cnt=Math.min(cnt,len>5?4:3);
   for(let k=0;k<cnt;k++){const t=types[Math.floor(rnd()*types.length)],px=x0+(k+.5)*(x1-x0)/Math.max(1,cnt);
    if(t==='w')kEn.push({t:'w',x:px,y:(h-1.1)*KT,w:28,h:34,vx:-.9*(k%2?-1:1),dead:0,x0,x1,stun:0});
    else if(t==='r')kEn.push({t:'r',x:(c-1)*KT,y:(h-.9)*KT,w:30,h:30,vx:0,vy:0,act:0,dead:0,stun:0});
    else kEn.push({t:'a',x:px,y:(h-3.4)*KT,w:30,h:24,bx:px,by:(h-3.4)*KT,ph:rnd()*6,dead:0,stun:0});}
   if(rnd()<.5)kItems.push({t:'b',x:(x0+x1)/2,y:(h-2)*KT});}
 }
 for(;c<len0;c++)kCols[c]=h;
 const near=cc=>{cc=Math.max(1,Math.min(len0-9,Math.round(cc)));while(kCols[cc]==null)cc++;return cc;};
 // letras C-O-R-A: siempre alcanzables (al aire sobre suelo firme: ≈3 tiles de altura; con doble salto sobra)
 for(let i=0;i<4;i++){const cc=near(len0*(i+1)/5),top=kCols[cc];kItems.push({t:'L',i,x:cc*KT+8,y:(top-3.1)*KT});}
 // gatitos en jaulas (sobre suelo firme)
 const ncat=2+(n>3?1:0);for(let i=0;i<ncat;i++){const cc=near(len0*(i+.5)/ncat+4),top=kCols[cc];kCages.push({x:cc*KT,y:(top-1)*KT,open:false,t:0});}kCatsTot=ncat;
 const mc=near(len0/2);kCheck={x:mc*KT,y:(kCols[mc]-1.7)*KT,got:false};
 kRespawn={x:2*KT,y:(kCols[2]-1)*KT-34};kPar=len0*5.2;
 if(boss){kArena=len0;const ah=kCols[len0-1];for(let i=len0;i<len0+16;i++)kCols[i]=ah;kLen=len0+17;kCols[len0+16]=0;
  const wi=Math.floor((n/3-1)%3),bi=KBOSS[wi],hp=Math.max(3,4+Math.floor(n/3)+KD().bossHp);kBoss={x:(len0+11)*KT,y:ah*KT-80,w:64,h:80,hp,max:hp,inv:0,vx:-1.4,vy:0,t:0,name:bi[0],c1:bi[1],c2:bi[2],act:false,dead:0,on:true};kDoor=1e9;kCheck.x=Math.min(kCheck.x,(len0-6)*KT);}
 else{kLen=len0;kDoor=(len0-4)*KT;}
 kP={x:kRespawn.x,y:kRespawn.y,w:24,h:34,vx:0,vy:0,on:false,face:1,anim:0,big:0,air:0};kCam=0;kWy.x=kP.x-30;kWy.y=kP.y;kWy.cd=0;kWy.flash=0;}
const kSolid=(px,py)=>{const c=Math.floor(px/KT);if(c<0||c>=kLen)return true;const t=kCols[c];return t!=null&&py>=t*KT;};
function kSmall(){kP.big=0;kP.h=34;}
function kHurt(pit){if(kStar>0&&!pit)return;if(kInv>0&&!pit)return;
 if(!pit&&kP.big){kP.big=0;kP.y+=10;kP.h=34;kInv=100;SFX.stick();floats.push({x:kP.x-kCam+12,y:kP.y+KOY-10,txt:'¡Se acabó el hongo!',life:50,c:'#ffd166'});return;}
 if(!pit&&kWy.on){kWy.on=false;kInv=100;kP.vy=-6;kP.vx=-kP.face*4;SFX.stick();floats.push({x:kP.x-kCam+12,y:kP.y+KOY-10,txt:'¡Wybie te protegió!',life:60,c:'#7fdcff'});say('Wybie','¡Auch! Me escondo hasta la próxima lámpara…',2600);return;}
 kHearts--;kInv=KD().inv;SFX.stick();floats.push({x:kP.x-kCam+12,y:kP.y+KOY-10,txt:'¡Ay!',life:45,c:'#ff8eae'});
 if(kHearts<=0){kOver();return;}
 if(pit){kP.x=Math.max(kRespawn.x,kCamMin+10);kP.y=kRespawn.y;kP.vx=kP.vy=0;kInv=80;kSmall();}else{kP.vy=-7;kP.vx=-kP.face*5;}}
function kOver(){state='lose';loseT=0;scoreRecorded=false;recordScore({level:kLevelNo});setPowerBtns(false);SFX.lose();say('Otra Madre','Perdiste… ahora eres mía.',6000);}
function kClear(){if(kDone)return;kDone=true;kBonus=Math.max(0,Math.round((kPar-kTime/60*5)*2));const allCats=kCats>=kCatsTot&&kCatsTot>0;score+=1000+kBonus+(kLetters.every(Boolean)?2000:0)+(allCats?1500:0);if(kLetters.every(Boolean)&&kHearts<kHeartMax+1)kHearts++;if(allCats&&kHearts<kHeartMax+1)kHearts++;
 scoreRecorded=false;recordScore({level:kLevelNo});state='win';playVoice('victoria');SFX.rescue();say('Coraline',kBossLvl?'¡Ratoncito rescatado! Nivel '+kLevelNo+' superado.':'¡La puerta pequeña! Nivel '+kLevelNo+' superado.',5000);
 for(let i=0;i<80;i++)parts.push({x:rnd(0,W),y:rnd(-100,0),vx:rnd(-1,1),vy:rnd(1,4),life:200,c:COLORS[ri(5)].f,s:rnd(3,6)});}
function kNext(){kLevelNo++;state='play';scoreRecorded=false;if(!kWy.on)kWy.on=!!KD().wybie;kBuild(kLevelNo);fixedSteps.last=performance.now();setMusic('partida');setPowerBtns(false);
 if(kBossLvl)say('Coraline','¡Jefe al final del nivel! Pisa su cabeza o lánzale botones 🔘 para rescatar al ratoncito.',5200);}
function kUpdate(){if(state!=='play'||mode!=='kong')return;fixedSteps(kStep);}
function kAction(a){if(state!=='play'||mode!=='kong')return;
 if(a==='a'){if(kAtkCD>0)return;if(kAmmo<=0){floats.push({x:kP.x-kCam,y:kP.y+KOY-20,txt:'Sin botones 🔘',life:40,c:'#ff8eae'});return;}kAmmo--;kAtkCD=14;kShots.push({x:kP.x+(kP.face>0?kP.w:-8),y:kP.y+10,vx:kP.face*8.5,vy:-1.5,life:80});SFX.shoot();}
 else if(a==='w'){if(!kWy.on||kWy.cd>0)return;kWy.cd=600;kWy.flash=70;kStun=190;SFX.ready();floats.push({x:kP.x-kCam,y:kP.y+KOY-26,txt:'🔦 ¡Linterna de Wybie!',life:60,c:'#fff3c4'});kEn.forEach(e=>{if(e.t!=='r')e.stun=190;});if(kBoss&&kBoss.on)kBoss.stun=120;}}
function kStep(){const p=kP,L=kKeys.l||kTouch.l,Rr=kKeys.r||kTouch.r,J=kKeys.j||kTouch.j,RUN=kKeys.c||kTouch.c;kTime++;if(kInv>0)kInv--;if(kAtkCD>0)kAtkCD--;if(kStar>0)kStar--;if(kStun>0)kStun--;if(kWy.cd>0)kWy.cd--;if(kWy.flash>0)kWy.flash--;
 const sp=(4.1+dIdx()*.15)*(RUN?1.5:1)*(kStar>0?1.15:1);
 if(L&&!Rr){p.vx=Math.max(p.vx-.8,-sp);p.face=-1;}else if(Rr&&!L){p.vx=Math.min(p.vx+.8,sp);p.face=1;}else p.vx*=p.on?.72:.94;
 if(J&&!kJumpHeld)kJBuf=8;kJumpHeld=!!J;if(kJBuf>0)kJBuf--;if(kCoy>0)kCoy--;if(p.on){kCoy=6;p.air=0;}
 if(kJBuf>0){if(kCoy>0){p.vy=-(KJUMP+(RUN&&Math.abs(p.vx)>4?.9:0));p.on=false;kCoy=0;kJBuf=0;SFX.bounce();}
  else if(p.air<1){p.air++;p.vy=-KJUMP*.85;kJBuf=0;SFX.bounce();for(let k=0;k<8;k++)parts.push({x:p.x-kCam+12,y:p.y+KOY+34,vx:rnd(-2,2),vy:rnd(0,2),life:18,c:'#ffd166',s:2.5});}}
 if(!J&&p.vy<-4.5)p.vy=-4.5;
 p.vy=Math.min(13,p.vy+KGRAV);
 p.x+=p.vx;const ys=[p.y+3,p.y+p.h/2,p.y+p.h-3];
 if(p.vx>0&&ys.some(y=>kSolid(p.x+p.w,y))){p.x=Math.floor((p.x+p.w)/KT)*KT-p.w-.01;p.vx=0;}
 if(p.vx<0&&ys.some(y=>kSolid(p.x,y))){p.x=(Math.floor(p.x/KT)+1)*KT+.01;p.vx=0;}
 if(p.x<kCamMin)p.x=kCamMin;
 const pb=p.y+p.h,pt=p.y;p.y+=p.vy;p.on=false;
 if(p.vy<0){kBlocks.forEach(bk=>{if(p.x+p.w>bk.x+4&&p.x<bk.x+KT-4&&pt>=bk.y+KT-4&&p.y<bk.y+KT){p.y=bk.y+KT;p.vy=1.5;if(!bk.used){bk.used=true;kBlockPop(bk);}}});}
 if(p.vy>=0){const b=p.y+p.h;let land=null;
  [p.x+3,p.x+p.w-3].forEach(x=>{const c=Math.floor(x/KT);if(c>=0&&c<kLen&&kCols[c]!=null){const top=kCols[c]*KT;if(b>=top&&pb<=top+Math.max(6,p.vy+2))land=Math.min(land==null?1e9:land,top);}});
  kPlat.forEach(q=>{if(p.x+p.w>q.x&&p.x<q.x+q.w&&pb<=q.y+4&&b>=q.y)land=Math.min(land==null?1e9:land,q.y);});
  kBlocks.forEach(q=>{if(p.x+p.w>q.x+2&&p.x<q.x+KT-2&&pb<=q.y+4&&b>=q.y)land=Math.min(land==null?1e9:land,q.y);});
  if(land!=null){p.y=land-p.h;p.vy=0;p.on=true;kCombo=0;}}
 if(p.y>KR*KT+70){kHurt(true);return;}
 p.anim+=Math.abs(p.vx)*.08;
 // Wybie sigue a Coraline
 if(kWy.on){const tx=p.x-p.face*34,ty=p.y+4;kWy.x+=(tx-kWy.x)*.12;kWy.y+=(ty-kWy.y)*.14;kWy.face=p.face;}
 // objetos
 const mag=kWy.on?80:0;
 kItems=kItems.filter(it=>{const dx=p.x+12-(it.x+8),dy=p.y+17-(it.y+8);
  if(mag&&it.t==='b'&&Math.hypot(dx,dy)<mag&&Math.hypot(dx,dy)>20){it.x+=dx*.12;it.y+=dy*.12;}
  const ok=Math.abs(dx)<20&&Math.abs(dy)<28;if(!ok)return true;
  if(it.t==='b'){kButtons++;score+=50;if(kButtons%(dIdx()===0?5:dIdx()===3?12:8)===0){kAmmo++;floats.push({x:it.x-kCam,y:it.y+KOY-12,txt:'+1 🔘',life:40,c:'#4dffc4'});}SFX.pop(1);}else{kLetters[it.i]=1;score+=500;SFX.rescue();floats.push({x:it.x-kCam,y:it.y+KOY-10,txt:'¡'+LETTERS[it.i]+'!',life:60,c:'#ffd166'});}return false;});
 kPick=kPick.filter(it=>{if(Math.abs(p.x+12-(it.x+12))<24&&Math.abs(p.y+17-(it.y+12))<30){
  if(it.t==='mush'){if(!p.big){p.big=1;p.y-=10;p.h=44;}score+=200;floats.push({x:it.x-kCam,y:it.y+KOY-10,txt:'¡Hongo! Escudo extra',life:60,c:'#ff8eae'});}
  else if(it.t==='star'){kStar=480;score+=300;SFX.ready();floats.push({x:it.x-kCam,y:it.y+KOY-10,txt:'⭐ ¡INVENCIBLE!',life:70,c:'#ffd166'});}
  else if(it.t==='ammo'){kAmmo+=5;floats.push({x:it.x-kCam,y:it.y+KOY-10,txt:'+5 🔘',life:50,c:'#4dffc4'});SFX.pop(2);}
  else if(it.t==='coin'){kButtons++;score+=50;SFX.pop(1);}
  return false;}return true;});
 kCages.forEach(g=>{if(g.open){g.t++;return;}if(p.x+p.w>g.x&&p.x<g.x+KT&&p.y+p.h>g.y&&p.y<g.y+KT){g.open=true;kCats++;rescued=kCats;score+=300;SFX.rescue();floats.push({x:g.x-kCam,y:g.y+KOY-14,txt:'¡Gatito libre! 🐱',life:70,c:'#ffd166'});for(let k=0;k<10;k++)parts.push({x:g.x-kCam+20,y:g.y+KOY+20,vx:rnd(-3,3),vy:rnd(-4,0),life:30,c:'#ffd166',s:3});}});
 if(kCheck&&!kCheck.got&&p.x>kCheck.x-20){kCheck.got=true;kRespawn={x:kCheck.x,y:p.y};SFX.ready();if(!kWy.on&&KD().wybie){kWy.on=true;say('Wybie','¡Aquí estoy de nuevo!',2000);}floats.push({x:kCheck.x-kCam,y:kCheck.y+KOY-20,txt:'¡Lámpara! Punto guardado',life:70,c:'#8fe9c9'});}
 kSp.forEach(s=>{if(p.x+p.w>s.x&&p.x<s.x+s.w&&p.y+p.h>s.y&&p.y<s.y+s.h)kHurt();});
 // proyectiles de Coraline
 kShots=kShots.filter(s=>{s.x+=s.vx;s.vy+=.12;s.y+=s.vy;s.life--;if(s.life<=0||kSolid(s.x,s.y))return false;let hit=false;
  kEn.forEach(e=>{if(hit||e.dead)return;if(s.x>e.x&&s.x<e.x+e.w&&s.y>e.y&&s.y<e.y+e.h){e.dead=1;hit=true;score+=100;SFX.pop(3);floats.push({x:e.x-kCam,y:e.y+KOY,txt:'+100',life:40,c:'#fff'});}});
  if(!hit&&kBoss&&kBoss.on&&s.x>kBoss.x&&s.x<kBoss.x+kBoss.w&&s.y>kBoss.y&&s.y<kBoss.y+kBoss.h){hit=true;kBossHit();}
  return!hit;});
 // enemigos
 kEn.forEach(e=>{if(e.dead)return;const sp2=KD().spd,st=e.stun>0||kStun>0&&e.t!=='r';if(e.stun>0)e.stun--;
  if(!st){if(e.t==='w'){e.x+=e.vx*sp2;if(e.x<e.x0+6||e.x+e.w>e.x1-6){e.vx=-e.vx;e.x=Math.max(e.x0+6,Math.min(e.x1-6-e.w,e.x));}}
  else if(e.t==='r'){if(!e.act&&p.x>e.x-440)e.act=1;if(e.act){if(!e.vx0)e.vx0=e.dirx||-2.6*sp2;e.vx=e.vx0;e.x+=e.vx;e.vy=Math.min(12,e.vy+KGRAV);e.y+=e.vy;const c=Math.floor((e.x+15)/KT),t=kCols[c];if(t!=null&&e.y+e.h>=t*KT&&e.y+e.h<t*KT+18){e.y=t*KT-e.h;e.vy=0;}if(e.y>KR*KT+80||e.x<-40||e.x>kLen*KT+40)e.dead=2;}}
  else{e.x=e.bx+Math.sin(kTime*.03+e.ph)*70;e.y=e.by+Math.sin(kTime*.06+e.ph)*34;}}
  if(p.x+p.w>e.x+3&&p.x<e.x+e.w-3&&p.y+p.h>e.y+3&&p.y<e.y+e.h){
   if(kStar>0&&e.t!=='r'){e.dead=1;score+=150;SFX.pop(3);}
   else if(p.vy>1&&p.y+p.h<e.y+e.h*.65){if(e.t==='r'){p.vy=-9;e.dead=1;score+=50;}else{e.dead=1;kCombo++;p.vy=-9.2;const pts=100*Math.min(kCombo,5);score+=pts;SFX.pop(3);floats.push({x:e.x-kCam,y:e.y+KOY,txt:'+'+pts+(kCombo>1?' ×'+kCombo:''),life:40,c:'#fff'});for(let k=0;k<10;k++)parts.push({x:e.x-kCam+14,y:e.y+KOY+14,vx:rnd(-3,3),vy:rnd(-4,1),life:30,c:'#9b5de5',s:3});}}
   else kHurt();}});
 kEn=kEn.filter(e=>e.dead!==1&&e.dead!==2);
 if(kBoss&&kBoss.on)kBossStep();
 if(!kBossLvl&&p.x>kDoor-10&&p.y>0)kClear();
 if(kBoss&&kBoss.dead&&kBoss.cage&&p.x+p.w>kBoss.cage.x&&p.x<kBoss.cage.x+KT*1.2&&!kDone){kMice++;rescued=kCats;score+=2500;floats.push({x:kBoss.cage.x-kCam,y:kBoss.cage.y+KOY-20,txt:'¡RATONCITO RESCATADO! 🐭',life:90,c:'#ffd166'});kClear();}
 if(!kBoss||!kBoss.on){}
 const maxCam=kLen*KT-W;let cam=p.x-190;if(kBoss&&kBoss.act){kCamMin=Math.max(kCamMin,kArena*KT-60);}cam=Math.max(kCamMin,Math.min(maxCam,cam));kCam+=(cam-kCam)*.18;if(Math.abs(cam-kCam)<.5)kCam=cam;}
function kBlockPop(bk){SFX.pop(2);const x=bk.x+8,y=bk.y-34;
 if(bk.it==='mush'&&kP.big)bk.it='ammo';
 if(bk.it==='coins'){for(let i=0;i<3;i++)kPick.push({t:'coin',x:x+(i-1)*22,y:y-i%2*14});}else kPick.push({t:bk.it,x,y});
 for(let k=0;k<8;k++)parts.push({x:bk.x-kCam+20,y:bk.y+KOY+10,vx:rnd(-2,2),vy:rnd(-3,0),life:24,c:'#ffd166',s:3});}
// ---- jefe del mundo ----
function kBossHit(){const b=kBoss;if(b.inv>0||b.dead)return;b.hp--;b.inv=55;SFX.pop(6);floats.push({x:b.x-kCam+30,y:b.y+KOY-10,txt:'¡'+b.hp+' / '+b.max+'!',life:40,c:'#ff8eae'});
 for(let k=0;k<14;k++)parts.push({x:b.x-kCam+32,y:b.y+KOY+30,vx:rnd(-4,4),vy:rnd(-5,1),life:30,c:'#ffd166',s:3});
 if(b.hp<=0){b.dead=1;b.on=false;score+=3000;SFX.rescue();playVoice('victoria');const ah=kCols[kArena];b.cage={x:b.x+10,y:(ah-1)*KT};say('Coraline','¡Lo vencimos! Libera al ratoncito de la jaula.',4000);for(let k=0;k<50;k++)parts.push({x:b.x-kCam+32,y:b.y+KOY+40,vx:rnd(-6,6),vy:rnd(-7,1),life:50,c:COLORS[ri(5)].f,s:4});}}
function kBossStep(){const b=kBoss,p=kP;if(!b.act){if(p.x>kArena*KT-20){b.act=true;say(b.name,'¡No te llevarás al ratoncito!',3200);}return;}
 if(b.inv>0)b.inv--;b.t++;const ph=b.hp<=b.max/2?1:0,spd=(1.4+ph*.7)*KD().bossSpd;
 if(!(b.stun>0)){if(b.stun>0)b.stun--;
  const L0=(kArena+1)*KT,R0=(kArena+14)*KT;b.x+=b.vx>0?spd:-spd;if(b.x<L0){b.vx=1;}if(b.x>R0){b.vx=-1;}
  const ah=kCols[kArena];b.vy+=KGRAV;b.y+=b.vy;if(b.y+b.h>=ah*KT){b.y=ah*KT-b.h;b.vy=0;}
  if(b.t%Math.round((150-ph*40)/KD().bossSpd)===0){if(Math.random()<.5){const dir=p.x<b.x?-1:1;kEn.push({t:'r',x:b.x+(dir>0?b.w:-30),y:b.y+b.h-30,w:30,h:30,vx:0,vy:0,act:1,dead:0,stun:0,dirx:dir*(2.6*KD().spd+ph),vx0:dir*(2.6*KD().spd+ph)});SFX.shoot();}else if(b.y+b.h>=ah*KT-1){b.vy=-12.5;b.vx=p.x<b.x?-1:1;}}}
 else b.stun--;
 if(p.x+p.w>b.x+6&&p.x<b.x+b.w-6&&p.y+p.h>b.y+4&&p.y<b.y+b.h){
  if(kStar>0){if(b.t%30===0)kBossHit();}
  else if(p.vy>1&&p.y+p.h<b.y+b.h*.45){kBossHit();p.vy=-11;}
  else kHurt();}}
// ---- dibujo ----
function drawCora(x,y,face,anim,on,inv,big,star){ctx.save();ctx.translate(x,y);if(inv&&Math.floor(tick/4)%2)ctx.globalAlpha=.45;ctx.scale(face*(big?1.2:1),big?1.2:1);const sw=on?Math.sin(anim*2)*5:0;
 if(star){ctx.shadowColor='#ffd166';ctx.shadowBlur=18;}
 ctx.fillStyle='#1d3f8a';ctx.fillRect(-7+sw*.6,22,6,10);ctx.fillRect(1-sw*.6,22,6,10);ctx.fillStyle=star&&Math.floor(tick/3)%2?'#fff3a0':'#ffcf33';rr(-10,6,20,18,5);ctx.fill();ctx.fillStyle='#e0aa00';ctx.fillRect(-1,8,2,14);
 ctx.fillStyle='#ffd9b8';ctx.beginPath();ctx.arc(0,0,10,0,TAU);ctx.fill();ctx.fillStyle='#2f6fe0';ctx.beginPath();ctx.arc(0,-2,11,Math.PI,TAU);ctx.fill();ctx.fillRect(-11,-3,5,12);ctx.fillRect(6,-3,5,12);
 ctx.strokeStyle='#111';ctx.lineWidth=1.6;[[2,0],[7,0]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(a-2,b-2);ctx.lineTo(a+2,b+2);ctx.moveTo(a+2,b-2);ctx.lineTo(a-2,b+2);ctx.stroke();});ctx.restore();}
function drawWybie(x,y,face,flash){ctx.save();ctx.translate(x+10,y+14);if(flash>0){ctx.fillStyle='rgba(255,243,196,'+Math.min(.5,flash/90)+')';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(face*300,-90);ctx.lineTo(face*300,90);ctx.closePath();ctx.fill();}
 ctx.scale(face,1);const sw=Math.sin(tick*.25)*3;ctx.fillStyle='#4a4a5a';ctx.fillRect(-6+sw,10,5,9);ctx.fillRect(1-sw,10,5,9);ctx.fillStyle='#f5c518';rr(-10,-4,20,17,5);ctx.fill();ctx.fillStyle='#ffd9b8';ctx.beginPath();ctx.arc(0,-11,9,0,TAU);ctx.fill();ctx.fillStyle='#ddd';rr(-8,-12,16,10,4);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(-5,-10,3,3);ctx.fillRect(2,-10,3,3);ctx.fillRect(-3,-5,6,1.5);ctx.fillStyle='#5a3a1a';ctx.beginPath();ctx.arc(0,-17,9,Math.PI,TAU);ctx.fill();ctx.fillStyle='#fff3a0';ctx.beginPath();ctx.arc(11,2,3,0,TAU);ctx.fill();ctx.restore();}
function drawKBack(){const g=ctx.createLinearGradient(0,KOY,0,KOY+KR*KT);const th=(Math.floor((kLevelNo-1)/3))%3;const cs=[['#120a24','#3a1248'],['#0b1a2b','#1d3a4a'],['#1d0b24','#4a1d3a']][th];g.addColorStop(0,cs[0]);g.addColorStop(1,cs[1]);ctx.fillStyle=g;ctx.fillRect(0,KOY,W,KR*KT);
 stars.forEach(s=>{ctx.globalAlpha=.4;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,KOY+s.y*.5,s.r,0,TAU);ctx.fill();});ctx.globalAlpha=1;
 ctx.fillStyle='#e9e1ff';ctx.beginPath();ctx.arc(380,KOY+70,26,0,TAU);ctx.fill();ctx.fillStyle=cs[0];ctx.beginPath();ctx.arc(390,KOY+64,24,0,TAU);ctx.fill();
 [[.25,'#1a0d2c',140],[.5,'#22103a',90]].forEach(([k,col,hh])=>{ctx.fillStyle=col;const off=-(kCam*k)%160;for(let i=-1;i<5;i++){const x=off+i*160;ctx.beginPath();ctx.moveTo(x,KOY+KR*KT-3*KT);ctx.lineTo(x+40,KOY+KR*KT-3*KT-hh);ctx.lineTo(x+80,KOY+KR*KT-3*KT-hh*.4);ctx.lineTo(x+120,KOY+KR*KT-3*KT-hh*.9);ctx.lineTo(x+160,KOY+KR*KT-3*KT);ctx.fill();}});}
function drawKong(){drawSky();ctx.save();ctx.beginPath();ctx.rect(0,KOY,W,KR*KT);ctx.clip();drawKBack();ctx.translate(-kCam,KOY);
 const c0=Math.max(0,Math.floor(kCam/KT)),c1=Math.min(kLen-1,c0+13);
 for(let c=c0;c<=c1;c++){const t=kCols[c];if(t==null)continue;const x=c*KT,y=t*KT;ctx.fillStyle=t===0?'#4a2a6a':'#2a1a3d';ctx.fillRect(x,y,KT+1,KR*KT-y);ctx.fillStyle='#3d2757';for(let yy=y+KT;yy<KR*KT;yy+=KT)ctx.fillRect(x+2,yy-2,KT-3,3);ctx.fillStyle='#18a37a';ctx.fillRect(x,y,KT+1,8);ctx.fillStyle='#ff5d8f';if((c*7)%5===0){ctx.beginPath();ctx.arc(x+14,y+3,3,0,TAU);ctx.fill();}}
 kPlat.forEach(q=>{if(q.x+q.w<kCam||q.x>kCam+W)return;ctx.fillStyle='#7a4a2a';rr(q.x,q.y,q.w,14,5);ctx.fill();ctx.fillStyle='#c98a4b';ctx.fillRect(q.x+4,q.y+2,q.w-8,3);ctx.fillStyle='#1b1020';for(let i=0;i<q.w/KT;i++){ctx.beginPath();ctx.arc(q.x+20+i*KT,q.y+9,2.2,0,TAU);ctx.fill();}});
 kBlocks.forEach(b=>{if(b.x<kCam-50||b.x>kCam+W+50)return;ctx.fillStyle=b.used?'#5a3a2a':'#ffd166';rr(b.x+1,b.y+1,KT-2,KT-2,6);ctx.fill();ctx.strokeStyle=b.used?'#3a2418':'#c98a00';ctx.lineWidth=3;ctx.stroke();if(!b.used)txt('?',b.x+KT/2,b.y+29,'900 24px Quicksand,sans-serif','#7a4a00');});
 kSp.forEach(s=>{ctx.fillStyle='#d7dbe8';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(s.x+i*10,s.y+s.h);ctx.lineTo(s.x+5+i*10,s.y);ctx.lineTo(s.x+10+i*10,s.y+s.h);ctx.fill();}ctx.fillStyle='#ff5d8f';ctx.fillRect(s.x,s.y+s.h-4,s.w,4);});
 if(!kBossLvl){const dy=(kCols[kLen-4]-1.9)*KT;ctx.fillStyle='#3a1630';rr(kDoor,dy,34,76,6);ctx.fill();ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(kDoor+27,dy+40,3,0,TAU);ctx.fill();txt('🚪',kDoor+17,dy-6,'20px sans-serif','#fff');}
 if(kCheck){ctx.fillStyle=kCheck.got?'#ffd166':'#6b5a85';ctx.fillRect(kCheck.x,kCheck.y,4,60);ctx.beginPath();ctx.arc(kCheck.x+2,kCheck.y,9,0,TAU);ctx.fill();if(kCheck.got){ctx.fillStyle='rgba(255,209,102,.25)';ctx.beginPath();ctx.arc(kCheck.x+2,kCheck.y,26,0,TAU);ctx.fill();}}
 kCages.forEach(g=>{if(g.x<kCam-60||g.x>kCam+W+60)return;if(!g.open){ctx.strokeStyle='#cdb6ea';ctx.lineWidth=3;rr(g.x+2,g.y+2,KT-4,KT-4,6);ctx.stroke();for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(g.x+2+i*9,g.y+2);ctx.lineTo(g.x+2+i*9,g.y+KT-2);ctx.stroke();}txt('🐱',g.x+KT/2,g.y+27,'22px sans-serif','#fff');}else{const j=Math.min(1,g.t/30);txt('🐱',g.x+KT/2+j*60,g.y+27-Math.sin(j*Math.PI)*40,'22px sans-serif','#fff');}});
 kItems.forEach(it=>{if(it.x<kCam-20||it.x>kCam+W+20)return;const bob=Math.sin(tick*.08+it.x)*2;if(it.t==='b')drawBtnS(it.x+8,it.y+8+bob,(Math.floor(it.x/40))%5,false,9);else{ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=14;ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(it.x+8,it.y+8+bob,15,0,TAU);ctx.fill();ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.stroke();ctx.restore();txt(LETTERS[it.i],it.x+8,it.y+15+bob,'900 20px Quicksand,sans-serif','#ffd166');}});
 kPick.forEach(it=>{const bob=Math.sin(tick*.1+it.x)*3;if(it.t==='coin'){drawBtnS(it.x+12,it.y+12+bob,(Math.floor(it.x/40))%5,false,9);return;}
  ctx.save();ctx.translate(it.x+12,it.y+12+bob);if(it.t==='mush'){ctx.fillStyle='#fff3e0';ctx.fillRect(-6,0,12,11);ctx.fillStyle='#e63946';ctx.beginPath();ctx.arc(0,0,13,Math.PI,TAU);ctx.fill();ctx.fillStyle='#fff';[[-6,-5],[5,-6],[0,-9]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a,b,2.6,0,TAU);ctx.fill();});}
  else if(it.t==='star'){ctx.shadowColor='#ffd166';ctx.shadowBlur=14;ctx.fillStyle='#ffd166';ctx.beginPath();for(let i=0;i<10;i++){const r=i%2?6:14,a=-Math.PI/2+i*Math.PI/5;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();}
  else{ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(0,0,13,0,TAU);ctx.fill();ctx.strokeStyle='#4dffc4';ctx.lineWidth=2.5;ctx.stroke();txt('🔘',0,6,'15px sans-serif','#fff');}ctx.restore();});
 kEn.forEach(e=>{if(e.x<kCam-60||e.x>kCam+W+60)return;ctx.save();ctx.translate(e.x+e.w/2,e.y+e.h/2);if(e.stun>0||kStun>0&&e.t!=='r'){ctx.globalAlpha=.7;txt('💫',0,-e.h/2-4,'16px sans-serif','#fff');}
  if(e.t==='w'){const f=e.vx>0?1:-1;ctx.scale(f,1);ctx.fillStyle='#2b2438';rr(-14,-6,28,24,8);ctx.fill();ctx.fillStyle='#cfc6a0';ctx.beginPath();ctx.arc(0,-10,13,0,TAU);ctx.fill();ctx.strokeStyle='#111';ctx.lineWidth=2;[[-5,-12],[5,-12]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(a-3,b-3);ctx.lineTo(a+3,b+3);ctx.moveTo(a+3,b-3);ctx.lineTo(a-3,b+3);ctx.stroke();});ctx.beginPath();ctx.moveTo(-5,-4);ctx.lineTo(5,-4);ctx.stroke();const s=Math.sin(tick*.2)*4;ctx.fillStyle='#111';ctx.fillRect(-9+s,16,6,4);ctx.fillRect(3-s,16,6,4);}
  else if(e.t==='r'){ctx.rotate(-kTime*.15*(e.vx>=0?-1:1));ctx.fillStyle='#b8873a';ctx.beginPath();ctx.arc(0,0,15,0,TAU);ctx.fill();ctx.strokeStyle='#ff5d8f';ctx.lineWidth=3;for(let i=-8;i<=8;i+=5){ctx.beginPath();ctx.moveTo(-14,i);ctx.lineTo(14,i);ctx.stroke();}ctx.strokeStyle='#5a3a12';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,15,0,TAU);ctx.stroke();}
  else{const f=Math.sin(tick*.5)*5;ctx.fillStyle='#1b1020';ctx.beginPath();ctx.ellipse(0,0,10,7,0,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(-6,-2);ctx.lineTo(-22,-8-f);ctx.lineTo(-10,4);ctx.moveTo(6,-2);ctx.lineTo(22,-8-f);ctx.lineTo(10,4);ctx.fill();ctx.fillStyle='#ff5d8f';ctx.beginPath();ctx.arc(-3,-1,1.8,0,TAU);ctx.arc(3,-1,1.8,0,TAU);ctx.fill();}
  ctx.restore();});
 if(kBoss&&!kBoss.dead){const b=kBoss;ctx.save();ctx.translate(b.x+b.w/2,b.y+b.h/2);if(b.inv>0&&Math.floor(tick/3)%2)ctx.globalAlpha=.5;const f=b.vx>0?1:-1;ctx.scale(f,1);
  ctx.fillStyle=b.c1;rr(-32,-10,64,50,14);ctx.fill();ctx.fillStyle=b.c2;ctx.beginPath();ctx.arc(0,-22,26,0,TAU);ctx.fill();ctx.fillStyle='#0c0612';ctx.beginPath();ctx.arc(0,-34,26,Math.PI,TAU);ctx.fill();
  ctx.strokeStyle='#111';ctx.lineWidth=3;[[-9,-22],[9,-22]].forEach(([a,c2])=>{ctx.fillStyle='#7d7d8c';ctx.beginPath();ctx.arc(a,c2,8,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(a-4,c2-4);ctx.lineTo(a+4,c2+4);ctx.moveTo(a+4,c2-4);ctx.lineTo(a-4,c2+4);ctx.stroke();});
  ctx.strokeStyle='#c9c4cf';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(-52,24);ctx.moveTo(34,0);ctx.lineTo(52,24);ctx.stroke();ctx.restore();}
 if(kBoss&&kBoss.cage){const g=kBoss.cage;ctx.strokeStyle='#cdb6ea';ctx.lineWidth=3;rr(g.x,g.y,KT*1.2,KT,6);ctx.stroke();for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(g.x+i*10,g.y);ctx.lineTo(g.x+i*10,g.y+KT);ctx.stroke();}txt('🐭',g.x+KT*.6,g.y+28,'24px sans-serif','#fff');}
 kShots.forEach(s=>{drawBtnS(s.x,s.y,Math.floor(s.x/20)%5,false,7);});
 if(kWy.on)drawWybie(kWy.x,kWy.y,kWy.face,kWy.flash);
 drawCora(kP.x+12,kP.y+(kP.big?13:11),kP.face,kP.anim,kP.on,kInv>0,kP.big,kStar>0);
 ctx.restore();
 // aviso del jefe
 if(kBoss&&kBoss.act&&!kBoss.dead){ctx.fillStyle='rgba(10,5,20,.85)';rr(90,KOY+8,300,26,10);ctx.fill();txt(kBoss.name,240,KOY+26,'800 12px Quicksand,sans-serif','#ff8eae');ctx.fillStyle='#2a1346';rr(100,KOY+36,280,8,4);ctx.fill();ctx.fillStyle='#ff5d8f';rr(100,KOY+36,280*Math.max(0,kBoss.hp)/kBoss.max,8,4);ctx.fill();}
 // HUD
 ctx.fillStyle='rgba(10,5,20,.94)';ctx.fillRect(0,0,W,KOY-6);ctx.fillStyle='#9b5de566';ctx.fillRect(0,KOY-7,W,2);
 txt('❤'.repeat(Math.max(0,kHearts))+'🖤'.repeat(Math.max(0,kHeartMax-kHearts)),12,34,'700 18px sans-serif','#ff5d8f','left');
 for(let i=0;i<4;i++)txt(LETTERS[i],232+i*22,34,'900 19px Quicksand,sans-serif',kLetters[i]?'#ffd166':'#4a3a60');
 txt('⭐ '+score,12,64,'700 14px Quicksand,sans-serif','#ffd166','left');txt('🔘 '+kAmmo,116,64,'700 14px Quicksand,sans-serif',kAmmo?'#4dffc4':'#ff5d8f','left');txt('🐱 '+kCats+'/'+kCatsTot,176,64,'700 14px Quicksand,sans-serif','#fff','left');txt('🐭 '+kMice,252,64,'700 14px Quicksand,sans-serif','#fff','left');
 txt((kBossLvl?'👑 ':'')+'NIVEL '+kLevelNo,310,64,'800 13px Quicksand,sans-serif',kBossLvl?'#ff8eae':'#8fe9c9','left');
 if(kStar>0)txt('⭐ '+Math.ceil(kStar/60)+'s',12,86,'800 12px Quicksand,sans-serif','#ffd166','left');if(kP.big)txt('🍄 escudo',70,86,'800 12px Quicksand,sans-serif','#ff8eae','left');
 const prog=Math.min(1,kP.x/(kBossLvl?kArena*KT:kDoor||1));ctx.fillStyle='#1a1228';rr(14,76,200,5,3);ctx.fillStyle='#1a1228';ctx.fill();ctx.fillStyle='#06d6a0';rr(14,76,200*prog,5,3);ctx.fill();
 [[404,'⏸','pause'],[448,muted?'🔇':'🔊','mute']].forEach(([x,t,id])=>{ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(x,34,17,0,TAU);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(t,x,40,'16px sans-serif','#fff');hits.push({x:x-17,y:17,w:34,h:34,id});});
 // controles táctiles
 ctx.fillStyle='rgba(10,5,20,.9)';ctx.fillRect(0,KOY+KR*KT+4,W,H);
 const by=KOY+KR*KT+16;
 [['l','◀',6,60,kTouch.l,'#9b5de5'],['r','▶',70,60,kTouch.r,'#9b5de5'],['a','🔘 ATACAR',136,84,kAtkCD>0,'#4dffc4'],['c','⚡ CORRER',224,84,kTouch.c,'#ff9f43'],['w','🔦 WYBIE',312,64,kWy.cd>0||!kWy.on,'#7fdcff'],['j','⤒ SALTAR',380,96,kTouch.j,'#06d6a0']].forEach(([k,l,x,w,on,col])=>{ctx.fillStyle=on?'#4a1d78':'#2a1346';rr(x,by,w,72,18);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=3;ctx.stroke();
  if(l.length===1)txt(l,x+w/2,by+46,'900 28px Quicksand,sans-serif','#fff');else{const [ic,nm]=l.split(' ');txt(ic,x+w/2,by+30,'22px sans-serif','#fff');txt(nm,x+w/2,by+56,'800 11px Quicksand,sans-serif','#fff');}
  if(k==='w'&&kWy.cd>0){ctx.fillStyle='rgba(127,220,255,.35)';rr(x,by+72*(1-kWy.cd/600),w,72*kWy.cd/600,18);ctx.fill();}});
 floats.forEach(f=>{ctx.globalAlpha=Math.min(1,f.life/20);txt(f.txt,f.x,f.y,'800 16px Quicksand,sans-serif',f.c);});ctx.globalAlpha=1;drawBanner(KOY+KR*KT-44);}
// ---- entrada: varios dedos a la vez ----
const kHold=new Map();
function kZone(x,y){if(y<KOY+KR*KT+10)return null;if(x<66)return'l';if(x<130)return'r';if(x>=136&&x<220)return'a';if(x>=224&&x<308)return'c';if(x>=312&&x<376)return'w';if(x>=380)return'j';return null;}
function kPtr(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height];}
cv.addEventListener('pointerdown',e=>{if(state!=='play'||mode!=='kong')return;const [x,y]=kPtr(e),z=kZone(x,y);if(!z)return;
 if(z==='a'||z==='w'){kAction(z);return;}kHold.set(e.pointerId,z);kTouch[z]=1;try{cv.setPointerCapture(e.pointerId);}catch(_){}});
const kRel=e=>{const z=kHold.get(e.pointerId);if(z){kHold.delete(e.pointerId);if(![...kHold.values()].includes(z))kTouch[z]=0;}};
cv.addEventListener('pointerup',kRel);cv.addEventListener('pointercancel',kRel);
cv.addEventListener('pointermove',e=>{if(state!=='play'||mode!=='kong'||!kHold.has(e.pointerId))return;const [x,y]=kPtr(e),z=kZone(x,y),o=kHold.get(e.pointerId);if(z&&z!==o&&(o==='l'||o==='r')&&(z==='l'||z==='r')){kHold.set(e.pointerId,z);const v=[...kHold.values()];kTouch.l=v.includes('l')?1:0;kTouch.r=v.includes('r')?1:0;}});
function kKey(e,v){const k=e.code;if(state!=='play'||mode!=='kong')return;
 if(k==='ArrowLeft'||k==='KeyA')kKeys.l=v;else if(k==='ArrowRight'||k==='KeyD')kKeys.r=v;else if(k==='ArrowUp'||k==='KeyW'||k==='Space'||k==='KeyZ')kKeys.j=v;else if(k==='ShiftLeft'||k==='ShiftRight')kKeys.c=v;
 else if((k==='KeyX'||k==='KeyK')&&v&&!e.repeat)kAction('a');else if((k==='KeyE'||k==='KeyQ')&&v&&!e.repeat)kAction('w');else return;e.preventDefault();}
addEventListener('keydown',e=>kKey(e,1));addEventListener('keyup',e=>{kKey(e,0);});
addEventListener('blur',()=>{kKeys={};kTouch.l=kTouch.r=kTouch.j=kTouch.c=0;kHold.clear();});
