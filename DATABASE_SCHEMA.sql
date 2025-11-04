-- webcam.org Database Schema
-- PostgreSQL 15+ with PostGIS extension

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),

    -- Account status
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Subscription tier
    tier VARCHAR(20) DEFAULT 'free', -- 'free', 'plus', 'pro'
    tier_expires_at TIMESTAMP,

    -- Privacy settings
    show_on_map BOOLEAN DEFAULT FALSE,
    allow_public_profile BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_tier ON users(tier);

-- ============================================
-- CAMERAS
-- ============================================

CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    camera_type VARCHAR(50), -- 'webcam', 'doorbell', 'security', 'wildlife', 'traffic', 'weather'

    -- Location (PostGIS)
    location GEOGRAPHY(POINT, 4326), -- lat/long WGS84
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(2), -- ISO country code
    timezone VARCHAR(50),

    -- Privacy & Visibility
    is_public BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) DEFAULT 'private', -- 'private', 'neighborhood', 'public'
    neighborhood_radius_meters INT DEFAULT 500, -- for 'neighborhood' visibility

    -- Stream info
    stream_type VARCHAR(20) DEFAULT 'webrtc', -- 'webrtc', 'hls', 'rtsp', 'mjpeg'
    stream_url TEXT, -- Internal URL (not exposed publicly)
    thumbnail_url TEXT,

    -- Technical details
    resolution VARCHAR(20), -- '1920x1080', '1280x720', etc.
    fps INT,
    has_audio BOOLEAN DEFAULT FALSE,
    has_ptz BOOLEAN DEFAULT FALSE, -- Pan/Tilt/Zoom

    -- Integration details
    integration_type VARCHAR(50), -- 'frigate', 'motioneye', 'zoneminder', 'manual'
    integration_id VARCHAR(255), -- Camera ID in source system
    webhook_url TEXT, -- For receiving events

    -- Stats
    view_count INT DEFAULT 0,
    uptime_percent DECIMAL(5,2),
    last_seen_at TIMESTAMP,

    -- Status
    is_online BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE, -- For moderation

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Metadata (for extensibility)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Tags (for search/filtering)
    tags TEXT[] DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_cameras_owner ON cameras(owner_id);
CREATE INDEX idx_cameras_public ON cameras(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_cameras_type ON cameras(camera_type);
CREATE INDEX idx_cameras_location ON cameras USING GIST(location);
CREATE INDEX idx_cameras_online ON cameras(is_online);
CREATE INDEX idx_cameras_tags ON cameras USING GIN(tags);
CREATE INDEX idx_cameras_metadata ON cameras USING GIN(metadata);

-- Geospatial query helper function
CREATE OR REPLACE FUNCTION nearby_cameras(
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10,
    only_public BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    camera_id UUID,
    name VARCHAR,
    distance_meters DOUBLE PRECISION,
    location GEOGRAPHY
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        ST_Distance(
            c.location,
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
        ) as distance_meters,
        c.location
    FROM cameras c
    WHERE
        (only_public = FALSE OR c.is_public = TRUE)
        AND c.is_online = TRUE
        AND c.is_approved = TRUE
        AND ST_DWithin(
            c.location,
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
            radius_km * 1000
        )
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CAMERA EVENTS (Motion, Doorbell, etc.)
-- ============================================

CREATE TABLE camera_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,

    -- Event details
    event_type VARCHAR(50) NOT NULL, -- 'motion', 'person', 'vehicle', 'doorbell', 'alert'
    confidence DECIMAL(3,2), -- 0.00 to 1.00

    -- Media
    snapshot_url TEXT,
    clip_url TEXT,
    clip_duration_seconds INT,

    -- Detection details
    detected_objects JSONB, -- Array of {type, confidence, bbox}
    zones TEXT[], -- Which zones triggered

    -- Timestamps
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_events_camera ON camera_events(camera_id);
CREATE INDEX idx_events_type ON camera_events(event_type);
CREATE INDEX idx_events_occurred ON camera_events(occurred_at DESC);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,
    event_id UUID REFERENCES camera_events(id) ON DELETE SET NULL,

    -- Notification details
    type VARCHAR(50) NOT NULL, -- 'motion', 'person', 'doorbell', 'offline', 'system'
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,

    -- Delivery
    delivery_method VARCHAR(20) DEFAULT 'push', -- 'push', 'email', 'sms'
    fcm_token VARCHAR(255), -- Firebase Cloud Messaging token
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- USER DEVICES (Mobile Apps)
-- ============================================

CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Device info
    device_name VARCHAR(100),
    device_type VARCHAR(20), -- 'ios', 'android', 'web'
    device_id VARCHAR(255) UNIQUE NOT NULL, -- Device-specific identifier

    -- Push notifications
    fcm_token VARCHAR(255) UNIQUE,
    fcm_token_updated_at TIMESTAMP,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb -- OS version, app version, etc.
);

CREATE INDEX idx_devices_user ON user_devices(user_id);
CREATE INDEX idx_devices_fcm ON user_devices(fcm_token) WHERE fcm_token IS NOT NULL;

-- ============================================
-- CAMERA INTEGRATIONS (Frigate, MotionEye, etc.)
-- ============================================

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Integration details
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'frigate', 'motioneye', 'zoneminder', 'manual'

    -- Connection
    base_url TEXT NOT NULL,
    api_key VARCHAR(255),
    webhook_secret VARCHAR(255), -- For verifying incoming webhooks

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    last_error TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Config
    config JSONB DEFAULT '{}'::jsonb -- Integration-specific settings
);

