# 큐리어스 미닛츠: 집 PC 로컬 세션용 안내

(7화부터 쇼츠는 회차당 2편이다.) (영상 렌더링 → 내 폴더 저장 → 업로드)

이 파일은 **집 PC에서 실행하는 Claude Code 로컬 세션**이 읽고 그대로 따라 하는 작업 지시서다.
클라우드 세션은 PC 폴더에 접근할 수 없어서, 렌더링과 저장은 PC에서 한다. 필요한 파일(코드, 내레이션, 이미지, 자막, 업로드 정보)은 전부 저장소에 커밋돼 있다.

## 규칙
- 사용자에게는 **한국어로만** 말한다.
- 아래 순서대로 하고, 각 단계가 끝나면 짧게 결과를 알린다. 남은 시간은 "약 N분 뒤 완성"처럼 말한다.
- `client_secret.json`, `token-*.json` 같은 키 파일은 절대 채팅에 보여주거나 커밋하지 않는다.
- 업로드는 사용자가 "올려줘"라고 할 때만 한다. 기본은 비공개(private) 업로드.

## 1. 저장소 받기
- 저장소: `https://github.com/tjrgns421-ux/ai-` · 브랜치: `claude/exciting-clarke-tapw9f`
- 이미 받아둔 폴더가 있으면 그 폴더에서 `git fetch` 후 위 브랜치를 `git pull`. 없으면 새로 clone:
  ```
  git clone -b claude/exciting-clarke-tapw9f https://github.com/tjrgns421-ux/ai-.git
  ```
- 필요한 프로그램: Node.js 18 이상, Python 3, ffmpeg (없으면 사용자에게 설치를 안내하고 기다린다)

## 2. 영상 도구 설치
```
cd ai-/video
npm ci
```
(Remotion이 첫 렌더링 때 크롬 헤드리스 셸을 자동으로 받는다. 클라우드용 `--browser-executable` 경로 옵션은 PC에서는 쓰지 않는다.)

## 3. 저장할 폴더 정하기
- 사용자에게 저장 위치를 물어본다. 기본 제안: 사용자의 "유튜브 업로드" 폴더 → 그 안에 `curious-minutes\ep05-ocean-sounds`, `curious-minutes\ep06-antarctica`
- 각 회차 폴더에 저장소의 `channels/curious-minutes/<회차>/` 내용(thumbnail.png, upload.md/json, subs/, short*/upload.md/json)을 **폴더 구조 그대로** 복사한다. upload.json 안의 썸네일·자막 경로가 이 구조를 기준으로 한다.

## 4. 렌더링 (video 폴더에서)
아래 표의 컴포지션을 렌더링해서 회차 폴더에 저장한다. 롱폼은 PC 성능에 따라 수십 분 걸린다.
```
npx remotion render src/index.ts <컴포지션> "<회차 폴더>\<파일명>" --crf=20
```

| 회차 | 컴포지션 | 파일명 | 길이 |
|---|---|---|---|
| 5화 바다 소리 | Cm05Full | long.mp4 | 8분 48초 |
| 5화 | CmShort5a / CmShort5b / CmShort5c | short1.mp4 / short2.mp4 / short3.mp4 | 25~28초 |
| 6화 남극 | Cm06Full | long.mp4 | 8분 16초 |
| 6화 | CmShort6a ~ CmShort6e | short1.mp4 ~ short5.mp4 | 24~28초 |

- 렌더링이 끝나면 각 파일 길이를 확인한다 (`ffprobe -v error -show_entries format=duration -of csv=p=0 <파일>`). 표의 길이와 1초 이상 다르면 사용자에게 알린다.
- 3D 장면이 까맣게 나오면 `--gl=angle`을 붙여 다시 렌더링한다.

## 5. 다 되면 사용자에게 알릴 것
- 저장된 폴더 경로, 파일 목록(영상, 썸네일, 자막 .srt), 각 영상 길이
- 각 영상의 업로드 정보는 해당 폴더의 `upload.md`에 있다 (영어 제목·설명·태그, 한국어 제목·설명, 자막 파일)

## 6. (사용자가 원할 때만) 유튜브 업로드
- 설명서: 저장소 `tools/youtube/README.md`
- 처음이면 채널 연결: `python tools/youtube/yt_upload.py auth --channel curious` (자막 업로드 권한 때문에 예전에 연결했어도 한 번 다시 한다)
- 올리기 전 점검: `python tools/youtube/yt_upload.py upload --channel curious --spec "<회차 폴더>\upload.json" --video "<회차 폴더>\long.mp4" --dry-run`
- 쇼츠: `--spec "<회차 폴더>\short1\upload.json" --video "<회차 폴더>\short1.mp4"`
- 순서 추천: 롱폼 먼저, 쇼츠는 하루 한 편씩, 한국시간 오전 7~9시 (미국 저녁)
- API로 올린 영상은 구글 검수 전까지 비공개로 잠긴다. 공개 전환은 YouTube 스튜디오에서 한다.
