# Architecture Overview: Creator Content Planner

## Application Type
*   **Type**: Single Page Application (SPA)
*   **Design Pattern**: Component-based UI logic (without a reactive framework)
*   **Rendering**: Client-side rendering (CSR) using explicit DOM manipulation (`innerHTML` and event listeners).

## Technology Stack
*   **Frontend**: Vanilla JavaScript (ES6 Modules)
*   **Styling**: Vanilla CSS (`style.css`), utilizing CSS variables for theming.
*   **Build Tool**: Vite (configured to output a single HTML file via `vite-plugin-singlefile`).
*   **Deployment**: Static file hosting (HTML/JS/CSS).

## Data Architecture
*   **State Container**: A centralized `Store` singleton (in `store.js`) acting as the single source of truth.
*   **Reactivity**: Custom Event Emitter (`Emitter` class) used by the `Store` to trigger UI updates when data changes.
*   **Storage Tier**: Local browser storage (`localStorage`) using the key `ccp_data_v1`.

## Sync Architecture (Google Drive)
*   **Authentication**: Google Identity Services (implicit grant flow).
*   **Storage Strategy**: App data is serialized to JSON and backed up as a single file (`creator-content-planner-backup.json`) in the user's personal Google Drive.
*   **Sync Mechanism**: "Smart Two-Way Sync" algorithm using tombstones (`deletedItems`) and `updatedAt` timestamps.

---

# Architecture Decision Records (ADRs)

Documenting the technical choices made to support the **"Validate → Stabilize → Grow → Scale"** strategy. These records explain *why* we accepted current limitations for the sake of speed and simplicity.

## ADR 001: Keep `localStorage` for MVP
*   **Decision**: Use `localStorage` instead of IndexedDB.
*   **Reason**: Zero setup, simple synchronous API. Extremely fast for building the MVP. It is sufficient for an early text-based planner.
*   **Alternatives considered**: IndexedDB (via Dexie.js) - rejected for now due to asynchronous complexity overhead during rapid prototyping.
*   **When to revisit**: When average data payload exceeds 3MB or image caching is required.
*   **Current status**: Active.

## ADR 002: Do not use CRDT currently
*   **Decision**: Use custom Timestamp/Tombstone merge instead of a CRDT library (e.g., Yjs, Automerge).
*   **Reason**: The product is primarily single-user. Timestamp merge resolves 99% of multi-device use cases without the massive bundle size and algorithmic complexity of CRDTs.
*   **Alternatives considered**: Yjs, Automerge.
*   **When to revisit**: If multi-user collaborative editing is introduced.
*   **Current status**: Active.

## ADR 003: Keep Vanilla JS for current stage
*   **Decision**: Build the UI manually with Vanilla JS and `innerHTML`.
*   **Reason**: Zero build-step complexity (besides single-file bundling), incredibly fast iteration speed. AI agents handle Vanilla JS adequately for the current scale.
*   **Alternatives considered**: React, Vue, Svelte.
*   **When to revisit**: When component file sizes become unmaintainable or state-sync bugs become frequent.
*   **Current status**: Active.

## ADR 004: Keep Client-Side Only Architecture
*   **Decision**: No backend database. Data is stored on the device and backed up to the user's Google Drive.
*   **Reason**: Keeps server costs at $0. Empowers users by giving them ownership of their data.
*   **Alternatives considered**: Firebase, Supabase, PostgreSQL.
*   **When to revisit**: When the app introduces a monetization model that requires server-side validation or community features (e.g., template sharing).
*   **Current status**: Active.
