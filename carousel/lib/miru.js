/* 미루의 갓생일기 — 캐릭터·장면 그리기 도구 (공통) */
const INK = '#232323';
const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const C = { wall:'#fbf8f1', stripe:'#f3ecdf', floor:'#f1e6d3', skin:'#ffe2d1', hair:'#5a4036', hairHi:'#7a5a4c',
  blush:'#ff8f8f', hoodie:'#a9bcff', pants:'#7d7d9a', wood:'#f0cf9f', yellow:'#ffe27a', pink:'#ffc2d4', blue:'#9fd4ff',
  mint:'#a8e89a', red:'#ff6b6b', gold:'#ffcf4a' };
const FONT = `font-family="Gaegu" font-weight="700" fill="${INK}"`;

function defs(id) {
  return `<defs>
  <filter id="rough-${id}"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
  <radialGradient id="lamp-${id}" cx="50%" cy="20%" r="70%"><stop offset="0" stop-color="#fff3b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient>
  <radialGradient id="glow-${id}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.blue}" stop-opacity=".45"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
  <pattern id="hatch-${id}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="14" stroke="#fff" stroke-width="3" opacity=".55"/></pattern>
  </defs>`;
}
function svgWrap(id, W, H, body) { return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${defs(id)}${body}</svg>`; }
function wall(w, h, floorY) {
  return `<rect width="${w}" height="${h}" fill="${C.wall}"/>
  <g fill="${C.stripe}" opacity=".6">${Array.from({length:9},(_,i)=>`<rect x="${i*130-20}" y="0" width="48" height="${floorY}"/>`).join('')}</g>
  <rect y="${floorY}" width="${w}" height="${h-floorY}" fill="${C.floor}"/>`;
}

/* 미루 얼굴: 원본 좌표 중심 (650,402), 반지름 70 */
function head(cx, cy, r, eyes, mouth, glasses) {
  const s = r / 70;
  const tired = `<g stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M614 420 q14 -6 28 0"/><path d="M660 420 q14 -6 28 0"/></g>
      <ellipse cx="628" cy="428" rx="7" ry="5" fill="${INK}"/><ellipse cx="674" cy="428" rx="7" ry="5" fill="${INK}"/>`;
  const E = {
    bright: `<circle cx="628" cy="424" r="8" fill="${INK}"/><circle cx="674" cy="424" r="8" fill="${INK}"/>
             <circle cx="631" cy="420" r="3" fill="#fff"/><circle cx="677" cy="420" r="3" fill="#fff"/>`,
    determined: `<circle cx="628" cy="426" r="8" fill="${INK}"/><circle cx="674" cy="426" r="8" fill="${INK}"/>
             <circle cx="631" cy="422" r="3" fill="#fff"/><circle cx="677" cy="422" r="3" fill="#fff"/>
             <path d="M610 402 l28 9 M692 402 l-28 9" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`,
    happy: `<path d="M614 428 q14 -14 28 0 M660 428 q14 -14 28 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    closed: `<path d="M614 424 q14 10 28 0 M660 424 q14 10 28 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    tired: tired + `<path d="M614 440 q14 8 28 0 M660 440 q14 8 28 0" stroke="#8a7bd6" stroke-width="4" fill="none"/>`,
    zombie: tired + `<path d="M612 440 q16 12 32 0 M658 440 q16 12 32 0" stroke="#8a7bd6" stroke-width="7" fill="none"/>`,
    shock: `<circle cx="626" cy="424" r="14" fill="#fff" ${S}/><circle cx="676" cy="424" r="14" fill="#fff" ${S}/>
            <circle cx="626" cy="426" r="4" fill="${INK}"/><circle cx="676" cy="426" r="4" fill="${INK}"/>`,
    xx: `<path d="M616 414 l18 11 l-18 11 M686 414 l-18 11 l18 11" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  }[eyes];
  const M = {
    smile: `<path d="M636 450 q16 14 32 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    grin: `<path d="M632 446 q20 26 40 0z" fill="#e0607a" ${S}/>`,
    tight: `<path d="M640 456 h24" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
    line: `<path d="M642 458 h20" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
    o: `<ellipse cx="652" cy="460" rx="8" ry="10" fill="${INK}"/>`,
    open: `<path d="M640 452 q12 18 24 0z" fill="#e0607a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
    wavy: `<path d="M634 458 q6 -6 12 0 q6 6 12 0 q6 -6 12 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`
  }[mouth];
  const G = glasses ? `<circle cx="626" cy="424" r="22" fill="none" ${S}/><circle cx="676" cy="424" r="22" fill="none" ${S}/><path d="M648 424 h6" ${S}/>` : '';
  return `<g transform="translate(${cx - 650*s} ${cy - 402*s}) scale(${s})">
    <circle cx="650" cy="402" r="70" fill="${C.skin}" ${S}/>
    <path d="M576 420 C560 330 630 296 690 312 C742 326 736 384 726 418 L716 386 L703 400 L690 377 L675 397 L660 372 L645 395 L629 372 L614 397 L600 378 L590 410 Z" fill="${C.hair}" ${S}/>
    <path d="M646 318 q-14 -34 18 -44 q-8 18 -2 38" fill="${C.hair}" ${S}/>
    <path d="M612 336 q22 -18 58 -16" stroke="${C.hairHi}" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${E}
    <ellipse cx="606" cy="446" rx="13" ry="7" fill="${C.blush}" opacity=".6"/><ellipse cx="696" cy="446" rx="13" ry="7" fill="${C.blush}" opacity=".6"/>
    ${M}${G}
  </g>`;
}

