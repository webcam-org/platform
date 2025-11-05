# GEMINI - Admin Dashboard Implementation

**Your mockups are ready:** See `ADMIN_DASHBOARD_MOCKUPS.md`
**Backend APIs are ready:** I (Claude) just built all the endpoints you need

---

## 🎯 BUILD THIS NOW

Create `/var/www/webcam.org/admin/` with HTML/CSS/JS for the moderation dashboard.

### Files to Create:

```
/var/www/webcam.org/admin/
├── index.html          # Login + Dashboard overview
├── cameras.html        # Camera review queue
├── reports.html        # User reports
├── css/
│   └── admin.css       # Styling
└── js/
    └── admin.js        # API calls, logic
```

---

## 📡 Backend APIs Available (Claude Built These)

### Dashboard Stats
```javascript
GET http://localhost:4000/api/admin/stats
Authorization: Bearer {JWT_TOKEN}

Response:
{
  "success": true,
  "stats": {
    "pending_cameras": 5,
    "open_reports": 3,
    "recent_approvals": 12
  }
}
```

### Camera Review Queue
```javascript
GET http://localhost:4000/api/admin/cameras/queue
Authorization: Bearer {JWT_TOKEN}

Response:
{
  "success": true,
  "cameras": [
    {
      "id": "uuid",
      "name": "Front Porch Camera",
      "description": "...",
      "city": "Miami",
      "username": "user123",
      "email": "user@example.com",
      "lat": 25.7617,
      "lon": -80.1918,
      "thumbnail_url": "...",
      "created_at": "2025-11-04T10:00:00Z"
    }
  ]
}
```

### Approve/Reject Camera
```javascript
POST http://localhost:4000/api/admin/cameras/{id}/approve
Authorization: Bearer {JWT_TOKEN}

POST http://localhost:4000/api/admin/cameras/{id}/reject
Authorization: Bearer {JWT_TOKEN}
Body: { "reason": "Privacy violation" }
```

### Reports
```javascript
GET http://localhost:4000/api/admin/reports
Authorization: Bearer {JWT_TOKEN}

Response:
{
  "success": true,
  "reports": [
    {
      "id": "uuid",
      "camera_id": "uuid",
      "camera_name": "Some Camera",
      "reason": "privacy_violation",
      "comment": "Camera pointed at neighbor's yard",
      "reporter_username": "user456",
      "status": "pending",
      "created_at": "..."
    }
  ]
}
```

### Handle Reports
```javascript
POST http://localhost:4000/api/admin/reports/{id}/dismiss
POST http://localhost:4000/api/admin/reports/{id}/remove-camera
```

---

## 🎨 Implementation Guidance

### 1. Login Screen (`admin/index.html`)
- Simple email/password form
- Use `/api/auth/login` endpoint
- Store JWT token in localStorage
- Only allow @webcam.org emails (backend checks this)

### 2. Dashboard Overview
- Show stats cards (pending cameras, open reports)
- Links to Camera Queue and Reports
- "Recently Approved" list

### 3. Camera Review Screen (`admin/cameras.html`)
- List of pending cameras from `/api/admin/cameras/queue`
- For each camera:
  - Show thumbnail (if available)
  - Show name, location, username
  - Embed the live feed (or iframe to camera stream_url)
  - Checklist from your mockup:
    - [ ] Public space
    - [ ] No privacy invasion
    - [ ] No inappropriate content
  - Approve/Reject buttons

### 4. Reports Screen (`admin/reports.html`)
- List of pending reports
- Show camera feed
- Show report reason and comment
- Actions: Dismiss, Remove Camera

---

## 📝 Tech Stack

Use whatever you prefer:
- **Vanilla HTML/CSS/JS** (simple, no build step)
- **Or React/Vue** if you want (requires build setup)

**Recommend:** Vanilla JS for speed - this is internal tool, doesn't need to be fancy

---

## 🔐 Authentication

Users must login with @webcam.org email. Backend will reject others.

Example login flow:
```javascript
// In admin.js
async function login(email, password) {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('admin_token', data.token);
    window.location.href = '/admin/dashboard.html';
  }
}

// Include token in all API calls
const token = localStorage.getItem('admin_token');
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

---

## ✅ Deliverables

1. Working admin dashboard at `/admin/`
2. Can login with @webcam.org email
3. Can view pending cameras
4. Can approve/reject cameras
5. Can view and handle reports

---

## 🚀 Priority

**Start with:** Camera review queue - that's the most critical moderation tool!

1. Build camera review UI
2. Wire up approve/reject buttons
3. Then do reports
4. Dashboard stats last (nice to have)

---

**Questions?** All backend APIs are documented above. Just fetch and display the data!
