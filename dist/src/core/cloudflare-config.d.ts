export interface CloudflareConfig {
    headers: string;
    redirects: string;
    robots: string;
}
export interface CloudflareOptions {
    domain: string;
    cacheHeaders?: boolean;
    securityHeaders?: boolean;
    cspDirectives?: Record<string, string[]>;
    redirects?: {
        from: string;
        to: string;
        status?: number;
    }[];
    sitemapUrl?: string;
    noIndexPreview?: boolean;
    ogImageDimensions?: {
        width: number;
        height: number;
    };
}
export declare function generateCloudflareConfig(options: CloudflareOptions): CloudflareConfig;
//# sourceMappingURL=cloudflare-config.d.ts.map