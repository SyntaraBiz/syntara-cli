export interface VitePlugin {
  name: string;
  enforce?: "pre" | "post";
  apply?: "build" | "serve" | ((config: Record<string, unknown>, env: { command: string }) => boolean);
  config?: (config: Record<string, unknown>, env: { mode: string; command: string }) => void | Record<string, unknown>;
  configResolved?: (config: Record<string, unknown>) => void;
  configureServer?: (server: Record<string, unknown>) => void;
  transformIndexHtml?: {
    order?: "pre" | "post";
    handler(html: string, ctx?: { path: string; filename: string }): string | { html: string; tags: unknown[] } | undefined;
  } | ((html: string, ctx?: { path: string; filename: string }) => string | { html: string; tags: unknown[] } | undefined);
  writeBundle?: (options: Record<string, unknown>, bundle: Record<string, { fileName: string; type: string; [key: string]: unknown }>) => void;
  closeBundle?: () => void;
  buildStart?: () => void;
  buildEnd?: () => void;
  resolveId?: (source: string, importer?: string) => string | null | undefined;
  load?: (id: string) => string | null | undefined;
  transform?: (code: string, id: string) => { code: string; map?: unknown } | null | undefined;
}
