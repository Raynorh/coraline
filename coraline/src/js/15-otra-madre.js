/* ================= LA OTRA MADRE: ojos y manos desde la sombra ================= */
const clamp01=x=>Math.max(0,Math.min(1,x));
// 0 = tranquilo, 1 = a punto de perder. Cada juego define su propio "peligro".
function motherDanger(){
 if(state!=='play')return 0;
 try{
  if(mode==='bubble'){let low=-1;for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++)if(grid[r][c])low=r;
   return clamp01(Math.max((low-(ROWS-5))/4,ammo<=5?(6-ammo)/6:0));}
  if(mode==='tetris'){let top=TROWS;for(let r=0;r<TROWS;r++)if(tb[r]&&tb[r].some(Boolean)){top=r;break;}return clamp01((TROWS-top-10)/6);}
  if(mode==='blocks'){let f=0;bgrid.forEach(row=>row.forEach(v=>{if(v>=0)f++;}));return clamp01((f/(BC*BC)-.5)/.35);}
  if(mode==='snake'){return clamp01((snake.length/(SN*SN)-.12)/.2);}
 }catch(e){}
 return 0;}
function motherEye(x,y,a,s){ctx.save();ctx.globalAlpha=a;const g=ctx.createRadialGradient(x,y,1,x,y,s*2.6);g.addColorStop(0,'rgba(190,190,215,.55)');g.addColorStop(1,'rgba(190,190,215,0)');ctx.fillStyle=g;ctx.fillRect(x-s*3,y-s*3,s*6,s*6);
 ctx.fillStyle='#6f6f82';ctx.beginPath();ctx.arc(x,y,s,0,TAU);ctx.fill();ctx.fillStyle='#14091d';[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a2,b2])=>{ctx.beginPath();ctx.arc(x+a2*s*.3,y+b2*s*.3,s*.14,0,TAU);ctx.fill();});
 ctx.strokeStyle='#d9d4df';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-s*.35,y-s*.35);ctx.lineTo(x+s*.35,y+s*.35);ctx.moveTo(x+s*.35,y-s*.35);ctx.lineTo(x-s*.35,y+s*.35);ctx.stroke();ctx.restore();}
// side: -1 izquierda, 1 derecha. reach = cuánto entra la mano en la pantalla.
function motherHand(side,y,reach,a){const x0=side<0?-6:W+6,dir=-side,w=Math.sin(tick*.06+y)*5;ctx.save();ctx.globalAlpha=a;ctx.lineCap='round';
 ctx.strokeStyle='#0c0612';ctx.lineWidth=26;ctx.beginPath();ctx.moveTo(x0,y+10);ctx.quadraticCurveTo(x0+dir*reach*.5,y+w,x0+dir*reach,y+w*.6);ctx.stroke();
 const hx=x0+dir*reach,hy=y+w*.6;ctx.fillStyle='#d8d0d6';ctx.beginPath();ctx.ellipse(hx,hy,15,12,0,0,TAU);ctx.fill();
 for(let k=-2;k<=2;k++){const ang=(dir>0?0:Math.PI)+k*.32+Math.sin(tick*.08+k)*.08,len=34+(2-Math.abs(k))*4,fx=hx+Math.cos(ang)*len,fy=hy+Math.sin(ang)*len;
  ctx.strokeStyle='#d8d0d6';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(hx+Math.cos(ang)*8,hy+Math.sin(ang)*8);ctx.lineTo(fx,fy);ctx.stroke();
  ctx.strokeStyle='#c9c4cf';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+Math.cos(ang)*14,fy+Math.sin(ang)*14);ctx.stroke();}
 ctx.restore();}
const M_EYES=[[26,330],[454,470],[24,540],[456,250],[30,420],[450,360]];
function drawMother(d){if(d<=.05)return;
 const n=Math.min(M_EYES.length,1+Math.floor(d*5));
 for(let i=0;i<n;i++){const blink=Math.sin(tick*.03+i*2.1)>.92?0:1;motherEye(M_EYES[i][0],M_EYES[i][1],clamp01(d*1.2)*(.55+.45*Math.sin(tick*.05+i))*blink,6);motherEye(M_EYES[i][0]+(M_EYES[i][0]<240?16:-16),M_EYES[i][1],clamp01(d*1.2)*(.55+.45*Math.sin(tick*.05+i))*blink,6);}
 if(d>=.35){const reach=30+d*120,a=clamp01(d*1.1);motherHand(-1,470,reach,a);motherHand(1,400,reach*.9,a);if(d>=.75){motherHand(-1,280,reach*.7,a);motherHand(1,560,reach*.8,a);}}}
// Pantalla de derrota: la Otra Madre se acerca por los lados.
function drawMotherLose(a){motherHand(-1,330,88,a);motherHand(1,300,88,a);motherHand(-1,560,84,a*.9);motherHand(1,590,84,a*.9);
 motherEye(40,200,a*.8,6);motherEye(56,200,a*.8,6);motherEye(424,200,a*.8,6);motherEye(440,200,a*.8,6);}
