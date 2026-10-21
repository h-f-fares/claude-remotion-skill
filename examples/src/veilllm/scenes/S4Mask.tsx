import { interpolate, useCurrentFrame } from "remotion";
import { Card, Cloud, Entrance, Kicker, Shield, useSpring } from "../components";
import { clamp, theme } from "../theme";
import { cabs, wabs } from "../timing";
import type { SceneProps } from "./types";

// Flips from the real value to its placeholder (masked=true) with a 3D turn.
const Token: React.FC<{ real: string; tag: string; at: number; restoreAt?: number }> = ({ real, tag, at, restoreAt }) => {
  const frame = useCurrentFrame();
  const m = interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const r = restoreAt === undefined ? 0 : interpolate(frame, [restoreAt, restoreAt + 10], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const masked = m >= 0.5 && r < 0.5;
  const restored = r >= 0.5;
  const turn = Math.sin(Math.PI * (r > 0 ? r : m)) * 90;
  const flash = restored ? interpolate(frame, [restoreAt! + 5, restoreAt! + 25], [1, 0], clamp) : 0;
  const color = masked ? theme.colors.primary : restored ? theme.colors.text : theme.colors.danger;
  return (
    <span style={{ display: "inline-block", transform: `rotateX(${turn}deg)`, color, background: masked ? `${theme.colors.primary}1f` : restored ? `rgba(94,234,212,${0.35 * flash})` : `${theme.colors.danger}1a`, borderRadius: 8, padding: "0 6px", margin: "0 2px" }}>
      {masked ? tag : real}
    </span>
  );
};

// "بيلاقي الأسامي والإيميلات والـ API keys، ويبدّلها بـ placeholders قبل ما الـ request يخرج. || ولما الـ response يرجع، بيرجّع القيم الحقيقية مكانها."
// Placeholders use the real format from the Gradio demo.
export const S4Mask: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const find = [wabs(3, "الأسامي"), wabs(3, "والإيميلات"), wabs(3, "API")].map((f) => f - from);
  const mask = wabs(3, "ويبدّلها") - from;
  const reply = cabs(3, 1) - from;
  const restore = wabs(3, "بيرجّع") - from;
  const up = interpolate(frame, [mask + 20, reply - 4], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const down = interpolate(frame, [reply - 4, reply + 14], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const replyIn = useSpring(reply + 8, "smooth");
  const ring = (i: number) => (frame >= find[i] && frame < mask ? `0 0 0 3px ${theme.colors.danger}` : "none");
  const text = { fontFamily: theme.fonts.mono, fontSize: 31, lineHeight: 1.75, color: theme.colors.text, perspective: 600, direction: "ltr", textAlign: "left" } as const;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Entrance delay={0} style={{ position: "absolute", top: 50, left: 60, right: 60 }}>
        <Card style={{ padding: "26px 30px" }}>
          <Kicker>الـ request بتاعك</Kicker>
          <div style={{ ...text, marginTop: 12 }}>
            Hi, I'm <span style={{ borderRadius: 8, boxShadow: ring(0) }}><Token real="Sarah Mitchell" tag="<PERSON_81ca33>" at={mask} /></span>. Email <span style={{ borderRadius: 8, boxShadow: ring(1) }}><Token real="sarah.m@acme.com" tag="<EMAIL_ADDRESS_d5c8b2>" at={mask + 5} /></span>. Key: <span style={{ borderRadius: 8, boxShadow: ring(2) }}><Token real="sk-proj-8fK2…V4nB" tag="<API_KEY_24529d>" at={mask + 10} /></span>
          </div>
        </Card>
      </Entrance>
      <div style={{ position: "absolute", top: 440, left: 90, right: 90, height: 170, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Entrance delay={4} config="bouncy"><Shield size={140} /></Entrance>
        <div style={{ position: "relative", flex: 1, height: 4, margin: "0 30px", background: `linear-gradient(270deg, ${theme.colors.primary}66, ${theme.colors.line})`, borderRadius: 2 }}>
          {[1 - up, down].map((p, i) => (
            <div key={i} style={{ position: "absolute", top: -12, left: `${p * 100}%`, width: 28, height: 28, borderRadius: 14, background: theme.colors.primary, boxShadow: `0 0 24px ${theme.colors.primary}`, opacity: i === 0 ? (up > 0 && up < 1 ? 1 : 0) : (down > 0 && down < 1 ? 1 : 0), transform: "translateX(-50%)" }} />
          ))}
          <div style={{ position: "absolute", top: 24, left: 0, right: 0, textAlign: "center" }}><Kicker>الـ placeholders بس اللي بتعدّي</Kicker></div>
        </div>
        <Entrance delay={8} config="bouncy"><Cloud size={200} /></Entrance>
      </div>
      <div style={{ position: "absolute", top: 680, left: 60, right: 60, opacity: replyIn, transform: `translateY(${interpolate(replyIn, [0, 1], [50, 0])}px)` }}>
        <Card style={{ padding: "26px 30px", borderColor: frame >= restore ? `${theme.colors.primary}88` : theme.colors.line }}>
          <Kicker>الـ response اللي بتشوفه</Kicker>
          <div style={{ ...text, marginTop: 12 }}>
            Done. Sent the deck to <Token real="sarah.m@acme.com" tag="<EMAIL_ADDRESS_d5c8b2>" at={-20} restoreAt={restore} /> for <Token real="Sarah Mitchell" tag="<PERSON_81ca33>" at={-20} restoreAt={restore + 5} />.
          </div>
        </Card>
      </div>
    </div>
  );
};
