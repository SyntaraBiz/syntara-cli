export interface AstroIntegrationLogger {
  info(label: string, message?: string): void;
  warn(label: string, message?: string): void;
  error(label: string, message?: string): void;
  debug(label: string, message?: string): void;
}

export interface AstroIntegrationRouteData {
  pattern: string;
  entrypoint: string;
  prerender: boolean;
}

export interface AstroBuildDoneParams {
  pages: { pathname: string }[];
  dir: URL;
  assets: Map<string, URL[]>;
  logger: AstroIntegrationLogger;
}

export interface AstroConfigSetupParams {
  config: {
    root: URL;
    srcDir: URL;
    outDir: URL;
    site?: string;
    base?: string;
    trailingSlash?: "always" | "never" | "ignore";
    build?: {
      format?: "file" | "directory" | "preserve";
      assets?: string;
      server?: URL;
      client?: URL;
    };
  };
  command: "dev" | "build" | "preview" | "sync";
  isRestart: boolean;
  updateConfig: (newConfig: Record<string, unknown>) => void;
  addRenderer: (renderer: unknown) => void;
  addWatchFile: (path: URL | string) => void;
  addClientDirective: (directive: unknown) => void;
  addMiddleware: (middleware: unknown) => void;
  addDevToolbarApp: (entrypoint: unknown) => void;
  injectScript: (stage: string, content: string) => void;
  injectRoute: (injectedRoute: { pattern: string; entrypoint: string | URL; prerender?: boolean }) => void;
  createCodegenDir: () => URL;
  logger: AstroIntegrationLogger;
}

export interface AstroRouteSetupParams {
  route: {
    component: string;
    prerender?: boolean;
  };
  logger: AstroIntegrationLogger;
}

export interface AstroRoutesResolvedParams {
  routes: AstroIntegrationRouteData[];
  logger: AstroIntegrationLogger;
}

export interface AstroConfigDoneParams {
  config: Record<string, unknown>;
  setAdapter: (adapter: unknown) => void;
  injectTypes: (injectedType: { filename: string; content: string }) => URL;
  logger: AstroIntegrationLogger;
  buildOutput: "static" | "server";
}

export interface AstroHooks {
  "astro:config:setup"?: (params: AstroConfigSetupParams) => void | Promise<void>;
  "astro:route:setup"?: (params: AstroRouteSetupParams) => void | Promise<void>;
  "astro:routes:resolved"?: (params: AstroRoutesResolvedParams) => void | Promise<void>;
  "astro:config:done"?: (params: AstroConfigDoneParams) => void | Promise<void>;
  "astro:build:start"?: (params: { logger: AstroIntegrationLogger }) => void | Promise<void>;
  "astro:build:setup"?: (params: Record<string, unknown>) => void | Promise<void>;
  "astro:build:done"?: (params: AstroBuildDoneParams) => void | Promise<void>;
}

export interface AstroIntegration {
  name: string;
  hooks: AstroHooks;
}
