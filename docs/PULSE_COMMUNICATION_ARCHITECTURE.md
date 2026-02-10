# Pulse Communication System - Missing Architecture Component

## Current State Analysis

### ✅ What EXISTS in TypeScript Core (Phases 1-7)

1. **Spatial Detection:**
   - `ActuatorBase` / `SensorBase` with field of view
   - `isInFieldOfView()` - cone-based detection
   - Inverse-square intensity calculations

2. **Simple Emission:**
   - `LightActuator.emitLight()` - returns intensity value
   - `SoundActuator` - basic sound emission
   - Static properties (no time-series data)

3. **Basic Sensing:**
   - `LightSensor.sense(callback)` - queries environment
   - `SoundSensor` - similar pattern
   - Instantaneous sensing only

### ❌ What's MISSING (Critical for Social Behavior)

1. **Pulse Transmission System:**
   - No temporal patterns (sequences of 0s and 1s)
   - No message passing between Mobiles
   - No buffer system for pulse trains

2. **Pattern-Based Communication:**
   - No encoding of drive states as pulse patterns
   - No pattern matching for decoding received signals
   - No communication vocabulary (I_O, I_P, II_O, II_P, rejection, etc.)

3. **Message Brokering:**
   - `Environment` doesn't forward messages
   - No actor model implementation
   - No event propagation system

## The transceiversV2 Demo Implementation

### What It Demonstrates (✅ STILL VALID AND IMPORTANT)

```javascript
// 1. MESSAGE CLASS - Encapsulates spatial pulse data
class Message {
  constructor(type, content, sourceId, sourcePosition, 
              sourceVector, strength, timestamp, fieldOfView, frequency)
}

// 2. PULSE TRANSMITTER - Sends binary patterns
class PulseTransmitter {
  sendPulse(environment, sourceId, strength) {
    const content = this.pattern[this.patternIndex]; // 0 or 1
    const message = new Message(/* ... */);
    this.send(message, environment); // Actor model
    this.patternIndex = (this.patternIndex + 1) % this.pattern.length;
  }
}

// 3. PULSE RECEIVER - Pattern matching
class PulseReceiver {
  receive(message, sender) {
    // Add to circular buffer
    this.buffer[this.bufferIndex] += message.content;
    this.processPulse(); // Check for pattern matches
  }
  
  matchesPattern(pattern) {
    // Compare buffer contents to known patterns
    for (let i = 0; i < pattern.length; i++) {
      if (this.buffer[index] !== pattern[i]) return false;
    }
    return true;
  }
}

// 4. PATTERNS - Communication vocabulary
const patterns = {
  I_O:  [1,1,1,1,1,1,1,1,0,0,0,0,...], // "I need O satisfaction"
  I_P:  [1,1,1,1,1,1,1,1,0,0,0,0,...], // "I need P satisfaction"
  II_O: [1,1,1,1,1,1,1,1,0,0,0,0,...], // "Female O search"
  II_R: [1,1,1,1,1,1,1,1,0,0,0,0,...], // "Rejection"
  E:    [1,1,1,1,1,1,1,1,1,1,1,1,...], // "Engaged"
  // etc...
};

// 5. ENVIRONMENT AS MESSAGE BROKER
class Environment {
  receive(message, sender) {
    // Broadcast to all agents
    this.agents.forEach(agent => {
      agent.lightReceiver.receive(message, null);
      agent.soundReceiver.receive(message, null);
    });
  }
}
```

### Why This Matters

**For Phase 7.5 (Infrastructure):**
- Provides the **mechanics** of pulse transmission and reception
- Demonstrates circular buffer implementation
- Shows how patterns flow through the system
- Visualizes communication in real-time

**For Future Tiers (Social Logic):**
- Males encode drive states as pulse patterns
- Females decode Male patterns to decide engagement
- The Bar decodes both Males to arbitrate
- This enables **social negotiation** behavior

**Phase 7.5 scope:** Infrastructure (sense/act). **Tier 3/4 scope:** Full logic (pattern recognition → decision → behavior).

## Architecture Gap

