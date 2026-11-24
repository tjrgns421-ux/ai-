import React from "react";
import { interpolate } from "remotion";
import { Blip, Face, Source, Stamp, T, K, BG, DIM, INK, LIME, RED, clamp, pop, rise } from "../bc01/Bc01";
import words from "../../public/mp01/narration.words.json";
import LINES from "../../public/mp01/lines.json";
import { Beat, Cap, Crop, Stage, makeTimeline, srcOf } from "./engine";
import { CAM, MapCam, Photo, PhotoCredit } from "./Visuals";

// Blip Check — Maps, checked #1: Korea's real border isn't the 38th parallel (16:9, ~8:30).
// Every fact on screen is a real capture or a credited public-domain / CC photo; see shorts/mp01-korea-border/sources.md.

const YEL = "#FFC93A";
const BLUE = "#7FD3FF";

const Tr: React.FC<{ lf: number; d: number; y: number; children: React.ReactNode }> = ({ lf, d, y, children }) => (
  <T y={y} size={44} style={rise(lf, d)}><span style={{ color: DIM, fontSize: 26, marginRight: 16 }}>TRANSLATION</span>{children}</T>
);
const Item: React.FC<{ lf: number; d: number; y: number; n: string; c?: string; children: React.ReactNode }> = ({ lf, d, y, n, c = LIME, children }) => (
  <div style={{ position: "absolute", left: 140, top: y, display: "flex", alignItems: "center", gap: 30, fontFamily: "Pretendard", fontWeight: 900, fontSize: 58, color: INK, ...rise(lf, d) }}>
    <span style={{ minWidth: 84, height: 84, borderRadius: 42, background: c, color: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, padding: "0 10px", boxSizing: "border-box" }}>{n}</span>
    {children}
  </div>
);
const Aside: React.FC<{ lf: number; face: Face; a: React.ReactNode; b: React.ReactNode }> = ({ lf, face, a, b }) => (<>
  <Blip lf={lf} face={face} x={260} y={220} size={540} />
  <T x={900} y={330} size={68} style={rise(lf, 4)}>{a}</T>
  <T x={900} y={430} size={68} style={rise(lf, 10)}>{b}</T>
</>);
/** Caption on a dark strip over a full-frame photo or map. */
const Over: React.FC<{ lf: number; d?: number; y?: number; size?: number; children: React.ReactNode }> = ({ lf, d = 0, y = 780, size = 72, children }) => (
  <div style={{ position: "absolute", left: 120, right: 120, top: y, ...rise(lf, d) }}>
    <span style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: size, color: INK, background: "rgba(10,11,13,0.78)", padding: "10px 26px", borderRadius: 14, lineHeight: 1.35, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>
  </div>
);
const Section: React.FC<{ lf: number; n: string; title: React.ReactNode }> = ({ lf, n, title }) => (<>
  <T y={330} size={56} color={LIME} style={rise(lf)}>{n}</T>
  <T y={420} size={120} style={pop(lf, 3, 0.7)}>{title}</T>
</>);

/** The DMZ: a line with 2 km on each side. */
const DmzBand: React.FC<{ lf: number; d: number }> = ({ lf, d }) => {
  const k = interpolate(lf - d, [0, 16], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 160, right: 160, top: 470, height: 360 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 180 - 150 * k, height: 300 * k, background: "rgba(255,201,58,0.18)", border: `3px dashed ${YEL}`, borderLeft: "none", borderRight: "none" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 178, height: 6, background: INK }} />
      <div style={{ position: "absolute", right: 0, top: 120, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: INK }}>Military Demarcation Line</div>
      <div style={{ position: "absolute", left: 20, top: 40, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: YEL, opacity: k }}>2 km ↑</div>
      <div style={{ position: "absolute", left: 20, top: 280, fontFamily: "Pretendard", fontWeight: 900, fontSize: 34, color: YEL, opacity: k }}>2 km ↓</div>
    </div>
  );
};

