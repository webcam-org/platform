# webcam.org - Project Handoff

**Last Updated:** 2025-11-04 (End of Day)
**Status:** Installation System Complete, Ready for Backend Development

---

## 🎉 COMPLETED TODAY

### 1. Legal Framework ✅
**Live on webcam.org:**
- `/terms.html` - Terms of Service
- `/privacy.html` - Privacy Policy
- `/guidelines.html` - Community Guidelines
- `/dmca.html` - DMCA Copyright Policy
- `/legal.html` - Legal hub

**Key Points:**
- Manual approval for public cams
- No police access (unlike Ring)
- Open source promise
- Clear prohibited content rules

### 2. Homepage ✅
**Live at:** `webcam.org/`

**Messaging:**
- "Your Cameras. Your Privacy. Your Community."
- SOFTWARE platform (not hardware)
- Works with ANY camera (USB, IP, RTSP)
- Integrates with Frigate/MotionEye
- Free with optional $3-8/mo cloud backup
- Inline CSS (no loading issues)

### 3. Public Webcam Directory ✅
**Live at:** `webcam.org/public`

**What's working:**
- Interactive Leaflet map
- 65 real webcams (California/Nevada area)
- Scraped from Windy API with geocoded locations
- PostgreSQL + PostGIS geospatial queries
- API endpoint: `/api/webcams/public.php`

**Database:**
- `external_cameras` table
- Lat/long coordinates
- Source tracking (windy, dot, youtube, etc.)
- Ready to scale to 1000s of cams

### 4. Webcam Scrapers ✅
**Location:** `/var/www/webcam.org/scrapers/`

**Working scrapers:**
- `windy_geocoded.py` - Scrapes Windy, geocodes with Nominatim
- Handles Windy API free tier limitations
- 65 webcams successfully imported

**Ready to add:**
- Florida DOT traffic cams (~500)
- YouTube live streams
- More state DOT systems

### 5. Smart Installer ✅
**Live at:** `webcam.org/install.sh`

**What it does:**
- Auto-detects local network (192.168.x, 10.0.x, etc.)
- Scans for cameras on network (port 554)
- Auto-detects camera brands (Amcrest, Hikvision, Axis, Foscam, Reolink)
- Prompts for password per camera
- Generates Frigate config with correct RTSP paths
- Configures ONVIF for PTZ (where supported)
- Installs and starts Frigate + webcam.org integration
- Handles Docker permissions automatically

**Supports:**
- Amcrest/Dahua
- Hikvision
- Axis
- Foscam
- Reolink
- Generic ONVIF cameras

**Usage:**
```bash
curl -sSL webcam.org/install.sh | bash
```

### 6. Frigate Installation ✅
**Tested and working:**
- Docker Compose setup
- Frigate stable image
- AI person detection (local, free)
- Live camera feeds
- Event timeline
- Multi-camera support

**File locations:**
- `~/webcam-org/docker-compose.yml`
- `~/webcam-org/config/config.yml`
- `~/webcam-org/media/` (recordings)

**Tested with:**
- Amcrest PTZ cameras (2 cameras)
- Video feeds working
- AI detection working

### 7. Database Schema ✅
**PostgreSQL + PostGIS**

**Tables:**
- `users` - User accounts
- `cameras` - User-submitted cameras
- `external_cameras` - Scraped public webcams
- `camera_events` - Motion/person detection
- `notifications` - Push notification queue
- `user_devices` - Mobile app registrations
- `integrations` - Frigate/MotionEye connections

**Geospatial queries:**
- `nearby_cameras(lat, lon, radius_km)` function
- `all_public_cameras` view (combines user + external)
- PostGIS indexes for fast location queries

---

## 🚧 IN PROGRESS / BLOCKERS

### PTZ Support
**Issue:** Amcrest cameras use HTTP CGI API for PTZ, not ONVIF
- Frigate only supports ONVIF PTZ
- Tested: HTTP commands work (`curl` to `/cgi-bin/ptz.cgi`)
- **Solution:** PTZ will work in mobile app (use HTTP API)
- **For now:** PTZ via Amcrest web interface

**Commands that work:**
```bash
curl --digest -u admin:PASSWORD "http://IP/cgi-bin/ptz.cgi?action=start&channel=0&code=Right&arg1=0&arg2=1&arg3=0"
```

---

## 📋 NEXT STEPS (Priority Order)

### Phase 1: Backend API (Week 1-2)
**Build:** Node.js + Express API

**Endpoints needed:**
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login
- `GET /api/cameras` - List user's cameras
- `POST /api/cameras` - Register camera
- `POST /api/events` - Receive Frigate events
- `POST /api/notifications/send` - Send push via Firebase

**Technologies:**
- Node.js + Express
- JWT authentication
- PostgreSQL connection
- Firebase Admin SDK (for push)

### Phase 2: Integration Plugin (Week 1-2)
**Build:** Python service that runs alongside Frigate

