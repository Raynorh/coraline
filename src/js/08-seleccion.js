/* ================= SELECCIÓN DE MODO Y DIFICULTAD ================= */
function actNew(id){
 if(id==='open'){state='select';setMusic('intro');playDoorGreeting();return true;}
 if(id==='scores'){showScores();return true;}
 if(id==='mb'||id==='mt'||id==='mbl'||id==='ms'){mode={mb:'bubble',mt:'tetris',mbl:'blocks',ms:'snake'}[id];saveSel();return true;}
 if(id==='swap'){swapShot();return true;}
 if(id==='bstyle'||id==='bst-r'||id==='bst-s'){blocksStyle=(id==='bst-s'||(id==='bstyle'&&blocksStyle!=='square'))?'square':'rounded';savePrefs();return true;}
 if(id==='sub0'||id==='sub1'){const k=Number(id.slice(3));
  if(mode==='blocks')blocksStyle=k?'square':'rounded';else if(mode==='snake')snakeWrap=!!k;else if(mode==='tetris')tetrisMode=k?'classic':'rescue';else bubbleMode=k?'rescue':'classic';
  savePrefs();return true;}
 if(id==='bLamp'){bUseHint();return true;}if(id==='bSwap'){bUseSwap();return true;}
 if(id==='sU'||id==='sD'||id==='sL'||id==='sR'){sPress(id);return true;}
 if(id==='df'||id==='dn'||id==='dd'||id==='dx'){diff={df:'facil',dn:'normal',dd:'dificil',dx:'experto'}[id];saveSel();return true;}
 if(id==='go'){startPlay();return true;}
 if(id==='bp0'||id==='bp1'||id==='bp2'){const i=Number(id.slice(2));if(mode==='blocks'&&bpieces[i])bselected=i;return true;}
 if(id==='back'){state='menu';return true;}
 if(['tL','tR','tD','tRot','tHard'].includes(id)){tPress(id);return true;}
 return false;}
function card(x,y,w,h,sel,id){ctx.save();ctx.fillStyle=sel?'#3a1860':'#1c0d30';rr(x,y,w,h,16);ctx.fill();ctx.strokeStyle=sel?'#06d6a0':'#9b5de5';ctx.lineWidth=sel?4:2;if(sel){ctx.shadowColor='#06d6a0';ctx.shadowBlur=16;}ctx.stroke();ctx.restore();hits.push({x,y,w,h,id});}
function drawSelect(){drawSky();moonButton(438,28,18);drawFog(.15);drawFireflies();const D=DIFF[diff];
 txt('Elige tu aventura',240,40,'900 22px "Cinzel Decorative",Georgia,serif','#ffd166');
 const cards=[{x:10,id:'mb',sel:mode==='bubble'},{x:128,id:'mt',sel:mode==='tetris'},{x:246,id:'mbl',sel:mode==='blocks'},{x:364,id:'ms',sel:mode==='snake'}];
 cards.forEach(o=>card(o.x,58,110,150,o.sel,o.id));
 drawBtnS(38,100,1,false,10);drawBtnS(66,100,0,true,10);drawBtnS(94,100,2,false,10);drawBtnS(52,126,3,false,10);drawBtnS(80,126,4,false,10);
 [[0,0,2],[1,0,2],[2,0,2],[1,1,2]].forEach(([a,b,c])=>drawBtnS(156+a*16,96+b*16,c,false,7));
 [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]].forEach(([a,b],i)=>{ctx.fillStyle=['#ff5d8f','#3a86ff','#ffd166','#9b5de5','#06d6a0','#ff9f43'][i];rr(268+a*20,92+b*20,16,16,blocksStyle==='square'?2:4);ctx.fill();});
 ctx.strokeStyle='#06d6a0';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(392,150);ctx.lineTo(446,150);ctx.lineTo(446,112);ctx.lineTo(404,112);ctx.stroke();
 ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(404,112,4,0,TAU);ctx.fill();
 txt('Burbujas',65,168,'700 12px Quicksand,sans-serif','#fff');txt('Dispara',65,186,'500 10px Quicksand,sans-serif','#cdb6ea');
 txt('Tetris',183,168,'700 12px Quicksand,sans-serif','#fff');txt('Filas',183,186,'500 10px Quicksand,sans-serif','#cdb6ea');
 txt('Bloques',301,168,'700 12px Quicksand,sans-serif','#fff');txt('Encaja',301,186,'500 10px Quicksand,sans-serif','#cdb6ea');
 txt('Snake',419,168,'700 12px Quicksand,sans-serif','#fff');txt('El hilo',419,186,'500 10px Quicksand,sans-serif','#cdb6ea');
 txt('Dificultad',240,236,'700 15px Quicksand,sans-serif','#8fe9c9');
 [['df','Fácil','facil'],['dn','Normal','normal'],['dd','Difícil','dificil'],['dx','Experto','experto']].forEach(([id,l,k],i)=>{const x=10+i*117,y=250,sel=diff===k;ctx.fillStyle=sel?'#06705a':'#2a1346';rr(x,y,110,40,20);ctx.fill();ctx.strokeStyle=sel?'#06d6a0':(k==='experto'?'#ff5d8f':'#9b5de5');ctx.lineWidth=sel?3:2;ctx.stroke();txt(l,x+55,y+26,'700 14px Quicksand,sans-serif','#fff');hits.push({x,y,w:110,h:40,id});});
 const d=mode==='bubble'?D.ammo+' botones · '+D.colors+' colores'+(bubbleMode==='rescue'?' · sin fin':''):mode==='tetris'?'Caída '+(D.t>=1100?'muy lenta':D.t>=800?'lenta':D.t>=500?'media':'rápida')+(tetrisMode==='rescue'?' · '+D.garb+' filas-trampa':' · por puntos'):mode==='snake'?['Paso muy lento','Paso lento','Paso medio','Paso rápido'][dIdx()]+' · '+(snakeWrap?'sin paredes':'con paredes'):'Tablero 8×8 · '+(blocksStyle==='square'?'botones cuadrados':'botones redondos')+' · con comodines';
 txt(d,240,314,'500 13px Quicksand,sans-serif','#cdb6ea');
 const subs=mode==='blocks'?[['Redondo',blocksStyle==='rounded'],['Cuadrado',blocksStyle==='square']]
  :mode==='snake'?[['Con paredes',!snakeWrap],['Sin paredes',snakeWrap]]
  :mode==='tetris'?[['Rescate',tetrisMode==='rescue'],['Clásico',tetrisMode==='classic']]
  :[['Clásico',bubbleMode==='classic'],['Rescate sin fin',bubbleMode==='rescue']];
 subs.forEach(([l,sel],i)=>{const x=40+i*210,y=334;ctx.fillStyle=sel?'#06705a':'#2a1346';rr(x,y,190,40,20);ctx.fill();ctx.strokeStyle=sel?'#06d6a0':'#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(l,x+95,y+26,'700 15px Quicksand,sans-serif','#fff');hits.push({x,y,w:190,h:40,id:'sub'+i});});
 menuBtn('¡Entrar al Otro Mundo!',392,'go','#06d6a0');menuBtn('Volver',448,'back');}
function drawBtnS(x,y,ci,mouse,rad,alpha){ctx.save();ctx.translate(x,y);ctx.scale(rad/R,rad/R);drawButton(0,0,ci,mouse,alpha);ctx.restore();}


