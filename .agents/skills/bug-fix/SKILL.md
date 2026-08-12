---
name: bug-fix
description: >-
  Use this skill when the user types "/bug-fix" or explicitly asks to investigate and fix a bug.
  This skill forces the agent to follow a strict pipeline (Reproduce -> Root Cause -> Ask if risky -> Fix -> Test -> Summary).
---

# Bug Fix Workflow

When the user triggers this skill (e.g., by typing `/bug-fix <Bug Description>`), you MUST execute the following pipeline strictly in order. Do not skip any steps.

## Pipeline Steps

### 1. Reproduce / Understand
*   Read the bug description carefully.
*   Identify which component or flow the bug occurs in.

### 2. Root Cause Analysis
*   Inspect the relevant code (Vanilla JS views, `store.js`, CSS).
*   Formulate a hypothesis for why the bug is happening.

### 3. Plan & Ask if risky
*   Create a step-by-step plan to fix the bug with minimal changes.
*   Evaluate the risk (Does this fix impact Google Drive sync or `localStorage` data models?).
*   **STOP** and present the root cause, the fix plan, and risk assessment to the user.
*   Wait for the user's explicit approval before writing the fix.

### 4. Implement
*   Write the code following the project guidelines.
*   Keep changes as localized as possible. Do not refactor unrelated code while fixing a bug.

### 5. Test
*   Review the code changes to ensure the fix resolves the original issue without introducing syntax errors or breaking existing features.

### 6. Review & Summary
*   Summarize the root cause and the fix applied.
*   Remind the user to run `git commit` or do it yourself if permitted.
