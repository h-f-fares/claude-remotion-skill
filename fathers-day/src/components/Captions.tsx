import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FINAL_LINE_T, toOut } from "../edit";
import { theme } from "../theme";
import { Word, WORDS as words } from "../words";

type W = Word;
type Page = { words: W[]; start: number; end: number };

const MAX_WORDS = 4;

const buildPages = (): Page[] => {
  const pages: Page[] = [];
  let cur: W[] = [];
  const flush = () => { if (cur.length) pages.push({ words: cur, start: cur[0].s, end: cur[cur.length - 1].e }); cur = []; };
  (words as W[]).forEach((w, i) => {
    if (cur.length && cur[0].l !== w.l) flush();
    cur.push(w);
    const next = (words as W[])[i + 1];
    const pause = next ? next.s - w.e > 0.45 : true;
    if (cur.length >= MAX_WORDS || /[.,?!:]$/.test(w.t) || pause) flush();
  });
  flush();
  // hold each page until the next one starts (short gaps only)
  return pages.map((p, i) => {
    const next = pages[i + 1];
    const end = next ? Math.min(next.start, p.end + 0.7) : p.end + 0.7;
    return { ...p, end: Math.max(end, p.start + 0.35) };
  });
};

const PAGES = buildPages().filter((p) => p.start < toOut(FINAL_LINE_T) - 0.05);

const CaptionPage: React.FC<{ page: Page; len: number }> = ({ page, len }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = page.start + frame / fps;
  const p = spring({ frame, fps, config: theme.spring.snappy });
  const exit = interpolate(frame, [len - 4, len], [1, 0], { easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", top: 1210 }}>
      <div
        style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 18, rowGap: 4,
          maxWidth: 940, paddingLeft: 34, paddingRight: 34,
          opacity: p * exit,
          transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`,
          fontFamily: theme.fonts.body, fontWeight: 800, fontSize: 68, lineHeight: 1.12,
          letterSpacing: "-0.01em", textAlign: "center",
          background: "rgba(20,13,7,0.42)", borderRadius: 26, paddingTop: 14, paddingBottom: 18,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        {page.words.map((w, i) => {
          const active = t >= w.s && (i === page.words.length - 1 ? t <= w.e + 0.25 : t < page.words[i + 1].s);
          const pop = spring({ frame: frame - Math.round((w.s - page.start) * fps), fps, config: theme.spring.snappy });
          const spoken = t >= w.s;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: active ? theme.colors.primary : theme.colors.text,
                opacity: spoken ? 1 : 0.88,
                transform: `scale(${active ? interpolate(pop, [0, 1], [1, 1.07]) : 1})`,
                textShadow: `0 4px 18px ${theme.colors.shadow}, 0 2px 4px rgba(0,0,0,0.6)`,
              }}
            >
              {w.t}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {PAGES.map((p, i) => {
        const from = Math.round(p.start * fps);
        const len = Math.max(1, Math.round(p.end * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={len} name={`cap ${i}`}>
            <CaptionPage page={p} len={len} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
