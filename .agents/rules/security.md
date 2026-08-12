---
description: "Security rules regarding vulnerabilities and credential management."
---

# Security Rules

## Cross-Site Scripting (XSS) Prevention
Since the application relies heavily on `element.innerHTML` for DOM updates:

*   **DO** sanitize user-generated input (like notes, descriptions, names) before rendering them into `innerHTML`.
*   **DON'T** directly inject raw object properties directly into the DOM if they can be modified by the user without escaping HTML characters.

## Secret and Credential Management
*   **Never** expose secrets, API keys, or OAuth credentials in the source code.
*   **DO** ensure that the Google Client ID remains a user-configurable setting stored in `localStorage` rather than hardcoding personal Client IDs into the repo.
*   **DON'T** commit any `.env` files or backup JSON files (`creator-content-planner-backup.json`) to the Git repository. Ensure they are listed in `.gitignore`.
