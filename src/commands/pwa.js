import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export function generatePwaIconsCommand(program) {
  program
    .command('pwa-icons')
    .description('Genera íconos de PWA en diferentes tamaños a partir de una imagen origen')
    .requiredOption('-s, --source <path>', 'Ruta de la imagen de origen')
    .option('-o, --out <path>', 'Carpeta de salida', 'public')
    .action(async (options) => {
      const { source, out } = options;

      const sourcePath = path.resolve(process.cwd(), source);
      const outDir = path.resolve(process.cwd(), out);

      if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Imagen origen no encontrada: ${sourcePath}`);
        return;
      }

      fs.mkdirSync(outDir, { recursive: true });

      const sizes = [192, 512];

      try {
        for (const size of sizes) {
          const outputPath = path.join(outDir, `pwa-${size}x${size}.png`);
          await sharp(sourcePath)
            .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .toFile(outputPath);
          console.log(`✅ Generado ${outputPath}`);
        }
        
        // Generar imagen para link preview (Open Graph / Twitter Card)
        const previewPath = path.join(outDir, 'link_preview.png');
        await sharp(sourcePath)
          .resize(1200, 630, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .toFile(previewPath);
        console.log(`✅ Generado ${previewPath}`);

        console.log('🎉 Íconos PWA y Link Preview generados exitosamente.');
      } catch (err) {
        console.error('❌ Error generando íconos PWA:', err);
      }
    });
}
