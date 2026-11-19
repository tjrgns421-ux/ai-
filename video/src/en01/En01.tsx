import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../StyleFrames";
import { Atmosphere, C, Dust, Grain, Peupeu, SceneWrap, Sfx, Vignette, clamp, glass, jumpPose, outExpo } from "../ep01/Opening";
import { Line, NarrationCaptions, Word, buildTimeline } from "../lib/narration";
import words from "../../public/en01/narration.words.json";
import real from "./realRun.json";

// en01 — Blip's 1-Minute Basics #1: Claude Code vs the chat window.
// Facts kept to what is documented: Claude Code reads/edits files and runs
// commands in a project, asks for permission by default, and runs in the
// terminal, IDE extensions, the desktop app and on the web. The example
// (login bug) is a REAL run recorded in this Claude Code session: realRun.json
// holds the actual failing test, the diff and the passing test output
// (sources in shorts/en01-claude-code-vs-chat/real-run/).

const LINES: Line[] = [
  { scene: "hook", chunks: [{ text: "Stop copy-pasting", color: C.red }, { text: "code into Claude." }] },
  { scene: "hook", chunks: [{ text: "There's a version" }, { text: "that edits your files itself.", color: C.lime }] },
  { scene: "hook", chunks: [{ text: "Here's the difference," }, { text: "in one minute.", color: C.lime }] },
  { scene: "chat", chunks: [{ text: "In chat," }, { text: "you copy your code in," }, { text: "Claude answers," }, { text: "and you paste it back." }, { text: "You're the hands.", color: C.red }] },
  { scene: "code", chunks: [{ text: "Claude Code works" }, { text: "inside your project folder.", color: C.lime }] },
  { scene: "code", chunks: [{ text: "It reads your files," }, { text: "edits them," }, { text: "and runs commands itself.", color: C.lime }] },
  { scene: "example", chunks: [{ text: "Say:" }, { text: "fix the bug" }, { text: "on the login page." }] },
  { scene: "example", chunks: [{ text: "It finds the file," }, { text: "makes the change," }, { text: "and can run the tests" }, { text: "to check it." }] },
  { scene: "example", chunks: [{ text: "By default," }, { text: "it asks before" }, { text: "it edits files" }, { text: "or runs commands," }, { text: "so you stay in control.", color: C.lime }] },
  { scene: "which", chunks: [{ text: "So which one," }, { text: "when?" }] },
  { scene: "which", chunks: [{ text: "A quick question," }, { text: "or a first draft?" }, { text: "Chat.", color: C.lime }] },
  { scene: "which", chunks: [{ text: "Anything that lives in files," }, { text: "like a website," }, { text: "a script," }, { text: "or a whole project?" }, { text: "Claude Code.", color: C.lime }] },
  { scene: "where", chunks: [{ text: "You can run it" }, { text: "in your terminal," }, { text: "your code editor," }, { text: "the desktop app," }, { text: "or on the web." }] },
  { scene: "next", chunks: [{ text: "Next minute:" }, { text: "installing it" }, { text: "and giving it your first job.", color: C.lime }] },
  { scene: "next", chunks: [{ text: "Follow Blip," }, { text: "so you don't miss it.", color: C.lime }] },
];

const TL = buildTimeline(LINES, words as Word[]);
const L = TL.lines;
export const EN01_DURATION = TL.end + 40;

const S = {
  hook: [0, L[3].start],
  chat: [L[3].start, L[4].start],
  code: [L[4].start, L[6].start],
  example: [L[6].start, L[9].start],
  which: [L[9].start, L[12].start],
  where: [L[12].start, L[13].start],
  next: [L[13].start, EN01_DURATION],
} as const;
type Sc = readonly [number, number];
const at = (line: number, chunk: number, sc: Sc) => L[line].tchunks[chunk].start - sc[0];
const lime = (a: number) => `rgba(215,255,58,${a})`;
const pop = (f: number, fps: number, d = 0, cfg: { damping: number; stiffness: number; mass?: number } = { damping: 13, stiffness: 170 }) => spring({ frame: f - d, fps, config: cfg });
const MONO = "'DejaVu Sans Mono', monospace";

const Label: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", top: 120, right: 70, fontFamily: "Pretendard", fontWeight: 700, fontSize: 26, letterSpacing: 2, color: "rgba(255,255,255,0.55)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 99, padding: "6px 16px" }}>{text}</div>
);

