# Contributing to SecretVault

Thank you for your interest in contributing! Please follow these guidelines.

## Git Branch Naming

### Branch Types

Branch names follow the pattern: `<type>/<issue-number>-<description>`

| Type        | Purpose                       | Example                            | Parent Branch |
| ----------- | ----------------------------- | ---------------------------------- | ------------- |
| `feat/`     | New features and enhancements | `feat/123-add-vault-ui`            | `develop`     |
| `fix/`      | Bug fixes in development      | `fix/456-auth-leak`                | `develop`     |
| `hotfix/`   | Critical production bugs      | `hotfix/789-token-expire-crash`    | `main`        |
| `release/`  | Version releases              | `release/v1.2.0`                   | `develop`     |
| `docs/`     | Documentation updates         | `docs/123-update-readme`           | `develop`     |
| `refactor/` | Code refactoring              | `refactor/150-simplify-auth-logic` | `develop`     |
| `perf/`     | Performance improvements      | `perf/151-optimize-vault-queries`  | `develop`     |
| `test/`     | Test improvements             | `test/152-add-encryption-tests`    | `develop`     |
| `ci/`       | CI/CD pipeline updates        | `ci/153-add-github-actions`        | `develop`     |
| `chore/`    | Maintenance and dependencies  | `chore/154-update-dependencies`    | `develop`     |
| `style/`    | Code style and formatting     | `style/155-fix-linting-issues`     | `develop`     |

#### Feature Branches (`feat/`)

Used for new features and enhancements.

```
feat/123-add-vault-ui
feat/124-implement-search-filter
feat/125-add-two-factor-auth
```

**When to use:**

- Adding new functionality
- Implementing new endpoints
- Creating new components or pages
- Feature requests from issues

#### Bug Fix Branches (`fix/`)

Used for fixing bugs and issues in development.

```
fix/456-auth-leak
fix/457-fix-vault-loading-timeout
fix/458-correct-encryption-algorithm
```

**When to use:**

- Fixing bugs reported in issues
- Addressing code defects
- Resolving failing tests
- General bug fixes in develop

#### Hotfix Branches (`hotfix/`)

Used for critical fixes in production that need immediate attention.

```
hotfix/789-token-expire-crash
hotfix/790-critical-security-patch
```

**When to use:**

- Critical production bugs
- Security vulnerabilities
- Data loss issues
- Urgent fixes that can't wait for the next release

#### Release Branches (`release/`)

Used for preparing a new release version.

```
release/v1.2.0
release/v1.3.0-rc1
```

**When to use:**

- Preparing release versions
- Version bumping
- Final testing before production
- Release notes and changelog updates

#### Documentation Branches (`docs/`)

Used for documentation updates.

```
docs/123-update-contributing-guide
docs/124-add-api-documentation
```

**When to use:**

- Documentation improvements
- README updates
- Adding guides or tutorials
- API documentation changes

### Naming Rules

1. **Format:** `<type>/<issue-number>-<description>`
2. **Case:** Lowercase only, no uppercase letters
3. **Separators:** Use hyphens (`-`) only, no underscores or spaces
4. **Issue Number:** Include when the branch is tied to a GitHub issue (highly recommended)
5. **Description:** Brief, descriptive, 2-4 words maximum
6. **Length:** Keep the entire branch name under 50 characters
7. **No special characters:** Avoid dots, slashes (except the type separator), and other special characters

### Examples

✅ **Good branch names:**

```
feat/89-add-vault-encryption
fix/90-resolve-memory-leak
hotfix/91-critical-auth-bug
release/v2.0.0
docs/92-update-readme
```

❌ **Bad branch names:**

```
Feature/Add-New-Feature         # Wrong type format
fix_issue_123                   # Uses underscore instead of hyphen
hotfix/this-is-a-very-long-branch-description-that-exceeds-the-character-limit
my-new-feature                  # Missing type prefix
feat/123-ADD-VAULT-UI           # Contains uppercase
```

### Before Creating a Branch

1. Ensure a GitHub issue exists for your work (if applicable)
2. Get the issue number
3. Determine the appropriate branch type
4. Create a descriptive but concise name
5. Create the branch from the correct parent:
   - Feature/fix branches: branch from `develop`
   - Hotfix branches: branch from `main`
   - Release branches: branch from `develop`

## Commit Messages

Follow [Conventional Commits](CONVENTIONAL_COMMITS.md):

```
feat: add user vault dashboard (#123)

Implement vault listing with search and pagination.

Closes #123
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ops`, `chore`

## Pull Requests

Create PRs from feature/fix branches **into `develop`**.

```markdown
## Changes

- Add vault listing component
- Implement search functionality

## Testing

- [x] Unit tests pass
- [x] E2E tests pass

Closes #123
```

## Workflow

1. Create branch: `feat/123-description`
2. Commit with Conventional Commits
3. Push and create PR to `develop`
4. Address review feedback
5. Merge and delete branch

## Questions?

Open a GitHub Issue or ask in Discussions.