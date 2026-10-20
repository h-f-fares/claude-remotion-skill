// Beats 1–11: before/after hook, intro, chapter 1 (three versions), chapter 2 (two hours).
import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../../v3/theme";
import { s, w } from "../timing";
import { ACCENT, Badge, Bubble, Chapter, Chip, Col, Count, D, Flash, Frame, Glass, Icon, Laptop, Mark, Phone, Pop, Row, Slam, Stage, Strike, T, ease, useBob, useShakeAt } from "../kit";

const C = theme.colors;
export type SceneProps = { b: number; len: number };

const Year: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = C.card }) => (
  <Chip size={44} ltr bg={bg} color={bg === C.card ? C.ink : C.white}>{children}</Chip>
);

// 1 — this was my site a year ago; this is it today; all in one day, from the phone
export const S1: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const now = s(b, 1);
  const day = s(b, 2);
  const split = ease(frame, [now, now + 16], [0, 1]);
  const shrink = ease(frame, [day, day + 16], [0, 1]);
  const shake = useShakeAt([now]);
  return (
    <Stage style={{ transform: shake }}>
      <div style={{ position: "relative", width: 1800, height: 760, transform: `scale(${1 - shrink * 0.14}) translateY(${-shrink * 90}px)` }}>
        {/* V1 starts full, then slides left as V3 arrives */}
        <div style={{ position: "absolute", left: 900 - 560 - split * 450, top: 40 + split * 90, transform: `scale(${1 - split * 0.22})`, transformOrigin: "50% 0%" }}>
          <Pop at={2}>
            <Col gap={16}>
              <Frame src="v1-home.mp4" w={1120} url="hfares.com · 2025" tilt={split * 8} />
              <Year>V1 · 2025</Year>
            </Col>
          </Pop>
        </div>
        {frame >= now && (
          <div style={{ position: "absolute", left: 880, top: 130 }}>
            <Pop at={now} x={200} from={0}>
              <Col gap={16}>
                <Frame src="v3-home.mp4" w={860} url="hfares.com · 2026" tilt={-8} accent={ACCENT.hook} from={now} />
                <Year bg={C.teal}>V3 · 2026</Year>
              </Col>
            </Pop>
          </div>
        )}
      </div>
      {frame >= day && (
        <div style={{ position: "absolute", bottom: 40 }}>
          <Slam at={day}>
            <Chip size={58} bg={C.mustard}>
              <Icon name="phone" size={60} sw={8} /> يوم واحد · من الموبايل
            </Chip>
          </Slam>
        </div>
      )}
      <Flash at={now} peak={0.35} />
    </Stage>
  );
};

// 2 — no laptop, no code read, and the bill comes at the end
export const S2: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const items = [
    { at: s(b, 0), node: <Laptop w={300} asleep />, label: "من غير لابتوب" },
    { at: s(b, 1), node: <Badge name="code" size={190} />, label: "ولا سطر كود" },
  ];
  return (
    <Stage gap={60} zoom={1.3}>
      <Row gap={110}>
        {items.map((it) => (
          <Pop key={it.label} at={it.at}>
            <Col gap={22}>
              <div style={{ position: "relative", height: 220, display: "flex", alignItems: "center" }}>
                {it.node}
                <div style={{ position: "absolute", inset: -20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="x" size={230} color={C.red} sw={10} draw={it.at + 12} />
                </div>
              </div>
              <T size={56}>{it.label}</T>
            </Col>
          </Pop>
        ))}
        {frame >= s(b, 2) && (
          <Slam at={s(b, 2)}>
            <Glass pad={40} accent={ACCENT.hook} style={{ transform: "rotate(-3deg)" }}>
              <T size={40} color={D.dim}>الفاتورة</T>
              <T size={150} ltr color={C.tealBright}>$ ?</T>
            </Glass>
          </Slam>
        )}
      </Row>
    </Stage>
  );
};

// 3 — I'm Hossam Fares; the full story of v3
export const S3: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={30}>
      <Row gap={80}>
        <Col gap={12} style={{ alignItems: "flex-end" }}>
          <Slam at={2}>
            <T size={140}>حسام فارس</T>
          </Slam>
          <Pop at={10}>
            <T size={46} weight={600} color={D.dim} ltr>Hossam Fares · hfares.com</T>
          </Pop>
          {frame >= s(b, 1) && (
            <Pop at={s(b, 1)}>
              <T size={62}>
                الحكاية الكاملة لـ <Mark at={s(b, 1) + 8}>النسخة التالتة</Mark>
              </T>
            </Pop>
          )}
        </Col>
        <Pop at={6}>
          <Frame src="v3-home-dark.mp4" w={760} tilt={-10} accent={ACCENT.hook} />
        </Pop>
      </Row>
    </Stage>
  );
};

