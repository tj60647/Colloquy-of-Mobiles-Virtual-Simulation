# Transform Hierarchy

**Category:** Core Component

**Complexity:** Basic

**Dependencies:** None (Phase A only)

---

## Quick Summary

Demonstrates the scene graph system with parent/child transforms. Watch how local rotations compose through a four-level hierarchy to create complex motion from simple rules. This is the foundation for all Mobile positioning in the Colloquy simulation.

## Key Features

- ✨ Four-level transform hierarchy with visual axes
- ✨ Real-time composition of local-to-global coordinates
- ✨ Interactive camera controls and animation
- ✨ Config V2-driven scene setup

## Classes Demonstrated

`Transform`, `SceneGraphLoader`

## Run Demo

```bash
cd apps/demo-TS-01-transform-hierarchy
npm install
npm run dev
```

Open: http://localhost:5173

---

**Screenshot:**

![Transform hierarchy showing four nested coordinate systems with rotating axes](screenshot.png)

---

## What You'll Learn

This demo teaches:
- How scene graphs work (parent-child relationships)
- Local vs global coordinate systems
- How rotations compose through hierarchies
- The foundation for Mobile positioning

## Used By Museum Installation

- **Server:** Uses Transform for all Mobile positions
- **Clients:** Render Transform hierarchy received via WebSocket
- **All Views:** 3D screen, VR, and analytics all use same Transform data
