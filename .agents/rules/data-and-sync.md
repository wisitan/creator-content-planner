---
description: "Guidelines for State Management and Google Drive Sync architecture."
---

# Data and Sync

## State Management (`store.js`)
*   **DO** use the `Store` singleton for ALL state reads and writes.
*   **DO** always fire `this._changed('areaName')` when modifying data in the store to trigger persistence and UI updates.
*   **DON'T** write data directly to `localStorage` from view files. All persistence must funnel through `store.js`.

## Google Drive Sync (Critical Subsystem)
The Google Drive sync algorithm ("Smart Two-Way Sync") is a critical subsystem. It relies on a tombstone and timestamp-based merge strategy.

*   **DO** strictly bump the `updatedAt` timestamp (ISO string format) for every record modification. The Two-Way Sync depends on this to resolve conflicts.
*   **DO** properly utilize the `_trackDelete(id, type)` method when deleting items. This creates a tombstone (`deletedItems` array) essential for ensuring items deleted locally are also deleted on the cloud.
*   **DON'T** modify the logic in `google-drive.js` lightly. Any change to `mergeTwoWayData` can cause catastrophic data loss or duplication across user devices.
