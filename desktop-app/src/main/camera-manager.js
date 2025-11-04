const os = require('node:os');

/**
 * Temporary camera registry that returns placeholder devices.
 * Replace with Media Foundation / DirectShow enumeration when ready.
 */
function listCameras() {
  return [
    {
      id: 'camera-1',
      label: 'USB HD Webcam',
      vendorId: '0x046d',
      productId: '0x0825',
      transport: 'usb',
      status: 'connected'
    },
    {
      id: 'camera-2',
      label: 'Virtual Camera (Dev)',
      vendorId: null,
      productId: null,
      transport: 'virtual',
      status: 'disconnected'
    }
  ].map(device => ({
    ...device,
    host: os.hostname()
  }));
}

module.exports = {
  listCameras
};
