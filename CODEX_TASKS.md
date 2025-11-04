# CODEX - Windows Desktop App & Mobile Implementation

**Your focus:** Windows desktop app for USB webcams + Mobile app UI implementation

---

## 🖥️ PRIORITY: Windows Desktop App (Electron)

### Why This Matters
User feedback: "nobody has IP cameras lol" - need Windows app for USB webcams to reach mainstream users.

### Task 1: Electron App Setup
```
/var/www/webcam.org/desktop-app/
├── main.js              # Electron main process
├── preload.js           # Context bridge
├── renderer/
│   ├── index.html       # Main window
│   ├── settings.html    # Settings window
│   └── css/
│       └── style.css
├── package.json
└── README.md
```

**Dependencies needed:**
- `electron`
- `electron-builder` (for creating .exe installer)

**Start with:**
1. Create basic window that shows "Hello World"
2. System tray integration (minimize to tray)
3. Auto-start on Windows boot

**Status (Codex):**
- [x] Electron shell scaffolded with tray + hide-on-close/minimize behavior.
- [x] Windows auto-start toggle wired via `setLoginItemSettings`.
- [x] `electron-builder` config/scaffolding committed (build pending actual Windows run).
- [ ] Validate installer output on a Windows host.

### Task 2: USB Webcam Detection (Windows)

Use Windows MediaDevices API:

```javascript
// In renderer process
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    // Show list of cameras to user
  });
```

**Create UI for:**
- Dropdown to select webcam
- "Test Camera" button to show preview
- Camera name/ID display

**Status (Codex):**
- [x] Renderer enumerates `navigator.mediaDevices` webcams with permission prompt.
- [x] Selection persists to settings; preview start/stop wired with `getUserMedia`.
- [ ] Confirm detection on Windows hardware and implement Media Foundation fallbacks if needed.

### Task 3: Video Recording & Streaming

**Features needed:**
- Record from USB webcam to local files (MP4)
- Motion detection (simple pixel difference algorithm)
- Stream to backend API when connected

**Libraries to consider:**
- MediaRecorder API (built into browser/Electron)
- Or: ffmpeg for more control

### Task 4: Windows Installer

Use `electron-builder` to create:
- Windows .exe installer (InnoSetup)
- Auto-updater support
- Install to Program Files
- Desktop shortcut
- Start menu entry

**File:** `installer.js` or config in `package.json`

---

## 📱 Mobile App UI Implementation (After Gemini's Designs)

**Wait for Gemini's designs first** - check `/var/www/webcam.org/mobile-app-design/`

### Task 1: Camera List Screen UI

Using Flutter, implement the Camera List screen based on Gemini's design.

**Widgets needed:**
- ListView for camera cards
- Camera card widget (thumbnail, name, status)
- Empty state widget
- "+ Add Camera" FAB (floating action button)

### Task 2: Live View Screen UI

**Complex parts:**
- Video player (use `video_player` or `flutter_webrtc` package)
- PTZ control pad (custom widget with 4 directional buttons)
- Zoom slider
- Push-to-talk button (record while held)

### Task 3: Login/Signup Forms

Standard form implementation:
- Text input fields with validation
- Password visibility toggle
- Submit buttons
- Error message display

---

## 🎨 Use Gemini's Design System

Once Gemini creates `design-system.md`, use their:
- Colors (primary, secondary, accent)
- Typography (font sizes, weights)
- Icons
- Spacing/padding standards

---

## 🔧 Backend Integration (Both Desktop & Mobile)

See `/var/www/webcam.org/backend/API_READY.md`

**For Desktop App:**
- User can register/login
- Desktop app gets API key
- Sends motion events to backend
- Uploads video clips (optional)

**For Mobile App:**
- User registers/logs in
- Fetches camera list
- Displays live streams
- Receives push notifications

---

## 📦 Deliverables

### Desktop App (Week 1-2)
1. Basic Electron app that runs on Windows
2. USB webcam selection working
3. Video preview working
4. Windows installer (.exe)

### Mobile App UI (Week 3-4)
1. All screens implemented from Gemini's designs
2. Navigation working
3. API integration (login, camera list)
4. Video player working

---

## 🚀 Start Here

**Desktop app is priority #1** - Build the Electron setup first!

Create `/var/www/webcam.org/desktop-app/` and start with a basic window.

**Questions?** Check `PARALLEL_DEVELOPMENT_PLAN.md`
