// Beats 1–6: hook → closing time → last customer → no beef → the manager's rule → the squirrel out back.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Display, ease, useBob, useSp } from "../motion";
import { DarkBg, DinerBg, NightBg, SunburstBg } from "../bg";
import { Burger, OldMan, Ray, Squirrel } from "../art";
import { Clock } from "../scenes";
import { Boss, Door, Globe, Laptop, TrashCan } from "./art2";
import { Card, Flash, Shot, Slam, SpeedLines } from "./kit";
import { bLen, cuts, isAr, s, tr, w } from "./timing";

const C = theme.colors;
const ink = (n = 8) => `${n}px solid ${C.ink}`;
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }} overflow="visible">
    {children}
  </svg>
);
// which sentence of the beat are we in
const useSeg = (b: number) => {
  const frame = useCurrentFrame();
  let k = 0;
  cuts(b).forEach((c, i) => {
    if (frame >= c) k = i;
  });
  return k;
};
const Counter: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 40, right: 40, top: 1170, height: 70, background: C.cherry, border: ink(), borderRadius: 18 }} />
    <div style={{ position: "absolute", left: 70, right: 70, top: 1240, height: 200, background: "#D9D9D9", border: ink(), borderTop: "none" }} />
  </>
);

// ================================================================ 1. hook
export const B1: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = useSeg(1);
  const drop = useSp(0, theme.spring.bouncy);
  const reveal = useSp(w(1, "got") - 2, theme.spring.bouncy);
  const sq = w(1, "squirrel");
  const bang = useSp(sq, theme.spring.bouncy);
  const squash = 1 - Math.max(0, drop - 1) * 0.6;
  const wag = Math.sin(frame / 4) * 10 * reveal;
  const globeIn = useSp(s(1, 2), theme.spring.bouncy);
  const soft = w(1, "software");
  return (
    <Shot cuts={[0, sq, s(1, 2), soft]} first hits={[sq]}>
      {seg < 2 ? (
        <>
          <DinerBg />
          <Counter />
          <Stage>
            <ellipse cx={540} cy={1162} rx={330} ry={34} fill={C.white} stroke={C.ink} strokeWidth={6} />
            <g transform={`translate(0 ${interpolate(drop, [0, 1], [-900, 0])}) translate(540 1160) scale(${2 - squash} ${squash}) translate(-540 -1160)`}>
              <Burger x={240} y={624} size={600} lift={reveal * 230} tilt={-12 * reveal} patty={reveal < 0.02} clipId="b1-fill" middle={<Squirrel x={72} y={210 - reveal * 210} size={176} tail={wag} />} />
            </g>
          </Stage>
          <div style={{ position: "absolute", left: 790, top: 560, transform: `scale(${bang}) rotate(${12 - bang * 12}deg)`, opacity: Math.min(1, bang * 2) }}>
            <Display size={210} color={C.mustard} stroke={14}>?!</Display>
          </div>
          <SpeedLines at={sq} />
          <Flash at={sq} peak={0.5} />
        </>
      ) : (
        <>
          <DarkBg tint={C.mint} />
          <Stage>
            <g transform={`translate(540 860) scale(${globeIn}) translate(-540 -860)`}>
              <Globe x={240} y={560} size={600} spin={frame * 1.2} />
              <Squirrel x={430} y={380} size={230} tail={Math.sin(frame / 4) * 10} />
            </g>
            {[
              [70, 520],
              [740, 640],
              [60, 960],
              [750, 1010],
              [330, 1160],
            ].map(([lx, ly], i) => {
              const p = spring({ frame: frame - soft - i * 4, fps: 30, config: theme.spring.bouncy });
              return (
                <g key={i} transform={`translate(${lx + 110} ${ly + 80}) scale(${p}) translate(${-lx - 110} ${-ly - 80})`}>
                  <Laptop x={lx} y={ly + Math.sin(frame / 10 + i) * 8} size={220} glow={i % 2 ? C.mint : C.mustard} />
                </g>
              );
            })}
          </Stage>
          <Slam at={soft} words={tr("SOFTWARE TEAMS", "فرق البرمجة").split(" ")} colors={[C.mustard, C.cream]} top={380} size={120} />
        </>
      )}
    </Shot>
  );
};

