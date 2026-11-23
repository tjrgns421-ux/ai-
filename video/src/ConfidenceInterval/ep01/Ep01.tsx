import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../../StyleFrames";
import { C, FONT, FPS } from "../theme";
import {
  ArchivalPan,
  Callout,
  Captions,
  CitationTag,
  ConfidenceMeter,
  HypothesisCards,
  MeterKey,
  TextCard,
  Timeline,
  ZipfChart,
  ZipfSeries,
  groupWords,
  meterAt,
} from "../components";
import { Checklist, FiveScribes, Grille, Naibbe, NumberedCard, RepeatAndParts, SectionLabels, SectionStrip, SelfCitation, Sheets } from "./Scenes";
import TIMING from "./timing.json";

const L = (i: number) => Math.round(TIMING.lines[i - 1].start * FPS); // start frame of script line i (1-based)
const LEnd = (i: number) => Math.round((TIMING.lines[i - 1].start + TIMING.lines[i - 1].dur) * FPS);
// frame where word `w` (first match, case-insensitive prefix) is spoken in line i
const W = (i: number, w: string) => {
  const hit = TIMING.lines[i - 1].words.find((x) => x.t.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(w.toLowerCase()));
  return hit ? Math.round(hit.s * FPS) : L(i);
};
export const CI01_FRAMES = Math.round(TIMING.total * FPS);

const IMG = (n: string) => `ci01/img/${n}.jpg`;

/* ---------------- meter keyframes (numbers are the narrator's judgement, see script) */
const KEYS: MeterKey[] = [
  { f: 0, v: null, main: null },
  { f: L(3) + 20, v: [25, 25, 25, 25], main: 50 },
  { f: W(10, "to") + 6, v: [1, 33, 33, 33], main: 66, dur: 45 },
  { f: L(16) + 30, v: [1, 24, 37, 38], main: 75 },
  { f: L(21) + 25, v: [1, 42, 27, 30], main: 57 },
  { f: L(26) + 10, v: [1, 37, 29, 33], main: 62 },
  { f: L(31) + 10, v: [1, 33, 36, 30], main: 66 },
  { f: L(36) + 6, v: [1, 34, 34, 31], main: 65, band: [60, 70] },
  { f: L(36) + 50, v: [1, 34, 34, 31], main: 65, band: [50, 78], dur: 75 },
];
const CUES = KEYS.slice(2).filter((k, i) => i !== 6).map((k) => k.f); // soft sound on each meter move

/* ---------------- scene list: each runs until the next one starts */
type Scene = { at: number; board?: boolean; el: (dur: number) => React.ReactNode };

const Board: React.FC<{ at: number; highlight?: number; title?: string; appear?: number; stamp?: string }> = ({ at, highlight = -1, title, appear, stamp }) => {
  const f = useCurrentFrame();
  const s = meterAt(KEYS, f + at);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
      <ConfidenceMeter s={s} width={1300} />
      <div style={{ height: 120 }} />
      <HypothesisCards s={s} appear={appear !== undefined ? appear - at : -999} highlight={highlight} />
      {title && <div style={{ marginTop: 40, color: C.sub, fontFamily: FONT, fontSize: 32, fontWeight: 600 }}>{title}</div>}
      {stamp && <div style={{ position: "absolute", top: 50, left: 70, color: C.dim, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4 }}>{stamp}</div>}
    </AbsoluteFill>
  );
};

const QuickCuts: React.FC = () => {
  const f = useCurrentFrame();
  const cuts: [string, number][] = [
    ["herbal", 0],
    ["zodiac", 1],
    ["rosettes", 1],
    ["balneo", 2],
    ["pharma", 3],
    ["recipes", 4],
  ];
  const per = Math.round((LEnd(4) - L(4)) / cuts.length);
  const k = Math.min(cuts.length - 1, Math.floor(f / per));
  return (
    <AbsoluteFill>
      <Sequence from={k * per} key={k}>
        <ArchivalPan src={IMG(cuts[k][0])} dur={per + 10} from={[1.05, 0, 0]} to={[1.16, k % 2 ? 2 : -2, -2]} fadeIn={6} />
      </Sequence>
      <SectionLabels active={cuts[k][1]} />
    </AbsoluteFill>
  );
};

