/**
 * Simple motion detection using pixel difference algorithm
 * Works with HTML5 video element
 */

class MotionDetector {
  constructor(videoElement, options = {}) {
    this.video = videoElement;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.previousFrame = null;

    // Configurable options
    this.threshold = options.threshold || 30;  // Pixel difference threshold (0-255)
    this.motionThreshold = options.motionThreshold || 0.02;  // % of pixels that must change (0.02 = 2%)
    this.checkInterval = options.checkInterval || 1000;  // Check every N milliseconds

    this.isRunning = false;
    this.interval = null;
    this.onMotionCallback = null;
  }

  /**
   * Check for motion between current frame and previous frame
   * Returns true if motion detected
   */
  checkMotion() {
    if (!this.video || !this.video.videoWidth) {
      return false;
    }

    const width = this.video.videoWidth;
    const height = this.video.videoHeight;

    this.canvas.width = width;
    this.canvas.height = height;

    // Draw current frame to canvas
    this.ctx.drawImage(this.video, 0, 0, width, height);
    const currentFrame = this.ctx.getImageData(0, 0, width, height);

    // Need previous frame to compare
    if (!this.previousFrame) {
      this.previousFrame = currentFrame;
      return false;
    }

    // Count changed pixels
    let changedPixels = 0;
    const totalPixels = width * height;

    for (let i = 0; i < currentFrame.data.length; i += 4) {
      const rDiff = Math.abs(currentFrame.data[i] - this.previousFrame.data[i]);
      const gDiff = Math.abs(currentFrame.data[i+1] - this.previousFrame.data[i+1]);
      const bDiff = Math.abs(currentFrame.data[i+2] - this.previousFrame.data[i+2]);

      const totalDiff = rDiff + gDiff + bDiff;

      if (totalDiff > this.threshold) {
        changedPixels++;
      }
    }

    this.previousFrame = currentFrame;

    const motionPercent = changedPixels / totalPixels;
    const hasMotion = motionPercent > this.motionThreshold;

    if (hasMotion) {
      console.log(`Motion detected: ${(motionPercent * 100).toFixed(2)}% pixels changed`);
    }

    return hasMotion;
  }

  /**
   * Start monitoring for motion
   */
  start(callback) {
    if (this.isRunning) {
      console.warn('Motion detector already running');
      return;
    }

    this.onMotionCallback = callback;
    this.isRunning = true;

    console.log('Motion detector started');
    console.log(`  Threshold: ${this.threshold}, Motion: ${this.motionThreshold * 100}%, Interval: ${this.checkInterval}ms`);

    this.interval = setInterval(() => {
      if (this.checkMotion() && this.onMotionCallback) {
        this.onMotionCallback();
      }
    }, this.checkInterval);
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isRunning = false;
    this.previousFrame = null;

    console.log('Motion detector stopped');
  }

  /**
   * Update sensitivity settings
   */
  setThreshold(threshold) {
    this.threshold = threshold;
  }

  setMotionThreshold(motionThreshold) {
    this.motionThreshold = motionThreshold;
  }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MotionDetector;
}
