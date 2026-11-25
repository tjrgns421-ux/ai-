# 유튜브 자동 업로드 (큐리어스 미닛츠, 블립 체크)

`yt_upload.py`는 완성된 영상을 제목, 설명, 태그, 썸네일, 공개 설정까지 넣어 유튜브에 올리는 스크립트다.
**집 PC에서 실행한다.** 채널 열쇠(토큰)는 PC 안의 `~/.yt-upload/` 폴더에만 저장되고, 저장소나 클라우드에는 올라가지 않는다.

## 처음 한 번만 (약 15분)

### 1. 파이썬 라이브러리 설치
```
pip install google-api-python-client google-auth-oauthlib
```

### 2. Google Cloud 프로젝트 만들기
1. https://console.cloud.google.com 접속 (채널을 관리하는 구글 계정으로 로그인)
2. 위쪽 프로젝트 선택 → **새 프로젝트** → 이름 예: `channel-uploader` → 만들기
3. 왼쪽 메뉴 **API 및 서비스 → 라이브러리** → "YouTube Data API v3" 검색 → **사용**

### 3. 동의 화면(OAuth consent screen)
1. **API 및 서비스 → OAuth 동의 화면** (또는 "Google 인증 플랫폼")
2. 사용자 유형 **외부** → 앱 이름 예: `channel-uploader`, 지원 이메일은 본인 이메일
3. **테스트 사용자**에 채널을 관리하는 구글 계정(들)을 추가
   - 블립 체크가 다른 구글 계정에 있으면 그 계정도 추가

### 4. OAuth 클라이언트 만들기
1. **API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**
2. 애플리케이션 유형 **데스크톱 앱** → 만들기
3. **JSON 다운로드** → 파일 이름을 `client_secret.json`으로 바꿔서 아래 폴더에 넣기
   - Windows: `C:\Users\<사용자이름>\.yt-upload\client_secret.json`
   - Mac: `~/.yt-upload/client_secret.json`
   - **이 파일과 토큰 파일은 절대 채팅이나 저장소에 올리지 말 것**

### 5. 채널마다 한 번씩 연결
```
python3 tools/youtube/yt_upload.py auth --channel curious
python3 tools/youtube/yt_upload.py auth --channel blip
```
- 브라우저가 열리면 로그인 → **채널 선택 화면에서 해당 채널을 고르고** → 허용
- "확인되지 않은 앱" 경고가 나오면 **고급 → (앱 이름)(으)로 이동**을 누르면 된다 (본인이 만든 앱이라 정상)
- 끝나면 "This key uploads to the channel: ○○○"가 나온다. 채널 이름이 맞는지 확인

## 올리기
```
python3 tools/youtube/yt_upload.py upload --channel curious --spec channels/curious-minutes/ep03-roman-dodecahedron/upload.json --video cm03-full.mp4 --dry-run
python3 tools/youtube/yt_upload.py upload --channel curious --spec channels/curious-minutes/ep03-roman-dodecahedron/upload.json --video cm03-full.mp4
```
- `--dry-run`: 실제로 올리지 않고 제목, 설명 길이, 태그, 썸네일, 공개 설정만 검사
- 키가 다른 채널 것이면 스크립트가 멈춘다 (엉뚱한 채널에 올라가는 것 방지)
- 업로드 기록: `~/.yt-upload/uploads.log`

## 회차별 업로드 정보 (upload.json)
`upload.md`에서 만든다:
```
python3 tools/youtube/md2spec.py channels/curious-minutes/ep03-roman-dodecahedron/upload.md --category 27 --thumbnail thumbnail.png
```
카테고리: 28 = 과학기술, 27 = 교육. 기본은 비공개(`"privacy": "private"`), 합성 음성 표시(`"syntheticMedia": true`), 아동용 아님.

## 알아둘 제한
- **검수 전에는 비공개로만 올라간다.** 구글 검수(audit)를 통과하지 않은 API 프로젝트로 올린 영상은 비공개로 잠긴다. 올라간 뒤 YouTube 스튜디오에서 직접 공개로 바꾸면 된다. 검수를 통과하면 바로 공개, 예약 공개(`publishAt`)도 된다.
- **하루 업로드 수**: 프로젝트 하나에 하루 약 6개 (두 채널 합산). 모자라면 채널별로 프로젝트를 나눈다 (client_secret 파일을 채널별로 쓰도록 바꾸면 됨).
- **커스텀 썸네일**: 채널 전화번호 인증이 되어 있어야 API로 들어간다. 안 되면 스튜디오에서 직접 넣는다.
- 토큰이 유출되면: Google 계정 → 보안 → 서드파티 앱 액세스에서 `channel-uploader` 권한을 삭제하고 `auth`를 다시 한다.

## 한국어 번역·자막 (2026-11-25 추가)
- `upload.md`에 `## 한국어 제목` / `## 한국어 설명`이 있으면 업로드할 때 같이 들어간다. 한국어로 유튜브를 보는 사람에게만 한국어 제목이 보이고, 나머지는 영어 그대로다.
- `--subs` 옵션으로 만든 `upload.json`은 영어·한국어 자막 파일(.srt)도 같이 올린다:
  ```
  python3 tools/youtube/md2spec.py channels/curious-minutes/ep06-antarctica/upload.md --category 28 --thumbnail thumbnail.png --subs subs/long
  ```
- **자막을 올리려면 권한이 하나 더 필요하다.** 이 기능 전에 `auth`를 했다면 채널마다 한 번 더 한다:
  ```
  python3 tools/youtube/yt_upload.py auth --channel curious
  ```
- 자막 파일은 `video/tools/make_srt.py`로 만든다 (영어는 단어 타이밍, 한국어는 번역문 한 줄씩).
