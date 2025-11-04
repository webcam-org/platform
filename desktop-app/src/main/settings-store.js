const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');

const SETTINGS_FILE = 'settings.json';

const defaultSettings = {
  selectedCameraId: null,
  autoLaunch: false,
  recordingDirectory: null
};

function getSettingsPath() {
  const userData = app.getPath('userData');
  return path.join(userData, SETTINGS_FILE);
}

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadSettings() {
  try {
    const filePath = getSettingsPath();
    if (!fs.existsSync(filePath)) {
      return { ...defaultSettings };
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    return { ...defaultSettings };
  }
}

function saveSettings(settings) {
  const filePath = getSettingsPath();
  ensureDirectoryExists(filePath);

  const payload = JSON.stringify({ ...defaultSettings, ...settings }, null, 2);
  fs.writeFileSync(filePath, payload, 'utf8');

  return loadSettings();
}

function updateSettings(patch) {
  const current = loadSettings();
  const next = { ...current, ...patch };
  return saveSettings(next);
}

module.exports = {
  defaultSettings,
  loadSettings,
  saveSettings,
  updateSettings
};
