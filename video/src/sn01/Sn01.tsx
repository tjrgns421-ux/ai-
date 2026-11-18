import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../StyleFrames";
import words from "../../public/sn01/narration.words.json";
import LINESJ from "../../public/sn01/lines.json";
import { BG, Blip, DIM, Face, INK, K, LIME, RED, Shot, Source, Stamp, T, clamp, outExpo, pop, rise } from "../bc01/Bc01";

// Blip Check: Suneung vs AI cheating. 16:9 explainer. Every fact on screen is a real capture.
// Name and neighbourhood of the tax-exam test-taker are redacted in the captures.

const FPS = 30;
type W = { text: string; start: number; end: number };
const WORDS = words as W[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
let BIG = "";
const OWNER: number[] = [];
WORDS.forEach((w, i) => {
  for (const c of norm(w.text)) {
    BIG += c;
    OWNER.push(i);
  }
});
const timeOf = (phrase: string, after = 0): number => {
  const n = norm(phrase);
  let from = 0;
  for (;;) {
    const at = BIG.indexOf(n, from);
    if (at < 0) throw new Error(`phrase not found: ${phrase}`);
    const t = WORDS[OWNER[at]].start;
    if (t >= after - 0.05) return t;
    from = at + 1;
  }
};
const f = (s: number) => Math.round(s * FPS);
export const SN01_DURATION = f(WORDS[WORDS.length - 1].end) + 45;

type Ctx = { lf: number; dur: number; at: (p: string) => number };
type Beat = { at: string; sfx?: string; face?: Face; noHost?: boolean; r: (c: Ctx) => React.ReactNode };

const JA = "Korea JoongAng Daily, Nov 16 2026";
const AP = "Associated Press (via ABC News), Nov 17 2026";
const JO = "Korea JoongAng Daily / Yonhap, Oct 20 2026";
// paragraph shot helpers: 2400-px-wide (JoongAng) and 1488-px-wide (AP / Star) captures
const W24 = (src: string, h: number) => ({ src: `sn01/${src}.png`, w: 2400, h, scale: 0.72, x: (1920 - 2400 * 0.72 - 44) / 2 });
const W15 = (src: string, h: number) => ({ src: `sn01/${src}.png`, w: 1488, h, scale: 1.15, x: (1920 - 1488 * 1.15 - 44) / 2 });

const Plane: React.FC<{ lf: number; stop: number; x: number; y: number }> = ({ lf, stop, x, y }) => {
  const k = lf < stop ? lf : stop;
  const px = x + k * 9;
  return (
    <div style={{ position: "absolute", left: px, top: y, fontFamily: "Pretendard", fontWeight: 900, fontSize: 180, color: INK, rotate: "-8deg" }}>
      <svg width="260" height="160" viewBox="0 0 260 160"><path d="M10 80 L120 70 L170 10 L195 10 L170 72 L235 70 L250 45 L262 45 L255 80 L262 115 L250 115 L235 90 L170 88 L195 150 L170 150 L120 90 L10 80 Z" fill={INK} /></svg>
    </div>
  );
};

const Phone: React.FC<{ lf: number; d: number; x: number; y: number }> = ({ lf, d, x, y }) => {
  const on = lf >= d;
  const shake = on ? Math.sin(lf * 2.2) * 10 : 0;
  return (
    <div style={{ position: "absolute", left: x + shake, top: y, width: 200, height: 360, borderRadius: 36, border: `10px solid ${INK}`, background: on ? "#2a2f1a" : "#111", boxShadow: on ? `0 0 60px ${LIME}` : "none", ...pop(lf, 0) }}>
      <div style={{ position: "absolute", left: 20, right: 20, top: 40, borderRadius: 14, background: on ? RED : "transparent", color: INK, fontFamily: "Pretendard", fontWeight: 900, fontSize: 26, padding: 12, textAlign: "center" }}>{on ? "EMERGENCY ALERT" : ""}</div>
    </div>
  );
};

const B: Beat[] = [
  { at: "On exam day", sfx: "whoosh", face: "shock", r: ({ lf, at }) => (<>
    <T y={150} size={70} color={DIM} style={rise(lf)}>On exam day…</T>
    <Plane lf={lf} stop={at("Not for a storm")} x={160} y={360} />
    <Stamp lf={lf} d={at("taking off")} text="STOP" x={760} y={380} rot={-8} size={120} color={RED} />
    <T y={700} size={90} style={rise(lf, at("For a test"))}>Not for a storm. <K>For a test.</K></T>
  </>) },
  { at: "More than five hundred", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={JO} />
    <Shot lf={lf} dur={dur} {...W24("jo-count", 190)} y={170} marks={[{ x: 22, y: 73, w: 493, h: 40, at: 4 }]} />
    <T y={480} size={170} style={pop(lf, 6, 0.6)}><K>550,000+</K></T>
    <T y={680} size={60} style={rise(lf, at("high alert"))}>This year's worry: <K c={RED}>AI</K></T>
  </>) },
  { at: "It started with a different exam", sfx: "whoosh", face: "meh", r: ({ lf }) => (<>
    <T y={330} size={96} style={rise(lf)}>It started with a</T>
    <T y={450} size={96} style={rise(lf, 4)}><K>different exam.</K></T>
    <T y={600} size={50} color={DIM} style={rise(lf, 10)}>Korea's national tax accountant exam</T>
  </>) },
  { at: "The top scorer on Korea's", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={JA} />
    <Shot lf={lf} dur={dur} src="sn01/h-ja.png" w={2219} h={248} scale={0.74} x={(1920 - 2219 * 0.74 - 44) / 2} y={200} />
    <T y={520} size={66} style={rise(lf, at("admitted"))}>Top scorer <K>admitted</K> cheating with AI</T>
    <T y={620} size={44} color={DIM} style={rise(lf, at("YouTube channel"))}>in a video on his lawyer's YouTube channel</T>
  </>) },
  { at: "He says a hidden camera", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={JA} />
    <Shot lf={lf} dur={dur} {...W24("ja-confess", 192)} y={170} marks={[{ x: 267, y: 73, w: 1114, h: 40, at: at("hidden camera") }]} />
    {["hidden camera", "AI tool", "answers"].map((t, i) => (
      <React.Fragment key={t}>
        <div style={{ position: "absolute", left: 230 + i * 520, top: 520, width: 400, padding: "30px 0", textAlign: "center", borderRadius: 24, border: `4px solid ${i === 1 ? LIME : "rgba(255,255,255,0.4)"}`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 54, color: i === 1 ? LIME : INK, ...pop(lf, at(["hidden camera", "an AI tool", "he received"][i])) }}>{t}</div>
        {i < 2 && <div style={{ position: "absolute", left: 650 + i * 520, top: 545, fontFamily: "Pretendard", fontWeight: 900, fontSize: 70, color: DIM, ...rise(lf, at(["an AI tool", "he received"][i])) }}>→</div>}
      </React.Fragment>
    ))}
  </>) },
  { at: "According to Korean media", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={JA} />
    <Shot lf={lf} dur={dur} {...W24("ja-score-r", 354)} y={130} marks={[{ x: 22, y: 127, w: 675, h: 40, at: at("one hundred fifty-nine") }]} />
    <T y={620} size={200} center style={pop(lf, at("one hundred fifty-nine"), 0.5)}><K>159</K> / 160</T>
  </>) },
  { at: "He later gave police", sfx: "whoosh", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text="Seoul Economic Daily, Nov 18 2026 (personal details redacted)" />
    <Shot lf={lf} dur={dur} src="sn01/sed-raid-r.png" w={1720} h={138} scale={1.0} x={78} y={260} marks={[{ x: 212, y: 47, w: 488, h: 38, at: at("searched his home") }]} />
    <Stamp lf={lf} d={at("investigation is ongoing")} text="INVESTIGATION ONGOING" x={420} y={560} rot={-4} size={72} color="#FFC93A" />
  </>) },
  { at: "And it may not stop there", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={JA} />
    <Shot lf={lf} dur={dur} {...W24("ja-expand", 243)} y={200} marks={[{ x: 301, y: 19, w: 511, h: 40, at: at("could expand") }]} />
    <T y={560} size={70} style={rise(lf, at("could expand"))}>The probe <K>could expand</K> to other national exams</T>
  </>) },
  { at: "Days later all eyes", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<>
    <Shot lf={lf} dur={60} src="sn01/h-nbc.png" w={2232} h={212} scale={0.55} x={90} y={150} tilt={-2} />
    <Shot lf={lf} dur={60} src="sn01/h-ap.png" w={2232} h={212} scale={0.55} x={420} y={400} tilt={2} d={4} />
    <Shot lf={lf} dur={60} src="sn01/h-aj.png" w={1471} h={232} scale={0.6} x={150} y={640} tilt={-1} d={8} />
  </>) },
  { at: "To see why", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={360} size={110} center style={rise(lf)}>How big is <K>Suneung day?</K></T>
  </>) },
  { at: "The exam runs from", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={JO} />
    <Shot lf={lf} dur={dur} {...W24("jo-count", 190)} y={200} marks={[{ x: 1119, y: 73, w: 459, h: 40, at: 4 }, { x: 22, y: 127, w: 66, h: 40, at: 8 }]} />
    <T y={520} size={170} center style={pop(lf, 6, 0.6)}>8:40 <K>→</K> 5:45</T>
  </>) },
  { at: "Offices are asked", sfx: "whoosh", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur + 90} {...W15("ap-day", 182)} y={240} marks={[{ x: 982, y: 36, w: 430, h: 34, at: at("start work later") }, { x: 0, y: 72, w: 245, h: 34, at: at("stock market") }]} />
    <T y={620} size={64} style={rise(lf, at("start work later"))}>Work starts later. <K>Stock market opens late.</K></T>
  </>) },
  { at: "In the Seoul area", sfx: "pop", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={JO} />
    <Shot lf={lf} dur={dur} {...W24("jo-subway", 135)} y={260} marks={[{ x: 22, y: 19, w: 1015, h: 40, at: 4 }]} />
    <T y={520} size={70} style={rise(lf, 6)}>More subways in the morning</T>
  </>) },
  { at: "Police often escort", sfx: "pop", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={AP} />
    <Shot lf={lf + 90} dur={dur + 90} {...W15("ap-day", 182)} y={240} d={-999} marks={[{ x: 982, y: 36, w: 430, h: 34, at: -999 }, { x: 0, y: 72, w: 245, h: 34, at: -999 }, { x: 416, y: 108, w: 488, h: 34, at: 96 }]} />
    <T y={620} size={64} style={rise(lf, 4)}>Late? <K>Police may give you a ride.</K></T>
  </>) },
  { at: "And during the English listening", sfx: "whoosh", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={JO} />
    <Shot lf={lf} dur={dur} {...W24("jo-flight", 190)} y={200} marks={[{ x: 167, y: 73, w: 970, h: 40, at: at("not allowed") }, { x: 22, y: 127, w: 1403, h: 40, at: at("Military drills") }]} />
    <Plane lf={lf} stop={4} x={700} y={560} />
    <Stamp lf={lf} d={at("take off or land")} text="NO TAKEOFFS" x={1100} y={600} rot={-6} size={70} color={RED} />
  </>) },
  { at: "Blip has never seen", sfx: "blip", noHost: true, r: ({ lf }) => (<>
    <Blip lf={lf} face="meh" x={680} y={160} size={560} />
    <div style={{ position: "absolute", left: 1180, top: 250, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: BG, background: INK, borderRadius: 30, padding: "16px 34px", ...pop(lf, 6) }}>shhh…</div>
  </>) },
  { at: "The Associated Press reports", sfx: "whoosh", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-marriage", 108)} y={240} marks={[{ x: 1018, y: 36, w: 425, h: 34, at: at("jobs") }, { x: 0, y: 72, w: 365, h: 34, at: at("jobs") + 4 }]} />
    <T y={540} size={66} style={rise(lf, at("which university"))}>Jobs, status, even marriage <K>can depend on it</K></T>
  </>) },
  { at: "So when AI cheating makes the news", sfx: "pop", face: "shock", r: ({ lf }) => (<>
    <T y={340} size={96} center style={rise(lf)}>So AI cheating news</T>
    <T y={470} size={96} center style={rise(lf, 6)}><K>gets everyone's attention.</K></T>
  </>) },
  { at: "Some lawmakers even called", sfx: "whoosh", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text="NBC News / AP, Nov 16 2026" />
    <Shot lf={lf} dur={dur + 150} {...W15("nbc-post", 108)} y={240} marks={[{ x: 587, y: 0, w: 711, h: 34, at: at("postponing") }]} />
    <T y={540} size={70} style={rise(lf, at("postponing"))}>Some lawmakers: <K>postpone the exam?</K></T>
  </>) },
  { at: "The education minister said no", sfx: "stamp", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text="NBC News / AP, Nov 16 2026" />
    <Shot lf={lf + 150} dur={dur + 150} {...W15("nbc-post", 108)} y={240} d={-999} marks={[{ x: 587, y: 0, w: 711, h: 34, at: -999 }, { x: 1158, y: 36, w: 302, h: 34, at: 150 + at("larger disruption") }]} />
    <Stamp lf={lf} d={at("said no")} text="NO DELAY" x={560} y={540} rot={-6} size={110} color={RED} />
  </>) },
  { at: "This year the new rules", sfx: "stamp", face: "prompt", r: ({ lf }) => (<>
    <T y={300} size={80} center color={DIM} style={rise(lf)}>This year's new rules</T>
    <Stamp lf={lf} d={6} text="TARGET: AI" x={600} y={450} rot={-6} size={130} color={RED} />
  </>) },
  { at: "Proctors will inspect", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur + 90} {...W15("ap-glasses", 74)} y={300} marks={[{ x: 490, y: 0, w: 418, h: 34, at: at("glasses") }, { x: 970, y: 0, w: 454, h: 34, at: at("shirt buttons") }]} />
    <T y={560} size={70} style={rise(lf, at("glasses"))}>Every pair of glasses: <K>inspected</K></T>
    <T y={670} size={70} style={rise(lf, at("shirt buttons"))}>Shirt buttons: <K>covered with stickers</K></T>
  </>) },
  { at: "Proctors will also use", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-ban", 182)} y={200} marks={[{ x: 1196, y: 0, w: 235, h: 34, at: at("metal detectors") }, { x: 0, y: 36, w: 406, h: 34, at: at("metal detectors") + 4 }]} />
    <T y={560} size={70} style={rise(lf, at("metal detectors"))}>Acting suspicious? <K>Metal detector.</K></T>
  </>) },
  { at: "Phones smart glasses", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-devices", 108)} y={220} marks={[{ x: 909, y: 0, w: 481, h: 34, at: 4 }, { x: 0, y: 36, w: 474, h: 34, at: 8 }, { x: 124, y: 72, w: 475, h: 34, at: at("even if") }]} />
    <T y={520} size={66} style={rise(lf, at("handed in"))}>Every device: <K>handed in</K></T>
    <T y={620} size={56} color={DIM} style={rise(lf, at("even if"))}>Not handing it in = cheating, even if never used</T>
  </>) },
  { at: "About eight thousand", sfx: "pop", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={AP} />
    <Shot lf={lf + 90} dur={dur + 90} {...W15("ap-glasses", 74)} y={300} d={-999} marks={[{ x: 490, y: 0, w: 418, h: 34, at: -999 }, { x: 970, y: 0, w: 454, h: 34, at: -999 }, { x: 296, y: 36, w: 362, h: 34, at: 96 }]} />
    <T y={540} size={200} center style={pop(lf, 4, 0.5)}><K>+8,400</K></T>
    <T y={770} size={56} center color={DIM} style={rise(lf, 6)}>extra supervisors</T>
  </>) },
  { at: "On the morning of the exam", sfx: "whoosh", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-alert", 110)} y={180} marks={[{ x: 756, y: 0, w: 656, h: 34, at: at("buzz") }, { x: 0, y: 36, w: 220, h: 34, at: at("buzz") + 4 }]} />
    <Phone lf={lf} d={at("buzz")} x={300} y={460} />
    <T x={620} y={560} size={70} style={rise(lf, at("buzz"))}>~10 seconds of buzzing</T>
    <T x={620} y={660} size={50} color={DIM} style={rise(lf, at("expose hidden"))}>to expose hidden devices</T>
  </>) },
  { at: "The president also told", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-pres", 108)} y={220} marks={[{ x: 509, y: 72, w: 714, h: 34, at: at("unpredictable") }]} />
    <T y={520} size={70} style={rise(lf, at("unpredictable"))}>More alerts, <K>at unpredictable times?</K></T>
  </>) },
  { at: "The prime minister said", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-ban", 182)} y={150} marks={[{ x: 0, y: 72, w: 398, h: 34, at: at("one year to ten") }]} />
    <T y={520} size={180} center style={pop(lf, at("to ten"), 0.5)}>1 → <K>10</K> years</T>
    <T y={740} size={50} center color={DIM} style={rise(lf, at("to ten"))}>exam ban for cheaters</T>
  </>) },
  { at: "College students retaking", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-ban", 182)} y={200} marks={[{ x: 0, y: 72, w: 398, h: 34, at: -999 }, { x: 1347, y: 72, w: 108, h: 34, at: at("expelled") }, { x: 0, y: 108, w: 331, h: 34, at: at("expelled") + 3 }]} />
    <T y={560} size={66} style={rise(lf, at("expelled"))}>Caught while retaking? <K>Expelled</K> from current school</T>
  </>) },
  { at: "She also said companies", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-ai", 74)} y={300} marks={[{ x: 995, y: 0, w: 442, h: 34, at: at("agreed") }, { x: 0, y: 36, w: 255, h: 34, at: at("agreed") + 4 }]} />
    <T y={560} size={66} style={rise(lf, at("agreed"))}>AI chatbot companies: <K>will help investigate</K></T>
  </>) },
  { at: "Is it too much", sfx: "whoosh", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <T y={160} size={80} style={rise(lf)}>Is it too much?</T>
    <Shot lf={lf} dur={dur} {...W15("ap-vice", 36)} y={320} marks={[{ x: 312, y: 0, w: 632, h: 34, at: at("excessive measures") }]} />
    <T y={500} size={60} style={rise(lf, at("we believe"))}>Vice education minister:</T>
    <T y={590} size={70} style={rise(lf, at("excessive measures"))}><K>"Excessive measures are necessary."</K></T>
  </>) },
  { at: "And this isn't the first warning", sfx: "whoosh", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text="The Star / The Korea Herald (ANN), Jun 10 2026" />
    <Shot lf={lf} dur={dur} {...W15("st-first", 110)} y={260} marks={[{ x: 970, y: 36, w: 488, h: 34, at: at("first cheating cases") }, { x: 0, y: 72, w: 96, h: 34, at: at("first cheating cases") + 4 }]} />
    <T y={560} size={66} style={rise(lf, at("TOEIC"))}>June 2026: AI smart glasses on the <K>TOEIC</K></T>
  </>) },
  { at: "In October smart glasses", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text="Associated Press (via ABC News), Nov 17 2026 (name redacted)" />
    <Shot lf={lf} dur={dur} {...W15("ap-oct-r", 144)} y={220} marks={[{ x: 1185, y: 72, w: 295, h: 34, at: at("university essay") }, { x: 0, y: 108, w: 134, h: 34, at: at("university essay") + 3 }]} />
    <T y={560} size={66} style={rise(lf, at("university essay"))}>October: smart glasses on <K>university exams</K></T>
  </>) },
  { at: "Checks at the door", sfx: "pop", face: "meh", r: ({ lf }) => (<>
    <div style={{ position: "absolute", left: 260, top: 220, width: 360, height: 560, borderRadius: 16, border: `10px solid ${INK}`, ...pop(lf) }}>
      <div style={{ position: "absolute", right: 30, top: 270, width: 30, height: 30, borderRadius: "50%", background: INK }} />
    </div>
    <T x={720} y={380} size={84} style={rise(lf, 4)}>Checks at the door…</T>
    <T x={720} y={490} size={84} style={rise(lf, 10)}><K>for one day.</K></T>
  </>) },
  { at: "But every school", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <T y={240} size={64} color={DIM} center style={rise(lf)}>The bigger question for every school:</T>
    <T y={400} size={100} center style={rise(lf, at("If AI can answer"))}>If AI can answer the test,</T>
    <T y={530} size={100} center style={rise(lf, at("what should"))}><K>what should the test test?</K></T>
  </>) },
  { at: "To everyone sitting", sfx: "ding", noHost: true, r: ({ lf, at }) => (<>
    <T y={200} size={64} color={DIM} center style={rise(lf)}>To everyone sitting the Suneung</T>
    <T y={320} size={150} center style={pop(lf, at("good luck"), 0.6)}><K>Good luck.</K></T>
    <T y={520} size={70} center style={rise(lf, at("No AI needed"))}>You've got this. No AI needed.</T>
    <Blip lf={lf} face="happy" x={1300} y={480} size={480} />
  </>) },
  { at: "Follow Blip for more", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <Blip lf={lf} face="prompt" x={680} y={90} size={560} />
    <T y={650} size={120} center style={pop(lf, 6)}>BLIP CHECK <K>&gt;_</K></T>
    <T y={800} size={46} color={DIM} center style={rise(lf, 12)}>AI news, checked</T>
  </>) },
];

