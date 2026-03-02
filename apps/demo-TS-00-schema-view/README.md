# Demo 00: Schema Lab

## Purpose

Demo 00 is the schema-first workspace for evaluating configuration direction.

It starts from the legacy abstract schema and lets you compare it with v2, using a legacy reference config side-by-side.

## What It Shows

- **Schema selector**
  - `simulation-config.schema.json` (legacy abstract schema)
  - `simulation-config-v2.schema.json` (runtime-oriented v2)
- **Config selector**
  - `config_240812.json` (legacy reference config)
- **Compatibility status**
  - Lightweight structural compatibility message for the selected schema/config pair
- **Raw JSON panes**
  - Schema JSON
  - Config JSON

## Current Goal

Use Demo 00 to drive schema decisions before deeper loader/runtime refactoring.

This supports evaluating whether the canonical authoring schema should remain abstract while runtime details stay in loader logic.

## Development

From `apps/demo-TS-00-schema-view`:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Notes

- Demo 00 intentionally has no 3D renderer or camera controls.
- It is a schema/design tool, not a behavior simulation demo.
