import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { QrCode, Radio, Server, Share2, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/transfer")({
  head: () => ({
    meta: [
      { title: "File transfer — Smart Files" },
      { name: "description", content: "Send files via WiFi, FTP, QR code or share sheet." },
    ],
  }),
  component: TransferPage,
});

function TransferPage() {
  const [port] = useState(8080);
  const [host, setHost] = useState<string>("device-lan-ip");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hostname;
      if (h && h !== "localhost") setHost(h);
    }
  }, []);

  const url = `http://${host}:${port}`;

  return (
    <PageShell title="Transfer" subtitle="Send and receive files">
      <Card
        icon={Wifi}
        color="bg-cat-image"
        title="WiFi File Transfer"
        description="Start a local server so any device on the same WiFi can upload or download files from your phone."
      >
        <ServerReadout url={url} />
      </Card>

      <Card
        icon={Server}
        color="bg-cat-video"
        title="FTP server"
        description="Anonymous or password-protected FTP for legacy clients and Windows Explorer."
      >
        <code className="mt-2 inline-block rounded-lg bg-surface-container-high px-3 py-1.5 font-mono text-xs text-foreground">
          ftp://{host}:2121
        </code>
      </Card>

      <Card
        icon={QrCode}
        color="bg-cat-document"
        title="QR code sharing"
        description="Show a QR code with the transfer URL. Scan on another phone to open instantly."
      >
        <div className="mt-3 grid h-40 w-40 place-items-center rounded-2xl bg-surface-container-high text-muted-foreground">
          <QrCode className="h-20 w-20" strokeWidth={1.2} />
        </div>
      </Card>

      <Card
        icon={Radio}
        color="bg-cat-audio"
        title="Nearby transfer"
        description="Peer-to-peer transfer over WiFi Direct when supported by both devices."
      />

      <Card
        icon={Share2}
        color="bg-cat-apk"
        title="Share to other apps"
        description="Use the Android share sheet to send files to messengers, email or cloud apps."
      />

      <p className="mt-4 rounded-2xl bg-surface-container p-3 text-[11px] leading-relaxed text-muted-foreground">
        Transfer services require the Android build with the local server capability enabled.
        On device, tap Start to broadcast on your WiFi.
      </p>
    </PageShell>
  );
}

function Card({
  icon: Icon,
  color,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mb-3 flex gap-3 rounded-3xl bg-surface-container p-4">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white ${color}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        {children}
      </div>
    </section>
  );
}

function ServerReadout({ url }: { url: string }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      <code className="inline-block rounded-lg bg-surface-container-high px-3 py-1.5 font-mono text-xs text-foreground">
        {url}
      </code>
      <div className="flex gap-2">
        <button className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          Start server
        </button>
        <button className="rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-primary/10 hover:text-primary">
          Copy URL
        </button>
      </div>
    </div>
  );
}
