import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Cam, DepthShot, FgMove } from "./DepthShot";
import { cairo, clamp, Grain, mixCam, noise, pad, t } from "./SolitudeLyrics";
// depth + anchor of the man in each shot, written by scripts/gen-depth.py
import layers from "../../public/lyrics/layers.json";

// ── timing (seconds): the chorus of Cairokee – "Wahdy", 9:16 Short.
// public/lyrics/wahdy-chorus.mp3 is the song from CLIP_START for exactly 32 beats
// (8 bars), and the chorus repeats right after it, so the video loops seamlessly.
// Word times are song seconds (ElevenLabs Scribe); the beat grid is a fit to librosa.
const CLIP_START = 93.25;
const BEAT = 0.52609;
const BEAT0 = 92.4206; // a beat; every 4th from 93.47 is a downbeat (a new line)
export const WAHDY_TOTAL_S = 32 * BEAT;

const HOOK = "لما تكون لوحدك في كل حاجة 🥀";
const CREDIT = "🎵 كايروكي – وحدي";

type Fx = "tremble" | "glow" | "gold";
type Word = { w: string; at: number; fx?: Fx };
// br: index of the first word on the second row
type Line = { words: Word[]; br?: number };
const LINES: Line[] = [
  { words: [{ w: "وحدي", at: 93.42 }, { w: "خايف", at: 93.94, fx: "tremble" }] },
  { words: [{ w: "وحدي", at: 95.52 }, { w: "عارف", at: 96.02, fx: "glow" }] },
  {
    words: [{ w: "إن", at: 97.72 }, { w: "أنا", at: 98.14 }, { w: "هفضل", at: 99.44 }, { w: "بطولي", at: 100.0, fx: "glow" }],
    br: 2,
  },
  { words: [{ w: "وحدي", at: 101.82 }, { w: "خايف", at: 102.36, fx: "tremble" }] },
  { words: [{ w: "وحدي", at: 103.94 }, { w: "عارف", at: 104.46, fx: "glow" }] },
  {
    words: [{ w: "هو", at: 106.02 }, { w: "ده", at: 106.6 }, { w: "دور", at: 107.88 }, { w: "البطولة", at: 108.3, fx: "gold" }],
    br: 3,
  },
];
const clipS = (songS: number) => songS - CLIP_START;
// hard cut on the first sung word of each line; the last line clears before the loop
const lineStartS = (i: number) => (i === 0 ? 0 : clipS(LINES[i].words[0].at) - 0.04);
const lineEndS = (i: number) => (i + 1 < LINES.length ? lineStartS(i + 1) : WAHDY_TOTAL_S);

// beats in the clip; downbeats open each line
const BEATS = Array.from({ length: 40 }, (_, n) => BEAT0 + n * BEAT - CLIP_START).filter(
  (b) => b >= -0.01 && b < WAHDY_TOTAL_S,
);
const isDownbeat = (b: number) => Math.round((b + CLIP_START - BEAT0) / BEAT) % 4 === 2;
// decaying pulse after the latest beat (downbeats only when strong)
const pulse = (s: number, downbeatsOnly = false, decay = 0.13) => {
  let last = -1;
  for (const b of BEATS) if (b <= s && (!downbeatsOnly || isDownbeat(b))) last = b;
  return last < 0 ? 0 : Math.exp(-(s - last) / decay);
};
const HITS = LINES.flatMap((l) => l.words.filter((w) => w.fx).map((w) => clipS(w.at)));

