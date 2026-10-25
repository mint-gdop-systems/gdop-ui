import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: ["src/components/ui/", "public/r"],
  printWidth: 80,
  singleQuote: false,
  sortImports: true,
  sortPackageJson: {
    sortScripts: true,
  },
  sortTailwindcss: true,
});
