# Syntara CLI v2

Herramienta de línea de comandos para automatizar tareas SEO, optimización de imágenes, generación de sitemaps, configuración de Cloudflare Pages y más. Diseñada para proyectos web modernos (Astro, Vite, React, Next.js, etc.).

## Instalación

### Opción A: CLI directo (sin instalar)

```bash
npx --yes github:SyntaraBiz/syntara-cli <comando> [opciones]
```

### Opción B: Instalar como dependencia

```bash
npm install github:SyntaraBiz/syntara-cli
# o
pnpm add github:SyntaraBiz/syntara-cli
```

## Comandos CLI

### Global Options

- `-v, --verbose` — Activar logging detallado
- `--dry-run` — Mostrar qué haría sin ejecutar
- `-V, --version` — Mostrar versión

### `sitemap` — Generar sitemap.xml

```bash
npx github:SyntaraBiz/syntara-cli sitemap \
  -d https://midominio.com \
  -f src/lib/products.ts \
  -r "contacto,nosotros" \
  -o public/sitemap.xml \
  -p /producto/{id}
```

**Opciones:**
- `-d, --domain` — Dominio base (requerido)
- `-f, --file` — Archivo para extraer IDs dinámicos
- `-r, --routes` — Rutas estáticas separadas por coma
- `-o, --out` — Ruta de salida (default: `public/sitemap.xml`)
- `-p, --pattern` — Patrón de ruta dinámica (default: `/producto/{id}`)

### `pwa-icons` — Generar iconos PWA

```bash
npx github:SyntaraBiz/syntara-cli pwa-icons \
  -s public/logo.png \
  -o public/icons
```

**Opciones:**
- `-s, --source` — Imagen de origen (requerido)
- `-o, --out` — Carpeta de salida (default: `public`)

Genera: `pwa-192x192.png`, `pwa-512x512.png`, `link_preview.png` (1200x630)

### `optimize-images` — Optimizar imágenes

```bash
npx github:SyntaraBiz/syntara-cli optimize-images \
  -d src/assets \
  -q 85 \
  -c src
```

**Opciones:**
- `-d, --dir` — Directorio a escanear (requerido)
- `-q, --quality` — Calidad 1-100 (default: 80)
- `-c, --code-dir` — Directorio de código para actualizar imports

Convierte PNG/JPG a WebP, elimina originales, actualiza imports en código.

### `seo-audit` — Auditar SEO

```bash
npx github:SyntaraBiz/syntara-cli seo-audit \
  -d https://midominio.com \
  -o report.json
```

**Opciones:**
- `-d, --domain` — URL o archivo HTML a auditar (requerido)
- `-o, --out` — Archivo de salida para reporte JSON

**Audita:**
- `<title>` tag (presencia, longitud 30-60)
- `<meta name="description">` (presencia, longitud 120-158)
- `<h1>` tag (presencia, unicidad)
- Heading hierarchy (h1→h2→h3 sin saltos)
- `alt` text en imágenes
- Canonical URL
- Viewport meta tag
- `lang` attribute en `<html>`
- Open Graph tags
- Twitter Card tags
- JSON-LD structured data

**Score:** 0-100. Penaliza errores (-15), warnings (-5), infos (-2).

### `generate-structured-data` — Generar JSON-LD

```bash
npx github:SyntaraBiz/syntara-cli generate-structured-data \
  -t Organization \
  -o src/data/organization.json \
  -d '{"name":"Syntara","url":"https://syntara.com"}'
```

**Tipos soportados:** Organization, BreadcrumbList, WebSite, FAQPage, Product, Article

### `cloudflare-init` — Configurar Cloudflare Pages

```bash
npx github:SyntaraBiz/syntara-cli cloudflare-init \
  -d https://midominio.com \
  -o dist \
  -r '[{"from":"/old","to":"/new","status":301}]'
```

**Opciones:**
- `-d, --domain` — Dominio (requerido)
- `-o, --out` — Directorio de salida (default: `dist`)
- `--no-cache` — Deshabilitar cache headers
- `--no-security` — Deshabilitar security headers
- `-r, --redirects` — Redirects en JSON

Genera: `_headers`, `_redirects`, `robots.txt`

### `mcp-server` — Servidor MCP

```bash
npx github:SyntaraBiz/syntara-cli mcp-server
```

Expone 4 tools vía MCP (Model Context Protocol):
- `audit_seo` — Auditar SEO de URL
- `generate_structured_data` — Generar JSON-LD
- `generate_sitemap` — Generar sitemap
- `generate_cloudflare_config` — Generar config Cloudflare

## Integraciones Framework

### Astro

```typescript
// astro.config.mjs
import syntara from 'syntara/astro'

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
        autoAlt: "warn",
      },
      cloudflare: {
        cacheHeaders: true,
        securityHeaders: true,
      },
    }),
  ],
})
```

**Hooks:**
- `astro:build:done` → Genera sitemap + config Cloudflare
- `astro:route:setup` → Verifica alt text en imágenes

### Vite

```typescript
// vite.config.ts
import syntara from 'syntara/vite'

export default defineConfig({
  plugins: [
    syntara({
      sitemap: {
        domain: "https://midominio.com",
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

**Hooks:**
- `transformIndexHtml` → Inyecta meta tags SEO
- `writeBundle` → Genera sitemap desde bundle
- `closeBundle` → Genera config Cloudflare

## Arquitectura

```
syntara-cli/
├── bin/syntara.js          # Entry point
├── src/
│   ├── cli.ts              # CLI principal (Commander)
│   ├── commands/           # Comandos CLI
│   ├── core/               # Lógica pura (framework-agnostic)
│   ├── integrations/       # Astro + Vite
│   └── mcp/                # Servidor MCP
├── skills/                 # OpenCode skills
└── dist/                   # Compilado TypeScript
```

## Desarrollo

```bash
pnpm install
pnpm build    # tsc
pnpm test     # vitest
pnpm dev      # tsc --watch
```

## Tests

44 tests cubriendo:
- `sitemap-core` — Generación de sitemap
- `image-pipeline` — Optimización de imágenes
- `seo-analyzer` — Auditoría SEO
- `structured-data` — Generación JSON-LD
- `cloudflare-config` — Configuración Cloudflare

## CI/CD

GitHub Actions ejecuta `build` + `test` en cada push.

## Licencia

ISC — SyntaraBiz
