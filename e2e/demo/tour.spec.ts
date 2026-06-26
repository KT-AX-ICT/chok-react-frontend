import { test, expect } from "@playwright/test";
import { navLink, logRows, analysisRows } from "../helpers";
import {
  installCursor,
  clickLike,
  typeLike,
  selectLike,
  scrollSlowly,
  scrollThroughOver,
  pause,
  BEAT,
} from "./cursor";

/**
 * CHOK 시연(demo) 시나리오 — "사람이 직접 둘러보는 것처럼" 한 바퀴.
 *
 * 일반 E2E(e2e/*.spec.ts)와 목적이 다르다:
 *  - 검증보다 '시연'이 목적. 가짜 커서가 천천히 움직이고, 동작 사이에 2~3초 텀을 둬서
 *    영상으로 보기 좋게 만든다.
 *  - 전용 설정(playwright.demo.config.ts)으로만 실행한다: 헤디드 + slowMo + 고해상도 영상.
 *
 * 실행:  npm run test:e2e:demo      (실행 후 영상은 test-results/ 아래 .webm)
 *        백엔드(8080)가 떠 있어야 데이터가 보인다.
 *
 * 시나리오 흐름:
 *  대시보드(+ 중간에 라이트↔다크 테마 전환) → 시스템 로그(레벨/이상만 필터·검색·상세)
 *  → 주의 로그 분석(아코디언·검색·필터) → 패턴 분석(전체 스크롤) → 대시보드 복귀
 */
