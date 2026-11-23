/**
 * Bridge to the shell's native Browser tab (`ctx.sidebarRight`).
 *
 * Douyin refuses to render inside a cross-origin iframe (it answers with a
 * slider-captcha intermediate page), so the floating window is not an iframe:
 * the plugin asks the shell to open a Browser tab and immediately floats that
 * tab into a draggable native panel. On Desktop the tab is an Electron
 * `<webview>`, so login, cookies and video playback behave like a real browser.
 *
 * The controller API (documented by @deepseek-ai/dsh-client-ui-sidebar-right):
 *   openTab("browser", { params: { url } })  — open or reveal a tab
 *   active()                                  — the focused tab record
 *   float(tabId)                              — move a docked tab into a float
 *   close(tabId)                              — close one tab
 */

/** Tab record subset this bridge reads. */
export interface BrowserTab {
  id: string;
  kind?: string;
}

/** The shell's right-sidebar navigation controller subset. */
export interface SidebarRightService {
  openTab(kind: string, options?: { params?: { url?: string }; revealIfOpened?: boolean }): void;
  active(): BrowserTab | undefined;
  float(tabId: string): void;
  close(tabId: string): void;
}

let service: SidebarRightService | undefined;
const listeners = new Set<() => void>();

/** The tab this plugin currently owns (last one it opened or revealed). */
let openedTab: string | undefined;

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

/**
 * Ask the controller to float a docked tab.
 *
 * Opening the column and mounting its surface are separate steps, so the first
 * `float()` can arrive before there is a surface to float on; retrying a few
 * times covers that window without touching a tab that is already floating
 * (the controller ignores those).
 */
function floatWithRetries(tabId: string, attempts = 6): void {
  const target = service;
  if (target === undefined) return;
  // A close (or a newer open) ends this retry chain.
  if (openedTab !== tabId) return;
  try {
    target.float(tabId);
  } catch {
    /* no mounted surface yet, or the tab is gone */
  }
  if (attempts <= 0) return;
  window.setTimeout(() => {
    floatWithRetries(tabId, attempts - 1);
  }, 300);
}

/** Adopt the focused Browser tab, float it, and remember it. */
function adoptFocusedTab(target: SidebarRightService | undefined): void {
  if (target === undefined) return;
  const tab = target.active();
  if (tab === undefined || (tab.kind !== undefined && tab.kind !== "browser")) return;
  openedTab = tab.id;
  floatWithRetries(tab.id);
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