**Functionality:**
- Listen to Frigate MQTT events
- Forward to webcam.org API
- Register cameras on startup
- Send motion/person detection events
- Optional: Upload clips to cloud backup
- Optional: Register public cams on map

**File:** `frigate-webcamorg-integration.py`

### Phase 3: Mobile App (Week 3-6)
**Build:** Flutter app (iOS + Android)

**Features:**
- User authentication
- Camera map (public directory)
- Link Frigate installation
- Push notifications (Firebase)
- Live stream viewing
- **Amcrest PTZ controls** (HTTP API)
- Event timeline

**PTZ Implementation:**
- Detect Amcrest cameras
- Use HTTP CGI commands for PTZ
- On-screen directional pad
- Works where Frigate PTZ doesn't

### Phase 4: Polish & Launch (Week 7-8)
- Beta testing
- MotionEye integration
- More webcam scrapers
- Community moderation system
- Marketing content

---

## 🔑 Key Files & Locations

### Website (LIVE)
- `/var/www/webcam.org/index.html` - Homepage
- `/var/www/webcam.org/public/index.html` - Webcam map
- `/var/www/webcam.org/install.sh` - Smart installer
- `/var/www/webcam.org/install/docker-compose.yml` - Frigate setup
- `/var/www/webcam.org/api/webcams/public.php` - API endpoint

### Database
- PostgreSQL database: `webcamorg`
- Schema: `/var/www/webcam.org/DATABASE_SCHEMA.sql`
- Migrations: `/var/www/webcam.org/database/migrations/`

### Scrapers
- `/var/www/webcam.org/scrapers/windy_geocoded.py` - Working scraper
- 65 webcams in `external_cameras` table

### Documentation
- `/var/www/webcam.org/HANDOFF.md` - This file
- `/var/www/webcam.org/AI_FEEDBACK_SYNTHESIS.md` - Gemini + ChatGPT validation
- `/var/www/webcam.org/MARKETING_HOMEPAGE.md` - Marketing copy

---

## 💡 Key Decisions Made

1. **Software platform, NOT hardware** - No doorbell kits, no proprietary cameras
2. **Frigate-first** - Integrate with best open-source NVR
3. **Multi-brand support** - Amcrest, Hikvision, Axis, Foscam, Reolink
4. **PTZ via mobile app** - Use brand-specific APIs (HTTP for Amcrest)
5. **Privacy positioning** - Compete on values, not price
6. **Public cam directory** - Top-of-funnel, differentiator

---

## 🐛 Known Issues

### Amcrest PTZ
- Requires HTTP CGI API, not ONVIF
- Frigate doesn't support natively
- Will work in mobile app using HTTP commands
- Tested commands work via curl

### nginx Configuration
- Static files need explicit location blocks
- CSS/JS/images must be served before Next.js proxy
- `/public` and `/api` configured as static

### Docker Permissions
- `docker-compose` vs `docker compose` (hyphen/space varies by version)
- Users need `newgrp docker` after installation
- Installer handles with `sg docker -c` command

---

## 📊 What's Live Right Now

**Public URLs:**
- https://webcam.org - Homepage
- https://webcam.org/public - Webcam map (65 cams)
- https://webcam.org/test - Webcam tester
- https://webcam.org/terms.html - Legal docs
- https://webcam.org/install.sh - Installer

**Installation:**
```bash
curl -sSL webcam.org/install.sh | bash
```

**Test System:**
- Frigate running on hack.net.co
- 2 Amcrest cameras configured
- AI detection working
- PTZ via HTTP API (not Frigate UI)

---

## 🎯 Success Metrics (6 Months)

**Updated targets:**
- 1,000 registered users
- 500 cameras registered
- 100 paying subscribers ($3-8/mo)
- 10,000 monthly visitors to public cam map
- Featured on r/selfhosted frontpage

---

## 📞 Critical Next Actions

### Technical
1. **Build backend API** - Node.js + Express
2. **Build integration plugin** - Frigate → webcam.org
3. **Build mobile app** - Flutter + Firebase
4. **Add Amcrest HTTP PTZ** - Mobile app only

### Business
1. **Community validation** - Post on r/selfhosted
2. **Beta testers** - 50 users from Reddit
3. **Attorney consultation** - When ready for public launch

---

## 🚀 How to Continue

**If picking up this project:**

1. **Backend API first** - Users need accounts
2. **Test with real Frigate install** - Already running
3. **Mobile app MVP** - Get push notifications working
4. **Add PTZ to mobile app** - Use Amcrest HTTP commands

**Code is ready to run:**
- Installer works end-to-end
- Database schema complete
- Legal docs live
- Public cam directory functional

---

## 📝 Notes

**User's System:**
- Server: hack.net.co (production)
- Local: ufobeep (testing)
- Cameras: 2x Amcrest PTZ at 192.168.0.35 and .176
- Password: test1234

**Amcrest PTZ Commands:**
```bash
# Pan right
curl --digest -u admin:test1234 "http://192.168.0.35/cgi-bin/ptz.cgi?action=start&channel=0&code=Right&arg1=0&arg2=1&arg3=0"

# Stop
curl --digest -u admin:test1234 "http://192.168.0.35/cgi-bin/ptz.cgi?action=stop&channel=0&code=Right"
```

