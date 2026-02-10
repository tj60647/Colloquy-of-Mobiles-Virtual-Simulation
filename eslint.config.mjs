import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js', '**/*.mjs'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        HTMLElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        KeyboardEvent: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'warn',

      // TypeScript-specific rules (lenient during migration)
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' during migration
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // General JavaScript rules
      'no-console': 'off', // Allow console.log for debugging
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-undef': 'warn',
    },
  },
  // Test files - add Jest globals
  {
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.js', '**/*.test.ts', '**/*.test.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        beforeAll: 'readonly',
        afterEach: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '**/dist/**',
      'apps/**/dist/**',
      '**/*.min.js',
      'coverage/**',
      'lib/legacy/**', // Legacy JS files - will migrate later
    ],
  },
];
