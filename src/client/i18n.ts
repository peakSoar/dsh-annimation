/**
 * UI copy for the window, in both shell languages.
 *
 * The DSH client locale service is injected in `apply()`; when it is missing
 * (or a non-dictionary language is active) the hook falls back to Chinese,
 * and English only when the browser itself reports English.
 */
import { useEffect, useState } from "react";

/** Structural subset of the DSH client locale service this plugin uses. */
export interface LocaleService {
  register(namespace: string, locale: string, dict: Record<string, string>): () => void;
  getLocale(): { active: string; revision: number };
  subscribe(listener: () => void): () => void;
}

/** Dictionary namespace owned by this plugin. */
export const NS = "hongguo-window";

const zh: Record<string, string> = {
  "app.title": "红果短剧",
  "status.working": "工作中",
  "status.idle": "空闲",
  "status.workingTip": "DeepSeek Harness 正在工作，红果短剧随任务显示",
  "status.idleTip": "任务已结束，窗口已收起（可在设置里关掉自动收起）",
  "action.reload": "刷新页面",
  "action.settings": "设置",
  "action.external": "在浏览器打开",
  "action.minimize": "最小化",
  "action.close": "关闭",
  "action.restore": "展开红果短剧",
  "action.retry": "重试",
  "frame.loading": "正在打开红果短剧…",
  "frame.blocked.title": "页面没能加载出来",
  "frame.blocked.body": "站点可能拒绝被嵌入，或当前网络不通。可以重试，或用浏览器打开。",
  "frame.blocked.external": "用浏览器打开",
  "toast.title": "工作结束了",
  "toast.hint": "红果短剧已自动收起",
  "toast.hintIdle": "想再刷一会儿的话，点右边",
  "toast.action": "再看一会儿",
  "toast.close": "关闭提示",
  "launcher": "红果短剧",
  "launcher.tip": "打开红果短剧浮窗",
  "settings.title": "红果短剧设置",
  "settings.url": "嵌入页面",
  "settings.urlPlaceholder": "https://hongguoduanju.com/?tab=feed",
  "settings.urlInvalid": "请输入完整的 http(s) 链接",
  "settings.urlHint": "留空即使用默认信息流入口；也可以在 profile 的 cordis.patch.yml 里固定。",
  "settings.autoOpen": "开始时自动打开",
  "settings.autoOpenHint": "DeepSeek Harness 开始工作时，自动弹出浮窗。",
  "settings.autoClose": "结束时自动收起",
  "settings.autoCloseHint": "任务结束（无运行中的会话）后收起浮窗。",
  "settings.notify": "结束时飘提示",
  "settings.notifyHint": "结束瞬间在右上角提示「工作结束了」。",
  "settings.idleLauncher": "空闲时保留入口",
  "settings.idleLauncherHint": "收起后留一个小按钮，随时手动打开。",
  "settings.resetRect": "重置窗口位置",
  "settings.preview": "预览结束效果",
  "settings.saved": "已保存",
  "settings.close": "关闭设置",
  "settings.defaultUrl": "恢复默认入口",
};

const en: Record<string, string> = {
  "app.title": "Hongguo Shorts",
  "status.working": "Working",
  "status.idle": "Idle",
  "status.workingTip": "DeepSeek Harness is working; the shorts window follows the task",
  "status.idleTip": "Task finished; the window was stowed (disable auto-stow in settings)",
  "action.reload": "Reload page",
  "action.settings": "Settings",
  "action.external": "Open in browser",
  "action.minimize": "Minimize",
  "action.close": "Close",
  "action.restore": "Restore Hongguo Shorts",
  "action.retry": "Retry",
  "frame.loading": "Opening Hongguo Shorts…",
  "frame.blocked.title": "This page did not load",
  "frame.blocked.body": "The site may refuse to be embedded, or the network is unavailable. Retry, or open it in a browser.",
  "frame.blocked.external": "Open in browser",
  "toast.title": "Work finished",
  "toast.hint": "Hongguo Shorts was stowed",
  "toast.hintIdle": "Tap to keep watching",
  "toast.action": "Watch a bit",
  "toast.close": "Dismiss",
  "launcher": "Hongguo Shorts",
  "launcher.tip": "Open the Hongguo Shorts window",
  "settings.title": "Hongguo Shorts settings",
  "settings.url": "Embedded page",
  "settings.urlPlaceholder": "https://hongguoduanju.com/?tab=feed",
  "settings.urlInvalid": "Enter a full http(s) URL",
  "settings.urlHint": "Empty uses the default feed. A profile cordis.patch.yml can pin it too.",
  "settings.autoOpen": "Open when work starts",
  "settings.autoOpenHint": "Pop the window open whenever DeepSeek Harness starts a turn.",
  "settings.autoClose": "Stow when work ends",
  "settings.autoCloseHint": "Hide the window once no session is running.",
  "settings.notify": "Toast at the end",
  "settings.notifyHint": "Float a “Work finished” notice on the next turn end.",
  "settings.idleLauncher": "Keep a launcher while idle",
  "settings.idleLauncherHint": "Leave a small button so the window can be reopened.",
  "settings.resetRect": "Reset window position",
  "settings.preview": "Preview finish effect",
  "settings.saved": "Saved",
  "settings.close": "Close settings",
  "settings.defaultUrl": "Restore default entry",
};

const LOCALES: Record<string, Record<string, string>> = { zh, en };

let service: LocaleService | undefined;

/** Attach the live locale service and register both dictionaries. */
export function attachLocale(locale: LocaleService): () => void {
  service = locale;
  const disposers = Object.entries(LOCALES).map(([id, dict]) => locale.register(NS, id, dict));
  return () => {
    for (const off of disposers) off();
    if (service === locale) service = undefined;
  };
}

/** The active dictionary (never empty). */
function dictionary(): Record<string, string> {
  const active = service?.getLocale().active;
  if (active !== undefined && active !== "zh") return LOCALES[active] ?? en;
  if (active === undefined && typeof navigator !== "undefined" && navigator.language.startsWith("en")) {
    return en;
  }
  return zh;
}

/** Translate one key outside React. */
export function tr(key: string): string {
  return dictionary()[key] ?? zh[key] ?? key;
}

/** Reactive translate hook: re-renders when the shell language changes. */
export function useT(): (key: string) => string {
  const [, bump] = useState(0);
  useEffect(() => {
    if (service === undefined) return;
    return service.subscribe(() => {
      bump((n) => n + 1);
    });
  }, []);
  return (key: string): string => dictionary()[key] ?? zh[key] ?? key;
}
