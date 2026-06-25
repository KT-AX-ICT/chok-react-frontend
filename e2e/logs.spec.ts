import { test, expect } from "@playwright/test";
import { logRows, waitForListSettled } from "./helpers";

test.describe("시스템 로그", () => {
  test("TC-009 로그 목록 정상 로드", async ({ page }) => {
    await page.goto("/logs");
    await expect(page.locator(".page-header-title")).toContainText("시스템 로그");
    // 목록 또는 빈 상태 중 하나로 수렴(로딩 종료 보장).
    await waitForListSettled(page, logRows(page));
  });

  test("TC-010 레벨 필터: 보이는 모든 행이 선택 레벨과 일치", async ({ page }) => {
    await page.goto("/logs");
    await page.getByRole("combobox").selectOption("ERROR");

    await expect(page).toHaveURL(/level=ERROR/);
    await expect(page.getByRole("combobox")).toHaveValue("ERROR");

    const hasRows = await waitForListSettled(page, logRows(page));
    if (hasRows) {
      const rows = logRows(page);
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        // 레벨 컬럼 배지 = ERROR (백엔드가 logLevel 로 필터).
        await expect(rows.nth(i).locator(".badge").first()).toHaveText("ERROR");
      }
    }
  });

  test("TC-011 '이상만' 토글: active + URL 반영", async ({ page }) => {
    await page.goto("/logs");
    const button = page.getByRole("button", { name: "이상만" });

    await button.click();
    await expect(page).toHaveURL(/abnormal=1/);
    await expect(button).toHaveClass(/active/);

    // 다시 누르면 해제.
    await button.click();
    await expect(page).not.toHaveURL(/abnormal=1/);
    await expect(button).not.toHaveClass(/active/);
  });

  test("TC-012 날짜 필터: 헤더 note가 선택 날짜로 변경", async ({ page }) => {
    const date = "2026-06-04";
    await page.goto(`/logs?date=${date}`);
    await expect(page.getByText(`${date} 수집 로그`)).toBeVisible();
    // 날짜 선택 시 '최근 24시간' 토글은 비활성.
    await expect(page.getByRole("button", { name: "최근 24시간" })).not.toHaveClass(/active/);
  });

  test("TC-013 키워드 검색: Enter 시 q 파라미터 반영", async ({ page }) => {
    await page.goto("/logs");
    const input = page.getByPlaceholder("내용 검색 후 Enter...");
    await input.fill("error");
    await input.press("Enter");

    await expect(page).toHaveURL(/q=error/);
    await waitForListSettled(page, logRows(page)); // 결과 또는 빈 상태로 수렴
  });

  test("TC-014 페이지네이션: 2페이지 이동(데이터 20건 초과 시)", async ({ page }) => {
    await page.goto("/logs");
    const hasRows = await waitForListSettled(page, logRows(page));
    test.skip(!hasRows, "로그 데이터 없음");

    const page2 = page.locator(".pagination-page", { hasText: /^2$/ });
    test.skip((await page2.count()) === 0, "단일 페이지(20건 이하) — 페이지네이션 없음");

    await page2.first().click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator(".pagination-page.active")).toHaveText("2");
  });

  test("TC-015 필터 상태 URL 복원: 새로고침 후 유지", async ({ page }) => {
    await page.goto("/logs?level=ERROR&abnormal=1&q=fatal");
    await page.reload();

    await expect(page.getByRole("combobox")).toHaveValue("ERROR");
    await expect(page.getByRole("button", { name: "이상만" })).toHaveClass(/active/);
    await expect(page.getByPlaceholder("내용 검색 후 Enter...")).toHaveValue("fatal");
  });

  test("TC-016 로그 행 클릭 → 분석 상세 이동", async ({ page }) => {
    await page.goto("/logs");
    const hasRows = await waitForListSettled(page, logRows(page));
    test.skip(!hasRows, "로그 데이터 없음");

    await logRows(page).first().click();
    await expect(page).toHaveURL(/\/analyses\/\d+/);
    // 상세 헤더의 LOG #id 표기.
    await expect(page.getByText(/LOG #\d+/)).toBeVisible();
  });

  test("TC-017 로그 빈 상태: 매칭 없는 키워드", async ({ page }) => {
    await page.goto("/logs?q=zzz_no_such_log_zzz");
    await expect(page.getByText("표시할 로그가 없습니다.")).toBeVisible();
  });
});
