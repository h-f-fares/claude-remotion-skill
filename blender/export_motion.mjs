#!/usr/bin/env node
// Bakes every animated value of ClawdEdit into blender/build/motion.json, computed by the SAME
// motion.ts the Remotion scene renders with. Blender only applies numbers; it never re-derives
// the choreography, so both renderers stay frame-identical in timing.
//   node blender/export_motion.mjs        (Node ≥22.18 reads .ts directly)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..", "examples", "src", "clawdedit");
const T = await import(join(src, "timeline.ts"));
const M = await import(join(src, "motion.ts"));

const frames = Math.round(T.FPS * T.TOTAL_S);
const r4 = (v) => Math.round(v * 1e4) / 1e4;
const r = (a) => (Array.isArray(a) ? a.map(r4) : r4(a));

const out = {
  meta: {
    fps: T.FPS, frames, app: T.APP, panels: T.PANELS, viewer: T.VIEWER, buttons: T.BUTTONS, fallOrder: T.FALL_ORDER,
    buttonPanel: M.BUTTON_PANEL, slab: M.SLAB, btn: M.BTN, clawdScale: M.CLAWD_SCALE, pxPerUnit: T.PX_PER_UNIT,
    keyCount: T.EV.keys.length, shardCount: M.SHARD_COUNT, timelineRect: T.PANELS.timeline, rulerY: T.TL.rulerY,
  },
  frames: [],
};

for (let f = 0; f < frames; f++) {
  const t = f / T.FPS;
  const { clawd, shot } = M.frameState(t, T.FPS);
  const rig = clawd.rig;
  const panels = Object.fromEntries(Object.keys(T.PANELS).map((k) => {
    const s = M.fallState(k, t);
    return [k, { power: r4(s.power), drop: r4(s.drop), tilt: r4(s.tilt) }];
  }));
  const buttons = Object.fromEntries(Object.keys(T.BUTTONS).map((k) => {
    const fs = M.fallState(M.BUTTON_PANEL[k], t);
    const ps = M.pressState(k, t);
    return [k, { power: r4(fs.power), drop: r4(fs.drop), tilt: r4(fs.tilt), dip: r4(ps.dip), lit: ps.lit }];
  }));
  const chip = M.chipAt(t);
  const sh = M.shardsAt(t);
  const [phx, phz] = T.px(T.playheadX(t), T.TL.rulerY);
  out.frames.push({
    t: r4(t),
    clawd: {
      pos: r(rig.pos), rot: r(rig.rot), lean: r4(rig.lean ?? 0), sx: r4(rig.sx), sy: r4(rig.sy),
      armL: r4(rig.armL), armR: r4(rig.armR), legL: rig.legL, legR: rig.legR, blink: r4(rig.blink), happy: rig.happy,
      flat: r4(clawd.flat), lie: r4(clawd.lie), body: r(clawd.body),
    },
    camera: { pos: r(shot.pos), look: r(shot.look), roll: r4(shot.roll), fov: r4(shot.fov), focus: r4(shot.focus) },
    panels, buttons,
    keys: T.EV.keys.map((k, i) => ({ scale: r4(M.keyScale(t, k)), pos: r(M.keyPos(i)) })),
    playhead: { x: r4(phx), z: r4(phz) },
    chip: chip ? { pos: r(chip.pos), rot: r(chip.rot), scale: r4(chip.scale) } : null,
    shards: sh ? { fade: r4(sh.fade), ring: r4(sh.ring), ringOpacity: r4(sh.ringOpacity), center: r(sh.center),
      items: sh.shards.map((s) => ({ pos: r(s.pos), rot: r(s.rot), size: r(s.size) })) } : null,
  });
}

mkdirSync(join(here, "build"), { recursive: true });
writeFileSync(join(here, "build", "motion.json"), JSON.stringify(out));
console.log(`wrote blender/build/motion.json  ${frames} frames`);
