import fs from "node:fs";
import path from "node:path";
import { buildSitemapEntries, generateSitemapXML } from "../../core/sitemap-core.js";
export async function createSitemapHook(hookParams, options) {
    const { pages, dir } = hookParams;
    const staticRoutes = pages.map((p) => p.pathname).filter(Boolean);
    if (!staticRoutes.includes("/")) {
        staticRoutes.unshift("/");
    }
    const dynamicPatterns = [];
    if (options.dynamicRoutes) {
        for (const dr of options.dynamicRoutes) {
            dynamicPatterns.push({
                pattern: dr.pattern,
                collection: dr.collection,
            });
        }
    }
    const entries = buildSitemapEntries({
        domain: options.domain.replace(/\/$/, ""),
        staticRoutes,
        dynamicPatterns,
        defaultChangefreq: "weekly",
        defaultPriority: "0.8",
        rootPriority: "1.0",
        compression: options.compression ?? false,
    });
    const xml = generateSitemapXML(entries);
    const outputDir = path.resolve(dir.pathname);
    const outputPath = path.join(outputDir, "sitemap.xml");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, xml);
    if (options.compression) {
        const zlib = await import("node:zlib");
        const compressed = zlib.gzipSync(xml);
        fs.writeFileSync(outputPath + ".gz", compressed);
    }
}
//# sourceMappingURL=sitemap.js.map