// ---------- hook: stop copy-pasting ----------

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.hook;
  const stopAt = at(0, 1, sc) + 6;
  const verAt = at(1, 0, sc);
  const badgeAt = at(2, 0, sc);
  const stop = pop(f, fps, stopAt, { damping: 10, stiffness: 240, mass: 0.6 });
  const ver = pop(f, fps, verAt, { damping: 13, stiffness: 170 });
  const badge = pop(f, fps, badgeAt, { damping: 12, stiffness: 180 });
  const pp = pop(f, fps, 2, { damping: 11, stiffness: 170 });
  const k = f - stopAt;
  const shake = k >= 0 && k < 10 ? (1 - k / 10) * 24 : 0;
  const ring = interpolate(f - badgeAt, [0, 30], [0, 1], clamp);
  const pingFrac = (f % 14) / 14;
  const pingDir = Math.floor(f / 14) % 2 === 0;
  const fade1 = interpolate(f, [verAt - 4, verAt + 4], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ translate: `${(Math.sin(f * 7.3) * shake).toFixed(1)}px ${(Math.cos(f * 5.1) * shake).toFixed(1)}px` }}>
      <Atmosphere tint="rgba(70,95,140,0.5)" tint2="rgba(40,50,80,0.5)" />
      <AbsoluteFill style={{ opacity: interpolate(k, [0, 4], [0, 1], clamp) * fade1 }}>
        <Atmosphere tint="rgba(190,30,25,0.55)" tint2="rgba(110,10,10,0.5)" />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: interpolate(f, [verAt, verAt + 8], [0, 1], clamp) }}>
        <Atmosphere tint="rgba(120,165,20,0.45)" tint2="rgba(40,70,10,0.5)" />
      </AbsoluteFill>
      {/* copy-paste ping-pong */}
      <div style={{ opacity: fade1 }}>
        <div style={{ position: "absolute", left: 80, top: 330, width: 400, height: 260, borderRadius: 24, background: "#14151a", border: "2px solid #2c2d33", padding: 22 }}>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 26, color: "rgba(255,255,255,0.5)" }}>your file</div>
          {["function login(u) {", "  if (u.pw = input)", "}"].map((l, i) => (
            <div key={i} style={{ fontFamily: MONO, fontSize: 26, color: "rgba(255,255,255,0.8)", whiteSpace: "pre", marginTop: 8 }}>{l}</div>
          ))}
        </div>
        <div style={{ position: "absolute", right: 80, top: 330, width: 400, height: 260, borderRadius: 24, ...glass, padding: 22 }}>
          <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 26, color: "rgba(255,255,255,0.5)" }}>Claude chat</div>
          {[0.8, 0.55, 0.7].map((w, i) => (
            <div key={i} style={{ height: 18, borderRadius: 9, background: "rgba(255,255,255,0.3)", marginTop: 22, width: `${w * 100}%` }} />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            top: 430,
            left: interpolate(pingDir ? pingFrac : 1 - pingFrac, [0, 1], [360, 620]),
            width: 100,
            height: 64,
            borderRadius: 14,
            background: C.lime,
            color: "#111",
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 30px ${lime(0.6)}`,
          }}
        >
          {pingDir ? "⌘C" : "⌘V"}
        </div>
        {f >= stopAt && (
          <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: interpolate(k, [0, 2], [0, 1], clamp), scale: String(interpolate(stop, [0, 1], [2.6, 1])), rotate: "-10deg" }}>
            <div style={{ border: `14px solid ${C.red}`, color: C.red, borderRadius: 26, padding: "6px 46px 12px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 190, lineHeight: 1.05, background: "rgba(255,59,48,0.08)", boxShadow: "0 0 90px rgba(255,59,48,0.45)" }}>STOP</div>
          </div>
        )}
      </div>
      {/* the version that edits files */}
      {f >= verAt && (
        <div style={{ position: "absolute", left: 90, top: 300, width: 900, opacity: interpolate(ver, [0, 0.3], [0, 1], clamp) * interpolate(f, [badgeAt - 4, badgeAt + 4], [1, 0], clamp), scale: String(interpolate(ver, [0, 1], [0.7, 1])) }}>
          <div style={{ borderRadius: 30, background: "#101114", border: `3px solid ${lime(0.8)}`, boxShadow: `0 0 80px ${lime(0.35)}`, padding: "34px 40px", fontFamily: MONO, color: C.white }}>
            <div style={{ fontSize: 40, color: C.lime, fontWeight: 700 }}>&gt;_ Claude Code</div>
            <div style={{ fontSize: 32, marginTop: 18, color: "rgba(255,255,255,0.8)" }}>✎ edits src/login.js</div>
            <div style={{ fontSize: 32, marginTop: 8, color: "rgba(255,255,255,0.8)" }}>▶ runs npm test</div>
          </div>
        </div>
      )}
      {/* series badge + 60s ring */}
      {f >= badgeAt && (
        <div style={{ position: "absolute", top: 300, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: interpolate(badge, [0, 0.3], [0, 1], clamp), scale: String(interpolate(badge, [0, 1], [0.6, 1])) }}>
          <div style={{ position: "relative", width: 300, height: 300 }}>
            <svg width={300} height={300} style={{ position: "absolute", inset: 0 }}>
              <circle cx={150} cy={150} r={130} stroke="rgba(255,255,255,0.15)" strokeWidth={16} fill="none" />
              <circle cx={150} cy={150} r={130} stroke={C.lime} strokeWidth={16} fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 130} strokeDashoffset={2 * Math.PI * 130 * (1 - ring)} transform="rotate(-90 150 150)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 110, color: C.white }}>60s</div>
          </div>
          <div style={{ marginTop: 30, fontFamily: "Pretendard", fontWeight: 900, fontSize: 58, color: "#111", background: C.lime, borderRadius: 22, padding: "12px 34px" }}>Blip's 1-Minute Basics</div>
          <div style={{ marginTop: 14, fontFamily: "Pretendard", fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.6)" }}>#1 · Claude Code vs chat</div>
        </div>
      )}
      <Peupeu
        left={250}
        top={800}
        w={580}
        h={520}
        appear={pp}
        pose={{
          face: f < stopAt ? "meh" : f < verAt ? "shock" : "happy",
          sweat: f >= stopAt && f < verAt ? interpolate(k, [4, 10], [0, 1], clamp) : 0,
          wave: f >= verAt ? 1.2 + 0.5 * Math.sin(f * 0.55) : 0.5,
          leftLift: f >= stopAt && f < verAt ? 1 : 0,
          rotY: -0.2,
          scale: 1.1,
        }}
      />
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} at={2 + i * 14} src="key" volume={0.35} />
      ))}
      <Sfx at={stopAt} src="stamp" volume={1} />
      <Sfx at={verAt} src="ding" volume={0.55} />
      <Sfx at={badgeAt} src="whoosh" volume={0.45} />
      <Sfx at={badgeAt + 4} src="pop" volume={0.45} />
    </AbsoluteFill>
  );
};

// ---------- chat: you are the hands ----------

const Chat: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.chat;
  const copyAt = at(3, 1, sc);
  const ansAt = at(3, 2, sc);
  const pasteAt = at(3, 3, sc);
  const handsAt = at(3, 4, sc);
  const u = pop(f, fps, copyAt, { damping: 14, stiffness: 180 });
  const a = pop(f, fps, ansAt, { damping: 14, stiffness: 180 });
  const back = interpolate(f - pasteAt, [0, 14], [0, 1], { ...clamp, easing: outExpo });
  const hands = pop(f, fps, handsAt, { damping: 9, stiffness: 240, mass: 0.6 });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(90,90,100,0.35)" tint2="rgba(40,40,50,0.4)" />
      <Label text="ILLUSTRATION" />
      <div style={{ position: "absolute", top: 150, left: 90, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: C.white }}>CHAT</div>
      {/* your editor */}
      <div style={{ position: "absolute", left: 90, top: 270, width: 420, height: 300, borderRadius: 24, background: "#14151a", border: "2px solid #2c2d33", padding: 26 }}>
        <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 26, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>your file</div>
        {["function login(u) {", "  if (u.pw = input)", "    return ok", "}"].map((l, i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: 26, color: i === 1 ? "#FFB3AD" : "rgba(255,255,255,0.8)", whiteSpace: "pre" }}>{l}</div>
        ))}
      </div>
      {/* chat window */}
      <div style={{ position: "absolute", right: 90, top: 270, width: 420, height: 620, borderRadius: 24, ...glass, padding: 24 }}>
        <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 26, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Claude</div>
        <div style={{ marginLeft: 60, background: C.lime, color: "#111", borderRadius: "22px 22px 6px 22px", padding: "14px 18px", fontFamily: MONO, fontSize: 22, opacity: interpolate(u, [0, 0.3], [0, 1], clamp), translate: `${interpolate(u, [0, 1], [-200, 0])}px 0px` }}>
          function login(u) …<br />why is it broken?
        </div>
        <div style={{ marginTop: 22, marginRight: 40, background: "rgba(255,255,255,0.12)", color: C.white, borderRadius: "22px 22px 22px 6px", padding: "14px 18px", fontFamily: "Pretendard", fontWeight: 700, fontSize: 26, opacity: interpolate(a, [0, 0.3], [0, 1], clamp) }}>
          Use === here:
          <div style={{ fontFamily: MONO, fontSize: 22, color: C.lime, marginTop: 6 }}>if (u.pw === input)</div>
        </div>
      </div>
      {/* copy / paste arrows */}
      <div style={{ position: "absolute", left: 520, top: 360, width: 60, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 60, color: C.white, opacity: interpolate(u, [0, 0.3], [0, 1], clamp) }}>→</div>
      {f >= pasteAt && (
        <div style={{ position: "absolute", left: 520, top: 520, width: 60, textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 60, color: C.lime, opacity: back }}>←</div>
      )}
      <div style={{ position: "absolute", left: 90, top: 600, width: 420, display: "flex", gap: 14, opacity: interpolate(f, [copyAt, copyAt + 6], [0, 1], clamp) }}>
        {["COPY", "PASTE"].map((t, i) => (
          <div key={t} style={{ ...glass, borderRadius: 999, padding: "10px 24px", fontFamily: "Pretendard", fontWeight: 900, fontSize: 30, color: i === 1 && f >= pasteAt ? C.lime : C.white }}>{t}</div>
        ))}
      </div>
      {f >= handsAt && (
        <div style={{ position: "absolute", left: 90, top: 720, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: "#fff", background: C.red, borderRadius: 26, padding: "16px 34px", rotate: "-4deg", scale: String(interpolate(hands, [0, 1], [1.8, 1])), boxShadow: "0 20px 50px rgba(255,59,48,0.5)" }}>
          you = the hands
        </div>
      )}
      <Sfx at={copyAt} src="pop" volume={0.45} />
      <Sfx at={ansAt} src="pop" volume={0.4} />
      <Sfx at={pasteAt} src="whoosh" volume={0.4} />
      <Sfx at={handsAt} src="stamp" volume={0.6} />
    </AbsoluteFill>
  );
};

// ---------- Claude Code: inside the project ----------

const TREE = [
  { n: "my-app/", d: 0 },
  { n: "src/", d: 1 },
  { n: "login.js", d: 2 },
  { n: "api.js", d: 2 },
  { n: "tests/", d: 1 },
  { n: "login.test.js", d: 2 },
  { n: "package.json", d: 1 },
];

const Code: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.code;
  const readAt = at(5, 0, sc);
  const editAt = at(5, 1, sc);
  const runAt = at(5, 2, sc);
  const p = pop(f, fps, 1, { damping: 14, stiffness: 150 });
  const scan = Math.floor(interpolate(f - readAt, [0, 20], [0, TREE.length - 1], clamp));
  const tag = (t: number) => pop(f, fps, t, { damping: 10, stiffness: 240 });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,165,20,0.42)" tint2="rgba(40,70,10,0.45)" />
      <div style={{ position: "absolute", top: 150, left: 90, fontFamily: "Pretendard", fontWeight: 900, fontSize: 64, color: C.lime }}>CLAUDE CODE</div>
      <div style={{ position: "absolute", left: 90, top: 270, width: 900, borderRadius: 30, background: "#14151a", border: `2px solid ${lime(0.5)}`, boxShadow: `0 0 60px ${lime(0.2)}`, padding: "30px 36px", opacity: interpolate(p, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(p, [0, 1], [100, 0])}px` }}>
        {TREE.map((t, i) => {
          const on = f >= readAt && i <= scan;
          return (
            <div key={t.n} style={{ fontFamily: MONO, fontSize: 40, lineHeight: 1.6, paddingLeft: t.d * 46, color: on ? C.white : "rgba(255,255,255,0.4)", background: f >= readAt && i === scan ? lime(0.15) : "transparent", borderRadius: 10 }}>
              {t.n.endsWith("/") ? "▸ " : "· "}
              {t.n}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 90, top: 870, width: 900, display: "flex", gap: 18, justifyContent: "center" }}>
        {[
          { t: "reads", a: readAt },
          { t: "edits", a: editAt },
          { t: "runs >_", a: runAt },
        ].map((x) => {
          const s = tag(x.a);
          return (
            <div key={x.t} style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 48, color: "#111", background: C.lime, borderRadius: 999, padding: "14px 34px", scale: String(s), opacity: s > 0.02 ? 1 : 0 }}>
              {x.t}
            </div>
          );
        })}
      </div>
      <Sfx at={1} src="whoosh" volume={0.35} />
      <Sfx at={readAt} src="pop" volume={0.4} />
      <Sfx at={editAt} src="pop" volume={0.4} />
      <Sfx at={runAt} src="ding" volume={0.5} />
    </AbsoluteFill>
  );
};