test.describe("CHOK 시연 투어", () => {
  // 동작마다 텀을 둬서 한 테스트가 길다. 넉넉히.
  test.setTimeout(5 * 60_000);

  test.beforeEach(async ({ page }) => {
    await installCursor(page);
  });

  test("전체 둘러보기", async ({ page }) => {
    // ── 1. 대시보드: 첫인상 + 대기 중간에 라이트↔다크 테마 전환 ────────────────
    // (통계 카드·차트는 표시 전용이라 클릭하지 않고 스크롤로 천천히 보여준다.)
    await test.step("대시보드 진입 (중간에 테마 전환)", async () => {
      await page.goto("/dashboard");
      await expect(page.getByText("최근 24시간 총 로그")).toBeVisible();
      await pause(page, 3000); // 화면이 뜨는 걸 잠깐 감상.

      await scrollSlowly(page, 600); // 차트들을 훑으며 내려간다.
      await pause(page, 2000);

      // 기다리는 시간 중간에 자연스럽게 테마를 전환해 보여준다(라이트 → 다시 다크).
      const toggle = page.locator(".theme-toggle");
      await clickLike(page, toggle, { settle: 0 });
      await pause(page, 2500); // 라이트 모드 감상.
      await clickLike(page, toggle, { settle: 0 });
      await pause(page, 2000); // 다시 다크 모드.

      await scrollSlowly(page, -600); // 다시 위로.
      await pause(page, 1500);
    });

    // ── 2. 시스템 로그: 사이드바로 이동 → 필터/검색 → 상세 진입 ───────────────
    await test.step("시스템 로그로 이동", async () => {
      await clickLike(page, navLink(page, "시스템 로그"));
      await expect(page).toHaveURL(/\/logs/);
      await expect(page.locator(".page-header-title")).toContainText("시스템 로그");
    });

    await test.step("레벨 필터: FATAL 만 보기 (천천히 선택)", async () => {
      // before 를 키워 드롭다운에서 옵션을 고르는 동작을 더 느리게 보여준다.
      await selectLike(page, page.getByRole("combobox"), "FATAL", { before: 1800 });
      await expect(page).toHaveURL(/level=FATAL/);
    });

    await test.step("레벨 필터 해제", async () => {
      await selectLike(page, page.getByRole("combobox"), "ALL", { before: 1200 });
      await expect(page).not.toHaveURL(/level=/);
    });

    await test.step("'이상만' 토글: 이상 로그만 보기", async () => {
      await clickLike(page, page.getByRole("button", { name: "이상만" }));
      await expect(page).toHaveURL(/abnormal=1/);
      await pause(page, 1500);
    });

    // '이상만'이 켜진 상태라 모든 행이 이상 로그(빨간 마커 .row-marker)다.
    // 그 중 빨간 마커가 있는 행을 골라 상세로 진입한다.
    const redRows = page.locator("table tbody tr").filter({ has: page.locator(".row-marker") });
    let openedDetail = false;
    await test.step("빨간 이상 로그 → 상세 보기", async () => {
      if ((await redRows.count()) === 0) return; // 이상 로그가 없으면 건너뜀.
      await clickLike(page, redRows.first());
      if (/\/analyses\/\d+/.test(page.url())) {
        openedDetail = true;
        await expect(page.getByText("원본 로그")).toBeVisible();
        // 상세 본문은 표시 전용 → 짧게 한 번 훑고 나온다.
        await pause(page, 1200);
        await scrollSlowly(page, 500, 5);
        await pause(page, 1200);
        await scrollSlowly(page, -500, 5);
        await pause(page, 800);
      }
    });

    await test.step("상세에서 뒤로", async () => {
      if (!openedDetail) return;
      await clickLike(page, page.getByRole("button", { name: "뒤로" }));
      await expect(page).toHaveURL(/\/logs/);
    });

    await test.step("'이상만' 해제", async () => {
      await clickLike(page, page.getByRole("button", { name: "이상만" }));
      await expect(page).not.toHaveURL(/abnormal=1/);
    });

    await test.step("키워드 검색: 'rts'", async () => {
      const search = page.getByPlaceholder("내용 검색 후 Enter...");
      await typeLike(page, search, "rts");
      await pause(page, 800);
      await search.press("Enter");
      await pause(page);
    });

    // ── 3. 주의 로그 분석: 아코디언 펼치기 → 위험도 필터 ──────────────────────
    await test.step("주의 로그 분석으로 이동", async () => {
      await clickLike(page, navLink(page, "주의 로그 분석"));
      await expect(page).toHaveURL(/\/analyses/);
      await expect(page.locator(".page-header-title")).toContainText("주의 로그 AI 분석");
    });

    await test.step("분석 카드 펼쳐 보기(아코디언)", async () => {
      if ((await analysisRows(page).count()) === 0) return;
      await clickLike(page, analysisRows(page).first());
      const panel = page.locator(".accordion-panel").first();
      if (await panel.isVisible().catch(() => false)) {
        await pause(page, 3000); // 펼쳐진 분석 내용을 읽는 시간.
        // 다시 접기.
        await clickLike(page, analysisRows(page).first());
      }
    });

    await test.step("키워드 검색: '통신'", async () => {
      const search = page.getByPlaceholder("요약·분석·대응 검색 후 Enter...");
      await typeLike(page, search, "통신");
      await pause(page, 800);
      await search.press("Enter");
      await pause(page);
    });

    await test.step("위험도 필터: 긴급", async () => {
      // 분석 페이지는 콤보박스가 2개(위험도/패턴) → 위험도 셀렉트만 선택.
      const riskSelect = page.getByRole("combobox").filter({ hasText: "위험도" });
      await selectLike(page, riskSelect, "긴급");
      await expect(page).toHaveURL(/risk=/);
    });

    // ── 4. 패턴 분석 ──────────────────────────────────────────────────────────
    await test.step("패턴 분석으로 이동", async () => {
      await clickLike(page, navLink(page, "패턴 분석"));
      await expect(page).toHaveURL(/\/patterns/);
      await expect(page.locator(".page-header-title")).toContainText("패턴 클러스터");
      // 패턴 화면 전체를 약 5초에 걸쳐 천천히 스크롤로 보여준다(표시 전용 → 클릭 없음).
      await pause(page, 1500);
      await scrollThroughOver(page, 5000);
      await pause(page, 1500);
    });

    // ── 5. 대시보드 복귀로 마무리 ─────────────────────────────────────────────
    await test.step("대시보드로 복귀", async () => {
      await clickLike(page, navLink(page, "대시보드"));
      await expect(page).toHaveURL(/\/dashboard/);
      await pause(page, BEAT);
    });
  });
});
