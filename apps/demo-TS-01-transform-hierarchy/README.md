# Demo 1: Transform Hierarchy

## Purpose

Demonstrates parent-child transform relationships in the scene graph, showing how child objects inherit their parent's transformations.

## What You'll See

- A parent transform (blue cube) rotating around the Y-axis
- Two child transforms (red and green cubes) attached to the parent
- A grandchild transform (orange cube) attached to one of the children
- Local coordinate axes showing each transform's orientation
- Grid plane for spatial reference

The hierarchy rotates together, demonstrating:
- Position inheritance (children move with parent)
- Rotation inheritance (children rotate with parent)
- Local transformations (each object can also rotate independently)

## Core Concepts Demonstrated

- `Transform.ts` - Scene graph base class with parent-child relationships
- `SceneGraphLoader.ts` - Loading transforms from Config V2 JSON
- `ThreeJSRenderer.ts` - Pure adapter pattern (visualization separate from simulation)
- `CameraController.ts` - Standardized camera controls

## Controls

### Camera Controls (Standard)
- **Left Mouse Drag:** Rotate camera around scene (orbit)
- **Right Mouse Drag:** Pan camera  
- **Mouse Wheel:** Zoom in/out
- **R Key:** Reset camera to default view
- **T Key:** Toggle perspective/orthographic projection
- **F Key:** Focus camera on selected object
- **1-4 Keys:** Preset views (Top, Front, Side, Isometric)
- **H Key:** Show camera help

### Interaction
- No interaction in this demo - watch the automatic animation demonstrating transform hierarchy

## Configuration

**Config File:** `public/config.json`

Defines a simple transform hierarchy:
```
Root
 └─ Parent (rotates on Y-axis)
     ├─ Child 1 (rotates locally on Z-axis)
     │   └─ Grandchild (rotates locally on X-axis)
     └─ Child 2 (static)
```

## Technical Details

### Simulation Classes Used
- `lib/Transform.ts` - Parent-child transform relationships
- `lib/Environment.ts` - Container for transforms
- `lib/SceneGraphLoader.ts` - Config V2 loader

### Visualization
- Renderer: `ThreeJSRenderer` (extended as `Demo1Renderer`)
- Update Rate: 60 FPS
- Camera: Perspective with standard CameraController
- Lighting: Ambient + Directional + Hemisphere

### Animations
- Parent: Rotates 0.5 rad/s around Y-axis
- Child 1: Rotates 1.0 rad/s around local Z-axis
- Grandchild: Rotates 1.5 rad/s around local X-axis

## Dependencies

**Required Demos:** None (Foundation demo)
**Blocks Demos:** All other demos (validates foundation)

## Relationship to Museum Installation

This demo validates:
- Scene graph hierarchy (used by all Mobiles)
- Transform serialization (`toJSON()`)
- Renderer as pure adapter (reads state, never modifies)

In the museum installation, the same transform hierarchy runs on the server, and multiple clients visualize it via WebSocket.

## Development Notes

### To Run:
```bash
cd apps/demo-TS-01-transform-hierarchy
npm install
npm run dev
```

Open http://localhost:3000

### Key Implementation:
- Extends `ThreeJSRenderer` to add animation
- Overrides `createMobileObject()` for custom visualization
- Uses time-based animation (not simulation-driven yet)

### Next Steps:
- Demo 2 will add Sensors with FOV detection
- Demo 3 will add Actuators with field visualization
- Future demos will move animation into simulation (Drive/Oscillator systems)

## See Also

- [Demo Template](../demo-TS-template/)
- [DEMO_REFACTORING_PLAN.md](../../docs/DEMO_REFACTORING_PLAN.md)
- [Transform.ts](../../lib/Transform.ts)
- [SceneGraphLoader.ts](../../lib/SceneGraphLoader.ts)
