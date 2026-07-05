import { Link, useLocation } from "@tanstack/react-router";
import { FolderOpen, Home, LayoutGrid, Search, Settings } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/browse", label: "Browse", icon: FolderOpen },
  { to: "/search", label: "Search", icon: Search },
  { to: "/tools", label: "Tools", icon: LayoutGrid },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border/60 bg-surface-container/95 backdrop-blur-md">
      <ul className="mx-auto grid max-w-4xl grid-cols-5">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to} className="flex justify-center">
              <Link
                to={to}
                className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium"
              >
                <span
                  className={`grid h-8 w-16 place-items-center rounded-full transition-colors ${
                    active
                      ? "bg-primary-container text-on-primary-container"
                      : "text-on-surface-variant"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={active ? "text-foreground" : "text-muted-foreground"}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
