import fs from "node:fs/promises";

interface HistoryIndex {
	runs: Array<{
		runId: string;
		timestamp: string;
		[key: string]: unknown;
	}>;
}

/**
 * Cleanup test runs older than specified days
 * @param historyDir - Path to the history directory
 * @param daysToKeep - Number of days to keep (default: 7)
 */
export async function cleanupOldRuns(
	historyDir: string,
	daysToKeep = 7,
): Promise<number> {
	const historyIndexFile = `${historyDir}/history-index.json`;

	try {
		const content = await fs.readFile(historyIndexFile, "utf-8");
		const historyIndex: HistoryIndex = JSON.parse(content);

		const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
		const runsToKeep: HistoryIndex["runs"] = [];
		const runsToDelete: string[] = [];

		for (const run of historyIndex.runs) {
			const runDate = new Date(run.timestamp).getTime();
			if (runDate >= cutoffDate) {
				runsToKeep.push(run);
			} else {
				runsToDelete.push(run.runId);
			}
		}

		// Delete old run directories
		let deletedCount = 0;
		for (const runId of runsToDelete) {
			const runDir = `${historyDir}/runs/${runId}`;
			try {
				await fs.rm(runDir, { recursive: true, force: true });
				deletedCount++;
			} catch (err) {
				process.stderr.write(
					`Failed to delete old run directory ${runDir}: ${String(err)}\n`,
				);
			}
		}

		// Update history index with only recent runs
		if (runsToDelete.length > 0) {
			historyIndex.runs = runsToKeep;
			await fs.writeFile(
				historyIndexFile,
				JSON.stringify(historyIndex, null, 2),
			);
		}

		return deletedCount;
	} catch (err) {
		process.stderr.write(`Failed to cleanup old runs: ${String(err)}\n`);
		return 0;
	}
}

/**
 * Get storage size of history directory in bytes
 */
export async function getHistorySize(historyDir: string): Promise<number> {
	try {
		const runsDir = `${historyDir}/runs`;
		let totalSize = 0;

		const calculateSize = async (dirPath: string): Promise<number> => {
			let size = 0;
			try {
				const items = await fs.readdir(dirPath, { withFileTypes: true });

				for (const item of items) {
					const itemPath = `${dirPath}/${item.name}`;
					if (item.isDirectory()) {
						size += await calculateSize(itemPath);
					} else {
						const stats = await fs.stat(itemPath);
						size += stats.size;
					}
				}
			} catch {
				// Ignore errors
			}
			return size;
		};

		totalSize = await calculateSize(runsDir);
		return totalSize;
	} catch {
		return 0;
	}
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
