import sharp from "sharp";
export type ImageFormat = "webp" | "avif" | "png" | "jpeg";
export interface ConvertOptions {
    format: ImageFormat;
    quality: number;
    width?: number;
    height?: number;
    fit?: keyof typeof sharp.fit;
    background?: {
        r: number;
        g: number;
        b: number;
        alpha: number;
    };
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
export declare function convertImage(sourcePath: string, outputPath: string, options: ConvertOptions): Promise<Buffer>;
export declare function generatePwaIcons(sourcePath: string, outputDir: string, sizes?: number[]): Promise<PwaIconResult[]>;
export declare function generateSrcSet(sourcePath: string, outputDir: string, format?: ImageFormat, sizes?: number[], quality?: number): Promise<SrcSetResult[]>;
export declare function generateBlurPlaceholder(sourcePath: string): Promise<BlurPlaceholderResult>;
export declare function optimizeDirectory(targetDir: string, format?: ImageFormat, quality?: number): Promise<number>;
export declare function updateCodeImports(codeDir: string): {
    updated: number;
    files: string[];
};
//# sourceMappingURL=image-pipeline.d.ts.map