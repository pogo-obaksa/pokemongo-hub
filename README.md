# 오박사의 포켓몬고 허브 (프로토타입)

포켓몬고 트레이너용 **올인원 정적 웹앱**. 빌드 도구 없이 `index.html`을 열면 바로 동작하고,
Cloudflare Pages · Vercel · GitHub Pages 어디에나 **서버비 0원**으로 올릴 수 있습니다.

## 파일 구조

```
web/pokemongo-hub/
├── index.html            # 화면 구조(4개 탭 · 푸터 · 정책 모달) + Pretendard 웹폰트
├── styles.css            # 라이트 테마(스카이·민트·몬스터볼 레드) · 모바일 퍼스트 반응형
├── app.js                # 카운트다운·카운터 계산·타입 상성·육성 계산 로직
├── data/
│   ├── types.js          # 18타입 상성표 · 날씨 부스트
│   ├── events.js         # 일정 데이터 (여기만 고치면 일정이 갱신됩니다)
│   └── raids.js          # 레이드 보스 · 추천 카운터 · 기술 데이터
├── tests/verify.py       # headless chromium 자동 검증(로직 63개 + 폰트·테마 5개 + 스크린샷)
├── preview_mobile.png    # 390×844 미리보기
├── preview_desktop.png   # 1280×800 미리보기
├── robots.txt
└── ads.txt
```

## 구현된 기능

| 탭 | 내용 |
|---|---|
| 📅 일정 | 한국 시간(KST) 고정 카운트다운(D-day · HH:MM:SS), 가장 임박한 일정 히어로 카드, 진행 중/곧 시작/지난 일정 분리, 전체·레이드·스포트라이트·맥스배틀·커뮤니티·이벤트 필터 |
| ⚔️ 카운터 | 보스 13종 선택 → 복합 타입 약점(2.56배 포함)·날씨 부스트·추천 카운터 TOP 6(기술 병기), 18타입 방어/공격 상성 계산기 |
| ⚡ 육성 | 1~50레벨(0.5단위) 현재→목표, 일반/그림자(×1.2)/정화(×0.9)/럭키(모래 ×0.5) 별의모래·사탕·XL사탕 계산 + 구간별 상세표 |
| 📖 가이드 | 상성표 읽는 법, 레이드 아워 준비, 이로치·그림자·정화·럭키 육성, 별의모래 수급, FAQ (애드센스 심사용 텍스트) |

하단 푸터에 **개인정보처리방침 · 이용약관 · 문의 · 소개** 모달이 들어 있습니다.

## 일정 갱신 방법

`data/events.js`의 `EVENTS` 배열에 한 줄 추가하면 끝입니다.

```js
E('my-event', '이벤트 이름', '2026-12-20T10:00:00+09:00', '2026-12-27T20:00:00+09:00', 'event', {
  badge: '메인 이벤트', emoji: '🎄', priority: 40,
  desc: '카드에 보일 설명',
  tip: '한 줄 팁',
  source: 'https://leekduck.com/events/...'
}),
```

- 시각은 **반드시 `+09:00`(KST)** 을 붙입니다. 기기 시간대와 무관하게 계산됩니다.
- `category`: `raid` · `spotlight` · `max` · `community` · `event`
- `priority`: 히어로 카드 우선순위(높을수록 임박 이벤트로 잘 뽑힘)

## 배포 (서버비 0원)

### 1) Cloudflare Pages — 가장 빠름
1. Cloudflare 대시보드 → **Workers & Pages → Create → Pages → Upload assets**
2. `web/pokemongo-hub` 폴더를 통째로 업로드 → Deploy
3. `https://<프로젝트>.pages.dev` 주소가 바로 발급됩니다.
4. 커스텀 도메인은 **Custom domains → Set up a domain** 에서 `.com` 도메인 연결(무료 SSL 자동).

### 2) Vercel
```bash
npx vercel web/pokemongo-hub --prod
```
(프레임워크 없음 / Output Directory: `./` 로 두면 정적 파일 그대로 배포됩니다.)

### 3) GitHub Pages
```bash
cd web/pokemongo-hub
git init && git add . && git commit -m "pokemongo hub"
git remote add origin https://github.com/<계정>/<저장소>.git
git push -u origin main
```
저장소 → **Settings → Pages → Source: Deploy from a branch → main / (root)** 선택.

## 애드센스 붙이기

1. `index.html`에서 `<!-- 애드센스 광고 영역 -->` 주석 4곳(일정 상단·카운터·가이드 중간·가이드 하단)을 찾습니다.
2. `<head>`에 애드센스 스크립트를 넣고, 각 `ad-slot` 안의 `<span>광고 영역</span>` 을 `<ins class="adsbygoogle">` 코드로 교체합니다.
3. `ads.txt`에 발급받은 `google.com, pub-XXXXXXXX, DIRECT, f08c47fec0942fa0` 한 줄을 넣습니다.
4. 심사 전 확인: `개인정보처리방침`(모달에 구현됨) · `이용약관` · `문의` 페이지가 실제로 열려야 하고,
   **문의처는 실제 연락 가능한 주소로 바꿔 주세요**(현재는 블로그·인스타 채널로 안내).

## 검증

```bash
# 필요: python3 + playwright(chromium)
python3 tests/verify.py
```

- 타입 배율(2.56 / 1.6 / 0.625 / 0.391), 육성 비용(1→40 = 모래 270,000·사탕 302 / 40→50 = 모래 290,000·XL 296),
  KST 변환·카운트다운, 보스별 약점·카운터, 4개 탭 렌더, 모바일/데스크톱 가로 넘침, Pretendard 웹폰트 로드와 라이트 테마 기본값까지 자동 검사합니다.

## 서체

본문은 **Pretendard**(가변 폰트, jsDelivr CDN)를 쓰고, CDN이 막히면 기기 기본 한글 폰트로 자연스럽게 떨어집니다.
숫자(카운트다운·비용)는 같은 서체의 tabular 숫자로 맞춰 폭이 흔들리지 않습니다.

## 참고

- 팬메이드 비공식 도구입니다. Pokémon / Pokémon GO 상표권은 Nintendo · Creatures Inc. · GAME FREAK inc. · Niantic, Inc.에 있습니다.
- 일정·배율은 공개 자료를 한국 시간으로 정리한 참고값이며, 게임 내 수치가 우선합니다.
