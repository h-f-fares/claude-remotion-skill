// Beats 13–17: three takeaways → punchline → loop back to the hook.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Display, ease, useBob } from "../motion";
import { DarkBg, DinerBg, SunburstBg } from "../bg";
import { Burger, Ray, Squirrel } from "../art";
import { Clock } from "../scenes";
import { Scissors } from "./art2";
import { Card, Flash, NumberBadge, Shot, Slam, SpeedLines } from "./kit";
import { bLen, cuts, isAr, tr, w } from "./timing";

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
const sp = (frame: number, at: number) => spring({ frame: frame - at, fps: 30, config: theme.spring.bouncy });

const Check: React.FC<{ size?: number; color?: string }> = ({ size = 60, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 50 50">
    <path d="M8 26 L 20 38 L 42 12" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Cross: React.FC<{ size?: number; color?: string }> = ({ size = 60, color = C.cherry }) => (
  <svg width={size} height={size} viewBox="0 0 50 50">
    <path d="M10 10 L 40 40 M40 10 L 10 40" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
  </svg>
);
const Tag: React.FC<{ bg: string; children: React.ReactNode; ok?: boolean; at: number; frame: number; rot?: number }> = ({ bg, children, ok, at, frame, rot = 0 }) => (
  <div style={{ transform: `scale(${sp(frame, at)}) rotate(${rot}deg)` }}>
    <Card bg={bg} style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Display size={70} color={C.ink} stroke={0} style={{ textShadow: "none", textDecoration: ok === false ? "line-through" : "none", textDecorationColor: C.cherry, textDecorationThickness: 8 }}>
        {children}
      </Display>
      {ok === true && <Check size={60} />}
      {ok === false && <Cross size={56} />}
    </Card>
  </div>
);

// ================================================================ 13. three things
export const B13: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(13);
  const seg = segOf(frame, c);
  const bob = useBob(12, 6);
  return (
    <Shot cuts={c} enter="zoom" hits={[c[1]]}>
      {seg === 0 ? (
        <>
          <DinerBg />
          <Stage>
            <Ray x={250} y={680 + bob} size={580} worry={0.6} look={-1} />
          </Stage>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ position: "absolute", left: 180 + k * 260, top: 360 + Math.sin(frame / 6 + k) * 16, transform: `scale(${sp(frame, 4 + k * 4)})` }}>
              <Display size={140} color={C.mustard}>?</Display>
            </div>
          ))}
        </>
      ) : (
        <>
          <SunburstBg />
          <Slam at={c[1]} words={tr("3 THINGS", "٣ حاجات").split(" ")} colors={[C.mustard, C.cream]} top={640} size={220} />
          <SpeedLines at={c[1]} color={C.cream} />
        </>
      )}
    </Shot>
  );
};

