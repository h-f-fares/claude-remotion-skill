import React from "react";
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Cairo (OFL) bundled locally so renders work offline
const cairo = "Cairo";
const fontHandle = delayRender("Loading Cairo");
const cairoFace = new FontFace(cairo, `url(${staticFile("fonts/Cairo-Arabic.woff2")}) format("woff2")`, {
  weight: "600 900",
});
cairoFace
  .load()
  .then(() => {
    document.fonts.add(cairoFace);
    continueRender(fontHandle);
  })
  .catch((err) => cancelRender(err));

// ── theme: night blue base, one warm amber hero (the highlighted word only)
const t = {
  colors: {
    bg: "#06070B",
    sky: "#10141F",
    road: "#0B0D13",
    fog: "#5A6B86",
    line: "#8A97AD",
    hero: "#E8A33D",
    text: "#EEF0F4",
    textDim: "#9AA3B2",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    word: { damping: 18, stiffness: 110, mass: 0.8 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
  },
} as const;

// ── timing (seconds) — mirrored in scripts/gen-lyrics-track.mjs
const INTRO_S = 1.2;
const LINE_S = 4.2;
const OUTRO_S = 3.0;

// br: index of the first word on the second row (balanced, no orphan words)
type Line = { words: string[]; hero: number; br?: number };
const LYRICS: Line[] = [
  { words: ["وحدي", "بمشي", "في", "كل", "سكة"], hero: 0, br: 2 },
  { words: ["والسكك", "ما", "بقتش", "سالكة"], hero: 3, br: 3 },
  { words: ["جوه", "منها", "الضلمة", "حالكة"], hero: 2, br: 2 },
  { words: ["رافضة،", "مش", "قابلة", "بوصولي"], hero: 0, br: 1 },
  { words: ["وحدي", "ببكي،", "ببكي", "جدًا"], hero: 3, br: 2 },
  { words: ["بحكي", "ليا،", "وبأن"], hero: 2 },
  { words: ["وأما", "بسمع", "نفسي،", "وافهم", "الوجع"], hero: 4, br: 3 },
  { words: ["بصعب", "عليا"], hero: 1 },
];

export const SOL_TOTAL_S = INTRO_S + LINE_S * LYRICS.length + OUTRO_S;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1080;
const H = 1920;
const HORIZON = 900;
const VX = W / 2;

// deterministic pseudo-random
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const useLineIndex = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame / fps - INTRO_S) / LINE_S; // fractional line position
};

// Layer 1 — sky gradient with drifting fog banks (never flat)
const Sky: React.FC = () => {
  const frame = useCurrentFrame();
  const d = Math.sin(frame / 80) * 60;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${t.colors.bg} 0%, ${t.colors.sky} 42%, ${t.colors.bg} 47%)`,
      }}
    >
      {[0, 1].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            width: 1500,
            height: 420,
            left: -210 + (k ? -d : d),
            top: HORIZON - 260 + k * 90,
            borderRadius: "50%",
            filter: "blur(70px)",
            background: `radial-gradient(ellipse, ${t.colors.fog}${k ? "33" : "44"}, transparent 65%)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Layer 2 — the road: converging edges, dashes rushing toward camera
