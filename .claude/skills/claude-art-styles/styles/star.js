// 클로드 별 모양(화풍 세상 공통) — 2026-11-07 연구 중
// 인스타 brands/claude.png 윤곽을 2°마다 잰 반지름(중심에서 끝까지, 지름 1 = 640px의 절반 기준).
// 화면 좌표(y 아래로). three.js에 쓸 때는 y를 뒤집는다.
export const PROFILE = [0.722,0.613,0.541,0.491,0.444,0.9,0.956,0.994,0.997,0.966,0.931,0.806,0.659,0.553,0.478,0.422,0.375,0.344,0.344,0.456,0.841,1.012,1.025,0.966,0.797,0.634,0.534,0.472,0.909,0.972,0.997,0.994,0.975,0.919,0.787,0.662,0.575,0.506,0.447,0.4,0.375,0.403,0.469,0.569,0.734,0.981,1.016,1.028,1.022,0.997,0.316,0.344,0.369,0.406,0.447,0.503,0.575,0.662,0.791,0.894,1.012,1.034,1.038,0.997,0.338,0.381,0.431,0.503,0.588,0.713,0.903,0.956,0.988,0.994,0.966,0.825,0.275,0.269,0.275,0.297,0.325,0.35,0.394,0.438,0.506,0.591,0.691,0.863,0.994,1.016,1.028,0.994,0.259,0.281,0.3,0.322,0.353,0.384,0.425,0.478,0.55,0.644,0.762,0.928,0.984,1.012,1.025,1.019,1.003,0.947,0.428,0.341,0.35,0.397,0.459,0.537,0.669,0.928,1.019,1.05,1.066,1.081,1.078,1.05,1.016,0.703,0.537,0.441,0.375,0.328,0.272,0.206,0.203,0.212,0.263,0.378,0.584,0.866,0.912,0.941,0.938,0.919,0.894,0.725,0.537,0.422,0.344,0.291,0.287,0.303,0.372,0.503,0.7,0.884,0.938,0.966,0.972,0.963,0.956,0.938,0.884,0.794,0.694,0.622,0.562,0.516,0.481,0.447,0.428,0.406,0.388,0.375,0.359,0.35,0.753,0.938,0.966,0.956,0.938,0.856];

// 끝이 뭉툭한 광선 12개로 다시 정리한 별 — 광선 방향·길이는 윤곽의 봉우리에서
export function rays(minLen = 0.8) {
  const n = PROFILE.length, out = [];
  for (let i = 0; i < n; i++) {
    const v = PROFILE[i];
    if (v < minLen) continue;
    // 봉우리 묶음(연속 구간)의 가운데를 광선 하나로
    if (PROFILE[(i - 1 + n) % n] >= minLen) continue;
    let j = i, best = i;
    while (PROFILE[(j + 1) % n] >= minLen && j - i < 20) { j++; if (PROFILE[j % n] > PROFILE[best % n]) best = j; }
    const mid = (i + j) / 2;
    out.push({ a: (mid * 2 * Math.PI) / n, len: PROFILE[best % n] });
  }
  return out;
}

// 광선 모양 다각형: 가운데 원 + 광선(뿌리 넓고 끝 뭉툭) — 점 목록 [x,y] (반지름 1 기준)
export function rayPolygon({ hub = 0.3, root = 0.17, tip = 0.07, round = 0, rayList = rays() } = {}) {
  const pts = [];
  const rs = [...rayList].sort((p, q) => p.a - q.a);
  for (let k = 0; k < rs.length; k++) {
    const r = rs[k], nx = rs[(k + 1) % rs.length];
    const ux = Math.cos(r.a), uy = Math.sin(r.a), px = -uy, py = ux;
    // 광선: 뿌리 왼쪽 → 끝 왼쪽 → 끝 오른쪽 → 뿌리 오른쪽
    pts.push([ux * hub - px * root / 2, uy * hub - py * root / 2]);
    if (round) { // 끝을 반원으로(찰흙·만화)
      const L = r.len - tip / 2;
      for (let s = 0; s <= round; s++) { const a = -Math.PI / 2 + (Math.PI * s) / round; pts.push([ux * L + (Math.cos(a) * ux + Math.sin(a) * px) * tip / 2, uy * L + (Math.cos(a) * uy + Math.sin(a) * py) * tip / 2]); }
    } else {
      pts.push([ux * r.len - px * tip / 2, uy * r.len - py * tip / 2]);
      pts.push([ux * (r.len + 0.02), uy * (r.len + 0.02)]);
      pts.push([ux * r.len + px * tip / 2, uy * r.len + py * tip / 2]);
    }
    pts.push([ux * hub + px * root / 2, uy * hub + py * root / 2]);
    // 다음 광선까지 가운데 원을 따라
    // 이웃 광선 뿌리가 겹치면(광선 사이가 좁으면) 원호를 건너뛴다 — 겹친 채로 돌면 다각형이 꼬인다
    let gap = nx.a - r.a; if (gap <= 0) gap += Math.PI * 2;
    const a0 = r.a + root / 2 / hub, a1 = r.a + gap - root / 2 / hub;
    if (a1 > a0) for (let s = 1; s < 3; s++) { const a = a0 + ((a1 - a0) * s) / 3; pts.push([Math.cos(a) * hub * 0.98, Math.sin(a) * hub * 0.98]); }
  }
  return pts;
}

// 늘 같은 결과를 내는 난수(장면을 몇 번 그려도 같게)
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const ease = { out: (x) => 1 - Math.pow(1 - x, 3), inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), clamp: (x) => Math.max(0, Math.min(1, x)) };
