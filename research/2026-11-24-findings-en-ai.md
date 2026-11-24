# 해외(영어) + AI 제작 가능 분야 조사 — 2026-11-24 (최근 60일, 지역 US, 영어)

도구: `research/yt_outliers.py --days 60 --niches research/niches-en-ai.json --region US --lang en --swipe 15` (~3,400 API 단위).
과학·우주는 Curious Minutes 채널이 하고 있어서 제외. 영상 1,541개.

| 분야 | 중간 점수 | 쇼츠 | 롱폼 | 새 채널 10만+ | AI 제작 (우리 도구 기준) |
|---|---|---|---|---|---|
| 동물·자연 | 21.0 | 26.0 | 3.6 | 36 | ❌ 실제 촬영 영상 필요. 상위권에 AI 가짜 "카메라에 잡힌" 영상 다수 → 정책 위험 |
| 몸 설명 | 14.0 | 22.0 | 7.8 | 35 | ⚠️ 3D 해부 그림 필요. 건강 정보라 출처 엄격 (출처 표시 방식이 강점) |
| 역사 | 8.6 | **30.2** | 1.1 | 21 | ⚠️ "고대인은 어떻게…" 그림 장면 필요 → 그림 생성/코드 그림 시험 필요 |
| 지도 크기 비교 | 7.6 | 15.0 | 2.1 | 20 | ✅ sn03 지도 도구로 바로 가능 |
| 심리 | 6.6 | 7.4 | 3.1 | 18 | ⚠️ 통속 심리 위주, 사실 확인 채널과 안 맞음 |
| 작동 원리 | 6.0 | 8.2 | 1.3 | 23 | ⚠️ 3D 기계 애니메이션이 기준 |
| 지리 | 5.3 | 9.0 | 0.9 | 15 | ✅ 지도 도구로 가능 |
| 미스터리 | 2.5 | 14.3 | 1.2 | 13 | — |
| 이상한 법 | 1.8 | 2.1 | 0.6 | 3 | — |
| 어원 | 1.4 | 2.2 | 1.0 | 5 | — |
| 돈·경제 | 1.0 | 2.0 | 0.6 | 17 | — |

참고: 영어 한국 설명 1.35 (11-20), 한국어 지도 29.7 (11-24).

## 잘 된 예
- 지도 크기: How Many Countries Fit Inside Africa? 32만 / 구독 517 · USA Said Europe Fits in Its Backyard 38만 / 구독 590 · The REAL Size of India (롱폼) 31만 / 구독 423, 채널 29일 차 (GTA 6 지도 비교 영상은 게임이라 제외)
- 역사: How Did Ancient Humans Make the First Sharp Stone Tools? 1,199만 · Why Did Humans Start Wearing Clothes? (롱폼) 610만 · What Did Ancient Humans Do For Pleasure? (롱폼) 570만
- 몸: What Happens After Eating an Apple? 255만 / 구독 763, 채널 5일 차 · What Happens Inside Your Body After ONE Drink? 124만 / 채널 30일 차

## 한계
1회 조사, 검색 순위 기반, 작은 채널은 점수가 부풀려짐. "maps-size"는 GTA 6 영상이 섞여 점수가 올라가 있음.
