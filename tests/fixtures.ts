import * as Config from '@config';
import { Homepage } from '@pages/Homepage';
import { test as base } from '@playwright/test';
import { APILogger } from '@utils/logger';
import { RequestHandler } from '@utils/request-handler';

export const test = base.extend<{
  api: RequestHandler;
  homePage: Homepage;
  config: Awaited<typeof Config>;
}>({
  api: async ({ request }, use) => {
    const logger = new APILogger();
    // setCustomExpectLogger(logger);
    const requestHandler = new RequestHandler(
      request,
      'https://conduit-api.bondaracademy.com/', // config.apiUrl as string,
      logger,
      // authToken
    );
    await use(requestHandler);
  },
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
