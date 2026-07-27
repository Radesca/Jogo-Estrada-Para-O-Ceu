// ===== ASSETS (carregados da pasta img/) =====
const CDIM={"run": [88, 120], "jump": [79, 150], "slide": [144, 80]};
const SDIM={"ira": [97, 140], "ganancia": [179, 140], "vaidade": [128, 140], "preguica": [270, 140], "inveja": [155, 140], "gula": [128, 140], "luxuria": [241, 140]};
const FDIM={"rosary": [114, 130], "book": [148, 130], "host": [132, 130], "cross": [142, 130], "dove": [174, 130], "laptop": [160, 130]};
const BGD={"w": 900, "h": 450, "road_ratio": 0.887260428410372};
function _img(src){const i=new Image();i.src=src;return i;}
const CARLO={run:_img('img/carlo_run.png'),jump:_img('img/carlo_jump.png'),slide:_img('img/carlo_slide.png')};
const SIN={
  ira:_img('img/sin_ira.png'), ganancia:_img('img/sin_ganancia.png'), vaidade:_img('img/sin_vaidade.png'),
  preguica:_img('img/sin_preguica.png'), inveja:_img('img/sin_inveja.png'), gula:_img('img/sin_gula.png'),
  luxuria:_img('img/sin_luxuria.png')
};
const FAITH={
  rosary:_img('img/item_rosary.png'), book:_img('img/item_book.png'), host:_img('img/item_host.png'),
  cross:_img('img/item_cross.png'), dove:_img('img/item_dove.png'), laptop:_img('img/item_laptop.png')
};
const BG=_img('img/fundo.jpg');
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
const startScreen=document.getElementById('start');
const overScreen=document.getElementById('over');
const finalScore=document.getElementById('finalScore');
const playBtn=document.getElementById('play');
const retryBtn=document.getElementById('retry');
const jumpBtn=document.getElementById('jumpBtn');
const duckBtn=document.getElementById('duckBtn');
const boardScreen=document.getElementById('board');
const boardList=document.getElementById('boardList');
const boardBtnStart=document.getElementById('boardBtnStart');
const viewBoardBtn=document.getElementById('viewBoardBtn');
const boardBack=document.getElementById('boardBack');
const rulesScreen=document.getElementById('rules');
const rulesBtnStart=document.getElementById('rulesBtnStart');
const rulesBack=document.getElementById('rulesBack');
const rulesPlayBtn=document.getElementById('rulesPlayBtn');
const playerNameInput=document.getElementById('playerName');
const playerInstaInput=document.getElementById('playerInsta');
const submitScoreBtn=document.getElementById('submitScoreBtn');
const submitMsg=document.getElementById('submitMsg');

// ===== PLACAR ONLINE (Supabase) =====
// 1) Crie um projeto gratis em supabase.com
// 2) Rode o SQL de criacao da tabela "scores" (ver instrucoes que te passei)
// 3) Cole aqui a URL do projeto e a "anon public key" (em Project Settings > API)
const SUPABASE_URL_RAW = 'https://rhjfbhordjshlhoyhhbf.supabase.co';       // ex: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoamZiaG9yZGpzaGxob3loaGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjAxMjMsImV4cCI6MjEwMDczNjEyM30.U_vh_SGKZNOmS5FUg4T1_x4KFOlS63dMp0xCaXsK1cY';
// normaliza: remove barra final e qualquer /rest/v1 que tenha colado junto, pra nunca duplicar o caminho
const SUPABASE_URL = SUPABASE_URL_RAW.trim().replace(/\/rest\/v1\/?.*$/,'').replace(/\/+$/,'');
const SB_READY = !SUPABASE_URL.startsWith('COLE_AQUI') && !SUPABASE_ANON_KEY.startsWith('COLE_AQUI');

