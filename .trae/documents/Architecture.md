# Technical Architecture Document

## 1. System Architecture Overview
The frontend architecture will retain its Vite + React foundation but will undergo a structural routing and styling overhaul to support the new "4-8 pages deep" design. It will remain decoupled from the Express backend, interacting purely via `skillLabApi`.

## 2. Directory Structure Updates
```text
frontend/src/
├── assets/         # Global CSS and tokens (glow effects, glass variables)
├── components/     # Reusable UI primitives (Cards, Sidebar, Topbar, Badges)
├── features/       # Existing skill-lab logic, hooks, types
└── routes/
    ├── __root.tsx  # Global layout: Sidebar + TopNav + Outlet
    ├── index.tsx   # Dashboard
    ├── skills/
    │   ├── index.tsx       # Catalog
    │   └── $skillId.tsx    # Detail view
    ├── integrations/
    │   ├── providers.tsx
    │   └── mcp.tsx
    ├── governance.tsx
    ├── activity.tsx
    └── cli.tsx
```

## 3. Design System & CSS Architecture
- **Tailwind Config**: Will be extended with custom colors (`slate-850`, `cyan-glow`, `glass-bg`), backdrop blur utilities, and precise border colors.
- **Layout Model**: 
  - `__root.tsx` will host a permanent left Sidebar (Clerk style) and a top Breadcrumb/Status bar.
  - The main `<Outlet />` will utilize a constrained maximum width for readability with ample negative space.
- **Component Primitives**: The existing `primitives.tsx` will be broken down or heavily restyled into modern, sleek equivalents.

## 4. Routing Strategy
Using `@tanstack/react-router`, we will leverage file-based routing. Data fetching will remain in `useEffect` or be elevated to TanStack Route loaders if required, though sticking to the existing `skillLabApi` hook patterns minimizes regression risk.

## 5. State Management
Local state per route will handle filtering and inputs. Global state is not strictly required as the API layer caches or refetches efficiently. 
