// Beats 12–26: chapter 3 (two hours), chapter 4 (design first), mid-video reset, chapter 5 (numbers).
import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { s, w } from "../timing";
import { Badge, Card, Chip, Col, Count, Flash, Icon, Illus, Laptop, Mark, Phone, Pop, Row, Slam, Stage, Strike, T, Win, ease, rnd, useBob, useShakeAt } from "../kit";
import { Chapter, SceneProps } from "./A";

const C = theme.colors;

// 12 — the answer: two hours; three jobs: prompts, previews, approvals
export const S12: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const jobs: [Parameters<typeof Badge>[0]["name"], string, number][] = [
    ["keyboard", "بكتب prompts", s(b, 2)],
    ["link", "بفتح الـ preview", s(b, 3)],
    ["check", "بوافق على الـ PR", s(b, 4)],
  ];
  return (
    <>
      <Stage gap={60}>
        {frame < s(b, 1) ? (
          <Row gap={50}>
            <Slam at={34}>
              <T size={200} color={C.teal}>ساعتين</T>
            </Slam>
            <Pop at={40}>
              <Icon name="clock" size={200} draw={40} />
            </Pop>
          </Row>
        ) : (
          <>
            <Pop at={s(b, 1)}>
              <T size={80}>
                شغلي كله <Mark at={s(b, 1) + 8}>تلات حاجات</Mark>
              </T>
            </Pop>
            <Row gap={60}>
              {jobs.map(([icon, label, at]) => (
                <Pop key={label} at={at}>
                  <Card w={430} pad={34}>
                    <Col gap={18}>
                      <Badge name={icon} size={150} bg={C.tealSoft} />
                      <T size={48}>{label}</T>
                    </Col>
                  </Card>
                </Pop>
              ))}
            </Row>
          </>
        )}
      </Stage>
      <Chapter n={3} title="ساعتين من الموبايل" />
    </>
  );
};

// 13 — five sessions from the phone; first 10:03, last merge 20:36
export const S13: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const X0 = 260;
  const X1 = 1660;
  const xAt = (h: number) => X0 + ((h - 10) / 11) * (X1 - X0);
  const axis = ease(frame, [4, 34], [0, 1]);
  const sessions = [10.05, 11.4, 12.2, 14.6, 17.3];
  return (
    <Stage zoom={1}>
      <Pop at={0}>
        <T size={76}>
          <Mark at={8}>5 sessions</Mark> · كلهم من الموبايل
        </T>
      </Pop>
      <div style={{ position: "relative", width: 1920, height: 420 }}>
        <div style={{ position: "absolute", left: X0, top: 230, height: 10, width: (X1 - X0) * axis, background: C.ink, borderRadius: 5 }} />
        {[10, 12, 14, 16, 18, 20].map((h, i) => (
          <div key={h} style={{ position: "absolute", left: xAt(h) - 50, top: 260, width: 100, opacity: ease(frame, [10 + i * 3, 20 + i * 3], [0, 1]) }}>
            <T size={32} weight={600} color={C.inkSoft} ltr>{h}:00</T>
          </div>
        ))}
        {sessions.map((h, i) => (
          <div key={i} style={{ position: "absolute", left: xAt(h) - 34, top: 120 }}>
            <Pop at={14 + i * 6}>
              <div style={{ transform: "scale(0.9)" }}>
                <Phone w={64} />
              </div>
            </Pop>
          </div>
        ))}
        {[
          { h: 10.05, t: "10:03", at: s(b, 1), icon: "play" as const },
          { h: 20.6, t: "20:36", at: s(b, 2), icon: "merge" as const },
        ].map((f) => (
          <div key={f.t} style={{ position: "absolute", left: xAt(f.h) - 110, top: -10 }}>
            <Slam at={f.at} tilt={0}>
              <Chip bg={f.t === "20:36" ? C.teal : C.mustard} color={f.t === "20:36" ? C.white : C.ink} size={50} ltr>
                <Icon name={f.icon} size={50} color={f.t === "20:36" ? C.white : C.ink} sw={8} /> {f.t}
              </Chip>
            </Slam>
          </div>
        ))}
      </div>
    </Stage>
  );
};

