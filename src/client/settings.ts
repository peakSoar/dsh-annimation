/**
 * Persisted preferences for the 抖音 floating browser window.
 *
 * Everything the user can change lives in one JSON record under a versioned
 * localStorage key; parsing is total (a corrupted record falls back to the
 * defaults instead of breaking the plugin boot).
 */

/** Default page: Douyin's web recommendation feed. */
export const DEFAULT_URL = "https://www.douyin.com/";

/** localStorage key owned by this plugin. */
export const SETTINGS_KEY = "dsh-douyin-window:settings:v1";

/** User-tunable behaviour of the window. */
export interface Settings {
  /** Page opened in the native browser tab. */
  url: string;
  /** Open (or reveal) the window when a turn starts. */
  autoOpen: boolean;
  /** Close the window when the last running turn finishes. */
  autoClose: boolean;
  /** Float a "工作结束了" toast when the last running turn finishes. */
  notify: boolean;
  /** Keep the small 抖音 launcher pill visible. */
  showPill: boolean;
}

/** Defaults; also the shape a malformed record falls back to. */
export const DEFAULT_SETTINGS: Settings = {
  url: DEFAULT_URL,
  autoOpen: true,
  autoClose: true,
  notify: true,
  showPill: true,
};

/** The slice of the Web Storage API this module needs. */
export type SettingsStorage = Pick<Storage, "getItem" | "setItem">;

/** localStorage when available (the web shell always provides it). */
function defaultStorage(): SettingsStorage | undefined {
  try {
    return typeof localStorage === "undefined" ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Accept only absolute http(s) URLs without embedded credentials.
 * Returns the normalized href so two spellings of one page share a value.
 */
export function normalizeUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed.length > 2048) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return undefined;
  if (parsed.username !== "" || parsed.password !== "") return undefined;
  return parsed.href;
}

/** Coerce one persisted record into complete settings. */
export function parseSettings(raw: string | null | undefined): Settings {
  if (typeof raw !== "string" || raw === "") return { ...DEFAULT_SETTINGS };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
  if (typeof value !== "object" || value === null) return { ...DEFAULT_SETTINGS };
  const record = value as Record<string, unknown>;
  const bool = (key: keyof Settings, fallback: boolean): boolean =>
    typeof record[key] === "boolean" ? (record[key] as boolean) : fallback;
  return {
    url: normalizeUrl(record.url) ?? DEFAULT_URL,
    autoOpen: bool("autoOpen", DEFAULT_SETTINGS.autoOpen),
    autoClose: bool("autoClose", DEFAULT_SETTINGS.autoClose),
    notify: bool("notify", DEFAULT_SETTINGS.notify),
    showPill: bool("showPill", DEFAULT_SETTINGS.showPill),
  };
}

/** Read the persisted settings (never throws). */
export function loadSettings(storage: SettingsStorage | undefined = defaultStorage()): Settings {
  try {
    return parseSettings(storage?.getItem(SETTINGS_KEY));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Whether a record already exists (used to decide if profile defaults apply). */
export function hasStoredSettings(
  storage: SettingsStorage | undefined = defaultStorage(),
): boolean {
  try {
    return storage?.getItem(SETTINGS_KEY) !== null && storage?.getItem(SETTINGS_KEY) !== undefined;
  } catch {
    return false;
  }
}

/** Persist settings (never throws). */
export function saveSettings(
  settings: Settings,
  storage: SettingsStorage | undefined = defaultStorage(),
): void {
  try {
    storage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* private mode / quota: keep the in-memory copy */
  }
}
