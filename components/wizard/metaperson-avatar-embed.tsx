"use client";

import * as React from "react";
import { LockSimpleIcon } from "@phosphor-icons/react";

// TODO: No Avatar SDK account is wired up yet — this is a placeholder,
// following the same pattern as lib/tremendous.ts and lib/sms.ts.
//
// Ready Player Me (the previous "build from a selfie" provider) shut down
// permanently — Netflix acquired the company and took the public platform
// offline on Jan 31, 2026, with no public successor. Avatar SDK's
// MetaPerson Creator (https://avatarsdk.com/metaperson-creator/) is the
// closest replacement: it embeds the same way (iframe + postMessage) and
// also supports "create from a selfie."
//
// Setup: register at https://avatarsdk.com, create an app in the developer
// portal to get a CLIENT_ID + CLIENT_SECRET, and set
// NEXT_PUBLIC_METAPERSON_CLIENT_ID / NEXT_PUBLIC_METAPERSON_CLIENT_SECRET.
// Per Avatar SDK's docs the auth handshake happens from the browser (the
// iframe posts "metaperson_creator_loaded", the parent responds with an
// "authenticate" message carrying both values) — there's no way to keep the
// secret server-only for this flow, so treat it as a domain-restricted key,
// not a true secret, and confirm domain locking in the Avatar SDK dashboard
// once you have an account. Also note: their docs mention the Export button
// may stay inactive without a Pro-tier-or-higher plan, so exporting a real
// avatar URL may require a paid plan even after signup.
//
// The exact postMessage event name/payload for a *completed* export wasn't
// available in the documentation pulled for this integration — only that
// "handlers can be added to other events from MetaPerson Creator." The
// listener below is written defensively (accepts any message carrying a
// url-shaped field) but MUST be verified against a real account before
// relying on it.
const CLIENT_ID = process.env.NEXT_PUBLIC_METAPERSON_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_METAPERSON_CLIENT_SECRET;
const METAPERSON_IFRAME_URL = "https://metaperson.avatarsdk.com/iframe.html";

interface MetaPersonAvatarEmbedProps {
  onExported: (result: { imageUrl: string; glbUrl?: string }) => void;
  className?: string;
}

export function MetaPersonAvatarEmbed({ onExported, className }: MetaPersonAvatarEmbedProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [authenticated, setAuthenticated] = React.useState(false);
  const configured = !!CLIENT_ID && !!CLIENT_SECRET;

  React.useEffect(() => {
    if (!configured) return;

    const handleMessage = (event: MessageEvent) => {
      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== "object") return;
      const payload = data as { eventName?: string; data?: { url?: string; modelUrl?: string; glbUrl?: string } };

      if (payload.eventName === "metaperson_creator_loaded") {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ eventName: "authenticate", clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
          "*",
        );
        setAuthenticated(true);
      }

      // Best-effort: accept any message that looks like an exported model URL.
      const url = payload.data?.glbUrl ?? payload.data?.modelUrl ?? payload.data?.url;
      if (url && /\.(glb|gltf)(\?|$)/i.test(url)) {
        onExported({ imageUrl: url.replace(/\.(glb|gltf)(\?|$)/i, ".png$1"), glbUrl: url });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [configured, onExported]);

  if (!configured) {
    return (
      <div className={className}>
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <LockSimpleIcon size={18} weight="duotone" />
          </span>
          <p className="text-sm font-medium">Photo avatars aren&apos;t connected yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            This will build a 3D avatar from a selfie once Avatar SDK (MetaPerson) credentials are configured. Use the DiceBear builder or
            AI illustration for now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {!authenticated && <p className="mb-2 text-center text-xs text-muted-foreground">Loading avatar creator…</p>}
      <iframe
        ref={iframeRef}
        src={METAPERSON_IFRAME_URL}
        allow="camera *; microphone *"
        className="h-full min-h-[520px] w-full rounded-2xl border-0"
        title="MetaPerson Avatar Creator"
      />
    </div>
  );
}
