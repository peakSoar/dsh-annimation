/**
 * Settings dialog: the embedded URL plus the four behaviour switches.
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
  onResetRect(): void;
  onPreviewFinish(): void;
}

/** One labelled switch row. */
function Row(props: {
  title: string;
  description: string;
  on: boolean;
  onToggle(): void;
}): ReactNode {
  return (
    <div className="hgw-row">
      <div className="hgw-row-text">
        <span className="hgw-row-title">{props.title}</span>
        <span className="hgw-row-desc">{props.description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={props.on}
        className={`hgw-switch${props.on ? " on" : ""}`}
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
      className="hgw-mask"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) props.onClose();
      }}
    >
      <div className="hgw-modal" role="dialog" aria-modal="true" aria-label={t("settings.title")}>
        <div className="hgw-modal-head">
          <span className="hgw-logo" aria-hidden="true">红</span>
          <span className="hgw-modal-title">{t("settings.title")}</span>
          <button type="button" className="hgw-icon" onClick={props.onClose} title={t("settings.close")} aria-label={t("settings.close")}>
            ×
          </button>
        </div>

        <div className="hgw-field">
          <label className="hgw-label" htmlFor="hgw-url">
            {t("settings.url")}
          </label>
          <input
            id="hgw-url"
            className="hgw-input"
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
            <span className="hgw-hint err">{t("settings.urlInvalid")}</span>
          ) : (
            <span className="hgw-hint">{t("settings.urlHint")}</span>
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
          title={t("settings.idleLauncher")}
          description={t("settings.idleLauncherHint")}
          on={props.settings.idleLauncher}
          onToggle={() => {
            props.onChange({ idleLauncher: !props.settings.idleLauncher });
          }}
        />

        <div className="hgw-modal-foot">
          <button type="button" className="hgw-btn" onClick={props.onResetRect}>
            {t("settings.resetRect")}
          </button>
          <button type="button" className="hgw-btn" onClick={props.onPreviewFinish}>
            {t("settings.preview")}
          </button>
          <span style={{ flex: 1 }} />
          <button type="button" className="hgw-btn primary" onClick={props.onClose}>
            {t("settings.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
