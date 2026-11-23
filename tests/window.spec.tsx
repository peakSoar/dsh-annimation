// @vitest-environment jsdom
/**
 * Render-level checks for the window chrome: the panel renders the embedded
 * page, its status chip and its controls; the minimized state renders the pill
 * instead of the panel.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { attachLocale } from "../src/client/i18n.ts";
import { DEFAULT_SETTINGS } from "../src/client/settings.ts";
import { HongguoWindow } from "../src/client/window.tsx";

const noop = (): void => {};

/** Pin the UI language to Chinese; jsdom's navigator would otherwise pick English. */
let detachLocale: (() => void) | undefined;
beforeAll(() => {
  detachLocale = attachLocale({
    register: () => () => {},
    getLocale: () => ({ active: "zh", revision: 0 }),
    subscribe: () => () => {},
  });
});
afterAll(() => {
  detachLocale?.();
});

/** Render the panel with sensible defaults. */
function render(overrides: Partial<Parameters<typeof HongguoWindow>[0]> = {}): string {
  return renderToString(
    <HongguoWindow
      open
      minimized={false}
      working
      settings={DEFAULT_SETTINGS}
      resetToken={0}
      onClose={noop}
      onMinimize={noop}
      onRestore={noop}
      onOpenSettings={noop}
      {...overrides}
    />,
  );
}

describe("HongguoWindow", () => {
  it("renders the embedded page, status and controls", () => {
    const html = render();
    expect(html).toContain("红果短剧");
    expect(html).toContain("工作中");
    expect(html).toContain(`src="${DEFAULT_SETTINGS.url}"`);
    expect(html).toContain("正在打开红果短剧");
    // Five window controls: reload, settings, external, minimize, close.
    expect(html.match(/hgw-icon/g) ?? []).toHaveLength(5);
    expect(html).not.toContain("hgw-blocked-card");
  });

  it("shows the idle chip when no turn runs", () => {
    const html = render({ working: false });
    expect(html).toContain("空闲");
    expect(html).not.toContain("工作中");
  });

  it("renders the pill when minimized", () => {
    const html = render({ minimized: true });
    expect(html).toContain("hgw-pill");
    expect(html).not.toContain("hgw-panel");
    expect(html).not.toContain("<iframe");
  });

  it("renders nothing while closed", () => {
    expect(render({ open: false })).toBe("");
  });
});
