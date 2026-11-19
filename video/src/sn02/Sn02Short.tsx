import React from "react";
import { Blip, DIM, INK, K, RED, Source, Stamp, T, pop, rise } from "../bc01/Bc01";
import words from "../../public/sn02s/narration.words.json";
import LINES from "../../public/sn02s/lines.json";
import { Beat, Cap, Stage, makeTimeline, srcOf } from "./engine";

// Vertical Shorts cut (9:16, ~45 s) of sn02. Same captures as the full video.

const CW = 1080;
const V = { cw: CW, width: 1010 };

const Plane: React.FC<{ lf: number; x: number; y: number }> = ({ lf, x, y }) => (
  <div style={{ position: "absolute", left: x + Math.min(lf, 10) * 9, top: y, rotate: "-8deg" }}>
    <svg width="300" height="185" viewBox="0 0 260 160"><path d="M10 80 L120 70 L170 10 L195 10 L170 72 L235 70 L250 45 L262 45 L255 80 L262 115 L250 115 L235 90 L170 88 L195 150 L170 150 L120 90 L10 80 Z" fill={INK} /></svg>
  </div>
);

const Tr: React.FC<{ lf: number; d: number; y: number; children: React.ReactNode }> = ({ lf, d, y, children }) => (
  <T y={y} size={52} center style={rise(lf, d)}><span style={{ color: DIM, fontSize: 28, display: "block" }}>TRANSLATION</span>{children}</T>
);

const B: Beat[] = [
  { at: "South Korea wants to pay", sfx: "whoosh", face: "shock", r: ({ lf, at }) => (<>
    <T y={300} size={64} center color={DIM} style={rise(lf)}>Korea wants to pay up to</T>
    <T y={400} size={190} center style={pop(lf, 4, 0.5)}><K>$75,000</K></T>
    <T y={640} size={72} center style={rise(lf, at("for one tip"))}>for one tip</T>
    <T y={740} size={72} center style={rise(lf, at("cheating"))}>about <K>exam cheating.</K></T>
  </>) },
  { at: "And a cheater could be banned", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-reward")} />
    <Cap name="kh-reward" lf={lf} dur={dur} y={300} {...V} marks={[["10 years", at("ten years")], ["up to 100 million won ($75,000)", 4]]} />
    <Stamp lf={lf} d={at("ten years")} text="10-YEAR BAN" x={150} y={620} rot={-6} size={96} color={RED} />
  </>) },
  { at: "The exam is the Suneung", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-count")} />
    <T y={260} size={130} center style={pop(lf, 2, 0.6)}>Suneung</T>
    <T y={420} size={50} center color={DIM} style={rise(lf, at("college entrance"))}>Korea's college entrance exam</T>
    <Cap name="kh-count" lf={lf} dur={dur} y={560} {...V} d={at("More than")} marks={[["551,864", at("five hundred fifty")]]} />
    <T y={800} size={150} center style={pop(lf, at("five hundred fifty"), 0.6)}><K>551,864</K></T>
  </>) },
  { at: "Planes stop during", sfx: "whoosh", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-planes")} />
    <Cap name="kh-planes" lf={lf} dur={dur} y={260} {...V} marks={[["1:05 p.m. to 1:40 p.m.", 6]]} />
    <Plane lf={lf} x={330} y={470} />
    <Cap name="kh-career" lf={lf} dur={dur} y={760} {...V} d={at("because")} marks={[["heavily influence career prospects", at("shape your")]]} />
    <T y={980} size={60} center style={rise(lf, at("shape your"))}>Your university can <K>shape your career</K></T>
  </>) },
  { at: "So why the bounty", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-trigger")} />
    <T y={260} size={80} center style={rise(lf)}>So why the bounty?</T>
    <Cap name="kh-trigger" lf={lf} dur={dur} y={430} {...V} d={at("Days before")} marks={[["confessed to cheating with the help of AI and digital devices", at("confessed")]]} />
    <T y={680} size={62} center style={rise(lf, at("confessed"))}>Tax-exam top scorer:</T>
    <T y={770} size={72} center style={rise(lf, at("hidden camera"))}><K>hidden camera + AI</K></T>
  </>) },
  { at: "But here's the catch", sfx: "stamp", face: "shock", r: ({ lf, at }) => (<>
    <T y={360} size={70} center color={DIM} style={rise(lf)}>But here's the catch.</T>
    <Stamp lf={lf} d={at("still a plan")} text="STILL A PLAN" x={140} y={520} rot={-5} size={96} color="#FFC93A" />
  </>) },
  { at: "The reward still needs", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={`${srcOf("yk-rules")} · ${srcOf("khm-law")}`} />
    <T y={240} size={62} center style={rise(lf)}>Reward: <K>needs new rules</K></T>
    <Cap name="yk-rules" lf={lf} dur={dur} y={340} {...V} marks={[["이번 수능부터 즉시 적용", 8]]} />
    <T y={560} size={62} center style={rise(lf, at("ten-year ban"))}>10-year ban: <K>needs a law</K></T>
    <Cap name="khm-law" lf={lf} dur={dur} y={660} {...V} d={at("ten-year ban")} marks={[["from one year to 10 years", at("new law")], ["fast-track the legislation", at("fast-track")]]} />
  </>) },
  { at: "From November twentieth", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("yk-tf")} />
    <Cap name="yk-tf" lf={lf} dur={dur} y={280} {...V} marks={[["20일부터", 4], ["글로벌 AI(인공지능) 기업·통신사", at("AI companies")]]} />
    <Tr lf={lf} d={at("task force")} y={560}>From Nov 20: task force<br /><K>+ AI companies</K></Tr>
  </>) },
  { at: "The full story", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <T y={360} size={64} center color={DIM} style={rise(lf)}>Full story + every source</T>
    <T y={470} size={110} center style={pop(lf, 4)}>BLIP CHECK <K>&gt;_</K></T>
    <T y={620} size={56} center style={rise(lf, 10)}>on the channel</T>
    <Blip lf={lf} face="prompt" x={300} y={760} size={480} />
  </>) },
];

const TL = makeTimeline(words, LINES as string[], B, 40);
export const SN02S_DURATION = TL.duration;
export const Sn02Short: React.FC = () => <Stage tl={TL} audio="sn02s/narration.mp3" vertical />;