// ── shots: one per line, gentle camera moves, the man animated on his own layer
type Anim = "fear" | "breathe" | "sway" | "hands" | "walk" | "hero";
type Shot = { from: Cam; to: Cam; anim: Anim; dof: number; fog: number; rain: number; exposure: number };
const SHOTS: Shot[] = [
  // 1 afraid close-up: drift across his face, he trembles on "خايف"
  { from: { x: 0.2, y: 0, zoom: 1.04, dolly: 0 }, to: { x: -0.2, y: 0.05, zoom: 1.1, dolly: 0.2 }, anim: "fear", dof: 1, fog: 0.2, rain: 0.8, exposure: 1 },
  // 2 he knows: slow arc, he edges closer
  { from: { x: -0.4, y: 0, zoom: 1.02, dolly: 0.1 }, to: { x: 0.4, y: -0.05, zoom: 1.06, dolly: 0.3 }, anim: "breathe", dof: 0.7, fog: 0.35, rain: 0.7, exposure: 1 },
  // 3 alone forever: pull back over the city
  { from: { x: 0, y: 0.3, zoom: 1.12, dolly: 0.3 }, to: { x: 0, y: -0.2, zoom: 1, dolly: -0.1 }, anim: "sway", dof: 0.5, fog: 0.45, rain: 0.7, exposure: 1 },
  // 4 rain in his hands: slow push
  { from: { x: 0.2, y: -0.1, zoom: 1.03, dolly: 0 }, to: { x: -0.2, y: 0.1, zoom: 1.08, dolly: 0.25 }, anim: "hands", dof: 0.9, fog: 0.3, rain: 1, exposure: 1 },
  // 5 he walks toward us, steps on the beat
  { from: { x: 0, y: 0, zoom: 1, dolly: -0.1 }, to: { x: 0, y: 0, zoom: 1.04, dolly: 0.2 }, anim: "walk", dof: 0.6, fog: 0.4, rain: 0.8, exposure: 1 },
  // 6 the hero: crane up from the ground
  { from: { x: 0, y: 0.4, zoom: 1.12, dolly: 0.4 }, to: { x: 0, y: -0.3, zoom: 1, dolly: -0.1 }, anim: "hero", dof: 0.5, fog: 0.4, rain: 0.9, exposure: 1.05 },
];

// the man's own motion, s = seconds into the shot, p = shot progress
const animate = (anim: Anim, anchor: [number, number], s: number, p: number, songS: number): FgMove => {
  const breath = Math.sin((s / 3.4) * Math.PI * 2);
  const m: FgMove = { anchor, scale: [1 + breath * 0.003, 1 + breath * 0.007], shift: [0, 0], rot: 0 };
  if (anim === "fear") {
    // shiver once "خايف" is sung
    const k = interpolate(songS, [93.94, 94.1], [0, 1], clamp);
    m.shift = [noise(s * 9, 1) * 0.0025 * k, noise(s * 8, 4) * 0.0015 * k];
    m.rot = Math.sin(s * 0.8) * 0.006;
  } else if (anim === "breathe") {
    const g = 1 + p * 0.03;
    m.scale = [m.scale[0] * g, m.scale[1] * g];
  } else if (anim === "sway") {
    m.rot = Math.sin(s * 1.1) * 0.01;
  } else if (anim === "hands") {
    m.shift = [0, Math.sin(s * 1.6) * -0.003];
  } else if (anim === "walk") {
    // a step on every beat: bob, rock, and grow as he comes closer
    const step = Math.abs(Math.sin((Math.PI * (songS - BEAT0)) / BEAT));
    const g = 1 + p * 0.12;
    m.scale = [m.scale[0] * g, m.scale[1] * g];
    m.shift = [0, -step * 0.006];
    m.rot = Math.sin((Math.PI * (songS - BEAT0)) / BEAT) * 0.007;
  } else if (anim === "hero") {
    const g = 1 + p * 0.04;
    m.scale = [m.scale[0] * g, (m.scale[1] + breath * 0.004) * g];
  }
  return m;
};

const ShotLayer: React.FC<{ index: number; dur: number; startS: number }> = ({ index, dur, startS }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const shot = SHOTS[index];
  const key = `chorus-${pad(index)}` as keyof typeof layers;
  const layer = layers[key] as { fg: number; anchor?: number[] };
  const s = frame / fps;
  const songS = CLIP_START + startS + s;
  const p = interpolate(frame, [0, dur], [0, 1], { ...clamp, easing: t.ease.inOut });
  const cam = mixCam(shot.from, shot.to, p);
  // punch-in on the cut, then settle
  const punch = index === 0 ? 0 : interpolate(frame, [0, 9], [1, 0], { ...clamp, easing: t.ease.out });
  cam.zoom *= 1 + punch * 0.07;
  // handheld drift; a short shake when a hero word lands
  const hit = HITS.reduce((acc, h) => (h <= startS + s ? h : acc), -9);
  const shake = Math.exp(-(startS + s - hit) / 0.12) * (hit > startS - 0.01 ? 1 : 0);
  cam.x += noise(s * 0.6, index) * 0.04 + Math.sin(frame * 2.1) * shake * 0.12;
  cam.y += noise(s * 0.5, index + 9) * 0.03 + Math.cos(frame * 2.7) * shake * 0.1;
  const anchor = (layer.anchor ?? [0.5, 1]) as [number, number];
  return (
    <AbsoluteFill>
      <DepthShot
        src={staticFile(`lyrics/${key}-plate.png`)}
        depth={staticFile(`lyrics/${key}-depth.png`)}
        fg={staticFile(`lyrics/${key}-fg.png`)}
        fgDepth={layer.fg}
        fgMove={animate(shot.anim, anchor, s, p, songS)}
        cam={cam}
        time={startS + s}
        focus={layer.fg}
        dof={shot.dof}
        fog={shot.fog}
        rain={shot.rain}
        exposure={shot.exposure * (1 + pulse(startS + s) * 0.06)}
        width={width}
        height={height}
      />
    </AbsoluteFill>
  );
};

