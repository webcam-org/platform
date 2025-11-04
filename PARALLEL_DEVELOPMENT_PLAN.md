# Parallel Development Plan - webcam.org

**Goal:** Build BOTH Linux/IP camera AND Windows/USB webcam versions simultaneously

**Team:** Claude (backend), Codex (Windows app), Gemini (docs/design)

---

## 🎯 Shared Infrastructure (Build Once, Use Twice)

### Backend API (CLAUDE)
**Timeline:** Week 1-2
**Dependencies:** None

- [ ] Fix PostgreSQL auth (peer connection)
- [ ] User registration/login (JWT)
- [ ] Camera registration endpoint
- [ ] Event receiving endpoint (from Frigate/desktop app)
- [ ] Push notification service (Firebase)
- [ ] WebRTC signaling (for remote viewing)
- [ ] Public cam directory API

**Deliverable:** REST API on api.webcam.org

---

### Mobile App (CLAUDE + CODEX)
**Timeline:** Week 3-5
**Dependencies:** Backend API complete

**CLAUDE handles:**
- [ ] Flutter app structure
- [ ] Authentication flow
- [ ] Backend API integration
- [ ] Push notifications (Firebase)
- [ ] Database models

**CODEX handles:**
- [ ] Camera list UI
- [ ] Live stream viewer
- [ ] PTZ controls (brand-specific HTTP APIs)
- [ ] Two-way audio interface
- [ ] Settings screens

**Deliverable:** iOS + Android apps

---

## 🐧 Linux/IP Camera Version (Tier 1 - Launch First)

### Installation System (CLAUDE)
**Timeline:** Week 1
**Status:** 90% complete

- [x] Smart installer (camera detection)
- [x] Brand detection (Amcrest, Hikvision, etc.)
- [x] Frigate docker-compose
- [ ] MQTT + integration service (in progress)
- [ ] Config validation
- [ ] Error handling improvements

**Deliverable:** `curl webcam.org/install.sh | bash` works perfectly

---

### Integration Plugin (CLAUDE)
**Timeline:** Week 2
**Dependencies:** Backend API, MQTT

- [ ] Listen to Frigate MQTT events
- [ ] Forward to backend API
- [ ] Camera registration on startup
- [ ] Event batching/throttling
- [ ] Reconnection logic
- [ ] Logging

**Deliverable:** Python service in docker-compose

---

### Documentation (GEMINI)
**Timeline:** Week 1-2
**Dependencies:** None

- [ ] Installation guide (step-by-step screenshots)
- [ ] Compatible cameras list
- [ ] Troubleshooting guide
- [ ] FAQ
- [ ] Video tutorial script
- [ ] Blog post: "Why we built this"
- [ ] r/selfhosted launch post

**Deliverable:** Docs site + marketing content

---

## 💻 Windows/USB Webcam Version (Tier 2 - Launch After Validation)

### Desktop App (CODEX)
**Timeline:** Week 3-6
**Dependencies:** Backend API complete

**Core Features:**
- [x] Electron app scaffolding
- [ ] Windows installer (.exe with InnoSetup)
- [x] USB webcam detection (MediaDevices prototype)
- [x] Auto-start on Windows boot
- [x] System tray icon
- [ ] Local recording (to disk)
- [x] Settings UI (camera selection + recording directory stub)
- [x] Webcam selection dropdown

**Deliverable:** webcam-org-setup.exe

---

### Video Processing (CODEX + CLAUDE)

**CODEX handles:**
- [ ] USB webcam capture (Windows APIs)
- [ ] H.264 encoding
- [ ] Motion detection (local)
- [ ] Snapshot generation

**CLAUDE handles:**
- [ ] Streaming to backend
- [ ] Event forwarding
- [ ] Cloud upload (optional)

**Deliverable:** Video pipeline working

---

### AI Detection (CODEX)
**Timeline:** Week 4-5
**Dependencies:** Video pipeline

- [ ] Integrate TensorFlow.js or ONNX
- [ ] Person detection model (local)
- [ ] Motion zones UI
- [ ] Sensitivity settings
- [ ] Alert filtering

