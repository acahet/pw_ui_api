import * as Config from '@config';
import { createToken } from '@helpers/createToken';
import { Homepage } from '@pages/Homepage';
import { test as base } from '@playwright/test';
import { endpoints, httpStatus } from '@utils/constants';
import { setCustomExpectLogger } from '@utils/custom-expect';
import { APILogger } from '@utils/logger';
import { RequestHandler } from '@utils/request-handler';
import { validateSchema } from '@utils/schema-validator';

export interface WorkerFixture {
  authToken: string;
}
export interface TestOptions {
  api: RequestHandler;
  homePage: Homepage;
  config: Awaited<typeof Config>;
  httpStatus: typeof httpStatus;
  endpoints: typeof endpoints;
  validateSchema: typeof validateSchema;
}

export const test = base.extend<TestOptions, WorkerFixture>({
  authToken: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const authToken = await createToken(
        Config.apiConfig.userEmail,
        Config.apiConfig.userPassword,
      );
      await use(authToken);
    },

    { scope: 'worker' },
  ],
  api: async ({ request, authToken, config }, use) => {
    const logger = new APILogger();
    setCustomExpectLogger(logger);

    const requestHandler = new RequestHandler(
      request,
      config.apiConfig.apiUrl,
      logger,
      authToken,
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
  validateSchema: async ({}, use) => {
    await use(validateSchema);
  },
  httpStatus,
  endpoints,
});
