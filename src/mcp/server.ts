#!/usr/bin/env node

import { analyzeHTML } from "../core/seo-analyzer.js";
import {
  generateOrganizationSD,
  generateBreadcrumbSD,
  generateWebSiteSD,
  generateFAQSD,
  generateProductSD,
  generateArticleSD,
  generateStructuredData,
} from "../core/structured-data.js";
import { generateCloudflareConfig } from "../core/cloudflare-config.js";
import {
  buildSitemapEntries,
  generateSitemapXML,
} from "../core/sitemap-core.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SERVER_NAME = "syntara-seo";
const SERVER_VERSION = "2.0.0";
const PROTOCOL_VERSION = "2025-11-25";

interface JsonRpcRequest {
  jsonrpc: string;
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id?: number | string;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

type ToolHandler = (
  params: Record<string, unknown>,
) => Promise<{ content: { type: string; text: string }[] }>;

const tools: Map<
  string,
  {
    description: string;
    inputSchema: Record<string, unknown>;
    handler: ToolHandler;
  }
> = new Map();

tools.set("audit_seo", {
  description:
    "Audita el SEO de una URL o archivo HTML: meta tags, headings, alt text, canonical, viewport, lang",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "URL o ruta del archivo HTML a auditar",
      },
    },
    required: ["url"],
  },
  handler: async (params) => {
    const url = params.url as string;
    let html: string;
    if (url.startsWith("http")) {
      const response = await fetch(url);
      html = await response.text();
    } else {
      const filePath = path.resolve(process.cwd(), url);
      if (!fs.existsSync(filePath)) {
        return {
          content: [
            { type: "text", text: `Error: File not found: ${filePath}` },
          ],
        };
      }
      html = fs.readFileSync(filePath, "utf-8");
    }
    const report = analyzeHTML(html, url);
    return {
      content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
    };
  },
});

tools.set("generate_structured_data", {
  description:
    "Genera datos estructurados JSON-LD para SEO (Organization, BreadcrumbList, WebSite, FAQPage, Product, Article)",
  inputSchema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [
          "Organization",
          "WebSite",
          "BreadcrumbList",
          "Article",
          "Product",
          "FAQPage",
        ],
        description: "Tipo de schema",
      },
      data: {
        type: "object",
        description: "Datos del schema",
      },
    },
    required: ["type", "data"],
  },
  handler: async (params) => {
    const type = params.type as string;
    const data = params.data as Record<string, unknown>;
    let result: string;
    switch (type) {
      case "Organization":
        result = generateOrganizationSD(
          String(data.name ?? ""),
          String(data.url ?? ""),
        );
        break;
      case "BreadcrumbList":
        result = generateBreadcrumbSD(
          (data.items as { name: string; url: string }[]) ?? [],
        );
        break;
      case "WebSite":
        result = generateWebSiteSD(
          String(data.name ?? ""),
          String(data.url ?? ""),
        );
        break;
      case "FAQPage":
        result = generateFAQSD(
          (data.questions as { question: string; answer: string }[]) ?? [],
        );
        break;
      case "Product":
        result = generateProductSD(
          data as Parameters<typeof generateProductSD>[0],
        );
        break;
      case "Article":
        result = generateArticleSD(
          data as Parameters<typeof generateArticleSD>[0],
        );
        break;
      default:
        result = generateStructuredData(type as Parameters<typeof generateStructuredData>[0], data);
    }
    return { content: [{ type: "text", text: result }] };
  },
});

