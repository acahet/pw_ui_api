import { promises as fs } from "node:fs";
import * as path from "node:path";
import type {
	FullConfig,
	FullResult,
	Reporter,
	Suite,
	TestCase,
	TestResult,
} from "@playwright/test/reporter";

interface TestInfo {
	title: string;
	file: string;
	project: string;
	duration: number;
	status: string;
	error?: string;
	tags?: string[];
	artifacts: {
		trace?: string;
		screenshot?: string;
	};
}

interface TestHistoryEntry {
	runId: string;
	timestamp: string;
	duration: number;
	totalTests: number;
	passed: number;
	failed: number;
	skipped: number;
	flaky: number;
	allTests: TestInfo[];
	failedTests: TestInfo[];
}

interface HistoryIndex {
	runs: TestHistoryEntry[];
}

class LocalHistoryReporter implements Reporter {
	private config!: FullConfig;
	private suite!: Suite;
	private startTime!: number;
	private historyDir = "./tests/report/test-history";
	private historyIndexFile = `${this.historyDir}/history-index.json`;
	private currentRunId!: string;
	private currentRunDir!: string;

	async onBegin(config: FullConfig, suite: Suite) {
		this.config = config;
		this.suite = suite;
		this.startTime = Date.now();
		this.currentRunId = new Date().toISOString().replace(/[:.]/g, "-");
		this.currentRunDir = `${this.historyDir}/runs/${this.currentRunId}`;

		// Create necessary directories
		await fs.mkdir(this.currentRunDir, { recursive: true });
	}

	async onEnd(_result: FullResult) {
		const duration = Date.now() - this.startTime;

		// Collect test statistics
		const stats = this.collectTestStats(this.suite);

		// Copy failure artifacts
		await this.copyFailureArtifacts(stats.failedTests);

		// Create history entry
		const historyEntry: TestHistoryEntry = {
			runId: this.currentRunId,
			timestamp: new Date().toISOString(),
			duration,
			totalTests: stats.total,
			passed: stats.passed,
			failed: stats.failed,
			skipped: stats.skipped,
			flaky: stats.flaky,
			allTests: stats.allTests,
			failedTests: stats.failedTests,
		};

		// Update history index
		await this.updateHistoryIndex(historyEntry);

		// Cleanup old runs (older than 7 days)
		await this.cleanupOldRuns();
	}

	private collectTestStats(suite: Suite) {
		let total = 0;
		let passed = 0;
		let failed = 0;
		let skipped = 0;
		let flaky = 0;
		const allTests: TestInfo[] = [];
		const failedTests: TestInfo[] = [];

		const processSuite = (s: Suite) => {
			for (const test of s.tests) {
				// Skip tests from "setup" project
				if (test.parent?.project()?.name === "setup") {
					continue;
				}

				total++;

				const results = test.results;
				if (results.length === 0) {
					skipped++;
				// For skipped tests without results, create a minimal entry
				const testEntry: TestInfo = {
					title: test.title,
					file: path.relative(process.cwd(), test.location.file),
					project: test.parent?.project()?.name || "unknown",
					duration: 0,
					status: "skipped",
					artifacts: {},
				};
				allTests.push(testEntry);
				continue;
			}

			const lastResult = results[results.length - 1];

			if (lastResult.status === "skipped") {
				skipped++;
				allTests.push(this.createTestEntry(test, lastResult, "skipped"));
		} else if (lastResult.status === "passed") {
			passed++;
			// Check if flaky (passed after retry)
			const isFlaky = results.length > 1 && results.some((r) => r.status !== "passed");
			if (isFlaky) {
				flaky++;
			}
			allTests.push(this.createTestEntry(test, lastResult, isFlaky ? "flaky" : "passed"));
		} else {
			failed++;
			const testEntry = this.createTestEntry(test, lastResult, "failed");
			failedTests.push(testEntry);
			allTests.push(testEntry);
		}
	}

	for (const child of s.suites) {
		processSuite(child);
	}
};

processSuite(suite);

return { total, passed, failed, skipped, flaky, allTests, failedTests };
}

private createTestEntry(
		test: TestCase,
		result: TestResult,
		status: string,
	): TestInfo {
		const projectName = test.parent?.project()?.name || "unknown";
		const relativePath = path.relative(process.cwd(), test.location.file);

		// Extract tags from test (tags are on the TestCase object)
		const testTags = (test as any).tags || [];

		return {
			title: test.title,
			file: relativePath,
			project: projectName,
			duration: result.duration,
			status,
			error: result.error?.message,
			tags: testTags.length > 0 ? testTags : undefined,
			artifacts: {
				trace: undefined,
				screenshot: undefined,
			},
		};
	}

