export interface SitemapDynamicPattern {
  pattern: string;
  collection?: string;
  source?: string;
  idRegex?: RegExp;
}

export interface SitemapOptions {
  domain: string;
  staticRoutes: string[];
  dynamicPatterns: SitemapDynamicPattern[];
  defaultChangefreq: string;
  defaultPriority: string;
  rootPriority: string;
  lastmod?: string;
  compression: boolean;
}

export interface SitemapURLEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
  alternates?: { hreflang: string; href: string }[];
}

const DEFAULT_OPTIONS: Partial<SitemapOptions> = {
  defaultChangefreq: "weekly",
  defaultPriority: "0.8",
  rootPriority: "1.0",
  compression: false,
};

export function generateSitemapXML(
  entries: SitemapURLEntry[],
): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  const hasAlternates = entries.some((e) => e.alternates?.length);
  if (hasAlternates) {
    xml += ' xmlns:xhtml="http://www.w3.org/1999/xhtml"';
  }
  xml += ">\n";

  for (const entry of entries) {
    xml += "  <url>\n";
    xml += `    <loc>${escapeXML(entry.loc)}</loc>\n`;
    if (entry.lastmod) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;

    if (entry.alternates) {
      for (const alt of entry.alternates) {
        xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXML(alt.href)}"/>\n`;
      }
    }
    xml += "  </url>\n";
  }

  xml += "</urlset>";
  return xml;
}

export function buildSitemapEntries(options: SitemapOptions): SitemapURLEntry[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const entries: SitemapURLEntry[] = [];

  const routes = new Map<string, { changefreq: string; priority: string }>();

  for (const route of opts.staticRoutes) {
    const normalized = normalizeRoute(route);
    routes.set(normalized === "/" ? "" : normalized, {
      changefreq: opts.defaultChangefreq,
      priority: normalized === "/" ? opts.rootPriority : opts.defaultPriority,
    });
  }

  for (const pattern of opts.dynamicPatterns) {
    const ids = extractDynamicIds(pattern);
    const urlPath = buildDynamicUrlPath(pattern.pattern, ids);
    routes.set(urlPath, {
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  for (const [path, meta] of routes) {
    const urlPath = path === "/" ? "" : path;
    entries.push({
      loc: `${opts.domain}${urlPath}`,
      lastmod: opts.lastmod,
      changefreq: meta.changefreq,
      priority: meta.priority,
    });
  }

  return entries;
}

function extractDynamicIds(pattern: SitemapDynamicPattern): string[] {
  if (pattern.idRegex && pattern.source) {
    const fs = require("node:fs");
    const path = require("node:path");
    const filePath = path.resolve(process.cwd(), pattern.source);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const ids: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = pattern.idRegex.exec(content)) !== null) {
        ids.push(match[1]);
      }
      return ids;
    }
  }
  return [];
}

function buildDynamicUrlPath(pattern: string, ids: string[]): string {
  return pattern.replace(/\[(\w+)\]/g, () => ids.shift() ?? ":id");
}

function normalizeRoute(route: string): string {
  if (route === "" || route === "/") return "/";
  return route.startsWith("/") ? route : `/${route}`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
