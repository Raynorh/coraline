/* ================= DIBUJO ================= */
function mouseFace(x,y,s){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-s*.62,y-s*.62,s*.38,0,TAU);ctx.arc(x+s*.62,y-s*.62,s*.38,0,TAU);ctx.fill();
 ctx.fillStyle='#f6a9c4';ctx.beginPath();ctx.arc(x-s*.62,y-s*.62,s*.2,0,TAU);ctx.arc(x+s*.62,y-s*.62,s*.2,0,TAU);ctx.fill();
 ctx.fillStyle='#fff';ctx.strokeStyle='#c8c2d6';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,s,0,TAU);ctx.fill();ctx.stroke();
 ctx.fillStyle='#1a1228';ctx.beginPath();ctx.arc(x-s*.35,y-s*.12,s*.11,0,TAU);ctx.arc(x+s*.35,y-s*.12,s*.11,0,TAU);ctx.fill();
 ctx.fillStyle='#ff7aa8';ctx.beginPath();ctx.arc(x,y+s*.18,s*.14,0,TAU);ctx.fill();
 ctx.strokeStyle='#999';ctx.lineWidth=.8;ctx.beginPath();[[-1,-.1],[-1,.2],[1,-.1],[1,.2]].forEach(([d,o])=>{ctx.moveTo(x+d*s*.25,y+s*.25+o*s*.3);ctx.lineTo(x+d*s*.95,y+s*.25+o*s*1.1);});ctx.stroke();}
function drawButton(x,y,ci,mouse,alpha){if(ci<0){drawSpecialBtn(x,y,ci,alpha);return;}const col=COLORS[ci];ctx.save();ctx.globalAlpha=alpha==null?1:alpha;
 ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(x+2,y+3,R-1,0,TAU);ctx.fill();
 const g=ctx.createRadialGradient(x-7,y-8,2,x,y,R);g.addColorStop(0,'#fff8');g.addColorStop(.25,col.f);g.addColorStop(1,col.b);
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R-1.5,0,TAU);ctx.fill();ctx.strokeStyle=col.b;ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle=col.f;ctx.beginPath();ctx.arc(x,y,R-6,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;ctx.stroke();
 ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,R-7.5,Math.PI*.9,Math.PI*1.6);ctx.stroke();
 if(!mouse){ctx.fillStyle='#1b1020';[[-5,-5],[5,-5],[-5,5],[5,5]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(x+a,y+b,2.6,0,TAU);ctx.fill();});
  ctx.strokeStyle='#f3e9d2';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-5,y-5);ctx.lineTo(x+5,y+5);ctx.moveTo(x+5,y-5);ctx.lineTo(x-5,y+5);ctx.stroke();}
 else mouseFace(x,y+1,12);
 ctx.restore();}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function drawSky(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#07050e');g.addColorStop(.45,'#1a0b2e');g.addColorStop(1,'#3a1248');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 stars.forEach(s=>{ctx.globalAlpha=.4+.4*Math.sin(tick*.03+s.p);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,TAU);ctx.fill();});ctx.globalAlpha=1;}
function drawFog(a){fogs.forEach(f=>{f.x+=f.s;if(f.x>W+200)f.x=-200;if(f.x<-200)f.x=W+200;const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);
 g.addColorStop(0,'rgba(150,90,200,'+a+')');g.addColorStop(1,'rgba(150,90,200,0)');ctx.fillStyle=g;ctx.fillRect(f.x-f.r,f.y-f.r,f.r*2,f.r*2);});}
function drawFireflies(){fireflies.forEach(f=>{f.p+=.02;f.x+=Math.sin(f.p)*.3;f.y-=f.s*.3;if(f.y<150){f.y=H;f.x=rnd(0,W);}
 const a=.5+.5*Math.sin(f.p*2);const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,9);g.addColorStop(0,'rgba(140,255,200,'+a+')');g.addColorStop(1,'rgba(140,255,200,0)');
 ctx.fillStyle=g;ctx.fillRect(f.x-9,f.y-9,18,18);});}
function moonButton(x,y,r){const g=ctx.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r*1.6);g.addColorStop(0,'#fffbe8');g.addColorStop(1,'rgba(255,240,180,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*1.6,0,TAU);ctx.fill();
 ctx.fillStyle='#e8dcb0';ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.fillStyle='#f6efd0';ctx.beginPath();ctx.arc(x,y,r*.86,0,TAU);ctx.fill();
 ctx.strokeStyle='#b9ab78';ctx.lineWidth=3;ctx.stroke();
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const hx=x+a*r*.22,hy=y+b*r*.22;ctx.fillStyle='#6d6340';ctx.beginPath();ctx.arc(hx,hy,r*.1,0,TAU);ctx.fill();
  ctx.fillStyle='#fff9';ctx.beginPath();ctx.arc(hx+1,hy+2,r*.07,0,TAU);ctx.fill();});}
