// Viral-style captions: 1–2 words per page, slam-in, active word mustard, key words cherry.
// Arabic pages flow right-to-left and animate whole words only (never letters).
import React, { useMemo } from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { isAr, lang, words } from "./timing";

const KEY_EN = new Set(["squirrel", "burger", "nobody", "gone", "hospital", "legend", "quality", "scope", "early", "midnight", "bug", "tests", "never", "brand", "valuable", "disaster", "no"]);
const KEY_AR = ["سنجاب", "برجر", "خلصانة", "المستشفى", "أسطورة", "الجودة", "بدري", "بالليل", "البج", "التيستات", "أبدا", "عمرك", "الكوارث", "الأهم", "قضمة", "ميت"];
const TASHKEEL = /[ً-ْٰ]/g;
const clean = (s: string) => s.replace(TASHKEEL, "");
const isKey = (t: string) => {
  if (isAr()) {
    const c = clean(t).replace(/[^؀-ۿ]/g, "");
    return KEY_AR.some((k) => c.includes(k));
  }
  return KEY_EN.has(t.toLowerCase().replace(/[^a-z']/g, ""));
};

type W = ReturnType<typeof words>[number];
type Page = { words: W[]; start: number; end: number };
const buildPages = (ws: W[]): Page[] => {
  const pages: Page[] = [];
  let cur: W[] = [];
  ws.forEach((wd, i) => {
    cur.push(wd);
    const next = ws[i + 1];
    if (/[.?!:,…"،؛؟]$/.test(wd.text) || cur.length === 2 || !next || next.scene !== wd.scene) {
      pages.push({ words: cur, start: cur[0].start, end: next && next.start - wd.end < 0.6 ? next.start : wd.end + 0.25 });
      cur = [];
    }
  });
  return pages;
};

export const Captions: React.FC<{ hideFrom?: number }> = ({ hideFrom = Infinity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l = lang();
  const pages = useMemo(() => buildPages(words()), [l]);
  if (frame >= hideFrom) return null;
  const t = frame / fps;
  const idx = pages.findIndex((p) => t >= p.start && t < p.end);
  if (idx < 0) return null;
  const page = pages[idx];
  const pin = spring({ frame: frame - Math.round(page.start * fps), fps, config: { damping: 12, stiffness: 260, mass: 0.5 } });
  const tilt = (random(`cap${idx}`) - 0.5) * 6;
  const ar = isAr();
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 120,
        top: ar ? 1270 : 1290,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        direction: ar ? "rtl" : "ltr",
        columnGap: ar ? 34 : 52,
        transform: `scale(${interpolate(pin, [0, 1], [1.5, 1])}) rotate(${tilt}deg)`,
        opacity: Math.min(1, pin * 3),
      }}
    >
      {page.words.map((wd, i) => {
        const next = page.words[i + 1];
        const active = t >= wd.start && t < (next ? next.start : page.end);
        const key = isKey(wd.text);
        const text = ar ? clean(wd.text).replace(/\.\.\.$/, "…") : wd.text.replace(/["“”]/g, "").replace(/\.\.\.$/, "…").toUpperCase();
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: theme.fonts.display,
              fontSize: ar ? 120 : 112,
              lineHeight: ar ? 1.25 : 1.05,
              color: key ? theme.colors.cherry : active ? theme.colors.mustard : theme.colors.white,
              WebkitTextStroke: `16px ${theme.colors.ink}`,
              paintOrder: "stroke fill",
              textShadow: `0 8px 0 ${theme.colors.ink}`,
              transform: active ? "scale(1.08)" : "scale(1)",
            }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
};