// ── graphics: embers, a light streak on each downbeat, rings on hero words
const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};
const Embers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = frame / fps;
  const glow = 1 + pulse(s) * 1.2;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      {Array.from({ length: 46 }, (_, i) => {
        const speed = 40 + hash(i + 3) * 90; // px per second, upward
        const y = (((hash(i + 1) * height - s * speed) % height) + height) % height;
        const x = hash(i + 2) * width + Math.sin(s * (0.4 + hash(i + 5)) + i) * 26;
        const r = 1.5 + hash(i + 4) * 3.5;
        const o = (0.25 + 0.5 * hash(i + 6)) * (0.6 + 0.4 * Math.sin(s * 3 + i)) * glow;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: t.colors.heroHot,
              boxShadow: `0 0 ${r * 5}px ${t.colors.leak}`,
              opacity: Math.min(o, 1),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const TEXT_Y = 1050; // centre of the lyrics, inside the TikTok/Shorts safe area

const Streak: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = pulse(frame / fps, true, 0.35);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: TEXT_Y - 2,
        height: 4,
        transform: `scaleX(${0.2 + (1 - k) * 0.8 + k * 0.6})`,
        opacity: k * 0.9,
        background: `linear-gradient(90deg, transparent, ${t.colors.leak} 30%, #FFF4DE 50%, ${t.colors.leak} 70%, transparent)`,
        boxShadow: `0 0 40px 10px ${t.colors.leak}`,
        mixBlendMode: "screen",
      }}
    />
  );
};