const Road: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const li = useLineIndex();
  // line 2 ("not passable"): the centre dashes flicker and break
  const broken = li >= 1 && li < 2;
  // line 8: walking stops — road slows to a halt
  const speed = interpolate(li, [6.8, 7.4], [1, 0], { ...clamp, easing: t.ease.inOut });
  const travel = (frame / fps) * 0.35 * (li < 7 ? 1 : 0.5 + 0.5 * speed);
  const dashes = Array.from({ length: 14 }, (_, i) => {
    const z = ((i / 14 + travel) % 1) ** 2.2; // 0 = horizon, 1 = camera
    const y = HORIZON + z * (H - HORIZON);
    const h = 8 + z * 150;
    const w = 2 + z * 22;
    const flick = broken && rand(i + Math.floor(frame / 3)) > 0.55 ? 0.08 : 1;
    return { y, h, w, o: Math.min(1, z * 3) * 0.55 * flick, i };
  });
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="roadfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={t.colors.line} stopOpacity="0.05" />
            <stop offset="1" stopColor={t.colors.line} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <polygon
          points={`${VX - 6},${HORIZON} ${VX + 6},${HORIZON} ${W + 520},${H} ${-520},${H}`}
          fill={t.colors.road}
        />
        <line x1={VX - 6} y1={HORIZON} x2={-520} y2={H} stroke="url(#roadfade)" strokeWidth={4} />
        <line x1={VX + 6} y1={HORIZON} x2={W + 520} y2={H} stroke="url(#roadfade)" strokeWidth={4} />
        {dashes.map((d) => (
          <rect
            key={d.i}
            x={VX - d.w / 2}
            y={d.y}
            width={d.w}
            height={d.h}
            fill={t.colors.line}
            opacity={d.o}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// Layer 2 — barrier that slams down far ahead on "رافضة" (line 4)
const Barrier: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = Math.round((INTRO_S + LINE_S * 3) * fps);
  const end = Math.round((INTRO_S + LINE_S * 4) * fps);
  const drop = spring({ frame: frame - start - 4, fps, config: { damping: 9, stiffness: 160 } });
  const exit = interpolate(frame, [end - 10, end], [1, 0], { ...clamp, easing: t.ease.in });
  if (frame < start || frame > end) return null;
  const y = interpolate(drop, [0, 1], [HORIZON - 240, HORIZON - 34]);
  return (
    <div
      style={{
        position: "absolute",
        left: VX - 150,
        top: y,
        width: 300,
        height: 34,
        opacity: Math.min(1, drop * 2) * exit * 0.85,
        background: `repeating-linear-gradient(-45deg, ${t.colors.line} 0 22px, ${t.colors.road} 22px 44px)`,
        boxShadow: `0 0 40px ${t.colors.fog}55`,
        transform: `scaleX(${interpolate(drop, [0, 1], [0.6, 1])})`,
      }}
    />
  );
};

// Layer 2 — lone walking figure, drawn in SVG
const Figure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const li = useLineIndex();
  const appear = spring({ frame: frame - 6, fps, config: t.spring.smooth });
  const walking = interpolate(li, [6.8, 7.4], [1, 0], { ...clamp, easing: t.ease.inOut });
  const phase = (frame / fps) * Math.PI * 2 * 0.9;
  const bob = Math.abs(Math.sin(phase)) * 6 * walking;
  const leg = Math.sin(phase) * 14 * walking;
  // line 5–6 (crying): head bows
  const bow = interpolate(li, [4, 4.3, 5.8, 6.1], [0, 1, 1, 0], { ...clamp, easing: t.ease.inOut });
  // last line: the figure sinks to a crouch
  const sink = interpolate(li, [7.1, 7.6], [0, 1], { ...clamp, easing: t.ease.inOut });
  const breathe = Math.sin(frame / 22) * 1.5;
  return (
    <div
      style={{
        position: "absolute",
        left: VX - 60,
        top: 1240 - bob + sink * 40 + breathe,
        opacity: appear,
        transform: `scale(${interpolate(appear, [0, 1], [0.85, 1])})`,
        transformOrigin: "50% 100%",
      }}
    >
      <svg width={120} height={260} viewBox="0 0 120 260">
        <g fill="#020306">
          <ellipse cx={60} cy={30 + bow * 10 + sink * 20} rx={17} ry={19} />
          <path
            d={`M38 ${58 + sink * 22} Q60 ${46 + sink * 22} 82 ${58 + sink * 22} L88 ${150 + sink * 10} L32 ${150 + sink * 10} Z`}
          />
          <rect x={44} y={146} width={13} height={100 - sink * 30} rx={6} transform={`rotate(${leg} 50 150)`} />
          <rect x={63} y={146} width={13} height={100 - sink * 30} rx={6} transform={`rotate(${-leg} 70 150)`} />
        </g>
      </svg>
      {/* rim light from the fog behind */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          zIndex: -1,
          filter: "blur(30px)",
          background: `radial-gradient(ellipse at 50% 30%, ${t.colors.fog}55, transparent 60%)`,
        }}
      />
    </div>
  );
};

// Layer 2 — echo rings from the figure on "بحكي ليا" / "بسمع نفسي" (lines 6–7)
const Echo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const li = useLineIndex();
  const on = interpolate(li, [5, 5.15, 6.85, 7], [0, 1, 1, 0], clamp);
  if (on <= 0) return null;
  const period = 1.4 * fps;
  return (
    <>
      {[0, 1, 2].map((k) => {
        const p = ((frame + k * (period / 3)) % period) / period;
        const e = t.ease.out(p);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: VX - 40 - e * 260,
              top: 1290 - 40 - e * 260,
              width: 80 + e * 520,
              height: 80 + e * 520,
              borderRadius: "50%",
              border: `2px solid ${t.colors.line}`,
              opacity: (1 - p) * 0.35 * on,
            }}
          />
        );
      })}
    </>
  );
};

