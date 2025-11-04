/**
 * Windy Webcams Scraper with Nominatim Geocoding
 *
 * Strategy: Windy free tier doesn't return location data, so we:
 * 1. Fetch webcam titles (which include location info)
 * 2. Parse location from title
 * 3. Geocode with OpenStreetMap Nominatim (free)
 * 4. Save with lat/long coordinates
 */

const https = require('https');
const { Pool } = require('pg');

// Configuration
const WINDY_API_KEY = process.env.WINDY_API_KEY;
const DB_CONNECTION = process.env.DATABASE_URL;

// PostgreSQL connection
const pool = new Pool({ connectionString: DB_CONNECTION });

// California bounding box
const CALIFORNIA_BBOX = {
  north: 42.0,
  east: -114.1,
  south: 32.5,
  west: -124.4
};

// Cache for geocoded locations (avoid redundant API calls)
const geocodeCache = {};

/**
 * Fetch webcams from Windy API
 */
async function fetchWindyWebcams(bbox, limit = 50, offset = 0) {
  const bboxString = `${bbox.north},${bbox.east},${bbox.south},${bbox.west}`;
  const url = `/webcams/api/v3/webcams?bbox=${bboxString}&limit=${limit}&offset=${offset}`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.windy.com',
      port: 443,
      path: url,
      method: 'GET',
      headers: {
        'x-windy-api-key': WINDY_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Windy API returned ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Geocode location string with Nominatim (OpenStreetMap)
 * Rate limit: 1 request per second
 */
async function geocodeLocation(locationString) {
  // Check cache first
  if (geocodeCache[locationString]) {
    return geocodeCache[locationString];
  }

  const encodedLocation = encodeURIComponent(locationString);
  const url = `/search?q=${encodedLocation}&format=json&limit=1`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      port: 443,
      path: url,
      method: 'GET',
      headers: {
        'User-Agent': 'webcam.org-scraper/1.0 (contact@webcam.org)' // Required by Nominatim
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const results = JSON.parse(data);
          if (results && results.length > 0) {
            const result = {
              lat: parseFloat(results[0].lat),
              lon: parseFloat(results[0].lon),
              displayName: results[0].display_name
            };
            geocodeCache[locationString] = result; // Cache it
            resolve(result);
          } else {
            resolve(null); // No results found
          }
        } else {
          reject(new Error(`Nominatim returned ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Parse location from webcam title
 * Examples:
 *   "Los Angeles: Venice Beach - USA" → "Venice Beach, Los Angeles, USA"
 *   "Crescent City › North-West" → "Crescent City"
 *   "Muir Beach › South: Ocean Beach" → "Ocean Beach, Muir Beach"
 */
function parseLocationFromTitle(title) {
  // Remove directional indicators (North, South, East, West, etc.)
  let cleaned = title.replace(/›\s*(North|South|East|West|N|S|E|W)[-\w]*/gi, '').trim();

  // Handle "City: Location - Country" format
  if (cleaned.includes(':') && cleaned.includes('-')) {
    const parts = cleaned.split(':');
    const city = parts[0].trim();
    const rest = parts[1].split('-');
    const location = rest[0].trim();
    const country = rest[1] ? rest[1].trim() : '';
    return `${location}, ${city}${country ? ', ' + country : ''}`;
  }

  // Handle "City: Location" format
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    return `${parts[1].trim()}, ${parts[0].trim()}`;
  }

  // Handle "Location - Country" format
  if (cleaned.includes('-')) {
    return cleaned.replace('-', ',');
  }

  // Just return the title
  return cleaned;
}

/**
 * Save webcam to database with geocoded coordinates
 */
async function saveWebcam(webcam) {
  try {
    // Parse location from title
    const locationString = parseLocationFromTitle(webcam.title);
    console.log(`   Geocoding: "${webcam.title}" → "${locationString}"`);

    // Geocode location (with 1-second rate limit)
    await new Promise(resolve => setTimeout(resolve, 1100)); // 1.1 sec to be safe
    const geocoded = await geocodeLocation(locationString);

    if (!geocoded) {
      console.log(`   ⚠️  Could not geocode "${locationString}" - skipping`);
      return;
    }

    console.log(`   ✓ Found: ${geocoded.lat}, ${geocoded.lon} (${geocoded.displayName})`);

    // Extract city/state/country from display_name
    const parts = geocoded.displayName.split(', ');
    const country = parts[parts.length - 1];
    const state = parts.length > 2 ? parts[parts.length - 2] : null;
    const city = parts[0];

    const query = `
      INSERT INTO external_cameras (
        source,
        external_id,
        source_url,
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
        last_checked_at,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326), $9, $10, $11, $12, $13, $14, $15, NOW(), $16)
      ON CONFLICT (source, external_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        location = EXCLUDED.location,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        country = EXCLUDED.country,
        is_online = EXCLUDED.is_online,
        last_checked_at = NOW()
    `;

    const values = [
      'windy',
      webcam.webcamId.toString(),
      `https://windy.com/webcams/${webcam.webcamId}`,
      webcam.title,
      `Views: ${webcam.viewCount || 0}`,
      'other', // Can't determine type without more data
      geocoded.lon,
      geocoded.lat,
      city,
      state,
      country,
      'iframe',
      `https://windy.com/webcams/${webcam.webcamId}`, // Embed URL
      null, // No thumbnail URL from free tier
      webcam.status === 'active',
      JSON.stringify({ viewCount: webcam.viewCount, lastUpdated: webcam.lastUpdatedOn })
    ];

    await pool.query(query, values);
    console.log(`   ✅ Saved: ${webcam.title}`);

  } catch (error) {
    console.error(`   ✗ Error saving ${webcam.webcamId}:`, error.message);
  }
}

/**
 * Main scraper function
 */
async function scrapeWindy() {
  console.log('🌐 Starting Windy webcam scraper with Nominatim geocoding...');
  console.log(`📍 Region: California`);
  console.log(`⏱️  Rate limit: 1 geocoding request per second (this will take a while)`);

  if (!WINDY_API_KEY) {
    console.error('❌ Error: WINDY_API_KEY environment variable not set');
    process.exit(1);
  }

  try {
    let offset = 0;
    let totalSaved = 0;
    let hasMore = true;
    const MAX_CAMS = 100; // Limit to 100 cams for now (takes ~2 minutes)

    while (hasMore && totalSaved < MAX_CAMS) {
      console.log(`\n📥 Fetching webcams (offset: ${offset})...`);

      const response = await fetchWindyWebcams(CALIFORNIA_BBOX, 50, offset);

      if (!response.webcams || response.webcams.length === 0) {
        console.log('⚠️  No more webcams found');
        break;
      }

      const webcams = response.webcams;
      console.log(`   Found ${webcams.length} webcams (total available: ${response.total})`);

      // Save each webcam with geocoding
      for (const webcam of webcams) {
        if (totalSaved >= MAX_CAMS) break;
        await saveWebcam(webcam);
        totalSaved++;
      }

      // Check if there are more results
      if (webcams.length < 50 || totalSaved >= MAX_CAMS) {
        hasMore = false;
      } else {
        offset += 50;
      }
    }

    console.log(`\n✅ Done! Saved ${totalSaved} webcams from Windy (geocoded with Nominatim)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  scrapeWindy().catch(console.error);
}

module.exports = { scrapeWindy };
