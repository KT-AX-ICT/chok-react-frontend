import { test, expect } from "@playwright/test";
import { analysisRows, waitForListSettled } from "./helpers";

test.describe("주의 로그 AI 분석", () => {
  test("TC-018 분석 목록 정상 로드", async ({ page }) => {
    await page.goto("/analyses");
    await expect(page.locator(".page-header-title")).toContainText("주의 로그 AI 분석");
    await waitForListSettled(page, analysisRows(page));
  });

  test("TC-019 아코디언 펼치기/접기", async ({ page }) => {
    await page.goto("/analyses");
    const hasRows = await waitForListSettled(page, analysisRows(page));
    test.skip(!hasRows, "분석 데이터 없음");

    const firstRow = analysisRows(page).first();
    const panel = page.locator(".accordion-panel");

    await expect(panel).toHaveCount(0);
    await firstRow.click();
    await expect(page.locator(".accordion-panel").first()).toBeVisible();

    await firstRow.click();
    await expect(page.locator(".accordion-panel")).toHaveCount(0);
  });

  test("TC-020 위험도 필터(현재 페이지 내): 보이는 행이 선택 위험도와 일치", async ({ page }) => {
    await page.goto("/analyses");
    await waitForListSettled(page, analysisRows(page));

    await page.getByRole("combobox").selectOption("긴급");
    await expect(page).toHaveURL(/risk=%EA%B8%B4%EA%B8%89|risk=긴급/);

    const rows = analysisRows(page);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      // 행의 위험도 배지가 '긴급'.
      await expect(rows.nth(i).locator(".badge").first()).toHaveText("긴급");
    }
  });

  test("TC-021 키워드 검색(서버): Enter 시 q 반영", async ({ page }) => {
    await page.goto("/analyses");
    const input = page.getByPlaceholder("요약·분석·대응 검색 후 Enter...");
    await input.fill("이상");
    await input.press("Enter");

    await expect(page).toHaveURL(/q=/);
    await waitForListSettled(page, analysisRows(page));
  });

  test("TC-022 '상세 →' 링크: 아코디언 토글 없이 상세로 이동", async ({ page }) => {
    await page.goto("/analyses");
    const hasRows = await waitForListSettled(page, analysisRows(page));
    test.skip(!hasRows, "분석 데이터 없음");

    await analysisRows(page).first().getByRole("link", { name: /상세/ }).click();
    await expect(page).toHaveURL(/\/analyses\/\d+/);
    // 아코디언이 아니라 상세 화면.
    await expect(page.getByText(/LOG #\d+/)).toBeVisible();
  });

  test("TC-023 분석 빈 상태: 매칭 없는 키워드", async ({ page }) => {
    await page.goto("/analyses?q=zzz_no_such_analysis_zzz");
    await expect(page.getByText("표시할 분석 결과가 없습니다.")).toBeVisible();
  });
});
