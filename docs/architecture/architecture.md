# Architecture Overview: Creator Content Planner

## Application Type
*   **Type**: Single Page Application (SPA)
*   **Design Pattern**: Component-based UI logic (but without a reactive framework)
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
*   **Data Models**: Includes Products, Content (Planner), Channel Tracker, Sponsors, Brand Settings, and App Settings.

## Sync Architecture (Google Drive)
*   **Authentication**: Google Identity Services (implicit grant flow).
*   **Storage Strategy**: App data is serialized to JSON and backed up as a single file (`creator-content-planner-backup.json`) in the user's personal Google Drive.
*   **Sync Mechanism**: "Smart Two-Way Sync" algorithm that uses:
    *   **Tombstones**: Tracking deleted items (`deletedItems` array) to prevent deleted data from reappearing across devices.
    *   **Timestamp Merge**: Resolving conflicts using `updatedAt` timestamps at the record level.

## Key Subsystems
1.  **Router**: Hash-based router (`#dashboard`, `#content`) that mounts/unmounts views dynamically.
2.  **Editable Table Component**: A custom, complex Vanilla JS data grid (`editable-table.js`) supporting inline editing, sorting, and row selection.
3.  **Data Export/Import**: Mechanisms to download the entire `store.js` state as a JSON file and rehydrate it, acting as a manual backup system.