// Zipf data: ideal 1/rank curve with small deterministic wobble — schematic, not measured counts
const zipf = (seed: number, a: number, wob: number): [number, number][] =>
  Array.from({ length: 70 }).map((_, i) => {
    const r = Math.round(Math.pow(10, (i / 69) * 3));
    const q = 0.07 * Math.pow(r, -a) * (1 + wob * Math.sin(i * 1.3 + seed));
    return [r, q];
  });
const ZIPF: ZipfSeries[] = [
  { name: "English", pts: zipf(1, 1.0, 0.18), color: C.sub },
  { name: "Latin", pts: zipf(2, 0.97, 0.2), color: "#7FA3B8" },
  { name: "Voynich", pts: zipf(3, 1.02, 0.22), color: C.amber },
];

const SCENES: Scene[] = [
  // 0:00 hook
  { at: 0, el: (d) => <ArchivalPan src={IMG("f1r")} dur={d} from={[1.0, 0, 2]} to={[1.22, 0, -3]} fadeIn={40} /> },
  {
    at: L(2),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("f1r")} dur={d} from={[1.22, 0, -3]} to={[1.3, 0, -5]} dim={0.6} fadeIn={1} />
        <TextCard title="THE VOYNICH MANUSCRIPT" sub="Beinecke Library, MS 408" size={110} at={W(2, "I") - L(2)} />
      </>
    ),
  },
  // 0:20 the turn
  { at: L(3), board: true, el: () => <Board at={L(3)} appear={L(3) + 20} title="Four real explanations. Each one gets a number." /> },
  // context
  { at: L(4), el: () => <QuickCuts /> },
  {
    at: L(5),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("voynich")} dur={d} from={[1.0, 0, 0]} to={[1.1, 0, -1]} />
        <Callout text="Wilfrid Voynich · bought it 1912" x={120} y={860} at={20} />
      </>
    ),
  },
  // 1:30 evidence 1
  {
    at: L(6),
    el: (d) => (
      <>
        <ArchivalPan src={IMG("voynich")} dur={d} from={[1.1, 0, -1]} to={[1.14, 0, -1]} dim={0.75} fadeIn={1} />
        <TextCard kicker="EVIDENCE 1" title="The date" sub="Was it forged by the man who found it?" />
      </>
    ),
  },
  {
    at: L(7),
    el: () => (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 120 }}>
        <Timeline band={{ a: 1404, b: 1438, label: "Parchment, 95% range — Univ. of Arizona, 2009", at: W(7, "1404") - L(7) }} />
        <CitationTag text="Radiocarbon dating · University of Arizona · 2009 · 4 samples" at={20} />
      </AbsoluteFill>
    ),
  },
  {
    at: W(8, "tucked") - 10,
    el: (d) => (
      <>
        <ArchivalPan src={IMG("marci")} dur={d} from={[1.05, -2, 3]} to={[1.25, 2, -4]} />
        <Callout text="1665/66" x={1450} y={160} at={W(8, "1665") - W(8, "tucked") + 10} size={60} />
        <Callout text="claim: Rudolf II, 600 ducats" x={1050} y={860} at={W(8, "rudolf") - W(8, "tucked") + 10} />
        <CitationTag text="Marci to Kircher, kept with Beinecke MS 408" top at={30} />
      </>
    ),
  },
  {
    at: L(9),
    el: () => (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 120 }}>
        <Timeline
          band={{ a: 1404, b: 1438, label: "parchment", at: -999 }}
          marks={[
            { year: 1666, label: "Marci letter", at: 0 },
            { year: 1912, label: "Voynich buys it", at: 30 },
          ]}
        />
        <CitationTag text="Ink & paint analysis · McCrone Associates · 2009" at={W(9, "ink") - L(9)} />
      </AbsoluteFill>
    ),
  },
  { at: L(10), board: true, el: () => <Board at={L(10)} highlight={0} /> },
  // 3:10 evidence 2
  { at: L(12), el: () => <TextCard kicker="EVIDENCE 2" title="It behaves like language" sub="Does the text actually say something?" /> },
  {
    at: L(13),
    el: () => (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140 }}>
        <div style={{ color: C.ink, fontFamily: FONT, fontSize: 44, fontWeight: 900, marginBottom: 10 }}>Zipf&apos;s law</div>
        <ZipfChart series={ZIPF} at={W(13, "zipf") - L(13) - 40} note="schematic" />
      </AbsoluteFill>
    ),
  },
  {
    at: L(14),
    el: () => (
      <>
        <SectionStrip />
        <CitationTag text="Montemurro & Zanette, PLoS ONE, 2013" at={W(14, "they") - L(14)} />
      </>
    ),
  },
  { at: L(15), el: () => <TextCard kicker="MONTEMURRO & ZANETTE, 2013" title="This structure supports the presence of a genuine message." size={76} /> },
  { at: L(16), board: true, el: () => <Board at={L(16)} /> },
  // 4:40 evidence 3
  { at: L(17), el: () => <TextCard kicker="EVIDENCE 3" title="…or does it?" /> },
  { at: L(18), el: () => <RepeatAndParts split={W(18, "words") - L(18)} /> },
  {
    at: L(19),
    el: () => (
      <>
        <Grille />
        <CitationTag text="Rugg, Cryptologia, 2004" at={20} />
      </>
    ),
  },
  {
    at: L(20),
    el: () => (
      <>
        <SelfCitation />
        <CitationTag text="Timm & Schinner, Cryptologia, 2020" at={20} />
      </>
    ),
  },
  { at: L(21), board: true, el: () => <Board at={L(21)} highlight={1} /> },
  { at: L(22), el: () => <TextCard title="Both papers are serious." sub="They can't both be right. Neither has knocked the other out." /> },
  // 6:30 evidence 4
  { at: L(23), el: () => <TextCard kicker="EVIDENCE 4" title="Five hands" sub="Not the words. The handwriting." /> },
  {
    at: L(24),
    el: () => (
      <>
        <FiveScribes />
        <CitationTag text="L. F. Davis, Manuscript Studies, 2020" at={20} />
      </>
    ),
  },
  { at: L(25), el: () => <TextCard title="One prankster: easy." sub="Five scribes, 240 pages, consistent nonsense: harder. Not impossible." /> },
  { at: L(26), board: true, el: () => <Board at={L(26)} /> },
  // 7:40 evidence 5
  { at: L(27), el: () => <TextCard kicker="EVIDENCE 5" title="A cipher you can run with dice" /> },
  { at: L(28), el: () => <TextCard kicker="THE OLD OBJECTION" title="“No known medieval cipher looks like this.”" size={80} /> },
  {
    at: L(29),
    el: () => (
      <>
        <Naibbe />
        <CitationTag text="Greshko, Cryptologia, 2025 · the Naibbe cipher" at={20} />
      </>
    ),
  },
  { at: L(30), el: () => <Checklist title="THE OUTPUT REPRODUCES" items={["symbol frequencies", "word lengths", "where glyphs sit in a word"]} /> },
  { at: L(31), board: true, el: () => <Board at={L(31)} highlight={2} title="“No real cipher could look like this” — no longer true." /> },
  // 9:00 evidence 6
  { at: L(32), el: () => <TextCard kicker="EVIDENCE 6 · OCTOBER 2026" title="We may have been reading it in the wrong order" size={84} /> },
  {
    at: L(33),
    el: () => (
      <>
        <Sheets mode="mixed" label="schematic: scribe changes page to page in the current binding" />
        <CitationTag text="Layfield & Davis, Digital Medievalist, 2026" at={20} />
      </>
    ),
  },
  {
    at: L(34),
    el: () => (
      <>
        <Sheets mode="unbind" label="loose folded sheets, one scribe each (schematic)" />
        <CitationTag text="Layfield & Davis, “Singulion Structure and the Voynich Manuscript”, 2026" at={20} />
      </>
    ),
  },
  { at: L(35), el: () => <TextCard title="Most statistics were measured on the current order." sub="If that order is wrong, some were taken on a shuffled book." size={76} /> },
  { at: L(36), board: true, el: () => <Board at={L(36)} title="Doesn't help either side. Less sure about everything." /> },
  // 10:10 verdict
  {
    at: L(37),
    el: () => (
      <Checklist
        title="THE EVIDENCE"
        items={["carbon dating", "word statistics", "self-citation", "five scribes", "dice-and-cards cipher", "wrong order"]}
      />
    ),
  },
  { at: L(38), board: true, el: () => <Board at={L(38)} highlight={0} /> },
  { at: L(39), board: true, el: () => <Board at={L(39)} highlight={1} /> },
  { at: L(40), board: true, el: () => <Board at={L(40)} highlight={2} /> },
  { at: L(41), board: true, el: () => <Board at={L(41)} highlight={3} /> },
  { at: L(42), board: true, el: () => <Board at={L(42)} stamp="EP01 · NOV 2026" title="About 65% sure it says something. Honest range: 50–78%." /> },
  // 10:50 why I might be wrong
  { at: L(43), el: () => <TextCard kicker="WHY I MIGHT BE WRONG" title="Three ways" /> },
  {
    at: L(44),
    el: () => {
      const Cards: React.FC = () => {
        const f = useCurrentFrame() + L(44);
        return (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 50, paddingBottom: 140 }}>
            <NumberedCard n={1} text="I'm weighing papers, not reading the book." />
            {f >= L(45) && <NumberedCard n={2} text="Self-citation may also explain the topic clustering." />}
            {f >= L(46) && <NumberedCard n={3} text="One testable decipherment of one full page ends all of this." />}
          </AbsoluteFill>
        );
      };
      return <Cards />;
    },
  },
  { at: L(47), el: () => <TextCard title="Know evidence I missed?" sub="Put it in the comments. If it changes my number, I'll post the update and say why." /> },
  {
    at: L(48),
    el: () => {
      const End: React.FC = () => {
        const f = useCurrentFrame();
        const s = meterAt(KEYS, f + L(48));
        const a = interpolate(f, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 90, paddingBottom: 60 }}>
            <ConfidenceMeter s={s} width={1200} />
            <div style={{ opacity: a, color: C.ink, fontFamily: FONT, fontSize: 96, fontWeight: 900, letterSpacing: 10 }}>CONFIDENCE INTERVAL</div>
            <div style={{ opacity: a, color: C.dim, fontFamily: FONT, fontSize: 28, fontWeight: 600 }}>Narration and visuals are AI-generated · scans: Beinecke MS 408 (public domain)</div>
          </AbsoluteFill>
        );
      };
      return <End />;
    },
  },
];

