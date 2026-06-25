import { test, expect } from "@playwright/test";
import { navLink } from "./helpers";

// 공통/라우팅 — 백엔드 데이터와 무관하게 성립(대시보드 호출 실패는 앱이 swallow).
test.describe("라우팅 / 네비게이션", () => {
  test("TC-001 루트('/') 접속 시 /dashboard 로 리다이렉트", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(navLink(page, "대시보드")).toHaveClass(/active/);
  });

  test("TC-002 알 수 없는 경로는 /dashboard 로 리다이렉트", async ({ page }) => {
    await page.goto("/foo/bar/does-not-exist");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("TC-003 사이드 네비로 각 화면 이동 + 활성 표시", async ({ page }) => {
    await page.goto("/dashboard");

    await navLink(page, "시스템 로그").click();
    await expect(page).toHaveURL(/\/logs/);
    await expect(navLink(page, "시스템 로그")).toHaveClass(/active/);

    await navLink(page, "주의 로그 분석").click();
    await expect(page).toHaveURL(/\/analyses/);
    await expect(navLink(page, "주의 로그 분석")).toHaveClass(/active/);

    await navLink(page, "패턴 분석").click();
    await expect(page).toHaveURL(/\/patterns/);
    await expect(navLink(page, "패턴 분석")).toHaveClass(/active/);
  });
});
