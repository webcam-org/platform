# webcam.org Desktop Client

Electron application that turns a Windows PC with a USB webcam into a webcam.org streaming node. The current build is a minimal shell that boots an Electron window and exercises the main ↔ renderer bridge.

## Getting Started

```bash
cd desktop-app
npm install
npm run dev
```

- `npm run dev` launches Electron for local development.
- `npm run package` builds unpacked artifacts for inspection.
- `npm run build` creates the signed Windows installer (`.exe`) via electron-builder.

## Project Structure

- `src/main.js` – Electron main process that creates the application window.
- `src/main/camera-manager.js` – Placeholder device enumeration that will be replaced with Media Foundation integration.
- `src/main/settings-store.js` – Persists user selections in the OS-specific Electron userData directory.
- `src/preload.js` – Secure bridge that exposes limited APIs to the renderer.
- `src/index.html` & `src/renderer.js` – Placeholder renderer UI that validates the preload bridge.
- `assets/` – Stores icons used for the main window, installer, and system tray.

## Next Steps

- Replace the placeholder UI with the camera onboarding flow and settings screens.
- Integrate USB webcam discovery via Media Foundation and replace the stub responses returned by `camera-manager`.
- Wire up IPC handlers for device control, recording, and backend communication.
- Flesh out system tray menu actions beyond open/quit and add richer status feedback.

## Testing USB Webcam Detection

- Launch the app with `npm run dev`.
- Grant camera permission when prompted so device labels become available.
- Use **Refresh Devices** if you plug a webcam in after the app starts.
- On non-Windows hosts or without camera permissions, the UI falls back to placeholder devices (noted inline).

## Desktop Behaviors

- The window hides to the system tray when minimized or closed; use the tray menu to restore or quit.
- The tray icon lives in `assets/tray.ico`; swap this once we have final artwork.
- Auto-launch on Windows is controlled by the settings toggle and uses Electron's `setLoginItemSettings`.

## Camera Preview

- Select a webcam from the list, then click **Test Camera** to start a muted preview.
- The preview uses `navigator.mediaDevices.getUserMedia` and requires running on a Windows machine with a functional USB webcam.
- Click **Stop Preview** to release the camera; previews auto-refresh if you switch devices while streaming.
- If access fails, the status text will include the browser error (e.g., permission denied, device in use).

## Settings Persistence

- Selecting a camera radio button saves `selectedCameraId` to `settings.json` under Electron's `userData` path.
- Toggling **Launch on system startup** immediately updates Windows login-item settings when available.
- **Choose Folder** opens a native directory picker and stores the chosen `recordingDirectory`; the renderer reflects the current value on load.
- The renderer always fetches the latest settings on load, so changes survive restarts.
