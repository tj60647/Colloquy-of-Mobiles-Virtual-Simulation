# Demo Refactoring Plan

## Overview

This document outlines the plan to refactor all demonstration applications to use the new TypeScript architecture (Phases 1-7 complete). The current demos use legacy code and mix concerns inappropriately. The refactored demos will demonstrate specific aspects of the virtual Colloquy system using clean, typed components.

**Goals:**
- Align demos with completed TypeScript architecture
- Separate simulation logic from visualization
- Create focused, educational demonstrations
- Use Config V2 format for scene setup
- Eliminate legacy JavaScript dependencies
- Establish patterns for future demo development

---

## ⚠️ Important: Two Different Architectures

This project has **TWO architectures** serving different purposes:

### Architecture 1: **Demos** (THIS DOCUMENT - Building Now)
**Status:** ✅ Phase A-F implementation in progress

- **What:** Standalone browser applications (each demo is self-contained)
- **Where:** Simulation + visualization run together IN THE BROWSER
- **Network:** None needed (can run from `file://` or static server)
- **Purpose:** Development, testing, education, portfolio
- **Deployment:** Static hosting (Vercel, GitHub Pages)
- **Current focus:** THIS is what we're building in Phases A-F

### Architecture 2: **Museum Installation** (Future - Phase 8)
**Status:** ⏳ PLANNED, NOT YET IMPLEMENTED

- **What:** Distributed system (server runs simulation, clients just view)
- **Where:** Node.js server + multiple browser clients via WebSocket
- **Network:** Required (local museum network or Heroku)
- **Purpose:** Multi-user installation, shared interactions, multiple viewing stations
- **Deployment:** Server + clients
- **Timeline:** Phase 8 (after demos are complete)

**👉 Focus on Architecture 1 (Demos) for now. Ignore Phase 8 until demos are working.**

The SAME simulation code (`lib/Mobile.ts`, `lib/Environment.ts`, etc.) works for both architectures—just different deployment patterns.

---

## Current Demo Inventory

### Legacy Demos (To Be Refactored/Replaced)

| Demo | Technology | Purpose | Status | Issues |
|------|-----------|---------|--------|--------|
| **demo-00-P5** | p5.js + EasyCam | Basic 3D setup test | ⚠️ | Minimal value, ancient tech |
| **demo-01-sensor-actuator** | THREE.js | Sensors/actuators detecting each other | ⚠️ | Uses legacy visualization classes |
| **demo-01-actuator-THREE** | THREE.js | Actuator field of effect | ⚠️ | Uses `Actuator_THREE` (legacy) |
| **demo-01-sense-act-osc** | Mixed | Unknown (need verification) | ❌ | Unclear purpose |
| **demo-02-oscillator** | p5.js | Oscillator subsystem | ⚠️ | Uses legacy `Agent.js` |
| **demo-02-oscillator-THREE** | THREE.js | 3D oscillator | ⚠️ | Uses legacy classes |
| **demo-03-transform-THREE** | THREE.js | Transform hierarchy | ⚠️ | Uses `Transform_THREE` (legacy) |
| **demo-04-drives** | p5.js | Drive system visualization | ⚠️ | Uses legacy `Agent_DriveManager.js` |
| **demo-05-transceiversV2** | Mixed | Actor model + pulse communication | ⚠️ | Most advanced but not using TS core |
| **demo-06-assets-test** | THREE.js | GLB model loader | ✅ | Keep as-is (pure asset test) |
| **demo-07-sensor** | p5.js | Sensor field of view | ⚠️ | Mixed TS/legacy |
| **demo-08-sensor-THREE** | THREE.js | 3D sensor visualization | ⚠️ | Uses `Sensor_THREE` (legacy) |

---

## New Demo Architecture

### Design Principles

1. **Separation of Concerns**
   - Simulation logic in TypeScript classes
   - Rendering in separate visualization layer
   - No visualization code modifying simulation state

2. **Config-Driven Setup**
   - Use Config V2 JSON files for scene setup
   - Minimal hardcoded values in demo code
   - SceneGraphLoader creates all Mobiles/components

3. **Educational Focus**
   - Each demo illustrates ONE core concept
   - Clear naming that explains what's being demonstrated
   - Inline documentation and UI explanations

4. **Technology Stack**
   - **Simulation**: TypeScript classes from `lib/`
   - **3D Visualization**: THREE.js + TypeScript
   - **2D Visualization**: Canvas API + TypeScript (for charts/graphs)
   - **Build**: Vite or native ES modules
   - **No legacy dependencies** (no p5.js, no JavaScript)
   - **All TypeScript** (`.ts` files, not `.js`)

---

## Architecture Details

### Demo Architecture (What We're Building - Architecture 1)

```
┌─────────────────────────────────────────────────────────────┐
│                    Museum Network (Local)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Sensor Stations] ──┐                                      │
│    (Browser)         │                                      │
│                      │  sensor_event (WebSocket)            │
│  [Sensor Stations] ──┼──► [Simulation Server] ──┐          │
│    (Browser)         │      (Node.js + Socket.io)│          │
│                      │      - Environment.ts      │          │
│  [Sensor Stations] ──┘      - Mobile.ts          │          │
│    (Browser)                - State updates      │          │
│                                                   │          │
│                                state_update       │          │
│                                (WebSocket broadcast)        │
│                                                   │          │
│                        ┌──────────────────────────┘          │
│                        │                                     │
│                        ├──► [3D View] (Browser + THREE.js)  │
│                        │                                     │
│                        ├──► [VR View] (Browser + WebXR)     │
│                        │                                     │
│                        ├──► [Dashboard] (Browser + Charts)  │
│                        │                                     │
│                        └──► [Additional Views]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Each demo is a complete standalone application:**

```
┌─────────────────────────────────────────────────┐
│         Single Browser Window (Demo)            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Simulation Loop (TypeScript)                   │
│  ┌───────────────────────────────┐             │
│  │ Environment.ts                │             │
│  │ Mobile.ts                     │             │
│  │ DriveSubsystem.ts             │             │
│  │ Components (Sensors/Actuators)│             │
│  └───────────────┬───────────────┘             │
│                  │ toJSON()                     │
│                  ▼                              │
│  Renderer (TypeScript + THREE.js)              │
│  ┌───────────────────────────────┐             │
│  │ ThreeJSRenderer.ts            │             │
│  │ - Reads state                 │             │
│  │ - Updates THREE.js scene      │             │
│  │ - Never modifies simulation   │             │
│  └───────────────────────────────┘             │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Key Points:**
- ✅ Simulation runs IN the browser (no server needed)
- ✅ Each demo is independent (can run from `file://`)
- ✅ Uses Vite dev server for development convenience only
- ✅ Deploys as static files (HTML + JS + CSS)

---

### Museum Installation Architecture (Future - Phase 8, NOT YET BUILT)

**This is PLANNED but NOT IMPLEMENTED. Ignore this section for now.**

