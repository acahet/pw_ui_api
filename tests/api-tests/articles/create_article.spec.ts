import { test } from "@fixtures";
import { expect } from "@utils/custom-expect";
import { getNewRandomArticle } from "@utils/data-generator";

test.describe(
	"Feature: Articles API",
	{
		annotation: {
			type: "api-articles",
			description: "Tests for the Articles API endpoints",
		},
		tag: ["@articles"],
	},
	() => {
		test("CREATE and DELETE Article", async ({
			api,
			endpoints,
			httpStatus,
		}) => {
			const articleRequestPayload = getNewRandomArticle();
			const newArticlesResponse = await api
				.path(endpoints.articles)
				.body(articleRequestPayload)
				.post(httpStatus.Status201_Created);
			await expect(newArticlesResponse).shouldMatchSchema(
				"articles",
				"POST_articles",
			);
			const articleSlug: string = newArticlesResponse.article.slug;
			expect(newArticlesResponse).toHaveProperty("article");
			expect(newArticlesResponse.article.title).shouldBeEqual(
				articleRequestPayload.article.title,
			);

			const articlesResponse = await api
				.path(endpoints.articles)
				.get(httpStatus.Status200_Ok);

			expect(articlesResponse.articles[0].title).shouldBeEqual(
				articleRequestPayload.article.title,
			);

			//DELETE

			const deleteArticleResponse = await api
				.path(endpoints.updateDeleteArticle(articleSlug))
				.delete(httpStatus.Status204_No_Content);
			expect(deleteArticleResponse).toBeUndefined();

			const articlesResponseAfterDelete = await api
				.path(endpoints.articles)
				.params({ limit: 10, offset: 0 })
				.get(httpStatus.Status200_Ok);
			await expect(articlesResponseAfterDelete).shouldMatchSchema(
				"articles",
				"GET_articles",
			);
			expect(
				articlesResponseAfterDelete.articles.some(
					(article: { slug: string }) => article.slug === articleSlug,
				),
			).toBeFalsy();
		});
	},
);
