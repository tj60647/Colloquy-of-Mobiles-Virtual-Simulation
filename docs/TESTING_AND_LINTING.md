# Testing and Linting Guide

## Overview

This project uses **Jest** for testing and **ESLint + Prettier** for code quality and formatting. These tools form the "safety net" for refactoring and class migration.

---

## Testing with Jest

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test File Structure

Tests are located in `__tests__` directories next to the code they test:

```
lib/
├── types/
│   ├── __tests__/
│   │   └── types.test.ts
│   ├── events.ts
│   ├── state.ts
│   └── index.ts
```

### Writing Tests

Example test file:

```typescript
import { DriveValues, MobileState } from '../index';

describe('MobileState', () => {
  it('should create a valid Male mobile', () => {
    const mobile: MobileState = {
      id: 'male-1',
      type: 'Male',
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 1, y: 0, z: 0 },
      behavioralState: 'SatisfactionSearch',
      drives: { O: 75, P: 50 },
      dominantDrive: 'O',
    };

    expect(mobile.type).toBe('Male');
    expect(mobile.dominantDrive).toBe('O');
  });
});
```

### Test Coverage

Coverage reports are generated in the `coverage/` directory:

- `coverage/lcov-report/index.html` - Interactive HTML report
- `coverage/lcov.info` - Machine-readable format for CI/CD

**Target**: Aim for >80% coverage on core `lib/` classes before migration.

---

## Linting with ESLint

### Running Linter

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix
```

### ESLint Configuration

Located in `eslint.config.mjs` (ESLint 9+ flat config format).

**Current settings** (lenient during migration):

- `@typescript-eslint/no-explicit-any`: OFF - Allow `any` during migration
- `@typescript-eslint/no-unused-vars`: WARN - Warn but don't fail
- `no-console`: OFF - Allow console.log for debugging

**After migration**, we'll enable stricter rules:

```javascript
'@typescript-eslint/no-explicit-any': 'error',
'@typescript-eslint/strict-boolean-expressions': 'error',
```

---

## Code Formatting with Prettier

### Running Formatter

```bash
# Format all files
npm run format

# Check if files are formatted (CI/CD)
npm run format:check
```

### Prettier Configuration

Located in `.prettierrc`:

- **Semi-colons**: Yes
- **Single quotes**: Yes
- **Print width**: 100 characters
- **Tab width**: 2 spaces
- **Trailing commas**: ES5 style

### IDE Integration

**VS Code**: Install "Prettier - Code formatter" extension

- Enable "Format on Save" in settings
- Set Prettier as default formatter

---

## Pre-Migration Workflow

Before migrating any class to TypeScript:

### 1. Write Baseline Tests ✅ CRITICAL

```bash
# Create test file for the class
touch lib/__tests__/DriveManager.test.ts

# Write tests that verify current behavior
npm test
```

### 2. Run Linter

```bash
npm run lint
npm run lint:fix  # Auto-fix simple issues
```

### 3. Check Type Safety

```bash
npm run type-check
```

### 4. Migrate Class

- Rename `.js` to `.ts`
- Add type annotations
- Fix type errors

### 5. Verify Tests Still Pass ✅ CRITICAL

```bash
npm test
```

### 6. Run Full Quality Check

```bash
npm run type-check && npm run lint && npm test
```

---

## Continuous Integration (Future)

Once we set up GitHub Actions, every push will automatically:

1. Run `npm run type-check`
2. Run `npm run lint`
3. Run `npm test`
4. Generate coverage report

This ensures no breaking changes are merged.

---

## Best Practices

### Testing

1. **Test behavior, not implementation** - Focus on inputs/outputs
2. **One assertion per test** - Makes failures easier to debug
3. **Use descriptive test names** - `it('should decrement drive on successful interaction')`
4. **Test edge cases** - Boundary values, null/undefined, error conditions

### Linting

1. **Fix warnings before migration** - Clean slate for each class
2. **Don't disable rules without reason** - Document why if you must
3. **Run `lint:fix` frequently** - Catches issues early

### Formatting

1. **Let Prettier handle it** - Don't fight the formatter
2. **Format before committing** - Use pre-commit hooks (future)
3. **Consistent style** - Entire team uses same Prettier config

---

## Troubleshooting

### Jest: "Cannot find module"

- Check import paths are correct
- Ensure `moduleFileExtensions` in `jest.config.js` includes `.ts`

### ESLint: "Parsing error"

- Verify `@typescript-eslint/parser` is installed
- Check `eslint.config.mjs` has correct parser configuration

### Prettier: Not formatting

- Check file is not in `.prettierignore`
- Verify Prettier extension is installed and enabled in IDE

### Tests fail after migration

- **This is expected!** Migration may reveal bugs
- Fix bugs or update tests to match new behavior
- Document any intentional behavior changes
