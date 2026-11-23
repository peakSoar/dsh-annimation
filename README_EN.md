# dsh-douyin-window

> Repository: <https://github.com/peakSoar/dsh-annimation> · issues welcome

English | [中文](README.md)

**Douyin follows the task** — a DeepSeek Harness (DSH) plugin: **when the agent starts working it opens Douyin in a floating panel; when the task ends it closes the window and floats a “Work finished” notice**.

> Douyin refuses iframe embedding (it answers with a slider-captcha intermediate page), so this plugin does not use an iframe. It asks DSH's built-in browser for a native Browser tab and floats that tab into a draggable panel. Login, cookies and playback all run in a real browser session, kept across restarts.

## Features

| | Behaviour |
| --- | --- |
| **Auto open** | Any running session opens/reveals the Douyin tab and floats it — including a page load that happens mid-turn |
| **Auto close** | Once every session is idle (1.5 s grace) the window closes |
| **Finish toast** | A “Work finished” card slides in top-right for 6 s; its action reopens the window |
| **Login kept** | DSH's built-in browser (Electron webview) keeps the Douyin session across restarts |
| **Floating** | A native dockkit floating panel: drag, resize, or dock it back to the right column |
| **Launcher** | Bottom-right pill: “Douyin” opens, the gear opens settings |
| **Configurable** | URL plus four switches (auto-open / auto-close / toast / launcher) |
| **Bilingual** | Follows the DSH host language (Chinese / English), live |

## Why not an iframe

Measured in a normal (non-headless) Chrome: loading `https://www.douyin.com/` in a cross-origin iframe produces a **“验证码中间页”** (captcha intermediate page); the captcha iframe URL carries `from=iframe`, and the recommendation feed never renders. So an iframe is not viable; the native Browser tab is the only in-DSH way to log in and scroll Douyin normally.

## Install

Requires DSH ≥ 0.2.1-rc.2 on Desktop (the built-in Browser is enabled there by default).

```bash
dsh plugin --profile desktop add github:peakSoar/dsh-annimation
# restart DSH, then hard-refresh the page
```

The repository ships the built `lib/` output, so installing from source needs no build step; run `pnpm run build` after editing the source.

<details>
<summary>Local development (link install)</summary>

```bash
cd ~/.dsh/profiles/desktop
pnpm add link:~/projects/dsh-annimation
# append "dsh-douyin-window" to dsh.profile.bundles in package.json
cd ~/projects/dsh-annimation && pnpm install && pnpm run build
```

</details>

## Usage

- Send DSH a message: the Douyin panel opens automatically (the first time it asks you to log in; afterwards the feed loads directly).
- Turn ends: the window closes and the toast appears.
- Manual open: the bottom-right “Douyin” pill; its gear opens settings (URL, switches, Open now).
- Closing applies to the current cycle only; the next turn opens it again.

## Configuration (optional)

Pin the opened page in the profile's `cordis.patch.yml`:

```yaml
- id: douyin-window
  config:
    url: https://www.douyin.com/
```

Without it the built-in default is used. A URL edited in the UI wins (it lives in localStorage). Only absolute `http(s)` URLs are accepted.

## How it works

- **Host half** (`src/index.ts`): one fenced `GET /douyin-window/config` returning `{ url }`.
- **Client half** (`src/client/`): dynamically injects three services:
  - `locale` — UI language;
  - `uiSession` — per-session `running` status, the working/idle signal;
  - `sidebarRight` — the shell's right-sidebar controller: `openTab("browser", { params: { url } })`, `active()` for the tab id, `float(tabId)` to float it, `close(tabId)` at the end.
- **State machine** (`app.tsx` + `monitor.ts`): `idle → working` opens and floats; `working → idle` waits 1.5 s, then closes and toasts (cancelled if work resumes).
- **Fallback**: without the Browser-tab API, a manual pill click opens the system browser; auto-open waits quietly.

## Known limitations

- **Desktop Browser required**: Web profiles do not enable Browser tabs by default; without it only the system-browser fallback exists.
- **Floating depends on a mounted surface**: if the column cannot float the tab, it stays docked in the right column (login/playback still work).
- **Login is Douyin's**: expect a QR/phone-code prompt the first time; DSH's browser session keeps the cookies.
- **Not an iframe**: the plugin never scrapes, proxies or rewrites Douyin content.

## Origin and credits

The plugin skeleton (host route + browser-side Cordis injection + tsdown dual-channel bundling) was adapted from the MIT-licensed [dsh-shorts-wall](https://github.com/imkingjh999/dsh-shorts-wall) by imkingjh999; the content and lifecycle logic were rewritten for the native-browser Douyin window.

## Market listing

dsh-market discovers plugins through the [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) catalog; this repository's entry lives at `data/plugins/peakSoar__dsh-annimation.yml`, and the repository carries the `dsh-plugin` topic.

## Development

```bash
pnpm install
pnpm run build      # tsdown: host ESM + dual-channel client CJS factories
pnpm run typecheck
pnpm test           # vitest: state machine / settings / config route / i18n / native-tab bridge
node tests/smoke-client.mjs   # headless smoke: bundle registration + apply mount/unmount
```

## License

MIT
