import { test } from '@fixtures';
import { expect } from '@playwright/test';

test.describe(
  'Feature: Tags API',
  {
    annotation: {
      type: 'api-tags',
      description: 'Tests for the Tags API endpoints',
    },
    tag: ['@tags'],
  },
  () => {
    test('GET tags', async ({ api, endpoints, httpStatus }) => {
      const tagsResponse = await api
        .path(endpoints.tags)
        .getRequest(httpStatus.Status200_Ok);
      expect(tagsResponse).toHaveProperty('tags');
      expect(tagsResponse.tags.length).toBeGreaterThan(0);
      expect(tagsResponse.tags.length).toBeLessThanOrEqual(10);
    });
  },
);
