import fs from "node:fs";
import path from "node:path";
import { buildSitemapEntries, generateSitemapXML } from "../core/sitemap-core.js";
export function generateSitemapCommand(program) {
    program
        .command("sitemap")
        .description("Genera un archivo sitemap.xml para el proyecto")
        .requiredOption("-d, --domain <url>", "Dominio base (ej: https://mimacrochet.com)")
        .option("-f, --file <path>", "Archivo donde buscar IDs dinámicos (ej: src/lib/products.ts)")
        .option("-r, --routes <routes>", "Rutas estáticas separadas por coma", "")
        .option("-o, --out <path>", "Ruta de salida", "public/sitemap.xml")
        .option("-p, --pattern <pattern>", "Patrón de ruta dinámica (default: /producto/{id})", "/producto/{id}")
        .action((options) => {
        const { domain, file, routes, out } = options;
        const staticRoutes = routes
            ? routes.split(",").map((r) => r.trim())
            : [];
        if (!staticRoutes.includes("")) {
            staticRoutes.unshift("");
        }
        const dynamicPatterns = [];
        if (file) {
            dynamicPatterns.push({
                pattern: options.pattern,
                source: file,
                idRegex: /id:\s*['"]([^'"]+)['"]/g,
            });
        }
        const entries = buildSitemapEntries({
            domain,
            staticRoutes,
            dynamicPatterns,
            defaultChangefreq: "weekly",
            defaultPriority: "0.8",
            rootPriority: "1.0",
            compression: false,
        });
        const xml = generateSitemapXML(entries);
        const outputPath = path.resolve(process.cwd(), out);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, xml);
        console.log(`Sitemap generated at ${outputPath} with ${entries.length} URLs.`);
    });
}
//# sourceMappingURL=sitemap.js.map