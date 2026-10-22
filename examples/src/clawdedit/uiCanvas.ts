// Draws the fake editor (static, once) and the comp viewer (per frame, from time t).
// Both read only timeline.ts, so every pixel position is known to the 3D scene.
// Look rules: a neutral After Effects palette, one blue accent, opaque label colours, a real
// UI typeface at 400/600, a pure-black viewer — the hero colour lives only in the comp.
import { APP, BEAT_S, BUTTONS, EV, FLAT_AT, KEYFRAME_X, PANELS, POSES, TL, VIEWER, playheadX } from "./timeline";

export const FONT = "Fredoka"; // the title in the comp
const UI = "Inter, 'DejaVu Sans', sans-serif"; // the app chrome
export const C = {
  bg: "#101010",
  panel: "#232323",
  panelHi: "#2b2b2b",
  well: "#1a1a1a",
  line: "#3a3a3a",
  text: "#c8c8c8",
  dim: "#8a8a8a",
  blue: "#2d8ceb",
  blueHi: "#7fc3ff",
  accent: "#D97757", // the brand terracotta
  accentHi: "#ffb38a",
  cream: "#F0EEE6",
  // AE label colours, opaque like the real app
  labels: ["#B53838", "#E4D84C", "#A9CBC7", "#A9A9CA", "#A89677"],
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

const label = (
  ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color: string,
  align: CanvasTextAlign = "left", weight = 400, family = UI,
) => {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
};

// tiny line-art tool icons, one per toolbar slot
const TOOL_ICONS = ["home", "arrow", "hand", "zoom", "orbit", "pan", "dolly", "rect", "pen", "type", "brush", "stamp", "eraser", "roto", "puppet"];
const icon = (ctx: CanvasRenderingContext2D, key: string, cx: number, cy: number, color: string) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  switch (key) {
    case "type": label(ctx, "T", cx, cy + 1, 28, color, "center", 600); break;
    case "rect": ctx.strokeRect(cx - 13, cy - 9, 26, 18); break;
    case "pen": ctx.moveTo(cx - 11, cy + 12); ctx.lineTo(cx + 2, cy - 13); ctx.lineTo(cx + 11, cy - 3); ctx.closePath(); ctx.stroke(); break;
    case "play": ctx.moveTo(cx - 10, cy - 14); ctx.lineTo(cx + 14, cy); ctx.lineTo(cx - 10, cy + 14); ctx.closePath(); ctx.fill(); break;
    case "home": ctx.moveTo(cx - 11, cy + 1); ctx.lineTo(cx, cy - 10); ctx.lineTo(cx + 11, cy + 1); ctx.moveTo(cx - 8, cy); ctx.lineTo(cx - 8, cy + 10); ctx.lineTo(cx + 8, cy + 10); ctx.lineTo(cx + 8, cy); ctx.stroke(); break;
    case "arrow": ctx.moveTo(cx - 6, cy - 12); ctx.lineTo(cx - 6, cy + 10); ctx.lineTo(cx, cy + 4); ctx.lineTo(cx + 8, cy + 4); ctx.closePath(); ctx.fill(); break;
    case "hand": ctx.arc(cx, cy + 2, 8, 0, Math.PI * 2); ctx.moveTo(cx - 4, cy - 6); ctx.lineTo(cx - 4, cy - 12); ctx.moveTo(cx + 2, cy - 6); ctx.lineTo(cx + 2, cy - 13); ctx.stroke(); break;
    case "zoom": ctx.arc(cx - 3, cy - 3, 8, 0, Math.PI * 2); ctx.moveTo(cx + 3, cy + 3); ctx.lineTo(cx + 11, cy + 11); ctx.stroke(); break;
    case "orbit": ctx.ellipse(cx, cy, 12, 6, 0, 0, Math.PI * 2); ctx.moveTo(cx + 3, cy); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.stroke(); break;
    case "pan": ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12); ctx.stroke(); break;
    case "dolly": ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12); ctx.moveTo(cx - 6, cy - 6); ctx.lineTo(cx, cy - 12); ctx.lineTo(cx + 6, cy - 6); ctx.stroke(); break;
    case "brush": ctx.moveTo(cx - 10, cy + 10); ctx.quadraticCurveTo(cx, cy - 2, cx + 10, cy - 12); ctx.stroke(); break;
    case "stamp": ctx.strokeRect(cx - 9, cy + 2, 18, 8); ctx.moveTo(cx, cy + 2); ctx.lineTo(cx, cy - 10); ctx.stroke(); break;
    case "eraser": ctx.moveTo(cx - 10, cy + 6); ctx.lineTo(cx + 2, cy - 8); ctx.lineTo(cx + 10, cy - 1); ctx.lineTo(cx - 2, cy + 12); ctx.closePath(); ctx.stroke(); break;
    case "roto": ctx.arc(cx - 2, cy - 2, 8, 0.4, Math.PI * 1.7); ctx.moveTo(cx + 4, cy + 4); ctx.lineTo(cx + 11, cy + 11); ctx.stroke(); break;
    case "puppet": ctx.arc(cx, cy - 8, 4, 0, Math.PI * 2); ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 6); ctx.moveTo(cx - 9, cy - 1); ctx.lineTo(cx + 9, cy - 1); ctx.moveTo(cx, cy + 6); ctx.lineTo(cx - 6, cy + 13); ctx.moveTo(cx, cy + 6); ctx.lineTo(cx + 6, cy + 13); ctx.stroke(); break;
  }
  ctx.restore();
};

