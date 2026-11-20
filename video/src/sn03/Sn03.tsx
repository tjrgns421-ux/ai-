import React from "react";
import { Bar, Blip, Face, Shot, Source, Stamp, T, K, BG, DIM, INK, LIME, RED, pop, rise } from "../bc01/Bc01";
import words from "../../public/sn03/narration.words.json";
import LINES from "../../public/sn03/lines.json";
import CAPS from "../../public/sn03/captures/captures.json";
import { Beat, Cap, Crop, Stage, makeTimeline, srcOf } from "./engine";
import { KoreaMap } from "./KoreaMap";

// map position (right half), shared so the map stays put across beats
const MX = 1010, MY = 40;

// Blip Check #4: why North Korea has a law against sounding South Korean (16:9, ~4:55).
// Every fact on screen is a real capture; see shorts/sn03-north-south-words/sources.md.

const YEL = "#FFC93A";
const WIKI = "Wikimedia Commons · photo: 魯班 · CC BY-SA 4.0";
const NIKL = "새국어생활 1988 (South Korea's national language institute), list of North Korean replacements";
const RODONG = (CAPS as unknown as Record<string, { w: number; h: number }>)["rodong-photo"];

/** Korean capture + English translation line under it. */
const Tr: React.FC<{ lf: number; d: number; y: number; children: React.ReactNode }> = ({ lf, d, y, children }) => (
  <T y={y} size={46} style={rise(lf, d)}><span style={{ color: DIM, fontSize: 28, marginRight: 18 }}>TRANSLATION</span>{children}</T>
);

const Item: React.FC<{ lf: number; d: number; y: number; n: string; c?: string; children: React.ReactNode }> = ({ lf, d, y, n, c = LIME, children }) => (
  <div style={{ position: "absolute", left: 140, top: y, display: "flex", alignItems: "center", gap: 30, fontFamily: "Pretendard", fontWeight: 900, fontSize: 60, color: INK, ...rise(lf, d) }}>
    <span style={{ width: 84, height: 84, borderRadius: 42, background: c, color: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, flexShrink: 0 }}>{n}</span>
    {children}
  </div>
);

/** One row of the 1988 list, drawn clean next to the real capture: original → North Korean word = meaning. */
const Pair: React.FC<{ lf: number; d: number; en: string; ko: string; mean: string }> = ({ lf, d, en, ko, mean }) => (<>
  <T x={960} y={300} size={64} color={DIM} style={rise(lf, d)}>{en}</T>
  <T x={960} y={400} size={130} style={pop(lf, d + 6, 0.6)}><K>{ko}</K></T>
  <T x={960} y={600} size={64} style={rise(lf, d + 12)}>{mean}</T>
</>);

const Aside: React.FC<{ lf: number; face: Face; a: string; b: React.ReactNode }> = ({ lf, face, a, b }) => (<>
  <Blip lf={lf} face={face} x={280} y={200} size={560} />
  <T x={950} y={330} size={70} style={rise(lf, 4)}>{a}</T>
  <T x={950} y={430} size={70} style={rise(lf, 10)}>{b}</T>
</>);

