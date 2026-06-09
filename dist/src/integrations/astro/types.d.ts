export interface SyntaraAstroSitemapOptions {
    domain: string;
    dynamicRoutes?: {
        pattern: string;
        collection: string;
    }[];
    compression?: boolean;
    lastmodFromGit?: boolean;
}
export interface SyntaraAstroSeoOptions {
    autoMeta?: boolean;
    structuredData?: boolean;
    openGraph?: boolean;
    twitterCard?: boolean;
    autoAlt?: "off" | "warn" | "error";
    trailingSlash?: boolean;
    siteName?: string;
    defaultImage?: string;
    twitterHandle?: string;
}
export interface SyntaraAstroImagesOptions {
    format?: "webp" | "avif" | "auto";
    quality?: number;
    generateSrcSet?: boolean;
    lazyLoad?: boolean;
    blurPlaceholder?: boolean;
    lcpPreload?: boolean;
}
export interface SyntaraAstroPagespeedOptions {
    criticalCSS?: "inline" | "off";
    fontOptimization?: boolean;
    minifyHTML?: boolean;
    preconnectOrigins?: string[];
}
export interface SyntaraAstroCloudflareOptions {
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
export interface SyntaraAstroOptions {
    sitemap?: SyntaraAstroSitemapOptions;
    seo?: SyntaraAstroSeoOptions;
    images?: SyntaraAstroImagesOptions;
    pagespeed?: SyntaraAstroPagespeedOptions;
    cloudflare?: SyntaraAstroCloudflareOptions;
}
//# sourceMappingURL=types.d.ts.map