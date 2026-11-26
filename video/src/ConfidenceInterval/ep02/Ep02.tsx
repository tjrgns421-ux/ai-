import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ArchivalPan, BarChart, Callout, CitationTag, HearsayChain, MeterKey, TextCard, Timeline } from "../components";
import { Board, EndScreen, EpisodeFrame, EpisodeSpec, Scene, Timing, timeHelpers } from "../Episode";
import { Checklist, NumberedCard } from "../ep01/Scenes";
import { Carved, Hammerscale, MapPatch, Places, Signal, ringData } from "./Scenes";
import TIMING from "./timing.json";

const T = TIMING as Timing;
const { L, Wd, frames } = timeHelpers(T);
export const CI02_FRAMES = frames;
const IMG = (n: string) => `ci02/img/${n}.jpg`;

export const NAMES = ["JOINED THE CROATOAN", "MOVED INLAND", "DIED", "LOST AT SEA"] as const;
export const QUESTION = "Did any of them survive?";

// numbers are the narrator's judgement (see script); "survived" = Croatoan + inland
export const KEYS: MeterKey[] = [
  { f: 0, v: null, main: null },
  { f: L(3) + 20, v: [25, 25, 25, 25], main: 50 },
  { f: L(16) + 10, v: [35, 25, 28, 12], main: 60 },
  { f: L(22) + 10, v: [31, 22, 36, 11], main: 53 },
  { f: L(26) + 10, v: [30, 21, 39, 10], main: 51 },
  { f: L(31) + 10, v: [30, 27, 34, 9], main: 57 },
  { f: L(36) + 10, v: [39, 24, 29, 8], main: 63 },
  { f: L(39) + 6, v: [37, 23, 31, 9], main: 60, band: [54, 66] },
  { f: L(39) + 50, v: [37, 23, 31, 9], main: 60, band: [45, 74], dur: 75 },
];
const CUES = KEYS.slice(2, 8).map((k) => k.f);

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140 }}>{children}</AbsoluteFill>
);

const RING = ringData();

const spec: EpisodeSpec = { id: "ci02", timing: T, keys: KEYS, names: NAMES, question: QUESTION, scenes: [] };
const B = (at: number, p: { highlight?: number; title?: string; appear?: number; stamp?: string } = {}) => ({ at, board: true, el: () => <Board spec={spec} at={at} {...p} /> });

