#!/usr/bin/env python3
"""
Base class for DOT (Department of Transportation) traffic camera scrapers
Designed to be extended for all 50 US states
"""

import requests
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import time

class DOTScraperBase:
    def __init__(self, state_code, database_url):
        """
        Initialize scraper for a specific state

        Args:
            state_code: Two-letter state code (e.g., 'FL', 'CA', 'TX')
            database_url: PostgreSQL connection string
        """
        self.state_code = state_code.upper()
        self.database_url = database_url
        self.source = f'dot_{state_code.lower()}'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'webcam.org-scraper/1.0 (traffic camera aggregator)'
        })

    def get_api_url(self):
        """Override this in subclass to return the state's DOT API URL"""
        raise NotImplementedError("Subclass must implement get_api_url()")

    def parse_response(self, response_data):
        """
        Override this in subclass to parse the API response into camera list

        Returns:
            List of dicts with keys: external_id, name, lat, lon, embed_url
        """
        raise NotImplementedError("Subclass must implement parse_response()")

    def fetch_cameras(self):
        """Fetch cameras from DOT API"""
        url = self.get_api_url()
        print(f"Fetching from {url}...")

        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            data = response.json()
            cameras = self.parse_response(data)

            print(f"  Found {len(cameras)} cameras")
            return cameras
        except Exception as e:
            print(f"  Error fetching: {e}")
            return []

    def save_to_database(self, cameras):
        """Save cameras to PostgreSQL database"""
        if not cameras:
            print("  No cameras to save")
            return 0

        conn = psycopg2.connect(self.database_url)
        cur = conn.cursor()

        # Prepare data for bulk insert
        values = []
        for cam in cameras:
            values.append((
                self.source,
                cam['external_id'],
                cam['name'],
                f"POINT({cam['lon']} {cam['lat']})",
                cam.get('city'),
                cam['embed_url']
            ))

        # Bulk upsert
        query = """
            INSERT INTO external_cameras (source, external_id, name, location, city, embed_url)
            VALUES %s
            ON CONFLICT (source, external_id)
            DO UPDATE SET
                name = EXCLUDED.name,
                location = EXCLUDED.location,
                city = EXCLUDED.city,
                embed_url = EXCLUDED.embed_url,
                updated_at = NOW()
        """

        execute_values(cur, query, values, template=None, page_size=100)

        inserted = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()

        print(f"  ✓ Saved {inserted} cameras to database")
        return inserted

    def run(self):
        """Main scraper execution"""
        print(f"\n🚗 {self.state_code} DOT Traffic Camera Scraper")
        print(f"Source: {self.source}")
        print(f"Database: {self.database_url[:30]}...")

        start_time = time.time()

        cameras = self.fetch_cameras()
        saved = self.save_to_database(cameras)

        elapsed = time.time() - start_time
        print(f"\n✓ Complete in {elapsed:.1f}s - {saved} cameras imported\n")

        return saved
