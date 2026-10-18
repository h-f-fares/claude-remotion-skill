import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme } from "./theme";
import { Display, Pop, SceneShell, ease, useBob, useSp } from "./motion";
import { DarkBg, DinerBg, NightBg, SunburstBg } from "./bg";
import { Burger, IconCustomer, IconStore, IconTeam, OldMan, Person, Ray, Squirrel } from "./art";
import { sceneLen, wordF } from "./timing";

const C = theme.colors;
const ink = (w = theme.stroke) => `${w}px solid ${C.ink}`;
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }} overflow="visible">
    {children}
  </svg>
);

// screen shake, decaying from frame `at`
const useShake = (at: number, amp = 18, len = 14) => {
  const frame = useCurrentFrame();
  const k = frame - at;
  if (k < 0 || k > len) return 0;
  return Math.sin(k * 2.4) * amp * (1 - k / len);
};

// ================================================================ 1. hook
export const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = useSp(2, theme.spring.bouncy);
  const reveal = useSp(wordF(1, 5), theme.spring.bouncy);
  const bang = useSp(wordF(1, 7), theme.spring.bouncy);
  const lift = reveal * 230;
  // squash & stretch on landing
  const squash = 1 - Math.max(0, drop - 1) * 0.6;
  const by = interpolate(drop, [0, 1], [-900, 0]);
  const wag = Math.sin(frame / 4) * 10 * reveal;
  return (
    <SceneShell first>
      <DinerBg />
      <div style={{ position: "absolute", left: 40, right: 40, top: 1170, height: 70, background: C.cherry, border: ink(8), borderRadius: 18 }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1240, height: 200, background: "#D9D9D9", border: ink(8), borderTop: "none" }} />
      <Stage>
        <ellipse cx={540} cy={1162} rx={330} ry={34} fill={C.white} stroke={C.ink} strokeWidth={6} />
        <g transform={`translate(0 ${by}) translate(540 1160) scale(${2 - squash} ${squash}) translate(-540 -1160)`}>
          <Burger
            x={240}
            y={624}
            size={600}
            lift={lift}
            tilt={-12 * reveal}
            patty={reveal < 0.02}
            clipId="s1-filling"
            middle={<Squirrel x={72} y={210 - reveal * 210} size={176} tail={wag} />}
          />
        </g>
      </Stage>
      <div style={{ position: "absolute", left: 790, top: 560, transform: `scale(${bang}) rotate(${12 - bang * 12}deg)`, opacity: Math.min(1, bang * 2) }}>
        <Display size={210} color={C.mustard} stroke={14}>
          ?!
        </Display>
      </div>
    </SceneShell>
  );
};

// ================================================================ 2. Ray's at night
const Clock: React.FC<{ t: number }> = ({ t }) => (
  <svg width={190} height={190} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={44} fill={C.cream} stroke={C.ink} strokeWidth={6} />
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1={50} y1={12} x2={50} y2={18} stroke={C.ink} strokeWidth={4} transform={`rotate(${i * 30} 50 50)`} />
    ))}
    <line x1={50} y1={50} x2={50} y2={24} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform="rotate(-6 50 50)" />
    <line x1={50} y1={50} x2={50} y2={16} stroke={C.cherry} strokeWidth={4} strokeLinecap="round" transform={`rotate(${-12 + t} 50 50)`} />
    <circle cx={50} cy={50} r={5} fill={C.ink} />
  </svg>
);

