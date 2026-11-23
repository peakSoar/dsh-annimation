/**
 * UI copy for the launcher, the toast and settings, in both shell languages.
 *
 * The DSH client locale service is injected in `apply()`; when it is missing
 * the hook falls back to Chinese, and to English only when the browser itself
 * reports English.
 */
import { useEffect, useState } from "react";

/** Structural subset of the DSH client locale service this plugin uses. */
export interface LocaleService {
  register(namespace: string, locale: string, dict: Record<string, string>): () => void;
  getLocale(): { active: string; revision: number };
  subscribe(listener: () => void): () => void;
}

/** Dictionary namespace owned by this plugin. */
export const NS = "douyin-window";

const zh: Record<string, string> = {
  "app.title": "抖音",
  "action.open": "打开抖音",
  "action.settings": "设置",
  "action.external": "在浏览器打开",
  "toast.title": "工作结束了",
  "toast.hint": "抖音已自动收起",
  "toast.hintKept": "想再刷一会儿的话，点右边",
  "toast.action": "再看一会儿",
  "toast.close": "关闭提示",
  "settings.title": "抖音浮窗设置",
  "settings.url": "打开地址",
  "settings.urlPlaceholder": "https://www.douyin.com/",
  "settings.urlInvalid": "请输入完整的 http(s) 链接",
  "settings.urlHint": "留空即使用默认推荐页；登录状态由 DSH 内置浏览器保存，不需要每次重登。",
  "settings.autoOpen": "开始时自动打开",
  "settings.autoOpenHint": "DeepSeek Harness 开始工作时，自动打开并浮动抖音。",
  "settings.autoClose": "结束时自动收起",
  "settings.autoCloseHint": "任务结束（无运行中的会话）后关闭这个抖音窗口。",
  "settings.notify": "结束时飘提示",
  "settings.notifyHint": "结束瞬间在右上角提示「工作结束了」。",
  "settings.showPill": "显示右下角入口",
  "settings.showPillHint": "保留一个小胶囊，随时手动打开抖音或设置。",
  "settings.openNow": "立即打开",
  "settings.close": "关闭设置",
  "settings.nativeNote": "抖音不支持 iframe 嵌入，这里用 DSH 内置浏览器打开（可登录、可刷视频）。",
};

const en: Record<string, string> = {
  "app.title": "Douyin",
  "action.open": "Open Douyin",
  "action.settings": "Settings",
  "action.external": "Open in browser",
  "toast.title": "Work finished",
  "toast.hint": "Douyin was closed",
  "toast.hintKept": "Tap to keep scrolling",
  "toast.action": "Watch a bit",
  "toast.close": "Dismiss",
  "settings.title": "Douyin window settings",
  "settings.url": "Page to open",
  "settings.urlPlaceholder": "https://www.douyin.com/",
  "settings.urlInvalid": "Enter a full http(s) URL",
  "settings.urlHint": "Empty uses the default feed. Login is kept by DSH's built-in browser, so it survives restarts.",
  "settings.autoOpen": "Open when work starts",
  "settings.autoOpenHint": "Open and float Douyin whenever DeepSeek Harness starts a turn.",
  "settings.autoClose": "Close when work ends",
  "settings.autoCloseHint": "Close this Douyin window once no session is running.",
  "settings.notify": "Toast at the end",
  "settings.notifyHint": "Float a “Work finished” notice on the next turn end.",
  "settings.showPill": "Show the bottom-right launcher",
  "settings.showPillHint": "Keep a small pill to open Douyin or settings manually.",
  "settings.openNow": "Open now",
  "settings.close": "Close settings",
  "settings.nativeNote": "Douyin refuses iframe embedding, so this opens in DSH's built-in browser (login and playback work).",
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
