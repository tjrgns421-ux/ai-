# 이슈 정리 슬라이드 생성기

JSON에 내용을 쓰면 인스타그램 캐러셀용 1080×1350 PNG가 나옵니다.

```bash
node insta/render.mjs insta/issues/2026-11-18-leet.json
```

결과물은 `insta/output/<파일이름>/01.png`, `02.png`, ...에 저장됩니다.
글이 슬라이드를 넘치면 경고가 뜨니 그 슬라이드의 문장을 줄이세요.

## JSON 구조

- `category`: `사회` / `정치` / `연예` (상단 색이 바뀜)
- `asOf`: 기준 날짜, `account`: 계정 이름
- `slides[].type`
  - `cover`: `kicker`, `title`, `sub`
  - `list`: `no`, `title`, `items[]` (`compact: true`면 카드가 작아져 4~5개까지 들어감)
  - `stat`: 큰 숫자 `big`, `bigLabel`, `table[]`, `items[]`
  - `quotes`: `quotes[]` (`text`, `src`). **직접 인용만** 넣으세요.
  - `sources`: `sources[]`, `notice`(HTML 허용)
- `items[].tag`: `fact`(확인된 사실), `claim`(의혹·주장), `self`(본인 입장), `status`(진행 상황)

## 작성 원칙

- 모든 카드에 출처(`note`)를 단다.
- 사실과 의혹을 태그로 구분한다. 수사·재판으로 확인되지 않은 것은 `claim`.
- 따옴표 안에는 보도된 발언만 그대로 쓴다.
- 기사 사진·방송 캡처는 쓰지 않는다 (저작권).

폰트: Pretendard (SIL OFL 1.1, `fonts/LICENSE.txt`).
