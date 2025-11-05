/**
 * webcam.org API Client
 * Handles registration and event submission to backend
 */

const { machineId } = require('node-machine-id');
const os = require('os');
const Store = require('electron-store');

const store = new Store();
const API_URL = process.env.API_URL || 'https://webcam.org/api';

/**
 * Register desktop app with backend on first run
 * Returns API key for subsequent requests
 */
async function registerDesktop() {
  try {
    // Check if already registered
    const existingKey = store.get('api_key');
    if (existingKey) {
      console.log('Already registered, using existing API key');
      return existingKey;
    }

    const deviceId = await machineId();
    const osInfo = `${os.platform()} ${os.release()}`;

    console.log('Registering desktop app with backend...');
    console.log(`  Device ID: ${deviceId}`);
    console.log(`  OS: ${osInfo}`);

    const response = await fetch(`${API_URL}/desktop/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: deviceId,
        os: osInfo,
        webcam_info: {
          // Will be populated when webcam is selected
        }
      })
    });

    const data = await response.json();

    if (data.success) {
      const apiKey = data.api_key;
      store.set('api_key', apiKey);
      store.set('registered_at', new Date().toISOString());

      console.log('✓ Registration successful');
      console.log(`  API Key: ${apiKey.substring(0, 20)}...`);

      return apiKey;
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    return null;
  }
}

/**
 * Send motion detection event to backend
 */
async function sendMotionEvent(eventType, confidence) {
  try {
    const apiKey = store.get('api_key');

    if (!apiKey) {
      console.warn('No API key - skipping event submission');
      return false;
    }

    const response = await fetch(`${API_URL}/desktop/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        event_type: eventType,
        confidence: confidence,
        timestamp: new Date().toISOString(),
        camera_name: 'USB Webcam'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✓ Motion event sent: ${eventType} (${confidence})`);
      return true;
    } else {
      console.warn('Event submission failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Event submission error:', error.message);
    return false;
  }
}

/**
 * Check if desktop app is registered
 */
function isRegistered() {
  return !!store.get('api_key');
}

/**
 * Get registration info
 */
function getRegistrationInfo() {
  return {
    isRegistered: isRegistered(),
    apiKey: store.get('api_key'),
    registeredAt: store.get('registered_at')
  };
}

module.exports = {
  registerDesktop,
  sendMotionEvent,
  isRegistered,
  getRegistrationInfo
};
