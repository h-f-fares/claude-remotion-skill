// Pure motion maths for ClawdEdit: no three.js, no React, so the Remotion scene AND the Blender
// exporter (blender/export_motion.mjs) compute identical frames. Coordinates are three.js world
// units (Y up, +Z toward the bottom of the UI); Blender converts once at its root.
import {
  BUTTONS, EV, FALL_ORDER, FLAT_AT, HOPS, KEYFRAME_X, SHOTS, TL, VIEWER, px, playheadX, type Hop, type Shot,
} from "./timeline.ts";

export type V3 = [number, number, number];
export const SLAB = 0.08; // panel thickness (world units)
export const BTN = 0.12; // keycaps stand proud of their panel
export const PH_TOP = SLAB + 0.16; // top of the playhead head Clawd rides
export const CLAWD_SCALE = 0.3; // Clawd is ~0.6 units tall
export const FLAT_HALF = 0.3; // half his lying length, so he sits centred in his selection box
export const BUTTON_PANEL: Record<string, string> = { type: "tools", rect: "tools", pen: "tools", play: "preview", glow: "effects" };

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const inOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const D2R = Math.PI / 180;
export const rand = (i: number) => {
  const s = Math.sin(i * 91.7 + 47.3) * 43758.5453;
  return s - Math.floor(s);
};

// ---- Clawd's rig: same shape as ClaudeDance's ClawdRig, so ClawdModel draws it directly ----
export type LegRig = { lift: number; tip: number; slide: number; kick: number; stretch?: number };
export type Rig = {
  pos: V3; rot: V3; lean?: number; sx: number; sy: number; armL: number; armR: number;
  legL: LegRig; legR: LegRig; blink: number; happy: boolean;
};
const NO_LEG: LegRig = { lift: 0, tip: 0, slide: 0, kick: 0 };
export const restRig = (): Rig => ({
  pos: [0, 0, 0], rot: [0, 0, 0], sx: 1, sy: 1, armL: -0.2, armR: -0.2,
  legL: { ...NO_LEG }, legR: { ...NO_LEG }, blink: 0, happy: false,
});

// power-down then fall: returns {power 1→0, drop (world units), tilt}
export const fallState = (panel: string, t: number) => {
  const i = FALL_ORDER.indexOf(panel);
  if (i < 0) return { power: 1, drop: 0, tilt: 0 };
  const t0 = EV.powerDown[i];
  const power = 1 - clamp01((t - t0 + 0.12) / 0.12);
  const s = Math.max(0, t - t0);
  return { power, drop: 7 * s * s, tilt: s * s * (i % 2 ? 0.7 : -0.6) };
};

// a keycap dips on landing and STAYS down while he stands on it, then springs back on take-off
export const pressState = (key: string, t: number) => {
  const i = HOPS.findIndex((h) => h.press === key);
  if (i < 0) return { dip: 0, lit: 0 };
  const land = HOPS[i].t1;
  const leave = HOPS[i + 1]?.t0 ?? 99;
  const down = clamp01((t - land) / 0.07);
  const up = t > leave ? Math.exp(-(t - leave) * 18) * Math.cos((t - leave) * 40) : 1;
  return { dip: t < land ? 0 : 0.07 * down * (t > leave ? Math.max(0, up) : 1), lit: t >= land ? 1 : 0 };
};

const surfaceY = (h?: Hop) =>
  !h ? SLAB : h.press && BUTTONS[h.press] ? SLAB + BTN : h.to.y === TL.rulerY ? PH_TOP : SLAB;