async function submitScore(name, insta, scoreVal){
  if(!SB_READY) return {ok:false, msg:'Placar ainda não configurado (falta colar a URL/chave do Supabase no game.js).'};
  try{
    const res = await fetch(SUPABASE_URL+'/rest/v1/scores', {
      method:'POST',
      headers:{
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer '+SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name: name.slice(0,18), instagram: insta.slice(0,24), score: Math.floor(scoreVal) })
    });
    if(!res.ok){
      let detail='';
      try{ const j=await res.json(); detail=j.message||j.hint||j.error||''; }catch(e){}
      console.error('Supabase insert falhou', res.status, detail);
      return {ok:false, msg:'Erro '+res.status+(detail?': '+detail:'')+'. Veja o console (F12).'};
    }
    return {ok:true};
  }catch(e){ console.error('Erro de rede ao enviar placar', e); return {ok:false, msg:'Sem conexão ou bloqueio de rede. Veja o console (F12).'}; }
}

async function loadLeaderboard(){
  if(!boardList) return;
  boardList.innerHTML='<li class="boardLoading">Carregando...</li>';
  if(!SB_READY){ boardList.innerHTML='<li class="boardEmpty">Placar ainda não configurado.</li>'; return; }
  try{
    const url=SUPABASE_URL+'/rest/v1/scores?select=name,instagram,score&order=score.desc&limit=10';
    const res=await fetch(url,{headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY}});
    const rows=await res.json();
    if(!Array.isArray(rows)||!rows.length){ boardList.innerHTML='<li class="boardEmpty">Ninguém pontuou ainda. Seja o primeiro!</li>'; return; }
    boardList.innerHTML=rows.map((r,i)=>{
      const medal=['🥇','🥈','🥉'][i]||(i+1)+'.';
      const insta=r.instagram? ('@'+String(r.instagram).replace(/^@/,'')) : '';
      return '<li><span class="boardRank">'+medal+'</span><span class="boardName">'+escapeHtml(r.name||'Anônimo')+'</span><span class="boardInsta">'+escapeHtml(insta)+'</span><span class="boardScore">'+Math.floor(r.score)+'</span></li>';
    }).join('');
  }catch(e){ boardList.innerHTML='<li class="boardEmpty">Erro ao carregar. Tenta de novo.</li>'; }
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// ===== SONS (sintetizados, sem arquivos externos) =====
let actx=null;
function getActx(){ if(!actx){ try{ actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return actx; }
function beep(freq,dur,type,vol,delay){
  const ac=getActx(); if(!ac) return;
  const t0=ac.currentTime+(delay||0);
  const osc=ac.createOscillator(), gain=ac.createGain();
  osc.type=type||'square'; osc.frequency.setValueAtTime(freq,t0);
  gain.gain.setValueAtTime(0,t0);
  gain.gain.linearRampToValueAtTime(vol||0.12,t0+0.01);
  gain.gain.exponentialRampToValueAtTime(0.001,t0+dur);
  osc.connect(gain); gain.connect(ac.destination);
  osc.start(t0); osc.stop(t0+dur+0.02);
}
function sndJump(){ beep(520,0.12,'square',0.10); beep(760,0.10,'square',0.08,0.05); }
function sndCollect(comboN){ const base=740+Math.min(comboN,8)*60; beep(base,0.09,'square',0.10); beep(base*1.5,0.10,'triangle',0.08,0.04); }
function sndHit(){ beep(160,0.28,'sawtooth',0.14); beep(90,0.32,'sawtooth',0.12,0.05); }
function sndOver(){ beep(300,0.18,'triangle',0.10); beep(220,0.22,'triangle',0.10,0.15); beep(160,0.3,'triangle',0.10,0.32); }

// ---- load images ----


let W=0,H=0,scale=1,groundY=0,screenK=1,isMobile=false;
function resize(){
  W=window.innerWidth;H=window.innerHeight;
  canvas.width=Math.floor(W*devicePixelRatio);
  canvas.height=Math.floor(H*devicePixelRatio);
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  ctx.imageSmoothingEnabled=false;
  groundY=Math.round(H*0.80);          // feet line
  scale=Math.max(0.8,Math.min(1.7,W/1100));
  // ---- adaptacao para telas estreitas (celular) ----
  // quanto mais estreita a tela, menor o 'screenK' (1 = PC largo, ~0.55 = celular em pe)
  screenK=Math.max(0.5,Math.min(1,W/900));
  isMobile=(W<700)||window.matchMedia('(pointer:coarse)').matches;
}
window.addEventListener('resize',resize);resize();

function getHi(){try{return Number(localStorage.getItem('carlo_hi')||0)}catch(e){return 0}}
function setHi(v){try{localStorage.setItem('carlo_hi',v)}catch(e){}}

let running=false,gameOver=false,t=0,speed=0,score=0,hi=getHi();
let obstacles=[],items=[],bgX=0,roadX=0;
let nextObs=0,nextItem=0;
let combo=0,comboBest=0,comboPopT=0,comboPopN=0;
let particles=[];
let hitFlash=0;
let scoreSubmitted=false;

function spawnParticles(x,y){
  for(let i=0;i<10;i++){
    const a=Math.random()*Math.PI*2, sp=(1.5+Math.random()*3)*scale;
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.5*scale,life:26+Math.random()*10,maxLife:36,size:(2+Math.random()*2)*scale});
  }
}
function updateParticles(){
  for(const p of particles){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.12*scale; p.life--; }
  particles=particles.filter(p=>p.life>0);
}
function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=Math.max(0,p.life/p.maxLife);
    ctx.fillStyle='#ffe066';
    ctx.fillRect(Math.round(p.x-p.size/2),Math.round(p.y-p.size/2),Math.round(p.size),Math.round(p.size));
  }
  ctx.globalAlpha=1;
}

