export class APILogger {
	private recentLogs: { type: string; data: unknown }[] = [];
	logRequest(
		method: string,
		url: string,
		headers: Record<string, string>,
		body?: unknown,
	) {
		// Deep clone the body to avoid mutating the original
		const safeBody = body ? JSON.parse(JSON.stringify(body)) : undefined;
		if (safeBody?.user?.password) {
			safeBody.user.password = "***";
		}

		const logEntry = { method, url, headers, body: safeBody };
		this.recentLogs.push({ type: "Response Details", data: logEntry });
	}
	logResponse(statusCode: number, body?: unknown) {
		const logEntry = { statusCode, body };
		this.recentLogs.push({ type: "Response Details", data: logEntry });
	}
	getRecentLogs() {
		const logs = this.recentLogs
			.map((log) => {
				return `=====${log.type}=====\n${JSON.stringify(log.data, null, 4)}`;
			})
			.join("\n\n");
		return logs;
	}
}
