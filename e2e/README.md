# CHOK 프론트엔드 E2E 테스트 (Playwright)

`CHOK_TestCases.xlsx` 의 테스트 케이스를 Playwright E2E 로 옮긴 것입니다.
현재 **25 passed / 4 skipped** (skip 4건은 특수 백엔드 상태가 필요한 `fixme` 케이스).

---

## 1. 설치

이미 설치되어 있다면 [3. 실행](#3-실행)으로 바로 가세요. 처음 세팅하는 경우:

```bash
# (1) 테스트 러너 설치
#  ※ 이 프로젝트는 vite 8 ↔ @tailwindcss/vite 의 peer 충돌이 있어 --legacy-peer-deps 가 필요합니다.
npm install -D @playwright/test --legacy-peer-deps

# (2) 브라우저(chromium) 다운로드
npx playwright install chromium
```

> 다른 브라우저(firefox/webkit)까지 쓰려면 `npx playwright install` (인자 없이) 실행.
> 단 `playwright.config.ts` 는 현재 chromium 프로젝트만 정의되어 있습니다.

## 2. 설치 확인

```bash
npx playwright --version          # 예: Version 1.61.1
npx playwright test --list        # 29개 테스트가 7개 파일에서 수집되면 정상
```

`--list` 는 서버를 띄우지 않고 스펙 파싱만 검증하므로 백엔드 없이도 됩니다.

## 3. 실행

### 데이터 전략 — 실제 백엔드(8080) 연동

- Playwright 가 dev 서버를 **`VITE_USE_MOCKS=false`** 로 자동 기동합니다
  (`playwright.config.ts` 의 `webServer.env`). Vite 는 `process.env` 의 `VITE_*`
  변수를 `.env` 파일보다 우선 적용하므로 `.env` 를 건드리지 않아도 됩니다.
- 따라서 **테스트 실행 전 백엔드가 `http://localhost:8080` 에서 가동 중**이어야 합니다.
  - 주소 변경: `E2E_API_BASE_URL=http://other-host:8080 npm run test:e2e`
- 결과가 실제 DB 상태에 의존하므로, 스펙은 "행이 N개"가 아니라
  **"보이는 모든 행이 필터 조건과 일치한다", "목록 또는 빈 상태 중 하나로 수렴한다"**
  같은 **환경 내성(resilient)** 어서션으로 작성했습니다.

```bash
# 1) 백엔드(8080) 를 먼저 띄운다 (별도 프로젝트).
# 2) E2E 실행 (dev 서버는 Playwright 가 자동 기동/종료)
npm run test:e2e            # 헤드리스 전체 실행
npm run test:e2e:ui        # UI 모드(타임트래블 디버깅)
npm run test:e2e:headed    # 실제 브라우저 표시하며 실행
npm run test:e2e:report    # 직전 실행 HTML 리포트 열기

# 특정 파일/테스트만
npx playwright test logs.spec.ts
npx playwright test logs.spec.ts:12      # 해당 줄의 테스트만
npx playwright test -g "이상만"          # 제목으로 필터
```

> **⚠️ 5173 서버 모드 주의**
> 이미 `npm run dev` 가 5173 에서 떠 있으면(`reuseExistingServer`) Playwright 가 그 서버를
> 재사용합니다. 그 서버가 **mock 모드**(`.env` 의 `VITE_USE_MOCKS=true`)면 필터 결과 검증이
> 잘못 실패합니다. E2E 시에는 **본인이 띄운 dev 서버를 끄고** Playwright 가 직접
> `false` 모드로 기동하게 두세요. (5173 이 비어 있으면 자동으로 그렇게 동작합니다.)

---

## 4. VSCode 확장 연계 (`ms-playwright.playwright`)

이 머신에는 공식 확장 **Playwright Test for VSCode (`ms-playwright.playwright`)** 가
이미 설치되어 있습니다. `playwright.config.ts` 를 자동 인식하므로 추가 설정이 필요 없습니다.

### 사용법

1. **Testing 사이드바 열기** — 좌측 액티비티 바의 플라스크(🧪) 아이콘. 트리에 `e2e/` 의
   모든 테스트가 TC ID 별로 보입니다.
2. **실행/디버그** — 각 테스트(또는 파일/describe) 옆 ▶ 로 단건 실행, 디버그 아이콘으로
   중단점 디버깅. 실패하면 에디터 줄 옆에 에러가 인라인 표시됩니다.
3. **`Show browser`** — Testing 사이드바 하단 **PLAYWRIGHT** 패널에서 체크하면 실행 과정을
   실제 브라우저로 보면서 watch 할 수 있습니다.
4. **`Pick locator`** — 같은 패널의 버튼. 브라우저에서 요소를 클릭하면 추천 로케이터를
   만들어 줍니다(스펙 작성 시 유용).
5. **`Record new` / `Record at cursor`** — 사용자의 클릭을 코드로 기록해 새 테스트 초안 생성.
6. **프로젝트 선택** — PLAYWRIGHT 패널의 Projects 에서 `chromium` 체크.

### 연계 시에도 동일하게 적용되는 것

- 확장이 테스트를 돌릴 때도 `webServer` 설정을 그대로 사용 → dev 서버를 `false` 모드로
  자동 기동합니다. 따라서 **백엔드(8080)는 여전히 직접 띄워 두어야** 합니다.
- 5173 서버 모드 주의사항(위 ⚠️)도 동일하게 적용됩니다.

> 확장이 설정을 못 잡으면: 명령 팔레트(Ctrl+Shift+P) → **"Test: Refresh Tests"** 또는
> **"Playwright: Select Configuration"** 으로 `playwright.config.ts` 를 지정하세요.

---

## 5. 테스트 케이스 ↔ 스펙 매핑

| TC | 항목 | 파일 |
|----|------|------|
| TC-001~003 | 라우팅/리다이렉트/네비게이션 | `routing.spec.ts` |
| TC-004 | 테마 토글 유지 | `theme.spec.ts` |
| TC-005, TC-008 | 대시보드 로드 / 전체 보기 링크 | `dashboard.spec.ts` |
| TC-006, TC-007 | 대시보드 빈/에러 상태 | `dashboard.spec.ts` (`fixme`) |
| TC-009~017 | 로그 로드/필터/검색/페이지네이션/상세이동/빈상태 | `logs.spec.ts` |
| TC-018~023 | 분석 로드/아코디언/필터/검색/상세링크/빈상태 | `analyses.spec.ts` |
| TC-024, TC-026, TC-027 | 분석 상세 진입/잘못된ID/뒤로 | `analysis-detail.spec.ts` |
| TC-025 | 분석 전/대상아님/정상 분기 | `analysis-detail.spec.ts` (`fixme`) |
| TC-028 | 패턴 목록 로드 | `patterns.spec.ts` |
| TC-029 | 패턴 빈 상태 | `patterns.spec.ts` (`fixme`) |

## 6. `fixme` / 조건부 `skip`

- **`fixme` (TC-006/007/025/029)** — 빈 DB·백엔드 다운·특정 상태 시드 logId 등 특수한
  백엔드 상태를 강제해야 재현 가능. 실DB E2E 에서 결정론적으로 재현할 수 없어 표시만 해 둠.
  전용 시드/모의 환경에서 활성화하세요. (네트워크 가로채기 방식으로 전환하면 이 케이스들도
  결정론적으로 구현 가능합니다 — 필요 시 요청.)
- **조건부 `skip`** — 데이터가 있어야 의미 있는 케이스(행 클릭→상세, 2페이지 이동 등)는
  목록이 비어 있으면 런타임에 `test.skip` 으로 건너뜁니다. 백엔드에 데이터가 있으면 수행됩니다.
