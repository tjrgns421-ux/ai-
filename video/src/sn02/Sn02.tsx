import React from "react";
import { Shot, Source, Stamp, T, K, Blip, BG, DIM, INK, LIME, RED, pop, rise } from "../bc01/Bc01";
import words from "../../public/sn02/narration.words.json";
import LINES from "../../public/sn02/lines.json";
import { Beat, Cap, Stage, makeTimeline, srcOf } from "./engine";

// Blip Check #3: Korea's ₩100M cheating bounty and 10-year ban (16:9, ~5:20).
// Every fact on screen is a real capture. The tax-exam test-taker's name is redacted and never said.

const AP = "Associated Press (via ABC News), Nov 17 2026";
const JA = "Korea JoongAng Daily, Nov 16 2026";
// sn01 captures (1488 / 2400 px wide)
const W15 = (src: string, h: number) => ({ src: `sn01/${src}.png`, w: 1488, h, scale: 1.1, x: (1920 - 1488 * 1.1 - 44) / 2 });
const W24 = (src: string, h: number) => ({ src: `sn01/${src}.png`, w: 2400, h, scale: 0.68, x: (1920 - 2400 * 0.68 - 44) / 2 });

const Plane: React.FC<{ lf: number; stop: number; x: number; y: number }> = ({ lf, stop, x, y }) => (
  <div style={{ position: "absolute", left: x + Math.min(lf, stop) * 9, top: y, rotate: "-8deg" }}>
    <svg width="260" height="160" viewBox="0 0 260 160"><path d="M10 80 L120 70 L170 10 L195 10 L170 72 L235 70 L250 45 L262 45 L255 80 L262 115 L250 115 L235 90 L170 88 L195 150 L170 150 L120 90 L10 80 Z" fill={INK} /></svg>
  </div>
);

const Phone: React.FC<{ lf: number; d: number; x: number; y: number }> = ({ lf, d, x, y }) => {
  const on = lf >= d;
  const shake = on ? Math.sin(lf * 2.2) * 10 : 0;
  return (
    <div style={{ position: "absolute", left: x + shake, top: y, width: 200, height: 360, borderRadius: 36, border: `10px solid ${INK}`, background: on ? "#2a2f1a" : "#111", boxShadow: on ? `0 0 60px ${LIME}` : "none", ...pop(lf, 0) }}>
      <div style={{ position: "absolute", left: 16, right: 16, top: 40, borderRadius: 14, background: on ? RED : "transparent", color: INK, fontFamily: "Pretendard", fontWeight: 900, fontSize: 24, padding: 12, textAlign: "center" }}>{on ? "EMERGENCY ALERT" : ""}</div>
    </div>
  );
};

/** Korean capture + English translation line under it. */
const Tr: React.FC<{ lf: number; d: number; y: number; children: React.ReactNode }> = ({ lf, d, y, children }) => (
  <T y={y} size={48} style={rise(lf, d)}><span style={{ color: DIM, fontSize: 30, marginRight: 18 }}>TRANSLATION</span>{children}</T>
);

