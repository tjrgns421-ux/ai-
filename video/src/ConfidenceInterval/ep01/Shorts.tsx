import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../../StyleFrames";
import { C, FONT, FPS } from "../theme";
import { ArchivalPan, Callout, Captions, CitationTag, ConfidenceMeter, HypothesisCards, MeterKey, TextCard, Timeline, W, groupWords, meterAt } from "../components";
import { Checklist, Naibbe } from "./Scenes";
import S1 from "./short1.json";
import S2 from "./short2.json";

// Vertical 1080x1920 shorts cut from EP01. Same look and components as the long video.
type Timing = { dur: number; words: W[] };
type Scene = { at: number; board?: boolean; el: (dur: number) => React.ReactNode };

const LEAD = 0.4; // s of silence before the voice
const TAIL = 2.0; // s after the voice (end card)
const frames = (t: Timing) => Math.round((LEAD + t.dur + TAIL) * FPS);
export const CI01S1_FRAMES = frames(S1);
export const CI01S2_FRAMES = frames(S2);

// frame where the n-th occurrence of `w` starts (case-insensitive prefix match)
const wordAt = (t: Timing) => (w: string, nth = 1) => {
  const hits = t.words.filter((x) => x.t.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(w.toLowerCase()));
  const h = hits[nth - 1] ?? hits[0];
  return h ? Math.round((LEAD + h.s) * FPS) : 0;
};

const IMG = (n: string) => `ci01/img/${n}.jpg`;

const VBoard: React.FC<{ keys: MeterKey[]; at: number; highlight?: number; title?: string }> = ({ keys, at, highlight = -1, title }) => {
  const f = useCurrentFrame();
  const s = meterAt(keys, f + at);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 260 }}>
      <ConfidenceMeter s={s} width={900} />
      <div style={{ height: 90 }} />
      <HypothesisCards s={s} highlight={highlight} width={900} cols={2} />
      {title && <div style={{ marginTop: 50, color: C.sub, fontFamily: FONT, fontSize: 40, fontWeight: 700, width: 900, textAlign: "center" }}>{title}</div>}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ keys: MeterKey[]; at: number }> = ({ keys, at }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 380, gap: 70, opacity: a }}>
      <ConfidenceMeter s={meterAt(keys, f + at)} width={900} />
      <div style={{ color: C.ink, fontFamily: FONT, fontSize: 92, fontWeight: 900, letterSpacing: 6, textAlign: "center", lineHeight: 1 }}>
        CONFIDENCE
        <br />
        INTERVAL
      </div>
      <div style={{ color: C.amber, fontFamily: FONT, fontSize: 40, fontWeight: 800 }}>Full investigation on the channel</div>
    </AbsoluteFill>
  );
};

const MiniMeter: React.FC<{ keys: MeterKey[]; scenes: Scene[] }> = ({ keys, scenes }) => {
  const f = useCurrentFrame();
  const i = scenes.findIndex((s, k) => f >= s.at && f < (scenes[k + 1]?.at ?? 1e9));
  if (i < 0 || scenes[i].board) return null;
  return (
    <div style={{ position: "absolute", top: 120, left: 90, right: 90, padding: "18px 26px", background: "rgba(20,20,19,0.86)", border: `1px solid ${C.line}`, borderRadius: 12 }}>
      <ConfidenceMeter s={meterAt(keys, f)} width={846} big={false} />
    </div>
  );
};

