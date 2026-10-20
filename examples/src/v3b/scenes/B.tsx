// Beats 12–30: chapter 3 (four PRs, real stats), chapter 4 (Lighthouse reports), chapter 5
// (didn't read the code), chapter 6 (the bill), what's next, comment question, end card.
import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../../v3/theme";
import { s, w } from "../timing";
import { ACCENT, Badge, Bubble, Chapter, Chip, Col, Count, D, Flash, Frame, Glass, Icon, Mark, Phone, Pop, Row, Shot, Slam, Stage, Strike, T, ease, rnd, useBob, useShakeAt } from "../kit";
import { SceneProps } from "./A";

const C = theme.colors;
const A = ACCENT;

// the four real PRs merged on Oct 17 (titles, line counts and merge times from GitHub)
const PRS = [
  { n: 5, title: "Code cleanup, single route list, faster build, and bug fixes", add: 647, del: 898, files: 33, at: "11:48" },
  { n: 6, title: "perf: convert blog images to WebP and add JPG share images", add: 1362, del: 1509, files: 419, at: "13:10" },
  { n: 7, title: "Add PostHog analytics, session replay and custom events", add: 288, del: 38, files: 17, at: "13:05" },
  { n: 8, title: "Redesign the site: teal palette, IBM Plex fonts, new page layouts", add: 1771, del: 2602, files: 63, at: "18:36" },
];

