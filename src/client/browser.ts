/**
 * Bridge to the shell's native Browser tab (`ctx.sidebarRight`).
 *
 * Douyin refuses to render inside a cross-origin iframe (it answers with a
 * slider-captcha intermediate page), so the floating window is not an iframe:
 * the plugin asks the shell to open a Browser tab and floats that tab into a
 * draggable native panel. On Desktop the tab is an Electron `<webview>`, so
 * login, cookies and video playback behave like a real browser.
 *
 * The controller API (from @deepseek-ai/dsh-client-ui-sidebar-right):
 *   openTab("browser", { params: { url } })  — open or reveal a tab
 *   active()                                  — the focused tab record
 *   float(tabId, rect?)                       — move a docked tab into a float
 *   dock(paneId)                              — send a float back to the column
 *   close(tabId)                              — close one tab
 *
 * The shell's default float rectangle is a small cascade tile. Douyin needs a
 * portrait viewport, so the bridge floats with an explicit rectangle and, when
 * a previous run left a tiny float behind, re-docks and re-floats it once.
 */

/** Tab record subset this bridge reads. */
export interface BrowserTab {
  id: string;
  kind?: string;
}

/** A floating-panel rectangle in viewport pixels. */
export interface FloatRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The shell's right-sidebar navigation controller subset. */
export interface SidebarRightService {
  openTab(kind: string, options?: { params?: { url?: string }; revealIfOpened?: boolean }): void;
  active(): BrowserTab | undefined;
  float(tabId: string, rect?: FloatRect): void;
  dock(paneId: string): void;
  close(tabId: string): void;
}

let service: SidebarRightService | undefined;
const listeners = new Set<() => void>();

/** The tab this plugin currently owns (last one it opened or revealed). */
let openedTab: string | undefined;

/** The portrait rectangle a fresh window should use. */
export function windowRect(): FloatRect {
  const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight;
  const width = Math.min(480, Math.max(360, viewportWidth - 80));
  const height = Math.min(780, Math.max(520, viewportHeight - 120));
  return {
    x: Math.max(24, viewportWidth - width - 24),
    y: 64,
    width,
    height,
  };
}

/** Publish the shell controller; the disposer detaches it. */
export function attachSidebarRight(next: SidebarRightService): () => void {
  service = next;
  for (const listener of [...listeners]) listener();
  return () => {
    if (service !== next) return;
    service = undefined;
    for (const listener of [...listeners]) listener();
  };
}

/** Observe controller attach/detach. */
export function onSidebarRightChanged(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Whether the native Browser tab API is available. */
export function hasSidebarRight(): boolean {
  return service !== undefined;
}

/** The floating pane element that currently holds a tab, if any. */
function floatingPane(tabId: string): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  for (const pane of document.querySelectorAll<HTMLElement>("[data-dockkit-float]")) {
    const tab = pane.querySelector(`[data-dockkit-tab="${tabId}"], [data-sidebar-right-tab="${tabId}"]`);
    if (tab !== null) return pane;
  }
  return undefined;
}

/** Float a docked tab with the portrait rectangle. */
function floatWithRect(tabId: string): void {
  const target = service;
  if (target === undefined || openedTab !== tabId) return;
  try {
    target.float(tabId, windowRect());
  } catch {
    /* no mounted surface yet: a retry will try again */
  }
}

/**
 * Re-float a leftover tiny window once: dock the pane, then float it again with
 * the portrait rectangle. A window the user already sized is left alone.
 */
function ensureWindowShape(tabId: string, attempts = 4): void {
  if (openedTab !== tabId || service === undefined) return;
  const pane = floatingPane(tabId);
  if (pane === undefined) {
    floatWithRect(tabId);
  } else {
    const box = pane.getBoundingClientRect();
    const tiny = box.width < 360 || box.height < 540;
    if (tiny) {
      const paneId = pane.getAttribute("data-dockkit-float") ?? "";
      if (paneId !== "") {
        try {
          service.dock(paneId);
        } catch {
          /* already docked */
        }
        window.setTimeout(() => {
          floatWithRect(tabId);
        }, 80);
      }
    }
  }
  if (attempts <= 0) return;
  window.setTimeout(() => {
    ensureWindowShape(tabId, attempts - 1);
  }, 400);
}

/** Adopt the focused Browser tab, shape it, and remember it. */
function adoptFocusedTab(target: SidebarRightService | undefined): void {
  if (target === undefined) return;
  const tab = target.active();
  if (tab === undefined || (tab.kind !== undefined && tab.kind !== "browser")) return;
  openedTab = tab.id;
  ensureWindowShape(tab.id);
}

/**
 * Open Douyin in a native Browser tab and float it.
 *
 * `allowExternal` is the manual path (launcher click): when the shell has no
 * Browser tab API, the URL goes to the system browser instead of vanishing.
 */
export function openDouyin(url: string, allowExternal = false): void {
  if (service === undefined) {
    if (allowExternal) {
      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        /* popup blocked */
      }
    }
    return;
  }
  const target = service;
  try {
    target.openTab("browser", { params: { url } });
  } catch {
    return;
  }
  adoptFocusedTab(target);
  if (openedTab === undefined) {
    // The store may publish the tab on the next tick.
    window.setTimeout(() => {
      adoptFocusedTab(target);
    }, 80);
  }
}

/** Close the tab this plugin opened, if any. */
export function closeDouyin(): void {
  if (openedTab === undefined) return;
  const target = openedTab;
  openedTab = undefined;
  try {
    service?.close(target);
  } catch {
    /* the user already closed the tab */
  }
}

/** The owned tab id (undefined before the first open). */
export function ownedTabId(): string | undefined {
  return openedTab;
}