function drawPalace(){const f=(x,y,w,h)=>ctx.fillRect(x,y,w,h);
 ctx.fillStyle='#1b0d26';f(60,640,360,120);f(30,675,70,85);f(380,675,70,85);f(215,590,50,60);
 ctx.beginPath();ctx.moveTo(205,592);ctx.lineTo(240,520);ctx.lineTo(275,592);ctx.fill();   // torreta
 ctx.beginPath();ctx.moveTo(50,640);ctx.lineTo(240,618);ctx.lineTo(430,640);ctx.fill();
 ctx.beginPath();ctx.moveTo(25,676);ctx.lineTo(65,655);ctx.lineTo(105,676);ctx.fill();ctx.beginPath();ctx.moveTo(375,676);ctx.lineTo(415,655);ctx.lineTo(455,676);ctx.fill();
 ctx.strokeStyle='#ff5d8f55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(240,520);ctx.lineTo(205,592);ctx.moveTo(240,520);ctx.lineTo(275,592);ctx.stroke();
 const win=[[228,605],[75,655],[130,655],[185,655],[295,655],[350,655],[405,655],[45,700],[85,700],[130,690],[185,690],[300,690],[350,690],[395,700],[430,700]];
 win.forEach(([x,y],i)=>{const fl=.75+.25*Math.sin(tick*.05+i*1.7);ctx.fillStyle='rgba(255,190,90,'+fl+')';f(x,y,16,22);ctx.fillStyle='#1b0d26';f(x+7,y,2,22);f(x,y+10,16,2);});
 ctx.fillStyle='#3a1630';rr(165,725,150,26,6);ctx.fill();ctx.strokeStyle='#ff5d8f';ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle='#ff8fb5';ctx.font='700 15px "Cinzel Decorative",Georgia,serif';ctx.textAlign='center';ctx.fillText('Pink Palace',240,743);}
function txt(t,x,y,font,color,align){ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align||'center';ctx.fillText(t,x,y);}
function menuBtn(label,y,id,col){const x=100,w=280,h=46,hover=mouseX>x&&mouseX<x+w&&mouseY>y&&mouseY<y+h;
 ctx.fillStyle=hover?'#4a1d78':'#2a1346';rr(x,y,w,h,23);ctx.fill();ctx.strokeStyle=col||'#9b5de5';ctx.lineWidth=2.5;ctx.stroke();
 txt(label,240,y+30,'700 17px Quicksand,sans-serif','#fff');hits.push({x,y,w,h,id});}
function menuBtnBig(label,y,id,col,pulse){const x=70,w=340,h=62,hover=mouseX>x&&mouseX<x+w&&mouseY>y&&mouseY<y+h,g=pulse?.5+.5*Math.sin(tick*.06):0;
 ctx.shadowColor=col;ctx.shadowBlur=14+10*g;ctx.fillStyle=hover?col:'#2a1346';rr(x,y,w,h,31);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=col;ctx.lineWidth=3.5;ctx.stroke();
 txt(label,240,y+39,'900 22px Quicksand,sans-serif',hover?'#1a0b2e':'#fff');hits.push({x,y,w,h,id});}
