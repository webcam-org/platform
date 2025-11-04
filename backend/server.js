/**
 * webcam.org Backend API
 * Receives Frigate events and sends push notifications
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'temporary_dev_secret';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'firebase-admin-key.json');
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✓ Firebase Admin initialized');
} else {
  console.warn('⚠ Firebase key not found - push notifications disabled');
}

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware (for now, just checks for admin email - TODO: add role field)
const requireAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    // TODO: Replace with proper role check when roles are added
    const email = result.rows[0].email;
    const isAdmin = email.endsWith('@webcam.org') || email === process.env.ADMIN_EMAIL;

    if (!isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost/webcamorg'
});

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✓ Database connected');
  }
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'webcam.org API' });
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and username are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email or username already exists'
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, tier)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, tier, created_at`,
      [email, username, password_hash, 'free']
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        tier: user.tier,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, username, password_hash, tier, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        tier: user.tier,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's cameras
app.get('/api/cameras', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, type, location, is_public, status, created_at
       FROM cameras
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      cameras: result.rows
    });
  } catch (error) {
    console.error('Get cameras error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register a new camera
app.post('/api/cameras', authenticateToken, async (req, res) => {
  try {
    const { name, type, location, is_public } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Camera name and type are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO cameras (owner_id, name, type, location, is_public, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, type, location, is_public, status, created_at`,
      [req.user.id, name, type, location || null, is_public || false, 'active']
    );

    const camera = result.rows[0];

    console.log(`📷 New camera registered: ${name} (user: ${req.user.email})`);

    res.status(201).json({
      success: true,
      camera
    });
  } catch (error) {
    console.error('Camera registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get public webcams (for map)
app.get('/api/webcams/public', async (req, res) => {
  try {
    const { lat, lon, radius } = req.query;

    let query;
    let params;

    if (lat && lon && radius) {
      // Get webcams within radius using PostGIS
      const radiusKm = parseFloat(radius) || 50;
      query = `
        SELECT id, name,
               ST_Y(location::geometry) as lat,
               ST_X(location::geometry) as lon,
               embed_url, source, city
        FROM external_cameras
        WHERE ST_DWithin(
          location::geography,
          ST_MakePoint($1, $2)::geography,
          $3 * 1000
        )
        ORDER BY ST_Distance(
          location::geography,
          ST_MakePoint($1, $2)::geography
        )
        LIMIT 100
      `;
      params = [parseFloat(lon), parseFloat(lat), radiusKm];
    } else {
      // Get all public webcams
      query = `
        SELECT id, name,
               ST_Y(location::geometry) as lat,
               ST_X(location::geometry) as lon,
               embed_url, source, city
        FROM external_cameras
        WHERE location IS NOT NULL
        LIMIT 200
      `;
      params = [];
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      webcams: result.rows
    });
  } catch (error) {
    console.error('Get public webcams error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single webcam details
app.get('/api/webcams/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name,
              ST_Y(location::geometry) as lat,
              ST_X(location::geometry) as lon,
              embed_url, source, city, created_at
       FROM external_cameras
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Webcam not found'
      });
    }

    res.json({
      success: true,
      webcam: result.rows[0]
    });
  } catch (error) {
    console.error('Get webcam error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register device for push notifications
app.post('/api/devices/register', authenticateToken, async (req, res) => {
  try {
    const { device_id, fcm_token, platform } = req.body;

    if (!device_id || !fcm_token) {
      return res.status(400).json({
        success: false,
        error: 'device_id and fcm_token are required'
      });
    }

    // Upsert device registration
    const result = await pool.query(
      `INSERT INTO user_devices (user_id, device_id, fcm_token, platform)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, device_id)
       DO UPDATE SET fcm_token = $3, platform = $4, updated_at = NOW()
       RETURNING id, device_id, platform, created_at`,
      [req.user.id, device_id, fcm_token, platform || 'unknown']
    );

    console.log(`📱 Device registered: ${device_id} (user: ${req.user.email})`);

    res.json({
      success: true,
      device: result.rows[0]
    });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Receive events from Frigate integration
app.post('/api/events', async (req, res) => {
  try {
    const { camera, event_type, confidence, timestamp } = req.body;

    console.log(`📨 Event: ${event_type} on ${camera} (${confidence})`);

    // Save event to database
    const eventResult = await pool.query(
      `INSERT INTO camera_events (camera_id, event_type, confidence, occurred_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [camera, event_type, confidence || 0, timestamp || new Date()]
    );

    console.log(`   ✓ Event saved to database`);

    // Get camera owner to send notification
    const cameraResult = await pool.query(
      `SELECT owner_id, name FROM cameras WHERE id = $1`,
      [camera]
    );

    if (cameraResult.rows.length > 0) {
      const { owner_id, name: cameraName } = cameraResult.rows[0];

      // Get user's FCM tokens
      const devicesResult = await pool.query(
        `SELECT fcm_token FROM user_devices WHERE user_id = $1 AND fcm_token IS NOT NULL`,
        [owner_id]
      );

      if (devicesResult.rows.length > 0 && admin.apps.length > 0) {
        const fcmTokens = devicesResult.rows.map(d => d.fcm_token);

        // Create notification message
        const notificationTitle = event_type === 'person'
          ? 'Person Detected'
          : event_type === 'car'
          ? 'Vehicle Detected'
          : 'Motion Detected';

        const notificationBody = `${notificationTitle} at ${cameraName}`;

        const message = {
          notification: {
            title: notificationTitle,
            body: notificationBody
          },
          data: {
            camera_id: camera,
            event_type: event_type,
            event_id: eventResult.rows[0].id.toString()
          },
          tokens: fcmTokens
        };

        try {
          const response = await admin.messaging().sendEachForMulticast(message);
          console.log(`   ✓ Push sent to ${response.successCount} device(s)`);

          // Save notification record
          await pool.query(
            `INSERT INTO notifications (user_id, camera_id, type, title, body, delivery_method, sent_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [owner_id, camera, event_type, notificationTitle, notificationBody, 'push']
          );
        } catch (fcmError) {
          console.error('   ⚠ FCM error:', fcmError.message);
        }
      }
    }

    res.json({ success: true, message: 'Event received' });
  } catch (error) {
    console.error('Event error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send push notification
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { user_id, title, body, camera_id } = req.body;

    console.log(`🔔 Notification: ${title} for user ${user_id}`);

    // Save notification to database
    const notificationResult = await pool.query(
      `INSERT INTO notifications (user_id, camera_id, type, title, body, delivery_method)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [user_id, camera_id, 'motion', title, body, 'push']
    );

    const notificationId = notificationResult.rows[0].id;

    // Get user's registered devices
    const devicesResult = await pool.query(
      `SELECT fcm_token, platform FROM user_devices WHERE user_id = $1 AND fcm_token IS NOT NULL`,
      [user_id]
    );

    const devices = devicesResult.rows;

    if (devices.length === 0) {
      console.log(`   ⚠ No devices registered for user ${user_id}`);
      return res.json({
        success: true,
        message: 'Notification saved but no devices to send to',
        notification_id: notificationId
      });
    }

    // Send via Firebase Cloud Messaging
    if (admin.apps.length > 0) {
      const fcmTokens = devices.map(d => d.fcm_token);

      const message = {
        notification: {
          title: title,
          body: body
        },
        data: {
          camera_id: camera_id || '',
          notification_id: notificationId.toString()
        },
        tokens: fcmTokens
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`   ✓ Sent to ${response.successCount}/${fcmTokens.length} devices`);

        if (response.failureCount > 0) {
          console.log(`   ⚠ ${response.failureCount} failures:`,
            response.responses.filter(r => !r.success).map(r => r.error?.message)
          );
        }

        res.json({
          success: true,
          message: 'Notification sent',
          notification_id: notificationId,
          sent_count: response.successCount,
          failed_count: response.failureCount
        });
      } catch (fcmError) {
        console.error('FCM send error:', fcmError);
        res.json({
          success: false,
          error: 'Failed to send push notification',
          details: fcmError.message
        });
      }
    } else {
      console.log(`   ⚠ Firebase not initialized`);
      res.json({
        success: true,
        message: 'Notification saved but Firebase not configured',
        notification_id: notificationId
      });
    }
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin/Moderation endpoints
app.get('/api/admin/stats', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM cameras WHERE is_public = true AND is_approved = false) as pending_cameras,
        (SELECT COUNT(*) FROM camera_reports WHERE status = 'pending') as open_reports,
        (SELECT COUNT(*) FROM cameras WHERE is_approved = true AND created_at > NOW() - INTERVAL '7 days') as recent_approvals
    `);

    res.json({
      success: true,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/cameras/queue', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.description, c.city, c.state, c.owner_id,
             u.username, u.email,
             ST_Y(c.location::geometry) as lat,
             ST_X(c.location::geometry) as lon,
             c.thumbnail_url, c.created_at
      FROM cameras c
      JOIN users u ON c.owner_id = u.id
      WHERE c.is_public = true AND c.is_approved = false
      ORDER BY c.created_at ASC
      LIMIT 50
    `);

    res.json({
      success: true,
      cameras: result.rows
    });
  } catch (error) {
    console.error('Camera queue error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/cameras/:id/approve', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE cameras SET is_approved = true, updated_at = NOW() WHERE id = $1',
      [id]
    );

    console.log(`✅ Camera approved: ${id} by ${req.user.email}`);

    res.json({ success: true, message: 'Camera approved' });
  } catch (error) {
    console.error('Approve camera error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/cameras/:id/reject', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await pool.query(
      'UPDATE cameras SET is_approved = false, is_public = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    console.log(`❌ Camera rejected: ${id} (reason: ${reason || 'none'})`);

    res.json({ success: true, message: 'Camera rejected' });
  } catch (error) {
    console.error('Reject camera error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/reports', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.camera_id, r.reporter_id, r.reason, r.comment, r.status,
             c.name as camera_name, c.owner_id,
             u.username as reporter_username,
             r.created_at
      FROM camera_reports r
      JOIN cameras c ON r.camera_id = c.id
      LEFT JOIN users u ON r.reporter_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at ASC
      LIMIT 50
    `);

    res.json({
      success: true,
      reports: result.rows
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/reports/:id/dismiss', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE camera_reports SET status = $1, updated_at = NOW() WHERE id = $2',
      ['dismissed', id]
    );

    console.log(`✓ Report dismissed: ${id}`);

    res.json({ success: true, message: 'Report dismissed' });
  } catch (error) {
    console.error('Dismiss report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/reports/:id/remove-camera', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // Get camera_id from report
    const report = await pool.query(
      'SELECT camera_id FROM camera_reports WHERE id = $1',
      [id]
    );

    if (report.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const camera_id = report.rows[0].camera_id;

    // Remove camera (set is_public=false, is_approved=false)
    await pool.query(
      'UPDATE cameras SET is_public = false, is_approved = false WHERE id = $1',
      [camera_id]
    );

    // Mark report as resolved
    await pool.query(
      'UPDATE camera_reports SET status = $1, updated_at = NOW() WHERE id = $2',
      ['resolved', id]
    );

    console.log(`🚫 Camera removed: ${camera_id} (report: ${id})`);

    res.json({ success: true, message: 'Camera removed from public directory' });
  } catch (error) {
    console.error('Remove camera error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Desktop app endpoints
app.post('/api/desktop/register', async (req, res) => {
  try {
    const { device_id, os, webcam_info, user_id } = req.body;

    if (!device_id) {
      return res.status(400).json({
        success: false,
        error: 'device_id is required'
      });
    }

    // Generate API key for desktop app
    const api_key = jwt.sign(
      { device_id, type: 'desktop', user_id },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    console.log(`💻 Desktop app registered: ${device_id} (OS: ${os})`);

    res.json({
      success: true,
      api_key,
      config: {
        api_url: process.env.API_URL || 'http://localhost:4000',
        upload_endpoint: '/api/desktop/upload',
        event_endpoint: '/api/desktop/events'
      }
    });
  } catch (error) {
    console.error('Desktop registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/desktop/events', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ success: false, error: 'API key required' });
    }

    // Verify API key
    const decoded = jwt.verify(apiKey, JWT_SECRET);

    const { event_type, confidence, timestamp, camera_name } = req.body;

    console.log(`💻 Desktop event: ${event_type} from ${decoded.device_id}`);

    // Save event (using device_id as camera identifier)
    await pool.query(
      `INSERT INTO camera_events (camera_id, event_type, confidence, occurred_at)
       VALUES ($1, $2, $3, $4)`,
      [decoded.device_id, event_type, confidence || 0, timestamp || new Date()]
    );

    res.json({ success: true, message: 'Event received' });
  } catch (error) {
    console.error('Desktop event error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 webcam.org API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

// WebRTC Signaling Server (WebSocket)
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server, path: '/signaling' });

const peers = new Map(); // Map of peer connections

wss.on('connection', (ws, req) => {
  const peerId = req.headers['sec-websocket-key'];

  console.log(`🔗 WebRTC peer connected: ${peerId.substring(0, 8)}...`);

  peers.set(peerId, { ws, metadata: {} });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'register':
          // Register peer as camera or viewer
          peers.get(peerId).metadata = {
            role: data.role, // 'camera' or 'viewer'
            camera_id: data.camera_id,
            user_id: data.user_id
          };
          console.log(`   Registered as ${data.role}: ${data.camera_id || data.user_id}`);
          ws.send(JSON.stringify({ type: 'registered', peer_id: peerId }));
          break;

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          // Forward signaling messages to target peer
          const targetId = data.target_peer_id;
          const targetPeer = peers.get(targetId);

          if (targetPeer) {
            targetPeer.ws.send(JSON.stringify({
              ...data,
              from_peer_id: peerId
            }));
            console.log(`   Forwarded ${data.type} to ${targetId.substring(0, 8)}...`);
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Target peer not found'
            }));
          }
          break;

        case 'list-cameras':
          // List available camera streams
          const cameras = [];
          peers.forEach((peer, id) => {
            if (peer.metadata.role === 'camera') {
              cameras.push({
                peer_id: id,
                camera_id: peer.metadata.camera_id
              });
            }
          });
          ws.send(JSON.stringify({
            type: 'camera-list',
            cameras
          }));
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log(`🔌 Peer disconnected: ${peerId.substring(0, 8)}...`);
    peers.delete(peerId);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log(`🔗 WebRTC signaling server on ws://localhost:${PORT}/signaling`);
