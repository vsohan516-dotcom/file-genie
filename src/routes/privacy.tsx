import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Smart Files" },
      { name: "description", content: "How Smart Files handles your data." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageShell title="Privacy" subtitle="How your data is handled">
      <div className="space-y-4">
        <Block title="On-device only">
          Smart Files reads and organizes files locally on your device. No file contents are ever
          transmitted to remote servers.
        </Block>
        <Block title="No analytics">
          The app does not include third-party analytics, ad networks or crash reporting SDKs.
        </Block>
        <Block title="Permissions">
          Storage permission is required to list your files. On Android 13+ media-scoped
          permissions are used when appropriate.
        </Block>
        <Block title="Optional lock">
          You can enable an app lock in Settings so the app requires authentication when opened.
        </Block>
      </div>
    </PageShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-surface-container p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}
