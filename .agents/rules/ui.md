---
description: "Guidelines for User Interface, styling, and responsive design."
---

# UI and Responsive Design

## Desktop and Mobile Cohesion
The app serves both Desktop (Sidebar Nav) and Mobile (Bottom Nav) users.

*   **DO** ensure both navigation systems (`sidebar-nav` and `mobile-bottom-nav`) are correctly updated when adding new routes.
*   **DO** test styling on both small mobile viewports and large desktop screens. Use standard CSS media queries in `style.css`.
*   **DO** rely on CSS variables (custom properties) defined in `:root` to support dynamic Light/Dark themes.

## Component Rendering
*   **DO** use literal string templates for component rendering, but keep it clean.
*   **DON'T** introduce external UI CSS frameworks (like Bootstrap, Tailwind, or Material UI) unless explicitly approved. Rely on the custom styles in `style.css`.
*   **DON'T** bind DOM events globally if they can be bound directly to the component element when rendered (to prevent memory leaks on view switching).
