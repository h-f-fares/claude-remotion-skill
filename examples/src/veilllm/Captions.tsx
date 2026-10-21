import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, theme } from "./theme";
import { DIR, LANG } from "./lang";
import { sec, sentences } from "./timing";

import aligned from "./words.json";

// Word starts from a Gemini transcript, mapped onto each sentence's measured bounds.
// Arabic captions drop punctuation, and consecutive English words become one LTR token,
// so "AI harness" reads left to right inside the RTL line instead of "harness AI".
const latin = (w: string) => LANG === "ar" && /^[A-Za-z]/.test(w);
const words = aligned
  .map((w) => ({ w: LANG === "ar" ? w.w.replace(/[.,،؟?!:]/g, "") : w.w, si: w.si, at: sec(w.start) }))
  .reduce<{ w: string; si: number; at: number }[]>((acc, w) => {
    const prev = acc[acc.length - 1];
    if (prev && prev.si === w.si && latin(prev.w) && latin(w.w)) prev.w += ` ${w.w}`;
    else acc.push({ ...w });
    return acc;
  }, []);

const BOX = {
  short: { left: 80, right: 160, top: 1390, height: 230 },
  feed: { left: 70, right: 70, top: 1050, height: 190 },
};

export const Captions: React.FC<{ layout: "short" | "feed" }> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const si = sentences.findIndex((s, i) => frame >= (i === 0 ? 0 : sec(s.start) - 3) && frame < (i + 1 < sentences.length ? sec(sentences[i + 1].start) - 3 : sec(s.end + 1.2)));
  if (si < 0) return null;
  const s = sentences[si];
  const out = interpolate(frame, [sec(s.end) + 6, sec(s.end) + 12], [1, 0], clamp);
  const last = si === sentences.length - 1 || sentences[si + 1].start - s.end > 0.3;
  return (
    <div style={{ position: "absolute", ...BOX[layout], display: "flex", alignItems: "center", justifyContent: "center", opacity: last ? out : 1 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 16, rowGap: 4, fontFamily: theme.fonts.sans, fontWeight: 700, fontSize: layout === "short" ? 64 : 54, direction: DIR, lineHeight: 1.15, textAlign: "center" }}>
        {words.filter((w) => w.si === si).map((w, i, arr) => {
          const p = spring({ frame: frame - w.at, fps, config: theme.spring.snappy });
          const next = arr[i + 1]?.at ?? sec(s.end);
          const active = frame >= w.at && frame < next;
          return (
            <span key={i} style={{ display: "inline-block", direction: latin(w.w) ? "ltr" : DIR, unicodeBidi: "isolate", opacity: interpolate(p, [0, 1], [0.25, 1]), transform: `translateY(${interpolate(p, [0, 1], [14, 0])}px) scale(${active ? 1.06 : 1})`, color: active ? theme.colors.primary : theme.colors.text, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