export const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const sign = useSp(wordF(2, 0), theme.spring.bouncy);
  const flick = frame < wordF(2, 0) + 14 ? (Math.floor(frame / 3) % 2 ? 0.35 : 1) : 1;
  const clock = useSp(wordF(2, 5), theme.spring.bouncy);
  const lineStart = wordF(2, 7);
  const bob = useBob(14, 6);
  const colors = [C.mustard, C.mint, C.cherry, C.cream, C.mustard, C.mint, C.cream];
  return (
    <SceneShell>
      <NightBg />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        <Pop delay={4}>
          <div style={{ fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 40, color: C.ink, background: C.mustard, border: ink(5), borderRadius: 40, padding: "8px 28px" }}>
            A SCRUM LEGEND
          </div>
        </Pop>
      </div>
      {/* building */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 860, height: 600, background: C.cream, border: ink(8), borderRadius: "40px 40px 0 0" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: `repeating-linear-gradient(90deg, ${C.cherry} 0 80px, ${C.cream} 80px 160px)`, borderBottom: ink(8), borderRadius: "34px 34px 0 0" }} />
        {[60, 360, 660].map((x) => (
          <div key={x} style={{ position: "absolute", left: x, top: 140, width: 220, height: 220, background: `linear-gradient(180deg, ${C.mustard}, #FFE08A)`, border: ink(8), borderRadius: 20, boxShadow: `0 0 60px ${C.mustard}aa` }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, bottom: 0, background: "#2A2F45", borderTop: ink(8) }} />
      {/* neon sign */}
      <div style={{ position: "absolute", left: 140, right: 140, top: 450, height: 330, transform: `scale(${sign}) translateY(${bob * 0.5}px)`, opacity: Math.min(1, sign * 2) }}>
        <div style={{ position: "absolute", inset: 0, background: C.navyDeep, border: ink(10), borderRadius: 40, boxShadow: `0 0 0 10px ${C.neon}55` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontFamily: theme.fonts.display, fontSize: 170, color: "#FFE3F0", opacity: flick, textShadow: `0 0 18px ${C.neon}, 0 0 50px ${C.neon}` }}>RAY'S</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontFamily: theme.fonts.body, fontWeight: 700, fontSize: 52, letterSpacing: 8, color: "#D9FFF4", opacity: flick, textShadow: `0 0 14px ${C.mint}, 0 0 34px ${C.mint}` }}>BURGERS · OPEN LATE</div>
      </div>
      <div style={{ position: "absolute", left: 40, top: 760, transform: `scale(${clock}) rotate(${(1 - clock) * -90}deg)` }}>
        <Clock t={frame * 0.6} />
      </div>
      {/* the queue walks in, one after another */}
      <Stage>
        {colors.map((col, i) => {
          const p = spring({ frame: frame - lineStart - i * 4, fps: 30, config: theme.spring.snappy });
          const x = interpolate(p, [0, 1], [1200 + i * 140, 70 + i * 135]);
          const hop = Math.abs(Math.sin((frame + i * 5) / 4)) * 12 * (1 - Math.min(1, p));
          return <Person key={i} x={x} y={1220 - hop + Math.sin(frame / 10 + i) * 3} size={118} color={col} hat={i % 3 === 1} />;
        })}
      </Stage>
    </SceneShell>
  );
};

// ================================================================ 3. out of beef
export const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const open = ease(frame, [wordF(3, 1) - 4, wordF(3, 1) + 8], [0, 1], theme.ease.out);
  const stamp = useSp(wordF(3, 3), theme.spring.bouncy);
  const shake = useShake(wordF(3, 3), 14);
  return (
    <SceneShell>
      <DinerBg floorY={1480} />
      <div style={{ position: "absolute", left: 250, top: 330, width: 580, height: 1080, transform: `translateX(${shake}px)` }}>
        {/* inside */}
        <div style={{ position: "absolute", inset: 0, background: "#EAF6FF", border: ink(10), borderRadius: 30, overflow: "hidden" }}>
          {[260, 520, 780].map((y) => (
            <div key={y} style={{ position: "absolute", left: 30, right: 30, top: y, height: 16, background: "#B9D8EA", border: ink(5), borderRadius: 8 }} />
          ))}
          <svg style={{ position: "absolute", left: 240, top: 470 }} width={100} height={60} viewBox="0 0 100 60">
            <path d="M6 50 Q 30 0 94 20 Q 70 58 6 50 Z" fill={C.lettuce} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontSize: 60, opacity: open }}>
            <span style={{ fontFamily: theme.fonts.body, fontWeight: 700, color: "#9DB4C2", fontSize: 44 }}>· · ·</span>
          </div>
        </div>
        {/* door swings open toward the viewer */}
        <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, ${C.mint}, #A7E8D5)`,
              border: ink(10),
              borderRadius: 30,
              transformOrigin: "0% 50%",
              transform: `rotateY(${-open * 105}deg)`,
              backfaceVisibility: "hidden",
            }}
          >
            <div style={{ position: "absolute", right: 40, top: 380, width: 34, height: 260, background: "#D9D9D9", border: ink(6), borderRadius: 17 }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", transform: `scale(${interpolate(stamp, [0, 1], [2.4, 1])}) rotate(-8deg)`, opacity: Math.min(1, stamp * 3) }}>
        <div style={{ background: C.cherry, border: ink(10), borderRadius: 24, padding: "20px 40px", boxShadow: `0 14px 0 ${C.ink}` }}>
          <Display size={130} stroke={10}>OUT OF BEEF</Display>
        </div>
      </div>
    </SceneShell>
  );
};

