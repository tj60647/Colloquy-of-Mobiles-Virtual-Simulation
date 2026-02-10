# TypeScript Refactoring & Reorganization Plan

## Overview

This document tracks the migration from legacy JavaScript/p5.js to a modern TypeScript architecture. The goal is to align the codebase with:
- Canonical terminology from `docs/terminology.md`
- Server/client architecture from `README.md`
- Clean separation of concerns (simulation vs visualization)

---

## Execution Status

| Status | Phase | Description |
| :--- | :--- | :--- |
| ✅ | **Phase 1: Setup** | TypeScript, Jest, ESLint, Prettier |
| ✅ | **Phase 2: Core Migration** | Core classes (Mobile, Transform, Environment) |
| ✅ | **Phase 3: Subsystems** | Drive system, oscillators, motion profiles |
| ✅ | **Phase 4: Components** | Sensors and actuators |
| ✅ | **Phase 5: Library Reorganization** | Directory structure cleanup |
| ✅ | **Phase 6: Type Cleanup** | Remove duplicates, add documentation |
| ✅ | **Phase 7: Config Loader & Schema** | Config V2, SceneGraphLoader, full validation |
| ⏳ | **Phase 7.5: Communication System** | Pulse transmission, pattern vocabulary, message passing |
| ⏳ | **Phase 8: Network Layer** | WebSocket server/client |
| ⏳ | **Phase 9: Visualization Refactor** | Separate rendering from simulation |
| ⏳ | **Phase 10: Demo Migration** | Update demos to use new architecture |

---

## Phase 2: Core Logic Migration ✅ COMPLETE

**Goal:** Establish foundational classes with strict typing.

| Legacy File | New TypeScript File | Status | Notes |
| :--- | :--- | :--- | :--- |
| `Agent.js` | `lib/Mobile.ts` | ✅ | "Mobile" is Pask's canonical term |
| `Environment.js` (TS) | `lib/Environment.ts` | ✅ | Simulation container (not renamed to SimulationLoop) |
| N/A | `lib/Transform.ts` | ✅ | Scene graph base class (new) |

**Rationale for Environment:**
- Kept as `Environment` due to its special significance in cybernetics
- Represents the shared context for agent interaction
- Not just a loop orchestrator, but the "world" itself

---

## Phase 3: Subsystems ✅ COMPLETE

**Goal:** Migrate Paskian internal mechanisms (drives, motors).

| Legacy File | New TypeScript File | Status | Notes |
| :--- | :--- | :--- | :--- |
| `Drive.js` | `lib/subsystems/Drive.ts` | ✅ | Individual drive (O or P) |
| `DriveManager.js` | `lib/subsystems/DriveSubsystem.ts` | ✅ | "Subsystem" is canonical term |
| `MotionProfile.js` | `lib/subsystems/MotionProfile.ts` | ✅ | Movement characteristics |
| `Oscillator.js` | `lib/subsystems/Oscillator.ts` | ✅ | Generic servomotor |
| N/A | `lib/subsystems/HorizontalControlSubsystem.ts` | ✅ | Yaw rotation (all Mobiles) |
| N/A | `lib/subsystems/VerticalControlSubsystem.ts` | ✅ | Roll rotation (Females only) |

**Directory:** `lib/subsystems/` - Internal mechanisms of Mobiles

---

## Phase 4: Components ✅ COMPLETE

**Goal:** Migrate sensors and actuators (external attachments).

| Legacy File | New TypeScript File | Status | Notes |
| :--- | :--- | :--- | :--- |
| `Sensor.js` | `lib/components/SensorBase.ts` | ✅ | Base class for sensors |
| `LightSensor.js` | `lib/components/LightSensor.ts` | ✅ | Detects light intensity |
| `SoundSensor.js` | `lib/components/SoundSensor.ts` | ✅ | Detects sound frequencies |
| `Actuator.js` | `lib/components/ActuatorBase.ts` | ✅ | Base class for actuators |
| `LightActuator.js` | `lib/components/LightActuator.ts` | ✅ | Emits light (reflector) |
| `SoundActuator.js` | `lib/components/SoundActuator.ts` | ✅ | Emits sound (speaker) |

**Directory:** `lib/components/` - External attachments to Mobiles

---

## Phase 5: Library Reorganization ✅ COMPLETE

**Goal:** Clean directory structure with clear separation of concerns.

### **New Structure:**