// 14 — three sessions in parallel: cleaning code, reviewing SEO, sketching design
export const S14: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const items: [string, string, number][] = [
    ["بتنضف الكود", "code", s(b, 1)],
    ["بتراجع الـ SEO", "search", s(b, 2)],
    ["بترسم اتجاهات للديزاين", "brush", s(b, 3)],
  ];
  return (
    <Stage gap={50}>
      <Pop at={0}>
        <T size={76}>
          تلات sessions <Mark at={10}>في نفس الوقت</Mark>
        </T>
      </Pop>
      <Row gap={44}>
        {items.map(([label, icon, at], i) => {
          const prog = (Math.sin(frame / (18 + i * 5) + i) + 1) / 2;
          return (
            <Pop key={label} at={6 + i * 6}>
              <Win w={520} title={`session ${i + 1}`}>
                <Col gap={22}>
                  <Icon name={icon as "code"} size={120} />
                  <div style={{ width: 420, height: 26, borderRadius: 13, border: `4px solid ${C.ink}`, overflow: "hidden", direction: "ltr" }}>
                    <div style={{ height: "100%", width: `${20 + ((frame * (1.1 + i * 0.3)) % 80)}%`, background: i === 0 ? C.teal : C.tealBright, opacity: 0.6 + prog * 0.4 }} />
                  </div>
                  <div style={{ height: 70 }}>
                    <Pop at={at} from={20}>
                      <T size={44}>{label}</T>
                    </Pop>
                  </div>
                </Col>
              </Win>
            </Pop>
          );
        })}
      </Row>
    </Stage>
  );
};

// 15 — my part: 2 hours on and off; agents: the ten and a half hours in between
export const S15: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const FULL = 1150;
  const bar = (label: string, hrs: number, at: number, color: string, icon: "phone" | "robot") => (
    <Pop at={at} x={-60} from={0}>
      <Row gap={30} style={{ width: 1600, justifyContent: "flex-start" }}>
        <div style={{ width: 320, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <Icon name={icon} size={80} />
          <T size={52}>{label}</T>
        </div>
        <div style={{ height: 84, width: FULL * (hrs / 10.5) * ease(frame, [at + 4, at + 34], [0, 1]), background: color, border: `5px solid ${C.ink}`, borderRadius: 18, minWidth: 10 }} />
        <T size={64} ltr>
          <Count to={hrs} at={at + 4} dur={30} fmt={(n) => (hrs % 1 ? n.toFixed(1) : Math.round(n).toString())} />h
        </T>
      </Row>
    </Pop>
  );
  return (
    <Stage gap={70} zoom={1.1}>
      {bar("أنا", 2, s(b, 0), C.orange, "phone")}
      {bar("الـ agents", 10.5, s(b, 1), C.teal, "robot")}
    </Stage>
  );
};

// 16 — cloud sessions run on Anthropic's machines; work goes on with the screen off
export const S16: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const end = s(b, 3);
  if (frame >= end)
    return (
      <Stage>
        <Slam at={end}>
          <T size={120}>
            ده <Mark at={end + 8}>التغيير الحقيقي</Mark>
          </T>
        </Slam>
      </Stage>
    );
  const blink = (i: number) => (Math.floor(frame / 6 + i * 3) % 4 === 0 ? C.tealBright : C.paperDeep);
  return (
    <Stage gap={40} zoom={1}>
      <Row gap={120}>
        <Pop at={0}>
          <Col gap={14}>
            <div style={{ position: "relative" }}>
              <Badge name="cloud" size={260} bg={C.tealSoft} />
            </div>
            <Row gap={16} ltr>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 90, height: 120, borderRadius: 14, border: `5px solid ${C.ink}`, background: C.card, display: "flex", flexDirection: "column", gap: 10, padding: 14, boxSizing: "border-box" }}>
                  {[0, 1, 2].map((k) => (
                    <div key={k} style={{ width: 14, height: 14, borderRadius: 7, background: blink(i + k) }} />
                  ))}
                </div>
              ))}
            </Row>
            <T size={40} weight={600} color={C.inkSoft} ltr>Anthropic</T>
          </Col>
        </Pop>
        {frame >= s(b, 1) && (
          <Pop at={s(b, 1)}>
            <Col gap={20}>
              <Phone w={190} off />
              <T size={48}>الشاشة مقفولة</T>
            </Col>
          </Pop>
        )}
        {frame >= s(b, 2) && (
          <Pop at={s(b, 2)}>
            <Col gap={20}>
              <Laptop w={360} asleep />
              <T size={48}>مش مستنيني</T>
            </Col>
          </Pop>
        )}
      </Row>
      {frame >= s(b, 1) && (
        <Pop at={s(b, 1) + 10}>
          <Chip bg={C.teal} color={C.white} size={44}>
            الشغل بيكمل <Count to={100} at={s(b, 1) + 10} dur={90} />%
          </Chip>
        </Pop>
      )}
    </Stage>
  );
};

