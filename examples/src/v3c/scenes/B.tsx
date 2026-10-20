// Beats 13–23: steps 5–7 (preview, review, measure), lessons, cost, recap, comment question.
import React from "react";
import { OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../../v3/theme";
import { s, w } from "../timing";
import { ACCENT, Badge, Chapter, Chip, Col, Count, D, Frame, Glass, Icon, Mark, Pop, Row, Shot, Slam, Stage, T, ease, useBob } from "../../v3b/kit";
import { CodeCard, SceneProps, STEP } from "./A";

const C = theme.colors;
const LESSON = ACCENT.numbers;

const GhComment: React.FC<{ at: number }> = ({ at }) => (
  <Pop at={at}>
    <div style={{ width: 1050, background: "#0D1117", border: "2px solid #30363D", borderRadius: 14, padding: "20px 28px", fontFamily: theme.fonts.main, color: "#E6EDF3", direction: "ltr", boxShadow: "0 30px 80px #000a" }}>
      <div style={{ fontSize: 22, color: "#8B949E" }}>cloudflare-workers-and-pages · commented on PR #8</div>
      <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="check" size={34} color="#3FB950" sw={12} /> Deploy successful!
      </div>
      <div style={{ fontSize: 26, marginTop: 8 }}>
        Branch Preview URL: <span style={{ color: "#58A6FF" }}>ccr-8465ebe9-ezz0xs.personal-website-17i.pages.dev</span>
      </div>
    </div>
  </Pop>
);

// 13 — step 5: review from the preview link: every PR gets a working copy; open it on the phone
export const S13: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const phone = s(b, 2);
  const bob = useBob(30, 6);
  return (
    <>
      <Stage gap={40}>
        {frame < phone ? (
          <Col gap={30}>
            <Pop at={38}>
              <Chip size={46} ltr>Cloudflare Pages · preview per pull request</Chip>
            </Pop>
            {frame >= s(b, 1) && <GhComment at={s(b, 1) + 6} />}
          </Col>
        ) : (
          <Row gap={80}>
            <Col gap={20} style={{ alignItems: "flex-end" }}>
              <Pop at={phone}>
                <T size={70}>
                  شوف التغيير <Mark at={phone + 8} color={STEP}>بعينك</Mark>
                </T>
              </Pop>
              <Pop at={w(b, "merge")}>
                <Chip size={46}>قبل الـ merge</Chip>
              </Pop>
            </Col>
            <Pop at={phone} style={{ transform: `translateY(${bob}px)` }}>
              <div style={{ width: 380, height: 770, borderRadius: 52, background: C.ink, padding: 14, boxSizing: "border-box", boxShadow: `0 0 70px ${STEP}66` }}>
                <div style={{ width: "100%", height: "100%", borderRadius: 36, overflow: "hidden", background: C.white }}>
                  <Sequence from={phone} layout="none">
                    <OffthreadVideo src={staticFile("videos/v3-portfolio/site/v3-post-mobile.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%" }} />
                  </Sequence>
                </div>
              </div>
            </Pop>
          </Row>
        )}
      </Stage>
      <Chapter n={5} title="راجع من الـ preview" accent={STEP} />
    </>
  );
};

// 14 — step 6: another agent reviews; I didn't read the code line by line (a risk, said plainly); 15 issues fixed
export const S14: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const n = s(b, 2);
  const fixed = w(b, "واتصلحوا");
  return (
    <>
      <Stage gap={40} zoom={1.25}>
        {frame < n ? (
          <Col gap={30}>
            <Pop at={38}>
              <Badge name="robot" size={200} bg={C.tealSoft} />
            </Pop>
            {frame >= s(b, 1) && (
              <Pop at={s(b, 1)}>
                <Chip size={46} bg={C.orangeSoft}>
                  <Icon name="eye" size={50} sw={8} /> ما راجعتش سطر سطر · ودي مخاطرة
                </Chip>
              </Pop>
            )}
          </Col>
        ) : (
          <Row gap={80}>
            <Pop at={n}>
              <Col gap={18}>
                <Badge name="robot" size={200} bg={C.tealSoft} />
                <Chip size={44} ltr bg={C.ink} color={C.paper}>/code-review</Chip>
              </Col>
            </Pop>
            <Pop at={n + 6}>
              <Glass w={560} pad={36} accent={STEP}>
                <T size={40}>على الـ redesign لوحده</T>
                <T size={150} ltr color={frame >= fixed ? C.green : C.orange}>
                  {frame >= fixed ? "15/15" : <Count to={15} at={n + 12} dur={34} />}
                </T>
                <T size={42} color={D.dim}>{frame >= fixed ? "اتصلحوا قبل الـ merge" : "مشكلة"}</T>
              </Glass>
            </Pop>
          </Row>
        )}
      </Stage>
      <Chapter n={6} title="agent تاني يراجع" accent={STEP} />
    </>
  );
};

