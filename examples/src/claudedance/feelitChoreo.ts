import * as THREE from "three";
import { interpolate } from "remotion";
import { ClawdRig, LegRig, restRig } from "./Clawd";
import { BEAT_F, beatPulse, theme } from "./theme";

// Timeline, choreography and cameras for ClawdFeelIt. Pure functions of the frame number.

export const FEELIT_TOTAL_F = 450;
export const ASPECT = 1080 / 1920;
export const FOV = 46;

export const SEC = {
  cold: [0, 24], // hook: 3D Clawd already dancing
  pixel: [24, 40], // flat pixel sprite builds in
  morph: [40, 60], // sprite extrudes into the 3D model
  groove: [60, 180],
  moon: [180, 270],
  stutter: [270, 300],
  lean: [300, 330],
  kicks: [330, 386],
  finale: [386, 450],
} as const;
export const SLOTS_2D = [
  [278, 285],
  [293, 300],
] as const;
export const KICKS = [
  { f: 330, kind: "side", side: 1 },
  { f: 345, kind: "side", side: -1 },
  { f: 360, kind: "split", side: 1 },
  { f: 375, kind: "spin", side: 1 },
] as const;
export const CUTS = [24, 40, 60, 90, 105, 120, 150, 180, 225, 240, 270, 278, 285, 293, 300, 330, 345, 360, 375, 390, 405];

export const is2D = (f: number) => (f >= SEC.pixel[0] && f < SEC.pixel[1]) || SLOTS_2D.some(([a, b]) => f >= a && f < b);
export const inMorph = (f: number) => f >= SEC.morph[0] && f < SEC.morph[1];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const sinE = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));
const leg = (lift = 0, tip = 0, slide = 0, kick = 0, stretch = 0): LegRig => ({ lift, tip, slide, kick, stretch });

export const lerpRig = (a: ClawdRig, b: ClawdRig, t: number): ClawdRig => {
  const m = (x: number, y: number) => x + (y - x) * t;
  const ml = (x: LegRig, y: LegRig) =>
    leg(m(x.lift, y.lift), m(x.tip, y.tip), m(x.slide, y.slide), m(x.kick, y.kick), m(x.stretch ?? 0, y.stretch ?? 0));
  return {
    pos: [m(a.pos[0], b.pos[0]), m(a.pos[1], b.pos[1]), m(a.pos[2], b.pos[2])],
    rot: [m(a.rot[0], b.rot[0]), m(a.rot[1], b.rot[1]), m(a.rot[2], b.rot[2])],
    lean: m(a.lean ?? 0, b.lean ?? 0),
    sx: m(a.sx, b.sx), sy: m(a.sy, b.sy), armL: m(a.armL, b.armL), armR: m(a.armR, b.armR),
    legL: ml(a.legL, b.legL), legR: ml(a.legR, b.legR),
    blink: m(a.blink, b.blink), happy: t < 0.5 ? a.happy : b.happy,
  };
};

/* ---------------- section rigs ---------------- */

// step + pump: side steps on every beat, big alternating arm pumps
const stepRig = (f: number, amp = 1): ClawdRig => {
  const b = f / BEAT_F;
  const side = Math.sin(Math.PI * b);
  const hop = Math.abs(side) * 0.3 * amp;
  const land = beatPulse(f, 3);
  return {
    ...restRig(),
    pos: [side * 0.26 * amp, hop, 0],
    rot: [0, side * 0.32, -side * 0.14],
    sx: 1 + land * 0.1, sy: 1 - land * 0.16,
    armL: 1.25 * amp * Math.max(0, side) - 0.25,
    armR: 1.25 * amp * Math.max(0, -side) - 0.25,
    legL: leg(Math.max(0, side), -Math.max(0, side) * 0.5),
    legR: leg(Math.max(0, -side), -Math.max(0, -side) * 0.5),
  };
};

