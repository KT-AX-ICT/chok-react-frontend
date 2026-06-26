import { defineConfig, devices } from "@playwright/test";

/**
 * CHOK 시연(demo) 전용 설정.
 *
 * 일반 E2E(playwright.config.ts)와 분리한 이유:
 *  - 검증이 아니라 '사람이 조작하는 것처럼' 보이게 하는 게 목적.
 *  - 실제 브라우저를 띄우고(headless: false), slowMo 로 각 동작을 느리게,
 *    동작 사이 텀은 스펙(tour.spec.ts)의 pause() 가 담당한다.
 *  - 고해상도로 모든 과정을 영상(.webm)으로 남긴다.
 *
 * 실행:  npm run test:e2e:demo
 *        (데이터가 보이려면 백엔드 8080 이 가동 중이어야 함)
 *        실행 후 영상: test-results/<...>/video.webm
 */
export default defineConfig({
  testDir: "./e2e/demo",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["html", { open: "never" }], ["list"]],
  // 동작마다 2~3초 텀이 있어 한 투어가 길다. 넉넉히.
  timeout: 5 * 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: "http://localhost:5173",
    headless: false, // 실제 브라우저 창을 띄워 보여준다.
    viewport: { width: 1920, height: 1080 },
    video: { mode: "on", size: { width: 1920, height: 1080 } },
    trace: "off",
    screenshot: "off",
    locale: "ko-KR",
    // 모든 Playwright 동작에 지연을 더해 '사람처럼' 느리게.
    launchOptions: { slowMo: 350 },
  },

  projects: [
    // devices["Desktop Chrome"] 는 뷰포트를 1280×720 으로 강제하므로, 그 뒤에서
    // 뷰포트를 영상 크기(1920×1080)와 같게 덮어써야 영상에 여백(레터박스)이 안 생긴다.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } },
    },
  ],

  // 일반 설정과 동일하게 dev 서버를 mock=false 로 자동 기동. 백엔드(8080)는 별도.
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
