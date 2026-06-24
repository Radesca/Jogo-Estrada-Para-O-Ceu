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

// ---- load images ----


let W=0,H=0,scale=1,groundY=0;
function resize(){
  W=window.innerWidth;H=window.innerHeight;
  canvas.width=Math.floor(W*devicePixelRatio);
  canvas.height=Math.floor(H*devicePixelRatio);
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  ctx.imageSmoothingEnabled=false;
  groundY=Math.round(H*0.80);          // feet line
  scale=Math.max(0.8,Math.min(1.7,W/1100));
}
window.addEventListener('resize',resize);resize();

function getHi(){try{return Number(localStorage.getItem('carlo_hi')||0)}catch(e){return 0}}
function setHi(v){try{localStorage.setItem('carlo_hi',v)}catch(e){}}

let running=false,gameOver=false,t=0,speed=0,score=0,hi=getHi();
let obstacles=[],items=[],bgX=0,roadX=0;
let nextObs=0,nextItem=0;

// player (Dino-like physics tuned by scale)
const player={x:0,y:0,vy:0,w:0,h:0,state:'run',duckTimer:0,onGround:true,blink:0,run:0};

// ---- difficulty (Dino-style ramp) ----
const BASE_SPEED=7.2, MAX_SPEED=18, ACCEL=0.0020;

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
  const ph=Math.round(120*scale);
  player.w=Math.round(ph*CDIM.run[0]/CDIM.run[1]);
  player.h=ph;
  player.x=Math.round(W*0.14);
  player.y=groundY-player.h;player.vy=0;player.state='run';player.duckTimer=0;player.duckHeld=false;player.onGround=true;player.blink=0;player.run=0;
  nextObs=60;nextItem=90;
  running=true;gameOver=false;document.body.classList.add('playing');
  startScreen.classList.add('hidden');overScreen.classList.add('hidden');
}
function startGame(ev){if(ev){ev.preventDefault();ev.stopPropagation();}reset();}
['click','pointerdown','touchstart'].forEach(evt=>{
  playBtn.addEventListener(evt,startGame,{passive:false});
  retryBtn.addEventListener(evt,function(e){if(e){e.preventDefault();e.stopPropagation();}goToMenu();},{passive:false});
});

// ---- controls (Dino) ----
function jump(){if(!running||gameOver)return;if(player.onGround){player.vy=-17*scale;player.onGround=false;player.state='jump';}}
function duck(on){if(!running||gameOver)return;player.duckHeld=on;}
window.addEventListener('keydown',e=>{
  if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!running){startGame(e);}else jump();}
  if(['ArrowDown','ShiftLeft','ShiftRight','KeyS'].includes(e.code)){e.preventDefault();duck(true);}
  if(e.code==='Enter'&&!running)startGame(e);
});
window.addEventListener('keyup',e=>{if(['ArrowDown','ShiftLeft','ShiftRight','KeyS'].includes(e.code))duck(false);});
canvas.addEventListener('pointerdown',e=>{if(!running)return;if(e.clientX<W/2)duck(true);else jump();});
canvas.addEventListener('pointerup',()=>duck(false));
if(jumpBtn){
    jumpBtn.addEventListener('touchstart',e=>{e.preventDefault();jump();},{passive:false});
    jumpBtn.addEventListener('pointerdown',e=>{e.preventDefault();jump();});
  }
  if(duckBtn){
    const dON=e=>{e.preventDefault();duck(true);};
    const dOFF=e=>{e.preventDefault();duck(false);};
    duckBtn.addEventListener('touchstart',dON,{passive:false});
    duckBtn.addEventListener('touchend',dOFF,{passive:false});
    duckBtn.addEventListener('touchcancel',dOFF,{passive:false});
    duckBtn.addEventListener('pointerdown',dON);
    duckBtn.addEventListener('pointerup',dOFF);
    duckBtn.addEventListener('pointerleave',dOFF);
  }

function rects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}

function tooClose(x,w,list,pad){
  for(const o of list){ if(x < o.x+o.w+pad && x+w > o.x-pad) return true; }
  return false;
}
function spawnObstacleNear(){
  const s=sinsList[Math.floor(Math.random()*sinsList.length)];
  const sz=Math.round(60*scale);
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
  const sz=Math.round(60*scale);
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
  const sz=Math.round(60*scale);
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
  text('↑ PULA   ↓ DESLIZA',W-22,40,11,'#fff','right');
}

function update(){
  if(!running||gameOver)return;
  t++;
  speed=Math.min(MAX_SPEED, BASE_SPEED + t*ACCEL + score*0.0009);  // tempo + distancia
  score+=speed*0.10;

  // physics
  player.vy+=0.85*scale;player.y+=player.vy;
  const floor=groundY-player.h;
  // land detection
  if(player.y>=floor){player.y=floor;player.vy=0;player.onGround=true;}
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
  if(nextObs<=0){spawnObstacle();const gap=Math.max(38,150-speed*4-score*0.004);nextObs=gap+Math.random()*Math.max(20,55-score*0.002);}
  if(nextItem<=0){
    spawnItem();
    nextItem=90+Math.random()*80;
    // COMBO ARRISCADO: às vezes um pecado nasce logo perto do item bom
    if(Math.random()<0.45){
      spawnObstacleNear();
      nextObs=Math.max(nextObs,40+Math.random()*30); // evita amontoar logo em seguida
    }
  }

  obstacles.forEach(o=>o.x-=speed);
  items.forEach(i=>i.x-=speed);
  obstacles=obstacles.filter(o=>o.x+o.w>-60);
  items=items.filter(i=>i.x+i.w>-60&&!i.got);

  // player collision box (use current duck/normal size, with forgiveness margin)
  const m=8*scale;
  const pb={x:player.x+m, y:(player.state==='slide'?groundY-player.curH:player.y)+m, w:player.curW-2*m, h:player.curH-2*m};
  for(const o of obstacles){
    const ob={x:o.x+o.w*0.18,y:o.y+o.h*0.16,w:o.w*0.64,h:o.h*0.7};
    if(rects(pb,ob)){player.blink=45;endGame();return;}
  }
  for(const it of items){
    const ib={x:it.x,y:it.y,w:it.w,h:it.h};
    if(rects(pb,ib)){it.got=true;score+=100;}
  }
}

function endGame(){gameOver=true;running=false;document.body.classList.remove('playing');hi=Math.max(hi,Math.floor(score));setHi(hi);
  finalScore.textContent='PONTOS: '+Math.floor(score);
  overScreen.classList.remove('hidden');
}
function goToMenu(){
  document.body.classList.remove('playing');
  overScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
}

function draw(){
  ctx.clearRect(0,0,W,H);
  drawBackground();
  items.forEach(drawItem);
  obstacles.forEach(drawSin);
  drawCarlo();
  drawHUD();
}
function loop(){if(running&&!gameOver)update();draw();requestAnimationFrame(loop);}
loop();
