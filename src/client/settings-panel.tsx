/**
 * Settings dialog: the opened URL plus the four behaviour switches.
 * Edits apply immediately (each switch writes through to localStorage); the
 * URL field commits on blur or Enter so half-typed addresses never load.
 */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useT } from "./i18n.ts";
import { DEFAULT_SETTINGS, normalizeUrl, type Settings } from "./settings.ts";

export interface SettingsPanelProps {
  settings: Settings;
  onChange(patch: Partial<Settings>): void;
  onClose(): void;
  /** Open Douyin right now with the current URL. */
  onOpenNow(): void;
}

/** One labelled switch row. */
function Row(props: {
  title: string;
  description: string;
  on: boolean;
  onToggle(): void;
}): ReactNode {
  return (
    <div className="dyw-row">
      <div className="dyw-row-text">
        <span className="dyw-row-title">{props.title}</span>
        <span className="dyw-row-desc">{props.description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={props.on}
        className={`dyw-switch${props.on ? " on" : ""}`}
        onClick={props.onToggle}
      />
    </div>
  );
}

/** Modal settings card. */
export function SettingsPanel(props: SettingsPanelProps): ReactNode {
  const t = useT();
  const [draft, setDraft] = useState(props.settings.url);
  const [error, setError] = useState(false);

  useEffect(() => {
    setDraft(props.settings.url);
  }, [props.settings.url]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [props.onClose]);

  const commitUrl = (): void => {
    const trimmed = draft.trim();
    if (trimmed === "") {
      setError(false);
      props.onChange({ url: DEFAULT_SETTINGS.url });
      setDraft(DEFAULT_SETTINGS.url);
      return;
    }
    const url = normalizeUrl(trimmed);
    if (url === undefined) {
      setError(true);
      return;
    }
    setError(false);
    props.onChange({ url });
    setDraft(url);
  };

  return (
    <div
      className="dyw-mask"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) props.onClose();
      }}
    >
      <div className="dyw-modal" role="dialog" aria-modal="true" aria-label={t("settings.title")}>
        <div className="dyw-modal-head">
          <span className="dyw-logo" aria-hidden="true">抖</span>
          <span className="dyw-modal-title">{t("settings.title")}</span>
          <button type="button" className="dyw-btn" onClick={props.onClose} title={t("settings.close")}>
            ×
          </button>
        </div>

        <div className="dyw-note">{t("settings.nativeNote")}</div>

        <div className="dyw-field">
          <label className="dyw-label" htmlFor="dyw-url">
            {t("settings.url")}
          </label>
          <input
            id="dyw-url"
            className="dyw-input"
            value={draft}
            placeholder={t("settings.urlPlaceholder")}
            spellCheck={false}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(false);
            }}
            onBlur={commitUrl}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitUrl();
                event.currentTarget.blur();
              }
            }}
          />
          {error ? (
            <span className="dyw-hint err">{t("settings.urlInvalid")}</span>
          ) : (
            <span className="dyw-hint">{t("settings.urlHint")}</span>
          )}
        </div>

        <Row
          title={t("settings.autoOpen")}
          description={t("settings.autoOpenHint")}
          on={props.settings.autoOpen}
          onToggle={() => {
            props.onChange({ autoOpen: !props.settings.autoOpen });
          }}
        />
        <Row
          title={t("settings.autoClose")}
          description={t("settings.autoCloseHint")}
          on={props.settings.autoClose}
          onToggle={() => {
            props.onChange({ autoClose: !props.settings.autoClose });
          }}
        />
        <Row
          title={t("settings.notify")}
          description={t("settings.notifyHint")}
          on={props.settings.notify}
          onToggle={() => {
            props.onChange({ notify: !props.settings.notify });
          }}
        />
        <Row
          title={t("settings.showPill")}
          description={t("settings.showPillHint")}
          on={props.settings.showPill}
          onToggle={() => {
            props.onChange({ showPill: !props.settings.showPill });
          }}
        />

        <div className="dyw-modal-foot">
          <button type="button" className="dyw-btn primary" onClick={props.onOpenNow}>
            {t("settings.openNow")}
          </button>
          <span style={{ flex: 1 }} />
          <button type="button" className="dyw-btn" onClick={props.onClose}>
            {t("settings.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
