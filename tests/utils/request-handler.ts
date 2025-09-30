import { APIRequestContext, test } from '@playwright/test';
import { APILogger } from '@utils/logger';

/**
 * A utility class to handle API requests with Playwright's APIRequestContext.
 * It supports setting base URL, path, query parameters, headers, and body for requests.
 * It also includes methods for GET, POST, PUT, and DELETE requests with status code validation and logging.
 * @class RequestHandler
 * @example
 * const api = new RequestHandler(request, apiBaseUrl, logger, authToken);
 * const response = await api.path('/endpoint').params({ key: 'value' }).headers({ 'Custom-Header': 'value' }).body({ data: 'value' }).postRequest(201);
 * @returns {Promise<any>} The response JSON from the API request.
 * @throws {Error} If the actual status code does not match the expected status code, an error is thrown with recent API activity logs.
 * 
 */
export class RequestHandler {
  private request: APIRequestContext;
  private logger: APILogger;
  private baseUrl: string | undefined;
  private defaultBaseUrl: string;
  private apiPath = '';
  private queryParams: object = {};
  private apiHeaders: Record<string, string> = {};
  private requestBody: object = {};
  private defaultAuthToken: string;
  private clearAuthFlag: boolean = false;

  constructor(
    request: APIRequestContext,
    apiBaseUrl: string,
    logger: APILogger,
    authToken: string = '',
  ) {
    this.request = request;
    this.defaultBaseUrl = apiBaseUrl;
    this.logger = logger;
    this.defaultAuthToken = authToken;
  }
  /**
   * Sets the base URL for the API request.
   * @param url - The base URL to set.
   * @returns The current instance of RequestHandler for method chaining.
   */
  url(url: string) {
    this.baseUrl = url;
    return this;
  }
  /**
   * Sets the API path for the request.
   * @param path - The API path to set.
   * @returns The current instance of RequestHandler for method chaining.
   */
  path(path: string) {
    this.apiPath = path;
    return this;
  }
  /**
   * Sets the query parameters for the request.
   * @param params - An object representing query parameters to be appended to the API request URL.
   * @returns The current instance of RequestHandler for method chaining.
   */
  params(params: object) {
    this.queryParams = params;
    return this;
  }
  /**
   * Sets the headers for the API request.
   * @param headers - An object representing headers to be included in the API request.
   * @returns The current instance of RequestHandler for method chaining.
   */
  headers(headers: Record<string, string>) {
    this.apiHeaders = headers;
    return this;
  }
  /**
   * Sets the body for the API request.
   * @param body - An object representing the body to be sent with the API request.
   * @returns The current instance of RequestHandler for method chaining.
   */
  body(body: object) {
    this.requestBody = body;
    return this;
  }
  /**
   * Clears the Authorization header for the API request.
   * @returns The current instance of RequestHandler for method chaining.
   * @description Clears the Authorization header for the API request.
   */
  clearAuth() {
    this.clearAuthFlag = true;
    return this;
  }
  /**
   * Sends a GET request to the API.
   * @param statusCode - The expected HTTP status code for the GET request.
   * @returns The response JSON from the API request.
   * @throws Error if the actual status code does not match the expected status code.
   */
  async getRequest(statusCode: number) {
    const url = this.getUrl();
    let responseJSON: any;

    await test.step(`Get request to: ${url}`, async () => {
      this.logger.logRequest('GET', url, this.getHeaders());
      const response = await this.request.get(url, {
        headers: this.getHeaders(),
      });
      this.cleanupFields();
      const actualStatus = response.status();
      responseJSON = await response.json();

      this.logger.logResponse(actualStatus, responseJSON);

      this.statusCodeValidator(actualStatus, statusCode, this.getRequest);
    });

    return responseJSON;
  }
  /**
   * Sends a POST request to the API.
   * @param statusCode - The expected HTTP status code for the POST request.
   * @returns The response JSON from the API request.
   * @throws Error if the actual status code does not match the expected status code.
   */
  async postRequest(statusCode: number) {
    const url = this.getUrl();
    let responseJSON: any;
    await test.step(`Post request to: ${url}`, async () => {
      this.logger.logRequest('POST', url, this.getHeaders(), this.requestBody);
      const response = await this.request.post(url, {
        headers: this.getHeaders(),
        data: this.requestBody,
      });
      this.cleanupFields();
      const actualStatus = response.status();
      responseJSON = await response.json();
      this.logger.logResponse(actualStatus, responseJSON);

      this.statusCodeValidator(actualStatus, statusCode, this.postRequest);
    });

    return responseJSON;
  }
  /**
   * Sends a PUT request to the API.
   * @param statusCode - The expected HTTP status code for the PUT request.
   * @returns The response JSON from the API request.
   * @throws Error if the actual status code does not match the expected status code.
   */
  async putRequest(statusCode: number) {
    const url = this.getUrl();
    let responseJSON: any;
    await test.step(`PUT request to: ${url}`, async () => {
      this.logger.logRequest('PUT', url, this.getHeaders(), this.requestBody);
      const response = await this.request.put(url, {
        headers: this.getHeaders(),
        data: this.requestBody,
      });
      this.cleanupFields();
      const actualStatus = response.status();
      responseJSON = await response.json();
      this.logger.logResponse(actualStatus, responseJSON);

      this.statusCodeValidator(actualStatus, statusCode, this.putRequest);
    });

    return responseJSON;
  }
  /**
   * Sends a DELETE request to the API.
   * @param statusCode - The expected HTTP status code for the DELETE request.
   * @returns The response JSON from the API request.
   * @throws Error if the actual status code does not match the expected status code.
   */
  async deleteRequest(statusCode: number) {
    const url = this.getUrl();
    await test.step(`PUT request to: ${url}`, async () => {
      this.logger.logRequest('DELETE', url, this.getHeaders());
      const response = await this.request.delete(url, {
        headers: this.getHeaders(),
      });
      this.cleanupFields();
      const actualStatus = response.status();
      this.logger.logResponse(actualStatus);

      this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest);
    });

