
'use strict';
const VERSION='v1.4.0';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const W=480,H=760,R=24,COLS=9,ROWS=11,ROWH=R*Math.sqrt(3),TOP=60,AMMO0=25,MICE0=6;
const CX=240,CY=655,CANCEL_Y=692; // cañón
const COLORS=[
 {n:'Amarillo Impermeable',f:'#ffd166',b:'#b8860b'},
 {n:'Azul Cabello',f:'#3a86ff',b:'#1d4ed8'},
 {n:'Morado Otro Mundo',f:'#9b5de5',b:'#5a189a'},
 {n:'Verde Piedra Mágica',f:'#06d6a0',b:'#047857'},
 {n:'Rosa Palacio',f:'#ff5d8f',b:'#be185d'},
 {n:'Naranja Calabaza',f:'#ff9f43',b:'#c2410c'},
 {n:'Celeste Niebla',f:'#4dd0e1',b:'#0e7490'}];
const cv=document.getElementById('c'),ctx=cv.getContext('2d'),stage=document.getElementById('stage');
const bombBtn=document.getElementById('bomb-btn'),stoneBtn=document.getElementById('magic-stone-btn'),modal=document.getElementById('modal');
const TAU=Math.PI*2, rnd=(a,b)=>a+Math.random()*(b-a), ri=n=>Math.floor(Math.random()*n);

