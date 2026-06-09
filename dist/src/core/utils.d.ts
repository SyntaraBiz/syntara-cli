export declare function getPackageVersion(): string;
export declare function getPackageName(): string;
export interface GlobalOptions {
    verbose: boolean;
    dryRun: boolean;
}
export declare const globalOptions: GlobalOptions;
export declare function logVerbose(...args: unknown[]): void;
export declare function logDryRun(message: string): void;
//# sourceMappingURL=utils.d.ts.map