**Deliverable:** Local AI detection on Windows

---

### Windows Packaging (GEMINI + CODEX)

**GEMINI handles:**
- [ ] Marketing website for Windows version
- [ ] Download page design
- [ ] Installation instructions
- [ ] Screenshots/demo video
- [ ] Windows Store listing copy

**CODEX handles:**
- [ ] Code signing certificate
- [ ] Auto-updater
- [ ] Crash reporting
- [ ] Analytics integration

**Deliverable:** Polished Windows installer

---

## 🗺️ Public Webcam Directory (ALL)

### Scraper Infrastructure (CLAUDE)
**Timeline:** Ongoing

- [x] Windy scraper (65 cams) ✅
- [ ] Florida DOT scraper (~500 cams)
- [ ] California DOT (~2000 cams)
- [ ] YouTube live streams
- [ ] User-submitted cams

**Deliverable:** 1000+ webcams

---

### Map Interface (CODEX)
**Timeline:** Week 2

- [ ] Fix PHP API endpoint (current blocker)
- [ ] Leaflet map improvements
- [ ] Camera clustering
- [ ] Filter by type (traffic, weather, etc.)
- [ ] Search functionality
- [ ] Mobile-responsive

**Deliverable:** Working public map at webcam.org/public

---

### Moderation System (GEMINI + CLAUDE)

**GEMINI handles:**
- [ ] Moderation guidelines
- [ ] Review process documentation
- [ ] Community moderator recruitment

**CLAUDE handles:**
- [ ] Report/flag API
- [ ] Admin dashboard
- [ ] Auto-moderation rules

**Deliverable:** Moderation pipeline

---

## 📱 Mobile App Features (Shared Across Both Versions)

### Core Features (CLAUDE + CODEX)

**CLAUDE:**
- [ ] Backend integration
- [ ] Authentication
- [ ] Push notifications
- [ ] Data sync

**CODEX:**
- [ ] Camera list UI
- [ ] Live viewer
- [ ] Event timeline
- [ ] Settings

---

### Advanced Features (Week 5-6)

**PTZ Controls (CODEX):**
- [ ] Amcrest HTTP API
- [ ] Hikvision API
- [ ] Axis API
- [ ] Generic ONVIF
- [ ] On-screen joystick

**Two-Way Audio (CODEX + CLAUDE):**
- [ ] Microphone permission
- [ ] Audio encoding
- [ ] Streaming to camera
- [ ] Talk button UI
- [ ] Backend audio relay

**Deliverable:** Full-featured mobile app

---

## 🚀 Launch Strategy

### Phase 1: Soft Launch (Week 3)
**Audience:** r/selfhosted, r/homeassistant
**Version:** Linux/IP camera only
**Goal:** 50 beta testers

**Tasks:**
- GEMINI: Launch post, FAQ
- CLAUDE: Backend ready, monitoring
- CODEX: Bug fixes

---

### Phase 2: Public Launch (Week 6-8)
**Audience:** Privacy advocates, tech press
**Version:** Linux + Windows
**Goal:** 1000 users

**Tasks:**
- GEMINI: Press kit, blog posts, social media
- CLAUDE: Scale backend, add features
- CODEX: Windows app polish

---

### Phase 3: Growth (Month 3-6)
**Audience:** Mainstream consumers
**Version:** Polished Windows app
**Goal:** 10,000 users, paid tiers

---

## 📋 Task Assignment Summary

### CLAUDE (You):
- Backend API (events, notifications, streaming)
- Integration plugin (Frigate → backend)
- Database work
- DevOps/infrastructure
- Mobile app backend integration
- Florida DOT scraper

**Skills:** Complex backend logic, APIs, integrations

---

### CODEX:
- Windows desktop app (Electron)
- USB webcam capture
- Video encoding/streaming
- Mobile app UI components
- PTZ controls UI
- Two-way audio implementation
- /public map fixes

**Skills:** UI/UX, desktop apps, video processing

---

### GEMINI:
- All documentation
- Marketing content
- Blog posts
- Launch materials
- Community guidelines
- Video tutorial scripts
- Design feedback
- User research

