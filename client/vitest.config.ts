import { defineConfig } from "vitest/config"

// Test runner config. The app is still built by react-scripts (CRA); Vitest
// only replaces CRA's Jest setup. See REFACTORING_PLAN.md step 0.2.
export default defineConfig({
    esbuild: {
        jsx: "automatic",
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/setupTests.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
        css: false,
        coverage: {
            provider: "v8",
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "src/__tests__/**",
                "src/test/**",
                "src/utils/mathquill.min.js", // vendored library
                "src/utils/testValues.ts", // unused fixture, deleted in step 1.2
                "src/reportWebVitals.ts",
            ],
            reporter: ["text", "lcov", "cobertura"],
        },
    },
})
