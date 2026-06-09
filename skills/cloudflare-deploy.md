# Skill: Cloudflare Deploy

## Description
Prepara un proyecto para desplegar en Cloudflare Pages con configuracion optima
de cache, seguridad y SEO.

## Trigger
"desplegar en Cloudflare", "preparar Cloudflare Pages", "CF Pages", "Cloudflare deploy"

## Workflow

### 1. Generar configuracion de Cloudflare
```bash
syntara cloudflare-init -d https://dominio.com -o dist
```

Esto genera en `dist/`:
- `_headers` — Cache + headers de seguridad
- `_redirects` — Redirects (si se especificaron)
- `robots.txt` — Allow all + ruta al sitemap

### 2. Verificar los archivos generados

```bash
# Revisar _headers
cat dist/_headers

# Debe incluir:
# - Cache-Control para assets inmutables (max-age=31536000, immutable)
# - Cache-Control para HTML (max-age=0, must-revalidate)
# - Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
# - CST preload (Strict-Transport-Security)
```

### 3. Configurar Cloudflare Pages Dashboard

1. **Framework preset**: Astro, Vite, o None (según el proyecto)
2. **Build command**: `pnpm build`
3. **Build output directory**: `dist`
4. **Node.js version**: `20.x` o `22.x`
5. **Environment variables** (si aplica):
   - `NODE_VERSION`: `22`

### 4. Configuracion de build (si usas wrangler)

```toml
# wrangler.toml
name = "mi-proyecto"
compatibility_date = "2025-06-08"
pages_build_output_dir = "dist"
```

### 5. Verificar despues del deploy

```bash
# Verificar cache HIT
curl -I https://dominio.com/assets/main.js | grep cf-cache-status
# Debe mostrar: cf-cache-status: HIT

# Verificar security headers
curl -I https://dominio.com | grep -E "(x-frame-options|x-content-type|strict-transport)"

# Verificar sitemap
curl https://dominio.com/sitemap.xml

# Verificar robots.txt
curl https://dominio.com/robots.txt
```

### 6. Consideraciones para Astro en Cloudflare

- Usar `@astrojs/cloudflare` adapter
- Configurar `output: 'static'` para SSG, `'hybrid'` o `'server'` para SSR con Functions
- El directorio de output es `dist/`
- Las Functions van en `functions/` o `src/pages/api/`

### 7. Consideraciones para Vite en Cloudflare

- Output directory: `dist`
- Si usas SPA: añadir `/* /index.html 200` en `_redirects`
- Si usas SSR: necesitas Pages Functions o Workers
