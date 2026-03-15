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
		console.log(`✓ Killed process on port ${port}`);
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

	console.log("🚀 Starting test history server...\n");

	// Check if desired port is in use
	if (await isPortInUse(desiredPort)) {
		console.log(`⚠️  Port ${desiredPort} is already in use`);

		// Try to kill the process
		await killProcessOnPort(desiredPort);

		// Check again
		if (await isPortInUse(desiredPort)) {
			// Find alternative port
			const availablePort = await findAvailablePort(desiredPort + 1);
			console.log(`✓ Using alternative port ${availablePort}\n`);

			// Start server on alternative port
			const serverProcess = exec(
				`npx http-server tests/report/test-history -p ${availablePort} -o`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(`Error: ${error.message}`);
						return;
					}
					if (stderr) {
						console.error(`stderr: ${stderr}`);
						return;
					}
				},
			);

			serverProcess.stdout.pipe(process.stdout);
			serverProcess.stderr.pipe(process.stderr);

			return;
		}
	}

	console.log(`✓ Port ${desiredPort} is available\n`);

	// Start server on desired port
	const serverProcess = exec(
		`npx http-server tests/report/test-history -p ${desiredPort} -o`,
		(error, stdout, stderr) => {
			if (error) {
				console.error(`Error: ${error.message}`);
				return;
			}
			if (stderr) {
				console.error(`stderr: ${stderr}`);
				return;
			}
		},
	);

	serverProcess.stdout.pipe(process.stdout);
	serverProcess.stderr.pipe(process.stderr);

	// Keep process alive
	process.on("SIGINT", () => {
		console.log("\n\n👋 Shutting down server...");
		serverProcess.kill();
		process.exit(0);
	});
}

startServer().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
