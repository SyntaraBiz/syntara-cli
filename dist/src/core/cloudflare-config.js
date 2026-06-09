export function generateCloudflareConfig(options) {
    let headers = "";
    if (options.cacheHeaders !== false) {
        headers += `# Assets immutables (hashed by build tool)
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Images (cached 24h, revalidated up to 7d)
/images/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800

# Fonts (long cache + CORS)
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

# HTML (never cache, always revalidate)
/*.html
  Cache-Control: public, max-age=0, must-revalidate

# CSS/JS versioned
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

`;
    }
    if (options.securityHeaders !== false) {
        headers += `# Global security headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()

`;
    }
    if (options.cspDirectives) {
        let csp = "/*\n  Content-Security-Policy:";
        for (const [key, values] of Object.entries(options.cspDirectives)) {
            csp += ` ${key} ${values.join(" ")};`;
        }
        csp += "\n\n";
        headers += csp;
    }
    if (options.noIndexPreview) {
        headers += `# Prevent search indexing on preview URLs
https://:project.pages.dev/*
  X-Robots-Tag: noindex

`;
    }
    let redirects = "";
    if (options.redirects && options.redirects.length > 0) {
        redirects = options.redirects
            .map((r) => `${r.from} ${r.to} ${r.status ?? 301}`)
            .join("\n") + "\n";
    }
    const sitemapUrl = options.sitemapUrl ?? `${options.domain}/sitemap.xml`;
    const robots = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
    return { headers, redirects, robots };
}
//# sourceMappingURL=cloudflare-config.js.map