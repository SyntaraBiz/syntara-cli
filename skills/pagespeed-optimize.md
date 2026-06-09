# Skill: PageSpeed Optimize

## Description
Analiza y optimiza el rendimiento de una pagina web para alcanzar 100% en PageSpeed Insights,
aplicando optimizaciones automaticas para cada Core Web Vital.

## Trigger
"optimizar PageSpeed", "mejorar Lighthouse", "100 PageSpeed", "optimizar rendimiento"

## Workflow

### 1. Auditoría inicial
```bash
syntara pagespeed-audit -u https://dominio.com --strategy mobile
```

### 2. Analizar resultados por peso de métrica

| Métrica | Peso | Acción si falla |
|---|---|---|
| **TBT** (Total Blocking Time) | 30% | Code splitting, defer JS no critico, eliminar JS innecesario |
| **LCP** (Largest Contentful Paint) | 25% | Preload imagen LCP, AVIF/WebP, fetchpriority="high", CDN |
| **CLS** (Cumulative Layout Shift) | 25% | width/height en imagenes, aspect-ratio, font size-adjust |
| **FCP** (First Contentful Paint) | 10% | Critical CSS inline, font preload, eliminar render-blocking |
| **SI** (Speed Index) | 10% | Minimizar DOM, lazy-load below-fold |

### 3. Aplicar optimizaciones especificas

#### TBT > 200ms
```bash
# Revisar bundle size
npx vite-bundle-visualizer  # Para proyectos Vite
npx astro build --verbose    # Para ver output sizes

# Identificar y diferir JS pesado
# Usar dynamic import() para componentes no criticos
# Eliminar dependencias no usadas
```

#### LCP > 2.5s
```bash
# Optimizar imagen LCP
syntara image-optimize-advanced -d src/assets -q 85 --format avif

# Asegurar fetchpriority="high" en la imagen principal
# Preload de la imagen LCP en <head>
<link rel="preload" as="image" href="hero.avif" fetchpriority="high">
```

#### CLS > 0.1
- Añadir `width` y `height` a todas las imagenes
- Usar `aspect-ratio` en CSS para contenedores
- Añadir `size-adjust` en `@font-face` para fallback fonts
- Evitar insertar contenido dinamicamente arriba del contenido existente

#### FCP > 1.8s
```bash
# Extraer e inlinear CSS critico
syntara optimize-critical-css -i dist/index.html -c dist/assets/*.css

# Optimizar carga de fuentes
syntara font-optimize -d src/styles
```

### 4. Optimizaciones Cloudflare Pages adicionales
```bash
# Generar configuracion de cache y seguridad
syntara cloudflare-init -d https://dominio.com -o dist

# Verificar headers despues del deploy:
curl -I https://dominio.com | grep -E "(cache-control|cf-cache-status)"
```

### 5. Re-ejecutar auditoría
```bash
syntara pagespeed-audit -u https://dominio.com --strategy mobile
```

### Checklist final para PageSpeed 100%
- [ ] Imagenes en AVIF/WebP con srcset
- [ ] Critical CSS inline en <head>
- [ ] Fonts con font-display: swap y preload
- [ ] JS diferido (defer/async/dynamic import)
- [ ] Cache headers optimizados en Cloudflare
- [ ] width/height en todas las imagenes
- [ ] LCP preload con fetchpriority="high"
- [ ] HTML minificado
- [ ] DNS prefetch para origenes externos
