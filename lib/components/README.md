# Components (`lib/components/`)

This directory contains **sensor and actuator component classes** - the external attachments that Mobiles use to interact with their environment.

## Purpose

Components are **external attachments** to Mobiles that:
1. **Sensors** - Detect environmental stimuli (light, sound)
2. **Actuators** - Emit signals to the environment (light, sound)
3. **Scene Graph Integration** - Exist as children of Mobiles in the Transform hierarchy

**Key Distinction:** Components are **external** attachments, while `subsystems/` contains **internal** mechanisms (drives, motors).

---

## Files

### **Base Classes**

| File | Description |
|------|-------------|
| `SensorBase.ts` | Abstract base class for all sensors (extends `Transform`) |
| `ActuatorBase.ts` | Abstract base class for all actuators (extends `Transform`) |

**Features:**
- Extend `Transform` (scene graph nodes)
- Field of view (FOV) for directional sensing/actuation
- `isInFieldOfView(point)` - Cone-based detection
- Serialization support (`toJSON()` / `fromJSON()`)

---

### **Sensor Implementations**

| File | Description | Purpose |
|------|-------------|---------|
| `LightSensor.ts` | Detects light intensity | Female engagement detection (reflector position) |
| `SoundSensor.ts` | Detects sound frequencies | Male engagement detection (speaker output) |

**Usage:**
```typescript
const lightSensor = new LightSensor(
    mobile,                          // Parent (Mobile)
    { x: 0, y: 5, z: 0 },           // Local position
    { pitch: 0, yaw: 0, roll: 0 },  // Local orientation
    90                               // Field of view (degrees)
);

mobile.addSensor(lightSensor); // Adds as scene graph child

// Sensing
const intensity = lightSensor.sense(lightSources);
```

---

### **Actuator Implementations**

| File | Description | Purpose |
|------|-------------|---------|
| `LightActuator.ts` | Emits light | Female reflector (mirror) |
| `SoundActuator.ts` | Emits sound | Male speaker |

**Usage:**
```typescript
const speaker = new SoundActuator(
    mobile,                          // Parent (Mobile)
    { x: 0, y: -5, z: 0 },          // Local position
    { pitch: 0, yaw: 0, roll: 0 },  // Local orientation
    120                              // Field of view (degrees)
);

mobile.addActuator(speaker); // Adds as scene graph child

// Actuation
speaker.act({ frequency: 440, amplitude: 0.8 });
```

---

## Architecture

### **Component Composition in Mobile**

```typescript
export class Mobile extends Transform {
    // Subsystems (internal)
    public driveSubsystem: DriveSubsystem;
    public horizontalControlSubsystem: HorizontalControlSubsystem;
    
    // Components (external, scene graph children)
    public sensors: SensorBase[] = [];
    public actuators: ActuatorBase[] = [];
    
    addSensor(sensor: SensorBase) {
        this.sensors.push(sensor);
        this.addChild(sensor); // Scene graph hierarchy
    }
    
    addActuator(actuator: ActuatorBase) {
        this.actuators.push(actuator);
        this.addChild(actuator); // Scene graph hierarchy
    }
}
```

### **Scene Graph Hierarchy**

```
Mobile (Transform)
├── LightSensor (Transform child)
│   └── position: { x: 0, y: 5, z: 0 }
│   └── fieldOfView: 90°
├── SoundActuator (Transform child)
│   └── position: { x: 0, y: -5, z: 0 }
│   └── fieldOfView: 120°
└── ... (other components)
```

**Benefits:**
- Components inherit parent's world transform
- Automatic position/orientation updates
- Serialization includes full hierarchy

---

## Physical System Mapping

### **From `config_240812.json`:**

```json
{
  "name": "horizontal control subsystem",
  "childElements": [
    {
      "name": "female speaker",
      "type": "actuator",
      "subtype": "sound",
      "position": { "x": 0, "y": -5, "z": 0 }
    },
    {
      "name": "female microphone",
      "type": "sensor",
      "subtype": "sound",
      "position": { "x": 0, "y": 5, "z": 0 }
    },
    {
      "name": "vertical control subsystem",
      "childElements": [
        {
          "name": "female light sensor",
          "type": "sensor",
          "subtype": "light",
          "position": { "x": 0, "y": 0, "z": 3 }
        }
      ]
    }
  ]
}
```

**TypeScript Implementation:**
```typescript
const female = new Mobile({ name: 'Female 1', ... });

// Add sensors
const microphone = new SoundSensor(female, { x: 0, y: 5, z: 0 }, {...}, 90);
const lightSensor = new LightSensor(female, { x: 0, y: 0, z: 3 }, {...}, 90);
female.addSensor(microphone);
female.addSensor(lightSensor);

// Add actuators
const speaker = new SoundActuator(female, { x: 0, y: -5, z: 0 }, {...}, 120);
female.addActuator(speaker);
```

---

## Design Principles

### **1. Separation from Subsystems**

| Components | Subsystems |
|------------|------------|
| **External** attachments | **Internal** mechanisms |
| Sensors, actuators | Drives, motors |
| Scene graph children | Not in scene graph |
| `mobile.addSensor(sensor)` | `mobile.driveSubsystem` |
| Interact with environment | Internal state/behavior |

### **2. Field of View**

All components have a **directional field of view** (cone):

```typescript
// Check if point is in sensor's FOV
const inView = sensor.isInFieldOfView(targetPosition);

// Uses dot product: forward.dot(toTarget) >= cos(FOV/2)
```

**Purpose:**
- Sensors only detect targets in their cone
- Actuators only affect targets in their cone
- Matches physical hardware constraints

### **3. Transform Inheritance**

Components extend `Transform`, so they:
- Have position/orientation
- Can be scene graph children
- Inherit parent's world transform
- Support serialization

---

## Serialization

### **toJSON() / fromJSON()**

```typescript
// Save
const sensorState = lightSensor.toJSON();
// {
//   id: 12345,
//   name: "Female Light Sensor",
//   localPosition: { x: 0, y: 0, z: 3 },
//   localOrientation: { pitch: 0, yaw: 0, roll: 0 },
//   fieldOfView: 90,
//   parentId: 67890
// }

// Load
const restored = LightSensor.fromJSON(sensorState, parentMobile);
```

**Note:** Currently `fromJSON()` instantiates base classes. Future work will add type discriminators for specific subclasses.

---

## Future Enhancements

### **1. Type Discriminators**

Add `type` field to JSON for correct subclass instantiation:

```typescript
// toJSON()
{
    type: 'LightSensor',  // NEW
    fieldOfView: 90,
    // ...
}

// fromJSON()
const sensorFactories = {
    'LightSensor': LightSensor.fromJSON,
    'SoundSensor': SoundSensor.fromJSON
};
const sensor = sensorFactories[json.type](json, parent);
```

### **2. Sensor Fusion**

Combine multiple sensor inputs:

```typescript
const fusedData = mobile.sensors
    .map(s => s.sense())
    .reduce((acc, val) => acc + val, 0) / mobile.sensors.length;
```

### **3. Actuator Coordination**

Coordinate multiple actuators:

```typescript
mobile.actuators.forEach(a => a.act({ intensity: 0.5 }));
```

---

## Related Documentation

- `../subsystems/README.md` - Internal subsystems (drives, motors)
- `../Transform.ts` - Scene graph base class
- `../../apps/SimulationConfigurationFiles/config_240812.json` - Physical system configuration
- `../../docs/terminology.md` - Canonical Pask terminology
