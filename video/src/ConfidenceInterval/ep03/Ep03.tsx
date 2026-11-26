import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ArchivalPan, Callout, CitationTag, HearsayChain, KnownUnknown, MeterKey, TextCard, Timeline } from "../components";
import { Board, EndScreen, EpisodeFrame, EpisodeSpec, Scene, Timing, timeHelpers } from "../Episode";
import { Checklist, NumberedCard } from "../ep01/Scenes";
import { BarredWindow, FamilyTree, GoldChain, TyrrellLink } from "./Scenes";
import TIMING from "./timing.json";

const T = TIMING as Timing;
const { L, Wd, frames } = timeHelpers(T);
export const CI03_FRAMES = frames;
const IMG = (n: string) => `ci03/img/${n}.jpg`;

export const NAMES = ["RICHARD III ORDERED IT", "SOMEONE ELSE", "ILLNESS", "ONE SURVIVED"] as const;
export const QUESTION = "Did Richard III do it?";

// numbers are the narrator's judgement (see script); the big meter shows hypothesis 1
const k = (f: number, v: [number, number, number, number], band?: [number, number], dur?: number): MeterKey => ({ f, v, main: v[0], band, dur });
export const KEYS: MeterKey[] = [
  { f: 0, v: null, main: null },
  k(L(3) + 20, [25, 25, 25, 25]),
  k(L(14) + 10, [35, 22, 20, 23]),
  k(L(19) + 10, [42, 22, 16, 20]),
  k(L(24) + 10, [46, 21, 15, 18]),
  k(L(29) + 10, [53, 19, 13, 15]),
  k(L(34) + 10, [47, 18, 12, 23]),
  k(L(39) + 6, [49, 18, 12, 21], [42, 56]),
  k(L(39) + 50, [49, 18, 12, 21], [35, 63], 75),
];
const CUES = KEYS.slice(2, 8).map((x) => x.f);

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140 }}>{children}</AbsoluteFill>
);
const Staged: React.FC<{ base: number; items: { from: number; n: number; text: string }[] }> = ({ base, items }) => {
  const f = useCurrentFrame() + base;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 50, paddingBottom: 140 }}>
      {items.filter((i) => f >= i.from).map((i) => (
        <NumberedCard key={i.n} n={i.n} text={i.text} />
      ))}
    </AbsoluteFill>
  );
};

const spec: EpisodeSpec = { id: "ci03", timing: T, keys: KEYS, names: NAMES, question: QUESTION, scenes: [] };
const B = (at: number, p: { highlight?: number; title?: string; appear?: number; stamp?: string } = {}): Scene => ({ at, board: true, el: () => <Board spec={spec} at={at} {...p} /> });
const TL = (marks: { year: number; label: string; at?: number }[]) => (
  <Center>
    <Timeline from={1480} to={1500} step={5} marks={marks} />
  </Center>
);

