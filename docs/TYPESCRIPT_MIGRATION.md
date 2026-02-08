# TypeScript Migration Guide

## Overview

This project is undergoing a **gradual migration** from JavaScript to TypeScript. The migration strategy allows JS and TS files to coexist, enabling incremental conversion without breaking existing functionality.

## Current Status

✅ **TypeScript Setup Complete**

- `tsconfig.json` configured for gradual migration
- Shared type definitions created in `lib/types/`
- Build scripts added to `package.json`

⚠️ **Migration In Progress**

- Existing `lib/` classes are still JavaScript
- New code should be written in TypeScript
- Gradual conversion of existing classes ongoing

## Type Definitions

### `lib/types/`

All shared TypeScript interfaces and types are defined here:

- **`events.ts`** - Sensor event types (LightEvent, SoundEvent)
- **`state.ts`** - Mobile state, simulation state, interactions
- **`drives.ts`** - Drive system configuration and history
- **`websocket.ts`** - WebSocket message types
- **`index.ts`** - Re-exports all types for convenient importing

### Usage Example

```typescript
import { MobileState, DriveValues, SensorEvent } from './lib/types';

const mobile: MobileState = {
  id: 'male-1',
  type: 'Male',
  position: { x: 0, y: 0, z: 0 },
  orientation: { x: 1, y: 0, z: 0 },
  behavioralState: 'SatisfactionSearch',
  drives: { O: 75, P: 50 },
  dominantDrive: 'O',
};
```

## NPM Scripts

```bash
# Type-check without emitting files (fast, for development)
npm run type-check

# Build TypeScript to JavaScript (outputs to dist/)
npm run build

# Watch mode - rebuild on file changes
npm run watch

# Run the server (still uses JS for now)
npm start
```

## Migration Strategy

### Phase 1: Setup ✅ (Complete)

- Install TypeScript and dependencies
- Create `tsconfig.json` with lenient settings
- Create shared type definitions

### Phase 2: Core Library Migration (In Progress)

1. Rename classes based on `docs/terminology.md`
2. Convert `lib/` classes to TypeScript one-by-one
3. Start with foundational classes (Drive, Mobile)
4. Add proper type annotations

### Phase 3: Strictness Increase

Once core classes are migrated, gradually enable stricter TypeScript settings:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

### Phase 4: Full Migration

- Convert all apps to TypeScript
- Enable all strict checks
- Remove `allowJs` from tsconfig.json

## Best Practices

1. **New files**: Always use `.ts` extension
2. **Type imports**: Import types from `lib/types`
3. **Avoid `any`**: Use proper types or `unknown` if truly unknown
4. **Document types**: Add JSDoc comments to complex types
5. **Test incrementally**: Run `npm run type-check` frequently

## Troubleshooting

### "Cannot find module" errors

- Ensure `"moduleResolution": "node"` in tsconfig.json
- Check that imports use correct relative paths

### Type errors in JS files

- This is expected during migration
- Set `"checkJs": false` in tsconfig.json (already configured)

### Build errors

- Run `npm run type-check` to see detailed errors
- Fix type issues before running `npm run build`
