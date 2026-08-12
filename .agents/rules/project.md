---
description: "Core project rules covering coding standards and security practices."
---

# Project Guidelines

## Minimal & Safe Changes
To keep the codebase maintainable and prevent regressions during AI-assisted vibe coding:
*   **DO** require minimal changes when implementing features. Isolate edits to the specific component or function involved.
*   **DO** require preserving existing behavior unless explicitly requested by the user. If an edge case works a certain way, leave it alone.
*   **DON'T** rewrite existing systems unless explicitly requested.

## Security & XSS Prevention
Since the application relies heavily on `element.innerHTML` for DOM updates:
*   **DO** sanitize user-generated input (like notes, descriptions, names) before rendering them into `innerHTML`.
*   **DON'T** directly inject raw object properties directly into the DOM if they can be modified by the user without escaping HTML characters.

## Secret and Credential Management
*   **Never** expose secrets, API keys, or OAuth credentials in the source code.
*   **DO** ensure that the Google Client ID remains a user-configurable setting stored in `localStorage` rather than hardcoding personal Client IDs into the repo.
*   **DON'T** commit any `.env` files or backup JSON files (`creator-content-planner-backup.json`) to the Git repository.
