/**
 * Utility type to extract the union of all values from a given type.
 *
 * Example:
 *   type Status = { OPEN: 'open'; CLOSED: 'closed' };
 *   type StatusValues = ValueOf<Status>; // "open" | "closed"
 */
export type ValueOf<T> = T[keyof T];

/**
 * A map of locale → string.
 * Example: { br: "pt-BR", it: "it-IT" }
 */
export type LocaleMap = Record<string, string>;

/**
 * Allowed JSON schema directories.
 * Using union instead of loose string for strong safety.
 */
export type SchemaDir = 'tags' | 'articles' | 'users' | 'profiles';

/**
 * Mapping of schema directories to valid schema file names.
 * This enforces strict folder → file relationships.
 */
export interface SchemaFileMap {
  users:
    | 'POST_users'
    | 'POST_users_login'
    | 'GET_user'
    | 'POST_users_invalid_login'
    | 'POST_users_blank_email_login'
    | 'POST_users_blank_password_login';

  tags: 'GET_tags';

  articles:
    | 'GET_articles'
    | 'POST_articles'
    | 'PUT_articles'
    | 'GET_articles_favorite'
    | 'GET_user_articles'
    | 'DELETE_articles';

  profiles: 'GET_profile';
}

/**
 * Type-safe schema file selector by directory.
 */
export type SchemaFile<Dir extends SchemaDir> = SchemaFileMap[Dir];

/**
 * Generic JSON Schema type.
 * Can be tightened later with zod-to-json-schema if needed.
 */
export type JSONSchema = Record<string, unknown>;

/**
 * API Endpoint contract.
 * Functions are used where dynamic params are required.
 */
export interface Endpoint {
  readonly user: string;
  readonly users: string;
  readonly tags: string;
  readonly login: string;
  readonly postArticle: string;
  readonly articles: string;

  readonly updateDeleteArticle: (slug: string) => string;
  readonly profiles: (username: string) => string;
}

/**
 * Strict HTTP status contract.
 * Uses readonly to prevent mutation at runtime.
 */
export interface HttpStatusCode {
  readonly Status200_Ok: 200;
  readonly Status201_Created: 201;
  readonly Status403_Forbidden: 403;
  readonly Status204_No_Content: 204;
  readonly Status422_Unprocessable_Content: 422;
}
