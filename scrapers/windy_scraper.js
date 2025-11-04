/**
 * Windy Webcams Scraper
 * Fetches public webcams from Windy API and stores in PostgreSQL
 *
 * Get API key: https://api.windy.com/keys
 */

const https = require('https');
const { Pool } = require('pg');

// Configuration
const WINDY_API_KEY = process.env.WINDY_API_KEY;
const DB_CONNECTION = process.env.DATABASE_URL;

// PostgreSQL connection
const pool = new Pool({ connectionString: DB_CONNECTION });

// California bounding box (north, east, south, west) - lots of webcams
const CALIFORNIA_BBOX = {
  north: 42.0,
  east: -114.1,
  south: 32.5,
  west: -124.4
};

// Florida bounding box for later
const FLORIDA_BBOX = {
  north: 31.0,
  east: -80.0,
  south: 24.5,
  west: -87.6
};

/**
 * Fetch webcams from Windy API
 */
async function fetchWindyWebcams(bbox, limit = 50, offset = 0) {
  const bboxString = `${bbox.north},${bbox.east},${bbox.south},${bbox.west}`;
  const url = `/webcams/api/v3/webcams?bbox=${bboxString}&limit=${limit}&offset=${offset}&show=webcams:location,image,player`;

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

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          console.log('   API Response:', JSON.stringify(parsed).substring(0, 200));
          resolve(parsed);
        } else {
          reject(new Error(`API returned ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Save webcam to database
 */
async function saveWebcam(webcam) {
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
      last_checked_at
    ) VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326), $9, $10, $11, $12, $13, $14, $15, NOW())
    ON CONFLICT (source, external_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      location = EXCLUDED.location,
      thumbnail_url = EXCLUDED.thumbnail_url,
      is_online = EXCLUDED.is_online,
      last_checked_at = NOW()
  `;

  const values = [
    'windy',
    webcam.webcamId,
    `https://windy.com/webcams/${webcam.webcamId}`,
    webcam.title || 'Untitled Webcam',
    webcam.status || null,
    determineType(webcam.categories || []),
    webcam.location.longitude,
    webcam.location.latitude,
    webcam.location.city || null,
    webcam.location.region || webcam.location.region_code || null,
    webcam.location.country_code || null,
    'iframe',
    webcam.player?.lifetime?.embed || webcam.player?.day?.embed || null,
    webcam.image?.current?.preview || webcam.image?.daylight?.preview || null,
    webcam.status === 'active',
  ];

  try {
    await pool.query(query, values);
    console.log(`✓ Saved: ${webcam.title} (${webcam.location.city || 'Unknown'})`);
  } catch (error) {
    console.error(`✗ Error saving ${webcam.webcamId}:`, error.message);
  }
}

/**
 * Determine camera type from categories
 */
function determineType(categories) {
  if (!Array.isArray(categories)) return 'other';

  const categoryMap = {
    'beach': 'beach',
    'surf': 'beach',
    'traffic': 'traffic',
    'weather': 'weather',
    'city': 'city',
    'landscape': 'nature',
    'mountain': 'nature',
    'lake': 'nature',
    'harbor': 'harbor',
    'airport': 'airport'
  };

  for (const cat of categories) {
    const type = categoryMap[cat.toLowerCase()];
    if (type) return type;
  }

  return 'other';
}

/**
 * Main scraper function
 */
async function scrapeWindy() {
  console.log('🌐 Starting Windy webcam scraper...');
  console.log(`📍 Region: California (${CALIFORNIA_BBOX.north},${CALIFORNIA_BBOX.east} to ${CALIFORNIA_BBOX.south},${CALIFORNIA_BBOX.west})`);

  if (!WINDY_API_KEY) {
    console.error('❌ Error: WINDY_API_KEY environment variable not set');
    console.error('   Get your key at: https://api.windy.com/keys');
    process.exit(1);
  }

  try {
    let offset = 0;
    let totalSaved = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`\n📥 Fetching webcams (offset: ${offset})...`);

      const response = await fetchWindyWebcams(CALIFORNIA_BBOX, 50, offset);

      if (!response.webcams || response.webcams.length === 0) {
        console.log('⚠️  No webcams found');
        break;
      }

      const webcams = response.webcams;
      console.log(`   Found ${webcams.length} webcams (total available: ${response.total})`);

      // Save each webcam
      for (const webcam of webcams) {
        await saveWebcam(webcam);
        totalSaved++;
      }

      // Check if there are more results
      if (webcams.length < 50) {
        hasMore = false;
      } else {
        offset += 50;
        // Rate limiting: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n✅ Done! Saved ${totalSaved} webcams from Windy`);

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

module.exports = { scrapeWindy, fetchWindyWebcams };
