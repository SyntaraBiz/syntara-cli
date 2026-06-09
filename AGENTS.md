# AGENTS.md — Syntara CLI v2

CLI + integrations for SyntaraBiz web projects: sitemaps, PWA icons, image optimization,
SEO audit, PageSpeed analysis, Cloudflare Pages config, and MCP server.
Distributed via GitHub — not published to npm.

---

## For Users: How to use in your project

### Option A: CLI (any project — Astro, Vite, Next.js, etc.)

```bash
npx --yes github:SyntaraBiz/syntara-cli <command> [options]
```

No installation needed. Works in any Node.js project. `--yes` skips the install prompt.

**Example — generate sitemap after build (Astro project `package.json`):**

```jsonc
{
  "scripts": {
    "build": "astro build && npx --yes github:SyntaraBiz/syntara-cli sitemap -d https://mimartesanias.com -f src/lib/products.ts -r /,catalogo,nosotros -o dist/sitemap.xml",
    "generate-pwa": "npx --yes github:SyntaraBiz/syntara-cli pwa-icons -s public/logo.png -o public",
    "optimize-images": "npx --yes github:SyntaraBiz/syntara-cli optimize-images -d src/assets -q 85"
  }
}
```

### Option B: Astro integration (declarative, hooks into Astro lifecycle)

**Install:**
```bash
npm install github:SyntaraBiz/syntara-cli
```

**Usage (`astro.config.mjs`):**
```typescript
import { defineConfig } from "astro/config"
import syntara from "syntara/astro"

export default defineConfig({
  integrations: [
    syntara({
      sitemap: {
        domain: "https://midominio.com",
        dynamicRoutes: [
          { pattern: "/producto/[id]", collection: "products" },
        ],
      },
      seo: {
        autoMeta: true,
        structuredData: true,
        openGraph: true,
      },
      cloudflare: {
        cacheHeaders: true,
        securityHeaders: true,
      },
    }),
  ],
})
```

**What happens on `astro build`:**
- **`astro:build:done`** → Generates `dist/sitemap.xml` automatically from all built pages
- **`astro:build:done`** → Generates `dist/_headers`, `dist/_redirects`, `dist/robots.txt` for Cloudflare
- **`astro:route:setup`** → Warns on missing alt text, enforces trailing slash consistency

**No manual scripts needed.** Everything happens during `astro build`.

### Option C: Vite plugin (declarative, hooks into Vite lifecycle)

**Install:**
```bash
npm install github:SyntaraBiz/syntara-cli
```

**Usage (`vite.config.ts`):**
```typescript
import { defineConfig } from "vite"
import syntara from "syntara/vite"

export default defineConfig({
  plugins: [
    syntara({
      sitemap: {
        domain: "https://ejemplo.com",
        outputPath: "dist/sitemap.xml",
      },
      seo: {
        autoMeta: true,
        openGraph: true,
        siteName: "Mi Proyecto",
      },
      cloudflare: {
        cacheHeaders: true,
        outputDir: "dist",
      },
    }),
  ],
})
```

**What happens on `vite build`:**
- **`writeBundle`** → Generates `dist/sitemap.xml` from built HTML pages
- **`transformIndexHtml`** → Injects OG + Twitter Card meta tags
- **`closeBundle`** → Generates `dist/_headers`, `dist/_redirects`, `dist/robots.txt`

### Option D: MCP Server (for OpenCode / AI agents)

```jsonc
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

Exposes 4 tools: `audit_seo`, `generate_structured_data`, `generate_sitemap`, `generate_cloudflare_config`.

---

## CLI Commands Reference

### Legacy (refactored, backward compatible)
| Command | Description |
|---|---|
| `sitemap -d URL -f FILE -r ROUTES -o OUT [-p PATTERN]` | Generate sitemap.xml |
| `pwa-icons -s SOURCE -o OUT` | Generate PWA icons (192, 512) + link preview (1200x630) |
| `optimize-images -d DIR -q QUALITY [-c CODE_DIR]` | PNG/JPG → WebP, deletes originals, patches imports |

### New (v2)
| Command | Description |
|---|---|
| `seo-audit -d URL -o OUT` | SEO audit of a page/site → JSON report |
| `generate-structured-data -t TYPE -o OUT -d DATA` | Generate JSON-LD (Organization, Product, FAQ, etc.) |
| `cloudflare-init -d DOMAIN -o OUT [--no-cache] [--no-security]` | Generate _headers + _redirects + robots.txt |
| `mcp-server` | Start MCP server (STDIO, JSON-RPC 2.0) |

---

## For Developers: How to contribute

### Dev commands
```bash
pnpm install                           # pnpm only — no npm/yarn lockfile
pnpm build                             # tsc → dist/
pnpm test                              # vitest run
pnpm test:watch                        # vitest (watch mode)
node bin/syntara.js <command> [opts]   # Run CLI locally (requires pnpm build first)
```

### Architecture
```
bin/syntara.js               Shim → dist/src/cli.js
src/
├── cli.ts                    Main CLI (Commander) — registers all commands
├── commands/                 CLI command modules
│   ├── sitemap.ts, pwa.ts, images.ts   # Legacy refactored
│   └── seo.ts                          # seo-audit, structured-data, cloudflare-init
├── core/                     Pure logic (framework-agnostic)
│   ├── sitemap-core.ts       Sitemap engine
│   ├── image-pipeline.ts     Image pipeline (WebP/AVIF/srcset)
│   ├── seo-analyzer.ts       HTML SEO audit engine
│   ├── structured-data.ts    JSON-LD generator (10+ schema types)
│   └── cloudflare-config.ts  _headers / _redirects / robots.txt
├── integrations/
│   ├── astro/                Astro integration (hooks: build:done, route:setup)
│   └── vite/                 Vite plugin (hooks: transformIndexHtml, writeBundle, closeBundle)
└── mcp/server.ts             MCP server (stdio, JSON-RPC 2.0) — 4 tools
skills/                       OpenCode skill workflows
```

- **TypeScript** (strict). `tsc` compiles to `dist/`. Entry: `bin/syntara.js` → `dist/src/cli.js`.
- **vitest** for tests. Files: `src/core/*.test.ts`.
- Dependencies: `commander`, `sharp`, `zod`.
- Dev deps: `typescript`, `vitest`, `@types/node`, `vite`.

### Gotchas
1. **Build required before running CLI.** `pnpm build` (tsc) must complete. `dist/` is committed for npx consumers.
2. `sitemap-core.ts` supports parametrizable dynamic patterns via `--pattern`.
3. `image-pipeline.ts` `updateCodeImports` uses regex replacement — verify diff before committing.
4. `image-pipeline.ts` skips files with `link_preview` in name.
5. The MCP server is self-contained (no `@modelcontextprotocol/sdk` needed).
6. Astro integration types are defined locally (`astro-types.ts`) — no `astro` dependency needed for compilation.

### How to add a feature
1. Pure logic → `src/core/my-feature.ts`
2. CLI command → `src/commands/my-command.ts`, register in `src/cli.ts`
3. Astro hook → `src/integrations/astro/my-hook.ts`, wire in `index.ts`
4. Vite hook → `src/integrations/vite/my-hook.ts`, wire in `index.ts`
5. Run `pnpm build && pnpm test`
6. Test CLI: `node bin/syntara.js <command> --help`
