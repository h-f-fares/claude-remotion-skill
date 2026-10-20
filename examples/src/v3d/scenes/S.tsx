// Beginner cut, all 16 beats: plain words, one idea per scene, real blog footage.
// Technical detail (files, review, measuring) is left to the article's step-by-step section.
import React from "react";
import { OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../../v3/theme";
import { s, w } from "../timing";
import { ACCENT, Badge, Bubble, Chapter, Chip, Col, D, Frame, Glass, Icon, Laptop, Mark, Phone, Pop, Row, Shot, Slam, Stage, Strike, T, ease, useBob } from "../../v3b/kit";

const C = theme.colors;
export type SceneProps = { b: number; len: number };
export const STEP = "#2BB3A3";

// 1 — you have a site or blog and heard AI can build sites; here's how, without complexity
export const S1: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={36}>
      <Pop at={2}>
        <Frame src="v3-bloglist.mp4" w={1150} url="hfares.com/blog" accent={ACCENT.hook} />
      </Pop>
      <div style={{ height: 90 }}>
        {frame >= s(b, 1) && (
          <Pop at={s(b, 1)}>
            <Chip size={54} bg={C.mustard}>إزاي بيحصل · من غير تعقيد</Chip>
          </Pop>
        )}
      </div>
    </Stage>
  );
};

// 2 — this is my blog: first built with an AI tool in 3 days, then in one afternoon
export const S2: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={40}>
      <Pop at={2}>
        <T size={76}>دي مدونتي</T>
      </Pop>
      <Row gap={50} ltr>
        {frame >= s(b, 1) && (
          <Pop at={s(b, 1)}>
            <Col gap={18}>
              <Frame src="v1-bloglist.mp4" w={760} url="2025" from={s(b, 1)} />
              <Chip size={44}>المرة الأولى · تلات أيام</Chip>
            </Col>
          </Pop>
        )}
        {frame >= s(b, 2) && (
          <Pop at={s(b, 2)}>
            <Col gap={18}>
              <Frame src="v2-bloglist.mp4" w={760} url="2026" from={s(b, 2)} />
              <Chip size={44}>المرة التانية · بعد ضهر واحد</Chip>
            </Col>
          </Pop>
        )}
      </Row>
    </Stage>
  );
};

// 3 — one question: can I develop the whole site from the phone, never opening the laptop?
export const S3: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bob = useBob(28, 7);
  return (
    <Stage gap={50} zoom={1.1}>
      <Pop at={2}>
        <T size={60} color={D.dim}>المرة دي كان عندي سؤال واحد…</T>
      </Pop>
      <Row gap={120}>
        {frame >= s(b, 2) && (
          <Pop at={s(b, 2)}>
            <div style={{ position: "relative" }}>
              <Laptop w={340} asleep />
              <div style={{ position: "absolute", inset: -20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="x" size={240} color={C.red} sw={10} draw={s(b, 2) + 10} />
              </div>
            </div>
          </Pop>
        )}
        {frame >= s(b, 1) && (
          <Col gap={20}>
            <Pop at={s(b, 1)} style={{ transform: `translateY(${bob}px)` }}>
              <Phone w={170} glow>
                <Bubble at={s(b, 1) + 10} me size={16}>أطور الموقع من هنا؟</Bubble>
              </Phone>
            </Pop>
            <Slam at={s(b, 1) + 6}>
              <T size={70}>
                <Mark at={s(b, 1) + 14} color={ACCENT.hook}>من الموبايل؟</Mark>
              </T>
            </Slam>
          </Col>
        )}
      </Row>
    </Stage>
  );
};

// 4 — Claude Code: like a helper programmer; you describe, it builds and shows you; now online, from the app
export const S4: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bob = useBob(28, 7);
  const online = s(b, 3);
  return (
    <Stage gap={40} zoom={1.1}>
      <Row gap={90}>
        <Col gap={24} style={{ alignItems: "flex-end" }}>
          <Pop at={2}>
            <T size={90} ltr>Claude Code</T>
          </Pop>
          {frame >= s(b, 1) && (
            <Pop at={s(b, 1)}>
              <Chip size={50}>
                <Icon name="robot" size={56} sw={8} /> مبرمج مساعد
              </Chip>
            </Pop>
          )}
          {frame >= s(b, 2) && (
            <Pop at={s(b, 2)}>
              <Row gap={16}>
                <Chip size={40}>انت بتوصف</Chip>
                <T size={50} color={D.dim}>←</T>
                <Chip size={40}>هو ينفذ</Chip>
                <T size={50} color={D.dim}>←</T>
                <Chip size={40} bg={STEP} color={C.ink}>يوريك النتيجة</Chip>
              </Row>
            </Pop>
          )}
          {frame >= online && (
            <Pop at={online}>
              <Row gap={16}>
                <Chip size={42}>
                  <Icon name="cloud" size={48} sw={8} /> أونلاين
                </Chip>
                <Chip size={42}>
                  <Icon name="phone" size={48} sw={8} /> من تطبيق Claude
                </Chip>
              </Row>
            </Pop>
          )}
        </Col>
        <Pop at={8} style={{ transform: `translateY(${bob}px)` }}>
          <Phone w={250} glow>
            <T size={20} weight={600} color={C.inkSoft} ltr>Claude</T>
            <Bubble at={s(b, 2) + 6} me size={20}>صغّر صور المدونة</Bubble>
            <Bubble at={s(b, 2) + 20} size={20}>تمام، خلصت. شوف النتيجة</Bubble>
          </Phone>
        </Pop>
      </Row>
    </Stage>
  );
};

