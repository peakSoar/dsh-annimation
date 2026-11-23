/** Exact route the client fetches. */
const CONFIG_PATH = "/hongguo-wall/config";
/** Accept only absolute http(s) URLs without embedded credentials. */
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
/** Build the config route handler. */
function createConfigHandler(url, fence) {
	return (req, res) => {
		const rejection = fence(req);
		if (rejection !== void 0) {
			res.writeHead(rejection, { "content-type": "text/plain; charset=utf-8" });
			res.end("forbidden");
			return;
		}
		if ((req.url ?? "").split("?")[0] !== "/hongguo-wall/config") {
			res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
			res.end("not found");
			return;
		}
		if (req.method !== "GET" && req.method !== "HEAD") {
			res.writeHead(405, {
				allow: "GET, HEAD",
				"content-type": "text/plain; charset=utf-8"
			});
			res.end("method not allowed");
			return;
		}
		res.writeHead(200, {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store"
		});
		res.end(req.method === "HEAD" ? void 0 : JSON.stringify({ url }));
	};
}
// src/index.ts
/**
* dsh-hongguo-window host entry (v2): exposes the pinned 红果短剧 page to the
* client half as one fenced JSON route. The floating window, the working-state
* listener and the toast all live in the browser bundle (`src/client/`).
*/
/** Plugin identity for cordis.yml rows. */
const name = "dsh-hongguo-window";
/** Services required before mounting: the host web server and its trust fence. */
const inject = ["webServer", "connection"];
/** Host plugin body: register the config route once per profile load. */
function apply(ctx, config) {
	const url = normalizeUrl(config?.url) ?? "https://hongguoduanju.com/?tab=feed";
	const fence = (req) => ctx.connection.requestRejection(req);
	const handler = createConfigHandler(url, fence);
	ctx.effect(() => ctx.webServer.register({
		kind: "prefix",
		path: CONFIG_PATH,
		handler
	}), "hongguo-window: 红果短剧 config route");
}
export { apply, inject, name };
