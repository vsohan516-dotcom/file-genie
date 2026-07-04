import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help — Smart Files" },
      { name: "description", content: "Tips and shortcuts for using Smart Files." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <PageShell title="Help & tips" subtitle="Get the most out of Smart Files">
      <div className="space-y-3">
        <Tip title="Long-press to select">
          Hold on any file to enter selection mode, then tap more items to select multiple.
        </Tip>
        <Tip title="Sort your way">
          In the browser, choose Name, Date, Size or Type and toggle ascending / descending.
        </Tip>
        <Tip title="Jump to categories">
          The home screen has tiles for Images, Videos, Audio, Documents, APK, Archives and
          Downloads.
        </Tip>
        <Tip title="Star favorites">
          Long-press any file and tap the star to keep it a swipe away.
        </Tip>
        <Tip title="Search everything">
          Use the search screen to find files by name, extension or minimum size.
        </Tip>
      </div>
    </PageShell>
  );
}

function Tip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface-container p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
