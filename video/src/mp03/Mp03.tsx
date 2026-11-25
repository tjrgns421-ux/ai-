import React from "react";
import { Blip, Face, Source, Stamp, T, K, BG, DIM, INK, LIME, RED, pop, rise } from "../bc01/Bc01";
import words from "../../public/mp03/narration.words.json";
import LINES from "../../public/mp03/lines.json";
import { Beat, Cap, Crop, Stage, makeTimeline, srcOf } from "./engine";
import { BLUE, BeringCam, CAM, DayClocks, Photo, PhotoCredit, YEL } from "./Visuals";

// Blip Check — Maps, checked #3: Russia is 2.4 miles from Alaska. Can you see it? (16:9, ~8 min)
// Facts and captures: shorts/mp03-alaska-russia/sources.md. Distance measured on Natural Earth; time offsets from the tz database.

const MEAS = "Measured: Natural Earth 1:10m (public domain)";
const TZ = "Calculated: tz database (America/Nome, Asia/Anadyr)";

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
const Over: React.FC<{ lf: number; d?: number; y?: number; size?: number; children: React.ReactNode }> = ({ lf, d = 0, y = 780, size = 70, children }) => (
  <div style={{ position: "absolute", left: 120, right: 120, top: y, ...rise(lf, d) }}>
    <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: size, color: INK, background: "rgba(10,11,13,0.78)", padding: "10px 26px", borderRadius: 14, lineHeight: 1.35, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>
  </div>
);
const Section: React.FC<{ lf: number; n: string; title: React.ReactNode }> = ({ lf, n, title }) => (<>
  <T y={330} size={56} color={LIME} style={rise(lf)}>{n}</T>
  <T y={420} size={110} style={pop(lf, 3, 0.7)}>{title}</T>
</>);
/** The number board: each source's distance, one row per source. */
const ROWS: [string, string, string][] = [
  ["NASA Earth Observatory", "2.4 mi", LIME],
  ["Slate", "< 2.5 mi", INK],
  ["Park Service (Alaska page)", "≈ 2.5 mi", INK],
  ["Park Service (Lynne Cox page)", "2.7 mi", YEL],
  ["National Geographic (text)", "≈ 2 mi", INK],
  ["National Geographic (caption)", "1.8 mi", RED],
];
const Board: React.FC<{ lf: number; shown: (number | undefined)[]; ours?: number; strike?: number }> = ({ lf, shown, ours, strike }) => (<>
  <T x={140} y={90} size={44} color={DIM} style={rise(lf)}>Little Diomede ↔ Big Diomede</T>
  {ROWS.map(([who, n, c], i) => shown[i] === undefined ? null : (
    <div key={who} style={{ position: "absolute", left: 140, top: 170 + i * 104, width: 1360, display: "flex", justifyContent: "space-between", fontFamily: "Pretendard", fontWeight: 900, fontSize: 50, color: INK, ...rise(lf, shown[i]) }}>
      <span style={{ opacity: 0.85 }}>{who}</span>
      <span style={{ color: c, textDecoration: strike !== undefined && lf >= strike && (i === 3 || i === 5) ? "line-through" : undefined }}>{n}</span>
    </div>
  ))}
  {ours !== undefined && (
    <div style={{ position: "absolute", left: 120, top: 800, width: 1400, display: "flex", justifyContent: "space-between", fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, color: BG, background: LIME, padding: "10px 20px", borderRadius: 14, boxSizing: "border-box", ...pop(lf, ours, 0.7) }}>
      <span>Our measurement (Natural Earth)</span><span>≈ 2.45 mi</span>
    </div>
  )}
</>);

const WI = CAM.wide, AK = CAM.alaska, ST = CAM.strait, SW = CAM.sWide, SI = CAM.sIslands, TI = CAM.sTight, SC = CAM.sCape;

