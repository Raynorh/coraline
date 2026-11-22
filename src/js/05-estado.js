/* ================= ESTADO ================= */
let mode='bubble',diff='normal',aiming=false,state='splash',grid,cur,nxt,ammo,score,rescued,stone,armed,proj,falling,parts,floats,jumpers,aim=-Math.PI/2,mouseX=CX,mouseY=0;
let savedTotal=0,bomb=0,bombArmed=false,bubbleSec=1,scrollOff=0,loseT=0;
let scoreRecorded=false,banner={who:'',txt:'',t:0},endTimer=null,warned=false,fade=0,ready100=false,tick=0,combo=0;
const hits=[]; // regiones clicables
const fireflies=Array.from({length:28},()=>({x:rnd(0,W),y:rnd(200,H),p:rnd(0,TAU),s:rnd(.15,.5)}));
const stars=Array.from({length:70},()=>({x:rnd(0,W),y:rnd(0,420),r:rnd(.4,1.4),p:rnd(0,TAU)}));
const fogs=Array.from({length:6},(_,i)=>({x:rnd(0,W),y:380+i*55,r:rnd(110,180),s:rnd(.1,.35)*(i%2?1:-1)}));

// v0.8.0: cuatro niveles. 'normal'/'dificil'/'experto' conservan los valores que antes tenían 'facil'/'normal'/'dificil'.
// sv = intervalo de paso de Snake (ms), ramp = cuánto acelera Tetris por nivel (ms).
const DIFF={
 facil:{n:'Fácil',ammo:34,colors:4,rows:3,t:1300,garb:3,rise:0,sv:280,ramp:30},
 normal:{n:'Normal',ammo:30,colors:4,rows:4,t:900,garb:4,rise:0,sv:180,ramp:55},
 dificil:{n:'Difícil',ammo:25,colors:5,rows:5,t:650,garb:6,rise:18,sv:125,ramp:55},
 experto:{n:'Experto',ammo:20,colors:5,rows:6,t:420,garb:8,rise:10,sv:85,ramp:55}};
