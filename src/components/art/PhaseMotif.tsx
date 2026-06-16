import type { Motif } from "../../data/phaseArt";

/**
 * PhaseMotif — an original, coded SVG silhouette band anchored to the seafloor.
 * One motif per program phase. Decorative only (aria-hidden via parent).
 *
 * All shapes are hand-built primitives — no traced or copied artwork.
 * They sit low and translucent so foreground content always wins.
 */
export default function PhaseMotif({ motif }: { motif: Motif }) {
  return (
    <svg viewBox="0 0 1200 260" className="h-[42vh] max-h-[340px] w-full" preserveAspectRatio="xMidYMax slice">
      {/* Reef floor — common to every motif */}
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d3247" stopOpacity="0" />
          <stop offset="100%" stopColor="#04141f" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="kelpG" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#e0a64f" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e0a64f" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d="M0 220 Q 300 180 600 210 T 1200 200 V260 H0 Z" fill="url(#floor)" />

      {motif === "apex" && <ApexMotif />}
      {motif === "scaffold" && <ScaffoldMotif />}
      {motif === "current" && <CurrentMotif />}
      {motif === "school" && <SchoolMotif />}
      {motif === "migration" && <MigrationMotif />}
      {motif === "lobster" && <LobsterMotif />}
    </svg>
  );
}

/* ---- 01 Apex Positioning: a lone predator gliding, with a faint targeting arc ---- */
function ApexMotif() {
  return (
    <g className="animate-float-slow" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <circle cx="600" cy="120" r="78" fill="none" stroke="#22d3ee" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="4 8" />
      <g fill="#22d3ee" fillOpacity="0.55">
        <path d="M470 130c40-10 70-16 104-50 26-26 58-44 120-52-16 22-26 38-26 54 16 8 32 24 42 46-32-8-50-8-68 0-26 12-52 20-94 20-38 0-62-8-78-18z" />
        <path d="M566 116c-12 16-32 28-58 32 12 12 36 20 76 20 16 0 32-4 46-8-22-12-44-28-64-44z" fillOpacity="0.35" />
        <circle cx="660" cy="98" r="3.4" fill="#04141f" />
      </g>
    </g>
  );
}

/* ---- 02 Coral Scaffolding: branching coral that reads like built structure ---- */
function ScaffoldMotif() {
  return (
    <g stroke="#e0a64f" strokeOpacity="0.5" strokeLinecap="round" fill="none">
      {[180, 420, 760, 1010].map((x, i) => (
        <g key={i} className="animate-float-slow" style={{ animationDelay: `${i * 1.5}s` }}>
          <path d={`M${x} 230 V150`} strokeWidth="6" />
          <path d={`M${x} 180 q -28 -16 -44 -44`} strokeWidth="4" />
          <path d={`M${x} 168 q 30 -18 50 -40`} strokeWidth="4" />
          <path d={`M${x} 150 q -16 -22 -10 -46`} strokeWidth="3" />
          <circle cx={x} cy="150" r="4" fill="#e0a64f" fillOpacity="0.7" stroke="none" />
        </g>
      ))}
      <rect x="0" y="226" width="1200" height="6" fill="url(#kelpG)" stroke="none" />
    </g>
  );
}

/* ---- 03 Navigating the Currents: stacked flowing current lines ---- */
function CurrentMotif() {
  const lines = [120, 150, 180, 210];
  return (
    <g stroke="#2a7fa3" fill="none" strokeLinecap="round">
      {lines.map((y, i) => (
        <path
          key={i}
          d={`M-40 ${y} Q 200 ${y - 28} 440 ${y} T 920 ${y} T 1240 ${y}`}
          strokeWidth={3 - i * 0.4}
          strokeOpacity={0.5 - i * 0.07}
          className="animate-sway"
          style={{ animationDelay: `${i * 1.2}s`, transformOrigin: "center" }}
        />
      ))}
      <path d="M820 150 l26 10 -26 10 6-10z" fill="#8fd4e0" fillOpacity="0.6" stroke="none" />
      <path d="M360 180 l26 10 -26 10 6-10z" fill="#8fd4e0" fillOpacity="0.5" stroke="none" />
    </g>
  );
}

