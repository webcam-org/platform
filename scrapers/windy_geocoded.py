#!/usr/bin/env python3
"""
Windy Webcams Scraper with Nominatim Geocoding
"""

import requests
import psycopg2
import time
import os
import json
from urllib.parse import quote

# Config
WINDY_API_KEY = os.getenv('WINDY_API_KEY')
DB_NAME = 'webcamorg'

# California bounding box
BBOX = {
    'north': 42.0,
    'east': -114.1,
    'south': 32.5,
    'west': -124.4
}

MAX_CAMS = 100

def fetch_windy_webcams(bbox, limit=50, offset=0):
    """Fetch webcams from Windy API"""
    bbox_str = f"{bbox['north']},{bbox['east']},{bbox['south']},{bbox['west']}"
    url = f"https://api.windy.com/webcams/api/v3/webcams?bbox={bbox_str}&limit={limit}&offset={offset}"
    headers = {'x-windy-api-key': WINDY_API_KEY}

    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()

def geocode_location(location_str):
    """Geocode with Nominatim"""
    url = f"https://nominatim.openstreetmap.org/search?q={quote(location_str)}&format=json&limit=1"
    headers = {'User-Agent': 'webcam.org-scraper/1.0 (contact@webcam.org)'}

    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    results = resp.json()

    if results:
        return {
            'lat': float(results[0]['lat']),
            'lon': float(results[0]['lon']),
            'display_name': results[0]['display_name']
        }
    return None

def parse_location_from_title(title):
    """Parse location from webcam title"""
    # Remove directional indicators
    cleaned = title
    for direction in ['North-West', 'North-East', 'South-West', 'South-East', 'North', 'South', 'East', 'West']:
        cleaned = cleaned.replace(f'› {direction}', '').replace(f': {direction}', '')

    # Handle different formats
    if ':' in cleaned and '-' in cleaned:
        parts = cleaned.split(':')
        city = parts[0].strip()
        rest = parts[1].split('-')
        location = rest[0].strip()
        country = rest[1].strip() if len(rest) > 1 else ''
        return f"{location}, {city}{', ' + country if country else ''}"

    if ':' in cleaned:
        parts = cleaned.split(':')
        return f"{parts[1].strip()}, {parts[0].strip()}"

    if '-' in cleaned:
        return cleaned.replace('-', ',')

    return cleaned.strip()

def save_webcam(conn, webcam):
    """Save webcam to database"""
    try:
        location_str = parse_location_from_title(webcam['title'])
        print(f"   Geocoding: \"{webcam['title']}\" → \"{location_str}\"")

        # Rate limit: 1 req/sec for Nominatim
        time.sleep(1.1)

        geocoded = geocode_location(location_str)
        if not geocoded:
            print(f"   ⚠️  Could not geocode \"{location_str}\" - skipping")
            return

        print(f"   ✓ Found: {geocoded['lat']}, {geocoded['lon']}")

        # Parse city/state/country
        parts = geocoded['display_name'].split(', ')
        country = parts[-1] if parts else None
        state = parts[-2] if len(parts) > 2 else None
        city = parts[0] if parts else None

        cur = conn.cursor()
        cur.execute("""
            INSERT INTO external_cameras (
                source, external_id, source_url, name, description, camera_type,
                location, city, state, country, embed_type, embed_url, is_online, last_checked_at, metadata
            ) VALUES (%s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s, %s, %s, %s, %s, %s, NOW(), %s)
            ON CONFLICT (source, external_id) DO UPDATE SET
                name = EXCLUDED.name,
                location = EXCLUDED.location,
                city = EXCLUDED.city,
                state = EXCLUDED.state,
                is_online = EXCLUDED.is_online,
                last_checked_at = NOW()
        """, (
            'windy',
            str(webcam['webcamId']),
            f"https://windy.com/webcams/{webcam['webcamId']}",
            webcam['title'],
            f"Views: {webcam.get('viewCount', 0)}",
            'other',
            geocoded['lon'],
            geocoded['lat'],
            city,
            state,
            'US' if 'United States' in geocoded['display_name'] else country[:2] if country else None,
            'iframe',
            f"https://windy.com/webcams/{webcam['webcamId']}",
            webcam['status'] == 'active',
            json.dumps({'viewCount': webcam.get('viewCount', 0), 'lastUpdated': webcam.get('lastUpdatedOn')})
        ))
        conn.commit()
        print(f"   ✅ Saved: {webcam['title']}")

    except Exception as e:
        print(f"   ✗ Error: {e}")
        conn.rollback()

def main():
    print("🌐 Starting Windy webcam scraper with Nominatim geocoding...")
    print(f"📍 Region: California")
    print(f"⏱️  Rate limit: 1 geocoding request per second")

    if not WINDY_API_KEY:
        print("❌ Error: WINDY_API_KEY environment variable not set")
        return

    # Connect to PostgreSQL (peer auth, no password needed)
    conn = psycopg2.connect(f"dbname={DB_NAME}")

    total_saved = 0
    offset = 0

    while total_saved < MAX_CAMS:
        print(f"\n📥 Fetching webcams (offset: {offset})...")

        data = fetch_windy_webcams(BBOX, limit=50, offset=offset)

        if not data.get('webcams'):
            print("⚠️  No more webcams found")
            break

        webcams = data['webcams']
        print(f"   Found {len(webcams)} webcams (total available: {data.get('total', 0)})")

        for webcam in webcams:
            if total_saved >= MAX_CAMS:
                break
            save_webcam(conn, webcam)
            total_saved += 1

        if len(webcams) < 50:
            break

        offset += 50

    conn.close()
    print(f"\n✅ Done! Saved {total_saved} webcams")

if __name__ == '__main__':
    main()