/* 몸: 팔 각도는 아래 방향 0도 기준, 시계방향 + (예: 140 = 왼쪽 위, -140 = 오른쪽 위) */
function arm(x0, y0, ang, len) {
  const r = ang * Math.PI / 180;
  return { svg: `<g transform="translate(${x0} ${y0}) rotate(${ang})"><rect x="-17" y="0" width="34" height="${len}" rx="17" fill="${C.hoodie}" ${S}/></g>`,
           hx: x0 - Math.sin(r) * len, hy: y0 + Math.cos(r) * len };
}
function standing(x, y, la, ll, ra, rl) {
  const L = arm(x - 46, y + 74, la, ll), R = arm(x + 46, y + 74, ra, rl);
  return { svg: `<rect x="${x-44}" y="${y+168}" width="38" height="86" rx="12" fill="${C.pants}" ${S}/>
    <rect x="${x+6}" y="${y+168}" width="38" height="86" rx="12" fill="${C.pants}" ${S}/>
    <ellipse cx="${x-26}" cy="${y+256}" rx="28" ry="12" fill="#fff" ${S}/><ellipse cx="${x+26}" cy="${y+256}" rx="28" ry="12" fill="#fff" ${S}/>
    <rect x="${x-60}" y="${y+46}" width="120" height="136" rx="40" fill="${C.hoodie}" ${S}/>
    ${L.svg}${R.svg}`, L, R };
}
function seated(x, deskY) {  // 책상 뒤에 앉은 상체
  return `<path d="M${x-100} ${deskY+4} q0 -108 100 -108 q100 0 100 108z" fill="${C.hoodie}" ${S}/>
    <path d="M${x-24} ${deskY-94} l24 32 l24 -32" fill="none" stroke="${INK}" stroke-width="4"/>`;
}
function desk(y) {
  return `<rect x="60" y="${y}" width="880" height="26" rx="6" fill="${C.wood}" ${S}/>
    <rect x="90" y="${y+26}" width="20" height="${500-y-24}" fill="${C.wood}" ${S}/><rect x="890" y="${y+26}" width="20" height="${500-y-24}" fill="${C.wood}" ${S}/>`;
}
function hand(p, r=17) { return `<circle cx="${p.hx}" cy="${p.hy}" r="${r}" fill="${C.skin}" ${S}/>`; }
function dot(x, y, r=17) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.skin}" ${S}/>`; }

