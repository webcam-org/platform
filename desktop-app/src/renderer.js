const statusEl = document.getElementById('status');
const pingButton = document.getElementById('pingButton');
const refreshButton = document.getElementById('refreshDevices');
const deviceForm = document.getElementById('deviceForm');
const deviceHint = document.getElementById('deviceHint');
const autoLaunchToggle = document.getElementById('autoLaunch');
const recordingDirLabel = document.getElementById('recordingDirectory');
const changeRecordingDirButton = document.getElementById('changeRecordingDir');
const startPreviewButton = document.getElementById('startPreview');
const stopPreviewButton = document.getElementById('stopPreview');
const previewVideo = document.getElementById('previewVideo');
const previewPlaceholder = document.getElementById('previewPlaceholder');

let currentSettings = {
  autoLaunch: false,
  selectedCameraId: null,
  recordingDirectory: null
};
let cachedDevices = [];
let hasRequestedMediaAccess = false;
let previewStream = null;
let deviceSource = 'unknown';
let motionDetector = null;

pingButton.addEventListener('click', async () => {
  statusEl.textContent = 'Checking...';

  try {
    const response = await window.desktopBridge.ping();
    statusEl.textContent = `OK @ ${response.timestamp} (${response.platform})`;
  } catch (error) {
    statusEl.textContent = `Failed: ${error.message ?? error}`;
  }
});

async function refreshDevices() {
  statusEl.textContent = 'Scanning for devices...';

  try {
    const devices = await loadDeviceList();
    cachedDevices = devices;
    renderDevices();
    statusEl.textContent = `Found ${devices.length ?? 0} device(s)`;
  } catch (error) {
    statusEl.textContent = `Device scan failed: ${error.message ?? error}`;
  }
}

async function loadDeviceList() {
  const nativeDevices = await enumerateNativeDevices();

  if (nativeDevices && nativeDevices.length) {
    deviceSource = 'native';
    deviceHint.textContent = 'Camera list provided by Windows. If a device is missing, ensure it is plugged in and drivers are installed.';
    return nativeDevices;
  }

  const fallback = await window.desktopBridge.listDevices();
  deviceSource = 'fallback';
  deviceHint.textContent = 'Showing placeholder devices. Run on Windows with camera access to see real webcams.';
  return fallback;
}

async function enumerateNativeDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  try {
    if (!hasRequestedMediaAccess) {
      await ensureMediaPermissions();
      hasRequestedMediaAccess = true;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === 'videoinput');

    return cameras.map(device => ({
      id: device.deviceId || `device-${device.label ?? 'unknown'}`,
      label: device.label || 'Camera',
      status: 'connected',
      transport: 'mediaDevices'
    }));
  } catch (error) {
    console.warn('Failed to enumerate native devices', error);
    return [];
  }
}

async function ensureMediaPermissions(preferredDeviceId) {
  if (!navigator.mediaDevices?.getUserMedia) {
    return false;
  }

  const constraints = preferredDeviceId
    ? { video: { deviceId: { exact: preferredDeviceId } } }
    : { video: true };

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    return true;
  } catch (error) {
    statusEl.textContent = `Camera permission denied: ${error.message ?? error}`;
    return false;
  } finally {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }
}

function renderDevices() {
  deviceForm.innerHTML = '';

  if (!cachedDevices?.length) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = 'No cameras detected';
    emptyMessage.className = 'hint';
    deviceForm.appendChild(emptyMessage);
    return;
  }

  cachedDevices.forEach(device => {
    const labelEl = document.createElement('label');
    labelEl.className = 'device-option';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'device-selection';
    radio.value = device.id;
    radio.checked = currentSettings.selectedCameraId === device.id;

    radio.addEventListener('change', () => {
      saveSettings({ selectedCameraId: device.id });
    });

    const content = document.createElement('div');
    const title = document.createElement('div');
    title.textContent = device.label ?? 'Unknown device';
    title.style.fontWeight = 600;

    const meta = document.createElement('div');
    meta.className = 'hint';
    const status = device.status ?? 'unknown';
    meta.textContent = `${status} · ${device.transport ?? 'unknown transport'}`;

    content.append(title, meta);
    labelEl.append(radio, content);
    deviceForm.appendChild(labelEl);
  });

  updatePreviewPlaceholder();
}

