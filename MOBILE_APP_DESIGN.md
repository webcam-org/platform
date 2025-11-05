# webcam.org - Mobile App Design & UX

**Author:** Gemini

This document outlines the design and user experience for the webcam.org mobile app.

---

## 📱 Screen Designs

### Login/Signup Screens

**Layout:**

- **Login Screen:** App logo at the top, followed by email and password fields. A "Forgot Password?" link below the password field. A primary "Log In" button at the bottom, and a secondary "Don't have an account? Sign Up" link.
- **Signup Screen:** App logo at the top, followed by fields for username, email, and password. A checkbox to agree to the Terms of Service and Privacy Policy. A primary "Sign Up" button at the bottom.

**Components:**

- **Text Fields:** Standard text input fields with clear labels and placeholder text.
- **Buttons:** Primary and secondary buttons as defined in the design system.

**Interactions:**

- **Tap on "Log In" or "Sign Up":** Validates the form and sends the data to the backend.
- **Tap on "Forgot Password?":** Navigates to a password reset screen.
- **Tap on "Sign Up" link:** Navigates to the Signup Screen.

### Camera List Screen

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

### Live Camera View

**Layout:**

- The video feed will take up the majority of the screen.
- A timeline of recent events will be displayed below the video feed.
- Controls for PTZ, snapshot, and recording will be overlaid on the video and will auto-hide.

**Components:**

- **Video Player:** Displays the live video feed from the camera.
- **PTZ Controls:** A directional pad for pan and tilt, and a slider for zoom.
- **Action Buttons:** Buttons for taking a snapshot, recording a clip, and two-way audio.
- **Event Timeline:** A horizontally scrollable timeline of recent events. Each event will be represented by a thumbnail.

**Interactions:**

- **Tap on the video player:** Toggles the visibility of the controls.
- **Use the PTZ controls:** Moves the camera in the selected direction.
- **Tap on the snapshot button:** Saves a snapshot of the current video frame to the user's device.
- **Tap and hold the record button:** Records a video clip for as long as the button is held down.
- **Tap on an event in the timeline:** Jumps to the recorded video of that event.

### Settings Screen

**Layout:**

- A list of settings, grouped into sections: "Account", "Notifications", and "App Settings".

**Components:**

- **Account Section:**
  - "Change Password" option.
  - "Log Out" button.
- **Notifications Section:**
  - A toggle to enable or disable all notifications.
  - An option to choose a notification sound.
- **App Settings Section:**
  - A toggle for dark mode.
  - A button to clear the app's cache.

**Interactions:**

- **Tap on "Change Password":** Navigates to a screen where the user can change their password.
- **Tap on "Log Out":** Logs the user out of the app and returns them to the Login screen.
- **Toggle notifications:** Enables or disables push notifications.
- **Tap on "Choose notification sound":** Opens a system dialog to select a notification sound.
- **Toggle dark mode:** Switches the app between light and dark themes.
- **Tap on "Clear cache":** Clears the app's cached data.

## 🌊 UX Flows

### Onboarding Flow

1.  **Welcome Screens:** A series of 3-4 screens that highlight the key benefits of the app (privacy, self-hosting, community).
2.  **Permissions:** The app will request permissions for notifications and camera access, with a clear explanation for why each permission is needed.
3.  **Add First Camera:** The user will be guided through the process of adding their first camera, with options for scanning a QR code or manual entry.

### PTZ Controls Flow

1.  **Accessing Controls:** In the Live Camera View, the user can tap the screen to reveal the PTZ controls.
2.  **Pan and Tilt:** The user can use a directional pad to pan and tilt the camera.
3.  **Zoom:** The user can use a slider to zoom in and out.

### Two-Way Audio Flow

1.  **Initiating Audio:** In the Live Camera View, the user can tap a microphone icon to initiate two-way audio.
2.  **Push-to-Talk:** The user will press and hold a "Talk" button to speak. When the button is released, the microphone will be muted.

## ✍️ App Copy

### App Store Listing

- **Title:** webcam.org - Your Cameras. Your Privacy.
- **Subtitle:** Self-hosted security cameras with local AI.
- **Description:** Take back control of your security cameras with webcam.org, the free and open-source app that puts your privacy first. No monthly fees, no corporate surveillance. Your cameras, your data, your rules.

### Error Messages

- **Camera Offline:** "This camera is currently offline. Please check the camera's power and network connection."
- **No Internet:** "No internet connection. Please connect to the internet to view your cameras."
- **Incorrect Credentials:** "Incorrect username or password. Please try again."

### Button Labels

- **Primary Actions:** "Log In", "Sign Up", "Add Camera", "Save"
- **Secondary Actions:** "Cancel", "Forgot Password?", "Edit"
- **Destructive Actions:** "Delete", "Log Out"

## 🎨 Visual Design

- **Color Palette:** The color palette will be based on the `DESIGN_SYSTEM.md` file. The primary color will be blue (`#1a73e8`), with a light grey background (`#f5f5f5`) for the light theme and a dark blue background (`#0b1020`) for the dark theme.
- **Typography:** The typography will be based on the `DESIGN_SYSTEM.md` file, using system fonts for a native look and feel.
- **Icons:** The icons will be from the Material Design Icons library, as specified in the `DESIGN_SYSTEM.md` file.
- **Dark Mode:** The app will have a dark mode variant for all screens, using a dark blue background and light-colored text.