const PrRow: React.FC<{ pr: (typeof PRS)[number]; at: number; hi?: boolean; w?: number }> = ({ pr, at, hi, w: width = 1500 }) => (
  <Pop at={at} x={-50} from={0}>
    <div
      style={{
        width: width,
        display: "flex",
        alignItems: "center",
        gap: 22,
        direction: "ltr",
        padding: "20px 28px",
        background: "#0D1117",
        border: `2px solid ${hi ? A.prs : "#30363D"}`,
        borderRadius: 14,
        fontFamily: theme.fonts.main,
        boxShadow: hi ? `0 0 50px ${A.prs}44` : "0 20px 50px #0008",
      }}
    >
      <div style={{ padding: "6px 16px", borderRadius: 999, background: "#8957E5", color: C.white, fontWeight: 700, fontSize: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="merge" size={28} color={C.white} sw={10} /> Merged
      </div>
      <div style={{ flex: 1, color: "#E6EDF3", fontSize: 28, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {pr.title} <span style={{ color: "#8B949E" }}>#{pr.n}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, whiteSpace: "nowrap" }}>
        <span style={{ color: "#3FB950" }}>+{pr.add.toLocaleString("en-US")}</span> <span style={{ color: "#F85149" }}>−{pr.del.toLocaleString("en-US")}</span>
      </div>
    </div>
  </Pop>
);

// 12 — four pull requests merged by the end of the day
export const S12: React.FC<SceneProps> = ({ b }) => (
  <>
    <Stage gap={22} zoom={1.1}>
      <Pop at={38}>
        <T size={70} style={{ marginBottom: 20 }}>
          <Mark at={46} color={A.prs}>4 pull requests</Mark> في يوم واحد
        </T>
      </Pop>
      {PRS.map((pr, i) => (
        <PrRow key={pr.n} pr={pr} at={44 + i * 7} />
      ))}
    </Stage>
    <Chapter n={3} title="أربع PRs" accent={A.prs} />
  </>
);

const PrHead: React.FC<{ i: number }> = ({ i }) => <PrRow pr={PRS[i]} at={0} hi w={1500} />;

// 13 — #5: cleanup, ~900 lines removed, privacy page no longer 404
export const S13: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={50} zoom={1.15}>
      <PrHead i={0} />
      <Row gap={70}>
        <Pop at={w(b, "تسعمية")}>
          <Glass pad={36} accent={A.prs}>
            <T size={120} ltr color="#F85149">
              −<Count to={898} at={w(b, "تسعمية")} dur={30} />
            </T>
            <T size={40} color={D.dim}>سطر اتشال</T>
          </Glass>
        </Pop>
        {frame >= s(b, 1) && (
          <Pop at={s(b, 1)}>
            <Glass pad={36}>
              <Row gap={26} ltr>
                <T size={44} ltr>/privacy/</T>
                <Chip size={46} ltr bg={frame >= s(b, 1) + 30 ? "#3FB950" : "#F85149"} color={C.white}>
                  {frame >= s(b, 1) + 30 ? "200" : "404"}
                </Chip>
              </Row>
            </Glass>
          </Pop>
        )}
      </Row>
    </Stage>
  );
};

// 14 — #6: WebP in 419 files; blog images 198.5 MB → 16.3 MB
export const S14: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const sm = s(b, 1);
  const k = ease(frame, [w(b, "لستاشر"), w(b, "لستاشر") + 26], [0, 1], theme.ease.inOut);
  const W = 1200;
  return (
    <Stage gap={50}>
      <PrHead i={1} />
      <Row gap={30}>
        <Pop at={w(b, "أربعمية")}>
          <Chip size={50} ltr bg={C.mustard}>
            419 files · WebP
          </Chip>
        </Pop>
      </Row>
      {frame >= sm && (
        <Pop at={sm}>
          <div style={{ width: W, direction: "ltr" }}>
            <div style={{ height: 110, width: W * ease(frame, [sm, sm + 20], [0, 1]) * (1 - k * (1 - 16.3 / 198.5)), background: k > 0.5 ? A.prs : C.orange, borderRadius: 22, boxShadow: `0 0 50px ${k > 0.5 ? A.prs : C.orange}55` }} />
            <T size={110} ltr style={{ textAlign: "left", marginTop: 16 }} color={k > 0.5 ? A.prs : D.text}>
              {(198.5 - (198.5 - 16.3) * k).toFixed(1)} MB
            </T>
          </div>
        </Pop>
      )}
    </Stage>
  );
};

// 15 — #7: PostHog: replay + events, only after consent, inputs masked; finally seeing visitors
export const S15: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const path = s(b, 3);
  const line = ease(frame, [path + 20, path + 70], [0, 1]);
  return (
    <Stage gap={46}>
      <PrHead i={2} />
      {frame < path ? (
        <>
          <Row gap={20}>
            {["Session replay", "contact_click", "blog_post_read", "outbound_click"].map((t, i) => (
              <Pop key={t} at={s(b, 1) + i * 7}>
                <Chip size={40} ltr bg={i === 0 ? C.mustard : C.card}>{t}</Chip>
              </Pop>
            ))}
          </Row>
          <div style={{ height: 120 }}>
            {frame >= s(b, 2) && (
              <Row gap={30}>
                <Pop at={s(b, 2)}>
                  <Chip size={44}>
                    <Icon name="cookie" size={50} sw={7} /> بعد الموافقة بس
                  </Chip>
                </Pop>
                <Pop at={w(b, "بتتخفي")}>
                  <Chip size={44} ltr>
                    <Icon name="lock" size={46} sw={8} /> ••••••••
                  </Chip>
                </Pop>
              </Row>
            )}
          </div>
        </>
      ) : (
        <div style={{ position: "relative", width: 1500, height: 300 }}>
          <svg width={1500} height={300} style={{ position: "absolute", inset: 0 }}>
            <path d="M1300 150 C 1080 30, 950 270, 750 150 S 420 30, 200 150" fill="none" stroke={A.prs} strokeWidth={10} strokeLinecap="round" pathLength={1} style={{ strokeDasharray: `${line} 1` }} />
          </svg>
          {["مين بيزورني", "بيقرا إيه", "بيمشي من فين"].map((t, i) => (
            <div key={t} style={{ position: "absolute", left: 1300 - i * 550 - 160, top: 100 }}>
              <Pop at={path + 10 + i * 16}>
                <Chip size={48} bg={i === 2 ? C.mustard : C.card}>{t}</Chip>
              </Pop>
            </div>
          ))}
        </div>
      )}
    </Stage>
  );
};

