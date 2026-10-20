// Beats 1–11: hook, intro, chapter 1 (laptop stayed shut), chapter 2 (three versions).
import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { s, w } from "../timing";
import { Badge, Bubble, Card, Chip, Col, Count, Flash, Icon, Illus, Laptop, Mark, Phone, Pop, Row, Slam, Stage, Strike, T, Win, ease, useBob, useShakeAt } from "../kit";

const C = theme.colors;
export type SceneProps = { b: number; len: number };

// 1 — hook: rebuilt the site, third time, laptop shut, all from the phone
export const S1: React.FC<SceneProps> = ({ b }) => {
  const v3 = w(b, "التالتة");
  const shake = useShakeAt([v3]);
  const bob = useBob(26, 8);
  return (
    <Stage gap={50} style={{ transform: shake }}>
      <Row gap={36}>
        <Slam at={2}>
          <T size={104}>بنيت موقعي من الأول</T>
        </Slam>
        <Slam at={v3} tilt={4}>
          <Chip bg={C.teal} color={C.white} size={84} ltr>
            V3
          </Chip>
        </Slam>
      </Row>
      <Row gap={180}>
        <Pop at={s(b, 1)}>
          <div style={{ position: "relative" }}>
            <Laptop w={460} asleep />
            <div style={{ position: "absolute", inset: -30, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="x" size={300} color={C.red} sw={9} draw={s(b, 1) + 14} />
            </div>
          </div>
        </Pop>
        <Pop at={s(b, 2)} style={{ transform: `translateY(${bob}px)` }}>
          <Phone w={190} glow>
            <Bubble at={s(b, 2) + 8} me size={18}>ابني الموقع من جديد</Bubble>
            <Bubble at={s(b, 2) + 18} size={18}>تمام، شغال عليه</Bubble>
          </Phone>
        </Pop>
      </Row>
      <Flash at={v3} peak={0.5} />
    </Stage>
  );
};

// 2 — didn't read a single line, not one diff
export const S2: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={40} zoom={1}>
      <Slam at={0} out={s(b, 1) - 4}>
        <T size={170}>وكمان؟</T>
      </Slam>
      {frame >= s(b, 1) && (
        <Row gap={70}>
          <Pop at={s(b, 1)}>
            <Win w={720} title="pull request #8 · files changed">
              <Col gap={14} style={{ alignItems: "stretch", direction: "ltr" }}>
                {[0.9, 0.6, 0.75, 0.4, 0.85, 0.55].map((l, i) => (
                  <div key={i} style={{ height: 22, width: `${l * 100}%`, borderRadius: 8, background: i % 3 === 1 ? "#F3C9C7" : i % 3 === 2 ? "#CDEBD3" : C.paperDeep, filter: "blur(1.5px)" }} />
                ))}
              </Col>
            </Win>
          </Pop>
          <Col gap={26}>
            <Pop at={s(b, 1) + 8}>
              <div style={{ position: "relative" }}>
                <Badge name="eye" size={190} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="x" size={200} color={C.red} sw={9} draw={s(b, 1) + 16} />
                </div>
              </div>
            </Pop>
            <Pop at={s(b, 2)}>
              <T size={78}>
                <Mark at={s(b, 2) + 6}>ولا diff واحد</Mark>
              </T>
            </Pop>
          </Col>
        </Row>
      )}
    </Stage>
  );
};

// 3 — four PRs merged in a day; teaser for the bill
export const S3: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bill = s(b, 2);
  return (
    <Stage gap={46}>
      {frame < bill ? (
        <>
          <Row gap={28} ltr>
            {[5, 6, 7, 8].map((n, i) => (
              <Pop key={n} at={4 + i * 5}>
                <Card w={300} pad={24} style={{ transform: `rotate(${(i - 1.5) * 2}deg)` }}>
                  <T size={44} ltr style={{ textAlign: "left" }}>PR #{n}</T>
                  <Pop at={14 + i * 6} from={10}>
                    <Chip bg={C.teal} color={C.white} size={30} ltr style={{ marginTop: 14 }}>
                      <Icon name="merge" size={34} color={C.white} sw={9} /> Merged
                    </Chip>
                  </Pop>
                </Card>
              </Pop>
            ))}
          </Row>
          <Row gap={30}>
            {["ديزاين جديد", "Server Rendering", "Analytics بجد"].map((t, i) => (
              <Pop key={t} at={s(b, 1) + i * 8}>
                <Chip size={50} bg={i === 0 ? C.mustard : C.card}>{t}</Chip>
              </Pop>
            ))}
          </Row>
        </>
      ) : (
        <Row gap={60}>
          <Slam at={bill}>
            <Card w={440} pad={34} style={{ transform: "rotate(-3deg)" }}>
              <T size={40} color={C.inkSoft}>الفاتورة</T>
              <T size={150} ltr color={C.teal}>$ ?</T>
            </Card>
          </Slam>
          <Pop at={w(b, "مفاجأة")}>
            <T size={86}>
              <Mark at={w(b, "مفاجأة") + 4} color={C.orangeSoft}>آخر الفيديو</Mark>
            </T>
          </Pop>
        </Row>
      )}
    </Stage>
  );
};

