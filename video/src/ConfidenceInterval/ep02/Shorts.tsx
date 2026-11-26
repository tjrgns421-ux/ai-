import React from "react";
import { ArchivalPan, CitationTag, MeterKey, TextCard } from "../components";
import { EndCard, Fit, ShortFrame, ShortMeta, ShortScene, ShortTiming, VBoard, shortFrames, wordAt } from "../Short";
import { NAMES, QUESTION } from "./Ep02";
import { Carved, Hammerscale, Signal } from "./Scenes";
import S1 from "./short1.json";
import S2 from "./short2.json";

// Vertical shorts cut from EP02 (Roanoke).
const T1 = S1 as ShortTiming;
const T2 = S2 as ShortTiming;
export const CI02S1_FRAMES = shortFrames(T1);
export const CI02S2_FRAMES = shortFrames(T2);
const IMG = (n: string) => `ci02/img/${n}.jpg`;

/* ---------------- Short 1: one carved word */
const w1 = wordAt(T1);
const K1: MeterKey[] = [
  { f: 0, v: [25, 25, 25, 25], main: 50 },
  { f: w1("orderly") + 12, v: [35, 25, 28, 12], main: 60, dur: 40 },
];
const M1: ShortMeta = { keys: K1, names: NAMES, question: QUESTION, bed: "ci02/bed.mp3" };
const SC1: ShortScene[] = [
  {
    at: 0,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("ruins")} dur={d} from={[1.05, 0, 0]} to={[1.2, 0, -3]} fit="cover" fadeIn={4} dim={0.35} />
        <TextCard title="1590: the colony was empty." size={96} />
      </>
    ),
  },
  { at: w1("just") - 4, el: () => <Carved word="CROATOAN" where="carved on a palisade post" per={5} /> },
  { at: w1("before") - 4, el: () => <Signal narrow /> },
  { at: w1("orderly") - 4, board: true, el: () => <VBoard m={M1} at={w1("orderly") - 4} highlight={0} title="An orderly move, with a destination written down." /> },
  {
    at: w1("never") - 8,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("pinnace")} dur={d} from={[1.05, 0, 0]} to={[1.2, 0, -2]} fit="cover" dim={0.5} />
        <TextCard title="He never made it there." size={96} />
      </>
    ),
  },
  { at: w1("ai") - 6, board: true, el: () => <VBoard m={M1} at={w1("ai") - 6} highlight={0} /> },
  { at: w1("full") - 4, board: true, el: () => <EndCard m={M1} at={w1("full") - 4} /> },
];
export const Ci02Short1: React.FC = () => <ShortFrame t={T1} audio="ci02/shorts/s1.mp3" scenes={SC1} m={M1} cues={[K1[1].f]} />;

/* ---------------- Short 2: the blacksmith clue */
const w2 = wordAt(T2);
const K2: MeterKey[] = [
  { f: 0, v: [30, 27, 34, 9], main: 57 },
  { f: w2("sixty") - 10, v: [37, 23, 31, 9], main: 60, band: [45, 74], dur: 50 },
];
const M2: ShortMeta = { keys: K2, names: NAMES, question: QUESTION, bed: "ci02/bed.mp3" };
const SC2: ShortScene[] = [
  {
    at: 0,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("village")} dur={d} from={[1.05, 0, 0]} to={[1.2, 0, -2]} fit="cover" fadeIn={4} dim={0.5} />
        <TextCard title="How do you prove colonists lived somewhere?" size={88} />
      </>
    ),
  },
  {
    at: w2("look") - 4,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("village")} dur={d} from={[1.2, 0, -2]} to={[1.25, 0, -3]} fit="cover" fadeIn={1} dim={0.65} />
        <TextCard title="Look for a blacksmith." size={104} />
      </>
    ),
  },
  {
    at: w2("on") - 4,
    el: () => (
      <>
        <Fit s={0.8}>
          <Hammerscale />
        </Fit>
        <CitationTag text="Horton & Dawson, announced 2025" top at={20} />
      </>
    ),
  },
  { at: w2("in") - 4, el: () => <TextCard title="The Croatoan didn't forge iron." sub="English settlers would have." size={92} /> },
  { at: w2("trade") - 4, el: () => <TextCard title="Trade can explain a sword." sub="It's harder to explain a workshop." size={92} /> },
  { at: w2("but") - 4, board: true, el: () => <VBoard m={M2} at={w2("but") - 4} highlight={0} title="Announced, not yet peer-reviewed." /> },
  { at: w2("full") - 4, board: true, el: () => <EndCard m={M2} at={w2("full") - 4} /> },
];
export const Ci02Short2: React.FC = () => <ShortFrame t={T2} audio="ci02/shorts/s2.mp3" scenes={SC2} m={M2} cues={[K2[1].f]} />;