// 15 — every PR had a Checks section (real text from PR #8)
export const S15: React.FC<SceneProps> = ({ b }) => (
  <Stage gap={30} zoom={1.2}>
    <Pop at={2}>
      <T size={60}>
        كل pull request فيه قسم <Mark at={10} color={STEP}>Checks</Mark>
      </T>
    </Pop>
    <Pop at={8}>
      <CodeCard
        title="PR #8 · Checks"
        at={14}
        w={1250}
        lines={[
          ["## Checks", "#79C0FF"],
          ["- `npm run check` passes", "#3FB950"],
          ["- `./scripts/build-static-site.sh` builds all 73 pages", "#3FB950"],
          ["- Screenshots of the built site checked at 1440px and 390px", "#3FB950"],
          ["  in both languages and themes; no console errors", "#3FB950"],
        ]}
      />
    </Pop>
  </Stage>
);

// 16 — step 7: measure before you believe: Lighthouse on the old and new build, same test
export const S16: React.FC<SceneProps> = ({ b }) => (
  <>
    <Stage gap={70}>
      {[
        ["قبل (V2)", "lh-v2-scores.jpg", 40],
        ["بعد (V3)", "lh-v3-scores.jpg", s(b, 1)],
      ].map(([label, src, at]) => (
        <Pop key={src as string} at={at as number}>
          <Shot src={src as string} w={1300} label={label as string} accent={label === "بعد (V3)" ? STEP : D.line} />
        </Pop>
      ))}
    </Stage>
    <Chapter n={7} title="قيس قبل ما تصدق" accent={STEP} />
  </>
);

// 17 — +20 performance, accessibility + SEO 100; blog images 198.5 → 16.3 MB after WebP
export const S17: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const img = s(b, 1);
  const k = ease(frame, [w(b, "لستاشر"), w(b, "لستاشر") + 26], [0, 1], theme.ease.inOut);
  const W = 1200;
  if (frame < img)
    return (
      <Stage gap={40}>
        <Row gap={30}>
          {[
            ["الأداء", "+20", STEP],
            ["Accessibility", "100", C.green],
            ["SEO", "100", C.green],
          ].map(([l, v, c], i) => (
            <Pop key={l} at={2 + i * 10}>
              <Glass w={440} pad={30} accent={c}>
                <T size={110} ltr color={c}>{v}</T>
                <T size={44} ltr={i > 0}>{l}</T>
              </Glass>
            </Pop>
          ))}
        </Row>
      </Stage>
    );
  return (
    <Stage gap={40}>
      <Pop at={img}>
        <Row gap={20}>
          <Icon name="image" size={80} color={D.text} />
          <T size={64}>صور المدونة</T>
          <Chip size={44} ltr bg={C.mustard}>WebP</Chip>
        </Row>
      </Pop>
      <Pop at={img + 6}>
        <div style={{ width: W, direction: "ltr" }}>
          <div style={{ height: 100, width: W * ease(frame, [img + 6, img + 26], [0, 1]) * (1 - k * (1 - 16.3 / 198.5)), background: k > 0.5 ? STEP : C.orange, borderRadius: 22 }} />
          <T size={100} ltr style={{ textAlign: "left", marginTop: 14 }} color={k > 0.5 ? STEP : D.text}>
            {(198.5 - (198.5 - 16.3) * k).toFixed(1)} MB
          </T>
        </div>
      </Pop>
    </Stage>
  );
};

