import React from "react";
import { Blip, Face, Source, Stamp, T, K, BG, DIM, INK, LIME, RED, pop, rise } from "../bc01/Bc01";
import words from "../../public/mp05/narration.words.json";
import LINES from "../../public/mp05/lines.json";
import { Beat, Cap, Crop, Stage, makeTimeline, srcOf } from "./engine";
import { BLUE, Board, Bulge, Mountains, Photo, PhotoCredit, Survey, Timeline, WCAM, WorldCam, YEL, hasPhoto } from "./Visuals";

// Blip Check — Maps, checked #5: Is Everest really the tallest mountain? 3 rulers, checked (16:9, ~5 min)
// Facts and captures: shorts/mp05-everest-tallest/sources.md. Distances from Earth's center: our WGS84 calculation.

const CALC = "Calculated: WGS84 ellipsoid, official summit heights (geoid ignored, ± a few tens of m)";

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
/** A photo if we have it (license fetched), else a map close-up of the place. */
const Pic: React.FC<{ name: string; lf: number; dur: number; place: "everest" | "mauna" | "chimb" | "kanch"; from?: { x: number; y: number; z: number }; to?: { x: number; y: number; z: number }; extra?: string }> = ({ name, lf, dur, place, from, to, extra }) =>
  hasPhoto(name) ? (<>
    <Photo name={name} lf={lf} dur={dur} from={from} to={to} />
    <PhotoCredit name={name} extra={extra} />
  </>) : (
    <WorldCam lf={lf} cam={[WCAM.world, { everest: WCAM.everest, kanch: WCAM.everest, mauna: { x: 54, y: 373, z: 7 }, chimb: { x: 540, y: 488, z: 7 } }[place]]} move={70}
      pins={[{ at: place, d: 30, label: extra ?? place, color: YEL }]} />
  );

const W0 = WCAM.world;
const RULERS = (lf: number, at: (p: string) => number, hi?: number) => (<>
  <Item lf={lf} d={2} y={260} n="1" c={hi === 1 ? YEL : LIME}>From sea level</Item>
  <Item lf={lf} d={8} y={400} n="2" c={hi === 2 ? YEL : LIME}>From the base</Item>
  <Item lf={lf} d={14} y={540} n="3" c={hi === 3 ? YEL : LIME}>From Earth's center</Item>
</>);

