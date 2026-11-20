/* ================= PANELES (HTML): configuración, perfil, puntajes ================= */
const $=id=>document.getElementById(id),showPanel=(id,on)=>{$(id).style.display=on?'block':'none';};
// ---- Configuración ----
function syncConfig(){const b=$('cfg-mute');if(!b)return;b.textContent=muted?'🔇 Silenciado':'🔊 Activado';
 ['music','voice','sfx'].forEach(k=>{$('vol-'+k).value=Math.round(vols[k]*100);$('vol-'+k+'-n').textContent=Math.round(vols[k]*100)+'%';});}
function openConfig(){syncConfig();showPanel('config',true);}
$('config-close').onclick=()=>showPanel('config',false);
$('cfg-mute').onclick=()=>{setMuted(!muted);syncConfig();};
['music','voice','sfx'].forEach(k=>{$('vol-'+k).oninput=e=>{vols[k]=e.target.value/100;saveVols();applyVolumes();syncConfig();};
 $('vol-'+k).onchange=()=>{if(k==='sfx')SFX.pop(2);};});
$('cfg-apple').onclick=()=>{showPanel('config',false);unlock();openApple();};
$('cfg-sounds').onclick=()=>{showPanel('config',false);showPanel('settings',true);renderSettings();};
$('settings-close').onclick=()=>{showPanel('settings',false);openConfig();};
// ---- Puntajes por juego y modo ----
let scGame='bubble',scMode='levels',scDiff='all';
function openScores(){if(GAMES[mode]){scGame=mode;scMode=modeKey();}renderScores();showPanel('scores-panel',true);}
function renderScores(){const G=GAMES[scGame];if(!G.modes[scMode])scMode=Object.keys(G.modes)[0];
 $('scores-tabs').innerHTML=Object.keys(GAMES).map(g=>'<button class="chip'+(g===scGame?' on':'')+'" data-g="'+g+'" type="button">'+GAMES[g].ico+' '+GAMES[g].n+'</button>').join('');
 $('scores-modes').innerHTML=Object.keys(G.modes).map(m=>'<button class="chip'+(m===scMode?' on':'')+'" data-m="'+m+'" type="button">'+G.modes[m]+'</button>').join('')+
  '<br>'+['all','facil','normal','dificil','experto'].map(d=>'<button class="chip'+(d===scDiff?' on':'')+'" data-d="'+d+'" type="button">'+(d==='all'?'Todas':DIFF_NAMES[d])+'</button>').join('');
 const top=ScoreStore.top(scGame,scMode,scDiff,10);
 let html=top.length?top.map((e,i)=>'<div class="sc-row'+(profile&&e.profileId===profile.id?' me':'')+'"><span class="pos">'+(i+1)+'</span><span class="nm">'+esc(e.nickname)+'</span><span class="pt">'+e.score.toLocaleString('es-CL')+'</span><span class="mt">'+(DIFF_NAMES[e.diff]||'')+(e.level?' · N'+e.level:'')+'</span></div>').join(''):'<p class="muted">Todavía no hay puntajes en este modo. ¡Juega una partida!</p>';
 if(profile){const b=ScoreStore.best(profile.id,scGame,scMode),r=ScoreStore.rank(profile.id,scGame,scMode);html+='<p class="muted" style="margin-top:10px">Tu mejor aquí: <b style="color:#ffd166">'+(b?b.toLocaleString('es-CL'):'—')+'</b>'+(r?' · posición #'+r.pos+' de '+r.total:'')+'</p>';}
 $('scores-body').innerHTML=html;}
$('scores-panel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.g){scGame=b.dataset.g;scMode=Object.keys(GAMES[scGame].modes)[0];renderScores();}else if(b.dataset.m){scMode=b.dataset.m;renderScores();}else if(b.dataset.d){scDiff=b.dataset.d;renderScores();}});
function showScores(){openScores();}
$('scores-close').onclick=()=>showPanel('scores-panel',false);
// ---- Perfil ----
function openProfileView(){if(!profile){openProfiles();return;}
 const rows=[];Object.keys(GAMES).forEach(g=>Object.keys(GAMES[g].modes).forEach(m=>{const b=ScoreStore.best(profile.id,g,m),r=b?ScoreStore.rank(profile.id,g,m):null;
  rows.push('<div class="pv-row"><span>'+GAMES[g].ico+' '+GAMES[g].n+' · '+GAMES[g].modes[m]+'</span><span>'+(b?b.toLocaleString('es-CL'):'—')+'</span><span class="pv-pos">'+(r?'#'+r.pos+' de '+r.total:'')+'</span></div>');}));
 const created=profile.createdAt?new Date(profile.createdAt).toLocaleDateString('es-CL'):'';
 $('pv-body').innerHTML='<div class="pv-name">👤 '+esc(profile.nickname)+'</div><div class="pv-sub">'+(created?'Jugando desde '+created:'')+'</div>'+
  (isCarolinaProfile()?'<div class="pv-badge">💛 Perfil especial activo</div>':'')+
  '<h3 style="color:#06d6a0;margin:12px 0 4px;font-size:15px">Mis mejores puntajes</h3>'+rows.join('')+
  '<p class="muted" style="margin-top:8px">La posición se calcula entre los jugadores de este dispositivo. El ranking global en línea se activará cuando conectemos Supabase.</p>';
 $('pv-special').style.display=isCarolinaProfile()?'none':'block';showPanel('profile-view',true);}
$('pv-close').onclick=()=>showPanel('profile-view',false);
$('pv-switch').onclick=()=>{showPanel('profile-view',false);openProfiles();};
// Perfil especial: se asocia por el UUID interno de ESTE perfil, nunca por el apodo.
$('pv-special').onclick=()=>{if(!profile)return;if(!confirm('¿Este perfil es el de Carolina? Se activará su saludo especial al abrir la puerta (una sola vez).'))return;
 try{localStorage.setItem('coraline_carolina_id',profile.id);}catch(e){}openProfileView();};
