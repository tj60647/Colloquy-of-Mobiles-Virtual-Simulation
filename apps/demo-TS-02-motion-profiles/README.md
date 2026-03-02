# Demo 2: Motion Profiles

## Purpose

Demo 2 visualizes the trapezoidal profile generator used in `lib/subsystems/MotionProfile.ts` and shows how position, velocity, acceleration, and jerk evolve over time.

## Current Features

- Real-time graphs for:
  - Position ($\theta$)
  - Velocity ($d\theta/dt$)
  - Acceleration ($d^2\theta/dt^2$)
  - Jerk ($d^3\theta/dt^3$)
- Circular rotation view with vector overlays (velocity, acceleration, jerk)
- Phase and profile-stat overlays
- Yo-yo mode (forward + reverse return profile)
- Collapsible controls and visualization sections

## Controls

- `Total Distance`: 45° to 360° (step 15°)
- `Max Velocity`: 5°/s to 60°/s (step 5°/s)
- `Max Acceleration`: 5°/s² to 60°/s² (step 5°/s²)
- `Yo-Yo Mode`: enabled/disabled
- `Play/Pause` and `Reset`
- `Show JSON`: opens a JSON panel for the current motion profile snapshot

Sampling is fixed at 40 Hz (`timestep = 1/40`).

## View JSON

Demo 2 includes a `Show JSON` button like Demo 1.

- `Show JSON` opens a closable panel with schema-valid simulation configuration JSON.
- Output is shaped to the v2 schema used in this repo.
- Displayed JSON includes core config sections:
  - `$schema` and `version`
  - `metadata` and `simulation`
  - `coordinateSystems`
  - `mobiles`

## Architecture (Current)

Demo 2 now uses a contract-first boundary between UI/rendering and profile simulation state:

- `src/motionProfileContracts.ts`
  - `MotionProfileParams`
  - `MotionProfileSnapshot`
  - `MotionProfileListener`
- `src/LocalMotionProfileAdapter.ts`
  - Owns local simulation params/state
  - Regenerates profile on control changes
  - Emits immutable snapshots to the app
- `src/main.ts`
  - Renders from adapter snapshots
  - Wires panel callbacks to adapter commands
  - Avoids direct ownership of profile math state

This keeps Demo 2 ready for a future remote/server-backed adapter with minimal UI changes.

## Development

From `apps/demo-TS-02-motion-profiles`:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Verification Status

- ✅ Local build succeeds after adapter migration
- ✅ Local build succeeds after cleanup of accidental nested template directory

## Related Docs

- [UI Architecture](../../docs/UI_ARCHITECTURE.md)
- [UI Standards](../../docs/UI_STANDARDS.md)
- [Pulse Communication Architecture](../../docs/PULSE_COMMUNICATION_ARCHITECTURE.md)

