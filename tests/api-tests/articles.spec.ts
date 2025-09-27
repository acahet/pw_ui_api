import { test } from '@fixtures';
import { APIResponse, expect } from '@playwright/test';

const domain = 'https://conduit-api.bondaracademy.com/';
const articlesPath = 'api/articles';
const articlesParam = '?limit=10&offset=0';
const loginPath = 'api/users/login';

test.describe('Feature: Articles API', () => {
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
  test('CREATE, READ, UPDATE, DELETE Article', async ({ request }) => {
    //GET TOKEN
    const loginResponse = await request.post(`${domain}/${loginPath}`, {
      data: {
        user: {
          email: process.env.EMAIL as string,
          password: process.env.PASSWORD as string,
        },
      },
    });
    const tokenJSON = await loginResponse.json();
    const authToken = 'Token ' + tokenJSON.user.token;
    //CREATE ARTICLE
    const newArticle = {
      article: {
        title: 'New Article Title PW AC',
        description: 'New Article Description  PW AC',
        body: 'This is the body of the new article.  PW AC',
        tagList: [],
      },
    };

    const newArticlesResponse: APIResponse = await request.post(
      `${domain}/${articlesPath}`,
      {
        data: newArticle,
        headers: {
          Authorization: authToken,
        },
      },
    );
    expect(newArticlesResponse.status()).toBe(201);
    const newArticlesResponseBody = await newArticlesResponse.json();
    const articleSlug = newArticlesResponseBody.article.slug;
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
    //READ
    const articlesResponseBody = await articlesResponse.json();
    expect(articlesResponseBody.articles[0].title).toBe(
      newArticle.article.title,
    );
    expect(articlesResponseBody.articles[0].description).toBe(
      newArticle.article.description,
    );
    expect(articlesResponseBody.articles[0].body).toBe(newArticle.article.body);

    //UPDATE
    const updateArticleResponse = await request.put(
      `${domain}/${articlesPath}/${articleSlug}`,
      {
        data: {
          article: {
            title: 'Updated Article Title PW AC',
            description: 'Updated Article Description PW AC',
            body: 'This is the updated body of the article. PW AC',
          },
        },
        headers: {
          Authorization: authToken,
        },
      },
    );
    expect(updateArticleResponse.status()).toBe(200);
    const updateArticleResponseJSON = await updateArticleResponse.json();
    const articleSlugUpdated = updateArticleResponseJSON.article.slug;
    expect(updateArticleResponseJSON.article.title).toBe(
      'Updated Article Title PW AC',
    );

    //DELETE

    const deleteArticleResponse: APIResponse = await request.delete(
      `${domain}/${articlesPath}/${articleSlugUpdated}`,
      {
        headers: {
          Authorization: authToken,
        },
      },
    );
    expect(deleteArticleResponse.status()).toBe(204);

    const articlesResponseAfterDelete: APIResponse = await request.get(
      `${domain}/${articlesPath}${articlesParam}`,
      {
        headers: {
          Authorization: authToken,
        },
      },
    );
    expect(articlesResponseAfterDelete.status()).toBe(200);
    const articlesResponseBodyAfterDelete =
      await articlesResponseAfterDelete.json();
    expect(
      articlesResponseBodyAfterDelete.articles.some(
        (article: { slug: string }) => article.slug === articleSlug,
      ),
    ).toBeFalsy();
  });
});
