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

## Characters and mascots

**Ask for a reference image before modeling** any named character or mascot. Names
are ambiguous ("Claude figure" ≠ the logo ≠ the Clawd mascot); a guessed design
costs a full build-and-render round. Once you have photos, measure proportions off
them (width : height : depth, eye and leg positions) and match materials (matte
plastic vs gloss).

Build characters as a **pure model driven by a rig object** (pose numbers in, meshes
out) and keep choreography in separate functions of the frame. Re-timing or
replacing moves then never touches the model.

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
8. **Characters need animation principles, not just poses.** Add a 3–6 frame
   anticipation crouch before every jump or kick, hold the peak pose 4–6 frames
   so it reads, and get follow-through for free by sampling the arms from the rig
   2 frames earlier plus an overshoot term. Velocity squash & stretch: compare the
   rig's height at `f` and `f - 1`, stretch rising, squash landing. Make repeated
   moves different (side kick, split, spin kick) — four identical beats read as one.
   Shoot each move from the angle that shows it: moonwalk and lean in profile, side
   kicks from the front.
9. **Mix 2D and 3D in the same frame.** Give `ThreeCanvas` `gl={{ alpha: true }}`
   and no scene background so the 2D background shows through, and keep the canvas
   mounted for the whole video (hide it with opacity on 2D frames) so the GL context
   survives cuts. To pin 2D doodles to 3D action, build a `THREE.PerspectiveCamera`
   with the same position/lookAt/fov per frame and `vector.project(cam)` world
   points to pixels.
10. **Text over 3D goes in the DOM**, above the canvas, with a soft `textShadow`.
   Use `Text3D` only when the text itself is the 3D hero.
11. **Assets load through Suspense** (`useLoader`, `useGLTF`) with `staticFile()`
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

Full working example: `examples/src/three3d/Orbit3D.tsx` in this repo.

## Render

WebGL needs a GL backend flag:
```bash
npx remotion render src/index.ts <CompId> out/video.mp4 --codec h264 --crf 16 --gl=angle
# no GPU (cloud/sandbox/CI): use --gl=swangle
```
A black or blank render almost always means a missing `--gl` flag.

In cloud containers where Remotion can't download its browser, or full Chrome fails
with "Old Headless mode has been removed", point it at Playwright's headless shell:
```bash
--gl=swangle --browser-executable=/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell
```
Budget render time: lighting extras (shadow-casting spotlights, reflections, ghost
copies) can triple it.

### Floor reflections
Mirror the model under a semi-transparent glossy floor (`scale={[1, -1, 1]}`, low
opacity, no shadows). It will leak past the floor edge on low cameras. Clip it with
four `THREE.Plane`s through the camera position and each floor edge
(`setFromCoplanarPoints`, oriented so a point under the floor center is kept), set
`gl.localClippingEnabled = true` in `onCreated`, and skip the reflection entirely
for floor-level shots.

## 3D verification (add to Step 5)

Check the extracted frames for:
- Hero cropped by the frame at the end of the camera push-in (reduce scale or
  start the push further back).
- Hero overlapping the title — lift the hero, lower `lookAt`, or move the type.
- Pure black shadows or a flat-looking hero → rim light missing or too weak.
- Floor edge or fog band visible as a hard line → widen the floor / adjust fog.
- Jitter between frames → something is still time-based instead of frame-based.
- **Does each move read?** Make a contact sheet at 2 fps
  (`ffmpeg -i out/video.mp4 -vf "fps=2,scale=180:-1" sheet/%02d.png`) and name
  every move from the stills alone. If you can't tell a kick from a hop, or a
  moonwalk from standing still, fix poses or camera angle before polishing
  anything else. Framing checks alone miss this.
