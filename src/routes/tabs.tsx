import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useTabs } from "@/context/TabsContext";
import { FolderOpen, Plus, SplitSquareHorizontal, X } from "lucide-react";

export const Route = createFileRoute("/tabs")({
  head: () => ({
    meta: [
      { title: "Tabs — Smart Files" },
      { name: "description", content: "Open multiple folders in tabs and split screen." },
    ],
  }),
  component: TabsPage,
});

function TabsPage() {
  const navigate = useNavigate();
  const { tabs, activeId, addTab, closeTab, setActive, splitMode, setSplitMode, secondaryId, setSecondaryId } =
    useTabs();

  const openTab = (id: string) => {
    setActive(id);
    const tab = tabs.find((t) => t.id === id);
    if (tab) void navigate({ to: "/browse", search: { path: tab.path } });
  };

  return (
    <PageShell
      title="Tabs"
      subtitle={`${tabs.length} open`}
      trailing={
        <button
          onClick={() => {
            const id = addTab();
            void navigate({ to: "/browse", search: { path: tabs.find((t) => t.id === id)?.path ?? "documents:" } });
          }}
          className="grid h-11 w-11 place-items-center rounded-full text-on-surface hover:bg-surface-container-high"
          aria-label="New tab"
        >
          <Plus className="h-5 w-5" />
        </button>
      }
    >
      <div className="mb-4 flex items-center justify-between rounded-3xl bg-surface-container px-4 py-3">
        <div className="flex items-center gap-2">
          <SplitSquareHorizontal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Split screen</span>
        </div>
        <button
          role="switch"
          aria-checked={splitMode}
          onClick={() => setSplitMode(!splitMode)}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            splitMode ? "bg-primary" : "bg-outline-variant"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-surface shadow transition-transform ${
              splitMode ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <ul className="space-y-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          const isSecondary = tab.id === secondaryId;
          return (
            <li
              key={tab.id}
              className={`flex items-center gap-3 rounded-3xl border p-3 transition-colors ${
                isActive
                  ? "border-primary/40 bg-primary-container/40"
                  : "border-transparent bg-surface-container"
              }`}
            >
              <button
                onClick={() => openTab(tab.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-container text-on-primary-container">
                  <FolderOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{tab.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{tab.path}</p>
                </div>
              </button>

              {splitMode && (
                <button
                  onClick={() => setSecondaryId(isSecondary ? null : tab.id)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    isSecondary
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {isSecondary ? "Panel B" : "Set B"}
                </button>
              )}

              <button
                onClick={() => closeTab(tab.id)}
                aria-label="Close tab"
                className="grid h-9 w-9 place-items-center rounded-full text-on-surface-variant hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
