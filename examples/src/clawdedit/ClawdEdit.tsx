// ClawdEdit: Clawd peels off a fake editor's comp, pops into 3D and builds the title card by
// jumping on the real buttons, then surfs the playhead. CPU-only: three.js through Remotion,
// rendered with --gl=swangle. Every value comes from timeline.ts; every motion from the frame
// number (no clock). The look is directed like macro toy photography: a low, close, canted
// camera from a shot list, AgX tone mapping, HDR emitters that bloom over a black comp, depth of
// field focused on Clawd, and a lit warm room behind the floating slabs.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ClawdModel } from "../claudedance/Clawd";
import { APP, BUTTONS, EV, PANELS, TL, VIEWER, px, playheadX, type Rect } from "./timeline";
import {
  BTN, BUTTON_PANEL, CLAWD_SCALE, SLAB, chipAt, ease, fallState, frameState, keyPos, keyScale, pressState, shardsAt,
  type ShotState,
} from "./motion.ts";
import { C, FONT, drawComp, drawUI } from "./uiCanvas";

// brand terracotta is #D97757; tone mapping shifts it, so the base is tuned and re-measured
// with qc.py color until the rendered front face reads close to #D97757
const HERO = "#CE7253";

// ---- slabs: a dark body with its crop of the UI on top, unlit so lights never mirror on it ----
const cropTexture = (base: THREE.Texture, r: Rect) => {
  const tex = base.clone();
  tex.repeat.set(r.w / APP.w, r.h / APP.h);
  tex.offset.set(r.x / APP.w, 1 - (r.y + r.h) / APP.h);
  tex.needsUpdate = true;
  return tex;
};