// 16 — #8: full redesign; three directions, picked one; teal, IBM Plex, light + dark (real recordings)
export const S16: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const dirs = s(b, 2);
  const look = s(b, 3);
  if (frame < s(b, 1))
    return (
      <Stage>
        <Slam at={2}>
          <T size={150}>والرابع؟</T>
        </Slam>
      </Stage>
    );
  if (frame < dirs)
    return (
      <Stage gap={40}>
        <PrHead i={3} />
        <Slam at={s(b, 1)}>
          <T size={130}>
            <Mark at={s(b, 1) + 6} color={A.prs}>redesign كامل</Mark>
          </T>
        </Slam>
      </Stage>
    );
  if (frame < look) {
    const pick = w(b, "واخترت");
    const k = ease(frame, [pick, pick + 14], [0, 1]);
    const opts = [C.orange, C.teal, "#6B5BD2"];
    return (
      <Stage gap={40}>
        <Pop at={dirs}>
          <T size={64}>
            تلات اتجاهات كـ <Mark at={dirs + 8} color={A.prs}>Claude artifacts</Mark>
          </T>
        </Pop>
        <Row gap={50} ltr>
          {opts.map((a, i) => (
            <Pop key={i} at={dirs + 6 + i * 6}>
              <div style={{ position: "relative", transform: `rotate(${(i - 1) * 6 * (1 - k)}deg) scale(${i === 1 ? 1 + k * 0.15 : 1 - k * 0.1})`, opacity: i === 1 ? 1 : 1 - k * 0.6 }}>
                <div style={{ width: 260, height: 400, borderRadius: 24, background: C.card, padding: 18, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 12, boxShadow: i === 1 && k > 0 ? `0 0 70px ${A.prs}88` : "0 20px 50px #0008" }}>
                  <div style={{ height: 40, borderRadius: 10, background: a }} />
                  <div style={{ height: 16, width: "70%", borderRadius: 8, background: "#1E2A2E33" }} />
                  <div style={{ flex: 1, borderRadius: 14, background: "#1E2A2E12" }} />
                  <div style={{ height: 32, width: "45%", borderRadius: 16, background: a }} />
                </div>
                {i !== 1 && frame >= pick && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="x" size={220} color={C.red} sw={7} draw={pick + 6} />
                  </div>
                )}
              </div>
            </Pop>
          ))}
        </Row>
      </Stage>
    );
  }
  return (
    <Stage gap={30}>
      <Row gap={40} ltr>
        <Pop at={look}>
          <Frame src="v3-home.mp4" w={860} tilt={8} accent={A.prs} from={look} />
        </Pop>
        <Pop at={w(b, "وغامق")}>
          <Frame src="v3-home-dark.mp4" w={860} tilt={-8} accent={A.prs} from={w(b, "وغامق")} />
        </Pop>
      </Row>
      <Pop at={look + 10}>
        <Row gap={20}>
          <Chip size={42} ltr bg={C.teal} color={C.white}>teal</Chip>
          <Chip size={42} ltr>IBM Plex Sans</Chip>
          <Chip size={42}>فاتح وغامق</Chip>
        </Row>
      </Pop>
    </Stage>
  );
};

// 17 — dates now "Oct 4"; the Arabic filter listed the same category five ways (real V2 screenshot)
export const S17: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const f = s(b, 1);
  if (frame < f)
    return (
      <Stage>
        <Row gap={50} ltr>
          <Pop at={2}>
            <Chip size={80} ltr>
              <Strike at={14}>10/4/2026</Strike>
            </Chip>
          </Pop>
          <Pop at={8} x={-30} from={0}>
            <T size={90} color={D.dim}>→</T>
          </Pop>
          <Pop at={20}>
            <Chip size={80} ltr bg={C.tealSoft}>Oct 4, 2026</Chip>
          </Pop>
        </Row>
      </Stage>
    );
  // zoom into the filter row of the real V2 Arabic blog page
  const z = ease(frame, [f + 6, f + 40], [0, 1], theme.ease.inOut);
  return (
    <Stage gap={30}>
      <Pop at={f}>
        <div style={{ position: "relative", width: 1440, height: 560, overflow: "hidden", borderRadius: 18, boxShadow: "0 40px 100px #000a", border: `2px solid ${A.prs}aa` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1440, height: 900, transform: `scale(${1 + z * 1.1}) translate(${z * 40}px, ${-z * 190}px)`, transformOrigin: "50% 15%" }}>
            <Frame src="v2-arblog-desk.jpg" w={1440} url="hfares.com/ar/blog · V2" zoom={[1, 1]} />
          </div>
        </div>
      </Pop>
      <Pop at={f + 40}>
        <Chip size={50} bg={C.orangeSoft}>نفس التصنيف… مكتوب بخمس طرق</Chip>
      </Pop>
    </Stage>
  );
};

