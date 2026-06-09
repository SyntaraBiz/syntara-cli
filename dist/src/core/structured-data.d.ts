export type SchemaType = "Organization" | "LocalBusiness" | "WebSite" | "BreadcrumbList" | "Article" | "BlogPosting" | "Product" | "FAQPage" | "Review" | "Event" | "HowTo" | "Person" | "VideoObject" | "Recipe" | "JobPosting";
export interface StructuredDataOptions {
    type: SchemaType;
    data: Record<string, unknown>;
    context?: string;
}
export declare function generateStructuredData(type: SchemaType, data: Record<string, unknown>, context?: string): string;
export declare function generateOrganizationSD(name: string, url: string, logo?: string, sameAs?: string[]): string;
export declare function generateBreadcrumbSD(items: {
    name: string;
    url: string;
}[]): string;
export declare function generateWebSiteSD(name: string, url: string, searchUrl?: string): string;
export declare function generateFAQSD(questions: {
    question: string;
    answer: string;
}[]): string;
export declare function generateProductSD(data: {
    name: string;
    description: string;
    image?: string;
    price?: string;
    currency?: string;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
    url?: string;
}): string;
export declare function generateArticleSD(data: {
    headline: string;
    description?: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    authorName?: string;
    publisherName?: string;
}): string;
//# sourceMappingURL=structured-data.d.ts.map