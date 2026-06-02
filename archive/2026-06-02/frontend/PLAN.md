# AI Agent Skill Registry - Implementation Plan

This document outlines the roadmap for transitioning this local interaction layer (currently a simulated frontend) into a fully functional, local-first Python/FastAPI application as requested in the architectural guidelines.

## Phase 1: Backend Foundation (Python/FastAPI)
*   **Project Skeleton:** Initialize the `ai-skill-registry` Python project using Poetry or pip.
*   **Core Models:** Define Pydantic models for `Skill`, `Registry`, and `Config` to ensure strict type validation matching the frontend interfaces.
*   **File System Operations:** Implement the `scanner.py` to read `~/ai-skills/shared` and `~/ai-skills/agents/*`, parsing `SKILL.md` files and extracting YAML frontmatter.
*   **Registry Generation:** Implement logic to dynamically generate and update `~/ai-skills/registry.yaml` based on the scanned file system.

## Phase 2: CLI & Core Logic (Typer/Click)
*   **CLI Setup:** Build the `aiskill` CLI entry point.
*   **Commands:** Implement `init`, `scan`, `list`, `show`, and `doctor`.
*   **Validation Engine:** Build `validator.py` to check for missing `SKILL.md` files, malformed YAML, duplicate IDs, and broken symlinks.

## Phase 3: Sync Engine & Adapters
*   **Adapter Pattern:** Create the base `Adapter` class and implement the `OpenCodeAdapter`.
*   **Sync Logic:** Implement `sync.py` to handle symlinking from `shared/` to agent-specific directories.
*   **Safety Fallbacks:** Add copy-based fallbacks for OS environments that restrict symlinks, and ensure dry-run capabilities (`--dry-run`).
*   **Backup System:** Implement `backup.py` to zip or copy the registry state before destructive operations.

## Phase 4: API Integration & Frontend Wiring
*   **FastAPI Routes:** Create local API endpoints (`/api/registry`, `/api/skills`, `/api/sync`, `/api/execute`) that wrap the CLI/Core logic.
*   **Frontend Connection:** Update this React frontend to fetch real data from `http://127.0.0.1:8000` instead of using the simulated `constants.ts` and `geminiService.ts`.
*   **Execution Engine:** Replace the simulated Gemini execution with actual local subprocess calls (sandboxed) to run the bash/python scripts defined in the skills.

## Phase 5: Advanced Features & MCP
*   **Additional Adapters:** Build adapters for Claude Code, Gemini CLI, and custom agents.
*   **MCP Server:** Expose the registry operations (list skills, read skill, sync) via the Model Context Protocol so local LLMs can manage the registry autonomously.
*   **Testing:** Expand the `pytest` suite to cover all edge cases in file manipulation and symlink generation.
