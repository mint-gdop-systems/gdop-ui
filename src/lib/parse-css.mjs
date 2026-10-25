// Parser for registry/gdop/base.css — shared by the docs page and the sync script.
// Plain ESM + JSDoc so it runs under Node (scripts) and Next (server components).

/**
 * @typedef {"scale"|"semantic"|"tone"|"other"} GroupKind
 * @typedef {{ name: string, group: string, light?: string, dark?: string, description?: string }} Token
 * @typedef {{ kind: GroupKind, id: string, description: string, tokens: string[] }} TokenGroup
 * @typedef {{ groups: TokenGroup[], tokens: Record<string, Token> }} ParsedTokens
 */

const BLOCK_RE = /^(:root|\.dark)\s*\{([\s\S]*?)^\}/gm;
const GROUP_RE =
  /^\/\*\s*@group\s+(scale|semantic|tone|other)\s+([\w-]+)\s*(?::\s*(.*?))?\s*\*\/$/;
const DECL_RE = /(--[\w-]+)\s*:\s*([^;]+);/g;
const NOTE_RE = /\/\*\s*(?!@group)(.*?)\s*\*\/\s*$/;

/** @param {string} css @returns {ParsedTokens} */
export function parseTokens(css) {
  /** @type {Record<string, Token>} */ const tokens = {};
  /** @type {TokenGroup[]} */ const groups = [];

  for (const [, selector, body] of css.matchAll(BLOCK_RE)) {
    const isDark = selector === ".dark";
    /** @type {TokenGroup | null} */ let current = null;

    for (const raw of body.split("\n")) {
      const line = raw.trim();
      if (!line) continue;

      const g = line.match(GROUP_RE);
      if (g) {
        if (isDark) continue; // groups are defined by :root only
        current = {
          kind: /** @type {GroupKind} */ (g[1]),
          id: g[2],
          description: g[3] ?? "",
          tokens: [],
        };
        groups.push(current);
        continue;
      }

      const decls = [...line.matchAll(DECL_RE)];
      if (decls.length === 0) continue;
      const note = decls.length === 1 ? line.match(NOTE_RE)?.[1] : undefined;

      for (const [, name, value] of decls) {
        const key = name.slice(2);
        const v = value.trim();
        const existing = tokens[key];
        if (isDark) {
          if (existing) existing.dark = v;
          else tokens[key] = { name: key, group: current?.id ?? "", dark: v };
        } else {
          if (!current)
            throw new Error(
              `base.css: token ${name} appears before any @group comment`,
            );
          tokens[key] = {
            name: key,
            group: current.id,
            light: v,
            description: note,
          };
          current.tokens.push(key);
        }
      }
    }
  }
  return { groups, tokens };
}

/**
 * Follows var(--x) chains to a literal. Dark mode falls back to the light value.
 * @param {ParsedTokens} parsed @param {string} name @param {"light"|"dark"} mode
 * @returns {{ value: string, via: string | null }}
 */
export function resolveToken(parsed, name, mode, depth = 0) {
  const t = parsed.tokens[name];
  if (!t || depth > 8) return { value: "", via: null };
  const raw = (mode === "dark" ? (t.dark ?? t.light) : t.light) ?? "";
  const ref = raw.match(/^var\(--([\w-]+)\)$/);
  if (!ref) return { value: raw, via: null };
  return {
    value: resolveToken(parsed, ref[1], mode, depth + 1).value,
    via: ref[1],
  };
}

/** @param {string} hex @returns {number | null} relative luminance */
function luminance(hex) {
  const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, or null when either value isn't a hex color. @param {string} a @param {string} b */
export function contrastRatio(a, b) {
  const la = luminance(a),
    lb = luminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** The `--color-*` utility mapping for every scale / semantic / tone token. @param {ParsedTokens} parsed */
export function generateThemeBlock(parsed) {
  const out = ["@theme inline {"];
  for (const g of parsed.groups) {
    if (g.kind === "other") continue;
    out.push(`  /* ${g.kind}: ${g.id} */`);
    for (const name of g.tokens) out.push(`  --color-${name}: var(--${name});`);
  }
  out.push("}");
  return out.join("\n");
}

export const GENERATED_START = /\/\* @generated:start[^\n]*\*\/\n/;
export const GENERATED_END = "/* @generated:end */";

/** Returns css with the generated block rebuilt. @param {string} css */
export function syncGenerated(css) {
  const start = css.match(GENERATED_START);
  const endIdx = css.indexOf(GENERATED_END);
  if (!start || endIdx === -1)
    throw new Error(
      "base.css is missing the @generated:start / @generated:end markers",
    );
  const head = css.slice(0, start.index + start[0].length);
  return `${head}${generateThemeBlock(parseTokens(css))}\n${css.slice(endIdx)}`;
}
