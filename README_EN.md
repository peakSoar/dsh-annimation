# dsh-hongguo-window

> Repository: <https://github.com/peakSoar/dsh-annimation> · issues welcome

English | [中文](README.md)

**Hongguo Shorts follows the task** — a DeepSeek Harness (DSH) plugin: **when the agent starts working it opens a floating 红果短剧 (Hongguo Shorts) window; when the task ends the window stows itself and a “Work finished” toast floats in**. The window can be dragged, resized from eight edges, minimized into a pill, and reopened from the toast.

> For personal viewing only. The window is just a public page embedded in an iframe: no login, no scraping, no proxy, no injected scripts, no page rewriting. Follow the site's terms of service.

## Features

| | Behaviour |
| --- | --- |
| **Auto open** | Any running session makes the window appear and expand — including a page load that happens mid-turn |
| **Auto stow** | Once every session is idle (1.5 s grace, so multi-round turns never flicker) the window hides |
| **Finish toast** | A “Work finished” card slides in top-right for 6 s; its action button reopens the window |
| **Status chip** | A pulsing dot plus “Working / Idle” in the title bar |
| **Window controls** | Drag, eight-way resize, minimize into a bottom-right pill, close, reload, open in browser |
| **Geometry memory** | Position and size persist; restored rectangles are clamped back into the viewport |
| **Configurable** | Four behaviour switches and a custom URL; a profile can pin the entry page |
| **Bilingual** | Follows the DSH host language (Chinese / English), live |

## Screenshot

The window embeds the Hongguo Shorts page itself (below: the feed inside a 410×700 iframe; the site sends no `X-Frame-Options` / CSP refusal):

![Hongguo Shorts feed](docs/screenshot-embed.png)

## Install

Requires DSH ≥ 0.2.1-rc.2 with a web or desktop profile.

```bash
dsh plugin --profile desktop add github:peakSoar/dsh-annimation
# restart dsh (or the desktop app), then hard-refresh the page (Ctrl+Shift+R / ⌘⇧R)
```

Use whichever profile you actually run (`desktop` or `web`). The repository ships the built `lib/` output, so installing from source needs no build step; run `pnpm run build` after editing the source.

<details>
<summary>Local development (link install)</summary>

```bash
cd ~/.dsh/profiles/desktop
pnpm add link:~/projects/dsh-annimation
# append "dsh-hongguo-window" to dsh.profile.bundles in package.json
cd ~/projects/dsh-annimation && pnpm install && pnpm run build
```

</details>

## Usage

Nothing to wire up: send DSH a message and the window appears; when the turn ends it stows and the toast appears.

- Title bar: reload / settings / open in browser / minimize / close.
- **Close** applies to the current cycle only; the next turn opens the window again.
- Settings can disable auto-open, auto-stow, the toast, or keep a small launcher while idle.
- “Preview finish effect” in settings plays the stow + toast animation immediately.

## Configuration (optional)

Pin the embedded page in the profile's `cordis.patch.yml`:

```yaml
- id: hongguo-window
  config:
    url: https://hongguoduanju.com/?tab=feed
```

Without it the built-in default is used. A URL edited in the UI wins over the profile value (it lives in localStorage). Only absolute `http(s)` URLs without credentials are accepted.

## How it works

- **Host half** (`src/index.ts`): one fenced `GET /hongguo-wall/config` returning `{ url }`; no proxy and no write path.
- **Client half** (`src/client/`): `apply()` dynamically injects `locale` (UI language) and `uiSession` (per-session `running` / `pendingInteraction` / `completionUnread` status). Any session running a turn means “working”.
- **State machine** (`app.tsx` + `monitor.ts`): `idle → working` opens the window; `working → idle` waits 1.5 s, then stows and toasts (cancelled if work resumes).
- **Window** (`window.tsx`): a plain iframe of the public site. A cross-origin frame cannot report that it was refused, so an 18-second watchdog shows a fallback card (retry / open in browser).

## Known limitations

- **Embedding is the site's call**: if 红果 ever adds `X-Frame-Options` or CSP `frame-ancestors`, browsers refuse the frame; the window then shows the fallback card with a one-click browser handoff.
- **Sign-in / recommendations** depend on the site's own cookies; environments that block third-party cookies may behave differently from a direct visit.
- **No scraping**: the plugin never parses Hongguo APIs, proxies video, or adapts to site redesigns.
- **Modern desktop browsers**: relies on `backdrop-filter`, pointer capture, etc. (DSH desktop/Electron and current Chrome/Edge are fine).

## Origin and credits

This project was adapted from the MIT-licensed [dsh-shorts-wall](https://github.com/imkingjh999/dsh-shorts-wall) by imkingjh999: it keeps that plugin's host-route + browser-floating-window skeleton and build setup, while the content and lifecycle logic were rewritten for Hongguo Shorts. The package is named `dsh-hongguo-window` so it does not collide with the upstream `dsh-shorts-wall` release; the two can be installed side by side.

## Market listing

dsh-market discovers plugins through the [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) catalog; this repository's entry lives at `data/plugins/peakSoar__dsh-annimation.yml`, and the repository carries the `dsh-plugin` topic.

## Development

```bash
pnpm install
pnpm run build      # tsdown: host ESM + dual-channel client CJS factories
pnpm run typecheck
pnpm test           # vitest: state machine / settings / geometry / config route / i18n / render
node tests/smoke-client.mjs   # headless smoke: bundle registration + apply mount/unmount
```

## License

MIT
