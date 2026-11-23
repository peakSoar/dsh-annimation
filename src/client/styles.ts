/**
 * Stylesheet for the surfaces this plugin still paints: the bottom-right
 * launcher pill, the completion toast and the settings dialog.
 *
 * The Douyin page itself is a native shell Browser tab, so there is no iframe
 * chrome left to style. Every rule is `dyw-` prefixed and injected once under a
 * stable id.
 */

/** Douyin accent (cyan → pink). */
export const ACCENT = "#25f4ee";
export const ACCENT_PINK = "#fe2c55";

/** Style element id owned by this plugin. */
const STYLE_ID = "dsh-dyw-style";

const CSS = `
.dyw-pill{position:fixed;right:18px;bottom:18px;z-index:2147483300;display:inline-flex;align-items:center;
  height:40px;border-radius:999px;overflow:hidden;border:1px solid rgba(255,255,255,.14);
  background:rgba(18,18,22,.92);backdrop-filter:blur(12px);box-shadow:0 10px 30px rgba(0,0,0,.45);
  font:12px/1 "PingFang SC","Microsoft YaHei",system-ui,sans-serif;user-select:none}
.dyw-pill button{border:0;background:transparent;color:#ececf1;height:100%;display:inline-flex;align-items:center;
  gap:7px;cursor:pointer;font:inherit;padding:0 12px 0 8px}
.dyw-pill button:hover{background:rgba(255,255,255,.08)}
.dyw-pill .dyw-gear{width:34px;padding:0;justify-content:center;color:#9a9aa4}
.dyw-pill .dyw-gear:hover{color:#fff}
.dyw-logo{width:24px;height:24px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#111 0%,#1b1b22 55%,#2a2a33 100%);color:${ACCENT};
  border:1px solid rgba(37,244,238,.35);box-shadow:inset 0 0 8px rgba(254,44,85,.25)}
.dyw-pill .dyw-label{font-weight:600;letter-spacing:.2px}

.dyw-toast{position:fixed;top:52px;right:20px;z-index:2147483600;display:flex;align-items:center;gap:10px;
  width:302px;padding:12px 12px 12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.12);
  background:rgba(20,20,25,.92);backdrop-filter:blur(14px);color:#f2f2f6;
  box-shadow:0 18px 50px rgba(0,0,0,.55);animation:dyw-toast-in .34s cubic-bezier(.2,.9,.3,1.1);
  font:12px/1.45 "PingFang SC","Microsoft YaHei",system-ui,sans-serif}
@keyframes dyw-toast-in{from{opacity:0;transform:translate3d(24px,-8px,0) scale(.97)}to{opacity:1;transform:none}}
.dyw-toast-icon{flex:none;width:28px;height:28px;border-radius:999px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,${ACCENT},${ACCENT_PINK});color:#111}
.dyw-toast-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.dyw-toast-title{font-size:12px;font-weight:600}
.dyw-toast-hint{font-size:10px;color:#9a9aa4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dyw-toast-action{border:0;background:rgba(37,244,238,.12);color:${ACCENT};font-size:10px;font-weight:600;
  height:24px;padding:0 10px;border-radius:7px;cursor:pointer;white-space:nowrap}
.dyw-toast-action:hover{background:rgba(37,244,238,.2)}
.dyw-toast-close{border:0;background:transparent;color:#77777f;font-size:14px;line-height:1;cursor:pointer;padding:2px}
.dyw-toast-close:hover{color:#fff}

.dyw-mask{position:fixed;inset:0;z-index:2147483700;display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,.55);backdrop-filter:blur(2px);animation:dyw-fade .18s ease;
  font:12px/1.5 "PingFang SC","Microsoft YaHei",system-ui,sans-serif}
@keyframes dyw-fade{from{opacity:0}to{opacity:1}}
.dyw-modal{width:430px;max-width:calc(100vw - 40px);max-height:calc(100vh - 80px);overflow:auto;
  background:#141419;border:1px solid rgba(255,255,255,.10);border-radius:16px;color:#ececf1;
  box-shadow:0 30px 90px rgba(0,0,0,.6);padding:16px 18px 14px}
.dyw-modal-head{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.dyw-modal-title{font-size:13px;font-weight:600;flex:1}
.dyw-note{font-size:10px;color:#77777f;line-height:1.6;margin:-4px 0 12px;padding:8px 10px;
  border:1px dashed rgba(255,255,255,.10);border-radius:9px;background:rgba(255,255,255,.02)}
.dyw-field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.dyw-label{font-size:11px;color:#a6a6b0}
.dyw-input{height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:#0d0d11;
  color:#f0f0f4;font-size:11px;padding:0 10px;outline:none}
.dyw-input:focus{border-color:rgba(37,244,238,.55)}
.dyw-hint{font-size:10px;color:#77777f;line-height:1.5}
.dyw-hint.err{color:#ff8d8d}
.dyw-row{display:flex;align-items:center;gap:12px;padding:9px 0;border-top:1px solid rgba(255,255,255,.06)}
.dyw-row:first-of-type{border-top:0}
.dyw-row-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.dyw-row-title{font-size:11px;color:#e9e9ef}
.dyw-row-desc{font-size:10px;color:#77777f}
.dyw-switch{position:relative;flex:none;width:34px;height:20px;border-radius:999px;border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.08);cursor:pointer;transition:background .18s,border-color .18s;padding:0}
.dyw-switch::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;
  background:#c7c7cf;transition:transform .18s,background .18s}
.dyw-switch.on{background:linear-gradient(135deg,${ACCENT},${ACCENT_PINK});border-color:transparent}
.dyw-switch.on::after{transform:translateX(14px);background:#fff}
.dyw-modal-foot{display:flex;align-items:center;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07)}
.dyw-btn{height:28px;padding:0 12px;border-radius:8px;border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.05);color:#e8e8ee;font-size:11px;cursor:pointer;transition:background .15s}
.dyw-btn:hover{background:rgba(255,255,255,.10)}
.dyw-btn.primary{background:linear-gradient(135deg,${ACCENT},${ACCENT_PINK});border-color:transparent;color:#111;font-weight:700}
`;

/** Inject the stylesheet once per document. */
export function ensureStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID) !== null) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
