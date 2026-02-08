# Visualization (`lib/visualization/`)

This directory contains **THREE.js wrapper classes** that bridge the core simulation with 3D rendering.

## Purpose

These files provide **visualization adapters** that:
1. Wrap core simulation classes (Transform, Oscillator, Sensors, Actuators)
2. Add THREE.js scene graph nodes (meshes, geometries, materials)
3. Sync visual representation with simulation state

**Important:** These are **client-side only** - the server doesn't need them.

---

## Files

| File | Description |
|------|-------------|
| `Transform_THREE.js` | THREE.js wrapper for `Transform` (adds THREE.Object3D) |
| `OscillatorSystem_THREE.js` | THREE.js wrapper for `Oscillator` (visual representation) |
| `Sensor_THREE.js` | THREE.js wrapper for sensors (visual cones, raycasts) |
| `Actuator_THREE.js` | Base THREE.js wrapper for actuators |
| `Actuator_Light_THREE.js` | THREE.js wrapper for light actuators (PointLight) |
| `Actuator_Sound_THREE.js` | THREE.js wrapper for sound actuators (visual indicators) |
| `Transducer_THREE.js` | THREE.js wrapper for transducers (legacy) |
| `cameraUtilities.js` | Camera control utilities for THREE.js scenes |

---

## Architecture

### **Separation of Concerns**

```
Core Simulation (Platform-Agnostic)    Visualization (THREE.js)
────────────────────────────────────    ────────────────────────
Transform.ts                     ───>   Transform_THREE.js
Oscillator.ts                    ───>   OscillatorSystem_THREE.js
SensorBase.ts                    ───>   Sensor_THREE.js
ActuatorBase.ts                  ───>   Actuator_THREE.js
```

**Key Principle:** Core simulation has **no dependency** on THREE.js. Visualization wrappers **consume** simulation state.

---

## Usage Pattern

### **Typical Workflow**

```javascript
// 1. Create core simulation object
const mobile = new Mobile({
    name: 'Male 1',
    initialPosition: { x: 0, y: 0, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 }
});

// 2. Create THREE.js wrapper
const mobileVisual = new OscillatorSystem_THREE(
    mobile.horizontalControlSubsystem,
    scene,
    { /* visual config */ }
);

// 3. Update loop
function animate() {
    // Update simulation
    mobile.update();
    
    // Sync visuals
    mobileVisual.update();
    
    renderer.render(scene, camera);
}
```

---

## Refactoring Status

⚠️ **These files are legacy code** and need refactoring:

### **Current Issues:**
1. **Tight Coupling** - Wrappers sometimes modify simulation state
2. **Mixed Concerns** - Visualization logic mixed with simulation logic
3. **Legacy p5.js Patterns** - Some files still use p5.js conventions

### **Planned Refactoring:**
1. **Pure Adapters** - Wrappers should only **read** simulation state, never modify
2. **Separate Renderers** - Create dedicated renderer classes:
   - `ThreeJSRenderer` - Standard 3D view
   - `WebXRRenderer` - VR/AR view
   - `DashboardRenderer` - 2D charts/graphs
3. **Server/Client Split** - Move all visualization to client-only bundle

---

## Server/Client Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Simulation Server (Node.js)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Core Simulation (NO THREE.js)                       │   │
│  │  - Mobile.ts                                         │   │
│  │  - Environment.ts                                    │   │
│  │  - DriveSubsystem.ts                                 │   │
│  │  - Oscillator.ts                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ WebSocket (JSON state)            │
│                          ▼                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Viewing Lenses (Browser)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Visualization Layer (THREE.js)                      │   │
│  │  - Transform_THREE.js                                │   │
│  │  - OscillatorSystem_THREE.js                         │   │
│  │  - Sensor_THREE.js                                   │   │
│  │  - Actuator_THREE.js                                 │   │
│  │  - cameraUtilities.js                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Notes

When refactoring demos:

1. **Import from visualization/** - `import { OscillatorSystem_THREE } from '../lib/visualization/OscillatorSystem_THREE.js'`
2. **Separate simulation from rendering** - Update simulation state first, then sync visuals
3. **Use state snapshots** - Renderers should consume `toJSON()` output, not direct object references

---

## Related Documentation

- `../subsystems/README.md` - Core subsystem implementations
- `../components/README.md` - Sensor/actuator components
- `../legacy/README.md` - Legacy p5.js code
- `../../readme.md` (lines 122-148) - Server/client architecture
