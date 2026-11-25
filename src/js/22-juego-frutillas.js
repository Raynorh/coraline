/* ================= FRUTILLAS (fusiona frutas iguales, estilo Fruit Clash / Suika) =================
   Suelta frutas en el frasco: cuando dos iguales se tocan se fusionan en la siguiente (🍒→🍓→🍇→…→🍉).
   Si una fruta se queda por encima de la línea roja demasiado tiempo, pierdes. Física propia a 60 Hz. */
const FR=[
 {e:'🍒',r:15,c:'#e63946',p:1},{e:'🍓',r:20,c:'#ff4d6d',p:3},{e:'🍇',r:26,c:'#9b5de5',p:6},{e:'🍊',r:32,c:'#ff9f1c',p:10},{e:'🍎',r:39,c:'#d00000',p:15},
 {e:'🍐',r:47,c:'#9ac84b',p:21},{e:'🍑',r:56,c:'#ffa987',p:28},{e:'🍍',r:66,c:'#f4d35e',p:36},{e:'🍈',r:77,c:'#a7e08a',p:45},{e:'🍉',r:90,c:'#2ec27e',p:100}];
// Dificultad: frutas más grandes al soltar, frasco más angosto, menos tiempo sobre la línea y caída más rápida.
const F_SPAWN=[2,3,4,4],F_HW=[200,190,178,166],F_GRACE=[260,200,150,105],F_G=[.34,.38,.42,.46];
const F_FL=700,F_LINE=176,F_DROPY=118;
let fr=[],fCur=0,fNext=0,fAimX=240,fDown=false,fCD=0,fOver=0,fCombo=0,fComboT=0,fBest=0,fMerges=0;
const fL=()=>240-F_HW[dIdx()],fR=()=>240+F_HW[dIdx()];
const fPick=()=>ri(F_SPAWN[dIdx()]+1);
function fNew(){score=0;rescued=0;stone=0;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];fr=[];fCur=fPick();fNext=fPick();fAimX=240;fDown=false;fCD=0;fOver=0;fCombo=0;fComboT=0;fMerges=0;clearTimeout(endTimer);endTimer=null;fixedSteps.last=performance.now();
 fBest=ScoreStore.all().filter(e=>e.game==='fruit'&&(!profile||e.profileId===profile.id)).reduce((m,e)=>Math.max(m,e.score),0);
 say('Coraline','¡Frutillas! Toca para soltar la fruta. Cuando dos iguales se tocan se fusionan en una más grande. ¡Que no pasen la línea roja!',5200);}
function fAim(x){const r=FR[Math.max(0,fCur)].r;fAimX=Math.max(fL()+r+3,Math.min(fR()-r-3,x));}
function fDrop(){if(state!=='play'||mode!=='fruit'||fCD>0||fCur<0)return false;const t=FR[fCur];fr.push({x:fAimX,y:F_DROPY,vx:0,vy:0,t:fCur,r:t.r,age:0});fCur=-1;fCD=26;SFX.shoot();return true;}
function fMerge(a,b,news){a.dead=b.dead=true;const nt=a.t+1,mx=(a.x+b.x)/2,my=(a.y+b.y)/2;fMerges++;fCombo++;fComboT=70;
 const mult=1+Math.min(4,fCombo-1)*.25,pts=Math.round((nt>9?FR[9].p:FR[nt].p)*mult);score+=pts;
 floats.push({x:mx,y:my-a.r,txt:'+'+pts+(fCombo>1?' ×'+fCombo:''),life:45,c:nt>9?'#ffd166':'#fff'});SFX.pop(Math.min(8,nt+1));
 for(let k=0;k<10;k++)parts.push({x:mx,y:my,vx:rnd(-3,3),vy:rnd(-3.5,1),life:rnd(20,36),c:FR[Math.min(9,nt)].c,s:rnd(2,4)});
 if(nt<=9)news.push({x:mx,y:my,vx:(a.vx+b.vx)/2,vy:(a.vy+b.vy)/2,t:nt,r:FR[nt].r,age:Math.max(a.age,b.age)});
 else{score+=500;floats.push({x:mx,y:my-30,txt:'🍉 ¡SANDÍA GIGANTE! +500',life:90,c:'#ffd166'});}}
