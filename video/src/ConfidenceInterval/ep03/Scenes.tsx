import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";

// EP03 (Princes in the Tower) visuals.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
const fade = (f: number, d = 0) => {
  const a = interpolate(f, [d, d + 14], [0, 1], { ...clamp, easing: outExpo });
  return { opacity: a, translate: `0 ${(1 - a) * 24}px` };
};

const Box: React.FC<{ title: string; sub: string; hi?: boolean; style?: React.CSSProperties }> = ({ title, sub, hi, style }) => (
  <div style={{ width: 380, padding: "22px 26px", background: C.bg2, border: `2px solid ${hi ? C.amber : C.line}`, borderRadius: 14, textAlign: "center", ...style }}>
    <div style={{ color: hi ? C.amber : C.ink, fontSize: 38, fontWeight: 900 }}>{title}</div>
    <div style={{ color: C.sub, fontSize: 26, marginTop: 8 }}>{sub}</div>
  </div>
);

/* Who's who: Edward IV → two sons; uncle Richard */
export const FamilyTree: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 150, fontFamily: FONT }}>
      <div style={{ display: "flex", gap: 160, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          <div style={fade(f, 0)}>
            <Box title="Edward IV" sub="king, died April 1483" />
          </div>
          <div style={{ display: "flex", gap: 30 }}>
            <div style={fade(f, 20)}>
              <Box title="Edward V" sub="age 12, the new king" hi />
            </div>
            <div style={fade(f, 30)}>
              <Box title="Richard" sub="Duke of York, age 9" hi />
            </div>
          </div>
        </div>
        <div style={{ ...fade(f, 50), marginTop: 0 }}>
          <Box title="Richard of Gloucester" sub="their uncle · Lord Protector" style={{ width: 460 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* A barred window; two figures behind it fade out over time (Mancini: seen less and less) */
export const BarredWindow: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [30, dur - 30], [1, 0], clamp);
  const flick = 0.85 + 0.15 * Math.sin(f / 7);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 150, fontFamily: FONT }}>
      <div style={{ position: "relative", width: 520, height: 640, borderRadius: "260px 260px 0 0", background: "#2B2A26", border: `14px solid #3A3833`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 70%, #5A4A32 0%, #1C1A16 75%)", opacity: 0.9 * flick }} />
        {[0, 1].map((k) => (
          <svg key={k} width={160} height={320} viewBox="0 0 160 320" style={{ position: "absolute", left: 110 + k * 150, bottom: 0, opacity: o * (k === 0 ? 1 : 0.85) }}>
            <circle cx={80} cy={70} r={k === 0 ? 42 : 36} fill="#0E0D0B" />
            <path d={`M20 320 Q20 ${k === 0 ? 130 : 150} 80 ${k === 0 ? 120 : 140} Q140 ${k === 0 ? 130 : 150} 140 320 Z`} fill="#0E0D0B" />
          </svg>
        ))}
        {[1, 2, 3, 4].map((k) => (
          <div key={k} style={{ position: "absolute", top: 0, bottom: 0, left: k * 104 - 8, width: 16, background: "#141311", boxShadow: "2px 0 4px rgba(255,255,255,0.08)" }} />
        ))}
        {[1, 2].map((k) => (
          <div key={k} style={{ position: "absolute", left: 0, right: 0, top: k * 210, height: 14, background: "#141311" }} />
        ))}
      </div>
      <div style={{ marginTop: 34, color: C.sub, fontSize: 30, fontWeight: 700, maxWidth: 1300, textAlign: "center", lineHeight: 1.35 }}>“…seen more rarely behind the bars and windows, till at length they ceased to appear altogether” — Mancini, 1483 (trans. Armstrong)</div>
    </AbsoluteFill>
  );
};

/* Gold chain drawn as linked ovals */
export const GoldChain: React.FC = () => {
  const f = useCurrentFrame();
  const n = 16;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 170, fontFamily: FONT }}>
      <svg width={1300} height={360} viewBox="0 0 1300 360">
        {Array.from({ length: n }).map((_, i) => {
          const t = i / (n - 1);
          const x = 120 + t * 1060;
          const y = 90 + Math.sin(t * Math.PI) * 170;
          const a = interpolate(f, [i * 2, i * 2 + 10], [0, 1], clamp);
          const rot = Math.atan2(Math.cos(t * Math.PI) * 170 * Math.PI, 1060) * (180 / Math.PI);
          return (
            <ellipse key={i} cx={x} cy={y} rx={42} ry={22} transform={`rotate(${rot + (i % 2 ? 90 : 0) * 0} ${x} ${y})`} fill="none" stroke={i % 2 ? "#C98A1E" : C.amber} strokeWidth={i % 2 ? 10 : 12} opacity={a} />
          );
        })}
      </svg>
      <div style={{ color: C.ink, fontSize: 46, fontWeight: 900, ...fade(f, 30) }}>A gold chain of the young king, Edward V</div>
      <div style={{ color: C.sub, fontSize: 28, marginTop: 14, ...fade(f, 40) }}>Margaret Capell&apos;s will, 1516 · the chain itself is lost</div>
    </AbsoluteFill>
  );
};

/* Family link: Margaret Capell — sisters — Tyrrell's wife */
export const TyrrellLink: React.FC<{ narrow?: boolean }> = ({ narrow = false }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: narrow ? 80 : 150, fontFamily: FONT, transform: narrow ? "scale(1.5)" : undefined }}>
      <div style={{ display: "flex", flexDirection: narrow ? "column" : "row", alignItems: "center", gap: 30 }}>
        <div style={fade(f, 0)}>
          <Box title="Margaret Capell" sub="owned Edward V's chain" />
        </div>
        <div style={{ color: C.amber, fontSize: 34, fontWeight: 900, ...fade(f, 20) }}>— sisters —</div>
        <div style={fade(f, 30)}>
          <Box title="Anne Arundell" sub="wife of James Tyrrell" />
        </div>
        <div style={{ color: C.amber, fontSize: 60, fontWeight: 900, ...fade(f, 50) }}>{narrow ? "↓" : "→"}</div>
        <div style={fade(f, 60)}>
          <Box title="James Tyrrell" sub="named by More as organizer" hi />
        </div>
      </div>
    </AbsoluteFill>
  );
};
