import { describe, expect, it } from "vitest";
import { NS, attachLocale, tr, type LocaleService } from "../src/client/i18n.ts";

/** Locale service double that can flip the active language. */
function locale(active = "zh"): LocaleService & { switchTo(next: string): void; dictionaries: Map<string, string> } {
  const dictionaries = new Map<string, string>();
  const listeners = new Set<() => void>();
  let revision = 0;
  return {
    dictionaries,
    register(namespace, id, dict) {
      if (namespace !== NS) throw new Error(`unexpected namespace ${namespace}`);
      for (const [key, value] of Object.entries(dict)) dictionaries.set(`${id}:${key}`, value);
      return () => {
        for (const key of Object.keys(dict)) dictionaries.delete(`${id}:${key}`);
      };
    },
    getLocale: () => ({ active, revision }),
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    switchTo(next) {
      active = next;
      revision += 1;
      for (const listener of [...listeners]) listener();
    },
  };
}

describe("locale attachment", () => {
  it("registers both dictionaries and translates per language", () => {
    const service = locale();
    const off = attachLocale(service);
    expect(service.dictionaries.get("zh:app.title")).toBe("红果短剧");
    expect(service.dictionaries.get("en:app.title")).toBe("Hongguo Shorts");

    expect(tr("app.title")).toBe("红果短剧");
    service.switchTo("en");
    expect(tr("app.title")).toBe("Hongguo Shorts");
    expect(tr("toast.title")).toBe("Work finished");

    off();
    expect(service.dictionaries.size).toBe(0);
    expect(tr("app.title")).toBe("红果短剧");
  });

  it("falls back to the key for unknown entries", () => {
    attachLocale(locale());
    expect(tr("missing.key")).toBe("missing.key");
  });
});