**Skills:** Writing, design, strategy, creativity

---

## 🔄 Coordination Points

**Daily:**
- Share API contracts (Claude → Codex)
- UI mockups (Gemini → Codex)
- Feature priorities (all)

**Weekly:**
- Integration testing
- Demo builds
- Roadmap adjustments

---

## 🎯 Success Metrics

**Month 1:**
- Linux version: 100 users
- Backend: Stable
- Mobile app: Beta

**Month 3:**
- Windows version: 1000 users
- Both platforms: Feature parity
- Revenue: First paid subscribers

**Month 6:**
- Combined: 10,000 users
- MRR: $2,500
- Press coverage

---

**This plan allows parallel work with minimal blockers!**


---

## 📱 Mobile App - Detailed Task Breakdown

### GEMINI - App Design & UX (Week 1-3)

**Screen Designs:**
- [ ] Login/signup screens (wireframes + copy)
- [ ] Camera list screen (empty state, populated state)
- [ ] Live camera view (controls layout, button placement)
- [ ] Event timeline screen (how to show motion events)
- [ ] Settings screen (organization, sections)
- [ ] Onboarding flow (welcome, permissions, first camera)
- [ ] Public cam map screen (mobile version)
- [ ] Notification design (what info to show)

**UX Flows:**
- [ ] First-time user journey (signup → add camera → get first notification)
- [ ] Camera setup flow (scan QR code? manual entry? both?)
- [ ] PTZ control UX (directional pad design, zoom slider)
- [ ] Two-way audio UX (push-to-talk button, always-on toggle?)
- [ ] Error states (camera offline, no internet, etc.)
- [ ] Loading states (skeleton screens vs spinners)

**Copy/Content:**
- [ ] App store description (iOS + Android)
- [ ] In-app help text
- [ ] Empty state messages ("No cameras yet! Add one to get started")
- [ ] Error messages (friendly, actionable)
- [ ] Permission prompts ("We need camera access to...")
- [ ] Button labels (clear, concise)
- [ ] Notification templates

**Visual Design:**
- [ ] Color palette (brand colors)
- [ ] Icon set (camera, settings, PTZ arrows, etc.)
- [ ] App icon design
- [ ] Splash screen
- [ ] Dark mode variants
- [ ] Typography scale

**Deliverable:** Complete app design system + all screens designed

---

### CLAUDE - App Backend Integration (Week 3-4)

**Core Functionality:**
- [ ] Authentication (login, signup, JWT handling)
- [ ] API client (REST calls to backend)
- [ ] WebSocket connection (live events)
- [ ] Database models (local storage)
- [ ] State management (cameras, events, user data)
- [ ] Push notification handling (Firebase)
- [ ] Background sync
- [ ] Offline mode

**Deliverable:** App talks to backend, receives notifications

---

### CODEX - App UI Implementation (Week 4-5)

**Screen Implementation:**
- [ ] Build all screens from Gemini's designs
- [ ] Navigation (bottom tabs, drawer, stack)
- [ ] Camera list (pull to refresh, infinite scroll)
- [ ] Live viewer (video player, overlays)
- [ ] PTZ controls (responsive touch, haptic feedback)
- [ ] Settings (forms, toggles, pickers)
- [ ] Animations (smooth transitions)

**Media Handling:**
- [ ] Video streaming (HLS, WebRTC)
- [ ] Thumbnail loading (cached, lazy)
- [ ] Camera preview (low latency)
- [ ] Recording playback
- [ ] Audio streaming (two-way)

**Deliverable:** Polished, functional app UI

---

## 🖥️ Windows Desktop App - Detailed Breakdown

### GEMINI - Desktop App Design (Week 3-4)

**UI Design:**
- [ ] Main window layout (system tray app)
- [ ] Settings window (preferences, camera config)
- [ ] Camera preview window (live view)
- [ ] First-run wizard (welcome → detect webcam → setup)
- [ ] System tray icon states (recording, idle, alert)
- [ ] Notification toasts (Windows native style)

