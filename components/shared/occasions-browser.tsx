"use client";

import * as React from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { OccasionTile } from "@/components/shared/occasion-tile";
import { EmptyState } from "@/components/shared/empty-state";
import type { OccasionMeta } from "@/lib/mock-data";

interface OccasionsBrowserProps {
  occasions: OccasionMeta[];
}

export function OccasionsBrowser({ occasions }: OccasionsBrowserProps) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return occasions;
    return occasions.filter((o) => o.name.toLowerCase().includes(q) || o.blurb.toLowerCase().includes(q));
  }, [occasions, query]);

  return (
    <div>
      <div className="relative mx-auto max-w-md">
        <MagnifyingGlassIcon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search occasions…"
          className="h-12 rounded-full pl-11 pr-11"
          aria-label="Search occasions"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {filtered.length} occasion{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((o, i) => (
            <OccasionTile key={o.slug} occasion={o} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-10"
          title="No occasions match your search"
          description="Try a different word, or browse the full list."
        />
      )}
    </div>
  );
}