// player (Dino-like physics tuned by scale)
const player={x:0,y:0,vy:0,w:0,h:0,state:'run',duckTimer:0,onGround:true,blink:0,run:0,jumps:0,fastFall:false};

// ---- difficulty (Dino-style ramp) ----
const BASE_SPEED=7.2, MAX_SPEED=32, ACCEL=0.0050;

const sinsList=[
  {name:'IRA',img:'ira',need:'jump'},
  {name:'GANÂNCIA',img:'ganancia',need:'jump'},
  {name:'VAIDADE',img:'vaidade',need:'jump'},
  {name:'PREGUIÇA',img:'preguica',need:'jump'},
  {name:'GULA',img:'gula',need:'jump'},
  {name:'INVEJA',img:'inveja',need:'duck'},
  {name:'LUXÚRIA',img:'luxuria',need:'duck'},
];
const faithList=['rosary','book','host','cross','dove','laptop'];

function reset(){
  t=0;speed=BASE_SPEED;score=0;obstacles=[];items=[];bgX=0;roadX=0;
  combo=0;comboBest=0;comboPopT=0;particles=[];hitFlash=0;scoreSubmitted=false;
  if(boardScreen)boardScreen.classList.add('hidden');
  if(rulesScreen)rulesScreen.classList.add('hidden');
  if(playerNameInput)playerNameInput.value='';
  if(playerInstaInput)playerInstaInput.value='';
  if(submitMsg){submitMsg.textContent='';submitMsg.className='submitMsg';}
  if(submitScoreBtn){submitScoreBtn.disabled=false;submitScoreBtn.textContent='ENVIAR PONTUAÇÃO';}
  getActx();
  const ph=Math.round(120*scale);
  player.w=Math.round(ph*CDIM.run[0]/CDIM.run[1]);
  player.h=ph;
  player.x=Math.round(W*0.14);
  player.y=groundY-player.h;player.vy=0;player.state='run';player.duckTimer=0;player.duckHeld=false;player.onGround=true;player.blink=0;player.run=0;player.jumps=0;player.fastFall=false;
  nextObs=60;nextItem=90;
  running=true;gameOver=false;document.body.classList.add('playing');
  startScreen.classList.add('hidden');overScreen.classList.add('hidden');
}
function startGame(ev){if(ev){ev.preventDefault();ev.stopPropagation();}reset();}
function showRules(ev){if(ev){ev.preventDefault();ev.stopPropagation();}startScreen.classList.add('hidden');if(rulesScreen)rulesScreen.classList.remove('hidden');}
['click','pointerdown','touchstart'].forEach(evt=>{
  playBtn.addEventListener(evt,showRules,{passive:false});
  if(rulesPlayBtn) rulesPlayBtn.addEventListener(evt,startGame,{passive:false});
  retryBtn.addEventListener(evt,function(e){if(e){e.preventDefault();e.stopPropagation();}goToMenu();},{passive:false});
});

