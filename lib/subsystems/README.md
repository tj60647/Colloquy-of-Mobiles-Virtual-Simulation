# Subsystems (`lib/subsystems/`)

This directory contains **Paskian subsystem implementations** - the internal mechanisms that drive Mobile behavior.

## Purpose

Subsystems are **internal components** of Mobiles that model Gordon Pask's original cybernetic architecture:

1. **Drive Subsystem** - Entropy-driven motivation (Orange & Puce drives)
2. **Control Subsystems** - Motor control (Horizontal/Vertical oscillators)
3. **Motion Profiles** - Movement characteristics (velocity, acceleration)

**Key Distinction:** Subsystems are **internal** to Mobiles, while `components/` (sensors/actuators) are **external attachments**.

---

## Files

### **Drive System**

| File | Description |
|------|-------------|
| `Drive.ts` | Individual drive (O or P) with entropy increment/decrement |
| `DriveSubsystem.ts` | Manages both O and P drives, determines behavioral state |

**Purpose:** Models Pask's "Entropy Drives" - the internal hunger/motivation that drives Mobile behavior.

**Usage:**
```typescript
const driveSubsystem = new DriveSubsystem({
    O: { initialValue: 500, floor: 0, lowerLimit: 400, upperLimit: 600, max: 1000, ... },
    P: { initialValue: 500, floor: 0, lowerLimit: 400, upperLimit: 600, max: 1000, ... },
    interval: 1000,
    maxHistorySamples: 100
});

// Drives increment automatically (entropy)
// Decrement on successful interaction
driveSubsystem.decrementODrive();
```

---

### **Control System**

| File | Description |
|------|-------------|
| `Oscillator.ts` | Generic position-controlled oscillator (servomotor) |
| `MotionProfile.ts` | Velocity/acceleration characteristics for smooth motion |
| `HorizontalControlSubsystem.ts` | Specialized oscillator for yaw rotation (all Mobiles) |
| `VerticalControlSubsystem.ts` | Specialized oscillator for roll rotation (Females only) |

**Purpose:** Models the **servomotors** that control Mobile orientation (pan/tilt).

**Usage:**
```typescript
// Horizontal control (yaw rotation)
const horizontalControl = new HorizontalControlSubsystem({
    minPosition: -60,
    maxPosition: 60,
    reinforcementPosition: 0,
    initialPosition: 0,
    motionProfile: { maxVelocity: 15, maxAcceleration: 15 }
});

// Vertical control (roll rotation, Females only)
const verticalControl = new VerticalControlSubsystem({
    minPosition: -15,
    maxPosition: 15,
    reinforcementPosition: 0,
    initialPosition: 0,
    motionProfile: { maxVelocity: 10, maxAcceleration: 10 }
});

// Update loop
horizontalControl.act(); // Updates position based on motion request
const currentAngle = horizontalControl.sensePosition();
```

---

## Architecture

### **Subsystem Composition in Mobile**

```typescript
export class Mobile extends Transform {
    // Subsystems (internal)
    public driveSubsystem: DriveSubsystem;
    public horizontalControlSubsystem: HorizontalControlSubsystem;
    public verticalControlSubsystem?: VerticalControlSubsystem; // Females only
    
    // Components (external, scene graph children)
    public sensors: SensorBase[] = [];
    public actuators: ActuatorBase[] = [];
}
```

### **Paskian Hierarchy**

```
Mobile (Agent)
├── DriveSubsystem (Motivation)
│   ├── O Drive (Orange)
│   └── P Drive (Puce)
├── HorizontalControlSubsystem (Motor - Yaw)
│   ├── Oscillator (Servomotor)
│   └── MotionProfile (Movement characteristics)
└── VerticalControlSubsystem (Motor - Roll, Females only)
    ├── Oscillator (Servomotor)
    └── MotionProfile (Movement characteristics)
```

---

## Design Principles

### **1. Separation from Components**

| Subsystems | Components |
|------------|------------|
| **Internal** mechanisms | **External** attachments |
| Drive behavior, motor control | Sensors, actuators |
| Not in scene graph | Scene graph children |
| `mobile.driveSubsystem` | `mobile.addSensor(sensor)` |

### **2. Paskian Terminology**

These classes follow Gordon Pask's original terminology:
- **Drives** = Entropy-driven motivation
- **Oscillator** = Servomotor (position-controlled)
- **Reinforcement Position** = Stable equilibrium point

See `docs/terminology.md` for canonical definitions.

### **3. Serialization**

All subsystems support `toJSON()` / `fromJSON()` for state persistence:

```typescript
// Save
const state = mobile.driveSubsystem.toJSON();

// Load
const restored = DriveSubsystem.fromJSON(state);
```

---

## Related Documentation

- `../components/README.md` - External components (sensors/actuators)
- `../types/drives.ts` - Drive configuration types
- `../../docs/terminology.md` - Canonical Pask terminology
- `../../apps/SimulationConfigurationFiles/config_240812.json` - Example configurations