export type ClawdState = { rig: Rig; flat: number; lie: number; body: V3 };
export const clawdAt = (t: number, fps: number, camAz: number): ClawdState => {
  const rig = restRig();
  const [fx, fz0] = px(FLAT_AT.x, FLAT_AT.y);
  const fz = fz0 + FLAT_HALF;
  const faceCam = camAz * D2R;

  // 1) a flat PNG lying on the comp; two knocks bump him from inside
  if (t < EV.pop) {
    const knock = [EV.knock1, EV.knock2].reduce((m, k) => Math.max(m, t > k && t < k + 0.2 ? Math.sin(((t - k) / 0.2) * Math.PI) : 0), 0);
    // 2) the peel: he hinges up off the screen as a flat card, wobbles edge-on, holds
    const peel = inOut((t - EV.peel) / 0.35);
    const wobble = t > EV.peel ? Math.sin((t - EV.peel) * 14) * 0.5 * Math.exp(-(t - EV.peel) * 3) * peel : 0;
    rig.pos = [fx, SLAB + 0.01 + knock * 0.08 + peel * 0.05, fz];
    rig.rot = [0, wobble, 0];
    return { rig, flat: 1, lie: 1 - peel, body: [fx, SLAB + 0.3 * peel, fz - 0.3 * (1 - peel)] };
  }

  // 3) the pop: inflate with an overshoot, then the hops
  let i = -1;
  HOPS.forEach((h, k) => t >= h.t0 && (i = k));
  const popK = t - EV.pop;
  const inflate = popK < 0.35 ? 1 + Math.sin(clamp01(popK / 0.35) * Math.PI) * 0.25 : 1;
  const flat = 1 - ease(popK / 0.12);
  if (i < 0) {
    rig.sx = inflate;
    rig.sy = 2 - inflate;
    rig.armL = rig.armR = 1.1 * ease(popK / 0.2);
    rig.happy = popK > 0.05;
    rig.pos = [fx, SLAB, fz];
    rig.rot = [0, faceCam * ease(popK / 0.2), 0];
    return { rig, flat, lie: 0, body: [fx, SLAB + 0.3, fz] };
  }

  const hop = HOPS[i];
  const prev = HOPS[i - 1];
  const from = hop.from ?? (prev ? prev.to : { x: FLAT_AT.x, y: FLAT_AT.y + FLAT_HALF * 100 });
  const fromY = hop.from ? PH_TOP : surfaceY(prev);
  const toY = surfaceY(hop);
  const [ax, az] = px(from.x, from.y);
  const u = clamp01((t - hop.t0) / (hop.t1 - hop.t0));
  const air = t < hop.t1;
  // the ride: after landing on the playhead he goes wherever it goes
  const riding = t >= EV.rewind[0] && t < HOPS[i + 1]?.t0 && hop.to.y === TL.rulerY;
  const [bx, bz] = riding ? px(playheadX(t), TL.rulerY) : px(hop.to.x, hop.to.y);
  const x = lerp(ax, bx, air ? u : 1);
  const z = lerp(az, bz, air ? u : 1);
  const dip = hop.press && BUTTONS[hop.press] ? pressState(hop.press, t).dip : 0;
  const arc = hop.apex * 4 * u * (1 - u);
  const y = air ? lerp(fromY, toY, u) + arc : toY - dip;

  rig.pos = [x, y, z];
  const travel = Math.atan2(bx - ax, bz - az); // yaw that faces where he's going
  const sinceLand = t - hop.t1;
  const next = HOPS[i + 1];
  let yaw: number;
  if (air) {
    rig.armL = rig.armR = 0.9 + Math.sin(Math.PI * u) * 0.3;
    rig.legL = { lift: 0.6, tip: -0.3, slide: 0, kick: 0 };
    rig.legR = { lift: 0.6, tip: -0.3, slide: 0, kick: 0 };
    rig.sy = 1 + Math.sin(Math.PI * u) * 0.14; // stretch in the air
    rig.sx = 1 - Math.sin(Math.PI * u) * 0.06;
    rig.lean = lerp(0.3, -0.15, u); // leans into the take-off, levels at the apex
    yaw = lerp(travel, faceCam, 0.5); // half toward camera so his face stays readable
    rig.rot = [hop.flip ? -Math.PI * 2 * inOut(u) : 0, yaw, 0];
  } else {
    // squash on landing, then one overshoot as he settles
    const land = Math.exp(-(sinceLand * fps) / 3);
    rig.sx = 1 + land * 0.16;
    rig.sy = 1 - land * 0.22 + Math.sin(sinceLand * 18) * Math.exp(-sinceLand * 8) * 0.04;
    // turn from the travel direction back to the camera: he presents each result
    yaw = lerp(travel, faceCam, ease(sinceLand / 0.2));
    rig.blink = Math.max(0, 1 - Math.abs(sinceLand - 0.04) * 20);
    rig.happy = sinceLand > 0.12 && sinceLand < 0.45 && !!hop.press;
    rig.rot = [0, yaw, 0];
  }
  // anticipation: crouch and wind up toward the next target for 3 frames
  if (next && !air) {
    const pre = clamp01(1 - ((next.t0 - t) * fps) / 3);
    const [nx, nz] = px(next.to.x, next.to.y);
    yaw = lerp(yaw, Math.atan2(nx - x, nz - z), pre);
    rig.rot = [0, yaw, 0];
    rig.sy *= 1 - pre * 0.18;
    rig.sx *= 1 + pre * 0.1;
    rig.lean = -0.2 * pre;
  }
  if (riding) {
    // surfing: low crouch, leaning into the move, arms out for balance
    const rideK = ease((t - EV.rewind[0]) / 0.15);
    const dir = t < EV.ride[0] ? -1 : 1;
    rig.sy = 1 - 0.12 * rideK;
    rig.armL = rig.armR = 0.7 * rideK + Math.sin(t * 9) * 0.1;
    rig.rot = [0, (dir > 0 ? Math.PI / 2 : -Math.PI / 2) * 0.55 * rideK + faceCam * (1 - 0.55 * rideK), -0.3 * dir * rideK];
    rig.legL = { lift: 0.25, tip: 0.2, slide: 0, kick: 0 };
    rig.happy = t > EV.ride[0];
  }
  // the kick that sends the Glow chip into the comp: wind back, snap forward, hold
  const kk = t - EV.kick;
  if (kk > -0.15 && kk < 0.25) {
    const wind = kk < 0 ? -0.5 * ease((kk + 0.15) / 0.15) : lerp(-0.5, 0.6, ease(kk / 0.07));
    rig.legR = { lift: 0.5, tip: wind, slide: 0, kick: 0.3 };
    rig.lean = -wind * 0.25;
  }
  // finale: wave with ^^ eyes
  if (t > EV.wave) {
    rig.armR = 1.3 + Math.sin((t - EV.wave) * 12) * 0.45;
    rig.happy = true;
  }
  // the camera follows 60% of the arc so big leaps stay in frame
  return { rig, flat: 0, lie: 0, body: [x, (air ? lerp(fromY, toY, u) + 0.6 * arc : toY) + 0.3, z] };
};

