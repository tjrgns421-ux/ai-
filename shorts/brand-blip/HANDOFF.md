# Blip Check 인수인계 (2026-11-25 갱신)

이 파일은 Blip Check 채널 작업을 새 세션에서 이어가기 위한 메모입니다.
Curious Minutes 채널(`channels/curious-minutes/`)은 다른 세션에서 작업하므로 건드리지 마세요.

## 사용자 규칙 (반드시 지킬 것)
- **모든 대답은 한국어로.** 상태 메시지, 도구 설명까지 전부 한국어. 영어는 영상에 들어가는 문장과 코드에만 씀. 영어로 답하면 사용자가 매우 불편해함.
- 대본은 앞부분만 보여주기.
- 사실만 다루는 채널: 화면의 모든 주장은 실제 기사에서 오고 출처를 화면에 표시. 아직 계획인 것은 계획이라고 말함(사실처럼 말하지 않기).
- 실수는 바로 인정. 사용자가 고쳐 달라고 한 부분만 고침.
- 개인 정보를 외부 요청에 넣지 않음. API 키는 채팅으로 받지 않고 환경의 네트워크 시크릿으로.
- PR은 요청이 있을 때만.
- **롱폼 1편을 만들면 그걸 잘라서 쇼츠 2개도 같이 준다** (2026-11-25 사용자 요청, 처음엔 5개였다가 2개로 변경). 다시 렌더링하지 않고 `video/tools/reels.py`로 롱폼 mp4에서 잘라 만든다. 쇼츠마다 제목·설명도 같이.
- **완성본은 압축 파일 하나로 준다** (2026-11-25 사용자 요청). 이름 규칙:
  - zip: `블립 N화.zip` (N = 지도 시리즈 회차, mp03 = 3화)
  - 롱폼 `블립 N화-롱폼.mp4`, 쇼츠 `블립 N화-쇼츠1.mp4`, `블립 N화-쇼츠2.mp4`(reels json 순서대로)
  - 썸네일 `블립 N화-썸네일.png`, 업로드 정보 `블립 N화-업로드정보.md`
  - 720p 미리보기는 넣지 않는다 (업로드에 안 쓰고 용량만 큼, 2026-11-25 사용자 요청). 압축 파일에는 위 5개 파일만.

## 채널
- 이름 Blip Check, 슬로건 "Maps lie. We check." (2026-11-24 변경, 이전 "Korea, checked."), 영어 채널(해외 시청자 대상), 진행 캐릭터 Blip.
- 채널 소개·재생목록·프로필·배너: `shorts/brand-blip/korea-channel.md` (2026-11-24 콘셉트 변경: 지도·국경 주장 확인, 영어 롱폼 8분+, 맨 아래 섹션)
- 대본 규칙: `.claude/skills/shorts-script/SKILL.md` 10–11절, 제목·썸네일: `.claude/skills/yt-package/`
- 목소리: en-US-AndrewMultilingualNeural, +8%

## 회차 (`shorts/<회차>/`, 영상 코드는 `video/src/<회차>/`)
| 회차 | 내용 | 상태 |
|---|---|---|
| sn01-suneung-ai-cheating | 수능 vs AI 부정행위 (2:54 + 쇼츠) | 완성, 업로드 정보 `post.md` |
| sn02-suneung-bounty | 수능 부정행위 신고 포상금 $75,000·10년 응시 제한 (5:29 + 쇼츠 0:48) | 완성, 썸네일 'THEY PAY $75,000?', 업로드 정보 `post.md` |
| bc01-gpt62-astra-vs-sol | AI 비교 쇼츠 | 완성 |
| en01, ep01, ep02 | 초기 회차 | 완성 |
| sn03-north-south-words | 남북한 말 (4:54) | 완성·업로드 |
| mp01-korea-border | 지도 롱폼 1회: 38선은 국경이 아니다 (영어, 8:31) | 완성, `post.md` |
| mp02-china-one-time-zone | 지도 롱폼 2회: 중국은 왜 시간대가 하나? (8:11) | 완성, `post.md`, 릴스 5개 `shorts/reels/reels-2026-11-25.json` |
| mp03-alaska-russia | 지도 롱폼 3회: 알래스카에서 러시아가 보이나? (7:36) | 완성, `post.md`, 쇼츠 5개 `shorts/reels/reels-mp03.json` |
| mp04-north-korea-night | 지도 롱폼 4회: 북한은 정말 밤에 깜깜한가? (5:59) | 완성, `post.md`, 쇼츠 2개 `shorts/reels/reels-mp04.json`, 측정 `research/nk_night_lights.py` |