const panelFrame = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, title: string, focus = false) => {
  ctx.fillStyle = C.panel;
  ctx.fillRect(x, y, w, h);
  if (title) {
    ctx.fillStyle = C.panelHi;
    ctx.fillRect(x, y, w, 34);
    label(ctx, "≡", x + 14, y + 17, 16, C.dim);
    label(ctx, title, x + 34, y + 17, 15, focus ? "#ffffff" : C.text, "left", 600);
  }
  ctx.strokeStyle = focus ? C.blue : C.line;
  ctx.lineWidth = focus ? 3 : 2;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
};

// ---- the static workspace: drawn once into a 3840x2160 texture, then cut into slabs ----
export const drawUI = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.scale(APP.scale, APP.scale);
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, APP.w, APP.h);

  for (const [key, p] of Object.entries(PANELS)) panelFrame(ctx, p.x, p.y, p.w, p.h, p.title, key === "comp");

  // menu bar
  ["File", "Edit", "Composition", "Layer", "Effect", "Animation", "View", "Window", "Help"].forEach((m, i) =>
    label(ctx, m, 24 + i * 104, 21, 15, C.text)
  );
  label(ctx, "Untitled Project.aep *", 1896, 21, 14, C.dim, "right");

  // toolbar: every slot has a real tool; the three we press are BUTTONS slabs on top
  TOOL_ICONS.forEach((k, i) => {
    const x = 18 + i * 76 + (i > 6 ? 238 : 0);
    if (k === "rect" || k === "pen" || k === "type") return;
    icon(ctx, k, x + 32, 84, C.text);
  });
  ["Default", "Learn", "Standard", "Small Screen", "Libraries"].forEach((s, i) =>
    label(ctx, s, 1420 + i * 96, 84, 14, i === 2 ? C.blueHi : C.dim)
  );

  // project panel: real columns
  const pj = PANELS.project;
  ctx.fillStyle = C.well;
  ctx.fillRect(pj.x + 10, pj.y + 44, pj.w - 20, 30);
  label(ctx, "⌕", pj.x + 22, pj.y + 59, 14, C.dim);
  label(ctx, "Name", pj.x + 18, pj.y + 92, 13, C.dim, "left", 600);
  label(ctx, "Type", pj.x + 240, pj.y + 92, 13, C.dim, "left", 600);
  const items: [string, string, string][] = [
    ["Main Comp", "Composition", C.labels[3]], ["clawd.png", "PNG file", C.labels[2]], ["spark.ai", "Illustrator", C.labels[1]],
    ["swoosh.ai", "Illustrator", C.labels[1]], ["Solids", "Folder", C.labels[4]], ["glow-ref.mov", "QuickTime", C.labels[0]],
  ];
  items.forEach(([n, ty, col], i) => {
    const y = pj.y + 118 + i * 34;
    if (i === 0) { ctx.fillStyle = "#264f7d"; ctx.fillRect(pj.x + 8, y - 15, pj.w - 16, 30); }
    ctx.fillStyle = col;
    ctx.fillRect(pj.x + 18, y - 6, 12, 12);
    label(ctx, n, pj.x + 40, y, 14, C.text);
    label(ctx, ty, pj.x + 240, y, 13, C.dim);
  });
  label(ctx, "1920 x 1080 (1.00)  ·  0;00;12;00, 30.00 fps", pj.x + 18, pj.y + 500, 12, C.dim);

  // comp panel footer: the bar every AE user knows
  const cp = PANELS.comp;
  ctx.fillStyle = C.panelHi;
  ctx.fillRect(cp.x + 2, cp.y + cp.h - 32, cp.w - 4, 30);
  label(ctx, "50%", cp.x + 20, cp.y + cp.h - 17, 13, C.text);
  label(ctx, "0;00;06;15", cp.x + 130, cp.y + cp.h - 17, 14, C.blueHi, "left", 600);
  label(ctx, "Full  ▾", cp.x + 260, cp.y + cp.h - 17, 13, C.text);
  label(ctx, "Active Camera  ▾", cp.x + 560, cp.y + cp.h - 17, 13, C.text);
  label(ctx, "1 View  ▾", cp.x + 740, cp.y + cp.h - 17, 13, C.text);
  label(ctx, "+0.0", cp.x + cp.w - 24, cp.y + cp.h - 17, 13, C.dim, "right");

  // preview transport
  const pv = PANELS.preview;
  ["|◀", "◀|", "", "|▶", "▶|"].forEach((s, i) => s && label(ctx, s, pv.x + 40 + i * 70, pv.y + 100, 17, C.dim, "center"));
  label(ctx, "Shortcut  Spacebar  ▾", pv.x + 18, pv.y + 148, 12, C.dim);

  // effects & presets searched for "glow"
  const e = PANELS.effects;
  ctx.fillStyle = C.well;
  ctx.fillRect(e.x + 14, e.y + 46, e.w - 28, 32);
  label(ctx, "⌕  glow", e.x + 26, e.y + 62, 15, "#ffffff");
  label(ctx, "▾ Animation Presets", e.x + 20, e.y + 96, 14, C.dim);
  label(ctx, "▾ Stylize", e.x + 20, e.y + 120, 14, C.text);
  label(ctx, "▸ Image - Special Effects", e.x + 20, e.y + 180, 14, C.dim);
  label(ctx, "Glow - Neon.ffx", e.x + 40, e.y + 206, 14, C.dim);
  label(ctx, "Glow Pulse.ffx", e.x + 40, e.y + 232, 14, C.dim);
  label(ctx, "▸ Distort", e.x + 20, e.y + 266, 14, C.dim);

  // timeline: header, ruler, layers with switches and opaque label bars, the Position row
  const t = PANELS.timeline;
  label(ctx, "0;00;00;00", t.x + 20, t.y + 58, 22, C.blueHi, "left", 600);
  label(ctx, "00000 (30.00 fps)", t.x + 160, t.y + 60, 12, C.dim);
  ["#", "Source Name", "Mode", "Parent & Link"].forEach((s, i) => label(ctx, s, [20, 60, 330, 400][i], t.y + 58, 12, C.dim));
  ctx.fillStyle = C.well;
  ctx.fillRect(TL.trackX0, t.y + 40, TL.trackX1 - TL.trackX0, 34);
  for (let s = 0; s <= 12; s++) {
    const x = TL.trackX0 + ((TL.trackX1 - TL.trackX0) * s) / 12;
    ctx.fillStyle = C.dim;
    ctx.fillRect(x, t.y + 62, 1.5, 12);
    label(ctx, `${String(s).padStart(2, "0")}s`, x + 4, t.y + 52, 12, C.dim);
  }
  TL.rows.forEach((r, i) => {
    const y = TL.rowY0 + i * TL.rowH;
    ctx.fillStyle = i % 2 ? "#262626" : "#2a2a2a";
    ctx.fillRect(t.x + 2, y, TL.trackX0 - 4, TL.rowH - 2);
    ctx.fillStyle = C.labels[i];
    ctx.fillRect(10, y + 18, 12, 12);
    label(ctx, `${i + 1}`, 34, y + 24, 13, C.dim);
    label(ctx, i === 3 ? "◫" : "T", 60, y + 24, 13, C.dim);
    label(ctx, r, 84, y + 24, 14, C.text);
    label(ctx, "Normal  ▾", 330, y + 24, 12, C.dim);
    label(ctx, "◎ None  ▾", 400, y + 24, 12, C.dim);
    // the layer bar, opaque in its label colour, with darker in/out handles
    ctx.fillStyle = C.labels[i];
    ctx.fillRect(TL.trackX0, y + 8, TL.trackX1 - TL.trackX0, TL.rowH - 16);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(TL.trackX0, y + 8, 6, TL.rowH - 16);
  });
  label(ctx, "▾ Transform", 70, TL.posRowY - 40, 13, C.dim);
  label(ctx, "Reset", 300, TL.posRowY - 40, 12, C.blueHi);
  label(ctx, "⏱  Position", 90, TL.posRowY, 15, C.text);
  label(ctx, "960.0, 540.0", 300, TL.posRowY, 15, C.blueHi);
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(TL.trackX0, TL.posRowY + 22);
  ctx.lineTo(TL.trackX1, TL.posRowY + 22);
  ctx.stroke();
  // faint keyframe slot ticks so the stamps land on something
  KEYFRAME_X.forEach((x) => { ctx.fillStyle = "#3a3a3a"; ctx.fillRect(x - 1, TL.posRowY - 16, 2, 32); });

  // buttons (their keycap slabs show these crops)
  for (const [key, b] of Object.entries(BUTTONS)) {
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    if (key === "glow") {
      ctx.fillStyle = "#264f7d";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      label(ctx, "▣  Glow", b.x + 26, b.y + b.h / 2, 16, "#ffffff", "left", 600);
    } else icon(ctx, key, b.x + b.w / 2, b.y + b.h / 2, "#ffffff");
  }
  ctx.restore();
};

