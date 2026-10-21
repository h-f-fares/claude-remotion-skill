// Copy into the video's src/ and render <TextCheck /> once, as the LAST child of the composition.
// It does nothing in a normal render. When tools/review.mjs renders stills with
// inputProps { textcheck: true }, it measures every visible piece of text and logs one
// "TEXTCHECK {...}" line per frame: text cut off by the frame, outside the phone-safe area,
// too small to read on a phone, or overlapping other text.
import { useEffect } from "react";
import { getInputProps, useCurrentFrame, useVideoConfig } from "remotion";

type Box = { x0: number; y0: number; x1: number; y1: number };
const area = (b: Box) => Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0);
const inter = (a: Box, b: Box): Box => ({ x0: Math.max(a.x0, b.x0), y0: Math.max(a.y0, b.y0), x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1) });

// opacity is multiplied down the tree; a parent at 0.2 makes its text unreadable too
const opacity = (el: Element | null) => {
  let o = 1;
  for (let e = el; e && e instanceof HTMLElement; e = e.parentElement) {
    const s = getComputedStyle(e);
    if (s.display === "none" || s.visibility === "hidden") return 0;
    o *= parseFloat(s.opacity || "1");
  }
  return o;
};

export const TextCheck: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const on = Boolean((getInputProps() as { textcheck?: boolean }).textcheck);
  useEffect(() => {
    if (!on) return;
    // 9:16 platform UI: title/handle bar at the top, caption + buttons at the bottom, button column on the right
    const portrait = H > W;
    const safe = portrait ? { x0: 60, y0: 250, x1: W - 60, y1: 1500 } : { x0: 40, y0: 40, x1: W - 40, y1: H - 40 };
    const items: { text: string; box: Box; px: number; el: Element }[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = (n.textContent || "").trim();
      const el = n.parentElement;
      if (!text || !el || el.closest("style,script") || opacity(el) < 0.6) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      // rendered font size = CSS size x the scale transforms applied above it
      const er = el.getBoundingClientRect();
      const scale = el instanceof HTMLElement && el.offsetHeight ? er.height / el.offsetHeight : 1;
      const px = parseFloat(getComputedStyle(el).fontSize) * (scale || 1);
      items.push({ text: text.slice(0, 40), box: { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }, px: Math.round(px), el });
    }
    const issues: { kind: string; text: string; detail: string }[] = [];
    for (const it of items) {
      const b = it.box;
      if (b.x0 < -1 || b.y0 < -1 || b.x1 > W + 1 || b.y1 > H + 1) issues.push({ kind: "CUT", text: it.text, detail: `box ${Math.round(b.x0)},${Math.round(b.y0)}-${Math.round(b.x1)},${Math.round(b.y1)}` });
      else if (b.x0 < safe.x0 || b.y0 < safe.y0 || b.x1 > safe.x1 || b.y1 > safe.y1) issues.push({ kind: "UNSAFE", text: it.text, detail: `box ${Math.round(b.x0)},${Math.round(b.y0)}-${Math.round(b.x1)},${Math.round(b.y1)}, safe ${safe.x0},${safe.y0}-${safe.x1},${safe.y1}` });
      if (it.px < 40) issues.push({ kind: "SMALL", text: it.text, detail: `${it.px}px (40px minimum at 1080 wide)` });
    }
    for (let i = 0; i < items.length; i++)
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const ov = area(inter(a.box, b.box));
        if (ov > 0.15 * Math.min(area(a.box), area(b.box))) issues.push({ kind: "OVERLAP", text: `${a.text} / ${b.text}`, detail: `${Math.round(ov)}px²` });
      }
    console.log("TEXTCHECK " + JSON.stringify({ frame, texts: items.length, issues }));
  }, [on, frame, W, H]);
  return null;
};
