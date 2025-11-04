# Camera List Screen

**Layout:**

- A vertical list of camera cards.
- A floating action button (FAB) in the bottom right corner to add a new camera.
- A search bar at the top of the screen to filter cameras by name.

**Components:**

- **Camera Card:**
  - **Thumbnail:** A preview image of the camera feed. If the camera is offline, a placeholder image will be displayed.
  - **Camera Name:** The name of the camera.
  - **Status Indicator:** A green dot for online cameras, a red dot for offline cameras.
  - **Settings Icon:** A three-dot icon that opens a context menu with options for "Edit", "Share", and "Delete".

**Interactions:**

- **Tap on a camera card:** Navigates to the Live Camera View screen for that camera.
- **Swipe left on a camera card:** Reveals "Edit" and "Delete" buttons.
- **Tap on the FAB:** Opens the "Add Camera" screen.
- **Enter text in the search bar:** Filters the list of cameras in real-time.