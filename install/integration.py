#!/usr/bin/env python3
"""
webcam.org Integration Service
Listens to Frigate MQTT events and forwards to webcam.org backend
"""

import os
import time
import json
import paho.mqtt.client as mqtt
import requests

MQTT_HOST = os.getenv('MQTT_HOST', 'mqtt')
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
API_URL = os.getenv('WEBCAMORG_API_URL', 'https://api.webcam.org')
API_KEY = os.getenv('WEBCAMORG_API_KEY', '')

print("🔗 webcam.org Integration Service starting...")
print(f"MQTT: {MQTT_HOST}:{MQTT_PORT}")
print(f"API: {API_URL}")

def on_connect(client, userdata, flags, rc):
    print(f"✓ Connected to MQTT (code: {rc})")
    # Subscribe to all Frigate events
    client.subscribe("frigate/events")
    client.subscribe("frigate/+/person")
    client.subscribe("frigate/+/car")
    print("✓ Subscribed to Frigate events")

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload = json.loads(msg.payload.decode())

        print(f"📨 Event: {topic}")

        # Parse Frigate event format
        camera_id = None
        event_type = None
        confidence = 0

        # Frigate topics: frigate/{camera_name}/{object_type}
        topic_parts = topic.split('/')
        if len(topic_parts) >= 2:
            camera_id = topic_parts[1]
        if len(topic_parts) >= 3:
            event_type = topic_parts[2]

        # Get confidence from payload if available
        if isinstance(payload, dict):
            confidence = payload.get('score', payload.get('confidence', 0))

        print(f"   Camera: {camera_id}, Type: {event_type}, Confidence: {confidence}")

        # Forward to webcam.org backend
        if API_KEY and camera_id:
            try:
                response = requests.post(
                    f"{API_URL}/api/events",
                    headers={'Content-Type': 'application/json'},
                    json={
                        'camera': camera_id,
                        'event_type': event_type or 'motion',
                        'confidence': confidence,
                        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                    },
                    timeout=5
                )
                if response.status_code == 200:
                    print(f"   ✓ Forwarded to backend")
                else:
                    print(f"   ⚠ Backend returned {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"   ⚠ Failed to forward: {e}")
        else:
            if not API_KEY:
                print("   ⚠ No API_KEY configured, not forwarding")

    except Exception as e:
        print(f"❌ Error: {e}")

# Create MQTT client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect
while True:
    try:
        print(f"Connecting to MQTT at {MQTT_HOST}...")
        client.connect(MQTT_HOST, MQTT_PORT, 60)
        client.loop_forever()
    except Exception as e:
        print(f"Connection failed: {e}")
        print("Retrying in 5 seconds...")
        time.sleep(5)