CREATE INDEX idx_integrations_user ON integrations(user_id);
CREATE INDEX idx_integrations_type ON integrations(type);

-- ============================================
-- WATCHLISTS (Favorite Cameras)
-- ============================================

CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,

    -- Organization
    list_name VARCHAR(100) DEFAULT 'default',
    order_index INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, camera_id)
);

CREATE INDEX idx_watchlists_user ON watchlists(user_id);

-- ============================================
-- CAMERA REPORTS (Moderation)
-- ============================================

CREATE TABLE camera_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Report details
    reason VARCHAR(50) NOT NULL, -- 'inappropriate', 'offline', 'fake', 'spam', 'other'
    description TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    resolution_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_camera ON camera_reports(camera_id);
CREATE INDEX idx_reports_status ON camera_reports(status);

-- ============================================
-- WEBRTC SIGNALING (Temporary Session Data)
-- ============================================

CREATE TABLE webrtc_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Session details
    session_token VARCHAR(255) UNIQUE NOT NULL,
    signaling_data JSONB, -- SDP offers/answers

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL, -- Auto-expire after 1 hour
    ended_at TIMESTAMP
);

CREATE INDEX idx_webrtc_sessions_camera ON webrtc_sessions(camera_id);
CREATE INDEX idx_webrtc_sessions_token ON webrtc_sessions(session_token);

-- Auto-cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_webrtc_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM webrtc_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ANALYTICS (Optional - for stats)
-- ============================================

CREATE TABLE camera_views (
    id BIGSERIAL PRIMARY KEY,
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous

    -- View details
    duration_seconds INT,
    quality VARCHAR(20), -- 'sd', 'hd', '1080p'

    -- Location (viewer)
    viewer_country VARCHAR(2),
    viewer_city VARCHAR(100),

    -- Timestamps
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

CREATE INDEX idx_views_camera ON camera_views(camera_id);
CREATE INDEX idx_views_started ON camera_views(started_at);

-- Aggregate stats (for dashboard)
CREATE MATERIALIZED VIEW camera_stats AS
SELECT
    c.id as camera_id,
    c.name,
    c.owner_id,
    COUNT(DISTINCT cv.viewer_id) as unique_viewers,
    COUNT(cv.id) as total_views,
    AVG(cv.duration_seconds) as avg_view_duration,
    MAX(cv.started_at) as last_viewed_at
FROM cameras c
LEFT JOIN camera_views cv ON c.id = cv.camera_id
WHERE cv.started_at > NOW() - INTERVAL '30 days'
GROUP BY c.id, c.name, c.owner_id;

CREATE UNIQUE INDEX idx_camera_stats_id ON camera_stats(camera_id);

-- Refresh stats daily (run via cron)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY camera_stats;

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON user_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (for development)
-- ============================================

-- Insert a test user
INSERT INTO users (email, username, display_name, password_hash, is_verified)
VALUES ('test@webcam.org', 'testuser', 'Test User', '$2a$10$...', TRUE);

-- Insert sample public cameras
INSERT INTO cameras (owner_id, name, description, camera_type, location, is_public, visibility, city, country)
VALUES
    (
        (SELECT id FROM users WHERE email = 'test@webcam.org'),
        'Downtown Traffic Cam',
        'View of Main St and 5th Ave intersection',
        'traffic',
        ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography, -- San Francisco
        TRUE,
        'public',
        'San Francisco',
        'US'
    ),
    (
        (SELECT id FROM users WHERE email = 'test@webcam.org'),
        'Beach Surf Cam',
        'Live surf conditions at Ocean Beach',
        'weather',
        ST_SetSRID(ST_MakePoint(-122.5096, 37.7694), 4326)::geography,
        TRUE,
        'public',
        'San Francisco',
        'US'
    );

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Find cameras near a location
-- SELECT * FROM nearby_cameras(37.7749, -122.4194, 5.0);

-- Get user's cameras with stats
-- SELECT c.*, cs.unique_viewers, cs.total_views
-- FROM cameras c
-- LEFT JOIN camera_stats cs ON c.id = cs.camera_id
-- WHERE c.owner_id = 'USER_UUID';

-- Get unread notifications for user
-- SELECT n.*, c.name as camera_name
-- FROM notifications n
-- JOIN cameras c ON n.camera_id = c.id
-- WHERE n.user_id = 'USER_UUID' AND n.is_read = FALSE
-- ORDER BY n.created_at DESC;
