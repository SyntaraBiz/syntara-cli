# PLAN.md — Syntara CLI v2.0

Plan maestro para la evolución de `syntara-cli`: integración nativa Astro + Vite, SEO toolkit,
optimización PageSpeed 100%, configuración Cloudflare Pages, MCP Server, y OpenCode Skills.

## Estructura final del proyecto

```
syntara-cli/
├── bin/
│   └── syntara.js                 # Entry point (Commander) — legacy compat
├── src/
│   ├── commands/                  # CLI commands (legacy + nuevos)
│   │   ├── sitemap.ts             # Refactored sitemap (usa sitemap-core)
│   │   ├── pwa.ts                 # Refactored PWA (usa image-pipeline)
│   │   ├── images.ts              # Refactored optimize (usa image-pipeline)
│   │   ├── seo-audit.ts           # syntara seo-audit
│   │   ├── pagespeed-audit.ts     # syntara pagespeed-audit
│   │   ├── cloudflare-init.ts     # syntara cloudflare-init
│   │   ├── cloudflare-headers.ts  # syntara cloudflare-headers
│   │   ├── cloudflare-redirects.ts# syntara cloudflare-redirects
│   │   ├── generate-structured-data.ts
│   │   ├── generate-robots.ts
│   │   ├── font-optimize.ts
│   │   ├── optimize-critical-css.ts
│   │   └── mcp-server.ts          # syntara mcp-server
│   ├── core/                      # Pure logic, framework-agnostic
│   │   ├── sitemap-core.ts        # Sitemap engine: static + dynamic + i18n + index
│   │   ├── image-pipeline.ts      # Image optimization pipeline (WebP/AVIF/srcset/blur)
│   │   ├── seo-analyzer.ts        # SEO audit engine
│   │   ├── pagespeed-optimizer.ts # Core Web Vitals optimization rules
│   │   ├── structured-data.ts     # JSON-LD generator (all schema types)
│   │   └── cloudflare-config.ts   # _headers / _redirects / wrangler generation
│   ├── integrations/              # Framework-specific integrations
│   │   ├── astro/
│   │   │   ├── index.ts           # Astro integration (hooks: astro:config:setup, build:done, etc.)
│   │   │   ├── sitemap.ts         # Sitemap generation from Astro routes + content collections
│   │   │   ├── images.ts          # Image optimization hooking astro:build:start
│   │   │   ├── seo.ts             # Auto-inject SEO meta, structured data, OG
│   │   │   └── cloudflare.ts      # Generate _headers + _redirects on astro:build:done
│   │   └── vite/
│   │       ├── index.ts           # Vite plugin (hooks: configResolved, transformIndexHtml, writeBundle)
│   │       ├── sitemap.ts         # Sitemap from Vite bundle
│   │       ├── images.ts          # Image transform pipeline
│   │       ├── seo.ts             # transformIndexHtml SEO injection
│   │       └── cloudflare.ts      # closeBundle CF config generation
│   └── mcp/                       # MCP Server implementation
│       ├── server.ts              # McpServer + StdioServerTransport
│       └── tools/                 # MCP tools registered on server
│           ├── audit-seo.ts
│           ├── audit-site.ts
│           ├── analyze-pagespeed.ts
│           ├── optimize-image.ts
│           ├── generate-structured-data.ts
│           ├── generate-sitemap.ts
│           └── generate-cloudflare-config.ts
├── skills/                        # OpenCode skills
│   ├── seo-audit.md               # Trigger: "auditar SEO", "revisar SEO"
│   ├── pagespeed-optimize.md      # Trigger: "optimizar PageSpeed", "100 PageSpeed"
│   └── cloudflare-deploy.md       # Trigger: "desplegar en Cloudflare"
├── tsconfig.json
├── package.json                   # With exports/subpaths for astro & vite
├── AGENTS.md
└── PLAN.md                        # This file
```

---

## Phase 1: Refactor — TypeScript + Core Modules

**Objective:** Migrate existing `.js` to `.ts`, extract reusable core logic, add vitest,
maintain full backward compatibility with current CLI commands.

