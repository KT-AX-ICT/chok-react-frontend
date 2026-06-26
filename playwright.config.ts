import { defineConfig, devices } from "@playwright/test";

/**
 * CHOK 프론트엔드 E2E 설정.
 *
 * 데이터 전략: 실제 백엔드(8080) 연동.
 *  - dev 서버를 VITE_USE_MOCKS=false 로 띄워 실제 API(/api/v1/**)를 호출한다.
 *  - 따라서 테스트 실행 전 백엔드가 http://localhost:8080 에서 가동 중이어야 한다.
 *    (E2E_API_BASE_URL 환경변수로 백엔드 주소를 바꿀 수 있다.)
 *  - 결과가 실제 DB 상태에 의존하므로, 스펙은 "개수"가 아니라 "보이는 행이
 *    필터 조건과 일치하는가" 같은 환경 내성 어서션으로 작성되어 있다.
 */
export default defineConfig({
  testDir: "./e2e",
  // 시연 전용 투어(e2e/demo)는 별도 설정(playwright.demo.config.ts)으로만 돌린다.
  testIgnore: "demo/**",
  // 데이터 의존 테스트의 흔들림을 줄이기 위해 직렬 실행(파일 간 병렬 off).
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on", // 성공/실패 무관하게 모든 테스트 녹화(.webm). 리포트의 각 테스트에 임베드된다.
    locale: "ko-KR",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  // dev 서버 자동 기동(프론트엔드만). 백엔드(8080)는 별도로 띄워야 한다.
  // Vite는 process.env 의 VITE_* 변수를 .env 파일보다 우선 적용하므로
  // 여기서 USE_MOCKS=false 를 주입하면 .env 의 true 를 덮어쓴다.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_USE_MOCKS: "false",
      VITE_API_BASE_URL: process.env.E2E_API_BASE_URL ?? "http://localhost:8080",
    },
  },
});
