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

type endpoint = {
  tags: string;
  login: string;
  postArticle: string;
  articles: string;
  updateDeleteArticle: (slug: string) => string;
};

type httpStatusCode = {
  Status200_Ok: number;
  Status201_Created: number;
  Status204_No_Content: number;
};
export { LocaleMap, ValueOf, endpoint, httpStatusCode };
