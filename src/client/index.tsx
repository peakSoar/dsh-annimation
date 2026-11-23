/**
 * dsh-douyin-window client entry: mounts the launcher/toast/settings surfaces
 * and wires the three shell services it needs.
 *
 * - `locale`: UI language (optional; Chinese is the fallback).
 * - `uiSession`: per-Session running status, the signal that drives
 *   auto-open / auto-close.
 * - `sidebarRight`: the native Browser tab controller that actually shows
 *   Douyin (iframes are refused by the site). All three are dynamic injects so
 *   the plugin boot never hard-depends on one UI package.
 */
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import { attachSidebarRight, type SidebarRightService } from "./browser.ts";
import type { LocaleService } from "./i18n.ts";
import { attachLocale } from "./i18n.ts";
import type { SessionStatusStore } from "./monitor.ts";
import { attachSessions } from "./sessions.ts";

interface ClientContext {
  effect(callback: () => () => void, label?: string): () => void;
  inject(dependencies: string[], callback: (ctx: InjectedContext) => void): unknown;
}

interface InjectedContext extends ClientContext {
  locale?: LocaleService;
  uiSession?: { sessionStatus?: SessionStatusStore };
  sidebarRight?: SidebarRightService;
}

export function apply(ctx: ClientContext): void {
  ctx.inject(["locale"], (lctx) => {
    const locale = lctx.locale;
    if (locale === undefined) return;
    lctx.effect(() => attachLocale(locale), "douyin-window: attach locale");
  });

  ctx.inject(["uiSession"], (sctx) => {
    const store = sctx.uiSession?.sessionStatus;
    if (store === undefined) return;
    sctx.effect(() => attachSessions(store), "douyin-window: attach session status");
  });

  ctx.inject(["sidebarRight"], (bctx) => {
    const service = bctx.sidebarRight;
    if (service === undefined) return;
    bctx.effect(() => attachSidebarRight(service), "douyin-window: attach sidebar browser");
  });

  ctx.effect(() => {
    const host = document.createElement("div");
    host.setAttribute("data-dsh-douyin-window", "");
    document.body.appendChild(host);
    const root = createRoot(host);
    root.render(<App />);
    return () => {
      try {
        root.unmount();
      } catch {
        /* host already detached */
      }
      host.remove();
    };
  }, "douyin-window: launcher and toast");
}
