import React from "react";
import { Blip, Face, Source, Stamp, T, K, BG, DIM, INK, LIME, RED, pop, rise } from "../bc01/Bc01";
import words from "../../public/mp02/narration.words.json";
import LINES from "../../public/mp02/lines.json";
import { Beat, Cap, Stage, makeTimeline, srcOf } from "./engine";
import { CAM, ChinaCam, Photo, PhotoCredit } from "./Visuals";

// Blip Check — Maps, checked #2: China is 5,200 km wide. Why only one time zone? (16:9, ~8 min)
// Sunrise/sunset times are our calculation (NOAA solar equations, astral). See shorts/mp02-china-one-time-zone/sources.md.

const YEL = "#FFC93A";
const BLUE = "#7FD3FF";
const SX = "Xinhua (via Beijing Daily), Oct 28 2015";
const CALC = "Calculated: NOAA solar equations (astral), Beijing time";

const Tr: React.FC<{ lf: number; d: number; y: number; children: React.ReactNode }> = ({ lf, d, y, children }) => (
  <T y={y} size={44} style={rise(lf, d)}><span style={{ color: DIM, fontSize: 26, marginRight: 16 }}>TRANSLATION</span>{children}</T>
);
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
/** Two cities, one clock: the same event in Beijing time. */
const TwoClocks: React.FC<{ lf: number; event: string; a: [string, string, number]; b: [string, string, number]; note?: string }> = ({ lf, event, a, b, note = CALC }) => (<>
  <Source text={note} />
  <T y={150} size={52} color={DIM} center style={rise(lf)}>{event}</T>
  {[a, b].map(([city, time, d], i) => (
    <div key={city} style={{ position: "absolute", left: i ? 1000 : 160, top: 300, width: 760, textAlign: "center", ...pop(lf, d, 0.6) }}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, color: i ? YEL : BLUE }}>{city}</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 200, color: INK, fontVariantNumeric: "tabular-nums", letterSpacing: -6 }}>{time}</div>
    </div>
  ))}
</>);

const CN = CAM.china, WI = CAM.wide, EA = CAM.east, XJ = CAM.xinjiang;

