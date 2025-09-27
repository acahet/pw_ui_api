import { test } from '@fixtures';
import { APIResponse, expect } from '@playwright/test';

const domain = 'https://conduit-api.bondaracademy.com/';
const articlesPath = 'api/articles';
const articlesParam = '?limit=10&offset=0';
const loginPath = 'api/users/login';

test.describe('API tests', () => {
  test('GET Articles', async ({ request }) => {
    const articlesResponse: APIResponse = await request.get(
      `${domain}/${articlesPath}${articlesParam}`,
    );
    expect(articlesResponse.status()).toBe(200);
    const articlesResponseBody = await articlesResponse.json();
    expect(articlesResponseBody).toHaveProperty('articles');
    expect(articlesResponseBody).toHaveProperty('articlesCount');
    expect(articlesResponseBody.articles.length).toBeGreaterThan(0);
    expect(articlesResponseBody.articles.length).toBeLessThanOrEqual(10);
  });
  test('POST Article', async ({ request }) => {
    const loginResponse = await request.post(`${domain}/${loginPath}`, {
      data: {
        user: {
          email: !process.env.EMAIL,
          password: !process.env.PASSWORD,
        },
      },
    });
    const tokenJSON = await loginResponse.json();
    const authToken = 'Token ' + tokenJSON.user.token;
    const newArticle = {
      article: {
        title: 'New Article Title',
        description: 'New Article Description',
        body: 'This is the body of the new article.',
        tagList: [],
      },
    };

    const newArticlesResponse: APIResponse = await request.post(
      `${domain}/${articlesPath}`,
      {
        data: newArticle,
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      },
    );
    expect(newArticlesResponse.status()).toBe(201);
    const newArticlesResponseBody = await newArticlesResponse.json();
    expect(newArticlesResponseBody).toHaveProperty('article');
    expect(newArticlesResponseBody.article.title).toBe(
      newArticle.article.title,
    );
    expect(newArticlesResponseBody.article.description).toBe(
      newArticle.article.description,
    );
    expect(newArticlesResponseBody.article.body).toBe(newArticle.article.body);

    const articlesResponse: APIResponse = await request.get(
      `${domain}/${articlesPath}${articlesParam}`,
      {
        headers: {
          Authorization: authToken,
        },
      },
    );
    expect(articlesResponse.status()).toBe(200);
    const articlesResponseBody = await articlesResponse.json();
    expect(articlesResponseBody.articles[0].title).toBe(
      newArticle.article.title,
    );
    expect(articlesResponseBody.articles[0].description).toBe(
      newArticle.article.description,
    );
    expect(articlesResponseBody.articles[0].body).toBe(newArticle.article.body);
  });
});