// 4 — I'm Hossam Fares; this is v3 of hfares.com
export const S4: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={40} zoom={1}>
      {frame < s(b, 1) ? (
        <Col gap={10}>
          <Slam at={2}>
            <T size={150}>حسام فارس</T>
          </Slam>
          <Pop at={10}>
            <T size={52} weight={600} color={C.inkSoft} ltr>Hossam Fares · AI builder</T>
          </Pop>
        </Col>
      ) : (
        <Row gap={60}>
          <Pop at={s(b, 1)}>
            <Win w={880} title="hfares.com" bar={C.tealSoft}>
              <Col gap={20} style={{ alignItems: "stretch" }}>
                <div style={{ height: 70, borderRadius: 14, background: C.teal }} />
                <Row gap={20}>
                  {[0, 1, 2].map((i) => (
                    <Pop key={i} at={s(b, 1) + 8 + i * 4} from={20}>
                      <div style={{ width: 250, height: 170, borderRadius: 14, border: `4px solid ${C.ink}`, background: i === 1 ? C.orangeSoft : C.paper }} />
                    </Pop>
                  ))}
                </Row>
              </Col>
            </Win>
          </Pop>
          <Slam at={s(b, 1) + 14} tilt={5}>
            <Chip bg={C.teal} color={C.white} size={90} ltr>V3</Chip>
          </Slam>
        </Row>
      )}
      {frame >= s(b, 2) && (
        <Pop at={s(b, 2)} from={30}>
          <Chip size={46} bg={C.mustard}>
            <Icon name="play" size={52} sw={7} /> تعالى أحكيلك حصل إيه
          </Chip>
        </Pop>
      )}
    </Stage>
  );
};

// chapter header slam over the first second of a chapter's first beat
export const Chapter: React.FC<{ n: number; title: string }> = ({ n, title }) => {
  const frame = useCurrentFrame();
  const k = ease(frame, [30, 40], [0, 1], theme.ease.in);
  if (frame > 42) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.ink, opacity: 1 - k, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
      <Row gap={40}>
        <Slam at={0}>
          <div style={{ width: 170, height: 170, borderRadius: 40, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <T size={110} color={C.white} ltr>{n}</T>
          </div>
        </Slam>
        <Pop at={4} x={60}>
          <T size={110} color={C.paper}>{title}</T>
        </Pop>
      </Row>
    </div>
  );
};

// 5 — not planned: just paid for Claude Pro, wanted to try the new updates
export const S5: React.FC<SceneProps> = ({ b }) => (
  <>
    <Stage gap={50}>
      <Row gap={70}>
        <Pop at={s(b, 1)}>
          <Card w={520} pad={36} style={{ transform: "rotate(-2deg)" }}>
            <Row gap={20}>
              <Badge name="check" bg={C.tealSoft} size={110} />
              <Col gap={0} style={{ alignItems: "flex-start" }}>
                <T size={62} ltr>Claude Pro</T>
                <T size={36} weight={600} color={C.inkSoft}>لسه دافع الاشتراك</T>
              </Col>
            </Row>
          </Card>
        </Pop>
        <Pop at={8}>
          <T size={88}>
            ما كانش <Mark at={20}>متخطط</Mark>
          </T>
        </Pop>
      </Row>
      <Row gap={28} ltr>
        {["Opus 5.5", "Artifacts", "Claude Design"].map((t, i) => (
          <Pop key={t} at={s(b, 2) + i * 9}>
            <Chip size={56} ltr bg={i === 0 ? C.teal : C.card} color={i === 0 ? C.white : C.ink}>{t}</Chip>
          </Pop>
        ))}
      </Row>
    </Stage>
    <Chapter n={1} title="ما فتحتش اللابتوب" />
  </>
);

// 6 — Claude Code in the cloud from the phone app; "so, let's go"
export const S6: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bob = useBob(30, 7);
  return (
    <Stage gap={30}>
      {frame < s(b, 1) ? (
        <Row gap={110}>
          <Pop at={2} style={{ transform: `translateY(${bob}px)` }}>
            <Phone w={250} glow>
              <T size={22} weight={600} color={C.inkSoft} ltr>Claude Code · cloud</T>
              <Bubble at={10} me size={20}>حدّث موقعي hfares.com</Bubble>
              <Bubble at={22} size={20}>بدأت session على الكلاود</Bubble>
            </Phone>
          </Pop>
          <Col gap={20}>
            <Pop at={14}>
              <Badge name="cloud" size={220} bg={C.tealSoft} />
            </Pop>
            <Pop at={22}>
              <T size={66}>
                شغال على <Mark at={30}>الكلاود</Mark>
              </T>
            </Pop>
          </Col>
        </Row>
      ) : frame < s(b, 2) ? (
        <Pop at={s(b, 1)}>
          <Illus n={1} w={1180} dur={150} />
        </Pop>
      ) : (
        <Slam at={s(b, 2)}>
          <T size={220} color={C.teal}>يلا!</T>
        </Slam>
      )}
    </Stage>
  );
};

