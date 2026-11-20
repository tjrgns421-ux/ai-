# Blip Check 인수인계 (2026-11-20)

이 파일은 Blip Check 채널 작업을 새 세션에서 이어가기 위한 메모입니다.
Curious Minutes 채널(`channels/curious-minutes/`)은 다른 세션에서 작업하므로 건드리지 마세요.

## 사용자 규칙 (반드시 지킬 것)
- **모든 대답은 한국어로.** 상태 메시지, 도구 설명까지 전부 한국어. 영어는 영상에 들어가는 문장과 코드에만 씀. 영어로 답하면 사용자가 매우 불편해함.
- 대본은 앞부분만 보여주기.
- 사실만 다루는 채널: 화면의 모든 주장은 실제 기사에서 오고 출처를 화면에 표시. 아직 계획인 것은 계획이라고 말함(사실처럼 말하지 않기).
- 실수는 바로 인정. 사용자가 고쳐 달라고 한 부분만 고침.
- 개인 정보를 외부 요청에 넣지 않음. API 키는 채팅으로 받지 않고 환경의 네트워크 시크릿으로.
- PR은 요청이 있을 때만.

## 채널
- 이름 Blip Check, 슬로건 "Korea, checked.", 영어 채널(해외 시청자 대상), 진행 캐릭터 Blip.
- 채널 소개·재생목록·프로필·배너: `shorts/brand-blip/korea-channel.md`
- 대본 규칙: `.claude/skills/shorts-script/SKILL.md` 10–11절, 제목·썸네일: `.claude/skills/yt-package/`
- 목소리: en-US-AndrewMultilingualNeural, +8%

## 회차 (`shorts/<회차>/`, 영상 코드는 `video/src/<회차>/`)
| 회차 | 내용 | 상태 |
|---|---|---|
| sn01-suneung-ai-cheating | 수능 vs AI 부정행위 (2:54 + 쇼츠) | 완성, 업로드 정보 `post.md` |
| sn02-suneung-bounty | 수능 부정행위 신고 포상금 $75,000·10년 응시 제한 (5:29 + 쇼츠 0:48) | 완성, 썸네일 'THEY PAY $75,000?', 업로드 정보 `post.md` |
| bc01-gpt62-astra-vs-sol | AI 비교 쇼츠 | 완성 |
| en01, ep01, ep02 | 초기 회차 | 완성 |

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
