<!-- status: POINT_IN_TIME_AUDIT | updated: 2026-07-18 -->

# System-Diagram Assessment & Completion Plan — 2026-07-18

Assessment of the PlantUML reference library under
`docs/reference/mcleish/system-design/` against the **live** implementation in the
sibling `Colloquy-of-Mobiles-Virtual-Simulation-SceneGraph` repo (the distributed
ABM: `src/simulation/behavior/*`, `frame-variable-keys.ts`, the server/client split,
sensor ingress, reflection-as-geometry, recording/playback).

**Headline:** the filled diagrams are the *behavioural ground truth the app was built
to* — the behaviour engine implements them faithfully and cites them by filename in
its source headers. But the set is **incomplete** (18 of 29 matrix cells are empty
stubs), has a **duplicate**, and covers **only single-mobile behaviour** — nothing of
the distributed / holon / phygital layers that are now core to the app.

> **Done 2026-07-18 (P1–P4):** (P1) annotated the resolved deltas (partner-memory,
> signal media, beam-bit, windowed tally) as legends on the Male/Female sequences and
> **de-duplicated** `servomotorComponentDiagram.plantuml` (rewritten as the current
> oscillator → servo actuation path). (P2) filled the three engagement/drive **state
> diagrams** from the live state machines. (P3) filled **every remaining stub** —
> Male/Female/Beam activity, Beam + Beam-Motor state/activity, all of Female Horizontal
> Control, Female Vertical Reflector activity/sequence, Drive sequence — so the
> subsystem matrix is **complete (30/30 cells)**. (P4, started) authored new
> system-context diagrams: `OverallSimulation`, `Distributed_Wire_Sequence_Diagram`,
> `Holon_Agent_Tree_Component_Diagram`, `Sensor_Ingress_Sequence_Diagram`. Each is
> grounded in specific engine source (cited in its header). Remaining: the rest of P4
> (signal decode, reflection-geometry, recording, deployment, frame-var data model) and
> **P5** (populate `implementation-map/`). Diagrams are structurally valid but **not yet
> rendered** — a PlantUML render pass is the outstanding check.

---

## 1. Inventory — the intended matrix

Legend: **FILLED** · **STUB** (22-byte `@startuml/@enduml`) · **NEW** (filled this pass) · **—** (no file).

| Subsystem | Activity | Sequence | State |
|---|---|---|---|
| Overall Simulation | — | — | **EMPTY (0 B)** |
| Drive System | **FILLED** (+ `-simple`) | STUB | **NEW** |
| Male System | STUB | **FILLED** | **NEW** |
| Male Horizontal Sub-System | STUB | **FILLED** | STUB |
| Female System | STUB | **FILLED** (+ `_Full`) | **NEW** |
| Female Horizontal Control | STUB | STUB | STUB |
| Female Vertical Reflector | STUB | STUB | **FILLED** (the style template) |
| Beam System | STUB | **FILLED** | STUB |
| Beam Motor Sub-System | STUB | **FILLED** | STUB |
| Component / Servo | — | — | `componentDiagram` **FILLED** + `servomotorComponentDiagram` **repurposed** |

Also present: `implementation-map/` (**empty** — the intended design↔physical bridge, never populated), `drive_states.svg`, `SVG/test.svg`, and `ARCHIVE_PlantUML_Diagrams/` (21 drafts; salvage seeds noted in §5).

## 2. Currentness of the filled diagrams

All behaviourally faithful; drift is vocabulary + a few resolved deltas:

- **Drive activity** — exact match to `drive-decay.ts` / `drive-agent.ts` (dual-drive if-tree, codes 1–4). The `ERROR` leaf is unreachable (tie routes to "either O or P"). `-simple` is a superseded single-drive lede.
- **Male / Female sequences** — faithful to `state-machine-male.ts` / `state-machine-female.ts`. Resolved deltas now annotated in-file: (i) **signal media** — Intermittent = light, Identifying/Reinforcement = sound; (ii) **windowed reinforcement tally** (80-sample window) not a single "Decrement Drive"; (iii) **partner memory NOT implemented** (`PARTNER_MEMORY_IMPLEMENTED = false`); (iv) the **3-mode Beam request → one bit** (`beamStopRequest`).
- **Beam sequence** — exact match to `beam-arbitrator.ts` (raw Drive I/II compare, tie → Male I, per-tick reinforcement positions).
- **Beam-Motor / Male-Horizontal / Female-Vertical-Reflector** — map to `oscillator-step.ts` (hold/release); Beam-Motor is a single-male precursor to the two-male arbitration (keep as motor primitive or retire).
- **componentDiagram** — physical armature hierarchy; structurally consistent but a build snapshot, not the runtime **holon/agent** tree.

