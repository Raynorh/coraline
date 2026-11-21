/* ================= SELECCIÓN DE MODO Y DIFICULTAD ================= */
function actNew(id){
 if(id==='open'){state='select';setMusic('intro');playDoorGreeting();return true;}
 if(id==='scores'){showScores();return true;}
 if(id==='mb'||id==='mt'||id==='mbl'||id==='ms'||id==='mk'||id==='mr'||id==='mr3'){mode={mb:'bubble',mt:'tetris',mbl:'blocks',ms:'snake',mk:'kong',mr:'runner',mr3:'runner3d'}[id];saveSel();return true;}
 if(id==='swap'){swapShot();return true;}
 if(id==='bstyle'||id==='bst-r'||id==='bst-s'){blocksStyle=(id==='bst-s'||(id==='bstyle'&&blocksStyle!=='square'))?'square':'rounded';savePrefs();return true;}
 if(id==='sub0'||id==='sub1'){const k=Number(id.slice(3));
  if(mode==='blocks')blocksStyle=k?'square':'rounded';else if(mode==='snake')snakeWrap=!!k;else if(mode==='tetris')tetrisMode=k?'classic':'rescue';else bubbleMode=k?'endless':'levels';
  savePrefs();return true;}
 if(id==='bLamp'){bUseHint();return true;}if(id==='bSwap'){bUseSwap();return true;}
 if(id==='sctl'){snakeCtl=snakeCtl==='swipe'?'':'swipe';savePrefs();return true;}
 if(id==='sU'||id==='sD'||id==='sL'||id==='sR'){sPress(id);return true;}
 if(id==='df'||id==='dn'||id==='dd'||id==='dx'){diff={df:'facil',dn:'normal',dd:'dificil',dx:'experto'}[id];saveSel();return true;}
 if(id==='go'){if(mode==='bubble'&&bubbleMode==='levels'){state='map';return true;}startPlay();return true;}
 if(/^lv\d+$/.test(id)){const n=Number(id.slice(2));if(n<=bubbleProg().unlocked){bubbleLevel=n;startPlay();}return true;}
 if(id==='legend'){openLegend();return true;}
 if(id==='nextk'){kNext();return true;}
 if(id==='xL'||id==='xR'||id==='xJ'||id==='xS'){pAct(id);return true;}
 if(id==='nextlv'){bubbleLevel=Math.min(MAXLV,bubbleLevel+1);startPlay();return true;}
 if(id==='maplv'){state='map';setPowerBtns(false);setMusic('intro');return true;}
 if(id==='bp0'||id==='bp1'||id==='bp2'){const i=Number(id.slice(2));if(mode==='blocks'&&bpieces[i])bselected=i;return true;}
 if(id==='back'){state=state==='map'?'select':'menu';return true;}
 if(['tL','tR','tD','tRot','tHard'].includes(id)){tPress(id);return true;}
 return false;}