const Stat: React.FC<{ at: number; label: string; children: React.ReactNode; hero?: string }> = ({ at, label, children, hero }) => (
  <Pop at={at} x={-40} from={0}>
    <Row gap={22} style={{ justifyContent: "flex-end" }}>
      <T size={42} weight={600} color={D.dim}>{label}</T>
      <T size={84} ltr color={hero ?? D.text}>{children}</T>
    </Row>
  </Pop>
);

// version beat: real recording of that version + its stats
const VersionBeat: React.FC<{ v: string; src: string; when: string; accent: string; children: React.ReactNode }> = ({ v, src, when, accent, children }) => (
  <Stage>
    <Row gap={70}>
      <Col gap={26} style={{ alignItems: "flex-end", width: 620 }}>
        <Pop at={2}>
          <Row gap={22}>
            <Chip size={64} ltr bg={accent} color={C.ink}>{v}</Chip>
            <T size={54} color={D.dim}>{when}</T>
          </Row>
        </Pop>
        {children}
      </Col>
      <Pop at={4}>
        <Frame src={src} w={900} tilt={-6} accent={accent} from={4} />
      </Pop>
    </Row>
  </Stage>
);

// 4 — V1: Sept 2025, Replit agent + ChatGPT, 3 days, $15
export const S4: React.FC<SceneProps> = ({ b }) => (
  <>
    <VersionBeat v="V1" src="v1-home.mp4" when="سبتمبر 2025" accent={ACCENT.versions}>
      <Pop at={s(b, 1)}>
        <Row gap={16}>
          <Chip size={42} ltr>Replit agent</Chip>
          <Chip size={42} ltr>ChatGPT</Chip>
        </Row>
      </Pop>
      <Stat at={s(b, 1) + 14} label="أيام"><Count to={3} at={s(b, 1) + 14} dur={20} /></Stat>
      <Stat at={s(b, 1) + 24} label="دولار" hero={ACCENT.versions}>$<Count to={15} at={s(b, 1) + 24} dur={24} /></Stat>
    </VersionBeat>
    <Chapter n={1} title="تلات نسخ" accent={ACCENT.versions} />
  </>
);

// 5 — V2: May 2026, Claude Code + DeepSeek, one afternoon, 87 cents
export const S5: React.FC<SceneProps> = ({ b }) => (
  <VersionBeat v="V2" src="v2-home.mp4" when="مايو 2026" accent={ACCENT.versions}>
    <Pop at={10}>
      <Row gap={16}>
        <Chip size={42} ltr>Claude Code</Chip>
        <Chip size={42} ltr>DeepSeek</Chip>
      </Row>
    </Pop>
    <Stat at={s(b, 1)} label="بعد ضهر واحد"><Icon name="clock" size={84} color={D.text} draw={s(b, 1)} /></Stat>
    <Stat at={s(b, 1) + 14} label="بس" hero={ACCENT.versions}>$<Count to={0.87} at={s(b, 1) + 14} dur={26} fmt={(n) => n.toFixed(2)} /></Stat>
  </VersionBeat>
);

