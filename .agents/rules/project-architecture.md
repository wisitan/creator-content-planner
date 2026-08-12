---
description: "Core architectural boundaries and structural guidelines for the Creator Content Planner project."
---

# Project Architecture Rules

## Architectural Boundaries
This project currently operates as a Vanilla JavaScript Single Page Application (SPA) as documented in `docs/architecture/architecture.md`.

*   **UI Layer**: Modular Vanilla JS view functions (e.g., `dashboard.js`, `content.js`) that inject HTML into the `#main-content` container.
*   **State Layer**: Centralized `Store` class (`store.js`) acts as the single source of truth.
*   **Routing Layer**: Hash-based router (`#dashboard`) managed in `main.js`.

## Guidelines

*   **DO** strictly follow the architecture documented in `docs/architecture/architecture.md`.
*   **DO** keep concerns separated. Views should handle DOM updates; the `Store` should handle data manipulation.
*   **DO** check existing components (e.g., `editable-table.js`, `modal.js`, `toast.js`) before creating new ones to avoid reinventing the wheel.
*   **DON'T** introduce heavy frontend frameworks (React, Vue, Svelte) or virtual DOM logic until a formal migration roadmap is explicitly approved.
*   **DON'T** modify application code when the user strictly requests documentation or structural audits.