// ---- controls (Dino) ----
function jump(){if(!running||gameOver)return;
  if(player.onGround){player.vy=-20*scale;player.onGround=false;player.state='jump';player.jumps=1;sndJump();}
  else if(player.jumps<2){player.vy=-15*scale;player.jumps=2;player.state='jump';sndJump();}
}
function pressDown(){
  if(!running||gameOver)return;
  player.duckHeld=true;            // marca segurado (serve pra deslizar no chao E ao pousar)
  if(!player.onGround){
    player.fastFall=true;          // no ar: cair rapido (persiste ate aterrissar)
    if(player.vy < 12*scale) player.vy = 12*scale;
  }
}
function releaseDown(){
  player.duckHeld=false;
  // NAO desliga fastFall aqui: uma vez no ar caindo rapido, continua ate aterrissar.
}
function duck(on){ if(on) pressDown(); else releaseDown(); }
function onStartKey(e){
  if(running)return;
  const rulesOpen = rulesScreen && !rulesScreen.classList.contains('hidden');
  if(rulesOpen) startGame(e); else showRules(e);
}
function isTypingInField(e){
  const tag=(e.target&&e.target.tagName)||'';
  return tag==='INPUT'||tag==='TEXTAREA'||(e.target&&e.target.isContentEditable);
}
window.addEventListener('keydown',e=>{
  if(isTypingInField(e))return;
  if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(e.repeat)return;if(!running){onStartKey(e);}else jump();}
  if(['ArrowDown','ShiftLeft','ShiftRight','KeyS'].includes(e.code)){e.preventDefault();if(!e.repeat)duck(true);}
  if(e.code==='Enter'&&!running)onStartKey(e);
});
window.addEventListener('keyup',e=>{if(isTypingInField(e))return;if(['ArrowDown','ShiftLeft','ShiftRight','KeyS'].includes(e.code))duck(false);});
canvas.addEventListener('pointerdown',e=>{if(!running)return;if(e.clientX<W/2)duck(true);else jump();});
canvas.addEventListener('pointerup',()=>duck(false));
if(jumpBtn){
    // SO touchstart no celular OU pointerdown no desktop (nunca os dois juntos)
    jumpBtn.addEventListener('touchstart',e=>{e.preventDefault();jump();},{passive:false});
    jumpBtn.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){e.preventDefault();jump();}});
  }
  if(duckBtn){
    // ---- CELULAR: rastrear o dedo por touch.identifier ----
    let duckTouchId=null;
    duckBtn.addEventListener('touchstart',e=>{
      e.preventDefault();
      if(duckTouchId===null && e.changedTouches.length){
        duckTouchId=e.changedTouches[0].identifier;
        duck(true);
      }
    },{passive:false});
    function endDuckTouch(e){
      // so solta se o dedo que terminou for o MESMO que apertou (ignora cancels espurios de outros toques)
      for(const tc of e.changedTouches){
        if(tc.identifier===duckTouchId){
          duckTouchId=null;
          duck(false);
          break;
        }
      }
    }
    duckBtn.addEventListener('touchend',e=>{e.preventDefault();endDuckTouch(e);},{passive:false});
    duckBtn.addEventListener('touchcancel',e=>{e.preventDefault();endDuckTouch(e);},{passive:false});
    // ---- DESKTOP (mouse) ----
    duckBtn.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){e.preventDefault();duck(true);}});
    duckBtn.addEventListener('pointerup',e=>{if(e.pointerType==='mouse'){e.preventDefault();duck(false);}});
    duckBtn.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){duck(false);}});
  }

function rects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}