// shimmy: double-time twist, small bounces, arms swing in opposition
const shimmyRig = (f: number): ClawdRig => {
  const b = f / BEAT_F;
  const tw = Math.sin(2 * Math.PI * b);
  const bounce = Math.abs(Math.sin(2 * Math.PI * b)) * 0.1;
  const land = beatPulse(f * 2, 3);
  return {
    ...restRig(),
    pos: [Math.sin(Math.PI * b * 0.5) * 0.3, bounce, 0],
    rot: [0, tw * 0.42, tw * 0.06],
    sx: 1 + land * 0.06, sy: 1 - land * 0.09,
    armL: 0.5 + 0.7 * tw, armR: 0.5 - 0.7 * tw,
    legL: leg(Math.max(0, tw) * 0.5, -Math.max(0, tw) * 0.3),
    legR: leg(Math.max(0, -tw) * 0.5, -Math.max(0, -tw) * 0.3),
  };
};

const grooveRig = (f: number) => (f < 120 ? stepRig(f) : shimmyRig(f));
const coldRig = (f: number) => stepRig(f, 1.35);

// moonwalk: faces screen-right, glides screen-left. The planted pair slides back flat while the
// other pair rides heel-up; they swap every beat.
export const moonX = (f: number) => interpolate(f, [180, 270], [2.2, -2.2], { ...clamp, easing: theme.ease.inOut });
const moonRig = (f: number): ClawdRig => {
  const b = f / BEAT_F;
  const u = b % 1;
  const even = Math.floor(b) % 2 === 0;
  const heel = Math.sin(Math.PI * u);
  const active = leg(0.2 + 0.25 * heel, -0.62 * (0.35 + 0.65 * heel), -0.32 + 0.64 * u);
  const planted = leg(0, 0.05, 0.32 - 0.64 * u);
  const turn = sinE((f - 180) / 6) * (1 - sinE((f - 264) / 6));
  return {
    ...restRig(),
    pos: [moonX(f), 0.02 * Math.sin(2 * Math.PI * b), 0],
    rot: [0, (Math.PI / 2) * turn, 0],
    lean: -0.07 * turn,
    armL: -0.2 + 0.18 * Math.sin(Math.PI * b),
    armR: -0.2 - 0.18 * Math.sin(Math.PI * b),
    legL: even ? active : planted,
    legR: even ? planted : active,
  };
};

const flapRig = (f: number): ClawdRig => {
  const b = f / BEAT_F;
  const flap = Math.sin(2 * Math.PI * b);
  const hop = Math.abs(Math.sin(Math.PI * b)) * 0.34;
  return {
    ...restRig(),
    pos: [0, hop, 0],
    rot: [0, Math.sin((Math.PI * b) / 2) * 0.5, Math.sin(Math.PI * b) * 0.1],
    armL: 0.6 + 0.75 * flap, armR: 0.6 + 0.75 * flap,
    legL: leg(Math.max(0, flap) * 0.7, -Math.max(0, flap) * 0.35),
    legR: leg(Math.max(0, -flap) * 0.7, -Math.max(0, -flap) * 0.35),
  };
};

// lean: turn to profile, a small lean back (anticipation), the long impossible lean forward,
// hold, then snap upright with an overshoot
const leanRig = (f: number): ClawdRig => {
  const turn = sinE((f - 300) / 4) * (1 - sinE((f - 326) / 4));
  const lean = interpolate(f, [300, 304, 308, 318, 324, 327, 330], [0, 0, -0.12, 0.62, 0.62, -0.1, 0], {
    ...clamp, easing: theme.ease.inOut,
  });
  return {
    ...restRig(),
    rot: [0, (Math.PI / 2) * turn, 0],
    lean,
    armL: -0.35, armR: -0.35,
  };
};