**Windy API Key:** tQbEzMrEOWnd7qD3szZmFkZlAlhu2bhh

---

**End of Day Summary:** Installation system works perfectly. Users can install Frigate with one command. Ready to build backend + mobile app next.

---

**Good night! 🌙**

---

## 🌙 NIGHT SESSION UPDATES (Nov 4, Late)

### Additional Completed Work:
- ✅ Backend API skeleton (Node.js + Express on port 4000)
- ✅ MQTT + integration service added to docker-compose
- ✅ Integration service listens to Frigate events
- ✅ Event endpoints created (`/api/events`, `/api/notifications/send`)
- ✅ Amcrest PTZ via HTTP CGI confirmed working

### Critical Notes for Mobile App:
- **Two-way audio MUST be supported** for doorbell cameras
- Use Frigate's go2rtc for audio streaming
- Amcrest PTZ uses HTTP CGI (tested and working)
- Mobile app will have:
  - PTZ controls (HTTP API, not ONVIF)
  - Two-way audio (microphone → speaker)
  - Push notifications (via backend → Firebase)

### Backend API Running:
- Port: 4000
- Health: http://localhost:4000/health ✅
- Database auth: Needs fixing (peer auth issue)

**Tomorrow:** Fix database auth, complete backend, start Flutter app


---

## 🚨 CRITICAL FEEDBACK - Windows + USB Webcam Support

**User tested with friend - FAILED**

**Friend's setup:**
- Windows desktop
- Built-in laptop webcam (USB)
- No IP cameras

**Friend's quote:** "nobody has IP cameras lol"

### Reality Check:

**Current installer limitations:**
- ❌ Linux only (bash script)
- ❌ IP cameras only (RTSP)
- ❌ Requires Docker knowledge
- ❌ Targets tech-savvy self-hosters

**What normal people actually have:**
- ✅ Windows PCs
- ✅ Built-in USB webcams
- ✅ Want simple setup

### URGENT TODO:

1. **Windows Installer**
   - PowerShell script or .exe installer
   - Docker Desktop for Windows
   - Or: Electron app (no Docker needed)

2. **USB Webcam Support**
   - Frigate CAN use USB via /dev/video0
   - Need Windows equivalent (DirectShow)
   - Auto-detect USB webcams, not just network scan

3. **Simplified Entry**
   - Desktop app option (no command line)
   - Or: Browser-based setup
   - One-click install, no terminal

4. **Market Validation**
   - We're targeting wrong audience (IP camera owners = tiny)
   - Should target: laptop/desktop webcam users = HUGE market
   - Pivot: "Turn your laptop into a security camera"

### Two Paths Forward:

**Path A: Stay niche (IP cameras, Linux, self-hosters)**
- Current approach
- Smaller market but easier technically
- r/selfhosted audience

**Path B: Go mainstream (Windows, USB webcams, normal people)**
- Requires Windows support + desktop app
- MASSIVE market but harder technically
- Actual consumer product

**Decision needed:** Which market are we targeting?

---

**Added:** 2025-11-04 6:02 AM (based on real user feedback)

### Robby's Additional Feedback (CRITICAL):

**Direct quotes:**
- "aint nobody doin this other shit" (referring to curl commands)
- "99% of the world cant do a curl call"
- "need an installer and all that shit"
- "stick to .exe" (Windows installer)
- "Pi = 3rd tier priority" (too nerdy)
- "end users want install and go"
- "run it on some old shitty laptop to point at squirrels outside"

### Use Case Validation:

**What people ACTUALLY want:**
1. Install .exe on old Windows laptop
2. Point laptop webcam (or cheap USB cam) at window/yard/birds
3. Get alerts on phone when motion detected
4. Maybe share feed publicly

**NOT:** Buy Raspberry Pi, learn Linux, configure IP cameras, run bash scripts

### Product Pivot Needed:

**Current (wrong):**
- Target: Linux nerds with IP cameras
- Entry: `curl | bash` command
- Platform: Raspberry Pi + Docker
- Market: r/selfhosted (tiny)

**Should be (right):**
- Target: Normal people with old laptops
- Entry: Download .exe, double-click, done
- Platform: Windows desktop app
- Market: Everyone (huge)

**Use case:** "Turn your old laptop into a security camera"

### Technical Implications:

**Need to build:**
1. Electron desktop app (Windows .exe)
2. Auto-detect USB webcams (not network scan)
3. One-click setup (no terminal)
4. System tray app (runs in background)
5. Optional: Share feed publicly

**Don't need:**
- Bash installer
- Docker knowledge
- IP camera support (initially)
- Raspberry Pi focus

### Market Positioning Change:

**Old:** "Self-hosted Ring alternative for power users"
**New:** "Turn your old laptop into a security camera - free Ring alternative"

**This is a MASSIVE pivot but Robby is 100% right.**

