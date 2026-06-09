export type SchemaType =
  | "Organization"
  | "LocalBusiness"
  | "WebSite"
  | "BreadcrumbList"
  | "Article"
  | "BlogPosting"
  | "Product"
  | "FAQPage"
  | "Review"
  | "Event"
  | "HowTo"
  | "Person"
  | "VideoObject"
  | "Recipe"
  | "JobPosting";

export interface StructuredDataOptions {
  type: SchemaType;
  data: Record<string, unknown>;
  context?: string;
}

export function generateStructuredData(
  type: SchemaType,
  data: Record<string, unknown>,
  context = "https://schema.org",
): string {
  const schema = {
    "@context": context,
    "@type": type,
    ...data,
  };

  return JSON.stringify(schema, null, 2);
}

export function generateOrganizationSD(
  name: string,
  url: string,
  logo?: string,
  sameAs?: string[],
): string {
  const data: Record<string, unknown> = { name, url };
  if (logo) data["logo"] = logo;
  if (sameAs) data["sameAs"] = sameAs;
  return generateStructuredData("Organization", data);
}

export function generateBreadcrumbSD(
  items: { name: string; url: string }[],
): string {
  return generateStructuredData("BreadcrumbList", {
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export function generateWebSiteSD(
  name: string,
  url: string,
  searchUrl?: string,
): string {
  const data: Record<string, unknown> = { name, url };
  if (searchUrl) {
    data["potentialAction"] = {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: searchUrl },
      "query-input": "required name=search_term_string",
    };
  }
  return generateStructuredData("WebSite", data);
}

export function generateFAQSD(
  questions: { question: string; answer: string }[],
): string {
  return generateStructuredData("FAQPage", {
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  });
}

export function generateProductSD(data: {
  name: string;
  description: string;
  image?: string;
  price?: string;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  url?: string;
}): string {
  const schemaData: Record<string, unknown> = {
    name: data.name,
    description: data.description,
  };

  if (data.image) schemaData["image"] = data.image;
  if (data.url) schemaData["url"] = data.url;

  if (data.price) {
    schemaData["offers"] = {
      "@type": "Offer",
      price: data.price,
      priceCurrency: data.currency ?? "USD",
      availability: `https://schema.org/${data.availability ?? "InStock"}`,
    };
  }

  return generateStructuredData("Product", schemaData);
}

export function generateArticleSD(data: {
  headline: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  publisherName?: string;
}): string {
  const schemaData: Record<string, unknown> = {
    headline: data.headline,
  };

  if (data.description) schemaData["description"] = data.description;
  if (data.image) schemaData["image"] = data.image;
  if (data.datePublished) schemaData["datePublished"] = data.datePublished;
  if (data.dateModified) schemaData["dateModified"] = data.dateModified;

  if (data.authorName) {
    schemaData["author"] = {
      "@type": "Person",
      name: data.authorName,
    };
  }

  if (data.publisherName) {
    schemaData["publisher"] = {
      "@type": "Organization",
      name: data.publisherName,
    };
  }

  return generateStructuredData("Article", schemaData);
}
