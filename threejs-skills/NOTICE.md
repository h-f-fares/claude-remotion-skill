# Three.js skills (vendored)

Copied from [cloudai-x/threejs-skills](https://github.com/cloudai-x/threejs-skills) under the MIT license (see `LICENSE`).

Use them alongside `remotion-motion-graphics` for 3D scenes via `@remotion/three`.
Remotion rule that overrides the r3f docs: never use `useFrame` — drive every transform from `useCurrentFrame()`.

Test composition: `examples/src/three3d/Orbit3D.tsx` → `cd examples && npm run render:orbit3d`
(add `--gl=swangle` on headless Linux without a GPU).
