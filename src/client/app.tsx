/**
 * Top-level state machine for the 抖音 window.
 *
 * Douyin cannot be embedded in an iframe (it answers with a captcha page), so
 * "opening the window" means asking the shell for a native Browser tab and
 * floating it. The plugin therefore owns no panel: it reacts to the host's
 * Session status, drives the native tab, and paints only the launcher pill, the
 * completion toast and the settings dialog.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { closeDouyin, onSidebarRightChanged, openDouyin } from "./browser.ts";
import { useT } from "./i18n.ts";
import { IconSettings } from "./icons.tsx";
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

/** Delay between "no turn running" and closing the window. */
export const FINISH_GRACE_MS = 1500;

/** How long the completion toast stays on screen. */
export const TOAST_VISIBLE_MS = 6000;

/** Host route that may pin the opened page for a whole profile. */
const CONFIG_ENDPOINT = "/douyin-window/config";

/** Root component mounted once into the shell document. */
export function App(): ReactNode {
  const t = useT();
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const workingRef = useRef(false);
  const [toast, setToast] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  /** The current working cycle already opened its tab. */
  const openedCycleRef = useRef(false);
  const finishTimer = useRef<number | undefined>(undefined);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    ensureStyles();
    return () => {
      window.clearTimeout(finishTimer.current);
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  /** React to the harness starting or finishing work. */
  const handleWorkingRef = useRef<(next: boolean) => void>(() => {});
  handleWorkingRef.current = (next: boolean): void => {
    const prefs = settingsRef.current;
    window.clearTimeout(finishTimer.current);
    window.clearTimeout(toastTimer.current);
    setToast(false);
    if (next) {
      // A fresh cycle starts only when the previous state was idle; a status
      // re-bind mid-turn must not reopen a window the user closed.
      if (!workingRef.current) {
        workingRef.current = true;
        openedCycleRef.current = false;
        if (prefs.autoOpen) {
          openDouyin(prefs.url);
          openedCycleRef.current = true;
        }
      }
      return;
    }
    workingRef.current = false;
    finishTimer.current = window.setTimeout(() => {
      if (workingRef.current) return;
      if (prefs.autoClose) closeDouyin();
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

  /** A Browser-tab API that arrives mid-turn still opens the window. */
  useEffect(() => {
    return onSidebarRightChanged(() => {
      const prefs = settingsRef.current;
      if (!workingRef.current || !prefs.autoOpen || openedCycleRef.current) return;
      openDouyin(prefs.url);
      openedCycleRef.current = true;
    });
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

  /** Open Douyin from the pill, the toast or the settings dialog. */
  const openNow = (): void => {
    setToast(false);
    openDouyin(settingsRef.current.url, true);
  };

  const toastHint = settings.autoClose ? t("toast.hint") : t("toast.hintKept");

  return (
    <>
      {settings.showPill && (
        <div className="dyw-pill" data-dsh-douyin-pill="">
          <button type="button" onClick={openNow} title={t("action.open")}>
            <span className="dyw-logo" aria-hidden="true">抖</span>
            <span className="dyw-label">{t("app.title")}</span>
          </button>
          <button
            type="button"
            className="dyw-gear"
            onClick={() => {
              setSettingsOpen(true);
            }}
            title={t("action.settings")}
            aria-label={t("action.settings")}
          >
            <IconSettings />
          </button>
        </div>
      )}
      <CompletionToast
        visible={toast}
        hint={toastHint}
        onAction={openNow}
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
          onOpenNow={() => {
            openNow();
            setSettingsOpen(false);
          }}
        />
      )}
    </>
  );
}
