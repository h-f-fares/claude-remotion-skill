// Draws the fake editor (static, once) and the comp (per frame, from the playhead time).
// Both read only timeline.ts, so every pixel position is known to the 3D scene.
import { APP, BEAT_S, BUTTONS, EV, FLAT_AT, PANELS, POSES, TL } from "./timeline";

export const FONT = "Fredoka";
export const C = {
  bg: "#0d0b0a",
  panel: "#1d1b1a",
  panelHi: "#262321",
  line: "#3a3532",
  text: "#c9c2bb",
  dim: "#7d756e",
  accent: "#D97757", // the brand terracotta
  accentHi: "#ffb38a",
  blue: "#5aa3ff",
  cream: "#F0EEE6",
};

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const inOut = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
// deterministic "random" so any frame renders the same in isolation
const rand = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const label = (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "left") => {
  ctx.font = `600 ${size}px ${FONT}, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
};

const icon = (ctx: CanvasRenderingContext2D, key: string, cx: number, cy: number, color: string) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  if (key === "type") label(ctx, "T", cx, cy + 1, 30, color, "center");
  if (key === "rect") ctx.strokeRect(cx - 14, cy - 10, 28, 20);
  if (key === "pen") {
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 12);
    ctx.lineTo(cx + 2, cy - 14);
    ctx.lineTo(cx + 12, cy - 4);
    ctx.closePath();
    ctx.stroke();
  }
  if (key === "play") {
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 14);
    ctx.lineTo(cx + 14, cy);
    ctx.lineTo(cx - 10, cy + 14);
    ctx.closePath();
    ctx.fill();
  }
};

// ---- the static workspace: drawn once into a 3840x2160 texture, then cut into slabs ----
export const drawUI = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.scale(APP.scale, APP.scale);
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, APP.w, APP.h);

  for (const [key, p] of Object.entries(PANELS)) {
    ctx.fillStyle = C.panel;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
    if (p.title) {
      ctx.fillStyle = C.panelHi;
      ctx.fillRect(p.x, p.y, p.w, 34);
      label(ctx, p.title, p.x + 14, p.y + 18, 17, key === "comp" ? C.cream : C.text);
      ctx.fillStyle = C.blue;
      ctx.fillRect(p.x, p.y + 32, Math.min(p.w, 160), 2);
    }
  }

  // menu bar
  ["File", "Edit", "Composition", "Layer", "Effect", "Animation", "View", "Window", "Help"].forEach((m, i) =>
    label(ctx, m, 24 + i * 118, 21, 17, C.text)
  );

  // toolbar: a row of tool slots, the three real ones are BUTTONS slabs
  for (let i = 0; i < 14; i++) {
    const x = 520 + i * 76;
    if (x >= 780 && x <= 1000) continue;
    ctx.fillStyle = C.panelHi;
    ctx.fillRect(x, 60, 64, 48);
  }
  label(ctx, "Default  ·  Learn  ·  Standard  ·  Small Screen", 1880, 84, 16, C.dim, "right");

  // project bin
  ["Title Comp", "clawd.png", "spark.ai", "swoosh.ai", "Solids"].forEach((n, i) => {
    ctx.fillStyle = i === 1 ? "#2c3a4d" : "transparent";
    ctx.fillRect(10, 180 + i * 40, 340, 34);
    label(ctx, n, 30, 197 + i * 40, 16, C.text);
  });

  // effects & presets searched for "glow"
  const e = PANELS.effects;
  ctx.fillStyle = "#121110";
  ctx.fillRect(e.x + 14, e.y + 48, e.w - 28, 38);
  label(ctx, "⌕  glow", e.x + 26, e.y + 67, 17, C.cream);
  label(ctx, "▾ Stylize", e.x + 20, e.y + 108, 16, C.dim);
  label(ctx, "▾ Light", e.x + 20, e.y + 190, 16, C.dim);
  label(ctx, "Inner Glow", e.x + 40, e.y + 222, 16, C.dim);
  label(ctx, "Outer Glow", e.x + 40, e.y + 254, 16, C.dim);

  // preview controls
  const pv = PANELS.preview;
  ["|◀", "◀◀", "", "▶▶", "▶|"].forEach((s, i) => s && label(ctx, s, pv.x + 40 + i * 70, pv.y + 100, 18, C.dim, "center"));

  // timeline rows + Position row
  const t = PANELS.timeline;
  label(ctx, "0;00;00;00", t.x + 20, t.y + 58, 22, C.blue);
  ctx.fillStyle = "#121110";
  ctx.fillRect(TL.trackX0, t.y + 40, TL.trackX1 - TL.trackX0, 30);
  for (let s = 0; s <= 8; s++) {
    const x = TL.trackX0 + ((TL.trackX1 - TL.trackX0) * s) / 8;
    label(ctx, `${s}s`, x + 4, t.y + 55, 14, C.dim);
  }
  const barColor = ["#c98a5a", "#b9a03d", "#6f9fd8", "#9a7fd1"];
  TL.rows.forEach((r, i) => {
    const y = TL.rowY0 + i * TL.rowH;
    label(ctx, `${i + 1}`, 24, y + 22, 15, C.dim);
    label(ctx, r, 60, y + 22, 17, C.text);
    ctx.fillStyle = barColor[i] + "55";
    ctx.fillRect(TL.trackX0, y + 6, TL.trackX1 - TL.trackX0, TL.rowH - 12);
  });
  label(ctx, "⌄ Transform", 60, TL.posRowY - 52, 15, C.dim);
  label(ctx, "Position", 90, TL.posRowY, 17, C.text);
  label(ctx, "960.0, 540.0", 260, TL.posRowY, 17, C.blue);
  ctx.strokeStyle = C.line;
  ctx.beginPath();
  ctx.moveTo(TL.trackX0, TL.posRowY + 22);
  ctx.lineTo(TL.trackX1, TL.posRowY + 22);
  ctx.stroke();

  // buttons (their slabs show these crops)
  for (const [key, b] of Object.entries(BUTTONS)) {
    ctx.fillStyle = "#34302d";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    if (key === "glow") label(ctx, "✦  Glow", b.x + 20, b.y + b.h / 2, 19, C.cream);
    else icon(ctx, key, b.x + b.w / 2, b.y + b.h / 2, C.cream);
  }
  ctx.restore();
};

// ---- the comp: what Clawd builds, drawn every frame from time t ----
const TITLE = "MADE WITH CLAUDE";

const titlePose = (t: number) => {
  // stamping a keyframe jumps the title to that pose; Play plays the keys back
  if (t >= EV.play && t < EV.play + 1) {
    const u = inOut(t - EV.play) * 2; // 0..2 across poses 1→2→3
    const i = Math.min(1, Math.floor(u));
    const k = u - i;
    const a = POSES[1 + i];
    const b = POSES[2 + i];
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, s: a.s + (b.s - a.s) * k, r: a.r + (b.r - a.r) * k };
  }
  let p = POSES[0];
  EV.keys.forEach((k, i) => t >= k && (p = POSES[i + 1]));
  // the stamp snaps with a 3-frame overshoot
  const since = Math.min(...EV.keys.map((k) => (t >= k ? t - k : 99)));
  const kick = since < 0.2 ? Math.sin((since / 0.2) * Math.PI) * 0.06 : 0;
  return { ...p, s: p.s * (1 + kick) };
};

export const drawComp = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
  ctx.save();
  ctx.scale(APP.scale, APP.scale);
  const g = ctx.createRadialGradient(w / 2, h * 0.45, 40, w / 2, h / 2, w * 0.65);
  g.addColorStop(0, "#2a1d16");
  g.addColorStop(1, "#0e0a08");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // title-safe guides
  ctx.strokeStyle = "#ffffff10";
  ctx.lineWidth = 1;
  ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);

  const fx = FLAT_AT.x - 380;
  const fy = FLAT_AT.y - 128;

  // before the pop: Clawd is a selected PNG layer
  if (t < EV.pop + 0.05) {
    ctx.strokeStyle = C.blue;
    ctx.lineWidth = 2;
    ctx.strokeRect(fx - 60, fy - 46, 120, 92);
    for (const [hx, hy] of [[-60, -46], [0, -46], [60, -46], [-60, 0], [60, 0], [-60, 46], [0, 46], [60, 46]]) {
      ctx.fillStyle = C.cream;
      ctx.fillRect(fx + hx - 5, fy + hy - 5, 10, 10);
    }
    label(ctx, "clawd.png", fx - 60, fy - 64, 15, C.blue);
  }
  // knocks: a ripple from inside the screen
  for (const k of [EV.knock1, EV.knock2]) {
    const u = (t - k) / 0.5;
    if (u > 0 && u < 1) {
      ctx.strokeStyle = `rgba(240,238,230,${0.6 * (1 - u)})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(fx, fy, 30 + u * 140, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // the pop cracks the viewer glass: short cracks that fade fast
  const cu = (t - EV.pop) / 0.6;
  if (cu > 0 && cu < 1) {
    ctx.strokeStyle = `rgba(255,240,225,${0.85 * (1 - cu)})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rand(i) * 0.5;
      const len = 60 + rand(i + 9) * 70;
      ctx.beginPath();
      ctx.moveTo(fx + Math.cos(a) * 20, fy + Math.sin(a) * 20);
      ctx.lineTo(fx + Math.cos(a + 0.15) * len * 0.55, fy + Math.sin(a + 0.15) * len * 0.55);
      ctx.lineTo(fx + Math.cos(a) * len, fy + Math.sin(a) * len);
      ctx.stroke();
    }
  }

  const pose = titlePose(t);
  const glow = ease((t - EV.glowOn) / 0.4);
  ctx.save();
  ctx.translate(pose.x, pose.y);
  ctx.rotate(pose.r);
  ctx.scale(pose.s, pose.s);
  if (glow > 0) {
    ctx.shadowColor = `rgba(255,140,90,${0.9 * glow})`;
    ctx.shadowBlur = 36 * glow;
  }
  // Type tool: the title types on over half a beat
  const n = Math.floor(Math.min(1, Math.max(0, (t - EV.typeOn) / BEAT_S)) * TITLE.length);
  if (n > 0) {
    label(ctx, TITLE.slice(0, n), 0, 0, 84, C.cream, "center");
    if (n < TITLE.length) {
      ctx.font = `700 84px ${FONT}, sans-serif`;
      const wNow = ctx.measureText(TITLE.slice(0, n)).width;
      ctx.fillStyle = C.accent;
      ctx.fillRect(wNow / 2 + 6, -38, 6, 76);
    }
  }
  // Rectangle tool: the spark (rays twice the hairline width — they read as a shape)
  const sp = t - EV.spark;
  if (sp > 0) {
    const s = Math.min(1.12, 1.12 * ease(sp / 0.25)) - Math.max(0, Math.min(0.12, (sp - 0.25) * 0.6));
    ctx.save();
    ctx.translate(-430, -6);
    ctx.rotate(sp * 0.6);
    ctx.scale(s, s);
    ctx.fillStyle = C.accent;
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(0, -48);
      ctx.lineTo(9, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  // Pen tool: the swoosh draws on
  const sw = ease((t - EV.swoosh) / 0.4);
  if (sw > 0) {
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.setLineDash([900 * sw, 2000]);
    ctx.beginPath();
    ctx.moveTo(-360, 74);
    ctx.bezierCurveTo(-120, 30, 140, 112, 380, 58);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();

  // Play: flash, particles, the subtitle lands
  const pl = t - EV.play;
  if (pl > 0) {
    ctx.fillStyle = `rgba(255,240,225,${Math.max(0, 0.22 - pl * 0.8)})`;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const a = rand(i) * Math.PI * 2;
      const v = 120 + rand(i + 40) * 380;
      const life = Math.min(1, pl / 1.4);
      const x = w / 2 + Math.cos(a) * v * ease(life);
      const y = h * 0.45 + Math.sin(a) * v * ease(life) * 0.6 + life * life * 80;
      ctx.fillStyle = i % 3 ? `rgba(255,179,138,${1 - life})` : `rgba(240,238,230,${1 - life})`;
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
    const su = ease((pl - 0.6) / 0.35);
    if (su > 0) {
      ctx.globalAlpha = su;
      label(ctx, "NO AFTER EFFECTS", w / 2, 420 + (1 - su) * 24, 40, C.accentHi, "center");
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
};