const STARTS: number[] = [];
{
  let after = 0;
  for (const b of B) {
    const t = timeOf(b.at, after);
    STARTS.push(f(t));
    after = t + 0.01;
  }
}

const LINES = LINESJ as string[];
type Chunk = { text: string; start: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let p = 0;
  for (const line of LINES) {
    let cur: { t: string; s: number }[] = [];
    const flush = () => {
      if (cur.length) out.push({ text: cur.map((x) => x.t).join(" "), start: f(cur[0].s) });
      cur = [];
    };
    for (const tok of line.split(/\s+/)) {
      const n = norm(tok);
      const at = BIG.indexOf(n, p);
      if (!n || at < 0) continue;
      p = at + n.length;
      cur.push({ t: tok, s: WORDS[OWNER[at]].start });
      if (/[.,?!:;]$/.test(tok) || cur.length >= 5 || cur.map((x) => x.t).join(" ").length > 26) flush();
    }
    flush();
  }
  return out;
})();

const Captions: React.FC = () => {
  const fr = useCurrentFrame();
  const i = CHUNKS.findIndex((c, k) => fr >= c.start && fr < (CHUNKS[k + 1]?.start ?? c.start + 50));
  if (i < 0) return null;
  const lf = fr - CHUNKS[i].start;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, bottom: 46, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 58, letterSpacing: -1, color: INK, background: "rgba(10,11,13,0.72)", padding: "8px 26px", borderRadius: 14, opacity: interpolate(lf, [0, 2], [0, 1], clamp), translate: `0px ${interpolate(lf, [0, 5], [14, 0], { ...clamp, easing: outExpo })}px` }}>
        {CHUNKS[i].text}
      </span>
    </div>
  );
};

