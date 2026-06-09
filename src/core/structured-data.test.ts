import { describe, it, expect } from "vitest";
import {
  generateStructuredData,
  generateOrganizationSD,
  generateBreadcrumbSD,
  generateWebSiteSD,
  generateFAQSD,
  generateProductSD,
  generateArticleSD,
} from "./structured-data.js";

describe("structured-data", () => {
  it("generates Organization schema", () => {
    const result = generateOrganizationSD("Syntara", "https://syntara.com");
    const parsed = JSON.parse(result);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("Organization");
    expect(parsed.name).toBe("Syntara");
    expect(parsed.url).toBe("https://syntara.com");
  });

  it("generates Organization with logo and sameAs", () => {
    const result = generateOrganizationSD(
      "Syntara",
      "https://syntara.com",
      "https://syntara.com/logo.png",
      ["https://twitter.com/syntara", "https://github.com/syntara"],
    );
    const parsed = JSON.parse(result);
    expect(parsed.logo).toBe("https://syntara.com/logo.png");
    expect(parsed.sameAs).toEqual(["https://twitter.com/syntara", "https://github.com/syntara"]);
  });

  it("generates BreadcrumbList", () => {
    const result = generateBreadcrumbSD([
      { name: "Home", url: "https://example.com" },
      { name: "Products", url: "https://example.com/products" },
    ]);
    const parsed = JSON.parse(result);
    expect(parsed["@type"]).toBe("BreadcrumbList");
    expect(parsed.itemListElement).toHaveLength(2);
    expect(parsed.itemListElement[0].position).toBe(1);
    expect(parsed.itemListElement[1].position).toBe(2);
  });

  it("generates WebSite with search action", () => {
    const result = generateWebSiteSD(
      "My Site",
      "https://example.com",
      "https://example.com/search?q={search_term_string}",
    );
    const parsed = JSON.parse(result);
    expect(parsed["@type"]).toBe("WebSite");
    expect(parsed.potentialAction["@type"]).toBe("SearchAction");
  });

  it("generates FAQPage", () => {
    const result = generateFAQSD([
      { question: "What is this?", answer: "A test" },
    ]);
    const parsed = JSON.parse(result);
    expect(parsed["@type"]).toBe("FAQPage");
    expect(parsed.mainEntity).toHaveLength(1);
    expect(parsed.mainEntity[0].name).toBe("What is this?");
  });

  it("generates Product with offers", () => {
    const result = generateProductSD({
      name: "Widget",
      description: "A great widget",
      image: "https://example.com/widget.jpg",
      price: "29.99",
      currency: "USD",
      availability: "InStock",
    });
    const parsed = JSON.parse(result);
    expect(parsed["@type"]).toBe("Product");
    expect(parsed.offers["@type"]).toBe("Offer");
    expect(parsed.offers.price).toBe("29.99");
  });

  it("generates Article with author and publisher", () => {
    const result = generateArticleSD({
      headline: "Test Article",
      authorName: "John Doe",
      publisherName: "Syntara News",
      datePublished: "2024-01-01",
    });
    const parsed = JSON.parse(result);
    expect(parsed["@type"]).toBe("Article");
    expect(parsed.author.name).toBe("John Doe");
    expect(parsed.publisher.name).toBe("Syntara News");
  });

  it("generates generic structured data", () => {
    const result = generateStructuredData("Person", { name: "John", jobTitle: "Developer" });
    const parsed = JSON.parse(result);
    expect(parsed["@type"]).toBe("Person");
    expect(parsed.name).toBe("John");
  });
});