// 18 — mid-video reset: nice words… but is it actually faster? let's see Lighthouse
export const S18: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const n = s(b, 1);
  const shake = useShakeAt([n], 18);
  return (
    <Stage style={{ transform: shake }}>
      {frame < n ? (
        <Col gap={20}>
          <Pop at={2}>
            <T size={70} color={D.dim}>كلام حلو…</T>
          </Pop>
          <Slam at={w(b, "بس")}>
            <T size={120}>
              بس أسرع <span style={{ color: A.numbers }}>فعلًا؟</span>
            </T>
          </Slam>
        </Col>
      ) : (
        <>
          {Array.from({ length: 24 }).map((_, i) => {
            const x = rnd(`nx${i}`) * 1800 + 60;
            const sp = 8 + rnd(`ns${i}`) * 10;
            const y = ((frame - n) * sp + rnd(`ny${i}`) * 900) % 1200 - 120;
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, opacity: 0.22 }}>
                <T size={40 + rnd(`nz${i}`) * 50} color={A.numbers} ltr>{Math.floor(rnd(`nv${i}`) * 100)}</T>
              </div>
            );
          })}
          <Slam at={n}>
            <T size={200} ltr>Lighthouse</T>
          </Slam>
          <Flash at={n} peak={0.5} />
        </>
      )}
    </Stage>
  );
};

// 19 — real Lighthouse reports, before vs after: performance +20, accessibility + SEO 100
export const S19: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const perf = s(b, 1);
  const rest = s(b, 2);
  const ring = (x: number, wd: number, at: number) =>
    frame >= at ? (
      <div style={{ position: "absolute", left: x, top: -6, width: wd, height: 250, border: `5px solid ${A.numbers}`, borderRadius: 20, opacity: ease(frame, [at, at + 8], [0, 1]), boxShadow: `0 0 30px ${A.numbers}88` }} />
    ) : null;
  return (
    <>
      <Stage gap={80}>
        <Pop at={36}>
          <Chip size={46} bg={A.numbers}>Lighthouse · موبايل · نفس الاختبار</Chip>
        </Pop>
        {[
          ["قبل (V2)", "lh-v2-scores.jpg", 40],
          ["بعد (V3)", "lh-v3-scores.jpg", 48],
        ].map(([label, src, at]) => (
          <Pop key={src as string} at={at as number}>
            <div style={{ position: "relative" }}>
              <Shot src={src as string} w={1300} label={label as string} accent={label === "بعد (V3)" ? A.numbers : D.line} />
              {ring(66, 240, perf)}
              {ring(384, 240, rest)}
              {ring(1021, 240, rest)}
            </div>
          </Pop>
        ))}
      </Stage>
      <Chapter n={4} title="الأرقام" accent={A.numbers} />
    </>
  );
};

// 20 — LCP from 10+ s to 5 s; page weight halved; local server caveat
export const S20: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const kb = s(b, 1);
  const note = s(b, 2);
  return (
    <Stage gap={60} zoom={1.15}>
      {frame < kb ? (
        <Col gap={70}>
          <Pop at={2}>
            <Shot src="lh-v2-metrics.jpg" w={1100} label="قبل (V2)" />
          </Pop>
          <Pop at={14}>
            <Shot src="lh-v3-metrics.jpg" w={1100} label="بعد (V3)" accent={A.numbers} />
          </Pop>
        </Col>
      ) : (
        <>
          <Glass w={1100} pad={40} accent={A.numbers}>
            <T size={48} style={{ marginBottom: 24 }}>حجم الصفحة الرئيسية</T>
            {[
              ["قبل", 2051, C.orange, 0],
              ["بعد", 1154, A.numbers, 12],
            ].map(([l, v, c, t]) => (
              <Row key={l as string} gap={24} style={{ justifyContent: "flex-start", marginTop: 16 }}>
                <T size={40} weight={600} style={{ width: 90 }}>{l as string}</T>
                <div style={{ width: 640, direction: "ltr" }}>
                  <div style={{ height: 56, width: 640 * ((v as number) / 2051) * ease(frame, [kb + (t as number), kb + (t as number) + 24], [0, 1]), background: c as string, borderRadius: 14 }} />
                </div>
                <T size={44} ltr>
                  <Count to={v as number} at={kb + (t as number)} dur={24} /> KB
                </T>
              </Row>
            ))}
          </Glass>
          <div style={{ height: 90 }}>
            {frame >= note && (
              <Row gap={20}>
                {["سيرفر محلي", "من غير CDN", "المهم هو الفرق"].map((t, i) => (
                  <Pop key={t} at={note + i * 10}>
                    <Chip size={42} bg={i === 2 ? A.numbers : C.card}>{t}</Chip>
                  </Pop>
                ))}
              </Row>
            )}
          </div>
        </>
      )}
    </Stage>
  );
};

