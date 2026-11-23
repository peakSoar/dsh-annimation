/**
 * The floating window itself: a draggable, resizable portrait panel that
 * embeds 红果短剧 in an iframe, plus its minimized pill.
 *
 * The iframe is a plain cross-origin frame: the plugin never reads the site,
 * never proxies it and never injects script into it. That also means a blocked
 * frame cannot be detected from script, so a slow load surfaces a manual
 * retry / open-in-browser card after a timeout.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import {
  clampRect,
  defaultRect,
  loadRect,
  resizeRect,
  saveRect,
  type Rect,
  type ResizeDir,
  type Viewport,
} from "./geometry.ts";
import { useT } from "./i18n.ts";
import { IconClose, IconExternal, IconMinimize, IconReload, IconSettings } from "./icons.tsx";
import type { Settings } from "./settings.ts";

/** Corner + edge handles offered by the panel. */
const HANDLES: readonly ResizeDir[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

/** How long a frame may stay blank before the fallback card appears. */
const FRAME_TIMEOUT_MS = 18_000;

/** Live page size (falls back to a desktop-ish viewport outside a browser). */
function readViewport(): Viewport {
  if (typeof window === "undefined") return { width: 1280, height: 800 };
  return { width: window.innerWidth, height: window.innerHeight };
}

/** localStorage when available. */
function storage(): Storage | undefined {
  try {
    return typeof localStorage === "undefined" ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

/** Cross-origin navigation is the one action the host document can own. */
function openExternal(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Iframe load lifecycle as this panel models it. */
type FrameState = "loading" | "ready" | "blocked";

export interface HongguoWindowProps {
  /** Whether the panel is shown at all. */
  open: boolean;
  /** Collapsed to the bottom-right pill. */
  minimized: boolean;
  /** The Harness is running a turn right now (drives the status chip). */
  working: boolean;
  /** Current preferences (URL + behaviour switches). */
  settings: Settings;
  /** Bumped by the settings dialog to snap the panel back to its default spot. */
  resetToken: number;
  onClose(): void;
  onMinimize(): void;
  onRestore(): void;
  onOpenSettings(): void;
}

/** Floating window + minimized pill. */
export function HongguoWindow(props: HongguoWindowProps): ReactNode {
  const t = useT();
  const [viewport, setViewport] = useState<Viewport>(readViewport);
  const [rect, setRect] = useState<Rect>(() => loadRect(readViewport(), storage()));
  const [reloadKey, setReloadKey] = useState(0);
  const [frame, setFrame] = useState<FrameState>("loading");

  /** Latest rectangle, readable synchronously by the pointer-up handlers. */
  const rectRef = useRef(rect);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const dragRef = useRef<{ pointerX: number; pointerY: number; rect: Rect } | null>(null);
  const resizeRef = useRef<{ dir: ResizeDir; pointerX: number; pointerY: number; rect: Rect } | null>(null);
  const frameTimer = useRef<number | undefined>(undefined);

  const updateRect = useCallback((next: Rect): void => {
    rectRef.current = next;
    setRect(next);
  }, []);

  /** Keep the panel inside the viewport on window resizes. */
  useEffect(() => {
    const onResize = (): void => {
      const next = readViewport();
      setViewport(next);
      updateRect(clampRect(rectRef.current, next));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [updateRect]);

  /** Restore the default placement when the settings dialog asks for it. */
  useEffect(() => {
    if (props.resetToken === 0) return;
    const next = defaultRect(readViewport());
    updateRect(next);
    saveRect(next, storage());
  }, [props.resetToken, updateRect]);

  /** A new URL or a manual reload always restarts the load watchdog. */
  const startWatchdog = useCallback((): void => {
    setFrame("loading");
    window.clearTimeout(frameTimer.current);
    frameTimer.current = window.setTimeout(() => {
      setFrame((prev) => (prev === "loading" ? "blocked" : prev));
    }, FRAME_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    startWatchdog();
    return () => {
      window.clearTimeout(frameTimer.current);
    };
  }, [reloadKey, props.settings.url, startWatchdog]);

  const reload = (): void => {
    setReloadKey((key) => key + 1);
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if ((event.target as HTMLElement).closest("button") !== null) return;
    event.preventDefault();
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, rect: rectRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (drag === null) return;
    updateRect(
      clampRect(
        {
          ...drag.rect,
          x: drag.rect.x + event.clientX - drag.pointerX,
          y: drag.rect.y + event.clientY - drag.pointerY,
        },
        viewportRef.current,
      ),
    );
  };

  const endDrag = (): void => {
    if (dragRef.current === null) return;
    dragRef.current = null;
    saveRect(rectRef.current, storage());
  };

  const startResize = (dir: ResizeDir) => (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    resizeRef.current = {
      dir,
      pointerX: event.clientX,
      pointerY: event.clientY,
      rect: rectRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveResize = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const resize = resizeRef.current;
    if (resize === null) return;
    updateRect(
      resizeRect(
        resize.rect,
        resize.dir,
        event.clientX - resize.pointerX,
        event.clientY - resize.pointerY,
        viewportRef.current,
      ),
    );
  };

  const endResize = (): void => {
    if (resizeRef.current === null) return;
    resizeRef.current = null;
    saveRect(rectRef.current, storage());
  };

  if (!props.open) return null;

  if (props.minimized) {
    return (
      <button type="button" className="hgw-pill" onClick={props.onRestore} title={t("action.restore")}>
        <span className="hgw-logo" aria-hidden="true">红</span>
        <span>{t("launcher")}</span>
        {props.working && <span className="hgw-dot on" aria-hidden="true" />}
      </button>
    );
  }

  return (
    <div
      className="hgw-panel"
      data-dsh-hongguo-window=""
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      role="dialog"
      aria-label={t("app.title")}
    >
      <div
        className="hgw-bar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="hgw-logo" aria-hidden="true">红</span>
        <span className="hgw-title">{t("app.title")}</span>
        <span
          className={`hgw-dot${props.working ? " on" : ""}`}
          title={props.working ? t("status.workingTip") : t("status.idleTip")}
          aria-hidden="true"
        />
        <span className="hgw-status">{props.working ? t("status.working") : t("status.idle")}</span>
        <span className="hgw-spacer" />
        <button type="button" className="hgw-icon" onClick={reload} title={t("action.reload")} aria-label={t("action.reload")}>
          <IconReload />
        </button>
        <button type="button" className="hgw-icon" onClick={props.onOpenSettings} title={t("action.settings")} aria-label={t("action.settings")}>
          <IconSettings />
        </button>
        <button
          type="button"
          className="hgw-icon"
          onClick={() => {
            openExternal(props.settings.url);
          }}
          title={t("action.external")}
          aria-label={t("action.external")}
        >
          <IconExternal />
        </button>
        <button type="button" className="hgw-icon" onClick={props.onMinimize} title={t("action.minimize")} aria-label={t("action.minimize")}>
          <IconMinimize />
        </button>
        <button type="button" className="hgw-icon danger" onClick={props.onClose} title={t("action.close")} aria-label={t("action.close")}>
          <IconClose />
        </button>
      </div>

      <div className="hgw-frame-wrap">
        <iframe
          key={`${props.settings.url}#${reloadKey}`}
          className="hgw-frame"
          src={props.settings.url}
          title={t("app.title")}
          onLoad={() => {
            window.clearTimeout(frameTimer.current);
            setFrame("ready");
          }}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
        {frame === "loading" && (
          <div className="hgw-overlay">
            <span className="hgw-spinner" aria-hidden="true" />
            <span>{t("frame.loading")}</span>
          </div>
        )}
        {frame === "blocked" && (
          <div className="hgw-blocked">
            <div className="hgw-blocked-card">
              <div className="hgw-blocked-title">{t("frame.blocked.title")}</div>
              <div className="hgw-blocked-body">{t("frame.blocked.body")}</div>
              <div className="hgw-actions">
                <button type="button" className="hgw-btn" onClick={reload}>
                  {t("action.retry")}
                </button>
                <button
                  type="button"
                  className="hgw-btn primary"
                  onClick={() => {
                    openExternal(props.settings.url);
                  }}
                >
                  {t("frame.blocked.external")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {HANDLES.map((dir) => (
        <div
          key={dir}
          className="hgw-handle"
          data-dir={dir}
          onPointerDown={startResize(dir)}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
        />
      ))}
    </div>
  );
}

/** Small idle launcher shown while the panel is closed (optional). */
export function HongguoLauncher(props: { onOpen(): void }): ReactNode {
  const t = useT();
  return (
    <button type="button" className="hgw-pill" onClick={props.onOpen} title={t("launcher.tip")}>
      <span className="hgw-logo" aria-hidden="true">红</span>
      <span>{t("launcher")}</span>
    </button>
  );
}
