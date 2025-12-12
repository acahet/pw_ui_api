# Playwright Automation Framework - UI & API Testing

A comprehensive test automation framework using [Playwright](https://playwright.dev) for end-to-end UI and API testing. Built with TypeScript for type safety and configured with modern development tooling.

**Repository**: [acahet/playwright-template](https://github.com/acahet/playwright-template)  
**Author**: Anderson Cahet  
**License**: MIT

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Code Quality](#code-quality)
- [CI/CD Pipeline](#cicd-pipeline)
- [Development](#development)
- [Contributing](#contributing)

## Overview

This framework provides:

- **UI Testing**: End-to-end browser testing with Playwright (Chromium)
- **API Testing**: RESTful API validation with type-safe request/response handling
- **Schema Validation**: JSON schema validation for API responses
- **Custom Fixtures**: Reusable test fixtures for authentication, API clients, and page objects
- **Type Safety**: Full TypeScript support with strict type checking
- **Page Object Model**: Organized page object structure for maintainability
- **Reporting**: HTML reports with detailed test results and traces
- **CI/CD Integration**: Automated testing on every push and pull request

## Project Structure

```
pw_ui_api/
├── .github/
│   ├── workflows/
│   │   ├── lint.yml              # ESLint & Biome format checks
│   │   ├── playwright.yml        # Playwright test execution
│   │   └── pr-title-check.yml    # PR title validation
│   └── dependabot.yml            # Dependency update automation
│
├── tests/
│   ├── api-tests/                # API test suites
│   │   ├── articles/             # Article endpoints tests
│   │   ├── tags/                 # Tags endpoint tests
│   │   └── user/                 # User-related API tests
│   │       ├── login/
│   │       ├── profile/
│   │       ├── articles/
│   │       └── signup/
│   │
│   ├── ui-tests/                 # UI test suites
│   │   ├── feature/              # Feature test scenarios
│   │   │   └── login/
│   │   └── pages/                # Page Object Model definitions
│   │       ├── Homepage/
│   │       └── LoginPage/
│   │
│   ├── config/                   # Test configuration
│   │   ├── api-test.config.ts    # API configuration
│   │   ├── types/                # TypeScript type definitions
│   │   └── urls/                 # Environment-specific URLs
│   │
│   ├── utils/                    # Utility functions
│   │   ├── constants.ts          # API endpoints & HTTP status codes
│   │   ├── custom-expect.ts      # Custom assertion matchers
│   │   ├── logger.ts             # Request/response logging
│   │   ├── request-handler.ts    # HTTP client wrapper
│   │   ├── schema-validator.ts   # JSON schema validation
│   │   └── data-generator.ts     # Test data generation
│   │
│   ├── helpers/                  # Test helpers
│   │   └── createToken.ts        # Authentication token generation
│   │
│   ├── fixtures.ts               # Playwright test fixtures
│   └── report/                   # Test reports and artifacts
│
├── request-objects/              # Request payload templates
│   ├── articles/
│   └── user/
│
├── response-schemas/             # JSON schema definitions
│   ├── articles/
│   ├── profiles/
│   ├── tags/
│   └── users/
│
├── playwright.config.ts          # Playwright configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.js              # ESLint configuration
├── biome.json                    # Biome formatter/linter config
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm** or **yarn**: Package manager
- **Git**: Version control

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/acahet/playwright-template.git
   cd pw_ui_api
   ```

2. **Install dependencies**
   ```bash
   npm install -g yarn
   yarn
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install chromium
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   EMAIL_API=your-email@example.com
   PASSWORD_API=your-password
   API_URL=https://your-api-url
   TEST_ENV=qa        # or 'prod'
   LOCALE=br          # or 'en' for English
   ```

## Configuration

### Playwright Config (`playwright.config.ts`)

- **Base URL**: https://conduit.bondaracademy.com
- **Projects**: 
  - `ui-tests` - UI testing with Chromium
  - `api-tests` - API testing with 1 worker
- **Retries**: 2 on CI, 0 locally
- **Reporting**: HTML reports saved to `tests/report/playwright-report`
- **Trace**: Retained on test failure for debugging

### TypeScript Paths (`tsconfig.json`)

Configured path aliases for cleaner imports:
- `@fixtures` → `tests/fixtures.ts`
- `@config` → `tests/config/index.ts`
- `@pages/*` → `tests/ui-tests/pages/*`
- `@features/*` → `tests/ui-tests/feature/*`
- `@utils/*` → `tests/utils/*`
- `@helpers/*` → `tests/helpers/*`

## Running Tests

### Execute all tests
```bash
yarn test:all
```

### Run UI tests only
```bash
yarn test:ui
```

### Run API tests only
```bash
yarn test:api
```

### Interactive test mode (UI mode)
```bash
yarn test:ui-mode
```

### View test report
```bash
yarn report
```

### Watch mode (for development)
```bash
npx playwright test --watch
```

## Code Quality

### Linting

Run ESLint to check for code issues:
```bash
yarn lint
```

### Code Formatting

Format code with Biome:
```bash
yarn code:format
```

Biome provides:
- Code formatting with consistent style
- Import organization
- Basic linting rules

**Configuration**: `biome.json`
- **Indent**: Tabs
- **Quote Style**: Double quotes for JavaScript
- **Trailing Commas**: All
- **Arrow Parentheses**: Always

### Tools

- **ESLint**: JavaScript/TypeScript linting
- **Biome**: Modern formatter and linter
- **TypeScript**: Static type checking

## CI/CD Pipeline

### Workflows

#### 1. **Lint & Format Check** (`.github/workflows/lint.yml`)
- Triggers on every push and pull request to `main`/`master`
- Runs ESLint checks
- Runs Biome format verification
- Blocks merge if checks fail

#### 2. **Playwright Tests** (`.github/workflows/playwright.yml`)
- Executes on changes to `tests/` directory
- Caches Node modules and Playwright browsers
- Runs both UI and API tests
- Uploads test reports on failure

#### 3. **PR Title Check** (`.github/workflows/pr-title-check.yml`)
- Validates PR titles follow semantic commit conventions
- Supported types: `feat`, `fix`, `chore`, `build`, `ci`, `docs`, `style`, `refactor`, `perf`, `test`

#### 4. **Dependabot** (`.github/dependabot.yml`)
- Weekly dependency updates (Mondays at 9:00 AM UTC)
- Automatic PR creation for updates
- Assigned to: acahet

## Development

### Project Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Playwright | ^1.57.0 | Browser automation & API testing |
| TypeScript | ^5.9.3 | Type-safe development |
| ESLint | ^9.39.1 | Code linting |
| Biome | ^2.3.8 | Code formatting |
| Faker | ^10.1.0 | Test data generation |
| AJV | ^8.17.1 | JSON schema validation |
| Dotenv | ^17.2.3 | Environment variable management |

### Creating a New Test

1. **UI Test**:
   ```typescript
   // tests/ui-tests/feature/example/example.spec.ts
   import { test } from '@fixtures';
   
   test('example test', async ({ page, loginPage }) => {
     await page.goto('/');
     // Test steps here
   });
   ```

2. **API Test**:
   ```typescript
   // tests/api-tests/example/example.spec.ts
   import { test } from '@fixtures';
   
   test('example API test', async ({ api, endpoints, httpStatus }) => {
     const response = await api
       .path(endpoints.users)
       .getRequest(httpStatus.Status200_Ok);
     // Assertions here
   });
   ```

### Custom Fixtures

Available fixtures in `tests/fixtures.ts`:
- `api` - HTTP request handler with authentication
- `endpoints` - Centralized API endpoints
- `httpStatus` - HTTP status code constants
- `config` - Test configuration
- `validateSchema` - JSON schema validation
- `loginPage` - Login page object
- `homePage` - Home page object
- `authToken` - Authentication token (worker-scoped)

### Data Validation

Schema validation for API responses:
```typescript
await expect(response).shouldMatchSchema('users', 'GET_user');
```

Custom assertions:
```typescript
await expect(value).shouldBeEqual(expected);
await expect(value).shouldBeLessThanOrEqual(expected);
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and ensure tests pass
3. Format code: `yarn code:format`
4. Lint: `yarn lint`
5. Commit with semantic message: `git commit -m "feat: add new feature"`
6. Push and open a pull request

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `chore:` Maintenance tasks
- `build:` Build system changes
- `ci:` CI/CD changes
- `docs:` Documentation
- `style:` Code style (formatting)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test additions/updates