```
┌─────────────────────────────────────────────┐
│   Current TypeScript (Phases 1-7)          │
├─────────────────────────────────────────────┤
│ ✅ Spatial positioning (Transform)          │
│ ✅ Drive accumulation (DriveSubsystem)      │
│ ✅ Motion control (Oscillators)             │
│ ✅ FOV detection (Sensor/ActuatorBase)      │
│                                             │
│ ❌ Pulse transmission - MISSING             │
│ ❌ Pattern encoding/decoding - MISSING      │
│ ❌ Message passing - MISSING                │
│ ❌ Communication vocabulary - MISSING       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│   demo-05-transceiversV2 (Legacy)          │
├─────────────────────────────────────────────┤
│ ✅ Actor model (message passing)            │
│ ✅ PulseTransmitter/Receiver                │
│ ✅ Pattern matching                         │
│ ✅ Communication patterns                   │
│ ✅ Environment as broker                    │
│                                             │
│ ❌ Uses old JavaScript Agent class          │
│ ❌ Not integrated with DriveSubsystem       │
│ ❌ Manual pattern definitions               │
└─────────────────────────────────────────────┘
```

## Sense-Logic-Act Loop Architecture

### Correct Mobile Control Flow

```
┌─────────────────────────────────┐
│   MOBILE CONTROL LOOP           │
├─────────────────────────────────┤
│                                 │
│  1. SENSE Phase                 │
│     └─ Receivers populate       │
│        circular buffer from     │
│        incoming pulses          │
│        [PHASE 7.5 SCOPE]        │
│                                 │
│  2. LOGIC Phase                 │
│     ├─ Pattern recognition      │
│     │  on receive buffer        │
│     ├─ Drive state evaluation   │
│     │  (O/P accumulation)       │
│     ├─ Select pattern for       │
│     │  transmission based on    │
│     │  drives + received        │
│     │  patterns                 │
│     └─ Populate transmit        │
│        circular buffer with     │
│        selected pattern         │
│        [TIER 3/4 DEMOS]         │
│                                 │
│  3. ACT Phase                   │
│     └─ Send pulses from         │
│        transmit buffer          │
│        [PHASE 7.5 SCOPE]        │
│                                 │
└─────────────────────────────────┘
```

### Phase 7.5 Scope: Infrastructure Only

**What Phase 7.5 WILL implement:**
- ✅ Circular buffers (receive and transmit)
- ✅ Pulse transmission mechanics (ACT phase)
- ✅ Pulse reception mechanics (SENSE phase)
- ✅ Pattern vocabulary constants (PaskPatterns)
- ✅ Message passing infrastructure (Environment as broker)
- ✅ Visualization of buffers and patterns
- ✅ Basic pattern matching framework (`matchesPattern()` method)

**What Phase 7.5 will NOT implement (comes in Tier 3/4):**
- ❌ Pattern recognition logic (interpreting what patterns mean)
- ❌ Decision-making based on received patterns
- ❌ Drive state → pattern selection logic
- ❌ Social behavior rules (when to engage, reject, etc.)
- ❌ Full LOGIC phase implementation

**Rationale:** The demos focus on **visualization, geometry, and sense/act mechanics** - not cognitive decision-making. Phase 7.5 provides the infrastructure (buffers, transmission, reception, patterns) that later demos will use to implement higher-order social logic.

## What Needs to Happen

### Phase 7.5: Communication System (NEW - Urgent)

Must be implemented BEFORE Phase D (Complete Mobiles)

#### Component 1: Message & Event System

**File:** `lib/types/messages.ts`

```typescript
export interface PulseMessage {
  type: 'light' | 'sound';
  content: 0 | 1; // Binary pulse
  sourceId: string;
  sourcePosition: Vector3;
  sourceDirection: Vector3;
  strength: number;
  timestamp: number;
  fieldOfView: number;
  frequency?: number; // For sound only
}

export type MessageHandler = (message: PulseMessage) => void;
```

#### Component 2: Pulse Transmitter

**File:** `lib/components/PulseTransmitter.ts`

```typescript
export class PulseTransmitter {
  private pattern: (0 | 1)[];
  private patternIndex: number = 0;
  private actuator: ActuatorBase;
  private type: 'light' | 'sound';
  
  constructor(actuator: ActuatorBase, type: 'light' | 'sound') {
    this.actuator = actuator;
    this.type = type;
  }
  
  setPattern(pattern: (0 | 1)[]): void {
    this.pattern = pattern;
    this.patternIndex = 0;
  }
  
  transmit(environment: Environment): PulseMessage {
    const content = this.pattern[this.patternIndex];
    this.patternIndex = (this.patternIndex + 1) % this.pattern.length;
    
    return {
      type: this.type,
      content,
      sourceId: this.actuator.id,
      sourcePosition: this.actuator.getGlobalPosition(),
      sourceDirection: this.actuator.getGlobalForwardVector(),
      strength: 1.0, // Can vary based on drive state
      timestamp: Date.now(),
      fieldOfView: this.actuator.fieldOfView
    };
  }
}
```

#### Component 3: Pulse Receiver

**File:** `lib/components/PulseReceiver.ts`