// kicks: crouch → snap → hold → recover. Four different ones so each beat reads.
const kickRig = (f: number): ClawdRig => {
  const base = stepRig(f, 0.5);
  let r: ClawdRig = { ...base };
  for (const k of KICKS) {
    const d = f - k.f;
    if (d < -6 || d > 14) continue;
    const antic = interpolate(d, [-6, -2, 0], [0, 1, 0], clamp);
    const amt = interpolate(d, [-1, 2, 8, 14], [0, 1, 1, 0], { ...clamp, easing: theme.ease.out });
    const crouch = { sy: 1 - antic * 0.16, sx: 1 + antic * 0.08, y: -antic * 0.04 };
    if (k.kind === "side") {
      const kl = leg(0.45 * amt, -0.35 * amt, 0, 1.35 * amt, 0.9 * amt);
      r = {
        ...r,
        pos: [base.pos[0] * 0.3 - k.side * 0.15 * amt, crouch.y + 0.12 * amt, 0],
        rot: [0, k.side * 0.25 * amt, -k.side * 0.26 * amt],
        sx: crouch.sx, sy: crouch.sy + 0.06 * amt,
        armL: k.side > 0 ? -0.3 + 1.9 * amt : -0.3 - 0.3 * amt,
        armR: k.side < 0 ? -0.3 + 1.9 * amt : -0.3 - 0.3 * amt,
        legL: k.side < 0 ? kl : leg(0, 0, 0, -0.1 * amt),
        legR: k.side > 0 ? kl : leg(0, 0, 0, -0.1 * amt),
        happy: amt > 0.6,
      };
    } else if (k.kind === "split") {
      const air = Math.sin(Math.PI * Math.min(1, Math.max(0, (d + 1) / 13)));
      const kl = leg(0.4 * amt, -0.2 * amt, 0, 1.15 * amt, 0.75 * amt);
      r = {
        ...r,
        pos: [0, crouch.y + air * 0.75, 0],
        rot: [0, 0, 0],
        sx: crouch.sx, sy: crouch.sy + air * 0.08,
        armL: -0.3 + 1.8 * amt, armR: -0.3 + 1.8 * amt,
        legL: kl, legR: kl,
        happy: amt > 0.5,
      };
    } else {
      // spin kick: a full turn on the beat, the kick lands as the spin finishes
      const spin = interpolate(d, [-5, 4], [0, Math.PI * 2], { ...clamp, easing: theme.ease.inOut });
      const late = interpolate(d, [2, 5, 10, 14], [0, 1, 1, 0], { ...clamp, easing: theme.ease.out });
      const kl = leg(0.45 * late, -0.35 * late, 0, 1.35 * late, 0.9 * late);
      r = {
        ...r,
        pos: [0, crouch.y + 0.1 * amt, 0],
        rot: [0, spin + 0.25 * late, -0.26 * late],
        sx: crouch.sx, sy: crouch.sy,
        armL: -0.3 + 1.2 * amt + 0.7 * late, armR: -0.3 + 1.2 * amt - 1.0 * late,
        legL: leg(0, 0, 0, -0.1 * late), legR: kl,
        happy: late > 0.6,
      };
    }
  }
  return r;
};

// finale: deep crouch, jump, squash landing, arms-up celebration
const finaleRig = (f: number): ClawdRig => {
  const antic = interpolate(f, [386, 389, 391], [0, 1, 0], clamp);
  const jt = interpolate(f, [390, 404], [0, 1], clamp);
  const air = Math.sin(Math.PI * jt);
  const land = interpolate(f, [404, 407, 418], [0, 1, 0], { ...clamp, easing: theme.ease.out });
  const t = (f - 404) / 30;
  const wave = f > 404 ? Math.sin(t * 7) : 0;
  return {
    ...restRig(),
    pos: [0, air * 1.4 - antic * 0.05, 0],
    rot: [0, -0.2 * sinE((f - 404) / 12), 0.08 * wave],
    sx: 1 + land * 0.16 + antic * 0.1, sy: 1 - land * 0.26 - antic * 0.2,
    armL: f < 391 ? -0.2 - antic * 0.4 : 1.35 + 0.15 * wave,
    armR: f < 391 ? -0.2 - antic * 0.4 : 1.35 - 0.15 * wave,
    legL: leg(air * 0.6, -air * 0.35), legR: leg(air * 0.6, -air * 0.35),
    happy: f >= 404,
  };
};