const CAPTIONS = groupWords(TIMING.lines.flatMap((l) => l.words), 7);

const MiniMeter: React.FC = () => {
  const f = useCurrentFrame();
  const idx = SCENES.findIndex((s, i) => f >= s.at && f < (SCENES[i + 1]?.at ?? 1e9));
  if (idx < 0 || SCENES[idx].board || f >= L(48)) return null;
  const a = interpolate(f, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 46, right: 60, padding: "16px 22px", background: "rgba(20,20,19,0.86)", border: `1px solid ${C.line}`, borderRadius: 10, opacity: a }}>
      <ConfidenceMeter s={meterAt(KEYS, f)} width={340} big={false} />
    </div>
  );
};

export const Ci01Full: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {SCENES.map((s, i) => {
        const end = SCENES[i + 1]?.at ?? CI01_FRAMES;
        return (
          <Sequence key={i} from={s.at} durationInFrames={end - s.at}>
            {s.el(end - s.at)}
          </Sequence>
        );
      })}
      <MiniMeter />
      <Captions groups={CAPTIONS} fps={FPS} />
      <Html5Audio src={staticFile("ci01/narration.mp3")} />
      <Html5Audio src={staticFile("ci01/bed.mp3")} volume={0.16} />
      {CUES.map((f) => (
        <Sequence key={f} from={f} durationInFrames={20}>
          <Html5Audio src={staticFile("sfx/ding.wav")} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