function drawMenu(){drawSky();moonButton(385,255,58);drawFog(.18);drawPalace();drawFog(.1);drawFireflies();
 ctx.shadowColor='#9b5de5';ctx.shadowBlur=20;txt('CORALINE',240,100,'900 50px "Cinzel Decorative",Georgia,serif','#ffd166');ctx.shadowBlur=0;
 txt('y el Rescate de los Ratones',240,142,'700 20px "Cinzel Decorative",Georgia,serif','#e9c6ff');
 txt('Palacio Rosa • Otro Mundo',240,176,'500 italic 15px Quicksand,sans-serif','#8fe9c9');
 menuBtnBig('🚪 Abrir la Puerta',300,'open','#06d6a0',true);
 menuBtnBig('🏆 Mejores puntajes',376,'scores','#ffd166');
 menuBtn('👤 '+(profile?profile.nickname:'Elegir jugador'),462,'profile','#7fdcff');
 menuBtn('⚙️ Configuración',516,'config');
 if(appleMode)menuBtn('🎼 Apple Music (sonando)',570,'apple','#ff5d8f');
 // botón discreto de historia
 const ix=436,iy=724,ih=mouseX>ix-17&&mouseX<ix+17&&mouseY>iy-17&&mouseY<iy+17;ctx.fillStyle=ih?'#4a1d78':'rgba(42,19,70,.7)';ctx.beginPath();ctx.arc(ix,iy,17,0,TAU);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();
 txt('!',ix,iy+6,'900 18px Quicksand,sans-serif','#e9c6ff');hits.push({x:ix-17,y:iy-17,w:34,h:34,id:'info'});
 txt('🏆 ¡Reta los récords '+(SB&&SB.on()?'compartidos':'de este dispositivo')+'!',240,224,'800 13px Quicksand,sans-serif','#ffd166');
 try{const entries=GAMES?Object.keys(GAMES).map(g=>{const mm=Object.keys(GAMES[g].modes)[0],top=homeRecordFor(g,mm);return top?{g,mm,top}:null;}).filter(Boolean).sort((a,b)=>b.top.score-a.top.score).slice(0,3):[];
  entries.forEach((e,i)=>{const x=45+i*132;ctx.fillStyle='rgba(24,10,40,.94)';rr(x,232,126,54,10);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=1.4;rr(x,232,126,54,10);ctx.stroke();txt(GAMES[e.g].ico+' '+GAMES[e.g].n,x+63,248,'800 11px Quicksand,sans-serif','#e9c6ff');txt(e.top.score.toLocaleString('es-CL'),x+63,264,'900 14px Quicksand,sans-serif','#ffd166');txt(e.top.nickname,x+63,278,'700 9px Quicksand,sans-serif','#8fe9c9');});}catch(_){ }
 menuBtn('🐭 Granja · Ratones · Defensa',620,'mousehub','#8fe9c9');
 txt('Hecho con amor para ti 💚',240,674,'500 13px Quicksand,sans-serif','#b79cd6');}
function drawCat(){const x=130,y=700;ctx.fillStyle='#07040c';
 ctx.beginPath();ctx.ellipse(x,y+8,26,30,0,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(x,y-28,19,0,TAU);ctx.fill();
 ctx.beginPath();ctx.moveTo(x-18,y-38);ctx.lineTo(x-14,y-58);ctx.lineTo(x-3,y-44);ctx.fill();ctx.beginPath();ctx.moveTo(x+18,y-38);ctx.lineTo(x+14,y-58);ctx.lineTo(x+3,y-44);ctx.fill();
 ctx.strokeStyle='#07040c';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-22,y+26);ctx.bezierCurveTo(x-60,y+30,x-60,y-10,x-40,y-14);ctx.stroke();ctx.lineCap='butt';
 const gl=.7+.3*Math.sin(tick*.08);ctx.shadowColor='#4cc9ff';ctx.shadowBlur=12;ctx.fillStyle='rgba(120,220,255,'+gl+')';
 ctx.beginPath();ctx.ellipse(x-8,y-29,4.5,5.5,0,0,TAU);ctx.ellipse(x+8,y-29,4.5,5.5,0,0,TAU);ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle='#07040c';ctx.fillRect(x-1,y-35,2,12);
 ctx.beginPath();ctx.ellipse(x+22,y+2,9,6,.4,0,TAU);ctx.fill();drawButton(x+34,y-2,nxt,false);
 txt('SIGUIENTE',x+34,y+30,'700 9px Quicksand,sans-serif','#cdb6ea');txt('⇄',x+34,y+44,'700 13px Quicksand,sans-serif','#7fdcff');hits.push({x:x+8,y:y-28,w:52,h:78,id:'swap'});}
function drawCoraline(){const x=345,y=700;ctx.fillStyle='#ffc93c';ctx.beginPath();ctx.moveTo(x-16,y-12);ctx.lineTo(x+16,y-12);ctx.lineTo(x+24,y+40);ctx.lineTo(x-24,y+40);ctx.fill();
 ctx.fillStyle='#e8a919';ctx.fillRect(x-1,y-12,2,52);ctx.fillStyle='#fbd9bb';ctx.beginPath();ctx.arc(x,y-26,15,0,TAU);ctx.fill();
 ctx.fillStyle='#3a86ff';ctx.beginPath();ctx.arc(x,y-30,17,Math.PI*.95,Math.PI*2.05);ctx.lineTo(x+17,y-14);ctx.lineTo(x+11,y-14);ctx.lineTo(x+10,y-30);ctx.lineTo(x-10,y-30);ctx.lineTo(x-11,y-14);ctx.lineTo(x-17,y-14);ctx.fill();
 ctx.fillStyle='#222';ctx.beginPath();ctx.arc(x-5,y-25,1.8,0,TAU);ctx.arc(x+5,y-25,1.8,0,TAU);ctx.fill();
 ctx.strokeStyle='#c0605a';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(x,y-20,4,.2,Math.PI-.2);ctx.stroke();
 ctx.fillStyle='#2a2a40';ctx.fillRect(x-14,y+36,10,8);ctx.fillRect(x+4,y+36,10,8);}
