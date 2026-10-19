import { AbsoluteFill } from "remotion";

// The colour grade itself is baked into the camera clips (scripts/grade.py).
// This layer only adds a soft cool gradient behind the captions for legibility.
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(180deg, transparent 55%, rgba(8,14,22,0.35) 78%, rgba(8,14,22,0.5) 100%)" }} />
);