export const STEPS = ["عرّفه على المشروع", "كل مهمة لوحدها", "سيبه يشتغل", "اختيارات قبل التنفيذ", "شوف بعينك قبل ما توافق"];

// 5 — five simple steps
export const S5: React.FC<SceneProps> = ({ len }) => (
  <Stage gap={18} zoom={1.1}>
    <Pop at={2}>
      <T size={70} style={{ marginBottom: 16 }}>
        <Mark at={8} color={STEP}>5 خطوات بسيطة</Mark>
      </T>
    </Pop>
    {STEPS.map((t, i) => (
      <Pop key={t} at={8 + i * Math.max(3, Math.floor((len - 24) / 6))} x={-30} from={0}>
        <Glass w={760} pad={16} style={{ display: "flex", alignItems: "center", gap: 20, direction: "rtl" }}>
          <div style={{ width: 58, height: 58, borderRadius: 16, background: STEP, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <T size={36} color={C.ink} ltr>{i + 1}</T>
          </div>
          <T size={40}>{t}</T>
        </Glass>
      </Pop>
    ))}
  </Stage>
);

// 6 — step 1: introduce it to the project, like briefing a new colleague; written once, read every time
export const S6: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const notes = ["الموقع معمول إزاي", "بيتبني إزاي", "إيه القواعد"];
  return (
    <>
      <Stage gap={40} zoom={1.15}>
        <Row gap={90}>
          {frame >= s(b, 2) && (
            <Col gap={18}>
              {[0, 1, 2].map((i) => (
                <Pop key={i} at={s(b, 2) + i * 8}>
                  <Row gap={14}>
                    <Badge name="robot" size={80} bg={C.tealSoft} />
                    <T size={34} color={D.dim}>بيقرا الملف الأول</T>
                  </Row>
                </Pop>
              ))}
            </Col>
          )}
          <Col gap={20}>
            <Pop at={38}>
              <Badge name="file" size={200} bg={C.card} />
            </Pop>
            <Pop at={44}>
              <T size={44}>ملف شرح المشروع</T>
            </Pop>
            {frame >= s(b, 1) &&
              notes.map((t, i) => (
                <Pop key={t} at={w(b, "معمول") + i * 14}>
                  <Chip size={36}>{t}</Chip>
                </Pop>
              ))}
          </Col>
        </Row>
      </Stage>
      <Chapter n={1} title="عرّفه على المشروع" accent={STEP} />
    </>
  );
};

// 7 — step 2: one task at a time; "improve the site" → shrink images / clean code / change the look; five tasks
export const S7: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const five = s(b, 2);
  if (frame >= five)
    return (
      <Stage gap={40} zoom={1.1}>
        <Pop at={five}>
          <T size={66}>خمس مهام · كام واحدة منهم في نفس الوقت</T>
        </Pop>
        <Row gap={24}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Pop key={i} at={five + 6 + i * 6}>
              <Glass w={200} pad={20} accent={STEP} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Icon name="robot" size={72} color={D.text} />
                <div style={{ width: 140, height: 14, borderRadius: 7, background: "#ffffff18", overflow: "hidden", direction: "ltr" }}>
                  <div style={{ height: "100%", width: `${20 + ((frame * (1 + i * 0.25)) % 80)}%`, background: STEP }} />
                </div>
              </Glass>
            </Pop>
          ))}
        </Row>
      </Stage>
    );
  return (
    <>
      <Stage gap={50} zoom={1.15}>
        <Pop at={38}>
          <Chip size={60} bg={C.orangeSoft}>
            <Strike at={s(b, 1) + 4}>«حسّن الموقع»</Strike>
          </Chip>
        </Pop>
        {frame >= s(b, 1) && (
          <Row gap={22}>
            {[
              ["صغّر الصور", "image"],
              ["نضّف الكود", "code"],
              ["غيّر الشكل", "brush"],
            ].map(([t, ic], i) => (
              <Pop key={t} at={w(b, ["صغّر", "نضّف", "غيّر"][i])}>
                <Chip size={48} bg={STEP} color={C.ink}>
                  <Icon name={ic as "image"} size={52} sw={8} /> {t}
                </Chip>
              </Pop>
            ))}
          </Row>
        )}
      </Stage>
      <Chapter n={2} title="كل مهمة لوحدها" accent={STEP} />
    </>
  );
};

