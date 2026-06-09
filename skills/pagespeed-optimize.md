# Skill: PageSpeed Optimize

Trigger: "optimizar PageSpeed", "mejorar Lighthouse", "100 PageSpeed", "Core Web Vitals"

## Workflow

1. **Audit inicial**:
   - Ejecutar `syntara seo-audit` para identificar issues SEO
   - Revisar Core Web Vitals en Chrome DevTools o PageSpeed Insights

2. **Optimizar imágenes**:
   ```bash
   npx --yes github:SyntaraBiz/syntara-cli optimize-images -d public/images -q 85
   ```

3. **Generar PWA icons**:
   ```bash
   npx --yes github:SyntaraBiz/syntara-cli pwa-icons -s public/logo.png -o public/icons
   ```

4. **Verificar SEO técnico**:
   - Sitemap generado
   - Structured data presente
   - Meta tags correctos
   - Alt text en imágenes

5. **Configurar Cloudflare**:
   ```bash
   npx --yes github:SyntaraBiz/syntara-cli cloudflare-init -d https://example.com -o dist
   ```

6. **Verificar métricas**:
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

## Comandos útiles

```bash
# Audit SEO
npx --yes github:SyntaraBiz/syntara-cli seo-audit -d https://example.com

# Optimizar imágenes + actualizar imports
npx --yes github:SyntaraBiz/syntara-cli optimize-images -d src/assets -q 85 -c src

# Generar icons PWA
npx --yes github:SyntaraBiz/syntara-cli pwa-icons -s public/logo.png -o public

# Generar sitemap
npx --yes github:SyntaraBiz/syntara-cli sitemap -d https://example.com -o public/sitemap.xml

# Configurar Cloudflare
npx --yes github:SyntaraBiz/syntara-cli cloudflare-init -d https://example.com -o dist
```

## Tips

- Usar `syntara/astro` o `syntara/vite` para automatizar todo en build
- `--dry-run` para preview de cambios sin ejecutar
- `--verbose` para ver detalles de cada operación
- `link_preview.png` (1200x630) se genera automáticamente con `pwa-icons`