// 21 — the part that might upset people: I didn't look at the code. Not one diff.
export const S21: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const z = s(b, 2);
  const shake = useShakeAt([z], 16);
  return (
    <>
      <Stage gap={40} style={{ transform: shake }}>
        {frame < s(b, 1) ? (
          <Pop at={36}>
            <Chip bg={A.code} color={C.white} size={64}>الجزء اللي ممكن يزعل ناس</Chip>
          </Pop>
        ) : frame < z ? (
          <Pop at={s(b, 1)}>
            <div style={{ width: 1200, background: "#0D1117", border: "2px solid #30363D", borderRadius: 14, padding: 26, direction: "ltr", fontFamily: "monospace", filter: `blur(${ease(frame, [s(b, 1) + 10, s(b, 1) + 40], [0, 5])}px)` }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{ height: 30, margin: "8px 0", width: `${40 + rnd(`d${i}`) * 55}%`, borderRadius: 6, background: i % 3 === 0 ? "#F8514933" : i % 3 === 1 ? "#3FB95033" : "#ffffff14" }} />
              ))}
            </div>
          </Pop>
        ) : (
          <Col gap={10}>
            <Slam at={z}>
              <T size={260} color={A.code} ltr>0</T>
            </Slam>
            <Pop at={z + 6}>
              <T size={70}>diff قريته</T>
            </Pop>
          </Col>
        )}
      </Stage>
      <Flash at={z} peak={0.3} />
      <Chapter n={5} title="ما قريتش الكود" accent={A.code} />
    </>
  );
};

// 22 — who reviewed? a code-review agent; 15 issues on the redesign, all fixed before merge
export const S22: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const n = s(b, 2);
  return (
    <Stage gap={40} zoom={1.3}>
      {frame < s(b, 1) ? (
        <Slam at={2}>
          <T size={120}>مين اللي راجع؟</T>
        </Slam>
      ) : (
        <Row gap={90}>
          <Pop at={s(b, 1)}>
            <Col gap={20}>
              <Badge name="robot" size={230} bg={C.tealSoft} />
              <Chip size={48} ltr bg={C.ink} color={C.paper}>/code-review</Chip>
            </Col>
          </Pop>
          {frame >= n && (
            <Pop at={n}>
              <Glass w={620} pad={40} accent={A.code}>
                <T size={44}>على الـ redesign لوحده</T>
                <Row gap={20} style={{ marginTop: 10 }}>
                  <T size={160} ltr color={frame >= w(b, "واتصلحوا") ? C.green : A.code}>
                    {frame >= w(b, "واتصلحوا") ? "15/15" : <Count to={15} at={n + 8} dur={36} />}
                  </T>
                </Row>
                <T size={46} color={D.dim}>{frame >= w(b, "واتصلحوا") ? "اتصلحوا قبل الـ merge" : "مشكلة"}</T>
              </Glass>
            </Pop>
          )}
        </Row>
      )}
    </Stage>
  );
};