// ---- the shot list: orbit a target with az/el/dist/roll, eased key to key ----
const targetPoint = (k: Shot["target"], body: V3): V3 => {
  if (k === "clawd") return body;
  if (k === "flat") {
    const [x, z] = px(FLAT_AT.x, FLAT_AT.y);
    return [x, SLAB + 0.15, z];
  }
  const [x, z] = px(VIEWER.x + VIEWER.w / 2, VIEWER.y + VIEWER.h / 2);
  return [x, 0, z];
};
export type ShotState = { pos: V3; look: V3; roll: number; fov: number; az: number; focus: number };
export const shotAt = (t: number, body: V3): ShotState => {
  let i = 0;
  while (i < SHOTS.length - 2 && t >= SHOTS[i + 1].t) i++;
  const a = SHOTS[i];
  const b = SHOTS[i + 1];
  const k = inOut((t - a.t) / (b.t - a.t));
  const look = lerp3(targetPoint(a.target, body), targetPoint(b.target, body), k);
  const az = lerp(a.az, b.az, k) * D2R;
  const el = lerp(a.el, b.el, k) * D2R;
  const dist = lerp(a.dist, b.dist, k);
  const pos: V3 = [
    look[0] + Math.sin(az) * Math.cos(el) * dist,
    look[1] + Math.sin(el) * dist,
    look[2] + Math.cos(az) * Math.cos(el) * dist,
  ];
  const focus = Math.hypot(pos[0] - body[0], pos[1] - body[1], pos[2] - body[2]);
  return { pos, look, roll: lerp(a.roll, b.roll, k) * D2R, fov: lerp(a.fov, b.fov, k), az: lerp(a.az, b.az, k), focus };
};

