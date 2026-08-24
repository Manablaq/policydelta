import {
  defineConfig,
  globalIgnores,
} from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Next.js generated files
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Dependency / coverage outputs
    "node_modules/**",
    "coverage/**",

    // Playwright generated outputs
    "playwright-report/**",
    "test-results/**",
    "artifacts/browser-qa/**",
  ]),
]);

export default eslintConfig;
