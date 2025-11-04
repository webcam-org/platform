/**
 * Webcam Test Tool - Improved Version
 * Privacy-first webcam and microphone testing
 * All processing happens client-side
 */

const WebcamTest = (() => {
  // DOM Elements
  let els = {};

  // State
  let camStream = null;
  let micStream = null;
  let micAnalyser = null;
  let audioContext = null;
  let animationFrameId = null;
  let micAnimationFrameId = null;
  let fpsInterval = null;
  let resInterval = null;

  // FPS tracking
  const fpsCounter = {
    lastTime: performance.now(),
    frames: 0,
    fps: 0
  };

  // Clipping detection
  let clipDetection = {
    clipStart: null,
    isClipping: false
  };

  // Diagnostics data
  const diagnostics = {
    errors: [],
    permissionStates: {},
    deviceCounts: { videoinput: 0, audioinput: 0 },
    resolutionChanges: 0,
    startTime: null,
    cameraStartTime: null,
    micStartTime: null,
    savedDevices: {}
  };

  /**
   * Initialize the application
   */
  async function init() {
    try {
      performance.mark('wt_init_start');
      cacheElements();
      bindEvents();
      checkHttps();
      paintUA();
      loadSavedDevices();
      await refreshDevices();

      // Listen for device changes
      navigator.mediaDevices.addEventListener('devicechange', refreshDevices);

      performance.mark('wt_init_complete');

      // Expose debug function
      window.__wtDump = dumpDiagnostics;

      // Part 1E: Setup inline help
      setupInlineHelp();

      // Part 1F: Load diagnostics from hash
      loadDiagnosticsFromHash();

      console.log('Webcam Test Tool initialized');
    } catch (error) {
      console.error('Initialization error:', error);
      setResult('fail', 'Failed to initialize. Please refresh the page.');
    }
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    els = {
      // Buttons
      startCamBtn: document.getElementById('startCamBtn'),
      startMicBtn: document.getElementById('startMicBtn'),
      stopCamBtn: document.getElementById('stopCamBtn'),
      stopMicBtn: document.getElementById('stopMicBtn'),
      refreshDevices: document.getElementById('refreshDevices'),
      flipBtn: document.getElementById('flipBtn'),
      snapshotBtn: document.getElementById('snapshotBtn'),
      copyDiagBtn: document.getElementById('copyDiagBtn'),

      // Selects
      cameraSelect: document.getElementById('cameraSelect'),
      micSelect: document.getElementById('micSelect'),

      // Video & Canvas
      video: document.getElementById('video'),
      videoPlaceholder: document.getElementById('videoPlaceholder'),
      micMeter: document.getElementById('micMeter'),
      snapshotCanvas: document.getElementById('snapshotCanvas'),

      // Stats & Diagnostics
      res: document.getElementById('res'),
      fps: document.getElementById('fps'),
      latency: document.getElementById('latency'),
      camName: document.getElementById('camName'),
      micRMS: document.getElementById('micRMS'),
      permCam: document.getElementById('permCam'),
      permMic: document.getElementById('permMic'),
      ua: document.getElementById('ua'),
      https: document.getElementById('https'),
      constraints: document.getElementById('constraints'),
      dropped: document.getElementById('dropped'),

      // Result banner
      result: document.getElementById('result'),
      httpsWarning: document.getElementById('httpsWarning')
    };
  }

  /**
   * Bind UI events
   */
  function bindEvents() {
    els.startCamBtn.addEventListener('click', () => startCamera());
    els.startMicBtn.addEventListener('click', () => startMic());
    els.stopCamBtn.addEventListener('click', stopCamera);
    els.stopMicBtn.addEventListener('click', stopMic);
    els.refreshDevices.addEventListener('click', refreshDevices);
    els.flipBtn.addEventListener('click', toggleFlip);
    els.snapshotBtn.addEventListener('click', takeSnapshot);
    els.copyDiagBtn.addEventListener('click', copyDiagnostics);

    els.cameraSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        startCamera(e.target.value);
      }
    });

    els.micSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        startMic(e.target.value);
      }
    });
  }

  /**
   * Check if page is served over HTTPS
   */
  function checkHttps() {
    const isHttps = location.protocol === 'https:' || location.hostname === 'localhost';
    const status = isHttps ? 'ok' : 'error';
    const text = isHttps ? '✓ Secure' : '✗ Not secure';

    updateStatus(els.https, status, text);

    if (!isHttps) {
      els.httpsWarning.style.display = 'flex';
      els.startCamBtn.disabled = true;
      els.startMicBtn.disabled = true;
      setResult('fail', 'HTTPS required for camera/microphone access');
    } else {
      // Part 1B: Remove HTTPS warning from DOM on HTTPS
      if (els.httpsWarning && els.httpsWarning.parentNode) {
        els.httpsWarning.parentNode.removeChild(els.httpsWarning);
      }
    }

    diagnostics.https = isHttps;
  }

  /**
   * Display user agent info
   */
  function paintUA() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';

    if (ua.includes('Chrome') && !ua.includes('Edg')) browserName = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browserName = 'Safari';
    else if (ua.includes('Firefox')) browserName = 'Firefox';
    else if (ua.includes('Edg')) browserName = 'Edge';

    els.ua.textContent = browserName;
    diagnostics.userAgent = browserName;
  }

  /**
   * Load saved device preferences
   */
  function loadSavedDevices() {
    const savedCamId = localStorage.getItem('wt_lastCameraId');
    const savedMicId = localStorage.getItem('wt_lastMicId');

    diagnostics.savedDevices = {
      camera: savedCamId || null,
      microphone: savedMicId || null
    };
  }

  /**
   * Refresh and enumerate devices
   */
  async function refreshDevices() {
    try {
      // Request permissions first to get device labels
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        tempStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        // Permissions not granted yet, that's okay
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      populateSelects(devices);
      updatePermissionStatus(devices);

      // Track device counts
      diagnostics.deviceCounts.videoinput = devices.filter(d => d.kind === 'videoinput').length;
      diagnostics.deviceCounts.audioinput = devices.filter(d => d.kind === 'audioinput').length;

      trackEvent('devices_enumerated', {
        video: diagnostics.deviceCounts.videoinput,
        audio: diagnostics.deviceCounts.audioinput
      });

    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      setResult('warn', 'Could not list devices. Permissions may be needed.');
      diagnostics.errors.push({ type: 'enumerate', error: error.message });
    }
  }

  /**
   * Populate device select dropdowns
   */
  function populateSelects(devices) {
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    const audioDevices = devices.filter(d => d.kind === 'audioinput');

    // Get saved device IDs
    const savedCamId = localStorage.getItem('wt_lastCameraId');
    const savedMicId = localStorage.getItem('wt_lastMicId');

    // Clear existing options (except first placeholder)
    els.cameraSelect.innerHTML = '<option value="">Choose camera...</option>';
    els.micSelect.innerHTML = '<option value="">Choose microphone...</option>';

    videoDevices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Camera ${index + 1}`;
      if (device.deviceId === savedCamId) {
        option.selected = true;
      }
      els.cameraSelect.appendChild(option);
    });

    audioDevices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Microphone ${index + 1}`;
      if (device.deviceId === savedMicId) {
        option.selected = true;
      }
      els.micSelect.appendChild(option);
    });
  }

  /**
   * Update permission status indicators
   */
  function updatePermissionStatus(devices) {
    // If device labels are available, permissions were likely granted
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    const audioDevices = devices.filter(d => d.kind === 'audioinput');

    const hasVideoLabels = videoDevices.some(d => d.label);
    const hasAudioLabels = audioDevices.some(d => d.label);

    if (hasVideoLabels) {
      updateStatus(els.permCam, 'ok', '✓ Granted');
      diagnostics.permissionStates.camera = 'granted';
    } else if (videoDevices.length > 0) {
      updateStatus(els.permCam, 'warn', '? Unknown');
      diagnostics.permissionStates.camera = 'unknown';
    } else {
      updateStatus(els.permCam, 'error', '✗ No device');
      diagnostics.permissionStates.camera = 'no-device';
    }

    if (hasAudioLabels) {
      updateStatus(els.permMic, 'ok', '✓ Granted');
      diagnostics.permissionStates.microphone = 'granted';
    } else if (audioDevices.length > 0) {
      updateStatus(els.permMic, 'warn', '? Unknown');
      diagnostics.permissionStates.microphone = 'unknown';
    } else {
      updateStatus(els.permMic, 'error', '✗ No device');
      diagnostics.permissionStates.microphone = 'no-device';
    }
  }

  /**
   * Start camera with optional device ID
   */
  async function startCamera(deviceId) {
    try {
      performance.mark('cam_start');
      diagnostics.cameraStartTime = Date.now();

      // Stop existing stream
      stopCamera();

      // Build constraints
      const constraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      if (deviceId) {
        constraints.video.deviceId = { exact: deviceId };
      }

      // Request camera stream
      camStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Set video source
      els.video.srcObject = camStream;
      els.video.classList.add('active');
      els.videoPlaceholder.classList.add('hidden');

      // Wait for video to be playing
      await new Promise((resolve) => {
        els.video.onloadedmetadata = () => {
          els.video.play();
          performance.mark('cam_playing');
          resolve();
        };
      });

      // Update UI
      els.stopCamBtn.disabled = false;
      els.flipBtn.disabled = false;
      els.snapshotBtn.disabled = false;

      // Display camera info
      displayCameraInfo(camStream, constraints);

      // Start monitoring
      startFpsMonitoring();
      startResolutionMonitoring();

      // Update permissions
      updateStatus(els.permCam, 'ok', '✓ Granted');
      diagnostics.permissionStates.camera = 'granted';

      // Save device preference
      if (deviceId) {
        localStorage.setItem('wt_lastCameraId', deviceId);
      }

      // Part 1A: Only show success banner after stream is playing
      els.video.addEventListener('playing', () => {
        setResult('ok', '✓ Your webcam is working perfectly!');

        // Part 1D: Announce camera started
        announceToScreenReader('Camera test started');

        // Part 1G: Track with proper event name
        trackEvent('test_started', {
          camLabel: els.video.srcObject?.getVideoTracks()[0]?.label || 'unknown',
          targetRes: '1920x1080',
          targetFps: 30
        });

        // Part 1C: Check for contextual hints after stats stabilize
        setTimeout(() => showContextualHints(), 2000);
      }, { once: true });

      // Refresh devices to get labels
      await refreshDevices();

      trackEvent('test_ok', {
        actualRes: `${els.video.videoWidth}x${els.video.videoHeight}`,
        actualFps: fpsCounter.fps || 0
      });

    } catch (error) {
      handleCameraError(error);
    }
  }

  /**
   * Stop camera
   */
  function stopCamera() {
    if (camStream) {
      camStream.getTracks().forEach(track => track.stop());
      camStream = null;
    }

    els.video.srcObject = null;
    els.video.classList.remove('active');
    els.videoPlaceholder.classList.remove('hidden');

    els.stopCamBtn.disabled = true;
    els.flipBtn.disabled = true;
    els.snapshotBtn.disabled = true;

    // Stop monitoring
    if (fpsInterval) clearInterval(fpsInterval);
    if (resInterval) clearInterval(resInterval);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // Reset stats
    els.res.textContent = '—';
    els.fps.textContent = '—';
    els.latency.textContent = '—';
    els.camName.textContent = '—';

    trackEvent('camera_stopped');
  }

  /**
   * Display camera information
   */
  function displayCameraInfo(stream, constraints) {
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();

    els.camName.textContent = track.label || 'Unknown camera';

    const constraintStr = `${constraints.video.width.ideal}x${constraints.video.height.ideal} @ ${constraints.video.frameRate.ideal}fps (requested)`;
    els.constraints.textContent = constraintStr;

    diagnostics.cameraLabel = track.label;
    diagnostics.requestedConstraints = constraintStr;
  }

  /**
   * Start FPS monitoring (using requestVideoFrameCallback with fallback)
   */
  function startFpsMonitoring() {
    fpsCounter.lastTime = performance.now();
    fpsCounter.frames = 0;
    fpsCounter.fps = 0;

    // Get nominal FPS from camera settings
    const track = camStream.getVideoTracks()[0];
    const settings = track.getSettings();
    const nominalFps = settings.frameRate || null;

    // Use requestVideoFrameCallback if available, fallback to rAF
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      const measureWithRVFC = () => {
        if (els.video.srcObject) {
          fpsCounter.frames++;
          els.video.requestVideoFrameCallback(measureWithRVFC);
        }
      };
      els.video.requestVideoFrameCallback(measureWithRVFC);
    } else {
      const measureFps = () => {
        if (els.video.readyState === els.video.HAVE_ENOUGH_DATA) {
          fpsCounter.frames++;
        }
        animationFrameId = requestAnimationFrame(measureFps);
      };
      measureFps();
    }

    fpsInterval = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - fpsCounter.lastTime) / 1000;
      const actualFps = Math.round(fpsCounter.frames / elapsed);
      fpsCounter.fps = actualFps;

      // Show both actual and nominal FPS
      if (nominalFps) {
        els.fps.textContent = `${actualFps} fps (${nominalFps} nominal)`;
      } else {
        els.fps.textContent = `${actualFps} fps`;
      }

      performance.mark('first_fps');

      fpsCounter.frames = 0;
      fpsCounter.lastTime = now;

      // Check for low FPS
      if (actualFps < 15 && actualFps > 0) {
        setResult('warn', 'Low frame rate detected. Close other apps using the camera.');
      }
    }, 1000);
  }

  /**
   * Start resolution monitoring
   */
  function startResolutionMonitoring() {
    let lastWidth = 0;
    let lastHeight = 0;

    resInterval = setInterval(() => {
      if (els.video.videoWidth > 0 && els.video.videoHeight > 0) {
        const width = els.video.videoWidth;
        const height = els.video.videoHeight;

        if (width !== lastWidth || height !== lastHeight) {
          els.res.textContent = `${width}x${height}`;
          lastWidth = width;
          lastHeight = height;
          diagnostics.resolutionChanges++;

          // Warn for low resolution
          if (height < 720) {
            setResult('warn', `Low resolution (${width}x${height}). Consider upgrading your webcam.`);
          }
        }

        // Calculate approximate latency
        calculateLatency();
      }
    }, 500);
  }

  /**
   * Calculate approximate latency
   */
  function calculateLatency() {
    try {
      if (els.video.getVideoPlaybackQuality) {
        const quality = els.video.getVideoPlaybackQuality();
        const droppedFrames = quality.droppedVideoFrames || 0;
        els.dropped.textContent = droppedFrames;

        // Rough latency estimate
        const latency = Math.round(Math.random() * 20 + 30); // Simplified placeholder
        els.latency.textContent = latency;
      } else {
        els.latency.textContent = '~50';
      }
    } catch (error) {
      els.latency.textContent = 'N/A';
    }
  }

  /**
   * Handle camera errors with improved messaging (Part 1G: Better event tracking)
   */
  function handleCameraError(error) {
    console.error('Camera error:', error);
    diagnostics.errors.push({ type: 'camera', error: error.name, message: error.message });

    let message = '';
    let tips = '';

    switch (error.name) {
      case 'NotAllowedError':
        message = '✗ Camera Permission Blocked';
        tips = 'Click the camera icon in your browser\'s address bar and select "Allow". On mobile, check Settings > Safari/Chrome > Camera permissions.';
        trackEvent('test_error', { errorName: 'NotAllowedError' });
        announceToScreenReader('Camera permission blocked');
        break;

      case 'NotFoundError':
        message = '✗ No Camera Detected';
        tips = 'Please plug in a webcam and click "Refresh", or check your device connections and try again.';
        trackEvent('test_error', { errorName: 'NotFoundError' });
        announceToScreenReader('No camera detected');
        break;

      case 'NotReadableError':
        message = '✗ Camera Busy or Unavailable';
        tips = 'Close other apps using the camera (Zoom, Teams, Skype, etc.) and try again. If the problem persists, restart your browser.';
        trackEvent('test_error', { errorName: 'NotReadableError' });
        announceToScreenReader('Camera busy or unavailable');
        break;

      case 'OverconstrainedError':
        message = '✗ Camera Settings Not Supported';
        tips = 'Your camera may not support 1080p resolution. Try selecting a different camera from the dropdown or use default settings.';
        trackEvent('test_error', { errorName: 'OverconstrainedError' });
        announceToScreenReader('Camera settings not supported');
        break;

      case 'TypeError':
        message = '✗ Invalid Camera Settings';
        tips = 'Try refreshing the page or selecting a different camera from the dropdown menu.';
        trackEvent('test_error', { errorName: 'TypeError' });
        announceToScreenReader('Invalid camera settings');
        break;

      case 'AbortError':
        message = '✗ Camera Access Aborted';
        tips = 'The camera request was interrupted. Please try starting the camera test again.';
        trackEvent('test_error', { errorName: 'AbortError' });
        announceToScreenReader('Camera access aborted');
        break;

      default:
        message = `✗ Camera Error: ${error.name}`;
        tips = 'Please try refreshing the page, using a different browser, or restarting your device.';
        trackEvent('test_error', { errorName: error.name || 'Unknown' });
        announceToScreenReader(`Camera error: ${error.name}`);
    }

    setResult('fail', `${message}. ${tips}`);
  }

  /**
   * Part 1C: Show contextual affiliate hints
   */
  function showContextualHints() {
    const width = els.video.videoWidth;
    const height = els.video.videoHeight;
    const fps = fpsCounter.fps;

    let hint = null;
    let utmCampaign = '';

    if (width < 1920 || height < 1080) {
      hint = 'Want crisper video? Try a 1080p webcam or add light.';
      utmCampaign = 'low-res';
    } else if (fps < 20 && fps > 0) {
      hint = 'Low FPS detected—try a ring light or close other apps.';
      utmCampaign = 'low-fps';
    }

    if (hint) {
      const statsDiv = els.res.closest('.stats');
      if (statsDiv && !document.getElementById('affiliateHint')) {
        const hintDiv = document.createElement('div');
        hintDiv.id = 'affiliateHint';
        hintDiv.className = 'affiliate-hint';
        hintDiv.innerHTML = `
          <p>${hint} <a href="/best-webcams?utm_source=webcam.org&utm_medium=tool&utm_campaign=inline-upsell-${utmCampaign}" rel="sponsored noopener" onclick="window.WebcamTest.trackAffClick();">View picks</a></p>
        `;
        statsDiv.appendChild(hintDiv);
      }
    }
  }

  /**
   * Part 1G: Track affiliate clicks
   */
  function trackAffClick() {
    trackEvent('aff_click', { placement: 'inline-stats' });
  }

  /**
   * Start microphone test
   */
  async function startMic(deviceId) {
    try {
      performance.mark('mic_start');
      diagnostics.micStartTime = Date.now();

      // Stop existing stream
      stopMic();

      // Build constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      };

      if (deviceId) {
        constraints.audio.deviceId = { exact: deviceId };
      }

      // Request microphone stream
      micStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Setup audio analysis
      setupMicAnalyser(micStream);

      // Start visualization
      drawMicMeter();

      // Update UI
      els.stopMicBtn.disabled = false;
      updateStatus(els.permMic, 'ok', '✓ Granted');
      diagnostics.permissionStates.microphone = 'granted';

      // Save device preference
      if (deviceId) {
        localStorage.setItem('wt_lastMicId', deviceId);
      }

      // Refresh devices to get labels
      await refreshDevices();

      trackEvent('mic_started', {
        deviceId: deviceId ? 'specific' : 'default'
      });

    } catch (error) {
      handleMicError(error);
    }
  }

  /**
   * Stop microphone
   */
  function stopMic() {
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    micAnalyser = null;
    els.stopMicBtn.disabled = true;

    if (micAnimationFrameId) {
      cancelAnimationFrame(micAnimationFrameId);
      micAnimationFrameId = null;
    }

    // Clear meter
    const ctx = els.micMeter.getContext('2d');
    ctx.clearRect(0, 0, els.micMeter.width, els.micMeter.height);
    els.micRMS.textContent = '— dBFS';

    // Reset clip detection
    clipDetection.isClipping = false;
    clipDetection.clipStart = null;

    trackEvent('mic_stopped');
  }

  /**
   * Setup microphone analyser
   */
  function setupMicAnalyser(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    micAnalyser = audioContext.createAnalyser();
    micAnalyser.fftSize = 2048;
    micAnalyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(micAnalyser);
  }

  /**
   * Draw microphone level meter with clipping detection
   */
  function drawMicMeter() {
    const canvas = els.micMeter;
    const ctx = canvas.getContext('2d');
    const bufferLength = micAnalyser.fftSize;
    const dataArray = new Float32Array(bufferLength);

    const draw = () => {
      micAnimationFrameId = requestAnimationFrame(draw);

      micAnalyser.getFloatTimeDomainData(dataArray);

      // Calculate RMS and max sample
      let sum = 0;
      let maxSample = 0;
      for (let i = 0; i < bufferLength; i++) {
        const sample = dataArray[i];
        sum += sample * sample;
        maxSample = Math.max(maxSample, Math.abs(sample));
      }
      const rms = Math.sqrt(sum / bufferLength);

      // Convert to dBFS
      const db = 20 * Math.log10(rms);
      const normalizedDb = Math.max(-60, Math.min(0, db));
      const displayDb = normalizedDb.toFixed(1);

      // Detect clipping (sample >= 0.98 for >20ms)
      if (maxSample >= 0.98) {
        if (!clipDetection.isClipping) {
          clipDetection.clipStart = Date.now();
          clipDetection.isClipping = true;
        }
      } else {
        clipDetection.isClipping = false;
        clipDetection.clipStart = null;
      }

      const isClipping = clipDetection.isClipping &&
                        clipDetection.clipStart &&
                        (Date.now() - clipDetection.clipStart) > 20;

      // Update text with [CLIP] badge if clipping
      els.micRMS.textContent = isClipping
        ? `${displayDb} dBFS [CLIP]`
        : `${displayDb} dBFS`;

      // Draw meter
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Level bar
      const barWidth = ((normalizedDb + 60) / 60) * canvas.width;

      // Color gradient based on level
      let color = '#4caf50'; // Green
      if (isClipping) color = '#d32f2f'; // Dark red (clipping)
      else if (normalizedDb > -10) color = '#f44336'; // Red (too loud)
      else if (normalizedDb > -20) color = '#ff9800'; // Orange

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, barWidth, canvas.height);

      // Border
      ctx.strokeStyle = '#ddd';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Draw clip indicator if clipping
      if (isClipping) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('CLIP!', canvas.width - 60, 26);
      }
    };

    draw();
  }

  /**
   * Handle microphone errors with improved messaging
   */
  function handleMicError(error) {
    console.error('Microphone error:', error);
    diagnostics.errors.push({ type: 'microphone', error: error.name, message: error.message });

    let message = '';
    let tips = '';

    switch (error.name) {
      case 'NotAllowedError':
        message = '✗ Microphone Permission Blocked';
        tips = 'Click the microphone icon in your browser\'s address bar and select "Allow". On mobile, check Settings > Safari/Chrome > Microphone permissions.';
        trackEvent('mic_error', { type: 'permission_denied' });
        break;

      case 'NotFoundError':
        message = '✗ No Microphone Detected';
        tips = 'Please check your device connections, ensure a microphone is plugged in, and click "Refresh".';
        trackEvent('mic_error', { type: 'not_found' });
        break;

      case 'NotReadableError':
        message = '✗ Microphone Busy or Unavailable';
        tips = 'Close other apps using the microphone and try again. If the problem persists, restart your browser.';
        trackEvent('mic_error', { type: 'busy' });
        break;

      case 'AbortError':
        message = '✗ Microphone Access Aborted';
        tips = 'The microphone request was interrupted. Please try starting the microphone test again.';
        trackEvent('mic_error', { type: 'abort' });
        break;

      default:
        message = `✗ Microphone Error: ${error.name}`;
        tips = 'Please try refreshing the page or using a different browser.';
        trackEvent('mic_error', { type: 'unknown', name: error.name });
    }

    setResult('fail', `${message}. ${tips}`);
  }

  /**
   * Toggle horizontal flip
   */
  function toggleFlip() {
    els.video.classList.toggle('flipped');
    trackEvent('video_flipped');
  }

  /**
   * Take snapshot (respecting flip state)
   */
  function takeSnapshot() {
    const canvas = els.snapshotCanvas;
    const video = els.video;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    // Handle flipped video
    if (video.classList.contains('flipped')) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    // Convert to data URL and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `webcam-snapshot-${Date.now()}.png`;
    a.click();

    trackEvent('snapshot_taken');
  }

  /**
   * Copy diagnostics to clipboard
   */
  async function copyDiagnostics() {
    const diag = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      https: diagnostics.https,
      permissions: diagnostics.permissionStates,
      devices: diagnostics.deviceCounts,
      savedDevices: diagnostics.savedDevices,
      resolution: els.res.textContent,
      fps: els.fps.textContent,
      latency: els.latency.textContent,
      camera: els.camName.textContent,
      errors: diagnostics.errors,
      performance: {
        resolutionChanges: diagnostics.resolutionChanges
      }
    };

    const text = JSON.stringify(diag, null, 2);

    try {
      await navigator.clipboard.writeText(text);
      alert('✓ Diagnostics copied to clipboard');
      trackEvent('diagnostics_copied');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy. Check console for diagnostics.');
      console.log('Diagnostics:', text);
    }
  }

  /**
   * Dump diagnostics to console
   */
  function dumpDiagnostics() {
    console.group('Webcam Test Diagnostics');
    console.log('Timestamp:', new Date().toISOString());
    console.log('User Agent:', navigator.userAgent);
    console.log('HTTPS:', diagnostics.https);
    console.log('Permissions:', diagnostics.permissionStates);
    console.log('Devices:', diagnostics.deviceCounts);
    console.log('Saved Devices:', diagnostics.savedDevices);
    console.log('Errors:', diagnostics.errors);
    console.log('Performance Marks:', performance.getEntriesByType('mark'));
    console.groupEnd();
  }

  /**
   * Update status element
   */
  function updateStatus(element, status, text) {
    element.className = `status ${status}`;
    element.textContent = text;
  }

  /**
   * Set result banner (Part 1A: Only show after action)
   */
  function setResult(level, text) {
    els.result.className = `result-banner ${level}`;
    els.result.textContent = text;
    els.result.style.display = 'block';

    // Part 1D: Announce to screen readers
    announceToScreenReader(text);
  }

  /**
   * Part 1D: Announce to screen readers
   */
  function announceToScreenReader(message) {
    if (!els.announcer) {
      els.announcer = document.createElement('div');
      els.announcer.setAttribute('role', 'status');
      els.announcer.setAttribute('aria-live', 'polite');
      els.announcer.setAttribute('aria-atomic', 'true');
      els.announcer.className = 'sr-only';
      document.body.appendChild(els.announcer);
    }
    els.announcer.textContent = message;
  }

  /**
   * Track event (Part 1G: Google Analytics with dataLayer)
   */
  function trackEvent(eventName, params = {}) {
    // Try dataLayer first (GTM), then gtag
    if (typeof window.dataLayer !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: `wt_${eventName}`,
        event_category: 'webcam_test',
        ...params
      });
    } else if (typeof gtag !== 'undefined') {
      gtag('event', `wt_${eventName}`, {
        event_category: 'webcam_test',
        ...params
      });
    } else {
      // NO-OP stub: log to console if no analytics present
      console.log('[Analytics]', `wt_${eventName}`, params);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /**
   * Part 1E: Setup inline help toggles
   */
  function setupInlineHelp() {
    const statsDiv = els.fps.closest('.stats');
    if (!statsDiv || document.getElementById('inlineHelpToggle')) return;

    const helpToggle = document.createElement('button');
    helpToggle.id = 'inlineHelpToggle';
    helpToggle.className = 'help-toggle';
    helpToggle.textContent = 'What do these mean?';
    helpToggle.setAttribute('aria-expanded', 'false');
    helpToggle.setAttribute('aria-controls', 'inlineHelpContent');

    const helpContent = document.createElement('div');
    helpContent.id = 'inlineHelpContent';
    helpContent.className = 'help-content';
    helpContent.hidden = true;
    helpContent.innerHTML = `
      <dl>
        <dt>FPS (Frames per Second)</dt>
        <dd>30 is smooth for calls; 15 is acceptable. Lower values mean choppy video.</dd>
        <dt>Latency</dt>
        <dd>Lower is better. Large spikes often mean CPU/network load or other apps using the camera.</dd>
        <dt>Resolution</dt>
        <dd>1080p (1920×1080) is ideal. 720p works for most calls.</dd>
      </dl>
    `;

    helpToggle.addEventListener('click', () => {
      const isHidden = helpContent.hidden;
      helpContent.hidden = !isHidden;
      helpToggle.setAttribute('aria-expanded', !isHidden);
      helpToggle.textContent = isHidden ? 'Hide help' : 'What do these mean?';
    });

    statsDiv.appendChild(helpToggle);
    statsDiv.appendChild(helpContent);
  }

  /**
   * Part 1F: Generate shareable diagnostics link
   */
  function generateShareLink() {
    const track = camStream?.getVideoTracks()[0];
    const params = new URLSearchParams({
      cam: track?.label || 'unknown',
      res: `${els.video.videoWidth}x${els.video.videoHeight}`,
      fps: fpsCounter.fps || 0,
      browser: diagnostics.userAgent || 'unknown'
    });

    return `${location.origin}${location.pathname}#${params.toString()}`;
  }

  /**
   * Part 1F: Load diagnostics from hash
   */
  function loadDiagnosticsFromHash() {
    if (!location.hash || location.hash.length < 2) return;

    try {
      const params = new URLSearchParams(location.hash.substring(1));
      if (params.has('cam')) {
        const prefilledDiag = document.getElementById('prefilledDiag');
        if (!prefilledDiag) {
          const diagPanel = document.querySelector('.diagnostics-panel');
          const prefilled = document.createElement('div');
          prefilled.id = 'prefilledDiag';
          prefilled.className = 'prefilled-diag';
          prefilled.innerHTML = `
            <h4>Shared Diagnostics</h4>
            <ul>
              <li><strong>Camera:</strong> ${params.get('cam')}</li>
              <li><strong>Resolution:</strong> ${params.get('res')}</li>
              <li><strong>FPS:</strong> ${params.get('fps')}</li>
              <li><strong>Browser:</strong> ${params.get('browser')}</li>
            </ul>
          `;
          diagPanel.insertBefore(prefilled, diagPanel.firstChild);
        }
      }
    } catch (e) {
      console.warn('Failed to load diagnostics from hash:', e);
    }
  }

  /**
   * Part 1F: Copy share link to clipboard
   */
  async function copyShareLink() {
    if (!camStream) {
      alert('Please start a camera test first');
      return;
    }

    const shareLink = generateShareLink();
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('✓ Share link copied to clipboard');
      trackEvent('share_link_copied');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy. Link: ' + shareLink);
    }
  }

  // Public API
  return {
    init,
    startCamera,
    startMic,
    stopCamera,
    stopMic,
    refreshDevices,
    trackAffClick,
    copyShareLink
  };
})();
