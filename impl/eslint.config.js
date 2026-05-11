import globals from "globals";
import tseslint from "typescript-eslint";
import strictConfig from './projects/xyna/src/app/zeta/lint/config/strict/eslint.config.js';
import typescriptParser from '@typescript-eslint/parser';
import stylistic from '@stylistic/eslint-plugin';
import angularPlugin from '@angular-eslint/eslint-plugin';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import zetaPlugin from 'eslint-plugin-zeta';
import path from 'node:path';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,ts}"]
  },
  {
    languageOptions: {
      parser: typescriptParser,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: path.resolve(__dirname)
      }
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
