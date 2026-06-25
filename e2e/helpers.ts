import { expect, type Locator, type Page } from "@playwright/test";

/**
 * 공통 헬퍼.
 *
 * 실제 백엔드(8080) 연동이라 데이터가 환경마다 다르다. 그래서 "행이 N개" 같은
 * 단정 대신 "목록 또는 빈 상태 중 하나가 떴다", "보이는 모든 행이 조건과 일치한다"
 * 처럼 데이터 양과 무관하게 성립하는 어서션을 쓴다.
 */

/** 좌측 사이드 네비의 메뉴 링크. */
export function navLink(page: Page, label: string): Locator {
  return page.locator(".side-nav").getByRole("link", { name: label });
}

/** 로그 표의 본문 행들. */
export function logRows(page: Page): Locator {
  return page.locator("table tbody tr");
}

/** 분석 목록의 행들(아코디언 헤더). */
export function analysisRows(page: Page): Locator {
  return page.locator(".analysis-row");
}

/**
 * 목록 화면 진입 후 "데이터 행" 또는 "빈 상태(.state-box)" 중 하나가 보일 때까지 대기.
 * 로딩 스피너가 사라지고 결과가 확정된 시점을 보장한다.
 * @returns 행이 1개 이상이면 true, 빈 상태면 false.
 */
export async function waitForListSettled(page: Page, rowLocator: Locator): Promise<boolean> {
  const emptyOrError = page.locator(".state-box");
  await expect(rowLocator.first().or(emptyOrError.first())).toBeVisible();
  return (await rowLocator.count()) > 0;
}