// 6 — side by side: the same look; V2 fixed SEO and UX, never the design
export const S6: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const same = s(b, 1);
  return (
    <Stage gap={44}>
      <Row gap={50} ltr>
        <Pop at={2}>
          <Col gap={14}>
            <Frame src="v1-home-desk.jpg" w={760} url="V1 · 2025" />
          </Col>
        </Pop>
        {frame >= same && (
          <Slam at={same}>
            <T size={140} color={ACCENT.versions}>=</T>
          </Slam>
        )}
        <Pop at={8}>
          <Frame src="v2-home-desk.jpg" w={760} url="V2 · 2026" />
        </Pop>
      </Row>
      <div style={{ height: 100 }}>
        {frame >= same && frame < s(b, 2) && (
          <Slam at={same}>
            <T size={80}>نفس الشكل بالظبط!</T>
          </Slam>
        )}
        {frame >= s(b, 2) && (
          <Row gap={22}>
            {[
              ["SEO", true],
              ["UX", true],
              ["الديزاين", false],
            ].map(([t, ok], i) => (
              <Pop key={t as string} at={s(b, 2) + i * 8}>
                <Chip size={48} ltr={i < 2} bg={ok ? C.card : C.orangeSoft}>
                  <Icon name={ok ? "check" : "x"} size={46} color={ok ? C.green : C.red} sw={11} /> {t as string}
                </Chip>
              </Pop>
            ))}
          </Row>
        )}
      </div>
    </Stage>
  );
};

// 7 — v3 asked a different question: how little of me does this need?
export const S7: React.FC<SceneProps> = ({ b }) => (
  <Stage gap={20} zoom={1.1}>
    <Pop at={2}>
      <T size={60} color={D.dim}>النسخة التالتة سألت سؤال مختلف…</T>
    </Pop>
    <Slam at={s(b, 1)}>
      <T size={130}>
        محتاجني <Mark at={s(b, 1) + 10} color={ACCENT.versions}>أنا</Mark> قد إيه؟
      </T>
    </Slam>
    <Flash at={s(b, 1)} peak={0.25} />
  </Stage>
);

// 8 — the answer: two hours; Claude Opus cloud sessions from the Android app; no terminal, no IDE
export const S8: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bob = useBob(28, 7);
  return (
    <>
      <Stage gap={40} zoom={1.1}>
        <Row gap={90}>
          <Col gap={30} style={{ alignItems: "flex-end" }}>
            <Slam at={36}>
              <Row gap={26}>
                <T size={170} color={ACCENT.hours}>ساعتين</T>
                <Icon name="clock" size={150} color={D.text} draw={40} />
              </Row>
            </Slam>
            {frame >= s(b, 2) && (
              <Row gap={18}>
                {["Terminal", "IDE"].map((t, i) => (
                  <Pop key={t} at={s(b, 2) + i * 8}>
                    <Chip size={50} ltr>
                      <Strike at={s(b, 2) + i * 8 + 6}>{t}</Strike>
                    </Chip>
                  </Pop>
                ))}
              </Row>
            )}
          </Col>
          {frame >= s(b, 1) && (
            <Pop at={s(b, 1)} style={{ transform: `translateY(${bob}px)` }}>
              <Phone w={270} glow>
                <T size={20} weight={600} color={C.inkSoft} ltr>Claude · Android</T>
                <Bubble at={s(b, 1) + 8} me size={22}>ابدأ session على موقعي</Bubble>
                <Bubble at={s(b, 1) + 18} size={22}>Claude Opus شغال في الكلاود</Bubble>
              </Phone>
            </Pop>
          )}
        </Row>
      </Stage>
      <Chapter n={2} title="ساعتين من الموبايل" accent={ACCENT.hours} />
    </>
  );
};

