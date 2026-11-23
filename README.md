# dsh-hongguo-window

> 仓库：<https://github.com/peakSoar/dsh-annimation> · Issues 欢迎

[English](README_EN.md) | 中文

**红果短剧随任务浮窗** —— DeepSeek Harness（DSH）插件：**Agent 开始工作时自动弹出红果短剧浮窗，任务结束时自动收起，并飘出一句「工作结束了」**。浮窗可拖拽、可四角缩放、可最小化成小胶囊；收起后还能从结束提示里「再看一会儿」。

> 仅供个人观看。浮窗只是把一个公开网页嵌进一个 iframe：不登录、不抓取、不代理、不注入脚本，也不改页面内容。请遵守对应平台的服务条款。

## 功能

| | 行为 |
| --- | --- |
| **自动打开** | 任意会话开始跑 turn 时，浮窗自动出现并展开（含「刚打开页面时 Agent 已经在忙」的情况） |
| **自动收起** | 所有会话都空闲后（默认 1.5 秒宽限，避免多轮/续跑时闪烁）收起浮窗 |
| **结束提示** | 收起的同时在右上角飘出「工作结束了」，6 秒后自动消失；点「再看一会儿」可重新打开 |
| **状态灯** | 标题栏小圆点 + 「工作中 / 空闲」，一眼看出当前是否还在跑 |
| **窗口操作** | 拖拽移动、八向缩放、最小化成右下角胶囊、关闭、刷新、在浏览器打开 |
| **位置记忆** | 窗口位置与尺寸按当前视口持久化，换分辨率自动夹回可视区 |
| **可配置** | 四个开关 + 自定义嵌入地址；也可在 profile 的 `cordis.patch.yml` 里固定入口 |
| **中英双语** | UI 跟随 DSH 宿主语言（中文 / English），实时切换 |

## 运行截图

浮窗里嵌的就是红果短剧网页本身（下图：410×700 的 iframe 实测加载信息流，站点没有 `X-Frame-Options` / CSP 拦截）：

![红果短剧信息流](docs/screenshot-embed.png)

## 安装

前置：DSH ≥ 0.2.1-rc.2 的 web / desktop profile。

```bash
dsh plugin --profile desktop add github:peakSoar/dsh-annimation
# 装好后重启 dsh（或重启桌面端），页面硬刷新（Ctrl+Shift+R / ⌘⇧R）
```

桌面端与 Web 版都适用；profile 名以你实际使用的为准（`desktop` 或 `web`）。仓库内置了 `lib/` 构建产物，从源码安装不需要再跑构建；改了源码后执行 `pnpm run build` 重新生成。

<details>
<summary>本地开发安装（link 方式）</summary>

```bash
cd ~/.dsh/profiles/desktop
pnpm add link:~/projects/dsh-annimation
# package.json 的 dsh.profile.bundles 里追加 "dsh-hongguo-window"
cd ~/projects/dsh-annimation && pnpm install && pnpm run build
```

</details>

## 使用

装好后无需额外操作：给 DSH 发一条消息，浮窗自己就出来了；任务跑完，窗口收起、提示飘出。

- **窗口标题栏**：`刷新` / `设置` / `在浏览器打开` / `最小化` / `关闭`
- **关闭**只影响本轮：本轮内不再自动弹；下一轮开始时会重新自动打开
- **设置**里可以关掉「开始时自动打开」「结束时自动收起」「结束时飘提示」，也可以打开「空闲时保留入口」，让收起后仍留一个小按钮
- 设置里的「预览结束效果」可以立刻看一遍收起 + 提示的动画，不用等任务结束

## 配置（可选）

在 profile 的 `cordis.patch.yml` 里固定嵌入页面，适合团队/多机器统一入口：

```yaml
- id: hongguo-window
  config:
    url: https://hongguoduanju.com/?tab=feed
```

未配置时使用内置默认值 `https://hongguoduanju.com/?tab=feed`；界面里改过的地址优先于 profile 配置（存在浏览器 localStorage）。只接受绝对 `http(s)` 地址，拒绝带用户名/密码的 URL。

## 工作原理

- **host 半**（`src/index.ts`）：只注册一个 `GET /hongguo-wall/config`，返回 `{ url }`；请求走宿主 `connection` 的 Host/Origin + 浏览器 cookie 围栏，没有代理、没有写入口。
- **client 半**（`src/client/`）：`apply()` 动态注入两个服务：
  - `locale` → UI 语言；
  - `uiSession` → 读取 `sessionStatus`（每个会话的 `running` / `pendingInteraction` / `completionUnread`）。只要有任一 session 在跑 turn，就算「工作中」。
- **状态机**（`app.tsx` + `monitor.ts`）：`idle → working` 自动打开；`working → idle` 延迟 1.5 秒后收起并提示（延迟期内又开跑则取消）。
- **窗口**（`window.tsx`）：纯 iframe 嵌公开网页；18 秒没加载完显示「页面没能加载」回退卡（重试 / 用浏览器打开）。跨域限制导致脚本无法得知站点是否拒绝嵌入，所以回退只能靠超时兜底。

## 已知限制

- **嵌入策略由红果决定**：站点以后若加上 `X-Frame-Options` / CSP `frame-ancestors`，iframe 会被浏览器拒绝，此时浮窗显示回退卡，仍可一键在系统浏览器打开。
- **登录态/推荐流**依赖站点自身的 Cookie；部分环境禁用第三方 Cookie 时表现可能与浏览器直接访问略有差异。
- **不抓取内容**：没有解析红果接口、不代理视频流，插件不承担站点改版带来的解析维护。
- **仅桌面/现代浏览器**：使用 `backdrop-filter`、`pointer capture` 等能力，DSH 桌面端（Electron）与新版 Chrome/Edge 均可。

## 来源与致谢

本项目由 MIT 许可的 [dsh-shorts-wall](https://github.com/imkingjh999/dsh-shorts-wall)（作者 imkingjh999）改造而来：保留其「宿主路由 + 浏览器端浮窗」的插件骨架与构建方式，内容与生命周期逻辑按红果短剧场景重写。包名使用 `dsh-hongguo-window`，与上游已发布的 `dsh-shorts-wall` 不冲突，两者可各自安装。

## 市场收录

dsh-market 通过 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 目录发现插件；本仓库的条目文件是 `data/plugins/peakSoar__dsh-annimation.yml`，仓库 topics 含 `dsh-plugin`。

## 开发

```bash
pnpm install
pnpm run build      # tsdown：宿主 ESM + 双通道 client CJS 工厂
pnpm run typecheck
pnpm test           # vitest：状态机 / 设置 / 几何 / 配置路由 / i18n / 渲染
node tests/smoke-client.mjs   # 无头冒烟：bundle 注册 + apply 挂载/卸载
```

## License

MIT
