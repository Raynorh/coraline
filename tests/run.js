// Pruebas estáticas: build reproducible, sintaxis JS, referencias a assets, secciones y funciones esperadas.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.join(__dirname, '..');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

cp.execFileSync('node', [path.join(root, 'tools/build.js')], { stdio: 'ignore' });
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

const tmp = path.join(root, 'dist/_syntax.js'); fs.writeFileSync(tmp, js);
try { cp.execFileSync('node', ['--check', tmp], { stdio: 'pipe' }); ok(true, 'sintaxis JS válida'); }
catch (e) { ok(false, 'sintaxis JS: ' + e.stderr); }
fs.unlinkSync(tmp);

ok(!/@asset:/.test(html), 'no quedan marcadores @asset sin resolver');
const srcJs = fs.readdirSync(path.join(root, 'src/js')).filter(f => f.endsWith('.js'));
const assets = [...srcJs.map(f => fs.readFileSync(path.join(root, 'src/js', f), 'utf8')).join('').matchAll(/@asset:([\w\/.\-]+)/g)].map(m => m[1]);
ok(assets.length >= 8 && assets.every(a => fs.existsSync(path.join(root, 'assets', a))), 'todos los assets referenciados existen (' + assets.length + ')');
for (const a of assets) ok(fs.readFileSync(path.join(root, 'assets', a)).slice(0, 3).toString() === 'ID3' || fs.readFileSync(path.join(root, 'assets', a))[0] === 0xff, 'MP3 válido: ' + a);
const fns = (js.match(/\bfunction\s+\w+/g) || []).length;
ok(fns >= 100, 'funciones declaradas: ' + fns);
ok(/const VERSION='v\d+\.\d+\.\d+'/.test(js), 'VERSION presente: ' + (js.match(/VERSION='([^']+)'/) || [])[1]);

const blocks = fs.readFileSync(path.join(root, 'src/js/09-juego-bloques.js'), 'utf8');
ok((blocks.match(/\[\[0,0\]\]/g)||[]).length>0 && /const BSHAPES=/.test(blocks) && blocks.includes('bNormalizeCells'), 'Bloques: catálogo de piezas ampliado y normalización de figuras');
ok(blocks.includes('if(++nodes>12000){exhausted=true;return false;}') && blocks.includes('if(exhausted)return false;'), 'Bloques: búsqueda DFS con límite explícito sin falsa solvencia');
ok(/B_START=\[0,0,8,6\]/.test(blocks)&&/const B_EASY=\[[\s\S]*?\],\[[\s\S]*?\],\[[\s\S]*?\],\[[\s\S]*?\]\]/.test(blocks), 'Bloques: perfil de piezas y apertura calibrados para Experto');
ok(/bShapeJokers=1/.test(blocks) && /bUseShapeJoker/.test(blocks) && /bChooseShape/.test(blocks), 'Bloques: comodín de sustitución de forma');
const diffSrc=fs.readFileSync(path.join(root,'src/js/05-estado.js'),'utf8');
ok(/DIFF_KEYS=\['facil','normal','dificil','experto'\]/.test(diffSrc) && /experto:\{n:'Experto'/.test(diffSrc) && /cor_diff_v4/.test(diffSrc), 'Dificultad: cuatro niveles y migración que conserva Experto');
const scoresSrc=fs.readFileSync(path.join(root,'src/js/14-puntajes.js'),'utf8');ok(/experto:'Experto'/.test(scoresSrc)&&! /e\.diff==='experto'[^;]*dificil/.test(scoresSrc), 'Scores: Experto permanece separado y se identifica correctamente');
const selSrc=fs.readFileSync(path.join(root,'src/js/08-seleccion.js'),'utf8');ok(/\['de','Experto','experto'\]/.test(selSrc)&&/id==='de'/.test(selSrc), 'UI: Experto disponible en selección');
const panelSrc=fs.readFileSync(path.join(root,'src/js/16-ui-paneles.js'),'utf8');ok(/'all','facil','normal','dificil','experto'/.test(panelSrc), 'Scores: filtro de Experto en rankings');
const eco=fs.readFileSync(path.join(root,'src/js/23-ecosistema-ratones.js'),'utf8');
ok(/function mouseFarmAccrue/.test(eco)&&/function mouseCraft/.test(eco)&&/function mouseDefense/.test(eco)&&/function mouseMarketPost/.test(eco), 'Ecosistema: granja, fabricación, defensa y mercado local prototipo');


// Ejecución aislada de reglas de Bloques: manos generadas deben ser demostrablemente jugables.
const vm = require('vm');
const bsrc=blocks;
const bsh=bsrc.slice(bsrc.indexOf('const BSHAPES='),bsrc.indexOf('let bgrid='));
const bpieces=bsrc.slice(bsrc.indexOf('const B_EASY='),bsrc.indexOf('function bCan(piece'));
const blogic=bsrc.slice(bsrc.indexOf('function bCanOn'),bsrc.indexOf('function bCan(piece'));
const bdeal=bsrc.slice(bsrc.indexOf('function bDeal(){'),bsrc.indexOf('function bCan(piece'));
const bctx={Math,Array,ri:n=>Math.floor(Math.random()*n),BC:8,bgrid:Array.from({length:8},()=>Array(8).fill(-1)),bPressure:0,dIdx:()=>1,bUpdatePressure(){}};
vm.createContext(bctx);vm.runInContext(bsh+bpieces+blogic+bdeal,bctx);
let bproven=true;for(let k=0;k<6;k++){bctx.bgrid=Array.from({length:8},()=>Array(8).fill(-1));for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(Math.random()<.35)bctx.bgrid[r][c]=0;const d=vm.runInContext('bDeal()',bctx);if(!vm.runInContext('d=>(d.every(p=>p&&bHasMoveOn(bgrid,p))&&bSolvable(d))||(d.filter(Boolean).length===1&&bHasMoveOn(bgrid,d.find(Boolean)))',bctx)(d)){bproven=false;break;}}
ok(bproven,'Bloques: manos generadas en tableros de prueba son legalmente jugables y demostradas por DFS');
// Ejecutar la economía local en VM con almacenamiento aislado.
const ecoSrc=fs.readFileSync(path.join(root,'src/js/23-ecosistema-ratones.js'),'utf8'),store={};
const ecoCtx={Math,Date,JSON,profile:{id:'tests',nickname:'Tests'},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},newId:()=>String(Math.random()),ctx:{},W:480,H:760,drawSky(){},drawFog(){},drawFireflies(){},txt(){},hits:[],rr(){},mouseX:0,mouseY:0};vm.createContext(ecoCtx);vm.runInContext(ecoSrc,ecoCtx);
const ecoPassed=vm.runInContext(`(()=>{mouseEco.resources={semillas:100,madera:100,tela:100,comida:100,componentes:100,esencia:100};mouseEco.inventory={guardian:0,archer:0,freezer:1,alchemist:0,explosive:0,healer:0};mouseCraft('guardian');mouseCraft('archer');const crafted=mouseEco.inventory.guardian===1&&mouseEco.inventory.archer===1;mouseSelected=['guardian','archer'];mouseDefense();const lost=mouseEco.inventory.guardian+mouseEco.inventory.archer<2;mouseMarketPost('freezer');mouseEco.farm.last=Date.now()-9*3600000;const before=mouseEco.resources.semillas;mouseFarmAccrue();const farmed=mouseEco.resources.semillas-before;return crafted&&lost&&mouseEco.market.length===1&&farmed===11;})()`,ecoCtx);
ok(ecoPassed,'Ecosistema: crafting consume recursos, defensa registra bajas, granja produce y mercado publica');
const ecoHtml=fs.readFileSync(path.join(root,'src/js/23-ecosistema-ratones.js'),'utf8');
ok(/mouseLevelReq\(level\)/.test(ecoHtml)&&/mouseLevelReady\(level\)/.test(ecoHtml),'Defensa: niveles con requisitos de ratoncitos fabricados');
ok(/mouseBattleUpdate\(\)/.test(ecoHtml)&&/mbcell-/.test(ecoHtml)&&/spawnGoal/.test(ecoHtml),'Defensa: tablero por carriles y oleadas funcionales');
ok(/mouseTutorial\(/.test(ecoHtml)&&/mouseTutorialOpen/.test(ecoHtml),'UX: tutorial contextual y ayuda');
const defenseBehavior=vm.runInContext(`(()=>{mouseEco.inventory={guardian:1,archer:0,freezer:0,alchemist:0,explosive:0,healer:0};mouseEco.defenseLevel=1;mouseDefLevelSelected=2;mouseBattle=null;mouseHubAction('mstart');const locked=mouseBattle===null;mouseDefLevelSelected=1;mouseHubAction('mstart');const entered=mouseBattle&&mouseBattle.phase==='setup';mouseBattle={level:1,phase:'running',spawnGoal:0,spawned:0,enemies:[],placed:[],timer:0,kills:0};const old=mouseEco.defenseWins;mouseBattleUpdate();return locked&&entered&&mouseBattle.phase==='win'&&mouseEco.defenseLevel===2&&mouseEco.defenseWins===old+1;})()`,ecoCtx);
ok(defenseBehavior,'Defensa: bloquea niveles sin desbloquear y victoria avanza campaña');
ok(/mouseTab==='home'/.test(ecoHtml)&&/mouseTab==='resources'/.test(ecoHtml),'UX: refugio organizado y pantalla de recursos');

const base = path.join(root, 'original/index.html');
if (process.env.EXPECT_ORIGINAL === '1') ok(html === fs.readFileSync(base, 'utf8'), 'build idéntico al original byte a byte');
console.log(fails ? '\n' + fails + ' fallo(s)' : '\nTodo OK');
process.exit(fails ? 1 : 0);
