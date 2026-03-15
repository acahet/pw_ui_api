#!/usr/bin/env node
/* eslint-disable no-undef */

import { exec } from "node:child_process";
import net from "node:net";
import { promisify } from "node:util";

const execAsync = promisify(exec);

async function isPortInUse(port) {
	return new Promise((resolve) => {
		const server = net.createServer();

		server.once("error", (err) => {
			if (err.code === "EADDRINUSE") {
				resolve(true);
			} else {
				resolve(false);
			}
		});

		server.once("listening", () => {
			server.close();
			resolve(false);
		});

		server.listen(port);
	});
}

async function killProcessOnPort(port) {
	try {
		// Try to find and kill process using netstat and awk
		await execAsync(`kill -9 $(lsof -ti:${port}) 2>/dev/null || true`);
		process.stdout.write(`✓ Killed process on port ${port}\n`);
		// Wait a moment for the port to be released
		await new Promise((resolve) => setTimeout(resolve, 500));
	} catch {
		// Silently fail - process might not exist
	}
}

async function findAvailablePort(startPort) {
	let port = startPort;
	while (await isPortInUse(port)) {
		port++;
		if (port > startPort + 100) {
			throw new Error("Could not find available port");
		}
	}
	return port;
}

async function startServer() {
	const desiredPort = 8080;

	process.stdout.write("🚀 Starting test history server...\n\n");

	// Check if desired port is in use
	if (await isPortInUse(desiredPort)) {
		process.stdout.write(`⚠️  Port ${desiredPort} is already in use\n`);

		// Try to kill the process
		await killProcessOnPort(desiredPort);

		// Check again
		if (await isPortInUse(desiredPort)) {
			// Find alternative port
			const availablePort = await findAvailablePort(desiredPort + 1);
			process.stdout.write(`✓ Using alternative port ${availablePort}\n\n`);

			// Start server on alternative port
			const serverProcess = exec(
				`npx http-server tests/report/test-history -p ${availablePort} -o`,
				(error, _stdout, stderr) => {
					if (error) {
						process.stderr.write(`Error: ${error.message}\n`);
						return;
					}
					if (stderr) {
						process.stderr.write(`stderr: ${stderr}\n`);
						return;
					}
				},
			);

			serverProcess.stdout.pipe(process.stdout);
			serverProcess.stderr.pipe(process.stderr);

			return;
		}
	}

	process.stdout.write(`✓ Port ${desiredPort} is available\n\n`);

	// Start server on desired port
	const serverProcess = exec(
		`npx http-server tests/report/test-history -p ${desiredPort} -o`,
		(error, _stdout, stderr) => {
			if (error) {
				process.stderr.write(`Error: ${error.message}\n`);
				return;
			}
			if (stderr) {
				process.stderr.write(`stderr: ${stderr}\n`);
				return;
			}
		},
	);

	serverProcess.stdout.pipe(process.stdout);
	serverProcess.stderr.pipe(process.stderr);

	// Keep process alive
	process.on("SIGINT", () => {
		process.stdout.write("\n\n👋 Shutting down server...\n");
		serverProcess.kill();
		process.exit(0);
	});
}

startServer().catch((error) => {
	process.stderr.write(`Failed to start server: ${String(error)}\n`);
	process.exit(1);
});
