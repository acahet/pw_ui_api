import { Endpoint, HttpStatusCode } from '@config';

/**
 * HTTP status codes used across API tests.
 * Uses `satisfies` to enforce type safety without losing literal inference.
 */
export const httpStatus = {
  Status200_Ok: 200,
  Status201_Created: 201,
  Status403_Forbidden: 403,
  Status204_No_Content: 204,
  Status422_Unprocessable_Content: 422,
} satisfies HttpStatusCode;

/**
 * Centralized API endpoints.
 * Strongly typed and immutable.
 */
export const endpoints = {
  user: 'api/user',
  users: 'api/users',
  tags: 'api/tags',
  login: 'api/users/login',
  postArticle: 'api/articles',
  articles: 'api/articles',

  updateDeleteArticle: (slug: string) => `api/articles/${slug}`,
  profiles: (username: string) => `api/profiles/${username}`,
} satisfies Endpoint;
