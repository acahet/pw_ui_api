import { apiConfig } from '@config';
import { request } from '@playwright/test';
import { endpoints, httpStatus } from '@utils/constants';
import { APILogger } from '@utils/logger';
import { RequestHandler } from '@utils/request-handler';

export async function createToken(email: string, password: string) {
  const context = await request.newContext();
  const logger = new APILogger();
  const api = new RequestHandler(context, apiConfig.apiUrl, logger);
  try {
    const tokenResponse = await api
      .path(endpoints.login)
      .body({
        user: {
          email: email,
          password: password,
        },
      })
      .postRequest(httpStatus.Status200_Ok);
    return 'Token ' + tokenResponse.user.token;
  } catch (error) {
    Error.captureStackTrace(error, createToken);
    throw error;
  } finally {
    await context.dispose();
  }
}