function fStep(){const d=dIdx(),G=F_G[d],L=fL(),R=fR(),news=[];
 if(fCD>0){fCD--;if(fCD===0){fCur=fNext;fNext=fPick();fAim(fAimX);}}
 if(fComboT>0&&--fComboT===0)fCombo=0;
 fr.forEach(f=>{f.age++;f.vy+=G;f.x+=f.vx;f.y+=f.vy;f.vx*=.995;f.vy*=.998;});
 for(let it=0;it<6;it++){
  fr.forEach(f=>{if(f.dead)return;if(f.x-f.r<L){f.x=L+f.r;f.vx=Math.abs(f.vx)*.2;}if(f.x+f.r>R){f.x=R-f.r;f.vx=-Math.abs(f.vx)*.2;}if(f.y+f.r>F_FL){f.y=F_FL-f.r;if(f.vy>0)f.vy=-f.vy*.1;f.vx*=.96;}});
  for(let i=0;i<fr.length;i++)for(let j=i+1;j<fr.length;j++){const a=fr[i],b=fr[j];if(a.dead||b.dead)continue;let dx=b.x-a.x,dy=b.y-a.y,dd=Math.hypot(dx,dy);const mn=a.r+b.r;if(dd>=mn)continue;
   if(a.t===b.t){fMerge(a,b,news);continue;}
   if(dd<.001){dx=.01;dy=0;dd=.01;}const nx=dx/dd,ny=dy/dd,ov=mn-dd,ma=a.r*a.r,mb=b.r*b.r,s=ma+mb;
   a.x-=nx*ov*mb/s;a.y-=ny*ov*mb/s;b.x+=nx*ov*ma/s;b.y+=ny*ov*ma/s;
   const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rv<0){const j2=-(1.1)*rv/(1/ma+1/mb);a.vx-=j2/ma*nx;a.vy-=j2/ma*ny;b.vx+=j2/mb*nx;b.vy+=j2/mb*ny;}
   a.vx*=.995;b.vx*=.995;}}
 if(news.length||fr.some(f=>f.dead))fr=fr.filter(f=>!f.dead).concat(news);
 const over=fr.some(f=>f.age>80&&f.y-f.r<F_LINE&&Math.hypot(f.vx,f.vy)<2.4);
 if(over)fOver++;else fOver=Math.max(0,fOver-2);
 if(fOver>=F_GRACE[d]&&state==='play'){lose();}}
function fUpdate(){if(state!=='play'||mode!=='fruit')return;fixedSteps(fStep);}
function drawFruit(x,y,t,r,alpha){ctx.save();ctx.globalAlpha=alpha==null?1:alpha;const F=FR[t],g=ctx.createRadialGradient(x-r*.3,y-r*.35,r*.1,x,y,r);g.addColorStop(0,'#ffffffcc');g.addColorStop(.25,F.c);g.addColorStop(1,F.c);
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=2;ctx.stroke();txt(F.e,x,y+r*.5,Math.round(r*1.4)+'px sans-serif','#fff');ctx.restore();}
function drawFruta(){drawSky();drawFog(.1);const L=fL(),R=fR(),d=dIdx();
 // frasco
 ctx.fillStyle='rgba(18,10,32,.82)';rr(L-6,F_LINE-34,R-L+12,F_FL-F_LINE+44,18);ctx.fill();ctx.strokeStyle='#c9b3e6';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(L-4,F_LINE-34);ctx.lineTo(L-4,F_FL+6);ctx.lineTo(R+4,F_FL+6);ctx.lineTo(R+4,F_LINE-34);ctx.stroke();
 const hot=fOver>0;ctx.save();ctx.setLineDash([10,8]);ctx.strokeStyle=hot&&tick%16<8?'#ffffff':'#ff5d8f';ctx.lineWidth=hot?4:2.5;ctx.beginPath();ctx.moveTo(L,F_LINE);ctx.lineTo(R,F_LINE);ctx.stroke();ctx.restore();
 if(hot){const f=Math.min(1,fOver/F_GRACE[d]);ctx.fillStyle='#2a1346';rr(L,F_LINE-26,R-L,8,4);ctx.fill();ctx.fillStyle='#ff5d8f';rr(L,F_LINE-26,(R-L)*f,8,4);ctx.fill();txt('¡Cuidado!',240,F_LINE-32,'800 12px Quicksand,sans-serif','#ff8eae');}
 // guía y fruta en mano
 if(state==='play'&&fCur>=0){ctx.save();ctx.setLineDash([4,8]);ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(fAimX,F_DROPY+FR[fCur].r);ctx.lineTo(fAimX,F_FL);ctx.stroke();ctx.restore();drawFruit(fAimX,F_DROPY,fCur,FR[fCur].r);}
 fr.forEach(f=>drawFruit(f.x,f.y,f.t,f.r));
 // HUD
 ctx.fillStyle='rgba(10,5,20,.9)';ctx.fillRect(0,0,W,TOP-6);ctx.fillStyle='#9b5de566';ctx.fillRect(0,TOP-7,W,2);
 txt('⭐ '+score,14,34,'700 17px Quicksand,sans-serif','#ffd166','left');txt('🏆 '+Math.max(fBest,score),128,34,'700 15px Quicksand,sans-serif','#cdb6ea','left');
 txt('Sig.',236,34,'700 13px Quicksand,sans-serif','#8fe9c9','left');drawFruit(296,28,fNext,Math.min(18,FR[fNext].r*.9));
 [[404,'⏸','pause'],[448,muted?'🔇':'🔊','mute']].forEach(([x,t,id])=>{ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(x,28,17,0,TAU);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(t,x,34,'16px sans-serif','#fff');hits.push({x:x-17,y:11,w:34,h:34,id});});
 txt('Fusiones: '+fMerges+' · '+DIFF[diff].n,240,TOP+8,'600 11px Quicksand,sans-serif','#cdb6ea');
 // cadena de evolución
 for(let i=0;i<10;i++){const x=28+i*47.5;drawFruit(x,738,i,i===9?15:12,.95);if(i<9)txt('›',x+23.7,742,'700 14px sans-serif','#cdb6ea');}
 floats.forEach(f=>{ctx.globalAlpha=Math.min(1,f.life/20);txt(f.txt,f.x,f.y,'800 15px Quicksand,sans-serif',f.c);});ctx.globalAlpha=1;drawBanner();}
