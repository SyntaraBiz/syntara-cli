import { describe, it, expect } from "vitest";
import { analyzeHTML } from "./seo-analyzer.js";

function buildHTML(overrides: Partial<{
  title: string;
  description: string;
  h1: string;
  canonical: string;
  img: string;
  viewport: boolean;
  lang: string;
  ogTags: boolean;
  twitterTags: boolean;
  structuredData: boolean;
}> = {}): string {
  const {
    title = "Perfect SEO Title That Is Exactly Right For Search",
    description = "This is a perfect meta description that is long enough to pass all the validation checks and score very well in the audit.",
    h1 = "<h1>Main Heading</h1>",
    canonical = '<link rel="canonical" href="https://example.com/page">',
    img = '<img src="img.jpg" alt="Descriptive alt text">',
    viewport = true,
    lang = "en",
    ogTags = true,
    twitterTags = true,
    structuredData = true,
  } = overrides;

  const og = ogTags ? `
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta property="og:url" content="https://example.com">` : "";

  const twitter = twitterTags ? `
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">` : "";

  const sd = structuredData ? `
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Example","url":"https://example.com"}</script>` : "";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  ${viewport ? '<meta name="viewport" content="width=device-width, initial-scale=1">' : ""}
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${canonical}
  ${og}
  ${twitter}
  ${sd}
</head>
<body>
  ${h1}
  ${img}
</body>
</html>`;
}

describe("seo-analyzer", () => {
  it("scores 100 for perfect HTML", () => {
    const html = buildHTML();
    const report = analyzeHTML(html, "https://example.com");
    expect(report.score).toBe(100);
    expect(report.summary.errors).toBe(0);
    expect(report.summary.warnings).toBe(0);
    expect(report.summary.infos).toBe(0);
  });

  it("detects missing title", () => {
    const html = buildHTML({ title: "" });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("Missing <title>"))).toBe(true);
    expect(report.summary.errors).toBeGreaterThan(0);
  });

  it("detects short title", () => {
    const html = buildHTML({ title: "Short" });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("Title too short"))).toBe(true);
  });

  it("detects long title", () => {
    const html = buildHTML({ title: "A".repeat(65) });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("Title too long"))).toBe(true);
  });

  it("detects missing description", () => {
    const html = buildHTML({ description: "" });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("Missing <meta name='description'>"))).toBe(true);
  });

  it("detects short description", () => {
    const html = buildHTML({ description: "Too short" });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("Meta description too short"))).toBe(true);
  });

  it("detects missing h1", () => {
    const html = buildHTML({ h1: "" });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("Missing <h1>"))).toBe(true);
  });

  it("detects multiple h1", () => {
    const html = buildHTML({ h1: "<h1>First</h1><h1>Second</h1>" });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("Multiple <h1>"))).toBe(true);
  });

  it("detects missing canonical as info", () => {
    const html = buildHTML({ canonical: "" });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("No canonical URL"))).toBe(true);
    expect(report.issues.find((i) => i.message.includes("No canonical URL"))?.type).toBe("info");
  });

  it("detects images without alt text", () => {
    const html = buildHTML({ img: '<img src="img.jpg" alt="">' });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("images without alt text"))).toBe(true);
  });

  it("ignores images with valid alt text", () => {
    const html = buildHTML({ img: '<img src="img.jpg" alt="Valid description">' });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("images without alt text"))).toBe(false);
  });

  it("detects missing viewport", () => {
    const html = buildHTML({ viewport: false });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("Missing viewport"))).toBe(true);
  });

  it("detects missing lang attribute", () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Test</title><meta name="description" content="Test description"></head>
<body><h1>Test</h1></body>
</html>`;
    const report = analyzeHTML(html, "https://example.com");
    expect(report.issues.some((i) => i.message.includes("Missing lang"))).toBe(true);
  });

  it("penalizes errors more than warnings", () => {
    const html = buildHTML({ title: "", h1: "" }); // 2 errors
    const report = analyzeHTML(html, "https://example.com");
    expect(report.score).toBeLessThan(100);
    expect(report.score).toBe(70); // 100 - 2*15 = 70
  });

  it("clamps score to 0 minimum", () => {
    const html = buildHTML({ title: "", h1: "", description: "", lang: "", viewport: false });
    const report = analyzeHTML(html, "https://example.com");
    expect(report.score).toBeLessThan(60); // Multiple errors should heavily penalize
  });
});
