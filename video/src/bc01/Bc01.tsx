import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../StyleFrames";
import words from "../../public/bc01/narration.words.json";
import LINES from "../../public/bc01/lines.json";

// Blip Check #1 — GPT-6.2 Astra vs Sol. 16:9 long-form, cuts timed to narration words.
// Captures in public/bc01 are real (SiliconANGLE, OpenAI pricing page, Artificial Analysis).
// Music bed is mixed afterwards with ffmpeg (sidechain ducking under the voice).

export const FPS = 30;
export const LIME = "#D7FF3A";
export const INK = "#F5F5F2";
export const BG = "#0A0B0D";
export const DIM = "rgba(255,255,255,0.6)";
export const RED = "#FF6B5E";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

type W = { text: string; start: number; end: number };
const WORDS = words as W[];

// ---------- timing ----------
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
let BIG = "";
const OWNER: number[] = [];
WORDS.forEach((w, i) => {
  for (const c of norm(w.text)) {
    BIG += c;
    OWNER.push(i);
  }
});
// Start time (s) of the first occurrence of `phrase` at or after `after` seconds.
const timeOf = (phrase: string, after = 0): number => {
  const n = norm(phrase);
  let from = 0;
  for (;;) {
    const at = BIG.indexOf(n, from);
    if (at < 0) throw new Error(`phrase not found: ${phrase} (after ${after})`);
    const t = WORDS[OWNER[at]].start;
    if (t >= after - 0.05) return t;
    from = at + 1;
  }
};
const f = (s: number) => Math.round(s * FPS);
const END_S = WORDS[WORDS.length - 1].end;
export const BC01_DURATION = f(END_S) + 45;

// ---------- primitives ----------
type Ctx = { lf: number; dur: number; at: (phrase: string) => number };

export const pop = (lf: number, d = 0, from = 0.86) => {
  const s = spring({ frame: lf - d, fps: FPS, config: { damping: 14, stiffness: 170 } });
  return { opacity: interpolate(lf - d, [0, 3], [0, 1], clamp), scale: String(from + (1 - from) * s) };
};
export const rise = (lf: number, d = 0) => ({
  opacity: interpolate(lf - d, [0, 4], [0, 1], clamp),
  translate: `0px ${interpolate(lf - d, [0, 8], [26, 0], { ...clamp, easing: outExpo })}px`,
});

export const T: React.FC<{ x?: number; y: number; size: number; color?: string; w?: number; center?: boolean; weight?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  x = 140, y, size, color = INK, w, center, weight = 900, style, children,
}) => (
  <div
    style={{
      position: "absolute",
      left: center ? 0 : x,
      right: center ? 0 : undefined,
      width: center ? undefined : w,
      top: y,
      textAlign: center ? "center" : "left",
      fontFamily: "Pretendard",
      fontWeight: weight,
      fontSize: size,
      color,
      letterSpacing: size > 90 ? -3 : -1,
      lineHeight: 1.08,
      ...style,
    }}
  >
    {children}
  </div>
);
export const K: React.FC<{ c?: string; children: React.ReactNode }> = ({ c = LIME, children }) => <span style={{ color: c }}>{children}</span>;

type Box = { x: number; y: number; w: number; h: number; at?: number };
export const Shot: React.FC<{ lf: number; dur: number; src: string; w: number; h: number; scale: number; x: number; y: number; marks?: Box[]; rings?: Box[]; tilt?: number; zoom?: number; d?: number }> = ({
  lf, dur, src, w, h, scale, x, y, marks = [], rings = [], tilt = 0, zoom = 0.05, d = 0,
}) => {
  const kb = 1 + zoom * interpolate(lf, [0, Math.max(1, dur)], [0, 1], clamp);
  const p = pop(lf, d, 0.9);
  return (
    <div style={{ position: "absolute", left: x, top: y, rotate: `${tilt}deg`, opacity: p.opacity, scale: String(Number(p.scale) * kb), transformOrigin: "50% 50%" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "relative", width: w * scale, height: h * scale }}>
          <Img src={staticFile(src)} style={{ width: w * scale, height: h * scale, display: "block" }} />
          {marks.map((m, i) => {
            const k = interpolate(lf - (m.at ?? 6), [0, 9], [0, 1], { ...clamp, easing: outExpo });
            return <div key={i} style={{ position: "absolute", left: m.x * scale, top: m.y * scale, width: m.w * scale * k, height: m.h * scale, background: LIME, mixBlendMode: "multiply", borderRadius: 6 }} />;
          })}
          {rings.map((m, i) => {
            const k = interpolate(lf - (m.at ?? 6), [0, 6], [0, 1], clamp);
            return (
              <div key={i} style={{ position: "absolute", left: m.x * scale - 8, top: m.y * scale - 8, width: m.w * scale + 16, height: m.h * scale + 16, border: "6px solid #111", outline: `5px solid ${LIME}`, borderRadius: 12, opacity: k, scale: String(1.15 - 0.15 * k) }} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Stamp: React.FC<{ lf: number; d?: number; text: string; x: number; y: number; rot?: number; color?: string; size?: number }> = ({ lf, d = 0, text, x, y, rot = -7, color = LIME, size = 90 }) => {
  const k = lf - d;
  if (k < 0) return null;
  const s = interpolate(k, [0, 5], [1.7, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.75, 0) });
  return (
    <div style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, scale: String(s), opacity: interpolate(k, [0, 2], [0, 1], clamp), fontFamily: "Pretendard", fontWeight: 900, fontSize: size, color, border: `9px solid ${color}`, borderRadius: 16, padding: "4px 30px", background: "rgba(10,11,13,0.85)", whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};

export type Face = "prompt" | "happy" | "shock" | "meh" | "front";
export const Blip: React.FC<{ lf: number; d?: number; face: Face; x: number; y: number; size?: number; flip?: boolean }> = ({ lf, d = 0, face, x, y, size = 520, flip }) => {
  const p = pop(lf, d, 0.6);
  const bob = Math.sin((lf - d) / 9) * 6;
  return (
    <div style={{ position: "absolute", left: x, top: y + bob, width: size, height: size, opacity: p.opacity, scale: String(p.scale), transformOrigin: "50% 80%" }}>
      <Img src={staticFile(`bc01/blip/${face}.png`)} style={{ width: size, height: size, transform: flip ? "scaleX(-1)" : undefined }} />
    </div>
  );
};

const Card: React.FC<{ lf: number; d?: number; x: number; y: number; w: number; h: number; accent?: string; children: React.ReactNode }> = ({ lf, d = 0, x, y, w, h, accent = "rgba(255,255,255,0.25)", children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 28, background: "rgba(255,255,255,0.06)", border: `3px solid ${accent}`, padding: 40, boxSizing: "border-box", ...pop(lf, d) }}>{children}</div>
);

export const Bar: React.FC<{ lf: number; d: number; label: string; value: number; max: number; x: number; y: number; color: string; fmt?: (v: number) => string; len?: number }> = ({ lf, d, label, value, max, x, y, color, fmt = (v) => String(Math.round(v)), len = 1000 }) => {
  const k = interpolate(lf - d, [0, 16], [0, 1], { ...clamp, easing: outExpo });
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: interpolate(lf - d, [0, 3], [0, 1], clamp) }}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 40, color: INK, marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: (len * value * k) / max, height: 64, background: color, borderRadius: 10 }} />
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color }}>{fmt(value * k)}</div>
      </div>
    </div>
  );
};

