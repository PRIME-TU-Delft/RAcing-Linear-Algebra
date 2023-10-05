module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        jest: true,
        mongo: true,
        node: true,
    },
    extends: "prettier",
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
    },
    plugins: ["@typescript-eslint"],
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
                "@typescript-eslint/no-floating-promises": ["warn"],
                "@typescript-eslint/consistent-type-imports": ["warn"],
                "@typescript-eslint/strict-boolean-expressions": ["warn"],
                "@typescript-eslint/triple-slash-reference": ["warn"],
                "@typescript-eslint/require-await": ["warn"],

                "@typescript-eslint/no-unsafe-assignment": ["off"],
                "@typescript-eslint/no-unsafe-member-access": ["off"],
                "@typescript-eslint/no-unsafe-call": ["off"],
                "@typescript-eslint/no-explicit-any": ["off"],
                "@typescript-eslint/no-var-requires": ["off"],
                "@typescript-eslint/explicit-function-return-type": ["off"],
                "@typescript-eslint/no-unsafe-argument": ["off"],
                "@typescript-eslint/no-misused-promises": ["off"],
                "@typescript-eslint/no-unsafe-return": ["off"],
                "@typescript-eslint/no-misused-promises": ["off"],
                "@typescript-eslint/unbound-method": ["off"],
            },
        },
    ],
    rules: {
        "prefer-const": ["warn"],
        "explicit-function-return-type": ["off"],
        "no-floating-promises": ["off"],
        "consistent-type-imports": ["off"],
        "strict-boolean-expressions": ["off"],
        "triple-slash-reference": ["off"],
        "no-var-requires": ["off"],
    },
}
