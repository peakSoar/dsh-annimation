/**
 * The "work finished" notice: a compact card that slides in from the top-right
 * when the last running turn settles. It outlives the Douyin tab, so the user
 * still gets a cue after the window is closed.
 */
import type { ReactNode } from "react";
import { useT } from "./i18n.ts";
import { IconCheck } from "./icons.tsx";

export interface CompletionToastProps {
  visible: boolean;
  /** Secondary line — depends on whether the window was actually closed. */
  hint: string;
  onAction(): void;
  onDismiss(): void;
}

/** Top-right completion toast. */
export function CompletionToast(props: CompletionToastProps): ReactNode {
  const t = useT();
  if (!props.visible) return null;
  return (
    <div className="dyw-toast" role="status" aria-live="polite">
      <span className="dyw-toast-icon" aria-hidden="true">
        <IconCheck />
      </span>
      <div className="dyw-toast-text">
        <span className="dyw-toast-title">{t("toast.title")}</span>
        <span className="dyw-toast-hint">{props.hint}</span>
      </div>
      <button type="button" className="dyw-toast-action" onClick={props.onAction}>
        {t("toast.action")}
      </button>
      <button
        type="button"
        className="dyw-toast-close"
        onClick={props.onDismiss}
        aria-label={t("toast.close")}
        title={t("toast.close")}
      >
        ×
      </button>
    </div>
  );
}
