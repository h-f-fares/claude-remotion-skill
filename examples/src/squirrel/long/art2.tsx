// Extra original SVG art for the long cut.
import React from "react";
import { theme } from "../theme";

const C = theme.colors;
const line = { stroke: C.ink, strokeWidth: theme.stroke, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
type Placed = { x?: number; y?: number; size?: number };

export const Boss: React.FC<Placed & { shout?: number }> = ({ x = 0, y = 0, size = 420, shout = 0 }) => (
  <svg x={x} y={y} width={size} height={size * (460 / 280)} viewBox="0 0 280 460" overflow="visible">
    <rect x={40} y={250} width={200} height={220} rx={60} fill={C.navy} {...line} />
    <path d="M110 250 L 140 330 L 170 250 Z" fill={C.white} {...line} />
    <path d="M132 262 L 148 262 L 156 360 L 140 380 L 124 360 Z" fill={C.cherry} {...line} />
    <circle cx={140} cy={170} r={80} fill={C.skin} {...line} />
    <path d="M62 150 C 60 80, 220 70, 218 150 C 200 110, 90 110, 62 150 Z" fill={C.ink} />
    <path d="M92 150 L 128 164" {...line} strokeWidth={10} />
    <path d="M188 150 L 152 164" {...line} strokeWidth={10} />
    <circle cx={112} cy={178} r={8} fill={C.ink} />
    <circle cx={168} cy={178} r={8} fill={C.ink} />
    <ellipse cx={140} cy={198} rx={12} ry={10} fill={C.skinShade} {...line} />
    <ellipse cx={140} cy={226} rx={30} ry={6 + shout * 22} fill="#7A1F2B" {...line} />
  </svg>
);

export const Globe: React.FC<Placed & { spin?: number }> = ({ x = 0, y = 0, size = 600, spin = 0 }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 200 200" overflow="visible">
    <defs>
      <clipPath id="globe-clip">
        <circle cx={100} cy={100} r={90} />
      </clipPath>
    </defs>
    <circle cx={100} cy={100} r={90} fill="#8FD3FF" />
    <g clipPath="url(#globe-clip)">
      <g transform={`translate(${((spin % 200) + 200) % 200 - 200} 0)`}>
        {[0, 200].map((ox) => (
          <g key={ox} transform={`translate(${ox} 0)`}>
            <path d="M30 60 C 50 40, 90 50, 85 75 C 80 100, 50 95, 40 120 C 30 110, 20 80, 30 60 Z" fill={C.lettuce} stroke={C.ink} strokeWidth={4} />
            <path d="M110 40 C 150 30, 180 60, 170 90 C 150 100, 130 80, 115 70 Z" fill={C.lettuce} stroke={C.ink} strokeWidth={4} />
            <path d="M120 120 C 140 115, 160 130, 150 160 C 130 170, 115 150, 120 120 Z" fill={C.lettuce} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
    </g>
    <circle cx={100} cy={100} r={90} fill="none" {...line} strokeWidth={5} />
  </svg>
);

export const Laptop: React.FC<Placed & { glow?: string }> = ({ x = 0, y = 0, size = 220, glow = C.mint }) => (
  <svg x={x} y={y} width={size} height={size * 0.75} viewBox="0 0 200 150" overflow="visible">
    <rect x={30} y={10} width={140} height={95} rx={10} fill={C.ink} />
    <rect x={40} y={20} width={120} height={75} rx={6} fill={glow} />
    <rect x={52} y={34} width={60} height={8} rx={4} fill={C.cream} opacity={0.8} />
    <rect x={52} y={50} width={90} height={8} rx={4} fill={C.cream} opacity={0.6} />
    <rect x={52} y={66} width={40} height={8} rx={4} fill={C.cream} opacity={0.6} />
    <path d="M10 110 L 190 110 L 175 135 L 25 135 Z" fill="#D9D9D9" {...line} strokeWidth={5} />
  </svg>
);

export const TrashCan: React.FC<Placed> = ({ x = 0, y = 0, size = 300 }) => (
  <svg x={x} y={y} width={size} height={size * 1.2} viewBox="0 0 200 240" overflow="visible">
    <path d="M30 60 L 170 60 L 155 235 L 45 235 Z" fill="#7C8A99" {...line} />
    {[70, 100, 130].map((lx) => (
      <path key={lx} d={`M${lx} 80 L ${lx - 4} 215`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    ))}
    <rect x={18} y={40} width={164} height={26} rx={10} fill="#95A3B3" {...line} />
    <rect x={80} y={24} width={40} height={20} rx={8} fill="#95A3B3" {...line} />
  </svg>
);

export const Bug: React.FC<Placed & { t?: number }> = ({ x = 0, y = 0, size = 180, t = 0 }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 100 100" overflow="visible">
    {[-1, 1].map((sd) =>
      [0, 1, 2].map((i) => (
        <path key={`${sd}${i}`} d={`M50 ${45 + i * 12} L ${50 + sd * (34 + Math.sin(t / 2 + i) * 4)} ${38 + i * 16}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      )),
    )}
    <ellipse cx={50} cy={58} rx={22} ry={28} fill="#5BAA3C" {...line} strokeWidth={5} />
    <circle cx={50} cy={28} r={14} fill="#5BAA3C" {...line} strokeWidth={5} />
    <circle cx={44} cy={26} r={3.5} fill={C.ink} />
    <circle cx={56} cy={26} r={3.5} fill={C.ink} />
    <path d="M44 16 L 38 4 M56 16 L 62 4" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
    <path d="M50 34 L 50 84" stroke={C.ink} strokeWidth={4} />
  </svg>
);

export const Calendar: React.FC<Placed & { label: string; circled?: number; locked?: boolean }> = ({ x = 0, y = 0, size = 360, label, circled = 0, locked }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 200 200" overflow="visible">
    <rect x={20} y={30} width={160} height={150} rx={16} fill={C.cream} {...line} />
    <path d="M20 46 Q 20 30 36 30 L 164 30 Q 180 30 180 46 L 180 70 L 20 70 Z" fill={C.cherry} {...line} />
    <text x={100} y={62} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={26} fill={C.cream}>
      {label}
    </text>
    {[60, 140].map((rx) => (
      <rect key={rx} x={rx - 6} y={16} width={12} height={28} rx={6} fill={C.ink} />
    ))}
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={38 + (i % 4) * 34} y={84 + Math.floor(i / 4) * 30} width={22} height={18} rx={4} fill={C.creamDeep} />
    ))}
    <circle cx={117} cy={123} r={22} fill="none" stroke={C.cherry} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circled} />
    {locked && (
      <g transform="translate(150 150)">
        <path d="M-14 -4 L -14 -16 A 14 14 0 0 1 14 -16 L 14 -4" fill="none" stroke={C.ink} strokeWidth={7} />
        <rect x={-22} y={-6} width={44} height={36} rx={8} fill={C.mustard} {...line} />
      </g>
    )}
  </svg>
);

export const Scissors: React.FC<Placed & { open?: number }> = ({ x = 0, y = 0, size = 260, open = 0 }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 200 200" overflow="visible">
    <g transform={`rotate(${-open * 18} 100 100)`}>
      <path d="M100 100 L 195 70 L 190 86 Z" fill="#D9D9D9" {...line} strokeWidth={5} />
      <circle cx={40} cy={130} r={26} fill="none" stroke={C.cherry} strokeWidth={14} />
    </g>
    <g transform={`rotate(${open * 18} 100 100)`}>
      <path d="M100 100 L 195 130 L 190 114 Z" fill="#D9D9D9" {...line} strokeWidth={5} />
      <circle cx={40} cy={70} r={26} fill="none" stroke={C.cherry} strokeWidth={14} />
    </g>
    <circle cx={100} cy={100} r={8} fill={C.ink} />
  </svg>
);

export const Grinder: React.FC<Placed & { crank?: number }> = ({ x = 0, y = 0, size = 420, crank = 0 }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 200 200" overflow="visible">
    <path d="M60 20 L 140 20 L 120 70 L 80 70 Z" fill="#B8C2CC" {...line} strokeWidth={5} />
    <rect x={50} y={70} width={100} height={60} rx={16} fill="#D9D9D9" {...line} strokeWidth={5} />
    <rect x={150} y={84} width={34} height={32} rx={6} fill="#B8C2CC" {...line} strokeWidth={5} />
    <circle cx={184} cy={100} r={10} fill="#B8C2CC" stroke={C.ink} strokeWidth={4} />
    <g transform={`rotate(${crank} 100 100)`}>
      <path d="M100 100 L 100 40" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <circle cx={100} cy={40} r={9} fill={C.cherry} stroke={C.ink} strokeWidth={4} />
    </g>
    <rect x={70} y={130} width={60} height={50} rx={6} fill="#9AA5B1" {...line} strokeWidth={5} />
    <rect x={40} y={180} width={120} height={14} rx={6} fill="#7C8A99" {...line} strokeWidth={5} />
  </svg>
);

export const Door: React.FC<Placed & { open?: number; label?: string }> = ({ x = 0, y = 0, size = 360, open = 0, label }) => (
  <svg x={x} y={y} width={size} height={size * 2} viewBox="0 0 180 360" overflow="visible">
    <rect x={0} y={0} width={180} height={360} rx={8} fill="#2A2F45" {...line} />
    <g transform={`translate(${open * 120} 0) scale(${1 - open * 0.65} 1)`}>
      <rect x={10} y={10} width={160} height={340} rx={6} fill={C.brown} {...line} />
      <rect x={30} y={40} width={120} height={120} rx={6} fill="#8FD3FF" {...line} strokeWidth={5} />
      <circle cx={146} cy={200} r={10} fill={C.mustard} stroke={C.ink} strokeWidth={4} />
      {label && (
        <g transform="translate(90 230) rotate(-4)">
          <rect x={-60} y={-22} width={120} height={44} rx={8} fill={C.cream} stroke={C.ink} strokeWidth={4} />
          <text x={0} y={10} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={28} fill={C.cherry}>
            {label}
          </text>
        </g>
      )}
    </g>
  </svg>
);
