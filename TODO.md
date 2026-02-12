# Project Roadmap - Colloquy of Mobiles Virtual Simulation

**Last Updated:** February 11, 2026

This document provides a high-level view of project status and immediate priorities. For detailed implementation plans, see the linked documents below.

---

## 🎯 Current Sprint (February 2026)

### Critical Path Items
- [ ] **Phase 7.5: Pulse Communication System** (BLOCKING Complete Mobile demos)
  - [ ] Implement `PulseTransmitter` and `PulseReceiver` (TypeScript)
  - [ ] Create pattern vocabulary (`lib/communication/PaskPatterns.ts`)
  - [ ] Add message broker to `Environment.ts`
  - [ ] Migrate demo-05-transceiversV2 logic to TypeScript
  - 📋 **Details:** [docs/PULSE_COMMUNICATION_ARCHITECTURE.md](docs/PULSE_COMMUNICATION_ARCHITECTURE.md)

### Active Development
- [ ] **Demo Gallery - Tier 1 (Foundation Demos)**
  - [x] Demo 1: Transform Hierarchy (COMPLETE)
  - [ ] Demo 2: Oscillator Basics
  - [ ] Demo 3: Sensor Field of View
  - [ ] Demo 4: Actuator Field of Effect
  - [ ] Demo 5: Sensor-Actuator Interaction
  - [ ] Demo 6: External Sensor Inputs
  - 📋 **Details:** [docs/DEMO_REFACTORING_PLAN.md](docs/DEMO_REFACTORING_PLAN.md)

### Documentation Updates
- [ ] Update main README completion status (reflect Phase 7 done)
- [ ] Document Phase 7.5 architecture decisions
- [ ] Archive legacy demo documentation

---

## 📊 Development Tracks

### Track 1: Core Implementation
📋 **Authoritative Doc:** [docs/REFACTORING_PLAN.md](docs/REFACTORING_PLAN.md)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ COMPLETE | TypeScript, Jest, ESLint, Prettier |
| Phase 2 | ✅ COMPLETE | Core classes (Mobile, Transform, Environment) |
| Phase 3 | ✅ COMPLETE | Subsystems (Drive, Oscillators, Motion) |
| Phase 4 | ✅ COMPLETE | Components (Sensors, Actuators) |
| Phase 5 | ✅ COMPLETE | Library reorganization |
| Phase 6 | ✅ COMPLETE | Type cleanup and documentation |
| Phase 7 | ✅ COMPLETE | Config V2, SceneGraphLoader, schema validation |
| **Phase 7.5** | ⏳ **IN PROGRESS** | **Pulse communication (CRITICAL)** |
| Phase 8 | ❌ FUTURE | WebSocket server/client (Museum installation) |
| Phase 9 | ❌ FUTURE | Visualization refactor |
| Phase 10 | ❌ FUTURE | Legacy demo migration |

**Key Metrics:**
- ✅ 35 passing tests across 9 test suites
- ✅ 100% TypeScript coverage in `lib/`
- ✅ Config V2 schema with validation
- ✅ Scene graph with full serialization

---

### Track 2: Demo Gallery
📋 **Authoritative Doc:** [docs/DEMO_REFACTORING_PLAN.md](docs/DEMO_REFACTORING_PLAN.md)

| Tier | Demos | Status | Purpose |
|------|-------|--------|----------|
| Phase A | Foundation Infrastructure | ✅ COMPLETE | CameraController, ThreeJSRenderer |
| Tier 1 | Demos 1-6 (Core Components) | ⏳ IN PROGRESS | Transform, Oscillators, Sensors, Actuators |
| Tier 2 | Demos 7-10 (Subsystems) | ⏳ PLANNED | Drives, Pulse Comm, Horizontal/Vertical Control |
| Tier 3 | Demos 11-13 (Complete Mobiles) | ❌ BLOCKED | Requires Phase 7.5 |
| Tier 4 | Demos 14-15 (Full Colloquy) | ❌ FUTURE | Complete system |
| Tier 5 | Demos 16-18 (Tools) | ❌ FUTURE | Dev/debug tools |

