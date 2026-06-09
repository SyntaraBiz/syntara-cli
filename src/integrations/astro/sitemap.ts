import fs from "node:fs";
import path from "node:path";
import { buildSitemapEntries, generateSitemapXML, type SitemapDynamicPattern } from "../../core/sitemap-core.js";
import type { SyntaraAstroSitemapOptions } from "./types.js";
import type { AstroBuildDoneParams } from "./astro-types.js";

export async function createSitemapHook(
  hookParams: AstroBuildDoneParams,
  options: SyntaraAstroSitemapOptions,
): Promise<void> {
  const { pages, dir } = hookParams;

  const staticRoutes = pages.map((p) => p.pathname).filter(Boolean);
  if (!staticRoutes.includes("/")) {
    staticRoutes.unshift("/");
  }

  const dynamicPatterns: SitemapDynamicPattern[] = [];
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
