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
import { Cam, DepthShot } from "./DepthShot";

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

// ── theme: night teal grade, one warm amber hero (the highlighted word only)
const t = {
  colors: {
    bg: "#05070A",
    hero: "#F0AE48",
    heroHot: "#FFE2B0",
    text: "#F2F3F5",
    shadow: "rgba(0,0,0,0.75)",
    grade: "#123A52",
    leak: "#FF9A3C",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    word: { damping: 16, stiffness: 120, mass: 0.8 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    hit: { damping: 9, stiffness: 180, mass: 0.6 },
  },
} as const;

// ── timing (seconds) — mirrored in scripts/gen-lyrics-track.mjs
const INTRO_S = 1.2;
const LINE_S = 4.2;
const OUTRO_S = 3.0;
const CUT_S = 0.5; // zoom-through overlap between shots

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

// one camera move per shot: from → to over the shot, eased
type Shot = {
  from: Cam;
  to: Cam;
  focus: number;
  dof: number;
  fog: number;
  rain: number;
  exposure: [number, number];
  shake?: number; // impact shake when the hero word lands
};
const SHOTS: Shot[] = [
  // 1 walking away: slow push down the alley
  { from: { x: -0.2, y: 0, zoom: 1, dolly: 0 }, to: { x: 0.3, y: -0.1, zoom: 1.06, dolly: 0.55 }, focus: 0.55, dof: 0.5, fog: 0.4, rain: 0.7, exposure: [0.9, 1] },
  // 2 blocked road: lateral orbit past the rubble
  { from: { x: -1, y: 0.1, zoom: 1.04, dolly: 0.2 }, to: { x: 1, y: -0.1, zoom: 1.08, dolly: 0.3 }, focus: 0.75, dof: 0.7, fog: 0.4, rain: 0.6, exposure: [1, 1] },
  // 3 pitch dark: dolly-zoom (vertigo), light drains away
  { from: { x: 0, y: 0, zoom: 1, dolly: 0.4 }, to: { x: 0, y: 0.1, zoom: 1.25, dolly: -0.3 }, focus: 0.5, dof: 0.4, fog: 0.55, rain: 0.4, exposure: [1, 0.6] },
  // 4 the gate refuses: crane up the bars, impact on "رافضة"
  { from: { x: 0.2, y: 1, zoom: 1.02, dolly: 0 }, to: { x: -0.2, y: -0.7, zoom: 1.1, dolly: 0.45 }, focus: 0.7, dof: 0.5, fog: 0.35, rain: 0.7, exposure: [0.95, 0.9], shake: 1 },
  // 5 crying close-up: slow drift, heavy bokeh, heavy rain
  { from: { x: 0.5, y: 0, zoom: 1, dolly: 0 }, to: { x: -0.3, y: 0.1, zoom: 1.12, dolly: 0.35 }, focus: 0.9, dof: 1.2, fog: 0.2, rain: 1, exposure: [0.95, 1] },
  // 6 talking to himself: orbit around the steps
  { from: { x: 0.9, y: -0.2, zoom: 1.05, dolly: 0.25 }, to: { x: -0.9, y: 0.1, zoom: 1.05, dolly: 0.35 }, focus: 0.65, dof: 0.6, fog: 0.35, rain: 0.8, exposure: [0.95, 0.95] },
  // 7 his reflection: tilt down into the puddle
  { from: { x: 0, y: -0.8, zoom: 1.02, dolly: 0.1 }, to: { x: 0.15, y: 0.8, zoom: 1.12, dolly: 0.5 }, focus: 0.8, dof: 0.8, fog: 0.3, rain: 0.7, exposure: [1, 0.95] },
  // 8 alone in the street: crane pull-back, fade to night
  { from: { x: 0, y: -0.4, zoom: 1.3, dolly: 0.6 }, to: { x: 0, y: 0.4, zoom: 1, dolly: -0.25 }, focus: 0.6, dof: 0.5, fog: 0.5, rain: 0.8, exposure: [1, 0.75] },
];

export const SOL_TOTAL_S = INTRO_S + LINE_S * LYRICS.length + OUTRO_S;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1080;
const H = 1920;
const pad = (i: number) => String(i + 1).padStart(2, "0");

// smooth deterministic noise for handheld drift
const noise = (x: number, seed: number) =>
  Math.sin(x * 1.3 + seed) * 0.5 + Math.sin(x * 2.9 + seed * 2.1) * 0.3 + Math.sin(x * 5.3 + seed * 3.7) * 0.2;

const mixCam = (a: Cam, b: Cam, p: number): Cam => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
  zoom: a.zoom + (b.zoom - a.zoom) * p,
  dolly: a.dolly + (b.dolly - a.dolly) * p,
});

