#!/usr/bin/env node
import { Command } from "commander";
import { generateSitemapCommand } from "../src/commands/sitemap.js";
import { generatePwaIconsCommand } from "../src/commands/pwa.js";
import { optimizeImagesCommand } from "../src/commands/images.js";
import { registerSeoCommands } from "../src/commands/seo.js";
import { getPackageVersion, globalOptions } from "../src/core/utils.js";
const program = new Command();
program
    .name("syntara")
    .description("Herramientas internas CLI para proyectos web de SyntaraBiz")
    .version(getPackageVersion())
    .option("-v, --verbose", "Enable verbose logging", false)
    .option("--dry-run", "Show what would be done without executing", false)
    .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    globalOptions.verbose = opts.verbose ?? false;
    globalOptions.dryRun = opts.dryRun ?? false;
    if (globalOptions.dryRun) {
        console.log("[dry-run] Mode enabled: no files will be written");
    }
});
generateSitemapCommand(program);
generatePwaIconsCommand(program);
optimizeImagesCommand(program);
registerSeoCommands(program);
program
    .command("mcp-server")
    .description("Inicia el servidor MCP (Model Context Protocol) para SEO y optimizacion")
    .action(async () => {
    await import("../src/mcp/server.js");
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map