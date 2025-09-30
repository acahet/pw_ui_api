import { faker } from '@faker-js/faker';
import articleRequestPayload from '@request-objects/articles/POST_article.json' with { type: 'json' };
import userRequestPayload from '@request-objects/user/POST_signup.json' with { type: 'json' };

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

export function getNewUser() {
  const newUser = structuredClone(userRequestPayload);
  const randomString = faker.string.alphanumeric(5);
  newUser.user.username = `qa_test_${randomString}`;
  newUser.user.email = `qa_test_${randomString}@example.com`;
  newUser.user.password = `qa_test_${randomString}`;
  return newUser;
}
