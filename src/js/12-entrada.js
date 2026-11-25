/* ================= ENTRADA ================= */
function pos(e){if(e&&e.pointerType)lastPtr=e.pointerType;const r=cv.getBoundingClientRect();mouseX=(e.clientX-r.left)*W/r.width;mouseY=(e.clientY-r.top)*H/r.height;
 let a=Math.atan2(mouseY-CY,mouseX-CX);if(a>0)a=a<Math.PI/2?-.22:-Math.PI+.22;aim=Math.max(-Math.PI+.22,Math.min(-.22,a));}
function act(id){if(actNew(id))return;
 if(id==='play')startPlay();else if(id==='story'||id==='info'){modal.style.display='block';}else if(id==='profile'){openProfileView();}
 else if(id==='config'){openConfig();}else if(id==='apple')openApple();else if(id==='sound')setMuted(!muted);else if(id==='mute')setMuted(!muted);
 else if(id==='pause'&&state==='play'){state='pause';setMusic('pausa');setPowerBtns(false);}
 else if(id==='resume'){state='play';setMusic('partida');setPowerBtns(true);}
 else if(id==='menu')toMenu();}
cv.addEventListener('pointermove',e=>{const ox=mouseX,oy=mouseY;pos(e);if(state==='play'&&mode==='fruit')fAim(mouseX);if(sSwipe&&state==='play'&&mode==='snake')sSwipeMove(mouseX,mouseY);if(bdragging&&(Math.abs(mouseX-(bdragStart?.x??mouseX))>3||Math.abs(mouseY-(bdragStart?.y??mouseY))>3))bdragMoved=true;});
function enterGame(){if(state!=='splash')return;unlock();state='menu';setMusic('intro');if(!profile){openProfiles();return;}playGeneralGreeting();}
cv.addEventListener('pointerdown',e=>{pos(e);if(state==='splash'){enterGame();return;}unlock();
 const h=hits.find(h=>mouseX>=h.x&&mouseX<=h.x+h.w&&mouseY>=h.y&&mouseY<=h.y+h.h);
 if(h){if(state==='play'&&mode==='blocks'&&/^bp[0-2]$/.test(h.id)){act(h.id);bdragging=true;bdragMoved=false;bdragStart={x:mouseX,y:mouseY};try{cv.setPointerCapture(e.pointerId);}catch(_){}}else act(h.id);return;}
 if(state==='play'&&mode==='blocks'){bPointer();return;}if(state==='play'&&mode==='fruit'){fAim(mouseX);fDown=true;return;}if(state==='play'&&mode==='snake'){if(snakeCtl==='swipe'){sSwipe={x:mouseX,y:mouseY,moved:false};try{cv.setPointerCapture(e.pointerId);}catch(_){}}else{const z=sXTurn(mouseX,mouseY);if(z){sTouchZone=z;setTimeout(()=>{sTouchZone='';},180);}}return;}if(state==='play'&&mode==='bubble'&&mouseY>TOP){if(armed&&mouseY<CY-30){tryMagicPlace(mouseX,mouseY);return;}if(e.pointerType==='mouse')shoot();else{aiming=true;try{cv.setPointerCapture(e.pointerId);}catch(_){}}}});
function endAim(e){if(aiming){aiming=false;pos(e);if(state==='play'){if(mouseY>CANCEL_Y){say('Gato Negro','Disparo cancelado. Apunta de nuevo.',1400);}else shoot();}}}
cv.addEventListener('pointerup',e=>{pos(e);if(fDown){fDown=false;if(state==='play'&&mode==='fruit'){fAim(mouseX);fDrop();}}bEndDrag();tRelease();sSwipeEnd(mouseX,mouseY);endAim(e);});cv.addEventListener('pointercancel',()=>{fDown=false;sSwipe=null;bdragging=false;bdragMoved=false;bdragStart=null;bpreview=null;aiming=false;tRelease();});
document.getElementById('modal-close').addEventListener('click',()=>{modal.style.display='none';});
addEventListener('keydown',e=>{if(state==='splash'){enterGame();return;}
 if(state==='play'&&mode==='fruit'){const k=e.code;if(k==='ArrowLeft'||k==='KeyA'){fAim(fAimX-18);e.preventDefault();return;}if(k==='ArrowRight'||k==='KeyD'){fAim(fAimX+18);e.preventDefault();return;}if((k==='Space'||k==='ArrowDown')&&!e.repeat){fDrop();e.preventDefault();return;}}
 if(state==='play'&&mode==='snake'){const k=e.code;if(k==='ArrowUp'||k==='KeyW'){sTurn(0,-1);e.preventDefault();return;}if(k==='ArrowDown'||k==='KeyS'){sTurn(0,1);e.preventDefault();return;}if(k==='ArrowLeft'||k==='KeyA'){sTurn(-1,0);e.preventDefault();return;}if(k==='ArrowRight'||k==='KeyD'){sTurn(1,0);e.preventDefault();return;}}
 if(state==='play'&&mode==='bubble'&&!e.repeat&&(e.code==='KeyC'||e.code==='ShiftLeft')){swapShot();e.preventDefault();return;}
 if(state==='play'&&mode==='bubble'&&!e.repeat&&e.code==='KeyB'){activateBomb();e.preventDefault();return;}
 if(state==='play'&&mode==='tetris'&&tp){const k=e.code;
  if(k==='ArrowLeft'){tMove(-1,0);e.preventDefault();return;}if(k==='ArrowRight'){tMove(1,0);e.preventDefault();return;}
  if(k==='ArrowDown'){if(tMove(0,1))score+=1;e.preventDefault();return;}
  if((k==='ArrowUp'||k==='KeyX'||k==='KeyZ')&&!e.repeat){tRot();e.preventDefault();return;}
  if(k==='Space'&&!e.repeat){tHard();e.preventDefault();return;}}if(e.code==='Space'){e.preventDefault();activateMagic();}
 else if(e.code==='Escape'||e.code==='KeyP'){if(state==='play')act('pause');else if(state==='pause')act('resume');}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')act('pause');});
requestAnimationFrame(frame);