// Layers 1–2 — one shot: depth camera move, zoom-through in and out
const ShotLayer: React.FC<{ index: number; dur: number; cutF: number; last: boolean }> = ({
  index,
  dur,
  cutF,
  last,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shot = SHOTS[index];
  const p = interpolate(frame, [0, dur], [0, 1], { ...clamp, easing: t.ease.inOut });
  const cam = mixCam(shot.from, shot.to, p);

  // zoom-through: punch into the scene at the end, settle out of a push at the start
  const outP = last ? 0 : interpolate(frame, [dur - cutF, dur], [0, 1], { ...clamp, easing: t.ease.in });
  const inP = index === 0 ? 1 : interpolate(frame, [0, cutF * 1.6], [0, 1], { ...clamp, easing: t.ease.out });
  cam.dolly += outP * 0.5 - (1 - inP) * 0.3;
  cam.zoom *= 1 + outP * 0.35 + (1 - inP) * 0.14;

  // handheld drift + impact shake on the hero word
  const s = frame / fps;
  const hitAt = cutF + Math.round(fps * 0.16) * LYRICS[index].hero + 4;
  const shake = shot.shake && frame >= hitAt ? Math.exp(-(frame - hitAt) / 5) * shot.shake : 0;
  cam.x += noise(s * 0.6, index) * 0.08 + Math.sin(frame * 2.1) * shake * 0.35;
  cam.y += noise(s * 0.5, index + 9) * 0.06 + Math.cos(frame * 2.7) * shake * 0.3;

  const exposure = interpolate(p, [0, 1], shot.exposure) * (1 + shake * 0.25);
  const opacity = index === 0 ? 1 : interpolate(frame, [0, cutF], [0, 1], { ...clamp, easing: t.ease.out });
  const blur = (1 - inP) * 14 + outP * 10;

  return (
    <AbsoluteFill style={{ opacity, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      <DepthShot
        src={staticFile(`lyrics/shot-${pad(index)}.png`)}
        depth={staticFile(`lyrics/shot-${pad(index)}-depth.png`)}
        cam={cam}
        time={s}
        focus={shot.focus}
        dof={shot.dof}
        fog={shot.fog}
        rain={shot.rain}
        exposure={exposure}
        width={W}
        height={H}
      />
    </AbsoluteFill>
  );
};

// Layer 3 — amber light leak sweeping across each cut
const LightLeak: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, dur], [0, 1], { ...clamp, easing: t.ease.inOut });
  const o = interpolate(frame, [0, dur * 0.4, dur], [0, 0.55, 0], { ...clamp, easing: t.ease.out });
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: o,
        background: `radial-gradient(ellipse 60% 45% at ${110 - p * 120}% ${30 + p * 30}%, ${t.colors.leak}, transparent 70%)`,
      }}
    />
  );
};