```
┌─────────────────────────────────────────────────────────────┐
│                    Museum Network (Local)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Sensor Stations] ──┐                                      │
│    (Browser)         │                                      │
│                      │  sensor_event (WebSocket)            │
│  [Sensor Stations] ──┼──► [Simulation Server] ──┐          │
│    (Browser)         │      (Node.js + Socket.io)│          │
│                      │      - Environment.ts      │          │
│  [Sensor Stations] ──┘      - Mobile.ts          │          │
│    (Browser)                - State updates      │          │
│                                                   │          │
│                                state_update       │          │
│                                (WebSocket broadcast)        │
│                                                   │          │
│                        ┌──────────────────────────┘          │
│                        │                                     │
│                        ├──► [3D View] (Browser + THREE.js)  │
│                        │                                     │
│                        ├──► [VR View] (Browser + WebXR)     │
│                        │                                     │
│                        ├──► [Dashboard] (Browser + Charts)  │
│                        │                                     │
│                        └──► [Additional Views]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Points:**
- ⏳ Requires Node.js server running (Phase 8 - not built yet)
- ⏳ WebSocket connections for state distribution
- ⏳ Multiple clients viewing SAME simulation
- ⏳ Sensor stations send input to shared simulation

**👉 This is NOT what we're building now. Focus on standalone demos (Architecture 1).**

---

### Comparison: Demos vs. Museum Installation

| Aspect | DEMOS (Now - Architecture 1) | Museum Installation (Phase 8 - Future) |
|--------|-------------------|-------|
| **Architecture** | Monolithic (All in browser) | Distributed (Server + Clients) |
| **Simulation** | Runs in browser | Runs on server |
| **Rendering** | Single view | Multiple client views |
| **Communication** | Direct function calls | WebSocket messages |
| **State** | Local only | Broadcast to clients |
| **Purpose** | Development/testing/education | Multi-user installation |
| **Status** | ✅ Building now (Phases A-F) | ⏳ Future (Phase 8) |

---

### Demo-to-Installation Migration Path

**Demos are designed to be "componentized" for the server/client architecture:**

1. **Simulation Code** (identical)
   - Same TypeScript classes (`Mobile.ts`, `Environment.ts`, etc.)
   - Same serialization methods (`toJSON()`)
   - No changes needed

2. **Renderer Code** (refactored)
   - Demo: Renderer reads from local `Environment` instance
   - Installation: Renderer reads from WebSocket `state_update` messages
   - Same rendering logic, different data source

3. **Example Migration:**

```typescript
// Demo version (local simulation)
class DemoApp {
  private environment: Environment;
  private renderer: ThreeJSRenderer;
  
  animate() {
    // Update local simulation
    this.environment.update();
    
    // Render local state
    this.renderer.render(this.environment.toJSON());
  }
}

// Installation version (remote simulation)
class ClientViewer {
  private renderer: ThreeJSRenderer;
  private socket: Socket;
  
