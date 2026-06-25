import { test, expect } from "@playwright/test";

// TC-004 다크/라이트 테마 토글 — localStorage 'theme' 단일 출처, 새로고침 후 유지.
test("TC-004 테마 토글 후 새로고침해도 유지", async ({ page }) => {
  await page.goto("/dashboard");

  const html = page.locator("html");
  const toggle = page.locator(".theme-toggle");

  const before = await html.getAttribute("data-theme");
  await toggle.click();

  const after = await html.getAttribute("data-theme");
  expect(after).not.toBe(before);

  // 새로고침 후에도 전환된 테마 유지(FOUC 방지 선반영 포함).
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", after!);

  const stored = await page.evaluate(() => localStorage.getItem("theme"));
  expect(stored).toBe(after);
});
