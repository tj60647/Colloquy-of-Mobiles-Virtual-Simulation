# Legacy (`lib/legacy/`)

This directory contains **legacy p5.js code** that will be replaced in future refactoring.

## Purpose

These files are **deprecated** and isolated here to:
1. Prevent accidental imports in new TypeScript code
2. Maintain backward compatibility with existing demos
3. Clearly mark code for future removal

⚠️ **Do not use these files in new code!**

---

## Files

| File | Description | Replacement |
|------|-------------|-------------|
| `Agent.js` | p5.js wrapper for Mobile | Use `Mobile.ts` |
| `Environment.js` | p5.js environment container | Use `Environment.ts` |
| `Render2Dp5.js` | p5.js 2D renderer | Create new renderer using `Mobile.ts` |
| `Render3Dp5.js` | p5.js 3D renderer | Use THREE.js wrappers in `visualization/` |
| `DebugUtility.js` | p5.js debug overlay | Create new debug UI |
| `UI_Utilities.js` | p5.js UI helpers | Use modern UI framework |
| `DriveVisualization.js` | p5.js drive chart | Create dashboard renderer |

---

## Why Legacy?

These files were created during the **2018 reconstruction** using p5.js. The current refactoring is migrating to:

1. **TypeScript** - Type safety, better tooling
2. **Platform-Agnostic Core** - Simulation runs in Node.js (server)
3. **Separate Visualization** - THREE.js for 3D, modern frameworks for UI
4. **Server/Client Architecture** - WebSocket communication

---

## Migration Path

### **For Demos Using Legacy Code:**

**Current (Legacy):**
```javascript
import { Agent } from '../lib/Agent.js';
import { Environment } from '../lib/Environment.js';
import { Render2Dp5 } from '../lib/Render2Dp5.js';

const agent = new Agent('Male 1', 60, 0, 0, 0, 0);
environment.addAgent(agent);
renderer.render();
```

**Future (TypeScript):**
```typescript
import { Mobile } from '../lib/Mobile';
import { Environment } from '../lib/Environment';
import { ThreeJSRenderer } from '../lib/visualization/ThreeJSRenderer';

const mobile = new Mobile({
    name: 'Male 1',
    initialPosition: { x: 0, y: 0, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 }
});
environment.addMobile(mobile);
renderer.render();
```

---

## Affected Demos

The following demos currently use legacy code:

- `apps/demo-02-oscillator/` - Uses `Agent.js`, `Environment.js`
- (Other demos may also use legacy code)

**Plan:** Refactor demos in Phase 3 after core simulation and network layer are complete.

---

## Deletion Timeline

**Phase 1 (Current):** ✅ Isolate legacy code in `lib/legacy/`  
**Phase 2:** Build network layer, server/client separation  
**Phase 3:** Refactor demos to use `Mobile.ts` + new renderers  
**Phase 4:** Delete `lib/legacy/` entirely

---

## Related Documentation

- `../subsystems/README.md` - New TypeScript subsystems
- `../components/README.md` - New TypeScript components
- `../visualization/README.md` - THREE.js wrappers (also need refactoring)
- `../../docs/REFACTORING_PLAN.md` - Overall migration strategy