// 17 — V2 fixed what the audit found; looks never touched; this time design came first
export const S17: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Stage gap={50}>
        {frame < s(b, 2) ? (
          <Row gap={90}>
            <Pop at={36}>
              <Card w={560} pad={34}>
                <T size={50} style={{ marginBottom: 18 }}>V2 · الـ audit</T>
                {["SEO", "UX", "Performance"].map((t, i) => (
                  <Row key={t} gap={18} style={{ justifyContent: "flex-start", marginTop: 8 }}>
                    <Icon name="check" size={56} color={C.green} sw={10} draw={44 + i * 6} />
                    <T size={44} ltr>{t}</T>
                  </Row>
                ))}
              </Card>
            </Pop>
            {frame >= s(b, 1) && (
              <Pop at={s(b, 1)}>
                <Col gap={16}>
                  <Badge name="brush" size={200} />
                  <T size={54}>
                    <Strike at={s(b, 1) + 14}>شكل الموقع</Strike>
                  </T>
                </Col>
              </Pop>
            )}
          </Row>
        ) : (
          <Slam at={s(b, 2)}>
            <Row gap={30}>
              <Badge name="brush" size={170} bg={C.mustard} />
              <T size={120}>الديزاين الأول</T>
            </Row>
          </Slam>
        )}
      </Stage>
      <Chapter n={4} title="الديزاين جه الأول" />
    </>
  );
};

const MiniSite: React.FC<{ accent: string; bg: string; w?: number; dark?: boolean }> = ({ accent, bg, w: width = 300, dark }) => (
  <div style={{ width: width, height: width * 1.5, borderRadius: 24, border: `5px solid ${C.ink}`, background: bg, padding: 18, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 12, boxShadow: `8px 8px 0 ${C.ink}` }}>
    <div style={{ height: 40, borderRadius: 10, background: accent }} />
    <div style={{ height: 18, width: "70%", borderRadius: 9, background: dark ? "#ffffff55" : "#1E2A2E44" }} />
    <div style={{ height: 18, width: "50%", borderRadius: 9, background: dark ? "#ffffff33" : "#1E2A2E22" }} />
    <div style={{ flex: 1, borderRadius: 14, background: dark ? "#ffffff12" : "#1E2A2E10", border: `3px solid ${dark ? "#ffffff30" : "#1E2A2E30"}` }} />
    <div style={{ height: 34, width: "45%", borderRadius: 17, background: accent }} />
  </div>
);

