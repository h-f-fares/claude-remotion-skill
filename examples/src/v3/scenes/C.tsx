// Beats 27–42: chapter 6 (who visits), chapter 7 (didn't read the code), chapter 8 (the bill),
// chapter 9 (what's next), comment question and end card.
import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { s, w } from "../timing";
import { Badge, Bubble, Card, Chip, Col, Count, Flash, Icon, Illus, Mark, Phone, Pop, Row, Slam, Stage, Strike, T, Win, ease, useBob, useShakeAt } from "../kit";
import { Chapter, SceneProps } from "./A";

const C = theme.colors;

// 27 — Google Analytics was slow and unresponsive; v3 adds PostHog
export const S27: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const ph = s(b, 2);
  const shake = useShakeAt([s(b, 1) + 6], 10);
  return (
    <>
      <Stage gap={50}>
        <Row gap={80}>
          <Pop at={36}>
            <div style={{ transform: shake, opacity: frame >= ph ? 0.4 : 1 }}>
              <Win w={680} title="Google Analytics">
                <Col gap={20} style={{ height: 300 }}>
                  <div style={{ width: 120, height: 120, borderRadius: 60, border: `12px solid ${C.paperDeep}`, borderTopColor: C.orange, transform: `rotate(${frame * 9}deg)` }} />
                  <T size={46} color={C.inkSoft}>بطيء… ومش بيستجيب</T>
                </Col>
              </Win>
            </div>
          </Pop>
          {frame >= ph && (
            <Slam at={ph}>
              <Chip bg={C.teal} color={C.white} size={90} ltr>PostHog</Chip>
            </Slam>
          )}
        </Row>
      </Stage>
      <Chapter n={6} title="مين بيزورني؟" />
    </>
  );
};

