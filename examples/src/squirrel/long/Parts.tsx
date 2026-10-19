// Two-part Shorts cut of the long video (Arabic):
// Part 1 = hook + story up to the hospital + cliffhanger.
// Part 2 = recap + legend + lessons + a save-worthy lessons card with a comment question.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Display, useBob } from "../motion";
import { DarkBg, DinerBg, SunburstBg } from "../bg";
import { Burger, OldMan, Squirrel } from "../art";
import segs from "../../../public/videos/squirrel-burger/audio/segments-ar.json";
import { Captions } from "./Captions";
import { Card, Flash, NumberBadge, Slam, SpeedLines } from "./kit";
import { SquirrelLong } from "./SquirrelLong";
import { FPS, Lang, bStart, num, setLang, w } from "./timing";

const C = theme.colors;
const A = (f: string) => staticFile(`videos/squirrel-burger/audio/${f}`);
type Seg = { dur: number; words: { text: string; start: number; end: number }[] };
const SEG = segs as Record<"p1end" | "p2intro" | "p2cta", Seg>;
const f = (s: number) => Math.round(s * FPS);
// frame (inside a segment) where a word is spoken
const at = (seg: Seg, word: string) => f(seg.words.find((x) => x.text.replace(/[^؀-ۿ]/g, "") === word)?.start ?? 0);
const sp = (frame: number, a: number) => spring({ frame: frame - a, fps: FPS, config: theme.spring.bouncy });

const Layers: React.FC = () => (
  <>
    <AbsoluteFill style={{ pointerEvents: "none", backgroundColor: C.mustard, mixBlendMode: "soft-light", opacity: 0.14 }} />
    <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.28) 100%)" }} />
  </>
);

// ---------------------------------------------------------------- part 1 ending: cliffhanger
const Cliffhanger: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = SEG.p1end;
  const follow = at(seg, "تابعني");
  const paper = sp(frame, 2);
  const badge = sp(frame, follow);
  return (
    <AbsoluteFill>
      <DarkBg tint={C.navy} />
      {/* tomorrow's newspaper, face down: the reveal is in part 2 */}
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 420,
          width: 700,
          height: 820,
          background: "#F7F0E1",
          border: `10px solid ${C.ink}`,
          borderRadius: 12,
          boxShadow: `18px 18px 0 ${C.ink}`,
          transform: `rotate(${interpolate(paper, [0, 1], [400, -6])}deg) scale(${interpolate(paper, [0, 1], [0.1, 1])})`,
          filter: "blur(10px)",
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", transform: `scale(${1 + Math.sin(frame / 5) * 0.05})` }}>
        <Display size={420} color={C.mustard} stroke={18}>
          ؟
        </Display>
      </div>
      {frame >= follow && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 340, display: "flex", justifyContent: "center", transform: `scale(${badge}) rotate(-4deg)` }}>
          <Card bg={C.cherry} style={{ padding: "18px 44px" }}>
            <Display size={110} color={C.cream} stroke={10}>
              الجزء {num(2)} ←
            </Display>
          </Card>
        </div>
      )}
      <Flash at={follow} peak={0.35} />
      <Layers />
      <Captions source={seg.words} />
    </AbsoluteFill>
  );
};

export const SquirrelPart1: React.FC<{ lang?: Lang }> = ({ lang = "ar" }) => {
  setLang(lang);
  const story = bStart(9);
  const end = f(SEG.p1end.dur + 1.2);
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Sequence durationInFrames={story}>
        <SquirrelLong lang={lang} />
      </Sequence>
      <Sequence from={story} durationInFrames={end}>
        <Cliffhanger />
        <Audio src={A("seg-ar-p1end.wav")} />
        <Audio src={A("music-ar.wav")} startFrom={bStart(8)} volume={0.18} />
        <Sequence from={at(SEG.p1end, "تابعني") - 40} layout="none">
          <Audio src={A("riser.wav")} volume={0.45} />
        </Sequence>
        <Sequence from={at(SEG.p1end, "تابعني") - 2} layout="none">
          <Audio src={A("boom.wav")} volume={0.7} />
        </Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};
export const part1Frames = (lang: Lang) => {
  setLang(lang);
  return bStart(9) + f(SEG.p1end.dur + 1.2);
};