function tooClose(x,w,list,pad){
  for(const o of list){ if(x < o.x+o.w+pad && x+w > o.x-pad) return true; }
  return false;
}
function spawnObstacleNear(){
  const s=sinsList[Math.floor(Math.random()*sinsList.length)];
  const sz=Math.round((isMobile?52:60)*scale);
  const d=SDIM[s.img];const w=sz, h=sz*d[1]/d[0];
  // posiciona logo a frente do item recem criado
  let refx=W+40;
  if(items.length){ refx=Math.max(...items.map(i=>i.x)); }
  const near=(70+Math.random()*60)*scale;
  let x=refx+w+near;
  // FOLGA SEGURA: nunca colar em item NEM em outro obstaculo (senao vira parede impossivel)
  const padItem=30*scale;
  const padObs=Math.max(140*scale, w+90*scale);   // distancia minima entre obstaculos
  let guard=0;
  while((tooClose(x,w,items,padItem)||tooClose(x,w,obstacles,padObs)) && guard<40){ x+=24*scale; guard++; }
  // se mesmo assim nao achou espaco seguro, cancela o combo (melhor nao gerar do que gerar impossivel)
  if(tooClose(x,w,obstacles,padObs)) return;
  const y=s.need==='duck' ? groundY-Math.round(player.h*0.95) - Math.round(h*0.2) : groundY-h;
  obstacles.push({x,y,w,h,sin:s});
}
function spawnObstacle(){
  const s=sinsList[Math.floor(Math.random()*sinsList.length)];
  const sz=Math.round((isMobile?52:60)*scale);
  const d=SDIM[s.img];const w=sz, h=sz*d[1]/d[0];
  let x=W+40;
  const pad=36*scale;
  const padObs=Math.max(140*scale, w+90*scale);
  let guard=0;
  while((tooClose(x,w,items,pad)||tooClose(x,w,obstacles,padObs)) && guard<20){ x+=40*scale; guard++; }
  const y=s.need==='duck' ? groundY-Math.round(player.h*0.95) - Math.round(h*0.2) : groundY-h;
  obstacles.push({x,y,w,h,sin:s});
}
function spawnItem(){
  const key=faithList[Math.floor(Math.random()*faithList.length)];
  const sz=Math.round((isMobile?52:60)*scale);
  const d=FDIM[key];const w=sz,h=sz*d[1]/d[0];
  let x=W+40;
  const pad=36*scale;
  let guard=0;
  while(tooClose(x,w,obstacles,pad) && guard<12){ x+=40*scale; guard++; }
  // sempre acima da cabeca: exige pulo
  const y=groundY-Math.round(player.h*1.12)-Math.round(Math.random()*player.h*0.35);
  items.push({x,y,w,h,key,got:false,bob:Math.random()*6.28});
}

function text(txt,x,y,size,color,align){
  ctx.font=size+"px 'Press Start 2P'";ctx.textAlign=align||'left';
  ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillText(txt,x+2,y+2);
  ctx.fillStyle=color;ctx.fillText(txt,x,y);
}

// ---- background: sky/clouds from real art, scrolling; clean road strip ----
function drawBackground(){
  // SKY portion of the art (above its road) scaled to fill screen down to groundY
  const srcRoad=BGD.road_ratio;          // 0..srcRoad is sky in source
  const skySrcH=Math.round(BGD.h*srcRoad);
  // scale sky so it fills width; tile horizontally with slow scroll
  const destW=W, destH=groundY;          // fill from top to ground line
  if(BG.complete&&BG.naturalWidth){
    const tileW=Math.round(destH/skySrcH*BGD.w);
    bgX=(bgX - speed*0.3);
    let startx=bgX%tileW; if(startx>0)startx-=tileW;
    for(let x=startx;x<W;x+=tileW){
      ctx.drawImage(BG,0,0,BGD.w,skySrcH, Math.round(x),0, tileW,destH);
    }
  }else{
    const g=ctx.createLinearGradient(0,0,0,groundY);g.addColorStop(0,'#4d89de');g.addColorStop(1,'#cfe9ff');ctx.fillStyle=g;ctx.fillRect(0,0,W,groundY);
  }
  // ROAD strip (clean, Dino-like) from groundY down
  const rh=H-groundY;
  ctx.fillStyle='#3a3a42';ctx.fillRect(0,groundY,W,rh);
  ctx.fillStyle='#2c2c33';ctx.fillRect(0,groundY+Math.round(rh*0.5),W,rh*0.5);
  // top edge line
  ctx.fillStyle='#d8c89a';ctx.fillRect(0,groundY-3,W,3);
  // dashes scrolling (speed-linked)
  roadX=(roadX-speed)%80;
  ctx.fillStyle='#f3e2a0';
  const dy=groundY+Math.round(rh*0.42);
  for(let x=roadX;x<W;x+=80)ctx.fillRect(Math.round(x),dy,40,5);
}

