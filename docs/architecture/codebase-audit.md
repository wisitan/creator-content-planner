# Codebase Architecture Audit

This audit follows the principle of **"Validate → Stabilize → Grow → Scale"**. Recommendations avoid premature optimization and require measurable triggers before implementation.

## Priority Legend
- **P0** = Must fix now
- **P1** = Fix before growth
- **P2** = Improve when justified
- **P3** = Future exploration

---

## Finding 1: Unsanitized DOM Insertion (XSS Risk)

### Current State
The application uses template literals and `element.innerHTML` extensively to render UI components based on user data.

### Risk
If user-provided data (e.g., notes, descriptions) contains `<script>` tags or malicious HTML, it will execute in the browser.

### Impact
Execution of arbitrary JavaScript, potentially leading to unauthorized access to the user's Google Drive backup or local state.

### Trigger
Immediate. Security vulnerabilities must be addressed regardless of the current scale.

### Recommendation
Implement a lightweight HTML sanitization utility (e.g., DOMPurify) and wrap all user inputs before passing them to `innerHTML`, or use `textContent` where applicable.

### Priority
P0 (Must fix now)

### Decision
**Do now**

---

## Finding 2: `localStorage` Size Limitations

### Current State
All application state (`products`, `content`, etc.) is serialized to JSON and saved synchronously to `localStorage`.

### Risk
`localStorage` has a strict quota (usually around 5MB). Heavy users who add thousands of items or large text blocks will hit this limit.

### Impact
When the limit is hit, `QuotaExceededError` is thrown, causing catastrophic data loss for any unsaved changes since the last Google Drive backup.

### Trigger
When average active user payload exceeds 3MB, or when users request features that require local media/image caching.

### Recommendation
Migrate the local storage layer to **IndexedDB** using a wrapper like `localForage` or `Dexie.js`. This provides asynchronous, practically unlimited storage for text.

### Priority
P2 (Improve when justified)

### Decision
**Monitor**

---

## Finding 3: Component Complexity (Vanilla JS)

### Current State
The app uses Vanilla JS without a reactive framework. Files like `editable-table.js` and `store.js` are large (65KB and 52KB respectively).

### Risk
Manual DOM manipulation scales poorly in complexity. As features are added, tracking state changes across the DOM becomes prone to "ghost bugs" and memory leaks.

### Impact
Slower feature development velocity, increased bug rates, and difficulty for AI agents (or new human developers) to safely modify complex files without regressions.

### Trigger
When the frequency of UI state synchronization bugs increases, or when a major structural overhaul of the Content Planner view is requested.

### Recommendation
Incrementally migrate the UI layer to a modern framework (React/TypeScript or Vue).

### Priority
P2 (Improve when justified)

### Decision
**Defer**

---

## Finding 4: Tombstone Sync Architecture

### Current State
The app syncs with Google Drive using a custom "Smart Two-Way Sync" algorithm based on `updatedAt` timestamps and a `deletedItems` array (tombstones).

### Risk
If the user base grows heavily, edge cases in offline conflict resolution (e.g., editing the same field on two devices simultaneously offline) will result in data overwriting based purely on the latest timestamp.

### Impact
Silent data loss of specific field edits for power users operating across multiple devices.

### Trigger
When the app pivots to support real-time collaborative editing between multiple users, or if user support tickets regarding sync conflicts exceed 1% of the active user base.

### Recommendation
Implement a field-level merge strategy or adopt a CRDT library (like Yjs or Automerge).

### Priority
P3 (Future exploration)

### Decision
**Defer**

---

## Finding 5: Single JSON Backup File

### Current State
The entire state is uploaded and downloaded from Google Drive as a single monolithic JSON file (`creator-content-planner-backup.json`).

### Risk
As user data grows, the upload/download time and memory consumption on mobile devices will degrade.

### Impact
Slow sync times and potential timeout errors on slow networks.

### Trigger
When the average backup file size exceeds 5MB or sync duration exceeds 3 seconds on mobile networks.

### Recommendation
Transition to a delta-sync model, granular file updates, or a true backend database (e.g., Firebase, Supabase) if monetization supports it.

### Priority
P3 (Future exploration)

### Decision
**Defer**
