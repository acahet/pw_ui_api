import { test } from '@fixtures';
import { expect } from '@utils/custom-expect';

test.describe(
	'Feature: User Articles API',
	{
		annotation: {
			type: 'api-user-articles',
			description: 'Tests for the Logged user Articles API endpoints',
		},
		tag: ['@user', '@articles'],
	},
	() => {
		test('GET Current User Favorite Articles', async ({
			api,
			endpoints,
			httpStatus: { Status200_Ok },
		}) => {
		const currentUser = await api
				.path(endpoints.user)
				.getRequest(Status200_Ok);

			const articlesResponse = await api
				.path(endpoints.articles)
				.withoutAuth()
				.params({
					favorited: currentUser.user.username,
					limit: 10,
					offset: 0,
				})
				.getRequest(Status200_Ok);
			await expect(articlesResponse).shouldMatchSchema(
				'articles',
				'GET_articles_favorite'
			);
			expect(articlesResponse.articlesCount).shouldBeEqual(0);
		});

		test('GET Current User Articles', async ({
			api,
			endpoints,
			httpStatus: { Status200_Ok },
		}) => {
			const currentUser = await api
				.path(endpoints.user)
				.getRequest(Status200_Ok);

			const articlesResponse = await api
				.path(endpoints.articles)
				.params({
					author: currentUser.user.username,
					limit: 10,
					offset: 0,
				})
				.getRequest(Status200_Ok);
			await expect(articlesResponse).shouldMatchSchema(
				'articles',
				'GET_user_articles'
			);
			expect(articlesResponse.articlesCount).shouldBeEqual(0);
		});
	}
);
