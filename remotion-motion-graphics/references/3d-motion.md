# 3D Motion (Remotion + three.js)

Read this when Step 1 decides a scene goes 3D. For deep three.js topics (materials,
lighting, shaders, loaders, post-processing) read the matching file in the
`threejs-skills/skills/` folder of this repo — but the Remotion rules below win
wherever they conflict.

## When to go 3D (decide in Step 1, without being asked)

Use 3D when **any** of these is true:
- The user says 3D, depth, rotate, orbit, spin, product shot, render, "like Apple",
  globe, planet, cube, isometric, low-poly, glass/chrome/metal look.
- The hero is a **physical object** (product, device, logo with thickness, trophy,
  coin, package) that benefits from turning in light.
- The idea is **spatial**: orbiting items, flying through a scene, data as 3D bars,
  a globe with points, layers separating in depth.
- A logo reveal needs to feel premium and the brand is not flat/minimal.

Stay 2D when: the video is mostly text/captions, a story Short with narration and
images, footage edits, UI/code demos, or flat illustration styles. **Mixed is the
default for 3D**: a 3D hero scene with 2D type, grade, grain and vignette on top.

If unsure, pick 3D only for the hero/logo scene and keep the rest 2D.

## Setup

```bash
npm install @remotion/three three @react-three/fiber
npm install -D @types/three
# optional: @react-three/drei (Environment, Text3D, useGLTF, RoundedBox)
```
Keep `@remotion/three` on the same version as `remotion`.

## Non-negotiable 3D rules

1. **Never `useFrame`, never `clock`, never `Date.now()`.** Every rotation,
   position, scale and camera move comes from `useCurrentFrame()` + `spring()` /
   `interpolate()` with easing. Frames render out of order in parallel — anything
   time-based from three.js renders wrong.
2. **Use `<ThreeCanvas width={width} height={height}>`** from `@remotion/three`,
   not r3f's `<Canvas>`. Pass `width`/`height` from `useVideoConfig()`.
3. **Animate the camera too.** A static camera on a spinning object reads as a
   screensaver. Minimum: eased push-in (z 9 → 7.5) + small truck (x −0.6 → 0.6),
   `camera.lookAt(...)` every frame (via `useThree((s) => s.camera)`).
4. **Three-point light rig, never a lone ambient.** Warm key (directional, casts
   shadows) + cool rim from behind + low hemisphere fill. Add one colored point
   light for an accent glow. Colors come from the theme.
5. **Physical materials on the hero.** `meshPhysicalMaterial` with `clearcoat` or
   metalness/roughness tuned — a flat `meshBasicMaterial` hero is the 3D version of
   "generic AI video".
6. **Ground the object.** A shadow-receiving floor (`receiveShadow`) or a contact
   shadow + `fog` matching the background color, so it doesn't float in a void.
7. **2D rules still apply.** Entrances spring in (scale from 0, staggered 3 frames),
   idle objects breathe (sin bob), exits are faster than entrances, and the
   five-layer stack is kept: 3D canvas = asset layer, then DOM type, grade, grain
   and vignette on top.
8. **Text over 3D goes in the DOM**, above the canvas, with a soft `textShadow`.
   Use `Text3D` only when the text itself is the 3D hero.
9. **Assets load through Suspense** (`useLoader`, `useGLTF`) with `staticFile()`
   paths — `ThreeCanvas` holds the render until they load. For video on a 3D
   surface use `useOffthreadVideoTexture` from `@remotion/three`.

## Skeleton

```tsx
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const CameraDriver: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const z = interpolate(frame, [0, durationInFrames], [9, 7.6], {
    easing: Easing.bezier(0.33, 0, 0.2, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  camera.position.set(0, 0.8, z);
  camera.lookAt(0, -0.2, 0);
  return null;
};

const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14 } });
  const t = frame / fps;
  return (
    <mesh castShadow scale={pop} rotation={[t * 0.6, t * 0.9, 0]}
          position={[0, 0.35 + Math.sin(t * 1.6) * 0.08, 0]}>
      <torusKnotGeometry args={[1, 0.32, 256, 48]} />
      <meshPhysicalMaterial color={theme.hero} roughness={0.18} clearcoat={1} />
    </mesh>
  );
};

export const Scene3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 40 }}>
        <color attach="background" args={[theme.bg]} />
        <fog attach="fog" args={[theme.bg, 7, 14]} />
        <hemisphereLight args={["#9fb4ff", "#1a1020", 0.5]} />
        <directionalLight castShadow position={[4, 6, 5]} intensity={2.4} color="#ffe2c4" />
        <directionalLight position={[-5, 2, -4]} intensity={1.6} color="#6fb8ff" />
        <CameraDriver />
        <Hero />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
          <circleGeometry args={[9, 64]} />
          <meshStandardMaterial color={theme.floor} roughness={0.9} />
        </mesh>
      </ThreeCanvas>
      {/* DOM title, then Grade, Grain, Vignette */}
    </AbsoluteFill>
  );
};
```

Full working examples in this repo: `examples/src/three3d/Orbit3D.tsx` (hero orbit)
and `examples/src/clawdedit/` (character film on a fake editor, one timeline file,
CPU-only). For films with a story, read `3d-production.md` next.

## Look rules learned the hard way

- **Screens/UI = emission under dark glass.** `emissiveMap` on a near-black
  `meshPhysicalMaterial` with `specularIntensity ≈ 0.1`; bright specular mirrors the key
  light as white blocks.
- **Fog far distance > camera distance** in the widest shot, or the opening goes black.
- **Tone mapping shifts brand colours** (ACES/AgX lighten and desaturate). Use `flat`
  on `<ThreeCanvas>` for UI/brand-critical scenes, or lower light/exposure, then measure
  the hero pixel against its hex (`scripts/qc.py color`).
- **Any deterministic canvas can be a texture**: draw per frame from `t`, set
  `tex.needsUpdate = true`. This is how a "live" comp, chart or screen plays on a 3D surface.
- **Squash/stretch + anticipation** on every character hop (crouch 3 frames before
  take-off, squash decaying over ~5 frames after landing).

## Render

WebGL needs a GL backend flag:
```bash
npx remotion render src/index.ts <CompId> out/video.mp4 --codec h264 --crf 16 --gl=angle
# no GPU (cloud/sandbox/CI): use --gl=swangle
```
A black or blank render almost always means a missing `--gl` flag.

No GPU is fine: swangle (SwiftShader) renders the same pixels on CPU. Budget ~5 s per
half-size still and ~1.5 s per 1080p frame on 4 cores (`--concurrency=3`). Iterate on stills
(`scripts/stills.mjs`), render the film once as a PNG sequence (`--sequence`) so a broken
range can be re-rendered alone with `--frames=a-b`. Skip effects that multiply cost on
CPU (`CameraMotionBlur` samples, postprocessing DOF); fake depth with fog and lighting.

## 3D verification (add to Step 5)

Check the extracted frames for:
- Hero cropped by the frame at the end of the camera push-in (reduce scale or
  start the push further back).
- Hero overlapping the title — lift the hero, lower `lookAt`, or move the type.
- Pure black shadows or a flat-looking hero → rim light missing or too weak.
- Floor edge or fog band visible as a hard line → widen the floor / adjust fog.
- Jitter between frames → something is still time-based instead of frame-based.
