#!/usr/bin/env python3
"""
Florida DOT (FL511) Traffic Camera Scraper
Extends DOTScraperBase for Florida-specific API format
"""

import os
import sys
from dot_scraper_base import DOTScraperBase

class FloridaDOTScraper(DOTScraperBase):
    def __init__(self, database_url):
        super().__init__('FL', database_url)

    def get_api_url(self):
        """Florida DOT camera API endpoint"""
        return "https://fl511.com/map/mapIcons/Cameras"

    def parse_response(self, data):
        """
        Parse FL511 API response

        FL511 returns array of camera objects with structure like:
        {
          "Id": "12345",
          "Description": "I-95 at Sample Rd",
          "Latitude": 26.12345,
          "Longitude": -80.12345,
          "RoadwayName": "I-95",
          "Url": "https://fl511.com/cameras/12345"
        }
        """
        cameras = []

        # Handle different possible response structures
        camera_list = data if isinstance(data, list) else data.get('cameras', data.get('data', []))

        for item in camera_list:
            try:
                # Extract camera ID
                cam_id = str(item.get('Id') or item.get('id') or item.get('CameraId'))

                # Extract name/description
                name = (item.get('Description') or
                       item.get('description') or
                       item.get('RoadwayName') or
                       f"Camera {cam_id}")

                # Extract coordinates
                lat = float(item.get('Latitude') or item.get('latitude') or 0)
                lon = float(item.get('Longitude') or item.get('longitude') or 0)

                # Skip if no valid coordinates
                if lat == 0 or lon == 0:
                    continue

                # Extract embed URL
                embed_url = (item.get('Url') or
                            item.get('url') or
                            item.get('ImageUrl') or
                            f"https://fl511.com/cameras/{cam_id}")

                # Extract city if available
                city = item.get('City') or item.get('city')

                cameras.append({
                    'external_id': cam_id,
                    'name': name.strip(),
                    'lat': lat,
                    'lon': lon,
                    'embed_url': embed_url,
                    'city': city
                })

            except Exception as e:
                print(f"  Warning: Skipped camera {item.get('Id', 'unknown')}: {e}")
                continue

        return cameras


if __name__ == '__main__':
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL', 'postgresql://webcamorg:webcam_dev_2025@localhost/webcamorg')

    scraper = FloridaDOTScraper(database_url)
    count = scraper.run()

    sys.exit(0 if count > 0 else 1)