```
lib/
├── Mobile.ts                    # Core: Top-level entity
├── Environment.ts               # Core: Simulation container
├── Transform.ts                 # Core: Scene graph base
│
├── subsystems/                  # Paskian internal systems
│   ├── Drive.ts
│   ├── DriveSubsystem.ts
│   ├── Oscillator.ts
│   ├── MotionProfile.ts
│   ├── HorizontalControlSubsystem.ts
│   ├── VerticalControlSubsystem.ts
│   └── README.md
│
├── components/                  # Sensors & Actuators
│   ├── SensorBase.ts
│   ├── ActuatorBase.ts
│   ├── LightSensor.ts
│   ├── SoundSensor.ts
│   ├── LightActuator.ts
│   ├── SoundActuator.ts
│   └── README.md
│
├── visualization/               # THREE.js wrappers (legacy)
│   ├── Actuator_Light_THREE.js
│   ├── Actuator_Sound_THREE.js
│   ├── Actuator_THREE.js
│   ├── Sensor_THREE.js
│   ├── Transducer_THREE.js
│   ├── Transform_THREE.js
│   ├── OscillatorSystem_THREE.js
│   ├── cameraUtilities.js
│   └── README.md
│
├── legacy/                      # Deprecated p5.js code
│   ├── Agent.js
│   ├── Environment.js
│   ├── Render2Dp5.js
│   ├── Render3Dp5.js
│   ├── DebugUtility.js
│   ├── UI_Utilities.js
│   ├── DriveVisualization.js
│   └── README.md
│
├── math/                        # Math utilities
│   └── Vector3.ts
│
├── types/                       # Type definitions
│   ├── drives.ts
│   ├── events.ts
│   ├── state.ts
│   ├── websocket.ts
│   ├── math.ts
│   ├── index.ts
│   └── README.md
│
└── __tests__/                   # Tests
    └── ...
```

**Changes:**
- Created `subsystems/` for Paskian internal systems
- Created `visualization/` for THREE.js wrappers
- Created `legacy/` for deprecated p5.js code
- Added README.md to each directory

---

## Phase 6: Type Cleanup ✅ COMPLETE

**Goal:** Remove duplicate type definitions, add documentation.

| Task | Status | Notes |
| :--- | :--- | :--- |
| Remove `Vector3D` duplicate | ✅ | Used `Vector3` class from `math/` |
| Fix `types/math.ts` | ✅ | Changed to re-export from `math/Vector3` |
| Add `types/README.md` | ✅ | Explains purpose and usage |
| Enhance JSDoc headers | ✅ | All type files documented |

---

## Phase 7: Config Loader & JSON Schema ✅ COMPLETE

**Goal:** Create JSON Schema for validation and implement config file parser to instantiate scene graph.

### **Completed:**

| Task | Status | Notes |
| :--- | :--- | :--- |
| Create JSON Schema | ✅ | `simulation-config-v2.schema.json` |
| Add schema reference to configs | ✅ | `config_v2.json` validates |
| Create `SceneGraphLoader.ts` | ✅ | Config v2 + Hybrid Scene Graph |
| Implement coordinate system creation | ✅ | Flat transform parsing |
| Implement Mobile instantiation logic | ✅ | Mobile-centric loader |
| Implement agent discovery | ✅ | Handled via Mobile definitions |
| Implement component creation | ✅ | Sensors/actuators attached |
| Implement subsystem attachment | ✅ | Oscillators linked to transforms |
| Add validation and error handling | ✅ | Robust lookups |
| Create tests | ✅ | `test-loader.ts` integration test |

**Files Created:**
- `apps/SimulationConfigurationFiles/simulation-config-v2.schema.json`
- `apps/SimulationConfigurationFiles/config_v2.json`
- `lib/SceneGraphLoader.ts`
- `test-loader.ts`

**Design Decision:**
Moved to a **Config V2 (Hybrid)** format:
- Flattened coordinate systems to avoid deep nesting.
- Explicit `mobileType` and subtypes (`horizontal_control`) for type safety.
- Complete metadata (drives, FOV, motion profiles) included in config.


---

## Phase 7.5: Communication System ⏳ PLANNED

**Goal:** Implement pulse transmission infrastructure for social behavior (sense-logic-act loop).

**Critical Gap:** The TypeScript core (Phases 1-7) implements spatial positioning, drives, and motion control, but lacks the **temporal pulse patterns** that enable Mobiles to communicate socially. This infrastructure must exist before Complete Mobile demos (Tier 3/4).