### 1.1 Add TypeScript + vitest infrastructure
- Add `tsconfig.json` (target ESNext, module NodeNext, strict)
- Add `vitest` as devDependency
- Scripts: `build` (tsc), `dev` (tsc --watch), `test` (vitest)
- Keep `"type": "module"` for ESM compatibility

### 1.2 Extract `sitemap-core.ts`
- Pure function: `generateSitemap({ domain, staticRoutes, dynamicPatterns, lastmod, changefreq, priority, i18n })`
- `<xhtml:link>` for multi-language
- `sitemapIndex` autogeneration when >50k URLs
- Parametrizable dynamic pattern: `/blog/[slug]`, `/producto/[id]`, etc.

### 1.3 Extract `image-pipeline.ts`
- `convertToWebP(src, quality)` → buffer
- `convertToAVIF(src, quality)` → buffer
- `generatePwaIcons(src, sizes[])` → array of {size, buffer}
- `generateSrcSet(src, sizes[])` → array of {width, buffer}
- `generateBlurPlaceholder(src)` → base64 blurhash
- `updateCodeImports(dir)` — AST-based (babel) not regex

### 1.4 Refactor existing commands to use core modules
- `sitemap.ts` ← uses `sitemap-core`
- `pwa.ts` ← uses `image-pipeline`
- `images.ts` ← uses `image-pipeline`

### 1.5 Tests
- Unit tests for `sitemap-core.ts`
- Unit tests for `image-pipeline.ts`
- Run: `pnpm test`

---

## Phase 2: Astro Integration (`syntara/astro`)

**Objective:** Create an Astro integration using official hooks from Astro v5+ API.

### Hooks used

| Hook | Purpose |
|---|---|
| `astro:config:setup` | Read user config, inject Vite plugins if needed |
| `astro:routes:resolved` | Discover all routes (for sitemap) |
| `astro:build:start` | Pre-optimize images before build |
| `astro:build:done` | Generate sitemap, _headers, _redirects, robots.txt |
| `astro:route:setup` | Set per-route SEO metadata |

### Configuration shape

```typescript
interface SyntaraAstroOptions {
  sitemap: {
    domain: string
    dynamicRoutes?: { pattern: string; collection: string }[]
    compression?: boolean
    lastmodFromGit?: boolean
  }
  seo: {
    autoMeta?: boolean
    structuredData?: boolean
    openGraph?: boolean
    autoAlt?: 'off' | 'warn' | 'error'
    trailingSlash?: boolean
  }
  images: {
    format?: 'webp' | 'avif' | 'auto'
    quality?: number
    generateSrcSet?: boolean
    lazyLoad?: boolean
    blurPlaceholder?: boolean
    lcpPreload?: boolean
  }
  pagespeed: {
    criticalCSS?: 'inline' | 'off'
    fontOptimization?: boolean
    minifyHTML?: boolean
    preconnectOrigins?: string[]
  }
  cloudflare: {
    cacheHeaders?: boolean
    securityHeaders?: boolean
    cspDirectives?: Record<string, string[]>
  }
}
```

### Distribution
Users install via `npm install github:SyntaraBiz/syntara-cli` and import:
```typescript
import syntara from 'syntara/astro'
```

---

## Phase 3: Vite Plugin (`syntara/vite`)

**Objective:** Equivalent functionality as a Vite plugin for non-Astro Vite projects.

### Hooks used

| Hook | Purpose |
|---|---|
| `configResolved` | Store resolved config |
| `transformIndexHtml` | Inject SEO meta, OG, structured data, preloads |
| `writeBundle` | Generate sitemap after bundle written |
| `closeBundle` | Generate _headers, _redirects, robots.txt |

### Distribution
```typescript
import syntara from 'syntara/vite'
```

---

## Phase 4: SEO Toolkit

**Objective:** New CLI commands + core module for SEO audit and structured data.

### Commands