```typescript
export class PulseReceiver {
  private buffer: number[];
  private bufferIndex: number = 0;
  private sensor: SensorBase;
  private patterns: Map<string, (0 | 1)[]>;
  
  constructor(sensor: SensorBase, bufferSize: number = 40) {
    this.sensor = sensor;
    this.buffer = new Array(bufferSize).fill(0);
    this.patterns = new Map();
  }
  
  registerPattern(name: string, pattern: (0 | 1)[]): void {
    this.patterns.set(name, pattern);
  }
  
  receive(message: PulseMessage): void {
    // Only receive if in sensor's FOV
    if (!this.sensor.isInFieldOfView(message.sourcePosition)) {
      return;
    }
    
    // Add to circular buffer
    this.buffer[this.bufferIndex] += message.content;
  }
  
  nextCycle(): void {
    this.bufferIndex = (this.bufferIndex + 1) % this.buffer.length;
    this.buffer[this.bufferIndex] = 0;
  }
  
  matchPattern(patternName: string): boolean {
    const pattern = this.patterns.get(patternName);
    if (!pattern) return false;
    
    for (let i = 0; i < pattern.length; i++) {
      const bufferIdx = (this.bufferIndex + i) % this.buffer.length;
      if (this.buffer[bufferIdx] !== pattern[i]) {
        return false;
      }
    }
    return true;
  }
  
  getMatchedPatterns(): string[] {
    const matched: string[] = [];
    for (const [name, _] of this.patterns) {
      if (this.matchPattern(name)) {
        matched.push(name);
      }
    }
    return matched;
  }
}
```

**Note:** `matchPattern()` and `getMatchedPatterns()` provide the **infrastructure** for pattern recognition. What to DO with matched patterns (behavioral responses, drive satisfaction, engagement decisions) is implemented in Tier 3/4 demos, not Phase 7.5.

#### Component 4: Communication Patterns

**File:** `lib/communication/PaskPatterns.ts`

```typescript
/**
 * Pulse patterns from Pask's original Colloquy design.
 * Each pattern encodes a specific behavioral state or request.
 */

export type PulsePattern = (0 | 1)[];

export const PaskPatterns = {
  // Male I patterns
  MALE_I_O_SEARCH: [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
  MALE_I_P_SEARCH: [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
  MALE_I_OP_SEARCH: [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1],
  
  // Female II patterns
  FEMALE_II_O_SEARCH: [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
  FEMALE_II_P_SEARCH: [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
  FEMALE_II_OP_SEARCH: [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0],
  
  // Response patterns
  MALE_I_REINFORCEMENT: [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
  FEMALE_II_REINFORCEMENT: [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
  
  // Special states
  ENGAGED: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  REJECTION: [1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0],
} as const;

/**
 * Maps drive states to pulse patterns
 */
export function getDrivePattern(mobileType: 'Male' | 'Female', dominantDrive: 'O' | 'P' | 'OP'): PulsePattern {
  if (mobileType === 'Male') {
    switch (dominantDrive) {
      case 'O': return PaskPatterns.MALE_I_O_SEARCH;
      case 'P': return PaskPatterns.MALE_I_P_SEARCH;
      case 'OP': return PaskPatterns.MALE_I_OP_SEARCH;
    }
  } else {
    switch (dominantDrive) {
      case 'O': return PaskPatterns.FEMALE_II_O_SEARCH;
      case 'P': return PaskPatterns.FEMALE_II_P_SEARCH;
      case 'OP': return PaskPatterns.FEMALE_II_OP_SEARCH;
    }
  }
}
```

#### Component 5: Environment Message Broker

**Update:** `lib/Environment.ts`

```typescript
export class Environment {
  private _mobiles: Mobile[] = [];
  private _messageQueue: PulseMessage[] = [];
  
  // ... existing code ...
  
  /**
   * Broadcast a pulse message to all Mobiles
   */
  broadcastMessage(message: PulseMessage): void {
    this._messageQueue.push(message);
  }
  
  /**
   * Process message queue and deliver to receivers
   */
  private processMessages(): void {
    for (const message of this._messageQueue) {
      for (const mobile of this._mobiles) {
        // Deliver to all receivers on this mobile
        mobile.receiveMessage(message);
      }
    }
    this._messageQueue = [];
  }
  
  update(): void {
    // Update all mobiles (drives, oscillators)
    this._mobiles.forEach(mobile => mobile.update());
    
    // Mobiles transmit pulses during update
    // (PulseTransmitters add messages to environment queue)
    
    // Process and deliver messages
    this.processMessages();
    
    // Advance receiver buffers for next cycle
    this._mobiles.forEach(mobile => mobile.nextCycle());
  }
}
```