// 18 — three design directions as artifacts, compared on the phone; picked one
export const S18: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const pick = s(b, 2);
  const k = ease(frame, [pick, pick + 14], [0, 1]);
  const opts = [
    { a: C.orange, bg: "#FFF4EA" },
    { a: C.teal, bg: C.card },
    { a: "#6B5BD2", bg: "#F3F1FF" },
  ];
  return (
    <Stage gap={50} zoom={0.95}>
      <Pop at={0}>
        <T size={70}>
          تلات اتجاهات كـ <Mark at={10}>Claude artifacts</Mark>
        </T>
      </Pop>
      <Row gap={50} ltr>
        {opts.map((o, i) => (
          <Pop key={i} at={8 + i * 6}>
            <div
              style={{
                position: "relative",
                transform: `rotate(${(i - 1) * 6 * (1 - k)}deg) scale(${i === 1 ? 1 + k * 0.15 : 1 - k * 0.1})`,
                opacity: i === 1 ? 1 : 1 - k * 0.5,
              }}
            >
              <MiniSite accent={o.a} bg={o.bg} w={280} />
              {i !== 1 && frame >= pick && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="x" size={240} color={C.red} sw={7} draw={pick + 6} />
                </div>
              )}
            </div>
          </Pop>
        ))}
      </Row>
      <div style={{ height: 80 }}>
        {frame >= s(b, 1) && frame < pick && (
          <Pop at={s(b, 1)}>
            <Chip size={44}>
              <Icon name="phone" size={50} sw={8} /> بفتحها على الموبايل وأقارن
            </Chip>
          </Pop>
        )}
        {frame >= pick && (
          <Slam at={pick + 6}>
            <Chip bg={C.teal} color={C.white} size={50}>اخترت ده</Chip>
          </Slam>
        )}
      </div>
    </Stage>
  );
};

// 19 — PR #8 full redesign: teal, IBM Plex Sans (AR + EN), new layouts, light + dark
export const S19: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={50}>
      <Slam at={2}>
        <Chip bg={C.teal} color={C.white} size={64} ltr>
          PR #8 · Redesign
        </Chip>
      </Slam>
      <Row gap={70}>
        {frame >= s(b, 1) && (
          <Pop at={s(b, 1)}>
            <Card pad={30}>
              <Row gap={14} ltr>
                {[C.teal, C.tealBright, C.tealSoft, C.paper].map((c, i) => (
                  <Pop key={c} at={s(b, 1) + 4 + i * 4} from={20}>
                    <div style={{ width: 90, height: 90, borderRadius: 18, background: c, border: `4px solid ${C.ink}` }} />
                  </Pop>
                ))}
              </Row>
              <Row gap={30} style={{ marginTop: 20 }}>
                <T size={90} ltr>Aa</T>
                <T size={90}>أب</T>
              </Row>
              <T size={30} weight={600} color={C.inkSoft} ltr>IBM Plex Sans · Arabic</T>
            </Card>
          </Pop>
        )}
        {frame >= s(b, 2) && (
          <Pop at={s(b, 2)}>
            <Row gap={24} ltr>
              <Col gap={10}>
                <MiniSite accent={C.teal} bg={C.card} w={220} />
                <Icon name="sun" size={60} />
              </Col>
              <Col gap={10}>
                <MiniSite accent={C.tealBright} bg={C.night} w={220} dark />
                <Icon name="moon" size={60} />
              </Col>
            </Row>
          </Pop>
        )}
      </Row>
    </Stage>
  );
};

