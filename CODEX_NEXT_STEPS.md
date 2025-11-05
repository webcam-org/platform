# CODEX - Windows Installer Final Steps

**Status:** Desktop app foundation complete, backend integration code ready
**Goal:** Complete the Windows installer so users can download and run it

---

## 🎯 YOUR REMAINING TASKS

### Task 1: Pull Latest Code from GitHub ✅

```bash
cd /path/to/webcam-org/platform
git pull
cd desktop-app
npm install  # Installs node-machine-id and electron-store
```

This gets you:
- `src/main/api-client.js` - Backend integration (Claude built this)
- `src/main/motion-detector.js` - Motion detection (Claude built this)
- Updated `package.json` with dependencies

---

### Task 2: Wire Up Backend Registration (5 minutes)

**In `src/main.js`**, add this at the top:

```javascript
const { registerDesktop } = require('./main/api-client');
```

**In the `app.whenReady()` block**, add:

```javascript
app.whenReady().then(async () => {
  // Register with backend on first run
  await registerDesktop();

  createWindow();
  // ... rest of your code
});
```

That's it! Desktop will register with backend and get an API key on first run.

---

### Task 3: Wire Up Motion Detection (10 minutes)

**In `src/index.html`**, add this script tag at the bottom:

```html
<script src="main/motion-detector.js"></script>
```

**In `src/renderer.js`**, when user starts the preview, add:

```javascript
const { sendMotionEvent } = require('./main/api-client');

// After you start the preview stream
let motionDetector = null;

async function startPreview() {
  // ... your existing preview code ...

  // Start motion detection
  motionDetector = new MotionDetector(previewVideo, {
    threshold: 30,
    motionThreshold: 0.02,
    checkInterval: 1000
  });

  motionDetector.start(() => {
    console.log('Motion detected!');
    // Send event to backend
    sendMotionEvent('motion', 0.85);
  });
}

function stopPreview() {
  if (motionDetector) {
    motionDetector.stop();
  }
  // ... your existing stop code ...
}
```

---

### Task 4: Build the Windows Installer (.exe)

**On your Windows machine:**

```bash
cd desktop-app
npm run build
```

This creates:
- `dist/webcam-org-setup-0.1.0.exe` - The Windows installer

The .exe will include:
- Electron app
- Webcam detection
- Motion detection
- Backend integration
- Auto-start on Windows boot
- System tray integration

---

### Task 5: Test the Installer

1. **Run the installer** - Double-click `webcam-org-setup-0.1.0.exe`
2. **Install the app** - Follow the wizard
3. **Launch the app** - Should open to webcam selection
4. **Select webcam** - Pick your USB webcam
5. **Start preview** - Should show video feed
6. **Check registration** - Look in console for "Desktop registered"
7. **Wave at camera** - Should detect motion and send event to backend

---

## 📋 Checklist

- [ ] Pull latest code from GitHub
- [ ] Run `npm install` in desktop-app/
- [ ] Add `registerDesktop()` call to main.js
- [ ] Add motion detector to renderer.js
- [ ] Build with `npm run build`
- [ ] Test installer on Windows
- [ ] Verify webcam detection works
- [ ] Verify motion detection works
- [ ] Verify events sent to backend (check backend logs)
- [ ] Push final working version to GitHub

---

## 🐛 Troubleshooting

**If registration fails:**
- Check backend is accessible at https://webcam.org/api/desktop/register
- Check console for error messages
- Backend API key will be in console logs

**If motion detection doesn't work:**
- Make sure video preview is running
- Lower the `motionThreshold` to 0.01 (more sensitive)
- Check console for "Motion detected!" messages

**If build fails:**
- Make sure you're on Windows (can't build .exe on Linux/Mac)
- Check all dependencies installed: `npm install`
- Try `npm run package` first (builds without installer)

---

## ✅ When Complete

You'll have:
- Working Windows installer (.exe)
- Complete end-to-end flow: Webcam → Motion Detection → Backend → Push Notifications
- Ready to distribute to users!

**Push the .exe to GitHub releases** when done:
```bash
git tag v0.1.0
git push --tags
```

Then create a GitHub release with the .exe attached.

---

**Questions?** Backend APIs are all working. Check `CODEX_BACKEND_INTEGRATION.md` for detailed examples.
