import fs from 'fs';
import path from 'path';

export function generateSitemapCommand(program) {
  program
    .command('sitemap')
    .description('Genera un archivo sitemap.xml para el proyecto')
    .requiredOption('-d, --domain <url>', 'Dominio base (ej: https://mimacrochet.com)')
    .option('-f, --file <path>', 'Archivo donde buscar IDs dinámicos (ej: src/lib/products.ts)')
    .option('-r, --routes <routes>', 'Rutas estáticas separadas por coma', '')
    .option('-o, --out <path>', 'Ruta de salida', 'public/sitemap.xml')
    .action((options) => {
      const { domain, file, routes, out } = options;

      const staticRoutes = routes ? routes.split(',').map(r => r.trim()) : [];
      if (!staticRoutes.includes('')) staticRoutes.unshift(''); // Siempre asegurar la raíz

      let dynamicIds = [];
      if (file) {
        const filePath = path.resolve(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          // Extracción genérica de IDs
          const regex = /id:\s*['"]([^'"]+)['"]/g;
          let match;
          while ((match = regex.exec(content)) !== null) {
            dynamicIds.push(match[1]);
          }
          console.log(`🔍 Se encontraron ${dynamicIds.length} IDs en ${file}`);
        } else {
          console.warn(`⚠️ Archivo ${file} no encontrado. Ignorando IDs dinámicos.`);
        }
      }

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Add static routes
      staticRoutes.forEach(route => {
        const urlPath = route.startsWith('/') ? route : `/${route}`;
        const cleanRoute = urlPath === '/' ? '' : urlPath;
        xml += `  <url>\n`;
        xml += `    <loc>${domain}${cleanRoute}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>${cleanRoute === '' ? '1.0' : '0.8'}</priority>\n`;
        xml += `  </url>\n`;
      });

      // Add dynamic routes (asumiendo patrón de /producto/{id} por ahora, luego se puede parametrizar más)
      dynamicIds.forEach(id => {
        xml += `  <url>\n`;
        xml += `    <loc>${domain}/producto/${id}</loc>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });

      xml += `</urlset>`;

      const outputPath = path.resolve(process.cwd(), out);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, xml);
      console.log(`✅ Sitemap generado en ${outputPath} con ${staticRoutes.length + dynamicIds.length} URLs.`);
    });
}
