import React from "react";
import { ArchivalPan, KnownUnknown, MeterKey, TextCard } from "../components";
import { EndCard, Fit, ShortFrame, ShortMeta, ShortScene, ShortTiming, VBoard, shortFrames, wordAt } from "../Short";
import { NAMES, QUESTION } from "./Ep03";
import { GoldChain, TyrrellLink } from "./Scenes";
import S1 from "./short1.json";
import S2 from "./short2.json";

// Vertical shorts cut from EP03 (Princes in the Tower).
const T1 = S1 as ShortTiming;
const T2 = S2 as ShortTiming;
export const CI03S1_FRAMES = shortFrames(T1);
export const CI03S2_FRAMES = shortFrames(T2);
const IMG = (n: string) => `ci03/img/${n}.jpg`;
const K = (f: number, v: [number, number, number, number], band?: [number, number], dur?: number): MeterKey => ({ f, v, main: v[0], band, dur });

/* ---------------- Short 1: the bones nobody may test */
const w1 = wordAt(T1);
const K1: MeterKey[] = [K(0, [42, 22, 16, 20]), K(w1("ai") + 6, [46, 21, 15, 18], undefined, 40)];
const M1: ShortMeta = { keys: K1, names: NAMES, question: QUESTION, bed: "ci03/bed.mp3" };
const SC1: ShortScene[] = [
  {
    at: 0,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("tower")} dur={d} from={[1.4, 0, 0]} to={[1.7, -4, 0]} fit="cover" fadeIn={4} dim={0.35} />
        <TextCard title="1674: two skeletons under a stair" size={92} />
      </>
    ),
  },
  {
    at: w1("king") - 6,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("millais")} dur={d} from={[1.05, 0, 0]} to={[1.2, 0, -2]} fit="cover" dim={0.45} />
        <TextCard title="Buried as the Princes in the Tower" size={92} />
      </>
    ),
  },
  {
    at: w1("in1933") - 6,
    el: () => (
      <Fit s={0.72}>
        <KnownUnknown title="EXAMINED 1933" known={["two children", "about the right ages"]} unknown={["their sex", "their century"]} split={w1("but") - w1("in1933") + 6} />
      </Fit>
    ),
  },
  { at: w1("and") - 6, el: () => <TextCard kicker="MODERN TESTING, INCLUDING DNA" title="Refused." size={140} /> },
  { at: w1("one") - 6, board: true, el: () => <VBoard m={M1} at={w1("one") - 6} highlight={0} title="One test could settle it." /> },
  { at: w1("full") - 4, board: true, el: () => <EndCard m={M1} at={w1("full") - 4} /> },
];
export const Ci03Short1: React.FC = () => <ShortFrame t={T1} audio="ci03/shorts/s1.mp3" scenes={SC1} m={M1} cues={[K1[1].f]} />;

/* ---------------- Short 2: the chain in the will */
const w2 = wordAt(T2);
const K2: MeterKey[] = [K(0, [47, 18, 12, 23]), K(w2("forty") - 10, [49, 18, 12, 21], [35, 63], 50)];
const M2: ShortMeta = { keys: K2, names: NAMES, question: QUESTION, bed: "ci03/bed.mp3" };
const SC2: ShortScene[] = [
  {
    at: 0,
    el: () => (
      <Fit s={0.8}>
        <GoldChain />
      </Fit>
    ),
  },
  {
    at: w2("her") - 6,
    el: () => <TyrrellLink narrow />,
  },
  {
    at: w2("dead") - 6,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("northcote")} dur={d} from={[1.05, 0, 0]} to={[1.2, 0, -2]} fit="cover" dim={0.5} />
        <TextCard title="A dead king's chain, in the accused man's family" size={88} />
      </>
    ),
  },
  { at: w2("but") - 6, el: () => <TextCard title="Suggestive. Not proof." sub="The chain is lost. Nobody knows how it travelled." size={104} /> },
  { at: w2("ai") - 6, board: true, el: () => <VBoard m={M2} at={w2("ai") - 6} highlight={0} /> },
  { at: w2("full") - 4, board: true, el: () => <EndCard m={M2} at={w2("full") - 4} /> },
];
export const Ci03Short2: React.FC = () => <ShortFrame t={T2} audio="ci03/shorts/s2.mp3" scenes={SC2} m={M2} cues={[K2[1].f]} />;
