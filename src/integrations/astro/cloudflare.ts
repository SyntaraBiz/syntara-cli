import fs from "node:fs";
import path from "node:path";
import type { SyntaraAstroCloudflareOptions } from "./types.js";
import type { AstroBuildDoneParams } from "./astro-types.js";

export async function createCloudflareHook(
  hookParams: AstroBuildDoneParams,
  options: SyntaraAstroCloudflareOptions,
): Promise<void> {
  const { dir } = hookParams;
  const outputDir = options.outputDir
    ? path.resolve(process.cwd(), options.outputDir)
    : path.resolve(dir.pathname);

  let headers = "";

  if (options.cacheHeaders) {
    headers += generateCacheHeaders();
  }

  if (options.securityHeaders) {
    headers += generateSecurityHeaders();
  }

  if (options.cspDirectives && Object.keys(options.cspDirectives).length > 0) {
    headers += generateCSPHeaders(options.cspDirectives);
  }

  let redirects = "";
  if (options.redirects && options.redirects.length > 0) {
    redirects = generateRedirects(options.redirects);
  }

  if (headers) {
    fs.writeFileSync(path.join(outputDir, "_headers"), headers);
  }

  if (redirects) {
    fs.writeFileSync(path.join(outputDir, "_redirects"), redirects);
  }

  generateRobotsTxt(outputDir);
}

function generateCacheHeaders(): string {
  return `# Assets inmutables (hasheados)
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Imagenes
/images/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800

# Fuentes
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

# HTML
/*.html
  Cache-Control: public, max-age=0, must-revalidate

`;
}

function generateSecurityHeaders(): string {
  return `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Permissions-Policy: camera=(), microphone=(), geolocation=()

`;
}

function generateCSPHeaders(directives: Record<string, string[]>): string {
  let csp = "/*\n  Content-Security-Policy:";
  for (const [key, values] of Object.entries(directives)) {
    csp += ` ${key} ${values.join(" ")};`;
  }
  csp += "\n\n";
  return csp;
}

function generateRedirects(
  redirects: { from: string; to: string; status?: number }[],
): string {
  return (
    redirects.map((r) => `${r.from} ${r.to} ${r.status ?? 301}`).join("\n") +
    "\n"
  );
}

function generateRobotsTxt(outputDir: string): void {
  const content = "User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n";
  fs.writeFileSync(path.join(outputDir, "robots.txt"), content);
}
