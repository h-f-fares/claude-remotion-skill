// Flat 2D cartoon art, all original SVG. Every shape gets the thick ink outline.
import React from "react";
import { interpolateColors } from "remotion";
import { theme } from "./theme";

const C = theme.colors;
const line = { stroke: C.ink, strokeWidth: theme.stroke, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

type Placed = { x?: number; y?: number; size?: number };

// ---------------------------------------------------------------- squirrel
export const Squirrel: React.FC<
  Placed & { wink?: number; tail?: number; flip?: boolean; blink?: boolean; dead?: boolean }
> = ({ x = 0, y = 0, size = 200, wink = 0, tail = 0, flip = false, blink = false, dead = false }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 220 220" overflow="visible">
    <g transform={flip ? "translate(220 0) scale(-1 1)" : undefined}>
      <g transform={`rotate(${tail} 120 160)`}>
        <path
          d="M118 168 C 205 160, 222 70, 175 32 C 140 6, 108 40, 132 62 C 156 84, 150 128, 108 140 Z"
          fill={C.brown}
          {...line}
        />
        <path d="M150 52 C 170 66, 172 110, 142 132" fill="none" stroke={C.brownDark} strokeWidth={5} strokeLinecap="round" />
      </g>
      <ellipse cx={92} cy={156} rx={44} ry={50} fill={C.brown} {...line} />
      <ellipse cx={84} cy={166} rx={25} ry={33} fill={C.cream} />
      <path d="M62 54 L 74 26 L 88 58 Z" fill={C.brown} {...line} />
      <circle cx={74} cy={98} r={38} fill={C.brown} {...line} />
      <ellipse cx={58} cy={112} rx={10} ry={7} fill={C.neon} opacity={0.55} />
      {dead ? (
        <path d="M56 84 L 72 100 M72 84 L 56 100" fill="none" {...line} strokeWidth={5} />
      ) : wink > 0.5 || blink ? (
        <path d="M54 92 Q 64 100 74 92" fill="none" {...line} />
      ) : (
        <>
          <circle cx={64} cy={92} r={9} fill={C.ink} />
          <circle cx={67} cy={89} r={3} fill={C.white} />
        </>
      )}
      <circle cx={38} cy={104} r={6} fill={C.ink} />
      <rect x={40} y={112} width={10} height={11} rx={2} fill={C.white} stroke={C.ink} strokeWidth={3} />
      <ellipse cx={64} cy={150} rx={11} ry={8} fill={C.brown} {...line} />
      <ellipse cx={74} cy={200} rx={16} ry={9} fill={C.brown} {...line} />
      <ellipse cx={112} cy={202} rx={16} ry={9} fill={C.brown} {...line} />
    </g>
  </svg>
);

// ---------------------------------------------------------------- burger
export const Burger: React.FC<
  Placed & { lift?: number; tilt?: number; patty?: boolean; middle?: React.ReactNode; clipId?: string }
> = ({ x = 0, y = 0, size = 320, lift = 0, tilt = 0, patty = true, middle, clipId }) => (
  <svg x={x} y={y} width={size} height={size * (300 / 320)} viewBox="0 -40 320 300" overflow="visible">
    {clipId && (
      <defs>
        <clipPath id={clipId}>
          <rect x={-200} y={-600} width={720} height={800} />
        </clipPath>
      </defs>
    )}
    <rect x={30} y={196} width={260} height={50} rx={24} fill={C.bun} {...line} />
    {/* with clipId, the filling stays hidden below the bottom bun until it rises */}
    <g clipPath={clipId ? `url(#${clipId})` : undefined}>{middle}</g>
    {patty && (
      <>
        <rect x={24} y={158} width={272} height={42} rx={20} fill={C.patty} {...line} />
        <path d="M30 150 L 290 150 L 270 176 L 250 156 L 200 182 L 170 156 L 120 178 L 90 156 L 50 172 Z" fill={C.cheese} {...line} />
      </>
    )}
    <path
      d="M22 146 Q 48 128 74 146 Q 100 128 126 146 Q 152 128 178 146 Q 204 128 230 146 Q 256 128 282 146 Q 300 136 298 150 L 22 150 Z"
      fill={C.lettuce}
      {...line}
    />
    <g transform={`translate(0 ${-lift}) rotate(${tilt} 160 130)`}>
      <path d="M26 132 C 26 40, 294 40, 294 132 Z" fill={C.bun} {...line} />
      <path d="M60 110 C 70 70, 120 56, 150 56" fill="none" stroke={C.cream} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
      {[
        [110, 84, -20],
        [160, 70, 10],
        [205, 88, 25],
        [140, 104, -5],
        [235, 112, 30],
        [85, 112, -30],
      ].map(([sx, sy, r], i) => (
        <ellipse key={i} cx={sx} cy={sy} rx={8} ry={4.5} transform={`rotate(${r} ${sx} ${sy})`} fill={C.cream} stroke={C.ink} strokeWidth={2.5} />
      ))}
    </g>
  </svg>
);

// ---------------------------------------------------------------- Ray the cook
export const Ray: React.FC<
  Placed & { look?: number; worry?: number; sweat?: number; t?: number; grin?: number }
> = ({ x = 0, y = 0, size = 420, look = 0, worry = 0, sweat = 0, t = 0, grin = 0 }) => (
  <svg x={x} y={y} width={size} height={size * (440 / 280)} viewBox="0 0 280 440" overflow="visible">
    <rect x={44} y={250} width={192} height={200} rx={70} fill={C.white} {...line} />
    <path d="M90 300 L 190 300 L 196 440 L 84 440 Z" fill={C.cherry} {...line} />
    <rect x={22} y={280} width={44} height={120} rx={22} fill={C.white} {...line} />
    <rect x={214} y={280} width={44} height={120} rx={22} fill={C.white} {...line} />
    <circle cx={140} cy={180} r={76} fill={C.skin} {...line} />
    <circle cx={98} cy={62} r={34} fill={C.white} {...line} />
    <circle cx={182} cy={62} r={34} fill={C.white} {...line} />
    <circle cx={140} cy={44} r={42} fill={C.white} {...line} />
    <rect x={82} y={78} width={116} height={42} rx={8} fill={C.white} {...line} />
    {[112, 168].map((ex) => (
      <g key={ex}>
        <ellipse cx={ex} cy={172} rx={18} ry={21} fill={C.white} {...line} />
        <circle cx={ex + look * 8} cy={174} r={8} fill={C.ink} />
      </g>
    ))}
    <path d={`M92 ${142 + worry * 4} L 128 ${140 - worry * 10}`} {...line} strokeWidth={8} />
    <path d={`M152 ${140 - worry * 10} L 188 ${142 + worry * 4}`} {...line} strokeWidth={8} />
    <ellipse cx={140} cy={198} rx={14} ry={12} fill={C.skinShade} {...line} />
    <path d="M100 218 Q 118 202 140 214 Q 162 202 180 218 Q 162 232 140 222 Q 118 232 100 218 Z" fill={C.brownDark} {...line} />
    {grin > 0.5 ? (
      <path d="M116 236 Q 140 262 164 236 Z" fill={C.ink} {...line} />
    ) : (
      <path d="M118 240 Q 126 234 134 240 Q 142 246 150 240 Q 158 234 164 240" fill="none" {...line} />
    )}
    {sweat > 0 && (
      <g opacity={sweat}>
        {[
          [222, 140, 0],
          [236, 190, 14],
          [60, 150, 7],
        ].map(([sx, sy, off], i) => (
          <path
            key={i}
            transform={`translate(${sx} ${sy + ((t + off * 3) % 30)})`}
            d="M0 -16 C 8 -4, 12 4, 0 10 C -12 4, -8 -4, 0 -16 Z"
            fill="#9AD7FF"
            stroke={C.ink}
            strokeWidth={4}
          />
        ))}
      </g>
    )}
  </svg>
);

// ---------------------------------------------------------------- old man
export const OldMan: React.FC<Placed & { open?: number; sick?: number }> = ({
  x = 0,
  y = 0,
  size = 360,
  open = 0,
  sick = 0,
}) => {
  const skin = interpolateColors(sick, [0, 1], [C.skin, C.sick]);
  return (
    <svg x={x} y={y} width={size} height={size * (400 / 260)} viewBox="0 0 260 400" overflow="visible">
      <rect x={40} y={240} width={180} height={180} rx={60} fill={C.mintDeep} {...line} />
      <path d="M100 240 L 130 300 L 160 240 Z" fill={C.white} {...line} />
      <path d="M106 254 L 130 266 L 106 278 Z M154 254 L 130 266 L 154 278 Z" fill={C.cherry} {...line} />
      <ellipse cx={58} cy={150} rx={24} ry={30} fill={C.white} {...line} />
      <ellipse cx={202} cy={150} rx={24} ry={30} fill={C.white} {...line} />
      <circle cx={130} cy={150} r={72} fill={skin} {...line} />
      <path d="M88 116 Q 104 104 118 116 M142 116 Q 156 104 172 116" fill="none" stroke={C.white} strokeWidth={10} strokeLinecap="round" />
      {[104, 156].map((ex) => (
        <g key={ex}>
          <circle cx={ex} cy={140} r={20} fill={C.white} fillOpacity={0.5} {...line} />
          <circle cx={ex} cy={142} r={6} fill={C.ink} />
        </g>
      ))}
      <path d="M124 140 L 136 140" {...line} />
      <ellipse cx={130} cy={172} rx={14} ry={17} fill={interpolateColors(sick, [0, 1], [C.skinShade, "#8DB36A"])} {...line} />
      <ellipse cx={130} cy={204} rx={18} ry={4 + open * 18} fill="#7A1F2B" {...line} />
    </svg>
  );
};

// ---------------------------------------------------------------- small people for the queue
export const Person: React.FC<Placed & { color: string; hat?: boolean }> = ({ x = 0, y = 0, size = 120, color, hat }) => (
  <svg x={x} y={y} width={size} height={size * 2} viewBox="0 0 100 200" overflow="visible">
    <rect x={14} y={78} width={72} height={130} rx={34} fill={color} {...line} />
    <circle cx={50} cy={48} r={32} fill={C.skin} {...line} />
    {hat && <path d="M18 34 Q 50 0 82 34 Z" fill={C.ink} />}
    <circle cx={40} cy={46} r={4} fill={C.ink} />
    <circle cx={60} cy={46} r={4} fill={C.ink} />
  </svg>
);

// ---------------------------------------------------------------- icons for the lesson
export const IconCustomer: React.FC = () => (
  <svg width={150} height={150} viewBox="0 0 100 100">
    <circle cx={50} cy={34} r={18} fill={C.skin} {...line} strokeWidth={5} />
    <path d="M18 92 C 18 60, 82 60, 82 92 Z" fill={C.mint} {...line} strokeWidth={5} />
  </svg>
);
export const IconTeam: React.FC = () => (
  <svg width={150} height={150} viewBox="0 0 100 100">
    {[
      [24, C.mustard],
      [76, C.mustard],
      [50, C.mint],
    ].map(([cx, col], i) => (
      <g key={i}>
        <circle cx={cx as number} cy={i === 2 ? 34 : 42} r={13} fill={C.skin} stroke={C.ink} strokeWidth={5} />
        <path
          d={`M${(cx as number) - 22} ${i === 2 ? 90 : 94} C ${(cx as number) - 22} 60, ${(cx as number) + 22} 60, ${(cx as number) + 22} ${i === 2 ? 90 : 94} Z`}
          fill={col as string}
          stroke={C.ink}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      </g>
    ))}
  </svg>
);
export const IconStore: React.FC = () => (
  <svg width={150} height={150} viewBox="0 0 100 100">
    <rect x={16} y={44} width={68} height={46} fill={C.cream} {...line} strokeWidth={5} />
    <path d="M10 44 L 18 18 L 82 18 L 90 44 Z" fill={C.cherry} {...line} strokeWidth={5} />
    <path d="M30 18 L 26 44 M50 18 L 50 44 M70 18 L 74 44" stroke={C.ink} strokeWidth={4} />
    <rect x={40} y={60} width={20} height={30} fill={C.mint} {...line} strokeWidth={5} />
  </svg>
);