// ---------- example (illustration) ----------

const Example: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.example;
  const typeAt = at(6, 1, sc);
  const fileAt = at(7, 0, sc);
  const diffAt = at(7, 1, sc);
  const testAt = at(7, 2, sc);
  const askAt = at(8, 1, sc) + 4;
  const ctrlAt = at(8, 4, sc);
  const prompt = "fix the bug on the login page";
  // real.* = actual outputs recorded in this Claude Code session
  const typed = prompt.slice(0, Math.max(0, Math.floor((f - typeAt) * 1.6)));
  const ask = pop(f, fps, askAt, { damping: 12, stiffness: 190 });
  const yes = interpolate(f - ctrlAt, [0, 6], [0, 1], clamp);
  const pp = pop(f, fps, ctrlAt - 6, { damping: 11, stiffness: 170 });
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,165,20,0.4)" tint2="rgba(40,70,10,0.45)" />
      <Label text="REAL RUN · this session" />
      {/* terminal: real outputs from this session */}
      <div style={{ position: "absolute", left: 60, top: 210, width: 960, borderRadius: 28, background: "#101114", border: "2px solid #2c2d33", boxShadow: "0 50px 120px rgba(0,0,0,0.6)", padding: "28px 32px", fontFamily: MONO, fontSize: 30, color: C.white, lineHeight: 1.45 }}>
        <div>
          <span style={{ color: C.lime }}>&gt;</span> {typed}
          <span style={{ opacity: f % 14 < 8 && typed.length < prompt.length ? 1 : 0 }}>▍</span>
        </div>
        {f >= fileAt && (
          <div style={{ marginTop: 14, opacity: interpolate(f - fileAt, [0, 4], [0, 1], clamp) }}>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>$ npm test</div>
            <div style={{ color: "#FFB3AD" }}>{real.run1[1]}</div>
            <div style={{ color: "rgba(255,255,255,0.55)", paddingLeft: 30 }}>{real.run1detail.join("  ")}</div>
          </div>
        )}
        {f >= diffAt && (
          <div style={{ marginTop: 14, borderRadius: 12, overflow: "hidden", opacity: interpolate(f - diffAt, [0, 4], [0, 1], clamp) }}>
            <div style={{ color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>src/login.js</div>
            <div style={{ background: "rgba(255,59,48,0.18)", color: "#FFB3AD", padding: "4px 12px", whiteSpace: "pre" }}>{real.diff[0]}</div>
            <div style={{ background: lime(0.16), color: C.lime, padding: "4px 12px", whiteSpace: "pre" }}>{real.diff[1]}</div>
          </div>
        )}
        {f >= testAt && (
          <div style={{ marginTop: 14, opacity: interpolate(f - testAt, [0, 6], [0, 1], clamp) }}>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>$ npm test</div>
            <div style={{ color: C.lime }}>{real.run2[1]}</div>
            <div style={{ color: C.lime, fontWeight: 700 }}>{real.run2[2]}  {real.run2[3]}</div>
          </div>
        )}
      </div>
      {/* permission prompt */}
      {f >= askAt && (
        <div style={{ position: "absolute", left: 120, top: 760, width: 840, borderRadius: 28, ...glass, border: `2px solid ${lime(0.6)}`, padding: "30px 36px", opacity: interpolate(ask, [0, 0.3], [0, 1], clamp), scale: String(interpolate(ask, [0, 1], [0.7, 1])) }}>
          <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 44, color: C.white }}>Allow edit to src/login.js?</div>
          <div style={{ display: "flex", gap: 18, marginTop: 22 }}>
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: "#111", background: C.lime, borderRadius: 18, padding: "10px 34px", scale: String(1 + yes * 0.08), boxShadow: `0 0 ${yes * 40}px ${lime(0.6)}` }}>Yes</div>
            <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 40, color: C.white, border: "2px solid rgba(255,255,255,0.3)", borderRadius: 18, padding: "10px 34px" }}>No</div>
          </div>
        </div>
      )}
      {f >= ctrlAt - 6 && <Peupeu left={600} top={1000} w={440} h={400} appear={pp} pose={{ face: "happy", wave: 1.15 + 0.5 * Math.sin(f * 0.55), rotY: -0.45, scale: 0.95 }} />}
      {new Array(8).fill(0).map((_, i) => (
        <Sfx key={i} at={typeAt + i * 3} src="key" volume={0.3} />
      ))}
      <Sfx at={diffAt} src="pop" volume={0.45} />
      <Sfx at={testAt} src="ding" volume={0.5} />
      <Sfx at={askAt} src="blip" volume={0.45} />
      <Sfx at={ctrlAt} src="pop" volume={0.5} />
    </AbsoluteFill>
  );
};

