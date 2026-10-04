"use client";

import * as React from "react";
import { MagnifyingGlassIcon, FunnelIcon, XIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardTile } from "@/components/cards/card-tile";
import { EmptyState } from "@/components/shared/empty-state";
import type { GreetingCard, OccasionMeta, CultureMeta } from "@/lib/mock-data";

type SortKey = "featured" | "trending" | "newest" | "priceLow" | "priceHigh" | "rating";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
];

function sortCards(list: GreetingCard[], sort: SortKey) {
  const copy = [...list];
  switch (sort) {
    case "trending":
      return copy.sort((a, b) => Number(b.trending) - Number(a.trending));
    case "newest":
      return copy.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "priceLow":
      return copy.sort((a, b) => a.price - b.price);
    case "priceHigh":
      return copy.sort((a, b) => b.price - a.price);
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

interface MarketplaceProps {
  cards: GreetingCard[];
  occasions: OccasionMeta[];
  cultures: CultureMeta[];
  initialGiftFilter?: boolean;
}

export function Marketplace({ cards: allCards, occasions, cultures, initialGiftFilter = false }: MarketplaceProps) {
  const [query, setQuery] = React.useState("");
  const [occasion, setOccasion] = React.useState<string>("all");
  const [culture, setCulture] = React.useState<string>("all");
  const [priceFilter, setPriceFilter] = React.useState<"all" | "free" | "premium">(
    initialGiftFilter ? "premium" : "all",
  );
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    let list = allCards;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.tags.some((t) => t.includes(q)));
    }
    if (occasion !== "all") list = list.filter((c) => c.occasion === occasion);
    if (culture !== "all") list = list.filter((c) => c.cultures.includes(culture as never));
    if (priceFilter === "free") list = list.filter((c) => !c.premium);
    if (priceFilter === "premium") list = list.filter((c) => c.premium);
    return sortCards(list, sort);
  }, [query, occasion, culture, priceFilter, sort]);

  const activeFilterCount = [occasion !== "all", culture !== "all", priceFilter !== "all"].filter(Boolean).length;

  const resetFilters = () => {
    setOccasion("all");
    setCulture("all");
    setPriceFilter("all");
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards, occasions, styles…"
            className="h-11 rounded-full pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setFiltersOpen((o) => !o)}
          className="h-11 cursor-pointer justify-center gap-2 rounded-full px-4 sm:w-auto"
        >
          <FunnelIcon size={15} />
          Filters {activeFilterCount > 0 && <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{activeFilterCount}</span>}
        </Button>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-11 w-full rounded-full sm:w-48">
            <SelectValue placeholder="Sort by">{(v: SortKey) => SORTS.find((s) => s.value === v)?.label ?? "Sort by"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtersOpen && (
        <div className="glass-panel mt-4 flex flex-wrap items-end gap-4 rounded-2xl p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Occasion</label>
            <Select value={occasion} onValueChange={(v) => setOccasion(v ?? "all")}>
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue>{(v: string) => (v === "all" ? "All Occasions" : occasions.find((o) => o.slug === v)?.name ?? v)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Occasions</SelectItem>
                {occasions.map((o) => (
                  <SelectItem key={o.slug} value={o.slug}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Culture</label>
            <Select value={culture} onValueChange={(v) => setCulture(v ?? "all")}>
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue>{(v: string) => (v === "all" ? "All Cultures" : cultures.find((c) => c.slug === v)?.name ?? v)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cultures</SelectItem>
                {cultures.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Price</label>
            <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v as typeof priceFilter)}>
              <SelectTrigger className="w-40 rounded-xl">
                <SelectValue>{(v: string) => ({ all: "All", free: "Free", premium: "Premium" }[v] ?? v)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" onClick={resetFilters} className="cursor-pointer gap-1.5 rounded-full text-sm">
              <XIcon size={13} /> Clear filters
            </Button>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground">{filtered.length} card{filtered.length === 1 ? "" : "s"} found</p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c, i) => (
            <CardTile key={c.id} card={c} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-10"
          title="No cards match your filters"
          description="Try a different search term or clear your filters to see everything we offer."
          actionLabel="Clear filters"
          actionHref="/cards"
        />
      )}
    </div>
  );
}