function card(x,y,w,h,sel,id){ctx.save();ctx.fillStyle=sel?'#3a1860':'#1c0d30';rr(x,y,w,h,16);ctx.fill();ctx.strokeStyle=sel?'#06d6a0':'#9b5de5';ctx.lineWidth=sel?4:2;if(sel){ctx.shadowColor='#06d6a0';ctx.shadowBlur=16;}ctx.stroke();ctx.restore();hits.push({x,y,w,h,id});}
function drawSelect(){drawSky();moonButton(438,28,18);drawFog(.15);drawFireflies();const D=DIFF[diff];
 txt('Elige tu aventura',240,40,'900 22px "Cinzel Decorative",Georgia,serif','#ffd166');
 const cards=[['mb','bubble','🫧','Burbujas','Niveles y poderes'],['mt','tetris','🧱','Tetris','Filas y rescate'],['mbl','blocks','🔷','Bloques','Encaja y combos'],['ms','snake','🐍','Snake','El hilo'],['mk','kong','🌲','Aventura','Plataformas 2D'],['mr','runner','🏃','Corredor 2D','Estilo dinosaurio'],['mr3','runner3d','🏁','Corredor 3D','Estilo Pepsiman']];
 cards.forEach(([id,m,ico,nm,tg],i)=>{const row=Math.floor(i/4),col=i%4,x=(row?69:5)+col*118,y=52+row*84;card(x,y,112,76,mode===m,id);txt(ico,x+56,y+32,'28px sans-serif','#fff');txt(nm,x+56,y+52,'800 12px Quicksand,sans-serif','#fff');txt(tg,x+56,y+67,'500 9.5px Quicksand,sans-serif','#cdb6ea');});
 txt('Dificultad',240,242,'700 15px Quicksand,sans-serif','#8fe9c9');
 [['df','Fácil','facil'],['dn','Normal','normal'],['dd','Difícil','dificil'],['dx','Experto','experto']].forEach(([id,l,k],i)=>{const x=10+i*117,y=252,sel=diff===k;ctx.fillStyle=sel?'#06705a':'#2a1346';rr(x,y,110,40,20);ctx.fill();ctx.strokeStyle=sel?'#06d6a0':(k==='experto'?'#ff5d8f':'#9b5de5');ctx.lineWidth=sel?3:2;ctx.stroke();txt(l,x+55,y+26,'700 14px Quicksand,sans-serif','#fff');hits.push({x,y,w:110,h:40,id});});
 const d=mode==='bubble'?D.ammo+' botones · '+D.colors+' colores'+(bubbleMode==='endless'?' · sin fin':''):mode==='tetris'?'Caída '+(D.t>=1100?'muy lenta':D.t>=800?'lenta':D.t>=500?'media':'rápida')+(tetrisMode==='rescue'?' · '+D.garb+' filas-trampa':' · por puntos'):mode==='snake'?['Paso muy lento','Paso lento','Paso medio','Paso rápido'][dIdx()]+' · '+(snakeWrap?'sin paredes':'con paredes'):mode==='kong'?KDIFF[dIdx()].hearts+' corazones · enemigos '+['pocos y lentos','normales','muchos y rápidos','muchísimos y muy rápidos'][dIdx()]+' · jefes '+['fáciles','normales','duros','brutales'][dIdx()]+(dIdx()===3?' · sin Wybie':''):mode==='runner3d'?['5','4','3','2'][dIdx()]+' corazones · velocidad '+['tranquila','media','alta','extrema'][dIdx()]+' · 3 carriles, sin fin':mode==='runner'?['4','3','2','1'][dIdx()]+(dIdx()===3?' corazón':' corazones')+' · velocidad '+['tranquila','media','alta','extrema'][dIdx()]+' · sin fin':'Tablero 8×8 · '+(blocksStyle==='square'?'botones cuadrados':'botones redondos')+' · con comodines';
 txt(d,240,314,'500 13px Quicksand,sans-serif','#cdb6ea');
 const subs=mode==='blocks'?[['Redondo',blocksStyle==='rounded'],['Cuadrado',blocksStyle==='square']]
  :mode==='snake'?[['Con paredes',!snakeWrap],['Sin paredes',snakeWrap]]
  :mode==='tetris'?[['Rescate',tetrisMode==='rescue'],['Clásico',tetrisMode==='classic']]
  :mode==='kong'||mode==='runner'||mode==='runner3d'?[]
  :[['Niveles',bubbleMode==='levels'],['Sin fin',bubbleMode==='endless']];
 subs.forEach(([l,sel],i)=>{const x=40+i*210,y=334;ctx.fillStyle=sel?'#06705a':'#2a1346';rr(x,y,190,40,20);ctx.fill();ctx.strokeStyle=sel?'#06d6a0':'#9b5de5';ctx.lineWidth=2;ctx.stroke();txt(l,x+95,y+26,'700 15px Quicksand,sans-serif','#fff');hits.push({x,y,w:190,h:40,id:'sub'+i});});
 menuBtn('¡Entrar al Otro Mundo!',392,'go','#06d6a0');menuBtn('Volver',448,'back');}
function drawBtnS(x,y,ci,mouse,rad,alpha){ctx.save();ctx.translate(x,y);ctx.scale(rad/R,rad/R);drawButton(0,0,ci,mouse,alpha);ctx.restore();}