// ================================================================ 4. Ray looks around
export const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const len = sceneLen(3);
  const lookStart = wordF(4, 6);
  const dart = frame < lookStart ? 0 : frame < len - 30 ? (Math.floor((frame - lookStart) / 7) % 2 ? -1 : 1) : 1;
  const bubble = useSp(wordF(4, 1), theme.spring.bouncy);
  const bubbleGone = ease(frame, [wordF(4, 4), wordF(4, 4) + 8], [1, 0], theme.ease.in);
  const push = ease(frame, [len - 30, len], [1, 1.25], theme.ease.inOut);
  const idea = useSp(len - 22, theme.spring.bouncy);
  const bob = useBob(18, 5);
  return (
    <SceneShell>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "78% 30%" }}>
        <DinerBg />
        {/* window with a squirrel on a branch */}
        <div style={{ position: "absolute", left: 600, top: 360, width: 400, height: 420, background: `linear-gradient(180deg, #8FD3FF, #CDEFFF)`, border: ink(10), borderRadius: 24, overflow: "hidden" }}>
          <svg width={400} height={420} viewBox="0 0 400 420">
            <path d="M-10 300 Q 200 270 420 320 L 420 340 Q 200 292 -10 322 Z" fill={C.brownDark} stroke={C.ink} strokeWidth={6} />
            <circle cx={340} cy={80} r={90} fill={C.lettuce} stroke={C.ink} strokeWidth={6} />
            <Squirrel x={120} y={120 + bob} size={180} tail={Math.sin(frame / 5) * 8} />
          </svg>
          <div style={{ position: "absolute", left: 196, top: 0, bottom: 0, width: 10, background: C.ink }} />
          <div style={{ position: "absolute", top: 206, left: 0, right: 0, height: 10, background: C.ink }} />
        </div>
        <Stage>
          <Ray x={30} y={640 + bob} size={520} look={dart} worry={1} sweat={ease(frame, [10, 30], [0, 1])} t={frame} grin={idea} />
        </Stage>
        <div style={{ position: "absolute", left: 370, top: 470, transform: `scale(${bubble * bubbleGone})`, transformOrigin: "0% 100%" }}>
          <div style={{ background: C.white, border: ink(8), borderRadius: 40, padding: "16px 34px" }}>
            <Display size={90} color={C.ink} stroke={0} style={{ textShadow: "none" }}>
              "no"…?
            </Display>
          </div>
        </div>
        <div style={{ position: "absolute", left: 470, top: 330, transform: `scale(${idea}) rotate(${(1 - idea) * 30}deg)`, opacity: Math.min(1, idea * 2) }}>
          <Display size={170} color={C.mustard}>!</Display>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

// ================================================================ 5. grill · bun · served · bite
const Flames: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {Array.from({ length: 7 }).map((_, i) => {
      const h = 60 + Math.abs(Math.sin(frame / 3 + i * 1.3)) * 50;
      const x = 270 + i * 90;
      return <path key={i} d={`M${x - 30} 1120 Q ${x} ${1120 - h * 1.6} ${x + 30} 1120 Z`} fill={i % 2 ? C.mustard : C.cherry} stroke={C.ink} strokeWidth={5} />;
    })}
  </g>
);