| Task | Status | Notes |
| :--- | :--- | :--- |
| Create `lib/types/messages.ts` | ⏳ | `PulseMessage` interface |
| Create `lib/components/PulseTransmitter.ts` | ⏳ | Binary pattern transmission |
| Create `lib/components/PulseReceiver.ts` | ⏳ | Circular buffer, pattern matching |
| Create `lib/communication/PaskPatterns.ts` | ⏳ | Communication vocabulary (I_O, I_P, II_O, etc.) |
| Update `lib/Environment.ts` | ⏳ | Add message broker functionality |
| Update `lib/Mobile.ts` | ⏳ | Integrate transmitters/receivers |
| Create Demo 5.5 | ⏳ | Pulse communication visualization |

**Architecture Pattern:**
```
SENSE Phase:    Receivers populate circular buffer from incoming pulses
LOGIC Phase:    Pattern recognition → Drive evaluation → Pattern selection
                (Full logic implemented in Tier 3/4 demos)
ACT Phase:      Send pulses from transmit buffer
```

**Scope:** Implements infrastructure (buffers, transmission mechanics, pattern constants, visualization). Higher-order logic (drive-based pattern selection, behavioral responses) comes in Complete Mobile demos.

**Reference:** Based on `apps/demo-05-transceiversV2` (Actor model with pulse patterns)

**Documentation:** See `docs/PULSE_COMMUNICATION_ARCHITECTURE.md` for complete analysis.

---

## Phase 8: Network Layer ⏳ PLANNED

**Goal:** WebSocket server/client for distributed simulation.

| Task | Status | Notes |
| :--- | :--- | :--- |
| Create `SimulationServer.ts` | ⏳ | WebSocket hub |
| Implement state broadcast | ⏳ | Send `SimulationState` to clients |
| Implement sensor event handling | ⏳ | Receive `SensorEvent` from stations |
| Create client connection manager | ⏳ | Track connected clients |
| Add authentication/authorization | ⏳ | Secure connections |

**Architecture:**
```
[Sensor Stations] --sensor_event--> [Server] --state_update--> [Viewing Lenses]
                                       ↕
                                  [Dashboard]
```

---

## Phase 9: Visualization Refactor ⏳ PLANNED

**Goal:** Separate rendering from simulation, create pure adapters.

### **Current Issues:**
- THREE.js wrappers in `visualization/` are tightly coupled to simulation
- Mixed concerns (visualization modifies simulation state)
- Legacy p5.js patterns

### **Planned Changes:**

| Legacy File | New TypeScript File | Status | Notes |
| :--- | :--- | :--- | :--- |
| `Render2Dp5.js` | DELETE | ⏳ | Replace with new renderer |
| `Render3Dp5.js` | DELETE | ⏳ | Replace with new renderer |
| `*_THREE.js` | `visualization/renderers/ThreeJSRenderer.ts` | ⏳ | Pure adapter pattern |
| N/A | `visualization/renderers/WebXRRenderer.ts` | ⏳ | VR/AR support |
| N/A | `visualization/renderers/DashboardRenderer.ts` | ⏳ | Charts/graphs |
| `cameraUtilities.js` | `visualization/utils/CameraUtils.ts` | ⏳ | TypeScript conversion |

**Principles:**
1. **Pure Adapters** - Renderers only **read** simulation state, never modify
2. **State Snapshots** - Consume `toJSON()` output, not direct object references
3. **Client-Only** - Visualization code never runs on server

### **UI Technology Decision:**
**Decision:** Demos use **vanilla TypeScript** with **custom CSS** (no React, Vue, Tailwind, etc.)

**Rationale:**
- Current UI complexity (~50 lines per demo) doesn't justify framework overhead
- React alone adds ~45KB to bundle size
- Direct DOM manipulation is faster for 60fps 3D animations
- Maintains minimal dependencies philosophy
- Shared components implemented as TypeScript modules (e.g., `CameraControlPanel.ts`)

**Reconsideration triggers:**
- Complex data visualization dashboards required
- Multi-step forms or advanced state management needs
- UI code complexity exceeds 500+ lines per demo

See [docs/UI_STANDARDS.md](UI_STANDARDS.md) for full rationale and implementation patterns.

---

## Phase 10: Demo Migration ⏳ PLANNED

**Goal:** Update demos to use new TypeScript architecture.

