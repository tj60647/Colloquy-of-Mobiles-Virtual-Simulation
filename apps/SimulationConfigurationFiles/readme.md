# Simulation Configuration Files

This directory contains JSON configuration files that define the physical system hierarchy, spatial layout, and component configurations for the Colloquy of Mobiles simulation.

---

## Files

### **Configuration Files**

| File | Description | Status |
|------|-------------|--------|
| `config_v2.json` | **Active Config** (v2 format) - 6 Mobiles, full hierarchy | ✅ ACTIVE |
| `config_v2_example.json` | Example config with Female 1 only | ✅ Example |
| `simulation-config-v2.schema.json` | JSON Schema for v2 validation | ✅ Active |
| `config_240812.json` | Legacy config from Aug 2024 | ⚠️ Legacy |
| `config.json` | Old default config | ❌ Deprecated |

### **Schema File**

**`simulation-config-v2.schema.json`** - JSON Schema (Draft-07) that validates configuration files.

**Features:**
- ✅ IDE autocomplete and validation
- ✅ Real-time error checking
- ✅ Documents expected structure
- ✅ Type definitions for Mobile types, drives, subsystems, components

**Usage:** Add `"$schema": "./simulation-config-v2.schema.json"` to the top of config files.

---

## Configuration Structure (v2)

The v2 format uses a **Hybrid Scene Graph** approach involving two main sections:

### **1. coordinateSystems** (Spatial Hierarchy)
A flat list of transform nodes with parent references. This defines the physical skeleton.

```json
{
  "coordinateSystems": [
    {
      "id": "female1_base",
      "parent": "armature",
      "position": { "x": 0, "y": 68, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0 }
    }
  ]
}
```

### **2. mobiles** (Logical Hierarchy)
Defines autonomous entities and their internal components. This is **Mobile-centric**.

```json
{
  "mobiles": [
    {
      "id": "female1",
      "mobileType": "female",
      "coordinateSystem": "female1_base",  // Links to spatial hierarchy
      
      "drives": { ... },      // Internal state
      "subsystems": [ ... ],  // Oscillators (horizontal/vertical)
      "components": [ ... ]   // Sensors/Actuators
    }
  ]
}
```

---

## How to Use

### **Loading a Config**
```typescript
import { SceneGraphLoader } from '../lib/SceneGraphLoader';

// Load the default v2 config
const environment = await SceneGraphLoader.loadFromFile(
    'apps/SimulationConfigurationFiles/config_v2.json'
);
```

### **2. Creating Custom Configs**
1. Create a new `.json` file in this directory.
2. Add `"$schema": "./simulation-config-v2.schema.json"` at the top.
3. Define `coordinateSystems` and `mobiles`.
4. VS Code will auto-suggest fields and valid values!

### **3. Validation Rules**
The schema enforces:
- **Mobile Types**: `female`, `male`, `beam`
- **Subsystem Types**: `horizontal_control`, `vertical_control`
- **Component Types**: `sound_sensor`, `sound_actuator`, `light_sensor`
- **Ranges**: Angles (±360), Limits, Field of View (0-360)

---

## Physical System Hierarchy

`config_v2.json` defines the complete physical system:

```
world
└── armature
    ├── female1
    │   ├── Horizontal Control (yaw)
    │   │   ├── Vertical Control (roll)
    │   │   │   └── Light Sensor
    │   │   ├── Speaker
    │   │   └── Microphone
    ├── female2 (same)
    ├── female3 (same)
    └── beam
        ├── Male 1
        │   ├── Horizontal Control
        │   └── Sensors/Actuators
        └── Male 2
            ├── Horizontal Control
            └── Sensors/Actuators
```

---

## Related Documentation

- `../../lib/SceneGraphLoader.ts` - V2 Config parser
- `../../lib/Mobile.ts` - Mobile class
- `../../docs/REFACTORING_PLAN.md` - Phase 7 details
