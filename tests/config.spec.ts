import { describe, expect, it } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import { CONFIG_PATH, DEFAULT_URL, createConfigHandler, normalizeUrl } from "../src/server/config.ts";

/** Recorded response state plus a ServerResponse double. */
interface Captured {
  res: ServerResponse;
  state: { status: number | undefined; headers: Record<string, unknown>; body: string };
}

/** Minimal response double: records status/headers/body. */
function response(): Captured {
  const state = { status: undefined as number | undefined, headers: {} as Record<string, unknown>, body: "" };
  const res = {
    writeHead(status: number, headers?: Record<string, unknown>) {
      state.status = status;
      state.headers = headers ?? {};
      return res;
    },
    end(chunk?: unknown) {
      if (typeof chunk === "string") state.body = chunk;
    },
  } as unknown as ServerResponse;
  return { res, state };
}

/** Minimal request double. */
function request(method: string, url: string): IncomingMessage {
  return { method, url } as unknown as IncomingMessage;
}

describe("host config route", () => {
  const handler = createConfigHandler(DEFAULT_URL, () => undefined);

  it("serves the Douyin URL as JSON", () => {
    const { res, state } = response();
    handler(request("GET", CONFIG_PATH), res);
    expect(state.status).toBe(200);
    expect(String(state.headers["content-type"])).toContain("application/json");
    expect(JSON.parse(state.body)).toEqual({ url: "https://www.douyin.com/" });
  });

  it("answers HEAD without a body", () => {
    const { res, state } = response();
    handler(request("HEAD", CONFIG_PATH), res);
    expect(state.status).toBe(200);
    expect(state.body).toBe("");
  });

  it("rejects writes", () => {
    const { res, state } = response();
    handler(request("POST", CONFIG_PATH), res);
    expect(state.status).toBe(405);
  });

  it("404s other paths under the prefix", () => {
    const { res, state } = response();
    handler(request("GET", "/douyin-window/other"), res);
    expect(state.status).toBe(404);
  });

  it("propagates the trust fence rejection", () => {
    const guarded = createConfigHandler(DEFAULT_URL, () => 403);
    const { res, state } = response();
    guarded(request("GET", CONFIG_PATH), res);
    expect(state.status).toBe(403);
    expect(state.body).toBe("forbidden");
  });
});

describe("normalizeUrl", () => {
  it("normalizes accepted URLs", () => {
    expect(normalizeUrl("https://www.douyin.com/")).toBe("https://www.douyin.com/");
  });

  it("rejects everything else", () => {
    for (const input of ["", "file:///x", "javascript:alert(1)", "https://u:p@x/", "nope", null, 7]) {
      expect(normalizeUrl(input)).toBeUndefined();
    }
  });
});
