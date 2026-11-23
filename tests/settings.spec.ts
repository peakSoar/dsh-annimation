import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  DEFAULT_URL,
  SETTINGS_KEY,
  hasStoredSettings,
  loadSettings,
  normalizeUrl,
  parseSettings,
  saveSettings,
  type SettingsStorage,
} from "../src/client/settings.ts";

/** In-memory storage with the two methods the module uses. */
function memory(initial: Record<string, string> = {}): SettingsStorage & { dump(): Record<string, string> } {
  const data = { ...initial };
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
    dump: () => ({ ...data }),
  };
}

describe("normalizeUrl", () => {
  it("keeps absolute http(s) URLs", () => {
    expect(normalizeUrl("https://www.douyin.com/")).toBe("https://www.douyin.com/");
    expect(normalizeUrl(" http://example.com/a ")).toBe("http://example.com/a");
  });

  it("rejects non-http(s), empty and credentialed URLs", () => {
    expect(normalizeUrl("javascript:alert(1)")).toBeUndefined();
    expect(normalizeUrl("file:///C:/x")).toBeUndefined();
    expect(normalizeUrl("https://user:pass@example.com/")).toBeUndefined();
    expect(normalizeUrl("")).toBeUndefined();
    expect(normalizeUrl("   ")).toBeUndefined();
    expect(normalizeUrl(42)).toBeUndefined();
    expect(normalizeUrl("not a url")).toBeUndefined();
  });
});

describe("parseSettings", () => {
  it("defaults to the Douyin feed", () => {
    expect(DEFAULT_SETTINGS.url).toBe("https://www.douyin.com/");
    expect(DEFAULT_SETTINGS.showPill).toBe(true);
    expect(DEFAULT_SETTINGS.autoOpen).toBe(true);
    expect(DEFAULT_SETTINGS.autoClose).toBe(true);
  });

  it("falls back to defaults for empty or broken records", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("{")).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("null")).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('{"url":"javascript:alert(1)","autoOpen":"yes"}')).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps valid overrides and ignores wrong types", () => {
    const parsed = parseSettings(
      JSON.stringify({ url: "https://example.com/x", autoOpen: false, autoClose: "no", showPill: false }),
    );
    expect(parsed.url).toBe("https://example.com/x");
    expect(parsed.autoOpen).toBe(false);
    expect(parsed.autoClose).toBe(DEFAULT_SETTINGS.autoClose);
    expect(parsed.showPill).toBe(false);
  });
});

describe("settings persistence", () => {
  it("round-trips through storage", () => {
    const storage = memory();
    expect(hasStoredSettings(storage)).toBe(false);
    const settings = { ...DEFAULT_SETTINGS, autoClose: false, showPill: false };
    saveSettings(settings, storage);
    expect(hasStoredSettings(storage)).toBe(true);
    expect(loadSettings(storage)).toEqual(settings);
  });

  it("survives storage failures", () => {
    const failing: SettingsStorage = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadSettings(failing)).toEqual(DEFAULT_SETTINGS);
    expect(() => {
      saveSettings(DEFAULT_SETTINGS, failing);
    }).not.toThrow();
  });

  it("writes the versioned key", () => {
    const storage = memory();
    saveSettings({ ...DEFAULT_SETTINGS, url: DEFAULT_URL }, storage);
    expect(Object.keys(storage.dump())).toEqual([SETTINGS_KEY]);
  });
});
