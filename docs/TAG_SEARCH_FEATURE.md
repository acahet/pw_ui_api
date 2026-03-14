# Tag Search Feature Implementation Guide

## Overview
This guide documents the implementation of tag search functionality in the Playwright test history dashboard. This feature allows users to search for tests by their assigned tags (e.g., `@tags`, `@smoke`, `@regression`).

## Feature Description
The tag search feature enables users to:
- View test tags as visual badges in the test list
- Search for tests using tag names in the search box
- Filter tests by tags alongside title and project name searches

## Implementation Steps

### Step 1: Update Reporter Interface
**File**: `tests/reporters/history-reporter.ts`

Add `tags` field to the `TestInfo` interface:

```typescript
interface TestInfo {
    title: string;
    file: string;
    project: string;
    duration: number;
    status: string;
    error?: string;
    tags?: string[];  // Add this line
    artifacts: {
        trace?: string;
        screenshot?: string;
    };
}
```

### Step 2: Extract Tags in Reporter
**File**: `tests/reporters/history-reporter.ts`

Update the `createTestEntry` method to extract tags from test cases:

```typescript
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
        tags: testTags.length > 0 ? testTags : undefined,  // Add tags
        artifacts: {
            trace: undefined,
            screenshot: undefined,
        },
    };
}
```

### Step 3: Add CSS for Tag Badges
**File**: `tests/report/test-history/index.html`

Add styles for displaying tags as badges:

```css
.test-list-item-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85em;
    color: #6c757d;
    flex-wrap: wrap;
    gap: 8px;
}

.test-list-item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.test-tag {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.7em;
    font-weight: 500;
}
```

### Step 4: Update Data Collection
**File**: `tests/report/test-history/index.html`

Update `populateTestSelector` to include tags in test data:

```javascript
function populateTestSelector(runs) {
    currentHistoryData = runs;
    const testList = document.getElementById('testList');
    const uniqueTests = new Set();

    // Collect all unique tests
    runs.forEach(run => {
        if (run.allTests) {
            run.allTests.forEach(test => {
                uniqueTests.add(JSON.stringify({
                    title: test.title,
                    project: test.project,
                    file: test.file,
                    tags: test.tags || []  // Include tags
                }));
            });
        }
    });

    // Sort tests
    allTests = Array.from(uniqueTests)
        .map(t => JSON.parse(t))
        .sort((a, b) => {
            if (a.project !== b.project) return a.project.localeCompare(b.project);
            return a.title.localeCompare(b.title);
        });

    renderTestList(allTests);
}
```

### Step 5: Display Tags in Test List
**File**: `tests/report/test-history/index.html`

Update `renderTestList` to render tag badges:

```javascript
function renderTestList(tests) {
    const testList = document.getElementById('testList');

    if (tests.length === 0) {
        testList.innerHTML = '<div class="test-list-empty">No tests found</div>';
        return;
    }

    testList.innerHTML = tests.map((test, index) => {
        const testKey = `${test.project}:${test.title}`;
        const isSelected = selectedTestKey === testKey;
        const tagsHtml = test.tags && test.tags.length > 0
            ? `<div class="test-list-item-tags">${test.tags.map(tag => `<span class="test-tag">${tag}</span>`).join('')}</div>`
            : '';

        return `
            <div class="test-list-item ${isSelected ? 'selected' : ''}"
                 onclick="selectTest('${testKey.replace(/'/g, "\\'")}')"
                 data-test-key="${testKey}"
                 data-project="${test.project}"
                 data-title="${test.title}"
                 data-tags="${test.tags ? test.tags.join(',') : ''}">
                <div class="test-list-item-title">${test.title}</div>
                <div class="test-list-item-meta">
                    <span class="test-list-item-project">${test.project}</span>
                    ${tagsHtml}
                </div>
            </div>
        `;
    }).join('');
}
```

### Step 6: Update Search Filter
**File**: `tests/report/test-history/index.html`

Update `filterTestList` to search through tags:

```javascript
function filterTestList() {
    const searchInput = document.getElementById('testSearch');
    const searchTerm = searchInput.value.toLowerCase();

    const filteredTests = allTests.filter(test => {
        const matchTitle = test.title.toLowerCase().includes(searchTerm);
        const matchProject = test.project.toLowerCase().includes(searchTerm);
        const matchTags = test.tags && test.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        return matchTitle || matchProject || matchTags;
    });

    renderTestList(filteredTests);
}
```

## Testing the Feature

1. **Add tags to your tests**:
```typescript
test.describe(
    "Feature: Tags API",
    {
        tag: ["@tags", "@api"],
    },
    () => {
        test("GET tags", async ({ api }) => {
            // test code
        });
    },
);
```

2. **Run tests to generate history**:
```bash
npx playwright test
```

3. **View the dashboard**:
```bash
npm run report:history
```

4. **Search by tag**:
   - Open the dashboard in your browser
   - Switch to "Individual Test Trend" view
   - Type a tag name (e.g., `@tags`) in the search box
   - Tests with matching tags will be filtered and displayed with their tag badges

## Key Points

- **Tag Source**: Tags are extracted from `TestCase.tags` property (not from Suite)
- **Storage**: Tags are stored as string arrays in the history JSON files
- **Display**: Tags appear as colorful gradient badges next to the project name
- **Search**: Search is case-insensitive and matches partial tag names
- **Compatibility**: Works with Playwright's built-in `tag` option in `test.describe()`

## Benefits

1. **Quick Filtering**: Instantly find tests by their functional category or type
2. **Visual Organization**: Tags provide visual cues about test categorization
3. **Better Test Management**: Easily identify smoke tests, regression tests, or feature-specific tests
4. **Enhanced Discoverability**: Find related tests across different projects or suites

## Future Enhancements

Potential improvements:
- Tag-based grouping in the dashboard
- Tag statistics (number of tests per tag)
- Multi-tag filtering (AND/OR logic)
- Tag color customization
- Tag cloud visualization
