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
    alternates?: {
        hreflang: string;
        href: string;
    }[];
}
export declare function generateSitemapXML(entries: SitemapURLEntry[]): string;
export declare function buildSitemapEntries(options: SitemapOptions): SitemapURLEntry[];
//# sourceMappingURL=sitemap-core.d.ts.map