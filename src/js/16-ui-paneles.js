/* ================= PANELES (HTML): configuración, perfil, puntajes ================= */
const $=id=>document.getElementById(id),showPanel=(id,on)=>{$(id).style.display=on?'block':'none';};
// ---- Configuración ----
function syncConfig(){const b=$('cfg-mute');if(!b)return;b.textContent=muted?'🔇 Silenciado':'🔊 Activado';
 ['music','voice','sfx'].forEach(k=>{$('vol-'+k).value=Math.round(vols[k]*100);$('vol-'+k+'-n').textContent=Math.round(vols[k]*100)+'%';});}
function sbStatusText(){if(!SB.on())return'Sin conectar: los puntajes se guardan solo en este dispositivo.';const q=SB.queue().length,s=SB.status;
 return s.startsWith('err:')?'⚠️ No se pudo conectar ('+s.slice(4,90)+'). '+q+' puntajes en espera; se reintenta solo.':'✅ Conectado. '+(q?q+' puntajes por enviar…':'Todo sincronizado.');}
function openConfig(){syncConfig();const c=SB.cfg(),fixed=!!(SB_CONF.url&&SB_CONF.key);$('sb-url').value=c.url;$('sb-key').value=c.key;$('sb-fields').style.display=(!fixed&&location.hash==='#nube')?'block':'none';// los campos solo se ven con #nube y sin conexión integrada
 if(fixed){$('sb-status').textContent='☁️ Comprobando…';SB.ping().then(r=>{SB.status=r==='ok'?'ok':r;$('sb-status').textContent=r==='ok'?'☁️ Conectado':'⚠️ Sin conexión (se reintentará solo)';});}
 else $('sb-status').textContent=sbStatusText();showPanel('config',true);}
$('sb-save').onclick=async()=>{try{localStorage.setItem('cor_sb_conf',JSON.stringify({url:$('sb-url').value.trim(),key:$('sb-key').value.trim()}));localStorage.removeItem('cor_sb_backfill');}catch(e){}
 if(!SB.on()){$('sb-status').textContent='La URL debe verse como https://xxxx.supabase.co y la clave debe estar completa.';return;}
 $('sb-status').textContent='Probando conexión…';const r=await SB.ping();if(r==='ok'){SB.status='ok';SB.backfill();SB.flush();$('sb-status').textContent='✅ Conexión correcta. Tus puntajes se comparten desde ahora.';}
 else{SB.status=r;$('sb-status').textContent='⚠️ No funcionó: '+r.slice(4,140)+' (¿ya ejecutaste el SQL de docs/supabase_setup_v1.3.sql?)';}};
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
let sbLoadKey='';
function renderScores(fetchRemote){const G=GAMES[scGame];if(!G.modes[scMode])scMode=Object.keys(G.modes)[0];
 $('scores-tabs').innerHTML=Object.keys(GAMES).map(g=>'<button class="chip'+(g===scGame?' on':'')+'" data-g="'+g+'" type="button">'+GAMES[g].ico+' '+GAMES[g].n+'</button>').join('');
 $('scores-modes').innerHTML=Object.keys(G.modes).map(m=>'<button class="chip'+(m===scMode?' on':'')+'" data-m="'+m+'" type="button">'+G.modes[m]+'</button>').join('')+
  '<br>'+['all','facil','normal','dificil'].map(d=>'<button class="chip'+(d===scDiff?' on':'')+'" data-d="'+d+'" type="button">'+(d==='all'?'Todas':DIFF_NAMES[d])+'</button>').join('');
 let top=ScoreStore.top(scGame,scMode,scDiff,10),src=SB.on()?'wait':'local';const rk=scGame+'|'+scMode+'|'+scDiff;
 if(SB.on()){if(SB.cache[rk]){top=SB.cache[rk];src='cloud';}
  if(fetchRemote!==false&&sbLoadKey!==rk){sbLoadKey=rk;SB.flush().then(()=>SB.top(scGame,scMode,scDiff)).then(r=>{sbLoadKey='';if($('scores-panel').style.display==='block')renderScores(false);if(!r)SB.cache[rk]=SB.cache[rk];});}
  else if(!SB.cache[rk]&&SB.status.startsWith('err:'))src='off';}
 let html='<p class="muted" style="margin:0 0 6px;text-align:center">'+(src==='cloud'?'☁️ Ranking compartido (todos los jugadores)':src==='wait'?'☁️ Cargando ranking compartido… (mientras, este dispositivo)':src==='off'?'⚠️ Sin conexión: mostrando este dispositivo':'📱 Solo este dispositivo · conecta Supabase en ⚙️ Configuración')+'</p>';
 html+=top.length?top.map((e,i)=>'<div class="sc-row'+(profile&&e.profileId===profile.id?' me':'')+'"><span class="pos">'+(i+1)+'</span><span class="nm">'+(e.special?'💛 ':'')+esc(e.nickname)+'</span><span class="pt">'+e.score.toLocaleString('es-CL')+'</span><span class="mt">'+(DIFF_NAMES[e.diff]||'')+(e.level?' · N'+e.level:'')+'</span></div>').join(''):'<p class="muted">Todavía no hay puntajes en este modo. ¡Juega una partida!</p>';
 if(profile){const b=ScoreStore.best(profile.id,scGame,scMode),r=ScoreStore.rank(profile.id,scGame,scMode);html+='<p class="muted" style="margin-top:10px">Tu mejor aquí: <b style="color:#ffd166">'+(b?b.toLocaleString('es-CL'):'—')+'</b>'+(r?' · posición #'+r.pos+' de '+r.total:'')+'</p>';}
 $('scores-body').innerHTML=html;}
