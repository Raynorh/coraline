/* ================= JUEGO ================= */
function laserPath(maxLen,bounceInfo){const pts=[];let x=CX,y=CY,vx=Math.cos(aim)*4,vy=Math.sin(aim)*4,len=0;pts.push([x,y]);
 while(len<maxLen&&y>TOP+R*.5){x+=vx;y+=vy;len+=4;
  if(x<12+R){x=12+R;vx=-vx;pts.push([x,y]);}else if(x>W-12-R){x=W-12-R;vx=-vx;pts.push([x,y]);}
  if(hitBubble(x,y))break;}
 pts.push([x,y]);return pts;}
function hitBubble(x,y){for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++){if(!grid[r][c])continue;const p=cellPos(r,c);
  if((p.x-x)**2+(p.y-y)**2<(R*1.78)**2)return true;}return false;}
function shoot(){if(state!=='play'||proj||ammo<=0||endTimer||scrollOff>1)return;
 if(bombArmed){proj={x:CX,y:CY,vx:Math.cos(aim)*15,vy:Math.sin(aim)*15,color:cur,bomb:true};bombArmed=false;bomb=0;SFX.shoot();updateStoneBtn();return;}
 proj={x:CX,y:CY,vx:Math.cos(aim)*15,vy:Math.sin(aim)*15,color:cur};
 cur=nxt;nxt=nextShot();ammo--;SFX.shoot();
 if(armed){armed=false;stone=0;ready100=false;updateStoneBtn();}
}
function stepProj(){if(!proj)return;const N=3;
 for(let i=0;i<N&&proj;i++){proj.x+=proj.vx/N;proj.y+=proj.vy/N;
  if(proj.x<12+R){proj.x=12+R;proj.vx=-proj.vx;SFX.bounce();}
  else if(proj.x>W-12-R){proj.x=W-12-R;proj.vx=-proj.vx;SFX.bounce();}
  if(proj.y<=TOP+R||hitBubble(proj.x,proj.y)){snap();}}}
function bombBlast(x,y){let n=0;for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++){if(!grid[r][c])continue;const p=cellPos(r,c);if((p.x-x)**2+(p.y-y)**2<=(R*3.7)**2){popCell(r,c,n++,true);}}
 for(let k=0;k<28;k++)parts.push({x,y,vx:rnd(-6,6),vy:rnd(-6,6),life:rnd(20,40),c:['#ffd166','#ff9f43','#ff5d8f'][ri(3)],s:rnd(3,6)});
 floats.push({x,y:y-24,txt:'💥 BOOM',life:60,c:'#ff9f43'});SFX.pop(8);if(n)dropOrphans();}
function snap(){if(proj&&proj.bomb){const bx=proj.x,by=proj.y;proj=null;bombBlast(bx,by);afterShot();return;}
 let best=null,bd=1e9;
 for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++){if(grid[r][c])continue;
  if(r>0&&!neigh(r,c).some(([a,b])=>grid[a][b]))continue;
  const p=cellPos(r,c),d=(p.x-proj.x)**2+(p.y-proj.y)**2;if(d<bd){bd=d;best=[r,c];}}
 const col=proj.color;proj=null;if(!best){afterShot();return;}
 const [r,c]=best;if(col===RAINBOW)resolveRainbow(r,c);else grid[r][c]={color:col,mouse:false};
 const grp=flood(r,c);
 if(grp.length>=3){combo++;grp.forEach(([a,b],i)=>{popCell(a,b,i);});SFX.pop(Math.min(grp.length,8));
  stone=Math.min(100,stone+grp.length*10);bomb=Math.min(100,bomb+grp.length*4);dropOrphans();}
 else{SFX.stick();combo=0;}
 afterShot();}
function flood(r,c){const col=grid[r][c].color,seen=new Set([r*100+c]),q=[[r,c]],out=[];
 while(q.length){const [a,b]=q.pop();out.push([a,b]);neigh(a,b).forEach(([x,y])=>{const k=x*100+y;
  if(!seen.has(k)&&matchable(grid[x][y])&&grid[x][y].color===col){seen.add(k);q.push([x,y]);}});}return out;}