**UX Flows:**
- [ ] Installation experience (double-click .exe → first screen)
- [ ] Webcam detection (automatic vs manual selection)
- [ ] Recording settings (quality, storage location)
- [ ] Sharing public cam (checkbox + GPS entry)
- [ ] Update prompts (non-intrusive)

**Marketing Assets:**
- [ ] Windows app landing page
- [ ] Screenshot tour
- [ ] Feature comparison (vs Ring, vs Linux version)
- [ ] Video demo script

**Deliverable:** Complete Windows app design + marketing

---

### CODEX - Desktop App Development (Week 3-6)

**Core App:**
- [ ] Electron setup (main process, renderer)
- [ ] Windows installer (InnoSetup script)
- [ ] Auto-updater (Squirrel.Windows)
- [ ] System tray (minimize, notifications)
- [ ] Auto-start on boot
- [ ] Settings persistence

**Webcam Integration:**
- [ ] USB webcam enumeration (DirectShow)
- [ ] Camera capture (MediaFoundation)
- [ ] H.264 encoding (hardware accelerated)
- [ ] Frame rate control
- [ ] Resolution selection

**Recording & Detection:**
- [ ] Local recording (MP4 files)
- [ ] Motion detection (pixel diff or TensorFlow.js)
- [ ] Event logging
- [ ] Storage management (auto-cleanup old files)

**Cloud Integration:**
- [ ] Stream to backend API
- [ ] Event forwarding
- [ ] Optional cloud backup

**Deliverable:** Working Windows .exe installer

---

### CLAUDE - Desktop App Backend (Week 4-5)

**API Endpoints for Desktop:**
- [ ] /api/desktop/register (register Windows instance)
- [ ] /api/desktop/stream (receive webcam stream)
- [ ] /api/desktop/events (motion events)
- [ ] /api/desktop/config (sync settings)

**Infrastructure:**
- [ ] Video ingestion pipeline (handle streams from 1000s of Windows users)
- [ ] Storage strategy (S3 buckets, CDN)
- [ ] Bandwidth optimization
- [ ] Rate limiting

**Deliverable:** Desktop app can talk to backend

---

## 🎨 Design System (GEMINI - Week 1)

**Create once, use everywhere:**

- [ ] Logo design (if needed)
- [ ] Brand colors (primary, secondary, accents)
- [ ] Typography (fonts, sizes, weights)
- [ ] Icon library (consistent style)
- [ ] Button styles (primary, secondary, danger)
- [ ] Form elements (inputs, toggles, dropdowns)
- [ ] Card designs (camera cards, event cards)
- [ ] Navigation patterns

**Deliverable:** Design system document that Claude + Codex implement

---

## 📅 Timeline With Parallel Work

**Week 1:**
- CLAUDE: Backend API + database fixes
- CODEX: /public map fix
- GEMINI: Design system + Linux docs

**Week 2:**
- CLAUDE: Integration plugin + scrapers
- CODEX: Mobile app structure
- GEMINI: App screen designs + launch content

**Week 3:**
- CLAUDE: Mobile app backend integration
- CODEX: Mobile app UI implementation
- GEMINI: Windows app design + beta launch prep
- **LAUNCH:** Linux version (r/selfhosted)

**Week 4:**
- CLAUDE: Desktop app backend endpoints
- CODEX: Windows desktop app core
- GEMINI: Windows marketing + docs

**Week 5:**
- CLAUDE: Video pipeline + optimization
- CODEX: Windows app polish
- GEMINI: App store listings + press kit

**Week 6:**
- ALL: Testing, bug fixes, integration
- GEMINI: Launch materials ready
- **LAUNCH:** Windows version (mainstream)

---

**This plan has everyone working in parallel with minimal blockers!**

Tomorrow morning, assign specific tasks and everyone can start immediately.


---

## 🗂️ TECHNICAL REFERENCE - Paths, Endpoints, Specs

### File Structure

