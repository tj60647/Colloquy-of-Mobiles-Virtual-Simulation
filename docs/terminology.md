# Standardized Terminology

This document defines the canonical terminology used throughout the Colloquy of Mobiles Virtual Simulation project, based on Pask's original work and the McLeish 2018 implementation documentation.

**Status**: 🚧 Initial draft extracted from PlantUML diagrams - **requires user review and refinement**

---

## Hierarchical Structure

### Mobile
**Definition**: The top-level autonomous entity in the Colloquy system.

A Mobile is a complete, self-contained agent with internal drive systems, subsystems for sensing and actuation, and behavioral state machines that govern its interactions with other Mobiles.

**Types:**
- **Male Mobile** - Autonomous agent with horizontal oscillation subsystem and drive system
- **Female Mobile** - Autonomous agent with both horizontal and vertical (reflector) subsystems and drive system  
- **The Bar (The Beam)** - Reactive arbitrator without internal drives, responds to Male drive signals

**Key Characteristics:**
- Possesses internal entropy drives (O and P) that increment over time (except The Bar)
- Exhibits autonomous behavior through state machines
- Engages in social interactions to satisfy drives

---

### Subsystem
**Definition**: Functional component within a Mobile that performs specific tasks.

Subsystems are the operational units that implement Mobile behaviors, including motion control, sensing, actuation, and drive management.

**Examples:**

#### Drive Subsystem (Males and Females)
- Manages two entropy drives: Drive_O and Drive_P
- Drives increment continuously over time
- Drives decrement on successful partner engagement
- Determines dominant drive and overall satisfaction state

#### Horizontal Control Subsystem (Males and Females)
- Controls horizontal oscillation motion
- Implemented via servomotor oscillator
- Used for searching behavior and partner engagement

#### Vertical Reflector Subsystem (Females only)
- Controls vertical reflector motion
- Implemented via servomotor oscillator  
- Additional degree of freedom for Female engagement negotiation

#### Bar Motor Subsystem (The Bar)
- Controls bar horizontal motion
- Arbitrates between Male I and Male II based on dominant drive signals
- Moves to reinforcement position or oscillates in search mode

---

### Component
**Definition**: Low-level functional unit within Subsystems.

**Examples:**
- **Servomotor Oscillator** - Actuator component that produces oscillating motion
- **Sensors** - Light sensors, sound sensors (to be implemented for virtual simulation)
- **Actuators** - Light actuators, sound actuators (transceivers)

---

## Behavioral Terminology

### Drive
**Definition**: Internal state variable representing a Mobile's need or motivation.

Drives are the fundamental mechanism that creates autonomous behavior. They increment continuously (entropy) and decrement through successful social interaction (satisfaction).

**Types:**
- **Drive O (Orange)** - One of two entropy drives, named after Pask's original color-based terminology
- **Drive P (Puce)** - One of two entropy drives, named after Pask's original color-based terminology

> **Note**: "Orange" and "Puce" are abstract variable names from Pask's original work. The colors are symbolic labels, not literal color representations (Pask's "Puce" was actually a green color in the physical installation).

**Mechanics:**
- **Increment**: Drives increase continuously over time while Mobile is alive
- **Decrement**: Drives decrease on successful exchange with partner
- **Threshold**: Boundary value that determines satisfied vs. unsatisfied state
- **Dominant Drive**: The higher of Drive_O or Drive_P determines search priority

**States:**
- **Satisfied**: Drive value below threshold
- **Unsatisfied**: Drive value above threshold

---

### Interaction States
**Definition**: High-level behavioral states that govern Mobile actions.

Based on PlantUML diagram analysis:

#### Satisfied and Inert
- Both Drive_O and Drive_P are below threshold
- Mobile is inactive, not searching for partners
- Drives continue to increment in background

#### Satisfaction Search  
- At least one drive (O or P) is above threshold (Unsatisfied)
- Mobile actively searches for partner via horizontal oscillation
- Dominant drive determines type of interaction sought

#### Engaging Partner
- Partner has been found and locked
- Mobile exchanges signals with partner
- Successful exchange decrements the relevant drive
- Continues until drive falls below threshold or partner is lost

---

## Hierarchical State Structure

From `Hierarchical State Diagram_OP.plantuml`:

```
Alive
├── Satisfied (both drives below threshold)
└── Unsatisfied (at least one drive above threshold)
    ├── Searching (oscillating, seeking partner)
    └── Engaging (locked with partner, exchanging signals)
        ├── Successful Exchange → Drive decrements
        └── Unsuccessful Exchange → Return to Searching
```

---

## Implementation Mapping

### Code → Terminology

| Current Code Class/Module | Canonical Term (from diagrams) | Alignment Status |
|---------------------------|--------------------------------|------------------|
| `Agent.js` | Mobile | ❌ Needs renaming |
| `DriveManager.js` | Drive Subsystem | ⚠️ Verify terminology |
| `Oscillator.js` | Horizontal Control Subsystem | ⚠️ Verify terminology |
| `Sensor.js` | Sensor Component | ✅ Aligned |
| `Actuator.js` | Actuator Component | ✅ Aligned |

---

## TODO - User Review Required

- [ ] **Verify Mobile terminology**: Is "Mobile" the correct top-level term from Pask's original work?
- [ ] **Clarify Drive_O and Drive_P**: What do O and P stand for? (Orientation/Position? Other?)
- [ ] **Confirm Subsystem naming**: Are "Horizontal Control Subsystem" and "Vertical Reflector Subsystem" the canonical names?
- [ ] **Review state names**: Confirm "Satisfied and Inert", "Satisfaction Search", "Engaging Partner" match McLeish PDF
- [ ] **Add missing terms**: Any important terminology not captured from diagrams?
- [ ] **Refine definitions**: Improve precision based on PDF documentation

---

## References

- `docs/reference/pask/` - Pask's original writings
- `docs/reference/mcleish/` - McLeish 2018 implementation documentation
- `docs/reference/mcleish/system-design/` - PlantUML diagrams (source for this initial draft)
