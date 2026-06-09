import fs from "node:fs";
import path from "node:path";
import { buildSitemapEntries, generateSitemapXML } from "../../core/sitemap-core.js";
import { generateCloudflareConfig } from "../../core/cloudflare-config.js";
export default function syntaraVite(options = {}) {
    const resolvedOptions = {
        sitemap: {
            domain: options.sitemap?.domain ?? "",
            dynamicRoutes: options.sitemap?.dynamicRoutes ?? [],
            compression: options.sitemap?.compression ?? false,
            outputPath: options.sitemap?.outputPath ?? "dist/sitemap.xml",
        },
        seo: {
            autoMeta: options.seo?.autoMeta ?? false,
            structuredData: options.seo?.structuredData ?? false,
            openGraph: options.seo?.openGraph ?? false,
            twitterCard: options.seo?.twitterCard ?? false,
            siteName: options.seo?.siteName ?? "",
            defaultImage: options.seo?.defaultImage ?? "",
            twitterHandle: options.seo?.twitterHandle ?? "",
        },
        cloudflare: {
            cacheHeaders: options.cloudflare?.cacheHeaders ?? false,
            securityHeaders: options.cloudflare?.securityHeaders ?? false,
            cspDirectives: options.cloudflare?.cspDirectives ?? {},
            redirects: options.cloudflare?.redirects ?? [],
            outputDir: options.cloudflare?.outputDir ?? "dist",
        },
    };
    return {
        name: "syntara-vite",
        enforce: "post",
        transformIndexHtml: {
            order: "post",
            handler(html) {
                if (resolvedOptions.seo.autoMeta) {
                    return injectSEOMeta(html, resolvedOptions.seo);
                }
                return html;
            },
        },
        writeBundle(_options, bundle) {
            if (resolvedOptions.sitemap.domain) {
                const htmlPages = Object.values(bundle)
                    .filter((b) => b.type === "asset" && b.fileName.endsWith(".html"))
                    .map((b) => {
                    const base = path.basename(b.fileName, ".html");
                    return base === "index" ? "/" : `/${base}`;
                });
                const dynamicPatterns = [];
                for (const dr of resolvedOptions.sitemap.dynamicRoutes) {
                    dynamicPatterns.push({
                        pattern: dr.pattern,
                        source: dr.source,
                        idRegex: dr.idRegex ? new RegExp(dr.idRegex, "g") : undefined,
                    });
                }
                const entries = buildSitemapEntries({
                    domain: resolvedOptions.sitemap.domain.replace(/\/$/, ""),
                    staticRoutes: htmlPages,
                    dynamicPatterns,
                    defaultChangefreq: "weekly",
                    defaultPriority: "0.8",
                    rootPriority: "1.0",
                    compression: resolvedOptions.sitemap.compression,
                });
                const xml = generateSitemapXML(entries);
                const outputPath = path.resolve(process.cwd(), resolvedOptions.sitemap.outputPath);
                fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                fs.writeFileSync(outputPath, xml);
            }
        },
        closeBundle() {
            const cf = resolvedOptions.cloudflare;
            if (cf.cacheHeaders || cf.securityHeaders || cf.redirects.length > 0 || cf.cspDirectives) {
                const outputDir = path.resolve(process.cwd(), cf.outputDir);
                const config = generateCloudflareConfig({
                    domain: resolvedOptions.sitemap.domain || "https://example.com",
                    cacheHeaders: cf.cacheHeaders,
                    securityHeaders: cf.securityHeaders,
                    cspDirectives: cf.cspDirectives,
                    redirects: cf.redirects,
                });
                fs.mkdirSync(outputDir, { recursive: true });
                if (config.headers) {
                    fs.writeFileSync(path.join(outputDir, "_headers"), config.headers);
                }
                if (config.redirects) {
                    fs.writeFileSync(path.join(outputDir, "_redirects"), config.redirects);
                }
                fs.writeFileSync(path.join(outputDir, "robots.txt"), config.robots);
            }
        },
    };
}
function injectSEOMeta(html, seo) {
    const metaTags = [];
    if (seo.openGraph && seo.siteName) {
        metaTags.push(`<meta property="og:site_name" content="${seo.siteName}">`);
    }
    if (seo.openGraph && seo.defaultImage) {
        metaTags.push(`<meta property="og:image" content="${seo.defaultImage}">`);
    }
    if (seo.twitterCard) {
        metaTags.push('<meta name="twitter:card" content="summary_large_image">');
    }
    if (seo.twitterCard && seo.twitterHandle) {
        metaTags.push(`<meta name="twitter:site" content="${seo.twitterHandle}">`);
    }
    if (metaTags.length > 0) {
        return html.replace("</head>", `${metaTags.join("\n")}\n</head>`);
    }
    return html;
}
//# sourceMappingURL=index.js.map