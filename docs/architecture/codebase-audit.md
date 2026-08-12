# Codebase Architecture Audit & AI-Assisted Migration Plan

## A. Current Architecture
*   **Core Stack**: Vanilla JavaScript (ES6 Modules), CSS3, HTML5.
*   **Build Tool**: Vite with `vite-plugin-singlefile` (compiles to a single `index.html`).
*   **State Management**: Centralized custom `Store` class (extending an `Emitter` pattern). Data is loaded from and saved to `localStorage` synchronously.
*   **Routing**: Custom Hash-based router (`main.js`) handling navigation between modular view functions.
*   **UI/Component Model**: Manual DOM manipulation and string template literals (`innerHTML`). Views are functions that clear and reconstruct DOM elements.
*   **Google Drive Sync**: Client-side implicit OAuth via Google Identity Services (GSI). Stores a JSON snapshot (`creator-content-planner-backup.json`). Uses a custom tombstone-based Two-Way merge algorithm.
*   **Storage**: Browser `localStorage` (limited to ~5MB).

## B. Recommended Architecture (For AI-Assisted Scalability)
To achieve the vision of a "Creator OS" with 100k+ users and to make the codebase highly compatible with AI coding agents:
*   **Core Stack**: React or Vue 3 + TypeScript. (TypeScript is critical for AI agents to understand data structures without hallucinating properties).
*   **Build Tool**: Vite (standard multi-file build).
*   **State Management**: Zustand (React) or Pinia (Vue) for reactive state.
*   **Local Storage/Persistence**: **IndexedDB** (via Dexie.js or LocalForage). This bypasses the 5MB `localStorage` limit, allowing massive content histories and offline image caching.
*   **Sync Architecture**: CRDT-based offline-first sync (e.g., **Yjs** or **Automerge**) backed by Google Drive or a lightweight backend, replacing the custom tombstone logic which is error-prone at scale.
*   **UI Framework**: TailwindCSS + Headless UI components (e.g., shadcn/ui or Radix). AI agents excel at writing Tailwind and utilizing standardized component libraries.

## C. Critical Problems
1.  **`localStorage` Quota Limit**: `localStorage` has a strict ~5MB limit. As users add more content, affiliate links, and text, the app will suddenly fail to save, causing catastrophic data loss.
2.  **XSS Vulnerability**: Extensive use of `element.innerHTML = \`<string>\`` without sanitization. If user data contains script tags, it will execute.
3.  **Performance Bottleneck**: `store.js` writes the *entire* JSON string to `localStorage` synchronously on every keystroke/change. UI components re-render entirely by trashing and rebuilding DOM nodes.
4.  **AI Code Maintainability**: Large files (e.g., `editable-table.js` is 65KB, `store.js` is 52KB) exceed optimal context windows for AI reasoning. AI struggles to precisely edit massive files using string templates without breaking surrounding HTML/JS.

## D. Problems That Can Wait
1.  **Multi-user Collaboration**: The app is designed for single creators with their own Google Drive. Real-time collaboration isn't immediately necessary.
2.  **Advanced Analytics**: Complex data visualizations can wait until the core data infrastructure is migrated.
3.  **Backend Services**: Staying client-side (Local + GDrive) keeps costs at $0. A traditional database backend can wait until a monetization strategy necessitates it.

## E. Recommended Folder Structure
Restructure the app using a **Feature-Driven Architecture**. AI agents work best when all files related to a feature (UI, state, types) are colocated.

```
/src
  /assets           # Static images, icons
  /components       # Generic, reusable UI (Buttons, Modals, Inputs)
  /features         # Feature-based modules
    /content        # Content planner logic, types, UI
    /products       # Affiliate products logic, types, UI
    /sync           # Google drive & sync logic
    /settings       # App settings
  /hooks            # Global React/Vue hooks (e.g., useTheme)
  /store            # Global state setup (Zustand/Pinia)
  /utils            # Helpers (date formatting, ID generation)
  /types            # Shared TypeScript interfaces
  main.ts
  App.tsx           # App Shell & Routing
```

## F. Recommended Project Rules for AI Coding Agents (`.agents/rules`)
1.  **Strict TypeScript**: Always define interfaces for data models before implementing logic.
2.  **Component Isolation**: No UI component file should exceed 200 lines. Break down into sub-components.
3.  **No `innerHTML`**: Never use `innerHTML` or `v-html`/`dangerouslySetInnerHTML`. Use declarative rendering.
4.  **Atomic Commits**: Agents must implement one feature or fix one bug per commit.
5.  **State Separation**: UI components must not contain complex business logic. Delegate logic to stores/hooks.

## G. Recommended Reusable Workflows
1.  **Data Migration Workflow**: A standard pattern to migrate local schemas from `v1 -> v2 -> v3` automatically on app load.
2.  **Sync Conflict Resolution Workflow**: A UI flow to let the user manually resolve conflicts if the automated CRDT merge detects an unresolvable state.
3.  **Export/Backup Workflow**: Scheduled background JSON exports to a fallback `.backup` file in Drive.

## H. Recommended Subagents (For Multi-Agent Development)
1.  **`UI-Architect`**: Specialized in creating responsive Tailwind components and ensuring accessibility.
2.  **`Data-Engineer`**: Specialized in IndexedDB schema design, query optimization, and state management.
3.  **`QA-Agent`**: Automatically writes unit tests (Vitest) and end-to-end tests (Playwright) for new features.

## I. Migration/Refactoring Roadmap
*   **Phase 1: Tooling & Typing**: Introduce TypeScript and Vite (multi-file). Create `.d.ts` definitions for the existing data model.
*   **Phase 2: Storage Migration**: Replace `localStorage` with `IndexedDB` (Dexie.js). Write a migration script that moves `ccp_data_v1` to IndexedDB on first load.
*   **Phase 3: UI Framework Adoption**: Incrementally rewrite views into React/Vue components. Start with simple views like `Settings`, move to `Content Planner` last.
*   **Phase 4: Sync Upgrade**: Refactor Google Drive sync to use granular file updates or a CRDT model, removing the massive monolithic JSON payload.

## J. Risks if we scale from 100 → 10,000 → 100,000 users
*   **100 Users**: Current app is fine, though heavy users will hit the 5MB `localStorage` limit quickly.
*   **10,000 Users**: Google Drive API rate limits (quota constraints per project/client ID) will be hit. The app uses implicit flow which might face stricter browser cookie/ITP restrictions. Data loss complaints will surge due to sync conflicts in the custom merge logic.
*   **100,000 Users**: The single JSON file approach will cause unacceptably slow load/save times on mobile devices. A transition to a true backend (e.g., Firebase, Supabase) or robust local-first db with differential sync (e.g., PowerSync) will be absolutely mandatory.
