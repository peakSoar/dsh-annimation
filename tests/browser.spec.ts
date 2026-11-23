// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  attachSidebarRight,
  closeDouyin,
  hasSidebarRight,
  openDouyin,
  ownedTabId,
  type SidebarRightService,
} from "../src/client/browser.ts";

/** Controller double recording calls. */
function service(): SidebarRightService & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    openTab(kind, options) {
      calls.push(`open:${kind}:${options?.params?.url ?? ""}`);
    },
    active: () => ({ id: "tab7", kind: "browser" }),
    float(tabId) {
      calls.push(`float:${tabId}`);
    },
    dock(paneId) {
      calls.push(`dock:${paneId}`);
    },
    close(tabId) {
      calls.push(`close:${tabId}`);
    },
  };
}

describe("sidebar bridge", () => {
  it("opens a browser tab, floats it and remembers it", () => {
    const svc = service();
    const detach = attachSidebarRight(svc);
    expect(hasSidebarRight()).toBe(true);
    openDouyin("https://www.douyin.com/");
    expect(svc.calls).toEqual(["open:browser:https://www.douyin.com/", "float:tab7"]);
    expect(ownedTabId()).toBe("tab7");
    closeDouyin();
    expect(svc.calls).toContain("close:tab7");
    expect(ownedTabId()).toBeUndefined();
    detach();
    expect(hasSidebarRight()).toBe(false);
  });

  it("ignores a focused tab that is not a browser", () => {
    const svc = service();
    const detach = attachSidebarRight({ ...svc, active: () => ({ id: "tab9", kind: "files" }) });
    openDouyin("https://www.douyin.com/");
    expect(svc.calls).toEqual(["open:browser:https://www.douyin.com/"]);
    expect(ownedTabId()).toBeUndefined();
    detach();
  });

  it("falls back to an external window only when asked", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    openDouyin("https://www.douyin.com/", false);
    expect(open).not.toHaveBeenCalled();
    openDouyin("https://www.douyin.com/", true);
    expect(open).toHaveBeenCalledTimes(1);
    open.mockRestore();
  });

  it("closes nothing when no tab was opened", () => {
    const svc = service();
    const detach = attachSidebarRight(svc);
    closeDouyin();
    expect(svc.calls).toEqual([]);
    detach();
  });
});
