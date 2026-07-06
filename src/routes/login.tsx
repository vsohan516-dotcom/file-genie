import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Smart Files" },
      { name: "description", content: "Sign in to Smart Files with your social account." },
    ],
  }),
  component: LoginPage,
});

type Provider = {
  id: "facebook" | "instagram" | "whatsapp";
  name: string;
  icon: typeof Facebook;
  bg: string;
};

const PROVIDERS: Provider[] = [
  { id: "facebook", name: "Continue with Facebook", icon: Facebook, bg: "bg-[#1877F2]" },
  {
    id: "instagram",
    name: "Continue with Instagram",
    icon: Instagram,
    bg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
  },
  { id: "whatsapp", name: "Continue with WhatsApp", icon: MessageCircle, bg: "bg-[#25D366]" },
];

function LoginPage() {
  const onClick = (p: Provider) => {
    toast.info(`${p.name.replace("Continue with ", "")} sign-in`, {
      description: "Configure OAuth credentials in Settings → Developer options to enable.",
    });
  };

  return (
    <PageShell title="Sign in" subtitle="Use a social account to sync your library">
      <div className="mx-auto flex max-w-sm flex-col gap-3 pt-4">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => onClick(p)}
            className={`${p.bg} flex items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.99] transition-transform`}
          >
            <p.icon className="h-5 w-5" />
            {p.name}
          </button>
        ))}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing you agree to our terms. Your files stay on device.
        </p>
      </div>
    </PageShell>
  );
}