$('scores-panel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.g){scGame=b.dataset.g;scMode=Object.keys(GAMES[scGame].modes)[0];renderScores();}else if(b.dataset.m){scMode=b.dataset.m;renderScores();}else if(b.dataset.d){scDiff=b.dataset.d;renderScores();}});
function showScores(){openScores();}
$('scores-close').onclick=()=>showPanel('scores-panel',false);
// ---- Leyenda de poderes ----
function openLegend(){showPanel('legend',true);try{localStorage.setItem('cor_legend_seen','1');}catch(e){}}
$('legend-close').onclick=()=>showPanel('legend',false);
// ---- Perfil ----
function openProfileView(){if(!profile){openProfiles();return;}
 const rows=[];Object.keys(GAMES).forEach(g=>Object.keys(GAMES[g].modes).forEach(m=>{const b=ScoreStore.best(profile.id,g,m),r=b?ScoreStore.rank(profile.id,g,m):null;
  rows.push('<div class="pv-row"><span>'+GAMES[g].ico+' '+GAMES[g].n+' · '+GAMES[g].modes[m]+'</span><span>'+(b?b.toLocaleString('es-CL'):'—')+'</span><span class="pv-pos">'+(r?'#'+r.pos+' de '+r.total:'')+'</span></div>');}));
 const created=profile.createdAt?new Date(profile.createdAt).toLocaleDateString('es-CL'):'';
 $('pv-body').innerHTML='<div class="pv-name">👤 '+esc(profile.nickname)+'</div><div class="pv-sub">'+(created?'Jugando desde '+created:'')+'</div>'+
  (isCarolinaProfile()?'<div class="pv-badge">💛 Perfil especial activo</div>':'')+
  '<h3 style="color:#06d6a0;margin:12px 0 4px;font-size:15px">Mis mejores puntajes</h3>'+rows.join('')+
  '<p class="muted" style="margin-top:8px">'+(SB.on()?'Tus puntajes se envían al ranking compartido (☁️ Puntajes → ver todos los jugadores). La posición de aquí es entre los jugadores de este dispositivo.':'La posición se calcula entre los jugadores de este dispositivo. Conecta Supabase en ⚙️ Configuración para compartir el ranking.')+'</p>';
 $('pv-special').style.display=isCarolinaProfile()?'none':'block';showPanel('profile-view',true);}
$('pv-close').onclick=()=>showPanel('profile-view',false);
$('pv-switch').onclick=()=>{showPanel('profile-view',false);openProfiles();};
// Perfil especial: se asocia por el UUID interno de ESTE perfil, nunca por el apodo.
$('pv-special').onclick=()=>{if(!profile)return;if(!confirm('¿Este perfil es el de Carolina? Se activará su saludo especial al abrir la puerta (una sola vez).'))return;
 try{localStorage.setItem('coraline_carolina_id',profile.id);}catch(e){}openProfileView();};
