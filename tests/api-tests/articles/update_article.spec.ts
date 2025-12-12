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
		test("CREATE, UPDATE and DELETE Article", async ({
			api,
			endpoints,
			httpStatus,
		}) => {
			//CREATE ARTICLE
			const articleRequestPayload = getNewRandomArticle();
			const updateArticleRequestPayload = getNewRandomArticle();

			const newArticlesResponse = await api
				.path(endpoints.articles)
				.body(articleRequestPayload)
				.postRequest(httpStatus.Status201_Created);
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
				.params({ limit: 10, offset: 0 })
				.getRequest(httpStatus.Status200_Ok);

			//READ
			expect(articlesResponse.articles[0].title).shouldBeEqual(
				articleRequestPayload.article.title,
			);

			//UPDATE
			const updateArticleResponse = await api
				.path(endpoints.updateDeleteArticle(articleSlug))
				.body(updateArticleRequestPayload)
				.putRequest(httpStatus.Status200_Ok);
			await expect(updateArticleResponse).shouldMatchSchema(
				"articles",
				"PUT_articles",
			);
			const articleSlugUpdated: string = updateArticleResponse.article.slug;
			expect(updateArticleResponse.article.title).shouldBeEqual(
				updateArticleRequestPayload.article.title,
			);

			//DELETE

			const deleteArticleResponse = await api
				.path(endpoints.updateDeleteArticle(articleSlugUpdated))
				.deleteRequest(httpStatus.Status204_No_Content);
			expect(deleteArticleResponse).toBeUndefined();

			//VERIFY DELETION
			const articlesResponseAfterDelete = await api
				.path(endpoints.articles)
				.params({ limit: 10, offset: 0 })
				.getRequest(httpStatus.Status200_Ok);
			await expect(articlesResponseAfterDelete).shouldMatchSchema(
				"articles",
				"GET_articles",
			);
		});
	},
);
