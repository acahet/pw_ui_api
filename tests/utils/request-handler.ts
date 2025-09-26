import { APIRequestContext, test } from '@playwright/test';

import { APILogger } from '@logger';

export class RequestHandler {
	private request: APIRequestContext;
	private logger: APILogger;
	private baseUrl: string | undefined;
	private defaultBaseUrl: string;
	private apiPath: string = '';
	private queryParams: object = {};
	private apiHeaders: Record<string, string> = {};
	private requestBody: object = {};
	private defaultAuthToken: string;
	private clearAuthFlag: boolean = false;

	constructor(
		request: APIRequestContext,
		apiBaseUrl: string,
		logger: APILogger,
		authToken: string = ''
	) {
		this.request = request;
		this.defaultBaseUrl = apiBaseUrl;
		this.logger = logger;
		this.defaultAuthToken = authToken;
	}
	url(url: string) {
		this.baseUrl = url;
		return this;
	}
	path(path: string) {
		this.apiPath = path;
		return this;
	}
	params(params: object) {
		this.queryParams = params;
		return this;
	}
	headers(headers: Record<string, string>) {
		this.apiHeaders = headers;
		return this;
	}
	body(body: object) {
		this.requestBody = body;
		return this;
	}
	clearAuth() {
		this.clearAuthFlag = true;
		return this;
	}

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

	async postRequest(statusCode: number) {
		const url = this.getUrl();
		let responseJSON: any;
		await test.step(`Post request to: ${url}`, async () => {
			this.logger.logRequest(
				'POST',
				url,
				this.getHeaders(),
				this.requestBody
			);
			const response = await this.request.post(url, {
				headers: this.getHeaders(),
				data: this.requestBody,
			});
			this.cleanupFields();
			const actualStatus = response.status();
			responseJSON = await response.json();
			this.logger.logResponse(actualStatus, responseJSON);

			this.statusCodeValidator(
				actualStatus,
				statusCode,
				this.postRequest
			);
		});

		return responseJSON;
	}
	async putRequest(statusCode: number) {
		const url = this.getUrl();
		let responseJSON: any;
		await test.step(`PUT request to: ${url}`, async () => {
			this.logger.logRequest(
				'PUT',
				url,
				this.getHeaders(),
				this.requestBody
			);
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

			this.statusCodeValidator(
				actualStatus,
				statusCode,
				this.deleteRequest
			);
		});

		return;
	}
	private getUrl() {
		const url = new URL(
			`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`
		);
		for (const [key, value] of Object.entries(this.queryParams)) {
			url.searchParams.append(key, String(value));
		}
		return url.toString();
	}

	private statusCodeValidator(
		actualStatus: number,
		expectedStatus: number,
		callingMethod: Function
	) {
		if (actualStatus !== expectedStatus) {
			const logs = this.logger.getRecentLogs();
			const error = new Error(
				`Expected status code ${expectedStatus}, but got ${actualStatus}\n\nRecent API Activity:\n${logs}`
			);
			Error.captureStackTrace(error, callingMethod);
			throw error;
		}
	}

	private getHeaders() {
		if (!this.clearAuthFlag) {
			this.apiHeaders['Authorization'] =
				this.apiHeaders['Authorization'] || this.defaultAuthToken;
		}
		return this.apiHeaders;
	}
	private cleanupFields() {
		this.requestBody = {};
		this.apiHeaders = {};
		this.baseUrl = undefined;
		this.apiPath = '';
		this.queryParams = {};
		this.clearAuthFlag = false;
	}
}