    return;
  }
  /**
   * Constructs the full URL for the API request.
   * @returns The full URL constructed from the base URL, API path, and query parameters.
   */
  private getUrl() {
    const url = new URL(
      `${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`,
    );
    for (const [key, value] of Object.entries(this.queryParams)) {
      url.searchParams.append(key, String(value));
    }
    return url.toString();
  }
  /**
   * Validates the HTTP status code of the API response.
   * @param actualStatus - The actual HTTP status code received from the API response.
   * @param expectedStatus - The expected HTTP status code for the API request.
   * @param callingMethod - The method that initiated the API request.
   */
  private statusCodeValidator(
    actualStatus: number,
    expectedStatus: number,
    callingMethod: Function,
  ) {
    if (actualStatus !== expectedStatus) {
      const logs = this.logger.getRecentLogs();
      const error = new Error(
        `Expected status code ${expectedStatus}, but got ${actualStatus}\n\nRecent API Activity:\n${logs}`,
      );
      Error.captureStackTrace(error, callingMethod);
      throw error;
    }
  }
  /**
   * Constructs the headers for the API request.
   * @returns The headers for the API request, including the Authorization header if not cleared.
   */
  private getHeaders() {
    if (!this.clearAuthFlag) {
      this.apiHeaders['Authorization'] =
        this.apiHeaders['Authorization'] || this.defaultAuthToken;
    }
    return this.apiHeaders;
  }
  /**
   * Cleans up the fields used for the API request to prepare for the next request.
   */
  private cleanupFields() {
    this.requestBody = {};
    this.apiHeaders = {};
    this.baseUrl = undefined;
    this.apiPath = '';
    this.queryParams = {};
    this.clearAuthFlag = false;
  }
}