// Layer 3 — one lyric line: words tilt up out of depth, hero word catches light
const LyricLine: React.FC<{ line: Line; dur: number; index: number }> = ({ line, dur, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const last = index === LYRICS.length - 1;
  const size = last ? 150 : 116;
  const stagger = Math.round(fps * 0.16);
  const exitF = Math.round(fps * 0.3);
  const exitStart = dur - exitF - stagger;
  const drift = interpolate(frame, [0, dur], [0, -22], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 1170, perspective: 900 }}>
      <div
        style={{
          direction: "rtl",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 26,
          rowGap: 0,
          maxWidth: 960,
          fontFamily: cairo,
          fontSize: size,
          lineHeight: 1.35,
          transform: `translateY(${drift}px)`,
        }}
      >
        {line.words.map((w, i) => {
          const s = spring({ frame: frame - i * stagger, fps, config: t.spring.word });
          const ex = last
            ? 0
            : interpolate(frame, [exitStart + i * 2, exitStart + i * 2 + exitF], [0, 1], { ...clamp, easing: t.ease.in });
          const isHero = i === line.hero;
          const land = spring({ frame: frame - i * stagger - 3, fps, config: t.spring.hit });
          // light sweep across the hero word once it lands
          const sweep = interpolate(frame, [i * stagger + 8, i * stagger + 8 + fps * 0.9], [-60, 160], {
            ...clamp,
            easing: t.ease.inOut,
          });
          const breathe = isHero ? 1 + Math.sin(frame / 16) * 0.015 : 1;
          const rowBreak =
            i === line.br ? <div key={`br${i}`} style={{ flexBasis: "100%", height: 0 }} /> : null;
          return [
            rowBreak,
            <span
              key={i}
              style={{
                display: "inline-block",
                fontWeight: isHero ? 900 : 700,
                opacity: s * (1 - ex),
                transformOrigin: "50% 100%",
                transform: [
                  `translateY(${(1 - s) * 70 - ex * 50}px)`,
                  `rotateX(${(1 - s) * -75 + ex * 40}deg)`,
                  `scale(${(isHero ? 1 + (1 - land) * 0.25 : 0.94 + s * 0.06) * breathe})`,
                ].join(" "),
                filter: `blur(${(1 - s) * 12 + ex * 10}px) drop-shadow(0 6px 24px ${t.colors.shadow})`,
                ...(isHero
                  ? {
                      color: "transparent",
                      backgroundImage: `linear-gradient(100deg, ${t.colors.hero} ${sweep - 30}%, ${t.colors.heroHot} ${sweep}%, ${t.colors.hero} ${sweep + 30}%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      // room for the dots under ي so the clipped gradient covers them
                      padding: "0 10px 30px",
                      margin: "0 -10px -30px",
                    }
                  : { color: t.colors.text }),
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

// Layer 4 — grade: teal soft-light, bottom scrim for the lyrics, fades
const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, fps * 0.9], [1, 0], { ...clamp, easing: t.ease.out });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 1.4, durationInFrames], [0, 1], {
    ...clamp,
    easing: t.ease.in,
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundColor: t.colors.grade, mixBlendMode: "soft-light", opacity: 0.35 }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 52%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(fadeIn, fadeOut) }} />
    </AbsoluteFill>
  );
};

// Layer 5 — grain + vignette
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const n = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundImage: n,
          backgroundSize: "220px",
          backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
          opacity: 0.09,
          mixBlendMode: "overlay",
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
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
  const cutF = Math.round(fps * CUT_S);
  const lineStart = (i: number) => introF + i * lineF;
  return (
    <AbsoluteFill style={{ background: t.colors.bg }}>
      <Audio src={staticFile("sfx/lyrics-bed.wav")} volume={0.8} />
      {SHOTS.map((_, i) => {
        const last = i === SHOTS.length - 1;
        const from = i === 0 ? 0 : lineStart(i) - cutF;
        const end = last ? lineStart(i) + lineF + outroF : lineStart(i + 1);
        return (
          <Sequence key={i} from={from} durationInFrames={end - from}>
            <ShotLayer index={i} dur={end - from} cutF={cutF} last={last} />
          </Sequence>
        );
      })}
      {SHOTS.slice(1).map((_, i) => (
        <Sequence key={i} from={lineStart(i + 1) - cutF} durationInFrames={cutF * 2}>
          <LightLeak dur={cutF * 2} />
        </Sequence>
      ))}
      <Grade />
      {LYRICS.map((line, i) => (
        <Sequence key={i} from={lineStart(i)} durationInFrames={i === LYRICS.length - 1 ? lineF + outroF : lineF}>
          <LyricLine line={line} dur={lineF} index={i} />
        </Sequence>
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
