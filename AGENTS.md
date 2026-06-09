# AGENTS.md — Syntara CLI v2.1

CLI + integraciones para proyectos web SyntaraBiz: sitemaps, PWA icons, optimización de imágenes, SEO audit, Cloudflare Pages config, y MCP server.

## Distribución

Via GitHub — no npm publish.

```bash
npx --yes github:SyntaraBiz/syntara-cli <command> [options]
```

## Arquitectura

```
syntara-cli/
├── bin/syntara.js              # Entry point
├── src/
│   ├── cli.ts                  # CLI principal (Commander)
│   ├── commands/               # Comandos CLI
│   │   ├── sitemap.ts          # Generar sitemap.xml
│   │   ├── pwa.ts              # Generar iconos PWA
│   │   ├── images.ts           # Optimizar imágenes
│   │   └── seo.ts              # SEO audit + structured data + cloudflare
│   ├── core/                   # Lógica pura (framework-agnostic)
│   │   ├── sitemap-core.ts     # Motor de sitemap
│   │   ├── image-pipeline.ts   # Pipeline de imágenes (WebP/AVIF/srcset)
│   │   ├── seo-analyzer.ts     # SEO audit engine
│   │   ├── structured-data.ts  # JSON-LD generator
│   │   ├── cloudflare-config.ts # _headers / _redirects / robots.txt
│   │   └── utils.ts            # Utilidades (getPackageVersion, globalOptions)
│   ├── integrations/
│   │   ├── astro/              # Integración Astro (hooks lifecycle)
│   │   │   ├── index.ts        # Main integration
│   │   │   ├── sitemap.ts      # Sitemap hook
│   │   │   ├── cloudflare.ts   # Cloudflare hook
│   │   │   └── seo.ts          # SEO route hook
│   │   └── vite/               # Plugin Vite
│   │       ├── index.ts        # Main plugin
│   │       └── vite-types.ts   # Tipos Vite
│   └── mcp/
│       └── server.ts           # MCP server (stdio, JSON-RPC 2.0)
├── skills/                     # OpenCode skills
├── dist/                       # Compilado TypeScript (commiteado)
└── tests/                      # Tests vitest
```

## Comandos CLI

| Comando | Descripción |
|---|---|
| `sitemap -d URL -f FILE -r ROUTES -o OUT [-p PATTERN]` | Generar sitemap.xml |
| `pwa-icons -s SOURCE -o OUT` | Generar iconos PWA (192, 512) + link preview |
| `optimize-images -d DIR -q QUALITY [-c CODE_DIR]` | PNG/JPG → WebP |
| `seo-audit -d URL -o OUT` | Auditar SEO → JSON report |
| `generate-structured-data -t TYPE -o OUT -d DATA` | Generar JSON-LD |
| `cloudflare-init -d DOMAIN -o OUT` | Generar _headers + _redirects + robots.txt |
| `mcp-server` | Iniciar servidor MCP |

**Global options:** `--verbose`, `--dry-run`, `-V`

## Integraciones

### Astro
```typescript
import syntara from 'syntara/astro'
```

### Vite
```typescript
import syntara from 'syntara/vite'
```

### MCP
```json
{
  "mcpServers": {
    "syntara-seo": {
      "command": "npx",
      "args": ["--yes", "github:SyntaraBiz/syntara-cli", "mcp-server"]
    }
  }
}
```

## Tests

44 tests. Comandos:
```bash
pnpm test        # vitest run
pnpm test:watch  # vitest
```

## CI/CD

GitHub Actions: `.github/workflows/ci.yml` — build + test en cada push.

## Cómo contribuir

1. Lógica pura → `src/core/`
2. Comando CLI → `src/commands/`, registrar en `src/cli.ts`
3. Hook Astro → `src/integrations/astro/`, wire en `index.ts`
4. Hook Vite → `src/integrations/vite/`, wire en `index.ts`
5. `pnpm build && pnpm test`
6. Commit con `dist/` incluido

## Gotchas

1. `dist/` es commiteado (necesario para npx)
2. Usar `pnpm` (no npm/yarn)
3. TypeScript strict, ESM (`"type": "module"`)
4. `bin/syntara.js` importa `../dist/src/cli.js`
5. No publicar a npm
