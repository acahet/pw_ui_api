# Local Test History Tracking

A custom local test history tracking system for Playwright that automatically tracks test runs, manages artifacts, and provides a visual dashboard - all without external dependencies.

## 📋 Features

✅ **Automatic History Tracking** - Captures every test run with detailed statistics
✅ **7-Day Auto Cleanup** - Automatically removes test runs older than 7 days
✅ **Failure Artifact Preservation** - Saves traces and screenshots from failed tests
✅ **Visual Dashboard** - Simple HTML dashboard with test trends and downloadable artifacts
✅ **No External Services** - Everything runs locally
✅ **Excludes Setup Project** - Ignores tests from "setup" project
✅ **Preserves Current Config** - Maintains all trace and screenshot configurations

## 🏗️ Architecture

### Components

1. **Custom Reporter** ([tests/reporters/history-reporter.ts](tests/reporters/history-reporter.ts))
   - Collects test results after each run
   - Copies failure artifacts (traces, screenshots)
   - Updates history index
   - Triggers automatic cleanup

2. **Cleanup Utility** ([tests/reporters/cleanup-old-runs.ts](tests/reporters/cleanup-old-runs.ts))
   - Removes runs older than 7 days
   - Provides storage size calculation
   - Formats file sizes for display

3. **HTML Dashboard** ([tests/report/test-history/index.html](tests/report/test-history/index.html))
   - Displays test trends over time
   - Shows detailed run information
   - Provides downloadable artifacts
   - Pure HTML/CSS/JavaScript (no build step)

### Directory Structure

```
tests/report/test-history/
├── index.html              # Dashboard UI
├── history-index.json      # Master index of all runs
└── runs/                   # Individual run artifacts
    └── YYYY-MM-DDTHH-MM-SS-SSSZ/
        ├── test-name-trace.zip
        └── test-name-screenshot.png
```

## 🚀 Usage

### Running Tests

Tests automatically track history when you run them:

```bash
# Run all tests
npm run test:all

# Run UI tests
npm run test:ui

# Run API tests
npm run test:api
```

### Viewing the Dashboard

Open the history dashboard in your browser:

```bash
npm run report:history
```

Or manually open: [tests/report/test-history/index.html](tests/report/test-history/index.html)

### Dashboard Features

1. **Statistics Overview**
   - Total runs tracked
   - Latest run statistics
   - Average pass rate

2. **Test Trend Chart**
   - Visual bar chart showing pass/fail over last 20 runs
   - Color-coded: Green (all passed), Red (has failures)
   - Hover to see detailed stats

3. **Recent Runs List**
   - Expandable run details
   - Failed test information
   - Download traces and screenshots
   - View error messages

## 📊 History Data Format

The `history-index.json` file stores run information:

```json
{
  "runs": [
    {
      "runId": "2026-03-14T17-47-22-250Z",
      "timestamp": "2026-03-14T17:47:39.199Z",
      "duration": 16948,
      "totalTests": 17,
      "passed": 17,
      "failed": 0,
      "skipped": 0,
      "flaky": 0,
      "failedTests": [
        {
          "title": "should login successfully",
          "file": "tests/ui-tests/login.spec.ts",
          "project": "ui-tests",
          "duration": 3042,
          "error": "Timeout 30000ms exceeded...",
          "artifacts": {
            "trace": "runs/2026-03-14T.../test-trace.zip",
            "screenshot": "runs/2026-03-14T.../test-screenshot.png"
          }
        }
      ]
    }
  ]
}
```

## ⚙️ Configuration

### Playwright Config

The reporter is configured in [playwright.config.ts](playwright.config.ts):

```typescript
reporter: [
  ["html", { outputFolder: playwrightReportDir }],
  ["./tests/reporters/history-reporter.ts"],
  ["list"],
  ["json", { outputFile: "./tests/report/test-results.json" }],
],
```

### Cleanup Settings

Modify cleanup settings in [tests/reporters/history-reporter.ts](tests/reporters/history-reporter.ts):

```typescript
// Current: 7 days retention
const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

// Example: Change to 14 days
const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
```

### History Limit

Maximum runs stored is controlled in the reporter:

```typescript
// Keep only last 30 runs
historyIndex.runs = historyIndex.runs.slice(0, 30);
```

## 🔍 How It Works

### 1. Test Execution
When tests run, Playwright's reporter API captures:
- Test results (passed, failed, skipped)
- Test durations
- Project names
- Error messages

### 2. Artifact Collection
For failed tests, the reporter:
- Identifies the project's output directory
- Searches for trace and screenshot files
- Copies artifacts to the history directory
- Links artifacts in the history index

### 3. History Update
After tests complete:
- Creates a new run entry
- Updates the history index
- Maintains max 30 runs
- Triggers cleanup

### 4. Cleanup Process
The cleanup utility:
- Reads the history index
- Identifies runs older than 7 days
- Deletes run directories
- Updates the index

## 📝 Important Notes

### Setup Project Exclusion
Tests from projects named "setup" are automatically excluded from tracking:

```typescript
if (test.parent?.project()?.name === "setup") {
  continue;
}
```

### Trace and Screenshot Config
The existing Playwright configuration is preserved:

```typescript
use: {
  trace: "retain-on-failure",  // Still captures traces on failure
  baseURL: "https://conduit.bondaracademy.com",
},

projects: [
  {
    name: "ui-tests",
    use: {
      screenshot: "only-on-failure",  // Still captures screenshots
    },
  },
]
```

### Artifact Storage
- Artifacts are only copied for **failed tests**
- Files are stored with sanitized test names
- Storage is automatically cleaned after 7 days

## 🐛 Troubleshooting

### Dashboard shows "No Test History Available"
- Run tests first to generate history
- Check that `tests/report/test-history/history-index.json` exists

### Artifacts not appearing
- Verify tests are actually failing
- Check project output directories exist
- Ensure sufficient disk space

### Old runs not cleaning up
- Check file permissions on `tests/report/test-history/`
- Verify dates in `history-index.json` are valid ISO strings
- Check console for cleanup errors

## 🔄 Migration from playwright-smart-reporter

The local history tracker was designed to replace `playwright-smart-reporter` with:

1. **No external dependencies** - Everything runs locally
2. **Simpler setup** - No npm package to install
3. **Full control** - Customize any aspect of tracking
4. **Artifact preservation** - Saves traces and screenshots

### What's Different

| Feature | Smart Reporter | Local Tracker |
|---------|---------------|---------------|
| Installation | npm package | Built-in |
| History Storage | JSON file | JSON file |
| Dashboard | HTML report | HTML dashboard |
| Cleanup | Manual/Config | Automatic (7 days) |
| Artifacts | Links only | Copied files |
| Customization | Limited | Full access |

## 📚 Additional Resources

- [Playwright Reporter API](https://playwright.dev/docs/test-reporters)
- [Playwright Artifacts](https://playwright.dev/docs/test-reporters#artifacts)
- [Test Configuration](https://playwright.dev/docs/test-configuration)

## 🤝 Contributing

To extend the history tracker:

1. **Modify the Reporter**: Edit [tests/reporters/history-reporter.ts](tests/reporters/history-reporter.ts)
2. **Update the Dashboard**: Edit [tests/report/test-history/index.html](tests/report/test-history/index.html)
3. **Add Cleanup Logic**: Edit [tests/reporters/cleanup-old-runs.ts](tests/reporters/cleanup-old-runs.ts)

---

**Version**: 1.0.0
**Last Updated**: March 14, 2026
