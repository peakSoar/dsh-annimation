/**
 * The "work finished" notice: a compact card that slides in from the top-right
 * when the last running turn settles. It deliberately outlives the window, so
 * the user still gets a cue after the panel is stowed.
 */
import type { ReactNode } from "react";
import { useT } from "./i18n.ts";
import { IconCheck } from "./icons.tsx";

export interface CompletionToastProps {
  visible: boolean;
  /** Secondary line — depends on whether the window was actually stowed. */
  hint: string;
  onAction(): void;
  onDismiss(): void;
}

/** Top-right completion toast. */
export function CompletionToast(props: CompletionToastProps): ReactNode {
  const t = useT();
  if (!props.visible) return null;
  return (
    <div className="hgw-toast" role="status" aria-live="polite">
      <span className="hgw-toast-icon" aria-hidden="true">
        <IconCheck />
      </span>
      <div className="hgw-toast-text">
        <span className="hgw-toast-title">{t("toast.title")}</span>
        <span className="hgw-toast-hint">{props.hint}</span>
      </div>
      <button type="button" className="hgw-toast-action" onClick={props.onAction}>
        {t("toast.action")}
      </button>
      <button
        type="button"
        className="hgw-toast-close"
        onClick={props.onDismiss}
        aria-label={t("toast.close")}
        title={t("toast.close")}
      >
        ×
      </button>
    </div>
  );
}