function drawCarlo(){
  const isSlide=player.state==='slide',isJump=player.state==='jump';
  if(player.blink>0&&Math.floor(t/3)%2===0)return;
  // shadow
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();
  ctx.ellipse(player.x+player.w/2,groundY+4,(isSlide?player.w*0.55:player.w*0.42),7,0,0,Math.PI*2);ctx.fill();
  let img,iw,ih,dx,dy;
  if(isSlide){
    img=CARLO.slide;ih=Math.round(player.h*0.55);iw=ih*CDIM.slide[0]/CDIM.slide[1];
    dx=player.x+player.w/2-iw*0.42;dy=groundY-ih;
  }else if(isJump){
    img=CARLO.jump;ih=Math.round(player.h*1.18);iw=ih*CDIM.jump[0]/CDIM.jump[1];
    dx=player.x+player.w/2-iw/2;dy=player.y+player.h-ih;
  }else{
    img=CARLO.run;ih=player.h;iw=ih*CDIM.run[0]/CDIM.run[1];
    const bob=Math.sin(t/5)*3;
    dx=player.x+player.w/2-iw/2;dy=player.y+player.h-ih+bob;
  }
  if(img.complete&&img.naturalWidth)ctx.drawImage(img,Math.round(dx),Math.round(dy),Math.round(iw),Math.round(ih));
}

function drawSin(o){
  const im=SIN[o.sin.img];
  ctx.fillStyle='rgba(0,0,0,.20)';ctx.beginPath();ctx.ellipse(o.x+o.w/2,groundY+4,o.w*0.42,7,0,0,Math.PI*2);ctx.fill();
  if(im&&im.complete&&im.naturalWidth){
    // leve aura vermelha de "perigo" atras do sprite
    ctx.save();
    ctx.globalAlpha=0.28+0.12*Math.sin(t/10);
    ctx.fillStyle='#ff3b3b';
    ctx.beginPath();ctx.ellipse(o.x+o.w/2,o.y+o.h/2,o.w*0.6,o.h*0.6,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
    // sprite normal
    ctx.drawImage(im,Math.round(o.x),Math.round(o.y),Math.round(o.w),Math.round(o.h));
    // tingimento vermelho suave SO sobre os pixels do sprite
    ctx.save();
    const oc=drawSin._buf||(drawSin._buf=document.createElement('canvas'));
    const octx=drawSin._bx||(drawSin._bx=oc.getContext('2d'));
    oc.width=Math.max(1,Math.round(o.w));oc.height=Math.max(1,Math.round(o.h));
    octx.clearRect(0,0,oc.width,oc.height);
    octx.imageSmoothingEnabled=false;
    octx.drawImage(im,0,0,oc.width,oc.height);
    octx.globalCompositeOperation='source-atop';
    octx.fillStyle='rgba(200,20,20,0.30)';
    octx.fillRect(0,0,oc.width,oc.height);
    octx.globalCompositeOperation='source-over';
    ctx.drawImage(oc,Math.round(o.x),Math.round(o.y));
    ctx.restore();
  }
  // nome do pecado por cima (com sombra para ler em qualquer fundo)
  const ns=Math.max(7,Math.round((isMobile?7:9)));
  text(o.sin.name, o.x+o.w/2, o.y-8, ns, '#ff5252', 'center');
}

function drawItem(it){
  const bob=Math.sin(t/12+it.bob)*5;
  const im=FAITH[it.key];
  // halo glow
  ctx.fillStyle='rgba(255,240,150,.25)';ctx.beginPath();
  ctx.arc(it.x+it.w/2,it.y+it.h/2+bob,it.w*0.62+Math.sin(t/8)*3,0,Math.PI*2);ctx.fill();
  if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,Math.round(it.x),Math.round(it.y+bob),Math.round(it.w),Math.round(it.h));
}

