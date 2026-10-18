// Beats 1–6: hook → the night → pressure → no beef → the choice → the squirrel.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Display, ease, useBob, useSp } from "../motion";
import { DarkBg, DinerBg, NightBg } from "../bg";
import { Burger, Person, Ray, Squirrel } from "../art";
import { Clock } from "../scenes";
import { Boss, Calendar, Globe, Laptop, TrashCan } from "./art2";
import { Card, Flash, Shot, Slam, SpeedLines } from "./kit";
import { bLen, cuts, s, w } from "./timing";

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
          <Slam at={soft} words={["SOFTWARE", "TEAMS"]} colors={[C.mustard, C.cream]} top={380} size={120} />
        </>
      )}
    </Shot>
  );
};

// ================================================================ 2. the night
const RewindIcon: React.FC = () => (
  <svg width={200} height={120} viewBox="0 0 200 120">
    <path d="M100 10 L 10 60 L 100 110 Z M190 10 L 100 60 L 190 110 Z" fill={C.cream} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
  </svg>
);

export const B2: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = useSeg(2);
  const c = cuts(2);
  const bob = useBob(14, 6);
  const flip = (frame - c[2]) / 30;
  const pattyY = -Math.abs(Math.sin(flip * Math.PI * 1.6)) * 260;
  const colors = [C.mustard, C.mint, C.cherry, C.cream, C.mustard, C.mint, C.cream, C.cherry, C.mint];
  return (
    <Shot cuts={c} enter="zoom" hits={[c[3], c[4]]}>
      {seg === 0 && (
        <>
          <DinerBg />
          <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 6px, transparent 6px 14px)`, transform: `translateY(${(frame * 9) % 14}px)` }} />
          <AbsoluteFill style={{ filter: "grayscale(0.6)", background: "rgba(29,43,79,0.35)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <div style={{ transform: `translateX(${Math.sin(frame / 2) * 10}px)` }}>
              <RewindIcon />
            </div>
            <Display size={120} color={C.cream}>REWIND</Display>
          </div>
        </>
      )}
      {(seg === 1 || seg === 2) && (
        <>
          <DinerBg />
          <Stage>
            <Ray x={250} y={560 + bob} size={580} worry={0} look={0} grin={seg === 2 ? 1 : 0} />
            {seg === 2 && (
              <g transform={`translate(${760} ${700 + pattyY}) rotate(${flip * 720})`}>
                <ellipse cx={0} cy={0} rx={70} ry={26} fill={C.patty} stroke={C.ink} strokeWidth={6} />
              </g>
            )}
          </Stage>
          {seg === 1 && <Slam at={c[1]} words={["MEET", "RAY"]} colors={[C.cream, C.mustard]} top={380} size={150} />}
          {seg === 2 && <Slam at={c[2] + 4} words={["BURGER", "FLIPPER"]} colors={[C.cream, C.cream]} top={380} size={110} rotate={3} />}
        </>
      )}
      {seg === 3 && (
        <>
          <DinerBg />
          <Stage>
            <g transform={`translate(540 860) scale(${spring({ frame: frame - c[3], fps: 30, config: theme.spring.bouncy })}) translate(-540 -860)`}>
              <Calendar x={240} y={560} size={600} label="FRIDAY" />
            </g>
          </Stage>
        </>
      )}
      {seg === 4 && (
        <>
          <DarkBg tint={C.navy} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", transform: `scale(${2.6 * spring({ frame: frame - c[4], fps: 30, config: theme.spring.bouncy })})` }}>
            <Clock t={(frame - c[4]) * 4} />
          </div>
          <Slam at={c[4] + 6} words={["11:58", "PM"]} colors={[C.mustard, C.cream]} top={1000} size={130} rotate={0} />
        </>
      )}
      {seg === 5 && (
        <>
          <NightBg />
          <div style={{ position: "absolute", left: 140, right: 140, top: 380, height: 300, background: C.navyDeep, border: ink(10), borderRadius: 40, boxShadow: `0 0 0 10px ${C.neon}55` }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontFamily: theme.fonts.display, fontSize: 160, color: "#FFE3F0", textShadow: `0 0 18px ${C.neon}, 0 0 50px ${C.neon}` }}>RAY'S</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 48, letterSpacing: 8, color: "#D9FFF4", textShadow: `0 0 14px ${C.mint}` }}>BURGERS · OPEN LATE</div>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 760, height: 700, background: C.cream, border: ink(), borderRadius: "40px 40px 0 0" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: `repeating-linear-gradient(90deg, ${C.cherry} 0 80px, ${C.cream} 80px 160px)`, borderBottom: ink(), borderRadius: "34px 34px 0 0" }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1460, bottom: 0, background: "#2A2F45", borderTop: ink() }} />
          <Stage>
            {colors.map((col, i) => {
              const p = spring({ frame: frame - c[5] - i * 3, fps: 30, config: theme.spring.snappy });
              const row = i < 5 ? 0 : 1;
              const x = interpolate(p, [0, 1], [1300 + i * 120, (row ? 120 : 40) + (i % 5) * 190]);
              return <Person key={i} x={x} y={(row ? 1240 : 1080) + Math.sin(frame / 6 + i) * 6} size={row ? 130 : 110} color={col} hat={i % 3 === 1} />;
            })}
          </Stage>
        </>
      )}
    </Shot>
  );
};

// ================================================================ 3. pressure
export const B3: React.FC = () => {
  const frame = useCurrentFrame();
  const say = w(3, "nobody", 0);
  const big = w(3, "nobody", 1);
  const enter = useSp(0, theme.spring.snappy);
  const shout = frame >= big ? 1 : frame >= say ? 0.5 + 0.3 * Math.abs(Math.sin(frame / 3)) : 0.1;
  const bubble = useSp(say, theme.spring.bouncy);
  return (
    <Shot cuts={[0, say, big]} hits={[big]}>
      <DinerBg />
      <Stage>
        <Boss x={interpolate(enter, [0, 1], [1100, 300])} y={560} size={520} shout={shout} />
        <Ray x={-60} y={980} size={300} worry={1} sweat={1} t={frame} look={1} />
      </Stage>
      {frame < big && (
        <div style={{ position: "absolute", left: 90, right: 130, top: 380, transform: `scale(${bubble})`, transformOrigin: "70% 100%" }}>
          <Card bg={C.white}>
            <Display size={84} color={C.ink} stroke={0} style={{ textShadow: "none" }}>
              "NOBODY LEAVES WITHOUT A BURGER."
            </Display>
          </Card>
        </div>
      )}
      {frame >= big && <Slam at={big} words={["NOBODY."]} colors={[C.cherry]} top={380} size={220} rotate={-6} />}
      <SpeedLines at={big} />
      <Flash at={big} color={C.cherry} peak={0.4} />
    </Shot>
  );
};

// ================================================================ 4. no beef
export const B4: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(4);
  const open = ease(frame, [w(4, "fridge") - 2, w(4, "fridge") + 10], [0, 1]);
  const gone = w(4, "gone", 1);
  const stamp = useSp(gone, theme.spring.bouncy);
  return (
    <Shot cuts={[0, w(4, "beef"), w(4, "not"), gone]} hits={[gone]}>
      <DinerBg floorY={1480} />
      <div style={{ position: "absolute", left: 250, top: 330, width: 580, height: 1080 }}>
        <div style={{ position: "absolute", inset: 0, background: "#EAF6FF", border: ink(10), borderRadius: 30, overflow: "hidden" }}>
          {[260, 520, 780].map((y) => (
            <div key={y} style={{ position: "absolute", left: 30, right: 30, top: y, height: 16, background: "#B9D8EA", border: ink(5), borderRadius: 8 }} />
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${C.mint}, #A7E8D5)`, border: ink(10), borderRadius: 30, transformOrigin: "0% 50%", transform: `rotateY(${-open * 105}deg)`, backfaceVisibility: "hidden" }} />
        </div>
      </div>
      {frame >= w(4, "not") && frame < gone && <Slam at={w(4, "not")} words={["NOT", "LOW."]} colors={[C.cream, C.cream]} top={620} size={170} />}
      {frame >= gone && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center", transform: `scale(${interpolate(stamp, [0, 1], [3, 1])}) rotate(-10deg)`, opacity: Math.min(1, stamp * 3) }}>
          <Card bg={C.cherry} style={{ padding: "20px 60px" }}>
            <Display size={220} stroke={12}>GONE.</Display>
          </Card>
        </div>
      )}
      <Flash at={gone} peak={0.5} />
    </Shot>
  );
};

