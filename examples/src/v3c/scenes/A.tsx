// Beats 1–12: the short story (blog pages of V1, V2, V3) and steps 1–4.
import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../../v3/theme";
import { s, w } from "../timing";
import { ACCENT, Badge, Bubble, Chapter, Chip, Col, Count, D, Frame, Glass, Icon, Mark, Phone, Pop, Row, Slam, Stage, Strike, T, ease, useBob } from "../../v3b/kit";

const C = theme.colors;
export type SceneProps = { b: number; len: number };
export const STEP = "#2BB3A3";

// real lines from the repo's CLAUDE.md
export const CodeCard: React.FC<{ title: string; lines: [string, string?][]; at: number; w?: number; hi?: number }> = ({ title, lines, at, w: width = 1100, hi }) => (
  <div style={{ width: width, background: "#0D1117", border: "2px solid #30363D", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 100px #000a", direction: "ltr" }}>
    <div style={{ height: 46, background: "#161B22", borderBottom: "2px solid #30363D", display: "flex", alignItems: "center", padding: "0 20px", gap: 10 }}>
      <Icon name="file" size={26} color="#8B949E" sw={8} />
      <div style={{ fontFamily: theme.fonts.main, fontSize: 22, color: "#C9D1D9", fontWeight: 600 }}>{title}</div>
    </div>
    <div style={{ padding: "18px 26px", fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>
      {lines.map(([t, color], i) => (
        <Pop key={i} at={at + i * 4} from={10} x={-20}>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.65,
              color: color ?? "#C9D1D9",
              whiteSpace: "pre",
              background: hi === i ? "#E9B94922" : undefined,
              borderLeft: hi === i ? "4px solid #E9B949" : "4px solid transparent",
              paddingLeft: 12,
            }}
          >
            {t || " "}
          </div>
        </Pop>
      ))}
    </div>
  </div>
);

// 1 — if you have a personal site/blog: here's how I did it from the phone, step by step
export const S1: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={36}>
      <Pop at={2}>
        <Frame src="v3-bloglist.mp4" w={1150} url="hfares.com/blog" accent={ACCENT.hook} />
      </Pop>
      <div style={{ height: 90 }}>
        {frame >= s(b, 1) && frame < s(b, 2) && (
          <Pop at={s(b, 1)}>
            <Chip size={52} bg={C.mustard}>
              <Icon name="phone" size={56} sw={8} /> من الموبايل · خطوة بخطوة
            </Chip>
          </Pop>
        )}
        {frame >= s(b, 2) && (
          <Slam at={s(b, 2)}>
            <T size={72}>
              تقدر تعملها <Mark at={s(b, 2) + 8} color={ACCENT.hook}>انت كمان</Mark>
            </T>
          </Slam>
        )}
      </div>
    </Stage>
  );
};

// 2 — I built this blog three times: Replit agent (3 days), Claude Code + DeepSeek (one afternoon)
export const S2: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <Stage gap={40}>
      <Pop at={2}>
        <T size={70}>
          المدونة دي اتبنت <Mark at={10} color={ACCENT.versions}>تلات مرات</Mark>
        </T>
      </Pop>
      <Row gap={50} ltr>
        {frame >= s(b, 1) && (
          <Pop at={s(b, 1)}>
            <Col gap={18}>
              <Frame src="v1-bloglist.mp4" w={760} url="V1 · 2025" from={s(b, 1)} />
              <Chip size={40} ltr>V1 · Replit agent · 3 days</Chip>
            </Col>
          </Pop>
        )}
        {frame >= s(b, 2) && (
          <Pop at={s(b, 2)}>
            <Col gap={18}>
              <Frame src="v2-bloglist.mp4" w={760} url="V2 · 2026" from={s(b, 2)} />
              <Chip size={40} ltr>V2 · Claude Code + DeepSeek · 1 afternoon</Chip>
            </Col>
          </Pop>
        )}
      </Row>
    </Stage>
  );
};

