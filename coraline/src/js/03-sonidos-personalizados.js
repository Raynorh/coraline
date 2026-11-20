/* ================= SONIDOS PERSONALIZADOS (Configuración) ================= */
const SND_NAMES=['bienvenida','victoria','peligro','poder','intro','partida','pausa'],custom={};
const MUSIC_VOL={intro:.4,partida:.3,pausa:.35};
function makeVoice(n,src){const a=new Audio(src);a.preload='auto';a.volume=vols.voice;a.addEventListener('error',()=>{a._bad=true});voices[n]=a;}
function makeMusic(n,src){const was=music[n];if(was)was.pause();const a=new Audio(src);a.preload='auto';a.loop=true;a.volume=MUSIC_VOL[n]*vols.music;
 a.addEventListener('error',()=>{a._bad=true;if(desiredMusic===n&&!appleMode)startSynth(n);});a.load();music[n]=a;}
function applySound(n,blob){const url=URL.createObjectURL(blob);custom[n]=true;if(PAT[n]||MUSIC_VOL[n]){makeMusic(n,url);if(desiredMusic===n&&unlocked&&!appleMode)setMusic(n);}else makeVoice(n,url);}
function idb(){return new Promise((res,rej)=>{const q=indexedDB.open('coraline_snd',1);q.onupgradeneeded=()=>q.result.createObjectStore('s');q.onsuccess=()=>res(q.result);q.onerror=()=>rej();});}
async function idbPut(k,v){try{const d=await idb();d.transaction('s','readwrite').objectStore('s').put(v,k);}catch(e){}}
async function idbClear(){try{const d=await idb();d.transaction('s','readwrite').objectStore('s').clear();}catch(e){}}
async function idbLoad(){try{const d=await idb();const st=d.transaction('s').objectStore('s');SND_NAMES.forEach(n=>{const r=st.get(n);r.onsuccess=()=>{if(r.result){applySound(n,r.result);renderSettings();}};});}catch(e){}}
function matchName(f){f=f.toLowerCase().split('/').pop();if(f.startsWith('._'))return null;if(!f.endsWith('.mp3')&&!f.endsWith('.m4a')&&!f.endsWith('.wav')&&!f.endsWith('.ogg'))return null;return SND_NAMES.find(n=>f.includes(n))||null;}
async function readZip(buf){const dv=new DataView(buf),u8=new Uint8Array(buf);let e=buf.byteLength-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw 0;
 const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const out=[];
 for(let i=0;i<n;i++){if(dv.getUint32(p,true)!==0x02014b50)break;const m=dv.getUint16(p+10,true),cs=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true);
  const name=new TextDecoder().decode(u8.subarray(p+46,p+46+nl));p+=46+nl+el+cl;if(name.endsWith('/'))continue;
  const key=matchName(name);if(!key)continue;const ds=lo+30+dv.getUint16(lo+26,true)+dv.getUint16(lo+28,true),raw=u8.slice(ds,ds+cs);
  let blob;if(m===0)blob=new Blob([raw],{type:'audio/mpeg'});else if(m===8)blob=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();else continue;
  out.push([key,new Blob([blob],{type:'audio/mpeg'})]);}
 return out;}
function renderSettings(){document.getElementById('snd-list').innerHTML=SND_NAMES.map(n=>
 '<div class="row"><span>'+n+'.mp3</span><span class="'+(custom[n]?'ok':'def')+'">'+(custom[n]?'✅ personalizado':(VOICE_DATA[n]?'📦 incluido':(MUSIC_FILES[n]?'📦 pista local':'— (usa caja de música)')))+'</span><button data-p="'+n+'">▶</button></div>').join('');
 document.querySelectorAll('#snd-list button').forEach(b=>b.onclick=()=>{unlock();const n=b.dataset.p;const a=voices[n]||music[n];if(!a)return;try{if(voices[n]){a.currentTime=0;a.play();}else{if(a.paused){Object.values(music).forEach(x=>x.pause());a.currentTime=0;a.play().catch(()=>{});}else a.pause();}}catch(e){}});}
document.getElementById('snd-file').onchange=async e=>{const msg=document.getElementById('snd-msg');let got=[];
 try{for(const f of e.target.files){if(f.name.toLowerCase().endsWith('.zip'))got=got.concat(await readZip(await f.arrayBuffer()));else{const k=matchName(f.name);if(k)got.push([k,f]);}}}
 catch(err){msg.textContent='No pude leer ese .zip. Prueba con los .mp3 sueltos.';return;}
 got.forEach(([k,b])=>{applySound(k,b);idbPut(k,b);});msg.textContent=got.length?'✅ Cargados: '+got.map(g=>g[0]).join(', '):'No encontré sonidos con los nombres esperados.';renderSettings();e.target.value='';};
document.getElementById('snd-reset').onclick=async()=>{await idbClear();SND_NAMES.forEach(n=>{delete custom[n];});['bienvenida','victoria','peligro','poder'].forEach(n=>{makeVoice(n,VOICE_DATA[n]);voices[n].load();});['intro','partida','pausa'].forEach(n=>makeMusic(n,MUSIC_FILES[n]));document.getElementById('snd-msg').textContent='Sonidos originales restaurados.';renderSettings();if(unlocked)setMusic(desiredMusic);};
document.getElementById('settings-close').onclick=()=>{document.getElementById('settings').style.display='none';};
renderSettings();idbLoad();

