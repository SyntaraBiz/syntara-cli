#!/usr/bin/env node
import { analyzeHTML } from "../core/seo-analyzer.js";
import { generateOrganizationSD, generateBreadcrumbSD, generateWebSiteSD, generateFAQSD, generateProductSD, generateArticleSD, generateStructuredData, } from "../core/structured-data.js";
import { generateCloudflareConfig } from "../core/cloudflare-config.js";
import { buildSitemapEntries, generateSitemapXML, } from "../core/sitemap-core.js";
import { optimizeDirectory } from "../core/image-pipeline.js";
import fs from "node:fs";
import path from "node:path";
const SERVER_NAME = "syntara-seo";
const SERVER_VERSION = "2.0.0";
const PROTOCOL_VERSION = "2025-11-25";
const tools = new Map();
tools.set("audit_seo", {
    description: "Audita el SEO de una URL o archivo HTML: meta tags, headings, alt text, canonical, viewport, lang",
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
        const url = params.url;
        let html;
        if (url.startsWith("http")) {
            const response = await fetch(url);
            if (!response.ok) {
                return {
                    content: [
                        { type: "text", text: `Error: HTTP ${response.status} for ${url}` },
                    ],
                };
            }
            html = await response.text();
        }
        else {
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
    description: "Genera datos estructurados JSON-LD para SEO (Organization, BreadcrumbList, WebSite, FAQPage, Product, Article)",
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
        const type = params.type;
        const data = params.data;
        let result;
        switch (type) {
            case "Organization":
                result = generateOrganizationSD(String(data.name ?? ""), String(data.url ?? ""));
                break;
            case "BreadcrumbList":
                result = generateBreadcrumbSD(data.items ?? []);
                break;
            case "WebSite":
                result = generateWebSiteSD(String(data.name ?? ""), String(data.url ?? ""));
                break;
            case "FAQPage":
                result = generateFAQSD(data.questions ?? []);
                break;
            case "Product":
                result = generateProductSD(data);
                break;
            case "Article":
                result = generateArticleSD(data);
                break;
            default:
                result = generateStructuredData(type, data);
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
        const domain = params.domain;
        const staticRoutes = params.staticRoutes ?? [];
        const outputDir = params.outputDir ?? "public";
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
    description: "Genera configuracion de Cloudflare Pages (_headers, _redirects, robots.txt)",
    inputSchema: {
        type: "object",
        properties: {
            domain: { type: "string", description: "Dominio del sitio" },
            outputDir: { type: "string", description: "Directorio de salida" },
        },
        required: ["domain"],
    },
    handler: async (params) => {
        const domain = params.domain;
        const outputDir = params.outputDir ?? "dist";
        const config = generateCloudflareConfig({ domain });
        const outDir = path.resolve(process.cwd(), outputDir);
        fs.mkdirSync(outDir, { recursive: true });
        const files = [];
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
tools.set("optimize_images", {
    description: "Optimiza imagenes PNG/JPG a WebP en un directorio",
    inputSchema: {
        type: "object",
        properties: {
            dir: { type: "string", description: "Directorio de imagenes" },
            quality: { type: "number", description: "Calidad 1-100", default: 80 },
        },
        required: ["dir"],
    },
    handler: async (params) => {
        const dir = params.dir;
        const quality = params.quality ?? 80;
        const targetDir = path.resolve(process.cwd(), dir);
        if (!fs.existsSync(targetDir)) {
            return {
                content: [{ type: "text", text: `Error: Directory not found: ${targetDir}` }],
            };
        }
        const count = await optimizeDirectory(targetDir, "webp", quality);
        return {
            content: [
                { type: "text", text: `Optimized ${count} images to WebP (quality: ${quality})` },
            ],
        };
    },
});
function sendResponse(response) {
    process.stdout.write(JSON.stringify(response) + "\n");
}
async function handleRequest(request) {
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
            const toolName = params?.name;
            const toolArgs = params?.arguments ?? {};
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
            }
            catch (err) {
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
function startServer() {
    let buffer = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => {
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
            if (!line.trim())
                continue;
            try {
                const request = JSON.parse(line);
                handleRequest(request);
            }
            catch {
                process.stderr.write(`Failed to parse request: ${line}\n`);
            }
        }
    });
    process.stdin.on("end", () => {
        process.exit(0);
    });
    process.stderr.write(`${SERVER_NAME} v${SERVER_VERSION} MCP server started (stdio)\n`);
}
startServer();
//# sourceMappingURL=server.js.map