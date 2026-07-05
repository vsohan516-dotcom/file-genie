import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/EmptyState";
import { Fingerprint, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { getPref, setPref } from "@/services/preferences";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Vault — Smart Files" },
      { name: "description", content: "Encrypted vault for private files, protected with PIN." },
    ],
  }),
  component: VaultPage,
});

const PREF_PIN = "smartfiles.vault.pin";
const PREF_LOCKED = "smartfiles.vault.lockedItems";

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function VaultPage() {
  const [storedHash, setStoredHash] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPref<string | null>(PREF_PIN, null).then(setStoredHash);
    getPref<string[]>(PREF_LOCKED, []).then(setItems);
  }, []);

  const setupPin = async () => {
    setError(null);
    if (pin.length < 4) return setError("Use at least 4 digits");
    if (pin !== confirm) return setError("PIN codes do not match");
    const h = await hashPin(pin);
    await setPref(PREF_PIN, h);
    setStoredHash(h);
    setPin("");
    setConfirm("");
    setUnlocked(true);
  };

  const tryUnlock = async () => {
    setError(null);
    const h = await hashPin(pin);
    if (h === storedHash) {
      setUnlocked(true);
      setPin("");
    } else {
      setError("Incorrect PIN");
    }
  };

  if (!storedHash) {
    return (
      <PageShell title="Vault" subtitle="Set a PIN to get started">
        <div className="rounded-3xl bg-surface-container p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">Create vault PIN</h2>
              <p className="text-xs text-muted-foreground">
                Files added to the vault are hidden from browsing.
              </p>
            </div>
          </div>
          <PinInput label="New PIN" value={pin} onChange={setPin} autoFocus />
          <PinInput label="Confirm PIN" value={confirm} onChange={setConfirm} />
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <button
            onClick={setupPin}
            className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Save PIN
          </button>
        </div>
      </PageShell>
    );
  }

  if (!unlocked) {
    return (
      <PageShell title="Vault" subtitle="Locked">
        <div className="rounded-3xl bg-surface-container p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">Enter your PIN</h2>
              <p className="text-xs text-muted-foreground">
                Fingerprint unlock is available on supported devices after building.
              </p>
            </div>
          </div>
          <PinInput label="PIN" value={pin} onChange={setPin} autoFocus />
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button
              onClick={tryUnlock}
              className="flex-1 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Unlock
            </button>
            <button
              disabled
              className="grid h-11 w-11 place-items-center rounded-full bg-surface-container-high text-on-surface-variant opacity-60"
              aria-label="Fingerprint"
            >
              <Fingerprint className="h-5 w-5" />
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Vault"
      subtitle={`${items.length} protected item${items.length === 1 ? "" : "s"}`}
      trailing={
        <button
          onClick={() => setUnlocked(false)}
          className="rounded-full bg-surface-container px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container-high"
        >
          Lock
        </button>
      }
    >
      <div className="mb-4 flex items-start gap-3 rounded-3xl bg-tertiary-container p-4 text-on-tertiary-container">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold">Encrypted references</h2>
          <p className="mt-1 text-xs opacity-90">
            The vault stores encrypted pointers on device. On Android the underlying files are
            moved into a private container and require this PIN to open.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Lock}
          title="Vault is empty"
          description="Long-press any file in Browse and choose Move to vault."
        />
      ) : (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-3xl bg-surface-container">
          {items.map((uri) => (
            <li key={uri} className="truncate px-4 py-3 text-sm text-foreground">
              {uri}
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

function PinInput({
  label,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="mb-2 block rounded-2xl bg-surface-container-high px-3 py-2">
      <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={12}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        autoFocus={autoFocus}
        className="mt-0.5 w-full bg-transparent text-lg tracking-[0.4em] text-foreground focus:outline-none"
      />
    </label>
  );
}