// 20 — small fixes: date format, cookie banner, Arabic filter listing "تقنية" five times
export const S20: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const d = s(b, 1);
  const c = s(b, 2);
  const f = s(b, 3);
  const merge = s(b, 4);
  const shrink = ease(frame, [c + 14, c + 34], [0, 1], theme.ease.inOut);
  const mk = ease(frame, [merge + 4, merge + 22], [0, 1], theme.ease.inOut);
  return (
    <Stage gap={50} zoom={1.1}>
      <Pop at={0}>
        <T size={72}>
          تصليحات صغيرة… <Mark at={10}>بس بتفرق</Mark>
        </T>
      </Pop>
      <div style={{ height: 420, width: 1500, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {frame >= d && frame < c && (
          <Row gap={50} ltr>
            <Pop at={d}>
              <Chip size={70} ltr>
                <Strike at={d + 12}>10/4/2026</Strike>
              </Chip>
            </Pop>
            <Pop at={d + 4} from={0} x={-30}>
              <T size={80} color={C.inkSoft}>→</T>
            </Pop>
            <Pop at={d + 18}>
              <Chip size={70} ltr bg={C.tealSoft}>Oct 4, 2026</Chip>
            </Pop>
          </Row>
        )}
        {frame >= c && frame < f && (
          <Pop at={c}>
            <div style={{ position: "relative", width: 1100, height: 400, borderRadius: 24, border: `5px solid ${C.ink}`, background: C.card, boxShadow: `10px 10px 0 ${C.ink}`, overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  right: 20 + shrink * 0,
                  bottom: 20,
                  width: 1060 - shrink * 700,
                  height: 160 - shrink * 30,
                  borderRadius: 18,
                  background: C.paperDeep,
                  border: `4px solid ${C.ink}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <Icon name="cookie" size={70} />
                <T size={40}>الكوكيز</T>
              </div>
            </div>
          </Pop>
        )}
        {frame >= f &&
          [0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                transform: `translate(${(i - 2) * 260 * (1 - mk)}px, ${(i % 2 ? 40 : -40) * (1 - mk)}px)`,
                opacity: i === 2 ? 1 : 1 - mk,
              }}
            >
              <Pop at={f + i * 5}>
                <Chip size={58} bg={i === 2 && mk > 0.5 ? C.teal : C.card} color={i === 2 && mk > 0.5 ? C.white : C.ink}>
                  تقنية
                </Chip>
              </Pop>
            </div>
          ))}
        {frame >= f + 30 && frame < merge && (
          <div style={{ position: "absolute", top: 300 }}>
            <Slam at={f + 30}>
              <T size={70} color={C.red} ltr>×5</T>
            </Slam>
          </div>
        )}
      </div>
    </Stage>
  );
};

// 21 — mid-video reset: nice words… but is it actually faster? let's talk numbers
export const S21: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const n = s(b, 1);
  const shake = useShakeAt([n], 18);
  return (
    <Stage style={{ transform: shake }}>
      {frame < n ? (
        <Col gap={20}>
          <Pop at={2}>
            <T size={70} color={C.paperDeep}>كلام حلو…</T>
          </Pop>
          <Slam at={w(b, "بس")}>
            <T size={110} color={C.white}>
              بس أسرع <span style={{ color: C.tealBright }}>فعلًا؟</span>
            </T>
          </Slam>
        </Col>
      ) : (
        <>
          {Array.from({ length: 26 }).map((_, i) => {
            const x = rnd(`nx${i}`) * 1800 + 60;
            const sp = 8 + rnd(`ns${i}`) * 10;
            const y = ((frame - n) * sp + rnd(`ny${i}`) * 900) % 1200 - 120;
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, opacity: 0.25 }}>
                <T size={40 + rnd(`nz${i}`) * 50} color={C.tealBright} ltr>
                  {Math.floor(rnd(`nv${i}`) * 100)}
                </T>
              </div>
            );
          })}
          <Slam at={n}>
            <T size={240} color={C.white}>أرقام.</T>
          </Slam>
          <Flash at={n} peak={0.6} />
        </>
      )}
    </Stage>
  );
};

// 22 — one 845 KB bundle with every post → server-rendered pages + small JSON per page
export const S22: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const split = s(b, 2);
  const k = ease(frame, [split, split + 20], [0, 1]);
  return (
    <>
      <Stage gap={50}>
        <Row gap={90}>
          <Pop at={38}>
            <div style={{ position: "relative", width: 560, height: 440 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 1 - k,
                  transform: `scale(${1 + k * 0.2})`,
                  borderRadius: 30,
                  border: `6px solid ${C.ink}`,
                  background: C.orangeSoft,
                  boxShadow: `12px 12px 0 ${C.ink}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <T size={44} ltr>bundle.js</T>
                <T size={110} ltr color={C.orange}>
                  <Count to={845} at={40} dur={30} /> KB
                </T>
                <T size={34} weight={600} color={C.inkSoft}>كل البوستات جواه</T>
              </div>
              {k > 0 &&
                Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: 200 + (i % 3 - 1) * 210 * k,
                      top: 180 + (Math.floor(i / 3) - 1) * 150 * k,
                      opacity: k,
                    }}
                  >
                    <Chip size={30} ltr bg={C.tealSoft}>post.json</Chip>
                  </div>
                ))}
            </div>
          </Pop>
          {frame >= s(b, 1) && (
            <Pop at={s(b, 1)}>
              <Col gap={14}>
                <Badge name="server" size={200} bg={C.tealSoft} />
                <T size={46} ltr>React · SSR</T>
                <T size={36} weight={600} color={C.inkSoft}>كل صفحة جاهزة من السيرفر</T>
              </Col>
            </Pop>
          )}
        </Row>
      </Stage>
      <Chapter n={5} title="الأداء بالأرقام" />
    </>
  );
};

// 23 — images were worse: 198.5 MB → WebP → 16.3 MB
export const S23: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const big = s(b, 1);
  const sm = s(b, 3);
  const k = ease(frame, [sm, sm + 30], [0, 1], theme.ease.inOut);
  const W = 1300;
  const shake = useShakeAt([sm + 28], 12);
  return (
    <Stage gap={50} zoom={1.1}>
      <Pop at={0}>
        <Row gap={20}>
          <Icon name="image" size={90} />
          <T size={74}>
            الصور كانت <Mark at={10} color={C.orangeSoft}>أسوأ</Mark> من الكود
          </T>
        </Row>
      </Pop>
      {frame >= big && (
        <Pop at={big}>
          <div style={{ width: W, direction: "ltr", transform: shake }}>
            <div
              style={{
                height: 130,
                width: W * (ease(frame, [big, big + 24], [0, 1]) * (1 - k * (1 - 16.3 / 198.5))),
                background: k > 0.5 ? C.teal : C.orange,
                border: `6px solid ${C.ink}`,
                borderRadius: 24,
                boxShadow: `10px 10px 0 ${C.ink}`,
              }}
            />
            <Row gap={20} ltr style={{ justifyContent: "flex-start", marginTop: 26 }}>
              <T size={110} ltr color={k > 0.5 ? C.teal : C.ink}>
                <Count from={0} to={198.5} at={big} dur={24} fmt={(n) => (frame >= sm ? (198.5 - (198.5 - 16.3) * k).toFixed(1) : n.toFixed(1))} /> MB
              </T>
              {frame >= s(b, 2) && (
                <Pop at={s(b, 2)}>
                  <Chip size={50} ltr bg={C.mustard}>WebP</Chip>
                </Pop>
              )}
            </Row>
          </div>
        </Pop>
      )}
    </Stage>
  );
};