// ---------------------------------------------------------------- part 2 opening: recap
const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = SEG.p2intro;
  const ray = at(seg, "راي");
  const sick = at(seg, "والزبون");
  const q = at(seg, "طب");
  const shot = frame < ray ? 0 : frame < sick ? 1 : frame < q ? 2 : 3;
  const bob = useBob(10, 6);
  return (
    <AbsoluteFill>
      {shot <= 1 && (
        <>
          <DinerBg />
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
            <ellipse cx={540} cy={1162} rx={330} ry={34} fill={C.white} stroke={C.ink} strokeWidth={6} />
            <g transform={`translate(540 1100) scale(${shot === 1 ? 1.08 : 1}) translate(-540 -1100)`}>
              <Burger x={240} y={624} size={600} lift={230} tilt={-12} patty={false} middle={<Squirrel x={72} y={0} size={176} tail={Math.sin(frame / 4) * 10} />} />
            </g>
          </svg>
        </>
      )}
      {shot === 2 && (
        <>
          <DarkBg tint={C.sick} />
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
            <OldMan x={240} y={480 + bob} size={600} sick={1} open={0.2} />
          </svg>
          <AbsoluteFill style={{ background: Math.floor(frame / 4) % 2 ? C.cherry : C.siren, opacity: 0.12, mixBlendMode: "screen" }} />
        </>
      )}
      {shot === 3 && (
        <>
          <SunburstBg color={C.navy} ray="#26386A" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", transform: `scale(${sp(frame, q)})` }}>
            <Display size={460} color={C.mustard} stroke={18}>
              ؟
            </Display>
          </div>
        </>
      )}
      {/* "previously" tag */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", transform: `scale(${sp(frame, 0)}) rotate(-3deg)` }}>
        <Card bg={C.mustard} style={{ padding: "12px 34px" }}>
          <Display size={70} color={C.ink} stroke={0} style={{ textShadow: "none" }}>
            الجزء {num(2)} · في اللي فات
          </Display>
        </Card>
      </div>
      <Flash at={ray} peak={0.3} />
      <Flash at={sick} peak={0.3} />
      <Flash at={q} peak={0.3} />
      <Layers />
      <Captions source={seg.words} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- part 2 ending: the lessons card
const LESSONS = ["قلّل الشغل، مش الجودة", "قدّم الأهم الأول", "اتكلم بدري"];

const LessonsCard: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = SEG.p2cta;
  const ask = at(seg, "وقولي");
  const save = sp(frame, at(seg, "احفظ"));
  return (
    <AbsoluteFill>
      <SunburstBg color={C.mint} ray="#93E0CA" />
      <div style={{ position: "absolute", left: 70, right: 110, top: 300, direction: "rtl" }}>
        <Card bg={C.cream} style={{ padding: "34px 40px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <svg width={150} height={150} viewBox="0 0 220 220" overflow="visible">
              <Squirrel size={220} tail={Math.sin(frame / 4) * 10} wink={frame > 40 && frame < 52 ? 1 : 0} />
            </svg>
            <Display size={78} color={C.ink} stroke={0} style={{ textShadow: "none", whiteSpace: "nowrap" }}>
              {num(3)} دروس من السنجاب
            </Display>
          </div>
          {LESSONS.map((l, i) => {
            const p = sp(frame, 6 + i * 6);
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 30, transform: `translateX(${interpolate(p, [0, 1], [-80, 0])}px)`, opacity: Math.min(1, p * 2) }}>
                <div style={{ width: 110, height: 110, borderRadius: "50%", background: C.cherry, border: `8px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Display size={76} color={C.cream} stroke={8}>
                    {num(i + 1)}
                  </Display>
                </div>
                <Display size={78} color={C.ink} stroke={0} style={{ textShadow: "none", textAlign: "right" }}>
                  {l}
                </Display>
              </div>
            );
          })}
        </Card>
      </div>
      {/* save hint */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", transform: `scale(${save}) rotate(-3deg)` }}>
        <Card bg={C.mustard} style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 34px" }}>
          <svg width={60} height={70} viewBox="0 0 60 70">
            <path d="M8 6 H52 V64 L30 48 L8 64 Z" fill={C.cherry} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          </svg>
          <Display size={70} color={C.ink} stroke={0} style={{ textShadow: "none" }}>
            احفظ الفيديو
          </Display>
        </Card>
      </div>
      {frame >= ask && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", transform: `scale(${sp(frame, ask)}) rotate(3deg)` }}>
          <Card bg={C.white} style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 34px" }}>
            <svg width={66} height={60} viewBox="0 0 66 60">
              <path d="M6 6 H60 V40 H26 L12 54 V40 H6 Z" fill={C.mint} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            </svg>
            <Display size={64} color={C.ink} stroke={0} style={{ textShadow: "none" }}>
              قولّي في الكومنتات
            </Display>
          </Card>
        </div>
      )}
      <SpeedLines at={0} color={C.cream} />
      <Layers />
      <Captions source={seg.words} />
    </AbsoluteFill>
  );
};

export const SquirrelPart2: React.FC<{ lang?: Lang }> = ({ lang = "ar" }) => {
  setLang(lang);
  const intro = f(SEG.p2intro.dur + 0.5);
  const from = bStart(9);
  // stop before the long cut's loop wipe; hold the punchline a moment
  const storyLen = bStart(17) + w(17, "serve") + f(2.2) - from;
  const cta = f(SEG.p2cta.dur + 1.8);
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Sequence durationInFrames={intro}>
        <Recap />
        <Audio src={A("seg-ar-p2intro.wav")} />
        <Audio src={A("music-ar.wav")} volume={0.18} />
        <Audio src={A("scratch.wav")} volume={0.5} />
      </Sequence>
      <Sequence from={intro} durationInFrames={storyLen}>
        <Sequence from={-from}>
          <SquirrelLong lang={lang} />
        </Sequence>
      </Sequence>
      <Sequence from={intro + storyLen} durationInFrames={cta}>
        <LessonsCard />
        <Audio src={A("seg-ar-p2cta.wav")} />
        <Audio src={A("music-ar.wav")} startFrom={bStart(14)} volume={0.18} />
        <Audio src={A("ding.wav")} volume={0.5} />
        {[6, 12, 18].map((d) => (
          <Sequence key={d} from={d} layout="none">
            <Audio src={A("pop.wav")} volume={0.45} />
          </Sequence>
        ))}
      </Sequence>
    </AbsoluteFill>
  );
};
export const part2Frames = (lang: Lang) => {
  setLang(lang);
  return f(SEG.p2intro.dur + 0.5) + (bStart(17) + w(17, "serve") + f(2.2) - bStart(9)) + f(SEG.p2cta.dur + 1.8);
};
