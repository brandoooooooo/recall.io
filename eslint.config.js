// import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import parser from "@typescript-eslint/parser";
import airbnb from "eslint-config-airbnb";
import airbnbts from "eslint-config-airbnb-typescript";
import prettier from "eslint-config-prettier";

export default [
  // js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["dist", "node_modules", ".eslintrc.cjs"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: parser,
      // parserOptions: {
      //   project: ["./tsconfig.json"],
      //   ecmaFeatures: {
      //     jsx: true,
      //   },
      //   ecmaVersion: 12,
      //   sourceType: "module",
      // },
    },
    plugins: {
      react: react,
      tseslint: tseslint,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...airbnb.rules,
      ...airbnbts.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
];
