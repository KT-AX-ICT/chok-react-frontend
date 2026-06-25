import { test, expect } from "@playwright/test";
import { logRows, waitForListSettled } from "./helpers";

test.describe("분석 상세", () => {
  test("TC-024 상세 진입: 원본 로그 + (분석 결과 또는 상태 안내) 표시", async ({ page }) => {
    await page.goto("/logs");
    const hasRows = await waitForListSettled(page, logRows(page));
    test.skip(!hasRows, "로그 데이터 없음");

    await logRows(page).first().click();
    await expect(page).toHaveURL(/\/analyses\/\d+/);

    // 원본 로그 카드는 상태와 무관하게 항상 표시.
    await expect(page.getByText("원본 로그")).toBeVisible();

    // 분석 완료면 'AI 요약' 카드, 아니면 EmptyState 안내 중 하나가 보인다(4-state 분기).
    const analysisCard = page.getByText("위험도 · AI 요약");
    const emptyHint = page.locator(".state-box");
    await expect(analysisCard.or(emptyHint.first())).toBeVisible();
  });

  test("TC-026 잘못된 logId(숫자 아님) → 에러 메시지", async ({ page }) => {
    await page.goto("/analyses/abc");
    await expect(page.getByText("로그 ID가 올바르지 않습니다.")).toBeVisible();
  });

  test("TC-027 상세에서 '뒤로' → 직전 화면 복귀", async ({ page }) => {
    await page.goto("/logs");
    const hasRows = await waitForListSettled(page, logRows(page));
    test.skip(!hasRows, "로그 데이터 없음");

    await logRows(page).first().click();
    await expect(page).toHaveURL(/\/analyses\/\d+/);

    await page.getByRole("button", { name: "뒤로" }).click();
    await expect(page).toHaveURL(/\/logs/);
  });

  // TC-025 분석 전 / 분석 대상 아님 / 정상 판정 — 각 상태를 보장하는 logId 가 필요하다.
  // 실DB E2E에서는 해당 상태의 데이터 존재를 단정할 수 없어 전용 시드 환경에서만 수행.
  test.fixme("TC-025 분석 전/대상아님/정상 상태 분기(상태별 시드 logId 필요)", async () => {});
});