const ORDER: [number, (f: number) => ClawdRig][] = [
  [SEC.cold[0], coldRig],
  [SEC.groove[0], grooveRig],
  [SEC.moon[0], moonRig],
  [SEC.stutter[0], flapRig],
  [SEC.lean[0], leanRig],
  [SEC.kicks[0], kickRig],
  [SEC.finale[0], finaleRig],
];

// section rig with 5-frame crossfades at each boundary
const rawRig = (f: number): ClawdRig => {
  let i = ORDER.length - 1;
  while (i > 0 && f < ORDER[i][0]) i--;
  const rig = ORDER[i][1](f);
  if (i > 0) {
    const t = interpolate(f, [ORDER[i][0], ORDER[i][0] + 5], [0, 1], clamp);
    if (t < 1) return lerpRig(ORDER[i - 1][1](f), rig, sinE(t));
  }
  return rig;
};

// Final rig: adds follow-through (arms trail the body by 2 frames and overshoot) and
// velocity squash & stretch (stretch rising, squash falling) on top of the raw choreography.
export const rigAt = (f: number): ClawdRig => {
  const now = rawRig(f);
  const a2 = rawRig(f - 2);
  const a4 = rawRig(f - 4);
  const vy = now.pos[1] - rawRig(f - 1).pos[1];
  const stretch = Math.max(-0.12, Math.min(0.2, vy * 1.8));
  const blink = Math.max(...[75, 160, 250, 316].map((b) => Math.max(0, 1 - Math.abs(f - b) / 2.5)));
  const closeHappy = f >= 97 && f < 105;
  return {
    ...now,
    sx: now.sx * (1 - stretch * 0.45),
    sy: now.sy * (1 + stretch),
    armL: a2.armL + (a2.armL - a4.armL) * 0.6,
    armR: a2.armR + (a2.armR - a4.armR) * 0.6,
    blink: now.happy ? 0 : blink,
    happy: now.happy || closeHappy,
  };
};

// how fast Clawd is moving — drives the smear ghosts
export const speedAt = (f: number) => {
  const a = rawRig(f);
  const b = rawRig(f - 2);
  const dl = (x: LegRig, y: LegRig) => Math.abs(x.kick - y.kick) + Math.abs(x.tip - y.tip);
  return (
    Math.hypot(a.pos[0] - b.pos[0], a.pos[1] - b.pos[1]) * 2 +
    Math.abs(a.rot[1] - b.rot[1]) * 0.8 +
    (dl(a.legL, b.legL) + dl(a.legR, b.legR)) * 0.5
  );
};

/* ---------------- cameras ---------------- */

export type V3 = [number, number, number];
const lerp3 = (a: V3, b: V3, t: number) => a.map((v, i) => v + (b[i] - v) * t) as V3;
const shot = (f: number, a: number, b: number, from: V3, to: V3, look: V3, lookTo?: V3, ease = theme.ease.out) => {
  const e = ease(Math.min(1, Math.max(0, (f - a) / (b - a))));
  return { pos: lerp3(from, to, e), look: lookTo ? lerp3(look, lookTo, e) : look };
};
const orbit = (f: number, a: number, b: number, a0: number, a1: number, r0: number, r1: number, y: number, look: V3) => {
  const t = theme.ease.out(Math.min(1, Math.max(0, (f - a) / (b - a))));
  const ang = a0 + (a1 - a0) * t;
  const r = r0 + (r1 - r0) * t;
  return { pos: [Math.sin(ang) * r, y, Math.cos(ang) * r] as V3, look };
};

// the morph starts with a straight-on camera that frames the 3D sprite exactly where the
// 2D sprite sat (center 860px from the top, 38px per pixel column)
export const MORPH_CAM: { pos: V3; look: V3 } = { pos: [0, 0.474, 11.9], look: [0, 0.474, 0] };