// 23 — in June I wrote a human can review ~400 lines; the redesign alone changed 4,373
export const S23: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const big = s(b, 1);
  const rows = [
    { l: "البني آدم يراجع", v: 400, txt: "~400 سطر", c: C.orange, at: w(b, "أربعمية") },
    { l: "الـ redesign غيّر", v: 4373, txt: "4,373 سطر", c: A.code, at: big },
  ];
  return (
    <Stage gap={50} zoom={1.1}>
      <Pop at={2}>
        <Glass pad={24}>
          <Row gap={20}>
            <Icon name="file" size={64} color={D.text} />
            <T size={50}>«ضايع في السياق» · يونيو 2026</T>
          </Row>
        </Glass>
      </Pop>
      <Col gap={30}>
        {rows.map((r) =>
          frame >= r.at ? (
            <Pop key={r.l} at={r.at} x={-40} from={0}>
              <Row gap={26} style={{ width: 1500, justifyContent: "flex-start" }}>
                <T size={48} style={{ width: 400 }}>{r.l}</T>
                <div style={{ width: 760, direction: "ltr" }}>
                  <div style={{ height: 70, width: Math.max(18, 760 * (r.v / 4373) * ease(frame, [r.at + 4, r.at + 34], [0, 1])), background: r.c, borderRadius: 16, boxShadow: `0 0 40px ${r.c}55` }} />
                </div>
                <T size={50} ltr>{r.txt}</T>
              </Row>
            </Pop>
          ) : (
            <div key={r.l} style={{ height: 91 }} />
          ),
        )}
      </Col>
    </Stage>
  );
};

// 24 — so today, I was the one shipping code nobody read
export const S24: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const me = w(b, "أنا");
  const spot = ease(frame, [0, 20], [0, 1]);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 46%, transparent ${16 + spot * 14}%, #000000ee ${32 + spot * 18}%)` }} />
      <Stage gap={10}>
        <Pop at={2}>
          <T size={66} color={D.dim}>يعني النهارده…</T>
        </Pop>
        <Slam at={me}>
          <T size={110}>
            أنا كنت <span style={{ color: A.code }}>الشخص ده</span>
          </T>
        </Slam>
        <Pop at={me + 20}>
          <T size={54} color={D.dim}>اللي بيطلق كود محدش قراه</T>
        </Pop>
      </Stage>
      <Flash at={me} peak={0.25} />
    </>
  );
};

// 25 — adaptation, not contradiction: review moved from my eyes to an agent + a preview I opened
export const S25: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const move = s(b, 2);
  const link = w(b, "ولينك");
  const press = link + 22;
  return (
    <Stage gap={50} zoom={1.25}>
      <Row gap={60}>
        <Pop at={2}>
          <T size={90} color={D.dim}>
            <Strike at={w(b, "تناقض")}>تناقض</Strike>
          </T>
        </Pop>
        <Slam at={w(b, "تأقلم")}>
          <T size={110}>
            <Mark at={w(b, "تأقلم") + 6} color={A.code}>تأقلم</Mark>
          </T>
        </Slam>
      </Row>
      <div style={{ height: 260, display: "flex", alignItems: "center" }}>
        {frame >= s(b, 1) && frame < move && (
          <Pop at={s(b, 1)}>
            <T size={76}>المراجعة ما اختفتش</T>
          </Pop>
        )}
        {frame >= move && frame < link && (
          <Row gap={50}>
            <Pop at={move}>
              <Badge name="eye" size={180} />
            </Pop>
            <Pop at={move + 8} x={40} from={0}>
              <T size={110} color={D.dim}>←</T>
            </Pop>
            <Pop at={w(b, "agent")}>
              <Badge name="robot" size={180} bg={C.tealSoft} />
            </Pop>
          </Row>
        )}
        {frame >= link && (
          <Pop at={link}>
            <div style={{ position: "relative" }}>
              <Chip size={50} ltr bg={frame >= press ? C.teal : C.card} color={frame >= press ? C.white : C.ink}>
                <Icon name="link" size={56} color={frame >= press ? C.white : C.ink} sw={8} /> preview link
              </Chip>
              <div style={{ position: "absolute", left: 160 + ease(frame, [link + 4, press], [200, 0]), top: 40 + ease(frame, [link + 4, press], [120, 0]) }}>
                <Icon name="cursor" size={70} fill={C.white} />
              </div>
            </div>
          </Pop>
        )}
      </div>
    </Stage>
  );
};