// 28 — session replay + custom events; only after cookie consent; inputs masked
export const S28: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const cons = s(b, 1);
  const mask = s(b, 2);
  const press = cons + 26;
  const pk = ease(frame, [press, press + 6], [1, 0.92]) + ease(frame, [press + 6, press + 12], [0, 0.08]);
  return (
    <Stage gap={50}>
      <Row gap={22}>
        {[
          ["Session replay", true],
          ["ضغطات التواصل", false],
          ["قراية المقالات", false],
          ["اللينكات الخارجية", false],
        ].map(([t, l], i) => (
          <Pop key={t as string} at={4 + i * 8}>
            <Chip size={42} ltr={l as boolean} bg={i === 0 ? C.mustard : C.card}>{t as string}</Chip>
          </Pop>
        ))}
      </Row>
      <Row gap={70}>
        {frame >= cons && (
          <Pop at={cons}>
            <Card w={560} pad={30}>
              <Row gap={18} style={{ justifyContent: "flex-start" }}>
                <Icon name="cookie" size={80} />
                <T size={40}>توافق على كوكيز الـ analytics؟</T>
              </Row>
              <div style={{ position: "relative", marginTop: 22, display: "flex", justifyContent: "center" }}>
                <div style={{ transform: `scale(${pk})` }}>
                  <Chip bg={frame >= press + 4 ? C.teal : C.card} color={frame >= press + 4 ? C.white : C.ink} size={44}>
                    موافق
                  </Chip>
                </div>
                <div style={{ position: "absolute", left: 300 + ease(frame, [cons + 6, press], [140, 0]), top: 30 + ease(frame, [cons + 6, press], [80, 0]) }}>
                  <Icon name="cursor" size={70} fill={C.white} sw={6} />
                </div>
              </div>
            </Card>
          </Pop>
        )}
        {frame >= mask && (
          <Pop at={mask}>
            <Card w={520} pad={30}>
              <T size={36} color={C.inkSoft}>اللي بيتكتب في الـ replay</T>
              <Row gap={16} style={{ marginTop: 14 }}>
                <Icon name="lock" size={70} />
                <div style={{ width: 320, height: 70, borderRadius: 14, border: `4px solid ${C.ink}`, background: C.paper, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <T size={50} ltr>
                    {"••••••••".slice(0, Math.min(8, Math.max(0, Math.floor((frame - mask - 6) / 3))))}
                  </T>
                </div>
              </Row>
            </Card>
          </Pop>
        )}
      </Row>
    </Stage>
  );
};

// 29 — the part I'm most excited about: finally seeing visitors and their journey
export const S29: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const path = s(b, 2);
  const nodes = ["جايين منين", "بيقروا إيه", "بيمشوا من فين"];
  const line = ease(frame, [path, path + 50], [0, 1]);
  return (
    <Stage gap={50}>
      {frame < s(b, 1) ? (
        <Pop at={2}>
          <Illus n={6} w={1150} dur={120} zoom={[1, 1.15]} pan={[0, 30]} />
        </Pop>
      ) : frame < path ? (
        <Col gap={30}>
          <Row gap={60}>
            {[0, 1, 2].map((i) => (
              <Pop key={i} at={s(b, 1) + i * 6}>
                <div style={{ width: 170, height: 230, borderRadius: "85px 85px 30px 30px", border: `6px dashed ${C.inkSoft}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <T size={100} color={C.inkSoft}>؟</T>
                </div>
              </Pop>
            ))}
          </Row>
          <Pop at={s(b, 1) + 16}>
            <T size={66}>
              تلات نسخ لناس <Mark at={s(b, 1) + 24}>مش شايفهم</Mark>
            </T>
          </Pop>
        </Col>
      ) : (
        <div style={{ position: "relative", width: 1600, height: 360, transform: "scale(0.85)" }}>
          <svg width={1600} height={360} style={{ position: "absolute", inset: 0 }}>
            <path d="M1400 180 C 1150 40, 1000 320, 800 180 S 450 40, 200 180" fill="none" stroke={C.teal} strokeWidth={10} strokeDasharray="4 26" strokeLinecap="round" pathLength={1} style={{ strokeDasharray: `${line} 1` }} />
          </svg>
          {nodes.map((t, i) => (
            <div key={t} style={{ position: "absolute", left: 1400 - i * 600 - 170, top: 110 }}>
              <Pop at={path + i * 18}>
                <Chip size={50} bg={i === 2 ? C.mustard : C.card}>{t}</Chip>
              </Pop>
            </div>
          ))}
        </div>
      )}
    </Stage>
  );
};

// 30 — the part that might upset people: I didn't look at the code. Not one diff.
export const S30: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const z = s(b, 2);
  const shake = useShakeAt([z], 16);
  return (
    <>
      <Stage gap={50} style={{ transform: shake }}>
        {frame < s(b, 1) ? (
          <Pop at={36}>
            <Chip bg={C.orange} color={C.ink} size={60}>
              الجزء اللي ممكن يزعل ناس
            </Chip>
          </Pop>
        ) : frame < z ? (
          <Col gap={30}>
            <Pop at={s(b, 1)}>
              <Illus n={7} w={980} dur={90} zoom={[1.05, 1.12]} />
            </Pop>
          </Col>
        ) : (
          <Col gap={10}>
            <Slam at={z}>
              <T size={260} color={C.tealBright} ltr>0</T>
            </Slam>
            <Pop at={z + 6}>
              <T size={70} color={C.white}>diff قريته</T>
            </Pop>
          </Col>
        )}
      </Stage>
      <Flash at={z} peak={0.35} />
      <Chapter n={7} title="ما قريتش الكود" />
    </>
  );
};

// 31 — who reviewed? a code-review agent; two passes on the redesign, 15 issues
export const S31: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const n = s(b, 2);
  const sweep = (k: number) => ease(frame, [n + 6 + k * 22, n + 26 + k * 22], [0, 1], theme.ease.inOut);
  return (
    <Stage gap={50}>
      {frame < s(b, 1) ? (
        <Slam at={2}>
          <T size={110}>مين اللي راجع؟</T>
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
              <Card w={660} pad={34}>
                <Row gap={16} style={{ justifyContent: "flex-start" }}>
                  <T size={44}>مرتين مراجعة على الـ redesign</T>
                </Row>
                {[0, 1].map((k) => (
                  <div key={k} style={{ height: 22, marginTop: 18, borderRadius: 11, background: C.paperDeep, direction: "ltr", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${sweep(k) * 100}%`, background: C.teal }} />
                  </div>
                ))}
                <Row gap={20} style={{ marginTop: 22 }}>
                  <T size={140} color={C.orange} ltr>
                    <Count to={15} at={n + 10} dur={40} />
                  </T>
                  <T size={54}>مشكلة</T>
                </Row>
              </Card>
            </Pop>
          )}
        </Row>
      )}
    </Stage>
  );
};

