import { endpoint, httpStatusCode } from '@config';

export const httpStatus: httpStatusCode = {
    Status200_Ok: 200,
    Status201_Created: 201,
    Status204_No_Content: 204,
};

export const endpoints: endpoint = {
    // users: '/api/users',
    tags: `/api/tags`,
    login: `/api/users/login`,
    postArticle: `/api/articles`,
    articles: `/api/articles`,
    updateDeleteArticle: (slug: string) => `/api/articles/${slug}`,
};