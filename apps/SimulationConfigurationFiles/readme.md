# Simulation Configuration Files

This directory contains JSON configuration files that define the physical system hierarchy, spatial layout, and component configurations for the Colloquy of Mobiles simulation.

---

## Files

### **Configuration Files**

| File | Description | Status |
|------|-------------|--------|
| `config.json` | Default configuration for standard simulation runs | Legacy |
| `config_240812.json` | Physical system configuration (August 24, 2012 design) | ✅ Active |
| `simulation-config.schema.json` | JSON Schema for validation | ✅ New |

### **Schema File**

**`simulation-config.schema.json`** - JSON Schema (Draft-07) that validates configuration files.

**Features:**
- ✅ IDE autocomplete and validation
- ✅ Real-time error checking
- ✅ Documents expected structure
- ✅ Type definitions for Vector3, Orientation, RangeOfMotion

**Usage:** Add `"$schema": "./simulation-config.schema.json"` to the top of config files.

---

## Configuration Structure

### **Top Level:**
```json
{
  "$schema": "./simulation-config.schema.json",
  "coordinateSystems": [
    // Array of coordinate systems and embedded agents
  ]
}
```

### **Coordinate System:**
```json
{
  "name": "world",
  "type": "coordinateSystem",
  "parentCoordinateSystem": "parent_name",  // Optional (omit for root)
  "description": "Human-readable description",
  "location": { "x": 0, "y": 0, "z": 0 },
  "orientation": { "roll": 0, "pitch": 0, "yaw": 0 },
  "rangeOfMotion": {  // Optional (for oscillators)
    "yaw": { "min": -30, "max": 30 }
  }
}
```

### **Agent (Mobile/Component):**
```json
{
  "name": "female 1",
  "type": "origin",  // "origin" | "actuator" | "sensor"
  "thisCoordinateSystem": "female_1_base",
  "parentCoordinateSystem": "armature",
  "location": { "x": 0, "y": 68, "z": 0 },
  "orientation": { "roll": 0, "pitch": 0, "yaw": 0 },
  "rangeOfMotion": {  // Optional (for subsystems)
    "yaw": { "min": -30, "max": 30 }
  },
  "childElements": [
    // Nested sensors, actuators, subsystems
  ]
}
```

---

## How to Use

### **1. Default Configuration**
```typescript
import { SceneGraphLoader } from '../lib/SceneGraphLoader';

const environment = await SceneGraphLoader.loadFromFile(
    'apps/SimulationConfigurationFiles/config_240812.json'
);
```

### **2. Custom Configuration**
1. Create a new `.json` file in this directory
2. Add `"$schema": "./simulation-config.schema.json"` at the top
3. Define your coordinate systems and agents
4. VS Code will validate automatically!

### **3. Validation**
The schema validates:
- Required fields (name, type, location, orientation)
- Angle ranges (yaw: ±360°, roll/pitch: ±180°)
- Vector3 structure (x, y, z)
- Type discriminators ("coordinateSystem", "origin", "actuator", "sensor")

---

## Physical System Hierarchy

**`config_240812.json`** defines the complete physical system:

```
world
├── armature
│   ├── female_1_base
│   │   └── horizontal control subsystem
│   │       ├── female speaker (actuator)
│   │       ├── female microphone (sensor)
│   │       └── vertical control subsystem
│   │           └── female light sensor (sensor)
│   ├── female_2_base (similar structure)
│   ├── female_3_base (similar structure)
│   └── beam
│       ├── beam_horizontal_control
│       ├── male_1_base
│       │   └── horizontal control subsystem
│       │       ├── male speaker (actuator)
│       │       └── male microphone (sensor)
│       └── male_2_base (similar structure)
└── plinth
```

---

## Adding New Configurations

1. **Create File:** `config_custom.json`
2. **Add Schema Reference:**
   ```json
   {
     "$schema": "./simulation-config.schema.json",
     "coordinateSystems": []
   }
   ```
3. **Define Hierarchy:** Add coordinate systems and agents
4. **Validate:** VS Code will show errors in real-time
5. **Load:** Use `SceneGraphLoader.loadFromFile()`

---

## Schema Validation Examples

### ✅ **Valid:**
```json
{
  "$schema": "./simulation-config.schema.json",
  "coordinateSystems": [
    {
      "name": "world",
      "type": "coordinateSystem",
      "location": { "x": 0, "y": 0, "z": 0 },
      "orientation": { "roll": 0, "pitch": 0, "yaw": 0 }
    }
  ]
}
```

### ❌ **Invalid (missing required field):**
```json
{
  "coordinateSystems": [
    {
      "name": "world",
      "type": "coordinateSystem",
      "location": { "x": 0, "y": 0 }  // Missing 'z'
    }
  ]
}
```
**Error:** "Missing property 'z'"

### ❌ **Invalid (out of range):**
```json
{
  "coordinateSystems": [
    {
      "name": "world",
      "type": "coordinateSystem",
      "location": { "x": 0, "y": 0, "z": 0 },
      "orientation": { "roll": 0, "pitch": 0, "yaw": 400 }  // > 360
    }
  ]
}
```
**Error:** "Value is above the maximum of 360"

---

## Related Documentation

- `../../lib/SceneGraphLoader.ts` - Config file parser
- `../../lib/Mobile.ts` - Mobile class
- `../../lib/Transform.ts` - Scene graph base class
- `../../docs/REFACTORING_PLAN.md` - Phase 7 tracking