function popCell(r,c,i,force){const b=grid[r][c];if(!b)return;if(b.kind==='iron'&&!force)return;if(b.kind==='ice'&&!force)return;const p=cellPos(r,c),col=COLORS[b.color]||COLORS[0];grid[r][c]=null;crackIce(r,c);
 for(let k=0;k<9;k++)parts.push({x:p.x,y:p.y,vx:rnd(-3.5,3.5),vy:rnd(-4.5,1.5),life:rnd(25,45),c:col.f,s:rnd(2,4.5)});
 score+=50;floats.push({x:p.x,y:p.y,txt:'+50',life:40,c:'#fff'});
 if(b.mouse)rescue(p.x,p.y);
 if(!force&&b.kind==='bomb')specialBlast(p.x,p.y,R*2.7);else if(!force&&b.kind==='bolt')rowZap(r);}
function rescue(x,y){rescued++;savedTotal++;bomb=Math.min(100,bomb+30);score+=500;SFX.rescue();jumpers.push({x,y,t:0,sx:x,sy:y});
 floats.push({x,y:y-18,txt:'+500 🐭',life:70,c:'#ffd166'});
 const L=['¡Ja ja! ¡Un ratoncito libre! ¡Bravo!','¡Mis ratoncitos, mis hermosos ratoncitos!','¡Hurra, pequeña Coraline! ¡Trompeta para ti!','¡Salta, salta, ratoncito! ¡Eres libre!'];
 if(rescued<bMice)say('Sr. Bobinsky',L[ri(L.length)],2600);}
function dropOrphans(){const seen=new Set(),q=[];for(let c=0;c<COLS;c++)if(grid[0][c]){seen.add(c);q.push([0,c]);}
 while(q.length){const [a,b]=q.pop();neigh(a,b).forEach(([x,y])=>{const k=x*100+y;if(grid[x][y]&&!seen.has(k)){seen.add(k);q.push([x,y]);}});}
 let n=0;for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++){if(grid[r][c]&&!seen.has(r*100+c)){const b=grid[r][c],p=cellPos(r,c);
  falling.push({x:p.x,y:p.y,vy:rnd(-2,0),vx:rnd(-.6,.6),color:b.color,mouse:b.mouse,kind:b.kind});grid[r][c]=null;score+=50;n++;
  if(b.mouse)rescue(p.x,p.y);}}
 if(n)SFX.fall();}
function afterShot(){
 syncLauncher();
 if(stone>=100&&!ready100){ready100=true;SFX.ready();say('Gato Negro','La Piedra Mágica está lista… pulsa 🔺 o Espacio y toca una casilla vacía.',3000);}
 updateStoneBtn();
 if(ammo===5&&!warned){warned=true;playVoice('peligro');say('Gato Negro','Cuidado, Coraline. Te quedan pocos botones y la Mamá de Botones está mirando.',4600);}
 let lost=false;for(let c=0;c<COLS;c++)if(grid[ROWS][c])lost=true;
 if(rescued>=bMice){endTimer=setTimeout(bubbleMode==='endless'?bubbleNext:win,1100);}
 else if(lost){endTimer=setTimeout(lose,700);}
 else if(ammo<=0){endTimer=setTimeout(lose,1200);}
}
function bubbleNext(){endTimer=null;const D=DIFF[diff],bonus=800*bubbleSec;score+=bonus;floats.push({x:240,y:300,txt:'¡ESCENARIO '+bubbleSec+' LIBRE! +'+bonus,life:110,c:'#ffd166'});
 playVoice('victoria');say('Coraline','¡Lo logramos! Pero hay más ratoncitos atrapados… ¡el escenario sube!',4400);
 grid.forEach((row,r)=>row.forEach((b,c)=>{if(b){const p=cellPos(r,c);falling.push({x:p.x,y:p.y,vy:rnd(-2,0),vx:rnd(-.6,.6),color:b.color,mouse:false});}}));
 bubbleSec++;rescued=0;warned=false;ammo=Math.min(D.ammo+10,ammo+Math.round(D.ammo*.4));bomb=Math.min(100,bomb+25);
 grid=buildBubbleGrid(bubbleSec);scrollOff=ROWS*ROWH*.9;cur=pickColor();nxt=pickColor();SFX.rescue();updateStoneBtn();}