  constructor() {
    // Connect to simulation server
    this.socket = io('ws://server-address');
    
    // Listen for state updates
    this.socket.on('state_update', (state: SimulationState) => {
      // Render received state (same method!)
      this.renderer.render(state);
    });
  }
}
```

### Validation Strategy

**Each demo validates components that will be used in the installation:**

- **Demo 1-4:** Validate scene graph, sensors, actuators → Used by all client views
- **Demo 5-7:** Validate subsystem logic → Runs on server
- **Demo 8-10:** Validate Mobile behaviors → Runs on server
- **Demo 11-12:** Validate full simulation → Becomes server core
- **Demo 13-15:** Development tools → Help build installation

**The demos ARE the test suite for the museum installation.**

---

## Proposed Demo Suite

### Tier 1: Core Component Demos (Foundation)

#### Demo 1: Transform Hierarchy ✨ NEW
**Path:** `apps/demo-TS-01-transform-hierarchy/`

**Purpose:** Demonstrate scene graph with parent/child transforms

**Features:**
- Load simple config with nested transforms
- Visualize local vs global coordinates
- Display coordinate axes for each transform
- Interactive rotation to show hierarchy effects

**Config:** Simple 3-level hierarchy (World → Parent → Child → Grandchild)

**Tech:** TypeScript + THREE.js

**Replaces:** demo-03-transform-THREE

---

#### Demo 2: Sensor Field of View ✨ NEW
**Path:** `apps/demo-TS-02-sensor-fov/`

**Purpose:** Demonstrate sensor detection with cone-based field of view

**Features:**
- Single sensor at origin
- Grid of test points at various distances/angles
- Visual indication when points enter FOV
- UI controls for FOV angle and sensor orientation
- Display global vs local detection coordinates

**Config:** One sensor, 100 test points

**Tech:** TypeScript + THREE.js

**Replaces:** demo-07-sensor, demo-08-sensor-THREE

---

#### Demo 3: Actuator Field of Effect ✨ NEW
**Path:** `apps/demo-TS-03-actuator-field/`

**Purpose:** Demonstrate actuator emission with inverse-square intensity

**Features:**
- Single actuator at origin
- Grid of targets with varying sensitivity
- Visualize intensity falloff (colored gradient)
- UI controls for power level and FOV
- Display detected vs undetected targets

**Config:** One actuator, 100 targets

**Tech:** TypeScript + THREE.js

**Replaces:** demo-01-actuator-THREE

---

#### Demo 4: Sensor-Actuator Interaction ✨ NEW
**Path:** `apps/demo-TS-04-sensor-actuator/`

**Purpose:** Demonstrate bidirectional detection between sensors and actuators

**Features:**
- Multiple sensors and actuators in scene
- Visualize which sensors detect which actuators
- Show intensity values at sensor locations
- Optional rotation to demonstrate dynamic detection
- Connection lines showing active detections

**Config:** 4 sensors, 3 actuators

**Tech:** TypeScript + THREE.js

**Replaces:** demo-01-sensor-actuator

---

#### Demo 4.5: External Sensor Inputs ✨ NEW
**Path:** `apps/demo-TS-04.5-external-sensors/`

**Purpose:** Demonstrate sensors responding to external stimuli (visitor interaction)

**Features:**
- Light sensor responding to webcam brightness
- Sound sensor responding to microphone volume
- Real-time intensity visualization
- Threshold detection display
- Simulated visitor inputs (if no webcam/mic available)
- Mobile reaction to external stimuli

**Config:** 1-2 Mobiles with external-facing sensors

**Tech:** TypeScript + THREE.js + Web APIs (getUserMedia, Web Audio)

**Purpose for Installation:** This validates the sensor station interface - how visitors will interact with the simulation in the museum.

**New Feature:** Bridges simulation to physical world

---

### Tier 2: Subsystem Demos (Behavior)

#### Demo 5: Drive System ✨ NEW
**Path:** `apps/demo-TS-05-drive-system/`

**Purpose:** Demonstrate entropy accumulation and drive states

**Features:**
- 4-6 visualization windows showing different drive states
- Real-time charts of O and P drive values
- Color-coded state indicators (Satisfied, O-Search, P-Search, Either)
- Simulation controls (pause, speed, reset)
- Manual satisfaction triggers

**Config:** Multiple drive subsystems with different parameters

**Tech:** TypeScript + Canvas 2D API (for charts)

**Replaces:** demo-04-drives

---

#### Demo 5.5: Pulse Communication ✨ NEW
**Path:** `apps/demo-TS-05.5-pulse-communication/`

**Purpose:** Demonstrate pulse transmission/reception infrastructure and circular buffer operation

**Features:**
- 2-3 Mobiles with transmitters and receivers
- Visual pulse buffer display (circular buffer animation)
- Pattern visualization showing transmitted and received sequences
- Fixed pattern transmission (manually selectable)
- Real-time pattern matching detection (visual indicators)
- Circular buffer state visualization (sense and act phases)

**Config:** 2-3 Mobiles with communication subsystems

**Tech:** TypeScript + THREE.js + Canvas 2D (buffer visualization)

**Replaces/Modernizes:** demo-05-transceiversV2 (infrastructure only)

**Scope:** Implements the **communication infrastructure** (SENSE and ACT phases) - circular buffers, pulse transmission mechanics, pattern vocabulary constants, and message passing. Does NOT implement LOGIC phase (drive-based pattern selection, behavioral responses) - that comes in Complete Mobile demos (Tier 3/4).

**Critical:** This provides the "channel" for social communication. The "intelligence" (what to say based on drives, how to respond to received patterns) is implemented in Demos 8-12.

---

#### Demo 6: Horizontal Control Subsystem ✨ NEW
**Path:** `apps/demo-TS-06-horizontal-control/`

**Purpose:** Demonstrate oscillator-based yaw rotation

**Features:**
- Multiple Mobiles with horizontal control
- Visualize motion profiles (trapezoidal)
- Show RELEASED vs STOPPED states
- Display position/velocity/acceleration graphs
- UI controls for motion parameters

**Config:** 3-4 Mobiles with different oscillator configs

**Tech:** TypeScript + THREE.js + Canvas 2D (charts)

**Replaces:** demo-02-oscillator, demo-02-oscillator-THREE

---

#### Demo 7: Vertical Control Subsystem ✨ NEW
**Path:** `apps/demo-TS-07-vertical-control/`

**Purpose:** Demonstrate Female Mobile's roll rotation

**Features:**
- Female Mobile with vertical reflector
- Independent vertical oscillation while horizontal moves
- Show two-axis control coordination
- Motion profile visualization for both axes

**Config:** 1 Female Mobile

**Tech:** TypeScript + THREE.js

**New Feature:** (No previous equivalent)

---

### Tier 3: Complete Mobile Demos (Integration)

#### Demo 8: Male Mobile Behavior ✨ NEW
**Path:** `apps/demo-TS-08-male-mobile/`

**Purpose:** Demonstrate complete Male Mobile with drives + oscillators + sensors/actuators

**Features:**
- Single Male Mobile
- Drive system coupled to horizontal control
- Search behavior when unsatisfied
- Return to reinforcement when satisfied
- Real-time state display (drives, position, sensor readings)

**Config:** 1 Male Mobile (complete)

**Tech:** TypeScript + THREE.js

**Integration:** Combines demos 5 + 6 + sensors

---

#### Demo 9: Female Mobile Behavior ✨ NEW
**Path:** `apps/demo-TS-09-female-mobile/`

**Purpose:** Demonstrate complete Female Mobile with two-axis control

**Features:**
- Single Female Mobile
- Horizontal + vertical control systems
- Independent reflector scanning
- Drive-based behavior
- Coordinated multi-axis motion

**Config:** 1 Female Mobile (complete)

**Tech:** TypeScript + THREE.js

**New Feature:** (No previous equivalent for complete Female)

---

#### Demo 10: Beam (Bar) Arbitration ✨ NEW
**Path:** `apps/demo-TS-10-beam-arbitration/`

**Purpose:** Demonstrate Beam arbitration between two Males

**Features:**
- Central Beam
- Two Male Mobiles (Male I, Male II)
- Beam responds to dominant drive signals
- Visualization of arbitration logic
- Real-time display of drive comparisons

**Config:** 1 Beam + 2 Males

**Tech:** TypeScript + THREE.js

**New Feature:** (No previous equivalent)

---

### Tier 4: Social Interaction Demos (The Colloquy)

#### Demo 11: Simple Colloquy (3 Mobiles) ✨ NEW
**Path:** `apps/demo-TS-11-simple-colloquy/`

**Purpose:** Demonstrate basic social interaction between 3 Mobiles

**Features:**
- 3 Mobiles in circular arrangement
- Drive-based searching and satisfaction
- Sensor/actuator communication
- Interaction count tracking
- Event log display

**Config:** 3 Mobiles (simplified from full colloquy)

**Tech:** TypeScript + THREE.js

**New Feature:** Simplified version of demo-05-transceiversV2

---

#### Demo 12: Full Colloquy (6 Mobiles) ✨ NEW
**Path:** `apps/demo-TS-12-full-colloquy/`

**Purpose:** Complete simulation with all agent types

**Features:**
- 2 Male Mobiles
- 3 Female Mobiles
- 1 Beam
- Full interaction system
- Multiple camera views
- Analytics dashboard overlay

**Config:** Uses `config_v2.json` (complete scene)

**Tech:** TypeScript + THREE.js

**Replaces/Enhances:** demo-05-transceiversV2

---

### Tier 5: Special Purpose Demos

#### Demo 13: Config Editor/Visualizer ✨ NEW
**Path:** `apps/demo-TS-13-config-editor/`

**Purpose:** Interactive tool for creating/editing Config V2 files

**Features:**
- Visual scene editor
- JSON schema validation
- Live preview of configuration
- Export config files
- Import and modify existing configs

**Tech:** TypeScript + THREE.js + Monaco Editor

**New Tool:** (Mentioned in TODO.md but not implemented)

---

#### Demo 14: Serialization Test ✨ NEW
**Path:** `apps/demo-TS-14-serialization/`

**Purpose:** Demonstrate save/load functionality

**Features:**
- Create simulation state
- Serialize to JSON
- Save to file/localStorage
- Load from JSON
- Verify state preservation

**Config:** Any config

**Tech:** TypeScript + simple UI

**New Feature:** Test the completed serialization system

---

#### Demo 15: Performance Benchmark ✨ NEW
**Path:** `apps/demo-TS-15-performance/`

**Purpose:** Test simulation performance with many Mobiles

**Features:**
- Scalable Mobile count (1-100)
- FPS monitoring
- Update time profiling
- Identify bottlenecks
- Memory usage tracking

**Config:** Generated programmatically

**Tech:** TypeScript + Performance API

**New Tool:** Optimization testing

---

## Legacy Demo Disposition

### Keep As-Is
- **demo-06-assets-test** - Pure asset loading test, doesn't use simulation classes

### Preserve (Archive with Documentation)
- **demo-05-transceiversV2** - **CRITICAL REFERENCE** for pulse communication
  - Move to `apps/archive-reference/demo-05-transceiversV2/`
  - This demonstrates the Actor model, PulseTransmitter, PulseReceiver, and pattern matching
  - Essential reference for implementing Phase 7.5 (Communication System)
  - Will be modernized as Demo 5.5

### Deprecate (Move to archive/)
- **demo-00-P5** - No value, just p5.js boilerplate
- **demo-01-sense-act-osc** - Purpose unclear, likely superseded

### Archive After Refactoring
All other demos will be moved to `apps/archive-legacy/` once new versions are complete

---

## Implementation Sequence & Dependencies

### Phase A: Foundation (Required First)

**Sequence:** Must complete before any demos

**Tasks:**
1. Create demo template structure
2. Set up shared visualization utilities (`lib/visualization/renderers/`)
3. Create base `ThreeJSRenderer.ts` (pure adapter)
4. Create standardized camera interface (`CameraController.ts`)
5. Establish config file patterns
6. Create demo card and README templates

**Deliverables:**
- `apps/demo-TS-template/` (starter template)
- `lib/visualization/renderers/ThreeJSRenderer.ts`
- `lib/visualization/renderers/DashboardRenderer.ts` (for 2D charts)
- `lib/visualization/utils/CameraController.ts` (standard controls)
- Demo documentation templates

**Camera Controller Features:**
- Orbit controls (left drag to rotate)
- Pan controls (right drag to pan)
- Zoom (scroll wheel)
- Reset to default view (R key or button)
- Toggle orthographic/perspective (T key or button)
- Preset views (top, front, side, isometric)
- Smooth camera transitions
- Focus on object (click or F key)

**See:** [Camera Controller Specification](CAMERA_CONTROLLER_SPEC.md) for complete details

**Dependencies:** None (foundation work)

---

### Phase B: Tier 1 - Core Components

**Sequence:** Can be implemented in parallel after Phase A

#### Demo 1: Transform Hierarchy
- **Dependencies:** Phase A only
- **Blocks:** All other demos (scene graph foundation)

#### Demo 2: Sensor FOV
- **Dependencies:** Demo 1
- **Blocks:** Demos 4, 8, 9, 11, 12

#### Demo 3: Actuator Field
- **Dependencies:** Demo 1
- **Blocks:** Demos 4, 8, 9, 11, 12

#### Demo 4: Sensor-Actuator Interaction
- **Dependencies:** Demos 2, 3
- **Blocks:** Demos 11, 12

#### Demo 4.5: External Sensor Inputs
- **Dependencies:** Demo 2 (sensor FOV understanding)
- **Blocks:** None (validates sensor stations for installation)

---

### Phase C: Tier 2 - Subsystems

**Sequence:** Can be implemented in parallel after Phase A

#### Demo 5: Drive System
- **Dependencies:** Phase A only (no scene graph needed)
- **Blocks:** Demos 5.5, 8, 9, 10, 11, 12

#### Demo 6: Horizontal Control
- **Dependencies:** Demo 1 (needs transforms)
- **Blocks:** Demos 8, 9, 10, 11, 12

#### Demo 7: Vertical Control
- **Dependencies:** Demo 6 (builds on horizontal control)
- **Blocks:** Demos 9, 11, 12

---

### Phase 7.5: Communication System (CRITICAL - NEW)

**Sequence:** Must complete AFTER Demos 5-7, BEFORE Phase D

**Why:** Mobiles need communication infrastructure (buffers, transmission mechanics, pattern vocabulary) as the foundation for social behavior. This implements the SENSE and ACT phases; the LOGIC phase (pattern recognition → decision → behavior) comes in Complete Mobile demos.

**Scope Clarification:**
- ✅ **IN SCOPE:** Circular buffers, pulse transmission/reception mechanics, pattern vocabulary constants, message passing, visualization of communication flow
- ❌ **OUT OF SCOPE:** Drive-based pattern selection, behavioral responses to patterns, social negotiation rules (implemented in Tier 3/4)

#### Tasks:
1. Implement `PulseTransmitter` class (binary pattern iteration, pulse emission)
2. Implement `PulseReceiver` class (circular buffer, pattern matching framework)
3. Implement `PaskPatterns` (communication vocabulary constants)
4. Update `Environment` to broker messages (actor model)
5. Update `Mobile` to integrate transmitters/receivers (basic hooks only)
6. Create Demo 5.5 to validate communication infrastructure

**Deliverables:**
- `lib/components/PulseTransmitter.ts`
- `lib/components/PulseReceiver.ts`
- `lib/communication/PaskPatterns.ts`
- `lib/types/messages.ts`
- Updated `lib/Environment.ts` (message broker)
- Updated `lib/Mobile.ts` (communication integration - basic)

**Architecture:** Implements sense-logic-act control loop infrastructure:
- **SENSE:** Receivers populate circular buffer from incoming pulses
- **LOGIC:** (Higher-order - Tier 3/4) Pattern recognition → Drive evaluation → Pattern selection → Populate transmit buffer
- **ACT:** Transmitters send pulses from pattern buffer

**See:** [Pulse Communication Architecture](PULSE_COMMUNICATION_ARCHITECTURE.md) for complete specification

#### Demo 5.5: Pulse Communication
- **Dependencies:** Demos 1, 5 (Transform + Drive system)
- **Blocks:** Demos 8, 9, 10, 11, 12 (ALL complete Mobiles need communication)
- **Validates:** The reference impl in demo-05-transceiversV2

---

### Phase D: Tier 3 - Complete Mobiles

**Sequence:** Must complete Phases B, C, AND 7.5 first

#### Demo 8: Male Mobile
- **Dependencies:** Demos 1, 2, 3, 5, 5.5, 6
- **Blocks:** Demos 10, 11, 12

#### Demo 9: Female Mobile
- **Dependencies:** Demos 1, 2, 3, 5, 5.5, 6, 7
- **Blocks:** Demos 11, 12

#### Demo 10: Beam Arbitration
- **Dependencies:** Demo 8 (needs Male Mobile behavior)
- **Blocks:** Demo 12

---

### Phase E: Tier 4 - Social Interactions

**Sequence:** Must complete Phases B, C, D first

#### Demo 11: Simple Colloquy
- **Dependencies:** Demos 1-9 (all components and Mobiles)
- **Blocks:** Demo 12 (simplified version as test)

#### Demo 12: Full Colloquy
- **Dependencies:** Demos 1-11 (complete system)
- **Blocks:** None (final integration)

---

### Phase F: Tier 5 - Tools

**Sequence:** Can be implemented anytime after Phase A

#### Demo 13: Config Editor
- **Dependencies:** Phase A, Demo 1 (scene graph visualization)
- **Blocks:** None (development tool)

#### Demo 14: Serialization Test
- **Dependencies:** Phase A
- **Blocks:** None (testing tool)

#### Demo 15: Performance Benchmark
- **Dependencies:** Demo 12 (needs complete system)
- **Blocks:** None (optimization tool)

---

## Dependency Graph

```
Phase A (Foundation + CameraController)
    │
    ├──► Demo 1 (Transform) ──┬──► Demo 2 (Sensor) ──┬──► Demo 4 (Interaction)
    │                          │                       │
    │                          │                       ├──► Demo 4.5 (External Sensors)
    │                          │                       │
    │                          └──► Demo 3 (Actuator) ─┘
    │
    ├──► Demo 5 (Drives) ──────────────────────────────┐
    │           │                                       │
    │           └──► Phase 7.5 (Communication System)  │
    │                    │                              │
    │                    └──► Demo 5.5 (Pulse Comm) ───┤
    │                                                   │
    ├──► Demo 6 (Horizontal) ──► Demo 7 (Vertical)     │
    │           │                      │                │
    │           └──────────────────────┼────────────────┤
    │                                  │                │
    └──► (Demos 1-7 + 5.5) ──► Demo 8 (Male) ──────────┤
                              │                         │
                              ├──► Demo 10 (Beam)       │
                              │                         │
                       Demo 9 (Female) ─────────────────┤
                                                        │
                                    Demo 11 (Simple Colloquy)
                                                        │
                                    Demo 12 (Full Colloquy)

