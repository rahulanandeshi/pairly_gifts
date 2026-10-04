import type { MetadataRoute } from "next";
import { occasions, cards } from "@/lib/mock-data";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = ["", "/cards", "/categories", "/pricing", "/about", "/careers", "/contact", "/help", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
  }));

  const occasionEntries: MetadataRoute.Sitemap = occasions.map((o) => ({
    url: `${SITE_URL}/categories/${o.slug}`,
    lastModified: now,
  }));

  const cardEntries: MetadataRoute.Sitemap = cards.map((c) => ({
    url: `${SITE_URL}/cards/${c.slug}`,
    lastModified: now,
  }));

  return [...staticEntries, ...occasionEntries, ...cardEntries];
}
