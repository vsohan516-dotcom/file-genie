import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { ArrowLeft, MoreVertical, Search } from "lucide-react";
import type { ReactNode } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  hideSearch?: boolean;
  trailing?: ReactNode;
}

export function TopBar({ title, subtitle, showBack, hideSearch, trailing }: TopBarProps) {
  const router = useRouter();
  const location = useLocation();
  const canGoBack = showBack ?? location.pathname !== "/";

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-4xl items-center gap-2 px-3">
        {canGoBack ? (
          <button
            aria-label="Back"
            onClick={() => router.history.back()}
            className="grid h-11 w-11 place-items-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <span className="text-lg font-bold">S</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {!hideSearch && (
          <Link
            to="/search"
            aria-label="Search"
            className="grid h-11 w-11 place-items-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <Search className="h-5 w-5" />
          </Link>
        )}
        {trailing ?? (
          <button
            aria-label="More"
            className="grid h-11 w-11 place-items-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
