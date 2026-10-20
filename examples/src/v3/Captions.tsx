// Bottom subtitles: 2–5 word pages per sentence, right-to-left, active word in teal,
// key numbers/terms in orange. Pages pop in with a short spring.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";
import { WORDS } from "./timing";

const C = theme.colors;
type W = (typeof WORDS)[number];
type Page = { words: W[]; start: number; end: number };

const KEY = /^(\d|\$|ساعتين|خمستاشر|مية|ستاشر|عشرين|سبعة|اتنين|خمسين|تلات|موبايل|الموبايل|اللابتوب|diff|merge|token|PostHog|Lighthouse)/;

const buildPages = (): Page[] => {
  const pages: Page[] = [];
  let cur: W[] = [];
  WORDS.forEach((wd, i) => {
    cur.push(wd);
    const next = WORDS[i + 1];
    const brk = /[.?!:،؛؟…]$/.test(wd.text) || cur.length === 5 || !next || next.sent !== wd.sent || (cur.length >= 3 && /,$/.test(wd.text));
    if (brk) {
      pages.push({ words: cur, start: cur[0].start - 0.05, end: next && next.start - wd.end < 0.5 ? next.start - 0.05 : wd.end + 0.3 });
      cur = [];
    }
  });
  return pages;
};
const PAGES = buildPages();

export const Captions: React.FC<{ hide?: (t: number) => boolean }> = ({ hide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (hide?.(t)) return null;
  const page = PAGES.find((p) => t >= p.start && t < p.end);
  if (!page) return null;
  const pin = spring({ frame: frame - Math.round(page.start * fps), fps, config: theme.spring.snappy });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 52, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          gap: 18,
          direction: "rtl",
          padding: "12px 36px 16px",
          background: "#1E2A2Ee8",
          borderRadius: 22,
          transform: `translateY(${interpolate(pin, [0, 1], [18, 0])}px) scale(${interpolate(pin, [0, 1], [0.94, 1])})`,
          opacity: Math.min(1, pin * 2),
        }}
      >
        {page.words.map((wd, i) => {
          const next = page.words[i + 1];
          const active = t >= wd.start && t < (next ? next.start : page.end);
          const text = wd.text.replace(/[ً-ْٰ]/g, "").replace(/\.\.\.$/, "…").replace(/[.,،]+$/, "");
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.fonts.main,
                fontWeight: 700,
                fontSize: 50,
                lineHeight: 1.3,
                color: active ? C.tealBright : KEY.test(text) ? C.mustard : C.white,
                transform: active ? "translateY(-3px)" : undefined,
                display: "inline-block",
              }}
            >
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
