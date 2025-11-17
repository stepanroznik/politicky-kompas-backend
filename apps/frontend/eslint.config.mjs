import vue from 'eslint-plugin-vue';
import baseConfig from '../../eslint.config.js';
import tsParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';

export default [
    ...baseConfig,
    ...vue.configs['flat/recommended'],
    // Ensure .vue files are parsed by the TypeScript parser and allowed by ESLint
    {
        files: ['**/*.vue'],
        // Use vue-eslint-parser to correctly parse Vue templates then delegate
        // script parsing to @typescript-eslint/parser via parserOptions.parser
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: ['.vue'],
                // use an ESLint-specific tsconfig that includes .vue files
                project: '/home/roznik/repositories/politicky-kompas-backend/apps/frontend/tsconfig.eslint.json',
            },
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'],
        rules: {
            'vue/multi-word-component-names': 'off',
            'prettier/prettier': 'off',
        },
    },
];
