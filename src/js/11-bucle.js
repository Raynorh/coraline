/* ================= BUCLE ================= */
function update(){tick++;if(state==='play'&&mode==='blocks')bTime+=16.7;if(banner.t>0)banner.t-=16.7;if(state==='play'&&mode==='tetris')tUpdate();else if(state==='play'&&mode==='snake')sUpdate();
 if(scrollOff>0){scrollOff*=.92;if(scrollOff<1)scrollOff=0;}
 if(state==='play'||state==='win'||state==='lose'){stepProj();
  parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.life--;});parts=parts.filter(p=>p.life>0);
  falling.forEach(f=>{f.vy+=.55;f.y+=f.vy;f.x+=f.vx;});falling=falling.filter(f=>f.y<H+40);
  floats.forEach(f=>{f.y-=.8;f.life--;});floats=floats.filter(f=>f.life>0);
  jumpers.forEach(j=>{j.t+=1/55;const t=Math.min(1,j.t),e=t*t*(3-2*t);j.x=j.sx+(60-j.sx)*e;j.y=j.sy+(28-j.sy)*e-Math.sin(t*Math.PI)*60;});jumpers=jumpers.filter(j=>j.t<1);}}
function frame(){update();hits.length=0;ctx.clearRect(0,0,W,H);
 if(state==='splash'||state==='menu'){drawMenu();
 if(state==='splash'){hits.length=0;ctx.fillStyle='rgba(7,5,14,.72)';ctx.fillRect(0,0,W,H);ctx.globalAlpha=.6+.4*Math.sin(tick*.06);txt('Toca para entrar al Otro Mundo',240,400,'700 20px "Cinzel Decorative",Georgia,serif','#ffd166');ctx.globalAlpha=1;txt('🔊 con sonido',240,432,'500 14px Quicksand,sans-serif','#b79cd6');}}
 else if(state==='select')drawSelect();
 else{(mode==='tetris'?drawTetris:mode==='blocks'?drawBlocks:mode==='snake'?drawSnake:drawPlay)();
  if(state==='play')drawMother(motherDanger());
  if(state==='pause')overlay('Pausa',['La Mamá de Botones espera…'],'#9b5de5',[['Continuar','resume'],['🎼 Música Apple Music','apple'],['Menú principal','menu']]);
  if(state==='win')overlay(mode==='blocks'?'¡Tablero despejado!':'¡Lo logramos!',['Los 6 ratoncitos están a salvo','⭐ '+score+' puntos'],'#ffd166',[['Jugar otra vez','play'],['Menú principal','menu']]);
  if(state==='lose')overlay(mode==='tetris'?'Torre llena…':mode==='blocks'?'No quedan movimientos':mode==='snake'?'El hilo se enredó…':'Sin botones…',loseLines(),'#ff5d8f',[['Intentar de nuevo','play'],['Menú principal','menu']]);}
 if(fade>0){ctx.fillStyle='rgba(7,5,14,'+fade+')';ctx.fillRect(0,0,W,H);fade-=.03;}
 ctx.font='700 11px Quicksand,sans-serif';ctx.textAlign='right';ctx.fillStyle='#b79cd6aa';ctx.fillText(VERSION,H>0?W-8:0,H-8);
 requestAnimationFrame(frame);}

