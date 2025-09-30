import articleRequestPayload from '@request-objects/articles/POST_article.json' with { type: 'json' };
import { faker } from '@faker-js/faker';

/**
 * Generates a new article request payload with randomized title, description, and body.
 * @returns A new article request payload with randomized title, description, and body.
 */
export function getNewRandomArticle() {
    const articleRequest = structuredClone(articleRequestPayload);
    articleRequest.article.title = `QA TEST: ${faker.lorem.sentence(5)}`;
    articleRequest.article.description = faker.lorem.sentence(3);
    articleRequest.article.body = faker.lorem.sentence(8);
    return articleRequest;
}
