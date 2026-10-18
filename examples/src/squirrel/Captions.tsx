// Word-by-word captions: 1–3 words per page, active word in mustard with a pop.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";
import { WORDS } from "./timing";

type Page = { words: typeof WORDS; start: number; end: number };

const buildPages = (): Page[] => {
  const pages: Page[] = [];
  let cur: typeof WORDS = [];
  const words = WORDS.filter((w) => w.scene !== 10); // punchline is a title card
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const breakHere = /[.?:,…]$/.test(w.text) || cur.length === 3 || !next || next.scene !== w.scene;
    if (breakHere) {
      pages.push({ words: cur, start: cur[0].start, end: next && next.scene === w.scene ? next.start : w.end + 0.35 });
      cur = [];
    }
  });
  return pages;
};
const PAGES = buildPages();

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const page = PAGES.find((p) => t >= p.start && t < p.end);
  if (!page) return null;
  const pin = spring({ frame: frame - Math.round(page.start * fps), fps, config: theme.spring.snappy });
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 110,
        top: 1360,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 38,
        transform: `scale(${interpolate(pin, [0, 1], [0.8, 1])}) translateY(${interpolate(pin, [0, 1], [24, 0])}px)`,
        opacity: Math.min(1, pin * 2),
      }}
    >
      {page.words.map((w, i) => {
        const next = page.words[i + 1];
        const active = t >= w.start && t < (next ? next.start : page.end);
        const pop = spring({ frame: frame - Math.round(w.start * fps), fps, config: theme.spring.bouncy });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: 84,
              lineHeight: 1.1,
              color: active ? theme.colors.mustard : theme.colors.cream,
              WebkitTextStroke: `12px ${theme.colors.ink}`,
              paintOrder: "stroke fill",
              textShadow: `0 6px 0 ${theme.colors.ink}`,
              transform: active ? `scale(${interpolate(pop, [0, 1], [1.3, 1.08])})` : "scale(1)",
            }}
          >
            {w.text.replace(/\.\.\.$/, "…").toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};
