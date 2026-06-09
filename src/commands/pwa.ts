import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import { generatePwaIcons } from "../core/image-pipeline.js";

export function generatePwaIconsCommand(program: Command): void {
  program
    .command("pwa-icons")
    .description(
      "Genera iconos de PWA en diferentes tamanos a partir de una imagen origen",
    )
    .requiredOption("-s, --source <path>", "Ruta de la imagen de origen")
    .option("-o, --out <path>", "Carpeta de salida", "public")
    .action(async (options) => {
      const { source, out } = options;
      const sourcePath = path.resolve(process.cwd(), source);
      const outDir = path.resolve(process.cwd(), out);

      if (!fs.existsSync(sourcePath)) {
        console.error(`Source image not found: ${sourcePath}`);
        return;
      }

      try {
        const results = await generatePwaIcons(sourcePath, outDir);
        for (const result of results) {
          console.log(`Generated ${result.path}`);
        }
        console.log("PWA icons generated successfully.");
      } catch (err) {
        console.error("Error generating PWA icons:", err);
      }
    });
}
