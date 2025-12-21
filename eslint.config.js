import tsParser from '@typescript-eslint/parser';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ESLint v8-compatible helpers (avoid importing 'eslint/config')
const defineConfig = (config) => config;
const globalIgnores = (patterns) => ({ ignores: patterns });

const { node, jest } = globals;

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    ...compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ),
    {
        languageOptions: {
            parser: tsParser,
            sourceType: 'module',

            parserOptions: {
                project:
                    '/home/roznik/repositories/politicky-kompas-backend/tsconfig.base.json',
            },

            globals: {
                ...node,
                ...jest,
            },
        },

        plugins: {
            '@typescript-eslint': typescriptEslintEslintPlugin,
        },

        rules: {
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            indent: 'off',
            'linebreak-style': 'off',
            'prettier/prettier': 'warn',
        },
    },
    globalIgnores(['**/.eslintrc.js']),
]);
