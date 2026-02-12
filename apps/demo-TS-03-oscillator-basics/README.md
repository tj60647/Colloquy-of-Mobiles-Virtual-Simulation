# Demo 3: Oscillator Basics

## Purpose

Demonstrates oscillator-driven transform animation with motion profiles, showing how Mobiles achieve controlled, repeating motion patterns.

## What You'll See

- Multiple Mobiles oscillating with different motion profiles (sine, triangle, trapezoidal)
- Real-time position, velocity, and acceleration graphs
- RELEASED vs STOPPED state visualization
- Parent-child hierarchies with compound oscillation
- Motion profile parameters displayed for each oscillator

The demo illustrates:
- Smooth periodic motion using different wave shapes
- Trapezoidal motion profiles with acceleration/deceleration phases
- How oscillators drive transform rotations
- Motion state transitions (RELEASED, STOPPED, return to reinforcement)

## Core Concepts Demonstrated

- `Oscillator.ts` - Periodic motion generation with wave functions
- `MotionProfile.ts` - Velocity/acceleration control for smooth motion
- `HorizontalControlSubsystem.ts` - Oscillator-driven yaw rotation
- Integration of oscillators with transform hierarchy from Demo 1

## Controls

### Camera Controls (Standard)
- **Left Mouse Drag:** Rotate camera around scene (orbit)
- **Right Mouse Drag:** Pan camera  
- **Mouse Wheel:** Zoom in/out
- **R Key:** Reset camera to default view
- **T Key:** Toggle perspective/orthographic projection
- **1-4 Keys:** Preset views (Top, Front, Side, Isometric)
- **H Key:** Show camera help

### Simulation Controls
- **Space:** Pause/Resume simulation
- **S Key:** Toggle RELEASED/STOPPED states for all oscillators
- **Arrow Keys:** Adjust oscillator parameters

## Configuration

**Config File:** `public/config.json`

Defines 3-4 Mobiles with varied oscillator configurations.

## Technical Details

### Simulation Classes Used
- `lib/subsystems/Oscillator.ts` - Core oscillator with wave functions
- `lib/subsystems/MotionProfile.ts` - Velocity profiles (trapezoidal)
- `lib/subsystems/HorizontalControlSubsystem.ts` - Yaw rotation control
- `lib/Transform.ts` - Transform hierarchy from Demo 1
- `lib/Mobile.ts` - Container for subsystems

### Visualization
- Renderer: `ThreeJSRenderer` (extended for oscillator visualization)
- Update Rate: 60 FPS
- Camera: Perspective with standard CameraController
- Graphs: Canvas 2D for real-time position/velocity/acceleration plots

### Motion Profiles
- **Sine:** position = amplitude * sin(frequency * time)
- **Triangle:** Linear interpolation with direction reversal
- **Trapezoidal:** Acceleration → Constant Velocity → Deceleration phases

## Dependencies

**Required Demos:** Demo 1 (Transform Hierarchy)
**Blocks Demos:** Demo 9 (Horizontal Control - advanced features)

## Relationship to Museum Installation

This demo validates:
- Oscillator system used by all Mobiles (primary motion mechanism)
- Motion profiles for smooth, controlled movement
- State transitions for behavioral responses
- Subsystem integration with Mobiles

In the full Colloquy, every Mobile uses oscillators for yaw and roll rotation. The Beam Bar uses oscillators for scanning motion. This is the fundamental motion system.

## Development Notes

### To Run:
```bash
cd apps/demo-TS-02-oscillator-basics
npm install
npm run dev
```

Open http://localhost:3002 (or configured port)

### Key Implementation:
- Creates Mobiles with `HorizontalControlSubsystem`
- Updates subsystems each frame to drive oscillation
- Renders graphs using Canvas 2D API
- Visualizes motion state with color coding (green = RELEASED, red = STOPPED)

### Educational Value:
Natural progression from static transforms (Demo 1) to animated transforms. Foundation for understanding how Mobiles move and return to reinforcement positions (home state).