#### Component 6: Mobile Integration

**Update:** `lib/Mobile.ts`

```typescript
export class Mobile extends Transform {
  // ... existing properties ...
  
  private lightTransmitter?: PulseTransmitter;
  private soundTransmitter?: PulseTransmitter;
  private lightReceiver?: PulseReceiver;
  private soundReceiver?: PulseReceiver;
  
  // ... existing code ...
  
  /**
   * Set up communication based on drive state
   */
  private updateCommunication(): void {
    if (!this.drives || !this.lightTransmitter) return;
    
    const state = this.drives.getState();
    const dominantDrive = this.drives.getDominantDrive();
    
    // Select pattern based on state
    const pattern = getDrivePattern(this.mobileType, dominantDrive);
    this.lightTransmitter.setPattern(pattern);
  }
  
  /**
   * Transmit pulse this cycle
   */
  private transmit(environment: Environment): void {
    if (this.lightTransmitter) {
      const message = this.lightTransmitter.transmit(environment);
      environment.broadcastMessage(message);
    }
  }
  
  /**
   * Receive messages from environment
   */
  receiveMessage(message: PulseMessage): void {
    if (message.type === 'light' && this.lightReceiver) {
      this.lightReceiver.receive(message);
    } else if (message.type === 'sound' && this.soundReceiver) {
      this.soundReceiver.receive(message);
    }
  }
  
  /**
   * Check for pattern matches and react
   */
  private processReceivedPatterns(): void {
    if (!this.lightReceiver) return;
    
    const matches = this.lightReceiver.getMatchedPatterns();
    
    for (const patternName of matches) {
      // React based on pattern (e.g., satisfy drives, engage, etc.)
      this.handlePatternMatch(patternName);
    }
  }
  
  update(): void {
    // ... existing update logic ...
    
    // NEW: Communication logic
    this.updateCommunication();
    this.processReceivedPatterns();
  }
}
```

## Updated Demo Plan

### OLD Demo 5: Drive System
- Still valid, shows entropy accumulation

### NEW Demo 5.5: Pulse Communication ✨
**Path:** `apps/demo-TS-05.5-pulse-communication/`

**Purpose:** Demonstrate pulse transmission/reception infrastructure and pattern visualization

**Features:**
- 2-3 Mobiles with transmitters and receivers
- Visual pulse buffer display (circular buffers)
- Pattern transmission visualization
- Pattern matching detection (shows when patterns match)
- Real-time buffer updates synchronized to frame rate

**What it demonstrates (PHASE 7.5):**
- Pulse mechanics (sense and act)
- Circular buffer operation
- Pattern vocabulary (constants)
- Message brokering through Environment
- Visualization of communication flow

**What it does NOT demonstrate (TIER 3/4):**
- Drive-based pattern selection logic
- Behavioral responses to matched patterns
- Social negotiation rules
- Engagement/rejection decisions

**Classes:** `PulseTransmitter`, `PulseReceiver`, `PaskPatterns`, updated `Environment`

**Replaces/Modernizes:** demo-05-transceiversV2 (sense/act infrastructure)

## Action Items

1. **Preserve transceiversV2:** Move to `apps/archive-valuable/demo-05-transceiversV2/`
   - Don't delete - it's the reference implementation
   - Document what it teaches

2. **Implement Phase 7.5:** Communication system before Tier 3 demos
   - Add to dependency graph
   - Create new components listed above

3. **Update Demo Dependencies:**
   - Demo 8 (Male Mobile) needs Demo 5.5
   - Demo 9 (Female Mobile) needs Demo 5.5
   - Demo 11-12 (Colloquy) need Demo 5.5

4. **Create Migration Guide:** From transceiversV2 patterns to TypeScript

## Bottom Line

**Is transceiversV2 still valid?** 

**YES! It's CRITICAL.**

It demonstrates the **communication infrastructure** that makes social behavior possible. Without pulse patterns and buffers, there's no communication channel - just agents moving independently.

**Phase 7.5 extracts the infrastructure:**
- Circular buffers (receive/transmit)
- Pattern transmission/reception mechanics
- Message passing through Environment
- Pattern vocabulary constants
- Visualization of communication flow

**Tier 3/4 adds the intelligence:**
- Drive state → pattern selection
- Pattern recognition → behavioral response
- Social rules (engagement, rejection, reinforcement)

This infrastructure needs to be migrated to TypeScript as Phase 7.5 BEFORE we can build complete Mobiles (Demos 8-12).