// ================================================================ 2. closing time
const RewindIcon: React.FC = () => (
  <svg width={200} height={120} viewBox="0 0 200 120">
    <path d="M100 10 L 10 60 L 100 110 Z M190 10 L 100 60 L 190 110 Z" fill={C.cream} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
  </svg>
);

// the diner after hours: lights dimmed, night in the window, clock on the wall
const ClosingDiner: React.FC<{ t: number; closed?: number }> = ({ t, closed = 0 }) => (
  <>
    <DinerBg />
    <div style={{ position: "absolute", left: 600, top: 380, width: 380, height: 360, background: `linear-gradient(180deg, ${C.navyDeep}, ${C.navy})`, border: ink(10), borderRadius: 20, overflow: "hidden" }}>
      <div style={{ position: "absolute", right: 40, top: 40, width: 80, height: 80, borderRadius: "50%", background: C.cream, border: ink(5) }} />
      <div style={{ position: "absolute", left: 40, top: 150, transformOrigin: "50% 0%", transform: `rotateY(${closed * 180}deg)`, perspective: 600 }}>
        <div style={{ background: closed > 0.5 ? C.cherry : C.mint, border: ink(6), borderRadius: 12, padding: "10px 22px", transform: closed > 0.5 ? "scaleX(-1)" : undefined }}>
          <Display size={56} color={C.cream} stroke={6}>{closed > 0.5 ? tr("CLOSED", "مقفول") : tr("OPEN", "مفتوح")}</Display>
        </div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 90, top: 400 }}>
      <Clock t={t} />
    </div>
    <AbsoluteFill style={{ background: "rgba(16,25,53,0.28)" }} />
  </>
);