const Ring: React.FC<{ from: number; to: number; at: number; label: string }> = ({ from, to, at, label }) => {
  const frame = useCurrentFrame();
  const v = ease(frame, [at + 6, at + 40], [from, to]);
  const R = 120;
  const L = 2 * Math.PI * R;
  const col = v >= 90 ? C.green : v >= 50 ? C.mustard : C.red;
  return (
    <Pop at={at}>
      <Col gap={16}>
        <div style={{ position: "relative", width: 300, height: 300 }}>
          <svg width={300} height={300} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={150} cy={150} r={R} stroke={C.paperDeep} strokeWidth={26} fill={C.card} />
            <circle cx={150} cy={150} r={R} stroke={col} strokeWidth={26} fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - v / 100)} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <T size={100} ltr>{Math.round(v)}</T>
          </div>
        </div>
        <T size={44}>{label}</T>
        <T size={34} weight={600} color={C.inkSoft} ltr>
          {from} → {to}
        </T>
      </Col>
    </Pop>
  );
};

// 24 — Lighthouse mobile, same test, before vs after
export const S24: React.FC<SceneProps> = ({ b }) => (
  <Stage gap={40}>
    <Pop at={0}>
      <Chip size={50} bg={C.mustard}>
        Lighthouse · موبايل · نفس الجهاز
      </Chip>
    </Pop>
    <Row gap={100}>
      <Ring from={50} to={74} at={s(b, 1)} label="الأداء" />
      <Ring from={87} to={100} at={s(b, 2)} label="Accessibility" />
      <Ring from={85} to={100} at={s(b, 3)} label="SEO" />
    </Row>
  </Stage>
);

