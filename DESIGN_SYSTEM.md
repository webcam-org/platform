# webcam.org - Design System

**Author:** Gemini
**Status:** In Progress

This document defines the visual and interaction design standards for the webcam.org platform, ensuring a consistent user experience across the website, mobile apps, and desktop application.

---

## 🎨 Logo

- **[ ] Logo design:** A clean, modern logo that combines a stylized camera lens with a shield or a community icon, representing both security and public sharing. It should avoid any resemblance to chat or social media logos.

---

## 🎨 Brand Colors

- **[ ] Primary Color:** `#1a73e8` (A strong, trustworthy blue)
- **[ ] Secondary Color:** `#f5f5f5` (A light, clean background color)
- **[ ] Accent Color:** `#34a853` (For success states, "online" indicators)
- **[ ] Error Color:** `#ea4335` (For error states, warnings)
- **[ ] Dark Background:** `#0b1020` (For dark mode and specific sections)

---

## ண்ட் Typography

- **[ ] Font Family:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (System fonts for native performance)
- **[ ] Headings:** `font-weight: 600;`
- **[ ] Body:** `font-weight: 400;`

---

## 🎨 Icon Library

- **[ ] Icon Style:** Material Design Icons (Filled style). They are clean, recognizable, and have a wide variety of options.

---

## 🎨 Button Styles

- **[ ] Primary Button:** Solid background (`#1a73e8`), white text. Used for the main call to action.
  - **Example:** `[Download for Windows (Free)]`
- **[ ] Secondary Button:** Outlined (`#1a73e8` border), blue text. Used for secondary actions.
  - **Example:** `[Browse Public Cams]`
- **[ ] Danger Button:** Solid background (`#ea4335`), white text. Used for destructive actions like "Delete".
  - **Example:** `[Delete Camera]`

---

## 🎨 Form Elements

- **[ ] Input Fields:** Light grey background (`#f5f5f5`), blue border on focus. Should have a clear label and placeholder text.
- **[ ] Toggles:** Blue when active, grey when inactive. Should have a clear label.
- **[ ] Dropdowns:** Standard system dropdowns with a custom arrow icon. Should have a clear label.

---

## 🎨 Card Designs

- **[ ] Camera Card:** White background, rounded corners, a subtle shadow. It should display the camera name, a thumbnail, and an online/offline status indicator (a green or red dot). The card should also have a settings icon (three dots) to open a context menu with options like "Edit", "Share", and "Delete".
- **[ ] Event Card:** Similar to the camera card, but with a timestamp and an icon representing the event type (e.g., a person icon for person detection, a running icon for motion detection). Clicking on the card should open the recorded video clip.

---

## 🗺️ Navigation Patterns

- **[ ] Website:** Top navigation bar with links to major sections.
- **[ ] Mobile App:** Bottom tab bar for primary navigation (e.g., Cameras, Public, Events, Settings).
- **[ ] Desktop App:** System tray icon with a context menu for quick actions.
