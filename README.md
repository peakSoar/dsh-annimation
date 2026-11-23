# dsh-douyin-window

> 仓库：<https://github.com/peakSoar/dsh-annimation> · Issues 欢迎

[English](README_EN.md) | 中文

**抖音随任务浮窗** —— DeepSeek Harness（DSH）插件：**Agent 开始工作时自动打开抖音，并以浮窗形式停在界面上；任务结束时自动关闭，并飘出一句「工作结束了」**。

> 抖音拒绝 iframe 嵌入（站内会返回滑块验证中间页），所以这里不用 iframe，而是让 DSH 内置浏览器打开一个原生 Browser 标签，再把这个标签浮动成可拖拽的面板。登录、Cookie、视频播放都走真实浏览器，登录一次后 DSH 会保留会话。

## 功能

| | 行为 |
| --- | --- |
| **自动打开** | 任意会话开始跑 turn 时，打开/唤起抖音标签并浮动成面板（含「刚打开页面时 Agent 已经在忙」） |
| **自动关闭** | 所有会话空闲后（默认 1.5 秒宽限，避免多轮/续跑闪烁）关闭这个抖音窗口 |
| **结束提示** | 关闭的同时在右上角飘出「工作结束了」，6 秒后消失；点「再看一会儿」重新打开 |
| **登录保持** | 用 DSH 内置浏览器（Electron webview），扫码/手机号登录一次即可，重启后仍是登录态 |
| **浮窗操作** | 原生浮层面板，可拖动、缩放、沉回右侧栏，由 DSH 的 dockkit 管理 |
| **手动入口** | 右下角小胶囊：「抖音」打开，齿轮进设置；不需要时可关闭入口 |
| **可配置** | 打开地址 + 自动开 / 自动关 / 结束提示 / 入口显示四个开关 |
| **中英双语** | UI 跟随 DSH 宿主语言（中文 / English），实时切换 |

## 为什么不用 iframe

实测（Chrome，普通非无头模式）把 `https://www.douyin.com/` 放进跨域 iframe：抖音会渲染一个 **「验证码中间页」**，验证码 iframe 的 URL 明确带 `from=iframe`，之后也不会正常出推荐流。所以 iframe 方案不可用；原生 Browser 标签是 DSH 里唯一能正常登录、正常刷的嵌入口。

## 安装

前置：DSH ≥ 0.2.1-rc.2，桌面端（内置 Browser 默认在 Desktop 启用）。

```bash
dsh plugin --profile desktop add github:peakSoar/dsh-annimation
# 装好后重启 DSH，页面硬刷新
```

仓库内置 `lib/` 构建产物，从源码安装不需要再构建；改了源码后执行 `pnpm run build`。

<details>
<summary>本地开发安装（link 方式）</summary>

```bash
cd ~/.dsh/profiles/desktop
pnpm add link:~/projects/dsh-annimation
# package.json 的 dsh.profile.bundles 里追加 "dsh-douyin-window"
cd ~/projects/dsh-annimation && pnpm install && pnpm run build
```

</details>

## 使用

- 发一条消息：抖音浮窗自动出现（首次会要求登录，登录后直接进推荐流）。
- 任务结束：窗口关闭 + 右上角提示。
- 想手动看：点右下角「抖音」胶囊；齿轮里可以改地址、关自动开关、立即打开。
- 关闭只影响本轮：下一轮开始会重新打开。

## 配置（可选）

在 profile 的 `cordis.patch.yml` 里固定打开的页面：

```yaml
- id: douyin-window
  config:
    url: https://www.douyin.com/
```

未配置时使用 `https://www.douyin.com/`；界面里改过的地址优先（存在 localStorage）。只接受绝对 `http(s)` 地址。

## 工作原理

- **host 半**（`src/index.ts`）：一个围栏路由 `GET /douyin-window/config`，返回 `{ url }`。
- **client 半**（`src/client/`）：动态注入三个服务：
  - `locale` → UI 语言；
  - `uiSession` → 每个会话的 `running` 状态，决定「工作中 / 空闲」；
  - `sidebarRight` → DSH 右侧栏控制器：`openTab("browser", { params: { url } })` 打开标签，`active()` 取到标签 id，`float(tabId)` 把标签浮动成面板，`close(tabId)` 在结束时关闭。
- **状态机**（`app.tsx` + `monitor.ts`）：`idle → working` 打开并浮动；`working → idle` 延迟 1.5 秒关闭并提示；期间重启任务会取消关闭。
- **降级**：如果宿主没有 Browser 标签 API，手动点胶囊会退回系统浏览器打开；自动打开则静默等待。

## 已知限制

- **需要桌面端的内置 Browser**：Web profile 默认不启用 Browser 标签；没有该能力时只能走系统浏览器降级。
- **浮动是 dockkit 浮层**：如果当前侧栏没有可浮动的挂载面，标签会留在右侧栏里（仍可正常登录/刷）。
- **登录由抖音决定**：首次可能要求扫码或手机验证码；DSH 的浏览器会话会保留 Cookie。
- **不是 iframe**：插件不抓取、不代理抖音内容，也不修改页面。

## 来源与致谢

插件骨架（宿主路由 + 浏览器端 Cordis 注入 + tsdown 双通道打包）改造自 MIT 许可的 [dsh-shorts-wall](https://github.com/imkingjh999/dsh-shorts-wall)（作者 imkingjh999）；当前版本的内容与生命周期逻辑已按抖音原生浏览器方案重写。

## 市场收录

dsh-market 通过 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 目录发现插件；本仓库的条目文件是 `data/plugins/peakSoar__dsh-annimation.yml`，仓库 topics 含 `dsh-plugin`。

## 开发

```bash
pnpm install
pnpm run build      # tsdown：宿主 ESM + 双通道 client CJS 工厂
pnpm run typecheck
pnpm test           # vitest：状态机 / 设置 / 配置路由 / i18n / 原生标签桥
node tests/smoke-client.mjs   # 无头冒烟：bundle 注册 + apply 挂载/卸载
```

## License

MIT
