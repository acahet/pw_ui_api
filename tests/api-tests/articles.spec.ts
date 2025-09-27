import { test } from '@fixtures';
import { expect } from '@playwright/test';
import { endpoints, httpStatus } from '@utils/constants';

let authToken: string;

test.describe('Feature: Articles API', () => {
    test.beforeAll(async ({ api }) => {
        const loginResponse = await api
            .path(endpoints.login)
            .body({
                user: {
                    email: process.env.EMAIL_API as string,
                    password: process.env.PASSWORD_API as string,
                },
            })
            .postRequest(httpStatus.Status200_Ok);

        authToken = 'Token ' + loginResponse.user.token;
    });

    test('GET Articles', async ({ api }) => {
        const articlesResponse = await api
            .path(endpoints.articles)
            .params({ limit: 10, offset: 0 })
            .getRequest(httpStatus.Status200_Ok);

        expect(articlesResponse.articles.length).toBeGreaterThan(0);
        expect(articlesResponse.articles.length).toBeLessThanOrEqual(10);
    });
    test('CREATE and DELETE Article', async ({ api, request }) => {
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
            .headers({ Authorization: authToken })
            .body(newArticle)
            .postRequest(httpStatus.Status201_Created);

        const articleSlug = newArticlesResponse.article.slug;
        expect(newArticlesResponse).toHaveProperty('article');
        expect(newArticlesResponse.article.title).toBe(newArticle.article.title);
        expect(newArticlesResponse.article.description).toBe(
            newArticle.article.description,
        );
        expect(newArticlesResponse.article.body).toBe(newArticle.article.body);

        const articlesResponse = await api
            .path(endpoints.articles)
            .headers({ Authorization: authToken })
            .getRequest(httpStatus.Status200_Ok);

        expect(articlesResponse.articles[0].title).toBe(newArticle.article.title);
        expect(articlesResponse.articles[0].description).toBe(
            newArticle.article.description,
        );
        expect(articlesResponse.articles[0].body).toBe(newArticle.article.body);

        //DELETE

        const deleteArticleResponse = await api
            .path(endpoints.updateDeleteArticle(articleSlug))
            .headers({ Authorization: authToken })
            .deleteRequest(httpStatus.Status204_No_Content);
        expect(deleteArticleResponse).toBeUndefined();

        const articlesResponseAfterDelete = await api
            .path(endpoints.articles)
            .params({ limit: 10, offset: 0 })
            .headers({ Authorization: authToken })
            .getRequest(httpStatus.Status200_Ok);

        expect(
            articlesResponseAfterDelete.articles.some(
                (article: { slug: string }) => article.slug === articleSlug,
            ),
        ).toBeFalsy();
    });
    test('CREATE, UPDATE and DELETE Article', async ({ api, request }) => {
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
            .headers({ Authorization: authToken })
            .body(newArticle)
            .postRequest(httpStatus.Status201_Created);

        const articleSlug = newArticlesResponse.article.slug;
        expect(newArticlesResponse).toHaveProperty('article');
        expect(newArticlesResponse.article.title).toBe(newArticle.article.title);
        expect(newArticlesResponse.article.description).toBe(
            newArticle.article.description,
        );
        expect(newArticlesResponse.article.body).toBe(newArticle.article.body);

        const articlesResponse = await api
            .path(endpoints.articles)
            .params({ limit: 10, offset: 0 })
            .headers({ Authorization: authToken })
            .getRequest(httpStatus.Status200_Ok);

        //READ
        expect(articlesResponse.articles[0].title).toBe(newArticle.article.title);
        expect(articlesResponse.articles[0].description).toBe(
            newArticle.article.description,
        );
        expect(articlesResponse.articles[0].body).toBe(newArticle.article.body);

        //UPDATE
        const updateArticleResponse = await api
            .path(endpoints.updateDeleteArticle(articleSlug))
            .headers({ Authorization: authToken })
            .body({
                article: {
                    title: 'Updated Article Title PW AC',
                    description: 'Updated Article Description PW AC',
                    body: 'This is the updated body of the article. PW AC',
                },
            })
            .putRequest(httpStatus.Status200_Ok);

        const articleSlugUpdated = updateArticleResponse.article.slug;
        expect(updateArticleResponse.article.title).toBe(
            'Updated Article Title PW AC',
        );

        //DELETE

        const deleteArticleResponse = await api
            .path(endpoints.updateDeleteArticle(articleSlugUpdated))
            .headers({ Authorization: authToken })
            .deleteRequest(httpStatus.Status204_No_Content);
        expect(deleteArticleResponse).toBeUndefined();

        const articlesResponseAfterDelete = await api
            .path(endpoints.articles)
            .params({ limit: 10, offset: 0 })
            .headers({ Authorization: authToken })
            .getRequest(httpStatus.Status200_Ok);

        expect(
            articlesResponseAfterDelete.articles.some(
                (article: { slug: string }) => article.slug === articleSlug,
            ),
        ).toBeFalsy();
    });
});
