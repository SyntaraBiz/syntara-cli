# Skill: Cloudflare Deploy

Trigger: "desplegar en Cloudflare", "preparar CF Pages", "Cloudflare config", "deploy CF"

## Workflow

1. **Generar configuración**:
   ```bash
   npx --yes github:SyntaraBiz/syntara-cli cloudflare-init -d https://example.com -o dist
   ```

2. **Verificar archivos generados**:
   - `dist/_headers` — Cache + security headers
   - `dist/_redirects` — 301/302 redirects
   - `dist/robots.txt` — Allow + sitemap

3. **Revisar headers por asset type**:
   - `/assets/*` → max-age=31536000, immutable
   - `/images/*` → max-age=86400, stale-while-revalidate
   - `/fonts/*` → max-age=31536000, immutable
   - `/*.html` → max-age=0, must-revalidate
   - `/*` → Security headers (X-Frame-Options, HSTS, etc.)

4. **Configurar en Cloudflare Dashboard**:
   - Build command: `pnpm build && pnpm build` (o el build command del proyecto)
   - Build output directory: `dist`
   - Node version: 22

5. **Verificar despliegue**:
   - `curl -I https://example.com/assets/main.js` → `cf-cache-status: HIT`
   - `curl -I https://example.com` → `strict-transport-security` presente
   - `curl https://example.com/robots.txt` → Sitemap URL correcta

## Comandos útiles

```bash
# Generar config completa
npx --yes github:SyntaraBiz/syntara-cli cloudflare-init -d https://example.com -o dist

# Con redirects personalizados
npx --yes github:SyntaraBiz/syntara-cli cloudflare-init -d https://example.com -o dist -r '[{"from":"/old","to":"/new","status":301}]'

# Sin cache headers (solo security)
npx --yes github:SyntaraBiz/syntara-cli cloudflare-init -d https://example.com -o dist --no-cache
```

## Tips

- Preview URLs (`*.pages.dev`) automáticamente con `X-Robots-Tag: noindex`
- CSP directives se pueden pasar via API de integración Astro/Vite
- Si usas Astro, la integración `syntara/astro` genera automáticamente la config en build
