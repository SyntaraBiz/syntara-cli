import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export function optimizeImagesCommand(program) {
  program
    .command('optimize-images')
    .description('Optimiza imágenes (las convierte a WebP y reduce su peso)')
    .requiredOption('-d, --dir <path>', 'Directorio a escanear recursivamente')
    .option('-q, --quality <number>', 'Calidad de la compresión (1-100)', '80')
    .action(async (options) => {
      const { dir, quality } = options;
      const targetDir = path.resolve(process.cwd(), dir);
      const q = parseInt(quality, 10);

      if (!fs.existsSync(targetDir)) {
        console.error(`❌ Directorio no encontrado: ${targetDir}`);
        return;
      }

      console.log(`🔍 Buscando imágenes en ${targetDir} ...`);

      let count = 0;

      async function processDirectory(directory) {
        const files = fs.readdirSync(directory);
        for (const file of files) {
          const fullPath = path.join(directory, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            await processDirectory(fullPath);
          } else {
            const ext = path.extname(fullPath).toLowerCase();
            if (['.png', '.jpg', '.jpeg'].includes(ext)) {
              const baseName = path.basename(fullPath, ext);
              // Avoid re-optimizing or conflict
              if (file.includes('link_preview')) continue;

              const outPath = path.join(directory, `${baseName}.webp`);
              
              try {
                await sharp(fullPath)
                  .webp({ quality: q })
                  .toFile(outPath);
                
                // Original file is replaced/removed or kept?
                // By default we remove the old one to save space in repository
                fs.unlinkSync(fullPath);

                console.log(`✅ Optimizado: ${file} -> ${baseName}.webp`);
                count++;
              } catch (err) {
                console.error(`❌ Error procesando ${file}:`, err);
              }
            }
          }
        }
      }

      await processDirectory(targetDir);
      console.log(`🎉 Se optimizaron ${count} imágenes exitosamente.`);
    });
}
