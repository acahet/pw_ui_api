import {
	type APIRequestContext,
	type APIResponse,
	test,
} from "@playwright/test";
import type { APILogger } from "@utils/logger";
import { httpStatus } from "./constants";

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

/**
 * Lightweight immutable API client for Playwright API tests.
 *
 * Each builder method returns a new RequestHandler instance so tests can
 * safely reuse the base `api` fixture without leaking config between requests.
 */
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
		config?: RequestConfig,
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

	// Overrides the default API base URL for a specific request chain.

	url(url: string): RequestHandler {
		return this.clone({ baseUrl: url });
	}

	// Sets endpoint path for the current request chain.

	path(path: string): RequestHandler {
		return this.clone({ path });
	}

	// Merges query params with any existing ones in this chain.

	params(params: Record<string, string | number | boolean>): RequestHandler {
		return this.clone({
			queryParams: { ...this.config.queryParams, ...params },
		});
	}

	// Merges custom headers with chain-local headers.

	headers(headers: Record<string, string>): RequestHandler {
		return this.clone({
			headers: { ...this.config.headers, ...headers },
		});
	}

	// Sets request payload (sent as `data` in Playwright fetch options).

	body(body: unknown): RequestHandler {
		return this.clone({ body });
	}

	// Adds a per-request timeout override in milliseconds.

	timeout(timeout: number): RequestHandler {
		return this.clone({ timeout });
	}

	// Disables automatic Authorization header injection for public endpoints.

	withoutAuth(): RequestHandler {
		return this.clone({ includeAuth: false });
	}

	// Central clone helper that preserves immutability across builder calls.

	private clone(overrides: Partial<RequestConfig>): RequestHandler {
		return new RequestHandler(
			this.request,
			this.defaultBaseUrl,
			this.logger,
			this.defaultAuthToken,
			{ ...this.config, ...overrides },
		);
	}

	/* =========================
     HTTP METHODS
     ========================= */

	async get(expectedStatus: ExpectedStatus = 200): Promise<any> {
		return this.execute("GET", expectedStatus);
	}

	async post(
		expectedStatus: ExpectedStatus = httpStatus.Status201_Created,
	): Promise<any> {
		return this.execute("POST", expectedStatus);
	}

	async put(
		expectedStatus: ExpectedStatus = httpStatus.Status200_Ok,
	): Promise<any> {
		return this.execute("PUT", expectedStatus);
	}

	async patch(
		expectedStatus: ExpectedStatus = httpStatus.Status200_Ok,
	): Promise<any> {
		return this.execute("PATCH", expectedStatus);
	}

	async delete(
		expectedStatus: ExpectedStatus = httpStatus.Status204_No_Content,
	): Promise<any> {
		return this.execute("DELETE", expectedStatus);
	}

	/* =========================
     Core Execution Logic
     ========================= */

	private async execute(
		method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
		expectedStatus: ExpectedStatus,
	): Promise<any> {
		// Resolve final URL/headers once per request so logs match executed call.
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

		// Append all configured query params to the final request URL.
		for (const [key, value] of Object.entries(this.config.queryParams)) {
			url.searchParams.append(key, String(value));
		}

		return url.toString();
	}

	private getHeaders(): Record<string, string> {
		const headers = { ...this.config.headers };

		// Inject auth only when enabled and only if caller did not override it.
		if (this.config.includeAuth && this.defaultAuthToken) {
			headers.Authorization = headers.Authorization || this.defaultAuthToken;
		}

		return headers;
	}

	private validateStatus(
		actual: number,
		expected: ExpectedStatus,
		method: string,
	): void {
		const expectedArray = Array.isArray(expected) ? expected : [expected];

		// Include recent request/response logs to speed up test failure triage.
		if (!expectedArray.includes(actual)) {
			const logs = this.logger.getRecentLogs();

			const error = new Error(
				`[${method}] Expected status ${expectedArray.join(
					" or ",
				)}, but received ${actual}\n\nRecent API Activity:\n${logs}`,
			);

			Error.captureStackTrace(error, this.validateStatus);
			throw error;
		}
	}

	private async safeParseResponse(response: APIResponse): Promise<any> {
		const contentType = response.headers()["content-type"] ?? "";
		const responseText = await response.text();

		// Normalize empty payloads (e.g., 204 No Content) for predictable assertions.
		if (!responseText) {
			return undefined;
		}

		// Parse JSON when possible and fall back gracefully to raw payload.
		if (contentType.includes("application/json")) {
			try {
				return JSON.parse(responseText);
			} catch {
				return responseText;
			}
		}

		// For non-JSON responses, return text payload.
		return responseText;
	}
}