// ================================================================ 5. the choice
const AngryFace: React.FC<{ x: number; y: number; col: string; t: number }> = ({ x, y, col, t }) => (
  <g transform={`translate(${x} ${y + Math.sin(t / 2 + x) * 6})`}>
    <rect x={-60} y={60} width={120} height={160} rx={50} fill={col} stroke={C.ink} strokeWidth={6} />
    <circle cx={0} cy={20} r={56} fill={C.skin} stroke={C.ink} strokeWidth={6} />
    <path d="M-34 0 L -10 12 M34 0 L 10 12" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
    <circle cx={-20} cy={22} r={6} fill={C.ink} />
    <circle cx={20} cy={22} r={6} fill={C.ink} />
    <path d="M-20 52 Q 0 36 20 52" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
  </g>
);

export const B5: React.FC = () => {
  const frame = useCurrentFrame();
  const o1 = w(5, "option", 0);
  const o2 = w(5, "option", 1);
  const sorry = w(5, "sorry");
  const seg = frame < o1 ? 0 : frame < o2 ? 1 : 3;
  const q = useSp(o2, theme.spring.bouncy);
  return (
    <Shot cuts={[0, o1, sorry, o2]} enter="zoom">
      {seg === 0 && (
        <>
          <DinerBg />
          <Stage>
            <Ray x={250} y={700} size={560} worry={1} sweat={1} t={frame} look={Math.sin(frame / 6) > 0 ? 1 : -1} />
          </Stage>
          <Slam at={4} words={["2", "CHOICES"]} colors={[C.mustard, C.cream]} top={380} size={170} />
        </>
      )}
      {(seg === 1 || seg === 2) && (
        <>
          <DarkBg tint={C.cherry} />
          <Stage>
            {[160, 400, 640, 880].map((x, i) => (
              <AngryFace key={x} x={x} y={560} col={[C.mustard, C.mint, C.cherry, C.cream][i]} t={frame} />
            ))}
            {[280, 520, 760].map((x, i) => (
              <AngryFace key={x} x={x} y={760} col={[C.mint, C.cream, C.mustard][i]} t={frame + 9} />
            ))}
            <Ray x={330} y={1000} size={360} worry={1} sweat={1} t={frame} />
          </Stage>
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center" }}>
            <Card bg={C.mustard}>
              <Display size={90} color={C.ink} stroke={0} style={{ textShadow: "none" }}>OPTION 1</Display>
            </Card>
          </div>
          {frame >= sorry && (
            <div style={{ position: "absolute", left: 90, right: 130, top: 470, display: "flex", justifyContent: "center", transform: `scale(${spring({ frame: frame - sorry, fps: 30, config: theme.spring.bouncy })})` }}>
              <Card bg={C.white}>
                <Display size={78} color={C.ink} stroke={0} style={{ textShadow: "none" }}>"SORRY, WE'RE OUT."</Display>
              </Card>
            </div>
          )}
        </>
      )}
      {seg >= 3 && (
        <>
          <DarkBg tint={C.navy} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center" }}>
            <Card bg={C.mint}>
              <Display size={90} color={C.ink} stroke={0} style={{ textShadow: "none" }}>OPTION 2</Display>
            </Card>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", transform: `scale(${q * (1 + Math.sin(frame / 5) * 0.05)})` }}>
            <Display size={520} color={C.mustard} stroke={18}>?</Display>
          </div>
        </>
      )}
    </Shot>
  );
};

