// ClawdEdit: Clawd peels off a fake editor's comp, pops into 3D and builds the title card by
// jumping on the real buttons. CPU-only: three.js through Remotion, rendered with --gl=swangle.
// Every value comes from timeline.ts; every motion from the frame number (no useFrame, no clock).
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ClawdModel, restRig, type ClawdRig } from "../claudedance/Clawd";
import { BUTTONS, CAMERA, EV, FALL_ORDER, FLAT_AT, HOPS, KEYFRAME_X, PANELS, TL, APP, px, type Rect } from "./timeline";
import { C, FONT, drawComp, drawUI } from "./uiCanvas";

const SLAB = 0.08; // panel thickness (world units)
const BTN = 0.05; // buttons stand proud of their panel
const CLAWD_SCALE = 0.3;
const FILL = 3;
const FLAT_HALF = 0.3; // half of Clawd's lying length, so he sits centred in his selection box

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const inOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => lerp(v, b[i], k));

// which panel a button lives on, so it falls with it
const BUTTON_PANEL: Record<string, string> = { type: "tools", rect: "tools", pen: "tools", play: "preview", glow: "effects" };

// power-down then fall: returns {power 1→0, drop (world units), tilt}
const fallState = (panel: string, t: number) => {
  const i = FALL_ORDER.indexOf(panel);
  if (i < 0) return { power: 1, drop: 0, tilt: 0 };
  const t0 = EV.powerDown[i];
  const power = 1 - clamp01((t - t0 + 0.12) / 0.12);
  const s = Math.max(0, t - t0);
  return { power, drop: 7 * s * s, tilt: s * s * (i % 2 ? 0.6 : -0.5) };
};

// press: a button dips for 4 frames on its landing, then stays lit
const pressState = (key: string, t: number) => {
  const hop = HOPS.find((h) => h.press === key);
  if (!hop) return { dip: 0, lit: 0 };
  const s = t - hop.t1;
  return { dip: s > 0 && s < 0.18 ? Math.sin((s / 0.18) * Math.PI) * 0.035 : 0, lit: s > 0 ? 1 : 0 };
};

const surfaceY = (key?: string) => SLAB + (key && BUTTONS[key] ? BTN : 0);

