import { TokenSwatch } from "@/components/colors/token-swatch";
import { PageHeader, Section } from "@/components/shared/doc";
import { loadTokens } from "@/lib/load-tokens";
import { resolveToken } from "@/lib/parse-css.mjs";

const title = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

export default async function ColorsPage() {
  "use cache";

  const parsed = await loadTokens();
  const { groups } = parsed;

  const semantic = groups.filter((g) => g.kind === "semantic");

  return (
    <>
      <PageHeader
        title="Colors"
        description="The logo blue (#00549b) is brand-700. Every scale is generated at a consistent lightness so steps line up across hues."
      />

      <Section title="Semantic tokens">
        <p className="text-muted-foreground">
          Use these in components. They switch automatically in dark mode. Click
          a swatch to copy its variable.
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
              {g.tokens.map((name) => {
                const light = resolveToken(parsed, name, "light");
                const dark = resolveToken(parsed, name, "dark");
                return (
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
                      <p className="text-muted-foreground text-[11px] leading-snug">
                        Light {light.via ? `${light.via} · ` : ""}
                        {light.value}
                        <br />
                        Dark {dark.via ? `${dark.via} · ` : ""}
                        {dark.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Section>
    </>
  );
}
