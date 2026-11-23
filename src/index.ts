/**
 * dsh-hongguo-window host entry (v2): exposes the pinned 红果短剧 page to the
 * client half as one fenced JSON route. The floating window, the working-state
 * listener and the toast all live in the browser bundle (`src/client/`).
 */
import { CONFIG_PATH, createConfigHandler, DEFAULT_URL, normalizeUrl } from "./server/config.ts";
import type { Fence, RouteHandler } from "./server/config.ts";
import type { IncomingMessage } from "node:http";

/** Plugin identity for cordis.yml rows. */
export const name = "dsh-hongguo-window";

/** Services required before mounting: the host web server and its trust fence. */
export const inject = ["webServer", "connection"];

/** Optional profile config (`- id: hongguo-window` row). */
export interface PluginConfig {
  /** Page embedded by the floating window; must be an absolute http(s) URL. */
  url?: string;
}

/** Structural subset of the host Cordis context this plugin touches. */
export interface HostContext {
  effect(callback: () => () => void, label?: string): () => void;
  webServer: {
    register(route: { kind: "prefix"; path: string; handler: RouteHandler }): () => void;
  };
  connection: { requestRejection(req: IncomingMessage): number | undefined };
}

/** Host plugin body: register the config route once per profile load. */
export function apply(ctx: HostContext, config?: PluginConfig): void {
  const url = normalizeUrl(config?.url) ?? DEFAULT_URL;
  const fence: Fence = (req) => ctx.connection.requestRejection(req);
  const handler = createConfigHandler(url, fence);
  ctx.effect(
    () => ctx.webServer.register({ kind: "prefix", path: CONFIG_PATH, handler }),
    "hongguo-window: 红果短剧 config route",
  );
}