const SCENES: Scene[] = [
  // hook
  { at: 0, el: (d) => <ArchivalPan src={IMG("arrival")} dur={d} from={[1.0, 0, 0]} to={[1.2, -2, -2]} fit="cover" fadeIn={40} /> },
  {
    at: L(2),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("arrival")} dur={d} from={[1.2, -2, -2]} to={[1.28, -3, -3]} fit="cover" dim={0.65} fadeIn={1} />
        <TextCard title="THE LOST COLONY" sub="Roanoke Island, 1587–1590" size={120} at={Wd(2, "I") - L(2)} />
      </>
    ),
  },
  B(L(3), { appear: L(3) + 20, title: "Four real explanations. Each one gets a number." }),
  // the story
  {
    at: L(4),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("map")} dur={d} from={[1.05, 0, 0]} to={[1.3, 3, 2]} fit="cover" />
        <Callout text="1587 · about 115 colonists" x={120} y={150} at={Wd(4, "about") - L(4)} />
        <CitationTag text="John White's map of the region (British Museum)" at={30} />
      </>
    ),
  },
  {
    at: L(5),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("dare")} dur={d} from={[1.05, 0, 0]} to={[1.15, 0, -2]} />
        <Callout text="Virginia Dare · August 1587" x={120} y={150} at={20} />
      </>
    ),
  },
  {
    at: L(6),
    el: () => (
      <Center>
        <Timeline from={1580} to={1620} step={10} marks={[{ year: 1587, label: "colony lands", at: 0 }]} />
      </Center>
    ),
  },
  {
    at: L(7),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("armada")} dur={d} from={[1.05, 0, 0]} to={[1.18, -2, 0]} fit="cover" />
        <Callout text="1588 · the Spanish Armada" x={120} y={150} at={Wd(7, "armada") - L(7)} />
      </>
    ),
  },
  {
    at: L(8),
    el: () => (
      <Center>
        <Timeline
          from={1580}
          to={1620}
          step={10}
          marks={[
            { year: 1587, label: "lands", at: -99 },
            { year: 1590, label: "White returns: empty", at: Wd(8, "settlement") - L(8) },
          ]}
        />
      </Center>
    ),
  },
  { at: L(9), el: () => <Places /> },
  B(L(10), { title: "One question: did any of them survive?" }),
  // evidence 1
  { at: L(11), el: () => <TextCard kicker="EVIDENCE 1" title="What White found" sub="August 1590" /> },
  {
    at: L(12),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("ruins")} dur={d} from={[1.05, 0, 0]} to={[1.18, 0, -2]} />
        <CitationTag text="19th-century engraving of the scene" at={20} />
      </>
    ),
  },
  { at: L(13), el: () => <Carved word="CRO" where="carved into a tree" /> },
  { at: Wd(13, "on") - 4, el: () => <Carved word="CROATOAN" where="carved on a palisade post" per={5} /> },
  { at: L(14), el: () => <Signal /> },
  {
    at: L(15),
    el: () => (
      <>
        <TextCard title="An orderly move, with a destination written down." size={84} />
        <CitationTag text="John White's 1590 account, printed by Hakluyt (1600)" at={20} />
      </>
    ),
  },
  B(L(16), { highlight: 0 }),
  {
    at: L(17),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("pinnace")} dur={d} from={[1.05, 0, 0]} to={[1.15, 1, -1]} fit="cover" dim={0.55} />
        <TextCard title="He never came back." />
      </>
    ),
  },
  // evidence 2
  { at: L(18), el: () => <TextCard kicker="EVIDENCE 2" title="Written in trees" /> },
  {
    at: L(19),
    el: () => (
      <>
        <Center>
          <BarChart data={RING} yLabel="rainfall index from bald cypress rings (schematic)" band={{ a: 1585, b: 1590, label: "1587–89", at: L(20) - L(19) + 20 }} note="shape only, after Stahle et al. 1998" />
        </Center>
        <CitationTag text="Stahle et al., Science, 1998" at={20} />
      </>
    ),
  },
  { at: L(21), el: () => <TextCard kicker="1587–1589" title="The worst three-year drought in 800 years" sub="The colony arrived at the start of it." size={84} /> },
  B(L(22), { highlight: 2 }),
  // evidence 3
  { at: L(23), el: () => <TextCard kicker="EVIDENCE 3" title="A story, treated like one" /> },
  {
    at: L(24),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("smithmap")} dur={d} from={[1.05, 0, 0]} to={[1.2, 0, 2]} fit="cover" />
        <CitationTag text="William Strachey, Historie of Travell into Virginia Britannia (c. 1612)" at={20} />
      </>
    ),
  },
  {
    at: L(25),
    el: () => (
      <HearsayChain
        per={40}
        hops={[
          { who: "The event", what: "killings among the Chesapeake, c. 1607" },
          { who: "Powhatan", what: "claimed it" },
          { who: "Jamestown", what: "the English heard it" },
          { who: "Strachey", what: "wrote it down" },
        ]}
        verdict="Secondhand, at best."
      />
    ),
  },
  B(L(26), { highlight: 2 }),
  // evidence 4
  { at: L(27), el: () => <TextCard kicker="EVIDENCE 4" title="Out of a museum drawer" /> },
  {
    at: L(28),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("map")} dur={d} from={[1.1, 2, 0]} to={[1.4, 6, 4]} fit="cover" />
        <CitationTag text="John White's map, British Museum · re-examined 2012" at={20} />
      </>
    ),
  },
  { at: Wd(28, "under") - 6, el: () => <MapPatch /> },
  {
    at: L(29),
    el: () => (
      <>
        <Places active={2} />
        <CitationTag text="First Colony Foundation, 'Site X', 2015" top at={20} />
      </>
    ),
  },
  { at: L(30), el: () => <TextCard title="A hidden mark, and English pottery where it points." sub="But pots also travel by trade." size={80} /> },
  B(L(31), { highlight: 1 }),
  // evidence 5
  { at: L(32), el: (d) => <><ArchivalPan src={IMG("village")} dur={d} fit="cover" dim={0.6} /><TextCard kicker="EVIDENCE 5" title="Back on Croatoan" /></> },
  {
    at: L(33),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("village")} dur={d} from={[1.05, 0, 0]} to={[1.25, 2, -2]} fit="cover" />
        <Callout text="guns · a sword piece · a writing slate" x={120} y={150} at={Wd(33, "parts") - L(33)} />
        <CitationTag text="Mark Horton & Scott Dawson, Hatteras excavations" at={20} />
      </>
    ),
  },
  {
    at: L(34),
    el: () => (
      <>
        <Hammerscale />
        <CitationTag text="announced by Dawson & Horton, 2025" top at={20} />
      </>
    ),
  },
  { at: L(35), el: () => <TextCard title="Trade can explain a sword." sub="It's harder to explain a blacksmith's workshop." size={92} /> },
  B(L(36), { highlight: 0 }),
  { at: L(37), el: () => <TextCard kicker="BUT" title="I have to argue against myself again." size={84} /> },
  {
    at: L(38),
    el: () => {
      const Cav: React.FC = () => {
        const f = useCurrentFrame() + L(38);
        return (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 46, paddingBottom: 140 }}>
            <NumberedCard n={1} text="Announced, not yet in a peer-reviewed paper (as far as I found)." />
            {f >= Wd(38, "other") && <NumberedCard n={2} text="Other archaeologists doubt a big influx during the drought." />}
            {f >= Wd(38, "dating") && <NumberedCard n={3} text="Dating soil layers is not dating people." />}
          </AbsoluteFill>
        );
      };
      return <Cav />;
    },
  },
  B(L(39), { title: "Doesn't flip the evidence. Less sure about everything." }),
  // verdict
  { at: L(40), el: () => <Checklist title="THE EVIDENCE" items={["the carved word", "the drought", "a secondhand story", "the hidden fort", "the blacksmith's flakes"]} /> },
  B(L(41), { highlight: 0 }),
  B(L(42), { highlight: 1 }),
  B(L(43), { highlight: 2 }),
  B(L(44), { highlight: 3 }),
  B(L(45), { stamp: "EP02 · NOV 2026", title: "About 60% sure some survived. Honest range: 45–74%." }),
  { at: L(46), el: () => <TextCard title="These options aren't exclusive." sub="115 people could have split up. My numbers are about where most of them went." size={84} /> },
  { at: L(47), el: () => <TextCard kicker="WHY I MIGHT BE WRONG" title="Three ways" /> },
  {
    at: L(48),
    el: () => {
      const Cards: React.FC = () => {
        const f = useCurrentFrame() + L(48);
        return (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 50, paddingBottom: 140 }}>
            <NumberedCard n={1} text="If the hammerscale dates don't hold, Croatoan loses most of its gain." />
            {f >= L(49) && <NumberedCard n={2} text="Both sites could be trade. No settler-only find yet, like an English grave." />}
            {f >= L(50) && <NumberedCard n={3} text="A DNA link to a colonist's family line would settle it. None shown yet." />}
          </AbsoluteFill>
        );
      };
      return <Cards />;
    },
  },
  { at: L(51), el: () => <TextCard title="Know evidence I missed?" sub="Put it in the comments. If it changes my number, I'll post the update and say why." /> },
  {
    at: L(52),
    el: () => <EndScreen spec={spec} at={L(52)} credit="Narration and visuals are AI-generated · images: public domain (de Bry 1590, John White, 19th-c. engravings)" />,
  },
];
spec.scenes = SCENES;

export const Ci02Full: React.FC = () => <EpisodeFrame spec={spec} cues={CUES} hideMiniFrom={L(52)} />;
export const CI02_SPEC = spec;