function drawCannon(){const a=aim+Math.PI/2;ctx.save();ctx.translate(CX,CY);
 ctx.fillStyle='#2a1a3c';ctx.beginPath();ctx.arc(0,12,36,Math.PI,TAU);ctx.fill();ctx.rotate(a);
 const gl=armed?1:(stone>=100?.6+.4*Math.sin(tick*.15):0);if(gl){ctx.shadowColor='#06d6a0';ctx.shadowBlur=24*gl;}
 ctx.fillStyle='#0a9a73';ctx.strokeStyle='#047857';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-46);ctx.lineTo(34,20);ctx.lineTo(-34,20);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
 ctx.fillStyle='#06d6a0';ctx.beginPath();ctx.moveTo(0,-36);ctx.lineTo(24,14);ctx.lineTo(-24,14);ctx.closePath();ctx.fill();
 ctx.fillStyle='#052e22';ctx.beginPath();ctx.arc(0,-2,9,0,TAU);ctx.fill();ctx.strokeStyle='#7fffd4';ctx.lineWidth=1.5;ctx.stroke();
 ctx.restore();if(!proj){if(bombArmed)drawBomb(CX,CY);else drawButton(CX,CY,cur,false);}}
function drawBomb(x,y){ctx.save();ctx.fillStyle='#1a1226';ctx.beginPath();ctx.arc(x,y,R-2,0,TAU);ctx.fill();ctx.strokeStyle='#ff9f43';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#ffffff33';ctx.beginPath();ctx.arc(x-7,y-7,5,0,TAU);ctx.fill();
 ctx.strokeStyle='#cdb6ea';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+4,y-R+3);ctx.quadraticCurveTo(x+10,y-R-5,x+17,y-R+1);ctx.stroke();
 const fl=.6+.4*Math.sin(tick*.5);ctx.fillStyle='rgba(255,209,102,'+fl+')';ctx.shadowColor='#ff9f43';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x+17,y-R+1,5,0,TAU);ctx.fill();ctx.restore();}
function drawHUD(){ctx.fillStyle='rgba(10,5,20,.9)';ctx.fillRect(0,0,W,TOP-6);ctx.fillStyle='#9b5de566';ctx.fillRect(0,TOP-7,W,2);
 if(mode==='bubble'){const re=RISE_EVERY[dIdx()],f=Math.min(1,riseCnt/re),hot=riseCnt>=re-1;ctx.fillStyle=hot?(tick%20<10?'#ff5d8f':'#ff9f43'):'#ffd166';ctx.fillRect(0,TOP-8,W*f,4);}
 const clasicT=mode==='tetris'&&tetrisMode==='classic';
 if(!clasicT)txt('🐭 '+rescued+'/'+(mode==='bubble'?bMice:MICE0),14,34,'700 17px Quicksand,sans-serif','#fff','left');
 txt('⭐ '+score,130,34,'700 17px Quicksand,sans-serif','#ffd166','left');
 if(mode==='tetris')txt('📏 '+tlines,258,34,'700 17px Quicksand,sans-serif','#fff','left');else txt('🔘 '+ammo,258,34,'700 17px Quicksand,sans-serif',ammo<=5?'#ff5d8f':'#fff','left');
 (mode==='bubble'?[[316,'❓','legend']]:[]).concat([[360,'🎼','apple'],[404,'⏸','pause'],[448,muted?'🔇':'🔊','mute']]).forEach(([x,t,id])=>{ctx.fillStyle='#2a1346';ctx.beginPath();ctx.arc(x,28,17,0,TAU);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=2;ctx.stroke();
  txt(t,x,34,'16px sans-serif','#fff');hits.push({x:x-17,y:11,w:34,h:34,id});});
 // barra Piedra Mágica
 if(!clasicT){ctx.fillStyle='#1a1228';rr(14,42,200,6,3);ctx.fill();ctx.fillStyle='#06d6a0';rr(14,42,200*Math.min(100,stone)/100,6,3);ctx.fill();}
 if(mode==='bubble'){ctx.fillStyle='#1a1228';rr(14,49,200,4,2);ctx.fill();ctx.fillStyle='#ff9f43';rr(14,49,200*Math.min(100,bomb)/100,4,2);ctx.fill();
  if(bubbleMode==='levels')txt('NIVEL '+bubbleLevel+(bShots%9===8?' · ¡próximo disparo 🌈!':''),222,51,'800 11px Quicksand,sans-serif','#8fe9c9','left');
  if(bubbleMode==='endless')txt('ESCENARIO '+bubbleSec+' · TOTAL 🐭 '+savedTotal,222,51,'700 10px Quicksand,sans-serif','#cdb6ea','left');}}