```
/var/www/webcam.org/
├── index.html                    # Homepage (LIVE)
├── public/index.html             # Webcam map (NEEDS FIX)
├── install.sh                    # Smart installer (WORKING)
├── install/
│   ├── docker-compose.yml       # Frigate + MQTT + integration
│   ├── integration.py           # Python integration service
│   └── amcrest-ptz.sh          # PTZ control script
├── backend/
│   ├── server.js                # Backend API (PORT 4000, RUNNING)
│   └── package.json             # Dependencies
├── scrapers/
│   ├── windy_geocoded.py       # Working scraper (65 cams)
│   └── README.md                # Scraper docs
├── api/webcams/public.php       # Public cam API (NEEDS FIX)
├── database/
│   └── migrations/
│       ├── 001_main_schema.sql
│       └── 002_external_cameras.sql
├── HANDOFF.md                   # Project status
├── PARALLEL_DEVELOPMENT_PLAN.md # This file
└── AI_FEEDBACK_SYNTHESIS.md     # Gemini + ChatGPT validation
```

---

### Backend API Endpoints (CLAUDE TO BUILD)

**Base URL:** `https://api.webcam.org` (or `http://localhost:4000` for dev)

**Authentication:**
```
POST /api/auth/register
Body: { email, password, username }
Response: { token (JWT), user }

POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

**Cameras:**
```
GET /api/cameras
Headers: Authorization: Bearer {token}
Response: { cameras: [...] }

POST /api/cameras
Body: { name, type, location?, is_public }
Response: { camera }

GET /api/cameras/:id
Response: { camera, recent_events }
```

**Events:**
```
POST /api/events
Body: { camera_id, event_type, confidence, timestamp, snapshot_url? }
Response: { success, event_id }

GET /api/events?camera_id=X&limit=50
Response: { events: [...] }
```

**Notifications:**
```
POST /api/notifications/send
Body: { user_id, title, body, camera_id, fcm_token }
Response: { success, notification_id }

POST /api/devices/register
Body: { user_id, device_id, fcm_token, platform }
Response: { success }
```

**Public Webcams:**
```
GET /api/webcams/public
Query: ?lat=X&lon=Y&radius=50
Response: { count, webcams: [{ id, name, lat, lon, embed_url, source }] }

GET /api/webcams/nearby
Query: ?lat=X&lon=Y&radius_km=50
Response: Uses PostGIS nearby_cameras() function
```

**Desktop App (Windows):**
```
POST /api/desktop/register
Body: { device_id, os, webcam_info }
Response: { api_key, config }