	private async copyFailureArtifacts(
		failedTests: TestInfo[],
	) {
		for (const failedTest of failedTests) {
			try {
				// Find artifacts in the outputDir for this project
				const project = this.config.projects.find(
					(p) => p.name === failedTest.project,
				);
				if (!project?.outputDir) continue;

				const outputDir = project.outputDir;

				// Look for trace and screenshot files
				try {
					const files = await fs.readdir(outputDir, { recursive: true });

					for (const file of files) {
						const filePath = path.join(outputDir, file.toString());
						const stats = await fs.stat(filePath);

						if (stats.isFile()) {
							// Check if this file belongs to the failed test
							if (file.toString().includes("trace.zip")) {
								// Copy trace file
								const destPath = path.join(
									this.currentRunDir,
									`${this.sanitizeFilename(failedTest.title)}-trace.zip`,
								);
								await fs.copyFile(filePath, destPath);
								failedTest.artifacts.trace = path.relative(
									this.historyDir,
									destPath,
								);
							} else if (
								file.toString().match(/\.(png|jpg|jpeg)$/i) &&
								file.toString().includes("screenshot")
							) {
								// Copy screenshot file
								const destPath = path.join(
									this.currentRunDir,
									`${this.sanitizeFilename(failedTest.title)}-screenshot.png`,
								);
								await fs.copyFile(filePath, destPath);
								failedTest.artifacts.screenshot = path.relative(
									this.historyDir,
									destPath,
								);
							}
						}
					}
				} catch {
					// Ignore errors reading output directory
				}
			} catch (err) {
				console.error(
					`Failed to copy artifacts for test "${failedTest.title}":`,
					err,
				);
			}
		}
	}

	private sanitizeFilename(filename: string): string {
		return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
	}

	private async updateHistoryIndex(entry: TestHistoryEntry) {
		let historyIndex: HistoryIndex;

		try {
			const content = await fs.readFile(this.historyIndexFile, "utf-8");
			historyIndex = JSON.parse(content);
		} catch {
			historyIndex = { runs: [] };
		}

		// Add new entry at the beginning
		historyIndex.runs.unshift(entry);

		// Keep only last 30 runs
		historyIndex.runs = historyIndex.runs.slice(0, 30);

		// Save updated index
		await fs.writeFile(
			this.historyIndexFile,
			JSON.stringify(historyIndex, null, 2),
		);
	}

	private async cleanupOldRuns() {
		try {
			const content = await fs.readFile(this.historyIndexFile, "utf-8");
			const historyIndex: HistoryIndex = JSON.parse(content);

			const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
			const runsToKeep: TestHistoryEntry[] = [];
			const runsToDelete: string[] = [];

			for (const run of historyIndex.runs) {
				const runDate = new Date(run.timestamp).getTime();
				if (runDate >= sevenDaysAgo) {
					runsToKeep.push(run);
				} else {
					runsToDelete.push(run.runId);
				}
			}

			// Delete old run directories
			for (const runId of runsToDelete) {
				const runDir = `${this.historyDir}/runs/${runId}`;
				try {
					await fs.rm(runDir, { recursive: true, force: true });
				} catch (err) {
					console.error(`Failed to delete old run directory ${runDir}:`, err);
				}
			}

			// Update history index with only recent runs
			if (runsToDelete.length > 0) {
				historyIndex.runs = runsToKeep;
				await fs.writeFile(
					this.historyIndexFile,
					JSON.stringify(historyIndex, null, 2),
				);
				console.log(
					`Cleaned up ${runsToDelete.length} test run(s) older than 7 days`,
				);
			}
		} catch (err) {
			console.error("Failed to cleanup old runs:", err);
		}
	}
}

export default LocalHistoryReporter;
