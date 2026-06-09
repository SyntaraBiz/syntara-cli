import fs from "node:fs";
import path from "node:path";
import type { VitePlugin } from "./vite-types.js";
import type { SyntaraViteOptions } from "./types.js";
import { buildSitemapEntries, generateSitemapXML, type SitemapDynamicPattern } from "../../core/sitemap-core.js";

export default function syntaraVite(options: SyntaraViteOptions = {}): VitePlugin {
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

    configResolved(_config: Record<string, unknown>) {
      // No-op for now
    },

    transformIndexHtml: {
      order: "post",
      handler(html: string) {
        if (resolvedOptions.seo.autoMeta) {
          return injectSEOMeta(html, resolvedOptions.seo);
        }
        return html;
      },
    },

    writeBundle(
      _options: Record<string, unknown>,
      bundle: Record<string, { fileName: string; type: string }>,
    ) {
      if (resolvedOptions.sitemap.domain) {
        const htmlPages = Object.values(bundle)
          .filter((b) => b.type === "asset" && b.fileName.endsWith(".html"))
          .map((b) => {
            const base = path.basename(b.fileName, ".html");
            return base === "index" ? "/" : `/${base}`;
          });

        const dynamicPatterns: SitemapDynamicPattern[] = [];
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
        const outputPath = path.resolve(
          process.cwd(),
          resolvedOptions.sitemap.outputPath,
        );
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, xml);
      }
    },

    closeBundle() {
      if (resolvedOptions.cloudflare.cacheHeaders) {
        generateCloudflareConfig(resolvedOptions.cloudflare);
      }
    },
  };
}

function injectSEOMeta(
  html: string,
  seo: { siteName: string; openGraph: boolean; defaultImage: string; twitterCard: boolean; twitterHandle: string },
): string {
  const metaTags: string[] = [];

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
    metaTags.push(
      `<meta name="twitter:site" content="${seo.twitterHandle}">`,
    );
  }

  if (metaTags.length > 0) {
    return html.replace("</head>", `${metaTags.join("\n")}\n</head>`);
  }

  return html;
}

function generateCloudflareConfig(
  options: { cacheHeaders: boolean; securityHeaders: boolean; cspDirectives: Record<string, string[]>; redirects: { from: string; to: string; status?: number }[]; outputDir: string },
): void {
  const outputDir = path.resolve(process.cwd(), options.outputDir);

  let headers = "";

  if (options.cacheHeaders) {
    headers += `# Assets inmutables (hasheados)
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Fonts
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# HTML
/*.html
  Cache-Control: public, max-age=0, must-revalidate

`;
  }

  if (options.securityHeaders) {
    headers += `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

`;
  }

  if (headers) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "_headers"), headers);
  }

  if (options.redirects.length > 0) {
    const redirects = options.redirects
      .map((r) => `${r.from} ${r.to} ${r.status ?? 301}`)
      .join("\n");
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "_redirects"), redirects);
  }

  const robots = "User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n";
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "robots.txt"), robots);
}
