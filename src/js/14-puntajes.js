/* ================= PUNTAJES =================
   Modelo pensado para Supabase: cada registro lleva el UUID del perfil, el juego, el modo y la dificultad.
   Hoy se guarda en este navegador (coraline_scores_v3); ScoreStore es el único punto que habrá que cambiar
   cuando se conecte el ranking en línea. */
const GAMES={
 bubble:{n:'Burbujas',ico:'🫧',modes:{levels:'Niveles',endless:'Sin fin'}},
 tetris:{n:'Tetris',ico:'🧱',modes:{rescue:'Rescate',classic:'Clásico'}},
 blocks:{n:'Bloques',ico:'🔷',modes:{classic:'Clásico'}},
 snake:{n:'Snake',ico:'🐍',modes:{walls:'Con paredes',wrap:'Sin paredes'}},
 kong:{n:'Aventura',ico:'🌲',modes:{story:'Aventura'}},
 runner:{n:'Corredor',ico:'🏃',modes:{endless:'Sin fin'}}};
const DIFF_NAMES={facil:'Fácil',normal:'Normal',dificil:'Difícil',experto:'Experto'};
// Modo de juego actual (clave estable que se guarda junto al puntaje).
function modeKey(){return mode==='bubble'?(bubbleMode==='endless'?'endless':'levels'):mode==='tetris'?tetrisMode:mode==='snake'?(snakeWrap?'wrap':'walls'):mode==='blocks'?'classic':mode==='kong'?'story':'endless';}
const ScoreStore={
 KEY:'coraline_scores_v3',
 all(){try{const l=JSON.parse(localStorage.getItem(this.KEY)||'[]');return Array.isArray(l)?l:[];}catch(e){return [];}},
 save(l){try{localStorage.setItem(this.KEY,JSON.stringify(l.slice(-3000)));}catch(e){}},
 add(e){const l=this.all();l.push(e);this.save(l);return e;},
 // Mejor puntaje de cada perfil en un juego/modo (y dificultad opcional), de mayor a menor.
 top(game,m,d,limit){const best=new Map();this.all().forEach(e=>{if(e.game!==game||e.mode!==m||(d&&d!=='all'&&e.diff!==d))return;const b=best.get(e.profileId);if(!b||e.score>b.score)best.set(e.profileId,e);});
  return [...best.values()].sort((a,b)=>b.score-a.score||String(a.createdAt).localeCompare(String(b.createdAt))).slice(0,limit||10);},
 best(profileId,game,m){return this.all().reduce((mx,e)=>(e.profileId===profileId&&e.game===game&&e.mode===m)?Math.max(mx,e.score):mx,0);},
 // Posición entre todos los perfiles guardados en este dispositivo (el ranking global llegará con Supabase).
 rank(profileId,game,m){const t=this.top(game,m,'all',9999),i=t.findIndex(e=>e.profileId===profileId);return i<0?null:{pos:i+1,total:t.length};}};
const scoreBest=(p,g,m)=>ScoreStore.best(p,g,m),scoreRank=(p,g,m)=>ScoreStore.rank(p,g,m);
// Migración no destructiva v2 → v3 (coraline_scores y coraline_scores_v2 se conservan intactos).
function migrateScoresV3(){try{if(localStorage.getItem('coraline_scores_migrated_v3')==='1')return;
 let v2=[];try{v2=JSON.parse(localStorage.getItem('coraline_scores_v2')||'[]');}catch(e){}if(!Array.isArray(v2))v2=[];
 const map={'Burbujas':['bubble','levels'],'Burbujas sin fin':['bubble','endless'],'Tetris':['tetris','rescue'],'Tetris Rescate':['tetris','rescue'],'Tetris Clásico':['tetris','classic'],'Bloques':['blocks','classic'],'Snake':['snake','walls'],'Snake sin paredes':['snake','wrap']};
 const l=ScoreStore.all(),seen=new Set(l.map(e=>e.legacyKey).filter(Boolean));
 v2.forEach(v=>{if(!v||typeof v!=='object')return;const m=map[v.mode];if(!m)return;const lk=[v.profileId,v.name,v.score,v.mode,v.date].join('|');if(seen.has(lk))return;seen.add(lk);
  l.push({id:newId(),profileId:v.profileId||LEGACY_PROFILE_ID,nickname:String(v.name||'Jugador').slice(0,18),game:m[0],mode:m[1],diff:'normal',score:Number(v.score)||0,level:null,createdAt:'',dateLabel:String(v.date||''),legacyKey:lk});});
 ScoreStore.save(l);localStorage.setItem('coraline_scores_migrated_v3','1');}catch(e){}}
migrateScoresV3();
function recordScore(extra){if(scoreRecorded)return;scoreRecorded=true;const sc=Math.floor(Number(score)||0);if(sc<=0)return;
 ScoreStore.add(Object.assign({id:newId(),profileId:profile?profile.id:LEGACY_PROFILE_ID,nickname:profile?profile.nickname:'Jugador',game:mode,mode:modeKey(),diff:diff,score:sc,level:null,createdAt:new Date().toISOString()},extra||{}));}
function modeLabel(){const G=GAMES[mode];return G?G.n+' · '+G.modes[modeKey()]:mode;}
// Texto de la pantalla de derrota según el modo.
function loseLines(){
 const pts='⭐ '+Math.floor(score).toLocaleString('es-CL')+' puntos';
 if(mode==='snake'||mode==='blocks')return[pts];
 if(mode==='tetris'&&tetrisMode==='classic')return[pts,'📏 '+tlines+' líneas · nivel '+tlevel];
 if(mode==='tetris')return['Rescataste '+savedTotal+' ratoncitos en total',pts];
 if(mode==='bubble'&&bubbleMode==='endless')return['Rescataste '+savedTotal+' ratoncitos en total',pts];
 if(mode==='bubble')return['Nivel '+bubbleLevel+' · rescataste '+rescued+' de '+bMice+' ratoncitos',pts];
 if(mode==='kong')return['Nivel '+kLevelNo+' · 🐱 '+kCats+' gatitos en este nivel · 🐭 '+kMice+' ratoncitos rescatados',pts];
 if(mode==='runner')return[Math.floor(rDist)+' m recorridos · '+rButtons+' botones · zona '+rStage,pts];
 return[pts];}
