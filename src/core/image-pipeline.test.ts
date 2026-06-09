import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { generateBlurPlaceholder, updateCodeImports } from "./image-pipeline.js";

const TEST_DIR = path.join(process.cwd(), "test-temp");

beforeAll(() => {
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
});

afterAll(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe("image-pipeline", () => {
  describe("generateBlurPlaceholder", () => {
    it("generates a base64 placeholder for a valid image", async () => {
      const sharp = (await import("sharp")).default;
      const testImagePath = path.join(TEST_DIR, "test.png");
      await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1 },
        },
      })
        .png()
        .toFile(testImagePath);

      const result = await generateBlurPlaceholder(testImagePath);

      expect(result.base64).toMatch(/^data:image\/jpeg;base64,/);
      expect(result.width).toBe(100);
      expect(result.height).toBe(100);
    });
  });

  describe("updateCodeImports", () => {
    it("replaces image extensions in code files", () => {
      const testCodeDir = path.join(TEST_DIR, "code");
      fs.mkdirSync(testCodeDir, { recursive: true });

      const testFile = path.join(testCodeDir, "test.ts");
      fs.writeFileSync(
        testFile,
        'import logo from "./logo.png";\nconst bg = "./bg.jpg";\nconst icon = "./icon.jpeg";',
        "utf-8",
      );

      const result = updateCodeImports(testCodeDir);

      expect(result.updated).toBe(1);
      const content = fs.readFileSync(testFile, "utf-8");
      expect(content).toContain("./logo.webp");
      expect(content).toContain("./bg.webp");
      expect(content).toContain("./icon.webp");

      fs.rmSync(testCodeDir, { recursive: true, force: true });
    });

    it("handles astro files", () => {
      const testCodeDir = path.join(TEST_DIR, "astro-code");
      fs.mkdirSync(testCodeDir, { recursive: true });

      const testFile = path.join(testCodeDir, "Hero.astro");
      fs.writeFileSync(
        testFile,
        '<img src="./hero.png" alt="hero" />',
        "utf-8",
      );

      const result = updateCodeImports(testCodeDir);

      expect(result.updated).toBe(1);
      const content = fs.readFileSync(testFile, "utf-8");
      expect(content).toContain("./hero.webp");

      fs.rmSync(testCodeDir, { recursive: true, force: true });
    });
  });
});
