import { test, expect } from "@playwright/test";

test.describe("대시보드", () => {
  test("TC-005 대시보드 정상 로드(통계 카드 + 카드 타이틀)", async ({ page }) => {
    await page.goto("/dashboard");

    // 통계 카드 라벨.
    await expect(page.getByText("최근 24시간 총 로그")).toBeVisible();
    await expect(page.getByText("최근 24시간 주의 로그").first()).toBeVisible();
    // 주요 섹션 카드.
    await expect(page.getByText("시간대별 로그 발생량")).toBeVisible();
    await expect(page.getByText("위험도 분포")).toBeVisible();
    await expect(page.getByText("반복 탐지 패턴")).toBeVisible();
  });

  test("TC-008 대시보드 '전체 보기' 링크 이동", async ({ page }) => {
    await page.goto("/dashboard");

    // 통계 카드 → 로그.
    await page.locator(".stat-card").getByRole("link", { name: /전체 보기/ }).click();
    await expect(page).toHaveURL(/\/logs/);

    await page.goto("/dashboard");
    // 주의 로그 카드 → 분석.
    await page.getByText("최근 24시간 주의 로그").locator("xpath=ancestor::*[contains(@class,'ui-card')]")
      .getByRole("link", { name: /전체 보기/ }).click();
    await expect(page).toHaveURL(/\/analyses/);

    await page.goto("/dashboard");
    // 반복 탐지 패턴 카드 → 패턴.
    await page.getByText("반복 탐지 패턴").locator("xpath=ancestor::*[contains(@class,'ui-card')]")
      .getByRole("link", { name: /전체 보기/ }).click();
    await expect(page).toHaveURL(/\/patterns/);
  });

  // TC-006 빈 상태 / TC-007 에러 상태는 백엔드 데이터/가용성에 의존(빈 DB·서버 다운).
  // 실DB E2E에서 결정론적으로 재현 불가 → 전용 환경에서만 수행. 문서화용으로 남겨둔다.
  test.fixme("TC-006 대시보드 빈 상태(빈 DB 필요)", async () => {});
  test.fixme("TC-007 대시보드 에러 상태(백엔드 다운 필요)", async () => {});
});