// version card used in chapter 2
const VCard: React.FC<{ v: string; when: string; at: number; children: React.ReactNode; w?: number }> = ({ v, when, at, children, w: width = 1300 }) => (
  <Pop at={at}>
    <Card w={width} pad={40}>
      <Row gap={30} style={{ justifyContent: "flex-start" }}>
        <Chip bg={C.teal} color={C.white} size={64} ltr>{v}</Chip>
        <T size={56} color={C.inkSoft}>{when}</T>
      </Row>
      <div style={{ marginTop: 34 }}>{children}</div>
    </Card>
  </Pop>
);

const Stat: React.FC<{ at: number; label: string; children: React.ReactNode; hero?: boolean }> = ({ at, label, children, hero }) => (
  <Pop at={at}>
    <Col gap={4}>
      <T size={110} color={hero ? C.teal : C.ink} ltr>{children}</T>
      <T size={40} weight={600} color={C.inkSoft}>{label}</T>
    </Col>
  </Pop>
);

// 7 — V1: Sept 2025, Replit agent + ChatGPT, 3 days, $15
export const S7: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Stage>
        {frame < s(b, 1) ? (
          <Pop at={6}>
            <Illus n={2} w={1150} dur={120} pan={[30, -20]} />
          </Pop>
        ) : (
          <VCard v="V1" when="سبتمبر 2025" at={s(b, 1)}>
            <Row gap={90}>
              <Col gap={22}>
                <Pop at={s(b, 2)}><Chip size={48} ltr>Replit agent</Chip></Pop>
                <Pop at={s(b, 2) + 8}><Chip size={48} ltr>ChatGPT</Chip></Pop>
              </Col>
              <Stat at={s(b, 3)} label="أيام"><Count to={3} at={s(b, 3)} dur={20} /></Stat>
              <Stat at={s(b, 3) + 10} label="دولار" hero>$<Count to={15} at={s(b, 3) + 10} dur={24} /></Stat>
            </Row>
          </VCard>
        )}
      </Stage>
      <Chapter n={2} title="تلات نسخ" />
    </>
  );
};

// 8 — V2: May 2026, audit → specs → Claude Code + DeepSeek V4 Pro
export const S8: React.FC<SceneProps> = ({ b }) => {
  const arrow = (at: number) => (
    <Pop at={at} from={0} x={30}>
      <T size={90} color={C.inkSoft}>←</T>
    </Pop>
  );
  return (
    <Stage>
      <VCard v="V2" when="مايو 2026" at={0}>
        <Row gap={30}>
          <Pop at={s(b, 1)}>
            <Col gap={10}>
              <Badge name="search" size={150} />
              <T size={38}>SEO + UX audit</T>
            </Col>
          </Pop>
          {arrow(s(b, 1) + 16)}
          <Pop at={s(b, 1) + 22}>
            <Col gap={10}>
              <Row gap={-40} ltr>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ transform: `rotate(${(i - 1) * 8}deg)` }}>
                    <Badge name="file" size={120} />
                  </div>
                ))}
              </Row>
              <T size={38} ltr>specs</T>
            </Col>
          </Pop>
          {arrow(s(b, 2))}
          <Pop at={s(b, 2) + 6}>
            <Card pad={26} bg={C.tealSoft}>
              <T size={46} ltr>Claude Code</T>
              <T size={34} weight={600} ltr color={C.inkSoft}>+ DeepSeek V4 Pro</T>
            </Card>
          </Pop>
        </Row>
      </VCard>
    </Stage>
  );
};