export const Source: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 48, top: 36, fontFamily: "Pretendard", fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.5)" }}>Source: {text}</div>
);
const SA = "SiliconANGLE, Nov 17 2026";
const AA = "Artificial Analysis (independent), max settings";

export const Label: React.FC<{ lf: number; d?: number; text: string; x: number; y: number }> = ({ lf, d = 0, text, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: "Pretendard", fontWeight: 900, fontSize: 26, color: BG, background: LIME, padding: "6px 14px", borderRadius: 8, ...rise(lf, d) }}>{text}</div>
);

// Report card for the benchmark explainer.
export const Report: React.FC<{ lf: number; d: number; x: number; y: number; rot: number; grade: string; label: string; dim?: boolean }> = ({ lf, d, x, y, rot, grade, label, dim }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 280, height: 360, rotate: `${rot}deg`, background: "#F3F1EA", borderRadius: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", padding: 26, boxSizing: "border-box", ...pop(lf, d), opacity: interpolate(lf - d, [0, 3], [0, dim ? 0.3 : 1], clamp) }}>
    <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 22, color: "#555" }}>TEST</div>
    <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 28, color: "#111", marginTop: 6, lineHeight: 1.2, height: 70 }}>{label}</div>
    <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 150, color: grade === "A" ? "#2E9E3E" : "#C0392B", marginTop: 10 }}>{grade}</div>
  </div>
);

// ---------- beats ----------
const PS = (src: string, w: number, h: number) => ({ src: `bc01/${src}.png`, w, h, scale: 1.05, x: (1920 - w * 1.05 - 44) / 2 });

type Beat = { at: string; sfx?: string; vol?: number; face?: Face; noHost?: boolean; r: (c: Ctx) => React.ReactNode };

