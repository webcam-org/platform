# Backend API - Ready for Integration

**Status:** Backend API running on port 4000 ✅
**Database:** PostgreSQL connected ✅
**Last Updated:** 2025-11-04

## Completed Endpoints

### Authentication

#### Register User
```
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"  // min 8 chars
}

Response (201):
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "tier": "free",
    "created_at": "timestamp"
  }
}
```

#### Login
```
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "user": { ... }
}
```

### Cameras (Protected Routes)

**All camera endpoints require:**
```
Authorization: Bearer {JWT_TOKEN}
```

#### Get User's Cameras
```
GET http://localhost:4000/api/cameras
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "cameras": [
    {
      "id": "uuid",
      "name": "Front Door Camera",
      "type": "rtsp",
      "location": {"lat": 37.7749, "lon": -122.4194},
      "is_public": false,
      "status": "active",
      "created_at": "timestamp"
    }
  ]
}
```

#### Register Camera
```
POST http://localhost:4000/api/cameras
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Front Door Camera",
  "type": "rtsp",
  "location": {"lat": 37.7749, "lon": -122.4194},  // optional
  "is_public": false  // optional, defaults to false
}

Response (201):
{
  "success": true,
  "camera": { ... }
}
```

### Events

#### Receive Frigate Event (No Auth Required)
```
POST http://localhost:4000/api/events
Content-Type: application/json

{
  "camera": "camera_id",
  "event_type": "person",
  "confidence": 0.95,
  "timestamp": "ISO8601_timestamp"
}

Response (200):
{
  "success": true,
  "message": "Event received"
}
```

### Notifications

#### Send Push Notification (No Auth Required - For Integration Service)
```
POST http://localhost:4000/api/notifications/send
Content-Type: application/json

{
  "user_id": "uuid",
  "title": "Motion Detected",
  "body": "Person detected at Front Door Camera",
  "camera_id": "camera_id"
}

Response (200):
{
  "success": true,
  "message": "Notification queued"
}
```

## Database Connection

```
Database: webcamorg
User: webcamorg
Password: webcam_dev_2025
Connection String: postgresql://webcamorg:webcam_dev_2025@localhost/webcamorg
```

## Environment Variables

Located in `/var/www/webcam.org/backend/.env`:
```
DATABASE_URL=postgresql://webcamorg:webcam_dev_2025@localhost/webcamorg
PORT=4000
JWT_SECRET=temporary_dev_secret_change_in_production_2025
NODE_ENV=development
```

## Next Steps for Mobile App (Gemini/Codex)

1. **Authentication Flow:**
   - Use `/api/auth/register` and `/api/auth/login`
   - Store JWT token securely
   - Include token in Authorization header for all protected requests

2. **Camera Management:**
   - Fetch user's cameras with `/api/cameras` (GET)
   - Register new cameras with `/api/cameras` (POST)

3. **Push Notifications:**
   - Register device FCM token with backend (endpoint TODO)
   - Backend will send notifications via Firebase when events occur

## Firebase Integration - TODO

Firebase Admin SDK setup is pending. Will need:
- Firebase project creation
- `firebase-adminsdk-key.json` file
- Update `.env` with Firebase credentials

## Testing

Server is running and accessible at `http://localhost:4000`

Test health check:
```bash
curl http://localhost:4000/health
```

Test user registration:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","username":"newuser","password":"testpass123"}'
```
