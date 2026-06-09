#!/usr/bin/env node

import { Command } from "commander";
import { generateSitemapCommand } from "../src/commands/sitemap.js";
import { generatePwaIconsCommand } from "../src/commands/pwa.js";
import { optimizeImagesCommand } from "../src/commands/images.js";
import { registerSeoCommands } from "../src/commands/seo.js";

const program = new Command();

program
  .name("syntara")
  .description("Herramientas internas CLI para proyectos web de SyntaraBiz")
  .version("2.0.0");

generateSitemapCommand(program);
generatePwaIconsCommand(program);
optimizeImagesCommand(program);
registerSeoCommands(program);

program
  .command("mcp-server")
  .description(
    "Inicia el servidor MCP (Model Context Protocol) para SEO y optimizacion",
  )
  .action(async () => {
    await import("../src/mcp/server.js");
  });

program.parse(process.argv);
