/* Demo de la portada: Benny corre dentro de una ventana de Bisory mientras el replay de
   60 s se llena, y "Guardar replay" hace lo mismo que la app (destello, miniatura, aviso).
   Mismo sprite que la página 404. Se pausa fuera de pantalla y respeta "reducir movimiento". */
(() => {
"use strict";
const cvs = document.getElementById("demoCanvas");
if (!cvs) return;
const ctx = cvs.getContext("2d");
const W = 534, H = 300, GROUND = 252, SPR = 3;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

function sizeCanvas(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cvs.width = W * dpr; cvs.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
}
sizeCanvas();

/* ---------- sprites (los de la 404) ---------- */
const PAL = { K:"#1a1208", O:"#b5651d", D:"#7a4310", W:"#f2e3c4" };
const BODY = [
".KKK.............KKKKKK.....",
"KDDDK...........KOOOOOOK....",
"KDDDK..........KDDOOOOOK....",
"KDDDDK.......KDDDOOOOOOK....",
".KDDDK......KDDDDOOOKKOOOKK.",
"..KDDK......KDDDDOOOKKOOOKK.",
"...KDK......KDDDOOOOOOOOOOOK",
"....KDK......KDDOOOOOOOKKKK.",
"....KKKKKKKKKKKOOWWWWK......",
"....KOOOOOOOOOOOOWWWWWK.....",
"....KOOOOOOOOOOOOWWWWWK.....",
"....KOOOOOOOOOOOOWWWWK......",
"....KOOOOOOOOOOOWWWWK.......",
".....KOOOOOOOOOOWWWK........",
".....KOOOOOOOOOOWWK.........",
"......KKOOOOOOOKKK..........",
];
const LEGS_A = [
".....KOK......KOK...........",
".....KOK......KOK...........",
"....KOOK.....KOOK...........",
"....KKK......KKK............",
];
const LEGS_B = [
".......KOK..KOK.............",
".......KOK..KOK.............",
".......KOOK.KOOK............",
"........KK...KK.............",
];
const FRAME_A = BODY.concat(LEGS_A), FRAME_B = BODY.concat(LEGS_B);
const PALB = { G:"#9aa5b1", D:"#6b7684", O:"#f59e0b", B:"#1e293b" };
/* alas arriba / alas abajo: el cuerpo (filas 3-5) queda en el mismo lugar en los dos */
const BIRD_A = [".......GG.....","......GGG.....","......GGG.....","OGBGGGGGGGGGG.",".GGGGGGGGGGDD.","...GGGGGGG...."];
const BIRD_B = ["","","","OGBGGGGGGGGGG.",".GGGGGGGGGGDD.","...GGGGGGG....","......GGG.....",".......GG....."];
const HYD = { body:"#dc2626", dark:"#991b1b", light:"#f87171" };
const DOG_X = 56, DOG_W = 28 * SPR, DOG_H = 20 * SPR;

function drawSprite(rows, pal, x, y){
  for (let r = 0; r < rows.length; r++){
    const row = rows[r];
    for (let c = 0; c < row.length; c++){
      const k = row[c];
      if (k === ".") continue;
      ctx.fillStyle = pal[k];
      ctx.fillRect(Math.round(x + c * SPR), Math.round(y + r * SPR), SPR, SPR);
    }
  }
}

/* ---------- la partida: corre sola y nunca pierde ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);
const g = {
  speed: 560, dist: 24 * 730, dogY: 0, vy: 0, legT: 0, gapLeft: 260, obstacles: [],
  clouds: [{x:120,y:60},{x:330,y:100},{x:470,y:44}],
  specks: Array.from({length: 20}, () => ({ x: rnd(0, W), y: GROUND + 8 + rnd(0, 16), w: rnd(4, 12) })),
  stars:  Array.from({length: 26}, () => ({ x: rnd(0, W), y: rnd(0, 150) })),
};
function spawn(){
  if (Math.random() < 0.3){
    const low = Math.random() < 0.6;
    g.obstacles.push({ type:"bird", x: W + 30, y: low ? GROUND - 44 : GROUND - 98, w: 42, h: 24, vx: rnd(50, 110) });
  } else {
    const n = Math.random() < 0.3 ? 2 : 1, unit = 24, h = Math.random() < 0.5 ? 40 : 54;
    g.obstacles.push({ type:"hyd", x: W + 30, y: GROUND - h, w: n * unit + (n - 1) * 10, h, vx: 0, n, unit });
  }
  g.gapLeft = rnd(200, 400) + g.speed * 0.3;
}
function step(dt){
  g.dist += g.speed * dt;
  g.vy += 2600 * dt; g.dogY += g.vy * dt;
  if (g.dogY > 0){ g.dogY = 0; g.vy = 0; }
  g.legT += dt * 11;
  g.gapLeft -= g.speed * dt;
  if (g.gapLeft <= 0) spawn();
  for (const o of g.obstacles){
    o.x -= (g.speed + o.vx) * dt;
    const gap = o.x - (DOG_X + DOG_W - 14);
    const highBird = o.type === "bird" && o.y < GROUND - 80;
    if (gap > 0 && gap < (g.speed + o.vx) * 0.2 && g.dogY === 0 && !highBird) g.vy = -860;
  }
  g.obstacles = g.obstacles.filter(o => o.x + o.w > -20);
  for (const c of g.clouds){ c.x -= g.speed * 0.25 * dt; if (c.x < -80){ c.x = W + rnd(20, 140); c.y = rnd(30, 105); } }
  for (const s of g.specks){ s.x -= g.speed * dt; if (s.x < -12){ s.x = W + rnd(0, 30); s.w = rnd(4, 12); } }
}
function draw(){
  ctx.fillStyle = "#070b14"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#cfd8e6";
  for (const st of g.stars) ctx.fillRect(Math.round(st.x), Math.round(st.y), 2, 2);
  ctx.fillStyle = "#222c44";
  for (const c of g.clouds){
    const x = Math.round(c.x), y = Math.round(c.y);
    ctx.fillRect(x, y + 10, 64, 10); ctx.fillRect(x + 12, y + 4, 26, 6); ctx.fillRect(x + 20, y, 14, 4); ctx.fillRect(x + 42, y + 6, 16, 4);
  }
  ctx.fillStyle = "#33b5d9"; ctx.fillRect(0, GROUND, W, 3);
  ctx.fillStyle = "#0b4a5c";
  for (const s of g.specks) ctx.fillRect(Math.round(s.x), Math.round(s.y), Math.round(s.w), 2);
  for (const o of g.obstacles){
    if (o.type === "bird"){ drawSprite(Math.floor(g.legT * 1.6) % 2 ? BIRD_B : BIRD_A, PALB, o.x, o.y); continue; }
    for (let i = 0; i < o.n; i++){
      const x = Math.round(o.x + i * (o.unit + 10)), y = o.y, w = o.unit;
      ctx.fillStyle = HYD.body;
      ctx.fillRect(x, GROUND - 5, w, 5); ctx.fillRect(x + 4, y + 8, w - 8, o.h - 8);
      ctx.fillRect(x + 6, y + 3, w - 12, 6); ctx.fillRect(x + (w >> 1) - 2, y, 5, 4);
      ctx.fillStyle = HYD.dark; ctx.fillRect(x, y + 14, 4, 6); ctx.fillRect(x + w - 4, y + 14, 4, 6);
      ctx.fillStyle = HYD.light; ctx.fillRect(x + 4, y + 21, w - 8, 3);
    }
  }
  const frame = g.dogY < 0 ? FRAME_B : (Math.floor(g.legT) % 2 ? FRAME_B : FRAME_A);
  drawSprite(frame, PAL, DOG_X, GROUND - DOG_H + g.dogY);
  ctx.fillStyle = "#e8edf4";
  ctx.font = "11px 'Press Start 2P', monospace";
  ctx.textAlign = "right";
  ctx.fillText(String(Math.floor(g.dist / 24)).padStart(5, "0"), W - 16, 28);
}

/* ---------- el replay de 60 s: se llena (acelerado) y luego sigue corriendo ---------- */
const buf = document.getElementById("demoBuffer");
const TICKS = 60;
for (let i = 0; i < TICKS; i++) buf.appendChild(document.createElement("i"));
const ticks = buf.children;
let filled = REDUCED ? TICKS : 0, fillT = 0;
function paintBuffer(){ for (let i = 0; i < TICKS; i++) ticks[i].classList.toggle("on", i < filled); }
paintBuffer();
if (filled >= TICKS) buf.classList.add("full");

/* ---------- guardar replay: destello, miniatura que vuela y aviso ---------- */
const shell = document.getElementById("demoScreen");
const btn = document.getElementById("demoSave");
const toast = document.getElementById("demoToast");
let toastTimer = 0;
btn.addEventListener("click", () => {
  if (filled < TICKS) { filled = TICKS; paintBuffer(); buf.classList.add("full"); }
  shell.classList.remove("flash"); void shell.offsetWidth; shell.classList.add("flash");
  const img = new Image();
  img.src = cvs.toDataURL("image/png");
  img.className = "demo-fly";
  img.alt = "";
  shell.appendChild(img);
  requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add("go")));
  setTimeout(() => img.remove(), 1400);
  toast.textContent = document.getElementById("demoToastText").textContent;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
});

/* ---------- bucle: solo corre si se ve ---------- */
let visible = true, last = null, raf = 0;
function frame(ts){
  const dt = Math.min((ts - (last === null ? ts : last)) / 1000, 0.05);
  last = ts;
  step(dt); draw();
  if (filled < TICKS){
    fillT += dt;
    const n = Math.min(TICKS, Math.floor(fillT * 10));   // 60 s en 6 s
    if (n !== filled){ filled = n; paintBuffer(); if (filled === TICKS) buf.classList.add("full"); }
  }
  raf = requestAnimationFrame(frame);
}
function run(){ if (!raf && visible && !document.hidden){ last = null; raf = requestAnimationFrame(frame); } }
function stop(){ cancelAnimationFrame(raf); raf = 0; }

if (REDUCED){
  for (let i = 0; i < 90; i++) step(1 / 60);   // un cuadro con obstáculos, sin animación
  g.dogY = -60; draw();
  return;
}
new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? run() : stop(); }).observe(cvs);
document.addEventListener("visibilitychange", () => (document.hidden ? stop() : run()));
run();
})();
