/**
 * "Is DeepSeek Harness working?" — derived purely from the host session status
 * store, so the plugin never needs a private host channel.
 *
 * The Web shell's `uiSession` service publishes a snapshot map keyed by
 * Session id with three facts per Session: `running` (a turn is in flight),
 * `pendingInteraction` (an approval/question is awaited) and
 * `completionUnread` (a turn ended while the Session was not on screen).
 * A turn in flight is exactly what the user means by "Harness 开始工作".
 */

/** Per-Session status facts published by the shell. */
export interface SessionStatus {
  running?: boolean;
  pendingInteraction?: unknown;
  completionUnread?: boolean;
}

/** The observable store shape this plugin consumes. */
export interface SessionStatusStore {
  getSnapshot(): Map<string, SessionStatus>;
  subscribe(listener: () => void): () => void;
}

/** Whether any Session currently runs a turn. */
export function isWorking(store: SessionStatusStore): boolean {
  for (const status of store.getSnapshot().values()) {
    if (status.running === true) return true;
  }
  return false;
}

/**
 * Subscribe to the coarse working boolean. The listener runs once with the
 * current value (so a plugin mounted mid-turn opens immediately) and then
 * only on real transitions — status stores also notify on approvals, which
 * must not retrigger the window animation.
 */
export function subscribeWorking(
  store: SessionStatusStore,
  listener: (working: boolean) => void,
): () => void {
  let previous = isWorking(store);
  listener(previous);
  return store.subscribe(() => {
    const next = isWorking(store);
    if (next === previous) return;
    previous = next;
    listener(next);
  });
}