// 32 — breadcrumb ending on the wrong page; footer year breaking hydration at New Year; 15/15 fixed
export const S32: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const fy = s(b, 1);
  const done = s(b, 2);
  const yr = frame >= fy + 26;
  if (frame >= done)
    return (
      <Stage>
        <Slam at={done}>
          <Row gap={30}>
            <Icon name="check" size={200} color={C.green} sw={12} draw={done + 4} />
            <T size={200} ltr color={C.teal}>
              <Count to={15} at={done} dur={26} />/15
            </T>
          </Row>
        </Slam>
        <Pop at={done + 10}>
          <T size={60}>اتصلحوا قبل الـ merge</T>
        </Pop>
      </Stage>
    );
  return (
    <Stage gap={60}>
      <Pop at={2}>
        <Card pad={28}>
          <Row gap={18}>
            <T size={46}>الرئيسية</T>
            <T size={46} color={C.inkSoft}>‹</T>
            <T size={46}>المدونة</T>
            <T size={46} color={C.inkSoft}>‹</T>
            <Chip size={40} bg={C.orangeSoft}>
              <Icon name="x" size={34} color={C.red} sw={12} /> الصفحة الغلط
            </Chip>
          </Row>
        </Card>
      </Pop>
      {frame >= fy && (
        <Pop at={fy}>
          <Card w={980} pad={28} bg={C.ink}>
            <Row gap={30}>
              <T size={50} color={C.paper} ltr>
                © {yr ? 2027 : 2026} hfares.com
              </T>
              {yr && (
                <Slam at={fy + 26}>
                  <Chip size={36} bg={C.red} color={C.white} ltr>hydration error</Chip>
                </Slam>
              )}
            </Row>
            <T size={34} weight={600} color={C.paperDeep} style={{ marginTop: 10 }}>ليلة راس السنة</T>
          </Card>
        </Pop>
      )}
    </Stage>
  );
};

// 33 — the irony: "Lost in the Context" (June): AI holds 1M tokens, a human reviews ~400 lines
export const S33: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bars = s(b, 2);
  const quote = s(b, 3);
  return (
    <Stage gap={44} zoom={1.1}>
      {frame < s(b, 1) ? (
        <Slam at={2}>
          <T size={120}>والطريف بقى؟</T>
        </Slam>
      ) : (
        <>
          <Pop at={s(b, 1)}>
            <Card pad={26} style={{ transform: "rotate(-1.5deg)" }}>
              <Row gap={20}>
                <Icon name="file" size={70} />
                <T size={56}>«ضايع في السياق»</T>
                <Chip size={34}>يونيو 2026</Chip>
              </Row>
            </Card>
          </Pop>
          {frame >= bars && (
            <Col gap={24} style={{ width: 1400 }}>
              {[
                { l: "الذكاء الاصطناعي", v: "1,000,000 token", wd: 1, c: C.teal, at: bars },
                { l: "البني آدم", v: "~400 سطر", wd: 0.03, c: C.orange, at: w(b, "البني") },
              ].map((r) => (
                <Pop key={r.l} at={r.at} x={-40} from={0}>
                  <Row gap={24} style={{ width: 1400, justifyContent: "flex-start" }}>
                    <T size={44} style={{ width: 330 }}>{r.l}</T>
                    <div style={{ width: 640, direction: "ltr" }}>
                      <div style={{ height: 64, width: Math.max(16, 640 * r.wd * ease(frame, [r.at + 4, r.at + 30], [0, 1])), background: r.c, border: `4px solid ${C.ink}`, borderRadius: 14 }} />
                    </div>
                    <T size={46} ltr>{r.v}</T>
                  </Row>
                </Pop>
              ))}
            </Col>
          )}
          {frame >= quote && (
            <Pop at={quote}>
              <T size={60}>
                «حد هيطلق كود <Mark at={quote + 10}>محدش قدر يقراه</Mark>»
              </T>
            </Pop>
          )}
        </>
      )}
    </Stage>
  );
};