const Lesson: React.FC<{ n: number; text: string; at: number }> = ({ n, text, at }) => (
  <Pop at={at} x={-50} from={0}>
    <Glass w={1400} pad={26} accent={LESSON} style={{ display: "flex", alignItems: "center", gap: 26, direction: "rtl" }}>
      <div style={{ width: 70, height: 70, borderRadius: 18, background: LESSON, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <T size={42} color={C.ink} ltr>{n}</T>
      </div>
      <T size={46} style={{ textAlign: "right" }}>{text}</T>
    </Glass>
  </Pop>
);

// 18 — lessons 1–2: small clear tasks; the preview shows what visitors see
export const S18: React.FC<SceneProps> = ({ b }) => (
  <Stage gap={30}>
    <Slam at={2}>
      <T size={90} style={{ marginBottom: 10 }}>الدروس</T>
    </Slam>
    <Lesson n={1} text="الـ agent بيشتغل أحسن لما المهمة صغيرة وواضحة" at={s(b, 1)} />
    <Lesson n={2} text="لينك الـ preview بيوريك اللي الزائر هيشوفه فعلًا" at={s(b, 2)} />
  </Stage>
);

// 19 — lessons 3–4: automated review isn't a full replacement; write what you learned into CLAUDE.md
export const S19: React.FC<SceneProps> = ({ b }) => (
  <Stage gap={30}>
    <Lesson n={3} text="المراجعة الآلية بتلقط كتير… بس القرار عليك" at={2} />
    <Lesson n={4} text="اكتب اللي اتعلمته في CLAUDE.md" at={s(b, 2)} />
  </Stage>
);

// 20 — what I added at the end of the day (real rule from CLAUDE.md)
export const S20: React.FC<SceneProps> = ({ b }) => (
  <Stage gap={36} zoom={1.1}>
    <Pop at={2}>
      <T size={60}>اللي ضفته في آخر اليوم</T>
    </Pop>
    <Pop at={8}>
      <CodeCard
        title="CLAUDE.md · Deployment"
        at={14}
        w={1300}
        hi={0}
        lines={[
          ["**Previews: open a PR as soon as there is something to look at.**", "#E6EDF3"],
          ["Cloudflare Pages builds every PR branch and posts a preview link on the PR;", "#8B949E"],
          ["Hossam reviews from his phone through these previews.", "#8B949E"],
        ]}
      />
    </Pop>
  </Stage>
);

// 21 — cost: the regular Claude Pro plan, never hit the limit
export const S21: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const meter = 0.55 + Math.sin(frame / 14) * 0.08;
  return (
    <Stage gap={40} zoom={1.2}>
      <Pop at={2}>
        <T size={80}>والتكلفة؟</T>
      </Pop>
      {frame >= s(b, 1) && (
        <Row gap={50}>
          <Pop at={s(b, 1)}>
            <Chip size={56} ltr bg={C.card}>Claude Pro</Chip>
          </Pop>
          <Pop at={s(b, 1) + 10}>
            <Glass w={460} pad={28} accent={ACCENT.bill}>
              <T size={34} ltr>usage limit</T>
              <div style={{ height: 44, marginTop: 14, borderRadius: 14, background: "#ffffff18", overflow: "hidden", direction: "ltr" }}>
                <div style={{ height: "100%", width: `${meter * 100}%`, background: ACCENT.bill }} />
              </div>
              <T size={36} color={ACCENT.bill} style={{ marginTop: 12 }}>ما وصلتش للحد</T>
            </Glass>
          </Pop>
        </Row>
      )}
    </Stage>
  );
};

// 22 — recap: start with CLAUDE.md, one small session, a preview link; the article is in the description
export const S22: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const items: [Parameters<typeof Badge>[0]["name"], string][] = [
    ["file", "CLAUDE.md"],
    ["robot", "session واحدة صغيرة"],
    ["link", "لينك preview"],
  ];
  return (
    <Stage gap={40}>
      <Row gap={60}>
        <Col gap={22} style={{ alignItems: "flex-end" }}>
          <Pop at={2}>
            <T size={64}>لو عايز تجرب، ابدأ بـ:</T>
          </Pop>
          {items.map(([icon, t], i) => (
            <Pop key={t} at={s(b, 1) + i * 10} x={-40} from={0}>
              <Chip size={48} ltr={i === 0}>
                <Icon name={icon} size={52} sw={8} /> {t}
              </Chip>
            </Pop>
          ))}
          {frame >= s(b, 2) && (
            <Pop at={s(b, 2)}>
              <T size={44} color={D.dim}>المقال كامل في الوصف</T>
            </Pop>
          )}
        </Col>
        <Pop at={6}>
          <Frame src="v3-post-v3.mp4" w={860} url="hfares.com/blog/v3-portfolio" tilt={-8} accent={ACCENT.outro} from={6} />
        </Pop>
      </Row>
    </Stage>
  );
};

// 23 — comment question: what's the first task you'd give the agent?
export const S23: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bob = useBob(10, 8);
  return (
    <Stage gap={40} zoom={1.1}>
      <Pop at={2}>
        <T size={60} color={D.dim}>ولو جربت…</T>
      </Pop>
      {frame >= s(b, 1) && (
        <Slam at={s(b, 1)}>
          <T size={100}>
            إيه <Mark at={s(b, 1) + 8} color={ACCENT.outro}>أول مهمة</Mark> هتديها للـ agent؟
          </T>
        </Slam>
      )}
      {frame >= s(b, 1) + 20 && (
        <Pop at={s(b, 1) + 20}>
          <Chip bg={C.mustard} size={50} style={{ transform: `translateY(${bob}px)` }}>
            <Icon name="comment" size={58} sw={8} /> قولي في الكومنتات
          </Chip>
        </Pop>
      )}
    </Stage>
  );
};