export const B: Beat[] = [
  // ---- hook ----
  { at: "You learned Everest is the tallest", sfx: "whoosh", noHost: true, r: ({ lf, dur }) => (<>
    <Pic name="everest" lf={lf} dur={dur} place="everest" from={{ x: 0.5, y: 0.45, z: 1 }} to={{ x: 0.5, y: 0.4, z: 1.3 }} extra="Mount Everest" />
    <Over lf={lf} d={8} size={70}>Everest: <K c={YEL}>8,849 m</K></Over>
  </>) },
  { at: "NOAA says it's not", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("noaa-mauna")} />
    <Cap name="noaa-mauna" lf={lf} dur={dur} y={240} width={1300} marks={[["Everest is not the tallest mountain on Earth", 2]]} />
    <T y={620} size={60} center style={rise(lf, at("closest to the stars"))}>…and never the closest <K c={YEL}>to the stars</K></T>
  </>) },
  { at: "So which mountain wins", sfx: "pop", noHost: true, r: ({ lf }) => (
    <WorldCam lf={lf} cam={[W0, W0]} pins={[{ at: "everest", d: 2, label: "Everest", color: INK }, { at: "mauna", d: 8, label: "Mauna Kea", color: BLUE }, { at: "chimb", d: 14, label: "Chimborazo", color: LIME }]} />
  ) },
  { at: "It depends on the ruler", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={130} size={56} color={DIM} style={rise(lf)}>Three rulers</T>
    {RULERS(lf, at)}
  </>) },
  { at: "So, three questions", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={150} size={56} color={DIM} style={rise(lf)}>Three questions</T>
    <Item lf={lf} d={at("How tall is Everest")} y={290} n="1">How tall is Everest, really?</Item>
    <Item lf={lf} d={at("from the bottom")} y={430} n="2">Who beats it from the bottom?</Item>
    <Item lf={lf} d={at("from the center")} y={570} n="3">Who beats it from Earth's center?</Item>
  </>) },
  // ---- 1. the number ----
  { at: "First, the number itself", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="1 · THE NUMBER" title={<>How tall is <K c={YEL}>Everest?</K></>} />) },
  { at: "In 2020, China and Nepal announced", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <Pic name="everest3" lf={lf} dur={160} place="everest" from={{ x: 0.5, y: 0.4, z: 1 }} to={{ x: 0.55, y: 0.35, z: 1.25 }} extra="Mount Everest" />
    <Over lf={lf} d={at("8,848.86")} y={820} size={80}><K c={YEL}>8,848.86 m</K> · China + Nepal, 2020</Over>
  </>) },
  { at: "According to Al Jazeera, that was", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-8848")} />
    <Cap name="aj-8848" lf={lf} dur={dur} y={300} width={1600} marks={[["8,848.86 metres", 2], ["about four metres higher than China’s", at("four meters")]]} />
  </>) },
  { at: "Wait. Four meters", sfx: "glitch", face: "shock", r: ({ lf }) => (<T y={420} size={110} center style={pop(lf, 2, 0.6)}>Four <K c={YEL}>meters?</K></T>) },
  { at: "Measuring it has never been simple", sfx: "whoosh", noHost: true, r: ({ lf }) => (
    <WorldCam lf={lf} cam={[W0, WCAM.asia]} move={70} pins={[{ at: "india", d: 30, label: "British India", color: YEL }, { at: "everest", d: 40, label: "Peak XV", color: INK }]} />
  ) },
  { at: "In 1849 and 1850, British surveyors", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("hj-peakxv")} />
    <Cap name="hj-peakxv" lf={lf} dur={dur} y={300} width={1500} marks={[["Peak XV", at("Peak XV")]]} />
  </>) },
  { at: "They weren't anywhere near it", sfx: "pop", noHost: true, r: ({ lf, at }) => (<Survey lf={lf} rays={at("stations")} />) },
  { at: "From there, Peak XV didn't even look special", sfx: "pop", noHost: true, r: ({ lf, at }) => (<Survey lf={lf} rays={-99} hide={at("hidden")} />) },
  { at: "At the time, people believed Kanchenjunga", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("hj-hidden")} />
    <Cap name="hj-hidden" lf={lf} dur={dur} y={100} width={1000} x={140} marks={[["hidden by lower peaks", 2], ["Kanchenjunga was the highest mountain in the world", at("Kanchenjunga")]]} />
  </>) },
  { at: "Six stations measured it", sfx: "pop", noHost: true, r: ({ lf }) => (<Survey lf={lf} rays={0} hide={-99} />) },
  { at: "28,991 feet", sfx: "key", noHost: true, r: ({ lf }) => (<Survey lf={lf} rays={-99} hide={-99} nums={0} />) },
  { at: "And 28,990", sfx: "pop", face: "shock", r: ({ lf, dur }) => (<>
    <Source text={srcOf("hj-six")} />
    <Cap name="hj-six" lf={lf} dur={dur} y={300} width={1500} marks={[["28991-6, 29005-3, 29001-8, 28998-6, 29026-1, and 28990-4 feet", 2]]} />
  </>) },
  { at: "The surveyors took the average", sfx: "stamp", noHost: true, r: ({ lf }) => (<Survey lf={lf} rays={-99} hide={-99} nums={-99} mean={4} />) },
  { at: "And here's the hard part. The air bends light", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <Survey lf={lf} rays={-99} hide={-99} bend={at("bends light")} />
    <Over lf={lf} d={at("1,375")} y={120} size={64}>Correction for bending light: <K c={YEL}>1,375 ft</K></Over>
  </>) },
  { at: "It took until 1852", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("hj-1852")} />
    <Cap name="hj-1852" lf={lf} dur={dur} y={160} width={1300} marks={[["1852", 2], ["1865", at("1865")]]} />
  </>) },
  { at: "And the peak was named after Sir George Everest", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    {hasPhoto("geverest") && <Photo name="geverest" lf={lf} dur={dur} box={{ x: 140, y: 110, w: 520, h: 680 }} frame from={{ x: 0.5, y: 0.35, z: 1 }} to={{ x: 0.5, y: 0.3, z: 1.15 }} />}
    {hasPhoto("geverest") && <PhotoCredit name="geverest" extra="Sir George Everest" />}
    <Cap name="hj-name" lf={lf} dur={dur} y={320} width={hasPhoto("geverest") ? 1100 : 1600} x={hasPhoto("geverest") ? 720 : undefined} marks={[["Sir George Everest", 2], ["retired in 1843", at("retired")]]} />
    <Source text={srcOf("hj-name")} />
  </>) },
  { at: "Then, in the early 1950s", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-1950s")} />
    <Crop name="aj-1950s" lf={lf} y0={0} y1={110} y={320} width={1600} marks={[["Survey of India in the early 1950s", at("1950s")]]} />
  </>) },
  { at: "But not everywhere. In 2007", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("npr-29035")} />
    <Cap name="npr-29035" lf={lf} dur={dur} y={300} width={1600} marks={[["29,035 feet", at("29,035")]]} />
    <T y={520} size={64} center style={rise(lf, at("8,850"))}>≈ <K c={YEL}>8,850 m</K></T>
  </>) },
  { at: "And after a big earthquake in 2015", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-2015")} />
    <Cap name="aj-2015" lf={lf} dur={dur} y={200} width={1500} marks={[["a 2015 earthquake", 4], ["May 2019", at("2019")]]} />
  </>) },
  { at: "Nepal sent its own team", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="everest3" lf={lf} dur={dur} from={{ x: 0.5, y: 0.4, z: 1.2 }} to={{ x: 0.55, y: 0.35, z: 1.5 }} />
    <PhotoCredit name="everest3" extra="Mount Everest" />
    <Over lf={lf} d={2} y={780} size={56}>Nepal's team on the summit: <K c={YEL}>2019</K></Over>
    <Over lf={lf} d={at("China sent one")} y={880} size={56}>China's team: <K c={YEL}>2020</K></Over>
  </>) },
  { at: "Result: 8,848.86 meters", sfx: "stamp", noHost: true, r: ({ lf }) => (
    <Timeline lf={lf} items={[["1856–65", "29,002 ft", "Survey of India", 2], ["1950s", "8,848 m", "Survey of India", 8], ["2007", "29,035 ft", "as quoted by NPR", 14], ["2020", "8,848.86 m", "China + Nepal", 20]]} />
  ) },
  { at: "So Everest is the highest point above sea level", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("noaa-everest")} />
    <Cap name="noaa-everest" lf={lf} dur={dur} y={200} width={1300} marks={[["the highest point above global mean sea level", 4]]} />
  </>) },
  { at: "But \"highest\" and \"tallest\"", sfx: "blip", noHost: true, r: ({ lf }) => (<Aside lf={lf} face="prompt" a="Highest ≠ tallest." b={<K c={YEL}>Ruler number two.</K>} />) },
  // ---- 2. from the bottom ----
  { at: "Part two. From the bottom", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="2 · FROM THE BOTTOM" title={<>Base <K c={YEL}>to peak</K></>} />) },
  { at: "What if you measure a mountain from its base", sfx: "pop", noHost: true, r: ({ lf }) => (<Mountains lf={lf} show={["everest"]} />) },
  { at: "NOAA's answer", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Pic name="mauna" lf={lf} dur={dur} place="mauna" from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.5, y: 0.45, z: 1.3 }} extra="Mauna Kea, Hawaii" />
    <Over lf={lf} d={at("Mauna Kea")} y={820} size={66}>Mauna Kea, <K c={BLUE}>Hawaii</K></Over>
  </>) },
  { at: "Above the water, it's only about 4,200", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <Mountains lf={lf} show={["everest", "mauna"]} d={[-99, 2]} />
    <Source text={srcOf("wiki-4207")} />
  </>) },
  { at: "But it starts deep under the Pacific", sfx: "pop", noHost: true, r: ({ lf, at }) => (<Mountains lf={lf} show={["everest", "mauna"]} d={[-99, -99]} base={at("deep under")} />) },
  { at: "That's more than a kilometer taller", sfx: "stamp", face: "shock", r: ({ lf, dur }) => (<>
    <Source text={srcOf("noaa-mauna")} />
    <Cap name="noaa-mauna" lf={lf} dur={dur} y={200} width={1300} marks={[["more than 10,210 meters from base to peak", 2]]} />
    <T y={560} size={70} center style={rise(lf, 6)}>10,210 − 8,849 = <K c={YEL}>1,361 m</K></T>
  </>) },
  { at: "So Everest loses? Not so fast", sfx: "pop", face: "prompt", r: ({ lf }) => (<T y={420} size={110} center style={rise(lf)}>Not so <K c={YEL}>fast.</K></T>) },
  { at: "Here's the catch. Where exactly is the base", sfx: "pop", noHost: true, r: ({ lf, at }) => (<Mountains lf={lf} show={["everest", "mauna"]} d={[-99, -99]} base={-99} baseRange={at("base of a mountain")} />) },
  { at: "According to Wikipedia's summary", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("wiki-base")} />
    <Cap name="wiki-base" lf={lf} dur={dur} y={260} width={1600} marks={[["base is loosely defined", 2], ["32,696 ft (9,966 m)", at("9,966")], ["56,447 ft (17,205 m)", at("17,205")]]} />
  </>) },
  { at: "to 17,205 meters", sfx: "pop", noHost: true, r: ({ lf }) => (<Mountains lf={lf} show={["everest", "mauna"]} d={[-99, -99]} base={-99} baseRange={2} note="Base definitions: 9,966 m (trench) to 17,205 m (root), per Wikipedia" />) },
  { at: "And Mauna Kea is so heavy", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("wiki-depress")} />
    <Cap name="wiki-depress" lf={lf} dur={dur} y={300} width={1500} marks={[["depress the ocean crust beneath it by 3.7 mi (6 km)", at("six kilometers")]]} />
  </>) },
  { at: "So \"tallest\" depends on where you start counting", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Pic name="mauna" lf={lf} dur={dur} place="mauna" from={{ x: 0.4, y: 0.4, z: 1.3 }} to={{ x: 0.38, y: 0.4, z: 1.7 }} extra="Mauna Kea summit area" />
    <Over lf={lf} d={at("Mauna Kea wins")} y={820} size={64}>By NOAA's figure: <K c={YEL}>Mauna Kea wins</K></Over>
  </>) },
  { at: "And there's a third ruler", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>{RULERS(lf, at, 3)}</>) },
  // ---- 3. from the center ----
  { at: "Part three. From the center of the Earth", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="3 · FROM EARTH'S CENTER" title={<>The <K c={YEL}>bulge</K></>} />) },
  { at: "The Earth isn't a perfect ball", sfx: "pop", noHost: true, r: ({ lf, at }) => (<Bulge lf={lf} flat={at("bulges")} />) },
  { at: "Sea level at the equator is about 21 kilometers", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <Bulge lf={lf} flat={-99} />
    <Over lf={lf} d={4} y={110} size={56}>Equator sea level: <K c={YEL}>~21 km</K> farther out than the poles</Over>
  </>) },
  { at: "So a mountain near the equator gets a head start", sfx: "pop", noHost: true, r: ({ lf }) => (
    <WorldCam lf={lf} cam={[W0, W0]} equator={0} pins={[{ at: "everest", d: 10, label: "Everest · 28°N", color: INK }, { at: "chimb", d: 16, label: "Chimborazo · 1.5°S", color: LIME }]} />
  ) },
  { at: "Meet Chimborazo", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Pic name="chimb" lf={lf} dur={dur} place="chimb" from={{ x: 0.5, y: 0.45, z: 1 }} to={{ x: 0.5, y: 0.4, z: 1.3 }} extra="Chimborazo, Ecuador" />
    <Over lf={lf} d={4} y={820} size={66}>Chimborazo, <K c={LIME}>Ecuador</K> · 1° south of the equator</Over>
  </>) },
  { at: "It's 6,263 meters above sea level", sfx: "pop", noHost: true, r: ({ lf }) => (<Mountains lf={lf} show={["everest", "chimb"]} d={[-99, 2]} note="Heights to scale · Chimborazo: 6,263 m (Wikipedia)" />) },
  { at: "But measured from the center of the Earth, NOAA says", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("noaa-chimb")} />
    <Cap name="noaa-chimb" lf={lf} dur={dur} y={110} width={1200} x={140} marks={[["one degree south of the Equator", 2], ["over 2,072 meters farther from the center of the Earth", at("2,072")]]} />
  </>) },
  { at: "NOAA calls it the closest point", sfx: "ding", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={srcOf("noaa-chimb")} />
    <Cap name="noaa-chimb" lf={lf} dur={dur} y={110} width={1200} x={140} marks={[["the closest point on Earth to the stars", 2]]} />
  </>) },
  { at: "And again, the sources disagree", sfx: "glitch", face: "shock", r: ({ lf }) => (<T y={420} size={96} center style={rise(lf)}>The sources <K c={RED}>disagree</K> again.</T>) },
  { at: "NOAA: over 2,072 meters", sfx: "pop", face: "prompt", r: ({ lf, at }) => (
    <Board lf={lf} title="How much farther is Chimborazo's summit?" rows={[["NOAA", "> 2,072 m"], ["Library of Congress", "2,163 m"], ["Wikipedia", "2,168 m"], ["NPR (2007, quoting Joseph Senne)", "1.5 mi ≈ 2,400 m", YEL]]}
      shown={[2, at("Library of Congress"), at("Wikipedia"), at("NPR")]} />
  ) },
  { at: "And NPR, in 2007", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("npr-15")} />
    <Cap name="npr-15" lf={lf} dur={dur} y={320} width={1300} marks={[["1.5 miles higher", 4]]} />
    <T y={520} size={64} center style={rise(lf, at("2,400"))}>1.5 miles ≈ <K c={YEL}>2,400 m</K></T>
  </>) },
  { at: "So we did the math ourselves", sfx: "key", face: "happy", r: ({ lf }) => (<T y={420} size={100} center style={rise(lf)}>So we did <K>the math.</K></T>) },
  { at: "We used the standard shape of the Earth", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <Bulge lf={lf} flat={-99} lines={6} />
    <Source text={CALC} />
  </>) },
  { at: "Everest's summit: about 6,382.3", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <Bulge lf={lf} flat={-99} lines={-99} nums={0} />
    <Source text={CALC} />
  </>) },
  { at: "The difference: about 2,080 meters", sfx: "stamp", noHost: true, r: ({ lf }) => (<>
    <Bulge lf={lf} flat={-99} lines={-99} nums={-99} diff={2} />
    <Source text={CALC} />
  </>) },
  { at: "That's close to NOAA's number", sfx: "pop", face: "happy", r: ({ lf, at }) => (
    <Board lf={lf} title="How much farther is Chimborazo's summit?" rows={[["NOAA", "> 2,072 m"], ["Library of Congress", "2,163 m"], ["Wikipedia", "2,168 m"], ["NPR (2007, quoting Joseph Senne)", "1.5 mi ≈ 2,400 m", YEL]]}
      shown={[-99, -99, -99, -99]} ours={["Our calculation (WGS84)", "≈ 2,080 m", 2]} />
  ) },
  { at: "Chimborazo is farther out", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Pic name="chimb" lf={lf} dur={dur} place="chimb" from={{ x: 0.48, y: 0.48, z: 1.6 }} to={{ x: 0.48, y: 0.48, z: 2.4 }} extra="Chimborazo, close-up" />
    <Over lf={lf} d={4} y={820} size={64}>Farther out by <K c={LIME}>about 2 km</K></Over>
  </>) },
  { at: "Here's the fun part", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("loc-believed")} />
    <Cap name="loc-believed" lf={lf} dur={dur} y={300} width={1500} marks={[["believed by many that Mount Chimborazo was the highest mountain in the world", at("highest mountain")]]} />
  </>) },
  { at: "According to the Library of Congress, Alexander von Humboldt", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    {hasPhoto("humboldt") && <Photo name="humboldt" lf={lf} dur={dur} box={{ x: 140, y: 90, w: 820, h: 560 }} frame from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.45, y: 0.5, z: 1.2 }} />}
    {hasPhoto("humboldt") && <PhotoCredit name="humboldt" extra="Humboldt and Bonpland at Chimborazo" />}
    {!hasPhoto("humboldt") && <WorldCam lf={lf} cam={[W0, WCAM.ecuador]} move={70} equator={-99} pins={[{ at: "chimb", d: 30, label: "Chimborazo", color: LIME, sub: "Humboldt's attempt, 1802" }]} />}
  </>) },
  { at: "He reached 19,286 feet", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("loc-humboldt")} />
    <Cap name="loc-humboldt" lf={lf} dur={dur} y={300} width={1600} marks={[["19,286 feet", 2], ["stopping 1,000 feet short", at("thousand feet")]]} />
  </>) },
  { at: "The first recorded ascent came in 1880", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("loc-whymper")} />
    <Cap name="loc-whymper" lf={lf} dur={dur} y={300} width={1500} marks={[["1880, Edward Whymper", 2], ["the first to record this achievement", 8]]} />
  </>) },
  { at: "It lost the title of highest", sfx: "blip", noHost: true, r: ({ lf }) => (<Aside lf={lf} face="happy" a="Lost: highest mountain." b={<K c={LIME}>Kept: farthest from Earth's center.</K>} />) },
  // ---- the check ----
  { at: "So, the check", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={380} size={150} center style={pop(lf, 2, 0.6)}>THE <K>CHECK</K></T>) },
  { at: "Claim one", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={300} size={56} color={DIM} center style={rise(lf)}>CLAIM 1</T>
    <T y={400} size={86} center style={rise(lf, 6)}>Everest is the <K c={YEL}>highest</K> above sea level</T>
  </>) },
  { at: "True. 8,848.86 meters", sfx: "stamp", noHost: true, r: ({ lf, dur }) => (<>
    <Pic name="everest" lf={lf} dur={dur} place="everest" from={{ x: 0.5, y: 0.45, z: 1.1 }} to={{ x: 0.5, y: 0.4, z: 1.25 }} extra="Mount Everest" />
    <Stamp lf={lf} d={1} text="TRUE" x={760} y={300} rot={-6} size={170} color={LIME} />
  </>) },
  { at: "Claim two", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={300} size={56} color={DIM} center style={rise(lf)}>CLAIM 2</T>
    <T y={400} size={86} center style={rise(lf, 6)}>Everest is the <K c={YEL}>tallest</K> mountain</T>
  </>) },
  { at: "False, by NOAA's definition", sfx: "stamp", noHost: true, r: ({ lf }) => (<>
    <Mountains lf={lf} show={["everest", "mauna"]} d={[-99, -99]} base={-99} />
    <Stamp lf={lf} d={1} text="FALSE" x={660} y={120} rot={-6} size={140} color={RED} />
  </>) },
  { at: "Claim three", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={300} size={56} color={DIM} center style={rise(lf)}>CLAIM 3</T>
    <T y={400} size={80} center style={rise(lf, 6)}>Everest's top is the <K c={YEL}>closest to space</K></T>
  </>) },
  { at: "False. Chimborazo's summit", sfx: "stamp", noHost: true, r: ({ lf }) => (<>
    <Bulge lf={lf} flat={-99} lines={-99} nums={-99} diff={-99} />
    <Stamp lf={lf} d={1} text="FALSE" x={1260} y={760} rot={-6} size={120} color={RED} />
  </>) },
  { at: "Verdict: Everest is the highest", sfx: "stamp", face: "happy", r: ({ lf, at }) => (<>
    <Item lf={lf} d={2} y={250} n="1" c={YEL}>Highest above sea level: Everest</Item>
    <Item lf={lf} d={at("not the tallest")} y={390} n="2" c={BLUE}>Tallest base to peak: Mauna Kea</Item>
    <Item lf={lf} d={at("farthest out")} y={530} n="3" c={LIME}>Farthest from the center: Chimborazo</Item>
  </>) },
  { at: "Three rulers. Three winners", sfx: "pop", noHost: true, r: ({ lf }) => (
    <WorldCam lf={lf} cam={[W0, W0]} equator={-99} pins={[{ at: "everest", d: 2, label: "Everest", color: YEL, sub: "highest" }, { at: "mauna", d: 6, label: "Mauna Kea", color: BLUE, sub: "tallest" }, { at: "chimb", d: 10, label: "Chimborazo", color: LIME, sub: "farthest out" }]} />
  ) },
  { at: "Which ruler do you think is the fair one", sfx: "ding", noHost: true, r: ({ lf, at }) => (<>
    <T y={260} size={80} center style={rise(lf)}>Which ruler is <K c={YEL}>the fair one?</K></T>
    <T y={400} size={52} center color={DIM} style={rise(lf, 6)}>Sea level · Base · Earth's center</T>
    <T y={540} size={52} center style={rise(lf, at("comments"))}>Tell Blip in the comments ↓</T>
    <T y={620} size={36} center color={DIM} style={rise(lf, at("comments") + 6)}>BLIP CHECK <K>&gt;_</K> · Maps lie. We check.</T>
  </>) },
];

const TL = makeTimeline(words, LINES as string[], B, 45);
export const MP05_DURATION = TL.duration;
export const Mp05Full: React.FC = () => <Stage tl={TL} audio="mp05/narration.mp3" />;