const B: Beat[] = [
  // 1. Hook
  { at: "OpenAI just dropped", face: "shock", sfx: "whoosh", r: ({ lf }) => (<>
    <T y={250} size={70} color={DIM} center style={rise(lf)}>OpenAI just dropped</T>
    <T y={350} size={190} center style={pop(lf, 4)}>GPT-6.2 <K>Astra</K> + <K>Sol</K></T>
  </>) },
  { at: "the headline claim", face: "shock", sfx: "whoosh", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <Shot lf={lf} dur={dur} src="bc01/claim.png" w={1512} h={245} scale={1.0} x={180} y={300} tilt={-1.2} marks={[{ x: 1028, y: 126, w: 330, h: 52, at: at("beats Claude") }, { x: 28, y: 183, w: 925, h: 52, at: at("five percent") }]} />
  </>) },
  { at: "Five percent That's", noHost: true, sfx: "stamp", r: ({ lf, at }) => (<>
    <T y={170} size={420} center style={pop(lf, 0, 0.5)}><K>5%</K></T>
    <Stamp lf={lf} d={at("clearance sale")} text="CLEARANCE SALE" x={1000} y={640} rot={-8} size={84} color={RED} />
    <Blip lf={lf} face="shock" x={90} y={420} size={480} />
  </>) },
  { at: "So Blip checked", noHost: true, sfx: "blip", r: ({ lf }) => (<>
    <Shot lf={lf} dur={60} src="bc01/n-rd.png" w={1680} h={420} scale={0.42} x={90} y={130} tilt={-4} />
    <Shot lf={lf} dur={60} src="bc01/n-tt.png" w={2600} h={330} scale={0.3} x={1020} y={170} tilt={3} d={3} />
    <Shot lf={lf} dur={60} src="bc01/n-dc.png" w={1320} h={640} scale={0.36} x={1300} y={420} tilt={-2} d={6} />
    <Blip lf={lf} face="prompt" x={620} y={330} size={500} />
    <T y={830} size={90} center style={pop(lf, 6)}>BLIP CHECK <K>&gt;_</K></T>
  </>) },
  { at: "Three questions", face: "prompt", sfx: "pop", r: ({ lf, at }) => (<>
    <T y={140} size={64} color={LIME} style={rise(lf)}>Three questions</T>
    {["What actually changed?", "Does it really beat Claude?", "Which one should you use?"].map((q, i) => (
      <T key={q} y={280 + i * 150} size={92} style={rise(lf, at(["What actually", "Does it really", "And which one"][i]))}><K>{i + 1}.</K> {q}</T>
    ))}
  </>) },
  // 2. What dropped
  { at: "On November seventeenth", face: "prompt", sfx: "whoosh", r: ({ lf, dur }) => (<>
    <Source text={SA} />
    <Shot lf={lf} dur={dur} src="bc01/headline.png" w={1483} h={252} scale={1.0} x={190} y={260} />
    <Label lf={lf} d={10} text="NOV 17, 2026" x={210} y={190} />
  </>) },
  { at: "Astra is the big one", face: "prompt", sfx: "pop", r: ({ lf }) => (<>
    <Card lf={lf} x={560} y={170} w={800} h={560} accent={INK}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 40, color: DIM }}>GPT-6.2</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 190, color: INK, letterSpacing: -6, lineHeight: 1 }}>Astra</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 52, color: INK, marginTop: 30 }}>complex <K>professional</K> work</div>
    </Card>
  </>) },
  { at: "Sol is what OpenAI", face: "happy", sfx: "pop", r: ({ lf, at }) => (<>
    <Card lf={lf} x={560} y={170} w={800} h={560} accent={LIME}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 40, color: DIM }}>GPT-6.2</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 190, color: LIME, letterSpacing: -6, lineHeight: 1 }}>Sol</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 52, color: INK, marginTop: 30, ...rise(lf, at("go-to")) }}>"go-to model for <K>everyday</K> work"</div>
    </Card>
  </>) },
  { at: "If you're keeping track", face: "happy", sfx: "whoosh", r: ({ lf, at }) => {
    const names = ["Astra", "Sol", "Terra", "Luna"];
    const cx = 960, cy = 470;
    return (<>
      {[240, 340, 440].map((r) => <div key={r} style={{ position: "absolute", left: cx - r, top: cy - r * 0.55, width: r * 2, height: r * 1.1, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)" }} />)}
      {names.map((n, i) => {
        const ang = [0.3, 0, 2.4, 4.2][i] + lf / 70;
        const r = [240, 0, 340, 440][i];
        const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r * 0.55;
        const d = at(n);
        return <div key={n} style={{ position: "absolute", left: x - 90, top: y - 40, width: 180, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: i === 1 ? 70 : 46, color: i === 1 ? BG : INK, background: i === 1 ? LIME : "rgba(255,255,255,0.1)", borderRadius: 999, padding: "8px 0", ...pop(lf, d) }}>{n}</div>;
      })}
      <Stamp lf={lf} d={at("solar system")} text="A SOLAR SYSTEM" x={880} y={780} rot={-6} size={70} />
    </>);
  } },
  { at: "Both are live", face: "prompt", sfx: "whoosh", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <Shot lf={lf} dur={dur + 150} {...PS("p-avail", 1464, 404)} y={250} marks={[{ x: 877, y: 4, w: 471, h: 48, at: at("Plus") }]} />
  </>) },
  { at: "On Enterprise and Edu", noHost: true, r: ({ lf, dur, at }) => {
    const joke = at("go bother");
    if (lf < joke) return (<>
      <Source text={SA} />
      <Shot lf={lf + 132} dur={dur + 150} {...PS("p-avail", 1464, 404)} y={250} d={-999} marks={[{ x: 877, y: 4, w: 471, h: 48, at: -999 }, { x: 1020, y: 61, w: 366, h: 48, at: 132 + at("workspace admin") }, { x: 0, y: 119, w: 302, h: 48, at: 138 + at("workspace admin") }]} />
    </>);
    const on = lf >= joke + 6;
    return (<>
      <div style={{ position: "absolute", left: 160, top: 300, width: 260, height: 130, borderRadius: 999, background: on ? LIME : "rgba(255,255,255,0.15)" }}>
        <div style={{ position: "absolute", top: 13, left: on ? 143 : 13, width: 104, height: 104, borderRadius: "50%", background: on ? BG : INK }} />
      </div>
      <T x={160} y={500} size={72} style={rise(lf, joke)}>Go bother your IT person.</T>
      <T x={160} y={600} size={56} color={LIME} style={rise(lf, at("Nicely"))}>(nicely)</T>
      <Blip lf={lf} d={joke} face="meh" x={1250} y={260} size={520} />
    </>);
  } },
  { at: "Astra also arrives", face: "shock", sfx: "whoosh", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <T y={150} size={56} color={DIM} style={rise(lf)}>Less than two months ago: GPT-6.1 Astra</T>
    <Shot lf={lf} dur={dur} {...PS("p-calledoff", 1464, 232)} y={300} marks={[{ x: 953, y: 4, w: 154, h: 48, at: at("called off") }, { x: 0, y: 119, w: 642, h: 48, at: at("scope and authorization") }]} />
    <Stamp lf={lf} d={at("called off")} text="CALLED OFF" x={1060} y={600} rot={-8} size={80} color={RED} />
  </>) },
  { at: "In other words", noHost: true, sfx: "blip", r: ({ lf, at }) => (<>
    <T y={220} size={84} style={rise(lf)}>It didn't stay in its lane.</T>
    <T y={360} size={84} color={LIME} style={rise(lf, at("Blip would never"))}>Blip would never.</T>
    <div style={{ position: "absolute", left: 1000, top: 330, fontFamily: "Pretendard", fontWeight: 900, fontSize: 46, color: BG, background: INK, borderRadius: 28, padding: "18px 30px", ...pop(lf, at("Blip asks first")) }}>"Can I edit this?"</div>
    <Blip lf={lf} d={at("Blip would never")} face="happy" x={1180} y={420} size={480} />
  </>) },
  // 3. Astra pitch
  { at: "Astra's pitch is office", face: "prompt", sfx: "whoosh", r: ({ lf, at }) => (<>
    <T y={160} size={64} style={rise(lf)}>Astra's pitch: <K>office work</K></T>
    {["Slides", "Spreadsheets", "Documents"].map((n, i) => (
      <Card key={n} lf={lf} d={at(n === "Documents" ? "documents" : n)} x={140 + i * 560} y={330} w={500} h={360} accent={i === 0 ? LIME : "rgba(255,255,255,0.3)"}>
        <div style={{ height: 150, display: "flex", gap: 10, alignItems: "flex-end" }}>
          {i === 0 && <div style={{ width: 230, height: 140, borderRadius: 10, border: `6px solid ${INK}` }} />}
          {i === 1 && [0, 1, 2].map((r) => <div key={r} style={{ width: 70, height: 40 + r * 45, background: LIME, borderRadius: 6 }} />)}
          {i === 2 && <div style={{ width: 150, height: 150, borderRadius: 10, background: INK, padding: 18, boxSizing: "border-box" }}>{[0, 1, 2, 3].map((l) => <div key={l} style={{ height: 10, background: "#999", marginBottom: 14, width: `${90 - l * 12}%` }} />)}</div>}
        </div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 58, color: INK, marginTop: 40 }}>{n}</div>
      </Card>
    ))}
  </>) },
  { at: "It can even match", face: "happy", sfx: "pop", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <Shot lf={lf} dur={dur} {...PS("p-font", 1464, 290)} y={260} marks={[{ x: 1280, y: 4, w: 102, h: 48, at: 2 }, { x: 0, y: 61, w: 499, h: 48, at: 4 }, { x: 202, y: 234, w: 451, h: 48, at: at("exact font size") }]} />
    <T y={720} size={72} center style={rise(lf, at("exact font size"))}>24pt = 24pt <K>✓</K></T>
  </>) },
  { at: "Finally an AI that cares", noHost: true, sfx: "stamp", r: ({ lf, at }) => (<>
    <Stamp lf={lf} d={at("fonts")} text="FONT POLICE" x={260} y={300} rot={-8} size={120} />
    <Blip lf={lf} face="happy" x={1180} y={240} size={560} />
  </>) },
  { at: "One early tester", face: "shock", sfx: "pop", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <Shot lf={lf} dur={dur} {...PS("p-basis", 1464, 176)} y={200} marks={[{ x: 786, y: 61, w: 183, h: 48, at: at("fell by half") }]} />
    <T y={520} size={220} center style={pop(lf, at("fell by half"), 0.5)}><K>−50%</K></T>
  </>) },
  // 4. Price
  { at: "Now the price", face: "prompt", sfx: "whoosh", r: ({ lf, dur, at }) => (<>
    <Source text="OpenAI API pricing page (per 1M tokens)" />
    <Shot lf={lf} dur={dur + 120} src="bc01/price.png" w={1771} h={396} scale={0.9} x={120} y={260} rings={[{ x: 0, y: 84, w: 1720, h: 70, at: at("Astra costs") }]} />
    <T x={140} y={760} size={72} style={rise(lf, at("eight dollars"))}>Astra: <K>$8</K> in · <K>$40</K> out</T>
  </>) },
  { at: "Sol costs two and ten", face: "prompt", sfx: "pop", r: ({ lf, dur }) => (<>
    <Source text="OpenAI API pricing page (per 1M tokens)" />
    <Shot lf={lf + 40} dur={dur + 120} src="bc01/price.png" w={1771} h={396} scale={0.9} x={120} y={260} zoom={0.05} rings={[{ x: 0, y: 166, w: 1720, h: 70, at: 0 }]} />
    <T x={140} y={760} size={72} style={rise(lf)}>Sol: <K>$2</K> in · <K>$10</K> out</T>
  </>) },
  { at: "So per token", face: "shock", sfx: "stamp", r: ({ lf, at }) => (<>
    <T y={230} size={80} color={DIM} center style={rise(lf)}>per token</T>
    <Stamp lf={lf} d={at("four times")} text="4× THE PRICE" x={460} y={380} rot={-6} size={150} />
  </>) },
  { at: "To be fair", face: "happy", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <Shot lf={lf} dur={dur} {...PS("p-avail", 1464, 404)} y={170} marks={[{ x: 582, y: 234, w: 722, h: 48, at: at("twenty percent") }]} />
    <Stamp lf={lf} d={at("Expensive but on sale")} text="EXPENSIVE. BUT ON SALE." x={620} y={720} rot={-5} size={68} />
  </>) },
  // 5. Quiet part
  { at: "And here's the part", noHost: true, sfx: "blip", r: ({ lf }) => (<>
    <T y={330} size={110} style={rise(lf)}>The <K>quiet</K> part…</T>
    <Blip lf={lf} face="meh" x={1250} y={240} size={520} />
  </>) },
  { at: "On a coding benchmark", face: "meh", sfx: "whoosh", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <Shot lf={lf} dur={dur} src="bc01/solcatch.png" w={1512} h={245} scale={1.0} x={180} y={300} tilt={1} marks={[{ x: 336, y: 126, w: 692, h: 52, at: at("within half a point") }, { x: 676, y: 183, w: 470, h: 52, at: at("one fifth") }]} />
  </>) },
  { at: "You will not feel", face: "happy", sfx: "pop", r: ({ lf, at }) => (<>
    <T x={200} y={300} size={60} color={DIM} style={rise(lf)}>you feel</T>
    <T x={200} y={380} size={120} style={rise(lf, 2)}>0.5 pts</T>
    <T x={980} y={300} size={60} color={DIM} style={rise(lf, at("Your wallet"))}>your wallet feels</T>
    <T x={980} y={330} size={330} style={pop(lf, at("five times"), 0.4)}><K>5×</K></T>
  </>) },
  { at: "OpenAI also says Sol", face: "prompt", sfx: "whoosh", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <Shot lf={lf} dur={dur} {...PS("p-moretasks", 1464, 232)} y={280} marks={[{ x: 100, y: 61, w: 730, h: 48, at: at("more tasks") }]} />
  </>) },
  // 6. Benchmark explainer
  { at: "So does Astra really beat Claude", face: "prompt", sfx: "whoosh", r: ({ lf, at }) => (<>
    <T y={250} size={110} center style={rise(lf)}>Does Astra really <K>beat Claude?</K></T>
    <Stamp lf={lf} d={at("Quick detour")} text="30-SECOND DETOUR" x={560} y={560} rot={-4} size={80} />
  </>) },
  { at: "A benchmark is just a test", face: "prompt", sfx: "pop", r: ({ lf, at }) => (<>
    <T y={160} size={90} style={rise(lf)}>Benchmark = <K>a test.</K></T>
    {["Model A", "Model B", "Model C"].map((m, i) => (
      <div key={m} style={{ position: "absolute", left: 140, top: 380 + i * 130, display: "flex", alignItems: "center", gap: 30, ...rise(lf, at("Same questions") + i * 5) }}>
        <div style={{ width: 300, fontFamily: "Pretendard", fontWeight: 800, fontSize: 48, color: INK }}>{m}</div>
        <div style={{ width: [700, 560, 820][i] * interpolate(lf - at("compare scores"), [0, 14], [0, 1], { ...clamp, easing: outExpo }), height: 54, background: i === 2 ? LIME : "rgba(255,255,255,0.35)", borderRadius: 8 }} />
      </div>
    ))}
  </>) },
  { at: "The catch there are hundreds", face: "meh", sfx: "pop", r: ({ lf, at }) => {
    const sw = at("every company");
    if (lf >= sw) return (<>
      <Source text="OpenAI launch chart, via R&D World (Nov 17 2026)" />
      <T y={110} size={50} color={LIME} style={rise(lf, sw)}>…the company picks which ones go in the launch post.</T>
      <Shot lf={lf - sw} dur={80} src="bc01/c-vals.png" w={1484} h={1176} scale={0.52} x={560} y={200} />
      <Label lf={lf} d={sw + 6} text="EXAMPLE: OPENAI'S OWN CHART" x={590} y={850} />
    </>);
    return (<>
      <T y={140} size={64} style={rise(lf)}>Hundreds of tests…</T>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 140 + (i % 10) * 165, top: 260 + Math.floor(i / 10) * 140, width: 140, height: 110, borderRadius: 10, background: i === 13 ? LIME : "rgba(255,255,255,0.12)", ...pop(lf, i * 0.6) }} />
      ))}
    </>);
  } },
  { at: "It's like bringing home", face: "happy", sfx: "pop", r: ({ lf, at }) => (<>
    <Report lf={lf} d={0} x={180} y={300} rot={-6} grade="C" label="Test #41" dim />
    <Report lf={lf} d={4} x={420} y={280} rot={3} grade="A" label="the one shown" />
    <Report lf={lf} d={8} x={660} y={310} rot={8} grade="B" label="Test #87" dim />
    <Stamp lf={lf} d={at("Not lying")} text="NOT LYING." x={1080} y={300} rot={-5} size={80} />
    <Stamp lf={lf} d={at("Just curating")} text="JUST CURATING." x={1040} y={480} rot={-5} size={80} color={INK} />
  </>) },
  { at: "OpenAI's Claude claim comes", face: "prompt", sfx: "whoosh", r: ({ lf, at }) => (<>
    <Report lf={lf} d={0} x={200} y={260} rot={-3} grade="A" label="Agents' Last Exam" />
    <T x={620} y={300} size={70} style={rise(lf, at("Agents"))}>One test:</T>
    <T x={620} y={390} size={70} color={LIME} style={rise(lf, at("Agents"))}>Agents' Last Exam</T>
    <T x={620} y={500} size={48} color={DIM} style={rise(lf, at("multistep"))}>multistep professional work</T>
  </>) },
  { at: "On that test OpenAI says", face: "meh", r: ({ lf, dur, at }) => (<>
    <Source text={SA} />
    <Shot lf={lf} dur={dur} src="bc01/claim.png" w={1512} h={245} scale={1.0} x={180} y={300} tilt={-1.2} marks={[{ x: 1028, y: 126, w: 330, h: 52, at: at("five and a half") }, { x: 28, y: 183, w: 925, h: 52, at: at("at five percent") }]} />
  </>) },
  { at: "To check it", face: "prompt", sfx: "whoosh", r: ({ lf, dur, at }) => (<>
    <T y={170} size={80} style={rise(lf)}>Need: an <K>independent scorekeeper</K></T>
    <Shot lf={lf} dur={dur} src="bc01/aa-head.png" w={1440} h={400} scale={0.95} x={220} y={330} d={at("Artificial Analysis runs")} />
  </>) },
  // 7. Independent check
  { at: "On its Intelligence Index", face: "prompt", sfx: "pop", r: ({ lf, at }) => (<>
    <Source text={AA} />
    <T y={120} size={56} color={DIM} style={rise(lf)}>Intelligence Index</T>
    <Bar lf={lf} d={at("Claude Fable")} label="Claude Fable 5.2" value={65} max={65} x={140} y={240} color={INK} />
    <Bar lf={lf} d={at("GPT-6.2 Astra scores")} label="GPT-6.2 Astra" value={62} max={65} x={140} y={440} color={LIME} />
    <Bar lf={lf} d={at("Sol scores")} label="GPT-6.2 Sol" value={57} max={65} x={140} y={640} color={LIME} />
  </>) },
  { at: "So overall Claude is still", face: "meh", sfx: "pop", r: ({ lf, dur, at }) => {
    const sw = at("Astra wins");
    if (lf < sw) return (<>
      <Source text={AA} />
      <Shot lf={lf} dur={dur} src="bc01/aa-intel.png" w={910} h={827} scale={0.92} x={480} y={70} rings={[{ x: 82, y: 300, w: 64, h: 380, at: 4 }]} />
    </>);
    return (<>
      <Source text="R&D World, Nov 17 2026" />
      <Shot lf={lf - sw} dur={dur} src="bc01/n-rd.png" w={1680} h={420} scale={0.9} x={170} y={120} />
      <T x={170} y={640} size={56} style={rise(lf, sw)}>OpenAI's test: <K>Astra ✓</K></T>
      <T x={170} y={730} size={56} style={rise(lf, at("not the whole"))}>Whole report card: <K>Claude ✓</K></T>
    </>);
  } },
  { at: "Now look at cost per task", face: "prompt", sfx: "whoosh", r: ({ lf, dur }) => (<>
    <Source text={AA} />
    <Shot lf={lf} dur={dur} src="bc01/aa-cost.png" w={910} h={827} scale={0.92} x={480} y={70} />
  </>) },
  { at: "Sol about a dollar", face: "prompt", r: ({ lf, at }) => (<>
    <Source text={AA} />
    <T y={120} size={56} color={DIM} style={rise(lf)}>Cost per task</T>
    <Bar lf={lf} d={0} label="GPT-6.2 Sol" value={1.01} max={26.54} x={140} y={240} color={LIME} fmt={(v) => `$${v.toFixed(2)}`} len={1100} />
    <Bar lf={lf} d={at("Astra four dollars")} label="GPT-6.2 Astra" value={4.0} max={26.54} x={140} y={440} color={LIME} fmt={(v) => `$${v.toFixed(2)}`} len={1100} />
    <Bar lf={lf} d={at("Fable 5.2 twenty")} label="Claude Fable 5.2" value={26.54} max={26.54} x={140} y={640} color={RED} fmt={(v) => `$${v.toFixed(2)}`} len={1100} />
  </>) },
  { at: "So here Astra costs about fifteen", face: "happy", sfx: "pop", r: ({ lf, at }) => {
    const sw = at("But still");
    if (lf >= sw) return (<>
      <Source text="Tech Times, Nov 18 2026" />
      <Shot lf={lf - sw} dur={60} src="bc01/n-tt.png" w={2600} h={330} scale={0.6} x={140} y={200} />
      <Stamp lf={lf} d={at("That part is real")} text="REAL" x={1150} y={560} rot={-8} size={120} />
    </>);
    const strike = interpolate(lf - at("Not five"), [0, 6], [0, 1], clamp);
    return (<>
      <T y={160} size={300} center style={pop(lf, at("fifteen percent"), 0.5)}><K>15%</K></T>
      <T y={500} size={60} center style={rise(lf, at("fifteen percent"))}>of Claude's cost, here</T>
      <div style={{ position: "absolute", left: 0, right: 0, top: 610, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 90, color: DIM, opacity: interpolate(lf - at("Not five"), [0, 3], [0, 1], clamp) }}>
        <span style={{ position: "relative" }}>not 5%<span style={{ position: "absolute", left: -10, top: "52%", height: 10, width: `${strike * 110}%`, background: RED }} /></span>
      </div>
    </>);
  } },
  { at: "Artificial Analysis also flags", noHost: true, sfx: "blip", r: ({ lf, dur, at }) => {
    const sw = at("likes to talk");
    if (lf < sw) return (<>
      <Source text={AA} />
      <Shot lf={lf} dur={dur} src="bc01/p-verbose.png" w={1332} h={122} scale={1.3} x={72} y={380} marks={[{ x: 1168, y: 42, w: 134, h: 36, at: at("verbose") }, { x: 0, y: 82, w: 104, h: 36, at: at("verbose") + 3 }]} />
    </>);
    return (<>
      <T y={200} size={80} style={rise(lf, sw)}>Astra: a bit <K>verbose</K></T>
      {["…and another thing", "also,", "to elaborate…"].map((b, i) => (
        <div key={b} style={{ position: "absolute", left: 300 + i * 240, top: 400 + (i % 2) * 120, fontFamily: "Pretendard", fontWeight: 800, fontSize: 38, color: BG, background: INK, borderRadius: 24, padding: "12px 24px", ...pop(lf, sw + i * 4) }}>{b}</div>
      ))}
      <Blip lf={lf} d={at("Blip respects")} face="happy" x={1250} y={300} size={500} />
    </>);
  } },
  // 8. Which one
  { at: "So which one should you use", face: "prompt", sfx: "whoosh", r: ({ lf }) => <T y={380} size={130} center style={pop(lf)}>Which one <K>should you use?</K></T> },
  { at: "Start with Sol", face: "happy", sfx: "pop", r: ({ lf, at }) => (<>
    <T y={150} size={90} color={LIME} style={rise(lf)}>Start with Sol</T>
    {[["Chat", "Chat & quick answers"], ["everyday coding", "Everyday coding"], ["drafts", "Drafts & emails"]].map(([k, t], i) => (
      <T key={t} y={320 + i * 120} size={64} style={rise(lf, at(k))}><K>›</K> {t}</T>
    ))}
    <T y={720} size={46} color={DIM} style={rise(lf, at("basically tied"))}>cheaper · basically tied on coding</T>
  </>) },
  { at: "Switch to Astra when", face: "prompt", sfx: "pop", r: ({ lf, at }) => (<>
    <T y={150} size={90} style={rise(lf)}>Switch to Astra</T>
    <T y={260} size={48} color={DIM} style={rise(lf, at("the output is the job"))}>when the output IS the job</T>
    {[["slide deck", "Slide decks"], ["spreadsheet", "Spreadsheets"], ["legal or finance", "Legal / finance docs"]].map(([k, t], i) => (
      <T key={t} y={380 + i * 120} size={64} style={rise(lf, at(k))}><K>›</K> {t}</T>
    ))}
  </>) },
  { at: "And if Claude already", face: "happy", r: ({ lf, at }) => (<>
    <T y={220} size={70} style={rise(lf)}>Already happy with Claude?</T>
    <T y={360} size={110} color={LIME} style={pop(lf, at("test both"))}>Test both on your own tasks.</T>
  </>) },
  // 9. Verdict
  { at: "Blip's verdict on", face: "prompt", sfx: "whoosh", r: ({ lf }) => (<>
    <T y={200} size={56} color={DIM} style={rise(lf)}>The claim:</T>
    <T y={280} size={90} style={rise(lf, 4)}>"Beats Claude at 5% of the cost"</T>
  </>) },
  { at: "Cheaper Real Beats Claude", face: "meh", r: ({ lf, at }) => {
    const needle = interpolate(lf - at("On one test"), [0, 14], [0.92, 0.55], { ...clamp, easing: outExpo });
    return (<>
      <div style={{ position: "absolute", left: 160, top: 220, width: 1600 }}>
        <div style={{ height: 34, borderRadius: 17, background: `linear-gradient(90deg,${RED},#FFC93A,${LIME})` }} />
        <div style={{ position: "absolute", left: `${needle * 100}%`, top: -50, translate: "-28px 0", width: 0, height: 0, borderLeft: "28px solid transparent", borderRight: "28px solid transparent", borderTop: `44px solid ${INK}` }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: INK, marginTop: 14 }}><span>HYPE</span><span>REAL</span></div>
      </div>
      <T y={430} size={72} style={rise(lf)}>Cheaper? <K>Real.</K></T>
      <T y={540} size={72} style={rise(lf, at("Beats Claude"))}>Beats Claude? <K c="#FFC93A">One test, not the index.</K></T>
      <Shot lf={lf} dur={120} src="bc01/n-dc.png" w={1320} h={640} scale={0.34} x={1000} y={650} tilt={-3} d={at("independent index")} />
      <div style={{ position: "absolute", left: 1010, top: 620, fontFamily: "Pretendard", fontWeight: 700, fontSize: 22, color: DIM, ...rise(lf, at("independent index")) }}>Decrypt, Nov 17 2026</div>
    </>);
  } },
  { at: "Half true", face: "shock", sfx: "stamp", vol: 1, r: ({ lf }) => <Stamp lf={lf} text="HALF TRUE" x={430} y={330} rot={-6} size={220} color="#FFC93A" /> },
  { at: "Use Sol keep your wallet", noHost: true, sfx: "pop", r: ({ lf, at }) => (<>
    <T y={200} size={84} style={rise(lf)}>Use <K>Sol</K>.</T>
    <T y={310} size={84} style={rise(lf, at("keep your wallet"))}>Keep your wallet.</T>
    <T y={420} size={56} color={DIM} w={1000} style={rise(lf, at("save Astra"))}>Save Astra for the deck your boss will actually read.</T>
    <Blip lf={lf} face="happy" x={1250} y={250} size={540} />
  </>) },
  // 10. Outro
  { at: "Got a question", noHost: true, sfx: "pop", r: ({ lf, at }) => (<>
    <div style={{ position: "absolute", left: 160, top: 260, width: 1000, borderRadius: 30, background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.2)", padding: 40, ...pop(lf) }}>
      <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 34, color: DIM }}>Comments</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 50, color: INK, marginTop: 20 }}>"Can Blip check ___ next?"</div>
      <div style={{ fontFamily: "Pretendard", fontWeight: 800, fontSize: 50, color: LIME, marginTop: 20, ...rise(lf, at("Drop it")) }}>Drop it below 👇</div>
    </div>
    <Blip lf={lf} face="front" x={1250} y={250} size={540} />
  </>) },
  { at: "Follow Blip and see you", noHost: true, sfx: "ding", r: ({ lf }) => (<>
    <Blip lf={lf} face="prompt" x={680} y={90} size={560} />
    <T y={650} size={120} center style={pop(lf, 6)}>BLIP CHECK <K>&gt;_</K></T>
    <T y={800} size={46} color={DIM} center style={rise(lf, 12)}>Follow for the next check</T>
  </>) },
];