// 8 — step 3: let it work: it keeps going on Anthropic's machines with the phone off; ~2h of my time
export const S8: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const me = s(b, 2);
  const FULL = 1000;
  if (frame >= me) {
    const bar = (label: string, hrs: number, at: number, color: string, icon: "phone" | "robot", txt: string) => (
      <Pop at={at} x={-60} from={0}>
        <Row gap={30} style={{ width: 1500, justifyContent: "flex-start" }}>
          <div style={{ width: 260, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <Icon name={icon} size={76} color={D.text} />
            <T size={50}>{label}</T>
          </div>
          <div style={{ height: 76, width: FULL * (hrs / 10.5) * ease(frame, [at + 4, at + 34], [0, 1]), background: color, borderRadius: 18, minWidth: 10 }} />
          <T size={50}>{txt}</T>
        </Row>
      </Pop>
    );
    return (
      <Stage gap={60}>
        {bar("أنا", 2, me, C.orange, "phone", "حوالي ساعتين")}
        {bar("Claude", 10.5, w(b, "كمّل"), STEP, "robot", "الباقي")}
      </Stage>
    );
  }
  const blink = (i: number) => (Math.floor(frame / 6 + i * 3) % 4 === 0 ? STEP : "#ffffff22");
  return (
    <>
      <Stage zoom={1.2}>
        <Row gap={110}>
          <Pop at={38}>
            <Col gap={16}>
              <Badge name="cloud" size={220} bg={C.tealSoft} />
              <Row gap={14} ltr>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 76, height: 104, borderRadius: 14, border: `3px solid ${D.line}`, background: D.glass, display: "flex", flexDirection: "column", gap: 10, padding: 14, boxSizing: "border-box" }}>
                    {[0, 1, 2].map((k) => (
                      <div key={k} style={{ width: 14, height: 14, borderRadius: 7, background: blink(i + k) }} />
                    ))}
                  </div>
                ))}
              </Row>
              <T size={36} weight={600} color={D.dim} ltr>Anthropic</T>
            </Col>
          </Pop>
          {frame >= w(b, "قفلت") && (
            <Pop at={w(b, "قفلت")}>
              <Col gap={18}>
                <Phone w={170} off />
                <T size={42}>الموبايل مقفول… والشغل ماشي</T>
              </Col>
            </Pop>
          )}
        </Row>
      </Stage>
      <Chapter n={3} title="سيبه يشتغل" accent={STEP} />
    </>
  );
};

