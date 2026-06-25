import { test, expect } from "@playwright/test";

test.describe("패턴 클러스터", () => {
  test("TC-028 패턴 목록 정상 로드", async ({ page }) => {
    await page.goto("/patterns");
    await expect(page.locator(".page-header-title")).toContainText("패턴 클러스터");

    // 패턴 카드 또는 빈 상태 중 하나로 수렴.
    const cards = page.locator(".pattern-card");
    const empty = page.locator(".state-box");
    await expect(cards.first().or(empty.first())).toBeVisible();

    // 카드가 있으면 핵심 요소(발생 횟수 칩, 대표 로그)를 갖춘다.
    if ((await cards.count()) > 0) {
      await expect(cards.first().getByText(/회 발생/)).toBeVisible();
      await expect(cards.first().getByText("대표 로그")).toBeVisible();
    }
  });

  // TC-029 패턴 빈 상태는 빈 DB 환경 필요 → 전용 환경에서만 수행.
  test.fixme("TC-029 패턴 빈 상태(빈 DB 필요)", async () => {});
});
