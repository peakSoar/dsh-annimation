/**
 * Top-level state machine for the 红果短剧 window.
 *
 * Inputs: the host's Session status store (any turn in flight = working) and
 * the user's persisted preferences. Outputs: the floating window, the
 * completion toast and the optional idle launcher.
 *
 * Two timers guard the edges: a short grace period after the last turn ends
 * (a continuation or a quick second turn must not flash the window), and the
 * toast's own display window.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { subscribeWorking } from "./monitor.ts";
import { currentSessions, onSessionsChanged } from "./sessions.ts";
import { SettingsPanel } from "./settings-panel.tsx";
import {
  DEFAULT_SETTINGS,
  hasStoredSettings,
  loadSettings,
  normalizeUrl,
  saveSettings,
  type Settings,
} from "./settings.ts";
import { ensureStyles } from "./styles.ts";
import { CompletionToast } from "./toast.tsx";
import { HongguoLauncher, HongguoWindow } from "./window.tsx";
import { useT } from "./i18n.ts";

/** Delay between "no turn running" and stowing the window. */
export const FINISH_GRACE_MS = 1500;

/** How long the completion toast stays on screen. */
export const TOAST_VISIBLE_MS = 6000;

/** Host route that may pin the embedded page for a whole profile. */
const CONFIG_ENDPOINT = "/hongguo-wall/config";

/** Root component mounted once into the shell document. */
export function App(): ReactNode {
  const t = useT();
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const [working, setWorking] = useState(false);
  const workingRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [toast, setToast] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  /** True once the user closed the panel inside the current working cycle. */
  const dismissedRef = useRef(false);
  const finishTimer = useRef<number | undefined>(undefined);
  const toastTimer = useRef<number | undefined>(undefined);

  const clearTimers = useCallback((): void => {
    window.clearTimeout(finishTimer.current);
    window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    ensureStyles();
    return clearTimers;
  }, [clearTimers]);

  /** React to the harness starting or finishing work. */
  const handleWorkingRef = useRef<(next: boolean) => void>(() => {});
  handleWorkingRef.current = (next: boolean): void => {
    const prefs = settingsRef.current;
    window.clearTimeout(finishTimer.current);
    window.clearTimeout(toastTimer.current);
    setToast(false);
    if (next) {
      // A fresh cycle starts only when the previous state was idle; a status
      // re-bind mid-turn must not undo a manual close.
      if (!workingRef.current) dismissedRef.current = false;
      workingRef.current = true;
      setWorking(true);
      if (prefs.autoOpen && !dismissedRef.current) {
        setMinimized(false);
        setOpen(true);
      }
      return;
    }
    workingRef.current = false;
    setWorking(false);
    finishTimer.current = window.setTimeout(() => {
      if (workingRef.current) return;
      if (prefs.autoClose) {
        setOpen(false);
        setMinimized(false);
      }
      if (prefs.notify) {
        setToast(true);
        toastTimer.current = window.setTimeout(() => {
          setToast(false);
        }, TOAST_VISIBLE_MS);
      }
    }, FINISH_GRACE_MS);
  };

  /** Bind to the shell's Session status store, whenever it becomes available. */
  useEffect(() => {
    let detachStore: (() => void) | undefined;
    const bind = (): void => {
      detachStore?.();
      detachStore = undefined;
      const store = currentSessions();
      if (store === undefined) return;
      detachStore = subscribeWorking(store, (next) => {
        handleWorkingRef.current(next);
      });
    };
    bind();
    const offAttach = onSessionsChanged(bind);
    return () => {
      offAttach();
      detachStore?.();
      window.clearTimeout(finishTimer.current);
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  /** First run only: a profile-pinned URL becomes the default. */
  useEffect(() => {
    if (hasStoredSettings()) return;
    let cancelled = false;
    fetch(CONFIG_ENDPOINT, { headers: { accept: "application/json" } })
      .then(async (response) => (response.ok ? ((await response.json()) as { url?: unknown }) : undefined))
      .then((body) => {
        if (cancelled || body === undefined) return;
        const url = normalizeUrl(body.url);
        if (url === undefined) return;
        setSettings((prev) => {
          if (prev.url !== DEFAULT_SETTINGS.url) return prev;
          const next = { ...prev, url };
          saveSettings(next);
          return next;
        });
      })
      .catch(() => {
        /* offline or older host without the route: keep the built-in default */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const patchSettings = useCallback((patch: Partial<Settings>): void => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const handleClose = (): void => {
    setOpen(false);
    setMinimized(false);
    if (workingRef.current) dismissedRef.current = true;
  };

  const handleOpen = (): void => {
    setToast(false);
    setMinimized(false);
    setOpen(true);
  };

  const previewFinish = (): void => {
    setSettingsOpen(false);
    setOpen(false);
    setMinimized(false);
    setToast(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast(false);
    }, TOAST_VISIBLE_MS);
  };

  const toastHint = settings.autoClose ? t("toast.hint") : t("toast.hintIdle");

  return (
    <>
      <HongguoWindow
        open={open}
        minimized={minimized}
        working={working}
        settings={settings}
        resetToken={resetToken}
        onClose={handleClose}
        onMinimize={() => {
          setMinimized(true);
        }}
        onRestore={handleOpen}
        onOpenSettings={() => {
          setSettingsOpen(true);
        }}
      />
      {!open && (settings.idleLauncher || !settings.autoOpen) && (
        <HongguoLauncher onOpen={handleOpen} />
      )}
      <CompletionToast
        visible={toast}
        hint={toastHint}
        onAction={handleOpen}
        onDismiss={() => {
          setToast(false);
        }}
      />
      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={patchSettings}
          onClose={() => {
            setSettingsOpen(false);
          }}
          onResetRect={() => {
            setResetToken((token) => token + 1);
          }}
          onPreviewFinish={previewFinish}
        />
      )}
    </>
  );
}
