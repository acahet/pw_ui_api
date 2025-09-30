/**
 * Utility type to extract the union of all values from a given type.
 *
 * Example:
 *   type Status = { OPEN: 'open'; CLOSED: 'closed' };
 *   type StatusValues = ValueOf<Status>; // "open" | "closed"
 *
 * Useful when you want to accept any possible value from an object type
 * instead of repeating the union manually.
 */
type ValueOf<T> = T[keyof T];

/**
 * A map of locale → string.
 *
 * Example:
 *   { br: "translation-portuguese", it: "translation-italian" }
 *
 * Useful for storing translations or locale-specific strings,
 * especially when writing tests or building features that depend
 * on multi-language support.
 */
type LocaleMap = Record<string, string>;

/**
 * Types for JSON Schemas
 * These types help ensure consistency and type safety when
 * working with JSON schemas for API responses.
 */
type SchemaDir = 'tags' | 'articles' | 'users';

/**
 * Mapping of schema directories to their respective file names.
 * This helps ensure that only valid file names are used for each directory.
 */
interface SchemaFileMap {
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
    | 'DELETE_articles';
}

/**
 * Type representing valid schema file names for a given directory.
 */
type SchemaFile<Dir extends SchemaDir> = SchemaFileMap[Dir];

/**
 * Type representing a generic JSON Schema object.
 */
type JSONSchema = Record<string, any>;

/**
 * Types for API endpoints
 * These types help ensure consistency and type safety when
 * working with API requests.
 */
interface Endpoint {
  user: string;
  users: string;
  tags: string;
  login: string;
  postArticle: string;
  articles: string;
  updateDeleteArticle: (slug: string) => string;
}
/**
 * Types for HTTP status codes
 * These types help ensure consistency and type safety when
 * working with API responses.
 */
interface HttpStatusCode {
  Status200_Ok: number;
  Status201_Created: number;
  Status403_Forbidden: number;
  Status204_No_Content: number;
  Status422_Unprocessable_Content: number;
}
export {
  LocaleMap,
  ValueOf,
  Endpoint,
  HttpStatusCode,
  JSONSchema,
  SchemaDir,
  SchemaFile,
};