// ================================================================ 14. negotiate scope, not quality
const Menu: React.FC<{ at: number; strikeAt: number }> = ({ at, strikeAt }) => {
  const frame = useCurrentFrame();
  const items = isAr() ? ["برجر", "بطاطس", "شيك", "حلقات بصل"] : ["BURGER", "FRIES", "SHAKE", "ONION RINGS"];
  return (
    <div style={{ position: "absolute", left: 100, top: 520, width: 880, height: 700, transform: `scale(${sp(frame, at)})` }}>
      <div style={{ position: "absolute", inset: 0, background: "#24453B", border: `22px solid ${C.brown}`, outline: ink(), borderRadius: 24, boxShadow: `0 16px 0 ${C.ink}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 46, textAlign: "center", fontFamily: theme.fonts.display, fontSize: 80, color: C.mustard }}>{tr("TONIGHT'S MENU", "منيو النهارده")}</div>
      {items.map((it, i) => {
        const strike = i === 0 ? 0 : ease(frame, [strikeAt + i * 4, strikeAt + i * 4 + 10], [0, 1]);
        return (
          <div key={it} style={{ position: "absolute", ...(isAr() ? { right: 90 } : { left: 90 }), top: 180 + i * 120, fontFamily: theme.fonts.display, fontSize: 88, color: C.cream, opacity: i === 0 ? 1 : interpolate(strike, [0, 1], [1, 0.5]) }}>
            {it}
            {i > 0 && (
              <svg style={{ position: "absolute", ...(isAr() ? { right: -20 } : { left: -20 }), top: 30 }} width={600} height={60} viewBox="0 0 600 60" overflow="visible">
                <path d="M0 34 Q 150 18 300 32 T 600 26" fill="none" stroke={C.cherry} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

const NoSign: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at);
  return (
    <svg style={{ position: "absolute", left: 190, top: 460 }} width={700} height={700} viewBox="0 0 700 700">
      <g transform={`translate(350 350) scale(${p}) translate(-350 -350)`}>
        <circle cx={350} cy={350} r={300} fill="none" stroke={C.cherry} strokeWidth={50} />
        <path d="M140 140 L 560 560" stroke={C.cherry} strokeWidth={50} />
      </g>
    </svg>
  );
};

export const B14: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(14);
  const seg = segOf(frame, c);
  return (
    <Shot cuts={c} enter="whip" hits={[c[3] + 4]}>
      <DinerBg />
      <NumberBadge at={0} n={1} top={seg === 0 ? 640 : 280} />
      {seg === 1 && (
        <div style={{ position: "absolute", left: 60, right: 100, top: 620, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          <Tag bg={C.mint} ok at={c[1]} frame={frame} rot={-3}>{tr("CUT SCOPE", "قلّل الشغل")}</Tag>
          <Tag bg={C.cream} ok={false} at={w(14, "not")} frame={frame} rot={3}>{tr("CUT QUALITY", "قلّل الجودة")}</Tag>
        </div>
      )}
      {seg === 2 && <Menu at={c[2]} strikeAt={c[2] + 8} />}
      {seg === 3 && (
        <>
          <Stage>
            <ellipse cx={540} cy={1140} rx={330} ry={34} fill={C.white} stroke={C.ink} strokeWidth={6} />
            <Burger x={240} y={604} size={600} patty={false} middle={<Squirrel x={150} y={10} size={220} flip />} />
          </Stage>
          <NoSign at={c[3] + 4} />
        </>
      )}
    </Shot>
  );
};

// ================================================================ 15. most valuable thing first
const Smoke: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {[0, 1, 2].map((k) => {
        const t = (frame * 1.5 + k * 25) % 75;
        return <circle key={k} cx={x + Math.sin(t / 10 + k) * 20} cy={y - t * 2} r={20 + t / 3} fill="#6B6B6B" opacity={0.6 - t / 130} />;
      })}
    </g>
  );
};

export const B15: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(15);
  const seg = segOf(frame, c);
  const beats = w(15, "beats");
  const glow = 0.6 + 0.4 * Math.sin(frame / 6);
  return (
    <Shot cuts={[...c, beats]} enter="whip">
      <DinerBg />
      <NumberBadge at={0} n={2} top={seg === 0 ? 640 : 280} />
      {seg === 1 && (
        <>
          <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 980px, rgba(244,185,66,${0.5 * glow}), transparent 40%)` }} />
          <Stage>
            <g transform={`translate(540 1000) scale(${sp(frame, c[1])}) translate(-540 -1000)`}>
              <ellipse cx={540} cy={1180} rx={300} ry={32} fill={C.white} stroke={C.ink} strokeWidth={6} />
              <Burger x={290} y={700} size={500} />
            </g>
          </Stage>
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
            <Tag bg={C.mustard} at={c[1] + 6} frame={frame}>{tr("MOST VALUABLE", "الأهم")}</Tag>
          </div>
        </>
      )}
      {seg >= 2 && (
        <>
          <Stage>
            {/* left: small plate, real food */}
            <g transform={`translate(270 1000) scale(${sp(frame, c[2])}) translate(-270 -1000)`}>
              <ellipse cx={270} cy={1120} rx={200} ry={26} fill={C.white} stroke={C.ink} strokeWidth={6} />
              <Burger x={120} y={830} size={300} />
            </g>
            {/* right: big tray of disaster */}
            <g transform={`translate(800 1000) scale(${sp(frame, w(15, "full"))}) translate(-800 -1000)`}>
              <rect x={590} y={1080} width={420} height={50} rx={14} fill="#9AA5B1" stroke={C.ink} strokeWidth={6} />
              {[610, 740, 870].map((bx, i) => (
                <Burger key={bx} x={bx} y={930 - (i % 2) * 20} size={140} patty={false} middle={<Squirrel x={110} y={30} size={190} flip />} />
              ))}
              <Smoke x={700} y={920} />
              <Smoke x={900} y={900} />
            </g>
          </Stage>
          {frame >= beats && (
            <>
              <div style={{ position: "absolute", left: 160, top: 620, transform: `scale(${sp(frame, beats)})` }}>
                <Check size={180} color={C.mintDeep} />
              </div>
              <div style={{ position: "absolute", left: 720, top: 620, transform: `scale(${sp(frame, beats + 6)})` }}>
                <Cross size={170} />
              </div>
            </>
          )}
        </>
      )}
    </Shot>
  );
};