const SCENES: Scene[] = [
  { at: 0, el: (d) => <ArchivalPan src={IMG("millais")} dur={d} from={[1.0, 0, 3]} to={[1.25, 0, -2]} fadeIn={40} /> },
  {
    at: L(2),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("tower")} dur={d} from={[1.05, 0, 0]} to={[1.15, -2, 0]} fit="cover" dim={0.6} />
        <TextCard title="THE PRINCES IN THE TOWER" sub="London, 1483" size={110} at={Wd(2, "I") - L(2)} />
      </>
    ),
  },
  B(L(3), { appear: L(3) + 20, title: "Four real explanations. Each one gets a number." }),
  { at: L(4), el: () => <FamilyTree /> },
  {
    at: L(5),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("tower")} dur={d} from={[1.1, 2, 0]} to={[1.35, -3, 2]} fit="cover" />
        <CitationTag text="The Tower of London, engraving by S. & N. Buck (18th c.)" at={20} />
      </>
    ),
  },
  {
    at: L(6),
    el: () =>
      TL([
        { year: 1483, label: "Richard III crowned", at: Wd(6, "july") - L(6) },
      ]),
  },
  { at: L(7), el: (d) => <ArchivalPan src={IMG("delaroche")} dur={d} from={[1.05, 0, 0]} to={[1.2, 2, -2]} fit="cover" dim={0.2} /> },
  B(L(8), { title: "Did Richard III do it?" }),
  // evidence 1
  { at: L(9), el: () => <TextCard kicker="EVIDENCE 1" title="The closest thing to an eyewitness" /> },
  {
    at: L(10),
    el: () => (
      <>
        <TextCard kicker="DOMINIC MANCINI" title="In London, spring–summer 1483" sub="Report written by December 1483 · found in Lille in 1934" size={84} />
        <CitationTag text="Mancini, De occupatione regni Anglie (1483)" at={20} />
      </>
    ),
  },
  { at: L(11), el: (d) => <BarredWindow dur={d} /> },
  { at: L(12), el: () => <TextCard kicker="FROM THE KING'S DOCTOR, VIA MANCINI" title="Daily confession, “because he believed that death was facing him”" size={76} /> },
  { at: L(13), el: () => <TextCard title="Mancini doesn't say they were killed." sub="He says he doesn't know. But he wrote with no Tudor king to please." size={84} /> },
  B(L(14), { highlight: 0 }),
  // evidence 2
  { at: L(15), el: () => <TextCard kicker="EVIDENCE 2" title="What didn't happen" /> },
  {
    at: L(16),
    el: () =>
      TL([
        { year: 1483, label: "rumours they are dead · Buckingham's rebellion", at: 10 },
      ]),
  },
  { at: L(17), el: (d) => <><ArchivalPan src={IMG("richard")} dur={d} from={[1.05, 0, 0]} to={[1.15, 0, -2]} /><Callout text="no public proof of life, 1483–1485" x={120} y={150} at={30} /></> },
  { at: L(18), el: () => <TextCard title="Not proof." sub="But a king with two living nephews had every reason to produce them." size={92} /> },
  B(L(19), { highlight: 0 }),
  // evidence 3
  { at: L(20), el: () => <TextCard kicker="EVIDENCE 3" title="Bones" /> },
  {
    at: L(21),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("tower")} dur={d} from={[1.4, -6, 2]} to={[1.6, -8, 3]} fit="cover" />
        <Callout text="1674 · two children's skeletons under a stair" x={120} y={150} at={20} />
      </>
    ),
  },
  {
    at: L(22),
    el: () => (
      <KnownUnknown
        title="WESTMINSTER ABBEY URN · EXAMINED 1933"
        known={["two children", "about the right ages"]}
        unknown={["their sex", "their century", "DNA (never allowed)"]}
        split={Wd(23, "but") - L(22)}
      />
    ),
  },
  B(L(24), { highlight: 0 }),
  // evidence 4
  { at: L(25), el: () => <TextCard kicker="EVIDENCE 4" title="The story everyone knows" sub="and where it came from" /> },
  {
    at: L(26),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("northcote")} dur={d} from={[1.05, 0, 0]} to={[1.15, 0, -2]} />
        <CitationTag text="Thomas More, History of King Richard III (c. 1513) · painting: Northcote, 1805" at={20} />
      </>
    ),
  },
  { at: L(27), el: (d) => <><ArchivalPan src={IMG("more")} dur={d} from={[1.05, 0, 0]} to={[1.15, 0, -1]} /><Callout text="writing under the Tudors" x={120} y={150} at={20} /></> },
  {
    at: L(28),
    el: () => (
      <>
        <HearsayChain
          per={45}
          hops={[
            { who: "Forest & Dighton", what: "named by More as the killers" },
            { who: "Forest's sons?", what: "at the Tudor court, c. 1510s" },
            { who: "Thomas More", what: "wrote the story, c. 1513" },
          ]}
          verdict="A plausible source. Not proof."
        />
        <CitationTag text="Thornton, 'More on a Murder', History (2021)" at={20} />
      </>
    ),
  },
  B(L(29), { highlight: 0 }),
  // against
  { at: L(30), el: () => <TextCard kicker="BUT" title="I have to argue against myself." size={84} /> },
  {
    at: L(31),
    el: () => (
      <>
        <TextCard kicker="PHILIPPA LANGLEY · 2023" title="“Both princes alive after 1485”" sub="Her reading of documents from Dutch and other European archives" size={84} />
        <CitationTag text="Langley, The Princes in the Tower (2023)" at={20} />
      </>
    ),
  },
  { at: L(32), el: (d) => <><ArchivalPan src={IMG("warbeck")} dur={d} from={[1.05, 0, 0]} to={[1.15, 0, -2]} /><Callout text="'Richard, Duke of York' = Perkin Warbeck · executed 1499" x={120} y={150} at={Wd(32, "history") - L(32)} /></> },
  {
    at: L(33),
    el: () => (
      <KnownUnknown
        title="THE GELDERLAND DOCUMENT"
        known={["real archival material", "contemporary with the pretender"]}
        unknown={["who wrote it, and why", "independent of his own claim", "agreed by the Dutch researchers"]}
        split={Wd(33, "and") - L(33)}
      />
    ),
  },
  B(L(34), { highlight: 3 }),
  // evidence 6
  { at: L(35), el: () => <TextCard kicker="EVIDENCE 6" title="One line in a will" /> },
  {
    at: L(36),
    el: () => (
      <>
        <GoldChain />
        <CitationTag text="Thornton, 'Sir William Capell and a Royal Chain', History (2024)" at={20} />
      </>
    ),
  },
  { at: L(37), el: () => <TyrrellLink /> },
  { at: L(38), el: () => <TextCard title="Suggestive." sub="But the chain is lost, and we don't know how it travelled." size={92} /> },
  B(L(39), { title: "The newest evidence, on both sides, is the hardest to check." }),
  // verdict
  { at: L(40), el: () => <Checklist title="THE EVIDENCE" items={["the eyewitness report", "no proof of life", "the bones", "More's sources", "the Dutch documents", "the chain"]} /> },
  B(L(41), { highlight: 0 }),
  B(L(42), { highlight: 1 }),
  B(L(43), { highlight: 2 }),
  B(L(44), { highlight: 3 }),
  B(L(45), { stamp: "EP03 · NOV 2026", title: "About 49% sure it was Richard III. Honest range: 35–63%." }),
  { at: L(46), el: () => <TextCard title="The most likely single answer." sub="Not more likely than all the others put together." size={88} /> },
  { at: L(47), el: () => <TextCard kicker="WHY I MIGHT BE WRONG" title="Three ways" /> },
  {
    at: L(48),
    el: () => (
      <Staged
        base={L(48)}
        items={[
          { from: L(48), n: 1, text: "Tested bones of the wrong age or century would cancel what they gave Richard." },
          { from: L(49), n: 2, text: "A proof of life from someone with no reason to lie: survival past 50." },
          { from: L(50), n: 3, text: "A DNA match to Edward IV's family line would nearly settle it." },
        ]}
      />
    ),
  },
  { at: L(51), el: () => <TextCard title="Know evidence I missed?" sub="Put it in the comments. If it changes my number, I'll post the update and say why." /> },
  { at: L(52), el: () => <EndScreen spec={spec} at={L(52)} credit="Narration and visuals are AI-generated · images: public domain paintings and engravings" /> },
];
spec.scenes = SCENES;

export const Ci03Full: React.FC = () => <EpisodeFrame spec={spec} cues={CUES} hideMiniFrom={L(52)} />;
