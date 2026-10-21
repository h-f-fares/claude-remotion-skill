import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, theme } from "./theme";
import { sec, sentences, words } from "./timing";

// Pages of up to 3 words inside each sentence. Consecutive English words merge into one LTR token
// so "AI harness" doesn't read "harness AI" in the RTL row.
const latin = (w: string) => /^[A-Za-z0-9<]/.test(w);
type Tok = { w: string; si: number; at: number };
const toks = words.reduce<Tok[]>((acc, w) => {
  const prev = acc[acc.length - 1];
  if (prev && prev.si === w.si && latin(prev.w) && latin(w.w)) prev.w += ` ${w.w}`;
  else acc.push({ w: w.w, si: w.si, at: sec(w.start) });
  return acc;
}, []);
const pages: { toks: Tok[]; start: number; end: number }[] = [];
sentences.forEach((s, si) => {
  const ts = toks.filter((t) => t.si === si);
  for (let i = 0; i < ts.length; i += 3) {
    const chunk = ts.slice(i, i + 3);
    const next = ts[i + 3];
    pages.push({ toks: chunk, start: chunk[0].at, end: next ? next.at : sec(s.end) + 8 });
  }
});

export const Captions: React.FC<{ hide?: [number, number][] }> = ({ hide = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (hide.some(([a, b]) => frame >= a && frame < b)) return null;
  const page = pages.find((p) => frame >= p.start - 2 && frame < p.end);
  if (!page) return null;
  const out = interpolate(frame, [page.end - 5, page.end], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1270, height: 230, display: "flex", alignItems: "center", justifyContent: "center", opacity: out }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 30, rowGap: 6, fontFamily: theme.fonts.ar, fontWeight: 700, fontSize: 76, direction: "rtl", lineHeight: 1.2 }}>
        {page.toks.map((t, i) => {
          const p = spring({ frame: frame - t.at, fps, config: theme.spring.snappy });
          const next = page.toks[i + 1]?.at ?? page.end;
          const active = frame >= t.at && frame < next;
          return (
            <span key={i} style={{ display: "inline-block", direction: latin(t.w) ? "ltr" : "rtl", unicodeBidi: "isolate", opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px) scale(${interpolate(p, [0, 1], [1.12, 1]) * (active ? 1.06 : 1)})`, color: active ? theme.colors.hero : theme.colors.text, WebkitTextStroke: "2px rgba(0,0,0,0.55)", paintOrder: "stroke fill", textShadow: "0 6px 24px rgba(0,0,0,0.75)" }}>
              {t.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
