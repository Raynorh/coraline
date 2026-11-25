/* ================= RANKING COMPARTIDO (Supabase) =================
   Pega aquí la URL del proyecto y la clave pública (anon / publishable) de Supabase para que TODOS los
   dispositivos (el tuyo y el de Carolina) usen el mismo ranking. La clave anon es pública por diseño: la
   seguridad la da RLS (ver docs/supabase_setup_v1.3.sql). NUNCA pegues aquí la clave service_role.
   También se puede configurar desde ⚙️ Configuración > Ranking en línea (se guarda solo en ese dispositivo).
   Si no hay conexión los puntajes se guardan en una cola y se envían después; el juego sigue funcionando. */
const SB_CONF={url:'https://jgtwgxklvcaqyrwgcdux.supabase.co',key:'sb_publishable_IYPk4Bd92Ft7AFWOuLpZ2Q_JMHWi3tx'};
const SB={
 cfg(){let o={};try{o=JSON.parse(localStorage.getItem('cor_sb_conf')||'{}')||{};}catch(e){}
  const url=String(SB_CONF.url||o.url||'').trim().replace(/\/+$/,''),key=String(SB_CONF.key||o.key||'').trim();return{url,key};},
 on(){const c=this.cfg();return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(c.url)&&c.key.length>20;},
 async req(method,path,body,extra){const c=this.cfg(),ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),9000);
  try{const r=await fetch(c.url+'/rest/v1/'+path,{method,signal:ctl.signal,headers:Object.assign(c.key.startsWith('sb_')?{apikey:c.key,'Content-Type':'application/json'}:{apikey:c.key,Authorization:'Bearer '+c.key,'Content-Type':'application/json'},extra||{}),body:body==null?undefined:JSON.stringify(body)});
   if(!r.ok){let t='';try{t=await r.text();}catch(e){}throw new Error(r.status+' '+t.slice(0,160));}
   const tx=await r.text();return tx?JSON.parse(tx):null;}finally{clearTimeout(to);}},
 queue(){try{const q=JSON.parse(localStorage.getItem('cor_sb_queue')||'[]');return Array.isArray(q)?q:[];}catch(e){return[];}},
 saveQueue(q){try{localStorage.setItem('cor_sb_queue',JSON.stringify(q.slice(-1500)));}catch(e){}},
 names(){try{return JSON.parse(localStorage.getItem('cor_sb_names')||'{}')||{};}catch(e){return{};}},
 saveNames(n){try{localStorage.setItem('cor_sb_names',JSON.stringify(n));}catch(e){}},
 status:'',busy:false,
 // Asegura que el perfil exista en la nube (y actualiza el apodo si cambió).
 async ensureProfile(id,nick){const n=this.names();if(n[id]===nick)return;
  await this.req('POST','profiles?on_conflict=id',[{id,nickname:nick}],{Prefer:'resolution=ignore-duplicates,return=minimal'});
  await this.req('PATCH','profiles?id=eq.'+id,{nickname:nick},{Prefer:'return=minimal'});n[id]=nick;this.saveNames(n);},
 async flush(){if(!this.on()||this.busy)return;this.busy=true;
  try{let q=this.queue();while(q.length){const e=q[0];await this.ensureProfile(e.profileId,String(e.nickname||'Jugador').slice(0,18));
    await this.req('POST','scores?on_conflict=id',[{id:e.id,profile_id:e.profileId,game:e.game,mode:e.mode,diff:e.diff,score:Math.floor(e.score),level:e.level||null,played_at:e.createdAt||new Date().toISOString()}],{Prefer:'resolution=ignore-duplicates,return=minimal'});
    q.shift();this.saveQueue(q);}this.status='ok';}
  catch(e){this.status='err:'+(e&&e.message||e);}
  finally{this.busy=false;}},
 add(e){if(!this.on()||!GAMES[e.game]||!e.id)return;const q=this.queue();if(!q.some(x=>x.id===e.id))q.push(e);this.saveQueue(q);this.flush();},
 // Sube una sola vez los puntajes que ya existían en este dispositivo.
 backfill(){if(!this.on())return;try{if(localStorage.getItem('cor_sb_backfill')==='1')return;}catch(e){return;}
  const q=this.queue(),have=new Set(q.map(x=>x.id));ScoreStore.all().forEach(e=>{if(e&&e.id&&GAMES[e.game]&&e.score>0&&DIFF_NAMES[e.diff]&&!have.has(e.id))q.push(e);});this.saveQueue(q);
  try{localStorage.setItem('cor_sb_backfill','1');}catch(e){}this.flush();},
 cache:{},
 // Ranking compartido (top 10). Devuelve filas {profileId,nickname,score,diff,special} o null si no se pudo leer.
 async top(game,m,d){try{const view=d==='all'?'leaderboard_all':'leaderboard',f='game=eq.'+game+'&mode=eq.'+m+(d==='all'?'':'&diff=eq.'+d);
   const rows=await this.req('GET',view+'?select=profile_id,nickname,is_special,best&'+f+'&order=best.desc&limit=10');
   const out=(rows||[]).map(r=>({profileId:r.profile_id,nickname:r.nickname,score:r.best,diff:d==='all'?'':d,special:!!r.is_special}));this.cache[game+'|'+m+'|'+d]=out;return out;}
  catch(e){this.status='err:'+(e&&e.message||e);return null;}},
 async ping(){try{await this.req('GET','profiles?select=id&limit=1');await this.req('GET','leaderboard_all?select=game&limit=1');return'ok';}catch(e){return'err:'+(e&&e.message||e);}}};
setTimeout(()=>{SB.backfill();SB.flush();},2500);setInterval(()=>SB.flush(),60000);addEventListener('online',()=>SB.flush());