Parallel Track:
Phase A ──► Demo 13 (Config Editor)
        ──► Demo 14 (Serialization)
        ──► Demo 15 (Performance) [after Demo 12]

Special:
Demo 4.5 validates sensor station interface (museum visitor interaction)
Demo 5.5 validates pulse communication (CRITICAL for social behavior)

IMPORTANT: Phase 7.5 (Communication System) is REQUIRED before any
           Complete Mobile demos (8-12). Without pulse communication,
           Mobiles cannot exhibit social behavior.
```

---

## Demo Template Structure

Every new demo should follow this structure:

```
apps/demo-TS-##-name/
├── public/
│   ├── index.html          # Entry point
│   ├── styles.css          # Demo-specific styles
│   └── config.json         # Config V2 file for this demo
├── src/
│   ├── main.ts             # Main entry point (TypeScript)
│   ├── renderer.ts         # THREE.js rendering logic (TypeScript)
│   └── ui.ts               # UI controls and displays (TypeScript)
├── package.json            # Dependencies (if any demo-specific)
├── README.md               # Full documentation (see template below)
├── DEMO_CARD.md            # Short description card (see template below)
└── screenshot.png          # Preview image
```

### README.md Template

```markdown
# Demo ##: [Name]

## Purpose

[One sentence describing what this demo demonstrates]

