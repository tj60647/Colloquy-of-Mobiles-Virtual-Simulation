# TypeScript Refactoring & Renaming Plan

## Overview

This document maps the legacy JavaScript codebase to the new TypeScript architecture. The goal is to align the codebase with the canonical terminology defined in `docs/terminology.md` and the architecture patterns in `README.md`.

## Execution Status

| Status | Phase | Description |
| :--- | :--- | :--- |
| ✅ | **Phase 1: Setup** | install TS, Jest, ESLint, Prettier |
| 🔄 | **Phase 2: Core Migration** | Rename & convert core logic classes (Mobiles, Drives) |
| ⏳ | **Phase 3: Visualization** | Migrate p5.js/Three.js components |
| ⏳ | **Phase 4: Application** | Migrate server and app entry points |

## Phase 2: Core Logic Migration (Priority)

These are the foundational classes that define the "brain" of the simulation. They should be migrated first to establish the strict type system.

| Legacy File (`lib/`) | New TypeScript File (`lib/`) | Renaming Rationale |
| :--- | :--- | :--- |
| `Drive.js` | **`Drive.ts`** | Represents a single Drive (O or P). |
| `DriveManager.js` | **`DriveSubsystem.ts`** | "Subsystem" is the canonical term for functional units within a Mobile. |
| `MotionProfile.js` | **`MotionProfile.ts`** | Helper class, naming is consistent. |
| `Agent.js` | **`Mobile.ts`** | **CRITICAL**: "Mobile" is Pask's term. "Agent" is generic. |
| `Agent_DriveManager.js` | *Delete / Merge* | Seems to be legacy test code? Verify and merge into `DriveSubsystem.ts` if needed. |
| `Environment.js` | **`SimulationLoop.ts`** | Clarifies the role: it's the synchronous loop orchestrator, not a spatial container. |

## Phase 3: Components & Subsystems

These classes represent the hardware components of the Mobiles.

| Legacy File (`lib/`) | New TypeScript File (`lib/`) | Renaming Rationale |
| :--- | :--- | :--- |
| `Oscillator.js` | **`HorizontalControlSubsystem.ts`** | Pask specific: managing the horizontal rotation. |
| `LightSensor.js` | **`components/LightSensor.ts`** | Move to `components/` directory to organize hardware. |
| `SoundSensor.js` | **`components/SoundSensor.ts`** | |
| `Sensor.js` | **`components/SensorBase.ts`** | Base class for sensors. |
| `LightActuator.js` | **`components/LightActuator.ts`** | |
| `SoundActuator.js` | **`components/SoundActuator.ts`** | |
| `Actuator.js` | **`components/ActuatorBase.ts`** | Base class for actuators. |

## Phase 4: Visualization & Infrastructure (Lower Priority)

These files handle the 2D/3D rendering and server communication. Can remain as JS for longer if needed.

| Legacy File (`lib/`) | New TypeScript File (`lib/`) | Renaming Rationale |
| :--- | :--- | :--- |
| `Render2Dp5.js` | **`visualization/Render2D.ts`** | |
| `Render3Dp5.js` | **`visualization/Render3D.ts`** | |
| `*_THREE.js` | **`visualization/three/*`** | Group all Three.js adapters in a dedicated folder. |
| `UI_Utilities.js` | **`utils/UI.ts`** | |
| `DebugUtility.js` | **`utils/Debug.ts`** | |
| `cameraUtilities.js` | **`visualization/CameraUtils.ts`** | |

## Migration Workflow (Per Class)

1.  **Select a file** from the table above (start with Phase 2).
2.  **Create Test**: `lib/__tests__/[NewName].test.ts`.
3.  **Run Test**: Verify it fails (or passes if testing existing logic).
4.  **Rename & Convert**:
    *   Rename file to `.ts`.
    *   Change Class Name to [NewName].
    *   Apply `lib/types` interfaces.
5.  **Fix Imports**: Update all references in the codebase (VS Code refactor tools help here).
6.  **Verify**: Run `npm test` and `npm run type-check`.

## Glossary of Changes

*   **Agent** -> **Mobile**
*   **Manager** -> **Subsystem** (where appropriate)
*   **Environment** -> **SimulationLoop**
