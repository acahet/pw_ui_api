import { test } from '@fixtures';
import { APIResponse, expect } from '@playwright/test';

const domain = 'https://conduit-api.bondaracademy.com/';
const articlesPath = 'api/articles';
const articlesParam = '?limit=10&offset=0';

test.describe('API tests', () => {
  test('Get all articles', async ({ request }) => {
    const articlesResponse: APIResponse = await request.get(
      `${domain}/${articlesPath}${articlesParam}`,
    );
    expect(articlesResponse.status()).toBe(200);
    const articlesResponseBody = await articlesResponse.json();
    expect(articlesResponseBody).toHaveProperty('articles');
    expect(articlesResponseBody).toHaveProperty('articlesCount');
    expect(articlesResponseBody.articles.length).toBeGreaterThan(0);
  });
});
