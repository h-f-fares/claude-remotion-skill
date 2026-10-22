// Texture exports for the Blender flow (blender/README.md): the same canvases the Remotion scene
// uses, rendered flat. ClawdUI → one 3840x2160 still; ClawdComp → the viewer, one PNG per frame.
import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { APP, VIEWER } from "./timeline";
import { FONT, drawComp, drawUI } from "./uiCanvas";

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
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

const CanvasOut: React.FC<{ w: number; h: number; draw: (ctx: CanvasRenderingContext2D) => void }> = ({ w, h, draw }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const ready = useFonts();
  useEffect(() => {
    if (!ready || !ref.current) return;
    const ctx = ref.current.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    draw(ctx);
  });
  return (
    <AbsoluteFill>
      <canvas ref={ref} width={w} height={h} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

export const ClawdUI: React.FC = () => <CanvasOut w={APP.w * APP.scale} h={APP.h * APP.scale} draw={drawUI} />;

export const ClawdComp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <CanvasOut w={VIEWER.w * APP.scale} h={VIEWER.h * APP.scale} draw={(ctx) => drawComp(ctx, frame / fps)} />;
};
