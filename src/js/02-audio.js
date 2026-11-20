/* ================= AUDIO ================= */
let vols={music:1,voice:1,sfx:1};try{const v=JSON.parse(localStorage.getItem('coraline_vols')||'null');if(v)['music','voice','sfx'].forEach(k=>{if(typeof v[k]==='number')vols[k]=Math.max(0,Math.min(1,v[k]));});}catch(e){}
function saveVols(){try{localStorage.setItem('coraline_vols',JSON.stringify(vols));}catch(e){}}
let muted=false,actx=null,master=null,synthTimer=null,synthStep=0,desiredMusic=null,unlocked=false;
const VOICE_DATA={bienvenida:'@asset:audio/voices/bienvenida.mp3',victoria:'@asset:audio/voices/victoria.mp3',peligro:'@asset:audio/voices/peligro.mp3',poder:'@asset:audio/voices/poder.mp3'};
const DOOR_GREETING_DATA='@asset:audio/greetings/puerta-carolina.mp3';
const doorGreeting=new Audio(DOOR_GREETING_DATA);doorGreeting.preload='auto';doorGreeting.volume=vols.voice;
function playConfirmed(audio,onStart){
 if(muted||!audio)return;
 try{
  audio.pause();audio.currentTime=0;
  const p=audio.play();
  if(p&&p.then)p.then(()=>onStart()).catch(()=>{});
  else onStart();
 }catch(e){}
}
function playGeneralGreeting(){
 if(!profile||muted||profile.greetings.generalPlayed)return;
 const a=voices.bienvenida;if(!a||a._bad)return;
 playConfirmed(a,()=>{profile.greetings.generalPlayed=true;persistProfile();});
}
function playDoorGreeting(){
 if(!profile||muted||!isCarolinaProfile()||profile.greetings.carolinaDoorPlayed)return;
 playConfirmed(doorGreeting,()=>{profile.greetings.carolinaDoorPlayed=true;persistProfile();});
}
const voices={},music={};
['bienvenida','victoria','peligro','poder'].forEach(n=>{const a=new Audio(VOICE_DATA[n]||n+'.mp3');a.preload='auto';a.volume=vols.voice;a.addEventListener('error',()=>{a._bad=true});a.load();voices[n]=a;});
// Pistas locales incluidas en el ZIP. El menú y la pausa comparten End Credits.
// Música integrada dentro del HTML: no depende de rutas relativas ni de internet.
const MUSIC_FILES={intro:'@asset:audio/music/intro.mp3',partida:'@asset:audio/music/partida.mp3',pausa:'@asset:audio/music/pausa.mp3'};
[['intro',.4],['partida',.3],['pausa',.35]].forEach(([n,v])=>{const a=new Audio(MUSIC_FILES[n]);a.preload='auto';a.loop=true;a._base=v;a.volume=v*vols.music;
 a.addEventListener('error',()=>{a._bad=true;if(desiredMusic===n)startSynth(n);});a.load();music[n]=a;});
function ensureCtx(){if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();master=actx.createGain();master.gain.value=muted?0:1;master.connect(actx.destination);}catch(e){}}
 if(actx&&actx.state==='suspended')actx.resume();}
function applyVolumes(){Object.keys(music).forEach(n=>{music[n].volume=(MUSIC_VOL[n]||.35)*vols.music;});Object.values(voices).forEach(a=>{a.volume=vols.voice;});doorGreeting.volume=vols.voice;}
function playVoice(n){if(muted)return;const a=voices[n];if(!a||a._bad)return;try{a.currentTime=0;a.play().catch(()=>{});}catch(e){}}
const PAT={
 intro:{ms:560,n:[0,7,12,15,14,12,7,3,0,5,10,14,12,10,5,2],bass:[-12,-17]},
 partida:{ms:340,n:[12,15,19,15,14,17,21,17,12,15,19,22,21,19,15,14],bass:[-12,-9]},
 pausa:{ms:760,n:[0,null,7,null,12,null,11,null,7,null,3,null,5,null,null,null],bass:[-12,-12]}};
function bell(semi,vol,dur){if(!actx)return;const f=220*Math.pow(2,semi/12),t=actx.currentTime;
 [[1,'sine',1],[2,'triangle',.25],[3.01,'sine',.08]].forEach(([m,ty,g])=>{const o=actx.createOscillator(),e=actx.createGain();
  o.type=ty;o.frequency.value=f*m;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(vol*g,t+.006);e.gain.exponentialRampToValueAtTime(.0008,t+dur);
  o.connect(e);e.connect(master);o.start(t);o.stop(t+dur+.05);});}
function startSynth(kind){stopSynth();if(!unlocked)return;ensureCtx();if(!actx)return;synthStep=0;const p=PAT[kind];
 synthTimer=setInterval(()=>{const n=p.n[synthStep%p.n.length];if(n!=null)bell(n,.16*vols.music,1.5);
  if(synthStep%8===0)bell(p.bass[(synthStep>>3)%p.bass.length],.2*vols.music,2.6);synthStep++;},p.ms);}
function stopSynth(){if(synthTimer){clearInterval(synthTimer);synthTimer=null;}}
function setMusic(name){desiredMusic=name;if(appleMode){Object.values(music).forEach(a=>a.pause());stopSynth();syncApple();return;}Object.values(music).forEach(a=>{if(a!==music[name])a.pause();});stopSynth();
 if(!name||!unlocked)return;const a=music[name];
 if(a._bad){startSynth(name);return;}
 a.muted=muted;const pr=a.play();if(pr)pr.catch(e=>{if(e&&e.name==='NotAllowedError')return;a._bad=true;if(desiredMusic===name)startSynth(name);});}
function tone(f,d,type,vol,to){if(muted||!actx)return;const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain();
 o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);
 g.gain.setValueAtTime((vol||.15)*vols.sfx+.0001,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02);}
const SFX={shoot:()=>tone(520,.18,'triangle',.18,180),bounce:()=>tone(300,.08,'square',.06,220),stick:()=>tone(160,.12,'sine',.2,90),
 pop:i=>tone(500+i*60,.16,'sine',.16,900+i*60),fall:()=>tone(700,.4,'sine',.07,150),
 rescue:()=>{[784,988,1319,1568].forEach((f,i)=>setTimeout(()=>tone(f,.22,'triangle',.16),i*90));},
 ready:()=>{[660,880,1100].forEach((f,i)=>setTimeout(()=>tone(f,.3,'sine',.14),i*110));},
 lose:()=>{[330,262,196,147].forEach((f,i)=>setTimeout(()=>tone(f,.45,'triangle',.16),i*220));}};
function setMuted(m){muted=m;if(typeof syncConfig==='function')syncConfig();if(master)master.gain.value=m?0:1;Object.values(music).forEach(a=>a.muted=m);Object.values(voices).forEach(a=>{if(m)a.pause();});if(m){try{doorGreeting.pause();}catch(e){}}else if(typeof playGeneralGreeting==='function')playGeneralGreeting();}
function unlock(){unlocked=true;ensureCtx();setMusic(desiredMusic||'intro');}



