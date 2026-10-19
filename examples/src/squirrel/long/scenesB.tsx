// Beats 7–12: the act → hospital → headline → the legend → why teams do it → who pays.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Display, ease, useBob, useSp } from "../motion";
import { DarkBg, DinerBg, SunburstBg } from "../bg";
import { Burger, IconCustomer, IconStore, IconTeam, OldMan, Person, Ray, Squirrel } from "../art";
import { Clock } from "../scenes";
import { Bug, Calendar, Grinder, Laptop, Scissors } from "./art2";
import { Card, Flash, Shot, Slam, SpeedLines } from "./kit";
import { cuts, isAr, tr, w } from "./timing";

const C = theme.colors;
const ink = (n = 8) => `${n}px solid ${C.ink}`;
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }} overflow="visible">
    {children}
  </svg>
);
const segOf = (frame: number, marks: number[]) => {
  let k = 0;
  marks.forEach((m, i) => {
    if (frame >= m) k = i;
  });
  return k;
};
const sp = (frame: number, at: number, cfg: { damping: number; stiffness: number; mass: number } = theme.spring.bouncy) =>
  spring({ frame: frame - at, fps: 30, config: cfg });
const Label: React.FC<{ top?: number; bg?: string; children: React.ReactNode }> = ({ top = 380, bg = C.mustard, children }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
    <Card bg={bg}>
      <Display size={84} color={C.ink} stroke={0} style={{ textShadow: "none" }}>
        {children}
      </Display>
    </Card>
  </div>
);

// ================================================================ 7. grill · bun · serve · bite
const Flames: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {Array.from({ length: 7 }).map((_, i) => {
      const h = 60 + Math.abs(Math.sin(frame / 3 + i * 1.3)) * 50;
      const x = 270 + i * 90;
      return <path key={i} d={`M${x - 30} 1120 Q ${x} ${1120 - h * 1.6} ${x + 30} 1120 Z`} fill={i % 2 ? C.mustard : C.cherry} stroke={C.ink} strokeWidth={5} />;
    })}
  </g>
);

