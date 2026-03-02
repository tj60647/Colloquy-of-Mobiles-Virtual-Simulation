# UI Architecture (Canonical)

This is the canonical architecture document for demo UI implementation and migration to future client/server UIs.

## Purpose

Use demo development as both:

1. A teaching/communication tool for Colloquy concepts
2. A UI design and validation phase for future distributed deployment

This document defines patterns that work now (standalone browser demos) and later (server-authoritative simulation with client viewers).

## Current vs Future Architecture

### Stage A: Demo Mode (Current)

- Simulation loop runs in browser
- UI runs in same browser process
- Renderer reads local simulation state
- Control actions call local simulation APIs

### Stage B: Installation Mode (Future)

- Simulation loop runs on server (authoritative)
- UI/renderer runs on clients
- Renderer reads network state snapshots
- Control actions become network commands

Core principle: **the UI layer should not care whether state comes from local memory or network.**

## Architectural Principles

### 1) Simulation/UI Separation

- Simulation logic is independent of DOM and renderer code
- Renderers and panels consume state, do not mutate simulation internals directly
- UI sends intent via commands/callbacks

### 2) State Contracts First

- Define and reuse typed contracts in `lib/types/` for:
  - snapshots (`state.ts`)
  - events (`events.ts`)
  - transport messages (`websocket.ts`)
- Prefer serializable state boundaries (`toJSON()`/`fromJSON()` style)

### 3) Adapter Pattern at Boundaries

- Renderer adapters: consume snapshots and draw
- UI adapters: map user input to commands
- Data source adapters:
  - local adapter (demo mode)
  - remote/WebSocket adapter (installation mode)

### 4) Panel Widget Pattern (Vanilla TypeScript)

Reusable panels should follow an **imperative component / widget factory** pattern:

- Own a root container
- Scope DOM queries to that root (avoid global ID coupling when possible)
- Expose a small API (`setState`, `setCollapsed`, `dispose`)
- Emit typed callbacks/events to caller

### 5) Real-Time Rendering Boundary

- Keep frame loop (`requestAnimationFrame`) imperative
- Do not drive per-frame updates through heavy UI reconciliation flows
- Throttle non-critical UI telemetry updates (e.g., 10-20 Hz)

## Recommended UI Module Shape

```ts
interface PanelApi {
  update(state: unknown): void;
  dispose(): void;
}

function createSomePanel(container: HTMLElement, options: SomePanelOptions): PanelApi {
  // Create DOM
  // Bind listeners
  // Return API
}
```

## Demo-to-Client/Server Migration Strategy

Build demos as if they already talk to a server:

1. UI emits commands, not direct object mutations
2. Simulation state is consumed as snapshots
3. Renderers read snapshots only
4. Swap local adapter with remote adapter later

Result: same panel and renderer code can be reused with minimal changes.

## Framework Decision Guidance

Current default for demos: **vanilla TypeScript + shared CSS + reusable panel modules**.

Revisit framework adoption when one or more are true:

- Complex, deeply nested UI composition across many panels
- Cross-panel state orchestration becomes difficult in vanilla
- UI logic dominates codebase complexity
- Need advanced UI ecosystems (forms, routing, large tables, etc.)

If adopting a framework, keep simulation/render loop imperative and framework focused on control surfaces.

## Quick Start Checklist (New Demo Authors)

1. Copy `apps/demo-TS-template` and rename to your demo folder.
2. Import shared UI styles: `import '../../../lib/visualization/ui/styles.css';`.
3. Keep simulation loop and rendering imperative (`requestAnimationFrame`).
4. Build controls as reusable panel modules (factory/widget pattern), not ad-hoc global DOM code.
5. Ensure UI emits intent (commands/callbacks) and does not directly mutate simulation internals.
6. Render from state snapshots (`toJSON()`-style boundary), not deep object coupling.
7. Reuse shared contracts from `lib/types/` for events/state when possible.
8. Add responsive layout behavior (especially collapsible controls on narrower screens).
9. Validate basics: no console errors, controls work, resize works, pause/reset are deterministic.
10. Document demo-specific UI behavior in the demo README and link back to this architecture doc.

## Documentation Map

- `docs/UI_STANDARDS.md` -> visual standards and component styling conventions
- `lib/visualization/ui/README.md` -> concrete usage for shared UI modules
- `docs/DEMO_REFACTORING_PLAN.md` -> program-level demo strategy and roadmap
- `lib/visualization/README.md` -> renderer adapter and separation guidance
- `lib/types/README.md` -> data contracts for state/events/network