function drawHUD(){
  text('PONTOS '+Math.floor(score),22,40,16,'#fff');
  text('RECORDE '+Math.max(hi,Math.floor(score)),22,68,11,'#ffe66d');
  if(!isMobile)text('↑ PULA   ↓ DESLIZA',W-22,40,11,'#fff','right');
  if(comboPopT>0 && comboPopN>1){
    const a=Math.min(1,comboPopT/12);
    ctx.save();ctx.globalAlpha=a;
    text('COMBO x'+comboPopN,W/2,90,Math.round((isMobile?12:16)+Math.min(comboPopN,6)),'#ffe66d','center');
    ctx.restore();
  }
}

function update(){
  if(!running||gameOver)return;
  t++;
  // no celular (tela estreita) a velocidade do mundo eh reduzida para dar tempo de reagir
  const vBase=BASE_SPEED*(isMobile?0.78:1);
  const vMax =MAX_SPEED *(isMobile?0.80:1);
  const vAcc =ACCEL     *(isMobile?0.75:1);
  speed=Math.min(vMax, vBase + t*vAcc + score*0.0009*(isMobile?0.8:1));
  score+=speed*0.10;

  // physics
  let grav=0.85*scale;
  if(player.fastFall && !player.onGround){grav=2.6*scale;}
  player.vy+=grav;
  if(player.fastFall && player.vy>26*scale)player.vy=26*scale;
  player.y+=player.vy;
  const floor=groundY-player.h;
  // land detection
  if(player.y>=floor){player.y=floor;player.vy=0;player.onGround=true;player.jumps=0;player.fastFall=false;}
  else{player.onGround=false;}
  // state: slide only while on ground AND button held; jump while airborne; else run
  if(player.duckHeld && player.onGround){
    player.state='slide';
    player.curH=Math.round(player.h*0.42);player.curW=Math.round(player.w*1.5);
  }else if(!player.onGround){
    player.state='jump';
    player.curH=player.h;player.curW=player.w;
  }else{
    player.state='run';
    player.curH=player.h;player.curW=player.w;
  }

  // spawns scale with speed (closer together as faster, but fair gap)
  nextObs--;nextItem--;
  if(nextObs<=0){spawnObstacle();const gapMin=isMobile?58:34;const gap=Math.max(gapMin,(isMobile?150:115)-speed*4-score*0.006);nextObs=gap+Math.random()*Math.max(isMobile?28:16,45-score*0.002);}
  if(nextItem<=0){
    spawnItem();
    nextItem=58+Math.random()*55;
    // COMBO ARRISCADO: às vezes um pecado nasce logo perto do item bom
    if(Math.random()<(isMobile?0.45:0.62)){
      spawnObstacleNear();
      nextObs=Math.max(nextObs,40+Math.random()*30); // evita amontoar logo em seguida
    }
  }

  obstacles.forEach(o=>o.x-=speed);
  items.forEach(i=>i.x-=speed);
  obstacles=obstacles.filter(o=>o.x+o.w>-60);
  // item saiu da tela sem ser coletado: quebra o combo
  items=items.filter(i=>{
    const alive=i.x+i.w>-60&&!i.got;
    if(!alive && !i.got && i.x+i.w<=-60) combo=0;
    return alive;
  });

  updateParticles();
  if(comboPopT>0)comboPopT--;

  // player collision box (use current duck/normal size, with forgiveness margin)
  const m=8*scale;
  const pb={x:player.x+m, y:(player.state==='slide'?groundY-player.curH:player.y)+m, w:player.curW-2*m, h:player.curH-2*m};
  for(const o of obstacles){
    const ob={x:o.x+o.w*0.18,y:o.y+o.h*0.16,w:o.w*0.64,h:o.h*0.7};
    if(rects(pb,ob)){player.blink=45;hitFlash=8;sndHit();endGame();return;}
  }
  for(const it of items){
    const ib={x:it.x,y:it.y,w:it.w,h:it.h};
    if(rects(pb,ib)){
      it.got=true;
      combo++;comboBest=Math.max(comboBest,combo);
      const bonus=100+Math.min(combo-1,10)*15;
      score+=bonus;
      sndCollect(combo);
      spawnParticles(it.x+it.w/2,it.y+it.h/2);
      comboPopT=40;comboPopN=combo;
    }
  }
}

