import globals from "globals";
import tseslint from "typescript-eslint";
import strictConfig from './projects/xyna/src/app/zeta/lint/config/strict/eslint.config.js';
import typescriptParser from '@typescript-eslint/parser';
import stylistic from '@stylistic/eslint-plugin';
import angularPlugin from '@angular-eslint/eslint-plugin';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import zetaPlugin from 'eslint-plugin-zeta';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,ts}"]
  },
  {
    languageOptions: {
      parser: typescriptParser,
      globals: globals.browser
    },
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.min.js'
    ],
    plugins: {
      stylistic,
      '@angular-eslint': angularPlugin,
      '@typescript-eslint': typescriptPlugin,
      import: importPlugin,
      zeta: zetaPlugin
    },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      ...strictConfig.rules
    }
  }
];

// import globals from "globals";
// import js from "@eslint/js";
// import tseslint from "typescript-eslint";
// import stylistic from "@stylistic/eslint-plugin";
// import angularPlugin from "@angular-eslint/eslint-plugin";
// import typescriptPlugin from "@typescript-eslint/eslint-plugin";
// import importPlugin from "eslint-plugin-import";
// import zetaPlugin from "eslint-plugin-zeta";
// import typescriptParser from "@typescript-eslint/parser";

// // strikte Regeln als reines JS-Objekt exportieren!
// // ⚠️ keine TypeScript Parser-Infos in strictConfig importieren
// import { rules as strictRules } from "./projects/xyna/src/app/zeta/lint/config/strict/eslint.config.js";



// /** @type {import("eslint").FlatConfigArray} */
// export default [

//   //
//   // 0) Immer ignorieren: alle Lint-Configs und zeta-Ordner
//   //
//   {
//     ignores: [
//       "projects/xyna/src/app/zeta/eslint.config.js",
//       "projects/xyna/src/app/zeta/lint/**/*",
//       "**/*.config.js",
//       "**/*.config.cjs",
//       "**/*.config.mjs",
//       "**/node_modules/**",
//       "**/dist/**"
//     ]
//   },

//   //
//   // 1) JavaScript
//   //
//   {
//     files: ["**/*.js"],
//     languageOptions: {
//       ecmaVersion: "latest",
//       sourceType: "module",
//       globals: globals.browser,
//     },
//     plugins: {},
//     rules: {
//       ...js.configs.recommended.rules,
//     },
//   },

//   //
//   // 2) TypeScript – ohne Type-Checking (Basic Recommended)
//   //
//   ...tseslint.configs.recommended.map(c => ({
//     ...c,
//     ignores: [
//       "**/node_modules/**",
//       "**/dist/**",
//       "**/*.config.js",
//       "**/*.config.cjs",
//       "**/*.config.mjs",
//     ],
//   })),
//   ...tseslint.configs.strictTypeChecked.map(c => ({ ...c })),
//   ...tseslint.configs.stylisticTypeChecked.map(c => ({ ...c })),
//   //
//   // 3) TypeScript – mit Type-Checking
//   //
//   {
//     files: ["**/*.ts"],
//     languageOptions: {
//       parser: typescriptParser,
//       parserOptions: {
//         project: true,
//         tsconfigRootDir: import.meta.dirname,
//       },
//       globals: globals.browser,
//     },

//     plugins: {
//       "@angular-eslint": angularPlugin,
//       "@typescript-eslint": typescriptPlugin,
//       stylistic,
//       import: importPlugin,
//       zeta: zetaPlugin,
//     },

//     rules: {
//       ...strictRules, // nur reine JS-Regeln, keine Type-Check-Regeln hier
//       "@typescript-eslint/no-explicit-any": "off",
//       "@typescript-eslint/no-unused-vars": "off",
//       // '@typescript-eslint/await-thenable': 'off',
//       // '@typescript-eslint/no-array-delete': 'off',
//       // '@typescript-eslint/no-base-to-string': 'off',
//       // '@typescript-eslint/no-unnecessary-condition': 'off',
//       // '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
//       // '@typescript-eslint/prefer-nullish-coalescing': 'off',
//     },
//   },

//   //
//   // 4) TypeScript zusätzliche Stylistic / Strict Type-Check Regeln sauber einbetten
//   //
//   // ...tseslint.configs.strictTypeChecked.map(c => ({ ...c })),
//   // ...tseslint.configs.stylisticTypeChecked.map(c => ({ ...c })),
// ];
