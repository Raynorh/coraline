/* ================= ESCALADO ================= */
function fit(){const s=Math.min(innerWidth/W,innerHeight/H);stage.style.transform='scale('+s+')';
 stage.style.left=(innerWidth-W*s)/2+'px';stage.style.top=(innerHeight-H*s)/2+'px';}
addEventListener('resize',fit);fit();