export const B7: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(7);
  const seg = segOf(frame, c);
  const bite = w(7, "bite");
  const slide = sp(frame, c[3], theme.spring.snappy);
  const chomp = sp(frame, bite);
  const mouth = frame < bite - 10 ? 0.1 : frame < bite ? ease(frame, [bite - 10, bite], [0.1, 1]) : ease(frame, [bite, bite + 5], [1, 0.1]);
  const bob = useBob(14, 6);
  const chop = frame - c[0];
  return (
    <Shot cuts={[...c, bite]} enter="cut" hits={[c[0] + 8, c[0] + 16, c[1], bite]}>
      <DinerBg />
      {seg === 0 && (
        <>
          {/* kept off-screen: just Ray's shadow behind the frosted kitchen door */}
          <div style={{ position: "absolute", left: 240, top: 400, width: 600, height: 1000, background: C.brown, border: ink(10), borderRadius: 16 }}>
            <div style={{ position: "absolute", left: 60, top: 70, width: 480, height: 520, background: "#E9F4F8", border: ink(8), borderRadius: 12, overflow: "hidden" }}>
              <svg width={480} height={520} viewBox="0 0 480 520">
                <g opacity={0.55} transform={`translate(0 ${Math.abs(Math.sin(chop / 3)) * 8})`}>
                  <circle cx={240} cy={210} r={80} fill={C.ink} />
                  <circle cx={240} cy={100} r={60} fill={C.ink} />
                  <rect x={140} y={280} width={200} height={260} rx={60} fill={C.ink} />
                  <g transform={`rotate(${-30 + Math.abs(Math.sin(chop / 3)) * 60} 330 300)`}>
                    <rect x={320} y={180} width={26} height={130} rx={12} fill={C.ink} />
                    <path d="M325 180 L 345 180 L 336 90 Z" fill={C.ink} />
                  </g>
                </g>
              </svg>
            </div>
            <div style={{ position: "absolute", left: 230, top: 640, width: 140, height: 50, background: C.cream, border: ink(5), borderRadius: 8, textAlign: "center", fontFamily: theme.fonts.display, fontSize: 32, lineHeight: "50px", color: C.ink }}>{tr("KITCHEN", "المطبخ")}</div>
          </div>
          {[8, 16].map((d, i) => (
            <div key={d} style={{ position: "absolute", left: i ? 640 : 110, top: i ? 520 : 760, transform: `scale(${sp(frame, c[0] + d)}) rotate(${i ? 10 : -10}deg)` }}>
              <Display size={130} color={C.mustard}>{i ? tr("SHHK!", "شَق!") : tr("CHOP!", "طاخ!")}</Display>
            </div>
          ))}
        </>
      )}
      {seg === 1 && (
        <>
          <Stage>
            <Grinder x={240} y={460} size={600} crank={frame * 24} />
            {Array.from({ length: 6 }).map((_, i) => {
              const t = (frame * 3 + i * 18) % 108;
              return <rect key={i} x={500 + Math.sin(i * 2) * 20} y={1000 + t * 1.6} width={70} height={26} rx={13} fill={C.patty} stroke={C.ink} strokeWidth={5} opacity={t < 90 ? 1 : 0} />;
            })}
            <ellipse cx={540} cy={1300} rx={240} ry={30} fill={C.white} stroke={C.ink} strokeWidth={6} />
            <ellipse cx={540} cy={1280} rx={130} ry={34} fill={C.patty} stroke={C.ink} strokeWidth={6} />
          </Stage>
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", transform: `scale(${sp(frame, c[1] + 2)}) rotate(-4deg)` }}>
            <Display size={130} color={C.mustard}>{tr("GRRRIND", "فررررم")}</Display>
          </div>
        </>
      )}
      {seg === 2 && (
        <Stage>
          <rect x={160} y={1100} width={760} height={90} rx={20} fill="#3B3B45" stroke={C.ink} strokeWidth={8} />
          <Flames frame={frame} />
          <rect x={140} y={960} width={800} height={60} rx={14} fill="#55555F" stroke={C.ink} strokeWidth={8} />
          <ellipse cx={540} cy={930 + Math.sin(frame / 2) * 3} rx={170} ry={44} fill={C.patty} stroke={C.ink} strokeWidth={8} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${440 + i * 100} ${860 - ((frame * 4 + i * 30) % 120)} q 20 -30 0 -60 q -20 -30 0 -60`} fill="none" stroke={C.white} strokeWidth={10} strokeLinecap="round" opacity={0.8} />
          ))}
        </Stage>
      )}
      {seg >= 3 && (
        <>
          <ClosingTint />
          <Stage>
            <OldMan x={240} y={420 + bob} size={600} open={mouth} />
            <g transform={`translate(${interpolate(slide, [0, 1], [-1100, 0])} ${ease(frame, [bite - 12, bite], [0, -190], theme.ease.inOut)})`}>
              <ellipse cx={540} cy={1250} rx={300} ry={32} fill={C.white} stroke={C.ink} strokeWidth={6} />
              <Burger x={300} y={780} size={480} />
            </g>
          </Stage>
          <div style={{ position: "absolute", left: 40, right: 40, top: 1290, height: 70, background: C.cherry, border: ink(), borderRadius: 18 }} />
          {frame >= bite && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", transform: `scale(${chomp}) rotate(-6deg)` }}>
              <Display size={190} color={C.mustard}>{tr("CHOMP!", "هَمّ!")}</Display>
            </div>
          )}
          <SpeedLines at={bite} />
          <Flash at={bite} peak={0.6} />
        </>
      )}
    </Shot>
  );
};

// after-hours dimming for the diner
const ClosingTint: React.FC = () => <AbsoluteFill style={{ background: "rgba(16,25,53,0.22)" }} />;

// ================================================================ 8. three hours later
const Ambulance: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={560} height={300} viewBox="0 0 560 300" overflow="visible">
    <rect x={10} y={60} width={380} height={190} rx={20} fill={C.white} stroke={C.ink} strokeWidth={8} />
    <path d="M390 120 L 480 120 L 540 190 L 540 250 L 390 250 Z" fill={C.white} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <rect x={10} y={180} width={530} height={26} fill={C.cherry} stroke={C.ink} strokeWidth={6} />
    <path d="M170 90 h 40 v 30 h 30 v 40 h -30 v 30 h -40 v -30 h -30 v -40 h 30 Z" fill={C.cherry} stroke={C.ink} strokeWidth={6} />
    <rect x={120} y={32} width={60} height={30} rx={8} fill={Math.floor(frame / 4) % 2 ? C.cherry : "#5A1C22"} stroke={C.ink} strokeWidth={6} />
    <rect x={210} y={32} width={60} height={30} rx={8} fill={Math.floor(frame / 4) % 2 ? "#1B2C66" : C.siren} stroke={C.ink} strokeWidth={6} />
    {[110, 440].map((cx) => (
      <g key={cx} transform={`rotate(${frame * 30} ${cx} 256)`}>
        <circle cx={cx} cy={256} r={42} fill={C.ink} />
        <circle cx={cx} cy={256} r={16} fill="#D9D9D9" />
      </g>
    ))}
  </svg>
);

export const B8: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(8);
  const seg = segOf(frame, c);
  const amb = ease(frame, [c[1], c[1] + 30], [-700, 1200], theme.ease.inOut);
  const flash = frame >= c[1] ? (Math.floor(frame / 4) % 2 ? C.cherry : C.siren) : "transparent";
  return (
    <Shot cuts={c} enter="zoom" hits={[c[1]]}>
      {seg === 0 ? (
        <>
          <SunburstBg color={C.navy} ray="#26386A" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center", transform: `scale(1.8) rotate(${frame * 12}deg)` }}>
            <Clock t={frame * 30} />
          </div>
          <Slam at={4} words={tr("3 HOURS LATER", "بعد ٣ ساعات").split(" ")} colors={isAr() ? [C.cream, C.mustard, C.cream] : [C.mustard, C.cream, C.cream]} top={820} size={150} />
        </>
      ) : (
        <>
          <DarkBg tint={C.cherry} />
          <div style={{ position: "absolute", left: 140, right: 140, top: 380, height: 800, transform: `scale(${sp(frame, c[1])})`, transformOrigin: "50% 100%" }}>
            <div style={{ position: "absolute", inset: 0, background: C.cream, border: ink(10), borderRadius: "30px 30px 0 0" }}>
              {[0, 1, 2].map((r) =>
                [0, 1, 2].map((k) => (
                  <div key={`${r}${k}`} style={{ position: "absolute", left: 60 + k * 220, top: 280 + r * 150, width: 120, height: 90, background: (r + k) % 2 ? C.mustard : "#FFE08A", border: ink(6), borderRadius: 10 }} />
                )),
              )}
            </div>
            <div style={{ position: "absolute", left: "50%", top: 50, transform: "translateX(-50%)", width: 180, height: 180, background: C.white, border: ink(8), borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={120} height={120} viewBox="0 0 100 100">
                <path d="M35 8 h 30 v 27 h 27 v 30 h -27 v 27 h -30 v -27 h -27 v -30 h 27 Z" fill={C.cherry} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1180, bottom: 0, background: "#2A2F45", borderTop: ink() }} />
          <div style={{ position: "absolute", left: amb, top: 940 }}>
            <Ambulance frame={frame} />
          </div>
          <AbsoluteFill style={{ background: flash, opacity: 0.2, mixBlendMode: "screen" }} />
        </>
      )}
    </Shot>
  );
};

// ================================================================ 9. the headline
export const B9: React.FC = () => {
  const frame = useCurrentFrame();
  const spin = sp(frame, 0, { damping: 16, stiffness: 80, mass: 1 });
  const sign = w(9, "sign");
  const hit = w(9, "whole");
  const circle = ease(frame, [sign - 2, sign + 12], [0, 1]);
  const crack = ease(frame, [hit + 4, hit + 16], [0, 1]);
  const chart = ease(frame, [hit + 6, hit + 30], [0, 1], theme.ease.inOut);
  return (
    <Shot cuts={[0, w(9, "ray"), sign, hit]} hits={[hit + 6]} focusY={1000}>
      <DarkBg tint={C.navy} />
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 330,
          width: 860,
          height: 1000,
          background: "#F7F0E1",
          border: ink(10),
          borderRadius: 12,
          transform: `rotate(${interpolate(spin, [0, 1], [720, -3])}deg) scale(${interpolate(spin, [0, 1], [0.1, 1])})`,
          boxShadow: `18px 18px 0 ${C.ink}`,
          padding: 40,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontFamily: theme.fonts.display, fontSize: 70, textAlign: "center", color: C.ink, borderBottom: ink(6), paddingBottom: 14 }}>{tr("THE DAILY GRILL", "جريدة الشوّاية")}</div>
        <div style={{ fontFamily: theme.fonts.display, fontSize: 104, lineHeight: 0.98, textAlign: "center", color: C.ink, marginTop: 24 }}>
          {tr("BURGER JOINT SERVES ", "مطعم برغر يقدّم ")}<span style={{ color: C.cherry }}>{tr("SQUIRREL!", "سنجابًا!")}</span>
        </div>
        <div style={{ position: "relative", marginTop: 30, height: 380, background: C.navy, border: ink(6), borderRadius: 8, overflow: "visible" }}>
          <div style={{ position: "absolute", left: 130, top: 110, right: 130, height: 170, background: C.navyDeep, border: ink(8), borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <span style={{ fontFamily: theme.fonts.display, fontSize: 120, color: "#FFE3F0", textShadow: `0 0 18px ${C.neon}` }}>{tr("RAY'S", "راي")}</span>
            <svg style={{ position: "absolute", inset: 0 }} width={512} height={170} viewBox="0 0 512 170">
              <path d="M256 0 L 236 60 L 280 90 L 244 170" fill="none" stroke={C.cream} strokeWidth={10} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} />
            </svg>
          </div>
          <svg style={{ position: "absolute", left: 90, top: 70 }} width={600} height={250} viewBox="0 0 600 250" overflow="visible">
            <ellipse cx={300} cy={125} rx={290} ry={120} fill="none" stroke={C.cherry} strokeWidth={14} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circle} transform="rotate(-4 300 125)" />
          </svg>
        </div>
      </div>
      {/* brand value chart crashes */}
      {frame >= hit && (
        <div style={{ position: "absolute", left: 160, right: 200, top: 860, transform: `scale(${sp(frame, hit)}) rotate(4deg)` }}>
          <Card bg={C.white} style={{ padding: 20 }}>
            <svg width={640} height={300} viewBox="0 0 640 300">
              <path d="M20 60 L 160 40 L 260 70 L 340 150 L 440 170 L 620 280" fill="none" stroke={C.cherry} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - chart} />
              <path d="M590 250 L 625 285 L 575 290" fill="none" stroke={C.cherry} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={chart > 0.95 ? 1 : 0} />
            </svg>
          </Card>
        </div>
      )}
    </Shot>
  );
};

// ================================================================ 10. the legend
export const B10: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(10);
  const seg = segOf(frame, c);
  const legend = c[4];
  const every = w(10, "every");
  return (
    <Shot cuts={[...c, every]} enter="cut" hits={[0, legend]}>
      {seg === 0 && (
        <>
          <SunburstBg color={C.navy} ray="#26386A" />
          <AbsoluteFill style={{ filter: "grayscale(1)", background: "rgba(0,0,0,0.25)" }} />
          <Slam at={0} words={[tr("WAIT.", "انتظر.")]} colors={[C.mustard]} top={560} size={260} rotate={-4} />
          <Slam at={10} words={tr("IS THIS REAL?", "هل هي حقيقية؟").split(" ")} colors={[C.cream, C.cream, C.cream]} top={900} size={120} rotate={2} />
        </>
      )}
      {seg === 1 && (
        <>
          <DinerBg />
          <div style={{ position: "absolute", left: 80, right: 120, top: 360, height: 760, background: C.white, border: ink(10), borderRadius: 24, boxShadow: `0 14px 0 ${C.ink}`, display: "flex", padding: 20, gap: 16, boxSizing: "border-box" }}>
            {(isAr() ? ["للتنفيذ", "قيد العمل", "تم"] : ["TO DO", "DOING", "DONE"]).map((col, i) => (
              <div key={col} style={{ flex: 1, background: C.creamDeep, borderRadius: 14, border: ink(5), padding: 12, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
                <div style={{ fontFamily: theme.fonts.display, fontSize: 48, color: C.ink }}>{col}</div>
                {Array.from({ length: 3 - i }).map((_, k) => {
                  const p = sp(frame, c[1] + 4 + (i * 3 + k) * 3);
                  return <div key={k} style={{ width: "88%", height: 120, background: [C.mustard, C.mint, "#FFB3C7"][(i + k) % 3], border: ink(5), borderRadius: 8, transform: `scale(${p}) rotate(${(k % 2 ? 3 : -3)}deg)` }} />;
                })}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center", transform: `scale(${sp(frame, w(10, "ken"))})` }}>
            <Card bg={C.ink} style={{ padding: "14px 30px" }}>
              <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 46, color: C.cream, textAlign: "center" }}>
                {tr("KEN SCHWABER · ", "كين شوابر · ")}<span style={{ color: C.mustard }}>{tr("CO-CREATOR OF SCRUM", "أحد مؤسسي سكرم")}</span>
              </div>
            </Card>
          </div>
        </>
      )}
      {(seg === 2 || seg === 3) && (
        <>
          <DarkBg tint={C.mint} />
          <div style={{ position: "absolute", left: 90, right: 130, top: 420, transform: `scale(${sp(frame, c[2])})` }}>
            <Card bg={C.white} style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ width: 110, height: 110, borderRadius: "50%", background: C.mint, border: ink(6), flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 36, color: "#7A7A7A" }}>{tr("a curious reader · 2015", "قارئ فضولي · ٢٠١٥")}</div>
                <div style={{ fontFamily: theme.fonts.display, fontSize: 72, color: C.ink }}>{tr("Is this story real??", "هل القصة حقيقية؟؟")}</div>
              </div>
            </Card>
          </div>
          {seg === 3 && (
            <div style={{ position: "absolute", left: 200, right: 130, top: 760, transform: `scale(${sp(frame, c[3])})` }}>
              <Card bg={C.mustard} style={{ display: "flex", gap: 22, justifyContent: "center" }}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{ width: 44, height: 44, borderRadius: 22, background: C.ink, transform: `translateY(${Math.sin(frame / 3 + d) * 10}px)` }} />
                ))}
              </Card>
            </div>
          )}
        </>
      )}
      {seg === 4 && (
        <>
          <SunburstBg color={C.mustard} ray="#F7C964" />
          {frame < every ? (
            <>
              <Slam at={legend} words={isAr() ? ["«إنها", "أسطورة.»"] : ["“IT'S", "A", "LEGEND.”"]} colors={isAr() ? [C.cream, C.cherry] : [C.cream, C.cream, C.cherry]} top={620} size={170} />
              {[0, 1, 2, 3, 4].map((k) => {
                const a = (k / 5) * Math.PI * 2 + frame / 20;
                return <div key={k} style={{ position: "absolute", left: 520 + Math.cos(a) * 420, top: 760 + Math.sin(a) * 360, fontSize: 70, color: C.cream, transform: `scale(${0.6 + 0.4 * Math.sin(frame / 4 + k)})`, fontFamily: theme.fonts.display, WebkitTextStroke: `6px ${C.ink}`, paintOrder: "stroke fill" }}>✦</div>;
              })}
            </>
          ) : (
            <Stage>
              {Array.from({ length: 6 }).map((_, i) => {
                const x = 90 + (i % 2) * 480;
                const y = 360 + Math.floor(i / 2) * 330;
                const p = sp(frame, every + i * 4);
                return (
                  <g key={i} transform={`translate(${x + 140} ${y + 100}) scale(${p}) translate(${-x - 140} ${-y - 100})`}>
                    <Laptop x={x} y={y + 60} size={300} glow={i % 2 ? C.mint : C.cream} />
                    <Squirrel x={x + 90} y={y - 20 + Math.sin(frame / 6 + i) * 6} size={130} tail={Math.sin(frame / 4 + i) * 10} />
                  </g>
                );
              })}
            </Stage>
          )}
        </>
      )}
    </Shot>
  );
};

// ================================================================ 11. why teams do it
export const B11: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(11);
  const seg = segOf(frame, c);
  const bob = useBob(12, 6);
  return (
    <Shot cuts={c} enter="whip" hits={[c[4] + 8]}>
      <DinerBg />
      {seg === 0 && <Slam at={2} words={tr("THINK ABOUT IT.", "فكّر في الأمر.").split(" ")} colors={[C.cream, C.cream, C.mustard]} top={640} size={170} />}
      {seg === 1 && (
        <Stage>
          <g transform={`translate(540 860) scale(${sp(frame, c[1])}) translate(-540 -860)`}>
            <Calendar x={240} y={560} size={600} label={tr("DEADLINE", "الموعد")} circled={ease(frame, [c[1] + 8, c[1] + 22], [0, 1])} locked />
          </g>
        </Stage>
      )}
      {seg === 2 && (
        <>
          <Stage>
            <rect x={290} y={900} width={500} height={330} rx={20} fill={C.brown} stroke={C.ink} strokeWidth={8} />
            {Array.from({ length: 9 }).map((_, i) => {
              const p = sp(frame, c[2] + i * 2, theme.spring.snappy);
              const tx = 540 + (i - 4) * 70 + Math.sin(i) * 30;
              const ty = 900 - p * (180 + (i % 3) * 120);
              return <rect key={i} x={tx - 70} y={ty - 50} width={140} height={100} rx={8} fill={[C.mustard, C.mint, "#FFB3C7"][i % 3]} stroke={C.ink} strokeWidth={6} transform={`rotate(${(i - 4) * 9} ${tx} ${ty})`} />;
            })}
            <rect x={270} y={880} width={540} height={60} rx={12} fill="#8A4F2C" stroke={C.ink} strokeWidth={8} />
          </Stage>
          <Label top={380} bg={C.cream}>{tr("TOO MUCH WORK", "عمل كثير")}</Label>
        </>
      )}
      {seg === 3 && (
        <Stage>
          {[0, 1, 2].map((i) => {
            const x = 120 + i * 300;
            return (
              <g key={i}>
                <Person x={x} y={640 + Math.sin(frame / 8 + i) * 4} size={240} color={[C.mint, C.mustard, C.cherry][i]} />
                <path d={`M${x + 70} ${780} L ${x + 170} ${780}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
                {[0, 1, 2, 3, 4].map((k) => (
                  <path key={k} d={`M${x + 80 + k * 20} 770 L ${x + 80 + k * 20} 790`} stroke={C.ink} strokeWidth={5} />
                ))}
              </g>
            );
          })}
        </Stage>
      )}
      {seg === 4 && (
        <>
          <div style={{ position: "absolute", left: 140, top: 760, transform: `translateX(${-ease(frame, [c[4] + 8, c[4] + 20], [0, 120])}px) rotate(${-ease(frame, [c[4] + 8, c[4] + 20], [0, 12])}deg)` }}>
            <Card bg={C.mustard} style={{ width: 280, textAlign: "right", borderRight: "none", borderRadius: "28px 0 0 28px" }}>
              <Display size={110} color={C.ink} stroke={0} style={{ textShadow: "none" }}>{tr("QUAL", "دة")}</Display>
            </Card>
          </div>
          <div style={{ position: "absolute", left: 500, top: 760, transform: `translateX(${ease(frame, [c[4] + 8, c[4] + 20], [0, 120])}px) rotate(${ease(frame, [c[4] + 8, c[4] + 20], [0, 12])}deg)` }}>
            <Card bg={C.mustard} style={{ width: 280, textAlign: "left", borderLeft: "none", borderRadius: "0 28px 28px 0" }}>
              <Display size={110} color={C.ink} stroke={0} style={{ textShadow: "none" }}>{tr("ITY", "الجو")}</Display>
            </Card>
          </div>
          <Stage>
            <Scissors x={ease(frame, [c[4], c[4] + 10], [-300, 360])} y={560} size={360} open={Math.abs(Math.sin(frame / 3))} />
          </Stage>
        </>
      )}
      {seg === 5 && (
        <div style={{ position: "absolute", left: 160, right: 200, top: 380, transform: `scale(${sp(frame, c[5])})` }}>
          <Card bg={C.white} style={{ padding: 40 }}>
            <Display size={90} color={C.ink} stroke={0} style={{ textShadow: "none", textAlign: isAr() ? "right" : "left" }}>{tr("TESTS", "الاختبارات")}</Display>
            {(isAr() ? ["تسجيل الدخول يعمل", "الدفع يعمل", "لا سناجب"] : ["login works", "payment works", "no squirrels"]).map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 26 }}>
                <div style={{ width: 60, height: 60, border: ink(6), borderRadius: 10 }} />
                <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 52, color: C.ink, textDecoration: frame > c[5] + 6 + i * 4 ? "line-through" : "none", textDecorationColor: C.cherry, textDecorationThickness: 8 }}>{t}</div>
              </div>
            ))}
            <div style={{ fontFamily: theme.fonts.display, fontSize: 80, color: C.cherry, marginTop: 20, transform: `scale(${sp(frame, c[5] + 18)})` }}>{tr("SKIPPED", "تم تخطيها")}</div>
          </Card>
        </div>
      )}
      {seg === 6 && (
        <Stage>
          <rect x={300} y={960} width={480} height={300} rx={14} fill={C.brown} stroke={C.ink} strokeWidth={8} />
          <text x={540} y={1140} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={78} fill={C.cream} stroke={C.ink} strokeWidth={4} paintOrder="stroke">{tr("RELEASE", "الإصدار")}</text>
          <g transform={`translate(0 ${-sp(frame, c[6] + 4) * 300})`}>
            <Bug x={420} y={760} size={240} t={frame} />
          </g>
        </Stage>
      )}
      {seg === 7 && (
        <Stage>
          <path d={`M180 1200 Q 540 ${1060 + Math.sin(frame / 3) * 10} 900 1200 Z`} fill={C.cherry} stroke={C.ink} strokeWidth={8} />
          <Person x={720} y={760 + bob} size={200} color={C.mint} />
          {[0, 1].map((k) => (
            <text key={k} x={880 + k * 50} y={760 - ((frame * 2 + k * 30) % 100)} fontFamily={theme.fonts.display} fontSize={70} fill={C.ink}>♪</text>
          ))}
          <g opacity={0.9}>
            <path d="M500 1110 l -26 -30 M560 1110 l 26 -30" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          </g>
        </Stage>
      )}
    </Shot>
  );
};

