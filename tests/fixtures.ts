import * as Config from '@config';
import { Homepage } from '@pages/Homepage';
import { test as base } from '@playwright/test';

export const test = base.extend<{
  homePage: Homepage;
  config: Awaited<typeof Config>;
}>({
  homePage: async ({ page }, use) => {
    const homepage = new Homepage(page);
    await use(homepage);
  },
  // eslint-disable-next-line no-empty-pattern
  config: async ({}, use) => {
    const config = Config;
    await use(config);
  },
});
