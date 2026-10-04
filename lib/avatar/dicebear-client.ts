"use client";

import * as React from "react";
import { createAvatar, type Style } from "@dicebear/core";
import type { describeStyle } from "@/lib/avatar/schema";

// Client-side helpers for working with DiceBear styles: each style is loaded
// lazily (one dynamic import per style) and cached for the session, so none
// of them land in a page bundle until an avatar UI actually needs them.

export type StyleModule = Style<Record<string, unknown>> & { schema: Parameters<typeof describeStyle>[0] };

const moduleCache = new Map<string, Promise<StyleModule>>();

export function loadStyle(id: string): Promise<StyleModule> {
  let pending = moduleCache.get(id);
  if (!pending) {
    pending = import("@dicebear/collection/async").then((collection) => {
      const loader = (collection as unknown as Record<string, (() => Promise<StyleModule>) | undefined>)[id];
      if (!loader) throw new Error(`Unknown avatar style: ${id}`);
      return loader();
    });
    moduleCache.set(id, pending);
  }
  return pending;
}

/** The loaded style module, or null while it loads. Switching `id` never returns a stale module. */
export function useStyleModule(id: string): StyleModule | null {
  const [loaded, setLoaded] = React.useState<{ id: string; module: StyleModule } | null>(null);
  React.useEffect(() => {
    let live = true;
    loadStyle(id)
      .then((module) => live && setLoaded({ id, module }))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [id]);
  return loaded && loaded.id === id ? loaded.module : null;
}

export function renderAvatar(module: StyleModule, options: Record<string, unknown>): string {
  return createAvatar(module, options).toDataUri();
}
