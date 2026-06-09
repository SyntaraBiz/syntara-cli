import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import { analyzeHTML } from "../core/seo-analyzer.js";
import {
  generateOrganizationSD,
  generateBreadcrumbSD,
  generateWebSiteSD,
  generateFAQSD,
  generateProductSD,
  generateArticleSD,
} from "../core/structured-data.js";
import { generateCloudflareConfig } from "../core/cloudflare-config.js";

export function registerSeoCommands(program: Command): void {
  program
    .command("seo-audit")
    .description("Audita el SEO de un sitio web o HTML local")
    .requiredOption("-d, --domain <url>", "URL o archivo HTML a auditar")
    .option("-o, --out <path>", "Archivo de salida para el reporte JSON")
    .action(async (options) => {
      const { domain, out } = options;

      let html: string;
      if (domain.startsWith("http")) {
        try {
          const response = await fetch(domain);
          if (!response.ok) {
            console.error(`Failed to fetch URL: ${domain} (status ${response.status})`);
            return;
          }
          html = await response.text();
        } catch {
          console.error(`Failed to fetch URL: ${domain}`);
          return;
        }
      } else {
        const filePath = path.resolve(process.cwd(), domain);
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          return;
        }
        html = fs.readFileSync(filePath, "utf-8");
      }

      const report = analyzeHTML(html, domain);

      console.log(`\nSEO Audit: ${domain}`);
      console.log(`Score: ${report.score}/100`);
      console.log(
        `Issues: ${report.summary.errors} errors, ${report.summary.warnings} warnings, ${report.summary.infos} info`,
      );

      for (const issue of report.issues) {
        const icon =
          issue.type === "error"
            ? "ERROR"
            : issue.type === "warn"
              ? "WARN"
              : "INFO";
        console.log(`  [${icon}] [${issue.category}] ${issue.message}`);
        console.log(`         Suggestion: ${issue.suggestion}`);
      }

      if (out) {
        const outPath = path.resolve(process.cwd(), out);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
        console.log(`\nReport saved to ${outPath}`);
      }
    });

  program
    .command("generate-structured-data")
    .description("Genera datos estructurados (JSON-LD) para SEO")
    .requiredOption("-t, --type <type>", "Tipo de schema")
    .requiredOption("-o, --out <path>", "Archivo de salida")
    .option("-d, --data <json>", "Datos en formato JSON")
    .action((options) => {
      const { type, out, data } = options;
      let parsedData: Record<string, unknown> = {};
      if (data) {
        try {
          parsedData = JSON.parse(data);
        } catch {
          console.error("Invalid JSON in --data option");
          return;
        }
      }

      let result: string;
      switch (type) {
        case "Organization":
          result = generateOrganizationSD(
            String(parsedData.name ?? "My Organization"),
            String(parsedData.url ?? ""),
          );
          break;
        case "BreadcrumbList":
          result = generateBreadcrumbSD(
            (parsedData.items as { name: string; url: string }[]) ?? [],
          );
          break;
        case "WebSite":
          result = generateWebSiteSD(
            String(parsedData.name ?? "My Site"),
            String(parsedData.url ?? ""),
          );
          break;
        case "FAQPage":
          result = generateFAQSD(
            (parsedData.questions as { question: string; answer: string }[]) ?? [],
          );
          break;
        case "Product":
          result = generateProductSD(
            parsedData as Parameters<typeof generateProductSD>[0],
          );
          break;
        case "Article":
          result = generateArticleSD(
            parsedData as Parameters<typeof generateArticleSD>[0],
          );
          break;
        default:
          console.error(`Unknown schema type: ${type}`);
          return;
      }

      const outPath = path.resolve(process.cwd(), out);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, result);
      console.log(`Structured data generated at ${outPath}`);
    });

  program
    .command("cloudflare-init")
    .description("Genera configuracion completa para Cloudflare Pages")
    .requiredOption("-d, --domain <url>", "Dominio del sitio")
    .option("-o, --out <path>", "Directorio de salida", "dist")
    .option("--no-cache", "Deshabilitar cache headers")
    .option("--no-security", "Deshabilitar security headers")
    .option("-r, --redirects <json>", "Redirects en formato JSON")
    .action((options) => {
      let redirects: { from: string; to: string; status?: number }[] | undefined;
      if (options.redirects) {
        try {
          redirects = JSON.parse(options.redirects);
        } catch {
          console.error("Invalid JSON in --redirects option");
          return;
        }
      }

      const config = generateCloudflareConfig({
        domain: options.domain,
        cacheHeaders: options.cache ?? true,
        securityHeaders: options.security ?? true,
        redirects,
      });

      const outDir = path.resolve(process.cwd(), options.out);
      fs.mkdirSync(outDir, { recursive: true });

      if (config.headers) {
        fs.writeFileSync(path.join(outDir, "_headers"), config.headers);
        console.log(`_headers generated at ${outDir}/_headers`);
      }

      if (config.redirects) {
        fs.writeFileSync(path.join(outDir, "_redirects"), config.redirects);
        console.log(`_redirects generated at ${outDir}/_redirects`);
      }

      fs.writeFileSync(path.join(outDir, "robots.txt"), config.robots);
      console.log(`robots.txt generated at ${outDir}/robots.txt`);
    });
}
