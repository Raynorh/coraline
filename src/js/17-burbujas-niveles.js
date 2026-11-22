/* ================= BURBUJAS: CAMPAÑA POR NIVELES (estilo Panda Pop) =================
   Botones especiales: 🔩 hierro (no explota, solo cae si pierde su apoyo o con bomba), ❄️ hielo (se rompe al explotar
   algo a su lado y luego es un botón normal), 💣 bomba (explota alrededor al romperse), ⚡ rayo (limpia su fila) y el
   disparo 🌈 arcoíris (toma el color que más grupo forme). Los niveles se generan con semilla: siempre son los mismos. */
const MAXLV=30,RAINBOW=-2,IRON=-1;
function seeded(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const BDIFF={facil:{ammo:10,col:-1,spec:.5,mice:0},normal:{ammo:3,col:0,spec:1,mice:0},dificil:{ammo:-2,col:0,spec:1.4,mice:1},experto:{ammo:-8,col:1,spec:1.9,mice:2}};
function levelDef(n){const bd=BDIFF[diff]||BDIFF.normal;
 const rows=Math.min(9,4+Math.floor((n+1)/3)),ncol=Math.max(3,Math.min(6,3+Math.floor(n/5)+bd.col));
 const mice=Math.min(14,6+Math.floor(n/3)+bd.mice),s=bd.spec;
 return{n,rows,ncol,mice,pattern:n%4,
  iron:n>=3?Math.min(10,Math.round((1+(n-3)*.5)*s)):0,
  ice:n>=5?Math.min(12,Math.round((2+(n-5)*.55)*s)):0,
  bombs:n>=4?Math.min(4,1+Math.floor(n/7)):0,
  bolts:n>=7?Math.min(3,1+Math.floor((n-7)/8)):0,
  ammo:Math.max(30,Math.round(DIFF[diff].ammo*.85)+bd.ammo+4-Math.floor(n*.35)+Math.round(mice*2.8))};}
function buildLevelGrid(L){const rnd=seeded(L.n*7919+dIdx()*131),g=Array.from({length:ROWS+1},()=>Array(COLS).fill(null));
 const rI=k=>Math.floor(rnd()*k);
 for(let r=0;r<L.rows;r++)for(let c=0;c<COLS;c++){
  let keep=true;
  if(L.pattern===1){const m=Math.floor(r/2);keep=c>=m&&c<=COLS-1-m;}
  else if(L.pattern===2){keep=r<2||!(c%3===1&&rnd()<.7);}
  else if(L.pattern===3){keep=r===0||rnd()>.14;}
  if(keep)g[r][c]={color:rI(L.ncol),mouse:false};}
 // quitar lo que quede sin apoyo
 const seen=new Set(),q=[];for(let c=0;c<COLS;c++)if(g[0][c]){seen.add(c);q.push([0,c]);}
 while(q.length){const [a,b]=q.pop();neigh(a,b).forEach(([x,y])=>{if(g[x]&&g[x][y]&&!seen.has(x*100+y)){seen.add(x*100+y);q.push([x,y]);}});}
 const cells=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(g[r][c]&&!seen.has(r*100+c))g[r][c]=null;else if(g[r][c])cells.push([r,c]);}
 const take=(pred)=>{const pool=cells.filter(([r,c])=>pred(r,c)&&!g[r][c].mouse&&!g[r][c].kind&&g[r][c].color>=0);if(!pool.length)return null;const k=rI(pool.length);return pool[k];};
 const maxR=L.rows-1;
 const m0=Math.ceil(L.mice/2);for(let i=0;i<m0;i++){const p=take((r)=>r<=Math.max(2,maxR-1));if(p)g[p[0]][p[1]].mouse=true;}
 for(let i=0;i<L.iron;i++){const p=take((r)=>r>=2);if(p){const o=g[p[0]][p[1]];o.kind='iron';o.color=IRON;}}
 for(let i=0;i<L.ice;i++){const p=take((r)=>r>=1);if(p)g[p[0]][p[1]].kind='ice';}
 for(let i=0;i<L.bombs;i++){const p=take((r)=>r>=1);if(p)g[p[0]][p[1]].kind='bomb';}
 for(let i=0;i<L.bolts;i++){const p=take((r)=>r>=1);if(p)g[p[0]][p[1]].kind='bolt';}
 // el hierro no cuenta como ratón; si por azar quedaron menos ratones, ajustar la meta
 let m=0;g.forEach(row=>row.forEach(b=>{if(b&&b.mouse)m++;}));miceLeft=Math.max(0,L.mice-m);bNcol=L.ncol;
 return g;}