// 9 — my whole job: prompts, preview links, approving PRs (real Cloudflare preview comment)
export const S9: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const steps: [Parameters<typeof Badge>[0]["name"], string, number][] = [
    ["keyboard", "بكتب prompts", s(b, 1)],
    ["link", "بفتح الـ preview", s(b, 2)],
    ["merge", "بوافق على الـ PR", s(b, 3)],
  ];
  return (
    <Stage gap={50} zoom={1.12}>
      <Pop at={2}>
        <T size={72}>
          شغلي كان <Mark at={10} color={ACCENT.hours}>تلات حاجات بس</Mark>
        </T>
      </Pop>
      <Row gap={50}>
        {steps.map(([icon, label, at], i) => (
          <Pop key={label} at={at}>
            <Glass w={420} pad={30} accent={frame >= at && (i === steps.length - 1 || frame < steps[i + 1][2]) ? ACCENT.hours : undefined}>
              <Col gap={18}>
                <Badge name={icon} size={130} bg={C.tealSoft} />
                <T size={46}>{label}</T>
              </Col>
            </Glass>
          </Pop>
        ))}
      </Row>
      <div style={{ height: 170 }}>
        {frame >= s(b, 2) && (
          <Pop at={s(b, 2) + 10}>
            <div style={{ width: 1000, background: "#0D1117", border: "2px solid #30363D", borderRadius: 14, padding: "18px 26px", fontFamily: theme.fonts.main, color: "#E6EDF3", direction: "ltr", boxShadow: "0 30px 80px #000a" }}>
              <div style={{ fontSize: 22, color: "#8B949E" }}>cloudflare-workers-and-pages · PR #8</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6, display: "flex", alignItems: "center", gap: 10 }}><Icon name="check" size={34} color="#3FB950" sw={12} /> Deploy successful!</div>
              <div style={{ fontSize: 26, marginTop: 6 }}>
                Preview URL: <span style={{ color: "#58A6FF" }}>ccr-8465ebe9-ezz0xs.personal-website-17i.pages.dev</span>
              </div>
            </div>
          </Pop>
        )}
      </div>
    </Stage>
  );
};

// 10 — five sessions from the phone; 10:03 → 20:36; three in parallel
export const S10: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const par = s(b, 2);
  const X0 = 260;
  const X1 = 1660;
  const xAt = (h: number) => X0 + ((h - 10) / 11) * (X1 - X0);
  const axis = ease(frame, [4, 34], [0, 1]);
  if (frame >= par) {
    const items: [string, "code" | "search" | "brush"][] = [
      ["بتنضف الكود", "code"],
      ["بتراجع الـ SEO", "search"],
      ["بترسم اتجاهات للديزاين", "brush"],
    ];
    return (
      <Stage gap={50}>
        <Pop at={par}>
          <T size={74}>
            تلات sessions <Mark at={par + 8} color={ACCENT.hours}>في نفس الوقت</Mark>
          </T>
        </Pop>
        <Row gap={40}>
          {items.map(([label, icon], i) => (
            <Pop key={label} at={par + 6 + i * 6}>
              <Glass w={500} pad={30} accent={ACCENT.hours}>
                <Col gap={20}>
                  <T size={26} weight={600} color={D.dim} ltr>session {i + 1}</T>
                  <Icon name={icon} size={110} color={D.text} />
                  <div style={{ width: 400, height: 22, borderRadius: 11, background: "#ffffff18", overflow: "hidden", direction: "ltr" }}>
                    <div style={{ height: "100%", width: `${20 + ((frame * (1.1 + i * 0.3)) % 80)}%`, background: ACCENT.hours }} />
                  </div>
                  <div style={{ height: 64 }}>
                    {frame >= s(b, 3) && (
                      <Pop at={s(b, 3) + i * 12} from={20}>
                        <T size={40}>{label}</T>
                      </Pop>
                    )}
                  </div>
                </Col>
              </Glass>
            </Pop>
          ))}
        </Row>
      </Stage>
    );
  }
  return (
    <Stage>
      <Pop at={0}>
        <T size={74}>
          <Mark at={8} color={ACCENT.hours}>5 sessions</Mark> · كلهم من الموبايل
        </T>
      </Pop>
      <div style={{ position: "relative", width: 1920, height: 420 }}>
        <div style={{ position: "absolute", left: X0, top: 230, height: 8, width: (X1 - X0) * axis, background: D.text, borderRadius: 4 }} />
        {[10, 12, 14, 16, 18, 20].map((h, i) => (
          <div key={h} style={{ position: "absolute", left: xAt(h) - 50, top: 256, width: 100, opacity: ease(frame, [10 + i * 3, 20 + i * 3], [0, 1]) }}>
            <T size={30} weight={600} color={D.dim} ltr>{h}:00</T>
          </div>
        ))}
        {[10.05, 11.4, 12.2, 14.6, 17.3].map((h, i) => (
          <div key={i} style={{ position: "absolute", left: xAt(h) - 30, top: 120 }}>
            <Pop at={14 + i * 6}>
              <Phone w={60} glow />
            </Pop>
          </div>
        ))}
        {[
          { h: 10.05, t: "10:03", at: s(b, 1), icon: "play" as const },
          { h: 20.6, t: "20:36", at: w(b, "تمانية"), icon: "merge" as const },
        ].map((f) => (
          <div key={f.t} style={{ position: "absolute", left: xAt(f.h) - 110, top: -10 }}>
            <Slam at={f.at} tilt={0}>
              <Chip bg={f.t === "20:36" ? ACCENT.hours : C.mustard} color={C.ink} size={50} ltr>
                <Icon name={f.icon} size={50} sw={8} /> {f.t}
              </Chip>
            </Slam>
          </div>
        ))}
      </div>
    </Stage>
  );
};