// ---- Clawd's rig and ground position at time t, straight from the hop list ----
const clawdAt = (t: number, fps: number) => {
  const rig: ClawdRig = restRig();
  const [fx, fz] = px(FLAT_AT.x, FLAT_AT.y);
  if (t < EV.pop) {
    // a flat PNG lying on the comp; two knocks bump him from inside
    const knock = [EV.knock1, EV.knock2].reduce((m, k) => Math.max(m, t > k && t < k + 0.2 ? Math.sin(((t - k) / 0.2) * Math.PI) : 0), 0);
    return { rig: { ...rig, pos: [fx, SLAB + 0.01 + knock * 0.08, fz + FLAT_HALF] as [number, number, number] }, flat: 1, lie: 1, ground: [fx, fz] };
  }
  let i = -1;
  HOPS.forEach((h, k) => t >= h.t0 && (i = k));
  const hop = HOPS[i];
  const from = i === 0 ? { x: FLAT_AT.x, y: FLAT_AT.y + FLAT_HALF * 100 } : HOPS[i - 1].to;
  const fromY = i === 0 ? SLAB : surfaceY(HOPS[i - 1].press);
  const toY = surfaceY(hop.press);
  const [ax, az] = px(from.x, from.y);
  const [bx, bz] = px(hop.to.x, hop.to.y);
  const u = clamp01((t - hop.t0) / (hop.t1 - hop.t0));
  const k = inOut(u);
  const air = t < hop.t1;
  const x = lerp(ax, bx, u);
  const z = lerp(az, bz, u);
  const dip = hop.press ? pressState(hop.press, t).dip : 0;
  const y = lerp(fromY, toY, u) + hop.apex * 4 * u * (1 - u) - (air ? 0 : dip);

  rig.pos = [x, y, z];
  // first hop: peel up as a flat card, then inflate into 3D
  const peel = i === 0 ? ease((t - EV.pop) / 0.25) : 1;
  const flat = i === 0 ? 1 - ease((t - EV.pop - 0.1) / 0.18) : 0;

  if (air) {
    rig.armL = rig.armR = 0.9;
    rig.legL = { lift: 0.6, tip: -0.3, slide: 0, kick: 0 };
    rig.legR = { lift: 0.6, tip: -0.3, slide: 0, kick: 0 };
    rig.rot = [hop.flip ? -Math.PI * 2 * k : 0, 0, -Math.sign(bx - ax) * Math.sin(Math.PI * u) * 0.25];
    rig.sy = 1 + Math.sin(Math.PI * u) * 0.12; // stretch in the air
    rig.sx = 1 - Math.sin(Math.PI * u) * 0.05;
  } else {
    // squash on landing, decaying over ~5 frames
    const land = Math.exp(-((t - hop.t1) * fps) / 3);
    rig.sx = 1 + land * 0.14;
    rig.sy = 1 - land * 0.2;
  }
  // anticipation: crouch for 3 frames before the next take-off
  const next = HOPS[i + 1];
  if (next && !air) {
    const pre = clamp01(1 - (next.t0 - t) * fps / 3);
    rig.sy *= 1 - pre * 0.15;
    rig.sx *= 1 + pre * 0.08;
  }
  // the kick that sends the Glow chip into the comp
  const kk = t - EV.kick;
  if (kk > -0.1 && kk < 0.3) rig.legR = { lift: 0.4, tip: 0, slide: 0, kick: Math.sin(clamp01((kk + 0.1) / 0.4) * Math.PI) * 0.9 };
  // finale: wave with ^^ eyes
  if (t > EV.wave) {
    rig.armR = 1.3 + Math.sin((t - EV.wave) * 12) * 0.45;
    rig.happy = true;
  }
  rig.blink = Math.max(0, 1 - Math.abs(t - 3.45) * 12);
  const gu = hop.flip ? k : ease(u * 1.4);
  return { rig, flat, lie: 1 - peel, ground: [lerp(ax, bx, gu), lerp(az, bz, gu)] };
};

// ---- slabs: a dark glossy body with its crop of the UI as emission on top ----
const cropTexture = (base: THREE.Texture, r: Rect) => {
  const tex = base.clone();
  tex.repeat.set(r.w / APP.w, r.h / APP.h);
  tex.offset.set(r.x / APP.w, 1 - (r.y + r.h) / APP.h);
  tex.needsUpdate = true;
  return tex;
};

