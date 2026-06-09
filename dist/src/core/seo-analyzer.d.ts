export interface SEOIssue {
    type: "error" | "warn" | "info";
    category: string;
    message: string;
    location?: string;
    suggestion: string;
}
export interface SEOReport {
    url: string;
    score: number;
    issues: SEOIssue[];
    summary: {
        errors: number;
        warnings: number;
        infos: number;
    };
}
export declare function analyzeHTML(html: string, url: string): SEOReport;
//# sourceMappingURL=seo-analyzer.d.ts.map