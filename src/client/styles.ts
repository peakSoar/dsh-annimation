/**
 * One stylesheet for every surface the plugin paints: the floating panel, the
 * minimized launcher, the completion toast and the settings dialog.
 *
 * The shell is a third-party document, so every rule is `hgw-` prefixed and
 * the stylesheet is injected once under a stable id. Colors are literal so the
 * window keeps its identity in both shell themes.
 */

/** Brand accent (红果 red-orange). */
export const ACCENT = "#ff4a3d";
/** Secondary accent used for the gradient. */
export const ACCENT_DEEP = "#ff2d55";

/** Style element id owned by this plugin. */
const STYLE_ID = "dsh-hgw-style";

const CSS = `
.hgw-panel{position:fixed;z-index:2147483000;display:flex;flex-direction:column;overflow:hidden;
  background:#0c0c10;border:1px solid rgba(255,255,255,.10);border-radius:16px;
  box-shadow:0 26px 80px rgba(0,0,0,.62),0 2px 8px rgba(0,0,0,.4);
  color:#ececf1;font:12px/1.45 "PingFang SC","Microsoft YaHei",system-ui,sans-serif;user-select:none}
.hgw-bar{flex:none;display:flex;align-items:center;gap:7px;height:42px;padding:0 8px 0 10px;
  background:linear-gradient(180deg,rgba(255,74,61,.16),rgba(12,12,16,0));cursor:grab;touch-action:none}
.hgw-bar:active{cursor:grabbing}
.hgw-logo{flex:none;width:24px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,${ACCENT},${ACCENT_DEEP});color:#fff;font-size:12px;font-weight:700;
  box-shadow:0 2px 8px rgba(255,61,80,.35)}
.hgw-title{font-size:12px;font-weight:600;letter-spacing:.2px;white-space:nowrap}
.hgw-dot{flex:none;width:6px;height:6px;border-radius:999px;background:#5b5b66;margin-left:2px}
.hgw-dot.on{background:${ACCENT};box-shadow:0 0 0 3px rgba(255,74,61,.18);animation:hgw-pulse 1.6s ease-in-out infinite}
@keyframes hgw-pulse{50%{box-shadow:0 0 0 5px rgba(255,74,61,.05)}}
.hgw-status{font-size:10px;color:#8e8e99;white-space:nowrap}
.hgw-spacer{flex:1;min-width:4px}
.hgw-icon{flex:none;width:24px;height:24px;border:0;border-radius:7px;background:transparent;color:#9a9aa4;
  display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:background .15s,color .15s}
.hgw-icon:hover{background:rgba(255,255,255,.09);color:#fff}
.hgw-icon:active{background:rgba(255,255,255,.14)}
.hgw-icon.danger:hover{background:rgba(255,61,80,.18);color:#ff8d8d}
.hgw-frame-wrap{position:relative;flex:1;min-height:0;background:#000}
.hgw-frame{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}
.hgw-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:10px;background:#0c0c10;color:#8e8e99;font-size:11px;z-index:2}
.hgw-spinner{width:22px;height:22px;border-radius:999px;border:2px solid rgba(255,255,255,.12);
  border-top-color:${ACCENT};animation:hgw-spin .8s linear infinite}
@keyframes hgw-spin{to{transform:rotate(360deg)}}
.hgw-blocked{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:18px;
  background:radial-gradient(120% 80% at 50% 0%,rgba(255,74,61,.10),transparent 60%),#0c0c10;z-index:3}
.hgw-blocked-card{max-width:300px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.hgw-blocked-title{font-size:13px;font-weight:600;color:#f2f2f6}
.hgw-blocked-body{font-size:11px;color:#8e8e99;line-height:1.6}
.hgw-actions{display:flex;gap:8px;margin-top:6px}
.hgw-btn{height:28px;padding:0 12px;border-radius:8px;border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.05);color:#e8e8ee;font-size:11px;cursor:pointer;transition:background .15s}
.hgw-btn:hover{background:rgba(255,255,255,.10)}
.hgw-btn.primary{background:linear-gradient(135deg,${ACCENT},${ACCENT_DEEP});border-color:transparent;color:#fff;font-weight:600}
.hgw-btn.primary:hover{filter:brightness(1.08)}
.hgw-handle{position:absolute;z-index:4;touch-action:none}
.hgw-handle[data-dir="n"]{top:-3px;left:8px;right:8px;height:6px;cursor:ns-resize}
.hgw-handle[data-dir="s"]{bottom:-3px;left:8px;right:8px;height:6px;cursor:ns-resize}
.hgw-handle[data-dir="e"]{right:-3px;top:8px;bottom:8px;width:6px;cursor:ew-resize}
.hgw-handle[data-dir="w"]{left:-3px;top:8px;bottom:8px;width:6px;cursor:ew-resize}
.hgw-handle[data-dir="ne"]{top:-4px;right:-4px;width:22px;height:22px;cursor:nesw-resize}
.hgw-handle[data-dir="nw"]{top:-4px;left:-4px;width:22px;height:22px;cursor:nwse-resize}
.hgw-handle[data-dir="se"]{bottom:-4px;right:-4px;width:22px;height:22px;cursor:nwse-resize}
.hgw-handle[data-dir="sw"]{bottom:-4px;left:-4px;width:22px;height:22px;cursor:nesw-resize}
.hgw-pill{position:fixed;right:18px;bottom:18px;z-index:2147483300;display:inline-flex;align-items:center;gap:8px;
  height:38px;padding:0 14px 0 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12);
  background:linear-gradient(135deg,${ACCENT},${ACCENT_DEEP});color:#fff;font-size:12px;font-weight:600;
  cursor:pointer;box-shadow:0 10px 30px rgba(255,45,85,.32)}
.hgw-pill:hover{filter:brightness(1.06)}
.hgw-pill .hgw-logo{width:26px;height:26px;background:rgba(0,0,0,.22);box-shadow:none}
.hgw-toast{position:fixed;top:52px;right:20px;z-index:2147483600;display:flex;align-items:center;gap:10px;
  width:302px;padding:12px 12px 12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.12);
  background:rgba(20,20,25,.92);backdrop-filter:blur(14px);color:#f2f2f6;
  box-shadow:0 18px 50px rgba(0,0,0,.55);animation:hgw-toast-in .34s cubic-bezier(.2,.9,.3,1.1)}
@keyframes hgw-toast-in{from{opacity:0;transform:translate3d(24px,-8px,0) scale(.97)}to{opacity:1;transform:none}}
.hgw-toast-icon{flex:none;width:28px;height:28px;border-radius:999px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,${ACCENT},${ACCENT_DEEP});color:#fff}
.hgw-toast-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.hgw-toast-title{font-size:12px;font-weight:600}
.hgw-toast-hint{font-size:10px;color:#9a9aa4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hgw-toast-action{border:0;background:rgba(255,74,61,.14);color:#ff9d94;font-size:10px;font-weight:600;
  height:24px;padding:0 10px;border-radius:7px;cursor:pointer;white-space:nowrap}
.hgw-toast-action:hover{background:rgba(255,74,61,.24)}
.hgw-toast-close{border:0;background:transparent;color:#77777f;font-size:14px;line-height:1;cursor:pointer;padding:2px}
.hgw-toast-close:hover{color:#fff}
.hgw-mask{position:fixed;inset:0;z-index:2147483700;display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,.55);backdrop-filter:blur(2px);animation:hgw-fade .18s ease}
@keyframes hgw-fade{from{opacity:0}to{opacity:1}}
.hgw-modal{width:420px;max-width:calc(100vw - 40px);max-height:calc(100vh - 80px);overflow:auto;
  background:#141419;border:1px solid rgba(255,255,255,.10);border-radius:16px;color:#ececf1;
  box-shadow:0 30px 90px rgba(0,0,0,.6);padding:16px 18px 14px;font:12px/1.5 "PingFang SC","Microsoft YaHei",system-ui,sans-serif}
.hgw-modal-head{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.hgw-modal-title{font-size:13px;font-weight:600;flex:1}
.hgw-field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.hgw-label{font-size:11px;color:#a6a6b0}
.hgw-input{height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:#0d0d11;
  color:#f0f0f4;font-size:11px;padding:0 10px;outline:none}
.hgw-input:focus{border-color:rgba(255,74,61,.55)}
.hgw-hint{font-size:10px;color:#77777f;line-height:1.5}
.hgw-hint.err{color:#ff8d8d}
.hgw-row{display:flex;align-items:center;gap:12px;padding:9px 0;border-top:1px solid rgba(255,255,255,.06)}
.hgw-row:first-of-type{border-top:0}
.hgw-row-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.hgw-row-title{font-size:11px;color:#e9e9ef}
.hgw-row-desc{font-size:10px;color:#77777f}
.hgw-switch{position:relative;flex:none;width:34px;height:20px;border-radius:999px;border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.08);cursor:pointer;transition:background .18s,border-color .18s;padding:0}
.hgw-switch::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;
  background:#c7c7cf;transition:transform .18s,background .18s}
.hgw-switch.on{background:linear-gradient(135deg,${ACCENT},${ACCENT_DEEP});border-color:transparent}
.hgw-switch.on::after{transform:translateX(14px);background:#fff}
.hgw-modal-foot{display:flex;align-items:center;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07)}
.hgw-saved{font-size:10px;color:#6ee7a8;opacity:0;transition:opacity .2s}
.hgw-saved.show{opacity:1}
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
