import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
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
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            '**/*.min.js',
            'coverage/**',
        ],
    },
];