## 3. Coverage gaps — NEW diagrams the current app needs (none exist yet)

All derivable from current code + `CURRENT_REFERENCE` docs:

1. **Overall system context** (fill the 0-byte `OverallSimulation`).
2. **Distributed server/client split + WebSocket frame wire** (keyframe/delta) — `DISTRIBUTED_SIMULATION_DESIGN.md`, `client.ts`, `frame-delta.ts`.
3. **Holon-generative runtime / agent tree** (the true successor to the component diagram) — `agent-registry.ts`, the drive/oscillator/transmitter/receiver agents.
4. **Sensor ingress (phygital)** — webcam/torch → `sensor_input` → receiver — `external-sense-ingress.ts`, `SENSOR_INGRESS.md`.
5. **Signal encode/decode** — 40-segment word, rolling-background/delta-threshold/40-sample correlation — `pattern-matcher.ts`, `communication-dictionary.ts`.
6. **Reflection-as-scene-geometry** — Energetic Beam → mirror rays → attenuation → light — `frame-reflection-rays.ts`, `mirror-attenuation.ts`.
7. **Recording / playback** — `recording.ts`, `SIMULATION_RECORDING_PLAYBACK_PLAN.md`.
8. **Frame-variable data model** (`sense_/act_/internal_` taxonomy) — `frame-variable-keys.ts`; lets every diagram cite canonical keys.
9. **Deployment topology** — Vercel clients + Fly server + hardware — `FLY_SIMULATION_DEPLOYMENT.md`.

Within the existing matrix, the remaining state/activity stubs (Male Horizontal, Beam, Beam Motor, all of Female Horizontal Control, Female Vertical Reflector Activity/Sequence) are directly derivable from the filled sequences + code.

## 4. Source material (for a documentation app)

Worth surfacing; stratifies as concept → scholarship → as-built:
- **`pask/`** (4 PDFs) — primary Pask Archive writings; the conceptual "why" (O/P drives, satisfaction, "conversation"). Essential Curator corpus. *(App will need a PDF text extractor.)*
- **`dowson/`** (2 PDFs) — Mark Dowson (original electronics; 2005 retrospective); scholarship.
- **`mcleish/` root PDF** — "How It Works, Recollections, and Observations"; best plain-language reference and a salvage source for stub content.
- **`physical-build/`** — CAD render + sensor/light coordinate layouts (the as-built bridge). *(Export the two `.psd` sources to PNG on ingest; `Untitled-*.png` are unlabeled.)*

## 5. Completion plan (remaining)

Archive salvage seeds: `Hierarchical State Diagram_OP` (dual-drive hierarchical states — seed for future work), `2@startuml..` (5-agent environment state — seed for OverallSimulation), `Activity Diagram with Parallel Processes` (fork/join — seed for system activity diagrams). Discard `ClassDiagramForActors` and `Not Used/StateDiagramForActorStates` (generic login/logout, not Colloquy). Note the archive's "Satisfied and **Inert**" is the stale label; current is "Satisfied and **Indifferent**".

- **P1 (done):** dedupe component diagram; annotate the resolved deltas.
- **P2 (done):** Male / Female / Drive state diagrams.
- **P3:** fill remaining matrix stubs (activity column; Female Horizontal Control; the two Female Vertical Reflector cells; Beam/Beam-Motor activity/state).
- **P4:** author the §3 system-context diagrams (start with `OverallSimulation`, then the distributed-wire sequence and the holon/agent component diagram).
- **P5:** populate `implementation-map/` (annotate the `lightAndSensors*` layouts with agent/sensor IDs and canonical `sense_/act_` keys, using the McLeish "How It Works" PDF).

## 6. Into the documentation app

Render each `.plantuml` → SVG and organize by the §1 subsystem × {Activity, Sequence, State} matrix so completeness is visible in the UI. Hyperlink each diagram to its implementing source file (the code already back-references diagram filenames — bidirectional) and to the canonical frame-variable keys. This diagram library is the behavioural backbone of a "how the mobiles behave" reference and the grounded, citable corpus for a Curator-style conversational agent: *why* from the Pask PDFs, *what* from these sequence/state diagrams, *where in code* from the diagram→source links.
