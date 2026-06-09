import type { SyntaraAstroSeoOptions } from "./types.js";
import type { AstroRouteSetupParams } from "./astro-types.js";

export function createSeoHook(
  routeParams: AstroRouteSetupParams,
  options: SyntaraAstroSeoOptions,
): void {
  const { route, logger } = routeParams;

  if (options.autoAlt && options.autoAlt !== "off") {
    if (!route.component.includes("astro")) {
      if (options.autoAlt === "error") {
        throw new Error(
          `@syntara/astro: Image without alt text detected in ${route.component}`,
        );
      }
      logger.warn(
        `@syntara/astro: Verify alt text in images for ${route.component}`,
      );
    }
  }

  logger.info(
    `@syntara/astro: Route setup for ${route.component}`,
  );
}