const Rings: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {HITS.map((h, i) => {
        const a = s - h;
        if (a < 0 || a > 0.9) return null;
        const q = t.ease.out(a / 0.9);
        const r = 120 + q * 620;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 - r,
              top: TEXT_Y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `3px solid ${t.colors.hero}`,
              boxShadow: `0 0 30px ${t.colors.leak}`,
              opacity: (1 - q) * 0.7,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── kinetic lyrics: each word crashes in when sung, the sung word is highlighted
const LyricLine: React.FC<{ line: Line; index: number; dur: number }> = ({ line, index, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startS = lineStartS(index);
  const s = startS + frame / fps;
  const big = line.words.length <= 2;
  const exit = interpolate(frame, [dur - 7, dur - 1], [0, 1], { ...clamp, easing: t.ease.in });
  const activeIdx = line.words.reduce((acc, w, i) => (clipS(w.at) - 0.03 <= s ? i : acc), -1);
  // the whole line kicks when a word lands
  const lastLand = activeIdx >= 0 ? clipS(line.words[activeIdx].at) : -9;
  const kick = Math.exp(-(s - lastLand) / 0.1);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: TEXT_Y,
          left: 60,
          right: 60,
          transform: `translateY(-50%) translate(${Math.sin(frame * 3.1) * kick * 6}px, ${kick * 5 - exit * 60}px) scale(${1 - exit * 0.1})`,
          opacity: 1 - exit,
          filter: exit > 0 ? `blur(${exit * 14}px)` : undefined,
          direction: "rtl",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: 30,
          rowGap: 0,
          fontFamily: cairo,
          lineHeight: 1.3,
        }}
      >
        {line.words.map((wd, i) => {
          const f = Math.round((clipS(wd.at) - startS - 0.03) * fps);
          const land = spring({ frame: frame - f, fps, config: { damping: 14, stiffness: 260, mass: 0.6 } });
          const active = i === activeIdx;
          const sung = i <= activeIdx;
          const size = wd.fx === "gold" ? 210 : big ? 196 : 128;
          const hot = active || (wd.fx && sung);
          const tremble = wd.fx === "tremble" && sung ? 1 : 0;
          const jx = tremble * noise(frame * 0.9, i + index * 7) * 5;
          const jy = tremble * noise(frame * 0.8, i + index * 7 + 3) * 4;
          const sweep = interpolate(frame - f, [4, 4 + fps], [-60, 160], clamp);
          const rowBreak = i === line.br ? <div key={`br${i}`} style={{ flexBasis: "100%", height: 0 }} /> : null;
          const shadow = `0 8px 30px ${t.colors.shadow}`;
          return [
            rowBreak,
            <span
              key={i}
              style={{
                display: "inline-block",
                fontSize: size,
                fontWeight: hot ? 900 : 800,
                opacity: land > 0.01 ? Math.min(1, land * 1.4) : 0,
                transform: `translate(${jx}px, ${jy}px) scale(${1 + (1 - land) * 1.1})`,
                filter: `blur(${(1 - land) * 16}px)`,
                ...(wd.fx === "gold" && sung
                  ? {
                      color: "transparent",
                      backgroundImage: `linear-gradient(100deg, ${t.colors.hero} ${sweep - 30}%, #FFF4DE ${sweep}%, ${t.colors.hero} ${sweep + 30}%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      padding: "0 14px 40px",
                      margin: "0 -14px -40px",
                      textShadow: "none",
                    }
                  : {
                      color: hot ? t.colors.hero : t.colors.text,
                      // fear: a red/cyan split; knowing: a warm glow
                      textShadow:
                        wd.fx === "tremble" && sung
                          ? `${3 + jx * 0.6}px 0 rgba(255,60,60,0.65), ${-3 - jx * 0.6}px 0 rgba(60,220,255,0.55), ${shadow}`
                          : wd.fx === "glow" && sung
                            ? `0 0 ${24 + kick * 30}px rgba(255,154,60,0.75), ${shadow}`
                            : shadow,
                    }),
              }}
            >
              {wd.w}
            </span>,
          ];
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── hook + credit stay up the whole time, so the loop never shows a seam
const Hook: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        top: 250,
        direction: "rtl",
        fontFamily: `${cairo}, "Noto Color Emoji"`,
        fontWeight: 800,
        fontSize: 64,
        color: "#FFFFFF",
        textAlign: "center",
        padding: "10px 34px 18px",
        borderRadius: 26,
        background: "rgba(0,0,0,0.38)",
        textShadow: "0 3px 14px rgba(0,0,0,0.8)",
      }}
    >
      {HOOK}
    </div>
    <div
      style={{
        position: "absolute",
        top: 380,
        direction: "rtl",
        fontFamily: `${cairo}, "Noto Color Emoji"`,
        fontWeight: 700,
        fontSize: 34,
        color: "rgba(255,255,255,0.78)",
        textShadow: "0 2px 10px rgba(0,0,0,0.8)",
      }}
    >
      {CREDIT}
    </div>
  </AbsoluteFill>
);

const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // flash on each cut (not on frame 0: that is the thumbnail and the loop point)
  const flash = frame === 0 ? 0 : pulse(frame / fps, true, 0.09) * 0.22;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundColor: t.colors.grade, mixBlendMode: "soft-light", opacity: 0.35 }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 26%, transparent 42%, rgba(0,0,0,0.5) 58%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.25) 100%)",
        }}
      />
      <AbsoluteFill style={{ background: "#FFF4DE", mixBlendMode: "screen", opacity: flash }} />
    </AbsoluteFill>
  );
};

export const WahdyShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (s: number) => Math.round(s * fps);
  // the whole picture punches on every beat, harder on the downbeat
  const s = frame / fps;
  const beat = pulse(s, false, 0.1) * 0.012 + pulse(s, true, 0.14) * 0.02;
  return (
    <AbsoluteFill style={{ background: t.colors.bg }}>
      <Audio src={staticFile("lyrics/wahdy-chorus.mp3")} />
      <AbsoluteFill style={{ transform: `scale(${1 + beat})` }}>
        {SHOTS.map((_, i) => (
          <Sequence key={i} from={at(lineStartS(i))} durationInFrames={at(lineEndS(i)) - at(lineStartS(i))}>
            <ShotLayer index={i} dur={at(lineEndS(i)) - at(lineStartS(i))} startS={at(lineStartS(i)) / fps} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Grade />
      <Embers />
      <Streak />
      <Rings />
      {LINES.map((line, i) => {
        const from = at(lineStartS(i));
        // the last line clears a beat before the loop
        const end = i === LINES.length - 1 ? at(WAHDY_TOTAL_S - BEAT) : at(lineEndS(i));
        return (
          <Sequence key={i} from={from} durationInFrames={end - from}>
            <LyricLine line={line} index={i} dur={end - from} />
          </Sequence>
        );
      })}
      <Hook />
      <Grain />
    </AbsoluteFill>
  );
};