function win(){state='win';if(isLevels())levelWon();recordScore(isLevels()?{level:bubbleLevel}:null);setPowerBtns(false);playVoice('victoria');say('Coraline','¡Lo logramos! ¡Todos los ratoncitos saltarines están a salvo!',9000);
 for(let i=0;i<120;i++)parts.push({x:rnd(0,W),y:rnd(-100,0),vx:rnd(-1,1),vy:rnd(1,4),life:200,c:COLORS[ri(5)].f,s:rnd(3,6)});}
function lose(){state='lose';loseT=0;recordScore(isLevels()?{level:bubbleLevel}:null);setPowerBtns(false);SFX.lose();say('Otra Madre','Perdiste… ahora eres mía.',6000);}
function swapShot(){if(state!=='play'||mode!=='bubble'||proj||endTimer)return;const t=cur;cur=nxt;nxt=t;SFX.bounce();}
function tryMagicPlace(x,y){
 if(!armed||proj||endTimer||state!=='play'||scrollOff>1)return false;
 let best=null,bd=R*R*1.35;
 for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++){const p=cellPos(r,c),d=(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;best={r,c};}}
 if(!best){say('Gato Negro','Toca una casilla vacía, pegada a otros botones.',1800);return true;}
 const r=best.r,c=best.c;
 if(grid[r][c]){say('Gato Negro','Esa casilla ya tiene un botón.',1600);return true;}
 if(r>0&&!neigh(r,c).some(([a,b])=>grid[a][b])){say('Gato Negro','Solo puedes colocar junto a otros botones.',1800);return true;}
 const col=cur;grid[r][c]={color:col,mouse:false};cur=nxt;nxt=pickColor();
 armed=false;stone=0;ready100=false;
 const grp=flood(r,c);
 if(grp.length>=3){combo++;grp.forEach(([a,b],i)=>popCell(a,b,i));SFX.pop(Math.min(grp.length,8));stone=Math.min(100,stone+grp.length*10);bomb=Math.min(100,bomb+grp.length*4);dropOrphans();}
 else{SFX.stick();combo=0;}
 afterShot();return true;
}
function activateBomb(){if(state!=='play'||mode!=='bubble'||bomb<100||armed||bombArmed||proj||scrollOff>1)return;bombArmed=true;playVoice('poder');say('Gato Negro','¡Bomba lista! Apunta y dispara: explota al impactar y no gasta botones.',3600);updateStoneBtn();}
function activateMagic(){if(state==='play'&&mode==='tetris'){if(stone<100)return;playVoice('poder');say('Gato Negro','Usa la piedra mágica. Mira a través del agujero.',3600);tStone();return;}if(state!=='play'||mode!=='bubble'||stone<100||armed||bombArmed||proj||scrollOff>1)return;armed=true;playVoice('poder');say('Gato Negro','Toca una casilla vacía para colocar el botón. La piedra se consume al colocarlo.',3600);updateStoneBtn();}
function updateStoneBtn(){updateBombBtn();stoneBtn.classList.toggle('ready',stone>=100&&!armed);stoneBtn.classList.toggle('armed',armed);
 const p=Math.min(100,stone);stoneBtn.querySelector('.ring').style.background='conic-gradient(#06d6a0 '+p*3.6+'deg,#1a1a2a55 0)';
 stoneBtn.querySelector('.ring').style.mask=stoneBtn.querySelector('.ring').style.webkitMask='radial-gradient(circle,transparent 55%,#000 58%)';}
function updateBombBtn(){bombBtn.classList.toggle('ready',bomb>=100&&!bombArmed);bombBtn.classList.toggle('armed',bombArmed);
 const ring=bombBtn.querySelector('.ring');ring.style.background='conic-gradient(#ff9f43 '+Math.min(100,bomb)*3.6+'deg,#1a1a2a55 0)';ring.style.mask=ring.style.webkitMask='radial-gradient(circle,transparent 55%,#000 58%)';}
bombBtn.addEventListener('click',e=>{e.stopPropagation();activateBomb();});bombBtn.addEventListener('pointerdown',e=>e.stopPropagation());
stoneBtn.addEventListener('click',e=>{e.stopPropagation();activateMagic();});
stoneBtn.addEventListener('pointerdown',e=>e.stopPropagation());