// 25 — LCP 11.3 s → 5.1 s; page weight 2,070 KB → 1,122 KB
export const S25: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const pair = (title: string, a: number, z: number, unit: string, at: number) => {
    const g = (t: number) => ease(frame, [at + t, at + t + 24], [0, 1]);
    return (
      <Pop at={at}>
        <Card w={760} pad={36}>
          <T size={48} style={{ marginBottom: 20 }}>{title}</T>
          {[
            ["قبل", a, C.orange, 4],
            ["بعد", z, C.teal, 16],
          ].map(([l, v, c, t]) => (
            <Row key={l as string} gap={20} style={{ justifyContent: "flex-start", marginTop: 14 }}>
              <T size={38} weight={600} style={{ width: 90 }}>{l as string}</T>
              <div style={{ width: 380, direction: "ltr" }}>
                <div style={{ height: 50, width: 380 * ((v as number) / a) * g(t as number), background: c as string, border: `4px solid ${C.ink}`, borderRadius: 12 }} />
              </div>
              <T size={44} ltr>
                <Count to={v as number} at={at + (t as number)} dur={24} fmt={(n) => (unit === "s" ? n.toFixed(1) : Math.round(n).toLocaleString("en-US"))} /> {unit}
              </T>
            </Row>
          ))}
        </Card>
      </Pop>
    );
  };
  return (
    <Stage zoom={1.1}>
      <Row gap={50}>
        {pair("أكبر عنصر بيظهر في (LCP)", 11.3, 5.1, "s", s(b, 0))}
        {pair("حجم الصفحة الرئيسية", 2070, 1122, "KB", s(b, 1))}
      </Row>
    </Stage>
  );
};

// 26 — caveat: local server, no CDN, no compression; real site scores higher; the gap is the point
export const S26: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const gap = s(b, 2);
  const rows: [string, string, string][] = [
    ["الأداء", "50", "74"],
    ["Accessibility", "87", "100"],
    ["SEO", "85", "100"],
  ];
  const bob = useBob(20, 6);
  return (
    <Stage gap={40}>
      <Row gap={24}>
        {["سيرفر محلي", "من غير CDN", "من غير compression"].map((t, i) => (
          <Pop key={t} at={4 + i * 8}>
            <Chip size={44} bg={i === 0 ? C.mustard : C.card}>{t}</Chip>
          </Pop>
        ))}
      </Row>
      {frame >= s(b, 1) && (
        <Pop at={s(b, 1)}>
          <Card w={900} pad={30}>
            <Row gap={0} style={{ justifyContent: "space-between" }}>
              <T size={40} style={{ width: 340 }} />
              <T size={40} color={C.orange} style={{ width: 200 }}>قبل</T>
              <T size={40} color={C.teal} style={{ width: 200 }}>بعد</T>
            </Row>
            {rows.map(([l, a, z]) => (
              <Row key={l} gap={0} style={{ justifyContent: "space-between", marginTop: 6 }}>
                <T size={44} style={{ width: 340 }}>{l}</T>
                <T size={56} ltr style={{ width: 200 }}>{a}</T>
                <T size={56} ltr style={{ width: 200 }}>{z}</T>
              </Row>
            ))}
          </Card>
        </Pop>
      )}
      <div style={{ height: 90 }}>
        {frame >= gap && (
          <Slam at={gap}>
            <Chip bg={C.teal} color={C.white} size={52} style={{ transform: `translateY(${bob}px)` }}>
              المهم هو <Icon name="chart" size={56} color={C.white} sw={8} /> الفرق
            </Chip>
          </Slam>
        )}
      </div>
    </Stage>
  );
};