// Resolve beat start frames.
const STARTS: number[] = [];
{
  let after = 0;
  for (const b of B) {
    const t = timeOf(b.at, after);
    STARTS.push(f(t));
    after = t + 0.01;
  }
}

// ---------- captions ----------
type Chunk = { text: string; start: number; end: number };
// Caption chunks come from the script text (keeps punctuation like "GPT-6.2"),
// timed by aligning each script token to the narration words.
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let p = 0;
  for (const line of (LINES as { text: string }[]).map((l) => l.text)) {
    let cur: { t: string; s: number; e: number }[] = [];
    const flush = () => {
      if (cur.length) out.push({ text: cur.map((x) => x.t).join(" "), start: f(cur[0].s), end: f(cur[cur.length - 1].e) });
      cur = [];
    };
    for (const tok of line.split(/\s+/)) {
      const n = norm(tok);
      if (!n) continue;
      const at = BIG.indexOf(n, p);
      if (at < 0) continue;
      p = at + n.length;
      cur.push({ t: tok, s: WORDS[OWNER[at]].start, e: WORDS[OWNER[p - 1]].end });
      const len = cur.map((x) => x.t).join(" ").length;
      if (/[.,?!:;]$/.test(tok) || cur.length >= 5 || len > 24) flush();
    }
    flush();
  }
  return out;
})();