export const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const b1 = wordF(5, 1);
  const b2 = wordF(5, 2);
  const b3 = wordF(5, 3);
  const bite = wordF(5, 9);
  const slam = useSp(b1, theme.spring.bouncy);
  const slide = useSp(b2, theme.spring.snappy);
  const chomp = useSp(bite, theme.spring.bouncy);
  const shakeSlam = useShake(b1 + 4, 16);
  const shakeBite = useShake(bite, 20);
  const beat = frame < b1 ? 0 : frame < b2 ? 1 : frame < b3 ? 2 : 3;
  const enter = useSp(beat === 0 ? 0 : beat === 1 ? b1 : beat === 2 ? b2 : b3, theme.spring.snappy);
  const mouth = frame < bite - 10 ? 0 : frame < bite ? ease(frame, [bite - 10, bite], [0, 1]) : ease(frame, [bite, bite + 5], [1, 0.1]);
  return (
    <SceneShell>
      <DinerBg />
      <AbsoluteFill style={{ transform: `translate(${shakeSlam + shakeBite}px, 0) scale(${interpolate(enter, [0, 1], [1.15, 1])})` }}>
        {beat === 0 && (
          <Stage>
            <rect x={160} y={1100} width={760} height={90} rx={20} fill="#3B3B45" stroke={C.ink} strokeWidth={8} />
            <Flames frame={frame} />
            <rect x={140} y={960} width={800} height={60} rx={14} fill="#55555F" stroke={C.ink} strokeWidth={8} />
            <g transform={`translate(0 ${Math.sin(frame / 2) * 3})`}>
              <Squirrel x={360} y={740} size={300} blink />
            </g>
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M${420 + i * 110} ${700 - ((frame * 4 + i * 30) % 120)} q 20 -30 0 -60 q -20 -30 0 -60`}
                fill="none"
                stroke={C.white}
                strokeWidth={10}
                strokeLinecap="round"
                opacity={0.8}
              />
            ))}
          </Stage>
        )}
        {beat === 1 && (
          <Stage>
            <ellipse cx={540} cy={1140} rx={330} ry={34} fill={C.white} stroke={C.ink} strokeWidth={6} />
            <Burger x={240} y={604} size={600} lift={interpolate(slam, [0, 1], [500, 0])} patty={false} middle={<Squirrel x={150} y={10} size={220} flip tail={Math.sin(frame / 3) * 6} />} />
          </Stage>
        )}
        {beat >= 2 && (
          <Stage>
            {beat === 3 && <OldMan x={240} y={300 + bobAt(frame)} size={600} open={mouth} />}
            <g transform={`translate(${beat === 2 ? interpolate(slide, [0, 1], [-900, 0]) : 0} ${beat === 3 ? ease(frame, [bite - 12, bite], [0, -170], theme.ease.inOut) : 0})`}>
              <ellipse cx={540} cy={1240} rx={300} ry={32} fill={C.white} stroke={C.ink} strokeWidth={6} />
              <Burger x={300} y={760} size={480} patty={false} middle={<Squirrel x={150} y={10} size={220} flip />} />
            </g>
          </Stage>
        )}
      </AbsoluteFill>
      {beat === 3 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", transform: `scale(${chomp}) rotate(-6deg)`, opacity: Math.min(1, chomp * 2) }}>
          <Display size={170} color={C.mustard}>CHOMP!</Display>
        </div>
      )}
    </SceneShell>
  );
};
const bobAt = (frame: number) => Math.sin(frame / 14) * 6;

// ================================================================ 6. hospital
const Ambulance: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={560} height={300} viewBox="0 0 560 300" overflow="visible">
    <rect x={10} y={60} width={380} height={190} rx={20} fill={C.white} stroke={C.ink} strokeWidth={8} />
    <path d="M390 120 L 480 120 L 540 190 L 540 250 L 390 250 Z" fill={C.white} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <path d="M410 136 L 470 136 L 512 186 L 410 186 Z" fill="#8FD3FF" stroke={C.ink} strokeWidth={6} />
    <rect x={10} y={180} width={530} height={26} fill={C.cherry} stroke={C.ink} strokeWidth={6} />
    <path d="M170 90 h 40 v 30 h 30 v 40 h -30 v 30 h -40 v -30 h -30 v -40 h 30 Z" fill={C.cherry} stroke={C.ink} strokeWidth={6} />
    <rect x={120} y={32} width={60} height={30} rx={8} fill={Math.floor(frame / 4) % 2 ? C.cherry : "#5A1C22"} stroke={C.ink} strokeWidth={6} />
    <rect x={210} y={32} width={60} height={30} rx={8} fill={Math.floor(frame / 4) % 2 ? "#1B2C66" : C.siren} stroke={C.ink} strokeWidth={6} />
    {[110, 440].map((cx) => (
      <g key={cx} transform={`rotate(${frame * 30} ${cx} 256)`}>
        <circle cx={cx} cy={256} r={42} fill={C.ink} />
        <circle cx={cx} cy={256} r={16} fill="#D9D9D9" />
        <rect x={cx - 3} y={220} width={6} height={20} fill="#D9D9D9" />
      </g>
    ))}
  </svg>
);

export const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const h = wordF(6, 2);
  const sick = ease(frame, [0, h], [0, 1], theme.ease.inOut);
  const hosp = useSp(h - 2, theme.spring.bouncy);
  const amb = ease(frame, [h - 4, h + 22], [-700, 1200], theme.ease.inOut);
  const flash = frame >= h - 2 ? (Math.floor(frame / 4) % 2 ? C.cherry : C.siren) : "transparent";
  return (
    <SceneShell>
      <DarkBg tint={C.sick} />
      {frame < h ? (
        <Stage>
          <OldMan x={240} y={420 + Math.sin(frame / 2) * 3} size={600} sick={sick} open={0.2} />
          {[0, 1, 2].map((i) => (
            <path key={i} transform={`translate(${300 + i * 240} ${520 - ((frame * 2 + i * 20) % 60)})`} d="M0 0 q 14 -14 0 -28 q -14 -14 0 -28" fill="none" stroke={C.sick} strokeWidth={10} strokeLinecap="round" opacity={0.8} />
          ))}
        </Stage>
      ) : (
        <>
          <div style={{ position: "absolute", left: 140, right: 140, top: 420, height: 760, transform: `scale(${hosp})`, transformOrigin: "50% 100%" }}>
            <div style={{ position: "absolute", inset: 0, background: C.cream, border: ink(10), borderRadius: "30px 30px 0 0" }}>
              {[0, 1, 2].map((r) =>
                [0, 1, 2].map((c) => (
                  <div key={`${r}${c}`} style={{ position: "absolute", left: 60 + c * 220, top: 260 + r * 150, width: 120, height: 90, background: (r + c) % 2 ? C.mustard : "#FFE08A", border: ink(6), borderRadius: 10 }} />
                )),
              )}
            </div>
            <div style={{ position: "absolute", left: "50%", top: 50, transform: "translateX(-50%)", width: 170, height: 170, background: C.white, border: ink(8), borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={120} height={120} viewBox="0 0 100 100">
                <path d="M35 8 h 30 v 27 h 27 v 30 h -27 v 27 h -30 v -27 h -27 v -30 h 27 Z" fill={C.cherry} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1180, bottom: 0, background: "#2A2F45", borderTop: ink(8) }} />
          <div style={{ position: "absolute", left: amb, top: 940 }}>
            <Ambulance frame={frame} />
          </div>
        </>
      )}
      <AbsoluteFill style={{ background: flash, opacity: 0.18, mixBlendMode: "screen" }} />
    </SceneShell>
  );
};

// ================================================================ 7. the headline
export const S7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spin = spring({ frame, fps, config: { damping: 16, stiffness: 70, mass: 1 } });
  const brand = wordF(7, 7);
  const zoom = ease(frame, [brand - 6, brand + 10], [1, 1.35], theme.ease.inOut);
  const crack = ease(frame, [brand + 4, brand + 18], [0, 1], theme.ease.out);
  const shake = useShake(brand + 6, 16);
  return (
    <SceneShell>
      <DarkBg tint={C.navy} />
      <AbsoluteFill style={{ transform: `scale(${zoom}) translateX(${shake}px)`, transformOrigin: "50% 62%" }}>
        <div
          style={{
            position: "absolute",
            left: 110,
            top: 330,
            width: 860,
            height: 1020,
            background: "#F7F0E1",
            border: ink(10),
            borderRadius: 12,
            transform: `rotate(${interpolate(spin, [0, 1], [720, -3])}deg) scale(${interpolate(spin, [0, 1], [0.1, 1])})`,
            boxShadow: `18px 18px 0 ${C.ink}`,
            padding: 40,
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontFamily: theme.fonts.display, fontSize: 70, textAlign: "center", color: C.ink, borderBottom: ink(6), paddingBottom: 14 }}>THE DAILY GRILL</div>
          <div style={{ fontFamily: theme.fonts.display, fontSize: 112, lineHeight: 0.98, textAlign: "center", color: C.ink, marginTop: 26 }}>
            BURGER JOINT SERVES <span style={{ color: C.cherry }}>SQUIRREL!</span>
          </div>
          <div style={{ position: "relative", marginTop: 30, height: 380, background: C.navy, border: ink(6), borderRadius: 8, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 130, top: 110, right: 130, height: 170, background: C.navyDeep, border: ink(8), borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: theme.fonts.display, fontSize: 120, color: "#FFE3F0", textShadow: `0 0 18px ${C.neon}` }}>RAY'S</span>
            </div>
            <svg style={{ position: "absolute", inset: 0 }} width={772} height={380} viewBox="0 0 772 380">
              <path
                d="M386 60 L 360 130 L 410 170 L 370 240 L 420 300 L 395 360"
                fill="none"
                stroke={C.cream}
                strokeWidth={12}
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - crack}
              />
              <path d="M410 170 L 480 150 M370 240 L 300 260" fill="none" stroke={C.cream} strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} />
            </svg>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 18, background: "#CFC6B4", borderRadius: 9, marginTop: 22, width: `${92 - i * 18}%` }} />
          ))}
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

// ================================================================ 8. it spreads
const Card: React.FC<{ at: number; x: number; label: string; children: React.ReactNode }> = ({ at, x, label, children }) => {
  const frame = useCurrentFrame();
  const p = useSp(at, theme.spring.bouncy);
  const crack = ease(frame, [at + 4, at + 14], [0, 1]);
  const bob = useBob(16, 5, x);
  return (
    <div style={{ position: "absolute", left: x, top: 960 + bob, width: 280, height: 330, transform: `scale(${p}) rotate(${(1 - p) * 20}deg)`, opacity: Math.min(1, p * 2) }}>
      <div style={{ position: "absolute", inset: 0, background: C.cream, border: ink(8), borderRadius: 30, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: `0 12px 0 ${C.ink}` }}>
        {children}
        <div style={{ fontFamily: theme.fonts.display, fontSize: 50, color: C.ink }}>{label}</div>
      </div>
      <svg style={{ position: "absolute", inset: 0 }} width={280} height={330} viewBox="0 0 280 330">
        <path d="M150 0 L 130 60 L 165 100 L 120 150" fill="none" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} />
      </svg>
    </div>
  );
};

export const S8: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = ease(frame, [wordF(8, 0), wordF(8, 10)], [0, 1], theme.ease.inOut);
  const plate = useSp(0, theme.spring.bouncy);
  const shake = useShake(wordF(8, 1), 14);
  const bob = useBob(20, 6);
  const xs = [70, 400, 730];
  return (
    <SceneShell>
      <DarkBg />
      <div style={{ position: "absolute", left: 0, right: 0, top: 320 + bob, display: "flex", justifyContent: "center", transform: `scale(${plate}) translateX(${shake}px)` }}>
        <div style={{ position: "relative", background: C.mustard, border: ink(10), borderRadius: 30, padding: "24px 56px", boxShadow: `0 14px 0 ${C.ink}` }}>
          <Display size={130} color={C.cream}>QUALITY</Display>
        </div>
      </div>
      <Stage>
        {xs.map((x, i) => (
          <path
            key={i}
            d={`M540 500 L 520 600 L 560 680 L ${540 + (x + 140 - 540) * 0.6} 800 L ${x + 140} 960`}
            fill="none"
            stroke={C.cream}
            strokeWidth={12}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - grow}
          />
        ))}
      </Stage>
      <Card at={wordF(8, 11)} x={xs[0]} label="CUSTOMER">
        <IconCustomer />
      </Card>
      <Card at={wordF(8, 12)} x={xs[1]} label="TEAM">
        <IconTeam />
      </Card>
      <Card at={wordF(8, 13)} x={xs[2]} label="BUSINESS">
        <IconStore />
      </Card>
    </SceneShell>
  );
};

// ================================================================ 9. cut scope, never quality
export const S9: React.FC = () => {
  const frame = useCurrentFrame();
  const cut = wordF(9, 5);
  const never = wordF(9, 7);
  const board = useSp(0, theme.spring.bouncy);
  const star = useSp(never, theme.spring.bouncy);
  const items = ["BURGER", "FRIES", "SHAKE", "ONION RINGS"];
  return (
    <SceneShell>
      <DinerBg />
      <div style={{ position: "absolute", left: 100, top: 320, width: 880, height: 760, transform: `scale(${board}) rotate(${(1 - board) * -8}deg)` }}>
        <div style={{ position: "absolute", inset: 0, background: "#24453B", border: `22px solid ${C.brown}`, outline: ink(8), borderRadius: 24, boxShadow: `0 16px 0 ${C.ink}` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontFamily: theme.fonts.display, fontSize: 84, color: C.mustard }}>TONIGHT'S MENU</div>
        {items.map((it, i) => {
          const strike = i === 0 ? 0 : ease(frame, [cut + i * 4, cut + i * 4 + 10], [0, 1]);
          return (
            <div key={it} style={{ position: "absolute", left: 90, top: 200 + i * 130, fontFamily: theme.fonts.display, fontSize: 92, color: C.cream, opacity: i === 0 ? 1 : interpolate(strike, [0, 1], [1, 0.55]) }}>
              {it}
              {i > 0 && (
                <svg style={{ position: "absolute", left: -20, top: 30 }} width={600} height={60} viewBox="0 0 600 60" overflow="visible">
                  <path d="M0 34 Q 150 18 300 32 T 600 26" fill="none" stroke={C.cherry} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} />
                </svg>
              )}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 560, top: 150, transform: `scale(${star}) rotate(${(1 - star) * 90 - 10}deg)`, opacity: Math.min(1, star * 2) }}>
          <svg width={240} height={240} viewBox="0 0 100 100">
            <path d="M50 4 L 62 36 L 96 37 L 69 58 L 79 92 L 50 72 L 21 92 L 31 58 L 4 37 L 38 36 Z" fill={C.mustard} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <text x={50} y={58} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={13} fill={C.ink}>QUALITY</text>
          </svg>
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1130, display: "flex", justifyContent: "space-between" }}>
        <Pop delay={cut}>
          <div style={{ background: C.mint, border: ink(8), borderRadius: 22, padding: "14px 26px", transform: "rotate(-4deg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Display size={58} color={C.ink} stroke={0} style={{ textShadow: "none" }}>CUT SCOPE</Display>
              <svg width={52} height={52} viewBox="0 0 50 50"><path d="M8 26 L 20 38 L 42 12" fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </Pop>
        <Pop delay={never}>
          <div style={{ background: C.cream, border: ink(8), borderRadius: 22, padding: "14px 26px", transform: "rotate(4deg)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Display size={58} color={C.ink} stroke={0} style={{ textShadow: "none", textDecoration: "line-through", textDecorationColor: C.cherry, textDecorationThickness: 8 }}>CUT QUALITY</Display>
              <svg width={48} height={48} viewBox="0 0 50 50"><path d="M10 10 L 40 40 M40 10 L 10 40" fill="none" stroke={C.cherry} strokeWidth={9} strokeLinecap="round" /></svg>
            </div>
          </div>
        </Pop>
      </div>
    </SceneShell>
  );
};

// ================================================================ 10. punchline + loop back
export const S10: React.FC = () => {
  const frame = useCurrentFrame();
  const len = sceneLen(9);
  const sq = useSp(0, theme.spring.bouncy);
  const hopT = ease(frame, [len - 34, len - 16], [0, 1], theme.ease.inOut);
  const hopX = hopT * 900;
  const hopY = -Math.sin(hopT * Math.PI) * 300;
  const wink = frame > 30 && frame < 44 ? 1 : 0;
  const wipe = ease(frame, [len - 14, len - 2], [-1920, 0], theme.ease.inOut);
  const words = ["DON'T", "SERVE", "THE", "SQUIRREL."];
  const bob = useBob(10, 8);
  return (
    <SceneShell>
      <SunburstBg />
      <Stage>
        <g transform={`translate(${hopX} ${hopY + bob * (1 - hopT)}) translate(540 640) scale(${sq}) translate(-540 -640)`}>
          <Squirrel x={300} y={360} size={480} wink={wink} tail={Math.sin(frame / 4) * 10} />
        </g>
      </Stage>
      <div style={{ position: "absolute", left: 60, right: 60, top: 920, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 34, rowGap: 6 }}>
        {words.map((w, i) => (
          <Pop key={w} delay={4 + i * 5}>
            <Display size={150} color={i === 3 ? C.mustard : C.cream}>{w}</Display>
          </Pop>
        ))}
      </div>
      {/* diner wipe — lands on the exact first frame of scene 1 so the Short loops */}
      <div style={{ position: "absolute", left: 0, top: wipe, width: 1080, height: 1920 }}>
        <DinerBg />
        <div style={{ position: "absolute", left: 40, right: 40, top: 1170, height: 70, background: C.cherry, border: ink(8), borderRadius: 18 }} />
        <div style={{ position: "absolute", left: 70, right: 70, top: 1240, height: 200, background: "#D9D9D9", border: ink(8), borderTop: "none" }} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={540} cy={1162} rx={330} ry={34} fill={C.white} stroke={C.ink} strokeWidth={6} />
        </svg>
      </div>
    </SceneShell>
  );
};
