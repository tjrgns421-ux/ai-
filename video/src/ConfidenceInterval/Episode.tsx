import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../StyleFrames";
import { C, FONT, FPS } from "./theme";
import { Captions, ConfidenceMeter, HypothesisCards, MeterKey, W, groupWords, meterAt } from "./components";

// Shared frame for a Confidence Interval long video (EP02 onward). An episode supplies:
// timing.json (from tools/build_narration.py), meter keyframes, hypothesis names and a scene list.

export type Timing = { total: number; lines: { i: number; start: number; dur: number; words: W[] }[] };
export type Scene = { at: number; board?: boolean; el: (dur: number) => React.ReactNode };
export type EpisodeSpec = { id: string; timing: Timing; keys: MeterKey[]; names: readonly string[]; question: string; scenes: Scene[] };

// helpers bound to one timing file: L(i) start frame of line i, LEnd(i), Wd(i, word) frame a word starts
export const timeHelpers = (t: Timing) => ({
  L: (i: number) => Math.round(t.lines[i - 1].start * FPS),
  LEnd: (i: number) => Math.round((t.lines[i - 1].start + t.lines[i - 1].dur) * FPS),
  Wd: (i: number, w: string, nth = 1) => {
    const hits = t.lines[i - 1].words.filter((x) => x.t.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(w.toLowerCase()));
    const h = hits[nth - 1] ?? hits[0];
    return Math.round((h ? h.s : t.lines[i - 1].start) * FPS);
  },
  frames: Math.round(t.total * FPS),
});

export const Board: React.FC<{ spec: EpisodeSpec; at: number; highlight?: number; title?: string; appear?: number; stamp?: string }> = ({
  spec,
  at,
  highlight = -1,
  title,
  appear,
  stamp,
}) => {
  const f = useCurrentFrame();
  const s = meterAt(spec.keys, f + at);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
      <ConfidenceMeter s={s} width={1300} label={spec.question} />
      <div style={{ height: 120 }} />
      <HypothesisCards s={s} appear={appear !== undefined ? appear - at : -999} highlight={highlight} names={spec.names} />
      {title && <div style={{ marginTop: 40, color: C.sub, fontFamily: FONT, fontSize: 32, fontWeight: 600 }}>{title}</div>}
      {stamp && <div style={{ position: "absolute", top: 50, left: 70, color: C.dim, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4 }}>{stamp}</div>}
    </AbsoluteFill>
  );
};

export const EndScreen: React.FC<{ spec: EpisodeSpec; at: number; credit: string }> = ({ spec, at, credit }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 90, paddingBottom: 60 }}>
      <ConfidenceMeter s={meterAt(spec.keys, f + at)} width={1200} label={spec.question} />
      <div style={{ opacity: a, color: C.ink, fontFamily: FONT, fontSize: 96, fontWeight: 900, letterSpacing: 10 }}>CONFIDENCE INTERVAL</div>
      <div style={{ opacity: a, color: C.dim, fontFamily: FONT, fontSize: 28, fontWeight: 600 }}>{credit}</div>
    </AbsoluteFill>
  );
};

const MiniMeter: React.FC<{ spec: EpisodeSpec; hideFrom: number }> = ({ spec, hideFrom }) => {
  const f = useCurrentFrame();
  const sc = spec.scenes;
  const idx = sc.findIndex((s, i) => f >= s.at && f < (sc[i + 1]?.at ?? 1e9));
  if (idx < 0 || sc[idx].board || f >= hideFrom) return null;
  const a = interpolate(f, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 46, right: 60, padding: "16px 22px", background: "rgba(20,20,19,0.86)", border: `1px solid ${C.line}`, borderRadius: 10, opacity: a }}>
      <ConfidenceMeter s={meterAt(spec.keys, f)} width={340} big={false} label={spec.question} />
    </div>
  );
};

export const EpisodeFrame: React.FC<{ spec: EpisodeSpec; cues: number[]; hideMiniFrom: number }> = ({ spec, cues, hideMiniFrom }) => {
  useFonts();
  const total = Math.round(spec.timing.total * FPS);
  const caps = React.useMemo(() => groupWords(spec.timing.lines.flatMap((l) => l.words), 7), [spec]);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {spec.scenes.map((s, i) => {
        const end = spec.scenes[i + 1]?.at ?? total;
        return (
          <Sequence key={i} from={s.at} durationInFrames={end - s.at}>
            {s.el(end - s.at)}
          </Sequence>
        );
      })}
      <MiniMeter spec={spec} hideFrom={hideMiniFrom} />
      <Captions groups={caps} fps={FPS} />
      <Html5Audio src={staticFile(`${spec.id}/narration.mp3`)} />
      <Html5Audio src={staticFile(`${spec.id}/bed.mp3`)} volume={0.16} />
      {cues.map((f) => (
        <Sequence key={f} from={f} durationInFrames={20}>
          <Html5Audio src={staticFile("sfx/ding.wav")} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