// ---------- which one when ----------

const Which: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.which;
  const chatAt = at(10, 0, sc);
  const chatWin = at(10, 2, sc);
  const codeAt = at(11, 0, sc);
  const codeWin = at(11, 4, sc);
  const card = (d: number) => pop(f, fps, d, { damping: 13, stiffness: 170 });
  const Card: React.FC<{ title: string; items: string[]; d: number; win: number; top: number }> = ({ title, items, d, win, top }) => {
    const p = card(d);
    const w = interpolate(f - win, [0, 6], [0, 1], clamp);
    return (
      <div style={{ position: "absolute", left: 90, top, width: 900, borderRadius: 30, ...glass, border: `3px solid ${lime(0.2 + w * 0.7)}`, boxShadow: `0 0 ${w * 60}px ${lime(w * 0.35)}`, padding: "30px 38px", opacity: interpolate(p, [0, 0.3], [0, 1], clamp), translate: `${interpolate(p, [0, 1], [160, 0])}px 0px` }}>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 56, color: w > 0.5 ? C.lime : C.white }}>{title}</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
          {items.map((it) => (
            <div key={it} style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 36, color: C.white, background: "rgba(255,255,255,0.1)", borderRadius: 999, padding: "8px 22px" }}>{it}</div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(70,95,140,0.42)" tint2="rgba(40,50,80,0.45)" />
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 90, color: C.white, opacity: interpolate(f, [1, 6], [0, 1], clamp) }}>Which one, when?</div>
      <Card title="Chat" items={["quick question", "first draft"]} d={chatAt} win={chatWin} top={380} />
      <Card title="Claude Code" items={["website", "script", "whole project"]} d={codeAt} win={codeWin} top={720} />
      <Sfx at={1} src="whoosh" volume={0.35} />
      <Sfx at={chatAt} src="pop" volume={0.4} />
      <Sfx at={chatWin} src="ding" volume={0.45} />
      <Sfx at={codeAt} src="pop" volume={0.4} />
      <Sfx at={codeWin} src="ding" volume={0.55} />
    </AbsoluteFill>
  );
};

