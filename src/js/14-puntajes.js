/* ================= PUNTAJES ================= */
function modeLabel(){return mode==='blocks'?'Bloques':mode==='tetris'?(tetrisMode==='classic'?'Tetris Clásico':'Tetris Rescate'):mode==='snake'?(snakeWrap?'Snake sin paredes':'Snake'):(bubbleMode==='rescue'?'Burbujas sin fin':'Burbujas');}
function recordScore(){if(scoreRecorded)return;scoreRecorded=true;const name=profile?profile.nickname:'Jugador';const entry={profileId:profile?profile.id:LEGACY_PROFILE_ID,name,score:Number(score)||0,mode:modeLabel(),date:new Date().toLocaleDateString('es-CL')};let v2=[];try{v2=JSON.parse(localStorage.getItem('coraline_scores_v2')||'[]');}catch(e){}if(!Array.isArray(v2))v2=[];v2.push(entry);v2.sort((a,b)=>b.score-a.score);try{localStorage.setItem('coraline_scores_v2',JSON.stringify(v2.slice(0,50)));}catch(e){}}
function showScores(){let list=[];try{list=JSON.parse(localStorage.getItem('coraline_scores_v2')||'[]');}catch(e){}if(!Array.isArray(list)||!list.length){try{list=JSON.parse(localStorage.getItem('coraline_scores')||'[]');}catch(e){list=[];}}const body=document.getElementById('scores-body');body.innerHTML=list.length?list.slice(0,10).map((v,i)=>'<div class="row" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #9b5de533"><span>'+(i+1)+'. '+(v.name||'Jugador')+'</span><span>'+v.score+' · '+v.mode+'</span></div>').join(''):'<p>Todavía no hay puntajes guardados. Juega una partida.</p>';document.getElementById('scores-panel').style.display='block';}

// Texto de la pantalla de derrota según el modo.
function loseLines(){
 if(mode==='snake'||mode==='blocks')return['⭐ '+score.toLocaleString('es-CL')+' puntos'];
 if(mode==='tetris'&&tetrisMode==='classic')return['⭐ '+score.toLocaleString('es-CL')+' puntos','📏 '+tlines+' líneas · nivel '+tlevel];
 if(mode==='tetris')return['Rescataste '+savedTotal+' ratoncitos en total','⭐ '+score.toLocaleString('es-CL')+' puntos'];
 if(bubbleMode==='rescue')return['Rescataste '+savedTotal+' ratoncitos en total','⭐ '+score.toLocaleString('es-CL')+' puntos'];
 return['Rescataste '+rescued+' de '+MICE0+' ratoncitos'];}
