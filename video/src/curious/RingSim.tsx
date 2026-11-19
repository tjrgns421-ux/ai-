import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../StyleFrames";

// Ring-road traffic simulation for Curious Minutes ep01 (a recreation, labeled SIMULATION on screen).
// Optimal Velocity model (Bando et al.), the model family used by Sugiyama et al. 2008:
//   dv/dt = A * (V(headway) - v),  V(h) = VMAX/2 * (tanh((h - HC)/W) + tanh(HC/W))
// Tuned so the numbers match the paper: 22 cars, 230 m ring; jam cars stop, free cars ~43 km/h (paper ~40),
// jam drifts backward ~22 km/h (paper ~20). One car eases off for 2 s at t = 5 s to start it.
// Optional "calm car" (index 5): follows the 40 s average speed of the ring (like Stern et al. 2018).

export const RING = { L: 230, N: 22 };
const VMAX = 12, HC = 10, W = 2, A = 2.0, DT = 0.05;
const V = (h: number) => (VMAX / 2) * (Math.tanh((h - HC) / W) + Math.tanh(HC / W));

export type SimFrame = { x: number[]; v: number[]; a: number[] };

/** Simulate `seconds` of traffic, sampled at `hz`. calmFrom = seconds when the calm car switches on (or null). */
export const simulate = (seconds: number, hz: number, calmFrom: number | null): SimFrame[] => {
  const { L, N } = RING;
  const x = Array.from({ length: N }, (_, i) => (i * L) / N);
  const v = Array(N).fill(V(L / N));
  const out: SimFrame[] = [];
  const buf: number[] = [];
  const every = Math.round(1 / hz / DT);
  let acc = Array(N).fill(0);
  for (let step = 0, t = 0; t < seconds; step++, t = step * DT) {
    const h = x.map((xi, i) => (((x[(i + 1) % N] - xi) % L) + L) % L);
    acc = h.map((hi, i) => A * (V(hi) - v[i]));
    if (t >= 5 && t < 7) acc[0] = -1.5;
    const mean = v.reduce((s, q) => s + q, 0) / N;
    buf.push(mean);
    if (buf.length > 40 / DT) buf.shift();
    if (calmFrom !== null && t >= calmFrom) {
      const avg = buf.reduce((s, q) => s + q, 0) / buf.length;
      acc[5] = 0.4 * (Math.min(avg, V(h[5])) - v[5]);
    }
    if (step % every === 0) out.push({ x: [...x], v: [...v], a: [...acc] });
    for (let i = 0; i < N; i++) {
      v[i] = Math.max(0, v[i] + acc[i] * DT);
      x[i] = (x[i] + v[i] * DT) % L;
    }
  }
  return out;
};

const PALETTE = ["#FF6B5E", "#FFD23F", "#4FA3FF", "#5BD68A", "#FF9F43", "#B07CFF", "#7FE3FF", "#FF8FC7"];

