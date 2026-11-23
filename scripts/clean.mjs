/**
 * Build step helper: remove the previous lib/ output before tsdown writes it,
 * cross-platform (the old `rm -rf lib` script only worked in POSIX shells).
 */
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await rm(path.join(root, "lib"), { recursive: true, force: true });
