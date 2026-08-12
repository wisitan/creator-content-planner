---
name: code-review
description: >-
  Use this skill when the user types "/code-review" or asks to review current changes.
  This skill performs a comprehensive code review against project guidelines without modifying any code,
  and returns the findings grouped by priority (P0, P1, P2).
---

# Code Review Workflow

When the user triggers this skill (e.g., by typing `/code-review`), you MUST perform a comprehensive review of their current uncommitted changes or recent code modifications.

## Rules of Engagement
*   **DO NOT modify any code.** This is a read-only audit.
*   **DO NOT execute commands that alter state.**

## Review Criteria
Analyze the changes against the following aspects, referring to the project's `.agents/rules` when applicable:

1.  **Architecture**: Does it adhere to the Vanilla JS/Store Singleton patterns? Does it violate boundaries?
2.  **Bugs**: Are there logical errors, syntax errors, or unhandled exceptions?
3.  **Regression Risk**: Could this change break existing features (e.g., routing, data loading)?
4.  **Security**: Are there XSS vulnerabilities (e.g., unsafe `innerHTML` usage)? Are credentials exposed?
5.  **Performance**: Are there potential memory leaks, excessive re-renders, or synchronous bottlenecks?
6.  **Responsive UI**: Will it break on mobile? Does it use the correct CSS variables and media queries?
7.  **Google Drive sync**: Are timestamps (`updatedAt`) updated correctly? Are tombstones created upon deletion?
8.  **Maintainability**: Is the code overly complex? Should a large function be split?

## Return Format
Format your response exactly using the following priority groups. If there are no issues for a particular priority, state "None found."

### P0 Critical
*Immediate blockers. Bugs, security vulnerabilities, or severe architectural violations (like bypassing the data store or breaking Drive sync).*

### P1 Important
*High-priority improvements. Performance bottlenecks, regression risks, missing timestamps, or UI responsiveness issues.*

### P2 Nice to have
*Suggestions for better maintainability, code cleanliness, or minor optimizations.*
