import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseTokens } from "./parse-css.mjs";

/** Absolute path of the single source of truth for every token. */
export const BASE_CSS_PATH = path.join(
  process.cwd(),
  "src",
  "registry",
  "style",
  "base.css",
);

export async function loadTokens() {
  return parseTokens(await readFile(BASE_CSS_PATH, "utf8"));
}
