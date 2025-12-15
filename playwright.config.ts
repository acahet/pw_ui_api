import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });



/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    // ['html', { outputFolder: './tests/report/playwright-report' }],
    ['list'], // Change to your desired report directory
    ['allure-playwright']
    // Add other reporters if needed
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    trace: 'retain-on-failure',
    baseURL: 'https://conduit.bondaracademy.com'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'ui-tests',
      use: {
        screenshot: 'only-on-failure',
        defaultBrowserType: 'chromium'
      },
      testDir: './tests/ui-tests',
      outputDir: './tests/report/test-results/ui-tests',
      fullyParallel: true,
      workers: process.env.CI ? 2 : 1
    },
    /**
     * uncomment below if you want to have an PW-API project
     */
    {
      name: 'api-tests',
      testDir: './tests/api-tests',
      workers: 1,
      outputDir: './tests/report/test-results/api-tests'
    },

  ],
});
