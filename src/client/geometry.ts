/**
 * Viewport geometry for the floating window: defaults, clamping, persistence.
 * Kept DOM-free so the rules can be unit-tested without a browser.
 */

/** A viewport rectangle in CSS pixels. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Visible page area the window must stay inside. */
export interface Viewport {
  width: number;
  height: number;
}

/** localStorage key for the remembered rectangle. */
export const RECT_KEY = "dsh-hongguo-window:rect:v2";

/** Smallest usable window (a 9:16 frame still renders at this width). */
export const MIN_W = 320;
export const MIN_H = 460;

/** Gap kept between the window and every viewport edge. */
export const EDGE = 12;

/** Storage slice needed for persistence. */
export type RectStorage = Pick<Storage, "getItem" | "setItem">;

/** Fallback viewport for non-DOM callers. */
export const FALLBACK_VIEWPORT: Viewport = { width: 1280, height: 800 };

/** Default rectangle: a portrait window docked to the top-right corner. */
export function defaultRect(viewport: Viewport = FALLBACK_VIEWPORT): Rect {
  const w = Math.min(410, Math.max(MIN_W, viewport.width - EDGE * 2));
  const h = Math.min(760, Math.max(MIN_H, viewport.height - 96));
  const x = viewport.width - w - 16;
  const y = Math.min(64, Math.max(EDGE, viewport.height - h - EDGE));
  return clampRect({ x, y, w, h }, viewport);
}

/** Clamp a rectangle so it stays fully visible and at least MIN_W × MIN_H. */
export function clampRect(rect: Rect, viewport: Viewport = FALLBACK_VIEWPORT): Rect {
  const maxW = Math.max(MIN_W, viewport.width - EDGE * 2);
  const maxH = Math.max(MIN_H, viewport.height - EDGE * 2);
  const w = Math.round(Math.min(Math.max(rect.w, MIN_W), maxW));
  const h = Math.round(Math.min(Math.max(rect.h, MIN_H), maxH));
  const x = Math.round(Math.min(Math.max(rect.x, EDGE), Math.max(EDGE, viewport.width - w - EDGE)));
  const y = Math.round(Math.min(Math.max(rect.y, EDGE), Math.max(EDGE, viewport.height - h - EDGE)));
  return { x, y, w, h };
}

/** Coerce persisted JSON into a rectangle, or undefined when unusable. */
export function parseRect(raw: unknown): Rect | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const record = raw as Record<string, unknown>;
  const num = (key: keyof Rect): number | undefined => {
    const value = record[key];
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  };
  const x = num("x");
  const y = num("y");
  const w = num("w");
  const h = num("h");
  if (x === undefined || y === undefined || w === undefined || h === undefined) return undefined;
  if (w <= 0 || h <= 0) return undefined;
  return { x, y, w, h };
}

/** Read the remembered rectangle, falling back to the default placement. */
export function loadRect(
  viewport: Viewport,
  storage: RectStorage | undefined,
): Rect {
  try {
    const raw = storage?.getItem(RECT_KEY);
    if (typeof raw !== "string" || raw === "") return defaultRect(viewport);
    return clampRect(parseRect(JSON.parse(raw) as unknown) ?? defaultRect(viewport), viewport);
  } catch {
    return defaultRect(viewport);
  }
}

/** Persist the current rectangle (never throws). */
export function saveRect(rect: Rect, storage: RectStorage | undefined): void {
  try {
    storage?.setItem(RECT_KEY, JSON.stringify(rect));
  } catch {
    /* quota / private mode: geometry simply is not remembered */
  }
}

/** Direction of an active resize gesture. */
export type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/** Apply one pointer delta to a rectangle while honouring the opposite edge. */
export function resizeRect(
  start: Rect,
  dir: ResizeDir,
  dx: number,
  dy: number,
  viewport: Viewport,
): Rect {
  let { x, y, w, h } = start;
  if (dir.includes("e")) {
    w = Math.min(Math.max(start.w + dx, MIN_W), viewport.width - start.x - EDGE);
  }
  if (dir.includes("s")) {
    h = Math.min(Math.max(start.h + dy, MIN_H), viewport.height - start.y - EDGE);
  }
  if (dir.includes("w")) {
    w = Math.min(Math.max(start.w - dx, MIN_W), start.x + start.w - EDGE);
    x = start.x + start.w - w;
  }
  if (dir.includes("n")) {
    h = Math.min(Math.max(start.h - dy, MIN_H), start.y + start.h - EDGE);
    y = start.y + start.h - h;
  }
  return clampRect({ x, y, w: Math.round(w), h: Math.round(h) }, viewport);
}
