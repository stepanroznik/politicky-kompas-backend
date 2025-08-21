import tsParser from "@typescript-eslint/parser";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import globals from 'globals';
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import eslint from "eslint";

const { defineConfig, globalIgnores } = eslint;
const { node, jest } = globals;

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    languageOptions: {
        parser: tsParser,
        sourceType: "module",

        parserOptions: {
            project: "tsconfig.json",
        },

        globals: {
            ...node,
            ...jest,
        },
    },

    plugins: {
        "@typescript-eslint": typescriptEslintEslintPlugin,
    },

    extends: compat.extends("plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"),

    rules: {
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "indent": "off",
        "linebreak-style": "off",
        "prettier/prettier": "warn",
    },
}, globalIgnores(["**/.eslintrc.js"])]);
