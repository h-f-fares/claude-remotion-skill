// Edit decisions. All times are seconds on camera A's clock (the master).
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

export const sec = (t: number) => Math.round((t - T_START) * FPS);
