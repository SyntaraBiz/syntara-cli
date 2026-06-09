import { createSitemapHook } from "./sitemap.js";
import { createSeoHook } from "./seo.js";
import { createCloudflareHook } from "./cloudflare.js";
export default function syntara(options = {}) {
    const resolvedOptions = {
        sitemap: {
            domain: options.sitemap?.domain ?? "",
            dynamicRoutes: options.sitemap?.dynamicRoutes ?? [],
            compression: options.sitemap?.compression ?? false,
            lastmodFromGit: options.sitemap?.lastmodFromGit ?? false,
        },
        seo: {
            autoMeta: options.seo?.autoMeta ?? true,
            structuredData: options.seo?.structuredData ?? true,
            openGraph: options.seo?.openGraph ?? true,
            twitterCard: options.seo?.twitterCard ?? true,
            autoAlt: options.seo?.autoAlt ?? "warn",
            trailingSlash: options.seo?.trailingSlash ?? true,
            siteName: options.seo?.siteName ?? "",
            defaultImage: options.seo?.defaultImage ?? "",
            twitterHandle: options.seo?.twitterHandle ?? "",
        },
        pagespeed: {
            criticalCSS: options.pagespeed?.criticalCSS ?? "off",
            fontOptimization: options.pagespeed?.fontOptimization ?? true,
            minifyHTML: options.pagespeed?.minifyHTML ?? false,
            preconnectOrigins: options.pagespeed?.preconnectOrigins ?? [],
        },
        cloudflare: {
            cacheHeaders: options.cloudflare?.cacheHeaders ?? true,
            securityHeaders: options.cloudflare?.securityHeaders ?? true,
            cspDirectives: options.cloudflare?.cspDirectives ?? {},
            redirects: options.cloudflare?.redirects ?? [],
            outputDir: options.cloudflare?.outputDir ?? "",
        },
    };
    return {
        name: "@syntara/astro",
        hooks: {
            "astro:build:done": async (hookOptions) => {
                const { pages, dir, logger } = hookOptions;
                if (resolvedOptions.sitemap.domain) {
                    try {
                        await createSitemapHook(hookOptions, resolvedOptions.sitemap);
                        logger.info("@syntara/astro: Sitemap generated");
                    }
                    catch (err) {
                        logger.warn(`@syntara/astro: Failed to generate sitemap - ${err}`);
                    }
                }
                if (resolvedOptions.cloudflare.cacheHeaders) {
                    try {
                        await createCloudflareHook(hookOptions, resolvedOptions.cloudflare);
                        logger.info("@syntara/astro: Cloudflare config generated");
                    }
                    catch (err) {
                        logger.warn(`@syntara/astro: Failed to generate Cloudflare config - ${err}`);
                    }
                }
                logger.info(`@syntara/astro: Build completed with ${pages.length} pages`);
            },
            ...(resolvedOptions.seo.autoMeta
                ? {
                    "astro:route:setup": async (routeOptions) => {
                        await createSeoHook(routeOptions, resolvedOptions.seo);
                    },
                }
                : {}),
        },
    };
}
//# sourceMappingURL=index.js.map