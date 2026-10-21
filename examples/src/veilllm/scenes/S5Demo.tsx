import { OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Card, Entrance, Kicker, useSpring } from "../components";
import { clamp, theme } from "../theme";
import { cabs } from "../timing";
import type { SceneProps } from "./types";

// Real Gradio playground recording (public/veilllm/clips/demo.mp4, 1200x1540): typing at 4x, then the masked result.
const W = 940;
const H = Math.round((1540 / 1200) * W);
const WIN = 1000;
// Camera keyframes inside the window: [scale, translateY] for input, output, summary.
const CAM = { input: [1.08, 0], output: [1.08, 330], summary: [1, H - WIN] } as const;

// Beats 5–6: "طب بجد بيشتغل؟ || ده اللي انت كتبته. || وده اللي الموديل شافه." + "وكل ده بيزوّد من 20 لـ 50 millisecond بس على الـ request."
export const S5Demo: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const typed = cabs(4, 1) - from;
  const saw = cabs(4, 2) - from;
  const ms = cabs(5, 0) - from;
  // Reset beat: a dark slam before the proof.
  const slam = useSpring(0, "bouncy");
  const slamOut = interpolate(frame, [typed - 8, typed], [1, 0], clamp);
  const shake = frame < 8 ? Math.sin(frame * 3) * 8 * (1 - frame / 8) : 0;
  const k = (a: number, b: number, from: readonly number[], to: readonly number[]) => {
    const p = interpolate(frame, [a, b], [0, 1], { ...clamp, easing: theme.ease.inOut });
    return [from[0] + (to[0] - from[0]) * p, from[1] + (to[1] - from[1]) * p];
  };
  const [s, ty] = frame < ms ? k(saw - 4, saw + 12, CAM.input, CAM.output) : k(ms, ms + 18, CAM.output, CAM.summary);
  const badge = useSpring(ms + 14, "bouncy");
  const hl = (y: number, h: number, on: boolean) => (
    <div style={{ position: "absolute", left: 14, right: 14, top: y, height: h, borderRadius: 14, border: `4px solid ${theme.colors.primary}`, boxShadow: `0 0 30px ${theme.colors.glow}`, opacity: on ? 1 : 0 }} />
  );
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: slamOut, transform: `translateX(${shake}px) scale(${interpolate(slam, [0, 1], [1.8, 1])})` }}>
        <div style={{ fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: 130, color: theme.colors.text, opacity: slam, marginTop: -200 }}>
          بجد <span style={{ color: theme.colors.primary }}>بيشتغل؟</span>
        </div>
      </div>
      <Sequence from={typed - 4}>
        <Entrance delay={0} y={80} style={{ position: "absolute", top: 40, left: (1080 - W) / 2, width: W }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Kicker color={theme.colors.primary}>{frame < saw ? "اللي انت كتبته" : frame < ms ? "اللي الموديل شافه" : "الوقت الإضافي"}</Kicker>
            <div style={{ fontFamily: theme.fonts.mono, fontSize: 24, color: theme.colors.textDim, direction: "ltr" }}>VeilLLM playground · live</div>
          </div>
          <Card style={{ position: "relative", height: WIN, overflow: "hidden", borderColor: `${theme.colors.primary}66` }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, transformOrigin: "50% 0%", transform: `translateY(${-ty}px) scale(${s})` }}>
              <OffthreadVideo src={staticFile("veilllm/clips/demo.mp4")} style={{ width: W, height: H }} muted />
              {hl(626, 262, frame >= saw + 10 && frame < ms)}
              {hl(988, 40, frame >= ms + 18)}
            </div>
          </Card>
        </Entrance>
      </Sequence>
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: badge, transform: `scale(${interpolate(badge, [0, 1], [0.5, 1])})` }}>
        <div style={{ background: theme.colors.bg, border: `3px solid ${theme.colors.primary}`, borderRadius: 30, padding: "18px 44px", textAlign: "center", boxShadow: "0 30px 60px rgba(0,0,0,0.7)" }}>
          <div style={{ fontFamily: "'Plex Sans', sans-serif", fontWeight: 700, fontSize: 120, color: theme.colors.primary, direction: "ltr", lineHeight: 1 }}>23.8ms</div>
          <div style={{ marginTop: 10, fontFamily: theme.fonts.sans, fontWeight: 500, fontSize: 36, color: theme.colors.text }}>عادةً من 20 لـ 50 ms</div>
        </div>
      </div>
    </div>
  );
};