// ================================================================ 12. who pays
const PayCard: React.FC<{ at: number; x: number; label: string; children: React.ReactNode }> = ({ at, x, label, children }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at);
  const crack = ease(frame, [at + 4, at + 14], [0, 1]);
  return (
    <div style={{ position: "absolute", left: x, top: 900, width: 280, height: 330, transform: `scale(${p}) rotate(${(1 - p) * 20}deg)`, opacity: Math.min(1, p * 2) }}>
      <div style={{ position: "absolute", inset: 0, background: C.cream, border: ink(), borderRadius: 30, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: `0 12px 0 ${C.ink}` }}>
        {children}
        <div style={{ fontFamily: theme.fonts.display, fontSize: 50, color: C.ink }}>{label}</div>
      </div>
      <svg style={{ position: "absolute", inset: 0 }} width={280} height={330} viewBox="0 0 280 330">
        <path d="M150 0 L 130 60 L 165 100 L 120 150" fill="none" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} />
      </svg>
    </div>
  );
};

const Eye: React.FC<{ x: number; open: number; look: number }> = ({ x, open, look }) => (
  <g>
    <ellipse cx={x} cy={600} rx={150} ry={150 * open} fill={C.white} stroke={C.ink} strokeWidth={10} />
    {open > 0.3 && <circle cx={x + look * 40} cy={610} r={60 * open} fill={C.ink} />}
  </g>
);

export const B12: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(12);
  const open = sp(frame, 4);
  return (
    <Shot cuts={c} enter="zoom" hits={[4, c[1], c[2], c[3]]}>
      <DarkBg />
      <Stage>
        <g transform={`translate(0 ${frame >= c[1] ? -120 : 0})`}>
          <Eye x={360} open={open} look={Math.sin(frame / 10)} />
          <Eye x={720} open={open} look={Math.sin(frame / 10)} />
        </g>
      </Stage>
      <PayCard at={c[1]} x={70} label={tr("CUSTOMER", "الزبون")}>
        <IconCustomer />
      </PayCard>
      <PayCard at={c[2]} x={400} label={tr("TEAM", "الفريق")}>
        <IconTeam />
      </PayCard>
      <PayCard at={c[3]} x={730} label={tr("BUSINESS", "الشركة")}>
        <IconStore />
      </PayCard>
    </Shot>
  );
};