| Command | Description |
|---|---|
| `syntara seo-audit -d https://domain.com -o report.json` | Crawl site, check meta, headings, alt, links, structured data |
| `syntara generate-structured-data --type Organization --output src/data/sd.json` | Generate JSON-LD |
| `syntara generate-robots -d https://domain.com -o dist/robots.txt` | Generate robots.txt |

### Core: `seo-analyzer.ts`
- Check `<title>` unique & descriptive (50-60 chars)
- Check `<meta description>` (120-158 chars)
- Check `<h1>` unique per page
- Check heading hierarchy (no skips)
- Check `alt` on all `<img>`
- Check `rel="canonical"`
- Check `robots` meta
- Check OG + Twitter tags
- Validate JSON-LD
- Check for broken links (404)

### Core: `structured-data.ts`
- `Organization`, `LocalBusiness`, `WebSite` (with SearchAction)
- `BreadcrumbList`, `Article`, `BlogPosting`
- `Product`, `FAQPage`, `Review`, `Event`, `HowTo`, `Person`

---

## Phase 5: PageSpeed Optimizer

**Objective:** Automated rules + CLI commands to maximize all Core Web Vitals.

### Metric-target matrix

| Metric | Weight | Solution |
|---|---|---|
| LCP (25%) | Largest Contentful Paint | Preload LCP image, AVIF format, `fetchpriority="high"` |
| TBT (30%) | Total Blocking Time | Code splitting, defer non-critical JS, tree-shaking |
| CLS (25%) | Cumulative Layout Shift | Explicit width/height, `aspect-ratio`, font `size-adjust` |
| FCP (10%) | First Contentful Paint | Critical CSS inline, font preload, minimize render-blocking |
| SI (10%) | Speed Index | Minimize DOM, lazy-load below-fold |

### Core: `pagespeed-optimizer.ts`
- `extractCriticalCSS(html, css)` → inline above-fold CSS, defer rest
- `optimizeFontLoading(html)` → inject `font-display: swap` + `size-adjust` + preload
- `optimizeImages(html)` → `<picture>` AVIF+WebP, `srcset`, `loading="lazy"`, `fetchpriority`
- `optimizeScripts(html)` → defer/async/module, code-splitting hints
- `injectPreconnect(html, origins)` → dns-prefetch + preconnect

### Commands

| Command | Description |
|---|---|
| `syntara pagespeed-audit -u https://domain.com --strategy mobile` | PageSpeed Insights API call |
| `syntara optimize-critical-css -i dist/index.html -c dist/assets/*.css` | Extract + inline critical CSS |
| `syntara font-optimize -d src/styles` | Scan @font-face, add swap + size-adjust |
| `syntara image-optimize-advanced -d src/assets -q 85` | WebP + AVIF + srcset + blur placeholder |

---

## Phase 6: Cloudflare Pages Configuration

**Objective:** CLI commands + core module to generate optimal CF Pages config.

### Core: `cloudflare-config.ts`

Generates:

**`_headers`:**
```txt
/assets/*       Cache-Control: public, max-age=31536000, immutable
/images/*       Cache-Control: public, max-age=86400, stale-while-revalidate=604800
/fonts/*        Cache-Control: public, max-age=31536000, immutable
                Access-Control-Allow-Origin: *
/*.html         Cache-Control: public, max-age=0, must-revalidate
/*              X-Frame-Options: DENY
                X-Content-Type-Options: nosniff
                Referrer-Policy: strict-origin-when-cross-origin
                Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**`_redirects`:** Configurable 301/302 redirects.

**`robots.txt`:** Allow/Disallow + sitemap URL.

### Commands

| Command | Description |
|---|---|
| `syntara cloudflare-init -d https://domain.com -o dist` | Generate all CF config files |
| `syntara cloudflare-headers -o dist/_headers` | Generate _headers only |
| `syntara cloudflare-redirects -r "/old,/new,301" -o dist/_redirects` | Generate _redirects only |

---

## Phase 7: MCP Server (`syntara mcp-server`)

**Objective:** Expose all tools as an MCP server using `@modelcontextprotocol/sdk` v1.29+.