/** The October fence: from 80 m north of the line to south of it (as South Korea defines the line). Illustration. */
const FenceDiagram: React.FC<{ lf: number; d: number }> = ({ lf, d }) => {
  const k = interpolate(lf - d, [0, 22], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const y = 120 + 170 * k;
  return (
    <div style={{ position: "absolute", left: 160, right: 160, top: 520, height: 380 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, borderTop: `6px dashed ${INK}` }} />
      <div style={{ position: "absolute", right: 0, top: 210, fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: INK }}>the line, as South Korea defines it</div>
      <div style={{ position: "absolute", left: 0, top: 20, fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: RED }}>NORTH</div>
      <div style={{ position: "absolute", left: 0, top: 330, fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: LIME }}>SOUTH</div>
      <div style={{ position: "absolute", left: 200, right: 200, top: y, height: 0, borderTop: `8px solid ${RED}` }} />
      <div style={{ position: "absolute", left: 200, top: y - 50, fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: RED }}>{k < 0.5 ? "fence: about 80 m north" : "fence: south of the line?"}</div>
      <div style={{ position: "absolute", right: 0, top: -40, fontFamily: "Pretendard", fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,0.5)" }}>illustration, not to scale</div>
    </div>
  );
};

const W = CAM.wide, DZ = CAM.dmz, WE = CAM.west, EA = CAM.east;

export const B: Beat[] = [
  // ---- hook ----
  { at: "You think Korea is split", sfx: "whoosh", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="sign38" lf={lf} dur={dur} from={{ x: 0.4, y: 0.6, z: 1 }} to={{ x: 0.3, y: 0.72, z: 1.6 }} />
    <PhotoCredit name="sign38" />
    <Over lf={lf} d={4} y={120} size={70}>Korea is split at the <K c={YEL}>38th parallel?</K></Over>
  </>) },
  { at: "It isn't", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, W]} split={-99} p38={-20} mdl={-99} />
    <Stamp lf={lf} d={2} text="IT ISN'T" x={140} y={380} rot={-6} size={140} color={RED} />
  </>) },
  { at: "In 2026, its border has 3 versions", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, DZ]} move={50} split={-99} three={at("3 versions")} />
    <Over lf={lf} d={at("3 versions")} y={120} size={78}>2026: <K>3 versions</K> of the border</Over>
  </>) },
  { at: "and Seoul calls that a risk", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("sed-clash")} />
    <Cap name="sed-clash" lf={lf} dur={dur} y={200} width={1500} marks={[["possibility of accidental clashes", at("a risk")]]} />
    <T y={560} size={80} style={rise(lf, at("a risk"))}>Seoul: <K c={RED}>risk of accidental clashes</K></T>
  </>) },
  { at: "But why?", sfx: "boing", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="shock" a="But why?" b={<K>Let's check.</K>} />
  ) },
  { at: "Here's the strange part", sfx: "whoosh", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, W]} split={-99} p38={at("38th parallel")} />
    <Over lf={lf} d={4} y={120} size={64}>Stand on the <K c={YEL}>38th parallel</K> today…</Over>
  </>) },
  { at: "in the west you'd be in North Korea", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[W, WE]} move={40} split={-99} p38={-99} zones={20} />
    <Over lf={lf} d={24} y={120} size={70}>West: <K c={RED}>North Korea</K></Over>
  </>) },
  { at: "In the east, you'd be in South Korea", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[WE, EA]} move={40} split={-99} p38={-99} zones={-99} />
    <Over lf={lf} d={24} y={120} size={70}>East: <K>South Korea</K></Over>
  </>) },
  { at: "So, three questions", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={150} size={56} color={DIM} style={rise(lf)}>Three questions</T>
    <Item lf={lf} d={at("Where did the 38th")} y={290} n="1">Where did the 38th parallel come from?</Item>
    <Item lf={lf} d={at("Where is the real")} y={430} n="2">Where is the real border?</Item>
    <Item lf={lf} d={at("And why can't")} y={570} n="3">Why can't anyone agree on it now?</Item>
  </>) },
  // ---- 1. the line ----
  { at: "First, the line", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <Section lf={lf} n="1 · THE LINE" title={<>August <K>1945</K></>} />
    <T y={600} size={56} color={DIM} style={rise(lf, at("Japan is about"))}>Japan is about to surrender.</T>
  </>) },
  { at: "much sooner than expected", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("frus-sudden")} />
    <Cap name="frus-sudden" lf={lf} dur={dur} y={230} width={1500} marks={[["suddenness of the Japanese surrender", 4]]} />
  </>) },
  { at: "and the U.S. needs a plan for Korea", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <Photo name="modis" lf={lf} dur={120} from={{ x: 0.55, y: 0.5, z: 1 }} to={{ x: 0.52, y: 0.42, z: 1.25 }} />
    <PhotoCredit name="modis" />
    <Over lf={lf} d={6} y={820} size={64}>Who takes Japan's surrender <K>in Korea?</K></Over>
  </>) },
  { at: "In 1950, Dean Rusk wrote a memo", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="rusk" lf={lf} dur={dur} box={{ x: 140, y: 140, w: 560, h: 740 }} frame from={{ x: 0.5, y: 0.4, z: 1 }} to={{ x: 0.5, y: 0.3, z: 1.25 }} />
    <PhotoCredit name="rusk" />
    <T x={800} y={300} size={96} style={rise(lf, 4)}>Dean Rusk</T>
    <T x={800} y={430} size={50} color={DIM} style={rise(lf, 10)}>later U.S. Secretary of State</T>
    <T x={800} y={540} size={60} style={rise(lf, at("a memo"))}><K>1950 memo</K> about August 1945</T>
  </>) },
  { at: "and it's now in the State Department's", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("frus-head")} />
    <Cap name="frus-head" lf={lf} dur={dur} y={200} width={1500} marks={[["July 12, 1950", 6], ["Dean Rusk", 12]]} />
    <T y={600} size={56} style={rise(lf, 14)}>Foreign Relations of the United States, <K>1945 vol. VI</K></T>
  </>) },
  { at: "He says senior officials met", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("frus-night")} />
    <Cap name="frus-night" lf={lf} dur={dur} y={220} width={1500} marks={[["in the Pentagon", at("Pentagon")], ["lasted throughout most of the night", at("most of a night")]]} />
    <T y={560} size={80} style={rise(lf, at("most of a night"))}>The Pentagon. <K>All night.</K></T>
  </>) },
  { at: "The State Department wanted", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("frus-north")} />
    <Cap name="frus-north" lf={lf} dur={dur} y={140} width={1500} marks={[["as far north as practicable", at("as far north")]]} />
    <T y={600} size={84} style={rise(lf, at("as far north"))}>State: <K>as far north as possible ↑</K></T>
  </>) },
  { at: "But the military had a problem", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("frus-north")} />
    <Cap name="frus-north" lf={lf} dur={dur} y={140} width={1500} marks={[["scarcity of U.S. forces immediately available", at("weren't enough")], ["before Soviet troops could enter the area", at("Soviet troops")]]} />
    <Item lf={lf} d={at("weren't enough")} y={560} n="1" c={RED}>Not enough U.S. troops nearby</Item>
    <Item lf={lf} d={at("Soviet troops")} y={690} n="2" c={RED}>Soviet troops could get there first</Item>
  </>) },
  { at: "So Rusk and Colonel Charles Bonesteel", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="rusk" lf={lf} dur={dur} box={{ x: 240, y: 150, w: 600, h: 700 }} frame to={{ x: 0.5, y: 0.35, z: 1.15 }} />
    <Photo name="bonesteel" lf={lf} dur={dur} d={at("Bonesteel")} box={{ x: 1080, y: 150, w: 600, h: 700 }} frame from={{ x: 0.5, y: 0.3, z: 1 }} to={{ x: 0.5, y: 0.28, z: 1.15 }} />
    <T x={240} y={880} size={44} style={rise(lf, 2)}>Dean Rusk</T>
    <T x={1080} y={880} size={44} style={rise(lf, at("Bonesteel"))}>Charles Bonesteel (later)</T>
    <div style={{ position: "absolute", left: 48, top: 36, fontFamily: "Pretendard", fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.6)" }}>Photos: U.S. Department of State; U.S. Army · Public domain · Wikimedia Commons</div>
  </>) },
  { at: "to come up with a proposal", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("frus-room")} />
    <Cap name="frus-room" lf={lf} dur={dur} y={300} width={1500} marks={[["retire to an adjoining room", 4]]} />
    <T y={560} size={84} style={rise(lf, 8)}>"…an <K>adjoining room</K>"</T>
  </>) },
  { at: "In his memoir, Rusk says", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("natgeo-map")} />
    <Cap name="natgeo-map" lf={lf} dur={dur} y={260} width={1500} marks={[["Using a National Geographic map", at("National Geographic")]]} />
    <T y={520} size={84} style={rise(lf, at("National Geographic"))}>A <K c={YEL}>National Geographic</K> map</T>
  </>) },
  { at: "They looked just north of Seoul", sfx: "whoosh", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, CAM.seoul]} move={50} pins={[{ at: "seoul", d: 10, label: "Seoul" }]} />
    <Over lf={lf} d={at("natural dividing")} y={120} size={64}>A natural dividing line? A river? A ridge?</Over>
    <Stamp lf={lf} d={at("couldn't find one")} text="NONE" x={1200} y={700} rot={-6} size={110} color={RED} />
  </>) },
  { at: "So they picked a line of latitude", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[CAM.seoul, W]} move={40} p38={at("The 38th parallel")} pins={[{ at: "seoul", d: -99, label: "Seoul" }]} />
    <Over lf={lf} d={4} y={120} size={70}>A line of latitude: <K c={YEL}>38° North</K></Over>
  </>) },
  { at: "Why that one?", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <T y={130} size={80} style={rise(lf)}>Why that one?</T>
    <Source text={srcOf("frus-38")} />
    <Cap name="frus-38" lf={lf} dur={dur} y={300} width={1500} d={at("In the memo")} marks={[["include the capital of Korea", at("capital")]]} />
    <T y={620} size={76} style={rise(lf, at("capital"))}>To keep <K>Seoul</K> on the U.S. side</T>
  </>) },
  { at: "He also wrote that the line was further north", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("frus-38")} />
    <Cap name="frus-38" lf={lf} dur={dur} y={220} width={1500} marks={[["further north than could be realistically reached", at("further north")]]} />
    <T y={560} size={72} style={rise(lf, at("if the Soviets"))}>…if the Soviets <K c={RED}>said no</K></T>
  </>) },
  { at: "And he admitted he was surprised", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("frus-surprised")} />
    <Cap name="frus-surprised" lf={lf} dur={dur} y={240} width={1500} marks={[["somewhat surprised that the Soviet accepted the 38th parallel", at("surprised")]]} />
    <T y={560} size={84} style={rise(lf, at("accepted"))}>The Soviets <K>said yes.</K></T>
  </>) },
  { at: "One small catch", sfx: "whoosh", face: "meh", r: ({ lf }) => (<T y={420} size={110} center style={rise(lf)}>One small <K c={YEL}>catch.</K></T>) },
  { at: "The memo puts that night", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={`${srcOf("frus-night")} · ${srcOf("natgeo-aug14")}`} />
    <Cap name="frus-night" lf={lf} dur={dur} y={110} width={1300} />
    <T x={160} y={380} size={110} style={pop(lf, at("August 10th"), 0.6)}>Aug <K>10–11</K></T>
    <T x={160} y={520} size={40} color={DIM} style={rise(lf, at("August 10th"))}>1950 memo</T>
    <Cap name="natgeo-aug14" lf={lf} dur={dur} y={640} width={1300} d={at("The memoir says")} marks={[["August 14, 1945", at("August 14th")]]} />
    <T x={1100} y={380} size={110} style={pop(lf, at("August 14th"), 0.6)}>Aug <K c={YEL}>14</K></T>
    <T x={1100} y={520} size={40} color={DIM} style={rise(lf, at("August 14th"))}>1991 memoir</T>
  </>) },
  { at: "Even the man who drew the line", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="Even Rusk" b={<K>remembered it two ways.</K>} />
  ) },
  { at: "But that's not the whole story", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ency38-earlier")} />
    <Cap name="ency38-earlier" lf={lf} dur={dur} y={240} width={1500} d={at("national encyclopedia")} marks={[["양해 또는 합의했을 가능성", at("already understood")]]} />
    <Tr lf={lf} d={at("already understood")} y={500}>"…the possibility that the two governments <K>had already understood or agreed</K>"</Tr>
  </>) },
  { at: "Either way, on September 2, 1945", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ency38-go1")} />
    <Cap name="ency38-go1" lf={lf} dur={dur} y={220} width={1500} marks={[["1945년 9월 2일", at("September 2")], ["일반명령 제1호", at("General Order")]]} />
    <T y={520} size={90} style={pop(lf, at("General Order"), 0.6)}>General Order <K>No. 1</K></T>
  </>) },
  { at: "Japanese troops north of the 38th parallel", sfx: "whoosh", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, W]} p38={-99} by38={4} />
    <Over lf={lf} d={4} y={120} size={56}>North of 38°: surrender to the <K c={RED}>Soviets</K></Over>
    <Over lf={lf} d={at("South of it")} y={860} size={56}>South: to the <K>Americans</K></Over>
  </>) },
  { at: "It was supposed to be temporary", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="sign38" lf={lf} dur={dur} from={{ x: 0.3, y: 0.72, z: 1.6 }} to={{ x: 0.3, y: 0.74, z: 2.3 }} />
    <PhotoCredit name="sign38" />
    <Over lf={lf} d={4} y={120} size={70}>Supposed to be <K c={YEL}>temporary</K></Over>
  </>) },
  { at: "So how did a temporary line become a border", sfx: "whoosh", face: "prompt", r: ({ lf }) => (
    <T y={400} size={96} center style={rise(lf)}>So how did a temporary line<br /><K>become a border?</K></T>
  ) },
  { at: "But the Cold War got there first", sfx: "stamp", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="fence1968" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1.05 }} to={{ x: 0.45, y: 0.5, z: 1.35 }} />
    <PhotoCredit name="fence1968" />
    <Over lf={lf} d={4} y={120} size={84}>The <K c={RED}>Cold War</K> got there first.</Over>
  </>) },
  { at: "According to the same encyclopedia, travel", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ency38-cut")} />
    <Cap name="ency38-cut" lf={lf} dur={dur} y={230} width={1500} marks={[["인원·물자·우편 등의 교류마저 끊어지고", at("travel")]]} />
    <Tr lf={lf} d={at("travel")} y={450}>"…even the exchange of <K>people, goods and mail</K> was cut off"</Tr>
  </>) },
  { at: "In 1948, two governments", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, W]} p38={-99} by38={-99} />
    <Over lf={lf} d={4} y={120} size={72}><K>1948</K>: two governments</Over>
    <Over lf={lf} d={at("Sort of")} y={860} size={60}>A line for surrenders became a border. <K c={YEL}>Sort of.</K></Over>
  </>) },
  { at: "Then, in June 1950, the line was crossed", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, W]} p38={-99} by38={-99} front={at("crossed")} />
    <Over lf={lf} d={4} y={120} size={72}>June <K c={RED}>1950</K>: the Korean War</Over>
  </>) },
  { at: "On the very first day", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("encyar-unsc")} />
    <Cap name="encyar-unsc" lf={lf} dur={dur} y={200} width={1500} marks={[["당일", at("first day")], ["38선 이북까지 철수할 것을 요구", at("pull back")], ["불응", at("They didn't")]]} />
    <Tr lf={lf} d={at("pull back")} y={450}>UN Security Council, same day: <K>withdraw north of the 38th parallel</K></Tr>
    <Stamp lf={lf} d={at("They didn't")} text="IGNORED" x={760} y={600} rot={-5} size={90} color={RED} />
  </>) },
  { at: "And this is where the 38th parallel starts", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="The 38th parallel" b={<K>starts losing its job.</K>} />
  ) },
  { at: "For three years, the front moved", sfx: "whoosh", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, W]} p38={-99} by38={-99} front={-30} />
    <Over lf={lf} d={4} y={120} size={64}>Three years of the front moving <K>up and down</K></Over>
  </>) },
  { at: "In 1951, when ceasefire talks", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("encyar-suicide")} />
    <Cap name="encyar-suicide" lf={lf} dur={dur} y={220} width={1500} marks={[["38선의 정전은 곧 자살행위", at("suicide")]]} />
    <Tr lf={lf} d={at("suicide")} y={440}>National Assembly: a ceasefire on the 38th parallel <K c={RED}>is suicide</K></Tr>
  </>) },
  { at: "Here's a clue", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, WE]} move={45} p38={-99} pins={[{ at: "kaesong", d: at("Kaesong"), label: "Kaesong", color: YEL }]} />
    <Over lf={lf} d={4} y={120} size={64}>1951: first armistice talks in <K c={YEL}>Kaesong</K></Over>
  </>) },
  { at: "Korea's national encyclopedia describes Kaesong", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("encyar-kaesong")} />
    <Cap name="encyar-kaesong" lf={lf} dur={dur} y={240} width={1500} marks={[["38선 이남의 개성", at("south of")]]} />
    <Tr lf={lf} d={at("south of")} y={460}>"…Kaesong, <K>south of the 38th parallel</K>"</Tr>
  </>) },
  { at: "Today, Kaesong is in North Korea", sfx: "stamp", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="kaesong" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.42, y: 0.45, z: 1.3 }} />
    <PhotoCredit name="kaesong" />
    <Over lf={lf} d={4} y={120} size={80}>Kaesong today: <K c={RED}>North Korea</K></Over>
  </>) },
  { at: "So how did a city south of the line", sfx: "whoosh", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[WE, WE]} p38={-99} split={10} zones={30} pins={[{ at: "kaesong", d: -99, label: "Kaesong", color: YEL }]} />
    <Over lf={lf} d={4} y={120} size={60}>South of the line, north of the border?</Over>
    <Over lf={lf} d={at("Hold that thought")} y={860} size={56}>Hold that thought.</Over>
  </>) },
  { at: "The talks later moved", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="jsa" lf={lf} dur={dur} from={{ x: 0.5, y: 0.45, z: 1 }} to={{ x: 0.6, y: 0.4, z: 1.2 }} />
    <PhotoCredit name="jsa" />
    <Over lf={lf} d={4} y={120} size={72}><K c={YEL}>Panmunjom</K></Over>
    <Over lf={lf} d={at("dragged on")} y={860} size={56}>And the talks dragged on.</Over>
  </>) },
  { at: "By October 1952", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("encyar-345")} />
    <Cap name="encyar-345" lf={lf} dur={dur} y={200} width={1500} marks={[["200회의 회합과 345시간", at("200 meetings")]]} />
    <T y={460} size={130} center style={pop(lf, at("200 meetings"), 0.6)}><K>200</K> meetings</T>
    <T y={640} size={130} center style={pop(lf, at("345 hours"), 0.6)}><K>345</K> hours</T>
  </>) },
  { at: "So where did the shooting finally stop", sfx: "whoosh", face: "prompt", r: ({ lf }) => (
    <T y={420} size={100} center style={rise(lf)}>So where did the shooting <K>finally stop?</K></T>
  ) },
  // ---- 2. the real border ----
  { at: "So, part two", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="2 · THE REAL BORDER" title={<>Where <K>is</K> it?</>} />) },
  { at: "On July 27, 1953", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="signing" lf={lf} dur={dur} from={{ x: 0.5, y: 0.55, z: 1 }} to={{ x: 0.45, y: 0.68, z: 1.7 }} />
    <PhotoCredit name="signing" />
    <Over lf={lf} d={4} y={120} size={80}>July 27, 1953</Over>
    <Over lf={lf} d={at("ten at night")} y={860} size={60}>Armistice in effect: <K>10 p.m.</K></Over>
  </>) },
  { at: "Fun fact", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("encyar-latin")} />
    <Cap name="encyar-latin" lf={lf} dur={dur} y={220} width={1400} marks={[["병기의 휴식", at("rest for weapons")]]} />
    <T y={430} size={96} center style={rise(lf, at("Latin"))}>arma + institium</T>
    <T y={580} size={80} center style={rise(lf, at("rest for weapons"))}>= <K>a rest for weapons</K></T>
  </>) },
  { at: "A rest. Not an ending", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="A rest." b={<K c={RED}>Not an ending.</K>} />
  ) },
  { at: "It did not use the 38th parallel", sfx: "whoosh", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, W]} p38={-99} split={at("Military Demarcation")} mdl={at("Military Demarcation") + 6} />
    <Over lf={lf} d={4} y={120} size={60}>Not the 38th parallel. Where the armies <K>faced each other.</K></Over>
    <Over lf={lf} d={at("Military Demarcation")} y={860} size={64}>The <K>Military Demarcation Line</K></Over>
  </>) },
  { at: "Each side pulled back two kilometers", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("encyar-dmz")} />
    <Cap name="encyar-dmz" lf={lf} dur={dur} y={110} width={1500} marks={[["실제접촉선으로부터 2㎞씩 떨어진 너비 4㎞의 비무장지대", at("two kilometers")]]} />
    <DmzBand lf={lf} d={at("two kilometers")} />
    <T y={880} size={64} center style={rise(lf, at("four kilometers"))}><K c={YEL}>4 km</K> wide: the <K>DMZ</K></T>
  </>) },
  { at: "Now put both lines on the map", sfx: "whoosh", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[W, DZ]} move={50} p38={6} split={-99} mdl={-99} />
    <Over lf={lf} d={4} y={120} size={64}><K c={YEL}>38th parallel</K> vs. the <K>real line</K></Over>
  </>) },
  { at: "In the west, the new line dips south", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[DZ, WE]} move={40} p38={-99} split={-99} mdl={-99} zones={30} pins={[{ at: "kaesong", d: at("Kaesong"), label: "Kaesong", color: RED }]} />
    <Over lf={lf} d={4} y={120} size={60}>West: the line dips <K c={RED}>south</K> of 38°</Over>
  </>) },
  { at: "In the east, it climbs north of it", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[WE, EA]} move={40} p38={-99} split={-99} mdl={-99} zones={20} />
    <Over lf={lf} d={4} y={120} size={60}>East: it climbs <K>north</K> of 38°</Over>
  </>) },
  { at: "Sokcho, now a beach city", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="sokcho" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.62, y: 0.3, z: 1.35 }} />
    <PhotoCredit name="sokcho" />
    <Over lf={lf} d={4} y={120} size={78}><K>Sokcho</K>, South Korea</Over>
    <Over lf={lf} d={at("north of the 38th")} y={860} size={56}>In 1945: <K c={RED}>north of the 38th parallel</K></Over>
  </>) },
  { at: "According to Korea's national encyclopedia, it was under North Korean rule", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ency-sokcho")} />
    <Cap name="ency-sokcho" lf={lf} dur={dur} y={260} width={1500} marks={[["38선 이북", at("North Korean rule")], ["1951년 국군이 진주하여 수복", at("1951")]]} />
    <Tr lf={lf} d={at("1951")} y={440}>North Korean rule <K>until South Korean troops took it in 1951</K></Tr>
  </>) },
  { at: "Goseong County, on the east coast", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[EA, EA]} p38={-99} split={-99} zones={-99} pins={[{ at: "sokcho", d: -99, label: "Sokcho" }, { at: "goseong", d: at("Goseong"), label: "Goseong", color: YEL }]} />
    <Over lf={lf} d={4} y={120} size={60}>Goseong: also <K>north of the line</K></Over>
  </>) },
  { at: "Four of its townships joined the South", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ency-goseong")} />
    <Cap name="ency-goseong" lf={lf} dur={dur} y={180} width={1500} marks={[["1954년 10월 21일", at("October 1954")], ["수복지구임시행정조치법", at("special law")]]} />
    <Tr lf={lf} d={at("special law")} y={440}>Oct 21, 1954: a temporary law for <K>"recovered areas"</K></Tr>
    <Item lf={lf} d={at("Four of its")} y={600} n="4">townships joined the South</Item>
  </>) },
  { at: "So if you're driving to the beach in Sokcho", sfx: "whoosh", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[EA, { x: 528, y: 495, z: 9 }]} move={60} p38={-99} split={-99} pins={[{ at: "sokcho", d: 8, label: "You are here", color: LIME }]} />
    <Over lf={lf} d={4} y={120} size={58}>Beach day in Sokcho: <K c={YEL}>north of the 38th parallel</K></Over>
  </>) },
  { at: "Bring sunscreen", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="happy" a="Bring sunscreen." b={<K>Not a passport.</K>} />
  ) },
  { at: "So the real border is the Military Demarcation Line", sfx: "pop", face: "happy", r: ({ lf, at }) => (<>
    <T y={340} size={84} center style={rise(lf)}>The real border: the <K>Military Demarcation Line</K></T>
    <T y={480} size={84} center style={rise(lf, at("Simple, right"))}>Simple, right?</T>
  </>) },
  { at: "Not quite", sfx: "stamp", face: "shock", r: ({ lf }) => (
    <Stamp lf={lf} d={2} text="NOT QUITE" x={500} y={380} rot={-6} size={150} color={YEL} />
  ) },
  { at: "According to a Korea Herald column, it was drawn by hand", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="armap13" lf={lf} dur={dur} from={{ x: 0.45, y: 0.1, z: 1.8 }} to={{ x: 0.3, y: 0.5, z: 3.2 }} />
    <PhotoCredit name="armap13" />
    <Over lf={lf} d={4} y={120} size={60}>1953 armistice map, Goseong sheet: <K c={YEL}>lines drawn by hand</K></Over>
  </>) },
  { at: "It runs for about 250 kilometers", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-hand")} />
    <Cap name="kh-hand" lf={lf} dur={dur} y={140} width={1500} marks={[["drawn by hand on maps attached to the armistice agreement", 4]]} />
    <Cap name="kh-250" lf={lf} dur={dur} y={380} width={1500} d={4} marks={[["roughly 250-kilometer Military Demarcation Line", at("250")]]} />
    <T y={720} size={120} center style={pop(lf, at("250"), 0.6)}>≈ <K>250 km</K></T>
  </>) },
  { at: "To mark it on the ground", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[DZ, DZ]} split={-99} dots={at("1,292")} pins={[{ at: "imjin", d: at("Imjin"), label: "Imjin River mouth", color: YEL }]} />
    <Over lf={lf} d={at("1,292")} y={120} size={72}><K c={YEL}>1,292</K> markers</Over>
    <Source text={srcOf("ja-markers")} />
  </>) },
  { at: "One every 200 meters", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="marker1" lf={lf} dur={dur} from={{ x: 0.5, y: 0.45, z: 1 }} to={{ x: 0.45, y: 0.4, z: 1.5 }} />
    <PhotoCredit name="marker1" />
    <Over lf={lf} d={4} y={860} size={64}>One every <K c={YEL}>200 meters</K></Over>
  </>) },
  { at: "The border is not a wall", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-markers")} />
    <Cap name="ja-markers" lf={lf} dur={dur} y={120} width={1200} marks={[["1,292 markers stand at 200-meter intervals", 4], ["the notional line joining them", at("imaginary line")]]} />
    <T y={760} size={72} center style={rise(lf, at("imaginary line"))}>Not a wall. <K>An imaginary line.</K></T>
  </>) },
  { at: "So what happens when the markers disappear", sfx: "whoosh", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="marker1" lf={lf} dur={dur} from={{ x: 0.45, y: 0.4, z: 1.5 }} to={{ x: 0.42, y: 0.38, z: 2.4 }} />
    <PhotoCredit name="marker1" />
    <Over lf={lf} d={4} y={120} size={70}>What if the markers <K c={RED}>disappear?</K></Over>
  </>) },
  { at: "And that's the problem", sfx: "stamp", face: "meh", r: ({ lf }) => (<T y={420} size={110} center style={rise(lf)}>That's the <K c={RED}>problem.</K></T>) },
  // ---- 3. why nobody agrees ----
  { at: "So, part three", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="3 · WHY NOBODY AGREES" title={<>Who <K>checks</K> the line?</>} />) },
  { at: "Part of the answer is that the referees left", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="Part of the answer:" b={<K>the referees left.</K>} />
  ) },
  { at: "The armistice set up a commission", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={150} size={64} style={rise(lf)}>Neutral referees for the truce</T>
    {["Sweden", "Switzerland", "Poland", "Czechoslovakia"].map((t, i) => (
      <div key={t} style={{ position: "absolute", left: 120 + i * 430, top: 420, width: 390, padding: "26px 0", textAlign: "center", borderRadius: 24, border: `4px solid ${i < 2 ? LIME : YEL}`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: INK, ...pop(lf, 8 + i * 5) }}>{t}</div>
    ))}
    <T y={640} size={36} color={DIM} style={rise(lf, 30)}>Neutral Nations Supervisory Commission · Encyclopedia of Korean Culture (AKS)</T>
  </>) },
  { at: "According to Korea's national encyclopedia, North Korea pushed", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("encyar-nnsc")} />
    <Cap name="encyar-nnsc" lf={lf} dur={dur} y={160} width={1500} marks={[["체코슬로바키아를 철수시키고", at("Czechoslovak")], ["폴란드 대표단마저 강제축출", at("Polish")]]} />
    <Item lf={lf} d={at("Czechoslovak")} y={480} n="93">Czechoslovak delegation pushed out</Item>
    <Item lf={lf} d={at("Polish")} y={620} n="95">Polish delegation expelled</Item>
  </>) },
  { at: "The Korea Herald column says the armistice's supervisory", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-1990s")} />
    <Crop name="kh-1990s" lf={lf} y0={10} y1={86} y={300} width={1600} marks={[["weakened by institutional changes in the early 1990s", at("weakened")]]} />
  </>) },
  { at: "But the bigger problem is the line itself", sfx: "whoosh", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[DZ, DZ]} split={-99} dots={-200} />
    <Over lf={lf} d={4} y={120} size={70}>The bigger problem: <K c={YEL}>the line itself</K></Over>
  </>) },
  { at: "The Korea Herald column says the markers were maintained", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-1973")} />
    <Crop name="kh-1973" lf={lf} y0={10} y1={122} y={260} width={1600} marks={[["maintained until 1973", at("1973")], ["killed by North Korean gunfire during maintenance work", at("killed")]]} />
    <T y={560} size={100} center style={pop(lf, at("1973"), 0.6)}>Maintained until <K c={RED}>1973</K></T>
  </>) },
  { at: "That year, a South Korean soldier was killed", sfx: "stamp", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="marker2" lf={lf} dur={dur} from={{ x: 0.3, y: 0.45, z: 1.2 }} to={{ x: 0.12, y: 0.3, z: 2.2 }} />
    <PhotoCredit name="marker2" />
    <Over lf={lf} d={4} y={120} size={60}>1973: a South Korean soldier <K c={RED}>killed during maintenance</K></Over>
  </>) },
  { at: "After that, the upkeep stopped", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[DZ, DZ]} split={-99} dots={-200} fade={at("only about 200")} />
    <Over lf={lf} d={at("only about 200")} y={120} size={70}>Identifiable today: about <K c={YEL}>200</K></Over>
    <Source text={srcOf("kh-200")} />
  </>) },
  { at: "Out of 1,292", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-200")} />
    <Crop name="kh-200" lf={lf} y0={10} y1={86} y={140} width={1600} marks={[["only about 200 markers", 4]]} />
    <T y={360} size={180} center style={pop(lf, 4, 0.6)}><K c={YEL}>200</K> / 1,292</T>
    <T y={640} size={56} center color={DIM} style={rise(lf, at("Scattered"))}>Mountains. Valleys. Marshes.</T>
  </>) },
  { at: "So each side reconstructed", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={420} size={96} center style={rise(lf)}>Each side rebuilt the line <K>its own way.</K></T>) },
  { at: "The Korea Herald column says South Korea and the UN Command built", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-ref")} />
    <Crop name="kh-ref" lf={lf} y0={10} y1={86} y={220} width={1600} marks={[["different combinations of armistice maps, surviving markers and modern geospatial data", at("different mixes")]]} />
    {["armistice maps", "surviving markers", "modern mapping"].map((t, i) => (
      <div key={t} style={{ position: "absolute", left: 200 + i * 540, top: 520, width: 480, padding: "22px 0", textAlign: "center", borderRadius: 24, border: `4px solid ${LIME}`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 44, color: LIME, ...pop(lf, at("different mixes") + 6 + i * 6) }}>{t}</div>
    ))}
  </>) },
  { at: "But whose reconstruction is right", sfx: "whoosh", face: "meh", r: ({ lf }) => (<T y={420} size={100} center style={rise(lf)}>Whose version is <K c={YEL}>right?</K></T>) },
  { at: "According to Seoul Economic Daily, the South Korean military", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("sed-three")} />
    <Cap name="sed-three" lf={lf} dur={dur} y={120} width={1500} marks={[["U.S. National Geospatial-Intelligence Agency in 2004", at("2004")]]} />
    <Item lf={lf} d={at("2004")} y={520} n="1" c={LIME}>South Korea: U.S. military maps, 2004</Item>
  </>) },
  { at: "The UN Command uses coordinates", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[DZ, { x: 440, y: 505, z: 6 }]} move={60} split={-99} />
    <Over lf={lf} d={4} y={120} size={64}>UN Command: <K c={BLUE}>its own coordinates, 2016</K></Over>
    <Source text={srcOf("sed-three")} />
  </>) },
  { at: "And North Korea uses its own line", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("sed-three")} />
    <Cap name="sed-three" lf={lf} dur={dur} y={120} width={1500} marks={[["U.S. National Geospatial-Intelligence Agency in 2004", -99], ["in 2016", -99], ["lines connecting boundary markers", at("connecting the markers")]]} />
    <Item lf={lf} d={-99} y={460} n="1" c={LIME}>South Korea: U.S. military maps, 2004</Item>
    <Item lf={lf} d={-99} y={590} n="2" c={BLUE}>UN Command: own coordinates, 2016</Item>
    <Item lf={lf} d={at("connecting the markers")} y={720} n="3" c={RED}>North Korea: lines between markers</Item>
  </>) },
  { at: "Three lines. One border", sfx: "stamp", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[DZ, { x: 430, y: 505, z: 9 }]} move={70} split={-99} three={4} />
    <Over lf={lf} d={4} y={120} size={72}>Three lines. One border.</Over>
  </>) },
  { at: "So what happens when soldiers follow different maps", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={420} size={92} center style={rise(lf)}>Soldiers following <K c={YEL}>different maps?</K></T>) },
  { at: "South Korea's defense ministry says", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("sed-clash")} />
    <Crop name="sed-clash" lf={lf} y0={10} y1={191} y={200} width={1600} marks={[["differing perceptions of some MDL locations", at("differing perceptions")], ["possibility of accidental clashes", at("accidental clashes")]]} />
  </>) },
  { at: "It says that raises the possibility", sfx: "stamp", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[{ x: 430, y: 505, z: 9 }, { x: 430, y: 505, z: 12 }]} move={90} split={-99} three={-99} />
    <Over lf={lf} d={4} y={120} size={70}>Risk: <K c={RED}>accidental clashes</K></Over>
  </>) },
  { at: "And that risk is no longer theoretical", sfx: "stamp", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="fence1968" lf={lf} dur={dur} from={{ x: 0.4, y: 0.55, z: 1.4 }} to={{ x: 0.35, y: 0.55, z: 1.9 }} />
    <PhotoCredit name="fence1968" />
    <Over lf={lf} d={4} y={120} size={72}>No longer <K c={RED}>theoretical</K></Over>
  </>) },
  { at: "Since April 2024", sfx: "pop", face: "shock", r: ({ lf, dur }) => (<>
    <Source text={srcOf("sed-2024")} />
    <Crop name="sed-2024" lf={lf} y0={10} y1={100} y={330} width={1700} marks={[["Since April 2024", 6]]} />
    <T y={560} size={84} center style={rise(lf, 10)}>North Korea starts <K c={RED}>fortifying</K> the border</T>
  </>) },
  { at: "According to Korea JoongAng Daily, the work follows", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-sequence")} />
    <Cap name="ja-sequence" lf={lf} dur={dur} y={110} width={1150} marks={[["clearing the land, laying mines, putting up triple fences and building tactical roads", at("clear the land")]]} />
    {["clear land", "lay mines", "triple fences", "tactical roads"].map((t, i) => (
      <div key={t} style={{ position: "absolute", left: 130 + i * 430, top: 640, width: 380, padding: "20px 0", textAlign: "center", borderRadius: 22, border: `4px solid ${RED}`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 42, color: INK, ...pop(lf, at(["clear the land", "lay mines", "triple fences", "tactical roads"][i])) }}>{i + 1}. {t}</div>
    ))}
  </>) },
  { at: "South Korean lawmakers were told", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("sed-mines")} />
    <Crop name="sed-mines" lf={lf} y0={10} y1={145} y={120} width={1600} marks={[["960,000 landmines", at("960,000")], ["about 2 million", at("two million")]]} />
    <T y={420} size={150} center style={pop(lf, at("960,000"), 0.6)}><K c={RED}>960,000</K> mines</T>
  </>) },
  { at: "Military experts put the total", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[DZ, { x: 470, y: 495, z: 4.5 }]} move={80} split={-99} mdl={-99} />
    <Over lf={lf} d={4} y={120} size={64}>All mines inside the DMZ, both sides:</Over>
    <T y={430} size={180} center style={pop(lf, at("two million"), 0.6)}>≈ <K c={YEL}>2,000,000</K></T>
    <Source text={srcOf("sed-mines") + " (military experts' estimate)"} />
  </>) },
  { at: "In September, South Korean soldiers were injured", sfx: "pop", face: "shock", r: ({ lf, dur }) => (<>
    <Source text={srcOf("sed-blast")} />
    <Cap name="sed-blast" lf={lf} dur={dur} y={330} width={1600} marks={[["injuries to South Korean soldiers caused by a North Korean landmine blast", 6]]} />
  </>) },
  { at: "And on the eastern front", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-daily")} />
    <Cap name="ja-daily" lf={lf} dur={dur} y={120} width={1100} marks={[["cross the MDL almost daily", at("almost daily")]]} />
    <T x={120} y={760} size={64} style={rise(lf, at("almost daily"))}>Armed guards cross <K c={RED}>almost daily</K></T>
  </>) },
  { at: "along paths created by the clearing work", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[EA, { x: 505, y: 470, z: 9 }]} move={70} split={-99} mdl={-99} />
    <Over lf={lf} d={4} y={120} size={60}>Eastern front: along <K c={RED}>paths from the clearing work</K></Over>
  </>) },
  { at: "The South answers with warning broadcasts", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("sed-shots")} />
    <Cap name="sed-shots" lf={lf} dur={dur} y={300} width={1500} marks={[["warning broadcasts and warning shots", at("warning broadcasts")]]} />
  </>) },
  { at: "Then, in October, something new", sfx: "whoosh", face: "shock", r: ({ lf }) => (<T y={420} size={100} center style={rise(lf)}>October: <K c={YEL}>something new.</K></T>) },
  { at: "For the first time, a North Korean fence", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-fence")} />
    <Cap name="ja-fence" lf={lf} dur={dur} y={70} width={1000} marks={[["first time a North Korean fence is believed to have crossed the MDL", 6], ["about 80 meters (262 feet) north of the MDL", at("80 meters")]]} />
    <FenceDiagram lf={lf} d={at("south of the line")} />
  </>) },
  { at: "South Korea's military said a joint check", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-jcs")} />
    <Cap name="ja-jcs" lf={lf} dur={dur} y={160} width={1100} marks={[["joint on-site investigation with the United Nations Command", at("joint check")]]} />
  </>) },
  { at: "North Korea, for its part", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-nk")} />
    <Cap name="ja-nk" lf={lf} dur={dur} y={110} width={1100} marks={[["hold to the MDL as it defines it", at("as it defines it")], ["however small", at("however small")]]} />
  </>) },
  { at: "So who decides where the line is", sfx: "whoosh", face: "meh", r: ({ lf }) => (<T y={420} size={100} center style={rise(lf)}>So who decides <K c={YEL}>where the line is?</K></T>) },
  { at: "The UN Command has said", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("kh-unc")} />
    <Crop name="kh-unc" lf={lf} y0={10} y1={122} y={260} width={1600} marks={[["provided they remain north of the Military Demarcation Line", at("as long as")]]} />
    <T y={560} size={72} center style={rise(lf, at("as long as"))}>OK… <K>as long as it stays north of the line</K></T>
  </>) },
  { at: "Which works perfectly", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="Works perfectly…" b={<K>if everyone agrees where it is.</K>} />
  ) },
  { at: "Korea JoongAng Daily reports that this year", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ja-survey")} />
    <Cap name="ja-survey" lf={lf} dur={dur} y={110} width={1100} marks={[["first on-site survey in the DMZ", at("first on-site survey")]]} />
  </>) },
  { at: "coordinated with the UN Command", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[DZ, { x: 400, y: 515, z: 7 }]} move={70} split={-99} dots={-200} fade={-200} />
    <Over lf={lf} d={4} y={120} size={60}>The first on-site survey <K c={YEL}>inside the DMZ</K></Over>
  </>) },
  { at: "So on October 23", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("sed-propose")} />
    <Cap name="sed-propose" lf={lf} dur={dur} y={150} width={1600} marks={[["resolve discrepancies over the Military Demarcation Line", at("confirm the exact")]]} />
    <Cap name="sed-second" lf={lf} dur={dur} y={400} width={1600} d={at("second such offer")} marks={[["second such offer", at("second such offer") + 4]]} />
    <T y={740} size={72} center style={rise(lf, at("second such offer"))}>Talks offer <K>#2</K></T>
  </>) },
  { at: "But the hotlines between the two militaries", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("sed-hotline")} />
    <Crop name="sed-hotline" lf={lf} y0={10} y1={145} y={200} width={1600} marks={[["April 7, 2023", at("April 2023")], ["October 2018", at("October 2018")]]} />
    <Item lf={lf} d={at("April 2023")} y={520} n="☎" c={RED}>Military hotlines cut: <K c={RED}>since April 2023</K></Item>
    <Item lf={lf} d={at("October 2018")} y={660} n="✕" c={RED}>Last general-level talks: <K>October 2018</K></Item>
  </>) },
  { at: "Two Koreas. One border. And no phone line", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="No phone line" b={<K>to ask where the border is.</K>} />
  ) },
  // ---- the check ----
  { at: "So, the check", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={380} size={150} center style={pop(lf, 2, 0.6)}>THE <K>CHECK</K></T>) },
  { at: "Claim: Korea is split at the 38th parallel", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="sign38" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1.1 }} to={{ x: 0.4, y: 0.6, z: 1.3 }} />
    <PhotoCredit name="sign38" />
    <div style={{ position: "absolute", inset: 0, background: "rgba(10,11,13,0.55)" }} />
    <T y={280} size={56} color={DIM} center style={rise(lf)}>CLAIM</T>
    <T y={380} size={90} center style={rise(lf, 6)}>"Korea is split at the <K c={YEL}>38th parallel</K>"</T>
  </>) },
  { at: "From 1945 to 1950", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, W]} p38={-99} by38={-99} />
    <Over lf={lf} d={4} y={120} size={70}>1945–1950: <K>✓ true</K></Over>
  </>) },
  { at: "Since the 1953 armistice", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <MapCam lf={lf} cam={[W, W]} p38={-99} split={4} mdl={10} zones={20} />
    <Over lf={lf} d={4} y={120} size={70}>Since 1953: <K c={RED}>✕ the MDL crosses it</K></Over>
  </>) },
  { at: "And in 2026, even that line has three versions", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <MapCam lf={lf} cam={[W, DZ]} move={50} split={-99} three={10} />
    <Over lf={lf} d={4} y={120} size={70}>2026: <K c={YEL}>three versions</K></Over>
  </>) },
  { at: "Verdict: outdated", sfx: "stamp", face: "happy", r: ({ lf, at }) => (<>
    <Stamp lf={lf} d={at("outdated")} text="OUTDATED" x={520} y={200} rot={-6} size={170} color={YEL} />
    <T y={560} size={66} center style={rise(lf, at("True for five years"))}>True for <K>5 years</K>.</T>
    <T y={660} size={66} center style={rise(lf, at("Wrong for more"))}>Wrong for <K c={RED}>70+</K>.</T>
  </>) },
  { at: "Next time someone says", sfx: "pop", face: "happy", r: ({ lf, at }) => (<>
    <T y={300} size={70} center style={rise(lf)}>"Korea is split at the 38th parallel"?</T>
    <T y={440} size={84} center style={rise(lf, at("which version"))}>Ask: <K>which version?</K></T>
  </>) },
  { at: "Which border surprised you", sfx: "ding", noHost: true, r: ({ lf, at }) => (<>
    <T y={160} size={76} center style={rise(lf)}>Which border surprised you most?</T>
    <Blip lf={lf} face="happy" x={720} y={330} size={420} d={4} />
    <T y={740} size={56} center style={rise(lf, at("comments"))}>Tell Blip in the comments ↓</T>
    <T y={830} size={40} center color={DIM} style={rise(lf, at("comments") + 6)}>BLIP CHECK <K>&gt;_</K> · Maps lie. We check.</T>
  </>) },
];

const TL = makeTimeline(words, LINES as string[], B, 45);
export const MP01_DURATION = TL.duration;
export const Mp01Full: React.FC = () => <Stage tl={TL} audio="mp01/narration.mp3" />;
