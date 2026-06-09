import { describe, it, expect } from "vitest";
import { buildSitemapEntries, generateSitemapXML, type SitemapURLEntry } from "./sitemap-core.js";

describe("sitemap-core", () => {
  describe("buildSitemapEntries", () => {
    it("includes root with priority 1.0", () => {
      const entries = buildSitemapEntries({
        domain: "https://example.com",
        staticRoutes: [""],
        dynamicPatterns: [],
        defaultChangefreq: "weekly",
        defaultPriority: "0.8",
        rootPriority: "1.0",
        compression: false,
      });

      expect(entries).toHaveLength(1);
      expect(entries[0].loc).toBe("https://example.com");
      expect(entries[0].priority).toBe("1.0");
      expect(entries[0].changefreq).toBe("weekly");
    });

    it("handles static routes with leading slash", () => {
      const entries = buildSitemapEntries({
        domain: "https://example.com",
        staticRoutes: ["/about", "/contact"],
        dynamicPatterns: [],
        defaultChangefreq: "monthly",
        defaultPriority: "0.8",
        rootPriority: "1.0",
        compression: false,
      });

      expect(entries).toHaveLength(2);
      expect(entries[0].loc).toBe("https://example.com/about");
      expect(entries[1].loc).toBe("https://example.com/contact");
    });

    it("handles static routes without leading slash", () => {
      const entries = buildSitemapEntries({
        domain: "https://example.com",
        staticRoutes: ["about", "contact"],
        dynamicPatterns: [],
        defaultChangefreq: "weekly",
        defaultPriority: "0.8",
        rootPriority: "1.0",
        compression: false,
      });

      expect(entries).toHaveLength(2);
      expect(entries[0].loc).toBe("https://example.com/about");
    });

    it("includes root route when empty string is present", () => {
      const entries = buildSitemapEntries({
        domain: "https://example.com",
        staticRoutes: ["", "/about"],
        dynamicPatterns: [],
        defaultChangefreq: "weekly",
        defaultPriority: "0.8",
        rootPriority: "1.0",
        compression: false,
      });

      expect(entries).toHaveLength(2);
      expect(entries[0].loc).toBe("https://example.com");
      expect(entries[0].priority).toBe("1.0");
      expect(entries[1].loc).toBe("https://example.com/about");
      expect(entries[1].priority).toBe("0.8");
    });

    it("avoids duplicate routes", () => {
      const entries = buildSitemapEntries({
        domain: "https://example.com",
        staticRoutes: ["/about", "/about", "/contact"],
        dynamicPatterns: [],
        defaultChangefreq: "weekly",
        defaultPriority: "0.8",
        rootPriority: "1.0",
        compression: false,
      });

      // Map deduplication by route
      const urls = entries.map((e) => e.loc);
      expect(new Set(urls).size).toBe(2);
    });
  });

  describe("generateSitemapXML", () => {
    it("generates valid XML", () => {
      const entries: SitemapURLEntry[] = [
        {
          loc: "https://example.com",
          changefreq: "daily",
          priority: "1.0",
          lastmod: "2025-01-01",
        },
      ];

      const xml = generateSitemapXML(entries);
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(xml).toContain("<loc>https://example.com</loc>");
      expect(xml).toContain("<lastmod>2025-01-01</lastmod>");
      expect(xml).toContain("<changefreq>daily</changefreq>");
      expect(xml).toContain("<priority>1.0</priority>");
    });

    it("escapes XML special characters", () => {
      const entries: SitemapURLEntry[] = [
        {
          loc: "https://example.com/path?foo=bar&baz=qux",
          changefreq: "weekly",
          priority: "0.5",
        },
      ];

      const xml = generateSitemapXML(entries);
      expect(xml).toContain("foo=bar&amp;baz=qux");
    });

    it("includes xhtml alternates when present", () => {
      const entries: SitemapURLEntry[] = [
        {
          loc: "https://example.com/en",
          changefreq: "weekly",
          priority: "0.8",
          alternates: [
            { hreflang: "en", href: "https://example.com/en" },
            { hreflang: "es", href: "https://example.com/es" },
          ],
        },
      ];

      const xml = generateSitemapXML(entries);
      expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
      expect(xml).toContain('hreflang="en"');
      expect(xml).toContain('hreflang="es"');
    });

    it("generates empty urlset for no entries", () => {
      const xml = generateSitemapXML([]);
      expect(xml).toContain("<urlset");
      expect(xml).toContain("</urlset>");
      expect(xml).not.toContain("<url>");
    });
  });
});
