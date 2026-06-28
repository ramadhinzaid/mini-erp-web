# Modules

Each folder here is a **self-contained feature slice** — the unit we would later
extract into a standalone micro-frontend. Treat a module as a mini-application
that owns its UI, logic, data access, and types.

## Anatomy

```
modules/<feature>/
├─ components/      # Feature UI (composes shared primitives from @/components/ui)
├─ services/        # Data access / business logic (async, swappable)
├─ types/           # Types owned by this feature
├─ __tests__/       # Co-located tests for the feature
└─ index.ts         # PUBLIC API — the only entry point other code may import
```

## Rules

1. **Import a module only through its `index.ts`.** Never deep-import another
   module's internals (`modules/x/components/...`). This keeps the public
   surface small so a module can move to its own deployable later.
2. **Modules don't import each other's internals.** If two features need to
   share something, promote it to `@/components`, `@/lib`, or `@/hooks`.
3. **Keep components pure; put I/O in `services/`.** Components receive data via
   props; services own fetching. This makes both trivially testable.
4. **Co-locate tests** and add/update them with every feature change.

## Adding a module

1. Scaffold the folder structure above.
2. Add a route under `src/app/<feature>/` that imports from the module's
   `index.ts`.
3. Register it in `src/config/navigation.ts`.
4. Write tests, run `pnpm test`, and update the root `README.md`.