// 9 — step 4: options before execution: three looks, viewed on the phone, picked one, then applied everywhere
export const S9: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const pick = w(b, "واخترت");
  const k = ease(frame, [pick, pick + 14], [0, 1]);
  const all = s(b, 2);
  const opts = [C.orange, C.teal, "#6B5BD2"];
  return (
    <>
      <Stage gap={40} zoom={1.05}>
        <Pop at={38}>
          <T size={64}>
            <Mark at={46} color={STEP}>تلات أشكال</Mark> مختلفة للموقع
          </T>
        </Pop>
        <Row gap={50} ltr>
          {opts.map((a, i) => (
            <Pop key={i} at={s(b, 1) + i * 6}>
              <div style={{ position: "relative", transform: `rotate(${(i - 1) * 6 * (1 - k)}deg) scale(${i === 1 ? 1 + k * 0.15 : 1 - k * 0.1})`, opacity: i === 1 ? 1 : 1 - k * 0.6 }}>
                <div style={{ width: 250, height: 390, borderRadius: 24, background: C.card, padding: 18, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 12, boxShadow: i === 1 && k > 0 ? `0 0 70px ${STEP}88` : "0 20px 50px #0008" }}>
                  <div style={{ height: 40, borderRadius: 10, background: a }} />
                  <div style={{ height: 16, width: "70%", borderRadius: 8, background: "#1E2A2E33" }} />
                  <div style={{ flex: 1, borderRadius: 14, background: "#1E2A2E12" }} />
                  <div style={{ height: 32, width: "45%", borderRadius: 16, background: a }} />
                </div>
                {i !== 1 && frame >= pick && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="x" size={210} color={C.red} sw={7} draw={pick + 6} />
                  </div>
                )}
              </div>
            </Pop>
          ))}
        </Row>
        <div style={{ height: 80 }}>
          {frame >= all && (
            <Pop at={all}>
              <Chip size={46} bg={STEP} color={C.ink}>وبعدها بس: على كل الصفحات</Chip>
            </Pop>
          )}
        </div>
      </Stage>
      <Chapter n={4} title="اختيارات قبل التنفيذ" accent={STEP} />
    </>
  );
};

// 10 — the look I picked: a picture per article, Arabic + English, dark mode (real recordings)
export const S10: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const sub = s(b, 1);
  return (
    <Stage gap={30}>
      {frame < sub ? (
        <Pop at={2}>
          <Frame src="v3-bloglist.mp4" w={1200} url="hfares.com/blog" accent={STEP} />
        </Pop>
      ) : (
        <>
          <Row gap={30} ltr>
            <Pop at={sub}>
              <Frame src="v3-arblog.mp4" w={860} url="hfares.com/ar/blog" tilt={8} accent={STEP} from={sub} />
            </Pop>
            <Pop at={w(b, "غامق")}>
              <Frame src="v3-bloglist-dark.mp4" w={860} url="hfares.com/blog" tilt={-8} accent={STEP} from={w(b, "غامق")} />
            </Pop>
          </Row>
          <Row gap={18}>
            {["صورة لكل مقال", "عربي وإنجليزي", "وضع غامق"].map((t, i) => (
              <Pop key={t} at={sub + i * 12}>
                <Chip size={42}>{t}</Chip>
              </Pop>
            ))}
          </Row>
        </>
      )}
    </Stage>
  );
};

// 11 — step 5: see it before approving: every change gets a link with a test copy; open it on the phone
export const S11: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bob = useBob(30, 6);
  const ok = w(b, "بوافق");
  return (
    <>
      <Stage gap={40} zoom={1.05}>
        <Row gap={80}>
          <Col gap={22} style={{ alignItems: "flex-end" }}>
            {frame >= s(b, 1) && (
              <Pop at={s(b, 1)}>
                <Chip size={48}>
                  <Icon name="link" size={52} sw={8} /> لينك · نسخة تجريبية من الموقع
                </Chip>
              </Pop>
            )}
            {frame >= ok && (
              <Slam at={ok}>
                <Chip size={58} bg={STEP} color={C.ink}>
                  <Icon name="check" size={60} sw={11} /> عاجبني؟ موافق
                </Chip>
              </Slam>
            )}
          </Col>
          <Pop at={38} style={{ transform: `translateY(${bob}px)` }}>
            <div style={{ width: 360, height: 730, borderRadius: 50, background: C.ink, padding: 14, boxSizing: "border-box", boxShadow: `0 0 70px ${STEP}66` }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 38, overflow: "hidden", background: C.white }}>
                <Sequence from={38} layout="none">
                  <OffthreadVideo src={staticFile("videos/v3-portfolio/site/v3-post-mobile.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%" }} />
                </Sequence>
              </div>
            </div>
          </Pop>
        </Row>
      </Stage>
      <Chapter n={5} title="شوف بعينك قبل ما توافق" accent={STEP} />
    </>
  );
};

