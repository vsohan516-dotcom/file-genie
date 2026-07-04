import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { CategoryId } from "@/types/files";

interface CategoryTileProps {
  categoryId: CategoryId;
  label: string;
  count?: number | string;
  icon: LucideIcon;
  colorClass: string;
}

export function CategoryTile({ categoryId, label, count, icon: Icon, colorClass }: CategoryTileProps) {
  return (
    <Link
      to="/category/$type"
      params={{ type: categoryId }}
      className="ripple group flex flex-col items-start gap-3 rounded-3xl bg-surface-container p-4 transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </span>
      <span className="flex w-full items-end justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground">{count}</span>
        )}
      </span>
    </Link>
  );
}