### Architecture
- STDIO transport (local process spawn)
- Uses `McpServer` from `@modelcontextprotocol/sdk`
- Registers tools: `audit_seo`, `audit_site`, `analyze_pagespeed`, `optimize_image`,
  `generate_structured_data`, `generate_sitemap`, `generate_cloudflare_config`

### Usage in OpenCode

```json
// opencode.json
{
  "mcpServers": {
    "syntara-seo": {
      "command": "npx",
      "args": ["--yes", "github:SyntaraBiz/syntara-cli", "mcp-server"]
    }
  }
}
```

### MCP Tools

| Tool | Schema |
|---|---|
| `audit_seo` | `{ url: string }` → report |
| `audit_site` | `{ domain: string }` → full report |
| `analyze_pagespeed` | `{ url: string, strategy: "mobile" \| "desktop" }` → Lighthouse scores |
| `optimize_image` | `{ input: string, format: "webp" \| "avif", sizes: number[] }` → optimized paths |
| `generate_structured_data` | `{ type: string, data: object }` → JSON-LD |
| `generate_sitemap` | `{ domain: string, staticRoutes: string[], dynamicPatterns: ... }` → sitemap path |
| `generate_cloudflare_config` | `{ domain: string, outputDir: string }` → config paths |

---

## Phase 8: OpenCode Skills

### `skills/seo-audit.md`
Trigger: "auditar SEO", "revisar SEO"

Workflow:
1. Run `syntara seo-audit -d [domain]`
2. Review report: prioritize meta tags → headings → alt text → structured data
3. Apply fixes per issue category
4. Re-run audit to verify

### `skills/pagespeed-optimize.md`
Trigger: "optimizar PageSpeed", "mejorar Lighthouse", "100 PageSpeed"

Workflow:
1. Run `syntara pagespeed-audit -u [url] --strategy mobile`
2. Identify bottlenecks by weight: TBT (30%) → LCP (25%) → CLS (25%) → FCP (10%) → SI (10%)
3. For each bottleneck, apply the corresponding `syntara optimize-*` command
4. Re-run audit to verify improvement

### `skills/cloudflare-deploy.md`
Trigger: "desplegar en Cloudflare", "preparar CF Pages"

Workflow:
1. Run `syntara cloudflare-init -d [domain] -o [outputDir]`
2. Verify `_headers` cache rules per asset type
3. Configure build command in Cloudflare dashboard: `pnpm build`
4. Set build output directory (e.g. `dist`)
5. Verify deployment: check `cf-cache-status: HIT` on static assets

---

## Distribution Strategy

All packages distributed via **GitHub** only (no npm publish):

| Package | Install command | Import path |
|---|---|---|
| CLI | `npx github:SyntaraBiz/syntara-cli` | — |
| Astro integration | `npm install github:SyntaraBiz/syntara-cli` | `syntara/astro` |
| Vite plugin | `npm install github:SyntaraBiz/syntara-cli` | `syntara/vite` |

The `package.json` exports field maps subpaths:
```json
{
  "exports": {
    ".": "./bin/syntara.js",
    "./astro": "./dist/integrations/astro/index.js",
    "./vite": "./dist/integrations/vite/index.js",
    "./core/*": "./dist/core/*.js"
  }
}
```

---

## Timeline

| Phase | Effort | Dependencies |
|---|---|---|
| 0 — AGENTS.md + PLAN.md | Low | — ✅ Done |
| 1 — Refactor + TypeScript | Medium | 0 |
| 2 — Astro Integration | High | 1 |
| 3 — Vite Plugin | High | 1 (parallel w/ 2) |
| 4 — SEO Toolkit | Medium | 1 |
| 5 — PageSpeed Optimizer | High | 1, 4 |
| 6 — Cloudflare Config | Medium | 1 |
| 7 — MCP Server | High | 4, 5, 6 |
| 8 — OpenCode Skills | Low | All |
| 9 — CHANGELOG v2.0 | Low | All |
