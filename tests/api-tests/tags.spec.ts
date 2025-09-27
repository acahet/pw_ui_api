import { test } from '@fixtures';
import { expect } from '@playwright/test';

const domain = 'https://conduit-api.bondaracademy.com/';
const tagsPath = 'api/tags';

test.describe('API tests', () => {
  test('Get all tags', async ({ request }) => {
    const tagsResponse = await request.get(`${domain}/${tagsPath}`);
    expect(tagsResponse.status()).toBe(200);
    const tagsResponseBody = await tagsResponse.json();
    expect(tagsResponseBody).toHaveProperty('tags');
    expect(tagsResponseBody.tags.length).toBeGreaterThan(0);
    expect(tagsResponseBody.tags.length).toBeLessThanOrEqual(10);
  });
});