const Slab: React.FC<{ r: Rect; map: THREE.Texture; power: number; y: number; tilt?: number; gain?: number; h?: number }> = ({
  r, map, power, y, tilt = 0, gain = 1, h = SLAB,
}) => {
  const [cx, cz] = px(r.x + r.w / 2, r.y + r.h / 2);
  const w = r.w / 100;
  const d = r.h / 100;
  const k = gain * power;
  return (
    <group position={[cx, y, cz]} rotation={[tilt, 0, tilt * 0.4]}>
      <mesh position={[0, -h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#151413" roughness={0.35} metalness={0.2} />
      </mesh>
      {/* LOOK: the screen is pure emission — an unlit material can't mirror the key light as white blocks */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial map={map} color={new THREE.Color(k, k, k)} />
      </mesh>
    </group>
  );
};

const useFont = () => {
  const [handle] = useState(() => delayRender("font"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const ff = new FontFace(FONT, `url(${staticFile("fonts/Fredoka-Bold.woff2")})`, { weight: "700" });
    Promise.all([ff.load().then((l) => document.fonts.add(l)), document.fonts.load("600 16px Inter")])
      .catch(() => undefined)
      .finally(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};

const Workspace: React.FC<{ t: number }> = ({ t }) => {
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
  const comp = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = VIEWER.w * APP.scale;
    c.height = VIEWER.h * APP.scale;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return { c, tex };
  }, []);
  drawComp(comp.c.getContext("2d")!, t);
  comp.tex.needsUpdate = true;

  return (
    <group>
      {Object.entries(PANELS).map(([k, r]) => {
        const fs = fallState(k, t);
        return <Slab key={k} r={r} map={crops[k]} power={fs.power} y={-fs.drop} tilt={fs.tilt} />;
      })}
      {/* the live comp: HDR gain so the title blooms against true black */}
      <group position={[0, 0.003, 0]}>
        <Slab r={VIEWER} map={comp.tex} power={1} y={0} gain={1.35} h={0.01} />
      </group>
      {Object.entries(BUTTONS).map(([k, r]) => {
        const fs = fallState(BUTTON_PANEL[k], t);
        const ps = pressState(k, t);
        return <Slab key={k} r={r} map={crops[k]} power={fs.power} y={-fs.drop + BTN - ps.dip} tilt={fs.tilt} gain={1 + ps.lit * 0.9} h={BTN} />;
      })}
      <TimelineProps t={t} />
      <GlowChip t={t} map={crops.glow} />
      <Shards t={t} />
    </group>
  );
};

// keyframes are glowing white cubes that pop in as they're stamped; the playhead is a light beam
const TimelineProps: React.FC<{ t: number }> = ({ t }) => {
  const fs = fallState("timeline", t);
  const [hx, hz] = px(playheadX(t), TL.rulerY);
  const beamLen = (PANELS.timeline.y + PANELS.timeline.h - TL.rulerY) / 100;
  return (
    <group position={[0, -fs.drop, 0]} rotation={[fs.tilt, 0, fs.tilt * 0.4]}>
      {EV.keys.map((k, i) => {
        const s = keyScale(t, k);
        const [x, y, z] = keyPos(i);
        return (
          <mesh key={k} position={[x, y + 0.12 * s, z]} rotation={[0, Math.PI / 4, 0]} scale={s}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshBasicMaterial color={new THREE.Color(1.6, 1.6, 1.6).multiplyScalar(fs.power)} />
          </mesh>
        );
      })}
      {/* the CTI: a beam down the tracks and a head on the ruler he can ride */}
      <mesh position={[hx, SLAB + 0.025, hz + beamLen / 2]}>
        <boxGeometry args={[0.06, 0.05, beamLen]} />
        <meshBasicMaterial color={new THREE.Color(0.5, 1.4, 2.6).multiplyScalar(fs.power)} />
      </mesh>
      <mesh position={[hx, SLAB + 0.08, hz]} castShadow>
        <boxGeometry args={[0.3, 0.16, 0.34]} />
        <meshBasicMaterial color={new THREE.Color(0.45, 0.95, 1.5).multiplyScalar(fs.power)} />
      </mesh>
    </group>
  );
};

// Effects > Glow: the row pops out as a chip, he kicks it into the comp
const GlowChip: React.FC<{ t: number; map: THREE.Texture }> = ({ t, map }) => {
  if (!chipAt(t)) return null;
  return (
    <group>
      {[0, 1, 2, 3].map((g) => {
        const c = chipAt(t - g / 60);
        if (!c || (g > 0 && c.u <= 0)) return null;
        return (
          <mesh key={g} position={c.pos} rotation={c.rot} scale={c.scale}>
            <planeGeometry args={[3.0, 0.48]} />
            <meshBasicMaterial map={map} color={new THREE.Color(2.4, 2.4, 2.4)} transparent opacity={g ? 0.4 / g : 1} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
};

// the pop: glass shards burst from the comp toward the lens, an emissive ring expands
const Shards: React.FC<{ t: number }> = ({ t }) => {
  const st = shardsAt(t);
  if (!st) return null;
  return (
    <group>
      {st.shards.map((sh, i) => (
        <mesh key={i} position={sh.pos} rotation={sh.rot}>
          <boxGeometry args={sh.size} />
          <meshBasicMaterial color={new THREE.Color(2.2, 2.1, 2.0)} transparent opacity={st.fade} />
        </mesh>
      ))}
      <mesh position={st.center} rotation={[-Math.PI / 2, 0, 0]} scale={st.ring}>
        <ringGeometry args={[0.94, 1.0, 64]} />
        <meshBasicMaterial color={new THREE.Color(1.4, 1.1, 0.9)} transparent opacity={st.ringOpacity} />
      </mesh>
    </group>
  );
};

// a warm pool of light on the back wall (the spot's target must live in the scene)
const RoomLight: React.FC = () => {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 2, -10);
    return o;
  }, []);
  return (
    <>
      <primitive object={target} />
      <spotLight position={[1, 8, 4]} target={target} angle={0.75} penumbra={0.9} intensity={90} distance={40} decay={1.2} color="#ffb98a" />
    </>
  );
};

// the camera from the shot list, with the Dutch angle applied after lookAt
const CameraRig: React.FC<{ shot: ShotState }> = ({ shot }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(...shot.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(...shot.look);
  camera.rotateZ(shot.roll);
  if (camera.fov !== shot.fov) {
    camera.fov = shot.fov;
    camera.updateProjectionMatrix();
  }
  camera.updateMatrixWorld();
  return null;
};

// Post stack on CPU: HDR target → depth of field on Clawd → bloom on HDR emitters → AgX output.
// useFrame with priority 1 takes over rendering; Remotion's ThreeCanvas advances it once per frame.
const Post: React.FC<{ focus: number; aperture: number }> = ({ focus, aperture }) => {
  const { gl, scene, camera, size } = useThree();
  const { composer, bokeh } = useMemo(() => {
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.0;
    const rt = new THREE.WebGLRenderTarget(size.width, size.height, { type: THREE.HalfFloatType, samples: 4 });
    const c = new EffectComposer(gl, rt);
    c.addPass(new RenderPass(scene, camera));
    const b = new BokehPass(scene, camera, { focus: 3, aperture: 0.005, maxblur: 0.012 });
    c.addPass(b);
    c.addPass(new UnrealBloomPass(new THREE.Vector2(size.width / 2, size.height / 2), 0.55, 0.45, 1.0));
    c.addPass(new OutputPass());
    return { composer: c, bokeh: b };
  }, [gl, scene, camera, size.width, size.height]);
  useFrame(() => {
    const u = bokeh.uniforms as Record<string, { value: number }>;
    u.focus.value = focus;
    u.aperture.value = aperture;
    composer.render();
  }, 1);
  return null;
};

export const ClawdEdit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const fontReady = useFont();
  const t = frame / fps;
  const { clawd: c, shot } = frameState(t, fps);
  // wide shots get less blur, close shots a shallow macro focus
  const aperture = shot.focus > 6 ? 0.0015 : 0.006;

  return (
    <AbsoluteFill style={{ background: "#1c1410" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 40, near: 0.1, far: 60 }}>
        <color attach="background" args={["#2a1d16"]} />
        <fog attach="fog" args={["#2a1d16", 14, 34]} />
        <hemisphereLight args={["#ffd9c0", "#1a1210", 0.55]} />
        <directionalLight
          castShadow
          position={[-5, 11, 7]}
          intensity={2.4}
          color="#ffe2c8"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={9}
          shadow-camera-bottom={-9}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[7, 3, -6]} intensity={1.3} color="#8fb8ff" />
        {/* hero fill that follows him, and a cool spill from the screens below */}
        <pointLight position={[c.body[0] + 0.7, c.body[1] + 1.1, c.body[2] + 1.3]} intensity={1.7} distance={4} decay={1.5} color="#ffe6d6" />
        <pointLight position={[c.body[0], c.body[1] - 0.15, c.body[2] + 0.4]} intensity={0.8} distance={1.6} decay={2} color="#9fc6ff" />
        {/* the room: a warm table and back wall with a pool of light, so the slabs float in a place */}
        <RoomLight />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]} receiveShadow>
          <planeGeometry args={[80, 60]} />
          <meshStandardMaterial color="#5a3e30" roughness={0.92} />
        </mesh>
        <mesh position={[0, 6, -10]}>
          <planeGeometry args={[80, 20]} />
          <meshStandardMaterial color="#4e362a" roughness={0.95} />
        </mesh>
        <CameraRig shot={shot} />
        {fontReady && <Workspace t={t} />}
        {/* lying flat = rotate face-up, then squash world-y: the "flat PNG" look */}
        <group position={c.rig.pos} scale={[1, 1 - c.flat * 0.93, 1]}>
          <group rotation={[(-Math.PI / 2) * c.lie, 0, 0]} scale={CLAWD_SCALE}>
            <ClawdModel rig={{ ...c.rig, pos: [0, 0, 0] }} color={HERO} gloss />
          </group>
        </group>
        <Post focus={shot.focus} aperture={aperture} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, transparent 60%, rgba(0,0,0,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};
