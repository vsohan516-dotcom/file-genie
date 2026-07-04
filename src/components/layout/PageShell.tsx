import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

interface PageShellProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  hideSearch?: boolean;
  hideBottomNav?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  title,
  subtitle,
  showBack,
  hideSearch,
  hideBottomNav,
  trailing,
  children,
}: PageShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <TopBar
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        hideSearch={hideSearch}
        trailing={trailing}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-4 pb-24 sf-fade-up">
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