tools.set("generate_sitemap", {
  description: "Genera un sitemap.xml con rutas estaticas y dinamicas",
  inputSchema: {
    type: "object",
    properties: {
      domain: { type: "string", description: "Dominio base" },
      staticRoutes: {
        type: "array",
        items: { type: "string" },
        description: "Rutas estaticas",
      },
      outputDir: { type: "string", description: "Directorio de salida" },
    },
    required: ["domain"],
  },
  handler: async (params) => {
    const domain = params.domain as string;
    const staticRoutes = (params.staticRoutes as string[]) ?? [];
    const outputDir = (params.outputDir as string) ?? "public";

    const entries = buildSitemapEntries({
      domain,
      staticRoutes,
      dynamicPatterns: [],
      defaultChangefreq: "weekly",
      defaultPriority: "0.8",
      rootPriority: "1.0",
      compression: false,
    });

    const xml = generateSitemapXML(entries);
    const outDir = path.resolve(process.cwd(), outputDir);
    fs.mkdirSync(outDir, { recursive: true });
    const outputPath = path.join(outDir, "sitemap.xml");
    fs.writeFileSync(outputPath, xml);

    return {
      content: [
        {
          type: "text",
          text: `Sitemap generated at ${outputPath} with ${entries.length} URLs`,
        },
      ],
    };
  },
});

tools.set("generate_cloudflare_config", {
  description:
    "Genera configuracion de Cloudflare Pages (_headers, _redirects, robots.txt)",
  inputSchema: {
    type: "object",
    properties: {
      domain: { type: "string", description: "Dominio del sitio" },
      outputDir: { type: "string", description: "Directorio de salida" },
    },
    required: ["domain"],
  },
  handler: async (params) => {
    const domain = params.domain as string;
    const outputDir = (params.outputDir as string) ?? "dist";

    const config = generateCloudflareConfig({ domain });
    const outDir = path.resolve(process.cwd(), outputDir);
    fs.mkdirSync(outDir, { recursive: true });

    const files: string[] = [];
    if (config.headers) {
      fs.writeFileSync(path.join(outDir, "_headers"), config.headers);
      files.push("_headers");
    }
    if (config.redirects) {
      fs.writeFileSync(path.join(outDir, "_redirects"), config.redirects);
      files.push("_redirects");
    }
    fs.writeFileSync(path.join(outDir, "robots.txt"), config.robots);
    files.push("robots.txt");

    return {
      content: [
        {
          type: "text",
          text: `Cloudflare config generated at ${outDir}/ [${files.join(", ")}]`,
        },
      ],
    };
  },
});

function sendResponse(response: JsonRpcResponse): void {
  process.stdout.write(JSON.stringify(response) + "\n");
}

async function handleRequest(request: JsonRpcRequest): Promise<void> {
  const { id, method, params } = request;

  switch (method) {
    case "initialize": {
      sendResponse({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
          },
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        },
      });
      return;
    }

    case "notifications/initialized": {
      return;
    }

    case "tools/list": {
      const toolList = Array.from(tools.entries()).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));

      sendResponse({
        jsonrpc: "2.0",
        id,
        result: { tools: toolList },
      });
      return;
    }

    case "tools/call": {
      const toolName = (params as Record<string, unknown>)?.name as string;
      const toolArgs =
        ((params as Record<string, unknown>)?.arguments as Record<string, unknown>) ?? {};

      const tool = tools.get(toolName);
      if (!tool) {
        sendResponse({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Tool not found: ${toolName}`,
          },
        });
        return;
      }

      try {
        const result = await tool.handler(toolArgs);
        sendResponse({ jsonrpc: "2.0", id, result });
      } catch (err) {
        sendResponse({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32603,
            message: `Tool execution error: ${err instanceof Error ? err.message : String(err)}`,
          },
        });
      }
      return;
    }

    case "ping": {
      sendResponse({ jsonrpc: "2.0", id, result: {} });
      return;
    }

    default: {
      sendResponse({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`,
        },
      });
    }
  }
}

function startServer(): void {
  let buffer = "";

  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const request = JSON.parse(line) as JsonRpcRequest;
        handleRequest(request);
      } catch {
        process.stderr.write(`Failed to parse request: ${line}\n`);
      }
    }
  });

  process.stdin.on("end", () => {
    process.exit(0);
  });

  process.stderr.write(
    `${SERVER_NAME} v${SERVER_VERSION} MCP server started (stdio)\n`,
  );
}

startServer();