**Current:**
- ✅ Demo 1: Transform Hierarchy (DEPLOYED)
- ⏳ Demo 2: Oscillator Basics (NEXT)
- ⏳ Demos 3-18: Tier 1-5 planning/implementation

---

### Track 3: Documentation & Quality

**Testing & Linting:**
- ✅ Jest configured with 35 passing tests
- ✅ ESLint + Prettier (0 errors, 29 warnings)
- [ ] Increase test coverage to >80%
- [ ] Set up CI/CD pipeline (GitHub Actions)

**Documentation:**
- ✅ [docs/REFACTORING_PLAN.md](docs/REFACTORING_PLAN.md) - Core implementation phases
- ✅ [docs/DEMO_REFACTORING_PLAN.md](docs/DEMO_REFACTORING_PLAN.md) - Demo suite plan
- ✅ [docs/PULSE_COMMUNICATION_ARCHITECTURE.md](docs/PULSE_COMMUNICATION_ARCHITECTURE.md) - Communication system
- ✅ [docs/CAMERA_CONTROLLER_SPEC.md](docs/CAMERA_CONTROLLER_SPEC.md) - Camera controls
- ✅ [docs/TYPESCRIPT_MIGRATION.md](docs/TYPESCRIPT_MIGRATION.md) - Migration guide
- ✅ [docs/TESTING_AND_LINTING.md](docs/TESTING_AND_LINTING.md) - Testing guide
- [ ] Update [readme.md](readme.md) with Phase 7 completion
- [ ] Review [docs/terminology.md](docs/terminology.md) TODO section

---

## ✅ Recently Completed (Q1 2026)

- ✅ **Phase 7:** Config V2 schema + SceneGraphLoader
- ✅ **Phase A:** CameraController with standard controls
- ✅ **Demo 1:** Transform Hierarchy demonstration
- ✅ **Testing:** 35 passing tests, full test suite
- ✅ **Deployment:** Vercel configuration for demo gallery
- ✅ **Types:** Complete type system in `lib/types/`

---

## 🔮 Backlog / Future Work

### Phase 8: Museum Installation (Q3 2026+)
- [ ] WebSocket server for distributed simulation
- [ ] Sensor station client applications
- [ ] State broadcast system
- [ ] Multi-viewer synchronization
- 📋 **Note:** Demos (Architecture 1) must be complete before starting this

### Advanced Features
- [ ] Camera touch gestures (mobile support)
- [ ] Camera state persistence (localStorage)
- [ ] VR/WebXR viewing lens
- [ ] Real-time dashboard with time-series charts
- [ ] Advanced camera paths (animations)

### Documentation
- [ ] Terminology review (verify Mobile, Drive O/P definitions)
- [ ] User manual expansion
- [ ] Troubleshooting guide
- [ ] Contributing guide (coding standards)

---

## 📖 Quick Reference

### Key Documents
- **[readme.md](readme.md)** - Project overview, architecture, philosophy
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Build and deployment guide
- **[docs/](docs/)** - All technical documentation
- **[lib/](lib/)** - Core TypeScript simulation library
- **[apps/](apps/)** - Demo applications

### Commands
```bash
# Development
npm test              # Run test suite
npm run lint          # Check code quality
npm run type-check    # TypeScript validation

# Demos
cd apps/demo-TS-01-transform-hierarchy
npm run dev           # Run demo locally

# Deployment
npm run build:demos   # Build all demos
npm run deploy        # Deploy to Vercel
```

---

## 🤝 Contributing to This Roadmap

- **Update status** as tasks complete (replace `[ ]` with `[x]`)
- **Link to detailed docs** for complex tasks
- **Keep sprint section current** (top 5-7 active items only)
- **Move completed items** to "Recently Completed" quarterly
- **Archive old completions** to maintain readability

**For detailed task tracking, see domain-specific documents:**
- Core lib work → [docs/REFACTORING_PLAN.md](docs/REFACTORING_PLAN.md)
- Demo work → [docs/DEMO_REFACTORING_PLAN.md](docs/DEMO_REFACTORING_PLAN.md)
- Deployment → [DEPLOYMENT.md](DEPLOYMENT.md)
