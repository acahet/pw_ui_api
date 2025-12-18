# Husky Git Hooks Setup

This document provides details about the Husky git hooks configured in this repository.

## Overview

Husky is configured to automatically enforce code quality and commit conventions through git hooks. This ensures that all commits meet the project's standards before they are created.

## Hooks Configured

### 1. Pre-commit Hook (`.husky/pre-commit`)

**Purpose**: Ensures code quality before allowing a commit.

**What it does**:
1. Runs Biome format check on the `tests/` directory
2. Runs ESLint to check for code issues
3. Blocks the commit if either check fails

**Example output** (success):
```
Running format check with Biome...
Checked 37 files in 7ms. No fixes applied.
Running lint check with ESLint...
✅ All pre-commit checks passed!
```

**Example output** (failure):
```
Running format check with Biome...
❌ Format check failed! Please run 'yarn code:format' to fix formatting issues.
```

**How to fix failures**:
```bash
# Fix formatting issues
yarn code:format

# Check and fix linting issues
yarn lint
```

### 2. Commit Message Hook (`.husky/commit-msg`)

**Purpose**: Validates commit messages follow conventional commit format.

**What it does**:
1. Validates that the commit message follows the format: `<type>(<optional scope>): <description>`
2. Checks if the branch name follows the recommended naming convention (warning only)
3. Blocks the commit if the message format is invalid

**Valid commit types**:
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/updates

**Valid commit examples**:
```bash
git commit -m "feat: add user authentication"
git commit -m "fix(api): resolve login endpoint issue"
git commit -m "chore: update dependencies"
git commit -m "docs: update README with setup instructions"
```

**Invalid commit examples**:
```bash
git commit -m "added new feature"           # ❌ Missing type prefix
git commit -m "Feature: add login"          # ❌ Invalid type (should be lowercase)
git commit -m "fix:"                        # ❌ Missing description
```

**Branch naming convention** (recommended):
```
<type>/<description>

Examples:
- feat/add-user-profile
- fix/auth-bug
- chore/update-deps
- docs/update-readme
```

Note: Branch naming is not strictly enforced - it will show a warning but won't block the commit.

## Installation

Husky is automatically set up when you install dependencies:

```bash
yarn install
```

This runs the `prepare` script in `package.json`, which initializes Husky.

## Manual Setup

If you need to manually set up Husky:

```bash
# Install Husky
yarn add -D husky

# Initialize Husky
npx husky init

# The hooks are already configured in .husky/ directory
```

## Bypassing Hooks (Emergency Only)

In rare cases where you need to bypass the hooks (not recommended):

```bash
git commit --no-verify -m "emergency fix"
```

**Warning**: Only use this in emergencies, as it bypasses all quality checks.

## Scripts in package.json

The following scripts are used by the hooks:

```json
{
  "lint": "npx eslint",
  "lint:check": "npx eslint",
  "code:format": "biome format --write tests",
  "code:format:check": "biome format tests",
  "prepare": "husky"
}
```

- `lint` / `lint:check`: Runs ESLint
- `code:format`: Formats code with Biome (writes changes)
- `code:format:check`: Checks formatting without making changes
- `prepare`: Initializes Husky (runs automatically during `yarn install`)

## Troubleshooting

### Hook doesn't run

If the hooks don't run when you commit:

1. Check that Husky is installed: `ls .husky/`
2. Ensure hooks are executable: `chmod +x .husky/pre-commit .husky/commit-msg`
3. Reinstall Husky: `yarn install`

### Format check fails

```bash
# Fix all formatting issues automatically
yarn code:format
```

### Lint check fails

```bash
# Run lint to see issues
yarn lint

# Fix issues manually in your editor/IDE
```

### Commit message validation fails

Make sure your commit message follows the format:
- Starts with a valid type (`feat`, `fix`, `chore`, etc.)
- Has a colon after the type (and optional scope)
- Has a space after the colon
- Has a meaningful description

Example: `feat: add user login page`

## CI/CD Integration

The same checks that run in the git hooks also run in the CI/CD pipeline:

- **Lint & Format Check** (`.github/workflows/lint.yml`): Runs ESLint and Biome format checks
- **PR Title Check** (`.github/workflows/pr-title-check.yml`): Validates PR titles follow the same convention as commit messages

This ensures consistency between local development and CI/CD.

## Benefits

1. **Prevents bad commits**: Catches formatting and linting issues before they're committed
2. **Enforces consistency**: All commits follow the same message format
3. **Faster CI/CD**: Issues are caught locally before pushing to CI
4. **Better git history**: Clean, consistent commit messages make the history easier to read
5. **Automated quality checks**: No need to remember to run format/lint manually

## Related Documentation

- [Husky Documentation](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Biome Documentation](https://biomejs.dev/)
- [ESLint Documentation](https://eslint.org/)