// the camera needs Clawd's body, Clawd needs the camera's azimuth to present to it:
// resolve with one extra pass (the azimuth barely moves the body)
export const frameState = (t: number, fps: number) => {
  const pre = clawdAt(t, fps, 0);
  const c = clawdAt(t, fps, shotAt(t, pre.body).az);
  return { clawd: c, shot: shotAt(t, c.body) };
};

// ---- props ----
export const keyScale = (t: number, k: number) =>
  t > k ? Math.min(1.3, 1.3 * ease((t - k) / 0.08)) - Math.max(0, Math.min(0.3, (t - k - 0.08) * 3)) : 0;
export const keyPos = (i: number): V3 => {
  const [x, z] = px(KEYFRAME_X[i], TL.posRowY + 22);
  return [x - 0.42, SLAB, z];
};

// Effects > Glow: the row pops out as a chip, he kicks it into the comp. null when not on screen.
export const chipAt = (t: number) => {
  if (t < EV.glowChip || t > EV.glowOn + 0.05) return null;
  const up = ease((t - EV.glowChip) / 0.18);
  const [ax, az] = px(BUTTONS.glow.x + 70, BUTTONS.glow.y - 30);
  const [bx, bz] = px(VIEWER.x + VIEWER.w / 2, VIEWER.y + VIEWER.h / 2);
  const u = clamp01((t - EV.kick) / (EV.glowOn - EV.kick));
  const k = inOut(u);
  return {
    pos: [lerp(ax, bx, k), SLAB + BTN + 0.35 * up + 1.8 * 4 * u * (1 - u), lerp(az, bz, k)] as V3,
    rot: [-Math.PI / 2 + u * 5, u * 3, 0] as V3,
    scale: up * (1 - u * 0.75),
    u,
  };
};

// the pop: glass shards burst from the comp toward the lens; null when not on screen
export const SHARD_COUNT = 44;
export const shardsAt = (t: number) => {
  const s = t - EV.pop;
  if (s < 0 || s > 0.9) return null;
  const [fx, fz] = px(FLAT_AT.x, FLAT_AT.y);
  const fade = 1 - clamp01(s / 0.9);
  const shards = Array.from({ length: SHARD_COUNT }, (_, i) => {
    const a = rand(i) * Math.PI * 2;
    const v = 1.2 + rand(i + 50) * 2.2;
    const up = 1.4 + rand(i + 100) * 2.4;
    return {
      pos: [fx + Math.cos(a) * v * s, SLAB + 0.02 + up * s - 3 * s * s, fz + Math.sin(a) * v * s + s * 1.2] as V3,
      rot: [s * 9 * rand(i + 7), s * 7, s * 5] as V3,
      size: [0.05 + rand(i + 3) * 0.1, 0.008, 0.03 + rand(i + 4) * 0.08] as V3,
    };
  });
  return { shards, fade, ring: 0.2 + ease(s / 0.3) * 1.6, ringOpacity: 0.6 * Math.max(0, 1 - s / 0.25), center: [fx, SLAB + 0.02, fz] as V3 };
};
