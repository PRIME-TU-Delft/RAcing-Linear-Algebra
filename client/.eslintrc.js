module.exports = {
    env: {
        amd: true,
        browser: true,
        commonjs: true,
        es2021: true,
        jest: true,
    },
    settings: {
        react: {
            version: "detect",
        },
    },
    extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "prettier",
    ],
    parserOptions: {
        ecmaVersion: "latest",
    },
    parser: "@typescript-eslint/parser",
    plugins: ["react", "react-hooks", "@typescript-eslint"],
    overrides: [
        {
            files: ["*.ts", "*.tsx"], // TypeScript file extensions
            // Extend TypeScript plugins here, instead of extending them outside the `overrides`.
            // If we don't want to extend any rules, we don't need an `extends` attribute.
            extends: [
                "plugin:@typescript-eslint/recommended",
                "plugin:@typescript-eslint/recommended-requiring-type-checking",
            ],
            parserOptions: {
                project: "./tsconfig.json", // Specify it only for TypeScript files
                tsconfigRootDir: __dirname,
            },
            rules: {
                "@typescript-eslint/explicit-function-return-type": ["off"],
                "@typescript-eslint/no-floating-promises": ["off"],
                "@typescript-eslint/consistent-type-imports": ["off"],
                "@typescript-eslint/strict-boolean-expressions": ["off"],
                "@typescript-eslint/triple-slash-reference": ["off"],
                "@typescript-eslint/no-var-requires": ["off"],
                "@typescript-eslint/no-unused-vars": ["warn"],
                "@typescript-eslint/no-unsafe-argument": ["off"],
                "@typescript-eslint/no-unsafe-member-access": ["off"],
                "@typescript-eslint/no-unsafe-call": ["off"],
                "@typescript-eslint/no-unsafe-assignment": ["off"],
                "@typescript-eslint/no-explicit-any": ["off"],
                "@typescript-eslint/no-misused-promises": ["off"],
                "@typescript-eslint/no-empty-function": ["off"],
                // TODO(REFACTORING_PLAN step 1.1): existing violations; fix them and set back to "error"
                "@typescript-eslint/no-loss-of-precision": ["warn"],
                "@typescript-eslint/restrict-plus-operands": ["warn"],
                "@typescript-eslint/restrict-template-expressions": ["warn"],
                "prefer-const": ["warn"],
            },
        },
    ],
    rules: {
        "explicit-function-return-type": ["off"],
        "no-floating-promises": ["off"],
        "consistent-type-imports": ["off"],
        "strict-boolean-expressions": ["off"],
        "triple-slash-reference": ["off"],
        "prefer-const": ["warn"],
        // TODO(REFACTORING_PLAN step 1.1): existing violations; fix them and set back to "error"
        "react/no-unescaped-entities": ["warn"],
        "react-hooks/rules-of-hooks": ["warn"],
        "no-var-requires": ["off"],
        "react-hooks/exhaustive-deps": ["warn"],
    },
}
