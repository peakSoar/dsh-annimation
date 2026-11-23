window.__ModuleLoader__.load({
	id: "dsh-external/dsh-douyin-window",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_dom_client = require("react-dom/client");
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		// src/client/browser.ts
		let service$1;
		const listeners$1 = /* @__PURE__ */ new Set();
		/** The tab this plugin currently owns (last one it opened or revealed). */
		let openedTab;
		/** The portrait rectangle a fresh window should use. */
		function windowRect() {
			const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
			const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight;
			const width = Math.min(480, Math.max(360, viewportWidth - 80));
			const height = Math.min(780, Math.max(520, viewportHeight - 120));
			return {
				x: Math.max(24, viewportWidth - width - 24),
				y: 64,
				width,
				height
			};
		}
		/** Publish the shell controller; the disposer detaches it. */
		function attachSidebarRight(next) {
			service$1 = next;
			for (const listener of [...listeners$1]) listener();
			return () => {
				if (service$1 !== next) return;
				service$1 = void 0;
				for (const listener of [...listeners$1]) listener();
			};
		}
		/** Observe controller attach/detach. */
		function onSidebarRightChanged(listener) {
			listeners$1.add(listener);
			return () => {
				listeners$1.delete(listener);
			};
		}
		/** The floating pane element that currently holds a tab, if any. */
		function floatingPane(tabId) {
			if (typeof document === "undefined") return void 0;
			for (const pane of document.querySelectorAll("[data-dockkit-float]")) if (pane.querySelector(`[data-dockkit-tab="${tabId}"], [data-sidebar-right-tab="${tabId}"]`) !== null) return pane;
		}
		/** Float a docked tab with the portrait rectangle. */
		function floatWithRect(tabId) {
			const target = service$1;
			if (target === void 0 || openedTab !== tabId) return;
			try {
				target.float(tabId, windowRect());
			} catch {}
		}
		/**
		* Re-float a leftover tiny window once: dock the pane, then float it again with
		* the portrait rectangle. A window the user already sized is left alone.
		*/
		function ensureWindowShape(tabId, attempts = 4) {
			if (openedTab !== tabId || service$1 === void 0) return;
			const pane = floatingPane(tabId);
			if (pane === void 0) floatWithRect(tabId);
			else {
				const box = pane.getBoundingClientRect();
				if (box.width < 360 || box.height < 540) {
					const paneId = pane.getAttribute("data-dockkit-float") ?? "";
					if (paneId !== "") {
						try {
							service$1.dock(paneId);
						} catch {}
						window.setTimeout(() => {
							floatWithRect(tabId);
						}, 80);
					}
				}
			}
			if (attempts <= 0) return;
			window.setTimeout(() => {
				ensureWindowShape(tabId, attempts - 1);
			}, 400);
		}
		/** Adopt the focused Browser tab, shape it, and remember it. */
		function adoptFocusedTab(target) {
			if (target === void 0) return;
			const tab = target.active();
			if (tab === void 0 || tab.kind !== void 0 && tab.kind !== "browser") return;
			openedTab = tab.id;
			ensureWindowShape(tab.id);
		}
		/**
		* Open Douyin in a native Browser tab and float it.
		*
		* `allowExternal` is the manual path (launcher click): when the shell has no
		* Browser tab API, the URL goes to the system browser instead of vanishing.
		*/
		function openDouyin(url, allowExternal = false) {
			if (service$1 === void 0) {
				if (allowExternal) try {
					window.open(url, "_blank", "noopener,noreferrer");
				} catch {}
				return;
			}
			const target = service$1;
			try {
				target.openTab("browser", { params: { url } });
			} catch {
				return;
			}
			adoptFocusedTab(target);
			if (openedTab === void 0) window.setTimeout(() => {
				adoptFocusedTab(target);
			}, 80);
		}
		/** Close the tab this plugin opened, if any. */
		function closeDouyin() {
			if (openedTab === void 0) return;
			const target = openedTab;
			openedTab = void 0;
			try {
				service$1?.close(target);
			} catch {}
		}
		// src/client/i18n.ts
		/**
		* UI copy for the launcher, the toast and settings, in both shell languages.
		*
		* The DSH client locale service is injected in `apply()`; when it is missing
		* the hook falls back to Chinese, and to English only when the browser itself
		* reports English.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "douyin-window";
		const zh = {
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
			"settings.nativeNote": "抖音不支持 iframe 嵌入，这里用 DSH 内置浏览器打开（可登录、可刷视频）。"
		};
		const en = {
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
			"settings.nativeNote": "Douyin refuses iframe embedding, so this opens in DSH's built-in browser (login and playback work)."
		};
		const LOCALES = {
			zh,
			en
		};
		let service;
		/** Attach the live locale service and register both dictionaries. */
		function attachLocale(locale) {
			service = locale;
			const disposers = Object.entries(LOCALES).map(([id, dict]) => locale.register(NS, id, dict));
			return () => {
				for (const off of disposers) off();
				if (service === locale) service = void 0;
			};
		}
		/** The active dictionary (never empty). */
		function dictionary() {
			const active = service?.getLocale().active;
			if (active !== void 0 && active !== "zh") return LOCALES[active] ?? en;
			if (active === void 0 && typeof navigator !== "undefined" && navigator.language.startsWith("en")) return en;
			return zh;
		}
		/** Reactive translate hook: re-renders when the shell language changes. */
		function useT() {
			const [, bump] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				if (service === void 0) return;
				return service.subscribe(() => {
					bump((n) => n + 1);
				});
			}, []);
			return (key) => dictionary()[key] ?? zh[key] ?? key;
		}
		// src/client/icons.tsx
		/** Common attributes for every glyph. */
		function glyph(children) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.7",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children
			});
		}
		function IconSettings() {
			return glyph(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "3"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.11a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.11a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.11a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.11a1.7 1.7 0 0 0-1.49 1Z" })] }));
		}
		function IconCheck() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2.4",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 12.5l4.2 4.2L19 7" })
			});
		}
		// src/client/monitor.ts
		/** Whether any Session currently runs a turn. */
		function isWorking(store) {
			for (const status of store.getSnapshot().values()) if (status.running === true) return true;
			return false;
		}
		/**
		* Subscribe to the coarse working boolean. The listener runs once with the
		* current value (so a plugin mounted mid-turn opens immediately) and then
		* only on real transitions — status stores also notify on approvals, which
		* must not retrigger the window animation.
		*/
		function subscribeWorking(store, listener) {
			let previous = isWorking(store);
			listener(previous);
			return store.subscribe(() => {
				const next = isWorking(store);
				if (next === previous) return;
				previous = next;
				listener(next);
			});
		}
		// src/client/sessions.ts
		let store;
		const listeners = /* @__PURE__ */ new Set();
		/** Publish the shell's status store; the returned disposer detaches it. */
		function attachSessions(next) {
			store = next;
			for (const listener of [...listeners]) listener();
			return () => {
				if (store !== next) return;
				store = void 0;
				for (const listener of [...listeners]) listener();
			};
		}
		/** The current store, or undefined while the service is unavailable. */
		function currentSessions() {
			return store;
		}
		/** Observe service attach/detach. */
		function onSessionsChanged(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
		// src/client/settings.ts
		/**
		* Persisted preferences for the 抖音 floating browser window.
		*
		* Everything the user can change lives in one JSON record under a versioned
		* localStorage key; parsing is total (a corrupted record falls back to the
		* defaults instead of breaking the plugin boot).
		*/
		/** Default page: Douyin's web recommendation feed. */
		const DEFAULT_URL = "https://www.douyin.com/";
		/** localStorage key owned by this plugin. */
		const SETTINGS_KEY = "dsh-douyin-window:settings:v1";
		/** Defaults; also the shape a malformed record falls back to. */
		const DEFAULT_SETTINGS = {
			url: DEFAULT_URL,
			autoOpen: true,
			autoClose: true,
			notify: true,
			showPill: true
		};
		/** localStorage when available (the web shell always provides it). */
		function defaultStorage() {
			try {
				return typeof localStorage === "undefined" ? void 0 : localStorage;
			} catch {
				return;
			}
		}
		/**
		* Accept only absolute http(s) URLs without embedded credentials.
		* Returns the normalized href so two spellings of one page share a value.
		*/
		function normalizeUrl(raw) {
			if (typeof raw !== "string") return void 0;
			const trimmed = raw.trim();
			if (trimmed === "" || trimmed.length > 2048) return void 0;
			let parsed;
			try {
				parsed = new URL(trimmed);
			} catch {
				return;
			}
			if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return void 0;
			if (parsed.username !== "" || parsed.password !== "") return void 0;
			return parsed.href;
		}
		/** Coerce one persisted record into complete settings. */
		function parseSettings(raw) {
			if (typeof raw !== "string" || raw === "") return { ...DEFAULT_SETTINGS };
			let value;
			try {
				value = JSON.parse(raw);
			} catch {
				return { ...DEFAULT_SETTINGS };
			}
			if (typeof value !== "object" || value === null) return { ...DEFAULT_SETTINGS };
			const record = value;
			const bool = (key, fallback) => typeof record[key] === "boolean" ? record[key] : fallback;
			return {
				url: normalizeUrl(record.url) ?? "https://www.douyin.com/",
				autoOpen: bool("autoOpen", DEFAULT_SETTINGS.autoOpen),
				autoClose: bool("autoClose", DEFAULT_SETTINGS.autoClose),
				notify: bool("notify", DEFAULT_SETTINGS.notify),
				showPill: bool("showPill", DEFAULT_SETTINGS.showPill)
			};
		}
		/** Read the persisted settings (never throws). */
		function loadSettings(storage = defaultStorage()) {
			try {
				return parseSettings(storage?.getItem(SETTINGS_KEY));
			} catch {
				return { ...DEFAULT_SETTINGS };
			}
		}
		/** Whether a record already exists (used to decide if profile defaults apply). */
		function hasStoredSettings(storage = defaultStorage()) {
			try {
				return storage?.getItem("dsh-douyin-window:settings:v1") !== null && storage?.getItem("dsh-douyin-window:settings:v1") !== void 0;
			} catch {
				return false;
			}
		}
		/** Persist settings (never throws). */
		function saveSettings(settings, storage = defaultStorage()) {
			try {
				storage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
			} catch {}
		}
		// src/client/settings-panel.tsx
		/**
		* Settings dialog: the opened URL plus the four behaviour switches.
		* Edits apply immediately (each switch writes through to localStorage); the
		* URL field commits on blur or Enter so half-typed addresses never load.
		*/
		/** One labelled switch row. */
		function Row(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dyw-row",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dyw-row-text",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dyw-row-title",
						children: props.title
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dyw-row-desc",
						children: props.description
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					role: "switch",
					"aria-checked": props.on,
					className: `dyw-switch${props.on ? " on" : ""}`,
					onClick: props.onToggle
				})]
			});
		}
		/** Modal settings card. */
		function SettingsPanel(props) {
			const t = useT();
			const [draft, setDraft] = (0, react.useState)(props.settings.url);
			const [error, setError] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				setDraft(props.settings.url);
			}, [props.settings.url]);
			(0, react.useEffect)(() => {
				const onKey = (event) => {
					if (event.key === "Escape") props.onClose();
				};
				window.addEventListener("keydown", onKey);
				return () => {
					window.removeEventListener("keydown", onKey);
				};
			}, [props.onClose]);
			const commitUrl = () => {
				const trimmed = draft.trim();
				if (trimmed === "") {
					setError(false);
					props.onChange({ url: DEFAULT_SETTINGS.url });
					setDraft(DEFAULT_SETTINGS.url);
					return;
				}
				const url = normalizeUrl(trimmed);
				if (url === void 0) {
					setError(true);
					return;
				}
				setError(false);
				props.onChange({ url });
				setDraft(url);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dyw-mask",
				role: "presentation",
				onMouseDown: (event) => {
					if (event.target === event.currentTarget) props.onClose();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dyw-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": t("settings.title"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dyw-modal-head",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dyw-logo",
									"aria-hidden": "true",
									children: "抖"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dyw-modal-title",
									children: t("settings.title")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dyw-btn",
									onClick: props.onClose,
									title: t("settings.close"),
									children: "×"
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dyw-note",
							children: t("settings.nativeNote")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dyw-field",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									className: "dyw-label",
									htmlFor: "dyw-url",
									children: t("settings.url")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									id: "dyw-url",
									className: "dyw-input",
									value: draft,
									placeholder: t("settings.urlPlaceholder"),
									spellCheck: false,
									onChange: (event) => {
										setDraft(event.target.value);
										setError(false);
									},
									onBlur: commitUrl,
									onKeyDown: (event) => {
										if (event.key === "Enter") {
											event.preventDefault();
											commitUrl();
											event.currentTarget.blur();
										}
									}
								}),
								error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dyw-hint err",
									children: t("settings.urlInvalid")
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dyw-hint",
									children: t("settings.urlHint")
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
							title: t("settings.autoOpen"),
							description: t("settings.autoOpenHint"),
							on: props.settings.autoOpen,
							onToggle: () => {
								props.onChange({ autoOpen: !props.settings.autoOpen });
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
							title: t("settings.autoClose"),
							description: t("settings.autoCloseHint"),
							on: props.settings.autoClose,
							onToggle: () => {
								props.onChange({ autoClose: !props.settings.autoClose });
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
							title: t("settings.notify"),
							description: t("settings.notifyHint"),
							on: props.settings.notify,
							onToggle: () => {
								props.onChange({ notify: !props.settings.notify });
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
							title: t("settings.showPill"),
							description: t("settings.showPillHint"),
							on: props.settings.showPill,
							onToggle: () => {
								props.onChange({ showPill: !props.settings.showPill });
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dyw-modal-foot",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dyw-btn primary",
									onClick: props.onOpenNow,
									children: t("settings.openNow")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: { flex: 1 } }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dyw-btn",
									onClick: props.onClose,
									children: t("settings.close")
								})
							]
						})
					]
				})
			});
		}
		// src/client/styles.ts
		/**
		* Stylesheet for the surfaces this plugin still paints: the bottom-right
		* launcher pill, the completion toast and the settings dialog.
		*
		* The Douyin page itself is a native shell Browser tab, so there is no iframe
		* chrome left to style. Every rule is `dyw-` prefixed and injected once under a
		* stable id.
		*/
		/** Douyin accent (cyan → pink). */
		const ACCENT = "#25f4ee";
		const ACCENT_PINK = "#fe2c55";
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
		function ensureStyles() {
			if (typeof document === "undefined") return;
			if (document.getElementById(STYLE_ID) !== null) return;
			const style = document.createElement("style");
			style.id = STYLE_ID;
			style.textContent = CSS;
			document.head.appendChild(style);
		}
		// src/client/toast.tsx
		/** Top-right completion toast. */
		function CompletionToast(props) {
			const t = useT();
			if (!props.visible) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dyw-toast",
				role: "status",
				"aria-live": "polite",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dyw-toast-icon",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dyw-toast-text",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dyw-toast-title",
							children: t("toast.title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dyw-toast-hint",
							children: props.hint
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dyw-toast-action",
						onClick: props.onAction,
						children: t("toast.action")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dyw-toast-close",
						onClick: props.onDismiss,
						"aria-label": t("toast.close"),
						title: t("toast.close"),
						children: "×"
					})
				]
			});
		}
		// src/client/app.tsx
		/**
		* Top-level state machine for the 抖音 window.
		*
		* Douyin cannot be embedded in an iframe (it answers with a captcha page), so
		* "opening the window" means asking the shell for a native Browser tab and
		* floating it. The plugin therefore owns no panel: it reacts to the host's
		* Session status, drives the native tab, and paints only the launcher pill, the
		* completion toast and the settings dialog.
		*/
		/** Delay between "no turn running" and closing the window. */
		const FINISH_GRACE_MS = 1500;
		/** How long the completion toast stays on screen. */
		const TOAST_VISIBLE_MS = 6e3;
		/** Host route that may pin the opened page for a whole profile. */
		const CONFIG_ENDPOINT = "/douyin-window/config";
		/** Root component mounted once into the shell document. */
		function App() {
			const t = useT();
			const [settings, setSettings] = (0, react.useState)(loadSettings);
			const settingsRef = (0, react.useRef)(settings);
			settingsRef.current = settings;
			const workingRef = (0, react.useRef)(false);
			const [toast, setToast] = (0, react.useState)(false);
			const [settingsOpen, setSettingsOpen] = (0, react.useState)(false);
			/** The current working cycle already opened its tab. */
			const openedCycleRef = (0, react.useRef)(false);
			const finishTimer = (0, react.useRef)(void 0);
			const toastTimer = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				ensureStyles();
				return () => {
					window.clearTimeout(finishTimer.current);
					window.clearTimeout(toastTimer.current);
				};
			}, []);
			/** React to the harness starting or finishing work. */
			const handleWorkingRef = (0, react.useRef)(() => {});
			handleWorkingRef.current = (next) => {
				const prefs = settingsRef.current;
				window.clearTimeout(finishTimer.current);
				window.clearTimeout(toastTimer.current);
				setToast(false);
				if (next) {
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
			(0, react.useEffect)(() => {
				let detachStore;
				const bind = () => {
					detachStore?.();
					detachStore = void 0;
					const store = currentSessions();
					if (store === void 0) return;
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
			(0, react.useEffect)(() => {
				return onSidebarRightChanged(() => {
					const prefs = settingsRef.current;
					if (!workingRef.current || !prefs.autoOpen || openedCycleRef.current) return;
					openDouyin(prefs.url);
					openedCycleRef.current = true;
				});
			}, []);
			/** First run only: a profile-pinned URL becomes the default. */
			(0, react.useEffect)(() => {
				if (hasStoredSettings()) return;
				let cancelled = false;
				fetch(CONFIG_ENDPOINT, { headers: { accept: "application/json" } }).then(async (response) => response.ok ? await response.json() : void 0).then((body) => {
					if (cancelled || body === void 0) return;
					const url = normalizeUrl(body.url);
					if (url === void 0) return;
					setSettings((prev) => {
						if (prev.url !== DEFAULT_SETTINGS.url) return prev;
						const next = {
							...prev,
							url
						};
						saveSettings(next);
						return next;
					});
				}).catch(() => {});
				return () => {
					cancelled = true;
				};
			}, []);
			const patchSettings = (0, react.useCallback)((patch) => {
				setSettings((prev) => {
					const next = {
						...prev,
						...patch
					};
					saveSettings(next);
					return next;
				});
			}, []);
			/** Open Douyin from the pill, the toast or the settings dialog. */
			const openNow = () => {
				setToast(false);
				openDouyin(settingsRef.current.url, true);
			};
			const toastHint = settings.autoClose ? t("toast.hint") : t("toast.hintKept");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				settings.showPill && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dyw-pill",
					"data-dsh-douyin-pill": "",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: openNow,
						title: t("action.open"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dyw-logo",
							"aria-hidden": "true",
							children: "抖"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dyw-label",
							children: t("app.title")
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dyw-gear",
						onClick: () => {
							setSettingsOpen(true);
						},
						title: t("action.settings"),
						"aria-label": t("action.settings"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSettings, {})
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CompletionToast, {
					visible: toast,
					hint: toastHint,
					onAction: openNow,
					onDismiss: () => {
						setToast(false);
					}
				}),
				settingsOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsPanel, {
					settings,
					onChange: patchSettings,
					onClose: () => {
						setSettingsOpen(false);
					},
					onOpenNow: () => {
						openNow();
						setSettingsOpen(false);
					}
				})
			] });
		}
		// src/client/index.tsx
		/**
		* dsh-douyin-window client entry: mounts the launcher/toast/settings surfaces
		* and wires the three shell services it needs.
		*
		* - `locale`: UI language (optional; Chinese is the fallback).
		* - `uiSession`: per-Session running status, the signal that drives
		*   auto-open / auto-close.
		* - `sidebarRight`: the native Browser tab controller that actually shows
		*   Douyin (iframes are refused by the site). All three are dynamic injects so
		*   the plugin boot never hard-depends on one UI package.
		*/
		function apply(ctx) {
			ctx.inject(["locale"], (lctx) => {
				const locale = lctx.locale;
				if (locale === void 0) return;
				lctx.effect(() => attachLocale(locale), "douyin-window: attach locale");
			});
			ctx.inject(["uiSession"], (sctx) => {
				const store = sctx.uiSession?.sessionStatus;
				if (store === void 0) return;
				sctx.effect(() => attachSessions(store), "douyin-window: attach session status");
			});
			ctx.inject(["sidebarRight"], (bctx) => {
				const service = bctx.sidebarRight;
				if (service === void 0) return;
				bctx.effect(() => attachSidebarRight(service), "douyin-window: attach sidebar browser");
			});
			ctx.effect(() => {
				const host = document.createElement("div");
				host.setAttribute("data-dsh-douyin-window", "");
				document.body.appendChild(host);
				const root = (0, react_dom_client.createRoot)(host);
				root.render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(App, {}));
				return () => {
					try {
						root.unmount();
					} catch {}
					host.remove();
				};
			}, "douyin-window: launcher and toast");
		}
		exports.apply = apply;
		return module.exports;
	}
});

//# sourceMappingURL=client-registry.js.map