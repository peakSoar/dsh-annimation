/**
 * Bridge between the Cordis service layer and the React tree.
 *
 * The client plugin's `apply()` receives the shell's `uiSession` service only
 * after its dynamic inject resolves, which can happen after React mounted.
 * This module keeps the latest store and notifies the mounted tree when the
 * service appears or disappears, so auto-open works regardless of ordering.
 */
import type { SessionStatusStore } from "./monitor.ts";

let store: SessionStatusStore | undefined;
const listeners = new Set<() => void>();

/** Publish the shell's status store; the returned disposer detaches it. */
export function attachSessions(next: SessionStatusStore): () => void {
  store = next;
  for (const listener of [...listeners]) listener();
  return () => {
    if (store !== next) return;
    store = undefined;
    for (const listener of [...listeners]) listener();
  };
}

/** The current store, or undefined while the service is unavailable. */
export function currentSessions(): SessionStatusStore | undefined {
  return store;
}

/** Observe service attach/detach. */
export function onSessionsChanged(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