const Slab: React.FC<{ r: Rect; map: THREE.Texture; power: number; y: number; tilt?: number; lit?: number }> = ({
  r, map, power, y, tilt = 0, lit = 0,
}) => {
  const [cx, cz] = px(r.x + r.w / 2, r.y + r.h / 2);
  const w = r.w / 100;
  const d = r.h / 100;
  return (
    <group position={[cx, y, cz]} rotation={[tilt, 0, tilt * 0.4]}>
      <mesh position={[0, -SLAB / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, SLAB, d]} />
        <meshStandardMaterial color="#0b0a09" roughness={0.45} />
      </mesh>
      {/* LOOK: screen as emission under black glass; low specular so lights never blow it out */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshPhysicalMaterial
          color="#050505"
          roughness={0.32}
          specularIntensity={0.1}
          clearcoat={0.35}
          clearcoatRoughness={0.3}
          emissiveMap={map}
          emissive="#ffffff"
          emissiveIntensity={(1.25 + lit * 0.5) * power}
        />
      </mesh>
    </group>
  );
};

const useFont = () => {
  const [handle] = useState(() => delayRender("font"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const ff = new FontFace(FONT, `url(${staticFile("fonts/Fredoka-Bold.woff2")})`, { weight: "600" });
    ff.load()
      .then((loaded) => document.fonts.add(loaded))
      .finally(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};

const Workspace: React.FC<{ t: number }> = ({ t }) => {
  // the whole UI drawn once at 2x, then cut into slabs
  const ui = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = APP.w * APP.scale;
    c.height = APP.h * APP.scale;
    drawUI(c.getContext("2d")!);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);
  const crops = useMemo(() => {
    const o: Record<string, THREE.Texture> = {};
    for (const [k, r] of Object.entries({ ...PANELS, ...BUTTONS })) o[k] = cropTexture(ui, r);
    return o;
  }, [ui]);

  // the comp is a canvas redrawn from the playhead time each frame
  const comp = useMemo(() => {
    const c = document.createElement("canvas");
    const p = PANELS.comp;
    c.width = p.w * APP.scale;
    c.height = (p.h - 34) * APP.scale;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return { c, tex };
  }, []);
  drawComp(comp.c.getContext("2d")!, t, PANELS.comp.w, PANELS.comp.h - 34);
  comp.tex.needsUpdate = true;

  const compView: Rect = { x: PANELS.comp.x, y: PANELS.comp.y + 34, w: PANELS.comp.w, h: PANELS.comp.h - 34 };

  return (
    <group>
      {Object.entries(PANELS).map(([k, r]) => {
        const fs = fallState(k, t);
        return <Slab key={k} r={r} map={crops[k]} power={fs.power} y={-fs.drop} tilt={fs.tilt} />;
      })}
      {/* the live comp sits just above its panel slab */}
      <group position={[0, 0.002, 0]}>
        <Slab r={compView} map={comp.tex} power={1} y={0} lit={0.25} />
      </group>
      {Object.entries(BUTTONS).map(([k, r]) => {
        const fs = fallState(BUTTON_PANEL[k], t);
        const ps = pressState(k, t);
        return <Slab key={k} r={r} map={crops[k]} power={fs.power} y={-fs.drop + BTN - ps.dip} tilt={fs.tilt} lit={ps.lit} />;
      })}
      <TimelineMarks t={t} />
      <GlowChip t={t} />
    </group>
  );
};

// keyframe diamonds pop in as they are stamped; the playhead rewinds and plays
const TimelineMarks: React.FC<{ t: number }> = ({ t }) => {
  const fs = fallState("timeline", t);
  const head = t < EV.keys[0] ? TL.trackX0 + 20
    : t < EV.play ? KEYFRAME_X[EV.keys.filter((k) => t >= k).length - 1]
    : lerp(KEYFRAME_X[0], KEYFRAME_X[2], inOut(t - EV.play));
  const [hx, hz] = px(head, (PANELS.timeline.y + PANELS.timeline.y + PANELS.timeline.h) / 2);
  return (
    <group position={[0, -fs.drop, 0]} rotation={[fs.tilt, 0, fs.tilt * 0.4]}>
      {EV.keys.map((k, i) => {
        const s = t > k ? Math.min(1.25, 1.25 * ease((t - k) / 0.1)) - Math.max(0, Math.min(0.25, (t - k - 0.1) * 2)) : 0;
        const [x, z] = px(KEYFRAME_X[i], TL.posRowY + 22);
        return (
          <mesh key={k} position={[x - 0.32, SLAB + 0.04, z]} rotation={[0, Math.PI / 4, 0]} scale={s}>
            <boxGeometry args={[0.16, 0.06, 0.16]} />
            <meshStandardMaterial color={C.accentHi} emissive={C.accent} emissiveIntensity={1.4 * fs.power} />
          </mesh>
        );
      })}
      <mesh position={[hx, SLAB + 0.02, hz]}>
        <boxGeometry args={[0.04, 0.03, PANELS.timeline.h / 100 - 0.1]} />
        <meshStandardMaterial color={C.blue} emissive={C.blue} emissiveIntensity={1.2 * fs.power} />
      </mesh>
    </group>
  );
};

// Effects > Glow: a chip pops up under Clawd, he kicks it into the comp
const GlowChip: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.glowChip || t > EV.glowOn + 0.05) return null;
  const up = ease((t - EV.glowChip) / 0.15);
  const [ax, az] = px(BUTTONS.glow.x + 70, BUTTONS.glow.y - 30);
  const [bx, bz] = px(PANELS.comp.x + 580, PANELS.comp.y + 270);
  const u = clamp01((t - EV.kick) / (EV.glowOn - EV.kick));
  const k = inOut(u);
  return (
    <mesh
      position={[lerp(ax, bx, k), SLAB + 0.2 * up + 1.6 * 4 * u * (1 - u), lerp(az, bz, k)]}
      rotation={[u * 6, u * 4, 0]}
      scale={up * (1 - u * 0.7)}
      castShadow
    >
      <boxGeometry args={[0.7, 0.08, 0.3]} />
      <meshStandardMaterial color={C.accentHi} emissive={C.accent} emissiveIntensity={1.6} />
    </mesh>
  );
};

const CameraRig: React.FC<{ ground: number[]; t: number }> = ({ ground, t }) => {
  const camera = useThree((s) => s.camera);
  const wF = inOut((t - CAMERA.followIn[0]) / (CAMERA.followIn[1] - CAMERA.followIn[0]));
  const wE = inOut((t - CAMERA.endIn[0]) / (CAMERA.endIn[1] - CAMERA.endIn[0]));
  const [cx, cz] = px(PANELS.comp.x + PANELS.comp.w / 2, PANELS.comp.y + PANELS.comp.h / 2);
  const gx = lerp(ground[0], cx, CAMERA.followBias);
  const gz = lerp(ground[1], cz, CAMERA.followBias);
  const follow = { pos: [gx + CAMERA.followOffset[0], CAMERA.followOffset[1], gz + CAMERA.followOffset[2]], look: [gx, 0.3, gz] };
  const pos = lerp3(lerp3(CAMERA.wide.pos, follow.pos, wF), CAMERA.end.pos, wE);
  const look = lerp3(lerp3(CAMERA.wide.look, follow.look, wF), CAMERA.end.look, wE);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  return null;
};

export const ClawdEdit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const fontReady = useFont();
  const t = frame / fps;
  const c = clawdAt(t, fps);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 38, near: 0.1, far: 80 }}>
        <color attach="background" args={["#0d0a08"]} />
        <fog attach="fog" args={["#0d0a08", 15, 36]} />
        <hemisphereLight args={["#ffd9c0", "#0a0706", 0.45]} />
        <directionalLight
          castShadow
          position={[-4, 11, 7]}
          intensity={2.1}
          color="#ffe2c8"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[7, 3, -6]} intensity={1.1} color="#8fb8ff" />
        <pointLight position={[0, 1.4, -1.4]} intensity={4} distance={6} color="#ff9a6a" />
        {/* hero fill: measured Clawd at L 46 vs 62 for his hex in the dark studio, so he gets his own soft light */}
        <pointLight position={[c.rig.pos[0] + 0.6, c.rig.pos[1] + 1.3, c.rig.pos[2] + 1.4]} intensity={FILL} distance={4} decay={1.5} color="#ffe6d6" />
        <CameraRig ground={c.ground} t={t} />
        {fontReady && <Workspace t={t} />}
        {/* lying flat = rotate face-up, then squash world-y: the "flat PNG" look */}
        <group position={c.rig.pos} scale={[1, 1 - c.flat * 0.93, 1]}>
          <group rotation={[-Math.PI / 2 * c.lie, 0, 0]} scale={CLAWD_SCALE}>
            <ClawdModel rig={{ ...c.rig, pos: [0, 0, 0] }} />
          </group>
        </group>
        {/* the studio floor far below the floating slabs */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]} receiveShadow>
          <planeGeometry args={[60, 40]} />
          <meshStandardMaterial color="#17110d" roughness={0.95} />
        </mesh>
      </ThreeCanvas>
      {/* DOM finish: vignette on top (grain/grade from the 2D stack go here too) */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