// 3 — V2 fixed SEO but kept the look; the article page before vs after v3
export const S3: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const ba = s(b, 1);
  if (frame < ba)
    return (
      <Stage gap={36}>
        <Row gap={40} ltr>
          <Pop at={2}>
            <Frame src="v1-bloglist.jpg" w={720} url="V1" />
          </Pop>
          <Pop at={8}>
            <T size={120} color={ACCENT.versions}>=</T>
          </Pop>
          <Pop at={12}>
            <Frame src="v2-bloglist.jpg" w={720} url="V2" />
          </Pop>
        </Row>
        <Row gap={20}>
          <Pop at={w(b, "SEO")}>
            <Chip size={46} ltr>
              <Icon name="check" size={44} color={C.green} sw={11} /> SEO
            </Chip>
          </Pop>
          <Pop at={w(b, "الشكل")}>
            <Chip size={46} bg={C.orangeSoft}>الشكل زي ما هو</Chip>
          </Pop>
        </Row>
      </Stage>
    );
  return (
    <Stage gap={30}>
      <Row gap={50} ltr>
        <Pop at={ba}>
          <Col gap={16}>
            <Frame src="v2-post.mp4" w={800} url="article · V2" from={ba} />
            <Chip size={44}>قبل</Chip>
          </Col>
        </Pop>
        <Pop at={ba + 10}>
          <Col gap={16}>
            <Frame src="v3-post-squirrel.mp4" w={800} url="article · V3" accent={ACCENT.hook} from={ba + 10} />
            <Chip size={44} bg={C.teal} color={C.white}>بعد</Chip>
          </Col>
        </Pop>
      </Row>
    </Stage>
  );
};

// 4 — one question: can I ship a full version without sitting at the laptop? Claude Code in the cloud from the app
export const S4: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const bob = useBob(28, 7);
  return (
    <Stage zoom={1.1}>
      {frame < s(b, 2) ? (
        <Col gap={20}>
          <Pop at={2}>
            <T size={60} color={D.dim}>المرة دي كان عندي سؤال واحد…</T>
          </Pop>
          {frame >= s(b, 1) && (
            <Slam at={s(b, 1)}>
              <T size={100}>
                نسخة كاملة <Mark at={s(b, 1) + 10} color={ACCENT.hook}>من غير لابتوب؟</Mark>
              </T>
            </Slam>
          )}
        </Col>
      ) : (
        <Row gap={90}>
          <Col gap={20} style={{ alignItems: "flex-end" }}>
            <Pop at={s(b, 2)}>
              <T size={84} ltr>Claude Code</T>
            </Pop>
            <Pop at={s(b, 2) + 8}>
              <Row gap={16}>
                <Chip size={44}>
                  <Icon name="cloud" size={50} sw={8} /> في الكلاود
                </Chip>
                <Chip size={44}>
                  <Icon name="phone" size={50} sw={8} /> من تطبيق Claude
                </Chip>
              </Row>
            </Pop>
          </Col>
          <Pop at={s(b, 2) + 4} style={{ transform: `translateY(${bob}px)` }}>
            <Phone w={250} glow>
              <T size={20} weight={600} color={C.inkSoft} ltr>Claude · Code</T>
              <Bubble at={s(b, 2) + 14} me size={20}>نضّف الكود وخلي البناء أسرع</Bubble>
              <Bubble at={s(b, 2) + 26} size={20}>بدأت session على الريبو</Bubble>
            </Phone>
          </Pop>
        </Row>
      )}
    </Stage>
  );
};

export const STEPS = ["CLAUDE.md", "قسّم الشغل", "خليه يكمل من غيرك", "اختيارات قبل التنفيذ", "راجع من الـ preview", "agent تاني يراجع", "قيس قبل ما تصدق"];

