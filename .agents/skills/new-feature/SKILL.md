---
name: new-feature
description: >-
  Use this skill when the user types "/new-feature" or explicitly asks to start the new feature workflow.
  This skill forces the agent to follow a strict pipeline (Inspect -> Plan -> Ask if risky -> Implement -> Test -> Review -> Summary) for adding any new features.
---

# New Feature Workflow

When the user triggers this skill (e.g., by typing `/new-feature <Description>`), you MUST execute the following pipeline strictly in order. Do not skip any steps.

## Pipeline Steps

### 1. Requirement
*   Read the user's description of the feature carefully.
*   If the requirement is ambiguous, immediately stop and ask the user clarifying questions.

### 2. Inspect
*   Read the architecture rules in `.agents/rules/project-architecture.md`.
*   Inspect the relevant data models in `src/store.js`.
*   Search for existing UI components that can be reused (e.g., `modal.js`, `toast.js`).
*   Check existing notification or related code if applicable.

### 3. Plan
*   Create a step-by-step implementation plan.
*   The plan must include: Files to create, files to modify, and how data will be saved.

### 4. Ask if risky
*   Evaluate the risk of the plan (e.g., Does it change `localStorage` structure? Does it impact Google Drive Sync?).
*   **STOP** and present the plan and risk assessment to the user.
*   Wait for the user's explicit approval before proceeding to implementation.

### 5. Implement
*   Write the code following the `.agents/rules/coding-standards.md`.
*   Make minimal changes. Preserve existing behavior.
*   If changing data structures, bump `updatedAt` as required by the sync rules.

### 6. Test
*   Review your own code changes to ensure there are no syntax errors.
*   Verify that you haven't introduced any XSS vulnerabilities (per `security.md`).

### 7. Review & Summary
*   Provide a clear summary to the user explaining exactly what was changed and how to test it in the browser.
*   Remind the user to run `git commit` or do it yourself if permitted.
