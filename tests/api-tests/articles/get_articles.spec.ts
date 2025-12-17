import { test } from '@fixtures';
import { expect } from '@utils/custom-expect';

test.describe(
	'Feature: Articles API',
	{
		annotation: {
			type: 'api-articles',
			description: 'Tests for the Articles API endpoints',
		},
		tag: ['@articles'],
	},
	() => {
		test('GET Articles', async ({
			api,
			endpoints,
			httpStatus: { Status200_Ok },
		}) => {
			const articlesResponse = await api
				.path(endpoints.articles)
				.params({ limit: 10, offset: 0 })
				.withoutAuth()
				.getRequest(Status200_Ok);
			await expect(articlesResponse).shouldMatchSchema(
				'articles',
				'GET_articles'
			);
			expect(articlesResponse.articles.length).shouldBeLessThanOrEqual(
				10
			);
			expect(articlesResponse.articlesCount).shouldBeEqual(10);
		});
	}
);