// 5 — the steps I followed (roadmap)
export const S5: React.FC<SceneProps> = ({ len }) => (
  <Stage gap={18} zoom={1.05}>
    <Pop at={2}>
      <T size={70} style={{ marginBottom: 16 }}>
        <Mark at={8} color={STEP}>7 خطوات</Mark>
      </T>
    </Pop>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 560px)", gap: "18px 40px", direction: "rtl" }}>
      {STEPS.map((t, i) => (
        <Pop key={t} at={8 + i * Math.max(3, Math.floor((len - 30) / 9))} x={-30} from={0}>
          <Glass pad={18} style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 62, height: 62, borderRadius: 16, background: STEP, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <T size={38} color={C.ink} ltr>{i + 1}</T>
            </div>
            <T size={40} ltr={i === 0}>{t}</T>
          </Glass>
        </Pop>
      ))}
    </div>
  </Stage>
);

// 6 — step 1: CLAUDE.md explains the project; every new session reads it first
export const S6: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Stage gap={40} zoom={1.2}>
        <Row gap={60}>
          {frame >= s(b, 2) && (
            <Col gap={20}>
              {[0, 1, 2].map((i) => (
                <Pop key={i} at={s(b, 2) + i * 8}>
                  <Chip size={36} ltr>
                    <Icon name="robot" size={40} sw={8} /> session {i + 1} · reads CLAUDE.md
                  </Chip>
                </Pop>
              ))}
            </Col>
          )}
          <Pop at={38}>
            <CodeCard
              title="CLAUDE.md"
              at={40}
              w={900}
              hi={frame >= s(b, 1) ? (frame >= w(b, "البناء") ? 9 : frame >= w(b, "الكود") ? 6 : 3) : undefined}
              lines={[
                ["# CLAUDE.md", "#79C0FF"],
                ["This file provides guidance to Claude Code", "#8B949E"],
                [""],
                ["## Commands", "#79C0FF"],
                ["npm run dev        # Express + Vite on :3000"],
                [""],
                ["## Architecture", "#79C0FF"],
                ["Bilingual (English/Arabic) portfolio and blog"],
                [""],
                ["./scripts/build-static-site.sh  # → static/"],
              ]}
            />
          </Pop>
        </Row>
      </Stage>
      <Chapter n={1} title="CLAUDE.md" accent={STEP} />
    </>
  );
};

// the four real PRs (titles and line counts from GitHub)
export const PRS = [
  { n: 5, title: "Code cleanup, single route list, faster build, and bug fixes", add: 647, del: 898, tag: "نضّف الكود" },
  { n: 6, title: "perf: convert blog images to WebP and add JPG share images", add: 1362, del: 1509, tag: "حوّل الصور" },
  { n: 7, title: "Add PostHog analytics, session replay and custom events", add: 288, del: 38, tag: "analytics" },
  { n: 8, title: "Redesign the site: teal palette, IBM Plex fonts, new page layouts", add: 1771, del: 2602, tag: "الديزاين" },
];
export const PrRow: React.FC<{ pr: (typeof PRS)[number]; at: number; hi?: boolean; w?: number; tag?: boolean }> = ({ pr, at, hi, w: width = 1500, tag }) => (
  <Pop at={at} x={-50} from={0}>
    <Row gap={20}>
      {tag && <Chip size={36} bg={hi ? STEP : C.card}>{pr.tag}</Chip>}
      <div
        style={{
          width: width,
          display: "flex",
          alignItems: "center",
          gap: 20,
          direction: "ltr",
          padding: "18px 26px",
          background: "#0D1117",
          border: `2px solid ${hi ? STEP : "#30363D"}`,
          borderRadius: 14,
          fontFamily: theme.fonts.main,
          boxShadow: hi ? `0 0 50px ${STEP}44` : "0 20px 50px #0008",
        }}
      >
        <div style={{ padding: "6px 16px", borderRadius: 999, background: "#8957E5", color: C.white, fontWeight: 700, fontSize: 22, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="merge" size={26} color={C.white} sw={10} /> Merged
        </div>
        <div style={{ flex: 1, color: "#E6EDF3", fontSize: 26, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {pr.title} <span style={{ color: "#8B949E" }}>#{pr.n}</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, whiteSpace: "nowrap" }}>
          <span style={{ color: "#3FB950" }}>+{pr.add.toLocaleString("en-US")}</span> <span style={{ color: "#F85149" }}>−{pr.del.toLocaleString("en-US")}</span>
        </div>
      </div>
    </Row>
  </Pop>
);

// 7 — step 2: split the work: five sessions, one clear task each; four PRs merged
export const S7: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const split = ease(frame, [s(b, 1) + 10, s(b, 1) + 30], [0, 1]);
  const prs = s(b, 2);
  return (
    <>
      <Stage gap={40}>
        {frame < prs ? (
          <div style={{ position: "relative", width: 1500, height: 300 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 60,
                  left: 750 + (i - 2) * 290 * split - (240 + (1 - split) * 360) / 2,
                  width: 240 + (1 - split) * 360,
                  height: 180,
                  opacity: i === 2 ? 1 : split,
                }}
              >
                <Glass pad={20} accent={STEP} style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Icon name="robot" size={70} color={D.text} />
                  <T size={30} ltr>{split > 0.5 ? `session ${i + 1}` : "one big session"}</T>
                </Glass>
              </div>
            ))}
          </div>
        ) : (
          <Col gap={18}>
            {PRS.map((pr, i) => (
              <PrRow key={pr.n} pr={pr} at={prs + i * 6} />
            ))}
          </Col>
        )}
      </Stage>
      <Chapter n={2} title="قسّم الشغل" accent={STEP} />
    </>
  );
};

