export interface SyntaraViteSitemapOptions {
    domain: string;
    dynamicRoutes?: {
        pattern: string;
        source?: string;
        idRegex?: string;
    }[];
    compression?: boolean;
    outputPath?: string;
}
export interface SyntaraViteSeoOptions {
    autoMeta?: boolean;
    structuredData?: boolean;
    openGraph?: boolean;
    twitterCard?: boolean;
    siteName?: string;
    defaultImage?: string;
    twitterHandle?: string;
}
export interface SyntaraViteCloudflareOptions {
    cacheHeaders?: boolean;
    securityHeaders?: boolean;
    cspDirectives?: Record<string, string[]>;
    redirects?: {
        from: string;
        to: string;
        status?: number;
    }[];
    outputDir?: string;
}
export interface SyntaraViteOptions {
    sitemap?: SyntaraViteSitemapOptions;
    seo?: SyntaraViteSeoOptions;
    cloudflare?: SyntaraViteCloudflareOptions;
}
//# sourceMappingURL=types.d.ts.map