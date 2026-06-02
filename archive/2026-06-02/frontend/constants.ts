import { Registry, LogEntry, AppConfig } from './types';

export const INITIAL_REGISTRY: Registry = {
  version: "1.2.0",
  lastSynced: new Date().toISOString(),
  health: 'healthy',
  skills: [
    {
      id: "sk_001",
      name: "skillx-planner",
      description: "High-level planning skill. Decomposes user goals into a step-by-step pseudo-plan.",
      path: "~/ai-skills/shared/planning/skillx-planner",
      scope: "shared",
      agents: ["opencode", "claude", "gemini"],
      tags: ["planning", "core", "orchestration"],
      version: "1.0.0",
      enabled: true,
      created_at: "2023-10-25T10:00:00Z",
      updated_at: "2023-10-26T14:30:00Z",
      type: "planning",
      tier: "T1",
      allowedTools: ["cat", "echo", "python"]
    },
    {
      id: "sk_002",
      name: "security-gatekeeper",
      description: "Enforces Runtime Monitoring and Verification Gates (G1-G4) before executing Atomic commands.",
      path: "~/ai-skills/shared/governance/security-gatekeeper",
      scope: "shared",
      agents: ["opencode", "claude"],
      tags: ["security", "governance", "validation"],
      version: "1.1.0",
      enabled: true,
      created_at: "2023-10-25T10:15:00Z",
      updated_at: "2023-10-27T09:00:00Z",
      type: "governance",
      tier: "T4",
      allowedTools: ["bash", "grep"]
    },
    {
      id: "sk_003",
      name: "opencode-git-helper",
      description: "Agent-specific skill for OpenCode to manage complex git rebases and conflict resolution.",
      path: "~/ai-skills/agents/opencode/git-helper",
      scope: "agent-specific",
      agents: ["opencode"],
      tags: ["git", "vcs", "utility"],
      version: "0.9.5",
      enabled: true,
      created_at: "2023-10-28T11:20:00Z",
      updated_at: "2023-10-28T11:20:00Z",
      type: "functional",
      tier: "T2",
      allowedTools: ["git", "bash"]
    },
    {
      id: "sk_004",
      name: "system_audit",
      description: "Executes a safe read-only audit of the current directory to establish context.",
      path: "~/ai-skills/shared/atomic/system_audit",
      scope: "shared",
      agents: ["opencode", "claude", "gemini", "custom"],
      tags: ["audit", "filesystem", "readonly"],
      version: "2.0.1",
      enabled: true,
      created_at: "2023-10-20T08:00:00Z",
      updated_at: "2023-10-29T16:45:00Z",
      type: "atomic",
      tier: "T1",
      allowedTools: ["ls", "cat", "pwd"]
    },
    {
      id: "sk_005",
      name: "web-dev",
      description: "Create production-grade web interfaces with high design quality. Use this skill ONLY when the user explicitly asks to build or create new websites from scratch.",
      path: "~/ai-skills/shared/functional/web-dev",
      scope: "shared",
      agents: ["opencode", "claude", "gemini"],
      tags: ["web", "frontend", "design", "scaffolding"],
      version: "1.0.0",
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: "functional",
      tier: "T3",
      allowedTools: ["bash", "npm", "pnpm", "git", "write_file", "read_file"],
      instructions: `---
name: "web-dev"
description: "Create production-grade web interfaces with high design quality. **Use this skill ONLY when the user explicitly asks to build or create new websites, web pages, web apps, or web-based games from scratch in an empty or frontend-code-free workspace.** Not for bug fixes or modifications to existing projects."
---

# web-dev

## Description
Create production-grade web interfaces with high design quality. Use this skill ONLY when the user explicitly asks to build or create new websites, web pages, web apps, or web-based games from scratch in an empty or frontend-code-free workspace. Not for bug fixes or modifications to existing projects.

## When to use
**This skill is designed exclusively for 0-to-1 greenfield web development scenarios.**

Use this skill when:
- The user explicitly requests to create a brand new web project, website, web page, web app, or web-based game from scratch
- The workspace is empty or contains no frontend code (no package.json, index.html, .jsx/.tsx/.vue files, etc.)
- The user wants to follow the complete web-dev workflow (PRD generation + development)

**DO NOT use this skill when:**
- The workspace already contains an existing frontend project structure
- The user requests bug fixes, feature additions, or modifications to existing code
- The request is for incremental development in an established codebase

## Instructions
### Documentation Workflow

**CRITICAL**: Before starting any development work, you MUST follow this documentation workflow:

1. **Check for Existing Documents**
   First, check if PRD (Product Requirements Document) and Technical Architecture documents already exist in \`.trae/documents/\`:
   - If both documents exist: **Skip to step 3** and proceed directly with development based on these documents.
   - If documents are missing or incomplete: **Continue to step 2** to create them.

2. **Create Required Documents (if not exist)**
   When documents don't exist, you MUST create them using tools with \`product_document\` in their names before any coding:
   - **CRITICAL: Load document guidelines**: Must read and follow the constraints in \`resources/web-docs-guideline.md\` as the authoritative guide for document generation
   - Generate Product Requirements Document (PRD) using the template
   - Generate Technical Architecture Document using the template
   - Store all documents in \`.trae/documents/\` directory
   - **When you are in regular Agent Mode, after completing document generation, you MUST use NotifyUser tool to notify user and request approval before proceeding to Development Phase.**

3. **Development Phase**
   Once documents are confirmed (either existing or newly created and approved by user):
   - **CRITICAL**: You MUST read the \`resources/web-dev-guideline.md\` and follow it BEFORE writing any code. Do NOT skip this step or proceed without loading the file first.
   - After loading \`web-dev-guide\`, follow its guidelines strictly for project initialization, code quality, and best practices
   - Implement the solution following the PRD and Technical Architecture
   - Apply the design guidelines below for exceptional aesthetics
   - Follow all technical constraints and architecture decisions from the documents

### Design Thinking
Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

### Frontend Aesthetics Guidelines
Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.
`,
      files: {
        'resources/web-docs-guideline.md': `## Language Adaptation Rule
**IMPORTANT**: The templates below are STRUCTURAL REFERENCES ONLY. All output MUST match the language in \`<user_input>\`.
- You MUST translate ALL template headers, descriptions, and example text into the language of \`<user_input>\`
- For example, if \`<user_input>\` is in Chinese:
  - \`## 1. Product Overview\` → \`## 1. 产品概述\`
  - \`[Project overview in 2 lines max]\` → \`[用最多2行描述项目概述]\`
  - Table headers like \`| Page Name | Module Name |\` → \`| 页面名称 | 模块名称 |\`
- Do NOT output English templates directly when \`<user_input>\` uses a different language
- This rule applies to BOTH the PRD Template AND the Technical Architecture Template

#### PRD Template
**Constraints:**
- Generate pages and features required for the product to function properly, prioritizing core functionality pages
- If total pages ≤ 3, increase functional complexity and content richness within each page
- Use meaningful document names for better recognition

**Format:**
## 1. Product Overview
[Project overview in 2 lines max]
- Brief description of main purposes, problems to solve, target users
- Target or market value of the product

## 2. Core Features
### 2.1 User Roles (if applicable)
[Only include if role distinction is necessary]
| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Normal User | Email registration | Browse and use basic functions |

### 2.2 Feature Module
[List ONLY essential page names with core modules]
1. **Home page**: hero section, navigation, article list
2. **Details page**: article details, user comments

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Home page | Hero section | Auto-switch images at intervals, etc. |

## 3. Core Process
[Natural language description of main user flows]
[Mermaid flowchart with quoted node labels]

## 4. User Interface Design
### 4.1 Design Style
- Primary and secondary colors
- Button style (3D, rounded, etc.)
- Font and sizes
- Layout style (card-based, top navigation)
- Icon/emoji style suggestions

### 4.2 Page Design Overview
| Page Name | Module Name | UI Elements |
|-----------|-------------|-------------|
| Home page | Hero section | Style, Layout, Colors, Fonts, Animation |

### 4.3 Responsiveness
[Desktop-first, mobile-adaptive, touch optimization]

### 4.4 3D Scene Guidance (if applicable)
- Environment/HDRI and mood
- Lighting setup
- Camera settings and motion
- Composition and focal elements
- Interactions and animations
- Post-processing effects
- Asset sources and performance budgets

#### Technical Architecture Template
**Principles:**
- Minimize external services unless explicitly requested
- Prefer React over plain HTML
- For 3D projects: three, @react-three/fiber, @react-three/drei, @react-three/postprocessing

**Format:**
## 1. Architecture Design
[Mermaid diagram showing layers: Frontend, Backend (optional), Data, External Services]

## 2. Technology Description
- Frontend: React@18 + tailwindcss@3 + vite
- Initialization Tool: vite-init
- Backend: Express@4 / None
- Database: PostgreSQL / MySQL / SQLite (if applicable), mock data if user preferred

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| /home | Home page with main content |

## 4. API Definitions (if backend exists)
[TypeScript type definitions, request/response schemas]

## 5. Server Architecture Diagram (if backend exists)
[Mermaid diagram: Controller → Service → Repository → Database]

## 6. Data Model (if applicable)
### 6.1 Data Model Definition
[Mermaid ER diagram]

### 6.2 Data Definition Language
[DDL statements for table creation, indexes, initial data]`,
        'resources/web-dev-guideline.md': `# Building web application guidelines

<self_reflection>
Before coding, internally create a quality rubric (5-7 categories) for world-class web apps. Use it to evaluate and iterate on your solution until it meets top marks across all categories. Do not show this rubric to the user.
</self_reflection>

<initialize_project_workflow>
1. **Initialize development environment**. If \`node\` **NOT INSTALL**, you MUST immediately to install it. If \`node\` **HAS INSTALL**, you MUST skip this step. **IMPORTANT: You don't need to actively check the current environment first, The user has already told you in latest <env/>**
2. If the user rules or input do not specify a package manager, and pnpm exists in <env/> or the init_env toolcall result, pnpm is used first; otherwise, npm is used.
3. Use the templates listed in <available_templates> for creating or migrating projects, rather than creating files manually.
**Generate the project file structure** using node package manager. Replace the default \`vite\` command with \`vite-init\`, and choose either the <available_templates> below to scaffold your project:
  - pnpm exist:
    \`pnpm create vite-init@latest . --template <available_templates> --force\`
  - otherwise:
    Check the operating system from <env/> and use the appropriate command:
    - For Windows: \`npm init vite-init@latest -y . "--" --template <available_templates> --force\`
    - For macOS/Linux: \`npm init vite-init@latest -y . -- --template <available_templates> --force\`
4. If the user has specific package version requirements, after the project is created, check the dependencies in package.json and add or update them according to the user's specifications.
5. For dependencies that need to be modified, update the package.json file directly. Do not use npm or pnpm to install them, as this may cause version mismatches.
6. **Install all dependencies** by running \`pnpm install\` or \`npm install\`.
</initialize_project_workflow>

<available_templates>
You can choose from the following templates:
- **react-ts**: A React project with TypeScript, just for pure frontend project, include react, react-router-dom, tailwind and zustand.
- **vue-ts**: A Vue project with TypeScript, just for pure frontend project, include vue, vue-router and tailwind.
- **react-express-ts**: Default, A React project with TypeScript and Express.js backend, include react, react-router-dom, tailwind, zustand and express.
- **vue-express-ts**: A Vue project with TypeScript and Express.js backend, include vue, vue-router, tailwind and express.
</available_templates>

<guiding_principles>
- **Language Consistency**: All responses, explanations, and human-readable content MUST be in the same language as \`<user_input>\`. Only code syntax (variable names, function names) remains in English.
- Clarity and Reuse: Every component and page should be modular and reusable. Avoid duplication by factoring repeated UI patterns into components.
- Consistency: The user interface must adhere to a consistent design system—color tokens, typography, spacing, and components must be unified.
- Simplicity: Favor small, focused components and avoid unnecessary complexity in styling or logic.
- Demo-Oriented: The structure should allow for quick prototyping, showcasing features like streaming, multi-turn conversations, and tool integrations.
- Visual Quality: Follow the high visual quality bar as outlined in OSS guidelines (spacing, padding, hover states, etc.)
- Task: In addition to the basic to-do tool workflow, you must also follow the rules in <addition_to_do_rule>.
- Tech stack: Select the appropriate handbook from <development_handbooks> based on the tech stack.These guidelines are designed to ensure that you provide high-quality, consistent, and maintainable code.
- Testing: Always verify the correctness of the code with <testing_guidelines>.
</guiding_principles>

<ui_ux_best_practices>
- Visual Hierarchy: Limit typography to 4–5 font sizes and weights for consistent hierarchy; use \`text-xs\` for captions and annotations; avoid \`text-xl\` unless for hero or major headings.
- Color Usage: Use 1 neutral base (e.g., \`zinc\`) and up to 2 accent colors.
- Spacing and Layout: Always use multiples of 4 for padding and margins to maintain visual rhythm. Use fixed height containers with internal scrolling when handling long content streams.
- State Handling: Use skeleton placeholders or \`animate-pulse\` to indicate data fetching. Indicate clickability with hover transitions (\`hover:bg-*\`, \`hover:shadow-md\`).
- Accessibility: Use semantic HTML and ARIA roles where appropriate. Favor pre-built Radix/shadcn components, which have accessibility baked in.
</ui_ux_best_practices>

<addition_to_do_rule>
- Don't forget to include both frontend and backend tasks, including database creation, initial data setup, and API integration.
- **Empty Project Priority**: If the project is empty, the first todo item must always be "To create the requirements, technical documentation, and page design documentation, then wait for the user to confirm".
- **Requirements Changes Priority**: If the requirements changes, always add a todo item "to update the requirements and technical documentation, then wait for the user to confirm".
- **Backend Integration Priority**: When generating todo lists for tasks that involve adding backend functionality or migrating from frontend-only to full-stack applications, if the user has not specified a backend tech stack, the FIRST todo item must always be "Initialize backend framework following backend_framework_init_guidelines". This ensures proper project structure setup before implementing specific backend features.
</addition_to_do_rule>

<testing_guidelines>
There are some guidelines for testing the code you wrote:
- Always write tests for the code you wrote, and make sure the tests cover all possible scenarios.
- Use appropriate testing tools and frameworks based on the tech stack.
- Make sure the tests are easy to read and understand.
- Tests should be independent and isolated, so that they can be run in any order.
</testing_guidelines>

<dev_server_guidelines>
- When starting the development server (e.g., \`npm run dev\` or \`pnpm dev\`), run it in the background so you can continue with subsequent tasks without waiting.
- After the dev server starts, use the \`OpenPreview\` tool to show the preview URL to the user.
</dev_server_guidelines>

<document_guidelines>
- The documents must be under \`.trae/documents\` directory.
- Always read the provided documents before you start.
</document_guidelines>

<project_structure_guidelines>
- If the user rules or input do not specify a package manager, and pnpm exists in <env/> or the init_env toolcall result, pnpm is used first; otherwise, npm is used.
- This is a react(or vue) + vite + tailwind initialize project.
- Folders \`src\` are used to organize front-end code, and \`api\` are used to organize backend code.
- Some directory structure is created:
    - \`src/components\`: put component in this directory
    - \`src/hooks\`: put reusable hooks in this directory for react
    - \`src/composables\`: put reusable composables in this directory for vue
    - \`src/pages\`: put pages in this directory
    - \`src/utils\`: put utility functions in this directory
- Some directory structures are predefined but may not be present until needed:
    - \`shared\`: put public types definition if include both frontend and backend
    - \`api\`: Unless the user requests, the backend code will be placed here.
    - \`migrations\`: contains database migration SQL files, each named with a timestamp
- Some files must not be newly created; only modifications to existing versions are allowed:
    - \`package.json\`: contains project dependencies and scripts
    - \`tsconfig.json\`: TypeScript configuration file
    - \`vite.config.ts\`: Vite configuration file
    - \`tailwind.config.js\`: Tailwind CSS configuration file
    - \`postcss.config.js\`: PostCSS configuration file
</project_structure_guidelines>

<code_quality_guidelines>
- **Create small, focused components (< 200 lines, component file formats include .tsx, .vue, etc.).**
- **For complex components or pages, try to break them down into smaller, single-responsibility components or modules. Avoid large, monolithic files—if a component grows too large or handles multiple responsibilities, consider splitting it into logical subcomponents or extracting reusable logic into separate modules.**
- Use TypeScript for type safety, and limit syntax to ES2020 or earlier.
- Follow established project structure
- Implement responsive designs by default
- **Make sure imports are correct**
- Ensure that the links and buttons on the generated page are clickable and functional.
</code_quality_guidelines>`
      }
    }
  ]
};