const DIFF_KEYS=['facil','normal','dificil','experto'];
function dIdx(){return Math.max(0,DIFF_KEYS.indexOf(diff));}
// Migración única de la preferencia guardada (los nombres cambiaron de significado en v0.8.0).
try{if(localStorage.getItem('cor_diff_v2')!=='1'){const old=localStorage.getItem('cor_diff');const map={facil:'normal',normal:'dificil',dificil:'experto'};if(map[old])localStorage.setItem('cor_diff',map[old]);localStorage.setItem('cor_diff_v2','1');}}catch(e){}
try{const m=localStorage.getItem('cor_mode'),d=localStorage.getItem('cor_diff');if(['tetris','bubble','blocks','snake','kong','runner','runner3d'].includes(m))mode=m;if(DIFF[d])diff=d;}catch(e){}
function saveSel(){try{localStorage.setItem('cor_mode',mode);localStorage.setItem('cor_diff',diff);}catch(e){}}
let blocksStyle='rounded',profile=null,snakeWrap=false,snakeCtl='',tetrisMode='rescue',bubbleMode='levels',bubbleLevel=1,bMice=6;
let lastPtr='mouse';const IS_TOUCH=(window.matchMedia&&matchMedia('(pointer: coarse)').matches)||('ontouchstart' in window);
function prefsObj(){return{blocksStyle,snakeWrap,snakeCtl,tetrisMode,bubbleMode};}
function savePrefs(){if(profile)persistProfile();else{try{localStorage.setItem('cor_blocks_style',blocksStyle);localStorage.setItem('cor_snake_wrap',snakeWrap?'1':'0');localStorage.setItem('cor_tetris_mode',tetrisMode);localStorage.setItem('cor_bubble_mode',bubbleMode);localStorage.setItem('cor_snake_ctl',snakeCtl);}catch(e){}}}
const LEGACY_PROFILE_ID='00000000-0000-4000-8000-000000000001';
// Identidad interna de Carolina. No se infiere por apodo.
// Permanece vacía hasta confirmar el perfil auténtico; también se lee coraline_carolina_id.
const CAROLINA_ID='';
function newId(){if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,ch=>{const r=Math.random()*16|0;return (ch==='x'?r:(r&3|8)).toString(16);});}
function loadProfiles(){try{const l=JSON.parse(localStorage.getItem('coraline_profiles')||'[]');return Array.isArray(l)?l:[];}catch(e){return [];}}
function makeProfile(nickname){return {id:newId(),nickname:nickname,createdAt:new Date().toISOString(),preferences:{blocksStyle:'rounded'},greetings:{generalPlayed:false,carolinaDoorPlayed:false}};}
function persistProfile(){if(!profile)return;profile.preferences=Object.assign(profile.preferences||{},prefsObj());if(!profile.greetings)profile.greetings={generalPlayed:false,carolinaDoorPlayed:false};const list=loadProfiles();const i=list.findIndex(p=>p.id===profile.id);if(i>=0)list[i]=profile;else list.push(profile);try{localStorage.setItem('coraline_profiles',JSON.stringify(list));localStorage.setItem('coraline_profile',profile.id);localStorage.setItem('cor_blocks_style',blocksStyle);localStorage.setItem('cor_snake_wrap',snakeWrap?'1':'0');localStorage.setItem('cor_tetris_mode',tetrisMode);localStorage.setItem('cor_bubble_mode',bubbleMode);}catch(e){}}
function carolinaId(){if(CAROLINA_ID)return CAROLINA_ID;try{return localStorage.getItem('coraline_carolina_id')||'';}catch(e){return '';}}
function isCarolinaProfile(){const id=carolinaId();return !!(profile&&id&&profile.id===id);}
function applyProfile(p){profile=p;if(!profile.preferences)profile.preferences={blocksStyle:'rounded'};if(!profile.greetings)profile.greetings={generalPlayed:false,carolinaDoorPlayed:false};const pf=profile.preferences;blocksStyle=pf.blocksStyle==='square'?'square':'rounded';snakeWrap=!!pf.snakeWrap;tetrisMode=pf.tetrisMode==='classic'?'classic':'rescue';bubbleMode=(pf.bubbleMode==='endless'||pf.bubbleMode==='rescue')?'endless':'levels';snakeCtl=pf.snakeCtl==='swipe'?'swipe':'';}
function migrateScores(){const flag='coraline_scores_migrated_v1';try{if(localStorage.getItem(flag)==='1')return;let list=[];try{list=JSON.parse(localStorage.getItem('coraline_scores')||'[]');}catch(e){list=[];}if(!Array.isArray(list))list=[];let v2=[];try{v2=JSON.parse(localStorage.getItem('coraline_scores_v2')||'[]');}catch(e){v2=[];}if(!Array.isArray(v2))v2=[];const key=s=>[s.profileId,s.name,s.score,s.mode,s.date].join('|');const seen=new Set(v2.map(key));list.forEach(v=>{if(!v||typeof v!=='object')return;const row={profileId:LEGACY_PROFILE_ID,name:String(v.name||'Jugador').slice(0,18),score:Number(v.score)||0,mode:String(v.mode||'Burbujas'),date:String(v.date||'')};const k=key(row);if(!seen.has(k)){v2.push(row);seen.add(k);}});localStorage.setItem('coraline_scores_v2',JSON.stringify(v2));localStorage.setItem(flag,'1');}catch(e){}}
function bootProfile(){migrateScores();try{const saved=localStorage.getItem('cor_blocks_style');if(saved==='square'||saved==='rounded')blocksStyle=saved;snakeWrap=localStorage.getItem('cor_snake_wrap')==='1';tetrisMode=localStorage.getItem('cor_tetris_mode')==='classic'?'classic':'rescue';{const bm=localStorage.getItem('cor_bubble_mode');bubbleMode=(bm==='endless'||bm==='rescue')?'endless':'levels';}const id=localStorage.getItem('coraline_profile');const found=loadProfiles().find(p=>p.id===id);if(found)applyProfile(found);}catch(e){}}
function renderProfiles(){const box=document.getElementById('profile-list');const list=loadProfiles();box.innerHTML=list.map(p=>'<button type="button" class="'+(profile&&profile.id===p.id?'on':'')+'" data-id="'+p.id+'">'+esc(p.nickname||'Jugador')+(profile&&profile.id===p.id?' · actual':'')+'</button>').join('')||'<p>Crea tu primer perfil.</p>';box.querySelectorAll('button').forEach(b=>b.onclick=()=>{const next=loadProfiles().find(p=>p.id===b.dataset.id);if(!next)return;applyProfile(next);persistProfile();document.getElementById('profiles').style.display='none';playGeneralGreeting();});}
function openProfiles(){renderProfiles();document.getElementById('profiles').style.display='block';}
function createNamedProfile(){const nick=(document.getElementById('profile-name').value||'').trim().slice(0,18)||'Jugador';if(profile)persistProfile();applyProfile(makeProfile(nick));persistProfile();document.getElementById('profile-name').value='';document.getElementById('profiles').style.display='none';playGeneralGreeting();}
bootProfile();
document.getElementById('profile-create').onclick=createNamedProfile;
document.getElementById('profile-close').onclick=()=>{if(!profile)return;document.getElementById('profiles').style.display='none';};
document.getElementById('scores-close').onclick=()=>{document.getElementById('scores-panel').style.display='none';};
const cellPos=(r,c)=>({x:12+R+c*2*R+(r%2?R:0),y:TOP+R+r*ROWH});
function neigh(r,c){const o=r%2,d=[[0,-1],[0,1],[-1,o?0:-1],[-1,o?1:0],[1,o?0:-1],[1,o?1:0]],out=[];
 d.forEach(([dr,dc])=>{const rr=r+dr,cc=c+dc;if(rr>=0&&rr<=ROWS&&cc>=0&&cc<COLS)out.push([rr,cc]);});return out;}