export const B: Beat[] = [
  // ---- hook ----
  { at: "You know I can see Russia from my house", sfx: "whoosh", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="jul2006" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.5, y: 0.55, z: 1.35 }} />
    <PhotoCredit name="jul2006" />
    <Over lf={lf} d={4} y={120} size={66}>"I can see Russia <K c={YEL}>from my house</K>"</Over>
  </>) },
  { at: "Palin never said it in 2008", sfx: "stamp", face: "shock", r: ({ lf }) => (<>
    <T y={300} size={70} center color={DIM} style={rise(lf)}>Sarah Palin, 2008</T>
    <Stamp lf={lf} d={6} text="NEVER SAID IT" x={480} y={420} rot={-6} size={130} color={RED} />
  </>) },
  { at: "But from this Alaskan island", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="village2" lf={lf} dur={dur} from={{ x: 0.5, y: 0.45, z: 1 }} to={{ x: 0.45, y: 0.35, z: 1.4 }} />
    <PhotoCredit name="village2" extra="Little Diomede, Alaska" />
    <Over lf={lf} d={at("you really can")} y={150} size={64}>From this island, <K>you really can.</K></Over>
  </>) },
  { at: "Is it 2.4 miles away", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="aster" lf={lf} dur={dur} box={{ x: 510, y: 110, w: 900, h: 720 }} frame from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.5, y: 0.5, z: 1.15 }} />
    <PhotoCredit name="aster" extra="Big Diomede (left) · Little Diomede (right)" />
    <Over lf={lf} d={4} y={850} size={60}><K c={YEL}>2.4 miles</K> away?</Over>
  </>) },
  { at: "NASA says 2.4", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<Board lf={lf} shown={[2, undefined, undefined, at("Park Service"), undefined, at("National Geographic")]} />) },
  { at: "And across that water", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <BeringCam lf={lf} map="strait" cam={[SI, SI]} days={at("tomorrow")} dayNames={["TODAY", "TOMORROW"]} border={0} pins={[{ at: "little", d: 2, label: "Little Diomede", color: BLUE }, { at: "big", d: 4, label: "Big Diomede", color: RED, left: true }]} />
  </>) },
  { at: "So, three questions", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={150} size={56} color={DIM} style={rise(lf)}>Three questions</T>
    <Item lf={lf} d={at("Who actually said")} y={290} n="1">Who actually said that line?</Item>
    <Item lf={lf} d={at("How far away")} y={430} n="2">How far away is Russia, really?</Item>
    <Item lf={lf} d={at("And why couldn't")} y={570} n="3">Why couldn't anyone cross for 40 years?</Item>
  </>) },
  // ---- 1. the line ----
  { at: "First, the line", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="1 · THE LINE" title={<>Who said <K c={YEL}>"my house"?</K></>} />) },
  { at: "We pulled the transcript", sfx: "key", face: "happy", r: ({ lf }) => (<T y={420} size={100} center style={rise(lf)}>We pulled <K>the transcript.</K></T>) },
  { at: "On September 11, 2008", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={260} size={64} center color={DIM} style={rise(lf)}>ABC News · Charlie Gibson</T>
    <T y={360} size={120} center style={pop(lf, at("2008"), 0.6)}>Sept 11, <K>2008</K></T>
    <T y={560} size={52} center style={rise(lf, at("insight"))}>"What insight does Alaska's closeness to Russia give you?"</T>
  </>) },
  { at: "Her answer, in the transcript", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ucsb-palin")} />
    <Cap name="ucsb-palin" lf={lf} dur={dur} y={300} width={1600} marks={[["you can actually see Russia from land here in Alaska", at("you can actually see")]]} />
  </>) },
  { at: "No house", sfx: "stamp", face: "shock", r: ({ lf }) => (<Stamp lf={lf} d={1} text="NO HOUSE" x={560} y={360} rot={-6} size={170} color={YEL} />) },
  { at: "Two days later, on the season premiere", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("snopes-twodays")} />
    <Cap name="snopes-twodays" lf={lf} dur={dur} y={200} width={1500} marks={[["Two days later", 4], ["Tina Fey and Amy Poehler", at("Tina Fey")]]} />
  </>) },
  { at: "And Fey's Palin said", sfx: "pop", face: "happy", r: ({ lf, at }) => (<>
    <T y={260} size={52} center color={DIM} style={rise(lf)}>Tina Fey as Palin, SNL, Sept 13 2008</T>
    <T y={380} size={110} center style={pop(lf, at("I can see"), 0.6)}>"I can see Russia</T>
    <T y={510} size={110} center style={pop(lf, at("my house"), 0.6)}><K c={YEL}>from my house."</K></T>
  </>) },
  { at: "Snopes calls it", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("snopes-fey")} />
    <Cap name="snopes-fey" lf={lf} dur={dur} y={260} width={1500} marks={[["did not say 'I can see Russia from my house.'", 4], ["originated with an SNL spoof", at("originated")]]} />
  </>) },
  { at: "According to Wikipedia, it was written", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("wiki-shoemaker")} />
    <Cap name="wiki-shoemaker" lf={lf} dur={dur} y={320} width={1600} marks={[["written by SNL producer Mike Shoemaker", at("Mike Shoemaker")]]} />
  </>) },
  { at: "So the famous quote isn't hers", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="The famous quote isn't hers." b={<K c={YEL}>But is her claim true?</K>} />
  ) },
  { at: "Can you actually see Russia from land", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="village" lf={lf} dur={dur} from={{ x: 0.4, y: 0.6, z: 1 }} to={{ x: 0.3, y: 0.65, z: 1.3 }} />
    <PhotoCredit name="village" extra="Little Diomede" />
    <Over lf={lf} d={4} y={120} size={60}>"you can actually see Russia <K>from land here in Alaska</K>"</Over>
  </>) },
  // ---- the map ----
  { at: "To answer that, we need a map", sfx: "whoosh", noHost: true, r: ({ lf }) => (<BeringCam lf={lf} cam={[{ x: 1100, y: 600, z: 0.85 }, WI]} move={50} />) },
  { at: "Here's Alaska", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <BeringCam lf={lf} cam={[WI, WI]} glowUS={0} glowRU={at("Here's Russia")} labels={0} pins={[{ at: "little", d: at("Bering Strait"), label: "Bering Strait", color: YEL }]} />
  ) },
  { at: "At its narrowest, NASA says", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <BeringCam lf={lf} map="strait" cam={[SW, SW]} glowUS={0} glowRU={0} pins={[{ at: "capePW", d: 6, label: "Cape Prince of Wales", color: BLUE }, { at: "dezhnev", d: 14, label: "Cape Dezhnev", color: RED }]} />
  ) },
  { at: "82 kilometers, or 51 miles", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nasa-82")} />
    <Cap name="nasa-82" lf={lf} dur={dur} y={300} width={1600} marks={[["82 kilometers (51 miles)", 4]]} />
  </>) },
  { at: "The Park Service rounds it", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nps-55")} />
    <Cap name="nps-55" lf={lf} dur={dur} y={260} width={1100} marks={[["approximately 55 miles", 4]]} />
  </>) },
  { at: "Either way, too far to see a house", sfx: "blip", noHost: true, r: ({ lf }) => (<Aside lf={lf} face="meh" a="51 to 55 miles." b={<K c={YEL}>Too far to see a house.</K>} />) },
  { at: "But zoom in", sfx: "whoosh", noHost: true, r: ({ lf }) => (<BeringCam lf={lf} map="strait" cam={[SW, SI]} move={70} glowUS={-99} glowRU={-99} />) },
  { at: "The small one is Little Diomede", sfx: "pop", noHost: true, r: ({ lf }) => (
    <BeringCam lf={lf} map="strait" cam={[SI, SI]} glowUS={0} pins={[{ at: "little", d: 2, label: "Little Diomede", color: BLUE, sub: "United States" }]} />
  ) },
  { at: "The big one is Big Diomede", sfx: "pop", noHost: true, r: ({ lf }) => (
    <BeringCam lf={lf} map="strait" cam={[SI, SI]} glowUS={-99} glowRU={0} pins={[{ at: "little", d: -99, label: "Little Diomede", color: BLUE, sub: "United States" }, { at: "big", d: 2, label: "Big Diomede", color: RED, sub: "Russia", left: true }]} />
  ) },
  { at: "And this is where the numbers start", sfx: "glitch", face: "shock", r: ({ lf }) => (<T y={420} size={96} center style={rise(lf)}>Where the numbers <K c={RED}>disagree.</K></T>) },
  { at: "NASA's Earth Observatory, measuring", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nasa-38")} />
    <Cap name="nasa-38" lf={lf} dur={dur} y={260} width={1600} marks={[["3.8 kilometers (2.4 miles)", at("3.8")]]} />
  </>) },
  { at: "Slate, in 2008", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("slate-25")} />
    <Cap name="slate-25" lf={lf} dur={dur} y={300} width={1600} marks={[["a little less than two and a half miles apart", 4]]} />
  </>) },
  { at: "The Park Service's Alaska page", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nps-25")} />
    <Cap name="nps-25" lf={lf} dur={dur} y={140} width={1000} marks={[["only about 2.5 miles wide", 4]]} />
  </>) },
  { at: "Another Park Service page", sfx: "pop", face: "shock", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nps-27")} />
    <Cap name="nps-27" lf={lf} dur={dur} y={300} width={1600} marks={[["Only 2.7 miles", 4]]} />
  </>) },
  { at: "National Geographic's main text", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <Source text="National Geographic" />
    <Crop name="ng-2mi" lf={lf} y0={18} y1={86} y={250} width={1600} marks={[["only about two miles to the west", 4]]} />
    <Crop name="ng-18" lf={lf} y0={0} y1={86} y={520} width={1600} d={at("photo caption")} marks={[["1.8 miles", at("1.8")]]} />
  </>) },
  { at: "Six sources", sfx: "stamp", face: "shock", r: ({ lf }) => (<>
    <Board lf={lf} shown={[0, 1, 2, 3, 4, 5]} />
    <Stamp lf={lf} d={12} text="5 NUMBERS" x={1540} y={330} rot={-8} size={60} color={RED} />
  </>) },
  { at: "So we measured it ourselves", sfx: "key", face: "happy", r: ({ lf }) => (<T y={420} size={100} center style={rise(lf)}>So we <K>measured it.</K></T>) },
  { at: "Using Natural Earth map data", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <BeringCam lf={lf} map="strait" cam={[SI, TI]} move={50} ruler={at("closest points")} rulerText="≈ 3.9 km · 2.45 mi" pins={[{ at: "little", d: -99, label: "Little Diomede", color: BLUE }, { at: "big", d: -99, label: "Big Diomede", color: RED, left: true }]} note={MEAS} />
  </>) },
  { at: "That's a rough map", sfx: "pop", face: "meh", r: ({ lf, at }) => (<>
    <Board lf={lf} shown={[-99, -99, -99, -99, -99, -99]} ours={at("right next to")} />
    <Source text={MEAS} />
  </>) },
  { at: "So the best answer is about 2.4 miles", sfx: "stamp", face: "happy", r: ({ lf, at }) => (<>
    <Board lf={lf} shown={[-99, -99, -99, -99, -99, -99]} ours={-99} strike={at("1.8 looks")} />
    <Stamp lf={lf} d={4} text="≈ 2.4 MI" x={1560} y={330} rot={-6} size={64} color={LIME} />
  </>) },
  { at: "That's closer than a lot of people's commute", sfx: "blip", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="bd3" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.72, y: 0.55, z: 1.5 }} />
    <PhotoCredit name="bd3" />
    <Over lf={lf} d={4} y={150} size={60}>Closer than <K>a lot of commutes</K></Over>
  </>) },
  { at: "Now, can you see across", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={420} size={110} center style={rise(lf)}>Can you <K>see across?</K></T>) },
  { at: "According to NASA, the village", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="ld2014" lf={lf} dur={dur} from={{ x: 0.5, y: 0.6, z: 1 }} to={{ x: 0.55, y: 0.62, z: 1.45 }} />
    <PhotoCredit name="ld2014" extra="Diomede village, west side of Little Diomede" />
  </>) },
  { at: "Big Diomede, and even the Russian mainland", sfx: "pop", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nasa-homes")} />
    <Cap name="nasa-homes" lf={lf} dur={dur} y={300} width={1600} marks={[["visible from the homes", 6]]} />
  </>) },
  { at: "Slate adds a catch", sfx: "pop", face: "meh", r: ({ lf, dur }) => (<>
    <Source text={srcOf("slate-fog")} />
    <Photo name="bd2" lf={lf} dur={dur} box={{ x: 300, y: 90, w: 940, h: 530 }} frame from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.6, y: 0.5, z: 1.25 }} />
    <Cap name="slate-fog" lf={lf} dur={dur} y={670} width={1400} x={120} marks={[["persistent fog", 6]]} />
    <PhotoCredit name="bd2" />
  </>) },
  { at: "But on a clear day, you can definitely", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="jul2006" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1.1 }} to={{ x: 0.35, y: 0.5, z: 1.6 }} />
    <PhotoCredit name="jul2006" />
    <Over lf={lf} d={4} y={120} size={60}>On a clear day: <K>you can definitely see one from the other</K></Over>
  </>) },
  { at: "So Palin's line checks out", sfx: "stamp", face: "happy", r: ({ lf }) => (<>
    <T y={250} size={56} center color={DIM} style={rise(lf)}>"You can actually see Russia from land here in Alaska"</T>
    <Stamp lf={lf} d={6} text="CHECKS OUT" x={560} y={400} rot={-6} size={150} color={LIME} />
  </>) },
  { at: "But the strangest thing about this view", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={330} size={80} center style={rise(lf)}>The strangest thing isn't the distance.</T>
    <T y={460} size={110} center style={pop(lf, at("the date"), 0.6)}>It's <K c={YEL}>the date.</K></T>
  </>) },
  // ---- 2. yesterday / tomorrow ----
  { at: "Part two. Yesterday Island", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="2 · THE DATE" title={<>Yesterday Island, <K c={RED}>Tomorrow Island</K></>} />) },
  { at: "Where does the border actually run", sfx: "pop", noHost: true, r: ({ lf }) => (<BeringCam lf={lf} map="strait" cam={[SW, SI]} move={60} glowUS={0} glowRU={0} />) },
  { at: "It was drawn in 1867", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("st-72")} />
    <Cap name="st-72" lf={lf} dur={dur} y={300} width={1600} marks={[["$7.2 million", at("7.2")]]} />
    <T y={600} size={120} center style={pop(lf, at("1867"), 0.6)}><K c={YEL}>1867</K></T>
  </>) },
  { at: "Here's the treaty", sfx: "key", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("st-treaty")} />
    <Cap name="st-treaty" lf={lf} dur={dur} y={140} width={1500} />
  </>) },
  { at: "The western limit, it says", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("st-treaty")} />
    <Cap name="st-treaty" lf={lf} dur={dur} y={140} width={1500} marks={[["midway between the islands of Krusenstera, or Ignalook, and the island of Ratmanoff, or Noonarbook", at("midway")]]} />
  </>) },
  { at: "Krusenstern is Little Diomede", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <BeringCam lf={lf} map="strait" cam={[SI, SI]} pins={[{ at: "little", d: 2, label: "Krusenstern", color: BLUE, sub: "= Little Diomede" }, { at: "big", d: at("Ratmanoff"), label: "Ratmanoff", color: RED, sub: "= Big Diomede", left: true }]} />
  ) },
  { at: "So the line runs straight down", sfx: "pop", noHost: true, r: ({ lf }) => (
    <BeringCam lf={lf} map="strait" cam={[SI, SW]} move={60} border={2} glowUS={0} glowRU={0} />
  ) },
  { at: "And the International Date Line follows", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("wiki-dateline")} />
    <Cap name="wiki-dateline" lf={lf} dur={dur} y={300} width={1600} marks={[["which also defines the International Date Line in that area", 6]]} />
  </>) },
  { at: "That's why Little Diomede got the nickname", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <BeringCam lf={lf} map="strait" cam={[SI, SI]} border={-99} days={at("Tomorrow Island")} dayNames={["YESTERDAY ISLAND", "TOMORROW ISLAND"]} pins={[{ at: "little", d: 2, label: "Little Diomede", color: BLUE }, { at: "big", d: at("Big Diomede"), label: "Big Diomede", color: RED, left: true }]} />
  ) },
  { at: "NASA even quoted a reader", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nasa-future")} />
    <Cap name="nasa-future" lf={lf} dur={dur} y={260} width={1600} marks={[["“Yesterday” and “Tomorrow” islands", 4], ["you’re looking into the future!", at("looking into the future")]]} />
  </>) },
  { at: "But how far into the future", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={420} size={110} center style={rise(lf)}>How far into <K c={YEL}>the future?</K></T>) },
  { at: "Snopes and Wikipedia say 21 hours", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Source text="Wikipedia · National Geographic" />
    <Cap name="wiki-21" lf={lf} dur={dur} y={110} width={980} x={80} marks={[["21 hours ahead of Little Diomede (20 in summer)", 4]]} />
    <Crop name="ng-23" lf={lf} y0={18} y1={86} y={700} width={1500} d={at("National Geographic")} marks={[["23-hour time difference", at("23")]]} />
  </>) },
  { at: "So we checked the clocks", sfx: "key", face: "happy", r: ({ lf }) => (<T y={420} size={100} center style={rise(lf)}>So we checked <K>the clocks.</K></T>) },
  { at: "Little Diomede runs on Alaska time", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <Source text={TZ} />
    <DayClocks lf={lf} a={["Little Diomede", "Alaska time", "UTC−9"]} b={["Big Diomede", "Anadyr time", "UTC+12"]} d={2} d2={at("Big Diomede runs")} />
  </>) },
  { at: "That's 21 hours", sfx: "stamp", face: "shock", r: ({ lf, at }) => (<>
    <Source text={TZ} />
    <T y={260} size={220} center style={pop(lf, 2, 0.6)}><K c={YEL}>21</K> hours</T>
    <T y={560} size={60} center color={DIM} style={rise(lf, at("In summer"))}>Summer (Alaska daylight time): <K>20 hours</K></T>
  </>) },
  { at: "So at noon on a Monday", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <Source text={TZ} />
    <DayClocks lf={lf} a={["Little Diomede", "Monday, January", "12:00"]} b={["Big Diomede", "Tuesday", "09:00"]} d={2} d2={at("already")} />
  </>) },
  { at: "National Geographic's 23 doesn't match", sfx: "stamp", face: "meh", r: ({ lf }) => (<>
    <T y={300} size={70} center color={DIM} style={rise(lf)}>National Geographic: "23-hour time difference"</T>
    <Stamp lf={lf} d={6} text="DOESN'T MATCH" x={520} y={430} rot={-6} size={130} color={RED} />
  </>) },
  { at: "So you can see Russia", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="bd1" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.62, y: 0.4, z: 1.5 }} />
    <PhotoCredit name="bd1" extra="Big Diomede, Russia" />
    <Over lf={lf} d={at("couldn't go")} y={150} size={60}>But for most of a century, <K c={RED}>you couldn't go there.</K></Over>
  </>) },
  // ---- 3. ice curtain ----
  { at: "Part three. The Ice Curtain", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="3 · THE CURTAIN" title={<>The <K c={BLUE}>Ice Curtain</K></>} />) },
  { at: "For a long time, the line between the islands", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="ld1987" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.7, y: 0.75, z: 1.6 }} />
    <PhotoCredit name="ld1987" extra="Little Diomede, 1987" />
  </>) },
  { at: "According to National Geographic, the Iñupiat", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <Source text="National Geographic" />
    <T y={300} size={80} center style={rise(lf)}>Both islands: <K>one community</K></T>
    <T y={430} size={60} center color={DIM} style={rise(lf, at("married"))}>Married across the strait. Same customs.</T>
  </>) },
  { at: "In winter, the water froze", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ng-bridge")} />
    <Cap name="ng-bridge" lf={lf} dur={dur} y={300} width={1600} marks={[["ice bridge", at("ice bridge")], ["walk between the islands", at("walked")]]} />
  </>) },
  { at: "One Little Diomede tribal coordinator", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ng-grandfather")} />
    <Cap name="ng-grandfather" lf={lf} dur={dur} y={300} width={1600} marks={[["cross back and forth between the islands all the time", at("grandfather")]]} />
  </>) },
  { at: "Then came the Cold War", sfx: "glitch", noHost: true, r: ({ lf }) => (
    <BeringCam lf={lf} map="strait" cam={[SW, SI]} move={50} border={0} glowRU={4} />
  ) },
  { at: "In 1948, National Geographic reports", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ng-1948")} />
    <Cap name="ng-1948" lf={lf} dur={dur} y={300} width={1600} marks={[["forcibly evacuate Big Diomede", at("forcibly")]]} />
  </>) },
  { at: "Its people were moved to the mainland", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <BeringCam lf={lf} map="strait" cam={[SI, SW]} move={50} border={-99} glowRU={0} routes={[{ from: "big", to: "dezhnev", d: 4, color: RED, bend: 0.2, dash: true }]} pins={[{ at: "big", d: at("military base"), label: "Big Diomede", color: RED, sub: "military base", left: true }]} />
    <Source text={srcOf("ng-1948")} />
  </>) },
  { at: "The water between the islands got a new name", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nasa-curtain")} />
    <Cap name="nasa-curtain" lf={lf} dur={dur} y={300} width={1600} marks={[["“ice curtain,”", at("Ice Curtain")]]} />
  </>) },
  { at: "Families were split", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="kugree" lf={lf} dur={dur} from={{ x: 0.35, y: 0.4, z: 1.6 }} to={{ x: 0.35, y: 0.38, z: 2.0 }} />
    <PhotoCredit name="kugree" extra="Little Diomede, 1970s, Big Diomede behind" />
    <Over lf={lf} d={4} y={150} size={60}>Families split by <K c={YEL}>2.5 miles of water</K></Over>
  </>) },
  { at: "For almost forty years", sfx: "pop", face: "meh", r: ({ lf, at }) => (<>
    <T y={300} size={110} center style={rise(lf)}>1948 → <K c={YEL}>1987</K></T>
    <T y={470} size={70} center style={rise(lf, at("cracked"))}>So what <K>cracked it?</K></T>
  </>) },
  { at: "Then, a swimmer", sfx: "whoosh", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="cox" lf={lf} dur={dur} box={{ x: 560, y: 0, w: 800, h: 1080 }} from={{ x: 0.5, y: 0.35, z: 1 }} to={{ x: 0.5, y: 0.3, z: 1.2 }} />
    <PhotoCredit name="cox" extra="Lynne Cox, 2012" />
    <T x={1420} y={440} size={70} style={rise(lf, 6)}>Lynne Cox</T>
  </>) },
  { at: "In 1976, according to the Park Service", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nps-cox-1976")} />
    <Cap name="nps-cox-1976" lf={lf} dur={dur} y={280} width={1600} marks={[["in 1976", at("1976")]]} />
  </>) },
  { at: "swim from Little Diomede to Big Diomede", sfx: "pop", noHost: true, r: ({ lf }) => (
    <BeringCam lf={lf} map="strait" cam={[SI, TI]} move={60} border={-99} routes={[{ from: "little", to: "big", d: 6, color: LIME, bend: 0.15 }]} pins={[{ at: "little", d: 2, label: "Little Diomede", color: BLUE }, { at: "big", d: 2, label: "Big Diomede", color: RED, left: true }]} />
  ) },
  { at: "It took her eleven years", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nps-cox-1976")} />
    <Cap name="nps-cox-1976" lf={lf} dur={dur} y={200} width={1600} marks={[["eleven years", 4]]} />
    <T y={560} size={80} center style={rise(lf, at("Would the Soviets"))}>Would the Soviets <K c={RED}>let her land?</K></T>
  </>) },
  { at: "In 1987, she flew to Little Diomede", sfx: "pop", face: "shock", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nps-cox-perm")} />
    <Cap name="nps-cox-perm" lf={lf} dur={dur} y={230} width={1600} />
  </>) },
  { at: "Permission finally came", sfx: "ding", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nps-cox-perm")} />
    <Cap name="nps-cox-perm" lf={lf} dur={dur} y={230} width={1600} marks={[["24 hours before the scheduled time, permission came from President Gorbachev", 2]]} />
  </>) },
  { at: "On August 7, 1987, she stepped", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="bd3" lf={lf} dur={dur} from={{ x: 0.3, y: 0.6, z: 1.2 }} to={{ x: 0.4, y: 0.75, z: 1.6 }} />
    <PhotoCredit name="bd3" extra="The strait between the islands" />
    <Over lf={lf} d={4} y={120} size={64}>Aug 7, 1987 · water: <K c={BLUE}>38°F (3°C)</K></Over>
  </>) },
  { at: "She later said her fingers", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nps-cox-cold")} />
    <Cap name="nps-cox-cold" lf={lf} dur={dur} y={300} width={1600} marks={[["38° F water", 2], ["like the hands of a cadaver", at("cadaver")]]} />
  </>) },
  { at: "Two hours and five minutes later", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <BeringCam lf={lf} map="strait" cam={[TI, TI]} border={-99} routes={[{ from: "little", to: "big", d: -99, color: LIME, bend: 0.15 }]} pins={[{ at: "big", d: 2, label: "2 h 05 min", color: LIME, left: true }]} />
    <Source text={srcOf("nps-cox-shore")} />
  </>) },
  { at: "She reached out", sfx: "pop", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nps-cox-shore")} />
    <Cap name="nps-cox-shore" lf={lf} dur={dur} y={320} width={1600} marks={[["two hours and five minutes", 2]]} />
  </>) },
  { at: "Later that year, when Gorbachev", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("nps-cox-toast")} />
    <Cap name="nps-cox-toast" lf={lf} dur={dur} y={280} width={1600} marks={[["raised a glass to toast the swimmer", at("raised a glass")]]} />
  </>) },
  { at: "Gorbachev said she proved", sfx: "ding", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nps-cox-toast")} />
    <Cap name="nps-cox-toast" lf={lf} dur={dur} y={280} width={1600} marks={[["how close to each other our peoples live", 4]]} />
  </>) },
  { at: "A year later, in June 1988", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <BeringCam lf={lf} cam={[ST, CAM.south]} move={50} routes={[{ from: "nome", to: "provideniya", d: at("from Nome"), color: LIME, bend: 0.2 }]} pins={[{ at: "nome", d: at("Nome"), label: "Nome", color: BLUE }, { at: "provideniya", d: at("Provideniya"), label: "Provideniya", color: RED, left: true }]} />
  ) },
  { at: "The Park Service says it was the first direct flight", sfx: "pop", face: "happy", r: ({ lf, dur }) => (<>
    <Source text={srcOf("nps-flight")} />
    <Cap name="nps-flight" lf={lf} dur={dur} y={240} width={1500} marks={[["June of 1988", 2], ["for the first time in over forty years", 8]]} />
  </>) },
  { at: "So, was the curtain gone for good", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={330} size={86} center style={rise(lf)}>Curtain gone for good?</T>
    <T y={470} size={110} center style={pop(lf, at("Not quite"), 0.6)}><K c={RED}>Not quite.</K></T>
  </>) },
  // ---- 4. the long way ----
  { at: "Part four. Two miles, the long way", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="4 · THE LONG WAY" title={<>Two miles, <K c={YEL}>the long way</K></>} />) },
  { at: "When National Geographic visited", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="drone" lf={lf} dur={dur} from={{ x: 0.5, y: 0.6, z: 1 }} to={{ x: 0.45, y: 0.72, z: 1.45 }} />
    <PhotoCredit name="drone" extra="Little Diomede, 2018" />
    <Over lf={lf} d={8} y={120} size={56}>Five former Big Diomede residents, <K>visiting relatives</K></Over>
  </>) },
  { at: "The trip across the water is about two miles", sfx: "pop", noHost: true, r: ({ lf }) => (
    <BeringCam lf={lf} map="strait" cam={[SI, SI]} border={-99} ruler={2} rulerText="≈ 2 miles" pins={[{ at: "little", d: -99, label: "Little Diomede", color: BLUE }, { at: "big", d: -99, label: "Big Diomede", color: RED, left: true }]} />
  ) },
  { at: "They couldn't take it", sfx: "stamp", noHost: true, r: ({ lf }) => (<>
    <BeringCam lf={lf} map="strait" cam={[SI, SI]} border={-99} pins={[{ at: "little", d: -99, label: "Little Diomede", color: BLUE }, { at: "big", d: -99, label: "Big Diomede", color: RED, left: true }]} />
    <Stamp lf={lf} d={2} text="NO CROSSING" x={620} y={700} rot={-6} size={110} color={RED} />
  </>) },
  { at: "Instead, they flew from Russia to Nome", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <BeringCam lf={lf} cam={[CAM.south, CAM.south]} border={0} routes={[
      { from: "chukotka", to: "nome", d: 4, color: YEL, bend: 0.3 },
      { from: "nome", to: "wales", d: at("Wales"), color: YEL, bend: 0.2 },
      { from: "wales", to: "little", d: at("helicopter"), color: LIME, bend: 0.3 },
    ]} pins={[{ at: "nome", d: at("Nome"), label: "Nome", color: BLUE }, { at: "wales", d: at("Wales"), label: "Wales", color: BLUE }, { at: "little", d: at("helicopter"), label: "Little Diomede", color: LIME, left: true }]} note="Route sketched from National Geographic's description · Map: Natural Earth" />
  ) },
  { at: "Bad weather held them up", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ng-fivedays")} />
    <Crop name="ng-longway" lf={lf} y0={20} y1={194} y={140} width={1600} marks={[["Instead of the two-mile journey", 2], ["they’d have to go the long way", 4]]} />
    <Cap name="ng-fivedays" lf={lf} dur={dur} y={620} width={1500} marks={[["five days behind schedule", at("five days")]]} />
  </>) },
  { at: "Two miles of water. Five days late", sfx: "blip", noHost: true, r: ({ lf }) => (<Aside lf={lf} face="meh" a="Two miles of water." b={<K c={YEL}>Five days late.</K>} />) },
  { at: "And the ice that once connected", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="village" lf={lf} dur={dur} from={{ x: 0.3, y: 0.7, z: 1.1 }} to={{ x: 0.25, y: 0.65, z: 1.6 }} />
    <PhotoCredit name="village" />
  </>) },
  { at: "Little Diomede used to carve a winter runway", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="ld1987" lf={lf} dur={dur} from={{ x: 0.6, y: 0.7, z: 1.3 }} to={{ x: 0.7, y: 0.8, z: 1.8 }} />
    <PhotoCredit name="ld1987" />
    <Over lf={lf} d={4} y={150} size={58}>Once: a winter runway <K c={BLUE}>carved into the sea ice</K></Over>
  </>) },
  { at: "National Geographic says it no longer", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ng-runway")} />
    <Cap name="ng-runway" lf={lf} dur={dur} y={320} width={1600} marks={[["no longer has an ice runway", at("no longer")]]} />
  </>) },
  { at: "Now the main link to the mainland", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="village2" lf={lf} dur={dur} from={{ x: 0.4, y: 0.6, z: 1.2 }} to={{ x: 0.35, y: 0.7, z: 1.7 }} />
    <PhotoCredit name="village2" />
    <Over lf={lf} d={4} y={150} size={60}>Main link: <K>an occasional helicopter</K></Over>
  </>) },
  { at: "So one last check", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <T y={330} size={80} center style={rise(lf)}>One last check: <K>the mainland</K></T>
    <T y={460} size={70} center color={DIM} style={rise(lf, at("Can you see Russia"))}>Can you see Russia from there?</T>
  </>) },
  { at: "Slate asked the station chief", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <BeringCam lf={lf} map="strait" cam={[SW, SC]} move={50} glowUS={0} pins={[{ at: "tincity", d: at("Tin City"), label: "Tin City radar site", color: BLUE, sub: "Cape Prince of Wales" }, { at: "dezhnev", d: at("westernmost"), label: "Siberia", color: RED }]} />
  ) },
  { at: "His answer: for roughly half the year", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("slate-tincity")} />
    <Cap name="slate-tincity" lf={lf} dur={dur} y={320} width={1600} marks={[["for roughly half the year", 2], ["Siberian mountain ranges", at("Siberian")]]} />
  </>) },
  { at: "Not from a house", sfx: "blip", noHost: true, r: ({ lf }) => (<Aside lf={lf} face="happy" a="Not from a house." b={<K>From a radar station on a mountain.</K>} />) },
  // ---- the check ----
  { at: "So, the check", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={380} size={150} center style={pop(lf, 2, 0.6)}>THE <K>CHECK</K></T>) },
  { at: "Claim one", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={300} size={56} color={DIM} center style={rise(lf)}>CLAIM 1</T>
    <T y={400} size={86} center style={rise(lf, 6)}>Palin said "I can see Russia <K c={YEL}>from my house</K>"</T>
  </>) },
  { at: "False. That was Tina Fey", sfx: "stamp", face: "shock", r: ({ lf, at }) => (<>
    <Stamp lf={lf} d={1} text="FALSE" x={680} y={240} rot={-6} size={180} color={RED} />
    <T y={600} size={64} center style={rise(lf, at("Tina Fey"))}>That was <K>Tina Fey on SNL.</K></T>
  </>) },
  { at: "Claim two", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={300} size={56} color={DIM} center style={rise(lf)}>CLAIM 2</T>
    <T y={400} size={86} center style={rise(lf, 6)}>You can see Russia <K c={YEL}>from land in Alaska</K></T>
  </>) },
  { at: "True. From Little Diomede", sfx: "stamp", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="jul2006" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.5, y: 0.5, z: 1.2 }} />
    <PhotoCredit name="jul2006" />
    <Stamp lf={lf} d={1} text="TRUE" x={760} y={160} rot={-6} size={170} color={LIME} />
    <Over lf={lf} d={at("Cape Prince")} y={150} size={52}>Little Diomede ✓ · <K>Cape Prince of Wales ✓</K></Over>
  </>) },
  { at: "Claim three", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={300} size={56} color={DIM} center style={rise(lf)}>CLAIM 3</T>
    <T y={400} size={86} center style={rise(lf, 6)}>Russia is <K c={YEL}>2.4 miles</K> from Alaska</T>
  </>) },
  { at: "True. NASA's number holds up", sfx: "stamp", face: "happy", r: ({ lf, at }) => (<>
    <Board lf={lf} shown={[-99, -99, -99, -99, -99, -99]} ours={-99} strike={at("1.8")} />
    <Stamp lf={lf} d={1} text="TRUE" x={1560} y={330} rot={-6} size={80} color={LIME} />
  </>) },
  { at: "And one bonus", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <BeringCam lf={lf} map="strait" cam={[SI, SI]} border={-99} days={at("tomorrow")} dayNames={["MONDAY 12:00", "TUESDAY 09:00"]} pins={[{ at: "little", d: -99, label: "Little Diomede", color: BLUE }, { at: "big", d: -99, label: "Big Diomede", color: RED, left: true }]} note={TZ} />
  ) },
  { at: "Two and a half miles. Almost a whole day", sfx: "blip", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="bd2" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.5, y: 0.45, z: 1.3 }} />
    <PhotoCredit name="bd2" />
    <Over lf={lf} d={2} y={700} size={60}>2.5 miles. <K c={YEL}>Almost a whole day.</K></Over>
    <Over lf={lf} d={at("forty years")} y={830} size={60}>And for 40 years, <K c={BLUE}>a wall made of ice.</K></Over>
  </>) },
  { at: "Would you live on Yesterday Island", sfx: "ding", noHost: true, r: ({ lf, at }) => (<>
    <Photo name="ld2014" lf={lf} dur={400} from={{ x: 0.5, y: 0.55, z: 1.1 }} to={{ x: 0.5, y: 0.55, z: 1.2 }} />
    <div style={{ position: "absolute", inset: 0, background: "rgba(10,11,13,0.55)" }} />
    <T y={280} size={80} center style={rise(lf)}>Would you live on <K c={BLUE}>Yesterday Island</K>,</T>
    <T y={390} size={80} center style={rise(lf, 8)}>looking at <K c={RED}>tomorrow</K> every morning?</T>
    <T y={560} size={52} center style={rise(lf, at("comments"))}>Tell Blip in the comments ↓</T>
    <T y={640} size={36} center color={DIM} style={rise(lf, at("comments") + 6)}>BLIP CHECK <K>&gt;_</K> · Maps lie. We check.</T>
  </>) },
];

const TL = makeTimeline(words, LINES as string[], B, 45);
export const MP03_DURATION = TL.duration;
export const Mp03Full: React.FC = () => <Stage tl={TL} audio="mp03/narration.mp3" />;
