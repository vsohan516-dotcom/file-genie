import { formatBytes } from "@/utils/files";
import { HardDrive } from "lucide-react";

interface StorageCardProps {
  label: string;
  usedBytes: number;
  totalBytes: number;
}

export function StorageCard({ label, usedBytes, totalBytes }: StorageCardProps) {
  const pct = totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0;
  const free = Math.max(0, totalBytes - usedBytes);

  const size = 128;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-container to-surface-container p-5">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--outline-variant)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dashoffset 600ms ease" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-on-primary-container">{pct}%</div>
              <div className="text-[10px] uppercase tracking-wider text-on-primary-container/70">used</div>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-on-primary-container/80">
            <HardDrive className="h-4 w-4" />
            {label}
          </div>
          <div className="mt-1 text-lg font-semibold text-on-primary-container">
            {formatBytes(usedBytes)} <span className="text-sm font-normal opacity-70">of {formatBytes(totalBytes)}</span>
          </div>
          <div className="mt-1 text-xs text-on-primary-container/70">
            {formatBytes(free)} free
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface/60">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