// 8 — what each PR did; three sessions ran at once
export const S8: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const par = s(b, 1);
  const tags = ["نضف", "حول", "ضاف", "عمل"].map((x) => w(b, x));
  if (frame < par)
    return (
      <Stage gap={18}>
        {PRS.map((pr, i) => (
          <PrRow key={pr.n} pr={pr} at={0} w={1300} tag hi={frame >= tags[i] && (i === 3 || frame < tags[i + 1])} />
        ))}
      </Stage>
    );
  const items: [string, "code" | "search" | "brush"][] = [
    ["بتنضف الكود", "code"],
    ["بتراجع الـ SEO", "search"],
    ["بترسم اتجاهات للديزاين", "brush"],
  ];
  return (
    <Stage gap={44}>
      <Pop at={par}>
        <T size={70}>
          تلات sessions <Mark at={par + 8} color={STEP}>مع بعض</Mark>
        </T>
      </Pop>
      <Row gap={40}>
        {items.map(([label, icon], i) => (
          <Pop key={label} at={par + 6 + i * 6}>
            <Glass w={500} pad={30} accent={STEP}>
              <Col gap={20}>
                <Icon name={icon} size={100} color={D.text} />
                <div style={{ width: 400, height: 20, borderRadius: 10, background: "#ffffff18", overflow: "hidden", direction: "ltr" }}>
                  <div style={{ height: "100%", width: `${20 + ((frame * (1.1 + i * 0.3)) % 80)}%`, background: STEP }} />
                </div>
                <T size={40}>{label}</T>
              </Col>
            </Glass>
          </Pop>
        ))}
      </Row>
    </Stage>
  );
};

