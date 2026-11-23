/**
 * Headless smoke test of the built browser bundle.
 *
 * Executes lib/client.js in the CJS closure shape the web shell's module
 * loader uses, then drives apply() through stub service injections: locale,
 * the session status store and the native Browser-tab controller.
 */
import { createRequire } from "node:module";

const reactRequire = createRequire(import.meta.resolve("react"));
const React = reactRequire("react");
const jsxRuntime = reactRequire("react/jsx-runtime");

let appended = 0;
let removed = 0;

globalThis.window = globalThis;
globalThis.document = {
  createElement: () => ({
    id: "",
    style: {},
    dataset: {},
    setAttribute() {},
    remove() {
      removed += 1;
    },
  }),
  head: { appendChild() {} },
  body: {
    appendChild() {
      appended += 1;
    },
  },
  getElementById: () => null,
};

const reactDomClient = {
  createRoot: () => ({ render: () => undefined, unmount: () => undefined }),
};

const loaded = [];
globalThis.__ModuleLoader__ = {
  load({ id, factory }) {
    loaded.push(id);
    const require = (spec) => {
      if (spec === "react") return React;
      if (spec === "react/jsx-runtime") return jsxRuntime;
      if (spec === "react-dom/client") return reactDomClient;
      throw new Error(`unexpected require "${spec}"`);
    };
    const exports = factory(require);
    globalThis.__loadedExports = globalThis.__loadedExports ?? {};
    globalThis.__loadedExports[id] = exports;
  },
};

await import("../lib/client.js");

const id = loaded[0];
const exports = globalThis.__loadedExports[id];
process.stdout.write(`registered bundle id: ${id}\n`);
if (id !== "dsh-douyin-window") throw new Error(`bundle id mismatch: ${id}`);
if (typeof exports.apply !== "function") throw new Error("bundle does not export apply()");
if (exports.inject !== undefined) {
  throw new Error("static inject must not be declared (a hard dependency would fail the whole boot)");
}

/** Status-store double with the shell's observable shape. */
function fakeSessions() {
  const snapshot = new Map([["main", { running: false }]]);
  const listeners = new Set();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Browser-tab controller double. */
function fakeSidebar() {
  return {
    openTab() {},
    active: () => undefined,
    float() {},
    close() {},
  };
}

/** Cordis-context double that resolves the three optional dependencies. */
function makeCtx({ withServices }) {
  const effects = [];
  const ctx = {
    effect(fn, _label) {
      const dispose = fn();
      effects.push(dispose);
      return () => dispose();
    },
    inject(deps, callback) {
      if (!withServices) return { dispose() {} };
      const key = deps.length === 1 ? deps[0] : "";
      if (key === "locale") {
        callback({ effect: ctx.effect, locale: undefined });
        return { dispose() {} };
      }
      if (key === "uiSession") {
        callback({ effect: ctx.effect, uiSession: { sessionStatus: fakeSessions() } });
        return { dispose() {} };
      }
      if (key === "sidebarRight") {
        callback({ effect: ctx.effect, sidebarRight: fakeSidebar() });
        return { dispose() {} };
      }
      throw new Error(`unexpected inject deps ${JSON.stringify(deps)}`);
    },
  };
  return { ctx, effects };
}

// 1. No services yet: the pill/toast host still mounts and waits.
{
  const { ctx, effects } = makeCtx({ withServices: false });
  exports.apply(ctx);
  if (appended !== 1) throw new Error(`expected one mounted host, got ${appended}`);
  for (const dispose of effects) dispose();
  if (removed !== 1) throw new Error(`expected the host node to be removed, got ${removed}`);
  process.stdout.write("apply() mounts without shell services ✓\n");
}

// 2. All services present: same mount path, injections resolve.
{
  const { ctx, effects } = makeCtx({ withServices: true });
  exports.apply(ctx);
  if (appended !== 2) throw new Error(`expected a second mounted host, got ${appended}`);
  for (const dispose of effects) dispose();
  process.stdout.write("apply() mounts with locale + uiSession + sidebarRight ✓\n");
}

process.stdout.write("SMOKE TEST PASSED\n");