| Demo | Status | Notes |
| :--- | :--- | :--- |
| `demo-01-sense-act-osc` | ⏳ | Uses legacy p5.js |
| `demo-02-oscillator` | ⏳ | Uses `Agent.js` (legacy) |
| Other demos | ⏳ | TBD |

**Migration Pattern:**

**Before (Legacy):**
```javascript
import { Agent } from '../lib/legacy/Agent.js';
import { Environment } from '../lib/legacy/Environment.js';

const agent = new Agent('Male 1', 60, 0, 0, 0, 0);
environment.addAgent(agent);
```

**After (TypeScript):**
```typescript
import { Mobile } from '../lib/Mobile';
import { Environment } from '../lib/Environment';
import { ThreeJSRenderer } from '../lib/visualization/renderers/ThreeJSRenderer';

const mobile = new Mobile({
    name: 'Male 1',
    initialPosition: { x: 0, y: 0, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 }
});
environment.addMobile(mobile);
renderer.render(environment.toJSON());
```

---

## Completed Features

### **Serialization** ✅
- `toJSON()` / `fromJSON()` for all core classes
- State save/load functionality
- Network synchronization ready

### **Scene Graph** ✅
- `Transform` base class
- Parent/child hierarchy
- Component composition (sensors/actuators as children)

### **Subsystems** ✅
- Drive system (O/P drives, entropy)
- Horizontal control (yaw rotation)
- Vertical control (roll rotation, Females only)

### **Components** ✅
- Sensor/actuator base classes
- Light/sound sensors
- Light/sound actuators
- Field of view (cone-based detection)

---

## Migration Workflow (Per Class)

1. **Select a file** from the tables above
2. **Create Test**: `lib/__tests__/[NewName].test.ts`
3. **Run Test**: Verify it fails (TDD)
4. **Rename & Convert**:
   - Rename file to `.ts`
   - Change class name to [NewName]
   - Apply `lib/types` interfaces
   - Add JSDoc comments
5. **Fix Imports**: Update all references (use VS Code refactor tools)
6. **Verify**: Run `npm test` and `npx tsc --noEmit`
7. **Document**: Update this plan and add README if needed

---

## Deployment Strategy: Hybrid Evolution

To support both rapid development (now) and complex networking (future), the project utilizes a hybrid deployment strategy.

### Stage A: Component Validation (Visual Demos)
**Target:** Vercel / Netlify (Static Hosting)
- **Architecture:** Client-Side Simulation. The entire logical loop (`Environment.ts`, `Mobile.ts`) runs in the user's browser.
- **Goal:** Unit validation of physics, rotational hierarchies, and sensor logic.
- **Why:** Zero latency, zero cost, instant preview builds.
- **Artifact:** `dist/` (Static HTML/JS/CSS).

### Stage B: Networked Simulation (Multiplayer)
**Target:** Heroku / Render (Containerized Node.js)
- **Architecture:** Authoritative Server. The logical loop moves to `server.js` (Node.js), synchronization happens via WebSockets.
- **Goal:** Shared state "Colloquy" where multiple users interact in the same universe (e.g., User A is a Male, User B is a Female).
- **Why:** Required for persistent connections and shared ground-truth state.
- **Artifact:** `server.js` (Node.js Process, `npm start`).

**Infrastructure Readiness:**
The project maintains both configurations simultaneously:
1. `vite build` generates the Stage A static site.
2. `server.js` and `Procfile` are pre-configured for Stage B server deployment.

---

## Glossary of Changes

| Legacy Term | New Term | Rationale |
| :--- | :--- | :--- |
| **Agent** | **Mobile** | Pask's canonical term for autonomous entity |
| **Manager** | **Subsystem** | Pask's term for functional units within Mobiles |
| **Environment** | **Environment** | Kept due to cybernetic significance |
| N/A | **Transform** | Scene graph base class (new) |
| N/A | **HorizontalControlSubsystem** | Specialized oscillator for yaw |
| N/A | **VerticalControlSubsystem** | Specialized oscillator for roll |

---

## Related Documentation

- `docs/terminology.md` - Canonical Pask terminology
- `README.md` (lines 122-148) - Server/client architecture
- `lib/subsystems/README.md` - Subsystem documentation
- `lib/components/README.md` - Component documentation
- `lib/visualization/README.md` - Visualization documentation
- `lib/legacy/README.md` - Legacy code documentation
- `lib/types/README.md` - Type definitions documentation
