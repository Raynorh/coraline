/* ================= APPLE MUSIC (reproductor incrustado, requiere internet) ================= */
const APPLE={intro:['End Credits','https://embed.music.apple.com/cl/song/end-credits/1762897094'],game:['Exploration','https://embed.music.apple.com/cl/song/exploration/1762897623']};
let appleMode=false,appleLoaded=null;const drawer=document.getElementById('music-drawer'),mframe=document.getElementById('music-frame');
function appleCtx(){return (state==='menu'||state==='splash'||state==='select')?'intro':'game';}
function openApple(){appleMode=true;stopSynth();Object.values(music).forEach(a=>a.pause());syncApple(true);drawer.classList.add('open');}
function syncApple(force){if(!appleMode)return;const k=appleCtx();document.getElementById('music-title').textContent='♪ '+APPLE[k][0]+' — pulsa ▶ y luego "Ocultar" para jugar (el juego espera con el panel abierto)';
 if(appleLoaded!==k){mframe.src=APPLE[k][1];appleLoaded=k;if(!force)drawer.classList.add('open');}}
function closeApple(){appleMode=false;appleLoaded=null;mframe.src='about:blank';drawer.classList.remove('open');setMusic(desiredMusic);}
document.getElementById('music-hide').onclick=()=>drawer.classList.remove('open');
document.getElementById('music-off').onclick=closeApple;

