/**
 * Host half of the 抖音 window: one fenced read-only config route.
 *
 * The browser half owns every user-facing default (localStorage), but a
 * profile may pin the opened page in `cordis.patch.yml`:
 *
 *   - id: douyin-window
 *     config:
 *       url: https://www.douyin.com/
 *
 * The route is registered on the Host web server, so it inherits the
 * composition's Host/Origin + browser-cookie fence. There is no proxy and no
 * write path: the endpoint answers `{ url }` and nothing else.
 */
import type { IncomingMessage, ServerResponse } from "node:http";

/** Page opened when neither the profile nor the user chose one. */
export const DEFAULT_URL = "https://www.douyin.com/";

/** Exact route the client fetches. */
export const CONFIG_PATH = "/douyin-window/config";

/** Accept only absolute http(s) URLs without embedded credentials. */
export function normalizeUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed.length > 2048) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return undefined;
  if (parsed.username !== "" || parsed.password !== "") return undefined;
  return parsed.href;
}

/** Host route handler signature (the `webServer` register shape). */
export type RouteHandler = (req: IncomingMessage, res: ServerResponse) => void;

/** Request trust fence supplied by the host composition. */
export type Fence = (req: IncomingMessage) => number | undefined;

/** Build the config route handler. */
export function createConfigHandler(url: string, fence: Fence): RouteHandler {
  return (req, res) => {
    const rejection = fence(req);
    if (rejection !== undefined) {
      res.writeHead(rejection, { "content-type": "text/plain; charset=utf-8" });
      res.end("forbidden");
      return;
    }
    const path = (req.url ?? "").split("?")[0];
    if (path !== CONFIG_PATH) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("not found");
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { allow: "GET, HEAD", "content-type": "text/plain; charset=utf-8" });
      res.end("method not allowed");
      return;
    }
    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(req.method === "HEAD" ? undefined : JSON.stringify({ url }));
  };
}