async function saveSettings(patch) {
  const previewWasActive = Boolean(previewStream);
  const updated = await window.desktopBridge.updateSettings(patch);
  applySettings(updated);
  renderDevices();

  if (patch.selectedCameraId && previewWasActive) {
    await startPreview();
  }
}

async function bootstrap() {
  try {
    currentSettings = await window.desktopBridge.getSettings();
  } catch (error) {
    statusEl.textContent = `Failed to load settings: ${error.message ?? error}`;
  }

  applySettings(currentSettings);
  await refreshDevices();
}

refreshButton.addEventListener('click', refreshDevices);

autoLaunchToggle.addEventListener('change', event => {
  saveSettings({ autoLaunch: event.target.checked });
});

changeRecordingDirButton.addEventListener('click', async () => {
  const updated = await window.desktopBridge.chooseRecordingDirectory();
  applySettings(updated);
});

startPreviewButton.addEventListener('click', () => {
  startPreview();
});

stopPreviewButton.addEventListener('click', () => {
  stopPreview();
});

function applySettings(settings) {
  currentSettings = settings ?? currentSettings;
  autoLaunchToggle.checked = !!currentSettings.autoLaunch;
  recordingDirLabel.textContent = currentSettings.recordingDirectory ?? 'Not set';
  updatePreviewPlaceholder();
}

function getSelectedDevice() {
  return cachedDevices.find(device => device.id === currentSettings.selectedCameraId) ?? null;
}

async function startPreview() {
  const selectedDevice = getSelectedDevice();
  if (!selectedDevice) {
    statusEl.textContent = 'Select a camera before starting the preview.';
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    statusEl.textContent = 'Camera preview is unavailable in this environment.';
    return;
  }

  await stopPreview();

  try {
    if (!hasRequestedMediaAccess) {
      await ensureMediaPermissions(selectedDevice.id);
      hasRequestedMediaAccess = true;
    }

    previewStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: selectedDevice.id } },
      audio: false
    });

    previewVideo.srcObject = previewStream;
    await previewVideo.play();
    previewVideo.classList.add('active');
    previewPlaceholder.classList.add('hidden');
    statusEl.textContent = `Previewing ${selectedDevice.label}`;

    // Start motion detection
    motionDetector = new MotionDetector(previewVideo, {
      threshold: 30,
      motionThreshold: 0.02,
      checkInterval: 1000
    });

    motionDetector.start(() => {
      console.log('Motion detected!');
      // Send event to backend
      window.desktopBridge.sendMotionEvent('motion', 0.85);
    });
  } catch (error) {
    statusEl.textContent = `Preview failed: ${error.message ?? error}`;
    previewVideo.classList.remove('active');
    previewPlaceholder.classList.remove('hidden');
    previewStream = null;
  }
}

async function stopPreview() {
  if (motionDetector) {
    motionDetector.stop();
    motionDetector = null;
  }

  if (!previewStream) {
    updatePreviewPlaceholder();
    return;
  }

  previewStream.getTracks().forEach(track => track.stop());
  previewStream = null;
  previewVideo.pause();
  previewVideo.srcObject = null;
  previewVideo.classList.remove('active');
  updatePreviewPlaceholder();
  statusEl.textContent = 'Preview stopped';
}

function updatePreviewPlaceholder() {
  const selectedDevice = getSelectedDevice();
  if (previewStream) {
    previewVideo.classList.add('active');
    previewPlaceholder.classList.add('hidden');
    return;
  }

  previewVideo.classList.remove('active');
  previewPlaceholder.classList.remove('hidden');

  if (!selectedDevice) {
    previewPlaceholder.textContent = 'Select a camera and click “Test Camera” to verify video.';
  } else if (deviceSource === 'fallback') {
    previewPlaceholder.textContent = 'Preview needs a real webcam. Switch to a Windows machine with camera access.';
  } else {
    previewPlaceholder.textContent = `Ready to test ${selectedDevice.label}.`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  bootstrap();
});
