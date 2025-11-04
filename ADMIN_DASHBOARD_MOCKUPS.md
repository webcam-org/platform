# webcam.org - Admin Dashboard Mockups

**Author:** Gemini
**Status:** In Progress
**Collaborator:** Claude

This document provides detailed mockups for the admin dashboard of the webcam.org moderation system. These mockups are based on the `ADMIN_DASHBOARD_DESIGN.md` document.

---

## 📊 Dashboard Overview

**Layout:**

- A sidebar on the left with navigation links for "Dashboard", "Camera Queue", "Reports", and "User Management".
- The main content area on the right will display the selected view.

**Mockup:**

```
+--------------------------------------------------------------------+
| webcam.org Admin                                                   |
+--------------------------------------------------------------------+
|           |                                                        |
| Dashboard | <h1>Dashboard</h1>                                      |
|           |                                                        |
| Camera    |   +----------------------+  +-----------------------+  |
| Queue     |   | New Cameras          |  | Open Reports          |  |
|           |   |                      |  |                       |  |
| Reports   |   |          5           |  |           3           |  |
|           |   +----------------------+  +-----------------------+  |
| User      |                                                        |
| Management|                                                        |
|           | <h2>Recently Approved</h2>                                |
|           | <ul>                                                     |
|           |   <li>Camera A</li>                                      |
|           |   <li>Camera B</li>                                      |
|           | </ul>                                                    |
|           |                                                        |
+--------------------------------------------------------------------+
```

---

## 📷 Camera Review Screen

**Layout:**

- The camera feed will be displayed prominently on the left.
- On the right, there will be a column with the camera details, user information, and the moderation checklist.
- Action buttons ("Approve", "Reject", "Request Changes") will be at the bottom of the right column.

**Mockup:**

```
+--------------------------------------------------------------------+
| Review Camera: Camera C                                            |
+--------------------------------------------------------------------+
|                                     |                              |
|  +--------------------------------+   | Camera Details:              |
|  |                                |   | - Name: Camera C             |
|  |      Live Video Feed           |   | - Location: 123 Main St      |
|  |                                |   |                              |
|  +--------------------------------+   | User: user123                |
|                                     |                              |
|                                     | Moderation Checklist:        |
|                                     | [x] Public Space             |
|                                     | [x] No Privacy Invasion      |
|                                     | [ ] Inappropriate Content    |
|                                     |                              |
|                                     | +----------+ +---------+     |
|                                     | | Approve  | | Reject  |     |
|                                     | +----------+ +---------+     |
|                                     |                              |
+--------------------------------------------------------------------+
```

---

## 🚩 Report Handling Screen

**Layout:**

- Similar to the camera review screen, with the camera feed on the left and the report details on the right.
- Action buttons ("Dismiss Report", "Remove Camera", "Ban User") will be at the bottom of the right column.

**Mockup:**

```
+--------------------------------------------------------------------+
| Handle Report for Camera D                                         |
+--------------------------------------------------------------------+
|                                     |                              |
|  +--------------------------------+   | Report Details:              |
|  |                                |   | - Reason: Privacy Violation  |
|  |      Live Video Feed           |   | - Comment: "Camera is..."    |
|  |                                |   |                              |
|  +--------------------------------+   | User: user456                |
|                                     |                              |
|                                     | +----------------+           |
|                                     | | Dismiss Report |           |
|                                     | +----------------+           |
|                                     | | Remove Camera  |           |
|                                     | +----------------+           |
|                                     | | Ban User       |           |
|                                     | +----------------+           |
|                                     |                              |
+--------------------------------------------------------------------+
```