// ---- progreso por perfil (listo para migrar a Supabase: una fila por perfil+nivel) ----
const bpKey=()=>'cor_bprog_'+(profile?profile.id:'invitado');
function bubbleProg(){try{const p=JSON.parse(localStorage.getItem(bpKey())||'null');if(p&&p.stars)return p;}catch(e){}return{unlocked:1,stars:{}};}
function saveBubbleProg(p){try{localStorage.setItem(bpKey(),JSON.stringify(p));}catch(e){}}
let bAmmo0=0,bShots=0,bLevelStars=0,miceLeft=0,bNcol=4,riseCnt=0;
const RISE_EVERY=[10,8,7,5];
// ---- v1.3.0: el techo baja como en Panda Pop. Cada vez que fallas (disparo sin explotar) se acerca la subida;
// al llegar al límite entran DOS filas nuevas arriba (de a dos para conservar la geometría hexagonal) y con ellas
// llegan los ratoncitos que faltan por rescatar. ----
function miceOnBoard(){let n=0;grid.forEach(row=>row.forEach(b=>{if(b&&b.mouse)n++;}));return n;}
function bubbleRise(){const n=isLevels()?bubbleLevel:0,rows=[Array(COLS).fill(null),Array(COLS).fill(null)];
 for(let r=0;r<2;r++)for(let c=0;c<COLS;c++){if(r===1&&Math.random()<.1)continue;
  const b={color:ri(bNcol),mouse:false};if(r===1&&n>=3&&Math.random()<.06){b.kind='iron';b.color=IRON;}else if(r===1&&n>=5&&Math.random()<.1)b.kind='ice';rows[r][c]=b;}
 const k=miceLeft>0?Math.min(miceLeft,1+ri(2)):0;
 for(let i=0;i<k;i++){const pool=[];rows.forEach((row,r)=>row.forEach((b,c)=>{if(b&&b.color>=0&&!b.mouse&&!b.kind)pool.push(b);}));if(pool.length)pool[ri(pool.length)].mouse=true;}
 miceLeft-=k;grid=rows.concat(grid);const gone=grid.splice(ROWS+1,2);
 scrollOff=2*ROWH;riseCnt=0;SFX.fall();floats.push({x:240,y:TOP+90,txt:'⏫ ¡EL TECHO BAJA!'+(k?' 🐭×'+k:''),life:70,c:'#ff9f43'});
 return gone.some(row=>row.some(b=>b));}
const isLevels=()=>mode==='bubble'&&bubbleMode==='levels';
function levelStars(){const f=bAmmo0?ammo/bAmmo0:0;return f>=.4?3:f>=.15?2:1;}
function levelWon(){const p=bubbleProg();bLevelStars=levelStars();p.stars[bubbleLevel]=Math.max(p.stars[bubbleLevel]||0,bLevelStars);p.unlocked=Math.max(p.unlocked,Math.min(MAXLV,bubbleLevel+1));saveBubbleProg(p);
 score+=ammo*30+bLevelStars*500;}
// ---- mecánicas especiales ----
const matchable=b=>!!b&&b.kind!=='iron'&&b.kind!=='ice';
function crackIce(r,c){neigh(r,c).forEach(([a,b])=>{const n=grid[a][b];if(n&&n.kind==='ice'){n.kind=undefined;const p=cellPos(a,b);for(let k=0;k<6;k++)parts.push({x:p.x,y:p.y,vx:rnd(-3,3),vy:rnd(-3,2),life:rnd(18,30),c:'#bff3ff',s:rnd(2,3.5)});}});}
function specialBlast(x,y,rad){let n=0;for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++){if(!grid[r][c])continue;const p=cellPos(r,c);if((p.x-x)**2+(p.y-y)**2<=rad*rad)popCell(r,c,n++);}
 for(let k=0;k<22;k++)parts.push({x,y,vx:rnd(-5,5),vy:rnd(-5,5),life:rnd(20,36),c:['#ffd166','#ff9f43','#ff5d8f'][ri(3)],s:rnd(3,5)});floats.push({x,y:y-24,txt:'💣',life:50,c:'#ff9f43'});SFX.pop(7);}
function rowZap(r){const y=cellPos(r,0).y;let n=0;for(let c=0;c<COLS;c++)if(grid[r][c])popCell(r,c,n++);floats.push({x:240,y:y,txt:'⚡ ¡RAYO!',life:55,c:'#7fdcff'});for(let k=0;k<40;k++)parts.push({x:rnd(20,460),y:y+rnd(-8,8),vx:rnd(-2,2),vy:rnd(-2,2),life:rnd(15,30),c:'#d6f6ff',s:rnd(2,3.5)});SFX.pop(6);}
function nextShot(){bShots++;if(isLevels()&&bShots%9===0)return RAINBOW;return pickColor();}
// El disparo arcoíris toma el color vecino que forme el grupo más grande.
function resolveRainbow(r,c){let best=-1,bn=-1;const cols=new Set();neigh(r,c).forEach(([a,b])=>{const n=grid[a][b];if(matchable(n)&&n.color>=0)cols.add(n.color);});
 cols.forEach(col=>{grid[r][c]={color:col,mouse:false};const n=flood(r,c).length;if(n>bn){bn=n;best=col;}});
 if(best<0)best=ri(DIFF[diff].colors);grid[r][c]={color:best,mouse:false};}