## What You'll See

[Bullet list of visual/interactive elements]
- Element 1
- Element 2
- Element 3

## Core Concepts Demonstrated

[List of TypeScript classes/concepts being shown]
- `ClassName.ts` - Description
- `AnotherClass.ts` - Description

## Controls

[User interaction instructions]

### Camera Controls (Standard)
- **Left Mouse Drag:** Rotate camera around scene (orbit)
- **Right Mouse Drag:** Pan camera
- **Mouse Wheel:** Zoom in/out
- **R Key:** Reset camera to default view
- **T Key:** Toggle perspective/orthographic projection
- **F Key:** Focus camera on selected object
- **1-4 Keys:** Preset views (Top, Front, Side, Isometric)

### Interaction
- Mouse: [demo-specific interactions]
- Keyboard: [demo-specific keys]
- UI Buttons: [what they do]

## Configuration

**Config File:** `public/config.json`

[Brief description of what's in the config]

## Technical Details

### Simulation Classes Used
- `lib/ClassName.ts`
- `lib/subsystems/SubsystemName.ts`
- `lib/components/ComponentName.ts`

### Visualization
- Renderer: `ThreeJSRenderer` or `DashboardRenderer`
- Update Rate: [fps]
- Camera: [perspective/orthographic] with standard CameraController
- Lighting: [description]

### Camera Controls
Uses standardized `CameraController` from Phase A:
- Orbit, pan, zoom
- Reset and preset views
- Perspective/orthographic toggle
- Object focus

[Additional demo-specific camera behaviors if any]

## Dependencies

**Required Demos:** [List demos that must work first]
**Blocks Demos:** [List demos that depend on this]

## Relationship to Museum Installation

[How this demo's code will be used in the server/client architecture]

## Development Notes

[Any important implementation details or gotchas]

## See Also

- [Related demo links]
- [Related documentation]
```

### DEMO_CARD.md Template

```markdown
# [Demo Name]

**Category:** [Core Component | Subsystem | Complete Mobile | Social Interaction | Tool]

**Complexity:** [Basic | Intermediate | Advanced]

**Dependencies:** [List of demo numbers this depends on]

---

## Quick Summary

[2-3 sentence description of what this demo shows]

## Key Features

- ✨ Feature 1
- ✨ Feature 2
- ✨ Feature 3

## Classes Demonstrated

`ClassName`, `AnotherClass`, `ThirdClass`

## Run Demo

```bash
cd apps/demo-TS-##-name
npm install  # if needed
npm run dev
```

Open: http://localhost:5173

---

**Screenshot:**

![Demo Screenshot](screenshot.png)
```

**See Example Files:**
- [Demo 1 README Example](demo-examples/DEMO-01-README-EXAMPLE.md)
- [Demo 1 Card Example](demo-examples/DEMO-01-CARD-EXAMPLE.md)

---

## Demo Index Page

Create `apps/public/demos.html` that lists all demos with cards:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colloquy of Mobiles - Demo Suite</title>
    <link rel="stylesheet" href="demo-index.css">
</head>
<body>
    <header>
        <h1>Colloquy of Mobiles - Demo Suite</h1>
        <p>Interactive demonstrations of the TypeScript simulation architecture</p>
    </header>
    
    <nav>
        <button data-filter="all" class="active">All Demos</button>
        <button data-filter="core">Core Components</button>
        <button data-filter="subsystem">Subsystems</button>
        <button data-filter="mobile">Complete Mobiles</button>
        <button data-filter="social">Social Interaction</button>
        <button data-filter="tool">Tools</button>
    </nav>
    
    <main class="demo-grid">
        <!-- Demo cards generated from DEMO_CARD.md files -->
        <!-- Each card is a clickable link to the demo -->
    </main>
    
    <footer>
        <p>See <a href="../docs/DEMO_REFACTORING_PLAN.md">Demo Refactoring Plan</a> for details</p>
    </footer>
</body>
</html>
```

---

## Visualization Architecture

### Pure Adapter Pattern

```typescript
// Good: Renderer only reads state
class ThreeJSRenderer {
  render(simulationState: SimulationState) {
    // Update THREE.js objects from state
    // Never modify simulation state
  }
}

// Bad: Mixed concerns
class LegacyRenderer {
  render(agents: Agent[]) {
    agents.forEach(a => a.update()); // ❌ Modifying simulation!
  }
}
```

### Separation of Concerns

```
┌─────────────────────────────────────────┐
│         Simulation (TypeScript)         │
│  - Mobile.ts                            │
│  - Environment.ts                       │
│  - DriveSubsystem.ts                    │
│  - Sensors/Actuators                    │
└──────────────────┬──────────────────────┘
                   │ toJSON()
                   ▼
┌─────────────────────────────────────────┐
│    Visualization (THREE.js/Canvas)      │
│  - Renders state snapshot               │
│  - Never modifies simulation            │
│  - Pure display functions               │
└─────────────────────────────────────────┘
```

---

## Common Demo Patterns

### 1. Config-Based Setup

```typescript
// Load config and create environment
const configPath = './config.json';
const config = await fetch(configPath).then(r => r.json());
const environment = SceneGraphLoader.loadFromConfig(config);
```

### 2. Simulation Loop

```typescript
// Update simulation, then render
function animate() {
  requestAnimationFrame(animate);
  
  // Update simulation
  environment.update();
  
  // Render current state
  renderer.render(environment.toJSON());
  
  // Update UI displays
  updateUI(environment);
}
```

### 3. State Extraction

```typescript
// Extract specific data for UI display
function updateUI(environment: Environment) {
  const mobile = environment.getMobileById(mobileId);
  const driveState = mobile.drives.getState();
  
  displayDriveO.textContent = driveState.O.currentValue.toFixed(1);
  displayDriveP.textContent = driveState.P.currentValue.toFixed(1);
}
```

---

## Success Criteria

### For Each Demo

- [ ] Uses only TypeScript classes from `lib/`
- [ ] Config V2 file for scene setup
- [ ] Separate simulation and visualization
- [ ] Clear README explaining purpose
- [ ] Runs independently (no cross-demo dependencies)
- [ ] Responsive UI with clear labels
- [ ] No console errors or warnings

### For Complete Suite

- [ ] All Tier 1-2 demos complete (foundation)
- [ ] At least one Tier 3 demo (complete Mobile)
- [ ] Full Colloquy demo working (Tier 4)
- [ ] Legacy demos archived
- [ ] Demo index page listing all demos
- [ ] Documentation for adding new demos

---

## Migration from Legacy

### Step-by-Step Process

1. **Choose Legacy Demo** from inventory
2. **Identify Core Concept** being demonstrated
3. **Design New Demo** following template
4. **Create Config V2** file for scene
5. **Implement Simulation** using TypeScript classes
6. **Add Visualization** using pure renderer
7. **Create UI** for interaction/display
8. **Test Thoroughly**
9. **Document** in README
10. **Archive Legacy** demo

### Example: Migrating demo-04-drives

**Legacy Code:**
```javascript
// apps/demo-04-drives/public/sketch.js
import { Agent_DriveManager } from '../lib/Agent_DriveManager.js';
agents.push(new Agent_DriveManager(50, 50, 250));
```

**New Code:**
```typescript
// apps/demo-TS-05-drive-system/src/main.ts
import { SceneGraphLoader } from '../../../lib/SceneGraphLoader';
import { DriveSystemRenderer } from './renderer';

const config = await fetch('./config.json').then(r => r.json());
const environment = SceneGraphLoader.loadFromConfig(config);
const renderer = new DriveSystemRenderer(environment);
```

---

## Demo Cards (Complete Set)

### Demo 1: Transform Hierarchy

**Category:** Core Component | **Complexity:** Basic | **Dependencies:** None (Phase A only)

Demonstrates the scene graph system with parent/child transforms. Shows how local transformations compose into global coordinates, fundamental to all Mobile positioning.

**Key Features:**
- ✨ 4-level transform hierarchy (World → Root → Child → Grandchild)
- ✨ Visual coordinate axes for each transform
- ✨ Real-time rotation showing hierarchical composition
- ✨ Local vs global position display

**Classes:** `Transform`, `SceneGraphLoader`

---

### Demo 2: Sensor Field of View

**Category:** Core Component | **Complexity:** Basic | **Dependencies:** Demo 1

Demonstrates cone-based field of view detection for sensors. Shows how sensors determine if a point is within their detection range based on angle and distance.

**Key Features:**
- ✨ Single sensor with adjustable FOV cone
- ✨ 100+ test points at various positions
- ✨ Color-coded detection status (in/out of FOV)
- ✨ UI controls for FOV angle and sensor orientation

**Classes:** `SensorBase`, `Transform`

---

### Demo 3: Actuator Field of Effect

**Category:** Core Component | **Complexity:** Basic | **Dependencies:** Demo 1

Demonstrates actuator emission with inverse-square intensity falloff. Shows how actuators broadcast energy within their field of effect.

**Key Features:**
- ✨ Single actuator with power control
- ✨ 100+ targets with varying sensitivity thresholds
- ✨ Intensity gradient visualization
- ✨ Real-time power and FOV adjustment

**Classes:** `ActuatorBase`, `Transform`

---

### Demo 4: Sensor-Actuator Interaction

**Category:** Core Component | **Complexity:** Intermediate | **Dependencies:** Demos 2, 3

Demonstrates bidirectional detection between multiple sensors and actuators. Shows how Mobiles can detect each other's emissions in the environment.

**Key Features:**
- ✨ 4 sensors + 3 actuators in scene
- ✨ Connection lines showing active detections
- ✨ Intensity values displayed at sensors
- ✨ Optional rotation for dynamic detection

**Classes:** `SensorBase`, `ActuatorBase`, `LightSensor`, `LightActuator`, `SoundSensor`, `SoundActuator`

---

### Demo 4.5: External Sensor Inputs

**Category:** Core Component | **Complexity:** Intermediate | **Dependencies:** Demo 2

Demonstrates sensors responding to external stimuli from visitors - webcam (light) and microphone (sound). Shows how the simulation bridges to the physical world for museum interaction.

**Key Features:**
- ✨ Webcam-based light input (brightness detection)
- ✨ Microphone-based sound input (volume detection)
- ✨ Real-time sensor response visualization
- ✨ Fallback to simulated inputs (no hardware required)

**Classes:** `LightSensor`, `SoundSensor` (with external input mode)

**Installation Context:** Validates sensor station interface for museum visitors

---

### Demo 5: Drive System

**Category:** Subsystem | **Complexity:** Intermediate | **Dependencies:** Phase A

Demonstrates Paskian drive system with entropy accumulation and state transitions. Shows how internal needs (Drive O and Drive P) create behavioral motivation.

**Key Features:**
- ✨ 4-6 visualization windows with different drive configs
- ✨ Real-time charts of O and P drive values
- ✨ Color-coded states (Satisfied, O-Search, P-Search, Either)
- ✨ Manual satisfaction triggers for testing

**Classes:** `DriveSubsystem`, `Drive`

---

### Demo 5.5: Pulse Communication

**Category:** Subsystem (Infrastructure) | **Complexity:** Advanced | **Dependencies:** Demos 1, 5

Demonstrates pulse transmission/reception **infrastructure** - the communication "channel" that enables social behavior in later demos. Shows circular buffers, pattern transmission, and message passing mechanics.

**Key Features:**
- ✨ 2-3 Mobiles with transmitters and receivers
- ✨ Visual circular buffer display (receive and transmit buffers)
- ✨ Pattern visualization (binary sequences flowing through system)
- ✨ Fixed/manual pattern selection (not drive-based yet)
- ✨ Pattern matching detection (visual indicators when patterns match)
- ✨ Message broker visualization (Environment forwarding pulses)

**Classes:** `PulseTransmitter`, `PulseReceiver`, `PaskPatterns`, updated `Environment` (message broker)

**Scope:** Infrastructure (SENSE and ACT phases) only. Does NOT demonstrate:
- Drive state → pattern selection (Demos 8-10)
- Behavioral responses to received patterns (Demos 8-12)
- Social negotiation rules (Demos 11-12)

**Critical Context:** Provides the communication "channel". The intelligence (what to say, how to respond) comes in Complete Mobile demos.

**Modernizes:** demo-05-transceiversV2 (infrastructure components only)

---

### Demo 6: Horizontal Control Subsystem

**Category:** Subsystem | **Complexity:** Intermediate | **Dependencies:** Demo 1

Demonstrates oscillator-based yaw rotation used by all Mobiles. Shows motion profiles (trapezoidal), RELEASED vs STOPPED states, and return to reinforcement.

**Key Features:**
- ✨ 3-4 Mobiles with different oscillator configs
- ✨ Motion profile visualization (position/velocity/acceleration)
- ✨ State controls (RELEASE/STOP)
- ✨ Real-time parameter adjustment

**Classes:** `HorizontalControlSubsystem`, `Oscillator`, `MotionProfile`

---

### Demo 7: Vertical Control Subsystem

**Category:** Subsystem | **Complexity:** Intermediate | **Dependencies:** Demo 6

Demonstrates Female Mobile's independent roll rotation. Shows two-axis control with vertical reflector oscillation while horizontal rotation operates independently.

**Key Features:**
- ✨ Single Female Mobile with dual-axis control
- ✨ Independent vertical oscillation visualization
- ✨ Coordinated motion display
- ✨ Motion profiles for both axes

**Classes:** `VerticalControlSubsystem`, `HorizontalControlSubsystem`, `Oscillator`

---

### Demo 8: Male Mobile Behavior

**Category:** Complete Mobile | **Complexity:** Advanced | **Dependencies:** Demos 1, 2, 3, 5, 6

Demonstrates complete Male Mobile with integrated drive system, horizontal control, and sensors/actuators. Shows search behavior when unsatisfied, return to reinforcement when satisfied.

**Key Features:**
- ✨ Single Male Mobile with all subsystems
- ✨ Drive-coupled horizontal oscillation
- ✨ Search/satisfaction behavior cycle
- ✨ Real-time telemetry (drives, position, sensors)

**Classes:** `Mobile`, `DriveSubsystem`, `HorizontalControlSubsystem`, `LightSensor`, `SoundActuator`

---

### Demo 9: Female Mobile Behavior

**Category:** Complete Mobile | **Complexity:** Advanced | **Dependencies:** Demos 1, 2, 3, 5, 6, 7

Demonstrates complete Female Mobile with drive system and two-axis control. Shows coordinated horizontal and vertical oscillation with independent reflector scanning.

**Key Features:**
- ✨ Single Female Mobile with all subsystems
- ✨ Dual-axis drive-coupled control
- ✨ Independent vertical reflector behavior
- ✨ Complex motion coordination visualization

**Classes:** `Mobile`, `DriveSubsystem`, `HorizontalControlSubsystem`, `VerticalControlSubsystem`

---

### Demo 10: Beam Arbitration

**Category:** Complete Mobile | **Complexity:** Advanced | **Dependencies:** Demo 8

Demonstrates the Beam (Bar) as a reactive agent that arbitrates between two Male Mobiles. Shows dominant-drive selection logic and beam positioning based on competition.

**Key Features:**
- ✨ Central Beam + 2 Male Mobiles
- ✨ Real-time arbitration logic display
- ✨ Drive comparison visualization
- ✨ Beam responds to dominant drive

**Classes:** `Mobile` (Beam type), `DriveSubsystem` (arbitration mode)

---

### Demo 11: Simple Colloquy (3 Mobiles)

**Category:** Social Interaction | **Complexity:** Advanced | **Dependencies:** Demos 1-9

Demonstrates basic social interaction between 3 Mobiles. Shows emergent behavior through sensor/actuator communication, drive-based searching, and mutual satisfaction.

**Key Features:**
- ✨ 3 Mobiles in circular arrangement
- ✨ Interaction tracking and event log
- ✨ Social dynamics visualization
- ✨ Drive satisfaction through communication

**Classes:** `Environment`, `Mobile`, all subsystems and components

---

### Demo 12: Full Colloquy (6 Mobiles)

**Category:** Social Interaction | **Complexity:** Advanced | **Dependencies:** Demos 1-11

Demonstrates complete Colloquy of Mobiles simulation with all agent types. The full museum installation behavior with emergent social dynamics.

**Key Features:**
- ✨ 2 Males + 3 Females + 1 Beam
- ✨ Complete interaction system
- ✨ Multiple camera views
- ✨ Analytics dashboard overlay

**Classes:** All simulation classes (complete system)

**Config:** `apps/SimulationConfigurationFiles/config_v2.json`

---

### Demo 13: Config Editor/Visualizer

**Category:** Tool | **Complexity:** Intermediate | **Dependencies:** Demo 1

Interactive tool for creating and editing Config V2 files. Visual scene editor with live preview and JSON schema validation.

**Key Features:**
- ✨ Visual scene editor
- ✨ JSON schema validation
- ✨ Live configuration preview
- ✨ Import/export functionality

**Classes:** `SceneGraphLoader`, `Environment`, all classes (for validation)

---

### Demo 14: Serialization Test

**Category:** Tool | **Complexity:** Basic | **Dependencies:** Phase A

Demonstrates save/load functionality for simulation state. Tests the complete serialization system required for state persistence and network transmission.

**Key Features:**
- ✨ Create simulation state
- ✨ Serialize to JSON (`toJSON()`)
- ✨ Save/load from file or localStorage
- ✨ Verify state preservation

**Classes:** All classes with `toJSON()`/`fromJSON()` methods

---

### Demo 15: Performance Benchmark

**Category:** Tool | **Complexity:** Advanced | **Dependencies:** Demo 12

Tests simulation performance with variable Mobile counts. Identifies bottlenecks and validates museum installation requirements.

**Key Features:**
- ✨ Scalable Mobile count (1-100)
- ✨ FPS monitoring
- ✨ Update time profiling
- ✨ Memory usage tracking

**Classes:** `Environment`, `Mobile`, all subsystems (performance testing)

---

## Development Workflow

### Creating a New Demo

1. **Copy Template**
   ```bash
   cp -r apps/demo-TS-template apps/demo-TS-##-name
   cd apps/demo-TS-##-name
   ```

2. **Update Package.json**
   - Change name to `demo-ts-##-name`
   - Update description
   - Add any demo-specific dependencies

3. **Create Config File**
   - Create `public/config.json` following Config V2 schema
   - Use `SceneGraphLoader` to load it

4. **Implement Simulation** (`src/main.ts`)
   ```typescript
   import { SceneGraphLoader } from '../../../lib/SceneGraphLoader';
   import { Environment } from '../../../lib/Environment';
   
   const config = await fetch('./config.json').then(r => r.json());
   const environment = SceneGraphLoader.loadFromConfig(config);
   
   function update() {
       environment.update();
       // ... render, update UI
   }
   ```

5. **Implement Renderer** (`src/renderer.ts`)
   ```typescript
   import * as THREE from 'three';
   import { SimulationState } from '../../../lib/types/state';
   
   export class DemoRenderer {
       render(state: SimulationState) {
           // Update THREE.js scene from state
           // NEVER modify state here
       }
   }
   ```

6. **Implement UI** (`src/ui.ts`)
   ```typescript
   export class DemoUI {
       constructor(environment: Environment) {
           this.setupControls();
           this.setupDisplays();
       }
       
       update() {
           // Read from environment, update displays
       }
   }
   ```

7. **Write Documentation**
   - Create `README.md` using template
   - Create `DEMO_CARD.md` using template
   - Document dependencies and purpose

8. **Capture Screenshot**
   - Run demo
   - Capture representative screenshot
   - Save as `screenshot.png`

9. **Test Thoroughly**
   - Run demo independently
   - Verify no console errors
   - Test all controls
   - Verify dependency requirements

10. **Update Index**
    - Add card to `apps/public/demos.html`
    - Add to main README if significant

### Code Review Checklist

Before submitting a new demo:

- [ ] All code is TypeScript (`.ts` files)
- [ ] No legacy imports (`Agent.js`, `*_THREE.js`, etc.)
- [ ] Simulation and visualization are separated
- [ ] Renderer only reads state, never modifies
- [ ] Config V2 file validates against schema
- [ ] README.md complete
- [ ] DEMO_CARD.md complete
- [ ] Screenshot captured
- [ ] Dependencies documented accurately
- [ ] Runs without errors or warnings
- [ ] UI is responsive and labeled
- [ ] Comments explain non-obvious code

### Common Patterns

#### Pattern 1: Simple Static Scene

```typescript
// Load once, render repeatedly
const config = await loadConfig();
const environment = SceneGraphLoader.loadFromConfig(config);
const renderer = new ThreeJSRenderer();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(environment.toJSON());
}
```

#### Pattern 2: Dynamic Simulation

```typescript
// Update simulation each frame
const environment = SceneGraphLoader.loadFromConfig(config);
const renderer = new ThreeJSRenderer();

function animate() {
    requestAnimationFrame(animate);
    
    // Update simulation
    environment.update();
    
    // Render updated state
    renderer.render(environment.toJSON());
}
```

#### Pattern 3: Interactive Controls

```typescript
const environment = SceneGraphLoader.loadFromConfig(config);
const renderer = new ThreeJSRenderer();
const ui = new DemoUI(environment);

// UI controls simulation
ui.onButtonClick('release', () => {
    const mobile = environment.getMobileById(mobileId);
    mobile.setMotionRequest(MotionRequest.RELEASE);
});

function animate() {
    requestAnimationFrame(animate);
    environment.update();
    renderer.render(environment.toJSON());
    ui.update(); // Update displays from environment
}
```

#### Pattern 4: Chart Visualization

```typescript
const environment = SceneGraphLoader.loadFromConfig(config);
const chartRenderer = new DashboardRenderer(canvasElement);

function animate() {
    requestAnimationFrame(animate);
    environment.update();
    
    // Extract data for charts
    const mobile = environment.getMobileById(mobileId);
    const driveState = mobile.drives.getState();
    
    // Render charts
    chartRenderer.renderDriveChart(driveState);
}
```

---

## Migration from Legacy

### Step-by-Step Process

1. **Choose Legacy Demo** from inventory
2. **Identify Core Concept** being demonstrated
3. **Check Dependencies** - What must exist first?
4. **Design New Demo** following template
5. **Create Config V2** file for scene
6. **Implement Simulation** using TypeScript classes only
7. **Add Visualization** using pure renderer
8. **Create UI** for interaction/display
9. **Write Documentation** (README + Card)
10. **Test Thoroughly**
11. **Archive Legacy** demo to `apps/archive-legacy/`

### Example: Migrating demo-04-drives → Demo 5

**Legacy Issues:**
- Uses `Agent_DriveManager.js` (old JavaScript)
- Direct p5.js rendering mixed with logic
- No config file
- No separation of concerns

**New Approach:**
```typescript
// demo-TS-05-drive-system/src/main.ts
import { SceneGraphLoader } from '../../../lib/SceneGraphLoader';
import { DashboardRenderer } from './renderer';

// Config defines multiple drive subsystems
const config = await fetch('./config.json').then(r => r.json());
const environment = SceneGraphLoader.loadFromConfig(config);

// Separate renderer for charts
const renderer = new DashboardRenderer(document.getElementById('canvas'));

function animate() {
    requestAnimationFrame(animate);
    
    // Update drives (entropy accumulation)
    environment.update();
    
    // Extract drive data
    const mobiles = environment.getAllMobiles();
    const driveData = mobiles.map(m => m.drives.getState());
    
    // Render charts (pure visualization)
    renderer.renderDriveCharts(driveData);
}
```

**Benefits:**
- Clean TypeScript with proper types
- Reusable `DriveSubsystem` class
- Config-driven setup
- Visualization separate from logic
- Can easily adapt for museum installation

---

## Next Steps

1. **Review and Approve** this plan
2. **Implement Phase A** (foundation infrastructure)
3. **Begin Tier 1** (Core Components - Demos 1-4)
4. **Progress through tiers** following dependency graph
5. **Archive legacy demos** as new versions complete
6. **Update main index** page with demo cards

## Validation Checklist

### For Each Demo

- [ ] Uses only TypeScript (`.ts` files, not `.js`)
- [ ] Uses classes from `lib/` (no legacy code)
- [ ] Config V2 file for scene setup
- [ ] Separate simulation and visualization
- [ ] **3D demos use standard `CameraController`**
- [ ] Complete README.md from template
- [ ] Complete DEMO_CARD.md from template
- [ ] Runs independently (no cross-demo dependencies except as documented)
- [ ] Responsive UI with clear labels
- [ ] No console errors or warnings
- [ ] Screenshot captured for card

### For Complete Suite

- [ ] Phase A complete (foundation)
- [ ] All Tier 1-2 demos complete (foundation + subsystems)
- [ ] At least Demos 8-9 complete (complete Mobiles)
- [ ] Demo 12 complete (Full Colloquy)
- [ ] Legacy demos archived
- [ ] Demo index page created with all cards
- [ ] Documentation for adding new demos

---

## Questions Resolved

1. ~~Should we keep p5.js for 2D chart demos, or use Canvas API directly?~~
   - **Answer:** Canvas API + TypeScript for all 2D visualization. No p5.js.

2. ~~Do we need VR/WebXR demos, or focus on desktop first?~~
   - **Answer:** Desktop first. VR will come later as a separate client view in the museum installation.

3. ~~Should demos share a common UI library/theme?~~
   - **Answer:** Yes, establish shared UI utilities in Phase A.

4. ~~What level of interactivity should demos support?~~
   - **Answer:** Basic controls (play/pause, parameter adjustment). Focus on observation over gameplay.

5. ~~Should demos support mobile/touch input?~~
   - **Answer:** Desktop focus. Touch support is nice-to-have but not required.

---

**Related Documentation:**
- [Refactoring Plan - Phase 9](REFACTORING_PLAN.md#phase-9-visualization-refactor-)
- [Refactoring Plan - Phase 10](REFACTORING_PLAN.md#phase-10-demo-migration-)
- [Pulse Communication Architecture](PULSE_COMMUNICATION_ARCHITECTURE.md) - **CRITICAL** for social behavior
- [README - Architecture](../readme.md#simulation-philosophy--architecture)
- [Terminology Guide](terminology.md)
- [Camera Controller Specification](CAMERA_CONTROLLER_SPEC.md)
- [Demo Examples](demo-examples/) - Complete README and Card templates