function drawBeldam(x,y,k,a){ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.scale(k,k);
 ctx.fillStyle='#0c0612';ctx.beginPath();ctx.ellipse(0,-6,44,52,0,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(0,-62,20,0,TAU);ctx.fill();   // pelo y moño
 ctx.fillStyle='#e9e1d8';ctx.beginPath();ctx.ellipse(0,0,30,38,0,0,TAU);ctx.fill();                                                    // rostro pálido
 ctx.fillStyle='#0c0612';ctx.beginPath();ctx.ellipse(0,-22,32,14,0,Math.PI,TAU);ctx.fill();
 [-13,13].forEach(ex=>{ctx.fillStyle='#14091d';ctx.beginPath();ctx.arc(ex,-6,9,0,TAU);ctx.fill();ctx.fillStyle='#7d7d8c';ctx.beginPath();ctx.arc(ex,-6,7,0,TAU);ctx.fill();
  ctx.fillStyle='#14091d';[[-2,-2],[2,-2],[-2,2],[2,2]].forEach(([a2,b2])=>{ctx.beginPath();ctx.arc(ex+a2,-6+b2,1.1,0,TAU);ctx.fill();});
  ctx.strokeStyle='#e9e1d8';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(ex-2,-8);ctx.lineTo(ex+2,-4);ctx.moveTo(ex+2,-8);ctx.lineTo(ex-2,-4);ctx.stroke();});
 ctx.strokeStyle='#5a1f3a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,12,11,.15,Math.PI-.15);ctx.stroke();
 ctx.strokeStyle='#c9c4cf';ctx.lineWidth=2.5;ctx.lineCap='round';[[-1],[1]].forEach(([d])=>{ctx.beginPath();ctx.moveTo(d*34,36);ctx.lineTo(d*62,60);ctx.stroke();});ctx.lineCap='butt'; // agujas
 ctx.restore();}
function drawBanner(by){if(banner.t<=0)return;by=by||712;const a=Math.min(1,banner.t/300);ctx.globalAlpha=a;ctx.fillStyle='rgba(10,5,20,.88)';rr(10,by,460,34,10);ctx.fill();ctx.strokeStyle='#9b5de5';ctx.lineWidth=1.5;ctx.stroke();
 const wc={Coraline:'#ffd166','Gato Negro':'#7fdcff','Sr. Bobinsky':'#ff9ec0','Otra Madre':'#ff8eae'}[banner.who]||'#fff';
 ctx.font='700 12px Quicksand,sans-serif';ctx.textAlign='left';ctx.fillStyle=wc;const wd=ctx.measureText(banner.who+': ').width;ctx.fillText(banner.who+': ',20,by+21);
 ctx.font='500 12px Quicksand,sans-serif';ctx.fillStyle='#eee';let t=banner.txt;while(ctx.measureText(t).width>440-wd&&t.length>8)t=t.slice(0,-2);if(t!==banner.txt)t=t.trimEnd()+'…';ctx.fillText(t,20+wd,by+21);ctx.globalAlpha=1;}
function drawPlay(){drawSky();drawFog(.1);
 ctx.strokeStyle='#c9b3e633';ctx.lineWidth=1;for(let c=0;c<COLS;c++){const p=cellPos(0,c);ctx.beginPath();ctx.moveTo(p.x,TOP);ctx.lineTo(p.x+(Math.sin(c*2.3)*8),TOP+30);ctx.stroke();}// hilos
 ctx.fillStyle='#14091f';ctx.fillRect(0,TOP-6,12,H);ctx.fillRect(W-12,TOP-6,12,H);
 const dy=cellPos(ROWS-1,0).y+R+2;ctx.setLineDash([8,8]);ctx.strokeStyle='#ff5d8f88';ctx.beginPath();ctx.moveTo(12,dy);ctx.lineTo(W-12,dy);ctx.stroke();ctx.setLineDash([]);
 ctx.save();ctx.translate(0,-scrollOff);for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++){const b=grid[r][c];if(b){const p=cellPos(r,c);drawCell(p.x,p.y,b);}}ctx.restore();
 falling.forEach(f=>drawCell(f.x,f.y,f,.9));
 // puntería
 if(state==='play'&&!proj&&scrollOff<1){const pts=laserPath(1400);ctx.save();
  if(armed||bombArmed){ctx.shadowColor=bombArmed?'#ff9f43':'#06d6a0';ctx.shadowBlur=10;ctx.strokeStyle=bombArmed?'#ffb26b':'#4dffc4';ctx.lineWidth=2.5;ctx.setLineDash([]);}else{ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=2.5;ctx.setLineDash([5,8]);}
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.restore();
  for(let i=1;i<pts.length-1;i++){ctx.strokeStyle=bombArmed?'#ffb26b':armed?'#4dffc4':'#ffffffcc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pts[i][0],pts[i][1],7,0,TAU);ctx.stroke();}
  const e=pts[pts.length-1];let bd=1e9,bc=null;for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++){if(grid[r][c])continue;if(r>0&&!neigh(r,c).some(([a,b])=>grid[a][b]))continue;const q=cellPos(r,c),d=(q.x-e[0])**2+(q.y-e[1])**2;if(d<bd){bd=d;bc=q;}}
  if(bc){ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=cur>=0&&COLORS[cur]?COLORS[cur].f:'#ffffff';ctx.lineWidth=2;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(bc.x,bc.y,R-3,0,TAU);ctx.stroke();ctx.restore();}}
 if(proj){if(proj.bomb)drawBomb(proj.x,proj.y);else drawButton(proj.x,proj.y,proj.color,false);}
 if(ammo<=5&&state==='play')drawBeldam(405,585,.9,.3+.12*Math.sin(tick*.08));
 if(aiming&&state==='play'){const over=mouseY>CANCEL_Y;ctx.save();ctx.fillStyle=over?'rgba(255,93,143,.35)':'rgba(255,93,143,.12)';ctx.fillRect(0,CANCEL_Y,W,H-CANCEL_Y);ctx.setLineDash([8,6]);ctx.strokeStyle='#ff5d8f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,CANCEL_Y);ctx.lineTo(W,CANCEL_Y);ctx.stroke();ctx.restore();txt(over?'✕ Suelta para CANCELAR':'↓ Arrastra aquí y suelta para cancelar',240,CANCEL_Y+34,'800 14px Quicksand,sans-serif',over?'#fff':'#ff9ec0');}
 drawCat();drawCoraline();drawCannon();
 parts.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life/20);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,TAU);ctx.fill();});ctx.globalAlpha=1;
 jumpers.forEach(j=>{mouseFace(j.x,j.y,12);});
 floats.forEach(f=>{ctx.globalAlpha=Math.min(1,f.life/20);txt(f.txt,f.x,f.y,'700 16px Quicksand,sans-serif',f.c);});ctx.globalAlpha=1;
 drawHUD();drawBanner();}
function overlay(title,sub,color,btns){ctx.fillStyle='rgba(7,5,14,.78)';ctx.fillRect(0,0,W,H);
 if(state==='lose'){loseT++;const la=Math.min(1,loseT/36);drawMotherLose(la);drawBeldam(240,140,1,la);ctx.globalAlpha=la;txt('La Otra Madre: «Perdiste… ahora eres mía.»',240,212,'700 italic 16px Quicksand,sans-serif','#ff8eae');ctx.globalAlpha=1;}
 ctx.shadowColor=color;ctx.shadowBlur=22;txt(title,240,250,'900 34px "Cinzel Decorative",Georgia,serif',color);ctx.shadowBlur=0;
 sub.forEach((s,i)=>txt(s,240,300+i*26,'500 16px Quicksand,sans-serif','#eee'));
 btns.forEach(([l,id],i)=>{const y=380+i*62,x=110,w=260,h=46,hv=mouseX>x&&mouseX<x+w&&mouseY>y&&mouseY<y+h;ctx.fillStyle=hv?'#4a1d78':'#2a1346';rr(x,y,w,h,23);ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();
  txt(l,240,y+30,'700 17px Quicksand,sans-serif','#fff');hits.push({x,y,w,h,id});});}


