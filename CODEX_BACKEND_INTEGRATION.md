# CODEX - Desktop App Backend Integration Guide

**Current Status:** Desktop app UI is working (webcam detection, preview, tray) ✅
**Missing:** Backend API integration (registration, motion events, cloud sync)

---

## 🎯 PRIORITY: Connect Desktop App to Backend

You have the frontend working. Now connect it to Claude's backend APIs.

---

## Step 1: Register Desktop App on First Run

**When app starts for the first time**, register with backend to get an API key:

```javascript
// In main.js or new file: src/main/api-client.js

const API_URL = 'https://webcam.org/api';  // or 'http://localhost:4000' for local dev

async function registerDesktop() {
  const os = require('os');
  const { machineId } = require('node-machine-id');

  const deviceId = await machineId();

  const response = await fetch(`${API_URL}/desktop/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_id: deviceId,
      os: `${os.platform()} ${os.release()}`,
      webcam_info: {
        // Add selected webcam info here
      }
    })
  });

  const data = await response.json();

  if (data.success) {
    // Save API key to settings
    await saveSetting('api_key', data.api_key);
    console.log('Desktop registered! API key:', data.api_key);
    return data.api_key;
  }
}
```

**Install dependency:**
```bash
cd desktop-app
npm install node-machine-id
```

---

## Step 2: Send Motion Events to Backend

**When motion is detected**, send event to backend:

```javascript
// In your motion detection code

async function sendMotionEvent(eventType, confidence) {
  const apiKey = await getSetting('api_key');

  if (!apiKey) {
    console.warn('No API key - desktop not registered');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/desktop/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        event_type: eventType,  // 'motion' or 'person'
        confidence: confidence,  // 0.0 to 1.0
        timestamp: new Date().toISOString(),
        camera_name: 'USB Webcam'
      })
    });

    const data = await response.json();
    console.log('Event sent:', data);
  } catch (error) {
    console.error('Failed to send event:', error);
  }
}

// Call this when motion detected
sendMotionEvent('motion', 0.85);
```

---

## Step 3: Add Motion Detection

You need to implement basic motion detection. Here's a simple pixel difference algorithm:

```javascript
// In src/main/motion-detector.js

class MotionDetector {
  constructor(video) {
    this.video = video;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.previousFrame = null;
    this.threshold = 30;  // Pixel difference threshold
    this.motionThreshold = 0.02;  // % of pixels that must change
  }

  checkMotion() {
    const width = this.video.videoWidth;
    const height = this.video.videoHeight;

    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.drawImage(this.video, 0, 0, width, height);
    const currentFrame = this.ctx.getImageData(0, 0, width, height);

    if (!this.previousFrame) {
      this.previousFrame = currentFrame;
      return false;
    }

    let changedPixels = 0;
    const totalPixels = width * height;

    for (let i = 0; i < currentFrame.data.length; i += 4) {
      const rDiff = Math.abs(currentFrame.data[i] - this.previousFrame.data[i]);
      const gDiff = Math.abs(currentFrame.data[i+1] - this.previousFrame.data[i+1]);
      const bDiff = Math.abs(currentFrame.data[i+2] - this.previousFrame.data[i+2]);

      if (rDiff + gDiff + bDiff > this.threshold) {
        changedPixels++;
      }
    }

    this.previousFrame = currentFrame;

    const motionPercent = changedPixels / totalPixels;
    return motionPercent > this.motionThreshold;
  }

  start(callback) {
    this.interval = setInterval(() => {
      if (this.checkMotion()) {
        callback();
      }
    }, 1000);  // Check every second
  }

  stop() {
    clearInterval(this.interval);
  }
}

// Usage in renderer.js
const detector = new MotionDetector(previewVideo);
detector.start(() => {
  console.log('Motion detected!');
  sendMotionEvent('motion', 0.85);
});
```

---

## Step 4: Optional - Local Recording

**Save motion clips to disk:**

```javascript
// Using MediaRecorder API

let mediaRecorder;
let recordedChunks = [];

function startRecording(stream) {
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    saveRecording(blob);
  };

  mediaRecorder.start();

  // Stop after 10 seconds
  setTimeout(() => {
    mediaRecorder.stop();
  }, 10000);
}

async function saveRecording(blob) {
  const recordingDir = await getSetting('recordingDirectory');
  const filename = `motion-${Date.now()}.webm`;
  const path = `${recordingDir}/${filename}`;

  const buffer = await blob.arrayBuffer();
  await window.desktopBridge.saveFile(path, Buffer.from(buffer));

  console.log('Recording saved:', path);
}
```

You'll need to expose a `saveFile` method in preload.js

---

## 📋 Path Forward (Priority Order)

### Phase 1: Basic Backend Connection (This Week)
1. ✅ Install `node-machine-id` package
2. ✅ Add registration on first run
3. ✅ Save API key to settings
4. ✅ Test registration endpoint

### Phase 2: Motion Detection (This Week)
1. ✅ Implement pixel difference motion detector
2. ✅ Send motion events to backend with API key
3. ✅ Test event submission
4. ✅ Add UI indicator when motion detected

### Phase 3: Optional Features (Next Week)
1. ⏳ Local video recording (MediaRecorder)
2. ⏳ Upload recordings to backend (future endpoint)
3. ⏳ Settings UI for sensitivity adjustment
4. ⏳ Event log viewer

---

## 🧪 Testing Backend Integration

**Test registration:**
```bash
curl -X POST http://localhost:4000/api/desktop/register \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test-123","os":"Windows 11"}'
```

Expected response:
```json
{
  "success": true,
  "api_key": "eyJhbGc...",
  "config": {
    "api_url": "http://localhost:4000",
    "upload_endpoint": "/api/desktop/upload",
    "event_endpoint": "/api/desktop/events"
  }
}
```

**Test sending event:**
```bash
curl -X POST http://localhost:4000/api/desktop/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{"event_type":"motion","confidence":0.85}'
```

---

## 📁 Files to Create/Modify

```
desktop-app/
├── src/
│   ├── main/
│   │   ├── api-client.js        # NEW - API calls to backend
│   │   └── motion-detector.js   # NEW - Motion detection
│   ├── renderer.js              # MODIFY - Add motion detection UI
│   └── main.js                  # MODIFY - Call registration on first run
└── package.json                 # MODIFY - Add node-machine-id
```

---

## 🚀 Quick Start

1. **Pull latest from GitHub** - I added nginx proxy config
2. **Add backend registration** - Use code above
3. **Test it works** - Check console for "Desktop registered"
4. **Add motion detection** - Use MotionDetector class
5. **Test events** - Check backend receives them

---

## Backend APIs Ready for You:

All documented in `/var/www/webcam.org/backend/API_READY.md`

- `POST /api/desktop/register` - Get API key ✅
- `POST /api/desktop/events` - Send motion events ✅

**Questions?** Backend is fully functional and waiting for your integration!