export const B: Beat[] = [
  // ---- hook ----
  { at: "For two months this winter", sfx: "whoosh", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="kashgar" lf={lf} dur={dur} from={{ x: 0.5, y: 0.45, z: 1 }} to={{ x: 0.55, y: 0.4, z: 1.3 }} />
    <PhotoCredit name="kashgar" />
    <Over lf={lf} d={4} y={120} size={66}>Kashgar: no sunrise <K c={YEL}>before 10 a.m.</K></Over>
  </>) },
  { at: "One clock for 5,200 km", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <ChinaCam lf={lf} cam={[WI, CN]} move={50} glow={2} pins={[{ at: "beijing", d: 6, label: "One clock", color: RED }]} />
    <Over lf={lf} d={4} y={120} size={66}>One clock for <K c={YEL}>5,200 km</K>. Really one?</Over>
  </>) },
  { at: "Kashgar is in China's far west", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="pamir" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.45, y: 0.45, z: 1.35 }} />
    <PhotoCredit name="pamir" />
    <Over lf={lf} d={4} y={120} size={64}>China's <K c={YEL}>far west</K>: the Pamirs, near Kashgar</Over>
  </>) },
  { at: "By our calculation, from December 4th", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[WI, CN]} move={40} pins={[{ at: "kashgar", d: 6, label: "Kashgar", color: YEL, sub: "sunrise ≥ 10:00" }]} />
    <Over lf={lf} d={at("December 4th")} y={860} size={50}>Dec 4 – Feb 5: sunrise <K c={YEL}>10 a.m. or later</K> (Beijing time)</Over>
    <Source text={CALC} />
  </>) },
  { at: "On the same clock, at China's eastern tip", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="ussuri" lf={lf} dur={dur} from={{ x: 0.5, y: 0.6, z: 1 }} to={{ x: 0.45, y: 0.7, z: 1.4 }} />
    <PhotoCredit name="ussuri" />
    <Over lf={lf} d={4} y={120} size={60}>China's <K c={BLUE}>eastern tip</K>, by the Ussuri River</Over>
    <Over lf={lf} d={at("before 7")} y={860} size={60}>Same clock: sunrise <K c={BLUE}>before 7</K></Over>
  </>) },
  { at: "China Daily says the country stretches", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <ChinaCam lf={lf} cam={[CN, CN]} pins={[{ at: "kashgar", d: -99, label: "Kashgar", color: YEL, sub: "≥ 10:00" }, { at: "fuyuan", d: 6, label: "Fuyuan", color: BLUE, sub: "before 7:00" }]} />
  </>) },
  { at: "5,200 kilometers from east to west", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("cd-5200")} />
    <Cap name="cd-5200" lf={lf} dur={dur} y={110} width={980} x={120} marks={[["5200 kilometers to the east", at("5,200")]]} />
    <T x={1180} y={400} size={140} style={pop(lf, at("5,200"), 0.6)}><K c={YEL}>5,200</K></T>
    <T x={1180} y={560} size={60} style={rise(lf, at("5,200") + 4)}>km, east to west</T>
  </>) },
  { at: "So, three questions", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={150} size={56} color={DIM} style={rise(lf)}>Three questions</T>
    <Item lf={lf} d={at("What does one clock")} y={290} n="1">What does one clock do to China?</Item>
    <Item lf={lf} d={at("Where did Beijing time")} y={430} n="2">Where did Beijing time come from?</Item>
    <Item lf={lf} d={at("And does China really")} y={570} n="3">Is it really only one time zone?</Item>
  </>) },
  // ---- 1. the clock ----
  { at: "First, the clock", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="1 · THE CLOCK" title={<>One clock, <K c={YEL}>one sun?</K></>} />) },
  { at: "Time zones follow the sun", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[WI, WI]} zones={at("Every 15 degrees")} />
    <Over lf={lf} d={at("Every 15 degrees")} y={860} size={60}><K>15°</K> of longitude = <K>1 hour</K> of sun</Over>
  </>) },
  { at: "Chinese astronomers noticed this", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="registan" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.5, y: 0.45, z: 1.25 }} />
    <PhotoCredit name="registan" />
    <Over lf={lf} d={at("1220")} y={120} size={64}><K c={YEL}>1220</K>, Samarkand: a lunar eclipse</Over>
  </>) },
  { at: "and saw it start much earlier", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[CN, WI]} move={40} pins={[{ at: "samarkand", d: 4, label: "Samarkand", color: YEL }, { at: "kaifeng", d: at("Kaifeng"), label: "Kaifeng", color: BLUE }]} />
    <Over lf={lf} d={6} y={120} size={56}>The eclipse started <K c={YEL}>much earlier</K> in Samarkand</Over>
    <Source text={SX} />
  </>) },
  { at: "He called the gap", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-1220" lf={lf} dur={dur} y={110} width={1600} marks={[["寻斯干城", 4], ["比在开封早了约1更半", 8]]} />
    <T y={520} size={160} center style={pop(lf, 4, 0.6)}>里差</T>
    <T y={720} size={56} center style={rise(lf, at("time difference"))}>"distance difference" = <K>a time difference</K></T>
  </>) },
  { at: "But for most of history", sfx: "whoosh", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="railway1912" lf={lf} dur={dur} from={{ x: 0.6, y: 0.5, z: 1 }} to={{ x: 0.75, y: 0.45, z: 1.4 }} />
    <PhotoCredit name="railway1912" />
    <Over lf={lf} d={at("trains")} y={120} size={64}>Then came <K c={YEL}>trains and telegraphs</K></Over>
  </>) },
  { at: "Xinhua's history says that by 1855", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-1855" lf={lf} dur={dur} y={140} width={1600} marks={[["98%", at("98 percent")]]} />
    <Item lf={lf} d={at("98 percent")} y={480} n="1855">Britain: 98% of public clocks on Greenwich time</Item>
  </>) },
  { at: "In 1868, New Zealand", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-1868" lf={lf} dur={dur} y={200} width={1600} marks={[["第一个用经度设定标准时的地区", at("first place")]]} />
    <Item lf={lf} d={at("first place")} y={560} n="1868">New Zealand: first standard time <K>by longitude</K></Item>
  </>) },
  { at: "And in 1884, delegates", sfx: "pop", noHost: true, r: ({ lf, dur, at }) => (<>
    <Photo name="greenwich" lf={lf} dur={dur} from={{ x: 0.5, y: 0.35, z: 1 }} to={{ x: 0.5, y: 0.3, z: 1.5 }} />
    <PhotoCredit name="greenwich" />
    <Over lf={lf} d={4} y={120} size={64}><K c={YEL}>1884</K>: 41 countries pick Greenwich</Over>
  </>) },
  { at: "Now look at China", sfx: "whoosh", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[WI, CN]} move={40} zones={at("73")} />
    <Over lf={lf} d={at("73")} y={860} size={58}>From about <K c={YEL}>73°E</K> to about <K c={YEL}>135°E</K></Over>
  </>) },
  { at: "That's roughly 61 degrees", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <ChinaCam lf={lf} cam={[CN, CN]} zones={-99} glow={2} />
    <Over lf={lf} d={4} y={860} size={58}>About <K c={YEL}>61°</K> of longitude = about <K>4 hours</K> of sun</Over>
    <Source text="Our count: Natural Earth 1:10m (public domain)" />
  </>) },
  { at: "China Daily puts it this way", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("cd-5200")} />
    <Cap name="cd-5200" lf={lf} dur={dur} y={110} width={980} x={460} marks={[["four more hours of darkness", at("four more hours")]]} />
  </>) },
  { at: "But the whole country runs on Beijing time", sfx: "stamp", noHost: true, r: ({ lf }) => (<>
    <ChinaCam lf={lf} cam={[CN, CN]} zones={-99} pins={[{ at: "beijing", d: 4, label: "Beijing", color: RED, sub: "120°E · UTC+8" }]} />
    <Over lf={lf} d={8} y={860} size={64}>All of China: <K c={RED}>Beijing time</K></Over>
  </>) },
  { at: "So we ran the numbers", sfx: "pop", face: "happy", r: ({ lf }) => (<>
    <Source text={CALC} />
    <T y={330} size={96} center style={rise(lf)}>We ran the numbers.</T>
    <T y={470} size={52} center color={DIM} style={rise(lf, 8)}>sunrise and sunset · standard solar equations · Beijing time</T>
  </>) },
  { at: "On December 21st, in Fuyuan", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <ChinaCam lf={lf} dur={dur} cam={[CN, CN]} sun={[5.5, 7.2]} pins={[{ at: "fuyuan", d: 6, label: "Fuyuan", color: BLUE, sub: "sunrise 6:51" }]} />
  </>) },
  { at: "In Kashgar, in the far west, it rises", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <ChinaCam lf={lf} dur={dur} cam={[CN, CN]} sun={[7.2, 10.4]} pins={[{ at: "fuyuan", d: -99, label: "Fuyuan", color: BLUE, sub: "6:51" }, { at: "kashgar", d: 20, label: "Kashgar", color: YEL, sub: "sunrise 10:12" }]} />
  </>) },
  { at: "Same day. Same clock", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <TwoClocks lf={lf} event="December 21 · sunrise (Beijing time)" a={["Fuyuan", "6:51", 2]} b={["Kashgar", "10:12", 8]} />
    <T y={720} size={80} center style={rise(lf, at("three hour gap"))}>A <K c={RED}>3-hour</K> gap</T>
  </>) },
  { at: "And at the other end of the day", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <TwoClocks lf={lf} event="December 21 · sunset (Beijing time)" a={["Fuyuan", "15:09", at("3:09")]} b={["Kashgar", "19:35", at("7:35")]} />
  </>) },
  { at: "Summer flips it", sfx: "whoosh", noHost: true, r: ({ lf, dur }) => (<>
    <ChinaCam lf={lf} dur={dur} cam={[CN, EA]} move={60} sun={[2.2, 3.6]} sunDays="jun" pins={[{ at: "fuyuan", d: 20, label: "Fuyuan, June 21", color: BLUE, sub: "sunrise 3:01" }]} />
    <Source text={CALC} />
  </>) },
  { at: "Imagine your alarm going off", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="shock" a="Alarm at 6:00?" b={<K>The sun's been up for 3 hours.</K>} />
  ) },
  { at: "Meanwhile in Kashgar, solar noon", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="kashgar2" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.6, y: 0.45, z: 1.3 }} />
    <PhotoCredit name="kashgar2" />
    <Over lf={lf} d={4} y={120} size={64}>Kashgar: sun highest at about <K c={YEL}>3 p.m.</K></Over>
  </>) },
  { at: "So who decided this", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <T y={340} size={96} center style={rise(lf)}>So who decided this?</T>
    <T y={480} size={60} center color={DIM} style={rise(lf, at("more interesting"))}>The real story beats the myth.</T>
  </>) },
  // ---- 2. where Beijing time came from ----
  { at: "Part two", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="2 · WHERE BEIJING TIME CAME FROM" title={<>The <K c={YEL}>myth</K> vs. the record</>} />) },
  { at: "The usual version goes like this", sfx: "pop", face: "meh", r: ({ lf, at }) => (<>
    <T y={160} size={50} color={DIM} style={rise(lf)}>THE USUAL VERSION</T>
    <T y={270} size={84} style={rise(lf, at("1949"))}>1949: Mao abolishes <K c={YEL}>five time zones</K></T>
    <T y={400} size={84} style={rise(lf, at("Beijing time"))}>→ everyone on <K c={RED}>Beijing time</K></T>
    <T y={560} size={60} color={DIM} style={rise(lf, at("Clean and simple"))}>Clean and simple.</T>
  </>) },
  { at: "The real record is messier", sfx: "stamp", face: "shock", r: ({ lf }) => (<Stamp lf={lf} d={2} text="MESSIER" x={540} y={380} rot={-6} size={150} color={YEL} />) },
  { at: "Xinhua republished a detailed history", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <Source text={SX} />
    <T y={250} size={110} center style={pop(lf, 4, 0.7)}>“北京时间”是怎么来的</T>
    <Tr lf={lf} d={10} y={450}>"Where did <K c={YEL}>Beijing time</K> come from?" · Xinhua, 2015</Tr>
  </>) },
  { at: "drawing on research by Guo Qingsheng", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-guo" lf={lf} dur={dur} y={250} width={1600} marks={[["中国科学院国家授时中心高级工程师郭庆生", at("Guo Qingsheng")]]} />
    <Tr lf={lf} d={at("Guo Qingsheng")} y={430}>Guo Qingsheng, senior engineer, <K>National Time Service Center</K></Tr>
  </>) },
  { at: "Let's start earlier", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-1902" lf={lf} dur={dur} y={110} width={1600} marks={[["“海岸时”作为中国的标准时间", at("coast time")]]} />
    <Tr lf={lf} d={at("coast time")} y={560}>1902: customs proposes <K c={YEL}>"coast time"</K> (120°E)</Tr>
  </>) },
  { at: "But it only applied at the coastal ports", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[CN, { x: 1160, y: 560, z: 2.1 }]} move={50} pins={[{ at: "shanghai", d: 8, label: "Coast: 120°E", color: RED }]} />
    <Over lf={lf} d={at("never defined")} y={860} size={56}>Inland: time zone <K c={YEL}>never defined</K></Over>
    <Source text={SX} />
  </>) },
  { at: "Trains needed it most", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-rail" lf={lf} dur={dur} y={160} width={1600} marks={[["9400公里的铁路", at("9,400")]]} />
    <T y={480} size={130} center style={pop(lf, at("9,400"), 0.6)}><K c={YEL}>9,400</K> km of railway</T>
    <T y={650} size={50} center color={DIM} style={rise(lf, at("1911"))}>by 1911</T>
  </>) },
  { at: "and railways run on schedules", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="railway1912" lf={lf} dur={dur} from={{ x: 0.85, y: 0.4, z: 1.6 }} to={{ x: 0.9, y: 0.35, z: 2.2 }} />
    <PhotoCredit name="railway1912" />
    <Over lf={lf} d={4} y={860} size={60}>Railways run on <K c={YEL}>schedules</K></Over>
  </>) },
  { at: "Then, in 1918, the Central Observatory", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<>
    <T y={330} size={140} center style={pop(lf, 2, 0.6)}><K c={YEL}>1918</K></T>
    <T y={520} size={60} center style={rise(lf, 6)}>the Central Observatory proposes…</T>
  </>) },
  { at: "Kunlun in the far west", sfx: "whoosh", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[CN, WI]} move={30} z1918={2} />
    <Over lf={lf} d={4} y={860} size={56}><K c={YEL}>1918</K>: five time zones proposed</Over>
    <Source text={SX + " · standard meridians shown"} />
  </>) },
  { at: "Five zones. That sounds like", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={SX} />
    <Cap name="x-1918" lf={lf} dur={dur} y={80} width={1100} x={120} marks={[["五个时区", 4]]} />
    <T x={1300} y={400} size={70} style={rise(lf, 8)}>The zones</T>
    <T x={1300} y={490} size={70} style={rise(lf, 12)}><K>the myth</K> says</T>
    <T x={1300} y={580} size={70} style={rise(lf, 16)}>Mao abolished.</T>
  </>) },
  { at: "But the article says that, outside the coast", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-paper" lf={lf} dur={dur} y={160} width={1600} marks={[["纸面上的方案", at("on paper")], ["没有一台好一点儿的望远镜，没有无线电收讯机", at("telescope")]]} />
    <Tr lf={lf} d={at("on paper")} y={560}>Outside the coast: <K c={YEL}>a plan on paper</K></Tr>
    <Tr lf={lf} d={at("telescope")} y={650}>No decent telescope. <K>No radio receiver.</K></Tr>
  </>) },
  { at: "Then came war", sfx: "stamp", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="observatory" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1.1 }} to={{ x: 0.45, y: 0.45, z: 1.4 }} />
    <PhotoCredit name="observatory" />
    <Over lf={lf} d={4} y={120} size={72}>Then came <K c={RED}>war</K>.</Over>
  </>) },
  { at: "In 1932, after Japan seized the northeast", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[CN, EA]} move={50} pins={[{ at: "fuyuan", d: at("Manchukuo"), label: "Manchukuo, 1932", color: RED, sub: "Japanese time · 135°E" }]} />
    <Source text={SX} />
  </>) },
  { at: "In 1939, the wartime government met in Chongqing", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[EA, CAM.center]} move={50} pins={[{ at: "chongqing", d: at("Chongqing"), label: "Chongqing, 1939", color: YEL, sub: "Longshu time · 105°E" }]} />
    <Source text={SX} />
  </>) },
  { at: "for the duration of the war", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-1939" lf={lf} dur={dur} y={160} width={1600} marks={[["全国一律暂用一种时刻", at("one time")]]} />
    <Tr lf={lf} d={at("one time")} y={480}>Wartime: <K c={YEL}>one time for the whole country</K>, Longshu time</Tr>
  </>) },
  { at: "So China already tried one time zone", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="happy" a="China tried one time zone…" b={<K c={YEL}>just not Beijing's.</K>} />
  ) },
  { at: "And it didn't end neatly either", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-postwar" lf={lf} dur={dur} y={160} width={1600} marks={[["需拨动手表，进退一小时", at("move their watches")]]} />
  </>) },
  { at: "so passengers flying in from Shanghai", sfx: "whoosh", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[CN, CAM.center]} move={50} pins={[{ at: "shanghai", d: 4, label: "Shanghai", color: RED }, { at: "chongqing", d: 14, label: "Chongqing", color: YEL }, { at: "kunming", d: 18, label: "Kunming", color: YEL }]} />
    <Over lf={lf} d={at("move their watches")} y={120} size={60}>Landing? <K c={YEL}>Move your watch an hour.</K></Over>
    <Source text={SX} />
  </>) },
  { at: "And then, 1949", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={360} size={180} center style={pop(lf, 2, 0.6)}><K c={RED}>1949</K></T>) },
  { at: "Here's the twist", sfx: "stamp", face: "shock", r: ({ lf, at }) => (<>
    <T y={300} size={76} center style={rise(lf)}>Here's the twist:</T>
    <T y={430} size={90} center style={rise(lf, at("on the radio"))}>"Beijing time" starts <K c={YEL}>on the radio</K></T>
  </>) },
  { at: "On September 27, 1949", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[CN, { x: 1110, y: 440, z: 3 }]} move={50} pins={[{ at: "beijing", d: 6, label: "Peiping → Beijing", color: RED, sub: "Sept 27, 1949" }]} />
    <Over lf={lf} d={at("radio station")} y={860} size={56}>…and its <K c={YEL}>radio station</K> was renamed too</Over>
    <Source text={SX} />
  </>) },
  { at: "Guo concludes that its time signal", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-1949b" lf={lf} dur={dur} y={120} width={1600} marks={[["笔者推断", at("Guo concludes")]]} />
    <Tr lf={lf} d={at("Guo concludes")} y={650}>Guo's conclusion: the time signal <K c={YEL}>most likely</K> became "Beijing time" that day</Tr>
  </>) },
  { at: "The earliest written record he found", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-1949a" lf={lf} dur={dur} y={160} width={1600} marks={[["本台时间以北京时间为准", at("followed Beijing time")]]} />
    <Tr lf={lf} d={at("followed Beijing time")} y={560}>Oct 7, Xi'an radio: <K>"Our times follow Beijing time"</K></Tr>
  </>) },
  { at: "From there, cities switched one by one", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[CN, CAM.center]} move={40} pins={[{ at: "xian", d: at("Xi'an's"), label: "Xi'an", color: YEL, sub: "Nov 3, 1949" }, { at: "chengdu", d: at("Chengdu"), label: "Chengdu", color: YEL, sub: "after Dec 27" }]} />
    <Over lf={lf} d={4} y={120} size={60}>City by city, <K c={YEL}>not one decree</K></Over>
    <Source text={SX} />
  </>) },
  { at: "By early 1950, the article says", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-1950" lf={lf} dur={dur} y={160} width={1600} marks={[["除新疆、西藏外", at("except Xinjiang")]]} />
    <Tr lf={lf} d={at("except Xinjiang")} y={560}>Early 1950: everyone on Beijing time, <K c={YEL}>except Xinjiang and Tibet</K></Tr>
  </>) },
  { at: "And even then, an official almanac", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-1952" lf={lf} dur={dur} y={260} width={1600} marks={[["仍然实行五时区的旧制", at("five zones")]]} />
    <Tr lf={lf} d={at("five zones")} y={480}>1952 almanac: <K c={YEL}>still five zones</K></Tr>
  </>) },
  { at: "One more detail", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-solar" lf={lf} dur={dur} y={180} width={1600} marks={[["北京地方的视太阳时", at("local solar time")]]} />
    <Tr lf={lf} d={at("local solar time")} y={520}>At first: <K c={YEL}>Beijing's local solar time</K></Tr>
  </>) },
  { at: "It only later became the standard", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <ChinaCam lf={lf} cam={[CN, { x: 1110, y: 480, z: 2.6 }]} move={50} zones={4} pins={[{ at: "beijing", d: 10, label: "Beijing ≈ 116.4°E", color: RED }]} />
    <Over lf={lf} d={8} y={860} size={56}>Later: the standard for <K c={RED}>120°E</K></Over>
  </>) },
  { at: "So the myth checks out halfway", sfx: "stamp", face: "happy", r: ({ lf, at }) => (<>
    <Stamp lf={lf} d={2} text="HALF RIGHT" x={560} y={160} rot={-6} size={120} color={YEL} />
    <Item lf={lf} d={at("one clock after 1949")} y={460} n="✓">One clock after 1949</Item>
    <Item lf={lf} d={at("radio signals")} y={600} n="✕" c={RED}>Not one decree: radio signals and city notices</Item>
  </>) },
  { at: "And why push for one clock at all", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={420} size={96} center style={rise(lf)}>Why push for <K c={YEL}>one clock?</K></T>) },
  { at: "To be fair, one clock has real advantages", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-signal")} />
    <Cap name="aj-signal" lf={lf} dur={dur} y={160} width={1500} marks={[["practical and economic advantages", at("practical")]]} />
  </>) },
  { at: "One timetable for trains", sfx: "pop", face: "happy", r: ({ lf, at }) => (<>
    <T y={300} size={70} center style={rise(lf)}>One timetable for…</T>
    {["trains", "flights", "markets", "TV"].map((t, i) => (
      <div key={t} style={{ position: "absolute", left: 200 + i * 400, top: 480, width: 340, padding: "22px 0", textAlign: "center", borderRadius: 22, border: `4px solid ${LIME}`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 48, color: LIME, ...pop(lf, at(["trains", "flights", "markets", "TV"][i])) }}>{t}</div>
    ))}
  </>) },
  { at: "But the report argues the bigger reason was a signal", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("aj-signal")} />
    <Cap name="aj-signal" lf={lf} dur={dur} y={260} width={1500} marks={[["practical and economic advantages", -99], ["more about a signal", 6]]} />
  </>) },
  { at: "In a 2023 Al Jazeera report, a scholar named Yeh", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-yeh")} />
    <Cap name="aj-yeh" lf={lf} dur={dur} y={260} width={1500} marks={[["did not exercise full control over China before 1949", at("did not fully control")]]} />
  </>) },
  { at: "One country. One capital. One time", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <ChinaCam lf={lf} cam={[CN, CN]} glow={4} pins={[{ at: "beijing", d: 4, label: "Beijing", color: RED }]} />
    <Over lf={lf} d={4} y={120} size={70}>One country. <K>One capital.</K> <K c={RED}>One time.</K></Over>
  </>) },
  { at: "Which brings us to the place", sfx: "whoosh", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="urumqidusk" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.6, y: 0.45, z: 1.3 }} />
    <PhotoCredit name="urumqidusk" />
    <Over lf={lf} d={4} y={120} size={60}>Where one time <K c={YEL}>never quite worked</K></Over>
  </>) },
  // ---- 3. really one? ----
  { at: "Part three", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<Section lf={lf} n="3 · REALLY ONE?" title={<>The exception: <K c={YEL}>Xinjiang</K></>} />) },
  { at: "Xinhua's article says Xinjiang today", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={SX} />
    <Cap name="x-1950" lf={lf} dur={dur} y={160} width={1600} marks={[["乌鲁木齐时间（东经90度标准时）和北京时间两种标准", at("two standards")]]} />
    <Tr lf={lf} d={at("two standards")} y={560}>Xinjiang today: <K c={YEL}>Urumqi time (90°E)</K> and <K c={RED}>Beijing time</K></Tr>
  </>) },
  { at: "That's two hours apart", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <ChinaCam lf={lf} cam={[CN, XJ]} move={40} zones={-99} pins={[{ at: "urumqi", d: 10, label: "Urumqi", color: YEL, sub: "UTC+6 and UTC+8" }]} />
    <Over lf={lf} d={4} y={860} size={64}><K c={YEL}>2 hours</K> apart</Over>
  </>) },
  { at: "So a meeting at 10", sfx: "pop", noHost: true, r: ({ lf }) => (
    <TwoClocks lf={lf} note="Illustration" event="A meeting at 10:00 means…" a={["Urumqi time", "10:00", 4]} b={["Beijing time", "12:00", 12]} />
  ) },
  { at: "And you can see why local time sticks", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <ChinaCam lf={lf} dur={dur} cam={[XJ, XJ]} sun={[8.4, 9.8]} pins={[{ at: "urumqi", d: 10, label: "Urumqi, Dec 21", color: YEL, sub: "sunrise 9:40 Beijing time" }]} />
  </>) },
  { at: "On Urumqi time, that's 7:40", sfx: "pop", noHost: true, r: ({ lf, at }) => (
    <TwoClocks lf={lf} event="Urumqi, December 21 · sunrise" a={["Beijing time", "9:40", 2]} b={["Urumqi time", "7:40", at("7:40")]} />
  ) },
  { at: "So which clock would you set your alarm by", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="Which clock" b={<K>would you set your alarm by?</K>} />
  ) },
  { at: "Al Jazeera spoke to people from Xinjiang", sfx: "pop", noHost: true, r: ({ lf, dur }) => (<>
    <Photo name="urumqi" lf={lf} dur={dur} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.45, y: 0.5, z: 1.25 }} />
    <PhotoCredit name="urumqi" />
    <Over lf={lf} d={4} y={120} size={56}>Accounts from people now <K>living in the U.S.</K></Over>
  </>) },
  { at: "One, Payzulla Zaydun", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={320} size={80} center style={rise(lf)}>Payzulla Zaydun</T>
    <T y={440} size={56} center color={DIM} style={rise(lf, at("Urumqi"))}>university in Urumqi, <K>1980s and 1990s</K></T>
  </>) },
  { at: "some Uyghur students deliberately", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-late")} />
    <Cap name="aj-late" lf={lf} dur={dur} y={180} width={1500} marks={[["deliberately arrived two hours late", at("two hours late")]]} />
  </>) },
  { at: "He said many local shops", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("aj-shops")} />
    <Cap name="aj-shops" lf={lf} dur={dur} y={300} width={1500} marks={[["opened and closed following a two-hour time difference", 6]]} />
  </>) },
  { at: "But he said that is much harder today", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-subversion")} />
    <Cap name="aj-subversion" lf={lf} dur={dur} y={320} width={1500} marks={[["prosecuted for subversion", at("subversion")]]} />
    <T y={560} size={44} center color={DIM} style={rise(lf, 10)}>His account, quoted by Al Jazeera</T>
  </>) },
  { at: "He said his elderly mother", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-mother")} />
    <Cap name="aj-mother" lf={lf} dur={dur} y={300} width={1500} marks={[["feared the consequences", at("feared")]]} />
  </>) },
  { at: "That's his account", sfx: "pop", face: "meh", r: ({ lf }) => (
    <Stamp lf={lf} d={2} text="CAN'T VERIFY HOW OFTEN" x={300} y={400} rot={-5} size={90} color={YEL} />
  ) },
  { at: "Another woman told Al Jazeera", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-midnight")} />
    <Cap name="aj-midnight" lf={lf} dur={dur} y={300} width={1500} marks={[["summer sun set at about midnight", at("about midnight")]]} />
  </>) },
  { at: "She said it also showed", sfx: "pop", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-control")} />
    <Cap name="aj-control" lf={lf} dur={dur} y={320} width={1500} marks={[["even our time", at("even our time")]]} />
  </>) },
  { at: "So we checked that too", sfx: "whoosh", face: "happy", r: ({ lf }) => (<T y={420} size={110} center style={rise(lf)}>So we <K>checked</K> that too.</T>) },
  { at: "On June 21st, by our calculation, Kashgar's sun sets", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <TwoClocks lf={lf} event="Kashgar, June 21 (Beijing time)" a={["sunset", "22:26", at("10:26")]} b={["fully dark", "≈ 23:00", at("around 11")]} />
  </>) },
  { at: "Not quite midnight", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <Stamp lf={lf} d={2} text="NOT QUITE MIDNIGHT" x={320} y={300} rot={-5} size={100} color={YEL} />
    <T y={620} size={64} center style={rise(lf, at("close enough"))}>But for a kid? <K>Close enough.</K></T>
  </>) },
  { at: "And China isn't the only country", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={420} size={90} center style={rise(lf)}>Clocks are <K c={RED}>political</K> elsewhere too.</T>) },
  { at: "Al Jazeera notes that when India", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-india")} />
    <Cap name="aj-india" lf={lf} dur={dur} y={300} width={1500} marks={[["abolished Mumbai time and Kolkata time", at("Mumbai")]]} />
  </>) },
  { at: "Nepal set its clock", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("aj-nepal")} />
    <Cap name="aj-nepal" lf={lf} dur={dur} y={260} width={1500} marks={[["quarter-hour time zone", 4]]} />
  </>) },
  { at: "And in 2015, North Korea", sfx: "pop", face: "shock", r: ({ lf, dur }) => (<>
    <Source text={srcOf("aj-nk")} />
    <Cap name="aj-nk" lf={lf} dur={dur} y={320} width={1500} marks={[["setting clocks back half an hour", 4]]} />
  </>) },
  { at: "During Sri Lanka's civil war", sfx: "pop", face: "prompt", r: ({ lf, dur }) => (<>
    <Source text={srcOf("aj-srilanka")} />
    <Cap name="aj-srilanka" lf={lf} dur={dur} y={300} width={1500} marks={[["back half an hour", 6]]} />
  </>) },
  { at: "And in 2023, Russian authorities", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("aj-russia")} />
    <Cap name="aj-russia" lf={lf} dur={dur} y={300} width={1500} marks={[["switch from Ukrainian time to Moscow time", at("Moscow time")]]} />
  </>) },
  { at: "Time zones look like science", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="happy" a="Time zones look like science." b={<K c={YEL}>They're also politics.</K>} />
  ) },
  // ---- the check ----
  { at: "So, the check", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<T y={380} size={150} center style={pop(lf, 2, 0.6)}>THE <K>CHECK</K></T>) },
  { at: "Claim: China has only one time zone", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <ChinaCam lf={lf} cam={[CN, CN]} glow={-99} />
    <div style={{ position: "absolute", inset: 0, background: "rgba(10,11,13,0.45)" }} />
    <T y={300} size={56} color={DIM} center style={rise(lf)}>CLAIM</T>
    <T y={400} size={96} center style={rise(lf, 6)}>"China has only <K c={YEL}>one time zone</K>"</T>
  </>) },
  { at: "Officially? True", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <ChinaCam lf={lf} cam={[CN, CN]} glow={2} pins={[{ at: "beijing", d: 4, label: "Beijing time", color: RED, sub: "✓ national standard" }]} />
    <Over lf={lf} d={4} y={120} size={66}>Officially: <K>✓ true</K></Over>
  </>) },
  { at: "On the ground? Not quite", sfx: "pop", noHost: true, r: ({ lf }) => (<>
    <ChinaCam lf={lf} cam={[CN, XJ]} move={40} zones={-99} pins={[{ at: "urumqi", d: 10, label: "Xinjiang", color: YEL, sub: "two clocks, 2 h apart" }]} />
    <Over lf={lf} d={4} y={120} size={66}>On the ground: <K c={RED}>✕ not quite</K></Over>
  </>) },
  { at: "And the famous story of how it happened", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={330} size={70} center style={rise(lf)}>"One decree in 1949"?</T>
    <T y={450} size={86} center style={rise(lf, 8)}><K c={YEL}>A lot messier.</K></T>
  </>) },
  { at: "Verdict: half true", sfx: "stamp", face: "happy", r: ({ lf, at }) => (<>
    <Stamp lf={lf} d={at("half true")} text="HALF TRUE" x={560} y={200} rot={-6} size={170} color={YEL} />
    <T y={560} size={64} center style={rise(lf, at("One official clock"))}>One official clock. <K>Two real ones.</K></T>
    <T y={660} size={56} center color={DIM} style={rise(lf, at("sunrise after 10"))}>And a sunrise after 10 a.m.</T>
  </>) },
  { at: "Would you want to live in Kashgar", sfx: "ding", noHost: true, r: ({ lf, at }) => (<>
    <TwoClocks lf={lf} event="Your pick?" a={["Kashgar sunrise", "10:12", 4]} b={["Fuyuan sunrise", "3:01", at("Fuyuan")]} />
    <T y={720} size={52} center style={rise(lf, at("comments"))}>Tell Blip in the comments ↓</T>
    <T y={800} size={36} center color={DIM} style={rise(lf, at("comments") + 6)}>BLIP CHECK <K>&gt;_</K> · Maps lie. We check.</T>
  </>) },
];

const TL = makeTimeline(words, LINES as string[], B, 45);
export const MP02_DURATION = TL.duration;
export const Mp02Full: React.FC = () => <Stage tl={TL} audio="mp02/narration.mp3" />;
