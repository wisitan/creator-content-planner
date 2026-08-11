---
name: responsive-ui-guidelines
description: Architectural guidelines and patterns for building dual-layout Web Apps with distinct UI/UX for PC Desktop vs Mobile Devices.
---

# Responsive UI Guidelines (Mobile Device vs PC Desktop)

When building rich Single-Page Web Applications (SPAs) or web tools, PC Web and Mobile Web serve fundamentally different user contexts. Follow these architectural standards to ensure a premium experience on both desktop and mobile.

---

## 1. Core Principles

- **PC Desktop View**: Optimized for data density, keyboard/mouse interaction, wide screen space (Sidebar + Topbar + Multi-column Data Tables + 7-Column Calendar Grids).
- **Mobile View**: Optimized for thumb-zone ergonomics, touch targets (minimum 44x44px), vertical scrolling, stacked cards, bottom-sheet overlays, and bottom navigation.

---

## 2. Device Detection Strategy

Combine UserAgent testing with Window Media Queries for robust rendering control:

```javascript
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const userAgentCheck = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const screenCheck = window.innerWidth <= 768;
  return userAgentCheck || screenCheck;
}
```

---

## 3. Navigation Design Patterns

### PC Desktop:
- **Left Sidebar**: Permanent vertical sidebar showing logo, primary navigation links, user profile, and version string (`sidebar-footer`).
- **Topbar**: Search, notifications, primary action buttons (Export, Import, Sync).

### Mobile Device:
- **Hamburger Drawer Menu (3-Line Icon)**: Slide-out drawer menu for secondary links/settings that don't fit into the primary bar.
- **Bottom Navigation Bar**: Fixed bottom bar with 4-5 core items. If there are > 5 items, enable horizontal touch-scrolling (`overflow-x: auto; flex-wrap: nowrap;`).
- **Floating Action Button (FAB)**: Bottom right floating `+` button for quick record creation.

---

## 4. Component Adaptation (PC vs Mobile)

### A. Data Tables vs Mobile Cards
- **PC**: Render interactive `<table>` with fixed/sticky headers, drag-and-drop column ordering, inline editable cells, and multi-column sorting.
- **Mobile**: Hide `<table>` (`display: none !important`) and render vertical `.mobile-card-list`. Each card displays summary badges, primary title, cover thumbnail, and an "Edit in Modal" trigger.

### B. Calendar Views
- **PC**: Default to **Month View** (`cal-grid` 7-column layout) showing days of the month with truncated single-line item pills.
- **Mobile**: Default to **Day View** (`cal-day-view-container`) showing vertical detailed cards for the selected day, with a top date navigation bar (`◀ Date ▶` / `Today`).

---

## 5. CSS Scoping & Isolation

Use strict CSS class separation to avoid layout bleeding:

```css
/* Hide mobile-only elements on Desktop */
@media (min-width: 769px) {
  .mobile-card-list,
  .mobile-bottom-nav,
  .hamburger-menu-btn {
    display: none !important;
  }
}

/* Hide desktop-only elements on Mobile */
@media (max-width: 768px) {
  .sidebar,
  .desktop-table-wrapper {
    display: none !important;
  }
}
```

---

## 6. Modal & Overlay Behavior

- **PC**: Centered popup dialog with max-width (e.g. 600px - 900px), glassmorphism backdrop blur.
- **Mobile**: Bottom sheet overlay sliding up from the bottom (`border-top-left-radius: 16px; border-top-right-radius: 16px;`), full-width, with fixed bottom action buttons for easy thumb tapping.