// 26 — the bill: Claude Pro $20/month; ~$72 at API prices; never hit the limit
export const S26: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const lim = s(b, 3);
  const meter = 0.55 + Math.sin(frame / 14) * 0.08;
  return (
    <>
      <Stage gap={40} zoom={1.3}>
        <Row gap={70}>
          <Pop at={s(b, 1)}>
            <div style={{ width: 640, background: C.card, borderRadius: 10, padding: "30px 40px 40px", transform: "rotate(2deg)", boxShadow: `0 30px 80px #000a, 0 0 70px ${A.bill}33`, backgroundImage: `repeating-linear-gradient(180deg, transparent 0 58px, ${C.paperDeep} 58px 60px)` }}>
              <Row gap={0} style={{ justifyContent: "space-between" }}>
                <T size={50} ltr color={C.ink}>Claude Pro</T>
                <T size={80} ltr color={C.teal}>$20</T>
              </Row>
              <T size={34} weight={600} color={C.inkSoft} style={{ textAlign: "right" }}>في الشهر</T>
              {frame >= s(b, 2) && (
                <Pop at={s(b, 2)} from={14}>
                  <Row gap={0} style={{ justifyContent: "space-between", marginTop: 26 }}>
                    <T size={40} color={C.ink}>بأسعار الـ API</T>
                    <T size={60} ltr color={C.inkSoft}>
                      <Strike at={w(b, "اتنين")}>~$72</Strike>
                    </T>
                  </Row>
                </Pop>
              )}
            </div>
          </Pop>
          {frame >= lim && (
            <Pop at={lim}>
              <Glass w={480} pad={34} accent={A.bill}>
                <T size={40} ltr>usage limit</T>
                <div style={{ position: "relative", height: 56, marginTop: 20, borderRadius: 16, background: "#ffffff18", overflow: "hidden", direction: "ltr" }}>
                  <div style={{ height: "100%", width: `${meter * 100}%`, background: A.bill }} />
                </div>
                <T size={42} color={A.bill} style={{ marginTop: 16 }}>عمري ما وصلتله</T>
              </Glass>
            </Pop>
          )}
        </Row>
      </Stage>
      <Chapter n={6} title="الفاتورة" accent={A.bill} />
    </>
  );
};

// 27 — V2 cheaper per token; V3 did far more, from the phone
export const S27: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bob = useBob(26, 8);
  return (
    <Stage gap={40} zoom={1.2}>
      <Row gap={60}>
        <Pop at={2}>
          <Glass w={560} pad={36}>
            <Chip size={56} ltr>V2</Chip>
            <Row gap={16} style={{ justifyContent: "flex-start", marginTop: 22 }}>
              <Icon name="check" size={56} color={C.green} sw={10} draw={10} />
              <T size={46}>أرخص لكل token</T>
            </Row>
          </Glass>
        </Pop>
        <Pop at={s(b, 1)}>
          <Glass w={600} pad={36} accent={A.bill}>
            <Chip size={56} ltr bg={A.bill} color={C.white}>V3</Chip>
            <Row gap={16} style={{ justifyContent: "flex-start", marginTop: 22 }}>
              <Icon name="check" size={56} color={C.green} sw={10} draw={s(b, 1) + 8} />
              <T size={46}>شغل أكتر بكتير</T>
            </Row>
          </Glass>
        </Pop>
        {frame >= w(b, "الموبايل") && (
          <Slam at={w(b, "الموبايل")}>
            <div style={{ transform: `translateY(${bob}px)` }}>
              <Phone w={170} glow>
                <Bubble at={w(b, "الموبايل") + 4} size={16}>كله من هنا</Bubble>
              </Phone>
            </div>
          </Slam>
        )}
      </Row>
    </Stage>
  );
};