// 34 — today, I was that someone
export const S34: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const me = w(b, "أنا");
  const spot = ease(frame, [0, 20], [0, 1]);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 44%, transparent ${18 + spot * 14}%, #0B1312f2 ${34 + spot * 18}%)` }} />
      <Stage gap={10}>
        <Pop at={2}>
          <T size={70} color={C.paperDeep}>النهارده…</T>
        </Pop>
        <Slam at={me}>
          <T size={150} color={C.white}>
            أنا كنت <span style={{ color: C.tealBright }}>الحد ده</span>
          </T>
        </Slam>
      </Stage>
      <Flash at={me} peak={0.3} />
    </>
  );
};

// 35 — not a contradiction, adaptation: review moved from my eyes to a review agent
export const S35: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const move = s(b, 4);
  const link = s(b, 5);
  const press = link + 24;
  return (
    <Stage gap={50}>
      <Row gap={60}>
        <Pop at={2}>
          <T size={90} color={C.inkSoft}>
            <Strike at={10}>تناقض</Strike>
          </T>
        </Pop>
        {frame >= s(b, 1) && (
          <Slam at={s(b, 1)}>
            <T size={110}>
              <Mark at={s(b, 1) + 6}>تأقلم</Mark>
            </T>
          </Slam>
        )}
      </Row>
      <div style={{ height: 300, display: "flex", alignItems: "center" }}>
        {frame >= s(b, 2) && frame < s(b, 3) && (
          <Pop at={s(b, 2)}>
            <Chip size={50}>
              <Icon name="chart" size={56} sw={8} /> كود الـ AI بقى يعتمد عليه أكتر
            </Chip>
          </Pop>
        )}
        {frame >= s(b, 3) && frame < move && (
          <Pop at={s(b, 3)}>
            <T size={76}>المراجعة ما اختفتش</T>
          </Pop>
        )}
        {frame >= move && frame < link && (
          <Row gap={50}>
            <Pop at={move}>
              <Badge name="eye" size={180} />
            </Pop>
            <Pop at={move + 8} x={40} from={0}>
              <T size={110} color={C.inkSoft}>←</T>
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

const Receipt: React.FC<{ w?: number; children: React.ReactNode; at: number; tilt?: number }> = ({ w: width = 560, children, at, tilt = -2 }) => {
  const frame = useCurrentFrame();
  const print = ease(frame, [at, at + 26], [0, 1]);
  return (
    <div style={{ width: width, transform: `rotate(${tilt}deg)`, clipPath: `inset(0 0 ${(1 - print) * 100}% 0)` }}>
      <div
        style={{
          background: C.card,
          border: `5px solid ${C.ink}`,
          borderRadius: 8,
          padding: "30px 36px 40px",
          boxShadow: `10px 10px 0 ${C.ink}`,
          backgroundImage: `repeating-linear-gradient(180deg, transparent 0 58px, ${C.paperDeep} 58px 60px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// 36 — the bill: V2 cost 87 cents and I was proud of it
export const S36: React.FC<SceneProps> = ({ b }) => (
  <>
    <Stage gap={50}>
      <Pop at={40}>
        <Row gap={20}>
          <Icon name="dollar" size={100} draw={44} />
          <T size={84}>
            الفاتورة اللي <Mark at={52}>وعدتك بيها</Mark>
          </T>
        </Row>
      </Pop>
      <Row gap={80}>
        <Receipt at={s(b, 1)}>
          <T size={44} color={C.inkSoft}>V2 · مايو 2026</T>
          <T size={150} ltr color={C.ink}>$0.87</T>
        </Receipt>
        <Pop at={s(b, 1) + 20}>
          <T size={76}>
            وكنت <Mark at={s(b, 1) + 30}>فخور</Mark> بالرقم ده
          </T>
        </Pop>
      </Row>
    </Stage>
    <Chapter n={8} title="الفاتورة" />
  </>
);

// 37 — Claude Pro $20/month; ~$72 at API prices; never hit the usage limit
export const S37: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const lim = s(b, 3);
  const meter = 0.55 + Math.sin(frame / 14) * 0.08;
  return (
    <Stage gap={40}>
      <Pop at={2}>
        <T size={64}>النسخة التالتة… حكاية تانية</T>
      </Pop>
      <Row gap={80}>
        <Receipt at={s(b, 1)} w={640} tilt={2}>
          <Row gap={0} style={{ justifyContent: "space-between" }}>
            <T size={50} ltr>Claude Pro</T>
            <T size={70} ltr color={C.teal}>$20</T>
          </Row>
          <T size={34} weight={600} color={C.inkSoft} style={{ textAlign: "right" }}>في الشهر</T>
          {frame >= s(b, 2) && (
            <Pop at={s(b, 2)} from={14}>
              <Row gap={0} style={{ justifyContent: "space-between", marginTop: 26 }}>
                <T size={40}>بأسعار الـ API</T>
                <T size={56} ltr color={C.inkSoft}>
                  <Strike at={s(b, 2) + 20}>~$72</Strike>
                </T>
              </Row>
            </Pop>
          )}
        </Receipt>
        {frame >= lim && (
          <Pop at={lim}>
            <Card w={480} pad={30}>
              <T size={40}>الـ usage limit</T>
              <div style={{ position: "relative", height: 56, marginTop: 20, borderRadius: 16, border: `5px solid ${C.ink}`, overflow: "hidden", direction: "ltr" }}>
                <div style={{ height: "100%", width: `${meter * 100}%`, background: C.tealBright }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", direction: "ltr" }}>
                <T size={30} weight={600} color={C.red} ltr>limit ↑</T>
              </div>
              <T size={40} color={C.teal}>عمري ما وصلتله</T>
            </Card>
          </Pop>
        )}
      </Row>
    </Stage>
  );
};

// 38 — V2 cheaper per token; V3 did far more work, on a flat plan, from the phone
export const S38: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bob = useBob(26, 8);
  const col = (v: string, lines: string[], at: number, hero?: boolean) => (
    <Pop at={at}>
      <Card w={600} pad={36} bg={hero ? C.tealSoft : C.card}>
        <Chip bg={hero ? C.teal : C.card} color={hero ? C.white : C.ink} size={56} ltr>{v}</Chip>
        {lines.map((l, i) => (
          <Row key={l} gap={16} style={{ justifyContent: "flex-start", marginTop: 20 }}>
            <Icon name="check" size={56} color={C.green} sw={10} draw={at + 8 + i * 8} />
            <T size={46}>{l}</T>
          </Row>
        ))}
      </Card>
    </Pop>
  );
  return (
    <Stage gap={50} zoom={1}>
      <Row gap={70}>
        {col("V2", ["أرخص لكل token"], s(b, 0))}
        {col("V3", ["شغل أكتر بكتير", "اشتراك ثابت بدفعه أصلًا"], s(b, 1), true)}
        {frame >= s(b, 2) && (
          <Slam at={s(b, 2)}>
            <div style={{ transform: `translateY(${bob}px)` }}>
              <Phone w={170} glow>
                <Bubble at={s(b, 2) + 6} size={16}>كله من هنا</Bubble>
              </Phone>
            </div>
          </Slam>
        )}
      </Row>
    </Stage>
  );
};

// 39 — faster and measurable; still don't know who reads it; PostHog went live at 15:06
export const S39: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const live = s(b, 2);
  const pulse = 1 + Math.sin(frame / 5) * 0.2;
  return (
    <>
      <Stage gap={50}>
        <Row gap={60}>
          <Pop at={36}>
            <Chip size={50}>
              <Icon name="bolt" size={56} sw={8} /> أسرع · وبقيس
            </Chip>
          </Pop>
          {frame >= s(b, 1) && (
            <Pop at={s(b, 1)}>
              <Chip size={50} bg={C.mustard}>
                <Icon name="question" size={56} sw={9} /> مين بيقرا؟
              </Chip>
            </Pop>
          )}
        </Row>
        {frame >= live && (
          <Slam at={live}>
            <Card pad={34}>
              <Row gap={30}>
                <div style={{ width: 34, height: 34, borderRadius: 17, background: C.green, transform: `scale(${pulse})`, boxShadow: `0 0 30px ${C.green}` }} />
                <T size={110} ltr>15:06</T>
                <T size={56} ltr color={C.teal}>PostHog live</T>
              </Row>
            </Card>
          </Slam>
        )}
      </Stage>
      <Chapter n={9} title="اللي براقبه دلوقتي" />
    </>
  );
};

// 40 — in a few weeks: which posts people finish, does anyone click "Book a call"; V4 on data
export const S40: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const v4 = s(b, 1);
  return (
    <Stage gap={44}>
      {frame < v4 ? (
        <Row gap={60}>
          <Pop at={2}>
            <Illus n={9} w={820} dur={150} tilt={1.5} />
          </Pop>
          <Col gap={26}>
            <Pop at={w(b, "بتكمل")}>
              <Chip size={44}>بيكملوا أنهي مقالات؟</Chip>
            </Pop>
            <Pop at={w(b, "احجز")}>
              <Chip size={44} bg={C.mustard}>حد بيضغط «احجز مكالمة»؟</Chip>
            </Pop>
          </Col>
        </Row>
      ) : (
        <Row gap={50}>
          <Slam at={v4}>
            <Chip bg={C.teal} color={C.white} size={110} ltr>V4</Chip>
          </Slam>
          <Pop at={v4 + 8}>
            <T size={100}>= داتا</T>
          </Pop>
          {frame >= w(b, "تخميني") && (
            <Pop at={w(b, "تخميني")}>
              <T size={80} color={C.inkSoft}>
                <Strike at={w(b, "تخميني") + 6}>تخمين</Strike>
              </T>
            </Pop>
          )}
        </Row>
      )}
    </Stage>
  );
};

// 41 — question for the comments: let the agent review, or read every line?
export const S41: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const q = s(b, 2);
  const cm = s(b, 3);
  const bob = useBob(10, 8);
  return (
    <Stage gap={50}>
      {frame < q ? (
        <Col gap={30}>
          <Slam at={2}>
            <T size={130}>وانت بقى؟</T>
          </Slam>
          {frame >= s(b, 1) && (
            <Pop at={s(b, 1)}>
              <Row gap={20}>
                <Icon name="phone" size={80} />
                <T size={60}>هتبني موقعك من الموبايل النهارده…</T>
              </Row>
            </Pop>
          )}
        </Col>
      ) : (
        <>
          <Row gap={70}>
            <Pop at={q}>
              <Card w={560} pad={36} bg={C.tealSoft}>
                <Col gap={16}>
                  <Badge name="robot" size={150} />
                  <T size={50}>الـ agent يراجع لوحده</T>
                </Col>
              </Card>
            </Pop>
            <Pop at={q + 4}>
              <T size={70} color={C.inkSoft}>ولا</T>
            </Pop>
            <Pop at={w(b, "تقرا")}>
              <Card w={560} pad={36} bg={C.orangeSoft}>
                <Col gap={16}>
                  <Badge name="eye" size={150} />
                  <T size={50}>أقرا كل سطر بنفسي</T>
                </Col>
              </Card>
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

// 42 — end card: full article on hfares.com (link in description), subscribe, see you in V4
export const S42: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const sub = s(b, 1);
  const press = sub + 22;
  const done = frame >= press + 4;
  const pk = ease(frame, [press, press + 5], [1, 0.9]) + ease(frame, [press + 5, press + 12], [0, 0.1]);
  return (
    <Stage gap={46}>
      <Pop at={2}>
        <Win w={1150} title="hfares.com/blog/v3-portfolio" bar={C.tealSoft}>
          <T size={56}>النسخة التالتة: بنيت موقعي من موبايلي</T>
          <T size={34} weight={600} color={C.inkSoft} style={{ marginTop: 8 }}>المقال كامل بكل الأرقام · اللينك في الوصف</T>
        </Win>
      </Pop>
      <Row gap={60}>
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
        {frame >= s(b, 2) && (
          <Slam at={s(b, 2)}>
            <T size={90}>
              أشوفك في <span style={{ color: C.teal }}>V4</span>
            </T>
          </Slam>
        )}
      </Row>
    </Stage>
  );
};
