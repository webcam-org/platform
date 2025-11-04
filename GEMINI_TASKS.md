# GEMINI - Mobile App Design Tasks

**START HERE:** You're designing the webcam.org mobile app (iOS + Android)

**Backend API is ready:** See `/var/www/webcam.org/backend/API_READY.md` for endpoints

---

## 🎨 YOUR TASKS (Start Immediately)

### Task 1: App Screen Designs (PRIORITY)

Design these screens with wireframes and copy:

#### 1. Login/Signup Screen
- **Layout:** Logo at top, form in center, buttons at bottom
- **Fields needed:** Email, password (signup also needs username)
- **Copy needed:**
  - Welcome message
  - Button labels ("Sign Up", "Log In", "Continue with Email")
  - Error messages ("Invalid email", "Password too short")
  - Password requirements text ("Must be at least 8 characters")

#### 2. Camera List Screen (Home)
- **Empty state:** What shows when user has no cameras?
  - Illustration idea?
  - Message: "No cameras yet! Add one to get started"
  - Big "+ Add Camera" button
- **Populated state:** How to display camera cards?
  - Camera thumbnail/icon
  - Camera name ("Front Door", "Backyard")
  - Status indicator (online/offline)
  - Last event timestamp
  - Quick actions (view live, settings)

#### 3. Live Camera View Screen
- **Video player area:** Full screen or partial?
- **Controls needed:**
  - PTZ directional pad (Up/Down/Left/Right arrows)
  - Zoom slider (+/-)
  - Talk button (for two-way audio) - Push to talk or toggle?
  - Snapshot button
- **Info overlay:**
  - Camera name
  - Timestamp
  - Connection status

#### 4. Event Timeline Screen
- **List of events:** Motion/person detection
  - Event type icon (person, motion, etc.)
  - Thumbnail snapshot
  - Timestamp ("2 minutes ago", "Today at 3:45pm")
  - Camera name
  - Tap to view full event

#### 5. Settings Screen
- **Sections:**
  - Account (email, username, tier)
  - Notifications (enable/disable, sound)
  - Camera settings (add/remove cameras)
  - About (version, privacy policy, terms)
  - Log out button

#### 6. Onboarding Flow (First-Time User)
- **Welcome screen:** What's the first thing new users see?
- **Permission requests:**
  - "We need notification permissions to alert you about events"
  - "Camera access is needed for..." (if using phone camera)
- **Add first camera:** Simple wizard or form?

---

### Task 2: UX Flow Diagrams

Create flow diagrams for:

1. **First-time user journey:**
   - Download app → Sign up → Add first camera → Get first notification

2. **Add camera flow:**
   - Scan QR code from Frigate? OR
   - Manual entry (IP address, username, password)?
   - Both options?

3. **PTZ control interaction:**
   - How does directional pad work?
   - Continuous movement while holding? Or tap to move?
   - Haptic feedback?

4. **Two-way audio:**
   - Push-to-talk button (hold to speak)?
   - Toggle on/off?
   - Visual indicator when mic is active?

---

### Task 3: Copy & Content Writing

Write all the text for:

#### App Store Listing
- **App name:** "webcam.org - Privacy-First Security"?
- **Short description** (80 chars max)
- **Full description** (4000 chars max)
  - What is webcam.org?
  - Why choose us over Ring/Nest?
  - Key features
- **Keywords:** "security camera, privacy, frigate, home security, webcam"

#### In-App Copy
- **Empty states:**
  - No cameras: "..."
  - No events: "..."
  - No connection: "..."
- **Error messages:**
  - Login failed: "..."
  - Camera offline: "..."
  - No internet: "..."
- **Success messages:**
  - Camera added: "..."
  - Settings saved: "..."
- **Button labels:**
  - Make them clear and action-oriented

#### Permission Prompts
- **Notifications:** "webcam.org would like to send you notifications when motion is detected at your cameras. This helps keep your home secure."
- **Camera access:** (if needed)
- **Location:** (if using GPS for camera location)

---

### Task 4: Visual Design

Define the design system:

#### Colors
- **Primary color:** What represents webcam.org brand?
- **Secondary color:**
- **Accent color:**
- **Success/error/warning colors:**
- **Background colors:** (light mode and dark mode)

#### Typography
- **Headings:** Font family, sizes (H1, H2, H3)
- **Body text:** Font family, size, line height
- **Button text:** Bold? Uppercase?

#### Icons
- **Style:** Outline or filled?
- **Icons needed:**
  - Camera
  - Settings gear
  - Bell (notifications)
  - PTZ arrows (up, down, left, right)
  - Microphone (for talk)
  - Person icon (for person detection)
  - Motion icon
  - Play/pause
  - Snapshot/photo

#### App Icon
- Design the app icon (1024x1024)
- Should be recognizable and clean
- Consider: Camera lens? Privacy shield? House + camera?

---

### Task 5: Dark Mode

Design dark mode variants for all screens:
- Background colors (dark gray, not pure black)
- Text colors (light gray, not pure white - easier on eyes)
- Accent colors (may need adjustment for dark bg)

---

## 📝 DELIVERABLES

Create these files in `/var/www/webcam.org/mobile-app-design/`:

1. `screens/` folder with markdown files for each screen design
2. `flows/` folder with UX flow descriptions
3. `copy.md` - All app copy/text
4. `design-system.md` - Colors, typography, icons
5. `app-store-listing.md` - App store copy

---

## 🎯 PRIORITY ORDER

1. **Camera List Screen** (home screen - most important!)
2. **Live View Screen** (core functionality)
3. **Login/Signup** (can't use app without it)
4. **Settings Screen** (need to manage cameras)
5. **Event Timeline** (nice to have)
6. **Onboarding** (polish)

---

## 💡 DESIGN INSPIRATION

Think about:
- **Ring app:** What do users expect from a security camera app?
- **Nest app:** How do they handle live view?
- **But make it BETTER:** Focus on privacy, simplicity, no dark patterns

Key differentiators:
- No cloud lock-in messaging
- Privacy-first design
- Open source transparency
- Works with any camera

---

## 🚀 GET STARTED

Start with the Camera List screen design. That's what users see most often!

**Questions?** Check `PARALLEL_DEVELOPMENT_PLAN.md` for context
**Backend docs:** See `backend/API_READY.md`