function endGame(){gameOver=true;running=false;document.body.classList.remove('playing');hi=Math.max(hi,Math.floor(score));setHi(hi);
  finalScore.textContent='PONTOS: '+Math.floor(score);
  overScreen.classList.remove('hidden');
  sndOver();
}
function goToMenu(){
  document.body.classList.remove('playing');
  overScreen.classList.add('hidden');
  if(boardScreen)boardScreen.classList.add('hidden');
  if(rulesScreen)rulesScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
}

// ===== envio de pontuacao / placar =====
if(submitScoreBtn) submitScoreBtn.addEventListener('click', async ()=>{
  if(scoreSubmitted) return;
  const name=playerNameInput.value.trim();
  const insta=playerInstaInput.value.trim();
  if(!name){ submitMsg.textContent='Digite seu nome pra entrar no placar.'; submitMsg.className='submitMsg err'; return; }
  submitScoreBtn.disabled=true; submitScoreBtn.textContent='ENVIANDO...';
  const r=await submitScore(name,insta,score);
  if(r.ok){
    scoreSubmitted=true;
    submitMsg.textContent='Pontuação enviada! Boa sorte na promoção 🐑';
    submitMsg.className='submitMsg';
    submitScoreBtn.textContent='ENVIADO ✔';
  }else{
    submitScoreBtn.disabled=false; submitScoreBtn.textContent='ENVIAR PONTUAÇÃO';
    submitMsg.textContent=r.msg||'Erro ao enviar.'; submitMsg.className='submitMsg err';
  }
});
let boardOrigin='start';
function openBoard(origin){ boardOrigin=origin; overScreen.classList.add('hidden'); startScreen.classList.add('hidden'); if(boardScreen)boardScreen.classList.remove('hidden'); loadLeaderboard(); }
if(viewBoardBtn) viewBoardBtn.addEventListener('click', ()=>openBoard('over'));
if(boardBtnStart) boardBtnStart.addEventListener('click', ()=>openBoard('start'));
if(boardBack) boardBack.addEventListener('click', ()=>{ boardScreen.classList.add('hidden'); if(boardOrigin==='over') overScreen.classList.remove('hidden'); else startScreen.classList.remove('hidden'); });
if(rulesBtnStart) rulesBtnStart.addEventListener('click', showRules);
if(rulesBack) rulesBack.addEventListener('click', ()=>{ rulesScreen.classList.add('hidden'); startScreen.classList.remove('hidden'); });

function draw(){
  ctx.clearRect(0,0,W,H);
  drawBackground();
  items.forEach(drawItem);
  obstacles.forEach(drawSin);
  drawCarlo();
  drawParticles();
  drawHUD();
  if(hitFlash>0){
    ctx.fillStyle='rgba(255,40,40,'+(hitFlash/8*0.35)+')';
    ctx.fillRect(0,0,W,H);
    hitFlash--;
  }
}
// ===== LOOP COM PASSO FIXO (60 updates/seg) — independente da taxa do monitor =====
let _lastTime=0, _acc=0;
const STEP=1000/60;            // 1 update a cada 16.67ms (60fps logico)
function loop(now){
  if(!_lastTime)_lastTime=now||0;
  let frame=(now||0)-_lastTime;
  _lastTime=now||0;
  if(frame>250)frame=250;      // evita salto gigante se a aba ficou em segundo plano
  _acc+=frame;
  // roda a logica em passos fixos, quantas vezes forem necessarias
  while(_acc>=STEP){
    if(running&&!gameOver)update();
    _acc-=STEP;
  }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