/* 소품 */
function sparkle(x, y, s, fill) {
  return `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -20 Q4 -4 20 0 Q4 4 0 20 Q-4 4 -20 0 Q-4 -4 0 -20z" fill="${fill || C.gold}" stroke="${INK}" stroke-width="${4/s}" stroke-linejoin="round"/>`;
}
function drops(list) { return list.map(([x,y,s])=>`<path transform="translate(${x} ${y}) scale(${s||1})" d="M0 -14 q-11 16 0 22 q11 -6 0 -22z" fill="${C.blue}" ${S}/>`).join(''); }
function zzz(x, y) { return `<g ${FONT}><text x="${x}" y="${y}" font-size="30">z</text><text x="${x+26}" y="${y-34}" font-size="40">Z</text><text x="${x+60}" y="${y-76}" font-size="52">Z</text></g>`; }
function phoneHeld(x, y) {
  return `<g transform="rotate(-10 ${x} ${y})"><rect x="${x-25}" y="${y-42}" width="50" height="84" rx="10" fill="${INK}"/><rect x="${x-20}" y="${y-36}" width="40" height="70" rx="6" fill="${C.blue}"/><path d="M${x-6} ${y-14} l14 9 l-14 9z" fill="#fff"/></g>
  <circle cx="${x-14}" cy="${y+44}" r="13" fill="${C.skin}" ${S}/><circle cx="${x+16}" cy="${y+40}" r="13" fill="${C.skin}" ${S}/>`;
}
function bubble(cx, cy, rx, ry, text, size, tail, id) {
  return `<g filter="url(#rough-${id})">
    ${tail.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${S}/>`).join('')}
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" ${S}/></g>
    <text x="${cx}" y="${cy + size*0.33}" text-anchor="middle" ${FONT} font-size="${size}">${text}</text>`;
}
function narration(x, y, text, size=30) {
  const w = text.length * size * 0.78 + 40;
  return `<rect x="${x}" y="${y}" width="${w}" height="${size+24}" rx="6" fill="${INK}"/>
  <text x="${x+18}" y="${y+size+4}" font-family="Gaegu" font-weight="700" font-size="${size}" fill="#fff">${text}</text>`;
}
function win(x, day, id) {
  const sky = day ? '#cdeeff' : '#3a4377';
  const inner = day
    ? `<circle cx="${x+56}" cy="104" r="26" fill="${C.yellow}" ${S}/><path d="M${x+100} 190 q0 -18 20 -16 q6 -14 24 -8 q18 2 16 18 h-60z" fill="#fff" ${S}/>`
    : `<circle cx="${x+120}" cy="100" r="24" fill="${C.yellow}"/><circle cx="${x+132}" cy="92" r="22" fill="${sky}"/><circle cx="${x+40}" cy="90" r="3" fill="#fff"/><circle cx="${x+60}" cy="180" r="3" fill="#fff"/><circle cx="${x+140}" cy="170" r="2" fill="#fff"/>`;
  return `<rect x="${x}" y="50" width="180" height="180" rx="12" fill="#fff" ${S}/>
  <rect x="${x+8}" y="58" width="164" height="164" rx="8" fill="${sky}" ${S}/>
  ${inner}
  <path d="M${x+90} 58 v164 M${x+8} 140 h164" stroke="${INK}" stroke-width="4"/>`;
}
function bedBack(id, o) {
  return `${wall(1000,580,500)}
  <g filter="url(#rough-${id})">
    ${o.window ? win(o.wx || 60, o.day, id) : ''}
    <rect x="200" y="392" width="140" height="108" rx="10" fill="${C.wood}" ${S}/>
    <path d="M212 446 h116" stroke="${INK}" stroke-width="4"/>
    <circle cx="270" cy="420" r="5" fill="${INK}"/><circle cx="270" cy="474" r="5" fill="${INK}"/>
    <rect x="210" y="346" width="80" height="46" rx="10" fill="#fff" ${S}/>
    <path d="M400 420 v-110 q0 -36 36 -36 h470 q36 0 36 36 v110z" fill="#b7c6ff" ${S}/>
    <rect x="380" y="400" width="580" height="100" rx="22" fill="#fff" ${S}/>
    <ellipse cx="520" cy="404" rx="105" ry="38" fill="#fff" ${S}/>
  </g>
  <text x="250" y="378" text-anchor="middle" font-family="monospace" font-weight="700" font-size="22" fill="${C.red}">${o.clock}</text>`;
}
function bedFront(id) {
  return `<g filter="url(#rough-${id})">
    <path d="M440 434 q30 -26 100 -8 q55 12 110 -6 q110 -26 300 4 v74 h-510z" fill="#a9c9ff" ${S}/>
    <path d="M442 434 q30 -26 100 -8 q55 12 110 -6 q110 -26 300 4 v20 q-160 -26 -300 4 q-60 12 -110 2 q-70 -14 -100 6z" fill="#cfe0ff" ${S}/>
  </g>
  <rect x="460" y="458" width="480" height="40" fill="url(#hatch-${id})"/>`;
}

/* 공통 마무리: 손그림 테두리 + 마스킹테이프 */
function finishDiary() {
  document.querySelectorAll('.panel, .card, .polaroid, .stat').forEach((el, i) => {
    const w = el.offsetWidth, h = el.offsetHeight, sw = el.classList.contains('stat') ? 4 : 5;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.insertAdjacentHTML('beforeend', `<svg width="${w}" height="${h}" style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible;z-index:4">
      <defs><filter id="rf${i}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="2" seed="${i + 3}"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter></defs>
      <rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="12" fill="none" stroke="#232323" stroke-width="${sw}" filter="url(#rf${i})"/></svg>`);
  });
  const colors = ['y', 'p', 'b', 'g'];
  document.querySelectorAll('.slide').forEach((sl, si) => {
    if (si === 0) return;
    sl.querySelectorAll('.panel, .card').forEach((el, j) => {
      const t = document.createElement('div');
      t.className = 'tape ' + colors[(si + j) % 4];
      t.style.left = (el.offsetLeft + (j % 2 ? 70 : el.offsetWidth - 250)) + 'px';
      t.style.top = (el.offsetTop - 22) + 'px';
      t.style.transform = `rotate(${(j % 2 ? -1 : 1) * (6 + (si % 3) * 3)}deg)`;
      sl.appendChild(t);
    });
  });
}