const Item: React.FC<{ lf: number; d: number; y: number; n: string; children: React.ReactNode }> = ({ lf, d, y, n, children }) => (
  <div style={{ position: "absolute", left: 140, top: y, display: "flex", alignItems: "center", gap: 30, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: INK, ...rise(lf, d) }}>
    <span style={{ width: 84, height: 84, borderRadius: 42, background: LIME, color: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>{n}</span>
    {children}
  </div>
);

export const B: Beat[] = [
  // ---- hook ----
  { at: "South Korea wants to pay", sfx: "whoosh", face: "shock", r: ({ lf, at }) => (<>
    <T y={170} size={60} color={DIM} style={rise(lf)}>Korea wants to pay up to</T>
    <T y={260} size={230} style={pop(lf, 4, 0.5)}><K>$75,000</K></T>
    <T y={520} size={70} style={rise(lf, at("for a single tip"))}>for a single tip.</T>
    <T y={640} size={56} color={DIM} style={rise(lf, at("Not about a robbery"))}>Not about a robbery.</T>
    <T y={730} size={66} style={rise(lf, at("About cheating"))}>About cheating on <K>one exam.</K></T>
  </>) },
  { at: "And if you're caught", sfx: "stamp", face: "shock", r: ({ lf, at }) => (<>
    <T y={240} size={70} style={rise(lf)}>Get caught?</T>
    <Stamp lf={lf} d={at("ten years")} text="10-YEAR BAN" x={300} y={420} rot={-6} size={170} color={RED} />
  </>) },
  { at: "Today, more than half", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={150} size={60} color={DIM} style={rise(lf)}>Today: half a million test-takers. Three questions.</T>
    <Item lf={lf} d={at("What is this exam")} y={300} n="1">What is this exam?</Item>
    <Item lf={lf} d={at("Why is Korea")} y={440} n="2">Why is Korea this worried?</Item>
    <Item lf={lf} d={at("And how much")} y={580} n="3">How much is actually in place?</Item>
  </>) },
  // ---- 1. the exam ----
  { at: "First, the exam", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <T y={160} size={50} color={LIME} style={rise(lf)}>1 · THE EXAM</T>
    <T y={260} size={170} style={pop(lf, 4, 0.6)}>Suneung</T>
    <T y={480} size={60} style={rise(lf, at("College Scholastic"))}>College Scholastic Ability Test</T>
    <T y={570} size={50} color={DIM} style={rise(lf, at("national college entrance"))}>Korea's national college entrance exam</T>
  </>) },
  { at: "This year, five hundred fifty-one", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-count")} />
    <Cap name="kh-count" lf={lf} dur={dur} y={170} marks={[["551,864", at("five hundred fifty-one")]]} />
    <T y={440} size={210} style={pop(lf, 6, 0.6)}><K>551,864</K></T>
    <T y={680} size={56} color={DIM} style={rise(lf, 10)}>applied this year</T>
  </>) },
  { at: "It ran today at one thousand", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-time")} />
    <Cap name="kh-time" lf={lf} dur={dur} y={170} marks={[["1,312 test centers", at("one thousand three hundred")], ["8:40 a.m.", at("eight forty")], ["5:45 p.m.", at("five forty-five")]]} />
    <T y={430} size={80} style={rise(lf, at("one thousand three hundred"))}><K>1,312</K> test centers</T>
    <T y={560} size={170} style={pop(lf, at("eight forty"), 0.6)}>8:40 <K>→</K> 5:45</T>
  </>) },
  { at: "And the whole country moves", sfx: "whoosh", face: "happy", r: ({ lf }) => (<>
    <T y={360} size={100} center style={rise(lf)}>And the whole country</T>
    <T y={490} size={100} center style={rise(lf, 6)}><K>moves around it.</K></T>
  </>) },
  { at: "The stock market opened", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-stock")} />
    <Cap name="kh-stock" lf={lf} dur={dur} y={150} marks={[["open and close an hour later", at("an hour later")]]} />
    <Cap name="kh-subway" lf={lf} dur={dur} y={420} width={1500} d={at("Seoul added")} marks={[["27 runs", at("twenty-seven") + 2]]} />
    <T y={640} size={66} style={rise(lf, at("twenty-seven"))}>Stock market: <K>+1 hour</K>. Subway: <K>+27 runs</K>.</T>
  </>) },
  { at: "From one oh five", sfx: "whoosh", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-planes")} />
    <Cap name="kh-planes" lf={lf} dur={dur} y={160} marks={[["1:05 p.m. to 1:40 p.m.", 6]]} />
    <Plane lf={lf} stop={at("every takeoff")} x={420} y={480} />
    <Stamp lf={lf} d={at("suspended")} text="NO TAKEOFFS" x={950} y={500} rot={-6} size={86} color={RED} />
  </>) },
  { at: "Planes already in the air", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-alt")} />
    <Cap name="kh-alt" lf={lf} dur={dur} y={160} marks={[["3 kilometers or higher", at("three kilometers")]]} />
    <T y={460} size={190} style={pop(lf, at("three kilometers"), 0.6)}><K>3 km</K> up</T>
  </>) },
  { at: "Even the sky has to be quiet", sfx: "blip", noHost: true, r: ({ lf }) => (<>
    <Blip lf={lf} face="meh" x={680} y={160} size={560} />
    <div style={{ position: "absolute", left: 1180, top: 250, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: BG, background: INK, borderRadius: 30, padding: "16px 34px", ...pop(lf, 6) }}>shhh…</div>
  </>) },
  { at: "And people abroad watch", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kt-viral")} />
    <Cap name="kt-viral" lf={lf} dur={dur} y={150} width={1300} marks={[["went viral", at("went viral")]]} />
    <T y={600} size={66} style={rise(lf, at("native English"))}>Last year: native speakers vs <K>the English test</K></T>
  </>) },
  { at: "Why go this far", sfx: "whoosh", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-career")} />
    <T y={150} size={80} style={rise(lf)}>Why go this far?</T>
    <Cap name="kh-career" lf={lf} dur={dur} y={300} d={at("The Korea Herald")} marks={[["heavily influence career prospects", at("heavily influence")]]} />
    <T y={560} size={70} style={rise(lf, at("heavily influence"))}>Your university can <K>shape your career</K></T>
  </>) },
  { at: "The Associated Press goes further", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-marriage", 110)} y={220} marks={[{ x: 1018, y: 36, w: 425, h: 34, at: at("Jobs") }, { x: 0, y: 72, w: 365, h: 34, at: at("Jobs") + 4 }]} />
    <T y={520} size={70} style={rise(lf, at("Jobs"))}>Jobs. Status. <K>Even marriage.</K></T>
  </>) },
  // ---- 2. why worried ----
  { at: "So why the bounty", sfx: "whoosh", face: "meh", r: ({ lf, at }) => (<>
    <T y={160} size={50} color={LIME} style={rise(lf)}>2 · WHY KOREA IS WORRIED</T>
    <T y={300} size={110} style={rise(lf, 3)}>So why the bounty?</T>
    <T y={460} size={80} style={rise(lf, at("Because of a different"))}>Because of a <K>different exam.</K></T>
  </>) },
  { at: "Last weekend, the top scorer", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-trigger")} />
    <T y={140} size={56} color={DIM} style={rise(lf)}>Korea's certified tax accountant exam</T>
    <Cap name="kh-trigger" lf={lf} dur={dur} y={250} marks={[["confessed to cheating with the help of AI and digital devices", at("confessed")]]} />
    <T y={520} size={76} style={rise(lf, at("confessed"))}>Top scorer: <K>"I cheated with AI"</K></T>
  </>) },
  { at: "He used a hidden camera", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("khm-police")} />
    {["hidden camera", "generative AI"].map((t, i) => (
      <div key={t} style={{ position: "absolute", left: 360 + i * 640, top: 160, width: 520, padding: "26px 0", textAlign: "center", borderRadius: 24, border: `4px solid ${i ? LIME : "rgba(255,255,255,0.4)"}`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 54, color: i ? LIME : INK, ...pop(lf, at(t)) }}>{t}</div>
    ))}
    <Cap name="khm-police" lf={lf} dur={dur} y={430} d={at("questioned by police")} marks={[["police questioning as a suspect", at("questioned by police")], ["apologized", at("apologized")]]} />
    <Stamp lf={lf} d={at("questioned by police") + 6} text="SUSPECT" x={760} y={600} rot={-5} size={90} color="#FFC93A" />
  </>) },
  { at: "According to Korean media", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={JA} />
    <Shot lf={lf} dur={dur} {...W24("ja-score-r", 354)} y={120} marks={[{ x: 22, y: 127, w: 675, h: 40, at: at("one hundred fifty-nine") }]} />
    <T y={560} size={200} center style={pop(lf, at("one hundred fifty-nine"), 0.5)}><K>159</K> / 160</T>
  </>) },
  { at: "And the investigation could expand", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={JA} />
    <Shot lf={lf} dur={dur} {...W24("ja-expand", 246)} y={180} marks={[{ x: 301, y: 19, w: 511, h: 40, at: at("could expand") }]} />
    <T y={540} size={70} style={rise(lf, at("other national exams"))}>Probe could reach <K>other national exams</K></T>
  </>) },
  { at: "And it wasn't the first warning", sfx: "whoosh", face: "meh", r: ({ lf }) => (<>
    <T y={400} size={110} center style={rise(lf)}>Not the <K>first warning.</K></T>
  </>) },
  { at: "In June, Korea reported", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text="The Star / The Korea Herald (ANN), Jun 10 2026" />
    <Shot lf={lf} dur={dur} {...W15("st-first", 110)} y={220} marks={[{ x: 970, y: 36, w: 488, h: 34, at: at("first cheating cases") }, { x: 0, y: 72, w: 96, h: 34, at: at("first cheating cases") + 4 }]} />
    <T y={520} size={66} style={rise(lf, at("TOEIC"))}>June: AI smart glasses on the <K>TOEIC</K></T>
  </>) },
  { at: "In October, smart glasses", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={`${AP} (name redacted)`} />
    <Shot lf={lf} dur={dur} {...W15("ap-oct-r", 146)} y={200} marks={[{ x: 1185, y: 72, w: 295, h: 34, at: at("university essay") }, { x: 0, y: 108, w: 134, h: 34, at: at("university essay") + 3 }]} />
    <T y={540} size={66} style={rise(lf, at("university essay"))}>October: smart glasses on <K>university exams</K></T>
  </>) },
  { at: "Glasses used to just help", sfx: "blip", noHost: true, r: ({ lf }) => (<>
    <Blip lf={lf} face="meh" x={280} y={200} size={560} />
    <T x={950} y={330} size={70} style={rise(lf, 4)}>Glasses used to just</T>
    <T x={950} y={430} size={70} style={rise(lf, 10)}><K>help you see the test.</K></T>
  </>) },
  { at: "So one question hung", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <T y={300} size={70} color={DIM} center style={rise(lf)}>This week's question:</T>
    <T y={420} size={110} center style={rise(lf, at("Could it happen"))}>Could it happen on the <K>Suneung?</K></T>
  </>) },
  // ---- rules ----
  { at: "The government's answer", sfx: "stamp", face: "prompt", r: ({ lf, at }) => (<>
    <T y={260} size={70} color={DIM} center style={rise(lf)}>The government's answer:</T>
    <Stamp lf={lf} d={at("check everything")} text="CHECK EVERYTHING" x={330} y={420} rot={-5} size={130} color={LIME} />
  </>) },
  { at: "The prime minister said proctors", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("khm-pm")} />
    <Cap name="khm-pm" lf={lf} dur={dur} y={170} marks={[["glasses and watches", at("glasses and watches")], ["collars, sleeves and buttons", at("collars")]]} />
    <T y={450} size={70} style={rise(lf, at("glasses and watches"))}>Glasses. Watches.</T>
    <T y={560} size={70} style={rise(lf, at("collars"))}><K>Collars. Sleeves. Buttons.</K></T>
  </>) },
  { at: "Every one of the one thousand", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("khm-glasses")} />
    <Cap name="khm-glasses" lf={lf} dur={dur} y={150} marks={[["1,312 Suneung test centers", at("test centers")], ["thick frames", at("thick frames")]]} />
    <T y={560} size={70} style={rise(lf, at("spot smart glasses"))}>Smart-glasses spotters at <K>every center</K></T>
  </>) },
  { at: "Test-takers were handed stickers", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-stickers")} />
    <Cap name="kh-stickers" lf={lf} dur={dur} y={170} marks={[["stickers to cover buttons", at("stickers")]]} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ position: "absolute", left: 700 + i * 180, top: 460, width: 120, height: 120, borderRadius: 60, border: `8px solid ${INK}`, ...pop(lf, at("buttons") + i * 3) }}>
        <div style={{ position: "absolute", inset: -14, borderRadius: 16, background: LIME, opacity: lf > at("block") + i * 3 ? 1 : 0, rotate: `${-8 + i * 8}deg` }} />
      </div>
    ))}
    <T y={660} size={60} center color={DIM} style={rise(lf, at("block"))}>to block miniature cameras</T>
  </>) },
  { at: "Bags stayed outside", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("khm-bags")} />
    <Cap name="khm-bags" lf={lf} dur={dur} y={170} marks={[["leave their bags", 4], ["check whether electronic devices are operating", at("check whether")]]} />
    <T y={560} size={66} style={rise(lf, at("check whether"))}>Bags in the hallway. <K>Checked for live devices.</K></T>
  </>) },
  { at: "All electronic devices were banned", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-pencils")} />
    <Cap name="kh-pencils" lf={lf} dur={dur} y={200} marks={[["only pencils", at("only pencils")]]} />
    <T y={420} size={170} center style={pop(lf, at("only pencils"), 0.6)}>Only <K>pencils.</K></T>
  </>) },
  { at: "Not handing in a device", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-devices", 110)} y={140} marks={[{ x: 124, y: 72, w: 475, h: 34, at: at("even if") }]} />
    <Shot lf={lf} dur={dur} {...W15("ap-ban", 182)} y={380} d={at("metal detectors")} marks={[{ x: 1196, y: 0, w: 235, h: 34, at: at("metal detectors") + 4 }, { x: 0, y: 36, w: 406, h: 34, at: at("metal detectors") + 8 }]} />
    <T y={720} size={58} style={rise(lf, at("act suspiciously"))}>Acting suspicious? <K>Metal detector.</K></T>
  </>) },
  { at: "The prime minister also asked the science", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("khm-wifi")} />
    <Cap name="khm-wifi" lf={lf} dur={dur} y={170} marks={[["disabling public Wi-Fi", at("turning off")]]} />
    <T y={520} size={76} style={rise(lf, at("turning off"))}>Public Wi-Fi at test sites: <K>off?</K></T>
  </>) },
  { at: "And then, the phones", sfx: "whoosh", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-alert")} />
    <Cap name="kh-alert" lf={lf} dur={dur} y={140} marks={[["two disaster alert messages", at("Two emergency")], ["even when devices are muted", at("loud even on silent")]]} />
    <Phone lf={lf} d={at("loud even")} x={300} y={420} />
    <T x={620} y={500} size={70} style={rise(lf, at("loud even"))}>Loud, <K>even on silent</K></T>
    <T x={620} y={600} size={50} color={DIM} style={rise(lf, at("handed in"))}>to catch phones that weren't handed in</T>
  </>) },
  { at: "About seventy-five thousand proctors", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-count")} />
    <Cap name="kh-count" lf={lf} dur={dur} y={170} marks={[["75,000 proctors", at("seventy-five thousand")], ["8,400 additional personnel", at("eight thousand")]]} />
    <T y={440} size={170} center style={pop(lf, at("seventy-five thousand"), 0.6)}><K>75,000</K></T>
    <T y={650} size={70} center style={rise(lf, at("eight thousand"))}>proctors <K>+ 8,400</K> extra staff</T>
  </>) },
  { at: "Blip would have to leave", sfx: "boing", noHost: true, r: ({ lf }) => (<>
    <Blip lf={lf} face="shock" x={280} y={200} size={560} />
    <T x={950} y={330} size={70} style={rise(lf, 4)}>Blip's face is a screen.</T>
    <T x={950} y={430} size={70} style={rise(lf, 10)}><K>Hallway for Blip.</K></T>
  </>) },
  // ---- 3. money & penalties ----
  { at: "Now, the money", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<>
    <T y={160} size={50} color={LIME} style={rise(lf)}>3 · HOW MUCH IS REAL?</T>
    <T y={330} size={140} style={pop(lf, 3, 0.6)}>Now, the <K>money.</K></T>
  </>) },
  { at: "On Tuesday, President Lee", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kt-grave")} />
    <Cap name="kt-grave" lf={lf} dur={dur} y={140} width={1300} marks={[["grave crime", at("grave crime")]]} />
    <T y={640} size={80} style={rise(lf, at("grave crime"))}><K>"A grave crime"</K></T>
  </>) },
  { at: "In a post on X", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kt-x")} />
    <Cap name="kt-x" lf={lf} dur={dur} y={150} width={1340} marks={[["over 100 million won ($74,805) per case", at("over one hundred million")]]} />
    <Stamp lf={lf} d={at("over one hundred million")} text="OVER ₩100M" x={560} y={560} rot={-5} size={120} color={LIME} />
  </>) },
  { at: "And he added a message", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kt-quote")} />
    <Cap name="kt-quote" lf={lf} dur={dur} y={180} width={1400} marks={[["Do not ruin your life", at("do not ruin")]]} />
    <T y={560} size={76} style={rise(lf, at("Give it up"))}><K>"Give it up."</K></T>
  </>) },
  { at: "A day later, the prime minister's office", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={`${srcOf("yk-reward")} · ${srcOf("kh-reward")}`} />
    <Cap name="yk-reward" lf={lf} dur={dur} y={130} width={1500} marks={[["최대 1억원의 포상금", at("up to one hundred")]]} />
    <Tr lf={lf} d={at("up to one hundred")} y={300}>"…a reward of <K>up to ₩100 million</K> if confirmed as cheating"</Tr>
    <Cap name="kh-reward" lf={lf} dur={dur} y={430} width={1500} d={at("That's about")} marks={[["up to 100 million won ($75,000)", at("seventy-five thousand")]]} />
    <T y={640} size={110} center style={pop(lf, at("seventy-five thousand"), 0.6)}>≈ <K>$75,000</K></T>
  </>) },
  { at: "Over, then up to", sfx: "stamp", face: "meh", r: ({ lf, at }) => {
    const strike = Math.min(1, Math.max(0, (lf - at("then up to")) / 8));
    return (<>
      <div style={{ position: "absolute", left: 300, top: 300, fontFamily: "Pretendard", fontWeight: 900, fontSize: 160, color: DIM, ...pop(lf) }}>
        OVER
        <div style={{ position: "absolute", left: -10, top: 95, height: 16, width: `${strike * 110}%`, background: RED, borderRadius: 8 }} />
      </div>
      <T x={860} y={300} size={160} style={pop(lf, at("then up to"), 0.6)}>→ <K>UP TO</K></T>
      <T y={560} size={60} center color={DIM} style={rise(lf, at("Two small words"))}>Two small words. A big difference.</T>
    </>);
  } },
  { at: "Then the penalties", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("yk-penalty")} />
    <Cap name="yk-penalty" lf={lf} dur={dur} y={120} width={1500} marks={[["최대 5년 이하의 징역", at("five years")], ["퇴학조치", at("expelled")]]} />
    <Item lf={lf} d={at("ten-year ban")} y={340} n="1">10-year ban from the exam</Item>
    <Item lf={lf} d={at("Criminal charges")} y={470} n="2">Up to <K>5 years</K> in prison</Item>
    <Item lf={lf} d={at("expelled")} y={600} n="3">College students: <K>expelled</K></Item>
  </>) },
  { at: "People who knowingly sell", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("yk-sellers")} />
    <Cap name="yk-sellers" lf={lf} dur={dur} y={170} width={1500} marks={[["판매하는 사업자와 구매자", at("sell devices")]]} />
    <Tr lf={lf} d={at("sell devices")} y={360}>Sellers <K>and buyers</K> of cheating devices: investigated</Tr>
  </>) },
  { at: "But here's the catch", sfx: "stamp", face: "shock", r: ({ lf, at }) => (<>
    <T y={240} size={70} color={DIM} center style={rise(lf)}>But here's the catch.</T>
    <Stamp lf={lf} d={at("not in place")} text="NOT IN PLACE YET" x={330} y={400} rot={-5} size={130} color="#FFC93A" />
  </>) },
  { at: "The reward needs new rules", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("yk-rules")} />
    <T y={140} size={70} style={rise(lf)}>The reward: <K>needs new rules</K></T>
    <Cap name="yk-rules" lf={lf} dur={dur} y={290} width={1400} d={at("write them quickly")} marks={[["이번 수능부터 즉시 적용", at("apply them")]]} />
    <Tr lf={lf} d={at("apply them")} y={440}>"…pushing to apply them <K>from this exam</K>"</Tr>
  </>) },
  { at: "The ten-year ban needs a law", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("khm-law")} />
    <T y={120} size={66} style={rise(lf)}>The 10-year ban: <K>needs a law</K></T>
    <Cap name="khm-law" lf={lf} dur={dur} y={230} width={1500} d={at("Democratic Party")} marks={[["from one year to 10 years", at("from one year")], ["fast-track the legislation", at("fast-track")]]} />
    <T y={640} size={90} style={pop(lf, at("from one year"), 0.6)}>1 year <K>→ 10 years</K></T>
  </>) },
  { at: "Whether that can happen", sfx: "whoosh", face: "meh", r: ({ lf }) => (<>
    <T y={380} size={110} center style={rise(lf)}>In time? <K>Open question.</K></T>
  </>) },
  { at: "From November twentieth", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("yk-tf")} />
    <Cap name="yk-tf" lf={lf} dur={dur} y={120} width={1500} marks={[["20일부터", at("November twentieth")], ["글로벌 AI(인공지능) 기업·통신사", at("global AI")]]} />
    <Tr lf={lf} d={at("task force")} y={420}>From Nov 20: PM-led task force <K>+ global AI firms, telecoms</K></Tr>
  </>) },
  { at: "And the prime minister has said companies", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-ai", 74)} y={260} marks={[{ x: 995, y: 0, w: 442, h: 34, at: at("agreed") }, { x: 0, y: 36, w: 255, h: 34, at: at("agreed") + 4 }]} />
    <T y={520} size={66} style={rise(lf, at("agreed"))}>AI chatbot companies: <K>agreed to help</K></T>
  </>) },
  // ---- pushback ----
  { at: "Not everyone thinks", sfx: "whoosh", face: "meh", r: ({ lf }) => (<>
    <T y={380} size={100} center style={rise(lf)}>Not everyone agrees.</T>
  </>) },
  { at: "A senior official at a teachers", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("khm-union")} />
    <Cap name="khm-union" lf={lf} dur={dur + 200} y={110} width={1500} marks={[["already been doing", at("already been doing")], ["really an effective response", at("effective response")]]} />
    <T y={620} size={60} style={rise(lf, at("effective response"))}>Teachers' union: <K>"not really effective"</K></T>
  </>) },
  { at: "The union's bigger complaint", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("khm-union")} />
    <Cap name="khm-union" lf={lf + 200} dur={dur + 200} y={110} width={1500} d={-999} marks={[["already been doing", -999], ["really an effective response", -999], ["giving teachers more duties", 200 + at("more duties")]]} />
    <T y={620} size={60} style={rise(lf, at("more duties"))}>Not new systems. <K>More work for teachers.</K></T>
  </>) },
  { at: "The education minister has said", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("khm-equip")} />
    <Cap name="khm-equip" lf={lf} dur={dur} y={170} width={1500} marks={[["radio-frequency detectors and metal detectors", at("radio-frequency")]]} />
    <T y={520} size={66} style={rise(lf, at("radio-frequency"))}>Next time: <K>RF and metal detectors?</K></T>
  </>) },
  { at: "And abroad, people noticed", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={`${srcOf("kt-reddit")} (quoting a Reddit user)`} />
    <Cap name="kt-reddit" lf={lf} dur={dur} y={170} width={1400} marks={[["everyone is a proctor now", at("everyone is a proctor")], ["False accusation drama is going to be wild", at("False accusation")]]} />
    <T y={520} size={76} style={rise(lf, at("everyone is a proctor"))}><K>"Everyone is a proctor now."</K></T>
  </>) },
  { at: "The vice education minister's answer", sfx: "stamp", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={AP} />
    <Shot lf={lf} dur={dur} {...W15("ap-vice", 38)} y={300} marks={[{ x: 312, y: 0, w: 632, h: 34, at: at("excessive measures") }]} />
    <T y={460} size={60} style={rise(lf, 4)}>Vice education minister:</T>
    <T y={550} size={74} style={rise(lf, at("excessive measures"))}><K>"Excessive measures are necessary."</K></T>
  </>) },
  // ---- verdict ----
  { at: "So, how much of this is real", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={150} size={80} style={rise(lf)}>So, how much is real?</T>
    <Item lf={lf} d={at("The checks happened")} y={320} n="✓">Checks: <K>happened today</K></Item>
    <Item lf={lf} d={at("The bounty")} y={460} n="…">Bounty: <span style={{ color: "#FFC93A" }}>rules still being written</span></Item>
    <Item lf={lf} d={at("ten-year ban are")} y={600} n="…">10-year ban: <span style={{ color: "#FFC93A" }}>law still being written</span></Item>
  </>) },
  { at: "And the bigger question", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <T y={200} size={64} color={DIM} center style={rise(lf)}>The bigger question:</T>
    <T y={340} size={100} center style={rise(lf, at("If AI can answer"))}>If AI can answer the test,</T>
    <T y={470} size={100} center style={rise(lf, at("what should"))}><K>what should the test test?</K></T>
    <T y={650} size={56} center color={DIM} style={rise(lf, at("Tell Blip"))}>Tell Blip in the comments ↓</T>
  </>) },
  { at: "Good luck to everyone", sfx: "ding", noHost: true, r: ({ lf, at }) => (<>
    <T y={160} size={64} color={DIM} center style={rise(lf)}>To everyone who sat the Suneung</T>
    <T y={270} size={150} center style={pop(lf, 2, 0.6)}><K>Good luck.</K></T>
    <Blip lf={lf} face="happy" x={680} y={470} size={420} d={at("Follow Blip")} />
    <T y={880} size={60} center style={rise(lf, at("Follow Blip"))}>BLIP CHECK <K>&gt;_</K> · Korea, checked</T>
  </>) },
];

const TL = makeTimeline(words, LINES as string[], B, 45);
export const SN02_DURATION = TL.duration;
export const Sn02Full: React.FC = () => <Stage tl={TL} audio="sn02/narration.mp3" />;
