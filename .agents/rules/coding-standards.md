---
description: "Coding standards, code safety, and AI-assisted development practices."
---

# Coding Standards

## Minimal & Safe Changes
To keep the codebase maintainable and prevent regressions during AI-assisted vibe coding:

*   **DO** require minimal changes when implementing features. Isolate your edits to the specific component or function involved.
*   **DO** require preserving existing behavior unless explicitly requested by the user. If an edge case works a certain way, leave it alone.
*   **DO** require validation after changes. Always confirm that data saves correctly and UI renders as expected without console errors.

## Code Quality
*   **DO** use ES6 modules (`import`/`export`) for structuring code.
*   **DON'T** create monolithic files. If a view or component exceeds 300-500 lines, consider breaking it into logical sub-components if possible.
*   **DON'T** write unnecessary duplicate logic. Utilize functions in `utils.js` (e.g., `uid()`, `debounce()`) instead of rewriting them.
*   **DON'T** leave debugging `console.log()` statements in production code unless they are critical warnings or errors.