// 28 — PostHog live at 15:06; V4 built on data, not guesses
export const S28: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const v4 = s(b, 1);
  const pulse = 1 + Math.sin(frame / 5) * 0.2;
  return (
    <Stage gap={60} zoom={1.25}>
      <Pop at={2}>
        <Glass pad={34} accent={A.outro}>
          <Row gap={30}>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: C.green, transform: `scale(${pulse})`, boxShadow: `0 0 30px ${C.green}` }} />
            <T size={110} ltr>15:06</T>
            <T size={56} ltr color={A.outro}>PostHog live</T>
          </Row>
        </Glass>
      </Pop>
      {frame >= v4 && (
        <Row gap={44}>
          <Slam at={v4}>
            <Chip bg={A.outro} color={C.ink} size={100} ltr>V4</Chip>
          </Slam>
          <Pop at={w(b, "داتا")}>
            <T size={96}>= داتا</T>
          </Pop>
          {frame >= w(b, "تخمين") && (
            <Pop at={w(b, "تخمين")}>
              <T size={80} color={D.dim}>
                <Strike at={w(b, "تخمين") + 6}>تخمين</Strike>
              </T>
            </Pop>
          )}
        </Row>
      )}
    </Stage>
  );
};

// 29 — comment question: let the agent review, or read every line?
export const S29: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const q = s(b, 1);
  const cm = s(b, 2);
  const bob = useBob(10, 8);
  return (
    <Stage gap={50} zoom={1.15}>
      {frame < q ? (
        <Slam at={2}>
          <T size={140}>وانت بقى؟</T>
        </Slam>
      ) : (
        <>
          <Row gap={70}>
            <Pop at={q}>
              <Glass w={560} pad={36} accent={A.outro}>
                <Col gap={16}>
                  <Badge name="robot" size={150} bg={C.tealSoft} />
                  <T size={50}>الـ agent يراجع لوحده</T>
                </Col>
              </Glass>
            </Pop>
            <Pop at={q + 4}>
              <T size={70} color={D.dim}>ولا</T>
            </Pop>
            <Pop at={w(b, "تقرا")}>
              <Glass w={560} pad={36} accent={C.orange}>
                <Col gap={16}>
                  <Badge name="eye" size={150} bg={C.orangeSoft} />
                  <T size={50}>أقرا كل سطر بنفسي</T>
                </Col>
              </Glass>
            </Pop>
          </Row>
          {frame >= cm && (
            <Slam at={cm}>
              <Chip bg={C.mustard} size={56} style={{ transform: `translateY(${bob}px)` }}>
                <Icon name="comment" size={64} sw={8} /> قولي في الكومنتات
              </Chip>
            </Slam>
          )}
        </>
      )}
    </Stage>
  );
};

// 30 — end card: the article (real recording), subscribe, see you in V4
export const S30: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const sub = s(b, 1);
  const press = sub + 22;
  const done = frame >= press + 4;
  const pk = ease(frame, [press, press + 5], [1, 0.9]) + ease(frame, [press + 5, press + 12], [0, 0.1]);
  return (
    <Stage gap={40}>
      <Row gap={70}>
        <Col gap={40} style={{ alignItems: "flex-end" }}>
          <Pop at={2}>
            <T size={70}>المقال كامل في الوصف</T>
          </Pop>
          {frame >= sub && (
            <Pop at={sub}>
              <div style={{ position: "relative" }}>
                <div style={{ transform: `scale(${pk})` }}>
                  <Chip bg={done ? C.paperDeep : C.red} color={done ? C.ink : C.white} size={60}>
                    <Icon name={done ? "bell" : "play"} size={64} color={done ? C.ink : C.white} sw={8} /> {done ? "مشترك" : "اشترك"}
                  </Chip>
                </div>
                <div style={{ position: "absolute", left: 170 + ease(frame, [sub + 4, press], [180, 0]), top: 50 + ease(frame, [sub + 4, press], [110, 0]) }}>
                  <Icon name="cursor" size={70} fill={C.white} />
                </div>
              </div>
            </Pop>
          )}
          {frame >= w(b, "وأشوفك") && (
            <Slam at={w(b, "وأشوفك")}>
              <T size={84}>
                أشوفك في <span style={{ color: A.outro }}>V4</span>
              </T>
            </Slam>
          )}
        </Col>
        <Pop at={6}>
          <Frame src="v3-post.mp4" w={900} url="hfares.com/blog/v3-portfolio" tilt={-8} accent={A.outro} />
        </Pop>
      </Row>
    </Stage>
  );
};