// ---------- where it runs ----------

const WHERE = [
  { t: "Terminal", icon: ">_" },
  { t: "Code editor", icon: "{ }" },
  { t: "Desktop app", icon: "▢" },
  { t: "Web", icon: "◎" },
];

const Where: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.where;
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,165,20,0.4)" tint2="rgba(40,70,10,0.45)" />
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", fontFamily: "Pretendard", fontWeight: 900, fontSize: 80, color: C.white, opacity: interpolate(f, [1, 6], [0, 1], clamp) }}>Run it anywhere</div>
      <div style={{ position: "absolute", left: 90, top: 340, width: 900, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
        {WHERE.map((w, i) => {
          const p = pop(f, fps, at(12, i + 1, sc), { damping: 11, stiffness: 210 });
          return (
            <div key={w.t} style={{ height: 320, borderRadius: 34, ...glass, border: `2px solid ${lime(0.4)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, scale: String(p), opacity: p > 0.02 ? 1 : 0 }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 110, color: C.lime }}>{w.icon}</div>
              <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 48, color: C.white }}>{w.t}</div>
            </div>
          );
        })}
      </div>
      {WHERE.map((_, i) => (
        <Sfx key={i} at={at(12, i + 1, sc)} src="pop" volume={0.4} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- next ----------

const Next: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = S.next;
  const followAt = at(14, 0, sc);
  const c = pop(f, fps, 1, { damping: 13, stiffness: 160 });
  const fb = pop(f, fps, followAt, { damping: 10, stiffness: 230 });
  const pp = pop(f, fps, followAt - 4, { damping: 11, stiffness: 170 });
  const j = jumpPose(f - followAt, 0.35);
  return (
    <AbsoluteFill>
      <Atmosphere tint="rgba(120,165,20,0.45)" tint2="rgba(40,70,10,0.5)" />
      <div style={{ position: "absolute", left: 90, top: 300, width: 900, borderRadius: 34, ...glass, border: `2px solid ${lime(0.6)}`, padding: "36px 42px", opacity: interpolate(c, [0, 0.3], [0, 1], clamp), translate: `0px ${interpolate(c, [0, 1], [100, 0])}px` }}>
        <div style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.55)" }}>Next minute · #2</div>
        <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 70, color: C.white, marginTop: 10, lineHeight: 1.1 }}>Install it +<br />give it your first job</div>
      </div>
      {f >= followAt && (
        <div style={{ position: "absolute", top: 720, width: "100%", display: "flex", justifyContent: "center", scale: String(fb), opacity: fb > 0.02 ? 1 : 0 }}>
          <div style={{ fontFamily: "Pretendard", fontWeight: 900, fontSize: 60, color: "#111", background: C.lime, borderRadius: 999, padding: "18px 50px", boxShadow: `0 0 60px ${lime(0.5)}` }}>+ Follow Blip</div>
        </div>
      )}
      {f >= followAt - 4 && <Peupeu left={260} top={860} w={560} h={480} appear={pp} pose={{ face: "happy", wave: 1.2 + 0.5 * Math.sin(f * 0.55), leftLift: j.air ? 1 : 0.3, jump: j.jump, sx: j.sx, sy: j.sy, rotY: -0.25, scale: 1.1 }} />}
      <Sfx at={1} src="whoosh" volume={0.35} />
      <Sfx at={followAt} src="ding" volume={0.6} />
      <Sfx at={followAt + 3} src="boing" volume={0.4} />
    </AbsoluteFill>
  );
};

// ---------- composition ----------

const CUTS = Object.values(S).slice(1).map((s) => s[0]);

const CutFlash: React.FC = () => {
  const f = useCurrentFrame();
  const o = CUTS.reduce((a, c) => a + interpolate(f, [c - 2, c, c + 7], [0, 0.16, 0], clamp), 0);
  return <AbsoluteFill style={{ background: "#fff", opacity: o, mixBlendMode: "screen" }} />;
};

const Scene: React.FC<{ s: Sc; first?: boolean; last?: boolean; children: React.ReactNode }> = ({ s, first, last, children }) => {
  const dur = s[1] - s[0];
  return (
    <Sequence from={s[0]} durationInFrames={dur + (last ? 0 : 7)}>
      <SceneWrap dur={last ? dur + 40 : dur} noIn={first}>
        {children}
      </SceneWrap>
    </Sequence>
  );
};

export const En01Full: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Scene s={S.hook} first>
        <Hook />
      </Scene>
      <Scene s={S.chat}>
        <Chat />
      </Scene>
      <Scene s={S.code}>
        <Code />
      </Scene>
      <Scene s={S.example}>
        <Example />
      </Scene>
      <Scene s={S.which}>
        <Which />
      </Scene>
      <Scene s={S.where}>
        <Where />
      </Scene>
      <Scene s={S.next} last>
        <Next />
      </Scene>
      <Html5Audio src={staticFile("en01/narration.mp3")} />
      {CUTS.map((c, i) => (
        <Sfx key={i} at={c - 4} src="whoosh" volume={0.3} />
      ))}
      <CutFlash />
      <Dust />
      <Grain />
      <Vignette />
      <NarrationCaptions lines={L} fontSize={84} top={1380} />
    </AbsoluteFill>
  );
};
