import { describe, expect, it } from "vitest";
import {
  EDGE,
  MIN_H,
  MIN_W,
  RECT_KEY,
  clampRect,
  defaultRect,
  loadRect,
  parseRect,
  resizeRect,
  saveRect,
  type RectStorage,
} from "../src/client/geometry.ts";

const VIEWPORT = { width: 1440, height: 900 };

/** In-memory storage. */
function memory(initial: Record<string, string> = {}): RectStorage & { dump(): Record<string, string> } {
  const data = { ...initial };
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
    dump: () => ({ ...data }),
  };
}

describe("defaultRect", () => {
  it("docks a portrait window to the top-right inside the viewport", () => {
    const rect = defaultRect(VIEWPORT);
    expect(rect.w).toBe(410);
    expect(rect.x + rect.w).toBeLessThanOrEqual(VIEWPORT.width - EDGE);
    expect(rect.x).toBeGreaterThan(VIEWPORT.width / 2);
    expect(rect.y).toBeGreaterThanOrEqual(EDGE);
    expect(rect.h).toBeLessThanOrEqual(VIEWPORT.height - EDGE);
  });

  it("never exceeds a small viewport", () => {
    const rect = defaultRect({ width: 360, height: 520 });
    expect(rect.w).toBeLessThanOrEqual(360);
    expect(rect.h).toBeLessThanOrEqual(520);
    expect(rect.x).toBeGreaterThanOrEqual(EDGE);
  });
});

describe("clampRect", () => {
  it("pulls an off-screen window back inside", () => {
    const rect = clampRect({ x: -400, y: 5000, w: 400, h: 700 }, VIEWPORT);
    expect(rect.x).toBe(EDGE);
    expect(rect.y + rect.h).toBeLessThanOrEqual(VIEWPORT.height - EDGE);
  });

  it("enforces the minimum size", () => {
    const rect = clampRect({ x: 40, y: 40, w: 10, h: 10 }, VIEWPORT);
    expect(rect.w).toBe(MIN_W);
    expect(rect.h).toBe(MIN_H);
  });
});

describe("resizeRect", () => {
  const start = { x: 200, y: 100, w: 400, h: 700 };

  it("grows from the south-east corner", () => {
    const rect = resizeRect(start, "se", 60, 40, VIEWPORT);
    expect(rect.w).toBe(460);
    expect(rect.h).toBe(740);
    expect(rect.x).toBe(200);
  });

  it("keeps the opposite edge anchored when growing west", () => {
    const rect = resizeRect(start, "sw", -60, 0, VIEWPORT);
    expect(rect.x).toBe(140);
    expect(rect.x + rect.w).toBe(start.x + start.w);
  });

  it("never shrinks below the minimum", () => {
    const rect = resizeRect(start, "nw", 3000, 3000, VIEWPORT);
    expect(rect.w).toBe(MIN_W);
    expect(rect.h).toBe(MIN_H);
    expect(rect.x + rect.w).toBe(start.x + start.w);
    expect(rect.y + rect.h).toBe(start.y + start.h);
  });
});

describe("parseRect", () => {
  it("accepts finite positive rectangles", () => {
    expect(parseRect({ x: 1, y: 2, w: 300, h: 500 })).toEqual({ x: 1, y: 2, w: 300, h: 500 });
  });

  it("rejects malformed records", () => {
    expect(parseRect(null)).toBeUndefined();
    expect(parseRect({ x: 0, y: 0, w: 0, h: 500 })).toBeUndefined();
    expect(parseRect({ x: 0, y: 0, w: "300", h: 500 })).toBeUndefined();
    expect(parseRect({ x: Number.NaN, y: 0, w: 300, h: 500 })).toBeUndefined();
  });
});

describe("rect persistence", () => {
  it("round-trips a rectangle", () => {
    const storage = memory();
    const rect = { x: 100, y: 80, w: 420, h: 720 };
    saveRect(rect, storage);
    expect(loadRect(VIEWPORT, storage)).toEqual(rect);
    expect(Object.keys(storage.dump())).toEqual([RECT_KEY]);
  });

  it("falls back to the default placement for broken storage", () => {
    expect(loadRect(VIEWPORT, memory({ [RECT_KEY]: "{" }))).toEqual(defaultRect(VIEWPORT));
  });

  it("clamps a remembered rectangle to the current viewport", () => {
    const storage = memory({ [RECT_KEY]: JSON.stringify({ x: 1200, y: 700, w: 500, h: 800 }) });
    const rect = loadRect({ width: 1280, height: 720 }, storage);
    expect(rect.x + rect.w).toBeLessThanOrEqual(1280 - EDGE);
    expect(rect.y + rect.h).toBeLessThanOrEqual(720 - EDGE);
  });
});
