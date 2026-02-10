# Demo 01: Transform Hierarchy

## Purpose

Demonstrates the scene graph system with parent/child transforms, showing how local transformations compose into global coordinates.

## What You'll See

- Four-level transform hierarchy: World → Root → Child → Grandchild
- Color-coded coordinate axes for each transform (X=red, Y=green, Z=blue)
- Slow rotation of child transforms showing hierarchical composition
- Real-time position and orientation displays
- Connecting lines showing parent-child relationships

## Core Concepts Demonstrated

- `Transform.ts` - Base class for all positioned objects in the simulation
- Scene graph hierarchy - How parent transformations affect children
- Local vs global coordinate systems - Position/orientation composition
- `SceneGraphLoader.ts` - Loading transforms from Config V2 format

## Controls

### Camera Controls (Standard Across All 3D Demos)
- **Left Mouse Drag:** Rotate camera around scene (orbit)
- **Right Mouse Drag:** Pan camera
- **Mouse Wheel:** Zoom in/out
- **R Key:** Reset camera to default view
- **T Key:** Toggle perspective/orthographic projection
- **F Key:** Focus camera on selected transform
- **1-4 Keys:** Preset views
  - **1:** Top view (looking down Y-axis)
  - **2:** Front view (looking along Z-axis)
  - **3:** Side view (looking along X-axis)
  - **4:** Isometric view (default)

### Demo-Specific Controls
- **Space:** Pause/resume rotation animation
- **Arrow Keys:** Manually rotate selected transform
- **+ / -:** Increase/decrease rotation speed

### UI Buttons
- **Toggle Axes:** Show/hide coordinate axes for all transforms
- **Toggle Lines:** Show/hide parent-child connection lines
- **Reset Animation:** Return all transforms to initial state
- **Speed Slider:** Adjust rotation speed

## Configuration

**Config File:** `public/config.json`

Defines a simple four-level transform hierarchy:
- World transform at origin (0, 0, 0)
- Root child at (0, 0, 0) relative to World
- Child at (0, 12, 0) relative to Root
- Grandchild at (0, 12, 0) relative to Child
- Great-grandchild at (0, 12, 0) relative to Grandchild

Each level applies a rotation to demonstrate composition.

## Technical Details

### Simulation Classes Used
- `lib/Transform.ts` - Core scene graph node
- `lib/SceneGraphLoader.ts` - Config V2 parser

### Visualization
- **Renderer:** `ThreeJSRenderer` (pure adapter)
- **Update Rate:** 60 fps
- **Camera:** Perspective with OrbitControls
- **Objects:** AxesHelper, Line geometry for connections

### Key Methods
- `Transform.getGlobalPosition()` - Computes world-space position
- `Transform.getGlobalOrientation()` - Computes world-space rotation
- `Transform.getGlobalForwardVector()` - Direction in world space

## Dependencies

**Required Demos:** None (Phase A only - foundation complete)  
**Blocks Demos:** All other demos (scene graph is fundamental)

## Relationship to Museum Installation

The Transform hierarchy demonstrated here is the foundation for all Mobile positioning:

**In Demos (this code):**
- Transforms positioned manually or via config
- Camera is user-controlled

**In Museum Installation:**
- **Server:** Manages Transform hierarchy for all Mobiles
- **Server:** Updates Transform positions based on oscillator subsystems
- **Clients (3D View, VR):** Receive Transform state via WebSocket
- **Clients:** Render transforms using same visualization code

**What's Reusable:**
- `Transform.ts` class (runs on server)
- `toJSON()` serialization (sent via WebSocket)
- Renderer code (runs on clients)

**What Changes:**
- Demo: Updates transforms locally
- Installation: Server updates, clients render received state

## Development Notes

### Performance
- Hierarchy updates are cached (dirty flag pattern)
- Global position/orientation only recalculated when transform or parent changes
- Efficient for static hierarchies with occasional updates

### Scene Graph Best Practices
- Always update parent transforms before children
- Use `invalidateCache()` when manually modifying properties
- Prefer `addChild()` over direct parent assignment

### Common Pitfalls
- Forgetting to call `invalidateCache()` after manual position changes
- Circular parent-child relationships (will throw error)
- Mixing local and global coordinates without conversion

## See Also

- [Transform.ts Source](../../lib/Transform.ts)
- [Transform Tests](../../lib/__tests__/Transform.test.ts)
- [SceneGraphLoader.ts](../../lib/SceneGraphLoader.ts)
- [Config V2 Schema](../../apps/SimulationConfigurationFiles/simulation-config-v2.schema.json)
- [Demo 2: Sensor FOV](../demo-TS-02-sensor-fov/) - Builds on transforms
- [Demo 3: Actuator Field](../demo-TS-03-actuator-field/) - Builds on transforms
