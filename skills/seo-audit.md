# Skill: SEO Audit

## Description
Audita el SEO de un sitio web o proyecto, generando un reporte con issues priorizados
y acciones correctivas concretas.

## Trigger
"auditar SEO", "revisar SEO", "SEO audit", "analizar SEO"

## Workflow

### 1. Si es un sitio ya desplegado
```bash
syntara seo-audit -d https://dominio.com -o seo-report.json
```

### 2. Si es un proyecto local (post-build)
```bash
syntara seo-audit -d dist/index.html -o seo-report.json
```

### 3. Revisar el reporte
Revisar el JSON y priorizar por severidad:
- **ERROR**: Críticos — arreglar inmediatamente (missing title, h1, lang)
- **WARN**: Importantes — arreglar pronto (title length, meta description, alt text)
- **INFO**: Recomendaciones — considerar (canonical, structured data)

### 4. Por categoría de issue, aplicar correcciones:

#### Meta Tags
- `<title>`: 50-60 caracteres, único por página, incluye keyword principal
- `<meta name="description">`: 120-158 caracteres, llamada a la acción
- `<meta name="viewport">`: `width=device-width, initial-scale=1`
- `<link rel="canonical">`: URL canónica consistente (con o sin trailing slash)

#### Headings
- Exactamente un `<h1>` por página
- Jerarquía sin saltos: h1 → h2 → h3
- Los headings deben ser descriptivos, no genéricos

#### Imágenes
- `alt` en todas las imágenes (descriptivo, incluye keyword si es natural)
- Formato moderno: WebP o AVIF
- `width` y `height` explícitos para evitar CLS

#### Structured Data
- Minimum: `Organization` o `WebSite` en la home
- `BreadcrumbList` en todas las páginas internas
- `Article` / `BlogPosting` en posts
- `Product` en páginas de producto

### 5. Re-ejecutar la auditoría para verificar
```bash
syntara seo-audit -d https://dominio.com -o seo-report-final.json
```
