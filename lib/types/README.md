# Type Definitions (`lib/types/`)

This directory contains **TypeScript type definitions** (interfaces, types, enums) for **data contracts** used across the simulation system.

## Purpose

These are **pure type definitions** (no runtime code) used for:

1. **Network Communication** - WebSocket message formats between server and clients
2. **Serialization** - JSON structure for state snapshots and persistence
3. **Configuration** - Drive system and subsystem configuration schemas
4. **Type Safety** - Shared contracts across modules

**Important:** These files compile to **nothing** in JavaScript (types are erased at compile time). They exist solely for TypeScript type checking.

---

## Directory Structure

```
types/
├── drives.ts       # Drive system configuration types
├── events.ts       # Event types (sensor events, interactions)
├── state.ts        # Simulation state types (for network/serialization)
├── websocket.ts    # WebSocket message types
├── math.ts         # Math utility types
└── index.ts        # Re-exports all types
```

---

## Difference from `components/`

| `types/` | `components/` |
|----------|---------------|
| **Type definitions** (interfaces) | **Runtime classes** (implementations) |
| Erased at compile time | Compiled to JavaScript |
| Data contracts | Simulation logic |
| `interface MobileState` | `class Mobile extends Transform` |
| Used for network/serialization | Used for scene graph |

**Example:**

```typescript
// types/state.ts - Type definition (no runtime code)
export interface MobileState {
    id: string;
    position: { x: number, y: number, z: number };
    // ...
}

// components/SensorBase.ts - Runtime class
export class SensorBase extends Transform {
    sense(): number {
        // Actual implementation
    }
}
```

---

## Usage

### Import Types

```typescript
import { MobileState, SimulationState } from './types';
import { DriveConfig, DriveSystemConfig } from './types/drives';
import { WebSocketMessage } from './types/websocket';
```

### Network Communication

```typescript
// Server broadcasts state
const state: SimulationState = {
    mobiles: environment.mobiles.map(m => m.toJSON()),
    interactions: [],
    timestamp: Date.now()
};
websocket.broadcast({ type: 'state_update', state });
```

### Configuration

```typescript
// Load drive config
const driveConfig: DriveSystemConfig = {
    O: { initialValue: 500, floor: 0, ... },
    P: { initialValue: 500, floor: 0, ... },
    interval: 1000,
    maxHistorySamples: 100
};
const driveSubsystem = new DriveSubsystem(driveConfig);
```

---

## Design Principles

1. **Single Source of Truth** - Avoid duplicating types that exist elsewhere (e.g., use `Vector3` from `math/`, not a custom `Vector3D` interface)
2. **Network-First** - Types here should match JSON wire formats
3. **Backward Compatibility** - Include legacy types (e.g., `LegacyDriveState`) for gradual migration
4. **Documentation** - Each type should have JSDoc comments explaining its purpose

---

## Migration Notes

Some types in this directory may duplicate runtime class structures (e.g., `MobileState` vs `Mobile.toJSON()`). This is intentional for:

- **Decoupling** - Network clients don't need to import the full `Mobile` class
- **Versioning** - Network format can evolve independently of implementation
- **Validation** - Explicit types for JSON validation

However, we should ensure they stay in sync. Consider using:

```typescript
// Derive network type from runtime class
export type MobileState = ReturnType<Mobile['toJSON']>;
```

---

## Related Documentation

- `../components/README.md` - Runtime component classes
- `../math/README.md` - Math utilities
- `../../docs/terminology.md` - Canonical Pask terminology
- `../../readme.md` (lines 122-148) - Server/client architecture