// Layer 2 — rain streaks, heavier while crying (lines 5–6)
const Rain: React.FC = () => {
  const frame = useCurrentFrame();
  const li = useLineIndex();
  const heavy = interpolate(li, [3.8, 4.2, 5.8, 6.3], [0, 1, 1, 0], { ...clamp, easing: t.ease.inOut });
  const count = Math.round(70 + heavy * 90);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const speed = 38 + rand(i) * 26;
        const len = 40 + rand(i + 9) * 70;
        const x = rand(i + 3) * (W + 200) - 100;
        const y = ((rand(i + 5) * H + frame * speed) % (H + 200)) - 200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - (y / H) * 60,
              top: y,
              width: 2,
              height: len,
              transform: "rotate(10deg)",
              background: `linear-gradient(180deg, transparent, ${t.colors.textDim})`,
              opacity: 0.12 + rand(i + 11) * 0.18,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Layer 3 — one lyric line: words rise in right-to-left, hero word glows
const LyricLine: React.FC<{ line: Line; dur: number; index: number }> = ({ line, dur, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const last = index === LYRICS.length - 1;
  const size = last ? 150 : 118;
  const exitF = Math.round(fps * 0.35);
  const exit = last
    ? 0
    : interpolate(frame, [dur - exitF, dur], [0, 1], { ...clamp, easing: t.ease.in });
  const stagger = Math.round(fps * 0.16);
  const drift = interpolate(frame, [0, dur], [0, -18], clamp); // slow rise while held
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 470 }}>
      <div
        style={{
          direction: "rtl",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 26,
          rowGap: 4,
          maxWidth: 960,
          fontFamily: cairo,
          fontSize: size,
          lineHeight: 1.35,
          transform: `translateY(${drift - exit * 30}px)`,
          opacity: 1 - exit,
          filter: `blur(${exit * 8}px)`,
        }}
      >
        {line.words.map((w, i) => {
          const rowBreak = i === line.br ? <div key={`br${i}`} style={{ flexBasis: "100%", height: 0 }} /> : null;
          const s = spring({ frame: frame - i * stagger, fps, config: t.spring.word });
          const isHero = i === line.hero;
          const heroLand = spring({
            frame: frame - i * stagger - Math.round(fps * 0.2),
            fps,
            config: t.spring.smooth,
          });
          const breathe = isHero ? 1 + Math.sin(frame / 18) * 0.012 : 1;
          return [
            rowBreak,
            <span
              key={i}
              style={{
                display: "inline-block",
                fontWeight: isHero ? 900 : 600,
                color: isHero ? t.colors.hero : t.colors.text,
                opacity: s,
                transform: `translateY(${(1 - s) * 50}px) scale(${(0.92 + s * 0.08) * breathe})`,
                filter: `blur(${(1 - s) * 10}px)`,
                textShadow: isHero
                  ? `0 0 ${50 * heroLand}px ${t.colors.hero}66, 0 0 ${110 * heroLand}px ${t.colors.hero}33`
                  : "0 4px 30px rgba(0,0,0,0.6)",
              }}
            >
              {w}
            </span>,
          ];
        })}
      </div>
    </AbsoluteFill>
  );
};

// Layer 4 — darkness closing in as the song goes on, plus cold grade
const Darkness: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const li = useLineIndex();
  // the "pitch dark" line (3) tightens hard, then it never fully recovers
  const close = interpolate(li, [0, 2, 2.3, 3, 7, 7.8], [0, 0.25, 0.7, 0.5, 0.65, 0.85], {
    ...clamp,
    easing: t.ease.inOut,
  });
  const inner = 70 - close * 45;
  const fadeIn = interpolate(frame, [0, fps * 0.8], [1, 0], { ...clamp, easing: t.ease.out });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 1.2, durationInFrames], [0, 1], {
    ...clamp,
    easing: t.ease.in,
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundColor: "#1C3A66", mixBlendMode: "soft-light", opacity: 0.22 }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 70% at 50% 45%, transparent ${inner}%, rgba(0,0,0,${0.55 + close * 0.4}) 100%)`,
        }}
      />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(fadeIn, fadeOut) }} />
    </AbsoluteFill>
  );
};

// Layer 5 — grain + vignette
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundImage: noise,
          backgroundSize: "220px",
          backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
          opacity: 0.08,
          mixBlendMode: "overlay",
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </>
  );
};

export const SolitudeLyrics: React.FC = () => {
  const { fps } = useVideoConfig();
  const introF = Math.round(fps * INTRO_S);
  const lineF = Math.round(fps * LINE_S);
  const outroF = Math.round(fps * OUTRO_S);
  return (
    <AbsoluteFill style={{ background: t.colors.bg }}>
      <Audio src={staticFile("sfx/lyrics-bed.wav")} volume={0.8} />
      <Sky />
      <Road />
      <Barrier />
      <Echo />
      <Figure />
      <Rain />
      {LYRICS.map((line, i) => (
        <Sequence
          key={i}
          from={introF + i * lineF}
          durationInFrames={i === LYRICS.length - 1 ? lineF + outroF : lineF}
        >
          <LyricLine line={line} dur={lineF} index={i} />
        </Sequence>
      ))}
      <Darkness />
      <Grain />
    </AbsoluteFill>
  );
};
