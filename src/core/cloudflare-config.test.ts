import { describe, it, expect } from "vitest";
import { generateCloudflareConfig } from "./cloudflare-config.js";

describe("cloudflare-config", () => {
  it("generates all config files by default", () => {
    const config = generateCloudflareConfig({
      domain: "https://example.com",
    });

    expect(config.headers).toContain("Cache-Control");
    expect(config.headers).toContain("X-Frame-Options");
    expect(config.redirects).toBe("");
    expect(config.robots).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("includes cache headers", () => {
    const config = generateCloudflareConfig({
      domain: "https://example.com",
      cacheHeaders: true,
    });

    expect(config.headers).toContain("/assets/*");
    expect(config.headers).toContain("max-age=31536000");
    expect(config.headers).toContain("/images/*");
    expect(config.headers).toContain("stale-while-revalidate");
  });

  it("includes security headers", () => {
    const config = generateCloudflareConfig({
      domain: "https://example.com",
      securityHeaders: true,
    });

    expect(config.headers).toContain("X-Frame-Options: DENY");
    expect(config.headers).toContain("X-Content-Type-Options: nosniff");
    expect(config.headers).toContain("Strict-Transport-Security");
  });

  it("skips headers when disabled", () => {
    const config = generateCloudflareConfig({
      domain: "https://example.com",
      cacheHeaders: false,
      securityHeaders: false,
    });

    expect(config.headers).toBe("");
  });

  it("generates redirects", () => {
    const config = generateCloudflareConfig({
      domain: "https://example.com",
      redirects: [
        { from: "/old", to: "/new", status: 301 },
      ],
    });

    expect(config.redirects).toContain("/old /new 301");
  });

  it("generates robots.txt with custom sitemap URL", () => {
    const config = generateCloudflareConfig({
      domain: "https://example.com",
      sitemapUrl: "https://example.com/custom-sitemap.xml",
    });

    expect(config.robots).toContain("https://example.com/custom-sitemap.xml");
  });

  it("includes CSP directives when provided", () => {
    const config = generateCloudflareConfig({
      domain: "https://example.com",
      cspDirectives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
      },
    });

    expect(config.headers).toContain("Content-Security-Policy");
    expect(config.headers).toContain("default-src 'self'");
  });

  it("includes noindex preview when enabled", () => {
    const config = generateCloudflareConfig({
      domain: "https://example.com",
      noIndexPreview: true,
    });

    expect(config.headers).toContain("X-Robots-Tag: noindex");
    expect(config.headers).toContain("*.pages.dev/*");
  });
});
