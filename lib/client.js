window.__ModuleLoader__.load({
	id: "dsh-hongguo-window",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_dom_client = require("react-dom/client");
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
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
		// src/client/i18n.ts
		/**
		* UI copy for the window, in both shell languages.
		*
		* The DSH client locale service is injected in `apply()`; when it is missing
		* (or a non-dictionary language is active) the hook falls back to Chinese,
		* and English only when the browser itself reports English.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "hongguo-window";
		const zh = {
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
			"settings.defaultUrl": "恢复默认入口"
		};
		const en = {
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
			"settings.defaultUrl": "Restore default entry"
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
		// src/client/settings.ts
		/**
		* Persisted preferences for the 红果短剧 floating window.
		*
		* Everything the user can change lives in one JSON record under a versioned
		* localStorage key; parsing is total (a corrupted record falls back to the
		* defaults instead of breaking the plugin boot).
		*/
		/** Default page: the public 红果短剧 information feed. */
		const DEFAULT_URL = "https://hongguoduanju.com/?tab=feed";
		/** localStorage keys owned by this plugin. */
		const SETTINGS_KEY = "dsh-hongguo-window:settings:v2";
		/** Defaults; also the shape a malformed record falls back to. */
		const DEFAULT_SETTINGS = {
			url: DEFAULT_URL,
			autoOpen: true,
			autoClose: true,
			notify: true,
			idleLauncher: false
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
				url: normalizeUrl(record.url) ?? "https://hongguoduanju.com/?tab=feed",
				autoOpen: bool("autoOpen", DEFAULT_SETTINGS.autoOpen),
				autoClose: bool("autoClose", DEFAULT_SETTINGS.autoClose),
				notify: bool("notify", DEFAULT_SETTINGS.notify),
				idleLauncher: bool("idleLauncher", DEFAULT_SETTINGS.idleLauncher)
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
				return storage?.getItem("dsh-hongguo-window:settings:v2") !== null && storage?.getItem("dsh-hongguo-window:settings:v2") !== void 0;
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
		* Settings dialog: the embedded URL plus the four behaviour switches.
		* Edits apply immediately (each switch writes through to localStorage); the
		* URL field commits on blur or Enter so half-typed addresses never load.
		*/
		/** One labelled switch row. */
		function Row(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "hgw-row",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "hgw-row-text",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hgw-row-title",
						children: props.title
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hgw-row-desc",
						children: props.description
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					role: "switch",
					"aria-checked": props.on,
					className: `hgw-switch${props.on ? " on" : ""}`,
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
				className: "hgw-mask",
				role: "presentation",
				onMouseDown: (event) => {
					if (event.target === event.currentTarget) props.onClose();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "hgw-modal",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": t("settings.title"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "hgw-modal-head",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "hgw-logo",
									"aria-hidden": "true",
									children: "红"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "hgw-modal-title",
									children: t("settings.title")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "hgw-icon",
									onClick: props.onClose,
									title: t("settings.close"),
									"aria-label": t("settings.close"),
									children: "×"
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "hgw-field",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									className: "hgw-label",
									htmlFor: "hgw-url",
									children: t("settings.url")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									id: "hgw-url",
									className: "hgw-input",
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
									className: "hgw-hint err",
									children: t("settings.urlInvalid")
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "hgw-hint",
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
							title: t("settings.idleLauncher"),
							description: t("settings.idleLauncherHint"),
							on: props.settings.idleLauncher,
							onToggle: () => {
								props.onChange({ idleLauncher: !props.settings.idleLauncher });
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "hgw-modal-foot",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "hgw-btn",
									onClick: props.onResetRect,
									children: t("settings.resetRect")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "hgw-btn",
									onClick: props.onPreviewFinish,
									children: t("settings.preview")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: { flex: 1 } }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "hgw-btn primary",
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
		* One stylesheet for every surface the plugin paints: the floating panel, the
		* minimized launcher, the completion toast and the settings dialog.
		*
		* The shell is a third-party document, so every rule is `hgw-` prefixed and
		* the stylesheet is injected once under a stable id. Colors are literal so the
		* window keeps its identity in both shell themes.
		*/
		/** Brand accent (红果 red-orange). */
		const ACCENT = "#ff4a3d";
		/** Secondary accent used for the gradient. */
		const ACCENT_DEEP = "#ff2d55";
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
		function ensureStyles() {
			if (typeof document === "undefined") return;
			if (document.getElementById(STYLE_ID) !== null) return;
			const style = document.createElement("style");
			style.id = STYLE_ID;
			style.textContent = CSS;
			document.head.appendChild(style);
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
		function IconReload() {
			return glyph(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M20 11a8 8 0 1 0-2.6 6.2" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M20 5v6h-6" })] }));
		}
		function IconSettings() {
			return glyph(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "3"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.11a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.11a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.11a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.11a1.7 1.7 0 0 0-1.49 1Z" })] }));
		}
		function IconExternal() {
			return glyph(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14 4h6v6" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M20 4 11 13" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M18 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5" })
			] }));
		}
		function IconMinimize() {
			return glyph(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 12h12" }));
		}
		function IconClose() {
			return glyph(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M7 7l10 10" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M17 7 7 17" })] }));
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
		// src/client/toast.tsx
		/** Top-right completion toast. */
		function CompletionToast(props) {
			const t = useT();
			if (!props.visible) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "hgw-toast",
				role: "status",
				"aria-live": "polite",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hgw-toast-icon",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "hgw-toast-text",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "hgw-toast-title",
							children: t("toast.title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "hgw-toast-hint",
							children: props.hint
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "hgw-toast-action",
						onClick: props.onAction,
						children: t("toast.action")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "hgw-toast-close",
						onClick: props.onDismiss,
						"aria-label": t("toast.close"),
						title: t("toast.close"),
						children: "×"
					})
				]
			});
		}
		// src/client/geometry.ts
		/** localStorage key for the remembered rectangle. */
		const RECT_KEY = "dsh-hongguo-window:rect:v2";
		/** Fallback viewport for non-DOM callers. */
		const FALLBACK_VIEWPORT = {
			width: 1280,
			height: 800
		};
		/** Default rectangle: a portrait window docked to the top-right corner. */
		function defaultRect(viewport = FALLBACK_VIEWPORT) {
			const w = Math.min(410, Math.max(320, viewport.width - 24));
			const h = Math.min(760, Math.max(460, viewport.height - 96));
			return clampRect({
				x: viewport.width - w - 16,
				y: Math.min(64, Math.max(12, viewport.height - h - 12)),
				w,
				h
			}, viewport);
		}
		/** Clamp a rectangle so it stays fully visible and at least MIN_W × MIN_H. */
		function clampRect(rect, viewport = FALLBACK_VIEWPORT) {
			const maxW = Math.max(320, viewport.width - 24);
			const maxH = Math.max(460, viewport.height - 24);
			const w = Math.round(Math.min(Math.max(rect.w, 320), maxW));
			const h = Math.round(Math.min(Math.max(rect.h, 460), maxH));
			return {
				x: Math.round(Math.min(Math.max(rect.x, 12), Math.max(12, viewport.width - w - 12))),
				y: Math.round(Math.min(Math.max(rect.y, 12), Math.max(12, viewport.height - h - 12))),
				w,
				h
			};
		}
		/** Coerce persisted JSON into a rectangle, or undefined when unusable. */
		function parseRect(raw) {
			if (typeof raw !== "object" || raw === null) return void 0;
			const record = raw;
			const num = (key) => {
				const value = record[key];
				return typeof value === "number" && Number.isFinite(value) ? value : void 0;
			};
			const x = num("x");
			const y = num("y");
			const w = num("w");
			const h = num("h");
			if (x === void 0 || y === void 0 || w === void 0 || h === void 0) return void 0;
			if (w <= 0 || h <= 0) return void 0;
			return {
				x,
				y,
				w,
				h
			};
		}
		/** Read the remembered rectangle, falling back to the default placement. */
		function loadRect(viewport, storage) {
			try {
				const raw = storage?.getItem(RECT_KEY);
				if (typeof raw !== "string" || raw === "") return defaultRect(viewport);
				return clampRect(parseRect(JSON.parse(raw)) ?? defaultRect(viewport), viewport);
			} catch {
				return defaultRect(viewport);
			}
		}
		/** Persist the current rectangle (never throws). */
		function saveRect(rect, storage) {
			try {
				storage?.setItem(RECT_KEY, JSON.stringify(rect));
			} catch {}
		}
		/** Apply one pointer delta to a rectangle while honouring the opposite edge. */
		function resizeRect(start, dir, dx, dy, viewport) {
			let { x, y, w, h } = start;
			if (dir.includes("e")) w = Math.min(Math.max(start.w + dx, 320), viewport.width - start.x - 12);
			if (dir.includes("s")) h = Math.min(Math.max(start.h + dy, 460), viewport.height - start.y - 12);
			if (dir.includes("w")) {
				w = Math.min(Math.max(start.w - dx, 320), start.x + start.w - 12);
				x = start.x + start.w - w;
			}
			if (dir.includes("n")) {
				h = Math.min(Math.max(start.h - dy, 460), start.y + start.h - 12);
				y = start.y + start.h - h;
			}
			return clampRect({
				x,
				y,
				w: Math.round(w),
				h: Math.round(h)
			}, viewport);
		}
		// src/client/window.tsx
		/**
		* The floating window itself: a draggable, resizable portrait panel that
		* embeds 红果短剧 in an iframe, plus its minimized pill.
		*
		* The iframe is a plain cross-origin frame: the plugin never reads the site,
		* never proxies it and never injects script into it. That also means a blocked
		* frame cannot be detected from script, so a slow load surfaces a manual
		* retry / open-in-browser card after a timeout.
		*/
		/** Corner + edge handles offered by the panel. */
		const HANDLES = [
			"n",
			"s",
			"e",
			"w",
			"ne",
			"nw",
			"se",
			"sw"
		];
		/** How long a frame may stay blank before the fallback card appears. */
		const FRAME_TIMEOUT_MS = 18e3;
		/** Live page size (falls back to a desktop-ish viewport outside a browser). */
		function readViewport() {
			if (typeof window === "undefined") return {
				width: 1280,
				height: 800
			};
			return {
				width: window.innerWidth,
				height: window.innerHeight
			};
		}
		/** localStorage when available. */
		function storage() {
			try {
				return typeof localStorage === "undefined" ? void 0 : localStorage;
			} catch {
				return;
			}
		}
		/** Cross-origin navigation is the one action the host document can own. */
		function openExternal(url) {
			window.open(url, "_blank", "noopener,noreferrer");
		}
		/** Floating window + minimized pill. */
		function HongguoWindow(props) {
			const t = useT();
			const [viewport, setViewport] = (0, react.useState)(readViewport);
			const [rect, setRect] = (0, react.useState)(() => loadRect(readViewport(), storage()));
			const [reloadKey, setReloadKey] = (0, react.useState)(0);
			const [frame, setFrame] = (0, react.useState)("loading");
			/** Latest rectangle, readable synchronously by the pointer-up handlers. */
			const rectRef = (0, react.useRef)(rect);
			const viewportRef = (0, react.useRef)(viewport);
			viewportRef.current = viewport;
			const dragRef = (0, react.useRef)(null);
			const resizeRef = (0, react.useRef)(null);
			const frameTimer = (0, react.useRef)(void 0);
			const updateRect = (0, react.useCallback)((next) => {
				rectRef.current = next;
				setRect(next);
			}, []);
			/** Keep the panel inside the viewport on window resizes. */
			(0, react.useEffect)(() => {
				const onResize = () => {
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
			(0, react.useEffect)(() => {
				if (props.resetToken === 0) return;
				const next = defaultRect(readViewport());
				updateRect(next);
				saveRect(next, storage());
			}, [props.resetToken, updateRect]);
			/** A new URL or a manual reload always restarts the load watchdog. */
			const startWatchdog = (0, react.useCallback)(() => {
				setFrame("loading");
				window.clearTimeout(frameTimer.current);
				frameTimer.current = window.setTimeout(() => {
					setFrame((prev) => prev === "loading" ? "blocked" : prev);
				}, FRAME_TIMEOUT_MS);
			}, []);
			(0, react.useEffect)(() => {
				startWatchdog();
				return () => {
					window.clearTimeout(frameTimer.current);
				};
			}, [
				reloadKey,
				props.settings.url,
				startWatchdog
			]);
			const reload = () => {
				setReloadKey((key) => key + 1);
			};
			const startDrag = (event) => {
				if (event.target.closest("button") !== null) return;
				event.preventDefault();
				dragRef.current = {
					pointerX: event.clientX,
					pointerY: event.clientY,
					rect: rectRef.current
				};
				event.currentTarget.setPointerCapture(event.pointerId);
			};
			const moveDrag = (event) => {
				const drag = dragRef.current;
				if (drag === null) return;
				updateRect(clampRect({
					...drag.rect,
					x: drag.rect.x + event.clientX - drag.pointerX,
					y: drag.rect.y + event.clientY - drag.pointerY
				}, viewportRef.current));
			};
			const endDrag = () => {
				if (dragRef.current === null) return;
				dragRef.current = null;
				saveRect(rectRef.current, storage());
			};
			const startResize = (dir) => (event) => {
				event.preventDefault();
				event.stopPropagation();
				resizeRef.current = {
					dir,
					pointerX: event.clientX,
					pointerY: event.clientY,
					rect: rectRef.current
				};
				event.currentTarget.setPointerCapture(event.pointerId);
			};
			const moveResize = (event) => {
				const resize = resizeRef.current;
				if (resize === null) return;
				updateRect(resizeRect(resize.rect, resize.dir, event.clientX - resize.pointerX, event.clientY - resize.pointerY, viewportRef.current));
			};
			const endResize = () => {
				if (resizeRef.current === null) return;
				resizeRef.current = null;
				saveRect(rectRef.current, storage());
			};
			if (!props.open) return null;
			if (props.minimized) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "hgw-pill",
				onClick: props.onRestore,
				title: t("action.restore"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hgw-logo",
						"aria-hidden": "true",
						children: "红"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("launcher") }),
					props.working && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hgw-dot on",
						"aria-hidden": "true"
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "hgw-panel",
				"data-dsh-hongguo-window": "",
				style: {
					left: rect.x,
					top: rect.y,
					width: rect.w,
					height: rect.h
				},
				role: "dialog",
				"aria-label": t("app.title"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "hgw-bar",
						onPointerDown: startDrag,
						onPointerMove: moveDrag,
						onPointerUp: endDrag,
						onPointerCancel: endDrag,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "hgw-logo",
								"aria-hidden": "true",
								children: "红"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "hgw-title",
								children: t("app.title")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `hgw-dot${props.working ? " on" : ""}`,
								title: props.working ? t("status.workingTip") : t("status.idleTip"),
								"aria-hidden": "true"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "hgw-status",
								children: props.working ? t("status.working") : t("status.idle")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "hgw-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "hgw-icon",
								onClick: reload,
								title: t("action.reload"),
								"aria-label": t("action.reload"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconReload, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "hgw-icon",
								onClick: props.onOpenSettings,
								title: t("action.settings"),
								"aria-label": t("action.settings"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSettings, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "hgw-icon",
								onClick: () => {
									openExternal(props.settings.url);
								},
								title: t("action.external"),
								"aria-label": t("action.external"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconExternal, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "hgw-icon",
								onClick: props.onMinimize,
								title: t("action.minimize"),
								"aria-label": t("action.minimize"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconMinimize, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "hgw-icon danger",
								onClick: props.onClose,
								title: t("action.close"),
								"aria-label": t("action.close"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClose, {})
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "hgw-frame-wrap",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
								className: "hgw-frame",
								src: props.settings.url,
								title: t("app.title"),
								onLoad: () => {
									window.clearTimeout(frameTimer.current);
									setFrame("ready");
								},
								allow: "autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write",
								allowFullScreen: true,
								referrerPolicy: "strict-origin-when-cross-origin"
							}, `${props.settings.url}#${reloadKey}`),
							frame === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "hgw-overlay",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "hgw-spinner",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("frame.loading") })]
							}),
							frame === "blocked" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "hgw-blocked",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "hgw-blocked-card",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "hgw-blocked-title",
											children: t("frame.blocked.title")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "hgw-blocked-body",
											children: t("frame.blocked.body")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "hgw-actions",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "hgw-btn",
												onClick: reload,
												children: t("action.retry")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "hgw-btn primary",
												onClick: () => {
													openExternal(props.settings.url);
												},
												children: t("frame.blocked.external")
											})]
										})
									]
								})
							})
						]
					}),
					HANDLES.map((dir) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "hgw-handle",
						"data-dir": dir,
						onPointerDown: startResize(dir),
						onPointerMove: moveResize,
						onPointerUp: endResize,
						onPointerCancel: endResize
					}, dir))
				]
			});
		}
		/** Small idle launcher shown while the panel is closed (optional). */
		function HongguoLauncher(props) {
			const t = useT();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "hgw-pill",
				onClick: props.onOpen,
				title: t("launcher.tip"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "hgw-logo",
					"aria-hidden": "true",
					children: "红"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("launcher") })]
			});
		}
		// src/client/app.tsx
		/**
		* Top-level state machine for the 红果短剧 window.
		*
		* Inputs: the host's Session status store (any turn in flight = working) and
		* the user's persisted preferences. Outputs: the floating window, the
		* completion toast and the optional idle launcher.
		*
		* Two timers guard the edges: a short grace period after the last turn ends
		* (a continuation or a quick second turn must not flash the window), and the
		* toast's own display window.
		*/
		/** Delay between "no turn running" and stowing the window. */
		const FINISH_GRACE_MS = 1500;
		/** How long the completion toast stays on screen. */
		const TOAST_VISIBLE_MS = 6e3;
		/** Host route that may pin the embedded page for a whole profile. */
		const CONFIG_ENDPOINT = "/hongguo-wall/config";
		/** Root component mounted once into the shell document. */
		function App() {
			const t = useT();
			const [settings, setSettings] = (0, react.useState)(loadSettings);
			const settingsRef = (0, react.useRef)(settings);
			settingsRef.current = settings;
			const [working, setWorking] = (0, react.useState)(false);
			const workingRef = (0, react.useRef)(false);
			const [open, setOpen] = (0, react.useState)(false);
			const [minimized, setMinimized] = (0, react.useState)(false);
			const [toast, setToast] = (0, react.useState)(false);
			const [settingsOpen, setSettingsOpen] = (0, react.useState)(false);
			const [resetToken, setResetToken] = (0, react.useState)(0);
			/** True once the user closed the panel inside the current working cycle. */
			const dismissedRef = (0, react.useRef)(false);
			const finishTimer = (0, react.useRef)(void 0);
			const toastTimer = (0, react.useRef)(void 0);
			const clearTimers = (0, react.useCallback)(() => {
				window.clearTimeout(finishTimer.current);
				window.clearTimeout(toastTimer.current);
			}, []);
			(0, react.useEffect)(() => {
				ensureStyles();
				return clearTimers;
			}, [clearTimers]);
			/** React to the harness starting or finishing work. */
			const handleWorkingRef = (0, react.useRef)(() => {});
			handleWorkingRef.current = (next) => {
				const prefs = settingsRef.current;
				window.clearTimeout(finishTimer.current);
				window.clearTimeout(toastTimer.current);
				setToast(false);
				if (next) {
					if (!workingRef.current) dismissedRef.current = false;
					workingRef.current = true;
					setWorking(true);
					if (prefs.autoOpen && !dismissedRef.current) {
						setMinimized(false);
						setOpen(true);
					}
					return;
				}
				workingRef.current = false;
				setWorking(false);
				finishTimer.current = window.setTimeout(() => {
					if (workingRef.current) return;
					if (prefs.autoClose) {
						setOpen(false);
						setMinimized(false);
					}
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
			const handleClose = () => {
				setOpen(false);
				setMinimized(false);
				if (workingRef.current) dismissedRef.current = true;
			};
			const handleOpen = () => {
				setToast(false);
				setMinimized(false);
				setOpen(true);
			};
			const previewFinish = () => {
				setSettingsOpen(false);
				setOpen(false);
				setMinimized(false);
				setToast(true);
				window.clearTimeout(toastTimer.current);
				toastTimer.current = window.setTimeout(() => {
					setToast(false);
				}, TOAST_VISIBLE_MS);
			};
			const toastHint = settings.autoClose ? t("toast.hint") : t("toast.hintIdle");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HongguoWindow, {
					open,
					minimized,
					working,
					settings,
					resetToken,
					onClose: handleClose,
					onMinimize: () => {
						setMinimized(true);
					},
					onRestore: handleOpen,
					onOpenSettings: () => {
						setSettingsOpen(true);
					}
				}),
				!open && (settings.idleLauncher || !settings.autoOpen) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HongguoLauncher, { onOpen: handleOpen }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CompletionToast, {
					visible: toast,
					hint: toastHint,
					onAction: handleOpen,
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
					onResetRect: () => {
						setResetToken((token) => token + 1);
					},
					onPreviewFinish: previewFinish
				})
			] });
		}
		// src/client/index.tsx
		/**
		* dsh-hongguo-window client entry: mounts the persistent 红果短剧 window and
		* wires the two shell services it needs.
		*
		* - `locale`: UI language (optional; Chinese is the fallback).
		* - `uiSession`: per-Session running status, the signal that drives
		*   auto-open / auto-stow. Injected dynamically so the whole boot does not
		*   hard-depend on a UI package.
		*/
		function apply(ctx) {
			ctx.inject(["locale"], (lctx) => {
				const locale = lctx.locale;
				if (locale === void 0) return;
				lctx.effect(() => attachLocale(locale), "hongguo-window: attach locale");
			});
			ctx.inject(["uiSession"], (sctx) => {
				const store = sctx.uiSession?.sessionStatus;
				if (store === void 0) return;
				sctx.effect(() => attachSessions(store), "hongguo-window: attach session status");
			});
			ctx.effect(() => {
				const host = document.createElement("div");
				host.setAttribute("data-dsh-hongguo-window", "");
				document.body.appendChild(host);
				const root = (0, react_dom_client.createRoot)(host);
				root.render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(App, {}));
				return () => {
					try {
						root.unmount();
					} catch {}
					host.remove();
				};
			}, "hongguo-window: 红果短剧 window");
		}
		exports.apply = apply;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map