import { TokenSwatch } from "@/components/colors/token-swatch";
import { PageHeader, Section } from "@/components/shared/doc";
import { loadTokens } from "@/lib/load-tokens";
import { resolveToken } from "@/lib/parse-css.mjs";

/* ── Color math (hex + oklch → linear sRGB), so contrast works for any token format ── */
type Rgb = [number, number, number]; // linear sRGB, 0–1

function parseColor(value: string): Rgb | null {
  const v = value.trim();
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = [...h].map((c) => c + c).join("");
    const lin = (i: number) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return [lin(0), lin(2), lin(4)];
  }
  const ok = v.match(
    /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/[^)]+)?\)$/i,
  );
  if (ok) {
    const L = parseFloat(ok[1]) / (ok[2] ? 100 : 1);
    const C = parseFloat(ok[3]);
    const H = (parseFloat(ok[4]) * Math.PI) / 180;
    const a = C * Math.cos(H),
      b = C * Math.sin(H);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    return [
      clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    ];
  }
  return null;
}

const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function contrast(a: string, b: string): number | null {
  const ca = parseColor(a),
    cb = parseColor(b);
  if (!ca || !cb) return null;
  const [hi, lo] = [luminance(ca), luminance(cb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function toHex(value: string): string | null {
  const c = parseColor(value);
  if (!c) return null;
  const enc = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  return (
    "#" +
    c
      .map((x) =>
        Math.round(enc(x) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/* ── Page helpers ── */
const title = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
const stepOf = (name: string) => name.slice(name.lastIndexOf("-") + 1);
const isShadowPreview = (name: string) =>
  /^shadow(-(2xs|xs|sm|md|lg|xl|2xl))?$/.test(name);

type Pair = {
  fg: string;
  bg: string;
  min: 4.5 | 3;
  kind: "Text" | "UI / graphics";
};
const text = (fg: string, bg: string): Pair => ({
  fg,
  bg,
  min: 4.5,
  kind: "Text",
});
const ui = (fg: string, bg: string): Pair => ({
  fg,
  bg,
  min: 3,
  kind: "UI / graphics",
});

export default async function ColorsPage() {
  "use cache";

  const parsed = await loadTokens();
  const byKind = (kind: string) => parsed.groups.filter((g) => g.kind === kind);
  const semantic = byKind("semantic");
  const tones = byKind("tone");
  const scales = byKind("scale");
  const other = byKind("other");
  const has = (name: string) => name in parsed.tokens;

  const value = (name: string, mode: "light" | "dark") =>
    resolveToken(parsed, name, mode).value;
  const shown = (name: string, mode: "light" | "dark") => {
    const v = value(name, mode);
    return toHex(v) ?? v;
  };

  const pairs: Pair[] = [
    text("foreground", "background"),
    text("card-foreground", "card"),
    text("popover-foreground", "popover"),
    text("primary-foreground", "primary"),
    text("secondary-foreground", "secondary"),
    text("accent-foreground", "accent"),
    text("muted-foreground", "background"),
    text("muted-foreground", "muted"),
    text("destructive-foreground", "destructive"),
    text("sidebar-foreground", "sidebar"),
    text("sidebar-primary-foreground", "sidebar-primary"),
    text("sidebar-accent-foreground", "sidebar-accent"),
    ...tones.map((t) => text(`tone-${t.id}-fg`, `tone-${t.id}-bg`)),
    ui("ring", "background"),
    ui("input", "background"),
    ui("sidebar-primary", "sidebar"),
    ...[1, 2, 3, 4, 5].map((n) => ui(`chart-${n}`, "background")),
  ].filter((p) => has(p.fg) && has(p.bg));

  return (
    <>
      <PageHeader
        title="Colors"
        description="Rendered live from registry/gdop/base.css, the same file the shadcn registry ships. Primary is the logo blue (#00549b)."
      />

      {semantic.length > 0 && (
        <Section title="Semantic tokens">
          <p className="text-muted-foreground">
            Use these in components. They switch automatically in dark mode.
            Click a swatch to copy its variable.
          </p>
          {semantic.map((g) => (
            <div key={g.id} className="space-y-2">
              <h3 className="text-sm font-medium">
                {title(g.id)}{" "}
                <span className="text-muted-foreground font-normal">
                  · {g.description}
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {g.tokens.map((name) => (
                  <div
                    key={name}
                    className="border-border bg-card overflow-hidden rounded-lg border"
                  >
                    <TokenSwatch
                      name={name}
                      className="border-border h-14 border-b"
                    />
                    <div className="space-y-0.5 px-3 py-2">
                      <code className="block text-xs font-medium">
                        --{name}
                      </code>
                      {parsed.tokens[name].description && (
                        <p className="text-primary text-[11px]">
                          {parsed.tokens[name].description}
                        </p>
                      )}
                      <p
                        className="text-muted-foreground text-[11px] leading-snug"
                        title={`${value(name, "light")} / ${value(name, "dark")}`}
                      >
                        Light {shown(name, "light")}
                        <br />
                        Dark {shown(name, "dark")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>
      )}

      {tones.length > 0 && (
        <Section title="Status tones">
          <p className="text-muted-foreground">
            Each tone gives a background, text, border and dot color. Badges,
            alerts and the approval timeline use only these.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {tones.map((g) => (
              <div
                key={g.id}
                className="border-border bg-card rounded-lg border p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      background: `var(--tone-${g.id}-bg)`,
                      color: `var(--tone-${g.id}-fg)`,
                      borderColor: `var(--tone-${g.id}-border)`,
                    }}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: `var(--tone-${g.id}-dot)` }}
                    />
                    {title(g.id)}
                  </span>
                  <span className="text-muted-foreground text-right text-xs">
                    {g.description}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {g.tokens.map((name) => (
                    <div key={name}>
                      <TokenSwatch
                        name={name}
                        className="border-border h-8 rounded-md border"
                      />
                      <code
                        className="text-muted-foreground mt-1 block truncate text-[10px]"
                        title={`${shown(name, "light")} / ${shown(name, "dark")}`}
                      >
                        {name.split("-").pop()}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {pairs.length > 0 && (
        <Section title="Contrast check">
          <p className="text-muted-foreground">
            WCAG ratios computed from the resolved values. Text needs 4.5:1
            (AA); UI components and chart colors need 3:1 against the page.
          </p>
          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Pair</th>
                  <th className="px-4 py-2 font-medium">Needs</th>
                  <th className="px-4 py-2 font-medium">Light</th>
                  <th className="px-4 py-2 font-medium">Dark</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {pairs.map((p) => (
                  <tr key={`${p.fg}/${p.bg}`}>
                    <td className="px-4 py-2">
                      <code className="text-xs">{p.fg}</code>{" "}
                      <span className="text-muted-foreground">on</span>{" "}
                      <code className="text-xs">{p.bg}</code>
                    </td>
                    <td className="text-muted-foreground px-4 py-2 text-xs">
                      {p.kind} · {p.min}:1
                    </td>
                    {(["light", "dark"] as const).map((mode) => {
                      const r = contrast(value(p.fg, mode), value(p.bg, mode));
                      return (
                        <td key={mode} className="px-4 py-2">
                          {r === null ? (
                            <span className="text-muted-foreground">n/a</span>
                          ) : (
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                                r >= p.min
                                  ? "border-tone-success-border bg-tone-success-bg text-tone-success-fg"
                                  : "border-tone-danger-border bg-tone-danger-bg text-tone-danger-fg"
                              }`}
                            >
                              {r.toFixed(2)}:1 ·{" "}
                              {r >= p.min
                                ? p.min === 4.5 && r >= 7
                                  ? "AAA"
                                  : "Pass"
                                : "Fail"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {scales.length > 0 && (
        <Section title="Scales">
          <p className="text-muted-foreground">
            Primitives. Reference these through semantic or tone tokens rather
            than directly.
          </p>
          <div className="space-y-5">
            {scales.map((g) => (
              <div key={g.id}>
                <h3 className="mb-2 text-sm font-medium">
                  {title(g.id)}{" "}
                  <span className="text-muted-foreground font-normal">
                    · {g.description}
                  </span>
                </h3>
                <div
                  className="border-border grid overflow-hidden rounded-lg border"
                  style={{
                    gridTemplateColumns: `repeat(${g.tokens.length}, minmax(0, 1fr))`,
                  }}
                >
                  {g.tokens.map((name) => (
                    <div key={name}>
                      <TokenSwatch
                        name={name}
                        className="h-12"
                        label={`${name} ${shown(name, "light")}`}
                      />
                      <div
                        className="text-muted-foreground py-1 text-center text-[10px]"
                        title={shown(name, "light")}
                      >
                        {stepOf(name)}
                        {parsed.tokens[name].description ? " ●" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {other.length > 0 && (
        <Section title="Shape & elevation">
          {other.map((g) => (
            <div key={g.id} className="space-y-2">
              <h3 className="text-sm font-medium">
                {title(g.id)}{" "}
                <span className="text-muted-foreground font-normal">
                  · {g.description}
                </span>
              </h3>
              <div className="border-border overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <tbody className="divide-border divide-y">
                    {g.tokens.map((name) => {
                      const light = value(name, "light");
                      const dark = value(name, "dark");
                      return (
                        <tr key={name}>
                          <td className="px-4 py-2 align-top">
                            <code className="text-xs">--{name}</code>
                          </td>
                          <td className="text-muted-foreground px-4 py-2 align-top font-mono text-[11px] leading-snug">
                            {light}
                            {dark !== light && (
                              <>
                                <br />
                                <span className="text-foreground/60">
                                  dark:
                                </span>{" "}
                                {dark}
                              </>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {isShadowPreview(name) && (
                              <div
                                className="border-border bg-card size-10 rounded-md border"
                                style={{ boxShadow: `var(--${name})` }}
                              />
                            )}
                            {name === "radius" && (
                              <div
                                className="border-primary size-10 border-2"
                                style={{ borderRadius: "var(--radius)" }}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </Section>
      )}
    </>
  );
}
