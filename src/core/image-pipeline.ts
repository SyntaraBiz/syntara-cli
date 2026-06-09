import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export type ImageFormat = "webp" | "avif" | "png" | "jpeg";

export interface ConvertOptions {
  format: ImageFormat;
  quality: number;
  width?: number;
  height?: number;
  fit?: keyof typeof sharp.fit;
  background?: { r: number; g: number; b: number; alpha: number };
}

export interface PwaIconResult {
  size: number;
  path: string;
  buffer: Buffer;
}

export interface SrcSetResult {
  width: number;
  path: string;
  buffer: Buffer;
}

export interface BlurPlaceholderResult {
  base64: string;
  width: number;
  height: number;
}

const DEFAULT_SIZES = [192, 512];
const DEFAULT_SRCSET_SIZES = [320, 640, 1280];
const PREVIEW_SIZE = { width: 1200, height: 630 };
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

export async function convertImage(
  sourcePath: string,
  outputPath: string,
  options: ConvertOptions,
): Promise<Buffer> {
  const instance = sharp(sourcePath);

  if (options.width || options.height) {
    instance.resize({
      width: options.width,
      height: options.height,
      fit: options.fit ?? "contain",
      background: options.background ?? { r: 255, g: 255, b: 255, alpha: 1 },
    } as Parameters<typeof instance.resize>[0]);
  }

  switch (options.format) {
    case "webp":
      instance.webp({ quality: options.quality });
      break;
    case "avif":
      instance.avif({ quality: options.quality });
      break;
    case "jpeg":
      instance.jpeg({ quality: options.quality });
      break;
    case "png":
      instance.png({ quality: options.quality });
      break;
  }

  const buffer = await instance.toBuffer();
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, buffer);
  return buffer;
}

export async function generatePwaIcons(
  sourcePath: string,
  outputDir: string,
  sizes: number[] = DEFAULT_SIZES,
): Promise<PwaIconResult[]> {
  const results: PwaIconResult[] = [];

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source image not found: ${sourcePath}`);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `pwa-${size}x${size}.png`);
    const buffer = await sharp(sourcePath)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();

    fs.writeFileSync(outputPath, buffer);
    results.push({ size, path: outputPath, buffer });
  }

  const previewPath = path.join(outputDir, "link_preview.png");
  const previewBuffer = await sharp(sourcePath)
    .resize(PREVIEW_SIZE.width, PREVIEW_SIZE.height, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  fs.writeFileSync(previewPath, previewBuffer);

  return results;
}

export async function generateSrcSet(
  sourcePath: string,
  outputDir: string,
  format: ImageFormat = "webp",
  sizes: number[] = DEFAULT_SRCSET_SIZES,
  quality = 80,
): Promise<SrcSetResult[]> {
  const results: SrcSetResult[] = [];
  const ext = path.extname(sourcePath);
  const baseName = path.basename(sourcePath, ext);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source image not found: ${sourcePath}`);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const width of sizes) {
    const outputPath = path.join(outputDir, `${baseName}-${width}w.${format}`);
    const instance = sharp(sourcePath).resize(width);

    let buffer: Buffer;
    switch (format) {
      case "webp":
        buffer = await instance.webp({ quality }).toBuffer();
        break;
      case "avif":
        buffer = await instance.avif({ quality }).toBuffer();
        break;
      default:
        buffer = await instance.png({ quality }).toBuffer();
    }

    fs.writeFileSync(outputPath, buffer);
    results.push({ width, path: outputPath, buffer });
  }

  return results;
}

export async function generateBlurPlaceholder(
  sourcePath: string,
): Promise<BlurPlaceholderResult> {
  const metadata = await sharp(sourcePath).metadata();
  const originalWidth = metadata.width ?? 1;
  const originalHeight = metadata.height ?? 1;

  const blurWidth = 16;
  const aspectRatio = originalWidth / originalHeight;
  const blurHeight = Math.round(blurWidth / aspectRatio);

  const buffer = await sharp(sourcePath)
    .resize(blurWidth, blurHeight, { fit: "cover" })
    .blur(10)
    .jpeg({ quality: 30 })
    .toBuffer();

  const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  return { base64, width: originalWidth, height: originalHeight };
}

export async function optimizeDirectory(
  targetDir: string,
  format: ImageFormat = "webp",
  quality = 80,
): Promise<number> {
  let count = 0;

  async function processDir(directory: string): Promise<void> {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        await processDir(fullPath);
        continue;
      }

      const ext = path.extname(fullPath).toLowerCase();
      if (!IMAGE_EXTENSIONS.includes(ext)) continue;
      if (item.includes("link_preview")) continue;

      const baseName = path.basename(fullPath, ext);
      const outPath = path.join(directory, `${baseName}.${format}`);

      try {
        await convertImage(fullPath, outPath, { format, quality });
        fs.unlinkSync(fullPath);
        count++;
      } catch (err) {
        console.error(`Error processing ${item}:`, err);
      }
    }
  }

  await processDir(targetDir);
  return count;
}

export function updateCodeImports(
  codeDir: string,
  format: ImageFormat = "webp",
): { updated: number; files: string[] } {
  const updatedFiles: string[] = [];
  const extensions = [".tsx", ".ts", ".jsx", ".js", ".vue", ".svelte", ".html", ".astro"];

  function scanDir(directory: string): void {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
        continue;
      }

      const ext = path.extname(fullPath);
      if (!extensions.includes(ext)) continue;

      let content = fs.readFileSync(fullPath, "utf-8");
      let modified = false;

      for (const imgExt of IMAGE_EXTENSIONS) {
        const ext = imgExt.replace(".", "");
        // Only replace image paths inside quotes that are NOT external URLs
        // Matches: "./logo.png", './img/logo.png', "/logo.png", etc.
        // Skips: "https://example.com/img.png", "data-alt", etc.
        const regex = new RegExp(`(['"](?:[^'"]*[^/])?)\\.${ext}(?![a-zA-Z0-9])`, "g");
        if (regex.test(content)) {
          content = content.replace(regex, `$1.${format}`);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, "utf-8");
        updatedFiles.push(fullPath);
      }
    }
  }

  scanDir(codeDir);
  return { updated: updatedFiles.length, files: updatedFiles };
}