const ShortFrame: React.FC<{ t: Timing; audio: string; scenes: Scene[]; keys: MeterKey[]; cues: number[] }> = ({ t, audio, scenes, keys, cues }) => {
  useFonts();
  const total = frames(t);
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
      <MiniMeter keys={keys} scenes={scenes} />
      <Captions groups={caps} fps={FPS} bottom={470} size={70} />
      <Sequence from={Math.round(LEAD * FPS)}>
        <Html5Audio src={staticFile(audio)} />
      </Sequence>
      <Html5Audio src={staticFile("ci01/bed.mp3")} volume={0.14} />
      {cues.map((f) => (
        <Sequence key={f} from={f} durationInFrames={20}>
          <Html5Audio src={staticFile("sfx/ding.wav")} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- Short 1: "Everyone says it's a modern fake" → forgery 1% */
const w1 = wordAt(S1);
const K1: MeterKey[] = [
  { f: 0, v: [25, 25, 25, 25], main: 50 },
  { f: w1("one", 2) + 4, v: [1, 33, 33, 33], main: 66, dur: 40 },
];
const SC1: Scene[] = [
  {
    at: 0,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("f1r")} dur={d} from={[1.05, 0, 0]} to={[1.25, 0, -4]} fit="cover" fadeIn={4} dim={0.25} />
        <TextCard title="Everyone says it's a modern fake." size={96} />
      </>
    ),
  },
  { at: w1("here") - 4, board: true, el: () => <VBoard keys={K1} at={w1("here") - 4} highlight={0} title="Modern forgery: where do I put it?" /> },
  {
    at: w1("in") - 4,
    el: () => (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 200 }}>
        <Timeline width={940} band={{ a: 1404, b: 1438, label: "parchment, carbon-dated", at: w1("1404") - w1("in") + 4 }} />
        <CitationTag text="Univ. of Arizona, 2009" at={20} top />
      </AbsoluteFill>
    ),
  },
  {
    at: w1("tucked") - 6,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("marci")} dur={d} from={[1.1, 0, 2]} to={[1.35, 0, -3]} fit="cover" />
        <Callout text="1665/66" x={90} y={1220} at={w1("1665") - w1("tucked") + 6} size={80} />
      </>
    ),
  },
  {
    at: w1("already") - 10,
    el: () => (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 200 }}>
        <Timeline
          width={940}
          band={{ a: 1404, b: 1438, label: "parchment", at: -999 }}
          marks={[
            { year: 1666, label: "letter", at: 0 },
            { year: 1912, label: "Voynich", at: w1("1912") - w1("already") + 10 },
          ]}
        />
      </AbsoluteFill>
    ),
  },
  { at: w1("modern", 2) - 4, board: true, el: () => <VBoard keys={K1} at={w1("modern", 2) - 4} highlight={0} /> },
  { at: w1("full") - 4, board: true, el: () => <EndCard keys={K1} at={w1("full") - 4} /> },
];
export const Ci01Short1: React.FC = () => <ShortFrame t={S1} audio="ci01/shorts/s1.mp3" scenes={SC1} keys={K1} cues={[K1[1].f]} />;

/* ---------------- Short 2: "A cipher you can run with dice" → cipher up */
const w2 = wordAt(S2);
const K2: MeterKey[] = [
  { f: 0, v: [1, 37, 29, 33], main: 62 },
  { f: w2("cipher", 4) + 4, v: [1, 33, 36, 30], main: 66, dur: 40 },
];
const SC2: Scene[] = [
  {
    at: 0,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("zodiac")} dur={d} from={[1.05, 0, 0]} to={[1.25, 0, -3]} fit="cover" fadeIn={4} dim={0.45} />
        <TextCard kicker="THE OLD ARGUMENT" title="“No medieval cipher looks like this.”" size={88} />
      </>
    ),
  },
  {
    at: w2("in") - 4,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("herbal")} dur={d} from={[1.1, 0, 0]} to={[1.25, 0, -3]} fit="cover" dim={0.55} />
        <TextCard kicker="GRESHKO · CRYPTOLOGIA · 2025" title="The Naibbe cipher" size={104} />
      </>
    ),
  },
  { at: w2("take") - 4, el: () => <Naibbe /> },
  { at: w2("output") - 8, el: () => <Checklist title="THE OUTPUT COPIES" items={["symbol frequencies", "word lengths", "glyph positions"]} /> },
  { at: w2("doesn") - 8, board: true, el: () => <VBoard keys={K2} at={w2("doesn") - 8} highlight={2} title="It doesn't solve the book. It kills an argument." /> },
  { at: w2("full") - 4, board: true, el: () => <EndCard keys={K2} at={w2("full") - 4} /> },
];
export const Ci01Short2: React.FC = () => <ShortFrame t={S2} audio="ci01/shorts/s2.mp3" scenes={SC2} keys={K2} cues={[K2[1].f]} />;