// ================================================================ 6. the squirrel on the trash can
export const B6: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(6);
  const sq = w(6, "squirrel");
  const light = ease(frame, [sq - 6, sq + 4], [0.25, 1]);
  const push = ease(frame, [0, bLen(6)], [1, 1.12], theme.ease.inOut);
  const pop = useSp(sq - 2, theme.spring.bouncy);
  return (
    <Shot cuts={[0, c[1], sq]} hits={[sq]} focusY={1000}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.navyDeep}, #26304F)`, transform: `scale(${push})` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1300, bottom: 0, background: "#3A3F55", borderTop: ink() }} />
        <div style={{ position: "absolute", left: 80, top: 260, width: 300, height: 1040, background: "#4A3B5C", border: ink(), }} />
        <div style={{ position: "absolute", right: 60, top: 400, width: 260, height: 900, background: "#4A3B5C", border: ink() }} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 380px 620px at 540px 1100px, rgba(255,236,170,${0.55 * light}), transparent 70%)` }} />
        <Stage>
          <TrashCan x={390} y={1000} size={300} />
          <g transform={`translate(540 1000) scale(${pop}) translate(-540 -1000)`}>
            <Squirrel x={420} y={790} size={240} tail={Math.sin(frame / 5) * 8} blink={Math.floor(frame / 40) % 4 === 3} />
          </g>
        </Stage>
        <AbsoluteFill style={{ background: `rgba(0,0,0,${0.45 * (1 - light)})` }} />
      </AbsoluteFill>
      {/* window frame: we're looking out from the kitchen */}
      <AbsoluteFill style={{ border: `60px solid ${C.cream}`, boxShadow: `inset 0 0 0 10px ${C.ink}` }} />
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, height: 30, background: C.cream, borderTop: ink(), borderBottom: ink() }} />
      <Flash at={sq} peak={0.35} />
    </Shot>
  );
};
