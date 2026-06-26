import { type Locator, type Page } from "@playwright/test";

/**
 * 시연(demo)용 "사람처럼 보이는" 조작 헬퍼.
 *
 * 핵심 아이디어
 *  - 브라우저 안에 가짜 커서 DOM 을 주입해 영상에서 마우스가 보이게 한다
 *    (Playwright 의 실제 마우스에는 OS 커서가 영상에 안 찍히므로).
 *  - page.mouse.move(x, y, { steps }) 로 목표까지 '여러 단계'에 걸쳐 이동하면
 *    중간 mousemove 이벤트가 발생하고, 가짜 커서가 그 경로를 따라 부드럽게 흐른다.
 *  - 동작과 동작 사이에 pause() 로 2~3초 텀을 둬서 사람이 보고 판단하는 듯한 리듬을 만든다.
 */

/** 동작 간 기본 대기(ms). 사람이 화면을 '보는' 시간. */
export const BEAT = 2500;

/** 가짜 커서를 페이지에 설치한다. test 시작 시 page 마다 1회 호출. */
export async function installCursor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // 같은 document 안에서 중복 설치 방지(SPA 라우팅은 같은 document).
    if ((window as unknown as { __cursorInstalled?: boolean }).__cursorInstalled) return;
    (window as unknown as { __cursorInstalled?: boolean }).__cursorInstalled = true;

    const install = () => {
      const cursor = document.createElement("div");
      cursor.id = "__demo_cursor";
      Object.assign(cursor.style, {
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        background: "rgba(0, 122, 255, 0.35)",
        border: "2px solid rgba(0, 122, 255, 0.95)",
        boxShadow: "0 0 10px 2px rgba(0, 122, 255, 0.6)",
        zIndex: "2147483647",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        transition: "transform 0.09s ease-out, background 0.15s ease-out",
      } as Partial<CSSStyleDeclaration>);
      document.body.appendChild(cursor);

      const move = (e: MouseEvent) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
      };
      // 누를 때 빨갛게 + 살짝 작아지는 '클릭 피드백'.
      const down = () => {
        cursor.style.background = "rgba(255, 59, 48, 0.55)";
        cursor.style.transform = "translate(-50%, -50%) scale(0.8)";
      };
      const up = () => {
        cursor.style.background = "rgba(0, 122, 255, 0.35)";
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
      };
      document.addEventListener("mousemove", move, true);
      document.addEventListener("mousedown", down, true);
      document.addEventListener("mouseup", up, true);
    };

    if (document.body) install();
    else document.addEventListener("DOMContentLoaded", install);
  });
}

/** 사람이 화면을 보는 듯한 텀. 기본 2.5초. */
export function pause(page: Page, ms: number = BEAT): Promise<void> {
  return page.waitForTimeout(ms);
}

/** 대상 요소 중앙으로 커서를 '천천히' 이동(클릭은 안 함). */
export async function moveTo(page: Page, locator: Locator, steps: number = 28): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("시연 대상 요소의 위치를 찾을 수 없습니다.");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  // steps 가 클수록 더 부드럽고 느리게 흐른다.
  await page.mouse.move(x, y, { steps });
}

/**
 * 사람처럼: 커서를 천천히 옮겨 잠깐 머문 뒤(hover) 클릭하고, 다시 텀을 둔다.
 * @param settle 클릭 후 화면이 바뀐 걸 '보는' 시간.
 */
export async function clickLike(
  page: Page,
  locator: Locator,
  opts: { hover?: number; settle?: number; steps?: number } = {}
): Promise<void> {
  const { hover = 600, settle = BEAT, steps = 28 } = opts;
  await moveTo(page, locator, steps);
  await page.waitForTimeout(hover); // 누르기 직전 잠깐 머뭇.
  await locator.click();
  await page.waitForTimeout(settle);
}

/** 사람처럼: 입력칸으로 이동→클릭→한 글자씩 타이핑. (Enter 등은 호출부에서.) */
export async function typeLike(
  page: Page,
  locator: Locator,
  text: string,
  opts: { delay?: number; settle?: number } = {}
): Promise<void> {
  const { delay = 130, settle = 800 } = opts;
  await clickLike(page, locator, { settle });
  await locator.pressSequentially(text, { delay });
}

/**
 * 클릭 없이 페이지를 '천천히 보여주는' 스크롤.
 * 반응이 없는 표시용 컴포넌트(차트·카드·상세 본문)는 조작 대신 이걸로 훑는다.
 * @param totalY 총 스크롤량(px). 음수면 위로.
 */
export async function scrollSlowly(page: Page, totalY: number, steps: number = 8): Promise<void> {
  const per = Math.round(totalY / steps);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, per);
    await page.waitForTimeout(350);
  }
}

/**
 * 페이지 전체(바닥까지)를 durationMs 동안 천천히 스크롤로 훑어 보여준다.
 * 스크롤 양을 문서 높이에서 계산하므로 콘텐츠 길이에 상관없이 끝까지 보여준다.
 */
export async function scrollThroughOver(
  page: Page,
  durationMs: number,
  steps: number = 12
): Promise<void> {
  const distance = await page.evaluate(
    () => Math.max(0, document.body.scrollHeight - window.innerHeight)
  );
  const delay = Math.round(durationMs / steps);
  if (distance <= 0) {
    await page.waitForTimeout(durationMs); // 스크롤할 게 없으면 그냥 머문다.
    return;
  }
  const per = Math.round(distance / steps);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, per);
    await page.waitForTimeout(delay);
  }
}

/** 사람처럼: 셀렉트로 이동→잠깐 머문 뒤 옵션 선택→텀. */
export async function selectLike(
  page: Page,
  locator: Locator,
  value: string,
  opts: { settle?: number; before?: number } = {}
): Promise<void> {
  // before: 셀렉트에 커서를 올린 뒤 옵션을 고르기까지의 텀. 키우면 선택이 더 느리게 보인다.
  const { settle = BEAT, before = 600 } = opts;
  await moveTo(page, locator);
  await page.waitForTimeout(before);
  await locator.selectOption(value);
  await page.waitForTimeout(settle);
}
