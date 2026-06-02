# Product Requirements Document (PRD)

## 1. Product Overview
The Agent Skill Registry is being fully remodeled to adopt a premium, developer-centric aesthetic inspired by Clerk Dashboard and Graphite Agents. The new UI will transition from a single monolithic file with conditional tabs to a fully routed, multi-page web application using `@tanstack/react-router`.

## 2. Target Audience
AI Engineers, DevOps professionals, and Platform Engineers managing large fleets of agentic skills, MCP integrations, and LLM providers.

## 3. Core Aesthetic Vision
- **Theme**: High-contrast Dark Mode.
- **Typography**: Refined sans-serif for UI elements, Monospaced (e.g., Fira Code, JetBrains Mono) for code/logs.
- **Components**: Glassmorphic panels, subtle glowing borders (Graphite), clean structural sidebars with pill-shaped active states (Clerk).
- **Motion**: Minimal, CSS-driven micro-interactions on hover and route transitions.

## 4. Key Features & Page Structure (4-8 Pages Deep)
The monolithic UI will be split into deep, navigable pages:
1. **Overview Dashboard (`/`)**: High-level metrics, recent runs, system health.
2. **Skill Catalog (`/skills`)**: Searchable, filterable grid of available skills.
3. **Skill Detail (`/skills/$skillId`)**: Deep-dive into a specific skill, markdown rendering, and execution runner.
4. **Providers & MCP (`/integrations`)**: Sub-routes for LLM Providers and MCP Servers.
5. **Governance (`/governance`)**: Execution policies and gate testing.
6. **Evals & History (`/activity`)**: Evaluation harness reports and command history.
7. **Terminal (`/cli`)**: Dedicated terminal interface.

## 5. Technical Requirements
- Keep the existing `skillLabApi` data fetching logic.
- Replace monolithic `index.tsx` with dedicated TanStack route files.
- Restyle using Tailwind CSS (with arbitrary values or extended theme for the glow/glassmorphism).
- Ensure desktop-first, highly functional developer experience.
