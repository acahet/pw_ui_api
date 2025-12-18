import { type APIRequestContext, test } from "@playwright/test";
import type { APILogger } from "@utils/logger";

interface RequestConfig {
	baseUrl?: string;
	path: string;
	queryParams: Record<string, string | number | boolean>;
	headers: Record<string, string>;
	body: object;
	includeAuth: boolean;
}

/**
 * An immutable utility class to handle API requests with Playwright's APIRequestContext.
 * Each method returns a new instance, allowing for clean method chaining without state mutations.
 * Supports GET, POST, PUT, DELETE, and PATCH requests with status code validation and logging.
 * @class RequestHandler
 * @example
 * const api = new RequestHandler(request, apiBaseUrl, logger, authToken);
 * const response = await api
 *   .path('/endpoint')
 *   .params({ key: 'value' })
 *   .headers({ 'Custom-Header': 'value' })
 *   .body({ data: 'value' })
 *   .postRequest(201);
 * @returns {Promise<any>} The response JSON from the API request.
 * @throws {Error} If the actual status code does not match the expected status code, an error is thrown with recent API activity logs.
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
			body: {},
			includeAuth: true,
		};
	}

	/**
	 * Creates a new instance with the specified base URL.
	 * @param url - The base URL to set.
	 * @returns A new RequestHandler instance with the updated base URL.
	 */
	url(url: string): RequestHandler {
		return new RequestHandler(
			this.request,
			this.defaultBaseUrl,
			this.logger,
			this.defaultAuthToken,
			{ ...this.config, baseUrl: url },
		);
	}

	/**
	 * Creates a new instance with the specified API path.
	 * @param path - The API path to set.
	 * @returns A new RequestHandler instance with the updated path.
	 */
	path(path: string): RequestHandler {
		return new RequestHandler(
			this.request,
			this.defaultBaseUrl,
			this.logger,
			this.defaultAuthToken,
			{ ...this.config, path },
		);
	}

	/**
	 * Creates a new instance with the specified query parameters.
	 * @param params - An object representing query parameters to be appended to the API request URL.
	 * @returns A new RequestHandler instance with the updated query parameters.
	 */
	params(params: Record<string, string | number | boolean>): RequestHandler {
		return new RequestHandler(
			this.request,
			this.defaultBaseUrl,
			this.logger,
			this.defaultAuthToken,
			{
				...this.config,
				queryParams: { ...this.config.queryParams, ...params },
			},
		);
	}

	/**
	 * Creates a new instance with the specified headers.
	 * @param headers - An object representing headers to be included in the API request.
	 * @returns A new RequestHandler instance with the updated headers.
	 */
	headers(headers: Record<string, string>): RequestHandler {
		return new RequestHandler(
			this.request,
			this.defaultBaseUrl,
			this.logger,
			this.defaultAuthToken,
			{ ...this.config, headers: { ...this.config.headers, ...headers } },
		);
	}

	/**
	 * Creates a new instance with the specified body.
	 * @param body - An object representing the body to be sent with the API request.
	 * @returns A new RequestHandler instance with the updated body.
	 */
	body(body: object): RequestHandler {
		return new RequestHandler(
			this.request,
			this.defaultBaseUrl,
			this.logger,
			this.defaultAuthToken,
			{ ...this.config, body },
		);
	}

	/**
	 * Creates a new instance without authorization header.
	 * @returns A new RequestHandler instance with authorization disabled.
	 */
	withoutAuth(): RequestHandler {
		return new RequestHandler(
			this.request,
			this.defaultBaseUrl,
			this.logger,
			this.defaultAuthToken,
			{ ...this.config, includeAuth: false },
		);
	}

	/**
	 * Sends a GET request to the API.
	 * @param statusCode - The expected HTTP status code for the GET request.
	 * @returns The response JSON from the API request.
	 * @throws Error if the actual status code does not match the expected status code.
	 */
	async getRequest(statusCode: number): Promise<any> {
		const url = this.getUrl();
		let responseJSON: any;

		await test.step(`GET request to: ${url}`, async () => {
			this.logger.logRequest("GET", url, this.getHeaders());
			const response = await this.request.get(url, {
				headers: this.getHeaders(),
			});
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
	async postRequest(statusCode: number): Promise<any> {
		const url = this.getUrl();
		let responseJSON: any;

		await test.step(`POST request to: ${url}`, async () => {
			this.logger.logRequest("POST", url, this.getHeaders(), this.config.body);
			const response = await this.request.post(url, {
				headers: this.getHeaders(),
				data: this.config.body,
			});
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
	async putRequest(statusCode: number): Promise<any> {
		const url = this.getUrl();
		let responseJSON: any;

		await test.step(`PUT request to: ${url}`, async () => {
			this.logger.logRequest("PUT", url, this.getHeaders(), this.config.body);
			const response = await this.request.put(url, {
				headers: this.getHeaders(),
				data: this.config.body,
			});
			const actualStatus = response.status();
			responseJSON = await response.json();
			this.logger.logResponse(actualStatus, responseJSON);

			this.statusCodeValidator(actualStatus, statusCode, this.putRequest);
		});

		return responseJSON;
	}

	/**
	 * Sends a PATCH request to the API.
	 * @param statusCode - The expected HTTP status code for the PATCH request.
	 * @returns The response JSON from the API request.
	 * @throws Error if the actual status code does not match the expected status code.
	 */
	async patchRequest(statusCode: number): Promise<any> {
		const url = this.getUrl();
		let responseJSON: any;

		await test.step(`PATCH request to: ${url}`, async () => {
			this.logger.logRequest("PATCH", url, this.getHeaders(), this.config.body);
			const response = await this.request.patch(url, {
				headers: this.getHeaders(),
				data: this.config.body,
			});
			const actualStatus = response.status();
			responseJSON = await response.json();
			this.logger.logResponse(actualStatus, responseJSON);

			this.statusCodeValidator(actualStatus, statusCode, this.patchRequest);
		});

		return responseJSON;
	}

	/**
	 * Sends a DELETE request to the API.
	 * @param statusCode - The expected HTTP status code for the DELETE request.
	 * @returns void
	 * @throws Error if the actual status code does not match the expected status code.
	 */
	async deleteRequest(statusCode: number): Promise<void> {
		const url = this.getUrl();

		await test.step(`DELETE request to: ${url}`, async () => {
			this.logger.logRequest("DELETE", url, this.getHeaders());
			const response = await this.request.delete(url, {
				headers: this.getHeaders(),
			});
			const actualStatus = response.status();
			this.logger.logResponse(actualStatus);

			this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest);
		});
	}

	/**
	 * Constructs the full URL for the API request.
	 * @returns The full URL constructed from the base URL, API path, and query parameters.
	 */
	private getUrl(): string {
		const baseUrl = this.config.baseUrl ?? this.defaultBaseUrl;
		const url = new URL(`${baseUrl}${this.config.path}`);

		for (const [key, value] of Object.entries(this.config.queryParams)) {
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
	): void {
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
	 * @returns The headers for the API request, including the Authorization header if authentication is enabled.
	 */
	private getHeaders(): Record<string, string> {
		const headers = { ...this.config.headers };

		if (this.config.includeAuth && this.defaultAuthToken) {
			headers.Authorization = headers.Authorization || this.defaultAuthToken;
		}

		return headers;
	}
}