POST /api/desktop/events
Body: { event_type, confidence, timestamp }
Headers: X-API-Key: {key}
```

---

### Database Tables (ALREADY EXIST)

**PostgreSQL database:** `webcamorg`

**Key tables:**
- `users` - User accounts (id, email, password_hash, tier)
- `cameras` - User cameras (id, owner_id, name, location, is_public)
- `external_cameras` - Scraped cams (id, source, external_id, location)
- `camera_events` - Events (id, camera_id, event_type, confidence, occurred_at)
- `notifications` - Push queue (id, user_id, camera_id, title, body, fcm_token)
- `user_devices` - Mobile devices (id, user_id, device_id, fcm_token, platform)
- `integrations` - Frigate instances (id, user_id, type, base_url, api_key)

**PostGIS functions:**
- `nearby_cameras(lat, lon, radius_km)` - Find cameras near location
- `all_public_cameras` view - Combines user + external cams

---

### Mobile App Structure (FLUTTER)

**Proposed structure:**
```
webcamorg_app/
├── lib/
│   ├── main.dart
│   ├── models/
│   │   ├── camera.dart
│   │   ├── event.dart
│   │   └── user.dart
│   ├── services/
│   │   ├── api_service.dart      # Backend API calls (CLAUDE)
│   │   ├── auth_service.dart     # JWT handling (CLAUDE)
│   │   ├── notification_service.dart  # Firebase (CLAUDE)
│   │   └── video_service.dart    # Streaming (CODEX)
│   ├── screens/
│   │   ├── login_screen.dart     # (GEMINI designs, CODEX implements)
│   │   ├── camera_list_screen.dart
│   │   ├── live_view_screen.dart
│   │   ├── event_timeline_screen.dart
│   │   └── settings_screen.dart
│   └── widgets/
│       ├── camera_card.dart      # (CODEX)
│       ├── ptz_controls.dart     # (CODEX)
│       └── event_card.dart
└── pubspec.yaml
```

**Dependencies (already known):**
- firebase_messaging (push notifications)
- http (API calls)
- video_player or flutter_webrtc (streaming)
- geolocator (location for public map)

---

### Windows Desktop App Structure (ELECTRON)

**Proposed structure:**
```
webcamorg-desktop/
├── main.js                    # Electron main process
├── preload.js                 # Context bridge
├── renderer/
│   ├── index.html            # Main window
│   ├── settings.html         # Settings window
│   └── js/
│       ├── webcam.js         # USB capture (CODEX)
│       ├── encoder.js        # H.264 encoding (CODEX)
│       └── api.js            # Backend calls (CLAUDE)
├── native/
│   ├── webcam-capture.cc     # Native addon for DirectShow (CODEX)
│   └── binding.gyp
├── installer.iss              # InnoSetup script
└── package.json
```

**Key Windows APIs to use:**
- MediaDevices.getUserMedia() (webcam access)
- MediaRecorder API (recording)
- Or: Native DirectShow for advanced control

---

### PTZ Control APIs (CODEX TO IMPLEMENT)

**Amcrest/Dahua:**
```
POST http://{ip}/cgi-bin/ptz.cgi
Params: action=start&channel=0&code=Right&arg1=0&arg2=1&arg3=0
Auth: Digest auth (username/password)
```

**Hikvision:**
```
PUT http://{ip}/ISAPI/PTZCtrl/channels/1/continuous
Body: XML with <PTZData><pan>50</pan><tilt>50</tilt></PTZData>
Auth: Digest auth
```

**Axis:**
```
GET http://{ip}/axis-cgi/com/ptz.cgi?move=right
Auth: Basic auth
```

**Generic ONVIF:**
- Use ONVIF SOAP calls (complex, library recommended)

---

### Firebase Configuration

**Project:** `webcamorg` (needs to be created)

**Services needed:**
- Firebase Cloud Messaging (push notifications)
- Firebase Admin SDK (server-side)

**Files needed:**
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)
- `firebase-adminsdk-key.json` (backend)

**CLAUDE will configure this**

---

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://postgres@localhost/webcamorg
PORT=4000
JWT_SECRET=your_secret_here
FIREBASE_PROJECT_ID=webcamorg
FIREBASE_PRIVATE_KEY=...
```

**Integration Service:**
```
MQTT_HOST=mqtt
MQTT_PORT=1883
WEBCAMORG_API_URL=https://api.webcam.org
WEBCAMORG_API_KEY=user_specific_key
```

---

### Frigate Configuration (What installer generates)

**Basic structure:**
```yaml
mqtt:
  enabled: true
  host: mqtt
  port: 1883

cameras:
  camera1:
    enabled: true
    ffmpeg:
      inputs:
        - path: rtsp://user:pass@ip:554/path
          roles:
            - detect
    detect:
      enabled: true
      width: 1920
      height: 1080
    onvif:  # Optional
      host: ip
      port: 80
      user: admin
      password: pass
```

---

### API Response Formats (STANDARD)

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Pagination:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150
  }
}
```

---

### Camera Brands & RTSP Paths (REFERENCE)

```javascript
const RTSP_PATHS = {
  amcrest: "rtsp://user:pass@ip:554/cam/realmonitor?channel=1&subtype=0",
  hikvision: "rtsp://user:pass@ip:554/Streaming/Channels/101",
  axis: "rtsp://user:pass@ip:554/axis-media/media.amp",
  foscam: "rtsp://user:pass@ip:554/videoMain",
  reolink: "rtsp://user:pass@ip:554/h264Preview_01_main",
  generic: "rtsp://user:pass@ip:554/stream1"
};
```

---

### Testing Credentials

**Amcrest Test Cameras:**
- IP: 192.168.0.35
- User: admin
- Password: test1234

**Database:**
- Database: webcamorg
- User: postgres
- Host: localhost

**Windy API:**
- Key: tQbEzMrEOWnd7qD3szZmFkZlAlhu2bhh

---

**Everything Gemini and Codex need to start working is now in this file!**