// 9 — one afternoon, 37M tokens, 87 cents; harness > model
export const S9: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const q = s(b, 3);
  return (
    <Stage gap={60}>
      <Row gap={110} style={{ opacity: frame >= q ? 0.35 : 1, transform: `scale(${frame >= q ? 0.85 : 1})` }}>
        <Stat at={2} label="بعد ضهر واحد">
          <Icon name="clock" size={120} draw={2} />
        </Stat>
        <Stat at={s(b, 1)} label="token">
          <Count to={37} at={s(b, 1)} dur={30} />M
        </Stat>
        <Stat at={s(b, 2)} label="بس" hero>
          $<Count to={0.87} at={s(b, 2)} dur={30} fmt={(n) => n.toFixed(2)} />
        </Stat>
      </Row>
      {frame >= q && (
        <Slam at={q}>
          <Card pad={34} bg={C.mustard}>
            <T size={76}>
              الـ harness <span style={{ color: C.teal }}>أهم</span> من الموديل
            </T>
          </Card>
        </Slam>
      )}
    </Stage>
  );
};

// 10 — V3: Claude Opus cloud sessions from the Android app; no terminal, IDE or local code
export const S10: React.FC<SceneProps> = ({ b }) => (
  <Stage>
    <VCard v="V3" when="النهارده" at={0}>
      <Row gap={70}>
        <Pop at={s(b, 1)}>
          <Row gap={24}>
            <Phone w={170} glow>
              <Bubble at={s(b, 1) + 8} me size={14}>ابدأ session</Bubble>
              <Bubble at={s(b, 1) + 16} size={14}>شغال على الكلاود</Bubble>
            </Phone>
            <Col gap={6} style={{ alignItems: "flex-start" }}>
              <T size={52} ltr>Claude Opus</T>
              <T size={36} weight={600} color={C.inkSoft}>cloud sessions · أندرويد</T>
            </Col>
          </Row>
        </Pop>
        <Col gap={20}>
          {["Terminal", "IDE", "كود على جهازي"].map((t, i) => (
            <Pop key={t} at={s(b, 2) + i * 10}>
              <Chip size={44} ltr={i < 2}>
                <Strike at={s(b, 2) + i * 10 + 6}>{t}</Strike>
              </Chip>
            </Pop>
          ))}
        </Col>
      </Row>
    </VCard>
  </Stage>
);

// 11 — V1 proved I can ship, V2 cheap, V3 asked: how little of me does this need?
export const S11: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const q = s(b, 3);
  const rows: [string, string, number][] = [
    ["V1", "أقدر أطلق", s(b, 0)],
    ["V2", "أقدر أطلق برخص", s(b, 1)],
    ["V3", "سؤال مختلف…", s(b, 2)],
  ];
  if (frame >= q)
    return (
      <Stage>
        <Slam at={q}>
          <T size={120}>
            محتاجني <Mark at={q + 10}>أنا</Mark> قد إيه؟
          </T>
        </Slam>
        <Flash at={q} peak={0.4} />
      </Stage>
    );
  return (
    <Stage gap={34}>
      {rows.map(([v, t, at], i) => (
        <Pop key={v} at={at} x={-80} from={0}>
          <Row gap={36} style={{ width: 1100, justifyContent: "flex-start" }}>
            <Chip bg={i === 2 ? C.teal : C.card} color={i === 2 ? C.white : C.ink} size={56} ltr>{v}</Chip>
            <T size={70}>{t}</T>
            {i < 2 && <Icon name="check" size={80} color={C.green} sw={10} draw={at + 8} />}
          </Row>
        </Pop>
      ))}
    </Stage>
  );
};
