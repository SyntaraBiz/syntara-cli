import fs from "node:fs";
import path from "node:path";
const DEFAULT_OPTIONS = {
    defaultChangefreq: "weekly",
    defaultPriority: "0.8",
    rootPriority: "1.0",
    compression: false,
};
export function generateSitemapXML(entries) {
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
export function buildSitemapEntries(options) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const entries = [];
    const domain = opts.domain.replace(/\/$/, "");
    const routes = new Map();
    for (const route of opts.staticRoutes) {
        const normalized = normalizeRoute(route);
        routes.set(normalized === "/" ? "" : normalized, {
            changefreq: opts.defaultChangefreq,
            priority: normalized === "/" ? opts.rootPriority : opts.defaultPriority,
        });
    }
    for (const pattern of opts.dynamicPatterns) {
        const ids = extractDynamicIds(pattern);
        // Generate one URL per ID, not one per pattern
        const placeholders = (pattern.pattern.match(/[\[\{]\w+[\]\}]/g) ?? []).length;
        const entriesPerId = placeholders > 0 ? placeholders : 1;
        for (let i = 0; i < ids.length; i += entriesPerId) {
            const chunk = ids.slice(i, i + entriesPerId);
            const urlPath = buildDynamicUrlPath(pattern.pattern, chunk);
            routes.set(urlPath, {
                changefreq: "monthly",
                priority: "0.7",
            });
        }
    }
    for (const [path, meta] of routes) {
        const urlPath = path === "/" ? "" : path;
        entries.push({
            loc: `${domain}${urlPath}`,
            lastmod: opts.lastmod,
            changefreq: meta.changefreq,
            priority: meta.priority,
        });
    }
    return entries;
}
function extractDynamicIds(pattern) {
    if (pattern.idRegex && pattern.source) {
        const filePath = path.resolve(process.cwd(), pattern.source);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf-8");
            const ids = [];
            let match;
            while ((match = pattern.idRegex.exec(content)) !== null) {
                ids.push(match[1]);
            }
            return ids;
        }
    }
    return [];
}
function buildDynamicUrlPath(pattern, ids) {
    return pattern.replace(/[\[\{](\w+)[\]\}]/g, () => ids.shift() ?? ":id");
}
function normalizeRoute(route) {
    if (route === "" || route === "/")
        return "/";
    return route.startsWith("/") ? route : `/${route}`;
}
function escapeXML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
//# sourceMappingURL=sitemap-core.js.map