import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { useTheme } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import type { AccentName, ThemeMode } from "@/types/files";
import { Info, Lock, ShieldCheck, Sparkles, Sun, Moon, Monitor, HelpCircle } from "lucide-react";

const ACCENTS: { id: AccentName; color: string }[] = [
  { id: "green", color: "oklch(0.6 0.16 160)" },
  { id: "blue", color: "oklch(0.6 0.16 240)" },
  { id: "violet", color: "oklch(0.6 0.19 300)" },
  { id: "orange", color: "oklch(0.68 0.17 45)" },
  { id: "rose", color: "oklch(0.62 0.2 12)" },
];

const MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Smart Files" },
      { name: "description", content: "Personalize theme, accents, privacy and behavior." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { mode, accent, setMode, setAccent } = useTheme();
  const { settings, updateSettings } = useApp();

  return (
    <PageShell title="Settings" subtitle="Personalize Smart Files">
      <Section title="Appearance">
        <Row label="Theme">
          <div className="flex gap-1 rounded-full bg-surface-container p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === m.id
                    ? "bg-primary text-primary-foreground"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Accent color">
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                aria-label={a.id}
                onClick={() => setAccent(a.id)}
                className={`grid h-8 w-8 place-items-center rounded-full border-2 transition-transform ${
                  accent === a.id ? "border-foreground scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: a.color }}
              />
            ))}
          </div>
        </Row>
        <ToggleRow
          label="Animations"
          description="Enable subtle motion and transitions"
          checked={settings.animations}
          onChange={(v) => updateSettings({ animations: v })}
        />
      </Section>

      <Section title="Files">
        <ToggleRow
          label="Show hidden files"
          description="Include files starting with a dot"
          checked={settings.showHidden}
          onChange={(v) => updateSettings({ showHidden: v })}
        />
        <ToggleRow
          label="Confirm before delete"
          description="Ask before removing files or folders"
          checked={settings.confirmDelete}
          onChange={(v) => updateSettings({ confirmDelete: v })}
        />
      </Section>

      <Section title="Privacy">
        <ToggleRow
          label="App lock"
          description="Require unlock when opening Smart Files"
          checked={settings.privacyLock}
          onChange={(v) => updateSettings({ privacyLock: v })}
        />
        <LinkRow to="/privacy" icon={ShieldCheck} label="Privacy policy" />
      </Section>

      <Section title="About">
        <LinkRow to="/about" icon={Info} label="About Smart Files" />
        <LinkRow to="/help" icon={HelpCircle} label="Help & tips" />
        <LinkRow to="/" icon={Sparkles} label="Version" trailing="1.0.0" />
      </Section>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        Data stays on your device.
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="divide-y divide-border/60 overflow-hidden rounded-3xl bg-surface-container">
        {children}
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-outline-variant"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-surface shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function LinkRow({
  to,
  icon: Icon,
  label,
  trailing,
}: {
  to: string;
  icon: typeof Sun;
  label: string;
  trailing?: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-container text-on-primary-container">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {trailing && <span className="text-xs text-muted-foreground">{trailing}</span>}
    </Link>
  );
}
