import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, theme } from "./theme";
import { Card } from "./components";

const C = theme.colors;
const NEVER = 1e9;

export type Cue = { leak?: number; mask?: number; unmask?: number; ping?: number };

// One sensitive value: plain → flagged red (leaking) → flipped to an amber placeholder → flipped back.
export const Token: React.FC<{ real: string; placeholder: string; cue: Cue }> = ({ real, placeholder, cue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { leak = NEVER, mask = NEVER, unmask = NEVER, ping = NEVER } = cue;
  // a quick bump + flare when the voice names this value
  const bump = interpolate(frame, [ping, ping + 5, ping + 16], [0, 1, 0], clamp);
  const flag = spring({ frame: frame - leak, fps, config: theme.spring.snappy });
  const m = spring({ frame: frame - mask, fps, config: theme.spring.snappy });
  const u = spring({ frame: frame - unmask, fps, config: theme.spring.snappy });
  const masked = m - u; // 0 = real value showing, 1 = placeholder showing
  const showPh = masked > 0.5;
  const flip = Math.abs(masked - 0.5) * 2; // 1 at rest, 0 mid-flip
  const leakAmt = flag * (1 - m) * (1 - u);
  const restored = u;
  return (
    <span
      style={{
        display: "inline-block",
        margin: "0 4px",
        padding: "0 10px",
        borderRadius: 10,
        transform: `rotateX(${(1 - flip) * 90}deg) scale(${1 + 0.06 * leakAmt + 0.08 * bump})`,
        background: showPh ? `${C.hero}26` : `rgba(240,82,82,${0.22 * leakAmt})`,
        border: `2px solid ${showPh ? C.hero : `rgba(240,82,82,${0.9 * leakAmt})`}`,
        boxShadow: showPh ? `0 0 26px ${C.heroGlow}` : `0 0 ${30 * leakAmt + 50 * bump}px ${C.leakGlow}`,
        color: showPh ? C.hero : restored > 0.5 ? C.text : leakAmt > 0.3 ? "#FFD4D4" : C.text,
        fontFamily: showPh ? theme.fonts.mono : undefined,
        fontSize: showPh ? "1em" : undefined,
        textDecoration: restored > 0.5 && !showPh ? `underline 3px ${C.hero}` : undefined,
        textUnderlineOffset: 8,
      }}
    >
      {showPh ? placeholder : real}
    </span>
  );
};

export const MSG = [
  { real: "Sarah Mitchell", placeholder: "<PERSON_0>" },
  { real: "sarah.m@acme.com", placeholder: "<EMAIL_0>" },
  { real: "sk-proj-8fK2Lw9xQ7", placeholder: "<API_KEY_0>" },
];

// The client message used in the hook and the mask scene: English content, so the card is LTR.
export const MessageCard: React.FC<{ cues: [Cue, Cue, Cue]; label?: string; width?: number; style?: React.CSSProperties }> = ({ cues, label, width = 900, style }) => {
  const frame = useCurrentFrame();
  return (
    <Card style={{ width, padding: "34px 40px 40px", ...style }}>
      {label && <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, direction: "rtl" }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: C.hero, opacity: 0.6 + 0.4 * Math.sin(frame / 8) }} />
        <div style={{ fontFamily: theme.fonts.ar, fontWeight: 700, fontSize: 40, color: C.dim }}>{label}</div>
      </div>}
      <div style={{ direction: "ltr", fontFamily: "'Plex Sans', system-ui", fontWeight: 500, fontSize: 44, lineHeight: 1.75, color: C.text, perspective: 600 }}>
        Hi, I'm <Token {...MSG[0]} cue={cues[0]} /> from Acme. Email me at <Token {...MSG[1]} cue={cues[1]} />. Deploy key: <Token {...MSG[2]} cue={cues[2]} />
      </div>
    </Card>
  );
};

// A small chip that travels along a path between two points, for request/response packets.
export const Packet: React.FC<{ start: number; dur: number; from: [number, number]; to: [number, number]; color: string; label?: string; arc?: number }> = ({ start, dur, from, to, color, label, arc = -120 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: theme.ease.inOut });
  if (frame < start || frame > start + dur + 6) return null;
  const x = from[0] + (to[0] - from[0]) * t;
  const y = from[1] + (to[1] - from[1]) * t + arc * Math.sin(Math.PI * t);
  const o = interpolate(frame, [start, start + 4, start + dur, start + dur + 6], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", opacity: o, padding: label ? "8px 16px" : 0, width: label ? undefined : 26, height: label ? undefined : 26, borderRadius: 14, background: `${color}30`, border: `2px solid ${color}`, boxShadow: `0 0 24px ${color}88`, fontFamily: theme.fonts.mono, fontSize: 40, color, whiteSpace: "nowrap" }}>
      {label}
    </div>
  );
};