## 기타
- 인스타그램 만화·이슈 슬라이드: `insta/` (README 참고)
- 니치 조사: `research/2026-11-19-findings.md`
- 렌더링: `cd video && npx remotion render <Composition> out/... --concurrency=4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
- 긴 영상은 `video/tools/render-chunks.sh` 방식(구간별 렌더링)으로. 백그라운드 작업은 2시간에 끊김.
- 출처 캡처: `video/tools/capture.cjs`. 막힌 사이트는 환경 네트워크 허용 목록에 추가 요청 필요.
- 사진도 가져와도 됨(2026-11-20 사용자 허용): `capture.cjs`에 `figure` 항목으로 기사 사진을 설명·제공처 표기째 캡처. 화면에 출처와 제공처를 표시.
  위키미디어 공용 등 CC·퍼블릭 도메인 사진을 우선 사용(작성자·라이선스 표기). 통신사 사진(연합 등)은 저작권 신고 위험이 있어 기사 화면 캡처 안에서만 짧게.
  사진 서버가 막히면 도구가 서버 주소를 알려 줌 → 허용 목록에 추가 요청.
- `video/out/`은 git에 저장되지 않음. 완성 영상은 사용자에게 파일로 보내기.

## 로컬에서 이어가기 (2026-11-25)
- 브랜치: `claude/youthful-fermi-zlq030` (모든 작업 커밋·푸시됨). `git fetch origin claude/youthful-fermi-zlq030 && git checkout claude/youthful-fermi-zlq030`
- `video/out/`(완성 mp4)은 git에 없음 → 사용자가 받은 파일을 쓰거나 아래 명령으로 다시 렌더링.
- 준비물: Node + `cd video && npm install`, 지도 도구용 `npm i --no-save world-atlas@2 topojson-client@3 d3-geo@3`, Python `edge-tts`, `astral`, `Pillow`, ffmpeg, Playwright(Chromium).
- 클라우드 전용 경로는 로컬에 맞게 바꿀 것: 렌더링 브라우저 `/opt/pw-browsers/...chrome-headless-shell`(→ 로컬은 `--browser-executable` 생략 가능, `tools/render-long.sh`·`tools/stills.mjs`의 BROWSER/CH 값 수정), 릴스 폰트 `Pretendard-Black.ttf`(woff2를 fontTools로 ttf 변환해서 경로 지정).
- 로컬에는 클라우드 네트워크 허용 목록이 없으니 사이트 차단 문제는 줄어듦. YouTube API 키는 로컬 환경 변수로 직접 설정(채팅에 붙이지 말 것).

## 지도 롱폼 만드는 순서 (mp01~mp03에서 굳은 방식)
1. 주제: `research/yt_outliers.py`(YouTube API)로 같은 분야 잘 된 영상, `research/yt_suggest.py`로 자동완성 키워드 확인.
2. 출처: 원문을 직접 읽고 `shorts/<회차>/sources.md`에 주장별 출처·상태 표. 한 사람 회상뿐인 건 빼거나 "증언"으로 표시. 직접 계산한 값은 화면에 "Calculated/Measured" 표시.
3. 대본: `shorts/<회차>/script.txt`, 점수 `python3 .claude/skills/yt-script/scriptscore.py script.txt --target 420-600 --wpm 189`(75+ 목표), 훅은 `hookscore.py`.
4. 캡처: `shorts/<회차>/captures.json` → `cd video && node tools/capture.cjs ../shorts/<회차>/captures.json public/<회차>/captures`. 사진: `node tools/commons-get.cjs public/<회차>/photos name=File:...`(라이선스 자동 기록, 이후 w/h 추가).
5. 지도: `tools/korea-map.mjs`, `china-map.mjs`, `bering-map.mjs` 참고해 Natural Earth를 미리 투영한 JSON 생성.
6. 내레이션: `python3 video/tools/tts_lines.py shorts/<회차>/script.txt video/public/<회차>` (Andrew Multilingual +8%).
7. 장면: `video/src/<회차>/{engine,Visuals,Mp0x,Thumb}.tsx` (mp03 복사해서 시작), `Root.tsx`에 등록. 장면 평균 4초, 지도·사진 클로즈업·캡처를 섞기.
8. 확인: `node tools/stills.mjs Mp0xFull out/<회차>/stills <프레임...>`으로 장면마다 정지 화면 뽑아 겹침·잘림 확인.
9. 렌더링: `COMP=Mp0xFull TOTAL=<프레임수> OUT=out/<회차> NAME=<회차>-full bash tools/render-long.sh` (TOTAL = 마지막 단어 끝 × 30 + 45).
10. 쇼츠 2개: `shorts/reels/reels-<회차>.json` → `python3 tools/reels.py ../shorts/reels/reels-<회차>.json out/reels-<회차> <폰트.ttf>`.
11. 업로드 정보: `shorts/<회차>/post.md` (제목·썸네일은 `.claude/skills/yt-package/title.py`로 100점 확인, 설명·챕터·출처·사진 라이선스·태그·고정 댓글·쇼츠 제목).

## 다음 할 일
- mp05 후보: 메르카토르 지도·아프리카 실제 크기 (`research/2026-11-26-mp04-topics.md`).
- mp03 업로드: 롱폼 먼저, 쇼츠는 하루 1~2개씩.
