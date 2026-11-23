import { describe, expect, it, vi } from "vitest";
import { isWorking, subscribeWorking, type SessionStatus, type SessionStatusStore } from "../src/client/monitor.ts";

/** Minimal observable store with the same shape as the shell's. */
function store(initial: Record<string, SessionStatus>): SessionStatusStore & {
  set(next: Record<string, SessionStatus>): void;
} {
  let snapshot = new Map(Object.entries(initial));
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set(next) {
      snapshot = new Map(Object.entries(next));
      for (const listener of [...listeners]) listener();
    },
  };
}

describe("isWorking", () => {
  it("is idle for an empty catalog", () => {
    expect(isWorking(store({}))).toBe(false);
  });

  it("is working when any session runs a turn", () => {
    expect(isWorking(store({ a: { running: false }, b: { running: true } }))).toBe(true);
  });

  it("ignores pending interactions without a running turn", () => {
    expect(isWorking(store({ a: { running: false, pendingInteraction: { key: "x" } } }))).toBe(false);
  });
});

describe("subscribeWorking", () => {
  it("reports the current value immediately", () => {
    const listener = vi.fn();
    subscribeWorking(store({ a: { running: true } }), listener);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(true);
  });

  it("reports only real transitions", () => {
    const catalog = store({ a: { running: false } });
    const listener = vi.fn();
    subscribeWorking(catalog, listener);
    listener.mockClear();

    catalog.set({ a: { running: false, pendingInteraction: { key: "approval" } } });
    expect(listener).not.toHaveBeenCalled();

    catalog.set({ a: { running: true } });
    expect(listener).toHaveBeenLastCalledWith(true);

    catalog.set({ a: { running: true, completionUnread: false } });
    expect(listener).toHaveBeenCalledTimes(1);

    catalog.set({ a: { running: false, completionUnread: true } });
    expect(listener).toHaveBeenLastCalledWith(false);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("keeps working while another session still runs", () => {
    const catalog = store({ main: { running: true }, child: { running: false } });
    const listener = vi.fn();
    subscribeWorking(catalog, listener);
    listener.mockClear();

    catalog.set({ main: { running: false }, child: { running: true } });
    expect(listener).not.toHaveBeenCalled();

    catalog.set({ main: { running: false }, child: { running: false } });
    expect(listener).toHaveBeenLastCalledWith(false);
  });

  it("stops reporting after unsubscribe", () => {
    const catalog = store({ a: { running: false } });
    const listener = vi.fn();
    const off = subscribeWorking(catalog, listener);
    off();
    catalog.set({ a: { running: true } });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
