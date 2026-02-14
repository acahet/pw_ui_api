import { type APIRequestContext, test } from "@playwright/test";
import type { APILogger } from "@utils/logger";

interface RequestConfig {
  baseUrl?: string;
  path: string;
  queryParams: Record<string, string | number | boolean>;
  headers: Record<string, string>;
  body?: unknown;
  includeAuth: boolean;
  timeout?: number;
}

type ExpectedStatus = number | number[];

export class RequestHandler {
  private readonly request: APIRequestContext;
  private readonly logger: APILogger;
  private readonly defaultBaseUrl: string;
  private readonly defaultAuthToken: string;
  private readonly config: RequestConfig;

  constructor(
    request: APIRequestContext,
    apiBaseUrl: string,
    logger: APILogger,
    authToken: string = "",
    config?: RequestConfig
  ) {
    this.request = request;
    this.defaultBaseUrl = apiBaseUrl;
    this.logger = logger;
    this.defaultAuthToken = authToken;

    this.config = config ?? {
      path: "",
      queryParams: {},
      headers: {},
      includeAuth: true,
    };
  }

  /* =========================
     Builder Methods (Immutable)
     ========================= */

  url(url: string): RequestHandler {
    return this.clone({ baseUrl: url });
  }

  path(path: string): RequestHandler {
    return this.clone({ path });
  }

  params(params: Record<string, string | number | boolean>): RequestHandler {
    return this.clone({
      queryParams: { ...this.config.queryParams, ...params },
    });
  }

  headers(headers: Record<string, string>): RequestHandler {
    return this.clone({
      headers: { ...this.config.headers, ...headers },
    });
  }

  body(body: unknown): RequestHandler {
    return this.clone({ body });
  }

  timeout(timeout: number): RequestHandler {
    return this.clone({ timeout });
  }

  withoutAuth(): RequestHandler {
    return this.clone({ includeAuth: false });
  }

  private clone(overrides: Partial<RequestConfig>): RequestHandler {
    return new RequestHandler(
      this.request,
      this.defaultBaseUrl,
      this.logger,
      this.defaultAuthToken,
      { ...this.config, ...overrides }
    );
  }

  /* =========================
     HTTP METHODS
     ========================= */

  async get(expectedStatus: ExpectedStatus = 200): Promise<any> {
    return this.execute("GET", expectedStatus);
  }

  async post(expectedStatus: ExpectedStatus = 201): Promise<any> {
    return this.execute("POST", expectedStatus);
  }

  async put(expectedStatus: ExpectedStatus = 200): Promise<any> {
    return this.execute("PUT", expectedStatus);
  }

  async patch(expectedStatus: ExpectedStatus = 200): Promise<any> {
    return this.execute("PATCH", expectedStatus);
  }

  async delete(expectedStatus: ExpectedStatus = 204): Promise<any> {
    return this.execute("DELETE", expectedStatus);
  }

  /* =========================
     Core Execution Logic
     ========================= */

  private async execute(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    expectedStatus: ExpectedStatus
  ): Promise<any> {
    const url = this.getUrl();
    const headers = this.getHeaders();

    let responseBody: any;

    await test.step(`${method} ${url}`, async () => {
      this.logger.logRequest(method, url, headers, this.config.body);

      const response = await this.request.fetch(url, {
        method,
        headers,
        data: this.config.body,
        timeout: this.config.timeout,
      });

      const actualStatus = response.status();
      responseBody = await this.safeParseResponse(response);

      this.logger.logResponse(actualStatus, responseBody);

      this.validateStatus(actualStatus, expectedStatus, method);
    });

    return responseBody;
  }

  /* =========================
     Utilities
     ========================= */

  private getUrl(): string {
    const baseUrl = this.config.baseUrl ?? this.defaultBaseUrl;
    const url = new URL(`${baseUrl}${this.config.path}`);

    for (const [key, value] of Object.entries(this.config.queryParams)) {
      url.searchParams.append(key, String(value));
    }

    return url.toString();
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.config.headers };

    if (this.config.includeAuth && this.defaultAuthToken) {
      headers.Authorization =
        headers.Authorization || this.defaultAuthToken;
    }

    return headers;
  }

  private validateStatus(
    actual: number,
    expected: ExpectedStatus,
    method: string
  ): void {
    const expectedArray = Array.isArray(expected) ? expected : [expected];

    if (!expectedArray.includes(actual)) {
      const logs = this.logger.getRecentLogs();

      const error = new Error(
        `[${method}] Expected status ${expectedArray.join(
          " or "
        )}, but received ${actual}\n\nRecent API Activity:\n${logs}`
      );

      Error.captureStackTrace(error, this.validateStatus);
      throw error;
    }
  }

  private async safeParseResponse(response: any): Promise<any> {
    const contentType = response.headers()["content-type"];

    if (!contentType) return null;

    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    return await response.text();
  }
}
