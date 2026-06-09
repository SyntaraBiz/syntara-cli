import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import { optimizeDirectory, updateCodeImports } from "../core/image-pipeline.js";

export function optimizeImagesCommand(program: Command): void {
  program
    .command("optimize-images")
    .description("Optimiza imagenes (las convierte a WebP y reduce su peso)")
    .requiredOption("-d, --dir <path>", "Directorio a escanear recursivamente")
    .option("-q, --quality <number>", "Calidad de la compresion (1-100)", "80")
    .option(
      "-c, --code-dir <path>",
      "Directorio de codigo para actualizar importaciones automaticamente",
    )
    .action(async (options) => {
      const { dir, quality } = options;
      const targetDir = path.resolve(process.cwd(), dir);
      const q = parseInt(quality, 10);

      if (!fs.existsSync(targetDir)) {
        console.error(`Directory not found: ${targetDir}`);
        return;
      }

      console.log(`Scanning images in ${targetDir} ...`);
      const count = await optimizeDirectory(targetDir, "webp", q);
      console.log(`${count} images optimized successfully.`);

      if (options.codeDir) {
        const codeDir = path.resolve(process.cwd(), options.codeDir);
        if (fs.existsSync(codeDir)) {
          console.log(`Updating import statements in ${codeDir}...`);
          const result = updateCodeImports(codeDir);
          console.log(
            `Updated ${result.updated} files: ${result.files.join(", ")}`,
          );
        } else {
          console.warn(`Code directory not found: ${codeDir}`);
        }
      }
    });
}