export const B2: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = useSeg(2);
  const c = cuts(2);
  const bob = useBob(14, 6);
  const alone = w(2, "alone");
  const close = w(2, "close");
  const wipe = Math.sin(frame / 4) * 120;
  return (
    <Shot cuts={[...c, alone, close]} enter="zoom" hits={[alone]}>
      {seg === 0 && (
        <>
          <DinerBg />
          <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 6px, transparent 6px 14px)`, transform: `translateY(${(frame * 9) % 14}px)` }} />
          <AbsoluteFill style={{ background: "rgba(29,43,79,0.35)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <div style={{ transform: `translateX(${Math.sin(frame / 2) * 10}px)` }}>
              <RewindIcon />
            </div>
            <Display size={120} color={C.cream}>{tr("REWIND", "نرجع بالزمن")}</Display>
          </div>
        </>
      )}
      {seg === 1 && (
        <>
          <DinerBg />
          <Stage>
            <Ray x={250} y={600 + bob} size={580} grin={1} />
          </Stage>
          <Slam at={c[1]} words={tr("MEET RAY", "ده راي").split(" ")} colors={[C.cream, C.mustard]} top={380} size={150} />
        </>
      )}
      {seg >= 2 && (
        <>
          <ClosingDiner t={frame * 0.3} closed={ease(frame, [close - 4, close + 8], [0, 1])} />
          <Stage>
            <Ray x={290} y={560 + bob * 0.5} size={500} worry={0.3} look={-1} />
          </Stage>
          <div style={{ position: "absolute", left: 40, right: 40, top: 1150, height: 70, background: C.cherry, border: ink(), borderRadius: 18 }} />
          <div style={{ position: "absolute", left: 70, right: 70, top: 1220, height: 220, background: "#D9D9D9", border: ink(), borderTop: "none" }} />
          <div style={{ position: "absolute", left: 470 + wipe, top: 1110, width: 150, height: 60, background: C.mint, border: ink(6), borderRadius: 14 }} />
          {frame >= alone && frame < close && <Slam at={alone} words={[tr("ALONE.", "لوحده.")]} colors={[C.mustard]} top={330} size={140} rotate={-4} />}
        </>
      )}
    </Shot>
  );
};

// ================================================================ 3. last customer
export const B3: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = useSeg(3);
  const c = cuts(3);
  const open = ease(frame, [4, 20], [0, 1], theme.ease.inOut);
  const walk = ease(frame, [c[1], c[1] + 24], [0, 1], theme.ease.out);
  const think = useSp(w(3, "hot"), theme.spring.bouncy);
  const bob = useBob(12, 5);
  return (
    <Shot cuts={c} hits={[c[1]]}>
      {seg < 2 ? (
        <>
          <ClosingDiner t={frame * 0.3} closed={1} />
          <Stage>
            <Door x={330} y={560} size={420} open={open} label={tr("CLOSED", "مقفول")} />
            {seg === 1 && (
              <g transform={`translate(${interpolate(walk, [0, 1], [0, -40])} ${interpolate(walk, [0, 1], [60, 0])}) translate(540 980) scale(${interpolate(walk, [0, 1], [0.7, 1])}) translate(-540 -980)`}>
                <OldMan x={360} y={700 + Math.abs(Math.sin(frame / 4)) * -10} size={360} />
              </g>
            )}
          </Stage>
          {/* door frame light spill */}
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 260px 500px at 540px 980px, rgba(255,236,170,${0.35 * open}), transparent 70%)` }} />
          {seg === 1 && <Slam at={c[1] + 6} words={tr("1 LAST CUSTOMER", "آخر زبون").split(" ")} colors={[C.mustard, C.cream, C.cream]} top={380} size={120} />}
        </>
      ) : (
        <>
          <DinerBg />
          <Stage>
            <OldMan x={240} y={520 + bob} size={600} open={0.25} />
          </Stage>
          <div style={{ position: "absolute", left: 600, top: 330, transform: `scale(${think})`, transformOrigin: "0% 100%" }}>
            <div style={{ width: 330, height: 260, background: C.white, border: ink(), borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={220} height={200} viewBox="0 -40 320 300">
                <Burger size={320} />
              </svg>
            </div>
            <div style={{ position: "absolute", left: 10, top: 260, width: 50, height: 50, borderRadius: "50%", background: C.white, border: ink(6) }} />
            <div style={{ position: "absolute", left: -20, top: 320, width: 28, height: 28, borderRadius: "50%", background: C.white, border: ink(5) }} />
          </div>
        </>
      )}
    </Shot>
  );
};

// ================================================================ 4. no ground beef
export const B4: React.FC = () => {
  const frame = useCurrentFrame();
  const open = ease(frame, [w(4, "fridge") - 2, w(4, "fridge") + 10], [0, 1]);
  const no = w(4, "no");
  const gone = w(4, "gone");
  const stamp = useSp(gone, theme.spring.bouncy);
  const tag = useSp(no, theme.spring.bouncy);
  return (
    <Shot cuts={[0, no, w(4, "not"), gone]} hits={[gone]}>
      <DinerBg floorY={1480} />
      <div style={{ position: "absolute", left: 250, top: 330, width: 580, height: 1080 }}>
        <div style={{ position: "absolute", inset: 0, background: "#EAF6FF", border: ink(10), borderRadius: 30, overflow: "hidden" }}>
          {[260, 520, 780].map((y) => (
            <div key={y} style={{ position: "absolute", left: 30, right: 30, top: y, height: 16, background: "#B9D8EA", border: ink(5), borderRadius: 8 }} />
          ))}
          {/* the empty ground-beef tray */}
          <div style={{ position: "absolute", left: 110, top: 400, width: 360, height: 110, background: C.white, border: ink(6), borderRadius: 16, transform: `scale(${tag})` }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontFamily: theme.fonts.display, fontSize: 46, color: C.ink }}>{tr("GROUND BEEF", "لحمة مفرومة")}</div>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${C.mint}, #A7E8D5)`, border: ink(10), borderRadius: 30, transformOrigin: "0% 50%", transform: `rotateY(${-open * 105}deg)`, backfaceVisibility: "hidden" }} />
        </div>
      </div>
      {frame >= w(4, "not") && frame < gone && <Slam at={w(4, "not")} words={tr("NOT LOW.", "مش قليلة.").split(" ")} colors={[C.cream, C.cream]} top={620} size={170} />}
      {frame >= gone && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center", transform: `scale(${interpolate(stamp, [0, 1], [3, 1])}) rotate(-10deg)`, opacity: Math.min(1, stamp * 3) }}>
          <Card bg={C.cherry} style={{ padding: "20px 60px" }}>
            <Display size={220} stroke={12}>{tr("GONE.", "خلصانة.")}</Display>
          </Card>
        </div>
      )}
      <Flash at={gone} peak={0.5} />
    </Shot>
  );
};