// ---- dibujo de botones especiales ----
function drawSpecialBtn(x,y,ci,alpha){ctx.save();ctx.globalAlpha=alpha==null?1:alpha;
 if(ci===RAINBOW){const g=ctx.createConicGradient?ctx.createConicGradient(tick*.05,x,y):null;if(g){['#ff5d8f','#ffd166','#06d6a0','#4cc9ff','#9b5de5','#ff5d8f'].forEach((c,i)=>g.addColorStop(i/5,c));ctx.fillStyle=g;}else ctx.fillStyle='#ffd166';
  ctx.shadowColor='#fff';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,y,R-1.5,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.stroke();txt('🌈',x,y+7,'18px sans-serif','#fff');}
 else{const g=ctx.createRadialGradient(x-7,y-8,2,x,y,R);g.addColorStop(0,'#e9e9f2');g.addColorStop(.4,'#8d93a8');g.addColorStop(1,'#3b3f52');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R-1.5,0,TAU);ctx.fill();ctx.strokeStyle='#1d2030';ctx.lineWidth=2.5;ctx.stroke();
  ctx.fillStyle='#1d2030';[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(x+a*11,y+b*11,2.6,0,TAU);ctx.fill();});txt('🔩',x,y+7,'17px sans-serif','#fff');}
 ctx.restore();}
function drawCell(x,y,b,alpha){drawButton(x,y,b.color,b.mouse,alpha);
 if(!b.kind||b.kind==='iron')return;ctx.save();ctx.globalAlpha=alpha==null?1:alpha;
 if(b.kind==='ice'){ctx.fillStyle='rgba(190,240,255,.55)';ctx.beginPath();ctx.arc(x,y,R-.5,0,TAU);ctx.fill();ctx.strokeStyle='#e6fbff';ctx.lineWidth=2.5;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-9,y-3);ctx.lineTo(x-2,y-8);ctx.moveTo(x+4,y+9);ctx.lineTo(x+10,y+2);ctx.stroke();}
 else{const g=.6+.4*Math.sin(tick*.15);ctx.shadowColor=b.kind==='bomb'?'#ff9f43':'#7fdcff';ctx.shadowBlur=12*g;ctx.strokeStyle=b.kind==='bomb'?'#ffb35c':'#bff3ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,R-2,0,TAU);ctx.stroke();ctx.shadowBlur=0;txt(b.kind==='bomb'?'💣':'⚡',x,y+7,'16px sans-serif','#fff');}
 ctx.restore();}
// ---- mapa de niveles ----
function levelPos(i){const col=i%5,row=Math.floor(i/5);return{x:44+col*80,y:92+row*86,w:72,h:72};}
function drawLevelMap(){drawSky();drawFog(.15);drawFireflies();const pr=bubbleProg();
 txt('Mapa de niveles',240,44,'900 24px "Cinzel Decorative",Georgia,serif','#ffd166');txt('Dificultad: '+DIFF[diff].n+' · ⭐ '+Object.values(pr.stars).reduce((a,b)=>a+b,0)+'/'+MAXLV*3,240,70,'600 13px Quicksand,sans-serif','#8fe9c9');
 for(let i=0;i<MAXLV;i++){const n=i+1,p=levelPos(i),open=n<=pr.unlocked,st=pr.stars[n]||0,hv=open&&mouseX>p.x&&mouseX<p.x+p.w&&mouseY>p.y&&mouseY<p.y+p.h,cur=n===pr.unlocked;
  ctx.save();if(cur){ctx.shadowColor='#06d6a0';ctx.shadowBlur=10+8*Math.sin(tick*.08);}ctx.fillStyle=!open?'#150a22':hv?'#4a1d78':'#2a1346';rr(p.x,p.y,p.w,p.h,16);ctx.fill();ctx.strokeStyle=!open?'#3a2a50':cur?'#06d6a0':st?'#ffd166':'#9b5de5';ctx.lineWidth=cur?3.5:2.5;ctx.stroke();ctx.restore();
  if(open){txt(String(n),p.x+p.w/2,p.y+38,'900 26px Quicksand,sans-serif','#fff');txt('★'.repeat(st)+'☆'.repeat(3-st),p.x+p.w/2,p.y+62,'700 14px Quicksand,sans-serif','#ffd166');hits.push({x:p.x,y:p.y,w:p.w,h:p.h,id:'lv'+n});}
  else txt('🔒',p.x+p.w/2,p.y+46,'24px sans-serif','#fff');}
 if(pr.unlocked>=MAXLV&&pr.stars[MAXLV])txt('¡Campaña completa! Prueba el modo Sin fin',240,628,'700 14px Quicksand,sans-serif','#06d6a0');
 menuBtn('Volver',650,'back','#9b5de5');
 ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(440,44,18,0,TAU);ctx.fill();ctx.strokeStyle='#ffd166';ctx.lineWidth=2;ctx.stroke();txt('❓',440,50,'17px sans-serif','#fff');hits.push({x:422,y:26,w:36,h:36,id:'legend'});}