const Host: React.FC = () => {
  const fr = useCurrentFrame();
  let i = 0;
  while (i + 1 < STARTS.length && fr >= STARTS[i + 1]) i++;
  const b = B[i];
  if (b.noHost) return null;
  let first = i;
  while (first > 0 && !B[first - 1].noHost) first--;
  const lf = fr - STARTS[first];
  const t = fr / FPS;
  const talking = WORDS.some((w) => t >= w.start && t <= w.end);
  const sq = talking ? Math.sin(fr / 2.2) * 0.035 : 0;
  const hop = interpolate(fr - STARTS[i], [0, 4, 9], [0, -18, 0], clamp);
  const walk = interpolate(lf, [0, 22], [1, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  const step = walk > 0.01 ? -Math.abs(Math.sin(lf / 2.4)) * 16 : 0;
  return (
    <div style={{ position: "absolute", left: 1580 + walk * 400, top: 640 + hop + step + Math.sin(fr / 11) * 4, width: 340, height: 340, rotate: `${walk * -6}deg` }}>
      <Img src={staticFile(`bc01/blip/${b.face ?? "prompt"}.png`)} style={{ width: 340, height: 340, transform: `scaleY(${1 + sq}) scaleX(${1 - sq / 2})`, transformOrigin: "50% 75%" }} />
    </div>
  );
};

const BeatView: React.FC<{ i: number }> = ({ i }) => {
  const lf = useCurrentFrame();
  const start = STARTS[i];
  const dur = (STARTS[i + 1] ?? SN01_DURATION) - start;
  const at = (p: string) => f(timeOf(p, start / FPS - 0.05)) - start;
  return <AbsoluteFill>{B[i].r({ lf, dur, at })}</AbsoluteFill>;
};

export const Sn01Full: React.FC = () => {
  useFonts();
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ background: `radial-gradient(55% 70% at ${50 + Math.sin(fr / 200) * 8}% 40%, rgba(120,165,20,0.24) 0%, ${BG} 70%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "60px 60px", backgroundPosition: `0px ${-fr * 0.3}px` }} />
      {B.map((b, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={(STARTS[i + 1] ?? SN01_DURATION) - STARTS[i]} layout="none">
          <BeatView i={i} />
        </Sequence>
      ))}
      {B.map((b, i) =>
        b.sfx ? (
          <Sequence key={`s${i}`} from={STARTS[i]} durationInFrames={30} layout="none">
            <Html5Audio src={staticFile(`sfx/${b.sfx}.wav`)} volume={0.35} />
          </Sequence>
        ) : null,
      )}
      <Html5Audio src={staticFile("sn01/narration.mp3")} />
      <Host />
      <Captions />
      <div style={{ position: "absolute", right: 40, top: 30, fontFamily: "Pretendard", fontWeight: 900, fontSize: 24, color: BG, background: LIME, padding: "5px 12px", borderRadius: 8 }}>BLIP CHECK &gt;_</div>
    </AbsoluteFill>
  );
};