// ================================================================ 5. the manager's rule
export const B5: React.FC = () => {
  const frame = useCurrentFrame();
  const rule = w(5, "rule");
  const never = w(5, "never", 1);
  const creative = w(5, "creative");
  const gets = w(5, "gets");
  const shout = frame >= never ? 1 : frame >= rule ? 0.5 + 0.3 * Math.abs(Math.sin(frame / 3)) : 0.15;
  const poster = useSp(rule, theme.spring.bouncy);
  const bob = useBob(12, 5);
  const flashback = frame < gets;
  return (
    <Shot cuts={[0, rule, never, gets, creative]} enter="zoom" hits={[never, creative]}>
      {flashback ? (
        <>
          <DinerBg />
          <Stage>
            <Boss x={360} y={640 + bob} size={500} shout={shout} />
          </Stage>
          <div style={{ position: "absolute", left: 60, top: 380, width: 420, transform: `scale(${poster}) rotate(-5deg)` }}>
            <Card bg={C.cream} style={{ padding: "24px 26px" }}>
              <div style={{ fontFamily: theme.fonts.display, fontSize: 52, color: C.cherry, textAlign: "center" }}>{tr("RULE #1", "القاعدة رقم ١")}</div>
              <div style={{ fontFamily: theme.fonts.display, fontSize: 58, lineHeight: 1.05, color: C.ink, textAlign: "center", marginTop: 8 }}>{tr("NEVER TURN A CUSTOMER AWAY", "عمرك ما ترجّع زبون")}</div>
            </Card>
          </div>
          {frame >= never && <Slam at={never} words={[tr("NEVER.", "أبدًا.")]} colors={[C.cherry]} top={1000} size={200} rotate={-6} />}
          {/* flashback treatment: sepia wash + wobbling vignette */}
          <AbsoluteFill style={{ background: "rgba(140,90,30,0.22)", mixBlendMode: "multiply" }} />
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent ${52 + Math.sin(frame / 6) * 3}%, rgba(60,35,10,0.55) 100%)` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
            <Card bg={C.ink} style={{ padding: "8px 24px" }}>
              <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 40, color: C.cream, letterSpacing: isAr() ? 0 : 4 }}>{tr("THE MANAGER", "المدير")}</div>
            </Card>
          </div>
        </>
      ) : (
        <>
          <SunburstBg color={C.navy} ray="#26386A" />
          <Stage>
            <Ray x={250} y={680 + bob} size={580} grin={frame >= creative ? 1 : 0} look={frame >= creative ? 1 : 0} worry={frame >= creative ? 0 : 0.7} />
            {frame >= creative && (
              <g transform={`translate(800 560) scale(${spring({ frame: frame - creative, fps: 30, config: theme.spring.bouncy })})`}>
                <circle cx={0} cy={0} r={70} fill={C.mustard} stroke={C.ink} strokeWidth={8} />
                <rect x={-28} y={60} width={56} height={40} rx={8} fill="#9AA5B1" stroke={C.ink} strokeWidth={6} />
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={i} x1={0} y1={-100} x2={0} y2={-130} stroke={C.mustard} strokeWidth={10} strokeLinecap="round" transform={`rotate(${i * 45})`} />
                ))}
              </g>
            )}
          </Stage>
          {frame >= creative && <Slam at={creative} words={[tr("CREATIVE", "اتصرّف!")]} colors={[C.mustard]} top={380} size={170} rotate={-4} />}
        </>
      )}
    </Shot>
  );
};

// ================================================================ 6. earlier that day: the squirrel out back
const Fly: React.FC<{ cx: number; cy: number; t: number; k: number }> = ({ cx, cy, t, k }) => (
  <g transform={`translate(${cx + Math.cos(t / 6 + k * 2) * 60} ${cy + Math.sin(t / 4 + k) * 30})`}>
    <circle r={7} fill={C.ink} />
    <ellipse cx={-6} cy={-8} rx={7} ry={4} fill={C.white} opacity={0.8} />
    <ellipse cx={6} cy={-8} rx={7} ry={4} fill={C.white} opacity={0.8} />
  </g>
);

export const B6: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(6);
  const dead = w(6, "dead");
  const card = useSp(0, theme.spring.bouncy);
  const pop = useSp(dead - 2, theme.spring.bouncy);
  const bob = useBob(14, 5);
  return (
    <Shot cuts={[0, c[1], dead, w(6, "trash")]} hits={[dead]} focusY={900}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #8FD3FF, #CDEFFF)" }}>
        <div style={{ position: "absolute", right: 110, top: 300, width: 160, height: 160, borderRadius: "50%", background: C.mustard, border: ink(6), boxShadow: `0 0 80px ${C.mustard}` }} />
        {/* fence + yard */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, height: 380, background: `repeating-linear-gradient(90deg, ${C.creamDeep} 0 90px, ${C.ink} 90px 98px)`, borderTop: ink(), borderBottom: ink() }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1200, bottom: 0, background: C.lettuce, borderTop: ink() }} />
        <div style={{ position: "absolute", left: 0, top: 560, width: 300, height: 640, background: C.cream, border: ink(), borderLeft: "none" }}>
          <div style={{ position: "absolute", left: 120, top: 240, width: 140, height: 400, background: C.brown, border: ink(6) }} />
        </div>
      </AbsoluteFill>
      <Stage>
        <TrashCan x={620} y={960} size={260} />
        {frame < c[1] ? (
          <Ray x={130} y={760 + bob} size={380} look={1} />
        ) : (
          <>
            <Ray x={-40} y={780 + bob} size={340} look={1} worry={0.5} />
            <g transform={`translate(560 1240) scale(${pop}) translate(-560 -1240)`}>
              <g transform="rotate(90 470 1150)">
                <Squirrel x={330} y={1010} size={300} dead />
              </g>
            </g>
            {frame >= dead && [0, 1, 2].map((k) => <Fly key={k} cx={450} cy={1020} t={frame} k={k} />)}
          </>
        )}
      </Stage>
      {frame < c[1] && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", transform: `scale(${card}) rotate(-3deg)` }}>
          <Card bg={C.mustard}>
            <Display size={90} color={C.ink} stroke={0} style={{ textShadow: "none" }}>{tr("EARLIER THAT DAY…", "الصبح بدري…")}</Display>
          </Card>
        </div>
      )}
      {/* flashback tint */}
      <AbsoluteFill style={{ background: "rgba(140,90,30,0.14)", mixBlendMode: "multiply" }} />
      <Flash at={dead} peak={0.35} />
    </Shot>
  );
};
