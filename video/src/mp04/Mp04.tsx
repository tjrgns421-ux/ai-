import React from "react";
import { Blip, Face, Source, Stamp, T, K, BG, DIM, INK, LIME, RED, pop, rise } from "../bc01/Bc01";
import words from "../../public/mp04/narration.words.json";
import LINES from "../../public/mp04/lines.json";
import { Beat, Cap, Crop, Stage, makeTimeline, srcOf } from "./engine";
import { BLUE, CAM, ISS, LitChart, NightCam, Photo, PhotoCredit, YEL } from "./Visuals";

// Blip Check — Maps, checked #4: North Korea at night. What changed after 2022? (16:9, ~6 min)
// Facts and captures: shorts/mp04-north-korea-night/sources.md. Lit-area numbers: research/nk_night_lights.py.

const NASA_ISS = "Photo: NASA, ISS Crew Earth Observations (public domain)";
const OURS = "Calculated: NASA GIBS VIIRS night lights + Natural Earth borders";

const Item: React.FC<{ lf: number; d: number; y: number; n: string; c?: string; children: React.ReactNode }> = ({ lf, d, y, n, c = LIME, children }) => (
  <div style={{ position: "absolute", left: 140, top: y, display: "flex", alignItems: "center", gap: 30, fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, color: INK, ...rise(lf, d) }}>
    <span style={{ minWidth: 84, height: 84, borderRadius: 42, background: c, color: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, padding: "0 12px", boxSizing: "border-box" }}>{n}</span>
    {children}
  </div>
);
const Aside: React.FC<{ lf: number; face: Face; a: React.ReactNode; b: React.ReactNode }> = ({ lf, face, a, b }) => (<>
  <Blip lf={lf} face={face} x={260} y={220} size={540} />
  <T x={900} y={330} size={66} style={rise(lf, 4)}>{a}</T>
  <T x={900} y={430} size={66} style={rise(lf, 10)}>{b}</T>
</>);
const Over: React.FC<{ lf: number; d?: number; y?: number; size?: number; children: React.ReactNode }> = ({ lf, d = 0, y = 150, size = 64, children }) => (
  <div style={{ position: "absolute", left: 120, right: 120, top: y, ...rise(lf, d) }}>
    <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: size, color: INK, background: "rgba(10,11,13,0.78)", padding: "10px 26px", borderRadius: 14, lineHeight: 1.35, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>
  </div>
);
const Section: React.FC<{ lf: number; n: string; title: React.ReactNode }> = ({ lf, n, title }) => (<>
  <T y={330} size={56} color={LIME} style={rise(lf)}>{n}</T>
  <T y={420} size={110} style={pop(lf, 3, 0.7)}>{title}</T>
</>);
/** Two big numbers side by side. */
const Versus: React.FC<{ lf: number; a: [string, string]; b: [string, string]; d2?: number; title?: string }> = ({ lf, a, b, d2 = 8, title }) => (<>
  {title && <T y={150} size={48} color={DIM} center style={rise(lf)}>{title}</T>}
  {[a, b].map(([lab, val], i) => (
    <div key={lab} style={{ position: "absolute", left: i ? 1000 : 160, top: 300, width: 760, textAlign: "center", ...pop(lf, i ? d2 : 2, 0.6) }}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 52, color: i ? RED : BLUE }}>{lab}</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 120, color: INK, letterSpacing: -4, whiteSpace: "nowrap" }}>{val}</div>
    </div>
  ))}
</>);

const PEN = CAM.peninsula, NO = CAM.north, PY = CAM.pyongyang, PW = CAM.pyongWide, EA = CAM.east;
const BM: ["bm2012", number][] = [["bm2012", 0]];