// 11 — me 2h vs agents 10.5h; cloud sessions keep going with the screen off; the real change
export const S11: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const cloud = s(b, 2);
  const real = s(b, 3);
  const FULL = 1050;
  if (frame >= real)
    return (
      <Stage>
        <Slam at={real}>
          <T size={120}>
            ده <Mark at={real + 8} color={ACCENT.hours}>التغيير الحقيقي</Mark>
          </T>
        </Slam>
      </Stage>
    );
  if (frame >= cloud) {
    const blink = (i: number) => (Math.floor(frame / 6 + i * 3) % 4 === 0 ? ACCENT.hours : "#ffffff22");
    return (
      <Stage zoom={1.3}>
        <Row gap={120}>
          <Pop at={cloud}>
            <Col gap={16}>
              <Badge name="cloud" size={230} bg={C.tealSoft} />
              <Row gap={14} ltr>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 80, height: 110, borderRadius: 14, border: `3px solid ${D.line}`, background: D.glass, display: "flex", flexDirection: "column", gap: 10, padding: 14, boxSizing: "border-box" }}>
                    {[0, 1, 2].map((k) => (
                      <div key={k} style={{ width: 14, height: 14, borderRadius: 7, background: blink(i + k) }} />
                    ))}
                  </div>
                ))}
              </Row>
              <T size={38} weight={600} color={D.dim} ltr>Anthropic</T>
            </Col>
          </Pop>
          <Pop at={w(b, "الشاشة")}>
            <Col gap={20}>
              <Phone w={180} off />
              <T size={46}>الشاشة مقفولة</T>
            </Col>
          </Pop>
        </Row>
      </Stage>
    );
  }
  const bar = (label: string, hrs: number, at: number, color: string, icon: "phone" | "robot") => (
    <Pop at={at} x={-60} from={0}>
      <Row gap={30} style={{ width: 1600, justifyContent: "flex-start" }}>
        <div style={{ width: 320, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <Icon name={icon} size={80} color={D.text} />
          <T size={52}>{label}</T>
        </div>
        <div style={{ height: 84, width: FULL * (hrs / 10.5) * ease(frame, [at + 4, at + 34], [0, 1]), background: color, borderRadius: 18, minWidth: 10, boxShadow: `0 0 40px ${color}55` }} />
        <T size={64} ltr>
          <Count to={hrs} at={at + 4} dur={30} fmt={(n) => (hrs % 1 ? n.toFixed(1) : Math.round(n).toString())} />h
        </T>
      </Row>
    </Pop>
  );
  return (
    <Stage gap={70}>
      {bar("أنا", 2, s(b, 0), C.orange, "phone")}
      {bar("الـ agents", 10.5, s(b, 1), ACCENT.hours, "robot")}
    </Stage>
  );
};