const Captions: React.FC = () => {
  const fr = useCurrentFrame();
  const c = CHUNKS.find((x, i) => fr >= x.start && fr < (CHUNKS[i + 1]?.start ?? x.end + 20));
  if (!c) return null;
  const lf = fr - c.start;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, bottom: 46, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: "Pretendard", fontWeight: 900, fontSize: 58, letterSpacing: -1, color: INK, background: "rgba(10,11,13,0.72)", padding: "8px 26px", borderRadius: 14, opacity: interpolate(lf, [0, 2], [0, 1], clamp), translate: `0px ${interpolate(lf, [0, 5], [14, 0], { ...clamp, easing: outExpo })}px` }}>
        {c.text}
      </span>
    </div>
  );
};

const Backdrop: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(55% 70% at ${50 + Math.sin(fr / 200) * 8}% 40%, rgba(120,165,20,0.24) 0%, ${BG} 70%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "60px 60px", backgroundPosition: `0px ${-fr * 0.3}px` }} />
    </>
  );
};


// Presenter Blip: bottom-right, face per beat, "talks" while narration words play.
const Host: React.FC = () => {
  const fr = useCurrentFrame();
  let i = 0;
  while (i + 1 < STARTS.length && fr >= STARTS[i + 1]) i++;
  const beat = B[i];
  if (beat.noHost) return null;
  // entrance when coming back after a hidden beat
  let first = i;
  while (first > 0 && !B[first - 1].noHost) first--;
  const lf = fr - STARTS[first];
  const t = fr / FPS;
  const talking = WORDS.some((w) => t >= w.start && t <= w.end);
  const sq = talking ? Math.sin(fr / 2.2) * 0.035 : 0;
  const sinceCut = fr - STARTS[i];
  const hop = interpolate(sinceCut, [0, 4, 9], [0, -18, 0], clamp);
  // walk in from the right edge: slide + little footsteps + lean
  const walk = interpolate(lf, [0, 22], [1, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  const step = walk > 0.01 ? -Math.abs(Math.sin(lf / 2.4)) * 16 : 0;
  return (
    <div style={{ position: "absolute", left: 1580 + walk * 400, top: 640 + hop + step + Math.sin(fr / 11) * 4, width: 340, height: 340, rotate: `${walk * -6}deg`, transformOrigin: "50% 90%" }}>
      <Img src={staticFile(`bc01/blip/${beat.face ?? "prompt"}.png`)} style={{ width: 340, height: 340, transform: `scaleY(${1 + sq}) scaleX(${1 - sq / 2})`, transformOrigin: "50% 75%" }} />
    </div>
  );
};

const BeatView: React.FC<{ i: number }> = ({ i }) => {
  const lf = useCurrentFrame();
  const start = STARTS[i];
  const dur = (STARTS[i + 1] ?? BC01_DURATION) - start;
  const startS = start / FPS;
  const at = (p: string) => f(timeOf(p, startS - 0.05)) - start;
  return <AbsoluteFill>{B[i].r({ lf, dur, at })}</AbsoluteFill>;
};

export const Bc01Full: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Backdrop />
      {B.map((b, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={(STARTS[i + 1] ?? BC01_DURATION) - STARTS[i]} layout="none">
          <BeatView i={i} />
        </Sequence>
      ))}
      {B.map((b, i) =>
        b.sfx ? (
          <Sequence key={`s${i}`} from={STARTS[i]} durationInFrames={30} layout="none">
            <Html5Audio src={staticFile(`sfx/${b.sfx}.wav`)} volume={b.vol ?? 0.35} />
          </Sequence>
        ) : null,
      )}
      <Html5Audio src={staticFile("bc01/narration.mp3")} />
      <Host />
      <Captions />
      <div style={{ position: "absolute", right: 40, top: 30, fontFamily: "Pretendard", fontWeight: 900, fontSize: 24, color: BG, background: LIME, padding: "5px 12px", borderRadius: 8 }}>BLIP CHECK &gt;_</div>
    </AbsoluteFill>
  );
};