/** Top-down ring with cars. `f` = one simulation frame. */
export const Ring: React.FC<{ f: SimFrame; cx: number; cy: number; r: number; calm?: number | null; showJam?: boolean }> = ({ f, cx, cy, r, calm = null, showJam = true }) => {
  const { L, N } = RING;
  const k = (2 * Math.PI * r) / L; // px per meter along the ring
  const ang = (x: number) => (x / L) * 2 * Math.PI - Math.PI / 2;
  const carL = 5.6 * k, carW = 2.8 * k; // drawn ~25% larger than scale so cars read on a phone
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3B404C" strokeWidth={carW * 2.6} />
      <circle cx={cx} cy={cy} r={r + carW * 1.3} fill="none" stroke="#14151B" strokeWidth={6} />
      <circle cx={cx} cy={cy} r={r - carW * 1.3} fill="none" stroke="#14151B" strokeWidth={6} />
      {showJam &&
        f.x.map((x, i) =>
          f.v[i] < 2.2 ? (
            <circle key={`j${i}`} cx={cx + r * Math.cos(ang(x))} cy={cy + r * Math.sin(ang(x))} r={carL * 0.95} fill="#FF3B30" opacity={0.28} />
          ) : null,
        )}
      {f.x.map((x, i) => {
        const a = ang(x);
        const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
        const braking = f.a[i] < -0.6;
        const isCalm = calm !== null && i === calm;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${(a * 180) / Math.PI + 90})`}>
            {braking && <circle cx={-carL / 2} cy={0} r={carW * 0.9} fill="#FF3B30" opacity={0.45} />}
            <rect x={-carL / 2} y={-carW / 2} width={carL} height={carW} rx={carW * 0.35} fill={isCalm ? "#FFFFFF" : PALETTE[i % PALETTE.length]} stroke="#14151B" strokeWidth={4} />
            <rect x={carL * 0.05} y={-carW * 0.32} width={carL * 0.28} height={carW * 0.64} rx={4} fill="#CFEFFF" stroke="#14151B" strokeWidth={2.5} />
            <rect x={-carL / 2 - 2} y={-carW * 0.42} width={6} height={carW * 0.26} fill={braking ? "#FF3B30" : "#7A1F1A"} />
            <rect x={-carL / 2 - 2} y={carW * 0.16} width={6} height={carW * 0.26} fill={braking ? "#FF3B30" : "#7A1F1A"} />
            {isCalm && <text x={0} y={carW * 0.2} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={carW * 0.55} fill="#14151B">AI</text>}
          </g>
        );
      })}
      <text x={cx} y={cy - 10} textAnchor="middle" fontFamily="Pretendard" fontWeight={900} fontSize={34} fill="#14151B" opacity={0.55}>
        230 m · {N} cars
      </text>
    </svg>
  );
};

// ---- preview clip: the jam appears out of nothing (36 s, sim runs at 2x) ----
const SPEEDUP = 2;
const FPS = 30;
const SIM_A = simulate(72, FPS / SPEEDUP, null);
export const RING_PREVIEW_FRAMES = SIM_A.length;

export const CmRingPreview: React.FC = () => {
  useFonts();
  const fr = useCurrentFrame();
  const f = SIM_A[Math.min(fr, SIM_A.length - 1)];
  const simT = (fr * SPEEDUP) / FPS;
  const kick = simT >= 5 && simT < 7;
  const jamCount = f.v.filter((q) => q < 2.2).length;
  const note = simT < 5 ? "Every car, same speed." : simT < 9 ? "One driver eases off for 2 seconds…" : jamCount > 0 ? "A jam, out of nothing." : "The drivers behind brake a little harder…";
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#6EC1FF, #BFE6FF)" }}>
      <Ring f={f} cx={960} cy={560} r={380} />
      {kick && (
        <div style={{ position: "absolute", left: 960 + 380 * Math.cos((f.x[0] / RING.L) * 2 * Math.PI - Math.PI / 2) - 60, top: 560 + 380 * Math.sin((f.x[0] / RING.L) * 2 * Math.PI - Math.PI / 2) - 120, fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: "#FF3B30" }}>
          brake
        </div>
      )}
      <div style={{ position: "absolute", left: 60, top: 50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: "#14151B", background: "#FFD23F", padding: "6px 16px", borderRadius: 10, border: "4px solid #14151B" }}>SIMULATION</div>
      <div style={{ position: "absolute", left: 60, top: 120, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: "#14151B", width: 520, lineHeight: 1.1 }}>{note}</div>
      <div style={{ position: "absolute", right: 60, top: 60, fontFamily: "Pretendard", fontWeight: 700, fontSize: 28, color: "#14151B", opacity: 0.6 }}>{`t = ${Math.floor(simT)} s`}</div>
      <div style={{ position: "absolute", right: 60, bottom: 60, width: 460, fontFamily: "Pretendard", fontWeight: 700, fontSize: 26, color: "#14151B", opacity: 0.65, textAlign: "right" }}>
        Recreation of Sugiyama et al. (2008), New Journal of Physics
      </div>
      <Img src={staticFile(`sprout/${jamCount > 0 ? "shock" : "happy"}.png`)} style={{ position: "absolute", left: 1480, top: 620, width: 340, height: 340, opacity: interpolate(fr, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};
