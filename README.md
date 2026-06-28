# Mini ERP Web

The **frontend** of Mini ERP — a modular, production-oriented **Next.js (App
Router)** app built for scale. It ships a component-based design system, a
feature-module architecture ready to be split into micro-frontends, and a
testing workflow wired in from day one.

> **Frontend only.** The backend is a separate **NestJS** service (PostgreSQL +
> Prisma, JWT auth, Swagger) living in `../nestjs/mini-erp-be`. This app talks to
> it through a typed API client — see [Backend / API](#backend--api).

> This README is the source of truth for the project. **Keep it in sync** — every
> feature that changes behaviour, structure, scripts, or the tech stack must
> update the relevant section here (see [Contributing workflow](#contributing-workflow)).

---

## Tech stack

| Concern            | Choice                                        | Why |
| ------------------ | --------------------------------------------- | --- |
| Framework          | **Next.js 16** (App Router, RSC, Turbopack)   | File-based routing, server components, route-level streaming/loading. |
| Language           | **TypeScript 5** (strict)                     | Type safety across modules and public APIs. |
| UI runtime         | **React 19**                                  | Server + client components. |
| Styling            | **Tailwind CSS v4** + **ErgoSoft design system** (M3 tokens) | Utility-first, themeable design tokens (`docs/DESIGN.md`), zero runtime cost. |
| Typography         | **Inter** (`next/font`)                       | High legibility for data-dense ERP screens; the design system's chosen typeface. |
| Icons              | **Font Awesome 7** (`react-fontawesome`)      | Tree-shakeable SVG icons via a single `Icon` wrapper. |
| Animation          | **Motion** (`motion/react`)                   | Declarative, accessible interactivity (fade/stagger primitives). |
| Class composition  | **clsx** + **tailwind-merge** (`cn()`)        | Conflict-free conditional class names. |
| Testing            | **Vitest** + **React Testing Library** + jsdom | Fast, ESM-native unit/component tests. |
| Tooling            | **ESLint** (eslint-config-next), **pnpm**     | Linting + reproducible installs. |
| Backend (separate) | **NestJS** + PostgreSQL/Prisma + JWT          | REST API at `http://localhost:3000/api` — see [Backend / API](#backend--api). |

## Prerequisites

- **Node.js** `>= 20`
- **pnpm** `>= 9` — enable via Corepack: `corepack enable && corepack prepare pnpm@latest --activate`

## Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Create your local env file and adjust if needed
cp .env.example .env.local
```

## Running the application locally

```bash
# Start the dev server (Turbopack, hot reload)
pnpm dev
```

Open <http://localhost:3001> to view the app.

> The frontend runs on **port 3001** because the NestJS backend uses **port
> 3000**. To exercise live data, start the backend too (see below); without it
> the app still runs on mocked data.

### Available scripts

| Script                 | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `pnpm dev`             | Start the development server with hot reload.      |
| `pnpm build`           | Create an optimized production build.              |
| `pnpm start`           | Serve the production build.                        |
| `pnpm lint`            | Run ESLint.                                        |
| `pnpm typecheck`       | Type-check the project (`tsc --noEmit`).           |
| `pnpm test`            | Run the full test suite once.                      |
| `pnpm test:watch`      | Run tests in watch mode while developing.          |
| `pnpm test:coverage`   | Run tests and produce a coverage report.           |

## Design system

The UI implements the **ErgoSoft Systems** design system — a calm, data-dense,
Material-3-based theme. The spec lives in [`docs/DESIGN.md`](docs/DESIGN.md) and
is the source of truth for styling.

It is wired into **Tailwind CSS v4** as theme tokens in
[`src/app/globals.css`](src/app/globals.css), so components style themselves with
semantic utilities instead of raw colors:

| Category    | Examples |
| ----------- | -------- |
| Surfaces    | `bg-surface`, `bg-surface-container-lowest`, `bg-surface-container-high` |
| Content     | `text-on-surface`, `text-on-surface-variant` |
| Brand       | `bg-primary` / `text-on-primary`, `bg-secondary-container` / `text-on-secondary-container` |
| Semantics   | `text-error`, `text-success` (success is derived — see below) |
| Outlines    | `border-outline`, `border-outline-variant` |
| Typography  | `text-headline-lg`, `text-headline-md`, `text-body-md`, `text-label-md` |
| Radius      | `rounded-md` (8px, buttons/inputs), `rounded-lg`/`rounded-xl` (12–16px, cards) |

**Use these tokens — never hard-coded colors** (`zinc-*`, `#hex`). Spacing already
follows the design's 4px rule via Tailwind's default scale (`p-1`=4px … `p-8`=32px).

Both light ([`docs/DESIGN.md`](docs/DESIGN.md)) and dark
([`docs/DESIGN.dark.md`](docs/DESIGN.dark.md)) are published specs; their colors
flip automatically via `prefers-color-scheme`.

> **Notes beyond the published specs:**
> - **One shared type/spacing scale.** The two specs define slightly different
>   typography/spacing; by decision we use a single (light) scale for both modes,
>   since Tailwind type/spacing tokens are global and the deltas are minor.
> - **Success color** — added (`--color-success` family) for positive states
>   (e.g. KPI deltas); neither spec defines one. Matches the desaturated tone.

## Backend / API

The backend is a **separate NestJS service** (not part of this repo):

- **Location:** `../nestjs/mini-erp-be`
- **Base URL:** `http://localhost:3000/api` (port `3000`, global `/api` prefix)
- **Auth:** JWT Bearer (access + refresh tokens)
- **Docs:** Swagger UI at `http://localhost:3000/api/docs`
- **CORS** is enabled, so the browser can call it directly.

This app communicates through a single typed API client:

- Configure the base URL with `NEXT_PUBLIC_API_URL` (see `.env.example`).
- Use `api` / `apiFetch` from `@/lib/api` — it prefixes the base URL, serializes
  JSON, attaches the Bearer token, and throws a typed `ApiError` on failures.

```ts
import { api } from "@/lib/api";

const users = await api.get<User[]>("/users", { token });
await api.post("/auth/login", { email, password });
```

Run both services locally (separate terminals):

```bash
# Terminal 1 — backend (in ../nestjs/mini-erp-be)
pnpm start:dev          # http://localhost:3000/api

# Terminal 2 — frontend (this repo)
pnpm dev                # http://localhost:3001
```

## Project structure

```
src/
├─ app/                      # Next.js App Router — routing layer ONLY (thin)
│  ├─ layout.tsx             # Root layout: fonts, Font Awesome, AppShell
│  ├─ page.tsx               # Dashboard route (fetches via module service)
│  ├─ loading.tsx            # Route-level Suspense fallback (skeleton)
│  ├─ error.tsx              # Segment error boundary
│  └─ not-found.tsx          # 404 page
│
├─ components/               # Cross-cutting, reusable UI (the design system)
│  ├─ ui/                    # Primitives: Button, Card, Icon, Spinner,
│  │                         #   Skeleton, Motion (FadeIn/Stagger)
│  └─ layout/                # App chrome: AppShell, Header, Sidebar, Footer
│
├─ modules/                  # Self-contained feature slices (micro-frontend ready)
│  └─ dashboard/             # Example module — see src/modules/README.md
│     ├─ components/         #   feature UI
│     ├─ services/           #   data access / business logic
│     ├─ types/              #   feature-owned types
│     ├─ __tests__/          #   co-located tests
│     └─ index.ts            #   PUBLIC API (the only allowed import path)
│
├─ config/                   # App config: site metadata, navigation, env
├─ hooks/                    # Shared React hooks (e.g. useMediaQuery)
├─ lib/                      # Framework-agnostic utilities
│  ├─ api/                   #   typed client for the NestJS backend
│  ├─ icons/                 #   Font Awesome setup + curated icon exports
│  └─ utils/                 #   cn() class merger, etc.
├─ types/                    # Cross-cutting shared types
└─ test/                     # Test setup (jest-dom, cleanup)
```

The `@/*` path alias maps to `src/*`. Project docs live in `docs/`
([`docs/DESIGN.md`](docs/DESIGN.md) — the design system).

## Architectural decisions & assumptions

- **`src/` layout + `@/*` alias.** All source lives under `src/` for a clean root
  and stable, absolute imports — no `../../..` chains.
- **Layered separation: `app/` is thin.** Routes only wire data to views. UI lives
  in `components/` and `modules/`; I/O lives in module `services/`. This keeps the
  routing layer swappable and components pure and testable.
- **Feature modules with a public API.** Each folder in `src/modules/` owns its
  UI, logic, and types and exposes a single `index.ts`. Outside code imports only
  through that barrel, never deep-importing internals.
- **Micro-frontend readiness.** Because modules are self-contained and only
  communicate through their public API + the shared design system, any module can
  later be extracted into a separately deployed micro-frontend with minimal
  churn. Navigation is data-driven (`src/config/navigation.ts`), so route/module
  boundaries are explicit. See [`src/modules/README.md`](src/modules/README.md).
- **Design-system first.** Reusable primitives in `src/components/ui` (composed
  via `cn()`) give a consistent, responsive, accessible UI. Features compose
  these instead of writing bespoke markup.
- **First-class loading UX.** A pure-CSS `Spinner` (works in Server Components)
  and a layout-mirroring `Skeleton` are provided. Routes stream a skeleton via
  `app/loading.tsx`; buttons show inline spinners while busy.
- **Accessible, responsive by default.** Mobile-first Tailwind, an off-canvas
  sidebar with a focusable scrim, `aria-*`/roles on interactive components, and
  reduced-motion-friendly animations.
- **Font Awesome auto-CSS disabled.** `config.autoAddCss = false` plus a single
  stylesheet import in the root layout prevents the icon flash / layout shift.
- **Frontend/backend separation.** This repo is the UI only; the **NestJS**
  backend is a separate service (`../nestjs/mini-erp-be`). All HTTP access goes
  through the single typed client in `@/lib/api`, configured via
  `NEXT_PUBLIC_API_URL`. Centralizing it means auth headers, error handling, and
  the base URL have one home — and the frontend can deploy independently.
- **Mocked data today (assumption).** Module `services/` currently return mocked
  data behind an `async` API matching the client's signature, so swapping in a
  real `api.get(...)` call is a one-liner with no impact on components. The
  frontend runs standalone without the backend running.

## Contributing workflow

This project assumes an **AI-assisted** workflow. To keep quality and docs
consistent, every change (human or AI) follows these rules — also encoded in
[`CLAUDE.md`](CLAUDE.md) so AI assistants apply them automatically:

1. **Write/update tests with every feature change.** Add or update co-located
   tests (`*.test.tsx` next to the unit, or a module's `__tests__/`) whenever you
   add or modify behaviour.
2. **Run the test suite and keep it green.** `pnpm test` must pass before a change
   is considered done. Run `pnpm lint` and `pnpm typecheck` too.
3. **Keep this README in sync.** Update the relevant section whenever you change
   the tech stack, scripts, structure, or architecture.
4. **Respect module boundaries.** Import features only through their `index.ts`.

### Adding a new feature module

1. Scaffold `src/modules/<feature>/` (`components/`, `services/`, `types/`,
   `__tests__/`, `index.ts`).
2. Add a route under `src/app/<feature>/` that imports from the module's `index.ts`.
3. Register it in `src/config/navigation.ts`.
4. Write tests, run `pnpm test` / `pnpm lint` / `pnpm typecheck`, and update this README.