// 12 — result: clearly faster in Google's speed test; home shows in about half the time; images 10x+ lighter
export const S12: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const img = s(b, 3);
  const k = ease(frame, [img + 10, img + 36], [0, 1], theme.ease.inOut);
  const W = 1100;
  return (
    <Stage gap={50}>
      <Pop at={2}>
        <T size={76}>والنتيجة؟</T>
      </Pop>
      {frame < img ? (
        <Col gap={50}>
          {frame >= s(b, 1) && (
            <Pop at={s(b, 1)}>
              <Col gap={14}>
                <Shot src="lh-v3-scores.jpg" w={1100} accent={STEP} />
                <T size={34} color={D.dim}>اختبار جوجل للسرعة (Lighthouse)</T>
              </Col>
            </Pop>
          )}
          {frame >= s(b, 2) && (
            <Pop at={s(b, 2)}>
              <Chip size={48} bg={C.mustard}>الصفحة بتظهر في نص الوقت تقريبًا</Chip>
            </Pop>
          )}
        </Col>
      ) : (
        <Pop at={img}>
          <Col gap={20}>
            <Row gap={20}>
              <Icon name="image" size={70} color={D.text} />
              <T size={56}>صور المدونة</T>
            </Row>
            <div style={{ width: W, direction: "ltr" }}>
              <div style={{ height: 100, width: W * (1 - k * (1 - 16.3 / 198.5)), background: k > 0.5 ? STEP : C.orange, borderRadius: 22 }} />
            </div>
            <T size={70} color={k > 0.5 ? STEP : D.text}>{k > 0.5 ? "أخف أكتر من 10 مرات" : "قبل"}</T>
          </Col>
        </Pop>
      )}
    </Stage>
  );
};

// 13 — honesty: I didn't read the code; another tool reviewed it and its issues were fixed; it's a risk, your call
export const S13: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={40} zoom={1.15}>
      <Pop at={2}>
        <T size={62}>
          لازم أكون <Mark at={10} color={C.orange}>صريح</Mark>
        </T>
      </Pop>
      <Row gap={70}>
        {frame >= s(b, 1) && (
          <Pop at={s(b, 1)}>
            <Col gap={14}>
              <div style={{ position: "relative" }}>
                <Badge name="eye" size={170} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="x" size={180} color={C.red} sw={9} draw={s(b, 1) + 10} />
                </div>
              </div>
              <T size={40}>ما قريتش الكود</T>
            </Col>
          </Pop>
        )}
        {frame >= s(b, 2) && (
          <Pop at={s(b, 2)}>
            <Col gap={14}>
              <Badge name="robot" size={170} bg={C.tealSoft} />
              <T size={40}>أداة تانية راجعته</T>
            </Col>
          </Pop>
        )}
      </Row>
      <div style={{ height: 90 }}>
        {frame >= w(b, "مخاطرة") && (
          <Pop at={w(b, "مخاطرة")}>
            <Chip size={48} bg={C.orangeSoft}>مخاطرة · والقرار عليك</Chip>
          </Pop>
        )}
      </div>
    </Stage>
  );
};

// 14 — cost: the regular Claude plan
export const S14: React.FC<SceneProps> = ({ b }) => (
  <Stage gap={40} zoom={1.2}>
    <Pop at={2}>
      <T size={80}>والتكلفة؟</T>
    </Pop>
    <Pop at={s(b, 1)}>
      <Chip size={60} ltr>Claude · الاشتراك العادي</Chip>
    </Pop>
  </Stage>
);

// 15 — the technical details are step by step in the article; link in the description
export const S15: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={40}>
      <Row gap={60}>
        <Col gap={24} style={{ alignItems: "flex-end" }}>
          <Pop at={2}>
            <T size={60}>التفاصيل التقنية</T>
          </Pop>
          {["الملفات", "طريقة المراجعة", "القياس"].map((t, i) => (
            <Pop key={t} at={10 + i * 8} x={-40} from={0}>
              <Chip size={44}>{t}</Chip>
            </Pop>
          ))}
          {frame >= s(b, 1) && (
            <Pop at={s(b, 1)}>
              <Chip size={50} bg={C.mustard}>خطوة بخطوة في المقال · اللينك في الوصف</Chip>
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

// 16 — comment question: what's the first thing you'd improve on your site?
export const S16: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bob = useBob(10, 8);
  return (
    <Stage gap={40} zoom={1.1}>
      <Pop at={2}>
        <T size={60} color={D.dim}>ولو جربت…</T>
      </Pop>
      {frame >= s(b, 1) && (
        <Slam at={s(b, 1)}>
          <T size={96}>
            إيه <Mark at={s(b, 1) + 8} color={ACCENT.outro}>أول حاجة</Mark> نفسك تطورها في موقعك؟
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
