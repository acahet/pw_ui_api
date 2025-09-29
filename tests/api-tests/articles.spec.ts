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
    test('GET Articles', async ({ api, endpoints, httpStatus }) => {
      const articlesResponse = await api
        .path(endpoints.articles)
        .params({ limit: 10, offset: 0 })
        .clearAuth()
        .getRequest(httpStatus.Status200_Ok);
      expect(articlesResponse.articles.length).shouldBeLessThanOrEqual(10);
      expect(articlesResponse.articlesCount).shouldBeEqual(10);
    });
    test('CREATE and DELETE Article', async ({
      api,
      endpoints,
      httpStatus,
    }) => {
      //CREATE ARTICLE
      const newArticle = {
        article: {
          title: 'New Article Title PW AC',
          description: 'New Article Description  PW AC',
          body: 'This is the body of the new article.  PW AC',
          tagList: [],
        },
      };

      const newArticlesResponse = await api
        .path(endpoints.articles)
        .body(newArticle)
        .postRequest(httpStatus.Status201_Created);

      const articleSlug: string = newArticlesResponse.article.slug;
      expect(newArticlesResponse).toHaveProperty('article');
      expect(newArticlesResponse.article.title).shouldBeEqual(
        newArticle.article.title,
      );

      const articlesResponse = await api
        .path(endpoints.articles)
        .getRequest(httpStatus.Status200_Ok);
      expect(articlesResponse.articles[0].title).shouldBeEqual(
        newArticle.article.title,
      );

      //DELETE

      const deleteArticleResponse = await api
        .path(endpoints.updateDeleteArticle(articleSlug))
        .deleteRequest(httpStatus.Status204_No_Content);
      expect(deleteArticleResponse).toBeUndefined();

      const articlesResponseAfterDelete = await api
        .path(endpoints.articles)
        .params({ limit: 10, offset: 0 })
        .getRequest(httpStatus.Status200_Ok);

      expect(
        articlesResponseAfterDelete.articles.some(
          (article: { slug: string }) => article.slug === articleSlug,
        ),
      ).toBeFalsy();
    });
    test('CREATE, UPDATE and DELETE Article', async ({
      api,
      endpoints,
      httpStatus,
    }) => {
      //CREATE ARTICLE
      const newArticle = {
        article: {
          title: 'New Article Title PW AC',
          description: 'New Article Description  PW AC',
          body: 'This is the body of the new article.  PW AC',
          tagList: [],
        },
      };

      const newArticlesResponse = await api
        .path(endpoints.articles)
        .body(newArticle)
        .postRequest(httpStatus.Status201_Created);

      const articleSlug: string = newArticlesResponse.article.slug;
      expect(newArticlesResponse).toHaveProperty('article');
      expect(newArticlesResponse.article.title).shouldBeEqual(
        newArticle.article.title,
      );

      const articlesResponse = await api
        .path(endpoints.articles)
        .params({ limit: 10, offset: 0 })
        .getRequest(httpStatus.Status200_Ok);

      //READ
      expect(articlesResponse.articles[0].title).shouldBeEqual(
        newArticle.article.title,
      );

      //UPDATE
      const updateArticleResponse = await api
        .path(endpoints.updateDeleteArticle(articleSlug))
        .body({
          article: {
            title: 'Updated Article Title PW AC',
            description: 'Updated Article Description PW AC',
            body: 'This is the updated body of the article. PW AC',
          },
        })
        .putRequest(httpStatus.Status200_Ok);

      const articleSlugUpdated: string = updateArticleResponse.article.slug;
      expect(updateArticleResponse.article.title).shouldBeEqual(
        'Updated Article Title PW AC',
      );

      //DELETE

      const deleteArticleResponse = await api
        .path(endpoints.updateDeleteArticle(articleSlugUpdated))
        .deleteRequest(httpStatus.Status204_No_Content);
      expect(deleteArticleResponse).toBeUndefined();

      const articlesResponseAfterDelete = await api
        .path(endpoints.articles)
        .params({ limit: 10, offset: 0 })
        .getRequest(httpStatus.Status200_Ok);

      expect(
        articlesResponseAfterDelete.articles.some(
          (article: { slug: string }) => article.slug === articleSlug,
        ),
      ).toBeFalsy();
    });
  },
);