function say(who,txt,ms){banner={who,txt,t:ms||3200};}
function buildBubbleGrid(sec){const D=DIFF[diff],endless=bubbleMode==='endless';
 const rows=Math.min(ROWS-5,D.rows+(endless?Math.min(3,sec-1):0)),ncol=Math.min(7,D.colors+(endless&&sec>2?1:0));
 const g=Array.from({length:ROWS+1},()=>Array(COLS).fill(null));
 for(let r=0;r<rows;r++)for(let c=0;c<COLS;c++)g[r][c]={color:ri(ncol),mouse:false};
 const cells=[];for(let r=0;r<3;r++)for(let c=0;c<COLS;c++)cells.push([r,c]);
 bMice=Math.min(12,6+(endless?sec-1:0));bNcol=ncol;riseCnt=0;const m0=Math.ceil(bMice/2);
 for(let i=0;i<m0;i++){const k=ri(cells.length),[r,c]=cells.splice(k,1)[0];g[r][c].mouse=true;}
 miceLeft=bMice-m0;
 return g;}
function newGame(){
 bubbleSec=1;savedTotal=0;bomb=0;bombArmed=false;scrollOff=0;bShots=0;riseCnt=0;grid=buildBubbleGrid(1);
 ammo=DIFF[diff].ammo;if(isLevels()){const L=levelDef(bubbleLevel);grid=buildLevelGrid(L);bMice=L.mice;ammo=L.ammo;bAmmo0=ammo;riseCnt=0;}
 score=0;rescued=0;stone=isLevels()?0:50;armed=false;proj=null;falling=[];parts=[];floats=[];jumpers=[];warned=false;ready100=false;combo=0;
 cur=pickColor();nxt=pickColor();clearTimeout(endTimer);endTimer=null;
 say('Coraline',isLevels()?'Nivel '+bubbleLevel+': rescata '+bMice+' ratoncitos'+(bubbleLevel>=3?'. ¡Cuidado con los botones de hierro, hielo y las bombas!':'.'):'Hola, soy Coraline Jones. Necesito tu ayuda para encontrar todos los ratoncitos del Señor Bobinsky.',5200);
}
function colorsPresent(){const seen=new Set();if(grid)grid.forEach(row=>row.forEach(b=>{if(b&&b.color>=0)seen.add(b.color);}));return seen;}
function pickColor(){
 // Solo colores que siguen en el tablero. Si el tablero quedó vacío, usa la paleta de la dificultad.
 const counts=Array(7).fill(0),mice=Array(7).fill(0);
 if(grid)grid.forEach(row=>row.forEach(b=>{if(b){counts[b.color]++;if(b.mouse)mice[b.color]++;}}));
 const present=[];counts.forEach((n,c)=>{if(n)present.push(c);});
 const pool=present.length?present:Array.from({length:DIFF[diff].colors},(_,i)=>i);
 const choices=pool.map(c=>{const n=counts[c];const w=n?Math.pow(n,[1.25,1.18,1.02,.88][dIdx()])+mice[c]*[5,4,2.6,1.6][dIdx()]:1;return {c,w};});
 const total=choices.reduce((s,o)=>s+o.w,0)||1;let roll=Math.random()*total;
 for(const o of choices){roll-=o.w;if(roll<=0)return o.c;}return choices[0].c;
}
function syncLauncher(){const present=colorsPresent();if(!present.size)return;if(cur!==RAINBOW&&!present.has(cur))cur=pickColor();if(nxt!==RAINBOW&&!present.has(nxt))nxt=pickColor();}
function startPlay(){if(mode==='bubble'&&bubbleMode==='levels'&&bubbleLevel>=3){try{if(!localStorage.getItem('cor_legend_seen'))setTimeout(openLegend,400);}catch(e){}}
 scoreRecorded=false;unlock();kKeys={};kTouch.l=kTouch.r=kTouch.j=kTouch.c=0;kHold.clear();if(mode==='kong')kNew();else if(mode==='runner')rNew();else if(mode==='runner3d')pNew();else if(mode==='tetris')tNew();else if(mode==='blocks')bNew();else if(mode==='snake')sNew();else newGame();state='play';fade=1;setMusic('partida');setPowerBtns(true);updateStoneBtn();}
function setPowerBtns(on){const showStone=on&&(mode==='bubble'||(mode==='tetris'&&tetrisMode==='rescue'));stoneBtn.style.display=showStone?'block':'none';bombBtn.style.display=(on&&mode==='bubble')?'block':'none';}
function toMenu(){state='menu';setPowerBtns(false);setMusic('intro');}