export const B: Beat[] = [
  // ---- hook ----
  { at: "You've seen North Korea at night", sfx: "whoosh", noHost: true, r: ({ lf, dur }) => (<>
    <ISS y={2014} lf={lf} dur={dur} from={{ x: 0.62, y: 0.65, z: 1.2 }} to={{ x: 0.55, y: 0.55, z: 1.6 }} />
    <PhotoCredit text={NASA_ISS + " · Jan 30 2014"} />
    <Over lf={lf} d={6} size={66}>North Korea at night: <K c={RED}>a black hole</K></Over>
  </>) },
  { at: "But NASA's 2026 data", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <NightCam lf={lf} imgs={[["gf2012", 0], ["gf2025", at("never had")]]} cam={[NO, PW]} move={70} borders={0} />
  ) },
  { at: "What changed", sfx: "glitch", face: "shock", r: ({ lf }) => (<T y={420} size={120} center style={pop(lf, 2, 0.6)}>What <K c={YEL}>changed?</K></T>) },
  { at: "NASA calls it almost completely dark", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <NightCam lf={lf} imgs={BM} cam={[PEN, PEN]} borders={0} glowNK={4} />
    <Over lf={lf} d={at("really dark")} y={840} size={56}>Is North Korea <K c={YEL}>really dark</K> at night?</Over>
  </>) },
  { at: "Three questions", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={150} size={56} color={DIM} style={rise(lf)}>Three questions</T>
    <Item lf={lf} d={at("How dark")} y={290} n="1">How dark is it, really?</Item>
    <Item lf={lf} d={at("What are the few")} y={430} n="2">What are the few lights?</Item>
    <Item lf={lf} d={at("where is the new light")} y={570} n="3">Where is the new light coming from?</Item>
  </>) },
  // ---- 1. the famous picture ----
  { at: "First, the famous picture", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="1 · THE PICTURE" title={<>How dark is <K c={RED}>dark?</K></>} />) },
  { at: "In 2002, U.S. Defense Secretary", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("npr-2002")} />
    <Cap name="npr-2002" lf={lf} dur={dur} y={320} width={1600} marks={[["In 2002", 4]]} />
  </>) },
  { at: "According to NPR, he said", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("npr-rumsfeld")} />
    <Cap name="npr-rumsfeld" lf={lf} dur={dur} y={300} width={1600} marks={[["North Korea is dark.", at("North Korea is dark")]]} />
  </>) },
  { at: "North Korea is dark", sfx: "stamp", noHost: true, r: ({ lf }) => (<>
    <NightCam lf={lf} imgs={BM} cam={[PEN, PEN]} borders={0} glowNK={2} note="NASA Black Marble 2012 (illustration of the view Rumsfeld described)" />
    <Stamp lf={lf} d={2} text="“NORTH KOREA IS DARK”" x={980} y={300} rot={-5} size={64} color={RED} />
  </>) },
  { at: "Twelve years later", sfx: "whoosh", noHost: true, r: ({ lf, dur }) => (<>
    <ISS y={2014} lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.6, y: 0.6, z: 1.25 }} />
    <PhotoCredit text={NASA_ISS + " · ISS038-E-38300"} />
    <Over lf={lf} d={6} size={56}>International Space Station · <K>Jan 30, 2014</K></Over>
  </>) },
  { at: "NASA's description", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nasa-dark")} />
    <Cap name="nasa-dark" lf={lf} dur={dur} y={220} width={1500} marks={[["almost completely dark", at("almost completely dark")]]} />
  </>) },
  { at: "The darkened land, NASA says", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <ISS y={2014} lf={lf} dur={dur} from={{ x: 0.55, y: 0.6, z: 1.4 }} to={{ x: 0.52, y: 0.55, z: 2.0 }} />
    <PhotoCredit text={NASA_ISS} />
    <Over lf={lf} d={4} size={56}>"a patch of water joining the <K c={BLUE}>Yellow Sea</K> to the <K c={BLUE}>Sea of Japan</K>"</Over>
  </>) },
  { at: "Even the coastline is hard to find", sfx: "pop", face: "meh", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nasa-kwh")} />
    <Cap name="nasa-kwh" lf={lf} dur={dur} y={320} width={1600} marks={[["the coast of North Korea is difficult to detect", 4]]} />
  </>) },
  { at: "And Pyongyang, a city of more than three million", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <NightCam lf={lf} imgs={BM} cam={[NO, PW]} move={60} borders={-99} pins={[{ at: "pyongyang", d: at("Pyongyang"), label: "Pyongyang", color: YEL, sub: "3.26 million (2008)" }]} />
  ) },
  { at: "NASA says its light is about the same", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nasa-dark")} />
    <Cap name="nasa-dark" lf={lf} dur={dur} y={220} width={1500} marks={[["appears like a small island", 2], ["equivalent to the smaller towns in South Korea", at("smaller towns")]]} />
  </>) },
  { at: "So why so dark", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={420} size={110} center style={rise(lf)}>Why so dark? <K c={YEL}>Electricity.</K></T>) },
  { at: "NASA's caption gives per person power use", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <Source text={srcOf("nasa-kwh")} />
    <Versus lf={lf} title="Power use per person, per year" a={["South Korea", "10,162 kWh"]} b={["North Korea", "739 kWh"]} d2={at("739")} />
  </>) },
  { at: "About one-fourteenth", sfx: "stamp", face: "shock", r: ({ lf }) => (<>
    <Versus lf={lf} title="Power use per person, per year" a={["South Korea", "10,162 kWh"]} b={["North Korea", "739 kWh"]} d2={-99} />
    <Stamp lf={lf} d={1} text="≈ 1/14" x={760} y={620} rot={-6} size={130} color={YEL} />
  </>) },
  { at: "And the gap hasn't closed", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kt-42")} />
    <Cap name="kt-42" lf={lf} dur={dur} y={300} width={1600} marks={[["25.3 billion kilowatt hours", at("25.3")], ["only 4.2 percent", at("4.2")]]} />
  </>) },
  { at: "That's just 4.2 percent", sfx: "pop", face: "shock", r: ({ lf }) => (<>
    <Source text={srcOf("kt-42")} />
    <T x={160} y={180} size={48} color={DIM} style={rise(lf)}>Electricity generated, 2024</T>
    <div style={{ position: "absolute", left: 160, top: 300, width: 1500, height: 110, background: BLUE, borderRadius: 12, ...rise(lf, 2) }} />
    <T x={190} y={320} size={56} color={BG} style={rise(lf, 4)}>South Korea · 100%</T>
    <div style={{ position: "absolute", left: 160, top: 470, width: 63, height: 110, background: RED, borderRadius: 12, ...rise(lf, 8) }} />
    <T x={250} y={490} size={56} style={rise(lf, 10)}>North Korea · <K c={RED}>4.2%</K></T>
  </>) },
  { at: "National Geographic traces the darkness", sfx: "pop", face: "meh", r: ({ lf, dur }) => (<>
    <Source text={srcOf("ng-1990s")} />
    <Cap name="ng-1990s" lf={lf} dur={dur} y={320} width={1600} marks={[["Since the mid-1990s", 4]]} />
  </>) },
  { at: "Even Kim Jong Un admitted the problem", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-watt")} />
    <Cap name="ja-watt" lf={lf} dur={dur} y={220} width={1300} marks={[["conserve even a single watt of electricity", at("single watt")]]} />
  </>) },
  { at: "That winter, according to the Korea JoongAng Daily", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-blackout")} />
    <Cap name="ja-blackout" lf={lf} dur={dur} y={240} width={1300} marks={[["one of its worst blackout crises in years", at("worst blackout")]]} />
  </>) },
  { at: "So the famous photo checks out", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <NightCam lf={lf} imgs={BM} cam={[PEN, PEN]} borders={0} glowNK={0} />
    <Stamp lf={lf} d={4} text="DARK ✓" x={1180} y={300} rot={-6} size={110} color={LIME} />
    <Over lf={lf} d={at("not all of it")} y={840} size={56}>But <K c={YEL}>not all of it.</K></Over>
  </>) },
  // ---- 2. the few lights ----
  { at: "Part two. The few lights", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="2 · THE FEW LIGHTS" title={<>What's <K c={YEL}>lit?</K></>} />) },
  { at: "In January 2024, another astronaut", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <ISS y={2024} lf={lf} dur={dur} from={{ x: 0.5, y: 0.45, z: 1 }} to={{ x: 0.45, y: 0.35, z: 1.3 }} />
    <PhotoCredit text={NASA_ISS + " · ISS070-E-80670 · Jan 24 2024 · rotated, brightened"} />
  </>) },
  { at: "NASA's caption says only two small clusters", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nasa-two")} />
    <Cap name="nasa-two" lf={lf} dur={dur} y={300} width={1600} marks={[["Only two small clusters of lights", at("only two")]]} />
  </>) },
  { at: "One is Pyongyang, the capital", sfx: "pop", noHost: true, r: ({ lf }) => (
    <NightCam lf={lf} imgs={BM} cam={[PW, PW]} pins={[{ at: "pyongyang", d: 2, label: "Pyongyang", color: YEL }]} />
  ) },
  { at: "The other is a place called Yangdok", sfx: "pop", noHost: true, r: ({ lf }) => (
    <NightCam lf={lf} imgs={BM} cam={[PW, EA]} move={40} pins={[{ at: "pyongyang", d: -99, label: "Pyongyang", color: YEL }, { at: "yangdok", d: 10, label: "Yangdok", color: LIME }]} />
  ) },
  { at: "So what's in Yangdok", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={330} size={86} center style={rise(lf)}>What's in <K>Yangdok?</K></T>
    <T y={460} size={60} center color={DIM} style={rise(lf, at("A factory"))}>A factory? A power plant?</T>
  </>) },
  { at: "NASA doesn't say what the light is", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nasa-two")} />
    <Cap name="nasa-two" lf={lf} dur={dur} y={300} width={1600} marks={[["Yangdŏk", 2]]} />
    <T y={600} size={56} center color={DIM} style={rise(lf, at("built there"))}>NASA doesn't say what the light is.</T>
  </>) },
  { at: "According to the Korea Times, the Yangdok Hot Spring", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kt-yangdok")} />
    <Cap name="kt-yangdok" lf={lf} dur={dur} y={200} width={1500} marks={[["began operations of a new spa resort", 4]]} />
    <Cap name="kt-yangdok2" lf={lf} dur={dur} y={560} width={1300} d={at("Kim Jong Un visited")} marks={[["multiple times", at("several times")]]} />
  </>) },
  { at: "Kim Jong Un visited it several times", sfx: "pop", noHost: true, r: ({ lf }) => (
    <NightCam lf={lf} imgs={BM} cam={[EA, { x: 520, y: 800, z: 6 }]} move={70} pins={[{ at: "yangdok", d: 6, label: "Yangdok", color: LIME, sub: "spa resort opened 2020" }]} />
  ) },
  { at: "We can't confirm the light is the resort", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="Can't confirm it's the resort." b={<K c={YEL}>But one of two bright spots has a new spa.</K>} />
  ) },
  { at: "And Pyongyang isn't lit evenly either", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="juche2" lf={lf} dur={dur} from={{ x: 0.5, y: 0.45, z: 1.1 }} to={{ x: 0.5, y: 0.4, z: 1.6 }} />
    <PhotoCredit name="juche2" extra="Pyongyang at night, 2019" />
  </>) },
  { at: "National Geographic noted that some buildings", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="juche" lf={lf} dur={dur} box={{ x: 700, y: 80, w: 520, h: 560 }} frame from={{ x: 0.5, y: 0.25, z: 1 }} to={{ x: 0.5, y: 0.2, z: 1.2 }} />
    <Cap name="ng-juche" lf={lf} dur={dur} y={680} width={1680} marks={[["never go dark", 4], ["Juche Tower", at("Juche Tower")]]} />
    <PhotoCredit name="juche" extra={"Text: " + srcOf("ng-juche")} />
  </>) },
  { at: "So North Korea isn't uniformly dark", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="wonsan" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.5, y: 0.45, z: 1.3 }} />
    <PhotoCredit name="wonsan" extra="Wonsan, evening, 2014" />
    <Over lf={lf} d={at("where the government")} y={840} size={60}>The lights are <K c={YEL}>where the government puts them.</K></Over>
  </>) },
  { at: "But here's what most people don't know", sfx: "glitch", face: "shock", r: ({ lf }) => (<T y={420} size={100} center style={rise(lf)}>The picture is <K c={YEL}>changing.</K></T>) },
  // ---- 3. brighter? ----
  { at: "Part three. Is it getting brighter", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="3 · BRIGHTER?" title={<>We <K>measured</K> it.</>} />) },
  { at: "We wanted to check this ourselves", sfx: "key", face: "happy", r: ({ lf }) => (<T y={420} size={100} center style={rise(lf)}>We checked it <K>ourselves.</K></T>) },
  { at: "NASA publishes nightly light data", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <NightCam lf={lf} imgs={[["gf2012", 0]]} cam={[PEN, PEN]} note="NASA Black Marble daily night lights (VNP46A2), Oct 15 2012 · via GIBS" />
    <Over lf={lf} d={at("three October nights")} y={840} size={52}>3 October nights a year · <K c={YEL}>2012 → 2026</K></Over>
  </>) },
  { at: "We pulled it for the Korean Peninsula", sfx: "pop", noHost: true, r: ({ lf }) => (
    <NightCam lf={lf} imgs={[["gf2012", 0], ["gf2016", 25], ["gf2020", 50], ["gf2023", 75], ["gf2025", 100]]} cam={[PEN, NO]} move={120} note="NASA Black Marble daily night lights (VNP46A2), Oct 15 of each year · via GIBS" />
  ) },
  { at: "Then we drew the border", sfx: "pop", noHost: true, r: ({ lf }) => (
    <NightCam lf={lf} imgs={[["gf2012", 0]]} cam={[PEN, PEN]} borders={2} glowNK={8} note={OURS} />
  ) },
  { at: "Here's 2012", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <NightCam lf={lf} imgs={[["gf2012", 0]]} cam={[PEN, PEN]} borders={-99} note={OURS} />
    <div style={{ position: "absolute", left: 1220, top: 300, width: 640, ...pop(lf, at("South Korea"), 0.7) }}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: BLUE }}>South Korea</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 110, color: INK }}>14%</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 30, color: DIM }}>of land lit</div>
    </div>
    <div style={{ position: "absolute", left: 1220, top: 600, width: 640, ...pop(lf, at("North Korea"), 0.7) }}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: RED }}>North Korea</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 110, color: INK }}>0.07%</div>
    </div>
  </>) },
  { at: "For years, North Korea barely moved", sfx: "pop", noHost: true, r: ({ lf }) => (<LitChart lf={lf} upTo={2021} />) },
  { at: "Then, after 2022, it started climbing", sfx: "pop", noHost: true, r: ({ lf }) => (<LitChart lf={lf} upTo={2026} />) },
  { at: "By 2025, North Korea's lit area", sfx: "stamp", noHost: true, r: ({ lf }) => (<LitChart lf={lf} upTo={2026} mult={6} />) },
  { at: "South Korea grew too", sfx: "pop", face: "meh", r: ({ lf, at }) => (<>
    <LitChart lf={lf} upTo={2026} showSK={2} />
    <Over lf={lf} d={at("satellite data itself")} y={230} size={40}>Part of the rise is the <K c={YEL}>satellite data itself</K></Over>
  </>) },
  { at: "But North Korea grew much faster", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <NightCam lf={lf} imgs={[["gf2012", 0], ["gf2025", 18]]} cam={[PW, PY]} move={80} pins={[{ at: "pyongyang", d: 4, label: "Pyongyang", color: YEL }]} note={OURS} />
  ) },
  { at: "To be clear, this is our measurement", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={330} size={76} center style={rise(lf)}>Our measurement. <K c={DIM}>Simple method.</K></T>
    <T y={460} size={76} center style={rise(lf, at("other people"))}>So who else <K>measured it?</K></T>
  </>) },
  { at: "In June 2026, the Korea JoongAng Daily", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-study")} />
    <Crop name="ja-study" lf={lf} y0={62} y1={801} y={110} width={900} x={140} marks={[["KAIST", at("KAIST")], ["Max Planck Institute", at("Max Planck")]]} />
  </>) },
  { at: "working with Germany's Max Planck", sfx: "pop", noHost: true, r: ({ lf }) => (
    <NightCam lf={lf} imgs={[["gf2023", 0]]} cam={[PEN, NO]} move={60} borders={0} note="Image: NASA VIIRS night lights, Oct 2023" />
  ) },
  { at: "They tracked night lights in 178", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("ja-259")} />
    <Cap name="ja-259" lf={lf} dur={dur} y={130} width={1000} x={140} marks={[["178 cities, counties and districts", 4]]} />
  </>) },
  { at: "On average, North Korea got 25.9 percent brighter", sfx: "pop", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={srcOf("ja-259")} />
    <Cap name="ja-259" lf={lf} dur={dur} y={130} width={1000} x={140} marks={[["178 cities, counties and districts", -99], ["25.9 percent", 4]]} />
    <T x={1220} y={420} size={130} style={pop(lf, 6, 0.6)}><K c={YEL}>+25.9%</K></T>
  </>) },
  { at: "Pyongyang got 116.5 percent brighter", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-pyongyang")} />
    <Cap name="ja-pyongyang" lf={lf} dur={dur} y={110} width={950} x={140} marks={[["116.5 percent brighter", 4]]} />
    <T x={1180} y={380} size={130} style={pop(lf, 6, 0.6)}><K c={YEL}>+116.5%</K></T>
    <T x={1180} y={540} size={56} style={rise(lf, at("More than double"))}>More than double</T>
  </>) },
  { at: "And in 2025, Pyongyang was nearly nine times", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <NightCam lf={lf} imgs={[["gf2025", 0]]} cam={[NO, NO]} borders={0} pins={[{ at: "pyongyang", d: 4, label: "Pyongyang", color: YEL, sub: "≈ 9× the rest (2025)" }]} />
    <Source text={srcOf("ja-pyongyang")} />
  </>) },
  { at: "A second check", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Photo name="mirae2" lf={lf} dur={dur} box={{ x: 140, y: 110, w: 900, h: 600 }} frame from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.55, y: 0.45, z: 1.25 }} />
    <T x={1100} y={250} size={50} style={rise(lf, 4)}>Daily NK, Aug 2026</T>
    <T x={1100} y={330} size={44} color={DIM} style={rise(lf, 8)}>Pyongyang, April 2020 vs April 2026</T>
    <PhotoCredit name="mirae2" extra="Pyongyang, Mirae Scientists Street, 2015" />
  </>) },
  { at: "compared monthly satellite averages", sfx: "pop", noHost: true, r: ({ lf }) => (
    <NightCam lf={lf} imgs={[["gf2020", 0], ["gf2025", 30]]} cam={[PW, PY]} move={90} pins={[{ at: "pyongyang", d: 2, label: "Pyongyang", color: YEL }]} note="Image: NASA VIIRS night lights, Oct 2020 → Oct 2025 (our illustration)" />
  ) },
  { at: "It found the city's lit area grew", sfx: "pop", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={srcOf("dnk-24")} />
    <Cap name="dnk-24" lf={lf} dur={dur} y={300} width={1600} marks={[["about 2.4 times", 4]]} />
  </>) },
  { at: "That's three measurements", sfx: "stamp", face: "happy", r: ({ lf }) => (<>
    <Item lf={lf} d={2} y={250} n="1" c={YEL}>Ours: lit land ×4–5 since 2012</Item>
    <Item lf={lf} d={8} y={390} n="2" c={YEL}>KAIST study: Pyongyang +116.5%</Item>
    <Item lf={lf} d={14} y={530} n="3" c={YEL}>Daily NK: Pyongyang lit area ×2.4</Item>
    <Stamp lf={lf} d={22} text="SAME DIRECTION" x={640} y={700} rot={-5} size={80} color={LIME} />
  </>) },
  { at: "So where is the new light coming from", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={420} size={96} center style={rise(lf)}>Where is the <K c={YEL}>new light</K> from?</T>) },
  { at: "The study's answer points north", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <NightCam lf={lf} imgs={[["gf2025", 0]]} cam={[PEN, { x: 900, y: 700, z: 1.6 }]} move={50} borders={0} pins={[{ at: "rason", d: at("Russia"), label: "Rason → Russia", color: RED, left: true }]} />
  ) },
  { at: "According to the JoongAng Daily, the brightening began", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-russia")} />
    <Cap name="ja-russia" lf={lf} dur={dur} y={140} width={1100} x={140} marks={[["supplying weapons to Russia starting in mid-2022", at("weapons")]]} />
  </>) },
  { at: "Intelligence authorities estimate", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-barrels")} />
    <Crop name="ja-barrels" lf={lf} y0={74} y1={598} y={120} width={1000} x={140} marks={[["1.5 million barrels", at("1.5 million")], ["500,000 barrels", at("500,000")]]} />
    <T x={1260} y={300} size={90} style={pop(lf, at("1.5 million"), 0.6)}><K c={YEL}>1.5M</K> bbl</T>
    <T x={1260} y={430} size={60} color={DIM} style={rise(lf, at("500,000"))}>UN cap: 0.5M</T>
  </>) },
  { at: "The UN cap is 500,000", sfx: "stamp", face: "shock", r: ({ lf }) => (<>
    <Source text={srcOf("ja-barrels")} />
    <Versus lf={lf} title="Refined petroleum to North Korea, 2024" a={["UN cap", "0.5M bbl"]} b={["Russia (est.)", "1.5M bbl"]} d2={6} />
    <Stamp lf={lf} d={14} text="3× THE CAP" x={760} y={640} rot={-6} size={100} color={YEL} />
  </>) },
  { at: "The researchers are careful", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-coincidence")} />
    <Cap name="ja-coincidence" lf={lf} dur={dur} y={110} width={1100} x={140} marks={[["cannot be conclusively stated", 4], ["difficult to view as a coincidence", at("coincidence")]]} />
  </>) },
  { at: "And look at which places brightened", sfx: "pop", noHost: true, r: ({ lf }) => (
    <NightCam lf={lf} imgs={[["gf2025", 0]]} cam={[NO, NO]} borders={0} />
  ) },
  { at: "After Pyongyang, the biggest gains", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <NightCam lf={lf} imgs={[["gf2025", 0]]} cam={[NO, NO]} borders={-99} pins={[
      { at: "pyongyang", d: 2, label: "Pyongyang", color: YEL, sub: "#1" },
      { at: "wonsan", d: at("Wonsan"), label: "Wonsan", color: LIME, sub: "#2 · Kim's hometown, beach resort" },
      { at: "sinuiju", d: at("Sinuiju"), label: "Sinuiju", color: LIME, sub: "#3 · Chinese border" },
    ]} note="Ranks: KAIST–Max Planck study via Korea JoongAng Daily · image: NASA VIIRS Oct 2025" />
  ) },
  { at: "Arms factory towns brightened too", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <NightCam lf={lf} imgs={[["gf2025", 0]]} cam={[NO, PW]} move={50} borders={-99} pins={[
      { at: "kusong", d: at("Kusong"), label: "Kusong", color: RED, sub: "#8 · ammunition plant" },
      { at: "pyongyang", d: -99, label: "Pyongyang", color: YEL },
    ]} note="Ranks: KAIST–Max Planck study via Korea JoongAng Daily" />
  ) },
  { at: "The researchers describe it", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-pipeline")} />
    <Crop name="ja-pipeline" lf={lf} y0={0} y1={400} y={140} width={1100} x={140} marks={[["“electricity dictatorship pipeline,”", 4]]} />
    <T x={1300} y={300} size={52} style={rise(lf, at("Pyongyang and the arms"))}>Power goes to</T>
    <T x={1300} y={380} size={60} style={rise(lf, at("Pyongyang and the arms") + 4)}><K c={YEL}>Pyongyang</K></T>
    <T x={1300} y={460} size={60} style={rise(lf, at("arms industry"))}><K c={RED}>arms industry</K></T>
  </>) },
  { at: "And the rest of the country? Still dark", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <ISS y={2024} lf={lf} dur={dur} from={{ x: 0.4, y: 0.3, z: 1.3 }} to={{ x: 0.4, y: 0.25, z: 1.6 }} />
    <PhotoCredit text={NASA_ISS + " · Jan 24 2024"} />
  </>) },
  { at: "As of 2024, Seoul was 14.3 times brighter", sfx: "pop", face: "shock", r: ({ lf, dur }) => (<>
    <Source text={srcOf("ja-seoul")} />
    <Cap name="ja-seoul" lf={lf} dur={dur} y={160} width={1200} marks={[["14.3 times brighter than Pyongyang", 6]]} />
  </>) },
  { at: "And Pyongyang was the only place", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <NightCam lf={lf} imgs={[["gf2025", 0]]} cam={[PEN, PEN]} borders={0} pins={[
      { at: "pyongyang", d: 2, label: "Pyongyang", color: YEL, sub: "brighter than Yeongyang" },
      { at: "yeongyang", d: at("Yeongyang"), label: "Yeongyang County", color: BLUE, sub: "≈ 15,000 people" },
    ]} />
    <Source text={srcOf("ja-yeongyang")} />
  </>) },
  // ---- the check ----
  { at: "So, the check", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={380} size={150} center style={pop(lf, 2, 0.6)}>THE <K>CHECK</K></T>) },
  { at: "Claim: North Korea is dark at night", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={300} size={56} color={DIM} center style={rise(lf)}>CLAIM 1</T>
    <T y={400} size={90} center style={rise(lf, 6)}>"North Korea is <K c={RED}>dark</K> at night"</T>
  </>) },
  { at: "Mostly true", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <NightCam lf={lf} imgs={[["gf2025", 0]]} cam={[PEN, PEN]} borders={0} glowNK={0} note={OURS} />
    <Stamp lf={lf} d={1} text="MOSTLY TRUE" x={1120} y={260} rot={-6} size={90} color={LIME} />
    <Over lf={lf} d={at("99 percent")} y={840} size={52}>99%+ of its land <K>unlit</K> on a typical October night</Over>
  </>) },
  { at: "Claim: North Korea is completely dark", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={300} size={56} color={DIM} center style={rise(lf)}>CLAIM 2</T>
    <T y={400} size={80} center style={rise(lf, 6)}>"Completely dark, <K c={YEL}>except Pyongyang</K>"</T>
  </>) },
  { at: "Not quite. Yangdok", sfx: "stamp", noHost: true, r: ({ lf, at }) => (
    <NightCam lf={lf} imgs={[["gf2025", 0]]} cam={[NO, NO]} borders={-99} pins={[
      { at: "yangdok", d: 2, label: "Yangdok", color: LIME, sub: "new spa resort", left: true },
      { at: "wonsan", d: at("beach resort"), label: "Wonsan", color: LIME, sub: "beach resort" },
      { at: "kusong", d: at("arms factory"), label: "Kusong", color: RED, sub: "arms factories" },
    ]} />
  ) },
  { at: "Claim: nothing has changed", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={300} size={56} color={DIM} center style={rise(lf)}>CLAIM 3</T>
    <T y={400} size={86} center style={rise(lf, 6)}>"Nothing has <K c={YEL}>changed</K>"</T>
  </>) },
  { at: "False. Between 2022 and 2025", sfx: "stamp", face: "shock", r: ({ lf, at }) => (<>
    <Stamp lf={lf} d={1} text="FALSE" x={680} y={220} rot={-6} size={180} color={RED} />
    <T y={580} size={64} center style={rise(lf, at("Pyongyang"))}>Pyongyang, 2022 → 2025: <K c={YEL}>+116.5%</K></T>
  </>) },
  { at: "Verdict: dark, but not frozen", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <NightCam lf={lf} imgs={[["gf2012", 0], ["gf2025", 20]]} cam={[NO, PW]} move={90} />
    <Stamp lf={lf} d={2} text="DARK, NOT FROZEN" x={760} y={200} rot={-5} size={100} color={YEL} />
    <Over lf={lf} d={at("Just not for everyone")} y={840} size={56}>The lights are coming back. <K c={RED}>Not for everyone.</K></Over>
  </>) },
  { at: "If you could see one city", sfx: "ding", noHost: true, r: ({ lf, at }) => (<>
    <Photo name="juche" lf={lf} dur={400} from={{ x: 0.5, y: 0.3, z: 1 }} to={{ x: 0.5, y: 0.3, z: 1.1 }} />
    <div style={{ position: "absolute", inset: 0, background: "rgba(10,11,13,0.55)" }} />
    <T y={300} size={80} center style={rise(lf)}>One North Korean city at night:</T>
    <T y={410} size={80} center style={rise(lf, 8)}>which would <K c={YEL}>you</K> want to see?</T>
    <T y={560} size={52} center style={rise(lf, at("comments"))}>Tell Blip in the comments ↓</T>
    <T y={640} size={36} center color={DIM} style={rise(lf, at("comments") + 6)}>BLIP CHECK <K>&gt;_</K> · Maps lie. We check.</T>
  </>) },
];

const TL = makeTimeline(words, LINES as string[], B, 45);
export const MP04_DURATION = TL.duration;
export const Mp04Full: React.FC = () => <Stage tl={TL} audio="mp04/narration.mp3" />;
