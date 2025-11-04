# Webcam Scrapers

Scripts to aggregate public webcams from various sources (Windy, DOT, YouTube, etc.)

## Setup

### 1. Install Dependencies

```bash
cd /data/www/webcam.org/scrapers
npm init -y
npm install pg
```

### 2. Set Up Database

Run the migration to create the external_cameras table:

```bash
psql $DATABASE_URL -f ../database/migrations/002_external_cameras.sql
```

Or if you have PostgreSQL locally:
```bash
psql -U youruser -d webcamorg -f ../database/migrations/002_external_cameras.sql
```

### 3. Get API Keys

#### Windy API Key
1. Go to https://api.windy.com/keys
2. Create a free account
3. Generate an API key
4. Copy the key for next step

#### Environment Variables

Create `.env` file:
```bash
WINDY_API_KEY=your_windy_api_key_here
DATABASE_URL=postgresql://user:pass@localhost:5432/webcamorg
```

Or export directly:
```bash
export WINDY_API_KEY="your_key_here"
export DATABASE_URL="postgresql://user:pass@localhost:5432/webcamorg"
```

## Running Scrapers

### Windy Webcams (Florida)

```bash
node windy_scraper.js
```

This will:
- Fetch all webcams in Florida bounding box from Windy API
- Extract lat/long coordinates
- Save to `external_cameras` table
- Deduplicate (won't create duplicates on re-run)

**Expected result:** ~50-200 webcams in Florida

### Customize Location

Edit `windy_scraper.js` and change the bounding box:

```javascript
const FLORIDA_BBOX = {
  north: 31.0,    // Northern latitude
  east: -80.0,    // Eastern longitude
  south: 24.5,    // Southern latitude
  west: -87.6     // Western longitude
};
```

**Examples:**
- California: `{north: 42.0, east: -114.1, south: 32.5, west: -124.4}`
- New York: `{north: 45.0, east: -71.8, south: 40.5, west: -79.8}`
- Entire USA: `{north: 49.0, east: -66.9, south: 24.5, west: -125.0}`

**Warning:** Larger areas = more API requests. Windy free tier has rate limits.

## Scheduling Regular Updates

### Cron Job (Daily Updates)

```bash
crontab -e
```

Add this line to run daily at 3 AM:
```
0 3 * * * cd /data/www/webcam.org/scrapers && /usr/bin/node windy_scraper.js >> /var/log/windy_scraper.log 2>&1
```

### Systemd Timer (Recommended for Production)

Create `/etc/systemd/system/webcam-scraper.service`:
```ini
[Unit]
Description=Webcam.org Scraper
After=network.target postgresql.service

[Service]
Type=oneshot
User=www-data
WorkingDirectory=/data/www/webcam.org/scrapers
Environment="WINDY_API_KEY=your_key"
Environment="DATABASE_URL=postgresql://..."
ExecStart=/usr/bin/node windy_scraper.js
```

Create `/etc/systemd/system/webcam-scraper.timer`:
```ini
[Unit]
Description=Run webcam scraper daily
Requires=webcam-scraper.service

[Timer]
OnCalendar=daily
OnBootSec=10min
Persistent=true

[Install]
WantedBy=timers.target
```

Enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable webcam-scraper.timer
sudo systemctl start webcam-scraper.timer
```

## Querying Data

### Get All Cameras
```sql
SELECT name, city, state, camera_type, source
FROM external_cameras
WHERE is_online = TRUE
ORDER BY created_at DESC;
```

### Get Nearby Cameras (Miami example)
```sql
SELECT * FROM get_nearby_public_cameras(25.7617, -80.1918, 50, 20);
-- (latitude, longitude, radius_km, max_results)
```

### Count by Source
```sql
SELECT source, COUNT(*)
FROM external_cameras
GROUP BY source
ORDER BY COUNT(*) DESC;
```

### Get Cameras in Bounding Box
```sql
SELECT name, city,
       ST_Y(location::geometry) as lat,
       ST_X(location::geometry) as lon
FROM external_cameras
WHERE location && ST_MakeEnvelope(-87.6, 24.5, -80.0, 31.0, 4326)
  AND is_online = TRUE;
```

## API Limits

### Windy Free Tier
- **Requests:** Generous, but rate-limited
- **Image tokens:** Expire after 10 minutes
- **Offset limit:** 10,000 results max
- **Best practice:** Cache results, don't query every page load

### Windy Professional Tier ($)
- Higher rate limits
- Image tokens valid 24 hours
- Access to all-webcams.json endpoint

## Adding More Sources

### Next Sources to Add:
1. **Florida DOT** - Need to find their API/data feed
2. **YouTube Live Streams** - Search API for "live camera Florida"
3. **EarthCam** - Check if they have public API
4. **Webcams.travel** - Large directory, check API access

Create new scraper files like:
- `dot_florida_scraper.js`
- `youtube_scraper.js`
- `earthcam_scraper.js`

Follow same pattern as `windy_scraper.js`.

## Troubleshooting

**"API returned 401"**
- Check your API key is correct
- Verify it's set in environment variables

**"API returned 429"**
- Rate limit hit, wait a few minutes
- Add delays between requests (already included)

**"Connection to database failed"**
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Verify PostGIS extension is installed

**"No webcams found"**
- Check bounding box coordinates are valid
- Verify Windy has cameras in that region
- Try a different location (e.g., California has more cams)

## Support

Questions? Contact: support@webcam.org