// ================================================================ 16. say it early
export const B16: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cuts(16);
  const seg = segOf(frame, c);
  const low = w(16, "low");
  const speak = w(16, "speak");
  const level = ease(frame, [c[2], low + 4], [1, 0.18], theme.ease.inOut);
  const alarm = frame >= low && Math.floor(frame / 5) % 2 === 0;
  const bob = useBob(12, 6);
  return (
    <Shot cuts={[...c, speak]} enter="whip" hits={[c[3]]}>
      <DinerBg />
      <NumberBadge at={0} n={3} top={seg === 0 ? 640 : 280} />
      {seg === 1 && <Slam at={c[1]} words={tr("SAY IT EARLY.", "اتكلم بدري.").split(" ")} colors={isAr() ? [C.cream, C.mustard] : [C.cream, C.cream, C.mustard]} top={680} size={180} />}
      {seg === 2 && (
        <>
          <div style={{ position: "absolute", left: 120, top: 620, width: 300, height: 460 }}>
            <div style={{ position: "absolute", inset: 0, background: C.white, border: ink(10), borderRadius: 30, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${level * 100}%`, background: level < 0.3 ? C.cherry : C.patty }} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center" }}>
              <Display size={70} color={alarm ? C.cherry : C.cream}>{tr("BEEF", "اللحمة")}</Display>
            </div>
          </div>
          <Stage>
            <Ray x={480} y={720 + bob} size={460} worry={frame >= low ? 1 : 0} look={-1} />
          </Stage>
          {frame >= speak && (
            <div style={{ position: "absolute", left: 470, right: 100, top: 470, transform: `scale(${sp(frame, speak)})`, transformOrigin: "30% 100%" }}>
              <Card bg={C.white}>
                <Display size={64} color={C.ink} stroke={0} style={{ textShadow: "none" }}>{tr("\"HEADS UP, WE'RE LOW!\"", "«خلّي بالك، اللحمة بتخلص!»")}</Display>
              </Card>
            </div>
          )}
          {alarm && <AbsoluteFill style={{ background: C.cherry, opacity: 0.08 }} />}
        </>
      )}
      {seg === 3 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 780, display: "flex", justifyContent: "center", transform: "scale(2.6)" }}>
            <Clock t={12} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", transform: `scale(${sp(frame, c[3] + 4)})` }}>
            <Cross size={520} />
          </div>
          <Flash at={c[3] + 4} color={C.cherry} peak={0.3} />
        </>
      )}
    </Shot>
  );
};

// ================================================================ 17. punchline + loop
export const B17: React.FC = () => {
  const frame = useCurrentFrame();
  const len = bLen(17);
  const c = cuts(17);
  const seg = segOf(frame, c);
  const cut = w(17, "cut");
  const never = w(17, "never");
  const serve = w(17, "serve");
  const hopT = ease(frame, [len - 40, len - 20], [0, 1], theme.ease.inOut);
  const wipe = ease(frame, [len - 16, len - 2], [-1920, 0], theme.ease.inOut);
  const wink = frame > serve + 30 && frame < serve + 44 ? 1 : 0;
  const bob = useBob(10, 8);
  const split = ease(frame, [cut + 6, cut + 16], [0, 1]);
  return (
    <AbsoluteFill>
    <Shot cuts={[0, cut, never, serve]} enter="zoom" hits={[serve]}>
      {seg === 0 ? (
        <>
          <DinerBg />
          <div style={{ position: "absolute", left: 140, top: 520, width: 800, height: 640 }}>
            {[0, 1].map((half) => (
              <div
                key={half}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: half ? 400 : 0,
                  width: 400,
                  overflow: "hidden",
                  transform: `translateX(${(half ? 1 : -1) * split * 60}px) rotate(${(half ? 1 : -1) * split * 6}deg)`,
                }}
              >
                <div style={{ position: "absolute", left: half ? -400 : 0, width: 800, height: 640, background: "#24453B", border: `22px solid ${C.brown}`, boxSizing: "border-box", borderRadius: 24 }}>
                  <div style={{ textAlign: "center", fontFamily: theme.fonts.display, fontSize: 110, color: C.mustard, marginTop: 200 }}>{tr("THE MENU", "المنيو")}</div>
                </div>
              </div>
            ))}
          </div>
          <Stage>
            <Scissors x={ease(frame, [cut - 4, cut + 10], [-300, 400])} y={660} size={340} open={Math.abs(Math.sin(frame / 3))} />
          </Stage>
        </>
      ) : (
        <>
          <SunburstBg />
          <Stage>
            <g transform={`translate(${hopT * 900} ${-Math.sin(hopT * Math.PI) * 300 + bob * (1 - hopT)}) translate(540 640) scale(${sp(frame, c[1])}) translate(-540 -640)`}>
              <Squirrel x={300} y={330} size={480} wink={wink} tail={Math.sin(frame / 4) * 10} />
            </g>
          </Stage>
          <Slam at={never} words={[tr("NEVER", "عمرك")]} colors={[C.cream]} top={900} size={170} rotate={-4} />
          <Slam at={serve} words={tr("SERVE THE SQUIRREL.", "ما تقدّم السنجاب.").split(" ")} colors={[C.cream, C.cream, C.mustard]} top={1080} size={130} rotate={-4} />
          <SpeedLines at={serve} color={C.cream} />
        </>
      )}
    </Shot>
      {/* diner wipe sits outside the camera and lands on beat 1's first frame so the video loops */}
      <div style={{ position: "absolute", left: 0, top: wipe, width: 1080, height: 1920 }}>
        <DinerBg />
        <div style={{ position: "absolute", left: 40, right: 40, top: 1170, height: 70, background: C.cherry, border: ink(), borderRadius: 18 }} />
        <div style={{ position: "absolute", left: 70, right: 70, top: 1240, height: 200, background: "#D9D9D9", border: ink(), borderTop: "none" }} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={540} cy={1162} rx={330} ry={34} fill={C.white} stroke={C.ink} strokeWidth={6} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
