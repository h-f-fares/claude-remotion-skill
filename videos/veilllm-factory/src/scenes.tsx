import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, theme } from "./theme";
import { at, from, sec, SCENES, segments, type SceneKey } from "./timing";
import { BubbleIcon, Card, CloudIcon, Entrance, GithubIcon, Kicker, LockIcon, ShieldIcon, useBreath, useSpring } from "./components";
import { MessageCard, Packet } from "./Message";

const C = theme.colors;
// a spoken word's frame, relative to the start of scene k
const cue = (k: SceneKey, text: string, nth = 0) => at(text, nth, SCENES[k][0]) - from(k);
const AR: React.CSSProperties = { fontFamily: theme.fonts.ar, direction: "rtl" };

// Kicker that swaps text at given local frames.
const Swap: React.FC<{ items: { at: number; text: string; color?: string }[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const i = items.reduce((acc, it, k) => (frame >= it.at ? k : acc), 0);
  const it = items[i];
  return <Sequence key={i} from={Math.max(0, it.at)} layout="none"><Kicker color={it.color}>{it.text}</Kicker></Sequence>;
};

// ---------- 1. Hook: frame 0 is the thumbnail, so everything starts composed ----------
export const Hook: React.FC = () => {
  const k = "hook";
  const frame = useCurrentFrame();
  const out = cue(k, "بتخرج");
  const wait = cue(k, "استنى");
  const b = useBreath(5, 36);
  const cloudHit = interpolate(frame, [out + 14, out + 24], [0, 1], clamp);
  const pulse = interpolate(frame, [wait, wait + 8, wait + 30], [1, 1.12, 1], clamp);
  return (
    <AbsoluteFill>
      <Kicker delay={-30} color={C.hero}>
        <span style={{ fontSize: 64, transform: `scale(${pulse})`, display: "inline-block" }}>الموديل شاف إيه؟</span>
      </Kicker>
      <div style={{ position: "absolute", top: 480, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ filter: `drop-shadow(0 0 ${40 * cloudHit}px ${C.leakGlow})`, transform: `translateY(${b}px)` }}>
          <CloudIcon size={200} color={cloudHit > 0.5 ? C.leak : C.text} />
        </div>
        <div style={{ ...AR, fontWeight: 700, fontSize: 34, color: C.dim }}>موديل في الـ cloud</div>
      </div>
      <div style={{ position: "absolute", top: 780, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `translateY(${-b}px)` }}>
        <MessageCard label="رسالة لعميل، من جهازك" cues={[{ leak: -20 }, { leak: -16 }, { leak: -12 }]} />
      </div>
      {[0, 1, 2].map((i) => (
        <Packet key={i} start={out + i * 4} dur={20} from={[[330, 780, 560][i], [930, 1010, 1080][i]]} to={[540, 560]} color={C.leak} arc={-60} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- 2. Friends: local is private but weak, cloud is strong but leaks ----------
const Bar: React.FC<{ label: string; value: number; at: number; good: boolean }> = ({ label, value, at: start, good }) => {
  const p = useSpring(start, "smooth");
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ ...AR, fontSize: 30, fontWeight: 500, color: C.dim, marginBottom: 10 }}>{label}</div>
      <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.07)", overflow: "hidden", direction: "rtl" }}>
        <div style={{ height: "100%", width: `${value * p}%`, borderRadius: 11, background: good ? C.hero : C.leak, boxShadow: `0 0 18px ${good ? C.heroGlow : C.leakGlow}` }} />
      </div>
    </div>
  );
};

const Side: React.FC<{ title: string; icon: React.ReactNode; enter: number; bars: { label: string; value: number; at: number; good: boolean }[]; phase: number }> = ({ title, icon, enter, bars, phase }) => {
  const b = useBreath(5, 42, phase);
  return (
    <Entrance delay={enter} y={70} config="bouncy">
      <Card style={{ width: 430, padding: "36px 34px 42px", transform: `translateY(${b}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, direction: "rtl" }}>
          {icon}
          <div style={{ fontFamily: "'Plex Sans', system-ui", fontWeight: 700, fontSize: 52, color: C.text }}>{title}</div>
        </div>
        {bars.map((x) => <Bar key={x.label} {...x} />)}
      </Card>
    </Entrance>
  );
};

const Friend: React.FC<{ i: number; enter: number }> = ({ i, enter }) => {
  const b = useBreath(4, 30, i * 1.3);
  return (
    <Entrance delay={enter + i * 4} y={30} config="snappy">
      <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: `translateY(${b}px)` }}>
        <circle cx="50" cy="50" r="48" fill={C.card} stroke={i === 0 ? C.hero : C.line} strokeWidth="3" />
        <circle cx="50" cy="40" r="15" fill={i === 0 ? C.hero : C.dim} />
        <path d="M22 82c4-16 16-22 28-22s24 6 28 22" fill={i === 0 ? C.hero : C.dim} />
      </svg>
    </Entrance>
  );
};

export const Friends: React.FC = () => {
  const k = "friends";
  const friends = cue(k, "صحابي");
  const local = cue(k, "local");
  const weak = cue(k, "local", 1);
  const but = cue(k, "بس"); // "but local models still can't match the cloud": the cloud card arrives here
  const cloud = cue(k, "cloud");
  return (
    <AbsoluteFill>
      <Kicker delay={2}>الـ AI harness بتاعنا</Kicker>
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26 }}>
        {[0, 1, 2, 3].map((i) => <Friend key={i} i={i} enter={friends} />)}
      </div>
      <div style={{ position: "absolute", top: 650, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40, direction: "rtl" }}>
        <Side title="local" phase={0} enter={local} icon={<LockIcon size={70} />} bars={[
          { label: "الداتا بتفضل عندك", value: 100, at: local + 10, good: true },
          { label: "القوة", value: 34, at: weak + 6, good: false },
        ]} />
        <Side title="cloud" phase={2} enter={but} icon={<CloudIcon size={84} color={C.text} />} bars={[
          { label: "الداتا بتفضل عندك", value: 12, at: cloud + 6, good: false },
          { label: "القوة", value: 96, at: cloud + 12, good: true },
        ]} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. Reveal: VeilLLM sits between the harness and the model (flow runs right to left) ----------
const Node: React.FC<{ x: number; enter: number; label: string; children: React.ReactNode }> = ({ x, enter, label, children }) => (
  <div style={{ position: "absolute", left: x, top: 820, transform: "translate(-50%, -50%)" }}>
    <Entrance delay={enter} y={40} config="bouncy" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {children}
      <div style={{ ...AR, fontWeight: 700, fontSize: 32, color: C.dim, whiteSpace: "nowrap" }}>{label}</div>
    </Entrance>
  </div>
);

export const Reveal: React.FC = () => {
  const k = "reveal";
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const name = cue(k, "VeilLLM");
  const proxy = cue(k, "proxy");
  const harness = cue(k, "harness");
  const model = cue(k, "والموديل");
  const slam = spring({ frame: frame - name, fps, config: theme.spring.snappy });
  const s = interpolate(slam, [0, 1], [2.2, 1]);
  const glow = 1 + 0.15 * Math.sin(frame / 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, textAlign: "center", opacity: slam, transform: `scale(${s})` }}>
        <div style={{ fontFamily: "'Plex Sans', system-ui", fontWeight: 700, fontSize: 150, letterSpacing: "-0.03em", color: C.hero, textShadow: `0 0 ${60 * glow}px ${C.heroGlow}` }}>VeilLLM</div>
      </div>
      <div style={{ position: "absolute", top: 580, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Entrance delay={proxy} y={20} config="snappy">
          <div style={{ ...AR, fontWeight: 700, fontSize: 40, color: C.text, padding: "8px 26px", borderRadius: 999, background: C.card, border: `2px solid ${C.line}` }}>proxy لوكال على جهازك</div>
        </Entrance>
      </div>
      <Node x={870} enter={harness} label="الـ harness بتاعك">
        <Card style={{ width: 170, height: 150, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.fonts.mono, fontSize: 52, color: C.text }}>{">_"}</Card>
      </Node>
      <Node x={540} enter={name + 4} label="VeilLLM">
        <ShieldIcon size={170} />
      </Node>
      <Node x={210} enter={model} label="الموديل">
        <CloudIcon size={200} color={C.text} />
      </Node>
      {[0, 1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <Packet start={harness + 6 + i * 22} dur={14} from={[780, 820]} to={[620, 820]} color={C.leak} arc={-30} />
          <Packet start={harness + 20 + i * 22} dur={14} from={[460, 820]} to={[300, 820]} color={C.hero} arc={-30} />
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

// ---------- 4. Mask: find, swap for placeholders, send, restore ----------
export const Mask: React.FC = () => {
  const k = "mask";
  const names = cue(k, "الأسامي");
  const emails = cue(k, "والإيميلات");
  const keys = cue(k, "API");
  const swap = cue(k, "ويبدّلها");
  const send = cue(k, "يخرج");
  const back = cue(k, "يرجع");
  const restore = cue(k, "بيرجّع");
  return (
    <AbsoluteFill>
      <Swap items={[{ at: 2, text: "بيلاقي الحاجات الحساسة" }, { at: swap, text: "ويبدّلها قبل ما تخرج" }, { at: back - 4, text: "ولما الرد يرجع" }]} />
      <div style={{ position: "absolute", top: 450, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <MessageCard label="الرسالة" cues={[
          { leak: names, mask: swap, unmask: restore },
          { leak: emails, mask: swap + 5, unmask: restore + 5 },
          { leak: keys, mask: swap + 10, unmask: restore + 10 },
        ]} />
      </div>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 120px", alignItems: "center", direction: "rtl" }}>
        <Entrance delay={4} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <ShieldIcon size={110} />
          <div style={{ fontFamily: "'Plex Sans'", fontWeight: 700, fontSize: 30, color: C.hero }}>VeilLLM</div>
        </Entrance>
        <Entrance delay={8} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <CloudIcon size={170} color={C.text} />
          <div style={{ ...AR, fontWeight: 700, fontSize: 30, color: C.dim }}>الموديل</div>
        </Entrance>
      </div>
      <Packet start={send} dur={18} from={[840, 1060]} to={[250, 1060]} color={C.hero} label="<PERSON_0> <EMAIL_0>" arc={-90} />
      <Packet start={back} dur={18} from={[250, 1060]} to={[840, 1060]} color={C.hero} label="<PERSON_0>" arc={-90} />
    </AbsoluteFill>
  );
};

// ---------- 5. Reset: the dark "does it actually work?" beat ----------
export const Reset: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: theme.spring.snappy });
  const shake = interpolate(frame, [0, 10], [14, 0], clamp) * Math.sin(frame * 2.3);
  const flash = interpolate(frame, [0, 6], [0.5, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "rgba(10,0,0,0.65)" }}>
      <AbsoluteFill style={{ background: C.leak, opacity: flash }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${shake}px, ${-shake / 2}px)` }}>
        <div style={{ ...AR, fontWeight: 700, fontSize: 132, color: C.text, opacity: p, transform: `scale(${interpolate(p, [0, 1], [2, 1])})`, textShadow: `0 0 60px ${C.leakGlow}` }}>
          طب بجد<br /><span style={{ color: C.leak }}>بيشتغل؟</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 6. Demo: the real playground, with a camera moving to what the line is about ----------
const CLIP_W = 1200, VIEW_W = 1000, VIEW_H = 900, BASE = VIEW_W / CLIP_W;
const Clip: React.FC<{ startSec: number; rate?: number }> = ({ startSec, rate = 1 }) => (
  <OffthreadVideo src={staticFile("clips/demo.mp4")} startFrom={sec(startSec)} playbackRate={rate} muted style={{ width: CLIP_W, height: "auto", display: "block" }} />
);

export const Demo: React.FC = () => {
  const k = "demo";
  const frame = useCurrentFrame();
  const saw = sec(segments[6].start) - from(k); // beat 7: "and this is what the model saw"
  const speed = cue(k, "بيزوّد");
  const num = cue(k, "20");
  const typed = sec(1.6 - 0.8); // the clip starts mid-typing, so the input is complete within the line
  // camera keyframes: [frame, focus y in clip px, focus x, zoom]
  const keys: [number, number, number, number][] = [[0, 530, 600, 1.03], [saw, 530, 600, 1.03], [saw + 18, 1010, 600, 1.03], [speed, 1010, 600, 1.03], [speed + 20, 1290, 430, 1.7]];
  const pick = (i: number) => interpolate(frame, keys.map((x) => x[0]), keys.map((x) => x[i]), { ...clamp, easing: theme.ease.inOut });
  const cy = pick(1), cx = pick(2), z = pick(3);
  const s = BASE * z;
  const tx = VIEW_W / 2 - cx * s, ty = VIEW_H / 2 - cy * s;
  const ring = interpolate(frame, [num, num + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Swap items={[{ at: 0, text: "ده اللي انت كتبته", color: C.leak }, { at: saw, text: "وده اللي الموديل شافه" }, { at: speed, text: "23.8ms بس" }]} />
      <div style={{ position: "absolute", top: 420, left: (1080 - VIEW_W) / 2 }}>
        <Entrance delay={-4} y={50}>
          <Card glow={ring > 0 ? C.heroGlow : undefined} style={{ width: VIEW_W, height: VIEW_H, overflow: "hidden", position: "relative", padding: 0 }}>
            <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
              <Sequence durationInFrames={typed} layout="none"><Clip startSec={0.8} /></Sequence>
              {/* hold the typed input until the next line; a still, because <Freeze> over OffthreadVideo rendered blank */}
              <Sequence from={typed} durationInFrames={Math.max(1, saw - typed)} layout="none"><Img src={staticFile("clips/demo-typed.png")} style={{ width: CLIP_W, display: "block" }} /></Sequence>
              <Sequence from={saw} layout="none"><Clip startSec={1.9} /></Sequence>
            </div>
          </Card>
        </Entrance>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7. Config: one line to install ----------
export const Config: React.FC = () => {
  const k = "config";
  const frame = useCurrentFrame();
  const line = cue(k, "سطر");
  const change = cue(k, "تغيّر");
  const after = cue(k, "base");
  const strike = interpolate(frame, [change, change + 12], [0, 1], { ...clamp, easing: theme.ease.out });
  const row = (txt: string, color: string, extra?: React.ReactNode) => (
    <div><div style={{ position: "relative", display: "inline-block", color, whiteSpace: "nowrap" }}>{txt}{extra}</div></div>
  );
  return (
    <AbsoluteFill>
      <Kicker delay={line}>سطر config واحد</Kicker>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Entrance delay={0} y={50}>
          <Card style={{ width: 960, padding: "40px 44px", direction: "ltr", fontFamily: theme.fonts.mono, fontSize: 36, lineHeight: 1.9 }}>
            {row("# before", C.dim)}
            {row("base_url: https://api.openai.com/v1", C.text, <div style={{ position: "absolute", left: 0, top: "52%", height: 5, width: `${strike * 100}%`, background: C.leak, boxShadow: `0 0 12px ${C.leakGlow}` }} />)}
            <div style={{ height: 24 }} />
            {row("# after", C.dim)}
            <Entrance delay={after} y={16} config="snappy">
              {row("base_url: http://127.0.0.1:4000/v1", C.hero)}
            </Entrance>
          </Card>
        </Entrance>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 8. Choice: the comment question ----------
const Choice: React.FC<{ enter: number; icon: React.ReactNode; label: string; phase: number }> = ({ enter, icon, label, phase }) => {
  const b = useBreath(1, 22, phase);
  return (
    <Entrance delay={enter} y={60} config="bouncy">
      <Card style={{ width: 420, height: 380, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, transform: `scale(${1 + 0.02 * b})` }}>
        {icon}
        <div style={{ ...AR, fontWeight: 700, fontSize: 52, color: C.text }}>{label}</div>
      </Card>
    </Entrance>
  );
};

export const ChoiceScene: React.FC = () => {
  const k = "choice";
  const frame = useCurrentFrame();
  const cloud = cue(k, "cloud");
  const local = cue(k, "local");
  const ask = cue(k, "قولي");
  return (
    <AbsoluteFill>
      <Kicker delay={0}>وانت؟</Kicker>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40, direction: "rtl" }}>
        <Choice enter={cloud - 4} phase={0} icon={<CloudIcon size={170} color={C.text} />} label="الـ cloud" />
        <Choice enter={local - 4} phase={Math.PI} icon={<LockIcon size={130} />} label="local بس" />
      </div>
      <div style={{ position: "absolute", top: 1000, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Entrance delay={ask} y={30} config="bouncy">
          <div style={{ transform: `rotate(${Math.sin(frame / 6) * 3}deg)` }}><BubbleIcon size={150} /></div>
        </Entrance>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 9. CTA ----------
export const Cta: React.FC = () => {
  const k = "cta";
  const frame = useCurrentFrame();
  const gh = cue(k, "GitHub");
  const name = cue(k, "VeilLLM");
  const glow = 1 + 0.15 * Math.sin(frame / 10);
  return (
    <AbsoluteFill>
      <Kicker delay={cue(k, "open")}>open source</Kicker>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 46 }}>
        <Entrance delay={gh - 6} y={50} config="bouncy">
          <Card style={{ display: "flex", alignItems: "center", gap: 28, padding: "34px 46px", direction: "ltr" }}>
            <GithubIcon size={96} />
            <div style={{ fontFamily: "'Plex Sans'", fontWeight: 700, fontSize: 50, color: C.text }}>h-f-fares/<span style={{ color: C.hero }}>VeilLLM</span></div>
          </Card>
        </Entrance>
        <Entrance delay={name} y={30} config="snappy">
          <div style={{ fontFamily: theme.fonts.mono, fontSize: 44, color: C.hero, padding: "18px 34px", borderRadius: 18, border: `2px solid ${C.hero}66`, background: `${C.hero}14`, boxShadow: `0 0 ${40 * glow}px ${C.heroGlow}`, direction: "ltr" }}>
            pip install veil-llm
          </div>
        </Entrance>
      </div>
    </AbsoluteFill>
  );
};
