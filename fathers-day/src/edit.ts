// Edit decisions. All times are seconds on camera A's clock (the master).
import reactions from "./reactions.json";
import segments from "./segments.json";
export const FPS = 30;
export const T_START = 1.5; // trim pre-roll
export const T_END = 387.3; // last frame both cameras share
export const B_OFFSET = 11.525; // camB time = camA time - B_OFFSET (audio cross-correlation)

// A = camera A wide, C = camera A tracked close-up, B = camera B wide from the back
export type Cam = "A" | "C" | "B";
export const SHOTS: [number, Cam][] = [
  [1.5, "A"], [8, "C"], [12.3, "B"], [21, "C"], [30.1, "B"], [36.6, "C"], [44.5, "A"],
  [53.8, "B"], [62.5, "C"], [69.4, "A"], [80.5, "B"], [89, "C"], [99.2, "A"], [111.5, "C"],
  [124.7, "B"], [139, "C"], [145.4, "A"], [156.3, "B"], [166.8, "C"], [176.5, "A"],
  [185.7, "B"], [197.4, "A"], [205, "C"], [218.7, "B"], [224.6, "C"], [239, "A"],
  [251.2, "C"], [261.2, "B"], [267.6, "C"], [300.4, "B"], [306.5, "C"], [313.9, "A"],
  [320, "C"], [326, "B"], [334.6, "C"], [341.8, "A"], [352.3, "B"], [360.8, "C"],
  [365.9, "B"], [376, "C"],
];

// Close-ups that slowly push in (emotional beats)
export const PUSH_SHOTS = [111.5, 251.2, 267.6, 376];

// Chapter cards, from the speech outline
export const CHAPTERS: { t: number; label?: string; title: string }[] = [
  { t: 30.1, title: "Background" },
  { t: 53.85, label: "Scene 1", title: "The last check-up surprise" },
  { t: 124.7, label: "Scene 2", title: "Delivery morning" },
  { t: 197.4, label: "Scene 3", title: "Ops time" },
  { t: 313.9, title: "Final Scene" },
  { t: 367.4, title: "Closure" },
];

export const FINAL_LINE_T = 380.9; // "That was the night I became a father."
export const CRY_T = 288.2; // "...he cried."
export const CARTOON = [290.4, 295.7]; // illustrated moment shown over "My wife cried. I cried."
export const END_CARD_SECONDS = 3.5;

// Audience reactions (laughs, applause) found by scripts/find-reactions.py. The edit cuts
// to the audience (camera B) for each one, except inside the birth moment.
export const REACTIONS = (reactions as { start: number; end: number }[]).filter((r) => !(r.start > 268 && r.start < CARTOON[1]));

// Kept source ranges after shortening long pauses (scripts/cut-pauses.py), played back to
// back. Segment 0 is the cold open (the birth moment), so its source range appears twice.
export const SEGMENTS = segments as [number, number][];
export const OUT_STARTS = SEGMENTS.reduce<number[]>((acc, [a, b], i) => [...acc, i ? acc[i - 1] + (SEGMENTS[i - 1][1] - SEGMENTS[i - 1][0]) : 0], []);
export const OUT_DURATION = OUT_STARTS[OUT_STARTS.length - 1] + SEGMENTS[SEGMENTS.length - 1][1] - SEGMENTS[SEGMENTS.length - 1][0];
export const HOOK_SECONDS = SEGMENTS[0][1] - SEGMENTS[0][0];

// source time (A clock) -> output seconds in the main body (after the cold open);
// times inside a removed pause snap to the next kept frame
export const toOut = (t: number) => {
  for (let i = 1; i < SEGMENTS.length; i++) {
    const [a, b] = SEGMENTS[i];
    if (t < a) return OUT_STARTS[i];
    if (t <= b) return OUT_STARTS[i] + (t - a);
  }
  return OUT_DURATION;
};

export const sec = (t: number) => Math.round(toOut(t) * FPS);
