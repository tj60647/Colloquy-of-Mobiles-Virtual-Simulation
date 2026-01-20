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

The simulation follows a rigorous cybernetic model defined in the 2018 Implementation diagrams. The system consists of three primary agent types: Male Mobiles, Female Mobiles, and the central Beam (Bar).

### 1. Shared Drive System (Males & Females Only)
The Male and Female agents are "Driven Agents," governed by a unified homeostatic system that creates internal needs (entropy).
*   **Variables**: Two internal drives, **Drive O** and **Drive P**.
*   **Entropy (Increase)**: Drives increment continuously over time (metabolic cost).
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
