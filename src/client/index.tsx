/**
 * dsh-hongguo-window client entry: mounts the persistent 红果短剧 window and
 * wires the two shell services it needs.
 *
 * - `locale`: UI language (optional; Chinese is the fallback).
 * - `uiSession`: per-Session running status, the signal that drives
 *   auto-open / auto-stow. Injected dynamically so the whole boot does not
 *   hard-depend on a UI package.
 */
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
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
}

export function apply(ctx: ClientContext): void {
  ctx.inject(["locale"], (lctx) => {
    const locale = lctx.locale;
    if (locale === undefined) return;
    lctx.effect(() => attachLocale(locale), "hongguo-window: attach locale");
  });

  ctx.inject(["uiSession"], (sctx) => {
    const store = sctx.uiSession?.sessionStatus;
    if (store === undefined) return;
    sctx.effect(() => attachSessions(store), "hongguo-window: attach session status");
  });

  ctx.effect(() => {
    const host = document.createElement("div");
    host.setAttribute("data-dsh-hongguo-window", "");
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
  }, "hongguo-window: 红果短剧 window");
}