export const INITIAL_LOGS: LogEntry[] = [
  { id: "l1", timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), level: "info", message: "Registry initialized at ~/ai-skills", source: "system" },
  { id: "l2", timestamp: new Date(Date.now() - 3500000).toLocaleTimeString(), level: "success", message: "Scanned 5 valid skills.", source: "scanner" },
  { id: "l3", timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(), level: "info", message: "Syncing shared skills to OpenCode adapter...", source: "sync" },
  { id: "l4", timestamp: new Date(Date.now() - 1790000).toLocaleTimeString(), level: "success", message: "Symlinks created successfully for OpenCode.", source: "sync" },
  { id: "l5", timestamp: new Date(Date.now() - 60000).toLocaleTimeString(), level: "warn", message: "Claude adapter directory ~/.claude/scripts not found. Skipping.", source: "adapter:claude" },
];

export const INITIAL_CONFIG: AppConfig = {
  registryRoot: '~/ai-skills',
  defaultAgent: 'opencode',
  syncStrategy: 'symlink',
  adapters: [
    { id: 'opencode', name: 'OpenCode', status: 'active', path: '~/.config/opencode/commands', type: 'symlink', enabled: true },
    { id: 'claude', name: 'Claude Code', status: 'missing', path: '~/.claude/scripts', type: 'copy-fallback', enabled: true },
    { id: 'gemini', name: 'Gemini CLI', status: 'inactive', path: '~/.gemini/tools', type: 'symlink', enabled: false },
  ]
};

export const SYSTEM_PROMPT = `
# ROLE AND IDENTITY
You are the Central Intelligence Orchestrator for the Total Skill Registry, a self-healing, hierarchical AI Agent Ecosystem. You operate as a Senior AI Infrastructure Architect.

# TASK
The user is executing a skill from their local Interaction Layer dashboard. 
You must simulate the execution of this skill as if you were running in their local terminal.

# OUTPUT FORMAT
You must return a JSON object matching the requested schema.
If the skill is an audit, analysis, or returns structured data, use 'json_table' and provide a stringified JSON object in the 'data' field.
If the skill is a terminal command, script execution, or logs, use 'terminal_text' and provide the raw console output in the 'data' field.
`;
