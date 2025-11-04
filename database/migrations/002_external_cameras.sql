-- External/Aggregated Cameras Table
-- For webcams scraped from Windy, DOT, YouTube, etc.

CREATE TABLE IF NOT EXISTS external_cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Source tracking
    source VARCHAR(50) NOT NULL, -- 'windy', 'dot_florida', 'youtube', 'earthcam'
    external_id VARCHAR(255) NOT NULL, -- ID in source system
    source_url TEXT NOT NULL, -- Link back to source

    -- Camera details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    camera_type VARCHAR(50), -- 'traffic', 'weather', 'beach', 'city', 'nature', 'harbor', 'airport'

    -- Location (PostGIS)
    location GEOGRAPHY(POINT, 4326), -- lat/long WGS84
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(2), -- ISO country code

    -- Stream/Embed info
    embed_type VARCHAR(20) DEFAULT 'iframe', -- 'iframe', 'hls', 'youtube', 'image_refresh'
    embed_url TEXT, -- URL for embedding (iframe src, HLS stream, etc.)
    thumbnail_url TEXT,

    -- Status
    is_online BOOLEAN DEFAULT TRUE,
    last_checked_at TIMESTAMP,
    view_count INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Metadata (extensible JSON for source-specific data)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Unique constraint: one entry per external source+ID
    CONSTRAINT unique_external_camera UNIQUE (source, external_id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_external_cameras_location
    ON external_cameras USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_external_cameras_source
    ON external_cameras(source);

CREATE INDEX IF NOT EXISTS idx_external_cameras_type
    ON external_cameras(camera_type);

CREATE INDEX IF NOT EXISTS idx_external_cameras_country
    ON external_cameras(country);

CREATE INDEX IF NOT EXISTS idx_external_cameras_online
    ON external_cameras(is_online)
    WHERE is_online = TRUE;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_external_cameras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_external_cameras_updated_at
    BEFORE UPDATE ON external_cameras
    FOR EACH ROW
    EXECUTE FUNCTION update_external_cameras_updated_at();

-- View: Combine user cameras + external cameras for unified query
CREATE OR REPLACE VIEW all_public_cameras AS
SELECT
    id,
    'user' as source_type,
    owner_id::text as owner,
    name,
    description,
    camera_type,
    location,
    city,
    state,
    country,
    'webrtc' as embed_type,
    NULL as embed_url,
    thumbnail_url,
    is_online,
    created_at
FROM cameras
WHERE is_public = TRUE AND is_approved = TRUE AND is_online = TRUE

UNION ALL

SELECT
    id,
    'external' as source_type,
    source as owner,
    name,
    description,
    camera_type,
    location,
    city,
    state,
    country,
    embed_type,
    embed_url,
    thumbnail_url,
    is_online,
    created_at
FROM external_cameras
WHERE is_online = TRUE;

-- Function: Get nearby cameras (both user and external)
CREATE OR REPLACE FUNCTION get_nearby_public_cameras(
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 50,
    max_results INT DEFAULT 100
)
RETURNS TABLE (
    camera_id UUID,
    source_type VARCHAR,
    name VARCHAR,
    camera_type VARCHAR,
    distance_meters DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    thumbnail_url TEXT,
    embed_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.source_type,
        c.name,
        c.camera_type,
        ST_Distance(
            c.location,
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
        ) as distance_meters,
        ST_Y(c.location::geometry) as latitude,
        ST_X(c.location::geometry) as longitude,
        c.thumbnail_url,
        c.embed_url
    FROM all_public_cameras c
    WHERE ST_DWithin(
        c.location,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
        radius_km * 1000
    )
    ORDER BY distance_meters ASC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Sample query examples (commented out):
/*
-- Get all cameras near Miami (25.7617, -80.1918)
SELECT * FROM get_nearby_public_cameras(25.7617, -80.1918, 50, 20);

-- Get all external cameras from Windy
SELECT id, name, city, state FROM external_cameras WHERE source = 'windy' AND is_online = TRUE;

-- Count cameras by type
SELECT camera_type, COUNT(*) FROM all_public_cameras GROUP BY camera_type ORDER BY COUNT(*) DESC;

-- Get cameras within bounding box (Florida)
SELECT name, city, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lon
FROM external_cameras
WHERE location && ST_MakeEnvelope(-87.6, 24.5, -80.0, 31.0, 4326);
*/
