import React from "react";
import { AbsoluteFill } from "remotion";
import { ArchivalPan, Callout, CitationTag, MeterKey, TextCard, Timeline } from "../components";
import { EndCard, ShortFrame, ShortMeta, ShortScene, ShortTiming, VBoard, shortFrames, wordAt } from "../Short";
import { Checklist, Naibbe } from "./Scenes";
import S1 from "./short1.json";
import S2 from "./short2.json";

// Vertical 1080x1920 shorts cut from EP01 (shared frame: ../Short).
export const CI01S1_FRAMES = shortFrames(S1 as ShortTiming);
export const CI01S2_FRAMES = shortFrames(S2 as ShortTiming);
const IMG = (n: string) => `ci01/img/${n}.jpg`;

/* ---------------- Short 1: "Everyone says it's a modern fake" → forgery 1% */
const w1 = wordAt(S1 as ShortTiming);
const K1: MeterKey[] = [
  { f: 0, v: [25, 25, 25, 25], main: 50 },
  { f: w1("one", 2) + 4, v: [1, 33, 33, 33], main: 66, dur: 40 },
];
const M1: ShortMeta = { keys: K1, bed: "ci01/bed.mp3" };
const SC1: ShortScene[] = [
  {
    at: 0,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("f1r")} dur={d} from={[1.05, 0, 0]} to={[1.25, 0, -4]} fit="cover" fadeIn={4} dim={0.25} />
        <TextCard title="Everyone says it's a modern fake." size={96} />
      </>
    ),
  },
  { at: w1("here") - 4, board: true, el: () => <VBoard m={M1} at={w1("here") - 4} highlight={0} title="Modern forgery: where do I put it?" /> },
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
  { at: w1("modern", 2) - 4, board: true, el: () => <VBoard m={M1} at={w1("modern", 2) - 4} highlight={0} /> },
  { at: w1("full") - 4, board: true, el: () => <EndCard m={M1} at={w1("full") - 4} /> },
];
export const Ci01Short1: React.FC = () => <ShortFrame t={S1 as ShortTiming} audio="ci01/shorts/s1.mp3" scenes={SC1} m={M1} cues={[K1[1].f]} />;

/* ---------------- Short 2: "A cipher you can run with dice" → cipher up */
const w2 = wordAt(S2 as ShortTiming);
const K2: MeterKey[] = [
  { f: 0, v: [1, 37, 29, 33], main: 62 },
  { f: w2("cipher", 4) + 4, v: [1, 33, 36, 30], main: 66, dur: 40 },
];
const M2: ShortMeta = { keys: K2, bed: "ci01/bed.mp3" };
const SC2: ShortScene[] = [
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
  { at: w2("doesn") - 8, board: true, el: () => <VBoard m={M2} at={w2("doesn") - 8} highlight={2} title="It doesn't solve the book. It kills an argument." /> },
  { at: w2("full") - 4, board: true, el: () => <EndCard m={M2} at={w2("full") - 4} /> },
];
export const Ci01Short2: React.FC = () => <ShortFrame t={S2 as ShortTiming} audio="ci01/shorts/s2.mp3" scenes={SC2} m={M2} cues={[K2[1].f]} />;
