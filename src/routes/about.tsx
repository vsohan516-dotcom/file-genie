import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Smart Files" },
      { name: "description", content: "About the Smart Files Android file manager." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell title="About" subtitle="Smart Files">
      <div className="rounded-3xl bg-gradient-to-br from-primary-container to-surface-container p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-lg">
          <span className="text-2xl font-bold">S</span>
        </div>
        <h2 className="mt-4 text-xl font-bold text-on-primary-container">Smart Files</h2>
        <p className="mt-1 text-sm text-on-primary-container/80">
          A fast, beautiful, private file manager.
        </p>
        <p className="mt-3 text-xs text-on-primary-container/70">Version 1.0.0</p>
      </div>

      <section className="mt-6 space-y-4">
        <Info title="What it does">
          Browse internal storage, organize files by category, star favorites and search
          instantly — all with a Material You interface.
        </Info>
        <Info title="Privacy first">
          Smart Files runs entirely on your device. Nothing is uploaded and no analytics are
          collected.
        </Info>
        <Info title="Open technology">
          Built with React, TypeScript, TanStack Router, Tailwind CSS and Capacitor. Ready to
          package as a native Android APK.
        </Info>
      </section>
    </PageShell>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface-container p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