export const B: Beat[] = [
  // ---- hook ----
  { at: "If you talk like a South Korean", sfx: "whoosh", face: "shock", r: ({ lf, at }) => (<>
    <T y={150} size={66} style={rise(lf)}>Talk like a <K>South Korean</K></T>
    <T y={250} size={66} style={rise(lf, at("in North Korea"))}>in <K c={RED}>North Korea?</K></T>
    <T y={380} size={200} style={pop(lf, at("six years"), 0.5)}><K>6 YEARS</K></T>
    <T y={620} size={44} color={DIM} style={rise(lf, at("six years") + 6)}>2023 law · as reported</T>
    <T y={720} size={80} style={rise(lf, at("But why"))}>But why?</T>
  </>) },
  { at: "It's the same language", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <KoreaMap lf={lf} x={MX} y={MY} draw={at("Until 1945") - 6} />
    <T y={220} size={90} style={rise(lf)}>Same language.</T>
    <T y={350} size={64} style={rise(lf, at("Same alphabet"))}>Same alphabet.</T>
    <T y={440} size={64} style={rise(lf, at("Same grammar"))}><K>Same grammar.</K></T>
    <T y={600} size={70} style={rise(lf, at("Until 1945"))}>Until <K>1945</K>:</T>
    <T y={690} size={70} style={rise(lf, at("one country"))}>one country.</T>
  </>) },
  { at: "So, three questions", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <T y={150} size={60} color={DIM} style={rise(lf)}>Three questions.</T>
    <Item lf={lf} d={at("What does this law")} y={290} n="1">What does the law actually say?</Item>
    <Item lf={lf} d={at("How different")} y={430} n="2">How different are the two Koreans?</Item>
    <Item lf={lf} d={at("And why would")} y={570} n="3">Why go after the way people talk?</Item>
  </>) },
  // ---- 1. the law ----
  { at: "First, the law", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <T y={160} size={50} color={LIME} style={rise(lf)}>1 · THE LAW</T>
    <T y={300} size={56} color={DIM} style={rise(lf, at("In January 2023"))}>January 2023</T>
    <T y={390} size={92} style={pop(lf, at("Pyongyang Cultural"), 0.7)}>Pyongyang Cultural</T>
    <T y={500} size={92} style={pop(lf, at("Pyongyang Cultural") + 4, 0.7)}><K>Language Protection Act</K></T>
  </>) },
  { at: "Daily NK, a Seoul-based outlet", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("dnk-fulltext")} />
    <T y={130} size={46} color={DIM} style={rise(lf)}>Daily NK: Seoul-based outlet covering North Korea</T>
    <Cap name="dnk-fulltext" lf={lf} dur={dur} y={230} d={at("says it obtained")} marks={[["January 18, 2023", at("says it obtained") + 6], ["five chapters and 65 articles", at("Five chapters")]]} />
    <T y={560} size={110} style={pop(lf, at("Five chapters"), 0.6)}>5 chapters · <K>65 articles</K></T>
  </>) },
  { at: "Sixty-five articles. About words", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="65 articles." b={<K>About words.</K>} />
  ) },
  { at: "What does it target", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("asiae-what")} />
    <T y={130} size={70} style={rise(lf)}>What does it target?</T>
    <Cap name="asiae-what" lf={lf} dur={dur} y={270} d={at("Asia Economy")} marks={[["South Korean-style speech", at("South Korean-style")], ["South Korean dramas or movies", at("dramas and movies")]]} />
    <T y={560} size={70} style={rise(lf, at("dramas and movies"))}>Picked up from <K>dramas and movies</K></T>
  </>) },
  { at: "Citing South Korea's spy agency, it lists", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={`${srcOf("asiae-nis")}, citing South Korea's National Intelligence Service`} />
    <Cap name="asiae-nis" lf={lf} dur={dur} y={130} marks={[["calling husbands 'oppa'", at("husband")], ["boyfriends 'jagiya'", at("boyfriend")]]} />
    <T y={480} size={80} style={rise(lf, at("husband"))}>Husband → <K>"oppa"</K></T>
    <T y={600} size={80} style={rise(lf, at("boyfriend"))}>Boyfriend → <K>"jagiya"</K></T>
  </>) },
  { at: "And according to a later Asia Economy", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("asiae-names")} />
    <Crop name="asiae-names" lf={lf} y0={11} y1={86} y={200} width={1640} marks={[["'Sora' and 'Gahee'", at("Sora")], ["forced name changes", at("change them")]]} />
    <T y={420} size={140} center style={pop(lf, at("Sora"), 0.6)}>Sora. <K>Gahee.</K></T>
    <Stamp lf={lf} d={at("change them")} text="NAME CHANGE" x={640} y={640} rot={-5} size={90} color={RED} />
  </>) },
  { at: "And the penalties", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("dnk-art58")} />
    <T y={120} size={60} style={rise(lf)}>Article 58 · <K>using it</K></T>
    <Cap name="dnk-art58" lf={lf} dur={dur} y={230} d={at("Article 58")} marks={[["six years or more of reform through labor", at("six years or more")]]} />
    <T y={600} size={150} center style={pop(lf, at("six years or more"), 0.6)}><K>6+ years</K></T>
    <T y={790} size={44} center color={DIM} style={rise(lf, at("reform through labor"))}>of "reform through labor"</T>
  </>) },
  { at: "Article 59 says teaching", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("asiae-art59")} />
    <Cap name="asiae-art59" lf={lf} dur={dur} y={130} marks={[["more than ten years of labor reform", at("ten years")], ["life labor reform or death penalty", at("life, or death")]]} />
    <Item lf={lf} d={at("ten years")} y={460} n="59">Teaching it: <K>10+ years</K></Item>
    <Item lf={lf} d={at("In serious cases")} y={600} n="!" c={RED}>Serious cases: <K c={RED}>life, or death</K></Item>
  </>) },
  { at: "That's the text as reported", sfx: "stamp", face: "meh", r: ({ lf, at }) => (<>
    <Stamp lf={lf} d={2} text="THE TEXT, AS REPORTED" x={260} y={260} rot={-4} size={100} color={YEL} />
    <T y={520} size={64} center style={rise(lf, at("How it's enforced"))}>How it's enforced: <K c={YEL}>can't be checked</K></T>
    <T y={630} size={46} center color={DIM} style={rise(lf, at("So every penalty"))}>Every penalty on screen names its source.</T>
  </>) },
  { at: "But here's the strange part", sfx: "whoosh", face: "meh", r: ({ lf, at }) => (<>
    <T y={300} size={90} center style={rise(lf, at("If both sides"))}>If both sides speak Korean,</T>
    <T y={430} size={90} center style={rise(lf, at("what is there to ban"))}><K>what is there to ban?</K></T>
  </>) },
  // ---- 2. the split ----
  { at: "To answer that, go back", sfx: "whoosh", noHost: true, r: ({ lf }) => (<>
    <KoreaMap lf={lf} x={MX} y={MY} draw={0} />
    <T y={160} size={50} color={LIME} style={rise(lf)}>2 · THE SPLIT</T>
    <T y={300} size={220} style={pop(lf, 4, 0.6)}><K>1945</K></T>
  </>) },
  { at: "After 1945, the peninsula", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <KoreaMap lf={lf} x={MX} y={MY} draw={-99} split={at("divided")} pins={[{ city: "seoul", at: at("speech of Seoul"), label: "Seoul" }]} />
    <T y={200} size={70} style={rise(lf)}>1945: <K>divided.</K></T>
    <div style={{ position: "absolute", left: 140, top: 380, width: 720, padding: 40, borderRadius: 28, border: `4px solid ${LIME}`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, color: INK, boxSizing: "border-box", ...pop(lf, at("The South's standard")) }}>
      <div style={{ color: LIME, fontSize: 36 }}>SOUTH · standard language</div>
      based on <K>Seoul</K> speech
    </div>
  </>) },
  { at: "Then, in 1966, a talk by Kim Il Sung", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ency-munhwaeo")} />
    <Cap name="ency-munhwaeo" lf={lf} dur={dur} y={120} width={1500} marks={[["1966년 김일성 담화", at("1966")], ["서울말을 바탕으로 하는 남한의 표준어", at("independent from")], ["독립된 공용어", at("independent from") + 6]]} />
    <Tr lf={lf} d={at("independent from")} y={330}>1966 Kim Il Sung talk → a standard <K>independent</K> from the South's Seoul-based one</Tr>
    <Cap name="ency-pyongyang" lf={lf} dur={dur} y={500} width={1400} d={at("Centered on Pyongyang")} marks={[["평양말을 중심으로", at("Pyongyang speech")]]} />
    <Tr lf={lf} d={at("Pyongyang speech")} y={660}>"…centered on <K>Pyongyang speech</K>"</Tr>
  </>) },
  { at: "It got a name", sfx: "pop", noHost: true, r: ({ lf, at }) => (<>
    <KoreaMap lf={lf} x={MX} y={MY} draw={-99} split={-99} pins={[{ city: "seoul", at: -99, label: "Seoul" }, { city: "pyongyang", at: 2, label: "Pyongyang" }]} />
    <div style={{ position: "absolute", left: 140, top: 220, width: 720, padding: 40, borderRadius: 28, border: `4px solid ${RED}`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, color: INK, boxSizing: "border-box", ...pop(lf, 2) }}>
      <div style={{ color: RED, fontSize: 36 }}>NORTH · since 1966</div>
      based on <span style={{ color: RED }}>Pyongyang</span> speech
    </div>
    <T y={520} size={170} style={pop(lf, at("munhwaeo"), 0.6)}><K>문화어</K></T>
    <T y={740} size={56} style={rise(lf, at("The cultured"))}>munhwaeo · "the cultured language"</T>
  </>) },
  { at: "Which, if you're from Seoul", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="meh" a="From Seoul?" b={<K>That's a little rude.</K>} />
  ) },
  { at: "And here's the twist", sfx: "whoosh", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ll-ramsey")} />
    <T y={130} size={70} style={rise(lf)}>The twist</T>
    <Cap name="ll-ramsey" lf={lf} dur={dur} y={260} width={1400} d={at("Linguist")} marks={[["based upon the earlier, traditional dialect of Seoul", at("based on the old speech")]]} />
    <T y={620} size={64} style={rise(lf, at("based on the old speech"))}>The North's standard: <K>based on old Seoul speech</K></T>
  </>) },
  { at: "So the North declared independence", sfx: "stamp", noHost: true, r: ({ lf, at }) => (<>
    <KoreaMap lf={lf} x={MX} y={MY} draw={-99} split={-99} pins={[{ city: "seoul", at: -99, label: "Seoul" }, { city: "pyongyang", at: -99, label: "Pyongyang" }]} arrow={at("in a language built")} arrowLabel="built on old Seoul speech" />
    <T y={330} size={76} style={rise(lf)}>Independence</T>
    <T y={430} size={76} style={rise(lf, 4)}>from Seoul…</T>
    <T y={580} size={76} style={rise(lf, at("in a language built"))}><K>…in a language</K></T>
    <T y={680} size={76} style={rise(lf, at("in a language built") + 4)}><K>built on Seoul.</K></T>
  </>) },
  { at: "Then it started cleaning house", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("ency-maldadeumgi")} />
    <Cap name="ency-maldadeumgi" lf={lf} dur={dur} y={200} width={1500} d={at("A campaign")} marks={[["외래어와 한자어를 고유어로", at("replace foreign")]]} />
    <Tr lf={lf} d={at("replace foreign")} y={430}>"…refining <K>foreign and Chinese-based words</K> into native words"</Tr>
    <T y={580} size={80} style={rise(lf, at("native Korean ones"))}>Foreign words out. <K>Native words in.</K></T>
  </>) },
  { at: "In 1988, the journal", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={NIKL} />
    <Crop name="nikl-1988-table" lf={lf} y0={0} y1={130} y={220} width={1200} />
    <Tr lf={lf} d={at("published a list")} y={520}>"Refined words (loanwords)": <K>original · North Korean loanword · refined word</K></Tr>
    <T y={650} size={70} style={rise(lf, at("what the North came up with"))}>What the North <K>came up with</K></T>
  </>) },
  { at: "Ice cream?", sfx: "pop", face: "happy", r: ({ lf, at }) => (<>
    <Source text={`${NIKL} (rows matched by position)`} />
    <Crop name="nikl-1988-table" lf={lf} y0={2270} y1={2470} y={250} x={120} width={720} marks={[["icecream", 4], ["얼음보숭이", at("Eoreum")]]} />
    <Pair lf={lf} d={at("Eoreum")} en="Ice cream" ko="얼음보숭이" mean="roughly, “ice fluff”" />
  </>) },
  { at: "Caramel?", sfx: "pop", face: "happy", r: ({ lf, at }) => (<>
    <Source text={`${NIKL} (rows matched by position)`} />
    <Crop name="nikl-1988-table" lf={lf} y0={1160} y1={1260} y={300} x={120} width={720} marks={[["caramel", 4], ["기름사탕", at("Gireum")]]} />
    <Pair lf={lf} d={at("Gireum")} en="Caramel" ko="기름사탕" mean="“oil candy”" />
  </>) },
  { at: "A knock on the door", sfx: "pop", face: "happy", r: ({ lf, at }) => (<>
    <Source text={`${NIKL} (rows matched by position)`} />
    <Crop name="nikl-1988-table" lf={lf} y0={2480} y1={2740} y={230} x={120} width={720} marks={[["knock", 4], ["손기척", at("Son-gicheok")]]} />
    <Pair lf={lf} d={at("Son-gicheok")} en="Knock" ko="손기척" mean="your hand saying “I'm here”" />
  </>) },
  { at: "Honestly? Some of these are better", sfx: "blip", noHost: true, r: ({ lf }) => (
    <Aside lf={lf} face="happy" a="Oil candy." b={<K>Honestly? Better.</K>} />
  ) },
  { at: "Meanwhile, the South went", sfx: "whoosh", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("dnk-loanwords")} />
    <Cap name="dnk-loanwords" lf={lf} dur={dur} y={140} d={at("According to Daily NK")} marks={[["ubiquitous in the South", at("everywhere")], ["virtually unknown in the North", at("virtually unknown")]]} />
    {["computer", "cafe", "internet"].map((t, i) => (
      <div key={t} style={{ position: "absolute", left: 300 + i * 460, top: 520, width: 400, padding: "22px 0", textAlign: "center", borderRadius: 24, border: `4px solid ${LIME}`, fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, color: LIME, ...pop(lf, at(t)) }}>{t}</div>
    ))}
    <T y={700} size={56} center style={rise(lf, at("virtually unknown"))}>South: everywhere. <K c={RED}>North: virtually unknown.</K></T>
  </>) },
  { at: "You can even see the split in print", sfx: "pop", face: "prompt", noHost: true, r: ({ lf, dur, at }) => (<>
    <Source text={WIKI} />
    <Shot lf={lf} dur={dur} src="sn03/captures/rodong-photo.png" w={RODONG.w} h={RODONG.h} scale={0.6} x={160} y={110} zoom={0.04} />
    <T x={860} y={260} size={60} color={DIM} style={rise(lf, at("main newspaper"))}>North Korea's main newspaper</T>
    <T x={860} y={360} size={150} style={pop(lf, at("Rodong Sinmun"), 0.6)}><K>로동</K>신문</T>
    <T x={860} y={580} size={64} style={rise(lf, at("with an R"))}><K>Rodong</K> = labor</T>
  </>) },
  { at: "In South Korean spelling", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={`${srcOf("ency-pyongyang")} (a South Korean encyclopedia)`} />
    <Cap name="ency-pyongyang" lf={lf} dur={dur} y={160} width={1400} marks={[["노동", at("Nodong")]]} />
    <T x={300} y={400} size={150} style={pop(lf, 4, 0.6)}>로동</T>
    <T x={300} y={580} size={44} color={DIM} style={rise(lf, 8)}>North</T>
    <T x={1000} y={400} size={150} style={pop(lf, at("Nodong"), 0.6)}><K>노동</K></T>
    <T x={1000} y={580} size={44} color={DIM} style={rise(lf, at("Nodong") + 4)}>South</T>
  </>) },
  { at: "Same word. Same meaning", sfx: "pop", face: "happy", r: ({ lf, at }) => (<>
    <T y={240} size={80} center style={rise(lf)}>Same word. Same meaning.</T>
    <T y={360} size={80} center style={rise(lf, at("Different first letter"))}><K>Different first letter.</K></T>
    <T y={560} size={70} center style={rise(lf, at("Like British"))}>colour / color</T>
    <T y={660} size={50} center color={DIM} style={rise(lf, at("with a border"))}>…but with a border in the middle</T>
  </>) },
  // ---- 3. how different ----
  { at: "So, how different is it, really", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <T y={160} size={50} color={LIME} style={rise(lf)}>3 · HOW DIFFERENT?</T>
    <T y={330} size={110} style={rise(lf, 3)}>How different, <K>really?</K></T>
    <T y={500} size={60} color={DIM} style={rise(lf, at("complicated"))}>It's complicated.</T>
  </>) },
  { at: "North Koreans who resettle", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("jad-hanawon")} />
    <Cap name="jad-hanawon" lf={lf} dur={dur} y={120} width={1100} marks={[["three months of intensive training", at("three months")]]} />
    <Cap name="jad-lessons" lf={lf} dur={dur} y={560} width={1100} d={at("including lessons")} marks={[["language lessons on the pronunciation and foreign words", at("pronunciation")]]} />
  </>) },
  { at: "But a study released in 2007", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("mcst-study")} />
    <Cap name="mcst-study" lf={lf} dur={dur} y={120} width={1500} marks={[["새터민 언어실태 조사 연구", at("National Institute")], ["새터민 100명", at("a hundred defectors")]]} />
    <Tr lf={lf} d={at("a hundred defectors")} y={510}>National Institute of Korean Language study · <K>100 defectors</K> surveyed</Tr>
    <T y={640} size={60} style={rise(lf, at("how long"))}>How long until the difference <K>stops being felt?</K></T>
  </>) },
  { at: "The biggest group", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("mcst-3years")} />
    <Cap name="mcst-3years" lf={lf} dur={dur} y={140} width={1500} marks={[["36개월 이상이라고 답한 사람이 32%", at("thirty-two percent")]]} />
    <T y={440} size={170} center style={pop(lf, at("three years"), 0.6)}><K>3+ years</K></T>
    <T y={660} size={60} center style={rise(lf, at("three years") + 6)}>the biggest group: 32%</T>
  </>) },
  { at: "In the vocabulary test", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("mcst-loan80")} />
    <Cap name="mcst-loan80" lf={lf} dur={dur} y={160} width={1500} marks={[["외래어가 전체의 80%", at("eighty percent")]]} />
    <Tr lf={lf} d={at("got wrong")} y={350}>Of the words defectors got wrong most: <K>80% loanwords</K></Tr>
    <T y={500} size={170} center style={pop(lf, at("eighty percent"), 0.6)}><K>80%</K></T>
  </>) },
  { at: "But the same study has a twist", sfx: "whoosh", face: "shock", r: ({ lf }) => (<>
    <T y={380} size={110} center style={rise(lf)}>But… <K>a twist.</K></T>
  </>) },
  { at: "Asked if the language gap", sfx: "pop", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("mcst-inconv")} />
    <Cap name="mcst-inconv" lf={lf} dur={dur} y={110} width={1500} marks={[["‘별로 못 느낀다’ 28%", at("forty-three")], ["‘전혀 못 느낀다’가 15%", at("forty-three") + 3], ["‘많이 느낀다’ 18%", at("twenty-one")], ["‘매우 많이 느낀다’ 3%", at("twenty-one") + 3]]} />
    <T y={330} size={52} style={rise(lf, 4)}>Does the language gap make daily life hard?</T>
    <Bar lf={lf} d={at("forty-three")} label="No (28% + 15%)" value={43} max={50} x={160} y={440} color={LIME} fmt={(v) => `${Math.round(v)}%`} len={1200} />
    <Bar lf={lf} d={at("twenty-one")} label="Yes (18% + 3%)" value={21} max={50} x={160} y={630} color={RED} fmt={(v) => `${Math.round(v)}%`} len={1200} />
  </>) },
  { at: "And asked if they would try", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("mcst-69")} />
    <Cap name="mcst-69" lf={lf} dur={dur} y={110} width={1500} marks={[["‘별로 그렇지 않다’ 26%", at("sixty-nine")], ["‘그렇지 않다’ 43%", at("sixty-nine") + 3]]} />
    <T y={380} size={56} style={rise(lf, 4)}>Will you try to talk like South Koreans?</T>
    <T y={480} size={190} center style={pop(lf, at("sixty-nine"), 0.6)}><K>69%</K> no</T>
  </>) },
  { at: "So the gap is real", sfx: "blip", noHost: true, r: ({ lf, at }) => (<>
    <Blip lf={lf} face="happy" x={240} y={220} size={540} />
    <T x={900} y={260} size={66} style={rise(lf)}>The gap is real.</T>
    <T x={900} y={360} size={66} style={rise(lf, at("not a wall"))}>Not a wall.</T>
    <T x={900} y={460} size={66} style={rise(lf, at("very annoying fence"))}><K>A very annoying fence.</K></T>
  </>) },
  { at: "Which brings us back", sfx: "whoosh", face: "prompt", r: ({ lf, at }) => (<>
    <T y={300} size={66} color={DIM} center style={rise(lf)}>Back to the big question:</T>
    <T y={420} size={90} center style={rise(lf, at("why ban"))}>Why ban the <K>South Korean way</K> of talking?</T>
  </>) },
  { at: "Because the words give away", sfx: "stamp", face: "prompt", r: ({ lf }) => (<>
    <T y={330} size={100} center style={rise(lf)}>The words give away</T>
    <T y={460} size={100} center style={rise(lf, 8)}><K>where you got them.</K></T>
  </>) },
  { at: "Asia Economy, citing South Korea's spy agency, says young", sfx: "pop", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={`${srcOf("asiae-nis")}, citing South Korea's National Intelligence Service`} />
    <Cap name="asiae-nis" lf={lf} dur={dur} y={140} marks={[["secretly consuming Hallyu content", at("secretly watching")]]} />
    <T y={540} size={76} style={rise(lf, at("secretly watching"))}>Young people · <K>secret K-dramas</K></T>
  </>) },
  { at: "And watching those dramas", sfx: "stamp", face: "shock", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("idea-2020")} />
    <Cap name="idea-2020" lf={lf} dur={dur} y={140} width={1400} d={at("According to")} marks={[["death penalty for those distributing K-dramas", at("death penalty")]]} />
    <Stamp lf={lf} d={at("a 2020 law")} text="2020 LAW" x={300} y={560} rot={-5} size={100} color={RED} />
    <T x={860} y={580} size={60} style={rise(lf, at("distributing"))}>distributing K-dramas: <K c={RED}>death penalty</K></T>
  </>) },
  { at: "So the language law closes a gap", sfx: "pop", face: "meh", r: ({ lf, at }) => (<>
    <T y={300} size={80} center style={rise(lf, at("A drama can be hidden"))}>A drama can be hidden.</T>
    <T y={430} size={80} center style={rise(lf, at("A habit in your voice"))}><K>A habit in your voice is harder to hide.</K></T>
  </>) },
  { at: "Not every link is broken", sfx: "whoosh", face: "happy", r: ({ lf, at }) => (<>
    <T y={300} size={80} center style={rise(lf)}>Not every link is broken.</T>
    <T y={430} size={80} center style={rise(lf, at("joint project"))}>One dictionary, <K>both Koreas</K></T>
  </>) },
  { at: "According to Seoul's 2026 unification", sfx: "pop", face: "prompt", r: ({ lf, dur, at }) => (<>
    <Source text={srcOf("tf-dictionary")} />
    <Cap name="tf-whitepaper" lf={lf} dur={dur} y={110} width={1300} marks={[["‘2026 통일백서’", at("white paper")]]} />
    <Cap name="tf-dictionary" lf={lf} dur={dur} y={330} width={1300} d={at("the South put")} marks={[["겨레말큰사전 남북 공동편찬사업에 24억 8600만 원", at("two point four")]]} />
    <Tr lf={lf} d={at("two point four")} y={680}>Joint dictionary project: <K>₩2.486 billion</K> last year</Tr>
  </>) },
  { at: "One dictionary. Two standards", sfx: "pop", face: "happy", r: ({ lf, at }) => (<>
    <T y={250} size={90} center style={rise(lf)}>One dictionary.</T>
    <T y={370} size={90} center style={rise(lf, at("Two standards"))}>Two standards.</T>
    <T y={490} size={90} center style={rise(lf, at("Still being written"))}><K>Still being written.</K></T>
  </>) },
  // ---- verdict ----
  { at: "So, the check", sfx: "whoosh", face: "prompt", r: ({ lf }) => (<>
    <T y={360} size={150} center style={pop(lf, 2, 0.6)}>THE <K>CHECK</K></T>
  </>) },
  { at: "Claim: North and South", sfx: "pop", face: "prompt", r: ({ lf }) => (<>
    <T y={220} size={56} color={DIM} center style={rise(lf)}>CLAIM</T>
    <T y={320} size={84} center style={rise(lf, 6)}>North and South Koreans now speak</T>
    <T y={430} size={84} center style={rise(lf, 10)}><K>two different languages.</K></T>
  </>) },
  { at: "Vocabulary? Clearly drifting", sfx: "pop", face: "prompt", r: ({ lf, at }) => (<>
    <Item lf={lf} d={2} y={200} n="✓">Vocabulary: <K>drifting</K></Item>
    <Item lf={lf} d={at("the North widened it")} y={330} n="✓">Loanwords: biggest gap, <K>widened on purpose</K></Item>
    <Item lf={lf} d={at("But the alphabet")} y={460} n="=" c={INK}>Alphabet, grammar, base: <K>shared</K></Item>
    <Item lf={lf} d={at("most defectors")} y={590} n="=" c={INK}>Most in the study: <K>daily life not hard</K></Item>
    <Item lf={lf} d={at("And the penalties")} y={720} n="?" c={YEL}>Penalties: <span style={{ color: YEL }}>reported, can't verify enforcement</span></Item>
  </>) },
  { at: "Verdict: half true", sfx: "stamp", face: "happy", r: ({ lf, at }) => (<>
    <Stamp lf={lf} d={at("half true")} text="HALF TRUE" x={520} y={200} rot={-6} size={170} color={YEL} />
    <T y={560} size={64} center style={rise(lf, at("One language"))}>One language. <K>Two dictionaries.</K></T>
    <T y={660} size={52} center color={DIM} style={rise(lf, at("one side that is trying"))}>And one side trying very hard to keep them apart.</T>
  </>) },
  { at: "Would you have guessed", sfx: "ding", noHost: true, r: ({ lf, at }) => (<>
    <T y={160} size={80} center style={rise(lf)}>Would you have guessed <K>"oil candy"?</K></T>
    <Blip lf={lf} face="happy" x={720} y={330} size={420} d={4} />
    <T y={790} size={56} center style={rise(lf, at("Tell me"))}>Tell Blip in the comments ↓</T>
    <T y={900} size={44} center color={DIM} style={rise(lf, at("Tell me") + 6)}>BLIP CHECK <K>&gt;_</K> · Korea, checked</T>
  </>) },
];

const TL = makeTimeline(words, LINES as string[], B, 45);
export const SN03_DURATION = TL.duration;
export const Sn03Full: React.FC = () => <Stage tl={TL} audio="sn03/narration.mp3" />;