/* ---- 04 Schooling Strategy: a coordinated school turning as one ---- */
function SchoolMotif() {
  const fish = [
    [300, 110], [340, 130], [380, 105], [420, 128], [460, 112],
    [330, 160], [375, 150], [415, 165], [455, 150],
    [620, 120], [660, 140], [700, 116], [740, 138],
    [650, 168], [695, 158], [735, 172],
  ];
  return (
    <g fill="#9a7fb5" fillOpacity="0.5">
      {fish.map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y} l16 -5 -4 5 4 5z`}
          className="animate-float-slow"
          style={{ animationDelay: `${(i % 5) * 0.6}s` }}
        />
      ))}
    </g>
  );
}

/* ---- 05 The Migration: silhouettes crossing toward an open-ocean horizon ---- */
function MigrationMotif() {
  return (
    <g>
      <line x1="0" y1="96" x2="1200" y2="96" stroke="#d2603a" strokeOpacity="0.25" strokeWidth="1" />
      {[
        [180, 150, 1], [360, 132, 0.85], [560, 158, 1.1], [780, 138, 0.8], [980, 150, 1],
      ].map(([x, y, s], i) => (
        <g
          key={i}
          transform={`translate(${x} ${y}) scale(${s})`}
          className="animate-float-slow"
          style={{ animationDelay: `${i * 0.9}s` }}
        >
          <path d="M0 0c14-4 24-6 36-18 9-9 20-15 42-18-6 8-9 13-9 19 6 3 11 8 15 16-11-3-18-3-24 0-9 4-18 7-33 7-13 0-21-3-27-6z" fill="#d2603a" fillOpacity="0.5" />
        </g>
      ))}
    </g>
  );
}

/* ---- 00 Entering the Reef: a lobster on the floor, with a shed shell behind it ---- */
function LobsterMotif() {
  return (
    <g className="animate-float-slow" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <g stroke="#e0a64f" strokeOpacity="0.5" strokeLinecap="round" fill="none" strokeWidth="3">
        {/* The shed shell, faint, left behind */}
        <g strokeOpacity="0.22">
          <ellipse cx="430" cy="196" rx="46" ry="22" />
          <path d="M392 188 q -16 -10 -26 -2" />
          <path d="M398 200 q -18 4 -28 14" />
        </g>
        {/* The lobster itself, mid-stride forward */}
        <g transform="translate(640 168)">
          {/* segmented body + tail fan */}
          <path d="M0 0 q 60 -8 118 0" strokeWidth="6" />
          <path d="M118 0 q 24 0 34 14 l -14 4 m 14 -4 l -6 16" strokeWidth="5" />
          {[18, 42, 66, 90].map((x, i) => (
            <path key={i} d={`M${x} -6 v 12`} strokeWidth="2.5" strokeOpacity="0.4" />
          ))}
          {/* antennae reaching ahead */}
          <path d="M0 -2 q -40 -22 -78 -18" strokeWidth="2" />
          <path d="M0 4 q -42 -6 -80 6" strokeWidth="2" />
          {/* claws */}
          <path d="M-6 -2 q -24 -16 -40 -8 q -10 6 0 14 q 12 8 24 2" strokeWidth="3" />
          {/* walking legs */}
          {[28, 50, 72, 94].map((x, i) => (
            <path key={i} d={`M${x} 6 q 4 18 ${i % 2 ? 14 : -14} 24`} strokeWidth="2.5" strokeOpacity="0.6" />
          ))}
          <circle cx="6" cy="-2" r="3" fill="#e0a64f" fillOpacity="0.7" stroke="none" />
        </g>
      </g>
    </g>
  );
}
