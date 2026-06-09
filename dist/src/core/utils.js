import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export function getPackageVersion() {
    try {
        const pkgPath = join(__dirname, "..", "package.json");
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        return pkg.version ?? "0.0.0";
    }
    catch {
        return "0.0.0";
    }
}
export function getPackageName() {
    try {
        const pkgPath = join(__dirname, "..", "package.json");
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        return pkg.name ?? "syntara";
    }
    catch {
        return "syntara";
    }
}
export const globalOptions = {
    verbose: false,
    dryRun: false,
};
export function logVerbose(...args) {
    if (globalOptions.verbose) {
        console.log("[verbose]", ...args);
    }
}
export function logDryRun(message) {
    if (globalOptions.dryRun) {
        console.log(`[dry-run] ${message}`);
    }
}
//# sourceMappingURL=utils.js.map