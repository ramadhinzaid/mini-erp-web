# Project guide for AI assistants

This file is read automatically by Claude Code. Follow it for **every** change in
this repo. The full project documentation lives in [`README.md`](README.md) —
read it before making structural decisions.

## Golden rules (non-negotiable)

1. **Always write or update tests when you add or change a feature.**
   - Co-locate tests: `*.test.tsx` next to the unit, or in a module's `__tests__/`.
   - Cover behaviour and edge cases, not just the happy path.
2. **Always run the checks and keep them green before considering work done:**
   ```bash
   pnpm test         # all tests must pass
   pnpm lint         # no lint errors
   pnpm typecheck    # no type errors
   ```
   If any fail, fix them before finishing.
3. **Always keep `README.md` in sync.** When you change the tech stack, scripts,
   project structure, or an architectural decision, update the matching README
   section in the same change. The README must always reflect reality.

## Scope: frontend only

This repo is the **frontend**. The backend is a **separate NestJS service** at
`../nestjs/mini-erp-be` (PostgreSQL/Prisma, JWT, Swagger at
`http://localhost:3000/api/docs`). Do **not** add backend/server logic here.

- All HTTP calls go through the typed client in `@/lib/api` (`api` / `apiFetch`).
  Never call `fetch` to the backend directly from components or services.
- The base URL comes from `NEXT_PUBLIC_API_URL` (`src/config/env.ts`). Read env
  via `@/config/env`, not `process.env` scattered around.
- The frontend runs on **port 3001** (`pnpm dev`); the backend owns port 3000.
- Module `services/` may return mocked data until an endpoint exists, but must
  keep a signature compatible with the API client so swapping in is a one-liner.

## Design system (must respect)

The UI follows the **ErgoSoft** design system — spec in
[`docs/DESIGN.md`](docs/DESIGN.md), wired into Tailwind as tokens in
`src/app/globals.css`.

- **Style with semantic tokens, never raw colors.** Use `bg-surface`,
  `text-on-surface`, `bg-primary`/`text-on-primary`, `bg-secondary-container`,
  `border-outline-variant`, `text-error`, `text-success`, etc. Do **not** use
  `zinc-*`, `slate-*`, or hard-coded `#hex` in components.
- **Typography:** use the type-scale utilities (`text-headline-lg`,
  `text-headline-md`, `text-headline-sm`, `text-body-lg/md/sm`, `text-label-md`)
  rather than ad-hoc `text-2xl font-semibold` combinations.
- **Radius:** `rounded-md` (8px) for buttons/inputs; `rounded-lg`/`rounded-xl`
  (12–16px) for cards. **Spacing:** multiples of 4px (Tailwind's default scale).
- **Dark mode** flips automatically via tokens — write the light style with
  semantic tokens and dark mode follows; do not add `dark:` color overrides.
  Both light (`docs/DESIGN.md`) and dark (`docs/DESIGN.dark.md`) are published
  specs.
- **One shared type/spacing scale** for both modes (by decision) — don't add
  color-scheme-specific font sizes/weights.
- `success` colors are derived (neither spec defines one); keep them consistent
  with the existing token values if you extend them.

## Architecture (must respect)

- **`src/app/` is a thin routing layer.** Routes wire data → views only. No
  business logic or heavy UI there.
- **Reusable UI lives in `src/components/`.** `ui/` = design-system primitives,
  `layout/` = app chrome. Compose these; don't reinvent markup. Merge classes
  with `cn()` from `@/lib/utils`.
- **Features are modules in `src/modules/<feature>/`** — self-contained and
  micro-frontend-ready. Each exposes a single public API via `index.ts`.
  - Import a module **only** through its `index.ts`. Never deep-import internals.
  - Components stay pure; put I/O / business logic in the module's `services/`.
  - See [`src/modules/README.md`](src/modules/README.md) for the full pattern.
- **Icons:** import from `@/lib/icons` and render via the `Icon` component.
- **Animation:** use the `FadeIn` / `Stagger` primitives from `@/components/ui`
  (built on `motion`). Client components only.
- **Loading states:** use `Spinner` (actions) and `Skeleton` (content) from
  `@/components/ui`; mirror the real layout in skeletons.

## Adding a feature module (checklist)

1. Create `src/modules/<feature>/` with `components/`, `services/`, `types/`,
   `__tests__/`, and `index.ts`.
2. Add the route under `src/app/<feature>/`, importing from the module's `index.ts`.
3. Register it in `src/config/navigation.ts`.
4. Write tests → run `pnpm test`, `pnpm lint`, `pnpm typecheck` → update `README.md`.

## Conventions

- TypeScript strict mode; prefer explicit prop types and `forwardRef` for
  interactive primitives.
- Use the `@/*` import alias (maps to `src/*`) — no `../../..` chains.
- Keep accessibility in mind: roles, `aria-*`, keyboard support, `sr-only` labels.
