# Colloquy of Mobiles Virtual Simulation

This project is a virtual simulation of Gordon Pask's "Colloquy of Mobiles," modeling autonomous entities that interact and communicate through light and sound. The simulation aims to reconstruct the complex social behaviors of the original cybernetic installation.

## Directory Structure

- **apps/**: Contains distinct runnable applications and demos.
  - `demo-00-P5` to `demo-08...`: Various implementations and experiments.
  - `server.js`: Node.js server for serving the apps.
- **lib/**: Shared core library containing primitive classes (`Agent`, `Sensor`, `Drive`).
- **docs/**: Project documentation and system diagrams.
- **SimulationConfigurationFiles/**: JSON configurations for runtime settings.

## System Architecture & Behavior

The simulation follows the system model defined in the 2018 Implementation diagrams. The system consists of three primary agent types: Male Mobiles, Female Mobiles, and the central Beam (Bar).

### 1. Shared Drive System (Males & Females Only)
The Male and Female agents are "Driven Agents," governed by a unified drive system that creates internal needs.
*   **Variables**: Two internal drives, **Drive O** and **Drive P**.
*   **Continuous Increment**: Drives increment continuously over time.
*   **Thresholds**:
    *   **Satisfied**: Drives < Lower Limit. Agent is inert.
    *   **Unsatisfied**: Drive > Lower Limit. Agent triggers a search.
    *   **Dominant Logic**: Agents prioritize the higher drive (e.g., if O > P, search for O-interaction).
*   **Satisfaction (Reduction)**: Successful engagement with a partner decrements the specific drive until it falls below the threshold.
*   **Key Diagrams**:
    *   [Drive Logic & Hierarchy](docs/diagrams/Implementation2018/ARCHIVE_PlantUML_Diagrams/Hierarchical%20State%20Diagram_OP.plantuml)
    *   [Drive Manager Activity](docs/diagrams/Implementation2018/ARCHIVE_PlantUML_Diagrams/activityDiagram_driveManager_full.plantuml)

### 2. Male Mobiles
The Male mobile is an autonomous agent utilizing the Shared Drive System to seek satisfaction.
*   **Goal**: Keep Drive O and Drive P low.
*   **Subsystems**:
    *   `Drive Sub-system`: Instance of the Shared Drive System.
    *   `Horizontal Sub-system`: Rotates the body to search for partners.
*   **Behavior Loop**:
    *   **Search**: If Unsatisfied, oscillates horizontally.
    *   **Engage**: Locks onto a partner and exchanges signals to reduce drive.
*   **Key Diagrams**:
    *   [Interaction Flow](docs/diagrams/Implementation2018/SystemDiagrams_All/Male_System_Sequence_Diagram.plantuml)
    *   [Behavior Logic](docs/diagrams/Implementation2018/ARCHIVE_PlantUML_Diagrams/stateDiagram_male_behavior_240731.plantuml)

### 3. Female Mobiles
The Female mobile mirrors the Male structure but includes an additional degree of freedom.
*   **Goal**: Maintain Satisfaction; Respond to Male searches.
*   **Subsystems**:
    *   `Drive Sub-system`: Instance of the Shared Drive System.
    *   `Horizontal Control Sub-system`: Rotates the main body.
    *   `Vertical Reflector Sub-system`: Independent moving mirror for signal negotiation (Scanning/Locking).
*   **Behavior Loop**:
    *   Matches the Male's Search/Engage pattern but uses the Vertical Reflector to negotiate the connection.
*   **Key Diagrams**:
    *   [Interaction Flow](docs/diagrams/Implementation2018/SystemDiagrams_All/Female_System_Sequence_Diagram_Full.plantuml)
    *   [Behavior Logic](docs/diagrams/Implementation2018/ARCHIVE_PlantUML_Diagrams/stateDiagram_female_behavior_240731.plantuml)

### 4. The Beam (The Bar)
The Beam is a **Reactive Agent** that serves as the central arbitrator. Unlike the mobiles, it does **not** have internal entropy drives (O/P).
*   **Goal**: Arbitrate between Male I and Male II based on "Dominant Drive" received from them.
*   **Subsystems**:
    *   `Beam Motor Sub-system`: Moves the main arm.
*   **Behavior**:
    *   **Arbitration**: Compares `Drive I` vs `Drive II` inputs. The mobile with the higher drive controls the beam.
    *   **Motion**: Oscillates back and forth (Searching) or moves to a "Reinforcement Position".
*   **Key Diagrams**:
    *   [Beam Sequence & Arbitration](docs/diagrams/Implementation2018/SystemDiagrams_All/Beam_System_Sequence_Diagram.plantuml)

## Current Implementation Status
*   **Architecture Gap**: The core library (`lib/`) primarily implements basic geometric agents. The complex "Actor/Subsystem" logic described above is partially implemented in `apps/demo-05-transceiversV2` but not yet unified.
*   **Refactoring Goal**: To migrate the advanced behavior from `demo-05` into the core `lib/`, strictly following the diagrams referenced above.

## Museum Installation Architecture

This project is the **core simulation engine** for a multi-component museum installation exploring Gordon Pask's cybernetic art. The installation features a **single virtual Colloquy simulation** with multiple **viewing lenses** (3D screen, VR, analytics) and **input interfaces** (sensor stations), all connected via WebSocket on a local network.

---

## Core Architecture: Single Simulation, Multiple Lenses

```
Sensor Inputs → Virtual Colloquy Simulation (Heroku/Local) → Multiple Viewing Lenses
(Webcam/Mic)    (Processes events, updates agent states)      (3D, VR, Time Series)
```

### The Virtual Colloquy Simulation (This Repository)
**Single source of truth running on a local server or Heroku**

*   **Function**: 
    *   Receives sensor input events (light, sound)
    *   Processes events and triggers agent behaviors
    *   Updates drive states, manages agent interactions
    *   Generates all simulation data
    *   Broadcasts state updates to all connected viewing lenses
*   **Technology**: Node.js + Express + Socket.io (WebSocket hub)
*   **Deployment**: 
    *   **Primary**: Local server on museum network (laptop/mini PC running `npm start`)
    *   **Optional**: Heroku for remote demos and development
*   **Status**: ✅ Core agent behaviors implemented; ⚠️ WebSocket integration needed

---

## Installation Components

### Input Interfaces

#### 1. Interactive Sensor Stations
**Browser-based webcam/microphone interfaces for visitor engagement**

*   **Purpose**: Visitors shine light (via webcam) or make sound (via microphone) to interact with virtual agents
*   **Technology**: 
    *   Browser Web APIs: `getUserMedia()`, Canvas API (brightness analysis), Web Audio API (volume detection)
    *   WebSocket publisher to simulation server
*   **Deployment**: Static HTML/JS app (can run from local files or Vercel)
*   **Status**: ⚠️ Sensor classes exist in `lib/`; browser-based sensor app needed
*   **Interaction**: Multiple stations publish sensor events to central simulation

---

### Viewing Lenses (All Subscribe to Same Simulation Data)

#### 2. 3D Screen View
**Large screen or projection showing the live simulation**

*   **Purpose**: Primary visualization of autonomous agents exhibiting emergent behaviors
*   **Technology**: p5.js/THREE.js browser-based 3D rendering
*   **Deployment**: Static app connecting to local simulation server via WebSocket
*   **Status**: ✅ Core implementation in `apps/demo-05-transceiversV2`

#### 3. VR Experience
**Immersive headset view of the same simulation**

*   **Purpose**: Visitors experience the Colloquy in immersive 3D space
*   **Technology**: THREE.js + WebXR API or A-Frame
*   **Deployment**: Static WebXR app connecting to local simulation server
*   **Status**: ❌ Not yet implemented
*   **Hardware**: Meta Quest, HTC Vive, or any WebXR-compatible headset

#### 4. Time Series Dashboard
**Real-time analytics and metrics (like video game stats)**

*   **Purpose**: Display live simulation data: drive states, interaction counts, agent behaviors over time
*   **Technology**: Real-time charts/graphs pulling from simulation WebSocket feed
*   **Deployment**: Static dashboard app
*   **Status**: ❌ Not yet implemented
*   **Data Examples**:
    *   Drive O/P levels for each agent
    *   Interaction frequency heatmaps
    *   Satisfaction/search state timelines
    *   Visitor engagement metrics

---

### Educational Components (Separate from Core Simulation)

#### 5. Conversational Agent: Author's Writings
**Text-based chat discussing the work using the author's research**

*   **Purpose**: Educational dialogue about the installation, cybernetics, and contemporary relevance
*   **Technology**: LLM (OpenAI/Anthropic) with RAG; text interface (voice via STT/TTS later)
*   **Deployment**: Vercel (serverless API routes for LLM calls)
*   **Status**: ❌ Not yet implemented

#### 6. Conversational Agent: Pask's Writings
**Text-based chat discussing Gordon Pask's original work**

*   **Purpose**: Deep dive into Pask's cybernetic theories and Colloquy of Mobiles (1968)
*   **Technology**: LLM with RAG using Pask's writings and papers
*   **Deployment**: Vercel (may share infrastructure with #5)
*   **Status**: ❌ Not yet implemented

#### 7. Interactive Diagram Poster
**State machines and agent-based model visualizations**

*   **Purpose**: Educational reference showing technical architecture
*   **Technology**: Interactive web diagrams or static print/PDF
*   **Deployment**: Vercel (static content) or physical poster
*   **Status**: ✅ Diagrams exist in `docs/diagrams/Implementation2018/`

#### 8. Contemporary Comparison Interactive
**Multiplayer experience comparing Pask's agents to modern AI systems**

*   **Purpose**: Bridge historical cybernetics to contemporary LLM agents through gameplay
*   **Technology**: TBD (multiplayer where all players may be agents)
*   **Deployment**: TBD (separate from Colloquy simulation)
*   **Status**: ❌ Design phase

---

## Deployment Strategy

### Primary: Local Museum Deployment
**Recommended for production installation**

```
┌─────────────────────────────────────────────────────────┐
│         Museum Local Network (No Internet Required)      │
│                                                           │
│  ┌──────────────────────────────────┐                   │
│  │  Local Server (Laptop/Mini PC)   │                   │
│  │  - npm start                     │                   │
│  │  - WebSocket: ws://192.168.x.x   │                   │
│  └──────────────────────────────────┘                   │
│              │                                            │
│     ┌────────┼────────┬──────────┬──────────┐           │
│     ▼        ▼        ▼          ▼          ▼           │
│  Sensor   3D View   VR View   Dashboard  Tablets        │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
*   ✅ No internet dependency (reliability)
*   ✅ Sub-millisecond latency (performance)
*   ✅ No hosting costs
*   ✅ Privacy (data never leaves museum)
*   ✅ Simple setup: `npm start` on local machine

**Setup:**
1. Run simulation server on local device: `npm start`
2. Note local IP address (e.g., `192.168.1.100:3000`)
3. Connect all viewing lenses and sensor stations to `ws://192.168.1.100:3000`

### Optional: Heroku Remote Deployment
**For development, testing, and remote demos**

*   Allows testing from anywhere
*   Can showcase the work online
*   Same codebase, just deployed to Heroku instead of local network

---

## Hardware Requirements (Museum Installation)

### Network Infrastructure

#### Core Components (Ethernet - Mission Critical)
All performance-critical devices use wired Ethernet connections for guaranteed low latency and reliability:

*   **Server Device** (1x)
    *   Laptop or mini PC (Intel NUC, Mac Mini, etc.)
    *   Minimum: 4GB RAM, modern CPU, 10GB storage
    *   Ethernet port (or USB-to-Ethernet adapter)
    *   Runs simulation server (`npm start`)

*   **Gigabit Ethernet Switch** (1x)
    *   8-16 ports depending on installation scale
    *   Unmanaged switch sufficient
    *   Example: Netgear GS308, TP-Link TL-SG108

*   **Ethernet Cables** (Cat5e or Cat6)
    *   One cable per wired device
    *   Various lengths: 10ft, 25ft, 50ft assortment

*   **Client Devices** (multiple)
    *   Sensor stations: Laptops/tablets with webcams and microphones
    *   Display screens: Computers connected to monitors/projectors
    *   VR PCs: Gaming PCs for PC VR headsets (if using Vive, Index, etc.)
    *   Dashboard displays: Laptops or dedicated screens

#### Optional: WiFi Access Point
WiFi for **administrative access only** (not for critical components):

*   WiFi router connected to Ethernet switch
*   Used for: Remote desktop, staff monitoring, development/debugging
*   Does not affect visitor-facing performance

### Network Topology

```
┌────────────────────────────────────────────────────┐
│         Museum LAN (Ethernet Backbone)              │
│                                                      │
│  ┌──────────────┐                                  │
│  │ Server       │                                  │
│  │ 192.168.1.1  │                                  │
│  └──────┬───────┘                                  │
│         │ Ethernet                                  │
│  ┌──────▼──────────────────────┐                  │
│  │  Gigabit Switch (16-port)   │                  │
│  └─┬──┬──┬──┬──┬──┬──┬──┬──┬──┘                  │
│    │  │  │  │  │  │  │  │  │                      │
│    ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼                      │
│   S1 S2 S3 D1 D2 D3 VR DB WiFi                    │
│                              (admin only)          │
└────────────────────────────────────────────────────┘

S  = Sensor Station (Ethernet)
D  = Display Screen (Ethernet)
VR = VR PC (Ethernet)
DB = Dashboard (Ethernet)
```

### Installation Setup Steps

1. Connect server to switch via Ethernet
2. Start simulation server: `npm start`
3. Note server IP address (e.g., `192.168.1.1:3000`)
4. Connect all client devices to switch via Ethernet
5. Configure each client to connect to `ws://192.168.1.1:3000`
6. (Optional) Connect WiFi router for admin access

---

## Technical Implementation Roadmap

### Immediate (This Repository)
- [x] Core simulation with agent behaviors
- [x] Sensor/Actuator class library
- [x] State machine diagrams and documentation
- [ ] WebSocket server for real-time pub/sub
- [ ] Sensor input event processing
- [ ] Continuous simulation loop
- [ ] State broadcast to subscribers

### Future Development
- [ ] Browser-based sensor station app
- [ ] VR viewing lens (WebXR)
- [ ] Time series dashboard
- [ ] Conversational agents (separate Vercel apps)
- [ ] Contemporary comparison interactive
