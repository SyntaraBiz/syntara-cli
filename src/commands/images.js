import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export function optimizeImagesCommand(program) {
  program
    .command('optimize-images')
    .description('Optimiza imágenes (las convierte a WebP y reduce su peso)')
    .requiredOption('-d, --dir <path>', 'Directorio a escanear recursivamente')
    .option('-q, --quality <number>', 'Calidad de la compresión (1-100)', '80')
    .option('-c, --code-dir <path>', 'Directorio de código para actualizar importaciones automáticamente')
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

      if (options.codeDir) {
        const codeDir = path.resolve(process.cwd(), options.codeDir);
        if (fs.existsSync(codeDir)) {
          console.log(`🔍 Actualizando importaciones en el código fuente en ${codeDir}...`);
          function updateImports(directory) {
            const files = fs.readdirSync(directory);
            for (const file of files) {
              const fullPath = path.join(directory, file);
              const stat = fs.statSync(fullPath);
              if (stat.isDirectory()) {
                updateImports(fullPath);
              } else if (file.match(/\.(tsx|ts|jsx|js|vue|svelte|html)$/i)) {
                let content = fs.readFileSync(fullPath, 'utf-8');
                let modified = false;
                if (content.includes('.png') || content.includes('.jpg') || content.includes('.jpeg')) {
                  content = content.replace(/\.png/g, '.webp')
                                   .replace(/\.jpg/g, '.webp')
                                   .replace(/\.jpeg/g, '.webp');
                  modified = true;
                }
                if (modified) {
                  fs.writeFileSync(fullPath, content);
                  console.log(`✅ Importaciones actualizadas en: ${file}`);
                }
              }
            }
          }
          updateImports(codeDir);
          console.log(`🎉 Actualización de importaciones completada.`);
        } else {
          console.warn(`⚠️ Directorio de código no encontrado: ${codeDir}`);
        }
      }
    });
}
