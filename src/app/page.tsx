import Link from "next/link";

import { PageHeader } from "@/components/shared/doc";

export default function Home() {
  return (
    <>
      <PageHeader
        title="GDOP Design System"
        description="Tokens, patterns and shadcn/ui components for the letters and approval
          workflow, built for a bilingual (English / Amharic) government
          product."
      />

      <section className="mb-12 scroll-mt-20">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          What's inside
        </h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/foundations/colors"
              className="border-border bg-card hover:border-primary/40 rounded-lg border p-5 transition-colors"
            >
              <h3 className="font-semibold">Foundations</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Colors anchored on the logo blue, with semantic and status tone
                roles.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