// 9 — step 3: let it run without you: cloud sessions on Anthropic's machines; ~2h of my time
export const S9: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const me = s(b, 2);
  const FULL = 1000;
  if (frame >= me) {
    const bar = (label: string, hrs: number, at: number, color: string, icon: "phone" | "robot") => (
      <Pop at={at} x={-60} from={0}>
        <Row gap={30} style={{ width: 1500, justifyContent: "flex-start" }}>
          <div style={{ width: 300, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <Icon name={icon} size={76} color={D.text} />
            <T size={50}>{label}</T>
          </div>
          <div style={{ height: 76, width: FULL * (hrs / 10.5) * ease(frame, [at + 4, at + 34], [0, 1]), background: color, borderRadius: 18, minWidth: 10 }} />
          <T size={58} ltr>~{hrs}h</T>
        </Row>
      </Pop>
    );
    return (
      <Stage gap={60}>
        {bar("أنا", 2, me, C.orange, "phone")}
        {bar("الـ agents", 10.5, w(b, "agents"), STEP, "robot")}
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
          {frame >= w(b, "تقفل") && (
            <Pop at={w(b, "تقفل")}>
              <Col gap={18}>
                <Phone w={170} off />
                <T size={42}>الموبايل مقفول… والشغل ماشي</T>
              </Col>
            </Pop>
          )}
        </Row>
      </Stage>
      <Chapter n={3} title="خليه يكمل من غيرك" accent={STEP} />
    </>
  );
};

// 10 — step 4: ask for options before execution: three directions as artifacts, picked one
export const S10: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const pick = w(b, "واخترت");
  const k = ease(frame, [pick, pick + 14], [0, 1]);
  const all = s(b, 2);
  const opts = [C.orange, C.teal, "#6B5BD2"];
  return (
    <>
      <Stage gap={40}>
        <Pop at={38}>
          <T size={64}>
            تلات اتجاهات كـ <Mark at={46} color={STEP}>artifacts</Mark>
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
              <Chip size={46} bg={STEP} color={C.ink}>وبعدها بس: التنفيذ على الموقع كله</Chip>
            </Pop>
          )}
        </div>
      </Stage>
      <Chapter n={4} title="اختيارات قبل التنفيذ" accent={STEP} />
    </>
  );
};

// 11 — the blog page now: covers, tidy filter, Arabic + English, light + dark (real recordings)
export const S11: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const sub = s(b, 1);
  return (
    <Stage gap={30}>
      {frame < sub ? (
        <Pop at={2}>
          <Frame src="v3-bloglist.mp4" w={1200} url="hfares.com/blog · V3" accent={STEP} />
        </Pop>
      ) : (
        <>
          <Row gap={30} ltr>
            <Pop at={sub}>
              <Frame src="v3-arblog.mp4" w={860} url="hfares.com/ar/blog" tilt={8} accent={STEP} from={sub} />
            </Pop>
            <Pop at={w(b, "فاتح")}>
              <Frame src="v3-bloglist-dark.mp4" w={860} url="hfares.com/blog · dark" tilt={-8} accent={STEP} from={w(b, "فاتح")} />
            </Pop>
          </Row>
          <Row gap={18}>
            {["صورة لكل مقال", "فلتر مرتب", "عربي وإنجليزي", "فاتح وغامق"].map((t, i) => (
              <Pop key={t} at={sub + i * 10}>
                <Chip size={40}>{t}</Chip>
              </Pop>
            ))}
          </Row>
        </>
      )}
    </Stage>
  );
};

// 12 — small details: the old Arabic filter listed one category five ways (real V2 screenshot)
export const S12: React.FC<SceneProps> = ({ b }) => {
  const frame = useCurrentFrame();
  const f = s(b, 1);
  const z = ease(frame, [f, f + 34], [0, 1], theme.ease.inOut);
  return (
    <Stage gap={30}>
      <Pop at={2}>
        <div style={{ position: "relative", width: 1440, height: 560, overflow: "hidden", borderRadius: 18, boxShadow: "0 40px 100px #000a", border: `2px solid ${STEP}aa` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1440, height: 900, transform: `scale(${1 + z * 1.1}) translate(${z * 40}px, ${-z * 190}px)`, transformOrigin: "50% 15%" }}>
            <Frame src="v2-arblog.jpg" w={1440} url="hfares.com/ar/blog · V2" zoom={[1, 1]} />
          </div>
        </div>
      </Pop>
      <div style={{ height: 80 }}>
        {frame >= f + 30 && (
          <Pop at={f + 30}>
            <Chip size={48} bg={C.orangeSoft}>نفس التصنيف… مكتوب بخمس طرق</Chip>
          </Pop>
        )}
      </div>
    </Stage>
  );
};

export { Count, Strike };
