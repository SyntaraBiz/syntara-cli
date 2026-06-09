const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 158;
export function analyzeHTML(html, url) {
    const issues = [];
    const title = extractMeta(html, "title");
    if (!title) {
        issues.push({
            type: "error",
            category: "meta",
            message: "Missing <title> tag",
            suggestion: 'Add a descriptive <title> tag (50-60 characters)',
        });
    }
    else if (title.length < TITLE_MIN) {
        issues.push({
            type: "warn",
            category: "meta",
            message: `Title too short (${title.length} chars)`,
            suggestion: `Expand title to ${TITLE_MIN}-${TITLE_MAX} characters`,
        });
    }
    else if (title.length > TITLE_MAX) {
        issues.push({
            type: "warn",
            category: "meta",
            message: `Title too long (${title.length} chars)`,
            suggestion: `Shorten title to ${TITLE_MAX} characters or less`,
        });
    }
    const description = extractMetaAttr(html, "description");
    if (!description) {
        issues.push({
            type: "error",
            category: "meta",
            message: "Missing <meta name='description'> tag",
            suggestion: `Add a meta description (${DESC_MIN}-${DESC_MAX} characters)`,
        });
    }
    else if (description.length < DESC_MIN) {
        issues.push({
            type: "warn",
            category: "meta",
            message: `Meta description too short (${description.length} chars)`,
            suggestion: `Expand description to ${DESC_MIN}-${DESC_MAX} characters`,
        });
    }
    const h1Count = countTag(html, "h1");
    if (h1Count === 0) {
        issues.push({
            type: "error",
            category: "headings",
            message: "Missing <h1> tag",
            suggestion: "Add exactly one <h1> tag per page",
        });
    }
    else if (h1Count > 1) {
        issues.push({
            type: "warn",
            category: "headings",
            message: `Multiple <h1> tags found (${h1Count})`,
            suggestion: "Use exactly one <h1> per page",
        });
    }
    const canon = extractMetaAttr(html, "canonical");
    if (!canon) {
        issues.push({
            type: "info",
            category: "meta",
            message: "No canonical URL specified",
            suggestion: "Add <link rel='canonical' href='...'>",
        });
    }
    const images = extractTags(html, "img");
    const imagesWithoutAlt = images.filter((img) => !img.includes("alt="));
    if (imagesWithoutAlt.length > 0) {
        issues.push({
            type: "warn",
            category: "a11y",
            message: `${imagesWithoutAlt.length} images without alt text`,
            suggestion: "Add descriptive alt attributes to all images",
        });
    }
    const hasViewport = html.includes("viewport");
    if (!hasViewport) {
        issues.push({
            type: "warn",
            category: "meta",
            message: "Missing viewport meta tag",
            suggestion: "Add <meta name='viewport' content='width=device-width, initial-scale=1'>",
        });
    }
    const hasLang = /<html[^>]*lang=/.test(html);
    if (!hasLang) {
        issues.push({
            type: "error",
            category: "a11y",
            message: "Missing lang attribute on <html>",
            suggestion: "Add lang='es' (or appropriate language) to <html>",
        });
    }
    const errors = issues.filter((i) => i.type === "error").length;
    const warnings = issues.filter((i) => i.type === "warn").length;
    const infos = issues.filter((i) => i.type === "info").length;
    const total = errors + warnings + infos;
    const score = total > 0
        ? Math.round(((errors * 0 + warnings * 50 + infos * 75) / (total * 100)) * 100)
        : 100;
    return {
        url,
        score,
        issues,
        summary: { errors, warnings, infos },
    };
}
function extractMeta(html, tag) {
    const match = html.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, "i"));
    return match ? match[1].trim() : null;
}
function extractMetaAttr(html, name) {
    const match = html.match(new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"));
    if (match)
        return match[1];
    const linkMatch = html.match(new RegExp(`<link[^>]*rel=["']${name}["'][^>]*href=["']([^"']*)["']`, "i"));
    return linkMatch ? linkMatch[1] : null;
}
function countTag(html, tag) {
    const matches = html.match(new RegExp(`<${tag}[\\s>]`, "gi"));
    return matches ? matches.length : 0;
}
function extractTags(html, tag) {
    const matches = html.match(new RegExp(`<${tag}[^>]*>`, "gi"));
    return matches ?? [];
}
//# sourceMappingURL=seo-analyzer.js.map