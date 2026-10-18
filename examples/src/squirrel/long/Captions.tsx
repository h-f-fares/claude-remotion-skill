// Viral-style captions: 1–2 words per page, slam-in, active word mustard, key words cherry.
import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { WORDS } from "./timing";

const KEY = new Set(["squirrel", "burger", "nobody", "gone", "hospital", "legend", "quality", "scope", "early", "midnight", "bug", "tests", "never", "brand", "valuable", "disaster", "no"]);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z']/g, "");

type Page = { words: typeof WORDS; start: number; end: number };
const PAGES: Page[] = (() => {
  const pages: Page[] = [];
  let cur: typeof WORDS = [];
  WORDS.forEach((wd, i) => {
    cur.push(wd);
    const next = WORDS[i + 1];
    if (/[.?!:,…"]$/.test(wd.text) || cur.length === 2 || !next || next.scene !== wd.scene) {
      pages.push({ words: cur, start: cur[0].start, end: next && next.start - wd.end < 0.6 ? next.start : wd.end + 0.25 });
      cur = [];
    }
  });
  return pages;
})();

export const Captions: React.FC<{ hideFrom?: number }> = ({ hideFrom = Infinity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame >= hideFrom) return null;
  const t = frame / fps;
  const idx = PAGES.findIndex((p) => t >= p.start && t < p.end);
  if (idx < 0) return null;
  const page = PAGES[idx];
  const pin = spring({ frame: frame - Math.round(page.start * fps), fps, config: { damping: 12, stiffness: 260, mass: 0.5 } });
  const tilt = (random(`cap${idx}`) - 0.5) * 6;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 120,
        top: 1290,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 52,
        transform: `scale(${interpolate(pin, [0, 1], [1.5, 1])}) rotate(${tilt}deg)`,
        opacity: Math.min(1, pin * 3),
      }}
    >
      {page.words.map((wd, i) => {
        const next = page.words[i + 1];
        const active = t >= wd.start && t < (next ? next.start : page.end);
        const key = KEY.has(norm(wd.text));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: theme.fonts.display,
              fontSize: 112,
              lineHeight: 1.05,
              color: key ? theme.colors.cherry : active ? theme.colors.mustard : theme.colors.white,
              WebkitTextStroke: `16px ${theme.colors.ink}`,
              paintOrder: "stroke fill",
              textShadow: `0 8px 0 ${theme.colors.ink}`,
              transform: active ? "scale(1.08)" : "scale(1)",
            }}
          >
            {wd.text.replace(/["“”]/g, "").replace(/\.\.\.$/, "…").toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};
