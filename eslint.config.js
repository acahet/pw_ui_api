import js from "@eslint/js";
import playwright from "eslint-plugin-playwright";
import tseslint from "typescript-eslint";

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["tests/**/*.ts"],
		...playwright.configs["flat/recommended"],
		rules: {
			...playwright.configs["flat/recommended"].rules,
			// Playwright-specific rules
			"playwright/no-wait-for-timeout": "warn",
			"playwright/no-element-handle": "error",
			"playwright/no-eval": "error",
			"playwright/no-focused-test": "error",
			"playwright/no-skipped-test": "warn",
			"playwright/missing-playwright-await": "error",
			"playwright/no-page-pause": "warn",
			"playwright/prefer-web-first-assertions": "error",
			"playwright/prefer-to-have-length": "warn",
			"playwright/no-useless-await": "error",
			"playwright/no-conditional-in-test": "warn",
			"playwright/no-conditional-expect": "warn",
			// TypeScript overrides for test files
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_" },
			],
		},
	},
	{
		ignores: [
			"node_modules/**",
			"playwright-report/**",
			"test-results/**",
			"dist/**",
			"build/**",
			"coverage/**",
			".eslintcache",
		],
	},
];
