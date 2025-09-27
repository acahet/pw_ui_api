import { test } from '@fixtures';
import { APIResponse, expect } from '@playwright/test';
import { endpoints, httpStatus } from '@utils/constants';

const domain = 'https://conduit-api.bondaracademy.com/';
const articlesParam = '?limit=10&offset=0';


let authToken: string

test.describe('Feature: Articles API', () => {

    test.beforeAll(async ({ request }) => {
        const loginResponse = await request.post(`${domain}/${endpoints.login}`, {
            data: {
                user: {
                    email: process.env.EMAIL as string,
                    password: process.env.PASSWORD as string,
                },
            },
        });
        const tokenJSON = await loginResponse.json();
        authToken = 'Token ' + tokenJSON.user.token;
    });

    test('GET Articles', async ({ request }) => {
        const articlesResponse: APIResponse = await request.get(
            `${domain}/${endpoints.articles}${articlesParam}`,
        );
        expect(articlesResponse.status()).toBe(httpStatus.Status200_Ok);
        const articlesResponseBody = await articlesResponse.json();
        expect(articlesResponseBody).toHaveProperty('articles');
        expect(articlesResponseBody).toHaveProperty('articlesCount');
        expect(articlesResponseBody.articles.length).toBeGreaterThan(0);
        expect(articlesResponseBody.articles.length).toBeLessThanOrEqual(10);
    });
    test('CREATE and DELETE Article', async ({ request }) => {

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
            `${domain}/${endpoints.articles}`,
            {
                data: newArticle,
                headers: {
                    Authorization: authToken,
                },
            },
        );
        expect(newArticlesResponse.status()).toBe(httpStatus.Status201_Created);
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
            `${domain}/${endpoints.articles}${articlesParam}`,
            {
                headers: {
                    Authorization: authToken,
                },
            },
        );
        expect(articlesResponse.status()).toBe(httpStatus.Status200_Ok);
        //READ
        const articlesResponseBody = await articlesResponse.json();
        expect(articlesResponseBody.articles[0].title).toBe(
            newArticle.article.title,
        );
        expect(articlesResponseBody.articles[0].description).toBe(
            newArticle.article.description,
        );
        expect(articlesResponseBody.articles[0].body).toBe(newArticle.article.body);

        //DELETE

        const deleteArticleResponse: APIResponse = await request.delete(
            `${domain}/${endpoints.articles}/${articleSlug}`,
            {
                headers: {
                    Authorization: authToken,
                },
            },
        );
        expect(deleteArticleResponse.status()).toBe(204);

        const articlesResponseAfterDelete: APIResponse = await request.get(
            `${domain}/${endpoints.articles}${articlesParam}`,
            {
                headers: {
                    Authorization: authToken,
                },
            },
        );
        expect(articlesResponseAfterDelete.status()).toBe(httpStatus.Status200_Ok);
        const articlesResponseBodyAfterDelete =
            await articlesResponseAfterDelete.json();
        expect(
            articlesResponseBodyAfterDelete.articles.some(
                (article: { slug: string }) => article.slug === articleSlug,
            ),
        ).toBeFalsy();
    });
    test('CREATE, UPDATE and DELETE Article', async ({ request }) => {

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
            `${domain}/${endpoints.articles}`,
            {
                data: newArticle,
                headers: {
                    Authorization: authToken,
                },
            },
        );
        expect(newArticlesResponse.status()).toBe(httpStatus.Status201_Created);
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
            `${domain}/${endpoints.articles}${articlesParam}`,
            {
                headers: {
                    Authorization: authToken,
                },
            },
        );
        expect(articlesResponse.status()).toBe(httpStatus.Status200_Ok);
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
            `${domain}/${endpoints.articles}/${articleSlug}`,
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
        expect(updateArticleResponse.status()).toBe(httpStatus.Status200_Ok);
        const updateArticleResponseJSON = await updateArticleResponse.json();
        const articleSlugUpdated = updateArticleResponseJSON.article.slug;
        expect(updateArticleResponseJSON.article.title).toBe(
            'Updated Article Title PW AC',
        );

        //DELETE

        const deleteArticleResponse: APIResponse = await request.delete(
            `${domain}/${endpoints.articles}/${articleSlugUpdated}`,
            {
                headers: {
                    Authorization: authToken,
                },
            },
        );
        expect(deleteArticleResponse.status()).toBe(httpStatus.Status204_No_Content);

        const articlesResponseAfterDelete: APIResponse = await request.get(
            `${domain}/${endpoints.articles}${articlesParam}`,
            {
                headers: {
                    Authorization: authToken,
                },
            },
        );
        expect(articlesResponseAfterDelete.status()).toBe(httpStatus.Status200_Ok);
        const articlesResponseBodyAfterDelete =
            await articlesResponseAfterDelete.json();
        expect(
            articlesResponseBodyAfterDelete.articles.some(
                (article: { slug: string }) => article.slug === articleSlug,
            ),
        ).toBeFalsy();
    });
});
