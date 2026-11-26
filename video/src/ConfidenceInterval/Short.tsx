import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../StyleFrames";
import { C, FONT, FPS, HYPOTHESES } from "./theme";
import { Captions, ConfidenceMeter, HypothesisCards, MeterKey, W, groupWords, meterAt } from "./components";

// Shared frame for vertical 1080x1920 shorts. Each episode supplies narration timing, meter keys and scenes.
export type ShortTiming = { dur: number; words: W[] };
export type ShortScene = { at: number; board?: boolean; el: (dur: number) => React.ReactNode };
export type ShortMeta = { keys: MeterKey[]; names?: readonly string[]; question?: string; bed: string };

export const LEAD = 0.4; // s of silence before the voice
const TAIL = 2.0; // s after the voice (end card)
export const shortFrames = (t: ShortTiming) => Math.round((LEAD + t.dur + TAIL) * FPS);

// frame where the n-th word starting with `w` is spoken (case-insensitive prefix match)
export const wordAt = (t: ShortTiming) => (w: string, nth = 1) => {
  const hits = t.words.filter((x) => x.t.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(w.toLowerCase()));
  const h = hits[nth - 1] ?? hits[0];
  return h ? Math.round((LEAD + h.s) * FPS) : 0;
};

export const VBoard: React.FC<{ m: ShortMeta; at: number; highlight?: number; title?: string }> = ({ m, at, highlight = -1, title }) => {
  const f = useCurrentFrame();
  const s = meterAt(m.keys, f + at);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 260 }}>
      <ConfidenceMeter s={s} width={900} label={m.question} />
      <div style={{ height: 90 }} />
      <HypothesisCards s={s} highlight={highlight} width={900} cols={2} names={m.names ?? HYPOTHESES} />
      {title && <div style={{ marginTop: 50, color: C.sub, fontFamily: FONT, fontSize: 40, fontWeight: 700, width: 900, textAlign: "center" }}>{title}</div>}
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{ m: ShortMeta; at: number }> = ({ m, at }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 380, gap: 70, opacity: a }}>
      <ConfidenceMeter s={meterAt(m.keys, f + at)} width={900} label={m.question} />
      <div style={{ color: C.ink, fontFamily: FONT, fontSize: 92, fontWeight: 900, letterSpacing: 6, textAlign: "center", lineHeight: 1 }}>
        CONFIDENCE
        <br />
        INTERVAL
      </div>
      <div style={{ color: C.amber, fontFamily: FONT, fontSize: 40, fontWeight: 800 }}>Full investigation on the channel</div>
    </AbsoluteFill>
  );
};

const MiniMeter: React.FC<{ m: ShortMeta; scenes: ShortScene[] }> = ({ m, scenes }) => {
  const f = useCurrentFrame();
  const i = scenes.findIndex((s, k) => f >= s.at && f < (scenes[k + 1]?.at ?? 1e9));
  if (i < 0 || scenes[i].board) return null;
  return (
    <div style={{ position: "absolute", top: 120, left: 90, right: 90, padding: "18px 26px", background: "rgba(20,20,19,0.86)", border: `1px solid ${C.line}`, borderRadius: 12 }}>
      <ConfidenceMeter s={meterAt(m.keys, f)} width={846} big={false} label={m.question} />
    </div>
  );
};

export const ShortFrame: React.FC<{ t: ShortTiming; audio: string; scenes: ShortScene[]; m: ShortMeta; cues: number[] }> = ({ t, audio, scenes, m, cues }) => {
  useFonts();
  const total = shortFrames(t);
  const caps = groupWords(
    t.words.map((w) => ({ ...w, s: w.s + LEAD, e: w.e + LEAD })),
    4,
  );
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {scenes.map((s, i) => {
        const end = scenes[i + 1]?.at ?? total;
        return (
          <Sequence key={i} from={s.at} durationInFrames={end - s.at}>
            {s.el(end - s.at)}
          </Sequence>
        );
      })}
      <MiniMeter m={m} scenes={scenes} />
      <Captions groups={caps} fps={FPS} bottom={470} size={70} />
      <Sequence from={Math.round(LEAD * FPS)}>
        <Html5Audio src={staticFile(audio)} />
      </Sequence>
      <Html5Audio src={staticFile(m.bed)} volume={0.14} />
      {cues.map((f) => (
        <Sequence key={f} from={f} durationInFrames={20}>
          <Html5Audio src={staticFile("sfx/ding.wav")} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
