import { Endpoint, HttpStatusCode } from '@config';

export const httpStatus: HttpStatusCode = {
  Status200_Ok: 200,
  Status201_Created: 201,
  Status204_No_Content: 204,
  Status422_Unprocessable_Content: 422,
};

export const endpoints: Endpoint = {
  user: 'api/user',
  users: 'api/users',
  tags: 'api/tags',
  login: 'api/users/login',
  postArticle: 'api/articles',
  articles: 'api/articles',
  updateDeleteArticle: (slug: string) => `api/articles/${slug}`,
};