// ---- the comp viewer: what Clawd builds, drawn every frame from time t ----
const TITLE = "MADE WITH CLAUDE";

// Real AE logic: a stamp snaps the title to that pose; the playhead plays the keys back.
const titlePose = (t: number) => {
  const inRide = t >= EV.rewind[0] && t < EV.play;
  if (inRide) {
    const x = playheadX(t);
    if (x <= KEYFRAME_X[0]) return POSES[1];
    for (let i = 0; i < 3; i++) {
      if (x <= KEYFRAME_X[i + 1]) {
        const k = inOut((x - KEYFRAME_X[i]) / (KEYFRAME_X[i + 1] - KEYFRAME_X[i]));
        const a = POSES[i + 1];
        const b = POSES[i + 2];
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, s: a.s + (b.s - a.s) * k, r: a.r + (b.r - a.r) * k };
      }
    }
    return POSES[4];
  }
  let p = POSES[0];
  EV.keys.forEach((k, i) => t >= k && (p = POSES[i + 1]));
  const since = Math.min(...EV.keys.map((k) => (t >= k ? t - k : 99)));
  const kick = since < 0.2 ? Math.sin((since / 0.2) * Math.PI) * 0.08 : 0;
  return { ...p, s: p.s * (1 + kick) };
};

export const drawComp = (ctx: CanvasRenderingContext2D, t: number) => {
  const w = VIEWER.w;
  const h = VIEWER.h;
  ctx.save();
  ctx.scale(APP.scale, APP.scale);
  // a pure-black stage: the only thing on it is what Clawd makes
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);

  const fx = FLAT_AT.x - VIEWER.x;
  const fy = FLAT_AT.y - VIEWER.y;

  // before the peel: Clawd is a selected PNG layer (the 3D card sits inside this box)
  if (t < EV.peel + 0.3) {
    const a = 1 - ease((t - EV.peel) / 0.3);
    ctx.globalAlpha = a;
    ctx.strokeStyle = C.blue;
    ctx.lineWidth = 2;
    ctx.strokeRect(fx - 52, fy - 40, 104, 80);
    for (const [hx, hy] of [[-52, -40], [0, -40], [52, -40], [-52, 0], [52, 0], [-52, 40], [0, 40], [52, 40]]) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(fx + hx - 4, fy + hy - 4, 8, 8);
    }
    ctx.strokeStyle = C.blueHi;
    ctx.beginPath();
    ctx.arc(fx, fy, 6, 0, Math.PI * 2);
    ctx.stroke();
    label(ctx, "clawd.png", fx - 52, fy - 56, 13, C.blueHi, "left", 600);
    ctx.globalAlpha = 1;
  }
  // knocks: a ripple from inside the screen
  for (const k of [EV.knock1, EV.knock2]) {
    const u = (t - k) / 0.5;
    if (u > 0 && u < 1) {
      ctx.strokeStyle = `rgba(240,238,230,${0.7 * (1 - u)})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(fx, fy, 30 + u * 150, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // the pop cracks the viewer glass: short cracks that fade fast
  const cu = (t - EV.pop) / 0.6;
  if (cu > 0 && cu < 1) {
    ctx.strokeStyle = `rgba(255,245,235,${1 - cu})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + rand(i) * 0.5;
      const len = 50 + rand(i + 9) * 70;
      ctx.beginPath();
      ctx.moveTo(fx + Math.cos(a) * 16, fy + Math.sin(a) * 16);
      ctx.lineTo(fx + Math.cos(a + 0.18) * len * 0.55, fy + Math.sin(a + 0.18) * len * 0.55);
      ctx.lineTo(fx + Math.cos(a) * len, fy + Math.sin(a) * len);
      ctx.stroke();
    }
  }

  const pose = titlePose(t);
  const glow = ease((t - EV.glowOn) / 0.4);
  // AE motion path: dotted line through the stamped poses while keys exist and before Play
  const stamped = EV.keys.filter((k) => t >= k).length;
  if (stamped > 1 && t < EV.play) {
    ctx.strokeStyle = "rgba(127,195,255,0.6)";
    ctx.setLineDash([3, 7]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 1; i <= stamped; i++) (i === 1 ? ctx.moveTo : ctx.lineTo).call(ctx, POSES[i].x, POSES[i].y);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 1; i <= stamped; i++) {
      ctx.fillStyle = C.blueHi;
      ctx.fillRect(POSES[i].x - 4, POSES[i].y - 4, 8, 8);
    }
  }
  ctx.save();
  ctx.translate(pose.x, pose.y);
  ctx.rotate(pose.r);
  ctx.scale(pose.s, pose.s);
  if (glow > 0) {
    ctx.shadowColor = `rgba(255,140,90,${0.95 * glow})`;
    ctx.shadowBlur = 40 * glow;
  }
  // Type tool: the title types on over half a beat
  const n = Math.floor(Math.min(1, Math.max(0, (t - EV.typeOn) / BEAT_S)) * TITLE.length);
  if (n > 0) {
    label(ctx, TITLE.slice(0, n), 0, 0, 78, C.cream, "center", 700, `${FONT}, sans-serif`);
    if (n < TITLE.length) {
      ctx.font = `700 78px ${FONT}, sans-serif`;
      const wNow = ctx.measureText(TITLE.slice(0, n)).width;
      ctx.fillStyle = C.blue;
      ctx.fillRect(wNow / 2 + 6, -36, 4, 72);
    }
  }
  // Rectangle tool: the spark sits above the title, clear of the letters
  const sp = t - EV.spark;
  if (sp > 0) {
    const s = Math.min(1.15, 1.15 * ease(sp / 0.25)) - Math.max(0, Math.min(0.15, (sp - 0.25) * 0.6));
    ctx.save();
    ctx.translate(0, -92);
    ctx.rotate(sp * 0.6);
    ctx.scale(s, s);
    ctx.fillStyle = C.accent;
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(0, -38);
      ctx.lineTo(8, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  // Pen tool: the swoosh draws on under the title
  const sw = ease((t - EV.swoosh) / 0.4);
  if (sw > 0) {
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.setLineDash([900 * sw, 2000]);
    ctx.beginPath();
    ctx.moveTo(-340, 60);
    ctx.bezierCurveTo(-120, 22, 140, 98, 360, 46);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();

  // Play: flash, particles, the subtitle lands
  const pl = t - EV.play;
  if (pl > 0) {
    ctx.fillStyle = `rgba(255,240,225,${Math.max(0, 0.22 - pl * 0.8)})`;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 48; i++) {
      const a = rand(i) * Math.PI * 2;
      const v = 120 + rand(i + 40) * 420;
      const life = Math.min(1, pl / 1.6);
      const x = w / 2 + Math.cos(a) * v * ease(life);
      const y = h * 0.45 + Math.sin(a) * v * ease(life) * 0.6 + life * life * 80;
      ctx.fillStyle = i % 3 ? `rgba(255,179,138,${1 - life})` : `rgba(240,238,230,${1 - life})`;
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
    const su = ease((pl - 0.5) / 0.35);
    if (su > 0) {
      ctx.globalAlpha = su;
      label(ctx, "O P U S   5 . 5", w / 2, 340 + (1 - su) * 24, 34, C.accentHi, "center", 700, `${FONT}, sans-serif`);
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
};
