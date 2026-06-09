# Skill: SEO Audit

Trigger: "auditar SEO", "revisar SEO", "SEO audit", "check SEO"

## Workflow

1. **Identificar el objetivo**:
   - URL del sitio web o archivo HTML local
   - Si no se especifica, preguntar al usuario

2. **Ejecutar audit**:
   ```bash
   npx --yes github:SyntaraBiz/syntara-cli seo-audit -d <URL> -o report.json
   ```

3. **Analizar reporte**:
   - Priorizar errores → warnings → infos
   - Score general (0-100)
   - Issues por categoría: meta, headings, a11y, social, structured-data

4. **Aplicar fixes**:
   - Meta tags: title, description, viewport, canonical
   - Headings: h1 único, jerarquía correcta
   - Imágenes: alt text descriptivo
   - Social: Open Graph, Twitter Cards
   - Structured data: JSON-LD

5. **Verificar**:
   - Re-ejecutar audit para confirmar mejoras
   - Score debería subir > 90 para considerar "good"

## Comandos útiles

```bash
# Audit completo
npx --yes github:SyntaraBiz/syntara-cli seo-audit -d https://example.com -o report.json

# Generar structured data para mejorar SEO
npx --yes github:SyntaraBiz/syntara-cli generate-structured-data -t Organization -o src/data/org.json -d '{"name":"Mi Empresa","url":"https://example.com"}'

# Generar sitemap
npx --yes github:SyntaraBiz/syntara-cli sitemap -d https://example.com -o public/sitemap.xml
```

## Criterios de calidad

- Score > 90: Excelente
- Score 70-90: Bueno, mejoras menores
- Score 50-70: Necesita mejoras
- Score < 50: Crítico, requiere intervención inmediata