export const camAt = (f: number): { pos: V3; look: V3 } => {
  const mx = moonX(Math.min(270, Math.max(180, f)));
  if (f < 24) return shot(f, 0, 24, [0, 0.7, 9.4], [0.5, 0.95, 8.4], [0, 1.15, 0]);
  if (f < 60) return shot(f, 40, 60, MORPH_CAM.pos, [4.6, 1.8, 8.2], MORPH_CAM.look, [0, 1.0, 0], theme.ease.inOut);
  if (f < 90) return shot(f, 60, 90, [0, 2.6, 10.8], [0.6, 2.2, 9.2], [0, 1.15, 0]);
  if (f < 105) return shot(f, 90, 105, [0.35, 1.55, 6.8], [0.15, 1.5, 6.1], [0, 1.2, 0]);
  if (f < 120) return shot(f, 105, 120, [0.4, 11.5, 4.6], [0, 11, 4.1], [0, 0, 0]);
  if (f < 150) return shot(f, 120, 150, [-3.2, 0.3, 7.8], [-2.5, 0.4, 7.0], [0, 1.8, 0]);
  if (f < 180) return orbit(f, 150, 180, 0.9, -0.6, 9.4, 9.0, 2.4, [0, 1.2, 0]);
  // moonwalk: low true-profile tracking, then the feet at floor height, then wide
  if (f < 225) return { pos: [mx * 0.85, 0.75, 8.2], look: [mx, 0.85, 0] };
  if (f < 240) return { pos: [mx + 1.0, 2.6, 6.4], look: [mx, 0.3, 0] };
  if (f < 270) return shot(f, 240, 270, [1.5, 5.2, 12.5], [0.5, 4.6, 11.5], [mx * 0.5, 0.9, 0]);
  if (f < 285) return shot(f, 270, 278, [7.4, 1.7, 3.2], [6.8, 1.6, 3.6], [0, 1.2, 0]);
  if (f < 300) return shot(f, 285, 293, [0.5, 7.8, 4.4], [0, 7.2, 4.0], [0, 0.6, 0]);
  // lean: full profile at body height so the angle reads against the background
  if (f < 330) return shot(f, 300, 330, [0, 1.05, 8.6], [0, 1.1, 8.0], [0, 1.25, 0]);
  if (f < 345) return shot(f, 330, 345, [0, 1.8, 9.6], [0, 1.7, 9.0], [0, 1.2, 0]);
  if (f < 360) return shot(f, 345, 360, [-6.6, 1.7, 7.0], [-6.0, 1.6, 6.6], [0, 1.2, 0]);
  if (f < 375) return shot(f, 360, 375, [0, 0.5, 9.4], [0, 0.6, 8.8], [0, 1.8, 0]);
  if (f < 390) return shot(f, 375, 390, [6.6, 1.7, 7.0], [6.0, 1.6, 6.6], [0, 1.2, 0]);
  if (f < 405) return { pos: [0, 0.3, 8.8], look: [0, 2.2, 0] };
  return orbit(f, 405, 450, 0.5, -0.15, 9.0, 10.4, 2.3, [0, 2.9, 0]);
};

export const shakeAt = (f: number) => beatPulse(f, 2.5) * 0.025;

// projects a world point to composition pixels with the same camera the 3D scene uses,
// so 2D doodles stick to the 3D action
export const makeProjector = (f: number, width: number, height: number) => {
  const cam = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 200);
  const { pos, look } = camAt(f);
  const s = shakeAt(f);
  cam.position.set(pos[0] + s, pos[1] + s * 0.6, pos[2]);
  cam.lookAt(...look);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3();
  return (p: V3) => {
    v.set(p[0], p[1], p[2]).project(cam);
    return { x: (v.x * 0.5 + 0.5) * width, y: (-v.y * 0.5 + 0.5) * height, visible: v.z < 1 };
  };
};
